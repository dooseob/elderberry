# 엘더베리 프론트엔드 아키텍처 가이드

## 🏗️ 폴더 구조 설계 원칙

### 계층별 아키텍처 (Layered Architecture)

```
src/
├── app/                    # 앱 전역 설정 및 프로바이더
│   ├── providers/          # Context Providers
│   ├── router/            # 라우터 설정
│   └── store/             # 전역 스토어 설정
├── shared/                # 공유 자원 (재사용 가능)
│   ├── api/               # API 클라이언트 및 공통 요청
│   ├── components/        # 공통 UI 컴포넌트
│   ├── hooks/             # 공통 훅
│   ├── lib/               # 외부 라이브러리 래퍼
│   ├── types/             # 공통 타입 정의
│   └── utils/             # 유틸리티 함수
├── entities/              # 비즈니스 엔티티 (도메인 객체)
│   ├── auth/              # 인증 관련 엔티티
│   ├── facility/          # 시설 관련 엔티티
│   ├── health/            # 건강평가 관련 엔티티
│   └── profile/           # 프로필 관련 엔티티
├── features/              # 기능별 비즈니스 로직
│   ├── auth/              # 인증 기능
│   ├── dashboard/         # 대시보드 기능
│   ├── facility-search/   # 시설 검색 기능
│   └── health-assessment/ # 건강평가 기능
├── pages/                 # 페이지 컴포넌트 (라우트 연결점)
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드 페이지
│   └── facility/          # 시설 관련 페이지
└── widgets/               # 복합 위젯 (여러 entities 조합)
    ├── facility-search/   # 시설 검색 위젯
    └── health-wizard/     # 건강평가 위젯
```

## 🎯 설계 원칙

### 1. Feature-Sliced Design (FSD) 적용
- **Layer**: app > pages > widgets > features > entities > shared
- **Slice**: 도메인별 수직 분할
- **Segment**: ui, model, api, lib 등 관심사별 분할

### 2. 의존성 규칙 (Dependency Rule)
- **상위 계층 → 하위 계층**: 가능
- **하위 계층 → 상위 계층**: 불가능
- **같은 계층 내**: Slice 간 의존 최소화

### 3. 단일 책임 원칙 (SRP)
- **entities**: 도메인 로직과 상태
- **features**: 사용자 상호작용과 비즈니스 규칙
- **widgets**: 복합 기능 조합
- **pages**: 라우팅과 레이아웃

## 📦 모듈 구조 예시

### entities/auth/
```
entities/auth/
├── model/
│   ├── store.ts           # Zustand 스토어
│   ├── types.ts           # 타입 정의
│   └── selectors.ts       # 상태 선택자
├── api/
│   ├── authApi.ts         # API 호출
│   └── types.ts           # API 타입
├── lib/
│   ├── validation.ts      # 유효성 검사
│   └── utils.ts           # 유틸리티
└── index.ts               # Public API
```

### features/auth/login/
```
features/auth/login/
├── ui/
│   ├── LoginForm.tsx      # 프레젠테이션 컴포넌트
│   └── index.ts           # UI exports
├── model/
│   ├── store.ts           # 로컬 상태
│   └── validation.ts      # 폼 유효성 검사
├── api/
│   └── loginMutation.ts   # React Query 뮤테이션
└── index.ts               # Feature exports
```

## 🔄 마이그레이션 계획

### Phase 1: 기반 구조 생성
1. 새로운 폴더 구조 생성
2. 공통 컴포넌트 이동 (shared/components)
3. 타입 정의 정리 (shared/types, entities/*/types)

### Phase 2: 엔티티 분리
1. 도메인별 엔티티 생성
2. API 레이어 분리
3. 상태 관리 구조화

### Phase 3: 기능 모듈화
1. Features 재구성
2. 위젯 추출
3. 페이지 단순화

### Phase 4: 최적화
1. 의존성 최적화
2. 번들 분할 최적화
3. 성능 검증

## 🎨 컴포넌트 설계 패턴

### Container/Presentation 패턴
```typescript
// Container (Smart Component)
const LoginContainer: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { register, handleSubmit } = useForm<LoginFormData>();

  const onSubmit = handleSubmit(async (data) => {
    await login(data);
  });

  return (
    <LoginForm
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
};

// Presentation (Dumb Component)
interface LoginFormProps {
  onSubmit: (event: FormEvent) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit}>
      {/* UI 로직만 포함 */}
    </form>
  );
};
```

### Compound Component 패턴
```typescript
const FacilityCard = {
  Root: FacilityCardRoot,
  Header: FacilityCardHeader,
  Content: FacilityCardContent,
  Actions: FacilityCardActions,
};

// 사용 예시
<FacilityCard.Root>
  <FacilityCard.Header title={facility.name} />
  <FacilityCard.Content description={facility.description} />
  <FacilityCard.Actions>
    <Button>상세보기</Button>
  </FacilityCard.Actions>
</FacilityCard.Root>
```

## 📊 상태 관리 아키텍처

### 계층별 상태 분리
- **Global State** (app/store): 전역 설정, 인증 상태
- **Entity State** (entities/*/model): 도메인 데이터
- **Feature State** (features/*/model): 지역 UI 상태
- **Component State** (useState): 컴포넌트 내부 상태

### Zustand 스토어 구조 표준화
```typescript
interface EntityStore<T> {
  // 상태
  items: T[];
  selectedItem: T | null;
  loading: boolean;
  error: string | null;
  
  // 액션
  fetchItems: () => Promise<void>;
  selectItem: (id: string) => void;
  createItem: (item: Partial<T>) => Promise<void>;
  updateItem: (id: string, item: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // 유틸리티
  clearError: () => void;
  reset: () => void;
}
```

## 🚀 성능 최적화 전략

### 코드 분할 (Code Splitting)
- **Route Level**: 페이지 단위 lazy loading
- **Feature Level**: 큰 기능 단위 분할
- **Component Level**: 무거운 컴포넌트 분할

### 메모이제이션 전략
- **React.memo**: Props 변경 감지
- **useMemo**: 계산 비용이 높은 값
- **useCallback**: 함수 참조 안정화

### 상태 구독 최적화
- **Zustand Selectors**: 필요한 상태만 구독
- **React Query**: 서버 상태 캐싱
- **Debounced Updates**: 빈번한 업데이트 제어

## 🔧 개발 도구 및 품질 관리

### 타입 안전성
- **Strict TypeScript**: 엄격한 타입 검사
- **API Types**: OpenAPI 기반 타입 생성
- **Runtime Validation**: Zod 스키마 검증

### 테스트 전략
- **Unit Tests**: 유틸리티, 훅, 순수 함수
- **Integration Tests**: 컴포넌트 상호작용
- **E2E Tests**: 사용자 플로우 검증

### 코드 품질
- **ESLint**: 정적 분석
- **Prettier**: 코드 포매팅
- **Husky**: Git Hooks
- **Conventional Commits**: 커밋 메시지 규칙