/**
 * Breadcrumb Component - Linear Design System
 * 네비게이션 전문가가 설계한 브레드크럼 네비게이션 컴포넌트
 * 
 * @version 2025.1.0
 * @author Navigation 전문가 (Linear Design System)
 * 
 * Features:
 * - 현재 페이지 경로 표시
 * - Linear 스타일의 구분자
 * - 클릭 가능한 네비게이션
 * - 접근성 고려 (aria-label, 구조화된 데이터)
 * - 반응형 디자인 (모바일에서 축약 표시)
 * - 커스터마이징 가능한 구분자 및 스타일
 */

import React, { useMemo } from 'react';
import { useLinearTheme } from '../../../hooks/useLinearTheme';

/**
 * 브레드크럼 아이템 타입
 */
export interface BreadcrumbItem {
  /** 고유 ID */
  id: string;
  /** 표시할 텍스트 */
  label: string;
  /** 링크 경로 (현재 페이지인 경우 생략 가능) */
  href?: string;
  /** 아이콘 (선택사항) */
  icon?: React.ReactNode;
  /** 현재 페이지 여부 */
  current?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * Breadcrumb Props
 */
export interface BreadcrumbProps {
  /** 브레드크럼 아이템들 */
  items: BreadcrumbItem[];
  /** 구분자 커스터마이징 */
  separator?: React.ReactNode;
  /** 최대 표시 아이템 수 (모바일) */
  maxItems?: number;
  /** 홈 아이콘 표시 여부 */
  showHomeIcon?: boolean;
  /** 홈 링크 경로 */
  homeHref?: string;
  /** 현재 페이지 클릭 가능 여부 */
  currentClickable?: boolean;
  /** 구조화된 데이터 포함 여부 (SEO) */
  includeStructuredData?: boolean;
  /** 커스텀 클래스 */
  className?: string;
  /** 아이템 클릭 핸들러 */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

/**
 * 기본 구분자 컴포넌트
 */
const DefaultSeparator: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="breadcrumb-separator-icon"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/**
 * 홈 아이콘 컴포넌트
 */
const HomeIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="breadcrumb-home-icon"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

/**
 * 더보기 버튼 컴포넌트
 */
const MoreButton: React.FC<{ onClick: () => void; expanded: boolean }> = ({ onClick, expanded }) => (
  <button
    onClick={onClick}
    className="breadcrumb-more linear-button-ghost"
    aria-label={expanded ? '축약하기' : '전체 경로 보기'}
    title={expanded ? '축약하기' : '전체 경로 보기'}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`more-icon ${expanded ? 'expanded' : ''}`}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  </button>
);

/**
 * Breadcrumb Component
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <DefaultSeparator />,
  maxItems = 3,
  showHomeIcon = true,
  homeHref = '/',  
  currentClickable = false,
  includeStructuredData = true,
  className = '',
  onItemClick,
}) => {
  // Linear 테마 훅
  const { isDarkMode } = useLinearTheme();
  
  // 반응형 상태
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  
  // 반응형 감지
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 표시할 아이템들 계산
  const displayItems = useMemo(() => {
    if (!isMobile || isExpanded || items.length <= maxItems) {
      return items;
    }
    
    // 모바일에서 축약 표시: 첫 번째 + ... + 마지막 (maxItems - 1)개
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));
    
    if (items.length <= maxItems) {
      return items;
    }
    
    return [firstItem, ...lastItems];
  }, [items, isMobile, isExpanded, maxItems]);
  
  // 생략된 아이템이 있는지 확인
  const hasHiddenItems = isMobile && !isExpanded && items.length > maxItems;
  
  // 아이템 클릭 핸들러
  const handleItemClick = (item: BreadcrumbItem, index: number, event: React.MouseEvent) => {
    // 현재 페이지이고 클릭 불가능한 경우 기본 동작 방지
    if (item.current && !currentClickable) {
      event.preventDefault();
      return;
    }
    
    // 비활성화된 아이템 클릭 방지
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    
    onItemClick?.(item, index);
  };
  
  // 키보드 네비게이션
  const handleKeyDown = (item: BreadcrumbItem, index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onItemClick?.(item, index);
    }
  };
  
  // 구조화된 데이터 생성 (SEO)
  const structuredData = useMemo(() => {
    if (!includeStructuredData) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.label,
        ...(item.href && { 'item': window.location.origin + item.href }),
      })),
    };
  }, [items, includeStructuredData]);
  
  // 브레드크럼 클래스 계산
  const breadcrumbClasses = [
    'linear-breadcrumb',
    isDarkMode && 'breadcrumb-dark',
    isMobile && 'breadcrumb-mobile',
    isExpanded && 'breadcrumb-expanded',
    className,
  ].filter(Boolean).join(' ');
  
  // 아이템 렌더링
  const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isCurrentPage = item.current || isLast;
    const itemClasses = [
      'breadcrumb-item',
      isCurrentPage && 'current',
      item.disabled && 'disabled',
    ].filter(Boolean).join(' ');
    
    const content = (
      <>
        {item.icon && <span className="breadcrumb-item-icon">{item.icon}</span>}
        <span className="breadcrumb-item-label">{item.label}</span>
      </>
    );
    
    return (
      <li key={item.id} className={itemClasses}>
        {item.href && (!isCurrentPage || currentClickable) ? (
          <a
            href={item.href}
            className="breadcrumb-link linear-text-secondary hover:linear-text-accent"
            onClick={(e) => handleItemClick(item, index, e)}
            onKeyDown={(e) => handleKeyDown(item, index, e)}
            aria-current={isCurrentPage ? 'page' : undefined}
            aria-disabled={item.disabled}
          >
            {content}
          </a>
        ) : (
          <span
            className={`breadcrumb-text ${isCurrentPage ? 'linear-text-primary' : 'linear-text-secondary'}`}
            aria-current={isCurrentPage ? 'page' : undefined}
          >
            {content}
          </span>
        )}
      </li>
    );
  };
  
  // 구분자 렌더링
  const renderSeparator = (index: number) => (
    <li key={`separator-${index}`} className="breadcrumb-separator" aria-hidden="true">
      {separator}
    </li>
  );
  
  return (
    <nav
      className={breadcrumbClasses}
      aria-label="브레드크럼 네비게이션"
      role="navigation"
    >
      {/* 구조화된 데이터 */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      <ol className="breadcrumb-list">
        {/* 홈 아이콘 (첫 번째 아이템이 홈이 아닌 경우) */}
        {showHomeIcon && displayItems[0]?.href !== homeHref && (
          <>
            <li className="breadcrumb-item home-item">
              <a
                href={homeHref}
                className="breadcrumb-link linear-text-secondary hover:linear-text-accent"
                aria-label="홈으로 이동"
                title="홈"
              >
                <HomeIcon />
              </a>
            </li>
            {renderSeparator('home')}
          </>
        )}
        
        {/* 브레드크럼 아이템들 */}
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const actualIndex = hasHiddenItems && index > 0 ? 
            items.length - (displayItems.length - index) : index;
          
          return (
            <React.Fragment key={item.id}>
              {/* 생략 표시 (두 번째 아이템 앞에) */}
              {hasHiddenItems && index === 1 && (
                <>
                  <li className="breadcrumb-item ellipsis-item">
                    <MoreButton
                      onClick={() => setIsExpanded(!isExpanded)}
                      expanded={isExpanded}
                    />
                  </li>
                  {renderSeparator('ellipsis')}
                </>
              )}
              
              {renderItem(item, actualIndex, isLast)}
              
              {/* 구분자 (마지막 아이템이 아닌 경우) */}
              {!isLast && renderSeparator(actualIndex)}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;