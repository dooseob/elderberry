/**
 * User Entity Store - 회원 프로필 관리 전용 스토어
 * FSD 아키텍처에 따른 User 엔티티 상태 관리
 */
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  MemberResponse,
  UpdateUserRequest,
  ProfileEditFormData,
  ProfileEditErrors,
} from './types';
import {
  memberApiService,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  toggleCurrentUserJobSeeker,
  type MemberApiError,
  isMemberApiError,
} from '../../../shared/api';

// ===== 스토어 상태 인터페이스 =====

interface UserState {
  // 현재 사용자 정보
  currentUser: MemberResponse | null;
  
  // 프로필 수정 폼 상태
  formData: ProfileEditFormData;
  formErrors: ProfileEditErrors;
  isFormDirty: boolean;
  isFormValid: boolean;
  
  // UI 로딩 상태
  loading: {
    profile: boolean;
    update: boolean;
    jobSeekerToggle: boolean;
    deactivate: boolean;
  };
  
  // 에러 상태
  error: MemberApiError | null;
  
  // 성공 메시지
  successMessage: string | null;
  
  // 캐시 관리
  lastFetchTime: number | null;
  cacheValid: boolean;
}

interface UserActions {
  // 프로필 조회
  fetchCurrentUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // 프로필 수정
  updateProfile: (data: UpdateUserRequest) => Promise<void>;
  
  // 구직자 상태 토글
  toggleJobSeeker: () => Promise<void>;
  
  // 계정 비활성화
  deactivateAccount: () => Promise<void>;
  
  // 폼 관리
  setFormData: (data: Partial<ProfileEditFormData>) => void;
  updateFormField: (field: keyof ProfileEditFormData, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  loadFormFromUser: () => void;
  setFormErrors: (errors: Partial<ProfileEditErrors>) => void;
  clearFormErrors: () => void;
  
  // 상태 관리
  setError: (error: MemberApiError | null) => void;
  clearError: () => void;
  setSuccessMessage: (message: string | null) => void;
  clearMessages: () => void;
  
  // 캐시 관리
  invalidateCache: () => void;
  isCacheExpired: () => boolean;
  
  // 전체 초기화
  reset: () => void;
}

type UserStore = UserState & UserActions;

// ===== 초기 상태 =====

const initialFormData: ProfileEditFormData = {
  name: '',
  phoneNumber: '',
  language: '',
  region: '',
};

const initialState: UserState = {
  currentUser: null,
  formData: { ...initialFormData },
  formErrors: {},
  isFormDirty: false,
  isFormValid: false,
  
  loading: {
    profile: false,
    update: false,
    jobSeekerToggle: false,
    deactivate: false,
  },
  
  error: null,
  successMessage: null,
  lastFetchTime: null,
  cacheValid: false,
};

// ===== 캐시 설정 =====
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// ===== 폼 검증 함수 =====
const validateFormData = (data: ProfileEditFormData): ProfileEditErrors => {
  const errors: ProfileEditErrors = {};
  
  // 이름 검증 (필수)
  if (!data.name?.trim()) {
    errors.name = '이름을 입력해주세요';
  } else if (data.name.length > 50) {
    errors.name = '이름은 50자 이하여야 합니다';
  } else if (!/^[가-힣a-zA-Z\s]+$/.test(data.name)) {
    errors.name = '이름에는 한글, 영문, 공백만 사용할 수 있습니다';
  }
  
  // 전화번호 검증 (선택사항)
  if (data.phoneNumber?.trim()) {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(data.phoneNumber)) {
      errors.phoneNumber = '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)';
    } else if (data.phoneNumber.length > 20) {
      errors.phoneNumber = '전화번호는 20자 이하여야 합니다';
    }
  }
  
  // 언어 검증 (선택사항)
  if (data.language?.trim()) {
    const languageRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!languageRegex.test(data.language)) {
      errors.language = '올바른 언어 코드를 입력해주세요 (예: ko, en, ko-KR)';
    } else if (data.language.length > 10) {
      errors.language = '언어 코드는 10자 이하여야 합니다';
    }
  }
  
  // 지역 검증 (선택사항)
  if (data.region?.trim()) {
    if (data.region.length > 100) {
      errors.region = '지역은 100자 이하여야 합니다';
    }
  }
  
  return errors;
};

// ===== Zustand 스토어 생성 =====

