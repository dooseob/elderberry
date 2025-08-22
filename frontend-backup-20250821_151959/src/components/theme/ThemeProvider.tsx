/**
 * Linear Theme Provider
 * React Context API 기반 테마 관리 시스템
 * 
 * @version 2025.1.0
 * @author React 전문가 (Linear Theme System)
 * 
 * Features:
 * - React Context API 기반 상태 관리
 * - 로컬 스토리지 자동 동기화
 * - 시스템 테마 감지 및 자동 전환
 * - 접근성 설정 자동 감지
 * - 테마 변경 애니메이션
 * - 커스텀 테마 지원
 * - 테마 히스토리 추적
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type {
  LinearTheme,
  ThemeConfig,
  ThemeEvent,
  ThemeEventType,
  ThemeHistoryEntry,
  ThemeApplicationOptions,
  ThemePreview,
  LCHColor,
  ThemeVariant,
  ThemeCategory,
  THEME_CONSTANTS,
} from '../../types/theme';

// 기본 테마 정의 (JSON 데이터 기반)
const DEFAULT_THEMES: Record<string, ThemeConfig> = {
  'default-light': {
    core: {
      base: [95, 2, 266, 1],
      accent: [44, 99, 307, 1],
      contrast: 30,
    }
  },
  'default-dark': {
    core: {
      base: [18, 11, 280, 1],
      accent: [72, 40, 311, 1],
      contrast: 30,
    }
  },
  'catppuccin-latte': {
    core: {
      base: [95.07617314910061, 2.1856276247566773, 265.9705972968138, 1],
      accent: [43.717135811988086, 99.37386079300107, 307.12305463765506, 1],
      contrast: 30,
    }
  },
  'catppuccin-mocha': {
    core: {
      base: [16.02115422223583, 13.102236978320558, 282.51213623981425, 1],
      accent: [71.7932136171783, 46.50946588741101, 305.26693753987405, 1],
      contrast: 30,
    }
  },
  'github-light': {
    core: {
      base: [98, 0, 0, 1],
      accent: [40, 80, 210, 1],
      contrast: 35,
    }
  },
  'tokyo-night': {
    core: {
      base: [15, 15, 250, 1],
      accent: [60, 90, 200, 1],
      contrast: 40,
    }
  },
  'minimal-dark': {
    core: {
      base: [12, 8, 270, 1],
      accent: [65, 85, 250, 1],
      contrast: 35,
      sidebar: {
        base: [8, 5, 270, 1],
        accent: [65, 85, 250, 1],
        contrast: 35,
      },
    }
  },
  'warm-light': {
    core: {
      base: [97, 5, 40, 1],
      accent: [50, 90, 15, 1],
      contrast: 30,
      sidebar: {
        base: [94, 8, 40, 1],
        accent: [50, 90, 15, 1],
        contrast: 30,
      },
    }
  },
};

// 테마 상태 인터페이스
interface ThemeState {
  currentThemeId: string;
  availableThemes: Record<string, ThemeConfig>;
  customThemes: Record<string, ThemeConfig>;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isSystemTheme: boolean;
  loading: boolean;
  error: string | null;
  history: ThemeHistoryEntry[];
}

// 테마 액션 타입
type ThemeAction =
  | { type: 'SET_THEME'; payload: { themeId: string; options?: ThemeApplicationOptions } }
  | { type: 'ADD_CUSTOM_THEME'; payload: { themeId: string; config: ThemeConfig } }
  | { type: 'REMOVE_CUSTOM_THEME'; payload: { themeId: string } }
  | { type: 'TOGGLE_HIGH_CONTRAST' }
  | { type: 'TOGGLE_REDUCED_MOTION' }
  | { type: 'SET_SYSTEM_THEME'; payload: { enabled: boolean } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'LOAD_THEMES'; payload: { themes: Record<string, ThemeConfig> } }
  | { type: 'ADD_HISTORY_ENTRY'; payload: { entry: ThemeHistoryEntry } }
  | { type: 'CLEAR_HISTORY' };

// 테마 컨텍스트 인터페이스
interface ThemeContextValue {
  // 상태
  currentThemeId: string;
  availableThemes: Record<string, ThemeConfig>;
  customThemes: Record<string, ThemeConfig>;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isSystemTheme: boolean;
  loading: boolean;
  error: string | null;
  history: ThemeHistoryEntry[];

  // 파생된 상태
  currentTheme: ThemeConfig | null;
  isDarkMode: boolean;
  allThemes: Record<string, ThemeConfig>;
  themePreview: ThemePreview[];

  // 액션
  setTheme: (themeId: string, options?: ThemeApplicationOptions) => Promise<void>;
  addCustomTheme: (themeId: string, config: ThemeConfig) => Promise<void>;
  removeCustomTheme: (themeId: string) => Promise<void>;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleSystemTheme: (enabled: boolean) => void;
  generateThemeFromColors: (name: string, base: LCHColor, accent: LCHColor, contrast?: number) => Promise<string>;
  exportTheme: (themeId: string) => string | null;
  importTheme: (themeJson: string) => Promise<string>;
  resetToDefaults: () => Promise<void>;
  clearHistory: () => void;

  // 이벤트
  addEventListener: (type: ThemeEventType, listener: (event: ThemeEvent) => void) => void;
  removeEventListener: (type: ThemeEventType, listener: (event: ThemeEvent) => void) => void;
}

// 초기 상태
const initialState: ThemeState = {
  currentThemeId: 'default-light',
  availableThemes: DEFAULT_THEMES,
  customThemes: {},
  isHighContrast: false,
  isReducedMotion: false,
  isSystemTheme: false,
  loading: false,
  error: null,
  history: [],
};

// 테마 리듀서
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        currentThemeId: action.payload.themeId,
        error: null,
      };

    case 'ADD_CUSTOM_THEME':
      return {
        ...state,
        customThemes: {
          ...state.customThemes,
          [action.payload.themeId]: action.payload.config,
        },
      };

    case 'REMOVE_CUSTOM_THEME':
      const { [action.payload.themeId]: removed, ...remainingCustomThemes } =
        state.customThemes;
      return {
        ...state,
        customThemes: remainingCustomThemes,
        currentThemeId:
          state.currentThemeId === action.payload.themeId
            ? 'default-light'
            : state.currentThemeId,
      };

    case 'TOGGLE_HIGH_CONTRAST':
      return {
        ...state,
        isHighContrast: !state.isHighContrast,
      };

    case 'TOGGLE_REDUCED_MOTION':
      return {
        ...state,
        isReducedMotion: !state.isReducedMotion,
      };

    case 'SET_SYSTEM_THEME':
      return {
        ...state,
        isSystemTheme: action.payload.enabled,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };

    case 'LOAD_THEMES':
      return {
        ...state,
        availableThemes: {
          ...state.availableThemes,
          ...action.payload.themes,
        },
      };

    case 'ADD_HISTORY_ENTRY':
      return {
        ...state,
        history: [action.payload.entry, ...state.history.slice(0, 49)], // 최대 50개 항목 유지
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: [],
      };

    default:
      return state;
  }
};

// 테마 컨텍스트 생성
const ThemeContext = createContext<ThemeContextValue | null>(null);

// 이벤트 리스너 관리
class ThemeEventEmitter {
  private listeners: Map<ThemeEventType, Set<(event: ThemeEvent) => void>> = new Map();

  addEventListener(type: ThemeEventType, listener: (event: ThemeEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: ThemeEventType, listener: (event: ThemeEvent) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit(type: ThemeEventType, data?: Record<string, any>) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const event: ThemeEvent = {
        type,
        timestamp: new Date(),
        data,
      };
      listeners.forEach(listener => listener(event));
    }
  }
}

// 테마 프로바이더 Props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
  enableSystemTheme?: boolean;
  enableAnimations?: boolean;
  storageKey?: string;
}

// 테마 프로바이더 컴포넌트
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
  enableSystemTheme = true,
  enableAnimations = true,
  storageKey = 'linear-theme-state',
}) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  const eventEmitter = useMemo(() => new ThemeEventEmitter(), []);

  // 로컬 스토리지에서 상태 로드
  useEffect(() => {
    const loadStoredState = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { loading: true } });

        // 저장된 테마 상태 로드
        const storedState = localStorage.getItem(storageKey);
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          
          // 커스텀 테마 로드
          if (parsedState.customThemes) {
            Object.entries(parsedState.customThemes).forEach(([id, config]) => {
              dispatch({
                type: 'ADD_CUSTOM_THEME',
                payload: { themeId: id, config: config as ThemeConfig },
              });
            });
          }

          // 현재 테마 설정
          if (parsedState.currentThemeId) {
            dispatch({
              type: 'SET_THEME',
              payload: { themeId: parsedState.currentThemeId },
            });
          }

          // 접근성 설정 로드
          if (parsedState.isHighContrast !== undefined) {
            if (parsedState.isHighContrast !== state.isHighContrast) {
              dispatch({ type: 'TOGGLE_HIGH_CONTRAST' });
            }
          }
        }

        // 초기 테마 설정
        const finalThemeId = initialTheme || state.currentThemeId;
        await setTheme(finalThemeId);

        dispatch({ type: 'SET_LOADING', payload: { loading: false } });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: '테마 상태를 로드하는 중 오류가 발생했습니다.' },
        });
      }
    };

    loadStoredState();
  }, [initialTheme, storageKey]);

  // 상태를 로컬 스토리지에 저장
  useEffect(() => {
    const stateToSave = {
      currentThemeId: state.currentThemeId,
      customThemes: state.customThemes,
      isHighContrast: state.isHighContrast,
      isReducedMotion: state.isReducedMotion,
      isSystemTheme: state.isSystemTheme,
    };

    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [
    state.currentThemeId,
    state.customThemes,
    state.isHighContrast,
    state.isReducedMotion,
    state.isSystemTheme,
    storageKey,
  ]);

  // CSS 커스텀 프로퍼티 적용
  const applyCSSProperties = useCallback((config: ThemeConfig, options: ThemeApplicationOptions = {}) => {
    const root = document.documentElement;
    const { animated = enableAnimations, animationDuration = 300 } = options;

    // 애니메이션 설정
    if (animated) {
      root.style.setProperty('--theme-transition-duration', `${animationDuration}ms`);
      root.classList.add('theme-transitioning');
    }

    // LCH 값 적용
    const { base, accent, contrast, sidebar } = config.core;
    root.style.setProperty('--linear-lch-base', `${base[0]} ${base[1]} ${base[2]}`);
    root.style.setProperty('--linear-lch-accent', `${accent[0]} ${accent[1]} ${accent[2]}`);
    root.style.setProperty('--linear-contrast', contrast.toString());

    // 사이드바 테마 적용
    if (sidebar) {
      root.style.setProperty('--linear-sidebar-lch-base', `${sidebar.base[0]} ${sidebar.base[1]} ${sidebar.base[2]}`);
      root.style.setProperty('--linear-sidebar-lch-accent', `${sidebar.accent[0]} ${sidebar.accent[1]} ${sidebar.accent[2]}`);
      root.style.setProperty('--linear-sidebar-contrast', sidebar.contrast.toString());
    }

    // 테마 클래스 적용
    const isDark = base[0] <= 50;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(isDark ? 'theme-dark' : 'theme-light');

    // 고대비 모드 클래스
    if (state.isHighContrast) {
      root.classList.add('theme-high-contrast');
    } else {
      root.classList.remove('theme-high-contrast');
    }

    // 모션 감소 클래스
    if (state.isReducedMotion) {
      root.classList.add('theme-reduced-motion');
    } else {
      root.classList.remove('theme-reduced-motion');
    }

    // 애니메이션 완료 후 정리
    if (animated) {
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
        root.style.removeProperty('--theme-transition-duration');
        options.onComplete?.();
      }, animationDuration);
    } else {
      options.onComplete?.();
    }
  }, [enableAnimations, state.isHighContrast, state.isReducedMotion]);

  // 테마 설정
  const setTheme = useCallback(async (themeId: string, options: ThemeApplicationOptions = {}) => {
    try {
      const allThemes = { ...state.availableThemes, ...state.customThemes };
      const themeConfig = allThemes[themeId];

      if (!themeConfig) {
        throw new Error(`테마 '${themeId}'를 찾을 수 없습니다.`);
      }

      const previousThemeId = state.currentThemeId;
      
      dispatch({ type: 'SET_THEME', payload: { themeId, options } });
      applyCSSProperties(themeConfig, options);

      // 히스토리 추가
      const historyEntry: ThemeHistoryEntry = {
        themeId,
        themeName: `Theme ${themeId}`,
        changedAt: new Date(),
        reason: options.immediate ? 'immediate' : 'user-selection',
      };
      dispatch({ type: 'ADD_HISTORY_ENTRY', payload: { entry: historyEntry } });

      // 이벤트 발생
      eventEmitter.emit('theme-changed', {
        themeId,
        previousThemeId,
        config: themeConfig,
      });

      if (options.persist !== false) {
        localStorage.setItem('linear-current-theme', themeId);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
      eventEmitter.emit('theme-error', { error: errorMessage });
      options.onError?.(error as Error);
      throw error;
    }
  }, [state.availableThemes, state.customThemes, state.currentThemeId, applyCSSProperties, eventEmitter]);

  // 커스텀 테마 추가
  const addCustomTheme = useCallback(async (themeId: string, config: ThemeConfig) => {
    try {
      dispatch({ type: 'ADD_CUSTOM_THEME', payload: { themeId, config } });
      
      // 커스텀 테마를 별도 저장
      const customThemes = JSON.parse(localStorage.getItem('linear-custom-themes') || '{}');
      customThemes[themeId] = config;
      localStorage.setItem('linear-custom-themes', JSON.stringify(customThemes));

      eventEmitter.emit('custom-theme-created', { themeId, config });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '커스텀 테마 추가 중 오류가 발생했습니다.';
      dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  }, [eventEmitter]);

  // 커스텀 테마 제거
  const removeCustomTheme = useCallback(async (themeId: string) => {
    try {
      dispatch({ type: 'REMOVE_CUSTOM_THEME', payload: { themeId } });
      
      // 로컬 스토리지에서도 제거
      const customThemes = JSON.parse(localStorage.getItem('linear-custom-themes') || '{}');
      delete customThemes[themeId];
      localStorage.setItem('linear-custom-themes', JSON.stringify(customThemes));

      eventEmitter.emit('custom-theme-deleted', { themeId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '커스텀 테마 제거 중 오류가 발생했습니다.';
      dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  }, [eventEmitter]);

  // 고대비 모드 토글
  const toggleHighContrast = useCallback(() => {
    dispatch({ type: 'TOGGLE_HIGH_CONTRAST' });
    eventEmitter.emit('contrast-toggled', { isHighContrast: !state.isHighContrast });
    
    // 현재 테마 재적용
    const allThemes = { ...state.availableThemes, ...state.customThemes };
    const currentConfig = allThemes[state.currentThemeId];
    if (currentConfig) {
      applyCSSProperties(currentConfig);
    }
  }, [state.isHighContrast, state.availableThemes, state.customThemes, state.currentThemeId, applyCSSProperties, eventEmitter]);

  // 모션 감소 토글
  const toggleReducedMotion = useCallback(() => {
    dispatch({ type: 'TOGGLE_REDUCED_MOTION' });
  }, []);

  // 시스템 테마 토글
  const toggleSystemTheme = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_SYSTEM_THEME', payload: { enabled } });
    
    if (enabled) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemThemeId = prefersDark ? 'default-dark' : 'default-light';
      setTheme(systemThemeId);
    }
  }, [setTheme]);

  // LCH 색상으로 테마 생성
  const generateThemeFromColors = useCallback(async (
    name: string,
    base: LCHColor,
    accent: LCHColor,
    contrast: number = 30
  ): Promise<string> => {
    const themeId = name.toLowerCase().replace(/\s+/g, '-');
    const config: ThemeConfig = {
      core: { base, accent, contrast },
    };

    await addCustomTheme(themeId, config);
    return themeId;
  }, [addCustomTheme]);

  // 테마 내보내기
  const exportTheme = useCallback((themeId: string): string | null => {
    const allThemes = { ...state.availableThemes, ...state.customThemes };
    const theme = allThemes[themeId];
    
    if (!theme) {
      return null;
    }

    const exportData = {
      version: '2025.1.0',
      theme,
      exportedAt: new Date().toISOString(),
      compatibility: {
        minVersion: '2025.1.0',
      },
    };

    return JSON.stringify(exportData, null, 2);
  }, [state.availableThemes, state.customThemes]);

  // 테마 가져오기
  const importTheme = useCallback(async (themeJson: string): Promise<string> => {
    try {
      const importData = JSON.parse(themeJson);
      
      if (!importData.theme || !importData.theme.core) {
        throw new Error('유효하지 않은 테마 형식입니다.');
      }

      const themeName = importData.theme.metadata?.name || 'Imported Theme';
      const themeId = themeName.toLowerCase().replace(/\s+/g, '-');
      
      await addCustomTheme(themeId, importData.theme);
      return themeId;
    } catch (error) {
      throw new Error('테마 가져오기에 실패했습니다: ' + (error as Error).message);
    }
  }, [addCustomTheme]);

  // 기본값으로 재설정
  const resetToDefaults = useCallback(async () => {
    dispatch({ type: 'CLEAR_HISTORY' });
    localStorage.removeItem(storageKey);
    localStorage.removeItem('linear-custom-themes');
    await setTheme('default-light');
  }, [storageKey, setTheme]);

  // 히스토리 지우기
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (!enableSystemTheme || !state.isSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const systemThemeId = e.matches ? 'default-dark' : 'default-light';
      setTheme(systemThemeId);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystemTheme, state.isSystemTheme, setTheme]);

  // 접근성 설정 감지
  useEffect(() => {
    // 고대비 모드 감지
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (e.matches && !state.isHighContrast) {
        toggleHighContrast();
      }
    };

    // 모션 감소 감지
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches !== state.isReducedMotion) {
        toggleReducedMotion();
      }
    };

    contrastQuery.addEventListener('change', handleContrastChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [state.isHighContrast, state.isReducedMotion, toggleHighContrast, toggleReducedMotion]);

  // 컨텍스트 값 메모이제이션
  const contextValue = useMemo<ThemeContextValue>(() => {
    const allThemes = { ...state.availableThemes, ...state.customThemes };
    const currentTheme = allThemes[state.currentThemeId] || null;
    const isDarkMode = currentTheme ? currentTheme.core.base[0] <= 50 : false;

    const themePreview: ThemePreview[] = Object.entries(allThemes).map(([id, config]) => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `${config.core.base[0] <= 50 ? 'Dark' : 'Light'} theme with ${config.core.contrast}% contrast`,
      previewColors: {
        background: `lch(${config.core.base[0]} ${config.core.base[1]} ${config.core.base[2]})`,
        foreground: `lch(${config.core.base[0] <= 50 ? '90' : '20'} 5 ${config.core.base[2]})`,
        accent: `lch(${config.core.accent[0]} ${config.core.accent[1]} ${config.core.accent[2]})`,
        border: `lch(${config.core.base[0] <= 50 ? '30' : '85'} 5 ${config.core.base[2]})`,
      },
      category: (id.includes('catppuccin') ? 'pastel' : 
                id.includes('minimal') ? 'minimal' : 
                id.includes('tokyo') || id.includes('warm') ? 'vibrant' : 
                'classic') as ThemeCategory,
      variant: (config.core.base[0] <= 50 ? 'dark' : 'light') as ThemeVariant,
    }));

    return {
      // 상태
      currentThemeId: state.currentThemeId,
      availableThemes: state.availableThemes,
      customThemes: state.customThemes,
      isHighContrast: state.isHighContrast,
      isReducedMotion: state.isReducedMotion,
      isSystemTheme: state.isSystemTheme,
      loading: state.loading,
      error: state.error,
      history: state.history,

      // 파생된 상태
      currentTheme,
      isDarkMode,
      allThemes,
      themePreview,

      // 액션
      setTheme,
      addCustomTheme,
      removeCustomTheme,
      toggleHighContrast,
      toggleReducedMotion,
      toggleSystemTheme,
      generateThemeFromColors,
      exportTheme,
      importTheme,
      resetToDefaults,
      clearHistory,

      // 이벤트
      addEventListener: eventEmitter.addEventListener.bind(eventEmitter),
      removeEventListener: eventEmitter.removeEventListener.bind(eventEmitter),
    };
  }, [
    state,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    toggleHighContrast,
    toggleReducedMotion,
    toggleSystemTheme,
    generateThemeFromColors,
    exportTheme,
    importTheme,
    resetToDefaults,
    clearHistory,
    eventEmitter,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마 컨텍스트 훅
export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext는 ThemeProvider 내에서 사용되어야 합니다.');
  }
  return context;
};

// 테마 프리셋 컴포넌트
export const ThemePresets: React.FC = () => {
  const { themePreview, setTheme, currentThemeId } = useThemeContext();

  return (
    <div className="linear-theme-presets">
      <h3 className="linear-text-primary font-semibold mb-4">Available Themes</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {themePreview.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`linear-card linear-card-interactive p-3 text-left transition-all ${
              currentThemeId === theme.id ? 'ring-2 ring-accent' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${theme.previewColors.background} 0%, ${theme.previewColors.accent}20 100%)`,
            }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.previewColors.accent }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.previewColors.foreground }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.previewColors.border }}
              />
            </div>
            <h4 className="font-medium text-sm">{theme.name}</h4>
            <p className="text-xs text-secondary mt-1">{theme.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                {theme.variant}
              </span>
              <span className="text-xs text-tertiary">{theme.category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeProvider;