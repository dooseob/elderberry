/**
 * 커스텀 명령어와 Claude Code 통합 시스템
 * Claude Code 세션에서 커스텀 명령어를 자동으로 감지하고 처리
 */

const { handleCustomCommand, getCommandHelp, getCommandStatus } = require('./CustomCommandHandler');

class CommandIntegration {
    constructor() {
        this.isActive = false;
        this.interceptedCommands = [];
        this.originalConsoleLog = console.log;
        this.setupComplete = false;
    }

    /**
     * Claude Code와의 통합 설정
     */
    async setup() {
        if (this.setupComplete) {
            console.log('✅ 커스텀 명령어 시스템이 이미 활성화되어 있습니다.');
            return;
        }

        console.log('🔧 커스텀 명령어 시스템 설정 중...');
        
        try {
            // 환경 확인
            await this.checkEnvironment();
            
            // 명령어 감지 시스템 활성화
            this.activateCommandDetection();
            
            // 도움말 출력
            this.showWelcomeMessage();
            
            this.setupComplete = true;
            this.isActive = true;
            
            console.log('✅ 커스텀 명령어 시스템 활성화 완료!');
            
        } catch (error) {
            console.error('❌ 커스텀 명령어 시스템 설정 실패:', error);
            throw error;
        }
    }

    /**
     * 환경 확인
     */
    async checkEnvironment() {
        // Claude Code 환경 확인
        const isClaudeCode = process.env.CLAUDE_CODE_SESSION || 
                           process.argv.some(arg => arg.includes('claude')) ||
                           process.title.includes('claude');
        
        if (!isClaudeCode) {
            console.warn('⚠️  Claude Code 환경이 아닐 수 있습니다. 일부 기능이 제한될 수 있습니다.');
        }

        // 필요한 서비스 확인
        const requiredServices = [
            './IntegratedAgentSystem',
            './ProgressTracker', 
            './RealTimeLearningSystem'
        ];

        for (const service of requiredServices) {
            try {
                require(service);
            } catch (error) {
                throw new Error(`필수 서비스 로드 실패: ${service}`);
            }
        }
    }

    /**
     * 명령어 감지 시스템 활성화
     */
    activateCommandDetection() {
        // 프로세스 입력 감지 (Claude Code에서 사용자 입력 감지)
        if (process.stdin && process.stdin.setRawMode) {
            this.setupInputListener();
        }

        // 글로벌 명령어 핸들러 등록
        global.handleCustomCommand = this.handleGlobalCommand.bind(this);
        global.claudeCommands = {
            help: () => getCommandHelp(),
            status: () => getCommandStatus(),
            setup: () => this.setup()
        };
    }

    /**
     * 입력 리스너 설정
     */
    setupInputListener() {
        // Claude Code는 이미 입력을 처리하므로 
        // 여기서는 글로벌 함수만 등록
        console.log('📡 글로벌 명령어 감지기 활성화');
    }

    /**
     * 글로벌 명령어 핸들러
     */
    async handleGlobalCommand(input) {
        if (!this.isActive) {
            await this.setup();
        }

        const trimmed = input.trim();
        
        // 커스텀 명령어 확인
        if (this.isCustomCommand(trimmed)) {
            console.log(`🎯 커스텀 명령어 감지: ${trimmed}`);
            
            try {
                const result = await handleCustomCommand(trimmed);
                this.logCommandResult(result);
                return result;
            } catch (error) {
                console.error('❌ 커스텀 명령어 처리 실패:', error);
                return {
                    success: false,
                    error: error.message,
                    suggestion: '명령어 형식을 확인하고 다시 시도해주세요.'
                };
            }
        }

        // 일반 입력은 그대로 전달
        return null;
    }

    /**
     * 커스텀 명령어 여부 확인
     */
    isCustomCommand(input) {
        return input.startsWith('/max ') || 
               input.startsWith('/auto ') || 
               input.startsWith('/smart ') ||
               input === '/max' ||
               input === '/auto' ||
               input === '/smart';
    }

    /**
     * 명령어 실행 결과 로깅
     */
    logCommandResult(result) {
        if (result.success) {
            console.log(`✅ ${result.command} 명령어 성공`);
            if (result.stats) {
                console.log(`   📊 통계: ${JSON.stringify(result.stats, null, 2)}`);
            }
        } else {
            console.log(`❌ ${result.command || '명령어'} 실행 실패: ${result.error || result.message}`);
            if (result.suggestion) {
                console.log(`   💡 제안: ${result.suggestion}`);
            }
        }
    }

    /**
     * 환영 메시지 출력
     */
    showWelcomeMessage() {
        console.log('');
        console.log('🎉 커스텀 명령어 시스템이 활성화되었습니다!');
        console.log('');
        console.log('📋 사용 가능한 명령어:');
        console.log('   • /max 작업내용    - 모든 리소스 최대 활용');
        console.log('   • /auto 작업내용   - 자동 분석 및 최적 실행');
        console.log('   • /smart 작업내용  - 지능형 효율적 처리');
        console.log('');
        console.log('💡 사용 예시:');
        console.log('   /max TypeScript 오류 수정해줘');
        console.log('   /auto 성능 최적화');
        console.log('   /smart UI 컴포넌트 개선');
        console.log('');
        console.log('❓ 도움말: global.claudeCommands.help()');
        console.log('📊 상태 확인: global.claudeCommands.status()');
        console.log('');
    }

    /**
     * 시스템 비활성화
     */
    deactivate() {
        this.isActive = false;
        console.log('🔴 커스텀 명령어 시스템 비활성화');
    }

    /**
     * 통계 조회
     */
    getStats() {
        return {
            isActive: this.isActive,
            setupComplete: this.setupComplete,
            interceptedCommands: this.interceptedCommands.length,
            recentCommands: this.interceptedCommands.slice(-5)
        };
    }
}

// 전역 인스턴스
const globalIntegration = new CommandIntegration();

/**
 * 자동 초기화 (Claude Code 환경에서)
 */
async function autoInit() {
    try {
        // Claude Code 환경에서 자동으로 활성화
        if (process.env.NODE_ENV !== 'test') {
            await globalIntegration.setup();
        }
    } catch (error) {
        console.warn('커스텀 명령어 자동 초기화 실패 (수동 설정 필요):', error.message);
    }
}

/**
 * 편의 함수들
 */
async function setupCustomCommands() {
    return await globalIntegration.setup();
}

function getIntegrationStats() {
    return globalIntegration.getStats();
}

// Claude Code 환경에서 자동 초기화 시도
if (typeof process !== 'undefined' && process.env) {
    // 비동기로 초기화 (모듈 로딩 차단 방지)
    setTimeout(() => autoInit(), 100);
}

module.exports = {
    CommandIntegration,
    globalIntegration,
    setupCustomCommands,
    getIntegrationStats,
    autoInit
};