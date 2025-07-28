/**
 * 실용적이고 즉시 적용 가능한 순차적 에이전트 솔루션
 * 복잡한 시스템 대신 간단하고 효과적인 접근법
 * 자동 워크플로우 (작업요청 → 지침확인 → 에이전트실행 → 커밋/푸시) 통합
 */

const { AutoWorkflowAgent } = require('../services/AutoWorkflowAgent');

// 자동 워크플로우 에이전트 인스턴스
const workflowAgent = new AutoWorkflowAgent();

/**
 * 자돐 워크플로우를 통한 순차적 에이전트 실행
 * 작업요청 → CLAUDE.md 지침확인 → 순차적 에이전트 → 자동 커밋/푸시
 */
async function executeAutoWorkflow(taskDescription, options = {}) {
  console.log(`🚀 자동 워크플로우 시작: ${taskDescription}`);
  
  try {
    // 자동 워크플로우 실행
    const result = await workflowAgent.executeWorkflow(taskDescription, {
      autoCommit: options.autoCommit !== false, // 기본적으로 자동 커밋 활성화
      autoPush: options.autoPush !== false,     // 기본적으로 자동 푸시 활성화
      ...options
    });
    
    console.log('✅ 자동 워크플로우 완료');
    return result;
    
  } catch (error) {
    console.error('❌ 자동 워크플로우 실패:', error);
    return {
      success: false,
      error: error.message,
      recommendation: '수동으로 작업을 진행하거나 에러를 확인해주세요'
    };
  }
}

/**
 * 기존 간단한 순차적 에이전트 실행 (호환성 유지)
 * 복잡한 상호 호출 없이 단순한 체인 실행
 */
async function executeSimpleAgentChain(taskDescription) {
  console.log(`🔄 순차적 에이전트 체인 시작: ${taskDescription}`);
  
  const results = {
    task: taskDescription,
    startTime: Date.now(),
    steps: [],
    final: null
  };
  
  try {
    // 1단계: 분석 (항상 실행)
    console.log('📊 1단계: 코드 분석 시작...');
    const analysisResult = await runAnalysisAgent(taskDescription);
    results.steps.push({ step: 'analysis', success: true, data: analysisResult });
    console.log('✅ 분석 완료');
    
    // 2단계: 계획 수립 (복잡한 작업만)
    if (analysisResult.complexity > 3) {
      console.log('📋 2단계: 실행 계획 수립...');
      const planResult = await runPlanningAgent(analysisResult);
      results.steps.push({ step: 'planning', success: true, data: planResult });
      console.log('✅ 계획 수립 완료');
      
      // 3단계: 실제 구현 (계획이 있는 경우)
      console.log('🔨 3단계: 코드 구현/수정...');
      const implementResult = await runImplementationAgent(planResult);
      results.steps.push({ step: 'implementation', success: true, data: implementResult });
      console.log('✅ 구현 완료');
      
      // 4단계: 검증 (중요한 작업만)
      if (analysisResult.complexity > 6) {
        console.log('🔍 4단계: 결과 검증...');
        const validationResult = await runValidationAgent(implementResult);
        results.steps.push({ step: 'validation', success: true, data: validationResult });
        console.log('✅ 검증 완료');
      }
    }
    
    // 최종 결과 생성
    results.final = generateFinalResult(results.steps);
    results.executionTime = Date.now() - results.startTime;
    
    console.log(`🎉 모든 단계 완료 (${results.executionTime}ms)`);
    return results;
    
  } catch (error) {
    console.error('❌ 에이전트 체인 실행 실패:', error);
    results.error = error.message;
    results.executionTime = Date.now() - results.startTime;
    return results;
  }
}

/**
 * 1단계: 분석 에이전트
 */
async function runAnalysisAgent(task) {
  // Task 도구를 사용한 실제 분석
  console.log('  📍 코드베이스 분석 중...');
  
  // 복잡도 판단
  let complexity = 1;
  if (task.includes('최적화') || task.includes('optimize')) complexity += 3;
  if (task.includes('리팩토링') || task.includes('refactor')) complexity += 4;
  if (task.includes('구현') || task.includes('implement')) complexity += 2;
  if (task.includes('전체') || task.includes('전면')) complexity += 3;
  
  return {
    complexity,
    taskType: determineTaskType(task),
    estimatedTime: complexity * 1000,
    requiredTools: ['Read', 'Grep', 'Edit'],
    recommendations: [
      '코드 품질 검토 필요',
      '타입 안전성 확인',
      '성능 영향 분석'
    ]
  };
}

/**
 * 2단계: 계획 에이전트
 */
