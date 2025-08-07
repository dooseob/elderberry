/**
 * Linear Design System UI Components
 * 완전한 Linear 테마 시스템 통합 컴포넌트 라이브러리
 * 
 * @version 2025.1.0
 * @description 모든 UI 컴포넌트의 중앙집중식 내보내기 및 타입 정의
 * 
 * Features:
 * - 완전한 TypeScript 타입 안전성
 * - Tree-shaking 최적화
 * - 일관된 API 인터페이스
 * - 접근성 검증 도구 포함
 * - Linear 테마 시스템 완전 통합
 * - Storybook 준비된 JSDoc
 */

// === Core Components ===
export {
  Button,
  buttonVariants,
  getLoadingText,
  getIconSize,
  validateButtonAccessibility,
  type ButtonProps,
} from './Button';

export {
  Input,
  Textarea,
  inputVariants,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateNumberRange,
  validateLength,
  validateRequired,
  combineValidators,
  validateInputAccessibility,
  type InputProps,
  type TextareaProps,
} from './Input';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardLoadingOverlay,
  cardVariants,
  validateCardAccessibility,
  getOptimalCardPadding,
  getOptimalCardSurface,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
  type CardLoadingOverlayProps,
} from './Card';

// === Status & Feedback Components ===
export {
  Badge,
  badgeVariants,
  type BadgeProps,
} from './Badge';

// === Overlay Components ===
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  ConfirmModal,
  modalVariants,
  useModalContext,
  validateModalAccessibility,
  getOptimalModalSize,
  type ModalProps,
  type ModalHeaderProps,
  type ModalTitleProps,
  type ModalDescriptionProps,
  type ModalContentProps,
  type ModalFooterProps,
  type ConfirmModalProps,
} from './Modal';

export {
  Tooltip,
  InfoTooltip,
  ShortcutTooltip,
  tooltipVariants,
  validateTooltipAccessibility,
  getOptimalTooltipPosition,
  type TooltipProps,
  type InfoTooltipProps,
  type ShortcutTooltipProps,
} from './Tooltip';

// === Layout Components ===
export {
  Separator,
  SectionSeparator,
  BreadcrumbSeparator,
  TimelineSeparator,
  separatorVariants,
  validateSeparatorAccessibility,
  getOptimalSeparatorStyle,
  type SeparatorProps,
  type SectionSeparatorProps,
  type BreadcrumbSeparatorProps,
  type TimelineSeparatorProps,
} from './Separator';

// === Form Components ===
export {
  Form,
  useFormContext,
  default as FormComponent,
  type FormRootProps,
  type FormFieldProps,
  type FormGroupProps,
  type FormActionsProps,
  type FormSubmitProps,
  type FormResetProps,
} from './Form';

export {
  default as RadioGroup,
  type RadioOption,
} from './RadioGroup';

// === Progress Components ===
export { default as ProgressBar } from './ProgressBar';

// === Advanced Components ===
export { DataTable } from './DataTable';
export { 
  DashboardLayout, 
  MetricGrid, 
  StatCard, 
  QuickActionsGrid, 
  QuickAction, 
  ActivityFeed, 
  MetricIcons 
} from './Dashboard';

// === Utility Types ===
export type LinearComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type LinearComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type LinearComponentStatus = 'default' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type LinearComponentRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type LinearComponentShadow = 'none' | 'card' | 'modal' | 'dropdown';
export type LinearComponentSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// === Common Props Interface ===
export interface LinearComponentProps {
  /** 컴포넌트 크기 */
  size?: LinearComponentSize;
  /** 컴포넌트 변형 */
  variant?: LinearComponentVariant;
  /** 컴포넌트 상태 */
  status?: LinearComponentStatus;
  /** 애니메이션 활성화 */
  animation?: boolean;
  /** 접근성 라벨 */
  'aria-label'?: string;
  /** 접근성 설명 */
  'aria-describedby'?: string;
}

// === Theme Integration ===
export interface LinearThemeIntegration {
  /** Linear 테마 CSS 변수 사용 */
  useLinearVariables: boolean;
  /** 다크 모드 지원 */
  supportsDarkMode: boolean;
  /** 고대비 모드 지원 */
  supportsHighContrast: boolean;  
  /** 애니메이션 감소 지원 */
  supportsReducedMotion: boolean;
}

