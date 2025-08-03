/**
 * Linear Design System - 종합 데모 쇼케이스
 * 서브 에이전트들이 협력하여 구현한 완전한 Linear 테마 시스템 데모
 * 
 * @version 2025.1.0
 * @author 서브 에이전트 시스템 (테마/UI/폼/레이아웃/색상/애니메이션/타이포그래피/접근성 전문가)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Settings, 
  Monitor, 
  Sun, 
  Moon, 
  Contrast, 
  Accessibility,
  Type,
  Layout,
  Zap,
  Eye,
  Code2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

// 기존 컴포넌트들 import
import { useThemeContext } from '../../components/theme/ThemeProvider';
import Button from '../../shared/ui/Button';
import Input from '../../shared/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../shared/ui/Card';
import Modal from '../../shared/ui/Modal';
import Tooltip from '../../shared/ui/Tooltip';
import Badge from '../../shared/ui/Badge';

// 데모 컴포넌트들 import (생성 예정)
import ThemeShowcaseSection from '../../components/demo/sections/ThemeShowcaseSection';
import UIComponentShowcase from '../../components/demo/sections/UIComponentShowcase';
import FormComponentDemo from '../../components/demo/sections/FormComponentDemo';
import LayoutComponentDemo from '../../components/demo/sections/LayoutComponentDemo';
import ColorSystemDemo from '../../components/demo/sections/ColorSystemDemo';
import AnimationDemo from '../../components/demo/sections/AnimationDemo';
import TypographyDemo from '../../components/demo/sections/TypographyDemo';
import AccessibilityDemo from '../../components/demo/sections/AccessibilityDemo';

/**
 * 데모 섹션 정의
 */
interface DemoSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  agent: string;
  priority: 'high' | 'medium' | 'low';
}

const demoSections: DemoSection[] = [
  {
    id: 'theme-showcase',
    title: '테마 쇼케이스',
    description: '8개 테마 전환, 실시간 미리보기, 다크/라이트 모드 토글',
    icon: <Palette className="w-5 h-5" />,
    component: ThemeShowcaseSection,
    agent: '테마 전문가',
    priority: 'high'
  },
  {
    id: 'ui-components',
    title: 'UI 컴포넌트',
    description: 'Button, Input, Card, Badge, Modal, Tooltip 쇼케이스',
    icon: <Layout className="w-5 h-5" />,
    component: UIComponentShowcase,
    agent: 'UI 전문가',
    priority: 'high'
  },
  {
    id: 'form-components',
    title: '폼 컴포넌트',
    description: '인증 폼, 검증, 상태 관리 데모',
    icon: <Settings className="w-5 h-5" />,
    component: FormComponentDemo,
    agent: '폼 전문가',
    priority: 'medium'
  },
  {
    id: 'layout-system',
    title: '레이아웃 시스템',
    description: '레이아웃, 네비게이션, 반응형 데모',
    icon: <Monitor className="w-5 h-5" />,
    component: LayoutComponentDemo,
    agent: '레이아웃 전문가',
    priority: 'medium'
  },
  {
    id: 'color-system',
    title: '색상 시스템',
    description: 'LCH 색공간, 접근성, 상태 색상 데모',
    icon: <Eye className="w-5 h-5" />,
    component: ColorSystemDemo,
    agent: '색상 전문가',
    priority: 'medium'
  },
  {
    id: 'animation-system',
    title: '애니메이션 시스템',
    description: '호버, 전환, 로딩, 페이지 전환 효과',
    icon: <Zap className="w-5 h-5" />,
    component: AnimationDemo,
    agent: '애니메이션 전문가',
    priority: 'medium'
  },
  {
    id: 'typography',
    title: '타이포그래피',
    description: 'Inter 폰트, 크기, 라인 높이, 가중치',
    icon: <Type className="w-5 h-5" />,
    component: TypographyDemo,
    agent: '타이포그래피 전문가',
    priority: 'medium'
  },
  {
    id: 'accessibility',
    title: '접근성',
    description: '키보드, 스크린 리더, 고대비, 포커스 관리',
    icon: <Accessibility className="w-5 h-5" />,
    component: AccessibilityDemo,
    agent: '접근성 전문가',
    priority: 'medium'
  }
];

/**
 * 데모 네비게이션 컴포넌트
 */
