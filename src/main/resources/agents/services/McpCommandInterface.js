/**
 * MCP 명령어 인터페이스 - 사용자 친화적 명령어 처리
 * 
 * 기능:
 * 1. 슈퍼 명령어 파싱 및 실행
 * 2. 자연어 입력 해석
 * 3. 사용자 친화적 피드백
 * 4. 명령어 가이드 제공
 */

const SmartMcpOrchestrator = require('./SmartMcpOrchestrator');

class McpCommandInterface {
    constructor() {
        this.orchestrator = new SmartMcpOrchestrator();
        this.initialized = false;
        this.lastRecommendation = null;
        this.commandHistory = [];
        
        // 명령어 별칭 정의
        this.commandAliases = {
            // 한국어 별칭
            '최대': '/max',
            '자동': '/auto',
            '스마트': '/smart',
            '빠르게': '/quick',
            '분석': '/analyze',
            '개발': '/dev',
            '데이터베이스': '/db',
            'DB': '/db',
            '학습': '/learn',
            '협업': '/collab',
            
            // 영어 별칭
            'maximum': '/max',
            'auto': '/auto',
            'smart': '/smart',
            'quick': '/quick',
            'analyze': '/analyze',
            'analysis': '/analyze',
            'dev': '/dev',
            'develop': '/dev',
            'database': '/db',
            'learn': '/learn',
            'collaborate': '/collab',
            
            // 약어
            'max': '/max',
            'a': '/auto',
            's': '/smart',
            'q': '/quick',
            'an': '/analyze',
            'd': '/dev',
            'db': '/db',
            'l': '/learn',
            'c': '/collab'
        };
        
        // 자연어 패턴
        this.naturalLanguagePatterns = [
            {
                pattern: /모든.*서버.*활성화|전체.*기능|최대.*성능/i,
                command: '/max',
                confidence: 0.9
            },
            {
                pattern: /자동.*선택|알아서|스스로|자동으로/i,
                command: '/auto',
                confidence: 0.8
            },
            {
                pattern: /빠르게|빠른|간단히|Simple|quick/i,
                command: '/quick',
                confidence: 0.8
            },
            {
                pattern: /분석|analyze|investigation|조사/i,
                command: '/analyze',
                confidence: 0.7
            },
            {
                pattern: /개발|development|coding|구현/i,
                command: '/dev',
                confidence: 0.7
            },
            {
                pattern: /데이터베이스|database|DB|sql/i,
                command: '/db',
                confidence: 0.8
            },
            {
                pattern: /학습|learn|기억|저장|context/i,
                command: '/learn',
                confidence: 0.7
            },
            {
                pattern: /협업|github|git|collaboration|team/i,
                command: '/collab',
                confidence: 0.7
            }
        ];
    }

    async initialize() {
        if (!this.initialized) {
            await this.orchestrator.initialize();
            this.initialized = true;
            console.log('✅ MCP 명령어 인터페이스 초기화 완료');
        }
    }

    /**
     * 메인 처리 함수 - 사용자 입력을 분석하고 최적 MCP 조합 추천
     */
    async processUserInput(userInput, context = {}) {
        await this.initialize();
        
        console.log('🎯 사용자 입력 처리:', userInput);
        
        try {
            // 1. 명령어 별칭 확인
            const aliasCommand = this.resolveAlias(userInput);
            if (aliasCommand) {
                console.log(`🔄 별칭 해석: "${userInput}" → "${aliasCommand}"`);
                return await this.processCommand(aliasCommand, context);
            }
            
            // 2. 자연어 패턴 매칭
            const naturalCommand = this.matchNaturalLanguage(userInput);
            if (naturalCommand) {
                console.log(`🧠 자연어 해석: "${userInput}" → "${naturalCommand}"`);
                return await this.processCommand(naturalCommand, context);
            }
            
            // 3. 일반 작업 분석
            const recommendation = await this.orchestrator.analyzeAndRecommend(userInput, context);
            this.lastRecommendation = recommendation;
            
            // 4. 사용자 친화적 응답 생성
            const response = this.generateUserFriendlyResponse(recommendation, userInput);
            
            // 5. 명령어 이력 저장
            this.saveCommandHistory(userInput, recommendation);
            
            return response;
            
        } catch (error) {
            console.error('❌ 사용자 입력 처리 실패:', error);
            return this.generateErrorResponse(error, userInput);
        }
    }

    /**
     * 명령어 별칭 해석
     */
    resolveAlias(input) {
        const cleanInput = input.trim().toLowerCase();
        
        // 직접 매칭
        if (this.commandAliases[cleanInput]) {
            return this.commandAliases[cleanInput];
        }
        
        // 부분 매칭 (단어 경계 고려)
        for (const [alias, command] of Object.entries(this.commandAliases)) {
            if (cleanInput.includes(alias)) {
                return command;
            }
        }
        
        return null;
    }

