# CLAUDE.md

이 문서는 LightCare 프로젝트에서 Claude Code가 코드를 다룰 때 참고할 가이드입니다.

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

### 프론트엔드  
- **React 18** + **TypeScript 5.x** + **Vite 5.x**
- **UI**: Tailwind CSS + Shadcn/ui
- **상태관리**: Zustand + TanStack Query

### 배포 & 도구
- **배포**: Railway/Render (무료) + GitHub Pages
- **CI/CD**: GitHub Actions
- **테스트**: JUnit 5 + MockMvc

---

## 🚀 현재 진행 단계: Phase 5

**목표**: 통합 테스트 및 성능 최적화 (예상 토큰: 20,000)

### Phase 1 완료 ✅
- [x] Spring Boot 3.3.5 + JDK 21 프로젝트 구조
- [x] SQLite 데이터베이스 + Hibernate 6.x 설정
- [x] JWT 기반 Spring Security 6.x 보안 시스템
- [x] 8개 도메인 패키지 구조 + 공통 인프라
- [x] CORS 설정 + 포괄적 예외 처리

### Phase 2 완료 ✅
- [x] Member 엔티티 (5가지 역할 지원)
- [x] MemberRole enum 정의
- [x] Repository 계층 (JPA 쿼리 메서드)
- [x] Service 계층 (보안 강화된 비즈니스 로직)
- [x] Controller 계층 (Auth/Member 분리)
- [x] DTO 클래스들 (Request/Response)
- [x] Production-level 유틸리티 (Security/Validation/Date)
- [x] AOP 기반 로깅 및 성능 모니터링 시스템
- [x] OpenAPI 문서화
- [x] DomesticProfile & OverseasProfile 엔티티
- [x] ProfileService & ProfileController
- [x] 다국어 지원 시스템 (i18n)

### Phase 3 완료 ✅
- [x] **3-A: 건강 상태 평가 시스템 (백엔드)**
  - [x] HealthAssessment 엔티티 (KB라이프생명 기준)
  - [x] CareGradeCalculator (우선순위 로직)
  - [x] CoordinatorLanguageSkill 시스템 (CEFR 기반)
  - [x] HealthAssessmentService + DTO + Controller
  - [x] 통계 및 특화 조회 API
- [x] **3-B: React 체크리스트 UI (프론트엔드)**
  - [x] React 18 + TypeScript + Vite 프로젝트
  - [x] Elderberry 테마 디자인 시스템
  - [x] 8단계 건강평가 마법사 컴포넌트
  - [x] Zustand 상태관리 + 로컬스토리지 연동
  - [x] 재사용 가능한 UI 컴포넌트들

### Phase 4 완료 ✅
- [x] **4-A: 코디네이터 매칭 시스템 (백엔드)**
  - [x] CoordinatorCareSettings 엔티티 (자기 설정 케어 등급)
  - [x] OptimizedCoordinatorMatchingService (AI 기반 다층 매칭)
  - [x] CoordinatorWorkloadOptimizer (업무량 최적화 분배)
  - [x] MatchingExplanationGenerator (지능형 설명 생성)
  - [x] CoordinatorMatchingController (매칭 API)
  - [x] 5점 만점 스코어링 시스템 (전문성 40% + 경력 25% + 만족도 20% + 위치 10% + 가용성 5%)
  - [x] 매칭 통계 및 시뮬레이션 API
- [x] **4-B: React 코디네이터 매칭 UI (프론트엔드)**
  - [x] CoordinatorMatchingWizard (메인 매칭 인터페이스)
  - [x] CoordinatorCard (프로필 카드 컴포넌트)
  - [x] MatchingPreferencePanel (설정 패널)
  - [x] MatchingStatsDashboard (통계 대시보드)
  - [x] coordinatorApi 서비스 계층
  - [x] TanStack Query 기반 데이터 페칭
  - [x] 반응형 디자인 및 애니메이션

### Phase 5 구현 대상 🚧
- [ ] 통합 테스트 스위트 구성
- [ ] API 엔드포인트 테스트 자동화
- [ ] 프론트엔드-백엔드 E2E 테스트
- [ ] 성능 최적화 및 캐싱 전략
- [ ] 보안 취약점 검사 및 강화
- [ ] 에러 처리 및 로깅 개선

### 핵심 명령어
```bash
# JDK 21 확인
java -version

# 백엔드 빌드 및 실행
./gradlew build
./gradlew bootRun

# 프론트엔드 실행 (별도 터미널)
cd frontend && npm install && npm run dev

# 통합 개발 서버
# 백엔드: http://localhost:8080
# 프론트엔드: http://localhost:5173
```

---

## 📋 개발 규칙

### 코드 작성
- **NEVER** 주석 추가 (요청시에만)
- Spring Boot 3.x 최신 패턴 사용
- 보안 모범 사례 준수
- 기존 컨벤션 따르기

### 개발 방법론
- **단계적 사고**: 복잡한 작업을 작은 단위로 분해
- **MCP 도구 활용**: context7, Sequential Thinking, githud, memorybank, filesystem
- **Context 활용**: 기존 코드 패턴과 구조 참고
- **점진적 구현**: 엔티티 → Repository → Service → Controller 순서
- **고품질 테스트**: 단순 테스트 지양, 완성도 높은 정밀한 테스트 코드 작성

### Git 워크플로우
- 작업 완료시마다 자동 커밋
- **커밋 메시지: 한국어로 작성** (예: `✨ 회원 인증 시스템 구현`)
- PR 기반 코드 리뷰

### 파일 구조
```
/
├── CLAUDE.md (현재 Phase만)
├── docs/
│   ├── phases/ (Phase별 상세 계획)
│   └── DEVELOPMENT_PLAN.md (전체 개요)
└── src/ (실제 코드)
```

---

## 🎯 다음 단계

1. **현재**: Phase 5 통합 테스트 및 성능 최적화
2. **대기**: 역할 체계 재정의 (사용자 vs 구직자 분리)
3. **향후**: Phase 6 배포 및 운영 환경 구축
4. **마지막**: 프로덕션 배포 및 모니터링

**상세 계획**: `docs/phases/` 디렉토리 참조

### 🚨 중요 이슈
- MemberRole enum 수정 필요 (USER_DOMESTIC, USER_OVERSEAS, JOB_SEEKER 분리)
- 매칭 알고리즘 성능 최적화 검토 필요
- 프로덕션 환경 보안 설정 강화 필요

### 🎉 Phase 4 완료 성과

**백엔드 (Phase 4-A)**
- AI 기반 5점 만점 매칭 알고리즘
- 업무량 최적화 분배 시스템
- 지능형 매칭 결과 설명 생성
- 실시간 통계 및 성과 모니터링

**프론트엔드 (Phase 4-B)**
- 직관적인 매칭 인터페이스
- 실시간 데이터 업데이트
- 반응형 디자인
- 애니메이션 기반 UX 개선