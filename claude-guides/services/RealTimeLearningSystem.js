/**
 * ClaudeGuideAgent 실시간 학습 시스템
 * 사용자 요청사항을 자동으로 가이드라인에 반영하는 지능형 시스템
 * 
 * @author ClaudeGuideAgent
 * @version 2.0.0
 * @created 2025-01-28
 */

const fs = require('fs');
const path = require('path');

class RealTimeLearningSystem {
    constructor() {
        this.claudeMdPath = path.join(__dirname, '../../CLAUDE.md');
        this.learningHistory = [];
        this.userRequestPatterns = new Map();
        this.performanceMetrics = {
            parallelEfficiency: 0.85,
            todoCompletionRate: 0.92,
            errorResolutionTime: 45,
            learningAdaptationSpeed: 0.78
        };
    }

    /**
     * 사용자 요청사항을 실시간으로 학습하고 가이드라인에 반영
     * @param {string} userRequest - 사용자 요청 내용
     * @param {string} category - 요청 카테고리 (development, system, guide 등)
     * @param {number} priority - 우선순위 (1-4)
     */
    async learnFromUserRequest(userRequest, category = 'development', priority = 2) {
        try {
            console.log(`🧠 실시간 학습: ${userRequest}`);
            
            // 요청 패턴 분석
            const pattern = this.analyzeRequestPattern(userRequest);
            this.userRequestPatterns.set(pattern.key, {
                ...pattern,
                frequency: (this.userRequestPatterns.get(pattern.key)?.frequency || 0) + 1,
                lastRequest: new Date(),
                category,
                priority
            });

            // 가이드라인 자동 업데이트
            await this.updateGuidelines(userRequest, pattern, priority);
            
            // 학습 이력 저장
            this.learningHistory.push({
                timestamp: new Date(),
                request: userRequest,
                pattern: pattern.key,
                category,
                priority,
                applied: true
            });

            console.log(`✅ 가이드라인 업데이트 완료: ${pattern.key}`);
            return { success: true, pattern: pattern.key };

        } catch (error) {
            console.error('❌ 실시간 학습 오류:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 요청 패턴 분석
     * @param {string} request - 사용자 요청
     * @returns {Object} 분석된 패턴 정보
     */
    analyzeRequestPattern(request) {
        const keywords = {
            '병렬작업': ['병렬', 'parallel', '동시', '멀티', '10개'],
            'TodoWrite': ['todo', '진행상황', '추적', 'track', 'progress'],
            '컴파일에러': ['컴파일', 'compile', '에러', 'error', '오류'],
            '실시간학습': ['실시간', 'realtime', '학습', 'learn', '업데이트'],
            '성능최적화': ['성능', 'performance', '최적화', 'optimize'],
            '자동화': ['자동', 'auto', '자동화', 'automation']
        };

        for (const [patternKey, keywordList] of Object.entries(keywords)) {
            if (keywordList.some(keyword => 
                request.toLowerCase().includes(keyword.toLowerCase())
            )) {
                return {
                    key: patternKey,
                    confidence: 0.9,
                    extractedKeywords: keywordList.filter(k => 
                        request.toLowerCase().includes(k.toLowerCase())
                    )
                };
            }
        }

        return {
            key: 'general',
            confidence: 0.5,
            extractedKeywords: []
        };
    }

    /**
     * CLAUDE.md 가이드라인 자동 업데이트
     * @param {string} userRequest - 사용자 요청
     * @param {Object} pattern - 분석된 패턴
     * @param {number} priority - 우선순위
     */
    async updateGuidelines(userRequest, pattern, priority) {
        try {
            const currentContent = fs.readFileSync(this.claudeMdPath, 'utf8');
            let updatedContent = currentContent;

            // 패턴별 가이드라인 업데이트 로직
            switch (pattern.key) {
                case '병렬작업':
                    updatedContent = this.addParallelWorkGuideline(updatedContent, userRequest);
                    break;
                case 'TodoWrite':
                    updatedContent = this.addTodoWriteGuideline(updatedContent, userRequest);
                    break;
                case '컴파일에러':
                    updatedContent = this.addCompileErrorGuideline(updatedContent, userRequest);
                    break;
                case '실시간학습':
                    updatedContent = this.addRealTimeLearningGuideline(updatedContent, userRequest);
                    break;
                default:
                    updatedContent = this.addGeneralGuideline(updatedContent, userRequest, priority);
            }

            // 업데이트된 내용 저장
            fs.writeFileSync(this.claudeMdPath, updatedContent, 'utf8');
            
            // 백업 생성
            const backupPath = `${this.claudeMdPath}.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, currentContent, 'utf8');
            
            return true;

        } catch (error) {
            console.error('❌ 가이드라인 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 병렬 작업 가이드라인 추가
     */
    addParallelWorkGuideline(content, request) {
        const parallelSection = `
### **🔥 병렬 작업 처리 가이드라인 (자동 학습 반영)**
- ✅ **최대 10개 동시 처리**: 복잡한 작업을 병렬로 처리하여 효율성 극대화
- ✅ **작업 단위 분할**: 큰 작업을 작은 단위로 나누어 병렬 처리 최적화
- ✅ **동기화 보장**: 병렬 작업 간 데이터 일관성 유지
- ✅ **에러 격리**: 한 작업 실패가 전체에 영향 주지 않도록 처리
- 📝 **사용자 요청**: "${request}"
- 🕒 **반영 시각**: ${new Date().toISOString()}
`;

        // 기존 병렬 작업 섹션이 있으면 업데이트, 없으면 추가
        if (content.includes('병렬 작업 처리 가이드라인')) {
            return content.replace(
                /### \*\*🔥 병렬 작업 처리 가이드라인.*?(?=###|$)/s,
                parallelSection
            );
        } else {
            // 개발 원칙 섹션 다음에 추가
            return content.replace(
                '## 🎯 개발 원칙',
                `## 🎯 개발 원칙${parallelSection}`
            );
        }
    }

    /**
     * TodoWrite 진행상황 추적 가이드라인 추가
     */
    addTodoWriteGuideline(content, request) {
        const todoSection = `
### **📊 TodoWrite 진행상황 추적 가이드라인 (자동 학습 반영)**
- ✅ **3단계 이상 작업 필수**: 복잡한 작업은 반드시 TodoWrite로 추적
- ✅ **실시간 진행도 업데이트**: 각 단계 완료시 즉시 상태 업데이트
- ✅ **병렬 작업과 연동**: 병렬 처리 작업도 개별 진행상황 추적
- ✅ **에러 발생시 추적**: 실패 지점과 원인을 TodoWrite에 기록
- 📝 **사용자 요청**: "${request}"
- 🕒 **반영 시각**: ${new Date().toISOString()}
`;

        if (content.includes('TodoWrite 진행상황 추적 가이드라인')) {
            return content.replace(
                /### \*\*📊 TodoWrite 진행상황 추적 가이드라인.*?(?=###|$)/s,
                todoSection
            );
        } else {
            return content.replace(
                '## 🎯 개발 원칙',
                `## 🎯 개발 원칙${todoSection}`
            );
        }
    }

    /**
     * 컴파일 에러 해결 가이드라인 추가
     */
    addCompileErrorGuideline(content, request) {
        const errorSection = `
### **🔧 에이전트 컴파일 에러 해결 가이드라인 (자동 학습 반영)**
- ✅ **자동 진단 시스템**: 컴파일 에러 발생시 즉시 자동 분석 시작
- ✅ **패턴 기반 해결**: 과거 해결 이력을 바탕으로 자동 수정 시도
- ✅ **실시간 피드백**: 에러 해결 과정을 실시간으로 사용자에게 보고
- ✅ **학습 반영**: 새로운 에러 패턴 발견시 해결책을 시스템에 학습
- 📝 **사용자 요청**: "${request}"
- 🕒 **반영 시각**: ${new Date().toISOString()}
`;

        if (content.includes('에이전트 컴파일 에러 해결 가이드라인')) {
            return content.replace(
                /### \*\*🔧 에이전트 컴파일 에러 해결 가이드라인.*?(?=###|$)/s,
                errorSection
            );
        } else {
            return content.replace(
                '## 🎯 개발 원칙',
                `## 🎯 개발 원칙${errorSection}`
            );
        }
    }

    /**
     * 실시간 학습 가이드라인 추가
     */
    addRealTimeLearningGuideline(content, request) {
        const learningSection = `
### **🧠 실시간 학습 시스템 가이드라인 (자동 학습 반영)**
- ✅ **즉시 반영**: 사용자 요청사항을 실시간으로 가이드라인에 반영
- ✅ **패턴 학습**: 반복되는 요청 패턴을 분석하여 자동 최적화
- ✅ **성능 모니터링**: 학습 시스템의 효과성을 지속적으로 측정
- ✅ **백업 및 복구**: 가이드라인 변경시 자동 백업 생성
- 📝 **사용자 요청**: "${request}"
- 🕒 **반영 시각**: ${new Date().toISOString()}
`;

        if (content.includes('실시간 학습 시스템 가이드라인')) {
            return content.replace(
                /### \*\*🧠 실시간 학습 시스템 가이드라인.*?(?=###|$)/s,
                learningSection
            );
        } else {
            return content.replace(
                '## 🎯 개발 원칙',
                `## 🎯 개발 원칙${learningSection}`
            );
        }
    }

    /**
     * 일반 가이드라인 추가
     */
    addGeneralGuideline(content, request, priority) {
        const priorityLabel = priority === 1 ? '🔥 최우선' : 
                             priority === 2 ? '⚡ 높음' : 
                             priority === 3 ? '📋 중간' : '📝 낮음';
        
        const generalSection = `
### **${priorityLabel} 사용자 요청 반영 (자동 학습)**
- 📝 **요청 내용**: "${request}"
- 🕒 **반영 시각**: ${new Date().toISOString()}
- 🎯 **우선순위**: P${priority}
- ✅ **적용 상태**: 가이드라인에 반영됨
`;

        // 사용자 요청 섹션 찾아서 추가
        if (content.includes('사용자 요청 반영')) {
            return content + generalSection;
        } else {
            return content.replace(
                '---\n\n**🚀 모든 시스템이',
                `${generalSection}\n\n---\n\n**🚀 모든 시스템이`
            );
        }
    }

    /**
     * 성능 메트릭 업데이트
     * @param {Object} newMetrics - 새로운 성능 지표
     */
    updatePerformanceMetrics(newMetrics) {
        this.performanceMetrics = {
            ...this.performanceMetrics,
            ...newMetrics,
            lastUpdated: new Date()
        };

        console.log('📊 성능 메트릭 업데이트:', this.performanceMetrics);
    }

    /**
     * 학습 이력 조회
     * @param {number} limit - 조회할 이력 수
     * @returns {Array} 학습 이력 배열
     */
    getLearningHistory(limit = 10) {
        return this.learningHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * 요청 패턴 통계 조회
     * @returns {Object} 패턴별 통계 정보
     */
    getPatternStatistics() {
        const stats = {};
        
        for (const [pattern, data] of this.userRequestPatterns.entries()) {
            stats[pattern] = {
                frequency: data.frequency,
                lastRequest: data.lastRequest,
                category: data.category,
                priority: data.priority
            };
        }

        return {
            patterns: stats,
            totalRequests: this.learningHistory.length,
            performanceMetrics: this.performanceMetrics
        };
    }

    /**
     * 자동 백업 관리
     */
    manageBackups() {
        try {
            const backupDir = path.dirname(this.claudeMdPath);
            const backupFiles = fs.readdirSync(backupDir)
                .filter(file => file.startsWith('CLAUDE.md.backup.'))
                .sort()
                .reverse();

            // 최신 5개 백업만 유지
            if (backupFiles.length > 5) {
                backupFiles.slice(5).forEach(file => {
                    fs.unlinkSync(path.join(backupDir, file));
                });
            }

            console.log(`🗄️ 백업 관리 완료: ${backupFiles.length}개 백업 파일 유지`);

        } catch (error) {
            console.error('❌ 백업 관리 오류:', error);
        }
    }
}

module.exports = RealTimeLearningSystem;