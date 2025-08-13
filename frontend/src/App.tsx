/**
 * 메인 앱 컴포넌트 - 단순화된 라우팅 시스템
 * Elderberry 글로벌 요양원 구인구직 서비스
 * v2.0 - 라우팅 시스템 개선 및 중복 제거
 */
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// 인증 관련 컴포넌트
import { ProtectedRoute, AdminRoute, CoordinatorRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

// 레이아웃 컴포넌트
import { MainLayout } from './widgets/layout';

// 로딩 및 에러 처리 컴포넌트
import LazyPageFallback from './shared/ui/LazyPageFallback';
import LazyLoadErrorBoundary from './shared/ui/LazyLoadErrorBoundary';
import { ToastProvider } from './hooks/useToast';

// 성능 모니터링
import { performanceMonitor } from './utils/performanceMonitor';

// 즉시 로딩 페이지 (중요한 페이지들)
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/auth/SignInPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import EmergencySearchPage from './pages/EmergencySearchPage';
import PlannedSearchPage from './pages/PlannedSearchPage';
import JobSearchPage from './pages/JobSearchPage';
import ConsultationPage from './pages/ConsultationPage';
import SettingsPage from './pages/SettingsPage';

// 지연 로딩 페이지들 (성능 최적화)
import {
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
  LazyAvailableCoordinatorsPage,
  LazySimulationDashboard,
  LazyProfileListPage,
  LazyProfileDetailPage,
  LazyNotificationsPage,
  LazyNotificationSettingsPage,
  LazyMyReviewsPage,
  LazyFacilityReviewsPage,
  LazyReviewCreatePage,
  LazyMyApplicationsPage
} from './utils/lazyImports';

// Route Wrappers
import { 
  FacilitySearchPageWrapper, 
  HealthAssessmentWizardWrapper
} from './router/RouteWrappers';

// 테마 및 데모 컴포넌트
import ThemeTestPlayground from './components/theme/ThemeTestPlayground';
import LinearShowcase from './pages/demo/LinearShowcase';

import './App.css';

/**
 * 홈 리다이렉트 컴포넌트
 * 인증 상태에 따라 적절한 페이지로 리다이렉션
 */
function HomeRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }
  
  // 인증된 사용자는 대시보드로 리다이렉션
  return <Navigate to="/dashboard" replace />;
}

/**
 * 로그아웃 후 리다이렉트 컴포넌트
 * 로그아웃 상태를 처리하고 적절한 페이지로 안내
 */
function LogoutRedirect() {
  const location = useLocation();
  
  // 로그아웃 후에는 랜딩페이지로 리다이렉션하되, 
  // 원래 시도했던 페이지 정보는 유지
  return (
    <Navigate 
      to="/" 
      state={{ 
        from: location.pathname,
        message: "로그아웃되었습니다. 다시 로그인해주세요." 
      }} 
      replace 
    />
  );
}

