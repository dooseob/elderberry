/**
 * AI기반 클로드가이드시스템 서브에이전트
 * 지능형 가이드 제공, 컨텍스트 분석, 개발 패턴 추천
 * 기존 ClaudeGuideIntegration.js와 통합하여 고급 기능 제공
 */

const fs = require('fs').promises;
const path = require('path');

class IntelligentGuideAgent {
    constructor() {
        this.name = 'IntelligentGuideAgent';
        this.version = '2.0.0';
        this.capabilities = [
            'contextual_analysis',
            'pattern_recognition', 
            'intelligent_suggestions',
            'code_quality_assessment',
            'best_practice_guidance'
        ];
        
        this.knowledgeBase = new Map();
        this.projectContext = {};
        this.learningData = [];
        this.sessionMemory = new Map();
        
        this.initializeKnowledgeBase();
        console.log('🧠 AI기반 클로드가이드시스템 서브에이전트 초기화 완료');
    }

    /**
     * 지식베이스 초기화
     */
    async initializeKnowledgeBase() {
        // Spring Boot 패턴
        this.knowledgeBase.set('spring_boot_patterns', {
            repository_pattern: {
                description: 'Repository 인터페이스 패턴',
                bestPractices: [
                    'Page<T> findBy... 메서드는 Pageable 파라미터 필수',
                    'JpaRepository 확장 시 제네릭 타입 명시',
                    '@Query 어노테이션 사용 시 nativeQuery=true 고려'
                ],
                commonIssues: [
                    'WithPaging 메서드명 사용 시 Pageable 누락',
                    '타입 불일치로 인한 컴파일 에러',
                    'Optional 반환 타입 미사용'
                ]
            },
            security_pattern: {
                description: 'Spring Security 설정 패턴',
                bestPractices: [
                    'JWT 토큰 검증 필터 체인 구성',
                    'CORS 설정과 보안 헤더 설정',
                    'Role 기반 접근 제어 구현'
                ]
            }
        });

        // React 패턴
        this.knowledgeBase.set('react_patterns', {
            component_patterns: {
                description: 'React 컴포넌트 패턴',
                bestPractices: [
                    'Custom Hook을 통한 로직 분리',
                    'Props 타입 정의 및 기본값 설정',
                    'useCallback, useMemo 최적화 적용'
                ]
            },
            performance_patterns: {
                description: 'React 성능 최적화 패턴',
                bestPractices: [
                    'React.lazy() 동적 import',
                    'Component 분할을 통한 렌더링 최적화',
                    'Context API 사용 시 Provider 분리'
                ]
            }
        });

        // 아키텍처 패턴
        this.knowledgeBase.set('architecture_patterns', {
            clean_architecture: {
                description: '클린 아키텍처 패턴',
                layers: ['Presentation', 'Application', 'Domain', 'Infrastructure'],
                guidelines: [
                    '의존성 방향은 항상 안쪽으로',
                    'Domain 계층은 외부 의존성 없음',
                    'Interface를 통한 의존성 역전'
                ]
            }
        });
    }

    /**
     * 프로젝트 컨텍스트 분석
     */
    async analyzeProjectContext(projectPath) {
        try {
            console.log('🔍 프로젝트 컨텍스트 분석 시작...');
            
            const context = {
                timestamp: new Date().toISOString(),
                projectPath,
                structure: {},
                technologies: [],
                patterns: [],
                issues: [],
                recommendations: []
            };

            // 1. 프로젝트 구조 분석
            context.structure = await this.analyzeProjectStructure(projectPath);
            
            // 2. 기술 스택 감지
            context.technologies = await this.detectTechnologies(projectPath);
            
            // 3. 코드 패턴 분석
            context.patterns = await this.analyzeCodePatterns(projectPath);
            
            // 4. 잠재적 이슈 감지
            context.issues = await this.detectPotentialIssues(projectPath);
            
            // 5. 개선 권장사항 생성
            context.recommendations = await this.generateRecommendations(context);

            this.projectContext = context;
            console.log('✅ 프로젝트 컨텍스트 분석 완료');
            
            return context;
            
        } catch (error) {
            console.error('❌ 프로젝트 컨텍스트 분석 실패:', error);
            throw error;
        }
    }

