/**
 * 라우팅 설정 - 동적 사용자 정보 기반 라우팅
 * Phase 2: 하드코딩된 값 제거 및 동적 라우팅 지원
 * 
 * @version 3.0.0 - Dynamic User-Based Routing
 * @description 실제 사용자 정보를 기반으로 한 동적 라우팅 시스템
 */
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Layout Components
import { MainLayout } from '../widgets/layout';
import { ProtectedRoute, AdminRoute, CoordinatorRoute } from '../components/auth/ProtectedRoute';

// Wrapper Components for Dynamic Routing
import { 
  FacilitySearchPageWrapper, 
  HealthAssessmentWizardWrapper,
  AdminMembersPageWrapper,
  AdminFacilitiesPageWrapper,
  CoordinatorMembersPageWrapper
} from './RouteWrappers';

// 즉시 로딩 컴포넌트 (중요한 페이지들)
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/auth/SignInPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';

// 지연 로딩 컴포넌트 (필요시에만)
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const MyPage = lazy(() => import('../pages/MyPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ProfileEditPage = lazy(() => import('../pages/profile/ProfileEditPage'));
const FacilitySearchPage = lazy(() => import('../features/facility/FacilitySearchPage'));
const HealthAssessmentWizard = lazy(() => import('../features/health/HealthAssessmentWizard'));

// Route Type Definitions
export interface AppRoute {
  path: string;
  element: React.ReactNode;
  children?: AppRoute[];
}

export interface RouteConfig {
  public: AppRoute[];
  protected: AppRoute[];
  admin: AppRoute[];
  coordinator: AppRoute[];
}

// Public Routes (인증 불필요)
const publicRoutes: AppRoute[] = [
  {
    path: '/',
    element: (
      <MainLayout>
        <LandingPage />
      </MainLayout>
    )
  },
  {
    path: '/about',
    element: (
      <MainLayout>
        <AboutPage />
      </MainLayout>
    )
  },
  {
    path: '/contact', 
    element: (
      <MainLayout>
        <ContactPage />
      </MainLayout>
    )
  },
  {
    path: '/auth/signin',
    element: <SignInPage />
  },
  {
    path: '/auth/signup',
    element: <RegisterPage />
  },
  {
    path: '/login',
    element: <SignInPage /> // Redirect handling
  },
  {
    path: '/register',
    element: <RegisterPage />
  }
];

// Protected Routes (인증 필요)
const protectedRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/mypage',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MyPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SettingsPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile/edit',
    element: (
      <ProtectedRoute>
        <ProfileEditPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/facility-search',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <FacilitySearchPageWrapper />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/health-assessment',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HealthAssessmentWizardWrapper />
        </MainLayout>
      </ProtectedRoute>
    )
  }
];

// Admin Routes
const adminRoutes: AppRoute[] = [
  {
    path: '/admin/members',
    element: (
      <AdminRoute>
        <MainLayout>
          <AdminMembersPageWrapper />
        </MainLayout>
      </AdminRoute>
    )
  },
  {
    path: '/admin/facilities',
    element: (
      <AdminRoute>
        <MainLayout>
          <AdminFacilitiesPageWrapper />
        </MainLayout>
      </AdminRoute>
    )
  }
];

// Coordinator Routes
const coordinatorRoutes: AppRoute[] = [
  {
    path: '/coordinator/members',
    element: (
      <CoordinatorRoute>
        <MainLayout>
          <CoordinatorMembersPageWrapper />
        </MainLayout>
      </CoordinatorRoute>
    )
  }
];

// Export Route Configuration
export const routeConfig: RouteConfig = {
  public: publicRoutes,
  protected: protectedRoutes,
  admin: adminRoutes,
  coordinator: coordinatorRoutes
};

// Generate React Router Routes
export const generateRoutes = (): RouteObject[] => {
  const allRoutes = [
    ...publicRoutes,
    ...protectedRoutes,
    ...adminRoutes,
    ...coordinatorRoutes,
    {
      path: '*',
      element: <NotFoundPage />
    }
  ];

  return allRoutes.map(route => ({
    path: route.path,
    element: route.element
  }));
};

// Route Metadata for SEO and Analytics
export const routeMetadata = {
  '/': {
    title: '엘더베리 - 요양원 구인구직 플랫폼',
    description: '전국 요양원 정보와 구인구직을 한번에',
    keywords: ['요양원', '구인구직', '간병', '요양'],
  },
  '/auth/signin': {
    title: '로그인 - 엘더베리',
    description: '엘더베리 계정으로 로그인하세요',
  },
  '/dashboard': {
    title: '대시보드 - 엘더베리', 
    description: '개인화된 대시보드에서 정보를 확인하세요',
  },
  '/facility-search': {
    title: '시설 검색 - 엘더베리',
    description: '조건에 맞는 요양 시설을 찾아보세요',
  },
  '/profile/edit': {
    title: '프로필 수정 - 엘더베리',
    description: '개인정보와 구직자 상태를 관리하세요',
    keywords: ['프로필', '수정', '개인정보', '구직자'],
  }
};

export default generateRoutes;