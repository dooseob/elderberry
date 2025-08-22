/**
 * Claude Guide 시스템과 순차적 에이전트 통합
 * 기존 복잡한 상호 호출을 단순한 순차 실행으로 개선
 */

const { executeSequentialAgents } = require('./SequentialAgentOrchestrator');

class ClaudeGuideIntegration {
  constructor() {
    this.isActive = false;
    this.currentTask = null;
    this.executionHistory = [];
  }

  /**
   * /max 명령어 처리 - 순차적 에이전트 실행
   */
  async handleMaxCommand(userPrompt, context = {}) {
    console.log('🎯 /max 명령어 감지 - 순차적 에이전트 시스템 활성화');
    
    this.isActive = true;
    this.currentTask = {
      prompt: userPrompt,
      startTime: Date.now(),
      context
    };

    try {
      // 1. 작업 복잡도 분석
      const complexity = this.analyzeTaskComplexity(userPrompt);
      console.log(`📊 작업 복잡도: ${complexity.level} (점수: ${complexity.score})`);

      // 2. 필요한 에이전트 결정
      const requiredAgents = this.determineRequiredAgents(complexity, userPrompt);
      console.log(`🤖 실행할 에이전트: ${requiredAgents.join(' → ')}`);

      // 3. 순차적 에이전트 실행
      const result = await executeSequentialAgents(
        `Max 명령어 처리: ${userPrompt}`,
        requiredAgents
      );

      // 4. 결과 처리 및 응답 생성
      const response = this.processResults(result);
      
      // 5. 실행 이력 저장
      this.executionHistory.push({
        prompt: userPrompt,
        complexity,
        agents: requiredAgents,
        result,
        response,
        executionTime: Date.now() - this.currentTask.startTime
      });

      this.isActive = false;
      this.currentTask = null;

      return response;

    } catch (error) {
      console.error('❌ /max 명령어 처리 실패:', error);
      
      this.isActive = false;
      this.currentTask = null;
      
      return {
        success: false,
        error: error.message,
        fallbackAction: '기본 Claude 응답으로 대체됩니다.'
      };
    }
  }

  /**
   * 작업 복잡도 분석
   */
  analyzeTaskComplexity(prompt) {
    let score = 0;
    let level = 'simple';
    
    // 키워드 기반 복잡도 측정
    const complexityIndicators = {
      // 고복잡도 키워드 (각 +3점)
      high: ['구현', 'implement', '최적화', 'optimize', '리팩토링', 'refactor', '통합', 'integrate'],
      // 중복잡도 키워드 (각 +2점)
      medium: ['분석', 'analyze', '개선', 'improve', '수정', 'fix', '업데이트', 'update'],
      // 저복잡도 키워드 (각 +1점)
      low: ['확인', 'check', '조회', 'view', '읽기', 'read', '설명', 'explain']
    };

    // 키워드 점수 계산
    Object.entries(complexityIndicators).forEach(([level, keywords]) => {
      const multiplier = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
      keywords.forEach(keyword => {
        if (prompt.toLowerCase().includes(keyword)) {
          score += multiplier;
        }
      });
    });

    // 문장 길이 고려
    if (prompt.length > 100) score += 2;
    if (prompt.length > 200) score += 3;

    // 복잡도 레벨 결정
    if (score >= 8) level = 'complex';
    else if (score >= 4) level = 'moderate';
    else level = 'simple';

    return { score, level };
  }

  /**
   * 필요한 에이전트 결정
   */
  determineRequiredAgents(complexity, prompt) {
    const baseAgents = ['analyzer'];
    
    // 복잡도에 따른 에이전트 추가
    if (complexity.level === 'simple') {
      return baseAgents;
    } else if (complexity.level === 'moderate') {
      return [...baseAgents, 'planner', 'implementer'];
    } else {
      return ['analyzer', 'planner', 'implementer', 'validator'];
    }
  }

  /**
   * 결과 처리 및 응답 생성
   */
  processResults(result) {
    if (!result.success) {
      return {
        success: false,
        message: '에이전트 실행 중 오류가 발생했습니다.',
        error: result.error,
        suggestion: '더 구체적인 요청을 해주세요.'
      };
    }

    const { summary, successful, failed, recommendations } = result.results;
    
    // 성공적인 실행
    if (summary.failed === 0) {
      return {
        success: true,
        message: `✅ 모든 에이전트 실행 완료 (${summary.successful}/${summary.total})`,
        results: successful,
        executionTime: result.executionTime,
        quality: 'excellent'
      };
    }
    
    // 부분 성공
    if (summary.successful > summary.failed) {
      return {
        success: true,
        message: `⚠️ 부분 성공 (${summary.successful}/${summary.total} 완료)`,
        results: successful,
        issues: failed,
        recommendations,
        quality: 'good'
      };
    }
    
    // 대부분 실패
    return {
      success: false,
      message: `❌ 대부분의 에이전트 실행 실패 (${summary.failed}/${summary.total} 실패)`,
      issues: failed,
      recommendations,
      suggestion: '작업을 더 작은 단위로 나누어 시도해보세요.'
    };
  }

