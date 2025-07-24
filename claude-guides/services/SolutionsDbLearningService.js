#!/usr/bin/env node

/**
 * Solutions-DB 학습 서비스
 * TroubleshootingService가 생성한 solutions-db.md를 파싱하여
 * AI 가이드 시스템이 실제 프로젝트 경험을 학습하도록 지원
 * Context7 지침에 따른 경험 기반 지식 축적
 */

const fs = require('fs').promises;
const path = require('path');

class SolutionsDbLearningService {
    constructor() {
        this.version = "1.0.0";
        this.solutionsDbPath = path.join(process.cwd(), 'docs/troubleshooting/solutions-db.md');
        this.knowledgeCache = null;
        this.lastCacheUpdate = null;
        this.cacheValidityMinutes = 5; // 5분간 캐시 유효
        
        console.log('🧠 Solutions-DB 학습 서비스 초기화 완료');
    }

    /**
     * solutions-db.md에서 실제 경험 데이터 추출
     */
    async loadSolutionsDatabase() {
        try {
            // 캐시 유효성 확인
            if (this.knowledgeCache && this.isCacheValid()) {
                console.log('📋 캐시된 solutions-db 데이터 사용');
                return this.knowledgeCache;
            }

            console.log('📖 solutions-db.md 파싱 시작...');
            
            const solutionsContent = await this.readSolutionsFile();
            const parsedKnowledge = await this.parseSolutionsContent(solutionsContent);
            
            // 캐시 업데이트
            this.knowledgeCache = parsedKnowledge;
            this.lastCacheUpdate = new Date();
            
            console.log(`✅ solutions-db 학습 완료 - ${parsedKnowledge.totalIssues}개 이슈, ${parsedKnowledge.resolvedIssues}개 해결됨`);
            
            return parsedKnowledge;
            
        } catch (error) {
            console.warn('⚠️ solutions-db 로드 실패, 빈 지식베이스 반환:', error.message);
            return this.createEmptyKnowledgeBase();
        }
    }

