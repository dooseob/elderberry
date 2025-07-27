/**
 * 개발 환경 전용 로거 유틸리티
 * 프로덕션 빌드에서는 자동으로 제거됩니다
 */

const isDev = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

/**
 * 개발 환경에서만 동작하는 로거
 */
export const devLogger = {
  /**
   * 개발용 로그 - 프로덕션에서 자동 제거
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log('[DEV]', ...args);
    }
  },

  /**
   * 개발용 경고 - 프로덕션에서 자동 제거
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn('[DEV]', ...args);
    }
  },

  /**
   * 개발용 디버그 정보 - 프로덕션에서 자동 제거
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * 성능 측정용 로그 - 프로덕션에서 자동 제거
   */
  performance: (label: string, duration?: number) => {
    if (isDev) {
      console.log(`[PERF] ${label}${duration ? `: ${duration.toFixed(2)}ms` : ''}`);
    }
  },

  /**
   * 사용자 액션 추적용 로그 - 프로덕션에서 자동 제거
   */
  action: (action: string, data?: any) => {
    if (isDev) {
      console.log(`[ACTION] ${action}`, data || '');
    }
  }
};

/**
 * 항상 동작하는 에러 로거 (프로덕션에서도 유지)
 */
export const errorLogger = {
  /**
   * 사용자에게 영향을 주는 에러
   */
  error: (message: string, error?: any, context?: any) => {
    console.error(`[ERROR] ${message}`, error || '', context || '');
  },

  /**
   * 중요한 경고 (사용자 경험에 영향)
   */
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },

  /**
   * 네트워크 에러 전용
   */
  network: (endpoint: string, error: any) => {
    console.error(`[NETWORK] ${endpoint} 요청 실패:`, error);
  },

  /**
   * 컴포넌트 에러 경계용
   */
  component: (componentName: string, error: any, errorInfo?: any) => {
    console.error(`[COMPONENT] ${componentName} 에러:`, error);
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }
  }
};

/**
 * 테스트 환경용 로거
 */
export const testLogger = {
  log: (...args: any[]) => {
    if (isTest) {
      console.log('[TEST]', ...args);
    }
  }
};

/**
 * 레거시 console 사용을 위한 타입 체크
 * @deprecated devLogger 또는 errorLogger 사용을 권장합니다
 */
export const legacyConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

export default devLogger;