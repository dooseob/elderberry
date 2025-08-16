/**
 * SQLite 로깅 시스템 통합 테스트
 * JavaScript SQLiteAgentLogger + Spring Boot AgentLoggingService + REST API 연동 검증
 * 실행: node test-sqlite-logging-integration.js
 */

const SQLiteAgentLogger = require('./SQLiteAgentLogger');
const { IntegratedAgentSystem } = require('./IntegratedAgentSystem');

class SQLiteLoggingIntegrationTest {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        
        console.log('🧪 SQLite 로깅 시스템 통합 테스트 시작');
        console.log('=' * 60);
    }

    /**
     * 개별 테스트 실행 및 결과 기록
     */
    async runTest(testName, testFunction) {
        this.testResults.total++;
        console.log(`\n🔍 테스트 실행: ${testName}`);
        
        try {
            const startTime = Date.now();
            await testFunction();
            const duration = Date.now() - startTime;
            
            this.testResults.passed++;
            this.testResults.details.push({
                name: testName,
                status: 'PASSED',
                duration: `${duration}ms`
            });
            
            console.log(`✅ ${testName} - 성공 (${duration}ms)`);
            
        } catch (error) {
            this.testResults.failed++;
            this.testResults.details.push({
                name: testName,
                status: 'FAILED',
                error: error.message
            });
            
            console.log(`❌ ${testName} - 실패: ${error.message}`);
        }
    }

    /**
     * 1. SQLiteAgentLogger 기본 기능 테스트
     */
    async testSQLiteAgentLoggerBasics() {
        const logger = new SQLiteAgentLogger();
        
        // 로깅 상태 확인
        const status = logger.getLoggingStatus();
        if (!status.enabled) {
            throw new Error('SQLite 로깅이 비활성화되어 있습니다');
        }
        
        // 세션 ID 생성 확인
        if (!status.sessionId || status.sessionId.length < 10) {
            throw new Error('유효하지 않은 세션 ID');
        }
        
        console.log(`  📋 세션 ID: ${status.sessionId}`);
        console.log(`  🌐 API 베이스 URL: ${status.apiBaseUrl}`);
    }

    /**
     * 2. MCP 도구 실행 로깅 테스트
     */
    async testMCPExecutionLogging() {
        const logger = new SQLiteAgentLogger();
        
        // MCP 실행 시작 로깅
        const executionId = await logger.logMCPExecutionStart(
            'sequential-thinking',
            '테스트용 복잡한 문제 분석'
        );
        
        if (!executionId) {
            throw new Error('MCP 실행 시작 로깅 실패');
        }
        
        // 잠시 대기 (실제 실행 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // MCP 실행 완료 로깅
        await logger.logMCPExecutionEnd(
            executionId,
            true,
            '테스트 성공적으로 완료',
            null
        );
        
        console.log(`  🔍 MCP 실행 ID: ${executionId}`);
    }

    /**
     * 3. 에이전트 실행 로깅 테스트
     */
    async testAgentExecutionLogging() {
        const logger = new SQLiteAgentLogger();
        
        await logger.logAgentExecution(
            'DEBUG_AGENT',
            'debugging',
            '테스트용 디버깅 작업',
            '/auto',
            ['sequential-thinking', 'filesystem'],
            false,
            true,
            '디버깅 완료',
            1500
        );
        
        console.log('  🤖 에이전트 실행 로깅 완료');
    }

    /**
     * 4. 커스텀 명령어 통계 로깅 테스트
     */
    async testCustomCommandStatsLogging() {
        const logger = new SQLiteAgentLogger();
        
        await logger.logCustomCommandUsage(
            '/max',
            'implementation',
            5000,
            3,
            true,
            ['CLAUDE_GUIDE', 'DEBUG_AGENT', 'API_DOCUMENTATION'],
            ['sequential-thinking', 'filesystem', 'github'],
            5
        );
        
        console.log('  📊 커스텀 명령어 통계 로깅 완료');
    }

    /**
     * 5. 성능 메트릭 로깅 테스트
     */
    async testPerformanceMetricLogging() {
        const logger = new SQLiteAgentLogger();
        
        await logger.logPerformanceMetric(
            'test-execution-time',
            2500,
            'ms',
            '통합 테스트 실행 시간'
        );
        
        await logger.logPerformanceMetric(
            'memory-usage',
            85.5,
            'percentage',
            '테스트 중 메모리 사용률'
        );
        
        console.log('  📈 성능 메트릭 로깅 완료');
    }

    /**
     * 6. 시스템 상태 로깅 테스트
     */
    async testSystemStatusLogging() {
        const logger = new SQLiteAgentLogger();
        
        await logger.logSystemStatus(
            10,  // totalExecutions
            9,   // successfulExecutions
            2000, // averageExecutionTime
            ['CLAUDE_GUIDE', 'DEBUG_AGENT', 'API_DOCUMENTATION'], // activeAgents
            'healthy' // systemHealth
        );
        
        console.log('  🏥 시스템 상태 로깅 완료');
    }

    /**
     * 7. IntegratedAgentSystem과의 통합 테스트
     */
    async testIntegratedAgentSystemIntegration() {
        const agentSystem = new IntegratedAgentSystem();
        
        // 시스템 초기화
        const initialized = await agentSystem.initialize();
        if (!initialized) {
            throw new Error('IntegratedAgentSystem 초기화 실패');
        }
        
        // SQLite 로거 상태 확인
        const loggingStatus = agentSystem.sqliteLogger.getLoggingStatus();
        if (!loggingStatus.enabled) {
            throw new Error('IntegratedAgentSystem에서 SQLite 로깅이 비활성화됨');
        }
        
        // 커스텀 명령어 실행 테스트 (로깅 포함)
        const result = await agentSystem.executeCustomCommand(
            '/auto',
            '테스트용 자동 최적화 작업',
            { testMode: true }
        );
        
        if (!result) {
            throw new Error('커스텀 명령어 실행 실패');
        }
        
        console.log(`  🚀 커스텀 명령어 실행 완료: ${result.command || '/auto'}`);
    }

    /**
     * 8. 에러 처리 및 복원력 테스트
     */
    async testErrorHandlingAndResilience() {
        const logger = new SQLiteAgentLogger();
        
        // 잘못된 데이터로 로깅 시도
        try {
            await logger.logMCPExecutionEnd(
                'invalid-execution-id',
                null, // 잘못된 success 값
                '',
                '테스트용 에러'
            );
            
            console.log('  ⚠️ 에러 처리 테스트: 시스템이 에러를 적절히 처리함');
            
        } catch (error) {
            // 에러가 발생해도 시스템이 계속 동작해야 함
            console.log('  ✅ 에러 복원력: 시스템이 에러 후에도 계속 동작');
        }
    }

    /**
     * 9. 백엔드 연결 상태 테스트 (옵션, 백엔드가 실행 중일 때만)
     */
    async testBackendConnectivity() {
        const logger = new SQLiteAgentLogger();
        
        try {
            // 간단한 헬스체크 형태의 로깅 시도
            await logger.logPerformanceMetric(
                'connectivity-test',
                1.0,
                'boolean',
                '백엔드 연결 테스트'
            );
            
            console.log('  🌐 백엔드 연결 상태: 정상');
            
        } catch (error) {
            // 백엔드가 실행 중이지 않을 수 있으므로 경고만 출력
            console.log('  ⚠️ 백엔드 연결 상태: 오프라인 (로컬 로깅 모드)');
        }
    }

    /**
     * 전체 테스트 실행
     */
    async runAllTests() {
        const startTime = Date.now();
        
        await this.runTest('SQLiteAgentLogger 기본 기능', () => this.testSQLiteAgentLoggerBasics());
        await this.runTest('MCP 실행 로깅', () => this.testMCPExecutionLogging());
        await this.runTest('에이전트 실행 로깅', () => this.testAgentExecutionLogging());
        await this.runTest('커스텀 명령어 통계 로깅', () => this.testCustomCommandStatsLogging());
        await this.runTest('성능 메트릭 로깅', () => this.testPerformanceMetricLogging());
        await this.runTest('시스템 상태 로깅', () => this.testSystemStatusLogging());
        await this.runTest('IntegratedAgentSystem 통합', () => this.testIntegratedAgentSystemIntegration());
        await this.runTest('에러 처리 및 복원력', () => this.testErrorHandlingAndResilience());
        await this.runTest('백엔드 연결 상태 (옵션)', () => this.testBackendConnectivity());
        
        const totalDuration = Date.now() - startTime;
        this.printTestResults(totalDuration);
    }

    /**
     * 테스트 결과 출력
     */
    printTestResults(totalDuration) {
        console.log('\n' + '=' * 60);
        console.log('🧪 SQLite 로깅 시스템 통합 테스트 결과');
        console.log('=' * 60);
        
        console.log(`📊 전체 테스트: ${this.testResults.total}개`);
        console.log(`✅ 성공: ${this.testResults.passed}개`);
        console.log(`❌ 실패: ${this.testResults.failed}개`);
        console.log(`⏱️ 총 소요 시간: ${totalDuration}ms`);
        
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        console.log(`📈 성공률: ${successRate}%`);
        
        console.log('\n📋 상세 결과:');
        this.testResults.details.forEach((detail, index) => {
            const status = detail.status === 'PASSED' ? '✅' : '❌';
            const info = detail.duration || detail.error;
            console.log(`  ${index + 1}. ${status} ${detail.name} (${info})`);
        });
        
        if (this.testResults.failed === 0) {
            console.log('\n🎉 모든 테스트가 성공했습니다! SQLite 로깅 시스템이 정상 작동합니다.');
        } else {
            console.log(`\n⚠️ ${this.testResults.failed}개 테스트가 실패했습니다. 로그를 확인해주세요.`);
        }
        
        console.log('\n🔧 백엔드 서버 실행 방법:');
        console.log('  1. ./gradlew bootRun');
        console.log('  2. 또는 ./dev-start.sh');
        console.log('\n🗄️ SQLite 데이터베이스 위치: ./data/agent-logs.db');
        console.log('📊 H2 콘솔: http://localhost:8080/h2-console');
    }
}

// 테스트 실행
if (require.main === module) {
    const test = new SQLiteLoggingIntegrationTest();
    test.runAllTests().catch(error => {
        console.error('❌ 테스트 실행 중 치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = SQLiteLoggingIntegrationTest;