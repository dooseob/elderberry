/**
 * Linear Design System Modal Component
 * 완전한 Linear 테마 시스템 통합 모달 컴포넌트
 * 
 * @version 2025.1.0
 * @author UI/UX 전문가 (Linear Theme System)
 * 
 * Features:
 * - Linear 모달 스타일 완전 적용
 * - Header, Content, Footer 영역 지원
 * - 다양한 모달 크기 (sm, md, lg, xl, full)
 * - 오버레이 및 백드롭 커스터마이징
 * - ESC 키 및 오버레이 클릭으로 닫기
 * - 포커스 트랩 및 접근성 완전 지원
 * - 애니메이션 및 트랜지션 효과
 * - useLinearTheme 훅 활용
 * - Portal을 통한 렌더링
 * - TypeScript 완전 타입 정의
 * - 스크롤 잠금 기능
 * - 중첩 모달 지원
 * - 로딩 및 에러 상태 지원
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { X } from 'lucide-react';
import { cn } from "../../lib/utils";
import { useLinearTheme } from '../../hooks/useLinearTheme';

// Linear Modal Variants (Class Variance Authority 기반)
const modalVariants = cva(
  // 기본 클래스 - Linear 디자인 시스템 준수
  [
    "relative bg-[var(--linear-color-surface-modal)] text-[var(--linear-color-text-primary)]",
    "border border-[var(--linear-color-border-default)]",
    "rounded-[var(--linear-radius-large)]",
    "shadow-[var(--linear-shadow-modal)]",
    "outline-none",
    "max-h-[90vh] overflow-hidden",
    "flex flex-col",
  ],
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        md: "w-full max-w-md", 
        lg: "w-full max-w-lg",
        xl: "w-full max-w-2xl",
        "2xl": "w-full max-w-4xl",
        "3xl": "w-full max-w-6xl",
        full: "w-[95vw] h-[90vh]",
      },
      
      position: {
        center: "mx-auto my-auto",
        top: "mx-auto mt-[10vh]",
        bottom: "mx-auto mb-[10vh] mt-auto",
      },
    },
    defaultVariants: {
      size: "md",
      position: "center",
    },
  }
);

// Overlay Variants
const overlayVariants = cva([
  "fixed inset-0 z-50",
  "bg-black/50 backdrop-blur-sm",
  "flex items-center justify-center p-4",
]);

/**
 * Modal Props
 * 완전한 TypeScript 타입 정의
 */
export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  /** 모달 열림/닫힘 상태 */
  open: boolean;
  
  /** 모달 닫기 이벤트 핸들러 */
  onClose: () => void;
  
  /** 모달 제목 */
  title?: string;
  
  /** 모달 설명 */
  description?: string;
  
  /** 헤더 영역 커스터마이징 */
  headerContent?: React.ReactNode;
  
  /** 푸터 영역 커스터마이징 */
  footerContent?: React.ReactNode;
  
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  
  /** ESC 키로 닫기 허용 */
  closeOnEsc?: boolean;
  
  /** 오버레이 클릭으로 닫기 허용 */
  closeOnOverlayClick?: boolean;
  
  /** 스크롤 잠금 */
  lockScroll?: boolean;
  
  /** 포커스 트랩 활성화 */
  trapFocus?: boolean;
  
  /** 애니메이션 활성화 */
  animation?: boolean;
  
  /** 초기 포커스 요소 */
  initialFocus?: React.RefObject<HTMLElement>;
  
  /** 복원 포커스 요소 */
  restoreFocus?: React.RefObject<HTMLElement>;
  
  /** 로딩 상태 */
  loading?: boolean;
  
  /** 에러 상태 */
  error?: boolean;
  
  /** 에러 메시지 */
  errorMessage?: string;
  
  /** Portal 컨테이너 */
  container?: Element | (() => Element | null) | null;
  
  /** 접근성: 모달 라벨 */
  'aria-label'?: string;
  
  /** 접근성: 모달 설명 */
  'aria-describedby'?: string;
  
  /** 접근성: 모달 라벨 ID */
  'aria-labelledby'?: string;
}

/**
 * Modal Context
 * 모달 상태 및 메서드 공유
 */
interface ModalContextValue {
  onClose: () => void;
  titleId: string;
  descriptionId: string;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('Modal 컴포넌트는 Modal 내부에서만 사용할 수 있습니다.');
  }
  return context;
};

/**
 * Focus Trap Hook
 * 모달 내부로 포커스 제한
 */
const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  active: boolean
) => {
  React.useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [active, containerRef]);
};

