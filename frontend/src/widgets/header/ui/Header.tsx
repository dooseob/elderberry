/**
 * Header Component - Linear Design System
 * 네비게이션 전문가가 설계한 반응형 헤더/네비게이션 컴포넌트
 * 
 * @version 2025.1.0
 * @author Navigation 전문가 (Linear Design System)
 * 
 * Features:
 * - Linear 브랜드 로고 영역
 * - 네비게이션 메뉴 (홈, 서비스, 소개 등)
 * - 사용자 메뉴 (로그인/로그아웃, 마이페이지)
 * - 테마 전환 토글 버튼
 * - 모바일 햄버거 메뉴
 * - 접근성 고려 (ARIA, 키보드 네비게이션)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import type { LayoutVariant, SidebarState } from './MainLayout';

/**
 * 네비게이션 메뉴 아이템 타입
 */
export interface NavMenuItem {
  /** 고유 ID */
  id: string;
  /** 표시할 텍스트 */
  label: string;
  /** 링크 경로 */
  href: string;
  /** 아이콘 (선택사항) */
  icon?: React.ReactNode;
  /** 활성 상태 여부 */
  active?: boolean;
  /** 뱃지 텍스트 (선택사항) */
  badge?: string;
  /** 새 창에서 열기 */
  external?: boolean;
  /** 서브메뉴 */
  children?: NavMenuItem[];
}

/**
 * 사용자 메뉴 아이템 타입
 */
export interface UserMenuItem {
  /** 고유 ID */
  id: string;
  /** 표시할 텍스트 */
  label: string;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 아이콘 (선택사항) */
  icon?: React.ReactNode;
  /** 구분선 표시 */
  divider?: boolean;
  /** 위험한 액션 (빨간색 표시) */
  danger?: boolean;
}

/**
 * Header Props
 */
export interface HeaderProps {
  /** 사이드바 상태 */
  sidebarState: SidebarState;
  /** 사이드바 토글 핸들러 */
  onToggleSidebar: () => void;
  /** 레이아웃 변형 */
  variant?: LayoutVariant;
  /** 모바일 여부 */
  isMobile?: boolean;
  /** 고정 헤더 여부 */
  fixed?: boolean;
  /** 네비게이션 메뉴 아이템들 */
  navItems?: NavMenuItem[];
  /** 사용자 메뉴 아이템들 */
  userMenuItems?: UserMenuItem[];
  /** 사용자 정보 */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** 로고 클릭 핸들러 */
  onLogoClick?: () => void;
  /** 커스텀 클래스 */
  className?: string;
}

/**
 * 기본 네비게이션 메뉴
 */
const DEFAULT_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
    active: true,
  },
  {
    id: 'facilities',
    label: '시설 찾기',
    href: '/facilities',
  },
  {
    id: 'health',
    label: '건강 평가',
    href: '/health',
  },
  {
    id: 'about',
    label: '소개',
    href: '/about',
  },
  {
    id: 'contact',
    label: '문의',
    href: '/contact',
  },
];

/**
 * Header Component
 */
