/**
 * 커스텀 명령어 시스템 핸들러
 * 6개 명령어(/max, /auto, /smart, /rapid, /deep, /sync)와 MCP 도구 통합
 * 5개 서브에이전트 협업 관리
 * 
 * @author Claude Code + MCP Integration
 * @version 2.0.0 - 완전한 커스텀 명령어 시스템
 * @date 2025-07-29
 */

const { ExecutionMode, MCPToolType, AgentType } = require('./types/CommandTypes');
const { MCPIntegratedAgentSystem } = require('./MCPIntegratedAgentSystem');
const { EnhancedAgentOrchestrator } = require('./EnhancedAgentOrchestrator');
const { ParallelTaskManager } = require('./ParallelTaskManager');
const { ProgressTracker } = require('./ProgressTracker');

class CustomCommandHandler {
  constructor() {
    // MCP 도구 정의
    this.mcpTools = {
      SEQUENTIAL_THINKING: 'sequential-thinking',
      CONTEXT7: 'context7', 
      MEMORY: 'memory',
      FILESYSTEM: 'filesystem',
      GITHUB: 'github'
    };

    // 5개 서브에이전트 정의
    this.subAgents = {
      CLAUDE_GUIDE: 'CLAUDE_GUIDE',
      DEBUG: 'DEBUG',
      API_DOCUMENTATION: 'API_DOCUMENTATION', 
      TROUBLESHOOTING: 'TROUBLESHOOTING',
      GOOGLE_SEO: 'GOOGLE_SEO'
    };

    // 시스템 초기화
    this.mcpSystem = new MCPIntegratedAgentSystem();
    this.orchestrator = new EnhancedAgentOrchestrator();
    this.taskManager = new ParallelTaskManager();
    this.progressTracker = new ProgressTracker();
  }

