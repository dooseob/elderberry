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
import './widgets/layout/ui/layout.css'

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