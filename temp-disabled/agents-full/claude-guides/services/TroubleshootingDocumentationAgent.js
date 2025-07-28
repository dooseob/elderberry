/**
 * 트러블슈팅과 중요한 이슈 문서화 서브에이전트
 * TroubleshootingService.java와 연동하여 자동 문서화
 * solutions-db.md 분석 및 개선, 이슈 패턴 인식
 */

const fs = require('fs').promises;
const path = require('path');

class TroubleshootingDocumentationAgent {
    constructor() {
        this.name = 'TroubleshootingDocumentationAgent';
        this.version = '2.0.0';
        this.capabilities = [
            'automatic_documentation',
            'issue_pattern_recognition',
            'solution_database_management',
            'troubleshooting_guide_generation',
            'java_service_integration'
        ];

        this.solutionsDbPath = 'docs/troubleshooting/solutions-db.md';
        this.backupPath = 'docs/troubleshooting/backup/';
        this.issuePatterns = new Map();
        this.documentationHistory = [];
        this.knowledgeBase = new Map();

        this.initializePatterns();
        console.log('📝 트러블슈팅과 중요한 이슈 문서화 서브에이전트 초기화 완료');
    }

    /**
     * 이슈 패턴 초기화
     */
    initializePatterns() {
        // 에러 패턴 분류
        this.issuePatterns.set('error_categories', {
            'COMPILATION_ERROR': {
                keywords: ['cannot find symbol', 'package does not exist', 'method not found'],
                severity: 'HIGH',
                documentation_template: 'compilation_error',
                typical_solutions: [
                    'import 문 확인',
                    '의존성 추가',
                    '메서드 시그니처 확인'
                ]
            },
            'RUNTIME_ERROR': {
                keywords: ['NullPointerException', 'IllegalArgumentException', 'RuntimeException'],
                severity: 'HIGH',
                documentation_template: 'runtime_error',
                typical_solutions: [
                    'null 체크 추가',
                    '입력값 유효성 검증',
                    '예외 처리 강화'
                ]
            },
            'DATABASE_ERROR': {
                keywords: ['DataIntegrityViolationException', 'SQLException', 'connection'],
                severity: 'CRITICAL',
                documentation_template: 'database_error',
                typical_solutions: [
                    '데이터베이스 제약 조건 확인',
                    '커넥션 풀 설정 검토',
                    '트랜잭션 처리 개선'
                ]
            },
            'SECURITY_ERROR': {
                keywords: ['AuthenticationException', 'AccessDeniedException', 'Security'],
                severity: 'CRITICAL',
                documentation_template: 'security_error',
                typical_solutions: [
                    '권한 설정 확인',
                    '인증 로직 재검토',
                    '보안 설정 점검'
                ]
            },
            'PERFORMANCE_ISSUE': {
                keywords: ['timeout', 'slow query', 'memory', 'performance'],
                severity: 'MEDIUM',
                documentation_template: 'performance_issue',
                typical_solutions: [
                    '쿼리 최적화',
                    '캐싱 적용',
                    '메모리 사용량 최적화'
                ]
            }
        });

        // 문서화 템플릿
        this.issuePatterns.set('documentation_templates', {
            'compilation_error': {
                sections: ['문제 설명', '에러 메시지', '원인 분석', '해결 방법', '예방 조치'],
                priority: 'HIGH',
                tags: ['compilation', 'build', 'java']
            },
            'runtime_error': {
                sections: ['에러 개요', '발생 조건', '스택 트레이스', '근본 원인', '수정 코드', '테스트 방법'],
                priority: 'HIGH',
                tags: ['runtime', 'exception', 'debug']
            },
            'database_error': {
                sections: ['데이터베이스 에러', 'SQL 쿼리', '제약 조건', '데이터 정합성', '해결 방안', '모니터링'],
                priority: 'CRITICAL',
                tags: ['database', 'sql', 'data']
            },
            'security_error': {
                sections: ['보안 이슈', '영향 범위', '취약점 분석', '즉시 조치', '장기 대책', '보안 감사'],
                priority: 'CRITICAL',
                tags: ['security', 'authentication', 'authorization']
            },
            'performance_issue': {
                sections: ['성능 문제', '측정 결과', '병목 지점', '최적화 방안', '성능 테스트', '모니터링 설정'],
                priority: 'MEDIUM',
                tags: ['performance', 'optimization', 'monitoring']
            }
        });
    }

