/**
 * 레이아웃 안정성 유틸리티
 * Cumulative Layout Shift (CLS) 개선을 위한 도구들
 */

/**
 * 이미지 비율 계산
 */
export const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

/**
 * 반응형 이미지 사이즈 생성
 */
export const generateSizes = (breakpoints: { [key: string]: string }): string => {
  const entries = Object.entries(breakpoints);
  const sizeQueries = entries
    .map(([breakpoint, size]) => {
      if (breakpoint === 'default') return size;
      return `(max-width: ${breakpoint}) ${size}`;
    })
    .reverse();
  
  return sizeQueries.join(', ');
};

/**
 * 레이아웃 시프트 방지용 placeholder 치수 계산
 */
export const getPlaceholderDimensions = (
  originalWidth: number,
  originalHeight: number,
  containerWidth?: number
): { width: number; height: number } => {
  if (!containerWidth) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const aspectRatio = originalHeight / originalWidth;
  return {
    width: containerWidth,
    height: containerWidth * aspectRatio
  };
};

/**
 * 스켈레톤 로더 클래스
 */
export class SkeletonLoader {
  private element: HTMLElement;
  private originalContent: string;
  private isLoading: boolean = false;

  constructor(element: HTMLElement) {
    this.element = element;
    this.originalContent = element.innerHTML;
  }

  show(config?: {
    lines?: number;
    height?: string;
    className?: string;
    animated?: boolean;
  }): void {
    if (this.isLoading) return;

    const {
      lines = 3,
      height = '1rem',
      className = 'bg-gray-200 rounded',
      animated = true
    } = config || {};

    const skeletonHTML = Array.from({ length: lines }, (_, index) => {
      const width = index === lines - 1 ? '60%' : '100%';
      const animationClass = animated ? 'animate-pulse' : '';
      
      return `
        <div 
          class="${className} ${animationClass}"
          style="height: ${height}; width: ${width}; margin-bottom: 0.5rem;"
          role="presentation"
          aria-hidden="true"
        ></div>
      `;
    }).join('');

    this.element.innerHTML = skeletonHTML;
    this.element.setAttribute('aria-label', '콘텐츠를 로딩 중입니다');
    this.isLoading = true;
  }

  hide(): void {
    if (!this.isLoading) return;

    this.element.innerHTML = this.originalContent;
    this.element.removeAttribute('aria-label');
    this.isLoading = false;
  }

  isVisible(): boolean {
    return this.isLoading;
  }
}

/**
 * 동적 콘텐츠를 위한 예약된 공간 관리
 */
export class ReservedSpace {
  private static instances = new Map<string, ReservedSpace>();
  private element: HTMLElement;
  private originalHeight: string;
  private reservedHeight: string;

  constructor(element: HTMLElement, height: string) {
    this.element = element;
    this.originalHeight = element.style.height || 'auto';
    this.reservedHeight = height;
  }

  static create(id: string, element: HTMLElement, height: string): ReservedSpace {
    if (ReservedSpace.instances.has(id)) {
      return ReservedSpace.instances.get(id)!;
    }

    const instance = new ReservedSpace(element, height);
    ReservedSpace.instances.set(id, instance);
    return instance;
  }

  reserve(): void {
    this.element.style.minHeight = this.reservedHeight;
    this.element.style.transition = 'min-height 0.3s ease-in-out';
  }

  release(): void {
    this.element.style.minHeight = 'auto';
  }

  destroy(): void {
    this.element.style.height = this.originalHeight;
    this.element.style.minHeight = '';
    this.element.style.transition = '';
  }

  static cleanup(): void {
    ReservedSpace.instances.forEach(instance => instance.destroy());
    ReservedSpace.instances.clear();
  }
}

/**
 * 폰트 로딩과 레이아웃 시프트 방지
 */
export class FontLoadingOptimizer {
  private static isInitialized = false;
  private static fallbackFonts = new Map<string, string>();

  static initialize(): void {
    if (FontLoadingOptimizer.isInitialized || typeof document === 'undefined') {
      return;
    }

    // 시스템 폰트 스택 정의
    FontLoadingOptimizer.fallbackFonts.set('korean', 
      'system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
    );
    
    FontLoadingOptimizer.fallbackFonts.set('english', 
      'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif'
    );

    // CSS에서 폰트 로딩 상태 클래스 추가
    document.documentElement.classList.add('fonts-loading');

    // 폰트 로드 완료 감지
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
      });
    }

    FontLoadingOptimizer.isInitialized = true;
  }

  static preloadFont(fontFamily: string, weight: string = '400'): Promise<void> {
    if (typeof document === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const font = new FontFace(fontFamily, `url(/fonts/${fontFamily}-${weight}.woff2)`, {
        weight,
        display: 'swap'
      });

      font.load()
        .then((loadedFont) => {
          document.fonts.add(loadedFont);
          resolve();
        })
        .catch(reject);
    });
  }

  static getFallbackFont(language: 'korean' | 'english' = 'korean'): string {
    return FontLoadingOptimizer.fallbackFonts.get(language) || 'sans-serif';
  }
}

