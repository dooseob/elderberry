/**
 * 접근성 (a11y) 유틸리티
 * WCAG 2.1 AA 가이드라인 준수를 위한 도구들
 */

/**
 * 포커스 관리 유틸리티
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  private static trapElements = new Map<string, HTMLElement[]>();

  /**
   * 포커스를 특정 요소로 이동하고 스택에 저장
   */
  static moveTo(element: HTMLElement, options?: { preventScroll?: boolean }): void {
    if (document.activeElement instanceof HTMLElement) {
      FocusManager.focusStack.push(document.activeElement);
    }
    
    element.focus({ preventScroll: options?.preventScroll });
    
    // 스크린 리더에게 변경사항 알리기
    element.setAttribute('tabindex', '-1');
    setTimeout(() => {
      element.removeAttribute('tabindex');
    }, 100);
  }

  /**
   * 이전 포커스 위치로 복원
   */
  static restore(): void {
    const previousElement = FocusManager.focusStack.pop();
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }

  /**
   * 포커스 트랩 설정 (모달, 드롭다운 등에 사용)
   */
  static trapFocus(containerId: string, container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    FocusManager.trapElements.set(containerId, [firstElement, lastElement]);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // cleanup function을 반환
    const cleanup = () => {
      container.removeEventListener('keydown', handleKeyDown);
      FocusManager.trapElements.delete(containerId);
    };

    return cleanup;
  }

  /**
   * 포커스 트랩 해제
   */
  static releaseTrap(containerId: string): void {
    FocusManager.trapElements.delete(containerId);
  }

  /**
   * 포커스 가능한 첫 번째 요소 찾기
   */
  static findFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusable = container.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    return focusable;
  }
}

/**
 * 스크린 리더 지원 유틸리티
 */
export class ScreenReaderSupport {
  private static announcements = new Map<string, HTMLElement>();

  /**
   * 스크린 리더에게 즉시 알림
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = ScreenReaderSupport.getAnnouncer(priority);
    announcer.textContent = message;
    
    // 같은 메시지 반복 시에도 알림이 가도록
    setTimeout(() => {
      announcer.textContent = '';
    }, 100);
  }

  /**
   * 상태 변경 알림 (예: 로딩, 완료 등)
   */
  static announceStatus(status: string, context?: string): void {
    const message = context ? `${context}: ${status}` : status;
    ScreenReaderSupport.announce(message, 'polite');
  }

  /**
   * 에러 메시지 알림 (높은 우선순위)
   */
  static announceError(error: string): void {
    ScreenReaderSupport.announce(`오류: ${error}`, 'assertive');
  }

  /**
   * 성공 메시지 알림
   */
  static announceSuccess(message: string): void {
    ScreenReaderSupport.announce(`완료: ${message}`, 'polite');
  }

  /**
   * 진행률 알림
   */
  static announceProgress(current: number, total: number, context?: string): void {
    const percentage = Math.round((current / total) * 100);
    const message = context 
      ? `${context} 진행률: ${percentage}%` 
      : `진행률: ${percentage}%`;
    ScreenReaderSupport.announce(message, 'polite');
  }

  /**
   * 알림용 숨김 요소 생성
   */
  private static getAnnouncer(priority: 'polite' | 'assertive'): HTMLElement {
    const id = `sr-announcer-${priority}`;
    
    if (!ScreenReaderSupport.announcements.has(id)) {
      const announcer = document.createElement('div');
      announcer.id = id;
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      
      document.body.appendChild(announcer);
      ScreenReaderSupport.announcements.set(id, announcer);
    }

    return ScreenReaderSupport.announcements.get(id)!;
  }

  /**
   * cleanup
   */
  static cleanup(): void {
    ScreenReaderSupport.announcements.forEach(element => {
      element.remove();
    });
    ScreenReaderSupport.announcements.clear();
  }
}

/**
 * 키보드 네비게이션 지원
 */
