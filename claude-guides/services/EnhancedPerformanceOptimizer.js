/**
 * 엘더베리 프로젝트 - 향상된 성능 최적화 시스템
 * @version 2.0.0
 * @date 2025-08-01
 * @description 에이전트 시스템 성능 최적화 및 자동화 워크플로우 관리
 */

const { AGENT_MCP_OPTIMIZATION_CONFIG } = require('./AgentMCPMappingConfig');
const SQLiteAgentLogger = require('./SQLiteAgentLogger');

class EnhancedPerformanceOptimizer {
    constructor() {
        this.logger = new SQLiteAgentLogger();
        this.performanceThresholds = {
            EXCELLENT: 0.95,
            GOOD: 0.85,
            FAIR: 0.70,
            POOR: 0.50
        };
        
        this.optimizationStrategies = {
            SPEED: 'minimize_execution_time',
            QUALITY: 'maximize_result_accuracy',
            RESOURCE: 'optimize_resource_usage',
            BALANCED: 'balance_all_factors'
        };
        
        this.autoOptimizationEnabled = true;
        this.learningData = new Map();
        
        console.log('🚀 Enhanced Performance Optimizer v2.0.0 초기화 완료');
    }

    /**
     * 에이전트 성능 실시간 분석
     */
    async analyzeAgentPerformance(agentName, taskType, executionTime, success, mcpToolsUsed) {
        const performanceData = {
            timestamp: new Date().toISOString(),
            agentName,
            taskType,
            executionTime,
            success,
            mcpToolsUsed,
            performanceScore: this.calculatePerformanceScore(executionTime, success),
            resourceUsage: this.calculateResourceUsage(mcpToolsUsed),
            optimizationSuggestions: []
        };

        // 성능 데이터 로깅
        await this.logger.logAgentExecution(
            agentName, taskType, `Performance analysis: ${taskType}`, 
            null, mcpToolsUsed, false, success, 
            `Score: ${performanceData.performanceScore}`, executionTime
        );

        // 학습 데이터 축적
        this.accumulateLearningData(agentName, performanceData);

        // 실시간 최적화 제안
        if (this.autoOptimizationEnabled) {
            performanceData.optimizationSuggestions = await this.generateOptimizationSuggestions(performanceData);
        }

        return performanceData;
    }

    /**
     * 커스텀 명령어 성능 최적화
     */
    async optimizeCustomCommandExecution(command, taskDescription, options = {}) {
        console.log(`🔧 커스텀 명령어 성능 최적화: ${command}`);
        
        const startTime = Date.now();
        const commandConfig = AGENT_MCP_OPTIMIZATION_CONFIG.CUSTOM_COMMAND_OPTIMIZATION[command];
        
        if (!commandConfig) {
            throw new Error(`Unknown custom command: ${command}`);
        }

        // 성능 우선순위에 따른 최적화 전략 선택
        const optimizationStrategy = this.selectOptimizationStrategy(
            commandConfig.performance_priority, 
            options
        );

        // 에이전트 실행 순서 최적화
        const executionPlan = await this.createOptimizedExecutionPlan(
            commandConfig.agents,
            commandConfig.mcp_tools,
            commandConfig.parallel_execution,
            optimizationStrategy
        );

        // 실행 및 성능 모니터링
        const results = await this.executeOptimizedPlan(executionPlan, taskDescription);

        // 성과 분석 및 학습
        const totalTime = Date.now() - startTime;
        await this.analyzeCommandPerformance(command, executionPlan, results, totalTime);

        return {
            command,
            executionPlan,
            results,
            performance: {
                totalTime,
                strategy: optimizationStrategy,
                successRate: this.calculateSuccessRate(results),
                optimization: await this.getOptimizationRecommendations(command, results)
            }
        };
    }

    /**
     * MCP 도구 사용 패턴 최적화
     */
    async optimizeMCPToolUsage(agentName, availableTools, taskComplexity) {
        const historicalData = this.learningData.get(`${agentName}_mcp_patterns`) || [];
        const toolUsageStats = this.analyzeMCPToolEffectiveness(historicalData);

        // 작업 복잡도에 따른 도구 선택 최적화
        const optimizedTools = this.selectOptimalMCPTools(
            availableTools,
            taskComplexity,
            toolUsageStats
        );

        // 도구 실행 순서 최적화
        const executionSequence = this.optimizeMCPExecutionSequence(optimizedTools, taskComplexity);

        return {
            recommendedTools: optimizedTools,
            executionSequence,
            expectedPerformance: this.predictPerformance(optimizedTools, taskComplexity),
            reasoning: this.generateToolSelectionReasoning(optimizedTools, toolUsageStats)
        };
    }

