/**
 * API 문서화 서브에이전트
 * Spring Boot Controller 자동 분석 및 문서화
 * OpenAPI 스펙 생성, API 테스트 케이스 추천
 */

const fs = require('fs').promises;
const path = require('path');

class ApiDocumentationAgent {
    constructor() {
        this.name = 'ApiDocumentationAgent';
        this.version = '2.0.0';
        this.capabilities = [
            'controller_analysis',
            'openapi_generation',
            'api_documentation',
            'test_case_generation',
            'security_analysis'
        ];

        this.apiDatabase = new Map();
        this.documentationHistory = [];
        this.apiPatterns = new Map();
        this.securityPatterns = new Map();

        this.initializePatterns();
        console.log('📚 API 문서화 서브에이전트 초기화 완료');
    }

    /**
     * API 패턴 초기화
     */
    initializePatterns() {
        // Spring Boot 어노테이션 패턴
        this.apiPatterns.set('spring_annotations', {
            '@RestController': {
                type: 'CLASS',
                description: 'REST API 컨트롤러',
                generates_api: true
            },
            '@Controller': {
                type: 'CLASS',
                description: '일반 컨트롤러',
                generates_api: false
            },
            '@RequestMapping': {
                type: 'METHOD',
                description: 'HTTP 요청 매핑',
                http_methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
            },
            '@GetMapping': {
                type: 'METHOD',
                description: 'HTTP GET 요청 매핑',
                http_methods: ['GET']
            },
            '@PostMapping': {
                type: 'METHOD',
                description: 'HTTP POST 요청 매핑',
                http_methods: ['POST']
            },
            '@PutMapping': {
                type: 'METHOD',
                description: 'HTTP PUT 요청 매핑',
                http_methods: ['PUT']
            },
            '@DeleteMapping': {
                type: 'METHOD',
                description: 'HTTP DELETE 요청 매핑',
                http_methods: ['DELETE']
            },
            '@PathVariable': {
                type: 'PARAMETER',
                description: 'URL 경로 변수'
            },
            '@RequestParam': {
                type: 'PARAMETER',
                description: '요청 파라미터'
            },
            '@RequestBody': {
                type: 'PARAMETER',
                description: '요청 바디'
            }
        });

        // 보안 패턴
        this.securityPatterns.set('security_annotations', {
            '@PreAuthorize': {
                description: '메서드 실행 전 권한 확인',
                security_level: 'HIGH'
            },
            '@Secured': {
                description: '역할 기반 접근 제어',
                security_level: 'MEDIUM'
            },
            '@RolesAllowed': {
                description: 'JSR-250 역할 허용',
                security_level: 'MEDIUM'
            }
        });

        // HTTP 상태 코드 패턴
        this.apiPatterns.set('http_status', {
            'ResponseEntity': {
                description: 'HTTP 응답 엔티티',
                supports_status_codes: true
            },
            '@ResponseStatus': {
                description: 'HTTP 응답 상태 코드 지정',
                supports_status_codes: true
            }
        });
    }

    /**
     * Controller 파일 분석
     */
    async analyzeController(controllerFilePath) {
        console.log(`🔍 Controller 분석 시작: ${controllerFilePath}`);
        
        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                filePath: controllerFilePath,
                className: path.basename(controllerFilePath, '.java'),
                isRestController: false,
                baseMapping: '',
                endpoints: [],
                security: [],
                dependencies: [],
                imports: [],
                documentation: {
                    openapi: {},
                    markdown: '',
                    testCases: []
                }
            };

            // 파일 읽기
            const content = await fs.readFile(controllerFilePath, 'utf8');
            
            // 클래스 정보 분석
            analysis.isRestController = content.includes('@RestController');
            analysis.baseMapping = this.extractBaseMapping(content);
            analysis.imports = this.extractImports(content);
            analysis.dependencies = this.extractDependencies(content);

