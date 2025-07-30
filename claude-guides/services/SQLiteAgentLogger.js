/**
 * SQLite 에이전트 로깅 시스템 (JavaScript 래퍼)
 * Java Spring Boot의 AgentLoggingService와 연동
 * H2 + SQLite + Redis 하이브리드 구성에서 SQLite 로깅 담당
 */

const crypto = require('crypto');

// UUID 생성 함수 (Node.js 내장 crypto 사용)
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class SQLiteAgentLogger {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.activeExecutions = new Map();
        this.loggingEnabled = true;
        
        // 백엔드 API 엔드포인트 (로깅용)
        this.apiBaseUrl = 'http://localhost:8080/api/logging';
        
        console.log('🗄️ SQLite 에이전트 로거 초기화 완료 - Session:', this.sessionId);
    }

    /**
     * 세션 ID 생성
     */
    generateSessionId() {
        return uuidv4() + '-' + Date.now();
    }

    /**
     * MCP 도구 실행 시작 로깅
     */
    async logMCPExecutionStart(toolName, taskDescription) {
        if (!this.loggingEnabled) return null;

        const executionId = uuidv4();
        const startTime = Date.now();
        
        try {
            // 로컬 캐시에 저장
            this.activeExecutions.set(executionId, {
                toolName,
                taskDescription,
                startTime,
                sessionId: this.sessionId
            });

            // 백엔드 로깅 API 호출 (비동기)
            this.callBackendLoggingAPI('/mcp/execution/start', {
                executionId,
                toolName,
                taskDescription,
                sessionId: this.sessionId,
                startTime: new Date(startTime).toISOString()
            });

            console.log(`🔍 [${toolName}] MCP 실행 시작 로깅: ${taskDescription}`);
            return executionId;
            
        } catch (error) {
            console.error('❌ MCP 시작 로깅 실패:', error.message);
            return null;
        }
    }

    /**
     * MCP 도구 실행 완료 로깅
     */
    async logMCPExecutionEnd(executionId, success, resultSummary, errorMessage = null) {
        if (!this.loggingEnabled || !executionId) return;

        try {
            const execution = this.activeExecutions.get(executionId);
            if (!execution) {
                console.warn('⚠️ 실행 ID를 찾을 수 없음:', executionId);
                return;
            }

            const endTime = Date.now();
            const durationMs = endTime - execution.startTime;

            // 백엔드 로깅 API 호출 (비동기)
            this.callBackendLoggingAPI('/mcp/execution/end', {
                executionId,
                success,
                resultSummary,
                errorMessage,
                durationMs,
                endTime: new Date(endTime).toISOString()
            });

            // 로컬 캐시에서 제거
            this.activeExecutions.delete(executionId);

            const status = success ? '✅' : '❌';
            console.log(`${status} [${execution.toolName}] MCP 실행 완료: ${durationMs}ms`);
            
        } catch (error) {
            console.error('❌ MCP 완료 로깅 실패:', error.message);
        }
    }

    /**
     * 서브에이전트 실행 로깅
     */
    async logAgentExecution(agentName, taskType, taskDescription, customCommand = null, 
                          mcpToolsUsed = [], parallelExecution = false, success = true, 
                          resultSummary = '', durationMs = 0) {
        if (!this.loggingEnabled) return;

        try {
            const logData = {
                sessionId: this.sessionId,
                agentName,
                taskType,
                taskDescription,
                customCommand,
                mcpToolsUsed,
                parallelExecution,
                success,
                resultSummary,
                durationMs,
                timestamp: new Date().toISOString()
            };

            // 백엔드 로깅 API 호출 (비동기)
            this.callBackendLoggingAPI('/agent/execution', logData);

            const statusIcon = success ? '🤖✅' : '🤖❌';
            const commandInfo = customCommand ? ` (${customCommand})` : '';
            console.log(`${statusIcon} [${agentName}] ${taskDescription}${commandInfo} - ${durationMs}ms`);
            
        } catch (error) {
            console.error('❌ 에이전트 실행 로깅 실패:', error.message);
        }
    }

    /**
     * 커스텀 명령어 사용 통계 로깅
     */
    async logCustomCommandUsage(commandName, taskCategory, executionTime, parallelTasks = 1, 
                              success = true, agentsInvolved = [], mcpToolsUsed = [], userSatisfaction = null) {
        if (!this.loggingEnabled) return;

        try {
            const statsData = {
                commandName,
                taskCategory,
                executionTime,
                parallelTasks,
                success,
                agentsInvolved,
                mcpToolsUsed,
                userSatisfaction,
                timestamp: new Date().toISOString()
            };

            // 백엔드 로깅 API 호출 (비동기)
            this.callBackendLoggingAPI('/command/stats', statsData);

            const statusIcon = success ? '📊✅' : '📊❌';
            console.log(`${statusIcon} 커스텀 명령어 통계: ${commandName} (${parallelTasks}개 병렬, ${executionTime}ms)`);
            
        } catch (error) {
            console.error('❌ 커스텀 명령어 통계 로깅 실패:', error.message);
        }
    }

    /**
     * 성능 메트릭 로깅
     */
    async logPerformanceMetric(metricType, metricValue, unit = 'ms', context = '') {
        if (!this.loggingEnabled) return;

        try {
            const metricData = {
                metricType,
                metricValue,
                unit,
                context,
                timestamp: new Date().toISOString()
            };

            // 백엔드 로깅 API 호출 (비동기)
            this.callBackendLoggingAPI('/performance/metric', metricData);

            console.log(`📈 성능 메트릭: ${metricType} = ${metricValue}${unit}`);
            
        } catch (error) {
            console.error('❌ 성능 메트릭 로깅 실패:', error.message);
        }
    }

    /**
     * 에이전트 시스템 상태 요약 로깅
     */
    async logSystemStatus(totalExecutions = 0, successfulExecutions = 0, averageExecutionTime = 0, 
                        activeAgents = [], systemHealth = 'healthy') {
        if (!this.loggingEnabled) return;

        try {
            const statusData = {
                sessionId: this.sessionId,
                totalExecutions,
                successfulExecutions,
                failedExecutions: totalExecutions - successfulExecutions,
                successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) : 0,
                averageExecutionTime,
                activeAgents,
                systemHealth,
                timestamp: new Date().toISOString()
            };

            // 백엔드 로깅 API 호출 (비동기)
            this.callBackendLoggingAPI('/system/status', statusData);

            console.log(`🏥 시스템 상태: ${successfulExecutions}/${totalExecutions} 성공 (${statusData.successRate.toFixed(2)*100}%)`);
            
        } catch (error) {
            console.error('❌ 시스템 상태 로깅 실패:', error.message);
        }
    }

    /**
     * 백엔드 로깅 API 비동기 호출 (실제 HTTP 요청 구현)
     */
    async callBackendLoggingAPI(endpoint, data) {
        try {
            const url = `${this.apiBaseUrl}${endpoint}`;
            
            // 개발 환경에서는 콘솔에 로깅 데이터 출력
            if (process.env.NODE_ENV === 'development') {
                console.log(`🗄️ SQLite 로깅 [${endpoint}]:`, JSON.stringify(data, null, 2));
            }

            // Node.js 환경에서는 실제 HTTP 요청 (프로덕션)
            if (typeof fetch !== 'undefined') {
                // 브라우저 환경
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                if (!result.success) {
                    console.warn(`⚠️ 백엔드 로깅 경고 [${endpoint}]:`, result.error);
                }
                
            } else if (typeof require !== 'undefined') {
                // Node.js 환경 - axios 또는 node-fetch 사용
                try {
                    // axios 시도
                    const axios = require('axios');
                    const response = await axios.post(url, data, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        timeout: 5000 // 5초 타임아웃
                    });

                    if (!response.data.success) {
                        console.warn(`⚠️ 백엔드 로깅 경고 [${endpoint}]:`, response.data.error);
                    }

                } catch (axiosError) {
                    // axios가 없으면 node-fetch 시도
                    try {
                        const fetch = require('node-fetch');
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify(data),
                            timeout: 5000
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }

                        const result = await response.json();
                        if (!result.success) {
                            console.warn(`⚠️ 백엔드 로깅 경고 [${endpoint}]:`, result.error);
                        }

                    } catch (fetchError) {
                        // HTTP 클라이언트가 없으면 로컬 로깅만
                        console.log(`📝 로컬 로깅 [${endpoint}]:`, data);
                    }
                }
            } else {
                // 환경을 특정할 수 없으면 로컬 로깅
                console.log(`📝 로컬 로깅 [${endpoint}]:`, data);
            }
            
        } catch (error) {
            console.error(`❌ 백엔드 로깅 API 호출 실패 [${endpoint}]:`, error.message);
            
            // 실패해도 로컬에는 로깅
            console.log(`📝 로컬 백업 로깅 [${endpoint}]:`, data);
        }
    }

    /**
     * 로깅 시스템 정리 (세션 종료 시)
     */
    async cleanup() {
        try {
            // 활성 실행 정리
            for (const [executionId, execution] of this.activeExecutions) {
                await this.logMCPExecutionEnd(executionId, false, '', '세션 종료로 인한 중단');
            }
            
            this.activeExecutions.clear();
            console.log('🧹 SQLite 로깅 시스템 정리 완료');
            
        } catch (error) {
            console.error('❌ 로깅 시스템 정리 실패:', error.message);
        }
    }

    /**
     * 로깅 상태 조회
     */
    getLoggingStatus() {
        return {
            enabled: this.loggingEnabled,
            sessionId: this.sessionId,
            activeExecutions: this.activeExecutions.size,
            apiBaseUrl: this.apiBaseUrl
        };
    }

    /**
     * 로깅 활성화/비활성화
     */
    setLoggingEnabled(enabled) {
        this.loggingEnabled = enabled;
        console.log(`🗄️ SQLite 로깅 ${enabled ? '활성화' : '비활성화'}`);
    }
}

module.exports = SQLiteAgentLogger;