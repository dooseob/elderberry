/**
 * 실시간 학습 시스템
 * 사용자 요청사항을 즉시 가이드라인에 반영하고 에이전트 시스템을 진화시킴
 */
const fs = require('fs').promises;
const path = require('path');

class RealTimeLearningSystem {
    constructor() {
        this.claudeGuideFile = '/mnt/c/Users/human-10/elderberry/CLAUDE.md';
        this.learningHistory = [];
        this.adaptationMetrics = {
            totalAdaptations: 0,
            successfulUpdates: 0,
            learningAccuracy: 0.85,
            userSatisfactionScore: 0.78
        };
        this.learningPatterns = new Map();
        this.prohibitedPatterns = new Set([
            '테스트 디렉토리 재생성',
            '임시방편 솔루션',
            'data.sql 재사용',
            '하드코딩 해결책'
        ]);
    }

    /**
     * 사용자 피드백을 즉시 가이드라인에 반영
     * @param {string} userFeedback - 사용자 피드백
     * @param {string} context - 피드백 컨텍스트
     * @param {string} category - 피드백 카테고리
     * @returns {Promise<Object>} 반영 결과
     */
    async adaptToUserFeedback(userFeedback, context = '', category = 'GENERAL') {
        console.log(`🧠 실시간 학습: 사용자 피드백 분석 중...`);
        
        try {
            // 1. 피드백 분석 및 분류
            const analysis = await this.analyzeFeedback(userFeedback, context, category);
            
            // 2. 금지사항 패턴 체크
            if (this.isProhibitedPattern(userFeedback)) {
                console.log(`⚠️ 금지된 패턴 감지: ${userFeedback}`);
                return this.handleProhibitedFeedback(userFeedback, analysis);
            }
            
            // 3. 가이드라인 업데이트
            const updateResult = await this.updateGuidelines(analysis);
            
            // 4. 학습 이력 기록
            await this.recordLearningHistory(userFeedback, context, analysis, updateResult);
            
            // 5. 메트릭스 업데이트
            this.updateAdaptationMetrics(updateResult.success);
            
            console.log(`✅ 실시간 학습 완료: ${analysis.improvementType}`);
            
            return {
                success: updateResult.success,
                adaptationType: analysis.improvementType,
                guidelineChanges: updateResult.changes,
                learningImpact: this.calculateLearningImpact(analysis),
                updatedSections: updateResult.updatedSections
            };
            
        } catch (error) {
            console.error('❌ 실시간 학습 오류:', error);
            return {
                success: false,
                error: error.message,
                fallbackAction: '수동 가이드라인 검토 필요'
            };
        }
    }

    /**
     * 피드백 분석 및 분류
     * @param {string} feedback - 사용자 피드백
     * @param {string} context - 컨텍스트
     * @param {string} category - 카테고리
     * @returns {Promise<Object>} 분석 결과
     */
    async analyzeFeedback(feedback, context, category) {
        const analysis = {
            originalFeedback: feedback,
            context,
            category,
            improvementType: this.classifyImprovementType(feedback),
            urgencyLevel: this.assessUrgencyLevel(feedback),
            targetSection: this.identifyTargetSection(feedback),
            suggestedChanges: [],
            confidence: 0.8
        };

        // 개선 사항 식별
        analysis.suggestedChanges = await this.identifyImprovements(feedback, context);
        
        // 신뢰도 조정
        analysis.confidence = this.calculateConfidence(analysis);
        
        return analysis;
    }

