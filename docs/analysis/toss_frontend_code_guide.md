# 토스 프런트엔드 코드 품질 가이드

## 🎯 핵심 철학

> **좋은 프런트엔드 코드 = 변경하기 쉬운 코드**

새로운 요구사항을 구현할 때, 기존 코드를 **수정하고 배포하기 수월한 코드**가 좋은 코드입니다.

---

## 📏 변경하기 쉬운 코드의 4가지 기준

### 1. 가독성 (Readability) 📖

**"코드가 읽기 쉬운 정도"**

#### 핵심 원칙
- 읽는 사람이 **한 번에 고려하는 맥락이 적어야** 함
- 코드가 **위에서 아래로 자연스럽게** 이어져야 함
- **6~7개 정도의 맥락**을 한 번에 고려할 수 있도록 작은 단위로 추상화

#### 📌 가독성 개선 전략

##### 1) 맥락 줄이기
```javascript
// ❌ 나쁜 예: 너무 많은 맥락
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  
  useEffect(() => {
    if (isViewer) return;
    showButtonAnimation();
  }, [isViewer]);
  
  return isViewer ? (
    <TextButton disabled>Submit</TextButton>
  ) : (
    <Button type="submit">Submit</Button>
  );
}

// ✅ 좋은 예: 맥락 분리
function SubmitButton() {
  const { isViewer } = useUserRole();
  
  return (
    <ConditionalButton
      isDisabled={isViewer}
      onRender={!isViewer ? showButtonAnimation : undefined}
    >
      Submit
    </ConditionalButton>
  );
}
```

##### 2) 매직 넘버 제거
```javascript
// ❌ 나쁜 예
await delay(300);
if (response.status === 404) return;

// ✅ 좋은 예
const ANIMATION_DURATION = 300;
const HTTP_STATUS = {
  NOT_FOUND: 404
} as const;

await delay(ANIMATION_DURATION);
if (response.status === HTTP_STATUS.NOT_FOUND) return;
```

##### 3) 의미 있는 네이밍
```javascript
// ❌ 나쁜 예
const data = fetchUserData();
const isValid = data.status === 'active' && data.role !== 'guest';

// ✅ 좋은 예
const userData = fetchUserData();
const isActiveUser = userData.status === 'active' && userData.role !== 'guest';
```

##### 4) 시점 이동 최소화
```javascript
// ❌ 나쁜 예: 여러 파일을 오가며 읽어야 함
// file1.ts
export const getUserInfo = () => { /* ... */ };

// file2.ts  
import { getUserInfo } from './file1';
const user = getUserInfo();

// ✅ 좋은 예: 한 곳에서 파악 가능
const UserProfile = () => {
  const user = useUserInfo(); // 커스텀 훅으로 추상화
  
  return <div>{user.name}</div>;
};
```

---

### 2. 예측가능성 (Predictability) 🔮

**"동료들이 함수나 컴포넌트의 동작을 얼마나 예측할 수 있는지"**

#### 핵심 원칙
- **일관적인 규칙**을 따름
- 함수/컴포넌트의 **이름, 파라미터, 반환값**만 보고도 동작을 알 수 있음

#### 📌 예측가능성 개선 전략

##### 1) 일관된 네이밍 컨벤션
```javascript
// ✅ 좋은 예: 일관된 패턴
const fetchUserData = async (userId: string) => { /* ... */ };
const fetchProductData = async (productId: string) => { /* ... */ };
const fetchOrderData = async (orderId: string) => { /* ... */ };

// Boolean 반환 함수
const isValidEmail = (email: string) => boolean;
const hasPermission = (user: User) => boolean;
const canEdit = (resource: Resource) => boolean;
```

##### 2) 명확한 함수 시그니처
```javascript
// ❌ 예측하기 어려운 예
function processData(data: any, options?: any): any;

// ✅ 예측 가능한 예  
interface ProcessOptions {
  sortBy?: 'name' | 'date';
  filterBy?: string;
  limit?: number;
}

function processUserData(
  users: User[], 
  options: ProcessOptions = {}
): ProcessedUser[];
```

##### 3) 부수효과 최소화
```javascript
// ❌ 예측하기 어려운 예
function calculateTotal(items: Item[]) {
  // 예상치 못한 부수효과
  logAnalytics('calculation_performed');
  updateCache(items);
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ 예측 가능한 예
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// 부수효과는 별도 함수로 분리
function trackAndCalculateTotal(items: Item[]): number {
  const total = calculateTotal(items);
  logAnalytics('calculation_performed');
  updateCache(items);
  return total;
}
```

---

### 3. 응집도 (Cohesion) 🧲

**"수정되어야 할 코드가 항상 같이 수정되는지"**

#### 핵심 원칙
- **함께 변경되는 코드는 함께 배치**
- 한 부분을 수정했을 때 **다른 부분에서 의도치 않은 오류가 발생하지 않음**

