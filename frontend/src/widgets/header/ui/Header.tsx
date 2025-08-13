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

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentTheme } from '../../../hooks/useLinearTheme';
import { useAuthStore } from '../../../stores/authStore';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../../hooks/useLanguage';
import { NotificationBell, NotificationPanel } from '../../notification';
import type { LayoutVariant, SidebarState } from './MainLayout';
import './header-styles.css';

/**
 * 지원 언어 타입
 */
export type SupportedLanguage = 'ko' | 'en' | 'zh';

/**
 * 언어 옵션 인터페이스
 */
export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

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

// SUPPORTED_LANGUAGES는 이제 useLanguage 훅에서 import

/**
 * 기본 네비게이션 메뉴 (비로그인 상태)
 */
const DEFAULT_PUBLIC_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
  },
  {
    id: 'facilities',
    label: '시설 찾기',
    href: '/facility-search',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )
  },
  {
    id: 'health',
    label: '건강 평가',
    href: '/health-assessment',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )
  },
  {
    id: 'community',
    label: '커뮤니티',
    href: '/boards',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    id: 'about',
    label: '소개',
    href: '/about',
  },
];

/**
 * 로그인 상태 네비게이션 메뉴
 */
const DEFAULT_AUTH_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    )
  },
  {
    id: 'facilities',
    label: '시설 찾기',
    href: '/facility-search',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )
  },
  {
    id: 'health',
    label: '건강 평가',
    href: '/health-assessment',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )
  },
  {
    id: 'chat',
    label: '채팅',
    href: '/chat-rooms',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    id: 'boards',
    label: '커뮤니티',
    href: '/boards',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    id: 'jobs',
    label: '구인구직',
    href: '/jobs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  },
];

/**
 * Header Component - React.memo로 최적화
 */
