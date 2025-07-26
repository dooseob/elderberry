/**
 * API 문서화 분석 에이전트
 * 
 * Swagger/OpenAPI 문서화 품질 분석 및 실제 코드와의 일치성 검증
 * - SpringDoc OpenAPI 문서 분석
 * - API 엔드포인트와 문서 일치성 검증
 * - API 문서화 완성도 평가
 * - API 설계 품질 분석
 */

const path = require('path');
const fs = require('fs').promises;
const logger = require('./DocumentLearningService').logger;

class ApiDocumentationAnalysisAgent {
    constructor() {
        this.initialized = false;
        this.projectRoot = process.cwd();
        
        // API 분석 캐시
        this.apiCache = new Map();
        this.documentationCache = new Map();
    }

    async initialize() {
        try {
            logger.info('API 문서화 분석 에이전트 초기화 시작');

            // OpenAPI 설정 확인
            await this.checkOpenApiConfiguration();

            // 기존 API 문서 로드
            await this.loadExistingApiDocumentation();

            this.initialized = true;
            logger.info('API 문서화 분석 에이전트 초기화 완료');

        } catch (error) {
            logger.error('API 문서화 분석 에이전트 초기화 실패', error);
            throw error;
        }
    }

    /**
     * API 문서화 종합 분석
     */
    async analyze(options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const {
            projectPath,
            includeEndpointAnalysis = true,
            includeDocumentationQuality = true,
            includeConsistencyCheck = true,
            includeSecurityAnalysis = true
        } = options;

        logger.info('API 문서화 분석 시작', { projectPath });

        try {
            const analysisResults = {
                timestamp: new Date().toISOString(),
                projectPath,
                results: {}
            };

            // 1. API 엔드포인트 분석
            if (includeEndpointAnalysis) {
                analysisResults.results.endpoints = await this.analyzeApiEndpoints(projectPath);
            }

            // 2. 문서화 품질 분석
            if (includeDocumentationQuality) {
                analysisResults.results.documentationQuality = await this.analyzeDocumentationQuality(projectPath);
            }

            // 3. 코드-문서 일치성 검증
            if (includeConsistencyCheck) {
                analysisResults.results.consistency = await this.analyzeCodeDocConsistency(projectPath);
            }

            // 4. API 보안 문서화 분석
            if (includeSecurityAnalysis) {
                analysisResults.results.security = await this.analyzeApiSecurityDocumentation(projectPath);
            }

            // 5. 종합 점수 계산
            analysisResults.scores = this.calculateApiDocumentationScores(analysisResults.results);

            // 6. 개선 권장사항 생성
            analysisResults.recommendations = await this.generateApiDocRecommendations(analysisResults);

            logger.info('API 문서화 분석 완료', {
                endpointCount: analysisResults.results.endpoints?.totalEndpoints || 0,
                documentationScore: analysisResults.scores.documentationScore,
                consistencyScore: analysisResults.scores.consistencyScore
            });

            return analysisResults;

        } catch (error) {
            logger.error('API 문서화 분석 실패', error);
            throw error;
        }
    }

    /**
     * OpenAPI 설정 확인
     */
    async checkOpenApiConfiguration() {
        try {
            // build.gradle.kts에서 SpringDoc 의존성 확인
            const gradlePath = path.join(this.projectRoot, 'build.gradle.kts');
            const gradleContent = await fs.readFile(gradlePath, 'utf8');
            
            const hasSpringDoc = gradleContent.includes('springdoc-openapi');
            const hasSwaggerUI = gradleContent.includes('webmvc-ui');

            // application.yml에서 OpenAPI 설정 확인
            const configPath = path.join(this.projectRoot, 'src/main/resources/application.yml');
            let hasOpenApiConfig = false;
            
            try {
                const configContent = await fs.readFile(configPath, 'utf8');
                hasOpenApiConfig = configContent.includes('springdoc') || configContent.includes('openapi');
            } catch (error) {
                // 설정 파일 없음 - 기본 설정 사용
            }

            this.openApiConfig = {
                hasSpringDoc,
                hasSwaggerUI,
                hasOpenApiConfig,
                isConfigured: hasSpringDoc && hasSwaggerUI
            };

            logger.info('OpenAPI 설정 확인 완료', this.openApiConfig);

        } catch (error) {
            logger.warn('OpenAPI 설정 확인 실패', error);
            this.openApiConfig = { isConfigured: false };
        }
    }

