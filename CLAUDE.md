# CLAUDE.md

이 문서는 LightCare 프로젝트에서 Claude Code가 코드를 다룰 때 참고할 가이드입니다.

---

## 📌 프로젝트 개요

**글로벌 요양원 구인구직 웹사이트 "라이트케어(LightCare)"**
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

## 🚀 현재 진행 단계: Phase 1-B

**목표**: 보안 설정 (예상 토큰: 6,000)

### Phase 1-A 완료 ✅
- [x] Spring Boot 3.3.5 프로젝트 구조 생성
- [x] SQLite 데이터베이스 설정
- [x] 8개 도메인 패키지 구조
- [x] Gradle 빌드 설정 (JDK 21)
- [x] 공통 인프라 (BaseEntity, JpaConfig, GlobalExceptionHandler)

### Phase 1-B 구현 대상
- [ ] Spring Security 6.x 설정
- [ ] JWT 토큰 기반 인증
- [ ] CORS 설정
- [ ] 기본 예외 처리 확장

### 핵심 명령어
```bash
# JDK 21 확인
java -version

# 프로젝트 빌드
./gradlew build

# 개발 서버 실행
./gradlew bootRun
```

---

## 📋 개발 규칙

### 코드 작성
- **NEVER** 주석 추가 (요청시에만)
- Spring Boot 3.x 최신 패턴 사용
- 보안 모범 사례 준수
- 기존 컨벤션 따르기

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

1. **현재**: Phase 1-A 프로젝트 초기 설정
2. **완료 후**: GitHub 연결 및 자동 커밋 설정
3. **다음**: Phase 1-B 보안 설정

**상세 계획**: `docs/DEVELOPMENT_PLAN.md` 참조