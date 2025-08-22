# Elderberry 메인페이지 디자인 가이드라인

## 🎨 디자인 시스템 개요

현재 채팅 페이지를 기반으로 한 일관된 디자인 시스템을 메인페이지에 적용하기 위한 가이드라인입니다.

## 🎯 브랜드 컬러 팔레트

### 메인 컬러
- **Primary Green**: `#29b79c` (메인 브랜드 컬러)
- **Primary Green Dark**: `#20a085` (호버 상태)
- **Primary Green Light**: `#29b79c/20` (링 효과, 투명도 20%)

### 그라데이션
- **메인 그라데이션**: `from-[#29b79c] to-[#20a085]`
- **성공 그라데이션**: `from-green-50 to-emerald-50`
- **정보 그라데이션**: `from-blue-50 to-indigo-50`

### 중성 컬러
- **텍스트 메인**: `#111111`, `#333333`
- **텍스트 보조**: `#404042`, `#666666`
- **텍스트 연한**: `#818181`, `#gray-500`
- **배경**: `#ffffff`, `#f8f9fa`
- **테두리**: `#e8e8e8`, `#e4e4e4`, `#dedede`

## 📐 레이아웃 시스템

### 사이드바 구조
```css
/* 접힌 상태 */
width: 60px
padding: 8px

/* 펼쳐진 상태 */
width: 180px (sm) / 220px (md) / 260px (lg)
padding-left: 8px (sm) / 16px (md) / 24px (lg)
padding-right: 8px (sm) / 16px (md) / 25px (lg)
```

### 반응형 브레이크포인트
- **Mobile**: `< 640px` (사이드바 숨김)
- **Tablet**: `640px - 768px` (sm)
- **Desktop**: `768px - 1024px` (md)
- **Large**: `> 1024px` (lg)

### 간격 시스템
- **컴포넌트 간격**: `space-y-6` (24px)
- **섹션 간격**: `gap-4` (16px), `gap-3` (12px)
- **내부 패딩**: `p-4` (16px), `p-6` (24px)

## 🔤 타이포그래피

### 폰트 크기 및 굵기
```css
/* 헤딩 */
h1: text-xl font-bold (20px, 700)
h2: text-lg font-bold (18px, 700)
h3: text-2xl font-bold (24px, 700) /* 모달 제목 */

/* 본문 */
body: text-[15px] leading-relaxed (15px, 1.625)
small: text-sm (14px)
caption: text-xs (12px)

/* 특수 */
brand: font-bold text-lg (18px, 700)
button: font-bold text-[14.2px] (14.2px, 700)
```

### 텍스트 컬러 매핑
- **제목**: `text-gray-900`, `text-[#111111]`
- **본문**: `text-[#333]`, `text-gray-700`
- **보조**: `text-gray-600`, `text-[#404042]`
- **플레이스홀더**: `text-[#818181]`
- **성공**: `text-green-800`, `text-green-700`
- **브랜드**: `text-[#29b79c]`

## 🎪 컴포넌트 스타일

### 버튼 스타일
```css
/* Primary 버튼 */
.btn-primary {
  background: #29b79c;
  hover:background: #20a085;
  color: white;
  border-radius: rounded-lg;
}

/* Outline 버튼 */
.btn-outline {
  border: 1px solid #29b79c;
  color: #29b79c;
  hover:background: #29b79c;
  hover:color: white;
}

/* Ghost 버튼 */
.btn-ghost {
  color: #666;
  hover:background: gray-100;
}
```

### 카드 스타일
```css
/* 메인 카드 */
.card-main {
  background: white;
  border-radius: rounded-2xl;
  border: 2px solid #29b79c;
  box-shadow: 0px 2px 10px rgba(0,0,0,0.16);
}

/* 정보 카드 */
.card-info {
  background: gray-50;
  border-radius: rounded-lg;
  padding: 16px;
}

/* 추천 카드 */
.card-recommendation {
  background: linear-gradient(to right, from-green-50, to-emerald-50);
  border: 1px solid rgb(34 197 94 / 0.2);
  border-radius: rounded-xl;
}
```

### 모달 스타일
```css
.modal {
  background: white;
  border-radius: rounded-2xl;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  max-width: 512px; /* max-w-2xl */
  max-height: 90vh;
}

.modal-overlay {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
}
```

## 🎭 인터랙션 및 애니메이션

### 트랜지션
```css
/* 기본 트랜지션 */
transition-all duration-300

/* 호버 효과 */
hover:bg-white hover:shadow-md transition-all duration-200

/* 페이드 인 */
animate-in fade-in duration-300

/* 바운스 애니메이션 */
animate-bounce (로딩 인디케이터)
```

