/**
 * 자동화된 솔루션 기록 시스템
 * 
 * 피드백 루프를 통한 자동 학습 시스템:
 * 1. 문제 해결 과정 자동 캡처
 * 2. 솔루션 품질 평가 및 필터링
 * 3. 포트폴리오 가치 있는 내용만 선별
 * 4. 구조화된 형태로 자동 저장
 * 5. 향후 유사 문제 해결에 활용
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('./DocumentLearningService').logger;
const PortfolioTroubleshootingService = require('./PortfolioTroubleshootingService');

class AutomatedSolutionLogger {
    constructor() {
        this.initialized = false;
        this.portfolioService = new PortfolioTroubleshootingService();
        
        // 자동 캡처 설정
        this.captureConfig = {
            minSessionDuration: 10 * 60 * 1000, // 10분 이상 작업만 기록
            autoSaveInterval: 5 * 60 * 1000, // 5분마다 자동 저장
            qualityThreshold: 7, // 10점 만점 중 7점 이상만 기록
            maxDailySolutions: 5 // 하루 최대 5개 솔루션만 기록
        };

        // 현재 작업 세션 추적
        this.currentSession = {
            sessionId: null,
            startTime: null,
            problem: null,
            steps: [],
            context: {},
            isActive: false
        };

        // 솔루션 품질 평가 기준
        this.qualityMetrics = {
            technicalDepth: 0, // 기술적 깊이
            businessImpact: 0, // 비즈니스 영향도
            reusability: 0, // 재사용 가능성
            documentation: 0, // 문서화 품질
            innovation: 0 // 혁신성
        };
    }

    async initialize() {
        try {
            logger.info('자동화된 솔루션 기록 시스템 초기화 시작');

            // 포트폴리오 서비스 초기화
            await this.portfolioService.initialize();

            // 기존 세션 복구
            await this.recoverPreviousSession();

            // 자동 저장 인터벌 설정
            this.setupAutoSave();

            this.initialized = true;
            logger.info('자동화된 솔루션 기록 시스템 초기화 완료');

        } catch (error) {
            logger.error('자동화된 솔루션 기록 시스템 초기화 실패', error);
            throw error;
        }
    }

    /**
     * 문제 해결 세션 시작
     */
    async startProblemSolvingSession(problemDescription, context = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        // 기존 세션이 있다면 자동 종료
        if (this.currentSession.isActive) {
            await this.endCurrentSession('auto_timeout');
        }

        this.currentSession = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            problem: {
                description: problemDescription,
                category: this.categorizeProblem(problemDescription),
                priority: this.assessProblemPriority(problemDescription, context),
                context: context
            },
            steps: [],
            context: {
                projectState: await this.captureProjectState(),
                environment: this.captureEnvironmentInfo(),
                ...context
            },
            isActive: true
        };

        logger.info('문제 해결 세션 시작', {
            sessionId: this.currentSession.sessionId,
            problem: problemDescription,
            category: this.currentSession.problem.category
        });

        return this.currentSession.sessionId;
    }

    /**
     * 해결 단계 기록
     */
    async logSolutionStep(stepDescription, stepType = 'action', metadata = {}) {
        if (!this.currentSession.isActive) {
            logger.warn('활성 세션이 없어 단계 기록을 생략합니다');
            return;
        }

        const step = {
            timestamp: Date.now(),
            type: stepType, // 'analysis', 'action', 'test', 'verification'
            description: stepDescription,
            metadata: {
                ...metadata,
                duration: this.calculateStepDuration(),
                files_changed: await this.detectChangedFiles(),
                git_commit: await this.getCurrentGitCommit()
            }
        };

        this.currentSession.steps.push(step);

        // 중요한 단계는 즉시 저장
        if (stepType === 'breakthrough' || stepType === 'solution') {
            await this.saveSessionSnapshot();
        }

        logger.debug('해결 단계 기록', {
            sessionId: this.currentSession.sessionId,
            stepType,
            stepCount: this.currentSession.steps.length
        });
    }

    /**
     * 문제 해결 완료 및 솔루션 기록
     */
    async completeSolution(solutionSummary, outcome = {}) {
        if (!this.currentSession.isActive) {
            logger.warn('활성 세션이 없어 솔루션 완료를 처리할 수 없습니다');
            return false;
        }

        try {
            // 세션 완료 처리
            const completedSession = await this.finalizeSession(solutionSummary, outcome);

            // 솔루션 품질 평가
            const qualityScore = await this.evaluateSolutionQuality(completedSession);

            // 품질 기준 통과 시에만 기록
            if (qualityScore >= this.captureConfig.qualityThreshold) {
                const portfolioData = await this.convertToPortfolioFormat(completedSession, qualityScore);
                const success = await this.portfolioService.recordCoreIssue(portfolioData);

                if (success) {
                    logger.info('고품질 솔루션 포트폴리오 기록 완료', {
                        sessionId: completedSession.sessionId,
                        qualityScore,
                        category: portfolioData.category
                    });

                    // 학습 피드백 루프 업데이트
                    await this.updateLearningDatabase(completedSession, portfolioData);
                    
                    return { success: true, recorded: true, qualityScore };
                }
            } else {
                logger.info('솔루션 품질 기준 미달로 기록 생략', {
                    sessionId: completedSession.sessionId,
                    qualityScore,
                    threshold: this.captureConfig.qualityThreshold
                });
                
                return { success: true, recorded: false, qualityScore };
            }

        } catch (error) {
            logger.error('솔루션 완료 처리 실패', error);
            return { success: false, error: error.message };
        } finally {
            // 세션 정리
            this.currentSession.isActive = false;
        }
    }

    /**
     * 세션 종료 처리
     */
    async finalizeSession(solutionSummary, outcome) {
        const endTime = Date.now();
        const duration = endTime - this.currentSession.startTime;

        const completedSession = {
            ...this.currentSession,
            endTime,
            duration,
            solution: {
                summary: solutionSummary,
                outcome: outcome,
                finalState: await this.captureProjectState(),
                metrics: await this.calculateSolutionMetrics()
            },
            isActive: false
        };

        // 세션 아카이브 저장
        await this.archiveSession(completedSession);

        return completedSession;
    }

    /**
     * 솔루션 품질 평가
     */
    async evaluateSolutionQuality(session) {
        const metrics = {
            technicalDepth: this.assessTechnicalDepth(session),
            businessImpact: this.assessBusinessImpact(session),
            reusability: this.assessReusability(session),
            documentation: this.assessDocumentation(session),
            innovation: this.assessInnovation(session)
        };

        // 가중 평균 계산
        const weights = {
            technicalDepth: 0.25,
            businessImpact: 0.25,
            reusability: 0.20,
            documentation: 0.15,
            innovation: 0.15
        };

        const qualityScore = Object.entries(metrics).reduce((score, [metric, value]) => {
            return score + (value * weights[metric]);
        }, 0);

        logger.debug('솔루션 품질 평가 완료', {
            sessionId: session.sessionId,
            metrics,
            qualityScore: qualityScore.toFixed(2)
        });

        return Math.round(qualityScore * 10) / 10; // 소수점 첫째자리까지
    }

    /**
     * 포트폴리오 형태로 변환
     */
    async convertToPortfolioFormat(session, qualityScore) {
        const problem = session.problem;
        const solution = session.solution;

        return {
            title: problem.description,
            category: problem.category,
            priority: problem.priority,
            
            // STAR 형식으로 변환
            situation: {
                context: problem.context.description || '',
                businessBackground: this.extractBusinessContext(session),
                technicalEnvironment: session.context.environment,
                timeline: this.formatDuration(session.duration)
            },

            task: {
                objective: problem.description,
                requirements: this.extractRequirements(session),
                constraints: this.extractConstraints(session),
                successCriteria: this.extractSuccessCriteria(session)
            },

            action: {
                approach: solution.summary,
                steps: session.steps.map(step => step.description),
                technicalDecisions: this.extractTechnicalDecisions(session),
                toolsUsed: this.extractToolsUsed(session),
                challenges: this.extractChallenges(session),
                learnings: this.extractLearnings(session)
            },

            result: {
                outcome: solution.outcome.description || '',
                metrics: solution.metrics,
                businessImpact: this.quantifyBusinessImpact(session),
                technicalImprovement: this.quantifyTechnicalImprovement(session),
                lessonsLearned: this.extractLessonsLearned(session),
                futureApplications: this.identifyFutureApplications(session)
            },

            metadata: {
                sessionId: session.sessionId,
                duration: session.duration,
                qualityScore,
                automated: true,
                timestamp: new Date(session.startTime).toISOString()
            }
        };
    }

    /**
     * 학습 데이터베이스 업데이트
     */
    async updateLearningDatabase(session, portfolioData) {
        try {
            const learningEntry = {
                problemPattern: this.extractProblemPattern(session),
                solutionPattern: this.extractSolutionPattern(session),
                context: session.context,
                effectiveness: portfolioData.metadata.qualityScore,
                reusability: this.assessReusability(session),
                timestamp: Date.now()
            };

            // 패턴 데이터베이스에 저장
            const patternDbPath = path.join(
                this.portfolioService.projectRoot,
                'claude-guides/data/solution-patterns.json'
            );

            await this.appendToPatternDatabase(patternDbPath, learningEntry);

            logger.info('학습 데이터베이스 업데이트 완료', {
                sessionId: session.sessionId,
                pattern: learningEntry.problemPattern
            });

        } catch (error) {
            logger.error('학습 데이터베이스 업데이트 실패', error);
        }
    }

    // ===== 품질 평가 메서드 =====

    assessTechnicalDepth(session) {
        let score = 0;
        
        // 기술 스택 복잡도
        const techKeywords = ['architecture', 'performance', 'security', 'database', 'api'];
        techKeywords.forEach(keyword => {
            if (session.problem.description.toLowerCase().includes(keyword)) {
                score += 1.5;
            }
        });

        // 단계 수와 복잡도
        const complexSteps = session.steps.filter(step => 
            step.type === 'analysis' || step.type === 'breakthrough'
        ).length;
        score += Math.min(complexSteps * 0.5, 3);

        // 파일 변경 규모
        const totalFilesChanged = session.steps.reduce((total, step) => 
            total + (step.metadata.files_changed?.length || 0), 0
        );
        if (totalFilesChanged > 5) score += 2;

        return Math.min(10, score);
    }

    assessBusinessImpact(session) {
        let score = 0;
        
        // 비즈니스 키워드
        const businessKeywords = ['user', 'performance', 'security', 'efficiency', 'revenue', 'experience'];
        businessKeywords.forEach(keyword => {
            if (session.problem.description.toLowerCase().includes(keyword)) {
                score += 1;
            }
        });

        // 우선순위 반영
        const priorityScore = {
            'critical': 4,
            'high': 3,
            'medium': 2,
            'low': 1
        };
        score += priorityScore[session.problem.priority] || 1;

        // 해결 시간 (빠른 해결 = 높은 효율성)
        const hoursDuration = session.duration / (1000 * 60 * 60);
        if (hoursDuration < 2) score += 2;
        else if (hoursDuration < 4) score += 1;

        return Math.min(10, score);
    }

    assessReusability(session) {
        let score = 5; // 기본 점수

        // 범용적인 솔루션인지 확인
        const genericKeywords = ['pattern', 'framework', 'utility', 'helper', 'service'];
        genericKeywords.forEach(keyword => {
            if (session.solution.summary.toLowerCase().includes(keyword)) {
                score += 1;
            }
        });

        // 문서화 품질
        if (session.steps.length > 3) score += 1;
        if (session.solution.metrics && Object.keys(session.solution.metrics).length > 0) score += 1;

        return Math.min(10, score);
    }

    assessDocumentation(session) {
        let score = 0;

        // 단계 상세도
        score += Math.min(session.steps.length * 0.5, 4);

        // 메타데이터 풍부함
        const hasRichMetadata = session.steps.some(step => 
            step.metadata && Object.keys(step.metadata).length > 2
        );
        if (hasRichMetadata) score += 2;

        // 결과 메트릭
        if (session.solution.metrics && Object.keys(session.solution.metrics).length > 0) {
            score += 2;
        }

        // Git 커밋 연결
        if (session.steps.some(step => step.metadata.git_commit)) {
            score += 2;
        }

        return Math.min(10, score);
    }

    assessInnovation(session) {
        let score = 5; // 기본 점수

        // 창의적 키워드
        const innovativeKeywords = ['optimize', 'automate', 'integrate', 'enhance', 'design'];
        innovativeKeywords.forEach(keyword => {
            if (session.solution.summary.toLowerCase().includes(keyword)) {
                score += 1;
            }
        });

        // 새로운 도구나 기술 사용
        if (session.steps.some(step => step.type === 'breakthrough')) {
            score += 2;
        }

        return Math.min(10, score);
    }

    // ===== 유틸리티 메서드 =====

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    categorizeProblem(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('performance') || desc.includes('slow')) return 'performance';
        if (desc.includes('security') || desc.includes('auth')) return 'security';
        if (desc.includes('api') || desc.includes('integration')) return 'integration';
        if (desc.includes('database') || desc.includes('data')) return 'dataModeling';
        if (desc.includes('ui') || desc.includes('user')) return 'userExperience';
        
        return 'architecture';
    }

    assessProblemPriority(description, context) {
        if (description.toLowerCase().includes('critical') || description.toLowerCase().includes('urgent')) {
            return 'critical';
        }
        if (description.toLowerCase().includes('important') || context.priority === 'high') {
            return 'high';
        }
        return 'medium';
    }

    formatDuration(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        }
        return `${minutes}분`;
    }

    // 스켈레톤 메서드들 (실제 구현에서 확장)
    async captureProjectState() { 
        return { 
            timestamp: Date.now(),
            branch: 'main',
            lastCommit: 'abc123',
            changedFiles: []
        }; 
    }
    
    captureEnvironmentInfo() { 
        return {
            os: process.platform,
            node: process.version,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };
    }

    calculateStepDuration() { return 0; }
    async detectChangedFiles() { return []; }
    async getCurrentGitCommit() { return 'abc123'; }
    async saveSessionSnapshot() { return; }
    async recoverPreviousSession() { return; }
    setupAutoSave() { 
        setInterval(() => {
            if (this.currentSession.isActive) {
                this.saveSessionSnapshot();
            }
        }, this.captureConfig.autoSaveInterval);
    }
    
    async calculateSolutionMetrics() { return {}; }
    async archiveSession(session) { return; }
    
    extractBusinessContext(session) { return '재외동포 요양시설 매칭 서비스 개선'; }
    extractRequirements(session) { return []; }
    extractConstraints(session) { return []; }
    extractSuccessCriteria(session) { return []; }
    extractTechnicalDecisions(session) { return []; }
    extractToolsUsed(session) { return []; }
    extractChallenges(session) { return []; }
    extractLearnings(session) { return []; }
    quantifyBusinessImpact(session) { return '사용자 경험 개선'; }
    quantifyTechnicalImprovement(session) { return '시스템 안정성 향상'; }
    extractLessonsLearned(session) { return []; }
    identifyFutureApplications(session) { return []; }
    extractProblemPattern(session) { return session.problem.category; }
    extractSolutionPattern(session) { return 'structured_approach'; }
    
    async appendToPatternDatabase(path, entry) { return; }

    async cleanup() {
        logger.info('자동화된 솔루션 기록 시스템 정리 중...');
        
        if (this.currentSession.isActive) {
            await this.endCurrentSession('cleanup');
        }
        
        this.initialized = false;
    }

    async endCurrentSession(reason = 'manual') {
        if (this.currentSession.isActive) {
            logger.info('세션 종료', {
                sessionId: this.currentSession.sessionId,
                reason,
                duration: Date.now() - this.currentSession.startTime
            });
            
            this.currentSession.isActive = false;
        }
    }
}

module.exports = AutomatedSolutionLogger;