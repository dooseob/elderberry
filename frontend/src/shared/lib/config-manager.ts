/**
 * 설정 관리 시스템
 * 환경별 설정과 기능 플래그 관리
 */

// 환경 타입
export type Environment = 'development' | 'staging' | 'production';

// 기본 설정 인터페이스
export interface AppConfig {
  // 환경 설정
  environment: Environment;
  version: string;
  buildTime: string;
  
  // API 설정
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // 인증 설정
  auth: {
    tokenStorageKey: string;
    refreshTokenStorageKey: string;
    sessionTimeout: number;
    autoRefresh: boolean;
  };
  
  // UI 설정
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: string;
    timezone: string;
  };
  
  // 기능 플래그
  features: Record<string, boolean>;
  
  // 성능 설정
  performance: {
    enableVirtualization: boolean;
    lazyLoadingThreshold: number;
    cacheTimeout: number;
    maxCacheSize: number;
  };
  
  // 로깅 설정
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableRemote: boolean;
    remoteUrl?: string;
  };
  
  // 모니터링 설정
  monitoring: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enablePerformanceTracking: boolean;
    sampleRate: number;
  };
}

// 설정 검증 스키마
const configSchema = {
  environment: ['development', 'staging', 'production'],
  'api.timeout': (value: number) => value > 0 && value <= 60000,
  'auth.sessionTimeout': (value: number) => value > 0,
  'ui.language': (value: string) => value.length === 2,
  'logging.level': ['debug', 'info', 'warn', 'error'],
  'monitoring.sampleRate': (value: number) => value >= 0 && value <= 1,
};

// 설정 관리자 클래스
export class ConfigManager {
  private config: AppConfig;
  private overrides: Partial<AppConfig> = {};
  private listeners: Set<(config: AppConfig) => void> = new Set();

  constructor(initialConfig: AppConfig) {
    this.config = this.mergeConfigs(initialConfig, this.loadFromEnvironment());
    this.validateConfig();
  }

  // 환경변수에서 설정 로드
  private loadFromEnvironment(): Partial<AppConfig> {
    const env = import.meta.env;
    
    return {
      api: {
        baseUrl: env.VITE_API_BASE_URL,
        timeout: env.VITE_API_TIMEOUT ? parseInt(env.VITE_API_TIMEOUT) : undefined,
      },
      features: this.parseFeatureFlags(env.VITE_FEATURE_FLAGS),
      logging: {
        level: env.VITE_LOG_LEVEL as any,
        enableRemote: env.VITE_ENABLE_REMOTE_LOGGING === 'true',
        remoteUrl: env.VITE_REMOTE_LOGGING_URL,
      },
      monitoring: {
        enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
        enableErrorReporting: env.VITE_ENABLE_ERROR_REPORTING === 'true',
        enablePerformanceTracking: env.VITE_ENABLE_PERFORMANCE_TRACKING === 'true',
        sampleRate: env.VITE_MONITORING_SAMPLE_RATE ? parseFloat(env.VITE_MONITORING_SAMPLE_RATE) : undefined,
      },
    };
  }

