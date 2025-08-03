/**
 * User 엔티티 Public API
 * FSD에 따른 사용자 엔티티 공개 인터페이스
 */

// 타입 내보내기
export type {
  User,
  UserWithProfile,
  UserProfileSummary,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserSearchParams,
  UserListResponse,
  UserStatistics,
  UserActivity,
} from './model/types';

// 타입 가드 함수 내보내기
export {
  isUserWithDomesticProfile,
  isUserWithOverseasProfile,
} from './model/types';