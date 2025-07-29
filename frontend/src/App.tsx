/**
 * 메인 앱 컴포넌트
 * Elderberry 글로벌 요양원 구인구직 서비스
 * React.lazy()를 활용한 페이지 레벨 지연 로딩 구현
 */
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 개발용 로거
import { devLogger } from './utils/devLogger';

// 인증 관련 컴포넌트 (즉시 로딩 - 보안상 중요)
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// 레이아웃 컴포넌트 (즉시 로딩 - 모든 페이지에서 사용)
import MainLayout from './components/layout/MainLayout';

// 로딩 폴백 컴포넌트
import LazyPageFallback from './components/ui/LazyPageFallback';
import LazyLoadErrorBoundary from './components/ui/LazyLoadErrorBoundary';

// 토스트 컨텍스트 프로바이더
import { ToastProvider } from './hooks/useToast';

// 지연 로딩 페이지 컴포넌트들
import {
  LazyLoginPage,
  LazyRegisterPage,
  LazyDashboardPage,
  LazyMyPage,
  LazyUnauthorizedPage,
  LazyHealthAssessmentWizard,
  LazyFacilitySearchPage,
  LazyChatHomePage,
  LazyChatPage,
  LazyBoardListPage,
  LazyPostDetailPage,
  LazyPostCreatePage,
  LazyProfileListPage,
  LazyProfileDetailPage,
  LazyNotificationsPage
} from './utils/lazyImports';

import './App.css';

function App() {
  return (
    <LazyLoadErrorBoundary>
      <ToastProvider>
        <Router>
          <main className="min-h-screen bg-gray-50" role="main">
          <Suspense fallback={<LazyPageFallback type="spinner" message="로그인 페이지를 로딩 중..." />}>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login" element={<LazyLoginPage />} />
            <Route path="/register" element={<LazyRegisterPage />} />
            <Route path="/unauthorized" element={<LazyUnauthorizedPage />} />
            
            {/* 챗봇 (인증 없이 사용 가능) */}
            <Route path="/chat-home" element={<LazyChatHomePage />} />
            <Route path="/chat" element={<LazyChatPage />} />
          
            {/* 보호된 라우트 */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                      <LazyDashboardPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/mypage" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                      <LazyMyPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <LazyNotificationsPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          
            <Route 
              path="/health-assessment" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                      <LazyHealthAssessmentWizard 
                        memberId="1" 
                        onComplete={(assessmentId) => {
                          devLogger.action('건강 평가 완료', { assessmentId });
                          window.location.href = '/facility-search';
                        }}
                        onCancel={() => {
                          devLogger.action('건강 평가 취소');
                        }}
                      />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          
            <Route 
              path="/facility-search" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <LazyFacilitySearchPage 
                        memberId={1}
                        coordinatorId="coordinator-1"
                        showRecommendations={true}
                      />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* 게시판 라우트 */}
            <Route 
              path="/boards" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <LazyBoardListPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          
            <Route 
              path="/boards/create-post" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                      <LazyPostCreatePage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          
            <Route 
              path="/boards/:boardId" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <LazyBoardListPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          
            <Route 
              path="/boards/:boardId/posts/:postId" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="detail" />}>
                      <LazyPostDetailPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* 프로필 관리 라우트 */}
            <Route 
              path="/profiles" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <LazyProfileListPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          
            <Route 
              path="/profiles/:profileType/:profileId" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="detail" />}>
                      <LazyProfileDetailPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* 기본 경로 - 로그인 페이지로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 페이지 - 대시보드로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
          </main>
        </Router>
      </ToastProvider>
    </LazyLoadErrorBoundary>
  );
}

export default App;