/**
 * Linear Design System Tooltip Component
 * 완전한 Linear 테마 시스템 통합 툴팁 컴포넌트
 * 
 * @version 2025.1.0
 * @author UI/UX 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 툴팁 스타일 완전 적용
 * - 다양한 위치 (top, bottom, left, right)
 * - 자동 위치 조정 (collision detection)
 * - 지연 시간 커스터마이징 (delay)
 * - 트리거 방식 (hover, click, focus)
 * - 화살표 표시 옵션
 * - Portal을 통한 렌더링
 * - 완전한 접근성 지원 (ARIA)
 * - useLinearTheme 훅 활용
 * - TypeScript 완전 타입 정의
 * - 애니메이션 및 트랜지션
 * - 키보드 네비게이션
 * - 모바일 터치 지원
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useLinearTheme } from '../../hooks/useLinearTheme';

// Linear Tooltip Variants (Class Variance Authority 기반)
const tooltipVariants = cva(
  // 기본 클래스 - Linear 디자인 시스템 준수
  [
    "absolute z-[var(--linear-z-tooltip)]",
    "bg-[var(--linear-color-surface-modal)] text-[var(--linear-color-text-primary)]",
    "border border-[var(--linear-color-border-default)]",
    "rounded-[var(--linear-radius-small)]",
    "shadow-[var(--linear-shadow-dropdown)]",
    "px-[var(--linear-spacing-sm)] py-[var(--linear-spacing-xs)]",
    "text-sm font-[var(--linear-font-weight-normal)]",
    "max-w-xs break-words",
    "pointer-events-none select-none",
  ],
  {
    variants: {
      variant: {
        // 기본 스타일
        default: [
          "bg-[var(--linear-color-surface-modal)] text-[var(--linear-color-text-primary)]",
          "border-[var(--linear-color-border-default)]",
        ],
        
        // 다크 스타일
        dark: [
          "bg-gray-900 text-white",
          "border-gray-700",
        ],
        
        // 라이트 스타일
        light: [
          "bg-white text-gray-900",
          "border-gray-200",
        ],
        
        // 엑센트 스타일
        accent: [
          "bg-[var(--linear-color-accent)] text-[var(--linear-color-text-on-accent)]",
          "border-[var(--linear-color-accent)]",
        ],
        
        // 에러 스타일
        error: [
          "bg-[var(--linear-color-error)] text-white",
          "border-[var(--linear-color-error)]",
        ],
        
        // 성공 스타일
        success: [
          "bg-[var(--linear-color-success)] text-white",
          "border-[var(--linear-color-success)]",
        ],
        
        // 경고 스타일
        warning: [
          "bg-[var(--linear-color-warning)] text-white",
          "border-[var(--linear-color-warning)]",
        ],
      },
      
      size: {
        sm: "text-xs px-[var(--linear-spacing-xs)] py-[calc(var(--linear-spacing-xs)/2)] max-w-[200px]",
        md: "text-sm px-[var(--linear-spacing-sm)] py-[var(--linear-spacing-xs)] max-w-[300px]",
        lg: "text-base px-[var(--linear-spacing-md)] py-[var(--linear-spacing-sm)] max-w-[400px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Arrow Variants
const arrowVariants = cva([
  "absolute w-2 h-2 rotate-45",
  "border border-[var(--linear-color-border-default)]",
], {
  variants: {
    variant: {
      default: "bg-[var(--linear-color-surface-modal)]",
      dark: "bg-gray-900 border-gray-700",
      light: "bg-white border-gray-200",
      accent: "bg-[var(--linear-color-accent)] border-[var(--linear-color-accent)]",
      error: "bg-[var(--linear-color-error)] border-[var(--linear-color-error)]",
      success: "bg-[var(--linear-color-success)] border-[var(--linear-color-success)]",
      warning: "bg-[var(--linear-color-warning)] border-[var(--linear-color-warning)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Tooltip Position Type
 */
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

