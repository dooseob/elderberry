/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === Linear Design System Color Integration ===
        // Linear CSS 변수를 Tailwind에서 사용할 수 있도록 매핑
        linear: {
          // Background Colors
          'background': 'var(--linear-color-background)',
          'foreground': 'var(--linear-color-foreground)',
          'surface-elevated': 'var(--linear-color-surface-elevated)',
          'surface-input': 'var(--linear-color-surface-input)',
          'surface-panel': 'var(--linear-color-surface-panel)',
          'surface-modal': 'var(--linear-color-surface-modal)',
          'surface-dialog': 'var(--linear-color-surface-dialog)',
          
          // Accent Colors
          'accent': 'var(--linear-color-accent)',
          'accent-hover': 'var(--linear-color-accent-hover)',
          'accent-active': 'var(--linear-color-accent-active)',
          'accent-subtle': 'var(--linear-color-accent-subtle)',
          'accent-muted': 'var(--linear-color-accent-muted)',
          
          // Text Colors
          'text-primary': 'var(--linear-color-text-primary)',
          'text-secondary': 'var(--linear-color-text-secondary)',
          'text-tertiary': 'var(--linear-color-text-tertiary)',
          'text-on-accent': 'var(--linear-color-text-on-accent)',
          'text-inverse': 'var(--linear-color-text-inverse)',
          
          // Border Colors
          'border-subtle': 'var(--linear-color-border-subtle)',
          'border-default': 'var(--linear-color-border-default)',
          'border-strong': 'var(--linear-color-border-strong)',
          'border-input': 'var(--linear-color-border-input)',
          'border-focus': 'var(--linear-color-border-focus)',
          
          // State Colors
          'success': 'var(--linear-color-success)',
          'success-bg': 'var(--linear-color-success-bg)',
          'warning': 'var(--linear-color-warning)',
          'warning-bg': 'var(--linear-color-warning-bg)',
          'error': 'var(--linear-color-error)',
          'error-bg': 'var(--linear-color-error-bg)',
          'info': 'var(--linear-color-info)',
          'info-bg': 'var(--linear-color-info-bg)',
          
          // Icon Colors
          'icon-default': 'var(--linear-color-icon-default)',
          'icon-muted': 'var(--linear-color-icon-muted)',
          'icon-accent': 'var(--linear-color-icon-accent)',
          
          // Control Colors
          'control-default': 'var(--linear-color-control-default)',
          'control-hover': 'var(--linear-color-control-hover)',
          'control-active': 'var(--linear-color-control-active)',
        },
        
        // Legacy colors (유지하되 Linear 시스템 우선 권장)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        elderberry: {
          25: '#fefcfb',
          50: '#f8f5f3',
          100: '#f0e8e3',
          200: '#e3d1c8',
          300: '#d2b5a6',
          400: '#bd9282',
          500: '#a67465',
          600: '#8b5a4b',
          700: '#70463a',
          800: '#5a3730',
          900: '#4a2f2a',
        },
      },
      fontFamily: {
        // Linear 디자인 시스템 폰트
        'linear': 'var(--linear-font-family)',
        'noto': ['Noto Sans KR', 'sans-serif'],
        'pretendard': ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        // 접근성을 위한 최소 타깃 크기 44px 보장
        'touch-target': ['1rem', { lineHeight: '2.75rem' }],
      },
      fontWeight: {
        'linear-normal': 'var(--linear-font-weight-normal)',
        'linear-medium': 'var(--linear-font-weight-medium)',
        'linear-semibold': 'var(--linear-font-weight-semibold)',
        'linear-bold': 'var(--linear-font-weight-bold)',
      },
      lineHeight: {
        'linear-tight': 'var(--linear-line-height-tight)',
        'linear-normal': 'var(--linear-line-height-normal)',
        'linear-relaxed': 'var(--linear-line-height-relaxed)',
      },
      spacing: {
        // Linear 스페이싱 시스템
        'linear-xs': 'var(--linear-spacing-xs)',
        'linear-sm': 'var(--linear-spacing-sm)',
        'linear-md': 'var(--linear-spacing-md)',
        'linear-lg': 'var(--linear-spacing-lg)',
        'linear-xl': 'var(--linear-spacing-xl)',
        'linear-2xl': 'var(--linear-spacing-2xl)',
        'linear-3xl': 'var(--linear-spacing-3xl)',
        'linear-4xl': 'var(--linear-spacing-4xl)',
        'linear-5xl': 'var(--linear-spacing-5xl)',
        
        // 접근성을 위한 최소 터치 영역
        'touch': '2.75rem', // 44px
        'touch-sm': '2.5rem', // 40px
      },
      borderRadius: {
        // Linear 보더 반지름
        'linear-small': 'var(--linear-radius-small)',
        'linear-medium': 'var(--linear-radius-medium)',
        'linear-large': 'var(--linear-radius-large)',
        'linear-full': 'var(--linear-radius-full)',
      },
      boxShadow: {
        // Linear 그림자 시스템
        'linear-card': 'var(--linear-shadow-card)',
        'linear-modal': 'var(--linear-shadow-modal)',
        'linear-dropdown': 'var(--linear-shadow-dropdown)',
        'linear-focus': 'var(--linear-shadow-focus)',
      },
      transitionDuration: {
        // Linear 트랜지션
        'linear-fast': 'var(--linear-transition-fast)',
        'linear-normal': 'var(--linear-transition-normal)',
        'linear-slow': 'var(--linear-transition-slow)',
      },
      zIndex: {
        // Linear Z-Index 스케일
        'linear-dropdown': 'var(--linear-z-dropdown)',
        'linear-modal': 'var(--linear-z-modal)',
        'linear-tooltip': 'var(--linear-z-tooltip)',
        'linear-toast': 'var(--linear-z-toast)',
      },
    },
  },
  plugins: [
    // Linear 디자인 시스템 통합 플러그인
    function({ addBase, addUtilities, theme }) {
      addBase({
        // Linear 폰트 및 기본 스타일
        'body': {
          fontFamily: 'var(--linear-font-family)',
          backgroundColor: 'var(--linear-color-background)',
          color: 'var(--linear-color-text-primary)',
          lineHeight: 'var(--linear-line-height-normal)',
          transition: 'background-color var(--linear-transition-fast), color var(--linear-transition-fast)',
        },
        
        // Linear 포커스 링 스타일
        '*:focus-visible': {
          outline: '2px solid var(--linear-color-accent)',
          outlineOffset: '2px',
          boxShadow: 'var(--linear-shadow-focus)',
        },
        
        // 스크린 리더 전용
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        
        // 포커스 시에만 보이기
        '.sr-only:focus, .focus\\:not-sr-only:focus': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: 'inherit',
          margin: 'inherit',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
        
        // 접근성: 감소된 모션 지원
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      });

      // Linear 유틸리티 클래스 추가
      addUtilities({
        // Linear 표면 스타일
        '.linear-surface': {
          backgroundColor: 'var(--linear-color-background)',
          color: 'var(--linear-color-text-primary)',
        },
        '.linear-surface-elevated': {
          backgroundColor: 'var(--linear-color-surface-elevated)',
          color: 'var(--linear-color-text-primary)',
        },
        '.linear-surface-panel': {
          backgroundColor: 'var(--linear-color-surface-panel)',
          color: 'var(--linear-color-text-primary)',
        },
        
        // Linear 액센트 스타일
        '.linear-accent': {
          backgroundColor: 'var(--linear-color-accent)',
          color: 'var(--linear-color-text-on-accent)',
        },
        '.linear-accent-subtle': {
          backgroundColor: 'var(--linear-color-accent-subtle)',
          color: 'var(--linear-color-accent)',
        },
        
        // Linear 텍스트 색상
        '.linear-text-primary': {
          color: 'var(--linear-color-text-primary)',
        },
        '.linear-text-secondary': {
          color: 'var(--linear-color-text-secondary)',
        },
        '.linear-text-tertiary': {
          color: 'var(--linear-color-text-tertiary)',
        },
        '.linear-text-accent': {
          color: 'var(--linear-color-accent)',
        },
        
        // Linear 보더 스타일
        '.linear-border': {
          borderColor: 'var(--linear-color-border-default)',
        },
        '.linear-border-subtle': {
          borderColor: 'var(--linear-color-border-subtle)',
        },
        '.linear-border-strong': {
          borderColor: 'var(--linear-color-border-strong)',
        },
        
        // Linear 상태 스타일
        '.linear-success': {
          backgroundColor: 'var(--linear-color-success-bg)',
          color: 'var(--linear-color-success)',
          borderColor: 'var(--linear-color-success)',
        },
        '.linear-warning': {
          backgroundColor: 'var(--linear-color-warning-bg)',
          color: 'var(--linear-color-warning)',
          borderColor: 'var(--linear-color-warning)',
        },
        '.linear-error': {
          backgroundColor: 'var(--linear-color-error-bg)',
          color: 'var(--linear-color-error)',
          borderColor: 'var(--linear-color-error)',
        },
        '.linear-info': {
          backgroundColor: 'var(--linear-color-info-bg)',
          color: 'var(--linear-color-info)',
          borderColor: 'var(--linear-color-info)',
        },
        
        // Linear 애니메이션 클래스
        '.linear-animate-in': {
          animation: 'linear-fade-in var(--linear-transition-fast) ease-out',
        },
        '.linear-animate-scale': {
          transition: 'transform var(--linear-transition-fast) ease-out',
        },
        '.linear-animate-scale:hover': {
          transform: 'scale(1.02)',
        },
        '.linear-animate-scale:active': {
          transform: 'scale(0.98)',
        },
        
        // Linear 컴포넌트 기본 스타일
        '.linear-button': {
          borderRadius: 'var(--linear-radius-medium)',
          padding: 'var(--linear-spacing-sm) var(--linear-spacing-lg)',
          fontWeight: 'var(--linear-font-weight-medium)',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all var(--linear-transition-fast)',
          border: 'none',
        },
        '.linear-input': {
          backgroundColor: 'var(--linear-color-surface-input)',
          border: '1px solid var(--linear-color-border-input)',
          borderRadius: 'var(--linear-radius-medium)',
          padding: 'var(--linear-spacing-sm) var(--linear-spacing-md)',
          color: 'var(--linear-color-text-primary)',
          fontSize: '14px',
          transition: 'all var(--linear-transition-fast)',
          width: '100%',
        },
        '.linear-input:focus': {
          outline: 'none',
          borderColor: 'var(--linear-color-accent)',
          boxShadow: 'var(--linear-shadow-focus)',
        },
        '.linear-card': {
          backgroundColor: 'var(--linear-color-surface-elevated)',
          border: '1px solid var(--linear-color-border-subtle)',
          borderRadius: 'var(--linear-radius-medium)',
          padding: 'var(--linear-spacing-lg)',
          boxShadow: 'var(--linear-shadow-card)',
          transition: 'all var(--linear-transition-fast)',
        },
        
        // Linear 스크롤바 스타일
        '.linear-scrollbar::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.linear-scrollbar::-webkit-scrollbar-track': {
          background: 'var(--linear-color-surface-panel)',
        },
        '.linear-scrollbar::-webkit-scrollbar-thumb': {
          background: 'var(--linear-color-border-default)',
          borderRadius: 'var(--linear-radius-full)',
        },
        '.linear-scrollbar::-webkit-scrollbar-thumb:hover': {
          background: 'var(--linear-color-border-strong)',
        },
      });
    },
  ],
}