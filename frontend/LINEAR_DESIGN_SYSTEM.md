# Linear Design System Implementation

**작성일**: 2025-07-31  
**작성자**: Claude Code  
**버전**: 1.0.0

## 🎨 개요

엘더베리 프로젝트에 Linear의 미니멀하고 전문적인 디자인 시스템을 구현했습니다. LCH 색공간 기반의 테마 시스템과 완전 자동화된 컴포넌트 테스트를 포함합니다.

## 🚀 주요 특징

### ✨ Linear Design System 핵심 원칙
- **Minimalism**: 불필요한 요소 제거, 핵심에 집중
- **Clarity**: 명확하고 직관적인 사용자 경험
- **Performance**: 최적화된 성능과 빠른 로딩
- **Accessibility**: WCAG 2.1 AA 준수, 고대비 모드 지원
- **Linear Flow**: 선형적이고 논리적인 사용자 흐름

### 🎨 LCH 색공간 기반 테마 시스템
- **인간의 눈에 최적화**: LCH 색공간으로 일관된 시각적 품질
- **6개 사전 정의 테마**: Light/Dark 기본 테마, Catppuccin, GitHub, Tokyo Night
- **동적 테마 생성**: LCH 값으로 커스텀 테마 실시간 생성
- **고대비 모드**: 접근성 표준 준수

## 📁 파일 구조

```
frontend/src/
├── styles/
│   └── linear-theme.css              # Linear 테마 CSS 변수 시스템
├── hooks/
│   └── useLinearTheme.ts            # 테마 관리 React Hook
├── components/
│   ├── theme/
│   │   └── LinearThemeProvider.tsx   # 중앙 집중식 테마 프로바이더
│   ├── ui/
│   │   ├── Button.tsx               # Linear 버튼 컴포넌트
│   │   ├── Card.tsx                 # Linear 카드 컴포넌트
│   │   └── Input.tsx                # Linear 입력 컴포넌트
│   └── demo/
│       └── LinearComponentDemo.tsx   # 컴포넌트 데모 페이지
└── tests/
    ├── components/
    │   └── linear-components.spec.ts # Playwright 컴포넌트 테스트
    └── setup/
        ├── linear-theme-setup.ts     # 테스트 픽스처
        ├── global-setup.ts          # 전역 테스트 설정
        └── global-teardown.ts       # 전역 테스트 정리
```

## 🛠️ 구현된 컴포넌트

### 1. Button Component
```tsx
// 기본 사용법
<Button variant="primary" size="default">
  Primary Button
</Button>

// 아이콘과 로딩 상태
<Button 
  variant="secondary" 
  icon={<Download />}
  loading={isLoading}
  onClick={handleClick}
>
  Download
</Button>
```

**지원 기능**:
- 8가지 variant (primary, secondary, ghost, outline, destructive, success, warning, link)
- 4가지 size (sm, default, lg, icon variants) 
- 아이콘 위치 설정 (left/right)
- 로딩 상태 및 애니메이션
- 완전한 접근성 지원

### 2. Card Component
```tsx
// 기본 카드
<Card surface="elevated" padding="lg" hover={true}>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

**지원 기능**:
- 3가지 surface (default, elevated, panel)
- 5가지 padding 크기
- 4가지 shadow 레벨
- 호버 및 인터랙션 애니메이션
- 서브컴포넌트 구조

### 3. Input Component
```tsx
// 라벨과 헬퍼 텍스트
<Input
  label="사용자명"
  placeholder="이름을 입력하세요"
  helperText="2-20자 사이로 입력해주세요"
  startIcon={<User />}
  required
/>

// 에러 상태
<Input
  label="이메일"
  errorText="올바른 이메일 주소를 입력해주세요"
  state="error"
/>
```

**지원 기능**:
- 시작/끝 아이콘 지원
- 라벨, 헬퍼 텍스트, 에러 메시지
- 4가지 상태 (default, error, success, warning)
- 완전한 접근성 (ARIA 속성)

## 🎨 테마 시스템 사용법

### 1. 기본 설정
```tsx
import { LinearThemeProvider } from './components/theme/LinearThemeProvider';

