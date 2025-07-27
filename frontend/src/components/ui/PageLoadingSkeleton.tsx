/**
 * 페이지 로딩 스켈레톤 컴포넌트
 * 페이지가 로딩될 때 표시되는 스켈레톤 UI
 */
import React from 'react';
import { MotionFadeIn } from './ConditionalMotion';
import '../../styles/animations.css';

interface PageLoadingSkeletonProps {
  type?: 'dashboard' | 'list' | 'detail' | 'form' | 'default';
}

// 기본 스켈레톤 박스 컴포넌트 (CSS 애니메이션 사용)
const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`skeleton-shimmer rounded ${className}`}
  />
);

// 스켈레톤 카드 컴포넌트
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
    <SkeletonBox className="h-4 w-3/4" />
    <SkeletonBox className="h-3 w-full" />
    <SkeletonBox className="h-3 w-5/6" />
    <div className="flex space-x-2 pt-2">
      <SkeletonBox className="h-6 w-16" />
      <SkeletonBox className="h-6 w-20" />
    </div>
  </div>
);

// 스켈레톤 리스트 아이템 컴포넌트
const SkeletonListItem: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 bg-white border-b border-gray-100">
    <SkeletonBox className="w-12 h-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-4 w-1/3" />
      <SkeletonBox className="h-3 w-3/4" />
    </div>
    <SkeletonBox className="h-8 w-20 rounded" />
  </div>
);

export default function PageLoadingSkeleton({ type = 'default' }: PageLoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* 헤더 섹션 */}
            <div className="space-y-2">
              <SkeletonBox className="h-8 w-1/3" />
              <SkeletonBox className="h-4 w-2/3" />
            </div>
            
            {/* 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <SkeletonBox className="h-4 w-2/3 mb-2" />
                  <SkeletonBox className="h-8 w-1/2 mb-1" />
                  <SkeletonBox className="h-3 w-3/4" />
                </div>
              ))}
            </div>
            
            {/* 메인 콘텐츠 카드들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex justify-between items-center">
              <SkeletonBox className="h-8 w-1/4" />
              <SkeletonBox className="h-10 w-32 rounded" />
            </div>
            
            {/* 필터/검색 바 */}
            <div className="flex space-x-4">
              <SkeletonBox className="h-10 flex-1 rounded" />
              <SkeletonBox className="h-10 w-24 rounded" />
            </div>
            
            {/* 리스트 아이템들 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
              {[...Array(8)].map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          </div>
        );
        
      case 'detail':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 헤더 */}
            <div className="space-y-4">
              <SkeletonBox className="h-10 w-3/4" />
              <div className="flex space-x-4">
                <SkeletonBox className="h-6 w-20" />
                <SkeletonBox className="h-6 w-24" />
                <SkeletonBox className="h-6 w-16" />
              </div>
            </div>
            
            {/* 메인 콘텐츠 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="space-y-3">
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-5/6" />
                <SkeletonBox className="h-4 w-4/5" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <SkeletonBox className="h-4 w-1/3" />
                      <SkeletonBox className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
                <SkeletonBox className="h-48 rounded" />
              </div>
            </div>
          </div>
        );
        
      case 'form':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <SkeletonBox className="h-8 w-1/3" />
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonBox className="h-4 w-1/4" />
                  <SkeletonBox className="h-10 w-full rounded" />
                </div>
              ))}
              
              <div className="flex justify-end space-x-3 pt-4">
                <SkeletonBox className="h-10 w-20 rounded" />
                <SkeletonBox className="h-10 w-24 rounded" />
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6">
            <SkeletonBox className="h-8 w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <MotionFadeIn className="p-6">
      {renderSkeleton()}
    </MotionFadeIn>
  );
}