/**
 * 인증 엔티티 Public API
 * Feature-Sliced Design에 따른 엔티티 공개 인터페이스
 */

// 타입 내보내기
export type {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  ValidateTokenRequest,
  AuthResponse,
  TokenValidationResponse,
  AuthEvent,
  Permission,
  AuthGuardProps,
} from './model/types';

// 스토어 및 선택자 내보내기
export { useAuthStore, authSelectors } from './model/store';

// 편의성을 위한 재내보내기
export { UserRole } from '../../shared/types/common';