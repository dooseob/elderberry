/**
 * Linear Design System Separator Component
 * 완전한 Linear 테마 시스템 통합 구분선 컴포넌트
 * 
 * @version 2025.1.0
 * @author UI/UX 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 구분선 스타일 완전 적용
 * - 수평/수직 방향 지원
 * - 다양한 두께 옵션 (thin, normal, thick)
 * - 그라디언트 구분선 지원
 * - 텍스트가 포함된 구분선
 * - 아이콘이 포함된 구분선
 * - 다양한 색상 테마 (subtle, default, strong, accent)
 * - useLinearTheme 훅 활용
 * - Forwardref 지원
 * - TypeScript 완전 타입 정의
 * - 완전한 접근성 지원 (ARIA)
 * - 반응형 디자인
 * - 애니메이션 효과
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
// import { useLinearTheme } from '../../hooks/useLinearTheme';
import { useLinearTheme } from '../../hooks/useLinearTheme.simple';

// Linear Separator Variants (Class Variance Authority 기반)
const separatorVariants = cva(
  // 기본 클래스 - Linear 디자인 시스템 준수
  [
    "flex-shrink-0 border-0",
    "transition-all duration-[var(--linear-transition-fast)]",
  ],
  {
    variants: {
      orientation: {
        horizontal: "w-full h-px",
        vertical: "h-full w-px",
      },
      
      variant: {
        // 미묘한 구분선 (기본)
        subtle: "bg-[var(--linear-color-border-subtle)]",
        
        // 기본 구분선
        default: "bg-[var(--linear-color-border-default)]",
        
        // 강한 구분선
        strong: "bg-[var(--linear-color-border-strong)]",
        
        // 엑센트 구분선
        accent: "bg-[var(--linear-color-accent)]",
        
        // 그라디언트 구분선
        gradient: "bg-gradient-to-r from-transparent via-[var(--linear-color-border-default)] to-transparent",
        
        // 점선 구분선
        dashed: "border-t border-dashed border-[var(--linear-color-border-default)] bg-transparent",
        
        // 점선 구분선 (점)
        dotted: "border-t border-dotted border-[var(--linear-color-border-default)] bg-transparent",
      },
      
      thickness: {
        thin: "", // 기본 1px
        normal: "h-0.5", // 2px
        thick: "h-1", // 4px
        thicker: "h-1.5", // 6px
      },
      
      spacing: {
        none: "my-0",
        xs: "my-[var(--linear-spacing-xs)]",
        sm: "my-[var(--linear-spacing-sm)]",
        md: "my-[var(--linear-spacing-md)]",
        lg: "my-[var(--linear-spacing-lg)]",
        xl: "my-[var(--linear-spacing-xl)]",
        "2xl": "my-[var(--linear-spacing-2xl)]",
      },
    },
    compoundVariants: [
      // 수직 방향일 때 점선/점선 스타일 조정
      {
        orientation: "vertical",
        variant: "dashed",
        className: "border-t-0 border-l border-dashed",
      },
      {
        orientation: "vertical",
        variant: "dotted", 
        className: "border-t-0 border-l border-dotted",
      },
      // 수직 방향일 때 두께 조정
      {
        orientation: "vertical",
        thickness: "normal",
        className: "h-full w-0.5",
      },
      {
        orientation: "vertical", 
        thickness: "thick",
        className: "h-full w-1",
      },
      {
        orientation: "vertical",
        thickness: "thicker",
        className: "h-full w-1.5",
      },
      // 수직 방향일 때 간격 조정
      {
        orientation: "vertical",
        spacing: "xs",
        className: "my-0 mx-[var(--linear-spacing-xs)]",
      },
      {
        orientation: "vertical",
        spacing: "sm", 
        className: "my-0 mx-[var(--linear-spacing-sm)]",
      },
      {
        orientation: "vertical",
        spacing: "md",
        className: "my-0 mx-[var(--linear-spacing-md)]",
      },
      {
        orientation: "vertical",
        spacing: "lg",
        className: "my-0 mx-[var(--linear-spacing-lg)]",
      },
      {
        orientation: "vertical",
        spacing: "xl",
        className: "my-0 mx-[var(--linear-spacing-xl)]",
      },
      {
        orientation: "vertical",
        spacing: "2xl",
        className: "my-0 mx-[var(--linear-spacing-2xl)]",
      },
    ],
    defaultVariants: {
      orientation: "horizontal",
      variant: "subtle",
      thickness: "thin",
      spacing: "md",
    },
  }
);

/**
 * Linear Separator Props
 * 완전한 TypeScript 타입 정의
 */
