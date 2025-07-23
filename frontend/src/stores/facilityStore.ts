/**
 * 시설 검색 및 매칭 상태 관리 (최적화)
 * Zustand를 사용한 최소한의 전역 상태 관리
 * 로컬 상태로 처리 가능한 것들은 분리하여 성능 최적화
 */
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// 시설 관련 타입 정의
export interface FacilityProfile {
  id: number;
  facilityName: string;
  facilityType: string;
  facilityGrade: string;
  address: string;
  phoneNumber: string;
  totalCapacity: number;
  currentOccupancy: number;
  monthlyBasicFee: number | null;
  availableCareGrades: number[];
  specialties: string[];
  latitude: number | null;
  longitude: number | null;
  description?: string;
  imageUrl?: string;
  operatingHours?: string;
  facilities?: string[];
  certifications?: string[];
  createdAt: string;
}

export interface FacilityRecommendation {
  facility: FacilityProfile;
  matchScore: number;
  recommendationReason: string;
  estimatedCost?: number;
}

export interface FacilitySearchFilters {
  facilityType?: string;
  facilityGrade?: string;
  region?: string;
  careGradeLevel?: number;
  maxMonthlyFee?: number;
  minFacilityGrade?: string;
  specialties?: string[];
  maxDistanceKm?: number;
  hasAvailableSlots?: boolean;
}

export interface FacilityMatchingPreference {
  preferredRegions: Set<string>;
  preferredFacilityTypes: Set<string>;
  maxMonthlyFee: number | null;
  minFacilityGrade: string;
  requiredSpecialties: Set<string>;
  maxDistanceKm: number | null;
  prioritizeAvailability: boolean;
  prioritizeCost: boolean;
  prioritizeQuality: boolean;
}

export interface UserMatchingHistory {
  id: number;
  facilityId: number;
  facilityName: string;
  matchScore: number;
  isViewed: boolean;
  isContacted: boolean;
  isVisited: boolean;
  isSelected: boolean;
  outcome?: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  satisfactionScore?: number;
  feedback?: string;
  createdAt: string;
}

// 최소한의 전역 상태만 관리
interface FacilityState {
  // 검색 결과 (전역 공유 필요)
  searchResults: FacilityProfile[];
  
  // 추천 결과 (전역 공유 필요)
  recommendations: FacilityRecommendation[];
  
  // 현재 선택된 시설 (상세 모달용)
  selectedFacility: FacilityProfile | null;
  
  // 검색 필터 (전역 공유 필요)
  searchFilters: FacilitySearchFilters;
  
  // 매칭 선호도 (전역 공유 필요)
  matchingPreference: FacilityMatchingPreference;
  
  // 사용자 매칭 이력 (전역 공유 필요)
  userHistory: UserMatchingHistory[];
  
  // 로딩 상태들
  isSearching: boolean;
  isLoadingRecommendations: boolean;
  isLoadingHistory: boolean;
  
  // 에러 상태
  searchError: string | null;
  recommendationError: string | null;
  
  // UI 상태
  isDetailModalOpen: boolean;
  isRecommendationModalOpen: boolean;
  isMatchingFormOpen: boolean;
}

interface FacilityActions {
  // 검색 관련
  searchFacilities: (filters: FacilitySearchFilters) => Promise<void>;
  updateSearchFilters: (filters: Partial<FacilitySearchFilters>) => void;
  clearSearchResults: () => void;
  
  // 추천 관련
  getRecommendations: (memberId: number, coordinatorId?: string) => Promise<void>;
  updateMatchingPreference: (preference: Partial<FacilityMatchingPreference>) => void;
  clearRecommendations: () => void;
  
  // 시설 선택 및 상세
  selectFacility: (facility: FacilityProfile) => void;
  clearSelectedFacility: () => void;
  
  // 사용자 행동 추적
  trackFacilityView: (facilityId: number) => Promise<void>;
  trackFacilityContact: (facilityId: number) => Promise<void>;
  trackFacilityVisit: (facilityId: number) => Promise<void>;
  completeMatching: (facilityId: number, outcome: string, satisfactionScore?: number, feedback?: string) => Promise<void>;
  
  // 이력 관리
  loadUserHistory: () => Promise<void>;
  clearUserHistory: () => void;
  
  // UI 상태 관리
  openDetailModal: () => void;
  closeDetailModal: () => void;
  openRecommendationModal: () => void;
  closeRecommendationModal: () => void;
  openMatchingForm: () => void;
  closeMatchingForm: () => void;
  
  // 에러 관리
  setSearchError: (error: string | null) => void;
  setRecommendationError: (error: string | null) => void;
  clearAllErrors: () => void;
  
