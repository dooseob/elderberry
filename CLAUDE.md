# CLAUDE.md

이 문서는 이 저장소에서 Claude Code (claude.ai/code)가 코드를 다룰 때 참고할 가이드입니다.

---

## 📌 프로젝트 개요

**글로벌 요양원 구인구직 웹사이트 "엘더베리(Elderberry)"**
- 재외동포 대상 글로벌 요양 서비스
- JDK 21 + Spring Boot 3.3.5 기반 신규 프로젝트
- 자본금 0원 개발 전략 (무료 서비스 활용)
- AI 100% 의존 개발 (Claude AI 주도)

---

## 🛡️ 기본 개발 수칙

### 핵심 원칙
- **한국어 우선**: 모든 주석, 문서, 커밋 메시지는 한국어
- **AI 주도 개발**: Claude AI 100% 의존, 복잡한 로직도 AI 구현
- **무료 기술 스택**: 자본금 0원을 위한 오픈소스/무료 서비스 활용
- **토큰 효율성**: 개발 계획서 기반 단계별 진행

### 코딩 규칙
- **클래스명**: PascalCase (예: `MemberService`)
- **메서드명**: camelCase (예: `findMemberById`)
- **상수명**: UPPER_SNAKE_CASE (예: `JWT_SECRET_KEY`)
- **패키지명**: 소문자 (예: `com.globalcarelink.auth`)
- **주석**: 한국어 필수, 비즈니스 로직 설명

### 커밋 메시지 규칙
- **한국어 + 이모지**: `✅ 완료`, `🔧 수정`, `🐛 버그수정`, `🎯 기능추가`
- **형식**: `[이모지] 간단한 제목\n\n상세 설명`
- **자동 커밋**: 작업 완료 시 자동으로 커밋

### 기술 스택 제한
- **데이터베이스**: H2 메모리 DB (개발), SQLite (운영)
- **캐시**: Caffeine (Redis 대신)
- **인증**: JWT + Spring Security 6.x
- **테스트**: JUnit 5 + MockMvc
- **UI**: React 18 + TypeScript + Tailwind CSS

---

## 🚨 중대한 이슈들 (반드시 준수)

### 데이터베이스 관련
- **H2 파일 DB**: 개발 환경에서 파일 기반 사용, 데이터 영속성 보장
- **update 설정**: 스키마 변경 시에만 테이블 구조 업데이트
- **data/ 디렉토리**: H2 DB 파일 저장 위치 (.gitignore 제외됨)
- **테스트 환경**: 메모리 모드로 빠른 테스트 (create-drop)

### 역할 시스템 (중요!)
- **새 역할명**: `USER_DOMESTIC`, `USER_OVERSEAS`, `JOB_SEEKER_DOMESTIC`, `JOB_SEEKER_OVERSEAS`
- **구 역할명 금지**: `DOMESTIC_USER`, `OVERSEAS_USER` 절대 사용 금지
- **is_job_seeker 플래그**: 구직자 여부는 별도 Boolean 필드

### API 인증
- **JWT 필수**: `/api/auth/login`, `/api/auth/register` 외 모든 API
- **H2 콘솔**: `/h2-console` 경로로 DB 확인 가능
- **CORS**: `localhost:5173`, `localhost:3000` 허용

### 캐시 & 성능
- **Caffeine 캐시**: Redis 대신 메모리 기반 캐시 사용
- **@Async**: 시간 걸리는 작업은 비동기 처리 필수
- **N+1 방지**: `@EntityGraph` 활용

---

## 📋 개발 계획 시스템

### 전체 계획 참조
- **메인 계획**: `docs/DEVELOPMENT_PLAN.md` 
- **Phase별 세부계획**: `docs/phases/phase-*.md`
- **현재 진행상황**: `docs/phases/phase-overview.md`

### 현재 진행 Phase
**Phase 5-C: React 시설 검색 UI** (진행 중)
- 시설 검색 및 필터링 UI 컴포넌트
- 시설 상세 정보 표시 컴포넌트
- 맞춤형 추천 결과 UI
- 사용자 행동 추적 (조회, 연락, 방문) UI
- 매칭 완료 및 피드백 UI