  /**
   * 커스텀 명령어 메인 핸들러
   * @param {string} command - 명령어 (/max, /auto, /smart, /rapid, /deep, /sync)
   * @param {string} task - 실행할 작업
   * @param {object} options - 추가 옵션
   * @returns {object} 실행 결과
   */
  async handleCommand(command, task, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 ${command} 명령어 실행 시작: ${task}`);
      
      // 진행 추적 시작
      const trackingId = await this.progressTracker.start(command, task);
      
      let result;
      switch(command.toLowerCase()) {
        case '/max':
          result = await this.executeMaxMode(task, options);
          break;
        case '/auto':
          result = await this.executeAutoMode(task, options);
          break;
        case '/smart':
          result = await this.executeSmartMode(task, options);
          break;
        case '/rapid':
          result = await this.executeRapidMode(task, options);
          break;
        case '/deep':
          result = await this.executeDeepMode(task, options);
          break;
        case '/sync':
          result = await this.executeSyncMode(task, options);
          break;
        default:
          throw new Error(`알 수 없는 명령어: ${command}`);
      }

      // 실행 결과 보완
      result.executionTime = Date.now() - startTime;
      result.command = command;
      result.success = true;
      
      // 진행 추적 완료
      await this.progressTracker.complete(trackingId, result);
      
      console.log(`✅ ${command} 명령어 실행 완료 (${result.executionTime}ms)`);
      return result;

    } catch (error) {
      console.error(`❌ ${command} 명령어 실행 실패:`, error);
      return {
        command,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * /max - 최대 성능 모드 (10개 병렬)
   * 모든 MCP 도구 + 5개 서브에이전트 완전 활용
   */
  async executeMaxMode(task, options = {}) {
    console.log('🔥 MAX MODE: 최대 성능 모드 실행');
    
    const config = {
      maxConcurrency: options.maxConcurrency || 10,
      mcpTools: Object.values(this.mcpTools), // 모든 MCP 도구 활용
      subAgents: Object.values(this.subAgents), // 모든 서브에이전트 활용
      executionMode: ExecutionMode.PARALLEL_INTENSIVE,
      enableProgress: true,
      autoCommit: options.autoCommit !== false,
      timeout: options.timeout || 30 * 60 * 1000 // 30분
    };

    // 작업 복잡도 분석
    const complexity = await this.analyzeTaskComplexity(task);
    
    if (complexity.score >= 8) {
      // 초복잡 작업 - Sequential Thinking 우선 적용
      const sequentialResult = await this.mcpSystem.executeMCPIntegratedTask(
        `복잡한 작업 분석: ${task}`,
        { mcpTools: [this.mcpTools.SEQUENTIAL_THINKING, this.mcpTools.CONTEXT7] }
      );
      
      // 분석 결과를 바탕으로 작업 분할
      const subtasks = this.createSubtasks(task, sequentialResult, config.maxConcurrency);
      config.subtasks = subtasks;
    }

    // 마스터-서브 에이전트 협업 실행
    return await this.orchestrator.executeEnhancedAgentWorkflow({
      masterAgent: 'claude-code',
      subAgents: config.subAgents,
      mcpTools: config.mcpTools,
      task,
      parallelExecution: true,
      maxConcurrency: config.maxConcurrency,
      ...config
    });
  }

  /**
   * /auto - 자동 최적화 모드 (5개 병렬)
   * 작업 복잡도 분석 후 최적 전략 자동 선택
   */
  async executeAutoMode(task, options = {}) {
    console.log('⚡ AUTO MODE: 자동 최적화 모드 실행');
    
    // 작업 분석 및 최적화 전략 선택
    const analysis = await this.analyzeAndOptimize(task);
    
    const config = {
      maxConcurrency: 5,
      mcpTools: analysis.recommendedMCPTools,
      subAgents: analysis.recommendedAgents,
      executionMode: ExecutionMode.BALANCED,
      strategy: analysis.strategy,
      autoCommit: options.autoCommit !== false
    };

    console.log(`📊 자동 분석 결과: ${analysis.strategy} 전략 선택`);
    console.log(`🔧 추천 MCP 도구: ${config.mcpTools.join(', ')}`);
    console.log(`🤖 추천 에이전트: ${config.subAgents.join(', ')}`);

    return await this.orchestrator.executeEnhancedAgentWorkflow({
      masterAgent: 'claude-code',
      subAgents: config.subAgents,
      mcpTools: config.mcpTools,
      task,
      parallelExecution: true,
      maxConcurrency: config.maxConcurrency,
      ...config
    });
  }

  /**
   * /smart - 지능형 협업 모드 (3개 병렬)
   * Claude Code가 마스터로 서브에이전트 지능적 조율
   */
  async executeSmartMode(task, options = {}) {
    console.log('🧠 SMART MODE: 지능형 협업 모드 실행');
    
    const config = {
      maxConcurrency: 3,
      mcpTools: [
        this.mcpTools.MEMORY,
        this.mcpTools.CONTEXT7,
        this.mcpTools.FILESYSTEM
      ],
      subAgents: await this.selectSmartAgents(task),
      executionMode: ExecutionMode.COLLABORATIVE,
      enableSmartCoordination: true,
      qualityFirst: true
    };

    console.log(`🎯 스마트 에이전트 선택: ${config.subAgents.join(', ')}`);

    return await this.orchestrator.executeEnhancedAgentWorkflow({
      masterAgent: 'claude-code',
      subAgents: config.subAgents,
      mcpTools: config.mcpTools,
      task,
      parallelExecution: true,
      maxConcurrency: config.maxConcurrency,
      smartCoordination: true,
      ...config
    });
  }

  /**
   * /rapid - 초고속 실행 모드 (1-2개 병렬)
   * 단순하고 빠른 작업 집중 처리
   */
  async executeRapidMode(task, options = {}) {
    console.log('⚡ RAPID MODE: 초고속 실행 모드');
    
    const config = {
      maxConcurrency: 2,
      mcpTools: [this.mcpTools.FILESYSTEM], // 빠른 파일 작업 위주
      subAgents: await this.selectRapidAgents(task),
      executionMode: ExecutionMode.SPEED_FIRST,
      skipDetailedAnalysis: true,
      timeout: 3 * 60 * 1000 // 3분 제한
    };

    return await this.orchestrator.executeEnhancedAgentWorkflow({
      masterAgent: 'claude-code',
      subAgents: config.subAgents,
      mcpTools: config.mcpTools,
      task,
      parallelExecution: false, // 빠른 순차 실행
      maxConcurrency: config.maxConcurrency,
      speedOptimized: true,
      ...config
    });
  }

  /**
   * /deep - 심층 분석 모드 (Sequential Thinking 집중)
   * 복잡한 문제 단계별 해결
   */
  async executeDeepMode(task, options = {}) {
    console.log('🔍 DEEP MODE: 심층 분석 모드 실행');
    
    const config = {
      maxConcurrency: 1, // 집중적 순차 처리
      mcpTools: [
        this.mcpTools.SEQUENTIAL_THINKING,
        this.mcpTools.CONTEXT7,
        this.mcpTools.MEMORY
      ],
      subAgents: [this.subAgents.CLAUDE_GUIDE, this.subAgents.DEBUG],
      executionMode: ExecutionMode.DEEP_ANALYSIS,
      enableSequentialThinking: true,
      detailedDocumentation: true,
      timeout: 45 * 60 * 1000 // 45분
    };

    // Sequential Thinking으로 단계별 분석
    const deepAnalysis = await this.mcpSystem.executeMCPIntegratedTask(
      `심층 분석: ${task}`,
      { 
        mcpTools: [this.mcpTools.SEQUENTIAL_THINKING],
        enableDeepThinking: true,
        steps: ['문제 정의', '요구사항 분석', '해결책 설계', '구현 계획', '검증 방법']
      }
    );

    config.deepAnalysisResult = deepAnalysis;

    return await this.orchestrator.executeEnhancedAgentWorkflow({
      masterAgent: 'claude-code',
      subAgents: config.subAgents,
      mcpTools: config.mcpTools,
      task,
      parallelExecution: false, // 순차적 심층 분석
      deepAnalysis: deepAnalysis,
      ...config
    });
  }

  /**
   * /sync - 실시간 동기화 모드
   * GitHub + Memory + Filesystem 집중 활용
   */
  async executeSyncMode(task, options = {}) {
    console.log('🔄 SYNC MODE: 실시간 동기화 모드 실행');
    
    const config = {
      maxConcurrency: 4,
      mcpTools: [
        this.mcpTools.GITHUB,
        this.mcpTools.MEMORY,
        this.mcpTools.FILESYSTEM
      ],
      subAgents: [
        this.subAgents.API_DOCUMENTATION,
        this.subAgents.TROUBLESHOOTING
      ],
      executionMode: ExecutionMode.SYNC_FIRST,
      autoSync: true,
      autoCommit: true,
      autoDocUpdate: true
    };

    // 프로젝트 상태 동기화 선행 작업
    const syncPrecheck = await this.mcpSystem.executeMCPIntegratedTask(
      '프로젝트 동기화 상태 확인',
      { 
        mcpTools: [this.mcpTools.FILESYSTEM, this.mcpTools.GITHUB],
        autoSync: true
      }
    );

    config.syncPrecheck = syncPrecheck;

    return await this.orchestrator.executeEnhancedAgentWorkflow({
      masterAgent: 'claude-code',
      subAgents: config.subAgents,
      mcpTools: config.mcpTools,
      task,
      parallelExecution: true,
      maxConcurrency: config.maxConcurrency,
      syncMode: true,
      ...config
    });
  }

  /**
   * 작업 복잡도 분석
   */
  async analyzeTaskComplexity(task) {
    const keywords = {
      high: ['아키텍처', '리팩토링', '전체', '시스템', '최적화', '구현', '설계'],
      medium: ['개선', '수정', '업데이트', '통합', '분석'],
      low: ['수정', '변경', '추가', '삭제', '간단']
    };

    let score = 0;
    const taskLower = task.toLowerCase();

    // 키워드 기반 점수 계산
    keywords.high.forEach(keyword => {
      if (taskLower.includes(keyword)) score += 3;
    });
    keywords.medium.forEach(keyword => {
      if (taskLower.includes(keyword)) score += 2;
    });
    keywords.low.forEach(keyword => {
      if (taskLower.includes(keyword)) score += 1;
    });

    return {
      score: Math.min(score, 10),
      level: score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low',
      estimatedTime: score >= 8 ? '15-30분' : score >= 5 ? '5-15분' : '1-5분'
    };
  }

  /**
   * 자동 분석 및 최적화 전략 선택
   */
  async analyzeAndOptimize(task) {
    const taskLower = task.toLowerCase();
    
    // 작업 유형별 최적화 전략
    if (taskLower.includes('seo') || taskLower.includes('검색')) {
      return {
        strategy: 'SEO_OPTIMIZATION',
        recommendedMCPTools: [this.mcpTools.CONTEXT7, this.mcpTools.FILESYSTEM, this.mcpTools.MEMORY],
        recommendedAgents: [this.subAgents.GOOGLE_SEO, this.subAgents.API_DOCUMENTATION]
      };
    }
    
    if (taskLower.includes('버그') || taskLower.includes('에러') || taskLower.includes('오류')) {
      return {
        strategy: 'DEBUG_FOCUS',
        recommendedMCPTools: [this.mcpTools.SEQUENTIAL_THINKING, this.mcpTools.FILESYSTEM],
        recommendedAgents: [this.subAgents.DEBUG, this.subAgents.TROUBLESHOOTING]
      };
    }
    
    if (taskLower.includes('문서') || taskLower.includes('api')) {
      return {
        strategy: 'DOCUMENTATION_FOCUS',
        recommendedMCPTools: [this.mcpTools.CONTEXT7, this.mcpTools.MEMORY, this.mcpTools.GITHUB],
        recommendedAgents: [this.subAgents.API_DOCUMENTATION, this.subAgents.CLAUDE_GUIDE]
      };
    }
    
    // 기본 균형 전략
    return {
      strategy: 'BALANCED_APPROACH',
      recommendedMCPTools: [this.mcpTools.CONTEXT7, this.mcpTools.FILESYSTEM, this.mcpTools.MEMORY],
      recommendedAgents: [this.subAgents.CLAUDE_GUIDE, this.subAgents.DEBUG, this.subAgents.API_DOCUMENTATION]
    };
  }

  /**
   * 스마트 에이전트 선택 로직
   */
  async selectSmartAgents(task) {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('ui') || taskLower.includes('컴포넌트')) {
      return [this.subAgents.CLAUDE_GUIDE, this.subAgents.API_DOCUMENTATION];
    }
    
    if (taskLower.includes('성능') || taskLower.includes('최적화')) {
      return [this.subAgents.DEBUG, this.subAgents.GOOGLE_SEO];
    }
    
    return [this.subAgents.CLAUDE_GUIDE, this.subAgents.TROUBLESHOOTING];
  }

  /**
   * 래피드 에이전트 선택 로직
   */
  async selectRapidAgents(task) {
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('버그') || taskLower.includes('긴급')) {
      return [this.subAgents.DEBUG];
    }
    
    return [this.subAgents.CLAUDE_GUIDE];
  }

  /**
   * 서브작업 생성 (복잡한 작업 분할)
   */
  createSubtasks(mainTask, analysisResult, maxSubtasks) {
    // Sequential Thinking 결과를 바탕으로 작업 분할
    const steps = analysisResult.steps || [];
    const subtasks = [];
    
    for (let i = 0; i < Math.min(steps.length, maxSubtasks); i++) {
      subtasks.push({
        id: `subtask_${i + 1}`,
        title: steps[i],
        description: `${mainTask}의 ${i + 1}단계: ${steps[i]}`,
        priority: i === 0 ? 'high' : 'medium',
        estimatedTime: '3-5분'
      });
    }
    
    return subtasks;
  }

  /**
   * 실행 결과 학습 및 저장
   */
  async learnFromExecution(command, task, result) {
    await this.mcpSystem.executeMCPIntegratedTask(
      '명령어 실행 결과 학습',
      {
        mcpTools: [this.mcpTools.MEMORY],
        storeKey: `command_execution_${command}`,
        data: {
          command,
          task,
          result,
          timestamp: new Date().toISOString(),
          performance: {
            executionTime: result.executionTime,
            success: result.success,
            efficiency: result.efficiency || 0.8
          }
        }
      }
    );
  }
}

module.exports = { CustomCommandHandler };