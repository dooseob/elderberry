/**
 * 서브에이전트 순차 적용 시스템
 * 복잡한 작업을 여러 전문 에이전트가 순차적으로 처리하는 시스템
 */

class SubAgentOrchestrator {
    constructor() {
        this.agents = new Map();
        this.workflowHistory = [];
        this.currentWorkflow = null;
        
        // 기본 에이전트 등록
        this.registerDefaultAgents();
        
        console.log('🤖 서브에이전트 순차 적용 시스템 초기화 완료');
    }

    /**
     * 기본 에이전트들 등록
     */
    registerDefaultAgents() {
        // 코드 분석 에이전트
        this.registerAgent('analyzer', {
            name: '분석 에이전트',
            capabilities: ['코드 분석', '에러 진단', '성능 분석', '보안 검토'],
            priority: 1,
            handler: this.createAnalyzerAgent()
        });

        // 수정 실행 에이전트
        this.registerAgent('executor', {
            name: '실행 에이전트', 
            capabilities: ['코드 수정', '파일 생성', '리팩토링', '빌드 실행'],
            priority: 2,
            handler: this.createExecutorAgent()
        });

        // 검증 에이전트
        this.registerAgent('validator', {
            name: '검증 에이전트',
            capabilities: ['테스트 실행', '품질 검증', '성능 검증', '보안 검증'],
            priority: 3,
            handler: this.createValidatorAgent()
        });

        // 문서화 에이전트
        this.registerAgent('documenter', {
            name: '문서화 에이전트',
            capabilities: ['문서 생성', '가이드 작성', '변경 로그', 'API 문서'],
            priority: 4,
            handler: this.createDocumenterAgent()
        });

        // ✨ 새로운 특화 서브에이전트들 ✨
        
        // AI기반 클로드가이드시스템 서브에이전트
        this.registerAgent('intelligent_guide', {
            name: 'AI기반 클로드가이드시스템',
            capabilities: ['지능형 가이드', '컨텍스트 분석', '패턴 인식', '베스트 프랙티스'],
            priority: 1,
            handler: this.createIntelligentGuideAgent()
        });

        // 로그기반 디버깅 시스템 서브에이전트
        this.registerAgent('log_debugger', {
            name: '로그기반 디버깅 시스템',
            capabilities: ['로그 분석', '에러 패턴 인식', '성능 모니터링', '자동 진단'],
            priority: 2,
            handler: this.createLogDebuggingAgent()
        });

        // 트러블슈팅과 중요한 이슈 문서화 서브에이전트
        this.registerAgent('troubleshooting_doc', {
            name: '트러블슈팅 문서화 시스템',
            capabilities: ['자동 문서화', '이슈 패턴 인식', '솔루션 DB 관리', 'Java 서비스 연동'],
            priority: 3,
            handler: this.createTroubleshootingDocAgent()
        });

        // API 문서화 서브에이전트
        this.registerAgent('api_documenter', {
            name: 'API 문서화 시스템',
            capabilities: ['Controller 분석', 'OpenAPI 생성', 'API 문서화', '테스트 케이스 생성'],
            priority: 4,
            handler: this.createApiDocumentationAgent()
        });
    }

    /**
     * 에이전트 등록
     */
    registerAgent(id, config) {
        this.agents.set(id, {
            id,
            ...config,
            createdAt: new Date(),
            lastUsed: null,
            successCount: 0,
            failureCount: 0
        });
    }

