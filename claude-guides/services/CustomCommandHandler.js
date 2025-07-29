/**
 * 커스텀 명령어 핸들러
 * /max, /auto, /smart 명령어 구현
 * Claude Code와 통합하여 반복적인 명령을 간소화
 */

const { executeTask, executeParallelTasks } = require('./IntegratedAgentSystem');
const { trackProgress, updateProgress, completeProgress } = require('./ProgressTracker');
const { learnFromFeedback } = require('./RealTimeLearningSystem');

class CustomCommandHandler {
    constructor() {
        this.commandHistory = [];
        this.isProcessing = false;
        this.availableCommands = {
            '/max': {
                description: '모든 에이전트와 MCP를 사용하여 최대한 완전하게 작업 수행',
                usage: '/max 작업내용',
                agents: ['all'],
                mcpTools: ['all'],
                parallel: true,
                maxConcurrency: 10
            },
            '/auto': {
                description: '작업을 자동으로 분석하여 최적의 방법으로 수행',
                usage: '/auto 작업내용',
                agents: ['auto-select'],
                mcpTools: ['auto-select'],
                parallel: 'auto',
                maxConcurrency: 5
            },
            '/smart': {
                description: '지능형 분석으로 효율적이고 스마트하게 작업 수행',
                usage: '/smart 작업내용',
                agents: ['smart-select'],
                mcpTools: ['smart-select'],
                parallel: 'smart',
                maxConcurrency: 3
            }
        };
    }