function App() {
  return (
    <LinearThemeProvider defaultTheme="default-light">
      <YourApp />
    </LinearThemeProvider>
  );
}
```

### 2. 테마 사용
```tsx
import { useLinearThemeContext } from './components/theme/LinearThemeProvider'; 

function MyComponent() {
  const { currentTheme, setTheme, toggleHighContrast } = useLinearThemeContext();
  
  return (
    <div>
      <p>현재 테마: {currentTheme}</p>
      <button onClick={() => setTheme('default-dark')}>
        다크 모드로 전환
      </button>
      <button onClick={toggleHighContrast}>
        고대비 모드 토글
      </button>
    </div>
  );
}
```

### 3. 커스텀 테마 생성
```tsx
const customTheme = generateThemeFromLCH(
  'My Custom Theme',
  [90, 5, 120, 1],    // base LCH
  [50, 80, 240, 1],   // accent LCH
  35                  // contrast
);
```

## 🧪 Playwright 테스트 자동화

### 테스트 실행
```bash
# 모든 테스트 실행
npm run test:e2e

# 특정 브라우저에서 테스트
npm run test:e2e -- --project=chromium

# UI 모드로 테스트
npm run test:e2e -- --ui

# 헤드 모드로 테스트 (브라우저 표시)
npm run test:e2e -- --headed
```

### 테스트 범위
- **컴포넌트 렌더링**: 모든 컴포넌트의 올바른 렌더링
- **인터랙션 테스트**: 클릭, 호버, 포커스 등 사용자 인터랙션
- **테마 전환**: 모든 테마에서의 컴포넌트 동작
- **접근성**: 키보드 내비게이션, ARIA 속성, 고대비 모드
- **시각적 회귀**: 스크린샷 비교로 UI 변경 감지
- **성능**: 대량 컴포넌트 렌더링 성능

### 테스트 설정
```typescript
// tests/setup/linear-theme-setup.ts
export const test = base.extend<LinearThemeFixtures>({
  linearTheme: async ({ page }, use) => {
    // Linear 테마 테스트 픽스처
  }
});
```

## 🎯 CSS 변수 시스템

### 색상 변수
```css
:root {
  /* 기본 색상 */
  --linear-color-accent: lch(var(--linear-lch-accent));
  --linear-color-background: lch(var(--linear-lch-base));
  
  /* 텍스트 색상 */
  --linear-color-text-primary: lch(20 5 var(--linear-lch-base, 3));
  --linear-color-text-secondary: lch(45 8 var(--linear-lch-base, 3));
  --linear-color-text-tertiary: lch(65 12 var(--linear-lch-base, 3));
  
  /* 상태 색상 */
  --linear-color-success: lch(60 50 140);
  --linear-color-error: lch(55 85 25);
  --linear-color-warning: lch(70 70 80);
}
```

### 스페이싱 변수
```css
:root {
  /* 기하급수적 스케일 */
  --linear-spacing-xs: 4px;
  --linear-spacing-sm: 8px;
  --linear-spacing-md: 12px;
  --linear-spacing-lg: 16px;
  --linear-spacing-xl: 24px;
  --linear-spacing-2xl: 32px;
  --linear-spacing-3xl: 48px;
  --linear-spacing-4xl: 64px;
  --linear-spacing-5xl: 96px;
}
```

## 🔧 개발 도구

### 1. 컴포넌트 데모
```tsx
// Linear 컴포넌트 데모 페이지 실행
import LinearComponentDemo from './components/demo/LinearComponentDemo';

<LinearComponentDemo />
```

### 2. 테마 관리자
```tsx
import { LinearThemeManager } from './components/theme/LinearThemeProvider';

// 테마 가져오기/내보내기 UI
<LinearThemeManager />
```

### 3. 테마 선택기
```tsx
import { LinearThemeSelector } from './components/theme/LinearThemeProvider';

