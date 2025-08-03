/**
 * 로딩 오버레이 컴포넌트
 * 접근성을 고려한 로딩 상태 표시
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from '../../components/icons/LucideIcons';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = '로딩 중...',
  size = 'md',
  overlay = true,
  className = '',
}) => {
  if (!isVisible) return null;

  const sizeConfig = {
    sm: { icon: 'w-4 h-4', text: 'text-sm' },
    md: { icon: 'w-6 h-6', text: 'text-base' },
    lg: { icon: 'w-8 h-8', text: 'text-lg' },
  };

  const config = sizeConfig[size];

  const loadingContent = (
    <div className=\"flex flex-col items-center justify-center space-y-3\">\n      <Loader2 \n        className={`${config.icon} animate-spin text-elderberry-600`}\n        aria-hidden=\"true\"\n      />\n      \n      <div \n        className={`${config.text} text-elderberry-800 font-medium`}\n        role=\"status\"\n        aria-live=\"polite\"\n      >\n        {message}\n      </div>\n    </div>\n  );\n\n  if (overlay) {\n    return (\n      <motion.div\n        initial={{ opacity: 0 }}\n        animate={{ opacity: 1 }}\n        exit={{ opacity: 0 }}\n        className={`\n          fixed inset-0 z-50 flex items-center justify-center\n          bg-white bg-opacity-90 backdrop-blur-sm\n          ${className}\n        `}\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-label=\"로딩 중\"\n      >\n        {loadingContent}\n      </motion.div>\n    );\n  }\n\n  return (\n    <div \n      className={`flex items-center justify-center p-4 ${className}`}\n      role=\"status\"\n      aria-label={message}\n    >\n      {loadingContent}\n    </div>\n  );\n};\n\nexport default LoadingOverlay;\n\n/**\n * 인라인 로딩 스피너\n */\ninterface LoadingSpinnerProps {\n  size?: 'xs' | 'sm' | 'md' | 'lg';\n  className?: string;\n  label?: string;\n}\n\nexport const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({\n  size = 'md',\n  className = '',\n  label = '로딩 중',\n}) => {\n  const sizeClasses = {\n    xs: 'w-3 h-3',\n    sm: 'w-4 h-4',\n    md: 'w-5 h-5',\n    lg: 'w-6 h-6',\n  };\n\n  return (\n    <Loader2 \n      className={`${sizeClasses[size]} animate-spin ${className}`}\n      aria-label={label}\n      role=\"status\"\n    />\n  );\n};\n\n/**\n * 스켈레톤 로더\n */\ninterface SkeletonProps {\n  className?: string;\n  width?: string | number;\n  height?: string | number;\n  variant?: 'text' | 'rectangular' | 'circular';\n  animation?: boolean;\n}\n\nexport const Skeleton: React.FC<SkeletonProps> = ({\n  className = '',\n  width,\n  height,\n  variant = 'rectangular',\n  animation = true,\n}) => {\n  const baseClasses = 'bg-gray-200 dark:bg-gray-700';\n  \n  const variantClasses = {\n    text: 'rounded',\n    rectangular: 'rounded-md',\n    circular: 'rounded-full',\n  };\n  \n  const animationClasses = animation ? 'animate-pulse' : '';\n  \n  const style: React.CSSProperties = {};\n  if (width) style.width = typeof width === 'number' ? `${width}px` : width;\n  if (height) style.height = typeof height === 'number' ? `${height}px` : height;\n  \n  return (\n    <div \n      className={`\n        ${baseClasses} \n        ${variantClasses[variant]} \n        ${animationClasses} \n        ${className}\n      `}\n      style={style}\n      role=\"status\"\n      aria-label=\"콘텐츠 로딩 중\"\n    />\n  );\n};