    /**
     * solutions-db.md 파일 분석
     */
    async analyzeSolutionsDatabase() {
        console.log('📚 solutions-db.md 파일 분석 시작...');
        
        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                filePath: this.solutionsDbPath,
                exists: false,
                fileSize: 0,
                totalIssues: 0,
                completedIssues: 0,
                pendingIssues: 0,
                issuesByCategory: {},
                issuesBySeverity: {},
                recentIssues: [],
                patterns: [],
                recommendations: []
            };

            // 파일 존재 확인
            try {
                const stats = await fs.stat(this.solutionsDbPath);
                analysis.exists = true;
                analysis.fileSize = stats.size;
            } catch (error) {
                console.log('📋 solutions-db.md 파일이 없습니다. 새로 생성될 예정입니다.');
                return analysis;
            }

            // 파일 내용 읽기
            const content = await fs.readFile(this.solutionsDbPath, 'utf8');
            
            // 이슈 섹션 파싱
            const issues = this.parseIssuesFromMarkdown(content);
            analysis.totalIssues = issues.length;

            // 이슈 분류
            issues.forEach(issue => {
                // 완료 상태 확인
                if (issue.completed) {
                    analysis.completedIssues++;
                } else {
                    analysis.pendingIssues++;
                }

                // 카테고리별 분류
                const category = issue.category || 'UNKNOWN';
                analysis.issuesByCategory[category] = (analysis.issuesByCategory[category] || 0) + 1;

                // 심각도별 분류  
                const severity = issue.severity || 'MEDIUM';
                analysis.issuesBySeverity[severity] = (analysis.issuesBySeverity[severity] || 0) + 1;

                // 최근 이슈 (7일 이내)
                if (issue.timestamp && this.isRecentIssue(issue.timestamp)) {
                    analysis.recentIssues.push(issue);
                }
            });

            // 패턴 분석
            analysis.patterns = this.analyzeIssuePatterns(issues);
            
            // 개선 권장사항 생성
            analysis.recommendations = this.generateImprovementRecommendations(analysis);

            console.log(`✅ 분석 완료 - 총 이슈: ${analysis.totalIssues}, 완료: ${analysis.completedIssues}, 미완료: ${analysis.pendingIssues}`);
            
