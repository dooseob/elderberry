# 🤖 Elderberry 통합 서브에이전트 시스템 v2.0

WSL2 환경에서 실제 동작하는 4개의 특화된 서브에이전트를 기존 오케스트레이터 시스템과 완전히 통합한 시스템입니다.

## 📋 시스템 개요

### 🎯 구성된 특화 서브에이전트

| 에이전트 | 기능 | 연동 시스템 |
|---------|------|------------|
| 🧠 **AI기반 클로드가이드시스템** | 지능형 가이드, 컨텍스트 분석, 패턴 인식 | ClaudeGuideIntegration.js |
| 📊 **로그기반 디버깅 시스템** | Java 백엔드 로그 분석, 자동 진단, 성능 모니터링 | Spring Boot 로그 파일 |
| 📝 **트러블슈팅 문서화 시스템** | 자동 이슈 문서화, solutions-db.md 관리 | TroubleshootingService.java |
| 📚 **API 문서화 시스템** | Spring Boot Controller 분석, OpenAPI 생성 | Controller 클래스 |

### 🔗 통합 지원 시스템

- **SubAgentOrchestrator.js** (워크플로우 기반)
- **SequentialAgentOrchestrator.js** (순차 실행 기반)
- **Java TroubleshootingService.java** (백엔드 연동)
- **MCP Task 도구** (완전 연동)

## 🚀 빠른 시작

### 1. 기본 사용법

```javascript
const { executeTask } = require('./claude-guides/services/IntegratedAgentSystem');

// 간단한 작업 실행
const result = await executeTask('Spring Boot Repository 에러 수정');

console.log(result.success ? '✅ 성공' : '❌ 실패');
```

### 2. 특정 모드로 실행

```javascript
const { executeWithMode } = require('./claude-guides/services/IntegratedAgentSystem');

// 순차 실행 모드
const result1 = await executeWithMode('로그 파일 분석', 'sequential');

// 워크플로우 모드
const result2 = await executeWithMode('API 문서화', 'workflow');
```

### 3. 전체 시스템 분석

```javascript
const { performFullSystemAnalysis } = require('./claude-guides/services/IntegratedAgentSystem');

const analysis = await performFullSystemAnalysis();
console.log(`완료된 작업: ${analysis.completedTasks}/${analysis.totalTasks}`);
```

## 📚 상세 사용 가이드

### 🎯 작업 유형 자동 감지

시스템이 자동으로 작업 유형을 분석하여 최적의 에이전트 조합을 선택합니다:

| 키워드 | 감지되는 작업 유형 | 실행되는 에이전트 |
|--------|------------------|------------------|
| "repository 에러" | code-fix | intelligent_guide → analyzer → troubleshooting_doc |
| "로그 분석" | log-analysis | log_debugger → troubleshooting_doc |
| "API 문서화" | api-analysis | intelligent_guide → api_documenter |
| "전체 분석" | full-analysis | 모든 에이전트 |

### 🔧 각 에이전트별 기능

#### 🧠 AI기반 클로드가이드시스템

```javascript
// 직접 사용
const { intelligentGuideAgent } = require('./claude-guides/services/IntelligentGuideAgent');

const guide = await intelligentGuideAgent.executeWithMCPIntegration({
    query: 'Spring Boot Repository 패턴 개선 방법',
    context: { projectPath: process.cwd() }
});
```

**주요 기능:**
- 프로젝트 컨텍스트 분석
- 코딩 패턴 인식 및 추천
- 베스트 프랙티스 가이드
- 코드 예제 자동 생성

#### 📊 로그기반 디버깅 시스템

```javascript
// 직접 사용
const { logBasedDebuggingAgent } = require('./claude-guides/services/LogBasedDebuggingAgent');

const analysis = await logBasedDebuggingAgent.executeWithMCPIntegration({
    action: 'analyze',
    logFilePath: '/path/to/application.log'
});
```

