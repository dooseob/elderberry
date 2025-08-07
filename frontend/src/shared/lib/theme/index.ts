/**
 * Linear Theme System - Public API
 * 
 * 모듈화된 테마 시스템의 통합 진입점입니다.
 * Tree-shaking을 지원하며 필요한 함수들만 선택적으로 import할 수 있습니다.
 * 
 * @version 2025.1.0
 * @author Linear Theme System
 */

// ========================================
// Color Conversion Module
// ========================================

export {
  // 핵심 색공간 변환
  lchToRgb,
  rgbToLch,
  hexToLch,
  lchToHex,
  lchToCss,
  
  // 색상 조작
  adjustLightness,
  adjustChroma,
  rotateHue,
  getComplementaryColor,
  getTriadicColors,
  getAnalogousColors,
  
  // 유틸리티
  calculateColorDistance,
  findDominantColor,
  generateLightnessScale,
  generateResponsiveColors,
} from './color-conversion';

// ========================================
// Accessibility Module
// ========================================

export {
  // WCAG 접근성
  getRelativeLuminance,
  getContrastRatio,
  checkAccessibility,
  ensureAccessibility,
  
  // 접근성 분석
  analyzeColorAccessibility,
  simulateColorBlindness,
  checkColorBlindFriendliness,
  generateAccessibilityRecommendations,
} from './accessibility';

// ========================================
// Theme Generation Module
// ========================================

export {
  // 색상 분석
  analyzeTemperature,
  analyzeSaturation,
  analyzeHarmony,
  
  // 테마 생성
  generateColorPalette,
  optimizePaletteAccessibility,
  generateRecommendedPalettes,
  generateSeasonalPalettes,
  
  // 테마 검증
  validateThemeConfig,
  calculateThemeQuality,
} from './theme-generation';

// ========================================
// CSS Variables Module
// ========================================

export {
  // CSS 변수 생성 및 적용
  generateCSSVariables,
  applyCSSVariables,
  removeCSSVariables,
  getCSSVariableValue,
  
  // CSS 문자열 생성
  generateCSSString,
  generateResponsiveCSSString,
  
  // 테마 모드 관리
  toggleThemeMode,
  
  // DOM 조작
  createStyleElement,
  injectThemeVariables,
  
  // 유틸리티
  validateCSSVariables,
  exportVariablesToJSON,
  importVariablesFromJSON,
  checkCSSCustomPropertySupport,
  animateCSSVariable,
} from './css-variables';

// ========================================
// 통합 테마 시스템 API
// ========================================

import type {
  ThemeConfig,
  ThemeColorPalette,
  LCHColor,
  ThemeCSSVariables,
} from '../../types/theme';
import { generateColorPalette, optimizePaletteAccessibility } from './theme-generation';
import { generateCSSVariables, applyCSSVariables } from './css-variables';

/**
 * 완전한 테마 시스템을 한 번에 생성하고 적용
 * @param config 테마 설정
 * @param options 생성 옵션
 * @returns 완전한 테마 객체
 */
export const createLinearTheme = (
  config: ThemeConfig,
  options: {
    optimize?: boolean;
    applyToDom?: boolean;
    minContrastRatio?: number;
  } = {}
): {
  config: ThemeConfig;
  palette: ThemeColorPalette;
  variables: ThemeCSSVariables;
  apply: () => void;
  remove: () => void;
} => {
  const { optimize = true, applyToDom = false, minContrastRatio = 4.5 } = options;
  
  // 색상 팔레트 생성
  let palette = generateColorPalette(
    config.core.base,
    {
      isDark: config.core.base[0] < 50,
      contrast: config.core.contrast,
      accentHueShift: config.core.accent[2] - config.core.base[2],
    }
  );
  
  // 접근성 최적화
  if (optimize) {
    palette = optimizePaletteAccessibility(palette, minContrastRatio);
  }
  
  // CSS 변수 생성
  const variables = generateCSSVariables(config, palette);
  
  // DOM 적용 함수들
  const apply = () => applyCSSVariables(variables);
  const remove = () => {
    const variableNames = Array.from(variables.keys());
    const { removeCSSVariables } = require('./css-variables');
    removeCSSVariables(variableNames);
  };
  
  // 즉시 적용
  if (applyToDom) {
    apply();
  }
  
  return {
    config,
    palette,
    variables,
    apply,
    remove,
  };
};

/**
 * 기존 색상에서 빠른 테마 생성
 * @param hexColor Hex 색상 문자열
 * @param isDark 다크 모드 여부
 * @returns 간단한 테마 객체
 */
