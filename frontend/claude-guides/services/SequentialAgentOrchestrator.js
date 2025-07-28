/**
 * 순차적 하위 에이전트 오케스트레이션 시스템
 * 복잡한 상호 호출 대신 명확한 단방향 플로우로 개선
 */

class SequentialAgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.executionLog = [];
    this.context = {};
  }

  /**
   * 에이전트 등록
   */
  registerAgent(name, config) {
    this.agents.set(name, {
      name,
      description: config.description,
      input: config.input || [],
      output: config.output || [],
      execute: config.execute,
      dependencies: config.dependencies || [],
      priority: config.priority || 0
    });
  }

  /**
   * 순차적 에이전트 실행
   */
  async executeSequential(taskDescription, requiredAgents = []) {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 순차적 에이전트 실행 시작: ${taskDescription}`);
      
      // 1. 에이전트 실행 순서 결정
      const executionOrder = this.determineExecutionOrder(requiredAgents);
      
      // 2. 각 에이전트를 순차적으로 실행
      const results = {};
      
      for (const agentName of executionOrder) {
        const agent = this.agents.get(agentName);
        if (!agent) continue;

        console.log(`📍 ${agentName} 에이전트 실행 중...`);
        
        try {
          // 이전 결과를 현재 에이전트의 입력으로 사용
          const input = this.prepareAgentInput(agent, results);
          const result = await this.executeAgent(agent, input);
          
          results[agentName] = result;
          
          // 실행 로그 기록
          this.executionLog.push({
            agent: agentName,
            timestamp: new Date().toISOString(),
            success: true,
            output: result
          });
          
          console.log(`✅ ${agentName} 완료`);
          
        } catch (error) {
          console.error(`❌ ${agentName} 실패:`, error);
          
          this.executionLog.push({
            agent: agentName,
            timestamp: new Date().toISOString(),
            success: false,
            error: error.message
          });
          
          // 에이전트 실패 시 처리 방식 결정
          if (agent.critical) {
            throw new Error(`중요 에이전트 ${agentName} 실패: ${error.message}`);
          }
          
          // 비중요 에이전트는 건너뛰고 계속 진행
          results[agentName] = { error: error.message, skipped: true };
        }
      }
      
      // 3. 최종 결과 통합
      const finalResult = this.aggregateResults(results);
      const executionTime = Date.now() - startTime;
      
      console.log(`🎉 순차적 실행 완료 (${executionTime}ms)`);
      
      return {
        success: true,
        executionTime,
        results: finalResult,
        log: this.executionLog
      };
      
    } catch (error) {
      console.error('🚨 순차적 실행 실패:', error);
      
      return {
        success: false,
        error: error.message,
        log: this.executionLog
      };
    }
  }

  /**
   * 에이전트 실행 순서 결정 (의존성 기반)
   */
  determineExecutionOrder(requiredAgents) {
    const visited = new Set();
    const result = [];
    
    const visit = (agentName) => {
      if (visited.has(agentName)) return;
      
      const agent = this.agents.get(agentName);
      if (!agent) return;
      
      // 의존성 먼저 방문
      for (const dep of agent.dependencies) {
        visit(dep);
      }
      
      visited.add(agentName);
      result.push(agentName);
    };
    
    // 우선순위 순으로 정렬 후 방문
    const sortedAgents = requiredAgents.sort((a, b) => {
      const agentA = this.agents.get(a);
      const agentB = this.agents.get(b);
      return (agentB?.priority || 0) - (agentA?.priority || 0);
    });
    
    sortedAgents.forEach(visit);
    
    return result;
  }

  /**
   * 에이전트 입력 준비
   */
  prepareAgentInput(agent, previousResults) {
    const input = {
      context: this.context,
      previousResults
    };
    
    // 의존성이 있는 경우 해당 결과를 직접 전달
    for (const dep of agent.dependencies) {
      if (previousResults[dep]) {
        input[dep] = previousResults[dep];
      }
    }
    
    return input;
  }

  /**
   * 개별 에이전트 실행
   */
  async executeAgent(agent, input) {
    if (typeof agent.execute === 'function') {
      return await agent.execute(input);
    }
    
    // Task 도구를 통한 실행
    return await this.executeViaMCP(agent, input);
  }

  /**
   * MCP Task를 통한 에이전트 실행
   */
  async executeViaMCP(agent, input) {
    const prompt = this.buildAgentPrompt(agent, input);
    
    // 실제 MCP Task 호출은 여기서 구현
    // 현재는 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      agent: agent.name,
      prompt: prompt,
      result: `${agent.name} 에이전트 실행 완료`,
      input: Object.keys(input)
    };
  }

  /**
   * 에이전트 프롬프트 구성
   */
  buildAgentPrompt(agent, input) {
    return `
${agent.description}

입력 데이터:
${JSON.stringify(input, null, 2)}

요구사항:
- ${agent.input.join('\n- ')}

출력 형식:
- ${agent.output.join('\n- ')}

이전 에이전트 결과를 참고하여 작업을 수행하고 명확한 결과를 반환해주세요.
    `.trim();
  }

  /**
   * 결과 통합
   */
  aggregateResults(results) {
    const successful = Object.entries(results).filter(([_, result]) => !result.error);
    const failed = Object.entries(results).filter(([_, result]) => result.error);
    
    return {
      summary: {
        total: Object.keys(results).length,
        successful: successful.length,
        failed: failed.length
      },
      successful: Object.fromEntries(successful),
      failed: Object.fromEntries(failed),
      recommendations: this.generateRecommendations(results)
    };
  }

  /**
   * 권장사항 생성
   */
  generateRecommendations(results) {
    const recommendations = [];
    
    // 실패한 에이전트가 있는 경우
    const failedAgents = Object.entries(results)
      .filter(([_, result]) => result.error)
      .map(([name, _]) => name);
    
    if (failedAgents.length > 0) {
      recommendations.push({
        type: 'retry',
        message: `실패한 에이전트 재실행 권장: ${failedAgents.join(', ')}`
      });
    }
    
    // 성공률이 낮은 경우
    const successRate = Object.values(results).filter(r => !r.error).length / Object.keys(results).length;
    if (successRate < 0.7) {
      recommendations.push({
        type: 'review',
        message: '성공률이 낮습니다. 에이전트 설정을 검토해주세요.'
      });
    }
    
    return recommendations;
  }

  /**
   * 실행 상태 조회
   */
  getExecutionStatus() {
    return {
      registeredAgents: Array.from(this.agents.keys()),
      executionLog: this.executionLog,
      lastExecution: this.executionLog[this.executionLog.length - 1]
    };
  }
}

// 기본 에이전트 설정
const agentConfigs = {
  analyzer: {
    description: "코드베이스 분석 및 이슈 파악",
    input: ["target_path", "analysis_type"],
    output: ["issues_found", "recommendations", "complexity_score"],
    dependencies: [],
    priority: 100,
    critical: true
  },
  
  planner: {
    description: "개선 계획 수립",
    input: ["analysis_results", "requirements"],
    output: ["action_plan", "priority_order", "estimated_time"],
    dependencies: ["analyzer"],
    priority: 90,
    critical: true
  },
  
  implementer: {
    description: "실제 코드 개선 작업 수행",
    input: ["action_plan", "target_files"],
    output: ["modified_files", "changes_summary", "test_results"],
    dependencies: ["planner"],
    priority: 80,
    critical: true
  },
  
  validator: {
    description: "개선 결과 검증 및 품질 확인",
    input: ["modified_files", "original_requirements"],
    output: ["validation_results", "quality_score", "remaining_issues"],
    dependencies: ["implementer"],
    priority: 70,
    critical: false
  },

  // ✨ 새로운 특화 서브에이전트들 ✨
  
  intelligent_guide: {
    description: "AI기반 지능형 가이드 및 컨텍스트 분석",
    input: ["query", "project_context"],
    output: ["contextual_analysis", "pattern_recommendations", "best_practices", "code_examples"],
    dependencies: [],
    priority: 110,
    critical: false,
    execute: async (input) => {
      try {
        const { intelligentGuideAgent } = require('../../claude-guides/services/IntelligentGuideAgent');
        return await intelligentGuideAgent.executeWithMCPIntegration(input);
      } catch (error) {
        return { success: false, error: error.message, agent: 'intelligent_guide' };
      }
    }
  },

  log_debugger: {
    description: "로그기반 디버깅 및 자동 진단",
    input: ["log_file_path", "analysis_options"],
    output: ["log_analysis", "error_patterns", "performance_metrics", "recommendations"],
    dependencies: [],
    priority: 95,
    critical: false,
    execute: async (input) => {
      try {
        const { logBasedDebuggingAgent } = require('../../claude-guides/services/LogBasedDebuggingAgent');
        return await logBasedDebuggingAgent.executeWithMCPIntegration(input);
      } catch (error) {
        return { success: false, error: error.message, agent: 'log_debugger' };
      }
    }
  },

  troubleshooting_doc: {
    description: "트러블슈팅 및 이슈 자동 문서화",
    input: ["issue_data", "documentation_type"],
    output: ["documentation", "issue_patterns", "solution_recommendations", "knowledge_base_update"],
    dependencies: ["log_debugger"],
    priority: 75,
    critical: false,
    execute: async (input) => {
      try {
        const { troubleshootingDocumentationAgent } = require('../../claude-guides/services/TroubleshootingDocumentationAgent');
        return await troubleshootingDocumentationAgent.executeWithMCPIntegration(input);
      } catch (error) {
        return { success: false, error: error.message, agent: 'troubleshooting_doc' };
      }
    }
  },

  api_documenter: {
    description: "API 자동 문서화 및 OpenAPI 스펙 생성",
    input: ["controller_files", "project_path"],
    output: ["api_documentation", "openapi_spec", "test_cases", "security_analysis"],
    dependencies: ["analyzer"],
    priority: 65,
    critical: false,
    execute: async (input) => {
      try {
        const { apiDocumentationAgent } = require('../../claude-guides/services/ApiDocumentationAgent');
        return await apiDocumentationAgent.executeWithMCPIntegration(input);
      } catch (error) {
        return { success: false, error: error.message, agent: 'api_documenter' };
      }
    }
  }
};

// 글로벌 오케스트레이터 인스턴스
const orchestrator = new SequentialAgentOrchestrator();

// 에이전트 등록
Object.entries(agentConfigs).forEach(([name, config]) => {
  orchestrator.registerAgent(name, config);
});

// 사용 예시 함수
async function executeSequentialAgents(taskDescription, agents = ['analyzer', 'planner', 'implementer', 'validator']) {
  console.log(`🔄 순차적 에이전트 시스템 실행: ${taskDescription}`);
  
  const result = await orchestrator.executeSequential(taskDescription, agents);
  
  if (result.success) {
    console.log('✅ 모든 에이전트 실행 완료');
    console.log('📊 실행 결과:', result.results.summary);
    
    if (result.results.recommendations.length > 0) {
      console.log('💡 권장사항:');
      result.results.recommendations.forEach(rec => {
        console.log(`  - ${rec.message}`);
      });
    }
  } else {
    console.error('❌ 에이전트 실행 실패:', result.error);
  }
  
  return result;
}

module.exports = {
  SequentialAgentOrchestrator,
  orchestrator,
  executeSequentialAgents
};