  // 기능 플래그 파싱
  private parseFeatureFlags(flagsString?: string): Record<string, boolean> {
    if (!flagsString) return {};
    
    const flags: Record<string, boolean> = {};
    const pairs = flagsString.split(',');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        flags[key.trim()] = value.trim().toLowerCase() === 'true';
      }
    }
    
    return flags;
  }

  // 설정 병합
  private mergeConfigs(...configs: Partial<AppConfig>[]): AppConfig {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {} as AppConfig);
  }

  // 깊은 병합
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // 설정 검증
  private validateConfig(): void {
    for (const [path, validator] of Object.entries(configSchema)) {
      const value = this.getNestedValue(this.config, path);
      
      if (Array.isArray(validator)) {
        if (!validator.includes(value)) {
          throw new Error(`Invalid config value for ${path}: ${value}. Expected one of: ${validator.join(', ')}`);
        }
      } else if (typeof validator === 'function') {
        if (!validator(value)) {
          throw new Error(`Invalid config value for ${path}: ${value}`);
        }
      }
    }
  }

  // 중첩된 값 가져오기
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // 설정 값 가져오기
  get<T = any>(path: string): T {
    const value = this.getNestedValue(this.config, path);
    const override = this.getNestedValue(this.overrides, path);
    return override !== undefined ? override : value;
  }

  // 전체 설정 가져오기
  getAll(): AppConfig {
    return this.mergeConfigs(this.config, this.overrides);
  }

  // 설정 값 설정 (런타임 오버라이드)
  set(path: string, value: any): void {
    const pathParts = path.split('.');
    let current = this.overrides;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    this.notifyListeners();
  }

  // 기능 플래그 확인
  isFeatureEnabled(featureName: string): boolean {
    return this.get(`features.${featureName}`) === true;
  }

  // 기능 플래그 토글
  toggleFeature(featureName: string, enabled?: boolean): void {
    const currentValue = this.isFeatureEnabled(featureName);
    const newValue = enabled !== undefined ? enabled : !currentValue;
    this.set(`features.${featureName}`, newValue);
  }

  // 환경별 설정 확인
  isDevelopment(): boolean {
    return this.get('environment') === 'development';
  }

  isProduction(): boolean {
    return this.get('environment') === 'production';
  }

  isStaging(): boolean {
    return this.get('environment') === 'staging';
  }

  // 설정 변경 리스너 등록
  subscribe(listener: (config: AppConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 리스너들에게 알림
  private notifyListeners(): void {
    const currentConfig = this.getAll();
    this.listeners.forEach(listener => {
      try {
        listener(currentConfig);
      } catch (error) {
        console.error('Config listener error:', error);
      }
    });
  }

  // 설정 초기화
  reset(): void {
    this.overrides = {};
    this.notifyListeners();
  }

  // 설정 내보내기 (디버깅용)
  export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }
}

// 기본 설정
const defaultConfig: AppConfig = {
  environment: 'development',
  version: '1.0.0',
  buildTime: new Date().toISOString(),
  
  api: {
    baseUrl: 'http://localhost:8080/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  auth: {
    tokenStorageKey: 'accessToken',
    refreshTokenStorageKey: 'refreshToken',
    sessionTimeout: 3600000, // 1시간
    autoRefresh: true,
  },
  
  ui: {
    theme: 'system',
    language: 'ko',
    dateFormat: 'YYYY-MM-DD',
    timezone: 'Asia/Seoul',
  },
  
  features: {
    darkMode: true,
    advancedSearch: true,
    notifications: true,
    analytics: false,
    betaFeatures: false,
  },
  
  performance: {
    enableVirtualization: true,
    lazyLoadingThreshold: 100,
    cacheTimeout: 300000, // 5분
    maxCacheSize: 100,
  },
  
  logging: {
    level: 'info',
    enableConsole: true,
    enableRemote: false,
  },
  
  monitoring: {
    enableAnalytics: false,
    enableErrorReporting: false,
    enablePerformanceTracking: false,
    sampleRate: 0.1,
  },
};

// 전역 설정 관리자 인스턴스
export const configManager = new ConfigManager(defaultConfig);

// React 훅
export const useConfig = () => {
  const [config, setConfig] = React.useState(configManager.getAll());
  
  React.useEffect(() => {
    return configManager.subscribe(setConfig);
  }, []);
  
  return {
    config,
    get: configManager.get.bind(configManager),
    set: configManager.set.bind(configManager),
    isFeatureEnabled: configManager.isFeatureEnabled.bind(configManager),
    toggleFeature: configManager.toggleFeature.bind(configManager),
    isDevelopment: configManager.isDevelopment.bind(configManager),
    isProduction: configManager.isProduction.bind(configManager),
    isStaging: configManager.isStaging.bind(configManager),
  };
};