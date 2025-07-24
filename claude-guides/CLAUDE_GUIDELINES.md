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

### 🎯 테스트와 로그 기반 디버깅의 역할 구분

#### 📊 로그 기반 디버깅 시스템 (기존)
- **목적**: 운영 환경에서의 실시간 모니터링 및 이슈 추적
- **범위**: 시스템 성능, API 응답시간, 오류 발생률, 비즈니스 메트릭
- **사용 시점**: 개발 완료 후 운영 단계
- **한계**: 사후 대응 중심, 버그 예방 효과 제한적

#### 🧪 테스트 코드 시스템 (강화 필요)
- **목적**: 개발 단계에서의 품질 보장 및 회귀 방지
- **범위**: 비즈니스 로직 정확성, 엣지 케이스 처리, 성능 요구사항
- **사용 시점**: 개발 중 지속적 검증
- **장점**: 사전 예방, 리팩토링 안전성, 문서화 역할

### 📊 강화된 테스트 유형별 작성 기준

#### 1. 단위 테스트 (Unit Test) - 95% 이상 커버리지
```java
// ❌ 잘못된 예시 - 형식적 테스트
@Test
void testServiceInstantiation() {
    assertThat(service).isNotNull();
}

// ✅ 올바른 예시 - 비즈니스 로직 검증
@Test
@DisplayName("매칭 점수 계산 - 복합 조건 검증")
void testCalculateMatchingScore_ComplexScenario() {
    // Given
    HealthAssessment highNeedAssessment = createHighNeedAssessment();
    FacilityProfile excellentFacility = createExcellentFacility();
    
    // When
    BigDecimal score = service.calculateMatchingScore(excellentFacility, highNeedAssessment);
    
    // Then
    assertThat(score).isGreaterThan(BigDecimal.valueOf(85));
    assertThat(score).isLessThan(BigDecimal.valueOf(100));
    
    // 점수 구성 요소별 검증
    verify(gradeCalculator).calculateGradeScore(excellentFacility.getFacilityGrade());
    verify(distanceCalculator).calculateDistanceScore(anyString(), anyString());
}
```

#### 2. 통합 테스트 (Integration Test) - 90% 이상 커버리지
```java
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("시설 추천 서비스 통합 테스트")
class FacilityRecommendationIntegrationTest {
    
    @Test
    @DisplayName("Strategy 패턴 - 실제 데이터베이스 연동 매칭 테스트")
    void testRecommendationWithRealDatabase() {
        // Given
        setupTestData(); // 실제 DB에 테스트 데이터 삽입
        
        // When
        List<FacilityProfile> results = recommendationService
            .recommendFacilitiesByHealth(testAssessment, "서울특별시", 5);
        
        // Then
        assertThat(results).hasSize(5);
        assertThat(results).isSortedAccordingTo(
            Comparator.comparing(facility -> 
                recommendationService.calculateMatchingScore(facility, testAssessment))
                .reversed());
    }
}
```

#### 3. 성능 테스트 (Performance Test) - 필수 작성
```java
@Test
@DisplayName("매칭 알고리즘 성능 테스트 - 1000건 처리 시간")
@Timeout(value = 2, unit = TimeUnit.SECONDS)
void testMatchingPerformance() {
    // Given
    List<FacilityProfile> largeFacilityList = createLargeFacilityList(1000);
    
    // When
    long startTime = System.nanoTime();
    List<FacilityProfile> results = recommendationService
        .recommendFacilitiesByHealth(testAssessment, "서울특별시", 10);
    long endTime = System.nanoTime();
    
    // Then
    assertThat(results).hasSize(10);
    assertThat(Duration.ofNanos(endTime - startTime))
        .isLessThan(Duration.ofMillis(500)); // 500ms 이내
}
```

#### 4. 비동기 테스트 (Async Test) - 필수 작성
```java
@Test
@DisplayName("PublicDataSyncScheduler 병렬 처리 검증")
void testParallelProcessing() throws Exception {
    // Given
    when(facilitySyncService.syncAllRegions())
        .thenReturn(CompletableFuture.completedFuture(mockResults));
    
    // When
    CompletableFuture<Void> syncFuture = CompletableFuture.runAsync(() -> 
        scheduler.syncAllFacilities());
    
    // Then
    syncFuture.get(30, TimeUnit.SECONDS); // 타임아웃 내 완료 확인
    verify(schedulerExecutor, times(1)).execute(any(Runnable.class));
    verify(apiExecutor, times(1)).execute(any(Runnable.class));
}
```

