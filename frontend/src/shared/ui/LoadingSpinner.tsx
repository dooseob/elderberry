/**
 * LoadingSpinner - 로딩 상태 표시 컴포넌트
 * 다양한 크기와 스타일 지원
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-3',
        '2xl': 'h-16 w-16 border-4',
      },
      variant: {
        default: 'border-gray-300 border-t-gray-600',
        primary: 'border-blue-200 border-t-blue-600',
        secondary: 'border-gray-200 border-t-gray-500',
        white: 'border-white/20 border-t-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size,
  variant,
  className = '',
  label = '로딩 중...'
}) => {
  return (
    <div 
      className={spinnerVariants({ size, variant, className })}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;