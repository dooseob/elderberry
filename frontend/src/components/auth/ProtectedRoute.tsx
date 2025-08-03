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

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && user) {
        // 토큰 유효성 검사
        const isValid = await validateToken();
        if (!isValid) {
          // 토큰이 무효하면 로그아웃
          useAuthStore.getState().logout();
        }
      }
      setIsValidating(false);
    };

    checkAuth();
  }, [isAuthenticated, user, validateToken]);

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
    const redirectPath = fallbackPath === '/login' ? '/auth/signin' : fallbackPath;
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location.pathname }} 
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

// 고용주 또는 관리자 라우트
export const EmployerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={[MemberRole.EMPLOYER, MemberRole.ADMIN]} fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};

// 간병인 전용 라우트
export const CaregiverRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={[MemberRole.CAREGIVER]} fallbackPath="/unauthorized">
      {children}
    </ProtectedRoute>
  );
};