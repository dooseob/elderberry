/**
 * 포트폴리오 중심 트러블슈팅 서비스
 * 
 * 목적:
 * 1. 취업 포트폴리오에 활용할 수 있는 핵심 이슈만 선별
 * 2. 개발자 성장을 보여주는 문제 해결 과정 기록
 * 3. 중복되거나 사소한 이슈 제거로 효율성 극대화
 * 4. 누구나 이해할 수 있는 명확한 기록 유지
 * 
 * 모범 사례:
 * - STAR 방법론 (Situation, Task, Action, Result) 적용
 * - 기술적 깊이와 비즈니스 영향도 균형
 * - 학습 과정과 성장 내러티브 포함
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('./DocumentLearningService').logger;

class PortfolioTroubleshootingService {
    constructor() {
        this.initialized = false;
        this.projectRoot = process.cwd();
        
        // 포트폴리오 중심 설정
        this.portfolioConfig = {
            maxIssuesPerCategory: 5, // 카테고리당 최대 5개 이슈만 유지
            minImpactScore: 7, // 10점 만점 중 7점 이상만 기록
            techStackFocus: ['Java', 'Spring Boot', 'React', 'TypeScript', 'API'], // 포트폴리오 강조 기술
            excludePatterns: ['typo', '오타', 'formatting', '포맷', 'spacing', '공백'] // 제외할 패턴
        };

        // 핵심 카테고리 정의
        this.coreCategories = {
            architecture: {
                name: '시스템 아키텍처',
                description: '시스템 설계 및 구조적 의사결정',
                weight: 10,
                portfolioValue: 'high'
            },
            performance: {
                name: '성능 최적화',
                description: '시스템 성능 개선 및 최적화',
                weight: 9,
                portfolioValue: 'high'
            },
            security: {
                name: '보안 강화',
                description: '보안 취약점 해결 및 보안 시스템 구축',
                weight: 9,
                portfolioValue: 'high'
            },
            integration: {
                name: '시스템 통합',
                description: '외부 시스템 연동 및 API 통합',
                weight: 8,
                portfolioValue: 'medium'
            },
            dataModeling: {
                name: '데이터 모델링',
                description: '데이터베이스 설계 및 데이터 구조 최적화',
                weight: 8,
                portfolioValue: 'medium'
            },
            userExperience: {
                name: '사용자 경험',
                description: 'UI/UX 개선 및 사용성 향상',
                weight: 7,
                portfolioValue: 'medium'
            }
        };

        // 성장 지표
        this.growthIndicators = {
            problemSolvingEvolution: [], // 문제 해결 능력 발전 과정
            technicalSkillProgression: [], // 기술 역량 성장
            collaborationImprovement: [], // 협업 능력 향상
            businessImpactGrowth: [] // 비즈니스 영향력 확대
        };
    }

    async initialize() {
        try {
            logger.info('포트폴리오 트러블슈팅 서비스 초기화 시작');

            // 기존 트러블슈팅 데이터 분석 및 정제
            await this.analyzeExistingIssues();

            // 포트폴리오 메타데이터 생성
            await this.generatePortfolioMetadata();

            this.initialized = true;
            logger.info('포트폴리오 트러블슈팅 서비스 초기화 완료');

        } catch (error) {
            logger.error('포트폴리오 트러블슈팅 서비스 초기화 실패', error);
            throw error;
        }
    }

    /**
     * 핵심 이슈 기록 (STAR 방법론 적용)
     */
    async recordCoreIssue(issueData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // 1. 이슈 필터링 및 검증
            const isPortfolioWorthy = await this.validatePortfolioValue(issueData);
            if (!isPortfolioWorthy) {
                logger.info('포트폴리오 가치 부족으로 이슈 기록 생략', { issue: issueData.title });
                return false;
            }

            // 2. STAR 구조로 변환
            const starIssue = await this.convertToSTARFormat(issueData);

            // 3. 기술적 깊이 및 비즈니스 영향도 평가
            const enrichedIssue = await this.enrichIssueData(starIssue);

            // 4. 카테고리별 저장 (최대 개수 관리)
            await this.saveToPortfolioCategory(enrichedIssue);

            // 5. 성장 지표 업데이트
            await this.updateGrowthIndicators(enrichedIssue);

            logger.info('핵심 이슈 기록 완료', { 
                category: enrichedIssue.category,
                impactScore: enrichedIssue.impactScore,
                portfolioValue: enrichedIssue.portfolioValue
            });

            return true;

        } catch (error) {
            logger.error('핵심 이슈 기록 실패', error);
            return false;
        }
    }

    /**
     * 포트폴리오 가치 검증
     */
    async validatePortfolioValue(issueData) {
        // 1. 제외 패턴 확인
        const title = issueData.title?.toLowerCase() || '';
        const description = issueData.description?.toLowerCase() || '';
        
        for (const excludePattern of this.portfolioConfig.excludePatterns) {
            if (title.includes(excludePattern) || description.includes(excludePattern)) {
                return false;
            }
        }

        // 2. 기술적 복잡도 평가
        const technicalComplexity = this.assessTechnicalComplexity(issueData);
        if (technicalComplexity < 5) {
            return false;
        }

        // 3. 비즈니스 영향도 평가
        const businessImpact = this.assessBusinessImpact(issueData);
        if (businessImpact < 6) {
            return false;
        }

        // 4. 전체 영향 점수
        const totalImpactScore = (technicalComplexity + businessImpact) / 2;
        return totalImpactScore >= this.portfolioConfig.minImpactScore;
    }

    /**
     * STAR 형식으로 변환
     */
    async convertToSTARFormat(issueData) {
        return {
            id: this.generateIssueId(),
            timestamp: new Date().toISOString(),
            
            // STAR 구조
            situation: {
                context: issueData.context || '',
                businessBackground: this.extractBusinessContext(issueData),
                technicalEnvironment: this.extractTechnicalContext(issueData),
                stakeholders: issueData.stakeholders || []
            },
            
            task: {
                objective: issueData.objective || issueData.title,
                requirements: issueData.requirements || [],
                constraints: issueData.constraints || [],
                successCriteria: issueData.successCriteria || []
            },
            
            action: {
                approach: issueData.solution || '',
                technicalDecisions: this.extractTechnicalDecisions(issueData),
                implementationSteps: issueData.steps || [],
                toolsAndTechnologies: this.extractTechStack(issueData),
                challenges: issueData.challenges || [],
                learnings: issueData.learnings || []
            },
            
            result: {
                outcome: issueData.outcome || '',
                metrics: issueData.metrics || {},
                businessImpact: issueData.businessImpact || '',
                technicalImprovement: issueData.technicalImprovement || '',
                lessonsLearned: issueData.lessonsLearned || [],
                futureApplications: issueData.futureApplications || []
            },

            // 메타데이터
            metadata: {
                originalIssue: issueData,
                version: '1.0',
                lastUpdated: new Date().toISOString()
            }
        };
    }

    /**
     * 이슈 데이터 풍성화
     */
    async enrichIssueData(starIssue) {
        // 카테고리 자동 분류
        const category = this.classifyIssueCategory(starIssue);
        
        // 기술 스택 분석
        const techStack = this.analyzeTechStack(starIssue);
        
        // 영향도 점수 계산
        const impactScore = this.calculateImpactScore(starIssue);
        
        // 복잡도 분석
        const complexity = this.analyzeComplexity(starIssue);
        
        // 포트폴리오 가치 평가
        const portfolioValue = this.evaluatePortfolioValue(starIssue);

        return {
            ...starIssue,
            category,
            techStack,
            impactScore,
            complexity,
            portfolioValue,
            
            // 포트폴리오 특화 정보
            portfolio: {
                headline: this.generatePortfolioHeadline(starIssue),
                keyAchievements: this.extractKeyAchievements(starIssue),
                skillsdemonstrated: this.identifyDemonstratedSkills(starIssue),
                businessValue: this.quantifyBusinessValue(starIssue),
                readableDescription: this.createReadableDescription(starIssue)
            }
        };
    }

    /**
     * 포트폴리오 카테고리별 저장
     */
    async saveToPortfolioCategory(enrichedIssue) {
        const categoryPath = path.join(
            this.projectRoot, 
            'claude-guides/portfolio/issues',
            enrichedIssue.category
        );

        // 디렉터리 생성
        await fs.mkdir(categoryPath, { recursive: true });

        // 카테고리별 기존 이슈 로드
        const existingIssues = await this.loadCategoryIssues(enrichedIssue.category);

        // 새 이슈 추가
        existingIssues.push(enrichedIssue);

        // 중요도 순으로 정렬 후 최대 개수만 유지
        const sortedIssues = existingIssues
            .sort((a, b) => b.impactScore - a.impactScore)
            .slice(0, this.portfolioConfig.maxIssuesPerCategory);

        // 개별 이슈 파일 저장
        const issueFileName = `${enrichedIssue.id}.md`;
        const issueFilePath = path.join(categoryPath, issueFileName);
        const markdownContent = this.generatePortfolioMarkdown(enrichedIssue);
        
        await fs.writeFile(issueFilePath, markdownContent, 'utf8');

        // 카테고리 요약 업데이트
        await this.updateCategorySummary(enrichedIssue.category, sortedIssues);

        logger.info(`포트폴리오 이슈 저장 완료: ${enrichedIssue.category}/${enrichedIssue.id}`);
    }

    /**
     * 포트폴리오용 마크다운 생성
     */
    generatePortfolioMarkdown(issue) {
        return `# ${issue.portfolio.headline}

## 📋 프로젝트 개요

**프로젝트**: 엘더베리 - 재외동포 맞춤 요양시설 매칭 플랫폼  
**기간**: ${this.formatDateRange(issue.timestamp)}  
**역할**: ${this.extractRole(issue)}  
**기술 스택**: ${issue.techStack.join(', ')}

## 🎯 도전 과제 (Situation & Task)

### 상황
${issue.situation.context}

**비즈니스 배경**:
${issue.situation.businessBackground}

**기술적 환경**:
${issue.situation.technicalEnvironment}

### 해결 목표
${issue.task.objective}

**요구사항**:
${issue.task.requirements.map(req => `- ${req}`).join('\n')}

**제약사항**:
${issue.task.constraints.map(con => `- ${con}`).join('\n')}

## 🚀 해결 과정 (Action)

### 접근 방법
${issue.action.approach}

### 주요 기술적 의사결정
${issue.action.technicalDecisions.map(decision => `
**${decision.decision}**
- 근거: ${decision.rationale}
- 대안: ${decision.alternatives}
- 결과: ${decision.outcome}
`).join('\n')}

### 구현 단계
${issue.action.implementationSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

### 직면한 도전과 해결
${issue.action.challenges.map(challenge => `
**도전**: ${challenge.problem}  
**해결**: ${challenge.solution}  
**학습**: ${challenge.learning}
`).join('\n')}

## 📈 성과 및 결과 (Result)

### 핵심 성과
${issue.portfolio.keyAchievements.map(achievement => `- ${achievement}`).join('\n')}

### 비즈니스 임팩트
${issue.result.businessImpact}

### 기술적 개선
${issue.result.technicalImprovement}

### 정량적 지표
${Object.entries(issue.result.metrics).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## 💡 핵심 학습 및 성장

### 습득한 기술 역량
${issue.portfolio.skillsdemonstrated.map(skill => `- ${skill}`).join('\n')}

### 주요 학습 포인트
${issue.result.lessonsLearned.map(lesson => `- ${lesson}`).join('\n')}

### 향후 적용 방안
${issue.result.futureApplications.map(app => `- ${app}`).join('\n')}

## 🔗 관련 자료

- [소스 코드](링크)
- [시연 영상](링크)
- [기술 문서](링크)

---

**복잡도**: ${issue.complexity.level} (${issue.complexity.score}/10)  
**비즈니스 영향도**: ${issue.impactScore}/10  
**포트폴리오 가치**: ${issue.portfolioValue}

*이 사례는 실제 프로덕션 환경에서 해결한 문제로, ${issue.portfolio.businessValue}의 비즈니스 가치를 창출했습니다.*
`;
    }

    /**
     * 성장 스토리 생성
     */
    async generateGrowthStory() {
        try {
            const allIssues = await this.loadAllPortfolioIssues();
            
            // 시간순 정렬
            const chronologicalIssues = allIssues.sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );

            const growthStory = {
                introduction: this.generateIntroduction(),
                chapters: this.createGrowthChapters(chronologicalIssues),
                skills: this.analyzeSkillProgression(chronologicalIssues),
                impact: this.analyzeImpactProgression(chronologicalIssues),
                future: this.generateFutureVision(chronologicalIssues)
            };

            // 포트폴리오 README 생성
            const readmeContent = this.generatePortfolioReadme(growthStory);
            const readmePath = path.join(this.projectRoot, 'claude-guides/portfolio/README.md');
            
            await fs.writeFile(readmePath, readmeContent, 'utf8');

            logger.info('성장 스토리 생성 완료');
            return growthStory;

        } catch (error) {
            logger.error('성장 스토리 생성 실패', error);
            throw error;
        }
    }

    /**
     * 포트폴리오 요약 대시보드 생성
     */
    async generatePortfolioSummary() {
        const allIssues = await this.loadAllPortfolioIssues();
        
        return {
            overview: {
                totalIssues: allIssues.length,
                categoriesUsed: [...new Set(allIssues.map(i => i.category))],
                averageImpact: allIssues.reduce((sum, i) => sum + i.impactScore, 0) / allIssues.length,
                techStackCoverage: [...new Set(allIssues.flatMap(i => i.techStack))]
            },
            
            highlights: allIssues
                .sort((a, b) => b.impactScore - a.impactScore)
                .slice(0, 3)
                .map(issue => ({
                    title: issue.portfolio.headline,
                    impact: issue.impactScore,
                    achievement: issue.portfolio.keyAchievements[0],
                    category: issue.category
                })),
            
            skillEvolution: this.analyzeSkillEvolution(allIssues),
            
            businessValue: allIssues.reduce((total, issue) => {
                return total + this.quantifyBusinessValueNumeric(issue);
            }, 0),
            
            readinessIndicator: this.calculatePortfolioReadiness(allIssues)
        };
    }

    // ===== 유틸리티 메서드 =====

    generateIssueId() {
        return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    assessTechnicalComplexity(issueData) {
        let score = 0;
        
        // 기술 스택 복잡도
        const techKeywords = ['architecture', 'performance', 'security', 'integration', 'optimization'];
        techKeywords.forEach(keyword => {
            if (issueData.title?.toLowerCase().includes(keyword) || 
                issueData.description?.toLowerCase().includes(keyword)) {
                score += 2;
            }
        });
        
        // 코드 변경 규모
        if (issueData.filesChanged > 10) score += 2;
        if (issueData.linesChanged > 500) score += 2;
        
        return Math.min(10, score);
    }

    assessBusinessImpact(issueData) {
        let score = 0;
        
        // 비즈니스 키워드
        const businessKeywords = ['user', 'performance', 'security', 'efficiency', 'revenue'];
        businessKeywords.forEach(keyword => {
            if (issueData.description?.toLowerCase().includes(keyword)) {
                score += 1.5;
            }
        });
        
        // 사용자 영향도
        if (issueData.userImpact === 'high') score += 3;
        if (issueData.userImpact === 'medium') score += 2;
        if (issueData.userImpact === 'low') score += 1;
        
        return Math.min(10, score);
    }

    extractTechnicalContext(issueData) {
        return `Spring Boot 3.x, React 18, TypeScript 기반 풀스택 웹 애플리케이션`;
    }

    extractBusinessContext(issueData) {
        return `재외동포를 위한 요양시설 매칭 서비스의 ${issueData.feature || '핵심 기능'} 개발`;
    }

    classifyIssueCategory(starIssue) {
        const title = starIssue.task.objective.toLowerCase();
        
        if (title.includes('architecture') || title.includes('design')) return 'architecture';
        if (title.includes('performance') || title.includes('optimization')) return 'performance';  
        if (title.includes('security') || title.includes('auth')) return 'security';
        if (title.includes('api') || title.includes('integration')) return 'integration';
        if (title.includes('database') || title.includes('data')) return 'dataModeling';
        
        return 'userExperience';
    }

    generatePortfolioHeadline(starIssue) {
        const category = this.coreCategories[starIssue.category]?.name || '시스템 개선';
        return `${category}: ${starIssue.task.objective}`;
    }

    // 스켈레톤 메서드들 (실제 구현에서 확장)
    async analyzeExistingIssues() { return []; }
    async generatePortfolioMetadata() { return {}; }
    extractTechnicalDecisions(issueData) { return []; }
    extractTechStack(issueData) { 
        return this.portfolioConfig.techStackFocus.filter(tech => 
            issueData.description?.includes(tech) || issueData.title?.includes(tech)
        );
    }
    calculateImpactScore(starIssue) { return 8; }
    analyzeComplexity(starIssue) { return { level: 'medium', score: 7 }; }
    evaluatePortfolioValue(starIssue) { return 'high'; }
    extractKeyAchievements(starIssue) { 
        return ['시스템 성능 개선', '코드 품질 향상', '사용자 경험 개선'];
    }
    identifyDemonstratedSkills(starIssue) {
        return starIssue.techStack.map(tech => `${tech} 전문성`);
    }
    quantifyBusinessValue(starIssue) { return '사용자 만족도 향상 및 시스템 안정성 강화'; }
    createReadableDescription(starIssue) { return starIssue.task.objective; }
    
    async loadCategoryIssues(category) { return []; }
    async updateCategorySummary(category, issues) { return; }
    async updateGrowthIndicators(issue) { return; }
    async loadAllPortfolioIssues() { return []; }
    
    formatDateRange(timestamp) { return new Date(timestamp).toLocaleDateString('ko-KR'); }
    extractRole(issue) { return '풀스택 개발자'; }
    generateIntroduction() { return '엘더베리 프로젝트를 통한 기술 성장 스토리'; }
    createGrowthChapters(issues) { return []; }
    analyzeSkillProgression(issues) { return {}; }
    analyzeImpactProgression(issues) { return {}; }
    generateFutureVision(issues) { return ''; }
    generatePortfolioReadme(growthStory) { return '# 포트폴리오'; }
    analyzeSkillEvolution(issues) { return {}; }
    quantifyBusinessValueNumeric(issue) { return 100; }
    calculatePortfolioReadiness(issues) { return 85; }

    async cleanup() {
        logger.info('포트폴리오 트러블슈팅 서비스 정리 중...');
        this.initialized = false;
    }
}

module.exports = PortfolioTroubleshootingService;