#### ⚖️ 응집도 vs 가독성 트레이드오프

```
응집도 ↑ = 추상화 ↑ = 가독성 ↓
응집도 ↓ = 코드 중복 ↑ = 가독성 ↑
```

**판단 기준**:
- 함께 수정되지 않으면 **오류 위험이 높은 경우** → 응집도 우선 (추상화)
- 위험성이 낮은 경우 → 가독성 우선 (코드 중복 허용)

#### 📌 응집도 개선 전략

##### 1) 관련 파일을 같은 디렉토리에
```
// ✅ 좋은 구조: 함께 수정되는 파일들이 가까이
src/
├── features/
│   └── user-auth/
│       ├── hooks/
│       │   ├── useLogin.ts
│       │   └── useSignup.ts  
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   └── SignupForm.tsx
│       └── api/
│           └── authApi.ts
```

##### 2) 매직 넘버 상수화 (응집도 관점)
```javascript
// ❌ 나쁜 예: 여러 곳에 흩어진 값
const delay1 = 300; // 애니메이션 시간
const delay2 = 300; // 같은 애니메이션인데 다른 곳에서 정의

// ✅ 좋은 예: 중앙 집중화
const ANIMATION_CONFIG = {
  FADE_DURATION: 300,
  SLIDE_DURATION: 500,
  BOUNCE_DURATION: 800
} as const;
```

##### 3) 폼 필드 응집도 고려
```javascript
// ✅ 관련 상태를 함께 관리
const useUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '', 
    phone: ''
  });
  
  // 검증 로직도 함께
  const validate = () => {
    const newErrors = {
      name: !formData.name ? '이름을 입력해주세요' : '',
      email: !isValidEmail(formData.email) ? '올바른 이메일을 입력해주세요' : '',
      phone: !isValidPhone(formData.phone) ? '올바른 전화번호를 입력해주세요' : ''
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };
  
  return { formData, setFormData, errors, validate };
};
```

---

### 4. 결합도 (Coupling) 🔗

**"코드를 수정했을 때의 영향 범위"**

#### 핵심 원칙
- 코드 수정 시 **영향 범위가 제한적**이어야 함
- **변경에 따른 범위를 예측**할 수 있어야 함

#### 📌 결합도 감소 전략

##### 1) 의존성 주입
```javascript
// ❌ 높은 결합도
class UserService {
  private apiClient = new HttpClient(); // 직접 의존
  
  async getUser(id: string) {
    return this.apiClient.get(`/users/${id}`);
  }
}

// ✅ 낮은 결합도
class UserService {
  constructor(private apiClient: ApiClient) {} // 의존성 주입
  
  async getUser(id: string) {
    return this.apiClient.get(`/users/${id}`);
  }
}
```

##### 2) 인터페이스 활용
```typescript
// 추상화된 인터페이스 정의
interface StorageService {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

// 구체 구현체들
class LocalStorageService implements StorageService {
  get(key: string) { return localStorage.getItem(key); }
  set(key: string, value: string) { localStorage.setItem(key, value); }
  remove(key: string) { localStorage.removeItem(key); }
}

class SessionStorageService implements StorageService {
  get(key: string) { return sessionStorage.getItem(key); }
  set(key: string, value: string) { sessionStorage.setItem(key, value); }
  remove(key: string) { sessionStorage.removeItem(key); }
}

// 사용하는 쪽은 인터페이스에만 의존
class UserPreferences {
  constructor(private storage: StorageService) {}
  
  saveTheme(theme: string) {
    this.storage.set('theme', theme);
  }
}
```

##### 3) 이벤트 기반 아키텍처
```javascript
// ❌ 직접 호출 (높은 결합도)
class OrderService {
  createOrder(order: Order) {
    const savedOrder = this.saveOrder(order);
    
    // 직접 다른 서비스들을 호출
    this.emailService.sendConfirmation(savedOrder);
    this.inventoryService.updateStock(savedOrder);
    this.analyticsService.trackOrder(savedOrder);
    
    return savedOrder;
  }
}

// ✅ 이벤트 발행 (낮은 결합도)
class OrderService {
  createOrder(order: Order) {
    const savedOrder = this.saveOrder(order);
    
    // 이벤트만 발행
    this.eventBus.publish('order.created', savedOrder);
    
    return savedOrder;
  }
}

// 각 서비스는 독립적으로 이벤트 구독
this.eventBus.subscribe('order.created', (order) => {
  this.emailService.sendConfirmation(order);
});
```

---

## ⚖️ 4가지 기준의 트레이드오프

### 현실적 딜레마

**모든 기준을 동시에 만족하기는 어렵습니다.**

#### 상충 관계 예시

1. **응집도 ↑ vs 가독성 ↓**
   - 함수/변수를 추상화하면 응집도는 높아지지만 가독성이 떨어짐