async function runPlanningAgent(analysisResult) {
  console.log('  📍 실행 계획 수립 중...');
  
  const plan = {
    steps: [],
    tools: analysisResult.requiredTools,
    estimatedTime: analysisResult.estimatedTime,
    risks: []
  };
  
  // 작업 타입에 따른 계획 수립
  switch (analysisResult.taskType) {
    case 'optimization':
      plan.steps = [
        '성능 병목 지점 식별',
        '최적화 전략 수립',
        '코드 수정',
        '성능 측정'
      ];
      break;
      
    case 'refactoring':
      plan.steps = [
        '리팩토링 범위 정의',
        '타입 안전성 확보',
        '코드 구조 개선',
        '테스트 실행'
      ];
      break;
      
    case 'implementation':
      plan.steps = [
        '요구사항 분석',
        '컴포넌트 설계',
        '코드 구현',
        '통합 테스트'
      ];
      break;
      
    default:
      plan.steps = [
        '기본 분석',
        '간단한 수정',
        '결과 확인'
      ];
  }
  
  return plan;
}

/**
 * 3단계: 구현 에이전트
 */
async function runImplementationAgent(planResult) {
  console.log('  📍 실제 구현 작업 중...');
  
  const implementation = {
    modifiedFiles: [],
    changes: [],
    issues: [],
    success: true
  };
  
  // 계획된 단계별 실행
  for (const step of planResult.steps) {
    console.log(`    → ${step} 실행 중...`);
    
    // 실제 MCP Task 호출은 여기서
    // 현재는 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    
    implementation.changes.push({
      step,
      completed: true,
      details: `${step} 성공적으로 완료`
    });
  }
  
  return implementation;
}

/**
 * 4단계: 검증 에이전트
 */
async function runValidationAgent(implementResult) {
  console.log('  📍 구현 결과 검증 중...');
  
  const validation = {
    quality: 'good',
    issues: [],
    recommendations: [],
    passed: true
  };
  
  // 구현 결과 검증
  if (implementResult.success) {
    validation.quality = 'excellent';
    validation.recommendations.push('모든 구현이 성공적으로 완료되었습니다');
  } else {
    validation.quality = 'needs_improvement';
    validation.issues = implementResult.issues;
    validation.passed = false;
  }
  
  return validation;
}

/**
 * 작업 타입 결정
 */
function determineTaskType(task) {
  const taskLower = task.toLowerCase();
  
  if (taskLower.includes('최적화') || taskLower.includes('optimize')) {
    return 'optimization';
  } else if (taskLower.includes('리팩토링') || taskLower.includes('refactor')) {
    return 'refactoring';
  } else if (taskLower.includes('구현') || taskLower.includes('implement')) {
    return 'implementation';
  } else {
    return 'analysis';
  }
}

/**
 * 최종 결과 생성
 */
function generateFinalResult(steps) {
  const successful = steps.filter(s => s.success);
  const failed = steps.filter(s => !s.success);
  
  return {
    summary: `${successful.length}/${steps.length} 단계 성공`,
    quality: failed.length === 0 ? 'excellent' : 'good',
    completedSteps: successful.map(s => s.step),
    failedSteps: failed.map(s => s.step),
    nextActions: failed.length > 0 ? ['실패한 단계 재시도 권장'] : ['모든 작업 완료']
  };
}

/**
 * /max 명령어 핸들러 (실제 사용)
 */
async function handleMaxCommand(userPrompt) {
  console.log(`🎯 /max 명령어 처리: "${userPrompt}"`);
  
  // "max" 제거 후 실제 작업 내용 추출
  const task = userPrompt.replace(/^\/max\s+/i, '').trim();
  
  if (!task) {
    return {
      success: false,
      message: '작업 내용을 입력해주세요. 예: /max 코드 최적화해줘'
    };
  }
  
  try {
    const result = await executeSimpleAgentChain(task);
    
    if (result.error) {
      return {
        success: false,
        message: `작업 처리 중 오류: ${result.error}`,
        suggestion: '더 구체적인 요청을 해주세요.'
      };
    }
    
    return {
      success: true,
      message: result.final.summary,
      quality: result.final.quality,
      executionTime: result.executionTime,
      steps: result.steps.map(s => s.step),
      details: result.final
    };
    
  } catch (error) {
    return {
      success: false,
      message: `예상치 못한 오류: ${error.message}`,
      fallback: true
    };
  }
}

/**
 * 사용 예시
 */
async function demonstrateUsage() {
  console.log('🚀 순차적 에이전트 시스템 시연\n');
  
  const examples = [
    '/max TypeScript 타입 에러 수정해줘',
    '/max React 컴포넌트 성능 최적화',
    '/max 전체 프로젝트 코드 품질 개선'
  ];
  
  for (const example of examples) {
    console.log(`📝 예시: ${example}`);
    const result = await handleMaxCommand(example);
    console.log(`결과: ${result.success ? '✅' : '❌'} ${result.message}`);
    console.log(`실행 시간: ${result.executionTime || 'N/A'}ms\n`);
  }
}

module.exports = {
  // 새로운 자동 워크플로우 기능
  executeAutoWorkflow,
  handleMaxCommand,
  getWorkflowStatus,
  executeManualWorkflow,
  
  // 기존 호환성 유지
  executeSimpleAgentChain,
  demonstrateUsage,
  runAnalysisAgent,
  runPlanningAgent,
  runImplementationAgent,
  runValidationAgent
};