### 🎯 필수 테스트 시나리오

#### 1. Strategy 패턴 검증
- [ ] 각 Strategy 구현체별 동작 확인
- [ ] Strategy 전환 시 결과 일관성 검증
- [ ] 새로운 Strategy 추가 시 기존 코드 영향도 확인

#### 2. 비동기 처리 검증
- [ ] 스레드 풀별 작업 분산 확인
- [ ] 예외 발생 시 스레드 풀 안정성 확인
- [ ] 동시성 이슈 (Race Condition) 테스트

#### 3. 서비스 분리 검증 (SRP 적용)
- [ ] 각 서비스의 단일 책임 준수 확인
- [ ] 서비스 간 의존성 최소화 검증
- [ ] 트랜잭션 경계 정확성 확인

#### 4. DRY 원칙 적용 검증
- [ ] 공통 로직 재사용 확인
- [ ] Template Method 패턴 동작 검증
- [ ] 코드 중복 제거 효과 측정

### ✅ 테스트 커버리지 강화 기준

#### 정량적 기준 (더 엄격하게)
- **Service 클래스**: 98% 이상 (기존 95%에서 상향)
- **Controller 클래스**: 95% 이상 (기존 90%에서 상향)
- **전체 프로젝트**: 90% 이상 (기존 85%에서 상향)
- **중요 비즈니스 로직**: 100% (변경 없음)
- **새로 작성된 코드**: 100% (신규 추가)

#### 정성적 기준 (신규 추가)
- **Edge Case 처리**: 경계값, null, 빈 컬렉션 등
- **예외 상황 처리**: 네트워크 오류, DB 오류, 타임아웃 등
- **비즈니스 규칙 검증**: 도메인 로직의 정확성
- **성능 요구사항**: 응답시간, 처리량, 메모리 사용량

### 🚨 테스트 실패 시 대응 절차

#### 1단계: 즉시 대응
- [ ] 빌드 중단 및 배포 차단
- [ ] 실패 원인 분석 (코드 변경 vs 환경 문제)
- [ ] 관련 개발자에게 즉시 알림

#### 2단계: 근본 원인 분석
- [ ] 테스트 실패 로그 상세 분석
- [ ] 코드 변경 이력 검토
- [ ] 의존성 변경 사항 확인

#### 3단계: 예방 조치
- [ ] 유사 케이스 테스트 추가
- [ ] 코드 리뷰 프로세스 강화
- [ ] 자동화된 품질 게이트 추가

### 📊 테스트 메트릭 모니터링

#### 일일 추적 지표
```java
// 테스트 실행 시간 모니터링
@TestExecutionListener
public class TestPerformanceListener {
    
    @Override
    public void testExecutionStarted(TestIdentifier testIdentifier) {
        startTime = System.nanoTime();
    }
    
    @Override
    public void testExecutionFinished(TestIdentifier testIdentifier, TestExecutionResult result) {
        long duration = System.nanoTime() - startTime;
        if (duration > Duration.ofSeconds(5).toNanos()) {
            log.warn("느린 테스트 감지: {} - {}ms", 
                testIdentifier.getDisplayName(), 
                Duration.ofNanos(duration).toMillis());
        }
    }
}
```

#### 주간 품질 리포트
- [ ] 테스트 커버리지 변화 추이
- [ ] 테스트 실행 시간 변화
- [ ] 실패율 및 실패 원인 분석
- [ ] 새로 추가된 테스트 수

### 🔄 테스트 작성 플로우 (개선된)

#### 개발 시작 전
1. **테스트 시나리오 설계**: 요구사항 분석 후 테스트 케이스 먼저 작성
2. **테스트 데이터 준비**: 다양한 시나리오를 위한 테스트 데이터 세트 구성
3. **성능 기준 설정**: 예상 응답시간, 처리량 등 명확한 기준 수립

#### 구현 단계
1. **TDD 적용**: Red-Green-Refactor 사이클 준수
2. **지속적 테스트**: 매 커밋마다 전체 테스트 실행
3. **코드 리뷰**: 테스트 코드도 프로덕션 코드와 동등하게 리뷰

#### 완료 검증
1. **커버리지 확인**: 설정된 기준 충족 여부 확인
2. **성능 검증**: 설정된 성능 기준 충족 여부 확인  
3. **통합 테스트**: 전체 시스템 연동 테스트

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

## 📚 작업 완료 후 문서화 가이드

### 🎯 문서화 필수 단계

