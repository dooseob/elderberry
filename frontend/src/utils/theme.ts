/**
 * Linear Theme System - 유틸리티 함수 라이브러리
 * JavaScript 전문가가 구현한 테마 관련 핵심 유틸리티 함수들
 * 
 * @version 2025.1.0
 * @author JavaScript 전문가 (Linear Theme System)
 * 
 * Features:
 * - LCH 색공간 계산 및 변환
 * - 접근성 대비 검사 (WCAG 2.1 준수)
 * - 색상 조화 분석
 * - 테마 생성 알고리즘
 * - 색온도 및 채도 분석
 * - 성능 최적화된 색상 연산
 * - CSS 커스텀 프로퍼티 관리
 * - 테마 검증 및 보정
 */

import type {
  LCHColor,
  ThemeConfig,
  LinearTheme,
  ThemeColorPalette,
  SurfaceColors,
  TextColors,
  BorderColors,
  AccentColorVariants,
  ControlColors,
  IconColors,
  SemanticColors,
  ColorAnalysis,
  ThemeCSSVariables,
  AccessibilityConfig,
} from '../types/theme';

// ========================================
// 색공간 변환 유틸리티
// ========================================

/**
 * LCH에서 RGB로 변환 (OKLCh 기반 근사)
 * @param lch LCH 색상 배열 [L, C, H, A]
 * @returns RGB 객체 {r, g, b, a}
 */
export const lchToRgb = (lch: LCHColor): { r: number; g: number; b: number; a: number } => {
  const [l, c, h, a] = lch;
  
  // LCH to LAB conversion (D65 illuminant)
  const hRad = (h * Math.PI) / 180;
  const labA = c * Math.cos(hRad);
  const labB = c * Math.sin(hRad);
  
  // LAB to XYZ conversion
  const fy = (l + 16) / 116;
  const fx = labA / 500 + fy;
  const fz = fy - labB / 200;
  
  const delta = 6 / 29;
  const deltaSquared = delta * delta;
  const deltaCubed = delta * deltaSquared;
  
  const xr = fx > delta ? fx * fx * fx : 3 * deltaSquared * (fx - 4 / 29);
  const yr = fy > delta ? fy * fy * fy : 3 * deltaSquared * (fy - 4 / 29);
  const zr = fz > delta ? fz * fz * fz : 3 * deltaSquared * (fz - 4 / 29);
  
  // D65 white point
  const Xn = 0.95047;
  const Yn = 1.00000;
  const Zn = 1.08883;
  
  const X = xr * Xn;
  const Y = yr * Yn;
  const Z = zr * Zn;
  
  // XYZ to sRGB conversion matrix
  let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
  let b = X * 0.0557 + Y * -0.2040 + Z * 1.0570;
  
  // Gamma correction
  const gammaCorrect = (val: number): number => {
    return val > 0.0031308
      ? 1.055 * Math.pow(val, 1 / 2.4) - 0.055
      : 12.92 * val;
  };
  
  r = Math.max(0, Math.min(1, gammaCorrect(r)));
  g = Math.max(0, Math.min(1, gammaCorrect(g)));
  b = Math.max(0, Math.min(1, gammaCorrect(b)));
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a,
  };
};

/**
 * RGB에서 LCH로 변환
 * @param rgb RGB 객체 {r, g, b, a?}
 * @returns LCH 색상 배열
 */
