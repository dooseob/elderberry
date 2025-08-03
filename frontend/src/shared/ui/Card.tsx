/**
 * Linear Design System Card Component
 * 완전한 Linear 테마 시스템 통합 카드 컴포넌트
 * 
 * @version 2025.1.0
 * @author 레이아웃 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 카드 스타일 완전 적용
 * - Header, Content, Footer 영역 지원
 * - Interactive 상태 (클릭 가능)
 * - 호버 효과 및 애니메이션
 * - 그라디언트 옵션
 * - 다양한 표면 스타일 (default, elevated, panel, modal)
 * - 커스터마이징 가능한 패딩 및 그림자
 * - useLinearTheme 훅 활용
 * - Forwardref 지원
 * - TypeScript 완전 타입 정의
 * - 완전한 접근성 지원
 * - 조건부 렌더링 최적화
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils"
import { useLinearTheme } from '../../hooks/useLinearTheme';

// Linear Card Variants (Class Variance Authority 기반)
const cardVariants = cva(
  // 기본 클래스 - Linear 디자인 시스템 준수
  [
    "rounded-[var(--linear-radius-medium)] border",
    "transition-all duration-[var(--linear-transition-fast)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--linear-color-accent)] focus-visible:ring-offset-2",
    "relative overflow-hidden", // 애니메이션을 위한 설정
  ],
  {
    variants: {
      surface: {
        // 기본 배경
        default: [
          "bg-[var(--linear-color-background)] text-[var(--linear-color-text-primary)]",
          "border-[var(--linear-color-border-subtle)]",
        ],
        
        // 높은 배경 (카드에 추천)
        elevated: [
          "bg-[var(--linear-color-surface-elevated)] text-[var(--linear-color-text-primary)]",
          "border-[var(--linear-color-border-subtle)]",
        ],
        
        // 패널 배경
        panel: [
          "bg-[var(--linear-color-surface-panel)] text-[var(--linear-color-text-primary)]",
          "border-[var(--linear-color-border-default)]",
        ],
        
        // 모달 배경
        modal: [
          "bg-[var(--linear-color-surface-modal)] text-[var(--linear-color-text-primary)]",
          "border-[var(--linear-color-border-default)]",
        ],
        
        // 그라디언트 배경
        gradient: [
          "bg-gradient-to-br from-[var(--linear-color-surface-elevated)] to-[var(--linear-color-surface-panel)]",
          "text-[var(--linear-color-text-primary)] border-[var(--linear-color-border-subtle)]",
        ],
        
        // 엑센트 그라디언트
        "accent-gradient": [
          "bg-gradient-to-br from-[var(--linear-color-accent)] to-[var(--linear-color-accent-hover)]",
          "text-[var(--linear-color-text-on-accent)] border-[var(--linear-color-accent)]",
        ],
      },
      
      padding: {
        none: "p-0",
        xs: "p-[var(--linear-spacing-xs)]",
        sm: "p-[var(--linear-spacing-sm)]",
        md: "p-[var(--linear-spacing-lg)]",
        lg: "p-[var(--linear-spacing-xl)]",
        xl: "p-[var(--linear-spacing-2xl)]",
      },
      
      shadow: {
        none: "shadow-none",
        card: "shadow-[var(--linear-shadow-card)]",
        modal: "shadow-[var(--linear-shadow-modal)]",
        dropdown: "shadow-[var(--linear-shadow-dropdown)]",
      },
      
      radius: {
        none: "rounded-none",
        sm: "rounded-[var(--linear-radius-small)]",
        md: "rounded-[var(--linear-radius-medium)]",
        lg: "rounded-[var(--linear-radius-large)]",
        full: "rounded-[var(--linear-radius-full)]",
      },
      
      interactive: {
        false: "",
        true: [
          "cursor-pointer select-none",
          "hover:shadow-[var(--linear-shadow-modal)] hover:border-[var(--linear-color-border-default)]",
          "hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-[var(--linear-color-accent)]",
        ],
      },
    },
    defaultVariants: {
      surface: "elevated",
      padding: "md",
      shadow: "card",
      radius: "md",
      interactive: false,
    },
  }
);

/**
 * Linear Card Props
 * 완전한 TypeScript 타입 정의
 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** 카드 내용 */
  children: React.ReactNode;
  
  /** 애니메이션 활성화 */
  animation?: boolean;
  
  /** 카드 제목 (헤더에 표시) */
  title?: string;
  
  /** 카드 설명 (헤더에 표시) */
  description?: string;
  
  /** 헤더 영역 커스터마이징 */
  headerContent?: React.ReactNode;
  
  /** 푸터 영역 커스터마이징 */
  footerContent?: React.ReactNode;
  
  /** 로딩 상태 */
  loading?: boolean;
  
  /** 비어있음 상태 */
  empty?: boolean;
  
  /** 비어있음 메시지 */
  emptyMessage?: string;
  
  /** 에러 상태 */
  error?: boolean;
  
  /** 에러 메시지 */
  errorMessage?: string;
  
  /** 오버레이 컨텐츠 */
  overlay?: React.ReactNode;
  
  /** 배지 */
  badge?: React.ReactNode;
  
  /** 접근성: 카드 역할 */
  role?: string;
  
  /** 접근성: 카드 라벨 */
  'aria-label'?: string;
  
  /** 접근성: 카드 설명 */
  'aria-describedby'?: string;
}

