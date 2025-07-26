/**
 * MCP 자동 활성화 서비스 - 기본값 설정 및 자동 활성화
 * 
 * 기능:
 * 1. 기본 MCP 서버 자동 활성화
 * 2. 프로젝트 컨텍스트 기반 자동 감지
 * 3. 사용자 설정 관리
 * 4. 성능 최적화
 */

const path = require('path');
const fs = require('fs').promises;
const SmartMcpOrchestrator = require('./SmartMcpOrchestrator');
const McpCommandInterface = require('./McpCommandInterface');

class McpAutoActivationService {
    constructor() {
        this.orchestrator = new SmartMcpOrchestrator();
        this.interface = new McpCommandInterface();
        this.initialized = false;
        
        // 기본 설정
        this.defaultSettings = {
            autoActivation: true,
            defaultServers: ['context7', 'memory'],
            smartRecommendations: true,
            learningEnabled: true,
            performanceOptimization: true,
            maxServers: 4,
            contextAnalysis: true
        };
        
        this.userSettings = new Map();
        this.projectContextCache = new Map();
        this.activationHistory = [];
        
        // 프로젝트 타입 감지 패턴
        this.projectTypePatterns = {
            'spring-boot': {
                indicators: ['pom.xml', 'build.gradle', 'src/main/java', 'application.properties'],
                recommendedServers: ['context7', 'sequential', 'filesystem', 'memory', 'postgresql'],
                confidence: 0.9
            },
            'react': {
                indicators: ['package.json', 'src/App.js', 'src/App.tsx', 'public/index.html'],
                recommendedServers: ['context7', 'sequential', 'filesystem', 'memory'],
                confidence: 0.9
            },
            'node-backend': {
                indicators: ['package.json', 'server.js', 'app.js', 'routes/', 'controllers/'],
                recommendedServers: ['context7', 'sequential', 'filesystem', 'memory', 'postgresql'],
                confidence: 0.8
            },
            'database-heavy': {
                indicators: ['*.sql', 'migrations/', 'schema/', 'repository/', 'entity/'],
                recommendedServers: ['postgresql', 'context7', 'sequential', 'memory'],
                confidence: 0.9
            },
            'documentation': {
                indicators: ['docs/', '*.md', 'README.md', 'wiki/'],
                recommendedServers: ['context7', 'memory', 'filesystem'],
                confidence: 0.8
            }
        };
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🚀 MCP 자동 활성화 서비스 초기화 시작');
            
            // 의존 서비스 초기화
            await this.orchestrator.initialize();
            await this.interface.initialize();
            
            // 사용자 설정 로드
            await this.loadUserSettings();
            
            // 프로젝트 컨텍스트 분석
            await this.analyzeCurrentProject();
            
            this.initialized = true;
            console.log('✅ MCP 자동 활성화 서비스 초기화 완료');
            
        } catch (error) {
            console.error('❌ MCP 자동 활성화 서비스 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 자동 활성화 실행 - 메인 진입점
     */
    async autoActivate(userInput = '', explicitContext = {}) {
        await this.initialize();
        
        console.log('🎯 MCP 자동 활성화 시작');
        
        try {
            // 1. 컨텍스트 수집
            const context = await this.gatherContext(userInput, explicitContext);
            
            // 2. 기본 서버 활성화 확인
            const defaultActivation = this.checkDefaultActivation(context);
            
            // 3. 스마트 추천 실행
            let recommendation;
            if (userInput && userInput.trim() !== '') {
                recommendation = await this.interface.processUserInput(userInput, context);
            } else {
                recommendation = await this.orchestrator.analyzeAndRecommend('기본 작업', context);
            }
            
            // 4. 기본 설정과 추천 병합
            const finalConfig = this.mergeDefaultAndRecommended(defaultActivation, recommendation);
            
            // 5. 성능 최적화 적용
            const optimizedConfig = this.applyPerformanceOptimization(finalConfig, context);
            
            // 6. 활성화 이력 저장
            await this.saveActivationHistory(userInput, optimizedConfig, context);
            
            console.log('✅ MCP 자동 활성화 완료:', optimizedConfig.servers);
            
            return {
                success: true,
                config: optimizedConfig,
                context: context,
                explanation: this.generateActivationExplanation(optimizedConfig, context),
                performance: optimizedConfig.estimatedPerformance
            };
            
        } catch (error) {
            console.error('❌ MCP 자동 활성화 실패:', error);
            return this.getFallbackActivation(error);
        }
    }

    /**
     * 컨텍스트 수집
     */
    async gatherContext(userInput, explicitContext) {
        const context = {
            userInput: userInput,
            ...explicitContext
        };
        
        // 현재 프로젝트 정보
        const projectContext = await this.getCurrentProjectContext();
        Object.assign(context, projectContext);
        
        // 파일 시스템 분석
        if (!context.files) {
            context.files = await this.analyzeFileSystem();
        }
        
        // 프로젝트 타입 감지
        context.projectType = this.detectProjectType(context.files);
        context.projectComplexity = this.calculateProjectComplexity(context.files);
        
        // 작업 유형 분석
        context.taskType = this.analyzeTaskType(userInput, context);
        
        return context;
    }

    /**
     * 현재 프로젝트 컨텍스트 가져오기
     */
    async getCurrentProjectContext() {
        const projectPath = process.cwd();
        const cacheKey = projectPath;
        
        // 캐시 확인
        if (this.projectContextCache.has(cacheKey)) {
            const cached = this.projectContextCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5분 캐시
                return cached.context;
            }
        }
        
        try {
            const context = {
                projectPath: projectPath,
                projectName: path.basename(projectPath),
                hasGitFiles: await this.checkGitRepository(),
                hasDatabaseFiles: await this.checkDatabaseFiles(),
                hasTestFiles: await this.checkTestFiles(),
                hasReactFiles: await this.checkReactFiles(),
                hasSpringBootFiles: await this.checkSpringBootFiles(),
                fileCount: await this.countFiles(),
                lastModified: await this.getLastModifiedTime()
            };
            
            // 캐시 저장
            this.projectContextCache.set(cacheKey, {
                context: context,
                timestamp: Date.now()
            });
            
            return context;
            
        } catch (error) {
            console.warn('프로젝트 컨텍스트 수집 실패:', error.message);
            return {
                projectPath: projectPath,
                projectName: path.basename(projectPath)
            };
        }
    }

    /**
     * 파일 시스템 분석
     */
    async analyzeFileSystem() {
        try {
            const files = [];
            const projectPath = process.cwd();
            
            // 간단한 파일 목록 수집 (깊이 제한)
            const scanDirectory = async (dir, depth = 0) => {
                if (depth > 3) return; // 최대 3단계까지만
                
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries.slice(0, 50)) { // 최대 50개까지
                    if (entry.name.startsWith('.') && entry.name !== '.git') continue;
                    
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(projectPath, fullPath);
                    
                    if (entry.isDirectory()) {
                        files.push(relativePath + '/');
                        if (['node_modules', 'target', 'build', 'dist'].includes(entry.name)) {
                            continue; // 빌드 디렉토리 제외
                        }
                        await scanDirectory(fullPath, depth + 1);
                    } else {
                        files.push(relativePath);
                    }
                }
            };
            
            await scanDirectory(projectPath);
            return files;
            
        } catch (error) {
            console.warn('파일 시스템 분석 실패:', error.message);
            return [];
        }
    }