            // 엔드포인트 분석
            analysis.endpoints = this.extractEndpoints(content);
            
            // 보안 분석
            analysis.security = this.extractSecurityInfo(content);

            // 문서화 생성
            analysis.documentation = await this.generateApiDocumentation(analysis);

            // API 데이터베이스에 저장
            this.apiDatabase.set(analysis.className, analysis);

            console.log(`✅ Controller 분석 완료 - 엔드포인트: ${analysis.endpoints.length}개`);
            
            return analysis;

        } catch (error) {
            console.error('❌ Controller 분석 실패:', error);
            throw error;
        }
    }

    /**
     * 전체 프로젝트 API 분석
     */
    async analyzeProjectApis(projectPath) {
        console.log('🌍 전체 프로젝트 API 분석 시작...');
        
        try {
            const projectAnalysis = {
                timestamp: new Date().toISOString(),
                projectPath,
                totalControllers: 0,
                totalEndpoints: 0,
                controllers: [],
                apiSummary: {},
                securitySummary: {},
                recommendations: []
            };

            // Controller 파일 찾기
            const controllerFiles = await this.findControllerFiles(projectPath);
            projectAnalysis.totalControllers = controllerFiles.length;

            console.log(`📁 발견된 Controller: ${controllerFiles.length}개`);

            // 각 Controller 분석
            for (const controllerFile of controllerFiles) {
                try {
                    const analysis = await this.analyzeController(controllerFile);
                    projectAnalysis.controllers.push(analysis);
                    projectAnalysis.totalEndpoints += analysis.endpoints.length;
                } catch (error) {
                    console.warn(`⚠️ Controller 분석 실패: ${controllerFile}`, error.message);
                }
            }

            // 전체 요약 생성
            projectAnalysis.apiSummary = this.generateApiSummary(projectAnalysis.controllers);
            projectAnalysis.securitySummary = this.generateSecuritySummary(projectAnalysis.controllers);
            projectAnalysis.recommendations = this.generateApiRecommendations(projectAnalysis);

            console.log(`✅ 전체 분석 완료 - 총 엔드포인트: ${projectAnalysis.totalEndpoints}개`);
            
            return projectAnalysis;

        } catch (error) {
            console.error('❌ 프로젝트 API 분석 실패:', error);
            throw error;
        }
    }

    /**
     * Base Mapping 추출
     */
    extractBaseMapping(content) {
        const classMappingMatch = content.match(/@RequestMapping\s*\(\s*["']([^"']+)["']\s*\)/);
        if (classMappingMatch) {
            return classMappingMatch[1];
        }
        
        const valueMatch = content.match(/@RequestMapping\s*\(\s*value\s*=\s*["']([^"']+)["']/);
        if (valueMatch) {
            return valueMatch[1];
        }
        
        return '';
    }

    /**
     * Import 문 추출
     */
    extractImports(content) {
        const imports = [];
        const importRegex = /import\s+([^;]+);/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1].trim());
        }
        
        return imports;
    }

    /**
     * 의존성 추출
     */
    extractDependencies(content) {
        const dependencies = [];
        
        // @Autowired 필드
        const autowiredRegex = /@Autowired\s+private\s+(\w+)\s+(\w+);/g;
        let match;
        
        while ((match = autowiredRegex.exec(content)) !== null) {
            dependencies.push({
                type: 'AUTOWIRED',
                className: match[1],
                fieldName: match[2]
            });
        }
        
        // 생성자 주입
        const constructorMatch = content.match(/public\s+\w+\s*\(([^)]+)\)/);
        if (constructorMatch) {
            const params = constructorMatch[1].split(',');
            params.forEach(param => {
                const trimmed = param.trim();
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2) {
                    dependencies.push({
                        type: 'CONSTRUCTOR',
                        className: parts[0],
                        fieldName: parts[1]
                    });
                }
            });
        }
        
        return dependencies;
    }

    /**
     * 엔드포인트 추출
     */
    extractEndpoints(content) {
        const endpoints = [];
        
        // 메서드 패턴 매칭
        const methodRegex = /@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\s*(?:\(\s*(?:value\s*=\s*)?["']([^"']*)["'](?:\s*,\s*method\s*=\s*RequestMethod\.(\w+))?\s*\))?\s*\n\s*(?:@\w+(?:\([^)]*\))?\s*\n)*\s*public\s+(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)/g;
        
        let match;
        while ((match = methodRegex.exec(content)) !== null) {
            const [fullMatch, mappingType, path, method, returnType, methodName, parameters] = match;
            
            const endpoint = {
                method: this.determineHttpMethod(mappingType, method),
                path: path || '',
                methodName,
                returnType,
                parameters: this.parseParameters(parameters),
                annotations: this.extractMethodAnnotations(fullMatch),
                description: this.extractMethodDescription(content, methodName),
                responseTypes: this.analyzeResponseTypes(returnType),
                security: this.extractMethodSecurity(fullMatch)
            };
            
            endpoints.push(endpoint);
        }
        
        return endpoints;
    }

    /**
     * HTTP 메서드 결정
     */
    determineHttpMethod(mappingType, explicitMethod) {
        if (explicitMethod) return explicitMethod;
        
        const methodMap = {
            'GetMapping': 'GET',
            'PostMapping': 'POST',
            'PutMapping': 'PUT',
            'DeleteMapping': 'DELETE',
            'RequestMapping': 'GET' // 기본값
        };
        
        return methodMap[mappingType] || 'GET';
    }

    /**
     * 파라미터 파싱
     */
    parseParameters(parametersString) {
        if (!parametersString.trim()) return [];
        
        const parameters = [];
        const paramRegex = /(?:@(\w+)(?:\([^)]*\))?\s+)?(\w+(?:<[^>]+>)?)\s+(\w+)/g;
        
        let match;
        while ((match = paramRegex.exec(parametersString)) !== null) {
            const [, annotation, type, name] = match;
            
            parameters.push({
                name,
                type,
                annotation: annotation || null,
                required: this.isParameterRequired(annotation),
                description: this.generateParameterDescription(annotation, type, name)
            });
        }
        
        return parameters;
    }

    /**
     * 파라미터 필수 여부 확인
     */
    isParameterRequired(annotation) {
        if (!annotation) return false;
        if (annotation === 'RequestBody') return true;
        if (annotation === 'PathVariable') return true;
        return false; // RequestParam은 기본적으로 선택적
    }

    /**
     * 파라미터 설명 생성
     */
    generateParameterDescription(annotation, type, name) {
        if (annotation === 'PathVariable') {
            return `URL 경로의 ${name} 변수`;
        }
        if (annotation === 'RequestParam') {
            return `쿼리 파라미터 ${name}`;
        }
        if (annotation === 'RequestBody') {
            return `요청 바디 (${type} 타입)`;
        }
        return `${name} 파라미터`;
    }

    /**
     * 메서드 어노테이션 추출
     */
    extractMethodAnnotations(methodText) {
        const annotations = [];
        const annotationRegex = /@(\w+)(?:\([^)]*\))?/g;
        
        let match;
        while ((match = annotationRegex.exec(methodText)) !== null) {
            annotations.push(match[1]);
        }
        
        return annotations;
    }

    /**
     * 메서드 설명 추출
     */
    extractMethodDescription(content, methodName) {
        // 메서드 위의 주석 찾기
        const methodIndex = content.indexOf(`public \\w+ ${methodName}`);
        if (methodIndex === -1) return '';
        
        const beforeMethod = content.substring(0, methodIndex);
        const lines = beforeMethod.split('\n').reverse();
        
        let description = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('//')) {
                description = trimmed.substring(2).trim() + ' ' + description;
            } else if (trimmed.startsWith('*')) {
                description = trimmed.substring(1).trim() + ' ' + description;
            } else if (trimmed === '' || trimmed.startsWith('@')) {
                continue;
            } else {
                break;
            }
        }
        
        return description.trim() || `${methodName} API 엔드포인트`;
    }

    /**
     * 응답 타입 분석
     */
    analyzeResponseTypes(returnType) {
        const responseTypes = [];
        
        if (returnType.includes('ResponseEntity')) {
            responseTypes.push({
                type: 'ResponseEntity',
                description: 'HTTP 응답과 상태 코드를 함께 반환',
                statusCodes: ['200', '400', '404', '500']
            });
        }
        
        if (returnType.includes('List')) {
            responseTypes.push({
                type: 'List',
                description: '배열 형태의 데이터 반환',
                statusCodes: ['200']
            });
        }
        
        if (returnType.includes('Page')) {
            responseTypes.push({
                type: 'Page',
                description: '페이징된 데이터 반환',
                statusCodes: ['200']
            });
        }
        
        return responseTypes;
    }

    /**
     * 보안 정보 추출
     */
    extractSecurityInfo(content) {
        const security = [];
        
        // 클래스 레벨 보안
        const classSecurityRegex = /@(PreAuthorize|Secured|RolesAllowed)\s*\([^)]+\)/g;
        let match;
        
        while ((match = classSecurityRegex.exec(content)) !== null) {
            security.push({
                level: 'CLASS',
                annotation: match[1],
                value: match[0],
                description: this.securityPatterns.get('security_annotations')[`@${match[1]}`]?.description || '보안 설정'
            });
        }
        
        return security;
    }

    /**
     * 메서드 보안 추출
     */
    extractMethodSecurity(methodText) {
        const security = [];
        const securityRegex = /@(PreAuthorize|Secured|RolesAllowed)\s*\([^)]+\)/g;
        
        let match;
        while ((match = securityRegex.exec(methodText)) !== null) {
            security.push({
                annotation: match[1],
                value: match[0],
                description: this.securityPatterns.get('security_annotations')[`@${match[1]}`]?.description || '메서드 보안'
            });
        }
        
        return security;
    }

    /**
     * API 문서화 생성
     */
    async generateApiDocumentation(controllerAnalysis) {
        const documentation = {
            openapi: await this.generateOpenApiSpec(controllerAnalysis),
            markdown: await this.generateMarkdownDoc(controllerAnalysis),
            testCases: await this.generateTestCases(controllerAnalysis)
        };
        
        return documentation;
    }

    /**
     * OpenAPI 스펙 생성
     */
    async generateOpenApiSpec(analysis) {
        const openapi = {
            openapi: '3.0.0',
            info: {
                title: `${analysis.className} API`,
                version: '1.0.0',
                description: `${analysis.className}의 REST API 문서`
            },
            servers: [
                {
                    url: 'http://localhost:8080',
                    description: '개발 서버'
                }
            ],
            paths: {},
            components: {
                schemas: {},
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        };

        // 엔드포인트를 OpenAPI 경로로 변환
        analysis.endpoints.forEach(endpoint => {
            const fullPath = analysis.baseMapping + endpoint.path;
            
            if (!openapi.paths[fullPath]) {
                openapi.paths[fullPath] = {};
            }
            
            openapi.paths[fullPath][endpoint.method.toLowerCase()] = {
                summary: endpoint.description,
                operationId: endpoint.methodName,
                parameters: this.convertParametersToOpenApi(endpoint.parameters),
                responses: this.generateOpenApiResponses(endpoint.responseTypes),
                security: endpoint.security.length > 0 ? [{ BearerAuth: [] }] : []
            };
            
            // Request Body 처리
            const bodyParam = endpoint.parameters.find(p => p.annotation === 'RequestBody');
            if (bodyParam) {
                openapi.paths[fullPath][endpoint.method.toLowerCase()].requestBody = {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                description: bodyParam.description
                            }
                        }
                    }
                };
            }
        });
        
        return openapi;
    }

    /**
     * OpenAPI 파라미터 변환
     */
    convertParametersToOpenApi(parameters) {
        return parameters
            .filter(p => p.annotation !== 'RequestBody')
            .map(param => ({
                name: param.name,
                in: param.annotation === 'PathVariable' ? 'path' : 'query',
                required: param.required,
                description: param.description,
                schema: {
                    type: this.javaTypeToOpenApiType(param.type)
                }
            }));
    }

    /**
     * Java 타입을 OpenAPI 타입으로 변환
     */
    javaTypeToOpenApiType(javaType) {
        const typeMap = {
            'String': 'string',
            'Integer': 'integer',
            'Long': 'integer',
            'Boolean': 'boolean',
            'Double': 'number',
            'Float': 'number',
            'int': 'integer',
            'long': 'integer',
            'boolean': 'boolean',
            'double': 'number',
            'float': 'number'
        };
        
        return typeMap[javaType] || 'object';
    }

    /**
     * OpenAPI 응답 생성
     */
    generateOpenApiResponses(responseTypes) {
        const responses = {
            '200': {
                description: '성공',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object'
                        }
                    }
                }
            },
            '400': {
                description: '잘못된 요청'
            },
            '404': {
                description: '리소스를 찾을 수 없음'
            },
            '500': {
                description: '서버 내부 오류'
            }
        };
        
        return responses;
    }

    /**
     * 마크다운 문서 생성
     */
    async generateMarkdownDoc(analysis) {
        let markdown = `# ${analysis.className} API 문서\n\n`;
        
        markdown += `**생성 시간**: ${new Date().toLocaleString('ko-KR')}\n`;
        markdown += `**파일 경로**: \`${analysis.filePath}\`\n`;
        markdown += `**베이스 경로**: \`${analysis.baseMapping}\`\n`;
        markdown += `**총 엔드포인트**: ${analysis.endpoints.length}개\n\n`;
        
        // 보안 정보
        if (analysis.security.length > 0) {
            markdown += '## 🔒 보안 설정\n\n';
            analysis.security.forEach(security => {
                markdown += `- **${security.annotation}**: ${security.description}\n`;
            });
            markdown += '\n';
        }
        
        // 의존성 정보
        if (analysis.dependencies.length > 0) {
            markdown += '## 📦 의존성\n\n';
            analysis.dependencies.forEach(dep => {
                markdown += `- **${dep.className}**: ${dep.fieldName} (${dep.type})\n`;
            });
            markdown += '\n';
        }
        
        // API 엔드포인트
        markdown += '## 📋 API 엔드포인트\n\n';
        
        analysis.endpoints.forEach((endpoint, index) => {
            markdown += `### ${index + 1}. ${endpoint.methodName}\n\n`;
            markdown += `**HTTP Method**: \`${endpoint.method}\`\n`;
            markdown += `**경로**: \`${analysis.baseMapping}${endpoint.path}\`\n`;
            markdown += `**설명**: ${endpoint.description}\n`;
            markdown += `**반환 타입**: \`${endpoint.returnType}\`\n\n`;
            
            // 파라미터
            if (endpoint.parameters.length > 0) {
                markdown += '**파라미터**:\n';
                endpoint.parameters.forEach(param => {
                    const required = param.required ? '(필수)' : '(선택)';
                    markdown += `- \`${param.name}\` (${param.type}) ${required}: ${param.description}\n`;
                });
                markdown += '\n';
            }
            
            // 보안
            if (endpoint.security.length > 0) {
                markdown += '**보안 요구사항**:\n';
                endpoint.security.forEach(security => {
                    markdown += `- ${security.annotation}: ${security.description}\n`;
                });
                markdown += '\n';
            }
            
            // 응답 예시
            markdown += '**응답 예시**:\n';
            markdown += '```json\n';
            markdown += '{\n';
            if (endpoint.returnType.includes('List')) {
                markdown += '  "data": [],\n';
                markdown += '  "message": "success"\n';
            } else if (endpoint.returnType.includes('Page')) {
                markdown += '  "content": [],\n';
                markdown += '  "totalElements": 0,\n';
                markdown += '  "totalPages": 0,\n';
                markdown += '  "number": 0,\n';
                markdown += '  "size": 20\n';
            } else {
                markdown += '  "data": {},\n';
                markdown += '  "message": "success"\n';
            }
            markdown += '}\n```\n\n';
        });
        
        return markdown;
    }

    /**
     * 테스트 케이스 생성
     */
    async generateTestCases(analysis) {
        const testCases = [];
        
        analysis.endpoints.forEach(endpoint => {
            const testCase = {
                name: `test${endpoint.methodName}`,
                method: endpoint.method,
                path: analysis.baseMapping + endpoint.path,
                description: `${endpoint.methodName} API 테스트`,
                scenarios: [
                    {
                        name: '정상 케이스',
                        expectedStatus: 200,
                        testData: this.generateTestData(endpoint.parameters),
                        assertions: [
                            'response.status == 200',
                            'response.body != null'
                        ]
                    }
                ]
            };
            
            // 에러 케이스 추가
            if (endpoint.parameters.some(p => p.required)) {
                testCase.scenarios.push({
                    name: '필수 파라미터 누락',
                    expectedStatus: 400,
                    testData: {},
                    assertions: [
                        'response.status == 400'
                    ]
                });
            }
            
            if (endpoint.security.length > 0) {
                testCase.scenarios.push({
                    name: '인증 없음',
                    expectedStatus: 401,
                    testData: this.generateTestData(endpoint.parameters),
                    headers: {},
                    assertions: [
                        'response.status == 401'
                    ]
                });
            }
            
            testCases.push(testCase);
        });
        
        return testCases;
    }

    /**
     * 테스트 데이터 생성
     */
    generateTestData(parameters) {
        const testData = {};
        
        parameters.forEach(param => {
            if (param.annotation === 'RequestBody') return;
            
            switch (param.type) {
                case 'String':
                    testData[param.name] = 'test_' + param.name;
                    break;
                case 'Integer':
                case 'Long':
                    testData[param.name] = 1;
                    break;
                case 'Boolean':
                    testData[param.name] = true;
                    break;
                default:
                    testData[param.name] = 'test_value';
            }
        });
        
        return testData;
    }

    /**
     * Controller 파일 찾기
     */
    async findControllerFiles(projectPath) {
        const controllerFiles = [];
        
        async function walkDir(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await walkDir(fullPath);
                    } else if (entry.name.endsWith('Controller.java')) {
                        controllerFiles.push(fullPath);
                    }
                }
            } catch (e) {
                // 접근 불가능한 디렉토리 무시
            }
        }
        
        await walkDir(projectPath);
        return controllerFiles;
    }

    /**
     * API 요약 생성
     */
    generateApiSummary(controllers) {
        const summary = {
            totalEndpoints: 0,
            methodDistribution: {},
            securityCoverage: 0,
            mostCommonPaths: [],
            averageParametersPerEndpoint: 0
        };
        
        let totalParameters = 0;
        let securedEndpoints = 0;
        const pathFrequency = {};
        
        controllers.forEach(controller => {
            controller.endpoints.forEach(endpoint => {
                summary.totalEndpoints++;
                totalParameters += endpoint.parameters.length;
                
                // HTTP 메서드 분포
                summary.methodDistribution[endpoint.method] = 
                    (summary.methodDistribution[endpoint.method] || 0) + 1;
                
                // 보안 적용 여부
                if (endpoint.security.length > 0) {
                    securedEndpoints++;
                }
                
                // 경로 빈도
                const basePath = endpoint.path.split('/')[1] || 'root';
                pathFrequency[basePath] = (pathFrequency[basePath] || 0) + 1;
            });
        });
        
        summary.averageParametersPerEndpoint = summary.totalEndpoints > 0 ? 
            Math.round(totalParameters / summary.totalEndpoints * 10) / 10 : 0;
        
        summary.securityCoverage = summary.totalEndpoints > 0 ? 
            Math.round((securedEndpoints / summary.totalEndpoints) * 100) : 0;
        
        summary.mostCommonPaths = Object.entries(pathFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([path, count]) => ({ path, count }));
        
        return summary;
    }

    /**
     * 보안 요약 생성
     */
    generateSecuritySummary(controllers) {
        const summary = {
            totalSecuredEndpoints: 0,
            securityTypes: {},
            recommendations: []
        };
        
        controllers.forEach(controller => {
            controller.endpoints.forEach(endpoint => {
                if (endpoint.security.length > 0) {
                    summary.totalSecuredEndpoints++;
                    
                    endpoint.security.forEach(security => {
                        summary.securityTypes[security.annotation] = 
                            (summary.securityTypes[security.annotation] || 0) + 1;
                    });
                }
            });
        });
        
        // 보안 권장사항
        if (summary.totalSecuredEndpoints === 0) {
            summary.recommendations.push('모든 API에 적절한 보안 설정을 추가하세요.');
        }
        
        return summary;
    }

    /**
     * API 권장사항 생성
     */
    generateApiRecommendations(projectAnalysis) {
        const recommendations = [];
        
        // 보안 권장사항
        const securityCoverage = projectAnalysis.apiSummary.securityCoverage;
        if (securityCoverage < 80) {
            recommendations.push({
                category: 'SECURITY',
                priority: 'HIGH',
                title: 'API 보안 강화 필요',
                description: `보안이 적용된 API가 ${securityCoverage}%에 불과합니다.`,
                action: '인증이 필요한 API에 @PreAuthorize 또는 @Secured 어노테이션 추가'
            });
        }
        
        // 문서화 권장사항
        if (projectAnalysis.totalEndpoints > 10) {
            recommendations.push({
                category: 'DOCUMENTATION',
                priority: 'MEDIUM',
                title: 'API 문서화 자동화',
                description: 'API 수가 많아 문서화 자동화를 고려해보세요.',
                action: 'OpenAPI 스펙 파일을 생성하여 Swagger UI 적용'
            });
        }
        
        // 테스트 권장사항
        recommendations.push({
            category: 'TESTING',
            priority: 'MEDIUM',
            title: 'API 테스트 자동화',
            description: '생성된 테스트 케이스를 기반으로 자동화 테스트 구현',
            action: '각 API별 단위 테스트 및 통합 테스트 작성'
        });
        
        return recommendations;
    }

    /**
     * 에이전트 상태 조회
     */
    getStatus() {
        return {
            name: this.name,
            version: this.version,
            capabilities: this.capabilities,
            analyzedControllers: this.apiDatabase.size,
            documentationHistory: this.documentationHistory.length,
            knownPatterns: this.apiPatterns.size + this.securityPatterns.size,
            memoryUsage: process.memoryUsage()
        };
    }

    /**
     * 문서 파일 저장
     */
    async saveDocumentation(analysis, outputPath = 'docs/api/') {
        try {
            // 출력 디렉토리 생성
            await fs.mkdir(outputPath, { recursive: true });
            
            const className = analysis.className;
            
            // OpenAPI 스펙 저장
            const openApiPath = path.join(outputPath, `${className}_openapi.json`);
            await fs.writeFile(openApiPath, JSON.stringify(analysis.documentation.openapi, null, 2));
            
            // 마크다운 문서 저장
            const markdownPath = path.join(outputPath, `${className}_api.md`);
            await fs.writeFile(markdownPath, analysis.documentation.markdown);
            
            // 테스트 케이스 저장
            const testCasePath = path.join(outputPath, `${className}_tests.json`);
            await fs.writeFile(testCasePath, JSON.stringify(analysis.documentation.testCases, null, 2));
            
            console.log(`📄 문서 저장 완료: ${outputPath}`);
            
            return {
                openApiPath,
                markdownPath,
                testCasePath
            };
            
        } catch (error) {
            console.error('❌ 문서 저장 실패:', error);
            throw error;
        }
    }

    /**
     * MCP Task와 연동하여 실행
     */
    async executeWithMCPIntegration(input) {
        const { action = 'analyze_controller', filePath, projectPath, options = {} } = input;
        
        console.log('🤖 ApiDocumentationAgent MCP 통합 실행');
        console.log(`📝 Action: ${action}`);
        
        try {
            let result;
            
            switch (action) {
                case 'analyze_controller':
                    if (!filePath) throw new Error('Controller 파일 경로가 필요합니다.');
                    result = await this.analyzeController(filePath);
                    break;
                    
                case 'analyze_project':
                    if (!projectPath) throw new Error('프로젝트 경로가 필요합니다.');
                    result = await this.analyzeProjectApis(projectPath);
                    break;
                    
                case 'save_documentation':
                    if (!input.analysis) throw new Error('분석 결과가 필요합니다.');
                    result = await this.saveDocumentation(input.analysis, options.outputPath);
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
                    analyzedControllers: this.apiDatabase.size,
                    patternsKnown: this.apiPatterns.size
                }
            };
            
        } catch (error) {
            console.error('❌ ApiDocumentationAgent 실행 실패:', error);
            return {
                success: false,
                agent: this.name,
                action,
                error: error.message,
                fallbackSuggestion: '파일 경로와 권한을 확인해보세요.'
            };
        }
    }
}

