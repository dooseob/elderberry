/**
 * 커스텀 명령어 시스템 타입 정의
 * @author Claude Code + MCP Integration
 * @version 2.0.0
 * @date 2025-07-29
 */

/**
 * 실행 모드 정의
 */
const ExecutionMode = {
  PARALLEL_INTENSIVE: 'parallel_intensive',  // /max - 최대 10개 병렬
  BALANCED: 'balanced',                      // /auto - 5개 병렬 균형
  COLLABORATIVE: 'collaborative',            // /smart - 3개 협업
  SPEED_FIRST: 'speed_first',               // /rapid - 1-2개 고속
  DEEP_ANALYSIS: 'deep_analysis',           // /deep - 순차 심층
  SYNC_FIRST: 'sync_first'                  // /sync - 동기화 우선
};

/**
 * MCP 도구 타입 정의
 */
const MCPToolType = {
  SEQUENTIAL_THINKING: 'sequential-thinking',
  CONTEXT7: 'context7',
  MEMORY: 'memory',
  FILESYSTEM: 'filesystem',
  GITHUB: 'github'
};

/**
 * 서브에이전트 타입 정의
 */
const AgentType = {
  CLAUDE_GUIDE: 'CLAUDE_GUIDE',
  DEBUG: 'DEBUG',
  API_DOCUMENTATION: 'API_DOCUMENTATION',
  TROUBLESHOOTING: 'TROUBLESHOOTING',
  GOOGLE_SEO: 'GOOGLE_SEO'
};

/**
 * 작업 복잡도 레벨
 */
const ComplexityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EXTREME: 'extreme'
};

/**
 * 작업 우선순위
 */
const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * 실행 전략 타입
 */
const ExecutionStrategy = {
  SEO_OPTIMIZATION: 'seo_optimization',
  DEBUG_FOCUS: 'debug_focus',
  DOCUMENTATION_FOCUS: 'documentation_focus',
  PERFORMANCE_FOCUS: 'performance_focus',
  BALANCED_APPROACH: 'balanced_approach'
};

/**
 * 명령어 설정 인터페이스
 */
class CommandConfig {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 1;
    this.mcpTools = options.mcpTools || [];
    this.subAgents = options.subAgents || [];
    this.executionMode = options.executionMode || ExecutionMode.BALANCED;
    this.enableProgress = options.enableProgress || false;
    this.autoCommit = options.autoCommit || false;
    this.timeout = options.timeout || 10 * 60 * 1000; // 10분 기본
    this.strategy = options.strategy || ExecutionStrategy.BALANCED_APPROACH;
  }
}

/**
 * 실행 결과 인터페이스
 */
class ExecutionResult {
  constructor() {
    this.success = false;
    this.command = '';
    this.executionTime = 0;
    this.results = [];
    this.errors = [];
    this.metrics = {
      tasksCompleted: 0,
      tasksTotal: 0,
      efficiency: 0,
      parallelism: 1
    };
    this.recommendations = [];
  }
}

/**
 * 작업 분석 결과
 */
class TaskAnalysis {
  constructor() {
    this.complexity = ComplexityLevel.MEDIUM;
    this.estimatedTime = '5-10분';
    this.recommendedStrategy = ExecutionStrategy.BALANCED_APPROACH;
    this.requiredMCPTools = [];
    this.recommendedAgents = [];
    this.parallelizable = true;
    this.dependencies = [];
  }
}

module.exports = {
  ExecutionMode,
  MCPToolType,
  AgentType,
  ComplexityLevel,
  Priority,
  ExecutionStrategy,
  CommandConfig,
  ExecutionResult,
  TaskAnalysis
};