/**
 * Color Conversion Module - 색공간 변환 유틸리티
 * 
 * LCH, RGB, Hex 간의 변환 및 색상 조작 함수들을 제공합니다.
 * 
 * @version 2025.1.0
 * @author Linear Theme System
 */

import type { LCHColor } from '../../types/theme';

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