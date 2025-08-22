/**
 * 접근성 데모 섹션 - 접근성 전문가 구현
 * Keyboard, Screen Reader, Focus, High Contrast 데모
 * 
 * @author 접근성 전문가 (서브 에이전트 시스템)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Accessibility, 
  Keyboard, 
  Eye, 
  Focus, 
  Volume2, 
  Contrast,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  IndentIncrease,
  Check,
  X
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/ui';
import { Button } from '../../../shared/ui';
import { Input } from '../../../shared/ui';
import { Badge } from '../../../shared/ui';
import { useThemeContext } from '../../theme/ThemeProvider';

/**
 * 키보드 네비게이션 데모
 */
const KeyboardNavigationDemo: React.FC = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [demoActive, setDemoActive] = useState(false);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const navigableItems = [
    { id: 'btn1', label: '버튼 1', type: 'button' },
    { id: 'btn2', label: '버튼 2', type: 'button' },
    { id: 'input1', label: '입력 필드', type: 'input' },
    { id: 'btn3', label: '버튼 3', type: 'button' },
    { id: 'link1', label: '링크', type: 'link' }
  ];

  useEffect(() => {
    if (demoActive && focusedIndex >= 0 && buttonsRef.current[focusedIndex]) {
      buttonsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, demoActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!demoActive) return;
    
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : navigableItems.length - 1);
        } else {
          setFocusedIndex(prev => prev < navigableItems.length - 1 ? prev + 1 : 0);
        }
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          e.preventDefault();
          console.log(`Activated: ${navigableItems[focusedIndex].label}`);
        }
        break;
      case 'Escape':
        setDemoActive(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const startDemo = () => {
    setDemoActive(true);
    setFocusedIndex(0);
  };

  const stopDemo = () => {
    setDemoActive(false);
    setFocusedIndex(-1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          키보드 네비게이션
        </CardTitle>
        <CardDescription>
          Tab, Shift+Tab, Enter, Space, Escape 키를 사용한 네비게이션
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="primary" onClick={startDemo} disabled={demoActive}>
              데모 시작
            </Button>
            <Button variant="outline" onClick={stopDemo} disabled={!demoActive}>
              데모 중지
            </Button>
          </div>

          {demoActive && (
            <div className="p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg border-2 border-[var(--linear-color-accent)]">
              <p className="text-sm text-[var(--linear-color-text-secondary)] mb-4">
                키보드 데모가 활성화되었습니다. Tab/Shift+Tab으로 이동, Enter/Space로 활성화, Escape로 종료
              </p>
              <div 
                className="keyboard-demo-area space-y-3"
                onKeyDown={handleKeyDown}
                tabIndex={-1}
              >
                {navigableItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {focusedIndex === index && (
                        <Focus className="w-5 h-5 text-[var(--linear-color-accent)]" />
                      )}
                    </div>
                    {item.type === 'button' && (
                      <button
                        ref={el => buttonsRef.current[index] = el}
                        className={`px-4 py-2 rounded transition-colors ${
                          focusedIndex === index
                            ? 'bg-[var(--linear-color-accent)] text-white ring-2 ring-[var(--linear-color-accent)] ring-offset-2'
                            : 'bg-[var(--linear-color-surface-panel)] text-[var(--linear-color-text-primary)] hover:bg-[var(--linear-color-surface-modal)]'
                        }`}
                        tabIndex={-1}
                      >
                        {item.label}
                      </button>
                    )}
                    {item.type === 'input' && (
                      <input
                        ref={el => buttonsRef.current[index] = el as any}
                        className={`px-4 py-2 border rounded transition-colors ${
                          focusedIndex === index
                            ? 'border-[var(--linear-color-accent)] ring-2 ring-[var(--linear-color-accent)] ring-offset-2'
                            : 'border-[var(--linear-color-border-default)]'
                        }`}
                        placeholder={item.label}
                        tabIndex={-1}
                      />
                    )}
                    {item.type === 'link' && (
                      <a
                        ref={el => buttonsRef.current[index] = el as any}
                        href="#"
                        className={`px-4 py-2 text-blue-600 underline rounded transition-colors ${
                          focusedIndex === index
                            ? 'ring-2 ring-[var(--linear-color-accent)] ring-offset-2'
                            : ''
                        }`}
                        tabIndex={-1}
                        onClick={e => e.preventDefault()}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <IndentIncrease className="w-3 h-3" />
              Tab: 다음 요소
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <IndentIncrease className="w-3 h-3" />
              Shift+Tab: 이전 요소
            </Badge>
            <Badge variant="outline">Enter/Space: 활성화</Badge>
            <Badge variant="outline">Escape: 종료</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 포커스 관리 데모
 */
const FocusManagementDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [trapFocus, setTrapFocus] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (showModal && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(focusableElements);
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    } else if (!showModal && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [showModal]);

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (!trapFocus || !modalRef.current) return;

    if (e.key === 'Tab') {
      const focusable = modalRef.current.querySelectorAll(focusableElements);
      const firstFocusable = focusable[0] as HTMLElement;
      const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    } else if (e.key === 'Escape') {
      setShowModal(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Focus className="w-5 h-5" />
          포커스 관리
        </CardTitle>
        <CardDescription>
          모달, 드롭다운 등에서의 포커스 트랩 및 복원
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              ref={triggerRef}
              variant="primary" 
              onClick={() => setShowModal(true)}
            >
              모달 열기
            </Button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={trapFocus}
                onChange={(e) => setTrapFocus(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">포커스 트랩 활성화</span>
            </label>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                onKeyDown={handleModalKeyDown}
              >
                <h3 className="text-lg font-semibold mb-4">포커스 트랩 데모</h3>
                <p className="text-gray-600 mb-4">
                  {trapFocus 
                    ? 'Tab 키로 이동 시 이 모달 내에서만 포커스가 순환됩니다.'
                    : '포커스 트랩이 비활성화되어 있습니다.'
                  }
                </p>
                <div className="space-y-3">
                  <Input placeholder="첫 번째 입력 필드" />
                  <Input placeholder="두 번째 입력 필드" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowModal(false)}>
                      취소
                    </Button>
                    <Button variant="primary" onClick={() => setShowModal(false)}>
                      확인
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 스크린 리더 지원 데모
 */
const ScreenReaderDemo: React.FC = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // 실제 스크린 리더 알림 (aria-live 영역 사용)
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    announce('폼이 성공적으로 제출되었습니다.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          스크린 리더 지원
        </CardTitle>
        <CardDescription>
          ARIA 속성과 의미론적 HTML을 통한 접근성 향상
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-4">
              접근성 폼 예시
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-[var(--linear-color-text-primary)] mb-1"
                >
                  사용자명 <span className="text-[var(--linear-color-error)]" aria-label="필수 항목">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  aria-describedby="username-help"
                  className="w-full px-3 py-2 border border-[var(--linear-color-border-default)] rounded-md"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
                <div id="username-help" className="text-xs text-[var(--linear-color-text-secondary)] mt-1">
                  3자 이상의 영문자 또는 숫자
                </div>
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-[var(--linear-color-text-primary)] mb-1"
                >
                  이메일 <span className="text-[var(--linear-color-error)]" aria-label="필수 항목">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-[var(--linear-color-border-default)] rounded-md"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-[var(--linear-color-text-primary)] mb-1"
                >
                  비밀번호 <span className="text-[var(--linear-color-error)]" aria-label="필수 항목">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  aria-describedby="password-help"
                  className="w-full px-3 py-2 border border-[var(--linear-color-border-default)] rounded-md"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <div id="password-help" className="text-xs text-[var(--linear-color-text-secondary)] mt-1">
                  최소 8자, 대소문자 및 숫자 포함
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                제출
              </Button>
            </form>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-4">
              스크린 리더 알림
            </h4>
            <div className="space-y-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => announce('성공적으로 저장되었습니다.')}
              >
                성공 알림
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => announce('오류가 발생했습니다. 다시 시도해주세요.')}
              >
                오류 알림
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => announce('새로운 메시지가 도착했습니다.')}
              >
                정보 알림
              </Button>
            </div>

            <div className="bg-[var(--linear-color-surface-elevated)] p-3 rounded-lg max-h-32 overflow-y-auto">
              <h5 className="text-sm font-medium text-[var(--linear-color-text-primary)] mb-2">
                알림 기록:
              </h5>
              {announcements.length === 0 ? (
                <p className="text-sm text-[var(--linear-color-text-secondary)]">
                  아직 알림이 없습니다.
                </p>
              ) : (
                <ul className="text-sm space-y-1">
                  {announcements.map((announcement, index) => (
                    <li key={index} className="text-[var(--linear-color-text-secondary)]">
                      • {announcement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 고대비 모드 데모
 */
const HighContrastDemo: React.FC = () => {
  const { isHighContrast, toggleHighContrast } = useThemeContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contrast className="w-5 h-5" />
          고대비 모드
        </CardTitle>
        <CardDescription>
          시각적 접근성을 위한 고대비 색상 테마
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant={isHighContrast ? "success" : "outline"}
              onClick={toggleHighContrast}
              icon={isHighContrast ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            >
              고대비 모드 {isHighContrast ? '활성화됨' : '비활성화됨'}
            </Button>
            <Badge variant={isHighContrast ? "success" : "secondary"}>
              현재 상태: {isHighContrast ? 'ON' : 'OFF'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg border border-[var(--linear-color-border-default)]">
              <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-2">
                일반 텍스트 예시
              </h4>
              <p className="text-[var(--linear-color-text-primary)] mb-2">
                이것은 주요 텍스트입니다.
              </p>
              <p className="text-[var(--linear-color-text-secondary)] mb-2">
                이것은 보조 텍스트입니다.
              </p>
              <p className="text-[var(--linear-color-text-tertiary)]">
                이것은 삼차 텍스트입니다.
              </p>
            </div>

            <div className="p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg border border-[var(--linear-color-border-default)]">
              <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-2">
                상태 색상 예시
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[var(--linear-color-success)] rounded"></div>
                  <span className="text-[var(--linear-color-success)]">성공</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[var(--linear-color-warning)] rounded"></div>
                  <span className="text-[var(--linear-color-warning)]">경고</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[var(--linear-color-error)] rounded"></div>
                  <span className="text-[var(--linear-color-error)]">오류</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[var(--linear-color-info)] rounded"></div>
                  <span className="text-[var(--linear-color-info)]">정보</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--linear-color-surface-panel)] rounded-lg">
            <h5 className="font-medium text-[var(--linear-color-text-primary)] mb-2">
              고대비 모드 특징:
            </h5>
            <ul className="text-sm text-[var(--linear-color-text-secondary)] space-y-1">
              <li>• 텍스트와 배경 간의 대비 비율 7:1 이상 (AAA 등급)</li>
              <li>• 더 선명한 테두리와 구분선</li>
              <li>• 강화된 포커스 표시</li>
              <li>• 시각 장애인과 저시력자를 위한 최적화</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 접근성 데모 메인 컴포넌트
 */
const AccessibilityDemo: React.FC = () => {
  return (
    <div className="accessibility-demo space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            접근성 개요
          </CardTitle>
          <CardDescription>
            WCAG 2.1 가이드라인을 준수한 포용적 디자인
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg">
              <Keyboard className="w-8 h-8 text-[var(--linear-color-accent)] mx-auto mb-2" />
              <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-1">
                키보드 접근
              </h4>
              <p className="text-sm text-[var(--linear-color-text-secondary)]">
                모든 기능을 키보드로 사용 가능
              </p>
            </div>
            
            <div className="text-center p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg">
              <Volume2 className="w-8 h-8 text-[var(--linear-color-accent)] mx-auto mb-2" />
              <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-1">
                스크린 리더
              </h4>
              <p className="text-sm text-[var(--linear-color-text-secondary)]">
                ARIA 속성으로 정보 전달
              </p>
            </div>
            
            <div className="text-center p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg">
              <Focus className="w-8 h-8 text-[var(--linear-color-accent)] mx-auto mb-2" />
              <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-1">
                포커스 관리
              </h4>
              <p className="text-sm text-[var(--linear-color-text-secondary)]">
                논리적 탭 순서와 트랩
              </p>
            </div>
            
            <div className="text-center p-4 bg-[var(--linear-color-surface-elevated)] rounded-lg">
              <Contrast className="w-8 h-8 text-[var(--linear-color-accent)] mx-auto mb-2" />
              <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-1">
                고대비 지원
              </h4>
              <p className="text-sm text-[var(--linear-color-text-secondary)]">
                시각적 접근성 향상
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <KeyboardNavigationDemo />
      <FocusManagementDemo />
      <ScreenReaderDemo />
      <HighContrastDemo />
    </div>
  );
};

export default AccessibilityDemo;