/**
 * Tooltip Trigger Type
 */
type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

/**
 * Tooltip Props
 * 완전한 TypeScript 타입 정의
 */
export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
  /** 툴팁 내용 */
  content: React.ReactNode;
  
  /** 트리거 요소 */
  children: React.ReactElement;
  
  /** 툴팁 위치 */
  position?: TooltipPosition;
  
  /** 트리거 방식 */
  trigger?: TooltipTrigger;
  
  /** 표시 지연 시간 (ms) */
  showDelay?: number;
  
  /** 숨김 지연 시간 (ms) */
  hideDelay?: number;
  
  /** 화살표 표시 여부 */
  showArrow?: boolean;
  
  /** 수동 제어 시 열림/닫힘 상태 */
  open?: boolean;
  
  /** 수동 제어 시 상태 변경 핸들러 */
  onOpenChange?: (open: boolean) => void;
  
  /** 툴팁 비활성화 */
  disabled?: boolean;
  
  /** 애니메이션 활성화 */
  animation?: boolean;
  
  /** 오프셋 거리 */
  offset?: number;
  
  /** 자동 위치 조정 */
  autoPosition?: boolean;
  
  /** Portal 컨테이너 */
  container?: Element | (() => Element | null) | null;
  
  /** 접근성: 툴팁 역할 */
  role?: 'tooltip' | 'dialog' | 'menu';
  
  /** 접근성: 툴팁 ID */
  id?: string;
}

/**
 * Position Calculation Hook
 * 툴팁 위치 계산 및 자동 조정
 */