export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  /** 구분선에 포함될 텍스트 */
  label?: string;
  
  /** 구분선에 포함될 아이콘 */
  icon?: React.ReactNode;
  
  /** 텍스트/아이콘 위치 */
  labelPosition?: 'left' | 'center' | 'right';
  
  /** 애니메이션 활성화 */
  animation?: boolean;
  
  /** 페이드 효과 (그라디언트 양끝 투명) */
  fade?: boolean;
  
  /** 커스텀 색상 */
  customColor?: string;
  
  /** 접근성: 구분선 라벨 */
  'aria-label'?: string;
  
  /** 접근성: 구분선 역할 */
  role?: 'separator' | 'presentation' | 'none';
}

/**
 * Linear Separator Component
 * React.forwardRef 및 완전한 접근성 지원
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({
    className,
    orientation,
    variant,
    thickness,
    spacing,
    label,
    icon,
    labelPosition = 'center',
    animation = false,
    fade = false,
    customColor,
    role = 'separator',
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    // Linear 테마 훅 사용
    const { isReducedMotion } = useLinearTheme();
    
    // 상태 계산
    const shouldAnimate = animation && !isReducedMotion;
    const hasContent = Boolean(label || icon);
    const isHorizontal = orientation === 'horizontal';
    
    // 커스텀 색상 스타일
    const customStyle = React.useMemo(() => {
      if (!customColor) return undefined;
      
      const isHex = customColor.startsWith('#');
      const colorValue = isHex ? customColor : `var(${customColor})`;
      
      if (variant === 'gradient') {
        return {
          background: isHorizontal 
            ? `linear-gradient(to right, transparent, ${colorValue}, transparent)`
            : `linear-gradient(to bottom, transparent, ${colorValue}, transparent)`,
        };
      }
      
      return { backgroundColor: colorValue };
    }, [customColor, variant, isHorizontal]);
    
    // 콘텐츠가 있는 구분선 렌더링
    if (hasContent && isHorizontal) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center",
            spacing && `my-[var(--linear-spacing-${spacing})]`,
            shouldAnimate && "linear-animate-in",
            className
          )}
          role={role}
          aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
          {...props}
        >
          {/* 왼쪽 구분선 */}
          {labelPosition !== 'left' && (
            <div
              className={cn(
                separatorVariants({ 
                  orientation: 'horizontal', 
                  variant: fade ? 'gradient' : variant, 
                  thickness,
                  spacing: 'none'
                }),
                "flex-1"
              )}
              style={customStyle}
            />
          )}
          
          {/* 중앙 콘텐츠 */}
          <div className="flex items-center px-[var(--linear-spacing-md)] text-[var(--linear-color-text-secondary)] text-sm font-[var(--linear-font-weight-medium)]">
            {icon && (
              <span className="flex items-center justify-center mr-2">
                {React.isValidElement(icon) ? 
                  React.cloneElement(icon as React.ReactElement, {
                    className: cn("w-4 h-4", (icon as React.ReactElement).props?.className),
                    'aria-hidden': 'true',
                  }) : icon
                }
              </span>
            )}
            {label && <span>{label}</span>}
          </div>
          
          {/* 오른쪽 구분선 */}
          {labelPosition !== 'right' && (
            <div
              className={cn(
                separatorVariants({ 
                  orientation: 'horizontal', 
                  variant: fade ? 'gradient' : variant, 
                  thickness,
                  spacing: 'none'
                }),
                "flex-1"
              )}
              style={customStyle}
            />
          )}
        </div>
      );
    }
    
    // 콘텐츠가 있는 수직 구분선 (지원하지 않음)
    if (hasContent && !isHorizontal) {
      console.warn('수직 구분선에서는 라벨/아이콘이 지원되지 않습니다.');
    }
    
    // 기본 구분선 렌더링
    return (
      <div
        ref={ref}
        className={cn(
          separatorVariants({ orientation, variant, thickness, spacing }),
          shouldAnimate && "linear-animate-in",
          className
        )}
        style={customStyle}
        role={role}
        aria-label={ariaLabel}
        {...props}
      />
    );
  }
);