    /**
     * 개선 유형 분류
     * @param {string} feedback - 피드백
     * @returns {string} 개선 유형
     */
    classifyImprovementType(feedback) {
        const patterns = {
            'PROHIBITION': ['하지마', '금지', '안돼', '비활성', '제거', '삭제'],
            'ENHANCEMENT': ['개선', '더 좋게', '최적화', '향상', '강화'],
            'NEW_FEATURE': ['추가', '새로운', '기능', '구현', '만들어'],
            'BUG_FIX': ['버그', '오류', '문제', '고쳐', '수정'],
            'PROCESS': ['순서', '방식', '프로세스', '절차', '방법'],
            'GUIDELINE': ['지침', '가이드', '규칙', '원칙', '정책']
        };

        for (const [type, keywords] of Object.entries(patterns)) {
            if (keywords.some(keyword => feedback.includes(keyword))) {
                return type;
            }
        }

        return 'GENERAL';
    }

    /**
     * 긴급도 평가
     * @param {string} feedback - 피드백
     * @returns {string} 긴급도
     */
    assessUrgencyLevel(feedback) {
        const urgentKeywords = ['즉시', '빨리', '급하게', '당장', '바로'];
        const highKeywords = ['중요', '심각', '문제', '오류'];
        
        if (urgentKeywords.some(keyword => feedback.includes(keyword))) {
            return 'URGENT';
        } else if (highKeywords.some(keyword => feedback.includes(keyword))) {
            return 'HIGH';
        }
        
        return 'MEDIUM';
    }

    /**
     * 대상 섹션 식별
     * @param {string} feedback - 피드백
     * @returns {string} 대상 섹션
     */
    identifyTargetSection(feedback) {
        const sectionMap = {
            '금지': 'prohibition',
            '원칙': 'principles',
            '에이전트': 'agent-system',
            '테스트': 'testing',
            '빌드': 'build',
            '서버': 'server',
            '데이터베이스': 'database',
            '프론트엔드': 'frontend',
            '백엔드': 'backend'
        };

        for (const [keyword, section] of Object.entries(sectionMap)) {
            if (feedback.includes(keyword)) {
                return section;
            }
        }

        return 'general';
    }

    /**
     * 개선사항 식별
     * @param {string} feedback - 피드백
     * @param {string} context - 컨텍스트
     * @returns {Promise<Array>} 개선사항 목록
     */
    async identifyImprovements(feedback, context) {
        const improvements = [];

        // 금지사항 추가
        if (feedback.includes('하지마') || feedback.includes('금지')) {
            improvements.push({
                type: 'ADD_PROHIBITION',
                content: this.extractProhibitionRule(feedback),
                section: '금지 사항',
                priority: 'high'
            });
        }

        // 새로운 원칙 추가
        if (feedback.includes('원칙') || feedback.includes('지침')) {
            improvements.push({
                type: 'ADD_PRINCIPLE',
                content: this.extractPrincipleRule(feedback),
                section: '필수 원칙',
                priority: 'high'
            });
        }

        // 프로세스 개선
        if (feedback.includes('순서') || feedback.includes('방식')) {
            improvements.push({
                type: 'UPDATE_PROCESS',
                content: this.extractProcessImprovement(feedback),
                section: '개발 프로세스',
                priority: 'medium'
            });
        }

        return improvements;
    }

    /**
     * 금지 규칙 추출
     * @param {string} feedback - 피드백
     * @returns {string} 금지 규칙
     */
    extractProhibitionRule(feedback) {
        // 사용자 피드백에서 금지할 행동 추출
        const prohibitions = {
            '테스트 디렉토리': '테스트 디렉토리 재생성',
            '간단하게': '코드 단순화 및 임시 해결책',
            '비활성': '기능 임의 비활성화',
            '삭제': '사용자 동의 없는 파일 삭제'
        };

        for (const [keyword, rule] of Object.entries(prohibitions)) {
            if (feedback.includes(keyword)) {
                return `❌ **${rule}** (${new Date().toLocaleDateString()} 사용자 요청으로 추가)`;
            }
        }

        return `❌ **${feedback}에서 추출된 금지사항** (${new Date().toLocaleDateString()})`;
    }

