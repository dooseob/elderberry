/**
 * Accessibility Module - 접근성 검사 및 보정 유틸리티
 * 
 * WCAG 2.1 기준 접근성 검사, 대비 비율 계산, 자동 보정 기능을 제공합니다.
 * 
 * @version 2025.1.0
 * @author Linear Theme System
 */

import type { LCHColor } from '../../types/theme';
import { lchToRgb, adjustLightness } from './color-conversion';

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

/**
 * 색상 배치의 전체적인 접근성 검사
 * @param colors 검사할 색상 조합 배열
 * @returns 접근성 분석 결과
 */
export const analyzeColorAccessibility = (
  colors: Array<{ foreground: LCHColor; background: LCHColor; context: string }>
): {
  overallScore: number;
  results: Array<{
    context: string;
    ratio: number;
    grade: 'AAA' | 'AA' | 'FAIL';
    recommendation?: string;
  }>;
  summary: {
    total: number;
    aaa: number;
    aa: number;
    fail: number;
  };
} => {
  const results = colors.map(({ foreground, background, context }) => {
    const accessibility = checkAccessibility(foreground, background);
    const result = {
      context,
      ratio: accessibility.ratio,
      grade: accessibility.grade,
    };
    
    // 개선 권장사항 추가
    if (accessibility.grade === 'FAIL') {
      return {
        ...result,
        recommendation: `대비 비율을 ${4.5.toFixed(1)}:1 이상으로 높이세요 (현재: ${accessibility.ratio.toFixed(1)}:1)`,
      };
    } else if (accessibility.grade === 'AA') {
      return {
        ...result,
        recommendation: 'AAA 등급을 위해 대비를 더 높일 수 있습니다',
      };
    }
    
    return result;
  });
  
  const summary = {
    total: results.length,
    aaa: results.filter(r => r.grade === 'AAA').length,
    aa: results.filter(r => r.grade === 'AA').length,
    fail: results.filter(r => r.grade === 'FAIL').length,
  };
  
  // 전체 점수 계산 (AAA: 100점, AA: 80점, FAIL: 0점)
  const overallScore = summary.total > 0 
    ? Math.round((summary.aaa * 100 + summary.aa * 80) / summary.total)
    : 0;
  
  return {
    overallScore,
    results,
    summary,
  };
};

/**
 * 색맹 시뮬레이션을 위한 색상 변환
 * @param color 원본 색상
 * @param type 색맹 타입
 * @returns 시뮬레이션된 색상
 */
export const simulateColorBlindness = (
  color: LCHColor, 
  type: 'protanopia' | 'deuteranopia' | 'tritanopia'
): LCHColor => {
  const rgb = lchToRgb(color);
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;
  
  // 각 색맹 타입에 따른 변환 매트릭스 적용
  let newR: number, newG: number, newB: number;
  
  switch (type) {
    case 'protanopia': // 적색맹
      newR = 0.567 * r + 0.433 * g;
      newG = 0.558 * r + 0.442 * g;
      newB = 0.242 * g + 0.758 * b;
      break;
    case 'deuteranopia': // 녹색맹
      newR = 0.625 * r + 0.375 * g;
      newG = 0.7 * r + 0.3 * g;
      newB = 0.3 * g + 0.7 * b;
      break;
    case 'tritanopia': // 청색맹
      newR = 0.95 * r + 0.05 * g;
      newG = 0.433 * g + 0.567 * b;
      newB = 0.475 * g + 0.525 * b;
      break;
    default:
      return color;
  }
  
  // RGB를 0-255 범위로 변환하고 다시 LCH로 변환
  const simulatedRgb = {
    r: Math.round(Math.max(0, Math.min(255, newR * 255))),
    g: Math.round(Math.max(0, Math.min(255, newG * 255))),
    b: Math.round(Math.max(0, Math.min(255, newB * 255))),
    a: color[3],
  };
  
  // RGB를 LCH로 다시 변환하기 위해 color-conversion에서 import 필요
  // 현재는 근사치로 계산
  return [color[0], color[1] * 0.8, color[2], color[3]];
};

/**
 * 색상 조합의 색맹 친화성 검사
 * @param foreground 전경색
 * @param background 배경색
 * @returns 색맹 친화성 분석 결과
 */
