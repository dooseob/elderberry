# CLAUDE.md

이 문서는 이 저장소에서 Claude Code (claude.ai/code)가 코드를 다룰 때 참고할 가이드입니다.

---

## 📌 프로젝트 개요

**글로벌 요양원 구인구직 웹사이트 "엘더베리(Elderberry)"**
- 재외동포 대상 글로벌 요양 서비스
- JDK 21 + Spring Boot 3.3.5 기반 신규 프로젝트
- 자본금 0원 개발 전략 (무료 서비스 활용)

---

## 🛠 핵심 기술 스택

### 백엔드
- **Java 21 LTS** + **Spring Boot 3.3.5** + **Gradle 8.x**
- **데이터베이스**: SQLite (무료)
- **보안**: Spring Security 6.x + JWT
- **API 문서**: OpenAPI 3.0 + Swagger UI
- **캐싱**: Caffeine Cache
- **비동기 처리**: Spring Async

### 프론트엔드  
- **React 18** + **TypeScript 5.x** + **Vite 5.x**
- **UI**: Tailwind CSS + Shadcn/ui
- **상태관리**: Zustand + TanStack Query

### 배포 & 도구
- **배포**: Railway/Render (무료) + GitHub Pages
- **CI/CD**: GitHub Actions
- **테스트**: JUnit 5 + MockMvc

---

## 🎯 프로젝트 완료 현황

### Phase 1 완료 ✅
- [x] Spring Boot 3.3.5 + JDK 21 프로젝트 구조
- [x] SQLite 데이터베이스 + Hibernate 6.x 설정
- [x] JWT 기반 Spring Security 6.x 인증 시스템
- [x] 회원 관리 시스템 (국내/해외/코디네이터/시설)
- [x] OpenAPI 3.0 + Swagger UI 문서화

### Phase 2 완료 ✅
- [x] React 18 + TypeScript + Vite 프론트엔드 구조
- [x] Tailwind CSS + Shadcn/ui 디자인 시스템
- [x] Zustand 상태 관리 + TanStack Query 데이터 페칭
- [x] JWT 기반 인증 연동
- [x] 반응형 UI 컴포넌트 라이브러리

### Phase 3 완료 ✅
- [x] KB라이프생명 기반 건강 상태 평가 시스템
- [x] ADL 점수 자동 계산 (걷기/식사/배변/의사소통)
- [x] 장기요양보험 등급 연동 케어 등급 산출
- [x] React 건강 평가 마법사 UI
- [x] 단계별 평가 폼 + 실시간 점수 계산

### Phase 4 완료 ✅
- [x] **Phase 4-A**: AI 기반 코디네이터 매칭 알고리즘
  - 5점 만점 매칭 점수 (전문성 40% + 경력 25% + 만족도 20% + 위치 10% + 가용성 5%)
  - 업무량 최적화 분배 시스템
  - 지능형 매칭 결과 설명 생성
  - 실시간 통계 및 성과 모니터링
- [x] **Phase 4-B**: React 매칭 결과 UI 및 성과 모니터링
  - CoordinatorMatchingWizard 메인 인터페이스
  - CoordinatorCard 프로필 카드
  - MatchingPreferencePanel 상세 설정
  - MatchingStatsDashboard 실시간 대시보드

### Phase 5 완료 ✅
- [x] **통합 테스트 스위트**: JUnit 5 기반 완전한 테스트 환경
  - CoordinatorMatchingServiceIntegrationTest: 매칭 시스템 통합 테스트
  - CoordinatorMatchingControllerTest: API 엔드포인트 테스트
  - HealthAssessmentControllerIntegrationTest: 건강 평가 시스템 테스트
  - HealthAssessmentToCoordinatorMatchingE2ETest: 전체 플로우 E2E 테스트
- [x] **성능 최적화**: Caffeine 캐시 + 비동기 처리
  - 3단계 캐시 전략 (매칭/평가/통계)
  - ThreadPoolTaskExecutor 기반 비동기 처리
  - 쿼리 최적화 및 인덱싱