// === Accessibility Validation ===
export interface AccessibilityReport {
  /** 컴포넌트 이름 */
  component: string;
  /** 경고 메시지 목록 */
  warnings: string[];
  /** 에러 메시지 목록 */
  errors: string[];
  /** 접근성 점수 (0-100) */
  score: number;
  /** 권장사항 */
  recommendations: string[];
}

/**
 * 모든 컴포넌트 접근성 검증
 * 전체 UI 라이브러리의 접근성을 체크합니다.
 */
export const validateAllComponentsAccessibility = (
  components: Record<string, any>
): AccessibilityReport[] => {
  const reports: AccessibilityReport[] = [];
  
  Object.entries(components).forEach(([name, props]) => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const recommendations: string[] = [];
    
    // 공통 접근성 검증
    if (!props['aria-label'] && !props.children && !props.title) {
      warnings.push('컴포넌트에 접근 가능한 이름이 필요합니다.');
    }
    
    if (props.disabled && !props.disabledReason && !props['aria-describedby']) {
      recommendations.push('비활성화된 컴포넌트에는 이유를 설명하는 것이 좋습니다.');
    }
    
    if (props.onClick && !props.role && !['button', 'link'].includes(props.type)) {
      warnings.push('클릭 가능한 요소에는 적절한 역할이 필요합니다.');
    }
    
    // 컴포넌트별 특화 검증
    let componentWarnings: string[] = [];
    
    try {
      switch (name) {
        case 'Button':
          componentWarnings = validateButtonAccessibility(props);
          break;
        case 'Input':
        case 'Textarea':
          componentWarnings = validateInputAccessibility(props);
          break;
        case 'Card':
          componentWarnings = validateCardAccessibility(props);
          break;
        case 'Badge':
          componentWarnings = validateBadgeAccessibility(props);
          break;
        case 'Modal':
          componentWarnings = validateModalAccessibility(props);
          break;
        case 'Tooltip':
          componentWarnings = validateTooltipAccessibility(props);
          break;
        case 'Separator':
          componentWarnings = validateSeparatorAccessibility(props);
          break;
      }
    } catch (error) {
      errors.push(`컴포넌트 검증 중 오류 발생: ${error}`);
    }
    
    warnings.push(...componentWarnings);
    
    // 접근성 점수 계산
    const totalIssues = warnings.length + errors.length * 2;
    const score = Math.max(0, 100 - totalIssues * 10);
    
    // 권장사항 추가
    if (score < 80) {
      recommendations.push('접근성 개선이 필요합니다.');
    }
    
    if (warnings.length > 0) {
      recommendations.push('경고사항을 해결하여 접근성을 향상시키세요.');
    }
    
    reports.push({
      component: name,
      warnings,
      errors,
      score,
      recommendations,
    });
  });
  
  return reports;
};

/**
 * Linear 디자인 시스템 호환성 검증
 * 컴포넌트가 Linear 테마 시스템을 올바르게 사용하는지 확인합니다.
 */
export const validateLinearThemeCompliance = (
  componentName: string,
  props: any
): { compliant: boolean; issues: string[]; suggestions: string[] } => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Linear CSS 변수 사용 확인
  const requiredVariables = [
    '--linear-color-',
    '--linear-spacing-',
    '--linear-radius-',
    '--linear-shadow-',
    '--linear-transition-',
  ];
  
  // 커스텀 스타일링 검사
  if (props.style) {
    const styleString = JSON.stringify(props.style);
    if (styleString.includes('rgb(') || styleString.includes('#')) {
      issues.push('하드코딩된 색상값 대신 Linear CSS 변수를 사용하세요.');
    }
    
    if (styleString.includes('px') && !styleString.includes('var(--linear-')) {
      suggestions.push('픽셀값 대신 Linear 스페이싱 변수를 사용하는 것을 고려하세요.');
    }
  }
  
  // className 검사
  if (props.className) {
    if (props.className.includes('bg-blue-') || props.className.includes('text-red-')) {
      issues.push('Tailwind 색상 클래스 대신 Linear 색상 변수를 사용하세요.');
    }
  }
  
  // 테마 관련 prop 검사
  if (props.customColor && !props.customColor.startsWith('var(--linear-')) {
    suggestions.push('커스텀 색상도 Linear 변수를 사용하는 것이 좋습니다.');
  }
  
  const compliant = issues.length === 0;
  
  return { compliant, issues, suggestions };
};

