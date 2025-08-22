# 🔥 Clerk 완전 전환 마이그레이션 완료 가이드

> **Phase 1 완료!** - 엘더베리 프로젝트의 JWT 인증에서 Clerk 기반 인증으로 완전 전환

## 📋 전환 완료 현황

### ✅ **완료된 작업들**

1. **Clerk 조직 시스템 설정** - 다중 역할 지원
   - 국내 사용자 (USER_DOMESTIC)
   - 해외 사용자 (USER_OVERSEAS)  
   - 국내/해외 요양보호사 (JOB_SEEKER_DOMESTIC/OVERSEAS)
   - 시설 관리자 (FACILITY)
   - 코디네이터 (COORDINATOR)
   - 관리자 (ADMIN)

2. **프론트엔드 완전 전환**
   - Clerk React SDK 통합 (`@clerk/clerk-react: ^5.43.0`)
   - 기존 로그인/회원가입 페이지를 Clerk 컴포넌트로 교체
   - 역할 기반 권한 관리 시스템 구축
   - 안전성을 위한 레거시 라우트 유지

3. **백엔드 JWT 검증 시스템**
   - Clerk JWT 토큰 검증 필터 구현
   - 조직 멤버십 → 엘더베리 역할 매핑
   - 역할 기반 API 권한 제어
   - 레거시 JWT와 병행 지원 (안전성)

4. **환경 구성 및 보안**
   - 환경변수 기반 Clerk 설정
   - CORS 정책 업데이트
   - 보안 필터 체인 구성

## 🚀 **즉시 사용 가능한 기능들**

### **프론트엔드 인증**
```typescript
// 새로운 Clerk 기반 인증 사용
import { useElderberryAuth } from './hooks/useElderberryAuth';

function MyComponent() {
  const { 
    isSignedIn, 
    user, 
    elderberryRole,
    canUseCoordinatorService,
    canUseJobService 
  } = useElderberryAuth();

  if (!isSignedIn) return <div>로그인이 필요합니다</div>;
  
  return (
    <div>
      <h1>안녕하세요, {user?.firstName}님!</h1>
      <p>역할: {elderberryRole}</p>
      {canUseCoordinatorService && <CoordinatorPanel />}
    </div>
  );
}
```

### **백엔드 API 보호**
```java
// 자동으로 Clerk JWT 토큰 검증 및 역할 매핑
@GetMapping("/api/coordinators")
@PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
public ResponseEntity<List<Coordinator>> getCoordinators(Authentication auth) {
    String userEmail = auth.getName(); // Clerk에서 검증된 이메일
    // 비즈니스 로직...
}
```

## ⚙️ **설정 방법**

### **1. Clerk Dashboard 설정**

1. **Clerk 대시보드**에서 새 애플리케이션 생성
2. **Organizations** 기능 활성화
3. 다음 조직들을 생성하고 ID를 기록:
   - `elderberry-domestic-users`
   - `elderberry-overseas-users` 
   - `elderberry-job-seekers`
   - `elderberry-facilities`
   - `elderberry-coordinators`
   - `elderberry-admins`

### **2. 환경변수 설정**

**프론트엔드 (.env)**:
```bash
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
VITE_ENABLE_CLERK_AUTH=true
VITE_ENABLE_JWT_AUTH=false

# Organization IDs (Clerk 대시보드에서 복사)
VITE_CLERK_ORG_DOMESTIC_USERS=org_your_actual_org_id_here
VITE_CLERK_ORG_OVERSEAS_USERS=org_your_actual_org_id_here
VITE_CLERK_ORG_JOB_SEEKERS=org_your_actual_org_id_here
VITE_CLERK_ORG_FACILITIES=org_your_actual_org_id_here
VITE_CLERK_ORG_COORDINATORS=org_your_actual_org_id_here
VITE_CLERK_ORG_ADMINS=org_your_actual_org_id_here
```

**백엔드 (.env)**:
```bash
# Clerk Backend Configuration
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here

# Organization mappings
CLERK_ORG_DOMESTIC_USERS=org_your_actual_org_id_here
CLERK_ORG_OVERSEAS_USERS=org_your_actual_org_id_here
CLERK_ORG_JOB_SEEKERS=org_your_actual_org_id_here
CLERK_ORG_FACILITIES=org_your_actual_org_id_here
CLERK_ORG_COORDINATORS=org_your_actual_org_id_here
CLERK_ORG_ADMINS=org_your_actual_org_id_here
```