export const quickTheme = (
  hexColor: string,
  isDark: boolean = false
): {
  palette: ThemeColorPalette;
  variables: ThemeCSSVariables;
  apply: () => void;
} => {
  const { hexToLch } = require('./color-conversion');
  const baseColor = hexToLch(hexColor);
  
  const config: ThemeConfig = {
    core: {
      base: baseColor,
      accent: [baseColor[0], baseColor[1], (baseColor[2] + 180) % 360, baseColor[3]],
      contrast: 30,
    },
  };
  
  const theme = createLinearTheme(config, { optimize: true });
  
  return {
    palette: theme.palette,
    variables: theme.variables,
    apply: theme.apply,
  };
};

/**
 * 미리 정의된 테마 프리셋
 */
export const themePresets = {
  /**
   * 클래식 블루 테마
   */
  classicBlue: (): ReturnType<typeof createLinearTheme> => {
    const config: ThemeConfig = {
      core: {
        base: [20, 30, 240, 1], // 어두운 파란색
        accent: [70, 60, 200, 1], // 밝은 파란색
        contrast: 35,
      },
    };
    return createLinearTheme(config, { optimize: true });
  },

  /**
   * 자연친화적 녹색 테마
   */
  natureGreen: (): ReturnType<typeof createLinearTheme> => {
    const config: ThemeConfig = {
      core: {
        base: [25, 40, 140, 1], // 숲속 녹색
        accent: [80, 50, 120, 1], // 연한 녹색
        contrast: 40,
      },
    };
    return createLinearTheme(config, { optimize: true });
  },

  /**
   * 따뜻한 오렌지 테마
   */
  warmOrange: (): ReturnType<typeof createLinearTheme> => {
    const config: ThemeConfig = {
      core: {
        base: [30, 50, 40, 1], // 진한 오렌지
        accent: [85, 60, 60, 1], // 밝은 주황색
        contrast: 45,
      },
    };
    return createLinearTheme(config, { optimize: true });
  },

  /**
   * 모던 그레이 테마
   */
  modernGray: (): ReturnType<typeof createLinearTheme> => {
    const config: ThemeConfig = {
      core: {
        base: [15, 5, 220, 1], // 차가운 어두운 회색
        accent: [70, 40, 280, 1], // 보라빛 강조색
        contrast: 50,
      },
    };
    return createLinearTheme(config, { optimize: true });
  },

  /**
   * 라이트 모드 기본 테마
   */
  lightDefault: (): ReturnType<typeof createLinearTheme> => {
    const config: ThemeConfig = {
      core: {
        base: [98, 2, 220, 1], // 매우 밝은 회색
        accent: [45, 70, 250, 1], // 파란색 강조
        contrast: 25,
      },
    };
    return createLinearTheme(config, { optimize: true });
  },
};

// ========================================
// 기본 내보내기 (하위 호환성)
// ========================================

export default {
  // 핵심 API
  createLinearTheme,
  quickTheme,
  themePresets,
  
  // 색공간 변환
  lchToRgb: require('./color-conversion').lchToRgb,
  rgbToLch: require('./color-conversion').rgbToLch,
  hexToLch: require('./color-conversion').hexToLch,
  lchToHex: require('./color-conversion').lchToHex,
  lchToCss: require('./color-conversion').lchToCss,
  
  // 색상 조작
  adjustLightness: require('./color-conversion').adjustLightness,
  adjustChroma: require('./color-conversion').adjustChroma,
  rotateHue: require('./color-conversion').rotateHue,
  getComplementaryColor: require('./color-conversion').getComplementaryColor,
  getTriadicColors: require('./color-conversion').getTriadicColors,
  getAnalogousColors: require('./color-conversion').getAnalogousColors,
  
  // 접근성
  getRelativeLuminance: require('./accessibility').getRelativeLuminance,
  getContrastRatio: require('./accessibility').getContrastRatio,
  checkAccessibility: require('./accessibility').checkAccessibility,
  ensureAccessibility: require('./accessibility').ensureAccessibility,
  
  // 분석
  analyzeTemperature: require('./theme-generation').analyzeTemperature,
  analyzeSaturation: require('./theme-generation').analyzeSaturation,
  analyzeHarmony: require('./theme-generation').analyzeHarmony,
  
  // 테마 생성
  generateColorPalette: require('./theme-generation').generateColorPalette,
  optimizePaletteAccessibility: require('./theme-generation').optimizePaletteAccessibility,
  generateCSSVariables: require('./css-variables').generateCSSVariables,
  applyCSSVariables: require('./css-variables').applyCSSVariables,
  
  // 검증
  validateThemeConfig: require('./theme-generation').validateThemeConfig,
  calculateThemeQuality: require('./theme-generation').calculateThemeQuality,
  
  // 유틸리티
  calculateColorDistance: require('./color-conversion').calculateColorDistance,
  findDominantColor: require('./color-conversion').findDominantColor,
  generateLightnessScale: require('./color-conversion').generateLightnessScale,
  generateResponsiveColors: require('./color-conversion').generateResponsiveColors,
};