### 완료된 Phase
- ✅ **Phase 1**: Spring Boot 3.3.5 + Security + H2 파일 DB
- ✅ **Phase 2**: 5역할 회원시스템 + 국내/해외 구분
- ✅ **Phase 3**: 건강 상태 평가 (HealthAssessment + React UI)
- ✅ **Phase 4**: 코디네이터 매칭 시스템 (AI 매칭 + 프론트엔드)
- ✅ **Phase 5-A**: 시설 프로필 관리 시스템 (등급, 타입, 매칭 로직)
- ✅ **Phase 5-B**: 시설 매칭 및 추천 시스템 고도화 (AI 기반 분석, 이력 추적)

---

## 🔧 개발 환경

### 서버 정보
- **백엔드**: `http://localhost:8080` (Spring Boot)
- **프론트엔드**: `http://localhost:5173` (Vite React)
- **H2 콘솔**: `http://localhost:8080/h2-console`
- **API 문서**: `http://localhost:8080/swagger-ui.html`

### 개발 명령어
```bash
# 백엔드 실행
./gradlew bootRun

# 프론트엔드 실행  
cd frontend && npm run dev

# 테스트 실행
./gradlew test

# 빌드
./gradlew build
```

### 환경설정
- **프로필**: `spring.profiles.active=dev`
- **DB URL**: `jdbc:h2:file:./data/elderberry` (파일 기반)
- **JWT**: 개발용 시크릿 키 사용
- **로그레벨**: DEBUG (개발환경)
- **데이터 영속성**: 재시작해도 데이터 유지됨

---

## 📊 작업 완료 후 자동 처리

### 자동 커밋 시스템
1. **작업 완료**: Phase 또는 기능 완성
2. **자동 스테이징**: `git add .`
3. **커밋 메시지 생성**: 한국어 + 이모지 + 상세 설명
4. **자동 커밋**: `git commit -m "메시지"`
5. **CLAUDE.md 업데이트**: 현재 진행 상황 반영

### 커밋 메시지 템플릿
```
✅ [Phase X-Y] 기능명 완성

🎯 주요 구현 내용:
- 구현 항목 1
- 구현 항목 2  
- 구현 항목 3

🔧 기술적 세부사항:
- 사용 기술/라이브러리
- 주요 클래스/메서드
- 설정/구성 변경사항

📝 다음 단계: Phase X-Z 또는 다음 기능
```

---

## 🎯 현재 할 일

### 즉시 진행할 작업
**Phase 5-C: React 시설 검색 UI 구현**
- 시설 검색 및 필터링 UI 컴포넌트 (`FacilitySearchPage.tsx`)
- 시설 목록 표시 컴포넌트 (`FacilityList.tsx`, `FacilityCard.tsx`)
- 시설 상세 정보 모달 (`FacilityDetailModal.tsx`)
- 맞춤형 추천 결과 UI (`RecommendationResults.tsx`)
- 사용자 행동 추적 버튼들 (연락, 방문 등)
- 매칭 완료 및 피드백 폼 (`MatchingCompletionForm.tsx`)
- Zustand 상태 관리 (`facilityStore.ts`)

### 참고할 세부계획
- `docs/phases/phase-5.md`: Phase 5 전체 계획
- `frontend/src/features/health/`: 건강 평가 UI 구조 참고
- `frontend/src/stores/`: 기존 상태 관리 패턴 참고

### 성공 조건
- 시설 검색 및 필터링 기능 완성
- 시설 상세 정보 표시 및 사용자 행동 추적
- 맞춤형 추천 시스템 UI 완성
- 반응형 디자인 및 접근성 고려
- 통합 테스트 통과

---

**⚡ 작업 시작 시 이 문서의 규칙을 준수하고, 완료 후 자동으로 커밋하며 이 문서를 업데이트하세요!**