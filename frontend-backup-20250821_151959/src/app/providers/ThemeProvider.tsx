/**
 * Enhanced Theme Provider - Linear Design System Integration
 * 다크/라이트 모드 및 Linear 테마 시스템 완전 통합
 * 
 * @version 2025.2.0
 * @features
 * - Linear 테마 프리셋 지원
 * - LCH 색공간 기반 테마 생성
 * - 시스템 테마 자동 감지
 * - 고대비 모드 지원
 * - 애니메이션 및 트랜지션
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

// Linear 테마 타입
export type LinearThemeVariant = 'light' | 'dark' | 'high-contrast-light' | 'high-contrast-dark';
export type LinearThemePreset = 
  | 'default-light'
  | 'default-dark' 
  | 'catppuccin-latte'
  | 'catppuccin-mocha'
  | 'github-light'
  | 'tokyo-night'
  | 'minimal-dark'
  | 'warm-light'
  | 'cyberpunk'
  | 'custom';

type Theme = LinearThemeVariant | 'system';

interface ThemeContextValue {
  theme: Theme;
  actualTheme: LinearThemeVariant;
  linearTheme: LinearThemePreset;
  setTheme: (theme: Theme) => void;
  setLinearTheme: (preset: LinearThemePreset) => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('theme') as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [actualTheme, setActualTheme] = useState<LinearThemeVariant>('light');
  const [linearTheme, setLinearTheme] = useState<LinearThemePreset>('default-light');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // 시스템 테마 및 접근성 설정 감지
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateActualTheme = () => {
      if (theme === 'system') {
        const isDark = darkModeQuery.matches;
        const isHC = highContrastQuery.matches;
        
        if (isHC) {
          setActualTheme(isDark ? 'high-contrast-dark' : 'high-contrast-light');
        } else {
          setActualTheme(isDark ? 'dark' : 'light');
        }
      } else {
        setActualTheme(theme as LinearThemeVariant);
      }
    };

    const updateHighContrast = () => {
      setIsHighContrast(highContrastQuery.matches);
    };

    const updateReducedMotion = () => {
      setIsReducedMotion(reducedMotionQuery.matches);
    };

    updateActualTheme();
    updateHighContrast();
    updateReducedMotion();
    
    darkModeQuery.addEventListener('change', updateActualTheme);
    highContrastQuery.addEventListener('change', updateHighContrast);
    reducedMotionQuery.addEventListener('change', updateReducedMotion);
    
    return () => {
      darkModeQuery.removeEventListener('change', updateActualTheme);
      highContrastQuery.removeEventListener('change', updateHighContrast);
      reducedMotionQuery.removeEventListener('change', updateReducedMotion);
    };
  }, [theme]);

  // DOM 클래스 및 data-theme 속성 적용
  useEffect(() => {
    const root = document.documentElement;
    
    // 기존 클래스 제거
    root.classList.remove('light', 'dark', 'high-contrast-light', 'high-contrast-dark');
    
    // 새 클래스 추가
    root.classList.add(actualTheme);
    
    // data-theme 속성 설정 (Linear 테마 시스템용)
    root.setAttribute('data-theme', actualTheme);
    
    // Linear 테마 프리셋 적용
    if (linearTheme !== 'custom') {
      root.setAttribute('data-linear-theme', linearTheme);
    }
    
    // 접근성 클래스
    if (isHighContrast) {
      root.classList.add('theme-high-contrast');
    } else {
      root.classList.remove('theme-high-contrast');
    }
    
    if (isReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [actualTheme, linearTheme, isHighContrast, isReducedMotion]);

  // 테마 변경 함수
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // Linear 테마 설정 함수
  const handleSetLinearTheme = (preset: LinearThemePreset) => {
    setLinearTheme(preset);
    try {
      localStorage.setItem('linear-theme', preset);
    } catch (error) {
      console.warn('Failed to save Linear theme to localStorage:', error);
    }
  };

  // 고대비 모드 토글
  const handleToggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  // 모션 감소 토글
  const handleToggleReducedMotion = () => {
    setIsReducedMotion(prev => !prev);
  };

  const value: ThemeContextValue = {
    theme,
    actualTheme,
    linearTheme,
    setTheme: handleSetTheme,
    setLinearTheme: handleSetLinearTheme,
    isHighContrast,
    toggleHighContrast: handleToggleHighContrast,
    isReducedMotion,
    toggleReducedMotion: handleToggleReducedMotion,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};