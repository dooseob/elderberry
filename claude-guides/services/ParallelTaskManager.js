/**
 * 병렬 작업 관리 시스템
 * 1-10개 병렬 작업 관리 및 최적화
 * 
 * @author Claude Code + MCP Integration
 * @version 2.0.0
 * @date 2025-07-29
 */

const { ExecutionMode, Priority, ComplexityLevel } = require('./types/CommandTypes');

class ParallelTaskManager {
  constructor() {
    this.activeTasks = new Map();
    this.taskQueue = [];
    this.maxConcurrency = 10;
    this.metrics = {
      totalExecuted: 0,
      successful: 0,
      failed: 0,
      averageTime: 0,
      peakConcurrency: 0
    };
  }

  /**
   * 병렬 작업 실행 메인 메서드
   * @param {Array} tasks - 실행할 작업 배열
   * @param {Object} config - 설정 옵션
   * @returns {Promise<Object>} 실행 결과
   */
  async executeParallelTasks(tasks, config = {}) {
    const startTime = Date.now();
    const maxConcurrency = Math.min(config.maxConcurrency || this.maxConcurrency, tasks.length);
    
    console.log(`🚀 병렬 작업 시작: ${tasks.length}개 작업, 최대 ${maxConcurrency}개 동시 실행`);
    
    // 작업 우선순위 정렬
    const sortedTasks = this.prioritizeTasks(tasks);
    
    // 의존성 그래프 생성
    const dependencyGraph = this.buildDependencyGraph(sortedTasks);
    
    const results = [];
    const errors = [];
    let completedTasks = 0;
    
    try {
      // 배치별 병렬 실행
      const batches = this.createExecutionBatches(dependencyGraph, maxConcurrency);
      
      for (const batch of batches) {
        console.log(`📦 배치 실행: ${batch.length}개 작업`);
        
        const batchPromises = batch.map(async (task) => {
          try {
            const result = await this.executeTask(task, config);
            results.push(result);
            completedTasks++;
            
            console.log(`✅ 작업 완료: ${task.id} (${completedTasks}/${tasks.length})`);
            return result;
            
          } catch (error) {
            console.error(`❌ 작업 실패: ${task.id}`, error);
            errors.push({ taskId: task.id, error: error.message });
            throw error;
          }
        });
        
        // 배치 단위로 대기
        await Promise.allSettled(batchPromises);
        
        // 다음 배치 진행 전 짧은 대기 (시스템 부하 방지)
        if (batch.length === maxConcurrency) {
          await this.delay(100);
        }
      }
      
      const totalTime = Date.now() - startTime;
      this.updateMetrics(tasks.length, results.length, errors.length, totalTime);
      
      return {
        success: errors.length === 0,
        totalTasks: tasks.length,
        completedTasks: results.length,
        failedTasks: errors.length,
        results,
        errors,
        executionTime: totalTime,
        averageTaskTime: totalTime / results.length,
        concurrency: maxConcurrency,
        efficiency: results.length / tasks.length
      };
      
    } catch (error) {
      console.error('❌ 병렬 작업 실행 중 오류:', error);
      throw error;
    }
  }