    /**
     * 자연어 패턴 매칭
     */
    matchNaturalLanguage(input) {
        let bestMatch = null;
        let bestScore = 0;
        
        for (const pattern of this.naturalLanguagePatterns) {
            if (pattern.pattern.test(input)) {
                if (pattern.confidence > bestScore) {
                    bestMatch = pattern.command;
                    bestScore = pattern.confidence;
                }
            }
        }
        
        return bestScore > 0.6 ? bestMatch : null;
    }

    /**
     * 슈퍼 명령어 처리
     */
    async processCommand(command, context) {
        const superCommand = { command, config: this.orchestrator.superCommands.get(command) };
        
        if (!superCommand.config) {
            return this.generateUnknownCommandResponse(command);
        }
        
        const result = await this.orchestrator.handleSuperCommand(superCommand, context);
        return this.generateSuperCommandResponse(result);
    }

    /**
     * 사용자 친화적 응답 생성
     */
    generateUserFriendlyResponse(recommendation, userInput) {
        const response = {
            type: 'recommendation',
            userInput: userInput,
            recommendation: recommendation,
            summary: this.generateSummary(recommendation),
            quickStart: this.generateQuickStart(recommendation),
            alternatives: this.generateAlternatives(recommendation),
            tips: this.generateTips(recommendation)
        };
        
        return response;
    }

    /**
     * 슈퍼 명령어 응답 생성
     */
    generateSuperCommandResponse(result) {
        const response = {
            type: 'super_command',
            command: result.command,
            name: result.name,
            description: result.description,
            summary: this.generateSuperCommandSummary(result),
            activatedServers: this.generateServerList(result.servers),
            flags: result.flags,
            performance: result.estimatedPerformance,
            quickStart: `${result.command} 모드가 활성화되었습니다. ${result.explanation}`,
            tips: this.generateSuperCommandTips(result)
        };
        
        return response;
    }

    /**
     * 요약 생성
     */
    generateSummary(recommendation) {
        const serverCount = recommendation.servers.length;
        const confidence = Math.round(recommendation.confidence * 100);
        
        let summary = `📊 **추천 결과 요약**\n\n`;
        summary += `• **선택된 MCP 서버**: ${serverCount}개\n`;
        summary += `• **추천 신뢰도**: ${confidence}%\n`;
        summary += `• **예상 성능**: ${this.getPerformanceText(recommendation.estimatedPerformance)}\n`;
        summary += `• **추천 모드**: ${recommendation.mode}\n\n`;
        
        if (recommendation.servers.length > 0) {
            summary += `🎯 **활성화될 서버들**:\n`;
            recommendation.servers.forEach(server => {
                const config = this.orchestrator.availableServers[server];
                if (config) {
                    summary += `• ${config.name}: ${config.description}\n`;
                }
            });
        }
        
        return summary;
    }

    /**
     * 슈퍼 명령어 요약 생성
     */
    generateSuperCommandSummary(result) {
        let summary = `⚡ **${result.name} 활성화**\n\n`;
        summary += `${result.description}\n\n`;
        
        if (result.servers && result.servers.length > 0) {
            summary += `🔧 **활성화된 서버들**:\n`;
            result.servers.forEach(server => {
                const config = this.orchestrator.availableServers[server];
                if (config) {
                    summary += `• ${config.name}: ${config.description}\n`;
                }
            });
            summary += `\n`;
        }
        
        summary += `📈 **성능 예상**: ${this.getPerformanceText(result.estimatedPerformance)}\n`;
        
        return summary;
    }

    /**
     * 빠른 시작 가이드 생성
     */
    generateQuickStart(recommendation) {
        let quickStart = `🚀 **빠른 시작**\n\n`;
        
        if (recommendation.userFriendlyCommand) {
            quickStart += `다음 명령어로 같은 설정을 다시 사용할 수 있습니다:\n`;
            quickStart += `\`${recommendation.userFriendlyCommand}\`\n\n`;
        }
        
        quickStart += `💡 **사용 팁**:\n`;
        quickStart += `• 이 설정은 자동으로 학습되어 향후 유사한 작업에서 우선 추천됩니다\n`;
        quickStart += `• 더 빠른 응답이 필요하면 \`/quick\`을 사용하세요\n`;
        quickStart += `• 모든 기능을 사용하려면 \`/max\`를 사용하세요\n`;
        
        return quickStart;
    }

