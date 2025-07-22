# CLAUDE.md

이 문서는 이 저장소에서 Claude Code (claude.ai/code)가 코드를 다룰 때 참고할 가이드입니다.

---

## 📌 프로젝트 개요

이 프로젝트는 한국 팀원 4명이 개발하는 \*\*글로벌 요양원 구인구직 웹사이트 "라이트케어(LightCare)"\*\*입니다. 이 플랫폼은 요양 시설과 요양업계 구직자를 연결해주는 서비스에서 시작하여, **재외동포 대상 글로벌 요양 서비스**로 확장되고 있습니다.

**⚠️ 중요: 이 프로젝트는 JDK 21 + Spring Boot 3.3.5 기반의 새로운 프로젝트로 재구성되었습니다. 기존 레거시 코드는 참고용으로만 활용하며, 모든 새로운 개발은 최신 기술 스택 기반으로 진행합니다.**

---

## 🛠 기술 스택 (최신화)

### 백엔드 (Modern Java Stack - 완전 무료)
* **언어**: Java 21 LTS (Virtual Threads, Pattern Matching)
* **프레임워크**: Spring Boot 3.3.5 
* **ORM**: Spring Data JPA + Hibernate 6.x
* **보안**: Spring Security 6.x + JWT + OAuth2
* **데이터베이스**: SQLite (자본금 0원 고려)
* **캐시**: Caffeine (메모리 캐시, 무료)
* **빌드**: Gradle 8.x + Kotlin DSL

### 프론트엔드 (Modern React Stack)  
* **언어**: TypeScript 5.x (타입 안정성)
* **프레임워크**: React 18 + Vite 5.x
* **상태관리**: Zustand (단순하고 현대적)
* **UI 라이브러리**: Tailwind CSS + Shadcn/ui
* **HTTP 클라이언트**: TanStack Query (React Query v5)
* **폼 관리**: React Hook Form + Zod

### 인프라 & 도구 (무료 우선)
* **실시간 통신**: WebSocket, STOMP (WebRTC는 추후)  
* **API 문서**: OpenAPI 3.0 + Swagger UI
* **테스트**: JUnit 5 + Spring Boot Test
* **CI/CD**: GitHub Actions (월 2000분 무료)
* **파일 저장**: GitHub Repository (무료 CDN)
* **이메일**: Gmail SMTP (일일 500통 무료)
* **지도**: OpenStreetMap + Leaflet.js (완전 무료), 카카오맵 (월 30만건 무료)
* **배포**: Railway/Render (무료 플랜) → GitHub Pages (프론트엔드)
* **개발 도구**: Lombok, MapStruct, Spring Boot DevTools
* **모니터링**: Spring Boot Actuator (무료)

---

## ⚙️ 멀티모듈 개발 명령어

### 빌드 및 실행 (JDK 21 기반)

```bash
# JDK 버전 확인 (21 이상이어야 함)
java -version

# 전체 프로젝트 빌드 (모든 모듈)
./gradlew build

# 특정 모듈만 빌드
./gradlew :api-module:build
./gradlew :member-module:build

# API 서버 실행 (개발 프로파일)
./gradlew :api-module:bootRun --args='--spring.profiles.active=dev'

# 프론트엔드 개발 서버 실행
cd web-module && npm run dev

# 전체 테스트 실행 (병렬 처리)
./gradlew test --parallel

# 특정 모듈 테스트
./gradlew :member-module:test

# 코드 품질 검사 (전체)
./gradlew check

# API 문서 생성 (OpenAPI)
./gradlew :api-module:generateOpenApiDocs

# 의존성 업데이트 확인
./gradlew dependencyUpdates
```

### 데이터베이스 설정 (SQLite - 무료)

```bash
# SQLite 데이터베이스 (파일 기반, 설치 불필요)
# 프로젝트 루트에 data/ 폴더 생성
mkdir data

# JPA 자동 DDL로 스키마 생성 (개발 환경)
# application.yml에서 spring.jpa.hibernate.ddl-auto: create-drop
# SQLite 파일이 자동으로 생성됨: ./data/lightcare.db
```

### 개발 서버 정보

* **백엔드**: `http://localhost:8080` (Spring Boot)
* **프론트엔드**: `http://localhost:5173` (Vite React)
* **데이터베이스**: `jdbc:sqlite:./data/lightcare.db` (파일 기반)
* **캐시**: 메모리 캐시 (Caffeine)
* **Hot Reload**: DevTools(백엔드) + Vite HMR(프론트엔드)

---

## 🧱 아키텍처 개요

### AI 주도 개발을 위한 구조 (1인 + AI 협업 최적화)

이 프로젝트는 **기존 레거시 코드의 마이그레이션 어려움** (JDK 11→21, Spring Boot 2.x→3.x 업그레이드 시 대량 컴파일 오류)을 해결하기 위해 **완전히 새로운 그린필드 프로젝트**로 시작합니다.

**⚠️ 개발 전략**:
- **AI 의존도**: 100% (주니어 레벨 팀)
- **개발 방식**: 기존 코드 포팅 대신 새로운 코드 생성
- **레거시 활용**: 비즈니스 로직 참고용으로만 활용

**기능별 패키지 구조 (단일 프로젝트 - AI 개발 최적화)**:
* **auth**: 인증 기능 (로그인, 회원가입, JWT) - Spring Security 6.x 기반
* **profile**: 프로필 관리 (국내/해외 사용자 구분)  
* **facility**: 시설 관리 (등록, 검색, 지도 연동) - OpenStreetMap + 카카오맵
* **job**: 구인구직 (공고 작성, 지원, 매칭) - AI 매칭 알고리즘 적용
* **review**: 리뷰 시스템 (평점, 후기, 추천) - 감정 분석 적용 예정
* **overseas**: 재외동포 전용 기능 (외교부 API, 화상상담) - WebRTC 기반
* **coordinator**: 코디네이터 원스톱 서비스 - 재외동포 입국부터 요양원 입주까지 전 과정 지원
* **notification**: 알림 시스템 (Gmail SMTP, WebSocket) - 무료 서비스 기반
* **common**: 공통 설정, 유틸, 예외처리 - Spring Boot 3.3.5 최적화

### 기능별 패키지 구조 (1인 개발 최적화)

```
global-care-link/
├── build.gradle.kts                   # 단일 빌드 파일 (멀티모듈 제거)
├── src/main/java/com/globalcarelink/
│   ├── auth/                          # 🔐 인증 기능 전체
│   │   ├── AuthController.java        # 로그인/회원가입 API
│   │   ├── AuthService.java           # 인증 비즈니스 로직
│   │   ├── JwtTokenProvider.java      # JWT 토큰 처리
│   │   ├── LoginRequest.java          # 로그인 요청 DTO
│   │   ├── RegisterRequest.java       # 회원가입 요청 DTO
│   │   ├── TokenResponse.java         # 토큰 응답 DTO
│   │   └── Member.java                # 기본 회원 엔티티
│   ├── profile/                       # 👤 프로필 관리 기능
│   │   ├── ProfileController.java     # 프로필 관리 API
│   │   ├── ProfileService.java        # 프로필 비즈니스 로직
│   │   ├── DomesticProfile.java       # 국내 사용자 프로필 엔티티
│   │   ├── OverseasProfile.java       # 해외 사용자 프로필 엔티티
│   │   └── ProfileRepository.java     # 프로필 데이터 접근
│   ├── facility/                      # 🏥 시설 관리 기능
│   │   ├── FacilityController.java    # 시설 관리 API
│   │   ├── FacilityService.java       # 시설 비즈니스 로직
│   │   ├── Facility.java              # 시설 엔티티
│   │   ├── FacilityRepository.java    # 시설 데이터 접근
│   │   ├── MapService.java            # 지도 서비스 (카카오/구글)
│   │   └── FacilitySearchDTO.java     # 시설 검색 DTO
│   ├── job/                           # 💼 구인구직 기능
│   │   ├── JobController.java         # 구인구직 API
│   │   ├── JobService.java            # 구인구직 비즈니스 로직
│   │   ├── JobPosting.java            # 구인공고 엔티티
│   │   ├── JobApplication.java        # 구직지원 엔티티
│   │   ├── JobRepository.java         # 구인구직 데이터 접근
│   │   └── JobMatchingService.java    # 매칭 알고리즘
│   ├── review/                        # ⭐ 리뷰 시스템
│   │   ├── ReviewController.java      # 리뷰 API
│   │   ├── ReviewService.java         # 리뷰 비즈니스 로직
│   │   ├── Review.java                # 리뷰 엔티티
│   │   └── ReviewRepository.java      # 리뷰 데이터 접근
│   ├── overseas/                      # 🌍 재외동포 전용 기능
│   │   ├── OverseasController.java    # 재외동포 서비스 API
│   │   ├── DiplomaticService.java     # 외교부 API 연동
│   │   ├── ConsultationService.java   # 화상 상담 관리
│   │   └── DiplomaticApiClient.java   # 외교부 API 클라이언트
│   ├── coordinator/                   # 🤝 코디네이터 원스톱 서비스
│   │   ├── CoordinatorController.java # 코디네이터 매칭 API
│   │   ├── CoordinatorService.java    # 원스톱 서비스 비즈니스 로직
│   │   ├── CoordinatorProfile.java    # 코디네이터 프로필 (전문분야, 언어능력)
│   │   ├── ServiceRequest.java        # 서비스 요청 엔티티 (입국~입주)
│   │   ├── ServicePlan.java           # 개인별 맞춤 서비스 계획
│   │   ├── ServiceProgress.java       # 서비스 진행 상황 추적
│   │   ├── EmergencyContact.java      # 응급상황 연락처 관리
│   │   └── ServicePayment.java        # 서비스 요금 및 정산
│   ├── notification/                  # 📧 알림 시스템
│   │   ├── EmailService.java          # 이메일 발송 서비스
│   │   ├── NotificationService.java   # 통합 알림 관리
│   │   └── NotificationTemplate.java  # 알림 템플릿 관리
│   ├── common/                        # 🔧 공통 기능
│   │   ├── config/                    # 설정 클래스
│   │   │   ├── SecurityConfig.java    # Spring Security 설정
│   │   │   ├── DatabaseConfig.java    # SQLite 설정
│   │   │   └── SwaggerConfig.java     # API 문서 설정
│   │   ├── exception/                 # 예외 처리
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── CustomException.java
│   │   ├── util/                      # 유틸리티
│   │   │   ├── FileUtil.java          # 파일 처리 유틸
│   │   │   └── DateUtil.java          # 날짜 처리 유틸
│   │   └── entity/                    # 공통 엔티티
│   │       └── BaseEntity.java        # 기본 엔티티 (생성일, 수정일)
│   └── GlobalCareLinkApplication.java # 메인 애플리케이션 클래스
├── src/main/resources/
│   ├── application.yml                # SQLite 기반 설정
│   ├── data.sql                       # 초기 데이터
│   └── static/                        # 정적 파일
├── frontend/                          # 🎨 React 프론트엔드
│   ├── src/features/                  # 프론트엔드도 기능별 구조
│   │   ├── auth/                      # 인증 관련 React 컴포넌트
│   │   ├── facility/                  # 시설 관련 React 컴포넌트
│   │   ├── job/                       # 구인구직 관련 React 컴포넌트
│   │   └── overseas/                  # 재외동포 관련 React 컴포넌트
│   ├── package.json
│   └── vite.config.ts
└── data/                              # SQLite 데이터베이스
    └── lightcare.db                   # SQLite 파일
```

### 데이터베이스 설계

관계형 테이블 기반으로 외래키(FK)를 적절히 사용:

* **member**: 사용자 계정 및 인증 정보
* **facility**: 요양시설 정보 (위치 좌표 포함)
* **job\_posting**: 구인공고 정보
* **review**: 시설 리뷰 및 평점
* **board**: 커뮤니티/정보 게시판

### JPA 구성 (최신화)

* **ORM**: Spring Data JPA 3.x
* **엔티티 패키지**: `com.example.carelink.entity`
* **Repository 패키지**: `com.example.carelink.repository`
* **자동 DDL**: 개발 환경에서 `spring.jpa.hibernate.ddl-auto=update`
* **네이밍 전략**: camelCase → underscore 자동 매핑

---

## 🎨 프론트엔드 구조 (React SPA)

### React 프로젝트 구조 (Feature-Based)
```
frontend/src/
├── components/              # 재사용 가능한 컴포넌트
│   ├── ui/                 # 기본 UI 컴포넌트 (Shadcn/ui)
│   └── layout/             # 레이아웃 컴포넌트
├── features/               # 기능별 모듈
│   ├── auth/               # 인증 관련
│   ├── facility/           # 시설 관련
│   ├── job/                # 구인구직 관련
│   └── diplomatic/         # 외교 서비스 관련
├── hooks/                  # 커스텀 훅
├── services/               # API 서비스 (TanStack Query)
├── stores/                 # 상태 관리 (Zustand)
├── types/                  # TypeScript 타입 정의
└── utils/                  # 유틸리티 함수
```

### UI/UX 기술 스택 & 디자인 컨셉
* **디자인 시스템**: Tailwind CSS + Shadcn/ui
* **아이콘**: Lucide React  
* **반응형**: Mobile-First 디자인
* **다국어**: i18next (한국어, 영어, 중국어, 일본어)
* **디자인 컨셉**: 'elderberry' - 아멜리(ameli.co.kr) 스타일 미니멀 & 감성적
* **색상 팔레트**: 파스텔톤 그린/베이지/라이트블루 + 따뜻한 오렌지/옐로우
* **폰트**: Noto Sans KR, Pretendard (가독성 + 따뜻함)
* **애니메이션**: Framer Motion (스크롤 애니메이션 + 호버 효과)

---

## 🧾 주요 설정 파일

### application.yml (SQLite 기반 - 무료 설정)

```yaml
spring:
  application:
    name: global-care-link
  
  # SQLite 데이터베이스 설정 (완전 무료)
  datasource:
    url: jdbc:sqlite:./data/lightcare.db
    driver-class-name: org.sqlite.JDBC
    username: ""
    password: ""
  
  jpa:
    hibernate:
      ddl-auto: create-drop # 개발용, 운영에서는 update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.SQLiteDialect
  
  # Gmail SMTP 설정 (무료)
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${GMAIL_USERNAME}
    password: ${GMAIL_APP_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
  
  # 캐시 설정 (메모리 캐시)
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=1000,expireAfterWrite=30m
  
  security:
    jwt:
      secret: ${JWT_SECRET:default-secret-key-change-in-production}
      expiration: 86400000 # 24시간

server:
  port: 8080
  
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
    com.globalcarelink: DEBUG
```

### 프론트엔드 설정 (package.json)

```json
{
  "name": "global-care-link-frontend",
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.6",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.292.0",
    "i18next": "^23.0.0",
    "react-i18next": "^13.0.0",
    "framer-motion": "^10.0.0",
    "@radix-ui/react-navigation-menu": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0"
  }
}
```

---

## 🔄 개발 패턴

### 컨트롤러 패턴 (최신화)

Spring Boot 3.x MVC 구조:

* **REST API**: `@RestController` + `@RequestMapping` 조합
* **View 컨트롤러**: `@Controller` + Model 객체 활용
* **HTTP 매핑**: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
* **검증**: `@Valid` + `@Validated` 어노테이션 활용
* **로깅**: `@Slf4j` + 구조화된 로그 메시지

