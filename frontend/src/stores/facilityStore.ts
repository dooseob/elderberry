import { create } from 'zustand';
import { FacilityProfileResponse, FacilitySearchParams, FacilityRecommendation } from '../types/facility';

interface FacilityState {
  // 상태
  facilities: FacilityProfileResponse[];
  recommendations: FacilityRecommendation[];
  currentFacility: FacilityProfileResponse | null;
  loading: boolean;
  error: string | null;
  
  // 검색/필터 상태
  searchParams: FacilitySearchParams;
  searchKeyword: string;
  
  // 페이지네이션
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  
  // 액션
  setFacilities: (facilities: FacilityProfileResponse[]) => void;
  setRecommendations: (recommendations: FacilityRecommendation[]) => void;
  setCurrentFacility: (facility: FacilityProfileResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchParams: (params: FacilitySearchParams) => void;
  setSearchKeyword: (keyword: string) => void;
  setPagination: (totalElements: number, totalPages: number, currentPage: number) => void;
  
  // 검색/필터 헬퍼
  updateFilter: (key: keyof FacilitySearchParams, value: any) => void;
  resetFilters: () => void;
  clearError: () => void;
}

const initialSearchParams: FacilitySearchParams = {
  page: 0,
  size: 20,
  facilityType: '',
  facilityGrade: '',
  region: '',
  sortBy: 'distance'
};

export const useFacilityStore = create<FacilityState>((set, get) => ({
  // 초기 상태
  facilities: [],
  recommendations: [],
  currentFacility: null,
  loading: false,
  error: null,
  
  searchParams: initialSearchParams,
  searchKeyword: '',
  
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 20,
  
  // 액션들
  setFacilities: (facilities) => set({ facilities }),
  
  setRecommendations: (recommendations) => set({ recommendations }),
  
  setCurrentFacility: (facility) => set({ currentFacility: facility }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setSearchParams: (params) => set({ 
    searchParams: { ...get().searchParams, ...params } 
  }),
  
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  setPagination: (totalElements, totalPages, currentPage) => set({
    totalElements,
    totalPages,
    currentPage
  }),
  
  updateFilter: (key, value) => set(state => ({
    searchParams: {
      ...state.searchParams,
      [key]: value,
      page: 0 // 필터 변경 시 첫 페이지로 리셋
    }
  })),
  
  resetFilters: () => set({
    searchParams: initialSearchParams,
    searchKeyword: '',
    currentPage: 0
  }),
  
  clearError: () => set({ error: null })
}));