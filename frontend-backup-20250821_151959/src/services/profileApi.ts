/**
 * 프로필 관리 API 서비스
 * 백엔드 ProfileController와 직접 대응
 */

import axios, { AxiosResponse } from 'axios';
import {
  Profile,
  ProfileRequest,
  ProfileResponse,
  DomesticProfile,
  DomesticProfileRequest,
  DomesticProfileResponse,
  OverseasProfile,
  OverseasProfileRequest,
  OverseasProfileResponse,
  ProfileListResponse,
  ProfileSearchParams,
  ProfileStatistics,
  ValidationResult,
  ProfileCompletionStatus,
  DocumentValidityStatus,
  ProfileImprovementSuggestion,
  DocumentExpiryAlert,
  ProfileActivityLog,
  ProfileType
} from '../types/profile';

// ===== API 인스턴스 생성 =====

const profileApi = axios.create({
  baseURL: 'http://localhost:8080/api/profiles',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 추가
profileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리
profileApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리디렉션
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== 국내 프로필 API 서비스 =====

export const domesticProfileService = {
  /**
   * 국내 프로필 생성
   */
  async create(memberId: number, request: DomesticProfileRequest): Promise<DomesticProfileResponse> {
    const response: AxiosResponse<DomesticProfileResponse> = await profileApi.post(
      `/domestic/${memberId}`,
      request
    );
    return response.data;
  },

  /**
   * 국내 프로필 조회 (회원 ID로)
   */
  async getByMemberId(memberId: number): Promise<DomesticProfileResponse> {
    const response: AxiosResponse<DomesticProfileResponse> = await profileApi.get(
      `/domestic/member/${memberId}`
    );
    return response.data;
  },

  /**
   * 국내 프로필 조회 (프로필 ID로)
   */
  async getById(profileId: number): Promise<DomesticProfileResponse> {
    const response: AxiosResponse<DomesticProfileResponse> = await profileApi.get(
      `/domestic/${profileId}`
    );
    return response.data;
  },

  /**
   * 국내 프로필 수정
   */
  async update(profileId: number, request: DomesticProfileRequest): Promise<DomesticProfileResponse> {
    const response: AxiosResponse<DomesticProfileResponse> = await profileApi.put(
      `/domestic/${profileId}`,
      request
    );
    return response.data;
  },

  /**
   * 국내 프로필 삭제
   */
  async delete(profileId: number): Promise<void> {
    await profileApi.delete(`/domestic/${profileId}`);
  },

  /**
   * 완성도별 국내 프로필 목록 조회
   */
  async getByCompletion(minCompletion: number = 80): Promise<DomesticProfileResponse[]> {
    const response: AxiosResponse<DomesticProfileResponse[]> = await profileApi.get(
      '/domestic',
      { params: { minCompletion } }
    );
    return response.data;
  },

  /**
   * 국내 프로필 완성도 조회
   */
  async getCompletion(profileId: number): Promise<ProfileCompletionStatus> {
    const response: AxiosResponse<ProfileCompletionStatus> = await profileApi.get(
      `/domestic/${profileId}/completion`
    );
    return response.data;
  }
};

// ===== 해외 프로필 API 서비스 =====

export const overseasProfileService = {
  /**
   * 해외 프로필 생성
   */
  async create(memberId: number, request: OverseasProfileRequest): Promise<OverseasProfileResponse> {
    const response: AxiosResponse<OverseasProfileResponse> = await profileApi.post(
      `/overseas/${memberId}`,
      request
    );
    return response.data;
  },

  /**
   * 해외 프로필 조회 (회원 ID로)
   */
  async getByMemberId(memberId: number): Promise<OverseasProfileResponse> {
    const response: AxiosResponse<OverseasProfileResponse> = await profileApi.get(
      `/overseas/member/${memberId}`
    );
    return response.data;
  },

  /**
   * 해외 프로필 조회 (프로필 ID로)
   */
  async getById(profileId: number): Promise<OverseasProfileResponse> {
    const response: AxiosResponse<OverseasProfileResponse> = await profileApi.get(
      `/overseas/${profileId}`
    );
    return response.data;
  },

  /**
   * 해외 프로필 수정
   */
  async update(profileId: number, request: OverseasProfileRequest): Promise<OverseasProfileResponse> {
    const response: AxiosResponse<OverseasProfileResponse> = await profileApi.put(
      `/overseas/${profileId}`,
      request
    );
    return response.data;
  },

  /**
   * 해외 프로필 삭제
   */
  async delete(profileId: number): Promise<void> {
    await profileApi.delete(`/overseas/${profileId}`);
  },

  /**
   * 국가별 해외 프로필 목록 조회
   */
  async getByCountry(country?: string): Promise<OverseasProfileResponse[]> {
    const response: AxiosResponse<OverseasProfileResponse[]> = await profileApi.get(
      '/overseas',
      { params: { country } }
    );
    return response.data;
  },

  /**
   * 코디네이터 필요 해외 프로필 조회
   */
  async getRequiringCoordinator(): Promise<OverseasProfileResponse[]> {
    const response: AxiosResponse<OverseasProfileResponse[]> = await profileApi.get(
      '/overseas/coordinator-required'
    );
    return response.data;
  },

  /**
   * 서류 만료 예정 해외 프로필 조회
   */
  async getWithExpiringDocuments(): Promise<OverseasProfileResponse[]> {
    const response: AxiosResponse<OverseasProfileResponse[]> = await profileApi.get(
      '/overseas/expiring-documents'
    );
    return response.data;
  },

  /**
   * 비자 요구사항 조회
   */
  async getVisaRequirements(memberId: number): Promise<any[]> {
    const response: AxiosResponse<any[]> = await profileApi.get(
      `/overseas/${memberId}/visa-requirements`
    );
    return response.data;
  },

  /**
   * 맞춤형 비자 요구사항 조회
   */
  async getCustomizedVisaRequirements(memberId: number, purpose?: string): Promise<any[]> {
    const response: AxiosResponse<any[]> = await profileApi.get(
      `/overseas/${memberId}/visa-requirements/customized`,
      { params: { purpose } }
    );
    return response.data;
  },

  /**
   * 프로필 개선 제안 조회
   */
  async getImprovementSuggestions(memberId: number): Promise<ProfileImprovementSuggestion[]> {
    const response: AxiosResponse<ProfileImprovementSuggestion[]> = await profileApi.get(
      `/overseas/${memberId}/improvement-suggestions`
    );
    return response.data;
  },

  /**
   * 비자 업데이트 알림 대상 조회
   */
  async getVisaUpdateNotificationTargets(country: string): Promise<OverseasProfileResponse[]> {
    const response: AxiosResponse<OverseasProfileResponse[]> = await profileApi.get(
      '/overseas/visa-update-notification',
      { params: { country } }
    );
    return response.data;
  },

  /**
   * 해외 프로필 완성도 조회
   */
  async getCompletion(profileId: number): Promise<ProfileCompletionStatus> {
    const response: AxiosResponse<ProfileCompletionStatus> = await profileApi.get(
      `/overseas/${profileId}/completion`
    );
    return response.data;
  },

  /**
   * 문서 유효성 상태 조회
   */
  async getDocumentValidity(profileId: number): Promise<DocumentValidityStatus> {
    const response: AxiosResponse<DocumentValidityStatus> = await profileApi.get(
      `/overseas/${profileId}/document-validity`
    );
    return response.data;
  }
};

// ===== 공통 프로필 API 서비스 =====

export const profileService = {
  /**
   * 프로필 목록 조회 (검색 포함)
   */
  async search<T extends ProfileResponse>(params: ProfileSearchParams): Promise<ProfileListResponse<T>> {
    const response: AxiosResponse<ProfileListResponse<T>> = await profileApi.get('/search', { params });
    return response.data;
  },

  /**
   * 프로필 통계 조회
   */
  async getStatistics(): Promise<ProfileStatistics> {
    const response: AxiosResponse<ProfileStatistics> = await profileApi.get('/statistics');
    return response.data;
  },

  /**
   * 프로필 유효성 검증
   */
  async validate(profileType: ProfileType, data: ProfileRequest): Promise<ValidationResult> {
    const response: AxiosResponse<ValidationResult> = await profileApi.post('/validate', {
      profileType,
      data
    });
    return response.data;
  },

  /**
   * 문서 만료 알림 목록 조회
   */
  async getDocumentExpiryAlerts(): Promise<DocumentExpiryAlert[]> {
    const response: AxiosResponse<DocumentExpiryAlert[]> = await profileApi.get('/document-expiry-alerts');
    return response.data;
  },

  /**
   * 프로필 활동 로그 조회
   */
  async getActivityLog(profileId: number): Promise<ProfileActivityLog[]> {
    const response: AxiosResponse<ProfileActivityLog[]> = await profileApi.get(`/${profileId}/activity-log`);
    return response.data;
  },

  /**
   * 프로필 타입별 기본 템플릿 조회
   */
  async getTemplate(profileType: ProfileType): Promise<ProfileRequest> {
    const response: AxiosResponse<ProfileRequest> = await profileApi.get(`/template/${profileType.toLowerCase()}`);
    return response.data;
  }
};

// ===== 에러 처리 유틸리티 =====

export interface ProfileApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export function handleProfileApiError(error: any): ProfileApiError {
  if (error.response) {
    const { status, data } = error.response;
    return {
      message: data.message || getDefaultErrorMessage(status),
      status,
      code: data.code,
      details: data.details
    };
  } else if (error.request) {
    return {
      message: '네트워크 연결을 확인해주세요.',
      status: 0
    };
  } else {
    return {
      message: '알 수 없는 오류가 발생했습니다.',
      status: -1
    };
  }
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '입력 정보를 확인해주세요.';
    case 401:
      return '로그인이 필요합니다.';
    case 403:
      return '권한이 없습니다.';
    case 404:
      return '프로필을 찾을 수 없습니다.';
    case 409:
      return '이미 존재하는 프로필입니다.';
    case 422:
      return '입력 데이터 형식이 올바르지 않습니다.';
    case 500:
      return '서버 오류가 발생했습니다.';
    default:
      return `오류가 발생했습니다. (${status})`;
  }
}

// ===== 편의 메서드들 =====

/**
 * 프로필 타입에 따라 적절한 서비스 반환
 */
export function getProfileService(profileType: ProfileType) {
  return profileType === ProfileType.DOMESTIC 
    ? domesticProfileService 
    : overseasProfileService;
}

/**
 * 회원 ID로 프로필 조회 (타입 자동 감지)
 */
export async function getProfileByMemberId(memberId: number): Promise<ProfileResponse | null> {
  try {
    // 먼저 국내 프로필 시도
    const domesticProfile = await domesticProfileService.getByMemberId(memberId);
    return domesticProfile;
  } catch (domesticError: any) {
    if (domesticError.response?.status === 404) {
      try {
        // 국내 프로필이 없으면 해외 프로필 시도
        const overseasProfile = await overseasProfileService.getByMemberId(memberId);
        return overseasProfile;
      } catch (overseasError: any) {
        if (overseasError.response?.status === 404) {
          return null; // 둘 다 없음
        }
        throw overseasError;
      }
    }
    throw domesticError;
  }
}

/**
 * 프로필 생성 (타입에 따라 자동 라우팅)
 */
export async function createProfile(
  memberId: number,
  profileType: ProfileType,
  request: ProfileRequest
): Promise<ProfileResponse> {
  if (profileType === ProfileType.DOMESTIC) {
    return domesticProfileService.create(memberId, request as DomesticProfileRequest);
  } else {
    return overseasProfileService.create(memberId, request as OverseasProfileRequest);
  }
}

// ===== Export 기본 서비스들 =====

export default {
  domestic: domesticProfileService,
  overseas: overseasProfileService,
  common: profileService,
  getProfileService,
  getProfileByMemberId,
  createProfile,
  handleProfileApiError
};