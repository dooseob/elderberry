/**
 * 통합 분석 오케스트레이터
 * 
 * 3가지 핵심 시스템을 전문 에이전트로 연결하여 종합 분석 수행:
 * 1. AI 기반 클로드 가이드 시스템 에이전트
 * 2. 로그 기반 디버깅 시스템 에이전트  
 * 3. 트러블슈팅 및 문서화 시스템 에이전트
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('./DocumentLearningService').logger;

class IntegratedAnalysisOrchestrator {
    constructor() {
        this.initialized = false;
        this.analysisHistory = [];
        
        // 전문 에이전트 서비스들
        this.agents = {
            claudeGuide: null,
            debugSystem: null,
            troubleshooting: null,
            apiDocumentation: null
        };
    }

    async initialize() {
        try {
            logger.info('통합 분석 오케스트레이터 초기화 시작');

            // 4가지 전문 에이전트 초기화
            await this.initializeClaudeGuideAgent();
            await this.initializeDebugSystemAgent();
            await this.initializeTroubleshootingAgent();
            await this.initializeApiDocumentationAgent();

            // 분석 이력 로드
            await this.loadAnalysisHistory();

            this.initialized = true;
            logger.info('통합 분석 오케스트레이터 초기화 완료');

        } catch (error) {
            logger.error('통합 분석 오케스트레이터 초기화 실패', error);
            throw error;
        }
    }

    /**
     * AI 기반 클로드 가이드 시스템 에이전트 초기화
     */
    async initializeClaudeGuideAgent() {
        try {
            const ClaudeGuideAgent = require('./ClaudeGuideAnalysisAgent');
            this.agents.claudeGuide = new ClaudeGuideAgent();
            await this.agents.claudeGuide.initialize();
            
            logger.info('클로드 가이드 에이전트 초기화 완료');
        } catch (error) {
            logger.error('클로드 가이드 에이전트 초기화 실패', error);
            this.agents.claudeGuide = null;
        }
    }

    /**
     * 로그 기반 디버깅 시스템 에이전트 초기화
     */
    async initializeDebugSystemAgent() {
        try {
            const DebugSystemAgent = require('./DebugSystemAnalysisAgent');
            this.agents.debugSystem = new DebugSystemAgent();
            await this.agents.debugSystem.initialize();
            
            logger.info('디버깅 시스템 에이전트 초기화 완료');
        } catch (error) {
            logger.error('디버깅 시스템 에이전트 초기화 실패', error);
            this.agents.debugSystem = null;
        }
    }

    /**
     * 트러블슈팅 및 문서화 시스템 에이전트 초기화
     */
    async initializeTroubleshootingAgent() {
        try {
            const TroubleshootingAgent = require('./TroubleshootingAnalysisAgent');
            this.agents.troubleshooting = new TroubleshootingAgent();
            await this.agents.troubleshooting.initialize();
            
            logger.info('트러블슈팅 에이전트 초기화 완료');
        } catch (error) {
            logger.error('트러블슈팅 에이전트 초기화 실패', error);
            this.agents.troubleshooting = null;
        }
    }

    /**
     * 종합 분석 실행
     * 3가지 전문 에이전트를 조율하여 통합 분석 수행
     */
    async performIntegratedAnalysis(projectPath, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysisId = this.generateAnalysisId();
        const startTime = Date.now();

        logger.info('통합 분석 시작', { analysisId, projectPath });

        try {
            // 1. 각 전문 에이전트 병렬 실행
            const analysisPromises = [
                this.runClaudeGuideAnalysis(projectPath, options),
                this.runDebugSystemAnalysis(projectPath, options),
                this.runTroubleshootingAnalysis(projectPath, options)
            ];

            const [claudeResult, debugResult, troubleshootingResult] = await Promise.allSettled(analysisPromises);

            // 2. 결과 통합 및 상관관계 분석
            const integratedResult = await this.integrateAnalysisResults({
                claudeGuide: this.extractResult(claudeResult),
                debugSystem: this.extractResult(debugResult),
                troubleshooting: this.extractResult(troubleshootingResult)
            });

            // 3. 최종 권장사항 생성
            const finalRecommendations = await this.generateIntegratedRecommendations(integratedResult);

            const finalResult = {
                analysisId,
                timestamp: new Date().toISOString(),
                projectPath,
                duration: Date.now() - startTime,
                results: integratedResult,
                recommendations: finalRecommendations,
                summary: this.generateExecutiveSummary(integratedResult, finalRecommendations),
                metadata: {
                    version: '2.0.0',
                    method: 'integrated-agent-orchestration',
                    availableAgents: this.getAvailableAgents()
                }
            };

            // 이력 저장
            await this.saveAnalysisResult(finalResult);

            logger.info('통합 분석 완료', { 
                analysisId, 
                duration: finalResult.duration,
                recommendationCount: finalRecommendations.length 
            });

            return finalResult;

        } catch (error) {
            logger.error('통합 분석 실패', { analysisId, error });
            throw error;
        }
    }

    /**
     * 클로드 가이드 시스템 분석 실행
     */
    async runClaudeGuideAnalysis(projectPath, options) {
        if (!this.agents.claudeGuide) {
            return { available: false, reason: '클로드 가이드 에이전트 비활성화' };
        }

        try {
            logger.info('클로드 가이드 분석 시작');

            const analysis = await this.agents.claudeGuide.analyze({
                projectPath,
                analysisType: 'comprehensive',
                includeCodeQuality: true,
                includeBestPractices: true,
                includeArchitectureReview: true,
                options
            });

            logger.info('클로드 가이드 분석 완료', { 
                guidelineViolations: analysis.guidelineViolations?.length || 0,
                bestPracticeIssues: analysis.bestPracticeIssues?.length || 0
            });

            return {
                available: true,
                timestamp: new Date().toISOString(),
                analysis,
                insights: {
                    codeQualityScore: analysis.codeQualityScore || 0,
                    architectureCompliance: analysis.architectureCompliance || 0,
                    bestPracticeAdherence: analysis.bestPracticeAdherence || 0
                }
            };

        } catch (error) {
            logger.error('클로드 가이드 분석 실패', error);
            return { 
                available: false, 
                reason: `클로드 가이드 분석 실패: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * 로그 기반 디버깅 시스템 분석 실행
     */
    async runDebugSystemAnalysis(projectPath, options) {
        if (!this.agents.debugSystem) {
            return { available: false, reason: '디버깅 시스템 에이전트 비활성화' };
        }

        try {
            logger.info('디버깅 시스템 분석 시작');

            const analysis = await this.agents.debugSystem.analyze({
                projectPath,
                logAnalysis: true,
                performanceMonitoring: true,
                errorPatternDetection: true,
                systemHealthCheck: true,
                options
            });

            logger.info('디버깅 시스템 분석 완료', {
                errorPatterns: analysis.errorPatterns?.length || 0,
                performanceIssues: analysis.performanceIssues?.length || 0,
                systemWarnings: analysis.systemWarnings?.length || 0
            });

            return {
                available: true,
                timestamp: new Date().toISOString(),
                analysis,
                insights: {
                    systemHealth: analysis.systemHealth || 'unknown',
                    errorRate: analysis.errorRate || 0,
                    performanceScore: analysis.performanceScore || 0
                }
            };

        } catch (error) {
            logger.error('디버깅 시스템 분석 실패', error);
            return { 
                available: false, 
                reason: `디버깅 시스템 분석 실패: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * 트러블슈팅 및 문서화 시스템 분석 실행
     */
    async runTroubleshootingAnalysis(projectPath, options) {
        if (!this.agents.troubleshooting) {
            return { available: false, reason: '트러블슈팅 에이전트 비활성화' };
        }

        try {
            logger.info('트러블슈팅 분석 시작');

            const analysis = await this.agents.troubleshooting.analyze({
                projectPath,
                historicalAnalysis: true,
                patternRecognition: true,
                solutionMatching: true,
                documentationReview: true,
                options
            });

            logger.info('트러블슈팅 분석 완료', {
                knownIssues: analysis.knownIssues?.length || 0,
                solutions: analysis.availableSolutions?.length || 0,
                similarPatterns: analysis.similarPatterns?.length || 0
            });

            return {
                available: true,
                timestamp: new Date().toISOString(),
                analysis,
                insights: {
                    knowledgeBaseMatch: analysis.knowledgeBaseMatch || 0,
                    solutionConfidence: analysis.solutionConfidence || 0,
                    documentationCoverage: analysis.documentationCoverage || 0
                }
            };

        } catch (error) {
            logger.error('트러블슈팅 분석 실패', error);
            return { 
                available: false, 
                reason: `트러블슈팅 분석 실패: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * 분석 결과 통합 및 상관관계 분석
     */
    async integrateAnalysisResults({ claudeGuide, debugSystem, troubleshooting }) {
        const integrated = {
            claudeGuide: claudeGuide || { available: false },
            debugSystem: debugSystem || { available: false },
            troubleshooting: troubleshooting || { available: false },
            correlations: [],
            synergies: [],
            overallInsights: {}
        };

        try {
            // 1. 클로드 가이드 + 디버깅 시스템 상관관계
            if (claudeGuide?.available && debugSystem?.available) {
                integrated.correlations.push(...this.findGuideDebugCorrelations(claudeGuide, debugSystem));
            }

            // 2. 디버깅 시스템 + 트러블슈팅 상관관계
            if (debugSystem?.available && troubleshooting?.available) {
                integrated.correlations.push(...this.findDebugTroubleshootingCorrelations(debugSystem, troubleshooting));
            }

            // 3. 클로드 가이드 + 트러블슈팅 상관관계
            if (claudeGuide?.available && troubleshooting?.available) {
                integrated.correlations.push(...this.findGuideTroubleshootingCorrelations(claudeGuide, troubleshooting));
            }

            // 4. 3-way 시너지 분석
            if (claudeGuide?.available && debugSystem?.available && troubleshooting?.available) {
                integrated.synergies.push(...this.findTripleSystemSynergies(claudeGuide, debugSystem, troubleshooting));
            }

            // 5. 종합 인사이트 생성
            integrated.overallInsights = this.generateOverallInsights(integrated);

        } catch (error) {
            logger.error('결과 통합 중 오류', error);
        }

        return integrated;
    }

    /**
     * 통합 권장사항 생성
     */
    async generateIntegratedRecommendations(integratedResult) {
        const recommendations = [];

        try {
            // 1. 각 시스템별 핵심 권장사항 추출
            if (integratedResult.claudeGuide.available) {
                recommendations.push(...this.extractClaudeGuideRecommendations(integratedResult.claudeGuide));
            }

            if (integratedResult.debugSystem.available) {
                recommendations.push(...this.extractDebugSystemRecommendations(integratedResult.debugSystem));
            }

            if (integratedResult.troubleshooting.available) {
                recommendations.push(...this.extractTroubleshootingRecommendations(integratedResult.troubleshooting));
            }

            // 2. 상관관계 기반 권장사항
            for (const correlation of integratedResult.correlations) {
                if (correlation.confidence > 0.7) {
                    recommendations.push({
                        type: 'cross-system',
                        priority: this.calculateCrossSystemPriority(correlation),
                        title: `시스템 간 연관 이슈: ${correlation.title}`,
                        description: correlation.description,
                        evidence: correlation.evidence,
                        actions: correlation.suggestedActions || [],
                        involvedSystems: correlation.systems
                    });
                }
            }

            // 3. 시너지 기반 권장사항
            for (const synergy of integratedResult.synergies) {
                recommendations.push({
                    type: 'synergy',
                    priority: 'high',
                    title: `통합 개선 기회: ${synergy.title}`,
                    description: synergy.description,
                    expectedBenefit: synergy.expectedBenefit,
                    actions: synergy.actions,
                    involvedSystems: synergy.systems
                });
            }

            // 4. 우선순위별 정렬 및 중복 제거
            return this.prioritizeAndDeduplicateRecommendations(recommendations);

        } catch (error) {
            logger.error('통합 권장사항 생성 실패', error);
            return [];
        }
    }

    /**
     * 경영진 요약 생성
     */
    generateExecutiveSummary(integratedResult, recommendations) {
        const criticalIssues = recommendations.filter(r => r.priority === 'critical').length;
        const highPriorityIssues = recommendations.filter(r => r.priority === 'high').length;

        return {
            overallStatus: this.calculateOverallStatus(integratedResult),
            keyMetrics: {
                systemsAnalyzed: this.getAvailableAgents().length,
                criticalIssues,
                highPriorityIssues,
                totalRecommendations: recommendations.length,
                correlationsFound: integratedResult.correlations.length,
                synergiesIdentified: integratedResult.synergies.length
            },
            topPriorities: recommendations.slice(0, 5).map(r => r.title),
            systemHealthOverview: {
                codeQuality: integratedResult.claudeGuide?.insights?.codeQualityScore || 0,
                systemStability: integratedResult.debugSystem?.insights?.systemHealth || 'unknown',
                knowledgeMaturity: integratedResult.troubleshooting?.insights?.documentationCoverage || 0
            },
            estimatedImpact: this.estimateOverallImpact(recommendations),
            nextSteps: this.generateNextSteps(recommendations.slice(0, 3))
        };
    }

    // ===== 유틸리티 메서드 =====

    extractResult(settledResult) {
        return settledResult.status === 'fulfilled' ? settledResult.value : null;
    }

    generateAnalysisId() {
        return `integrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getAvailableAgents() {
        return Object.entries(this.agents)
            .filter(([, agent]) => agent !== null)
            .map(([name]) => name);
    }

    // 상관관계 분석 메서드들 (실제 구현에서는 더 정교한 로직 필요)
    findGuideDebugCorrelations(claudeGuide, debugSystem) {
        // 클로드 가이드의 코드 품질 이슈와 디버깅 시스템의 에러 패턴 연관성 분석
        return [];
    }

    findDebugTroubleshootingCorrelations(debugSystem, troubleshooting) {
        // 디버깅 시스템의 현재 이슈와 트러블슈팅 DB의 과거 해결 사례 연관성 분석
        return [];
    }

    findGuideTroubleshootingCorrelations(claudeGuide, troubleshooting) {
        // 클로드 가이드 위반사항과 과거 트러블슈팅 패턴 연관성 분석
        return [];
    }

    findTripleSystemSynergies(claudeGuide, debugSystem, troubleshooting) {
        // 3개 시스템이 함께 작용할 때의 시너지 효과 분석
        return [];
    }

    generateOverallInsights(integrated) {
        return {
            systemMaturity: 'developing',
            integrationOpportunities: integrated.synergies.length,
            riskLevel: this.calculateRiskLevel(integrated),
            improvementPotential: this.calculateImprovementPotential(integrated)
        };
    }

    async saveAnalysisResult(result) {
        this.analysisHistory.push(result);
        
        // 최근 30개만 메모리에 유지
        if (this.analysisHistory.length > 30) {
            this.analysisHistory = this.analysisHistory.slice(-30);
        }

        // 파일로도 저장
        try {
            const historyPath = path.join(__dirname, '../data/integrated-analysis-history.json');
            await fs.writeFile(historyPath, JSON.stringify(this.analysisHistory, null, 2));
        } catch (error) {
            logger.warn('통합 분석 이력 파일 저장 실패', error);
        }
    }

    async loadAnalysisHistory() {
        try {
            const historyPath = path.join(__dirname, '../data/integrated-analysis-history.json');
            const data = await fs.readFile(historyPath, 'utf8');
            this.analysisHistory = JSON.parse(data);
            logger.info(`통합 분석 이력 로드 완료: ${this.analysisHistory.length}개`);
        } catch (error) {
            logger.info('통합 분석 이력 파일이 없어 새로 시작합니다');
            this.analysisHistory = [];
        }
    }

    // 나머지 구현 필요한 메서드들 (스켈레톤)
    extractClaudeGuideRecommendations(result) { return []; }
    extractDebugSystemRecommendations(result) { return []; }
    extractTroubleshootingRecommendations(result) { return []; }
    calculateCrossSystemPriority(correlation) { return 'medium'; }
    prioritizeAndDeduplicateRecommendations(recommendations) { return recommendations; }
    calculateOverallStatus(result) { return 'good'; }
    calculateRiskLevel(integrated) { return 'medium'; }
    calculateImprovementPotential(integrated) { return 'high'; }
    estimateOverallImpact(recommendations) { return 'positive'; }
    generateNextSteps(topRecommendations) { return []; }

    async cleanup() {
        logger.info('통합 분석 오케스트레이터 정리 시작');
        
        const cleanupPromises = Object.values(this.agents)
            .filter(agent => agent !== null)
            .map(agent => agent.cleanup?.() || Promise.resolve());
            
        await Promise.all(cleanupPromises);
        
        logger.info('통합 분석 오케스트레이터 정리 완료');
    }
}

module.exports = IntegratedAnalysisOrchestrator;