const Header: React.FC<HeaderProps> = ({
  sidebarState,
  onToggleSidebar,
  variant = 'default',
  isMobile = false,
  fixed = true,
  navItems = DEFAULT_NAV_ITEMS,
  userMenuItems = [],
  user,
  onLogoClick,
  className = '',
}) => {
  // Linear 테마 훅
  const {
    currentTheme,
    isDarkMode,
    toggleDarkMode,
    themePreview,
    setTheme,
  } = useLinearTheme();
  
  // 상태 관리
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  
  // Refs
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);
  
  // 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setIsNavMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);
  
  // 테마 변경 핸들러
  const handleThemeChange = useCallback((themeId: string) => {
    setTheme(themeId);
    setIsThemeMenuOpen(false);
  }, [setTheme]);
  
  // 로고 클릭 핸들러
  const handleLogoClick = useCallback(() => {
    onLogoClick?.() || (window.location.href = '/');
  }, [onLogoClick]);
  
  // 사용자 메뉴 아이템 렌더링
  const renderUserMenuItem = (item: UserMenuItem) => (
    <button
      key={item.id}
      onClick={item.onClick}
      className={`
        user-menu-item linear-button-ghost
        ${item.danger ? 'text-error' : ''}
        ${item.divider ? 'border-t border-linear-border-subtle' : ''}
      `}
    >
      {item.icon && <span className="menu-item-icon">{item.icon}</span>}
      <span>{item.label}</span>
    </button>
  );
  
  // 네비게이션 아이템 렌더링
  const renderNavItem = (item: NavMenuItem) => (
    <a
      key={item.id}
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      className={`
        nav-item linear-button-ghost
        ${item.active ? 'nav-item-active' : ''}
      `}
    >
      {item.icon && <span className="nav-item-icon">{item.icon}</span>}
      <span>{item.label}</span>
      {item.badge && (
        <span className="linear-badge nav-item-badge">{item.badge}</span>
      )}
    </a>
  );
  
  // 헤더 클래스 계산
  const headerClasses = [
    'linear-header',
    'linear-navbar',
    `header-variant-${variant}`,
    fixed && 'header-fixed',
    isMobile && 'header-mobile',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <header className={headerClasses}>
      <div className="header-container">
        {/* 왼쪽 영역: 사이드바 토글 + 로고 */}
        <div className="header-start">
          {/* 사이드바 토글 버튼 */}
          <button
            onClick={onToggleSidebar}
            className="sidebar-toggle linear-button-ghost"
            aria-label="사이드바 토글"
            title="사이드바 토글 (Alt+S)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          
          {/* 로고 */}
          <button
            onClick={handleLogoClick}
            className="header-logo"
            aria-label="엘더베리 홈으로 이동"
          >
            <div className="logo-icon linear-gradient-signature">
              <span className="logo-text">E</span>
            </div>
            <span className="logo-brand">엘더베리</span>
          </button>
        </div>
        
        {/* 중앙 영역: 네비게이션 메뉴 (데스크톱만) */}
        {!isMobile && (
          <nav className="header-nav" role="navigation" aria-label="메인 네비게이션">
            <div className="nav-items">
              {navItems.map(renderNavItem)}
            </div>
          </nav>
        )}
        
        {/* 오른쪽 영역: 테마 토글 + 사용자 메뉴 */}
        <div className="header-end">
          {/* 테마 전환 메뉴 */}
          <div className="theme-menu" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="theme-toggle linear-button-ghost"
              aria-label="테마 변경"
              aria-expanded={isThemeMenuOpen}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isDarkMode ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </>
                )}
              </svg>
            </button>
            
            {/* 테마 드롭다운 */}
            {isThemeMenuOpen && (
              <div className="linear-dropdown theme-dropdown">
                <div className="dropdown-header">
                  <h3>테마 선택</h3>
                  <button
                    onClick={toggleDarkMode}
                    className="linear-button-secondary"
                  >
                    {isDarkMode ? '라이트' : '다크'} 모드
                  </button>
                </div>
                <div className="theme-grid">
                  {themePreview.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`theme-option ${theme.id === currentTheme?.id ? 'active' : ''}`}
                      title={theme.description}
                    >
                      <div
                        className="theme-preview"
                        style={{
                          background: `linear-gradient(135deg, ${theme.preview.background} 0%, ${theme.preview.accent} 100%)`,
                        }}
                      />
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 사용자 메뉴 */}
          {user && (
            <div className="user-menu" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="user-avatar linear-button-ghost"
                aria-label="사용자 메뉴"
                aria-expanded={isUserMenuOpen}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              
              {/* 사용자 드롭다운 */}
              {isUserMenuOpen && (
                <div className="linear-dropdown user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-items">
                    {userMenuItems.map(renderUserMenuItem)}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 모바일 네비게이션 토글 */}
          {isMobile && (
            <button
              onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
              className="nav-toggle linear-button-ghost"
              aria-label="네비게이션 메뉴"
              aria-expanded={isNavMenuOpen}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* 모바일 네비게이션 메뉴 */}
      {isMobile && isNavMenuOpen && (
        <nav className="mobile-nav linear-animate-slide-down" ref={navMenuRef}>
          <div className="mobile-nav-items">
            {navItems.map(renderNavItem)}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;