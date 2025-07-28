/**
 * 통합된 4개 서브에이전트 시스템
 * SubAgentOrchestrator.js와 SequentialAgentOrchestrator.js 통합
 * WSL2 환경에서 실제 동작하는 구현체
 */

const { subAgentOrchestrator } = require('./SubAgentOrchestrator');
const { orchestrator: sequentialOrchestrator } = require('../../frontend/claude-guides/services/SequentialAgentOrchestrator');
const { javaAgentBridge } = require('./JavaAgentBridge');

class IntegratedAgentSystem {
    constructor() {
        this.name = 'IntegratedAgentSystem';
        this.version = '2.0.0';
        this.activeMode = 'sequential'; // 'sequential' | 'workflow'
        this.executionHistory = [];
        
        console.log('🚀 통합된 4개 서브에이전트 시스템 초기화 완료');
        this.displaySystemInfo();
    }

    /**
     * 시스템 정보 표시
     */
    displaySystemInfo() {
        console.log('\n' + '='.repeat(80));
        console.log('🎯 Elderberry 통합 서브에이전트 시스템 v2.0');
        console.log('='.repeat(80));
        console.log('📋 구성된 특화 에이전트:');
        console.log('  1. 🧠 AI기반 클로드가이드시스템 - 지능형 가이드 및 컨텍스트 분석');
        console.log('  2. 📊 로그기반 디버깅 시스템 - Java 백엔드 로그 분석 및 진단');
        console.log('  3. 📝 트러블슈팅 문서화 시스템 - 자동 이슈 문서화 및 솔루션 DB 관리');
        console.log('  4. 📚 API 문서화 시스템 - Spring Boot Controller 분석 및 OpenAPI 생성');
        console.log('\n🔗 통합 지원:');
        console.log('  - SubAgentOrchestrator.js (워크플로우 기반)');
        console.log('  - SequentialAgentOrchestrator.js (순차 실행 기반)');
        console.log('  - Java TroubleshootingService.java 연동');
        console.log('  - MCP Task 도구 완전 연동');
        console.log('='.repeat(80) + '\n');
    }

    /**
     * 메인 실행 인터페이스
     */
    async execute(taskDescription, options = {}) {
        console.log(`🚀 통합 에이전트 시스템 실행: ${taskDescription}`);
        
        const execution = {
            id: `exec_${Date.now()}`,
            taskDescription,
            startTime: new Date(),
            mode: options.mode || this.activeMode,
            result: null,
            errors: [],
            agents: [],
            metadata: {}
        };

        try {
            // 작업 유형 자동 분석
            const taskType = this.analyzeTaskType(taskDescription);
            console.log(`🎯 감지된 작업 유형: ${taskType}`);

            // 실행 모드에 따른 처리
            if (execution.mode === 'workflow') {
                execution.result = await this.executeWorkflowMode(taskDescription, taskType, options);
            } else {
                execution.result = await this.executeSequentialMode(taskDescription, taskType, options);
            }

            execution.endTime = new Date();
            execution.duration = execution.endTime - execution.startTime;
            execution.success = true;

            // 실행 히스토리에 추가
            this.executionHistory.push(execution);

            console.log(`✅ 통합 시스템 실행 완료 (${execution.duration}ms)`);
            return execution;

        } catch (error) {
            execution.endTime = new Date();
            execution.duration = execution.endTime - execution.startTime;
            execution.success = false;
            execution.errors.push(error.message);

            console.error(`❌ 통합 시스템 실행 실패: ${error.message}`);
            this.executionHistory.push(execution);
            
            return execution;
        }
    }

    /**
     * 작업 유형 자동 분석
     */
    analyzeTaskType(taskDescription) {
        const description = taskDescription.toLowerCase();
        
        // 키워드 매칭을 통한 작업 유형 분류
        if (description.includes('repository') && description.includes('에러')) {
            return 'code-fix';
        }
        if (description.includes('로그') || description.includes('log')) {
            return 'log-analysis';
        }
        if (description.includes('api') || description.includes('controller')) {
            return 'api-analysis';
        }
        if (description.includes('문서') || description.includes('문서화')) {
            return 'documentation';
        }
        if (description.includes('버그') || description.includes('문제')) {
            return 'bug-investigation';
        }
        if (description.includes('성능') || description.includes('최적화')) {
            return 'performance-optimization';
        }
        if (description.includes('구현') || description.includes('기능')) {
            return 'feature-implementation';
        }
        if (description.includes('분석') && description.includes('전체')) {
            return 'full-analysis';
        }
        if (description.includes('트러블슈팅')) {
            return 'troubleshooting';
        }
        
        return 'default';
    }

