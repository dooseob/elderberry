/**
 * 재사용 가능한 버튼 컴포넌트
 * 'elderberry' 테마 스타일 적용
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'care';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-elderberry-600 text-white hover:bg-elderberry-700 focus:ring-elderberry-500 shadow-sm',
    secondary: 'bg-elderberry-100 text-elderberry-800 hover:bg-elderberry-200 focus:ring-elderberry-500',
    outline: 'border-2 border-elderberry-600 text-elderberry-600 hover:bg-elderberry-50 focus:ring-elderberry-500',
    ghost: 'text-elderberry-600 hover:bg-elderberry-50 focus:ring-elderberry-500',
    care: 'bg-care-green text-white hover:bg-green-600 focus:ring-green-500 shadow-sm',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const isDisabled = disabled || loading;
  const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={combinedClasses}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      {loading && (
        <Loader2 
          className="w-4 h-4 mr-2 animate-spin" 
          aria-hidden="true" 
        />
      )}
      {children}
    </motion.button>
  );
};

export default Button;