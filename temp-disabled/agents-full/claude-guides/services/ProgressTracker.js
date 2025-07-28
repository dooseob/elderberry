/**
 * TodoWrite 진행상황 실시간 추적 시스템
 * 복잡한 작업의 진행도를 체계적으로 관리하고 모니터링
 * 
 * @author ClaudeGuideAgent
 * @version 2.0.0
 * @created 2025-01-28
 */

const fs = require('fs');
const path = require('path');

class ProgressTracker {
    constructor() {
        this.activeProjects = new Map();
        this.completedProjects = [];
        this.progressHistoryPath = path.join(__dirname, '../../data/progress-history.json');
        
        // 진행상황 추적을 위한 템플릿
        this.todoTemplates = {
            simple: { minSteps: 1, maxSteps: 3 },
            moderate: { minSteps: 4, maxSteps: 7 },
            complex: { minSteps: 8, maxSteps: 15 },
            enterprise: { minSteps: 16, maxSteps: 50 }
        };

        this.loadProgressHistory();
    }

    /**
     * 새로운 프로젝트 진행상황 추적 시작
     * @param {string} projectName - 프로젝트 이름
     * @param {Object} config - 프로젝트 설정
     * @returns {Promise<Object>} 추적 시작 결과
     */
    async startTracking(projectName, config = {}) {
        try {
            const complexity = this.determineComplexity(config.totalSteps || config.description);
            const projectId = `project-${Date.now()}`;
            
            const project = {
                id: projectId,
                name: projectName,
                description: config.description || '',
                complexity,
                totalSteps: config.totalSteps || this.estimateSteps(config.description),
                currentStep: 0,
                status: 'in_progress',
                startTime: new Date(),
                endTime: null,
                todos: [],
                parallelTasks: config.parallelTasks || [],
                milestones: config.milestones || [],
                estimatedDuration: config.estimatedDuration || this.estimateDuration(complexity),
                actualDuration: null
            };

            // 초기 TodoWrite 생성
            project.todos = await this.generateInitialTodos(project);
            
            this.activeProjects.set(projectId, project);
            
            console.log(`📊 진행상황 추적 시작: ${projectName} (${complexity} 복잡도, ${project.totalSteps}단계)`);
            
            // TodoWrite 도구 호출
            await this.updateTodoWrite(project);
            
            return {
                success: true,
                projectId,
                project,
                todos: project.todos
            };

        } catch (error) {
            console.error('❌ 진행상황 추적 시작 오류:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 프로젝트 복잡도 결정
     * @param {number|string} input - 총 단계 수 또는 설명
     * @returns {string} 복잡도 레벨
     */
    determineComplexity(input) {
        let steps;
        
        if (typeof input === 'number') {
            steps = input;
        } else if (typeof input === 'string') {
            steps = this.estimateSteps(input);
        } else {
            steps = 5; // 기본값
        }

        if (steps <= 3) return 'simple';
        if (steps <= 7) return 'moderate';
        if (steps <= 15) return 'complex';
        return 'enterprise';
    }

    /**
     * 설명으로부터 단계 수 추정
     * @param {string} description - 프로젝트 설명
     * @returns {number} 추정 단계 수
     */
    estimateSteps(description) {
        if (!description) return 5;

        const complexityKeywords = {
            high: ['리팩토링', '아키텍처', '시스템', '전체', '완전', 'refactor', 'architecture', 'system'],
            medium: ['구현', '개발', '생성', '수정', 'implement', 'develop', 'create', 'modify'],
            low: ['수정', '버그', '간단', 'fix', 'bug', 'simple', 'quick']
        };

        const desc = description.toLowerCase();
        
        for (const [level, keywords] of Object.entries(complexityKeywords)) {
            if (keywords.some(keyword => desc.includes(keyword.toLowerCase()))) {
                switch (level) {
                    case 'high': return Math.floor(Math.random() * 8) + 12; // 12-20
                    case 'medium': return Math.floor(Math.random() * 5) + 6; // 6-10
                    case 'low': return Math.floor(Math.random() * 3) + 3; // 3-5
                }
            }
        }

        return 7; // 기본값
    }

    /**
     * 예상 소요 시간 추정
     * @param {string} complexity - 복잡도
     * @returns {number} 예상 소요 시간 (분)
     */
    estimateDuration(complexity) {
        const baseDurations = {
            simple: 15,     // 15분
            moderate: 45,   // 45분
            complex: 120,   // 2시간
            enterprise: 300 // 5시간
        };

        return baseDurations[complexity] || 60;
    }

    /**
     * 초기 Todo 목록 생성
     * @param {Object} project - 프로젝트 정보
     * @returns {Promise<Array>} Todo 목록
     */
    async generateInitialTodos(project) {
        const todos = [];
        const stepTemplates = {
            simple: [
                '요구사항 분석 및 계획 수립',
                '핵심 기능 구현',
                '테스트 및 검증'
            ],
            moderate: [
                '요구사항 분석 및 설계',
                '기반 구조 구축',
                '핵심 로직 구현',
                '통합 및 연동',
                '테스트 실행',
                '문서화 및 정리',
                '최종 검증'
            ],
            complex: [
                '상세 요구사항 분석',
                '아키텍처 설계',
                '모듈별 설계 문서 작성',
                '기반 인프라 구축',
                '핵심 모듈 개발 시작',
                '데이터베이스 연동',
                'API 엔드포인트 구현',
                '비즈니스 로직 구현',
                '프론트엔드 연동',
                '단위 테스트 작성',
                '통합 테스트 실행',
                '성능 최적화',
                '보안 검증',
                '문서화',
                '배포 준비'
            ],
            enterprise: [
                // 50단계까지 확장 가능한 템플릿 (필요시)
            ]
        };

        const template = stepTemplates[project.complexity] || stepTemplates.moderate;
        
        template.forEach((step, index) => {
            todos.push({
                id: `${project.id}-todo-${index + 1}`,
                content: step,
                status: index === 0 ? 'in_progress' : 'pending',
                priority: index < 3 ? 'high' : 'medium',
                createdAt: new Date(),
                estimatedTime: this.estimateStepDuration(step),
                actualTime: null,
                dependencies: index > 0 ? [`${project.id}-todo-${index}`] : [],
                assignedAgent: this.assignAgent(step)
            });
        });

        return todos;
    }

    /**
     * 단계별 소요 시간 추정
     * @param {string} step - 단계 설명
     * @returns {number} 예상 소요 시간 (분)
     */
    estimateStepDuration(step) {
        const keywords = {
            quick: ['분석', '계획', '설계', '문서화'],
            medium: ['구현', '개발', '작성', '생성'],
            long: ['테스트', '검증', '최적화', '리팩토링']
        };

        const stepLower = step.toLowerCase();
        
        for (const [duration, keywordList] of Object.entries(keywords)) {
            if (keywordList.some(keyword => stepLower.includes(keyword))) {
                switch (duration) {
                    case 'quick': return Math.floor(Math.random() * 10) + 5; // 5-15분
                    case 'medium': return Math.floor(Math.random() * 20) + 15; // 15-35분
                    case 'long': return Math.floor(Math.random() * 30) + 30; // 30-60분
                }
            }
        }

        return 20; // 기본값
    }

    /**
     * 단계별 에이전트 할당
     * @param {string} step - 단계 설명
     * @returns {string} 할당할 에이전트
     */
    assignAgent(step) {
        const agentMapping = {
            '분석': 'CLAUDE_GUIDE',
            '설계': 'CLAUDE_GUIDE',
            '구현': 'IMPLEMENTATION',
            '개발': 'IMPLEMENTATION',
            '테스트': 'TROUBLESHOOTING',
            '검증': 'TROUBLESHOOTING',
            '문서화': 'API_DOCUMENTATION',
            '디버깅': 'DEBUG'
        };

        for (const [keyword, agent] of Object.entries(agentMapping)) {
            if (step.includes(keyword)) {
                return agent;
            }
        }

        return 'CLAUDE_GUIDE'; // 기본 에이전트
    }

    /**
     * 단계 진행 업데이트
     * @param {string} projectId - 프로젝트 ID
     * @param {number} stepNumber - 완료된 단계 번호
     * @param {Object} stepResult - 단계 완료 결과
     */
    async updateProgress(projectId, stepNumber, stepResult = {}) {
        try {
            const project = this.activeProjects.get(projectId);
            if (!project) {
                throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}`);
            }

            // 현재 단계 업데이트
            project.currentStep = Math.max(project.currentStep, stepNumber);
            
            // Todo 상태 업데이트
            if (project.todos[stepNumber - 1]) {
                const todo = project.todos[stepNumber - 1];
                todo.status = 'completed';
                todo.completedAt = new Date();
                todo.actualTime = stepResult.duration || null;
                todo.result = stepResult.result || null;
                
                // 다음 단계 활성화
                if (project.todos[stepNumber]) {
                    project.todos[stepNumber].status = 'in_progress';
                }
            }

            // 진행률 계산
            const progressPercentage = Math.round((project.currentStep / project.totalSteps) * 100);
            
            console.log(`📈 진행상황 업데이트: ${project.name} - ${progressPercentage}% (${project.currentStep}/${project.totalSteps})`);

            // 프로젝트 완료 확인
            if (project.currentStep >= project.totalSteps) {
                await this.completeProject(projectId);
            } else {
                // TodoWrite 업데이트
                await this.updateTodoWrite(project);
            }

            return {
                success: true,
                progress: progressPercentage,
                currentStep: project.currentStep,
                totalSteps: project.totalSteps
            };

        } catch (error) {
            console.error('❌ 진행상황 업데이트 오류:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 프로젝트 완료 처리
     * @param {string} projectId - 완료할 프로젝트 ID
     */
    async completeProject(projectId) {
        try {
            const project = this.activeProjects.get(projectId);
            if (!project) return;

            project.status = 'completed';
            project.endTime = new Date();
            project.actualDuration = project.endTime - project.startTime;

            // 모든 Todo 완료 처리
            project.todos.forEach(todo => {
                if (todo.status !== 'completed') {
                    todo.status = 'completed';
                    todo.completedAt = new Date();
                }
            });

            // 완료된 프로젝트로 이동
            this.completedProjects.push(project);
            this.activeProjects.delete(projectId);

            console.log(`🎉 프로젝트 완료: ${project.name}`);
            console.log(`⏱️ 소요 시간: ${Math.round(project.actualDuration / 1000 / 60)}분`);

            // 최종 TodoWrite 업데이트
            await this.updateTodoWrite(project);
            
            // 이력 저장
            await this.saveProgressHistory();

        } catch (error) {
            console.error('❌ 프로젝트 완료 처리 오류:', error);
        }
    }

    /**
     * TodoWrite 도구 업데이트
     * @param {Object} project - 프로젝트 정보
     */
    async updateTodoWrite(project) {
        try {
            // TodoWrite 형식으로 변환
            const todos = project.todos.map(todo => ({
                id: todo.id,
                content: `${todo.content} ${todo.estimatedTime ? `(예상: ${todo.estimatedTime}분)` : ''}`,
                status: todo.status,
                priority: todo.priority
            }));

            console.log(`📝 TodoWrite 업데이트: ${project.name} (${todos.length}개 항목)`);
            
            // 실제로는 TodoWrite 도구를 호출해야 하지만, 
            // 여기서는 시뮬레이션으로 콘솔에 출력
            console.log('📋 현재 Todo 상태:');
            todos.forEach(todo => {
                const statusIcon = todo.status === 'completed' ? '✅' : 
                                 todo.status === 'in_progress' ? '🔄' : '⏳';
                console.log(`  ${statusIcon} ${todo.content}`);
            });

            return { success: true, todos };

        } catch (error) {
            console.error('❌ TodoWrite 업데이트 오류:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 활성 프로젝트 진행상황 조회
     * @param {string} projectId - 프로젝트 ID (선택사항)
     * @returns {Object} 진행상황 정보
     */
    getProgress(projectId = null) {
        if (projectId) {
            const project = this.activeProjects.get(projectId);
            if (!project) {
                return { error: '프로젝트를 찾을 수 없습니다.' };
            }

            return {
                project: project.name,
                progress: Math.round((project.currentStep / project.totalSteps) * 100),
                currentStep: project.currentStep,
                totalSteps: project.totalSteps,
                status: project.status,
                estimatedTimeRemaining: this.calculateRemainingTime(project),
                todos: project.todos
            };
        }

        // 모든 프로젝트 진행상황
        const allProgress = Array.from(this.activeProjects.values()).map(project => ({
            id: project.id,
            name: project.name,
            progress: Math.round((project.currentStep / project.totalSteps) * 100),
            status: project.status,
            complexity: project.complexity
        }));

        return {
            activeProjects: allProgress,
            totalActive: this.activeProjects.size,
            totalCompleted: this.completedProjects.length
        };
    }

    /**
     * 남은 시간 계산
     * @param {Object} project - 프로젝트 정보
     * @returns {number} 예상 남은 시간 (분)
     */
    calculateRemainingTime(project) {
        const completedTodos = project.todos.filter(todo => todo.status === 'completed');
        const pendingTodos = project.todos.filter(todo => todo.status === 'pending');
        
        if (completedTodos.length === 0) {
            return project.estimatedDuration;
        }

        const averageTimePerTodo = completedTodos.reduce((sum, todo) => 
            sum + (todo.actualTime || todo.estimatedTime || 20), 0) / completedTodos.length;
        
        return Math.round(pendingTodos.length * averageTimePerTodo);
    }

    /**
     * 진행 이력 저장
     */
    async saveProgressHistory() {
        try {
            const historyData = {
                activeProjects: Array.from(this.activeProjects.values()),
                completedProjects: this.completedProjects,
                lastUpdated: new Date()
            };

            // 디렉토리 생성
            const dataDir = path.dirname(this.progressHistoryPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(this.progressHistoryPath, JSON.stringify(historyData, null, 2));
            console.log('💾 진행 이력이 저장되었습니다.');

        } catch (error) {
            console.error('❌ 진행 이력 저장 오류:', error);
        }
    }

    /**
     * 진행 이력 로드
     */
    loadProgressHistory() {
        try {
            if (fs.existsSync(this.progressHistoryPath)) {
                const historyData = JSON.parse(fs.readFileSync(this.progressHistoryPath, 'utf8'));
                
                // 활성 프로젝트 복원
                if (historyData.activeProjects) {
                    historyData.activeProjects.forEach(project => {
                        this.activeProjects.set(project.id, project);
                    });
                }
                
                // 완료된 프로젝트 복원
                if (historyData.completedProjects) {
                    this.completedProjects = historyData.completedProjects;
                }

                console.log(`📂 진행 이력 로드 완료: ${this.activeProjects.size}개 활성, ${this.completedProjects.length}개 완료`);
            }

        } catch (error) {
            console.error('❌ 진행 이력 로드 오류:', error);
        }
    }

    /**
     * 통계 정보 조회
     */
    getStatistics() {
        const totalProjects = this.activeProjects.size + this.completedProjects.length;
        const completionRate = totalProjects > 0 ? 
            Math.round((this.completedProjects.length / totalProjects) * 100) : 0;

        return {
            overview: {
                totalProjects,
                activeProjects: this.activeProjects.size,
                completedProjects: this.completedProjects.length,
                completionRate
            },
            complexityDistribution: this.getComplexityDistribution(),
            averageCompletionTime: this.getAverageCompletionTime(),
            mostCommonSteps: this.getMostCommonSteps()
        };
    }

    /**
     * 복잡도별 분포 조회
     */
    getComplexityDistribution() {
        const distribution = { simple: 0, moderate: 0, complex: 0, enterprise: 0 };
        
        [...this.activeProjects.values(), ...this.completedProjects].forEach(project => {
            distribution[project.complexity]++;
        });

        return distribution;
    }

    /**
     * 평균 완료 시간 계산
     */
    getAverageCompletionTime() {
        const completedWithDuration = this.completedProjects.filter(p => p.actualDuration);
        
        if (completedWithDuration.length === 0) return 0;
        
        const totalDuration = completedWithDuration.reduce((sum, p) => sum + p.actualDuration, 0);
        return Math.round(totalDuration / completedWithDuration.length / 1000 / 60); // 분 단위
    }

    /**
     * 가장 일반적인 단계들 조회
     */
    getMostCommonSteps() {
        const stepCounts = {};
        
        [...this.activeProjects.values(), ...this.completedProjects].forEach(project => {
            project.todos.forEach(todo => {
                stepCounts[todo.content] = (stepCounts[todo.content] || 0) + 1;
            });
        });

        return Object.entries(stepCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([step, count]) => ({ step, count }));
    }
}

module.exports = ProgressTracker;