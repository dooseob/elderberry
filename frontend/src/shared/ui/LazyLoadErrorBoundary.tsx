/**
 * 지연 로딩 에러 바운더리
 * 페이지 로딩 실패 시 사용자 친화적인 에러 처리
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MotionScaleIn, MotionSlideUp, MotionFadeIn } from './ConditionalMotion';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Button from './Button';
import { devLogger, errorLogger } from '../../utils/devLogger';
import '../../styles/animations.css';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

export default class LazyLoadErrorBoundary extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;
  
  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.component('LazyLoadErrorBoundary 페이지 로딩 실패', error, errorInfo);
    
    // 에러 리포팅 (개발 환경에서만)
    devLogger.log('🚨 Lazy Loading Error Details');
    devLogger.log('Error:', error);
    devLogger.log('Error Info:', errorInfo);
    devLogger.log('Component Stack:', errorInfo.componentStack);

    // 부모 컴포넌트에 에러 전달
    this.props.onError?.(error, errorInfo);

    // 에러 추적 (운영 환경)
    if (!__DEV__) {
      // 여기에 에러 추적 서비스 연동 (예: Sentry)
      // trackError(error, { context: 'LazyLoading', ...errorInfo });
    }
  }

  public componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  private handleRetry = () => {
    const maxRetries = 3;
    
    if (this.state.retryCount >= maxRetries) {
      errorLogger.warn('LazyLoadErrorBoundary 최대 재시도 횟수 초과');
      return;
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));

    // 점진적 지연 재시도 (1초, 2초, 4초)
    const delay = Math.pow(2, this.state.retryCount) * 1000;
    
    this.retryTimer = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined
      });
    }, delay);
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private renderError() {
    const { error, retryCount } = this.state;
    const maxRetries = 3;
    const canRetry = retryCount < maxRetries;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <MotionScaleIn className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* 에러 아이콘 */}
          <MotionScaleIn className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </MotionScaleIn>

          {/* 에러 메시지 */}
          <MotionSlideUp className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              페이지 로딩 실패
            </h2>
            
            <p className="text-gray-600">
              페이지를 불러오는 중 문제가 발생했습니다.
              {retryCount > 0 && (
                <span className="block text-sm text-orange-600 mt-2">
                  재시도 {retryCount}/{maxRetries}
                </span>
              )}
            </p>

            {/* 개발 환경에서만 에러 상세 정보 표시 */}
            {__DEV__ && error && (
              <details className="text-left bg-gray-50 rounded p-3 text-sm">
                <summary className="cursor-pointer text-gray-700 font-medium">
                  에러 상세 정보
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {error.message}\n{error.stack}
                </pre>
              </details>
            )}
          </MotionSlideUp>

          {/* 액션 버튼들 */}
          <MotionSlideUp className="flex flex-col sm:flex-row gap-3 mt-8">
            {canRetry && (
              <Button
                onClick={this.handleRetry}
                className="flex items-center justify-center space-x-2 bg-elderberry-600 hover:bg-elderberry-700"
                disabled={this.retryTimer !== undefined}
              >
                <RefreshCw className="w-4 h-4" />
                <span>다시 시도</span>
              </Button>
            )}
            
            <Button
              onClick={this.handleGoHome}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>홈으로 이동</span>
            </Button>
          </MotionSlideUp>

          {/* 도움말 링크 */}
          <MotionFadeIn className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              문제가 계속 발생하면{' '}
              <a 
                href="/help" 
                className="text-elderberry-600 hover:text-elderberry-700 underline"
              >
                고객지원
              </a>
              에 문의하세요.
            </p>
          </MotionFadeIn>
        </MotionScaleIn>
      </div>
    );
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderError();
    }

    return this.props.children;
  }
}