/**
 * 테마 토글 컴포넌트
 * 라이트/다크/시스템 모드 전환 기능
 */
import React from 'react';
import { Sun, Moon, Monitor } from '../../components/icons/LucideIcons';
import { useTheme, Theme } from '../../hooks/useTheme';
import Button from './Button';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'button', 
  className = '' 
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themeOptions: { value: Theme; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'light', label: '라이트 모드', icon: Sun },
    { value: 'dark', label: '다크 모드', icon: Moon },
    { value: 'system', label: '시스템 설정', icon: Monitor },
  ];

  if (variant === 'button') {
    const currentIcon = resolvedTheme === 'dark' ? Moon : Sun;
    const IconComponent = currentIcon;

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={className}
        aria-label={`${resolvedTheme === 'dark' ? '라이트' : '다크'} 모드로 전환`}
      >
        <IconComponent className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="
          appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
          rounded-lg px-3 py-2 pr-8 text-sm
          focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500
          dark:text-gray-100
        "
        aria-label="테마 선택"
      >
        {themeOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      
      {/* 화살표 아이콘 */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default ThemeToggle;