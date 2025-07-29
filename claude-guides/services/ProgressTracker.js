/**
 * TodoWrite 기반 실시간 진행상황 추적 시스템
 * 모든 복잡한 작업(3단계 이상)의 진행도를 실시간으로 추적
 */
class ProgressTracker {
    constructor() {
        this.activeTasks = new Map();
        this.completedTasks = new Map();
        this.todoList = [];
        this.progressCallbacks = new Set();
    }

    /**
     * 새로운 작업 추적 시작
     * @param {string} taskId - 작업 고유 ID
     * @param {Object} taskInfo - 작업 정보
     * @returns {Promise<void>}
     */
    async startTracking(taskId, taskInfo) {
        const {
            title,
            description,
            totalSteps,
            currentStep = 0,
            priority = 'medium',
            estimatedDuration = null
        } = taskInfo;

        console.log(`📊 진행상황 추적 시작: ${title}`);

        // 작업 정보 저장
        this.activeTasks.set(taskId, {
            id: taskId,
            title,
            description,
            totalSteps,
            currentStep,
            priority,
            estimatedDuration,
            startTime: Date.now(),
            lastUpdate: Date.now(),
            status: 'in_progress'
        });

        // TodoWrite로 초기 진행상황 기록
        await this.updateTodoList(taskId);
        
        // 진행상황 콜백 실행
        this.notifyProgressCallbacks(taskId, 'started');
    }

    /**
     * 작업 진행상황 업데이트
     * @param {string} taskId - 작업 ID
     * @param {Object} updateInfo - 업데이트 정보
     * @returns {Promise<void>}
     */
    async updateProgress(taskId, updateInfo) {
        const task = this.activeTasks.get(taskId);
        if (!task) {
            console.warn(`⚠️ 추적되지 않는 작업: ${taskId}`);
            return;
        }

        const {
            currentStep,
            stepDescription,
            status,
            additionalInfo
        } = updateInfo;

        // 작업 정보 업데이트
        if (currentStep !== undefined) {
            task.currentStep = currentStep;
        }
        if (stepDescription) {
            task.currentStepDescription = stepDescription;
        }
        if (status) {
            task.status = status;
        }
        if (additionalInfo) {
            task.additionalInfo = { ...task.additionalInfo, ...additionalInfo };
        }

        task.lastUpdate = Date.now();

        console.log(`🔄 진행상황 업데이트: ${task.title} (${task.currentStep}/${task.totalSteps})`);

        // TodoWrite 업데이트
        await this.updateTodoList(taskId);

        // 진행상황 콜백 실행
        this.notifyProgressCallbacks(taskId, 'updated', updateInfo);

        // 완료 체크
        if (task.currentStep >= task.totalSteps || status === 'completed') {
            await this.completeTask(taskId);
        }
    }

    /**
     * 작업 완료 처리
     * @param {string} taskId - 작업 ID
     * @param {Object} completionInfo - 완료 정보
     * @returns {Promise<void>}
     */
    async completeTask(taskId, completionInfo = {}) {
        const task = this.activeTasks.get(taskId);
        if (!task) {
            console.warn(`⚠️ 추적되지 않는 작업: ${taskId}`);
            return;
        }

        // 완료 정보 업데이트
        task.status = 'completed';
        task.completedAt = Date.now();
        task.totalDuration = task.completedAt - task.startTime;
        task.completionInfo = completionInfo;

        console.log(`✅ 작업 완료: ${task.title} (${this.formatDuration(task.totalDuration)})`);

        // 활성 작업에서 완료된 작업으로 이동
        this.activeTasks.delete(taskId);
        this.completedTasks.set(taskId, task);

        // TodoWrite 최종 업데이트
        await this.updateTodoList(taskId, true);

        // 진행상황 콜백 실행
        this.notifyProgressCallbacks(taskId, 'completed', completionInfo);

        // 작업 통계 업데이트
        await this.updateTaskStatistics(task);
    }

