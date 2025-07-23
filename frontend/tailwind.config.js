/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        care: {
          green: '#10b981',
          blue: '#3b82f6',
          orange: '#f59e0b',
          red: '#ef4444',
          gray: '#6b7280',
        }
      },
      fontFamily: {
        'noto': ['Noto Sans KR', 'sans-serif'],
        'pretendard': ['Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
}