// 테마 전환 UI
<LinearThemeSelector showHighContrast={true} />
```

## 📱 반응형 지원

### 브레이크포인트
```css
/* 모바일 */
@media (max-width: 480px) { /* ... */ }

/* 태블릿 */
@media (max-width: 768px) { /* ... */ }

/* 데스크톱 */
@media (max-width: 1024px) { /* ... */ }

/* 대형 화면 */
@media (max-width: 1440px) { /* ... */ }
```

### 테스트 디바이스
- Desktop Chrome/Firefox/Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- Tablet (iPad Pro)

## ♿ 접근성 지원

### WCAG 2.1 AA 준수
- **색상 대비**: 최소 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)
- **키보드 내비게이션**: 모든 인터랙티브 요소 접근 가능
- **스크린 리더**: ARIA 레이블 및 역할 완전 지원
- **고대비 모드**: Windows/macOS 고대비 설정 자동 감지

### 접근성 기능
```tsx
// 자동 ARIA 속성
<Button aria-label="사용자 메뉴 열기" loading={true}>
  Menu
</Button>

// 포커스 관리
<Input 
  label="이메일" 
  required 
  aria-describedby="email-helper"
  errorText="올바른 이메일을 입력하세요"
/>
```

## 🚀 성능 최적화

### CSS 변수 활용
- **런타임 테마 전환**: JavaScript 없이 CSS만으로 테마 변경
- **최소 리렌더링**: CSS 변수 변경으로 컴포넌트 리렌더링 없음
- **번들 사이즈 최적화**: 하나의 CSS 파일로 모든 테마 관리

### 애니메이션 최적화
```css
/* 저전력 모드 지원 */
@media (prefers-reduced-motion: reduce) {
  :root {
    --linear-transition-fast: 0ms;
    --linear-transition-normal: 0ms;
  }
}
```

## 🔮 향후 계획

### Phase 2 (예정)
- [ ] Form 컴포넌트 (Checkbox, Radio, Select, Textarea)
- [ ] Navigation 컴포넌트 (Navbar, Sidebar, Breadcrumb)
- [ ] Feedback 컴포넌트 (Toast, Modal, Alert)
- [ ] Data Display 컴포넌트 (Table, List, Badge)

### Phase 3 (예정)
- [ ] Layout 컴포넌트 (Grid, Stack, Container)
- [ ] Advanced 컴포넌트 (DatePicker, Autocomplete, Charts)
- [ ] Motion 시스템 확장
- [ ] 다국어 지원

## 📖 사용 예시

### Production에서 사용하기
```tsx
// App.tsx
import { LinearThemeProvider } from './components/theme/LinearThemeProvider';
import './styles/linear-theme.css';

function App() {
  return (
    <LinearThemeProvider 
      defaultTheme="default-light"
      enableSystemTheme={true}
      enableHighContrast={true}
    >
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* ... other routes */}
        </Routes>
      </Router>
    </LinearThemeProvider>
  );
}
```

### 기존 컴포넌트 마이그레이션
```tsx
// Before (기존 Elderberry 스타일)
<button className="bg-elderberry-600 text-white hover:bg-elderberry-700 px-4 py-2 rounded">
  Click me
</button>

// After (Linear Design System)
<Button variant="primary">
  Click me  
</Button>
```

## 🤝 기여 가이드

### 새 컴포넌트 추가
1. `src/components/ui/` 에 컴포넌트 파일 생성
2. Linear CSS 변수 사용
3. TypeScript 타입 정의
4. 접근성 속성 추가
5. Playwright 테스트 작성
6. Storybook 스토리 추가 (예정)

### 테마 커스터마이징
1. LCH 값 계산 (온라인 도구 활용)
2. `useLinearTheme` hook의 `generateThemeFromLCH` 사용
3. 색상 대비 검증 (4.5:1 이상)
4. 모든 테마에서 테스트

---

**📝 문서 버전**: 1.0.0  
**🔄 마지막 업데이트**: 2025-07-31  
**👨‍💻 관리자**: Claude Code  
**📧 문의**: 프로젝트 이슈 트래커 활용