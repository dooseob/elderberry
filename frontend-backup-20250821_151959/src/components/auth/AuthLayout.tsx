/**
 * AuthLayout - Linear 테마 인증 레이아웃 컴포넌트
 * 로그인/회원가입 전용 레이아웃 - 레이아웃 전문가가 설계
 * 
 * @version 2025.1.0
 * @author 레이아웃 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 테마 CSS 클래스 완전 적용
 * - 엘더베리 브랜딩 및 로고
 * - 반응형 디자인 (모바일/태블릿/데스크톱)
 * - 백그라운드 그라디언트 테마 연동
 * - 접근성 개선 (스크린 리더, 키보드 네비게이션)
 * - 로딩 상태 및 애니메이션 지원
 * - SEO 최적화
 * - 다크/라이트 모드 완전 지원
 * - Linear의 미니멀 디자인 철학 반영
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Moon, Sun, Sparkles } from 'lucide-react';
// import { useLinearTheme } from '../../hooks/useLinearTheme';
import { useLinearTheme } from '../../hooks/useLinearTheme.simple';
import { Button } from '../../shared/ui';
import { cn } from '../../lib/utils';

/**
 * AuthLayout Props
 */
export interface AuthLayoutProps {
  /** 메인 콘텐츠 */
  children: React.ReactNode;
  
  /** 페이지 제목 */
  title?: string;
  
  /** 페이지 부제목 */
  subtitle?: string;
  
  /** 뒤로 가기 링크 */
  backLink?: string;
  
  /** 홈으로 가기 버튼 표시 */
  showHomeLink?: boolean;
  
  /** 테마 토글 버튼 표시 */
  showThemeToggle?: boolean;
  
  /** 로딩 상태 */
  loading?: boolean;
  
  /** 푸터 표시 */
  showFooter?: boolean;
  
  /** 브랜딩 표시 */
  showBranding?: boolean;
  
  /** 배경 변형 */
  backgroundVariant?: 'gradient' | 'solid' | 'subtle';
  
  /** 커스텀 클래스 */
  className?: string;
  
  /** 테스트 ID */
  testId?: string;
}

/**
 * 엘더베리 로고 컴포넌트
 */
const ElderberryLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-[var(--linear-radius-large)]',
      'bg-gradient-to-br from-[var(--linear-color-accent)] to-[var(--linear-color-accent-hover)]',
      'text-[var(--linear-color-text-on-accent)] shadow-[var(--linear-shadow-card)]',
      sizeClasses[size]
    )}>
      <Sparkles className="w-1/2 h-1/2" />
    </div>
  );
};