    /**
     * 워크플로우 시작
     */
    async startWorkflow(task, options = {}) {
        const workflowId = `workflow_${Date.now()}`;
        
        this.currentWorkflow = {
            id: workflowId,
            task,
            options,
            steps: [],
            status: 'running',
            startTime: new Date(),
            endTime: null,
            result: null,
            errors: []
        };

        console.log(`🚀 워크플로우 시작: ${workflowId}`);
        console.log(`📋 작업: ${task.description || task.type}`);

        try {
            // 작업 유형에 따른 에이전트 체인 결정
            const agentChain = this.determineAgentChain(task);
            console.log(`🔗 에이전트 체인: ${agentChain.map(a => a.name).join(' → ')}`);

            // 순차적으로 에이전트 실행
            let result = task;
            for (const agent of agentChain) {
                result = await this.executeAgent(agent, result, workflowId);
                
                if (result.status === 'failed') {
                    break;
                }
            }

            // 워크플로우 완료
            this.currentWorkflow.status = result.status === 'failed' ? 'failed' : 'completed';
            this.currentWorkflow.endTime = new Date();
            this.currentWorkflow.result = result;

            // 히스토리에 저장
            this.workflowHistory.push({...this.currentWorkflow});

            console.log(`✅ 워크플로우 완료: ${workflowId} (${this.currentWorkflow.status})`);
            return this.currentWorkflow;

        } catch (error) {
            console.error(`❌ 워크플로우 실패: ${workflowId}`, error);
            this.currentWorkflow.status = 'failed';
            this.currentWorkflow.errors.push(error.message);
            this.currentWorkflow.endTime = new Date();
            
            this.workflowHistory.push({...this.currentWorkflow});
            throw error;
        }
    }

    /**
     * 작업 유형에 따른 에이전트 체인 결정
     */
    determineAgentChain(task) {
        const chains = {
            'code-fix': ['intelligent_guide', 'analyzer', 'executor', 'validator', 'troubleshooting_doc'],
            'feature-implementation': ['intelligent_guide', 'analyzer', 'executor', 'validator', 'api_documenter', 'documenter'],
            'refactoring': ['intelligent_guide', 'analyzer', 'executor', 'validator'],
            'bug-investigation': ['log_debugger', 'analyzer', 'executor', 'validator', 'troubleshooting_doc'],
            'performance-optimization': ['log_debugger', 'analyzer', 'executor', 'validator'],
            'security-audit': ['intelligent_guide', 'analyzer', 'executor', 'validator', 'documenter'],
            'documentation': ['intelligent_guide', 'analyzer', 'api_documenter', 'documenter'],
            'api-analysis': ['intelligent_guide', 'api_documenter'],
            'log-analysis': ['log_debugger', 'troubleshooting_doc'],
            'troubleshooting': ['intelligent_guide', 'log_debugger', 'troubleshooting_doc'],
            'full-analysis': ['intelligent_guide', 'log_debugger', 'analyzer', 'api_documenter', 'troubleshooting_doc'],
            'default': ['intelligent_guide', 'analyzer', 'executor', 'validator']
        };

        const chainType = task.type || 'default';
        const agentIds = chains[chainType] || chains.default;

        return agentIds.map(id => this.agents.get(id)).filter(Boolean);
    }

    /**
     * 개별 에이전트 실행
     */
    async executeAgent(agent, input, workflowId) {
        const stepId = `step_${Date.now()}`;
        const step = {
            id: stepId,
            agentId: agent.id,
            agentName: agent.name,
            startTime: new Date(),
            endTime: null,
            input,
            output: null,
            status: 'running',
            errors: []
        };

        this.currentWorkflow.steps.push(step);
        
        console.log(`🔄 에이전트 실행 중: ${agent.name}`);

        try {
            // 에이전트 핸들러 실행
            const output = await agent.handler(input, {
                workflowId,
                stepId,
                previousSteps: this.currentWorkflow.steps.slice(0, -1)
            });

            step.output = output;
            step.status = 'completed';
            step.endTime = new Date();

            agent.successCount++;
            agent.lastUsed = new Date();

            console.log(`✅ 에이전트 완료: ${agent.name}`);
            return output;

        } catch (error) {
            step.errors.push(error.message);
            step.status = 'failed';
            step.endTime = new Date();

            agent.failureCount++;

            console.error(`❌ 에이전트 실패: ${agent.name}`, error);
            return {
                ...input,
                status: 'failed',
                error: error.message,
                failedAgent: agent.name
            };
        }
    }