/**
 * Scroll Lock Hook
 * 모달 열림 시 배경 스크롤 잠금
 */
const useScrollLock = (lock: boolean) => {
  React.useEffect(() => {
    if (!lock) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
};

/**
 * Linear Modal Component
 * React.forwardRef 및 완전한 접근성 지원
 */
const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    children,
    className,
    open,
    onClose,
    size,
    position,
    title,
    description,
    headerContent,
    footerContent,
    showCloseButton = true,
    closeOnEsc = true,
    closeOnOverlayClick = true,
    lockScroll = true,
    trapFocus = true,
    animation = true,
    initialFocus,
    restoreFocus,
    loading = false,
    error = false,
    errorMessage = '오류가 발생했습니다.',
    container,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-labelledby': ariaLabelledBy,
    ...props
  }, ref) => {
    // Linear 테마 훅 사용
    const { isReducedMotion } = useLinearTheme();
    
    // 내부 참조
    const modalRef = React.useRef<HTMLDivElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);
    
    // ID 생성
    const titleId = React.useId();
    const descriptionId = React.useId();
    
    // 상태 계산
    const shouldAnimate = animation && !isReducedMotion;
    
    // 모달 컨텍스트 값
    const contextValue = React.useMemo(() => ({
      onClose,
      titleId,
      descriptionId,
    }), [onClose, titleId, descriptionId]);
    
    // 포커스 트랩 및 스크롤 잠금
    useFocusTrap(modalRef, open && trapFocus);
    useScrollLock(open && lockScroll);
    
    // ESC 키 처리
    React.useEffect(() => {
      if (!open || !closeOnEsc) return;
      
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }, [open, closeOnEsc, onClose]);
    
    // 오버레이 클릭 처리
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (!closeOnOverlayClick) return;
      if (e.target === overlayRef.current) {
        onClose();
      }
    };
    
    // 포커스 관리
    React.useEffect(() => {
      if (!open) return;
      
      // 초기 포커스 설정
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
      
      // 포커스 복원을 위한 현재 요소 저장
      const activeElement = document.activeElement as HTMLElement;
      
      return () => {
        if (restoreFocus?.current) {
          restoreFocus.current.focus();
        } else if (activeElement && activeElement !== document.body) {
          activeElement.focus();
        }
      };
    }, [open, initialFocus, restoreFocus]);
    
    // 로딩 스피너 렌더링
    const renderLoadingSpinner = () => (
      <div className="flex items-center justify-center p-[var(--linear-spacing-2xl)]">
        <div className="w-8 h-8 border-2 border-[var(--linear-color-accent)] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-[var(--linear-color-text-secondary)]">로딩 중...</span>
      </div>
    );
    
    // 에러 상태 렌더링
    const renderErrorState = () => (
      <div className="flex flex-col items-center justify-center p-[var(--linear-spacing-2xl)] text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-[var(--linear-color-error-bg)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--linear-color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
          </svg>
        </div>
        <p className="text-[var(--linear-color-error)] text-lg font-medium">{errorMessage}</p>
      </div>
    );
    
    // 모달 헤더 렌더링
    const renderHeader = () => {
      if (!title && !description && !headerContent && !showCloseButton) return null;
      
      return (
        <ModalHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <ModalTitle id={ariaLabelledBy || titleId}>
                  {title}
                </ModalTitle>
              )}
              {description && (
                <ModalDescription id={ariaDescribedBy || descriptionId}>
                  {description}
                </ModalDescription>
              )}
              {headerContent}
            </div>
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-4 p-2 -mt-2 -mr-2 text-[var(--linear-color-text-tertiary)] hover:text-[var(--linear-color-text-primary)] hover:bg-[var(--linear-color-surface-elevated)] rounded-[var(--linear-radius-medium)] transition-colors"
                aria-label="모달 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </ModalHeader>
      );
    };
    
    // 모달 푸터 렌더링
    const renderFooter = () => {
      if (!footerContent) return null;
      
      return (
        <ModalFooter>
          {footerContent}
        </ModalFooter>
      );
    };
    
    // 모달 컨텐츠 렌더링
    const renderContent = () => {
      if (loading) return renderLoadingSpinner();
      if (error) return renderErrorState();
      return children;
    };
    
    // 애니메이션 설정
    const overlayAnimation = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    };
    
    const modalAnimation = {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
      transition: { duration: 0.2, ease: "easeOut" }
    };
    
    // Portal 컨테이너 결정
    const portalContainer = React.useMemo(() => {
      if (container) {
        return typeof container === 'function' ? container() : container;
      }
      return typeof document !== 'undefined' ? document.body : null;
    }, [container]);
    
    if (!portalContainer) return null;
    
    const modalElement = (
      <AnimatePresence>
        {open && (
          <ModalContext.Provider value={contextValue}>
            <motion.div
              ref={overlayRef}
              className={overlayVariants()}
              onClick={handleOverlayClick}
              {...(shouldAnimate ? overlayAnimation : {})}
            >
              <motion.div
                ref={React.useMemo(() => {
                  return (node: HTMLDivElement) => {
                    if (ref) {
                      if (typeof ref === 'function') ref(node);
                      else ref.current = node;
                    }
                    modalRef.current = node;
                  };
                }, [ref])}
                className={cn(modalVariants({ size, position }), className)}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                aria-labelledby={!ariaLabel ? (ariaLabelledBy || (title ? titleId : undefined)) : undefined}
                aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
                onClick={(e) => e.stopPropagation()}
                {...(shouldAnimate ? modalAnimation : {})}
                {...props}
              >
                {/* 모달 헤더 */}
                {renderHeader()}
                
                {/* 모달 컨텐츠 */}
                <ModalContent>
                  {renderContent()}
                </ModalContent>
                
                {/* 모달 푸터 */}
                {renderFooter()}
              </motion.div>
            </motion.div>
          </ModalContext.Provider>
        )}
      </AnimatePresence>
    );
    
    return createPortal(modalElement, portalContainer);
  }
);