    /**
     * 대안 제안 생성
     */
    generateAlternatives(recommendation) {
        const alternatives = [];
        
        // 성능 기반 대안
        if (recommendation.estimatedPerformance.estimatedTime === 'slow') {
            alternatives.push({
                command: '/quick',
                reason: '더 빠른 응답을 원하는 경우'
            });
        }
        
        if (recommendation.servers.length < 3) {
            alternatives.push({
                command: '/max',
                reason: '모든 기능을 활용하고 싶은 경우'
            });
        }
        
        // 작업 특화 대안
        const workTypes = this.detectWorkTypeFromRecommendation(recommendation);
        if (workTypes.includes('database')) {
            alternatives.push({
                command: '/db',
                reason: '데이터베이스 작업에 특화된 설정'
            });
        }
        
        if (workTypes.includes('development')) {
            alternatives.push({
                command: '/dev',
                reason: '개발 작업에 최적화된 설정'
            });
        }
        
        let alternativeText = '';
        if (alternatives.length > 0) {
            alternativeText = `🔄 **다른 옵션들**:\n\n`;
            alternatives.forEach(alt => {
                alternativeText += `• \`${alt.command}\`: ${alt.reason}\n`;
            });
        }
        
        return alternativeText;
    }

    /**
     * 팁 생성
     */
    generateTips(recommendation) {
        const tips = [];
        
        // 성능 팁
        if (recommendation.estimatedPerformance.cacheEffective) {
            tips.push('💾 캐시 기능이 활성화되어 반복 작업이 빨라집니다');
        }
        
        if (recommendation.estimatedPerformance.parallelCapable) {
            tips.push('⚡ 병렬 처리가 가능하여 복잡한 작업도 효율적으로 처리됩니다');
        }
        
        // 서버별 팁
        if (recommendation.servers.includes('memory')) {
            tips.push('🧠 Memory Bank가 활성화되어 대화 컨텍스트가 유지됩니다');
        }
        
        if (recommendation.servers.includes('github')) {
            tips.push('🔗 GitHub 연동이 활성화되어 버전 관리 작업을 도와드릴 수 있습니다');
        }
        
        if (recommendation.servers.includes('postgresql')) {
            tips.push('🗄️ PostgreSQL 연동이 활성화되어 데이터베이스 작업을 지원합니다');
        }
        
        // 학습 팁
        tips.push('📚 이 추천은 사용 패턴 학습을 통해 점점 더 정확해집니다');
        
        let tipText = '';
        if (tips.length > 0) {
            tipText = `💡 **도움이 되는 팁들**:\n\n`;
            tips.forEach(tip => {
                tipText += `${tip}\n`;
            });
        }
        
        return tipText;
    }

    /**
     * 슈퍼 명령어 팁 생성
     */
    generateSuperCommandTips(result) {
        const tips = [];
        
        if (result.command === '/max') {
            tips.push('⚠️ 모든 서버가 활성화되어 리소스 사용량이 높을 수 있습니다');
            tips.push('🚀 복잡한 작업이나 종합적인 분석에 최적화되어 있습니다');
        }
        
        if (result.command === '/quick') {
            tips.push('⚡ 빠른 응답에 최적화되어 있지만 일부 고급 기능은 제한될 수 있습니다');
        }
        
        if (result.command === '/auto') {
            tips.push('🎯 작업 유형을 자동으로 감지하여 최적의 서버 조합을 선택합니다');
        }
        
        if (result.command === '/smart') {
            tips.push('🧠 과거 사용 패턴을 학습하여 개인화된 추천을 제공합니다');
        }
        
        let tipText = '';
        if (tips.length > 0) {
            tipText = `💡 **${result.name} 팁**:\n\n`;
            tips.forEach(tip => {
                tipText += `${tip}\n`;
            });
        }
        
        return tipText;
    }

    /**
     * 서버 목록 생성
     */
    generateServerList(servers) {
        if (!servers || servers.length === 0) return [];
        
        return servers.map(server => {
            const config = this.orchestrator.availableServers[server];
            return {
                id: server,
                name: config ? config.name : server,
                description: config ? config.description : '',
                korean_name: config ? config.korean_name : server
            };
        });
    }

    /**
     * 에러 응답 생성
     */
    generateErrorResponse(error, userInput) {
        return {
            type: 'error',
            userInput: userInput,
            error: error.message,
            suggestion: '기본 설정을 사용하여 계속 진행하시겠습니까? `/quick` 명령어를 시도해보세요.',
            fallback: {
                command: '/quick',
                description: '기본 Context7 서버로 빠른 응답 제공'
            }
        };
    }

    /**
     * 알 수 없는 명령어 응답 생성
     */
    generateUnknownCommandResponse(command) {
        const availableCommands = Array.from(this.orchestrator.superCommands.keys());
        
        return {
            type: 'unknown_command',
            command: command,
            message: `알 수 없는 명령어입니다: ${command}`,
            availableCommands: availableCommands,
            suggestion: '사용 가능한 명령어 목록을 확인하고 다시 시도해주세요.',
            helpCommand: '/help'
        };
    }

