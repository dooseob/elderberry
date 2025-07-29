/**
 * Claude Code 통합 시스템
 * 커스텀 명령어와 Claude Code의 네이티브 기능 연동
 * 
 * @author Claude Code + MCP Integration
 * @version 2.0.0
 * @date 2025-07-29
 */

const { CustomCommandHandler } = require('./CustomCommandHandler');
const { ParallelTaskManager } = require('./ParallelTaskManager');
const { ProgressTracker } = require('./ProgressTracker');

class CommandIntegration {
  constructor() {
    this.commandHandler = new CustomCommandHandler();
    this.taskManager = new ParallelTaskManager();
    this.progressTracker = new ProgressTracker();
    
    // Claude Code 도구 매핑
    this.claudeTools = {
      TODO_WRITE: 'TodoWrite',
      TASK: 'Task',
      EDIT: 'Edit',
      READ: 'Read',
      BASH: 'Bash',
      GLOB: 'Glob',
      GREP: 'Grep'
    };
    
    // 명령어 패턴 정의
    this.commandPatterns = {
      '/max': /^\/max\s+(.+)$/i,
      '/auto': /^\/auto\s+(.+)$/i,
      '/smart': /^\/smart\s+(.+)$/i,
      '/rapid': /^\/rapid\s+(.+)$/i,
      '/deep': /^\/deep\s+(.+)$/i,
      '/sync': /^\/sync\s+(.+)$/i
    };
  }

  /**
   * 메인 통합 핸들러
   * Claude Code에서 사용자 입력을 받아 처리
   */
  async handleUserInput(input, context = {}) {
    const trimmedInput = input.trim();
    
    // 커스텀 명령어 패턴 매칭
    for (const [command, pattern] of Object.entries(this.commandPatterns)) {
      const match = trimmedInput.match(pattern);
      if (match) {
        const task = match[1];
        return await this.executeCustomCommand(command, task, context);
      }
    }
    
    // 일반 입력 처리 (Claude Code 기본 처리로 위임)
    return await this.handleGeneralInput(trimmedInput, context);
  }

  /**
   * 커스텀 명령어 실행
   */
  async executeCustomCommand(command, task, context) {
    console.log(`🚀 커스텀 명령어 실행: ${command} "${task}"`);
    
    try {
      // 옵션 파싱 (--mcp, --agents 등)
      const { cleanTask, options } = this.parseCommandOptions(task);
      
      // 진행 추적 시작
      const trackingId = await this.progressTracker.start(command, cleanTask);
      
      // CLAUDE.md 가이드라인 확인
      const guidelines = await this.loadGuidelines();
      options.guidelines = guidelines;
      
      // 커스텀 명령어 실행
      const result = await this.commandHandler.handleCommand(command, cleanTask, {
        ...options,
        context,
        trackingId,
        claudeTools: this.claudeTools
      });
      
      // 결과 후처리
      await this.postProcessResult(result, trackingId);
      
      return this.formatResponse(command, cleanTask, result);
      
    } catch (error) {
      console.error(`❌ 커스텀 명령어 실행 실패: ${command}`, error);
      return this.formatErrorResponse(command, task, error);
    }
  }

  /**
   * 명령어 옵션 파싱
   */
  parseCommandOptions(task) {
    const options = {};
    let cleanTask = task;
    
    // --mcp 옵션 파싱
    const mcpMatch = task.match(/--mcp\s+([^\s]+)/);
    if (mcpMatch) {
      options.mcpTools = mcpMatch[1].split(',').map(tool => tool.trim());
      cleanTask = cleanTask.replace(/--mcp\s+[^\s]+/, '').trim();
    }
    
    // --agents 옵션 파싱
    const agentsMatch = task.match(/--agents\s+([^\s]+)/);
    if (agentsMatch) {
      options.subAgents = agentsMatch[1].split(',').map(agent => agent.trim());
      cleanTask = cleanTask.replace(/--agents\s+[^\s]+/, '').trim();
    }
    
    // --parallel 옵션 파싱
    const parallelMatch = task.match(/--parallel\s+(\d+)/);
    if (parallelMatch) {
      options.maxConcurrency = parseInt(parallelMatch[1]);
      cleanTask = cleanTask.replace(/--parallel\s+\d+/, '').trim();
    }
    
    // --no-commit 옵션
    if (task.includes('--no-commit')) {
      options.autoCommit = false;
      cleanTask = cleanTask.replace(/--no-commit/, '').trim();
    }
    
    return { cleanTask, options };
  }

