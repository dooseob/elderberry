/**
 * 지연 로딩 페이지 폴백 컴포넌트
 * React.lazy()로 로딩되는 페이지의 Suspense fallback UI
 */
import React, { memo } from 'react';
import LoadingSpinner from './LoadingSpinner';
import PageLoadingSkeleton from './PageLoadingSkeleton';

interface LazyPageFallbackProps {
  type?: 'spinner' | 'skeleton';
  skeletonType?: 'dashboard' | 'list' | 'detail' | 'form' | 'default';
  message?: string;
}

const LazyPageFallback = memo(function LazyPageFallback({ 
  type = 'skeleton',
  skeletonType = 'default',
  message = '페이지를 로딩 중입니다...'
}: LazyPageFallbackProps) {
  if (type === 'spinner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner 
          size="large" 
          color="primary" 
          text={message}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 영역 스켈레톤 */}
      <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* 메인 콘텐츠 스켈레톤 */}
      <PageLoadingSkeleton type={skeletonType} />
    </div>
  );
});

export default LazyPageFallback;