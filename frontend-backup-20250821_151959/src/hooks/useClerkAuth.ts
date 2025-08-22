/**
 * Clerk 인증 통합 훅
 * 기존 JWT 인증 시스템과 Clerk를 점진적으로 통합하기 위한 브릿지 훅
 */
import { useUser, useAuth as useClerkAuthHook, useClerk } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useCallback } from 'react';

// Clerk 사용 여부를 결정하는 feature flag
const USE_CLERK_AUTH = import.meta.env.VITE_USE_CLERK_AUTH === 'true';

export interface ClerkAuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isClerkUser: boolean;
}

export const useClerkAuth = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useClerkAuthHook();
  
  // 기존 인증 스토어
  const { 
    user: legacyUser, 
    isAuthenticated: isLegacyAuthenticated,
    logout: legacyLogout 
  } = useAuthStore();

  // Clerk 사용자 정보를 기존 포맷으로 변환
  const normalizeClerkUser = useCallback((): ClerkAuthUser | null => {
    if (!clerkUser) return null;
    
    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      avatar: clerkUser.imageUrl,
      isClerkUser: true
    };
  }, [clerkUser]);

  // 기존 사용자 정보를 통합 포맷으로 변환
  const normalizeLegacyUser = useCallback((): ClerkAuthUser | null => {
    if (!legacyUser) return null;
    
    return {
      id: legacyUser.id.toString(),
      email: legacyUser.email,
      name: legacyUser.name,
      avatar: undefined,
      isClerkUser: false
    };
  }, [legacyUser]);

  // 통합 로그아웃 함수
  const logout = useCallback(async () => {
    if (USE_CLERK_AUTH && isSignedIn) {
      await signOut();
    } else if (isLegacyAuthenticated) {
      await legacyLogout();
    }
  }, [isSignedIn, isLegacyAuthenticated, signOut, legacyLogout]);

  // 통합 사용자 정보
  const user = USE_CLERK_AUTH ? normalizeClerkUser() : normalizeLegacyUser();
  const isAuthenticated = USE_CLERK_AUTH ? isSignedIn : isLegacyAuthenticated;
  const isLoading = USE_CLERK_AUTH ? !isClerkLoaded : false;

  // Clerk 토큰을 백엔드와 동기화 (선택적)
  useEffect(() => {
    if (USE_CLERK_AUTH && isSignedIn && getToken) {
      // Clerk 토큰을 가져와서 백엔드와 동기화할 수 있음
      getToken().then(token => {
        if (token) {
          // TODO: 백엔드에 Clerk 토큰 검증 API 호출
          console.log('Clerk token available for backend sync');
        }
      });
    }
  }, [isSignedIn, getToken]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isClerkEnabled: USE_CLERK_AUTH,
    // Clerk 전용 속성들
    clerkUser: USE_CLERK_AUTH ? clerkUser : null,
    isClerkLoaded: USE_CLERK_AUTH ? isClerkLoaded : true,
  };
};

// 타입 내보내기
export type { ClerkAuthUser as AuthUser };