export const rgbToLch = (rgb: { r: number; g: number; b: number; a?: number }): LCHColor => {
  const { r, g, b, a = 1 } = rgb;
  
  // sRGB to linear RGB
  const linearize = (val: number): number => {
    const normalized = val / 255;
    return normalized > 0.04045
      ? Math.pow((normalized + 0.055) / 1.055, 2.4)
      : normalized / 12.92;
  };
  
  const rLinear = linearize(r);
  const gLinear = linearize(g);
  const bLinear = linearize(b);
  
  // RGB to XYZ conversion matrix
  const X = rLinear * 0.4124 + gLinear * 0.3576 + bLinear * 0.1805;
  const Y = rLinear * 0.2126 + gLinear * 0.7152 + bLinear * 0.0722;
  const Z = rLinear * 0.0193 + gLinear * 0.1192 + bLinear * 0.9505;
  
  // D65 white point
  const Xn = 0.95047;
  const Yn = 1.00000;
  const Zn = 1.08883;
  
  const xr = X / Xn;
  const yr = Y / Yn;
  const zr = Z / Zn;
  
  // XYZ to LAB conversion
  const delta = 6 / 29;
  const f = (t: number): number => {
    return t > delta * delta * delta
      ? Math.pow(t, 1 / 3)
      : t / (3 * delta * delta) + 4 / 29;
  };
  
  const fx = f(xr);
  const fy = f(yr);
  const fz = f(zr);
  
  const L = 116 * fy - 16;
  const labA = 500 * (fx - fy);
  const labB = 200 * (fy - fz);
  
  // LAB to LCH conversion
  const C = Math.sqrt(labA * labA + labB * labB);
  let H = Math.atan2(labB, labA) * 180 / Math.PI;
  if (H < 0) H += 360;
  
  return [L, C, H, a];
};

/**
 * Hex 색상을 LCH로 변환
 * @param hex Hex 색상 문자열 (#RRGGBB 또는 #RGB)
 * @returns LCH 색상 배열
 */
export const hexToLch = (hex: string): LCHColor => {
  const cleanHex = hex.replace('#', '');
  let r: number, g: number, b: number;
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substr(0, 2), 16);
    g = parseInt(cleanHex.substr(2, 2), 16);
    b = parseInt(cleanHex.substr(4, 2), 16);
  } else {
    throw new Error('Invalid hex color format');
  }
  
  return rgbToLch({ r, g, b });
};

/**
 * LCH 색상을 Hex로 변환
 * @param lch LCH 색상 배열
 * @returns Hex 색상 문자열
 */
