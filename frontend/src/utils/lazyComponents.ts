import { lazy } from 'react';

// 메인 페이지 컴포넌트들 (우선순위 높음)
export const HomePage = lazy(() => import('../pages/HomePage'));
export const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
export const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));

// 기능별 페이지 컴포넌트들 (청크 분리)
export const DashboardPage = lazy(() => import('../pages/DashboardPage'));

// 건강 평가 관련 (health-pages 청크)
export const HealthAssessmentWizard = lazy(() => 
  import('../features/health/components/HealthAssessmentWizard')
);
export const HealthResultsPage = lazy(() => 
  import('../features/health/pages/HealthResultsPage')
);

// 시설 검색 관련 (facility-pages 청크)
export const FacilitySearchPage = lazy(() => 
  import('../features/facility/pages/FacilitySearchPage')
);
export const FacilityDetailPage = lazy(() => 
  import('../features/facility/pages/FacilityDetailPage')
);
export const FacilityMapPage = lazy(() => 
  import('../features/facility/pages/FacilityMapPage')
);

// 게시판 관련 (board-pages 청크)
export const BoardListPage = lazy(() => 
  import('../features/boards/pages/BoardListPage')
);
export const BoardDetailPage = lazy(() => 
  import('../features/boards/pages/BoardDetailPage')
);
export const PostCreatePage = lazy(() => 
  import('../features/boards/pages/PostCreatePage')
);
export const PostDetailPage = lazy(() => 
  import('../features/boards/pages/PostDetailPage')
);

// 구직/구인 관련 (job-pages 청크)
export const JobListPage = lazy(() => 
  import('../features/jobs/pages/JobListPage')
);
export const JobDetailPage = lazy(() => 
  import('../features/jobs/pages/JobDetailPage')
);
export const JobApplicationPage = lazy(() => 
  import('../features/jobs/pages/JobApplicationPage')
);

// 프로필 관련 (profile-pages 청크)
export const ProfileDetailPage = lazy(() => 
  import('../features/profile/pages/ProfileDetailPage')
);
export const MyProfilePage = lazy(() => 
  import('../features/profile/pages/MyProfilePage')
);

// 채팅 관련 (chat-pages 청크)
export const ChatPage = lazy(() => 
  import('../features/chat/pages/ChatPage')
);
export const ChatRoomPage = lazy(() => 
  import('../features/chat/pages/ChatRoomPage')
);

// 알림 관련 (notification 컴포넌트는 작아서 지연로딩 안함)
export const NotificationsPage = lazy(() => 
  import('../features/notifications/pages/NotificationsPage')
);

// 관리자 페이지들 (admin-pages 청크)
export const AdminDashboard = lazy(() => 
  import('../features/admin/pages/AdminDashboard')
);

// 에러 페이지들
export const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
export const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

// 로딩 컴포넌트 - 각 페이지별 커스터마이징 가능
export const PageLoadingSpinner = lazy(() => 
  import('../components/common/PageLoadingSpinner')
);

// 설정 페이지들
export const SettingsPage = lazy(() => 
  import('../features/settings/pages/SettingsPage')
);

// 도움말/FAQ 페이지들
export const HelpPage = lazy(() => import('../pages/HelpPage'));
export const FAQPage = lazy(() => import('../pages/FAQPage'));

/**
 * 지연 로딩 컴포넌트 프리로드 유틸리티
 * 사용자가 특정 링크에 마우스를 올렸을 때 미리 컴포넌트를 로드
 */
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  const componentImport = componentLoader();
  return componentImport;
};

/**
 * 라우트별 프리로드 매핑
 * 링크 hover 시 사용
 */
export const routePreloadMap = {
  '/': () => import('../pages/HomePage'),
  '/login': () => import('../features/auth/pages/LoginPage'),
  '/register': () => import('../features/auth/pages/RegisterPage'),
  '/dashboard': () => import('../pages/DashboardPage'),
  '/health': () => import('../features/health/components/HealthAssessmentWizard'),
  '/facility': () => import('../features/facility/pages/FacilitySearchPage'),
  '/boards': () => import('../features/boards/pages/BoardListPage'),
  '/jobs': () => import('../features/jobs/pages/JobListPage'),
  '/chat': () => import('../features/chat/pages/ChatPage'),
  '/profile': () => import('../features/profile/pages/MyProfilePage'),
  '/notifications': () => import('../features/notifications/pages/NotificationsPage'),
  '/settings': () => import('../features/settings/pages/SettingsPage'),
};

/**
 * 우선순위별 컴포넌트 그룹
 * 초기 로드 시 중요도에 따라 로딩 순서 결정
 */
export const componentPriority = {
  // 즉시 로드 (번들에 포함)
  critical: ['HomePage', 'LoginPage', 'DashboardPage'],
  
  // 빠른 로드 (사용자가 자주 접근)
  high: ['FacilitySearchPage', 'BoardListPage', 'HealthAssessmentWizard'],
  
  // 일반 로드 (필요 시 로드)
  normal: ['JobListPage', 'ProfileDetailPage', 'ChatPage', 'NotificationsPage'],
  
  // 늦은 로드 (관리자 등 특수 기능)
  low: ['AdminDashboard', 'SettingsPage', 'HelpPage', 'FAQPage']
};

/**
 * 컴포넌트 메타데이터
 * 번들 분석 및 최적화에 사용
 */
export const componentMetadata = {
  HomePage: { estimatedSize: '50KB', dependencies: ['react-router', 'framer-motion'] },
  LoginPage: { estimatedSize: '30KB', dependencies: ['react-hook-form', 'zod'] },
  RegisterPage: { estimatedSize: '35KB', dependencies: ['react-hook-form', 'zod'] },
  DashboardPage: { estimatedSize: '80KB', dependencies: ['react-query', 'charts'] },
  HealthAssessmentWizard: { estimatedSize: '120KB', dependencies: ['react-hook-form', 'multi-step'] },
  FacilitySearchPage: { estimatedSize: '90KB', dependencies: ['maps', 'filters'] },
  BoardListPage: { estimatedSize: '60KB', dependencies: ['pagination', 'search'] },
  JobListPage: { estimatedSize: '70KB', dependencies: ['filters', 'search'] },
  ChatPage: { estimatedSize: '85KB', dependencies: ['websocket', 'emoji'] },
  ProfileDetailPage: { estimatedSize: '55KB', dependencies: ['forms', 'image-upload'] },
  NotificationsPage: { estimatedSize: '40KB', dependencies: ['real-time-updates'] },
  AdminDashboard: { estimatedSize: '150KB', dependencies: ['charts', 'tables', 'admin-tools'] }
};

export default {
  // 컴포넌트들
  HomePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  HealthAssessmentWizard,
  HealthResultsPage,
  FacilitySearchPage,
  FacilityDetailPage,
  FacilityMapPage,
  BoardListPage,
  BoardDetailPage,
  PostCreatePage,
  PostDetailPage,
  JobListPage,
  JobDetailPage,
  JobApplicationPage,
  ProfileDetailPage,
  MyProfilePage,
  ChatPage,
  ChatRoomPage,
  NotificationsPage,
  AdminDashboard,
  NotFoundPage,
  UnauthorizedPage,
  SettingsPage,
  HelpPage,
  FAQPage,
  
  // 유틸리티
  preloadComponent,
  routePreloadMap,
  componentPriority,
  componentMetadata
};