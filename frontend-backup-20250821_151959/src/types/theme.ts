/**
 * Linear Design System - 테마 타입 정의
 * LCH 색공간 기반 테마 시스템 TypeScript 인터페이스
 * 
 * @version 2025.1.0
 * @author TypeScript 전문가 (Linear Theme System)
 */

/**
 * LCH 색상 표현 타입
 * @description Lightness, Chroma, Hue, Alpha 값으로 구성된 색상 배열
 * @example [50, 75, 200, 1] // 50% 밝기, 75 채도, 200도 색상, 100% 투명도
 */
export type LCHColor = [number, number, number, number];

/**
 * 테마 대비 레벨
 * @description 접근성을 위한 다양한 대비 수준
 */
export type ThemeContrastLevel = 'low' | 'normal' | 'high' | 'maximum';

/**
 * 테마 변형 타입
 * @description 라이트/다크 테마의 기본 분류
 */
export type ThemeVariant = 'light' | 'dark' | 'auto';

/**
 * 테마 카테고리
 * @description 테마의 스타일 분류
 */
export type ThemeCategory = 'minimal' | 'vibrant' | 'pastel' | 'classic' | 'custom';

/**
 * 색상 시맨틱 의미
 * @description UI에서 사용되는 색상의 의미적 분류
 */
export interface SemanticColors {
  /** 성공 상태 색상 */
  success: LCHColor;
  /** 경고 상태 색상 */
  warning: LCHColor;
  /** 오류 상태 색상 */
  error: LCHColor;
  /** 정보 상태 색상 */
  info: LCHColor;
  /** 중립 상태 색상 */
  neutral: LCHColor;
}

/**
 * 표면 색상 시스템
 * @description 다양한 표면(배경, 패널 등)에 사용되는 색상들
 */
export interface SurfaceColors {
  /** 기본 배경 색상 */
  background: LCHColor;
  /** 전경 색상 (기본 텍스트) */
  foreground: LCHColor;
  /** 승격된 표면 (카드, 모달 등) */
  elevated: LCHColor;
  /** 입력 필드 배경 */
  input: LCHColor;
  /** 패널 배경 (사이드바 등) */
  panel: LCHColor;
  /** 모달 배경 */
  modal: LCHColor;
  /** 대화상자 배경 */
  dialog: LCHColor;
  /** 오버레이 배경 */
  overlay: LCHColor;
}

/**
 * 텍스트 색상 시스템
 * @description 텍스트 요소에 사용되는 다양한 색상 레벨
 */
export interface TextColors {
  /** 주요 텍스트 색상 */
  primary: LCHColor;
  /** 보조 텍스트 색상 */
  secondary: LCHColor;
  /** 삼차 텍스트 색상 (플레이스홀더 등) */
  tertiary: LCHColor;
  /** 강조 색상 위 텍스트 */
  onAccent: LCHColor;
  /** 역색상 텍스트 */
  inverse: LCHColor;
  /** 비활성화된 텍스트 */
  disabled: LCHColor;
}

/**
 * 테두리 색상 시스템
 * @description 경계선에 사용되는 다양한 색상 강도
 */
export interface BorderColors {
  /** 미묘한 테두리 */
  subtle: LCHColor;
  /** 기본 테두리 */
  default: LCHColor;
  /** 강한 테두리 */
  strong: LCHColor;
  /** 입력 필드 테두리 */
  input: LCHColor;
  /** 포커스 테두리 */
  focus: LCHColor;
}

/**
 * 강조 색상 변형
 * @description 강조 색상의 다양한 상태 변형
 */
export interface AccentColorVariants {
  /** 기본 강조 색상 */
  default: LCHColor;
  /** 호버 상태 */
  hover: LCHColor;
  /** 활성 상태 */
  active: LCHColor;
  /** 미묘한 버전 (배경용) */
  subtle: LCHColor;
  /** 음소거된 버전 */
  muted: LCHColor;
  /** 포커스 상태 */
  focus: LCHColor;
}

/**
 * 컨트롤 색상 시스템
 * @description 버튼, 입력 등 상호작용 요소의 색상
 */
export interface ControlColors {
  /** 기본 컨트롤 배경 */
  default: LCHColor;
  /** 호버 상태 컨트롤 */
  hover: LCHColor;
  /** 활성 상태 컨트롤 */
  active: LCHColor;
  /** 선택된 상태 컨트롤 */
  selected: LCHColor;
  /** 비활성화된 컨트롤 */
  disabled: LCHColor;
}

