/**
 * Facility API 클라이언트
 * 공공데이터 연동 백엔드 API와 통신
 */
import axios from 'axios';
import type { 
  Facility, 
  FacilityDetail, 
  FacilityRecommendation, 
  FacilitySearchFilters,
  FacilitySearchResponse 
} from '../model/types';
import {
  adaptBackendSearchResponse,
  adaptBackendFacilityDetail,
  adaptFrontendSearchParams,
  isBackendSearchResponseDto,
  createEmptyFacilitySearchResponse,
  createEmptyFacilityDetail
} from '../../../shared/lib/adapters/facilityAdapters';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// API 클라이언트 인스턴스
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (인증 토큰 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 시설 검색 파라미터 타입
export interface FacilitySearchParams {
  keyword?: string;
  region?: string;
  district?: string;
  facilityType?: string;
  minGrade?: string;
  maxMonthlyCost?: number;
  availableBedsOnly?: boolean;
  specializedCare?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sortBy?: string;
  page?: number;
  size?: number;
}

// 지도 기반 검색 파라미터
export interface FacilityMapSearchParams {
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
  facilityType?: string;
  minGrade?: string;
  availableBedsOnly?: boolean;
}

// 추천 시설 파라미터
export interface FacilityRecommendationParams {
  healthAssessmentId?: number;
  careGrade?: number;
  preferredRegion?: string;
  budgetRange?: number;
  limit?: number;
}

/**
 * Facility API 서비스
 */
export const facilityApi = {
  // 통합 시설 검색
  async searchFacilities(params: FacilitySearchParams): Promise<FacilitySearchResponse> {
    try {
      const adaptedParams = adaptFrontendSearchParams(params);
      const response = await apiClient.get('/facilities', { params: adaptedParams });
      
      if (isBackendSearchResponseDto(response.data)) {
        return adaptBackendSearchResponse(response.data);
      }
      
      return createEmptyFacilitySearchResponse();
    } catch (error) {
      console.error('시설 검색 중 오류:', error);
      return createEmptyFacilitySearchResponse();
    }
  },

  // 지도 기반 시설 검색
  async searchFacilitiesOnMap(params: FacilityMapSearchParams) {
    try {
      // 백엔드에서 지원하는 `/facilities` 엔드포인트 사용
      const adaptedParams = {
        latitude: (params.neLat + params.swLat) / 2,
        longitude: (params.neLng + params.swLng) / 2,
        radiusKm: Math.abs(params.neLat - params.swLat) * 110, // 대략적인 반경 계산
        facilityType: params.facilityType,
        minGrade: params.minGrade,
        availableBedsOnly: params.availableBedsOnly
      };
      const response = await apiClient.get('/facilities', { params: adaptedParams });
      
      if (isBackendSearchResponseDto(response.data)) {
        return adaptBackendSearchResponse(response.data);
      }
      
      return createEmptyFacilitySearchResponse();
    } catch (error) {
      console.error('지도 기반 시설 검색 중 오류:', error);
      return createEmptyFacilitySearchResponse();
    }
  },

  // 시설 상세 정보 조회
  async getFacilityDetail(facilityId: number): Promise<FacilityDetail> {
    try {
      const response = await apiClient.get(`/facilities/${facilityId}`);
      
      if (response.data && typeof response.data === 'object') {
        return adaptBackendFacilityDetail(response.data);
      }
      
      return createEmptyFacilityDetail(facilityId);
    } catch (error) {
      console.error(`시설 상세 정보 조회 중 오류 (ID: ${facilityId}):`, error);
      return createEmptyFacilityDetail(facilityId);
    }
  },

  // AI 추천 시설 목록
  async getRecommendations(params: FacilityRecommendationParams = {}): Promise<FacilityRecommendation[]> {
    const response = await apiClient.get('/facilities/recommendations', { params });
    return response.data;
  },

  // 인기 시설 목록
  async getPopularFacilities(): Promise<Facility[]> {
    // 전체 검색을 사용 (인기도 정렬)
    const response = await apiClient.get('/facilities', {
      params: { sortBy: 'rating', size: 10 }
    });
    return response.data.content || [];
  },

  // 시설 비교하기
  async compareFacilities(facilityIds: number[]) {
    const response = await apiClient.post('/facilities/compare', facilityIds);
    return response.data;
  },

  // 즐겨찾기 목록 조회
  async getFavoriteFacilities(page = 0, size = 20) {
    const response = await apiClient.get('/facilities/favorites', {
      params: { page, size }
    });
    return response.data;
  },

  // 즐겨찾기 추가/제거
  async toggleLike(facilityId: number): Promise<{ isFavorite: boolean; message: string }> {
    // 현재 즐겨찾기 상태를 확인하고 토글
    try {
      const response = await apiClient.post(`/facilities/${facilityId}/favorite`, null, {
        params: { isFavorite: true }
      });
      return response.data;
    } catch (error) {
      // 이미 즐겨찾기인 경우 제거
      const response = await apiClient.post(`/facilities/${facilityId}/favorite`, null, {
        params: { isFavorite: false }
      });
      return response.data;
    }
  },

  // 시설 공유
  async shareFacility(facilityId: number, shareData: { platform: string; message?: string }) {
    // 실제로는 백엔드에서 공유 로그를 기록하거나 공유 링크를 생성
    return Promise.resolve({
      success: true,
      shareUrl: `${window.location.origin}/facilities/${facilityId}`,
      message: '시설 정보가 공유되었습니다.'
    });
  },

  // 지역별 시설 통계
  async getFacilityStatisticsByRegion(sido: string, sigungu?: string) {
    // 실제 엔드포인트가 구현되면 활성화
    return Promise.resolve({
      totalCount: 0,
      region: { sido, sigungu },
      operatorTypeDistribution: {},
      capacityStats: {},
      facilityTypeDistribution: {}
    });
  }
};

/**
 * React Query용 쿼리 키 팩토리
 */
export const facilityQueryKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityQueryKeys.all, 'list'] as const,
  list: (filters: Partial<FacilitySearchParams>) => 
    [...facilityQueryKeys.lists(), filters] as const,
  details: () => [...facilityQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...facilityQueryKeys.details(), id] as const,
  search: (query: string, filters: FacilitySearchFilters) => 
    [...facilityQueryKeys.all, 'search', query, filters] as const,
  recommendations: () => [...facilityQueryKeys.all, 'recommendations'] as const,
  popular: () => [...facilityQueryKeys.all, 'popular'] as const,
  favorites: () => [...facilityQueryKeys.all, 'favorites'] as const,
  map: (bounds: FacilityMapSearchParams) => 
    [...facilityQueryKeys.all, 'map', bounds] as const,
  statistics: (region: string) => 
    [...facilityQueryKeys.all, 'statistics', region] as const,
};

