/**
 * 재사용 가능한 버튼 컴포넌트
 * 'elderberry' 테마 스타일 적용 + shadcn/ui 호환
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from 'framer-motion';
import { Loader2 } from '../icons/LucideIcons';
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-elderberry-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // 기존 엘더베리 스타일 유지
        primary: 'bg-elderberry-600 text-white hover:bg-elderberry-700 focus:ring-elderberry-500 shadow-sm rounded-lg',
        care: 'bg-care-green text-white hover:bg-green-600 focus:ring-green-500 shadow-sm rounded-lg',
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 공통 ButtonProps 타입을 확장하여 사용
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, fullWidth = false, children, disabled, 'aria-label': ariaLabel, ...props }, ref) => {
    const isDisabled = disabled || loading
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // 로딩 상태일 때 aria-label 자동 설정
    const computedAriaLabel = loading && !ariaLabel ? `로딩 중...` : ariaLabel;
    
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }), widthClasses)}
        ref={ref}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.1 }}
        aria-label={computedAriaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <Loader2 
            className="w-4 h-4 mr-2 animate-spin" 
            aria-hidden="true" 
          />
        )}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button;