const Header: React.FC<HeaderProps> = memo(({
  sidebarState,
  onToggleSidebar,
  variant = 'default',
  isMobile = false,
  fixed = true,
  navItems,
  userMenuItems = [],
  user: propUser,
  onLogoClick,
  className = '',
}) => {
  // 인증 상태 및 사용자 정보
  const { isAuthenticated, user: storeUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 사용자 정보는 props 우선, 없으면 store에서 가져오기
  const user = propUser || storeUser;
  
  // 헤더는 글로벌 액션에 집중 - 메인 네비게이션은 사이드바에서 담당
  const effectiveNavItems = navItems || [];
  
  // 현재 경로에 따른 active 상태 설정
  const navItemsWithActive = effectiveNavItems.map(item => ({
    ...item,
    active: location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
  }));
  // Linear 테마 훅
  const {
    isDark: isDarkMode,
    isHighContrast,
    isReducedMotion,
  } = useCurrentTheme();
  
  // 언어 관리 훅
  const { currentLanguage, setLanguage, getCurrentLanguageOption, t } = useLanguage();
  
  // 상태 관리
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
  // Refs
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  
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
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
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
  
  // 테마 변경 핸들러 (임시 비활성화)
  const handleThemeChange = useCallback((themeId: string) => {
    console.log('테마 변경:', themeId);
    setIsThemeMenuOpen(false);
  }, []);
  
  // 언어 변경 핸들러 (실제 동작하는 버전)
  const handleLanguageChange = useCallback((languageCode: SupportedLanguage) => {
    setLanguage(languageCode);
    setIsLanguageMenuOpen(false);
    
    // 성공 피드백 (선택적)
    if (window.confirm) {
      // 간단한 확인 메시지 (실제 프로덕션에서는 toast나 다른 UI 사용)
      const languageOption = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
      console.log(`🌐 언어가 ${languageOption?.nativeName}로 변경되었습니다.`);
    }
  }, [setLanguage]);
  
  // 로고 클릭 핸들러
  const handleLogoClick = useCallback(() => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/');
    }
  }, [onLogoClick, navigate]);
  
  // 로그아웃 핸들러
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  }, [logout, navigate]);
  
  // 기본 사용자 메뉴 아이템들 (로그인 상태)
  const defaultUserMenuItems: UserMenuItem[] = isAuthenticated && user ? [
    {
      id: 'profile',
      label: '내 프로필',
      onClick: () => navigate('/mypage'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      id: 'notifications',
      label: '알림',
      onClick: () => navigate('/notifications'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: '설정',
      onClick: () => navigate('/settings'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
    {
      id: 'logout',
      label: '로그아웃',
      onClick: handleLogout,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
      divider: true,
      danger: true
    }
  ] : [];
  
  // 최종 사용자 메뉴 아이템들
  const finalUserMenuItems = userMenuItems.length > 0 ? userMenuItems : defaultUserMenuItems;
  
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
    <button
      key={item.id}
      onClick={() => navigate(item.href)}
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
    </button>
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
    <header className={headerClasses} style={{
      backgroundColor: 'var(--linear-color-surface-elevated)',
      background: 'var(--linear-color-surface-elevated)',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      opacity: 1,
      isolation: 'isolate',
      filter: 'none',
      mixBlendMode: 'normal',
      zIndex: 100
    }}>
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
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
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
              {navItemsWithActive.map(renderNavItem)}
            </div>
          </nav>
        )}
        
        {/* 오른쪽 영역: 알림 + 테마 토글 + 사용자 메뉴 */}
        <div className="header-end">
          {/* 알림 벨 임시 비활성화 - 무한 루프 문제 해결 중 */}
          {isAuthenticated && false && (
            <div className="notification-wrapper">
              <NotificationBell />
              <NotificationPanel />
            </div>
          )}

          {/* 언어 선택 메뉴 */}
          <div className="language-menu" ref={languageMenuRef}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="language-toggle linear-button-ghost"
              aria-label="언어 선택"
              aria-expanded={isLanguageMenuOpen}
              title="Select Language / 언어 선택"
            >
              <span className="language-flag">
                {getCurrentLanguageOption().flag}
              </span>
              <span className="language-code">
                {currentLanguage.toUpperCase()}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`language-chevron ${isLanguageMenuOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
            
            {/* 언어 드롭다운 */}
            {isLanguageMenuOpen && (
              <div className="linear-dropdown language-dropdown">
                <div className="dropdown-header">
                  <h3>Select Language</h3>
                </div>
                <div className="language-options">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`language-option ${language.code === currentLanguage ? 'active' : ''}`}
                      title={`Switch to ${language.name}`}
                    >
                      <span className="language-flag">{language.flag}</span>
                      <div className="language-info">
                        <span className="language-name">{language.name}</span>
                        <span className="language-native">{language.nativeName}</span>
                      </div>
                      {language.code === currentLanguage && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="check-icon"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
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
                    onClick={() => console.log('다크모드 토글 (임시 비활성화)')}
                    className="linear-button-secondary"
                  >
                    {isDarkMode ? '라이트' : '다크'} 모드
                  </button>
                </div>
                <div className="theme-grid">
                  {[].map((theme: any) => (
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
          
          {/* 인증 상태에 따른 메뉴 */}
          {isAuthenticated && user ? (
            /* 로그인 상태: 사용자 메뉴 */
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
                    {finalUserMenuItems.map(renderUserMenuItem)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 비로그인 상태: Sign In/Sign Up 버튼 */
            <div className="auth-buttons">
              <button
                onClick={() => navigate('/auth/signin')}
                className="linear-button-ghost auth-signin-btn"
                title="Sign in to your account"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth/signup')}
                className="linear-button-primary auth-signup-btn"
                title="Create a new account"
              >
                Sign Up
              </button>
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
            {navItemsWithActive.map(renderNavItem)}
            {/* 모바일에서 비로그인 상태일 때 로그인/회원가입 버튼 */}
            {!isAuthenticated && (
              <div className="mobile-auth-buttons">
                <button
                  onClick={() => {
                    navigate('/auth/signin');
                    setIsNavMenuOpen(false);
                  }}
                  className="linear-button-ghost w-full mobile-auth-btn"
                  title="Sign in to your account"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/auth/signup');
                    setIsNavMenuOpen(false);
                  }}
                  className="linear-button-primary w-full mt-2 mobile-auth-btn"
                  title="Create a new account"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
});

export default Header;