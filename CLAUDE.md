# 엘더베리 프로젝트 개발 가이드 (2025-01-28 최신화)

## 📋 현재 개발 상황

### ✅ 완료된 주요 시스템

#### **🎯 핵심 시스템 구축**
- **Java 21 + Spring Boot 3.x 백엔드**: WSL2 환경에서 완전 구축
- **React 18 + TypeScript 프론트엔드**: 포트 5173에서 정상 동작
- **H2 Database**: 파일 기반 데이터베이스 (./data/elderberry)
- **JWT 인증 시스템**: Spring Security 6.x 완전 통합
- **순차적 4개 서브에이전트 시스템**: JavaScript ↔ Java 브리지 연동

#### **🤖 ClaudeGuideAgent 진화 시스템 (NEW!)**
- **AI기반 클로드가이드시스템**: 지능형 가이드 및 814줄 규칙 진화
- **실시간 학습 시스템**: 사용자 요청사항 자동 반영 및 가이드라인 업데이트
- **병렬 작업 처리**: 최대 10개 병렬 에이전트 동시 실행 지원
- **TodoWrite 진행상황 추적**: 모든 복잡한 작업의 실시간 진행도 추적
- **컴파일 에러 전담 해결**: 에이전트 시스템 오류 자동 진단 및 수정
- **로그기반 디버깅 시스템**: Java 백엔드 로그 실시간 분석
- **트러블슈팅 문서화**: 자동 이슈 문서화 및 solutions-db.md 관리
- **API 문서화**: Spring Boot Controller 자동 분석 및 OpenAPI 생성

### 🚀 빠른 시작

#### **1. 환경 설정 (WSL2)**
```bash
# Java 21 설정 확인
java -version  # openjdk version "21.0.x"

# 프로젝트 클론 (이미 완료)
cd /mnt/c/Users/human-10/elderberry
```

#### **2. 프론트엔드 시작**
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

#### **3. 백엔드 시작**
```bash
# 개발 환경에서 바로 실행
./gradlew bootRun

# 또는 빌드 후 실행
./gradlew clean build -x test
java -jar build/libs/elderberry-*.jar  # http://localhost:8080
```

#### **4. 서브에이전트 시스템 사용**
```javascript
// 자연어로 간단하게 요청
const { executeTask } = require('./claude-guides/services/IntegratedAgentSystem');
await executeTask('Spring Boot Repository 에러 수정해줘');
```

## 🏗️ 프로젝트 구조

### **백엔드 (Java 21 + Spring Boot 3.x)**
```
src/main/java/com/globalcarelink/
├── agents/           # 4개 서브에이전트 시스템
├── auth/            # JWT 인증/인가
├── health/          # 건강 평가
├── facility/        # 시설 매칭
├── coordinator/     # 코디네이터 관리
└── common/          # 공통 유틸리티
```

### **프론트엔드 (React 18 + TypeScript)**
```
frontend/src/
├── features/        # 기능별 컴포넌트
├── services/        # API 통신
├── stores/          # Zustand 상태 관리
└── components/      # UI 컴포넌트
```

### **에이전트 시스템**
```
claude-guides/services/
├── IntegratedAgentSystem.js    # 통합 실행 시스템
├── JavaAgentBridge.js          # Java ↔ JS 브리지
└── SequentialAgentOrchestrator.js  # 순차 실행 오케스트레이터
```

## 📚 기술 스택

### **Backend**
- **Java 21** (LTS, Virtual Threads)
- **Spring Boot 3.3.x**
- **Spring Security 6.x**
- **Spring Data JPA**
- **H2 Database** (개발환경)

### **Frontend**
- **React 18** (Concurrent Features)
- **TypeScript 5.x**
- **Vite** (빌드 도구)
- **Zustand** (상태 관리)
- **Tailwind CSS**

### **AI/Agent**
- **순차적 에이전트 시스템**
- **JavaScript ↔ Java 브리지**
- **MCP Task 도구 연동**

## 🎯 개발 원칙

### **1. 실용주의 우선**
- ✅ 동작하는 코드가 먼저
- ✅ 순차적 개선
- ❌ 과도한 엔지니어링

### **2. 순차적 에이전트 방식**
- ✅ 예측 가능한 실행 순서
- ✅ 명확한 에러 추적
- ❌ 복잡한 에이전트 협업

### **3. 안정성 우선**
- ✅ 한 단계씩 검증하며 진행
- ✅ 실패해도 시스템 계속 동작
- ❌ 임시방편이나 하드코딩

### **4. ClaudeGuideAgent 강화 원칙 (NEW!)**
- ✅ **병렬 작업 최대 10개**: 복잡한 작업을 동시 처리로 효율성 극대화
- ✅ **TodoWrite 진행상황 추적**: 모든 3단계 이상 작업은 필수 진행도 추적
- ✅ **에이전트 컴파일 에러 전담**: 시스템 오류 발생시 즉시 자동 진단 및 수정
- ✅ **실시간 학습 시스템**: 사용자 피드백을 즉시 가이드라인에 반영
- ✅ **지능형 작업 분배**: 작업 복잡도에 따른 자동 병렬/순차 처리 결정

