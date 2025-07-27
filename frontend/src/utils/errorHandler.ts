/**
 * 타입 안전한 에러 처리 유틸리티
 */
import {
  AppError,
  ApiError,
  NetworkError,
  AuthError,
  BusinessError,
  SystemError,
  ErrorCategory,
  ErrorSeverity,
  ErrorInfo,
  ErrorHandlingResult,
  ErrorContext,
  RetryPolicy,
  isApiError,
  isNetworkError,
  isAuthError,
  isBusinessError,
  isSystemError,
  categorizeError,
  getErrorSeverity
} from '../types/errors';

// 기본 재시도 정책
const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  delay: 1000,
  backoffFactor: 2,
  retryCondition: (error: AppError) => {
    if (isNetworkError(error)) {
      return error.code === 'TIMEOUT_ERROR' || error.code === 'CONNECTION_ERROR';
    }
    if (isSystemError(error)) {
      return error.code === 'SERVICE_UNAVAILABLE';
    }
    return false;
  }
};

/**
 * unknown 타입의 에러를 AppError로 변환
 */
export function normalizeError(error: unknown, context?: Partial<ErrorContext>): AppError {
  // 이미 AppError 타입인 경우
  if (isApiError(error) || isNetworkError(error)) {
    return error as AppError;
  }

  // Error 객체인 경우
  if (error instanceof Error) {
    const networkError: NetworkError = {
      name: error.name,
      message: error.message,
      code: 'NETWORK_ERROR',
      stack: error.stack
    };
    return networkError;
  }

  // 문자열인 경우
  if (typeof error === 'string') {
    const networkError: NetworkError = {
      name: 'Error',
      message: error,
      code: 'NETWORK_ERROR'
    };
    return networkError;
  }

  // 객체이지만 구조가 다른 경우
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    
    // Axios 에러 응답 형태 처리
    if ('response' in obj && typeof obj.response === 'object' && obj.response !== null) {
      const response = obj.response as Record<string, unknown>;
      if ('data' in response && typeof response.data === 'object' && response.data !== null) {
        const data = response.data as Record<string, unknown>;
        
        const apiError: ApiError = {
          message: (data.message as string) || '알 수 없는 오류가 발생했습니다.',
          code: (data.code as string) || 'UNKNOWN_ERROR',
          status: (response.status as number) || 500,
          timestamp: (data.timestamp as string) || new Date().toISOString(),
          path: (data.path as string) || context?.route || '',
          details: data.details as Record<string, unknown> || {}
        };
        return apiError;
      }
    }

    // 일반 객체인 경우
    const apiError: ApiError = {
      message: (obj.message as string) || '알 수 없는 오류가 발생했습니다.',
      code: (obj.code as string) || 'UNKNOWN_ERROR',
      status: (obj.status as number) || 500,
      timestamp: new Date().toISOString(),
      path: context?.route || '',
      details: obj
    };
    return apiError;
  }

  // 그 외의 경우 기본 에러 생성
  const defaultError: ApiError = {
    message: '알 수 없는 오류가 발생했습니다.',
    code: 'UNKNOWN_ERROR',
    status: 500,
    timestamp: new Date().toISOString(),
    path: context?.route || ''
  };
  return defaultError;
}

/**
 * 에러 정보 생성
 */
export function createErrorInfo(error: AppError, context?: ErrorContext): ErrorInfo {
  const category = categorizeError(error);
  const severity = getErrorSeverity(error);
  
  return {
    category,
    severity,
    message: error.message,
    details: 'details' in error ? error.details : undefined,
    timestamp: new Date(),
    userMessage: getUserFriendlyMessage(error)
  };
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getUserFriendlyMessage(error: AppError): string {
  if (isAuthError(error)) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return '로그인이 필요합니다.';
      case 'FORBIDDEN':
        return '접근 권한이 없습니다.';
      case 'TOKEN_EXPIRED':
        return '세션이 만료되었습니다. 다시 로그인해주세요.';
      case 'INVALID_CREDENTIALS':
        return '이메일 또는 비밀번호가 올바르지 않습니다.';
      default:
        return '인증 오류가 발생했습니다.';
    }
  }

  if (isNetworkError(error)) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return '네트워크 연결을 확인해주세요.';
      case 'TIMEOUT_ERROR':
        return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      case 'CONNECTION_ERROR':
        return '서버에 연결할 수 없습니다.';
      default:
        return '네트워크 오류가 발생했습니다.';
    }
  }

  if (isBusinessError(error)) {
    switch (error.code) {
      case 'VALIDATION_FAILED':
        return '입력 정보를 확인해주세요.';
      case 'RESOURCE_NOT_FOUND':
        return '요청하신 정보를 찾을 수 없습니다.';
      case 'BUSINESS_RULE_VIOLATION':
        return '비즈니스 규칙 위반입니다.';
      default:
        return '처리 중 오류가 발생했습니다.';
    }
  }

  if (isSystemError(error)) {
    switch (error.code) {
      case 'INTERNAL_ERROR':
        return '시스템 오류가 발생했습니다. 관리자에게 문의해주세요.';
      case 'SERVICE_UNAVAILABLE':
        return '서비스가 일시적으로 사용할 수 없습니다.';
      case 'DATABASE_ERROR':
        return '데이터 처리 중 오류가 발생했습니다.';
      default:
        return '시스템 오류가 발생했습니다.';
    }
  }

  return error.message || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 처리 로직
 */
