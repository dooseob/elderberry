/**
 * 메인 앱 컴포넌트
 * Elderberry 글로벌 요양원 구인구직 서비스
 * React.lazy()를 활용한 페이지 레벨 지연 로딩 구현
 */
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Route Wrappers
import { 
  FacilitySearchPageWrapper, 
  HealthAssessmentWizardWrapper
} from './router/RouteWrappers';

// 개발용 로거
import { devLogger } from './utils/devLogger';

// 인증 관련 컴포넌트 (즉시 로딩 - 보안상 중요)
import { ProtectedRoute, AdminRoute, CoordinatorRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

// 레이아웃 컴포넌트 (즉시 로딩 - 모든 페이지에서 사용)
import { MainLayout } from './widgets/layout';

// 로딩 폴백 컴포넌트
import LazyPageFallback from './shared/ui/LazyPageFallback';
import LazyLoadErrorBoundary from './shared/ui/LazyLoadErrorBoundary';

// 토스트 컨텍스트 프로바이더
import { ToastProvider } from './hooks/useToast';

// Linear 테마 시스템 - main.tsx에서 이미 제공되므로 제거

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
  LazyJobListPage,
  LazyJobDetailPage,
  LazyCoordinatorMatchingWizard,
  LazyProfileListPage,
  LazyProfileDetailPage,
  LazyNotificationsPage
} from './utils/lazyImports';

// 테마 시스템 테스트 컴포넌트
import ThemeTestPlayground from './components/theme/ThemeTestPlayground';

// Linear Design System 데모
import LinearShowcase from './pages/demo/LinearShowcase';

// FSD 아키텍처에 따른 페이지 import
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/auth/SignInPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import EmergencySearchPage from './pages/EmergencySearchPage';
import PlannedSearchPage from './pages/PlannedSearchPage';
import JobSearchPage from './pages/JobSearchPage';
import ConsultationPage from './pages/ConsultationPage';

import './App.css';

// 루트 리다이렉트 컴포넌트 제거 - 랜딩페이지를 직접 표시

function App() {
  return (
    <LazyLoadErrorBoundary>
      <ToastProvider>
        <Router>
          <main className="min-h-screen bg-gray-50" role="main">
            <Routes>
            {/* 공개 라우트 - 개선된 인증 시스템 */}
            <Route path="/auth/signin" element={
              <Suspense fallback={<LazyPageFallback type="spinner" message="로그인 페이지를 로딩 중..." />}>
                <SignInPage />
              </Suspense>
            } />
            
            {/* 새로 추가된 공개 페이지들 */}
            <Route path="/about" element={
              <MainLayout>
                <Suspense fallback={<LazyPageFallback type="spinner" message="소개 페이지를 로딩 중..." />}>
                  <AboutPage />
                </Suspense>
              </MainLayout>
            } />
            <Route path="/contact" element={
              <MainLayout>
                <Suspense fallback={<LazyPageFallback type="spinner" message="문의 페이지를 로딩 중..." />}>
                  <ContactPage />
                </Suspense>
              </MainLayout>
            } />
            <Route path="/login" element={<Navigate to="/auth/signin" replace />} /> {/* 기존 로그인 리다이렉트 */}
            <Route path="/register" element={
              <Suspense fallback={<LazyPageFallback type="spinner" message="회원가입 페이지를 로딩 중..." />}>
                <LazyRegisterPage />
              </Suspense>
            } />
            <Route path="/auth/signup" element={
              <Suspense fallback={<LazyPageFallback type="spinner" message="회원가입 페이지를 로딩 중..." />}>
                <LazyRegisterPage />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<LazyPageFallback type="spinner" message="비밀번호 재설정 페이지를 로딩 중..." />}>
                <LazyForgotPasswordPage />
              </Suspense>
            } />
            <Route path="/auth/forgot-password" element={
              <Suspense fallback={<LazyPageFallback type="spinner" message="비밀번호 재설정 페이지를 로딩 중..." />}>
                <LazyForgotPasswordPage />
              </Suspense>
            } />
            <Route path="/unauthorized" element={
              <Suspense fallback={<LazyPageFallback type="spinner" message="페이지를 로딩 중..." />}>
                <LazyUnauthorizedPage />
              </Suspense>
            } />
            
            {/* 챗봇 (인증 없이 사용 가능) */}
            <Route path="/chat-home" element={<LazyChatHomePage />} />
            <Route path="/chat" element={<LazyChatPage />} />
            
            {/* 긴급 검색 (비회원도 이용 가능) */}
            <Route 
              path="/emergency-search" 
              element={
                <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                  <EmergencySearchPage />
                </Suspense>
              } 
            />
            
            {/* 계획적 준비 (건강평가 연결) */}
            <Route 
              path="/planned-search" 
              element={
                <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                  <PlannedSearchPage />
                </Suspense>
              } 
            />
            
            {/* 구직자 전용 (비회원도 이용 가능) */}
            <Route 
              path="/job-search" 
              element={
                <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                  <JobSearchPage />
                </Suspense>
              } 
            />
            
            {/* 전문가 상담 (회원가입 유도) */}
            <Route 
              path="/consultation" 
              element={
                <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                  <ConsultationPage />
                </Suspense>
              } 
            />
            
            {/* 시설찾기 (비로그인 상태에서도 접근 가능) */}
            <Route 
              path="/facility-search" 
              element={
                <MainLayout>
                  <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                    <FacilitySearchPageWrapper />
                  </Suspense>
                </MainLayout>
              } 
            />
            
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
              path="/settings" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                      <SettingsPage />
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
                      <HealthAssessmentWizardWrapper />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          
            {/* 로그인 상태에서의 시설찾기 (고급 기능 사용 가능) - 다른 경로로 변경 */}
            <Route 
              path="/facility-search/advanced" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <FacilitySearchPageWrapper />
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

            {/* 구인구직 라우트 */}
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <LazyJobListPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/jobs/:jobId" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="detail" />}>
                      <LazyJobDetailPage />
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
                      <LazyCoordinatorMatchingWizard />
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

            {/* 기본 경로 - 원래 랜딩페이지 (비회원도 접근 가능) */}
            <Route path="/" element={
              <MainLayout>
                <Suspense fallback={<LazyPageFallback type="spinner" message="홈페이지를 로딩 중..." />}>
                  <LandingPage />
                </Suspense>
              </MainLayout>
            } />
            
            {/* 404 페이지 - 전용 NotFound 페이지 */}
            <Route path="*" element={
              <Suspense fallback={<LazyPageFallback type="spinner" message="페이지를 로딩 중..." />}>
                <NotFoundPage />
              </Suspense>
            } />
            </Routes>
          </main>
        </Router>
      </ToastProvider>
    </LazyLoadErrorBoundary>
  );
}

export default App;