  /**
   * 개별 작업 실행
   */
  async executeTask(task, config) {
    const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    this.activeTasks.set(taskId, {
      ...task,
      startTime,
      status: 'running'
    });
    
    try {
      let result;
      
      // 작업 유형별 실행
      switch (task.type) {
        case 'mcp_task':
          result = await this.executeMCPTask(task, config);
          break;
        case 'agent_task':
          result = await this.executeAgentTask(task, config);
          break;
        case 'analysis_task':
          result = await this.executeAnalysisTask(task, config);
          break;
        case 'file_task':
          result = await this.executeFileTask(task, config);
          break;
        default:
          result = await this.executeGenericTask(task, config);
      }
      
      const executionTime = Date.now() - startTime;
      this.activeTasks.delete(taskId);
      
      return {
        taskId,
        success: true,
        result,
        executionTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.activeTasks.delete(taskId);
      
      throw {
        taskId,
        success: false,
        error: error.message,
        executionTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * MCP 작업 실행
   */
  async executeMCPTask(task, config) {
    const { MCPIntegratedAgentSystem } = require('./MCPIntegratedAgentSystem');
    const mcpSystem = new MCPIntegratedAgentSystem();
    
    return await mcpSystem.executeMCPIntegratedTask(task.description, {
      mcpTools: task.mcpTools || config.mcpTools || [],
      ...task.options
    });
  }

  /**
   * 에이전트 작업 실행
   */
  async executeAgentTask(task, config) {
    const { EnhancedAgentOrchestrator } = require('./EnhancedAgentOrchestrator');
    const orchestrator = new EnhancedAgentOrchestrator();
    
    return await orchestrator.executeEnhancedAgentWorkflow({
      masterAgent: 'claude-code',
      subAgents: task.agents || config.subAgents || [],
      mcpTools: task.mcpTools || config.mcpTools || [],
      task: task.description,
      ...task.options
    });
  }

  /**
   * 분석 작업 실행
   */
  async executeAnalysisTask(task, config) {
    // Sequential Thinking을 활용한 분석 작업
    const { MCPIntegratedAgentSystem } = require('./MCPIntegratedAgentSystem');
    const mcpSystem = new MCPIntegratedAgentSystem();
    
    return await mcpSystem.executeMCPIntegratedTask(task.description, {
      mcpTools: ['sequential-thinking', 'context7'],
      enableDeepThinking: true,
      ...task.options
    });
  }

  /**
   * 파일 작업 실행
   */
  async executeFileTask(task, config) {
    const { MCPIntegratedAgentSystem } = require('./MCPIntegratedAgentSystem');
    const mcpSystem = new MCPIntegratedAgentSystem();
    
    return await mcpSystem.executeMCPIntegratedTask(task.description, {
      mcpTools: ['filesystem'],
      filePaths: task.filePaths || [],
      ...task.options
    });
  }

  /**
   * 일반 작업 실행
   */
  async executeGenericTask(task, config) {
    // 기본 작업 실행 로직
    console.log(`🔧 일반 작업 실행: ${task.description}`);
    
    // 시뮬레이션된 작업 (실제로는 구체적인 로직 구현)
    await this.delay(task.estimatedTime || 1000);
    
    return {
      message: `작업 완료: ${task.description}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 작업 우선순위 정렬
   */
  prioritizeTasks(tasks) {
    const priorityOrder = {
      [Priority.CRITICAL]: 0,
      [Priority.HIGH]: 1,
      [Priority.MEDIUM]: 2,
      [Priority.LOW]: 3
    };
    
    return [...tasks].sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // 우선순위가 같으면 추정 시간이 짧은 것부터
      const aTime = a.estimatedTime || 5000;
      const bTime = b.estimatedTime || 5000;
      return aTime - bTime;
    });
  }

  /**
   * 의존성 그래프 생성
   */
  buildDependencyGraph(tasks) {
    const graph = new Map();
    
    tasks.forEach(task => {
      graph.set(task.id, {
        task,
        dependencies: task.dependencies || [],
        dependents: []
      });
    });
    
    // 역방향 의존성 관계 구성
    graph.forEach((node, taskId) => {
      node.dependencies.forEach(depId => {
        if (graph.has(depId)) {
          graph.get(depId).dependents.push(taskId);
        }
      });
    });
    
    return graph;
  }

  /**
   * 실행 배치 생성 (의존성 고려)
   */
  createExecutionBatches(dependencyGraph, maxConcurrency) {
    const batches = [];
    const completed = new Set();
    const remaining = new Set(dependencyGraph.keys());
    
    while (remaining.size > 0) {
      const batch = [];
      
      // 의존성이 모두 완료된 작업들 찾기
      for (const taskId of remaining) {
        const node = dependencyGraph.get(taskId);
        const canExecute = node.dependencies.every(depId => completed.has(depId));
        
        if (canExecute && batch.length < maxConcurrency) {
          batch.push(node.task);
          remaining.delete(taskId);
        }
      }
      
      if (batch.length === 0) {
        // 순환 의존성 또는 누락된 의존성 - 남은 작업 강제 실행
        const forceBatch = Array.from(remaining).slice(0, maxConcurrency).map(taskId => {
          remaining.delete(taskId);
          return dependencyGraph.get(taskId).task;
        });
        batches.push(forceBatch);
      } else {
        batches.push(batch);
        batch.forEach(task => completed.add(task.id));
      }
    }
    
    return batches;
  }

  /**
   * 메트릭 업데이트
   */
  updateMetrics(total, successful, failed, totalTime) {
    this.metrics.totalExecuted += total;
    this.metrics.successful += successful;
    this.metrics.failed += failed;
    this.metrics.averageTime = (this.metrics.averageTime + totalTime) / 2;
    this.metrics.peakConcurrency = Math.max(this.metrics.peakConcurrency, this.activeTasks.size);
  }

  /**
   * 현재 상태 조회
   */
  getStatus() {
    return {
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      metrics: this.metrics,
      peakConcurrency: this.metrics.peakConcurrency
    };
  }

  /**
   * 지연 함수
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { ParallelTaskManager };