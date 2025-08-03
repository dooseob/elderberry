/**
 * 인증 프로바이더
 * 앱 전체의 인증 상태 초기화 및 관리
 */
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../entities/auth';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { validateToken, refreshToken, clearTokens, accessToken } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!accessToken) {
          setIsInitialized(true);
          return;
        }

        // 토큰 유효성 검사
        const isValid = await validateToken();
        
        if (!isValid) {
          // 토큰이 유효하지 않으면 리프레시 시도
          try {
            await refreshToken();
          } catch (error) {
            // 리프레시 실패 시 토큰 클리어
            clearTokens();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearTokens();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [accessToken, validateToken, refreshToken, clearTokens]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">앱을 초기화하는 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};