### **3. 서버 실행**

```bash
# 백엔드 실행 (Spring Boot)
cd /mnt/c/Users/human-10/elderberry
./gradlew bootRun

# 프론트엔드 실행 (Vite)
cd /mnt/c/Users/human-10/elderberry/main
npm run dev
```

## 🔄 **라우트 변경사항**

### **새로운 Clerk 기반 인증 라우트**
- `/login` → Clerk SignIn 컴포넌트
- `/signup` → Clerk SignUp 컴포넌트

### **레거시 라우트 (마이그레이션 안전성)**
- `/login-legacy` → 기존 JWT 로그인 (필요시 사용)
- `/signup-legacy` → 기존 JWT 회원가입 (필요시 사용)

## 🎯 **역할별 기능 접근 권한**

| 기능 | 일반사용자 | 요양보호사 | 시설관리자 | 코디네이터 | 관리자 |
|------|------------|------------|------------|------------|--------|
| **코디네이터 서비스** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **구인구직 서비스** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **건강평가** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **시설 관리** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **전체 관리** | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🛡️ **보안 및 안전성 조치**

### **이중 보호 시스템**
1. **Clerk JWT 우선**: 새로운 Clerk 토큰을 먼저 검증
2. **레거시 JWT 백업**: Clerk 실패 시 기존 JWT 토큰으로 대체
3. **점진적 마이그레이션**: 사용자별로 단계적 전환 가능

### **데이터 안전성**
- 기존 사용자 데이터는 그대로 유지
- JWT 토큰 블랙리스트 시스템 병행 운영
- Redis 기반 세션 관리 유지

## 🧪 **테스트 시나리오**

### **1. 새 사용자 등록 테스트**
1. `/signup`으로 이동
2. Clerk 회원가입 폼 사용
3. 이메일 인증 완료
4. 역할 선택 (환자/가족, 요양보호사, 시설)
5. 대시보드 접속 확인

### **2. 기존 사용자 마이그레이션 테스트**
1. 기존 계정으로 `/login-legacy` 로그인
2. 계정 정보 확인 후 Clerk 계정 생성
3. 조직 가입 처리
4. `/login`으로 Clerk 로그인 테스트

### **3. 역할별 권한 테스트**
```bash
# API 권한 테스트 스크립트
curl -H "Authorization: Bearer <clerk_jwt_token>" \
     http://localhost:8080/api/coordinators

# 예상 응답: 권한에 따른 200 OK 또는 403 Forbidden
```

## 🚨 **주의사항 및 롤백 계획**

### **긴급 롤백 방법**
1. **프론트엔드 롤백**: 환경변수에서 `VITE_ENABLE_CLERK_AUTH=false` 설정
2. **백엔드 롤백**: `ClerkSecurityConfig` 비활성화
3. **레거시 라우트 활용**: `/login-legacy`, `/signup-legacy` 사용

### **문제 해결**
- **토큰 검증 실패**: Clerk 대시보드에서 키 확인
- **역할 매핑 오류**: 조직 ID 환경변수 확인  
- **CORS 에러**: `application.yml`의 CORS 설정 점검

## 📊 **성능 및 모니터링**

### **로깅 확인**
```bash
# 백엔드 인증 로그 확인
tail -f logs/elderberry.log | grep "ClerkJwtAuthenticationFilter"

# 역할 매핑 로그 확인  
tail -f logs/elderberry.log | grep "ClerkRoleMapper"
```

### **메트릭 모니터링**
- **인증 성공률**: Actuator `/actuator/metrics` 엔드포인트
- **응답 시간**: Clerk JWT 검증 성능
- **에러율**: 인증 실패 빈도

## 🎉 **마이그레이션 완료 확인**

모든 설정이 완료되면 다음을 확인하세요:

1. ✅ Clerk 대시보드에서 사용자 등록 확인
2. ✅ 프론트엔드에서 `/login` 접속 → Clerk UI 표시
3. ✅ 백엔드 API 호출 시 Clerk JWT 토큰 검증
4. ✅ 역할별 권한 제어 정상 작동
5. ✅ 레거시 시스템과 병행 운영

---

**🔥 Clerk 완전 전환 마이그레이션 Phase 1 완료!**

**다음 단계**: Phase 2에서는 레거시 JWT 시스템 완전 제거 및 고급 Clerk 기능(2FA, SSO 등) 도입 예정