# 🤖 Claude AI 개발 지침서

> **모든 작업 시작 전 필수 체크리스트**  
> 이 문서를 먼저 읽고 지침을 준수하여 작업하세요!

---

## 🔍 작업 시작 전 필수 체크

### 📋 Step 1: 프로젝트 상태 파악
- [ ] `CLAUDE.md` 전체 내용 숙지
- [ ] 현재 진행 중인 Phase 확인
- [ ] 최근 완료된 작업 내용 파악
- [ ] 관련 문서 (`docs/phases/*.md`, `docs/DEVELOPMENT_PLAN.md`) 검토

### 📋 Step 2: 기술적 제약사항 확인
- [ ] 사용 가능한 기술 스택 확인
- [ ] 금지된 기술/패턴 확인
- [ ] 성능 및 보안 요구사항 검토
- [ ] 테스트 커버리지 목표 확인

### 📋 Step 3: 코딩 규칙 점검
- [ ] 네이밍 컨벤션 확인
- [ ] 패키지 구조 규칙 숙지
- [ ] 주석 작성 규칙 (한국어 필수)
- [ ] 커밋 메시지 형식 확인

---

## 🎯 핵심 개발 원칙

### 🛡️ 절대 준수사항
1. **한국어 우선**: 모든 주석, 로그, 문서는 한국어
2. **보안 우선**: JWT 토큰 관리, 비밀번호 암호화 강화 적용
3. **성능 우선**: 캐싱, 비동기, N+1 쿼리 방지 필수
4. **테스트 우선**: 모든 기능에 적절한 테스트 코드
5. **문서화**: 복잡한 로직은 반드시 상세 설명

### 🚫 절대 금지사항
- 구 역할명 (`DOMESTIC_USER`, `OVERSEAS_USER`) 사용 금지
- 하드코딩된 설정값 (모든 설정은 `application.yml`)
- `@EntityGraph` 없는 연관 엔티티 조회
- 시간 소요 작업의 동기 처리
- 캐시 적용 없는 반복 조회 로직

---

## 🏗️ 아키텍처 패턴

### 📦 서비스 레이어 구조
```java
// 1. Core Service: 핵심 CRUD 로직
@Service
@Transactional
public class HealthAssessmentService {
    // 생성, 수정, 삭제 로직
}

// 2. Query Service: 조회 전용 로직
@Service
@Transactional(readOnly = true)
public class HealthAssessmentQueryService {
    // 복잡한 조회, 검색 로직
}

// 3. Stats Service: 통계/집계 로직
@Service
public class HealthAssessmentStatsService {
    @Async("statisticsExecutor")
    @Cacheable("healthAssessmentStats")
    // 비동기 통계 생성
}
```

### 🗃️ 엔티티 설계 패턴
```java
// 기반 클래스 활용
@MappedSuperclass
@SuperBuilder
public abstract class BaseProfile {
    // 공통 필드와 메서드
}

// 도메인별 특화
@Entity
@SuperBuilder
public class DomesticProfile extends BaseProfile {
    // 국내 특화 필드만
}
```

---

## ⚡ 성능 최적화 체크리스트

### 🚀 캐싱 적용
- [ ] 자주 조회되는 데이터에 `@Cacheable` 적용
- [ ] 용도별 캐시 설정 확인 (TTL, 크기)
- [ ] 캐시 무효화 전략 (`@CacheEvict`) 적용
- [ ] 캐시 통계 모니터링 설정

### 🔄 비동기 처리
- [ ] 시간 소요 작업에 `@Async` 적용
- [ ] 적절한 스레드 풀 선택 (`statisticsExecutor`, `matchingExecutor`)
- [ ] 예외 처리 및 로깅 추가
- [ ] 백프레셔 정책 고려

### 🗄️ 데이터베이스 최적화
- [ ] N+1 쿼리 방지 (`@EntityGraph` 사용)
- [ ] 배치 처리 설정 확인
- [ ] 인덱스 최적화 고려
- [ ] 쿼리 성능 모니터링

---

## 🔐 보안 체크리스트

### 🔑 인증/인가
- [ ] JWT 토큰 블랙리스트 관리
- [ ] Access/Refresh 토큰 분리
- [ ] 토큰 메타데이터 추적 (IP, User-Agent)
- [ ] 비밀번호 BCrypt 강도 12 이상

### 🛡️ 입력 검증
- [ ] `@Valid` 어노테이션 적용
- [ ] 상세한 오류 메시지 제공
- [ ] SQL 인젝션 방지
- [ ] XSS 공격 방지

