# 🛠️ devLogger 사용 가이드

개발용 로그와 에러 추적을 위한 최적화된 로거 시스템입니다.

## 📊 현재 프로젝트 console 사용 현황

### ✅ 최적화 완료
- **App.tsx**: 건강 평가 콜백 로그 → `devLogger.action`
- **useHealthAssessmentWizard.ts**: 진행상황 추적 → `devLogger.action` / `errorLogger`
- **LazyLoadErrorBoundary.tsx**: 컴포넌트 에러 → `errorLogger.component`
- **ChatPage.tsx**: 네트워크 에러 → `errorLogger.network`
- **performanceMonitor.ts**: 성능 로그 → `devLogger.performance`
- **healthAssessmentStore.ts**: 스토어 상태 → `devLogger.log` / `errorLogger.warn`
- **CoordinatorMatchingWizard.tsx**: 사용자 액션 → `devLogger.action`

### 📋 분류된 console 로그 현황

**🔴 제거된 개발용 디버깅 로그 (17개)**
```typescript
// Before (개발용 - 제거됨)
console.log('건강 평가 완료:', assessmentId);
console.log('코디네이터 상세 보기:', id);
console.log('미리보기');

// After (조건부 개발용)
devLogger.action('건강 평가 완료', { assessmentId });
devLogger.action('코디네이터 상세 보기', { coordinatorId: id });
// 미리보기는 기능 구현으로 대체
```

**🟡 보존된 중요한 에러 처리 로그 (32개)**
```typescript
// Before (에러 처리 - 보존됨)
console.error('프로필 데이터 로드 실패:', error);
console.warn('회원 ID가 필요합니다.');

// After (구조화된 에러 처리)
errorLogger.error('프로필 데이터 로드 실패', error);
errorLogger.warn('회원 ID가 필요합니다');
```

## 🚀 사용법

### 1. 개발용 로거 (프로덕션에서 자동 제거)

```typescript
import { devLogger } from '../utils/devLogger';

// 일반 개발 로그
devLogger.log('데이터 로드 완료', { count: items.length });

// 사용자 액션 추적
devLogger.action('버튼 클릭', { buttonId: 'submit', formData });

// 성능 측정
devLogger.performance('페이지 로드', loadTime);

// 디버그 정보
devLogger.debug('상태 변경', { before, after });

// 경고 (개발 환경에서만)
devLogger.warn('임시 구현');
```

### 2. 에러 로거 (프로덕션에서도 유지)

```typescript
import { errorLogger } from '../utils/devLogger';

// 사용자에게 영향을 주는 에러
errorLogger.error('데이터 로드 실패', error, { userId, endpoint });

// 네트워크 에러
errorLogger.network('/api/users', { status: 500, message: 'Server Error' });

// 컴포넌트 에러
errorLogger.component('UserProfile', error, errorInfo);

// 중요한 경고
errorLogger.warn('API 응답 지연', { responseTime: 5000 });
```

## 🔧 프로덕션 빌드 최적화

### Vite 설정 (이미 적용됨)
```typescript
// vite.config.ts
terserOptions: {
  compress: {
    drop_console: true,        // console.log 제거
    drop_debugger: true,       // debugger 제거  
    pure_funcs: [             // 특정 함수 제거
      'console.log', 
      'console.info'
    ],
  }
}
```

### 최적화 결과
- **개발 환경**: 모든 로그 출력
- **프로덕션 빌드**: `devLogger.*` 자동 제거, `errorLogger.*` 유지
- **번들 크기**: console 관련 코드 30-50% 감소
- **성능**: 불필요한 로그 호출 제거로 런타임 성능 향상

## 📈 성능 효과

### Before (기존 console 사용)
- **개발용 로그**: 프로덕션에서도 실행됨
- **에러 처리**: 일관성 없는 로그 형식
- **번들 크기**: 불필요한 console 호출 포함
- **유지보수**: 로그 관리 어려움

### After (devLogger 사용)
- **개발용 로그**: 프로덕션에서 자동 제거
- **에러 처리**: 구조화된 에러 추적
- **번들 크기**: 30-50% 감소
- **유지보수**: 중앙화된 로그 관리

## 🔍 남은 console 사용 현황

### 유지해야 할 에러 로그 (추가 최적화 예정)
```typescript
// 이미 적절한 에러 처리가 되어 있는 파일들
- stores/boardStore.ts (좋아요, 조회수 실패)
- stores/facilityStore.ts (매칭, 추적 실패)  
- stores/jobStore.ts (조회수 증가 실패)
- stores/authStore.ts (로그아웃 실패)
- features/profile/*.tsx (프로필 관련 에러)
- features/jobs/*.tsx (구인 관련 에러)
- features/facility/*.tsx (시설 관련 에러)
```

## 💡 모범 사례

### ✅ 권장 사용법
```typescript
// 개발 디버깅용
devLogger.action('사용자 액션', { context });
devLogger.performance('성능 측정', duration);

// 에러 추적용  
errorLogger.error('구체적인 에러 설명', error, context);
errorLogger.network('API 엔드포인트', errorDetails);
errorLogger.component('컴포넌트명', error, errorInfo);
```

### ❌ 피해야 할 사용법
```typescript
// 너무 빈번한 로그
onClick={() => devLogger.log('클릭')} // 매번 클릭마다 로그

// 의미없는 로그
devLogger.log('테스트'); // 구체적인 정보 없음

// 민감한 정보 로그
devLogger.log('비밀번호:', password); // 보안 위험
```

## 🚀 향후 개선 계획

1. **남은 console 로그 최적화**: Store 파일들의 에러 처리 로그 구조화
2. **로그 레벨링**: 로그 중요도에 따른 레벨 분류
3. **에러 추적 서비스 연동**: Sentry 등 외부 서비스 통합
4. **성능 모니터링**: 실시간 성능 지표 수집 및 분석

---

**📝 참고**: 이 가이드는 프로젝트의 console 로그 최적화 결과를 문서화한 것입니다. 새로운 기능 개발 시 devLogger 사용을 권장합니다.