    /**
     * 지능형 가이드 제공
     */
    async provideIntelligentGuide(query, context = {}) {
        console.log('🎯 지능형 가이드 생성 중...');
        
        try {
            const guide = {
                query,
                timestamp: new Date().toISOString(),
                contextualAnalysis: await this.performContextualAnalysis(query, context),
                patternRecommendations: await this.getPatternRecommendations(query),
                bestPractices: await this.getBestPractices(query),
                codeExamples: await this.generateCodeExamples(query),
                troubleshooting: await this.getTroubleshootingGuidance(query),
                nextSteps: await this.suggestNextSteps(query, context)
            };

            // 학습 데이터에 추가
            this.learningData.push({
                query,
                guide,
                feedback: null, // 나중에 피드백 받을 예정
                timestamp: new Date().toISOString()
            });

            console.log('✅ 지능형 가이드 생성 완료');
            return guide;
            
        } catch (error) {
            console.error('❌ 지능형 가이드 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 프로젝트 구조 분석
     */
    async analyzeProjectStructure(projectPath) {
        const structure = {
            frontend: { exists: false, framework: null, components: 0 },
            backend: { exists: false, framework: null, controllers: 0 },
            database: { exists: false, type: null, entities: 0 },
            config: { exists: false, files: [] },
            tests: { exists: false, coverage: 'unknown' }
        };

        try {
            // Frontend 분석
            const frontendPath = path.join(projectPath, 'frontend');
            try {
                await fs.access(frontendPath);
                structure.frontend.exists = true;
                
                // package.json 확인
                const packageJsonPath = path.join(frontendPath, 'package.json');
                try {
                    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                    if (packageJson.dependencies?.react) {
                        structure.frontend.framework = 'React';
                    }
                } catch (e) {}

                // 컴포넌트 수 계산
                const srcPath = path.join(frontendPath, 'src');
                structure.frontend.components = await this.countFiles(srcPath, ['.tsx', '.jsx']);
            } catch (e) {}

            // Backend 분석
            const backendPath = path.join(projectPath, 'src/main/java');
            try {
                await fs.access(backendPath);
                structure.backend.exists = true;
                structure.backend.framework = 'Spring Boot';
                structure.backend.controllers = await this.countFiles(backendPath, ['Controller.java']);
            } catch (e) {}

            return structure;
        } catch (error) {
            console.warn('프로젝트 구조 분석 중 오류:', error.message);
            return structure;
        }
    }

    /**
     * 기술 스택 감지
     */
    async detectTechnologies(projectPath) {
        const technologies = [];
        
        try {
            // build.gradle.kts 확인
            const buildGradlePath = path.join(projectPath, 'build.gradle.kts');
            try {
                const buildGradle = await fs.readFile(buildGradlePath, 'utf8');
                if (buildGradle.includes('spring-boot')) technologies.push('Spring Boot');
                if (buildGradle.includes('spring-security')) technologies.push('Spring Security');
                if (buildGradle.includes('spring-data-jpa')) technologies.push('Spring Data JPA');
                if (buildGradle.includes('h2database')) technologies.push('H2 Database');
            } catch (e) {}

            // package.json 확인 (frontend)
            const packageJsonPath = path.join(projectPath, 'frontend/package.json');
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                if (deps.react) technologies.push('React');
                if (deps.typescript) technologies.push('TypeScript');
                if (deps.vite) technologies.push('Vite');
                if (deps['tailwindcss']) technologies.push('Tailwind CSS');
                if (deps.zustand) technologies.push('Zustand');
            } catch (e) {}

            return [...new Set(technologies)]; // 중복 제거
        } catch (error) {
            console.warn('기술 스택 감지 중 오류:', error.message);
            return technologies;
        }
    }

    /**
     * 코드 패턴 분석
     */
    async analyzeCodePatterns(projectPath) {
        const patterns = [];
        
        try {
            // Java 파일에서 패턴 찾기
            const javaFiles = await this.findFiles(projectPath, '.java');
            for (const filePath of javaFiles.slice(0, 10)) { // 최대 10개 파일만 분석
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    if (content.includes('@RestController')) {
                        patterns.push({ type: 'REST_CONTROLLER', file: filePath });
                    }
                    if (content.includes('@Repository')) {
                        patterns.push({ type: 'REPOSITORY_PATTERN', file: filePath });
                    }
                    if (content.includes('@Service')) {
                        patterns.push({ type: 'SERVICE_LAYER', file: filePath });
                    }
                    if (content.includes('@Entity')) {
                        patterns.push({ type: 'JPA_ENTITY', file: filePath });
                    }
                } catch (e) {}
            }

            // React 파일에서 패턴 찾기
            const reactFiles = await this.findFiles(projectPath, '.tsx');
            for (const filePath of reactFiles.slice(0, 5)) { // 최대 5개 파일만 분석
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    if (content.includes('useState')) {
                        patterns.push({ type: 'REACT_HOOKS', file: filePath });
                    }
                    if (content.includes('useEffect')) {
                        patterns.push({ type: 'LIFECYCLE_HOOKS', file: filePath });
                    }
                    if (content.includes('interface ') && content.includes('Props')) {
                        patterns.push({ type: 'TYPESCRIPT_PROPS', file: filePath });
                    }
                } catch (e) {}
            }

        } catch (error) {
            console.warn('코드 패턴 분석 중 오류:', error.message);
        }
        
        return patterns;
    }