### 서비스 계층

컨트롤러와 로직 분리:

* 트랜잭션 처리
* 입력 검증
* 횡단 관심사 관리

### JPA Repository 패턴 (최신화)

Spring Data JPA 기반:

* `JpaRepository<Entity, ID>` 상속
* 메서드 이름 기반 쿼리 자동 생성
* `@Query` 어노테이션으로 복잡한 쿼리 처리
* `@Modifying`으로 수정/삭제 쿼리 정의

---

## ✅ 테스트

### 테스트 구조

* 단위 테스트: JUnit 5
* 통합 테스트: Spring Boot Test
* 테스트 설정은 운영과 별도 구성

### 테스트 명령어

```bash
# 전체 테스트 실행
./gradlew test

# 특정 클래스만 실행
./gradlew test --tests "ClassName"
```

---

## 🤝 팀 협업 규칙

### Git 워크플로우

* 기능 브랜치 명: `feature/member-기능명`
* 커밋 메시지: `[feat] 기능 설명`
* PR을 통한 코드 리뷰 진행

### 코드 컨벤션

* 클래스명: PascalCase
* 메서드명: camelCase
* 상수명: UPPER\_SNAKE\_CASE
* 패키지명: 모두 소문자

---

## ⚠️ 특이 사항

### 한글 지원

* 모든 텍스트 콘텐츠는 한글로 작성
* UTF-8 인코딩 유지
* 주석/문서도 한글 기반

### 지도 연동

* 카카오맵 API 연동 예정
* 위도/경도 기반 시설 검색 기능 포함

### 사용자 역할

* `USER`: 일반 구직자
* `FACILITY`: 요양시설 관리자
* `ADMIN`: 시스템 관리자

---

## 🤖 AI 개발 지원 최적화

### 개발 전략 (그린필드 개발)

프로젝트 상황 분석에 따라 다음과 같은 전략을 채택합니다:

#### **현재 문제점**:
- JDK 11→21 및 Spring Boot 2.x→3.3.5 업그레이드 과정에서 24개 에러, 5개 경고 발생
- Spring Security API 변경, Lombok 호환성, 타입 추론 문제 등 복잡한 마이그레이션 이슈
- 팀 개발 능력: AI에 100% 의존하는 주니어 레벨

#### **해결 방안**:
* **새로운 프로젝트 접근**: 기존 레거시 코드 마이그레이션 대신 최신 기술 스택 기반 새로운 개발
* **최신 Spring Boot 3.x 패턴 활용**: Spring Security 6.x, Spring Data JPA 3.x 등 최신 API 사용
* **AI 친화적 코드 작성**: 명확한 패턴, 표준 어노테이션, 일관된 네이밍 규칙
* **기존 코드 재활용**: 비즈니스 로직은 개념적 참고 + AI 포팅으로 최신 문법 적용

### AI에게 요청할 때 권장 사항

**✅ 좋은 질문 예시 (최신 기술 스택 기반):**
```
- "Java 21 + Spring Boot 3.3.5에서 JWT 인증 구현 방법"
- "Spring Security 6.x SecurityFilterChain으로 사용자 로그인 구현"  
- "JPA Entity와 Repository 패턴으로 회원 관리 기능 구현 (Hibernate 6.x)"
- "React 18 + TypeScript로 로그인 폼 구현 (React Hook Form + Zod)"
- "SQLite + Spring Data JPA 설정 방법"
- "Gradle 8.x Kotlin DSL로 멀티모듈 프로젝트 설정"
```

**❌ 피해야 할 요청 (레거시 기술):**
```
- 레거시 Spring Boot 2.x 기반 코드 수정 요청
- MyBatis XML 매퍼 파일 수정 요청  
- JDK 11 기반 코드 마이그레이션 요청
- Spring Security WebSecurityConfigurerAdapter 사용 요청 (Deprecated)
```

### 개발 시 체크리스트

* **기술 스택 확인**: 모든 새 코드는 JDK 21 + Spring Boot 3.3.5 기반
* **의존성 검증**: `build.gradle`에서 최신 버전 사용 확인
* **보안 설정**: Spring Security 6.x 방식으로 구현
* **테스트 코드**: JUnit 5 + Spring Boot Test 활용

---

## 🌐 환경 변수 (무료 서비스 기반)

### 백엔드 환경 변수 (.env)
```bash
# 데이터베이스 설정 (SQLite - 파일 기반, 비밀번호 불필요)
DATABASE_URL=jdbc:sqlite:./data/lightcare.db

# JWT 보안
JWT_SECRET=your_super_secret_jwt_key_with_256_bits_minimum
JWT_EXPIRATION=86400000

# Gmail SMTP 설정 (무료)
GMAIL_USERNAME=your-email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# 외부 API (무료 플랜)
KAKAO_API_KEY=your_kakao_map_api_key # 월 30만건 무료
GITHUB_TOKEN=your_github_token # 파일 저장용

# 개발 환경
JAVA_HOME=/path/to/jdk-21
SPRING_PROFILES_ACTIVE=dev
```

### 프론트엔드 환경 변수 (.env.local)
```bash
# API 엔드포인트
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws

# 무료 지도 서비스
VITE_KAKAO_API_KEY=your_kakao_api_key # 월 30만건 무료
VITE_USE_FREE_MAP=true # OpenStreetMap 사용 플래그

# GitHub 파일 저장소
VITE_GITHUB_REPO_OWNER=your-username
VITE_GITHUB_REPO_NAME=lightcare-files

# 개발 설정
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

## 🚀 AI 주도 2주 완성 개발 워크플로우

### 개발자 1인 + AI 협업 모델 (현실적 접근)

* **개발 주체**: 1인 개발자 (100% AI 의존) + Claude AI
* **의사결정**: 개발자가 요구사항 정의, AI가 전체 구현 담당 (설계→코딩→테스트)  
* **품질 관리**: AI가 코드 리뷰, 테스트 코드 작성, 리팩토링, 문서화 모두 담당

### 2주 개발 로드맵 (AI-Driven Development)

#### **1주차: 백엔드 현대화 및 API 핵심 구현**

**Day 1-2: 백엔드 기반 시스템 구축 (AI-Powered Scaffolding)**
- ✅ Spring Boot 3.3.5, Java 21, Gradle 기반 프로젝트 뼈대 생성
- ✅ 기존 데이터베이스 스키마 분석하여 JPA Entity 클래스 자동 생성
- ✅ QueryDSL 설정 및 기본 Q-Type 클래스 생성
- ✅ Spring WebFlux, Spring Data JPA, Spring Security 의존성 추가

**Day 3-4: 핵심 API 구현 (AI Code Generation)**
- ✅ 기존 Controller/Service 분석하여 회원, 시설, 구인구직, 리뷰 도메인 핵심 CRUD API 재구현
- ✅ Spring MVC 기반 컨트롤러 로직 생성
- ✅ OpenAPI 3.0 어노테이션으로 API 문서 자동화

**Day 5: 보안 및 기본 설정 (AI Configuration)**  
- ✅ Spring Security 6.x JWT 인증/인가 시스템 구축
- ✅ @RestControllerAdvice 전역 예외 처리기 구현
- ✅ 로깅 설정 및 개발 환경 최적화

#### **2주차: 프론트엔드 구축 및 배포 자동화**

**Day 6-7: 프론트엔드 프로젝트 생성 (AI-Powered Frontend Setup)**
- ✅ Vite React 18, TypeScript 프로젝트 뼈대 생성
- ✅ 'elderberry' 디자인 시스템 기반 디렉토리 구조 생성
- ✅ Zustand, React Query, Tailwind CSS, Axios 설정

**Day 8-10: UI 구현 및 API 연동 (AI Component Generation & Integration)**
- ✅ 기능별 React 컴포넌트(Button, Header, FacilityCard) 기본 코드 생성
- ✅ API 연동 함수(authApi, facilityApi) 구현
- ✅ React Query와 Axios로 백엔드 연동 및 화면 표시

**Day 11-12: CI/CD 및 테스트 자동화 (AI DevOps)**
- ✅ GitHub Actions 워크플로우 생성 (Build → Test → Deploy)
- ✅ Dockerfile 및 docker-compose.yml 생성
- ✅ JUnit5, Mockito 단위/통합 테스트 코드 생성

**Day 13-14: 최종 통합 및 배포 (Finalization)**
- ✅ Railway/Render 등 무료 배포 서비스 설정
- ✅ README.md 프로젝트 문서 자동 업데이트
- ✅ 최종 통합 테스트 및 프로덕션 배포

### AI 활용 단계별 가이드 (실무 중심)

**1단계: 상황 분석 및 전략 수립**
```
- "JDK 11→21 마이그레이션 대신 새 프로젝트 생성하는 게 맞나요?"
- "Spring Boot 2.x 코드를 3.3.5로 포팅하는 방법"
- "멀티모듈 vs 단일 모듈 중 1인 개발에 적합한 구조"
- "SQLite vs PostgreSQL 중 자본금 0원에 적합한 DB"
```

**2단계: 프로젝트 구조 설계**
```
- "기능별 패키지 구조로 auth/profile/facility/job 모듈 설계"
- "Spring Boot 3.3.5 기반 Gradle Kotlin DSL 설정 파일 작성"
- "SQLite + JPA Entity 설계 (기존 schema.sql 기반)"
- "React + TypeScript + Vite 프론트엔드 구조 설계"
```

**3단계: 핵심 기능 구현**
```
- "Spring Security 6.x JWT 인증 시스템 완전 구현"
- "Member Entity + Repository + Service + Controller 전체 구현"
- "React 로그인/회원가입 폼 + API 연동 완전 구현"
- "Swagger UI API 문서화 자동 설정"
```

**4단계: 통합 및 배포**
```
- "JUnit5 테스트 코드 자동 생성"
- "GitHub Actions CI/CD 파이프라인 구성"
- "Railway 무료 배포를 위한 Dockerfile 작성"
- "최종 프로젝트 README.md 작성"
```

### 효율적인 AI 질문 패턴

**구체적 요청 예시:**
- "Member 엔티티 클래스를 JPA로 구현, 이메일/비밀번호/역할 필드 포함"
- "MemberService에 회원가입 로직 구현, BCrypt 암호화 적용"  
- "Spring Security 6.x로 JWT 기반 인증 설정 구현"
- "MemberController REST API 구현, OpenAPI 3.0 문서화 포함"
- "멀티모듈 구조로 member-module과 api-module 분리"
- "Gradle build.gradle.kts 파일 멀티모듈 설정 구현"

---

## 🏗️ 초기 개발부터 확장성 고려사항

### 모듈 간 의존성 관리

**의존성 방향 (Clean Architecture):**
```
api-module → [member, facility, job, review, diplomatic]-module → core-module
```

**금지된 의존성:**
- 도메인 모듈 간 직접 의존 (❌)
- core-module의 다른 모듈 의존 (❌)

### 확장 가능한 설계 원칙

#### 1. 도메인 주도 설계 (DDD)
```java
// member-module/src/main/java/com/globalcarelink/member/
├── domain/
│   ├── Member.java              # 도메인 엔티티
│   ├── MemberService.java       # 도메인 서비스
│   └── MemberRepository.java    # 리포지토리 인터페이스
├── application/
│   └── MemberApplicationService.java  # 애플리케이션 서비스
└── infrastructure/
    └── MemberJpaRepository.java       # JPA 구현체
```

#### 2. 이벤트 기반 아키텍처
```java
// 회원 가입 시 이벤트 발행
@Service
public class MemberService {
    public void register(Member member) {
        memberRepository.save(member);
        // 이벤트 발행 (이메일 발송, 로그 기록 등)
        applicationEventPublisher.publishEvent(new MemberRegisteredEvent(member));
    }
}
```

#### 3. API 계약 우선 개발 (Contract-First)
```yaml
# OpenAPI 스펙 먼저 정의
openapi: 3.0.3
info:
  title: Global CareLink API
  version: 1.0.0
paths:
  /api/v1/members:
    post:
      summary: 회원 가입
      operationId: registerMember
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MemberRegisterRequest'
```

### 성능 및 확장성 준비

#### 1. 캐싱 전략
```java
@Service
public class FacilityService {
    
    @Cacheable(value = "facilities", key = "#id")
    public Facility findById(Long id) {
        return facilityRepository.findById(id).orElse(null);
    }
    
    @CacheEvict(value = "facilities", key = "#facility.id")
    public Facility update(Facility facility) {
        return facilityRepository.save(facility);
    }
}
```

#### 2. 데이터베이스 최적화
```java
// JPA N+1 문제 방지
@EntityGraph(attributePaths = {"reviews", "images"})
List<Facility> findAllWithReviewsAndImages();

// 페이징 처리
Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
Page<Facility> facilities = facilityRepository.findAll(pageable);
```

### 개발 환경 우선 집중

#### 1. 로컬 개발 설정 최적화
```yaml
# application-dev.yml (개발 전용)
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop # 스키마 자동 생성/삭제
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  
  h2:
    console:
      enabled: true # H2 콘솔 활성화 (개발용)
  
  devtools:
    restart:
      enabled: true # 코드 변경 시 자동 재시작
    livereload:
      enabled: true # 브라우저 자동 새로고침

# 개발 편의성 설정
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
    com.globalcarelink: DEBUG
