/**
 * Sidebar Component - Linear Design System
 * 내비게이션 전문가가 설계한 반응형 사이드바 컴포넌트
 * 
 * @version 2025.1.0
 * @author Navigation 전문가 (Linear Design System)
 * 
 * Features:
 * - 메인 네비게이션 메뉴
 * - 접기/펼치기 기능
 * - 아이콘 + 텍스트 레이아웃
 * - 활성 페이지 하이라이트
 * - Linear 미니멀 스타일
 * - 접근성 고려 (ARIA, 키보드 네비게이션)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import type { SidebarState } from './MainLayout';

/**
 * 사이드바 메뉴 아이템 타입
 */
export interface SidebarMenuItem {
  /** 고유 ID */
  id: string;
  /** 표시할 텍스트 */
  label: string;
  /** 링크 경로 */
  href: string;
  /** 아이콘 */
  icon: React.ReactNode;
  /** 활성 상태 여부 */
  active?: boolean;
  /** 뱃지 텍스트 (선택사항) */
  badge?: string;
  /** 뱃지 변형 */
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** 새 창에서 열기 */
  external?: boolean;
  /** 서브메뉴 */
  children?: SidebarMenuItem[];
  /** 비활성화 */
  disabled?: boolean;
}

/**
 * 사이드바 섹션 타입
 */
export interface SidebarSection {
  /** 고유 ID */
  id: string;
  /** 섹션 제목 */
  title: string;
  /** 메뉴 아이템들 */
  items: SidebarMenuItem[];
  /** 접기/펼치기 가능 여부 */
  collapsible?: boolean;
  /** 초기 접힘 상태 */
  collapsed?: boolean;
}

/**
 * Sidebar Props
 */
export interface SidebarProps {
  /** 사이드바 상태 */
  state: SidebarState;
  /** 상태 변경 콜백 */
  onStateChange: (state: SidebarState) => void;
  /** 모바일 여부 */
  isMobile?: boolean;
  /** 고정 여부 */
  fixed?: boolean;
  /** 사이드바 섹션들 */
  sections?: SidebarSection[];
  /** 사이드바 메뉴 아이템들 (단순 형태) */
  menuItems?: SidebarMenuItem[];
  /** 헤더 표시 여부 */
  showHeader?: boolean;
  /** 푸터 표시 여부 */
  showFooter?: boolean;
  /** 커스텀 클래스 */
  className?: string;
}

/**
 * 기본 사이드바 메뉴 아이템들
 */