    /**
     * 프로젝트 타입 감지
     */
    detectProjectType(files) {
        const detectedTypes = [];
        
        for (const [type, pattern] of Object.entries(this.projectTypePatterns)) {
            let score = 0;
            let foundIndicators = 0;
            
            for (const indicator of pattern.indicators) {
                if (this.hasFilePattern(files, indicator)) {
                    foundIndicators++;
                    score += 1;
                }
            }
            
            if (foundIndicators > 0) {
                const normalizedScore = (foundIndicators / pattern.indicators.length) * pattern.confidence;
                detectedTypes.push({
                    type: type,
                    score: normalizedScore,
                    confidence: pattern.confidence,
                    foundIndicators: foundIndicators,
                    totalIndicators: pattern.indicators.length
                });
            }
        }
        
        // 점수순 정렬
        detectedTypes.sort((a, b) => b.score - a.score);
        
        return detectedTypes.length > 0 ? detectedTypes[0].type : 'general';
    }

    /**
     * 프로젝트 복잡도 계산
     */
    calculateProjectComplexity(files) {
        let complexity = 0;
        
        // 파일 개수 기반 (0-0.3)
        const fileCount = files.length;
        complexity += Math.min(fileCount / 100, 0.3);
        
        // 디렉토리 깊이 기반 (0-0.2)
        const maxDepth = Math.max(...files.map(f => f.split('/').length - 1));
        complexity += Math.min(maxDepth / 10, 0.2);
        
        // 파일 유형 다양성 기반 (0-0.3)
        const extensions = new Set(files.map(f => path.extname(f).toLowerCase()));
        complexity += Math.min(extensions.size / 10, 0.3);
        
        // 특수 파일들 기반 (0-0.2)
        const specialFiles = files.filter(f => 
            f.includes('config') || f.includes('test') || f.includes('docker') || f.includes('CI')
        );
        complexity += Math.min(specialFiles.length / 20, 0.2);
        
        return Math.min(complexity, 1.0);
    }

