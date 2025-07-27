/**
 * 에러 바운더리 컴포넌트
 * 접근성을 고려한 에러 처리 및 사용자 피드백
 */
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from '../../components/icons/LucideIcons';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 에러 로깅 서비스에 전송
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 접근성: 스크린 리더에 에러 알림
    this.announceError();
  }

  announceError = () => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = '페이지에서 오류가 발생했습니다. 새로고침하거나 홈으로 이동해주세요.';
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 3000);
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className=\"min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8\"\n          role=\"alert\"\n          aria-labelledby=\"error-title\"\n          aria-describedby=\"error-description\"\n        >\n          <div className=\"max-w-md w-full space-y-8\">\n            <div className=\"text-center\">\n              <AlertTriangle \n                className=\"mx-auto h-12 w-12 text-red-600\" \n                aria-hidden=\"true\"\n              />\n              \n              <h1 \n                id=\"error-title\"\n                className=\"mt-6 text-3xl font-extrabold text-gray-900\"\n              >\n                문제가 발생했습니다\n              </h1>\n              \n              <p \n                id=\"error-description\"\n                className=\"mt-2 text-sm text-gray-600\"\n              >\n                예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.\n              </p>\n              \n              {process.env.NODE_ENV === 'development' && this.state.error && (\n                <details className=\"mt-4 text-left\">\n                  <summary className=\"cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900\">\n                    기술적 세부사항 (개발 모드)\n                  </summary>\n                  <pre className=\"mt-2 text-xs bg-gray-100 p-4 rounded-md overflow-auto text-red-600\">\n                    {this.state.error.stack}\n                  </pre>\n                </details>\n              )}\n            </div>\n            \n            <div className=\"space-y-4\">\n              <Button\n                onClick={this.handleRetry}\n                variant=\"primary\"\n                fullWidth\n                className=\"flex items-center justify-center\"\n                aria-describedby=\"retry-description\"\n              >\n                <RefreshCw className=\"w-4 h-4 mr-2\" aria-hidden=\"true\" />\n                다시 시도\n              </Button>\n              \n              <span id=\"retry-description\" className=\"sr-only\">\n                페이지를 새로고침하여 문제를 해결합니다\n              </span>\n              \n              <Button\n                onClick={this.handleGoHome}\n                variant=\"outline\"\n                fullWidth\n                className=\"flex items-center justify-center\"\n                aria-describedby=\"home-description\"\n              >\n                <Home className=\"w-4 h-4 mr-2\" aria-hidden=\"true\" />\n                홈으로 이동\n              </Button>\n              \n              <span id=\"home-description\" className=\"sr-only\">\n                메인 페이지로 이동합니다\n              </span>\n            </div>\n            \n            <div className=\"text-center\">\n              <p className=\"text-xs text-gray-500\">\n                문제가 지속되면 {' '}\n                <a \n                  href=\"mailto:support@elderberry.com\" \n                  className=\"text-elderberry-600 hover:text-elderberry-800 underline focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 rounded\"\n                >\n                  고객지원팀\n                </a>\n                으로 문의해주세요.\n              </p>\n              \n              {this.state.errorId && (\n                <p className=\"mt-2 text-xs text-gray-400\">\n                  오류 ID: {this.state.errorId}\n                </p>\n              )}\n            </div>\n          </div>\n        </div>\n      );\n    }\n\n    return this.props.children;\n  }\n}\n\nexport default ErrorBoundary;\n\n/**\n * 함수형 컴포넌트용 에러 핸들링 훅\n */\nimport { useState, useEffect } from 'react';\n\nexport function useErrorHandler() {\n  const [error, setError] = useState<Error | null>(null);\n\n  useEffect(() => {\n    if (error) {\n      throw error;\n    }\n  }, [error]);\n\n  const handleError = (error: Error) => {\n    console.error('Error caught by useErrorHandler:', error);\n    setError(error);\n  };\n\n  const resetError = () => {\n    setError(null);\n  };\n\n  return { handleError, resetError };\n}