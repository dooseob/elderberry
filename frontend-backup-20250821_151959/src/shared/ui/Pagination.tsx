/**
 * Pagination - 페이지네이션 컴포넌트
 * 대용량 데이터 탐색을 위한 페이지 네비게이션
 */

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = '',
  size = 'md'
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // 모든 페이지 표시
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(0, currentPage - halfVisible);
      let end = Math.min(totalPages - 1, currentPage + halfVisible);
      
      // 시작 부분 조정
      if (end - start + 1 < maxVisiblePages) {
        if (start === 0) {
          end = Math.min(totalPages - 1, start + maxVisiblePages - 1);
        } else {
          start = Math.max(0, end - maxVisiblePages + 1);
        }
      }
      
      // 첫 페이지 추가
      if (start > 0) {
        pages.push(0);
        if (start > 1) {
          pages.push('ellipsis');
        }
      }
      
      // 중간 페이지들 추가
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // 마지막 페이지 추가
      if (end < totalPages - 1) {
        if (end < totalPages - 2) {
          pages.push('ellipsis');
        }
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <nav 
      className={`flex items-center justify-center gap-2 ${sizeClasses[size]} ${className}`}
      aria-label="페이지네이션"
    >
      {/* 이전 페이지 버튼 */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="이전 페이지"
        className="p-2"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* 페이지 번호들 */}
      {showPageNumbers && visiblePages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span 
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-gray-500"
              aria-hidden="true"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          );
        }

        const pageNumber = page as number;
        const isCurrentPage = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isCurrentPage ? 'primary' : 'ghost'}
            size={buttonSize}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`페이지 ${pageNumber + 1}${isCurrentPage ? ', 현재 페이지' : ''}`}
            aria-current={isCurrentPage ? 'page' : undefined}
            className="min-w-[40px]"
          >
            {pageNumber + 1}
          </Button>
        );
      })}

      {/* 다음 페이지 버튼 */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="다음 페이지"
        className="p-2"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* 페이지 정보 (작은 화면에서는 숨김) */}
      <span className="ml-4 text-sm text-gray-500 hidden sm:block">
        {currentPage + 1} / {totalPages} 페이지
      </span>
    </nav>
  );
};

export default Pagination;