export class KeyboardNavigation {
  /**
   * 방향키로 요소 간 이동 (그리드, 리스트 등)
   */
  static enableArrowNavigation(
    container: HTMLElement,
    options: {
      direction: 'horizontal' | 'vertical' | 'grid';
      wrap?: boolean;
      columns?: number; // grid 타입일 때 필요
    }
  ): () => void {
    const { direction, wrap = true, columns } = options;

    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )) as HTMLElement[];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const elements = getFocusableElements();
      const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
      
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'grid') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= elements.length) {
              nextIndex = wrap ? 0 : currentIndex;
            }
            event.preventDefault();
          }
          break;

        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'grid') {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = wrap ? elements.length - 1 : currentIndex;
            }
            event.preventDefault();
          }
          break;

        case 'ArrowDown':
          if (direction === 'vertical') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= elements.length) {
              nextIndex = wrap ? 0 : currentIndex;
            }
            event.preventDefault();
          } else if (direction === 'grid' && columns) {
            nextIndex = currentIndex + columns;
            if (nextIndex >= elements.length) {
              nextIndex = wrap ? currentIndex % columns : currentIndex;
            }
            event.preventDefault();
          }
          break;

        case 'ArrowUp':
          if (direction === 'vertical') {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = wrap ? elements.length - 1 : currentIndex;
            }
            event.preventDefault();
          } else if (direction === 'grid' && columns) {
            nextIndex = currentIndex - columns;
            if (nextIndex < 0) {
              const column = currentIndex % columns;
              const lastRowStart = Math.floor((elements.length - 1) / columns) * columns;
              nextIndex = wrap ? lastRowStart + column : currentIndex;
            }
            event.preventDefault();
          }
          break;

        case 'Home':
          nextIndex = 0;
          event.preventDefault();
          break;

        case 'End':
          nextIndex = elements.length - 1;
          event.preventDefault();
          break;
      }

      if (nextIndex !== currentIndex && elements[nextIndex]) {
        elements[nextIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Escape 키로 닫기 기능
   */
  static enableEscapeClose(element: HTMLElement, onClose: () => void): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * 색상 대비 검증 (WCAG AA/AAA 준수)
 */
export class ColorContrastChecker {
  /**
   * 색상 대비율 계산
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = ColorContrastChecker.hexToRgb(color1);
    const rgb2 = ColorContrastChecker.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;

    const l1 = ColorContrastChecker.getLuminance(rgb1);
    const l2 = ColorContrastChecker.getLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * WCAG 준수 여부 확인
   */
  static checkWCAGCompliance(
    foreground: string, 
    background: string, 
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
  ): {
    ratio: number;
    passes: boolean;
    level: string;
    recommendation?: string;
  } {
    const ratio = ColorContrastChecker.getContrastRatio(foreground, background);
    
    let requiredRatio: number;
    if (level === 'AAA') {
      requiredRatio = isLargeText ? 4.5 : 7;
    } else {
      requiredRatio = isLargeText ? 3 : 4.5;
    }

    const passes = ratio >= requiredRatio;
    
    let recommendation: string | undefined;
    if (!passes) {
      if (ratio < 3) {
        recommendation = '색상 대비가 매우 낮습니다. 전경색이나 배경색을 크게 조정하세요.';
      } else if (ratio < 4.5) {
        recommendation = '일반 텍스트에는 부적합합니다. 큰 텍스트(18pt 이상)에만 사용하세요.';
      } else {
        recommendation = 'AAA 레벨을 위해 대비를 더 높이는 것을 고려하세요.';
      }
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      passes,
      level,
      recommendation
    };
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private static getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }
}

/**
 * 접근성 자동 검증
 */
export class AccessibilityValidator {
  /**
   * 페이지 접근성 검증
   */
  static validatePage(): {
    errors: Array<{ element: HTMLElement; message: string; severity: 'error' | 'warning' }>;
    score: number;
    recommendations: string[];
  } {
    const errors: Array<{ element: HTMLElement; message: string; severity: 'error' | 'warning' }> = [];
    
    // 이미지 alt 텍스트 검증
    document.querySelectorAll('img').forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        errors.push({
          element: img,
          message: '이미지에 alt 텍스트나 aria-label이 필요합니다',
          severity: 'error'
        });
      }
    });

    // 버튼 접근성 검증
    document.querySelectorAll('button').forEach(button => {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        errors.push({
          element: button,
          message: '버튼에 텍스트나 aria-label이 필요합니다',
          severity: 'error'
        });
      }
    });

    // 폼 라벨 검증
    document.querySelectorAll('input:not([type="hidden"])').forEach(input => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledby = input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
        errors.push({
          element: input,
          message: '입력 필드에 라벨이 필요합니다',
          severity: 'error'
        });
      }
    });

    // 제목 구조 검증
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel > previousLevel + 1) {
        errors.push({
          element: heading,
          message: `제목 레벨이 건너뛰었습니다 (h${previousLevel} 다음에 h${currentLevel})`,
          severity: 'warning'
        });
      }
      
      previousLevel = currentLevel;
    });

    // 점수 계산 (100점 만점)
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = errors.filter(e => e.severity === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 15) - (warningCount * 5));

    // 권장사항 생성
    const recommendations = AccessibilityValidator.generateRecommendations(errors);

    return { errors, score, recommendations };
  }

  private static generateRecommendations(errors: Array<{ severity: string }>): string[] {
    const recommendations = [];
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = errors.filter(e => e.severity === 'warning').length;

    if (errorCount > 0) {
      recommendations.push(`${errorCount}개의 심각한 접근성 문제를 해결하세요`);
    }
    
    if (warningCount > 0) {
      recommendations.push(`${warningCount}개의 접근성 개선사항을 고려하세요`);
    }

    if (errors.length === 0) {
      recommendations.push('훌륭합니다! 기본적인 접근성 검사를 통과했습니다');
      recommendations.push('추가적인 사용성 테스트를 진행하세요');
    }

    return recommendations;
  }
}

// 전역 초기화
if (typeof window !== 'undefined') {
  // 스크린 리더 지원 초기화
  ScreenReaderSupport.announce('페이지가 로드되었습니다', 'polite');
  
  // cleanup 이벤트 리스너
  window.addEventListener('beforeunload', () => {
    ScreenReaderSupport.cleanup();
  });
}