    /**
     * 원칙 규칙 추출
     * @param {string} feedback - 피드백
     * @returns {string} 원칙 규칙
     */
    extractPrincipleRule(feedback) {
        const principles = {
            '복잡하게': '코드 복잡성 유지 및 기능 완전성 보장',
            '확인하고': '전체 시스템 영향도 사전 확인',
            '원래대로': '기존 아키텍처 및 설계 원칙 준수'
        };

        for (const [keyword, rule] of Object.entries(principles)) {
            if (feedback.includes(keyword)) {
                return `✅ **${rule}** (${new Date().toLocaleDateString()} 사용자 요청으로 강화)`;
            }
        }

        return `✅ **${feedback}에서 추출된 원칙** (${new Date().toLocaleDateString()})`;
    }

    /**
     * 프로세스 개선사항 추출
     * @param {string} feedback - 피드백
     * @returns {string} 프로세스 개선사항
     */
    extractProcessImprovement(feedback) {
        return `🔄 **프로세스 개선**: ${feedback} (${new Date().toLocaleDateString()} 반영)`;
    }

    /**
     * 금지 패턴 확인
     * @param {string} feedback - 피드백
     * @returns {boolean} 금지 패턴 여부
     */
    isProhibitedPattern(feedback) {
        return Array.from(this.prohibitedPatterns).some(pattern => 
            feedback.includes(pattern)
        );
    }

    /**
     * 금지된 피드백 처리
     * @param {string} feedback - 피드백
     * @param {Object} analysis - 분석 결과
     * @returns {Object} 처리 결과
     */
    handleProhibitedFeedback(feedback, analysis) {
        console.log(`🚫 금지된 패턴으로 인한 피드백 거부: ${feedback}`);
        
        return {
            success: false,
            reason: 'PROHIBITED_PATTERN',
            message: '이미 금지된 패턴이거나 시스템 안정성에 위험한 요청입니다.',
            alternativeSuggestion: this.suggestAlternative(feedback),
            analysis
        };
    }

    /**
     * 대안 제안
     * @param {string} feedback - 피드백
     * @returns {string} 대안 제안
     */
    suggestAlternative(feedback) {
        const alternatives = {
            '테스트': '대신 기존 DataLoader를 통한 테스트 데이터 관리를 권장합니다.',
            '간단하게': '코드 품질과 기능 완전성을 유지하면서 개선하는 방향을 고려해보세요.',
            '비활성': '기능을 완전히 제거하기보다는 설정을 통한 선택적 활성화를 권장합니다.'
        };

        for (const [keyword, alternative] of Object.entries(alternatives)) {
            if (feedback.includes(keyword)) {
                return alternative;
            }
        }

        return '현재 시스템 아키텍처를 유지하면서 개선할 수 있는 방안을 검토해보세요.';
    }

    /**
     * 가이드라인 업데이트
     * @param {Object} analysis - 분석 결과
     * @returns {Promise<Object>} 업데이트 결과
     */
    async updateGuidelines(analysis) {
        try {
            // 현재 CLAUDE.md 읽기
            const currentContent = await fs.readFile(this.claudeGuideFile, 'utf8');
            let updatedContent = currentContent;
            const changes = [];
            const updatedSections = [];

            // 각 개선사항 적용
            for (const improvement of analysis.suggestedChanges) {
                const updateResult = await this.applyImprovement(updatedContent, improvement);
                updatedContent = updateResult.content;
                changes.push(updateResult.change);
                updatedSections.push(improvement.section);
            }

            // 파일 업데이트 (변경사항이 있는 경우만)
            if (changes.length > 0) {
                await fs.writeFile(this.claudeGuideFile, updatedContent, 'utf8');
                console.log(`📝 CLAUDE.md 업데이트 완료: ${changes.length}개 변경사항`);
            }

            return {
                success: true,
                changes,
                updatedSections: [...new Set(updatedSections)],
                totalChanges: changes.length
            };

        } catch (error) {
            console.error('가이드라인 업데이트 실패:', error);
            return {
                success: false,
                error: error.message,
                changes: [],
                updatedSections: []
            };
        }
    }

