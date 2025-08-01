/**
 * Linear Theme System - 테스트 플레이그라운드
 * 모든 테마의 작동 상태를 검증하는 종합 테스트 컴포넌트
 * 
 * @version 2025.1.0
 * @author 통합 테스트 전문가 (Linear Theme System)
 */

import React, { useState, useEffect } from 'react';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import type { ThemePreview, LCHColor } from '../../types/theme';

// 테스트용 샘플 컴포넌트들
const TestCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="linear-card p-4 mb-4">
    <h3 className="linear-text-primary font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const TestButton: React.FC<{ variant: 'primary' | 'secondary' | 'ghost'; children: React.ReactNode }> = ({ 
  variant, 
  children 
}) => (
  <button className={`linear-button-${variant} mr-2 mb-2`}>
    {children}
  </button>
);

const TestInput: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <input 
    className="linear-input mb-2" 
    placeholder={placeholder}
    defaultValue="테스트 입력값"
  />
);

const TestBadge: React.FC<{ variant?: 'default' | 'success' | 'warning' | 'error'; children: React.ReactNode }> = ({ 
  variant = 'default', 
  children 
}) => (
  <span className={`linear-badge${variant !== 'default' ? ` linear-badge-${variant}` : ''} mr-2 mb-2`}>
    {children}
  </span>
);

// 테마 정보 표시 컴포넌트
const ThemeInfo: React.FC<{ theme: ThemePreview }> = ({ theme }) => {
  const { analyzeTheme, getCurrentTheme } = useLinearTheme();
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const result = analyzeTheme(theme.id);
    setAnalysis(result);
  }, [theme.id, analyzeTheme]);

  const currentTheme = getCurrentTheme();

  return (
    <div className="linear-surface-panel p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="linear-text-primary font-medium">{theme.name}</h4>
        <div className="flex space-x-2">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: theme.previewColors.background }}
            title="Background"
          />
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: theme.previewColors.accent }}
            title="Accent"
          />
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: theme.previewColors.foreground }}
            title="Foreground"
          />
        </div>
      </div>
      
      <div className="text-sm space-y-1">
        <p className="linear-text-secondary">
          <span className="font-medium">Category:</span> {theme.category} | 
          <span className="font-medium"> Variant:</span> {theme.variant}
        </p>
        
        {analysis && (
          <>
            <p className="linear-text-secondary">
              <span className="font-medium">Contrast:</span> {analysis.contrastRatio.toFixed(1)}:1 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                analysis.accessibilityGrade === 'AAA' ? 'bg-green-100 text-green-800' :
                analysis.accessibilityGrade === 'AA' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {analysis.accessibilityGrade}
              </span>
            </p>
            <p className="linear-text-secondary">
              <span className="font-medium">Harmony:</span> {analysis.harmony} | 
              <span className="font-medium"> Temperature:</span> {analysis.temperature} |
              <span className="font-medium"> Saturation:</span> {analysis.saturationLevel}
            </p>
          </>
        )}
        
        {currentTheme && (
          <p className="linear-text-tertiary text-xs">
            Base LCH: [{currentTheme.core.base.map(v => v.toFixed(1)).join(', ')}] | 
            Accent LCH: [{currentTheme.core.accent.map(v => v.toFixed(1)).join(', ')}]
          </p>
        )}
      </div>
    </div>
  );
};

// 색상 팔레트 표시 컴포넌트
const ColorPalette: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {/* Surface Colors */}
      <div className="linear-surface p-3 rounded text-center text-xs">
        <div className="linear-text-primary">Background</div>
      </div>
      <div className="linear-surface-elevated p-3 rounded text-center text-xs">
        <div className="linear-text-primary">Elevated</div>
      </div>
      <div className="linear-surface-panel p-3 rounded text-center text-xs">
        <div className="linear-text-primary">Panel</div>
      </div>
      <div className="linear-accent p-3 rounded text-center text-xs">
        <div className="linear-text-on-accent">Accent</div>
      </div>
      
      {/* Text Colors */}
      <div className="linear-surface-elevated p-3 rounded text-center text-xs">
        <div className="linear-text-primary">Primary</div>
        <div className="linear-text-secondary">Secondary</div>
        <div className="linear-text-tertiary">Tertiary</div>
      </div>
      <div className="linear-surface-elevated p-3 rounded text-center text-xs">
        <div className="linear-text-accent">Accent Text</div>
      </div>
      
      {/* State Colors */}
      <div className="linear-success p-3 rounded text-center text-xs">Success</div>
      <div className="linear-warning p-3 rounded text-center text-xs">Warning</div>
      <div className="linear-error p-3 rounded text-center text-xs">Error</div>
      <div className="linear-info p-3 rounded text-center text-xs">Info</div>
    </div>
  );
};