/**
 * 아이콘 색상 시스템
 * @description 아이콘에 사용되는 색상 체계
 */
export interface IconColors {
  /** 기본 아이콘 색상 */
  default: LCHColor;
  /** 음소거된 아이콘 */
  muted: LCHColor;
  /** 강조 아이콘 */
  accent: LCHColor;
  /** 상태별 아이콘 색상 */
  state: SemanticColors;
}

/**
 * 그림자 설정
 * @description 다양한 레벨의 그림자 효과
 */
export interface ShadowSystem {
  /** 카드 그림자 */
  card: string;
  /** 모달 그림자 */
  modal: string;
  /** 드롭다운 그림자 */
  dropdown: string;
  /** 포커스 그림자 */
  focus: string;
  /** 깊은 그림자 */
  deep: string;
}

/**
 * 타이포그래피 시스템
 * @description 폰트 및 텍스트 관련 설정
 */
export interface TypographySystem {
  /** 폰트 패밀리 */
  fontFamily: string;
  /** 폰트 가중치 */
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  /** 라인 높이 */
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  /** 폰트 크기 스케일 */
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
}

/**
 * 간격 시스템
 * @description 기하학적 간격 스케일
 */
export interface SpacingSystem {
  /** 기본 단위 (4px) */
  unit: number;
  /** 간격 값들 */
  values: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
}

/**
 * 테두리 반경 시스템
 * @description 둥근 모서리 스케일
 */
export interface BorderRadiusSystem {
  small: string;
  medium: string;
  large: string;
  full: string;
}

/**
 * 애니메이션 시스템
 * @description 전환 효과 및 애니메이션 설정
 */
export interface AnimationSystem {
  /** 전환 시간 */
  durations: {
    fast: string;
    normal: string;
    slow: string;
  };
  /** 이징 함수 */
  easings: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

/**
 * 레이아웃 시스템
 * @description 레이아웃 관련 설정
 */
export interface LayoutSystem {
  /** 사이드바 너비 */
  sidebarWidth: string;
  /** 콘텐츠 최대 너비 */
  contentMaxWidth: string;
  /** 콘텐츠 패딩 */
  contentPadding: string;
  /** Z-인덱스 스케일 */
  zIndex: {
    dropdown: number;
    modal: number;
    tooltip: number;
    toast: number;
  };
}

/**
 * 반응형 브레이크포인트
 * @description 미디어 쿼리 브레이크포인트
 */
export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  large: string;
}

/**
 * 접근성 설정
 * @description 접근성 관련 구성
 */
export interface AccessibilityConfig {
  /** 대비 비율 */
  contrastRatios: {
    aa: {
      normal: number;
      large: number;
    };
    aaa: {
      normal: number;
      large: number;
    };
  };
  /** 고대비 모드 지원 */
  highContrastSupport: boolean;
  /** 모션 감소 지원 */
  reducedMotionSupport: boolean;
  /** 포커스 표시 */
  focusIndicators: boolean;
}

/**
 * 테마 메타데이터
 * @description 테마의 부가 정보
 */
export interface ThemeMetadata {
  /** 테마 이름 */
  name: string;
  /** 테마 버전 */
  version: string;
  /** 테마 설명 */
  description?: string;
  /** 제작자 정보 */
  author?: string;
  /** 테마 카테고리 */
  category: ThemeCategory;
  /** 테마 변형 */
  variant: ThemeVariant;
  /** 생성 일자 */
  createdAt: Date;
  /** 수정 일자 */
  updatedAt: Date;
  /** 테마 태그 */
  tags?: string[];
}

/**
 * 핵심 테마 구성
 * @description Linear 테마 시스템의 핵심 LCH 값들
 */
export interface LinearThemeCore {
  /** 기본 배경 색상 (LCH) */
  base: LCHColor;
  /** 강조 색상 (LCH) */
  accent: LCHColor;
  /** 대비 레벨 (0-100) */
  contrast: number;
  /** 사이드바 전용 설정 (선택적) */
  sidebar?: {
    base: LCHColor;
    accent: LCHColor;
    contrast: number;
  };
}

/**
 * 완전한 테마 색상 팔레트
 * @description 모든 UI 요소에 대한 완전한 색상 정의
 */
export interface ThemeColorPalette {
  /** 표면 색상들 */
  surfaces: SurfaceColors;
  /** 텍스트 색상들 */
  text: TextColors;
  /** 테두리 색상들 */
  borders: BorderColors;
  /** 강조 색상 변형들 */
  accent: AccentColorVariants;
  /** 컨트롤 색상들 */
  controls: ControlColors;
  /** 아이콘 색상들 */
  icons: IconColors;
  /** 시맨틱 색상들 */
  semantic: SemanticColors;
}

