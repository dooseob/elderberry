/**
 * 보호된 라우트 컴포넌트
 * 인증된 사용자만 접근 가능
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { MemberRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: MemberRole[]; // 허용된 역할 목록
  fallbackPath?: string; // 리다이렉트 경로
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  fallbackPath = '/login'
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, validateToken } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  // 디버깅을 위한 로깅
  console.log('[ProtectedRoute] Checking route:', location.pathname, {
    isAuthenticated,
    user,
    isLoading,
    isValidating,
    roles
  });

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      // 컴포넌트가 언마운트된 경우 상태 업데이트 중단
      if (!isMounted) return;
      
      // 토큰이 있고 사용자 정보가 있는 경우에만 검증
      if (isAuthenticated && user) {
        try {
          // 토큰 유효성 검사
          const isValid = await validateToken();
          if (!isMounted) return; // 비동기 작업 후 컴포넌트 상태 재확인
          
          // validateToken에서 false를 반환하면 이미 authApi 인터셉터에서
          // 토큰 정리가 완료되었으므로 추가 로그아웃 호출하지 않음
          if (!isValid) {
            console.warn('[ProtectedRoute] Token validation failed - token already cleared by interceptor');
            // 로그아웃 호출 제거 - 인터셉터에서 이미 처리됨
          }
        } catch (error) {
          console.warn('[ProtectedRoute] Token validation failed:', error);
        }
      }
      
      if (isMounted) {
        setIsValidating(false);
      }
    };

    // 최초 마운트 시에만 실행하도록 최적화
    if (isValidating) {
      checkAuth();
    }
    
    // 클린업 함수
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, isValidating]); // isValidating 추가하여 초기 검증만 실행

  // 로딩 중이거나 토큰 검증 중
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-elderberry-600"></div>
      </div>
    );
  }

  // 인증되지 않은 경우 - 개선된 리다이렉트 경로
  if (!isAuthenticated || !user) {
    let redirectPath = fallbackPath;
    
    // 기본 fallback 경로 처리
    if (fallbackPath === '/login') {
      redirectPath = '/auth/signin';
    } else if (!fallbackPath) {
      redirectPath = '/auth/signin';
    }
    
    // 로그아웃 후 특별 처리가 필요한 경우
    if (redirectPath === '/logout-redirect') {
      return (
        <Navigate 
          to="/logout-redirect" 
          state={{ 
            from: location.pathname,
            reason: 'authentication_required'
          }} 
          replace 
        />
      );
    }
    
    // 일반적인 인증 실패 리다이렉트
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          from: location.pathname,
          message: '로그인이 필요한 페이지입니다.'
        }} 
        replace 
      />
    );
  }

  // 역할 권한 검사
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location.pathname, requiredRoles: roles }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

// 관리자 전용 라우트
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={[MemberRole.ADMIN]} fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};

// 코디네이터 또는 관리자 라우트
export const CoordinatorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={[MemberRole.COORDINATOR, MemberRole.ADMIN]} fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};

// 시설 또는 관리자 라우트
export const FacilityRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={[MemberRole.FACILITY, MemberRole.ADMIN]} fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};

// 구직자 전용 라우트
export const JobSeekerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={[MemberRole.JOB_SEEKER_DOMESTIC, MemberRole.JOB_SEEKER_OVERSEAS]} fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};

// 일반 사용자 라우트 (국내/해외 사용자)
export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={[MemberRole.USER_DOMESTIC, MemberRole.USER_OVERSEAS]} fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};