    /**
     * 워크플로우 모드 실행 (SubAgentOrchestrator 사용)
     */
    async executeWorkflowMode(taskDescription, taskType, options) {
        console.log('🔄 워크플로우 모드로 실행 중...');
        
        const task = {
            type: taskType,
            description: taskDescription,
            files: options.files || [],
            errors: options.errors || [],
            ...options
        };

        const workflow = await subAgentOrchestrator.startWorkflow(task);
        return workflow;
    }

    /**
     * 순차 실행 모드 (SequentialAgentOrchestrator 사용)
     */
    async executeSequentialMode(taskDescription, taskType, options) {
        console.log('📝 순차 실행 모드로 실행 중...');
        
        // 작업 유형에 따른 에이전트 선택
        const agents = this.selectAgentsForTask(taskType);
        console.log(`🤖 선택된 에이전트: ${agents.join(', ')}`);

        const result = await sequentialOrchestrator.executeSequential(taskDescription, agents);
        return result;
    }

    /**
     * 작업 유형에 따른 에이전트 선택
     */
    selectAgentsForTask(taskType) {
        const agentMappings = {
            'code-fix': ['intelligent_guide', 'analyzer', 'troubleshooting_doc'],
            'log-analysis': ['log_debugger', 'troubleshooting_doc'],
            'api-analysis': ['intelligent_guide', 'api_documenter'],
            'documentation': ['intelligent_guide', 'api_documenter', 'troubleshooting_doc'],
            'bug-investigation': ['log_debugger', 'analyzer', 'troubleshooting_doc'],
            'performance-optimization': ['log_debugger', 'analyzer'],
            'feature-implementation': ['intelligent_guide', 'analyzer', 'api_documenter'],
            'full-analysis': ['intelligent_guide', 'log_debugger', 'analyzer', 'api_documenter', 'troubleshooting_doc'],
            'troubleshooting': ['intelligent_guide', 'log_debugger', 'troubleshooting_doc'],
            'default': ['intelligent_guide', 'analyzer']
        };

        return agentMappings[taskType] || agentMappings.default;
    }

    /**
     * 실행 모드 변경
     */
    setMode(mode) {
        if (['sequential', 'workflow'].includes(mode)) {
            this.activeMode = mode;
            console.log(`🔄 실행 모드 변경: ${mode}`);
        } else {
            throw new Error('지원되지 않는 모드입니다. sequential 또는 workflow를 사용하세요.');
        }
    }

    /**
     * 시스템 상태 조회
     */
    getSystemStatus() {
        const workflowStatus = subAgentOrchestrator.getStatus();
        
        // sequentialOrchestrator 상태 확인 (안전하게)
        let sequentialStatus = {};
        try {
            if (sequentialOrchestrator && typeof sequentialOrchestrator.getExecutionStatus === 'function') {
                sequentialStatus = sequentialOrchestrator.getExecutionStatus();
            } else {
                sequentialStatus = {
                    registeredAgents: Array.from(sequentialOrchestrator.agents?.keys() || []),
                    executionLog: sequentialOrchestrator.executionLog || [],
                    lastExecution: null
                };
            }
        } catch (error) {
            console.warn('Sequential orchestrator 상태 조회 실패:', error.message);
            sequentialStatus = {
                registeredAgents: [],
                executionLog: [],
                lastExecution: null
            };
        }

        return {
            name: this.name,
            version: this.version,
            activeMode: this.activeMode,
            executionHistory: this.executionHistory.length,
            lastExecution: this.executionHistory[this.executionHistory.length - 1],
            workflowSystem: {
                totalWorkflows: workflowStatus.totalWorkflows,
                agents: workflowStatus.agents.length,
                currentWorkflow: workflowStatus.currentWorkflow
            },
            sequentialSystem: {
                registeredAgents: Array.isArray(sequentialStatus.registeredAgents) ? sequentialStatus.registeredAgents.length : 0,
                executionLog: Array.isArray(sequentialStatus.executionLog) ? sequentialStatus.executionLog.length : 0,
                lastExecution: sequentialStatus.lastExecution
            },
            specializedAgents: {
                intelligentGuide: '🧠 AI기반 클로드가이드시스템',
                logDebugger: '📊 로그기반 디버깅 시스템',
                troubleshootingDoc: '📝 트러블슈팅 문서화 시스템',
                apiDocumenter: '📚 API 문서화 시스템'
            }
        };
    }

