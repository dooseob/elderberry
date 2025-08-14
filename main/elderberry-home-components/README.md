# Elderberry Home Components

다른 프론트엔드 프로젝트에 통합하기 위한 Elderberry 홈페이지 컴포넌트 패키지입니다.

## 📁 폴더 구조

```
elderberry-home-components/
├── components/
│   ├── ui/                    # 기본 UI 컴포넌트
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── separator.jsx
│   │   └── tooltip.jsx
│   └── HomePage.jsx           # 메인 홈페이지
├── lib/
│   └── utils.js              # 유틸리티 함수
├── styles/
│   └── globals.css           # 전역 스타일
└── package-requirements.json  # 필요한 패키지 목록
```

## 🚀 설치 및 사용법

### 1. 필요한 패키지 설치

```bash
npm install react react-dom react-router-dom
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install tailwindcss autoprefixer postcss
```

### 2. 컴포넌트 사용 예시

```jsx
import HomePage from './elderberry-home-components/components/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
```

### 3. 스타일 적용

```jsx
// index.js 또는 App.js에서
import './elderberry-home-components/styles/globals.css';
```

## 🎨 디자인 시스템

- **메인 컬러**: `#29b79c`
- **보조 컬러**: `#20a085`
- **폰트**: 시스템 기본 폰트
- **아이콘**: Lucide React

## 🔧 커스터마이징

### 브랜드명 변경
`HomePage.jsx`에서 브랜드명을 수정하세요:

```jsx
<h1 className="font-bold text-[#111111] text-[28.2px] text-center leading-[48px]">
  Your Brand Name
</h1>
```

### 플레이스홀더 텍스트 변경
```jsx
<textarea
  placeholder="여기에 원하는 텍스트를 입력하세요"
  // ...
/>
```

## 📋 주요 기능

- ✅ 반응형 홈페이지 인터페이스
- ✅ 사이드바 접기/펼치기 기능
- ✅ 프롬프트 입력 후 채팅 페이지로 이동
- ✅ 모바일 최적화
- ✅ 접근성 지원

## 🤝 통합 가이드

1. 이 폴더를 프로젝트 루트에 복사
2. 필요한 패키지 설치
3. 라우팅 설정
4. 스타일 적용
5. 채팅 페이지 연동

문의사항이 있으시면 개발팀에 연락해주세요.