    /**
     * 도움말 생성
     */
    generateHelp() {
        let help = `📖 **MCP 자동화 시스템 도움말**\n\n`;
        
        help += `🎯 **슈퍼 명령어들**:\n`;
        for (const [command, config] of this.orchestrator.superCommands) {
            help += `• \`${command}\`: ${config.description}\n`;
        }
        
        help += `\n🗣️ **자연어 명령도 가능**:\n`;
        help += `• "모든 서버 활성화" → /max\n`;
        help += `• "자동으로 선택" → /auto\n`;
        help += `• "빠르게" → /quick\n`;
        help += `• "데이터베이스 작업" → /db\n`;
        
        help += `\n📚 **별칭 사용 가능**:\n`;
        help += `• 한국어: 최대, 자동, 빠르게, 분석, 개발, DB, 학습, 협업\n`;
        help += `• 영어: max, auto, quick, analyze, dev, db, learn, collab\n`;
        help += `• 약어: a, s, q, an, d, db, l, c\n`;
        
        help += `\n💡 **사용 예시**:\n`;
        help += `• "자동으로 최적 설정 선택해줘" → 자동 감지 및 추천\n`;
        help += `• "/dev" → 개발 모드 활성화\n`;
        help += `• "최대" → 모든 서버 활성화\n`;
        help += `• "분석해줘" → 분석 모드 활성화\n`;
        
        return {
            type: 'help',
            content: help,
            commands: Array.from(this.orchestrator.superCommands.keys()),
            aliases: Object.keys(this.commandAliases)
        };
    }

    // === 유틸리티 메서드 ===

    getPerformanceText(performance) {
        const timeMap = {
            'fast': '빠름',
            'medium': '보통',
            'slow': '느림'
        };
        
        const resourceMap = {
            'low': '낮음',
            'medium': '보통',
            'high': '높음'
        };
        
        return `응답속도 ${timeMap[performance.estimatedTime] || performance.estimatedTime}, ` +
               `리소스 사용량 ${resourceMap[performance.resourceUsage] || performance.resourceUsage}`;
    }

    detectWorkTypeFromRecommendation(recommendation) {
        const workTypes = [];
        
        if (recommendation.servers.includes('postgresql')) {
            workTypes.push('database');
        }
        
        if (recommendation.servers.includes('github')) {
            workTypes.push('collaboration');
        }
        
        if (recommendation.servers.includes('filesystem') && recommendation.servers.includes('sequential')) {
            workTypes.push('development');
        }
        
        return workTypes;
    }

    saveCommandHistory(userInput, recommendation) {
        this.commandHistory.push({
            timestamp: new Date().toISOString(),
            userInput: userInput,
            recommendation: recommendation,
            sessionId: this.generateSessionId()
        });
        
        // 최대 50개까지만 보관
        if (this.commandHistory.length > 50) {
            this.commandHistory = this.commandHistory.slice(-50);
        }
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 피드백 수집
     */
    async collectFeedback(sessionId, rating, comments) {
        await this.orchestrator.collectFeedback(sessionId, rating, comments);
        
        const historyEntry = this.commandHistory.find(h => h.sessionId === sessionId);
        if (historyEntry) {
            historyEntry.feedback = {
                rating: rating,
                comments: comments,
                timestamp: new Date().toISOString()
            };
        }
        
        console.log(`📝 사용자 피드백 수집: ${rating}점 - ${comments}`);
    }

    /**
     * 통계 정보 제공
     */
    getStatistics() {
        const orchestratorStats = this.orchestrator.getStatistics();
        const interfaceStats = {
            totalCommands: this.commandHistory.length,
            commandTypes: new Map(),
            averageSessionRating: 0
        };
        
        // 명령어 타입별 통계
        this.commandHistory.forEach(entry => {
            const type = entry.recommendation.mode || 'unknown';
            interfaceStats.commandTypes.set(type, 
                (interfaceStats.commandTypes.get(type) || 0) + 1
            );
            
            if (entry.feedback) {
                interfaceStats.averageSessionRating += entry.feedback.rating;
            }
        });
        
        const feedbackCount = this.commandHistory.filter(h => h.feedback).length;
        if (feedbackCount > 0) {
            interfaceStats.averageSessionRating /= feedbackCount;
        }
        
        return {
            orchestrator: orchestratorStats,
            interface: interfaceStats,
            combined: {
                totalInteractions: orchestratorStats.totalUsages + interfaceStats.totalCommands,
                overallSatisfaction: (orchestratorStats.averageRating + interfaceStats.averageSessionRating) / 2
            }
        };
    }
}

module.exports = McpCommandInterface;