    /**
     * 자동화 워크플로우 생성
     */
    async createAutomationWorkflow(taskType, requirements, constraints = {}) {
        console.log(`🤖 자동화 워크플로우 생성: ${taskType}`);

        const workflow = {
            id: `workflow_${Date.now()}`,
            taskType,
            requirements,
            constraints,
            steps: [],
            estimated_duration: 0,
            resource_requirements: {},
            success_probability: 0
        };

        // 요구사항 분석 및 워크플로우 단계 생성
        const analysisResult = await this.analyzeTaskRequirements(requirements);
        workflow.steps = await this.generateWorkflowSteps(analysisResult, constraints);

        // 각 단계별 에이전트 및 MCP 도구 할당
        for (const step of workflow.steps) {
            step.assignedAgent = await this.selectOptimalAgent(step.taskType, step.complexity);
            step.mcpTools = await this.selectOptimalMCPTools(
                AGENT_MCP_OPTIMIZATION_CONFIG.AGENT_MCP_COMBINATIONS[step.assignedAgent].primary,
                step.complexity,
                {}
            );
            step.estimatedDuration = this.estimateStepDuration(step);
        }

        // 전체 워크플로우 성능 예측
        workflow.estimated_duration = workflow.steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
        workflow.success_probability = this.calculateWorkflowSuccessProbability(workflow.steps);
        workflow.resource_requirements = this.calculateResourceRequirements(workflow.steps);

        // 워크플로우 최적화
        const optimizedWorkflow = await this.optimizeWorkflow(workflow);

        // 로깅
        await this.logger.logAgentExecution(
            'WORKFLOW_OPTIMIZER', 'workflow_creation', `Created workflow: ${taskType}`,
            null, ['sequential-thinking', 'memory'], false, true,
            `Steps: ${workflow.steps.length}, Duration: ${workflow.estimated_duration}ms`,
            Date.now() - workflow.id.split('_')[1]
        );

        return optimizedWorkflow;
    }

    /**
     * 실시간 성능 모니터링
     */
    startPerformanceMonitoring(intervalMs = 60000) {
        console.log(`📊 실시간 성능 모니터링 시작 (${intervalMs}ms 간격)`);

        this.monitoringInterval = setInterval(async () => {
            const systemStatus = this.logger.getSystemStatus();
            const performanceInsights = await this.generatePerformanceInsights(systemStatus);
            
            // 성능 저하 감지 및 자동 최적화
            if (systemStatus.systemHealth === 'NEEDS_ATTENTION') {
                console.log('⚠️ 성능 저하 감지 - 자동 최적화 시작');
                await this.executeAutomaticOptimization(systemStatus);
            }

            // 성능 리포트 생성
            const performanceReport = {
                timestamp: new Date().toISOString(),
                systemStatus,
                insights: performanceInsights,
                recommendations: await this.generatePerformanceRecommendations(systemStatus)
            };

            // 성능 메트릭 로깅
            await this.logger.logPerformanceMetric(
                'system_performance',
                systemStatus.performanceMetrics.averageExecutionTime,
                'ms',
                JSON.stringify(performanceReport)
            );

        }, intervalMs);
    }