  // 초기화
  resetFacilityState: () => void;
}

type FacilityStore = FacilityState & FacilityActions;

// 초기 상태 정의
const initialState: FacilityState = {
  searchResults: [],
  recommendations: [],
  selectedFacility: null,
  searchFilters: {},
  matchingPreference: {
    preferredRegions: new Set(),
    preferredFacilityTypes: new Set(),
    maxMonthlyFee: null,
    minFacilityGrade: 'C',
    requiredSpecialties: new Set(),
    maxDistanceKm: null,
    prioritizeAvailability: true,
    prioritizeCost: false,
    prioritizeQuality: true,
  },
  userHistory: [],
  isSearching: false,
  isLoadingRecommendations: false,
  isLoadingHistory: false,
  searchError: null,
  recommendationError: null,
  isDetailModalOpen: false,
  isRecommendationModalOpen: false,
  isMatchingFormOpen: false,
};

// API 호출 함수들
const api = {
  async searchFacilities(filters: FacilitySearchFilters): Promise<FacilityProfile[]> {
    const params = new URLSearchParams();
    
    if (filters.facilityType) params.append('facilityType', filters.facilityType);
    if (filters.facilityGrade) params.append('facilityGrade', filters.facilityGrade);
    if (filters.region) params.append('region', filters.region);
    if (filters.careGradeLevel) params.append('careGradeLevel', filters.careGradeLevel.toString());
    
    const response = await fetch(`/api/facilities?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`시설 검색 실패: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.content || [];
  },

  async getRecommendations(memberId: number, preference: FacilityMatchingPreference, coordinatorId?: string): Promise<FacilityRecommendation[]> {
    const requestBody = {
      memberId,
      coordinatorId,
      preference: {
        preferredRegions: Array.from(preference.preferredRegions),
        preferredFacilityTypes: Array.from(preference.preferredFacilityTypes),
        maxMonthlyFee: preference.maxMonthlyFee,
        minFacilityGrade: preference.minFacilityGrade,
        requiredSpecialties: Array.from(preference.requiredSpecialties),
        maxDistanceKm: preference.maxDistanceKm,
        prioritizeAvailability: preference.prioritizeAvailability,
        prioritizeCost: preference.prioritizeCost,
        prioritizeQuality: preference.prioritizeQuality,
      },
      maxResults: 10,
    };

    const response = await fetch('/api/facilities/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`추천 시설 조회 실패: ${response.statusText}`);
    }

    return response.json();
  },

  async trackFacilityAction(facilityId: number, action: 'contact' | 'visit'): Promise<void> {
    const response = await fetch(`/api/facilities/${facilityId}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`시설 ${action} 추적 실패: ${response.statusText}`);
    }
  },

  async completeMatching(facilityId: number, outcome: string, satisfactionScore?: number, feedback?: string): Promise<void> {
    const requestBody = {
      outcome,
      satisfactionScore,
      feedback,
    };

    const response = await fetch(`/api/facilities/${facilityId}/complete-matching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`매칭 완료 처리 실패: ${response.statusText}`);
    }
  },

  async getUserHistory(): Promise<UserMatchingHistory[]> {
    const response = await fetch('/api/facilities/matching-history', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`매칭 이력 조회 실패: ${response.statusText}`);
    }

    return response.json();
  },
};