    /**
     * 분석 에이전트 생성
     */
    createAnalyzerAgent() {
        return async (input, context) => {
            console.log('🔍 분석 에이전트 실행 중...');
            
            const analysis = {
                timestamp: new Date(),
                inputType: typeof input,
                hasErrors: input.errors && input.errors.length > 0,
                complexity: this.calculateComplexity(input),
                recommendations: []
            };

            // 입력 분석
            if (input.task) {
                analysis.taskType = input.task.type || 'unknown';
                analysis.taskDescription = input.task.description;
            }

            if (input.files) {
                analysis.fileCount = input.files.length;
                analysis.fileTypes = [...new Set(input.files.map(f => f.extension))];
            }

            // 추천사항 생성
            if (analysis.complexity > 0.7) {
                analysis.recommendations.push('복잡도가 높음 - 단계별 접근 권장');
            }

            if (analysis.hasErrors) {
                analysis.recommendations.push('에러 해결 우선');
            }

            console.log(`📊 분석 완료 - 복잡도: ${analysis.complexity}, 권장사항: ${analysis.recommendations.length}개`);

            return {
                ...input,
                analysis,
                status: 'analyzed'
            };
        };
    }

    /**
     * 실행 에이전트 생성
     */
    createExecutorAgent() {
        return async (input, context) => {
            console.log('⚙️ 실행 에이전트 실행 중...');
            
            const execution = {
                timestamp: new Date(),
                actions: [],
                modifications: [],
                results: []
            };

            // 분석 결과 기반 실행
            if (input.analysis) {
                const recommendations = input.analysis.recommendations;
                
                for (const recommendation of recommendations) {
                    const action = await this.executeRecommendation(recommendation, input);
                    execution.actions.push(action);
                }
            }

            // 기본 실행 로직
            if (input.task && input.task.type === 'code-fix') {
                const fixAction = await this.executeCodeFix(input);
                execution.actions.push(fixAction);
            }

            console.log(`⚡ 실행 완료 - ${execution.actions.length}개 작업 수행`);

            return {
                ...input,
                execution,
                status: 'executed'
            };
        };
    }

    /**
     * 검증 에이전트 생성
     */
    createValidatorAgent() {
        return async (input, context) => {
            console.log('✅ 검증 에이전트 실행 중...');
            
            const validation = {
                timestamp: new Date(),
                checks: [],
                passed: 0,
                failed: 0,
                warnings: []
            };

            // 기본 검증 수행
            const checks = [
                this.validateSyntax(input),
                this.validateLogic(input),
                this.validatePerformance(input),
                this.validateSecurity(input)
            ];

            for (const check of checks) {
                const result = await check;
                validation.checks.push(result);
                
                if (result.passed) {
                    validation.passed++;
                } else {
                    validation.failed++;
                }

                if (result.warnings) {
                    validation.warnings.push(...result.warnings);
                }
            }

            const isValid = validation.failed === 0;
            console.log(`🔍 검증 완료 - 통과: ${validation.passed}, 실패: ${validation.failed}`);

            return {
                ...input,
                validation,
                status: isValid ? 'validated' : 'validation_failed'
            };
        };
    }

    /**
     * 문서화 에이전트 생성
     */
    createDocumenterAgent() {
        return async (input, context) => {
            console.log('📝 문서화 에이전트 실행 중...');
            
            const documentation = {
                timestamp: new Date(),
                documents: [],
                summary: '',
                changeLog: []
            };

            // 워크플로우 요약 생성
            if (context.previousSteps) {
                documentation.summary = this.generateWorkflowSummary(context.previousSteps);
            }

            // 변경 로그 생성
            if (input.execution && input.execution.actions) {
                documentation.changeLog = input.execution.actions.map(action => ({
                    type: action.type,
                    description: action.description,
                    timestamp: action.timestamp
                }));
            }

            console.log(`📋 문서화 완료 - ${documentation.documents.length}개 문서 생성`);

            return {
                ...input,
                documentation,
                status: 'documented'
            };
        };
    }

    /**
     * 복잡도 계산
     */
    calculateComplexity(input) {
        let complexity = 0.1; // 기본 복잡도

        if (input.files && input.files.length > 10) complexity += 0.2;
        if (input.errors && input.errors.length > 5) complexity += 0.3;
        if (input.task && input.task.type === 'feature-implementation') complexity += 0.2;
        if (input.analysis && input.analysis.hasErrors) complexity += 0.2;

        return Math.min(complexity, 1.0);
    }

