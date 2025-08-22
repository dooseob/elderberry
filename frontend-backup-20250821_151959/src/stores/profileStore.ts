/**
 * 프로필 관리 Zustand 스토어
 * 프로필 CRUD, 검색, 통계, 완성도 추적 등 모든 프로필 관련 상태 관리
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Profile,
  ProfileResponse,
  DomesticProfile,
  DomesticProfileResponse,
  OverseasProfile,
  OverseasProfileResponse,
  ProfileSearchParams,
  ProfileListResponse,
  ProfileStatistics,
  ProfileCompletionStatus,
  DocumentValidityStatus,
  ProfileImprovementSuggestion,
  DocumentExpiryAlert,
  ProfileActivityLog,
  ProfileType,
  ValidationResult
} from '../types/profile';
import profileApiService, {
  domesticProfileService,
  overseasProfileService,
  profileService,
  getProfileByMemberId,
  createProfile,
  handleProfileApiError,
  ProfileApiError
} from '../services/profileApi';

// ===== 스토어 상태 인터페이스 =====

interface ProfileState {
  // 현재 프로필 상태
  currentProfile: ProfileResponse | null;
  currentProfileType: ProfileType | null;
  
  // 프로필 목록
  profiles: ProfileResponse[];
  searchResults: ProfileResponse[];
  
  // 완성도 및 문서 상태
  completionStatus: ProfileCompletionStatus | null;
  documentValidity: DocumentValidityStatus | null;
  improvementSuggestions: ProfileImprovementSuggestion[];
  
  // 통계 및 분석
  statistics: ProfileStatistics | null;
  documentExpiryAlerts: DocumentExpiryAlert[];
  activityLog: ProfileActivityLog[];
  
  // UI 상태
  loading: {
    profile: boolean;
    list: boolean;
    search: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    statistics: boolean;
    completion: boolean;
    validation: boolean;
  };
  
  error: ProfileApiError | null;
  
  // 검색 및 필터 상태
  searchParams: ProfileSearchParams;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  
  // 폼 상태
  formData: any;
  validationResult: ValidationResult | null;
  isFormDirty: boolean;
  
  // 캐시 관리
  cache: Map<string, { data: any; timestamp: number; ttl: number }>;
}

interface ProfileActions {
  // 프로필 CRUD
  createProfile: (memberId: number, profileType: ProfileType, data: any) => Promise<void>;
  getProfile: (memberId: number) => Promise<void>;
  getProfileById: (profileId: number, profileType: ProfileType) => Promise<void>;
  updateProfile: (profileId: number, data: any) => Promise<void>;
  deleteProfile: (profileId: number) => Promise<void>;
  
  // 프로필 목록 및 검색
  searchProfiles: (params: ProfileSearchParams) => Promise<void>;
  getProfilesByCompletion: (minCompletion: number) => Promise<void>;
  getOverseasProfilesByCountry: (country?: string) => Promise<void>;
  getProfilesRequiringCoordinator: () => Promise<void>;
  
  // 완성도 및 분석
  getProfileCompletion: (profileId: number, profileType: ProfileType) => Promise<void>;
  getDocumentValidity: (profileId: number) => Promise<void>;
  getImprovementSuggestions: (memberId: number) => Promise<void>;
  getStatistics: () => Promise<void>;
  
  // 알림 및 로그
  getDocumentExpiryAlerts: () => Promise<void>;
  getActivityLog: (profileId: number) => Promise<void>;
  
  // 유효성 검증
  validateProfile: (profileType: ProfileType, data: any) => Promise<void>;
  
  // 폼 관리
  setFormData: (data: any) => void;
  updateFormField: (field: string, value: any) => void;
  resetForm: () => void;
  setFormDirty: (dirty: boolean) => void;
  
  // 검색 및 필터
  setSearchParams: (params: Partial<ProfileSearchParams>) => void;
  resetSearchParams: () => void;
  setPagination: (page: number, size?: number) => void;
  
  // 상태 관리
  setCurrentProfile: (profile: ProfileResponse | null) => void;
  setError: (error: ProfileApiError | null) => void;
  clearError: () => void;
  reset: () => void;
  
  // 캐시 관리
  getFromCache: (key: string) => any;
  setCache: (key: string, data: any, ttl?: number) => void;
  clearCache: () => void;
}

// ===== 초기 상태 =====

const initialState: ProfileState = {
  currentProfile: null,
  currentProfileType: null,
  profiles: [],
  searchResults: [],
  completionStatus: null,
  documentValidity: null,
  improvementSuggestions: [],
  statistics: null,
  documentExpiryAlerts: [],
  activityLog: [],
  
  loading: {
    profile: false,
    list: false,
    search: false,
    create: false,
    update: false,
    delete: false,
    statistics: false,
    completion: false,
    validation: false,
  },
  
  error: null,
  
  searchParams: {
    page: 0,
    size: 20,
    sortBy: 'updatedAt',
    sortDirection: 'desc'
  },
  
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  },
  
  formData: {},
  validationResult: null,
  isFormDirty: false,
  
  cache: new Map(),
};

// ===== Zustand 스토어 생성 =====

export const useProfileStore = create<ProfileState & ProfileActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // ===== 프로필 CRUD =====

        createProfile: async (memberId: number, profileType: ProfileType, data: any) => {
          set((state) => {
            state.loading.create = true;
            state.error = null;
          });

          try {
            const profile = await createProfile(memberId, profileType, data);
            
            set((state) => {
              state.currentProfile = profile;
              state.currentProfileType = profileType;
              state.loading.create = false;
              state.isFormDirty = false;
            });

            // 캐시 업데이트
            get().setCache(`profile_member_${memberId}`, profile);
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.create = false;
            });
            throw apiError;
          }
        },

        getProfile: async (memberId: number) => {
          // 캐시 확인
          const cachedProfile = get().getFromCache(`profile_member_${memberId}`);
          if (cachedProfile) {
            set((state) => {
              state.currentProfile = cachedProfile;
              state.currentProfileType = cachedProfile.profileType;
            });
            return;
          }

          set((state) => {
            state.loading.profile = true;
            state.error = null;
          });

          try {
            const profile = await getProfileByMemberId(memberId);
            
            set((state) => {
              state.currentProfile = profile;
              state.currentProfileType = profile?.profileType || null;
              state.loading.profile = false;
            });

            // 캐시 저장
            if (profile) {
              get().setCache(`profile_member_${memberId}`, profile);
            }
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.profile = false;
            });
          }
        },

        getProfileById: async (profileId: number, profileType: ProfileType) => {
          set((state) => {
            state.loading.profile = true;
            state.error = null;
          });

          try {
            let profile: ProfileResponse;
            
            if (profileType === ProfileType.DOMESTIC) {
              profile = await domesticProfileService.getById(profileId);
            } else {
              profile = await overseasProfileService.getById(profileId);
            }
            
            set((state) => {
              state.currentProfile = profile;
              state.currentProfileType = profileType;
              state.loading.profile = false;
            });

            // 캐시 저장
            get().setCache(`profile_${profileType}_${profileId}`, profile);
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.profile = false;
            });
          }
        },

        updateProfile: async (profileId: number, data: any) => {
          set((state) => {
            state.loading.update = true;
            state.error = null;
          });

          try {
            const profileType = get().currentProfileType;
            if (!profileType) {
              throw new Error('프로필 타입을 확인할 수 없습니다.');
            }

            let updatedProfile: ProfileResponse;
            
            if (profileType === ProfileType.DOMESTIC) {
              updatedProfile = await domesticProfileService.update(profileId, data);
            } else {
              updatedProfile = await overseasProfileService.update(profileId, data);
            }
            
            set((state) => {
              state.currentProfile = updatedProfile;
              state.loading.update = false;
              state.isFormDirty = false;
            });

            // 캐시 업데이트
            get().setCache(`profile_${profileType}_${profileId}`, updatedProfile);
            if (updatedProfile.memberId) {
              get().setCache(`profile_member_${updatedProfile.memberId}`, updatedProfile);
            }
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.update = false;
            });
            throw apiError;
          }
        },

        deleteProfile: async (profileId: number) => {
          set((state) => {
            state.loading.delete = true;
            state.error = null;
          });

          try {
            const profileType = get().currentProfileType;
            if (!profileType) {
              throw new Error('프로필 타입을 확인할 수 없습니다.');
            }

            if (profileType === ProfileType.DOMESTIC) {
              await domesticProfileService.delete(profileId);
            } else {
              await overseasProfileService.delete(profileId);
            }
            
            set((state) => {
              state.currentProfile = null;
              state.currentProfileType = null;
              state.loading.delete = false;
            });

            // 캐시에서 제거
            get().clearCache();
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.delete = false;
            });
            throw apiError;
          }
        },

        // ===== 프로필 검색 및 목록 =====

        searchProfiles: async (params: ProfileSearchParams) => {
          set((state) => {
            state.loading.search = true;
            state.error = null;
            state.searchParams = { ...state.searchParams, ...params };
          });

          try {
            const result = await profileService.search(get().searchParams);
            
            set((state) => {
              state.searchResults = result.content;
              state.pagination = {
                page: result.page,
                size: result.size,
                totalElements: result.totalElements,
                totalPages: result.totalPages,
                first: result.first,
                last: result.last,
              };
              state.loading.search = false;
            });
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.search = false;
            });
          }
        },

        getProfilesByCompletion: async (minCompletion: number) => {
          set((state) => {
            state.loading.list = true;
            state.error = null;
          });

          try {
            const profiles = await domesticProfileService.getByCompletion(minCompletion);
            
            set((state) => {
              state.profiles = profiles;
              state.loading.list = false;
            });
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.list = false;
            });
          }
        },

        getOverseasProfilesByCountry: async (country?: string) => {
          set((state) => {
            state.loading.list = true;
            state.error = null;
          });

          try {
            const profiles = await overseasProfileService.getByCountry(country);
            
            set((state) => {
              state.profiles = profiles;
              state.loading.list = false;
            });
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.list = false;
            });
          }
        },

        getProfilesRequiringCoordinator: async () => {
          set((state) => {
            state.loading.list = true;
            state.error = null;
          });

          try {
            const profiles = await overseasProfileService.getRequiringCoordinator();
            
            set((state) => {
              state.profiles = profiles;
              state.loading.list = false;
            });
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.list = false;
            });
          }
        },

        // ===== 완성도 및 분석 =====

        getProfileCompletion: async (profileId: number, profileType: ProfileType) => {
          set((state) => {
            state.loading.completion = true;
            state.error = null;
          });

          try {
            let completion: ProfileCompletionStatus;
            
            if (profileType === ProfileType.DOMESTIC) {
              completion = await domesticProfileService.getCompletion(profileId);
            } else {
              completion = await overseasProfileService.getCompletion(profileId);
            }
            
            set((state) => {
              state.completionStatus = completion;
              state.loading.completion = false;
            });
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.completion = false;
            });
          }
        },

        getDocumentValidity: async (profileId: number) => {
          try {
            const validity = await overseasProfileService.getDocumentValidity(profileId);
            
            set((state) => {
              state.documentValidity = validity;
            });
          } catch (error: any) {
            console.error('문서 유효성 조회 실패:', error);
          }
        },

        getImprovementSuggestions: async (memberId: number) => {
          try {
            const suggestions = await overseasProfileService.getImprovementSuggestions(memberId);
            
            set((state) => {
              state.improvementSuggestions = suggestions;
            });
          } catch (error: any) {
            console.error('개선 제안 조회 실패:', error);
          }
        },

        getStatistics: async () => {
          set((state) => {
            state.loading.statistics = true;
            state.error = null;
          });

          try {
            const statistics = await profileService.getStatistics();
            
            set((state) => {
              state.statistics = statistics;
              state.loading.statistics = false;
            });
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.statistics = false;
            });
          }
        },

        // ===== 알림 및 로그 =====

        getDocumentExpiryAlerts: async () => {
          try {
            const alerts = await profileService.getDocumentExpiryAlerts();
            
            set((state) => {
              state.documentExpiryAlerts = alerts;
            });
          } catch (error: any) {
            console.error('문서 만료 알림 조회 실패:', error);
          }
        },

        getActivityLog: async (profileId: number) => {
          try {
            const log = await profileService.getActivityLog(profileId);
            
            set((state) => {
              state.activityLog = log;
            });
          } catch (error: any) {
            console.error('활동 로그 조회 실패:', error);
          }
        },

        // ===== 유효성 검증 =====

        validateProfile: async (profileType: ProfileType, data: any) => {
          set((state) => {
            state.loading.validation = true;
            state.error = null;
          });

          try {
            const result = await profileService.validate(profileType, data);
            
            set((state) => {
              state.validationResult = result;
              state.loading.validation = false;
            });
          } catch (error: any) {
            const apiError = handleProfileApiError(error);
            set((state) => {
              state.error = apiError;
              state.loading.validation = false;
            });
          }
        },

        // ===== 폼 관리 =====

        setFormData: (data: any) => {
          set((state) => {
            state.formData = data;
            state.isFormDirty = true;
          });
        },

        updateFormField: (field: string, value: any) => {
          set((state) => {
            state.formData[field] = value;
            state.isFormDirty = true;
          });
        },

        resetForm: () => {
          set((state) => {
            state.formData = {};
            state.validationResult = null;
            state.isFormDirty = false;
          });
        },

        setFormDirty: (dirty: boolean) => {
          set((state) => {
            state.isFormDirty = dirty;
          });
        },

        // ===== 검색 및 필터 =====

        setSearchParams: (params: Partial<ProfileSearchParams>) => {
          set((state) => {
            state.searchParams = { ...state.searchParams, ...params };
          });
        },

        resetSearchParams: () => {
          set((state) => {
            state.searchParams = {
              page: 0,
              size: 20,
              sortBy: 'updatedAt',
              sortDirection: 'desc'
            };
          });
        },

        setPagination: (page: number, size?: number) => {
          set((state) => {
            state.searchParams.page = page;
            if (size) {
              state.searchParams.size = size;
            }
          });
        },

        // ===== 상태 관리 =====

        setCurrentProfile: (profile: ProfileResponse | null) => {
          set((state) => {
            state.currentProfile = profile;
            state.currentProfileType = profile?.profileType || null;
          });
        },

        setError: (error: ProfileApiError | null) => {
          set((state) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        reset: () => {
          set((state) => {
            Object.assign(state, initialState);
            state.cache = new Map();
          });
        },

        // ===== 캐시 관리 =====

        getFromCache: (key: string) => {
          const cached = get().cache.get(key);
          if (!cached) return null;
          
          const now = Date.now();
          if (now > cached.timestamp + cached.ttl) {
            get().cache.delete(key);
            return null;
          }
          
          return cached.data;
        },

        setCache: (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
          set((state) => {
            state.cache.set(key, {
              data,
              timestamp: Date.now(),
              ttl
            });
          });
        },

        clearCache: () => {
          set((state) => {
            state.cache.clear();
          });
        },
      })),
      {
        name: 'profile-store',
        version: 1,
      }
    )
  )
);

// ===== 선택자 (Selectors) =====

export const useCurrentProfile = () => useProfileStore((state) => state.currentProfile);
export const useProfileLoading = () => useProfileStore((state) => state.loading);
export const useProfileError = () => useProfileStore((state) => state.error);
export const useSearchResults = () => useProfileStore((state) => state.searchResults);
export const useProfileStatistics = () => useProfileStore((state) => state.statistics);
export const useFormData = () => useProfileStore((state) => state.formData);
export const useIsFormDirty = () => useProfileStore((state) => state.isFormDirty);
export const useCompletionStatus = () => useProfileStore((state) => state.completionStatus);
export const useDocumentValidity = () => useProfileStore((state) => state.documentValidity);
export const useImprovementSuggestions = () => useProfileStore((state) => state.improvementSuggestions);

// ===== 커스텀 훅들 =====

/**
 * 프로필 완성도 백분율 계산
 */
export const useProfileCompletionPercentage = () => {
  return useProfileStore((state) => {
    if (!state.currentProfile) return 0;
    return state.currentProfile.profileCompletionPercentage || 0;
  });
};

/**
 * 프로필 타입별 필수 필드 완성 여부
 */
export const useRequiredFieldsCompletion = () => {
  return useProfileStore((state) => {
    if (!state.completionStatus) return null;
    
    const { basicInfo, emergencyContact, specificInfo } = state.completionStatus;
    return {
      basicInfo: basicInfo.completed,
      emergencyContact: emergencyContact.completed,
      specificInfo: specificInfo.completed,
      overall: state.completionStatus.overall.isComplete
    };
  });
};

/**
 * 문서 만료 경고 상태
 */
export const useDocumentExpiryWarnings = () => {
  return useProfileStore((state) => {
    if (!state.documentValidity) return null;
    
    const { passport, visa, overall } = state.documentValidity;
    return {
      hasExpiringDocuments: overall.hasExpiringDocuments,
      passportExpiring: passport.isExpiringSoon,
      visaExpiring: visa.isExpiringSoon,
      warnings: overall.warnings
    };
  });
};

export default useProfileStore;