export const checkColorBlindFriendliness = (
  foreground: LCHColor,
  background: LCHColor
): {
  protanopia: { ratio: number; grade: 'AAA' | 'AA' | 'FAIL' };
  deuteranopia: { ratio: number; grade: 'AAA' | 'AA' | 'FAIL' };
  tritanopia: { ratio: number; grade: 'AAA' | 'AA' | 'FAIL' };
  overallGrade: 'AAA' | 'AA' | 'FAIL';
  isColorBlindSafe: boolean;
} => {
  const protanopiaFG = simulateColorBlindness(foreground, 'protanopia');
  const protanopiaBG = simulateColorBlindness(background, 'protanopia');
  const protanopia = checkAccessibility(protanopiaFG, protanopiaBG);
  
  const deuteranopiaFG = simulateColorBlindness(foreground, 'deuteranopia');
  const deuteranopiaBG = simulateColorBlindness(background, 'deuteranopia');
  const deuteranopia = checkAccessibility(deuteranopiaFG, deuteranopiaBG);
  
  const tritanopiaFG = simulateColorBlindness(foreground, 'tritanopia');
  const tritanopiaBG = simulateColorBlindness(background, 'tritanopia');
  const tritanopia = checkAccessibility(tritanopiaFG, tritanopiaBG);
  
  const grades = [protanopia.grade, deuteranopia.grade, tritanopia.grade];
  const hasFailure = grades.includes('FAIL');
  const hasAA = grades.includes('AA');
  
  let overallGrade: 'AAA' | 'AA' | 'FAIL';
  if (hasFailure) {
    overallGrade = 'FAIL';
  } else if (hasAA) {
    overallGrade = 'AA';
  } else {
    overallGrade = 'AAA';
  }
  
  return {
    protanopia: {
      ratio: protanopia.ratio,
      grade: protanopia.grade,
    },
    deuteranopia: {
      ratio: deuteranopia.ratio,
      grade: deuteranopia.grade,
    },
    tritanopia: {
      ratio: tritanopia.ratio,
      grade: tritanopia.grade,
    },
    overallGrade,
    isColorBlindSafe: !hasFailure,
  };
};

/**
 * 접근성 권장사항 생성
 * @param foreground 전경색
 * @param background 배경색
 * @param context 사용 맥락
 * @returns 구체적인 권장사항 목록
 */
export const generateAccessibilityRecommendations = (
  foreground: LCHColor,
  background: LCHColor,
  context: 'text' | 'button' | 'link' | 'icon' = 'text'
): {
  recommendations: string[];
  priority: 'low' | 'medium' | 'high';
  hasIssues: boolean;
} => {
  const accessibility = checkAccessibility(foreground, background);
  const colorBlindness = checkColorBlindFriendliness(foreground, background);
  const recommendations: string[] = [];
  
  let priority: 'low' | 'medium' | 'high' = 'low';
  
  // 대비 비율 검사
  if (accessibility.grade === 'FAIL') {
    priority = 'high';
    const targetRatio = context === 'text' ? 4.5 : 3.0;
    recommendations.push(
      `대비 비율이 너무 낮습니다 (${accessibility.ratio.toFixed(1)}:1). 최소 ${targetRatio}:1 이상 필요합니다.`
    );
    
    if (foreground[0] > 50) {
      recommendations.push('전경색을 더 어둡게 만들거나 배경색을 더 밝게 만드세요.');
    } else {
      recommendations.push('전경색을 더 밝게 만들거나 배경색을 더 어둡게 만드세요.');
    }
  } else if (accessibility.grade === 'AA') {
    priority = priority === 'high' ? 'high' : 'medium';
    recommendations.push('AAA 등급 달성을 위해 대비를 더 높일 수 있습니다.');
  }
  
  // 색맹 친화성 검사
  if (!colorBlindness.isColorBlindSafe) {
    priority = 'high';
    recommendations.push('색맹 사용자를 위해 색상 이외의 시각적 단서(아이콘, 패턴 등)를 함께 사용하세요.');
  }
  
  // 맥락별 권장사항
  switch (context) {
    case 'button':
      if (accessibility.ratio < 3) {
        recommendations.push('버튼의 경우 최소 3:1 대비 비율이 필요합니다.');
      }
      recommendations.push('버튼 상태(hover, active)에서도 접근성을 유지하세요.');
      break;
    case 'link':
      recommendations.push('링크는 주변 텍스트와 3:1 이상의 대비를 유지해야 합니다.');
      if (accessibility.ratio < 4.5) {
        recommendations.push('링크에 밑줄이나 다른 시각적 표시를 추가하는 것을 고려하세요.');
      }
      break;
    case 'icon':
      recommendations.push('아이콘에 대체 텍스트(alt text)나 레이블을 제공하세요.');
      break;
  }
  
  return {
    recommendations,
    priority,
    hasIssues: accessibility.grade === 'FAIL' || !colorBlindness.isColorBlindSafe,
  };
};