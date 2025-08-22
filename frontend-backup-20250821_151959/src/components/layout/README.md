# Layout Components - Linear Design System

엘더베리 프로젝트를 위한 Linear 디자인 시스템 기반 레이아웃 컴포넌트 라이브러리입니다.

## 🏗️ 컴포넌트 구성

### 1. MainLayout
메인 애플리케이션 레이아웃을 담당하는 최상위 컴포넌트입니다.

**주요 기능:**
- 반응형 사이드바, 헤더, 메인 콘텐츠, 푸터 영역 관리
- 모바일/태블릿/데스크톱 반응형 지원
- 사이드바 상태 관리 (열림/접힘/숨김)
- 키보드 네비게이션 지원 (Alt+S로 사이드바 토글)

```tsx
import { MainLayout } from '@/components/layout';

<MainLayout
  variant="default"
  initialSidebarState="open"
  showHeader={true}
  showSidebar={true}
  showFooter={true}
  headerFixed={true}
  sidebarFixed={true}
>
  {/* 페이지 콘텐츠 */}
</MainLayout>
```

### 2. Header
애플리케이션 상단 헤더/네비게이션 바 컴포넌트입니다.

**주요 기능:**
- 브랜드 로고 및 메인 네비게이션
- 테마 전환 드롭다운
- 사용자 프로필 메뉴
- 모바일 햄버거 메뉴
- 반응형 네비게이션

```tsx
import { Header } from '@/components/layout';

<Header
  sidebarState="open"
  onToggleSidebar={() => {}}
  navItems={[
    { id: 'home', label: '홈', href: '/', active: true },
    { id: 'facilities', label: '시설 찾기', href: '/facilities' },
  ]}
  user={{
    name: '김사용자',
    email: 'user@example.com',
    avatar: '/avatar.jpg'
  }}
  userMenuItems={userMenuItems}
/>
```

### 3. Sidebar
측면 네비게이션 사이드바 컴포넌트입니다.

**주요 기능:**
- 계층적 메뉴 구조 지원
- 접기/펼치기 애니메이션
- 서브메뉴 및 섹션 분리
- 활성 상태 하이라이트
- 배지 및 알림 표시

```tsx
import { Sidebar } from '@/components/layout';

<Sidebar
  state="open"
  onStateChange={setSidebarState}
  sections={[
    {
      id: 'main',
      title: '메인',
      items: [
        {
          id: 'dashboard',
          label: '대시보드',
          href: '/dashboard',
          icon: <DashboardIcon />,
          active: true
        }
      ]
    }
  ]}
/>
```

### 4. Footer
애플리케이션 하단 푸터 컴포넌트입니다.

**주요 기능:**
- 회사 정보 및 브랜딩
- 링크 섹션 (서비스, 회사, 지원, 법적 정보)
- 소셜 미디어 링크
- 뉴스레터 구독 폼
- 다국어 지원 고려

```tsx
import { Footer } from '@/components/layout';

<Footer
  companyName="엘더베리"
  companyDescription="고령층을 위한 맞춤형 시설 추천 서비스"
  contactInfo={{
    email: 'contact@elderberry.co.kr',
    phone: '02-1234-5678',
    address: '서울특별시 강남구 테헤란로 123'
  }}
  socialLinks={socialLinks}
  showNewsletter={true}
/>
```

### 5. Breadcrumb
페이지 경로를 표시하는 브레드크럼 네비게이션 컴포넌트입니다.

**주요 기능:**
- 계층적 페이지 경로 표시
- 클릭 가능한 네비게이션
- 모바일에서 자동 축약
- SEO를 위한 구조화된 데이터
- 접근성 최적화

```tsx
import { Breadcrumb } from '@/components/layout';

<Breadcrumb
  items={[
    { id: 'home', label: '홈', href: '/' },
    { id: 'facilities', label: '시설 찾기', href: '/facilities' },
    { id: 'search', label: '검색 결과', current: true }
  ]}
  showHomeIcon={true}
  maxItems={3}
/>
```

### 6. PageContainer
개별 페이지의 공통 레이아웃을 제공하는 컨테이너 컴포넌트입니다.

**주요 기능:**
- 페이지 제목 및 설명
- 액션 버튼 영역
- 브레드크럼 통합
- 사이드바 레이아웃 지원
- 로딩 및 에러 상태 처리

```tsx
import { PageContainer } from '@/components/layout';

<PageContainer
  title="시설 검색"
  description="맞춤형 시설을 찾아보세요"
  breadcrumbItems={breadcrumbs}
  actions={[
    {
      id: 'create',
      label: '새로 만들기',
      onClick: () => {},
      variant: 'primary',
      icon: <PlusIcon />
    }
  ]}
  sidebar={<FilterSidebar />}
>
  {/* 페이지 콘텐츠 */}
</PageContainer>
```

