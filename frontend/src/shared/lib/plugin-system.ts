/**
 * 플러그인 시스템
 * 기능의 동적 확장을 위한 플러그인 아키텍처
 */

// 플러그인 인터페이스
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  init?: (context: PluginContext) => Promise<void> | void;
  destroy?: () => Promise<void> | void;
}

// 플러그인 컨텍스트
export interface PluginContext {
  registry: PluginRegistry;
  config: Record<string, any>;
  hooks: HookSystem;
}

// 훅 시스템
export interface HookSystem {
  register: (hookName: string, callback: Function) => void;
  unregister: (hookName: string, callback: Function) => void;
  execute: (hookName: string, ...args: any[]) => Promise<any[]>;
  executeSync: (hookName: string, ...args: any[]) => any[];
}

// 플러그인 등록소
export class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private initialized = new Set<string>();
  private hooks: HookSystem;

  constructor() {
    this.hooks = new HookSystemImpl();
  }

  // 플러그인 등록
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // 의존성 검사
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" depends on "${dep}" which is not registered`);
        }
      }
    }

    this.plugins.set(plugin.name, plugin);
  }

  // 플러그인 초기화
  async initialize(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    if (this.initialized.has(pluginName)) {
      return; // 이미 초기화됨
    }

    // 의존성 먼저 초기화
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        await this.initialize(dep);
      }
    }

    // 플러그인 초기화
    if (plugin.init) {
      const context: PluginContext = {
        registry: this,
        config: this.getConfig(pluginName),
        hooks: this.hooks,
      };
      
      await plugin.init(context);
    }

    this.initialized.add(pluginName);
    console.log(`Plugin "${pluginName}" initialized`);
  }

  // 모든 플러그인 초기화
  async initializeAll(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys());
    
    for (const name of pluginNames) {
      if (!this.initialized.has(name)) {
        await this.initialize(name);
      }
    }
  }

  // 플러그인 제거
  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return;
    }

    // 정리 작업 실행
    if (plugin.destroy) {
      await plugin.destroy();
    }

    this.plugins.delete(pluginName);
    this.initialized.delete(pluginName);
    console.log(`Plugin "${pluginName}" unregistered`);
  }

  // 플러그인 목록 조회
  list(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  // 플러그인 조회
  get(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  // 플러그인 설정 조회
  private getConfig(pluginName: string): Record<string, any> {
    // 환경변수나 설정 파일에서 플러그인별 설정 로드
    return {};
  }

  // 훅 시스템 접근
  getHooks(): HookSystem {
    return this.hooks;
  }
}

// 훅 시스템 구현
class HookSystemImpl implements HookSystem {
  private hooks = new Map<string, Set<Function>>();

  register(hookName: string, callback: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, new Set());
    }
    this.hooks.get(hookName)!.add(callback);
  }

  unregister(hookName: string, callback: Function): void {
    const callbacks = this.hooks.get(hookName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.hooks.delete(hookName);
      }
    }
  }

  async execute(hookName: string, ...args: any[]): Promise<any[]> {
    const callbacks = this.hooks.get(hookName);
    if (!callbacks) {
      return [];
    }

    const results = [];
    for (const callback of callbacks) {
      try {
        const result = await callback(...args);
        results.push(result);
      } catch (error) {
        console.error(`Hook "${hookName}" callback failed:`, error);
      }
    }

    return results;
  }

  executeSync(hookName: string, ...args: any[]): any[] {
    const callbacks = this.hooks.get(hookName);
    if (!callbacks) {
      return [];
    }

    const results = [];
    for (const callback of callbacks) {
      try {
        const result = callback(...args);
        results.push(result);
      } catch (error) {
        console.error(`Hook "${hookName}" callback failed:`, error);
      }
    }

    return results;
  }
}

// 전역 플러그인 레지스트리
export const pluginRegistry = new PluginRegistry();

// 플러그인 데코레이터
export function createPlugin(config: Omit<Plugin, 'init' | 'destroy'>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor implements Plugin {
      name = config.name;
      version = config.version;
      description = config.description;
      dependencies = config.dependencies;

      async init(context: PluginContext): Promise<void> {
        if (this.onInit) {
          await this.onInit(context);
        }
      }

      async destroy(): Promise<void> {
        if (this.onDestroy) {
          await this.onDestroy();
        }
      }

      // 하위 클래스에서 구현할 수 있는 메서드들
      protected onInit?(context: PluginContext): Promise<void> | void;
      protected onDestroy?(): Promise<void> | void;
    };
  };
}

// 빌트인 훅들
export const BuiltinHooks = {
  // 라이프사이클 훅
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_DESTROY: 'app:destroy',
  
  // 라우팅 훅
  ROUTE_CHANGE: 'route:change',
  ROUTE_BEFORE_ENTER: 'route:before-enter',
  ROUTE_AFTER_ENTER: 'route:after-enter',
  
  // 인증 훅
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_REFRESH: 'auth:token-refresh',
  
  // API 훅
  API_REQUEST: 'api:request',
  API_RESPONSE: 'api:response',
  API_ERROR: 'api:error',
  
  // UI 훅
  THEME_CHANGE: 'ui:theme-change',
  MODAL_OPEN: 'ui:modal-open',
  MODAL_CLOSE: 'ui:modal-close',
} as const;