# 🏗️ 엘더베리 프로젝트 FSD 구조 가이드

> **Feature-Sliced Design 적용 완료** (2025-08-03)

## 📋 FSD 적용 결과 요약

### ✅ 완료된 FSD 레이어

#### 1. **app/** (필수) ✅
- **역할**: 애플리케이션 초기화 및 전역 설정
- **구성**: 프로바이더, 라우터, 전역 스타일
- **위치**: `src/app/providers/`

#### 2. **pages/** (필수) ✅
- **역할**: 애플리케이션 페이지
- **구성**: 각 라우트별 페이지 컴포넌트
- **위치**: `src/pages/`

#### 3. **widgets/** (추가됨) ✅
- **역할**: 독립적인 UI 위젯 컴포넌트
- **구성**: 
  - `widgets/header/` - 헤더 위젯
  - `widgets/sidebar/` - 사이드바 위젯  
  - `widgets/footer/` - 푸터 위젯
  - `widgets/breadcrumb/` - 브레드크럼 위젯
  - `widgets/layout/` - 메인 레이아웃 위젯
- **FSD 세그먼트**: 각 위젯별 `ui/` 세그먼트 + Public API (`index.ts`)

#### 4. **features/** (기존) ✅
- **역할**: 비즈니스 기능 모듈
- **구성**: 
  - `features/auth/` - 인증 기능
  - `features/facility/` - 시설 관련 기능
  - `features/health/` - 건강 평가 기능
  - `features/dashboard/` - 대시보드 기능
  - 기타 비즈니스 기능들

#### 5. **entities/** (확장됨) ✅
- **역할**: 비즈니스 엔티티 도메인 모델
- **구성**:
  - `entities/auth/` - 인증 엔티티 (기존)
  - `entities/user/` - 사용자 엔티티 (신규)
  - `entities/facility/` - 시설 엔티티 (신규) 
  - `entities/health/` - 건강 평가 엔티티 (신규)
  - `entities/notification/` - 알림 엔티티 (신규)
- **FSD 세그먼트**: 각 엔티티별 `model/` 세그먼트 + Public API (`index.ts`)

#### 6. **shared/** (필수) ✅
- **역할**: 재사용 가능한 공통 코드
- **구성**:
  - `shared/ui/` - 통합된 UI 컴포넌트 라이브러리
  - `shared/api/` - API 클라이언트
  - `shared/hooks/` - 공통 React 훅
  - `shared/lib/` - 유틸리티 라이브러리
  - `shared/types/` - 공통 타입 정의

### 🔄 FSD 계층 구조 준수

```
app → pages → widgets → features → entities → shared
```

- **상위 레이어는 하위 레이어만 사용 가능** ✅
- **하위 레이어는 상위 레이어 사용 불가** ✅
- **같은 레벨 레이어끼리는 직접 참조 불가** ✅

### 📦 Public API 패턴 적용

모든 FSD 레이어에 `index.ts` 파일로 캡슐화:

```typescript
// widgets/header/index.ts
export { Header } from './ui/Header';
export type { HeaderProps } from './ui/Header';

// entities/user/index.ts  
export type { User, UserSearchParams } from './model/types';
export { isUserWithProfile } from './model/types';
```

### 🧩 FSD 세그먼트 구조

#### Widgets 세그먼트
- `ui/` - UI 컴포넌트
- `index.ts` - Public API

#### Entities 세그먼트  
- `model/` - 도메인 모델과 타입
- `index.ts` - Public API

#### Features 세그먼트 (기존 유지)
- `components/` - 기능별 컴포넌트
- 각 기능별 페이지 컴포넌트

## 🎯 FSD 적용의 장점

### ✅ 달성된 목표

1. **모듈 교체/추가/제거 용이성**
   - 각 위젯과 엔티티가 독립적으로 관리
   - Public API를 통한 캡슐화로 내부 구현 변경 자유도 확보

2. **예측 가능한 구조**
   - 새로운 개발자도 코드 위치를 쉽게 예상 가능
   - 일관된 디렉토리 구조와 네이밍 컨벤션

3. **명시적인 의존성**
   - 계층 구조를 통한 명확한 의존성 방향
   - Import 경로만으로 의존성 파악 가능

4. **높은 확장성**
   - 새로운 엔티티나 위젯 추가 시 기존 코드 영향 최소화
   - 기능별 독립적인 개발 가능

5. **비즈니스 지향적 구조**
   - 도메인별로 코드가 응집되어 비즈니스 로직 파악 용이
   - 기술적 레이어보다 비즈니스 엔티티 중심 구조

## 🚀 사용 방법

### 새로운 엔티티 추가
```bash
mkdir -p src/entities/new-entity/model
touch src/entities/new-entity/model/types.ts
touch src/entities/new-entity/index.ts
```

### 새로운 위젯 추가
```bash
mkdir -p src/widgets/new-widget/ui
touch src/widgets/new-widget/ui/NewWidget.tsx
touch src/widgets/new-widget/index.ts
```

### Import 사용법
```typescript
// 👍 올바른 사용 (Public API를 통한 접근)
import { User } from 'entities/user';
import { Header } from 'widgets/header';
import { Button } from 'shared/ui';

// ❌ 잘못된 사용 (직접 내부 구현 접근)
import { User } from 'entities/user/model/types';
import { Header } from 'widgets/header/ui/Header';
```

## 📈 다음 단계 권장사항

1. **기존 import 경로 업데이트**
   - 기존 components/layout → widgets 경로로 변경
   - 새로운 entities 경로 반영

2. **Features 레이어 FSD 패턴 적용**
   - 각 feature 내부에 `api/`, `ui/`, `model/` 세그먼트 구조 적용
   - Public API 패턴 적용

3. **App 레이어 최적화**
   - 전역 프로바이더 정리 및 최적화
   - 라우터 구조 개선

## 🎉 FSD 적용 완료 현황

- ✅ **widgets/ 레이어**: Layout 컴포넌트들 FSD 구조로 재구성
- ✅ **entities/ 레이어**: 5개 주요 엔티티 추가 (auth, user, facility, health, notification)
- ✅ **shared/ui 통합**: 일관된 UI 컴포넌트 라이브러리 구축
- ✅ **Public API 패턴**: 모든 레이어에 캡슐화 적용
- ✅ **타입 안전성**: TypeScript와 완전 통합

엘더베리 프로젝트가 Feature-Sliced Design 아키텍처를 성공적으로 적용하여 **확장 가능하고 유지보수하기 쉬운 구조**로 발전했습니다! 🎊