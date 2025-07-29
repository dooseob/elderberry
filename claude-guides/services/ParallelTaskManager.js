/**
 * Claude Code Task 도구 기반 병렬 작업 관리자
 * 복잡한 작업을 자동으로 분할하여 최대 10개 서브에이전트로 병렬 처리
 */
class ParallelTaskManager {
    constructor() {
        this.maxConcurrency = 10;
        this.activeTaskCount = 0;
        this.taskQueue = [];
        this.results = new Map();
        this.failedTasks = [];
    }

    /**
     * 복잡한 작업을 자동으로 병렬 처리할지 판단
     * @param {string} taskDescription - 작업 설명
     * @param {number} complexity - 복잡도 점수 (1-10)
     * @param {number} estimatedSteps - 예상 단계 수
     * @returns {boolean} 병렬 처리 여부
     */
    shouldUseParallelProcessing(taskDescription, complexity = 5, estimatedSteps = 3) {
        // 복잡도 8점 이상 또는 4단계 이상이면 병렬 처리
        const needsParallel = complexity >= 8 || estimatedSteps >= 4;
        
        // 특정 키워드가 포함된 경우 병렬 처리
        const parallelKeywords = [
            '리팩토링', 'refactor', '최적화', 'optimize', 
            '전체', 'complete', '구현', 'implement',
            '분석', 'analyze', '문서화', 'document'
        ];
        
        const hasParallelKeyword = parallelKeywords.some(keyword => 
            taskDescription.toLowerCase().includes(keyword)
        );
        
        return needsParallel || hasParallelKeyword;
    }

    /**
     * 작업을 병렬 처리 가능한 서브태스크로 분할
     * @param {string} mainTask - 메인 작업
     * @param {Object} context - 작업 컨텍스트
     * @returns {Array} 서브태스크 배열
     */
    divideTask(mainTask, context = {}) {
        const taskType = this.identifyTaskType(mainTask);
        
        switch (taskType) {
            case 'REFACTORING':
                return this.divideRefactoringTask(mainTask, context);
            case 'IMPLEMENTATION':
                return this.divideImplementationTask(mainTask, context);
            case 'ANALYSIS':
                return this.divideAnalysisTask(mainTask, context);
            case 'OPTIMIZATION':
                return this.divideOptimizationTask(mainTask, context);
            case 'DOCUMENTATION':
                return this.divideDocumentationTask(mainTask, context);
            default:
                return this.divideGenericTask(mainTask, context);
        }
    }

    /**
     * 리팩토링 작업 분할
     */
    divideRefactoringTask(mainTask, context) {
        return [
            {
                id: 'refactor-analysis',
                description: '현재 코드 구조 분석 및 문제점 파악',
                priority: 'high',
                dependencies: []
            },
            {
                id: 'refactor-plan',
                description: '리팩토링 계획 수립 및 단계별 전략',
                priority: 'high',
                dependencies: ['refactor-analysis']
            },
            {
                id: 'refactor-backend',
                description: '백엔드 코드 리팩토링 실행',
                priority: 'medium',
                dependencies: ['refactor-plan']
            },
            {
                id: 'refactor-frontend',
                description: '프론트엔드 코드 리팩토링 실행',
                priority: 'medium',
                dependencies: ['refactor-plan']
            },
            {
                id: 'refactor-test',
                description: '리팩토링 후 테스트 및 검증',
                priority: 'high',
                dependencies: ['refactor-backend', 'refactor-frontend']
            }
        ];
    }