    /**
     * 성능 모니터링 중지
     */
    stopPerformanceMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('📊 실시간 성능 모니터링 중지');
        }
    }

    // === 헬퍼 메서드들 ===

    calculatePerformanceScore(executionTime, success) {
        if (!success) return 0;
        
        // 기준 시간 대비 성능 점수 (10초 기준)
        const baseTime = 10000;
        const timeScore = Math.max(0, 1 - (executionTime / baseTime));
        return Math.min(1, timeScore);
    }

    calculateResourceUsage(mcpTools) {
        // MCP 도구별 리소스 사용량 추정
        const resourceWeights = {
            'sequential-thinking': 0.3,
            'context7': 0.2,
            'filesystem': 0.1,
            'memory': 0.15,
            'github': 0.1,
            'playwright': 0.4
        };

        return mcpTools.reduce((total, tool) => {
            return total + (resourceWeights[tool] || 0.1);
        }, 0);
    }

    accumulateLearningData(agentName, performanceData) {
        const key = `${agentName}_performance`;
        if (!this.learningData.has(key)) {
            this.learningData.set(key, []);
        }
        
        const data = this.learningData.get(key);
        data.push(performanceData);
        
        // 최근 100개 데이터만 유지
        if (data.length > 100) {
            data.shift();
        }
    }

    async generateOptimizationSuggestions(performanceData) {
        const suggestions = [];
        
        if (performanceData.executionTime > 15000) {
            suggestions.push('실행 시간이 길어 병렬 처리 검토 필요');
        }
        
        if (performanceData.resourceUsage > 0.8) {
            suggestions.push('리소스 사용량이 높아 MCP 도구 최적화 필요');
        }
        
        if (!performanceData.success) {
            suggestions.push('실행 실패 - 에러 패턴 분석 및 복구 전략 필요');
        }
        
        return suggestions;
    }

    selectOptimizationStrategy(performancePriority, options) {
        const strategies = {
            'MAXIMUM': 'SPEED',
            'HIGH': 'BALANCED',
            'QUALITY': 'QUALITY',
            'SPEED': 'SPEED',
            'DEPTH': 'QUALITY',
            'COLLABORATION': 'BALANCED'
        };
        
        return strategies[performancePriority] || 'BALANCED';
    }

    async createOptimizedExecutionPlan(agents, mcpTools, parallelExecution, strategy) {
        return {
            agents: agents.map(agent => ({
                name: agent,
                priority: this.getAgentPriority(agent, strategy),
                mcpTools: this.getOptimalMCPToolsForAgent(agent, mcpTools)
            })).sort((a, b) => b.priority - a.priority),
            parallelExecution,
            strategy,
            estimatedDuration: this.estimatePlanDuration(agents, mcpTools, parallelExecution)
        };
    }

    getAgentPriority(agentName, strategy) {
        const priorities = {
            'CLAUDE_GUIDE': { SPEED: 9, QUALITY: 10, BALANCED: 9 },
            'DEBUG': { SPEED: 10, QUALITY: 8, BALANCED: 9 },
            'API_DOCUMENTATION': { SPEED: 7, QUALITY: 9, BALANCED: 8 },
            'TROUBLESHOOTING': { SPEED: 8, QUALITY: 9, BALANCED: 8 },
            'GOOGLE_SEO': { SPEED: 6, QUALITY: 8, BALANCED: 7 },
            'SECURITY_AUDIT': { SPEED: 5, QUALITY: 10, BALANCED: 7 }
        };
        
        return priorities[agentName]?.[strategy] || 5;
    }

    getOptimalMCPToolsForAgent(agentName, availableTools) {
        const agentConfig = AGENT_MCP_OPTIMIZATION_CONFIG.AGENT_MCP_COMBINATIONS[agentName];
        if (!agentConfig) return availableTools.slice(0, 2);
        
        const primaryTools = agentConfig.primary.filter(tool => availableTools.includes(tool));
        const secondaryTools = agentConfig.secondary.filter(tool => availableTools.includes(tool));
        
        return [...primaryTools, ...secondaryTools].slice(0, 4); // 최대 4개 도구
    }

    estimatePlanDuration(agents, mcpTools, parallel) {
        const baseTime = 5000; // 5초 기본
        const agentMultiplier = parallel ? Math.log(agents.length) : agents.length;
        const toolMultiplier = mcpTools.length * 0.5;
        
        return baseTime * agentMultiplier * toolMultiplier;
    }

    async executeOptimizedPlan(executionPlan, taskDescription) {
        // 실제 구현에서는 에이전트들을 실행하고 결과를 수집
        return {
            success: true,
            results: executionPlan.agents.map(agent => ({
                agent: agent.name,
                success: Math.random() > 0.1, // 90% 성공률 시뮬레이션
                executionTime: Math.random() * 10000 + 2000,
                result: `${agent.name} completed ${taskDescription}`
            }))
        };
    }

    calculateSuccessRate(results) {
        const successful = results.results.filter(r => r.success).length;
        return successful / results.results.length;
    }

    async getOptimizationRecommendations(command, results) {
        const recommendations = [];
        const successRate = this.calculateSuccessRate(results);
        
        if (successRate < 0.8) {
            recommendations.push('성공률 개선을 위한 에러 핸들링 강화 필요');
        }
        
        const avgTime = results.results.reduce((sum, r) => sum + r.executionTime, 0) / results.results.length;
        if (avgTime > 10000) {
            recommendations.push('평균 실행 시간 단축을 위한 최적화 필요');
        }
        
        return recommendations;
    }
}

module.exports = EnhancedPerformanceOptimizer;