#### 📝 Step 1: 작업 완료 보고서 작성
```markdown
## 🎉 [작업명] 완료 보고

### ✅ 완료된 작업
- **주요 구현사항**: 핵심 기능 요약
- **기술적 개선사항**: 성능, 보안, 아키텍처 개선점
- **파일 변경 내역**: 생성/수정/삭제된 파일 목록
- **설정 변경사항**: application.yml, build.gradle 등 설정 변경

### 📊 성과 지표
- **코드 품질**: 커버리지, 중복률, 복잡도 변화
- **성능 지표**: 응답시간, 메모리 사용량, 처리량 변화
- **보안 강화**: 적용된 보안 패치 및 개선사항

### 🔗 관련 문서
- **참조한 문서**: Context7, 기존 코드, 외부 문서
- **업데이트된 문서**: README, API 문서, 사용자 가이드
```

#### 🚨 Step 2: 트러블슈팅 이슈 기록
모든 작업에서 발생한 문제와 해결책을 체계적으로 기록:

```markdown
## 🔧 트러블슈팅 로그

### ❌ 이슈 #001: [문제 요약]
- **발생 시점**: 2025-07-23 14:30
- **문제 상황**: 구체적인 문제 설명
- **에러 메시지**: 
  ```
  정확한 에러 메시지 복사
  ```
- **근본 원인**: 문제의 실제 원인 분석
- **해결 방법**: 
  ```java
  // 적용한 해결책 코드
  ```
- **예방 조치**: 동일 문제 재발 방지책
- **학습 포인트**: 이 문제에서 배운 점

### ✅ 해결됨: 총 소요 시간 45분
```

#### 📋 Step 3: 중요 이슈 분류 및 정리

##### 🔴 Critical Issues (즉시 해결 필요)
- 시스템 장애를 일으킬 수 있는 문제
- 보안 취약점
- 데이터 손실 위험

##### 🟡 Important Issues (우선 해결)
- 성능 저하 문제
- 사용자 경험 문제
- 코드 품질 문제

##### 🟢 Minor Issues (시간 여유시 해결)
- 코드 스타일 문제
- 문서화 미비
- 리팩토링 기회

### 🗂️ 문서화 파일 구조

#### 프로젝트 루트 문서
```
docs/
├── troubleshooting/           # 트러블슈팅 기록
│   ├── 2025-07/              # 월별 정리
│   │   ├── week-01.md        # 주간 이슈 모음
│   │   ├── week-02.md
│   │   └── critical-issues.md # 중요 이슈만 별도 정리
│   └── solutions-db.md       # 해결책 데이터베이스
├── work-reports/             # 작업 완료 보고서
│   ├── 2025-07-23-async-optimization.md
│   ├── 2025-07-22-test-enhancement.md
│   └── template.md           # 보고서 템플릿
├── knowledge-base/           # 지식 베이스
│   ├── best-practices.md     # 모범 사례 모음
│   ├── lessons-learned.md    # 학습한 교훈들
│   └── quick-reference.md    # 빠른 참조 가이드
└── WORK_LOG.md              # 전체 작업 로그 (시간순)
```

### 📊 Step 4: 주기적 문서 정리

#### 주간 정리 (매주 금요일)
```markdown
## 📅 2025년 7월 4주차 개발 요약

### 🎯 주요 성과
- **완료된 작업**: 3개 주요 기능 구현
- **해결된 이슈**: 7개 (Critical: 1, Important: 3, Minor: 3)
- **코드 품질 개선**: 커버리지 85% → 90%

### 📈 핵심 지표 변화
- **응답 시간**: 500ms → 200ms (60% 개선)
- **메모리 사용**: 100MB → 70MB (30% 감소)
- **테스트 수**: 45개 → 73개 (62% 증가)

### 💡 이번 주 학습 포인트
1. **Strategy 패턴 적용**: 확장성 크게 향상
2. **비동기 처리 최적화**: 성능 대폭 개선
3. **테스트 전략 재정립**: 품질 보장 체계 구축

### 🔍 다음 주 중점 사항
- [ ] 남은 Critical 이슈 1건 해결
- [ ] 새로운 기능 개발 시 TDD 적용
- [ ] 성능 모니터링 자동화 구축
```