Modal.displayName = "LinearModal";

// === Modal 서브컴포넌트들 ===

/**
 * Modal Header Props
 */
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 헤더 경계선 */
  border?: boolean;
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, border = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex-shrink-0 px-[var(--linear-spacing-xl)] py-[var(--linear-spacing-lg)]",
        border && "border-b border-[var(--linear-color-border-subtle)]",
        className
      )}
      {...props}
    />
  )
);

/**
 * Modal Title Props
 */
export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** 제목 레벨 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** 제목 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, children, level = 2, size = 'lg', ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements;
    
    const sizeClasses = {
      sm: "text-lg font-[var(--linear-font-weight-semibold)]",
      md: "text-xl font-[var(--linear-font-weight-semibold)]",
      lg: "text-2xl font-[var(--linear-font-weight-bold)]",
      xl: "text-3xl font-[var(--linear-font-weight-bold)]",
    };
    
    return (
      <Component
        ref={ref}
        className={cn(
          "text-[var(--linear-color-text-primary)] leading-[var(--linear-line-height-tight)] tracking-tight",
          sizeClasses[size],
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
 * Modal Description Props
 */
export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** 설명 크기 */
  size?: 'sm' | 'md' | 'lg';
}

const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };
    
    return (
      <p
        ref={ref}
        className={cn(
          "text-[var(--linear-color-text-secondary)] leading-[var(--linear-line-height-normal)] mt-1",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * Modal Content Props
 */
export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 컨텐츠 패딩 */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** 스크롤 가능 */
  scrollable?: boolean;
}

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, padding = 'xl', scrollable = true, ...props }, ref) => {
    const paddingClasses = {
      none: "p-0",
      sm: "p-[var(--linear-spacing-sm)]",
      md: "p-[var(--linear-spacing-md)]",
      lg: "p-[var(--linear-spacing-lg)]",
      xl: "px-[var(--linear-spacing-xl)] py-[var(--linear-spacing-lg)]",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 text-[var(--linear-color-text-primary)]",
          paddingClasses[padding],
          scrollable && "overflow-y-auto",
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * Modal Footer Props
 */
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 푸터 정렬 */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** 경계선 */
  border?: boolean;
}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, justify = 'end', border = true, ...props }, ref) => {
    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0 flex items-center gap-[var(--linear-spacing-sm)] px-[var(--linear-spacing-xl)] py-[var(--linear-spacing-lg)]",
          justifyClasses[justify],
          border && "border-t border-[var(--linear-color-border-subtle)]",
          className
        )}
        {...props}
      />
    );
  }
);

// Display Names
ModalHeader.displayName = "LinearModalHeader";
ModalTitle.displayName = "LinearModalTitle";
ModalDescription.displayName = "LinearModalDescription";
ModalContent.displayName = "LinearModalContent";
ModalFooter.displayName = "LinearModalFooter";

// === 유틸리티 함수들 ===

/**
 * 모달 접근성 검증
 */