**주요 기능:**
- Spring Boot 로그 파일 자동 분석
- 에러 패턴 인식 및 분류
- 성능 이슈 감지
- 실시간 로그 모니터링

#### 📝 트러블슈팅 문서화 시스템

```javascript
// 직접 사용
const { troubleshootingDocumentationAgent } = require('./claude-guides/services/TroubleshootingDocumentationAgent');

const doc = await troubleshootingDocumentationAgent.executeWithMCPIntegration({
    action: 'document',
    data: {
        eventId: 'ERROR_001',
        description: 'NullPointerException in AuthController'
    }
});
```

**주요 기능:**
- solutions-db.md 자동 분석
- 이슈 패턴 인식 및 분류
- 자동 문서화 생성
- Java TroubleshootingService와 연동

#### 📚 API 문서화 시스템

```javascript
// 직접 사용
const { apiDocumentationAgent } = require('./claude-guides/services/ApiDocumentationAgent');

const apiDoc = await apiDocumentationAgent.executeWithMCPIntegration({
    action: 'analyze_project',
    projectPath: process.cwd()
});
```

**주요 기능:**
- Spring Boot Controller 자동 분석
- OpenAPI 3.0 스펙 생성
- API 테스트 케이스 추천
- 보안 분석 및 권장사항

## 🛠️ 고급 사용법

### 1. 커스텀 워크플로우 생성

```javascript
const { subAgentOrchestrator } = require('./claude-guides/services/SubAgentOrchestrator');

const customTask = {
    type: 'custom-analysis',
    description: '커스텀 분석 작업',
    files: ['src/main/java/com/example/Controller.java'],
    options: { detailed: true }
};

const result = await subAgentOrchestrator.startWorkflow(customTask);
```

### 2. 순차 에이전트 직접 제어

```javascript
const { orchestrator } = require('./frontend/claude-guides/services/SequentialAgentOrchestrator');

const agents = ['intelligent_guide', 'log_debugger', 'api_documenter'];
const result = await orchestrator.executeSequential('상세 시스템 분석', agents);
```

### 3. 실행 모드 동적 변경

```javascript
const { integratedAgentSystem } = require('./claude-guides/services/IntegratedAgentSystem');

// 실행 모드 변경
integratedAgentSystem.setMode('workflow');

// 작업 실행
const result = await integratedAgentSystem.execute('복잡한 시스템 분석');

// 모드 되돌리기
integratedAgentSystem.setMode('sequential');
```

## 📊 모니터링 및 분석

### 시스템 상태 확인

```javascript
const { integratedAgentSystem } = require('./claude-guides/services/IntegratedAgentSystem');

const status = integratedAgentSystem.getSystemStatus();
console.log('활성 모드:', status.activeMode);
console.log('총 실행 횟수:', status.executionHistory);
console.log('특화 에이전트:', Object.keys(status.specializedAgents));
```

### 성능 통계

```javascript
const stats = integratedAgentSystem.getAgentPerformanceStats();
console.log('평균 실행 시간:', stats.averageExecutionTime + 'ms');
console.log('성공률:', stats.successRate + '%');
console.log('에이전트 사용 통계:', stats.agentUsage);
```

### 최근 실행 이력

```javascript
const recent = integratedAgentSystem.getRecentExecutions(5);
recent.forEach(exec => {
    console.log(`${exec.timestamp}: ${exec.taskDescription} (${exec.success ? '성공' : '실패'})`);
});
```

## 🧪 테스트 및 검증

### 통합 시스템 테스트

```javascript
const { testIntegratedSystem } = require('./claude-guides/services/IntegratedAgentSystem');

// 전체 시스템 테스트 실행
await testIntegratedSystem();
```

### 개별 에이전트 테스트

