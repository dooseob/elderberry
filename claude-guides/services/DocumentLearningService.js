#!/usr/bin/env node

/**
 * 문서 학습 서비스
 * docs/ 디렉토리의 WORK_LOG.md, work-reports/ 등을 분석하여
 * 작업 패턴과 개발 히스토리를 학습하는 AI 시스템
 * Context7 지침에 따른 지능형 문서 관리
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentLearningService {
    constructor() {
        this.version = "1.0.0";
        this.docsPath = path.join(__dirname, '../docs');
        this.workLogPath = path.join(this.docsPath, 'active/WORK_LOG.md');
        this.workReportsPath = path.join(this.docsPath, 'active/work-reports');
        
        // claude-guides 내부 통합 경로도 추가
        this.claudeGuidesPath = path.join(__dirname, '..');
        this.solutionsDbPath = path.join(this.claudeGuidesPath, 'troubleshooting/solutions-db.md');
        this.learningCache = new Map();
        
        console.log('📚 문서 학습 서비스 초기화 완료');
    }

    /**
     * WORK_LOG.md에서 작업 패턴 학습
     */
    async learnFromWorkLog() {
        try {
            const workLogContent = await fs.readFile(this.workLogPath, 'utf8');
            
            const patterns = {
                workTypes: this.extractWorkTypes(workLogContent),
                timePatterns: this.extractTimePatterns(workLogContent),
                frequentIssues: this.extractFrequentIssues(workLogContent),
                successPatterns: this.extractSuccessPatterns(workLogContent),
                collaborationInsights: this.extractCollaborationInsights(workLogContent)
            };

            this.learningCache.set('workLog', patterns);
            console.log('📊 WORK_LOG.md 학습 완료');
            return patterns;
            
        } catch (error) {
            console.warn('⚠️ WORK_LOG.md 학습 실패:', error.message);
            return this.createEmptyWorkLogLearning();
        }
    }

    /**
     * work-reports/ 폴더에서 작업 완료 패턴 학습
     */
    async learnFromWorkReports() {
        try {
            const reportFiles = await fs.readdir(this.workReportsPath);
            const reports = [];
            
            for (const file of reportFiles) {
                if (file.endsWith('.md')) {
                    const filePath = path.join(this.workReportsPath, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    reports.push({
                        filename: file,
                        date: this.extractDateFromFilename(file),
                        content: content,
                        achievements: this.extractAchievements(content),
                        duration: this.extractWorkDuration(content),
                        challenges: this.extractChallenges(content)
                    });
                }
            }

            const patterns = {
                productivityPatterns: this.analyzeProductivityPatterns(reports),
                commonAchievements: this.analyzeCommonAchievements(reports),
                recurringChallenges: this.analyzeRecurringChallenges(reports),
                workIntensity: this.analyzeWorkIntensity(reports),
                qualityMetrics: this.analyzeQualityMetrics(reports)
            };

            this.learningCache.set('workReports', patterns);
            console.log(`📈 work-reports 학습 완료 (${reports.length}개 파일)`);
            return patterns;
            
        } catch (error) {
            console.warn('⚠️ work-reports 학습 실패:', error.message);
            return this.createEmptyWorkReportsLearning();
        }
    }

    /**
     * 문서에서 개발 인사이트 추출
     */
    async extractDevelopmentInsights() {
        const workLogPatterns = await this.learnFromWorkLog();
        const workReportPatterns = await this.learnFromWorkReports();
        
        return {
            // 개발 속도 패턴
            velocityInsights: {
                averageTaskTime: this.calculateAverageTaskTime(workReportPatterns),
                peakProductivityHours: this.identifyPeakHours(workLogPatterns),
                complexityFactors: this.identifyComplexityFactors(workLogPatterns)
            },
            
            // 품질 지표
            qualityInsights: {
                bugRate: this.calculateBugRate(workLogPatterns),
                reworkFrequency: this.calculateReworkFrequency(workReportPatterns),
                codeReviewEffectiveness: this.analyzeCodeReviewEffectiveness(workLogPatterns)
            },
            
            // 팀 협업 패턴
            collaborationInsights: {
                communicationPatterns: workLogPatterns.collaborationInsights,
                knowledgeSharingFrequency: this.analyzeKnowledgeSharing(workReportPatterns),
                blockerResolutionTime: this.analyzeBlockerResolution(workLogPatterns)
            },
            
            // 기술적 인사이트
            technicalInsights: {
                preferredTechnologies: this.identifyPreferredTech(workLogPatterns),
                architecturalDecisions: this.extractArchitecturalDecisions(workReportPatterns),
                performanceOptimizations: this.extractPerformanceOptimizations(workLogPatterns)
            }
        };
    }

    /**
     * 컨텍스트 기반 작업 추천
     */
    async generateWorkRecommendations(currentContext) {
        const insights = await this.extractDevelopmentInsights();
        
        const recommendations = [];
        
        // 시간 기반 추천
        const currentHour = new Date().getHours();
        if (insights.velocityInsights.peakProductivityHours.includes(currentHour)) {
            recommendations.push({
                type: 'timing',
                message: '현재 시간은 생산성이 높은 시간대입니다',
                suggestion: '복잡한 구현 작업을 진행하기 좋습니다'
            });
        }
        
        // 작업 유형 기반 추천
        const frequentIssues = insights.qualityInsights;
        if (frequentIssues.bugRate > 0.3) {
            recommendations.push({
                type: 'quality',
                message: '최근 버그 발생률이 높습니다',
                suggestion: '코드 리뷰 프로세스를 강화하고 테스트 커버리지를 증가시키세요'
            });
        }
        
        // 기술적 추천
        const techPreferences = insights.technicalInsights.preferredTechnologies;
        recommendations.push({
            type: 'technical',
            message: '프로젝트에서 선호하는 기술 스택 활용',
            suggestion: `${techPreferences.slice(0, 3).join(', ')} 기술을 우선 활용하세요`
        });
        
        return recommendations;
    }

    // 헬퍼 메서드들
    extractWorkTypes(content) {
        const workTypeRegex = /(?:작업|구현|개발|수정|추가).*?:(.*?)(?:\n|$)/g;
        const workTypes = [];
        let match;
        
        while ((match = workTypeRegex.exec(content)) !== null) {
            workTypes.push(match[1].trim());
        }
        
        return [...new Set(workTypes)].slice(0, 10);
    }

    extractTimePatterns(content) {
        const timeRegex = /(\d{1,2}):(\d{2})/g;
        const times = [];
        let match;
        
        while ((match = timeRegex.exec(content)) !== null) {
            times.push(parseInt(match[1]));
        }
        
        // 가장 빈번한 작업 시간대 분석
        const hourCounts = {};
        times.forEach(hour => {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        return Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([hour]) => parseInt(hour));
    }

    extractFrequentIssues(content) {
        const issuePatterns = [
            'error', 'issue', 'problem', 'bug', 'fail',
            '에러', '문제', '이슈', '실패', '오류'
        ];
        
        const issues = [];
        issuePatterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'gi');
            const matches = content.match(regex);
            if (matches) {
                issues.push({ type: pattern, count: matches.length });
            }
        });
        
        return issues.sort((a, b) => b.count - a.count).slice(0, 5);
    }

    extractSuccessPatterns(content) {
        const successPatterns = [
            'complete', 'success', 'done', 'finish', 'resolve',
            '완료', '성공', '해결', '구현', '완성'
        ];
        
        const successes = [];
        successPatterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'gi');
            const matches = content.match(regex);
            if (matches) {
                successes.push({ type: pattern, count: matches.length });
            }
        });
        
        return successes.sort((a, b) => b.count - a.count).slice(0, 5);
    }

    extractCollaborationInsights(content) {
        const collaborationKeywords = [
            'team', 'collaboration', 'review', 'meeting',
            '팀', '협업', '리뷰', '회의', '논의'
        ];
        
        const insights = {};
        collaborationKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = content.match(regex);
            insights[keyword] = matches ? matches.length : 0;
        });
        
        return insights;
    }

    extractDateFromFilename(filename) {
        const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
        return dateMatch ? dateMatch[1] : null;
    }

    extractAchievements(content) {
        const achievementMarkers = ['완료', '구현', '성공', '해결', 'complete', 'implement'];
        const achievements = [];
        
        achievementMarkers.forEach(marker => {
            const regex = new RegExp(`${marker}.*?(?:\n|$)`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                achievements.push(...matches.map(m => m.trim()));
            }
        });
        
        return achievements.slice(0, 10);
    }

    extractWorkDuration(content) {
        const durationRegex = /(\d+)(?:시간|hour|hr)/gi;
        const matches = content.match(durationRegex);
        
        if (matches) {
            const hours = matches.map(m => parseInt(m.match(/\d+/)[0]));
            return hours.reduce((sum, h) => sum + h, 0);
        }
        
        return 0;
    }

    extractChallenges(content) {
        const challengeMarkers = ['문제', '어려움', '이슈', 'issue', 'problem', 'challenge'];
        const challenges = [];
        
        challengeMarkers.forEach(marker => {
            const regex = new RegExp(`${marker}.*?(?:\n|$)`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                challenges.push(...matches.map(m => m.trim()));
            }
        });
        
        return challenges.slice(0, 5);
    }

    // 분석 메서드들
    analyzeProductivityPatterns(reports) {
        const totalHours = reports.reduce((sum, report) => sum + report.duration, 0);
        const totalAchievements = reports.reduce((sum, report) => sum + report.achievements.length, 0);
        
        return {
            averageHoursPerDay: Math.round(totalHours / reports.length),
            averageAchievementsPerDay: Math.round(totalAchievements / reports.length),
            productivityScore: Math.round((totalAchievements / Math.max(totalHours, 1)) * 100)
        };
    }

    analyzeCommonAchievements(reports) {
        const allAchievements = reports.flatMap(r => r.achievements);
        const achievementCounts = {};
        
        allAchievements.forEach(achievement => {
            const key = achievement.toLowerCase();
            achievementCounts[key] = (achievementCounts[key] || 0) + 1;
        });
        
        return Object.entries(achievementCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([achievement, count]) => ({ achievement, count }));
    }

    analyzeRecurringChallenges(reports) {
        const allChallenges = reports.flatMap(r => r.challenges);
        const challengeCounts = {};
        
        allChallenges.forEach(challenge => {
            const key = challenge.toLowerCase();
            challengeCounts[key] = (challengeCounts[key] || 0) + 1;
        });
        
        return Object.entries(challengeCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([challenge, count]) => ({ challenge, count }));
    }

    analyzeWorkIntensity(reports) {
        const intensityByDate = reports.map(report => ({
            date: report.date,
            intensity: (report.achievements.length + report.challenges.length) / Math.max(report.duration, 1)
        }));
        
        const avgIntensity = intensityByDate.reduce((sum, item) => sum + item.intensity, 0) / reports.length;
        
        return {
            averageIntensity: Math.round(avgIntensity * 100) / 100,
            peakIntensityDates: intensityByDate
                .sort((a, b) => b.intensity - a.intensity)
                .slice(0, 3)
                .map(item => item.date)
        };
    }

    analyzeQualityMetrics(reports) {
        const bugReports = reports.filter(r => 
            r.challenges.some(c => c.toLowerCase().includes('bug') || c.toLowerCase().includes('버그'))
        );
        
        return {
            bugRate: Math.round((bugReports.length / reports.length) * 100) / 100,
            averageChallengesPerDay: Math.round(
                reports.reduce((sum, r) => sum + r.challenges.length, 0) / reports.length
            )
        };
    }

    // 기본값 생성 메서드들
    createEmptyWorkLogLearning() {
        return {
            workTypes: [],
            timePatterns: [],
            frequentIssues: [],
            successPatterns: [],
            collaborationInsights: {}
        };
    }

    createEmptyWorkReportsLearning() {
        return {
            productivityPatterns: { averageHoursPerDay: 0, averageAchievementsPerDay: 0, productivityScore: 0 },
            commonAchievements: [],
            recurringChallenges: [],
            workIntensity: { averageIntensity: 0, peakIntensityDates: [] },
            qualityMetrics: { bugRate: 0, averageChallengesPerDay: 0 }
        };
    }

    // 추가 분석 메서드들 (기본 구현)
    calculateAverageTaskTime(patterns) {
        return patterns.workIntensity.averageIntensity > 0 ? 
            Math.round(8 / patterns.workIntensity.averageIntensity) : 4;
    }

    identifyPeakHours(patterns) {
        return patterns.timePatterns.length > 0 ? patterns.timePatterns : [9, 10, 14, 15];
    }

    identifyComplexityFactors(patterns) {
        return patterns.frequentIssues.map(issue => issue.type);
    }

    calculateBugRate(patterns) {
        const bugIssues = patterns.frequentIssues.filter(issue => 
            ['error', 'bug', 'fail', '에러', '버그'].includes(issue.type.toLowerCase())
        );
        return bugIssues.reduce((sum, issue) => sum + issue.count, 0) / 100;
    }

    calculateReworkFrequency(patterns) {
        return patterns.recurringChallenges.length / Math.max(patterns.commonAchievements.length, 1);
    }

    analyzeCodeReviewEffectiveness(patterns) {
        const reviewMentions = patterns.collaborationInsights.review || 0;
        return reviewMentions > 10 ? 'high' : reviewMentions > 5 ? 'medium' : 'low';
    }

    analyzeKnowledgeSharing(patterns) {
        return patterns.commonAchievements.filter(a => 
            a.achievement.includes('공유') || a.achievement.includes('문서')
        ).length;
    }

    analyzeBlockerResolution(patterns) {
        const blockerIssues = patterns.frequentIssues.filter(issue => 
            ['issue', 'problem', '문제', '이슈'].includes(issue.type.toLowerCase())
        );
        return blockerIssues.length > 0 ? 'needs_attention' : 'good';
    }

    identifyPreferredTech(patterns) {
        const techKeywords = ['spring', 'react', 'java', 'javascript', 'api', 'database'];
        return techKeywords.filter(tech => 
            patterns.workTypes.some(type => type.toLowerCase().includes(tech))
        );
    }

    extractArchitecturalDecisions(patterns) {
        return patterns.commonAchievements
            .filter(a => a.achievement.toLowerCase().includes('architecture') || 
                        a.achievement.includes('아키텍처'))
            .map(a => a.achievement);
    }

    extractPerformanceOptimizations(patterns) {
        return patterns.successPatterns
            .filter(p => ['performance', 'optimize', '최적화', '성능'].includes(p.type.toLowerCase()))
            .map(p => p.type);
    }

    /**
     * 서비스 상태 조회
     */
    getStatus() {
        return {
            version: this.version,
            cacheSize: this.learningCache.size,
            availableLearning: Array.from(this.learningCache.keys())
        };
    }
}

module.exports = DocumentLearningService;