const useTooltipPosition = (
  triggerRef: React.RefObject<HTMLElement>,
  tooltipRef: React.RefObject<HTMLElement>,
  position: TooltipPosition,
  offset: number,
  autoPosition: boolean
) => {
  const [calculatedPosition, setCalculatedPosition] = React.useState(position);
  const [coordinates, setCoordinates] = React.useState({ x: 0, y: 0 });
  const [arrowPosition, setArrowPosition] = React.useState({ x: 0, y: 0 });
  
  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    
    let pos = position;
    let x = 0;
    let y = 0;
    let arrowX = 0;
    let arrowY = 0;
    
    // 기본 위치 계산
    const calculateBasePosition = (pos: TooltipPosition) => {
      switch (pos) {
        case 'top':
        case 'top-start':
        case 'top-end':
          x = pos === 'top-start' ? trigger.left 
            : pos === 'top-end' ? trigger.right - tooltip.width
            : trigger.left + (trigger.width - tooltip.width) / 2;
          y = trigger.top - tooltip.height - offset;
          arrowX = pos === 'top-start' ? 16 
            : pos === 'top-end' ? tooltip.width - 16 - 8
            : tooltip.width / 2 - 4;
          arrowY = tooltip.height - 1;
          break;
          
        case 'bottom':
        case 'bottom-start': 
        case 'bottom-end':
          x = pos === 'bottom-start' ? trigger.left
            : pos === 'bottom-end' ? trigger.right - tooltip.width
            : trigger.left + (trigger.width - tooltip.width) / 2;
          y = trigger.bottom + offset;
          arrowX = pos === 'bottom-start' ? 16
            : pos === 'bottom-end' ? tooltip.width - 16 - 8
            : tooltip.width / 2 - 4;
          arrowY = -4;
          break;
          
        case 'left':
        case 'left-start':
        case 'left-end':
          x = trigger.left - tooltip.width - offset;
          y = pos === 'left-start' ? trigger.top
            : pos === 'left-end' ? trigger.bottom - tooltip.height
            : trigger.top + (trigger.height - tooltip.height) / 2;
          arrowX = tooltip.width - 1;
          arrowY = pos === 'left-start' ? 16
            : pos === 'left-end' ? tooltip.height - 16 - 8
            : tooltip.height / 2 - 4;
          break;
          
        case 'right':
        case 'right-start':
        case 'right-end':
          x = trigger.right + offset;
          y = pos === 'right-start' ? trigger.top
            : pos === 'right-end' ? trigger.bottom - tooltip.height
            : trigger.top + (trigger.height - tooltip.height) / 2;
          arrowX = -4;
          arrowY = pos === 'right-start' ? 16
            : pos === 'right-end' ? tooltip.height - 16 - 8
            : tooltip.height / 2 - 4;
          break;
      }
      return { x, y, arrowX, arrowY };
    };
    
    // 초기 위치 계산
    const result = calculateBasePosition(pos);
    x = result.x;
    y = result.y;
    arrowX = result.arrowX;
    arrowY = result.arrowY;
    
    // 자동 위치 조정
    if (autoPosition) {
      // 뷰포트 벗어남 감지 및 조정
      if (x + tooltip.width > viewport.width) {
        if (pos.includes('left')) {
          pos = pos.replace('left', 'right') as TooltipPosition;
        } else if (pos.includes('right')) {
          pos = pos.replace('right', 'left') as TooltipPosition;
        } else {
          x = viewport.width - tooltip.width - 8;
        }
      }
      
      if (x < 0) {
        if (pos.includes('right')) {
          pos = pos.replace('right', 'left') as TooltipPosition;
        } else if (pos.includes('left')) {
          pos = pos.replace('left', 'right') as TooltipPosition;
        } else {
          x = 8;
        }
      }
      
      if (y + tooltip.height > viewport.height) {
        if (pos.includes('bottom')) {
          pos = pos.replace('bottom', 'top') as TooltipPosition;
        } else if (pos.includes('top')) {
          pos = pos.replace('top', 'bottom') as TooltipPosition;
        } else {
          y = viewport.height - tooltip.height - 8;
        }
      }
      
      if (y < 0) {
        if (pos.includes('top')) {
          pos = pos.replace('top', 'bottom') as TooltipPosition;
        } else if (pos.includes('bottom')) {
          pos = pos.replace('bottom', 'top') as TooltipPosition;
        } else {
          y = 8;
        }
      }
      
      // 위치가 변경된 경우 재계산
      if (pos !== position) {
        const adjustedResult = calculateBasePosition(pos);
        x = adjustedResult.x;
        y = adjustedResult.y;
        arrowX = adjustedResult.arrowX;
        arrowY = adjustedResult.arrowY;
      }
    }
    
    setCalculatedPosition(pos);
    setCoordinates({ x, y });
    setArrowPosition({ x: arrowX, y: arrowY });
  }, [position, offset, autoPosition, triggerRef, tooltipRef]);
  
  return {
    calculatedPosition,
    coordinates,
    arrowPosition,
    calculatePosition
  };
};

