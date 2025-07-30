# Feature-Sliced Design (FSD) 완벽 가이드

## 🎯 FSD란?

**Feature-Sliced Design (FSD)**는 프런트엔드 애플리케이션을 위한 현대적인 아키텍처 방법론입니다. 모듈 간의 느슨한 결합과 높은 응집력을 제공하며, 쉽게 확장할 수 있는 구조를 만드는 것이 목표입니다.

### 핵심 개념 3가지
1. **레이어(Layer)** - 최상위 디렉토리 구조
2. **슬라이스(Slice)** - 비즈니스 엔티티별 분할
3. **세그먼트(Segment)** - 목적별 코드 분할

---

## 📂 레이어 구조 (상위 → 하위)

### 1. `app` (필수)
- **역할**: 애플리케이션 초기화
- **포함**: 프로바이더, 라우터, 전역 스타일, 전역 타입
- **예시**: `app/providers/`, `app/router/`, `app/styles/`

### 2. `processes` (선택사항, Deprecated)
- **역할**: 다중 페이지 프로세스 (예: 회원가입 플로우)
- **상태**: 더 이상 권장하지 않음

### 3. `pages` (필수)
- **역할**: 애플리케이션 페이지
- **예시**: `pages/home/`, `pages/profile/`, `pages/product/`

### 4. `widgets` (선택사항)
- **역할**: 독립적인 UI 컴포넌트
- **예시**: `widgets/header/`, `widgets/sidebar/`, `widgets/footer/`

### 5. `features` (선택사항)
- **역할**: 비즈니스 가치를 전달하는 기능
- **예시**: `features/like-post/`, `features/write-review/`, `features/add-to-cart/`

### 6. `entities` (선택사항)
- **역할**: 비즈니스 엔티티
- **예시**: `entities/user/`, `entities/product/`, `entities/comment/`

### 7. `shared` (필수)
- **역할**: 재사용 가능한 코드
- **포함**: UI 키트, 유틸리티, API 설정
- **예시**: `shared/ui/`, `shared/lib/`, `shared/api/`

---

## 🔄 계층 구조 규칙

```
app → pages → widgets → features → entities → shared
```

**중요 규칙**: 
- 상위 레이어는 하위 레이어만 사용 가능
- 하위 레이어는 상위 레이어 사용 불가
- 같은 레벨 레이어끼리는 직접 참조 불가

---

## 🍰 슬라이스 (Slice)

각 레이어 내에서 **비즈니스 엔티티별로 코드를 그룹화**

### 예시 구조
```
features/
├── auth/           # 인증 관련 기능
├── product-search/ # 상품 검색 기능
├── shopping-cart/  # 장바구니 기능
└── user-profile/   # 사용자 프로필 기능

entities/
├── user/          # 사용자 엔티티
├── product/       # 상품 엔티티
└── order/         # 주문 엔티티
```

---

## 🧩 세그먼트 (Segment)

각 슬라이스 내에서 **목적에 따라 코드를 분할**

### 표준 세그먼트
- **`api/`** - 서버 요청 관련
- **`ui/`** - UI 컴포넌트
- **`model/`** - 비즈니스 로직, 상태 관리
- **`lib/`** - 헬퍼 함수
- **`config/`** - 설정값
- **`consts/`** - 상수

### 예시 구조
```
features/auth/
├── api/
│   ├── login.ts
│   └── logout.ts
├── ui/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── model/
│   ├── store.ts
│   └── types.ts
└── index.ts       # Public API
```

---

## 🔐 Public API

### 규칙
- 각 슬라이스/세그먼트는 `index.ts` 파일로 외부에 기능 노출
- 다른 모듈은 오직 Public API를 통해서만 접근 가능
- 내부 구현은 캡슐화

### 예시
```typescript
// features/auth/index.ts
export { LoginForm } from './ui/LoginForm'
export { useAuth } from './model/store'
export type { AuthUser } from './model/types'

// 사용하는 곳에서
import { LoginForm, useAuth } from 'features/auth'
```

---

## 💡 FSD의 장점

### ✅ 기술적 장점
- **모듈 교체/추가/제거 용이**
- **예측 가능한 구조**
- **명시적인 의존성**
- **높은 확장성**
- **기술 스택 독립적**