### 📝 보안 로깅
- [ ] 인증 실패 로그
- [ ] 권한 부족 로그
- [ ] 민감 정보 마스킹
- [ ] IP 주소 추적

---

## 🧪 테스트 작성 가이드

### 📊 테스트 유형별 작성
```java
// 1. 단위 테스트
@ExtendWith(MockitoExtension.class)
class ServiceTest {
    @Mock Repository repository;
    @InjectMocks Service service;
    // 비즈니스 로직 테스트
}

// 2. 통합 테스트
@SpringBootTest
@ActiveProfiles("test")
class IntegrationTest {
    // 전체 애플리케이션 컨텍스트 테스트
}

// 3. E2E 테스트
@SpringBootTest(webEnvironment = RANDOM_PORT)
class E2ETest {
    // 전체 플로우 테스트
}
```

### ✅ 테스트 커버리지
- [ ] Service 클래스: 95% 이상
- [ ] Controller 클래스: 90% 이상
- [ ] 전체 프로젝트: 85% 이상
- [ ] 중요 비즈니스 로직: 100%

---

## 📝 코딩 스타일 가이드

### 🎨 네이밍 규칙
```java
// 클래스: PascalCase
public class HealthAssessmentService {}

// 메서드: camelCase
public void createHealthAssessment() {}

// 상수: UPPER_SNAKE_CASE
private static final int MAX_RETRY_COUNT = 3;

// 패키지: 소문자
package com.globalcarelink.health;
```

### 💬 주석 작성 규칙
```java
/**
 * 건강 평가 데이터를 생성하고 돌봄 등급을 자동 계산합니다.
 * 
 * @param request 건강 평가 생성 요청 데이터
 * @return 생성된 건강 평가 응답 데이터
 * @throws CustomException.BadRequest 유효하지 않은 입력 데이터인 경우
 */
public HealthAssessmentResponse createHealthAssessment(HealthAssessmentCreateRequest request) {
    // ADL 점수를 기반으로 돌봄 등급을 계산합니다
    CareGrade grade = calculateCareGrade(request);
    
    // 데이터베이스에 저장하고 응답을 반환합니다
    return saveAndConvertToResponse(request, grade);
}
```

---

## 🚨 에러 처리 가이드

### 🎯 예외 처리 패턴
```java
// 1. 커스텀 예외 사용
throw new CustomException.NotFound("건강 평가를 찾을 수 없습니다: " + id);

// 2. 상세한 오류 정보 제공
ValidationErrorDetails errorDetails = validationErrorBuilder
    .create("입력값 유효성 검증에 실패했습니다")
    .addFieldError("birthYear", value, "1900년 이후 출생년도를 입력해주세요", "field.birth.year")
    .build();

// 3. 보안 고려 오류 메시지
// 민감한 정보는 로그에만 기록하고 사용자에게는 일반적인 메시지
log.error("데이터베이스 연결 실패: {}", detailError);
return "일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
```

---

## 📊 모니터링 & 로깅

### 📈 성능 모니터링
```java
// 1. 메서드 실행 시간 측정
@Timed(name = "health.assessment.creation", description = "건강 평가 생성 시간")
public HealthAssessmentResponse createHealthAssessment() {
    long startTime = System.currentTimeMillis();
    try {
        // 비즈니스 로직
    } finally {
        long duration = System.currentTimeMillis() - startTime;
        if (duration > 1000) {
            log.warn("건강 평가 생성 지연: {}ms", duration);
        }
    }
}

// 2. 캐시 히트율 모니터링
log.info("캐시 통계 - 히트율: {:.2f}%, 요청수: {}", hitRate, requestCount);
```

### 📝 구조화된 로깅
```java
// JSON 형태의 구조화된 로그
log.info("건강 평가 생성 완료 - memberId: {}, assessmentId: {}, careGrade: {}, duration: {}ms", 
         memberId, assessmentId, careGrade, duration);

// 보안 이벤트 로깅
log.warn("로그인 실패 - email: {}, ip: {}, userAgent: {}", 
         email, ipAddress, userAgent);
```

---

## 🔄 작업 플로우

### 🚀 개발 시작
1. **요구사항 분석**: 무엇을 만들어야 하는가?
2. **기술 조사**: 어떤 기술을 사용할 것인가?
3. **설계**: 어떻게 구현할 것인가?
4. **테스트 작성**: 어떻게 검증할 것인가?

