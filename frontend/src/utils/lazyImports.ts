/**
 * 지연 로딩 유틸리티
 * React.lazy()를 활용한 페이지 컴포넌트 지연 로딩 설정
 */
import { lazy } from 'react';

// 최소 로딩 시간 보장 (너무 빠른 로딩으로 인한 깜빡임 방지)
const MIN_LOADING_TIME = 200;

/**
 * 지연 로딩 래퍼 함수
 * 최소 로딩 시간을 보장하여 사용자 경험 개선
 */
function lazyWithMinDelay<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  minDelay: number = MIN_LOADING_TIME
) {
  return lazy(() => {
    const start = Date.now();
    return importFunc().then(module => {
      const elapsed = Date.now() - start;
      const remainingDelay = Math.max(0, minDelay - elapsed);
      
      if (remainingDelay > 0) {
        return new Promise(resolve => {
          setTimeout(() => resolve(module), remainingDelay);
        });
      }
      
      return module;
    });
  });
}

// 인증 관련 페이지 (우선순위: 높음 - 빠른 로딩 필요)
export const LazyLoginPage = lazyWithMinDelay(
  () => import('../pages/auth/LoginPage'),
  100 // 로그인은 빠른 로딩이 중요
);

export const LazyRegisterPage = lazyWithMinDelay(
  () => import('../pages/auth/RegisterPage'),
  100
);

export const LazyForgotPasswordPage = lazyWithMinDelay(
  () => import('../pages/auth/ForgotPasswordPage'),
  100
);

// 대시보드 (우선순위: 높음 - 로그인 직후 접근)
export const LazyDashboardPage = lazyWithMinDelay(
  () => import('../features/dashboard/DashboardPage'),
  150
);

// 마이페이지 (우선순위: 높음 - 자주 접근하는 페이지)
export const LazyMyPage = lazyWithMinDelay(
  () => import('../components/mypage/MyPage'),
  150
);

// 게시판 관련 페이지 (우선순위: 중간)
export const LazyBoardListPage = lazyWithMinDelay(
  () => import('../features/boards/BoardListPage')
);

export const LazyPostDetailPage = lazyWithMinDelay(
  () => import('../features/boards/PostDetailPage')
);

export const LazyPostCreatePage = lazyWithMinDelay(
  () => import('../features/boards/PostCreatePage')
);

// 프로필 관련 페이지 (우선순위: 중간)
export const LazyProfileListPage = lazyWithMinDelay(
  () => import('../features/profile/ProfileListPage')
);

export const LazyProfileDetailPage = lazyWithMinDelay(
  () => import('../features/profile/ProfileDetailPage')
);

// 구직/구인 관련 페이지 (우선순위: 중간)
export const LazyJobListPage = lazyWithMinDelay(
  () => import('../features/jobs/JobListPage')
);

export const LazyJobDetailPage = lazyWithMinDelay(
  () => import('../features/jobs/JobDetailPage')
);

// 건강 평가 관련 페이지 (우선순위: 낮음 - 선택적 기능)
export const LazyHealthAssessmentWizard = lazyWithMinDelay(
  () => import('../features/health/HealthAssessmentWizard'),
  300 // 복잡한 위저드는 조금 더 긴 로딩 시간 허용
);

// 시설 검색 페이지 (우선순위: 낮음)
export const LazyFacilitySearchPage = lazyWithMinDelay(
  () => import('../features/facility/FacilitySearchPage'),
  250
);

// 코디네이터 매칭 페이지 (우선순위: 낮음)
export const LazyCoordinatorMatchingWizard = lazyWithMinDelay(
  () => import('../features/coordinator/CoordinatorMatchingWizard'),
  300
);

// 채팅 관련 페이지 (우선순위: 낮음 - 추가 기능)
export const LazyChatHomePage = lazyWithMinDelay(
  () => import('../features/chat/components/ChatHomePage'),
  200
);

export const LazyChatPage = lazyWithMinDelay(
  () => import('../features/chat/components/ChatPage'),
  200
);

// 기타 페이지들
export const LazyUnauthorizedPage = lazyWithMinDelay(
  () => import('../components/pages/UnauthorizedPage'),
  100
);

// 알림 관련 페이지
export const LazyNotificationsPage = lazyWithMinDelay(
  () => import('../pages/NotificationsPage'),
  150
);

// 청크 분석을 위한 컴포넌트 이름 매핑
export const CHUNK_NAMES = {
  auth: ['LazyLoginPage', 'LazyRegisterPage', 'LazyForgotPasswordPage'],
  dashboard: ['LazyDashboardPage', 'LazyMyPage'],
  boards: ['LazyBoardListPage', 'LazyPostDetailPage', 'LazyPostCreatePage'],
  profiles: ['LazyProfileListPage', 'LazyProfileDetailPage'],
  jobs: ['LazyJobListPage', 'LazyJobDetailPage'],
  health: ['LazyHealthAssessmentWizard'],
  facility: ['LazyFacilitySearchPage'],
  coordinator: ['LazyCoordinatorMatchingWizard'],
  chat: ['LazyChatHomePage', 'LazyChatPage'],
  notifications: ['LazyNotificationsPage'],
  misc: ['LazyUnauthorizedPage']
} as const;