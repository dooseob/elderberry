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

## 🔧 개발 가이드라인

### 코드 스타일
- **Java**: Google Java Style Guide
- **TypeScript**: Prettier + ESLint
- **커밋 메시지**: Conventional Commits

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

---

## 🏁 프로젝트 현황

**전체 진행률: 90% 완료**

- ✅ 백엔드 시스템 (100%)
- ✅ 프론트엔드 UI (100%)
- ✅ 건강 평가 시스템 (100%)
- ✅ 매칭 알고리즘 (100%)
- ✅ 테스트 환경 (100%)
- ✅ 성능 최적화 (100%)
- ✅ 보안 강화 (100%)
- 🔄 배포 준비 (0%)

**남은 작업**: Phase 6 배포 환경 구성 및 최종 검증

---

*최종 업데이트: 2024년 12월*