    /**
     * 개선사항 적용
     * @param {string} content - 현재 내용
     * @param {Object} improvement - 개선사항
     * @returns {Promise<Object>} 적용 결과
     */
    async applyImprovement(content, improvement) {
        let updatedContent = content;
        let change = {};

        switch (improvement.type) {
            case 'ADD_PROHIBITION':
                const prohibitionResult = this.addProhibition(updatedContent, improvement.content);
                updatedContent = prohibitionResult.content;
                change = {
                    type: 'prohibition_added',
                    content: improvement.content,
                    location: '금지 사항 섹션'
                };
                break;

            case 'ADD_PRINCIPLE':
                const principleResult = this.addPrinciple(updatedContent, improvement.content);
                updatedContent = principleResult.content;
                change = {
                    type: 'principle_added',
                    content: improvement.content,
                    location: '필수 원칙 섹션'
                };
                break;

            case 'UPDATE_PROCESS':
                const processResult = this.updateProcess(updatedContent, improvement.content);
                updatedContent = processResult.content;
                change = {
                    type: 'process_updated',
                    content: improvement.content,
                    location: '개발 프로세스 섹션'
                };
                break;

            default:
                change = {
                    type: 'no_change',
                    reason: 'Unknown improvement type'
                };
        }

        return {
            content: updatedContent,
            change
        };
    }

    /**
     * 금지사항 추가
     * @param {string} content - 현재 내용
     * @param {string} prohibition - 금지사항
     * @returns {Object} 업데이트 결과
     */
    addProhibition(content, prohibition) {
        const prohibitionSection = '### **금지 사항**';
        const sectionIndex = content.indexOf(prohibitionSection);
        
        if (sectionIndex !== -1) {
            // 기존 금지사항들 뒤에 추가
            const nextSectionIndex = content.indexOf('### **필수 원칙**', sectionIndex);
            const insertIndex = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
            
            const newProhibition = `- ${prohibition}\n`;
            const updatedContent = content.slice(0, insertIndex) + newProhibition + content.slice(insertIndex);
            
            return {
                content: updatedContent,
                success: true
            };
        }

        return {
            content,
            success: false,
            reason: '금지 사항 섹션을 찾을 수 없음'
        };
    }

    /**
     * 원칙 추가
     * @param {string} content - 현재 내용
     * @param {string} principle - 원칙
     * @returns {Object} 업데이트 결과
     */
    addPrinciple(content, principle) {
        const principleSection = '### **필수 원칙**';
        const sectionIndex = content.indexOf(principleSection);
        
        if (sectionIndex !== -1) {
            const nextSectionIndex = content.indexOf('##', sectionIndex + principleSection.length);
            const insertIndex = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
            
            const newPrinciple = `- ${principle}\n`;
            const updatedContent = content.slice(0, insertIndex) + newPrinciple + content.slice(insertIndex);
            
            return {
                content: updatedContent,
                success: true
            };
        }

        return {
            content,
            success: false,
            reason: '필수 원칙 섹션을 찾을 수 없음'
        };
    }

    /**
     * 프로세스 업데이트
     * @param {string} content - 현재 내용
     * @param {string} processUpdate - 프로세스 업데이트
     * @returns {Object} 업데이트 결과
     */
    updateProcess(content, processUpdate) {
        // 개발 프로세스 섹션에 업데이트 추가
        const processSection = '## 🔧 주요 명령어';
        const sectionIndex = content.indexOf(processSection);
        
        if (sectionIndex !== -1) {
            const nextSectionIndex = content.indexOf('##', sectionIndex + processSection.length);
            const insertIndex = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
            
            const processNote = `\n<!-- ${processUpdate} -->\n`;
            const updatedContent = content.slice(0, insertIndex) + processNote + content.slice(insertIndex);
            
            return {
                content: updatedContent,
                success: true
            };
        }

        return {
            content,
            success: false,
            reason: '프로세스 섹션을 찾을 수 없음'
        };
    }

