# Elderberry Project - 아키텍처 개요

## 프로젝트 개요

**Elderberry**는 글로벌 실버케어 매칭 서비스로, 재외동포와 국내 거주자를 위한 요양원 추천, 건강평가, 구인구직, 코디네이터 서비스를 제공하는 종합 플랫폼입니다.

## 기술 스택

### Backend
- **Java 21** + **Spring Boot 3.x**
- **H2 Database** (파일 모드, ./data/elderberry)
- **Redis** (세션 및 캐시, Docker 컨테이너)
- **SQLite** (에이전트 로깅 전용, ./data/agent-logs.db)
- **JWT** 인증 + **Redis 블랙리스트**

### Frontend
- **React 18** + **TypeScript**
- **Feature-Sliced Design (FSD)** 아키텍처
- **Zustand** 상태 관리
- **Tailwind CSS** + **Linear Design System**
- **Vite** 빌드 도구

### Infrastructure
- **Docker** (개발환경 보조 서비스)
- **WSL2** (Windows 개발환경)
- **환경변수 관리** (.env 파일)

## 아키텍처 다이어그램

### 1. [Entity Relationship Diagram (ERD)](./elderberry-erd.md)
데이터베이스 구조와 엔티티 간의 관계를 보여줍니다.

**주요 엔티티**:
- **MEMBERS**: 통합 사용자 관리 (7가지 역할)
- **FACILITY_PROFILES**: 요양시설 정보 (80+ 필드)
- **HEALTH_ASSESSMENTS**: KB라이프생명 기반 건강 평가
- **JOBS** + **JOB_APPLICATIONS**: 완전한 구인구직 시스템
- **REVIEWS**: 다차원 평점 및 리뷰 시스템
- **BOARDS** + **POSTS** + **COMMENTS**: 계층형 게시판
- **COORDINATOR_***: AI 기반 코디네이터 매칭

### 2. [Class Diagram](./elderberry-class-diagram.md)
백엔드 Java 클래스와 프론트엔드 React 컴포넌트의 구조를 보여줍니다.

**주요 패턴**:
- **Domain-Driven Design (DDD)**
- **Repository Pattern** (Spring Data JPA)
- **MVC Pattern**
- **Feature-Sliced Design (FSD)**

## 시스템 아키텍처

### 전체 시스템 구조
```
┌─────────────────────────────────────────────────────────────┐
│                    클라이언트 (브라우저)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│              프론트엔드 (React + TypeScript)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  FSD 아키텍처 (Feature-Sliced Design)                   │ │
│  │  app → pages → widgets → features → entities → shared  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────▼───────────────────────────────────────┐
│               백엔드 (Spring Boot + Java 21)                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Controller → Service → Repository → Entity             │ │
│  │  ├─ JWT 인증 + Redis 블랙리스트                          │ │
│  │  ├─ 도메인별 서비스 (Auth, Facility, Health, Job...)    │ │
│  │  └─ JPA 기반 데이터 접근                                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ JPA/JDBC
┌─────────────────────▼───────────────────────────────────────┐
│                    데이터 레이어                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │  H2 Database    │ │     Redis       │ │     SQLite      │ │
│  │  (메인 데이터)    │ │  (캐시/세션)     │ │ (에이전트 로깅)  │ │
│  │  ./data/        │ │  Docker 컨테이너 │ │  ./data/        │ │
│  │  elderberry     │ │                 │ │  agent-logs.db  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 개발 환경 전략 (하이브리드 환경)
```
로컬 개발 (네이티브)         Docker 보조 서비스
┌─────────────────────┐    ┌─────────────────────┐
│  React 18 + Vite    │    │      Redis         │
│  (포트 5174)         │◄──►│  (캐시/세션 저장)   │
└─────────────────────┘    └─────────────────────┘
                                     
┌─────────────────────┐    ┌─────────────────────┐
│ Spring Boot + Java  │    │  Redis Commander   │
│  (포트 8080)         │◄──►│   (관리 GUI)       │
└─────────────────────┘    └─────────────────────┘
           │                         
           ▼                         