// 글로벌 인스턴스 생성
const apiDocumentationAgent = new ApiDocumentationAgent();

/**
 * 에이전트 테스트 함수
 */
async function testApiDocumentationAgent() {
    console.log('🧪 API 문서화 서브에이전트 테스트');
    
    try {
        // 1. 프로젝트 API 분석 테스트
        console.log('\n📋 1. 프로젝트 API 분석 테스트');
        const result1 = await apiDocumentationAgent.executeWithMCPIntegration({
            action: 'analyze_project',
            projectPath: process.cwd()
        });
        console.log(`결과: ${result1.success ? '✅ 성공' : '❌ 실패'}`);
        if (result1.success) {
            console.log(`총 Controller: ${result1.result.totalControllers}개`);
            console.log(`총 엔드포인트: ${result1.result.totalEndpoints}개`);
            console.log(`보안 적용률: ${result1.result.apiSummary.securityCoverage}%`);
        }
        
        // 2. 개별 Controller 분석 테스트 (파일이 존재하는 경우)
        const authControllerPath = path.join(process.cwd(), 'src/main/java/com/globalcarelink/auth/AuthController.java');
        try {
            await fs.access(authControllerPath);
            console.log('\n📋 2. 개별 Controller 분석 테스트');
            const result2 = await apiDocumentationAgent.executeWithMCPIntegration({
                action: 'analyze_controller',
                filePath: authControllerPath
            });
            console.log(`결과: ${result2.success ? '✅ 성공' : '❌ 실패'}`);
            if (result2.success) {
                console.log(`엔드포인트: ${result2.result.endpoints.length}개`);
                console.log(`보안 설정: ${result2.result.security.length}개`);
            }
        } catch (e) {
            console.log('\n📋 2. AuthController.java 파일을 찾을 수 없어 스킵');
        }
        
    } catch (error) {
        console.error('테스트 실행 중 오류:', error);
    }
    
    // 상태 출력
    console.log('\n📊 에이전트 상태:');
    console.log(apiDocumentationAgent.getStatus());
}

module.exports = {
    ApiDocumentationAgent,
    apiDocumentationAgent,
    testApiDocumentationAgent
};