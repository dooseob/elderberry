/**
 * 회원 프로필 관리 API 클라이언트
 * FSD shared/api 레이어 - 백엔드 MemberController와 직접 대응
 */
import { apiClient } from './client';
import type { 
  MemberResponse, 
  UpdateUserRequest 
} from '../../entities/user';

// ===== API 엔드포인트 상수 =====
const ENDPOINTS = {
  MEMBER: (id: number) => `/members/${id}`,
  TOGGLE_JOB_SEEKER: (id: number) => `/members/${id}/toggle-job-seeker`,
  DEACTIVATE: (id: number) => `/members/${id}/deactivate`,
  BY_ROLE: (role: string) => `/members/role/${role}`,
  JOB_SEEKERS: '/members/job-seekers',
  COUNT_BY_ROLE: (role: string) => `/members/count/${role}`,
} as const;

// ===== API 에러 타입 =====
export interface MemberApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

// ===== API 서비스 클래스 =====
export class MemberApiService {
  /**
   * 회원 정보 조회
   * @param id 회원 ID
   * @returns 회원 정보
   */
  async getMember(id: number): Promise<MemberResponse> {
    try {
      const response = await apiClient.get<MemberResponse>(ENDPOINTS.MEMBER(id));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 프로필 수정 (본인만 가능)
   * @param id 회원 ID
   * @param request 수정할 정보
   * @returns 수정된 회원 정보
   */
  async updateProfile(id: number, request: UpdateUserRequest): Promise<MemberResponse> {
    try {
      const response = await apiClient.put<MemberResponse>(
        ENDPOINTS.MEMBER(id),
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 구직자 상태 토글 (본인만 가능)
   * @param id 회원 ID
   * @returns void
   */
  async toggleJobSeekerStatus(id: number): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.TOGGLE_JOB_SEEKER(id));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 계정 비활성화 (본인 또는 관리자만 가능)
   * @param id 회원 ID
   * @returns void
   */
  async deactivateAccount(id: number): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.DEACTIVATE(id));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 역할별 회원 목록 조회 (관리자 전용)
   * @param role 회원 역할
   * @returns 회원 목록
   */
  async getMembersByRole(role: string): Promise<MemberResponse[]> {
    try {
      const response = await apiClient.get<MemberResponse[]>(
        ENDPOINTS.BY_ROLE(role)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 활성화된 구직자 목록 조회
   * @returns 구직자 목록
   */
  async getActiveJobSeekers(): Promise<MemberResponse[]> {
    try {
      const response = await apiClient.get<MemberResponse[]>(
        ENDPOINTS.JOB_SEEKERS
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 역할별 회원 수 조회
   * @param role 회원 역할
   * @returns 회원 수
   */
  async countByRole(role: string): Promise<number> {
    try {
      const response = await apiClient.get<number>(
        ENDPOINTS.COUNT_BY_ROLE(role)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * API 에러 처리 헬퍼
   * @param error Axios 에러
   * @returns 표준화된 에러 객체
   */
  private handleError(error: any): MemberApiError {
    if (error.response) {
      const { status, data } = error.response;
      return {
        message: data.message || this.getDefaultErrorMessage(status),
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

  /**
   * HTTP 상태 코드별 기본 에러 메시지
   * @param status HTTP 상태 코드
   * @returns 에러 메시지
   */
  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return '입력 정보를 확인해주세요.';
      case 401:
        return '로그인이 필요합니다.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '회원 정보를 찾을 수 없습니다.';
      case 409:
        return '이미 처리된 요청입니다.';
      case 422:
        return '입력 데이터 형식이 올바르지 않습니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return `오류가 발생했습니다. (${status})`;
    }
  }
}

// ===== 싱글톤 인스턴스 =====
export const memberApiService = new MemberApiService();

// ===== 편의 함수들 =====

/**
 * 현재 로그인한 사용자의 정보 조회
 * (authStore에서 userId를 가져와서 사용)
 */
export const getCurrentUserProfile = async (): Promise<MemberResponse | null> => {
  try {
    // 로컬 스토리지에서 사용자 ID 조회
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      throw new Error('로그인 정보가 없습니다.');
    }

    const userData = JSON.parse(userDataString);
    const userId = userData.id || userData.userId;
    
    if (!userId) {
      throw new Error('사용자 ID를 찾을 수 없습니다.');
    }

    return await memberApiService.getMember(userId);
  } catch (error) {
    console.error('현재 사용자 정보 조회 실패:', error);
    return null;
  }
};

/**
 * 현재 로그인한 사용자의 프로필 수정
 */
export const updateCurrentUserProfile = async (
  request: UpdateUserRequest
): Promise<MemberResponse> => {
  try {
    // 로컬 스토리지에서 사용자 ID 조회
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      throw new Error('로그인 정보가 없습니다.');
    }

    const userData = JSON.parse(userDataString);
    const userId = userData.id || userData.userId;
    
    if (!userId) {
      throw new Error('사용자 ID를 찾을 수 없습니다.');
    }

    return await memberApiService.updateProfile(userId, request);
  } catch (error) {
    console.error('프로필 수정 실패:', error);
    throw error;
  }
};

/**
 * 현재 로그인한 사용자의 구직자 상태 토글
 */
export const toggleCurrentUserJobSeeker = async (): Promise<void> => {
  try {
    // 로컬 스토리지에서 사용자 ID 조회
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      throw new Error('로그인 정보가 없습니다.');
    }

    const userData = JSON.parse(userDataString);
    const userId = userData.id || userData.userId;
    
    if (!userId) {
      throw new Error('사용자 ID를 찾을 수 없습니다.');
    }

    return await memberApiService.toggleJobSeekerStatus(userId);
  } catch (error) {
    console.error('구직자 상태 변경 실패:', error);
    throw error;
  }
};

// ===== 캐시 관리 =====

/**
 * 회원 정보 캐시 키 생성
 */
export const getMemberCacheKey = (id: number): string => `member_${id}`;

/**
 * 현재 사용자 캐시 키
 */
export const CURRENT_USER_CACHE_KEY = 'current_user';

// ===== 타입 가드 함수들 =====

/**
 * MemberApiError 타입 가드
 */
export const isMemberApiError = (error: any): error is MemberApiError => {
  return error && typeof error.message === 'string' && typeof error.status === 'number';
};

/**
 * 권한 확인 헬퍼
 */
export const hasPermissionToEdit = (currentUserId: number, targetUserId: number): boolean => {
  return currentUserId === targetUserId;
};

/**
 * 구직자 여부 확인
 */
export const isJobSeeker = (member: MemberResponse): boolean => {
  return member.isJobSeeker === true;
};

/**
 * 활성 회원 여부 확인
 */
export const isActiveMember = (member: MemberResponse): boolean => {
  return member.isActive === true;
};

// ===== Export default =====
export default memberApiService;