/**
 * Linear Component Demo Page
 * 새로운 Linear Design System 컴포넌트들의 데모
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../shared/ui/Card';
import Button from '../../shared/ui/Button';
import Input from '../../shared/ui/Input';
import { LinearThemeProvider, LinearThemeSelector, LinearThemeManager, useLinearThemeContext } from '../theme/LinearThemeProvider';
import { Search, User, Settings, Heart, Star, Download } from 'lucide-react';

const ComponentShowcase: React.FC = () => {
  const { currentTheme, isDark } = useLinearThemeContext();
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLoadingDemo = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--linear-color-background)] p-[var(--linear-spacing-xl)]">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="mb-[var(--linear-spacing-4xl)]">
          <h1 className="text-4xl font-bold text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-md)]">
            Linear Design System
          </h1>
          <p className="text-lg text-[var(--linear-color-text-secondary)] mb-[var(--linear-spacing-xl)]">
            현재 테마: <span className="font-semibold text-[var(--linear-color-accent)]">{currentTheme}</span> 
            {isDark ? ' (다크 모드)' : ' (라이트 모드)'}
          </p>
          
          {/* 테마 선택기 */}
          <div className="max-w-md">
            <LinearThemeSelector />
          </div>
        </header>

        {/* 버튼 섹션 */}
        <section className="mb-[var(--linear-spacing-4xl)]">
          <h2 className="text-2xl font-semibold text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xl)]">
            버튼 컴포넌트
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--linear-spacing-xl)]">
            {/* Primary 버튼들 */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Buttons</CardTitle>
                <CardDescription>주요 액션용 버튼들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-[var(--linear-spacing-md)]">
                  <Button variant="primary" size="sm">Small Primary</Button>
                  <Button variant="primary">Default Primary</Button>
                  <Button variant="primary" size="lg">Large Primary</Button>
                  <Button 
                    variant="primary" 
                    loading={loading} 
                    onClick={handleLoadingDemo}
                  >
                    {loading ? 'Loading...' : 'Click for Loading'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Secondary 버튼들 */}
            <Card>
              <CardHeader>
                <CardTitle>Secondary Buttons</CardTitle>
                <CardDescription>보조 액션용 버튼들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-[var(--linear-spacing-md)]">
                  <Button variant="secondary" size="sm">Small Secondary</Button>
                  <Button variant="secondary">Default Secondary</Button>
                  <Button variant="secondary" size="lg">Large Secondary</Button>
                  <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 기타 버튼들 */}
            <Card>
              <CardHeader>
                <CardTitle>Other Variants</CardTitle>
                <CardDescription>다양한 버튼 스타일들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-[var(--linear-spacing-md)]">
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="success" icon={<Heart className="w-4 h-4" />}>
                    Success
                  </Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 카드 섹션 */}
        <section className="mb-[var(--linear-spacing-4xl)]">
          <h2 className="text-2xl font-semibold text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xl)]">
            카드 컴포넌트
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--linear-spacing-xl)]">
            {/* 기본 카드 */}
            <Card surface="elevated" padding="lg">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>기본 카드 스타일입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--linear-color-text-primary)]">
                  이것은 기본 카드의 내용입니다. Linear Design System의 색상과 스페이싱을 사용합니다.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Action</Button>
                <Button variant="ghost" size="sm">Cancel</Button>
              </CardFooter>
            </Card>

            {/* 호버 카드 */}
            <Card hover={true} interactive={true} shadow="modal">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>호버 효과가 있는 카드입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--linear-color-text-primary)]">
                  이 카드에 마우스를 올려보세요. 부드러운 애니메이션을 볼 수 있습니다.
                </p>
              </CardContent>
            </Card>

            {/* 패널 카드 */}
            <Card surface="panel" padding="xl">
              <CardHeader>
                <CardTitle>Panel Card</CardTitle>
                <CardDescription>패널 표면을 사용한 카드입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-[var(--linear-spacing-md)]">
                  <div className="w-12 h-12 bg-[var(--linear-color-accent)] rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--linear-color-text-primary)]">
                      Featured Item
                    </h4>
                    <p className="text-sm text-[var(--linear-color-text-secondary)]">
                      Special content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 입력 섹션 */}
        <section className="mb-[var(--linear-spacing-4xl)]">
          <h2 className="text-2xl font-semibold text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xl)]">
            입력 컴포넌트
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--linear-spacing-xl)]">
            <Card>
              <CardHeader>
                <CardTitle>Basic Inputs</CardTitle>
                <CardDescription>기본 입력 필드들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-[var(--linear-spacing-lg)]">
                  <Input
                    label="기본 입력"
                    placeholder="텍스트를 입력하세요..."
                    helperText="도움말 텍스트입니다."
                  />
                  
                  <Input
                    label="필수 입력"
                    placeholder="필수 필드입니다"
                    required
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  
                  <Input
                    label="에러 상태"
                    placeholder="에러가 있는 입력"
                    errorText="이 필드는 필수입니다."
                    value="잘못된 값"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input with Icons</CardTitle>
                <CardDescription>아이콘이 있는 입력 필드들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-[var(--linear-spacing-lg)]">
                  <Input
                    label="검색"
                    placeholder="검색어를 입력하세요..."
                    startIcon={<Search className="w-4 h-4" />}
                  />
                  
                  <Input
                    label="사용자 이름"
                    placeholder="사용자 이름"
                    startIcon={<User className="w-4 h-4" />}
                  />
                  
                  <Input
                    label="설정값"
                    placeholder="설정을 입력하세요"
                    endIcon={<Settings className="w-4 h-4" />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 테마 관리 섹션 */}
        <section className="mb-[var(--linear-spacing-4xl)]">
          <h2 className="text-2xl font-semibold text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xl)]">
            테마 관리
          </h2>
          
          <Card surface="panel" padding="xl">
            <CardHeader>
              <CardTitle>테마 가져오기/내보내기</CardTitle>
              <CardDescription>
                커스텀 테마를 JSON 형태로 가져오거나 내보낼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LinearThemeManager />
            </CardContent>
          </Card>
        </section>

        {/* 색상 팔레트 */}
        <section className="mb-[var(--linear-spacing-4xl)]">
          <h2 className="text-2xl font-semibold text-[var(--linear-color-text-primary)] mb-[var(--linear-spacing-xl)]">
            색상 팔레트
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Theme Colors</CardTitle>
              <CardDescription>현재 테마의 색상 변수들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--linear-spacing-md)]">
                {[
                  { name: 'Primary', var: '--linear-color-accent' },
                  { name: 'Background', var: '--linear-color-background' },
                  { name: 'Surface', var: '--linear-color-surface-elevated' },
                  { name: 'Text Primary', var: '--linear-color-text-primary' },
                  { name: 'Text Secondary', var: '--linear-color-text-secondary' },
                  { name: 'Border', var: '--linear-color-border-default' },
                  { name: 'Success', var: '--linear-color-success' },
                  { name: 'Error', var: '--linear-color-error' },
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div 
                      className="w-full h-16 rounded-[var(--linear-radius-medium)] border border-[var(--linear-color-border-subtle)] mb-2"
                      style={{ backgroundColor: `var(${color.var})` }}
                    />
                    <p className="text-sm font-medium text-[var(--linear-color-text-primary)]">
                      {color.name}
                    </p>
                    <code className="text-xs text-[var(--linear-color-text-tertiary)]">
                      {color.var}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

// 메인 데모 컴포넌트
const LinearComponentDemo: React.FC = () => {
  return (
    <LinearThemeProvider defaultTheme="default-light">
      <ComponentShowcase />
    </LinearThemeProvider>
  );
};

export default LinearComponentDemo;