### ✅ 팀 협업 장점
- **표준화된 구조**
- **비즈니스 지향적**
- **코드 리뷰 용이**
- **새로운 팀원 온보딩 빠름**

---

## ⚠️ FSD의 단점

### ❌ 학습 비용
- **높은 진입 장벽**
- **팀 전체의 개념 이해 필요**
- **즉시 문제 해결 요구** (나중으로 미룰 수 없음)

### ❌ 프로젝트 제약
- **작은 프로젝트에는 과도할 수 있음**
- **MVP나 단기 프로젝트에는 부적합**

---

## 🆚 다른 아키텍처와 비교

### vs 고전적 아키텍처
```
// 고전적 아키텍처 (비권장)
src/
├── components/
├── pages/
├── utils/
├── hooks/
└── services/
```

**문제점**: 
- 암묵적 연결
- 복잡성 증가
- 유지보수 어려움

### vs 단순 모듈 아키텍처
**FSD가 해결하는 문제**:
- 어느 모듈에 기능을 넣을지 명확함
- 모듈 간 사용 규칙 명확
- 비즈니스 엔티티 저장 방식 표준화
- 글로벌 함수 의존성 해결

---

## 🔧 Next.js와 FSD 함께 사용하기

### 문제점
1. **Pages 충돌**: Next.js `pages/` vs FSD `pages/`
2. **App 레이어**: Next.js가 대부분 처리

### 해결 방법 1 (권장)
```
project/
├── pages/          # Next.js 라우팅
├── src/
│   ├── app/
│   ├── pages/      # FSD 페이지
│   ├── widgets/
│   ├── features/
│   ├── entities/
│   └── shared/
└── ...
```

### 해결 방법 2
```
project/
├── pages/          # Next.js 라우팅
├── pages-flat/     # FSD 페이지 (이름 변경)
├── src/
│   ├── widgets/
│   ├── features/
│   ├── entities/
│   └── shared/
└── ...
```

---

## 🚀 실무 적용 가이드

### 언제 FSD를 사용해야 할까?

#### ✅ 적합한 경우
- **중장기 프로젝트**
- **팀 규모 2명 이상**
- **복잡한 비즈니스 로직**
- **확장 가능성이 높은 프로젝트**
- **유지보수가 중요한 프로젝트**

#### ❌ 부적합한 경우
- **MVP 또는 프로토타입**
- **단기 프로젝트 (3개월 미만)**
- **개인 토이 프로젝트**
- **매우 단순한 정적 사이트**

### 도입 단계별 가이드

#### 1단계: 팀 학습
- FSD 공식 문서 스터디
- 예제 프로젝트 분석
- 팀 내 컨벤션 합의

#### 2단계: 점진적 적용
- 새로운 기능부터 FSD로 구현
- 기존 코드는 점진적으로 마이그레이션
- 리팩토링 시 FSD 구조로 변경

#### 3단계: 완전 적용
- 모든 새 코드는 FSD 규칙 준수
- 코드 리뷰에서 FSD 준수 확인
- 자동화 도구로 구조 검증

---

## 📚 참고 자료

### 공식 문서 및 예제
- [FSD 공식 문서](https://feature-sliced.design/)
- [Github Client 예제](https://github.com/ani-team/github-client)
- [Nike Store 예제](https://github.com/noveogroup-amorgunov/nukeapp)
- [Sudoku 예제](https://github.com/Shiyan7/sudoku-effector)

### 커뮤니티
- GitHub: feature-sliced/documentation
- Telegram/Discord 커뮤니티 활발

---

## 🎯 결론

FSD는 **중장기적으로 확장 가능한 프런트엔드 아키텍처**를 원하는 팀에게 매우 유용한 솔루션입니다. 

**핵심은**:
1. **레이어별 책임 분리**
2. **비즈니스 중심의 슬라이스 구조**
3. **Public API를 통한 캡슐화**
4. **팀 전체의 컨벤션 준수**

초기 학습 비용은 있지만, 장기적으로는 **유지보수성**, **확장성**, **팀 협업 효율성**에서 큰 이점을 제공합니다.