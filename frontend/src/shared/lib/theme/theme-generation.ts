/**
 * Theme Generation Module - 테마 생성 및 분석 유틸리티
 * 
 * 색상 팔레트 생성, 테마 품질 분석, 색상 조화 분석 기능을 제공합니다.
 * 
 * @version 2025.1.0
 * @author Linear Theme System
 */

import type {
  LCHColor,
  ThemeConfig,
  ThemeColorPalette,
  SurfaceColors,
  TextColors,
  BorderColors,
  AccentColorVariants,
  ControlColors,
  IconColors,
  SemanticColors,
} from '../../types/theme';
import { rotateHue, adjustLightness, adjustChroma } from './color-conversion';
import { getContrastRatio, ensureAccessibility } from './accessibility';

// ========================================
// 색상 분석
// ========================================

/**
 * 색온도 분석
 * @param lch LCH 색상
 * @returns 색온도 정보
 */
export const analyzeTemperature = (lch: LCHColor): {
  temperature: 'warm' | 'cool' | 'neutral';
  kelvin: number; // 근사 색온도 (K)
  description: string;
} => {
  const [, , h] = lch;
  
  let temperature: 'warm' | 'cool' | 'neutral';
  let kelvin: number;
  let description: string;
  
  if ((h >= 0 && h <= 60) || h >= 300) {
    temperature = 'warm';
    kelvin = 2700 + (h <= 60 ? h : 360 - h) * 20;
    description = 'Warm tones (red, orange, yellow)';
  } else if (h >= 180 && h < 300) {
    temperature = 'cool';
    kelvin = 6500 + (h - 180) * 30;
    description = 'Cool tones (blue, cyan, purple)';
  } else {
    temperature = 'neutral';
    kelvin = 5500;
    description = 'Neutral tones (green, lime)';
  }
  
  return { temperature, kelvin, description };
};

/**
 * 채도 레벨 분석
 * @param lch LCH 색상
 * @returns 채도 정보
 */
export const analyzeSaturation = (lch: LCHColor): {
  level: 'low' | 'medium' | 'high';
  percentage: number;
  description: string;
} => {
  const [, c] = lch;
  const percentage = Math.min(100, (c / 100) * 100);
  
  let level: 'low' | 'medium' | 'high';
  let description: string;
  
  if (c < 20) {
    level = 'low';
    description = 'Muted, desaturated colors';
  } else if (c < 60) {
    level = 'medium';
    description = 'Balanced saturation';
  } else {
    level = 'high';
    description = 'Vibrant, highly saturated colors';
  }
  
  return { level, percentage, description };
};

/**
 * 색상 조화 분석
 * @param baseColor 기준 색상
 * @param accentColor 강조 색상
 * @returns 조화 분석 결과
 */
export const analyzeHarmony = (baseColor: LCHColor, accentColor: LCHColor): {
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'custom';
  hueDifference: number;
  description: string;
  score: number; // 0-100
} => {
  const hue1 = baseColor[2];
  const hue2 = accentColor[2];
  
  let hueDifference = Math.abs(hue2 - hue1);
  if (hueDifference > 180) {
    hueDifference = 360 - hueDifference;
  }
  
  let type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'custom';
  let description: string;
  let score: number;
  
  if (hueDifference < 15) {
    type = 'monochromatic';
    description = 'Same hue family - harmonious and unified';
    score = 95;
  } else if (hueDifference < 60) {
    type = 'analogous';
    description = 'Adjacent hues - naturally harmonious';
    score = 85;
  } else if (hueDifference >= 150 && hueDifference <= 210) {
    type = 'complementary';
    description = 'Opposite hues - high contrast and vibrant';
    score = 90;
  } else if (hueDifference >= 100 && hueDifference <= 140) {
    type = 'triadic';
    description = 'Evenly spaced hues - balanced and dynamic';
    score = 80;
  } else if (hueDifference >= 80 && hueDifference <= 110) {
    type = 'tetradic';
    description = 'Four-hue harmony - complex but balanced';
    score = 75;
  } else {
    type = 'custom';
    description = 'Custom harmony - may need careful balancing';
    score = Math.max(40, 80 - Math.abs(hueDifference - 90) * 0.5);
  }
  
  return { type, hueDifference, description, score };
};

// ========================================
// 테마 생성 알고리즘
// ========================================

/**
 * 단일 색상에서 완전한 색상 팔레트 생성
 * @param baseColor 기준 색상
 * @param options 생성 옵션
 * @returns 완전한 색상 팔레트
 */