// 에러 타입 정의
export interface FacilityApiError {
  message: string;
  status?: number;
  code?: string;
}

// 에러 핸들링 유틸리티
export const handleFacilityApiError = (error: any): FacilityApiError => {
  if (error.response) {
    return {
      message: error.response.data?.message || '서버 오류가 발생했습니다.',
      status: error.response.status,
      code: error.response.data?.code
    };
  } else if (error.request) {
    return {
      message: '네트워크 연결을 확인해주세요.',
      code: 'NETWORK_ERROR'
    };
  } else {
    return {
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      code: 'UNKNOWN_ERROR'
    };
  }
};

// API 응답 타입 가드
export const isValidFacilityResponse = (data: any): data is FacilitySearchResponse => {
  return data && 
         typeof data === 'object' && 
         Array.isArray(data.content) &&
         typeof data.totalElements === 'number';
};

export const isValidFacilityDetail = (data: any): data is FacilityDetail => {
  return data && 
         typeof data === 'object' && 
         typeof data.facilityId !== 'undefined' &&
         typeof data.facilityName === 'string';
};

// 검색 파라미터 정규화
export const normalizeSearchParams = (params: FacilitySearchParams): FacilitySearchParams => {
  const normalized: FacilitySearchParams = {};
  
  // 빈 문자열이나 null 값 제거
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      normalized[key as keyof FacilitySearchParams] = value;
    }
  });
  
  // 기본값 설정
  return {
    page: 0,
    size: 20,
    sortBy: 'grade',
    ...normalized
  };
};

// 지도 검색 파라미터 검증
export const validateMapSearchParams = (params: FacilityMapSearchParams): boolean => {
  const { neLat, neLng, swLat, swLng } = params;
  
  // 좌표 유효성 검사
  if (typeof neLat !== 'number' || typeof neLng !== 'number' ||
      typeof swLat !== 'number' || typeof swLng !== 'number') {
    return false;
  }
  
  // 좌표 범위 검사 (한국 영역 대략적 범위)
  if (neLat < 33 || neLat > 43 || swLat < 33 || swLat > 43 ||
      neLng < 124 || neLng > 132 || swLng < 124 || swLng > 132) {
    return false;
  }
  
  // NE가 SW보다 큰지 확인
  if (neLat <= swLat || neLng <= swLng) {
    return false;
  }
  
  return true;
};