2. **결합도 ↓ vs 응집도 ↓**  
   - 코드 중복을 허용하면 결합도는 낮아지지만 응집도가 떨어짐

3. **예측가능성 ↑ vs 유연성 ↓**
   - 일관된 규칙을 따르면 예측은 쉽지만 특수한 경우 대응이 어려움

### 📋 우선순위 결정 가이드

#### 상황별 우선순위

**1. 초기 개발 단계**
```
가독성 > 예측가능성 > 결합도 > 응집도
```
- 빠른 이해와 개발 속도가 중요

**2. 팀 규모 확장 시**
```  
예측가능성 > 응집도 > 가독성 > 결합도
```
- 일관성과 협업 효율성이 중요

**3. 유지보수 단계**
```
응집도 > 결합도 > 예측가능성 > 가독성  
```
- 안전한 변경과 영향 범위 제한이 중요

**4. 레거시 리팩토링**
```
결합도 > 응집도 > 가독성 > 예측가능성
```
- 점진적 개선과 위험 최소화가 중요

---

## 🛠️ 실무 적용 전략

### 1. 코드 리뷰 체크리스트

#### 📖 가독성 체크포인트
- [ ] 함수/변수명이 역할을 명확히 표현하는가?
- [ ] 매직 넘버나 하드코딩된 값이 있는가?
- [ ] 한 함수에서 고려해야 할 맥락이 6-7개 이하인가?
- [ ] 코드를 읽을 때 시점 이동이 최소화되어 있는가?

#### 🔮 예측가능성 체크포인트  
- [ ] 함수명과 실제 동작이 일치하는가?
- [ ] 일관된 네이밍 컨벤션을 따르는가?
- [ ] 예상치 못한 부수효과가 있는가?
- [ ] 함수 시그니처가 명확한가?

#### 🧲 응집도 체크포인트
- [ ] 함께 변경되는 코드가 가까이 배치되어 있는가?
- [ ] 관련된 상수/설정이 한 곳에 모여있는가?
- [ ] 비슷한 책임을 가진 코드가 분산되어 있지 않은가?

#### 🔗 결합도 체크포인트
- [ ] 불필요한 의존성이 있는가?
- [ ] 변경 시 영향 범위가 예측 가능한가?
- [ ] 인터페이스를 통한 추상화가 적절히 되어 있는가?

### 2. 점진적 개선 방법

#### 🎯 단계별 접근

**1단계: 가독성 개선**
- 매직 넘버를 상수로 치환
- 의미 있는 변수명으로 변경
- 긴 함수를 작은 함수로 분할

**2단계: 예측가능성 향상**
- 네이밍 컨벤션 통일
- 함수 시그니처 명확화
- 부수효과 분리

**3단계: 응집도/결합도 최적화**
- 관련 코드 그룹화
- 의존성 주입 적용
- 인터페이스 도입

### 3. 팀 차원의 적용

#### 📋 팀 컨벤션 수립
```markdown
## 우리 팀의 코드 품질 기준

### 우선순위
1. 예측가능성 (일관성 최우선)
2. 가독성 (빠른 이해)  
3. 응집도 (안전한 변경)
4. 결합도 (영향 범위 제한)

### 구체적 규칙
- 함수는 20줄 이하로 작성
- 매직 넘버 사용 금지
- 부수효과가 있는 함수는 명시적으로 표현
- ...
```

#### 🔧 자동화 도구 활용
- **ESLint**: 일관된 코딩 스타일
- **TypeScript**: 타입 안정성으로 예측가능성 향상
- **Prettier**: 코드 포맷팅 자동화
- **Husky**: 커밋 전 품질 검증

---

## 📚 추가 학습 자료

### 공식 문서
- [Frontend Fundamentals 공식 사이트](https://frontend-fundamentals.com/)
- [토스 기술 블로그](https://toss.tech/)

### 관련 도서
- 클린 코드 (Robert C. Martin)
- 리팩토링 (Martin Fowler)  
- 소프트웨어 아키텍처 101

### 커뮤니티
- [Frontend Fundamentals GitHub Discussions](https://github.com/toss/frontend-fundamentals)
- 토스 개발자 컨퍼런스 SLASH

---

## 🎯 마무리

### 핵심 기억사항

1. **좋은 코드 = 변경하기 쉬운 코드**
2. **4가지 기준을 모두 만족하기는 어려움**
3. **상황에 따른 우선순위 판단이 중요**
4. **팀과 프로젝트 상황을 고려한 적절한 균형점 찾기**

### 실천 방법

```
오늘부터 시작할 수 있는 것들:
✅ 매직 넘버를 상수로 변경하기
✅ 함수/변수명 다시 검토하기  
✅ 코드 리뷰 시 4가지 기준으로 평가하기
✅ 팀과 우선순위에 대해 논의하기
```

**좋은 코드는 하루아침에 만들어지지 않습니다. 꾸준한 개선과 팀의 합의가 핵심입니다!** 🚀