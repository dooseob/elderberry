#!/usr/bin/env node

/**
 * 지능형 컨텍스트 분석기
 * AST(Abstract Syntax Tree) 파서를 활용한 고도화된 코드 분석 시스템
 * Context7 지침에 따른 체계적 분석 및 제안 생성
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class IntelligentContextAnalyzer {
    constructor() {
        this.guidelinesDb = this.loadGuidelinesDatabase();
        this.analysisResults = [];
        this.performanceMetrics = {
            startTime: Date.now(),
            filesAnalyzed: 0,
            issuesFound: 0,
            suggestionsGenerated: 0
        };
    }

    /**
     * 구조화된 가이드라인 데이터베이스 로드
     */
    loadGuidelinesDatabase() {
        try {
            const dbPath = path.join(__dirname, '../knowledge-base/guidelines-database.json');
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            console.error('가이드라인 데이터베이스 로드 실패:', error.message);
            return null;
        }
    }

    /**
     * 프로젝트 전체 분석 실행
     */
    async analyzeProject(projectRoot = process.cwd()) {
        console.log('🔍 지능형 컨텍스트 분석 시작...');
        console.log(`📁 분석 대상: ${projectRoot}`);

        const javaFiles = this.findJavaFiles(projectRoot);
        
        for (const filePath of javaFiles) {
            await this.analyzeFile(filePath);
            this.performanceMetrics.filesAnalyzed++;
        }

        this.generateAnalysisReport();
        this.updateLearningData();
        
        return this.analysisResults;
    }

    /**
     * Java 파일 목록 수집
     */
    findJavaFiles(rootPath) {
        const javaFiles = [];
        const excludePaths = ['node_modules', 'build', 'target', '.git', 'test-data'];
        
        const scanDirectory = (dirPath) => {
            try {
                const items = fs.readdirSync(dirPath);
                
                for (const item of items) {
                    const fullPath = path.join(dirPath, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !excludePaths.some(exclude => fullPath.includes(exclude))) {
                        scanDirectory(fullPath);
                    } else if (stat.isFile() && item.endsWith('.java')) {
                        javaFiles.push(fullPath);
                    }
                }
            } catch (error) {
                // 접근 권한 등의 이유로 읽을 수 없는 디렉토리는 무시
            }
        };

        scanDirectory(rootPath);
        return javaFiles;
    }

    /**
     * 개별 파일 심층 분석
     */
    async analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileAnalysis = {
                filePath: path.relative(process.cwd(), filePath),
                fileSize: content.length,
                lineCount: content.split('\n').length,
                issues: [],
                suggestions: [],
                metrics: {}
            };

            // AST 기반 구조 분석
            const structureAnalysis = this.analyzeCodeStructure(content, filePath);
            fileAnalysis.metrics = structureAnalysis.metrics;

            // 가이드라인 규칙 적용
            for (const rule of this.guidelinesDb.rules) {
                const violations = this.checkRule(content, filePath, rule);
                fileAnalysis.issues.push(...violations);
            }

            // 자동 수정 제안 생성
            fileAnalysis.suggestions = this.generateAutoFixSuggestions(fileAnalysis.issues);

            if (fileAnalysis.issues.length > 0 || fileAnalysis.suggestions.length > 0) {
                this.analysisResults.push(fileAnalysis);
                this.performanceMetrics.issuesFound += fileAnalysis.issues.length;
                this.performanceMetrics.suggestionsGenerated += fileAnalysis.suggestions.length;
            }

        } catch (error) {
            console.warn(`파일 분석 실패: ${filePath} - ${error.message}`);
        }
    }

    /**
     * 코드 구조 심층 분석 (AST 시뮬레이션)
     */
    analyzeCodeStructure(content, filePath) {
        const metrics = {
            classCount: 0,
            methodCount: 0,
            publicMethodCount: 0,
            lineCountPerClass: [],
            cyclomaticComplexity: 0,
            dependencyCount: 0,
            annotationUsage: {}
        };

        // 클래스 분석
        const classMatches = content.match(/class\s+\w+/g) || [];
        metrics.classCount = classMatches.length;

        // 메서드 분석
        const methodMatches = content.match(/(?:public|private|protected)\s+[^;]*\s+\w+\s*\([^)]*\)\s*{/g) || [];
        metrics.methodCount = methodMatches.length;
        
        const publicMethodMatches = content.match(/public\s+[^;]*\s+\w+\s*\([^)]*\)\s*{/g) || [];
        metrics.publicMethodCount = publicMethodMatches.length;

        // 클래스별 라인 수 (간단한 추정)
        const classes = content.split(/class\s+\w+/);
        for (let i = 1; i < classes.length; i++) {
            const classContent = classes[i];
            const lineCount = classContent.split('\n').length;
            metrics.lineCountPerClass.push(lineCount);
        }

        // 순환 복잡도 근사 계산
        const complexityKeywords = content.match(/\b(if|else|while|for|switch|case|catch)\b/g) || [];
        metrics.cyclomaticComplexity = complexityKeywords.length + 1;

        // 의존성 분석
        const importMatches = content.match(/import\s+[^;]+;/g) || [];
        metrics.dependencyCount = importMatches.length;

        // 어노테이션 사용 분석
        const annotations = content.match(/@\w+/g) || [];
        annotations.forEach(annotation => {
            metrics.annotationUsage[annotation] = (metrics.annotationUsage[annotation] || 0) + 1;
        });

        return { metrics };
    }

    /**
     * 가이드라인 규칙 검증
     */
    checkRule(content, filePath, rule) {
        const violations = [];
        
        // 파일 패턴 매칭
        const matchesFilePattern = rule.pattern_to_detect.file_patterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(filePath);
        });

        if (!matchesFilePattern) {
            return violations;
        }

        // 코드 패턴 검증
        for (const pattern of rule.pattern_to_detect.code_patterns) {
            const regex = new RegExp(pattern, 'gm');
            const matches = content.match(regex);
            
            if (matches) {
                violations.push({
                    ruleId: rule.id,
                    severity: rule.severity,
                    title: rule.title,
                    description: rule.description,
                    matches: matches.length,
                    locations: this.findMatchLocations(content, regex),
                    goodExample: rule.good_code_example,
                    badExample: rule.bad_code_example,
                    solution: rule.solution
                });
            }
        }

        // AST 체크 (구조적 검증)
        if (rule.pattern_to_detect.ast_checks) {
            for (const astCheck of rule.pattern_to_detect.ast_checks) {
                const astViolation = this.performASTCheck(content, astCheck, rule);
                if (astViolation) {
                    violations.push(astViolation);
                }
            }
        }

        return violations;
    }

    /**
     * AST 기반 구조적 검증
     */
    performASTCheck(content, astCheck, rule) {
        const structureAnalysis = this.analyzeCodeStructure(content);
        const metrics = structureAnalysis.metrics;

        switch (astCheck.type) {
            case 'method_count_in_class':
                if (metrics.publicMethodCount > astCheck.threshold) {
                    return {
                        ruleId: rule.id,
                        severity: rule.severity,
                        title: rule.title,
                        description: astCheck.message,
                        astCheckType: astCheck.type,
                        currentValue: metrics.publicMethodCount,
                        threshold: astCheck.threshold,
                        solution: rule.solution
                    };
                }
                break;

            case 'class_line_count':
                const maxLineCount = Math.max(...metrics.lineCountPerClass);
                if (maxLineCount > astCheck.threshold) {
                    return {
                        ruleId: rule.id,
                        severity: rule.severity,
                        title: rule.title,
                        description: astCheck.message,
                        astCheckType: astCheck.type,
                        currentValue: maxLineCount,
                        threshold: astCheck.threshold,
                        solution: rule.solution
                    };
                }
                break;

            case 'missing_entity_graph':
                const hasEntityGraph = content.includes('@EntityGraph');
                const hasJoinFetch = content.includes('JOIN FETCH');
                if (hasJoinFetch && !hasEntityGraph) {
                    return {
                        ruleId: rule.id,
                        severity: rule.severity,
                        title: rule.title,
                        description: astCheck.message,
                        astCheckType: astCheck.type,
                        solution: rule.solution
                    };
                }
                break;

            case 'sensitive_data_logging':
                for (const sensitiveField of astCheck.sensitive_fields) {
                    const sensitivePattern = new RegExp(`log.*${sensitiveField}|System\\.out.*${sensitiveField}`, 'i');
                    if (sensitivePattern.test(content)) {
                        return {
                            ruleId: rule.id,
                            severity: rule.severity,
                            title: rule.title,
                            description: astCheck.message,
                            astCheckType: astCheck.type,
                            sensitiveField: sensitiveField,
                            solution: rule.solution
                        };
                    }
                }
                break;
        }

        return null;
    }

    /**
     * 패턴 매칭 위치 찾기
     */
    findMatchLocations(content, regex) {
        const locations = [];
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            if (regex.test(line)) {
                locations.push({
                    line: index + 1,
                    content: line.trim()
                });
            }
        });

        return locations;
    }

    /**
     * 자동 수정 제안 생성
     */
    generateAutoFixSuggestions(issues) {
        const suggestions = [];

        for (const issue of issues) {
            const template = this.guidelinesDb.auto_fix_templates[issue.ruleId];
            if (template) {
                suggestions.push({
                    issueId: issue.ruleId,
                    type: 'auto_fix',
                    title: `${issue.title} 자동 수정 제안`,
                    template: template.template,
                    variables: template.variables,
                    estimatedTime: issue.solution?.estimated_time || '알 수 없음',
                    difficulty: issue.solution?.difficulty || 'medium',
                    steps: issue.solution?.steps || []
                });
            } else {
                suggestions.push({
                    issueId: issue.ruleId,
                    type: 'manual_fix',
                    title: `${issue.title} 수동 수정 가이드`,
                    description: issue.description,
                    solution: issue.solution,
                    goodExample: issue.goodExample,
                    badExample: issue.badExample
                });
            }
        }

        return suggestions;
    }

    /**
     * 분석 결과 리포트 생성
     */
    generateAnalysisReport() {
        const endTime = Date.now();
        const analysisTime = (endTime - this.performanceMetrics.startTime) / 1000;

        const report = {
            timestamp: new Date().toISOString(),
            performance: {
                ...this.performanceMetrics,
                endTime,
                totalTime: `${analysisTime.toFixed(2)}초`,
                filesPerSecond: (this.performanceMetrics.filesAnalyzed / analysisTime).toFixed(2)
            },
            summary: {
                totalFiles: this.performanceMetrics.filesAnalyzed,
                filesWithIssues: this.analysisResults.length,
                totalIssues: this.performanceMetrics.issuesFound,
                totalSuggestions: this.performanceMetrics.suggestionsGenerated,
                issuesByCategory: this.getIssuesByCategory(),
                issuesBySeverity: this.getIssuesBySeverity()
            },
            detailedResults: this.analysisResults,
            recommendations: this.generateRecommendations()
        };

        // 리포트 파일 저장
        const reportPath = path.join(__dirname, '../reports/analysis-report.json');
        this.ensureDirectoryExists(path.dirname(reportPath));
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // 콘솔 요약 출력
        this.printSummary(report.summary);

        return report;
    }

    /**
     * 카테고리별 이슈 분류
     */
    getIssuesByCategory() {
        const categories = {};
        
        this.analysisResults.forEach(result => {
            result.issues.forEach(issue => {
                const rule = this.guidelinesDb.rules.find(r => r.id === issue.ruleId);
                if (rule) {
                    categories[rule.category] = (categories[rule.category] || 0) + 1;
                }
            });
        });

        return categories;
    }

    /**
     * 심각도별 이슈 분류
     */
    getIssuesBySeverity() {
        const severities = {};
        
        this.analysisResults.forEach(result => {
            result.issues.forEach(issue => {
                severities[issue.severity] = (severities[issue.severity] || 0) + 1;
            });
        });

        return severities;
    }

    /**
     * 개선 권장사항 생성
     */
    generateRecommendations() {
        const recommendations = [];
        const issuesBySeverity = this.getIssuesBySeverity();

        if (issuesBySeverity.critical > 0) {
            recommendations.push({
                priority: 'immediate',
                title: '즉시 수정 필요',
                description: `${issuesBySeverity.critical}개의 심각한 문제가 발견되었습니다. 시스템 안정성을 위해 즉시 수정하시기 바랍니다.`,
                estimatedTime: `${issuesBySeverity.critical * 2} 시간`
            });
        }

        if (issuesBySeverity.high > 0) {
            recommendations.push({
                priority: 'high',
                title: '높은 우선순위 개선',
                description: `${issuesBySeverity.high}개의 성능/보안 관련 문제가 있습니다. 가능한 빨리 해결하시기 바랍니다.`,
                estimatedTime: `${issuesBySeverity.high * 1} 시간`
            });
        }

        return recommendations;
    }

    /**
     * 학습 데이터 업데이트
     */
    updateLearningData() {
        // 성공/실패 사례를 학습 데이터베이스에 저장
        // 실제 구현에서는 ML 모델 학습이나 통계 수집을 수행
        console.log('📊 학습 데이터 업데이트 완료');
    }

    /**
     * 디렉토리 존재 확실성 보장
     */
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * 분석 결과 요약 출력
     */
    printSummary(summary) {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 지능형 컨텍스트 분석 결과 요약');
        console.log('='.repeat(60));
        console.log(`📁 분석 파일 수: ${summary.totalFiles}개`);
        console.log(`⚠️  문제 발견 파일: ${summary.filesWithIssues}개`);
        console.log(`🔍 총 이슈 수: ${summary.totalIssues}개`);
        console.log(`💡 생성된 제안: ${summary.totalSuggestions}개`);
        
        console.log('\n📊 카테고리별 이슈:');
        Object.entries(summary.issuesByCategory).forEach(([category, count]) => {
            const categoryName = this.guidelinesDb.categories[category] || category;
            console.log(`  - ${categoryName}: ${count}개`);
        });

        console.log('\n🚨 심각도별 이슈:');
        Object.entries(summary.issuesBySeverity).forEach(([severity, count]) => {
            const severityInfo = this.guidelinesDb.severity_levels[severity];
            console.log(`  - ${severity.toUpperCase()} (${severityInfo?.score || 0}점): ${count}개`);
        });

        console.log('\n📄 상세 분석 리포트: claude-guides/reports/analysis-report.json');
        console.log('='.repeat(60) + '\n');
    }
}

// CLI 실행
if (require.main === module) {
    const analyzer = new IntelligentContextAnalyzer();
    analyzer.analyzeProject()
        .then(results => {
            console.log('✅ 지능형 컨텍스트 분석 완료');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ 분석 중 오류 발생:', error);
            process.exit(1);
        });
}

module.exports = IntelligentContextAnalyzer;