## 🎨 디자인 시스템 특징

### Linear 테마 시스템
- LCH 색공간 기반 색상 시스템
- 다크/라이트 테마 자동 전환
- 고대비 모드 지원
- 커스텀 테마 생성 가능

### 반응형 디자인
- 모바일 우선 설계
- 브레이크포인트: 480px (모바일), 768px (태블릿), 1024px (데스크톱)
- 플렉시블 그리드 시스템
- 터치 친화적 인터랙션

### 접근성 (a11y)
- WCAG 2.1 AA 준수
- 키보드 네비게이션 완전 지원
- 스크린 리더 최적화
- 고대비 모드 지원
- Focus 관리 최적화

### 성능 최적화
- React.memo를 활용한 불필요한 리렌더링 방지
- 지연 로딩 지원
- CSS-in-JS 대신 CSS 변수 활용
- 번들 크기 최적화

## 🔧 사용법

### 1. 기본 설정

```tsx
// main.tsx
import './components/layout/layout.css';

// App.tsx
import { MainLayout } from '@/components/layout';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <Router>
          <Routes>
            {/* 라우트 설정 */}
          </Routes>
        </Router>
      </MainLayout>
    </ThemeProvider>
  );
}
```

### 2. 페이지 컴포넌트 예시

```tsx
import { PageContainer, Breadcrumb } from '@/components/layout';

const FacilitiesPage = () => {
  const breadcrumbs = [
    { id: 'home', label: '홈', href: '/' },
    { id: 'facilities', label: '시설 찾기', current: true }
  ];

  const actions = [
    {
      id: 'filter',
      label: '필터',
      onClick: () => setShowFilter(true),
      variant: 'secondary' as const,
      icon: <FilterIcon />
    }
  ];

  return (
    <PageContainer
      title="시설 찾기"
      description="고령층을 위한 맞춤형 시설을 찾아보세요"
      breadcrumbItems={breadcrumbs}
      actions={actions}
    >
      <FacilitySearchContent />
    </PageContainer>
  );
};
```

### 3. 커스텀 훅 활용

```tsx
import { useLinearTheme } from '@/hooks/useLinearTheme';

const MyComponent = () => {
  const { 
    currentTheme, 
    isDarkMode, 
    toggleDarkMode, 
    setTheme 
  } = useLinearTheme();

  return (
    <div className={isDarkMode ? 'dark-variant' : 'light-variant'}>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? '라이트 모드' : '다크 모드'}
      </button>
    </div>
  );
};
```

## 📱 모바일 최적화

### 터치 인터랙션
- 최소 터치 타겟 크기: 44px
- 터치 피드백 애니메이션
- 스와이프 제스처 지원

### 성능 최적화
- 가상화된 긴 목록
- 이미지 지연 로딩
- 오프라인 지원 준비

### 접근성
- 확대/축소 지원
- 고대비 모드
- 음성 내비게이션 지원

## 🌐 다국어 지원

```tsx
// 향후 i18n 통합 예시
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  
  return (
    <nav>
      <a href="/">{t('nav.home')}</a>
      <a href="/facilities">{t('nav.facilities')}</a>
    </nav>
  );
};
```

## 🔍 SEO 최적화

### 메타 데이터 관리
```tsx
<PageContainer
  title="시설 찾기"
  meta={{
    title: '엘더베리 - 시설 찾기',
    description: '고령층을 위한 맞춤형 요양 시설을 찾아보세요',
    keywords: ['요양원', '요양병원', '고령층', '시설'],
    ogImage: '/images/facilities-og.jpg'
  }}
>
  {/* 내용 */}
</PageContainer>
```

### 구조화된 데이터
- 브레드크럼 Schema.org 마크업
- 조직 정보 구조화 데이터
- 지역 비즈니스 마크업

## 🧪 테스팅

### 단위 테스트
```tsx
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout';

test('헤더 로고가 렌더링됩니다', () => {
  render(<Header />);
  expect(screen.getByText('엘더베리')).toBeInTheDocument();
});
```

### 접근성 테스트
```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('헤더가 접근성 기준을 준수합니다', async () => {
  const { container } = render(<Header />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📚 추가 자료

- [Linear Design System 가이드](../../../docs/LINEAR_DESIGN_SYSTEM.md)
- [테마 시스템 문서](../theme/README.md)
- [접근성 가이드라인](../../../docs/accessibility.md)
- [성능 최적화 가이드](../../../docs/performance.md)

## 🤝 기여하기

1. 컴포넌트 수정 시 타입 정의 업데이트
2. 접근성 테스트 필수
3. 반응형 디자인 확인
4. 다크 모드 호환성 테스트
5. 문서 업데이트

## 📄 라이선스

엘더베리 프로젝트의 일부로 MIT 라이선스 하에 제공됩니다.