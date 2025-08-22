/**
 * Shared API Layer - Public API
 * Phase 2 구조적 개선을 위한 API 레이어 통합
 * 
 * @version 1.0.0
 * @description 모든 API 관련 모듈의 중앙집중식 내보내기
 */

// API 클라이언트
export { 
  apiClient, 
  configureApiClient, 
  api,
  type ApiResponse,
  type ApiError 
} from './apiClient';

// 특화된 API 서비스들
// Member API
export {
  memberApiService,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  toggleCurrentUserJobSeeker,
  getMemberCacheKey,
  CURRENT_USER_CACHE_KEY,
  isMemberApiError,
  hasPermissionToEdit,
  isJobSeeker,
  isActiveMember,
} from './memberApi';

export type {
  MemberApiError,
} from './memberApi';

// Chat API
export { chatApi } from './chatApi';

// 향후 추가 예정
// export * from './authApi';
// export * from './facilityApi';
// export * from './healthApi';

export default {
  apiClient,
  configureApiClient,
  api,
};