    /**
     * TodoWrite를 통한 진행상황 실시간 업데이트
     * @param {string} taskId - 작업 ID
     * @param {boolean} isCompleted - 완료 여부
     * @returns {Promise<void>}
     */
    async updateTodoList(taskId, isCompleted = false) {
        const task = this.activeTasks.get(taskId) || this.completedTasks.get(taskId);
        if (!task) return;

        // 기존 TodoWrite 항목 찾기
        const existingTodoIndex = this.todoList.findIndex(todo => todo.id === taskId);
        
        // 새로운 Todo 항목 생성
        const newTodo = {
            id: taskId,
            content: this.generateTodoContent(task),
            status: isCompleted ? 'completed' : 'in_progress',
            priority: task.priority
        };

        // TodoWrite 목록 업데이트
        if (existingTodoIndex >= 0) {
            this.todoList[existingTodoIndex] = newTodo;
        } else {
            this.todoList.push(newTodo);
        }

        // 서브 단계들 추가 (상세 진행상황)
        if (!isCompleted && task.totalSteps > 1) {
            await this.updateSubStepTodos(task);
        }

        // 실제 TodoWrite 도구 호출 (Claude Code API)
        try {
            // 실제 구현에서는 여기서 Claude Code의 TodoWrite 도구를 호출
            console.log(`📝 TodoWrite 업데이트: ${task.title}`);
            // await claudeCodeAPI.todoWrite({ todos: this.todoList });
        } catch (error) {
            console.error('TodoWrite 업데이트 실패:', error);
        }
    }

    /**
     * 서브 단계 Todo 항목들 업데이트
     * @param {Object} task - 작업 정보
     * @returns {Promise<void>}
     */
    async updateSubStepTodos(task) {
        // 서브 단계별 Todo 항목들 생성
        for (let step = 1; step <= task.totalSteps; step++) {
            const subStepId = `${task.id}-step-${step}`;
            const isCurrentStep = step === task.currentStep;
            const isCompletedStep = step < task.currentStep;
            
            let status = 'pending';
            if (isCompletedStep) status = 'completed';
            else if (isCurrentStep) status = 'in_progress';

            const subTodo = {
                id: subStepId,
                content: `  └ 단계 ${step}: ${this.getStepDescription(task, step)}`,
                status,
                priority: 'low'
            };

            const existingIndex = this.todoList.findIndex(todo => todo.id === subStepId);
            if (existingIndex >= 0) {
                this.todoList[existingIndex] = subTodo;
            } else {
                this.todoList.push(subTodo);
            }
        }
    }

    /**
     * Todo 내용 생성
     * @param {Object} task - 작업 정보
     * @returns {string} Todo 내용
     */
    generateTodoContent(task) {
        const progress = task.totalSteps > 0 ? 
            `(${task.currentStep}/${task.totalSteps})` : '';
        
        const percentage = task.totalSteps > 0 ? 
            Math.round((task.currentStep / task.totalSteps) * 100) : 0;

        const duration = task.startTime ? 
            this.formatDuration(Date.now() - task.startTime) : '';

        let content = `${task.title} ${progress}`;
        
        if (percentage > 0) {
            content += ` [${percentage}%]`;
        }
        
        if (task.currentStepDescription) {
            content += ` - ${task.currentStepDescription}`;
        }
        
        if (duration && task.status !== 'completed') {
            content += ` (${duration})`;
        }

        return content;
    }

    /**
     * 단계별 설명 가져오기
     * @param {Object} task - 작업 정보
     * @param {number} step - 단계 번호
     * @returns {string} 단계 설명
     */
    getStepDescription(task, step) {
        // 작업 유형별 기본 단계 설명
        const defaultSteps = {
            1: '분석 및 계획 수립',
            2: '핵심 기능 구현',
            3: '테스트 및 검증',
            4: '최적화 및 정리',
            5: '문서화 및 완료'
        };

        // 작업별 커스텀 단계 설명이 있으면 우선 사용
        if (task.stepDescriptions && task.stepDescriptions[step]) {
            return task.stepDescriptions[step];
        }

        return defaultSteps[step] || `단계 ${step} 실행`;
    }

