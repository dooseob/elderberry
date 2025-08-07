/**
 * CSS Variables Module - CSS 커스텀 프로퍼티 관리
 * 
 * 테마 설정을 CSS 커스텀 프로퍼티로 변환하고 DOM에 적용하는 기능을 제공합니다.
 * 
 * @version 2025.1.0
 * @author Linear Theme System
 */

import type {
  ThemeConfig,
  ThemeColorPalette,
  ThemeCSSVariables,
} from '../../types/theme';
import { lchToCss } from './color-conversion';

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

/**
 * CSS 커스텀 프로퍼티를 DOM에서 제거
 * @param variableNames 제거할 프로퍼티 이름 배열
 * @param element 대상 엘리먼트 (기본: document.documentElement)
 */
export const removeCSSVariables = (
  variableNames: string[],
  element: HTMLElement = document.documentElement
): void => {
  variableNames.forEach(property => {
    element.style.removeProperty(property);
  });
};

/**
 * 현재 적용된 CSS 커스텀 프로퍼티 값 조회
 * @param variableName CSS 변수 이름
 * @param element 대상 엘리먼트 (기본: document.documentElement)
 * @returns CSS 변수 값
 */
export const getCSSVariableValue = (
  variableName: string,
  element: HTMLElement = document.documentElement
): string => {
  return getComputedStyle(element).getPropertyValue(variableName).trim();
};

/**
 * CSS 변수들을 CSS 문자열로 변환
 * @param variables CSS 커스텀 프로퍼티 맵
 * @param selector CSS 셀렉터 (기본: ':root')
 * @returns CSS 문자열
 */
export const generateCSSString = (
  variables: ThemeCSSVariables,
  selector: string = ':root'
): string => {
  const declarations: string[] = [];
  
  variables.forEach((value, property) => {
    declarations.push(`  ${property}: ${value};`);
  });
  
  return `${selector} {\n${declarations.join('\n')}\n}`;
};

/**
 * 미디어 쿼리를 포함한 반응형 CSS 변수 생성
 * @param baseVariables 기본 CSS 변수들
 * @param breakpoints 중단점별 변수 오버라이드
 * @returns 반응형 CSS 문자열
 */
export const generateResponsiveCSSString = (
  baseVariables: ThemeCSSVariables,
  breakpoints: {
    mobile?: ThemeCSSVariables;
    tablet?: ThemeCSSVariables;
    desktop?: ThemeCSSVariables;
  } = {}
): string => {
  let cssString = generateCSSString(baseVariables, ':root');
  
  // 모바일 중단점
  if (breakpoints.mobile && breakpoints.mobile.size > 0) {
    cssString += '\n\n@media (max-width: 768px) {\n';
    cssString += generateCSSString(breakpoints.mobile, '  :root');
    cssString += '\n}';
  }
  
  // 태블릿 중단점
  if (breakpoints.tablet && breakpoints.tablet.size > 0) {
    cssString += '\n\n@media (min-width: 769px) and (max-width: 1024px) {\n';
    cssString += generateCSSString(breakpoints.tablet, '  :root');
    cssString += '\n}';
  }
  
  // 데스크톱 중단점
  if (breakpoints.desktop && breakpoints.desktop.size > 0) {
    cssString += '\n\n@media (min-width: 1025px) {\n';
    cssString += generateCSSString(breakpoints.desktop, '  :root');
    cssString += '\n}';
  }
  
  return cssString;
};

/**
 * 다크/라이트 모드 CSS 변수 토글
 * @param lightVariables 라이트 모드 변수들
 * @param darkVariables 다크 모드 변수들
 * @param isDark 다크 모드 여부
 * @param element 적용할 엘리먼트
 */
export const toggleThemeMode = (
  lightVariables: ThemeCSSVariables,
  darkVariables: ThemeCSSVariables,
  isDark: boolean,
  element: HTMLElement = document.documentElement
): void => {
  const targetVariables = isDark ? darkVariables : lightVariables;
  applyCSSVariables(targetVariables, element);
  
  // 데이터 속성으로 현재 테마 표시
  element.setAttribute('data-theme', isDark ? 'dark' : 'light');
};