// 메인 테스트 플레이그라운드 컴포넌트
export const ThemeTestPlayground: React.FC = () => {
  const {
    currentThemeId,
    themePreview,
    setTheme,
    previewTheme,
    cancelPreview,
    isPreviewMode,
    previewThemeId,
    toggleDarkMode,
    toggleHighContrast,
    isHighContrast,
    randomTheme,
    createThemeFromColors,
    sessionStats,
    loading,
    error,
    history,
  } = useLinearTheme();

  const [testCustomTheme, setTestCustomTheme] = useState({
    name: 'Test Custom Theme',
    baseL: 50,
    baseC: 10,
    baseH: 220,
    accentL: 65,
    accentC: 80,
    accentH: 280,
    contrast: 35,
  });

  // 커스텀 테마 생성 테스트
  const handleCreateCustomTheme = async () => {
    try {
      const baseColor: LCHColor = [testCustomTheme.baseL, testCustomTheme.baseC, testCustomTheme.baseH, 1];
      const accentColor: LCHColor = [testCustomTheme.accentL, testCustomTheme.accentC, testCustomTheme.accentH, 1];
      
      const themeId = await createThemeFromColors(
        testCustomTheme.name,
        baseColor,
        accentColor,
        testCustomTheme.contrast
      );
      
      console.log('Custom theme created:', themeId);
      setTheme(themeId);
    } catch (error) {
      console.error('Failed to create custom theme:', error);
    }
  };

  if (loading) {
    return (
      <div className="linear-surface p-8 text-center">
        <div className="linear-text-primary">테마 시스템 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="linear-error p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">테마 시스템 오류</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="linear-main-content max-w-6xl mx-auto p-6 space-y-6">
      <div className="linear-card p-6">
        <h1 className="linear-text-primary text-2xl font-bold mb-4">
          Linear Theme System - Test Playground
        </h1>
        <p className="linear-text-secondary mb-6">
          모든 테마의 작동 상태를 확인하고 새로운 테마를 실험해볼 수 있는 테스트 환경입니다.
        </p>

        {/* 현재 테마 정보 */}
        <div className="linear-gradient-accent p-4 rounded-lg mb-6">
          <h2 className="linear-text-on-accent text-lg font-semibold mb-2">
            현재 테마: {currentThemeId}
            {isPreviewMode && (
              <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">
                프리뷰 모드: {previewThemeId}
              </span>
            )}
          </h2>
          <div className="linear-text-on-accent/80 text-sm">
            고대비 모드: {isHighContrast ? '활성' : '비활성'} | 
            세션 변경 횟수: {sessionStats.sessionChanges} | 
            총 테마 수: {sessionStats.totalThemes}
          </div>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TestButton variant="primary" onClick={toggleDarkMode}>
            다크/라이트 토글
          </TestButton>
          <TestButton variant="secondary" onClick={toggleHighContrast}>
            고대비 토글
          </TestButton>
          <TestButton variant="ghost" onClick={randomTheme}>
            랜덤 테마
          </TestButton>
          {isPreviewMode && (
            <TestButton variant="secondary" onClick={cancelPreview}>
              프리뷰 취소
            </TestButton>
          )}
        </div>
      </div>

      {/* 색상 팔레트 테스트 */}
      <TestCard title="색상 팔레트 테스트">
        <ColorPalette />
        <div className="linear-separator" />
        <p className="linear-text-secondary text-sm">
          각 색상이 올바르게 표시되고 있는지 확인하세요. 텍스트는 배경과 충분한 대비를 가져야 합니다.
        </p>
      </TestCard>

      {/* UI 컴포넌트 테스트 */}
      <TestCard title="UI 컴포넌트 테스트">
        <div className="space-y-4">
          <div>
            <h4 className="linear-text-primary font-medium mb-2">버튼</h4>
            <TestButton variant="primary">Primary Button</TestButton>
            <TestButton variant="secondary">Secondary Button</TestButton>
            <TestButton variant="ghost">Ghost Button</TestButton>
          </div>

          <div>
            <h4 className="linear-text-primary font-medium mb-2">입력 필드</h4>
            <TestInput placeholder="일반 입력 필드" />
            <textarea 
              className="linear-input linear-textarea w-full" 
              placeholder="텍스트 영역"
              defaultValue="여러 줄 텍스트 입력을 위한 텍스트 영역입니다."
              rows={3}
            />
          </div>

          <div>
            <h4 className="linear-text-primary font-medium mb-2">배지</h4>
            <TestBadge>Default</TestBadge>
            <TestBadge variant="success">Success</TestBadge>
            <TestBadge variant="warning">Warning</TestBadge>
            <TestBadge variant="error">Error</TestBadge>
          </div>
        </div>
      </TestCard>

      {/* 테마 선택기 */}
      <TestCard title="테마 선택기">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {themePreview.map((theme) => (
            <div key={theme.id} className="relative">
              <button
                onClick={() => setTheme(theme.id)}
                onMouseEnter={() => previewTheme(theme.id, { duration: 2000 })}
                onMouseLeave={cancelPreview}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  currentThemeId === theme.id
                    ? 'border-accent linear-gradient-accent text-white'
                    : 'border-subtle hover:border-default linear-surface-elevated'
                }`}
                style={{
                  background: currentThemeId !== theme.id ? 
                    `linear-gradient(135deg, ${theme.previewColors.background} 0%, ${theme.previewColors.accent}20 100%)` :
                    undefined
                }}
              >
                <div className="text-left">
                  <div className="font-medium mb-1">{theme.name}</div>
                  <div className="text-sm opacity-75">{theme.description}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-black/10">
                      {theme.variant}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-black/10">
                      {theme.category}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </TestCard>

      {/* 현재 테마 상세 정보 */}
      <TestCard title="현재 테마 상세 정보">
        {themePreview
          .filter(theme => theme.id === currentThemeId)
          .map(theme => (
            <ThemeInfo key={theme.id} theme={theme} />
          ))
        }
      </TestCard>

      {/* 커스텀 테마 생성기 */}
      <TestCard title="커스텀 테마 생성기">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="linear-text-secondary text-sm block mb-1">테마 이름</label>
            <input
              className="linear-input w-full"
              value={testCustomTheme.name}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="linear-text-secondary text-sm block mb-1">Base L ({testCustomTheme.baseL})</label>
            <input
              type="range"
              min="0"
              max="100"
              value={testCustomTheme.baseL}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, baseL: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="linear-text-secondary text-sm block mb-1">Base C ({testCustomTheme.baseC})</label>
            <input
              type="range"
              min="0"
              max="100"
              value={testCustomTheme.baseC}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, baseC: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="linear-text-secondary text-sm block mb-1">Base H ({testCustomTheme.baseH})</label>
            <input
              type="range"
              min="0"
              max="360"
              value={testCustomTheme.baseH}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, baseH: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="linear-text-secondary text-sm block mb-1">Accent L ({testCustomTheme.accentL})</label>
            <input
              type="range"
              min="0"
              max="100"
              value={testCustomTheme.accentL}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, accentL: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="linear-text-secondary text-sm block mb-1">Accent C ({testCustomTheme.accentC})</label>
            <input
              type="range"
              min="0"
              max="100"
              value={testCustomTheme.accentC}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, accentC: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="linear-text-secondary text-sm block mb-1">Accent H ({testCustomTheme.accentH})</label>
            <input
              type="range"
              min="0"
              max="360"
              value={testCustomTheme.accentH}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, accentH: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="linear-text-secondary text-sm block mb-1">Contrast ({testCustomTheme.contrast})</label>
            <input
              type="range"
              min="0"
              max="100"
              value={testCustomTheme.contrast}
              onChange={(e) => setTestCustomTheme(prev => ({ ...prev, contrast: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <div 
            className="flex-1 h-16 rounded border flex items-center justify-center text-white text-sm font-medium"
            style={{ 
              backgroundColor: `hsl(${testCustomTheme.baseH}, ${testCustomTheme.baseC}%, ${testCustomTheme.baseL}%)` 
            }}
          >
            Base Color
          </div>
          <div 
            className="flex-1 h-16 rounded border flex items-center justify-center text-white text-sm font-medium"
            style={{ 
              backgroundColor: `hsl(${testCustomTheme.accentH}, ${testCustomTheme.accentC}%, ${testCustomTheme.accentL}%)` 
            }}
          >
            Accent Color
          </div>
        </div>
        
        <TestButton variant="primary" onClick={handleCreateCustomTheme}>
          커스텀 테마 생성 및 적용
        </TestButton>
      </TestCard>

      {/* 테마 히스토리 */}
      {history.length > 0 && (
        <TestCard title="테마 변경 히스토리">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.slice(0, 10).map((entry, index) => (
              <div key={index} className="linear-surface-elevated p-3 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="linear-text-primary font-medium">{entry.themeName}</span>
                  <span className="linear-text-tertiary">
                    {new Date(entry.changedAt).toLocaleTimeString()}
                  </span>
                </div>
                {entry.reason && (
                  <div className="linear-text-secondary mt-1">사유: {entry.reason}</div>
                )}
              </div>
            ))}
          </div>
        </TestCard>
      )}

      {/* 접근성 정보 */}
      <TestCard title="접근성 정보">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="linear-info p-3 rounded">
            <div className="font-medium mb-1">고대비 모드</div>
            <div className="text-sm">
              {isHighContrast ? '활성화됨' : '비활성화됨'}
            </div>
          </div>
          <div className="linear-info p-3 rounded">
            <div className="font-medium mb-1">시스템 선호도</div>
            <div className="text-sm">
              {window.matchMedia('(prefers-color-scheme: dark)').matches ? '다크 모드' : '라이트 모드'}
            </div>
          </div>
          <div className="linear-info p-3 rounded">
            <div className="font-medium mb-1">모션 설정</div>
            <div className="text-sm">
              {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '모션 감소' : '일반 모션'}
            </div>
          </div>
        </div>
      </TestCard>
    </div>
  );
};

export default ThemeTestPlayground;