/**
 * Linear Design System Button Component
 * 완전한 Linear 테마 시스템 통합 버튼 컴포넌트
 * 
 * @version 2025.1.0
 * @author React 컴포넌트 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 테마 CSS 클래스 완전 적용
 * - Primary, Secondary, Ghost, Outline 등 variant 지원
 * - 크기별 size prop (small, medium, large, icon)
 * - 로딩 상태, 비활성화 상태
 * - 완전한 접근성 지원 (ARIA 속성, 키보드 네비게이션)
 * - useLinearTheme 훅 활용
 * - Forwardref 지원
 * - TypeScript 완전 타입 정의
 * - 애니메이션 및 인터랙션 효과
 * - 아이콘 지원 (좌/우 위치)
 * - 전체 너비 옵션
 */
import * as React from "react"
import { memo, forwardRef } from 'react'
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from "../../lib/utils"
import { useLinearTheme } from '../../hooks/useLinearTheme';

// Linear Button Variants (Class Variance Authority 기반)
const buttonVariants = cva(
  // 기본 클래스 - Linear 디자인 시스템 준수
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "font-[var(--linear-font-weight-medium)] text-sm",
    "transition-all duration-[var(--linear-transition-fast)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--linear-color-accent)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "min-h-[44px] min-w-[44px]", // 접근성을 위한 최소 터치 영역
    "select-none cursor-pointer",
    "relative overflow-hidden", // 애니메이션을 위한 설정
  ],
  {
    variants: {
      variant: {
        // Primary - Linear 브랜드 컬러
        primary: [
          "bg-[var(--linear-color-accent)] text-[var(--linear-color-text-on-accent)]",
          "border-[var(--linear-color-accent)] border",
          "hover:bg-[var(--linear-color-accent-hover)] hover:border-[var(--linear-color-accent-hover)]",
          "active:bg-[var(--linear-color-accent-active)] active:border-[var(--linear-color-accent-active)]",
          "hover:shadow-[var(--linear-shadow-card)] hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-none",
        ],
        
        // Secondary - 윤곽선 스타일
        secondary: [
          "bg-transparent text-[var(--linear-color-accent)]",
          "border border-[var(--linear-color-accent)]",
          "hover:bg-[var(--linear-color-accent)] hover:text-[var(--linear-color-text-on-accent)]",
          "hover:shadow-[var(--linear-shadow-card)] hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-none",
        ],
        
        // Ghost - 미묘한 스타일
        ghost: [
          "bg-transparent text-[var(--linear-color-text-primary)] border-transparent",
          "hover:bg-[var(--linear-color-surface-elevated)] hover:text-[var(--linear-color-text-primary)]",
          "active:bg-[var(--linear-color-control-active)]",
        ],
        
        // Outline - 기본 윤곽선
        outline: [
          "bg-transparent text-[var(--linear-color-text-primary)]",
          "border border-[var(--linear-color-border-default)]",
          "hover:bg-[var(--linear-color-surface-elevated)] hover:border-[var(--linear-color-border-strong)]",
          "active:bg-[var(--linear-color-control-active)]",
        ],
        
        // Link - 링크 스타일
        link: [
          "bg-transparent text-[var(--linear-color-accent)] border-transparent",
          "hover:text-[var(--linear-color-accent-hover)] hover:underline",
          "underline-offset-4 p-0 h-auto min-h-0 min-w-0",
        ],
        
        // Destructive - 위험한 작업
        destructive: [
          "bg-[var(--linear-color-error)] text-[var(--linear-color-text-on-accent)]",
          "border border-[var(--linear-color-error)]",
          "hover:brightness-110 hover:shadow-[var(--linear-shadow-card)] hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-none active:brightness-95",
        ],
        
        // Success - 성공/확인 작업
        success: [
          "bg-[var(--linear-color-success)] text-[var(--linear-color-text-on-accent)]",
          "border border-[var(--linear-color-success)]",
          "hover:brightness-110 hover:shadow-[var(--linear-shadow-card)] hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-none active:brightness-95",
        ],
        
        // Warning - 주의 작업
        warning: [
          "bg-[var(--linear-color-warning)] text-[var(--linear-color-text-on-accent)]",
          "border border-[var(--linear-color-warning)]",
          "hover:brightness-110 hover:shadow-[var(--linear-shadow-card)] hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-none active:brightness-95",
        ],
        
        // Gradient - 특별한 강조
        gradient: [
          "bg-gradient-to-r from-[var(--linear-color-accent)] to-[var(--linear-color-accent-hover)]",
          "text-[var(--linear-color-text-on-accent)] border-transparent",
          "hover:shadow-[var(--linear-shadow-card)] hover:-translate-y-0.5 hover:brightness-110",
          "active:translate-y-0 active:shadow-none active:brightness-95",
        ],
      },
      
      size: {
        sm: "text-sm px-[var(--linear-spacing-sm)] py-[var(--linear-spacing-xs)] min-h-[36px] gap-1",
        default: "text-sm px-[var(--linear-spacing-lg)] py-[var(--linear-spacing-sm)] min-h-[44px] gap-2",
        lg: "text-base px-[var(--linear-spacing-xl)] py-[var(--linear-spacing-md)] min-h-[52px] gap-2",
        xl: "text-lg px-[var(--linear-spacing-2xl)] py-[var(--linear-spacing-lg)] min-h-[60px] gap-3",
        icon: "w-[44px] h-[44px] p-0",
        "icon-sm": "w-[36px] h-[36px] p-0",
        "icon-lg": "w-[52px] h-[52px] p-0",
      },
      
      radius: {
        none: "rounded-none",
        sm: "rounded-[var(--linear-radius-small)]",
        md: "rounded-[var(--linear-radius-medium)]",
        lg: "rounded-[var(--linear-radius-large)]",
        full: "rounded-[var(--linear-radius-full)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      radius: "md",
    },
  }
)

