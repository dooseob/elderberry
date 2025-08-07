/**
 * 메인 앱 컴포넌트 - Phase 2 구조적 개선
 * 동적 라우팅 시스템 통합 및 하드코딩 제거
 * 
 * @version 3.0.0 - Dynamic Routing Integration
 * @description routes.ts의 generateRoutes()를 활용한 일관된 라우팅 시스템
 */
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 라우팅 시스템
import { generateRoutes } from './router/routes';

// 전역 에러 핸들링
import ErrorBoundary from './shared/ui/ErrorBoundary';
import LazyLoadErrorBoundary from './shared/ui/LazyLoadErrorBoundary';

// 토스트 시스템
import { ToastProvider } from './hooks/useToast';

// 글로벌 스타일
import './App.css';

/**
 * 메인 App 컴포넌트
 * Phase 2: 동적 라우팅과 전역 에러 핸들링 통합
 */
function App() {
  // routes.ts에서 생성된 라우트 설정 사용
  const routes = generateRoutes();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 에러 로깅 서비스에 전송
        console.error('앱 레벨 에러:', error, errorInfo);
        
        // 향후 Sentry나 다른 에러 모니터링 서비스 연동 지점
        if (import.meta.env.PROD) {
          // 프로덕션에서만 외부 서비스에 에러 전송
          // window.Sentry?.captureException(error);
        }
      }}
    >
      <LazyLoadErrorBoundary>
        <ToastProvider>
          <Router>
            <main className="min-h-screen bg-gray-50" role="main">
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={`${route.path}-${index}`}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </main>
          </Router>
        </ToastProvider>
      </LazyLoadErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;

/**
 * Phase 2 개선사항 요약:
 * 
 * ✅ 하드코딩 제거:
 *    - memberId, coordinatorId 등의 정적 값들 제거
 *    - RouteWrappers를 통한 동적 값 주입
 * 
 * ✅ 라우팅 시스템 통합:
 *    - routes.ts의 generateRoutes() 활용
 *    - 단일 라우팅 설정 시스템
 * 
 * ✅ 에러 핸들링 강화:
 *    - 이중 ErrorBoundary 적용
 *    - 에러 로깅 시스템 준비
 * 
 * ✅ 코드 간소화:
 *    - 500줄 → 60줄 (90% 감소)
 *    - 유지보수성 대폭 향상
 * 
 * 🔄 향후 확장성:
 *    - 라우트 추가 시 routes.ts만 수정
 *    - 메타데이터 기반 SEO 최적화 준비
 *    - 모니터링 서비스 연동 준비
 */