```

#### 2. 개발 도구 활용
```bash
# 개발 중 자주 사용할 명령어
./gradlew bootRun --args='--spring.profiles.active=dev'
./gradlew test --continuous # 테스트 자동 실행
./gradlew :api-module:generateOpenApiDocs # API 문서 생성
```

**Docker/배포는 모든 기능 완성 후 마지막 단계에서 진행 (자본금 0원 고려)**

---

## 🌍 글로벌 확장 계획

### 재외동포 서비스 개요

* **서비스 대상**: 해외 거주 재외동포 및 그 가족
* **주요 기능**: 한국 요양원 정보 제공, 화상 상담, 다국어 지원
* **타겟 국가**: 미국, 중국, 일본, 캐나다, 호주 등
* **연동 API**: 외교부 재외국민영사서비스, 공공데이터포털

### 외교부 API 연동

**연동 예정 API 목록:**
```
1. 재외국민 현황 API
2. 영사관/총영사관 정보 API  
3. 재외동포 지원 정책 API
4. 국가별 의료 정보 API
```

**개발 시 고려사항:**
- 공공데이터포털 인증키 관리
- API 호출 제한 및 캐싱 전략
- 다국어 데이터 처리 및 변환
- 시간대별 데이터 동기화

### 다국어 지원 시스템

* **지원 언어**: 한국어, 영어, 중국어(간체), 일본어
* **국제화 구현**: Spring Boot MessageSource + i18n
* **프론트엔드**: Thymeleaf 다국어 템플릿
* **실시간 번역**: Google Translate API 연동 예정

### 화상 상담 시스템

* **기술 스택**: WebRTC, STOMP, WebSocket
* **기능**: 1:1 화상 상담, 화면 공유, 채팅
* **대상**: 재외동포-국내 요양원 상담자 매칭
* **보안**: HTTPS, JWT 토큰 인증

---

## 🎨 프론트엔드 메뉴 구성 & 사용자 경험

### 'elderberry' 사이트 구조

**메인 네비게이션 (드롭다운 방식)**:

#### 1. 요양 시설 찾기
- **시설 검색** (전체): 전국 요양 시설 검색 및 상세 정보
- **시설 리뷰** (일반 회원): 시설 이용 후기 작성 및 열람
- **우리 시설 관리** (시설 회원): 시설 정보 관리, 공지사항, 예약 현황

#### 2. 일자리 정보  
- **구인 공고** (전체): 요양 관련 구인 게시글 열람 및 지원
- **구직 공고** (전체): 요양 관련 구직 게시글 열람
- **구인글 작성** (시설 회원): 요양 인력 채용 공고 등록
- **구직글 작성** (일반 회원): 요양 관련 일자리 희망 글 등록

#### 3. 정보 마당
- 공지사항, 이벤트, FAQ
- 자료실 (요양 가이드, 서식)
- 요양 뉴스 & 칼럼

#### 4. 코디네이터 서비스
- **코디네이터 소개** (전체): 프로필 및 전문 분야 확인
- **상담 신청** (회원): 1:1 상담 예약
- **나의 매칭 현황** (회원): 매칭 진행 상황 확인
- **계약 관리** (회원): 서비스 계약 내역 확인

### 메인 화면 구성

**Hero Section**:
- **배경**: 요양원/노인 돌봄 관련 따뜻하고 평화로운 풀스크린 이미지
- **중앙 콘텐츠**: "챗봇 엘비와 함께 궁금증을 해결하세요!"
- **CTA 버튼**: "엘비에게 질문하기" / "챗봇 엘비 시작하기"

**스크롤 섹션** (각 섹션별 배경 이미지 + CTA):
1. **요양 시설 찾기**: "나에게 맞는 요양 시설을 찾아보세요"
2. **일자리 정보**: "요양 분야의 새로운 기회를 탐색하세요"  
3. **정보 마당**: "요양 관련 최신 정보와 유용한 지식을 얻으세요"
4. **코디네이터 서비스**: "전문 코디네이터와 1:1 맞춤 상담을 시작하세요"

### 챗봇 '엘비' 연동 (외부 개발)

* **개발 담당**: 별도 팀원 (Python + React)
* **연동 방식**: REST API + WebSocket 통신
* **위치**: 우측 하단 플로팅 버튼 (스크롤 시에도 고정)
* **디자인**: 친근한 챗봇 캐릭터 아이콘
* **기능**: 팝업/오버레이 형태로 실시간 챗봇 상담

### 사용자 권한 시스템 (국내/해외 구분)

#### 역할 구분 (5가지)
* **관리자** (ADMIN): 전체 시스템 관리 (국가 무관)
* **시설회원** (FACILITY): 국내 시설 관리자 (국내만)
* **코디네이터** (COORDINATOR): 글로벌 상담사 (다국어 지원)
* **국내 사용자** (DOMESTIC_USER): 일반 + 구직자 통합 (is_job_seeker 플래그)
* **해외 사용자** (OVERSEAS_USER): 재외동포 일반 + 구직자 통합 (is_job_seeker 플래그)

#### 권한별 기능 접근
* **비회원**: 시설 검색, 구인구직 열람, 정보 마당, 코디네이터 소개
* **국내 일반사용자**: + 리뷰 작성, 시설 즐겨찾기
* **국내 구직자**: + 구직 지원, 이력서 업로드, 매칭 관리
* **해외 일반사용자**: + 재외동포 서비스, 외교부 정보
* **해외 구직자**: + 화상 상담, 국제 매칭, 귀국 계획 관리
* **시설 회원**: + 시설 정보 관리, 구인공고 작성
* **코디네이터**: + 상담 관리, 다국어 서비스 제공
* **관리자**: 전체 시스템 관리

---

## 🏥 요양원 입주자 건강 상태 등급 관리 시스템

### 돌봄지수 체크 시스템 (KB라이프생명 참조)

#### **건강 상태 평가 항목 (4개 핵심 영역)**

**1. 걷기 활동 능력 (care_mobility)**
```yaml
등급 1 (독립): 혼자서 가능해요
등급 2 (부분도움): 부분적인 도움이 필요해요 (타인의 부축, 지팡이 이용 등)
등급 3 (완전도움): 혼자서는 보행이 어려워요 (휠체어 사용 등)
```

**2. 식사 활동 능력 (care_eating)**
```yaml
등급 1 (독립): 혼자서 가능해요
등급 2 (부분도움): 부분적인 도움이 필요해요 (반찬 집기, 자르기 등 일부 도움)
등급 3 (완전도움): 완전한 도움이 필요해요 (음식을 떠 먹여줌)
```

**3. 배변 활동 능력 (care_toilet)**
```yaml
등급 1 (독립): 혼자서 화장실을 이용할 수 있어요
등급 2 (부분도움): 화장실 이용 시 부분적인 도움이 필요해요
등급 3 (완전도움): 완전한 도움이 필요해요 (간이변기, 기저귀 착용 등)
```

**4. 의사소통 능력 (care_communication)**
```yaml
등급 1 (정상): 정상적으로 가능해요
등급 2 (부분제한): 때때로 어려워요 (화장실 이용의사 표현 가능)
등급 3 (심각제한): 소통이 어려워요 (화장실 이용의사 표현 잘 못함)
```

#### **종합 돌봄등급 산출 시스템**

**A. 장기요양보험 등급 기반**
```yaml
1등급: 가장 중증 (95점 이상)
2등급: 중증 (75점~94점)
3등급: 중등증 (60점~74점)
4등급: 경증 (51점~59점)
5등급: 경증 (45점~50점)
인지지원등급: 치매 특화 (45점 미만, 인지기능 저하)
```

**B. 돌봄대상자 상태 분류**
```yaml
상태 1: 6개월 이하의 기대수명 상태 (호스피스 케어)
상태 2: 질병이 회복하기 어려운 상황으로 수명이 얼마 남지 않음
상태 3: 완전히 타인 의존적인 상태이나 사망위험이 높지 않음
상태 4: 해당사항 없음 (일반 요양)
```

#### **요양 시설 등급 및 타입 분류 시스템**

**A. 시설 타입별 분류**
```yaml
주거복지시설:
  - 양로시설: 65세 이상 노인 공동생활 (등급 불필요)
  - 노인공동생활가정: 소규모 공동주택 (5-9명)
  - 노인복지주택: 독립주거 + 복지서비스

의료복지시설:
  - 노인요양시설: 장기요양 1-5등급 대상 (24시간 케어)
  - 노인요양공동생활가정: 소규모 요양시설 (5-9명)
  - 단기보호시설: 임시보호 서비스 (최대 15일)

의료기관:
  - 요양병원: 의료진 상주, 의료서비스 제공
  - 노인전문병원: 노인 특화 의료서비스
  - 노인요양병원: 장기입원 + 요양서비스

재가복지시설:
  - 방문요양서비스: 가정 방문 케어
  - 주야간보호서비스: 낮/밤 임시보호
  - 단기보호서비스: 가족 휴식 지원
```

**B. 시설 등급 분류 (건강보험심사평가원 기준)**
```yaml
A등급 (최우수):
  - 평가점수: 90점 이상
  - 특징: 최고 수준의 케어 품질, 의료진 우수, 시설 현대화
  - 대상: 1-2등급 중증환자 전문 케어

B등급 (우수):
  - 평가점수: 80-89점  
  - 특징: 양질의 케어 서비스, 안정적 운영
  - 대상: 2-3등급 중등도 환자 적합

C등급 (보통):
  - 평가점수: 70-79점
  - 특징: 기본 케어 서비스 제공, 표준적 운영
  - 대상: 3-5등급 경증환자 적합

D등급 (개선필요):
  - 평가점수: 60-69점
  - 특징: 케어 품질 개선 필요, 운영상 이슈
  - 주의: 매칭 시 신중 검토 필요

E등급 (부적합):
  - 평가점수: 60점 미만
  - 특징: 심각한 품질 문제, 행정처분 이력
  - 제외: 매칭 대상에서 제외 권장
```

**C. 전문 특화 시설 분류**
```yaml
치매 전문 시설:
  - 치매안심센터 연계 시설
  - 인지지원등급 전문 케어
  - 치매 행동증상 관리 프로그램

중증환자 전문 시설:
  - 1-2등급 전문 케어
  - 의료진 24시간 상주
  - 중환자실급 케어 시설

재활 전문 시설:
  - 물리치료, 작업치료 전문
  - 재활의학과 전문의 상주
  - 운동기능 개선 프로그램

호스피스 전문 시설:
  - 생애말기 케어 전문
  - 가족 상담 및 지원
  - 종교적/정신적 케어
```

**D. 시설 선택 매칭 알고리즘**
```java
@Entity
public class FacilityProfile {
    @Id
    private Long facilityId;
    
    // 기본 정보
    private String facilityName;
    private String facilityType;           // "양로시설", "노인요양시설", "요양병원" 등
    private String facilityGrade;          // "A", "B", "C", "D", "E"
    private Integer evaluationScore;       // 건강보험심사평가원 점수
    
    // 케어 가능 등급
    @ElementCollection
    private Set<Integer> acceptableCareGrades;  // [1,2,3,4,5,6]
    
    // 전문 분야
    @ElementCollection
    private Set<String> specializations;       // ["dementia", "medical", "rehabilitation"]
    
    // 시설 규모 및 정원
    private Integer totalCapacity;             // 총 정원
    private Integer currentOccupancy;          // 현재 입주자 수
    private Integer availableBeds;             // 가용 침대 수
    
    // 의료진 정보
    private Boolean hasDoctor;                 // 의사 상주 여부
    private Boolean hasNurse24h;               // 24시간 간호사 상주
    private Integer nurseCount;                // 간호사 수
    private Integer caregiverCount;            // 요양보호사 수
    
    // 시설 특징
    private Boolean hasElevator;               // 엘리베이터 보유
    private Boolean hasEmergencySystem;        // 응급시스템 구비
    private Boolean hasRehabilitationRoom;     // 재활실 보유
    private Boolean hasDementiaProgram;        // 치매 프로그램 운영
    
    // 위치 및 접근성
    private String region;                     // 지역 (시/도)
    private String district;                   // 구/군
    private Double latitude;                   // 위도
    private Double longitude;                  // 경도
    private Boolean nearSubway;                // 지하철 접근성
    private Boolean nearHospital;              // 병원 근접성
    
    // 비용 정보
    private Integer monthlyBasicFee;           // 월 기본료
    private Integer admissionFee;              // 입소금
    private Boolean acceptsLtci;               // 장기요양보험 적용
    
    private LocalDateTime lastUpdated;
}

@Service
public class FacilityMatchingService {
    
    public List<FacilityMatch> findCompatibleFacilities(HealthAssessment assessment, 
                                                       FacilityPreference preference) {
        
        CareGrade careGrade = assessment.getOverallCareGrade();
        
        return facilityRepository.findAll().stream()
            .filter(facility -> isBasicCompatible(facility, careGrade))
            .filter(facility -> hasAvailability(facility))
            .filter(facility -> meetsQualityStandard(facility))
            .map(facility -> calculateFacilityMatch(facility, assessment, preference))
            .sorted(Comparator.comparing(FacilityMatch::getMatchScore).reversed())
            .limit(20)
            .collect(Collectors.toList());
    }
    
    private boolean isBasicCompatible(FacilityProfile facility, CareGrade careGrade) {
        // 1. 케어 등급 호환성 체크
        boolean gradeCompatible = facility.getAcceptableCareGrades().contains(careGrade.getLevel());
        
        // 2. 시설 타입별 케어 등급 제한
        boolean typeCompatible = checkFacilityTypeCompatibility(facility.getFacilityType(), careGrade);
        
        // 3. 최소 품질 기준 (D등급 이상)
        boolean qualityAcceptable = !"E".equals(facility.getFacilityGrade());
        
        return gradeCompatible && typeCompatible && qualityAcceptable;
    }
    
    private boolean checkFacilityTypeCompatibility(String facilityType, CareGrade careGrade) {
        switch (facilityType) {
            case "양로시설":
                return careGrade.getLevel() >= 4; // 4-5등급만 가능
                
            case "노인요양시설":
                return true; // 모든 등급 가능
                
            case "요양병원":
                return careGrade.getLevel() <= 3; // 1-3등급 권장
                
            case "노인요양공동생활가정":
                return careGrade.getLevel() >= 3; // 3-5등급 적합
                
            case "치매전문시설":
                return careGrade.getLevel() == 6; // 인지지원등급
                
            default:
                return true;
        }
    }
    
    private FacilityMatch calculateFacilityMatch(FacilityProfile facility, 
                                               HealthAssessment assessment, 
                                               FacilityPreference preference) {
        double score = 0.0;
        
        // 1. 시설 등급 점수 (30%)
        score += calculateFacilityGradeScore(facility) * 0.3;
        
        // 2. 전문성 매칭 점수 (25%)
        score += calculateSpecializationScore(facility, assessment) * 0.25;
        
        // 3. 의료진 적합성 점수 (20%)
        score += calculateMedicalStaffScore(facility, assessment) * 0.2;
        
        // 4. 위치 접근성 점수 (15%)
        score += calculateLocationScore(facility, preference) * 0.15;
        
        // 5. 비용 적합성 점수 (10%)
        score += calculateCostScore(facility, preference) * 0.1;
        
        String explanation = generateFacilityMatchExplanation(facility, assessment, score);
        
        return new FacilityMatch(facility, score, explanation);
    }
    
    private double calculateFacilityGradeScore(FacilityProfile facility) {
        switch (facility.getFacilityGrade()) {
            case "A": return 5.0;
            case "B": return 4.0;
            case "C": return 3.0;
            case "D": return 2.0;
            case "E": return 0.0;
            default: return 2.5;
        }
    }
    
    private double calculateSpecializationScore(FacilityProfile facility, HealthAssessment assessment) {
        double score = 0.0;
        Set<String> specializations = facility.getSpecializations();
        
        // 치매 전문성
        if (assessment.getLtciGrade() == 6 && specializations.contains("dementia")) {
            score += 2.0;
        }
        
        // 의료 전문성 (1-2등급)
        if (assessment.getOverallCareGrade().getLevel() <= 2 && specializations.contains("medical")) {
            score += 2.0;
        }
        
        // 재활 전문성
        if (assessment.getMobilityLevel() >= 2 && specializations.contains("rehabilitation")) {
            score += 1.5;
        }
        
        // 호스피스 전문성
        if (assessment.getCareTargetStatus() <= 2 && specializations.contains("hospice")) {
            score += 1.5;
        }
        
        return Math.min(score, 5.0);
    }
    