export const generateColorPalette = (
  baseColor: LCHColor,
  options: {
    isDark?: boolean;
    contrast?: number;
    accentHueShift?: number;
  } = {}
): ThemeColorPalette => {
  const { isDark = baseColor[0] < 50, contrast = 30, accentHueShift = 180 } = options;
  
  // 기본 표면 색상들 생성
  const surfaces: SurfaceColors = {
    background: baseColor,
    foreground: isDark
      ? adjustLightness(baseColor, 75)
      : adjustLightness(baseColor, -80),
    elevated: isDark
      ? adjustLightness(baseColor, 5)
      : adjustLightness(baseColor, 3),
    input: isDark
      ? adjustLightness(baseColor, 3)
      : adjustLightness(baseColor, -1),
    panel: isDark
      ? adjustLightness(baseColor, -2)
      : adjustLightness(baseColor, -3),
    modal: isDark
      ? adjustLightness(baseColor, 8)
      : adjustLightness(baseColor, 5),
    dialog: isDark
      ? adjustLightness(baseColor, 6)
      : adjustLightness(baseColor, 4),
    overlay: [baseColor[0], baseColor[1], baseColor[2], 0.8],
  };
  
  // 강조 색상 생성
  const accentBase = rotateHue(baseColor, accentHueShift);
  const accentOptimized = isDark
    ? adjustLightness(adjustChroma(accentBase, 40), 30)
    : adjustLightness(adjustChroma(accentBase, 30), -20);
  
  const accent: AccentColorVariants = {
    default: accentOptimized,
    hover: adjustLightness(accentOptimized, isDark ? 10 : -10),
    active: adjustLightness(accentOptimized, isDark ? -5 : -15),
    subtle: [accentOptimized[0], accentOptimized[1], accentOptimized[2], 0.1],
    muted: [accentOptimized[0], accentOptimized[1] * 0.6, accentOptimized[2], 1],
    focus: [accentOptimized[0], accentOptimized[1] * 0.8, accentOptimized[2], 0.3],
  };
  
  // 텍스트 색상들
  const text: TextColors = {
    primary: isDark
      ? adjustLightness(baseColor, 85)
      : adjustLightness(baseColor, -85),
    secondary: isDark
      ? adjustLightness(baseColor, 65)
      : adjustLightness(baseColor, -65),
    tertiary: isDark
      ? adjustLightness(baseColor, 45)
      : adjustLightness(baseColor, -45),
    onAccent: isDark ? [5, 0, 0, 1] : [95, 0, 0, 1],
    inverse: isDark
      ? adjustLightness(baseColor, -75)
      : adjustLightness(baseColor, 75),
    disabled: isDark
      ? adjustLightness(baseColor, 35)
      : adjustLightness(baseColor, -35),
  };
  
  // 테두리 색상들
  const borders: BorderColors = {
    subtle: isDark
      ? adjustLightness(baseColor, 15)
      : adjustLightness(baseColor, -15),
    default: isDark
      ? adjustLightness(baseColor, 25)
      : adjustLightness(baseColor, -25),
    strong: isDark
      ? adjustLightness(baseColor, 35)
      : adjustLightness(baseColor, -35),
    input: isDark
      ? adjustLightness(baseColor, 20)
      : adjustLightness(baseColor, -20),
    focus: accentOptimized,
  };
  
  // 컨트롤 색상들
  const controls: ControlColors = {
    default: surfaces.input,
    hover: isDark
      ? adjustLightness(surfaces.input, 8)
      : adjustLightness(surfaces.input, -8),
    active: isDark
      ? adjustLightness(surfaces.input, 15)
      : adjustLightness(surfaces.input, -15),
    selected: accent.subtle,
    disabled: isDark
      ? adjustLightness(baseColor, 8)
      : adjustLightness(baseColor, -8),
  };
  
  // 아이콘 색상들
  const icons: IconColors = {
    default: text.secondary,
    muted: text.tertiary,
    accent: accentOptimized,
    state: {
      success: [60, 50, 140, 1],
      warning: [70, 70, 80, 1],
      error: [55, 85, 25, 1],
      info: [65, 40, 250, 1],
      neutral: text.secondary,
    },
  };
  
  // 시맨틱 색상들
  const semantic: SemanticColors = {
    success: [60, 50, 140, 1],
    warning: [70, 70, 80, 1],
    error: [55, 85, 25, 1],
    info: [65, 40, 250, 1],
    neutral: [50, 10, baseColor[2], 1],
  };
  
  return {
    surfaces,
    text,
    borders,
    accent,
    controls,
    icons,
    semantic,
  };
};