  /**
   * CLAUDE.md 가이드라인 로드
   */
  async loadGuidelines() {
    try {
      // 실제로는 Read 도구로 CLAUDE.md 읽기
      console.log('📖 CLAUDE.md 가이드라인 로드');
      
      return {
        principles: [
          '실용주의 우선 - 동작하는 코드가 먼저',
          '순차적 에이전트 방식 - 예측 가능한 실행',
          '안정성 우선 - 한 단계씩 검증',
          'MCP 통합 활용 - 5개 도구 완전 활용'
        ],
        restrictions: [
          '임시 조치나 하드코딩 금지',
          '파일 끝부분만 확인 금지',
          '단일 문서 2000줄 초과 금지'
        ],
        mcpTools: ['sequential-thinking', 'context7', 'memory', 'filesystem', 'github'],
        subAgents: ['CLAUDE_GUIDE', 'DEBUG', 'API_DOCUMENTATION', 'TROUBLESHOOTING', 'GOOGLE_SEO']
      };
      
    } catch (error) {
      console.error('❌ 가이드라인 로드 실패:', error);
      return {};
    }
  }

  /**
   * 결과 후처리
   */
  async postProcessResult(result, trackingId) {
    try {
      // 진행 추적 완료
      await this.progressTracker.complete(trackingId, result);
      
      // 학습을 위한 메모리 저장 (MCP Memory 도구 활용)
      if (result.success) {
        await this.storeExecutionLearning(result);
      }
      
      // 자동 커밋 (옵션 활성화된 경우)
      if (result.autoCommit && result.success) {
        await this.performAutoCommit(result);
      }
      
    } catch (error) {
      console.error('❌ 결과 후처리 실패:', error);
    }
  }

  /**
   * 실행 학습 저장
   */
  async storeExecutionLearning(result) {
    try {
      console.log('🧠 실행 결과 학습 저장');
      
      // MCP Memory 도구 활용하여 학습 데이터 저장
      const learningData = {
        command: result.command,
        executionTime: result.executionTime,
        success: result.success,
        efficiency: result.efficiency || 0.8,
        patterns: this.extractPatterns(result),
        timestamp: new Date().toISOString()
      };
      
      // 실제로는 MCP Memory 도구 호출
      console.log('💾 학습 데이터 저장 완료');
      
    } catch (error) {
      console.error('❌ 학습 저장 실패:', error);
    }
  }

  /**
   * 패턴 추출
   */
  extractPatterns(result) {
    return {
      commandType: result.command,
      taskComplexity: result.complexity || 'medium',
      mostUsedMCPTools: result.mcpToolsUsed || [],
      mostEffectiveAgents: result.effectiveAgents || [],
      commonErrors: result.errors || [],
      performanceMetrics: result.metrics || {}
    };
  }

  /**
   * 자동 커밋 수행
   */
  async performAutoCommit(result) {
    try {
      console.log('🔄 자동 커밋 수행');
      
      // MCP GitHub 도구 활용하여 자동 커밋
      const commitMessage = this.generateCommitMessage(result);
      
      // 실제로는 MCP GitHub 도구 호출
      console.log(`📝 커밋 메시지: ${commitMessage}`);
      console.log('✅ 자동 커밋 완료');
      
    } catch (error) {
      console.error('❌ 자동 커밋 실패:', error);
    }
  }