/**
 * Linear Button Props
 * 완전한 TypeScript 타입 정의
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 로딩 상태 - 로딩 중일 때 스피너 표시 및 버튼 비활성화 */
  loading?: boolean;
  
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  
  /** 버튼에 표시할 아이콘 */
  icon?: React.ReactNode;
  
  /** 아이콘 위치 */
  iconPosition?: 'left' | 'right';
  
  /** 애니메이션 활성화 여부 */
  animation?: boolean;
  
  /** 로딩 스피너 커스터마이징 */
  loadingSpinner?: React.ReactNode;
  
  /** 버튼이 비활성화된 이유에 대한 설명 */
  disabledReason?: string;
  
  /** 접근성: 스크린 리더를 위한 라벨 */
  'aria-label'?: string;
  
  /** 접근성: 버튼을 설명하는 요소의 ID */
  'aria-describedby'?: string;
  
  /** 접근성: 확장된 상태 (드롭다운 등) */
  'aria-expanded'?: boolean;
  
  /** 접근성: 제어하는 요소의 ID */
  'aria-controls'?: string;
  
  /** 자식 요소를 버튼으로 렌더링 (asChild pattern) */
  asChild?: boolean;
  
  /** 테스트를 위한 data-testid 속성 */
  testId?: string;
}

/**
 * Linear Button Component
 * React.forwardRef 및 완전한 접근성 지원
 */
