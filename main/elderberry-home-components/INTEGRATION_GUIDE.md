# Elderberry Home Components 통합 가이드

## 🚀 빠른 시작

### 1. 파일 복사
```bash
# 프로젝트 루트에 elderberry-home-components 폴더 복사
cp -r elderberry-home-components/ your-project/
```

### 2. 패키지 설치
```bash
npm install react react-dom react-router-dom lucide-react class-variance-authority clsx tailwind-merge tailwindcss autoprefixer postcss
```

### 3. Tailwind CSS 설정
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./elderberry-home-components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. 스타일 import
```javascript
// src/index.js 또는 App.js
import './elderberry-home-components/styles/globals.css';
```

## 🔧 컴포넌트 사용법

### HomePage 컴포넌트
```jsx
import HomePage from './elderberry-home-components/components/HomePage';
import ChatPage from './elderberry-chat-components/components/ChatPage'; // 채팅 컴포넌트
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}
```

### 개별 UI 컴포넌트 사용
```jsx
import { Button } from './elderberry-home-components/components/ui/button';
import { Card, CardContent } from './elderberry-home-components/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './elderberry-home-components/components/ui/tooltip';

function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Button>클릭하세요</Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>마우스를 올려보세요</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>툴팁 내용</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
```

## ⚙️ 라우팅 연동

### 채팅 페이지 연동
HomePage에서 사용자가 메시지를 입력하고 전송하면 자동으로 `/chat` 경로로 이동합니다.

```jsx
// HomePage.jsx 내부 로직
const handleSendMessage = () => {
  const message = inputMessage.trim();
  if (!message) return;

  // 채팅 페이지로 이동하면서 프롬프트 전달
  navigate('/chat', { state: { prompt: message } });
};
```

### 채팅 페이지에서 프롬프트 받기
```jsx
// ChatPage.jsx에서
import { useLocation } from 'react-router-dom';

function ChatPage() {
  const location = useLocation();
  
  useEffect(() => {
    const initialPrompt = location.state?.prompt;
    if (initialPrompt) {
      // 자동으로 메시지 전송
      sendMessage(initialPrompt);
    }
  }, [location.state]);
}
```

## 🎨 커스터마이징

### 브랜드명 변경
```jsx
// elderberry-home-components/components/HomePage.jsx
<h1 className="font-bold text-[#111111] text-[28.2px] text-center leading-[48px]">
  Your Brand Name  {/* "Elderberry" → "Your Brand Name" */}
</h1>
```

### 플레이스홀더 텍스트 변경
```jsx
<textarea
  placeholder="여기에 원하는 안내 메시지를 입력하세요"  {/* "당신의 노년을 돕습니다." → 커스텀 메시지 */}
  // ...
/>
```

### 사이드바 메뉴 커스터마이징
```jsx
// HomePage.jsx에서 menuItems 수정
const menuItems = [
  { icon: <HelpCircle className="w-4 h-4" />, text: "고객지원" },
  { icon: <LogIn className="w-4 h-4" />, text: "로그인" },
  { icon: <ExternalLink className="w-4 h-4" />, text: "메인 사이트" },
];
```

### 브랜드 컬러 변경
```css
/* elderberry-home-components/styles/globals.css */
:root {
  /* 메인 브랜드 컬러를 원하는 색상으로 변경 */
  --elderberry-primary: #your-color;
  --elderberry-primary-dark: #your-darker-color;
}
```

```jsx
// 컴포넌트에서 색상 클래스 변경
className="border-2 border-[#your-color]"  // #29b79c → #your-color
```

### 푸터 텍스트 변경
```jsx
// HomePage.jsx 푸터 섹션
<footer className="flex items-center justify-center gap-[12.01px] w-full mt-8">
  <div className="text-[#818181] text-[11.1px] text-center leading-[19.2px]">
    커스텀 안내 메시지
  </div>
  <div className="text-[#818181] text-[11.2px] text-center leading-[19.2px]">
    <span className="font-bold">개인정보처리방침 </span>
    <span className="font-normal">이용약관</span>
  </div>
</footer>
```

## 🔄 라우팅 설정 예시

### 완전한 App.js 예시
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './elderberry-home-components/components/HomePage';
import ChatPage from './elderberry-chat-components/components/ChatPage';

// 스타일 import
import './elderberry-home-components/styles/globals.css';
import './elderberry-chat-components/styles/globals.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          {/* 기타 라우트 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

### 네비게이션 기능 추가
```jsx
// HomePage.jsx에서 메뉴 아이템에 클릭 이벤트 추가
const handleMenuClick = (menuText) => {
  switch(menuText) {
    case '도움말':
      // 도움말 페이지로 이동
      navigate('/help');
      break;
    case '로그인':
      // 로그인 페이지로 이동
      navigate('/login');
      break;
    case 'Elderberry로 이동':
      // 외부 사이트로 이동
      window.open('https://elderberry.com', '_blank');
      break;
    default:
      break;
  }
};
```

## 🧪 테스트

### 기본 기능 테스트
1. **홈페이지 로딩**: 브랜드명과 입력창이 정상 표시되는지 확인
2. **사이드바**: 접기/펼치기 기능이 작동하는지 확인
3. **프롬프트 입력**: 텍스트 입력 후 Enter 키 또는 전송 버튼 클릭
4. **페이지 이동**: 채팅 페이지로 정상 이동하는지 확인
5. **반응형**: 모바일/태블릿/데스크톱에서 레이아웃 확인

### 테스트 시나리오
```
1. 홈페이지 접속
2. "안녕하세요" 입력 후 전송
3. 채팅 페이지로 이동 확인
4. 자동으로 메시지가 전송되는지 확인
```

## 🐛 문제 해결

### 자주 발생하는 문제

#### 1. 라우팅이 작동하지 않는 경우
```jsx
// BrowserRouter가 최상위에 있는지 확인
// Route path가 정확한지 확인
<Route path="/" element={<HomePage />} />
<Route path="/chat" element={<ChatPage />} />
```

#### 2. 스타일이 적용되지 않는 경우
```bash
# Tailwind CSS 설정 확인
# globals.css import 확인
```

#### 3. 컴포넌트 import 에러
```jsx
// 상대 경로 확인
import HomePage from './elderberry-home-components/components/HomePage';
```

## 📞 지원

문제가 발생하거나 추가 기능이 필요한 경우:
1. GitHub Issues 생성
2. 개발팀 연락
3. 문서 참조

## 📝 변경 로그

### v1.0.0
- 초기 릴리스
- HomePage 컴포넌트
- UI 컴포넌트 라이브러리 (Button, Card, Tooltip, Separator)
- Tailwind CSS 스타일링
- 반응형 디자인 지원
- 채팅 페이지 연동 기능