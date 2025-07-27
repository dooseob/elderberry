/**
 * 인증 엔티티 타입 정의
 * Feature-Sliced Design 구조에 맞춘 인증 도메인 타입
 */
import { BaseEntity, UserRole } from '../../../shared/types/common';

// 사용자 엔티티
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  profileCompletionRate: number;
  isActive: boolean;
  lastLoginAt?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
}

// 인증 상태
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 회원가입 요청
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToMarketing?: boolean;
}

// 회원 정보 수정 요청
export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

// 비밀번호 변경 요청
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 토큰 검증 요청
export interface ValidateTokenRequest {
  token: string;
}

// API 응답 타입
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  memberInfo: User;
}

export interface TokenValidationResponse {
  valid: boolean;
  user?: User;
}

// 인증 이벤트 타입
export type AuthEvent = 
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT'; payload: {} }
  | { type: 'TOKEN_REFRESH'; payload: { accessToken: string } }
  | { type: 'PROFILE_UPDATE'; payload: { user: User } };

// 권한 체크를 위한 타입
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export interface AuthGuardProps {
  permissions?: Permission[];
  roles?: UserRole[];
  fallback?: React.ComponentType;
}