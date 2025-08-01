/**
 * MainLayout Component - Linear Design System
 * 레이아웃 전문가가 설계한 반응형 메인 레이아웃 컴포넌트
 * 
 * @version 2025.1.0
 * @author Layout 전문가 (Linear Design System)
 * 
 * Features:
 * - Linear 디자인 시스템 기반 메인 레이아웃
 * - 사이드바, 헤더, 메인 콘텐츠 영역 구성
 * - 완전한 반응형 디자인 (모바일, 태블릿, 데스크톱)
 * - 테마별 적응형 스타일
 * - 접근성 고려 (ARIA, 키보드 네비게이션)
 * - 엘더베리 프로젝트 브랜딩
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * 레이아웃 변형 타입
 */
export type LayoutVariant = 'default' | 'compact' | 'wide' | 'fullscreen';

/**
 * 사이드바 상태 타입
 */
export type SidebarState = 'open' | 'collapsed' | 'hidden';

/**
 * MainLayout Props
 */
export interface MainLayoutProps {
  /** 메인 콘텐츠 */
  children: React.ReactNode;
  /** 레이아웃 변형 */
  variant?: LayoutVariant;
  /** 사이드바 초기 상태 */
  initialSidebarState?: SidebarState;
  /** 헤더 표시 여부 */
  showHeader?: boolean;
  /** 사이드바 표시 여부 */
  showSidebar?: boolean;
  /** 푸터 표시 여부 */
  showFooter?: boolean;
  /** 사이드바 고정 여부 */
  sidebarFixed?: boolean;
  /** 헤더 고정 여부 */
  headerFixed?: boolean;
  /** 메인 콘텐츠 최대 너비 */
  maxWidth?: string;
  /** 커스텀 클래스 */
  className?: string;
  /** 사이드바 상태 변경 콜백 */
  onSidebarStateChange?: (state: SidebarState) => void;
  /** 레이아웃 변경 콜백 */
  onLayoutChange?: (variant: LayoutVariant) => void;
}

/**
 * 반응형 브레이크포인트
 */
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * MainLayout Component
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  variant = 'default',
  initialSidebarState = 'open',
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  sidebarFixed = true,
  headerFixed = true,
  maxWidth,
  className = '',
  onSidebarStateChange,
  onLayoutChange,
}) => {
  // Linear 테마 훅
  const { currentTheme, isDarkMode, isReducedMotion } = useLinearTheme();
  
  // 사이드바 상태 관리
  const [sidebarState, setSidebarState] = useState<SidebarState>(initialSidebarState);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // 반응형 감지
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width <= BREAKPOINTS.mobile;
      const newIsTablet = width <= BREAKPOINTS.tablet && width > BREAKPOINTS.mobile;
      
      setIsMobile(newIsMobile);
      setIsTablet(newIsTablet);
      
      // 모바일에서는 사이드바 자동 숨김
      if (newIsMobile && sidebarState === 'open') {
        setSidebarState('hidden');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarState]);
  
  // 사이드바 상태 변경 핸들러
  const handleSidebarStateChange = useCallback((newState: SidebarState) => {
    setSidebarState(newState);
    onSidebarStateChange?.(newState);
  }, [onSidebarStateChange]);
  
  // 사이드바 토글
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      // 모바일에서는 숨김/표시 토글
      setSidebarState(prev => prev === 'open' ? 'hidden' : 'open');
    } else {
      // 데스크톱에서는 펼침/접힘 토글
      setSidebarState(prev => prev === 'open' ? 'collapsed' : 'open');
    }
  }, [isMobile]);
  
  // 사이드바 오버레이 클릭
  const handleOverlayClick = useCallback(() => {
    if (isMobile && sidebarState === 'open') {
      setSidebarState('hidden');
    }
  }, [isMobile, sidebarState]);
  
  // 키보드 이벤트 (접근성)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape 키로 사이드바 닫기
      if (event.key === 'Escape' && isMobile && sidebarState === 'open') {
        setSidebarState('hidden');
      }
      
      // Alt + S로 사이드바 토글
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        toggleSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, sidebarState, toggleSidebar]);
  
  // 레이아웃 클래스 계산
  const layoutClasses = [
    'linear-main-layout',
    `layout-variant-${variant}`,
    sidebarState !== 'hidden' ? `sidebar-${sidebarState}` : 'sidebar-hidden',
    isDarkMode ? 'layout-dark' : 'layout-light',
    isMobile ? 'layout-mobile' : isTablet ? 'layout-tablet' : 'layout-desktop',
    headerFixed && 'header-fixed',
    sidebarFixed && 'sidebar-fixed',
    isReducedMotion && 'reduced-motion',
    className,
  ].filter(Boolean).join(' ');
  
  // 사이드바 표시 조건
  const shouldShowSidebar = showSidebar && sidebarState !== 'hidden';
  
  // 오버레이 표시 조건 (모바일에서 사이드바 열려있을 때)
  const shouldShowOverlay = isMobile && sidebarState === 'open';
  
  return (
    <div className={layoutClasses}>
      {/* 헤더 */}
      {showHeader && (
        <Header
          sidebarState={sidebarState}
          onToggleSidebar={toggleSidebar}
          variant={variant}
          isMobile={isMobile}
          fixed={headerFixed}
          className={headerFixed ? 'header-fixed' : ''}
        />
      )}
      
      {/* 사이드바 오버레이 (모바일) */}
      {shouldShowOverlay && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      
      {/* 메인 컨테이너 */}
      <div className="main-container">
        {/* 사이드바 */}
        {shouldShowSidebar && (
          <Sidebar
            state={sidebarState}
            onStateChange={handleSidebarStateChange}
            isMobile={isMobile}
            fixed={sidebarFixed}
            className={sidebarFixed ? 'sidebar-fixed' : ''}
          />
        )}
        
        {/* 메인 콘텐츠 */}
        <main
          className="main-content"
          style={maxWidth ? { maxWidth } : undefined}
          role="main"
          aria-label="메인 콘텐츠"
        >
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
      
      {/* 푸터 */}
      {showFooter && (
        <Footer
          variant={variant}
          className="main-footer"
        />
      )}
    </div>
  );
};

export default MainLayout;