const DEFAULT_MENU_ITEMS: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    href: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    active: true,
  },
  {
    id: 'facilities',
    label: '시설 찾기',
    href: '/facilities',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    id: 'health',
    label: '건강 평가',
    href: '/health',
    badge: '새로움',
    badgeVariant: 'success',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: '마이페이지',
    href: '/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    children: [
      {
        id: 'profile-info',
        label: '개인정보',
        href: '/profile/info',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ),
      },
      {
        id: 'profile-settings',
        label: '설정',
        href: '/profile/settings',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'help',
    label: '도움말',
    href: '/help',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

/**
 * 기본 사이드바 섹션들
 */
const DEFAULT_SECTIONS: SidebarSection[] = [
  {
    id: 'main',
    title: '메인',
    items: DEFAULT_MENU_ITEMS.slice(0, 2),
  },
  {
    id: 'services',
    title: '서비스',
    items: DEFAULT_MENU_ITEMS.slice(2, 4),
  },
  {
    id: 'support',
    title: '지원',
    items: DEFAULT_MENU_ITEMS.slice(4),
  },
];

/**
 * Sidebar Component
 */
const Sidebar: React.FC<SidebarProps> = ({
  state,
  onStateChange,
  isMobile = false,
  fixed = true,
  sections = DEFAULT_SECTIONS,
  menuItems,
  showHeader = true,
  showFooter = true,
  className = '',
}) => {
  // Linear 테마 훅
  const { currentTheme, isDarkMode } = useLinearTheme();
  
  // 섹션 접힘 상태 관리
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // 섹션 토글
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);
  
  // 서브메뉴 토글
  const toggleSubMenu = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);
  
  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);
  
  // 메뉴 아이템 렌더링
  const renderMenuItem = (item: SidebarMenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isCollapsed = state === 'collapsed';
    
    return (
      <div key={item.id} className={`sidebar-menu-item level-${level}`}>
        {hasChildren ? (
          <button
            onClick={() => toggleSubMenu(item.id)}
            onKeyDown={(e) => handleKeyDown(e, () => toggleSubMenu(item.id))}
            className={`
              menu-item-button submenu-toggle
              ${item.active ? 'active' : ''}
              ${item.disabled ? 'disabled' : ''}
            `}
            aria-expanded={isExpanded}
            disabled={item.disabled}
          >
            <span className="menu-item-icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="menu-item-label">{item.label}</span>
                {item.badge && (
                  <span className={`linear-badge linear-badge-${item.badgeVariant || 'default'}`}>
                    {item.badge}
                  </span>
                )}
                <svg
                  className={`submenu-arrow ${isExpanded ? 'expanded' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <a
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            className={`
              menu-item-link
              ${item.active ? 'active' : ''}
              ${item.disabled ? 'disabled' : ''}
            `}
            aria-disabled={item.disabled}
          >
            <span className="menu-item-icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="menu-item-label">{item.label}</span>
                {item.badge && (
                  <span className={`linear-badge linear-badge-${item.badgeVariant || 'default'}`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </a>
        )}
        
        {/* 서브메뉴 */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="submenu linear-animate-slide-down">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // 섹션 렌더링
  const renderSection = (section: SidebarSection) => {
    const isCollapsed = state === 'collapsed';
    const isSectionCollapsed = collapsedSections.has(section.id);
    
    return (
      <div key={section.id} className="sidebar-section">
        {!isCollapsed && (
          <div className="section-header">
            {section.collapsible ? (
              <button
                onClick={() => toggleSection(section.id)}
                onKeyDown={(e) => handleKeyDown(e, () => toggleSection(section.id))}
                className="section-toggle"
                aria-expanded={!isSectionCollapsed}
              >
                <span className="section-title">{section.title}</span>
                <svg
                  className={`section-arrow ${isSectionCollapsed ? '' : 'expanded'}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ) : (
              <h3 className="section-title">{section.title}</h3>
            )}
          </div>
        )}
        
        {(!section.collapsible || !isSectionCollapsed) && (
          <div className="section-items">
            {section.items.map((item) => renderMenuItem(item))}
          </div>
        )}
        
        {!isCollapsed && <hr className="linear-separator" />}
      </div>
    );
  };
  
  // 사이드바 클래스 계산
  const sidebarClasses = [
    'linear-sidebar',
    `sidebar-${state}`,
    isMobile && 'sidebar-mobile',
    fixed && 'sidebar-fixed', 
    isDarkMode && 'sidebar-dark',
    className,
  ].filter(Boolean).join(' ');
  
  // 단순 메뉴 아이템들이 제공된 경우 처리
  const effectiveSections = menuItems 
    ? [{ id: 'main', title: '메인', items: menuItems }] 
    : sections;
  
  return (
    <aside className={sidebarClasses} role="complementary" aria-label="사이드바 네비게이션">
      {/* 사이드바 헤더 */}
      {showHeader && !isMobile && (
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon linear-gradient-signature">
              <span className="brand-text">E</span>
            </div>
            {state !== 'collapsed' && (
              <span className="brand-name">엘더베리</span>
            )}
          </div>
        </div>
      )}
      
      {/* 사이드바 콘텐츠 */}
      <div className="sidebar-content linear-scrollbar">
        <nav className="sidebar-nav" role="navigation" aria-label="사이드바 메뉴">
          {effectiveSections.map(renderSection)}
        </nav>
      </div>
      
      {/* 사이드바 푸터 */}
      {showFooter && state !== 'collapsed' && (
        <div className="sidebar-footer">
          <div className="footer-info">
            <span className="app-version">v2025.1.0</span>
            <span className="linear-text-tertiary">엘더베리</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;