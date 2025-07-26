/**
 * 향상된 분석 오케스트레이터 - 모범 사례 적용
 * 
 * 개선사항:
 * 1. 플러그인 아키텍처: 에이전트를 동적으로 등록/해제 가능
 * 2. 의존성 주입: 각 에이전트 간 느슨한 결합
 * 3. 이벤트 기반 통신: 에이전트 간 비동기 메시징
 * 4. 상태 관리: 분석 상태를 체계적으로 관리
 * 5. 성능 최적화: 병렬 처리 및 캐싱
 * 6. 확장성: 새로운 에이전트 쉽게 추가 가능
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./DocumentLearningService').logger;

/**
 * 분석 에이전트 베이스 클래스
 */
class BaseAnalysisAgent {
    constructor(name, config = {}) {
        this.name = name;
        this.config = config;
        this.initialized = false;
        this.status = 'inactive';
        this.dependencies = config.dependencies || [];
        this.capabilities = config.capabilities || [];
    }

    async initialize() {
        throw new Error(`${this.name} 에이전트는 initialize() 메서드를 구현해야 합니다`);
    }

    async analyze(options) {
        throw new Error(`${this.name} 에이전트는 analyze() 메서드를 구현해야 합니다`);
    }

    async cleanup() {
        this.status = 'inactive';
        this.initialized = false;
    }

    getCapabilities() {
        return this.capabilities;
    }

    getDependencies() {
        return this.dependencies;
    }

    getStatus() {
        return {
            name: this.name,
            status: this.status,
            initialized: this.initialized,
            capabilities: this.capabilities
        };
    }
}

/**
 * 향상된 분석 오케스트레이터
 */
class EnhancedAnalysisOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.initialized = false;
        this.analysisHistory = [];
        
        // 에이전트 레지스트리 (플러그인 아키텍처)
        this.agentRegistry = new Map();
        this.agentDependencyGraph = new Map();
        
        // 분석 상태 관리
        this.analysisState = {
            currentAnalysis: null,
            activeAgents: new Set(),
            completedAgents: new Set(),
            failedAgents: new Set()
        };

        // 성능 최적화
        this.analysisCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5분

        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    async initialize() {
        try {
            logger.info('향상된 분석 오케스트레이터 초기화 시작');

            // 기본 에이전트들 등록
            await this.registerDefaultAgents();

            // 의존성 그래프 구성
            this.buildDependencyGraph();

            // 분석 이력 로드
            await this.loadAnalysisHistory();

            this.initialized = true;
            this.emit('orchestrator:initialized');
            
            logger.info('향상된 분석 오케스트레이터 초기화 완료', {
                registeredAgents: this.agentRegistry.size,
                dependencyNodes: this.agentDependencyGraph.size
            });

        } catch (error) {
            logger.error('향상된 분석 오케스트레이터 초기화 실패', error);
            this.emit('orchestrator:initializationFailed', error);
            throw error;
        }
    }

    /**
     * 기본 에이전트들 등록
     */
    async registerDefaultAgents() {
        // 클로드 가이드 에이전트
        await this.registerAgent('claudeGuide', {
            class: require('./ClaudeGuideAnalysisAgent'),
            config: {
                capabilities: ['code_quality', 'best_practices', 'architecture_review'],
                dependencies: [],
                priority: 'high'
            }
        });

        // 디버깅 시스템 에이전트
        await this.registerAgent('debugSystem', {
            class: require('./DebugSystemAnalysisAgent'),
            config: {
                capabilities: ['log_analysis', 'performance_monitoring', 'error_detection'],
                dependencies: [],
                priority: 'high'
            }
        });

        // 트러블슈팅 에이전트
        await this.registerAgent('troubleshooting', {
            class: require('./TroubleshootingAnalysisAgent'),
            config: {
                capabilities: ['historical_analysis', 'pattern_recognition', 'solution_matching'],
                dependencies: [],
                priority: 'medium'
            }
        });

        // API 문서화 에이전트
        await this.registerAgent('apiDocumentation', {
            class: require('./ApiDocumentationAnalysisAgent'),
            config: {
                capabilities: ['api_documentation', 'swagger_analysis', 'consistency_check'],
                dependencies: ['claudeGuide'], // 코드 품질 분석 후 진행
                priority: 'medium'
            }
        });

        // SonarQube 분석 에이전트
        await this.registerAgent('sonarQube', {
            class: require('./SonarQubeAnalysisService'),
            config: {
                capabilities: ['static_analysis', 'code_quality', 'complexity_analysis'],
                dependencies: [],
                priority: 'medium'
            }
        });

        // Snyk 보안 분석 에이전트
        await this.registerAgent('snykSecurity', {
            class: require('./SnykSecurityAnalysisService'),
            config: {
                capabilities: ['security_analysis', 'vulnerability_detection', 'dependency_check'],
                dependencies: [],
                priority: 'high'
            }
        });
    }

    /**
     * 에이전트 동적 등록
     */
    async registerAgent(name, agentConfig) {
        try {
            const { class: AgentClass, config } = agentConfig;
            const agent = new AgentClass();
            
            // BaseAnalysisAgent를 상속하지 않은 기존 클래스들을 래핑
            const wrappedAgent = this.wrapLegacyAgent(agent, name, config);
            
            await wrappedAgent.initialize();
            
            this.agentRegistry.set(name, wrappedAgent);
            this.emit('agent:registered', { name, capabilities: config.capabilities });
            
            logger.info(`에이전트 등록 완료: ${name}`, { capabilities: config.capabilities });

        } catch (error) {
            logger.error(`에이전트 등록 실패: ${name}`, error);
            this.emit('agent:registrationFailed', { name, error });
        }
    }

    /**
     * 기존 에이전트를 BaseAnalysisAgent 인터페이스로 래핑
     */
    wrapLegacyAgent(agent, name, config) {
        if (agent instanceof BaseAnalysisAgent) {
            return agent;
        }

        // 기존 클래스를 래핑하는 어댑터 패턴
        return {
            name,
            config,
            initialized: false,
            status: 'inactive',
            dependencies: config.dependencies || [],
            capabilities: config.capabilities || [],

            async initialize() {
                try {
                    if (agent.initialize) {
                        await agent.initialize();
                    }
                    this.initialized = true;
                    this.status = 'active';
                } catch (error) {
                    this.status = 'failed';
                    throw error;
                }
            },

            async analyze(options) {
                this.status = 'analyzing';
                try {
                    let result;
                    if (agent.analyze) {
                        result = await agent.analyze(options);
                    } else if (agent.analyzeProject) {
                        result = await agent.analyzeProject(options.projectPath, options);
                    } else {
                        throw new Error(`${name} 에이전트에 분석 메서드가 없습니다`);
                    }
                    this.status = 'completed';
                    return result;
                } catch (error) {
                    this.status = 'failed';
                    throw error;
                }
            },

            async cleanup() {
                if (agent.cleanup) {
                    await agent.cleanup();
                }
                this.status = 'inactive';
                this.initialized = false;
            },

            getCapabilities() { return this.capabilities; },
            getDependencies() { return this.dependencies; },
            getStatus() {
                return {
                    name: this.name,
                    status: this.status,
                    initialized: this.initialized,
                    capabilities: this.capabilities
                };
            }
        };
    }

    /**
     * 의존성 그래프 구성
     */
    buildDependencyGraph() {
        this.agentDependencyGraph.clear();

        for (const [name, agent] of this.agentRegistry) {
            const dependencies = agent.getDependencies();
            this.agentDependencyGraph.set(name, {
                agent,
                dependencies,
                dependents: []
            });
        }

        // 역방향 의존성(dependents) 계산
        for (const [name, node] of this.agentDependencyGraph) {
            node.dependencies.forEach(depName => {
                const depNode = this.agentDependencyGraph.get(depName);
                if (depNode) {
                    depNode.dependents.push(name);
                }
            });
        }

        logger.info('의존성 그래프 구성 완료', {
            nodes: this.agentDependencyGraph.size,
            dependencies: Array.from(this.agentDependencyGraph.entries())
                .map(([name, node]) => ({ name, deps: node.dependencies }))
        });
    }

    /**
     * 종합 분석 실행 (향상된 버전)
     */
    async performIntegratedAnalysis(projectPath, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysisId = this.generateAnalysisId();
        const startTime = Date.now();

        // 캐시 확인
        const cacheKey = this.generateCacheKey(projectPath, options);
        if (this.analysisCache.has(cacheKey)) {
            const cached = this.analysisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                logger.info('캐시된 분석 결과 반환', { analysisId, cacheKey });
                return cached.result;
            }
        }

        this.analysisState.currentAnalysis = analysisId;
        this.analysisState.activeAgents.clear();
        this.analysisState.completedAgents.clear();
        this.analysisState.failedAgents.clear();

        logger.info('향상된 통합 분석 시작', { analysisId, projectPath });

        try {
            // 1. 실행 계획 수립 (토폴로지 정렬)
            const executionPlan = this.createExecutionPlan(options);
            
            // 2. 병렬 실행 가능한 에이전트들을 단계별로 실행
            const results = {};
            
            for (const executionBatch of executionPlan) {
                const batchResults = await this.executeBatch(executionBatch, projectPath, options);
                Object.assign(results, batchResults);
            }

            // 3. 결과 통합 및 상관관계 분석
            const integratedResult = await this.integrateAnalysisResults(results);

            // 4. 최종 권장사항 생성 (향상된 알고리즘)
            const recommendations = await this.generateEnhancedRecommendations(integratedResult);

            const finalResult = {
                analysisId,
                timestamp: new Date().toISOString(),
                projectPath,
                duration: Date.now() - startTime,
                results: integratedResult,
                recommendations,
                summary: this.generateExecutiveSummary(integratedResult, recommendations),
                metadata: {
                    version: '3.0.0',
                    method: 'enhanced-agent-orchestration',
                    executionPlan: executionPlan.map(batch => batch.map(agent => agent.name)),
                    participatingAgents: Object.keys(results)
                }
            };

            // 캐시 저장
            this.analysisCache.set(cacheKey, {
                result: finalResult,
                timestamp: Date.now()
            });

            // 이력 저장
            await this.saveAnalysisResult(finalResult);

            this.emit('analysis:completed', finalResult);
            
            logger.info('향상된 통합 분석 완료', { 
                analysisId, 
                duration: finalResult.duration,
                participatingAgents: Object.keys(results).length,
                recommendationCount: recommendations.length 
            });

            return finalResult;

        } catch (error) {
            this.emit('analysis:failed', { analysisId, error });
            logger.error('향상된 통합 분석 실패', { analysisId, error });
            throw error;
        } finally {
            this.analysisState.currentAnalysis = null;
        }
    }

    /**
     * 실행 계획 수립 (토폴로지 정렬)
     */
    createExecutionPlan(options) {
        const plan = [];
        const visited = new Set();
        const processing = new Set();

        // 요청된 에이전트만 필터링
        const requestedAgents = options.agents || Array.from(this.agentRegistry.keys());
        const availableAgents = requestedAgents.filter(name => this.agentRegistry.has(name));

        // 의존성 해결을 위한 DFS
        const visit = (agentName) => {
            if (processing.has(agentName)) {
                throw new Error(`순환 의존성 감지: ${agentName}`);
            }
            
            if (visited.has(agentName)) {
                return;
            }

            processing.add(agentName);
            
            const node = this.agentDependencyGraph.get(agentName);
            if (node) {
                // 의존성이 있는 에이전트들을 먼저 방문
                node.dependencies.forEach(depName => {
                    if (availableAgents.includes(depName)) {
                        visit(depName);
                    }
                });
            }

            processing.delete(agentName);
            visited.add(agentName);

            // 현재 에이전트를 적절한 배치에 추가
            this.addToExecutionBatch(plan, this.agentRegistry.get(agentName));
        };

        // 모든 요청된 에이전트 방문
        availableAgents.forEach(visit);

        logger.info('실행 계획 수립 완료', {
            totalBatches: plan.length,
            totalAgents: availableAgents.length,
            plan: plan.map((batch, index) => `Batch ${index + 1}: ${batch.map(a => a.name).join(', ')}`)
        });

        return plan;
    }

    /**
     * 배치 실행 계획에 에이전트 추가
     */
    addToExecutionBatch(plan, agent) {
        const dependencies = agent.getDependencies();
        
        // 의존성이 없거나 모든 의존성이 완료된 경우 병렬 실행 가능
        if (dependencies.length === 0) {
            // 첫 번째 배치에 추가
            if (plan.length === 0) {
                plan.push([]);
            }
            plan[0].push(agent);
        } else {
            // 의존성이 있는 경우 적절한 배치 찾기
            let targetBatch = plan.length;
            
            // 모든 의존성이 완료된 후의 배치를 찾음
            for (let i = 0; i < plan.length; i++) {
                const batchAgentNames = plan[i].map(a => a.name);
                const allDepsInThisBatch = dependencies.every(dep => 
                    batchAgentNames.includes(dep) || 
                    this.isDependencyCompletedBefore(plan, i, dep)
                );
                
                if (allDepsInThisBatch) {
                    targetBatch = i + 1;
                    break;
                }
            }
            
            // 필요한 배치 생성
            while (plan.length <= targetBatch) {
                plan.push([]);
            }
            
            plan[targetBatch].push(agent);
        }
    }

    /**
     * 특정 배치 이전에 의존성이 완료되었는지 확인
     */
    isDependencyCompletedBefore(plan, batchIndex, dependencyName) {
        for (let i = 0; i < batchIndex; i++) {
            if (plan[i].some(agent => agent.name === dependencyName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 배치 실행
     */
    async executeBatch(batch, projectPath, options) {
        logger.info(`배치 실행 시작: ${batch.map(a => a.name).join(', ')}`);

        const batchPromises = batch.map(async (agent) => {
            this.analysisState.activeAgents.add(agent.name);
            this.emit('agent:started', { name: agent.name });

            try {
                const result = await agent.analyze({ 
                    projectPath, 
                    ...options,
                    agentName: agent.name 
                });
                
                this.analysisState.completedAgents.add(agent.name);
                this.analysisState.activeAgents.delete(agent.name);
                this.emit('agent:completed', { name: agent.name, result });
                
                return { [agent.name]: result };
            } catch (error) {
                this.analysisState.failedAgents.add(agent.name);
                this.analysisState.activeAgents.delete(agent.name);
                this.emit('agent:failed', { name: agent.name, error });
                
                logger.error(`에이전트 실행 실패: ${agent.name}`, error);
                return { [agent.name]: { available: false, error: error.message } };
            }
        });

        const batchResults = await Promise.all(batchPromises);
        const combinedResults = Object.assign({}, ...batchResults);

        logger.info(`배치 실행 완료: ${batch.map(a => a.name).join(', ')}`);
        return combinedResults;
    }

    /**
     * 향상된 권장사항 생성
     */
    async generateEnhancedRecommendations(integratedResult) {
        const recommendations = [];

        try {
            // 1. 각 에이전트별 핵심 권장사항 추출
            for (const [agentName, result] of Object.entries(integratedResult)) {
                if (result.recommendations) {
                    recommendations.push(...result.recommendations.map(rec => ({
                        ...rec,
                        source: agentName,
                        sourceType: 'agent'
                    })));
                }
            }

            // 2. 에이전트 간 상관관계 기반 권장사항
            const correlationRecommendations = await this.generateCorrelationRecommendations(integratedResult);
            recommendations.push(...correlationRecommendations);

            // 3. 우선순위 및 영향도 기반 정렬
            const prioritizedRecommendations = this.prioritizeRecommendations(recommendations);

            // 4. 중복 제거 및 통합
            const deduplicatedRecommendations = this.deduplicateRecommendations(prioritizedRecommendations);

            // 5. 실행 계획 생성
            const actionableRecommendations = this.addExecutionPlans(deduplicatedRecommendations);

            return actionableRecommendations;

        } catch (error) {
            logger.error('향상된 권장사항 생성 실패', error);
            return [];
        }
    }

    /**
     * 상관관계 기반 권장사항 생성
     */
    async generateCorrelationRecommendations(integratedResult) {
        const correlationRecommendations = [];

        try {
            // 코드 품질 + API 문서화 상관관계
            if (integratedResult.claudeGuide && integratedResult.apiDocumentation) {
                const codeQuality = integratedResult.claudeGuide.scores?.codeQualityScore || 0;
                const apiDocScore = integratedResult.apiDocumentation.scores?.documentationScore || 0;

                if (codeQuality > 80 && apiDocScore < 60) {
                    correlationRecommendations.push({
                        type: 'correlation',
                        priority: 'high',
                        title: '고품질 코드에 비해 API 문서화 부족',
                        description: `코드 품질(${codeQuality}점)은 우수하지만 API 문서화(${apiDocScore}점)가 부족합니다. 우수한 코드에 맞는 문서화 품질 개선이 필요합니다.`,
                        actions: [
                            '주요 API 엔드포인트에 상세한 OpenAPI 문서 추가',
                            '코드 품질에 맞는 예시 및 사용법 문서화',
                            '자동화된 문서 생성 도구 도입 검토'
                        ],
                        sources: ['claudeGuide', 'apiDocumentation'],
                        sourceType: 'correlation',
                        estimatedImpact: 'high'
                    });
                }
            }

            // 보안 취약점 + 디버그 로그 상관관계
            if (integratedResult.snykSecurity && integratedResult.debugSystem) {
                const securityIssues = integratedResult.snykSecurity.vulnerabilities?.length || 0;
                const logSecurityWarnings = integratedResult.debugSystem.analysis?.securityWarnings || 0;

                if (securityIssues > 0 && logSecurityWarnings > 0) {
                    correlationRecommendations.push({
                        type: 'correlation',
                        priority: 'critical',
                        title: '보안 취약점과 런타임 보안 경고 연관성',
                        description: `정적 분석에서 ${securityIssues}개의 보안 취약점이 발견되었고, 런타임에서도 ${logSecurityWarnings}개의 보안 경고가 확인되었습니다.`,
                        actions: [
                            '보안 취약점 즉시 패치',
                            '런타임 보안 모니터링 강화',
                            '보안 로깅 및 알림 시스템 구축'
                        ],
                        sources: ['snykSecurity', 'debugSystem'],
                        sourceType: 'correlation',
                        estimatedImpact: 'critical'
                    });
                }
            }

            // 트러블슈팅 + 코드 품질 상관관계
            if (integratedResult.troubleshooting && integratedResult.claudeGuide) {
                const recurringIssues = integratedResult.troubleshooting.analysis?.patterns?.recurring || [];
                const codeSmells = integratedResult.claudeGuide.results?.codeQuality?.codeSmells || [];

                if (recurringIssues.length > 0 && codeSmells.length > 0) {
                    correlationRecommendations.push({
                        type: 'correlation',
                        priority: 'medium',
                        title: '반복 이슈와 코드 냄새 연관성',
                        description: `${recurringIssues.length}개의 반복되는 문제와 ${codeSmells.length}개의 코드 냄새가 발견되어 구조적 개선이 필요합니다.`,
                        actions: [
                            '반복 이슈의 근본 원인 분석',
                            '코드 리팩토링을 통한 구조적 개선',
                            '예방적 코딩 가이드라인 수립'
                        ],
                        sources: ['troubleshooting', 'claudeGuide'],
                        sourceType: 'correlation',
                        estimatedImpact: 'medium'
                    });
                }
            }

        } catch (error) {
            logger.error('상관관계 권장사항 생성 실패', error);
        }

        return correlationRecommendations;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        this.on('agent:failed', ({ name, error }) => {
            logger.warn(`에이전트 실행 실패 감지: ${name}`, { error: error.message });
        });

        this.on('analysis:completed', (result) => {
            logger.info('분석 완료 이벤트 처리', { 
                analysisId: result.analysisId,
                duration: result.duration 
            });
        });
    }

    // ===== 유틸리티 메서드 =====

    generateAnalysisId() {
        return `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCacheKey(projectPath, options) {
        return `${path.basename(projectPath)}_${JSON.stringify(options)}`.replace(/[^a-zA-Z0-9]/g, '_');
    }

    prioritizeRecommendations(recommendations) {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        
        return recommendations.sort((a, b) => {
            // 1차: 우선순위
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // 2차: 영향도
            const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const impactDiff = impactOrder[b.estimatedImpact || 'medium'] - impactOrder[a.estimatedImpact || 'medium'];
            if (impactDiff !== 0) return impactDiff;
            
            // 3차: 소스 타입 (correlation이 우선)
            if (a.sourceType === 'correlation' && b.sourceType === 'agent') return -1;
            if (a.sourceType === 'agent' && b.sourceType === 'correlation') return 1;
            
            return 0;
        });
    }

    deduplicateRecommendations(recommendations) {
        const seen = new Set();
        const deduplicated = [];

        for (const rec of recommendations) {
            const key = `${rec.type}_${rec.title}`;
            if (!seen.has(key)) {
                seen.add(key);
                deduplicated.push(rec);
            } else {
                // 중복된 권장사항의 소스 정보 병합
                const existing = deduplicated.find(r => `${r.type}_${r.title}` === key);
                if (existing && rec.sources) {
                    existing.sources = [...new Set([...(existing.sources || []), ...rec.sources])];
                }
            }
        }

        return deduplicated;
    }

    addExecutionPlans(recommendations) {
        return recommendations.map(rec => ({
            ...rec,
            executionPlan: {
                estimatedDuration: this.estimateExecutionDuration(rec),
                prerequisites: this.identifyPrerequisites(rec),
                risks: this.identifyRisks(rec),
                successMetrics: this.defineSuccessMetrics(rec)
            }
        }));
    }

    estimateExecutionDuration(recommendation) {
        const effortMap = {
            low: '1-2 hours',
            medium: '1-2 days', 
            high: '1-2 weeks',
            critical: 'immediate'
        };
        return effortMap[recommendation.estimatedEffort || 'medium'];
    }

    identifyPrerequisites(recommendation) {
        // 권장사항 타입별 전제조건 식별
        const prerequisites = [];
        
        if (recommendation.type === 'security') {
            prerequisites.push('보안 팀 검토', '취약점 스캐너 결과 확인');
        }
        
        if (recommendation.type === 'api_documentation') {
            prerequisites.push('API 스펙 확정', 'OpenAPI 도구 설정');
        }
        
        return prerequisites;
    }

    identifyRisks(recommendation) {
        const risks = [];
        
        if (recommendation.priority === 'critical') {
            risks.push('지연 시 서비스 보안 위험');
        }
        
        if (recommendation.type === 'architecture') {
            risks.push('대규모 리팩토링으로 인한 버그 발생 가능');
        }
        
        return risks;
    }

    defineSuccessMetrics(recommendation) {
        const metrics = [];
        
        if (recommendation.type === 'code_quality') {
            metrics.push('코드 품질 점수 80점 이상', '코드 냄새 50% 감소');
        }
        
        if (recommendation.type === 'api_documentation') {
            metrics.push('API 문서화율 90% 이상', '개발자 만족도 개선');
        }
        
        return metrics;
    }

    // 기존 메서드들 (간소화)
    async integrateAnalysisResults(results) { return results; }
    generateExecutiveSummary(results, recommendations) { 
        return {
            totalAgents: Object.keys(results).length,
            totalRecommendations: recommendations.length,
            criticalIssues: recommendations.filter(r => r.priority === 'critical').length
        };
    }

    async saveAnalysisResult(result) {
        this.analysisHistory.push(result);
        if (this.analysisHistory.length > 50) {
            this.analysisHistory = this.analysisHistory.slice(-50);
        }
    }

    async loadAnalysisHistory() {
        this.analysisHistory = [];
    }

    async cleanup() {
        logger.info('향상된 분석 오케스트레이터 정리 시작');
        
        const cleanupPromises = Array.from(this.agentRegistry.values())
            .map(agent => agent.cleanup?.() || Promise.resolve());
            
        await Promise.all(cleanupPromises);
        
        this.agentRegistry.clear();
        this.analysisCache.clear();
        this.removeAllListeners();
        
        logger.info('향상된 분석 오케스트레이터 정리 완료');
    }
}

module.exports = { EnhancedAnalysisOrchestrator, BaseAnalysisAgent };