/**
 * 접근성을 고려한 테마 자동 보정
 * @param palette 색상 팔레트
 * @param minContrastRatio 최소 대비 비율
 * @returns 보정된 색상 팔레트
 */
export const optimizePaletteAccessibility = (
  palette: ThemeColorPalette,
  minContrastRatio: number = 4.5
): ThemeColorPalette => {
  const optimizedPalette = { ...palette };
  
  // 텍스트 색상 최적화
  optimizedPalette.text = {
    ...palette.text,
    primary: ensureAccessibility(palette.text.primary, palette.surfaces.background, minContrastRatio),
    secondary: ensureAccessibility(palette.text.secondary, palette.surfaces.background, minContrastRatio * 0.8),
    tertiary: ensureAccessibility(palette.text.tertiary, palette.surfaces.background, minContrastRatio * 0.6),
  };
  
  // 강조 색상 최적화
  optimizedPalette.accent = {
    ...palette.accent,
    default: ensureAccessibility(palette.accent.default, palette.surfaces.background, minContrastRatio),
  };
  
  // 테두리 색상 최적화
  optimizedPalette.borders = {
    ...palette.borders,
    default: ensureAccessibility(palette.borders.default, palette.surfaces.background, 3.0),
    strong: ensureAccessibility(palette.borders.strong, palette.surfaces.background, minContrastRatio * 0.7),
  };
  
  return optimizedPalette;
};

// ========================================
// 테마 검증 및 분석
// ========================================

/**
 * 테마 설정 유효성 검사
 * @param config 테마 설정
 * @returns 검증 결과
 */
