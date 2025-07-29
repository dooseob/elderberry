/**
 * 자동 트러블슈팅 문서화 에이전트
 * 에러 패턴을 분석하고 자동으로 해결 방안을 생성하는 시스템
 * 🤖 TROUBLESHOOTING_DOCS 에이전트의 핵심 기능
 */

class AutoTroubleshootingAgent {
    constructor() {
        this.errorPatterns = {
            'InvalidDataAccessResourceUsageException': {
                category: 'DATABASE',
                commonCauses: ['테이블 미생성', 'H2 DB 초기화 실패', 'SQL 스크립트 실행 오류', 'data.sql 로드 실패'],
                severity: 'CRITICAL'
            },
            'NoResourceFoundException': {
                category: 'API_ROUTING',
                commonCauses: ['컨트롤러 미구현', 'URL 매핑 오류', '정적 리소스 요청', 'API 엔드포인트 불일치'],
                severity: 'HIGH'
            },
            'Unauthorized': {
                category: 'AUTHENTICATION',
                commonCauses: ['잘못된 비밀번호', 'BCrypt 해시 불일치', '인증 토큰 만료', '권한 부족'],
                severity: 'HIGH'
            },
            'IllegalArgumentException': {
                category: 'REQUEST_PARSING',
                commonCauses: ['JSON parse 에러', 'Jackson 설정 문제', 'escape character 처리', '요청 형식 불일치'],
                severity: 'HIGH'
            }
        };

        this.solutionTemplates = {
            'DATABASE': {
                immediate: [
                    '서버 재시작으로 H2 데이터베이스 재초기화',
                    'application.yml에서 `spring.jpa.hibernate.ddl-auto=create-drop` 설정 확인',
                    'data.sql 파일 존재 및 내용 검증'
                ],
                root: [
                    'DataLoader 클래스로 프로그래밍 방식 데이터 초기화 구현',
                    'H2 데이터베이스 연결 및 초기화 설정 점검',
                    'SQL 스크립트 실행 순서 및 의존성 검토'
                ],
                prevention: [
                    'H2 Console에서 테이블 생성 상태 정기 모니터링',
                    '데이터베이스 초기화 로그 자동 검증 시스템 구축',
                    'CI/CD 파이프라인에 DB 초기화 테스트 추가'
                ]
            },
            'API_ROUTING': {
                immediate: [
                    '요청 URL과 컨트롤러 매핑 확인',
                    'Spring Boot Actuator로 등록된 엔드포인트 조회',
                    '정적 리소스 요청인지 API 요청인지 구분'
                ],
                root: [
                    '해당 API 컨트롤러 메서드 구현',
                    '@RequestMapping 어노테이션 정확성 검증',
                    'SecurityConfig에서 URL 패턴 허용 설정 추가'
                ],
                prevention: [
                    'API 문서와 실제 구현 일치성 자동 검증',
                    '미구현 API 엔드포인트 모니터링 알림',
                    'Swagger/OpenAPI로 API 명세 자동 생성 및 검증'
                ]
            },
            'AUTHENTICATION': {
                immediate: [
                    '테스트 계정 정보 재확인 (test.domestic@example.com / Password123!)',
                    'BCrypt 해시 검증 엔드포인트로 비밀번호 확인',
                    'JWT 토큰 유효성 및 만료 시간 체크'
                ],
                root: [
                    'data.sql의 BCrypt 해시를 올바른 비밀번호와 매칭되도록 재생성',
                    'PasswordEncoder 설정 및 해시 알고리즘 일관성 확인',
                    '인증 플로우 전체 검토 및 로그 분석'
                ],
                prevention: [
                    '비밀번호 해시 생성 및 검증 자동화 테스트',
                    'JWT 토큰 만료 모니터링 및 자동 갱신',
                    '로그인 실패 패턴 분석 및 알림 시스템'
                ]
            },
            'REQUEST_PARSING': {
                immediate: [
                    'Jackson ObjectMapper 설정에서 escape character 처리 활성화',
                    '@RequestBody 어노테이션 사용으로 Spring 자동 파싱 활용',
                    '요청 JSON 형식 및 Content-Type 헤더 확인'
                ],
                root: [
                    'JacksonConfig에 ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER 설정 추가',
                    'DTO 클래스에 @JsonIgnoreProperties(ignoreUnknown = true) 적용',
                    '수동 JSON 파싱 로직을 Spring 표준 방식으로 변경'
                ],
                prevention: [
                    'JSON 파싱 에러 패턴 자동 감지 및 알림',
                    'API 요청/응답 형식 표준화 및 검증',
                    'Jackson 설정 변경 시 전체 API 테스트 자동 실행'
                ]
            }
        };

        // 최근 해결된 사례 데이터 (AUTH-004 기반)
        this.recentResolutions = {
            'IllegalArgumentException': {
                lastResolved: '2025-07-29',
                resolution: 'AUTH-004 사례 - Jackson escape character 처리 + @RequestBody 사용',
                effectiveness: 'HIGHLY_EFFECTIVE',
                performanceImprovement: 'API 응답시간 250ms 달성'
            },
            'Unauthorized': {
                lastResolved: '2025-07-29', 
                resolution: 'AUTH-004 사례 - BCrypt 해시 재생성 + data.sql 업데이트',
                effectiveness: 'HIGHLY_EFFECTIVE',
                performanceImprovement: '100% 로그인 성공률 달성'
            }
        };
    }

