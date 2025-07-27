/**
 * 앱 프로바이더 통합
 * 모든 Context Provider를 조합한 루트 프로바이더
 */
import React from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { ErrorBoundary } from '../../shared/components/ui/ErrorBoundary';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// 개별 프로바이더들도 내보내기
export { QueryProvider } from './QueryProvider';
export { AuthProvider } from './AuthProvider';
export { ThemeProvider, useTheme } from './ThemeProvider';