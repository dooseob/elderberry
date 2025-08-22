/**
 * 조건부 애니메이션 래퍼
 * 설정에 따라 Framer Motion 또는 일반 HTML 요소를 렌더링
 */
import React, { lazy, Suspense, forwardRef, useMemo } from 'react';
import { animationManager, withAnimation } from '../../utils/animationConfig';

// Framer Motion 동적 import
import { motion, AnimatePresence } from 'framer-motion';

// 기본 HTML 요소 래퍼
const StaticElement = forwardRef<HTMLElement, any>(({ 
  as: Component = 'div', 
  children, 
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props 
}, ref) => {
  return (
    <Component
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </Component>
  );
});

StaticElement.displayName = 'StaticElement';

// 애니메이션 Fallback 컴포넌트
const AnimationFallback: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  fallbackClassName?: string;
}> = ({ children, className, fallbackClassName }) => (
  <div className={`${className || ''} ${fallbackClassName || 'fade-in'}`}>
    {children}
  </div>
);

// Motion 컴포넌트 Props 타입
interface MotionProps {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  
  // Framer Motion props
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  
  // CSS Fallback props
  fallbackClassName?: string;
  enableCSSFallback?: boolean;
}

/**
 * 조건부 Motion 컴포넌트
 * 애니메이션 설정에 따라 Framer Motion 또는 CSS 애니메이션 사용
 */
export const ConditionalMotion = forwardRef<HTMLElement, MotionProps>(({
  as = 'div',
  children,
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  initial,
  animate,
  exit,
  transition,
  variants,
  whileHover,
  whileTap,
  fallbackClassName,
  enableCSSFallback = true,
  ...props
}, ref) => {
  const shouldUseAnimation = useMemo(() => 
    animationManager.isEnabled() && animationManager.allowComplexAnimations(),
    []
  );

  // 애니메이션이 비활성화된 경우 정적 요소 반환
  if (!shouldUseAnimation) {
    const cssClassName = enableCSSFallback && fallbackClassName 
      ? `${className || ''} ${fallbackClassName}` 
      : className;

    return (
      <StaticElement
        ref={ref}
        as={as}
        className={cssClassName}
        style={style}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        {children}
      </StaticElement>
    );
  }

  // Framer Motion 사용
  try {
    const MotionComponent = motion[as as keyof typeof motion];
    
    // motion에서 해당 엘리먼트를 지원하지 않는 경우 motion.div 사용
    if (!MotionComponent) {
      console.warn(`Motion component for '${as}' not found, falling back to motion.div`);
      return (
        <motion.div
          ref={ref}
          className={className}
          style={style}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          initial={withAnimation(initial)}
          animate={withAnimation(animate)}
          exit={withAnimation(exit)}
          transition={withAnimation(transition)}
          variants={withAnimation(variants)}
          whileHover={withAnimation(whileHover)}
          whileTap={withAnimation(whileTap)}
          {...props}
        >
          {children}
        </motion.div>
      );
    }
    
    return React.createElement(MotionComponent, {
      ref,
      className,
      style,
      onClick,
      onMouseEnter,
      onMouseLeave,
      initial: withAnimation(initial),
      animate: withAnimation(animate),
      exit: withAnimation(exit),
      transition: withAnimation(transition),
      variants: withAnimation(variants),
      whileHover: withAnimation(whileHover),
      whileTap: withAnimation(whileTap),
      ...props
    }, children);
  } catch (error) {
    console.error('ConditionalMotion error:', error);
    // 에러 발생 시 정적 엘리먼트로 폴백
    return (
      <StaticElement
        ref={ref}
        as={as}
        className={className}
        style={style}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        {children}
      </StaticElement>
    );
  }
});

ConditionalMotion.displayName = 'ConditionalMotion';

/**
 * AnimatePresence 조건부 래퍼
 */
export const ConditionalAnimatePresence: React.FC<{
  children: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
}> = ({ children, mode, initial }) => {
  const shouldUseAnimation = useMemo(() => 
    animationManager.isEnabled(),
    []
  );

  if (!shouldUseAnimation) {
    return <>{children}</>;
  }

  return React.createElement(AnimatePresence, {
    mode,
    initial: withAnimation(initial, false)
  }, children);
};

/**
 * 사전 정의된 애니메이션 프리셋
 */
export const AnimationPresets = {
  // 드롭다운 메뉴
  dropdown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
    fallbackClassName: 'dropdown-enter'
  },
  
  // 페이드인
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
    fallbackClassName: 'fade-in'
  },
  
  // 스케일인
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 },
    fallbackClassName: 'scale-in'
  },
  
  // 슬라이드업
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 },
    fallbackClassName: 'slide-up'
  },
  
  // 호버 효과
  hover: {
    whileHover: { y: -2 },
    transition: { duration: 0.2 },
    fallbackClassName: 'hover-lift'
  }
};

/**
 * 프리셋 기반 Motion 컴포넌트
 */
export const MotionDropdown = (props: Omit<MotionProps, keyof typeof AnimationPresets.dropdown>) => (
  <ConditionalMotion {...AnimationPresets.dropdown} {...props} />
);

export const MotionFadeIn = (props: Omit<MotionProps, keyof typeof AnimationPresets.fadeIn>) => (
  <ConditionalMotion {...AnimationPresets.fadeIn} {...props} />
);

export const MotionScaleIn = (props: Omit<MotionProps, keyof typeof AnimationPresets.scaleIn>) => (
  <ConditionalMotion {...AnimationPresets.scaleIn} {...props} />
);

export const MotionSlideUp = (props: Omit<MotionProps, keyof typeof AnimationPresets.slideUp>) => (
  <ConditionalMotion {...AnimationPresets.slideUp} {...props} />
);

export const MotionHover = (props: Omit<MotionProps, keyof typeof AnimationPresets.hover>) => (
  <ConditionalMotion {...AnimationPresets.hover} {...props} />
);

export default ConditionalMotion;