┌─────────────────────┐              
│    H2 Database      │              
│   (파일 모드)        │              
└─────────────────────┘              
```

## 주요 도메인 및 기능

### 1. 인증 시스템 (Auth Domain)
- **7가지 사용자 역할**: ADMIN, FACILITY, COORDINATOR, USER_DOMESTIC, USER_OVERSEAS, JOB_SEEKER_DOMESTIC, JOB_SEEKER_OVERSEAS
- **JWT 인증**: 토큰 기반 인증 + Redis 블랙리스트
- **권한 분리**: 역할 기반 접근 제어 (RBAC)

### 2. 시설 관리 (Facility Domain)
- **포괄적 시설 정보**: 80+ 필드의 상세한 요양시설 데이터
- **AI 추천 시스템**: 건강 상태 기반 맞춤형 시설 추천
- **공공데이터 연동**: 건강보험심사평가원 데이터 동기화
- **평가 시스템**: A-E 등급 및 점수 기반 평가

### 3. 건강 평가 (Health Domain)
- **KB라이프생명 기반**: 4가지 ADL(일상생활수행능력) 지표
  - 걷기 활동 능력 (mobility)
  - 식사 활동 능력 (eating)
  - 배변 활동 능력 (toilet)
  - 의사소통 능력 (communication)
- **자동 점수 계산**: ADL 점수 → 케어 등급 → 비용 추정
- **장기요양보험 연동**: 1-6등급 지원

### 4. 구인구직 (Jobs Domain)
- **완전한 채용 프로세스**: 지원 → 검토 → 면접 → 합격/불합격
- **다양한 직종**: 요양보호사, 간병인, 물리치료사, 사회복지사 등
- **면접 관리**: 대면/화상/전화 면접 지원
- **이력서 관리**: 파일 업로드 및 관리

### 5. 리뷰 시스템 (Review Domain)
- **다차원 평점**: 서비스품질, 시설환경, 직원친절도, 가격만족도, 접근성
- **사용자 참여**: 도움됨/안됨 투표 시스템
- **컨텐츠 관리**: 신고 시스템 + 관리자 응답
- **검증 시스템**: 실제 이용자 확인

### 6. 게시판 (Board Domain)
- **다양한 게시판**: 공지사항, Q&A, 자유게시판, 취업정보
- **계층형 댓글**: 대댓글 지원 (무제한 깊이)
- **관리 기능**: 공지글 고정, 숨김 처리, 신고 관리

### 7. 코디네이터 시스템 (Coordinator Domain)
- **개인화된 설정**: 케어 등급, 전문 분야, 근무 지역
- **다국어 지원**: 언어별 숙련도 관리
- **AI 매칭**: 알고리즘 기반 최적 코디네이터 배정
- **성과 관리**: 성공률, 고객만족도 추적

## FSD (Feature-Sliced Design) 아키텍처

### 레이어 구조 (의존성 방향: 상위 → 하위)
```
app      ← 애플리케이션 초기화 및 전역 설정
 ↓
pages    ← 애플리케이션 페이지 (라우트별)
 ↓
widgets  ← 독립적인 UI 위젯 (header, sidebar, footer)
 ↓
features ← 비즈니스 기능 모듈 (auth, facility, health, jobs)
 ↓
entities ← 비즈니스 엔티티 도메인 모델 (user, facility, health)
 ↓
shared   ← 재사용 가능한 공통 코드 (ui, api, hooks, lib)
```

### 세그먼트별 역할
- **ui/**: UI 컴포넌트
- **model/**: 비즈니스 로직 및 타입 정의
- **api/**: 외부 API 통신
- **lib/**: 유틸리티 함수

### Public API 패턴
모든 레이어에 index.ts 파일로 캡슐화하여 내부 구현을 은닉하고 안정적인 인터페이스를 제공합니다.

```typescript
// entities/user/index.ts
export type { User, CreateUserRequest } from './model/types';
export { isUserWithProfile } from './model/types';

// features/auth/index.ts
export { LoginForm } from './ui/LoginForm';
export { useAuth } from './model/hooks';
```

## 데이터베이스 설계

### 3-Tier 하이브리드 구성
1. **메인 DB**: H2 파일 모드 (./data/elderberry) - 영구 저장
2. **로그 DB**: SQLite (./data/agent-logs.db) - 에이전트 실행 로그
3. **캐시**: Redis Docker 컨테이너 - 세션 + 쿼리 결과 캐시

### 주요 설계 원칙
- **BaseEntity**: 모든 테이블에 created_at, updated_at 자동 관리
- **Soft Delete**: is_deleted, active 필드를 통한 논리적 삭제
- **정규화**: 다대다 관계를 별도 테이블로 분리
- **인덱스 최적화**: UK, FK를 통한 성능 최적화

### 주요 관계
- **Member 1:N Job** (고용주-구인공고)
- **Job 1:N JobApplication** (공고-지원서)
- **Member 1:N Review** (작성자-리뷰)
- **FacilityProfile 1:N Review** (시설-리뷰)
- **Review 1:N ReviewVote** (리뷰-투표)
- **Post 1:N Comment** (게시글-댓글)
- **Comment 1:N Comment** (댓글-대댓글, self-reference)

## 보안 및 성능

### 보안
- **JWT 토큰**: access token + refresh token
- **Redis 블랙리스트**: 로그아웃 시 토큰 무효화
- **역할 기반 접근 제어**: @PreAuthorize 애노테이션
- **입력 검증**: Bean Validation + 커스텀 검증
- **개인정보 보호**: 익명 리뷰, 이메일 검증

### 성능
- **Redis 캐시**: 세션, 쿼리 결과 캐시
- **JPA 최적화**: 지연 로딩, 배치 사이즈 설정
- **페이지네이션**: Spring Data JPA Pageable
- **프론트엔드 최적화**: React.lazy, 코드 분할
- **빌드 최적화**: Vite 번들러, Tree shaking

## 배포 및 운영

### 개발 환경
```bash
# 전체 서버 시작
./dev-start.sh