/**
 * 완전한 디자인 토큰
 * @description 테마의 모든 디자인 토큰들
 */
export interface ThemeDesignTokens {
  /** 색상 팔레트 */
  colors: ThemeColorPalette;
  /** 타이포그래피 */
  typography: TypographySystem;
  /** 간격 시스템 */
  spacing: SpacingSystem;
  /** 테두리 반경 */
  borderRadius: BorderRadiusSystem;
  /** 그림자 시스템 */
  shadows: ShadowSystem;
  /** 애니메이션 */
  animation: AnimationSystem;
  /** 레이아웃 */
  layout: LayoutSystem;
  /** 반응형 브레이크포인트 */
  breakpoints: ResponsiveBreakpoints;
}

/**
 * 메인 테마 인터페이스
 * @description Linear 테마 시스템의 완전한 테마 정의
 */
export interface LinearTheme {
  /** 테마 메타데이터 */
  metadata: ThemeMetadata;
  /** 핵심 테마 구성 (LCH 기반) */
  core: LinearThemeCore;
  /** 완전한 디자인 토큰들 */
  tokens: ThemeDesignTokens;
  /** 접근성 구성 */
  accessibility: AccessibilityConfig;
}

/**
 * 테마 구성 옵션
 * @description 테마 생성 및 커스터마이징을 위한 옵션
 */
export interface ThemeConfig {
  /** 기본 테마 설정 */
  core: LinearThemeCore;
  /** 접근성 설정 */
  accessibility?: Partial<AccessibilityConfig>;
  /** 커스텀 색상 오버라이드 */
  colorOverrides?: Partial<ThemeColorPalette>;
  /** 커스텀 토큰 오버라이드 */
  tokenOverrides?: Partial<ThemeDesignTokens>;
}

/**
 * 테마 생성 결과
 * @description 테마 생성 프로세스의 결과
 */
export interface ThemeGenerationResult {
  /** 생성된 테마 */
  theme: LinearTheme;
  /** 생성 성공 여부 */
  success: boolean;
  /** 오류 메시지 (있는 경우) */
  error?: string;
  /** 경고 메시지들 */
  warnings?: string[];
  /** 접근성 검증 결과 */
  accessibilityScore?: number;
  /** 색상 대비 검증 결과 */
  contrastValidation?: {
    passed: boolean;
    issues: string[];
  };
}

/**
 * 테마 내보내기/가져오기 형식
 * @description 테마 데이터 직렬화 형식
 */
export interface ThemeExportFormat {
  /** 포맷 버전 */
  version: string;
  /** 테마 데이터 */
  theme: LinearTheme;
  /** 내보내기 타임스탬프 */
  exportedAt: string;
  /** 호환성 정보 */
  compatibility: {
    minVersion: string;
    maxVersion?: string;
  };
}

/**
 * 테마 검증 규칙
 * @description 테마 유효성 검사 규칙
 */
export interface ThemeValidationRules {
  /** 최소 대비 비율 */
  minContrastRatio: number;
  /** 필수 색상 정의 */
  requiredColors: (keyof ThemeColorPalette)[];
  /** LCH 값 범위 제한 */
  lchConstraints: {
    lightness: [number, number];
    chroma: [number, number];
    hue: [number, number];
    alpha: [number, number];
  };
  /** 색상 차이 최소값 */
  minColorDifference: number;
}

/**
 * 테마 미리보기 데이터
 * @description 테마 선택 UI를 위한 미리보기 정보
 */
export interface ThemePreview {
  /** 테마 ID */
  id: string;
  /** 테마 이름 */
  name: string;
  /** 테마 설명 */
  description: string;
  /** 미리보기 색상들 */
  previewColors: {
    background: string;
    foreground: string;
    accent: string;
    border: string;
  };
  /** 테마 카테고리 */
  category: ThemeCategory;
  /** 테마 변형 */
  variant: ThemeVariant;
  /** 인기도 점수 */
  popularity?: number;
  /** 사용자 평점 */
  rating?: number;
}

/**
 * 테마 이벤트 타입
 * @description 테마 관련 이벤트들
 */
export type ThemeEventType =
  | 'theme-changed'
  | 'theme-loaded'
  | 'theme-error'
  | 'contrast-toggled'
  | 'custom-theme-created'
  | 'custom-theme-deleted';

