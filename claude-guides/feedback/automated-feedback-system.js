#!/usr/bin/env node

/**
 * 자동화된 피드백 루프 시스템
 * AI 제안의 성공/실패를 추적하고 학습하는 자기 진화형 시스템
 * Context7 지침에 따른 지속적 개선 메커니즘
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class AutomatedFeedbackSystem {
    constructor() {
        this.feedbackDbPath = path.join(__dirname, '../knowledge-base/feedback-database.json');
        this.feedbackDb = this.loadFeedbackDatabase();
        this.suggestionTracker = new Map();
    }

    /**
     * 피드백 데이터베이스 로드/초기화
     */
    loadFeedbackDatabase() {
        if (fs.existsSync(this.feedbackDbPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.feedbackDbPath, 'utf8'));
            } catch (error) {
                console.warn('피드백 DB 로드 실패, 새로 초기화:', error.message);
            }
        }

        // 초기 데이터베이스 구조
        return {
            version: "1.0",
            created: new Date().toISOString(),
            suggestions: {},
            learning_metrics: {
                total_suggestions: 0,
                accepted_suggestions: 0,
                successful_fixes: 0,
                failed_fixes: 0,
                success_rate: 0.0,
                improvement_rate: 0.0
            },
            pattern_success_rates: {},
            rule_effectiveness: {},
            auto_generated_rules: []
        };
    }

    /**
     * 새로운 제안 등록 및 추적 시작
     */
    registerSuggestion(suggestionData) {
        const suggestionId = this.generateSuggestionId(suggestionData);
        const suggestion = {
            id: suggestionId,
            timestamp: new Date().toISOString(),
            rule_id: suggestionData.ruleId,
            file_path: suggestionData.filePath,
            severity: suggestionData.severity,
            suggested_fix: suggestionData.suggestedFix,
            context: suggestionData.context,
            status: 'pending', // pending, accepted, rejected, implemented, verified
            implementation_method: null, // manual, auto_fix, partial
            success_metrics: null,
            feedback_score: null,
            commit_hash: null,
            build_result: null,
            test_result: null
        };

        this.feedbackDb.suggestions[suggestionId] = suggestion;
        this.feedbackDb.learning_metrics.total_suggestions++;
        
        this.saveFeedbackDatabase();
        
        console.log(`📝 제안 등록: ${suggestionId} (${suggestionData.ruleId})`);
        return suggestionId;
    }

    /**
     * Git 커밋 메시지에서 제안 ID 추출 및 상태 업데이트
     */
    async processGitCommits(sinceCommit = 'HEAD~10') {
        try {
            const commitMessages = execSync(
                `git log --pretty=format:"%H|%s|%an|%ad" --date=iso ${sinceCommit}..HEAD`,
                { encoding: 'utf8' }
            ).split('\n').filter(line => line.trim());

            for (const commitLine of commitMessages) {
                await this.analyzeCommit(commitLine);
            }

            console.log(`✅ ${commitMessages.length}개 커밋 분석 완료`);
        } catch (error) {
            console.error('Git 커밋 분석 실패:', error.message);
        }
    }

    /**
     * 개별 커밋 분석 및 제안 추적
     */
    async analyzeCommit(commitLine) {
        const [hash, message, author, date] = commitLine.split('|');
        
        // 제안 ID 패턴 매칭: fix(guide-123), improve(ARCH_001) 등
        const suggestionPattern = /(?:fix|improve|refactor)\((?:guide-)?([A-Z_0-9]+)\)/i;
        const match = message.match(suggestionPattern);
        
        if (match) {
            const suggestionId = match[1];
            await this.updateSuggestionStatus(suggestionId, {
                status: 'implemented',
                commit_hash: hash,
                implementation_method: 'manual',
                implementer: author,
                implementation_date: date
            });

            // 빌드 및 테스트 결과 확인
            setTimeout(() => {
                this.verifyImplementationSuccess(suggestionId, hash);
            }, 5000); // 5초 후 빌드 결과 확인
        }
    }

    /**
     * 제안 상태 업데이트
     */
    async updateSuggestionStatus(suggestionId, updates) {
        const suggestion = this.feedbackDb.suggestions[suggestionId];
        if (!suggestion) {
            // 예전 제안 ID 형식 변환 시도
            const altId = this.findSuggestionByAltId(suggestionId);
            if (!altId) {
                console.warn(`제안 ID를 찾을 수 없음: ${suggestionId}`);
                return;
            }
            suggestionId = altId;
        }

        Object.assign(this.feedbackDb.suggestions[suggestionId], updates);
        
        if (updates.status === 'implemented') {
            this.feedbackDb.learning_metrics.accepted_suggestions++;
        }

        this.saveFeedbackDatabase();
        console.log(`🔄 제안 상태 업데이트: ${suggestionId} -> ${updates.status}`);
    }

    /**
     * 구현 성공 여부 검증
     */
    async verifyImplementationSuccess(suggestionId, commitHash) {
        try {
            // 빌드 테스트 실행
            const buildResult = await this.runBuildTest(commitHash);
            const testResult = await this.runUnitTests(commitHash);
            
            const suggestion = this.feedbackDb.suggestions[suggestionId];
            if (suggestion) {
                suggestion.build_result = buildResult;
                suggestion.test_result = testResult;
                
                // 성공 여부 판정
                const isSuccessful = buildResult.success && testResult.success;
                suggestion.status = isSuccessful ? 'verified' : 'failed';
                suggestion.success_metrics = {
                    build_success: buildResult.success,
                    test_success: testResult.success,
                    build_time: buildResult.time,
                    test_coverage: testResult.coverage,
                    error_count: (buildResult.errors || []).length + (testResult.failures || []).length
                };

                if (isSuccessful) {
                    this.feedbackDb.learning_metrics.successful_fixes++;
                    this.updateRuleEffectiveness(suggestion.rule_id, 'success');
                } else {
                    this.feedbackDb.learning_metrics.failed_fixes++;
                    this.updateRuleEffectiveness(suggestion.rule_id, 'failure');
                }

                // 성공률 재계산
                this.recalculateSuccessMetrics();
                this.saveFeedbackDatabase();

                console.log(`${isSuccessful ? '✅' : '❌'} 구현 검증: ${suggestionId} (${isSuccessful ? '성공' : '실패'})`);
            }
        } catch (error) {
            console.error(`구현 검증 오류 (${suggestionId}):`, error.message);
        }
    }

    /**
     * 빌드 테스트 실행
     */
    async runBuildTest(commitHash) {
        const startTime = Date.now();
        
        try {
            // Gradle 빌드 실행
            const buildOutput = execSync('./gradlew build -x test', { 
                encoding: 'utf8',
                timeout: 300000 // 5분 타임아웃
            });

            return {
                success: true,
                time: Date.now() - startTime,
                output: buildOutput.substring(0, 1000), // 처음 1000자만 저장
                errors: []
            };
        } catch (error) {
            return {
                success: false,
                time: Date.now() - startTime,
                output: error.stdout || '',
                errors: [error.message]
            };
        }
    }

    /**
     * 단위 테스트 실행
     */
    async runUnitTests(commitHash) {
        const startTime = Date.now();
        
        try {
            const testOutput = execSync('./gradlew test', { 
                encoding: 'utf8',
                timeout: 600000 // 10분 타임아웃
            });

            // 테스트 커버리지 추출 (간단한 파싱)
            const coverageMatch = testOutput.match(/(\d+)% line coverage/);
            const coverage = coverageMatch ? parseInt(coverageMatch[1]) : null;

            return {
                success: true,
                time: Date.now() - startTime,
                coverage: coverage,
                output: testOutput.substring(0, 1000),
                failures: []
            };
        } catch (error) {
            const failureMatch = error.stdout?.match(/(\d+) failed/) || [];
            const failureCount = failureMatch[1] ? parseInt(failureMatch[1]) : 0;

            return {
                success: false,
                time: Date.now() - startTime,
                coverage: null,
                output: error.stdout || '',
                failures: Array(failureCount).fill('test failure')
            };
        }
    }

    /**
     * 규칙 효과성 업데이트
     */
    updateRuleEffectiveness(ruleId, result) {
        if (!this.feedbackDb.rule_effectiveness[ruleId]) {
            this.feedbackDb.rule_effectiveness[ruleId] = {
                total_suggestions: 0,
                successful_implementations: 0,
                failed_implementations: 0,
                success_rate: 0.0,
                average_fix_time: 0,
                common_errors: []
            };
        }

        const rule = this.feedbackDb.rule_effectiveness[ruleId];
        rule.total_suggestions++;

        if (result === 'success') {
            rule.successful_implementations++;
        } else {
            rule.failed_implementations++;
        }

        rule.success_rate = rule.successful_implementations / rule.total_suggestions;
    }

    /**
     * 전체 성공 지표 재계산
     */
    recalculateSuccessMetrics() {
        const metrics = this.feedbackDb.learning_metrics;
        
        if (metrics.accepted_suggestions > 0) {
            metrics.success_rate = metrics.successful_fixes / metrics.accepted_suggestions;
        }

        // 개선율 계산 (최근 30일 vs 이전 30일 비교)
        const recentSuggestions = this.getRecentSuggestions(30);
        const previousSuggestions = this.getPreviousSuggestions(30, 60);
        
        if (previousSuggestions.length > 0) {
            const recentSuccessRate = recentSuggestions.filter(s => s.status === 'verified').length / recentSuggestions.length;
            const previousSuccessRate = previousSuggestions.filter(s => s.status === 'verified').length / previousSuggestions.length;
            
            metrics.improvement_rate = recentSuccessRate - previousSuccessRate;
        }
    }

    /**
     * 학습 기반 새로운 규칙 생성
     */
    generateNewRules() {
        console.log('🧠 성공 패턴 분석 및 새 규칙 생성...');

        // 성공률이 높은 패턴 분석
        const successfulPatterns = this.analyzeSuccessfulPatterns();
        const newRules = [];

        for (const pattern of successfulPatterns) {
            if (pattern.confidence > 0.8 && pattern.frequency > 5) {
                const newRule = this.createRuleFromPattern(pattern);
                newRules.push(newRule);
            }
        }

        this.feedbackDb.auto_generated_rules.push(...newRules);
        this.saveFeedbackDatabase();

        console.log(`✨ ${newRules.length}개의 새로운 규칙 생성 완료`);
        return newRules;
    }

    /**
     * 성공 패턴 분석
     */
    analyzeSuccessfulPatterns() {
        const patterns = [];
        const successfulSuggestions = Object.values(this.feedbackDb.suggestions)
            .filter(s => s.status === 'verified');

        // 파일 타입별 성공 패턴
        const fileTypePatterns = {};
        successfulSuggestions.forEach(suggestion => {
            const fileExt = path.extname(suggestion.file_path);
            if (!fileTypePatterns[fileExt]) {
                fileTypePatterns[fileExt] = { count: 0, rules: {} };
            }
            fileTypePatterns[fileExt].count++;
            fileTypePatterns[fileExt].rules[suggestion.rule_id] = 
                (fileTypePatterns[fileExt].rules[suggestion.rule_id] || 0) + 1;
        });

        // 높은 성공률을 보이는 패턴 추출
        Object.entries(fileTypePatterns).forEach(([fileType, data]) => {
            Object.entries(data.rules).forEach(([ruleId, count]) => {
                const confidence = count / data.count;
                if (confidence > 0.7) {
                    patterns.push({
                        type: 'file_type_rule',
                        file_type: fileType,
                        rule_id: ruleId,
                        frequency: count,
                        confidence: confidence
                    });
                }
            });
        });

        return patterns;
    }

    /**
     * 패턴으로부터 새로운 규칙 생성
     */
    createRuleFromPattern(pattern) {
        return {
            id: `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            generated_from: pattern,
            category: 'auto_generated',
            severity: 'medium',
            title: `자동 생성 규칙: ${pattern.file_type} 파일에서 ${pattern.rule_id} 패턴`,
            description: `성공률 ${(pattern.confidence * 100).toFixed(1)}%의 검증된 패턴을 기반으로 자동 생성된 규칙`,
            pattern_to_detect: {
                file_patterns: [`**/*${pattern.file_type}`],
                code_patterns: [], // 실제 구현에서는 더 정교한 패턴 생성
                confidence_threshold: pattern.confidence
            },
            created_date: new Date().toISOString(),
            effectiveness_score: pattern.confidence
        };
    }

    /**
     * 최근 제안들 조회
     */
    getRecentSuggestions(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return Object.values(this.feedbackDb.suggestions)
            .filter(s => new Date(s.timestamp) > cutoffDate);
    }

    /**
     * 이전 기간 제안들 조회
     */
    getPreviousSuggestions(fromDays, toDays) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - toDays);
        
        const toDate = new Date();
        toDate.setDate(toDate.getDate() - fromDays);
        
        return Object.values(this.feedbackDb.suggestions)
            .filter(s => {
                const suggestionDate = new Date(s.timestamp);
                return suggestionDate > fromDate && suggestionDate <= toDate;
            });
    }

    /**
     * 제안 ID 생성
     */
    generateSuggestionId(suggestionData) {
        const hash = crypto.createHash('md5')
            .update(`${suggestionData.ruleId}-${suggestionData.filePath}-${Date.now()}`)
            .digest('hex');
        return `${suggestionData.ruleId}_${hash.substring(0, 8)}`;
    }

    /**
     * 대체 ID로 제안 찾기
     */
    findSuggestionByAltId(altId) {
        for (const [id, suggestion] of Object.entries(this.feedbackDb.suggestions)) {
            if (id.includes(altId) || suggestion.rule_id === altId) {
                return id;
            }
        }
        return null;
    }

    /**
     * 피드백 데이터베이스 저장
     */
    saveFeedbackDatabase() {
        this.feedbackDb.last_updated = new Date().toISOString();
        fs.writeFileSync(this.feedbackDbPath, JSON.stringify(this.feedbackDb, null, 2));
    }

    /**
     * 학습 성과 리포트 생성
     */
    generateLearningReport() {
        const metrics = this.feedbackDb.learning_metrics;
        const report = {
            timestamp: new Date().toISOString(),
            overview: {
                total_suggestions: metrics.total_suggestions,
                acceptance_rate: (metrics.accepted_suggestions / metrics.total_suggestions * 100).toFixed(1) + '%',
                success_rate: (metrics.success_rate * 100).toFixed(1) + '%',
                improvement_rate: (metrics.improvement_rate * 100).toFixed(1) + '%'
            },
            top_performing_rules: this.getTopPerformingRules(),
            least_effective_rules: this.getLeastEffectiveRules(),
            generated_rules_count: this.feedbackDb.auto_generated_rules.length,
            recommendations: this.generateSystemRecommendations()
        };

        const reportPath = path.join(__dirname, '../reports/learning-report.json');
        this.ensureDirectoryExists(path.dirname(reportPath));
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n' + '='.repeat(60));
        console.log('🧠 AI 학습 성과 리포트');
        console.log('='.repeat(60));
        console.log(`📊 전체 제안: ${report.overview.total_suggestions}개`);
        console.log(`✅ 수용률: ${report.overview.acceptance_rate}`);
        console.log(`🎯 성공률: ${report.overview.success_rate}`);
        console.log(`📈 개선률: ${report.overview.improvement_rate}`);
        console.log(`🤖 자동 생성 규칙: ${report.generated_rules_count}개`);
        console.log('\n📄 상세 리포트: claude-guides/reports/learning-report.json');
        console.log('='.repeat(60) + '\n');

        return report;
    }

    /**
     * 상위 성과 규칙들
     */
    getTopPerformingRules() {
        return Object.entries(this.feedbackDb.rule_effectiveness)
            .filter(([_, rule]) => rule.total_suggestions >= 3)
            .sort((a, b) => b[1].success_rate - a[1].success_rate)
            .slice(0, 5)
            .map(([id, rule]) => ({
                rule_id: id,
                success_rate: (rule.success_rate * 100).toFixed(1) + '%',
                total_suggestions: rule.total_suggestions
            }));
    }

    /**
     * 최저 효과 규칙들
     */
    getLeastEffectiveRules() {
        return Object.entries(this.feedbackDb.rule_effectiveness)
            .filter(([_, rule]) => rule.total_suggestions >= 3)
            .sort((a, b) => a[1].success_rate - b[1].success_rate)
            .slice(0, 3)
            .map(([id, rule]) => ({
                rule_id: id,
                success_rate: (rule.success_rate * 100).toFixed(1) + '%',
                total_suggestions: rule.total_suggestions,
                needs_improvement: true
            }));
    }

    /**
     * 시스템 개선 권장사항 생성
     */
    generateSystemRecommendations() {
        const recommendations = [];
        const metrics = this.feedbackDb.learning_metrics;

        if (metrics.success_rate < 0.7) {
            recommendations.push({
                type: 'improvement',
                priority: 'high',
                description: '전체 성공률이 70% 미만입니다. 규칙의 정확도를 개선하거나 더 나은 패턴 매칭이 필요합니다.'
            });
        }

        if (metrics.improvement_rate < 0) {
            recommendations.push({
                type: 'regression',
                priority: 'medium',
                description: '최근 성능이 하락하고 있습니다. 새로운 코드 패턴이나 프로젝트 변화를 분석해보세요.'
            });
        }

        return recommendations;
    }

    /**
     * 디렉토리 생성 보장
     */
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

// CLI 실행
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'process-commits';

    const feedbackSystem = new AutomatedFeedbackSystem();

    switch (command) {
        case 'process-commits':
            feedbackSystem.processGitCommits()
                .then(() => {
                    console.log('✅ Git 커밋 처리 완료');
                })
                .catch(error => {
                    console.error('❌ 커밋 처리 오류:', error);
                });
            break;

        case 'generate-rules':
            feedbackSystem.generateNewRules();
            break;

        case 'report':
            feedbackSystem.generateLearningReport();
            break;

        default:
            console.log('사용법: node automated-feedback-system.js [process-commits|generate-rules|report]');
    }
}

module.exports = AutomatedFeedbackSystem;