export const validateThemeConfig = (config: ThemeConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 핵심 설정 검사
  if (!config.core) {
    errors.push('Core theme configuration is missing');
    return { isValid: false, errors, warnings };
  }
  
  const { base, accent, contrast } = config.core;
  
  // LCH 값 검증
  if (!Array.isArray(base) || base.length !== 4) {
    errors.push('Base color must be a 4-element LCH array');
  } else {
    const [l, c, h, a] = base;
    if (l < 0 || l > 100) errors.push('Base lightness must be 0-100');
    if (c < 0 || c > 150) errors.push('Base chroma must be 0-150');
    if (h < 0 || h >= 360) errors.push('Base hue must be 0-359');
    if (a < 0 || a > 1) errors.push('Base alpha must be 0-1');
  }
  
  if (!Array.isArray(accent) || accent.length !== 4) {
    errors.push('Accent color must be a 4-element LCH array');
  } else {
    const [l, c, h, a] = accent;
    if (l < 0 || l > 100) errors.push('Accent lightness must be 0-100');
    if (c < 0 || c > 150) errors.push('Accent chroma must be 0-150');
    if (h < 0 || h >= 360) errors.push('Accent hue must be 0-359');
    if (a < 0 || a > 1) errors.push('Accent alpha must be 0-1');
  }
  
  if (typeof contrast !== 'number' || contrast < 0 || contrast > 100) {
    errors.push('Contrast must be a number between 0-100');
  }
  
  // 접근성 검사
  if (errors.length === 0) {
    const contrastRatio = getContrastRatio(base, accent);
    if (contrastRatio < 3) {
      warnings.push(`Low contrast ratio (${contrastRatio.toFixed(1)}:1) between base and accent colors`);
    }
    
    // 색상 조화 검사
    const harmony = analyzeHarmony(base, accent);
    if (harmony.score < 60) {
      warnings.push(`Color harmony score is low (${harmony.score}/100) - consider adjusting hue relationship`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 테마 품질 점수 계산
 * @param config 테마 설정
 * @returns 품질 점수 (0-100)
 */
export const calculateThemeQuality = (config: ThemeConfig): {
  score: number;
  breakdown: {
    accessibility: number;
    harmony: number;
    balance: number;
    uniqueness: number;
  };
  suggestions: string[];
} => {
  const { base, accent } = config.core;
  const suggestions: string[] = [];
  
  // 접근성 점수 (40%)
  const contrastRatio = getContrastRatio(base, accent);
  let accessibilityScore = 0;
  if (contrastRatio >= 7) accessibilityScore = 100;
  else if (contrastRatio >= 4.5) accessibilityScore = 80;
  else if (contrastRatio >= 3) accessibilityScore = 60;
  else accessibilityScore = Math.max(0, contrastRatio * 20);
  
  if (accessibilityScore < 80) {
    suggestions.push('Increase contrast between base and accent colors for better accessibility');
  }
  
  // 색상 조화 점수 (30%)
  const harmony = analyzeHarmony(base, accent);
  const harmonyScore = harmony.score;
  
  if (harmonyScore < 70) {
    suggestions.push(`Consider using ${harmony.type} color harmony for better visual appeal`);
  }
  
  // 균형 점수 (20%)
  const baseSaturation = analyzeSaturation(base);
  const accentSaturation = analyzeSaturation(accent);
  const saturationDifference = Math.abs(base[1] - accent[1]);
  
  let balanceScore = 100;
  if (saturationDifference < 10) {
    balanceScore -= 20;
    suggestions.push('Increase saturation difference between base and accent for better distinction');
  }
  if (baseSaturation.level === 'high' && accentSaturation.level === 'high') {
    balanceScore -= 15;
    suggestions.push('Consider reducing saturation of base or accent color for better balance');
  }
  
  // 독창성 점수 (10%)
  const uniquenessScore = Math.min(100, (Math.abs(base[2] - 180) + Math.abs(accent[2] - 240)) / 2);
  
  const breakdown = {
    accessibility: accessibilityScore,
    harmony: harmonyScore,
    balance: balanceScore,
    uniqueness: uniquenessScore,
  };
  
  const score = (
    accessibilityScore * 0.4 +
    harmonyScore * 0.3 +
    balanceScore * 0.2 +
    uniquenessScore * 0.1
  );
  
  return {
    score: Math.round(score),
    breakdown,
    suggestions,
  };
};

/**
 * 추천 테마 팔레트 생성 (다양한 스타일)
 * @param baseColor 기준 색상
 * @returns 다양한 스타일의 테마 팔레트
 */
export const generateRecommendedPalettes = (baseColor: LCHColor): {
  minimalist: ThemeColorPalette;
  vibrant: ThemeColorPalette;
  corporate: ThemeColorPalette;
  creative: ThemeColorPalette;
} => {
  // 미니멀리스트 스타일 - 채도 낮고 차분함
  const minimalist = generateColorPalette(
    adjustChroma(baseColor, -20),
    { isDark: baseColor[0] < 50, accentHueShift: 30 }
  );
  
  // 비브란트 스타일 - 높은 채도와 강한 대비
  const vibrant = generateColorPalette(
    adjustChroma(baseColor, 30),
    { isDark: baseColor[0] < 50, accentHueShift: 180, contrast: 50 }
  );
  
  // 기업용 스타일 - 전문적이고 신뢰감 있는
  const corporate = generateColorPalette(
    adjustChroma([baseColor[0], Math.min(baseColor[1], 40), baseColor[2], baseColor[3]], 0),
    { isDark: false, accentHueShift: 210 }
  );
  
  // 창조적 스타일 - 독특하고 예술적인
  const creative = generateColorPalette(
    baseColor,
    { isDark: baseColor[0] < 50, accentHueShift: 120, contrast: 40 }
  );
  
  return {
    minimalist,
    vibrant,
    corporate,
    creative,
  };
};

/**
 * 시즌별 테마 색상 추천
 * @param season 계절
 * @returns 계절에 맞는 색상 조합
 */
export const generateSeasonalPalettes = (season: 'spring' | 'summer' | 'autumn' | 'winter'): {
  primary: LCHColor;
  secondary: LCHColor;
  accent: LCHColor;
  palette: ThemeColorPalette;
} => {
  let primary: LCHColor;
  let secondary: LCHColor;
  let accent: LCHColor;
  
  switch (season) {
    case 'spring':
      primary = [85, 30, 120, 1]; // 연한 녹색
      secondary = [80, 40, 60, 1]; // 연한 노란색
      accent = [70, 60, 300, 1]; // 연한 보라색
      break;
    case 'summer':
      primary = [80, 50, 200, 1]; // 하늘색
      secondary = [85, 45, 180, 1]; // 청록색
      accent = [75, 80, 50, 1]; // 활기찬 노란색
      break;
    case 'autumn':
      primary = [60, 40, 30, 1]; // 따뜻한 갈색
      secondary = [70, 60, 60, 1]; // 주황색
      accent = [50, 50, 0, 1]; // 붉은색
      break;
    case 'winter':
      primary = [30, 20, 240, 1]; // 어두운 파란색
      secondary = [20, 10, 220, 1]; // 진한 남색
      accent = [85, 30, 180, 1]; // 차가운 회색-청색
      break;
  }
  
  const palette = generateColorPalette(primary, {
    isDark: primary[0] < 50,
    accentHueShift: accent[2] - primary[2],
  });
  
  return {
    primary,
    secondary,
    accent,
    palette,
  };
};