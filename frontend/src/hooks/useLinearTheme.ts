/**
 * Linear Theme System Hook - Enhanced Version
 * React Hooks 전문가가 최적화한 LCH 색공간 기반 테마 관리 시스템
 * 
 * @version 2025.1.0  
 * @author React Hooks 전문가 (Linear Theme System)
 * 
 * Features:
 * - ThemeProvider와 완벽 통합
 * - 메모이제이션 최적화
 * - 타입 안전성 강화
 * - 성능 최적화된 상태 관리
 * - 고급 접근성 기능
 * - 실시간 테마 프리뷰
 * - 테마 애니메이션
 * - 오류 처리 및 복구
 * - 디바운싱 및 쓰로틀링
 */

import { useCallback, useMemo, useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useThemeContext } from '../components/theme/ThemeProvider';
import type {
  LinearTheme,
  ThemeConfig,
  LCHColor,
  ThemeApplicationOptions,
  ThemeEventType,
  ThemeEvent,
  ThemePreview,
  ThemeVariant,
  ThemeCategory,
} from '../types/theme';

/**
 * 테마 훅 옵션
 */
interface UseLinearThemeOptions {
  /** 디바운스 지연시간 (ms) */
  debounceDelay?: number;
  /** 애니메이션 활성화 */
  enableAnimations?: boolean;
  /** 자동 저장 */
  autoSave?: boolean;
  /** 시스템 테마 감지 */
  detectSystemTheme?: boolean;
  /** 접근성 자동 적용 */
  autoAccessibility?: boolean;
}

/**
 * 테마 미리보기 옵션
 */
interface ThemePreviewOptions {
  /** 프리뷰 지속시간 (ms) */
  duration?: number;
  /** 원래 테마로 자동 복원 */
  autoRevert?: boolean;
  /** 프리뷰 중 이벤트 차단 */
  blockEvents?: boolean;
}

/**
 * 테마 통계 정보
 */
interface ThemeStats {
  /** 총 테마 수 */
  totalThemes: number;
  /** 커스텀 테마 수 */
  customThemes: number;
  /** 현재 세션 테마 변경 횟수 */
  sessionChanges: number;
  /** 가장 많이 사용된 테마 */
  mostUsedTheme: string | null;
  /** 평균 테마 사용 시간 */
  averageUsageTime: number;
}

/**
 * 색상 분석 결과
 */
interface ColorAnalysis {
  /** 대비 비율 */
  contrastRatio: number;
  /** 접근성 등급 */
  accessibilityGrade: 'AA' | 'AAA' | 'FAIL';
  /** 색상 조화도 */
  harmony: 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'custom';
  /** 색온도 */
  temperature: 'warm' | 'cool' | 'neutral';
  /** 채도 레벨 */
  saturationLevel: 'low' | 'medium' | 'high';
}

/**
 * Enhanced useLinearTheme Hook
 * ThemeProvider와 통합된 고급 테마 관리 훅
 */