    /**
     * solutions-db.md 파일 읽기
     */
    async readSolutionsFile() {
        try {
            const content = await fs.readFile(this.solutionsDbPath, 'utf8');
            return content;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📝 solutions-db.md 파일이 없음, 빈 지식베이스 생성');
                return '';
            }
            throw error;
        }
    }

    /**
     * 마크다운 내용을 구조화된 지식으로 파싱
     */
    async parseSolutionsContent(content) {
        const knowledge = {
            totalIssues: 0,
            resolvedIssues: 0,
            errorPatterns: new Map(),
            performanceIssues: new Map(),
            securityIncidents: new Map(),
            commonSolutions: new Map(),
            aiLearningTags: new Set(),
            lastUpdated: new Date().toISOString(),
            statistics: {
                errorCategories: {},
                averageResolutionTime: null,
                mostCommonErrors: [],
                effectiveSolutions: []
            }
        };

        if (!content || content.trim().length === 0) {
            return knowledge;
        }

        // 이슈별 섹션 분리
        const issueSections = this.extractIssueSections(content);
        knowledge.totalIssues = issueSections.length;

        console.log(`🔍 ${issueSections.length}개 이슈 섹션 발견, 분석 시작...`);

        for (const section of issueSections) {
            const parsedIssue = this.parseIssueSection(section);
            
            if (parsedIssue) {
                this.addToKnowledge(knowledge, parsedIssue);
                
                // 해결된 이슈 카운트
                if (parsedIssue.status === 'resolved') {
                    knowledge.resolvedIssues++;
                }
            }
        }

        // 통계 생성
        this.generateStatistics(knowledge);

        return knowledge;
    }

    /**
     * 마크다운에서 이슈 섹션들 추출
     */
    extractIssueSections(content) {
        const sections = [];
        
        // 자동 감지된 이슈 마커들로 분리
        const issueMarkers = [
            /## 🚨 자동 감지된 에러 이슈 #([A-Z]+-[a-f0-9]+)/g,
            /## ⚡ 자동 감지된 성능 이슈 #([A-Z]+-[a-f0-9]+)/g,
            /## 🔒 자동 감지된 보안 이슈 #([A-Z]+-[a-f0-9]+)/g
        ];

        let allMatches = [];
        
        for (const marker of issueMarkers) {
            let match;
            while ((match = marker.exec(content)) !== null) {
                allMatches.push({
                    start: match.index,
                    end: 0, // 나중에 계산
                    eventId: match[1],
                    type: match[0].includes('🚨') ? 'ERROR' : 
                          match[0].includes('⚡') ? 'PERFORMANCE' : 'SECURITY',
                    headerMatch: match[0]
                });
            }
        }

        // 시작 위치로 정렬
        allMatches.sort((a, b) => a.start - b.start);

        // 각 섹션의 끝 위치 계산
        for (let i = 0; i < allMatches.length; i++) {
            const current = allMatches[i];
            const next = allMatches[i + 1];
            
            if (next) {
                current.end = next.start;
            } else {
                current.end = content.length;
            }

            // 섹션 내용 추출
            const sectionContent = content.substring(current.start, current.end);
            sections.push({
                ...current,
                content: sectionContent
            });
        }

        return sections;
    }

    /**
     * 개별 이슈 섹션 파싱
     */
    parseIssueSection(section) {
        try {
            const issue = {
                eventId: section.eventId,
                type: section.type,
                status: 'pending', // resolved, pending
                severity: 'MEDIUM',
                errorType: null,
                errorMessage: null,
                location: null,
                requestUrl: null,
                userEmail: null,
                rootCause: null,
                solution: null,
                preventionMeasures: [],
                aiTags: [],
                timestamp: null,
                resolutionTime: null
            };

            const content = section.content;

            // 기본 정보 추출
            this.extractBasicInfo(content, issue);
            
            // 해결 상태 확인
            this.checkResolutionStatus(content, issue);
            
            // AI 학습 태그 추출
            this.extractAITags(content, issue);

            return issue;

        } catch (error) {
            console.warn(`⚠️ 이슈 섹션 파싱 실패: ${section.eventId}`, error.message);
            return null;
        }
    }

    /**
     * 기본 정보 추출
     */
    extractBasicInfo(content, issue) {
        // 심각도 추출
        const severityMatch = content.match(/\*\*심각도\*\*:\s*([A-Z]+)/);
        if (severityMatch) {
            issue.severity = severityMatch[1];
        }

        // 에러 타입 추출
        const errorTypeMatch = content.match(/\*\*에러 타입\*\*:\s*`([^`]+)`/);
        if (errorTypeMatch) {
            issue.errorType = errorTypeMatch[1];
        }

        // 에러 메시지 추출
        const errorMessageMatch = content.match(/\*\*에러 메시지\*\*:\s*(.+)/);
        if (errorMessageMatch) {
            issue.errorMessage = errorMessageMatch[1].trim();
        }

        // 발생 위치 추출
        const locationMatch = content.match(/\*\*발생 위치\*\*:\s*`([^`]+)`/);
        if (locationMatch) {
            issue.location = locationMatch[1];
        }

        // 요청 URL 추출
        const urlMatch = content.match(/\*\*요청 URL\*\*:\s*`([^`]+)`/);
        if (urlMatch) {
            issue.requestUrl = urlMatch[1];
        }

        // 사용자 추출
        const userMatch = content.match(/\*\*발생 사용자\*\*:\s*([^\n]+)/);
        if (userMatch) {
            issue.userEmail = userMatch[1].trim();
        }

        // 실행 시간 추출 (성능 이슈)
        const executionTimeMatch = content.match(/\*\*실행 시간\*\*:\s*(\d+)ms/);
        if (executionTimeMatch) {
            issue.executionTime = parseInt(executionTimeMatch[1]);
        }

        // 타임스탬프 추출
        const timestampMatch = content.match(/\*\*생성 시간\*\*:\s*([^\n]+)/);
        if (timestampMatch) {
            issue.timestamp = timestampMatch[1].trim();
        }
    }

    /**
     * 해결 상태 확인
     */
    checkResolutionStatus(content, issue) {
        // 근본 원인이 작성되었는지 확인
        const rootCauseMatch = content.match(/\*\*근본 원인\*\*:\s*([^\n-]+)/);
        if (rootCauseMatch && rootCauseMatch[1].trim().length > 0) {
            issue.rootCause = rootCauseMatch[1].trim();
        }

        // 해결 방법이 작성되었는지 확인
        const solutionMatch = content.match(/\*\*해결 방법\*\*:\s*([^\n-]+)/);
        if (solutionMatch && solutionMatch[1].trim().length > 0) {
            issue.solution = solutionMatch[1].trim();
        }

        // 예방 조치 추출
        const preventionMatches = content.match(/\*\*예방 조치\*\*:\s*([^\n-]+)/);
        if (preventionMatches && preventionMatches[1].trim().length > 0) {
            issue.preventionMeasures = [preventionMatches[1].trim()];
        }

        // 체크박스가 체크되었는지 확인
        const checkedBoxes = (content.match(/- \[x\]/gi) || []).length;
        const totalBoxes = (content.match(/- \[[x\s]\]/gi) || []).length;

        // 해결 여부 판정
        if (issue.rootCause && issue.solution && checkedBoxes > 0) {
            issue.status = 'resolved';
            
            // 해결 시간 추정 (체크박스 비율 기반)
            if (totalBoxes > 0) {
                const completionRate = checkedBoxes / totalBoxes;
                issue.resolutionTime = completionRate >= 0.8 ? 'fast' : 
                                     completionRate >= 0.5 ? 'medium' : 'slow';
            }
        }
    }

    /**
     * AI 학습 태그 추출
     */
    extractAITags(content, issue) {
        const tagSection = content.match(/### 🏷️ AI 학습 태그\s*([\s\S]*?)(\n###|\n---|\n\*|$)/);
        if (tagSection) {
            const tags = tagSection[1].match(/`([^`]+)`/g) || [];
            issue.aiTags = tags.map(tag => tag.replace(/`/g, '').trim());
        }
    }

    /**
     * 지식베이스에 이슈 정보 추가
     */
    addToKnowledge(knowledge, issue) {
        // 에러 패턴 추가
        if (issue.type === 'ERROR' && issue.errorType) {
            this.addErrorPattern(knowledge.errorPatterns, issue);
        }

        // 성능 이슈 추가
        if (issue.type === 'PERFORMANCE') {
            this.addPerformanceIssue(knowledge.performanceIssues, issue);
        }

        // 보안 인시던트 추가
        if (issue.type === 'SECURITY') {
            this.addSecurityIncident(knowledge.securityIncidents, issue);
        }

        // 해결책 추가
        if (issue.status === 'resolved' && issue.solution) {
            this.addCommonSolution(knowledge.commonSolutions, issue);
        }

        // AI 태그 추가
        issue.aiTags.forEach(tag => knowledge.aiLearningTags.add(tag));

        // 카테고리 통계
        const category = issue.errorType || issue.type.toLowerCase();
        knowledge.statistics.errorCategories[category] = 
            (knowledge.statistics.errorCategories[category] || 0) + 1;
    }

    /**
     * 에러 패턴 추가
     */
    addErrorPattern(errorPatterns, issue) {
        const key = issue.errorType;
        if (!errorPatterns.has(key)) {
            errorPatterns.set(key, {
                type: issue.errorType,
                count: 0,
                locations: new Set(),
                commonCauses: new Set(),
                solutions: new Set(),
                severity: issue.severity,
                examples: []
            });
        }

        const pattern = errorPatterns.get(key);
        pattern.count++;
        
        if (issue.location) pattern.locations.add(issue.location);
        if (issue.rootCause) pattern.commonCauses.add(issue.rootCause);
        if (issue.solution) pattern.solutions.add(issue.solution);
        
        pattern.examples.push({
            eventId: issue.eventId,
            message: issue.errorMessage,
            timestamp: issue.timestamp,
            resolved: issue.status === 'resolved'
        });
    }

    /**
     * 성능 이슈 추가
     */
    addPerformanceIssue(performanceIssues, issue) {
        const key = issue.location || 'unknown';
        if (!performanceIssues.has(key)) {
            performanceIssues.set(key, {
                location: key,
                count: 0,
                averageTime: 0,
                maxTime: 0,
                optimizations: new Set(),
                examples: []
            });
        }

        const perfIssue = performanceIssues.get(key);
        perfIssue.count++;
        
        if (issue.executionTime) {
            perfIssue.averageTime = (perfIssue.averageTime * (perfIssue.count - 1) + issue.executionTime) / perfIssue.count;
            perfIssue.maxTime = Math.max(perfIssue.maxTime, issue.executionTime);
        }
        
        if (issue.solution) perfIssue.optimizations.add(issue.solution);
        
        perfIssue.examples.push({
            eventId: issue.eventId,
            executionTime: issue.executionTime,
            timestamp: issue.timestamp,
            resolved: issue.status === 'resolved'
        });
    }

    /**
     * 보안 인시던트 추가
     */
    addSecurityIncident(securityIncidents, issue) {
        const key = issue.errorType || 'general_security';
        if (!securityIncidents.has(key)) {
            securityIncidents.set(key, {
                type: key,
                count: 0,
                severity: issue.severity,
                countermeasures: new Set(),
                examples: []
            });
        }

        const incident = securityIncidents.get(key);
        incident.count++;
        
        if (issue.solution) incident.countermeasures.add(issue.solution);
        
        incident.examples.push({
            eventId: issue.eventId,
            userEmail: issue.userEmail,
            timestamp: issue.timestamp,
            resolved: issue.status === 'resolved'
        });
    }

    /**
     * 공통 해결책 추가
     */
    addCommonSolution(commonSolutions, issue) {
        const key = issue.rootCause || issue.errorType || 'general';
        if (!commonSolutions.has(key)) {
            commonSolutions.set(key, {
                problem: key,
                solutions: new Map(),
                totalCount: 0
            });
        }

        const commonSolution = commonSolutions.get(key);
        commonSolution.totalCount++;

        const solutionKey = issue.solution;
        if (!commonSolution.solutions.has(solutionKey)) {
            commonSolution.solutions.set(solutionKey, {
                solution: solutionKey,
                count: 0,
                effectiveness: 0,
                examples: []
            });
        }

        const solution = commonSolution.solutions.get(solutionKey);
        solution.count++;
        solution.effectiveness = solution.count / commonSolution.totalCount;
        solution.examples.push(issue.eventId);
    }

    /**
     * 통계 생성
     */
    generateStatistics(knowledge) {
        // 가장 흔한 에러들
        const errorCounts = Array.from(knowledge.errorPatterns.entries())
            .map(([type, pattern]) => ({ type, count: pattern.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        knowledge.statistics.mostCommonErrors = errorCounts;

        // 효과적인 해결책들
        const effectiveSolutions = [];
        knowledge.commonSolutions.forEach((problem, problemKey) => {
            problem.solutions.forEach((solution, solutionKey) => {
                if (solution.effectiveness > 0.7 && solution.count >= 2) {
                    effectiveSolutions.push({
                        problem: problemKey,
                        solution: solutionKey,
                        effectiveness: solution.effectiveness,
                        usageCount: solution.count
                    });
                }
            });
        });

        knowledge.statistics.effectiveSolutions = effectiveSolutions
            .sort((a, b) => b.effectiveness - a.effectiveness)
            .slice(0, 10);
    }

    /**
     * 특정 작업 타입에 대한 경험 기반 조언 생성
     */
    async getExperienceBasedAdvice(workType, userMessage) {
        const knowledge = await this.loadSolutionsDatabase();
        
        if (knowledge.totalIssues === 0) {
            return {
                hasExperienceData: false,
                message: "아직 축적된 경험 데이터가 없습니다. 시스템 사용이 늘어나면 더 나은 조언을 제공할 수 있습니다."
            };
        }

        const advice = {
            hasExperienceData: true,
            totalExperience: `${knowledge.totalIssues}개 이슈 중 ${knowledge.resolvedIssues}개 해결 (${Math.round(knowledge.resolvedIssues / knowledge.totalIssues * 100)}%)`,
            relevantPatterns: [],
            preventiveActions: [],
            recommendedSolutions: [],
            warningsFromPastIssues: []
        };

        // 작업 타입과 관련된 패턴 찾기
        this.findRelevantPatterns(knowledge, workType, userMessage, advice);
        
        // 예방 조치 추천
        this.recommendPreventiveActions(knowledge, workType, advice);
        
        // 과거 이슈 기반 경고
        this.generatePastIssueWarnings(knowledge, workType, advice);

        return advice;
    }

    /**
     * 관련 패턴 찾기
     */
    findRelevantPatterns(knowledge, workType, userMessage, advice) {
        const messageWords = userMessage.toLowerCase().split(/\s+/);
        
        // 에러 패턴 검색
        knowledge.errorPatterns.forEach((pattern, errorType) => {
            const relevanceScore = this.calculateRelevanceScore(errorType, messageWords, workType);
            if (relevanceScore > 0.3) {
                advice.relevantPatterns.push({
                    type: 'error',
                    pattern: errorType,
                    count: pattern.count,
                    severity: pattern.severity,
                    commonCauses: Array.from(pattern.commonCauses),
                    solutions: Array.from(pattern.solutions),
                    relevance: relevanceScore
                });
            }
        });

        // 성능 이슈 검색
        knowledge.performanceIssues.forEach((issue, location) => {
            const relevanceScore = this.calculateRelevanceScore(location, messageWords, workType);
            if (relevanceScore > 0.3) {
                advice.relevantPatterns.push({
                    type: 'performance',
                    location: location,
                    count: issue.count,
                    averageTime: Math.round(issue.averageTime),
                    optimizations: Array.from(issue.optimizations),
                    relevance: relevanceScore
                });
            }
        });

        // 관련도순으로 정렬
        advice.relevantPatterns.sort((a, b) => b.relevance - a.relevance);
        advice.relevantPatterns = advice.relevantPatterns.slice(0, 5); // 상위 5개만
    }

    /**
     * 관련도 점수 계산
     */
    calculateRelevanceScore(pattern, messageWords, workType) {
        let score = 0;
        const patternWords = pattern.toLowerCase().split(/[.\s_]+/);
        
        // 단어 매칭
        messageWords.forEach(word => {
            if (patternWords.some(pWord => pWord.includes(word) || word.includes(pWord))) {
                score += 0.3;
            }
        });

        // 작업 타입별 가중치
        if (workType === 'spring_boot_error' && pattern.includes('Exception')) {
            score += 0.4;
        }
        if (workType === 'performance_optimization' && pattern.includes('Service')) {
            score += 0.4;
        }
        if (workType === 'api_development' && pattern.includes('Controller')) {
            score += 0.4;
        }

        return Math.min(score, 1.0);
    }

    /**
     * 예방 조치 추천
     */
    recommendPreventiveActions(knowledge, workType, advice) {
        // 효과적인 해결책들을 예방 조치로 변환
        knowledge.statistics.effectiveSolutions.forEach(solution => {
            if (solution.effectiveness > 0.8) {
                advice.preventiveActions.push({
                    action: `"${solution.problem}" 문제 예방을 위해: ${solution.solution}`,
                    effectiveness: Math.round(solution.effectiveness * 100) + '%',
                    basedOnCases: solution.usageCount
                });
            }
        });

        // 최대 3개로 제한
        advice.preventiveActions = advice.preventiveActions.slice(0, 3);
    }

    /**
     * 과거 이슈 기반 경고 생성
     */
    generatePastIssueWarnings(knowledge, workType, advice) {
        // 자주 발생하는 에러들에 대한 경고
        knowledge.statistics.mostCommonErrors.forEach(error => {
            if (error.count >= 3) {
                advice.warningsFromPastIssues.push(
                    `⚠️ "${error.type}" 에러가 ${error.count}회 발생했습니다. 주의 깊게 검토하세요.`
                );
            }
        });

        // 최대 3개로 제한
        advice.warningsFromPastIssues = advice.warningsFromPastIssues.slice(0, 3);
    }

    /**
     * 캐시 유효성 확인
     */
    isCacheValid() {
        if (!this.lastCacheUpdate) return false;
        
        const now = new Date();
        const diffMinutes = (now - this.lastCacheUpdate) / (1000 * 60);
        return diffMinutes < this.cacheValidityMinutes;
    }

    /**
     * 빈 지식베이스 생성
     */
    createEmptyKnowledgeBase() {
        return {
            totalIssues: 0,
            resolvedIssues: 0,
            errorPatterns: new Map(),
            performanceIssues: new Map(),
            securityIncidents: new Map(),
            commonSolutions: new Map(),
            aiLearningTags: new Set(),
            lastUpdated: new Date().toISOString(),
            statistics: {
                errorCategories: {},
                averageResolutionTime: null,
                mostCommonErrors: [],
                effectiveSolutions: []
            }
        };
    }

    /**
     * 서비스 상태 조회
     */
    getStatus() {
        return {
            version: this.version,
            solutionsDbPath: this.solutionsDbPath,
            cacheStatus: this.knowledgeCache ? 'loaded' : 'empty',
            lastCacheUpdate: this.lastCacheUpdate,
            cacheValidityMinutes: this.cacheValidityMinutes,
            knowledgeStats: this.knowledgeCache ? {
                totalIssues: this.knowledgeCache.totalIssues,
                resolvedIssues: this.knowledgeCache.resolvedIssues,
                errorPatternsCount: this.knowledgeCache.errorPatterns.size,
                performanceIssuesCount: this.knowledgeCache.performanceIssues.size,
                securityIncidentsCount: this.knowledgeCache.securityIncidents.size
            } : null
        };
    }
}

module.exports = SolutionsDbLearningService;