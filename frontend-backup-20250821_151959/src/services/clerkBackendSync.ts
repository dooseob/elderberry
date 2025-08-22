/**
 * Clerk와 백엔드 동기화 서비스
 * Clerk 인증 토큰을 백엔드에서 검증하고 사용자 정보를 동기화
 */
import { User } from '@clerk/clerk-react';
import { api } from './api';

export interface ClerkBackendSyncRequest {
  clerkUserId: string;
  email: string;
  name: string;
  imageUrl?: string;
  clerkToken: string;
}

export interface ClerkBackendSyncResponse {
  success: boolean;
  memberId: number;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    profileCompletionRate: number;
  };
}

export interface ClerkTokenValidationRequest {
  token: string;
}

export interface ClerkTokenValidationResponse {
  valid: boolean;
  userId?: string;
  email?: string;
}

class ClerkBackendSyncService {
  private readonly baseUrl = '/api/auth/clerk';

  /**
   * Clerk 사용자를 백엔드와 동기화
   * 새 사용자의 경우 자동으로 회원가입 처리
   */
  async syncUserWithBackend(
    clerkUser: User, 
    clerkToken: string
  ): Promise<ClerkBackendSyncResponse> {
    const request: ClerkBackendSyncRequest = {
      clerkUserId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      imageUrl: clerkUser.imageUrl,
      clerkToken
    };

    try {
      const response = await api.post<ClerkBackendSyncResponse>(
        `${this.baseUrl}/sync`, 
        request
      );
      return response.data;
    } catch (error) {
      console.error('Clerk 백엔드 동기화 실패:', error);
      throw new Error('Clerk 사용자 동기화에 실패했습니다.');
    }
  }

  /**
   * Clerk 토큰 검증
   */
  async validateClerkToken(token: string): Promise<ClerkTokenValidationResponse> {
    const request: ClerkTokenValidationRequest = { token };

    try {
      const response = await api.post<ClerkTokenValidationResponse>(
        `${this.baseUrl}/validate`, 
        request
      );
      return response.data;
    } catch (error) {
      console.error('Clerk 토큰 검증 실패:', error);
      throw new Error('Clerk 토큰 검증에 실패했습니다.');
    }
  }

  /**
   * 기존 JWT 사용자를 Clerk 계정과 연결
   * 이메일 기반 매칭으로 계정 통합
   */
  async linkExistingUser(
    clerkUserId: string,
    email: string,
    existingAccessToken: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/link`,
        { clerkUserId, email },
        {
          headers: {
            Authorization: `Bearer ${existingAccessToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('기존 사용자 연결 실패:', error);
      throw new Error('기존 계정과 연결하는데 실패했습니다.');
    }
  }
}

export const clerkBackendSync = new ClerkBackendSyncService();

/**
 * 사용자 마이그레이션 도우미 함수
 */
export class UserMigrationHelper {
  /**
   * 기존 JWT 사용자를 Clerk로 마이그레이션하는 가이드 제공
   */
  static getMigrationInstructions(userEmail: string): {
    title: string;
    instructions: string[];
    benefits: string[];
  } {
    return {
      title: 'Clerk 인증으로 업그레이드',
      instructions: [
        '1. "Clerk로 로그인" 버튼을 클릭하세요',
        `2. 동일한 이메일 (${userEmail})로 Clerk 계정을 생성하세요`,
        '3. 계정이 자동으로 연결됩니다',
        '4. 이후 Clerk의 강화된 보안 기능을 사용할 수 있습니다'
      ],
      benefits: [
        '🔐 강화된 보안 (2FA, 패스키 지원)',
        '🚀 더 빠른 로그인 (SSO 지원)',
        '🔄 계정 복구 옵션 확장',
        '📱 모바일 최적화된 인증'
      ]
    };
  }

  /**
   * 마이그레이션 상태 확인
   */
  static checkMigrationEligibility(user: any): {
    eligible: boolean;
    reason?: string;
  } {
    if (!user?.email) {
      return {
        eligible: false,
        reason: '이메일 정보가 필요합니다.'
      };
    }

    if (!user.isActive) {
      return {
        eligible: false,
        reason: '비활성화된 계정은 마이그레이션할 수 없습니다.'
      };
    }

    return { eligible: true };
  }
}

export default clerkBackendSync;