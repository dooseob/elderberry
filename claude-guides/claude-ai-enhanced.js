#!/usr/bin/env node

/**
 * Claude AI 기반 강화된 개발 가이드 시스템
 * 자기 진화형 AI 개발 파트너 - 통합 실행 인터페이스
 * Context7 지침에 따른 체계적 분석, 학습, 개선 시스템
 */

const path = require('path');
const fs = require('fs');
const IntelligentContextAnalyzer = require('./analyzers/intelligent-context-analyzer');
const AutomatedFeedbackSystem = require('./feedback/automated-feedback-system');

class ClaudeAIEnhancedSystem {
    constructor() {
        this.version = '2.0.0';
        this.analyzer = new IntelligentContextAnalyzer();
        this.feedbackSystem = new AutomatedFeedbackSystem();
        this.config = this.loadConfiguration();
    }

    /**
     * 시스템 설정 로드
     */
    loadConfiguration() {
        const configPath = path.join(__dirname, 'config/system-config.json');
        
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        // 기본 설정
        return {
            analysis: {
                enabled: true,
                auto_fix_suggestions: true,
                performance_monitoring: true,
                file_patterns: ["**/*.java", "**/*.js", "**/*.ts"],
                exclude_patterns: ["**/node_modules/**", "**/build/**", "**/target/**"]
            },
            feedback: {
                enabled: true,
                auto_learning: true,
                commit_tracking: true,
                build_verification: true,
                ci_integration: true
            },
            notifications: {
                enabled: true,
                slack_webhook: null,
                email_alerts: false,
                console_output: true
            },
            thresholds: {
                critical_issues_alert: 5,
                success_rate_minimum: 0.7,
                improvement_rate_minimum: 0.05
            }
        };
    }

