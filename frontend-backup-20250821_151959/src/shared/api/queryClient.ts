/**
 * React Query 클라이언트 설정
 * 서버 상태 관리를 위한 QueryClient 구성
 */
import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

// Query 기본 설정
const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 캐시 시간 (기본: 5분)
      staleTime: 5 * 60 * 1000,
      // 가비지 컬렉션 시간 (기본: 30분)
      gcTime: 30 * 60 * 1000,
      // 자동 재시도 설정
      retry: (failureCount, error: any) => {
        // 401, 403, 404는 재시도하지 않음
        if (error?.statusCode && [401, 403, 404].includes(error.statusCode)) {
          return false;
        }
        // 3회까지 재시도
        return failureCount < 3;
      },
      // 재시도 지연 시간 (지수 백오프)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 포커스 시 자동 재검증
      refetchOnWindowFocus: false,
      // 네트워크 재연결 시 자동 재검증
      refetchOnReconnect: true,
    },
    mutations: {
      // 뮤테이션 재시도 (기본: 0회)
      retry: 0,
      // 뮤테이션 에러 시 쿼리 무효화
      onError: (error, variables, context) => {
        console.error('Mutation error:', error);
      },
    },
  },
};

// QueryClient 인스턴스 생성
export const queryClient = new QueryClient(queryConfig);

// Query Key 팩토리
export const queryKeys = {
  // 인증 관련
  auth: {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
    permissions: ['auth', 'permissions'] as const,
  },
  
  // 시설 관련
  facilities: {
    all: ['facilities'] as const,
    list: (params?: any) => ['facilities', 'list', params] as const,
    detail: (id: string) => ['facilities', 'detail', id] as const,
    search: (query: string, filters?: any) => ['facilities', 'search', query, filters] as const,
    recommendations: (memberId: string) => ['facilities', 'recommendations', memberId] as const,
  },
  
  // 건강평가 관련
  health: {
    all: ['health'] as const,
    assessment: (memberId: string) => ['health', 'assessment', memberId] as const,
    history: (memberId: string) => ['health', 'history', memberId] as const,
  },
  
  // 프로필 관련
  profiles: {
    all: ['profiles'] as const,
    list: (type?: string, params?: any) => ['profiles', 'list', type, params] as const,
    detail: (type: string, id: string) => ['profiles', 'detail', type, id] as const,
    domestic: (id: string) => ['profiles', 'domestic', id] as const,
    overseas: (id: string) => ['profiles', 'overseas', id] as const,
  },
  
  // 게시판 관련
  boards: {
    all: ['boards'] as const,
    list: (params?: any) => ['boards', 'list', params] as const,
    detail: (id: string) => ['boards', 'detail', id] as const,
    posts: (boardId: string, params?: any) => ['boards', boardId, 'posts', params] as const,
    post: (boardId: string, postId: string) => ['boards', boardId, 'posts', postId] as const,
    comments: (postId: string) => ['boards', 'posts', postId, 'comments'] as const,
  },
  
  // 구인구직 관련
  jobs: {
    all: ['jobs'] as const,
    list: (params?: any) => ['jobs', 'list', params] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
    applications: (jobId: string) => ['jobs', jobId, 'applications'] as const,
    myApplications: (memberId: string) => ['jobs', 'applications', 'member', memberId] as const,
  },
  
  // 코디네이터 관련
  coordinators: {
    all: ['coordinators'] as const,
    matching: (coordinatorId: string) => ['coordinators', coordinatorId, 'matching'] as const,
    stats: (coordinatorId: string) => ['coordinators', coordinatorId, 'stats'] as const,
  },
} as const;

// 캐시 무효화 헬퍼
export const invalidateQueries = {
  // 전체 도메인 무효화
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
  facilities: () => queryClient.invalidateQueries({ queryKey: queryKeys.facilities.all }),
  health: () => queryClient.invalidateQueries({ queryKey: queryKeys.health.all }),
  profiles: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all }),
  boards: () => queryClient.invalidateQueries({ queryKey: queryKeys.boards.all }),
  jobs: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all }),
  coordinators: () => queryClient.invalidateQueries({ queryKey: queryKeys.coordinators.all }),
  
  // 특정 쿼리 무효화
  facilityDetail: (id: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.facilities.detail(id) }),
  userProfile: () => 
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile }),
  boardPosts: (boardId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.boards.posts(boardId) }),
};

// 데이터 프리페칭 헬퍼
export const prefetchQueries = {
  userProfile: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.profile,
      staleTime: 10 * 60 * 1000, // 10분
    });
  },
  
  facilityList: async (params?: any) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.facilities.list(params),
      staleTime: 5 * 60 * 1000, // 5분
    });
  },
};

// 낙관적 업데이트 헬퍼
export const optimisticUpdates = {
  // 시설 즐겨찾기 토글
  toggleFacilityFavorite: (facilityId: string, isFavorite: boolean) => {
    queryClient.setQueryData(
      queryKeys.facilities.detail(facilityId),
      (oldData: any) => ({
        ...oldData,
        isFavorite,
      })
    );
  },
  
  // 게시글 좋아요 토글
  togglePostLike: (boardId: string, postId: string, isLiked: boolean, likeCount: number) => {
    queryClient.setQueryData(
      queryKeys.boards.post(boardId, postId),
      (oldData: any) => ({
        ...oldData,
        isLiked,
        likeCount,
      })
    );
  },
};

// 에러 처리
export const handleQueryError = (error: any, context?: string) => {
  console.error(`Query error${context ? ` in ${context}` : ''}:`, error);
  
  // 인증 에러 처리
  if (error?.statusCode === 401) {
    queryClient.clear();
    window.location.href = '/login';
  }
  
  // 네트워크 에러 처리
  if (!navigator.onLine) {
    console.warn('Network is offline');
  }
};