```javascript
// 각 에이전트별 테스트 함수
const { testIntelligentGuideAgent } = require('./claude-guides/services/IntelligentGuideAgent');
const { testLogBasedDebuggingAgent } = require('./claude-guides/services/LogBasedDebuggingAgent');
const { testTroubleshootingDocumentationAgent } = require('./claude-guides/services/TroubleshootingDocumentationAgent');
const { testApiDocumentationAgent } = require('./claude-guides/services/ApiDocumentationAgent');

await testIntelligentGuideAgent();
await testLogBasedDebuggingAgent();
await testTroubleshootingDocumentationAgent();
await testApiDocumentationAgent();
```

## 🔧 설정 및 커스터마이징

### 환경 변수 설정

```bash
# 프로젝트 루트 경로
export ELDERBERRY_PROJECT_PATH="/mnt/c/Users/human-10/elderberry"

# 로그 파일 경로
export ELDERBERRY_LOG_PATH="/mnt/c/Users/human-10/elderberry/logs"

# 문서 출력 경로
export ELDERBERRY_DOCS_PATH="/mnt/c/Users/human-10/elderberry/docs"
```

### 에이전트별 설정

```javascript
// IntelligentGuideAgent 설정
const guideAgent = require('./claude-guides/services/IntelligentGuideAgent');
guideAgent.intelligentGuideAgent.projectContext = {
    // 커스텀 프로젝트 컨텍스트
};

// LogBasedDebuggingAgent 설정
const logAgent = require('./claude-guides/services/LogBasedDebuggingAgent');
logAgent.logBasedDebuggingAgent.realTimeMonitoring = true;
```

## 🚨 트러블슈팅

### 일반적인 문제 해결

#### 1. Java 환경 설정 문제

```bash
# WSL에서 Java 환경 설정
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

#### 2. 로그 파일을 찾을 수 없는 경우

```javascript
// 로그 파일 경로 직접 지정
const result = await executeTask('로그 분석', {
    logFilePath: '/path/to/your/application.log'
});
```

#### 3. Controller 파일 분석 실패

```javascript
// Controller 파일 경로 직접 지정
const result = await executeTask('API 문서화', {
    controllerFiles: [
        'src/main/java/com/example/AuthController.java',
        'src/main/java/com/example/FacilityController.java'
    ]
});
```

### 디버그 모드 활성화

```javascript
// 상세 로그 활성화
process.env.DEBUG = 'elderberry:*';

// 또는 개별 에이전트 디버그
process.env.DEBUG = 'elderberry:intelligent-guide';
```

## 📝 업데이트 로그

### v2.0.0 (2025-01-27)
- ✨ 4개 특화 서브에이전트 시스템 구축
- 🔗 기존 오케스트레이터와 완전 통합
- 🚀 WSL2 환경 최적화
- 📚 MCP Task 도구 완전 연동
- 🧪 종합 테스트 시스템 구축

### 향후 계획
- 🤖 추가 특화 에이전트 개발
- 🔧 성능 최적화 및 안정성 개선
- 📊 고급 분석 및 리포팅 기능
- 🌐 웹 인터페이스 개발

---

## 🎯 결론

Elderberry 통합 서브에이전트 시스템 v2.0은 WSL2 환경에서 실제 동작하는 4개의 특화된 서브에이전트를 통해 다음과 같은 혁신을 제공합니다:

1. **🧠 지능형 가이드**: AI 기반 컨텍스트 분석 및 개발 가이드
2. **📊 자동 진단**: 로그 기반 실시간 디버깅 및 성능 모니터링  
3. **📝 스마트 문서화**: 자동 이슈 문서화 및 지식베이스 관리
4. **📚 API 자동화**: Spring Boot Controller 분석 및 OpenAPI 생성

기존 SubAgentOrchestrator.js와 SequentialAgentOrchestrator.js와의 완전한 통합을 통해 순차적 실행과 순차적 에이전트 시스템의 장점을 모두 활용할 수 있습니다.

**🚀 지금 바로 시작**: `const { executeTask } = require('./claude-guides/services/IntegratedAgentSystem');`