Separator.displayName = "LinearSeparator";

// === 유틸리티 함수들 ===

/**
 * 구분선 접근성 검증
 */
export const validateSeparatorAccessibility = (props: SeparatorProps) => {
  const warnings: string[] = [];
  
  if (props.role === 'separator' && !props['aria-label'] && !props.label) {
    warnings.push('의미있는 구분선에는 aria-label 또는 label이 필요합니다.');
  }
  
  if (props.orientation === 'vertical' && (props.label || props.icon)) {
    warnings.push('수직 구분선에서는 라벨이나 아이콘이 지원되지 않습니다.');
  }
  
  return warnings;
};

/**
 * 컨텍스트에 따른 최적 구분선 스타일 반환
 */
export const getOptimalSeparatorStyle = (
  context: 'page' | 'card' | 'modal' | 'sidebar' | 'menu'
): Pick<SeparatorProps, 'variant' | 'thickness' | 'spacing'> => {
  const styles = {
    page: { variant: 'subtle' as const, thickness: 'thin' as const, spacing: 'xl' as const },
    card: { variant: 'subtle' as const, thickness: 'thin' as const, spacing: 'lg' as const },
    modal: { variant: 'default' as const, thickness: 'thin' as const, spacing: 'lg' as const },
    sidebar: { variant: 'subtle' as const, thickness: 'thin' as const, spacing: 'md' as const },
    menu: { variant: 'subtle' as const, thickness: 'thin' as const, spacing: 'sm' as const },
  };
  
  return styles[context];
};

// === 특수 구분선 컴포넌트들 ===

/**
 * Section Separator Props
 */
export interface SectionSeparatorProps extends Omit<SeparatorProps, 'label'> {
  /** 섹션 제목 */
  title: string;
  /** 섹션 설명 */
  description?: string;
}

/**
 * Section Separator Component
 * 섹션 구분용 특화 구분선
 */
export const SectionSeparator = React.forwardRef<HTMLDivElement, SectionSeparatorProps>(
  ({ title, description, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2">
        <Separator
          ref={ref}
          label={title}
          variant="gradient"
          spacing="lg"
          role="separator"
          aria-label={`${title} 섹션 구분`}
          {...props}
        />
        {description && (
          <p className="text-center text-sm text-[var(--linear-color-text-tertiary)] px-4">
            {description}
          </p>
        )}
      </div>
    );
  }
);

SectionSeparator.displayName = "LinearSectionSeparator";

/**
 * Breadcrumb Separator Props
 */
export interface BreadcrumbSeparatorProps extends Omit<SeparatorProps, 'orientation' | 'label' | 'icon'> {
  /** 구분 아이콘 타입 */
  iconType?: 'chevron' | 'slash' | 'dot' | 'arrow';
}

/**
 * Breadcrumb Separator Component
 * 브레드크럼 구분용 특화 구분선
 */
