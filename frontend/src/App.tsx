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
import { ProtectedRoute, AdminRoute, CoordinatorRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

// 레이아웃 컴포넌트 (즉시 로딩 - 모든 페이지에서 사용)
import MainLayout from './components/layout/MainLayout';

// 로딩 폴백 컴포넌트
import LazyPageFallback from './components/ui/LazyPageFallback';
import LazyLoadErrorBoundary from './components/ui/LazyLoadErrorBoundary';

// 토스트 컨텍스트 프로바이더
import { ToastProvider } from './hooks/useToast';

// Linear 테마 시스템
import { ThemeProvider } from './components/theme/ThemeProvider';

// 지연 로딩 페이지 컴포넌트들
import {
  LazyLoginPage,
  LazyRegisterPage,
  LazyForgotPasswordPage,
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

// 테마 시스템 테스트 컴포넌트
import ThemeTestPlayground from './components/theme/ThemeTestPlayground';

// Linear Design System 데모
import LinearShowcase from './pages/demo/LinearShowcase';

// 새로운 페이지들
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/auth/SignInPage';

import './App.css';

// 루트 리다이렉트 컴포넌트 제거 - 랜딩페이지를 직접 표시

function App() {
  return (
    <LazyLoadErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
          <main className="min-h-screen bg-gray-50" role="main">
          <Suspense fallback={<LazyPageFallback type="spinner" message="로그인 페이지를 로딩 중..." />}>
          <Routes>
            {/* 공개 라우트 - 개선된 인증 시스템 */}
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/login" element={<Navigate to="/auth/signin" replace />} /> {/* 기존 로그인 리다이렉트 */}
            <Route path="/register" element={<LazyRegisterPage />} />
            <Route path="/auth/signup" element={<LazyRegisterPage />} />
            <Route path="/forgot-password" element={<LazyForgotPasswordPage />} />
            <Route path="/auth/forgot-password" element={<LazyForgotPasswordPage />} />
            <Route path="/unauthorized" element={<LazyUnauthorizedPage />} />
            
            {/* 챗봇 (인증 없이 사용 가능) */}
            <Route path="/chat-home" element={<LazyChatHomePage />} />
            <Route path="/chat" element={<LazyChatPage />} />
            
            {/* 테마 시스템 테스트 (개발용) */}
            <Route path="/theme-test" element={<ThemeTestPlayground />} />
            
            {/* Linear Design System 데모 */}
            <Route path="/linear-demo" element={<LinearShowcase />} />
          
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

            {/* 관리자 전용 라우트 */}
            <Route 
              path="/admin/members" 
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">회원 관리</h1><p className="text-gray-600 mt-2">관리자만 접근 가능한 회원 관리 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/facilities" 
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">시설 관리</h1><p className="text-gray-600 mt-2">관리자만 접근 가능한 시설 관리 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/statistics" 
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">시스템 통계</h1><p className="text-gray-600 mt-2">관리자만 접근 가능한 시스템 통계 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">시스템 설정</h1><p className="text-gray-600 mt-2">관리자만 접근 가능한 시스템 설정 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </AdminRoute>
              } 
            />

            {/* 코디네이터 전용 라우트 */}
            <Route 
              path="/coordinator/members" 
              element={
                <CoordinatorRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">회원 관리</h1><p className="text-gray-600 mt-2">코디네이터만 접근 가능한 회원 관리 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </CoordinatorRoute>
              } 
            />
            
            <Route 
              path="/coordinator/matching" 
              element={
                <CoordinatorRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">매칭 관리</h1><p className="text-gray-600 mt-2">코디네이터만 접근 가능한 매칭 관리 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </CoordinatorRoute>
              } 
            />
            
            <Route 
              path="/coordinator/statistics" 
              element={
                <CoordinatorRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">통계</h1><p className="text-gray-600 mt-2">코디네이터만 접근 가능한 통계 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </CoordinatorRoute>
              } 
            />
            
            <Route 
              path="/coordinator/facilities" 
              element={
                <CoordinatorRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <div className="p-6"><h1 className="text-2xl font-bold">시설 관리</h1><p className="text-gray-600 mt-2">코디네이터만 접규 가능한 시설 관리 페이지입니다.</p></div>
                    </Suspense>
                  </MainLayout>
                </CoordinatorRoute>
              } 
            />

            {/* 기본 경로 - 랜딩페이지 (비회원도 접근 가능) */}
            <Route path="/" element={<LandingPage />} />
            
            {/* 404 페이지 - 랜딩페이지로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          </main>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </LazyLoadErrorBoundary>
  );
}

export default App;