/**
 * Linear Card Component
 * React.forwardRef 및 완전한 접근성 지원
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    children,
    className,
    surface,
    padding,
    shadow,
    radius,
    interactive,
    animation = true,
    title,
    description,
    headerContent,
    footerContent,
    loading = false,
    empty = false,
    emptyMessage = '데이터가 없습니다.',
    error = false,
    errorMessage = '오류가 발생했습니다.',
    overlay,
    badge,
    onClick,
    onKeyDown,
    role,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    // Linear 테마 훅 사용
    const { isReducedMotion } = useLinearTheme();
    
    // 상태 계산
    const isInteractive = Boolean(onClick || interactive);
    const shouldAnimate = animation && !isReducedMotion && isInteractive;
    
    // 자동 role 설정
    const finalRole = role || (isInteractive ? 'button' : 'article');
    
    // 자동 aria-label 설정
    const finalAriaLabel = ariaLabel || (title && isInteractive ? `${title} 카드` : undefined);
    
    // 키보드 이벤트 핸들링
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };
    
    // 로딩 스피너 렌더링
    const renderLoadingSpinner = () => (
      <div className="flex items-center justify-center p-[var(--linear-spacing-2xl)]">
        <div className="w-6 h-6 border-2 border-[var(--linear-color-accent)] border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-[var(--linear-color-text-secondary)]">로딩 중...</span>
      </div>
    );
    
    // 비어있음 상태 렌더링
    const renderEmptyState = () => (
      <div className="flex flex-col items-center justify-center p-[var(--linear-spacing-2xl)] text-center">
        <div className="w-12 h-12 mb-4 rounded-full bg-[var(--linear-color-surface-panel)] flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--linear-color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-[var(--linear-color-text-secondary)]">{emptyMessage}</p>
      </div>
    );
    
    // 에러 상태 렌더링
    const renderErrorState = () => (
      <div className="flex flex-col items-center justify-center p-[var(--linear-spacing-2xl)] text-center">
        <div className="w-12 h-12 mb-4 rounded-full bg-[var(--linear-color-error-bg)] flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--linear-color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
          </svg>
        </div>
        <p className="text-[var(--linear-color-error)]">{errorMessage}</p>
      </div>
    );
    
    // 카드 헤더 렌더링
    const renderHeader = () => {
      if (!title && !description && !headerContent) return null;
      
      return (
        <CardHeader>
          {(title || description) && (
            <div className="space-y-[var(--linear-spacing-xs)]">
              {title && (
                <CardTitle id={`card-title-${React.useId()}`}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription>
                  {description}
                </CardDescription>
              )}
            </div>
          )}
          {headerContent}
        </CardHeader>
      );
    };
    
    // 카드 푸터 렌더링
    const renderFooter = () => {
      if (!footerContent) return null;
      
      return (
        <CardFooter>
          {footerContent}
        </CardFooter>
      );
    };
    
    // 컨텐츠 렌더링
    const renderContent = () => {
      if (loading) return renderLoadingSpinner();
      if (error) return renderErrorState();
      if (empty && !children) return renderEmptyState();
      
      return children;
    };
    
    // 애니메이션 설정
    const motionProps = shouldAnimate ? {
      whileHover: {
        y: -2,
        scale: 1.01,
        transition: { duration: 0.15, ease: "easeOut" }
      },
      whileTap: {
        scale: 0.98,
        y: 0,
        transition: { duration: 0.1, ease: "easeOut" }
      },
    } : {};
    
    // 컴포넌트 선택
    const CardComponent = shouldAnimate ? motion.div : 'div';
    
    return (
      <CardComponent
        ref={ref}
        className={cn(
          cardVariants({ surface, padding, shadow, radius, interactive: isInteractive }),
          !isReducedMotion && "linear-animate-in",
          className
        )}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        role={finalRole}
        aria-label={finalAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        aria-disabled={loading || error}
        {...(shouldAnimate ? motionProps : {})}
        {...props}
      >
        {/* 배지 */}
        {badge && (
          <div className="absolute top-2 right-2 z-10">
            {badge}
          </div>
        )}
        
        {/* 카드 헤더 */}
        {renderHeader()}
        
        {/* 카드 컨텐츠 */}
        <div className={cn(
          title || description || headerContent ? "px-[var(--linear-spacing-lg)] pb-[var(--linear-spacing-lg)]" : "",
          footerContent ? "pb-0" : ""
        )}>
          {renderContent()}
        </div>
        
        {/* 카드 푸터 */}
        {renderFooter()}
        
        {/* 오버레이 */}
        {overlay && (
          <div className="absolute inset-0 bg-[var(--linear-color-surface-modal)] bg-opacity-90 flex items-center justify-center z-20">
            {overlay}
          </div>
        )}
      </CardComponent>
    );
  }
);

