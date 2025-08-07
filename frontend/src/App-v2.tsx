/**
 * 메인 앱 컴포넌트 - 단순화된 구조
 * Elderberry 글로벌 요양원 구인구직 서비스
 * 
 * @version 2.0.0 - Simplified Structure
 * @description 복잡한 라우팅 로직을 분리하고 핵심 기능에 집중
 */
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 라우팅 설정
import { generateRoutes } from './router/routes';

// 글로벌 컨텍스트 및 에러 처리
import LazyPageFallback from './shared/ui/LazyPageFallback';
import LazyLoadErrorBoundary from './shared/ui/LazyLoadErrorBoundary';
import { ToastProvider } from './hooks/useToast';

import './App.css';

function App() {
  const routes = generateRoutes();

  return (
    <LazyLoadErrorBoundary>
      <ToastProvider>
        <Router>
          <main className="min-h-screen bg-gray-50" role="main">
            <Suspense fallback={<LazyPageFallback type="spinner" message="페이지를 로딩 중..." />}>
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={route.path || index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </Suspense>
          </main>
        </Router>
      </ToastProvider>
    </LazyLoadErrorBoundary>
  );
}

export default App;