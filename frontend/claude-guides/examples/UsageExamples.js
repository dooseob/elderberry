/**
 * 순차적 에이전트 시스템 사용 예시
 * 실제 /max 명령어와 함께 사용하는 방법
 */

const { processMaxCommand, getSystemStatus } = require('../services/ClaudeGuideIntegration');

/**
 * 예시 1: 간단한 분석 작업
 */
async function simpleAnalysisExample() {
  console.log('📝 예시 1: 간단한 코드 분석');
  
  const result = await processMaxCommand('현재 프로젝트의 TypeScript 에러를 확인해줘');
  
  console.log('결과:', result);
  // 예상 출력:
  // ✅ analyzer 에이전트만 실행
  // 📊 복잡도: simple (점수: 2)
  // 🤖 실행 에이전트: analyzer
  // ⏱️ 실행 시간: ~500ms
}

/**
 * 예시 2: 중간 복잡도 작업
 */
async function moderateTaskExample() {
  console.log('📝 예시 2: 성능 최적화 작업');
  
  const result = await processMaxCommand('React 컴포넌트의 성능을 분석하고 개선해줘');
  
  console.log('결과:', result);
  // 예상 출력:
  // ✅ analyzer → planner → implementer 순차 실행
  // 📊 복잡도: moderate (점수: 5)
  // 🤖 실행 에이전트: analyzer → planner → implementer
  // ⏱️ 실행 시간: ~2000ms
}

/**
 * 예시 3: 복잡한 리팩토링 작업
 */
async function complexRefactoringExample() {
  console.log('📝 예시 3: 전체 아키텍처 리팩토링');
  
  const result = await processMaxCommand(
    '전체 프로젝트의 아키텍처를 분석하고 Feature-Sliced Design으로 리팩토링하며 ' +
    '타입 안전성을 강화하고 성능을 최적화해줘'
  );
  
  console.log('결과:', result);
  // 예상 출력:
  // ✅ analyzer → planner → implementer → validator 모든 에이전트 실행
  // 📊 복잡도: complex (점수: 12)
  // 🤖 실행 에이전트: analyzer → planner → implementer → validator
  // ⏱️ 실행 시간: ~5000ms
}

/**
 * 예시 4: 에러 처리 시나리오
 */
async function errorHandlingExample() {
  console.log('📝 예시 4: 에러 처리 확인');
  
  // 의도적으로 문제가 있는 요청
  const result = await processMaxCommand('존재하지않는파일.js를 최적화해줘');
  
  console.log('결과:', result);
  // 예상 출력:
  // ❌ analyzer 에이전트에서 파일을 찾을 수 없음
  // ⚠️ 부분 성공 또는 실패
  // 💡 권장사항: 올바른 파일 경로를 제공해주세요
}

/**
 * 예시 5: 시스템 모니터링
 */
async function monitoringExample() {
  console.log('📝 예시 5: 시스템 상태 모니터링');
  
  // 몇 가지 작업 실행
  await processMaxCommand('package.json 분석');
  await processMaxCommand('컴포넌트 최적화');
  await processMaxCommand('전체 프로젝트 리팩토링');
  
  // 시스템 상태 확인
  const status = getSystemStatus();
  
  console.log('📊 시스템 통계:');
  console.log(`   총 실행: ${status.stats.totalExecutions}`);
  console.log(`   성공률: ${status.stats.successRate}`);
  console.log(`   평균 실행 시간: ${status.stats.averageExecutionTime}`);
  console.log(`   복잡도 분포:`, status.stats.complexityDistribution);
  console.log(`   많이 사용된 에이전트:`, status.stats.mostUsedAgents);
}

/**
 * 실제 Claude Code 통합 예시
 */
function claudeCodeIntegrationExample() {
  console.log('📝 Claude Code와의 통합 방법:');
  
  const exampleCode = `
// Claude Code에서 /max 명령어 감지 시
if (userInput.startsWith('/max ')) {
  const prompt = userInput.replace('/max ', '');
  
  // 순차적 에이전트 시스템 호출
  const result = await processMaxCommand(prompt, {
    currentFile: getCurrentFile(),
    projectContext: getProjectContext(),
    userPreferences: getUserPreferences()
  });
  
  if (result.success) {
    // 성공적인 결과를 사용자에게 표시
    displayResults(result);
    
    if (result.quality === 'excellent') {
      showSuccessNotification('완벽하게 처리되었습니다! 🌟');
    }
  } else {
    // 실패 시 대체 방안 제시
    handleFailure(result);
    
    if (result.fallback) {
      // 기본 Claude 응답으로 대체
      return await getBasicClaudeResponse(prompt);
    }
  }
}
  `;
  
  console.log(exampleCode);
}

/**
 * 성능 최적화 팁
 */
function performanceOptimizationTips() {
  console.log('⚡ 성능 최적화 팁:');
  
  const tips = [
    {
      tip: '작업을 구체적으로 요청',
      example: '❌ "코드 개선해줘" → ✅ "React 컴포넌트의 렌더링 성능 최적화해줘"'
    },
    {
      tip: '복잡한 작업은 단계별로 분리',
      example: '❌ "전체 프로젝트 완전 리팩토링" → ✅ "먼저 타입 안전성 개선, 다음에 성능 최적화"'
    },
    {
      tip: '컨텍스트 정보 제공',
      example: '✅ "현재 React 18 프로젝트에서 Zustand 사용 중, 메모리 사용량 최적화 필요"'
    },
    {
      tip: '에러 발생 시 더 구체적으로 재요청',
      example: '✅ "src/components/Button.tsx 파일의 Props 타입 정의 개선"'
    }
  ];
  
  tips.forEach((tip, index) => {
    console.log(`${index + 1}. ${tip.tip}`);
    console.log(`   ${tip.example}\n`);
  });
}

/**
 * 모든 예시 실행
 */
async function runAllExamples() {
  console.log('🚀 순차적 에이전트 시스템 - 모든 예시 실행\n');
  
  await simpleAnalysisExample();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await moderateTaskExample();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await complexRefactoringExample();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await errorHandlingExample();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await monitoringExample();
  console.log('\n' + '='.repeat(50) + '\n');
  
  claudeCodeIntegrationExample();
  console.log('\n' + '='.repeat(50) + '\n');
  
  performanceOptimizationTips();
}

module.exports = {
  simpleAnalysisExample,
  moderateTaskExample,
  complexRefactoringExample,
  errorHandlingExample,
  monitoringExample,
  claudeCodeIntegrationExample,
  performanceOptimizationTips,
  runAllExamples
};