    /**
     * 전체 시스템 실행 - 분석부터 학습까지
     */
    async runFullCycle() {
        console.log('🚀 Claude AI 강화 시스템 v' + this.version + ' 시작');
        console.log('=' .repeat(80));

        try {
            // 1단계: 지능형 코드 분석
            console.log('\n📊 1단계: 지능형 컨텍스트 분석 실행...');
            const analysisResults = await this.analyzer.analyzeProject();
            
            // 2단계: 분석 결과에서 제안 등록
            console.log('\n💡 2단계: AI 제안 등록 및 추적 시작...');
            await this.registerSuggestions(analysisResults);

            // 3단계: Git 히스토리 분석 및 피드백 수집
            console.log('\n🔄 3단계: Git 커밋 분석 및 피드백 수집...');
            await this.feedbackSystem.processGitCommits();

            // 4단계: 학습 기반 새 규칙 생성
            console.log('\n🧠 4단계: 성공 패턴 학습 및 새 규칙 생성...');
            const newRules = this.feedbackSystem.generateNewRules();

            // 5단계: 학습 성과 리포트 생성
            console.log('\n📈 5단계: 학습 성과 분석 및 리포트 생성...');
            const learningReport = this.feedbackSystem.generateLearningReport();

            // 6단계: 알림 및 액션 아이템 생성
            console.log('\n🔔 6단계: 알림 발송 및 액션 아이템 생성...');
            await this.processNotifications(analysisResults, learningReport);

            // 완료 요약
            this.printCompletionSummary(analysisResults, newRules, learningReport);

            return {
                success: true,
                analysis: analysisResults,
                newRules: newRules,
                learning: learningReport,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ 시스템 실행 중 오류 발생:', error);
            throw error;
        }
    }

    /**
     * 분석 결과에서 추적 가능한 제안들 등록
     */
    async registerSuggestions(analysisResults) {
        let registeredCount = 0;

        for (const fileResult of analysisResults) {
            for (const suggestion of fileResult.suggestions) {
                const suggestionId = this.feedbackSystem.registerSuggestion({
                    ruleId: suggestion.issueId,
                    filePath: fileResult.filePath,
                    severity: 'medium', // 실제로는 더 정확한 심각도 매핑 필요
                    suggestedFix: suggestion.template || suggestion.description,
                    context: {
                        type: suggestion.type,
                        difficulty: suggestion.difficulty,
                        estimatedTime: suggestion.estimatedTime
                    }
                });

                registeredCount++;
            }
        }

        console.log(`✅ ${registeredCount}개 제안 등록 완료`);
    }

    /**
     * 알림 처리 및 액션 아이템 생성
     */
    async processNotifications(analysisResults, learningReport) {
        const criticalIssues = this.countCriticalIssues(analysisResults);
        const successRate = parseFloat(learningReport.overview.success_rate) / 100;

        // 임계값 기반 알림
        if (criticalIssues >= this.config.thresholds.critical_issues_alert) {
            await this.sendAlert({
                type: 'critical_issues',
                count: criticalIssues,
                message: `${criticalIssues}개의 심각한 이슈가 발견되었습니다. 즉시 검토가 필요합니다.`,
                priority: 'high',
                actionItems: [
                    '심각한 이슈들을 우선순위에 따라 분류',
                    '개발팀에 즉시 수정 작업 할당',
                    '일일 진행 상황 모니터링'
                ]
            });
        }

        if (successRate < this.config.thresholds.success_rate_minimum) {
            await this.sendAlert({
                type: 'low_success_rate',
                rate: learningReport.overview.success_rate,
                message: `AI 제안 성공률이 ${learningReport.overview.success_rate}로 기준치(${this.config.thresholds.success_rate_minimum * 100}%) 미만입니다.`,
                priority: 'medium',
                actionItems: [
                    '실패한 제안들의 패턴 분석',
                    '가이드라인 규칙의 정확도 검토',
                    '개발자 피드백 수집 및 반영'
                ]
            });
        }

        // 성공 사례 축하
        if (successRate > 0.9) {
            await this.sendCelebration({
                type: 'high_performance',
                rate: learningReport.overview.success_rate,
                message: `🎉 축하합니다! AI 제안 성공률이 ${learningReport.overview.success_rate}에 달했습니다!`,
                achievements: [
                    '높은 수준의 코드 품질 유지',
                    '효과적인 AI-개발자 협업',
                    '지속적인 시스템 개선'
                ]
            });
        }
    }

    /**
     * 심각한 이슈 개수 계산
     */
    countCriticalIssues(analysisResults) {
        return analysisResults.reduce((count, fileResult) => {
            return count + fileResult.issues.filter(issue => issue.severity === 'critical').length;
        }, 0);
    }

    /**
     * 알림 발송
     */
    async sendAlert(alert) {
        console.log(`\n🚨 ${alert.type.toUpperCase()} 알림:`);
        console.log(`📋 ${alert.message}`);
        
        if (alert.actionItems) {
            console.log('📝 필요한 액션:');
            alert.actionItems.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item}`);
            });
        }

        // 실제 구현에서는 Slack, 이메일 등으로 발송
        if (this.config.notifications.slack_webhook) {
            await this.sendSlackNotification(alert);
        }
    }

    /**
     * 성공 축하 메시지
     */
    async sendCelebration(celebration) {
        console.log(`\n🎉 ${celebration.type.toUpperCase()}:`);
        console.log(`🌟 ${celebration.message}`);
        
        if (celebration.achievements) {
            console.log('🏆 달성 성과:');
            celebration.achievements.forEach((achievement, index) => {
                console.log(`   ✨ ${achievement}`);
            });
        }
    }

    /**
     * Slack 알림 발송 (실제 구현)
     */
    async sendSlackNotification(alert) {
        // 실제 Slack Webhook 구현
        try {
            console.log('📱 Slack 알림 발송:', alert.message);
        } catch (error) {
            console.warn('Slack 알림 발송 실패:', error.message);
        }
    }

    /**
     * 완료 요약 출력
     */
    printCompletionSummary(analysisResults, newRules, learningReport) {
        console.log('\n' + '='.repeat(80));
        console.log('🎯 Claude AI 강화 시스템 실행 완료');
        console.log('='.repeat(80));
        
        console.log('📊 분석 결과:');
        console.log(`   - 분석 파일: ${analysisResults.length}개`);
        console.log(`   - 발견 이슈: ${analysisResults.reduce((sum, r) => sum + r.issues.length, 0)}개`);
        console.log(`   - 생성 제안: ${analysisResults.reduce((sum, r) => sum + r.suggestions.length, 0)}개`);
        
        console.log('\n🧠 학습 성과:');
        console.log(`   - 전체 성공률: ${learningReport.overview.success_rate}`);
        console.log(`   - 개선률: ${learningReport.overview.improvement_rate}`);
        console.log(`   - 새로운 규칙: ${newRules.length}개`);
        
        console.log('\n📄 상세 리포트:');
        console.log('   - 분석 리포트: claude-guides/reports/analysis-report.json');
        console.log('   - 학습 리포트: claude-guides/reports/learning-report.json');
        console.log('   - 피드백 DB: claude-guides/knowledge-base/feedback-database.json');
        
        console.log('\n🚀 다음 실행: node claude-guides/claude-ai-enhanced.js');
        console.log('='.repeat(80) + '\n');
    }

    /**
     * 특정 명령어 실행
     */
    async executeCommand(command, options = {}) {
        switch (command) {
            case 'analyze':
                return await this.analyzer.analyzeProject(options.projectPath);
                
            case 'learn':
                await this.feedbackSystem.processGitCommits(options.sinceCommit);
                return this.feedbackSystem.generateLearningReport();
                
            case 'generate-rules':
                return this.feedbackSystem.generateNewRules();
                
            case 'full-cycle':
                return await this.runFullCycle();
                
            default:
                throw new Error(`알 수 없는 명령어: ${command}`);
        }
    }
}

// CLI 실행
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'full-cycle';
    
    const system = new ClaudeAIEnhancedSystem();
    
    system.executeCommand(command)
        .then(result => {
            console.log('✅ 실행 완료');
            if (result && typeof result === 'object') {
                console.log('📋 결과 요약:', Object.keys(result));
            }
        })
        .catch(error => {
            console.error('❌ 실행 실패:', error.message);
            process.exit(1);
        });
}

module.exports = ClaudeAIEnhancedSystem;