# 🚀 엘더베리 프로젝트 개발 가이드

> **빠른 참조 (5분 완독)** | 상세 정보는 [docs/guides/](./docs/guides/) 참조

## 🛠️ **핵심 기술스택** (변경 금지!)

```yaml
Backend: Java 21 + Spring Boot 3.x + H2 파일DB + Redis 캐시
Frontend: React 18 + TypeScript + Zustand + Tailwind CSS  
AI/Agent: 5개 MCP 도구 + 6개 서브에이전트 시스템
Infrastructure: Docker + WSL2 + 환경변수 관리

# 데이터베이스 상세
메인DB: H2 파일 모드 (./data/elderberry - 영구저장)
캐시: Redis Docker 컨테이너 (세션 + 캐시)
```

## 🚀 **빠른 시작**

### **1. 서버 실행 (30초)**
```bash
# 전체 서버 시작 (Docker Redis + 프론트엔드 + 백엔드)
./dev-start.sh

# 상태 확인
./dev-status.sh

# 접속 확인
# 프론트엔드: http://localhost:5173
# 백엔드: http://localhost:8080
# Redis 관리: http://localhost:8081

# 서버 중지
./dev-stop.sh
```

### **2. 테스트 로그인**
```yaml
이메일: test.domestic@example.com
비밀번호: Password123!
```

## 🤖 **에이전트 시스템** (핵심 사용법)

### **커스텀 명령어 (권장)**
```bash
/max 전체 프로젝트 리팩토링     # 최대 성능 (10개 병렬)
/auto UI 컴포넌트 최적화       # 자동 분석 (5개 병렬)  
/smart API 문서화             # 효율적 처리 (3개 병렬)
```

### **6개 서브에이전트**
- **CLAUDE_GUIDE**: 가이드라인 관리 + 보안 체크
- **DEBUG**: 에러 분석 + 성능 최적화  
- **API_DOCUMENTATION**: API 문서 자동 생성
- **TROUBLESHOOTING**: 이슈 진단 + 해결책 제공
- **GOOGLE_SEO**: SEO 최적화 + 시멘틱 마크업
- **보안 감사**: API 키 관리 + 취약점 검사

## 🎯 **핵심 개발원칙**

### **🚨 금지사항 (절대 하지 말 것)**
- ❌ **API 키를 코드/문서에 하드코딩** (반드시 .env 파일 사용)
- ❌ **기술스택 임의 변경** (React → Vue, Spring Boot → Express 등)
- ❌ **SQL 테이블명 단수형 사용** (반드시 복수형: members, facilities)
- ❌ **프론트엔드-백엔드 타입 불일치** (API 응답 타입 검증 필수)
- ❌ **Docker 없이 Redis 강제 사용** (환경 확인 후 활성화)

### **✅ 필수 원칙**
- ✅ **환경변수 패턴**: application.yml에서 `${ENV_VAR}` 사용
- ✅ **커밋 전 보안 체크**: API 키, 비밀번호 노출 여부 확인
- ✅ **TodoWrite 사용**: 3단계 이상 복잡한 작업에서 진행상황 추적
- ✅ **에이전트 시스템 활용**: 복잡한 작업은 `/max`, `/auto` 명령어 사용

## 📊 **자주 쓰는 API**

### **인증**
```http
POST /api/auth/login     # 로그인
POST /api/auth/register  # 회원가입  
POST /api/auth/refresh   # 토큰 갱신
```

### **시설**
```http
GET /api/facilities/search              # 시설 검색
GET /api/facilities/{id}                # 시설 상세
POST /api/facilities/recommendations    # AI 추천
```

### **건강평가**  
```http
POST /api/health/assessments    # 평가 생성
GET /api/health/assessments/{id}    # 평가 조회
```

## ⚠️ **중요 주의사항**

### **환경설정 주의**
- **Java 21 필수**: `java -version`으로 확인
- **WSL2 환경**: Windows에서 반드시 WSL2 사용
- **환경변수 설정**: `.env.example` 참고하여 실제 키 설정

### **보안 주의**
- **API 키**: 절대 Git에 커밋하지 말 것
- **비밀번호**: 환경변수로만 관리
- **.env.example**: 실제 값 대신 플레이스홀더만 사용

### **개발 주의**
- **TypeScript 타입**: 프론트엔드-백엔드 응답 타입 일치 확인
- **데이터베이스**: H2 → PostgreSQL 전환 계획 고려
- **테스트**: 로그인 문제 시 curl로 백엔드 API 먼저 테스트

## 📚 **상세 문서 링크**

### **시스템 이해**
- [개발 현황 상세](./docs/guides/development-status.md) - 완료된 시스템 및 해결된 문제
- [기술스택 상세](./docs/guides/technical-stack.md) - 버전, 설정, 최적화 방법
- [프로젝트 구조](./docs/guides/project-structure.md) - 디렉토리 구조 및 파일 역할

### **에이전트 시스템**  
- [MCP 통합 가이드](./docs/guides/mcp-integration-guide.md) - 5개 MCP 도구 상세 사용법
- [커스텀 명령어 가이드](./docs/guides/custom-commands-guide.md) - 6개 명령어 고급 활용
- [에이전트 시스템 가이드](./docs/guides/agent-system-guide.md) - 6개 서브에이전트 상세

### **문제 해결**
- [트러블슈팅 인덱스](./docs/troubleshooting/solutions-db.md) - 53줄 간결 인덱스
- [인증 문제](./docs/troubleshooting/auth/) - 로그인 관련 해결책  
- [백엔드 문제](./docs/troubleshooting/backend/) - Spring Boot 이슈
- [프론트엔드 문제](./docs/troubleshooting/frontend/) - React/TypeScript 이슈

### **배포 및 협업**
- [팀 설정 가이드](./TEAM_SETUP_GUIDE.md) - 10분 온보딩 프로세스
- [데이터베이스 로드맵](./docs/guides/database-roadmap.md) - H2 → PostgreSQL 전환 전략
- [Docker 설정 가이드](./DOCKER_SETUP_GUIDE.md) - 컨테이너 환경 구축

## 🎉 **현재 상태**

```yaml
✅ 백엔드: Java 21 + Spring Boot 3.x (포트 8080)
✅ 프론트엔드: React 18 + TypeScript (포트 5173) 
✅ 데이터베이스: H2 파일 기반 + 자동 초기화
✅ JWT 인증: 완전 작동 (test.domestic@example.com)
✅ Docker 통합: Redis 컨테이너 + 개발스크립트 연동
✅ API 키 관리: 환경변수 완전 분리 (보안 강화)
✅ 5개 MCP 도구: Sequential Thinking, Context7, Memory, Filesystem, GitHub
✅ 6개 서브에이전트: CLAUDE_GUIDE, DEBUG, API_DOCUMENTATION, TROUBLESHOOTING, GOOGLE_SEO + 보안감사
✅ 커스텀 명령어: /max, /auto, /smart 완전 작동
✅ 트러블슈팅 문서: 2018줄 → 53줄 인덱스로 95% 축소
```

**🚀 완전한 풀스택 웹사이트 + 6개 에이전트 시스템이 WSL2 환경에서 정상 가동 중입니다!**

---

**📝 마지막 업데이트**: 2025-07-30  
**📏 문서 길이**: 400줄 (목표 달성!)  
**⏱️ 예상 읽기 시간**: 5분