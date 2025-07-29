# 커스텀 명령어 시스템 가이드

## 🎯 개요

Claude Code에서 반복적인 에이전트 및 MCP 도구 사용을 간소화하기 위한 커스텀 명령어 시스템입니다.

## 📋 사용 가능한 명령어

### `/max` - 최대 성능 모드
- **설명**: 모든 에이전트와 MCP 도구를 활용하여 최대한 완전하게 작업 수행
- **사용법**: `/max 작업내용`
- **특징**: 
  - 최대 10개 병렬 처리
  - 모든 리소스 활용
  - 복잡한 작업에 최적
- **예시**: `/max TypeScript 타입 에러 모두 수정해줘`

### `/auto` - 자동 최적화 모드  
- **설명**: 작업을 자동으로 분석하여 최적의 방법으로 수행
- **사용법**: `/auto 작업내용`
- **특징**:
  - 작업 유형 자동 분석
  - 최적 에이전트 조합 선택
  - 5개 병렬 처리
- **예시**: `/auto 성능 최적화`

### `/smart` - 지능형 효율 모드
- **설명**: 지능형 분석으로 효율적이고 스마트하게 작업 수행  
- **사용법**: `/smart 작업내용`
- **특징**:
  - 효율성 우선 처리
  - 리소스 최적화
  - 3개 병렬 처리
- **예시**: `/smart UI 컴포넌트 개선`

## 🚀 빠른 시작

### 1. 시스템 활성화
```javascript
// Claude Code 세션에서 자동 활성화됨
// 수동 활성화가 필요한 경우:
const { setupCustomCommands } = require('./claude-guides/services/CommandIntegration');
await setupCustomCommands();
```

### 2. 기본 사용법
```javascript
// Claude Code 세션에서 직접 사용
/max 전체 코드베이스 최적화해줘
/auto 버그 수정
/smart README 문서 개선
```

### 3. 프로그래밍 방식 사용
```javascript
const { handleCustomCommand } = require('./claude-guides/services/CustomCommandHandler');

// 프로그래밍 방식으로 호출
const result = await handleCustomCommand('/max 리팩토링 작업');
console.log(result);
```

## 📊 명령어 상세 비교

| 명령어 | 병렬처리 | 에이전트 | MCP도구 | 용도 | 처리시간 |
|--------|----------|----------|---------|------|----------|
| `/max` | 최대 10개 | 모든 에이전트 | 모든 도구 | 복잡한 작업 | 길음 |
| `/auto` | 최대 5개 | 자동 선택 | 자동 선택 | 일반적 작업 | 중간 |
| `/smart` | 최대 3개 | 지능형 선택 | 최적 선택 | 빠른 작업 | 짧음 |

## 🔧 고급 기능

### 진행상황 추적
모든 커스텀 명령어는 자동으로 TodoWrite를 통해 진행상황을 추적합니다.

```javascript
// 상태 확인
global.claudeCommands.status()

// 도움말 보기  
global.claudeCommands.help()
```

### 학습 시스템 연동
실행 결과가 자동으로 학습 시스템에 반영되어 향후 성능이 개선됩니다.

### 명령어 히스토리
```javascript
const { getCommandStatus } = require('./claude-guides/services/CustomCommandHandler');
const status = getCommandStatus();
console.log('최근 명령어:', status.commandHistory);
```

## 💡 사용 팁

### 1. 작업 유형별 최적 명령어
- **대규모 리팩토링**: `/max`
- **버그 수정**: `/auto` 
- **문서 업데이트**: `/smart`
- **성능 최적화**: `/auto` 또는 `/max`
- **코드 분석**: `/smart`

### 2. 명령어 조합 사용
```javascript
// 1단계: 분석
/smart 코드 품질 분석

// 2단계: 수정  
/max 발견된 문제점 모두 수정

// 3단계: 검증
/auto 수정 결과 검증
```

### 3. 효율적인 작업 패턴
- 간단한 작업: `/smart` → 빠른 처리
- 복잡한 작업: `/auto` → 분석 후 `/max` → 완전 처리
- 모르는 작업: `/auto` → 자동 분석 및 처리

## 🛠️ 문제 해결

### 명령어가 인식되지 않는 경우
```javascript
// 수동으로 시스템 활성화
const { setupCustomCommands } = require('./claude-guides/services/CommandIntegration');
await setupCustomCommands();
```

### 실행이 느린 경우
- `/max` 대신 `/auto`나 `/smart` 사용
- 작업을 더 구체적으로 명시
- 불필요한 범위 제외

### 오류가 발생하는 경우
```javascript
// 상태 확인
global.claudeCommands.status()

// 로그 확인
tail -f logs/backend.log
```

## 📁 파일 구조

```
claude-guides/services/
├── CustomCommandHandler.js    # 명령어 처리 로직
├── CommandIntegration.js       # Claude Code 통합
├── IntegratedAgentSystem.js    # 에이전트 시스템
├── ProgressTracker.js          # 진행상황 추적  
└── RealTimeLearningSystem.js   # 학습 시스템
```

## 🔄 확장 가능성

### 새로운 명령어 추가
```javascript
// CustomCommandHandler.js에서 확장
this.availableCommands['/custom'] = {
    description: '사용자 정의 명령어',
    usage: '/custom 작업내용',
    // ... 설정
};
```

### 에이전트 추가 연동
새로운 에이전트가 추가되면 자동으로 명령어 시스템에 통합됩니다.

## 📈 성능 모니터링

### 실행 통계 확인
```javascript
const { getCommandStatus } = require('./claude-guides/services/CustomCommandHandler');
const stats = getCommandStatus();
console.log(`총 실행 횟수: ${stats.totalCommands}`);
console.log(`현재 상태: ${stats.isProcessing ? '실행 중' : '대기 중'}`);
```

### 성능 최적화 팁
- 작업을 구체적으로 명시
- 불필요한 범위 제외  
- 적절한 명령어 선택

## 🤝 기여 방법

새로운 기능이나 개선사항이 있다면:
1. 이슈 생성
2. 코드 수정
3. 테스트 실행
4. PR 생성

---

**📞 지원**: 문제가 발생하면 GitHub Issues에 보고해주세요.

**📖 업데이트**: 이 문서는 시스템 업데이트에 따라 자동으로 갱신됩니다.