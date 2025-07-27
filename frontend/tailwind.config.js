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
        // 'elderberry' 테마 - 따뜻하고 평화로운 컬러 팔레트
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
        // 다크 모드용 고대비 색상
        'elderberry-dark': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        care: {
          green: '#10b981',
          blue: '#3b82f6',
          orange: '#f59e0b',
          red: '#ef4444',
          gray: '#6b7280',
        },
        // WCAG AA 준수 색상
        accessible: {
          'text-primary': '#1f2937', // 4.5:1 대비비
          'text-secondary': '#374151', // 4.5:1 대비비
          'text-muted': '#6b7280', // 4.5:1 대비비
          'bg-primary': '#ffffff',
          'bg-secondary': '#f9fafb',
          'border': '#d1d5db',
          'focus': '#3b82f6',
        },
      },
      fontFamily: {
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
      spacing: {
        // 44px 최소 터치 영역
        'touch': '2.75rem', // 44px
        'touch-sm': '2.5rem', // 40px
      },
    },
  },
  plugins: [
    // 접근성 플러그인
    function({ addBase, theme }) {
      addBase({
        // 포커스 링 스타일 개선
        '*:focus-visible': {
          outline: '2px solid',
          outlineColor: theme('colors.elderberry.500'),
          outlineOffset: '2px',
        },
        // 스크린 리더용 사리지만 시각적으로 숨김
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
        // 축소 애니메이션 비활성화 지원
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      });
    },
  ],
}