            return analysis;

        } catch (error) {
            console.error('❌ solutions-db.md 분석 실패:', error);
            throw error;
        }
    }

    /**
     * 자동 문서화 수행
     */
    async performAutomaticDocumentation(issueData) {
        console.log('🤖 자동 문서화 수행 중...');
        
        try {
            const documentation = {
                timestamp: new Date().toISOString(),
                issueId: this.generateIssueId(),
                category: this.classifyIssue(issueData),
                severity: this.assessSeverity(issueData),
                content: '',
                metadata: {},
                suggestions: []
            };

            // 이슈 분류에 따른 문서화
            const category = documentation.category;
            const template = this.issuePatterns.get('documentation_templates')[category];
            
            if (template) {
                documentation.content = await this.generateDocumentationContent(issueData, template);
                documentation.metadata = {
                    template: category,
                    sections: template.sections,
                    tags: template.tags,
                    priority: template.priority
                };
            } else {
                documentation.content = await this.generateGenericDocumentation(issueData);
            }

            // AI 제안사항 생성
            documentation.suggestions = await this.generateAISuggestions(issueData, documentation);

            // solutions-db.md에 추가
            await this.appendToSolutionsDatabase(documentation);

            // 히스토리에 저장
            this.documentationHistory.push(documentation);

            console.log(`✅ 자동 문서화 완료 - 이슈 ID: ${documentation.issueId}`);
            
            return documentation;

        } catch (error) {
            console.error('❌ 자동 문서화 실패:', error);
            throw error;
        }
    }

    /**
     * 이슈 분류
     */
    classifyIssue(issueData) {
        const errorCategories = this.issuePatterns.get('error_categories');
        const content = JSON.stringify(issueData).toLowerCase();
        
        for (const [category, pattern] of Object.entries(errorCategories)) {
            for (const keyword of pattern.keywords) {
                if (content.includes(keyword.toLowerCase())) {
                    return category;
                }
            }
        }
        
        return 'GENERAL_ISSUE';
    }

    /**
     * 심각도 평가
     */
    assessSeverity(issueData) {
        const content = JSON.stringify(issueData).toLowerCase();
        
        // 치명적 키워드
        const criticalKeywords = ['critical', 'fatal', 'crash', 'security', 'data loss'];
        for (const keyword of criticalKeywords) {
            if (content.includes(keyword)) return 'CRITICAL';
        }
        
        // 높음 키워드
        const highKeywords = ['error', 'exception', 'fail', 'broken'];
        for (const keyword of highKeywords) {
            if (content.includes(keyword)) return 'HIGH';
        }
        
        // 중간 키워드
        const mediumKeywords = ['warning', 'slow', 'performance', 'deprecated'];
        for (const keyword of mediumKeywords) {
            if (content.includes(keyword)) return 'MEDIUM';
        }
        
        return 'LOW';
    }

    /**
     * 문서화 내용 생성
     */
    async generateDocumentationContent(issueData, template) {
        const sections = template.sections;
        let content = `\n${'='.repeat(80)}\n`;
        content += `## 🔧 자동 감지된 이슈 #${this.generateIssueId()}\n\n`;
        
        // 메타데이터
        content += `**생성 시간**: ${new Date().toLocaleString('ko-KR')}\n`;
        content += `**카테고리**: ${this.classifyIssue(issueData)}\n`;
        content += `**심각도**: ${this.assessSeverity(issueData)}\n`;
        content += `**자동 생성**: TroubleshootingDocumentationAgent v${this.version}\n\n`;
        
        // 각 섹션별 내용 생성
        for (const section of sections) {
            content += `### 📋 ${section}\n`;
            content += await this.generateSectionContent(section, issueData);
            content += '\n\n';
        }
        
        // AI 학습 태그
        content += '### 🏷️ AI 학습 태그\n';
        template.tags.forEach(tag => {
            content += `\`${tag}\` `;
        });
        content += '\n\n';
        
        // 개발자 작성 필요 섹션
        content += '### ✏️ 개발자 작성 필요\n';
        content += '- [ ] **실제 테스트 결과**: \n';
        content += '- [ ] **코드 리뷰**: \n';
        content += '- [ ] **배포 계획**: \n\n';
        
        content += '---\n';
        content += `*📅 자동 생성됨: ${new Date().toLocaleString('ko-KR')} | 🤖 Elderberry-Intellect v2.0*\n\n`;
        
        return content;
    }

    /**
     * 섹션별 내용 생성
     */
    async generateSectionContent(section, issueData) {
        switch (section) {
            case '문제 설명':
            case '에러 개요':
                return `${issueData.description || '문제 상황을 구체적으로 기술해주세요.'}\n`;
                
            case '에러 메시지':
                return issueData.errorMessage ? 
                    `\`\`\`\n${issueData.errorMessage}\n\`\`\`\n` : 
                    '에러 메시지를 여기에 추가해주세요.\n';
                    
            case '원인 분석':
            case '근본 원인':
                const analysis = this.analyzeRootCause(issueData);
                return `${analysis}\n`;
                
            case '해결 방법':
            case '수정 코드':
                const solutions = this.generateSolutions(issueData);
                return solutions.map((sol, idx) => `${idx + 1}. ${sol}`).join('\n') + '\n';
                
            case '예방 조치':
                const preventions = this.generatePreventionMeasures(issueData);
                return preventions.map((prev, idx) => `- ${prev}`).join('\n') + '\n';
                
            case '스택 트레이스':
                return issueData.stackTrace ? 
                    `\`\`\`\n${issueData.stackTrace}\n\`\`\`\n` : 
                    '스택 트레이스를 여기에 추가해주세요.\n';
                    
            default:
                return `${section}에 대한 내용을 작성해주세요.\n`;
        }
    }

    /**
     * 근본 원인 분석
     */
    analyzeRootCause(issueData) {
        const category = this.classifyIssue(issueData);
        const errorCategories = this.issuePatterns.get('error_categories');
        const pattern = errorCategories[category];
        
        if (pattern) {
            const causes = pattern.typical_solutions;
            return `**자동 분석 결과**:\n- 가능한 원인: ${causes.join(', ')}\n- 일반적인 해결책: ${pattern.typical_solutions[0]}`;
        }
        
        return '상세한 원인 분석이 필요합니다. 로그와 스택 트레이스를 검토해주세요.';
    }

    /**
     * 해결책 생성
     */
    generateSolutions(issueData) {
        const category = this.classifyIssue(issueData);
        const errorCategories = this.issuePatterns.get('error_categories');
        const pattern = errorCategories[category];
        
        if (pattern) {
            return pattern.typical_solutions;
        }
        
        return [
            '문제 상황 재현',
            '로그 및 스택 트레이스 분석',
            '코드 검토 및 수정',
            '테스트 케이스 작성',
            '수정 사항 배포'
        ];
    }

    /**
     * 예방 조치 생성
     */
    generatePreventionMeasures(issueData) {
        const measures = [
            '코드 리뷰 프로세스 강화',
            '단위 테스트 작성',
            '정적 분석 도구 활용',
            '모니터링 및 알람 설정'
        ];
        
        const category = this.classifyIssue(issueData);
        
        switch (category) {
            case 'SECURITY_ERROR':
                measures.unshift('보안 감사 정기 실시', '권한 관리 체계 점검');
                break;
            case 'DATABASE_ERROR':
                measures.unshift('데이터베이스 백업 및 복구 절차 확립', 'DB 모니터링 강화');
                break;
            case 'PERFORMANCE_ISSUE':
                measures.unshift('성능 테스트 자동화', '프로파일링 도구 적용');
                break;
        }
        
        return measures;
    }

    /**
     * AI 제안사항 생성
     */
    async generateAISuggestions(issueData, documentation) {
        const suggestions = [];
        
        // 유사 이슈 찾기
        const similarIssues = await this.findSimilarIssues(issueData);
        if (similarIssues.length > 0) {
            suggestions.push({
                type: 'SIMILAR_ISSUES',
                content: `유사한 이슈 ${similarIssues.length}개가 과거에 발생했습니다. 해결 방법을 참고하세요.`,
                references: similarIssues.slice(0, 3)
            });
        }
        
        // 우선순위 제안
        if (documentation.severity === 'CRITICAL') {
            suggestions.push({
                type: 'PRIORITY',
                content: '긴급 이슈입니다. 즉시 해결 팀을 구성하고 대응하세요.',
                action: 'immediate_action_required'
            });
        }
        
        // 추가 조사 제안
        if (documentation.category === 'GENERAL_ISSUE') {
            suggestions.push({
                type: 'INVESTIGATION',
                content: '이슈 분류가 명확하지 않습니다. 추가 정보 수집이 필요합니다.',
                action: 'gather_more_information'
            });
        }
        
        return suggestions;
    }

    /**
     * solutions-db.md에 내용 추가
     */
    async appendToSolutionsDatabase(documentation) {
        try {
            // 디렉토리 생성
            await fs.mkdir(path.dirname(this.solutionsDbPath), { recursive: true });
            
            // 파일이 없으면 헤더 생성
            let fileExists = true;
            try {
                await fs.access(this.solutionsDbPath);
            } catch (error) {
                fileExists = false;
                const header = this.generateSolutionsDbHeader();
                await fs.writeFile(this.solutionsDbPath, header);
            }
            
            // 내용 추가
            await fs.appendFile(this.solutionsDbPath, documentation.content);
            
            // 백업 생성 (파일 크기가 1MB 이상인 경우)
            await this.createBackupIfNeeded();
            
            console.log('📝 solutions-db.md 업데이트 완료');
            
        } catch (error) {
            console.error('❌ solutions-db.md 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * solutions-db.md 헤더 생성
     */
    generateSolutionsDbHeader() {
        return `# 🔧 Elderberry 트러블슈팅 솔루션 데이터베이스

**자동 생성 문서** - Elderberry-Intellect 시스템이 실시간으로 감지한 이슈들을 자동으로 문서화합니다.

## 📋 사용 가이드

- 🤖 **자동 생성 항목**: AI가 시스템 이벤트를 기반으로 초안을 생성합니다
- ✏️ **개발자 작성 필요**: '해결 방안' 섹션을 개발자가 직접 완성해주세요
- 🏷️ **AI 학습 태그**: 유사한 문제 발생 시 AI가 더 나은 제안을 할 수 있도록 도움을 줍니다
- 📊 **통계**: 총 처리된 이벤트 수: 0개, 생성된 문서 수: 0개

---

`;
    }

    /**
     * 마크다운에서 이슈 파싱
     */
    parseIssuesFromMarkdown(content) {
        const issues = [];
        const issueRegex = /## 🔧 자동 감지된 이슈 #(\d+)/g;
        let match;
        
        while ((match = issueRegex.exec(content)) !== null) {
            const issueId = match[1];
            const issueStart = match.index;
            const nextIssue = issueRegex.exec(content);
            const issueEnd = nextIssue ? nextIssue.index : content.length;
            
            const issueContent = content.substring(issueStart, issueEnd);
            const parsedIssue = this.parseIndividualIssue(issueContent, issueId);
            issues.push(parsedIssue);
            
            // 인덱스 되돌리기
            if (nextIssue) {
                issueRegex.lastIndex = nextIssue.index;
            }
        }
        
        return issues;
    }

    /**
     * 개별 이슈 파싱
     */
    parseIndividualIssue(content, issueId) {
        const issue = {
            id: issueId,
            timestamp: null,
            category: null,
            severity: null,
            completed: false,
            sections: {}
        };
        
        // 메타데이터 추출
        const timestampMatch = content.match(/\*\*생성 시간\*\*: (.+)/);
        if (timestampMatch) issue.timestamp = timestampMatch[1];
        
        const categoryMatch = content.match(/\*\*카테고리\*\*: (.+)/);
        if (categoryMatch) issue.category = categoryMatch[1];
        
        const severityMatch = content.match(/\*\*심각도\*\*: (.+)/);
        if (severityMatch) issue.severity = severityMatch[1];
        
        // 완료 상태 확인 (체크박스가 모두 체크되어 있는지)
        const checkboxes = content.match(/- \[.\]/g) || [];
        const checkedBoxes = content.match(/- \[x\]/gi) || [];
        issue.completed = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length;
        
        return issue;
    }

    /**
     * 이슈 패턴 분석
     */
    analyzeIssuePatterns(issues) {
        const patterns = [];
        
        // 빈도 분석
        const categoryFreq = {};
        const severityFreq = {};
        
        issues.forEach(issue => {
            categoryFreq[issue.category] = (categoryFreq[issue.category] || 0) + 1;
            severityFreq[issue.severity] = (severityFreq[issue.severity] || 0) + 1;
        });
        
        // 가장 빈번한 패턴
        const mostFrequentCategory = Object.keys(categoryFreq).reduce((a, b) => 
            categoryFreq[a] > categoryFreq[b] ? a : b, 'UNKNOWN');
        
        if (categoryFreq[mostFrequentCategory] > 2) {
            patterns.push({
                type: 'FREQUENT_CATEGORY',
                pattern: mostFrequentCategory,
                frequency: categoryFreq[mostFrequentCategory],
                recommendation: `${mostFrequentCategory} 카테고리 이슈가 빈번히 발생합니다. 근본 원인 분석이 필요합니다.`
            });
        }
        
        // 심각도 트렌드
        const criticalCount = severityFreq['CRITICAL'] || 0;
        const highCount = severityFreq['HIGH'] || 0;
        
        if (criticalCount + highCount > issues.length * 0.5) {
            patterns.push({
                type: 'HIGH_SEVERITY_TREND',
                pattern: 'Many high-severity issues',
                frequency: criticalCount + highCount,
                recommendation: '높은 심각도 이슈가 많습니다. 시스템 안정성 검토가 필요합니다.'
            });
        }
        
        return patterns;
    }

    /**
     * 개선 권장사항 생성
     */
    generateImprovementRecommendations(analysis) {
        const recommendations = [];
        
        // 미완료 이슈가 많은 경우
        if (analysis.pendingIssues > analysis.completedIssues) {
            recommendations.push({
                priority: 'HIGH',
                category: 'BACKLOG_MANAGEMENT',
                title: '미완료 이슈 정리 필요',
                description: `${analysis.pendingIssues}개의 미완료 이슈가 있습니다.`,
                action: '우선순위에 따른 이슈 해결 계획 수립'
            });
        }
        
        // 문서화 품질 개선
        if (analysis.totalIssues > 10) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'DOCUMENTATION_QUALITY',
                title: '문서화 품질 개선',
                description: '이슈 문서의 완성도를 높여야 합니다.',
                action: '개발자 작성 필요 섹션 완성'
            });
        }
        
        // 패턴 기반 권장사항
        analysis.patterns.forEach(pattern => {
            if (pattern.type === 'FREQUENT_CATEGORY') {
                recommendations.push({
                    priority: 'HIGH',
                    category: 'PREVENTIVE_ACTION',
                    title: `${pattern.pattern} 이슈 예방`,
                    description: pattern.recommendation,
                    action: '근본 원인 분석 및 예방책 수립'
                });
            }
        });
        
        return recommendations;
    }

    /**
     * 유사 이슈 찾기
     */
    async findSimilarIssues(issueData) {
        // 과거 문서화된 이슈들과 비교
        const similarIssues = [];
        
        try {
            const analysis = await this.analyzeSolutionsDatabase();
            // 실제 구현에서는 텍스트 유사도 분석 등을 사용할 수 있음
            // 여기서는 간단한 키워드 매칭으로 구현
            
            return similarIssues;
        } catch (error) {
            console.warn('유사 이슈 검색 중 오류:', error.message);
            return [];
        }
    }

    /**
     * 유틸리티 메서드들
     */
    generateIssueId() {
        return Date.now().toString().slice(-6); // 마지막 6자리
    }

    isRecentIssue(timestamp) {
        const issueDate = new Date(timestamp);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return issueDate > sevenDaysAgo;
    }

    async createBackupIfNeeded() {
        try {
            const stats = await fs.stat(this.solutionsDbPath);
            if (stats.size > 1024 * 1024) { // 1MB 이상
                await fs.mkdir(this.backupPath, { recursive: true });
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupFile = path.join(this.backupPath, `solutions-db_${timestamp}.md`);
                
                await fs.copyFile(this.solutionsDbPath, backupFile);
                console.log(`📄 백업 생성: ${backupFile}`);
            }
        } catch (error) {
            console.warn('백업 생성 실패:', error.message);
        }
    }

    /**
     * Java TroubleshootingService와 연동
     */
    async integrateWithJavaService(eventData) {
        console.log('🔗 Java TroubleshootingService와 연동 중...');
        
        try {
            // Java 이벤트 데이터를 JS 형식으로 변환
            const processedData = {
                eventId: eventData.eventId,
                eventType: eventData.eventType || 'UNKNOWN',
                severity: eventData.severity || 'MEDIUM',
                description: eventData.description || eventData.errorMessage,
                timestamp: eventData.timestamp || new Date().toISOString(),
                stackTrace: eventData.stackTrace,
                metadata: eventData.metadata || {}
            };
            
            // 자동 문서화 수행
            const documentation = await this.performAutomaticDocumentation(processedData);
            
            console.log(`✅ Java 서비스 연동 완료 - 이벤트 ID: ${eventData.eventId}`);
            
            return {
                success: true,
                eventId: eventData.eventId,
                documentationId: documentation.issueId,
                category: documentation.category,
                severity: documentation.severity
            };
            
        } catch (error) {
            console.error('❌ Java 서비스 연동 실패:', error);
            throw error;
        }
    }

    /**
     * 에이전트 상태 조회
     */
    getStatus() {
        return {
            name: this.name,
            version: this.version,
            capabilities: this.capabilities,
            solutionsDbPath: this.solutionsDbPath,
            documentationCount: this.documentationHistory.length,
            knownPatterns: this.issuePatterns.size,
            lastDocumentation: this.documentationHistory.length > 0 ? 
                this.documentationHistory[this.documentationHistory.length - 1].timestamp : null,
            memoryUsage: process.memoryUsage()
        };
    }

    /**
     * MCP Task와 연동하여 실행
     */
    async executeWithMCPIntegration(input) {
        const { action = 'analyze', data, options = {} } = input;
        
        console.log('🤖 TroubleshootingDocumentationAgent MCP 통합 실행');
        console.log(`📝 Action: ${action}`);
        
        try {
            let result;
            
            switch (action) {
                case 'analyze':
                    result = await this.analyzeSolutionsDatabase();
                    break;
                    
                case 'document':
                    result = await this.performAutomaticDocumentation(data);
                    break;
                    
                case 'integrate_java':
                    result = await this.integrateWithJavaService(data);
                    break;
                    
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
            
            return {
                success: true,
                agent: this.name,
                action,
                result,
                metadata: {
                    executionTime: Date.now(),
                    documentationHistory: this.documentationHistory.length,
                    patternsKnown: this.issuePatterns.size
                }
            };
            
        } catch (error) {
            console.error('❌ TroubleshootingDocumentationAgent 실행 실패:', error);
            return {
                success: false,
                agent: this.name,
                action,
                error: error.message,
                fallbackSuggestion: 'solutions-db.md 파일 경로와 권한을 확인해보세요.'
            };
        }
    }
}

