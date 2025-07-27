/**
 * 에러 처리 관련 타입 정의
 * TypeScript 안전성을 위한 에러 타입 체계화
 */

// 기본 API 에러 인터페이스
export interface BaseApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  path: string;
}

// 확장된 API 에러 인터페이스
export interface ApiError extends BaseApiError {
  details?: Record<string, unknown>;
  validation?: ValidationError[];
}

// 유효성 검증 에러
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// 네트워크 에러
export interface NetworkError extends Error {
  code: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'CONNECTION_ERROR';
  status?: number;
  url?: string;
}

// 인증 에러
export interface AuthError extends BaseApiError {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS';
  remainingTime?: number;
}

// 비즈니스 로직 에러
export interface BusinessError extends BaseApiError {
  code: 'VALIDATION_FAILED' | 'RESOURCE_NOT_FOUND' | 'BUSINESS_RULE_VIOLATION';
  details: Record<string, unknown>;
}

// 시스템 에러
export interface SystemError extends BaseApiError {
  code: 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE' | 'DATABASE_ERROR';
  correlationId?: string;
}

// 에러 타입 유니언
export type AppError = ApiError | NetworkError | AuthError | BusinessError | SystemError;

// 에러 카테고리
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN'
}

// 에러 심각도
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 에러 정보 인터페이스
export interface ErrorInfo {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userMessage?: string; // 사용자에게 표시할 메시지
}

// 에러 핸들링 결과
export interface ErrorHandlingResult {
  handled: boolean;
  retry: boolean;
  userMessage: string;
  logLevel: 'error' | 'warn' | 'info';
}

// 재시도 정책
export interface RetryPolicy {
  maxAttempts: number;
  delay: number;
  backoffFactor: number;
  retryCondition: (error: AppError) => boolean;
}

// 에러 컨텍스트 (에러 발생 시 추가 정보)
export interface ErrorContext {
  userId?: number;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

// 에러 로그 인터페이스
export interface ErrorLog {
  id: string;
  timestamp: Date;
  error: AppError;
  context: ErrorContext;
  handled: boolean;
  resolved: boolean;
}

// 타입 가드 함수들
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error &&
    'status' in error &&
    'timestamp' in error &&
    'path' in error
  );
}

export function isNetworkError(error: unknown): error is NetworkError {
  return (
    error instanceof Error &&
    'code' in error &&
    ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'CONNECTION_ERROR'].includes(
      (error as NetworkError).code
    )
  );
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    isApiError(error) &&
    ['UNAUTHORIZED', 'FORBIDDEN', 'TOKEN_EXPIRED', 'INVALID_CREDENTIALS'].includes(
      error.code
    )
  );
}

export function isBusinessError(error: unknown): error is BusinessError {
  return (
    isApiError(error) &&
    ['VALIDATION_FAILED', 'RESOURCE_NOT_FOUND', 'BUSINESS_RULE_VIOLATION'].includes(
      error.code
    )
  );
}

export function isSystemError(error: unknown): error is SystemError {
  return (
    isApiError(error) &&
    ['INTERNAL_ERROR', 'SERVICE_UNAVAILABLE', 'DATABASE_ERROR'].includes(
      error.code
    )
  );
}

// 에러 타입 결정 함수
export function categorizeError(error: unknown): ErrorCategory {
  if (isNetworkError(error)) return ErrorCategory.NETWORK;
  if (isAuthError(error)) return ErrorCategory.AUTH;
  if (isBusinessError(error)) return ErrorCategory.BUSINESS;
  if (isSystemError(error)) return ErrorCategory.SYSTEM;
  if (isApiError(error)) return ErrorCategory.VALIDATION;
  return ErrorCategory.UNKNOWN;
}

// 에러 심각도 결정 함수
export function getErrorSeverity(error: AppError): ErrorSeverity {
  if (isAuthError(error)) {
    return error.code === 'UNAUTHORIZED' ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
  }
  
  if (isSystemError(error)) {
    return ErrorSeverity.CRITICAL;
  }
  
  if (isNetworkError(error)) {
    return ErrorSeverity.MEDIUM;
  }
  
  if (isBusinessError(error)) {
    return ErrorSeverity.LOW;
  }
  
  return ErrorSeverity.MEDIUM;
}