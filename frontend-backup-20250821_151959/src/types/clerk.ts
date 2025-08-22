/**
 * Clerk 관련 TypeScript 타입 정의
 */

// Clerk 사용자 기본 정보
export interface ClerkUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  isClerkUser: true;
}

// 백엔드 동기화 요청
export interface ClerkBackendSyncRequest {
  clerkUserId: string;
  email: string;
  name: string;
  imageUrl?: string;
  clerkToken: string;
}

// 백엔드 동기화 응답
export interface ClerkBackendSyncResponse {
  success: boolean;
  memberId: number;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    profileCompletionRate: number;
  };
}

// 토큰 검증 요청
export interface ClerkTokenValidationRequest {
  token: string;
}

// 토큰 검증 응답
export interface ClerkTokenValidationResponse {
  valid: boolean;
  userId?: string;
  email?: string;
}

// 계정 연결 요청
export interface ClerkLinkRequest {
  clerkUserId: string;
  email: string;
}

// 계정 연결 응답
export interface ClerkLinkResponse {
  success: boolean;
  message: string;
}

// 통합 인증 사용자 타입 (Clerk + Legacy)
export interface IntegratedAuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isClerkUser: boolean;
  // Legacy 사용자 추가 정보
  role?: string;
  profileCompletionRate?: number;
  isActive?: boolean;
}

// 인증 제공자 타입
export type AuthProvider = 'clerk' | 'jwt' | 'legacy';

// 인증 상태 타입
export interface AuthState {
  user: IntegratedAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  provider: AuthProvider;
  error?: string;
}

// 마이그레이션 상태
export interface MigrationStatus {
  eligible: boolean;
  reason?: string;
  instructions?: string[];
  benefits?: string[];
}

// Clerk 설정 타입
export interface ClerkConfig {
  publishableKey: string;
  enabled: boolean;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
}

// 환경변수 타입
export interface ClerkEnvironmentVariables {
  VITE_CLERK_PUBLISHABLE_KEY: string;
  VITE_USE_CLERK_AUTH: 'true' | 'false';
  VITE_CLERK_SIGN_IN_URL?: string;
  VITE_CLERK_SIGN_UP_URL?: string;
  VITE_CLERK_AFTER_SIGN_IN_URL?: string;
  VITE_CLERK_AFTER_SIGN_UP_URL?: string;
}

// Clerk 커스텀 훅 반환 타입
export interface UseClerkAuthReturn {
  user: IntegratedAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  isClerkEnabled: boolean;
  clerkUser: any; // Clerk User 타입
  isClerkLoaded: boolean;
  syncWithBackend?: (token: string) => Promise<ClerkBackendSyncResponse>;
  linkExistingAccount?: (token: string) => Promise<ClerkLinkResponse>;
}

// Clerk 에러 타입
export interface ClerkError extends Error {
  code: string;
  type: 'clerk_error';
  clerkError: any;
}

// 사용자 마이그레이션 도우미 타입
export interface MigrationInstructions {
  title: string;
  instructions: string[];
  benefits: string[];
}

// Clerk 커스텀 테마 타입 (Linear Design System 통합)
export interface ClerkCustomTheme {
  primaryColor: string;
  borderRadius: string;
  fontFamily: string;
  colorScheme: 'light' | 'dark' | 'auto';
}

// Clerk 외관 설정 타입
export interface ClerkAppearanceConfig {
  elements?: {
    [key: string]: string | React.CSSProperties;
  };
  variables?: {
    [key: string]: string;
  };
  layout?: {
    socialButtonsPlacement?: 'top' | 'bottom';
    socialButtonsVariant?: 'iconButton' | 'blockButton';
    showOptionalFields?: boolean;
  };
}

// 내보내기
export type {
  ClerkUser,
  ClerkBackendSyncRequest,
  ClerkBackendSyncResponse,
  ClerkTokenValidationRequest,
  ClerkTokenValidationResponse,
  ClerkLinkRequest,
  ClerkLinkResponse,
  IntegratedAuthUser,
  AuthProvider,
  AuthState,
  MigrationStatus,
  ClerkConfig,
  ClerkEnvironmentVariables,
  UseClerkAuthReturn,
  ClerkError,
  MigrationInstructions,
  ClerkCustomTheme,
  ClerkAppearanceConfig,
};