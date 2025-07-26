/**
 * MCP 마스터 서비스 - 통합 제어 및 관리
 * 
 * 기능:
 * 1. 모든 MCP 서비스 통합 관리
 * 2. 단일 진입점 제공
 * 3. 세션 관리
 * 4. 성능 모니터링
 * 5. 자동 최적화
 */

const SmartMcpOrchestrator = require('./SmartMcpOrchestrator');
const McpCommandInterface = require('./McpCommandInterface');
const McpAutoActivationService = require('./McpAutoActivationService');
const path = require('path');
const fs = require('fs').promises;

class McpMasterService {
    constructor() {
        this.orchestrator = new SmartMcpOrchestrator();
        this.interface = new McpCommandInterface();
        this.autoActivation = new McpAutoActivationService();
        
        this.initialized = false;
        this.currentSession = null;
        this.sessions = new Map();
        this.performanceMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            errorRate: 0
        };
        
        // 마스터 설정
        this.settings = {
            autoActivationEnabled: true,
            sessionPersistence: true,
            performanceMonitoring: true,
            debugMode: false,
            maxSessions: 50,
            sessionTimeout: 3600000, // 1시간
            autoOptimization: true
        };
        
        this.setupPerformanceMonitoring();
    }

    /**
     * 마스터 서비스 초기화
     */
    async initialize() {
        if (this.initialized) return;
        
        const startTime = Date.now();
        console.log('🚀 MCP 마스터 서비스 초기화 시작');
        
        try {
            // 모든 하위 서비스 초기화
            await Promise.all([
                this.orchestrator.initialize(),
                this.interface.initialize(),
                this.autoActivation.initialize()
            ]);
            
            // 마스터 설정 로드
            await this.loadMasterSettings();
            
            // 세션 관리 시작
            this.startSessionManagement();
            
            // 성능 모니터링 시작
            this.startPerformanceMonitoring();
            
            this.initialized = true;
            const initTime = Date.now() - startTime;
            
            console.log('✅ MCP 마스터 서비스 초기화 완료');
            console.log(`⏱️ 초기화 시간: ${initTime}ms`);
            console.log('📊 시스템 상태:');
            console.log(`   - Orchestrator: ${this.orchestrator.initialized ? '✅' : '❌'}`);
            console.log(`   - Interface: ${this.interface.initialized ? '✅' : '❌'}`);
            console.log(`   - Auto Activation: ${this.autoActivation.initialized ? '✅' : '❌'}`);
            
        } catch (error) {
            console.error('❌ MCP 마스터 서비스 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 메인 처리 함수 - 모든 요청의 진입점
     */
    async processRequest(userInput, options = {}) {
        await this.initialize();
        
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        
        console.log(`🎯 요청 처리 시작 [${requestId}]:`, userInput);
        
        try {
            this.performanceMetrics.totalRequests++;
            
            // 1. 세션 생성 또는 복원
            const session = await this.createOrRestoreSession(options.sessionId);
            
            // 2. 컨텍스트 준비
            const context = await this.prepareContext(userInput, options, session);
            
            // 3. 자동 활성화 실행 (설정이 활성화된 경우)
            let autoActivationResult = null;
            if (this.settings.autoActivationEnabled) {
                autoActivationResult = await this.autoActivation.autoActivate(userInput, context);
            }
            
            // 4. 명령어 인터페이스를 통한 처리
            const interfaceResult = await this.interface.processUserInput(userInput, context);
            
            // 5. 결과 통합 및 최적화
            const finalResult = await this.integrateResults(
                autoActivationResult, 
                interfaceResult, 
                context,
                session
            );
            
            // 6. 세션 업데이트
            await this.updateSession(session, userInput, finalResult);
            
            // 7. 성능 메트릭 업데이트
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
            
            console.log(`✅ 요청 처리 완료 [${requestId}] - ${responseTime}ms`);
            
            return {
                requestId: requestId,
                sessionId: session.id,
                success: true,
                result: finalResult,
                performance: {
                    responseTime: responseTime,
                    autoActivated: !!autoActivationResult,
                    serverCount: finalResult.config ? finalResult.config.servers.length : 0
                },
                recommendations: this.generateRecommendations(finalResult, context, session)
            };
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, false);
            
            console.error(`❌ 요청 처리 실패 [${requestId}]:`, error);
            
            return {
                requestId: requestId,
                success: false,
                error: error.message,
                fallback: await this.generateFallbackResponse(userInput, options),
                performance: {
                    responseTime: responseTime,
                    error: true
                }
            };
        }
    }

    /**
     * 세션 생성 또는 복원
     */
    async createOrRestoreSession(sessionId) {
        if (sessionId && this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            session.lastAccessed = Date.now();
            session.requestCount++;
            return session;
        }
        
        const newSession = {
            id: sessionId || this.generateSessionId(),
            created: Date.now(),
            lastAccessed: Date.now(),
            requestCount: 1,
            context: {},
            history: [],
            preferences: new Map(),
            performance: {
                totalTime: 0,
                averageTime: 0,
                successRate: 1.0
            }
        };
        
        this.sessions.set(newSession.id, newSession);
        this.cleanupOldSessions(); // 오래된 세션 정리
        
        console.log(`📝 새 세션 생성: ${newSession.id}`);
        return newSession;
    }

    /**
     * 컨텍스트 준비
     */
    async prepareContext(userInput, options, session) {
        const context = {
            userInput: userInput,
            sessionId: session.id,
            sessionContext: session.context,
            sessionHistory: session.history.slice(-5), // 최근 5개만
            userPreferences: Object.fromEntries(session.preferences),
            ...options.context
        };
        
        // 프로젝트 정보 추가
        if (!context.projectPath) {
            context.projectPath = process.cwd();
            context.projectName = path.basename(context.projectPath);
        }
        
        return context;
    }

    /**
     * 결과 통합 및 최적화
     */
    async integrateResults(autoActivationResult, interfaceResult, context, session) {
        // 자동 활성화 결과가 있는 경우 우선 사용
        if (autoActivationResult && autoActivationResult.success) {
            const integrated = {
                type: 'auto_activated',
                config: autoActivationResult.config,
                autoActivation: autoActivationResult,
                interface: interfaceResult,
                explanation: this.generateIntegratedExplanation(autoActivationResult, interfaceResult),
                optimizations: []
            };
            
            // 성능 최적화 적용
            if (this.settings.autoOptimization) {
                integrated.optimizations = await this.applyAutoOptimizations(integrated, context, session);
            }
            
            return integrated;
        }
        
        // 인터페이스 결과 사용
        return {
            type: 'interface_processed',
            config: this.extractConfigFromInterface(interfaceResult),
            interface: interfaceResult,
            explanation: interfaceResult.summary || interfaceResult.quickStart || '처리 완료',
            optimizations: []
        };
    }

    /**
     * 세션 업데이트
     */
    async updateSession(session, userInput, result) {
        // 이력 추가
        session.history.push({
            timestamp: Date.now(),
            userInput: userInput,
            result: result,
            performance: result.performance || {}
        });
        
        // 최대 20개까지만 보관
        if (session.history.length > 20) {
            session.history = session.history.slice(-20);
        }
        
        // 컨텍스트 업데이트
        if (result.config) {
            session.context.lastUsedServers = result.config.servers;
            session.context.lastMode = result.config.mode;
        }
        
        // 성능 메트릭 업데이트
        if (result.performance && result.performance.responseTime) {
            session.performance.totalTime += result.performance.responseTime;
            session.performance.averageTime = session.performance.totalTime / session.requestCount;
        }
        
        session.lastAccessed = Date.now();
        
        // 세션 지속성이 활성화된 경우 저장
        if (this.settings.sessionPersistence) {
            await this.persistSession(session);
        }
    }

    /**
     * 추천사항 생성
     */
    generateRecommendations(result, context, session) {
        const recommendations = [];
        
        // 성능 기반 추천
        if (session.performance.averageTime > 5000) { // 5초 이상
            recommendations.push({
                type: 'performance',
                title: '응답 속도 개선',
                description: '평균 응답 시간이 길어보입니다. /quick 모드 사용을 고려해보세요.',
                action: '다음번에 "/quick"을 사용해보세요.',
                priority: 'medium'
            });
        }
        
        // 사용 패턴 기반 추천
        if (session.requestCount > 5) {
            const serverUsage = this.analyzeServerUsage(session);
            if (serverUsage.mostUsed && serverUsage.mostUsed.count > 3) {
                recommendations.push({
                    type: 'usage_pattern',
                    title: '개인화된 설정',
                    description: `${serverUsage.mostUsed.server} 서버를 자주 사용하시네요. 기본 설정으로 추가하시겠습니까?`,
                    action: `설정에서 기본 서버에 ${serverUsage.mostUsed.server}를 추가할 수 있습니다.`,
                    priority: 'low'
                });
            }
        }
        
        // 프로젝트 기반 추천
        if (context.projectType && context.projectType !== 'general') {
            recommendations.push({
                type: 'project_specific',
                title: '프로젝트 최적화',
                description: `${context.projectType} 프로젝트에 특화된 설정을 사용하고 있습니다.`,
                action: `/${context.projectType === 'spring-boot' ? 'dev' : context.projectType} 모드를 시도해보세요.`,
                priority: 'low'
            });
        }
        
        return recommendations;
    }

    /**
     * 자동 최적화 적용
     */
    async applyAutoOptimizations(result, context, session) {
        const optimizations = [];
        
        // 서버 수 최적화
        if (result.config.servers.length > 4) {
            result.config.servers = result.config.servers.slice(0, 4);
            optimizations.push('서버 수를 4개로 제한하여 성능 최적화');
        }
        
        // 플래그 최적화
        if (session.performance.averageTime > 3000 && !result.config.flags.includes('--uc')) {
            result.config.flags.push('--uc');
            optimizations.push('응답 시간 개선을 위해 압축 모드 활성화');
        }
        
        // 캐시 최적화
        if (session.requestCount > 3 && result.config.servers.includes('context7')) {
            result.config.cacheOptimized = true;
            optimizations.push('반복 사용을 위한 캐시 최적화 활성화');
        }
        
        return optimizations;
    }

    /**
     * 통합 설명 생성
     */
    generateIntegratedExplanation(autoResult, interfaceResult) {
        let explanation = '🤖 **자동 MCP 활성화 완료**\n\n';
        
        if (autoResult.explanation) {
            explanation += autoResult.explanation + '\n\n';
        }
        
        if (interfaceResult.summary) {
            explanation += '📋 **추가 정보**:\n';
            explanation += interfaceResult.summary.substring(0, 300) + '...\n\n';
        }
        
        explanation += '💡 이 설정은 프로젝트와 사용 패턴을 분석하여 자동으로 최적화되었습니다.';
        
        return explanation;
    }

    /**
     * 인터페이스 결과에서 설정 추출
     */
    extractConfigFromInterface(interfaceResult) {
        if (interfaceResult.type === 'super_command') {
            return {
                mode: 'super_command',
                servers: interfaceResult.activatedServers.map(s => s.id),
                flags: interfaceResult.flags,
                source: 'super_command'
            };
        }
        
        if (interfaceResult.recommendation && interfaceResult.recommendation.servers) {
            return {
                mode: 'recommendation',
                servers: interfaceResult.recommendation.servers,
                flags: interfaceResult.recommendation.flags || [],
                source: 'recommendation'
            };
        }
        
        return {
            mode: 'fallback',
            servers: ['context7'],
            flags: ['--c7'],
            source: 'fallback'
        };
    }

    /**
     * 폴백 응답 생성
     */
    async generateFallbackResponse(userInput, options) {
        return {
            type: 'fallback',
            config: {
                mode: 'emergency',
                servers: ['context7'],
                flags: ['--c7'],
                explanation: '오류가 발생하여 기본 설정을 사용합니다.'
            },
            message: '일시적인 문제가 발생했습니다. Context7 서버로 기본 지원을 제공합니다.',
            suggestion: '문제가 지속되면 "/quick" 명령어를 시도해보세요.'
        };
    }

    // === 성능 모니터링 ===

    setupPerformanceMonitoring() {
        if (!this.settings.performanceMonitoring) return;
        
        // 메모리 사용량 모니터링
        setInterval(() => {
            if (this.settings.debugMode) {
                const memUsage = process.memoryUsage();
                console.log('📊 메모리 사용량:', {
                    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                    external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
                });
            }
        }, 60000); // 1분마다
    }

    startPerformanceMonitoring() {
        if (!this.settings.performanceMonitoring) return;
        
        console.log('📈 성능 모니터링 시작');
        
        // 주기적 성능 리포트
        setInterval(() => {
            this.generatePerformanceReport();
        }, 300000); // 5분마다
    }

    updatePerformanceMetrics(responseTime, success) {
        if (success) {
            this.performanceMetrics.successfulRequests++;
        }
        
        const totalRequests = this.performanceMetrics.totalRequests;
        const currentAvg = this.performanceMetrics.averageResponseTime;
        
        this.performanceMetrics.averageResponseTime = 
            (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
        
        this.performanceMetrics.errorRate = 
            1 - (this.performanceMetrics.successfulRequests / totalRequests);
    }

    generatePerformanceReport() {
        const metrics = this.performanceMetrics;
        
        console.log('📊 성능 리포트:');
        console.log(`   총 요청: ${metrics.totalRequests}`);
        console.log(`   성공률: ${Math.round((1 - metrics.errorRate) * 100)}%`);
        console.log(`   평균 응답시간: ${Math.round(metrics.averageResponseTime)}ms`);
        console.log(`   활성 세션: ${this.sessions.size}`);
        
        if (metrics.averageResponseTime > 5000) {
            console.warn('⚠️ 평균 응답시간이 5초를 초과했습니다. 최적화가 필요합니다.');
        }
    }

    // === 세션 관리 ===

    startSessionManagement() {
        // 주기적 세션 정리
        setInterval(() => {
            this.cleanupOldSessions();
        }, 300000); // 5분마다
        
        console.log('📝 세션 관리 시작');
    }

    cleanupOldSessions() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [sessionId, session] of this.sessions) {
            if (now - session.lastAccessed > this.settings.sessionTimeout) {
                this.sessions.delete(sessionId);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`🧹 ${cleanedCount}개의 오래된 세션을 정리했습니다.`);
        }
        
        // 최대 세션 수 제한
        if (this.sessions.size > this.settings.maxSessions) {
            const sortedSessions = Array.from(this.sessions.entries())
                .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
            
            const toRemove = sortedSessions.slice(0, this.sessions.size - this.settings.maxSessions);
            toRemove.forEach(([sessionId]) => {
                this.sessions.delete(sessionId);
            });
            
            console.log(`🧹 최대 세션 수 제한으로 ${toRemove.length}개 세션을 정리했습니다.`);
        }
    }

    async persistSession(session) {
        // 실제 구현에서는 데이터베이스나 파일 시스템에 저장
        // 여기서는 간단히 메모리에만 유지
        return true;
    }

    // === 유틸리티 ===

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    analyzeServerUsage(session) {
        const serverCounts = new Map();
        
        session.history.forEach(entry => {
            if (entry.result.config && entry.result.config.servers) {
                entry.result.config.servers.forEach(server => {
                    serverCounts.set(server, (serverCounts.get(server) || 0) + 1);
                });
            }
        });
        
        const sorted = Array.from(serverCounts.entries())
            .sort((a, b) => b[1] - a[1]);
        
        return {
            mostUsed: sorted.length > 0 ? { server: sorted[0][0], count: sorted[0][1] } : null,
            distribution: Object.fromEntries(serverCounts)
        };
    }

    async loadMasterSettings() {
        try {
            const settingsPath = path.join(__dirname, '../config/master-settings.json');
            const data = await fs.readFile(settingsPath, 'utf8');
            const loadedSettings = JSON.parse(data);
            
            Object.assign(this.settings, loadedSettings);
            console.log('⚙️ 마스터 설정 로드 완료');
        } catch (error) {
            console.log('📋 기본 마스터 설정 사용');
        }
    }

    // === 공개 API ===

    /**
     * 빠른 처리 (간단한 요청용)
     */
    async quickProcess(userInput) {
        return await this.processRequest(userInput, { 
            context: { mode: 'quick' },
            sessionId: 'quick_session'
        });
    }

    /**
     * 상태 확인
     */
    getStatus() {
        return {
            initialized: this.initialized,
            services: {
                orchestrator: this.orchestrator.initialized,
                interface: this.interface.initialized,
                autoActivation: this.autoActivation.initialized
            },
            performance: this.performanceMetrics,
            sessions: {
                active: this.sessions.size,
                total: this.performanceMetrics.totalRequests
            },
            settings: this.settings
        };
    }

    /**
     * 설정 업데이트
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        console.log('⚙️ 마스터 설정 업데이트:', newSettings);
    }

    /**
     * 통계 정보
     */
    getStatistics() {
        return {
            master: {
                performance: this.performanceMetrics,
                sessions: this.sessions.size,
                uptime: Date.now() - (this.initTime || Date.now())
            },
            orchestrator: this.orchestrator.getStatistics ? this.orchestrator.getStatistics() : {},
            interface: this.interface.getStatistics ? this.interface.getStatistics() : {},
            autoActivation: this.autoActivation.getStatistics ? this.autoActivation.getStatistics() : {}
        };
    }

    /**
     * 도움말
     */
    getHelp() {
        return this.interface.generateHelp();
    }

    /**
     * 정리
     */
    async cleanup() {
        console.log('🧹 MCP 마스터 서비스 정리 시작');
        
        try {
            // 모든 하위 서비스 정리
            await Promise.all([
                this.orchestrator.cleanup ? this.orchestrator.cleanup() : Promise.resolve(),
                this.interface.cleanup ? this.interface.cleanup() : Promise.resolve(),
                this.autoActivation.cleanup ? this.autoActivation.cleanup() : Promise.resolve()
            ]);
            
            // 세션 정리
            this.sessions.clear();
            
            console.log('✅ MCP 마스터 서비스 정리 완료');
        } catch (error) {
            console.error('❌ MCP 마스터 서비스 정리 실패:', error);
        }
    }
}

module.exports = McpMasterService;