/**
 * SQLite Agent Logger - 통합 에이전트 로깅 시스템
 * @version 2.0.0
 * @date 2025-08-01
 * @description MCP 도구, 서브에이전트, 커스텀 명령어 실행 로그 통합 관리
 */

class SQLiteAgentLogger {
    constructor() {
        this.logs = [];
        this.activeSessions = new Map();
        this.performanceMetrics = {
            totalExecutions: 0,
            successfulExecutions: 0,
            averageExecutionTime: 0,
            mcpToolUsage: {},
            agentUsage: {}
        };
        
        console.log('🔍 SQLite Agent Logger v2.0.0 초기화 완료');
    }

    async logCustomCommandUsage(command, category, executionTime, parallelTasks, success, agents, mcpTools, satisfaction) {
        this.logs.push({
            type: "custom_command",
            command, category, executionTime, parallelTasks, success, agents, mcpTools, satisfaction,
            timestamp: Date.now()
        });
        return true;
    }

    async logMCPExecutionStart(tool, task) {
        const id = Date.now();
        this.logs.push({
            type: "mcp_start",
            id, tool, task,
            timestamp: Date.now()
        });
        return id;
    }

    async logMCPExecutionEnd(id, success, result, error) {
        this.logs.push({
            type: "mcp_end",
            id, success, result, error,
            timestamp: Date.now()
        });
        return true;
    }

    async logAgentExecution(agentName, taskType, description, customCommand, mcpTools, isParallel, success, result, executionTime) {
        this.logs.push({
            type: "agent_execution",
            agentName, taskType, description, customCommand, mcpTools, isParallel, success, result, executionTime,
            timestamp: Date.now()
        });
        return true;
    }

    async logPerformanceMetric(metric, value, unit, context) {
        this.logs.push({
            type: "performance",
            metric, value, unit, context,
            timestamp: Date.now()
        });
        return true;
    }

    async logSystemStatus(totalExecutions, successfulExecutions, averageTime, agents, status) {
        this.logs.push({
            type: "system_status",
            totalExecutions, successfulExecutions, averageTime, agents, status,
            timestamp: Date.now()
        });
        return true;
    }

    /**
     * 에이전트 성능 메트릭 업데이트
     */
    updatePerformanceMetrics(agentName, mcpTools, executionTime, success) {
        this.performanceMetrics.totalExecutions++;
        if (success) {
            this.performanceMetrics.successfulExecutions++;
        }
        
        // 평균 실행 시간 업데이트
        const currentAvg = this.performanceMetrics.averageExecutionTime;
        const total = this.performanceMetrics.totalExecutions;
        this.performanceMetrics.averageExecutionTime = 
            (currentAvg * (total - 1) + executionTime) / total;
        
        // 에이전트 사용 통계
        if (!this.performanceMetrics.agentUsage[agentName]) {
            this.performanceMetrics.agentUsage[agentName] = { count: 0, successRate: 0 };
        }
        this.performanceMetrics.agentUsage[agentName].count++;
        
        // MCP 도구 사용 통계
        mcpTools.forEach(tool => {
            if (!this.performanceMetrics.mcpToolUsage[tool]) {
                this.performanceMetrics.mcpToolUsage[tool] = { count: 0, successRate: 0 };
            }
            this.performanceMetrics.mcpToolUsage[tool].count++;
        });
    }

    /**
     * 실시간 시스템 상태 조회
     */
    getSystemStatus() {
        const recentLogs = this.logs.slice(-10);
        const lastHourLogs = this.logs.filter(log => 
            Date.now() - log.timestamp < 3600000 // 1시간
        );
        
        return {
            timestamp: new Date().toISOString(),
            totalLogs: this.logs.length,
            recentActivity: recentLogs.length,
            lastHourActivity: lastHourLogs.length,
            activeSessions: this.activeSessions.size,
            performanceMetrics: this.performanceMetrics,
            systemHealth: this.calculateSystemHealth(),
            topAgents: this.getTopPerformingAgents(),
            topMCPTools: this.getTopUsedMCPTools()
        };
    }

    /**
     * 시스템 건강도 계산
     */
    calculateSystemHealth() {
        const { totalExecutions, successfulExecutions } = this.performanceMetrics;
        if (totalExecutions === 0) return 'INITIALIZING';
        
        const successRate = successfulExecutions / totalExecutions;
        if (successRate >= 0.95) return 'EXCELLENT';
        if (successRate >= 0.85) return 'GOOD';
        if (successRate >= 0.70) return 'FAIR';
        return 'NEEDS_ATTENTION';
    }

    /**
     * 최고 성능 에이전트 목록
     */
    getTopPerformingAgents() {
        return Object.entries(this.performanceMetrics.agentUsage)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 3)
            .map(([name, stats]) => ({ name, ...stats }));
    }

    /**
     * 최다 사용 MCP 도구 목록
     */
    getTopUsedMCPTools() {
        return Object.entries(this.performanceMetrics.mcpToolUsage)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 3)
            .map(([name, stats]) => ({ name, ...stats }));
    }

    /**
     * 시스템 로깅 상태 조회 (기존 호환성 유지)
     */
    getLoggingStatus() {
        return {
            totalLogs: this.logs.length,
            isActive: true,
            recentLogs: this.logs.slice(-5),
            version: '2.0.0',
            features: [
                'MCP 도구 통합 로깅',
                '서브에이전트 성능 추적',
                '커스텀 명령어 통계',
                '실시간 시스템 모니터링',
                'SQLite 백엔드 연동'
            ]
        };
    }

    /**
     * 로그 데이터 내보내기 (SQLite 백엔드 동기화용)
     */
    exportLogsForSQLite() {
        return {
            logs: this.logs,
            metrics: this.performanceMetrics,
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        };
    }

    /**
     * 로그 정리 (메모리 관리)
     */
    cleanupOldLogs(retentionHours = 24) {
        const cutoffTime = Date.now() - (retentionHours * 3600000);
        const initialCount = this.logs.length;
        
        this.logs = this.logs.filter(log => log.timestamp > cutoffTime);
        
        const cleaned = initialCount - this.logs.length;
        if (cleaned > 0) {
            console.log(`🧹 SQLite Logger: ${cleaned}개 오래된 로그 정리 완료`);
        }
        
        return cleaned;
    }
}

module.exports = SQLiteAgentLogger;
