/**
 * Simplified useLinearTheme Hook - Emergency Fallback
 * 긴급 상황용 간소화된 테마 훅
 */

export const useLinearTheme = () => {
  return {
    isReducedMotion: false,
    isDarkMode: false,
    isHighContrast: false,
    currentTheme: null,
    currentThemeId: 'default-light',
    setTheme: () => {},
    toggleDarkMode: () => {},
  };
};

export default useLinearTheme;