export const useUserStore = create<UserStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // ===== 프로필 조회 =====

        fetchCurrentUser: async () => {
          // 캐시가 유효하면 스킵
          if (get().cacheValid && !get().isCacheExpired()) {
            return;
          }

          set((state) => {
            state.loading.profile = true;
            state.error = null;
          });

          try {
            const user = await getCurrentUserProfile();
            
            set((state) => {
              state.currentUser = user;
              state.lastFetchTime = Date.now();
              state.cacheValid = true;
              state.loading.profile = false;
            });

            // 폼 데이터를 사용자 정보로 초기화
            get().loadFormFromUser();

          } catch (error: any) {
            const apiError = isMemberApiError(error) ? error : {
              message: '사용자 정보를 불러올 수 없습니다',
              status: 0
            };

            set((state) => {
              state.error = apiError;
              state.loading.profile = false;
            });
          }
        },

        refreshUser: async () => {
          set((state) => {
            state.cacheValid = false;
          });
          await get().fetchCurrentUser();
        },

        // ===== 프로필 수정 =====

        updateProfile: async (data: UpdateUserRequest) => {
          set((state) => {
            state.loading.update = true;
            state.error = null;
            state.successMessage = null;
          });

          try {
            const updatedUser = await updateCurrentUserProfile(data);
            
            set((state) => {
              state.currentUser = updatedUser;
              state.loading.update = false;
              state.isFormDirty = false;
              state.successMessage = '프로필이 성공적으로 수정되었습니다';
              state.lastFetchTime = Date.now();
              state.cacheValid = true;
            });

            // 폼 데이터 다시 로드
            get().loadFormFromUser();

          } catch (error: any) {
            const apiError = isMemberApiError(error) ? error : {
              message: '프로필 수정에 실패했습니다',
              status: 0
            };

            set((state) => {
              state.error = apiError;
              state.loading.update = false;
            });

            throw apiError;
          }
        },

        // ===== 구직자 상태 토글 =====

        toggleJobSeeker: async () => {
          set((state) => {
            state.loading.jobSeekerToggle = true;
            state.error = null;
            state.successMessage = null;
          });

          try {
            await toggleCurrentUserJobSeeker();
            
            // 사용자 정보 다시 불러오기
            await get().refreshUser();
            
            const currentUser = get().currentUser;
            const message = currentUser?.isJobSeeker 
              ? '구직자 상태가 활성화되었습니다'
              : '구직자 상태가 비활성화되었습니다';

            set((state) => {
              state.loading.jobSeekerToggle = false;
              state.successMessage = message;
            });

          } catch (error: any) {
            const apiError = isMemberApiError(error) ? error : {
              message: '구직자 상태 변경에 실패했습니다',
              status: 0
            };

            set((state) => {
              state.error = apiError;
              state.loading.jobSeekerToggle = false;
            });

            throw apiError;
          }
        },

        // ===== 계정 비활성화 =====

        deactivateAccount: async () => {
          const currentUser = get().currentUser;
          if (!currentUser) {
            throw new Error('사용자 정보가 없습니다');
          }

          set((state) => {
            state.loading.deactivate = true;
            state.error = null;
          });

          try {
            await memberApiService.deactivateAccount(currentUser.id);
            
            set((state) => {
              state.loading.deactivate = false;
              state.successMessage = '계정이 비활성화되었습니다';
            });

          } catch (error: any) {
            const apiError = isMemberApiError(error) ? error : {
              message: '계정 비활성화에 실패했습니다',
              status: 0
            };

            set((state) => {
              state.error = apiError;
              state.loading.deactivate = false;
            });

            throw apiError;
          }
        },

        // ===== 폼 관리 =====

        setFormData: (data: Partial<ProfileEditFormData>) => {
          set((state) => {
            state.formData = { ...state.formData, ...data };
            state.isFormDirty = true;
            
            // 실시간 검증
            const errors = validateFormData(state.formData);
            state.formErrors = errors;
            state.isFormValid = Object.keys(errors).length === 0;
          });
        },

        updateFormField: (field: keyof ProfileEditFormData, value: string) => {
          set((state) => {
            state.formData[field] = value;
            state.isFormDirty = true;
            
            // 해당 필드만 검증
            const errors = validateFormData(state.formData);
            if (errors[field]) {
              state.formErrors[field] = errors[field];
            } else {
              delete state.formErrors[field];
            }
            
            state.isFormValid = Object.keys(errors).length === 0;
          });
        },

        validateForm: (): boolean => {
          const formData = get().formData;
          const errors = validateFormData(formData);
          
          set((state) => {
            state.formErrors = errors;
            state.isFormValid = Object.keys(errors).length === 0;
          });

          return Object.keys(errors).length === 0;
        },

        resetForm: () => {
          set((state) => {
            state.formData = { ...initialFormData };
            state.formErrors = {};
            state.isFormDirty = false;
            state.isFormValid = false;
          });
        },

        loadFormFromUser: () => {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          set((state) => {
            state.formData = {
              name: currentUser.name || '',
              phoneNumber: currentUser.phoneNumber || '',
              language: currentUser.language || '',
              region: currentUser.region || '',
            };
            state.isFormDirty = false;
            state.formErrors = {};
            state.isFormValid = true; // 기존 데이터는 유효하다고 가정
          });
        },

        setFormErrors: (errors: Partial<ProfileEditErrors>) => {
          set((state) => {
            state.formErrors = { ...state.formErrors, ...errors };
            state.isFormValid = Object.keys(state.formErrors).length === 0;
          });
        },

        clearFormErrors: () => {
          set((state) => {
            state.formErrors = {};
            state.isFormValid = true;
          });
        },

        // ===== 상태 관리 =====

        setError: (error: MemberApiError | null) => {
          set((state) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        setSuccessMessage: (message: string | null) => {
          set((state) => {
            state.successMessage = message;
          });
        },

        clearMessages: () => {
          set((state) => {
            state.error = null;
            state.successMessage = null;
          });
        },

        // ===== 캐시 관리 =====

        invalidateCache: () => {
          set((state) => {
            state.cacheValid = false;
            state.lastFetchTime = null;
          });
        },

        isCacheExpired: (): boolean => {
          const lastFetchTime = get().lastFetchTime;
          if (!lastFetchTime) return true;
          
          return Date.now() - lastFetchTime > CACHE_DURATION;
        },

        // ===== 전체 초기화 =====

        reset: () => {
          set(() => ({ ...initialState }));
        },
      })),
      {
        name: 'elderberry-user',
        version: 1,
      }
    )
  )
);