/**
 * 컴포넌트 성능 최적화 제안
 * 컴포넌트 사용 패턴을 분석하여 성능 개선사항을 제안합니다.
 */
export const getPerformanceRecommendations = (
  componentUsage: Record<string, number>
): string[] => {
  const recommendations: string[] = [];
  
  // 자주 사용되는 컴포넌트
  const highUsageComponents = Object.entries(componentUsage)
    .filter(([, count]) => count > 10)
    .map(([name]) => name);
  
  if (highUsageComponents.length > 0) {
    recommendations.push(
      `자주 사용되는 컴포넌트 (${highUsageComponents.join(', ')})는 React.memo로 최적화를 고려하세요.`
    );
  }
  
  // Modal 사용량 체크
  if (componentUsage.Modal > 3) {
    recommendations.push('여러 모달 사용 시 모달 매니저 패턴을 고려하세요.');
  }
  
  // Tooltip 사용량 체크
  if (componentUsage.Tooltip > 5) {
    recommendations.push('많은 툴팁 사용 시 지연 로딩을 고려하세요.');
  }
  
  return recommendations;
};

// === Component Library Metadata ===
export const LINEAR_UI_LIBRARY = {
  name: 'Linear Design System UI Components',
  version: '2025.1.0',
  components: [
    'Button', 'Input', 'Textarea', 'Card', 'Badge', 'Modal', 'Tooltip', 'Separator'
  ],
  features: [
    'Linear 테마 시스템 완전 통합',
    'TypeScript 완전 지원',
    'Framer Motion 애니메이션',
    'Class Variance Authority 스타일링',
    '완전한 접근성 지원',
    'React forwardRef 지원',
    'Portal 기반 오버레이',
    'Storybook 준비',
  ],
  accessibility: {
    wcagLevel: 'AA',
    screenReaderSupport: true,
    keyboardNavigation: true,
    highContrastSupport: true,
    reducedMotionSupport: true,
  },
  browser: {
    chrome: '90+',
    firefox: '88+',
    safari: '14+',
    edge: '90+',
  },
} as const;

// === Development Utilities ===
if (process.env.NODE_ENV === 'development') {
  // 개발 모드에서만 사용할 수 있는 유틸리티들
  (window as any).__LINEAR_UI_DEBUG__ = {
    validateAllComponentsAccessibility,
    validateLinearThemeCompliance,
    getPerformanceRecommendations,
    LINEAR_UI_LIBRARY,
  };
}

/**
 * JSDoc 사용 예시 (전체 라이브러리)
 * 
 * @example
 * // 기본 사용법
 * import { Button, Input, Card } from '@/components/ui';
 * 
 * // 특화 컴포넌트 사용
 * import { 
 *   NotificationBadge, 
 *   ConfirmModal, 
 *   InfoTooltip 
 * } from '@/components/ui';
 * 
 * // 검증 도구 사용
 * import { 
 *   validateButtonAccessibility,
 *   validateLinearThemeCompliance 
 * } from '@/components/ui';
 * 
 * // 타입 안전한 컴포넌트 사용
 * const MyComponent: React.FC = () => {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>제목</CardTitle>
 *         <CardDescription>설명</CardDescription>
 *       </CardHeader>
 *       <CardContent>
 *         <Input 
 *           label="이메일"
 *           type="email"
 *           validate={validateEmail}
 *         />
 *         <Button variant="primary" size="lg">
 *           제출
 *         </Button>
 *       </CardContent>
 *     </Card>
 *   );
 * };
 * 
 * // 접근성 검증
 * const accessibilityReport = validateAllComponentsAccessibility({
 *   Button: { children: '클릭', onClick: () => {} },
 *   Input: { label: '이름', type: 'text' },
 * });
 * 
 * // Linear 테마 호환성 검증
 * const compliance = validateLinearThemeCompliance('Button', {
 *   customColor: 'var(--linear-color-accent)',
 *   className: 'bg-[var(--linear-color-surface-elevated)]'
 * });
 */