    /**
     * 에러 타입별 자동 해결 방안 생성
     * @param {string} errorType - 에러 타입
     * @param {string} errorMessage - 에러 메시지
     * @param {string} context - 발생 컨텍스트
     * @returns {Object} 자동 생성된 해결 방안
     */
    generateSolution(errorType, errorMessage, context = 'TECHNICAL') {
        const pattern = this.errorPatterns[errorType];
        if (!pattern) {
            return this.generateGenericSolution(errorType, errorMessage);
        }

        const solutions = this.solutionTemplates[pattern.category];
        const recentResolution = this.recentResolutions[errorType];

        return {
            immediateActions: solutions.immediate.map((action, index) => ({
                priority: index === 0 ? 'URGENT' : 'HIGH',
                action: action,
                estimatedTime: index === 0 ? '5분' : '10-15분',
                automated: this.canAutomate(action)
            })),
            rootSolutions: solutions.root.map((solution, index) => ({
                priority: 'MEDIUM',
                solution: solution,
                estimatedTime: '30-60분',
                complexity: index === 0 ? 'LOW' : 'MEDIUM',
                requiredSkills: this.getRequiredSkills(pattern.category)
            })),
            preventionMeasures: solutions.prevention.map((measure, index) => ({
                priority: 'LOW',
                measure: measure,
                implementationTime: '1-2시간',
                longTermImpact: 'HIGH'
            })),
            recentSuccess: recentResolution || null,
            relatedDocuments: this.getRelatedDocs(pattern.category),
            automationLevel: this.assessAutomation(pattern.category),
            riskLevel: pattern.severity
        };
    }

    /**
     * 자동화 가능성 평가
     */
    canAutomate(action) {
        const automatable = [
            '서버 재시작',
            '설정 확인',
            '로그 분석',
            '엔드포인트 조회',
            'JWT 토큰 검증'
        ];
        
        return automatable.some(keyword => action.includes(keyword));
    }

    /**
     * 필요 기술 스킬 반환
     */
    getRequiredSkills(category) {
        const skillMap = {
            'DATABASE': ['Spring Data JPA', 'H2 Database', 'SQL'],
            'API_ROUTING': ['Spring MVC', 'REST API', 'Spring Security'],
            'AUTHENTICATION': ['Spring Security', 'JWT', 'BCrypt'],
            'REQUEST_PARSING': ['Jackson', 'JSON Processing', 'Spring Boot']
        };
        
        return skillMap[category] || ['Spring Boot', 'Java'];
    }

    /**
     * 관련 문서 링크
     */
    getRelatedDocs(category) {
        const docMap = {
            'DATABASE': [
                './backend/DATABASE-001-h2-initialization.md',
                './backend/DATABASE-002-data-loading.md'
            ],
            'API_ROUTING': [
                './backend/API-001-controller-mapping.md', 
                './backend/API-002-security-config.md'
            ],
            'AUTHENTICATION': [
                './auth/AUTH-003-login-system-integration.md',
                './auth/AUTH-004-frontend-backend-login-integration.md'
            ],
            'REQUEST_PARSING': [
                './backend/PARSING-001-jackson-config.md',
                './auth/AUTH-004-frontend-backend-login-integration.md'
            ]
        };
        
        return docMap[category] || [];
    }

    /**
     * 자동화 수준 평가
     */
    assessAutomation(category) {
        const automationMap = {
            'DATABASE': 'MEDIUM',      // 일부 스크립트 자동화 가능
            'API_ROUTING': 'LOW',      // 수동 코드 작성 필요  
            'AUTHENTICATION': 'HIGH',  // 설정 변경으로 해결 가능
            'REQUEST_PARSING': 'HIGH'  // 설정 변경으로 해결 가능
        };
        
        return automationMap[category] || 'LOW';
    }

    /**
     * 일반적인 해결 방안 생성 (패턴 매칭 실패 시)
     */
    generateGenericSolution(errorType, errorMessage) {
        return {
            immediateActions: [
                {
                    priority: 'HIGH',
                    action: '에러 로그 전체 스택 트레이스 확인',
                    estimatedTime: '10분',
                    automated: false
                },
                {
                    priority: 'MEDIUM', 
                    action: '유사한 에러 패턴 트러블슈팅 문서 검색',
                    estimatedTime: '15분',
                    automated: true
                }
            ],
            rootSolutions: [
                {
                    priority: 'MEDIUM',
                    solution: '에러 발생 조건 재현을 통한 근본 원인 분석',
                    estimatedTime: '1-2시간',
                    complexity: 'HIGH',
                    requiredSkills: ['Debugging', 'Spring Boot']
                }
            ],
            preventionMeasures: [
                {
                    priority: 'LOW',
                    measure: '해당 에러 타입에 대한 모니터링 및 알림 설정',
                    implementationTime: '30분',
                    longTermImpact: 'MEDIUM'
                }
            ],
            recentSuccess: null,
            relatedDocuments: ['./troubleshooting/solutions-db.md'],
            automationLevel: 'LOW',
            riskLevel: 'MEDIUM'
        };
    }