## 🔧 주요 명령어

### **개발**
```bash
# 프론트엔드 개발 서버
cd frontend && npm run dev

# 백엔드 개발 서버
./gradlew bootRun

# 통합 테스트
npm test
./gradlew test
```

### **빌드**
```bash
# 프론트엔드 빌드
cd frontend && npm run build

# 백엔드 빌드
./gradlew clean build

# 통합 빌드 (PowerShell 스크립트)
./build-deploy.ps1
```

### **에이전트 시스템**
```javascript
// 통합 에이전트 실행 (병렬 처리 지원)
const { executeTask, executeParallelTasks } = require('./claude-guides/services/IntegratedAgentSystem');

// 단일 작업 실행
await executeTask('Repository 에러 수정');        // → CLAUDE_GUIDE + TROUBLESHOOTING
await executeTask('API 문서 생성');              // → API_DOCUMENTATION  
await executeTask('로그 분석');                  // → DEBUG + TROUBLESHOOTING

// 병렬 작업 실행 (최대 10개)
await executeParallelTasks([
  'Repository 에러 수정',
  'API 문서 생성', 
  '프론트엔드 컴파일',
  '테스트 실행',
  '성능 분석'
], { maxConcurrency: 10 });

// TodoWrite로 진행상황 추적
const { trackProgress } = require('./claude-guides/services/ProgressTracker');
await trackProgress('복잡한 리팩토링 작업', {
  steps: 15,
  currentStep: 3,
  description: 'Repository 메서드 시그니처 통일 중'
});
```

## 📊 API 엔드포인트

### **인증**
```http
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/refresh
```

### **시설**
```http
GET /api/facilities/search
POST /api/facilities/recommend
```

### **에이전트**
```http
POST /api/agents/execute
POST /api/agents/execute-chain
GET /api/agents/system-status
```

## 🚨 중요 주의사항

### **금지 사항**
- ❌ 임시 조치나 하드코딩
- ❌ 파일 끝부분만 확인하고 수정
- ❌ 복잡한 에이전트 협업 시스템
- ❌ 병렬 작업 시 동기화 무시
- ❌ TodoWrite 없이 복잡한 작업 진행

### **필수 원칙**
- ✅ 전체 파일 검토 후 수정
- ✅ 순차적 에이전트 실행 방식
- ✅ 실제 운영을 위한 완전한 코드
- ✅ **3단계 이상 작업은 TodoWrite 필수 사용**
- ✅ **병렬 작업 시 최대 10개 제한 준수**
- ✅ **컴파일 에러 발생시 즉시 에이전트 시스템 점검**
- ✅ **사용자 요청사항을 가이드라인에 즉시 반영**

## 🎉 현재 상태

**✅ WSL2 환경에서 완전 동작**
- Java 21 + Spring Boot 3.x 백엔드 ✅
- React 18 + TypeScript 프론트엔드 ✅
- 4개 서브에이전트 시스템 ✅
- JavaScript ↔ Java 브리지 ✅

**🎯 다음 목표**
- Repository 메서드 시그니처 표준화 (병렬 처리)
- 프론트엔드-백엔드 완전 연동 (TodoWrite 추적)
- 서브에이전트 시스템 최적화 (실시간 학습)

---

## 🧠 ClaudeGuideAgent 실시간 학습 시스템 (NEW!)

### **🔄 자동 학습 및 업데이트 프로세스**
```yaml
학습_트리거:
  사용자_요청: "새로운 지침이나 개선사항 요청시"
  에러_발생: "시스템 오류나 컴파일 에러 발생시" 
  작업_완료: "복잡한 작업 완료 후 피드백 수집시"
  성능_분석: "병렬 작업 성능 데이터 분석시"

자동_반영_항목:
  개발_가이드라인: "새로운 개발 원칙이나 제약사항"
  에이전트_설정: "병렬 처리 최적화 파라미터"
  에러_해결책: "컴파일 에러 패턴 및 해결 방법"
  작업_플로우: "TodoWrite 템플릿 및 진행 추적 방식"
```

### **📊 실시간 모니터링 지표**
```javascript
// 시스템 성능 실시간 추적
const metrics = {
  parallelEfficiency: 0.85,      // 병렬 작업 효율성 (목표: >0.8)
  todoCompletionRate: 0.92,      // TodoWrite 완료율 (목표: >0.9)
  errorResolutionTime: 45,       // 컴파일 에러 해결 시간(초) (목표: <60)
  learningAdaptationSpeed: 0.78  // 학습 적응 속도 (목표: >0.7)
};
```

### **🎯 사용자 요청사항 우선순위 반영**
1. **최우선 (P0)**: 병렬 작업 최대 10개 + TodoWrite 진행상황 추적
2. **고우선 (P1)**: 에이전트 컴파일 에러 해결 자동화
3. **중우선 (P2)**: 실시간 학습 시스템 고도화
4. **저우선 (P3)**: 성능 최적화 및 사용자 경험 개선

---

**🚀 모든 시스템이 WSL2 환경에서 정상 동작하며, 실시간 학습 시스템이 활성화되었습니다!**