  /**
   * 실행 상태 모니터링
   */
  getStatus() {
    return {
      isActive: this.isActive,
      currentTask: this.currentTask,
      historyCount: this.executionHistory.length,
      lastExecution: this.executionHistory[this.executionHistory.length - 1]
    };
  }

  /**
   * 실행 이력 조회
   */
  getExecutionHistory(limit = 10) {
    return this.executionHistory.slice(-limit).reverse();
  }

  /**
   * 성능 통계
   */
  getPerformanceStats() {
    if (this.executionHistory.length === 0) {
      return { message: '실행 이력이 없습니다.' };
    }

    const executions = this.executionHistory;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.result.success).length;
    const averageTime = executions.reduce((sum, e) => sum + e.executionTime, 0) / totalExecutions;
    
    const complexityStats = executions.reduce((stats, e) => {
      stats[e.complexity.level] = (stats[e.complexity.level] || 0) + 1;
      return stats;
    }, {});

    return {
      totalExecutions,
      successRate: `${((successfulExecutions / totalExecutions) * 100).toFixed(1)}%`,
      averageExecutionTime: `${Math.round(averageTime)}ms`,
      complexityDistribution: complexityStats,
      mostUsedAgents: this.getMostUsedAgents()
    };
  }

  /**
   * 가장 많이 사용된 에이전트 통계
   */
  getMostUsedAgents() {
    const agentUsage = {};
    
    this.executionHistory.forEach(execution => {
      execution.agents.forEach(agent => {
        agentUsage[agent] = (agentUsage[agent] || 0) + 1;
      });
    });

    return Object.entries(agentUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([agent, count]) => ({ agent, count }));
  }
}

// 글로벌 인스턴스
const claudeGuideIntegration = new ClaudeGuideIntegration();

/**
 * 메인 처리 함수 - Claude Code에서 호출
 */
async function processMaxCommand(userPrompt, context = {}) {
  console.log('🚀 Claude Guide 순차적 에이전트 시스템 시작');
  
  try {
    const result = await claudeGuideIntegration.handleMaxCommand(userPrompt, context);
    
    // 결과에 따른 로깅
    if (result.success) {
      console.log(`✅ 처리 완료: ${result.message}`);
      if (result.quality === 'excellent') {
        console.log('🌟 완벽한 실행 품질');
      }
    } else {
      console.log(`⚠️ 처리 실패: ${result.message}`);
      if (result.suggestion) {
        console.log(`💡 제안: ${result.suggestion}`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Max 명령어 처리 중 예외 발생:', error);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}

/**
 * 시스템 상태 확인
 */
function getSystemStatus() {
  const status = claudeGuideIntegration.getStatus();
  const stats = claudeGuideIntegration.getPerformanceStats();
  
  console.log('📊 Claude Guide 시스템 상태:');
  console.log(`   활성 상태: ${status.isActive ? '🟢 활성' : '🔴 대기'}`);
  console.log(`   총 실행 횟수: ${stats.totalExecutions || 0}`);
  console.log(`   성공률: ${stats.successRate || 'N/A'}`);
  console.log(`   평균 실행 시간: ${stats.averageExecutionTime || 'N/A'}`);
  
  return { status, stats };
}

/**
 * 사용 예시 및 테스트
 */
async function testSequentialAgents() {
  console.log('🧪 순차적 에이전트 시스템 테스트 시작');
  
  const testCases = [
    '간단한 파일 확인 요청',
    '복잡한 코드 리팩토링 및 최적화 작업 수행',
    '전체 프로젝트 분석 후 성능 개선 방안 구현'
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 테스트 케이스: ${testCase}`);
    const result = await processMaxCommand(testCase);
    console.log(`결과: ${result.success ? '✅ 성공' : '❌ 실패'}`);
  }
  
  // 통계 출력
  console.log('\n📈 테스트 완료 후 통계:');
  getSystemStatus();
}

module.exports = {
  ClaudeGuideIntegration,
  claudeGuideIntegration,
  processMaxCommand,
  getSystemStatus,
  testSequentialAgents
};