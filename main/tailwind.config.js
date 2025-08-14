/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 기존 다크 테마 유지
        'dark-bg': '#0a0a0a',
        'light-text': '#ffffff',
        'secondary-text': '#a1a1aa',
        'muted-text': '#71717a',
        'border-dark': '#27272a',
        
        // Elderberry 브랜드 컬러 추가
        'primary': '#29b79c',
        'primary-dark': '#20a085',
        'primary-light': '#29b79c',
        
        // 중성 컬러
        'text-main': '#111111',
        'text-secondary': '#333333',
        'text-muted': '#666666',
        'bg-light': '#f8f9fa',
        'border-light': '#e8e8e8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}