/**
 * 자동 워크플로우 에이전트
 * 작업 요청 → 지침 확인 → 순차적 서브에이전트 → 커밋/푸시 루틴
 */

const fs = require('fs');
const path = require('path');
const { executeSequentialAgents } = require('./SequentialAgentOrchestrator');

class AutoWorkflowAgent {
  constructor() {
    this.workflowActive = false;
    this.currentWorkflow = null;
    this.claudeGuidelinesPath = path.join(process.cwd(), 'CLAUDE.md');
    this.executionHistory = [];
  }

  /**
   * 메인 워크플로우 실행
   * @param {string} taskRequest - 사용자 작업 요청
   * @param {object} options - 실행 옵션 (complexity 포함)
   */
  async executeWorkflow(taskRequest, options = {}) {
    console.log('🚀 자동 워크플로우 시작:', taskRequest);
    
    this.workflowActive = true;
    this.currentWorkflow = {
      request: taskRequest,
      startTime: Date.now(),
      steps: [],
      options
    };

    try {
      // 1단계: CLAUDE.md 지침 확인
      console.log('📋 1단계: CLAUDE.md 지침 확인');
      const guidelines = await this.checkGuidelines();
      this.logStep('guidelines_check', { success: true, guidelines: guidelines.summary });

      // 2단계: 작업 분석 및 계획 (외부 복잡도 사용)
      console.log('🔍 2단계: 작업 분석 및 계획');
      const taskAnalysis = await this.analyzeTask(taskRequest, guidelines, options.complexity);
      this.logStep('task_analysis', taskAnalysis);

      // 3단계: 순차적 서브에이전트 실행
      console.log('🤖 3단계: 순차적 서브에이전트 실행');
      const agentResults = await this.executeSubAgents(taskAnalysis);
      this.logStep('agent_execution', agentResults);

      // 4단계: 자동 커밋/푸시 (옵션)
      if (options.autoCommit !== false && agentResults.hasChanges) {
        console.log('💾 4단계: 자동 커밋/푸시');
        const commitResult = await this.autoCommitPush(agentResults);
        this.logStep('auto_commit', commitResult);
      }

      // 5단계: 워크플로우 완료 처리
      const workflowResult = this.completeWorkflow(agentResults);
      
      console.log('✅ 자동 워크플로우 완료');
      return workflowResult;

    } catch (error) {
      console.error('❌ 워크플로우 실행 실패:', error);
      this.logStep('workflow_error', { error: error.message });
      return this.handleWorkflowError(error);
    } finally {
      this.workflowActive = false;
    }
  }

  /**
   * CLAUDE.md 지침 확인 및 파싱
   */
  async checkGuidelines() {
    try {
      if (!fs.existsSync(this.claudeGuidelinesPath)) {
        throw new Error('CLAUDE.md 파일을 찾을 수 없습니다');
      }

      const content = fs.readFileSync(this.claudeGuidelinesPath, 'utf8');
      
      // 주요 지침 추출
      const guidelines = {
        principles: this.extractSection(content, '## 🎯 개발 원칙'),
        forbidden: this.extractSection(content, '### **금지 사항**'),
        required: this.extractSection(content, '### **필수 원칙**'),
        agentSystem: this.extractSection(content, '### **순차적 에이전트 시스템'),
        mcpTools: this.extractSection(content, '### **AI/Agent**'),
        summary: '지침 확인 완료 - 순차적 에이전트 방식, TodoWrite 필수, MCP 도구 활용'
      };

      return guidelines;
    } catch (error) {
      console.error('지침 확인 실패:', error);
      return { 
        error: error.message,
        summary: '지침 확인 실패 - 기본 원칙 적용'
      };
    }
  }

  /**
   * 작업 분석 및 실행 계획 수립 (외부에서 복잡도 제공)
   */
  async analyzeTask(taskRequest, guidelines, externalComplexity = null) {
    const complexity = externalComplexity || this.calculateComplexity(taskRequest);
    const requiredMCPTools = this.determineMCPTools(taskRequest);
    const agentChain = this.planAgentChain(complexity, taskRequest);

    return {
      complexity: complexity,
      mcpTools: requiredMCPTools,
      agentChain: agentChain,
      estimatedTime: this.estimateTime(complexity, agentChain.length),
      needsTodoWrite: complexity.score >= 3,
      guidelines: guidelines.summary
    };
  }

