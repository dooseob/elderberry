/**
 * ErrorMessage - 에러 상태 표시 컴포넌트
 * 재시도 버튼과 함께 에러 메시지 표시
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  showIcon?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryLabel = '다시 시도',
  className = '',
  showIcon = true
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {showIcon && (
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        오류가 발생했습니다
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;