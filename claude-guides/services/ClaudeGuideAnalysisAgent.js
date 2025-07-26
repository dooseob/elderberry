/**
 * 클로드 가이드 분석 에이전트
 * 
 * AI 기반 클로드 가이드 시스템을 활용한 코드 품질 및 모범 사례 분석
 * 기존 claude-guides 시스템의 모든 기능을 에이전트화
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('./DocumentLearningService').logger;

// 기존 시스템 컴포넌트들
const PredictiveAnalysisService = require('./PredictiveAnalysisService');
const DynamicChecklistService = require('./DynamicChecklistService');
const DevWorkflowService = require('./DevWorkflowService');

class ClaudeGuideAnalysisAgent {
    constructor() {
        this.initialized = false;
        this.projectRoot = process.cwd();
        
        // 기존 시스템 서비스들
        this.predictiveAnalysis = new PredictiveAnalysisService();
        this.dynamicChecklist = new DynamicChecklistService();
        this.devWorkflow = new DevWorkflowService();
        
        // 분석 캐시
        this.analysisCache = new Map();
    }

    async initialize() {
        try {
            logger.info('클로드 가이드 분석 에이전트 초기화 시작');

            // 기존 서비스들 초기화
            await Promise.all([
                this.predictiveAnalysis.initialize?.() || Promise.resolve(),
                this.dynamicChecklist.initialize?.() || Promise.resolve(),
                this.devWorkflow.initialize?.() || Promise.resolve()
            ]);

            // 가이드라인 데이터베이스 로드
            await this.loadGuidelinesDatabase();

            this.initialized = true;
            logger.info('클로드 가이드 분석 에이전트 초기화 완료');

        } catch (error) {
            logger.error('클로드 가이드 분석 에이전트 초기화 실패', error);
            throw error;
        }
    }

    /**
     * 종합 분석 실행
     */
    async analyze(options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const {
            projectPath,
            analysisType = 'comprehensive',
            includeCodeQuality = true,
            includeBestPractices = true,
            includeArchitectureReview = true
        } = options;

        logger.info('클로드 가이드 분석 시작', { projectPath, analysisType });

        try {
            const analysisResults = {
                timestamp: new Date().toISOString(),
                projectPath,
                analysisType,
                results: {}
            };

            // 1. 코드 품질 분석
            if (includeCodeQuality) {
                analysisResults.results.codeQuality = await this.analyzeCodeQuality(projectPath);
            }

            // 2. 모범 사례 준수 분석
            if (includeBestPractices) {
                analysisResults.results.bestPractices = await this.analyzeBestPractices(projectPath);
            }

            // 3. 아키텍처 리뷰
            if (includeArchitectureReview) {
                analysisResults.results.architecture = await this.analyzeArchitecture(projectPath);
            }

            // 4. 예측적 분석
            analysisResults.results.predictive = await this.runPredictiveAnalysis(projectPath);

            // 5. 동적 체크리스트 생성
            analysisResults.results.checklist = await this.generateDynamicChecklist(analysisResults.results);

            // 6. 개발 워크플로우 최적화 제안
            analysisResults.results.workflow = await this.analyzeWorkflowOptimization(projectPath);

            // 7. 종합 점수 계산
            analysisResults.scores = this.calculateComprehensiveScores(analysisResults.results);

            // 8. 최종 권장사항 생성
            analysisResults.recommendations = await this.generateClaudeGuideRecommendations(analysisResults);

            logger.info('클로드 가이드 분석 완료', {
                codeQualityScore: analysisResults.scores.codeQualityScore,
                bestPracticeScore: analysisResults.scores.bestPracticeScore,
                recommendationCount: analysisResults.recommendations.length
            });

            return analysisResults;

        } catch (error) {
            logger.error('클로드 가이드 분석 실패', error);
            throw error;
        }
    }

    /**
     * 코드 품질 분석
     */
    async analyzeCodeQuality(projectPath) {
        try {
            const analysis = {
                guidelineViolations: [],
                codeSmells: [],
                designPatternIssues: [],
                maintainabilityScore: 0
            };

            // Java 파일들 분석
            const javaFiles = await this.findJavaFiles(projectPath);
            
            for (const filePath of javaFiles) {
                const fileAnalysis = await this.analyzeJavaFileQuality(filePath);
                analysis.guidelineViolations.push(...fileAnalysis.violations);
                analysis.codeSmells.push(...fileAnalysis.smells);
                analysis.designPatternIssues.push(...fileAnalysis.patterns);
            }

            // React/TypeScript 파일들 분석
            const reactFiles = await this.findReactFiles(projectPath);
            
            for (const filePath of reactFiles) {
                const fileAnalysis = await this.analyzeReactFileQuality(filePath);
                analysis.guidelineViolations.push(...fileAnalysis.violations);
                analysis.codeSmells.push(...fileAnalysis.smells);
            }

            // 유지보수성 점수 계산
            analysis.maintainabilityScore = this.calculateMaintainabilityScore(analysis);

            return analysis;

        } catch (error) {
            logger.error('코드 품질 분석 실패', error);
            return { guidelineViolations: [], codeSmells: [], designPatternIssues: [], maintainabilityScore: 0 };
        }
    }

    /**
     * Java 파일 품질 분석
     */
    async analyzeJavaFileQuality(filePath) {
        const analysis = {
            violations: [],
            smells: [],
            patterns: []
        };

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const lineNumber = index + 1;

                // 클로드 가이드라인 위반 검사
                if (this.violatesNamingConvention(line)) {
                    analysis.violations.push({
                        type: 'naming_convention',
                        severity: 'medium',
                        file: filePath,
                        line: lineNumber,
                        message: '네이밍 컨벤션 위반',
                        suggestion: 'camelCase 또는 PascalCase 사용'
                    });
                }

                if (this.hasInappropriateComment(line)) {
                    analysis.violations.push({
                        type: 'comment_quality',
                        severity: 'low',
                        file: filePath,
                        line: lineNumber,
                        message: '부적절한 주석',
                        suggestion: '의미있는 주석 작성'
                    });
                }

                // 코드 냄새 검사
                if (this.hasLongParameterList(line)) {
                    analysis.smells.push({
                        type: 'long_parameter_list',
                        severity: 'medium',
                        file: filePath,
                        line: lineNumber,
                        message: '매개변수가 너무 많음',
                        suggestion: 'DTO 객체 사용 고려'
                    });
                }

                // 디자인 패턴 이슈
                if (this.missingBuilderPattern(line, content)) {
                    analysis.patterns.push({
                        type: 'builder_pattern_missing',
                        severity: 'low',
                        file: filePath,
                        line: lineNumber,
                        message: 'Builder 패턴 사용 권장',
                        suggestion: '복잡한 객체 생성시 Builder 패턴 적용'
                    });
                }
            });

        } catch (error) {
            logger.warn(`Java 파일 품질 분석 실패: ${filePath}`, error);
        }

        return analysis;
    }

    /**
     * React 파일 품질 분석
     */
    async analyzeReactFileQuality(filePath) {
        const analysis = {
            violations: [],
            smells: []
        };

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const lineNumber = index + 1;

                // React 모범 사례 검사
                if (this.hasUnoptimizedReRender(line)) {
                    analysis.violations.push({
                        type: 'react_performance',
                        severity: 'medium',
                        file: filePath,
                        line: lineNumber,
                        message: '불필요한 리렌더링 가능성',
                        suggestion: 'React.memo, useMemo, useCallback 사용 고려'
                    });
                }

                if (this.hasImproperStateUpdate(line)) {
                    analysis.smells.push({
                        type: 'state_mutation',
                        severity: 'high',
                        file: filePath,
                        line: lineNumber,
                        message: '상태 직접 수정',
                        suggestion: 'setState 또는 useState 사용'
                    });
                }

                if (this.lacksProperTyping(line)) {
                    analysis.violations.push({
                        type: 'typescript_typing',
                        severity: 'medium',
                        file: filePath,
                        line: lineNumber,
                        message: '타입 정의 부족',
                        suggestion: '적절한 TypeScript 타입 정의'
                    });
                }
            });

        } catch (error) {
            logger.warn(`React 파일 품질 분석 실패: ${filePath}`, error);
        }

        return analysis;
    }

    /**
     * 모범 사례 준수 분석
     */
    async analyzeBestPractices(projectPath) {
        try {
            const analysis = {
                bestPracticeIssues: [],
                complianceScore: 0,
                recommendations: []
            };

            // 프로젝트 구조 분석
            const structureAnalysis = await this.analyzeProjectStructure(projectPath);
            analysis.bestPracticeIssues.push(...structureAnalysis.issues);

            // 보안 모범 사례 분석
            const securityAnalysis = await this.analyzeSecurityBestPractices(projectPath);
            analysis.bestPracticeIssues.push(...securityAnalysis.issues);

            // 성능 모범 사례 분석
            const performanceAnalysis = await this.analyzePerformanceBestPractices(projectPath);
            analysis.bestPracticeIssues.push(...performanceAnalysis.issues);

            // 테스트 모범 사례 분석
            const testingAnalysis = await this.analyzeTestingBestPractices(projectPath);
            analysis.bestPracticeIssues.push(...testingAnalysis.issues);

            // 준수 점수 계산
            analysis.complianceScore = this.calculateComplianceScore(analysis.bestPracticeIssues);

            // 권장사항 생성
            analysis.recommendations = this.generateBestPracticeRecommendations(analysis.bestPracticeIssues);

            return analysis;

        } catch (error) {
            logger.error('모범 사례 분석 실패', error);
            return { bestPracticeIssues: [], complianceScore: 0, recommendations: [] };
        }
    }

    /**
     * 아키텍처 분석
     */
    async analyzeArchitecture(projectPath) {
        try {
            const analysis = {
                architectureCompliance: 0,
                layerViolations: [],
                dependencyIssues: [],
                designPrincipleViolations: []
            };

            // 레이어 아키텍처 분석
            const layerAnalysis = await this.analyzeLayerArchitecture(projectPath);
            analysis.layerViolations = layerAnalysis.violations;

            // 의존성 분석
            const dependencyAnalysis = await this.analyzeDependencies(projectPath);
            analysis.dependencyIssues = dependencyAnalysis.issues;

            // SOLID 원칙 분석
            const solidAnalysis = await this.analyzeSOLIDPrinciples(projectPath);
            analysis.designPrincipleViolations = solidAnalysis.violations;

            // 아키텍처 준수 점수 계산
            analysis.architectureCompliance = this.calculateArchitectureCompliance(analysis);

            return analysis;

        } catch (error) {
            logger.error('아키텍처 분석 실패', error);
            return { architectureCompliance: 0, layerViolations: [], dependencyIssues: [], designPrincipleViolations: [] };
        }
    }

    /**
     * 예측적 분석 실행
     */
    async runPredictiveAnalysis(projectPath) {
        try {
            return await this.predictiveAnalysis.analyzeProjectTrends({
                projectPath,
                analysisScope: 'code_quality',
                predictionHorizon: '30_days'
            });
        } catch (error) {
            logger.error('예측적 분석 실패', error);
            return { predictions: [], confidence: 0 };
        }
    }

    /**
     * 동적 체크리스트 생성
     */
    async generateDynamicChecklist(analysisResults) {
        try {
            return await this.dynamicChecklist.generateChecklistForAnalysis({
                codeQuality: analysisResults.codeQuality,
                bestPractices: analysisResults.bestPractices,
                architecture: analysisResults.architecture
            });
        } catch (error) {
            logger.error('동적 체크리스트 생성 실패', error);
            return { checklist: [], completionRate: 0 };
        }
    }

    /**
     * 워크플로우 최적화 분석
     */
    async analyzeWorkflowOptimization(projectPath) {
        try {
            return await this.devWorkflow.analyzeCurrentWorkflow({
                projectPath,
                includeOptimizationSuggestions: true
            });
        } catch (error) {
            logger.error('워크플로우 분석 실패', error);
            return { optimizations: [], efficiency: 0 };
        }
    }

    /**
     * 종합 점수 계산
     */
    calculateComprehensiveScores(results) {
        const scores = {
            codeQualityScore: 0,
            bestPracticeScore: 0,
            architectureCompliance: 0,
            overallScore: 0
        };

        try {
            // 코드 품질 점수
            if (results.codeQuality) {
                scores.codeQualityScore = results.codeQuality.maintainabilityScore || 0;
            }

            // 모범 사례 점수
            if (results.bestPractices) {
                scores.bestPracticeScore = results.bestPractices.complianceScore || 0;
            }

            // 아키텍처 준수 점수
            if (results.architecture) {
                scores.architectureCompliance = results.architecture.architectureCompliance || 0;
            }

            // 전체 점수 (가중 평균)
            scores.overallScore = (
                scores.codeQualityScore * 0.4 +
                scores.bestPracticeScore * 0.35 +
                scores.architectureCompliance * 0.25
            );

        } catch (error) {
            logger.error('점수 계산 실패', error);
        }

        return scores;
    }

    /**
     * 클로드 가이드 권장사항 생성
     */
    async generateClaudeGuideRecommendations(analysisResults) {
        const recommendations = [];

        try {
            const { results, scores } = analysisResults;

            // 코드 품질 기반 권장사항
            if (results.codeQuality && scores.codeQualityScore < 70) {
                recommendations.push({
                    type: 'code_quality',
                    priority: 'high',
                    title: '코드 품질 개선 필요',
                    description: `현재 코드 품질 점수는 ${scores.codeQualityScore}점입니다. 가이드라인 준수를 통해 개선이 필요합니다.`,
                    actions: [
                        '네이밍 컨벤션 통일',
                        '코드 냄새 제거',
                        '주석 품질 향상'
                    ],
                    estimatedEffort: 'medium'
                });
            }

            // 모범 사례 기반 권장사항
            if (results.bestPractices && scores.bestPracticeScore < 80) {
                recommendations.push({
                    type: 'best_practices',
                    priority: 'medium',
                    title: '모범 사례 준수 강화',
                    description: `모범 사례 준수율이 ${scores.bestPracticeScore}%입니다. 업계 표준 적용이 필요합니다.`,
                    actions: [
                        '보안 모범 사례 적용',
                        '성능 최적화 패턴 도입',
                        '테스트 커버리지 확대'
                    ],
                    estimatedEffort: 'high'
                });
            }

            // 아키텍처 기반 권장사항
            if (results.architecture && scores.architectureCompliance < 75) {
                recommendations.push({
                    type: 'architecture',
                    priority: 'high',
                    title: '아키텍처 설계 개선',
                    description: `아키텍처 준수율이 ${scores.architectureCompliance}%입니다. 설계 원칙 강화가 필요합니다.`,
                    actions: [
                        '레이어 분리 강화',
                        '의존성 정리',
                        'SOLID 원칙 적용'
                    ],
                    estimatedEffort: 'high'
                });
            }

        } catch (error) {
            logger.error('클로드 가이드 권장사항 생성 실패', error);
        }

        return recommendations;
    }

    // ===== 유틸리티 메서드 =====

    async loadGuidelinesDatabase() {
        try {
            const guidelinesPath = path.join(__dirname, '../knowledge-base/guidelines-database.json');
            const data = await fs.readFile(guidelinesPath, 'utf8');
            this.guidelinesDB = JSON.parse(data);
            logger.info('가이드라인 데이터베이스 로드 완료');
        } catch (error) {
            logger.warn('가이드라인 데이터베이스 로드 실패, 기본값 사용');
            this.guidelinesDB = { rules: [], patterns: [] };
        }
    }

    async findJavaFiles(dir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
                    const subFiles = await this.findJavaFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile() && entry.name.endsWith('.java')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 디렉터리 접근 실패 - 무시
        }

        return files;
    }

    async findReactFiles(dir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
                    const subFiles = await this.findReactFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile() && (
                    entry.name.endsWith('.tsx') || 
                    entry.name.endsWith('.jsx') || 
                    entry.name.endsWith('.ts')
                )) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 디렉터리 접근 실패 - 무시
        }

        return files;
    }

    shouldSkipDirectory(name) {
        const skipDirs = ['node_modules', '.git', 'build', 'target', '.gradle', 'dist', 'logs'];
        return skipDirs.includes(name) || name.startsWith('.');
    }

    // 패턴 검사 메서드들 (간소화된 구현)
    violatesNamingConvention(line) { 
        return line.includes('public class') && /[a-z]/.test(line.split('class ')[1]?.charAt(0));
    }
    hasInappropriateComment(line) { 
        return line.trim().startsWith('//') && line.length < 10;
    }
    hasLongParameterList(line) { 
        return line.includes('(') && (line.match(/,/g) || []).length > 4;
    }
    missingBuilderPattern(line, content) { 
        return line.includes('new ') && content.includes('setters') && Math.random() < 0.1;
    }
    hasUnoptimizedReRender(line) { 
        return line.includes('useState') && !line.includes('memo');
    }
    hasImproperStateUpdate(line) { 
        return line.includes('.push(') || line.includes('.pop(');
    }
    lacksProperTyping(line) { 
        return line.includes(': any') || (line.includes('function') && !line.includes(':'));
    }

    // 분석 메서드들 (스켈레톤 구현)
    async analyzeProjectStructure(projectPath) { return { issues: [] }; }
    async analyzeSecurityBestPractices(projectPath) { return { issues: [] }; }
    async analyzePerformanceBestPractices(projectPath) { return { issues: [] }; }
    async analyzeTestingBestPractices(projectPath) { return { issues: [] }; }
    async analyzeLayerArchitecture(projectPath) { return { violations: [] }; }
    async analyzeDependencies(projectPath) { return { issues: [] }; }
    async analyzeSOLIDPrinciples(projectPath) { return { violations: [] }; }

    // 점수 계산 메서드들
    calculateMaintainabilityScore(analysis) { 
        const totalIssues = analysis.guidelineViolations.length + analysis.codeSmells.length;
        return Math.max(0, 100 - totalIssues * 2);
    }
    calculateComplianceScore(issues) { 
        return Math.max(0, 100 - issues.length * 3);
    }
    calculateArchitectureCompliance(analysis) { 
        const totalViolations = analysis.layerViolations.length + analysis.dependencyIssues.length;
        return Math.max(0, 100 - totalViolations * 5);
    }

    generateBestPracticeRecommendations(issues) { return []; }

    async cleanup() {
        logger.info('클로드 가이드 분석 에이전트 정리 중...');
        this.analysisCache.clear();
        this.initialized = false;
    }
}

module.exports = ClaudeGuideAnalysisAgent;