    /**
     * API 엔드포인트 분석
     */
    async analyzeApiEndpoints(projectPath) {
        try {
            const analysis = {
                totalEndpoints: 0,
                documentedEndpoints: 0,
                undocumentedEndpoints: [],
                endpointDetails: [],
                httpMethods: {},
                pathPatterns: []
            };

            // Controller 파일들 찾기
            const controllerFiles = await this.findControllerFiles(projectPath);

            for (const filePath of controllerFiles) {
                const endpoints = await this.extractEndpointsFromController(filePath);
                analysis.endpointDetails.push(...endpoints);
                analysis.totalEndpoints += endpoints.length;

                // 문서화 여부 확인
                endpoints.forEach(endpoint => {
                    if (endpoint.hasDocumentation) {
                        analysis.documentedEndpoints++;
                    } else {
                        analysis.undocumentedEndpoints.push(endpoint);
                    }

                    // HTTP 메서드 통계
                    analysis.httpMethods[endpoint.method] = (analysis.httpMethods[endpoint.method] || 0) + 1;
                });
            }

            // 경로 패턴 분석
            analysis.pathPatterns = this.analyzePathPatterns(analysis.endpointDetails);

            return analysis;

        } catch (error) {
            logger.error('API 엔드포인트 분석 실패', error);
            return { totalEndpoints: 0, documentedEndpoints: 0, undocumentedEndpoints: [], endpointDetails: [] };
        }
    }

