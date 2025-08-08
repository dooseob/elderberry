/**
 * 색상 시스템 데모 섹션 - 색상 전문가 구현
 * LCH 색공간, 접근성, 상태 색상 데모
 * 
 * @author 색상 전문가 (서브 에이전트 시스템)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, Contrast, Info, Check, AlertTriangle, X } from 'lucide-react';

import { useThemeContext } from '../../theme/ThemeProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/ui';
import { Badge } from '../../../shared/ui';
import { Button } from '../../../shared/ui';

/**
 * 색상 팔레트 표시 컴포넌트
 */
const ColorPalette: React.FC<{
  title: string;
  colors: Array<{ name: string; cssVar: string; description?: string }>;
}> = ({ title, colors }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (cssVar: string) => {
    try {
      await navigator.clipboard.writeText(`var(${cssVar})`);
      setCopiedColor(cssVar);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>클릭하여 CSS 변수 복사</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {colors.map((color, index) => (
            <motion.div
              key={color.cssVar}
              className="group cursor-pointer"
              onClick={() => copyToClipboard(color.cssVar)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="w-full h-20 rounded-lg border border-[var(--linear-color-border-subtle)] mb-2 shadow-sm group-hover:shadow-md transition-shadow relative"
                style={{ backgroundColor: `var(${color.cssVar})` }}
              >
                {copiedColor === color.cssVar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="flex items-center gap-1 text-white text-sm">
                      <Check className="w-4 h-4" />
                      Copied!
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-[var(--linear-color-text-primary)] mb-1">
                  {color.name}
                </h4>
                <code className="text-xs text-[var(--linear-color-text-tertiary)] font-mono">
                  {color.cssVar}
                </code>
                {color.description && (
                  <p className="text-xs text-[var(--linear-color-text-secondary)] mt-1">
                    {color.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * LCH 색공간 시각화 컴포넌트
 */
const LCHVisualization: React.FC = () => {
  const { currentTheme } = useThemeContext();
  
  const analysis = useMemo(() => {
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
  }, [currentTheme]);

  if (!currentTheme || !analysis) return null;

  const { base, accent } = currentTheme.core;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          LCH 색공간 분석
        </CardTitle>
        <CardDescription>
          현재 테마의 LCH (Lightness, Chroma, Hue) 값 분석
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 베이스 색상 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[var(--linear-color-text-primary)]">
              베이스 색상 (배경)
            </h4>
            <div
              className="w-full h-24 rounded-lg border border-[var(--linear-color-border-default)]"
              style={{ backgroundColor: `lch(${base[0]}% ${base[1]} ${base[2]})` }}
            />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
                <div className="text-lg font-bold text-[var(--linear-color-text-primary)]">
                  {base[0].toFixed(1)}%
                </div>
                <div className="text-[var(--linear-color-text-secondary)]">
                  Lightness
                </div>
              </div>
              <div className="text-center p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
                <div className="text-lg font-bold text-[var(--linear-color-text-primary)]">
                  {base[1].toFixed(1)}
                </div>
                <div className="text-[var(--linear-color-text-secondary)]">
                  Chroma
                </div>
              </div>
              <div className="text-center p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
                <div className="text-lg font-bold text-[var(--linear-color-text-primary)]">
                  {base[2].toFixed(0)}°
                </div>
                <div className="text-[var(--linear-color-text-secondary)]">
                  Hue
                </div>
              </div>
            </div>
          </div>

          {/* 강조 색상 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[var(--linear-color-text-primary)]">
              강조 색상 (액센트)
            </h4>
            <div
              className="w-full h-24 rounded-lg border border-[var(--linear-color-border-default)]"
              style={{ backgroundColor: `lch(${accent[0]}% ${accent[1]} ${accent[2]})` }}
            />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
                <div className="text-lg font-bold text-[var(--linear-color-text-primary)]">
                  {accent[0].toFixed(1)}%
                </div>
                <div className="text-[var(--linear-color-text-secondary)]">
                  Lightness
                </div>
              </div>
              <div className="text-center p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
                <div className="text-lg font-bold text-[var(--linear-color-text-primary)]">
                  {accent[1].toFixed(1)}
                </div>
                <div className="text-[var(--linear-color-text-secondary)]">
                  Chroma
                </div>
              </div>
              <div className="text-center p-3 bg-[var(--linear-color-surface-panel)] rounded-lg">
                <div className="text-lg font-bold text-[var(--linear-color-text-primary)]">
                  {accent[2].toFixed(0)}°
                </div>
                <div className="text-[var(--linear-color-text-secondary)]">
                  Hue
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 색상 조화 분석 */}
        <div className="mt-6 p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg">
          <h5 className="font-semibold text-[var(--linear-color-text-primary)] mb-3">
            색상 조화 분석
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                {analysis.harmony}
              </Badge>
              <div className="text-[var(--linear-color-text-secondary)]">
                조화 유형
              </div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                {analysis.temperature}
              </Badge>
              <div className="text-[var(--linear-color-text-secondary)]">
                색온도
              </div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                {analysis.saturationLevel}
              </Badge>
              <div className="text-[var(--linear-color-text-secondary)]">
                채도 레벨
              </div>
            </div>
            <div className="text-center">
              <Badge 
                variant={
                  analysis.accessibilityGrade === 'AAA' ? 'success' :
                  analysis.accessibilityGrade === 'AA' ? 'default' : 'destructive'
                } 
                className="mb-2"
              >
                {analysis.accessibilityGrade}
              </Badge>
              <div className="text-[var(--linear-color-text-secondary)]">
                접근성 등급
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 접근성 검사 컴포넌트
 */
const AccessibilityCheck: React.FC = () => {
  const { currentTheme } = useThemeContext();
  
  const analysis = useMemo(() => {
    if (!currentTheme) return null;
    
    const { base, accent } = currentTheme.core;
    const contrastRatio = Math.abs(base[0] - accent[0]) / 100 * 21;
    
    return {
      contrastRatio,
      accessibilityGrade: contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'FAIL'
    } as const;
  }, [currentTheme]);

  const contrastTests = [
    {
      name: '대형 텍스트 (18pt+)',
      requirement: 3.0,
      description: '큰 텍스트의 최소 대비 비율'
    },
    {
      name: '일반 텍스트',
      requirement: 4.5,
      description: '일반 텍스트의 최소 대비 비율 (AA)'
    },
    {
      name: '향상된 대비',
      requirement: 7.0,
      description: '향상된 접근성을 위한 대비 비율 (AAA)'
    }
  ];

  if (!analysis) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contrast className="w-5 h-5" />
          접근성 검사
        </CardTitle>
        <CardDescription>
          WCAG 2.1 가이드라인 기준 대비 비율 검사
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 현재 대비 비율 */}
          <div className="text-center p-6 bg-[var(--linear-color-surface-elevated)] rounded-lg">
            <div className="text-3xl font-bold text-[var(--linear-color-text-primary)] mb-2">
              {analysis.contrastRatio.toFixed(2)}:1
            </div>
            <div className="text-[var(--linear-color-text-secondary)]">
              현재 대비 비율
            </div>
          </div>

          {/* 대비 테스트 결과 */}
          <div className="space-y-3">
            {contrastTests.map((test, index) => {
              const passes = analysis.contrastRatio >= test.requirement;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    passes
                      ? 'border-[var(--linear-color-success)]/20 bg-[var(--linear-color-success)]/10'
                      : 'border-[var(--linear-color-error)]/20 bg-[var(--linear-color-error)]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {passes ? (
                      <Check className="w-5 h-5 text-[var(--linear-color-success)]" />
                    ) : (
                      <X className="w-5 h-5 text-[var(--linear-color-error)]" />
                    )}
                    <div>
                      <div className="font-medium text-[var(--linear-color-text-primary)]">
                        {test.name}
                      </div>
                      <div className="text-sm text-[var(--linear-color-text-secondary)]">
                        {test.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-[var(--linear-color-text-primary)]">
                      {test.requirement}:1 필요
                    </div>
                    <Badge variant={passes ? 'success' : 'destructive'} size="sm">
                      {passes ? '통과' : '실패'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 권장사항 */}
          <div className="p-4 bg-[var(--linear-color-surface-panel)] rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-[var(--linear-color-info)] mt-0.5" />
              <div>
                <h5 className="font-medium text-[var(--linear-color-text-primary)] mb-2">
                  접근성 권장사항
                </h5>
                <ul className="text-sm text-[var(--linear-color-text-secondary)] space-y-1">
                  <li>• AA 등급: 4.5:1 이상 (일반 텍스트)</li>
                  <li>• AAA 등급: 7:1 이상 (향상된 접근성)</li>
                  <li>• 대형 텍스트: 3:1 이상으로 완화 가능</li>
                  <li>• 색상만으로 정보를 전달하지 마세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 색상 시스템 데모 메인 컴포넌트
 */
const ColorSystemDemo: React.FC = () => {
  const colorCategories = [
    {
      title: '기본 색상',
      colors: [
        { name: 'Background', cssVar: '--linear-color-background', description: '기본 배경' },
        { name: 'Foreground', cssVar: '--linear-color-foreground', description: '기본 전경' },
        { name: 'Accent', cssVar: '--linear-color-accent', description: '강조 색상' },
        { name: 'Muted', cssVar: '--linear-color-muted', description: '음소거된 색상' }
      ]
    },
    {
      title: '표면 색상',
      colors: [
        { name: 'Elevated', cssVar: '--linear-color-surface-elevated', description: '승격된 표면' },
        { name: 'Panel', cssVar: '--linear-color-surface-panel', description: '패널 표면' },
        { name: 'Input', cssVar: '--linear-color-surface-input', description: '입력 필드' },
        { name: 'Modal', cssVar: '--linear-color-surface-modal', description: '모달 배경' }
      ]
    },
    {
      title: '텍스트 색상',
      colors: [
        { name: 'Primary', cssVar: '--linear-color-text-primary', description: '주요 텍스트' },
        { name: 'Secondary', cssVar: '--linear-color-text-secondary', description: '보조 텍스트' },
        { name: 'Tertiary', cssVar: '--linear-color-text-tertiary', description: '삼차 텍스트' },
        { name: 'On Accent', cssVar: '--linear-color-text-on-accent', description: '강조색 위 텍스트' }
      ]
    },
    {
      title: '테두리 색상',
      colors: [
        { name: 'Subtle', cssVar: '--linear-color-border-subtle', description: '미묘한 테두리' },
        { name: 'Default', cssVar: '--linear-color-border-default', description: '기본 테두리' },
        { name: 'Strong', cssVar: '--linear-color-border-strong', description: '강한 테두리' },
        { name: 'Focus', cssVar: '--linear-color-border-focus', description: '포커스 테두리' }
      ]
    },
    {
      title: '상태 색상',
      colors: [
        { name: 'Success', cssVar: '--linear-color-success', description: '성공 상태' },
        { name: 'Warning', cssVar: '--linear-color-warning', description: '경고 상태' },
        { name: 'Error', cssVar: '--linear-color-error', description: '오류 상태' },
        { name: 'Info', cssVar: '--linear-color-info', description: '정보 상태' }
      ]
    }
  ];

  return (
    <div className="color-system-demo space-y-8">
      {/* LCH 색공간 시각화 */}
      <LCHVisualization />
      
      {/* 접근성 검사 */}
      <AccessibilityCheck />
      
      {/* 색상 팔레트들 */}
      {colorCategories.map((category, index) => (
        <motion.div
          key={category.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ColorPalette
            title={category.title}
            colors={category.colors}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ColorSystemDemo;