#### 월간 정리 (매월 말일)
```markdown
## 📅 2025년 7월 개발 총결산

### 🏆 월간 최고 성과
- **가장 큰 개선**: 테스트 전략 혁신 (형식적 → 실질적 품질 보장)
- **최고 성능 향상**: 매칭 알고리즘 200% 성능 개선
- **최고 학습**: Context7 모범사례 적용한 아키텍처 설계

### 📊 월간 통계
- **총 작업 시간**: 120시간
- **해결된 이슈**: 28개
- **작성된 테스트**: 156개
- **문서화 페이지**: 23개

### 🎓 핵심 교훈 TOP 3
1. **사전 계획의 중요성**: 아키텍처 설계에 충분한 시간 투자
2. **점진적 개선**: 작은 단위로 지속적 개선이 큰 변화 창출
3. **문서화 습관**: 즉시 기록이 나중의 시간 절약

### 🔮 다음 달 목표
- [ ] 새로운 기능 모듈 3개 완성
- [ ] 테스트 커버리지 95% 달성
- [ ] 성능 최적화로 응답시간 100ms 이하 달성
```

### 🔍 Step 5: 지식 베이스 구축

#### 솔루션 데이터베이스 (solutions-db.md)
```markdown
## 🔧 솔루션 데이터베이스

### 문제 카테고리별 해결책

#### 🗄️ 데이터베이스 관련
**문제**: H2/SQLite 하이브리드 설정 오류
**해결책**: application.yml 프로파일별 데이터소스 분리
**적용 시기**: 2025-07-23
**재사용 가능성**: ⭐⭐⭐⭐⭐

#### ⚡ 성능 최적화
**문제**: 스레드 풀 설정 최적화 필요
**해결책**: 용도별 전용 스레드 풀 생성 (AsyncConfig)
**적용 시기**: 2025-07-23  
**재사용 가능성**: ⭐⭐⭐⭐⭐

#### 🧪 테스트 관련
**문제**: 형식적 테스트 vs 실질적 테스트
**해결책**: 비즈니스 로직 중심 테스트로 전환
**적용 시기**: 2025-07-23
**재사용 가능성**: ⭐⭐⭐⭐⭐
```

#### 빠른 참조 가이드 (quick-reference.md)
```markdown
## ⚡ 빠른 참조 가이드

### 자주 사용하는 명령어
```bash
# 프로젝트 빌드 및 실행
./gradlew build
./gradlew bootRun --args='--spring.profiles.active=dev'

# 테스트 실행
./gradlew test
./gradlew test --continuous

# 특정 프로파일로 실행
java -Dspring.profiles.active=prod -jar app.jar
```

### 자주 발생하는 문제와 즉시 해결법
| 문제 | 즉시 해결법 | 상세 문서 |
|------|-------------|-----------|
| H2 콘솔 접속 안됨 | `spring.h2.console.enabled=true` 확인 | [링크] |
| JWT 토큰 만료 | `jwt.access-token-expiration` 값 확인 | [링크] |
| 스레드 풀 부족 | `app.async` 설정값 조정 | [링크] |
```

### 🤖 Claude AI 협업 최적화

#### AI 작업 패턴 기록
```markdown
## 🤖 Claude AI 작업 패턴 분석

### 📈 효과적인 협업 패턴
1. **명확한 요구사항 제시**: 구체적인 목표와 제약사항 명시
2. **단계별 진행**: 복잡한 작업을 작은 단위로 분할
3. **즉시 피드백**: 중간 결과물에 대한 빠른 검토와 수정

### 🎯 AI 활용 최적화 팁
- **Context 제공**: 이전 작업 내용과 현재 상황 명확히 전달
- **예제 활용**: 원하는 결과물의 예시 제공
- **제약사항 명시**: 지켜야 할 규칙과 피해야 할 사항 명확화

### 📊 작업 효율성 지표
- **평균 작업 완료 시간**: 2.3시간/기능
- **코드 품질 점수**: 94/100
- **재작업률**: 8% (목표: 5% 이하)
```

### 🔄 자동화된 문서 업데이트

#### GitHub Actions를 통한 자동 문서화
```yaml
# .github/workflows/auto-docs.yml
name: Auto Documentation Update

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Generate Work Report
        run: |
          echo "## 🤖 자동 생성 보고서 $(date)" >> docs/work-reports/auto-$(date +%Y%m%d).md
          echo "### 변경된 파일" >> docs/work-reports/auto-$(date +%Y%m%d).md
          git diff --name-only HEAD~1 HEAD >> docs/work-reports/auto-$(date +%Y%m%d).md
          
      - name: Update WORK_LOG
        run: |
          echo "- $(date): $(git log -1 --pretty=%B)" >> docs/WORK_LOG.md
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