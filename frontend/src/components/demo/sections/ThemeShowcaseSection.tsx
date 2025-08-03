/**
 * 테마 쇼케이스 섹션 - 테마 전문가 구현
 * 8개 테마 전환, 실시간 미리보기, 다크/라이트 모드 토글
 * 
 * @author 테마 전문가 (서브 에이전트 시스템)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Contrast, 
  Eye, 
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Zap,
  Check,
  X
} from 'lucide-react';

import { useThemeContext } from '../../theme/ThemeProvider';
import Button from '../../../shared/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/ui/Card';
import Badge from '../../../shared/ui/Badge';
import Tooltip from '../../../shared/ui/Tooltip';
import Input from '../../../shared/ui/Input';
import type { ThemePreview, LCHColor } from '../../../types/theme';

/**
 * 테마 카드 컴포넌트
 */
const ThemeCard: React.FC<{
  theme: ThemePreview;
  isActive: boolean;
  isPreview: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onPreviewEnd: () => void;
}> = ({ theme, isActive, isPreview, onSelect, onPreview, onPreviewEnd }) => {
  return (
    <motion.div
      className={`theme-card relative rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
        isActive
          ? 'border-[var(--linear-color-accent)] shadow-lg shadow-[var(--linear-color-accent)]/30'
          : isPreview
          ? 'border-[var(--linear-color-accent)]/50 shadow-md'
          : 'border-[var(--linear-color-border-default)] hover:border-[var(--linear-color-border-strong)]'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      layout
    >
      {/* 테마 미리보기 영역 */}
      <div className="theme-preview h-24 p-3 relative" style={{ backgroundColor: theme.previewColors.background }}>
        <div className="flex h-full gap-2">
          {/* 강조 색상 */}
          <div 
            className="flex-1 rounded-md"
            style={{ backgroundColor: theme.previewColors.accent }}
          />
          {/* 전경 색상 */}
          <div 
            className="flex-1 rounded-md border"
            style={{ 
              backgroundColor: theme.previewColors.foreground,
              borderColor: theme.previewColors.border
            }}
          />
        </div>
        
        {/* 활성 표시 */}
        {isActive && (
          <motion.div
            className="absolute top-2 right-2 w-6 h-6 bg-[var(--linear-color-success)] rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* 테마 정보 */}
      <div className="p-3 bg-[var(--linear-color-surface-elevated)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-[var(--linear-color-text-primary)]">
            {theme.name}
          </h3>
          <div className="flex gap-1">
            <Badge variant="outline" size="sm">
              {theme.variant}
            </Badge>
            <Badge variant="secondary" size="sm">
              {theme.category}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-[var(--linear-color-text-secondary)] line-clamp-2">
          {theme.description}
        </p>
        
        {/* 인기도 */}
        {theme.popularity && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex-1 h-1 bg-[var(--linear-color-surface-panel)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--linear-color-accent)] transition-all duration-1000"
                style={{ width: `${theme.popularity}%` }}
              />
            </div>
            <span className="text-xs text-[var(--linear-color-text-tertiary)]">
              {theme.popularity}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * 테마 제어 패널
 */
const ThemeControlPanel: React.FC = () => {
  const {
    isDarkMode,
    isHighContrast,
    isReducedMotion,
    toggleHighContrast,
    toggleReducedMotion,
    exportTheme,
    importTheme,
    currentThemeId,
    setTheme,
    themePreview
  } = useThemeContext();

  const toggleDarkMode = () => {
    const targetVariant = isDarkMode ? 'light' : 'dark';
    const oppositeTheme = themePreview.find(t => t.variant === targetVariant);
    if (oppositeTheme) {
      setTheme(oppositeTheme.id);
    }
  };

  const randomTheme = () => {
    const availableThemes = themePreview.filter(t => t.id !== currentThemeId);
    if (availableThemes.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableThemes.length);
      setTheme(availableThemes[randomIndex].id);
    }
  };

  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleExport = useCallback(async () => {
    try {
      const exported = exportTheme(currentThemeId);
      if (exported) {
        await navigator.clipboard.writeText(exported);
        // TODO: Toast 알림 추가
        console.log('테마가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('테마 내보내기 실패:', error);
    }
  }, [exportTheme, currentThemeId]);

  const handleImport = useCallback(() => {
    try {
      const result = importTheme(importJson);
      if (result) {
        setImportJson('');
        setShowImport(false);
        // TODO: Toast 알림 추가
        console.log(`테마 "${result}"가 성공적으로 가져와졌습니다.`);
      }
    } catch (error) {
      console.error('테마 가져오기 실패:', error);
    }
  }, [importTheme, importJson]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          테마 제어
        </CardTitle>
        <CardDescription>
          테마 시스템 설정 및 커스터마이징
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 토글 컨트롤들 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span className="text-sm font-medium">다크 모드</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  isDarkMode ? 'bg-[var(--linear-color-accent)]' : 'bg-[var(--linear-color-surface-input)]'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4" />
                <span className="text-sm font-medium">고대비</span>
              </div>
              <button
                onClick={toggleHighContrast}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  isHighContrast ? 'bg-[var(--linear-color-accent)]' : 'bg-[var(--linear-color-surface-input)]'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    isHighContrast ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
              <div className="flex items-center gap-2">
                {isReducedMotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm font-medium">애니메이션</span>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  !isReducedMotion ? 'bg-[var(--linear-color-accent)]' : 'bg-[var(--linear-color-surface-input)]'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    !isReducedMotion ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={randomTheme}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              랜덤 테마
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              icon={<Download className="w-4 h-4" />}
            >
              내보내기
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImport(!showImport)}
              icon={<Upload className="w-4 h-4" />}
            >
              가져오기
            </Button>
          </div>

          {/* 테마 가져오기 UI */}
          <AnimatePresence>
            {showImport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <Input
                  label="테마 JSON 데이터"
                  placeholder="테마 JSON을 붙여넣으세요..."
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  multiline
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleImport}
                    disabled={!importJson.trim()}
                  >
                    가져오기
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImport(false)}
                  >
                    취소
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 실시간 테마 분석 패널
 */
const ThemeAnalysisPanel: React.FC = () => {
  const { currentTheme } = useThemeContext();
  
  // 기본 분석 구현
  const analyzeTheme = () => {
    if (!currentTheme) return null;
    
    const { base, accent } = currentTheme.core;
    const contrastRatio = Math.abs(base[0] - accent[0]) / 100 * 21;
    
    return {
      contrastRatio,
      accessibilityGrade: contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'FAIL',
      harmony: 'complementary',
      temperature: base[2] > 180 && base[2] < 300 ? 'cool' : 'warm',
      saturationLevel: base[1] < 20 ? 'low' : base[1] < 60 ? 'medium' : 'high'
    } as const;
  };
  
  const [analysis, setAnalysis] = useState(analyzeTheme());

  useEffect(() => {
    const result = analyzeTheme();
    setAnalysis(result);
  }, [currentTheme]);

  if (!analysis) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          실시간 테마 분석
        </CardTitle>
        <CardDescription>
          현재 테마의 색상 조화도 및 접근성 분석
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 대비 비율 */}
          <div className="text-center p-4 bg-[var(--linear-color-surface-panel)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--linear-color-text-primary)] mb-1">
              {analysis.contrastRatio.toFixed(1)}:1
            </div>
            <div className="text-sm text-[var(--linear-color-text-secondary)] mb-2">
              대비 비율
            </div>
            <Badge 
              variant={
                analysis.accessibilityGrade === 'AAA' ? 'success' :
                analysis.accessibilityGrade === 'AA' ? 'default' : 'destructive'
              }
              size="sm"
            >
              {analysis.accessibilityGrade}
            </Badge>
          </div>

          {/* 색상 조화도 */}
          <div className="text-center p-4 bg-[var(--linear-color-surface-panel)] rounded-lg">
            <div className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-1">
              {analysis.harmony}
            </div>
            <div className="text-sm text-[var(--linear-color-text-secondary)] mb-2">
              색상 조화도
            </div>
            <Badge variant="outline" size="sm">
              {analysis.temperature}
            </Badge>
          </div>

          {/* 채도 레벨 */}
          <div className="text-center p-4 bg-[var(--linear-color-surface-panel)] rounded-lg">
            <div className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-1">
              {analysis.saturationLevel}
            </div>
            <div className="text-sm text-[var(--linear-color-text-secondary)]">
              채도 레벨
            </div>
          </div>

          {/* 색온도 */}
          <div className="text-center p-4 bg-[var(--linear-color-surface-panel)] rounded-lg">
            <div className="text-lg font-semibold text-[var(--linear-color-text-primary)] mb-1">
              {analysis.temperature}
            </div>
            <div className="text-sm text-[var(--linear-color-text-secondary)]">
              색온도
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 테마 쇼케이스 섹션 메인 컴포넌트
 */
const ThemeShowcaseSection: React.FC = () => {
  const {
    currentThemeId,
    themePreview,
    setTheme
  } = useThemeContext();
  
  // 프리뷰 기능 구현
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [previewTimeout, setPreviewTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const previewTheme = (themeId: string, options: { duration?: number } = {}) => {
    const { duration = 3000 } = options;
    
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }
    
    setIsPreviewMode(true);
    setPreviewThemeId(themeId);
    
    const timeout = setTimeout(() => {
      setIsPreviewMode(false);
      setPreviewThemeId(null);
    }, duration);
    
    setPreviewTimeout(timeout);
  };
  
  const cancelPreview = () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      setPreviewTimeout(null);
    }
    setIsPreviewMode(false);
    setPreviewThemeId(null);
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // 카테고리 및 변형 필터
  const availableCategories = [...new Set(themePreview.map(t => t.category))];
  const availableVariants = [...new Set(themePreview.map(t => t.variant))];

  const filteredThemes = themePreview.filter(theme => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(theme.category);
    const variantMatch = selectedVariants.length === 0 || selectedVariants.includes(theme.variant);
    return categoryMatch && variantMatch;
  });

  // 필터 토글
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const toggleVariant = useCallback((variant: string) => {
    setSelectedVariants(prev => 
      prev.includes(variant) 
        ? prev.filter(v => v !== variant)
        : [...prev, variant]
    );
  }, []);

  return (
    <div className="theme-showcase-section space-y-8">
      {/* 헤더 및 통계 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--linear-color-text-primary)] mb-2">
            테마 갤러리
          </h3>
          <div className="flex items-center gap-4 text-sm text-[var(--linear-color-text-secondary)]">
            <span>총 {themePreview.length}개 테마</span>
            <span>•</span>
            <span>{availableCategories.length}개 카테고리</span>
            <span>•</span>
            <span>{availableVariants.length}개 변형</span>
          </div>
        </div>

        {/* 현재 테마 표시 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--linear-color-text-secondary)]">현재:</span>
          <Badge variant="default" size="lg">
            {themePreview.find(t => t.id === currentThemeId)?.name || currentThemeId}
          </Badge>
          {isPreviewMode && previewThemeId && (
            <>
              <span className="text-sm text-[var(--linear-color-text-secondary)]">미리보기:</span>
              <Badge variant="outline" size="lg">
                {themePreview.find(t => t.id === previewThemeId)?.name || previewThemeId}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--linear-color-text-primary)]">카테고리:</span>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-[var(--linear-color-accent)] text-white'
                  : 'bg-[var(--linear-color-surface-elevated)] text-[var(--linear-color-text-secondary)] hover:bg-[var(--linear-color-surface-panel)]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--linear-color-text-primary)]">변형:</span>
          {availableVariants.map(variant => (
            <button
              key={variant}
              onClick={() => toggleVariant(variant)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedVariants.includes(variant)
                  ? 'bg-[var(--linear-color-accent)] text-white'
                  : 'bg-[var(--linear-color-surface-elevated)] text-[var(--linear-color-text-secondary)] hover:bg-[var(--linear-color-surface-panel)]'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      {/* 테마 그리드 */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredThemes.map((theme) => (
            <motion.div
              key={theme.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <ThemeCard
                theme={theme}
                isActive={currentThemeId === theme.id}
                isPreview={isPreviewMode && previewThemeId === theme.id}
                onSelect={() => setTheme(theme.id)}
                onPreview={() => previewTheme(theme.id, { duration: 1000 })}
                onPreviewEnd={cancelPreview}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 제어 패널 및 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ThemeControlPanel />
        <ThemeAnalysisPanel />
      </div>
    </div>
  );
};

export default ThemeShowcaseSection;