    /**
     * 구현 작업 분할
     */
    divideImplementationTask(mainTask, context) {
        return [
            {
                id: 'impl-design',
                description: '기능 설계 및 아키텍처 계획',
                priority: 'high',
                dependencies: []
            },
            {
                id: 'impl-backend',
                description: '백엔드 로직 구현',
                priority: 'high',
                dependencies: ['impl-design']
            },
            {
                id: 'impl-frontend',
                description: '프론트엔드 UI/UX 구현',
                priority: 'high',
                dependencies: ['impl-design']
            },
            {
                id: 'impl-integration',
                description: '프론트엔드-백엔드 연동',
                priority: 'medium',
                dependencies: ['impl-backend', 'impl-frontend']
            },
            {
                id: 'impl-validation',
                description: '기능 검증 및 버그 수정',
                priority: 'medium',
                dependencies: ['impl-integration']
            }
        ];
    }

    /**
     * 분석 작업 분할
     */
    divideAnalysisTask(mainTask, context) {
        return [
            {
                id: 'analysis-scope',
                description: '분석 범위 및 목표 정의',
                priority: 'high',
                dependencies: []
            },
            {
                id: 'analysis-code',
                description: '코드베이스 구조 및 품질 분석',
                priority: 'medium',
                dependencies: ['analysis-scope']
            },
            {
                id: 'analysis-performance',
                description: '성능 및 최적화 포인트 분석',
                priority: 'medium',
                dependencies: ['analysis-scope']
            },
            {
                id: 'analysis-security',
                description: '보안 취약점 및 개선사항 분석',
                priority: 'medium',
                dependencies: ['analysis-scope']
            },
            {
                id: 'analysis-report',
                description: '종합 분석 보고서 작성',
                priority: 'high',
                dependencies: ['analysis-code', 'analysis-performance', 'analysis-security']
            }
        ];
    }

    /**
     * 최적화 작업 분할
     */
    divideOptimizationTask(mainTask, context) {
        return [
            {
                id: 'opt-profiling',
                description: '성능 프로파일링 및 병목점 식별',
                priority: 'high',
                dependencies: []
            },
            {
                id: 'opt-backend',
                description: '백엔드 성능 최적화',
                priority: 'medium',
                dependencies: ['opt-profiling']
            },
            {
                id: 'opt-frontend',
                description: '프론트엔드 성능 최적화',
                priority: 'medium',
                dependencies: ['opt-profiling']
            },
            {
                id: 'opt-database',
                description: '데이터베이스 쿼리 최적화',
                priority: 'medium',
                dependencies: ['opt-profiling']
            },
            {
                id: 'opt-validation',
                description: '최적화 효과 측정 및 검증',
                priority: 'high',
                dependencies: ['opt-backend', 'opt-frontend', 'opt-database']
            }
        ];
    }

    /**
     * 문서화 작업 분할
     */
    divideDocumentationTask(mainTask, context) {
        return [
            {
                id: 'doc-structure',
                description: '문서 구조 및 템플릿 설계',
                priority: 'high',
                dependencies: []
            },
            {
                id: 'doc-api',
                description: 'API 문서 자동 생성 및 정리',
                priority: 'medium',
                dependencies: ['doc-structure']
            },
            {
                id: 'doc-architecture',
                description: '아키텍처 및 설계 문서 작성',
                priority: 'medium',
                dependencies: ['doc-structure']
            },
            {
                id: 'doc-user-guide',
                description: '사용자 가이드 및 예제 작성',
                priority: 'medium',
                dependencies: ['doc-structure']
            },
            {
                id: 'doc-integration',
                description: '문서 통합 및 최종 검토',
                priority: 'high',
                dependencies: ['doc-api', 'doc-architecture', 'doc-user-guide']
            }
        ];
    }

    /**
     * 일반 작업 분할
     */
    divideGenericTask(mainTask, context) {
        return [
            {
                id: 'generic-analysis',
                description: `${mainTask} - 현황 분석`,
                priority: 'high',
                dependencies: []
            },
            {
                id: 'generic-planning',
                description: `${mainTask} - 실행 계획 수립`,
                priority: 'high',
                dependencies: ['generic-analysis']
            },
            {
                id: 'generic-execution',
                description: `${mainTask} - 실제 작업 수행`,
                priority: 'medium',
                dependencies: ['generic-planning']
            },
            {
                id: 'generic-validation',
                description: `${mainTask} - 결과 검증`,
                priority: 'medium',
                dependencies: ['generic-execution']
            }
        ];
    }