/**
 * Linear Tooltip Component
 * React.forwardRef 및 완전한 접근성 지원
 */
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({
    content,
    children,
    className,
    variant,
    size,
    position = 'top',
    trigger = 'hover',
    showDelay = 500,
    hideDelay = 0,
    showArrow = true,
    open: controlledOpen,
    onOpenChange,
    disabled = false,
    animation = true,
    offset = 8,
    autoPosition = true,
    container,
    role = 'tooltip',
    id: providedId,
    ...props
  }, ref) => {
    // Linear 테마 훅 사용
    const { isReducedMotion } = useLinearTheme();
    
    // 내부 상태
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    
    // 참조
    const triggerRef = React.useRef<HTMLElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const showTimeoutRef = React.useRef<NodeJS.Timeout>();
    const hideTimeoutRef = React.useRef<NodeJS.Timeout>();
    
    // ID 생성
    const tooltipId = providedId || React.useId();
    
    // 상태 계산
    const isManual = trigger === 'manual';
    const isOpen = isManual ? controlledOpen ?? false : internalOpen;
    const shouldAnimate = animation && !isReducedMotion;
    
    // 위치 계산 훅
    const { calculatedPosition, coordinates, arrowPosition, calculatePosition } = 
      useTooltipPosition(triggerRef, tooltipRef, position, offset, autoPosition);
    
    // 툴팁 열기/닫기 함수
    const openTooltip = React.useCallback(() => {
      if (disabled) return;
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      if (showDelay > 0) {
        showTimeoutRef.current = setTimeout(() => {
          if (isManual) {
            onOpenChange?.(true);
          } else {
            setInternalOpen(true);
          }
        }, showDelay);
      } else {
        if (isManual) {
          onOpenChange?.(true);
        } else {
          setInternalOpen(true);
        }
      }
    }, [disabled, showDelay, isManual, onOpenChange]);
    
    const closeTooltip = React.useCallback(() => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      
      if (hideDelay > 0) {
        hideTimeoutRef.current = setTimeout(() => {
          if (isManual) {
            onOpenChange?.(false);
          } else {
            setInternalOpen(false);
          }
        }, hideDelay);
      } else {
        if (isManual) {
          onOpenChange?.(false);
        } else {
          setInternalOpen(false);
        }
      }
    }, [hideDelay, isManual, onOpenChange]);
    
    // 이벤트 핸들러
    const handleMouseEnter = () => {
      if (trigger === 'hover') openTooltip();
    };
    
    const handleMouseLeave = () => {
      if (trigger === 'hover') closeTooltip();
    };
    
    const handleClick = () => {
      if (trigger === 'click') {
        if (isOpen) closeTooltip();
        else openTooltip();
      }
    };
    
    const handleFocus = () => {
      if (trigger === 'focus') openTooltip();
    };
    
    const handleBlur = () => {
      if (trigger === 'focus') closeTooltip();
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeTooltip();
      }
    };
    
    // 트리거 요소에 이벤트 핸들러 추가
    const clonedTrigger = React.cloneElement(children, {
      ref: (node: HTMLElement) => {
        triggerRef.current = node;
        if (children.ref) {
          if (typeof children.ref === 'function') {
            children.ref(node);
          } else {
            (children.ref as React.MutableRefObject<HTMLElement>).current = node;
          }
        }
      },
      onMouseEnter: (e: React.MouseEvent) => {
        children.props.onMouseEnter?.(e);
        handleMouseEnter();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        children.props.onMouseLeave?.(e);
        handleMouseLeave();
      },
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClick();
      },
      onFocus: (e: React.FocusEvent) => {
        children.props.onFocus?.(e);
        handleFocus();
      },
      onBlur: (e: React.FocusEvent) => {
        children.props.onBlur?.(e);
        handleBlur();
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        children.props.onKeyDown?.(e);
        handleKeyDown(e);
      },
      'aria-describedby': role === 'tooltip' ? (isOpen ? tooltipId : undefined) : undefined,
      'aria-expanded': trigger === 'click' ? isOpen : undefined,
      'aria-haspopup': trigger === 'click' ? 'dialog' : undefined,
    });
    
    // 마운트 상태 관리
    React.useEffect(() => {
      setIsMounted(true);
    }, []);
    
    // 위치 계산
    React.useEffect(() => {
      if (isOpen && isMounted) {
        calculatePosition();
        
        // 윈도우 리사이즈 시 위치 재계산
        const handleResize = () => calculatePosition();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }, [isOpen, isMounted, calculatePosition]);
    
    // 정리
    React.useEffect(() => {
      return () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, []);
    
    // Portal 컨테이너 결정
    const portalContainer = React.useMemo(() => {
      if (container) {
        return typeof container === 'function' ? container() : container;
      }
      return typeof document !== 'undefined' ? document.body : null;
    }, [container]);
    
    // 애니메이션 설정
    const tooltipAnimation = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.15, ease: "easeOut" }
    };
    
    // 화살표 위치 클래스
    const getArrowPositionClasses = (pos: TooltipPosition) => {
      if (pos.includes('top')) return 'border-t-0 border-l-0';
      if (pos.includes('bottom')) return 'border-b-0 border-r-0';  
      if (pos.includes('left')) return 'border-l-0 border-b-0';
      if (pos.includes('right')) return 'border-r-0 border-t-0';
      return '';
    };
    
    if (!isMounted || !portalContainer || disabled) {
      return clonedTrigger;
    }
    
    const tooltipElement = (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={React.useMemo(() => {
              return (node: HTMLDivElement) => {
                if (ref) {
                  if (typeof ref === 'function') ref(node);
                  else ref.current = node;
                }
                tooltipRef.current = node;
              };
            }, [ref])}
            className={cn(tooltipVariants({ variant, size }), className)}
            style={{
              left: coordinates.x,
              top: coordinates.y,
            }}
            role={role}
            id={tooltipId}
            {...(shouldAnimate ? tooltipAnimation : {})}
            {...props}
          >
            {content}
            
            {/* 화살표 */}
            {showArrow && (
              <div
                className={cn(
                  arrowVariants({ variant }),
                  getArrowPositionClasses(calculatedPosition)
                )}
                style={{
                  left: arrowPosition.x,
                  top: arrowPosition.y,
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
    
    return (
      <>
        {clonedTrigger}
        {createPortal(tooltipElement, portalContainer)}
      </>
    );
  }
);

Tooltip.displayName = "LinearTooltip";

// === 유틸리티 함수들 ===

/**
 * 툴팁 접근성 검증
 */
export const validateTooltipAccessibility = (props: TooltipProps) => {
  const warnings: string[] = [];
  
  if (!props.content) {
    warnings.push('툴팁에는 내용이 필요합니다.');
  }
  
  if (props.trigger === 'click' && !props.role) {
    warnings.push('클릭 트리거 툴팁에는 적절한 role을 설정하는 것이 좋습니다.');
  }
  
  if (typeof props.content === 'string' && props.content.length > 200) {
    warnings.push('툴팁 내용이 너무 깁니다. 모달이나 다른 UI를 고려해보세요.');
  }
  
  return warnings;
};

/**
 * 화면 크기에 따른 최적 툴팁 위치 반환
 */
export const getOptimalTooltipPosition = (
  screenWidth: number,
  preferredPosition: TooltipPosition = 'top'
): TooltipPosition => {
  if (screenWidth < 768) {
    // 모바일에서는 상단/하단 위치 선호
    if (preferredPosition.includes('left') || preferredPosition.includes('right')) {
      return 'top';
    }
  }
  return preferredPosition;
};

// === 특수 툴팁 컴포넌트들 ===

/**
 * Info Tooltip Props
 */
export interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
  /** 정보 아이콘 크기 */
  iconSize?: 'sm' | 'md' | 'lg';
}

/**
 * Info Tooltip Component
 * 정보 표시용 특화 툴팁
 */
const InfoTooltip = React.forwardRef<HTMLDivElement, InfoTooltipProps>(
  ({ iconSize = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5',
    };
    
    return (
      <Tooltip
        ref={ref}
        trigger="hover"
        position="top"
        variant="default"
        size="sm"
        className={className}
        {...props}
      >
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full text-[var(--linear-color-text-tertiary)] hover:text-[var(--linear-color-text-primary)] transition-colors"
          aria-label="추가 정보"
        >
          <svg
            className={sizeClasses[iconSize]}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </Tooltip>
    );
  }
);

InfoTooltip.displayName = "LinearInfoTooltip";

/**
 * Shortcut Tooltip Props
 */
export interface ShortcutTooltipProps extends Omit<TooltipProps, 'content'> {
  /** 단축키 */
  shortcut: string | string[];
  /** 설명 */
  description?: string;
}

/**
 * Shortcut Tooltip Component
 * 키보드 단축키 표시용 툴팁
 */
const ShortcutTooltip = React.forwardRef<HTMLDivElement, ShortcutTooltipProps>(
  ({ shortcut, description, ...props }, ref) => {
    const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
    
    const content = (
      <div className="flex flex-col gap-1">
        {description && (
          <div className="text-sm">{description}</div>
        )}
        <div className="flex items-center gap-1">
          {shortcuts.map((key, index) => (
            <React.Fragment key={key}>
              {index > 0 && <span className="text-xs opacity-70">+</span>}
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--linear-color-surface-panel)] border border-[var(--linear-color-border-default)] rounded">
                {key}
              </kbd>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
    
    return (
      <Tooltip
        ref={ref}
        content={content}
        variant="default"
        size="sm"
        position="bottom"
        {...props}
      />
    );
  }
);

ShortcutTooltip.displayName = "LinearShortcutTooltip";

// === TooltipProvider 컴포넌트 ===

/**
 * Tooltip Provider Component
 * 툴팁 컨텍스트 제공자 (React Query와 유사한 패턴)
 */
export interface TooltipProviderProps {
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 기본 지연 시간 (모든 툴팁에 적용) */
  defaultDelay?: number;
  /** 기본 위치 (모든 툴팁에 적용) */
  defaultPosition?: TooltipPosition;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({ 
  children, 
  defaultDelay = 500, 
  defaultPosition = 'top' 
}) => {
  // 현재는 단순히 자식을 렌더링하지만, 향후 전역 툴팁 설정을 위해 확장 가능
  return <>{children}</>;
};

TooltipProvider.displayName = "LinearTooltipProvider";

// === TooltipTrigger & TooltipContent Components ===
// These are simple wrapper components for compatibility with other tooltip libraries

/**
 * Tooltip Trigger Component
 * 단순히 children을 래핑하는 컴포넌트 (호환성을 위해)
 */
export interface TooltipTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children, asChild = false }, ref) => {
    if (asChild) {
      return React.cloneElement(children, { ref });
    }
    return children;
  }
);

TooltipTrigger.displayName = "LinearTooltipTrigger";

/**
 * Tooltip Content Component
 * 단순히 children을 래핑하는 컴포넌트 (호환성을 위해)
 */
export interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);

TooltipContent.displayName = "LinearTooltipContent";

// === 내보내기 ===
export { 
  Tooltip, 
  InfoTooltip, 
  ShortcutTooltip, 
  TooltipProvider, 
  TooltipTrigger,
  TooltipContent,
  tooltipVariants 
};
export type { 
  TooltipProps, 
  InfoTooltipProps, 
  ShortcutTooltipProps, 
  TooltipProviderProps,
  TooltipTriggerProps,
  TooltipContentProps
};
export default Tooltip;

// === JSDoc 사용 예시 (Storybook 준비) ===
/**
 * @example
 * // 기본 툴팁
 * <Tooltip content="이것은 툴팁입니다">
 *   <button>호버해보세요</button>
 * </Tooltip>
 * 
 * // 클릭 툴팁
 * <Tooltip 
 *   content="클릭으로 열리는 툴팁" 
 *   trigger="click"
 *   position="bottom"
 * >
 *   <button>클릭해보세요</button>
 * </Tooltip>
 * 
 * // 커스텀 스타일 툴팁
 * <Tooltip
 *   content="중요한 정보입니다"
 *   variant="error"
 *   size="lg"
 *   showArrow={false}
 *   showDelay={200}
 * >
 *   <button>중요한 버튼</button>
 * </Tooltip>
 * 
 * // 정보 툴팁
 * <InfoTooltip 
 *   content="이 기능에 대한 자세한 설명입니다"
 *   iconSize="sm"
 * />
 * 
 * // 단축키 툴팁
 * <ShortcutTooltip
 *   shortcut={["Ctrl", "S"]}
 *   description="저장"
 * >
 *   <button>저장</button>
 * </ShortcutTooltip>
 * 
 * // 수동 제어 툴팁
 * <Tooltip
 *   content="수동으로 제어되는 툴팁"
 *   trigger="manual"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * >
 *   <button onClick={() => setIsOpen(!isOpen)}>
 *     수동 제어
 *   </button>
 * </Tooltip>
 */