### 상태 표시
```css
/* 활성 상태 */
.active {
  background: #29b79c;
  color: white;
  ring: 4px solid rgba(41, 183, 156, 0.2);
}

/* 완료 상태 */
.completed {
  background: #29b79c;
  color: white;
}

/* 대기 상태 */
.pending {
  background: #e5e7eb; /* gray-200 */
  color: #6b7280; /* gray-500 */
}
```

## 🏗️ 메인페이지 구조 제안

### 1. 헤더 영역
```jsx
<header className="bg-white border-b border-[#e8e8e8]">
  <div className="flex items-center justify-between p-4">
    <div className="font-bold text-lg">Elderberry</div>
    <nav className="flex items-center gap-4">
      {/* 네비게이션 메뉴 */}
    </nav>
  </div>
</header>
```

### 2. 히어로 섹션
```jsx
<section className="bg-gradient-to-br from-[#29b79c] to-[#20a085] text-white">
  <div className="max-w-4xl mx-auto px-6 py-16 text-center">
    <h1 className="text-4xl font-bold mb-4">AI 기반 요양보호사 매칭</h1>
    <p className="text-xl mb-8">최적의 돌봄 서비스를 찾아드립니다</p>
    <Button className="bg-white text-[#29b79c] hover:bg-gray-100">
      지금 시작하기
    </Button>
  </div>
</section>
```

### 3. 기능 카드 섹션
```jsx
<section className="py-16 bg-white">
  <div className="max-w-6xl mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature) => (
        <Card key={feature.id} className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-[#29b79c] to-[#20a085] rounded-full flex items-center justify-center mb-4">
            {feature.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </Card>
      ))}
    </div>
  </div>
</section>
```

### 4. CTA 섹션
```jsx
<section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
  <div className="max-w-4xl mx-auto px-6 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      지금 바로 시작해보세요
    </h2>
    <p className="text-gray-600 mb-8">
      AI가 추천하는 최적의 요양보호사를 만나보세요
    </p>
    <Button className="bg-[#29b79c] hover:bg-[#20a085] text-white px-8 py-3">
      채팅 시작하기
    </Button>
  </div>
</section>
```

## 🎨 아이콘 및 이미지

### 아이콘 라이브러리
- **Lucide React** 사용 중
- 크기: `w-4 h-4` (16px), `w-5 h-5` (20px), `w-6 h-6` (24px)
- 컬러: `text-[#29b79c]` (브랜드), `text-gray-600` (중성)

### 이미지 스타일
```css
/* 프로필 이미지 */
.profile-image {
  width: 80px; /* w-20 */
  height: 80px; /* h-20 */
  border-radius: 50%;
  background: linear-gradient(135deg, #29b79c, #20a085);
}

/* 아바타 */
.avatar {
  width: 48px; /* w-12 */
  height: 48px; /* h-12 */
  border-radius: 50%;
  background: linear-gradient(135deg, #29b79c, #20a085);
}
```

## 📱 모바일 최적화

### 모바일 우선 설계
```css
/* 기본 (모바일) */
.container {
  padding: 16px; /* p-4 */
  max-width: 100%;
}

/* 태블릿 이상 */
@media (min-width: 640px) {
  .container {
    padding: 24px; /* p-6 */
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### 터치 친화적 요소
- 버튼 최소 크기: `44px x 44px`
- 터치 영역 간격: 최소 `8px`
- 스크롤 영역: `overflow-y-auto`

## 🔧 개발 시 주의사항

### CSS 클래스 네이밍
- Tailwind CSS 사용
- 커스텀 컬러는 대괄호 표기법: `bg-[#29b79c]`
- 일관된 간격 시스템 사용

### 접근성 고려사항
- 색상 대비비 4.5:1 이상 유지
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- `aria-label`, `role` 속성 활용

### 성능 최적화
- 이미지 lazy loading
- 컴포넌트 메모이제이션
- 불필요한 리렌더링 방지

## 📋 체크리스트

### 디자인 일관성
- [ ] 브랜드 컬러 사용 (`#29b79c`)
- [ ] 일관된 간격 시스템 적용
- [ ] 타이포그래피 가이드라인 준수
- [ ] 버튼 스타일 통일
- [ ] 카드 디자인 일관성

### 반응형 디자인
- [ ] 모바일 우선 설계
- [ ] 태블릿 레이아웃 최적화
- [ ] 데스크톱 레이아웃 완성
- [ ] 터치 인터페이스 고려

### 사용자 경험
- [ ] 직관적인 네비게이션
- [ ] 명확한 CTA 버튼
- [ ] 로딩 상태 표시
- [ ] 에러 처리 UI
- [ ] 접근성 준수

이 가이드라인을 따라 메인페이지를 개발하면 현재 채팅 페이지와 일관된 디자인을 유지하면서도 사용자 친화적인 인터페이스를 구현할 수 있습니다.