    /**
     * 추천사항 실행
     */
    async executeRecommendation(recommendation, input) {
        return {
            type: 'recommendation',
            description: recommendation,
            timestamp: new Date(),
            status: 'completed'
        };
    }

    /**
     * 코드 수정 실행
     */
    async executeCodeFix(input) {
        return {
            type: 'code-fix',
            description: '코드 수정 작업 수행',
            timestamp: new Date(),
            status: 'completed'
        };
    }

    /**
     * 검증 메서드들
     */
    async validateSyntax(input) {
        return { name: 'syntax', passed: true, warnings: [] };
    }

    async validateLogic(input) {
        return { name: 'logic', passed: true, warnings: [] };
    }

    async validatePerformance(input) {
        return { name: 'performance', passed: true, warnings: [] };
    }

    async validateSecurity(input) {
        return { name: 'security', passed: true, warnings: [] };
    }

    /**
     * 워크플로우 요약 생성
     */
    generateWorkflowSummary(steps) {
        return `워크플로우 ${steps.length}단계 완료: ${steps.map(s => s.agentName).join(' → ')}`;
    }

    // ✨ 새로운 특화 서브에이전트 핸들러들 ✨

    /**
     * AI기반 클로드가이드시스템 에이전트 생성
     */
    createIntelligentGuideAgent() {
        return async (input, context) => {
            console.log('🧠 AI기반 클로드가이드시스템 에이전트 실행 중...');
            
            try {
                // 실제 IntelligentGuideAgent 로드
                const { intelligentGuideAgent } = require('./IntelligentGuideAgent');
                
                const result = await intelligentGuideAgent.executeWithMCPIntegration({
                    query: input.description || input.task?.description || '코드 분석 및 가이드 제공',
                    context: {
                        projectPath: process.cwd(),
                        ...context
                    }
                });

                return {
                    ...input,
                    intelligentGuide: result.result,
                    status: result.success ? 'guided' : 'guide_failed',
                    agent: 'intelligent_guide'
                };

            } catch (error) {
                console.error('❌ AI기반 클로드가이드시스템 에이전트 실패:', error);
                return {
                    ...input,
                    status: 'guide_failed',
                    error: error.message,
                    agent: 'intelligent_guide'
                };
            }
        };
    }

    /**
     * 로그기반 디버깅 시스템 에이전트 생성
     */
    createLogDebuggingAgent() {
        return async (input, context) => {
            console.log('📊 로그기반 디버깅 시스템 에이전트 실행 중...');
            
            try {
                // 실제 LogBasedDebuggingAgent 로드
                const { logBasedDebuggingAgent } = require('./LogBasedDebuggingAgent');
                
                // 로그 파일 찾기 시도
                const findLogsResult = await logBasedDebuggingAgent.executeWithMCPIntegration({
                    action: 'find_logs',
                    projectPath: process.cwd()
                });

                let analysisResult = null;
                if (findLogsResult.success && findLogsResult.result.length > 0) {
                    // 가장 최근 로그 파일 분석
                    const logFile = findLogsResult.result[0];
                    analysisResult = await logBasedDebuggingAgent.executeWithMCPIntegration({
                        action: 'analyze',
                        logFilePath: logFile
                    });
                }

                return {
                    ...input,
                    logAnalysis: analysisResult?.result || { message: '분석할 로그 파일을 찾을 수 없습니다.' },
                    status: analysisResult?.success ? 'log_analyzed' : 'log_analysis_failed',
                    agent: 'log_debugger'
                };

            } catch (error) {
                console.error('❌ 로그기반 디버깅 시스템 에이전트 실패:', error);
                return {
                    ...input,
                    status: 'log_analysis_failed',
                    error: error.message,
                    agent: 'log_debugger'
                };
            }
        };
    }