export const BreadcrumbSeparator = React.forwardRef<HTMLDivElement, BreadcrumbSeparatorProps>(
  ({ iconType = 'chevron', className, ...props }, ref) => {
    const icons = {
      chevron: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ),
      slash: (
        <span className="text-[var(--linear-color-text-tertiary)]">/</span>
      ),
      dot: (
        <span className="text-[var(--linear-color-text-tertiary)]">•</span>
      ),
      arrow: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      ),
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center text-[var(--linear-color-text-tertiary)] mx-2",
          className
        )}
        role="presentation"
        aria-hidden="true"
        {...props}
      >
        {icons[iconType]}
      </span>
    );
  }
);

BreadcrumbSeparator.displayName = "LinearBreadcrumbSeparator";

/**
 * Timeline Separator Props
 */
export interface TimelineSeparatorProps extends Omit<SeparatorProps, 'orientation'> {
  /** 타임라인 노드 */
  node?: React.ReactNode;
  /** 활성 상태 */
  active?: boolean;
  /** 완료 상태 */
  completed?: boolean;
}

/**
 * Timeline Separator Component
 * 타임라인 구분용 특화 구분선
 */
export const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ node, active = false, completed = false, className, ...props }, ref) => {
    const nodeVariant = completed ? 'accent' : active ? 'default' : 'subtle';
    
    return (
      <div className="flex flex-col items-center">
        {/* 타임라인 노드 */}
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border-2 bg-[var(--linear-color-background)]",
            completed && "border-[var(--linear-color-accent)] bg-[var(--linear-color-accent)] text-white",
            active && "border-[var(--linear-color-accent)] text-[var(--linear-color-accent)]",
            !active && !completed && "border-[var(--linear-color-border-default)] text-[var(--linear-color-text-tertiary)]"
          )}
        >
          {node || (
            <div className={cn(
              "w-2 h-2 rounded-full",
              completed && "bg-white",
              active && "bg-[var(--linear-color-accent)]",
              !active && !completed && "bg-[var(--linear-color-border-default)]"
            )} />
          )}
        </div>
        
        {/* 연결선 */}
        <Separator
          ref={ref}
          orientation="vertical"
          variant={nodeVariant}
          thickness="thin"
          spacing="none"
          className={cn("h-8 my-2", className)}
          role="presentation"
          {...props}
        />
      </div>
    );
  }
);

TimelineSeparator.displayName = "LinearTimelineSeparator";

// === 내보내기 ===
// 이미 위에서 개별적으로 export되고 있으므로 중복 export 제거
export { separatorVariants };
export default Separator;

// === JSDoc 사용 예시 (Storybook 준비) ===
/**
 * @example
 * // 기본 구분선
 * <Separator />
 * 
 * // 텍스트가 있는 구분선
 * <Separator label="또는" />
 * 
 * // 아이콘이 있는 구분선
 * <Separator icon={<StarIcon />} label="인기" />
 * 
 * // 수직 구분선
 * <div className="flex items-center h-8">
 *   <span>항목 1</span>
 *   <Separator orientation="vertical" spacing="sm" />
 *   <span>항목 2</span>
 * </div>
 * 
 * // 다양한 스타일
 * <Separator variant="strong" thickness="thick" />
 * <Separator variant="gradient" fade />
 * <Separator variant="dashed" />
 * 
 * // 섹션 구분선
 * <SectionSeparator 
 *   title="설정" 
 *   description="계정 및 개인정보 설정"
 * />
 * 
 * // 브레드크럼 구분선
 * <nav className="flex items-center">
 *   <a href="/">홈</a>
 *   <BreadcrumbSeparator />
 *   <a href="/products">제품</a>
 *   <BreadcrumbSeparator iconType="arrow" />
 *   <span>상세정보</span>
 * </nav>
 * 
 * // 타임라인 구분선
 * <div className="flex flex-col">
 *   <div className="flex items-center">
 *     <TimelineSeparator completed />
 *     <span>단계 1 완료</span>
 *   </div>
 *   <div className="flex items-center">
 *     <TimelineSeparator active />
 *     <span>단계 2 진행중</span>
 *   </div>
 *   <div className="flex items-center">
 *     <TimelineSeparator />
 *     <span>단계 3 대기</span>
 *   </div>
 * </div>
 */