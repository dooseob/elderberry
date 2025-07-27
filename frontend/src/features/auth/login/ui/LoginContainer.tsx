/**
 * 로그인 컨테이너 - Container Component
 * 비즈니스 로직과 상태 관리를 담당
 */
import React, { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm, LoginFormData } from './LoginForm';
import { useAuthStore } from '../../../../entities/auth';
import { ComponentProps } from '../../../../shared/types/common';

// Props 인터페이스
interface LoginContainerProps extends ComponentProps {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Container Component
export const LoginContainer: React.FC<LoginContainerProps> = ({
  redirectTo,
  onSuccess,
  onError,
  className,
  testId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 인증 스토어에서 상태와 액션 가져오기
  const {
    login,
    isLoading,
    error,
    isAuthenticated,
    clearError,
  } = useAuthStore();

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || redirectTo || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state, redirectTo]);

  // 컴포넌트 언마운트 시 에러 클리어
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // 로그인 제출 핸들러
  const handleSubmit = useCallback(async (data: LoginFormData) => {
    try {
      // 이전 에러 클리어
      clearError();
      
      // 로그인 실행
      await login(data);
      
      // 성공 콜백 실행
      onSuccess?.();
      
      // 리다이렉트 (useEffect에서 처리됨)
      
    } catch (error) {
      // 에러 콜백 실행
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      onError?.(errorMessage);
      
      console.error('Login failed:', error);
    }
  }, [login, clearError, onSuccess, onError]);

  // URL 쿼리에서 기본값 추출
  const getDefaultValues = useCallback((): Partial<LoginFormData> => {
    const searchParams = new URLSearchParams(location.search);
    const emailFromQuery = searchParams.get('email');
    
    return {
      email: emailFromQuery || '',
      password: '',
      rememberMe: false,
    };
  }, [location.search]);

  return (
    <div className={className} data-testid={testId}>
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        defaultValues={getDefaultValues()}
        testId="login-form-component"
      />
    </div>
  );
};

export default LoginContainer;