- [x] **보안 강화**: Spring Security 6.x 완전 구성
  - BCrypt 12라운드 암호화
  - CORS 정책 강화
  - HTTP 보안 헤더 적용
  - 상세한 예외 처리 및 로깅

---

## 🏆 주요 구현 성과

### 1. 건강 평가 시스템 (KB라이프생명 기준)
- **ADL 점수 계산**: 걷기(25%) + 식사(20%) + 배변(30%) + 의사소통(25%)
- **케어 등급 산출**: 장기요양보험 등급 + 돌봄대상자 상태 종합 판단
- **특화 케어 분류**: 호스피스/치매/중증/일반 케어 자동 분류

### 2. AI 코디네이터 매칭 시스템
- **5점 만점 매칭 알고리즘**: 전문성, 경력, 만족도, 위치, 가용성 종합 평가
- **업무량 최적화**: 공정한 케이스 분배 알고리즘
- **지능형 설명 생성**: 매칭 이유를 한국어로 자동 생성
- **실시간 성과 추적**: 매칭 성공률, 만족도, 응답시간 모니터링

### 3. 완전한 테스트 환경
- **통합 테스트**: 실제 데이터베이스 연동 테스트
- **API 테스트**: MockMvc 기반 컨트롤러 테스트
- **E2E 테스트**: 건강평가→매칭→결과 전체 플로우 테스트
- **성능 테스트**: 캐시 효율성 및 응답시간 검증

### 4. 엔터프라이즈급 성능 최적화
- **3단계 캐시 전략**: 매칭 결과, 건강 평가, 통계 데이터 캐싱
- **비동기 처리**: 매칭, 통계, 일반 작업 분리된 스레드풀
- **쿼리 최적화**: N+1 문제 해결, 인덱스 최적화

### 5. 강화된 보안 시스템
- **인증/인가**: JWT + Spring Security 6.x
- **데이터 보호**: BCrypt 12라운드 + SQL Injection 방지
- **네트워크 보안**: CORS 정책, HTTP 보안 헤더
- **예외 처리**: 상세한 오류 추적 및 로깅

---

## 📊 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React 18      │    │  Spring Boot    │    │    SQLite       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
│ • 건강평가 UI    │    │ • 매칭 알고리즘  │    │ • 회원 정보      │
│ • 매칭결과 UI    │    │ • 케어등급 계산  │    │ • 건강 평가      │
│ • 대시보드 UI    │    │ • 캐시 시스템    │    │ • 매칭 결과      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎯 다음 단계 (Phase 6)

**목표**: 배포 준비 및 최종 통합 (예상 토큰: 10,000)

### 배포 환경 구성
- [ ] Railway/Render 배포 설정
- [ ] GitHub Pages 프론트엔드 배포
- [ ] 환경별 설정 분리 (dev/prod)
- [ ] CI/CD 파이프라인 구성

### 최종 검증 및 문서화
- [ ] 전체 시스템 통합 테스트
- [ ] 사용자 매뉴얼 작성
- [ ] API 문서 최종 정리
- [ ] 성능 벤치마크 테스트

---

## 🛡️ 개발 원칙 및 룰

### 기본 개발 원칙
- **JDK 21 + Spring Boot 3.3.5** 기반 최신 기술 스택 사용
- **무료 기술 스택 우선** (자본금 0원 전략)
- **AI 주도 개발** (Claude AI 100% 의존)
- **한국어 우선** (주석, 문서, 커밋 메시지)

### 코딩 규칙
- **클래스명**: PascalCase (예: `MemberService`)
- **메서드명**: camelCase (예: `findMemberById`)
- **상수명**: UPPER_SNAKE_CASE (예: `JWT_SECRET_KEY`)
- **패키지명**: 모두 소문자 (예: `com.globalcarelink.auth`)
- **주석**: 한국어로 작성, 비즈니스 로직 설명 필수