export const lchToHex = (lch: LCHColor): string => {
  const rgb = lchToRgb(lch);
  const toHex = (val: number): string => {
    const hex = Math.round(val).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

/**
 * LCH 색상을 CSS 문자열로 변환
 * @param lch LCH 색상 배열
 * @returns CSS lch() 함수 문자열
 */
export const lchToCss = (lch: LCHColor): string => {
  const [l, c, h, a] = lch;
  if (a === 1) {
    return `lch(${l.toFixed(2)} ${c.toFixed(2)} ${h.toFixed(2)})`;
  }
  return `lch(${l.toFixed(2)} ${c.toFixed(2)} ${h.toFixed(2)} / ${a})`;
};

// ========================================
// 색상 조작 유틸리티
// ========================================

/**
 * LCH 색상의 밝기 조정
 * @param lch 원본 LCH 색상
 * @param adjustment 조정값 (-100 ~ 100)
 * @returns 조정된 LCH 색상
 */
export const adjustLightness = (lch: LCHColor, adjustment: number): LCHColor => {
  const [l, c, h, a] = lch;
  const newL = Math.max(0, Math.min(100, l + adjustment));
  return [newL, c, h, a];
};

/**
 * LCH 색상의 채도 조정
 * @param lch 원본 LCH 색상
 * @param adjustment 조정값 (-100 ~ 100)
 * @returns 조정된 LCH 색상
 */
export const adjustChroma = (lch: LCHColor, adjustment: number): LCHColor => {
  const [l, c, h, a] = lch;
  const newC = Math.max(0, Math.min(150, c + adjustment));
  return [l, newC, h, a];
};

/**
 * LCH 색상의 색조 회전
 * @param lch 원본 LCH 색상
 * @param degrees 회전 각도 (-360 ~ 360)
 * @returns 회전된 LCH 색상
 */
export const rotateHue = (lch: LCHColor, degrees: number): LCHColor => {
  const [l, c, h, a] = lch;
  let newH = h + degrees;
  while (newH < 0) newH += 360;
  while (newH >= 360) newH -= 360;
  return [l, c, newH, a];
};

/**
 * 색상의 보색 계산
 * @param lch 원본 LCH 색상
 * @returns 보색 LCH 색상
 */
export const getComplementaryColor = (lch: LCHColor): LCHColor => {
  return rotateHue(lch, 180);
};

/**
 * 색상의 3색 조화 계산
 * @param lch 원본 LCH 색상
 * @returns 3색 조화 LCH 색상 배열
 */
export const getTriadicColors = (lch: LCHColor): [LCHColor, LCHColor, LCHColor] => {
  return [
    lch,
    rotateHue(lch, 120),
    rotateHue(lch, 240),
  ];
};

/**
 * 색상의 유사 색상 계산
 * @param lch 원본 LCH 색상
 * @param count 생성할 색상 수
 * @param range 색조 범위 (기본: 30도)
 * @returns 유사 색상 배열
 */
export const getAnalogousColors = (lch: LCHColor, count: number = 5, range: number = 30): LCHColor[] => {
  const colors: LCHColor[] = [];
  const step = range / (count - 1);
  const startHue = lch[2] - range / 2;
  
  for (let i = 0; i < count; i++) {
    const hue = startHue + (step * i);
    colors.push([lch[0], lch[1], hue, lch[3]]);
  }
  
  return colors;
};

// ========================================
// 접근성 및 대비 검사
// ========================================

/**
 * 상대 휘도 계산 (WCAG 2.1)
 * @param lch LCH 색상
 * @returns 상대 휘도 (0-1)
 */
export const getRelativeLuminance = (lch: LCHColor): number => {
  const rgb = lchToRgb(lch);
  
  const normalize = (val: number): number => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  
  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * 두 색상 간 대비 비율 계산 (WCAG 2.1)
 * @param color1 첫 번째 색상
 * @param color2 두 번째 색상
 * @returns 대비 비율 (1-21)
 */
export const getContrastRatio = (color1: LCHColor, color2: LCHColor): number => {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * 접근성 등급 확인 (WCAG 2.1)
 * @param foreground 전경색
 * @param background 배경색
 * @param isLargeText 큰 텍스트 여부
 * @returns 접근성 등급 객체
 */
export const checkAccessibility = (
  foreground: LCHColor,
  background: LCHColor,
  isLargeText: boolean = false
): {
  ratio: number;
  grade: 'AAA' | 'AA' | 'FAIL';
  passes: {
    aa: boolean;
    aaa: boolean;
  };
} => {
  const ratio = getContrastRatio(foreground, background);
  const minRatioAA = isLargeText ? 3 : 4.5;
  const minRatioAAA = isLargeText ? 4.5 : 7;
  
  const passesAA = ratio >= minRatioAA;
  const passesAAA = ratio >= minRatioAAA;
  
  let grade: 'AAA' | 'AA' | 'FAIL';
  if (passesAAA) grade = 'AAA';
  else if (passesAA) grade = 'AA';
  else grade = 'FAIL';
  
  return {
    ratio,
    grade,
    passes: {
      aa: passesAA,
      aaa: passesAAA,
    },
  };
};

/**
 * 접근성을 만족하는 색상으로 자동 보정
 * @param foreground 전경색
 * @param background 배경색
 * @param targetRatio 목표 대비 비율 (기본: 4.5)
 * @param adjustForeground 전경색 조정 여부 (기본: true)
 * @returns 보정된 색상
 */
export const ensureAccessibility = (
  foreground: LCHColor,
  background: LCHColor,
  targetRatio: number = 4.5,
  adjustForeground: boolean = true
): LCHColor => {
  const currentRatio = getContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return foreground; // 이미 충분한 대비
  }
  
  const colorToAdjust = adjustForeground ? foreground : background;
  const referenceColor = adjustForeground ? background : foreground;
  
  // 이진 탐색으로 적절한 밝기 찾기
  let low = 0;
  let high = 100;
  let bestColor = colorToAdjust;
  let bestRatio = currentRatio;
  
  for (let i = 0; i < 20; i++) { // 최대 20회 반복
    const mid = (low + high) / 2;
    const testColor = adjustForeground
      ? adjustLightness(colorToAdjust, mid - colorToAdjust[0])
      : adjustLightness(colorToAdjust, mid - colorToAdjust[0]);
    
    const testRatio = getContrastRatio(
      adjustForeground ? testColor : referenceColor,
      adjustForeground ? referenceColor : testColor
    );
    
    if (testRatio >= targetRatio) {
      bestColor = testColor;
      bestRatio = testRatio;
      if (adjustForeground) {
        high = mid;
      } else {
        low = mid;
      }
    } else {
      if (adjustForeground) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }
  
  return bestColor;
};

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
// CSS 커스텀 프로퍼티 생성
// ========================================

/**
 * 테마 설정을 CSS 커스텀 프로퍼티로 변환
 * @param config 테마 설정
 * @param palette 색상 팔레트
 * @returns CSS 커스텀 프로퍼티 맵
 */
export const generateCSSVariables = (
  config: ThemeConfig,
  palette: ThemeColorPalette
): ThemeCSSVariables => {
  const variables = new Map<string, string>();
  
  // 핵심 LCH 값들
  const { base, accent, contrast } = config.core;
  variables.set('--linear-lch-base', `${base[0]} ${base[1]} ${base[2]}`);
  variables.set('--linear-lch-accent', `${accent[0]} ${accent[1]} ${accent[2]}`);
  variables.set('--linear-contrast', contrast.toString());
  
  // 표면 색상들
  Object.entries(palette.surfaces).forEach(([key, color]) => {
    variables.set(`--linear-color-surface-${key}`, lchToCss(color));
  });
  
  // 텍스트 색상들
  Object.entries(palette.text).forEach(([key, color]) => {
    variables.set(`--linear-color-text-${key}`, lchToCss(color));
  });
  
  // 테두리 색상들
  Object.entries(palette.borders).forEach(([key, color]) => {
    variables.set(`--linear-color-border-${key}`, lchToCss(color));
  });
  
  // 강조 색상들
  Object.entries(palette.accent).forEach(([key, color]) => {
    variables.set(`--linear-color-accent-${key}`, lchToCss(color));
  });
  
  // 컨트롤 색상들
  Object.entries(palette.controls).forEach(([key, color]) => {
    variables.set(`--linear-color-control-${key}`, lchToCss(color));
  });
  
  // 아이콘 색상들
  variables.set('--linear-color-icon-default', lchToCss(palette.icons.default));
  variables.set('--linear-color-icon-muted', lchToCss(palette.icons.muted));
  variables.set('--linear-color-icon-accent', lchToCss(palette.icons.accent));
  
  // 시맨틱 색상들
  Object.entries(palette.semantic).forEach(([key, color]) => {
    variables.set(`--linear-color-${key}`, lchToCss(color));
    variables.set(`--linear-color-${key}-bg`, lchToCss([color[0], color[1], color[2], 0.1]));
  });
  
  return variables;
};

/**
 * CSS 커스텀 프로퍼티를 DOM에 적용
 * @param variables CSS 커스텀 프로퍼티 맵
 * @param element 적용할 엘리먼트 (기본: document.documentElement)
 */
export const applyCSSVariables = (
  variables: ThemeCSSVariables,
  element: HTMLElement = document.documentElement
): void => {
  variables.forEach((value, property) => {
    element.style.setProperty(property, value);
  });
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

// ========================================
// 유틸리티 함수들
// ========================================

/**
 * 두 LCH 색상 간의 지각적 거리 계산 (Delta E)
 * @param color1 첫 번째 색상
 * @param color2 두 번째 색상
 * @returns Delta E 값 (낮을수록 유사)
 */
export const calculateColorDistance = (color1: LCHColor, color2: LCHColor): number => {
  const [l1, c1, h1] = color1;
  const [l2, c2, h2] = color2;
  
  // Delta E CIE76 (간단한 버전)
  const deltaL = l1 - l2;
  const deltaC = c1 - c2;
  
  let deltaH = h1 - h2;
  if (deltaH > 180) deltaH -= 360;
  if (deltaH < -180) deltaH += 360;
  
  const deltaE = Math.sqrt(
    deltaL * deltaL +
    deltaC * deltaC +
    deltaH * deltaH
  );
  
  return deltaE;
};

/**
 * 색상 배열에서 가장 대표적인 색상 찾기
 * @param colors 색상 배열
 * @returns 대표 색상
 */
export const findDominantColor = (colors: LCHColor[]): LCHColor => {
  if (colors.length === 0) return [50, 0, 0, 1];
  if (colors.length === 1) return colors[0];
  
  // 각 색상의 중심값 계산
  const avgL = colors.reduce((sum, color) => sum + color[0], 0) / colors.length;
  const avgC = colors.reduce((sum, color) => sum + color[1], 0) / colors.length;
  
  // 순환 평균을 위한 hue 계산
  const sins = colors.reduce((sum, color) => sum + Math.sin(color[2] * Math.PI / 180), 0);
  const cos = colors.reduce((sum, color) => sum + Math.cos(color[2] * Math.PI / 180), 0);
  let avgH = Math.atan2(sins, cos) * 180 / Math.PI;
  if (avgH < 0) avgH += 360;
  
  const avgA = colors.reduce((sum, color) => sum + color[3], 0) / colors.length;
  
  return [avgL, avgC, avgH, avgA];
};

/**
 * 색상의 명도별 변형 생성
 * @param baseColor 기준 색상
 * @param steps 생성할 단계 수
 * @returns 명도별 색상 배열
 */
export const generateLightnessScale = (baseColor: LCHColor, steps: number = 9): LCHColor[] => {
  const scale: LCHColor[] = [];
  const [, c, h, a] = baseColor;
  
  for (let i = 0; i < steps; i++) {
    const lightness = (100 / (steps - 1)) * i;
    scale.push([lightness, c, h, a]);
  }
  
  return scale;
};

/**
 * 반응형 색상 생성 (다양한 화면 크기에 최적화)
 * @param baseColor 기준 색상
 * @returns 반응형 색상 설정
 */
export const generateResponsiveColors = (baseColor: LCHColor): {
  mobile: LCHColor;
  tablet: LCHColor;
  desktop: LCHColor;
  print: LCHColor;
} => {
  return {
    mobile: adjustChroma(baseColor, -10), // 모바일: 채도 낮춤
    tablet: baseColor, // 태블릿: 기본
    desktop: adjustChroma(baseColor, 5), // 데스크톱: 채도 높임
    print: [baseColor[0], 0, baseColor[2], baseColor[3]], // 인쇄: 무채색
  };
};

// 기본 내보내기
export default {
  // 색공간 변환
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
  
  // 접근성
  getRelativeLuminance,
  getContrastRatio,
  checkAccessibility,
  ensureAccessibility,
  
  // 분석
  analyzeTemperature,
  analyzeSaturation,
  analyzeHarmony,
  
  // 테마 생성
  generateColorPalette,
  optimizePaletteAccessibility,
  generateCSSVariables,
  applyCSSVariables,
  
  // 검증
  validateThemeConfig,
  calculateThemeQuality,
  
  // 유틸리티
  calculateColorDistance,
  findDominantColor,
  generateLightnessScale,
  generateResponsiveColors,
};