const DemoNavigation: React.FC<{
  sections: DemoSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}> = ({ sections, activeSection, onSectionChange }) => {
  return (
    <nav className="demo-navigation sticky top-0 z-50 bg-[var(--linear-color-background)]/80 backdrop-blur-md border-b border-[var(--linear-color-border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-lg font-semibold text-[var(--linear-color-text-primary)]">
              Linear Design System
            </h1>
            <div className="hidden md:flex space-x-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-[var(--linear-color-accent)] text-white'
                      : 'text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-text-primary)] hover:bg-[var(--linear-color-surface-elevated)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span className="hidden lg:inline">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* 테마 제어 */}
          <div className="flex items-center space-x-2">
            <ThemeQuickControls />
          </div>
        </div>
      </div>
    </nav>
  );
};

/**
 * 빠른 테마 제어 컴포넌트
 */
const ThemeQuickControls: React.FC = () => {
  const { 
    currentThemeId, 
    isDarkMode, 
    isHighContrast, 
    toggleHighContrast,
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

  return (
    <div className="flex items-center space-x-2">
      <Tooltip content="다크 모드 토글">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md hover:bg-[var(--linear-color-surface-elevated)] transition-colors"
          aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </Tooltip>
      
      <Tooltip content="고대비 모드 토글">
        <button
          onClick={toggleHighContrast}
          className={`p-2 rounded-md transition-colors ${
            isHighContrast 
              ? 'bg-[var(--linear-color-accent)] text-white' 
              : 'hover:bg-[var(--linear-color-surface-elevated)]'
          }`}
          aria-label={isHighContrast ? '일반 대비로 전환' : '고대비 모드로 전환'}
        >
          <Contrast className="w-4 h-4" />
        </button>
      </Tooltip>
      
      <Tooltip content="랜덤 테마">
        <button
          onClick={randomTheme}
          className="p-2 rounded-md hover:bg-[var(--linear-color-surface-elevated)] transition-colors"
          aria-label="랜덤 테마 적용"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
};

/**
 * 섹션 헤더 컴포넌트
 */
const SectionHeader: React.FC<{
  section: DemoSection;
  isExpanded: boolean;
  onToggle: () => void;
  showCode: boolean;
  onShowCodeToggle: () => void;
}> = ({ section, isExpanded, onToggle, showCode, onShowCodeToggle }) => {
  return (
    <div className="section-header flex items-center justify-between p-6 border-b border-[var(--linear-color-border-subtle)]">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--linear-color-accent)]/10 text-[var(--linear-color-accent)]">
          {section.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--linear-color-text-primary)]">
            {section.title}
          </h2>
          <p className="text-[var(--linear-color-text-secondary)] mt-1">
            {section.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" size="sm">
              {section.agent}
            </Badge>
            <Badge 
              variant={section.priority === 'high' ? 'default' : 'secondary'} 
              size="sm"
            >
              {section.priority}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Tooltip content={showCode ? '코드 숨기기' : '코드 보기'}>
          <button
            onClick={onShowCodeToggle}
            className={`p-2 rounded-md transition-colors ${
              showCode 
                ? 'bg-[var(--linear-color-accent)] text-white' 
                : 'hover:bg-[var(--linear-color-surface-elevated)]'
            }`}
          >
            <Code2 className="w-4 h-4" />
          </button>
        </Tooltip>
        
        <Tooltip content={isExpanded ? '접기' : '펼치기'}>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-[var(--linear-color-surface-elevated)] transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

/**
 * 코드 스니펫 컴포넌트
 */
const CodeSnippet: React.FC<{
  code: string;
  language?: string;
}> = ({ code, language = 'typescript' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  return (
    <div className="code-snippet bg-[var(--linear-color-surface-panel)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--linear-color-surface-modal)] border-b border-[var(--linear-color-border-subtle)]">
        <span className="text-sm font-mono text-[var(--linear-color-text-secondary)]">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-[var(--linear-color-surface-elevated)] transition-colors"
        >
          <Copy className="w-3 h-3" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto">
        <code className="text-[var(--linear-color-text-primary)]">
          {code}
        </code>
      </pre>
    </div>
  );
};

/**
 * 메인 데모 쇼케이스 컴포넌트
 */
const LinearShowcase: React.FC = () => {
  const [activeSection, setActiveSection] = useState('theme-showcase');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['theme-showcase', 'ui-components'])
  );
  const [showCodeSections, setShowCodeSections] = useState<Set<string>>(new Set());
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  const { currentThemeId, currentTheme, themePreview } = useThemeContext();

  // 섹션 토글
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // 코드 표시 토글
  const toggleShowCode = useCallback((sectionId: string) => {
    setShowCodeSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // 자동 재생 토글
  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlay && autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
      setIsAutoPlay(false);
    } else {
      const interval = setInterval(() => {
        setActiveSection(current => {
          const currentIndex = demoSections.findIndex(s => s.id === current);
          const nextIndex = (currentIndex + 1) % demoSections.length;
          return demoSections[nextIndex].id;
        });
      }, 5000);
      setAutoPlayInterval(interval);
      setIsAutoPlay(true);
    }
  }, [isAutoPlay, autoPlayInterval]);

  // 정리
  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);

  return (
    <div className="linear-showcase min-h-screen bg-[var(--linear-color-background)]">
      {/* 네비게이션 */}
      <DemoNavigation
        sections={demoSections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-[var(--linear-color-text-primary)] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Linear Design System
          </motion.h1>
          <motion.p 
            className="text-xl text-[var(--linear-color-text-secondary)] mb-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            서브 에이전트 시스템이 협력하여 구현한 완전한 LCH 색공간 기반 테마 시스템
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Badge variant="outline" size="lg">
              현재 테마: {currentTheme?.metadata.name || currentThemeId}
            </Badge>
            <Badge variant="default" size="lg">
              {themePreview.length}개 테마 지원
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoPlay}
              icon={isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {isAutoPlay ? '자동 재생 중지' : '자동 재생 시작'}
            </Button>
          </motion.div>
        </header>

        {/* 데모 섹션들 */}
        <div className="space-y-8">
          {demoSections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              className={`demo-section rounded-lg border transition-all ${
                activeSection === section.id
                  ? 'border-[var(--linear-color-accent)] shadow-lg shadow-[var(--linear-color-accent)]/20'
                  : 'border-[var(--linear-color-border-default)]'
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <SectionHeader
                  section={section}
                  isExpanded={expandedSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  showCode={showCodeSections.has(section.id)}
                  onShowCodeToggle={() => toggleShowCode(section.id)}
                />
                
                <AnimatePresence>
                  {expandedSections.has(section.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="p-6">
                        <section.component />
                        
                        {/* 코드 스니펫 */}
                        <AnimatePresence>
                          {showCodeSections.has(section.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-6"
                            >
                              <CodeSnippet
                                code={getComponentCode(section.id)}
                                language="typescript"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.section>
          ))}
        </div>

        {/* 푸터 */}
        <footer className="mt-16 py-8 border-t border-[var(--linear-color-border-subtle)]">
          <div className="text-center">
            <p className="text-[var(--linear-color-text-secondary)] mb-4">
              Linear Design System v2025.1.0 - 서브 에이전트 시스템 구현
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--linear-color-text-tertiary)]">
              <span>협력 에이전트:</span>
              {demoSections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <Badge variant="secondary" size="sm">{section.agent}</Badge>
                  {index < demoSections.length - 1 && <span>•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

/**
 * 컴포넌트별 코드 예시 생성
 */
function getComponentCode(sectionId: string): string {
  const codeExamples: Record<string, string> = {
    'theme-showcase': `// 테마 쇼케이스 사용법
import { useLinearTheme } from '@/hooks/useLinearTheme';

const ThemeSelector = () => {
  const { 
    currentThemeId, 
    themePreview, 
    setTheme, 
    toggleDarkMode,
    previewTheme 
  } = useLinearTheme();

  return (
    <div className="theme-selector">
      {themePreview.map(theme => (
        <button
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          onMouseEnter={() => previewTheme(theme.id)}
          className="theme-option"
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
};`,
    'ui-components': `// UI 컴포넌트 사용법
import Button from '../../shared/ui/Button';
import Input from '../../shared/ui/Input';
import { Card } from '../../shared/ui/Card';

const UIExample = () => (
  <Card>
    <CardContent>
      <Button variant="primary" size="lg">
        Primary Button
      </Button>
      <Input 
        label="Email" 
        type="email"
        placeholder="Enter your email"
      />
    </CardContent>
  </Card>
);`,
    // 다른 섹션들의 코드 예시도 추가...
  };

  return codeExamples[sectionId] || `// ${sectionId} 코드 예시\n// 구현 예정`;
}

export default LinearShowcase;