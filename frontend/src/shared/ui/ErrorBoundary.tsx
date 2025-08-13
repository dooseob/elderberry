/**
 * ErrorBoundary 컴포넌트
 * React 애플리케이션의 글로벌 에러 처리
 * 
 * Features:
 * - 사용자 친화적인 에러 표시
 * - 에러 추적 및 로깅
 * - 개발 모드에서 상세 정보 제공
 * - 접근성 지원
 */
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러 상태 업데이트
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 프로덕션에서는 에러 리포팅 서비스에 전송
    if (process.env.NODE_ENV === 'production') {
      // 예: Sentry, LogRocket 등에 에러 전송
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 에러 리포팅 로직 (실제 서비스에서는 Sentry 등 사용)
    console.warn('Error reported:', { error, errorInfo });
  };

  private handleRetry = () => {
    // 페이지 새로고침으로 에러 복구 시도
    window.location.reload();
  };

  private handleGoHome = () => {
    // 홈페이지로 이동
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 사용자 정의 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
          role="alert"
          aria-labelledby="error-title"
          aria-describedby="error-description"
        >
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <AlertTriangle 
                className="mx-auto h-12 w-12 text-red-600" 
                aria-hidden="true"
              />
              
              <h1 
                id="error-title"
                className="mt-6 text-3xl font-extrabold text-gray-900"
              >
                문제가 발생했습니다
              </h1>
              
              <p 
                id="error-description"
                className="mt-2 text-sm text-gray-600"
              >
                예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    기술적 세부사항 (개발 모드)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-4 rounded-md overflow-auto text-red-600">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                fullWidth
                className="flex items-center justify-center"
                aria-describedby="retry-description"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                다시 시도
              </Button>
              
              <span id="retry-description" className="sr-only">
                페이지를 새로고침하여 문제를 해결합니다
              </span>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                fullWidth
                className="flex items-center justify-center"
                aria-describedby="home-description"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                홈으로 이동
              </Button>
              
              <span id="home-description" className="sr-only">
                메인 페이지로 이동합니다
              </span>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                문제가 지속되면{' '}
                <a 
                  href="mailto:support@elderberry.com" 
                  className="text-elderberry-600 hover:text-elderberry-800 underline focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 rounded"
                >
                  고객지원팀
                </a>
                으로 문의해주세요.
              </p>
              
              {this.state.errorId && (
                <p className="mt-2 text-xs text-gray-400">
                  오류 ID: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * 함수형 컴포넌트용 에러 핸들링 훅
 */
import { useState, useEffect } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const handleError = (error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  };

  const resetError = () => {
    setError(null);
  };

  return { handleError, resetError };
}