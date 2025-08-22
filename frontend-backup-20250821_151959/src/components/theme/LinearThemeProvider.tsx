/**
 * Linear Design System Theme Provider
 * 중앙 집중식 테마 관리 시스템
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useLinearTheme, LinearThemeConfig, LinearThemeState } from '../../hooks/useLinearTheme';

// Linear Theme Context
interface LinearThemeContextValue extends LinearThemeState {
  setTheme: (themeName: string) => void;
  toggleHighContrast: () => void;
  addCustomTheme: (themeName: string, themeConfig: LinearThemeConfig) => void;
  generateThemeFromLCH: (
    name: string,
    baseLCH: [number, number, number, number],
    accentLCH: [number, number, number, number],
    contrast?: number
  ) => LinearThemeConfig;
  detectSystemTheme: () => void;
  getCurrentThemeConfig: () => LinearThemeConfig | undefined;
  getThemeList: () => string[];
  exportTheme: (themeName: string) => string | null;
  importTheme: (themeJson: string) => string | null;
}

const LinearThemeContext = createContext<LinearThemeContextValue | null>(null);

// Hook for accessing Linear Theme
export const useLinearThemeContext = () => {
  const context = useContext(LinearThemeContext);
  if (!context) {
    throw new Error('useLinearThemeContext must be used within LinearThemeProvider');
  }
  return context;
};

// Linear Theme Provider Props
interface LinearThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystemTheme?: boolean;
  enableHighContrast?: boolean;
  customThemes?: Record<string, LinearThemeConfig>;
}

export const LinearThemeProvider: React.FC<LinearThemeProviderProps> = ({
  children,
  defaultTheme = 'default-light',
  enableSystemTheme = true,
  enableHighContrast = true,
  customThemes = {},
}) => {
  const themeHook = useLinearTheme();

  // 커스텀 테마 초기화
  useEffect(() => {
    Object.entries(customThemes).forEach(([name, config]) => {
      themeHook.addCustomTheme(name, config);
    });
  }, [customThemes, themeHook.addCustomTheme]);

  // 시스템 테마 감지 (활성화된 경우)
  useEffect(() => {
    if (enableSystemTheme && themeHook.currentTheme === 'system') {
      themeHook.detectSystemTheme();
    }
  }, [enableSystemTheme, themeHook.currentTheme, themeHook.detectSystemTheme]);

  // 고대비 모드 접근성 지원
  useEffect(() => {
    if (!enableHighContrast) return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = () => {
      if (mediaQuery.matches && !themeHook.isHighContrast) {
        themeHook.toggleHighContrast();
      }
    };

    handleContrastChange(); // 초기 체크
    mediaQuery.addEventListener('change', handleContrastChange);
    
    return () => mediaQuery.removeEventListener('change', handleContrastChange);
  }, [enableHighContrast, themeHook.isHighContrast, themeHook.toggleHighContrast]);

  // 컨텍스트 값 구성
  const contextValue: LinearThemeContextValue = {
    currentTheme: themeHook.currentTheme,
    themes: themeHook.themes,
    isDark: themeHook.isDark,
    isHighContrast: themeHook.isHighContrast,
    setTheme: themeHook.setTheme,
    toggleHighContrast: themeHook.toggleHighContrast,
    addCustomTheme: themeHook.addCustomTheme,
    generateThemeFromLCH: themeHook.generateThemeFromLCH,
    detectSystemTheme: themeHook.detectSystemTheme,
    getCurrentThemeConfig: themeHook.getCurrentThemeConfig,
    getThemeList: themeHook.getThemeList,
    exportTheme: themeHook.exportTheme,
    importTheme: themeHook.importTheme,
  };

  return (
    <LinearThemeContext.Provider value={contextValue}>
      <div className="linear-theme-root">
        {children}
      </div>
    </LinearThemeContext.Provider>
  );
};

// Theme Selector Component
interface ThemeSelectorProps {
  className?: string;
  showHighContrast?: boolean;
  compact?: boolean;
}

export const LinearThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  showHighContrast = true,
  compact = false,
}) => {
  const { currentTheme, themes, isHighContrast, setTheme, toggleHighContrast, getThemeList } = useLinearThemeContext();
  const themeList = getThemeList();

  return (
    <div className={`linear-theme-selector ${className}`}>
      {/* 테마 선택 */}
      <div className="theme-selection">
        <label className="block text-sm font-medium text-[var(--linear-color-text-primary)] mb-2">
          테마 선택
        </label>
        <select
          value={currentTheme}
          onChange={(e) => setTheme(e.target.value)}
          className="linear-input w-full"
        >
          {themeList.map((themeName) => (
            <option key={themeName} value={themeName}>
              {themes[themeName]?.name || themeName}
            </option>
          ))}
        </select>
      </div>

      {/* 고대비 모드 토글 */}
      {showHighContrast && (
        <div className="high-contrast-toggle mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isHighContrast}
              onChange={toggleHighContrast}
              className="w-4 h-4 text-[var(--linear-color-accent)] bg-[var(--linear-color-surface-input)] border-[var(--linear-color-border-input)] rounded focus:ring-[var(--linear-color-accent)]"
            />
            <span className="text-sm text-[var(--linear-color-text-primary)]">
              고대비 모드
            </span>
          </label>
        </div>
      )}

      {/* 컴팩트 모드가 아닌 경우 테마 미리보기 */}
      {!compact && (
        <div className="theme-preview mt-4 p-4 linear-card">
          <div className="text-sm text-[var(--linear-color-text-secondary)] mb-2">
            미리보기
          </div>
          <div className="space-y-2">
            <div className="w-full h-8 bg-[var(--linear-color-accent)] rounded-[var(--linear-radius-small)]"></div>
            <div className="flex gap-2">
              <div className="flex-1 h-6 bg-[var(--linear-color-surface-elevated)] rounded-[var(--linear-radius-small)]"></div>
              <div className="flex-1 h-6 bg-[var(--linear-color-surface-panel)] rounded-[var(--linear-radius-small)]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Theme Import/Export Component
export const LinearThemeManager: React.FC = () => {
  const { exportTheme, importTheme, currentTheme, addCustomTheme } = useLinearThemeContext();
  const [importJson, setImportJson] = React.useState('');
  const [exportedTheme, setExportedTheme] = React.useState('');

  const handleExport = () => {
    const exported = exportTheme(currentTheme);
    if (exported) {
      setExportedTheme(exported);
    }
  };

  const handleImport = () => {
    try {
      const themeName = importTheme(importJson);
      if (themeName) {
        alert(`테마 "${themeName}"가 성공적으로 가져와졌습니다.`);
        setImportJson('');
      } else {
        alert('테마 가져오기에 실패했습니다. JSON 형식을 확인해주세요.');
      }
    } catch (error) {
      alert('테마 가져오기 중 오류가 발생했습니다.');
      console.error('Theme import error:', error);
    }
  };

  return (
    <div className="linear-theme-manager space-y-6">
      {/* 테마 내보내기 */}
      <div className="export-section">
        <h3 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          테마 내보내기
        </h3>
        <button
          onClick={handleExport}
          className="linear-button-primary mb-4"
        >
          현재 테마 내보내기
        </button>
        {exportedTheme && (
          <textarea
            value={exportedTheme}
            readOnly
            className="linear-input w-full h-32 font-mono text-xs"
            placeholder="내보낸 테마 JSON이 여기에 표시됩니다..."
          />
        )}
      </div>

      {/* 테마 가져오기 */}
      <div className="import-section">
        <h3 className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-4">
          테마 가져오기
        </h3>
        <textarea
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          className="linear-input w-full h-32 font-mono text-xs mb-4"
          placeholder="테마 JSON을 여기에 붙여넣으세요..."
        />
        <button
          onClick={handleImport}
          disabled={!importJson.trim()}
          className="linear-button-secondary"
        >
          테마 가져오기
        </button>
      </div>
    </div>
  );
};

export default LinearThemeProvider;