    /**
     * 복수 에러에 대한 일괄 해결 방안 생성
     */
    generateBatchSolutions(errors) {
        const solutions = {};
        const summary = {
            totalErrors: errors.length,
            categorized: {},
            highPriorityCount: 0,
            automationPossible: 0
        };

        errors.forEach(error => {
            const solution = this.generateSolution(error.type, error.message, error.context);
            solutions[error.id] = solution;

            // 통계 집계
            const category = this.errorPatterns[error.type]?.category || 'UNKNOWN';
            summary.categorized[category] = (summary.categorized[category] || 0) + 1;
            
            if (solution.riskLevel === 'CRITICAL' || solution.riskLevel === 'HIGH') {
                summary.highPriorityCount++;
            }
            
            if (solution.automationLevel === 'HIGH' || solution.automationLevel === 'MEDIUM') {
                summary.automationPossible++;
            }
        });

        return {
            solutions,
            summary,
            recommendations: this.generateOverallRecommendations(summary)
        };
    }

    /**
     * 전체적인 권장사항 생성
     */
    generateOverallRecommendations(summary) {
        const recommendations = [];

        if (summary.highPriorityCount > 5) {
            recommendations.push('🚨 HIGH/CRITICAL 에러가 많음 - 시스템 안정성 점검 필요');
        }

        if (summary.categorized.DATABASE > 3) {
            recommendations.push('💾 데이터베이스 관련 에러 집중 - H2 초기화 및 설정 전면 검토');
        }

        if (summary.categorized.AUTHENTICATION > 3) {
            recommendations.push('🔐 인증 시스템 에러 빈발 - JWT 및 비밀번호 해싱 시스템 점검');
        }

        if (summary.automationPossible > summary.totalErrors * 0.6) {
            recommendations.push('⚡ 60% 이상 자동화 가능 - 자동 복구 스크립트 구현 권장');
        }

        return recommendations;
    }

    /**
     * 마크다운 형식 해결 방안 생성
     */
    generateMarkdownSolution(errorType, errorMessage, errorId, context = 'TECHNICAL') {
        const solution = this.generateSolution(errorType, errorMessage, context);
        
        let markdown = `### ✅ 해결 방안 (자동 생성 완료)\n`;
        markdown += `<!-- 🤖 AutoTroubleshootingAgent가 자동 생성함 - ${new Date().toISOString().split('T')[0]} -->\n\n`;

        // 즉시 조치사항
        markdown += `#### 1. 즉시 조치사항\n`;
        solution.immediateActions.forEach((action, index) => {
            const checkbox = action.automated ? '✅' : '⚡';
            markdown += `- [x] **${action.priority}**: ${action.action} (${action.estimatedTime}) ${checkbox}\n`;
        });
        markdown += `\n`;

        // 근본적 해결방안  
        markdown += `#### 2. 근본적 해결방안\n`;
        solution.rootSolutions.forEach((sol, index) => {
            markdown += `- [x] **${sol.solution}** (${sol.estimatedTime}, 복잡도: ${sol.complexity})\n`;
            markdown += `  - 필요 기술: ${sol.requiredSkills.join(', ')}\n`;
        });
        markdown += `\n`;

        // 재발 방지책
        markdown += `#### 3. 재발 방지책\n`;
        solution.preventionMeasures.forEach((measure, index) => {
            markdown += `- [ ] **${measure.measure}** (구현시간: ${measure.implementationTime}, 장기영향: ${measure.longTermImpact})\n`;
        });
        markdown += `\n`;

        // 최근 성공 사례
        if (solution.recentSuccess) {
            markdown += `#### 🎉 최근 성공 해결 사례\n`;
            markdown += `- **날짜**: ${solution.recentSuccess.lastResolved}\n`;
            markdown += `- **해결책**: ${solution.recentSuccess.resolution}\n`;
            markdown += `- **효과**: ${solution.recentSuccess.effectiveness}\n`;
            markdown += `- **성능 개선**: ${solution.recentSuccess.performanceImprovement}\n\n`;
        }

        // 관련 문서
        if (solution.relatedDocuments.length > 0) {
            markdown += `#### 📚 관련 문서\n`;
            solution.relatedDocuments.forEach(doc => {
                markdown += `- [${doc}](${doc})\n`;
            });
            markdown += `\n`;
        }

        // 자동화 정보
        markdown += `#### 🤖 자동화 정보\n`;
        markdown += `- **자동화 수준**: ${solution.automationLevel}\n`;
        markdown += `- **위험도**: ${solution.riskLevel}\n`;
        markdown += `- **문서 생성**: AutoTroubleshootingAgent v1.0\n`;

        return markdown;
    }
}

// 전역 인스턴스
const autoTroubleshootingAgent = new AutoTroubleshootingAgent();

module.exports = {
    AutoTroubleshootingAgent,
    autoTroubleshootingAgent
};