### 🔨 구현 단계
1. **엔티티 설계**: 데이터 모델 정의
2. **Repository 구현**: 데이터 접근 계층
3. **Service 구현**: 비즈니스 로직 계층
4. **Controller 구현**: 웹 계층
5. **테스트 작성**: 각 계층별 테스트

### ✅ 완료 검증
1. **기능 테스트**: 요구사항 충족 확인
2. **성능 테스트**: 응답 시간, 처리량 확인
3. **보안 테스트**: 취약점 점검
4. **코드 리뷰**: 품질 기준 충족 확인

---

## 📚 참고 자료

### 🔍 코드 참고처
- **서비스 패턴**: `HealthAssessmentService`, `HealthAssessmentQueryService`
- **엔티티 설계**: `BaseProfile`, `DomesticProfile`, `OverseasProfile`
- **캐시 설정**: `CacheConfig.java`
- **비동기 설정**: `AsyncConfig.java`
- **보안 설정**: `JwtTokenProvider.java`, `PasswordEncoderConfig.java`

### 📖 문서 참고처
- **전체 계획**: `docs/DEVELOPMENT_PLAN.md`
- **완료 내역**: `DEVELOPMENT_SUMMARY.md`
- **API 가이드**: `README.md`
- **현재 상태**: `CLAUDE.md`

---

## 🎯 품질 기준

### 📊 정량적 기준
- **응답 시간**: 평균 200ms 이하
- **테스트 커버리지**: 85% 이상
- **캐시 히트율**: 80% 이상
- **에러율**: 0.1% 이하

### 🏆 정성적 기준
- **가독성**: 주석 없이도 이해 가능한 코드
- **유지보수성**: 변경이 쉬운 구조
- **확장성**: 새 기능 추가가 용이한 설계
- **안정성**: 예외 상황에 대한 적절한 처리

---

## 🚨 긴급 상황 대응

### 🐛 버그 발생 시
1. **로그 확인**: `logs/elderberry.log`
2. **재현 시도**: 동일한 조건으로 테스트
3. **영향 범위 파악**: 어떤 기능이 영향받는가?
4. **임시 조치**: 서비스 중단 최소화
5. **근본 원인 분석**: 왜 발생했는가?
6. **재발 방지**: 어떻게 예방할 것인가?

### 🔥 성능 이슈 시
1. **메트릭 확인**: `/actuator/metrics`
2. **캐시 상태**: `/actuator/caches`
3. **스레드 덤프**: `/actuator/threaddump`
4. **메모리 분석**: 힙 덤프 분석
5. **쿼리 분석**: 느린 쿼리 식별
6. **최적화 적용**: 병목 지점 개선

---

## 💡 개발 팁

### 🎯 효율적인 개발
- **작은 단위로 나누기**: 큰 기능을 작은 단위로 분해
- **테스트 먼저**: TDD 방식으로 개발
- **자주 커밋**: 작은 변경사항도 자주 커밋
- **문서화**: 복잡한 로직은 즉시 문서화

### 🔍 디버깅 전략
- **로그 활용**: 적절한 로그 레벨과 메시지
- **단계별 확인**: 각 단계별로 상태 확인
- **격리 테스트**: 문제 부분만 분리하여 테스트
- **동료 검토**: 다른 관점에서의 검토

---

## 🎉 성공 지표

### ✨ 좋은 코드의 특징
- **읽기 쉬운 코드**: 주석 없이도 의도가 명확
- **테스트 가능한 코드**: 의존성이 적고 격리 가능
- **변경 용이한 코드**: 새 요구사항에 쉽게 대응
- **성능 좋은 코드**: 효율적인 알고리즘과 자료구조

### 🏆 프로젝트 성공 기준
- **사용자 만족도**: 빠르고 안정적인 서비스
- **개발 효율성**: 새 기능 개발 속도
- **운영 안정성**: 장애 없는 서비스 운영
- **확장 가능성**: 트래픽 증가에 대한 대응력

---

<div align="center">
  <h2>🌿 Elderberry와 함께 더 나은 돌봄 서비스를 만들어가요!</h2>
  <p><strong>이 지침을 따라 품질 높은 코드를 작성해주세요.</strong></p>
  <p><em>Made with ❤️ by Claude AI</em></p>
</div>

---

**📌 이 문서는 모든 작업 전에 반드시 확인해야 하는 필수 가이드입니다.** 