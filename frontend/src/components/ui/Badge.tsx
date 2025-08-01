/**
 * Linear Design System Badge Component
 * 완전한 Linear 테마 시스템 통합 배지 컴포넌트
 * 
 * @version 2025.1.0
 * @author UI/UX 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 테마 CSS 클래스 완전 적용
 * - 다양한 상태 표시 (success, error, warning, info)
 * - 크기별 size prop (sm, md, lg)
 * - 모양별 variant prop (default, outline, ghost, solid)
 * - 아이콘 지원 (좌/우 위치)
 * - 완전한 접근성 지원 (ARIA 속성)
 * - useLinearTheme 훅 활용
 * - Forwardref 지원
 * - TypeScript 완전 타입 정의
 * - 애니메이션 및 인터랙션 효과
 * - 숫자 배지 (카운트) 지원
 * - 점 배지 (dot) 지원
 * - 커스텀 색상 지원
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from 'lucide-react';
import { cn } from "../../lib/utils";
import { useLinearTheme } from '../../hooks/useLinearTheme';

// Linear Badge Variants (Class Variance Authority 기반)
const badgeVariants = cva(
  // 기본 클래스 - Linear 디자인 시스템 준수
  [
    "inline-flex items-center justify-center font-[var(--linear-font-weight-medium)]",
    "transition-all duration-[var(--linear-transition-fast)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        // 기본 스타일
        default: [
          "bg-[var(--linear-color-accent-subtle)] text-[var(--linear-color-accent)]",
          "border border-[var(--linear-color-accent-muted)]",
        ],
        
        // 솔리드 스타일
        solid: [
          "bg-[var(--linear-color-accent)] text-[var(--linear-color-text-on-accent)]",
          "border border-[var(--linear-color-accent)]",
        ],
        
        // 아웃라인 스타일
        outline: [
          "bg-transparent text-[var(--linear-color-accent)]",
          "border border-[var(--linear-color-accent)]",
        ],
        
        // 고스트 스타일
        ghost: [
          "bg-[var(--linear-color-accent-subtle)] text-[var(--linear-color-accent)]",
          "border border-transparent",
        ],
        
        // 그라디언트 스타일
        gradient: [
          "bg-gradient-to-r from-[var(--linear-color-accent)] to-[var(--linear-color-accent-hover)]",
          "text-[var(--linear-color-text-on-accent)] border-transparent",
        ],
      },
      
      status: {
        // 기본 (accent 색상 사용)
        default: "",
        
        // 성공 상태
        success: [
          "text-[var(--linear-color-success)]",
          "[&.badge-default]:bg-[var(--linear-color-success-bg)] [&.badge-default]:border-[var(--linear-color-success)]",
          "[&.badge-solid]:bg-[var(--linear-color-success)] [&.badge-solid]:border-[var(--linear-color-success)]",
          "[&.badge-outline]:border-[var(--linear-color-success)]",
          "[&.badge-ghost]:bg-[var(--linear-color-success-bg)]",
        ],
        
        // 에러 상태
        error: [
          "text-[var(--linear-color-error)]",
          "[&.badge-default]:bg-[var(--linear-color-error-bg)] [&.badge-default]:border-[var(--linear-color-error)]",
          "[&.badge-solid]:bg-[var(--linear-color-error)] [&.badge-solid]:border-[var(--linear-color-error)]",
          "[&.badge-outline]:border-[var(--linear-color-error)]",
          "[&.badge-ghost]:bg-[var(--linear-color-error-bg)]",
        ],
        
        // 경고 상태
        warning: [
          "text-[var(--linear-color-warning)]",
          "[&.badge-default]:bg-[var(--linear-color-warning-bg)] [&.badge-default]:border-[var(--linear-color-warning)]",
          "[&.badge-solid]:bg-[var(--linear-color-warning)] [&.badge-solid]:border-[var(--linear-color-warning)]",
          "[&.badge-outline]:border-[var(--linear-color-warning)]",
          "[&.badge-ghost]:bg-[var(--linear-color-warning-bg)]",
        ],
        
        // 정보 상태
        info: [
          "text-[var(--linear-color-info)]",
          "[&.badge-default]:bg-[var(--linear-color-info-bg)] [&.badge-default]:border-[var(--linear-color-info)]",
          "[&.badge-solid]:bg-[var(--linear-color-info)] [&.badge-solid]:border-[var(--linear-color-info)]",
          "[&.badge-outline]:border-[var(--linear-color-info)]",
          "[&.badge-ghost]:bg-[var(--linear-color-info-bg)]",
        ],
        
        // 중성 상태 (회색)
        neutral: [
          "text-[var(--linear-color-text-secondary)]",
          "[&.badge-default]:bg-[var(--linear-color-surface-panel)] [&.badge-default]:border-[var(--linear-color-border-default)]",
          "[&.badge-solid]:bg-[var(--linear-color-text-secondary)] [&.badge-solid]:text-[var(--linear-color-text-on-accent)]",
          "[&.badge-outline]:border-[var(--linear-color-border-default)]",
          "[&.badge-ghost]:bg-[var(--linear-color-surface-panel)]",
        ],
      },
      
      size: {
        sm: "text-xs px-[var(--linear-spacing-xs)] py-[calc(var(--linear-spacing-xs)/2)] h-5 gap-1",
        md: "text-sm px-[var(--linear-spacing-sm)] py-[var(--linear-spacing-xs)] h-6 gap-1",
        lg: "text-sm px-[var(--linear-spacing-md)] py-[var(--linear-spacing-sm)] h-8 gap-2",
      },
      
      shape: {
        // 둥근 모서리
        rounded: "rounded-[var(--linear-radius-full)]",
        // 사각형
        square: "rounded-[var(--linear-radius-small)]",
        // 원형 (주로 점 배지나 숫자 배지에 사용)
        circle: "rounded-full aspect-square",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "default",
      size: "md",
      shape: "rounded",
    },
  }
);

/**
 * Linear Badge Props
 * 완전한 TypeScript 타입 정의
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** 배지 내용 */
  children?: React.ReactNode;
  
  /** 시작 아이콘 */
  startIcon?: React.ReactNode;
  
  /** 끝 아이콘 */
  endIcon?: React.ReactNode;
  
  /** 점 배지 모드 */
  dot?: boolean;
  
  /** 숫자 배지 (카운트) */
  count?: number;
  
  /** 최대 표시 숫자 */
  maxCount?: number;
  
  /** 삭제 가능한 배지 */
  closeable?: boolean;
  
  /** 삭제 이벤트 핸들러 */
  onClose?: () => void;
  
  /** 클릭 가능한 배지 */
  clickable?: boolean;
  
  /** 애니메이션 활성화 */
  animation?: boolean;
  
  /** 펄스 애니메이션 (알림용) */
  pulse?: boolean;
  
  /** 배지가 빈 내용일 때 숨기기 */
  hideWhenEmpty?: boolean;
  
  /** 커스텀 색상 (CSS 변수 또는 hex) */
  customColor?: string;
  
  /** 접근성: 배지 라벨 */
  'aria-label'?: string;
  
  /** 접근성: 배지 설명 */
  'aria-describedby'?: string;
  
  /** 접근성: 라이브 영역 */
  'aria-live'?: 'off' | 'polite' | 'assertive';
}