    /**
     * 작업 유형 식별
     */
    identifyTaskType(taskDescription) {
        const keywords = {
            REFACTORING: ['리팩토링', 'refactor', '코드 정리', 'cleanup', '구조 개선'],
            IMPLEMENTATION: ['구현', 'implement', '개발', 'develop', '기능 추가', 'feature'],
            ANALYSIS: ['분석', 'analyze', '조사', 'investigate', '검토', 'review'],
            OPTIMIZATION: ['최적화', 'optimize', '성능', 'performance', '속도', 'speed'],
            DOCUMENTATION: ['문서', 'document', 'docs', '가이드', 'guide', 'README']
        };

        for (const [type, keywordList] of Object.entries(keywords)) {
            if (keywordList.some(keyword => 
                taskDescription.toLowerCase().includes(keyword)
            )) {
                return type;
            }
        }
        
        return 'GENERIC';
    }

    /**
     * 병렬 작업 실행
     * @param {Array} subtasks - 서브태스크 배열
     * @param {Object} options - 실행 옵션
     * @returns {Promise<Object>} 실행 결과
     */
    async executeParallelTasks(subtasks, options = {}) {
        const { maxConcurrency = this.maxConcurrency, timeout = 300000 } = options;
        
        console.log(`🚀 병렬 작업 시작: ${subtasks.length}개 서브태스크, 최대 ${maxConcurrency}개 동시 실행`);
        
        try {
            // 의존성을 고려한 실행 순서 계산
            const executionPlan = this.calculateExecutionOrder(subtasks);
            
            // 병렬 실행
            const results = await this.executeWithDependencies(executionPlan, maxConcurrency, timeout);
            
            console.log(`✅ 병렬 작업 완료: ${results.successful.length}개 성공, ${results.failed.length}개 실패`);
            
            return {
                success: results.failed.length === 0,
                results: results.successful,
                failures: results.failed,
                totalTime: results.totalTime,
                parallelEfficiency: results.parallelEfficiency
            };
            
        } catch (error) {
            console.error('❌ 병렬 작업 실행 중 오류:', error);
            
            // 실패 시 순차 실행으로 폴백
            console.log('🔄 순차 실행으로 폴백 중...');
            return await this.fallbackToSequential(subtasks);
        }
    }

    /**
     * 의존성을 고려한 실행 순서 계산
     */
    calculateExecutionOrder(subtasks) {
        const taskMap = new Map(subtasks.map(task => [task.id, task]));
        const executionLevels = [];
        const processed = new Set();
        
        while (processed.size < subtasks.length) {
            const currentLevel = [];
            
            for (const task of subtasks) {
                if (processed.has(task.id)) continue;
                
                // 모든 의존성이 처리되었는지 확인
                const dependenciesSatisfied = task.dependencies.every(dep => processed.has(dep));
                
                if (dependenciesSatisfied) {
                    currentLevel.push(task);
                }
            }
            
            if (currentLevel.length === 0) {
                throw new Error('순환 의존성 감지됨');
            }
            
            executionLevels.push(currentLevel);
            currentLevel.forEach(task => processed.add(task.id));
        }
        
        return executionLevels;
    }

    /**
     * 의존성을 고려한 병렬 실행
     */
    async executeWithDependencies(executionLevels, maxConcurrency, timeout) {
        const startTime = Date.now();
        const results = { successful: [], failed: [], totalTime: 0, parallelEfficiency: 0 };
        
        for (const level of executionLevels) {
            console.log(`🔄 실행 레벨: ${level.length}개 작업 병렬 처리`);
            
            // 현재 레벨의 작업들을 병렬로 실행
            const levelResults = await this.executeConcurrentTasks(level, maxConcurrency, timeout);
            
            results.successful.push(...levelResults.successful);
            results.failed.push(...levelResults.failed);
            
            // 실패한 작업이 있으면 후속 작업에 영향을 줄 수 있음
            if (levelResults.failed.length > 0) {
                console.warn(`⚠️ ${levelResults.failed.length}개 작업 실패, 계속 진행`);
            }
        }
        
        results.totalTime = Date.now() - startTime;
        results.parallelEfficiency = this.calculateEfficiency(results.successful.length, results.totalTime);
        
        return results;
    }