    /**
     * 시간 포맷팅
     * @param {number} milliseconds - 밀리초
     * @returns {string} 포맷된 시간
     */
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}시간 ${minutes % 60}분`;
        } else if (minutes > 0) {
            return `${minutes}분 ${seconds % 60}초`;
        } else {
            return `${seconds}초`;
        }
    }

    /**
     * 진행상황 콜백 추가
     * @param {Function} callback - 콜백 함수
     */
    addProgressCallback(callback) {
        this.progressCallbacks.add(callback);
    }

    /**
     * 진행상황 콜백 제거
     * @param {Function} callback - 콜백 함수
     */
    removeProgressCallback(callback) {
        this.progressCallbacks.delete(callback);
    }

    /**
     * 진행상황 콜백 실행
     * @param {string} taskId - 작업 ID
     * @param {string} event - 이벤트 타입
     * @param {Object} data - 추가 데이터
     */
    notifyProgressCallbacks(taskId, event, data = {}) {
        const task = this.activeTasks.get(taskId) || this.completedTasks.get(taskId);
        
        for (const callback of this.progressCallbacks) {
            try {
                callback({
                    taskId,
                    event,
                    task,
                    data,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('진행상황 콜백 실행 오류:', error);
            }
        }
    }

    /**
     * 현재 진행 중인 작업들 가져오기
     * @returns {Array} 활성 작업 목록
     */
    getActiveTasks() {
        return Array.from(this.activeTasks.values());
    }

    /**
     * 완료된 작업들 가져오기
     * @param {number} limit - 제한 개수
     * @returns {Array} 완료된 작업 목록
     */
    getCompletedTasks(limit = 10) {
        const completed = Array.from(this.completedTasks.values());
        return completed
            .sort((a, b) => b.completedAt - a.completedAt)
            .slice(0, limit);
    }

    /**
     * 작업 통계 업데이트
     * @param {Object} task - 완료된 작업
     * @returns {Promise<void>}
     */
    async updateTaskStatistics(task) {
        // 작업 통계 수집 및 분석
        const stats = {
            taskType: this.identifyTaskType(task.title),
            duration: task.totalDuration,
            complexity: task.totalSteps,
            efficiency: task.totalSteps / (task.totalDuration / 1000 / 60), // 단계/분
            completedAt: task.completedAt
        };

        console.log(`📊 작업 통계: ${task.title} - 효율성: ${stats.efficiency.toFixed(2)} 단계/분`);

        // 통계 데이터 저장 (로컬 스토리지 또는 데이터베이스)
        try {
            // 실제 구현에서는 통계 데이터를 저장
        } catch (error) {
            console.error('통계 업데이트 실패:', error);
        }
    }

    /**
     * 작업 유형 식별
     * @param {string} title - 작업 제목
     * @returns {string} 작업 유형
     */
    identifyTaskType(title) {
        const patterns = {
            'REFACTORING': ['리팩토링', 'refactor', '정리', 'cleanup'],
            'IMPLEMENTATION': ['구현', 'implement', '개발', 'develop'],
            'OPTIMIZATION': ['최적화', 'optimize', '성능', 'performance'],
            'DEBUGGING': ['버그', 'bug', '오류', 'error', '수정', 'fix'],
            'DOCUMENTATION': ['문서', 'document', '가이드', 'guide'],
            'TESTING': ['테스트', 'test', '검증', 'validation']
        };

        for (const [type, keywords] of Object.entries(patterns)) {
            if (keywords.some(keyword => title.toLowerCase().includes(keyword))) {
                return type;
            }
        }

        return 'GENERAL';
    }

    /**
     * 전체 진행상황 요약
     * @returns {Object} 진행상황 요약
     */
    getProgressSummary() {
        const activeTasks = this.getActiveTasks();
        const completedTasks = this.getCompletedTasks();

        const totalProgress = activeTasks.reduce((sum, task) => {
            return sum + (task.currentStep / task.totalSteps);
        }, 0);

        const averageProgress = activeTasks.length > 0 ? 
            (totalProgress / activeTasks.length) * 100 : 0;

        return {
            activeTasks: activeTasks.length,
            completedTasks: completedTasks.length,
            averageProgress: Math.round(averageProgress),
            totalTasks: activeTasks.length + completedTasks.length,
            estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(activeTasks)
        };
    }

    /**
     * 예상 남은 시간 계산
     * @param {Array} activeTasks - 활성 작업들
     * @returns {number} 예상 남은 시간 (밀리초)
     */
    calculateEstimatedTimeRemaining(activeTasks) {
        return activeTasks.reduce((total, task) => {
            const elapsed = Date.now() - task.startTime;
            const progressRate = task.currentStep / task.totalSteps;
            
            if (progressRate > 0) {
                const estimatedTotal = elapsed / progressRate;
                const remaining = estimatedTotal - elapsed;
                return total + Math.max(0, remaining);
            }
            
            return total + (task.estimatedDuration || 300000); // 기본 5분
        }, 0);
    }
}

// 전역 인스턴스
const globalProgressTracker = new ProgressTracker();

/**
 * 편의 함수들
 */
async function trackProgress(taskId, taskInfo) {
    return await globalProgressTracker.startTracking(taskId, taskInfo);
}

async function updateProgress(taskId, updateInfo) {
    return await globalProgressTracker.updateProgress(taskId, updateInfo);
}

async function completeProgress(taskId, completionInfo = {}) {
    return await globalProgressTracker.completeTask(taskId, completionInfo);
}

function getProgressSummary() {
    return globalProgressTracker.getProgressSummary();
}

module.exports = {
    ProgressTracker,
    globalProgressTracker,
    trackProgress,
    updateProgress,
    completeProgress,
    getProgressSummary
};