export function handleError(
  error: unknown,
  context?: ErrorContext
): ErrorHandlingResult {
  const normalizedError = normalizeError(error, context);
  const errorInfo = createErrorInfo(normalizedError, context);

  // 로깅
  console.error('[Error Handler]', {
    error: normalizedError,
    context,
    errorInfo
  });

  // 처리 결과 결정
  const result: ErrorHandlingResult = {
    handled: true,
    retry: false,
    userMessage: errorInfo.userMessage || '오류가 발생했습니다.',
    logLevel: 'error'
  };

  // 재시도 가능한 에러인지 확인
  if (DEFAULT_RETRY_POLICY.retryCondition(normalizedError)) {
    result.retry = true;
  }

  // 심각도에 따른 로그 레벨 조정
  switch (errorInfo.severity) {
    case ErrorSeverity.LOW:
      result.logLevel = 'info';
      break;
    case ErrorSeverity.MEDIUM:
      result.logLevel = 'warn';
      break;
    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      result.logLevel = 'error';
      break;
  }

  return result;
}

/**
 * 재시도 로직을 포함한 async 함수 래퍼
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: Partial<RetryPolicy> = {},
  context?: ErrorContext
): Promise<T> {
  const retryPolicy = { ...DEFAULT_RETRY_POLICY, ...policy };
  let lastError: AppError;
  
  for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = normalizeError(error, context);
      
      // 마지막 시도이거나 재시도 조건에 맞지 않으면 에러 throw
      if (attempt === retryPolicy.maxAttempts || !retryPolicy.retryCondition(lastError)) {
        throw lastError;
      }
      
      // 대기 시간 계산 (exponential backoff)
      const delay = retryPolicy.delay * Math.pow(retryPolicy.backoffFactor, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`재시도 ${attempt}/${retryPolicy.maxAttempts}:`, {
        error: lastError,
        delay,
        context
      });
    }
  }
  
  throw lastError!;
}

/**
 * Promise를 안전하게 실행하고 결과를 반환
 */
export async function safeExecute<T>(
  promise: Promise<T>,
  context?: ErrorContext
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await promise;
    return { data };
  } catch (error) {
    const normalizedError = normalizeError(error, context);
    return { error: normalizedError };
  }
}

/**
 * 여러 Promise를 안전하게 실행
 */
export async function safeExecuteAll<T>(
  promises: Promise<T>[],
  context?: ErrorContext
): Promise<{ results: Array<{ data?: T; error?: AppError }> }> {
  const results = await Promise.allSettled(promises);
  
  return {
    results: results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { data: result.value };
      } else {
        const error = normalizeError(result.reason, {
          ...context,
          metadata: { ...context?.metadata, promiseIndex: index }
        });
        return { error };
      }
    })
  };
}

/**
 * 타입 안전한 에러 로거
 */
export const errorLogger = {
  error: (error: unknown, context?: ErrorContext) => {
    const normalizedError = normalizeError(error, context);
    const errorInfo = createErrorInfo(normalizedError, context);
    
    console.error('[Error]', {
      message: errorInfo.message,
      category: errorInfo.category,
      severity: errorInfo.severity,
      error: normalizedError,
      context,
      timestamp: errorInfo.timestamp
    });
  },
  
  warn: (error: unknown, context?: ErrorContext) => {
    const normalizedError = normalizeError(error, context);
    
    console.warn('[Warning]', {
      message: normalizedError.message,
      error: normalizedError,
      context
    });
  },
  
  info: (message: string, context?: ErrorContext) => {
    console.info('[Info]', { message, context });
  }
};