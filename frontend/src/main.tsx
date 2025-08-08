/**
 * React 앱 진입점
 * Vite + React 18 기반 + Linear Theme System 통합
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './components/theme/ThemeProvider.tsx'

// 전역 스타일 불러오기
import './App.css'
import './styles/animations.css'
import './styles/linear-theme.css'
import './styles/fonts.css'
import './widgets/layout/ui/layout.css'

// React DevTools 경고 숨기기 (개발 환경에서만)
if (import.meta.env.MODE === 'development') {
  // React DevTools 설치 권장 메시지 억제
  if (typeof window !== 'undefined') {
    // React DevTools 메시지를 출력하는 console.info를 임시로 무음처리
    const originalConsoleInfo = console.info;
    console.info = (...args: any[]) => {
      // React DevTools 메시지만 필터링
      if (args[0]?.includes?.('Download the React DevTools')) {
        return; // React DevTools 메시지는 출력하지 않음
      }
      originalConsoleInfo.apply(console, args);
    };
  }
}

// React 18 루트 생성 및 렌더링
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider 
      enableSystemTheme={true}
      enableAnimations={true}
      storageKey="elderberry-linear-theme"
    >
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)