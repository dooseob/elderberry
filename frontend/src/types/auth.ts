/**
 * 인증 관련 타입 정의
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: MemberRole;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  member: MemberResponse;
}

export interface EnhancedTokenResponse extends TokenResponse {
  tokenMetadata: TokenMetadataResponse;
}

export interface TokenMetadataResponse {
  issuedAt: string;
  expiresAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  deviceId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  memberEmail: string;
  expiresAt: string;
  remainingTime: number;
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  FACILITY = 'FACILITY',
  COORDINATOR = 'COORDINATOR',
  USER_DOMESTIC = 'USER_DOMESTIC',
  USER_OVERSEAS = 'USER_OVERSEAS',
  JOB_SEEKER_DOMESTIC = 'JOB_SEEKER_DOMESTIC',
  JOB_SEEKER_OVERSEAS = 'JOB_SEEKER_OVERSEAS'
}

export interface MemberResponse {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  role: MemberRole;
  profileCompletionRate?: number;
  isActive: boolean;
  isJobSeeker?: boolean;
  language?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberUpdateRequest {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: MemberRole;
  profileCompletionRate: number;
  isActive: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API 에러 타입
export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  path: string;
}