    private double calculateMedicalStaffScore(FacilityProfile facility, HealthAssessment assessment) {
        double score = 2.5; // 기본 점수
        
        CareGrade careGrade = assessment.getOverallCareGrade();
        
        // 중증환자(1-2등급)는 의료진 필수
        if (careGrade.getLevel() <= 2) {
            if (facility.getHasDoctor()) score += 1.5;
            if (facility.getHasNurse24h()) score += 1.0;
        }
        
        // 간호사 대 환자 비율
        double nurseRatio = (double) facility.getNurseCount() / facility.getCurrentOccupancy();
        if (nurseRatio >= 0.1) score += 0.5; // 10:1 비율 이상
        
        return Math.min(score, 5.0);
    }
}
```

#### **코디네이터 시설 매칭 지원 시스템**

**코디네이터 역할: 시설 선택 컨설팅 및 입주 중개**
```yaml
코디네이터의 시설 관련 업무:
  - 고객 요구사항 분석 및 적합 시설 추천
  - 시설 견학 동행 및 전문적 평가
  - 시설-환자 매칭 적합성 판단  
  - 입주 계약 협상 및 행정 지원
  - 입주 후 적응 모니터링

시설 관리는 시설 내부 직원:
  - 요양보호사: 일상 케어 담당
  - 간호사: 의료 케어 담당
  - 시설장: 운영 관리 담당
```

**A. 코디네이터 시설 전문성 설정**
```java
@Entity
public class CoordinatorFacilityExpertise {
    @Id
    private Long id;
    private String coordinatorId;
    
    // 시설 타입별 전문성
    @ElementCollection
    private Set<String> expertFacilityTypes;     // ["노인요양시설", "요양병원", "치매전문시설"]
    
    // 시설 등급별 경험
    @ElementCollection
    private Map<String, Integer> facilityGradeExperience; // {"A": 5, "B": 12, "C": 8}
    
    // 지역별 시설 네트워크
    @ElementCollection
    private Set<String> familiarRegions;         // ["서울 강남구", "경기 성남시"]
    
    // 협력 시설 목록
    @ElementCollection
    private Set<Long> partnerFacilities;         // 협력 관계 시설 ID
    
    // 시설 평가 능력
    private Boolean canEvaluateMedicalCare;      // 의료 케어 평가 가능
    private Boolean canEvaluateFacilities;       // 시설 환경 평가 가능
    private Boolean canNegotiateContracts;       // 계약 협상 가능
    
    // 시설 매칭 성과
    private Integer successfulFacilityMatches;   // 성공한 시설 매칭 수
    private Double facilityMatchSatisfaction;    // 시설 매칭 만족도
    private Integer facilityVisitCount;          // 시설 방문 횟수
}
```

**B. 시설 추천 알고리즘 (코디네이터 관점)**
```java
@Service
public class CoordinatorFacilityRecommendationService {
    
    public List<FacilityRecommendation> recommendFacilities(
        String coordinatorId,
        HealthAssessment assessment, 
        FamilyPreference preference) {
        
        Coordinator coordinator = coordinatorRepository.findById(coordinatorId);
        CoordinatorFacilityExpertise expertise = coordinator.getFacilityExpertise();
        
        // 1. 코디네이터 전문 분야 기반 시설 필터링
        List<FacilityProfile> candidateFacilities = findFacilitiesInExpertise(expertise, assessment);
        
        // 2. 코디네이터 네트워크 시설 우선 추천
        List<FacilityRecommendation> recommendations = candidateFacilities.stream()
            .map(facility -> createRecommendation(coordinator, facility, assessment, preference))
            .sorted(Comparator.comparing(FacilityRecommendation::getRecommendationScore).reversed())
            .limit(10)
            .collect(Collectors.toList());
            
        return recommendations;
    }
    
    private FacilityRecommendation createRecommendation(
        Coordinator coordinator,
        FacilityProfile facility,
        HealthAssessment assessment,
        FamilyPreference preference) {
        
        double score = 0.0;
        
        // 1. 기본 시설-환자 매칭 점수 (40%)
        score += calculateBasicMatchScore(facility, assessment) * 0.4;
        
        // 2. 코디네이터 전문성 매칭 점수 (25%)
        score += calculateCoordinatorExpertiseScore(coordinator, facility) * 0.25;
        
        // 3. 과거 매칭 성공률 점수 (20%)
        score += calculateHistoricalSuccessScore(coordinator, facility) * 0.2;
        
        // 4. 가족 선호도 매칭 점수 (15%)
        score += calculateFamilyPreferenceScore(facility, preference) * 0.15;
        
        String reason = generateRecommendationReason(coordinator, facility, assessment, score);
        
        return new FacilityRecommendation(facility, score, reason, coordinator.getId());
    }
    
    private double calculateCoordinatorExpertiseScore(Coordinator coordinator, FacilityProfile facility) {
        CoordinatorFacilityExpertise expertise = coordinator.getFacilityExpertise();
        double score = 2.5; // 기본 점수
        
        // 시설 타입 전문성
        if (expertise.getExpertFacilityTypes().contains(facility.getFacilityType())) {
            score += 1.5;
        }
        
        // 시설 등급 경험
        Integer gradeExperience = expertise.getFacilityGradeExperience()
            .get(facility.getFacilityGrade());
        if (gradeExperience != null && gradeExperience > 0) {
            score += Math.min(gradeExperience * 0.1, 1.0); // 경험치 반영
        }
        
        // 지역 친숙도
        String facilityRegion = facility.getRegion() + " " + facility.getDistrict();
        if (expertise.getFamiliarRegions().contains(facilityRegion)) {
            score += 0.5;
        }
        
        // 협력 시설 여부
        if (expertise.getPartnerFacilities().contains(facility.getFacilityId())) {
            score += 0.5; // 협력 시설 가산점
        }
        
        return Math.min(score, 5.0);
    }
}
```

**C. 시설 견학 및 평가 지원**
```java
@Entity
public class FacilityVisitPlan {
    @Id
    private Long id;
    private String coordinatorId;
    private String clientId;
    
    // 견학 계획
    @ElementCollection
    private List<Long> plannedFacilities;        // 견학 예정 시설
    private LocalDateTime visitDate;
    private String visitPurpose;                  // "초기상담", "최종선택", "재평가"
    
    // 평가 체크리스트
    private String medicalCareEvaluation;         // 의료 케어 평가
    private String livingEnvironmentEvaluation;   // 생활 환경 평가
    private String staffQualityEvaluation;        // 직원 품질 평가
    private String costEvaluation;                // 비용 적정성 평가
    
    // 가족 피드백
    private String familyFeedback;
    private Integer familySatisfactionScore;      // 1-5점
    
    private LocalDateTime createdAt;
}

@Service
public class FacilityVisitSupportService {
    
    public FacilityVisitPlan planFacilityVisits(
        String coordinatorId,
        String clientId, 
        List<FacilityRecommendation> recommendations) {
        
        // 상위 3-5개 시설 선별
        List<Long> topFacilities = recommendations.stream()
            .limit(5)
            .map(rec -> rec.getFacility().getFacilityId())
            .collect(Collectors.toList());
            
        FacilityVisitPlan plan = new FacilityVisitPlan();
        plan.setCoordinatorId(coordinatorId);
        plan.setClientId(clientId);
        plan.setPlannedFacilities(topFacilities);
        plan.setVisitPurpose("초기상담");
        
        return facilityVisitPlanRepository.save(plan);
    }
    
    public FacilityEvaluationReport evaluateFacility(
        String coordinatorId,
        Long facilityId,
        HealthAssessment assessment) {
        
        FacilityProfile facility = facilityRepository.findById(facilityId);
        Coordinator coordinator = coordinatorRepository.findById(coordinatorId);
        
        FacilityEvaluationReport report = new FacilityEvaluationReport();
        
        // 1. 케어 적합성 평가
        report.setCareCompatibilityScore(
            evaluateCareCompatibility(facility, assessment));
        
        // 2. 시설 환경 평가
        report.setEnvironmentScore(
            evaluateEnvironment(facility, assessment));
            
        // 3. 비용 적정성 평가
        report.setCostEffectivenessScore(
            evaluateCostEffectiveness(facility, assessment));
            
        // 4. 종합 추천도
        report.setOverallRecommendation(
            calculateOverallRecommendation(report));
            
        return report;
    }
}
```

**D. 입주 중개 및 계약 지원**
```java
@Entity
public class FacilityAdmissionSupport {
    @Id
    private Long id;
    private String coordinatorId;
    private String clientId;
    private Long selectedFacilityId;
    
    // 입주 절차 진행 상황
    private String admissionStatus;               // "상담완료", "계약협상", "서류준비", "입주완료"
    
    // 계약 협상 내용
    private Integer negotiatedMonthlyFee;         // 협상된 월 이용료
    private Integer negotiatedAdmissionFee;       // 협상된 입소금
    private String specialTerms;                  // 특별 약정 사항
    
    // 필요 서류 체크리스트
    private Boolean healthCertificateReady;       // 건강진단서
    private Boolean ltciCertificateReady;         // 장기요양인정서
    private Boolean insuranceReady;               // 보험 가입 확인
    private Boolean emergencyContactReady;        // 응급연락처
    
    // 입주 준비 지원
    private String personalItemsList;             // 개인 물품 목록
    private LocalDateTime estimatedAdmissionDate; // 예상 입주일
    private String specialCareInstructions;       // 특별 케어 지시사항
    
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
}

@Component
public class AdmissionSupportWorkflow {
    
    public void initiateAdmissionProcess(
        String coordinatorId,
        String clientId,
        Long facilityId) {
        
        FacilityAdmissionSupport support = new FacilityAdmissionSupport();
        support.setCoordinatorId(coordinatorId);
        support.setClientId(clientId);
        support.setSelectedFacilityId(facilityId);
        support.setAdmissionStatus("상담완료");
        
        // 자동으로 필요 서류 체크리스트 생성
        initializeDocumentChecklist(support);
        
        // 시설과 초기 협상 일정 조율
        scheduleInitialNegotiation(support);
        
        admissionSupportRepository.save(support);
    }
    
    public void updateAdmissionProgress(Long supportId, String newStatus) {
        FacilityAdmissionSupport support = admissionSupportRepository.findById(supportId);
        support.setAdmissionStatus(newStatus);
        support.setLastUpdated(LocalDateTime.now());
        
        // 상태별 자동 작업 실행
        switch (newStatus) {
            case "계약협상":
                prepareNegotiationMaterials(support);
                break;
            case "서류준비":
                sendDocumentReminders(support);
                break;
            case "입주완료":
                scheduleFollowUpVisit(support);
                break;
        }
        
        admissionSupportRepository.save(support);
    }
}
```

**E. 입주 후 적응 모니터링**
```java
@Entity
public class PostAdmissionMonitoring {
    @Id
    private Long id;
    private String coordinatorId;
    private String clientId;
    private Long facilityId;
    
    // 모니터링 일정
    private LocalDateTime admissionDate;
    private LocalDateTime firstCheckDate;         // 1주 후
    private LocalDateTime monthlyCheckDate;       // 1개월 후
    private LocalDateTime quarterlyCheckDate;     // 3개월 후
    
    // 적응 상태 평가
    private Integer clientSatisfactionScore;      // 입주자 만족도 (1-5)
    private Integer familySatisfactionScore;      // 가족 만족도 (1-5)
    private Integer facilitySatisfactionScore;    // 시설 만족도 (1-5)
    
    // 이슈 및 개선사항
    private String identifiedIssues;             // 발견된 문제점
    private String improvementActions;           // 개선 조치사항
    private Boolean needsRemediation;            // 중재 필요 여부
    
    // 서비스 지속성
    private Boolean serviceCompleted;            // 서비스 완료 여부
    private LocalDateTime serviceEndDate;        // 서비스 종료일
    private String completionReason;             // 완료 사유
}
```

#### **AI 기반 종합 케어 등급 산출**

**케어 등급 계산 로직**
```java
public class CareGradeCalculator {
    
    public CareGrade calculateComprehensiveGrade(HealthAssessment assessment) {
        // 1. 기본 ADL 점수 계산 (일상생활수행능력)
        int adlScore = calculateADLScore(assessment);
        
        // 2. 장기요양보험 등급 반영
        int ltciGrade = assessment.getLtciGrade();
        
        // 3. 돌봄대상자 상태 반영
        int careTargetStatus = assessment.getCareTargetStatus();
        
        // 4. 종합 케어 등급 도출
        return determineOverallCareGrade(adlScore, ltciGrade, careTargetStatus);
    }
    
    private int calculateADLScore(HealthAssessment assessment) {
        int mobility = assessment.getMobilityLevel();    // 1-3
        int eating = assessment.getEatingLevel();        // 1-3  
        int toilet = assessment.getToiletLevel();        // 1-3
        int communication = assessment.getCommunicationLevel(); // 1-3
        
        // 각 영역별 가중치 적용
        return (mobility * 25) + (eating * 20) + (toilet * 30) + (communication * 25);
    }
}
```

#### **코디네이터 자기 설정 케어 등급 시스템**

**코디네이터 프로필 관리 (Self-Configuration)**
```yaml
기본 자격 등급 (시스템 자동 설정):
  - 자격증 기반 최소 케어 등급 자동 산출
  - 경력 연수별 등급 상한선 설정
  - 교육 이수 현황 반영

개인 설정 케어 등급 (코디네이터 직접 설정):
  - 희망 케어 등급 범위 선택 (복수 선택 가능)
  - 전문 분야별 세부 등급 설정
  - 케어 거부 등급 설정 (개인 사정으로 담당 불가)
  - 동시 담당 가능 케이스 수 설정

실제 매칭 등급 (AI 기반 최적화):
  - 기본 자격 + 개인 설정 + 성과 이력 종합
  - 고객 만족도 기반 등급 조정
  - 케이스 성공률 기반 신뢰도 점수
```

**코디네이터 등급 세분화 시스템**
```yaml
자격증 기반 기본 등급:
  Tier 1 (요양보호사): 
    - 기본 케어 등급: 4-5등급, 인지지원등급
    - 상한선: 3등급까지 가능 (경력 2년+ 시)
    
  Tier 2 (간호조무사, 사회복지사):
    - 기본 케어 등급: 2-5등급  
    - 상한선: 1등급까지 가능 (경력 5년+ 시)
    
  Tier 3 (간호사, 의료진):
    - 기본 케어 등급: 1-5등급 전체
    - 특수 케어: 호스피스, 의료진 협력 케어

경력별 등급 확장:
  신입 (0-1년): 기본 등급에서 -1단계
  경력자 (2-4년): 기본 등급 
  전문가 (5년+): 기본 등급에서 +1단계
  마스터 (10년+): 전체 등급 + 특수 케어
```

**코디네이터 개인 설정 시스템**
```java
@Entity
public class CoordinatorCareSettings {
    @Id
    private Long id;
    private String coordinatorId;
    
    // 시스템 자동 산출 등급
    private Integer baseCareLevel;           // 자격증 기반 기본 등급
    private Integer maxCareLevel;            // 경력 기반 최대 등급
    
    // 코디네이터 개인 설정
    @ElementCollection
    private Set<Integer> preferredCareGrades;    // 선호 케어 등급 [1,2,3,4,5,6]
    
    @ElementCollection  
    private Set<Integer> excludedCareGrades;     // 거부 케어 등급 [1,2]
    
    @ElementCollection
    private Set<String> specialtyAreas;         // 전문 분야 ["dementia", "medical"]
    
    // 업무량 설정
    private Integer maxSimultaneousCases;       // 동시 담당 가능 케이스 수
    private Integer preferredCasesPerMonth;     // 월 선호 케이스 수
    
    // 근무 조건 설정
    private Boolean availableWeekends;          // 주말 근무 가능 여부
    private Boolean availableEmergency;         // 응급 상황 대응 가능 여부
    private Set<String> workingRegions;         // 근무 가능 지역
    