    /**
     * 학습 이력 기록
     * @param {string} feedback - 피드백
     * @param {string} context - 컨텍스트
     * @param {Object} analysis - 분석 결과
     * @param {Object} updateResult - 업데이트 결과
     * @returns {Promise<void>}
     */
    async recordLearningHistory(feedback, context, analysis, updateResult) {
        const historyEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            feedback,
            context,
            analysis,
            updateResult,
            impact: this.calculateLearningImpact(analysis),
            userSatisfaction: null // 추후 피드백으로 업데이트
        };

        this.learningHistory.push(historyEntry);

        // 이력이 너무 길어지면 오래된 것부터 제거
        if (this.learningHistory.length > 100) {
            this.learningHistory = this.learningHistory.slice(-100);
        }

        console.log(`📚 학습 이력 기록: ${historyEntry.id}`);
    }

    /**
     * 학습 영향도 계산
     * @param {Object} analysis - 분석 결과
     * @returns {Object} 영향도 정보
     */
    calculateLearningImpact(analysis) {
        const impactScores = {
            'PROHIBITION': 0.9,    // 금지사항은 높은 영향도
            'ENHANCEMENT': 0.7,    // 개선사항은 중간 영향도
            'NEW_FEATURE': 0.8,    // 새 기능은 높은 영향도
            'BUG_FIX': 0.6,        // 버그 수정은 중간 영향도
            'PROCESS': 0.5,        // 프로세스 변경은 낮은 영향도
            'GUIDELINE': 0.8       // 가이드라인 변경은 높은 영향도
        };

        const baseScore = impactScores[analysis.improvementType] || 0.5;
        const urgencyMultiplier = {
            'URGENT': 1.2,
            'HIGH': 1.1,
            'MEDIUM': 1.0
        };

        const finalScore = baseScore * (urgencyMultiplier[analysis.urgencyLevel] || 1.0);

        return {
            score: finalScore,
            category: analysis.improvementType,
            urgency: analysis.urgencyLevel,
            estimatedBenefit: this.estimateBenefit(analysis),
            riskLevel: this.assessRisk(analysis)
        };
    }

    /**
     * 예상 이익 계산
     * @param {Object} analysis - 분석 결과
     * @returns {string} 예상 이익
     */
    estimateBenefit(analysis) {
        const benefits = {
            'PROHIBITION': '시스템 안정성 향상',
            'ENHANCEMENT': '성능 및 효율성 개선',
            'NEW_FEATURE': '기능성 확장',
            'BUG_FIX': '안정성 및 신뢰성 향상',
            'PROCESS': '개발 효율성 개선',
            'GUIDELINE': '코드 품질 및 일관성 향상'
        };

        return benefits[analysis.improvementType] || '일반적인 시스템 개선';
    }

    /**
     * 위험도 평가
     * @param {Object} analysis - 분석 결과
     * @returns {string} 위험도
     */
    assessRisk(analysis) {
        const riskLevels = {
            'PROHIBITION': 'LOW',      // 금지사항은 낮은 위험
            'ENHANCEMENT': 'MEDIUM',   // 개선사항은 중간 위험
            'NEW_FEATURE': 'HIGH',     // 새 기능은 높은 위험
            'BUG_FIX': 'LOW',          // 버그 수정은 낮은 위험
            'PROCESS': 'MEDIUM',       // 프로세스 변경은 중간 위험
            'GUIDELINE': 'LOW'         // 가이드라인 변경은 낮은 위험
        };

        return riskLevels[analysis.improvementType] || 'MEDIUM';
    }

    /**
     * 신뢰도 계산
     * @param {Object} analysis - 분석 결과
     * @returns {number} 신뢰도 (0-1)
     */
    calculateConfidence(analysis) {
        let confidence = 0.8; // 기본 신뢰도

        // 명확한 키워드가 있으면 신뢰도 증가
        if (analysis.improvementType !== 'GENERAL') {
            confidence += 0.1;
        }

        // 구체적인 섹션이 식별되면 신뢰도 증가
        if (analysis.targetSection !== 'general') {
            confidence += 0.05;
        }

        // 개선사항이 많으면 신뢰도 감소
        if (analysis.suggestedChanges.length > 3) {
            confidence -= 0.1;
        }

        return Math.min(0.95, Math.max(0.5, confidence));
    }

    /**
     * 적응 메트릭스 업데이트
     * @param {boolean} success - 성공 여부
     */
    updateAdaptationMetrics(success) {
        this.adaptationMetrics.totalAdaptations++;
        
        if (success) {
            this.adaptationMetrics.successfulUpdates++;
        }

        // 학습 정확도 재계산
        this.adaptationMetrics.learningAccuracy = 
            this.adaptationMetrics.successfulUpdates / this.adaptationMetrics.totalAdaptations;

        console.log(`📊 적응 메트릭스 업데이트: 성공률 ${(this.adaptationMetrics.learningAccuracy * 100).toFixed(1)}%`);
    }

    /**
     * 학습 통계 조회
     * @returns {Object} 학습 통계
     */
    getLearningStatistics() {
        const recentHistory = this.learningHistory.slice(-10);
        
        return {
            totalLearningEvents: this.learningHistory.length,
            recentEvents: recentHistory.length,
            adaptationMetrics: this.adaptationMetrics,
            topImprovementTypes: this.getTopImprovementTypes(),
            averageImpactScore: this.calculateAverageImpact(),
            learningTrend: this.analyzeLearningTrend()
        };
    }

    /**
     * 주요 개선 유형 조회
     * @returns {Array} 상위 개선 유형들
     */
    getTopImprovementTypes() {
        const typeCounts = {};
        
        this.learningHistory.forEach(entry => {
            const type = entry.analysis.improvementType;
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        return Object.entries(typeCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }

    /**
     * 평균 영향도 계산
     * @returns {number} 평균 영향도
     */
    calculateAverageImpact() {
        if (this.learningHistory.length === 0) return 0;

        const totalImpact = this.learningHistory.reduce((sum, entry) => {
            return sum + (entry.impact?.score || 0);
        }, 0);

        return totalImpact / this.learningHistory.length;
    }

    /**
     * 학습 트렌드 분석
     * @returns {Object} 트렌드 정보
     */
    analyzeLearningTrend() {
        const recent = this.learningHistory.slice(-10);
        const older = this.learningHistory.slice(-20, -10);

        const recentAvg = recent.length > 0 ? 
            recent.reduce((sum, entry) => sum + (entry.impact?.score || 0), 0) / recent.length : 0;
        
        const olderAvg = older.length > 0 ? 
            older.reduce((sum, entry) => sum + (entry.impact?.score || 0), 0) / older.length : 0;

        return {
            trend: recentAvg > olderAvg ? 'IMPROVING' : 'DECLINING',
            recentAverage: recentAvg,
            previousAverage: olderAvg,
            changePercent: olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1) : 0
        };
    }
}

// 전역 인스턴스
const globalLearningSystem = new RealTimeLearningSystem();

/**
 * 편의 함수들
 */
async function learnFromFeedback(feedback, context = '', category = 'GENERAL') {
    return await globalLearningSystem.adaptToUserFeedback(feedback, context, category);
}

function getLearningStats() {
    return globalLearningSystem.getLearningStatistics();
}

function getAdaptationMetrics() {
    return globalLearningSystem.adaptationMetrics;
}

module.exports = {
    RealTimeLearningSystem,
    globalLearningSystem,
    learnFromFeedback,
    getLearningStats,
    getAdaptationMetrics
};