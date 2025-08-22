/**
 * React 앱 진입점
 * Vite + React 18 기반 + Linear Theme System 통합 + 조건부 Clerk 인증
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

// Clerk 사용 여부 확인
const useClerkAuth = import.meta.env.VITE_USE_CLERK_AUTH === 'true'
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Clerk 사용 시에만 유효성 검사
if (useClerkAuth && (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'your_clerk_publishable_key_here')) {
  console.warn('Clerk authentication is enabled but no valid publishable key is provided. Falling back to JWT authentication.')
}

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

// React 18 루트 생성 및 렌더링 - 조건부 Clerk Provider
const AppWrapper = () => {
  if (useClerkAuth && PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'your_clerk_publishable_key_here') {
    // Clerk 인증 사용 시 동적 import
    const ClerkProviderLazy = React.lazy(() => 
      import('@clerk/clerk-react').then(module => ({ 
        default: ({ children, publishableKey }: any) => 
          React.createElement(module.ClerkProvider, { publishableKey }, children)
      }))
    )
    
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ClerkProviderLazy publishableKey={PUBLISHABLE_KEY}>
          <ThemeProvider 
            enableSystemTheme={true}
            enableAnimations={true}
            storageKey="elderberry-linear-theme"
          >
            <App />
          </ThemeProvider>
        </ClerkProviderLazy>
      </React.Suspense>
    )
  }
  
  // 기본 JWT 인증 사용 (Clerk 미사용)
  return (
    <ThemeProvider 
      enableSystemTheme={true}
      enableAnimations={true}
      storageKey="elderberry-linear-theme"
    >
      <App />
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)