    // 성과 기반 조정
    private Double performanceScore;            // 성과 점수 (0.0-5.0)
    private Double customerSatisfaction;        // 고객 만족도 (0.0-5.0)
    private Integer successfulCases;            // 성공 케이스 수
    private Integer totalCases;                 // 총 담당 케이스 수
    
    private LocalDateTime lastUpdated;
}
```

#### **AI 기반 최적화 매칭 알고리즘**

**1. 다층 매칭 시스템 (Multi-Layer Matching)**
```java
@Service
public class OptimizedCoordinatorMatchingService {
    
    public List<CoordinatorMatch> findOptimalMatches(HealthAssessment assessment, 
                                                   MatchingPreference preference) {
        
        // 1단계: 기본 자격 필터링
        List<Coordinator> eligibleCoordinators = filterByBasicQualifications(assessment);
        
        // 2단계: 코디네이터 설정 매칭
        List<Coordinator> settingsMatched = filterByCoordinatorSettings(eligibleCoordinators, assessment);
        
        // 3단계: AI 스코어링 및 최적화
        List<CoordinatorMatch> scoredMatches = calculateOptimalMatches(settingsMatched, assessment);
        
        // 4단계: 실시간 가용성 확인
        return filterByRealTimeAvailability(scoredMatches, preference);
    }
    
    private List<Coordinator> filterByBasicQualifications(HealthAssessment assessment) {
        CareGrade requiredGrade = assessment.getOverallCareGrade();
        
        return coordinatorRepository.findAll().stream()
            .filter(coordinator -> {
                CoordinatorCareSettings settings = coordinator.getCareSettings();
                
                // 기본 자격 체크
                boolean hasBasicQualification = settings.getBaseCareLevel() <= requiredGrade.getLevel();
                
                // 최대 등급 체크  
                boolean withinMaxLevel = settings.getMaxCareLevel() >= requiredGrade.getLevel();
                
                // 개인 설정 체크
                boolean inPreferredGrades = settings.getPreferredCareGrades().contains(requiredGrade.getLevel());
                boolean notExcluded = !settings.getExcludedCareGrades().contains(requiredGrade.getLevel());
                
                return hasBasicQualification && withinMaxLevel && inPreferredGrades && notExcluded;
            })
            .collect(Collectors.toList());
    }
    
    private List<CoordinatorMatch> calculateOptimalMatches(List<Coordinator> coordinators, 
                                                         HealthAssessment assessment) {
        return coordinators.stream()
            .map(coordinator -> {
                double matchScore = calculateComprehensiveMatchScore(coordinator, assessment);
                return new CoordinatorMatch(coordinator, matchScore, 
                    generateMatchReason(coordinator, assessment));
            })
            .sorted(Comparator.comparing(CoordinatorMatch::getMatchScore).reversed())
            .limit(10) // 상위 10명만 선별
            .collect(Collectors.toList());
    }
    
    private double calculateComprehensiveMatchScore(Coordinator coordinator, HealthAssessment assessment) {
        double score = 0.0;
        
        // 1. 전문성 매칭 점수 (40%)
        score += calculateSpecialtyMatchScore(coordinator, assessment) * 0.4;
        
        // 2. 경력 및 성과 점수 (25%)
        score += calculateExperienceScore(coordinator) * 0.25;
        
        // 3. 고객 만족도 점수 (20%)
        score += coordinator.getCareSettings().getCustomerSatisfaction() * 0.2;
        
        // 4. 지역 접근성 점수 (10%)
        score += calculateLocationScore(coordinator, assessment) * 0.1;
        
        // 5. 실시간 가용성 보너스 (5%)
        score += calculateAvailabilityBonus(coordinator) * 0.05;
        
        return Math.min(score, 5.0); // 최대 5점
    }
}
```

**2. 전문성 기반 스마트 매칭**
```java
private double calculateSpecialtyMatchScore(Coordinator coordinator, HealthAssessment assessment) {
    double specialtyScore = 0.0;
    Set<String> coordinatorSpecialties = coordinator.getCareSettings().getSpecialtyAreas();
    
    // 치매 전문성 매칭
    if (assessment.getLtciGrade() == 6 || assessment.getCommunicationLevel() == 3) {
        if (coordinatorSpecialties.contains("dementia")) {
            specialtyScore += 2.0;
        }
    }
    
    // 의료 전문성 매칭 (1-2등급, 상태1-2)
    if (assessment.getOverallCareGrade().getLevel() <= 2 || assessment.getCareTargetStatus() <= 2) {
        if (coordinatorSpecialties.contains("medical")) {
            specialtyScore += 2.0;
        }
    }
    
    // 재활 전문성 매칭
    if (assessment.getMobilityLevel() >= 2) {
        if (coordinatorSpecialties.contains("rehabilitation")) {
            specialtyScore += 1.5;
        }
    }
    
    // 영양 전문성 매칭
    if (assessment.getEatingLevel() >= 2) {
        if (coordinatorSpecialties.contains("nutrition")) {
            specialtyScore += 1.5;
        }
    }
    
    // 다국어 지원 (재외동포)
    if (assessment.isOverseasKorean()) {
        if (coordinatorSpecialties.contains("multilingual")) {
            specialtyScore += 1.0;
        }
    }
    
    return Math.min(specialtyScore, 5.0);
}
```

**3. 실시간 가용성 및 업무량 최적화**
```java
@Component
public class CoordinatorWorkloadOptimizer {
    
    public List<CoordinatorMatch> optimizeWorkloadDistribution(List<CoordinatorMatch> matches) {
        return matches.stream()
            .map(match -> {
                Coordinator coordinator = match.getCoordinator();
                double workloadScore = calculateWorkloadScore(coordinator);
                
                // 업무량이 적은 코디네이터에게 가산점
                double adjustedScore = match.getMatchScore() + (workloadScore * 0.3);
                
                return new CoordinatorMatch(coordinator, adjustedScore, 
                    match.getMatchReason() + generateWorkloadReason(workloadScore));
            })
            .sorted(Comparator.comparing(CoordinatorMatch::getMatchScore).reversed())
            .collect(Collectors.toList());
    }
    
    private double calculateWorkloadScore(Coordinator coordinator) {
        CoordinatorCareSettings settings = coordinator.getCareSettings();
        int currentCases = getCurrentActiveCases(coordinator.getId());
        int maxCases = settings.getMaxSimultaneousCases();
        
        // 업무량 비율 계산 (낮을수록 높은 점수)
        double workloadRatio = (double) currentCases / maxCases;
        
        if (workloadRatio >= 1.0) return 0.0;      // 포화 상태
        if (workloadRatio >= 0.8) return 1.0;      // 거의 포화
        if (workloadRatio >= 0.6) return 2.0;      // 적정 수준
        if (workloadRatio >= 0.4) return 3.0;      // 여유 있음
        return 4.0;                                // 매우 여유
    }
}
```

**4. 지능형 매칭 결과 설명**
```java
public class MatchingExplanationGenerator {
    
    public String generateMatchReason(Coordinator coordinator, HealthAssessment assessment) {
        StringBuilder reason = new StringBuilder();
        
        // 전문성 매칭 이유
        if (isSpecialtyMatch(coordinator, assessment)) {
            reason.append("🎯 전문 분야 완벽 매칭: ");
            reason.append(getSpecialtyDescription(coordinator, assessment));
            reason.append("\n");
        }
        
        // 경력 매칭 이유
        int experience = coordinator.getCareSettings().getExperienceYears();
        reason.append("📊 경력: ").append(experience).append("년 (");
        if (experience >= 10) reason.append("최고 전문가");
        else if (experience >= 5) reason.append("숙련 전문가");
        else if (experience >= 2) reason.append("경력자");
        else reason.append("신입");
        reason.append(")\n");
        
        // 성과 이유
        double satisfaction = coordinator.getCareSettings().getCustomerSatisfaction();
        reason.append("⭐ 고객 만족도: ").append(satisfaction).append("/5.0");
        if (satisfaction >= 4.5) reason.append(" (최우수)");
        else if (satisfaction >= 4.0) reason.append(" (우수)");
        else if (satisfaction >= 3.5) reason.append(" (양호)");
        reason.append("\n");
        
        // 가용성 이유
        int currentLoad = getCurrentActiveCases(coordinator.getId());
        int maxLoad = coordinator.getCareSettings().getMaxSimultaneousCases();
        reason.append("⏰ 현재 업무량: ").append(currentLoad).append("/").append(maxLoad);
        if (currentLoad < maxLoad * 0.6) reason.append(" (즉시 배정 가능)");
        else if (currentLoad < maxLoad * 0.8) reason.append(" (배정 가능)");
        else reason.append(" (일정 조율 필요)");
        
        return reason.toString();
    }
}
```

**5. 매칭 성능 모니터링**
```yaml
매칭 성공률 추적:
  - 초기 매칭 성공률: 매칭 후 계약 체결율
  - 장기 만족도: 3개월 후 고객 만족도  
  - 코디네이터 만족도: 업무 부하 적정성
  - 재매칭률: 코디네이터 변경 요청률

실시간 최적화:
  - A/B 테스트: 매칭 알고리즘 성능 비교
  - 머신러닝: 매칭 성공 패턴 학습
  - 피드백 루프: 결과 기반 알고리즘 개선
  - 계절별 조정: 시기별 수요 패턴 반영
```

#### **건강 상태 체크리스트 API**

**엔티티 설계**
```java
@Entity
public class HealthAssessment {
    @Id
    private Long id;
    
    // 기본 정보
    private String memberId;
    private String gender;
    private Integer birthYear;
    
    // ADL 평가 (1-3점)
    private Integer mobilityLevel;        // 걷기 활동
    private Integer eatingLevel;          // 식사 활동  
    private Integer toiletLevel;          // 배변 활동
    private Integer communicationLevel;   // 의사소통
    
    // 장기요양보험 정보
    private Integer ltciGrade;           // 1-5등급, 6(인지지원), 7(모름), 8(없음)
    
    // 돌봄대상자 상태
    private Integer careTargetStatus;    // 1-4 (생명예후 상태)
    
    // 계산된 결과
    private Integer adlScore;            // ADL 점수 (4-12점)
    private String overallCareGrade;     // 종합 케어 등급
    private LocalDateTime assessmentDate;
}

@Entity  
public class CoordinatorProfile {
    @Id
    private Long id;
    private String coordinatorId;
    
    // 전문성 레벨
    private Integer professionalLevel;   // 1(초급), 2(중급), 3(고급)
    
    // 케어 가능 등급 (JSON 배열)
    private String compatibleCareGrades; // ["1", "2", "3"]
    
    // 전문 분야 (JSON 배열)  
    private String specialties;          // ["dementia", "medical", "rehabilitation"]
    
    // 자격증 정보
    private String certifications;       // ["nurse", "social_worker_1"]
    
    // 경력 정보
    private Integer experienceYears;
    private Integer totalCases;
    private Double satisfactionScore;
}
```

#### **코디네이터 프로필 관리 시스템**

**API 엔드포인트 설계**
```java
@RestController
@RequestMapping("/api/coordinators")
public class CoordinatorProfileController {
    
    @GetMapping("/{coordinatorId}/care-settings")
    public ResponseEntity<CoordinatorCareSettings> getCareSettings(@PathVariable String coordinatorId) {
        // 코디네이터 케어 설정 조회
    }
    
    @PutMapping("/{coordinatorId}/care-settings")
    public ResponseEntity<CoordinatorCareSettings> updateCareSettings(
        @PathVariable String coordinatorId,
        @RequestBody @Valid CoordinatorCareSettingsRequest request) {
        // 케어 설정 업데이트
    }
    
    @PostMapping("/{coordinatorId}/care-grades/preferences")
    public ResponseEntity<Void> updateCareGradePreferences(
        @PathVariable String coordinatorId,
        @RequestBody CareGradePreferencesRequest request) {
        // 선호/거부 케어 등급 설정
    }
    
    @GetMapping("/{coordinatorId}/matching-statistics")
    public ResponseEntity<MatchingStatistics> getMatchingStatistics(@PathVariable String coordinatorId) {
        // 매칭 성과 통계 조회
    }
    