/**
 * 애니메이션과 레이아웃 시프트 관리
 */
export class AnimationOptimizer {
  private static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static createSafeTransition(
    element: HTMLElement,
    properties: string[],
    duration: number = 300,
    easing: string = 'ease-in-out'
  ): void {
    if (AnimationOptimizer.prefersReducedMotion()) {
      // 모션을 줄이려는 사용자에게는 즉시 적용
      element.style.transition = 'none';
      return;
    }

    // transform, opacity만 사용하여 layout을 트리거하지 않는 애니메이션
    const safeProperties = properties.filter(prop => 
      prop.startsWith('transform') || 
      prop.startsWith('opacity') || 
      prop.startsWith('filter')
    );

    if (safeProperties.length === 0) {
      console.warn('레이아웃 시프트를 유발할 수 있는 속성이 감지되었습니다:', properties);
    }

    element.style.transition = `${safeProperties.join(', ')} ${duration}ms ${easing}`;
  }

  static animateWithoutLayoutShift(
    element: HTMLElement,
    keyframes: Keyframe[],
    options?: KeyframeAnimationOptions
  ): Animation | null {
    if (AnimationOptimizer.prefersReducedMotion()) {
      return null;
    }

    // layout을 트리거하지 않는 속성만 필터링
    const safeKeyframes = keyframes.map(frame => {
      const safeFrame: Keyframe = {};
      Object.entries(frame).forEach(([key, value]) => {
        if (key === 'transform' || key === 'opacity' || key.startsWith('filter')) {
          safeFrame[key as any] = value;
        }
      });
      return safeFrame;
    });

    return element.animate(safeKeyframes, {
      duration: 300,
      easing: 'ease-in-out',
      ...options
    });
  }
}

/**
 * 광고나 외부 콘텐츠로 인한 레이아웃 시프트 방지
 */
export class AdSpaceManager {
  private static adSlots = new Map<string, HTMLElement>();

  static reserveAdSpace(
    containerId: string,
    width: number,
    height: number,
    position: 'static' | 'sticky' | 'fixed' = 'static'
  ): HTMLElement {
    const container = document.createElement('div');
    container.id = containerId;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.position = position;
    container.style.backgroundColor = '#f5f5f5';
    container.style.border = '1px dashed #ddd';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.fontSize = '12px';
    container.style.color = '#999';
    container.textContent = '광고 영역';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', '광고 영역');

    AdSpaceManager.adSlots.set(containerId, container);
    return container;
  }

  static loadAd(containerId: string, adContent: HTMLElement | string): void {
    const container = AdSpaceManager.adSlots.get(containerId);
    if (!container) {
      console.warn(`광고 슬롯을 찾을 수 없습니다: ${containerId}`);
      return;
    }

    // 예약된 공간의 크기 유지
    const { width, height } = container.getBoundingClientRect();
    
    if (typeof adContent === 'string') {
      container.innerHTML = adContent;
    } else {
      container.innerHTML = '';
      container.appendChild(adContent);
    }

    // 크기가 변경되었다면 원래 크기로 복원
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
  }

  static removeAd(containerId: string): void {
    const container = AdSpaceManager.adSlots.get(containerId);
    if (container) {
      container.remove();
      AdSpaceManager.adSlots.delete(containerId);
    }
  }
}

/**
 * CLS 측정 및 모니터링
 */
export class CLSMonitor {
  private static clsValue = 0;
  private static observer: PerformanceObserver | null = null;

  static initialize(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    CLSMonitor.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          CLSMonitor.clsValue += (entry as any).value;
        }
      }
    });

    CLSMonitor.observer.observe({ type: 'layout-shift', buffered: true });
  }

  static getCLS(): number {
    return CLSMonitor.clsValue;
  }

  static reset(): void {
    CLSMonitor.clsValue = 0;
  }

  static cleanup(): void {
    if (CLSMonitor.observer) {
      CLSMonitor.observer.disconnect();
      CLSMonitor.observer = null;
    }
  }

  static getRecommendations(): string[] {
    const cls = CLSMonitor.getCLS();
    const recommendations = [];

    if (cls > 0.25) {
      recommendations.push('매우 높음: 이미지와 광고에 고정된 크기를 설정하세요');
      recommendations.push('동적 콘텐츠를 기존 콘텐츠 위에 삽입하지 마세요');
    } else if (cls > 0.1) {
      recommendations.push('개선 필요: 폰트 로딩 최적화를 고려하세요');
      recommendations.push('iframe과 embed 요소에 크기를 명시하세요');
    } else {
      recommendations.push('좋음: 현재 CLS 점수를 유지하세요');
    }

    return recommendations;
  }
}

// 자동 초기화
if (typeof window !== 'undefined') {
  FontLoadingOptimizer.initialize();
  CLSMonitor.initialize();
}