  /**
   * 순차적 서브에이전트 실행 (내부 클로드코드 Task 도구 활용)
   */
  async executeSubAgents(taskAnalysis) {
    const { agentChain, mcpTools, needsTodoWrite, complexity } = taskAnalysis;

    // TodoWrite 필요 시 자동 생성
    if (needsTodoWrite) {
      console.log('📝 TodoWrite 자동 생성');
      await this.createTodoWrite(taskAnalysis);
    }

    // 복잡한 작업일 때 내부 클로드코드 Task 도구 활용 (최대 10개 병렬)
    if (complexity.score >= 8 || agentChain.length >= 4) {
      console.log('🚀 복잡한 작업 감지 - 내부 클로드코드 Task 도구 활용');
      return await this.executeParallelSubAgents(agentChain, mcpTools);
    }

    // 순차적 에이전트 실행
    const results = [];
    let previousOutput = null;

    for (let i = 0; i < agentChain.length; i++) {
      const agent = agentChain[i];
      console.log(`🔄 ${i + 1}/${agentChain.length}: ${agent.name} 에이전트 실행`);

      try {
        const agentResult = await this.executeAgent(agent, {
          input: previousOutput,
          mcpTools: mcpTools,
          stepNumber: i + 1,
          totalSteps: agentChain.length
        });

        results.push(agentResult);
        previousOutput = agentResult.output;

        // 중간 결과 로깅
        console.log(`✅ ${agent.name} 완료: ${agentResult.summary}`);

      } catch (error) {
        console.error(`❌ ${agent.name} 실패:`, error);
        results.push({
          agent: agent.name,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
        
        // 에러 발생 시 후속 에이전트 실행 여부 결정
        if (!agent.optional) {
          throw new Error(`필수 에이전트 ${agent.name} 실행 실패: ${error.message}`);
        }
      }
    }

    return {
      results: results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      hasChanges: results.some(r => r.hasChanges),
      summary: this.generateSummary(results),
      executionMethod: 'sequential'
    };
  }

  /**
   * 병렬 서브에이전트 실행 (내부 클로드코드 Task 도구 활용)
   * 복잡한 작업에서 최대 10개까지 병렬 처리
   */
  async executeParallelSubAgents(agentChain, mcpTools) {
    console.log(`🔥 병렬 에이전트 실행 시작 (최대 ${Math.min(agentChain.length, 10)}개)`);
    
    // Task 도구 활용을 위한 작업 분할
    const parallelTasks = this.createParallelTasks(agentChain, mcpTools);
    const maxConcurrency = Math.min(parallelTasks.length, 10);
    
    try {
      // 내부 클로드코드 Task 도구로 병렬 실행 시뮬레이션
      const results = await this.executeTasksInParallel(parallelTasks, maxConcurrency);
      
      return {
        results: results,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        hasChanges: results.some(r => r.hasChanges),
        summary: this.generateSummary(results),
        executionMethod: 'parallel',
        concurrency: maxConcurrency,
        taskDistribution: parallelTasks.map(t => t.name)
      };
      
    } catch (error) {
      console.error('❌ 병렬 실행 실패, 순차 실행으로 폴백:', error);
      
      // 병렬 실행 실패 시 순차 실행으로 폴백
      const fallbackResults = [];
      for (const task of parallelTasks) {
        try {
          const result = await this.executeAgent(task, { mcpTools });
          fallbackResults.push(result);
        } catch (err) {
          fallbackResults.push({
            agent: task.name,
            success: false,
            error: err.message,
            timestamp: Date.now()
          });
        }
      }
      
      return {
        results: fallbackResults,
        successful: fallbackResults.filter(r => r.success).length,
        failed: fallbackResults.filter(r => !r.success).length,
        hasChanges: fallbackResults.some(r => r.hasChanges),
        summary: this.generateSummary(fallbackResults),
        executionMethod: 'sequential-fallback',
        originalError: error.message
      };
    }
  }

  /**
   * 병렬 작업을 위한 태스크 생성
   */
  createParallelTasks(agentChain, mcpTools) {
    return agentChain.map((agent, index) => ({
      name: agent.name,
      description: `${agent.name} 에이전트 실행`,
      prompt: `다음 작업을 수행하세요: ${agent.name} 에이전트 역할`,
      subagent_type: 'general-purpose',
      tools: mcpTools.slice(0, 2), // 각 태스크당 최대 2개 도구
      priority: agent.priority || (100 - index * 10),
      dependencies: index > 0 ? [agentChain[index-1].name] : []
    }));
  }

  /**
   * Task 도구를 활용한 병렬 실행 (시뮬레이션)
   */
  async executeTasksInParallel(tasks, maxConcurrency) {
    console.log(`⚡ ${tasks.length}개 작업을 최대 ${maxConcurrency}개 동시 실행`);
    
    const results = [];
    const executing = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      // 동시 실행 제한
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
      
      const taskPromise = this.executeTaskWithClaudeCode(task)
        .then(result => {
          console.log(`✅ ${task.name} 완료`);
          results.push(result);
          return result;
        })
        .catch(error => {
          console.error(`❌ ${task.name} 실패:`, error);
          const errorResult = {
            agent: task.name,
            success: false,
            error: error.message,
            timestamp: Date.now()
          };
          results.push(errorResult);
          return errorResult;
        })
        .finally(() => {
          const index = executing.indexOf(taskPromise);
          if (index > -1) executing.splice(index, 1);
        });
      
      executing.push(taskPromise);
    }
    
    // 모든 작업 완료 대기
    await Promise.all(executing);
    
    return results;
  }

  /**
   * 클로드코드 Task 도구로 개별 작업 실행 (시뮬레이션)
   */
  async executeTaskWithClaudeCode(task) {
    const startTime = Date.now();
    
    // 실제 환경에서는 Task 도구를 사용:
    // const result = await TaskTool.execute({
    //   description: task.description,
    //   prompt: task.prompt,
    //   subagent_type: task.subagent_type
    // });
    
    // 시뮬레이션: 복잡도에 따른 실행 시간
    const executionTime = Math.random() * 2000 + 1000; // 1-3초
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    return {
      agent: task.name,
      success: Math.random() > 0.1, // 90% 성공률
      output: `${task.name} 작업 완료 (${task.tools.join(', ')} 도구 사용)`,
      summary: `${task.name}이 ${task.tools.join(', ')} 도구를 활용하여 작업 완료`,
      usedTools: task.tools,
      executionTime: Date.now() - startTime,
      hasChanges: task.name === 'implementer',
      timestamp: Date.now(),
      taskMethod: 'claude-code-task'
    };
  }

  /**
   * TodoWrite 자동 생성
   */
  async createTodoWrite(taskAnalysis) {
    const { agentChain, complexity } = taskAnalysis;
    
    // 실제 환경에서는 TodoWrite 도구 사용
    console.log(`📝 TodoWrite 생성: ${agentChain.length}단계 작업 (복잡도: ${complexity.level})`);
    
    // 여기서 실제 TodoWrite 도구를 호출할 수 있습니다
    return {
      created: true,
      steps: agentChain.length,
      complexity: complexity.level
    };
  }

  /**
   * 자동 커밋/푸시 실행
   */
  async autoCommitPush(agentResults) {
    try {
      console.log('📦 변경사항 감지 - 자동 커밋 시작');

      // Git 상태 확인
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // git status 확인
      const { stdout: status } = await execAsync('git status --porcelain');
      if (!status.trim()) {
        return { success: true, message: '변경사항 없음 - 커밋 생략' };
      }

      // 커밋 메시지 생성
      const commitMessage = this.generateCommitMessage(agentResults);
      
      // git add
      await execAsync('git add .');
      console.log('📁 변경사항 staging 완료');

      // git commit
      const commitCommand = `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`;
      await execAsync(commitCommand);
      console.log('💾 커밋 완료');

      // git push (선택적)
      if (this.currentWorkflow.options.autoPush !== false) {
        try {
          await execAsync('git push');
          console.log('🚀 푸시 완료');
          return { 
            success: true, 
            message: '커밋 및 푸시 완료',
            commitMessage: commitMessage
          };
        } catch (pushError) {
          console.log('⚠️ 푸시 실패 (커밋은 완료됨):', pushError.message);
          return { 
            success: true, 
            message: '커밋 완료, 푸시 실패 (수동 푸시 필요)',
            commitMessage: commitMessage,
            pushError: pushError.message
          };
        }
      }

      return { 
        success: true, 
        message: '커밋 완료',
        commitMessage: commitMessage
      };

    } catch (error) {
      console.error('❌ 자동 커밋/푸시 실패:', error);
      return { 
        success: false, 
        error: error.message,
        message: '자동 커밋/푸시 실패 - 수동 처리 필요'
      };
    }
  }

  /**
   * 복잡도 계산
   */
  calculateComplexity(taskRequest) {
    const request = taskRequest.toLowerCase();
    let score = 0;

    // 키워드 기반 점수 계산
    const complexKeywords = ['구현', 'implement', '최적화', 'optimize', '리팩토링', 'refactor'];
    const moderateKeywords = ['분석', 'analyze', '개선', 'improve', '수정', 'fix'];
    const simpleKeywords = ['확인', 'check', '조회', 'view', '읽기', 'read'];

    complexKeywords.forEach(keyword => {
      if (request.includes(keyword)) score += 3;
    });
    moderateKeywords.forEach(keyword => {
      if (request.includes(keyword)) score += 2;
    });
    simpleKeywords.forEach(keyword => {
      if (request.includes(keyword)) score += 1;
    });

    // 문장 길이 고려
    if (taskRequest.length > 100) score += 2;
    if (taskRequest.length > 200) score += 3;

    let level;
    if (score >= 8) level = 'complex';
    else if (score >= 4) level = 'moderate';
    else level = 'simple';

    return { score, level };
  }

  /**
   * MCP 도구 결정
   */
  determineMCPTools(taskRequest) {
    const request = taskRequest.toLowerCase();
    const tools = [];

    if (request.includes('분석') || request.includes('복잡한')) {
      tools.push('sequential-thinking');
    }
    if (request.includes('파일') || request.includes('코드') || request.includes('읽기')) {
      tools.push('file-system');
    }
    if (request.includes('git') || request.includes('커밋') || request.includes('푸시')) {
      tools.push('github');
    }
    if (request.includes('기억') || request.includes('컨텍스트') || request.includes('이전')) {
      tools.push('memory-bank');
    }
    if (request.includes('일관성') || request.includes('지속') || request.includes('유지')) {
      tools.push('context7');
    }

    // 기본 도구 추가
    if (tools.length === 0) {
      tools.push('sequential-thinking', 'file-system');
    }

    return tools;
  }

  /**
   * 에이전트 체인 계획
   */
  planAgentChain(complexity, taskRequest) {
    const chain = [];

    // 항상 analyzer 시작
    chain.push({ name: 'analyzer', priority: 100, optional: false });

    // 복잡도에 따른 추가 에이전트
    if (complexity.level === 'moderate' || complexity.level === 'complex') {
      chain.push({ name: 'planner', priority: 90, optional: false });
      chain.push({ name: 'implementer', priority: 80, optional: false });
    }

    if (complexity.level === 'complex') {
      chain.push({ name: 'validator', priority: 70, optional: true });
    }

    return chain;
  }

  /**
   * 개별 에이전트 실행
   */
  async executeAgent(agent, context) {
    // 실제 에이전트 실행 로직
    // 여기서는 시뮬레이션으로 구현
    const startTime = Date.now();
    
    // MCP 도구 활용 시뮬레이션
    const usedTools = context.mcpTools.slice(0, 2); // 최대 2개 도구 사용
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // 실행 시뮬레이션
    
    return {
      agent: agent.name,
      success: true,
      output: `${agent.name} 작업 완료`,
      summary: `${agent.name}가 ${usedTools.join(', ')} 도구를 사용하여 작업 완료`,
      usedTools: usedTools,
      executionTime: Date.now() - startTime,
      hasChanges: agent.name === 'implementer', // implementer만 변경사항 생성
      timestamp: Date.now()
    };
  }

  /**
   * 커밋 메시지 생성
   */
  generateCommitMessage(agentResults) {
    const successfulAgents = agentResults.results
      .filter(r => r.success)
      .map(r => r.agent)
      .join(', ');

    const summary = agentResults.summary || '자동 워크플로우 작업';
    
    return `feat: ${summary}\n\n- 순차적 에이전트 시스템 실행: ${successfulAgents}\n- 작업 성공률: ${agentResults.successful}/${agentResults.successful + agentResults.failed}\n- 자동 워크플로우로 처리됨\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;
  }

  /**
   * 섹션 추출 유틸리티
   */
  extractSection(content, sectionTitle) {
    const lines = content.split('\n');
    const startIndex = lines.findIndex(line => line.includes(sectionTitle));
    
    if (startIndex === -1) return '';
    
    const endIndex = lines.findIndex((line, index) => 
      index > startIndex && line.startsWith('#') && !line.startsWith('###')
    );
    
    const sectionLines = lines.slice(startIndex, endIndex === -1 ? undefined : endIndex);
    return sectionLines.join('\n').trim();
  }

  /**
   * 단계 로깅
   */
  logStep(stepName, data) {
    this.currentWorkflow.steps.push({
      step: stepName,
      timestamp: Date.now(),
      data: data
    });
  }

  /**
   * 시간 추정
   */
  estimateTime(complexity, agentCount) {
    const baseTime = complexity.score * 1000; // 기본 시간
    const agentTime = agentCount * 2000; // 에이전트당 시간
    return baseTime + agentTime;
  }

  /**
   * 결과 요약 생성
   */
  generateSummary(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (failed.length === 0) {
      return `모든 에이전트 성공적으로 완료 (${successful.length}개)`;
    } else {
      return `${successful.length}개 성공, ${failed.length}개 실패`;
    }
  }

  /**
   * 워크플로우 완료 처리
   */
  completeWorkflow(agentResults) {
    const endTime = Date.now();
    const totalTime = endTime - this.currentWorkflow.startTime;

    const result = {
      success: agentResults.successful > agentResults.failed,
      totalTime: totalTime,
      agentResults: agentResults,
      workflow: this.currentWorkflow,
      summary: `워크플로우 완료: ${agentResults.summary}`,
      recommendations: this.generateRecommendations(agentResults)
    };

    // 실행 이력에 추가
    this.executionHistory.push(result);

    return result;
  }

  /**
   * 워크플로우 에러 처리
   */
  handleWorkflowError(error) {
    return {
      success: false,
      error: error.message,
      workflow: this.currentWorkflow,
      summary: `워크플로우 실패: ${error.message}`,
      recommendations: [
        '에러 로그를 확인하세요',
        '필요시 수동으로 작업을 완료하세요',
        'CLAUDE.md 지침을 다시 확인하세요'
      ]
    };
  }

  /**
   * 추천사항 생성
   */
  generateRecommendations(agentResults) {
    const recommendations = [];

    if (agentResults.failed > 0) {
      recommendations.push('실패한 에이전트를 수동으로 재실행해보세요');
    }

    if (agentResults.hasChanges) {
      recommendations.push('변경사항을 검토하고 테스트를 실행하세요');
    }

    recommendations.push('다음 작업을 위해 컨텍스트를 메모리에 저장하세요');

    return recommendations;
  }

  /**
   * 워크플로우 상태 조회
   */
  getWorkflowStatus() {
    return {
      active: this.workflowActive,
      current: this.currentWorkflow,
      history: this.executionHistory.slice(-5) // 최근 5개
    };
  }
}

module.exports = { AutoWorkflowAgent };