    /**
     * 작업 유형 분석
     */
    analyzeTaskType(userInput, context) {
        const input = userInput.toLowerCase();
        
        // 키워드 기반 분석
        if (input.includes('분석') || input.includes('analyze') || input.includes('debug')) {
            return 'analysis';
        }
        
        if (input.includes('개발') || input.includes('구현') || input.includes('코드')) {
            return 'development';
        }
        
        if (input.includes('데이터베이스') || input.includes('sql') || input.includes('query')) {
            return 'database';
        }
        
        if (input.includes('문서') || input.includes('document') || input.includes('readme')) {
            return 'documentation';
        }
        
        if (input.includes('git') || input.includes('commit') || input.includes('push')) {
            return 'version_control';
        }
        
        // 컨텍스트 기반 추론
        if (context.projectType === 'database-heavy') {
            return 'database';
        }
        
        if (context.projectType === 'documentation') {
            return 'documentation';
        }
        
        return 'general';
    }

    /**
     * 기본 활성화 확인
     */
    checkDefaultActivation(context) {
        const settings = this.getUserSettings();
        
        if (!settings.autoActivation) {
            return { servers: [], reason: '자동 활성화 비활성화됨' };
        }
        
        const defaultServers = [...settings.defaultServers];
        const reasons = ['기본 설정'];
        
        // 프로젝트 타입별 추가 서버
        if (this.projectTypePatterns[context.projectType]) {
            const projectPattern = this.projectTypePatterns[context.projectType];
            const additionalServers = projectPattern.recommendedServers.filter(
                server => !defaultServers.includes(server)
            );
            
            defaultServers.push(...additionalServers.slice(0, 2)); // 최대 2개 추가
            reasons.push(`${context.projectType} 프로젝트 타입`);
        }
        
        // 복잡도 기반 추가
        if (context.projectComplexity > 0.7) {
            if (!defaultServers.includes('sequential')) {
                defaultServers.push('sequential');
                reasons.push('높은 프로젝트 복잡도');
            }
        }
        
        return {
            servers: defaultServers.slice(0, settings.maxServers),
            reasons: reasons
        };
    }

    /**
     * 기본 설정과 추천 병합
     */
    mergeDefaultAndRecommended(defaultActivation, recommendation) {
        // 추천이 슈퍼 명령어인 경우
        if (recommendation.type === 'super_command') {
            return {
                mode: 'super_command',
                servers: recommendation.activatedServers.map(s => s.id),
                flags: recommendation.flags,
                explanation: recommendation.summary,
                estimatedPerformance: recommendation.performance,
                source: 'super_command'
            };
        }
        
        // 추천과 기본값 병합
        const allServers = new Set();
        
        // 기본 서버 추가
        defaultActivation.servers.forEach(server => allServers.add(server));
        
        // 추천 서버 추가
        if (recommendation.recommendation && recommendation.recommendation.servers) {
            recommendation.recommendation.servers.forEach(server => allServers.add(server));
        }
        
        const settings = this.getUserSettings();
        const finalServers = Array.from(allServers).slice(0, settings.maxServers);
        
        return {
            mode: 'merged',
            servers: finalServers,
            flags: this.generateMergedFlags(finalServers, recommendation),
            explanation: this.generateMergedExplanation(defaultActivation, recommendation),
            estimatedPerformance: this.estimatePerformance(finalServers),
            source: 'auto_merged'
        };
    }