/**
 * Linear Badge Component
 * React.forwardRef 및 완전한 접근성 지원
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant,
    status,
    size,
    shape,
    children,
    startIcon,
    endIcon,
    dot = false,
    count,
    maxCount = 99,
    closeable = false,
    onClose,
    clickable = false,
    animation = true,
    pulse = false,
    hideWhenEmpty = true,
    customColor,
    onClick,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-live': ariaLive,
    ...props
  }, ref) => {
    // Linear 테마 훅 사용
    const { isReducedMotion } = useLinearTheme();
    
    // 상태 계산
    const shouldAnimate = animation && !isReducedMotion;
    const isInteractive = clickable || Boolean(onClick);
    
    // 숫자 표시 로직
    const displayCount = React.useMemo(() => {
      if (count === undefined) return undefined;
      if (count <= 0 && hideWhenEmpty) return undefined;
      if (count > maxCount) return `${maxCount}+`;
      return count.toString();
    }, [count, maxCount, hideWhenEmpty]);
    
    // 점 배지이거나 빈 내용일 때 숨기기
    const shouldHide = React.useMemo(() => {
      if (dot) return false;
      if (displayCount !== undefined) return false;
      if (children) return false;
      return hideWhenEmpty;
    }, [dot, displayCount, children, hideWhenEmpty]);
    
    // 배지 내용 렌더링
    const renderContent = () => {
      if (dot) return null;
      if (displayCount !== undefined) return displayCount;
      return children;
    };
    
    // 아이콘 크기 계산
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';
    
    // 시작 아이콘 렌더링
    const renderStartIcon = () => {
      if (!startIcon) return null;
      
      if (React.isValidElement(startIcon)) {
        return React.cloneElement(startIcon as React.ReactElement, {
          className: cn(iconSize, (startIcon as React.ReactElement).props?.className),
          'aria-hidden': 'true',
        });
      }
      
      return startIcon;
    };
    
    // 끝 아이콘 렌더링
    const renderEndIcon = () => {
      const icons = [];
      
      // 커스텀 끝 아이콘
      if (endIcon && !closeable) {
        if (React.isValidElement(endIcon)) {
          icons.push(
            React.cloneElement(endIcon as React.ReactElement, {
              key: 'end-icon',
              className: cn(iconSize, (endIcon as React.ReactElement).props?.className),
              'aria-hidden': 'true',
            })
          );
        } else {
          icons.push(<span key="end-icon">{endIcon}</span>);
        }
      }
      
      // 삭제 버튼
      if (closeable) {
        icons.push(
          <button
            key="close"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
            aria-label="배지 제거"
            tabIndex={-1}
          >
            <X className={iconSize} />
          </button>
        );
      }
      
      return icons.length > 0 ? icons : null;
    };
    
    // 커스텀 색상 스타일
    const customStyles = React.useMemo(() => {
      if (!customColor) return undefined;
      
      const isHex = customColor.startsWith('#');
      const colorValue = isHex ? customColor : `var(${customColor})`;
      
      switch (variant) {
        case 'solid':
          return { backgroundColor: colorValue, borderColor: colorValue, color: 'white' };
        case 'outline':
          return { borderColor: colorValue, color: colorValue };
        case 'ghost':
          return { backgroundColor: `${colorValue}20`, color: colorValue };
        default:
          return { backgroundColor: `${colorValue}20`, borderColor: colorValue, color: colorValue };
      }
    }, [customColor, variant]);
    
    // 키보드 이벤트 핸들링
    const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as any);
      }
    };
    
    // 조건부 렌더링 - 숨김 처리
    if (shouldHide) return null;
    
    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant, status, size, shape }),
          // variant 클래스 추가 (상태별 스타일링을 위해)
          `badge-${variant}`,
          // 인터랙티브 스타일
          isInteractive && [
            "cursor-pointer",
            "hover:scale-105 active:scale-95",
            "focus-visible:ring-[var(--linear-color-accent)]",
          ],
          // 애니메이션
          shouldAnimate && "linear-animate-in",
          // 펄스 애니메이션
          pulse && shouldAnimate && "animate-pulse",
          className
        )}
        style={customStyles}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : 'status'}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-live={ariaLive}
        {...props}
      >
        {renderStartIcon()}
        {renderContent()}
        {renderEndIcon()}
      </span>
    );
  }
);

Badge.displayName = "LinearBadge";

// === 유틸리티 함수들 ===

/**
 * 숫자에 따른 최적 배지 크기 반환
 */
