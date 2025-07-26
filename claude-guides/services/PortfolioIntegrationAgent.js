/**
 * 포트폴리오 통합 에이전트
 * 
 * 모든 포트폴리오 관련 기능을 하위 에이전트로 통합:
 * 1. 자동 이슈 감지 및 기록
 * 2. 품질 기반 필터링
 * 3. 포트폴리오 관리
 * 4. 성장 스토리 생성
 * 
 * 기존 claude-guides 시스템에 자연스럽게 통합
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('./DocumentLearningService').logger;

// 통합 서비스들
const PortfolioTroubleshootingService = require('./PortfolioTroubleshootingService');
const AutomatedSolutionLogger = require('./AutomatedSolutionLogger');

class PortfolioIntegrationAgent {
    constructor() {
        this.initialized = false;
        this.projectRoot = process.cwd();
        
        // 통합 서비스들
        this.portfolioService = new PortfolioTroubleshootingService();
        this.solutionLogger = new AutomatedSolutionLogger();
        
        // 에이전트 설정
        this.agentConfig = {
            name: 'portfolio',
            capabilities: ['issue_tracking', 'portfolio_management', 'growth_analysis'],
            autoMode: true, // 자동 모드 활성화
            minQualityScore: 7
        };

        // 현재 활동 추적
        this.currentActivity = {
            type: null, // 'issue_solving', 'analysis', 'review'
            context: {},
            startTime: null
        };
    }

    async initialize() {
        try {
            logger.info('포트폴리오 통합 에이전트 초기화 시작');

            // 하위 서비스 초기화
            await this.portfolioService.initialize();
            await this.solutionLogger.initialize();

            // 자동 감지 시스템 설정
            this.setupAutoDetection();

            this.initialized = true;
            logger.info('포트폴리오 통합 에이전트 초기화 완료');

        } catch (error) {
            logger.error('포트폴리오 통합 에이전트 초기화 실패', error);
            throw error;
        }
    }

    /**
     * 통합 분석 실행 (다른 에이전트들과 함께 호출됨)
     */
    async analyze(options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const { projectPath, analysisType = 'comprehensive' } = options;
        
        logger.info('포트폴리오 통합 분석 시작', { projectPath, analysisType });

        try {
            const analysisResults = {
                timestamp: new Date().toISOString(),
                agent: 'portfolio',
                results: {}
            };

            // 1. 포트폴리오 현황 분석
            analysisResults.results.portfolioStatus = await this.analyzePortfolioStatus();

            // 2. 성장 지표 분석
            analysisResults.results.growthMetrics = await this.analyzeGrowthMetrics();

            // 3. 품질 관리 분석
            analysisResults.results.qualityManagement = await this.analyzeQualityManagement();

            // 4. 자동 개선 기회 식별
            analysisResults.results.improvementOpportunities = await this.identifyImprovementOpportunities();

            // 5. 통합 권장사항 생성
            analysisResults.recommendations = await this.generatePortfolioRecommendations(analysisResults.results);

            logger.info('포트폴리오 통합 분석 완료', {
                portfolioIssues: analysisResults.results.portfolioStatus?.totalIssues || 0,
                recommendations: analysisResults.recommendations.length
            });

            return analysisResults;

        } catch (error) {
            logger.error('포트폴리오 통합 분석 실패', error);
            throw error;
        }
    }

    /**
     * 문제 해결 세션 자동 감지 및 추적
     */
    async detectAndTrackProblemSolving(activityData) {
        try {
            // 문제 해결 활동 패턴 감지
            const isProblemSolving = this.detectProblemSolvingPattern(activityData);
            
            if (isProblemSolving && !this.currentActivity.type) {
                // 새로운 문제 해결 세션 시작
                await this.startAutomaticSession(activityData);
            } else if (this.currentActivity.type === 'issue_solving') {
                // 기존 세션에 단계 추가
                await this.addSessionStep(activityData);
            }

        } catch (error) {
            logger.error('문제 해결 추적 실패', error);
        }
    }

    /**
     * 포트폴리오 상태 분석
     */
    async analyzePortfolioStatus() {
        try {
            const summary = await this.portfolioService.generatePortfolioSummary();
            
            return {
                totalIssues: summary.overview.totalIssues,
                averageQuality: summary.overview.averageImpact,
                readinessScore: summary.readinessIndicator,
                categories: summary.overview.categoriesUsed,
                techStack: summary.overview.techStackCoverage,
                highlights: summary.highlights,
                businessValue: summary.businessValue
            };

        } catch (error) {
            logger.error('포트폴리오 상태 분석 실패', error);
            return { error: error.message };
        }
    }

    /**
     * 성장 지표 분석
     */
    async analyzeGrowthMetrics() {
        try {
            // 시간별 성장 패턴 분석
            const growthData = await this.calculateGrowthMetrics();
            
            return {
                skillProgression: growthData.skills,
                complexityTrend: growthData.complexity,
                impactEvolution: growthData.impact,
                learningVelocity: growthData.velocity,
                strengthAreas: growthData.strengths,
                improvementAreas: growthData.improvements
            };

        } catch (error) {
            logger.error('성장 지표 분석 실패', error);
            return { error: error.message };
        }
    }

    /**
     * 품질 관리 분석
     */
    async analyzeQualityManagement() {
        try {
            return {
                qualityDistribution: await this.analyzeQualityDistribution(),
                filteringEffectiveness: await this.analyzeFilteringEffectiveness(),
                documentationQuality: await this.analyzeDocumentationQuality(),
                portfolioReadiness: await this.assessPortfolioReadiness()
            };

        } catch (error) {
            logger.error('품질 관리 분석 실패', error);
            return { error: error.message };
        }
    }

    /**
     * 개선 기회 식별
     */
    async identifyImprovementOpportunities() {
        try {
            const opportunities = [];

            // 1. 카테고리 균형 분석
            const categoryBalance = await this.analyzeCategoryBalance();
            if (categoryBalance.imbalanced) {
                opportunities.push({
                    type: 'category_balance',
                    priority: 'medium',
                    description: `${categoryBalance.underrepresented.join(', ')} 카테고리의 사례가 부족합니다`,
                    action: '해당 영역의 문제 해결 기회를 적극 찾아보세요'
                });
            }

            // 2. 기술 스택 다양성 분석
            const techDiversity = await this.analyzeTechStackDiversity();
            if (techDiversity.needsImprovement) {
                opportunities.push({
                    type: 'tech_diversity',
                    priority: 'low',
                    description: '기술 스택 다양성을 높일 수 있습니다',
                    action: `${techDiversity.suggestedTech.join(', ')} 기술 활용 기회를 찾아보세요`
                });
            }

            // 3. 문서화 품질 개선
            const docQuality = await this.analyzeDocumentationGaps();
            if (docQuality.hasGaps) {
                opportunities.push({
                    type: 'documentation',
                    priority: 'medium',
                    description: '일부 이슈의 문서화가 불완전합니다',
                    action: 'STAR 형식의 상세한 기록을 위해 더 많은 맥락 정보를 포함하세요'
                });
            }

            return opportunities;

        } catch (error) {
            logger.error('개선 기회 식별 실패', error);
            return [];
        }
    }

    /**
     * 포트폴리오 권장사항 생성
     */
    async generatePortfolioRecommendations(analysisResults) {
        const recommendations = [];

        try {
            // 포트폴리오 상태 기반 권장사항
            if (analysisResults.portfolioStatus) {
                const status = analysisResults.portfolioStatus;
                
                if (status.totalIssues < 10) {
                    recommendations.push({
                        type: 'portfolio_expansion',
                        priority: 'high',
                        title: '포트폴리오 사례 확대 필요',
                        description: `현재 ${status.totalIssues}개의 사례만 있습니다. 취업 포트폴리오로는 최소 15개 이상의 다양한 사례가 필요합니다.`,
                        actions: [
                            '일상적인 개발 과정에서 학습 가치가 있는 문제들을 적극 기록',
                            '작은 개선사항도 비즈니스 관점에서 재해석하여 기록',
                            '다양한 기술 영역의 문제 해결 기회 탐색'
                        ],
                        estimatedEffort: 'ongoing'
                    });
                }

                if (status.averageQuality < 7.5) {
                    recommendations.push({
                        type: 'quality_improvement',
                        priority: 'medium',
                        title: '포트폴리오 품질 향상',
                        description: `평균 품질 점수가 ${status.averageQuality.toFixed(1)}점입니다. 8점 이상을 목표로 해야 합니다.`,
                        actions: [
                            '기술적 깊이와 비즈니스 영향도를 모두 고려한 문제 선택',
                            '해결 과정의 상세한 기록과 학습 내용 문서화',
                            '정량적 성과 지표 포함'
                        ],
                        estimatedEffort: 'medium'
                    });
                }

                if (status.readinessScore < 80) {
                    recommendations.push({
                        type: 'portfolio_readiness',
                        priority: 'high',
                        title: '포트폴리오 완성도 개선',
                        description: `현재 완성도가 ${status.readinessScore}%입니다. 85% 이상이 되어야 취업에 활용 가능합니다.`,
                        actions: [
                            '각 사례의 STAR 형식 완성도 점검',
                            '비즈니스 임팩트 정량화',
                            '기술적 의사결정 과정 상세 기록'
                        ],
                        estimatedEffort: 'high'
                    });
                }
            }

            // 성장 지표 기반 권장사항
            if (analysisResults.growthMetrics && analysisResults.growthMetrics.learningVelocity < 0.5) {
                recommendations.push({
                    type: 'learning_acceleration',
                    priority: 'medium',
                    title: '학습 속도 가속화',
                    description: '기술 학습 속도를 높여 더 다양한 문제 해결 경험을 쌓으세요.',
                    actions: [
                        '매주 새로운 기술이나 도구 하나씩 학습',
                        '학습한 내용을 실제 프로젝트에 즉시 적용',
                        '학습 과정과 적용 결과를 체계적으로 기록'
                    ],
                    estimatedEffort: 'ongoing'
                });
            }

            // 개선 기회 기반 권장사항
            if (analysisResults.improvementOpportunities) {
                analysisResults.improvementOpportunities.forEach(opportunity => {
                    recommendations.push({
                        type: opportunity.type,
                        priority: opportunity.priority,
                        title: `개선 기회: ${opportunity.description}`,
                        description: opportunity.action,
                        actions: [opportunity.action],
                        estimatedEffort: 'low'
                    });
                });
            }

            // 우선순위별 정렬
            recommendations.sort((a, b) => {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            return recommendations;

        } catch (error) {
            logger.error('포트폴리오 권장사항 생성 실패', error);
            return [];
        }
    }

    /**
     * 자동 감지 시스템 설정
     */
    setupAutoDetection() {
        // 파일 변경 감지 (실제로는 chokidar 등 사용)
        // Git 커밋 감지
        // 개발 세션 패턴 감지
        logger.info('자동 감지 시스템 설정 완료');
    }

    /**
     * 문제 해결 패턴 감지
     */
    detectProblemSolvingPattern(activityData) {
        // 에러 로그, 코드 변경, 검색 패턴 등을 분석하여 
        // 문제 해결 활동인지 판단
        return activityData.type === 'error' || 
               activityData.type === 'debug' || 
               activityData.changedFiles > 3;
    }

    /**
     * 자동 세션 시작
     */
    async startAutomaticSession(activityData) {
        try {
            const sessionId = await this.solutionLogger.startProblemSolvingSession(
                activityData.description || '자동 감지된 문제 해결',
                {
                    auto: true,
                    context: activityData
                }
            );

            this.currentActivity = {
                type: 'issue_solving',
                sessionId,
                startTime: Date.now(),
                context: activityData
            };

            logger.info('자동 문제 해결 세션 시작', { sessionId });

        } catch (error) {
            logger.error('자동 세션 시작 실패', error);
        }
    }

    // ===== 분석 메서드들 (스켈레톤 구현) =====

    async calculateGrowthMetrics() {
        return {
            skills: { progression: 'upward', areas: ['Java', 'React', 'Architecture'] },
            complexity: { trend: 'increasing', current: 7.5 },
            impact: { trend: 'positive', current: 8.2 },
            velocity: 0.7,
            strengths: ['시스템 설계', '문제 해결'],
            improvements: ['테스트 커버리지', '문서화']
        };
    }

    async analyzeQualityDistribution() {
        return {
            high: 60,    // 8점 이상
            medium: 30,  // 6-8점
            low: 10      // 6점 미만
        };
    }

    async analyzeFilteringEffectiveness() {
        return {
            totalCaptured: 50,
            filteredOut: 35,
            recorded: 15,
            effectiveness: 0.7
        };
    }

    async analyzeDocumentationQuality() {
        return {
            averageCompleteness: 85,
            starFormatAdherence: 90,
            businessContextClarity: 75,
            technicalDepth: 80
        };
    }

    async assessPortfolioReadiness() {
        return {
            overall: 78,
            categories: {
                completeness: 80,
                diversity: 75,
                quality: 82,
                presentation: 74
            }
        };
    }

    async analyzeCategoryBalance() {
        const categories = ['architecture', 'performance', 'security', 'integration'];
        const counts = { architecture: 5, performance: 3, security: 2, integration: 1 };
        
        const underrepresented = categories.filter(cat => counts[cat] < 3);
        
        return {
            imbalanced: underrepresented.length > 0,
            underrepresented,
            distribution: counts
        };
    }

    async analyzeTechStackDiversity() {
        const currentTech = ['Java', 'Spring Boot', 'React', 'TypeScript'];
        const suggestedTech = ['Docker', 'Kubernetes', 'GraphQL', 'MongoDB'];
        
        return {
            needsImprovement: currentTech.length < 6,
            currentTech,
            suggestedTech: suggestedTech.slice(0, 2)
        };
    }

    async analyzeDocumentationGaps() {
        return {
            hasGaps: true,
            gaps: ['비즈니스 임팩트 정량화', '기술적 의사결정 근거'],
            completeness: 75
        };
    }

    async addSessionStep(activityData) {
        if (this.currentActivity.sessionId) {
            await this.solutionLogger.logSolutionStep(
                activityData.description || '자동 감지된 단계',
                'action',
                { auto: true, ...activityData }
            );
        }
    }

    // 상태 관리 메서드들
    getCapabilities() {
        return this.agentConfig.capabilities;
    }

    getDependencies() {
        return [];
    }

    getStatus() {
        return {
            name: this.agentConfig.name,
            status: this.initialized ? 'active' : 'inactive',
            initialized: this.initialized,
            capabilities: this.agentConfig.capabilities,
            currentActivity: this.currentActivity.type || 'idle'
        };
    }

    async cleanup() {
        logger.info('포트폴리오 통합 에이전트 정리 중...');
        
        // 진행 중인 세션 종료
        if (this.currentActivity.type === 'issue_solving') {
            await this.solutionLogger.endCurrentSession('cleanup');
        }

        // 하위 서비스들 정리
        await Promise.all([
            this.portfolioService.cleanup(),
            this.solutionLogger.cleanup()
        ]);

        this.initialized = false;
        this.currentActivity = { type: null, context: {}, startTime: null };
    }
}

module.exports = PortfolioIntegrationAgent;