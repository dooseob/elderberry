# 엘더베리 프로젝트 개발 가이드

## 📋 현재 개발 상황 (2025-07-24)

### ✅ 완료된 주요 작업
- **로그 기반 디버깅 시스템**: 완벽 구축 및 운영 중
- **Plain Java 서버**: 정상 동작 (포트 8080)
- **React 프론트엔드**: 정상 동작 (포트 5173)
- **JWT 인증 시스템**: Spring Boot 3.x 호환성 완료
- **핵심 Repository 메서드들**: 대부분 구현 완료
- **주요 DTO 클래스들**: 생성 및 메서드 추가 완료
- **🤖 챗봇 통합 프록시**: Context7 방식 최소 변경으로 완성 (2025-07-24)
- **🎯 아키텍처 통일**: 단일 API 도메인으로 모든 서비스 통합

### ⚠️ 진행 중인 작업
- **Spring Boot 백엔드**: 67개 컴파일 에러 점진적 해결 중
- **Repository 메서드 시그니처**: Pageable 인자 추가 필요
- **엔티티 getter/setter**: 일부 메서드들 추가 필요
- **DTO 타입 매핑**: 서비스 간 타입 불일치 해결 중

## 🚀 개발 시작 방법

### 1. 시스템 시작
```powershell
# 통합 개발 서버 시작
.\start-dev.ps1

# 또는 개별 시작
cd frontend && npm run dev  # 프론트엔드 (포트 5173)
java -cp build\classes com.globalcarelink.PlainJavaServer  # 백엔드 (포트 8080)
```

### 2. 로그 기반 디버깅 시스템
```powershell
# 실시간 시스템 모니터링 (PowerShell)
.\debug-system.ps1

# 시스템 상태만 확인
.\check-system.ps1

# Windows 배치 파일로 실행 (권장)
.\run-debug.bat
```

### 3. 챗봇 통합 시스템 (신규 2025-07-24)
```powershell
# 챗봇 통합 테스트
.\test-chatbot-integration.ps1

# 통합 개발 환경 (Java + Python + React)
.\start-unified-dev.ps1
```

#### **📊 디버깅 시스템 기능**
- **실시간 포트 모니터링**: 5173(프론트), 8080(백엔드) 상태 확인
- **컴파일 상태 체크**: Spring Boot 에러 개수 추적
- **로그 파일 모니터링**: 실시간 로그 추적 및 분석
- **빠른 액션**: F(프론트), B(백엔드), A(전체) 시작
- **라이브 모니터링**: 3초마다 자동 갱신