export const getOptimalBadgeSize = (count?: number): BadgeProps['size'] => {
  if (!count) return 'md';
  if (count < 10) return 'sm';
  if (count < 100) return 'md';
  return 'lg';
};

/**
 * 상태에 따른 최적 배지 스타일 반환
 */
export const getBadgeStyleForStatus = (
  status: BadgeProps['status'],
  emphasis: 'subtle' | 'medium' | 'strong' = 'medium'
): { variant: BadgeProps['variant']; status: BadgeProps['status'] } => {
  const variantMap = {
    subtle: 'ghost',
    medium: 'default',
    strong: 'solid',
  } as const;
  
  return {
    variant: variantMap[emphasis],
    status: status || 'default',
  };
};

/**
 * 배지 접근성 검증
 */
export const validateBadgeAccessibility = (props: BadgeProps) => {
  const warnings: string[] = [];
  
  if (props.clickable && !props['aria-label'] && !props.children) {
    warnings.push('클릭 가능한 배지에는 aria-label 또는 내용이 필요합니다.');
  }
  
  if (props.count !== undefined && !props['aria-label']) {
    warnings.push('숫자 배지에는 의미를 설명하는 aria-label을 제공하는 것이 좋습니다.');
  }
  
  if (props.dot && !props['aria-label']) {
    warnings.push('점 배지에는 상태를 설명하는 aria-label이 필요합니다.');
  }
  
  return warnings;
};

