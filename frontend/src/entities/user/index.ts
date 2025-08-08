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

// 추가된 타입들 내보내기
export type {
  MemberResponse,
  ProfileEditFormData,
  ProfileEditErrors,
} from './model/types';

// 유효성 검증 관련 내보내기
export {
  profileEditSchema,
  profileEditRequiredSchema,
  nameSchema,
  phoneNumberSchema,
  languageSchema,
  regionSchema,
  validateName,
  validatePhoneNumber,
  validateLanguage,
  validateRegion,
  validateProfileEditForm,
  validateRequiredFields,
  cleanFormData,
  supportedLanguages,
  supportedRegions,
} from './model/validation';

export type {
  ProfileEditRequiredData,
} from './model/validation';

// 스토어 내보내기
export {
  useUserStore,
  userSelectors,
  useCurrentUser,
  useProfileForm,
  useUserActions,
  useUserState,
} from './model/store';