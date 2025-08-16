/**
 * SQLite 로깅 시스템 간단 테스트
 * SQLiteAgentLogger 기본 기능만 테스트
 */

const SQLiteAgentLogger = require('./SQLiteAgentLogger');

async function testSQLiteLogger() {
    console.log('🧪 SQLite 로깅 시스템 간단 테스트 시작');
    console.log('=' * 50);

    try {
        // 1. SQLiteAgentLogger 초기화
        console.log('\n🔍 1. SQLiteAgentLogger 초기화 테스트');
        const logger = new SQLiteAgentLogger();
        
        const status = logger.getLoggingStatus();
        console.log(`✅ 세션 ID: ${status.sessionId}`);
        console.log(`✅ 로깅 활성화: ${status.enabled}`);
        console.log(`✅ API 베이스 URL: ${status.apiBaseUrl}`);

        // 2. MCP 실행 로깅 테스트
        console.log('\n🔍 2. MCP 실행 로깅 테스트');
        const executionId = await logger.logMCPExecutionStart(
            'sequential-thinking',
            '테스트용 MCP 도구 실행'
        );
        console.log(`✅ MCP 실행 시작 로깅 완료: ${executionId}`);

        // 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 100));

        await logger.logMCPExecutionEnd(
            executionId,
            true,
            'MCP 실행 성공',
            null
        );
        console.log('✅ MCP 실행 완료 로깅 완료');

        // 3. 에이전트 실행 로깅 테스트
        console.log('\n🔍 3. 에이전트 실행 로깅 테스트');
        await logger.logAgentExecution(
            'DEBUG_AGENT',
            'testing',
            '테스트용 에이전트 실행',
            '/auto',
            ['sequential-thinking'],
            false,
            true,
            '에이전트 실행 성공',
            500
        );
        console.log('✅ 에이전트 실행 로깅 완료');

        // 4. 커스텀 명령어 통계 로깅 테스트
        console.log('\n🔍 4. 커스텀 명령어 통계 로깅 테스트');
        await logger.logCustomCommandUsage(
            '/auto',
            'testing',
            1000,
            1,
            true,
            ['DEBUG_AGENT'],
            ['sequential-thinking'],
            5
        );
        console.log('✅ 커스텀 명령어 통계 로깅 완료');

        // 5. 성능 메트릭 로깅 테스트
        console.log('\n🔍 5. 성능 메트릭 로깅 테스트');
        await logger.logPerformanceMetric(
            'test-execution-time',
            1500,
            'ms',
            '간단 테스트 실행 시간'
        );
        console.log('✅ 성능 메트릭 로깅 완료');

        // 6. 시스템 상태 로깅 테스트
        console.log('\n🔍 6. 시스템 상태 로깅 테스트');
        await logger.logSystemStatus(
            5,  // totalExecutions
            5,  // successfulExecutions
            800, // averageExecutionTime
            ['DEBUG_AGENT'], // activeAgents
            'healthy' // systemHealth
        );
        console.log('✅ 시스템 상태 로깅 완료');

        // 7. 로깅 시스템 정리
        console.log('\n🔍 7. 로깅 시스템 정리 테스트');
        await logger.cleanup();
        console.log('✅ 로깅 시스템 정리 완료');

        // 테스트 결과 출력
        console.log('\n' + '=' * 50);
        console.log('🎉 SQLite 로깅 시스템 테스트 완료!');
        console.log('✅ 모든 기본 기능이 정상 작동합니다.');
        console.log('\n📋 다음 단계:');
        console.log('1. 백엔드 서버 실행: ./gradlew bootRun');
        console.log('2. 전체 시스템 통합 테스트 실행');
        console.log('3. SQLite 데이터베이스 확인: ./data/agent-logs.db');

    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류 발생:', error.message);
        console.error('스택 트레이스:', error.stack);
        
        console.log('\n🔧 문제 해결 방법:');
        console.log('1. Node.js 버전 확인 (권장: v18+)');
        console.log('2. 필요한 의존성 설치 확인');
        console.log('3. 백엔드 서버 상태 확인');
    }
}

// 테스트 실행
if (require.main === module) {
    testSQLiteLogger();
}

module.exports = { testSQLiteLogger };