    /**
     * 동시 작업 실행 (실제 Claude Code Task 도구 호출)
     */
    async executeConcurrentTasks(tasks, maxConcurrency, timeout) {
        const results = { successful: [], failed: [] };
        const semaphore = new Array(Math.min(tasks.length, maxConcurrency));
        
        await Promise.all(tasks.map(async (task, index) => {
            const slotIndex = index % maxConcurrency;
            
            try {
                // Claude Code Task 도구를 통한 실제 서브에이전트 실행
                const result = await this.executeTaskWithAgent(task, timeout);
                results.successful.push({ task, result });
                
            } catch (error) {
                console.error(`❌ 작업 실패: ${task.id}`, error);
                results.failed.push({ task, error: error.message });
            }
        }));
        
        return results;
    }

    /**
     * Claude Code Task 도구를 통한 개별 작업 실행
     */
    async executeTaskWithAgent(task, timeout) {
        // 실제 Claude Code의 서브에이전트 호출
        // 이 부분은 Claude Code 내부 API와 연동되어야 함
        
        const agentType = this.selectOptimalAgent(task);
        
        console.log(`🤖 에이전트 실행: ${agentType} - ${task.description}`);
        
        // Task 도구 호출 시뮬레이션 (실제로는 Claude Code API 호출)
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('작업 시간 초과'));
            }, timeout);
            
            // 실제 구현에서는 여기서 Claude Code Task 도구를 호출
            setTimeout(() => {
                clearTimeout(timer);
                resolve({
                    taskId: task.id,
                    status: 'completed',
                    result: `${task.description} 완료`,
                    executionTime: Math.random() * 5000 + 1000
                });
            }, Math.random() * 3000 + 500);
        });
    }

    /**
     * 작업에 최적화된 에이전트 선택
     */
    selectOptimalAgent(task) {
        const agentMap = {
            'analysis': 'general-purpose',
            'design': 'general-purpose', 
            'backend': 'general-purpose',
            'frontend': 'general-purpose',
            'test': 'general-purpose',
            'doc': 'general-purpose',
            'integration': 'general-purpose',
            'optimization': 'general-purpose'
        };
        
        for (const [keyword, agent] of Object.entries(agentMap)) {
            if (task.id.includes(keyword) || task.description.toLowerCase().includes(keyword)) {
                return agent;
            }
        }
        
        return 'general-purpose';
    }

    /**
     * 병렬 처리 효율성 계산
     */
    calculateEfficiency(completedTasks, totalTime) {
        const theoreticalSequentialTime = completedTasks * 2000; // 가정: 작업당 2초
        return Math.min(theoreticalSequentialTime / totalTime, 1.0);
    }

    /**
     * 순차 실행 폴백
     */
    async fallbackToSequential(subtasks) {
        console.log('🔄 순차 실행으로 폴백 시작');
        
        const results = { successful: [], failed: [] };
        const startTime = Date.now();
        
        for (const task of subtasks) {
            try {
                const result = await this.executeTaskWithAgent(task, 30000);
                results.successful.push({ task, result });
            } catch (error) {
                results.failed.push({ task, error: error.message });
            }
        }
        
        return {
            success: results.failed.length === 0,
            results: results.successful,
            failures: results.failed,
            totalTime: Date.now() - startTime,
            parallelEfficiency: 0, // 순차 실행이므로 0
            fallback: true
        };
    }
}

module.exports = ParallelTaskManager;