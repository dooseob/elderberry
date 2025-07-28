/**
 * 병렬 작업 관리자 - 최대 10개 동시 처리
 * 복잡한 작업을 효율적으로 병렬 처리하는 시스템
 * 
 * @author ClaudeGuideAgent
 * @version 2.0.0
 * @created 2025-01-28
 */

const { EventEmitter } = require('events');

class ParallelTaskManager extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.maxConcurrency = options.maxConcurrency || 10;
        this.activeTasks = new Map();
        this.taskQueue = [];
        this.completedTasks = [];
        this.failedTasks = [];
        this.totalProcessed = 0;
        
        // 성능 모니터링
        this.metrics = {
            startTime: null,
            endTime: null,
            totalDuration: 0,
            averageTaskTime: 0,
            efficiency: 0,
            throughput: 0
        };
    }

    /**
     * 병렬 작업 실행
     * @param {Array} tasks - 실행할 작업 배열
     * @param {Object} options - 실행 옵션
     * @returns {Promise<Object>} 실행 결과
     */
    async executeParallelTasks(tasks, options = {}) {
        try {
            console.log(`🔄 병렬 작업 시작: ${tasks.length}개 작업, 최대 ${this.maxConcurrency}개 동시 처리`);
            
            this.metrics.startTime = Date.now();
            this.taskQueue = [...tasks.map((task, index) => ({
                id: `task-${index + 1}`,
                task,
                index,
                status: 'pending',
                startTime: null,
                endTime: null,
                result: null,
                error: null
            }))];

            // 병렬 처리 시작
            const results = await this.processTasks();
            
            this.metrics.endTime = Date.now();
            this.metrics.totalDuration = this.metrics.endTime - this.metrics.startTime;
            this.calculateMetrics();

            console.log(`✅ 병렬 작업 완료: ${this.completedTasks.length}개 성공, ${this.failedTasks.length}개 실패`);
            console.log(`📊 성능: ${this.metrics.efficiency.toFixed(2)}% 효율성, ${this.metrics.throughput.toFixed(2)} 작업/초`);

            return {
                success: true,
                completed: this.completedTasks,
                failed: this.failedTasks,
                metrics: this.metrics,
                summary: {
                    total: tasks.length,
                    completed: this.completedTasks.length,
                    failed: this.failedTasks.length,
                    efficiency: this.metrics.efficiency,
                    duration: this.metrics.totalDuration
                }
            };

        } catch (error) {
            console.error('❌ 병렬 작업 실행 오류:', error);
            return {
                success: false,
                error: error.message,
                completed: this.completedTasks,
                failed: this.failedTasks
            };
        }
    }

    /**
     * 작업 큐 처리
     */
    async processTasks() {
        return new Promise((resolve, reject) => {
            const processNext = () => {
                // 활성 작업이 최대 동시 처리 수를 초과하지 않고, 대기 중인 작업이 있을 때
                while (this.activeTasks.size < this.maxConcurrency && this.taskQueue.length > 0) {
                    const taskItem = this.taskQueue.shift();
                    this.startTask(taskItem);
                }

                // 모든 작업이 완료되었는지 확인
                if (this.activeTasks.size === 0 && this.taskQueue.length === 0) {
                    resolve();
                }
            };

            // 작업 완료 리스너
            this.on('task-completed', (taskItem) => {
                this.activeTasks.delete(taskItem.id);
                this.completedTasks.push(taskItem);
                this.totalProcessed++;
                
                console.log(`✅ 작업 완료: ${taskItem.id} (${this.totalProcessed}/${this.completedTasks.length + this.failedTasks.length + this.taskQueue.length + this.activeTasks.size})`);
                
                processNext();
            });

            // 작업 실패 리스너
            this.on('task-failed', (taskItem) => {
                this.activeTasks.delete(taskItem.id);
                this.failedTasks.push(taskItem);
                this.totalProcessed++;
                
                console.log(`❌ 작업 실패: ${taskItem.id} - ${taskItem.error}`);
                
                processNext();
            });

            // 초기 작업 시작
            processNext();
        });
    }

    /**
     * 개별 작업 실행
     * @param {Object} taskItem - 작업 아이템
     */
    async startTask(taskItem) {
        try {
            taskItem.status = 'running';
            taskItem.startTime = Date.now();
            
            this.activeTasks.set(taskItem.id, taskItem);
            console.log(`🚀 작업 시작: ${taskItem.id}`);

            // 작업 실행 (함수 또는 프로미스)
            let result;
            if (typeof taskItem.task === 'function') {
                result = await taskItem.task();
            } else if (typeof taskItem.task === 'object' && taskItem.task.execute) {
                result = await taskItem.task.execute();
            } else {
                result = taskItem.task;
            }

            taskItem.endTime = Date.now();
            taskItem.status = 'completed';
            taskItem.result = result;

            this.emit('task-completed', taskItem);

        } catch (error) {
            taskItem.endTime = Date.now();
            taskItem.status = 'failed';
            taskItem.error = error.message;

            this.emit('task-failed', taskItem);
        }
    }

    /**
     * 성능 메트릭 계산
     */
    calculateMetrics() {
        const totalTasks = this.completedTasks.length + this.failedTasks.length;
        
        if (totalTasks > 0) {
            // 평균 작업 시간 계산
            const totalTaskTime = [...this.completedTasks, ...this.failedTasks]
                .reduce((sum, task) => sum + (task.endTime - task.startTime), 0);
            
            this.metrics.averageTaskTime = totalTaskTime / totalTasks;
            
            // 효율성 계산 (이론적 최대 시간 대비 실제 시간)
            const theoreticalMinTime = Math.ceil(totalTasks / this.maxConcurrency) * this.metrics.averageTaskTime;
            this.metrics.efficiency = (theoreticalMinTime / this.metrics.totalDuration) * 100;
            
            // 처리량 계산 (작업/초)
            this.metrics.throughput = (totalTasks / this.metrics.totalDuration) * 1000;
        }
    }

    /**
     * 작업 진행 상황 조회
     * @returns {Object} 현재 진행 상황
     */
    getProgress() {
        const total = this.completedTasks.length + this.failedTasks.length + this.taskQueue.length + this.activeTasks.size;
        const completed = this.completedTasks.length + this.failedTasks.length;
        
        return {
            total,
            completed,
            active: this.activeTasks.size,
            pending: this.taskQueue.length,
            success: this.completedTasks.length,
            failed: this.failedTasks.length,
            progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            activeTasks: Array.from(this.activeTasks.values()).map(task => ({
                id: task.id,
                status: task.status,
                runningTime: task.startTime ? Date.now() - task.startTime : 0
            }))
        };
    }

    /**
     * 특정 작업 그룹에 대한 병렬 처리
     * @param {Object} taskGroups - 작업 그룹 객체
     * @returns {Promise<Object>} 그룹별 실행 결과
     */
    async executeTaskGroups(taskGroups) {
        const results = {};
        
        for (const [groupName, tasks] of Object.entries(taskGroups)) {
            console.log(`📁 작업 그룹 처리: ${groupName} (${tasks.length}개 작업)`);
            
            // 각 그룹을 병렬로 처리
            results[groupName] = await this.executeParallelTasks(tasks);
        }
        
        return results;
    }

    /**
     * 작업 취소
     * @param {string} taskId - 취소할 작업 ID
     */
    cancelTask(taskId) {
        if (this.activeTasks.has(taskId)) {
            const task = this.activeTasks.get(taskId);
            task.status = 'cancelled';
            task.endTime = Date.now();
            task.error = 'Task cancelled by user';
            
            this.activeTasks.delete(taskId);
            this.failedTasks.push(task);
            
            console.log(`⚠️ 작업 취소: ${taskId}`);
        }
    }

    /**
     * 모든 작업 취소
     */
    cancelAllTasks() {
        // 대기 중인 작업 취소
        this.taskQueue.forEach(task => {
            task.status = 'cancelled';
            task.error = 'Task cancelled by user';
            this.failedTasks.push(task);
        });
        this.taskQueue = [];

        // 실행 중인 작업 취소
        for (const taskId of this.activeTasks.keys()) {
            this.cancelTask(taskId);
        }

        console.log('⚠️ 모든 작업이 취소되었습니다.');
    }

    /**
     * 통계 정보 조회
     * @returns {Object} 상세 통계 정보
     */
    getStatistics() {
        return {
            performance: this.metrics,
            taskCounts: {
                total: this.completedTasks.length + this.failedTasks.length,
                completed: this.completedTasks.length,
                failed: this.failedTasks.length,
                successRate: this.completedTasks.length / (this.completedTasks.length + this.failedTasks.length) * 100
            },
            configuration: {
                maxConcurrency: this.maxConcurrency
            },
            currentStatus: this.getProgress()
        };
    }

    /**
     * 시스템 리셋
     */
    reset() {
        this.activeTasks.clear();
        this.taskQueue = [];
        this.completedTasks = [];
        this.failedTasks = [];
        this.totalProcessed = 0;
        this.metrics = {
            startTime: null,
            endTime: null,
            totalDuration: 0,
            averageTaskTime: 0,
            efficiency: 0,
            throughput: 0
        };
        
        console.log('🔄 병렬 작업 관리자가 초기화되었습니다.');
    }
}

module.exports = ParallelTaskManager;