    /**
     * 성능 최적화 적용
     */
    applyPerformanceOptimization(config, context) {
        const settings = this.getUserSettings();
        
        if (!settings.performanceOptimization) {
            return config;
        }
        
        // 서버 개수 제한
        if (config.servers.length > settings.maxServers) {
            config.servers = config.servers.slice(0, settings.maxServers);
        }
        
        // 성능 기반 플래그 추가
        if (config.servers.length > 2 && !config.flags.includes('--uc')) {
            config.flags.push('--uc'); // 토큰 압축
        }
        
        if (context.projectComplexity > 0.8 && !config.flags.includes('--delegate')) {
            config.flags.push('--delegate', 'auto'); // 자동 위임
        }
        
        // 캐시 최적화
        if (config.servers.includes('context7') || config.servers.includes('memory')) {
            config.cacheEnabled = true;
        }
        
        return config;
    }

    /**
     * 활성화 설명 생성
     */
    generateActivationExplanation(config, context) {
        let explanation = `🚀 **MCP 자동 활성화 결과**\n\n`;
        
        explanation += `📊 **활성화된 서버들 (${config.servers.length}개)**:\n`;
        config.servers.forEach(server => {
            const serverConfig = this.orchestrator.availableServers[server];
            if (serverConfig) {
                explanation += `• ${serverConfig.name}: ${serverConfig.description}\n`;
            }
        });
        
        explanation += `\n🎯 **선택 이유**:\n`;
        explanation += `• 프로젝트 타입: ${context.projectType}\n`;
        explanation += `• 프로젝트 복잡도: ${Math.round(context.projectComplexity * 100)}%\n`;
        explanation += `• 작업 유형: ${context.taskType}\n`;
        
        if (config.source) {
            explanation += `• 활성화 방식: ${config.source}\n`;
        }
        
        explanation += `\n⚡ **성능 예상**:\n`;
        explanation += `• 응답 속도: ${config.estimatedPerformance.estimatedTime}\n`;
        explanation += `• 리소스 사용량: ${config.estimatedPerformance.resourceUsage}\n`;
        
        if (config.cacheEnabled) {
            explanation += `• 캐시 최적화: 활성화\n`;
        }
        
        return explanation;
    }

    // === 유틸리티 메서드 ===

    hasFilePattern(files, pattern) {
        if (pattern.includes('*')) {
            // glob 패턴 처리
            const regex = pattern.replace(/\*/g, '.*');
            return files.some(file => new RegExp(regex).test(file));
        } else {
            // 직접 매칭 또는 포함 확인
            return files.some(file => 
                file === pattern || 
                file.includes(pattern) ||
                file.endsWith(pattern)
            );
        }
    }

    async checkGitRepository() {
        try {
            await fs.access('.git');
            return true;
        } catch {
            return false;
        }
    }

    async checkDatabaseFiles() {
        try {
            const files = await this.analyzeFileSystem();
            return files.some(file => 
                file.includes('.sql') || 
                file.includes('repository') || 
                file.includes('entity') ||
                file.includes('migration')
            );
        } catch {
            return false;
        }
    }

    async checkTestFiles() {
        try {
            const files = await this.analyzeFileSystem();
            return files.some(file => 
                file.includes('test') || 
                file.includes('spec') ||
                file.includes('.test.') ||
                file.includes('.spec.')
            );
        } catch {
            return false;
        }
    }

    async checkReactFiles() {
        try {
            const files = await this.analyzeFileSystem();
            return files.some(file => 
                file.includes('App.js') || 
                file.includes('App.tsx') ||
                file.includes('package.json')
            );
        } catch {
            return false;
        }
    }

    async checkSpringBootFiles() {
        try {
            const files = await this.analyzeFileSystem();
            return files.some(file => 
                file.includes('pom.xml') || 
                file.includes('build.gradle') ||
                file.includes('application.properties')
            );
        } catch {
            return false;
        }
    }

    async countFiles() {
        try {
            const files = await this.analyzeFileSystem();
            return files.filter(f => !f.endsWith('/')).length;
        } catch {
            return 0;
        }
    }

    async getLastModifiedTime() {
        try {
            const stat = await fs.stat('.');
            return stat.mtime;
        } catch {
            return new Date();
        }
    }

    generateMergedFlags(servers, recommendation) {
        const flags = [];
        
        // 서버별 플래그
        servers.forEach(server => {
            const serverConfig = this.orchestrator.availableServers[server];
            if (serverConfig && serverConfig.activationFlags.length > 0) {
                const flag = serverConfig.activationFlags[0];
                if (!flags.includes(flag)) {
                    flags.push(flag);
                }
            }
        });
        
        // 추천에서 추가 플래그
        if (recommendation.recommendation && recommendation.recommendation.flags) {
            recommendation.recommendation.flags.forEach(flag => {
                if (!flags.includes(flag)) {
                    flags.push(flag);
                }
            });
        }
        
        return flags;
    }