    /**
     * 에이전트별 성능 통계
     */
    getAgentPerformanceStats() {
        const stats = {
            totalExecutions: this.executionHistory.length,
            averageExecutionTime: 0,
            successRate: 0,
            agentUsage: {},
            taskTypeDistribution: {}
        };

        if (this.executionHistory.length === 0) {
            return stats;
        }

        // 평균 실행 시간 계산
        const totalTime = this.executionHistory.reduce((sum, exec) => sum + exec.duration, 0);
        stats.averageExecutionTime = Math.round(totalTime / this.executionHistory.length);

        // 성공률 계산
        const successes = this.executionHistory.filter(exec => exec.success).length;
        stats.successRate = Math.round((successes / this.executionHistory.length) * 100);

        // 에이전트 사용 통계
        this.executionHistory.forEach(exec => {
            if (exec.agents) {
                exec.agents.forEach(agent => {
                    stats.agentUsage[agent] = (stats.agentUsage[agent] || 0) + 1;
                });
            }
        });

        return stats;
    }

    /**
     * 최근 실행 이력 조회
     */
    getRecentExecutions(limit = 10) {
        return this.executionHistory
            .slice(-limit)
            .reverse()
            .map(exec => ({
                id: exec.id,
                taskDescription: exec.taskDescription,
                success: exec.success,
                duration: exec.duration,
                mode: exec.mode,
                timestamp: exec.startTime
            }));
    }
}

// 글로벌 인스턴스 생성
const integratedAgentSystem = new IntegratedAgentSystem();

/**
 * 편의 함수들
 */

// 간단한 실행 함수
async function executeTask(taskDescription, options = {}) {
    return await integratedAgentSystem.execute(taskDescription, options);
}

// 특정 모드로 실행
async function executeWithMode(taskDescription, mode, options = {}) {
    const originalMode = integratedAgentSystem.activeMode;
    integratedAgentSystem.setMode(mode);
    
    try {
        const result = await integratedAgentSystem.execute(taskDescription, options);
        integratedAgentSystem.setMode(originalMode);
        return result;
    } catch (error) {
        integratedAgentSystem.setMode(originalMode);
        throw error;
    }
}

// 전체 시스템 분석
async function performFullSystemAnalysis() {
    console.log('🔍 전체 시스템 분석 시작...');
    
    const tasks = [
        '프로젝트 컨텍스트 분석 및 가이드 제공',
        '로그 파일 분석 및 에러 패턴 감지',
        'API 문서화 및 OpenAPI 스펙 생성',
        'solutions-db.md 분석 및 트러블슈팅 문서 개선'
    ];

    const results = [];
    
    for (const task of tasks) {
        try {
            const result = await integratedAgentSystem.execute(task);
            results.push(result);
            console.log(`✅ 완료: ${task}`);
        } catch (error) {
            console.error(`❌ 실패: ${task} - ${error.message}`);
            results.push({ task, error: error.message, success: false });
        }
    }

    return {
        totalTasks: tasks.length,
        completedTasks: results.filter(r => r.success).length,
        results,
        summary: integratedAgentSystem.getSystemStatus()
    };
}

/**
 * 종합 테스트 함수
 */