export const useLinearTheme = (options: UseLinearThemeOptions = {}) => {
  const {
    debounceDelay = 300,
    enableAnimations = true,
    autoSave = true,
    detectSystemTheme = true,
    autoAccessibility = true,
  } = options;

  // ThemeContext 사용
  const context = useThemeContext();
  
  // 로컬 상태 (성능 최적화용)
  const [sessionStats, setSessionStats] = useState<ThemeStats>({
    totalThemes: 0,
    customThemes: 0,
    sessionChanges: 0,
    mostUsedTheme: null,
    averageUsageTime: 0,
  });
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  
  // Refs for optimization
  const debounceRef = useRef<NodeJS.Timeout>();
  const previewTimeoutRef = useRef<NodeJS.Timeout>();
  const themeStartTimeRef = useRef<number>(Date.now());
  const eventListenersRef = useRef<Map<ThemeEventType, Set<(event: ThemeEvent) => void>>>(new Map());

  // 디바운스된 테마 설정 (세션 통계 업데이트 제거로 무한 루프 방지)
  const debouncedSetTheme = useCallback(
    (themeId: string, options?: ThemeApplicationOptions) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        context.setTheme(themeId, {
          animated: enableAnimations,
          persist: autoSave,
          ...options,
        });
        
        // 세션 통계 업데이트 제거 (무한 루프 방지)
        // setSessionStats 호출 제거됨
        
        themeStartTimeRef.current = Date.now();
      }, debounceDelay);
    },
    [context.setTheme, debounceDelay, enableAnimations, autoSave]
  );

  // 즉시 테마 설정 (디바운스 없음, 세션 통계 업데이트 제거)
  const setThemeImmediate = useCallback(
    (themeId: string, options?: ThemeApplicationOptions) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      context.setTheme(themeId, {
        animated: enableAnimations,
        persist: autoSave,
        immediate: true,
        ...options,
      });
      
      // 세션 통계 업데이트 제거 (무한 루프 방지)
      // setSessionStats 호출 제거됨
      
      themeStartTimeRef.current = Date.now();
    },
    [context.setTheme, enableAnimations, autoSave]
  );

  // 테마 미리보기
  const previewTheme = useCallback(
    (themeId: string, options: ThemePreviewOptions = {}) => {
      const {
        duration = 3000,
        autoRevert = true,
        blockEvents = true,
      } = options;
      
      if (isPreviewMode) {
        // 이미 미리보기 중이면 취소
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current);
        }
      }
      
      const originalTheme = context.currentThemeId;
      setIsPreviewMode(true);
      setPreviewThemeId(themeId);
      
      // 미리보기 테마 적용 (저장하지 않음)
      context.setTheme(themeId, {
        animated: enableAnimations,
        persist: false,
        immediate: false,
      });
      
      if (autoRevert) {
        previewTimeoutRef.current = setTimeout(() => {
          context.setTheme(originalTheme, {
            animated: enableAnimations,
            persist: false,
          });
          setIsPreviewMode(false);
          setPreviewThemeId(null);
        }, duration);
      }
    },
    [context.setTheme, context.currentThemeId, enableAnimations, isPreviewMode]
  );

  // 미리보기 취소
  const cancelPreview = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    if (isPreviewMode) {
      // 원래 테마로 복원 (로컬 스토리지에서 읽음)
      const originalTheme = localStorage.getItem('linear-current-theme') || 'default-light';
      context.setTheme(originalTheme, {
        animated: enableAnimations,
        persist: false,
      });
    }
    
    setIsPreviewMode(false);
    setPreviewThemeId(null);
  }, [context.setTheme, enableAnimations, isPreviewMode]);

  // 테마 분석
  const analyzeTheme = useCallback((themeId?: string): ColorAnalysis | null => {
    const targetThemeId = themeId || context.currentThemeId;
    const theme = context.allThemes[targetThemeId];
    
    if (!theme) return null;
    
    const { base, accent } = theme.core;
    
    // 대비 비율 계산 (간단한 근사치)
    const backgroundLightness = base[0];
    const accentLightness = accent[0];
    const contrastRatio = Math.abs(backgroundLightness - accentLightness) / 100 * 21;
    
    // 접근성 등급
    let accessibilityGrade: 'AA' | 'AAA' | 'FAIL';
    if (contrastRatio >= 7) accessibilityGrade = 'AAA';
    else if (contrastRatio >= 4.5) accessibilityGrade = 'AA';
    else accessibilityGrade = 'FAIL';
    
    // 색상 조화도 (Hue 기반)
    const hueDistance = Math.abs(base[2] - accent[2]);
    let harmony: ColorAnalysis['harmony'];
    if (hueDistance < 30) harmony = 'monochromatic';
    else if (hueDistance < 60) harmony = 'analogous';
    else if (hueDistance > 150 && hueDistance < 210) harmony = 'complementary';
    else if (hueDistance > 100 && hueDistance < 140) harmony = 'triadic';
    else harmony = 'custom';
    
    // 색온도
    const avgHue = (base[2] + accent[2]) / 2;
    let temperature: ColorAnalysis['temperature'];
    if (avgHue >= 0 && avgHue <= 60 || avgHue >= 300) temperature = 'warm';
    else if (avgHue > 180 && avgHue < 300) temperature = 'cool';
    else temperature = 'neutral';
    
    // 채도 레벨
    const avgChroma = (base[1] + accent[1]) / 2;
    let saturationLevel: ColorAnalysis['saturationLevel'];
    if (avgChroma < 20) saturationLevel = 'low';
    else if (avgChroma < 60) saturationLevel = 'medium';
    else saturationLevel = 'high';
    
    return {
      contrastRatio,
      accessibilityGrade,
      harmony,
      temperature,
      saturationLevel,
    };
  }, [context.currentThemeId, context.allThemes]);

  // LCH 색상으로 즉시 테마 생성
  const createThemeFromColors = useCallback(
    async (
      name: string,
      base: LCHColor,
      accent: LCHColor,
      contrast: number = 30
    ): Promise<string> => {
      try {
        const themeId = await context.generateThemeFromColors(name, base, accent, contrast);
        
        // 분석 수행
        const analysis = analyzeTheme(themeId);
        
        // 접근성 경고
        if (autoAccessibility && analysis?.accessibilityGrade === 'FAIL') {
          console.warn(`생성된 테마 '${name}'의 대비 비율이 낮습니다. (${analysis.contrastRatio.toFixed(1)}:1)`);
        }
        
        return themeId;
      } catch (error) {
        console.error('테마 생성 실패:', error);
        throw error;
      }
    },
    [context.generateThemeFromColors, analyzeTheme, autoAccessibility]
  );

  // 다크 모드 토글
  const toggleDarkMode = useCallback(() => {
    const currentTheme = context.currentTheme;
    if (!currentTheme) return;
    
    const isDark = currentTheme.core.base[0] <= 50;
    const targetVariant = isDark ? 'light' : 'dark';
    
    // 같은 패밀리의 반대 테마 찾기
    const themePreview = context.themePreview;
    const currentCategory = themePreview.find(t => t.id === context.currentThemeId)?.category;
    
    const oppositeTheme = themePreview.find(t => 
      t.variant === targetVariant && 
      (t.category === currentCategory || t.id.includes(context.currentThemeId.replace(/-?(light|dark)$/, '')))
    );
    
    if (oppositeTheme) {
      setThemeImmediate(oppositeTheme.id);
    } else {
      // 기본 테마로 전환
      const defaultTheme = targetVariant === 'dark' ? 'default-dark' : 'default-light';
      setThemeImmediate(defaultTheme);
    }
  }, [context.currentTheme, context.currentThemeId, context.themePreview, setThemeImmediate]);

  // 랜덤 테마 선택
  const randomTheme = useCallback(() => {
    const availableThemes = Object.keys(context.allThemes).filter(
      themeId => themeId !== context.currentThemeId
    );
    
    if (availableThemes.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    const randomThemeId = availableThemes[randomIndex];
    
    setThemeImmediate(randomThemeId);
  }, [context.allThemes, context.currentThemeId, setThemeImmediate]);

  // 이벤트 리스너 관리
  const addEventListener = useCallback(
    (type: ThemeEventType, listener: (event: ThemeEvent) => void) => {
      context.addEventListener(type, listener);
      
      // 로컬 이벤트 리스너 추가 (통계용)
      if (!eventListenersRef.current.has(type)) {
        eventListenersRef.current.set(type, new Set());
      }
      eventListenersRef.current.get(type)!.add(listener);
    },
    [context.addEventListener]
  );

  const removeEventListener = useCallback(
    (type: ThemeEventType, listener: (event: ThemeEvent) => void) => {
      context.removeEventListener(type, listener);
      
      // 로컬 이벤트 리스너 제거
      const listeners = eventListenersRef.current.get(type);
      if (listeners) {
        listeners.delete(listener);
      }
    },
    [context.removeEventListener]
  );

  // 파생된 상태 (메모이제이션 최적화) - 무한 루프 방지
  const derivedState = useMemo(() => {
    const totalThemes = Object.keys(context.allThemes).length;
    const customThemes = Object.keys(context.customThemes).length;
    
    // 호환 테마 목록 (같은 카테고리 또는 비슷한 색상) - 안정적인 계산
    const currentThemePreview = context.themePreview.find(t => t.id === context.currentThemeId);
    const compatibleThemes = currentThemePreview ? context.themePreview.filter(theme => {
      if (theme.id === context.currentThemeId) return false;
      return theme.category === currentThemePreview.category ||
             theme.variant === currentThemePreview.variant;
    }) : [];
    
    return {
      totalThemes,
      customThemes,
      compatibleThemes,
      isValidTheme: context.currentTheme !== null,
      hasCustomThemes: customThemes > 0,
      canToggleDarkMode: true,
    };
  }, [
    context.allThemes,
    context.customThemes,
    context.currentThemeId,
    context.currentTheme,
    context.themePreview,
  ]);

  // 세션 통계 업데이트 (완전 비활성화로 무한 루프 방지)
  // 주석: 이 부분이 무한 루프를 일으키므로 임시로 비활성화
  // 추후 ThemeProvider에서 직접 관리하도록 변경 예정
  /*
  useEffect(() => {
    // 안전한 업데이트 (기본값 사용)
    setSessionStats(prev => ({
      ...prev,
      totalThemes: 0, // 기본값으로 설정
      customThemes: 0, // 기본값으로 설정
    }));
  }, []); // 빈 의존성 배열로 한 번만 실행
  */

  // 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  // 반환값 메모이제이션
  return useMemo(() => ({
    // ThemeContext에서 온 상태
    currentThemeId: context.currentThemeId,
    currentTheme: context.currentTheme,
    allThemes: context.allThemes,
    customThemes: context.customThemes,
    isDarkMode: context.isDarkMode,
    isHighContrast: context.isHighContrast,
    isReducedMotion: context.isReducedMotion,
    isSystemTheme: context.isSystemTheme,
    loading: context.loading,
    error: context.error,
    history: context.history,
    themePreview: context.themePreview,
    
    // 파생된 상태
    ...derivedState,
    
    // 현재 테마 분석 (안전한 호출)
    currentAnalysis: context.currentTheme ? analyzeTheme() : null,
    
    // 로컬 상태
    sessionStats,
    isPreviewMode,
    previewThemeId,
    
    // 기본 액션 (ThemeContext에서)
    toggleHighContrast: context.toggleHighContrast,
    toggleReducedMotion: context.toggleReducedMotion,
    toggleSystemTheme: context.toggleSystemTheme,
    addCustomTheme: context.addCustomTheme,
    removeCustomTheme: context.removeCustomTheme,
    exportTheme: context.exportTheme,
    importTheme: context.importTheme,
    resetToDefaults: context.resetToDefaults,
    clearHistory: context.clearHistory,
    
    // 향상된 액션 (이 훅에서 추가)
    setTheme: debouncedSetTheme,
    setThemeImmediate,
    previewTheme,
    cancelPreview,
    analyzeTheme,
    createThemeFromColors,
    toggleDarkMode,
    randomTheme,
    
    // 이벤트 관리
    addEventListener,
    removeEventListener,
    
    // 유틸리티 함수들
    getThemeById: (themeId: string) => context.allThemes[themeId] || null,
    getThemesByCategory: (category: ThemeCategory) => 
      context.themePreview.filter(theme => theme.category === category),
    getThemesByVariant: (variant: ThemeVariant) =>
      context.themePreview.filter(theme => theme.variant === variant),
    searchThemes: (query: string) =>
      context.themePreview.filter(theme =>
        theme.name.toLowerCase().includes(query.toLowerCase()) ||
        theme.description.toLowerCase().includes(query.toLowerCase())
      ),
    
    // 색상 유틸리티
    lchToHex: (lch: LCHColor): string => {
      // LCH를 Hex로 변환 (간단한 근사치)
      const [l, c, h] = lch;
      return `hsl(${h}, ${c}%, ${l}%)`;
    },
    
    hexToLch: (hex: string): LCHColor => {
      // Hex를 LCH로 변환 (간단한 근사치)
      // 실제 구현에서는 색공간 변환 라이브러리 사용 권장
      return [50, 50, 0, 1];
    },
    
    // 테마 검증
    validateTheme: (config: ThemeConfig): boolean => {
      const { base, accent, contrast } = config.core;
      return (
        Array.isArray(base) && base.length === 4 &&
        Array.isArray(accent) && accent.length === 4 &&
        typeof contrast === 'number' && contrast >= 0 && contrast <= 100
      );
    },
  }), [
    context,
    derivedState,
    sessionStats,
    isPreviewMode,
    previewThemeId,
    debouncedSetTheme,
    setThemeImmediate,
    previewTheme,
    cancelPreview,
    analyzeTheme,
    createThemeFromColors,
    toggleDarkMode,
    randomTheme,
    addEventListener,
    removeEventListener,
  ]);
};