    /**
     * Controller 파일에서 엔드포인트 추출
     */
    async extractEndpointsFromController(filePath) {
        const endpoints = [];

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            let currentClass = '';
            let baseMapping = '';

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();
                
                // 클래스 이름 추출
                if (trimmedLine.includes('public class') && trimmedLine.includes('Controller')) {
                    const classMatch = trimmedLine.match(/class\s+(\w+)/);
                    if (classMatch) {
                        currentClass = classMatch[1];
                    }
                }

                // RequestMapping 기본 경로 추출
                if (trimmedLine.includes('@RequestMapping')) {
                    const pathMatch = trimmedLine.match(/["\']([^"\']+)["\']/);
                    if (pathMatch) {
                        baseMapping = pathMatch[1];
                    }
                }

                // HTTP 메서드 매핑 추출
                const httpMethods = ['GetMapping', 'PostMapping', 'PutMapping', 'DeleteMapping', 'PatchMapping'];
                
                httpMethods.forEach(methodType => {
                    if (trimmedLine.includes(`@${methodType}`)) {
                        const method = methodType.replace('Mapping', '').toUpperCase();
                        let path = '';
                        
                        const pathMatch = trimmedLine.match(/["\']([^"\']+)["\']/);
                        if (pathMatch) {
                            path = baseMapping + pathMatch[1];
                        } else {
                            path = baseMapping;
                        }

                        // 다음 줄에서 메서드 이름 찾기
                        let methodName = '';
                        if (index + 1 < lines.length) {
                            const nextLine = lines[index + 1].trim();
                            const methodMatch = nextLine.match(/public\s+\w+\s+(\w+)\s*\(/);
                            if (methodMatch) {
                                methodName = methodMatch[1];
                            }
                        }

                        // 문서화 어노테이션 확인
                        const hasApiOperation = this.checkForApiDocumentation(lines, index);
                        
                        endpoints.push({
                            controller: currentClass,
                            method: method,
                            path: path.replace('//', '/'),
                            methodName,
                            hasDocumentation: hasApiOperation.hasDoc,
                            documentationQuality: hasApiOperation.quality,
                            line: index + 1,
                            file: filePath
                        });
                    }
                });
            });

        } catch (error) {
            logger.warn(`Controller 파일 분석 실패: ${filePath}`, error);
        }

        return endpoints;
    }

    /**
     * API 문서화 어노테이션 확인
     */
    checkForApiDocumentation(lines, currentIndex) {
        const result = {
            hasDoc: false,
            quality: 0
        };

        // 현재 라인 위쪽 5줄 확인
        for (let i = Math.max(0, currentIndex - 5); i < currentIndex; i++) {
            const line = lines[i].trim();
            
            // OpenAPI 3.0 어노테이션
            if (line.includes('@Operation')) {
                result.hasDoc = true;
                result.quality += 30;
                
                // 설명 품질 확인
                if (line.includes('summary') || line.includes('description')) {
                    result.quality += 20;
                }
            }

            if (line.includes('@ApiResponse')) {
                result.quality += 20;
            }

            if (line.includes('@Parameter')) {
                result.quality += 15;
            }

            if (line.includes('@Tag')) {
                result.quality += 10;
            }

            // 구 Swagger 2.0 어노테이션 (호환성)
            if (line.includes('@ApiOperation')) {
                result.hasDoc = true;
                result.quality += 25;
            }

            if (line.includes('@ApiParam')) {
                result.quality += 15;
            }
        }

        result.quality = Math.min(100, result.quality);
        return result;
    }

    /**
     * 문서화 품질 분석
     */
    async analyzeDocumentationQuality(projectPath) {
        try {
            const analysis = {
                overallQuality: 0,
                qualityIssues: [],
                bestPracticeViolations: [],
                missingDocumentation: [],
                excellentExamples: []
            };

            // Controller 파일들에서 문서화 품질 검사
            const controllerFiles = await this.findControllerFiles(projectPath);

            for (const filePath of controllerFiles) {
                const qualityIssues = await this.analyzeControllerDocQuality(filePath);
                analysis.qualityIssues.push(...qualityIssues.issues);
                analysis.bestPracticeViolations.push(...qualityIssues.violations);
                analysis.missingDocumentation.push(...qualityIssues.missing);
                analysis.excellentExamples.push(...qualityIssues.excellent);
            }

            // DTO 클래스 문서화 품질 검사
            const dtoFiles = await this.findDtoFiles(projectPath);
            
            for (const filePath of dtoFiles) {
                const dtoQuality = await this.analyzeDtoDocQuality(filePath);
                analysis.qualityIssues.push(...dtoQuality.issues);
                analysis.missingDocumentation.push(...dtoQuality.missing);
            }

            // 전체 품질 점수 계산
            analysis.overallQuality = this.calculateDocumentationQuality(analysis);

            return analysis;

        } catch (error) {
            logger.error('문서화 품질 분석 실패', error);
            return { overallQuality: 0, qualityIssues: [], bestPracticeViolations: [], missingDocumentation: [] };
        }
    }

    /**
     * Controller 문서화 품질 분석
     */
    async analyzeControllerDocQuality(filePath) {
        const result = {
            issues: [],
            violations: [],
            missing: [],
            excellent: []
        };

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();

                // 문서화 품질 이슈 검사
                if (trimmedLine.includes('@Operation')) {
                    // 설명이 너무 짧음
                    if (trimmedLine.length < 50) {
                        result.issues.push({
                            type: 'insufficient_description',
                            severity: 'medium',
                            file: filePath,
                            line: index + 1,
                            message: 'API 설명이 너무 간단합니다',
                            suggestion: '상세한 설명과 사용 예시 추가'
                        });
                    }

                    // 훌륭한 문서화 예시
                    if (trimmedLine.includes('summary') && trimmedLine.includes('description') && trimmedLine.length > 100) {
                        result.excellent.push({
                            type: 'comprehensive_documentation',
                            file: filePath,
                            line: index + 1,
                            message: '우수한 API 문서화 사례'
                        });
                    }
                }

                // HTTP 메서드 매핑이 있지만 문서화 없음
                const httpMappings = ['@GetMapping', '@PostMapping', '@PutMapping', '@DeleteMapping'];
                if (httpMappings.some(mapping => trimmedLine.includes(mapping))) {
                    const hasDocAbove = this.checkForApiDocumentation(lines, index).hasDoc;
                    if (!hasDocAbove) {
                        result.missing.push({
                            type: 'missing_api_documentation',
                            severity: 'high',
                            file: filePath,
                            line: index + 1,
                            message: 'API 엔드포인트에 문서화가 없습니다',
                            suggestion: '@Operation 어노테이션 추가'
                        });
                    }
                }

                // 모범 사례 위반 검사
                if (trimmedLine.includes('@ApiOperation')) {
                    result.violations.push({
                        type: 'deprecated_annotation',
                        severity: 'low',
                        file: filePath,
                        line: index + 1,
                        message: '구버전 Swagger 어노테이션 사용',
                        suggestion: '@Operation으로 마이그레이션'
                    });
                }
            });

        } catch (error) {
            logger.warn(`Controller 문서화 품질 분석 실패: ${filePath}`, error);
        }