    generateMergedExplanation(defaultActivation, recommendation) {
        let explanation = '자동 활성화: ';
        explanation += defaultActivation.reasons.join(', ');
        
        if (recommendation.recommendation && recommendation.recommendation.explanation) {
            explanation += ' + 스마트 추천';
        }
        
        return explanation;
    }

    estimatePerformance(servers) {
        const serverCount = servers.length;
        
        let estimatedTime = 'fast';
        let resourceUsage = 'low';
        
        if (serverCount > 2) {
            estimatedTime = 'medium';
            resourceUsage = 'medium';
        }
        
        if (serverCount > 4) {
            estimatedTime = 'slow';
            resourceUsage = 'high';
        }
        
        return {
            estimatedTime,
            resourceUsage,
            parallelCapable: serverCount > 1,
            cacheEffective: servers.includes('context7') || servers.includes('memory')
        };
    }

    getUserSettings() {
        return { ...this.defaultSettings, ...Object.fromEntries(this.userSettings) };
    }

    getFallbackActivation(error) {
        return {
            success: false,
            error: error.message,
            config: {
                mode: 'fallback',
                servers: ['context7'],
                flags: ['--c7'],
                explanation: '오류 발생으로 기본 설정을 사용합니다.',
                estimatedPerformance: this.estimatePerformance(['context7']),
                source: 'fallback'
            },
            fallback: true
        };
    }

    // === 설정 관리 ===

    async loadUserSettings() {
        try {
            const settingsPath = path.join(__dirname, '../config/user-auto-activation-settings.json');
            const data = await fs.readFile(settingsPath, 'utf8');
            const settings = JSON.parse(data);
            
            Object.entries(settings).forEach(([key, value]) => {
                this.userSettings.set(key, value);
            });
            
            console.log(`⚙️ 사용자 자동 활성화 설정 로드 완료`);
        } catch (error) {
            console.log('📋 기본 자동 활성화 설정 사용');
        }
    }

    async saveUserSettings() {
        try {
            const settingsPath = path.join(__dirname, '../config/user-auto-activation-settings.json');
            const settings = Object.fromEntries(this.userSettings);
            await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
            console.log('💾 사용자 설정 저장 완료');
        } catch (error) {
            console.warn('사용자 설정 저장 실패:', error.message);
        }
    }

    async saveActivationHistory(userInput, config, context) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            userInput: userInput,
            config: config,
            context: {
                projectType: context.projectType,
                projectComplexity: context.projectComplexity,
                taskType: context.taskType,
                fileCount: context.fileCount
            }
        };
        
        this.activationHistory.push(historyEntry);
        
        // 최대 100개까지만 보관
        if (this.activationHistory.length > 100) {
            this.activationHistory = this.activationHistory.slice(-100);
        }
    }

    /**
     * 설정 업데이트
     */
    updateSettings(newSettings) {
        Object.entries(newSettings).forEach(([key, value]) => {
            this.userSettings.set(key, value);
        });
        
        this.saveUserSettings();
        console.log('⚙️ 설정 업데이트 완료:', newSettings);
    }

    /**
     * 통계 정보
     */
    getStatistics() {
        const stats = {
            totalActivations: this.activationHistory.length,
            serverPopularity: new Map(),
            projectTypeDistribution: new Map(),
            averageServerCount: 0
        };
        
        this.activationHistory.forEach(entry => {
            // 서버 인기도
            if (entry.config.servers) {
                entry.config.servers.forEach(server => {
                    stats.serverPopularity.set(server, 
                        (stats.serverPopularity.get(server) || 0) + 1
                    );
                });
                stats.averageServerCount += entry.config.servers.length;
            }
            
            // 프로젝트 타입 분포
            if (entry.context.projectType) {
                stats.projectTypeDistribution.set(entry.context.projectType,
                    (stats.projectTypeDistribution.get(entry.context.projectType) || 0) + 1
                );
            }
        });
        
        if (stats.totalActivations > 0) {
            stats.averageServerCount /= stats.totalActivations;
        }
        
        return stats;
    }
}

module.exports = McpAutoActivationService;