### 커밋 메시지 규칙
- **한국어 사용**: 영어 금지
- **이모지 사용**: `✅ 완료`, `🔧 수정`, `🐛 버그수정`, `🎯 기능추가`
- **형식**: `[타입] 간단한 제목\n\n상세 설명`
- **예시**: `✅ 코디네이터 매칭 시스템 완성\n\nAI 기반 5점 만점 매칭 알고리즘 구현\n- 전문성 40% + 경력 25% + 만족도 20%\n- 업무량 최적화 분배 시스템`

### 파일 구조 규칙
- **기능별 패키지**: `auth/`, `health/`, `coordinator/` 단위 분리
- **계층별 분리**: `Controller` → `Service` → `Repository` 순서
- **DTO 분리**: Request/Response DTO 명확히 구분
- **테스트 코드**: 모든 Service 클래스에 대응하는 테스트 필수

### 보안 규칙
- **JWT 토큰**: 모든 API 인증 필수 (public API 제외)
- **BCrypt 암호화**: 비밀번호 12라운드 암호화
- **SQL Injection 방지**: JPA Repository 사용, native query 최소화
- **민감정보 로깅 금지**: 비밀번호, 토큰 등 로그에 출력 금지

### 성능 최적화 규칙
- **캐시 활용**: Caffeine Cache로 자주 사용되는 데이터 캐싱
- **N+1 문제 방지**: `@EntityGraph` 활용한 페치 조인
- **페이징 처리**: 대량 데이터 조회 시 필수
- **비동기 처리**: 시간이 오래 걸리는 작업은 `@Async` 사용

### 테스트 규칙
- **테스트 커버리지**: Service 레이어 90% 이상
- **테스트 종류**: 단위테스트 + 통합테스트 + E2E테스트
- **테스트 데이터**: `@TestDataBuilder` 패턴 사용
- **MockMvc 사용**: Controller 테스트는 MockMvc로 통합 테스트

### 코드 품질 규칙
- **Lombok 활용**: `@Builder`, `@Data`, `@Slf4j` 적극 사용
- **Spring Boot 기능 활용**: `@ConfigurationProperties`, `@Profile` 등 활용
- **예외 처리**: `@RestControllerAdvice`로 전역 예외 처리
- **Validation**: `@Valid`, `@Validated` 어노테이션 활용

---

## 🔧 개발 가이드라인

### 멀티모듈 개발 명령어

```bash
# 전체 프로젝트 빌드
./gradlew build

# API 서버 실행 (개발 프로파일)  
./gradlew bootRun --args='--spring.profiles.active=dev'

# 프론트엔드 개발 서버 실행
cd frontend && npm run dev

# 전체 테스트 실행
./gradlew test

# API 문서 확인
http://localhost:8080/swagger-ui.html
```

### 개발 서버 정보
- **백엔드**: `http://localhost:8080` (Spring Boot)
- **프론트엔드**: `http://localhost:5173` (Vite React)
- **H2 콘솔**: `http://localhost:8080/h2-console`
- **API 문서**: `http://localhost:8080/swagger-ui.html`

### 코드 스타일
- **Java**: Google Java Style Guide 기반
- **TypeScript**: Prettier + ESLint
- **커밋 메시지**: 한국어 + 이모지 사용

### 테스트 전략
- **단위 테스트**: 모든 비즈니스 로직
- **통합 테스트**: 데이터베이스 연동 부분
- **E2E 테스트**: 주요 사용자 플로우

### 성능 목표
- **API 응답시간**: 평균 200ms 이하
- **매칭 처리시간**: 평균 1초 이하
- **캐시 적중률**: 80% 이상

---

## 📋 주의사항

1. **보안**: 모든 API는 JWT 인증 필요
2. **성능**: 캐시 무효화 정책 준수
3. **테스트**: 새 기능 추가 시 테스트 코드 필수
4. **로깅**: 민감 정보 로깅 금지
5. **예외처리**: 사용자 친화적 오류 메시지 제공
6. **한국어 우선**: 모든 문서, 주석, 커밋 메시지는 한국어
7. **AI 개발**: Claude AI에 100% 의존, 복잡한 로직도 AI가 구현