const Button = memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    radius,
    loading = false, 
    fullWidth = false, 
    icon,
    iconPosition = 'left',
    animation = true,
    loadingSpinner,
    disabledReason,
    asChild = false,
    testId,
    children, 
    disabled, 
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
    ...props 
  }, ref) => {
    // Linear 테마 훅 사용
    const { isReducedMotion } = useLinearTheme();
    
    // 상태 계산
    const isDisabled = disabled || loading;
    const shouldAnimate = animation && !isReducedMotion && !isDisabled;
    const widthClass = fullWidth ? 'w-full' : '';
    
    // 접근성을 위한 ARIA 속성 계산
    const computedAriaLabel = React.useMemo(() => {
      if (ariaLabel) return ariaLabel;
      if (loading) return '로딩 중...';
      if (isDisabled && disabledReason) return `버튼 비활성화됨: ${disabledReason}`;
      return undefined;
    }, [ariaLabel, loading, isDisabled, disabledReason]);
    
    // 접근성을 위한 describedBy 계산
    const computedAriaDescribedBy = React.useMemo(() => {
      const ids = [ariaDescribedBy, disabledReason && isDisabled ? 'button-disabled-reason' : null]
        .filter(Boolean);
      return ids.length > 0 ? ids.join(' ') : undefined;
    }, [ariaDescribedBy, disabledReason, isDisabled]);
    
    // 로딩 스피너 렌더링
    const renderLoadingSpinner = () => {
      if (loadingSpinner) return loadingSpinner;
      return (
        <Loader2 
          className={cn(
            "animate-spin",
            size === 'sm' ? "w-3 h-3" : size === 'lg' ? "w-5 h-5" : "w-4 h-4"
          )}
          aria-hidden="true" 
        />
      );
    };
    
    // 아이콘 렌더링
    const renderIcon = () => {
      if (loading) return renderLoadingSpinner();
      if (!icon) return null;
      
      // 아이콘 크기 자동 조정
      if (React.isValidElement(icon)) {
        const iconSize = size === 'sm' ? "w-3 h-3" : size === 'lg' ? "w-5 h-5" : "w-4 h-4";
        return React.cloneElement(icon as React.ReactElement, {
          className: cn(iconSize, (icon as React.ReactElement).props?.className),
          'aria-hidden': 'true',
        });
      }
      
      return icon;
    };
    
    // 콘텐츠 렌더링
    const renderContent = () => {
      const iconElement = renderIcon();
      
      if (!iconElement && !loading) return children;
      
      // 아이콘만 있는 경우 (텍스트 없음)
      if (!children) return iconElement;
      
      // 아이콘과 텍스트가 모두 있는 경우
      if (iconPosition === 'right') {
        return (
          <>
            <span className="flex-1">{children}</span>
            {iconElement}
          </>
        );
      }
      
      return (
        <>
          {iconElement}
          <span className="flex-1">{children}</span>
        </>
      );
    };
    
    // 키보드 이벤트 핸들링
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      
      // Enter 또는 Space 키로 버튼 활성화
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onClick?.(event as any);
      }
      
      onKeyDown?.(event);
    };
    
    // 클릭 이벤트 핸들링
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };
    
    // 애니메이션 설정
    const motionProps = shouldAnimate ? {
      whileHover: variant !== 'link' ? { 
        y: -1,
        transition: { duration: 0.15, ease: "easeOut" }
      } : undefined,
      whileTap: variant !== 'link' ? { 
        scale: 0.98,
        y: 0,
        transition: { duration: 0.1, ease: "easeOut" }
      } : undefined,
    } : {};
    
    // asChild 패턴 처리
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(
          buttonVariants({ variant, size, radius }),
          widthClass,
          'linear-animate-in',
          className,
          children.props.className
        ),
        disabled: isDisabled,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        'aria-label': computedAriaLabel,
        'aria-describedby': computedAriaDescribedBy,
        'aria-expanded': ariaExpanded,
        'aria-controls': ariaControls,
        'aria-busy': loading,
        'aria-disabled': isDisabled,
        'data-testid': testId,
        tabIndex: isDisabled ? -1 : 0,
        ...children.props,
        ...props,
      });
    }
    
    // 컴포넌트 선택 (애니메이션 여부에 따라)
    const ButtonComponent = shouldAnimate ? motion.button : 'button';
    
    return (
      <>
        <ButtonComponent
          ref={ref}
          type="button"
          className={cn(
            buttonVariants({ variant, size, radius }),
            widthClass,
            'linear-animate-in',
            className
          )}
          disabled={isDisabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={computedAriaLabel}
          aria-describedby={computedAriaDescribedBy}
          aria-expanded={ariaExpanded}
          aria-controls={ariaControls}
          aria-busy={loading}
          aria-disabled={isDisabled}
          tabIndex={isDisabled ? -1 : 0}
          data-testid={testId}
          {...(shouldAnimate ? motionProps : {})}
          {...props}
        >
          {renderContent()}
        </ButtonComponent>
        
        {/* 스크린 리더를 위한 숨겨진 설명 */}
        {disabledReason && isDisabled && (
          <span 
            id="button-disabled-reason" 
            className="sr-only"
            aria-live="polite"
          >
            {disabledReason}
          </span>
        )}
      </>
    );
  }
));

Button.displayName = "LinearButton";

// === 유틸리티 함수들 ===

/**
 * 버튼 variant에 따른 적절한 로딩 텍스트 반환
 */
export const getLoadingText = (variant?: ButtonProps['variant']) => {
  switch (variant) {
    case 'destructive':
      return '삭제 중...';
    case 'success':
      return '저장 중...';
    case 'warning':
      return '처리 중...';
    default:
      return '로딩 중...';
  }
};

/**
 * 버튼 크기에 따른 적절한 아이콘 크기 반환
 */
export const getIconSize = (size?: ButtonProps['size']) => {
  switch (size) {
    case 'sm':
      return 'w-3 h-3';
    case 'lg':
    case 'xl':
      return 'w-5 h-5';
    default:
      return 'w-4 h-4';
  }
};

/**
 * 접근성을 위한 버튼 역할 검증
 */
export const validateButtonAccessibility = (props: ButtonProps) => {
  const warnings: string[] = [];
  
  if (!props.children && !props['aria-label']) {
    warnings.push('버튼에 텍스트나 aria-label이 필요합니다.');
  }
  
  if (props.disabled && !props.disabledReason) {
    warnings.push('비활성화된 버튼에는 disabledReason을 제공하는 것이 좋습니다.');
  }
  
  if (props.loading && !props['aria-label']) {
    warnings.push('로딩 상태의 버튼에는 적절한 aria-label을 제공하는 것이 좋습니다.');
  }
  
  return warnings;
};

// === 내보내기 ===
export { Button, buttonVariants };
export type { ButtonProps };
export default Button;

// === JSDoc 사용 예시 (Storybook 준비) ===
/**
 * @example
 * // 기본 사용법
 * <Button>클릭하세요</Button>
 * 
 * // 로딩 상태
 * <Button loading>저장 중...</Button>
 * 
 * // 아이콘과 함께
 * <Button icon={<Save />}>저장</Button>
 * 
 * // 커스텀 스타일
 * <Button variant="destructive" size="lg">삭제</Button>
 * 
 * // 완전한 접근성
 * <Button 
 *   disabled 
 *   disabledReason="필수 필드를 입력해주세요"
 *   aria-describedby="form-errors"
 * >
 *   제출
 * </Button>
 */