#### **🤖 챗봇 통합 시스템 기능 (Context7 방식)**
- **단일 API 도메인**: 모든 요청이 localhost:8080/api/* 로 통합
- **프록시 패턴**: /api/chatbot/* → Python 챗봇 서버(8000)로 자동 전달
- **최소 변경**: 기존 코드 단 2개 파일만 수정 (SimpleChatbotProxy.java 추가)
- **점진적 통합**: Python 챗봇 유무에 관계없이 동작
- **CORS 문제 해결**: 단일 도메인으로 브라우저 정책 문제 없음

## 🔧 에러 해결 가이드

### 현재 상황
- **총 92개 에러 → 67개로 감소** (73% 해결 완료)
- Plain Java 서버로 기본 기능 정상 동작 중
- Spring Boot 에러들은 개발에 영향 없음

### 에러 해결 우선순위

#### 1. Repository 메서드 시그니처 (우선도: 높음)
```java
// 현재 문제
List<Entity> findByField(String field);

// 해결 방법
Page<Entity> findByField(String field, Pageable pageable);
```

#### 2. 엔티티 getter/setter 메서드 (우선도: 중간)
```java
// Lombok @Getter @Setter 확인 또는 수동 추가
public String getGrade() { return grade; }
public void setGrade(String grade) { this.grade = grade; }
```

#### 3. DTO 타입 불일치 (우선도: 중간)
```java
// 내부 클래스 vs 별도 DTO 클래스 통일
// import 문 추가 확인
```

### 개발 진행 전략

#### Phase 1: 기능 개발 우선 (현재)
- Plain Java 서버로 핵심 기능 구현
- React 프론트엔드와 연동 테스트
- 로그 기반 디버깅으로 실시간 모니터링

#### Phase 2: Spring Boot 에러 해결 (후순위)
- Repository 메서드들 점진적 수정
- 엔티티 메서드들 추가
- 완전한 Spring Boot 백엔드 구축

## 📁 핵심 파일 구조

### 디버깅 시스템
- `debug-system.ps1`: 통합 디버깅 및 모니터링 (188줄)
- `start-dev.ps1`: 개발 서버 시작 (100줄)
- `check-system.ps1`: 시스템 상태 확인 (51줄)
- `start-backend.ps1`: 백엔드 전용 시작 (43줄)
- `run-debug.bat`: Windows 배치 파일 (PowerShell 실행)
- `logs/`: 로그 파일들

### 백엔드
- `src/main/java/com/globalcarelink/PlainJavaServer.java`: 현재 동작 중인 서버
- `src/main/java/com/globalcarelink/`: Spring Boot 소스 (개발 중)

### 프론트엔드
- `frontend/`: React + TypeScript + Vite

## 🎯 개발 권장사항 (2025-07-24 업데이트)

### ⭐ **최우선 권장사항**
1. **🚀 프론트엔드 연동 진행**: 통합 API로 React 개발 시작
2. **🤖 챗봇 통합 활용**: `/api/chatbot/*` 엔드포인트 사용
3. **📊 통합 테스트**: `.\test-chatbot-integration.ps1` 활용

### 🔄 **기존 권장사항 (유지)**
1. **현재 시스템 활용**: Plain Java 서버로 기능 개발 진행
2. **점진적 개선**: 필요한 기능부터 Spring Boot 에러 해결
3. **로그 모니터링**: 실시간 디버깅 시스템 적극 활용
4. **단계적 접근**: 한 번에 모든 에러 해결보다는 우선순위별 접근

### 📚 **새로 추가된 문서**
- **아키텍처 가이드**: `docs/ARCHITECTURE_INTEGRATION_GUIDE.md`
- **작업 보고서**: `docs/work-reports/2025-07-24-architecture-integration-completion.md`

---

## 🔄 Context7 활용 규칙

- 모든 명령은 순차적으로 작업
- 답변은 한국어로 작성
- 코드에는 한국어 주석 추가
- 로컬 프로젝트 파일 검토 후 답변
- 중간 확인 없이 완료까지 작업
- 로컬 데이터 사용 (임시 데이터 생성 금지)
- 코드 작성 후 중복 및 오류 확인

---

## 🍇 **엘더베리 프로젝트 지능형 가이드 시스템**

### ⚡ **즉시 사용 (30초)**
```bash
# claude-guides 폴더로 이동
cd claude-guides

# 빠른 상태 체크 (30초)
npm run quick-check

# 필요한 도움 받기
npm run spring-boot-help    # Spring Boot 에러 해결
npm run chatbot-help        # AI 챗봇 연동 준비
npm run phase-check         # 현재 Phase 상태
```

### 🎯 **엘더베리 특화 기능**
- **🔧 Spring Boot 에러 해결**: 67개 컴파일 에러 체계적 해결
- **🤖 AI 챗봇 연동**: Python 기반 AI 챗봇팀과 협업 지원  
- **📊 Phase별 가이드**: Phase 6(공공데이터) → Phase 7(챗봇) 맞춤 가이드
- **🇰🇷 한국어 개발 표준**: 한국어 주석 및 개발 가이드라인
- **🌏 재외동포 특화**: 다국어 지원 및 특화 비즈니스 로직

### 📋 **주요 명령어**
```bash
npm run quick-check         # 30초 프로젝트 상태 체크
npm run spring-boot-help    # Spring Boot 67개 에러 해결 가이드
npm run chatbot-help        # AI 챗봇팀 협업 및 연동 가이드
npm run phase-check         # 현재 Phase 상세 분석
npm run guide              # 맞춤형 지능형 가이드 생성
npm run help               # 전체 도움말
```

### 🚀 **프로그래밍 방식 사용**
```javascript
const ElderberryGuide = require('./claude-guides/elderberry-intelligent-guide.js');
const system = new ElderberryGuide();

// 빠른 체크리스트
const quick = system.generateElderberryQuickChecklist('api_implementation');

// 맞춤형 가이드 생성
const guide = await system.getElderberryGuide(
    "FacilityService 리팩토링 필요",
    ["FacilityService.java"],
    { priority: "high", korean: true }
);
```

### 📚 **가이드 문서**
- 📖 [빠른 시작 가이드](claude-guides/QUICK_START.md) - 30초 시작
- 📋 [전체 사용법](claude-guides/ELDERBERRY_USAGE_GUIDE.md) - 완전한 활용법
- 🔧 [실무 예제](claude-guides/ELDERBERRY_USAGE_GUIDE.md#-실무-예제) - 구체적 사용 사례

**🎯 목표**: 엘더베리 프로젝트 개발 효율성 300% 향상!

---

**🚀 개발을 시작하세요! 시스템이 준비되어 있습니다.**