/**
 * AuthLayout Component
 * Linear 테마 시스템과 완전 통합된 인증 레이아웃
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  backLink,
  showHomeLink = true,
  showThemeToggle = true,
  loading = false,
  showFooter = true,
  showBranding = true,
  backgroundVariant = 'gradient',
  className,
  testId = 'auth-layout',
}) => {
  // Linear 테마 훅 사용
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isReducedMotion,
    currentTheme,
  } = useLinearTheme();

  // 배경 스타일 계산
  const backgroundClasses = React.useMemo(() => {
    const base = 'min-h-screen transition-all duration-[var(--linear-transition-slow)]';
    
    switch (backgroundVariant) {
      case 'gradient':
        return cn(
          base,
          'bg-gradient-to-br from-[var(--linear-color-background)] via-[var(--linear-color-surface-elevated)] to-[var(--linear-color-surface-panel)]'
        );
      case 'solid':
        return cn(base, 'bg-[var(--linear-color-background)]');
      case 'subtle':
        return cn(
          base,
          'bg-[var(--linear-color-background)]',
          'relative',
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-[var(--linear-color-accent-subtle)] before:via-transparent before:to-[var(--linear-color-accent-subtle)] before:opacity-30'
        );
      default:
        return cn(base, 'bg-[var(--linear-color-background)]');
    }
  }, [backgroundVariant]);

  // 로딩 오버레이
  if (loading) {
    return (
      <div className={cn(backgroundClasses, 'flex items-center justify-center')}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--linear-color-accent)] mx-auto"></div>
          <p className="text-[var(--linear-color-text-secondary)] text-sm">
            로딩 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(backgroundClasses, className)} 
      data-testid={testId}
    >
      {/* 헤더 네비게이션 */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        {/* 왼쪽: 뒤로가기 / 홈 버튼 */}
        <div className="flex items-center gap-2">
          {backLink && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="뒤로 가기"
            >
              <Link to={backLink}>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          )}
          
          {showHomeLink && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="홈으로 가기"
            >
              <Link to="/">
                <Home className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* 오른쪽: 테마 토글 */}
        {showThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="transition-transform hover:scale-105"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        )}
      </header>

      {/* 메인 콘텐츠 영역 - 반응형 최적화 */}
      <main className="flex-1 flex items-start justify-center px-4 py-2 sm:py-4 min-h-0 overflow-y-auto">
        <div className="w-full max-w-md space-y-3 sm:space-y-4 mt-1 sm:mt-2">
          {/* 브랜딩 섹션 (모바일 최적화) */}
          {showBranding && (
            <div 
              className={cn(
                'text-center space-y-1 sm:space-y-2',
                !isReducedMotion && 'linear-animate-in'
              )}
            >
              {/* 로고 */}
              <div className="flex justify-center">
                <ElderberryLogo size="sm" className="sm:hidden" />
                <ElderberryLogo size="md" className="hidden sm:block" />
              </div>
              
              {/* 브랜드명 */}
              <div className="space-y-0.5 sm:space-y-1">
                <h1 className="text-lg sm:text-xl font-[var(--linear-font-weight-bold)] text-[var(--linear-color-text-primary)]">
                  엘더베리
                </h1>
              </div>
            </div>
          )}

          {/* 페이지 제목 (모바일 최적화) */}
          {(title || subtitle) && (
            <div 
              className={cn(
                'text-center space-y-0.5 sm:space-y-1',
                !isReducedMotion && 'linear-animate-in linear-animate-delay-1'
              )}
            >
              {title && (
                <h2 className="text-base sm:text-lg font-[var(--linear-font-weight-semibold)] text-[var(--linear-color-text-primary)]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-[var(--linear-color-text-secondary)]">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* 메인 콘텐츠 카드 (모바일 최적화) */}
          <div 
            className={cn(
              'bg-[var(--linear-color-surface-modal)] border border-[var(--linear-color-border-subtle)]',
              'rounded-[var(--linear-radius-large)] p-4 sm:p-6 shadow-[var(--linear-shadow-modal)]',
              'backdrop-blur-sm',
              !isReducedMotion && 'linear-animate-in linear-animate-delay-2'
            )}
          >
            {children}
            
            {/* 홈으로 돌아가기 링크 (모바일에서 좋을 때만 표시) */}
            <div className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--linear-color-border-subtle)]">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs hover:bg-[var(--linear-color-surface-secondary)] transition-colors"
              >
                <Link to="/" className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      {showFooter && (
        <footer 
          className={cn(
            'relative z-10 p-4 text-center border-t border-[var(--linear-color-border-subtle)]',
            'bg-[var(--linear-color-surface-elevated)]/80 backdrop-blur-sm'
          )}
        >
          <div className="space-y-3">
            {/* 도움말 링크 */}
            <div className="flex justify-center gap-6 text-sm">
              <Link 
                to="/help" 
                className="text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-accent)] transition-colors"
              >
                도움말
              </Link>
              <Link 
                to="/privacy" 
                className="text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-accent)] transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link 
                to="/terms" 
                className="text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-accent)] transition-colors"
              >
                이용약관
              </Link>
            </div>
            
            {/* 저작권 */}
            <p className="text-xs text-[var(--linear-color-text-tertiary)]">
              © 2025 엘더베리(Elderberry). All rights reserved.
            </p>
          </div>
        </footer>
      )}

      {/* 접근성을 위한 숨겨진 skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--linear-color-accent)] text-[var(--linear-color-text-on-accent)] px-4 py-2 rounded-[var(--linear-radius-medium)] z-50"
      >
        메인 콘텐츠로 건너뛰기
      </a>
    </div>
  );
};

// === 유틸리티 함수들 ===

/**
 * 현재 페이지에 따른 기본 제목 반환
 */
export const getAuthPageTitle = (pathname: string): { title: string; subtitle: string } => {
  switch (pathname) {
    case '/login':
      return {
        title: '로그인',
        subtitle: '계정에 로그인하여 서비스를 이용하세요',
      };
    case '/register':
      return {
        title: '회원가입',
        subtitle: '새 계정을 만들어 엘더베리를 시작하세요',
      };
    case '/forgot-password':
      return {
        title: '비밀번호 찾기',
        subtitle: '등록된 이메일로 비밀번호 재설정 링크를 보내드립니다',
      };
    case '/reset-password':
      return {
        title: '비밀번호 재설정',
        subtitle: '새로운 비밀번호를 설정해주세요',
      };
    default:
      return {
        title: '인증',
        subtitle: '계속하려면 인증이 필요합니다',
      };
  }
};

/**
 * 반응형 레이아웃 클래스 계산
 */
export const getResponsiveAuthClasses = (isMobile?: boolean) => {
  return cn(
    // 기본 반응형
    'w-full max-w-md mx-auto',
    // 모바일 특별 처리
    isMobile && 'max-w-sm px-4',
    // 태블릿/데스크톱
    'sm:max-w-md md:max-w-lg lg:max-w-md'
  );
};

/**
 * 접근성 향상을 위한 props 생성
 */
export const getAuthAccessibilityProps = (pageType: 'login' | 'register' | 'forgot-password') => {
  const roleDescriptions = {
    login: '로그인 페이지',
    register: '회원가입 페이지',
    'forgot-password': '비밀번호 찾기 페이지',
  };

  return {
    role: 'main',
    'aria-label': roleDescriptions[pageType],
    'aria-live': 'polite',
  };
};

export default AuthLayout;

// === JSDoc 사용 예시 ===
/**
 * @example
 * // 기본 사용법
 * <AuthLayout title="로그인" subtitle="계정에 로그인하세요">
 *   <LoginForm />
 * </AuthLayout>
 * 
 * // 커스터마이징
 * <AuthLayout
 *   backgroundVariant="gradient"
 *   showThemeToggle={true}
 *   backLink="/dashboard"
 *   showFooter={false}
 * >
 *   <RegisterForm />
 * </AuthLayout>
 * 
 * // 로딩 상태
 * <AuthLayout loading={true} />
 */