// ===== 선택자 (Selectors) =====

export const userSelectors = {
  currentUser: (state: UserStore) => state.currentUser,
  formData: (state: UserStore) => state.formData,
  formErrors: (state: UserStore) => state.formErrors,
  isFormDirty: (state: UserStore) => state.isFormDirty,
  isFormValid: (state: UserStore) => state.isFormValid,
  loading: (state: UserStore) => state.loading,
  error: (state: UserStore) => state.error,
  successMessage: (state: UserStore) => state.successMessage,
  isJobSeeker: (state: UserStore) => state.currentUser?.isJobSeeker ?? false,
  isActive: (state: UserStore) => state.currentUser?.isActive ?? false,
};

// ===== 커스텀 훅들 =====

/**
 * 현재 사용자 정보 훅
 */
export const useCurrentUser = () => useUserStore(userSelectors.currentUser);

/**
 * 프로필 수정 폼 훅
 */
export const useProfileForm = () => {
  const formData = useUserStore(userSelectors.formData);
  const formErrors = useUserStore(userSelectors.formErrors);
  const isFormDirty = useUserStore(userSelectors.isFormDirty);
  const isFormValid = useUserStore(userSelectors.isFormValid);
  
  const setFormData = useUserStore(state => state.setFormData);
  const updateFormField = useUserStore(state => state.updateFormField);
  const validateForm = useUserStore(state => state.validateForm);
  const resetForm = useUserStore(state => state.resetForm);
  const loadFormFromUser = useUserStore(state => state.loadFormFromUser);

  return {
    formData,
    formErrors,
    isFormDirty,
    isFormValid,
    setFormData,
    updateFormField,
    validateForm,
    resetForm,
    loadFormFromUser,
  };
};

/**
 * 사용자 프로필 액션 훅
 */
export const useUserActions = () => {
  const fetchCurrentUser = useUserStore(state => state.fetchCurrentUser);
  const refreshUser = useUserStore(state => state.refreshUser);
  const updateProfile = useUserStore(state => state.updateProfile);
  const toggleJobSeeker = useUserStore(state => state.toggleJobSeeker);
  const deactivateAccount = useUserStore(state => state.deactivateAccount);

  return {
    fetchCurrentUser,
    refreshUser,
    updateProfile,
    toggleJobSeeker,
    deactivateAccount,
  };
};

/**
 * 사용자 상태 훅
 */
export const useUserState = () => {
  const loading = useUserStore(userSelectors.loading);
  const error = useUserStore(userSelectors.error);
  const successMessage = useUserStore(userSelectors.successMessage);
  const isJobSeeker = useUserStore(userSelectors.isJobSeeker);
  const isActive = useUserStore(userSelectors.isActive);

  const clearError = useUserStore(state => state.clearError);
  const clearMessages = useUserStore(state => state.clearMessages);

  return {
    loading,
    error,
    successMessage,
    isJobSeeker,
    isActive,
    clearError,
    clearMessages,
  };
};

export default useUserStore;