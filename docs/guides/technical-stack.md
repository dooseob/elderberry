# 📚 엘더베리 기술 스택 상세

> **참조**: 이 문서는 CLAUDE.md에서 분할된 기술스택 상세 정보입니다.
> **빠른 참조**: [CLAUDE.md](../../CLAUDE.md) | [개발 현황](./development-status.md) | [프로젝트 구조](./project-structure.md)

## Backend Stack

### **Java 21** (LTS, Virtual Threads)
- **버전**: OpenJDK 21.0.x
- **특징**: Virtual Threads로 고성능 동시성 처리
- **WSL2 환경**: 완전 호환 및 최적화
- **성능**: 기존 Java 17 대비 20% 향상

### **Spring Boot 3.3.x**
- **Spring Security 6.x**: JWT 기반 인증/인가
- **Spring Data JPA**: 엔티티 관리 및 쿼리 최적화
- **Spring Web**: RESTful API 서버
- **Spring Cache**: Redis 기반 캐싱
- **Spring Session**: Redis 세션 저장소

### **데이터베이스**
- **H2 Database** (개발환경)
  - 파일 기반: `./data/elderberry`
  - 웹 콘솔: http://localhost:8080/h2-console
  - SQL 호환 모드: MySQL
- **PostgreSQL** (프로덕션 예정)
  - 단계적 전환 계획 수립 완료
  - 프로파일 분리 전략 적용

### **캐싱 & 세션**
- **Redis 7-alpine**: 캐시 및 세션 저장
- **Docker 컨테이너**: 포트 6379
- **Redis Commander**: 웹 관리 도구 (포트 8081)
- **연결 풀**: Jedis 커넥션 풀 최적화

## Frontend Stack

### **React 18** (Concurrent Features)
- **Concurrent Rendering**: 사용자 경험 최적화
- **Suspense**: 로딩 상태 관리
- **Automatic Batching**: 성능 향상
- **startTransition**: 우선순위 기반 렌더링

### **TypeScript 5.x**
- **엄격한 타입 체크**: 컴파일 타임 오류 방지
- **인터페이스 정의**: API 응답 타입 안정성
- **제네릭 활용**: 재사용 가능한 컴포넌트
- **Utility Types**: 타입 변환 및 조작

### **개발 도구**
- **Vite**: 빠른 빌드 및 HMR
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript ESLint**: TS 전용 린팅

### **상태 관리 & UI**
- **Zustand**: 경량 상태 관리
- **Tailwind CSS**: 유틸리티 퍼스트 CSS
- **Headless UI**: 접근성 최적화 컴포넌트
- **React Hook Form**: 폼 상태 관리

## Infrastructure & DevOps

### **Docker 환경** ⭐ **NEW! (2025-07-30)**
- **Docker Desktop 28.3.2**: WSL2 완전 통합
- **Redis Container**: 
  ```yaml
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --requirepass elderberry123!
  ```
- **Redis Commander**: 
  ```yaml
  redis-commander:
    image: rediscommander/redis-commander:latest
    ports: ["8081:8081"]
    environment:
      REDIS_HOSTS: redis:redis:6379
  ```

### **개발 스크립트 자동화**
- **dev-start.sh**: 프론트엔드 + 백엔드 + Redis 동시 실행
- **dev-stop.sh**: 전체 서버 안전 종료
- **dev-status.sh**: 서버 상태 실시간 모니터링
- **Docker 통합**: Redis 컨테이너 자동 관리

### **환경변수 관리** 🔑
- **백엔드**: `/.env` 파일
- **프론트엔드**: `/frontend/.env` 파일
- **예제 파일**: `.env.example` (보안 플레이스홀더)
- **Spring Boot**: `${ENV_VAR}` 패턴 활용

## External APIs & Integration

### **카카오맵 API** 🗺️
- **REST API**: 장소 검색, 지오코딩
- **JavaScript API**: 지도 렌더링, 마커 표시
- **환경변수**: 
  - `KAKAO_REST_API_KEY`
  - `KAKAO_JAVASCRIPT_KEY`
- **보안**: .env 파일에서 안전하게 관리

### **공공데이터 API** 🏛️
- **국민건강보험공단**: 장기요양기관 평가 결과
- **외교부**: 국가별 입국허가요건
- **건강보험심사평가원**: 병원정보서비스
- **환경변수**:
  - `PUBLIC_DATA_API_KEY`
  - `PUBLIC_DATA_API_KEY_ENCODED`

## AI & Agent System

### **5개 MCP 도구 완전 통합** 🤖
1. **Sequential Thinking**: 복잡한 문제 단계별 해결
2. **Context7**: 최신 기술 문서 자동 조회
3. **Filesystem**: 프로젝트 구조 실시간 추적
4. **Memory**: 지속적 학습 및 패턴 축적
5. **GitHub**: 저장소 통합 관리

### **6개 특화 서브에이전트** 🧠
1. **CLAUDE_GUIDE**: 프로젝트 가이드라인 및 아키텍처 검토
2. **DEBUG**: 에러 분석 및 성능 최적화
3. **API_DOCUMENTATION**: API 분석 및 문서 생성
4. **TROUBLESHOOTING**: 이슈 진단 및 솔루션 추적
5. **GOOGLE_SEO**: SEO 최적화 및 시멘틱 마크업 ⭐
6. **DOCUMENT_MANAGEMENT**: 대용량 문서 자동 분할 및 요약 ⭐

### **커스텀 명령어 시스템** ⚡
- **6개 명령어**: `/max`, `/auto`, `/smart`, `/rapid`, `/deep`, `/sync`
- **병렬 처리**: 최대 10개 동시 작업
- **MCP 도구 자동 선택**: 작업 유형별 최적 도구 활용
- **진행상황 추적**: TodoWrite 기반 실시간 모니터링

## 성능 최적화

### **백엔드 최적화**
- **Connection Pool**: HikariCP 최적화
- **JPA Batch**: 배치 처리로 N+1 문제 해결
- **Redis Cache**: 자주 조회되는 데이터 캐싱
- **HTTP/2**: 네트워크 성능 향상

### **프론트엔드 최적화**
- **Code Splitting**: 동적 임포트로 번들 크기 최소화
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Lazy Loading**: 필요한 시점에 컴포넌트 로드
- **Image Optimization**: WebP 형식 및 압축

### **보안 최적화** 🔒
- **환경변수 분리**: 모든 민감 정보 .env 관리
- **CORS 설정**: 허용된 도메인만 접근
- **JWT 토큰**: 안전한 인증/인가
- **HTTPS 준비**: SSL/TLS 인증서 설정

## 모니터링 & 로깅

### **로깅 시스템**
- **Logback**: 구조화된 로그 출력
- **로그 레벨**: 환경별 차등 적용
- **파일 로테이션**: 크기/날짜 기반 분할
- **에러 추적**: 스택 트레이스 상세 기록

### **성능 모니터링**
- **Spring Actuator**: 헬스체크 및 메트릭
- **Database Monitoring**: 쿼리 성능 추적
- **Memory Profiling**: JVM 메모리 사용량 모니터링
- **Response Time**: API 응답 시간 측정

---

**📝 문서 최종 업데이트**: 2025-07-30
**🔧 기술스택 상태**: 모든 핵심 기술 검증 완료
**🎯 다음 단계**: 성능 최적화 및 모니터링 강화