async function testIntegratedSystem() {
    console.log('🧪 통합 서브에이전트 시스템 종합 테스트 시작');
    
    try {
        // 1. 시스템 상태 확인
        console.log('\n📋 1. 시스템 상태 확인');
        const status = integratedAgentSystem.getSystemStatus();
        console.log(`활성 모드: ${status.activeMode}`);
        console.log(`등록된 특화 에이전트: ${Object.keys(status.specializedAgents).length}개`);

        // 2. 각 작업 유형별 테스트
        const testCases = [
            { task: 'Repository 에러 수정', expected: 'code-fix' },
            { task: '로그 파일 분석', expected: 'log-analysis' },
            { task: 'API 문서화 생성', expected: 'api-analysis' },
            { task: '전체 시스템 분석', expected: 'full-analysis' }
        ];

        console.log('\n📋 2. 작업 유형 분석 테스트');
        testCases.forEach(testCase => {
            const detected = integratedAgentSystem.analyzeTaskType(testCase.task);
            const status = detected === testCase.expected ? '✅' : '❌';
            console.log(`${status} "${testCase.task}" → ${detected} (예상: ${testCase.expected})`);
        });

        // 3. 순차 실행 모드 테스트
        console.log('\n📋 3. 순차 실행 모드 테스트');
        integratedAgentSystem.setMode('sequential');
        const result1 = await integratedAgentSystem.execute('Spring Boot 프로젝트 코드 분석');
        console.log(`결과: ${result1.success ? '✅ 성공' : '❌ 실패'}`);

        // 4. 워크플로우 모드 테스트
        console.log('\n📋 4. 워크플로우 모드 테스트');
        integratedAgentSystem.setMode('workflow');
        const result2 = await integratedAgentSystem.execute('API 문서화 및 테스트 케이스 생성');
        console.log(`결과: ${result2.success ? '✅ 성공' : '❌ 실패'}`);

        // 5. 성능 통계 확인
        console.log('\n📋 5. 성능 통계');
        const stats = integratedAgentSystem.getAgentPerformanceStats();
        console.log(`총 실행 횟수: ${stats.totalExecutions}`);
        console.log(`평균 실행 시간: ${stats.averageExecutionTime}ms`);
        console.log(`성공률: ${stats.successRate}%`);

        console.log('\n🎉 통합 시스템 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    }
}

// 순차적 통합 실행 함수
async function executeSequentialIntegratedTask(taskDescription, options = {}) {
    console.log(`🎯 순차적 통합 에이전트 실행: ${taskDescription}`);
    
    try {
        // Java 에이전트 브리지 초기화
        if (!javaAgentBridge.isConnected()) {
            await javaAgentBridge.initialize();
        }
        
        // 1단계: 작업 분석
        const taskAnalysis = integratedAgentSystem.analyzeTaskType(taskDescription);
        console.log('📋 작업 분석:', taskAnalysis);
        
        // 2단계: JavaScript 에이전트 실행
        integratedAgentSystem.setMode('sequential');
        const jsResult = await integratedAgentSystem.execute(taskDescription, options);
        console.log('🟨 JavaScript 에이전트 완료');
        
        // 3단계: Java 에이전트 실행 (필요한 경우)
        let javaResult = null;
        const javaAgents = getRequiredJavaAgents(taskAnalysis);
        
        if (javaAgents.length > 0) {
            console.log(`☕ Java 에이전트 실행: ${javaAgents.join(', ')}`);
            javaResult = await javaAgentBridge.executeJavaAgentChain(
                javaAgents, 
                jsResult.result || {}
            );
            console.log('☕ Java 에이전트 완료');
        }
        
        // 4단계: 결과 통합
        const finalResult = {
            success: true,
            taskDescription,
            taskType: taskAnalysis,
            jsResult,
            javaResult,
            javaAgentsUsed: javaAgents,
            totalTime: (jsResult?.executionTime || 0) + (javaResult?.totalExecutionTime || 0),
            timestamp: new Date().toISOString()
        };
        
        console.log('🎉 순차적 통합 실행 완료');
        return finalResult;
        
    } catch (error) {
        console.error('💥 순차적 통합 실행 실패:', error);
        return {
            success: false,
            error: error.message,
            taskDescription
        };
    }
}

// Java 에이전트 요구사항 분석
function getRequiredJavaAgents(taskType) {
    const javaAgentMapping = {
        'code-fix': ['CLAUDE_GUIDE', 'UNIFIED_TROUBLESHOOTING'],
        'log-analysis': ['DEBUG', 'UNIFIED_TROUBLESHOOTING'],
        'api-analysis': ['API_DOCUMENTATION'],
        'full-analysis': ['CLAUDE_GUIDE', 'DEBUG', 'UNIFIED_TROUBLESHOOTING', 'API_DOCUMENTATION'],
        'debug': ['DEBUG', 'UNIFIED_TROUBLESHOOTING'],
        'documentation': ['API_DOCUMENTATION', 'UNIFIED_TROUBLESHOOTING']
    };
    
    return javaAgentMapping[taskType] || [];
}

// 기존 executeTask 함수 개선
async function executeTask(taskDescription, options = {}) {
    console.log(`🔄 통합 에이전트 시스템 실행: ${taskDescription}`);
    
    const result = await executeSequentialIntegratedTask(taskDescription, options);
    
    if (result.success) {
        console.log('✅ 작업 완료');
        console.log('📊 실행 결과 요약:');
        console.log(`  - JavaScript 결과: ${result.jsResult?.success ? '성공' : '실패'}`);
        console.log(`  - Java 결과: ${result.javaResult ? (result.javaResult.chainSuccess ? '성공' : '실패') : '실행 안함'}`);
        console.log(`  - 총 실행 시간: ${result.totalTime}ms`);
        
        if (result.javaAgentsUsed && result.javaAgentsUsed.length > 0) {
            console.log(`  - 사용된 Java 에이전트: ${result.javaAgentsUsed.join(', ')}`);
        }
    } else {
        console.error('❌ 작업 실패:', result.error);
    }
    
    return result;
}

module.exports = {
    IntegratedAgentSystem,
    integratedAgentSystem,
    executeTask,
    executeSequentialIntegratedTask,
    executeWithMode,
    performFullSystemAnalysis,
    testIntegratedSystem,
    getRequiredJavaAgents
};