export const validateModalAccessibility = (props: ModalProps) => {
  const warnings: string[] = [];
  
  if (!props.title && !props['aria-label'] && !props['aria-labelledby']) {
    warnings.push('모달에는 title, aria-label, 또는 aria-labelledby 중 하나가 필요합니다.');
  }
  
  if (!props.onClose) {
    warnings.push('모달에는 닫기 기능(onClose)이 필요합니다.');
  }
  
  if (props.closeOnEsc === false && props.closeOnOverlayClick === false && !props.showCloseButton) {
    warnings.push('모달을 닫을 수 있는 방법이 없습니다. ESC 키, 오버레이 클릭, 또는 닫기 버튼 중 하나는 활성화되어야 합니다.');
  }
  
  return warnings;
};

/**
 * 화면 크기에 따른 최적 모달 크기 반환
 */
export const getOptimalModalSize = (screenWidth: number): ModalProps['size'] => {
  if (screenWidth < 640) return 'sm';
  if (screenWidth < 768) return 'md';
  if (screenWidth < 1024) return 'lg';
  if (screenWidth < 1280) return 'xl';
  return '2xl';
};

// === 특수 모달 컴포넌트들 ===

/**
 * Confirm Modal Props
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 버튼 스타일 */
  confirmVariant?: 'primary' | 'destructive' | 'warning';
  /** 확인 이벤트 핸들러 */
  onConfirm: () => void;
  /** 취소 이벤트 핸들러 */
  onCancel?: () => void;
}

/**
 * Confirm Modal Component
 * 확인 다이얼로그 특화 모달
 */
export const ConfirmModal = React.forwardRef<HTMLDivElement, ConfirmModalProps>(
  ({
    confirmText = '확인',
    cancelText = '취소',
    confirmVariant = 'primary',
    onConfirm,
    onCancel,
    onClose,
    ...props
  }, ref) => {
    const handleCancel = () => {
      onCancel?.();
      onClose();
    };
    
    const handleConfirm = () => {
      onConfirm();
      onClose();
    };
    
    return (
      <Modal
        ref={ref}
        onClose={onClose}
        size="sm"
        footerContent={
          <div className="flex gap-2 w-full justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-[var(--linear-color-text-primary)] bg-transparent border border-[var(--linear-color-border-default)] rounded-[var(--linear-radius-medium)] hover:bg-[var(--linear-color-surface-elevated)] transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button" 
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-[var(--linear-radius-medium)] transition-colors",
                confirmVariant === 'destructive' && "bg-[var(--linear-color-error)] text-white hover:brightness-110",
                confirmVariant === 'warning' && "bg-[var(--linear-color-warning)] text-white hover:brightness-110",
                confirmVariant === 'primary' && "bg-[var(--linear-color-accent)] text-[var(--linear-color-text-on-accent)] hover:bg-[var(--linear-color-accent-hover)]"
              )}
            >
              {confirmText}
            </button>
          </div>
        }
        {...props}
      />
    );
  }
);

ConfirmModal.displayName = "LinearConfirmModal";

// === 내보내기 ===
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  modalVariants,
  useModalContext,
};
export type {
  ModalProps,
  ModalHeaderProps,
  ModalTitleProps,
  ModalDescriptionProps,
  ModalContentProps,
  ModalFooterProps,
  ConfirmModalProps,
};
export default Modal;

// === JSDoc 사용 예시 (Storybook 준비) ===
/**
 * @example
 * // 기본 모달
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="모달 제목">
 *   모달 내용이 여기에 들어갑니다.
 * </Modal>
 * 
 * // 커스텀 헤더/푸터 모달
 * <Modal 
 *   open={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   size="lg"
 *   headerContent={<div>커스텀 헤더</div>}
 *   footerContent={
 *     <div className="flex gap-2">
 *       <button onClick={() => setIsOpen(false)}>취소</button>
 *       <button onClick={handleSave}>저장</button>
 *     </div>
 *   }
 * >
 *   모달 내용...
 * </Modal>
 * 
 * // 확인 다이얼로그
 * <ConfirmModal
 *   open={isConfirmOpen}
 *   onClose={() => setIsConfirmOpen(false)}
 *   onConfirm={handleDelete}
 *   title="삭제 확인"
 *   description="정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
 *   confirmText="삭제"
 *   confirmVariant="destructive"
 * />
 * 
 * // 서브컴포넌트 사용
 * <Modal open={isOpen} onClose={() => setIsOpen(false)}>
 *   <ModalHeader>
 *     <ModalTitle>커스텀 제목</ModalTitle>
 *     <ModalDescription>상세 설명</ModalDescription>
 *   </ModalHeader>
 *   <ModalContent>
 *     내용...
 *   </ModalContent>
 *   <ModalFooter>
 *     푸터 내용...
 *   </ModalFooter>
 * </Modal>
 */