function App() {
  // 성능 모니터링 시작
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      performanceMonitor.collectMetrics();
      
      setTimeout(() => {
        const report = performanceMonitor.generateReport();
        if (report?.warnings.length > 0) {
          console.warn('성능 경고:', report.warnings);
        }
      }, 10000);
    }
  }, []);

  return (
    <LazyLoadErrorBoundary>
      <ToastProvider>
        <Router>
          <main className="min-h-screen bg-gray-50" role="main">
            <Routes>
              {/* ===== 공개 라우트 (인증 불필요) ===== */}
              
              {/* 홈페이지 - 스마트 리다이렉션 */}
              <Route path="/" element={<HomeRedirect />} />
              
              {/* 인증 페이지들 */}
              <Route path="/auth/signin" element={<SignInPage />} />
              <Route path="/login" element={<Navigate to="/auth/signin" replace />} />
              <Route path="/auth/signup" element={
                <Suspense fallback={<LazyPageFallback type="spinner" message="회원가입 페이지 로딩 중..." />}>
                  <LazyRegisterPage />
                </Suspense>
              } />
              <Route path="/register" element={<Navigate to="/auth/signup" replace />} />
              <Route path="/auth/forgot-password" element={
                <Suspense fallback={<LazyPageFallback type="spinner" message="비밀번호 재설정 페이지 로딩 중..." />}>
                  <LazyForgotPasswordPage />
                </Suspense>
              } />
              <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
              
              {/* 정보 페이지들 */}
              <Route path="/about" element={
                <MainLayout>
                  <AboutPage />
                </MainLayout>
              } />
              <Route path="/contact" element={
                <MainLayout>
                  <ContactPage />
                </MainLayout>
              } />
              
              {/* 비회원도 접근 가능한 서비스 */}
              <Route path="/emergency-search" element={<EmergencySearchPage />} />
              <Route path="/planned-search" element={<PlannedSearchPage />} />
              <Route path="/job-search" element={<JobSearchPage />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              
              {/* 시설 찾기 (비회원 접근 가능) */}
              <Route path="/facility-search" element={
                <MainLayout>
                  <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                    <LazyFacilitySearchPage />
                  </Suspense>
                </MainLayout>
              } />
              
              {/* 챗봇 (비회원 접근 가능) */}
              <Route path="/chat-home" element={<LazyChatHomePage />} />
              <Route path="/chat" element={<LazyChatPage />} />
              
              {/* 권한 없음 페이지 */}
              <Route path="/unauthorized" element={
                <Suspense fallback={<LazyPageFallback type="spinner" />}>
                  <LazyUnauthorizedPage />
                </Suspense>
              } />
              
              {/* 개발자 도구 (개발 환경에서만) */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Route path="/theme-test" element={<ThemeTestPlayground />} />
                  <Route path="/linear-demo" element={<LinearShowcase />} />
                </>
              )}

              {/* ===== 보호된 라우트 (인증 필요) ===== */}
              
              {/* 대시보드 */}
              <Route path="/dashboard" element={
                <ProtectedRoute fallbackPath="/logout-redirect">
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                      <LazyDashboardPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 마이페이지 */}
              <Route path="/mypage" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                      <LazyMyPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 설정 */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 알림 */}
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <LazyNotificationsPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/notifications/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                      <LazyNotificationSettingsPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 건강 평가 */}
              <Route path="/health-assessment" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                      <HealthAssessmentWizardWrapper />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 고급 시설 검색 (로그인 전용) */}
              <Route path="/facility-search/advanced" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                      <FacilitySearchPageWrapper />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 게시판 */}
              <Route path="/boards/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route index element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyBoardListPage />
                        </Suspense>
                      } />
                      <Route path="create-post" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                          <LazyPostCreatePage />
                        </Suspense>
                      } />
                      <Route path=":boardId" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyBoardListPage />
                        </Suspense>
                      } />
                      <Route path=":boardId/posts/:postId" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="detail" />}>
                          <LazyPostDetailPage />
                        </Suspense>
                      } />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 구인구직 */}
              <Route path="/jobs/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route index element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyJobListPage />
                        </Suspense>
                      } />
                      <Route path="my-applications" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyMyApplicationsPage />
                        </Suspense>
                      } />
                      <Route path=":jobId" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="detail" />}>
                          <LazyJobDetailPage />
                        </Suspense>
                      } />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 프로필 관리 */}
              <Route path="/profiles/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route index element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyProfileListPage />
                        </Suspense>
                      } />
                      <Route path=":profileType/:profileId" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="detail" />}>
                          <LazyProfileDetailPage />
                        </Suspense>
                      } />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* 리뷰 관리 */}
              <Route path="/reviews/*" element={
                <MainLayout>
                  <Routes>
                    <Route path="my" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyMyReviewsPage />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                    <Route path="facility/:facilityId" element={
                      <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                        <LazyFacilityReviewsPage />
                      </Suspense>
                    } />
                    <Route path="create" element={
                      <ProtectedRoute>
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                          <LazyReviewCreatePage />
                        </Suspense>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </MainLayout>
              } />

              {/* ===== 관리자 전용 라우트 ===== */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="members" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">회원 관리</h1>
                            <p className="text-gray-600 mt-2">관리자만 접근 가능한 회원 관리 페이지입니다.</p>
                          </div>
                        </Suspense>
                      } />
                      <Route path="facilities" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">시설 관리</h1>
                            <p className="text-gray-600 mt-2">관리자만 접근 가능한 시설 관리 페이지입니다.</p>
                          </div>
                        </Suspense>
                      } />
                      <Route path="statistics" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">시스템 통계</h1>
                            <p className="text-gray-600 mt-2">관리자만 접근 가능한 시스템 통계 페이지입니다.</p>
                          </div>
                        </Suspense>
                      } />
                      <Route path="settings" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="form" />}>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">시스템 설정</h1>
                            <p className="text-gray-600 mt-2">관리자만 접근 가능한 시스템 설정 페이지입니다.</p>
                          </div>
                        </Suspense>
                      } />
                    </Routes>
                  </MainLayout>
                </AdminRoute>
              } />

              {/* ===== 코디네이터 전용 라우트 ===== */}
              <Route path="/coordinator/*" element={
                <CoordinatorRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="members" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">회원 관리</h1>
                            <p className="text-gray-600 mt-2">코디네이터만 접근 가능한 회원 관리 페이지입니다.</p>
                          </div>
                        </Suspense>
                      } />
                      <Route path="matching" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyCoordinatorMatchingWizard />
                        </Suspense>
                      } />
                      <Route path="available" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <LazyAvailableCoordinatorsPage />
                        </Suspense>
                      } />
                      <Route path="simulation" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                          <LazySimulationDashboard />
                        </Suspense>
                      } />
                      <Route path="statistics" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="dashboard" />}>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">통계</h1>
                            <p className="text-gray-600 mt-2">코디네이터만 접근 가능한 통계 페이지입니다.</p>
                          </div>
                        </Suspense>
                      } />
                      <Route path="facilities" element={
                        <Suspense fallback={<LazyPageFallback type="skeleton" skeletonType="list" />}>
                          <div className="p-6">
                            <h1 className="text-2xl font-bold">시설 관리</h1>
                            <p className="text-gray-600 mt-2">코디네이터만 접근 가능한 시설 관리 페이지입니다.</p>
                          </div>
                        </Suspense>
                      } />
                    </Routes>
                  </MainLayout>
                </CoordinatorRoute>
              } />

              {/* ===== 특별 처리 라우트 ===== */}
              
              {/* 로그아웃 후 리다이렉트 */}
              <Route path="/logout-redirect" element={<LogoutRedirect />} />
              
              {/* 404 페이지 - 모든 미정의 라우트 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Router>
      </ToastProvider>
    </LazyLoadErrorBoundary>
  );
}

export default App;