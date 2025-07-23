/**
 * 재사용 가능한 카드 컴포넌트
 * 'elderberry' 테마 스타일 적용
 */
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  hover = false,
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-xl border border-elderberry-100';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const interactiveClasses = onClick 
    ? 'cursor-pointer transition-all duration-200'
    : '';
    
  const hoverClasses = hover 
    ? 'hover:shadow-lg hover:border-elderberry-200 hover:-translate-y-1'
    : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${interactiveClasses}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  } : {};

  return (
    <CardComponent
      className={combinedClasses}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </CardComponent>
  );
};

// === 카드 서브컴포넌트들 ===

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`border-b border-elderberry-100 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '' 
}) => (
  <h3 className={`text-lg font-semibold text-elderberry-900 ${className}`}>
    {children}
  </h3>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  children, 
  className = '' 
}) => (
  <p className={`text-sm text-elderberry-600 mt-1 ${className}`}>
    {children}
  </p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={className}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`border-t border-elderberry-100 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);

export default Card;