# 상태 확인
./dev-status.sh

# 서버 중지
./dev-stop.sh
```

### Docker 환경 (선택사항)
```bash
# Docker Compose로 전체 스택 실행
docker-compose -f docker-compose.dev.yml up -d

# 서비스 상태 확인
docker ps
```

### 접속 정보
- **프론트엔드**: http://localhost:5174
- **백엔드**: http://localhost:8080
- **Redis 관리**: http://localhost:8081

### 테스트 로그인
```
이메일: test.domestic@example.com
비밀번호: Password123!
```

## 확장성 및 유지보수성

### 모듈화 설계
- **도메인별 독립**: 각 도메인이 독립적으로 확장 가능
- **인터페이스 분리**: 의존성 역전 원칙 적용
- **테스트 용이성**: 단위 테스트, 통합 테스트 지원

### 다국가 지원
- **재외동포 특화**: USER_OVERSEAS, JOB_SEEKER_OVERSEAS 역할
- **다국어 지원**: 코디네이터 언어 스킬 관리
- **지역별 설정**: 근무 지역, 시설 위치 기반 매칭

### 미래 확장 계획
- **PostgreSQL 전환**: H2 → PostgreSQL (프로덕션)
- **마이크로서비스**: 도메인별 서비스 분리
- **AI/ML 강화**: 추천 알고리즘 고도화
- **모바일 앱**: React Native 기반 모바일 앱
- **국제화**: 다국가 서비스 확장

## 파일 구조

### 백엔드 구조
```
src/main/java/com/globalcarelink/
├── auth/                    # 인증 관련
├── facility/                # 시설 관리
├── health/                  # 건강 평가
├── job/                     # 구인구직
├── review/                  # 리뷰 시스템
├── board/                   # 게시판
├── coordinator/             # 코디네이터
├── common/                  # 공통 유틸리티
│   ├── entity/              # BaseEntity
│   ├── config/              # 설정 클래스
│   ├── exception/           # 예외 처리
│   └── util/                # 유틸리티
└── GlobalCareLinkApplication.java
```

### 프론트엔드 구조 (FSD)
```
frontend/src/
├── app/                     # 앱 초기화
├── pages/                   # 페이지 컴포넌트
├── widgets/                 # UI 위젯
│   ├── header/
│   ├── sidebar/
│   ├── footer/
│   └── layout/
├── features/                # 기능 모듈
│   ├── auth/
│   ├── facility/
│   ├── health/
│   ├── jobs/
│   └── dashboard/
├── entities/                # 도메인 모델
│   ├── user/
│   ├── facility/
│   ├── health/
│   └── notification/
└── shared/                  # 공통 코드
    ├── ui/                  # UI 컴포넌트
    ├── api/                 # API 클라이언트
    ├── hooks/               # 커스텀 훅
    └── lib/                 # 유틸리티
```

## 결론

Elderberry 프로젝트는 현대적인 웹 기술과 검증된 아키텍처 패턴을 활용하여 구축된 종합 실버케어 플랫폼입니다. 

**핵심 강점**:
- **재외동포 특화**: 글로벌 사용자를 위한 맞춤형 기능
- **포괄적 서비스**: 건강평가부터 시설매칭, 구인구직까지 원스톱
- **확장 가능한 아키텍처**: FSD + DDD 패턴으로 유지보수성 확보
- **성능 최적화**: 하이브리드 개발환경으로 개발 효율성 극대화
- **AI 기반 매칭**: 개인화된 추천 시스템

이 아키텍처는 현재 요구사항을 충족하면서도 미래 확장에 대비한 유연한 구조를 제공합니다.