Card.displayName = "LinearCard";

// === Linear Card 서브컴포넌트들 ===

/**
 * Card Header Props
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 헤더 영역 중앙 정렬 */
  centered?: boolean;
  /** 헤더 경계선 */
  border?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, centered = false, border = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-[var(--linear-spacing-xs)] p-[var(--linear-spacing-lg)] pb-[var(--linear-spacing-md)]",
        centered && "items-center text-center",
        border && "border-b border-[var(--linear-color-border-subtle)] mb-[var(--linear-spacing-md)] pb-[var(--linear-spacing-lg)]",
        className
      )}
      {...props}
    />
  )
);

/**
 * Card Title Props
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** 제목 레벨 (h1-h6) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** 제목 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 제목 색상 */
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, level = 3, size = 'md', variant = 'primary', ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements;
    
    const sizeClasses = {
      sm: "text-base font-[var(--linear-font-weight-medium)]",
      md: "text-lg font-[var(--linear-font-weight-semibold)]",
      lg: "text-xl font-[var(--linear-font-weight-semibold)]",
      xl: "text-2xl font-[var(--linear-font-weight-bold)]",
    };
    
    const variantClasses = {
      primary: "text-[var(--linear-color-text-primary)]",
      secondary: "text-[var(--linear-color-text-secondary)]",
      accent: "text-[var(--linear-color-accent)]",
      muted: "text-[var(--linear-color-text-tertiary)]",
    };
    
    return (
      <Component
        ref={ref}
        className={cn(
          "leading-[var(--linear-line-height-tight)] tracking-tight",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

/**
 * Card Description Props
 */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** 설명 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 텍스트 색상 */
  variant?: 'secondary' | 'tertiary' | 'muted';
  /** 최대 줄 수 */
  maxLines?: number;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size = 'sm', variant = 'secondary', maxLines, style, ...props }, ref) => {
    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };
    
    const variantClasses = {
      secondary: "text-[var(--linear-color-text-secondary)]",
      tertiary: "text-[var(--linear-color-text-tertiary)]",
      muted: "text-[var(--linear-color-text-tertiary)] opacity-75",
    };
    
    const truncateStyle = maxLines ? {
      display: '-webkit-box',
      WebkitLineClamp: maxLines,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      ...style
    } : style;
    
    return (
      <p
        ref={ref}
        className={cn(
          "leading-[var(--linear-line-height-normal)]",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        style={truncateStyle}
        {...props}
      />
    );
  }
);

/**
 * Card Content Props
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 컨텐츠 패딩 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** 컨텐츠 가운데 정렬 */
  centered?: boolean;
  /** 컨텐츠 문맥 */
  as?: 'div' | 'section' | 'article' | 'main';
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = 'lg', centered = false, as = 'div', ...props }, ref) => {
    const Component = as;
    
    const paddingClasses = {
      none: "p-0",
      sm: "p-[var(--linear-spacing-sm)]",
      md: "p-[var(--linear-spacing-md)]",
      lg: "p-[var(--linear-spacing-lg)]",
    };
    
    return (
      <Component
        ref={ref}
        className={cn(
          "text-[var(--linear-color-text-primary)]",
          paddingClasses[padding],
          "pt-0", // 헤더와 접촉되어 있을 때 상단 패딩 제거
          centered && "flex flex-col items-center justify-center text-center",
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * Card Footer Props
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 푸터 정렬 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** 경계선 */
  border?: boolean;
  /** 패딩 */
  padding?: 'sm' | 'md' | 'lg';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify = 'start', border = false, padding = 'lg', ...props }, ref) => {
    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    };
    
    const paddingClasses = {
      sm: "p-[var(--linear-spacing-sm)]",
      md: "p-[var(--linear-spacing-md)]",
      lg: "p-[var(--linear-spacing-lg)]",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center pt-0 gap-[var(--linear-spacing-sm)]",
          paddingClasses[padding],
          justifyClasses[justify],
          border && "border-t border-[var(--linear-color-border-subtle)] mt-[var(--linear-spacing-md)] pt-[var(--linear-spacing-lg)]",
          className
        )}
        {...props}
      />
    );
  }
);