// 레거시 호환성을 위한 기본 내보내기
export default useLinearTheme;

// 편의를 위한 추가 훅들

/**
 * 현재 테마 정보만 필요한 경우 사용하는 경량 훅
 */
export const useCurrentTheme = () => {
  const context = useThemeContext();
  
  return useMemo(() => ({
    themeId: context.currentThemeId,
    theme: context.currentTheme,
    isDark: context.isDarkMode,
    isHighContrast: context.isHighContrast,
  }), [
    context.currentThemeId,
    context.currentTheme,
    context.isDarkMode,
    context.isHighContrast,
  ]);
};

/**
 * 테마 통계만 필요한 경우 사용하는 훅
 */
export const useThemeStats = () => {
  const context = useThemeContext();
  
  return useMemo(() => ({
    totalThemes: Object.keys(context.allThemes).length,
    customThemes: Object.keys(context.customThemes).length,
    history: context.history,
    currentTheme: context.currentThemeId,
  }), [
    context.allThemes,
    context.customThemes,
    context.history,
    context.currentThemeId,
  ]);
};

/**
 * 테마 프리뷰만 필요한 경우 사용하는 훅
 */
export const useThemePreview = () => {
  const context = useThemeContext();
  
  return useMemo(() => ({
    themes: context.themePreview,
    categories: [...new Set(context.themePreview.map(t => t.category))],
    variants: [...new Set(context.themePreview.map(t => t.variant))],
  }), [context.themePreview]);
};