        return result;
    }

    /**
     * DTO 문서화 품질 분석
     */
    async analyzeDtoDocQuality(filePath) {
        const result = {
            issues: [],
            missing: []
        };

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();

                // 필드 문서화 확인
                if (trimmedLine.includes('private ') && trimmedLine.includes(';')) {
                    const hasFieldDoc = this.checkForFieldDocumentation(lines, index);
                    if (!hasFieldDoc) {
                        result.missing.push({
                            type: 'missing_field_documentation',
                            severity: 'medium',
                            file: filePath,
                            line: index + 1,
                            message: 'DTO 필드에 문서화가 없습니다',
                            suggestion: '@Schema 어노테이션 추가'
                        });
                    }
                }

                // 클래스 레벨 문서화 확인
                if (trimmedLine.includes('public class') && trimmedLine.includes('Response')) {
                    const hasClassDoc = this.checkForClassDocumentation(lines, index);
                    if (!hasClassDoc) {
                        result.missing.push({
                            type: 'missing_class_documentation',
                            severity: 'medium',
                            file: filePath,
                            line: index + 1,
                            message: 'DTO 클래스에 문서화가 없습니다',
                            suggestion: '@Schema 어노테이션으로 클래스 설명 추가'
                        });
                    }
                }
            });

        } catch (error) {
            logger.warn(`DTO 문서화 품질 분석 실패: ${filePath}`, error);
        }

        return result;
    }

    /**
     * 코드-문서 일치성 검증
     */
    async analyzeCodeDocConsistency(projectPath) {
        try {
            const analysis = {
                consistencyScore: 0,
                mismatches: [],
                outdatedDocumentation: [],
                missingParameterDocs: [],
                inconsistentResponses: []
            };

            const controllerFiles = await this.findControllerFiles(projectPath);

            for (const filePath of controllerFiles) {
                const consistencyIssues = await this.checkControllerConsistency(filePath);
                analysis.mismatches.push(...consistencyIssues.mismatches);
                analysis.outdatedDocumentation.push(...consistencyIssues.outdated);
                analysis.missingParameterDocs.push(...consistencyIssues.missingParams);
                analysis.inconsistentResponses.push(...consistencyIssues.responses);
            }

            // 일치성 점수 계산
            analysis.consistencyScore = this.calculateConsistencyScore(analysis);

            return analysis;

        } catch (error) {
            logger.error('코드-문서 일치성 분석 실패', error);
            return { consistencyScore: 0, mismatches: [], outdatedDocumentation: [] };
        }
    }

    /**
     * API 보안 문서화 분석
     */
    async analyzeApiSecurityDocumentation(projectPath) {
        try {
            const analysis = {
                securityDocScore: 0,
                missingSecurityDocs: [],
                authenticationDocs: [],
                authorizationDocs: [],
                securitySchemes: []
            };

            // Security 관련 문서화 확인
            const controllerFiles = await this.findControllerFiles(projectPath);
            
            for (const filePath of controllerFiles) {
                const securityDocs = await this.analyzeSecurityDocumentation(filePath);
                analysis.missingSecurityDocs.push(...securityDocs.missing);
                analysis.authenticationDocs.push(...securityDocs.auth);
                analysis.authorizationDocs.push(...securityDocs.authz);
            }

            // SecurityConfig에서 보안 스키마 확인
            const securityConfigPath = path.join(projectPath, 'src/main/java/com/globalcarelink/common/config/SecurityConfig.java');
            try {
                const securitySchemes = await this.extractSecuritySchemes(securityConfigPath);
                analysis.securitySchemes = securitySchemes;
            } catch (error) {
                // SecurityConfig 파일 없음
            }

            analysis.securityDocScore = this.calculateSecurityDocScore(analysis);

            return analysis;

        } catch (error) {
            logger.error('API 보안 문서화 분석 실패', error);
            return { securityDocScore: 0, missingSecurityDocs: [] };
        }
    }

    // ===== 유틸리티 메서드 =====

    async findControllerFiles(dir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
                    const subFiles = await this.findControllerFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile() && entry.name.endsWith('Controller.java')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 디렉터리 접근 실패 - 무시
        }

        return files;
    }

    async findDtoFiles(dir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && entry.name === 'dto') {
                    const dtoFiles = await fs.readdir(fullPath, { withFileTypes: true });
                    for (const dtoFile of dtoFiles) {
                        if (dtoFile.isFile() && dtoFile.name.endsWith('.java')) {
                            files.push(path.join(fullPath, dtoFile.name));
                        }
                    }
                } else if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
                    const subFiles = await this.findDtoFiles(fullPath);
                    files.push(...subFiles);
                }
            }
        } catch (error) {
            // 디렉터리 접근 실패 - 무시
        }

        return files;
    }

    shouldSkipDirectory(name) {
        const skipDirs = ['node_modules', '.git', 'build', 'target', '.gradle', 'dist'];
        return skipDirs.includes(name) || name.startsWith('.');
    }

    checkForFieldDocumentation(lines, currentIndex) {
        for (let i = Math.max(0, currentIndex - 3); i < currentIndex; i++) {
            const line = lines[i].trim();
            if (line.includes('@Schema') || line.includes('@ApiModelProperty')) {
                return true;
            }
        }
        return false;
    }

    checkForClassDocumentation(lines, currentIndex) {
        for (let i = Math.max(0, currentIndex - 5); i < currentIndex; i++) {
            const line = lines[i].trim();
            if (line.includes('@Schema') || line.includes('@ApiModel')) {
                return true;
            }
        }
        return false;
    }

    analyzePathPatterns(endpoints) {
        const patterns = {
            restful: 0,
            nonRestful: 0,
            pathVariables: 0,
            queryParams: 0
        };

        endpoints.forEach(endpoint => {
            // RESTful 패턴 확인
            if (this.isRestfulPattern(endpoint.path, endpoint.method)) {
                patterns.restful++;
            } else {
                patterns.nonRestful++;
            }

            // 경로 변수 확인
            if (endpoint.path.includes('{') && endpoint.path.includes('}')) {
                patterns.pathVariables++;
            }
        });

        return patterns;
    }

    isRestfulPattern(path, method) {
        // 간단한 RESTful 패턴 검사
        const restfulPatterns = [
            { method: 'GET', pattern: /^\/\w+$/ },
            { method: 'GET', pattern: /^\/\w+\/\{[^}]+\}$/ },
            { method: 'POST', pattern: /^\/\w+$/ },
            { method: 'PUT', pattern: /^\/\w+\/\{[^}]+\}$/ },
            { method: 'DELETE', pattern: /^\/\w+\/\{[^}]+\}$/ }
        ];

        return restfulPatterns.some(p => p.method === method && p.pattern.test(path));
    }

    // 점수 계산 메서드들
    calculateApiDocumentationScores(results) {
        const scores = {
            documentationScore: 0,
            consistencyScore: 0,
            securityDocScore: 0,
            overallScore: 0
        };

        if (results.documentationQuality) {
            scores.documentationScore = results.documentationQuality.overallQuality;
        }

        if (results.consistency) {
            scores.consistencyScore = results.consistency.consistencyScore;
        }

        if (results.security) {
            scores.securityDocScore = results.security.securityDocScore;
        }

        // 엔드포인트 문서화율 반영
        if (results.endpoints) {
            const documentationRate = results.endpoints.totalEndpoints > 0 
                ? (results.endpoints.documentedEndpoints / results.endpoints.totalEndpoints) * 100 
                : 0;
            scores.documentationScore = Math.max(scores.documentationScore, documentationRate);
        }

        scores.overallScore = (
            scores.documentationScore * 0.4 +
            scores.consistencyScore * 0.35 +
            scores.securityDocScore * 0.25
        );

        return scores;
    }

    calculateDocumentationQuality(analysis) {
        const totalIssues = analysis.qualityIssues.length + analysis.missingDocumentation.length;
        const excellentCount = analysis.excellentExamples.length;
        
        let baseScore = Math.max(0, 100 - totalIssues * 5);
        let bonusScore = excellentCount * 10;
        
        return Math.min(100, baseScore + bonusScore);
    }

    calculateConsistencyScore(analysis) {
        const totalIssues = analysis.mismatches.length + 
                          analysis.outdatedDocumentation.length + 
                          analysis.missingParameterDocs.length;
        
        return Math.max(0, 100 - totalIssues * 8);
    }

    calculateSecurityDocScore(analysis) {
        const missingCount = analysis.missingSecurityDocs.length;
        const hasSchemes = analysis.securitySchemes.length > 0;
        
        let score = Math.max(0, 100 - missingCount * 10);
        if (hasSchemes) score += 20;
        
        return Math.min(100, score);
    }

    async generateApiDocRecommendations(analysisResults) {
        const recommendations = [];

        try {
            const { results, scores } = analysisResults;

            // 문서화 점수가 낮은 경우
            if (scores.documentationScore < 70) {
                recommendations.push({
                    type: 'api_documentation',
                    priority: 'high',
                    title: 'API 문서화 개선 필요',
                    description: `현재 API 문서화 점수는 ${scores.documentationScore.toFixed(1)}점입니다. 포괄적인 API 문서화가 필요합니다.`,
                    actions: [
                        '@Operation 어노테이션으로 모든 엔드포인트 문서화',
                        '@Schema 어노테이션으로 DTO 필드 설명 추가',
                        'API 응답 예시 및 에러 케이스 문서화'
                    ],
                    estimatedEffort: 'high'
                });
            }

            // 코드-문서 불일치가 많은 경우
            if (scores.consistencyScore < 80) {
                recommendations.push({
                    type: 'consistency',
                    priority: 'medium',
                    title: '코드-문서 일치성 개선',
                    description: `코드와 문서의 일치성 점수가 ${scores.consistencyScore.toFixed(1)}점입니다. 문서 업데이트가 필요합니다.`,
                    actions: [
                        '변경된 API 스펙에 맞춰 문서 업데이트',
                        '매개변수 문서화 누락 부분 보완',
                        '응답 스키마 문서화 정확성 검증'
                    ],
                    estimatedEffort: 'medium'
                });
            }

            // 보안 문서화 부족
            if (scores.securityDocScore < 60) {
                recommendations.push({
                    type: 'security_documentation',
                    priority: 'medium',
                    title: 'API 보안 문서화 강화',
                    description: `보안 관련 문서화 점수가 ${scores.securityDocScore.toFixed(1)}점입니다. 보안 스키마 문서화가 필요합니다.`,
                        actions: [
                        '인증/인가 방식 문서화',
                        '@SecurityRequirement 어노테이션 추가',
                        'JWT 토큰 사용법 예시 추가'
                    ],
                    estimatedEffort: 'medium'
                });
            }

            // 미문서화 엔드포인트가 많은 경우
            if (results.endpoints?.undocumentedEndpoints?.length > 0) {
                recommendations.push({
                    type: 'missing_endpoints',
                    priority: 'high',
                    title: `${results.endpoints.undocumentedEndpoints.length}개 엔드포인트 문서화 누락`,
                    description: '일부 API 엔드포인트에 문서화가 누락되어 있습니다.',
                    actions: results.endpoints.undocumentedEndpoints.slice(0, 5).map(ep => 
                        `${ep.method} ${ep.path} - ${ep.controller}.${ep.methodName}()`
                    ),
                    estimatedEffort: 'medium'
                });
            }

        } catch (error) {
            logger.error('API 문서화 권장사항 생성 실패', error);
        }

        return recommendations;
    }

    async loadExistingApiDocumentation() {
        // 기존 OpenAPI 문서가 있다면 로드
        // 향후 /v3/api-docs 엔드포인트에서 실시간 문서 분석 가능
    }

    // 스켈레톤 메서드들 (실제 구현에서 확장)
    async checkControllerConsistency(filePath) {
        return { mismatches: [], outdated: [], missingParams: [], responses: [] };
    }

    async analyzeSecurityDocumentation(filePath) {
        return { missing: [], auth: [], authz: [] };
    }

    async extractSecuritySchemes(filePath) {
        return [];
    }

    async cleanup() {
        logger.info('API 문서화 분석 에이전트 정리 중...');
        this.apiCache.clear();
        this.documentationCache.clear();
        this.initialized = false;
    }
}

module.exports = ApiDocumentationAnalysisAgent;