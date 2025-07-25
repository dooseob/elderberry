#!/usr/bin/env node

/**
 * AI 예측 및 위험 분석 서비스
 * 과거 경험 데이터를 기반으로 향후 발생 가능한 문제를 예측하고
 * 위험도를 분석하여 사전 예방 조치를 제안하는 지능형 시스템
 * Context7 지침에 따른 예측적 개발 지원
 */

const SolutionsDbLearningService = require('./SolutionsDbLearningService');

class PredictiveAnalysisService {
    constructor() {
        this.version = "1.0.0";
        this.solutionsLearning = new SolutionsDbLearningService();
        this.riskThresholds = {
            critical: 90,
            high: 70,
            medium: 50,
            low: 30
        };
        this.predictionHistory = new Map(); // 예측 정확도 추적
        
        console.log('🔮 AI 예측 및 위험 분석 서비스 초기화 완료');
    }

    /**
     * 종합 위험 분석 및 예측 실행
     */
    async performComprehensiveAnalysis(workType, userMessage, projectContext = {}) {
        try {
            console.log(`🔍 종합 위험 분석 시작: ${workType}`);
            
            // 1. 기존 경험 데이터 로드
            const knowledge = await this.solutionsLearning.loadSolutionsDatabase();
            
            // 2. 패턴 기반 위험 예측
            const riskPredictions = await this.predictRisks(knowledge, workType, userMessage);
            
            // 3. 시간 기반 트렌드 분석
            const trendAnalysis = this.analyzeTrends(knowledge, workType);
            
            // 4. 복합 위험도 계산
            const riskScore = this.calculateCompositeRiskScore(riskPredictions, trendAnalysis);
            
            // 5. 예방 조치 우선순위 결정
            const preventiveActions = this.prioritizePreventiveActions(riskPredictions, riskScore);
            
            // 6. 미래 이슈 예측
            const futureIssues = this.predictFutureIssues(knowledge, workType, userMessage);
            
            // 7. 종합 분석 결과 생성
            const analysis = {
                timestamp: new Date().toISOString(),
                workType: workType,
                userMessage: userMessage,
                overallRiskScore: riskScore,
                riskLevel: this.getRiskLevel(riskScore),
                predictions: riskPredictions,
                trendAnalysis: trendAnalysis,
                preventiveActions: preventiveActions,
                futureIssues: futureIssues,
                recommendations: this.generateRecommendations(riskScore, riskPredictions),
                confidence: this.calculateConfidence(knowledge, workType),
                metadata: {
                    version: this.version,
                    analysisId: this.generateAnalysisId(),
                    basedOnExperience: knowledge.totalIssues > 0,
                    dataQuality: this.assessDataQuality(knowledge)
                }
            };
            
            // 8. 예측 기록 저장 (정확도 추적용)
            this.recordPrediction(analysis);
            
            console.log(`✅ 종합 위험 분석 완료 - 위험도: ${riskScore}점 (${analysis.riskLevel})`);
            return analysis;
            
        } catch (error) {
            console.error('❌ 위험 분석 실패:', error.message);
            return this.generateFallbackAnalysis(workType, userMessage);
        }
    }