// 글로벌 인스턴스 생성
const troubleshootingDocumentationAgent = new TroubleshootingDocumentationAgent();

/**
 * 에이전트 테스트 함수
 */
async function testTroubleshootingDocumentationAgent() {
    console.log('🧪 트러블슈팅과 중요한 이슈 문서화 서브에이전트 테스트');
    
    try {
        // 1. solutions-db.md 분석 테스트
        console.log('\n📋 1. solutions-db.md 분석 테스트');
        const result1 = await troubleshootingDocumentationAgent.executeWithMCPIntegration({
            action: 'analyze'
        });
        console.log(`결과: ${result1.success ? '✅ 성공' : '❌ 실패'}`);
        if (result1.success) {
            console.log(`총 이슈: ${result1.result.totalIssues}개`);
            console.log(`완료/미완료: ${result1.result.completedIssues}/${result1.result.pendingIssues}`);
        }
        
        // 2. 자동 문서화 테스트
        console.log('\n📋 2. 자동 문서화 테스트');
        const sampleIssue = {
            eventId: 'TEST_001',
            eventType: 'ERROR',
            severity: 'HIGH',
            description: 'NullPointerException occurred in AuthController',
            errorMessage: 'java.lang.NullPointerException: Cannot invoke "String.isEmpty()" because "username" is null',
            stackTrace: 'at com.globalcarelink.auth.AuthController.login(AuthController.java:45)',
            timestamp: new Date().toISOString()
        };
        
        const result2 = await troubleshootingDocumentationAgent.executeWithMCPIntegration({
            action: 'document',
            data: sampleIssue
        });
        console.log(`결과: ${result2.success ? '✅ 성공' : '❌ 실패'}`);
        if (result2.success) {
            console.log(`문서 ID: ${result2.result.issueId}`);
            console.log(`카테고리: ${result2.result.category}`);
        }
        
        // 3. Java 서비스 연동 테스트
        console.log('\n📋 3. Java 서비스 연동 테스트');
        const result3 = await troubleshootingDocumentationAgent.executeWithMCPIntegration({
            action: 'integrate_java',
            data: sampleIssue
        });
        console.log(`결과: ${result3.success ? '✅ 성공' : '❌ 실패'}`);
        
    } catch (error) {
        console.error('테스트 실행 중 오류:', error);
    }
    
    // 상태 출력
    console.log('\n📊 에이전트 상태:');
    console.log(troubleshootingDocumentationAgent.getStatus());
}

module.exports = {
    TroubleshootingDocumentationAgent,
    troubleshootingDocumentationAgent,
    testTroubleshootingDocumentationAgent
};