// Zustand 스토어 생성
export const useFacilityStore = create<FacilityStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // 검색 관련 액션들
        searchFacilities: async (filters: FacilitySearchFilters) => {
          set((state) => {
            state.isSearching = true;
            state.searchError = null;
          });

          try {
            const results = await api.searchFacilities(filters);
            set((state) => {
              state.searchResults = results;
              state.searchFilters = filters;
              state.isSearching = false;
            });
          } catch (error) {
            set((state) => {
              state.searchError = error instanceof Error ? error.message : '시설 검색 중 오류가 발생했습니다.';
              state.isSearching = false;
            });
          }
        },

        updateSearchFilters: (filters: Partial<FacilitySearchFilters>) => {
          set((state) => {
            Object.assign(state.searchFilters, filters);
          });
        },

        clearSearchResults: () => {
          set((state) => {
            state.searchResults = [];
            state.searchFilters = {};
            state.searchError = null;
          });
        },

        // 추천 관련 액션들
        getRecommendations: async (memberId: number, coordinatorId?: string) => {
          set((state) => {
            state.isLoadingRecommendations = true;
            state.recommendationError = null;
          });

          try {
            const recommendations = await api.getRecommendations(memberId, get().matchingPreference, coordinatorId);
            set((state) => {
              state.recommendations = recommendations;
              state.isLoadingRecommendations = false;
            });
          } catch (error) {
            set((state) => {
              state.recommendationError = error instanceof Error ? error.message : '시설 추천 중 오류가 발생했습니다.';
              state.isLoadingRecommendations = false;
            });
          }
        },

        updateMatchingPreference: (preference: Partial<FacilityMatchingPreference>) => {
          set((state) => {
            Object.assign(state.matchingPreference, preference);
          });
        },

        clearRecommendations: () => {
          set((state) => {
            state.recommendations = [];
            state.recommendationError = null;
          });
        },

        // 시설 선택 및 상세
        selectFacility: (facility: FacilityProfile) => {
          set((state) => {
            state.selectedFacility = facility;
          });
        },

        clearSelectedFacility: () => {
          set((state) => {
            state.selectedFacility = null;
          });
        },

        // 사용자 행동 추적
        trackFacilityView: async (facilityId: number) => {
          // 조회는 별도 API 호출 없이 로컬에서 처리 (실제 추적은 시설 상세 조회 시 자동 처리됨)
          console.log(`시설 조회 추적: ${facilityId}`);
        },

        trackFacilityContact: async (facilityId: number) => {
          try {
            await api.trackFacilityAction(facilityId, 'contact');
            // 성공 시 이력 새로고침
            get().loadUserHistory();
          } catch (error) {
            console.error('시설 연락 추적 실패:', error);
          }
        },

        trackFacilityVisit: async (facilityId: number) => {
          try {
            await api.trackFacilityAction(facilityId, 'visit');
            // 성공 시 이력 새로고침
            get().loadUserHistory();
          } catch (error) {
            console.error('시설 방문 추적 실패:', error);
          }
        },

        completeMatching: async (facilityId: number, outcome: string, satisfactionScore?: number, feedback?: string) => {
          try {
            await api.completeMatching(facilityId, outcome, satisfactionScore, feedback);
            // 성공 시 이력 새로고침
            get().loadUserHistory();
          } catch (error) {
            console.error('매칭 완료 처리 실패:', error);
            throw error;
          }
        },

        // 이력 관리
        loadUserHistory: async () => {
          set((state) => {
            state.isLoadingHistory = true;
          });

          try {
            const history = await api.getUserHistory();
            set((state) => {
              state.userHistory = history;
              state.isLoadingHistory = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingHistory = false;
            });
            console.error('매칭 이력 조회 실패:', error);
          }
        },

        clearUserHistory: () => {
          set((state) => {
            state.userHistory = [];
          });
        },

        // UI 상태 관리
        openDetailModal: () => {
          set((state) => {
            state.isDetailModalOpen = true;
          });
        },

        closeDetailModal: () => {
          set((state) => {
            state.isDetailModalOpen = false;
          });
        },

        openRecommendationModal: () => {
          set((state) => {
            state.isRecommendationModalOpen = true;
          });
        },

        closeRecommendationModal: () => {
          set((state) => {
            state.isRecommendationModalOpen = false;
          });
        },

        openMatchingForm: () => {
          set((state) => {
            state.isMatchingFormOpen = true;
          });
        },

        closeMatchingForm: () => {
          set((state) => {
            state.isMatchingFormOpen = false;
          });
        },

        // 에러 관리
        setSearchError: (error: string | null) => {
          set((state) => {
            state.searchError = error;
          });
        },

        setRecommendationError: (error: string | null) => {
          set((state) => {
            state.recommendationError = error;
          });
        },

        clearAllErrors: () => {
          set((state) => {
            state.searchError = null;
            state.recommendationError = null;
          });
        },

        // 초기화
        resetFacilityState: () => {
          set(() => ({ ...initialState }));
        },
      })),
      {
        name: 'facility-store', // localStorage에 저장될 키
      }
    ),
    {
      name: 'FacilityStore', // Redux DevTools에서 표시될 이름
    }
  )
);

// 선택적 구독을 위한 셀렉터들
export const useFacilitySearchResults = () => useFacilityStore((state) => state.searchResults);
export const useFacilityRecommendations = () => useFacilityStore((state) => state.recommendations);
export const useSelectedFacility = () => useFacilityStore((state) => state.selectedFacility);
export const useFacilityLoadingStates = () => useFacilityStore((state) => ({
  isSearching: state.isSearching,
  isLoadingRecommendations: state.isLoadingRecommendations,
  isLoadingHistory: state.isLoadingHistory,
}));
export const useFacilityErrors = () => useFacilityStore((state) => ({
  searchError: state.searchError,
  recommendationError: state.recommendationError,
})); 