/**
 * 테마 이벤트 데이터
 * @description 테마 이벤트와 함께 전달되는 데이터
 */
export interface ThemeEvent {
  /** 이벤트 타입 */
  type: ThemeEventType;
  /** 이벤트 타임스탬프 */
  timestamp: Date;
  /** 테마 ID (해당하는 경우) */
  themeId?: string;
  /** 이전 테마 ID (변경 이벤트의 경우) */
  previousThemeId?: string;
  /** 추가 데이터 */
  data?: Record<string, any>;
}

/**
 * 테마 히스토리 항목
 * @description 테마 변경 히스토리 추적
 */
export interface ThemeHistoryEntry {
  /** 테마 ID */
  themeId: string;
  /** 테마 이름 */
  themeName: string;
  /** 변경 타임스탬프 */
  changedAt: Date;
  /** 변경 사유 */
  reason?: string;
  /** 사용 시간 (밀리초) */
  usageDuration?: number;
}

// 타입 가드 함수들
export const isLightTheme = (theme: LinearTheme): boolean => {
  return theme.metadata.variant === 'light' || theme.core.base[0] > 50;
};

export const isDarkTheme = (theme: LinearTheme): boolean => {
  return theme.metadata.variant === 'dark' || theme.core.base[0] <= 50;
};

export const isHighContrastTheme = (theme: LinearTheme): boolean => {
  return theme.core.contrast >= 80;
};

export const isValidLCHColor = (color: any): color is LCHColor => {
  return Array.isArray(color) && 
         color.length === 4 && 
         color.every((val: any) => typeof val === 'number') &&
         color[0] >= 0 && color[0] <= 100 && // Lightness: 0-100
         color[1] >= 0 && color[1] <= 150 && // Chroma: 0-150
         color[2] >= 0 && color[2] <= 360 && // Hue: 0-360
         color[3] >= 0 && color[3] <= 1;     // Alpha: 0-1
};

export const isValidThemeCore = (core: any): core is LinearThemeCore => {
  return typeof core === 'object' &&
         isValidLCHColor(core.base) &&
         isValidLCHColor(core.accent) &&
         typeof core.contrast === 'number' &&
         core.contrast >= 0 && core.contrast <= 100;
};

// 유틸리티 타입들
export type ThemeId = string;
export type ThemeName = string;
export type CSSCustomProperty = string;
export type CSSValue = string;

/**
 * CSS 커스텀 프로퍼티 맵
 * @description 테마를 CSS 변수로 변환한 맵
 */
export type ThemeCSSVariables = Map<CSSCustomProperty, CSSValue>;

/**
 * 테마 적용 옵션
 * @description 테마 적용 시 사용할 수 있는 옵션들
 */
export interface ThemeApplicationOptions {
  /** 애니메이션 사용 여부 */
  animated?: boolean;
  /** 애니메이션 지속시간 */
  animationDuration?: number;
  /** 즉시 적용 여부 */
  immediate?: boolean;
  /** 로컬 스토리지 저장 여부 */
  persist?: boolean;
  /** 콜백 함수 */
  onComplete?: () => void;
  /** 오류 콜백 함수 */
  onError?: (error: Error) => void;
}

/**
 * 브랜드 색상 정의
 * @description Linear의 브랜드 아이덴티티 색상
 */
export interface BrandColors {
  /** Linear 주요 브랜드 색상 */
  primary: '#5E6AD2';
  /** 브랜드 보조 색상 */
  secondary?: string;
  /** 브랜드 강조 색상 */
  accent?: string;
}

/**
 * 테마 시스템 상수
 * @description 테마 시스템에서 사용되는 상수들
 */
export const THEME_CONSTANTS = {
  /** 기본 테마 ID */
  DEFAULT_THEME_ID: 'default-light',
  /** 로컬 스토리지 키 */
  STORAGE_KEYS: {
    CURRENT_THEME: 'linear-theme',
    HIGH_CONTRAST: 'linear-high-contrast',
    CUSTOM_THEMES: 'linear-custom-themes',
    THEME_HISTORY: 'linear-theme-history',
  },
  /** CSS 클래스 이름들 */
  CSS_CLASSES: {
    LIGHT: 'theme-light',
    DARK: 'theme-dark',
    HIGH_CONTRAST: 'theme-high-contrast',
    REDUCED_MOTION: 'theme-reduced-motion',
  },
  /** 테마 버전 */
  VERSION: '2025.1.0',
  /** 지원하는 최대 커스텀 테마 수 */
  MAX_CUSTOM_THEMES: 50,
} as const;

export default LinearTheme;