/**
 * CSS 변수 프리로딩을 위한 <style> 태그 생성
 * @param variables CSS 커스텀 프로퍼티 맵
 * @param id 스타일 태그 ID
 * @returns 생성된 <style> 엘리먼트
 */
export const createStyleElement = (
  variables: ThemeCSSVariables,
  id: string = 'linear-theme-variables'
): HTMLStyleElement => {
  // 기존 스타일 태그 제거
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.textContent = generateCSSString(variables);
  
  return styleElement;
};

/**
 * 테마 CSS 변수를 <head>에 삽입
 * @param variables CSS 커스텀 프로퍼티 맵
 * @param id 스타일 태그 ID
 */
export const injectThemeVariables = (
  variables: ThemeCSSVariables,
  id: string = 'linear-theme-variables'
): void => {
  const styleElement = createStyleElement(variables, id);
  document.head.appendChild(styleElement);
};

/**
 * CSS 변수 값의 유효성 검사
 * @param variables CSS 커스텀 프로퍼티 맵
 * @returns 검증 결과
 */
export const validateCSSVariables = (variables: ThemeCSSVariables): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  variables.forEach((value, property) => {
    // 프로퍼티 이름 검사
    if (!property.startsWith('--')) {
      errors.push(`Invalid CSS custom property name: ${property}`);
    }
    
    // 값 검사
    if (!value || value.trim() === '') {
      errors.push(`Empty value for CSS property: ${property}`);
    }
    
    // LCH 값 형식 검사
    if (value.includes('lch(') && !value.match(/lch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+(\s*\/\s*[\d.]+)?\s*\)/)) {
      warnings.push(`Invalid LCH format for property: ${property}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * CSS 변수들을 JSON으로 내보내기
 * @param variables CSS 커스텀 프로퍼티 맵
 * @returns JSON 객체
 */
export const exportVariablesToJSON = (variables: ThemeCSSVariables): Record<string, string> => {
  const result: Record<string, string> = {};
  variables.forEach((value, property) => {
    result[property] = value;
  });
  return result;
};

/**
 * JSON에서 CSS 변수들 불러오기
 * @param json JSON 객체
 * @returns CSS 커스텀 프로퍼티 맵
 */
export const importVariablesFromJSON = (json: Record<string, string>): ThemeCSSVariables => {
  const variables = new Map<string, string>();
  Object.entries(json).forEach(([property, value]) => {
    variables.set(property, value);
  });
  return variables;
};

/**
 * 브라우저 지원 검사
 * @returns CSS 커스텀 프로퍼티 지원 여부
 */
export const checkCSSCustomPropertySupport = (): {
  supported: boolean;
  fallbackRequired: boolean;
} => {
  try {
    // CSS.supports API 사용 가능한 경우
    if (typeof CSS !== 'undefined' && CSS.supports) {
      const supported = CSS.supports('(--custom: value)');
      return {
        supported,
        fallbackRequired: !supported,
      };
    }
    
    // 폴백: 테스트 엘리먼트로 확인
    const testElement = document.createElement('div');
    testElement.style.setProperty('--test', 'value');
    const supported = testElement.style.getPropertyValue('--test') === 'value';
    
    return {
      supported,
      fallbackRequired: !supported,
    };
  } catch {
    return {
      supported: false,
      fallbackRequired: true,
    };
  }
};

/**
 * CSS 변수 애니메이션 지원
 * @param property CSS 변수 이름
 * @param fromValue 시작 값
 * @param toValue 끝 값
 * @param duration 지속 시간 (ms)
 * @param element 대상 엘리먼트
 */
export const animateCSSVariable = (
  property: string,
  fromValue: string,
  toValue: string,
  duration: number = 300,
  element: HTMLElement = document.documentElement
): Promise<void> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // 현재는 단순한 문자열 보간만 지원
      // 실제로는 색상 값이나 숫자 값에 따른 보간이 필요
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.setProperty(property, toValue);
        resolve();
      }
    };
    
    element.style.setProperty(property, fromValue);
    requestAnimationFrame(animate);
  });
};