---

## 🚨 중대한 이슈들 (반드시 준수)

### 데이터베이스 관련
- **H2 메모리 DB 사용**: 개발 환경에서 SQLite 대신 H2 인메모리 DB 사용 중
- **스키마 자동 생성**: `ddl-auto: create-drop`으로 애플리케이션 재시작 시 데이터 초기화
- **테스트 데이터**: 매번 새로 생성되므로 하드코딩된 ID 값 사용 금지

### 역할 시스템 (중요!)
- **새로운 역할 체계**: `USER_DOMESTIC`, `USER_OVERSEAS`, `JOB_SEEKER_DOMESTIC`, `JOB_SEEKER_OVERSEAS`
- **구 역할명 사용 금지**: `DOMESTIC_USER`, `OVERSEAS_USER` 등 구 역할명 절대 사용 금지
- **is_job_seeker 플래그**: 구직자 여부는 별도 Boolean 필드로 관리

### API 인증 관련
- **JWT 토큰 필수**: `/api/auth/login`, `/api/auth/register` 외 모든 API는 JWT 인증 필요
- **CORS 설정**: `localhost:3000`, `localhost:5173` 등 개발 포트 허용
- **H2 콘솔 접근**: `/h2-console` 경로로 DB 확인 가능

### 캐시 시스템
- **Caffeine 캐시 사용**: Redis 대신 메모리 기반 Caffeine 캐시
- **캐시 키 관리**: `health-assessment`, `coordinator-matching`, `member`, `statistics` 구분
- **TTL 설정**: 각 캐시별로 다른 TTL (15분~120분)

### 비동기 처리
- **@Async 사용**: 시간이 오래 걸리는 작업은 비동기 처리 필수
- **ThreadPool 설정**: core 5개, max 20개, queue 100개로 설정
- **성능 모니터링**: `/actuator/metrics`로 비동기 작업 성능 확인

### 로깅 시스템
- **구조화된 로깅**: JSON 형태로 로그 출력 (logback-spring.xml)
- **MDC 활용**: traceId, userId, requestUri 등 컨텍스트 정보 자동 추가
- **성능 로깅**: 3초 이상 걸리는 요청은 자동으로 WARNING 로그

### 테스트 환경
- **@ActiveProfiles("test")**: 테스트 시 별도 프로파일 사용
- **MockMvc 필수**: Controller 테스트는 반드시 MockMvc 사용
- **@Transactional**: 테스트 메서드에 트랜잭션 적용으로 롤백 보장

---

## 🏁 프로젝트 현황

**전체 진행률: 95% 완료**

- ✅ **백엔드 시스템** (100%) - Spring Boot 3.3.5, H2 DB, JWT 인증
- ✅ **프론트엔드 UI** (100%) - React 18, TypeScript, Tailwind CSS
- ✅ **건강 평가 시스템** (100%) - KB라이프생명 기준 ADL 점수 계산
- ✅ **매칭 알고리즘** (100%) - AI 기반 5점 만점 코디네이터 매칭
- ✅ **테스트 환경** (100%) - JUnit 5, MockMvc, E2E 테스트
- ✅ **성능 최적화** (100%) - Caffeine 캐시, 비동기 처리
- ✅ **보안 강화** (100%) - Spring Security 6.x, BCrypt 12라운드
- ✅ **역할 체계 재정의** (100%) - 사용자 vs 구직자 명확한 분리
- 🔄 **배포 준비** (0%) - Railway/Render 배포 설정 대기

**현재 작업 완료**: 모든 핵심 기능 구현 완료, 배포 환경 구성만 남음

**다음 단계**: Phase 6 - 배포 환경 구성 및 최종 검증

---

*최종 업데이트: 2025년 1월 - 역할 체계 재정의 및 개발 룰 복원 완료*