// Display Names
CardHeader.displayName = "LinearCardHeader";
CardTitle.displayName = "LinearCardTitle";
CardDescription.displayName = "LinearCardDescription";
CardContent.displayName = "LinearCardContent";
CardFooter.displayName = "LinearCardFooter";

// === 유틸리티 함수들 ===

/**
 * 카드 접근성 검증
 */
export const validateCardAccessibility = (props: CardProps) => {
  const warnings: string[] = [];
  
  if (props.interactive && !props['aria-label'] && !props.title) {
    warnings.push('인터랙티브 카드에는 aria-label 또는 title이 필요합니다.');
  }
  
  if (props.onClick && !props.role) {
    warnings.push('클릭 가능한 카드에는 적절한 role을 설정하는 것이 좋습니다.');
  }
  
  if (props.loading && !props['aria-label']) {
    warnings.push('로딩 상태의 카드에는 적절한 aria-label을 제공하는 것이 좋습니다.');
  }
  
  return warnings;
};

/**
 * 카드 크기에 따른 최적 패딩 반환
 */
export const getOptimalCardPadding = (width: number): CardProps['padding'] => {
  if (width < 300) return 'sm';
  if (width < 500) return 'md';
  if (width < 800) return 'lg';
  return 'xl';
};

/**
 * 카드 컨텍스트에 따른 최적 표면 반환
 */
export const getOptimalCardSurface = (context: 'page' | 'modal' | 'sidebar' | 'grid'): CardProps['surface'] => {
  switch (context) {
    case 'page':
      return 'elevated';
    case 'modal':
      return 'modal';
    case 'sidebar':
      return 'panel';
    case 'grid':
      return 'elevated';
    default:
      return 'elevated';
  }
};

// === 빌드 링 오버레이 컴포넌트 ===

/**
 * Card Loading Overlay Props
 */
export interface CardLoadingOverlayProps {
  /** 로딩 메시지 */
  message?: string;
  /** 스피너 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Card Loading Overlay Component
 */
const CardLoadingOverlay: React.FC<CardLoadingOverlayProps> = ({
  message = '로딩 중...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={cn(
        "border-2 border-[var(--linear-color-accent)] border-t-transparent rounded-full animate-spin",
        sizeClasses[size]
      )} />
      <span className="text-sm text-[var(--linear-color-text-secondary)]">{message}</span>
    </div>
  );
};

// === 내보내기 ===
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardLoadingOverlay,
  cardVariants
};
export type { 
  CardProps, 
  CardHeaderProps, 
  CardTitleProps, 
  CardDescriptionProps, 
  CardContentProps, 
  CardFooterProps,
  CardLoadingOverlayProps
};
export default Card;

// === JSDoc 사용 예시 (Storybook 준비) ===
/**
 * @example
 * // 기본 카드
 * <Card>
 *   <CardHeader>
 *     <CardTitle>카드 제목</CardTitle>
 *     <CardDescription>카드 설명입니다.</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     카드 내용이 여기에 들어갑니다.
 *   </CardContent>
 * </Card>
 * 
 * // 인터랙티브 카드
 * <Card 
 *   interactive
 *   onClick={() => console.log('카드 클릭!')}
 *   title="클릭 가능한 카드"
 * >
 *   내용...
 * </Card>
 * 
 * // 로딩 상태 카드
 * <Card loading />
 * 
 * // 빈 상태 카드
 * <Card empty emptyMessage="표시할 데이터가 없습니다." />
 * 
 * // 커스텀 스타일링
 * <Card 
 *   surface="gradient"
 *   padding="xl"
 *   shadow="modal"
 *   radius="lg"
 * >
 *   특별한 카드...
 * </Card>
 */