    /**
     * 커스텀 명령어 처리 메인 함수
     * @param {string} input - 사용자 입력 (/max, /auto, /smart + 작업내용)
     * @returns {Promise<Object>} 실행 결과
     */
    async handleCommand(input) {
        if (this.isProcessing) {
            return {
                success: false,
                message: '다른 명령이 실행 중입니다. 잠시 후 다시 시도해주세요.',
                isProcessing: true
            };
        }

        const { command, task } = this.parseCommand(input);
        
        if (!command) {
            return {
                success: false,
                message: '알 수 없는 명령어입니다. 사용 가능: /max, /auto, /smart',
                availableCommands: Object.keys(this.availableCommands)
            };
        }

        if (!task || task.trim().length === 0) {
            return {
                success: false,
                message: `작업 내용을 입력해주세요. 예: ${this.availableCommands[command].usage}`,
                usage: this.availableCommands[command].usage
            };
        }

        console.log(`🎯 커스텀 명령어 처리: ${command} "${task}"`);\n
        this.isProcessing = true;

        try {
            // 명령어별 실행
            let result;
            switch (command) {
                case '/max':
                    result = await this.executeMaxCommand(task);
                    break;
                case '/auto':
                    result = await this.executeAutoCommand(task);
                    break;
                case '/smart':
                    result = await this.executeSmartCommand(task);
                    break;
                default:
                    throw new Error(`구현되지 않은 명령어: ${command}`);
            }

            // 실행 이력 저장
            this.saveCommandHistory(command, task, result);

            // 학습 시스템에 피드백 제공
            await this.provideLearningFeedback(command, task, result);

            return result;

        } catch (error) {
            console.error(`❌ 커스텀 명령어 실행 실패: ${command}`, error);
            return {
                success: false,
                command,
                task,
                error: error.message,
                suggestion: '작업을 더 구체적으로 설명하거나 다른 명령어를 시도해보세요.'
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 입력 파싱 (명령어와 작업 내용 분리)
     * @param {string} input - 사용자 입력
     * @returns {Object} {command, task}
     */
    parseCommand(input) {
        const trimmed = input.trim();
        
        for (const cmd of Object.keys(this.availableCommands)) {
            if (trimmed.startsWith(cmd)) {
                const task = trimmed.slice(cmd.length).trim();
                return { command: cmd, task };
            }
        }
        
        return { command: null, task: null };
    }

    /**
     * /max 명령어 실행 - 모든 리소스 최대 활용
     * @param {string} task - 작업 내용
     * @returns {Promise<Object>} 실행 결과
     */
    async executeMaxCommand(task) {
        console.log('🚀 /max 명령어: 모든 에이전트와 MCP 최대 활용');
        
        const taskId = `max-${Date.now()}`;
        await trackProgress(taskId, {
            title: `/max: ${task}`,
            description: '모든 리소스를 활용한 최대 성능 작업 수행',
            totalSteps: 5,
            priority: 'high'
        });

        try {
            // 1단계: 작업 분석
            await updateProgress(taskId, {
                currentStep: 1,
                stepDescription: '작업 복잡도 분석 및 전체 리소스 계획'
            });

            // 복잡한 작업을 여러 서브태스크로 분할
            const subtasks = this.divideMaxTask(task);

            // 2단계: 병렬 실행 준비
            await updateProgress(taskId, {
                currentStep: 2,
                stepDescription: `${subtasks.length}개 서브태스크 병렬 실행 준비`
            });

            // 3단계: 최대 10개 병렬 실행
            await updateProgress(taskId, {
                currentStep: 3,
                stepDescription: '최대 10개 에이전트 동시 실행 중'
            });

            const results = await executeParallelTasks(subtasks, {
                maxConcurrency: 10,
                timeout: 600000, // 10분
                enableAllMCP: true,
                useAllAgents: true
            });

            // 4단계: 결과 통합
            await updateProgress(taskId, {
                currentStep: 4,
                stepDescription: '병렬 실행 결과 통합 및 검증'
            });

            const consolidatedResult = await this.consolidateMaxResults(results);

            // 5단계: 완료
            await completeProgress(taskId, {
                totalSubtasks: subtasks.length,
                successRate: consolidatedResult.successRate,
                performance: consolidatedResult.performance
            });

            return {
                success: true,
                command: '/max',
                task,
                mode: 'maximum_performance',
                results: consolidatedResult,
                stats: {
                    subtasks: subtasks.length,
                    successRate: consolidatedResult.successRate,
                    totalTime: consolidatedResult.totalTime,
                    agentsUsed: 'all_available',
                    mcpToolsUsed: 'all_available'
                }
            };

        } catch (error) {
            await updateProgress(taskId, {
                status: 'failed',
                stepDescription: `최대 성능 실행 실패: ${error.message}`
            });
            throw error;
        }
    }

    /**
     * /auto 명령어 실행 - 자동 최적화
     * @param {string} task - 작업 내용
     * @returns {Promise<Object>} 실행 결과
     */
    async executeAutoCommand(task) {
        console.log('🤖 /auto 명령어: 자동 분석 및 최적 실행');
        
        const taskId = `auto-${Date.now()}`;
        await trackProgress(taskId, {
            title: `/auto: ${task}`,
            description: '자동 분석으로 최적의 방법 선택',
            totalSteps: 4,
            priority: 'medium'
        });

        try {
            // 1단계: 자동 분석
            await updateProgress(taskId, {
                currentStep: 1,
                stepDescription: '작업 유형 자동 분석 중'
            });

            const analysis = await this.autoAnalyzeTask(task);

            // 2단계: 최적 전략 선택
            await updateProgress(taskId, {
                currentStep: 2,
                stepDescription: `${analysis.taskType} 작업으로 분류, 최적 전략 선택`
            });

            const strategy = this.selectOptimalStrategy(analysis);

            // 3단계: 자동 실행
            await updateProgress(taskId, {
                currentStep: 3,
                stepDescription: `${strategy.agents.length}개 에이전트로 ${strategy.mode} 실행`
            });

            const result = await executeTask(task, {
                agents: strategy.agents,
                mcpTools: strategy.mcpTools,
                parallel: strategy.parallel,
                maxConcurrency: strategy.concurrency
            });

            // 4단계: 완료
            await completeProgress(taskId, {
                strategy: strategy.name,
                agentsUsed: strategy.agents,
                executionMode: strategy.mode
            });

            return {
                success: true,
                command: '/auto',
                task,
                mode: 'auto_optimized',
                analysis,
                strategy,
                results: result,
                stats: {
                    taskType: analysis.taskType,
                    confidence: analysis.confidence,
                    agentsUsed: strategy.agents,
                    executionTime: result.executionTime
                }
            };

        } catch (error) {
            await updateProgress(taskId, {
                status: 'failed',
                stepDescription: `자동 실행 실패: ${error.message}`
            });
            throw error;
        }
    }

    /**
     * /smart 명령어 실행 - 지능형 효율적 처리
     * @param {string} task - 작업 내용
     * @returns {Promise<Object>} 실행 결과
     */
    async executeSmartCommand(task) {
        console.log('🧠 /smart 명령어: 지능형 효율적 처리');
        
        const taskId = `smart-${Date.now()}`;
        await trackProgress(taskId, {
            title: `/smart: ${task}`,
            description: '지능형 분석으로 효율적 처리',
            totalSteps: 3,
            priority: 'medium'
        });

        try {
            // 1단계: 지능형 분석
            await updateProgress(taskId, {
                currentStep: 1,
                stepDescription: '작업 패턴 지능형 분석'
            });

            const smartAnalysis = await this.smartAnalyzeTask(task);

            // 2단계: 효율적 실행
            await updateProgress(taskId, {
                currentStep: 2,
                stepDescription: `${smartAnalysis.approach} 방식으로 효율적 실행`
            });

            const result = await executeTask(task, {
                approach: smartAnalysis.approach,
                agents: smartAnalysis.selectedAgents,
                mcpTools: smartAnalysis.selectedTools,
                optimizations: smartAnalysis.optimizations
            });

            // 3단계: 완료
            await completeProgress(taskId, {
                approach: smartAnalysis.approach,
                efficiency: smartAnalysis.efficiency,
                optimizations: smartAnalysis.optimizations
            });

            return {
                success: true,
                command: '/smart',
                task,
                mode: 'smart_efficient',
                analysis: smartAnalysis,
                results: result,
                stats: {
                    approach: smartAnalysis.approach,
                    efficiency: smartAnalysis.efficiency,
                    resourceUsage: smartAnalysis.resourceUsage,
                    timeSaved: smartAnalysis.timeSaved
                }
            };

        } catch (error) {
            await updateProgress(taskId, {
                status: 'failed',
                stepDescription: `지능형 실행 실패: ${error.message}`
            });
            throw error;
        }
    }

    /**
     * /max 작업을 서브태스크로 분할
     */
    divideMaxTask(task) {
        // 복잡한 작업을 최대한 많은 서브태스크로 분할
        const subtasks = [
            `${task} - 코드 분석`,
            `${task} - 아키텍처 검토`,
            `${task} - 성능 최적화`,
            `${task} - 보안 검토`,
            `${task} - 테스트 계획`,
            `${task} - 문서화`,
            `${task} - 통합 검증`,
            `${task} - 품질 보증`
        ];

        return subtasks.slice(0, 10); // 최대 10개
    }

    /**
     * /max 결과 통합
     */
    async consolidateMaxResults(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        return {
            successRate: successful.length / results.length,
            totalResults: results.length,
            successful: successful.length,
            failed: failed.length,
            details: results,
            performance: {
                avgTime: results.reduce((sum, r) => sum + (r.time || 0), 0) / results.length,
                totalTime: Math.max(...results.map(r => r.time || 0))
            }
        };
    }

    /**
     * 작업 자동 분석
     */
    async autoAnalyzeTask(task) {
        // 키워드 기반 작업 유형 분석
        const patterns = {
            'CODING': ['코드', '구현', 'implement', 'code', '개발'],
            'DEBUGGING': ['버그', 'bug', '오류', 'error', '수정', 'fix'],
            'OPTIMIZATION': ['최적화', 'optimize', '성능', 'performance'],
            'ANALYSIS': ['분석', 'analyze', '검토', 'review'],
            'DOCUMENTATION': ['문서', 'document', '가이드', 'guide'],
            'TESTING': ['테스트', 'test', '검증', 'validation']
        };

        let taskType = 'GENERAL';
        let confidence = 0.5;

        for (const [type, keywords] of Object.entries(patterns)) {
            const matches = keywords.filter(keyword => 
                task.toLowerCase().includes(keyword)
            ).length;
            
            if (matches > 0) {
                taskType = type;
                confidence = Math.min(0.9, 0.6 + (matches * 0.1));
                break;
            }
        }

        return {
            taskType,
            confidence,
            complexity: this.assessComplexity(task),
            estimatedTime: this.estimateTime(task),
            suggestedApproach: this.suggestApproach(taskType)
        };
    }

    /**
     * 최적 전략 선택
     */
    selectOptimalStrategy(analysis) {
        const strategies = {
            'CODING': {
                name: 'development_focused',
                agents: ['CLAUDE_GUIDE', 'API_DOCUMENTATION'],
                mcpTools: ['file-system', 'github'],
                parallel: false,
                concurrency: 1,
                mode: 'sequential'
            },
            'DEBUGGING': {
                name: 'debugging_focused',
                agents: ['DEBUG_AGENT', 'TROUBLESHOOTING_DOCS'],
                mcpTools: ['file-system', 'memory-bank'],
                parallel: false,
                concurrency: 2,
                mode: 'debugging'
            },
            'OPTIMIZATION': {
                name: 'performance_focused',
                agents: ['DEBUG_AGENT', 'SEO_OPTIMIZATION'],
                mcpTools: ['file-system', 'context7'],
                parallel: true,
                concurrency: 3,
                mode: 'parallel'
            },
            'ANALYSIS': {
                name: 'analysis_focused',
                agents: ['DEBUG_AGENT', 'API_DOCUMENTATION'],
                mcpTools: ['file-system', 'memory-bank', 'context7'],
                parallel: true,
                concurrency: 3,
                mode: 'analytical'
            }
        };

        return strategies[analysis.taskType] || strategies['CODING'];
    }

    /**
     * 지능형 작업 분석
     */
    async smartAnalyzeTask(task) {
        // 더 정교한 패턴 분석
        const efficiency = this.calculateEfficiency(task);
        const approach = efficiency > 0.7 ? 'parallel' : 'sequential';
        
        return {
            approach,
            efficiency,
            selectedAgents: this.selectSmartAgents(task),
            selectedTools: this.selectSmartTools(task),
            optimizations: this.identifyOptimizations(task),
            resourceUsage: 'optimal',
            timeSaved: efficiency * 100
        };
    }

    /**
     * 복잡도 평가
     */
    assessComplexity(task) {
        let score = 1;
        
        if (task.length > 50) score += 1;
        if (task.includes('전체') || task.includes('모든')) score += 2;
        if (task.includes('복잡') || task.includes('어려운')) score += 2;
        
        return Math.min(5, score);
    }

    /**
     * 시간 추정
     */
    estimateTime(task) {
        const baseTime = 30000; // 30초
        const complexity = this.assessComplexity(task);
        return baseTime * complexity;
    }

    /**
     * 접근 방법 제안
     */
    suggestApproach(taskType) {
        const approaches = {
            'CODING': 'sequential_implementation',
            'DEBUGGING': 'focused_debugging',
            'OPTIMIZATION': 'parallel_optimization',
            'ANALYSIS': 'comprehensive_analysis'
        };
        
        return approaches[taskType] || 'general_approach';
    }

    /**
     * 효율성 계산
     */
    calculateEfficiency(task) {
        // 간단한 휴리스틱 기반 효율성 계산
        let efficiency = 0.5;
        
        if (task.length < 30) efficiency += 0.2;
        if (!task.includes('복잡')) efficiency += 0.1;
        if (task.includes('간단')) efficiency += 0.2;
        
        return Math.min(1.0, efficiency);
    }

    /**
     * 스마트 에이전트 선택
     */
    selectSmartAgents(task) {
        // 작업에 따른 최적 에이전트 조합
        if (task.includes('SEO') || task.includes('마크업')) {
            return ['SEO_OPTIMIZATION'];
        }
        if (task.includes('문서')) {
            return ['API_DOCUMENTATION'];
        }
        return ['CLAUDE_GUIDE'];
    }

    /**
     * 스마트 도구 선택
     */
    selectSmartTools(task) {
        const tools = ['file-system'];
        
        if (task.includes('git') || task.includes('커밋')) {
            tools.push('github');
        }
        if (task.includes('기억') || task.includes('저장')) {
            tools.push('memory-bank');
        }
        
        return tools;
    }

    /**
     * 최적화 식별
     */
    identifyOptimizations(task) {
        const optimizations = [];
        
        if (task.length < 20) {
            optimizations.push('quick_execution');
        }
        if (!task.includes('검증')) {
            optimizations.push('skip_validation');
        }
        
        return optimizations;
    }

    /**
     * 명령어 실행 이력 저장
     */
    saveCommandHistory(command, task, result) {
        const entry = {
            timestamp: new Date().toISOString(),
            command,
            task,
            success: result.success,
            executionTime: result.stats?.executionTime || 0,
            mode: result.mode
        };

        this.commandHistory.push(entry);
        
        // 최근 100개만 유지
        if (this.commandHistory.length > 100) {
            this.commandHistory = this.commandHistory.slice(-100);
        }
    }

    /**
     * 학습 시스템에 피드백 제공
     */
    async provideLearningFeedback(command, task, result) {
        const feedback = `${command} 명령어로 "${task}" 작업 ${result.success ? '성공' : '실패'}`;
        const context = `실행 모드: ${result.mode}, 처리 시간: ${result.stats?.executionTime || 'N/A'}ms`;
        
        await learnFromFeedback(feedback, context, 'COMMAND_EXECUTION');
    }

    /**
     * 도움말 제공
     */
    getHelp() {
        return {
            title: '커스텀 명령어 도움말',
            commands: this.availableCommands,
            usage: [
                '기본 사용법: /명령어 작업내용',
                '예시: /max TypeScript 오류 수정해줘',
                '예시: /auto 성능 최적화',
                '예시: /smart UI 컴포넌트 개선'
            ],
            tips: [
                '/max: 복잡하고 중요한 작업에 사용',
                '/auto: 어떻게 해야 할지 모를 때 사용',
                '/smart: 빠르고 효율적인 처리가 필요할 때 사용'
            ]
        };
    }

    /**
     * 상태 조회
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            commandHistory: this.commandHistory.slice(-5), // 최근 5개
            totalCommands: this.commandHistory.length,
            availableCommands: Object.keys(this.availableCommands)
        };
    }
}

// 전역 인스턴스
const globalCommandHandler = new CustomCommandHandler();

/**
 * 편의 함수들
 */
async function handleCustomCommand(input) {
    return await globalCommandHandler.handleCommand(input);
}

function getCommandHelp() {
    return globalCommandHandler.getHelp();
}

function getCommandStatus() {
    return globalCommandHandler.getStatus();
}

module.exports = {
    CustomCommandHandler,
    globalCommandHandler,
    handleCustomCommand,
    getCommandHelp,
    getCommandStatus
};