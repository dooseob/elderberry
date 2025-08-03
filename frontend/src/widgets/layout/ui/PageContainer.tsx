/**
 * PageContainer Component - Linear Design System
 * 레이아웃 전문가가 설계한 페이지별 공통 레이아웃 컴포넌트
 * 
 * @version 2025.1.0
 * @author Layout 전문가 (Linear Design System)
 * 
 * Features:
 * - 페이지별 공통 레이아웃 구조
 * - 제목, 설명, 액션 버튼 영역
 * - Linear 스페이싱 시스템 적용
 * - 브레드크럼 통합
 * - 반응형 디자인
 * - 접근성 고려 (헤딩 구조, ARIA)
 */

import React from 'react';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';

/**
 * 페이지 액션 버튼 타입
 */
export interface PageAction {
  /** 고유 ID */
  id: string;
  /** 버튼 텍스트 */
  label: string;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** 아이콘 (선택사항) */
  icon?: React.ReactNode;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 툴팁 텍스트 */
  tooltip?: string;
}

/**
 * 페이지 메타 정보 타입
 */
export interface PageMeta {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description?: string;
  /** 키워드들 */
  keywords?: string[];
  /** OG 이미지 */
  ogImage?: string;
  /** 마지막 수정일 */
  lastModified?: Date;
}

/**
 * PageContainer Props
 */
export interface PageContainerProps {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description?: string;
  /** 브레드크럼 아이템들 */
  breadcrumbItems?: BreadcrumbItem[];
  /** 페이지 액션들 */
  actions?: PageAction[];
  /** 메인 콘텐츠 */
  children: React.ReactNode;
  /** 헤더 영역 커스텀 콘텐츠 */
  headerContent?: React.ReactNode;
  /** 사이드바 콘텐츠 */
  sidebar?: React.ReactNode;
  /** 페이지 메타 정보 */
  meta?: PageMeta;
  /** 최대 너비 */
  maxWidth?: string;
  /** 패딩 크기 */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** 브레드크럼 표시 여부 */
  showBreadcrumb?: boolean;
  /** 헤더 구분선 표시 여부 */
  showHeaderDivider?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 에러 상태 */
  error?: string;
  /** 커스텀 클래스 */
  className?: string;
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
const LoadingSkeleton: React.FC = () => (
  <div className="page-loading">
    <div className="skeleton-header">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-description"></div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line skeleton-short"></div>
    </div>
  </div>
);

/**
 * 에러 컴포넌트
 */
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="page-error linear-error">
    <div className="error-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </div>
    <div className="error-content">
      <h3>오류가 발생했습니다</h3>
      <p>{error}</p>
    </div>
  </div>
);

/**
 * 액션 버튼 렌더링
 */
const ActionButton: React.FC<{ action: PageAction }> = ({ action }) => {
  const buttonClasses = [
    `linear-button-${action.variant || 'primary'}`,
    action.loading && 'loading',
    action.disabled && 'disabled',
  ].filter(Boolean).join(' ');
  
  return (
    <button
      key={action.id}
      onClick={action.onClick}
      className={buttonClasses}
      disabled={action.disabled || action.loading}
      title={action.tooltip}
      aria-label={action.tooltip || action.label}
    >
      {action.loading ? (
        <div className="button-spinner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
      ) : (
        action.icon && <span className="button-icon">{action.icon}</span>
      )}
      <span>{action.label}</span>
    </button>
  );
};

/**
 * PageContainer Component
 */
const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  breadcrumbItems,
  actions = [],
  children,
  headerContent,
  sidebar,
  meta,
  maxWidth,
  padding = 'medium',
  showBreadcrumb = true,
  showHeaderDivider = true,
  loading = false,
  error,
  className = '',
}) => {
  // Linear 테마 훅
  const { isDarkMode } = useLinearTheme();
  
  // 메타 태그 업데이트
  React.useEffect(() => {
    if (meta?.title || title) {
      document.title = meta?.title || title;
    }
    
    if (meta?.description || description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', meta?.description || description || '');
      }
    }
    
    if (meta?.keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', meta.keywords.join(', '));
      }
    }
  }, [title, description, meta]);
  
  // 컨테이너 클래스 계산
  const containerClasses = [
    'linear-page-container',
    `padding-${padding}`,
    isDarkMode && 'page-dark',
    sidebar && 'has-sidebar',
    loading && 'page-loading-state',
    error && 'page-error-state',
    className,
  ].filter(Boolean).join(' ');
  
  // 로딩 상태 처리
  if (loading) {
    return (
      <div className={containerClasses}>
        <LoadingSkeleton />
      </div>
    );
  }
  
  // 에러 상태 처리
  if (error) {
    return (
      <div className={containerClasses}>
        <ErrorDisplay error={error} />
      </div>
    );
  }
  
  return (
    <div 
      className={containerClasses}
      style={maxWidth ? { maxWidth } : undefined}
    >
      {/* 브레드크럼 */}
      {showBreadcrumb && breadcrumbItems && breadcrumbItems.length > 0 && (
        <div className="page-breadcrumb-section">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}
      
      {/* 페이지 헤더 */}
      <header className="page-header">
        <div className="page-header-main">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1 className="page-title linear-text-primary">{title}</h1>
              {description && (
                <p className="page-description linear-text-secondary">{description}</p>
              )}
            </div>
            
            {/* 커스텀 헤더 콘텐츠 */}
            {headerContent && (
              <div className="page-header-custom">
                {headerContent}
              </div>
            )}
          </div>
          
          {/* 액션 버튼들 */}
          {actions.length > 0 && (
            <div className="page-actions">
              {actions.map((action) => (
                <ActionButton key={action.id} action={action} />
              ))}
            </div>
          )}
        </div>
        
        {/* 헤더 구분선 */}
        {showHeaderDivider && <hr className="linear-separator page-header-divider" />}
      </header>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="page-main">
        {sidebar ? (
          <div className="page-content-with-sidebar">
            <main className="page-content" role="main">
              {children}
            </main>
            <aside className="page-sidebar" role="complementary">
              {sidebar}
            </aside>
          </div>
        ) : (
          <main className="page-content" role="main">
            {children}
          </main>
        )}
      </div>
      
      {/* 페이지 메타 정보 (개발 모드에서만 표시) */}
      {process.env.NODE_ENV === 'development' && meta && (
        <div className="page-meta-debug">
          <details>
            <summary>페이지 메타 정보</summary>
            <pre>{JSON.stringify(meta, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default PageContainer;