    /**
     * 패턴 기반 위험 예측
     */
    async predictRisks(knowledge, workType, userMessage) {
        const predictions = [];
        
        // 에러 패턴 분석
        const errorPredictions = this.predictErrorRisks(knowledge.errorPatterns, workType, userMessage);
        predictions.push(...errorPredictions);
        
        // 성능 이슈 예측
        const performancePredictions = this.predictPerformanceRisks(knowledge.performanceIssues, workType);
        predictions.push(...performancePredictions);
        
        // 보안 위험 예측
        const securityPredictions = this.predictSecurityRisks(knowledge.securityIncidents, workType);
        predictions.push(...securityPredictions);
        
        // 예측 정확도로 정렬
        return predictions.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * 에러 위험 예측
     */
    predictErrorRisks(errorPatterns, workType, userMessage) {
        const predictions = [];
        const messageWords = userMessage.toLowerCase().split(/\s+/);
        
        errorPatterns.forEach((pattern, errorType) => {
            // 메시지 관련성 계산
            const relevance = this.calculateMessageRelevance(errorType, messageWords);
            
            // 발생 빈도 기반 위험도
            const frequencyRisk = Math.min((pattern.count / 10) * 100, 100);
            
            // 심각도 기반 가중치
            const severityWeight = {
                'CRITICAL': 1.0,
                'HIGH': 0.8,
                'MEDIUM': 0.6,
                'LOW': 0.4
            }[pattern.severity] || 0.5;
            
            // 작업 유형별 가중치
            const workTypeWeight = this.getWorkTypeWeight(errorType, workType);
            
            // 최종 위험도 계산
            const riskScore = (frequencyRisk * severityWeight * workTypeWeight * relevance) * 100;
            
            if (riskScore > 30) { // 임계값 이상만 포함
                predictions.push({
                    type: 'error',
                    category: errorType,
                    riskScore: Math.round(riskScore),
                    likelihood: this.calculateLikelihood(pattern.count, pattern.severity),
                    impact: this.calculateImpact(pattern.severity, pattern.locations.size),
                    confidence: Math.round(relevance * 100),
                    description: `"${errorType}" 에러 발생 위험`,
                    details: {
                        historicalCount: pattern.count,
                        severity: pattern.severity,
                        commonCauses: Array.from(pattern.commonCauses).slice(0, 3),
                        affectedLocations: Array.from(pattern.locations).slice(0, 3)
                    },
                    preventiveHints: this.generateErrorPreventiveHints(errorType, pattern)
                });
            }
        });
        
        return predictions;
    }

    /**
     * 성능 위험 예측
     */
    predictPerformanceRisks(performanceIssues, workType) {
        const predictions = [];
        
        performanceIssues.forEach((issue, location) => {
            // 평균 시간 기반 위험도
            const timeRisk = Math.min((issue.averageTime / 5000) * 100, 100); // 5초 기준
            
            // 발생 빈도 기반 위험도
            const frequencyRisk = Math.min((issue.count / 5) * 100, 100);
            
            // 작업 유형별 관련성
            const workTypeRelevance = location.toLowerCase().includes(workType.toLowerCase()) ? 1.0 : 0.7;
            
            const riskScore = (timeRisk + frequencyRisk) / 2 * workTypeRelevance;
            
            if (riskScore > 25) {
                predictions.push({
                    type: 'performance',
                    category: location,
                    riskScore: Math.round(riskScore),
                    likelihood: issue.count > 3 ? 'high' : 'medium',
                    impact: issue.averageTime > 3000 ? 'high' : 'medium',
                    confidence: Math.round(workTypeRelevance * 80),
                    description: `"${location}" 성능 저하 위험`,
                    details: {
                        averageTime: Math.round(issue.averageTime),
                        maxTime: issue.maxTime,
                        occurrenceCount: issue.count,
                        knownOptimizations: Array.from(issue.optimizations).slice(0, 3)
                    },
                    preventiveHints: this.generatePerformancePreventiveHints(location, issue)
                });
            }
        });
        
        return predictions;
    }

    /**
     * 보안 위험 예측
     */
    predictSecurityRisks(securityIncidents, workType) {
        const predictions = [];
        
        securityIncidents.forEach((incident, securityType) => {
            // 보안 인시던트는 항상 높은 위험도
            const baseRisk = 75;
            const frequencyMultiplier = Math.min(incident.count / 2, 2.0);
            const riskScore = baseRisk * frequencyMultiplier;
            
            predictions.push({
                type: 'security',
                category: securityType,
                riskScore: Math.round(Math.min(riskScore, 100)),
                likelihood: incident.count > 2 ? 'high' : 'medium',
                impact: 'high', // 보안은 항상 높은 영향도
                confidence: 90, // 보안 위험 예측은 높은 신뢰도
                description: `${securityType} 보안 위험`,
                details: {
                    incidentCount: incident.count,
                    severity: incident.severity,
                    knownCountermeasures: Array.from(incident.countermeasures).slice(0, 3)
                },
                preventiveHints: this.generateSecurityPreventiveHints(securityType, incident)
            });
        });
        
        return predictions;
    }

    /**
     * 시간 기반 트렌드 분석
     */
    analyzeTrends(knowledge, workType) {
        return {
            errorTrend: this.analyzeErrorTrend(knowledge.errorPatterns),
            performanceTrend: this.analyzePerformanceTrend(knowledge.performanceIssues),
            overallTrend: this.calculateOverallTrend(knowledge),
            seasonality: this.detectSeasonality(knowledge),
            predictions: {
                nextWeek: this.predictNextWeekTrend(knowledge),
                nextMonth: this.predictNextMonthTrend(knowledge)
            }
        };
    }

    /**
     * 복합 위험도 계산
     */
    calculateCompositeRiskScore(predictions, trendAnalysis) {
        if (predictions.length === 0) return 0;
        
        // 가중 평균 계산
        const weightedSum = predictions.reduce((sum, pred) => {
            const weight = {
                'security': 1.0,
                'error': 0.8,
                'performance': 0.6
            }[pred.type] || 0.5;
            
            return sum + (pred.riskScore * weight);
        }, 0);
        
        const totalWeight = predictions.reduce((sum, pred) => {
            const weight = {
                'security': 1.0,
                'error': 0.8,
                'performance': 0.6
            }[pred.type] || 0.5;
            return sum + weight;
        }, 0);
        
        const baseScore = weightedSum / totalWeight;
        
        // 트렌드 기반 조정
        const trendMultiplier = trendAnalysis.overallTrend === 'increasing' ? 1.2 : 
                              trendAnalysis.overallTrend === 'decreasing' ? 0.8 : 1.0;
        
        return Math.round(Math.min(baseScore * trendMultiplier, 100));
    }

    /**
     * 예방 조치 우선순위 결정
     */
    prioritizePreventiveActions(predictions, overallRiskScore) {
        const actions = [];
        
        // 위험도 높은 예측 기반 조치
        predictions
            .filter(pred => pred.riskScore > 50)
            .sort((a, b) => b.riskScore - a.riskScore)
            .forEach(pred => {
                pred.preventiveHints.forEach(hint => {
                    actions.push({
                        priority: this.getPriorityFromRisk(pred.riskScore),
                        action: hint,
                        targetRisk: pred.category,
                        expectedReduction: this.calculateExpectedReduction(pred.riskScore),
                        estimatedTime: this.estimateActionTime(hint),
                        confidence: pred.confidence
                    });
                });
            });
        
        // 전체 위험도 기반 일반적 조치
        if (overallRiskScore > 70) {
            actions.unshift({
                priority: 'critical',
                action: '전체 시스템 보안 점검 및 백업 실시',
                targetRisk: 'system_wide',
                expectedReduction: 30,
                estimatedTime: '2시간',
                confidence: 95
            });
        }
        
        return actions.slice(0, 10); // 최대 10개 조치
    }

    /**
     * 미래 이슈 예측
     */
    predictFutureIssues(knowledge, workType, userMessage) {
        const futureIssues = [];
        
        // 패턴 기반 미래 이슈 예측
        knowledge.errorPatterns.forEach((pattern, errorType) => {
            if (pattern.count >= 3) { // 3회 이상 발생한 패턴
                const nextOccurrenceProbability = this.calculateNextOccurrenceProbability(pattern);
                
                if (nextOccurrenceProbability > 0.3) {
                    futureIssues.push({
                        type: 'error',
                        issue: errorType,
                        probability: Math.round(nextOccurrenceProbability * 100),
                        estimatedTimeframe: this.estimateTimeframe(pattern),
                        severity: pattern.severity,
                        mitigation: Array.from(pattern.solutions).slice(0, 2)
                    });
                }
            }
        });
        
        // 성능 저하 예측
        knowledge.performanceIssues.forEach((issue, location) => {
            if (issue.count >= 2 && issue.averageTime > 2000) {
                futureIssues.push({
                    type: 'performance',
                    issue: `${location} 성능 저하`,
                    probability: Math.min((issue.count / 5) * 100, 90),
                    estimatedTimeframe: '1-2주',
                    severity: 'MEDIUM',
                    mitigation: Array.from(issue.optimizations).slice(0, 2)
                });
            }
        });
        
        return futureIssues.sort((a, b) => b.probability - a.probability);
    }

    /**
     * 추천사항 생성
     */
    generateRecommendations(riskScore, predictions) {
        const recommendations = [];
        
        if (riskScore > 80) {
            recommendations.push({
                type: 'critical',
                title: '즉시 조치 필요',
                description: '높은 위험도가 감지되었습니다. 즉시 예방 조치를 실시하세요.',
                actions: ['백업 실시', '모니터링 강화', '팀 알림']
            });
        } else if (riskScore > 60) {
            recommendations.push({
                type: 'important',
                title: '주의 깊은 모니터링 필요',
                description: '중간 수준의 위험이 감지되었습니다. 예방적 조치를 고려하세요.',
                actions: ['정기 점검', '로그 모니터링']
            });
        }
        
        // 예측별 구체적 추천사항
        predictions.slice(0, 3).forEach(pred => {
            recommendations.push({
                type: 'specific',
                title: `${pred.category} 관련 조치`,
                description: pred.description,
                actions: pred.preventiveHints
            });
        });
        
        return recommendations;
    }

    /**
     * 헬퍼 메서드들
     */
    calculateMessageRelevance(pattern, messageWords) {
        let relevance = 0;
        const patternWords = pattern.toLowerCase().split(/[._\s]+/);
        
        messageWords.forEach(word => {
            if (word.length > 2) {
                patternWords.forEach(pWord => {
                    if (pWord.includes(word) || word.includes(pWord)) {
                        relevance += 0.2;
                    }
                });
            }
        });
        
        return Math.min(relevance, 1.0);
    }

    getWorkTypeWeight(errorType, workType) {
        const weights = {
            'spring_boot_error': {
                'NullPointerException': 0.9,
                'ValidationException': 0.8,
                'DataIntegrityViolationException': 0.7
            },
            'api_development': {
                'TimeoutException': 0.9,
                'SecurityException': 0.8,
                'ValidationException': 0.7
            }
        };
        
        return weights[workType]?.[errorType] || 0.6;
    }

    calculateLikelihood(count, severity) {
        if (count >= 5 || severity === 'CRITICAL') return 'high';
        if (count >= 3 || severity === 'HIGH') return 'medium';
        return 'low';
    }

    calculateImpact(severity, locationCount) {
        if (severity === 'CRITICAL' || locationCount > 3) return 'high';
        if (severity === 'HIGH' || locationCount > 1) return 'medium';
        return 'low';
    }

    getRiskLevel(score) {
        if (score >= 90) return 'CRITICAL';
        if (score >= 70) return 'HIGH';
        if (score >= 50) return 'MEDIUM';
        return 'LOW';
    }

    calculateConfidence(knowledge, workType) {
        if (knowledge.totalIssues === 0) return 20;
        if (knowledge.totalIssues < 5) return 60;
        if (knowledge.totalIssues < 15) return 80;
        return 95;
    }

    generateAnalysisId() {
        return 'PRED-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
    }

    assessDataQuality(knowledge) {
        const resolvedRate = knowledge.totalIssues > 0 ? knowledge.resolvedIssues / knowledge.totalIssues : 0;
        if (resolvedRate > 0.8) return 'excellent';
        if (resolvedRate > 0.6) return 'good';
        if (resolvedRate > 0.4) return 'fair';
        return 'poor';
    }

    // 예방 힌트 생성 메서드들
    generateErrorPreventiveHints(errorType, pattern) {
        const hints = {
            'NullPointerException': [
                'null 체크 로직 강화',
                'Optional 클래스 활용',
                '@NonNull 어노테이션 사용'
            ],
            'ValidationException': [
                '@Valid 어노테이션 확인',
                '입력값 범위 검증 추가',
                'DTO 유효성 규칙 강화'
            ]
        };
        
        return hints[errorType] || ['단위 테스트 추가', '코드 리뷰 실시'];
    }

    generatePerformancePreventiveHints(location, issue) {
        return [
            `${location} 캐싱 메커니즘 도입`,
            '데이터베이스 쿼리 최적화',
            '비동기 처리 고려'
        ];
    }

    generateSecurityPreventiveHints(securityType, incident) {
        return [
            '보안 패치 업데이트',
            '접근 권한 재검토',
            '보안 감사 실시'
        ];
    }

    // 트렌드 분석 메서드들 (기본 구현)
    analyzeErrorTrend(errorPatterns) {
        return errorPatterns.size > 5 ? 'increasing' : 'stable';
    }

    analyzePerformanceTrend(performanceIssues) {
        return performanceIssues.size > 3 ? 'degrading' : 'stable';
    }

    calculateOverallTrend(knowledge) {
        return knowledge.totalIssues > 10 ? 'increasing' : 'stable';
    }

    detectSeasonality(knowledge) {
        return 'no_pattern'; // 기본 구현
    }

    predictNextWeekTrend(knowledge) {
        return knowledge.totalIssues > 5 ? '2-3개 이슈 예상' : '1개 이하 이슈 예상';
    }

    predictNextMonthTrend(knowledge) {
        return knowledge.totalIssues > 10 ? '10-15개 이슈 예상' : '5개 이하 이슈 예상';
    }

    // 기타 헬퍼 메서드들
    getPriorityFromRisk(riskScore) {
        if (riskScore >= 80) return 'critical';
        if (riskScore >= 60) return 'high';
        if (riskScore >= 40) return 'medium';
        return 'low';
    }

    calculateExpectedReduction(riskScore) {
        return Math.round(riskScore * 0.6); // 60% 감소 예상
    }

    estimateActionTime(action) {
        if (action.includes('테스트')) return '30분';
        if (action.includes('검토') || action.includes('점검')) return '15분';
        if (action.includes('설정') || action.includes('추가')) return '20분';
        return '10분';
    }

    calculateNextOccurrenceProbability(pattern) {
        return Math.min(pattern.count / 10, 0.9);
    }

    estimateTimeframe(pattern) {
        if (pattern.count >= 5) return '1주 이내';
        if (pattern.count >= 3) return '2-3주';
        return '1개월 이내';
    }

    recordPrediction(analysis) {
        this.predictionHistory.set(analysis.metadata.analysisId, {
            timestamp: analysis.timestamp,
            predictions: analysis.predictions.length,
            riskScore: analysis.overallRiskScore,
            confidence: analysis.confidence
        });
    }

    generateFallbackAnalysis(workType, userMessage) {
        return {
            timestamp: new Date().toISOString(),
            workType: workType,
            userMessage: userMessage,
            overallRiskScore: 50,
            riskLevel: 'MEDIUM',
            predictions: [],
            trendAnalysis: { overallTrend: 'unknown' },
            preventiveActions: [{
                priority: 'medium',
                action: '기본적인 코드 리뷰 및 테스트 실시',
                targetRisk: 'general',
                expectedReduction: 20,
                estimatedTime: '30분',
                confidence: 50
            }],
            futureIssues: [],
            recommendations: [{
                type: 'general',
                title: '기본 예방 조치',
                description: '경험 데이터 부족으로 일반적인 예방 조치를 권장합니다.',
                actions: ['코드 리뷰', '단위 테스트', '문서화']
            }],
            confidence: 30,
            metadata: {
                version: this.version,
                analysisId: this.generateAnalysisId(),
                basedOnExperience: false,
                dataQuality: 'insufficient'
            }
        };
    }

    /**
     * 서비스 상태 조회
     */
    getStatus() {
        return {
            version: this.version,
            riskThresholds: this.riskThresholds,
            predictionHistorySize: this.predictionHistory.size,
            solutionsLearningStatus: this.solutionsLearning.getStatus()
        };
    }
}

module.exports = PredictiveAnalysisService;