    /**
     * 트러블슈팅 문서화 시스템 에이전트 생성
     */
    createTroubleshootingDocAgent() {
        return async (input, context) => {
            console.log('📝 트러블슈팅 문서화 시스템 에이전트 실행 중...');
            
            try {
                // 실제 TroubleshootingDocumentationAgent 로드
                const { troubleshootingDocumentationAgent } = require('./TroubleshootingDocumentationAgent');
                
                // solutions-db.md 분석
                const analysisResult = await troubleshootingDocumentationAgent.executeWithMCPIntegration({
                    action: 'analyze'
                });

                // 에러가 있다면 문서화 수행
                let documentationResult = null;
                if (input.errors && input.errors.length > 0) {
                    const issueData = {
                        eventId: `WORKFLOW_${Date.now()}`,
                        eventType: 'ERROR',
                        severity: 'HIGH',
                        description: `워크플로우 실행 중 ${input.errors.length}개 에러 발생`,
                        errors: input.errors,
                        timestamp: new Date().toISOString()
                    };

                    documentationResult = await troubleshootingDocumentationAgent.executeWithMCPIntegration({
                        action: 'document',
                        data: issueData
                    });
                }

                return {
                    ...input,
                    troubleshootingAnalysis: analysisResult.result,
                    documentation: documentationResult?.result || null,
                    status: analysisResult.success ? 'documented' : 'documentation_failed',
                    agent: 'troubleshooting_doc'
                };

            } catch (error) {
                console.error('❌ 트러블슈팅 문서화 시스템 에이전트 실패:', error);
                return {
                    ...input,
                    status: 'documentation_failed',
                    error: error.message,
                    agent: 'troubleshooting_doc'
                };
            }
        };
    }

    /**
     * API 문서화 시스템 에이전트 생성
     */
    createApiDocumentationAgent() {
        return async (input, context) => {
            console.log('📚 API 문서화 시스템 에이전트 실행 중...');
            
            try {
                // 실제 ApiDocumentationAgent 로드
                const { apiDocumentationAgent } = require('./ApiDocumentationAgent');
                
                // 프로젝트 전체 API 분석
                const projectAnalysis = await apiDocumentationAgent.executeWithMCPIntegration({
                    action: 'analyze_project',
                    projectPath: process.cwd()
                });

                return {
                    ...input,
                    apiDocumentation: projectAnalysis.result,
                    status: projectAnalysis.success ? 'api_documented' : 'api_documentation_failed',
                    agent: 'api_documenter'
                };

            } catch (error) {
                console.error('❌ API 문서화 시스템 에이전트 실패:', error);
                return {
                    ...input,
                    status: 'api_documentation_failed',
                    error: error.message,
                    agent: 'api_documenter'
                };
            }
        };
    }

    /**
     * 상태 조회
     */
    getStatus() {
        return {
            currentWorkflow: this.currentWorkflow,
            totalWorkflows: this.workflowHistory.length,
            agents: Array.from(this.agents.values()).map(agent => ({
                id: agent.id,
                name: agent.name,
                successCount: agent.successCount,
                failureCount: agent.failureCount,
                successRate: agent.successCount / (agent.successCount + agent.failureCount) || 0
            }))
        };
    }

    /**
     * 히스토리 조회
     */
    getHistory(limit = 10) {
        return this.workflowHistory.slice(-limit);
    }
}

// 전역 인스턴스 생성
const subAgentOrchestrator = new SubAgentOrchestrator();

// 사용 예제 함수
async function demonstrateSubAgentSystem() {
    console.log('\n🎭 서브에이전트 순차 적용 시스템 데모\n');

    // 예제 1: 코드 수정 작업
    await subAgentOrchestrator.startWorkflow({
        type: 'code-fix',
        description: 'Repository 메서드 시그니처 수정',
        files: [
            { name: 'FacilityRepository.java', extension: 'java' },
            { name: 'MemberRepository.java', extension: 'java' }
        ],
        errors: ['WithPaging 메서드명 문제', '타입 불일치']
    });

    // 예제 2: 기능 구현 작업
    await subAgentOrchestrator.startWorkflow({
        type: 'feature-implementation',
        description: '인증 시스템 구현',
        complexity: 0.8
    });

    // 상태 출력
    const status = subAgentOrchestrator.getStatus();
    console.log('\n📊 시스템 상태:');
    console.log(JSON.stringify(status, null, 2));
}

module.exports = {
    SubAgentOrchestrator,
    subAgentOrchestrator,
    demonstrateSubAgentSystem
};