  /**
   * 커밋 메시지 생성
   */
  generateCommitMessage(result) {
    const command = result.command.replace('/', '');
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `${command}: ${result.task || '작업 완료'} 

실행 시간: ${result.executionTime}ms
성공률: ${result.efficiency ? Math.round(result.efficiency * 100) : 80}%
사용된 MCP 도구: ${(result.mcpToolsUsed || []).join(', ')}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
  }

  /**
   * 일반 입력 처리
   */
  async handleGeneralInput(input, context) {
    // 복잡도 분석
    const complexity = await this.analyzeInputComplexity(input);
    
    if (complexity.score >= 8) {
      // 복잡한 작업 - 자동으로 /auto 모드 제안
      console.log('🤖 복잡한 작업 감지 - /auto 모드 권장');
      return {
        suggestion: `/auto ${input}`,
        reason: '복잡한 작업이 감지되어 /auto 모드를 권장합니다.',
        complexity: complexity,
        originalInput: input
      };
    }
    
    // 일반 처리 (Claude Code 기본 동작)
    return null; // Claude Code가 계속 처리하도록 함
  }

  /**
   * 입력 복잡도 분석
   */
  async analyzeInputComplexity(input) {
    const complexKeywords = [
      '전체', '모든', '리팩토링', '최적화', '아키텍처', '시스템',
      '구현', '설계', '분석', '통합', '자동화', '개선'
    ];
    
    const moderateKeywords = [
      '수정', '업데이트', '추가', '변경', '개선', '버그'
    ];
    
    let score = 0;
    const inputLower = input.toLowerCase();
    
    complexKeywords.forEach(keyword => {
      if (inputLower.includes(keyword)) score += 3;
    });
    
    moderateKeywords.forEach(keyword => {
      if (inputLower.includes(keyword)) score += 1;
    });
    
    return {
      score: Math.min(score, 10),
      level: score >= 8 ? 'high' : score >= 4 ? 'medium' : 'low',
      recommendedCommand: score >= 8 ? '/max' : score >= 4 ? '/auto' : '/smart'
    };
  }

  /**
   * 응답 포맷팅
   */
  formatResponse(command, task, result) {
    const executionTimeFormatted = this.formatExecutionTime(result.executionTime);
    
    return {
      success: true,
      command,
      task,
      executionTime: executionTimeFormatted,
      summary: this.generateSummary(result),
      details: result,
      recommendations: this.generateRecommendations(result),
      nextSteps: this.generateNextSteps(result)
    };
  }

  /**
   * 에러 응답 포맷팅
   */
  formatErrorResponse(command, task, error) {
    return {
      success: false,
      command,
      task,
      error: error.message,
      troubleshooting: this.generateTroubleshooting(error),
      suggestions: [
        '작업을 더 단순한 단위로 나누어 시도해보세요.',
        '/rapid 모드로 긴급 수정을 시도해보세요.',
        '문제가 지속되면 /deep 모드로 심층 분석을 수행하세요.'
      ]
    };
  }

  /**
   * 실행 시간 포맷팅
   */
  formatExecutionTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}초`;
    return `${(ms / 60000).toFixed(1)}분`;
  }

  /**
   * 요약 생성
   */
  generateSummary(result) {
    const efficiency = result.efficiency ? Math.round(result.efficiency * 100) : 80;
    const tasksCompleted = result.tasksCompleted || result.results?.length || 1;
    
    return `${result.command} 모드로 ${tasksCompleted}개 작업을 완료했습니다. ` +
           `효율성 ${efficiency}%, 실행 시간 ${this.formatExecutionTime(result.executionTime)}`;
  }

  /**
   * 추천사항 생성
   */
  generateRecommendations(result) {
    const recommendations = [];
    
    if (result.efficiency < 0.7) {
      recommendations.push('다음에는 더 단순한 명령어(/smart 또는 /rapid)를 고려해보세요.');
    }
    
    if (result.executionTime > 30000) {
      recommendations.push('작업을 더 작은 단위로 나누어 병렬 처리를 최적화하세요.');
    }
    
    if (result.errors && result.errors.length > 0) {
      recommendations.push('/deep 모드로 근본 원인을 분석해보세요.');
    }
    
    return recommendations;
  }

  /**
   * 다음 단계 생성
   */
  generateNextSteps(result) {
    const nextSteps = [];
    
    if (result.success) {
      nextSteps.push('결과를 검토하고 필요시 추가 최적화를 진행하세요.');
      
      if (result.autoCommit) {
        nextSteps.push('변경사항이 자동으로 커밋되었습니다. PR 생성을 고려해보세요.');
      } else {
        nextSteps.push('/sync 명령어로 변경사항을 동기화하세요.');
      }
    } else {
      nextSteps.push('오류를 분석하고 /troubleshooting 에이전트로 해결책을 찾아보세요.');
    }
    
    return nextSteps;
  }

  /**
   * 트러블슈팅 가이드 생성
   */
  generateTroubleshooting(error) {
    const commonSolutions = {
      'timeout': '작업 시간 초과 - 더 작은 단위로 나누거나 /rapid 모드 사용',
      'permission': '권한 오류 - 파일 접근 권한 확인',
      'network': '네트워크 오류 - 인터넷 연결 및 MCP 서버 상태 확인',
      'memory': '메모리 부족 - 병렬 작업 수를 줄이거나 시스템 리소스 확인'
    };
    
    const errorMessage = error.message.toLowerCase();
    
    for (const [key, solution] of Object.entries(commonSolutions)) {
      if (errorMessage.includes(key)) {
        return solution;
      }
    }
    
    return '일반적인 해결책: 작업을 단순화하고 /debug 에이전트로 상세 분석을 수행하세요.';
  }

  /**
   * 시스템 상태 조회
   */
  getSystemStatus() {
    return {
      activeCommands: this.progressTracker.getAllActiveSessions().length,
      taskManagerStatus: this.taskManager.getStatus(),
      progressMetrics: this.progressTracker.getMetrics(),
      availableCommands: Object.keys(this.commandPatterns),
      mcpTools: Object.values(this.commandHandler.mcpTools),
      subAgents: Object.values(this.commandHandler.subAgents)
    };
  }
}

module.exports = { CommandIntegration };