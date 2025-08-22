/**
 * 애니메이션 설정 유틸리티
 * 사용자 설정과 성능에 따라 애니메이션을 조절
 */

// 애니메이션 설정 타입
export interface AnimationConfig {
  enabled: boolean;
  reducedMotion: boolean;
  performance: 'high' | 'medium' | 'low';
}

// 기본 애니메이션 설정
const DEFAULT_CONFIG: AnimationConfig = {
  enabled: true,
  reducedMotion: false,
  performance: 'high'
};

// 로컬 스토리지 키
const STORAGE_KEY = 'elderberry_animation_config';

/**
 * 애니메이션 설정 관리 클래스
 */
class AnimationManager {
  private config: AnimationConfig;

  constructor() {
    this.config = this.loadConfig();
    this.detectReducedMotion();
    this.detectPerformance();
  }

  /**
   * 설정 로드
   */
  private loadConfig(): AnimationConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  /**
   * 시스템 reduce motion 설정 감지
   */
  private detectReducedMotion(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.config.reducedMotion = mediaQuery.matches;
      
      // 변경 감지
      mediaQuery.addEventListener('change', (e) => {
        this.config.reducedMotion = e.matches;
        this.saveConfig();
      });
    }
  }

  /**
   * 성능 수준 감지 (간단한 휴리스틱)
   */
  private detectPerformance(): void {
    if (typeof navigator !== 'undefined') {
      // 하드웨어 동시성으로 성능 추정
      const cores = navigator.hardwareConcurrency || 4;
      // 메모리 정보 (Chrome)
      const memory = (navigator as any).deviceMemory || 4;
      
      if (cores >= 8 && memory >= 8) {
        this.config.performance = 'high';
      } else if (cores >= 4 && memory >= 4) {
        this.config.performance = 'medium';
      } else {
        this.config.performance = 'low';
      }
    }
  }

  /**
   * 설정 저장
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // 저장 실패 시 무시
    }
  }

  /**
   * 애니메이션 활성화 여부 확인
   */
  isEnabled(): boolean {
    return this.config.enabled && !this.config.reducedMotion;
  }

  /**
   * 복잡한 애니메이션 허용 여부
   */
  allowComplexAnimations(): boolean {
    return this.isEnabled() && this.config.performance !== 'low';
  }

  /**
   * 설정 업데이트
   */
  updateConfig(updates: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * 현재 설정 반환
   */
  getConfig(): AnimationConfig {
    return { ...this.config };
  }
}

// 싱글톤 인스턴스
export const animationManager = new AnimationManager();

/**
 * 애니메이션 조건부 적용 헬퍼
 */
export const withAnimation = <T>(enabled: T, disabled: T = {} as T): T => {
  return animationManager.isEnabled() ? enabled : disabled;
};

/**
 * 복잡한 애니메이션 조건부 적용 헬퍼
 */
export const withComplexAnimation = <T>(enabled: T, simple: T, disabled: T = {} as T): T => {
  if (!animationManager.isEnabled()) return disabled;
  return animationManager.allowComplexAnimations() ? enabled : simple;
};

/**
 * 동적 framer-motion import
 */
export const importFramerMotion = async () => {
  if (!animationManager.isEnabled()) {
    // 애니메이션이 비활성화된 경우 더미 객체 반환
    return {
      motion: {
        div: 'div',
        button: 'button',
        span: 'span',
      },
      AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
  }
  
  return import('framer-motion');
};

/**
 * 성능 기반 애니메이션 설정
 */
export const getAnimationConfig = () => {
  const config = animationManager.getConfig();
  
  return {
    // 기본 설정
    initial: animationManager.isEnabled() ? { opacity: 0 } : false,
    animate: animationManager.isEnabled() ? { opacity: 1 } : false,
    exit: animationManager.isEnabled() ? { opacity: 0 } : false,
    
    // 지속 시간 (성능에 따라 조절)
    transition: {
      duration: config.performance === 'high' ? 0.3 : 
                config.performance === 'medium' ? 0.2 : 0.1,
    },
    
    // 복잡한 애니메이션 허용 여부
    allowComplex: animationManager.allowComplexAnimations(),
  };
};