// === 특수 배지 컴포넌트들 ===

/**
 * Notification Badge Props
 */
export interface NotificationBadgeProps extends Omit<BadgeProps, 'count' | 'dot'> {
  /** 알림 개수 */
  count: number;
  /** 최대 표시 개수 */
  maxCount?: number;
  /** 0일 때 표시 여부 */
  showZero?: boolean;
}

/**
 * Notification Badge Component
 * 알림용 특화 배지
 */
export const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ count, maxCount = 99, showZero = false, ...props }, ref) => {
    const shouldShow = count > 0 || showZero;
    
    if (!shouldShow) return null;
    
    return (
      <Badge
        ref={ref}
        count={count}
        maxCount={maxCount}
        variant="solid"
        status="error"
        size="sm"
        shape="circle"
        pulse={count > 0}
        aria-live="polite"
        aria-label={`${count}개의 새 알림`}
        {...props}
      />
    );
  }
);

NotificationBadge.displayName = "LinearNotificationBadge";

/**
 * Status Badge Props
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'status'> {
  /** 상태 */
  status: 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive';
}

/**
 * Status Badge Component  
 * 상태 표시용 특화 배지
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusConfig = {
      online: { status: 'success' as const, children: '온라인', dot: true },
      offline: { status: 'neutral' as const, children: '오프라인', dot: true },
      away: { status: 'warning' as const, children: '자리비움', dot: true },
      busy: { status: 'error' as const, children: '바쁨', dot: true },
      active: { status: 'success' as const, children: '활성', dot: false },
      inactive: { status: 'neutral' as const, children: '비활성', dot: false },
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge
        ref={ref}
        status={config.status}
        variant="ghost"
        size="sm"
        dot={config.dot}
        aria-label={`상태: ${config.children}`}
        {...props}
      >
        {!config.dot && config.children}
      </Badge>
    );
  }
);

StatusBadge.displayName = "LinearStatusBadge";

// === 내보내기 ===
export { Badge, NotificationBadge, StatusBadge, badgeVariants };
export type { BadgeProps, NotificationBadgeProps, StatusBadgeProps };
export default Badge;

// === JSDoc 사용 예시 (Storybook 준비) ===
/**
 * @example
 * // 기본 배지
 * <Badge>New</Badge>
 * 
 * // 상태별 배지
 * <Badge status="success">성공</Badge>
 * <Badge status="error">에러</Badge>
 * <Badge status="warning">경고</Badge>
 * 
 * // 숫자 배지
 * <Badge count={5} />
 * <Badge count={150} maxCount={99} />
 * 
 * // 점 배지
 * <Badge dot status="success" aria-label="온라인 상태" />
 * 
 * // 삭제 가능한 배지
 * <Badge closeable onClose={() => console.log('배지 삭제')}>
 *   삭제 가능
 * </Badge>
 * 
 * // 아이콘과 함께
 * <Badge startIcon={<CheckIcon />} status="success">
 *   완료
 * </Badge>
 * 
 * // 알림 배지
 * <NotificationBadge count={3} />
 * 
 * // 상태 배지
 * <StatusBadge status="online" />
 * 
 * // 커스텀 스타일
 * <Badge 
 *   variant="gradient" 
 *   size="lg" 
 *   customColor="#ff6b6b"
 *   pulse
 * >
 *   특별
 * </Badge>
 */