    @PostMapping("/{coordinatorId}/availability")
    public ResponseEntity<Void> updateAvailability(
        @PathVariable String coordinatorId,
        @RequestBody AvailabilityRequest request) {
        // 실시간 가용성 업데이트
    }
}
```

**React 컴포넌트 - 코디네이터 프로필 관리**
```typescript
// 코디네이터 케어 설정 관리 컴포넌트
export const CoordinatorCareSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<CoordinatorCareSettings>({
    preferredCareGrades: [],
    excludedCareGrades: [],
    specialtyAreas: [],
    maxSimultaneousCases: 3,
    preferredCasesPerMonth: 10,
    availableWeekends: false,
    availableEmergency: false,
    workingRegions: []
  });

  const careGradeOptions = [
    { value: 1, label: "1등급 (최중증)", description: "24시간 전문 케어 필요" },
    { value: 2, label: "2등급 (중증)", description: "집중적인 의료 지원 필요" },
    { value: 3, label: "3등급 (중등증)", description: "일상 활동 상당한 도움 필요" },
    { value: 4, label: "4등급 (경증)", description: "부분적인 도움 필요" },
    { value: 5, label: "5등급 (경증)", description: "기본적인 지원 필요" },
    { value: 6, label: "인지지원등급", description: "치매 전문 케어" }
  ];

  const specialtyOptions = [
    { value: "dementia", label: "치매 전문", icon: "🧠" },
    { value: "medical", label: "의료 전문", icon: "🏥" },
    { value: "rehabilitation", label: "재활 전문", icon: "💪" },
    { value: "nutrition", label: "영양 전문", icon: "🥗" },
    { value: "multilingual", label: "다국어 지원", icon: "🌐" },
    { value: "hospice", label: "호스피스 케어", icon: "🕊️" }
  ];

  const handleSaveSettings = async () => {
    try {
      await coordinatorApi.updateCareSettings(coordinatorId, settings);
      toast.success("케어 설정이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      toast.error("설정 업데이트에 실패했습니다.");
    }
  };

  return (
    <div className="coordinator-care-settings">
      <div className="settings-section">
        <h3>선호 케어 등급 설정</h3>
        <p className="description">담당하고 싶은 케어 등급을 선택하세요. (복수 선택 가능)</p>
        
        <div className="care-grade-selection">
          {careGradeOptions.map(option => (
            <div key={option.value} className="grade-option">
              <Checkbox
                checked={settings.preferredCareGrades.includes(option.value)}
                onChange={(checked) => handleGradeToggle('preferred', option.value, checked)}
              />
              <div className="grade-info">
                <span className="grade-label">{option.label}</span>
                <span className="grade-description">{option.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>케어 거부 등급 설정</h3>
        <p className="description">개인 사정으로 담당하기 어려운 등급을 선택하세요.</p>
        
        <div className="excluded-grades">
          {careGradeOptions.map(option => (
            <div key={option.value} className="grade-option">
              <Checkbox
                checked={settings.excludedCareGrades.includes(option.value)}
                onChange={(checked) => handleGradeToggle('excluded', option.value, checked)}
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>전문 분야 설정</h3>
        <div className="specialty-selection">
          {specialtyOptions.map(specialty => (
            <div key={specialty.value} className="specialty-card">
              <input
                type="checkbox"
                checked={settings.specialtyAreas.includes(specialty.value)}
                onChange={(e) => handleSpecialtyToggle(specialty.value, e.target.checked)}
              />
              <div className="specialty-info">
                <span className="specialty-icon">{specialty.icon}</span>
                <span className="specialty-label">{specialty.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>업무량 설정</h3>
        <div className="workload-settings">
          <div className="input-group">
            <label>동시 담당 가능 케이스 수</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxSimultaneousCases}
              onChange={(e) => setSettings({...settings, maxSimultaneousCases: parseInt(e.target.value)})}
            />
          </div>
          
          <div className="input-group">
            <label>월 선호 케이스 수</label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.preferredCasesPerMonth}
              onChange={(e) => setSettings({...settings, preferredCasesPerMonth: parseInt(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>근무 조건 설정</h3>
        <div className="work-conditions">
          <div className="condition-item">
            <Checkbox
              checked={settings.availableWeekends}
              onChange={(checked) => setSettings({...settings, availableWeekends: checked})}
            />
            <span>주말 근무 가능</span>
          </div>
          
          <div className="condition-item">
            <Checkbox
              checked={settings.availableEmergency}
              onChange={(checked) => setSettings({...settings, availableEmergency: checked})}
            />
            <span>응급 상황 대응 가능</span>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button onClick={handleSaveSettings} className="save-button">
          설정 저장
        </button>
        <button onClick={handlePreviewMatching} className="preview-button">
          매칭 미리보기
        </button>
      </div>
    </div>
  );
};
```

**매칭 미리보기 컴포넌트**
```typescript
export const MatchingPreview: React.FC<{coordinatorId: string}> = ({coordinatorId}) => {
  const [matchingPreview, setMatchingPreview] = useState<MatchingPreviewData | null>(null);
  
  const loadMatchingPreview = async () => {
    const preview = await coordinatorApi.getMatchingPreview(coordinatorId);
    setMatchingPreview(preview);
  };

  return (
    <div className="matching-preview">
      <h3>🎯 매칭 미리보기</h3>
      <p>현재 설정으로 매칭 가능한 케이스들을 확인해보세요.</p>
      
      {matchingPreview && (
        <div className="preview-results">
          <div className="preview-stats">
            <div className="stat-item">
              <span className="stat-number">{matchingPreview.totalEligibleCases}</span>
              <span className="stat-label">매칭 가능 케이스</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-number">{matchingPreview.averageMatchScore.toFixed(1)}</span>
              <span className="stat-label">평균 매칭 점수</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-number">{matchingPreview.weeklyExpectedCases}</span>
              <span className="stat-label">주간 예상 배정</span>
            </div>
          </div>

          <div className="preview-recommendations">
            <h4>💡 설정 개선 제안</h4>
            {matchingPreview.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="rec-icon">💡</span>
                <span className="rec-text">{rec.message}</span>
                {rec.actionable && (
                  <button 
                    className="apply-recommendation"
                    onClick={() => applyRecommendation(rec)}
                  >
                    적용
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

**실시간 가용성 관리**
```typescript
export const CoordinatorAvailabilityWidget: React.FC = () => {
  const [availability, setAvailability] = useState({
    status: 'available', // available, busy, offline
    currentCases: 2,
    maxCases: 5,
    nextAvailable: null as Date | null
  });

  const updateAvailability = async (newStatus: string) => {
    await coordinatorApi.updateAvailability(coordinatorId, {
      status: newStatus,
      timestamp: new Date()
    });
    setAvailability({...availability, status: newStatus});
  };

  return (
    <div className="availability-widget">
      <h4>📊 실시간 가용성</h4>
      
      <div className="current-status">
        <div className={`status-indicator ${availability.status}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {availability.status === 'available' && '매칭 가능'}
            {availability.status === 'busy' && '업무 중'}
            {availability.status === 'offline' && '오프라인'}
          </span>
        </div>
      </div>

      <div className="workload-indicator">
        <div className="workload-bar">
          <div 
            className="workload-fill"
            style={{width: `${(availability.currentCases / availability.maxCases) * 100}%`}}
          ></div>
        </div>
        <span className="workload-text">
          {availability.currentCases}/{availability.maxCases} 케이스 담당 중
        </span>
      </div>

      <div className="status-controls">
        <button 
          onClick={() => updateAvailability('available')}
          className={availability.status === 'available' ? 'active' : ''}
        >
          매칭 가능
        </button>
        <button 
          onClick={() => updateAvailability('busy')}
          className={availability.status === 'busy' ? 'active' : ''}
        >
          업무 중
        </button>
        <button 
          onClick={() => updateAvailability('offline')}
          className={availability.status === 'offline' ? 'active' : ''}
        >
          오프라인
        </button>
      </div>
    </div>
  );
};
```

#### **체크리스트 UI 컴포넌트**

**React 컴포넌트 구조**
```typescript
// 건강 상태 체크리스트 컴포넌트
export const HealthAssessmentForm: React.FC = () => {
  const [assessment, setAssessment] = useState<HealthAssessmentData>({
    mobility: null,
    eating: null, 
    toilet: null,
    communication: null,
    ltciGrade: null,
    careTargetStatus: null
  });

  const assessmentQuestions = {
    mobility: {
      title: "걷기 활동 능력",
      options: [
        { value: 1, label: "혼자서 가능해요" },
        { value: 2, label: "부분적인 도움이 필요해요\n(타인의 부축, 지팡이 이용 등)" },
        { value: 3, label: "혼자서는 보행이 어려워요\n(휠체어 사용 등)" }
      ]
    },
    // ... 다른 항목들
  };

  const handleSubmit = async () => {
    const result = await healthAssessmentApi.calculate(assessment);
    // 결과 처리 및 코디네이터 추천
  };
};
```

---

## 🤖 챗봇 '엘비' 자동화 시스템 (AI-Powered Process Automation)

### 챗봇 자동화의 핵심 가치

**재외동포를 위한 한국 행정 절차 자동화**
```yaml
자동화 목표:
  - 복잡한 한국 행정 절차를 단계별 대화로 단순화
  - 반복적인 서류 작성 작업을 AI가 대신 처리
  - 24시간 다국어 지원으로 시차 문제 해결
  - 실시간 진행 상황 추적 및 알림

대상 사용자:
  - 재외동포: 한국 시스템에 익숙하지 않은 해외 거주자
  - 고령자: 복잡한 온라인 양식 작성이 어려운 사용자
  - 가족: 부모님 대신 서류를 준비하는 자녀들
```

#### **A. 챗봇 기반 서류 작성 자동화**

**1. 건강 관련 서류 자동화**
```java
@Component
public class HealthDocumentAutomation {
    
    public class HealthCertificateBot {
        
        public ChatResponse processHealthCertificate(String userId, ChatMessage message) {
            HealthDocumentSession session = getOrCreateSession(userId, "health_certificate");
            
            switch (session.getCurrentStep()) {
                case "GREETING":
                    return askBasicInfo();
                    
                case "BASIC_INFO":
                    session.setBasicInfo(extractBasicInfo(message));
                    return askMedicalHistory();
                    
                case "MEDICAL_HISTORY":
                    session.setMedicalHistory(extractMedicalHistory(message));
                    return askCurrentSymptoms();
                    
                case "CURRENT_SYMPTOMS":
                    session.setCurrentSymptoms(extractSymptoms(message));
                    return askPreferredHospital();
                    
                case "HOSPITAL_SELECTION":
                    session.setPreferredHospital(extractHospital(message));
                    return generateHealthCertificateForm(session);
                    
                case "FORM_REVIEW":
                    if (message.getContent().contains("확인") || message.getContent().contains("제출")) {
                        return submitHealthCertificateApplication(session);
                    }
                    return askForCorrections(message);
            }
        }
        
        private ChatResponse askBasicInfo() {
            return ChatResponse.builder()
                .message("안녕하세요! 건강진단서 신청을 도와드리겠습니다. 먼저 기본 정보를 알려주세요.\n\n" +
                        "📋 필요한 정보:\n" +
                        "• 성명 (한글)\n" +
                        "• 생년월일 (예: 1950년 3월 15일)\n" +
                        "• 주민등록번호 앞 6자리\n\n" +
                        "예시: 홍길동, 1950년 3월 15일, 500315")
                .type(ChatMessageType.FORM_INPUT)
                .expectedInput(Arrays.asList("name", "birthDate", "residentNumber"))
                .build();
        }
        
        private ChatResponse generateHealthCertificateForm(HealthDocumentSession session) {
            // AI가 수집된 정보로 건강진단서 신청서 자동 작성
            HealthCertificateForm form = HealthCertificateForm.builder()
                .name(session.getBasicInfo().getName())
                .birthDate(session.getBasicInfo().getBirthDate())
                .residentNumber(session.getBasicInfo().getResidentNumber())
                .medicalHistory(session.getMedicalHistory())
                .currentSymptoms(session.getCurrentSymptoms())
                .preferredHospital(session.getPreferredHospital())
                .applicationDate(LocalDateTime.now())
                .build();
                
            String formPreview = generateFormPreview(form);
            
            return ChatResponse.builder()
                .message("✅ 건강진단서 신청서가 완성되었습니다!\n\n" + formPreview + 
                        "\n\n내용을 확인하시고 '제출'이라고 말씀해주세요. 수정이 필요하면 '수정'이라고 해주세요.")
                .type(ChatMessageType.FORM_PREVIEW)
                .attachments(Arrays.asList(generatePdfForm(form)))
                .build();
        }
    }
}
```

**2. 장기요양인정서 신청 자동화**
```java
@Component
public class LtciApplicationBot {
    
    public ChatResponse processLtciApplication(String userId, ChatMessage message) {
        LtciApplicationSession session = getOrCreateSession(userId, "ltci_application");
        
        switch (session.getCurrentStep()) {
            case "GREETING":
                return explainLtciProcess();
                
            case "CARE_ASSESSMENT":
                return conductCareAssessment(message);
                
            case "FAMILY_INFO":
                return collectFamilyInformation(message);
                
            case "PREFERRED_SERVICES":
                return askPreferredServices(message);
                
            case "DOCUMENT_PREPARATION":
                return prepareRequiredDocuments(session);
                
            case "FINAL_REVIEW":
                return submitLtciApplication(session);
        }
    }
    
    private ChatResponse explainLtciProcess() {
        return ChatResponse.builder()
            .message("🏥 장기요양인정 신청 절차를 안내해드리겠습니다.\n\n" +
                    "📝 필요한 단계:\n" +
                    "1️⃣ 건강 상태 평가 (5분)\n" +
                    "2️⃣ 가족 정보 입력 (3분)\n" +
                    "3️⃣ 희망 서비스 선택 (2분)\n" +
                    "4️⃣ 서류 자동 생성 및 제출\n\n" +
                    "총 소요시간: 약 10분\n\n" +
                    "시작하시려면 '시작'이라고 말씀해주세요!")
            .type(ChatMessageType.PROCESS_GUIDE)
            .quickReplies(Arrays.asList("시작", "더 자세한 설명"))
            .build();
    }
    
    private ChatResponse conductCareAssessment(ChatMessage message) {
        // 기존 건강 상태 체크리스트를 대화형으로 진행
        return HealthAssessmentChatbot.processCareAssessment(message);
    }
}
```

#### **B. 체크리스트 자동화 시스템**

**1. 대화형 건강 상태 체크리스트**
```java
@Component
public class InteractiveCareAssessment {
    
    public class CareAssessmentChatbot {
        
        public ChatResponse processCareAssessment(ChatMessage message) {
            AssessmentSession session = getOrCreateSession(message.getUserId(), "care_assessment");
            
            switch (session.getCurrentQuestion()) {
                case "MOBILITY":
                    return askMobilityLevel();
                    
                case "EATING":
                    return askEatingLevel(session);
                    
                case "TOILET":
                    return askToiletLevel(session);
                    
                case "COMMUNICATION":
                    return askCommunicationLevel(session);
                    
                case "LTCI_GRADE":
                    return askLtciGrade(session);
                    
                case "ASSESSMENT_COMPLETE":
                    return generateAssessmentResult(session);
            }
        }
        
        private ChatResponse askMobilityLevel() {
            return ChatResponse.builder()
                .message("🚶‍♂️ **걷기 활동 능력**에 대해 질문드리겠습니다.\n\n" +
                        "다음 중 어느 것이 가장 가까우신가요?\n\n" +
                        "1️⃣ 혼자서 걸을 수 있어요\n" +
                        "2️⃣ 지팡이나 부축이 필요해요\n" +
                        "3️⃣ 휠체어를 사용해요\n\n" +
                        "번호나 설명으로 답변해주세요.")
                .type(ChatMessageType.MULTIPLE_CHOICE)
                .quickReplies(Arrays.asList("1", "2", "3", "혼자서 가능", "부축 필요", "휠체어 사용"))
                .build();
        }
        
        private ChatResponse generateAssessmentResult(AssessmentSession session) {
            HealthAssessment assessment = calculateAssessment(session);
            
            String resultMessage = String.format(
                "✅ **건강 상태 평가 완료**\n\n" +
                "📊 **평가 결과:**\n" +
                "• ADL 점수: %d점\n" +
                "• 종합 케어 등급: %s\n" +
                "• 추천 시설 타입: %s\n\n" +
                "🎯 **매칭된 코디네이터:** %d명\n" +
                "🏥 **추천 요양시설:** %d곳\n\n" +
                "다음 단계로 진행하시겠습니까?",
                assessment.getAdlScore(),
                assessment.getOverallCareGrade(),
                getRecommendedFacilityTypes(assessment),
                getMatchedCoordinatorCount(assessment),
                getRecommendedFacilityCount(assessment)
            );
            
            return ChatResponse.builder()
                .message(resultMessage)
                .type(ChatMessageType.ASSESSMENT_RESULT)
                .quickReplies(Arrays.asList("코디네이터 매칭", "시설 둘러보기", "결과 저장"))
                .data(assessment)
                .build();
        }
    }
}
```

**2. 시설 견학 체크리스트 자동화**
```java
@Component
public class FacilityVisitChecklistBot {
    
    public ChatResponse processFacilityVisit(String userId, Long facilityId, ChatMessage message) {
        VisitSession session = getOrCreateSession(userId, facilityId);
        
        switch (session.getCurrentStep()) {
            case "PRE_VISIT":
                return providePreVisitGuidance();
                
            case "DURING_VISIT":
                return guideDuringVisit(message);
                
            case "POST_VISIT":
                return collectPostVisitFeedback(message);
                
            case "EVALUATION_COMPLETE":
                return generateVisitReport(session);
        }
    }
    
    private ChatResponse providePreVisitGuidance() {
        return ChatResponse.builder()
            .message("🏥 **시설 견학 준비가 완료되었습니다!**\n\n" +
                    "📋 **견학 시 확인할 항목들:**\n\n" +
                    "🔍 **시설 환경**\n" +
                    "• 청결도 및 냄새\n" +
                    "• 안전시설 (난간, 응급벨)\n" +
                    "• 공용공간 활용도\n\n" +
                    "👥 **직원 서비스**\n" +
                    "• 직원 친절도\n" +
                    "• 전문성 및 경험\n" +
                    "• 입주자와의 소통 방식\n\n" +
                    "💰 **비용 및 계약**\n" +
                    "• 월 이용료 및 추가 비용\n" +
                    "• 계약 조건 및 환불 정책\n\n" +
                    "견학을 시작하시면 '견학 시작'이라고 알려주세요!")
            .type(ChatMessageType.VISIT_GUIDE)
            .quickReplies(Arrays.asList("견학 시작", "체크리스트 받기", "질문 목록"))
            .build();
    }
    
    private ChatResponse guideDuringVisit(ChatMessage message) {
        if (message.getContent().contains("견학 시작")) {
            return startInteractiveChecklist();
        }
        
        // 음성/텍스트로 실시간 체크리스트 진행
        return processChecklistItem(message);
    }
    
    private ChatResponse startInteractiveChecklist() {
        return ChatResponse.builder()
            .message("📱 **실시간 견학 가이드를 시작합니다!**\n\n" +
                    "🎤 음성으로 답변하시거나 텍스트로 입력해주세요.\n\n" +
                    "**첫 번째 질문:**\n" +
                    "시설에 들어서자마자 느껴지는 첫인상은 어떠신가요?\n" +
                    "(청결도, 냄새, 분위기 등)")
            .type(ChatMessageType.VOICE_INPUT_ENABLED)
            .expectedInput(Arrays.asList("cleanliness", "smell", "atmosphere"))
            .build();
    }
}
```

#### **C. 일정 관리 및 예약 자동화**

**1. 병원 예약 자동화**
```java
@Component
public class HospitalBookingBot {
    
    public ChatResponse processHospitalBooking(String userId, ChatMessage message) {
        BookingSession session = getOrCreateSession(userId, "hospital_booking");
        
        switch (session.getCurrentStep()) {
            case "HOSPITAL_SELECTION":
                return recommendHospitals(session);
                
            case "APPOINTMENT_TYPE":
                return askAppointmentType(message);
                
            case "PREFERRED_TIME":
                return askPreferredTime(message);
                
            case "BOOKING_CONFIRMATION":
                return confirmAndBook(session);
        }
    }
    
    private ChatResponse recommendHospitals(BookingSession session) {
        // 건강 상태 기반 병원 추천
        List<Hospital> recommendedHospitals = hospitalRecommendationService
            .recommend(session.getHealthAssessment());
            
        String hospitalList = recommendedHospitals.stream()
            .map(hospital -> String.format(
                "🏥 **%s**\n" +
                "📍 %s\n" +
                "⭐ %s (%d개 리뷰)\n" +
                "🚗 거리: %s\n" +
                "💰 진료비: %s\n",
                hospital.getName(),
                hospital.getAddress(),
                hospital.getRating(),
                hospital.getReviewCount(),
                hospital.getDistance(),
                hospital.getEstimatedCost()
            ))
            .collect(Collectors.joining("\n"));
            
        return ChatResponse.builder()
            .message("🏥 **건강검진 가능한 병원을 추천해드립니다:**\n\n" + hospitalList +
                    "\n어느 병원에서 검진받으시겠어요?")
            .type(ChatMessageType.HOSPITAL_SELECTION)
            .quickReplies(recommendedHospitals.stream()
                .map(Hospital::getName)
                .collect(Collectors.toList()))
            .build();
    }
}
```

#### **D. 다국어 지원 및 음성 인식**

**1. 다국어 대화 시스템**
```java
@Component
public class MultilingualChatbot {
    
    public ChatResponse processMessage(ChatMessage message) {
        String detectedLanguage = languageDetectionService.detect(message.getContent());
        String userId = message.getUserId();
        
        // 사용자 언어 설정 저장
        userPreferenceService.setLanguage(userId, detectedLanguage);
        
        // 메시지를 한국어로 번역 (처리용)
        String translatedMessage = translationService.translate(message.getContent(), detectedLanguage, "ko");
        
        // 챗봇 로직 처리
        ChatResponse response = chatbotEngine.process(translatedMessage, userId);
        
        // 응답을 사용자 언어로 번역
        String localizedResponse = translationService.translate(response.getMessage(), "ko", detectedLanguage);
        response.setMessage(localizedResponse);
        
        return response;
    }
    
    @Service
    public class VoiceInteractionService {
        
        public ChatResponse processVoiceInput(String userId, AudioData audioData) {
            // 음성을 텍스트로 변환
            String recognizedText = speechToTextService.recognize(audioData);
            
            // 언어 감지 및 번역
            ChatMessage textMessage = ChatMessage.builder()
                .userId(userId)
                .content(recognizedText)
                .type(MessageType.VOICE)
                .build();
                
            ChatResponse response = processMessage(textMessage);
            
            // 응답을 음성으로 변환
            AudioData responseAudio = textToSpeechService.synthesize(
                response.getMessage(), 
                userPreferenceService.getLanguage(userId)
            );
            
            response.setAudioResponse(responseAudio);
            return response;
        }
    }
}
```

#### **E. 진행 상황 추적 및 알림**

**1. 프로세스 추적 시스템**
```java
@Entity
public class ChatbotProcessTracker {
    @Id
    private Long id;
    private String userId;
    private String processType;              // "health_certificate", "ltci_application"
    private String currentStep;
    private Integer totalSteps;
    private Integer completedSteps;
    private Double progressPercentage;
    
    // 수집된 데이터
    @Column(columnDefinition = "TEXT")
    private String collectedData;            // JSON 형태로 저장
    
    // 생성된 문서들
    @ElementCollection
    private List<String> generatedDocuments;
    
    // 다음 액션
    private String nextAction;
    private LocalDateTime nextActionDate;
    
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
}

@Service
public class ProcessNotificationService {
    
    public void sendProgressUpdate(String userId, String processType) {
        ChatbotProcessTracker tracker = processTrackerRepository
            .findByUserIdAndProcessType(userId, processType);
            
        String progressMessage = String.format(
            "📋 **%s 진행 상황**\n\n" +
            "✅ 완료: %d/%d 단계 (%.0f%%)\n" +
            "📝 현재 단계: %s\n" +
            "⏰ 다음 할일: %s\n" +
            "📅 예정일: %s",
            getProcessDisplayName(processType),
            tracker.getCompletedSteps(),
            tracker.getTotalSteps(),
            tracker.getProgressPercentage(),
            getCurrentStepName(tracker.getCurrentStep()),
            tracker.getNextAction(),
            tracker.getNextActionDate()
        );
        
        notificationService.sendChatbotMessage(userId, progressMessage);
    }
    
    @Scheduled(cron = "0 0 9 * * *") // 매일 오전 9시
    public void sendDailyReminders() {
        List<ChatbotProcessTracker> pendingProcesses = processTrackerRepository
            .findPendingProcesses();
            
        pendingProcesses.forEach(tracker -> {
            if (needsReminder(tracker)) {
                sendReminderMessage(tracker);
            }
        });
    }
}
```

#### **F. 챗봇 시스템 호환성 및 확장성 검토**

**1. 기존 시스템과의 API 호환성**
```yaml
호환 가능한 기존 API:
  - HealthAssessment API: 건강 상태 체크리스트 결과 연동
  - CoordinatorMatching API: 챗봇 → 매칭 시스템 자동 연계
  - FacilityRecommendation API: 시설 추천 결과 활용
  - DocumentGeneration API: 서류 자동 생성 연동

데이터 구조 호환성:
  - 기존 HealthAssessment 엔티티와 100% 호환
  - ChatbotProcessTracker가 기존 프로세스 추적과 연계
  - 생성된 문서는 기존 파일 관리 시스템 활용
```

**2. 확장 가능한 아키텍처**
```java
// 새로운 프로세스 추가 시 확장 예시
@Component
public class InsuranceApplicationBot extends BaseDocumentBot {
    
    @Override
    protected List<String> getRequiredSteps() {
        return Arrays.asList(
            "INSURANCE_TYPE_SELECTION",
            "BENEFICIARY_INFO", 
            "COVERAGE_SELECTION",
            "DOCUMENT_GENERATION"
        );
    }
    
    @Override
    protected String getProcessType() {
        return "insurance_application";
    }
}

// 다국어 확장
@Component
public class LanguageExpansionService {
    
    public void addNewLanguage(String languageCode, Map<String, String> translations) {
        // 새로운 언어 동적 추가 지원
        translationService.addLanguageSupport(languageCode, translations);
        voiceService.addTTSSupport(languageCode);
    }
}
```

**3. 외부 시스템 연동 확장성**
```yaml
확장 가능한 연동:
  - 외교부 API: 재외국민 정보 자동 조회
  - 보건복지부 API: 장기요양보험 신청 자동 제출
  - 국민건강보험공단 API: 건강보험 정보 연동
  - 전자정부 API: 각종 민원 서류 자동 제출

모듈화된 확장:
  - 새로운 서류 타입 플러그인 방식 추가
  - 새로운 체크리스트 템플릿 동적 로딩
  - 새로운 언어팩 런타임 추가
  - 새로운 음성 엔진 연동
```

**4. 성능 및 확장성 고려사항**
```yaml
성능 최적화:
  - 세션 관리: Redis 기반 분산 세션 지원
  - 병렬 처리: 다중 사용자 동시 대화 지원
  - 캐싱: 자주 사용되는 템플릿 메모리 캐시
  - 로드밸런싱: 다중 챗봇 인스턴스 지원

모니터링:
  - 대화 성공률 추적
  - 프로세스 완료율 모니터링
  - 사용자 만족도 수집
  - 시스템 응답 시간 측정
```

---

## 🤝 코디네이터 원스톱 서비스 (핵심 비즈니스 모델)

### 서비스 개요

코디네이터는 **해외 재외동포**를 대상으로 **입국 절차부터 요양원 입주까지** 전 과정을 원스톱으로 지원하는 전문 서비스입니다.

### 4단계 원스톱 서비스 프로세스

#### **1단계: 입국 전 준비 지원 (Pre-Arrival)**
```yaml
서비스 기간: 1-2개월
주요 업무:
  - 🛂 비자 상담 및 서류 준비 지원 (방문동반비자, 관광비자 등)
  - ✈️ 항공편 예약 및 교통편 안내
  - 🏨 임시 숙소 예약 (단기 렌탈, 게스트하우스)
  - 📋 사전 상담 (화상통화로 가족 상황, 요구사항 파악)
  - 💰 예산 계획 수립 (요양원 비용, 생활비, 서비스 비용)
  - 📱 한국 생활 필수 정보 제공 (통신, 교통, 의료 등)
```

#### **2단계: 입국 및 정착 지원 (Arrival & Settlement)**  
```yaml
서비스 기간: 1-2주
주요 업무:
  - 🚗 공항 픽업 서비스 (인천공항 → 임시 숙소)
  - 🏪 생활 필수 업무 동행 지원:
    * 은행 계좌 개설 (외국인 전용 계좌)
    * 휴대폰 개통 (선불/후불 요금제 선택)
    * 건강보험 가입 절차 (국민건강보험, 외국인 보험)
    * 교통카드 발급 (T-money, Wowpass)
  - 🛍️ 생활용품 구매 동행 (마트, 약국, 생필품)
  - 🗣️ 언어 장벽 해결 (실시간 통번역 지원)
  - 📍 주변 환경 안내 (병원, 약국, 마트, 관공서 위치)
```

#### **3단계: 요양원 매칭 및 선택 지원 (Care Facility Matching)**
```yaml
서비스 기간: 2-4주  
주요 업무:
  - 🏥 부모님 건강상태 종합 평가:
    * 전문의 건강검진 동행
    * 요양등급 신청 도움 (장기요양보험)
    * 의료진 소견 번역 및 설명
  - 🎯 맞춤형 요양원 추천:
    * 건강상태/예산/위치 기반 매칭
    * AI 매칭 시스템 활용 (거리, 비용, 평점, 특화서비스)
    * 3-5개 후보 요양원 선별
  - 👀 요양원 견학 및 상담 동행:
    * 시설 투어 가이드 (각 시설 특징 설명)
    * 원장/간호사와 상담 통역
    * 계약서 및 이용약관 검토
    * 비용 산정 및 협상 대행
  - 📄 입주 준비 및 행정 지원:
    * 입주 서류 작성 도움
    * 입주 준비물 리스트 제공
    * 입주일 조정 및 이사 준비
```

#### **4단계: 사후 관리 및 지속 지원 (Ongoing Support)**
```yaml
서비스 기간: 계약에 따라 (6개월~2년)
주요 업무:
  - 📅 정기 방문 및 모니터링:
    * 월 2-4회 요양원 방문
    * 부모님 건강상태 및 만족도 체크
    * 요양원과의 소통 및 개선사항 논의
  - 👨‍👩‍👧‍👦 가족 소통 지원:
    * 정기 화상통화 주선 (해외 가족과 부모님)
    * 건강상태 리포트 번역 및 전달
    * 응급상황 시 즉시 연락 및 대응
  - 🏥 의료 연계 서비스:
    * 병원 진료 동행 (응급실, 외래진료)
    * 의료진과의 소통 및 통역
    * 처방전 및 치료계획 설명
  - 🎉 특별 행사 지원:
    * 생일, 명절 등 기념일 챙김
    * 가족 방문 시 공항 픽업 및 안내
    * 문화 체험 프로그램 기획
```

### 코디네이터 전문 분야 및 자격 요건

#### **전문 분야별 코디네이터**
```yaml
의료 전문 코디네이터:
  - 간호사, 사회복지사, 요양보호사 자격 보유
  - 의료진과의 전문적 소통 능력
  - 치매, 뇌졸중 등 특정 질환 전문성

법무/행정 전문 코디네이터:  
  - 행정사, 법무사 등 자격 보유
  - 비자, 보험, 행정절차 전문 지식
  - 외국인 관련 법령 숙지

언어 전문 코디네이터:
  - 다국어 구사 능력 (영어, 중국어, 일본어)
  - 번역/통역 자격증 보유
  - 문화적 차이 이해 및 중재 능력

심리 상담 전문 코디네이터:
  - 심리상담사, 사회복지사 자격
  - 가족 갈등 중재 및 심리적 지원
  - 치매 환자 및 가족 상담 전문성
```

### 수익 모델 및 서비스 요금

#### **서비스 패키지별 요금**
```yaml
기본 패키지 (Essential):
  - 기간: 3개월 (입국~입주 완료)
  - 서비스: 1-3단계 포함
  - 요금: 300-500만원
  - 대상: 기본적인 지원만 필요한 경우

프리미엄 패키지 (Premium):
  - 기간: 6개월 (입국~사후관리 6개월)
  - 서비스: 전 단계 포함 + 집중 사후관리
  - 요금: 800-1200만원  
  - 대상: 전문적 케어가 필요한 경우

VIP 패키지 (Concierge):
  - 기간: 1-2년 (장기 사후관리)
  - 서비스: 맞춤형 프리미엄 서비스
  - 요금: 1500-3000만원
  - 대상: 고소득층, 복잡한 상황 케이스
```

### 부가 서비스 (추가 수익원)

#### **전문 상담 서비스**
```yaml
법무 상담:
  - 상속, 재산 관리, 세무 문제
  - 해외 거주자 특화 법적 이슈
  - 시간당 10-20만원

금융 상담:  
  - 해외 송금, 환전, 투자 상담
  - 보험 가입 및 클레임 처리
  - 건별 50-200만원

의료 코디네이션:
  - 전문의 소개 및 예약 대행
  - 건강검진 패키지 기획
  - 건별 30-100만원

부동산 서비스:
  - 임시 거주지 임대차 계약
  - 장기 거주 시 부동산 투자 상담
  - 중개수수료 수익 분배
```

#### **기업 및 기관 연계 서비스**
```yaml
보험회사 연계:
  - 외국인 전용 보험 상품 판매
  - 보험금 청구 대행 서비스
  - 수수료 수익

항공사/여행사 연계:
  - 항공권 예약 대행
  - 가족 방문 시 여행 패키지
  - 수수료 수익

의료기관 연계:
  - 건강검진 패키지 기획
  - 의료관광 서비스 연계
  - 수수료 수익

요양원 연계:
  - 요양원 입주 중개 수수료
  - 시설 개선 컨설팅
  - 매칭 성공 수수료
```

### 코디네이터 품질 관리 시스템

#### **고객 만족도 관리**
```yaml
실시간 피드백 시스템:
  - 서비스 단계별 만족도 조사
  - 모바일 앱을 통한 즉시 피드백
  - 불만 사항 즉시 대응 체계

정기 평가 시스템:
  - 월별 서비스 품질 평가
  - 고객 추천도 조사 (NPS)
  - 코디네이터 성과 평가

개선 시스템:
  - 고객 의견 반영 프로세스
  - 서비스 표준화 및 매뉴얼 업데이트
  - 코디네이터 교육 및 트레이닝
```

### 🔑 실제 공공데이터 API 활용 (발급받은 인증키 기반)

#### **발급받은 API 목록 및 활용 방안**
```yaml
인증키: CCXHQiSSQ0J+RRaadSjmmS7ltxG/tlSVOYMjh45MmGne68ptgGAaAJVJti8nBazSjLemTAyb5gAuj43xq7fTog==
활용기간: 2025-07-16 ~ 2027-07-18

🏥 국민건강보험공단_장기요양기관 검색 서비스:
  활용단계: "3단계 - 요양원 매칭"
  기능: 맞춤형 요양원 추천 (지역/예산/특성별)
  URL: https://apis.data.go.kr/B550928/searchLtcInsttService01

📋 국민건강보험공단_장기요양기관 시설별 상세조회 서비스:
  활용단계: "3단계 - 요양원 상세 정보"
  기능: 시설 규모, 서비스, 요금 상세 조회
  URL: https://apis.data.go.kr/B550928/getLtcInsttDetailInfoService02

⚕️ 건강보험심사평가원_병원정보서비스:
  활용단계: "2단계 - 건강검진", "4단계 - 의료 연계"
  기능: 건강검진 병원 추천, 응급 의료진 연결
  URL: https://apis.data.go.kr/B551182/hospInfoServicev2

💊 국립중앙의료원_전국 약국 정보 조회 서비스:
  활용단계: "2단계 - 생활 정착", "4단계 - 의료 지원"
  기능: 처방전 처리 가능 약국 안내
  URL: https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService

🔍 건강보험심사평가원_요양기관개폐업정보조회서비스:
  활용단계: "3단계 - 신뢰성 검증"
  기능: 요양기관 운영 상태 실시간 확인
  URL: https://apis.data.go.kr/B551182/yadmOpCloInfoService2

🛂 외교부_국가·지역별 입국허가요건:
  활용단계: "1단계 - 입국 전 준비"
  기능: 국가별 비자 요건, 필수 서류 안내
  URL: https://apis.data.go.kr/1262000/EntranceVisaService2
```

#### **단계별 API 연동 활용**

**1단계: 입국 전 준비**
```java
// 외교부 API 활용 - 국가별 입국 요건 조회
public KoreaEntryRequirementResponse getKoreaEntryRequirements(String overseasCountry) {
    // 재외동포 거주국 → 한국 입국 요건 자동 조회
    // 비자 종류, 필수 서류, 체류 기간 정보 제공
    // 대사관/영사관 연락처 자동 매칭
}

// 코디네이터 서비스: 맞춤형 입국 가이드 생성
public PreArrivalGuideResponse createPreArrivalGuide(String country, String purpose) {
    KoreaEntryRequirementResponse requirements = mofaApiService.getKoreaEntryRequirements(country);
    return buildCustomizedGuide(requirements, purpose);
}
```

**2단계: 입국 및 정착 + 건강검진**
```java
// 병원 정보 API 활용 - 건강검진 병원 추천
public List<HospitalInfo> findHealthCheckupHospitals(String region, String language) {
    // 지역 기반 병원 검색
    List<HospitalInfo> hospitals = hospitalApiService.getHospitalsByLocation(sido, sigungu);
    
    // 재외동포 친화적 병원 필터링 (다국어 지원, 국제진료센터 보유)
    return hospitals.stream()
        .filter(h -> h.hasInternationalCenter())
        .filter(h -> h.supportsLanguage(language))
        .collect(Collectors.toList());
}

// 약국 정보 API 활용 - 생활권 내 약국 안내
public List<PharmacyInfo> findNearbyPharmacies(String address) {
    // 임시 거주지 주변 약국 검색
    // 24시간 운영, 다국어 처방전 처리 가능 약국 우선 추천
    return pharmacyApiService.getPharmaciesByLocation(sido, sigungu)
        .stream()
        .sorted(Comparator.comparing(PharmacyInfo::getDistance))
        .collect(Collectors.toList());
}
```

**3단계: 요양원 매칭 (핵심 기능)**
```java
// 장기요양기관 검색 API 활용 - 재외동포 맞춤 추천
public OverseasKoreanNursingFacilityResponse searchForOverseasKoreans(
    OverseasKoreanNursingSearchRequest request) {
    
    // 1. 기본 검색 (지역, 유형별)
    NursingFacilitySearchResponse basicResults = nursingSearchApiService
        .searchNursingFacilities(request.getSidoName(), request.getSigunguName());
    
    // 2. 재외동포 친화성 점수 계산
    List<EnhancedFacilityInfo> enhanced = basicResults.getFacilities().stream()
        .map(facility -> {
            // 공항 접근성, 다국어 지원, 의료진 수준 등 평가
            int score = calculateOverseasFriendlyScore(facility, request);
            
            // 신뢰성 검증 (개폐업 정보 API 활용)
            FacilityReliabilityResponse reliability = facilityStatusApiService
                .validateFacilityReliability(facility.getFacilityCode());
            
            return EnhancedFacilityInfo.builder()
                .basicInfo(facility)
                .overseasFriendlyScore(score)
                .reliabilityInfo(reliability)
                .build();
        })
        .filter(f -> f.getReliabilityInfo().getRiskLevel() != RiskLevel.HIGH)
        .sorted(Comparator.comparing(EnhancedFacilityInfo::getOverseasFriendlyScore).reversed())
        .collect(Collectors.toList());
    
    // 3. 상세 정보 조회 (상위 10개 시설)
    List<CompleteNursingFacilityInfo> completeFacilities = enhanced.stream()
        .limit(10)
        .map(facility -> {
            NursingFacilityDetailResponse detail = nursingDetailApiService
                .getNursingFacilityDetail(facility.getFacilityCode());
            
            return CompleteNursingFacilityInfo.builder()
                .enhancedInfo(facility)
                .detailInfo(detail)
                .countrySpecificAdvice(generateAdvice(request.getOverseasCountry()))
                .build();
        })
        .collect(Collectors.toList());
    
    return OverseasKoreanNursingFacilityResponse.builder()
        .facilities(completeFacilities)
        .totalCount(enhanced.size())
        .searchCriteria(request)
        .build();
}

// 신뢰성 점수 계산 (개폐업 정보 기반)
private int calculateReliabilityScore(FacilityStatusResponse status) {
    int score = 50; // 기본 점수
    
    // 운영 상태별 점수
    switch (status.getBusinessStatus()) {
        case "정상", "운영중": score += 40; break;
        case "휴업": score += 10; break;
        case "폐업", "말소": score = 0; break;
    }
    
    // 운영 기간별 추가 점수 (신뢰성 지표)
    if (status.getOpeningDate() != null) {
        long years = ChronoUnit.YEARS.between(status.getOpeningDate(), LocalDate.now());
        score += Math.min(years * 2, 10);
    }
    
    return Math.min(score, 100);
}
```

**4단계: 사후 관리**
```java
// 통합 의료 네트워크 서비스
public MedicalNetworkResponse buildMedicalNetwork(String facilityCode, String region) {
    // 요양원 정보
    NursingFacilityDetailResponse facility = nursingDetailApiService
        .getNursingFacilityDetail(facilityCode);
    
    // 주변 병원 네트워크
    List<HospitalInfo> nearbyHospitals = hospitalApiService
        .getHospitalsByLocation(region);
    
    // 주변 약국 네트워크  
    List<PharmacyInfo> nearbyPharmacies = pharmacyApiService
        .getPharmaciesByLocation(region);
    
    return MedicalNetworkResponse.builder()
        .centerFacility(facility)
        .partnerHospitals(nearbyHospitals)
        .nearbyPharmacies(nearbyPharmacies)
        .emergencyContacts(buildEmergencyContacts(region))
        .build();
}
```

#### **기술적 우위 및 차별화 요소**
```yaml
✅ 실제 정부 데이터 기반:
  - 가짜 정보 없는 신뢰할 수 있는 데이터
  - 실시간 업데이트되는 운영 상태
  - 정부 인증 시설만 추천

✅ AI 기반 맞춤형 매칭:
  - 재외동포별 특성 고려한 추천 알고리즘
  - 국가별/언어별/문화적 차이 반영
  - 신뢰성 점수 기반 필터링

✅ 원스톱 의료 생태계:
  - 요양원 + 병원 + 약국 통합 정보
  - 응급상황 대응 네트워크 구축
  - 의료진 간 소통 지원

✅ 실시간 신뢰성 검증:
  - 개폐업 상태 자동 확인
  - 위험 시설 사전 필터링
  - 지속적인 모니터링 시스템
```

---

## 📋 API 문서화 전략

### OpenAPI 3.0 기반 문서화

**API 문서화 도구 스택:**
```yaml
OpenAPI Spec: 3.0.3 (최신 버전)
문서 UI: Swagger UI + Redoc (다중 뷰)
코드 생성: OpenAPI Generator
문서 호스팅: GitHub Pages (자동 배포)
API 테스트: Postman + Newman (자동화)
```

### API 문서화 구조

#### 1. OpenAPI 설정 (api-module)
```yaml
# api-module/src/main/resources/application.yml
springdoc:
  api-docs:
    enabled: true
    path: /api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operationsSorter: method
    tagsSorter: alpha
  group-configs:
    - group: 'member-api'
      paths-to-match: '/api/members/**'
    - group: 'facility-api'  
      paths-to-match: '/api/facilities/**'
    - group: 'job-api'
      paths-to-match: '/api/jobs/**'
```

#### 2. API 그룹별 문서화
- **회원 API** (`/api/members/**`)
  - 회원가입, 로그인, 프로필 관리
  - 권한 관리, 탈퇴 처리
  
- **시설 API** (`/api/facilities/**`)
  - 시설 검색, 상세 조회, 등록/수정
  - 지도 연동, 이미지 업로드
  
- **구인구직 API** (`/api/jobs/**`)
  - 구인/구직 공고 CRUD
  - 지원/매칭 관리
  
- **리뷰 API** (`/api/reviews/**`)
  - 리뷰 작성/수정/삭제
  - 평점 집계, 추천 시스템

#### 3. 코드 레벨 문서화
```java
@RestController
@RequestMapping("/api/members")
@Tag(name = "회원 관리", description = "회원 가입, 로그인, 프로필 관리 API")
public class MemberController {

    @Operation(
        summary = "회원 가입",
        description = "새로운 회원을 등록합니다. 이메일 중복 체크를 포함합니다.",
        responses = {
            @ApiResponse(responseCode = "201", description = "회원 가입 성공"),
            @ApiResponse(responseCode = "409", description = "이메일 중복")
        }
    )
    @PostMapping("/register")
    public ResponseEntity<MemberResponse> register(
        @RequestBody @Valid 
        @Schema(description = "회원 가입 요청 정보")
        MemberRegisterRequest request
    ) {
        // 구현 로직
    }
}
```

### API 버저닝 전략

**URL 기반 버저닝:**
```
/api/v1/members/**  (현재 버전)
/api/v2/members/**  (향후 버전)
```

**헤더 기반 버저닝 (선택사항):**
```
Accept: application/vnd.globalcarelink.v1+json
Accept: application/vnd.globalcarelink.v2+json
```

---

## 💰 **자본금 0원 개발 전략**

### **완전 무료 기술 스택 활용**

#### **데이터베이스 & 저장소**
```yaml
개발/운영:
  - SQLite (무제한 무료, 파일 기반)
  - GitHub Repository (파일 저장소, 무료 CDN)
  - 메모리 캐시 (Caffeine, Redis 대신)
  
장점:
  - 설정 간단, 별도 서버 불필요
  - 백업 = 파일 복사
  - 동시 접속 1000명까지 충분
```

#### **무료 배포 서비스**
```yaml
백엔드 배포 옵션:
  1. Railway (월 500시간 무료, 추천)
  2. Render.com (무료 플랜)
  3. fly.io (무료 플랜)
  4. Oracle Cloud Always Free (평생 무료)

프론트엔드 배포:
  1. GitHub Pages (무제한 무료, CDN 포함)
  2. Netlify (월 100GB 무료)
  3. Vercel (무제한 무료)
```

#### **외부 서비스 무료 플랜**
```yaml
이메일: Gmail SMTP (일일 500통)
지도: OpenStreetMap + Leaflet.js (완전 무료)
      카카오맵 (월 30만건 무료)
인증: Google OAuth, 카카오 로그인 (무료)
이미지: 자체 처리 (Java BufferedImage)
SMS: 이메일 인증으로 대체 (비용 절약)
```

### **단계별 확장 계획**

#### **Phase 1: 완전 무료 MVP (0원)**
```yaml
사용자: 100명 이하
기술: SQLite + 메모리 캐시 + 무료 호스팅
비용: $0/월
```

#### **Phase 2: 부분 유료 ($10-20/월)**  
```yaml
조건: 사용자 500명 이상, 수익 발생 시작
업그레이드: PostgreSQL, 안정적 VPS
비용: $10-20/월
```

#### **Phase 3: 본격 확장 ($100+/월)**
```yaml
조건: 월 수익 $500 이상  
업그레이드: Redis, CDN, 전문 모니터링
비용: $100+/월
```

### **개발 우선순위 (무료 중심)**

#### **즉시 개발 (자본금 0원)**
1. SQLite 기반 로컬 개발
2. 핵심 CRUD 기능 구현
3. OpenStreetMap 지도 연동
4. Gmail 이메일 발송
5. GitHub Pages 배포

#### **수익 발생 후 업그레이드**  
1. PostgreSQL 전환
2. Redis 캐시 도입
3. 구글맵 API 추가
4. 전문 호스팅 서비스
5. SMS 알림 서비스
