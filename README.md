# 🌿 Elderberry - 글로벌 케어링크 플랫폼

> 고령자를 위한 맞춤형 돌봄 서비스 매칭 플랫폼

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://openjdk.java.net/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)
- [아키텍처](#-아키텍처)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)
- [기여하기](#-기여하기)

## 🎯 프로젝트 개요

Elderberry는 고령자와 돌봄 코디네이터를 연결하는 혁신적인 플랫폼입니다. AI 기반 매칭 시스템을 통해 개인의 건강 상태, 언어 선호도, 지역 등을 종합적으로 고려하여 최적의 돌봄 서비스를 제공합니다.

### 🎯 핵심 가치

- **개인 맞춤형**: 각 사용자의 고유한 요구사항에 맞춘 서비스
- **글로벌 접근성**: 국내외 어디서나 이용 가능한 돌봄 서비스
- **안전성**: 강화된 보안과 개인정보 보호
- **투명성**: 명확한 매칭 기준과 과정 공개

## ✨ 주요 기능

### 🏥 건강 평가 시스템
- **종합적 평가**: ADL(일상생활활동), 인지능력, 만성질환 등 다차원 평가
- **자동 등급 계산**: 장기요양등급 기반 돌봄 필요도 자동 산출
- **실시간 통계**: 비동기 처리를 통한 빠른 통계 생성
- **캐시 최적화**: Caffeine 캐시를 활용한 고성능 데이터 처리

```java
// 건강 평가 생성 예시
HealthAssessmentCreateRequest request = HealthAssessmentCreateRequest.builder()
    .memberId(memberId)
    .birthYear(1950)
    .adlEating(2)        // 1:독립, 2:부분도움, 3:완전도움
    .adlToilet(2)
    .adlMobility(3)
    .adlCommunication(1)
    .ltciGrade(3)        // 장기요양등급 (1-6)
    .hasChronicDisease(true)
    .chronicDiseases(List.of("당뇨병", "고혈압"))
    .build();
```

### 🤝 지능형 매칭 시스템
- **다차원 매칭**: 언어, 지역, 경험, 전문성 종합 고려
- **실시간 점수 계산**: 정교한 알고리즘을 통한 매칭 점수 산출
- **개인화 추천**: 사용자 히스토리 기반 맞춤 추천
- **성능 최적화**: 비동기 처리와 캐싱으로 빠른 응답

```java
// 매칭 요청 예시
POST /api/coordinator-matching/domestic/{profileId}
{
  "prioritizeLanguage": true,
  "considerHealthStatus": true,
  "maxMatches": 10
}
```

### 👤 프로필 관리
- **이중 프로필**: 국내/해외 환자 구분 관리
- **유연한 구조**: BaseProfile 상속을 통한 확장 가능한 설계
- **실시간 검증**: 입력 데이터 실시간 유효성 검사
- **자동 저장**: 사용자 편의를 위한 자동 저장 기능

### 🔐 보안 및 인증
- **JWT 기반 인증**: Access/Refresh 토큰 분리 관리
- **토큰 블랙리스트**: 로그아웃된 토큰 무효화
- **비밀번호 강화**: BCrypt 강도 12 적용
- **상세 오류 처리**: 구체적이고 도움이 되는 오류 메시지

### 📊 성능 최적화
- **다층 캐싱**: 용도별 최적화된 캐시 전략
- **비동기 처리**: 스레드 풀 분리를 통한 효율적 처리
- **배치 최적화**: JPA 배치 처리로 DB 성능 향상
- **N+1 해결**: @EntityGraph 활용한 쿼리 최적화

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 3.2+, Spring Security 6
- **Language**: Java 17+
- **Database**: H2 (개발), PostgreSQL (운영)
- **ORM**: Spring Data JPA, Hibernate
- **Cache**: Caffeine Cache
- **Authentication**: JWT (JSON Web Token)
- **API Documentation**: SpringDoc OpenAPI 3
- **Testing**: JUnit 5, Mockito, TestContainers

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript 5+
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios

### DevOps & Tools
- **Build**: Gradle
- **Monitoring**: Spring Boot Actuator, Micrometer
- **Logging**: Logback
- **Code Quality**: SonarQube
- **Version Control**: Git

## 🚀 시작하기

### 필수 요구사항

- Java 17 이상
- Node.js 18 이상
- Git

### 설치 및 실행

#### 1. 프로젝트 클론

```bash
git clone https://github.com/your-org/elderberry.git
cd elderberry
```

#### 2. 백엔드 실행

```bash
# 의존성 설치 및 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun

# 또는 개발 모드로 실행
./gradlew bootRun --args='--spring.profiles.active=dev'
```

#### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

#### 4. 접속 확인

- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:5173
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console

## 📚 API 문서

### 인증 API

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "홍길동",
  "role": "USER"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### 토큰 갱신
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 건강 평가 API

#### 건강 평가 생성
```http
POST /api/health-assessments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "memberId": 1,
  "birthYear": 1950,
  "adlEating": 2,
  "adlToilet": 2,
  "adlMobility": 3,
  "adlCommunication": 1,
  "ltciGrade": 3,
  "hasChronicDisease": true,
  "chronicDiseases": ["당뇨병", "고혈압"],
  "hasCognitiveDifficulty": false,
  "additionalInfo": "특별한 요구사항 없음"
}
```

#### 건강 평가 조회
```http
GET /api/health-assessments/{id}
Authorization: Bearer {accessToken}
```

#### 건강 평가 통계
```http
GET /api/health-assessments/statistics
Authorization: Bearer {accessToken}
```

### 매칭 API

#### 국내 환자 매칭
```http
POST /api/coordinator-matching/domestic/{profileId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "prioritizeLanguage": true,
  "considerHealthStatus": true,
  "maxMatches": 10
}
```

#### 해외 환자 매칭
```http
POST /api/coordinator-matching/overseas/{profileId}
Authorization: Bearer {accessToken}
```

### 프로필 API

#### 국내 프로필 생성
```http
POST /api/profiles/domestic
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "memberId": 1,
  "name": "김국내",
  "birthYear": 1960,
  "gender": "남성",
  "careLocation": "서울시 강남구",
  "preferredLanguages": ["한국어", "영어"],
  "specialRequests": "당뇨 관리 필요",
  "emergencyContact": "010-1234-5678",
  "familyContact": "010-8765-4321"
}
```

## 🏗 아키텍처

### 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React +      │◄──►│   (Spring Boot) │◄──►│   (H2/PostgreSQL)│
│   TypeScript)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Cache Layer   │
                       │   (Caffeine)    │
                       └─────────────────┘
```

### 패키지 구조

```
src/main/java/com/globalcarelink/
├── auth/                   # 인증 및 회원 관리
│   ├── dto/               # 데이터 전송 객체
│   ├── JwtTokenProvider   # JWT 토큰 관리
│   └── MemberService      # 회원 서비스
├── health/                # 건강 평가 시스템
│   ├── dto/               
│   ├── HealthAssessmentService
│   ├── HealthAssessmentQueryService
│   └── HealthAssessmentStatsService
├── coordinator/           # 코디네이터 매칭
│   ├── OptimizedCoordinatorMatchingService
│   └── LanguageMatchingService
├── profile/               # 프로필 관리
│   ├── BaseProfile        # 공통 프로필 기반 클래스
│   ├── DomesticProfile    # 국내 프로필
│   └── OverseasProfile    # 해외 프로필
└── common/                # 공통 기능
    ├── config/            # 설정 클래스
    ├── exception/         # 예외 처리
    └── util/              # 유틸리티
```

### 데이터베이스 설계

```sql
-- 회원 테이블
CREATE TABLE members (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 건강 평가 테이블
CREATE TABLE health_assessments (
    id BIGINT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    birth_year INTEGER NOT NULL,
    adl_eating INTEGER NOT NULL,
    adl_toilet INTEGER NOT NULL,
    adl_mobility INTEGER NOT NULL,
    adl_communication INTEGER NOT NULL,
    ltci_grade INTEGER NOT NULL,
    has_chronic_disease BOOLEAN,
    chronic_diseases TEXT,
    has_cognitive_difficulty BOOLEAN,
    additional_info TEXT,
    care_grade VARCHAR(20),
    created_at TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 프로필 테이블 (국내)
CREATE TABLE domestic_profiles (
    id BIGINT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_year INTEGER NOT NULL,
    gender VARCHAR(10),
    care_location VARCHAR(255),
    preferred_languages TEXT,
    special_requests TEXT,
    emergency_contact VARCHAR(50),
    family_contact VARCHAR(50),
    created_at TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 프로필 테이블 (해외)
CREATE TABLE overseas_profiles (
    id BIGINT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_year INTEGER NOT NULL,
    gender VARCHAR(10),
    current_country VARCHAR(100),
    desired_country VARCHAR(100),
    preferred_languages TEXT,
    has_visa_issues BOOLEAN,
    medical_history TEXT,
    emergency_contact VARCHAR(100),
    insurance_info TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);
```

## 💻 개발 가이드

### 코딩 컨벤션

#### Java
- **패키지명**: 소문자, 점(.) 구분
- **클래스명**: PascalCase
- **메서드명**: camelCase
- **상수명**: UPPER_SNAKE_CASE
- **주석**: JavaDoc 스타일 사용

#### TypeScript/React
- **컴포넌트명**: PascalCase
- **파일명**: PascalCase (컴포넌트), camelCase (유틸리티)
- **변수명**: camelCase
- **상수명**: UPPER_SNAKE_CASE

### 브랜치 전략

```
main
├── develop
│   ├── feature/health-assessment
│   ├── feature/coordinator-matching
│   └── feature/profile-management
├── hotfix/critical-bug-fix
└── release/v1.0.0
```

### 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 스크립트 수정, 패키지 매니저 설정 등
```

### 테스트 가이드

#### 단위 테스트
```java
@ExtendWith(MockitoExtension.class)
class HealthAssessmentServiceTest {
    
    @Mock
    private HealthAssessmentRepository repository;
    
    @InjectMocks
    private HealthAssessmentService service;
    
    @Test
    @DisplayName("건강 평가 생성 - 성공")
    void createHealthAssessment_Success() {
        // Given
        HealthAssessmentCreateRequest request = createValidRequest();
        
        // When
        HealthAssessmentResponse response = service.createHealthAssessment(request);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCareGrade()).isNotNull();
    }
}
```

#### 통합 테스트
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class HealthAssessmentIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void createHealthAssessment_Integration() {
        // 전체 플로우 테스트
    }
}
```

### 성능 최적화 가이드

#### 캐시 활용
```java
@Service
public class HealthAssessmentService {
    
    @Cacheable(value = "healthAssessments", key = "#id")
    public HealthAssessmentResponse findById(Long id) {
        return repository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new CustomException.NotFound("건강 평가를 찾을 수 없습니다"));
    }
    
    @CacheEvict(value = "healthAssessments", key = "#id")
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
```

#### 비동기 처리
```java
@Service
public class HealthAssessmentStatsService {
    
    @Async("statisticsExecutor")
    public CompletableFuture<HealthAssessmentStatistics> generateStatisticsAsync() {
        // 무거운 통계 계산 작업
        return CompletableFuture.completedFuture(statistics);
    }
}
```

#### 쿼리 최적화
```java
@EntityGraph(attributePaths = {"languageSkills", "careSettings"})
List<Coordinator> findAllWithDetails();
```

## 🚀 배포

### 환경별 설정

#### 개발 환경
```yaml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:h2:mem:elderberry
  jpa:
    hibernate:
      ddl-auto: create-drop
```

#### 운영 환경
```yaml
spring:
  profiles:
    active: prod
  datasource:
    url: jdbc:postgresql://localhost:5432/elderberry_prod
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
```

### Docker 배포

#### Dockerfile
```dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app
COPY build/libs/elderberry-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_USERNAME=elderberry
      - DB_PASSWORD=password
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: elderberry_prod
      POSTGRES_USER: elderberry
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 모니터링

#### 헬스 체크
```bash
curl http://localhost:8080/actuator/health
```

#### 메트릭 확인
```bash
curl http://localhost:8080/actuator/metrics
```

#### 캐시 통계
```bash
curl http://localhost:8080/actuator/caches
```

## 🤝 기여하기

### 기여 방법

1. **Fork** 프로젝트
2. **Feature 브랜치** 생성 (`git checkout -b feature/amazing-feature`)
3. **커밋** (`git commit -m 'feat: Add amazing feature'`)
4. **Push** (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

### 이슈 리포팅

버그 발견이나 기능 제안 시 [Issues](https://github.com/your-org/elderberry/issues)에 등록해 주세요.

#### 버그 리포트 템플릿
```markdown
## 버그 설명
간단한 버그 설명

## 재현 방법
1. '...' 이동
2. '...' 클릭
3. '...' 입력
4. 오류 발생

## 예상 동작
정상적으로 동작해야 하는 내용

## 실제 동작
실제로 발생한 동작

## 환경
- OS: [예: macOS 13.0]
- 브라우저: [예: Chrome 120]
- 버전: [예: v1.0.0]
```

### 코드 리뷰 가이드

- **명확성**: 코드의 의도가 명확한가?
- **성능**: 불필요한 연산이나 메모리 사용은 없는가?
- **보안**: 보안 취약점은 없는가?
- **테스트**: 적절한 테스트가 포함되어 있는가?
- **문서화**: 필요한 문서화가 되어 있는가?

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **프로젝트 관리자**: [your-email@example.com](mailto:your-email@example.com)
- **이슈 트래커**: [GitHub Issues](https://github.com/your-org/elderberry/issues)
- **위키**: [GitHub Wiki](https://github.com/your-org/elderberry/wiki)

---

<div align="center">
  <p>❤️ Elderberry로 더 나은 돌봄 서비스를 만들어가요</p>
  <p>Made with ❤️ by the Elderberry Team</p>
</div> 