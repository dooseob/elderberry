/**
 * 라우트 프리로딩 유틸리티
 * 사용자 상호작용 패턴에 따른 지능형 프리로딩
 */

// 프리로딩 우선순위 매핑
const PRELOAD_PRIORITY = {
  // 높은 우선순위 - 로그인 후 즉시 방문 가능성 높음
  dashboard: 1,
  profiles: 2,
  
  // 중간 우선순위 - 사용자 역할에 따라 방문
  boards: 3,
  'health-assessment': 4,
  'facility-search': 5,
  
  // 낮은 우선순위 - 선택적 기능
  chat: 6,
  jobs: 7
} as const;

// 사용자 역할별 추천 프리로딩 순서
const ROLE_BASED_PRELOAD = {
  CAREGIVER: ['dashboard', 'jobs', 'profiles', 'health-assessment', 'facility-search'],
  EMPLOYER: ['dashboard', 'profiles', 'boards', 'jobs'],
  COORDINATOR: ['dashboard', 'profiles', 'boards', 'facility-search'],
  ADMIN: ['dashboard', 'profiles', 'boards']
} as const;

// 프리로딩 상태 관리
class PreloadManager {
  private preloadedRoutes = new Set<string>();
  private preloadQueue: string[] = [];
  private isPreloading = false;
  
  /**
   * 라우트 프리로딩 실행
   */
  async preloadRoute(routeName: string): Promise<void> {
    if (this.preloadedRoutes.has(routeName)) {
      return;
    }

    try {
      const startTime = performance.now();
      
      switch (routeName) {
        case 'dashboard':
          await import('../features/dashboard/DashboardPage');
          break;
        case 'boards':
          await Promise.all([
            import('../features/boards/BoardListPage'),
            import('../features/boards/PostDetailPage')
          ]);
          break;
        case 'profiles':
          await Promise.all([
            import('../features/profile/ProfileListPage'),
            import('../features/profile/ProfileDetailPage')
          ]);
          break;
        case 'jobs':
          await Promise.all([
            import('../features/jobs/JobListPage'),
            import('../features/jobs/JobDetailPage')
          ]);
          break;
        case 'health-assessment':
          await import('../features/health/HealthAssessmentWizard');
          break;
        case 'facility-search':
          await import('../features/facility/FacilitySearchPage');
          break;
        case 'chat':
          await Promise.all([
            import('../features/chat/components/ChatHomePage'),
            import('../features/chat/components/ChatPage')
          ]);
          break;
        default:
          console.warn(`Unknown route for preloading: ${routeName}`);
          return;
      }

      const loadTime = performance.now() - startTime;
      this.preloadedRoutes.add(routeName);
      
      // 성능 모니터링
      if (__DEV__) {
        console.log(`[Preload] ${routeName} loaded in ${loadTime.toFixed(2)}ms`);
      }
      
    } catch (error) {
      console.error(`[Preload] Failed to preload ${routeName}:`, error);
    }
  }

  /**
   * 역할 기반 배치 프리로딩
   */
  async preloadByRole(userRole: keyof typeof ROLE_BASED_PRELOAD): Promise<void> {
    const routes = ROLE_BASED_PRELOAD[userRole] || [];
    this.preloadQueue = routes.filter(route => !this.preloadedRoutes.has(route));
    
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    try {
      // 우선순위 기반 순차 로딩 (네트워크 부하 방지)
      for (const route of this.preloadQueue) {
        await this.preloadRoute(route);
        // 각 프리로딩 사이에 짧은 지연 (브라우저 블로킹 방지)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.isPreloading = false;
      this.preloadQueue = [];
    }
  }

  /**
   * 마우스 호버 기반 프리로딩
   */
  preloadOnHover(routeName: string): void {
    if (!this.preloadedRoutes.has(routeName)) {
      // 200ms 지연 후 프리로딩 (의도적 호버 감지)
      setTimeout(() => {
        this.preloadRoute(routeName);
      }, 200);
    }
  }

  /**
   * 네트워크 상태 기반 프리로딩 제어
   */
  shouldPreload(): boolean {
    // 네트워크 정보 API 지원 확인
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // 느린 연결에서는 프리로딩 제한
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        return false;
      }
      
      // 데이터 절약 모드에서는 프리로딩 비활성화
      if (connection.saveData) {
        return false;
      }
    }

    return true;
  }

  /**
   * 프리로딩 상태 조회
   */
  isRoutePreloaded(routeName: string): boolean {
    return this.preloadedRoutes.has(routeName);
  }

  /**
   * 프리로딩 통계
   */
  getPreloadStats() {
    return {
      preloadedCount: this.preloadedRoutes.size,
      preloadedRoutes: Array.from(this.preloadedRoutes),
      isPreloading: this.isPreloading,
      queueLength: this.preloadQueue.length
    };
  }
}

// 싱글톤 인스턴스
export const preloadManager = new PreloadManager();

/**
 * 사용자 상호작용 기반 프리로딩 훅
 */
export function usePreloadOnHover() {
  return (routeName: string) => {
    if (preloadManager.shouldPreload()) {
      preloadManager.preloadOnHover(routeName);
    }
  };
}

/**
 * 역할 기반 자동 프리로딩 훅
 */
export function useRoleBasedPreload(userRole?: keyof typeof ROLE_BASED_PRELOAD) {
  React.useEffect(() => {
    if (!userRole || !preloadManager.shouldPreload()) {
      return;
    }

    // 초기 로딩 후 2초 지연하여 프리로딩 시작
    const timer = setTimeout(() => {
      preloadManager.preloadByRole(userRole);
    }, 2000);

    return () => clearTimeout(timer);
  }, [userRole]);
}

// React import 추가
import React from 'react';