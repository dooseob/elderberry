/**
 * API Provider - 앱 전체 API 클라이언트 설정
 * Phase 2: 중앙집중식 API 관리 및 토큰 제공자 설정
 * 
 * @version 1.0.0
 * @description 앱 초기화 시 API 클라이언트를 authStore와 연결
 */
import React, { useEffect } from 'react';
import { configureApiClient } from '../../shared/api/apiClient';
import { useAuthStore, createTokenProvider } from '../../stores/authStore';

interface ApiProviderProps {
  children: React.ReactNode;
}

/**
 * API 제공자 컴포넌트
 * 앱 시작 시 API 클라이언트에 토큰 제공자를 설정합니다
 */
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const authStore = useAuthStore();
  
  useEffect(() => {
    // API 클라이언트에 토큰 제공자 설정
    const tokenProvider = createTokenProvider(authStore);
    configureApiClient(tokenProvider);
    
    console.log('✅ API 클라이언트가 authStore와 연결되었습니다.');
  }, [authStore]);

  return <>{children}</>;
};

export default ApiProvider;