    /**
     * 잠재적 이슈 감지
     */
    async detectPotentialIssues(projectPath) {
        const issues = [];
        
        try {
            // Repository 파일에서 WithPaging 이슈 찾기
            const repositoryFiles = await this.findFiles(projectPath, 'Repository.java');
            for (const filePath of repositoryFiles) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    if (content.includes('WithPaging') && !content.includes('Pageable')) {
                        issues.push({
                            type: 'REPOSITORY_PAGING_ISSUE',
                            severity: 'HIGH',
                            file: filePath,
                            description: 'WithPaging 메서드에 Pageable 파라미터 누락',
                            solution: 'Pageable 파라미터를 추가하거나 메서드명에서 WithPaging 제거'
                        });
                    }
                    
                    if (content.includes('List<') && content.includes('findBy')) {
                        issues.push({
                            type: 'REPOSITORY_RETURN_TYPE',
                            severity: 'MEDIUM',
                            file: filePath,
                            description: 'Repository 메서드가 List 대신 Page를 반환할 수 있음',
                            solution: '페이징이 필요한 경우 Page<T> 반환 타입 고려'
                        });
                    }
                } catch (e) {}
            }

            // React 컴포넌트에서 성능 이슈 찾기
            const componentFiles = await this.findFiles(projectPath, '.tsx');
            for (const filePath of componentFiles.slice(0, 5)) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    if (content.includes('useEffect') && !content.includes('[]')) {
                        issues.push({
                            type: 'REACT_INFINITE_RENDER',
                            severity: 'MEDIUM',
                            file: filePath,
                            description: 'useEffect에 의존성 배열이 없어 무한 렌더링 가능성',
                            solution: 'useEffect에 적절한 의존성 배열 추가'
                        });
                    }
                } catch (e) {}
            }

        } catch (error) {
            console.warn('이슈 감지 중 오류:', error.message);
        }
        
        return issues;
    }

    /**
     * 개선 권장사항 생성
     */
    async generateRecommendations(context) {
        const recommendations = [];
        
        // 기술 스택 기반 권장사항
        if (context.technologies.includes('Spring Boot')) {
            recommendations.push({
                category: 'ARCHITECTURE',
                priority: 'HIGH',
                title: 'Repository 패턴 표준화',
                description: 'Page<T> 반환 타입과 Pageable 파라미터 사용 표준화',
                implementation: 'findByWithPaging 메서드들을 findBy로 변경하고 Pageable 추가'
            });
        }

        if (context.technologies.includes('React')) {
            recommendations.push({
                category: 'PERFORMANCE',
                priority: 'MEDIUM',
                title: 'React 성능 최적화',
                description: 'React.memo, useCallback, useMemo 적용',
                implementation: '불필요한 리렌더링을 방지하는 최적화 훅 적용'
            });
        }

        // 이슈 기반 권장사항
        context.issues.forEach(issue => {
            if (issue.severity === 'HIGH') {
                recommendations.push({
                    category: 'BUG_FIX',
                    priority: 'CRITICAL',
                    title: `${issue.type} 해결`,
                    description: issue.description,
                    implementation: issue.solution
                });
            }
        });

        return recommendations;
    }

    /**
     * 컨텍스트 분석 수행
     */
    async performContextualAnalysis(query, context) {
        const analysis = {
            intent: this.analyzeIntent(query),
            complexity: this.assessComplexity(query),
            domain: this.identifyDomain(query),
            requiredSkills: this.identifyRequiredSkills(query),
            estimatedTime: this.estimateTime(query),
            riskFactors: this.identifyRiskFactors(query)
        };

        return analysis;
    }

    /**
     * 패턴 추천 제공
     */
    async getPatternRecommendations(query) {
        const recommendations = [];
        const queryLower = query.toLowerCase();

        // Repository 관련
        if (queryLower.includes('repository') || queryLower.includes('데이터베이스')) {
            const springPatterns = this.knowledgeBase.get('spring_boot_patterns');
            recommendations.push({
                pattern: 'Repository Pattern',
                description: springPatterns.repository_pattern.description,
                bestPractices: springPatterns.repository_pattern.bestPractices,
                codeExample: this.generateRepositoryExample()
            });
        }

        // React 컴포넌트 관련
        if (queryLower.includes('component') || queryLower.includes('컴포넌트')) {
            const reactPatterns = this.knowledgeBase.get('react_patterns');
            recommendations.push({
                pattern: 'React Component Pattern',
                description: reactPatterns.component_patterns.description,
                bestPractices: reactPatterns.component_patterns.bestPractices,
                codeExample: this.generateComponentExample()
            });
        }

        return recommendations;
    }

    /**
     * 베스트 프랙티스 제공
     */
    async getBestPractices(query) {
        const practices = [];
        const queryLower = query.toLowerCase();

        if (queryLower.includes('spring') || queryLower.includes('java')) {
            practices.push({
                category: 'Spring Boot',
                practices: [
                    '의존성 주입을 위해 생성자 주입 사용',
                    'Repository 메서드에는 Pageable 파라미터 활용',
                    '@Transactional 어노테이션 적절히 사용',
                    'DTO와 Entity 분리하여 사용'
                ]
            });
        }

        if (queryLower.includes('react') || queryLower.includes('typescript')) {
            practices.push({
                category: 'React TypeScript',
                practices: [
                    'Props 인터페이스 정의 및 기본값 설정',
                    'Custom Hook으로 로직 분리',
                    'useCallback, useMemo로 성능 최적화',
                    '컴포넌트 분할로 재사용성 향상'
                ]
            });
        }

        return practices;
    }

    /**
     * 코드 예제 생성
     */
    async generateCodeExamples(query) {
        const examples = [];
        const queryLower = query.toLowerCase();

        if (queryLower.includes('repository')) {
            examples.push({
                title: 'Spring Boot Repository 패턴',
                language: 'java',
                code: this.generateRepositoryExample()
            });
        }

        if (queryLower.includes('component')) {
            examples.push({
                title: 'React TypeScript 컴포넌트',
                language: 'typescript',
                code: this.generateComponentExample()
            });
        }

        return examples;
    }

    /**
     * Repository 예제 생성
     */
    generateRepositoryExample() {
        return `
// ✅ 올바른 Repository 패턴
@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    // 페이징 지원
    Page<Facility> findByLocationNear(Double lat, Double lng, Pageable pageable);
    
    // Optional 사용
    Optional<Facility> findByName(String name);
    
    // 커스텀 쿼리
    @Query("SELECT f FROM Facility f WHERE f.status = :status")
    List<Facility> findByStatus(@Param("status") String status);
}
`;
    }

    /**
     * React 컴포넌트 예제 생성
     */
    generateComponentExample() {
        return `
// ✅ 올바른 React TypeScript 컴포넌트 패턴
interface FacilityCardProps {
  facility: Facility;
  onSelect?: (facility: Facility) => void;
  className?: string;
}

const FacilityCard: React.FC<FacilityCardProps> = React.memo(({
  facility,
  onSelect,
  className = ''
}) => {
  const handleClick = useCallback(() => {
    onSelect?.(facility);
  }, [facility, onSelect]);

  return (
    <div 
      className={\`card \${className}\`}
      onClick={handleClick}
    >
      <h3>{facility.name}</h3>
      <p>{facility.description}</p>
    </div>
  );
});
`;
    }

    /**
     * 트러블슈팅 가이드 제공
     */
    async getTroubleshootingGuidance(query) {
        const guidance = [];
        const queryLower = query.toLowerCase();

        if (queryLower.includes('error') || queryLower.includes('에러')) {
            guidance.push({
                type: 'ERROR_RESOLUTION',
                steps: [
                    '1. 에러 메시지와 스택 트레이스 확인',
                    '2. 최근 변경사항 검토',
                    '3. 의존성 및 설정 확인',
                    '4. 로그 레벨 증가하여 상세 정보 수집',
                    '5. 단위 테스트로 문제 부분 격리'
                ]
            });
        }

        if (queryLower.includes('performance') || queryLower.includes('성능')) {
            guidance.push({
                type: 'PERFORMANCE_OPTIMIZATION',
                steps: [
                    '1. 성능 메트릭 수집 및 측정',
                    '2. 병목 지점 식별',
                    '3. 데이터베이스 쿼리 최적화',
                    '4. 캐싱 전략 적용',
                    '5. 불필요한 연산 제거'
                ]
            });
        }

        return guidance;
    }

    /**
     * 다음 단계 제안
     */
    async suggestNextSteps(query, context) {
        const steps = [];
        const queryLower = query.toLowerCase();

        if (queryLower.includes('구현') || queryLower.includes('implement')) {
            steps.push(
                '1. 요구사항 명세서 작성',
                '2. 아키텍처 설계 및 검토',
                '3. 단위 테스트 케이스 작성',
                '4. 핵심 로직 구현',
                '5. 통합 테스트 수행',
                '6. 코드 리뷰 및 개선'
            );
        } else if (queryLower.includes('분석') || queryLower.includes('analyze')) {
            steps.push(
                '1. 현재 상태 파악',
                '2. 문제점 식별',
                '3. 개선 방안 도출',
                '4. 우선순위 설정',
                '5. 실행 계획 수립'
            );
        } else {
            steps.push(
                '1. 구체적인 목표 설정',
                '2. 필요한 리소스 확인',
                '3. 단계별 계획 수립',
                '4. 진행 상황 모니터링'
            );
        }

        return steps;
    }

    /**
     * 유틸리티 메서드들
     */
    analyzeIntent(query) {
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('구현') || queryLower.includes('implement')) return 'IMPLEMENTATION';
        if (queryLower.includes('분석') || queryLower.includes('analyze')) return 'ANALYSIS';
        if (queryLower.includes('수정') || queryLower.includes('fix')) return 'FIXING';
        if (queryLower.includes('최적화') || queryLower.includes('optimize')) return 'OPTIMIZATION';
        
        return 'GENERAL';
    }

    assessComplexity(query) {
        let score = 0;
        if (query.length > 50) score += 1;
        if (query.split(' ').length > 10) score += 1;
        if (query.includes('통합') || query.includes('전체')) score += 2;
        if (query.includes('최적화') || query.includes('리팩토링')) score += 2;
        
        if (score >= 4) return 'HIGH';
        if (score >= 2) return 'MEDIUM';
        return 'LOW';
    }

    identifyDomain(query) {
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('spring') || queryLower.includes('java')) return 'BACKEND';
        if (queryLower.includes('react') || queryLower.includes('typescript')) return 'FRONTEND';
        if (queryLower.includes('database') || queryLower.includes('데이터베이스')) return 'DATABASE';
        if (queryLower.includes('security') || queryLower.includes('보안')) return 'SECURITY';
        
        return 'GENERAL';
    }

    identifyRequiredSkills(query) {
        const skills = [];
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('spring')) skills.push('Spring Boot');
        if (queryLower.includes('react')) skills.push('React');
        if (queryLower.includes('typescript')) skills.push('TypeScript');
        if (queryLower.includes('database')) skills.push('Database');
        if (queryLower.includes('security')) skills.push('Security');
        
        return skills.length > 0 ? skills : ['General Programming'];
    }

    estimateTime(query) {
        const complexity = this.assessComplexity(query);
        const domain = this.identifyDomain(query);
        
        if (complexity === 'HIGH') return '2-4 hours';
        if (complexity === 'MEDIUM') return '30-120 minutes';
        return '10-30 minutes';
    }

    identifyRiskFactors(query) {
        const risks = [];
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('전체') || queryLower.includes('모든')) {
            risks.push('Large scope - consider breaking into smaller tasks');
        }
        if (queryLower.includes('리팩토링')) {
            risks.push('Refactoring risk - ensure comprehensive testing');
        }
        if (queryLower.includes('보안')) {
            risks.push('Security implications - thorough security review needed');
        }
        
        return risks;
    }

    async findFiles(basePath, extension) {
        const files = [];
        
        async function walkDir(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await walkDir(fullPath);
                    } else if (entry.name.endsWith(extension)) {
                        files.push(fullPath);
                    }
                }
            } catch (e) {}
        }
        
        await walkDir(basePath);
        return files;
    }

    async countFiles(basePath, extensions) {
        let count = 0;
        
        for (const ext of extensions) {
            const files = await this.findFiles(basePath, ext);
            count += files.length;
        }
        
        return count;
    }

    /**
     * 학습 데이터 피드백 처리
     */
    addFeedback(queryId, feedback) {
        const learningItem = this.learningData.find(item => 
            item.timestamp === queryId || item.query.includes(queryId)
        );
        
        if (learningItem) {
            learningItem.feedback = feedback;
            console.log('📝 학습 데이터에 피드백 추가:', feedback);
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
            knowledgeBaseSize: this.knowledgeBase.size,
            learningDataCount: this.learningData.length,
            lastAnalysis: this.projectContext.timestamp,
            memoryUsage: process.memoryUsage()
        };
    }

    /**
     * MCP Task와 연동하여 실행
     */
    async executeWithMCPIntegration(input) {
        const { query, context = {}, options = {} } = input;
        
        console.log('🤖 IntelligentGuideAgent MCP 통합 실행');
        console.log(`📝 Query: ${query}`);
        
        try {
            // 1. 프로젝트 컨텍스트 분석 (필요시)
            if (!this.projectContext.timestamp || options.refreshContext) {
                await this.analyzeProjectContext(context.projectPath || process.cwd());
            }
            
            // 2. 지능형 가이드 생성
            const guide = await this.provideIntelligentGuide(query, context);
            
            // 3. 결과 반환
            return {
                success: true,
                agent: this.name,
                result: guide,
                metadata: {
                    executionTime: Date.now(),
                    contextAnalyzed: !!this.projectContext.timestamp,
                    knowledgeBaseUsed: true
                }
            };
            
        } catch (error) {
            console.error('❌ IntelligentGuideAgent 실행 실패:', error);
            return {
                success: false,
                agent: this.name,
                error: error.message,
                fallbackSuggestion: '더 구체적인 질문으로 다시 시도해보세요.'
            };
        }
    }
}

// 글로벌 인스턴스 생성
const intelligentGuideAgent = new IntelligentGuideAgent();

/**
 * 에이전트 테스트 함수
 */
async function testIntelligentGuideAgent() {
    console.log('🧪 AI기반 클로드가이드시스템 서브에이전트 테스트');
    
    const testQueries = [
        'Spring Boot Repository 에러 수정 방법',
        'React 컴포넌트 성능 최적화',
        '데이터베이스 쿼리 개선 방안',
        '전체 프로젝트 아키텍처 분석'
    ];
    
    for (const query of testQueries) {
        console.log(`\n📋 테스트 쿼리: ${query}`);
        
        const result = await intelligentGuideAgent.executeWithMCPIntegration({
            query,
            context: { projectPath: process.cwd() }
        });
        
        console.log(`결과: ${result.success ? '✅ 성공' : '❌ 실패'}`);
        if (result.success) {
            console.log(`가이드 섹션: ${Object.keys(result.result).length}개`);
        }
    }
    
    // 상태 출력
    console.log('\n📊 에이전트 상태:');
    console.log(intelligentGuideAgent.getStatus());
}

module.exports = {
    IntelligentGuideAgent,
    intelligentGuideAgent,
    testIntelligentGuideAgent
};