/**
 * 스마트 MCP 오케스트레이터 - 자동 탐지 및 활성화 시스템
 * 
 * 기능:
 * 1. 작업 유형 자동 탐지
 * 2. 최적 MCP 서버 조합 선택
 * 3. 슈퍼 명령어 처리
 * 4. 기본값 설정 관리
 * 5. 사용자 친화적 인터페이스
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class SmartMcpOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.initialized = false;
        this.mcpServerConfig = new Map();
        this.workTypePatterns = new Map();
        this.superCommands = new Map();
        this.defaultActivations = new Set();
        this.userPreferences = new Map();
        this.usageHistory = [];
        
        // MCP 서버 정의 (실제 설치된 서버들)
        this.availableServers = {
            sequential: {
                name: 'Sequential (순차적사고)',
                capabilities: ['complex_analysis', 'multi_step', 'systematic_thinking', 'debugging', 'structured_reasoning'],
                activationFlags: ['--seq', '--sequential'],
                description: '복잡한 분석 및 다단계 추론, 체계적 사고',
                performance: { priority: 'high', loadTime: 'medium' },
                korean_name: '순차적사고'
            },
            context7: {
                name: 'Context7',
                capabilities: ['documentation', 'research', 'library_info', 'best_practices', 'api_docs'],
                activationFlags: ['--c7', '--context7'],
                description: '공식 라이브러리 문서 및 연구, API 문서 조회',
                performance: { priority: 'high', loadTime: 'fast' },
                korean_name: '컨텍스트7'
            },
            filesystem: {
                name: 'Filesystem',
                capabilities: ['file_management', 'directory_operations', 'file_search', 'file_analysis', 'project_structure'],
                activationFlags: ['--fs', '--filesystem'],
                description: '파일 시스템 조작 및 프로젝트 구조 분석',
                performance: { priority: 'medium', loadTime: 'fast' },
                korean_name: '파일시스템'
            },
            memory: {
                name: 'Memory Bank',
                capabilities: ['knowledge_storage', 'context_persistence', 'session_memory', 'learning', 'knowledge_retrieval'],
                activationFlags: ['--memory', '--mem'],
                description: '지식 저장소 및 컨텍스트 지속성, 학습 기능',
                performance: { priority: 'medium', loadTime: 'medium' },
                korean_name: '메모리뱅크'
            },
            github: {
                name: 'GitHub',
                capabilities: ['repository_management', 'issue_tracking', 'pr_management', 'git_operations', 'collaboration'],
                activationFlags: ['--github', '--git'],
                description: 'GitHub 레포지토리 관리 및 협업 도구',
                performance: { priority: 'medium', loadTime: 'medium' },
                korean_name: '깃허브'
            },
            postgresql: {
                name: 'PostgreSQL',
                capabilities: ['database_operations', 'sql_queries', 'schema_management', 'data_analysis', 'db_optimization'],
                activationFlags: ['--postgres', '--pg', '--db'],
                description: 'PostgreSQL 데이터베이스 관리 및 쿼리',
                performance: { priority: 'low', loadTime: 'slow' },
                korean_name: '포스트그레SQL'
            }
        };

        // 작업 유형별 패턴 정의
        this.initializeWorkTypePatterns();
        
        // 슈퍼 명령어 정의
        this.initializeSuperCommands();
        
        // 기본 활성화 설정
        this.initializeDefaultActivations();
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('🚀 SmartMcpOrchestrator 초기화 시작');

            // 사용자 기본설정 로드
            await this.loadUserPreferences();
            
            // 사용 이력 로드
            await this.loadUsageHistory();
            
            this.initialized = true;
            this.emit('orchestrator:initialized');
            
            console.log('✅ SmartMcpOrchestrator 초기화 완료');
            console.log(`📊 등록된 MCP 서버: ${Object.keys(this.availableServers).length}개`);
            console.log(`🎯 작업 유형 패턴: ${this.workTypePatterns.size}개`);
            console.log(`⚡ 슈퍼 명령어: ${this.superCommands.size}개`);

        } catch (error) {
            console.error('❌ SmartMcpOrchestrator 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 작업 유형별 패턴 초기화
     */
    initializeWorkTypePatterns() {
        // 코딩/개발 패턴
        this.workTypePatterns.set('coding', {
            keywords: [
                'implement', 'build', 'create', 'develop', 'code', 'function', 'class', 'method',
                'API', 'endpoint', 'service', 'component', 'module', 'library', 'framework',
                '구현', '개발', '코드', '함수', '클래스', '메서드', '컴포넌트', '모듈'
            ],
            filePatterns: ['*.java', '*.js', '*.ts', '*.jsx', '*.tsx', '*.py', '*.go'],
            recommendedServers: ['context7', 'sequential', 'filesystem', 'memory'],
            confidence: 0.9
        });

        // 분석 패턴
        this.workTypePatterns.set('analysis', {
            keywords: [
                'analyze', 'review', 'investigate', 'examine', 'study', 'research', 'assess',
                'debug', 'troubleshoot', 'diagnose', 'profile', 'monitor', 'evaluate',
                '분석', '검토', '조사', '연구', '평가', '디버그', '문제해결', '진단'
            ],
            filePatterns: ['**/*'],
            recommendedServers: ['sequential', 'context7', 'filesystem', 'memory'],
            confidence: 0.85
        });

        // 프로젝트 구조/파일 관리 패턴
        this.workTypePatterns.set('file_management', {
            keywords: [
                'file', 'directory', 'folder', 'structure', 'organize', 'refactor', 'clean',
                'move', 'rename', 'delete', 'search', 'find', 'project structure',
                '파일', '디렉토리', '폴더', '구조', '정리', '리팩토링', '청소', '검색'
            ],
            filePatterns: ['**/*'],
            recommendedServers: ['filesystem', 'sequential', 'memory'],
            confidence: 0.9
        });

        // 문서화 패턴
        this.workTypePatterns.set('documentation', {
            keywords: [
                'document', 'documentation', 'readme', 'guide', 'manual', 'tutorial', 'wiki',
                'help', 'instructions', 'specification', 'API docs', 'changelog',
                '문서', '문서화', '가이드', '매뉴얼', '튜토리얼', '위키', '도움말', '설명서'
            ],
            filePatterns: ['*.md', '*.rst', '*.txt', '**/docs/**', 'README*', 'CHANGELOG*'],
            recommendedServers: ['context7', 'memory', 'filesystem'],
            confidence: 0.85
        });

        // Git/GitHub 패턴
        this.workTypePatterns.set('git_operations', {
            keywords: [
                'git', 'github', 'commit', 'push', 'pull', 'merge', 'branch', 'repository',
                'issue', 'pull request', 'PR', 'version control', 'collaboration',
                '깃', '깃허브', '커밋', '푸시', '풀', '머지', '브랜치', '레포지토리', '이슈'
            ],
            filePatterns: ['.git/**', '*.gitignore', '.github/**'],
            recommendedServers: ['github', 'memory', 'filesystem'],
            confidence: 0.9
        });

        // 데이터베이스 패턴
        this.workTypePatterns.set('database', {
            keywords: [
                'database', 'sql', 'query', 'schema', 'migration', 'orm', 'repository',
                'entity', 'model', 'crud', 'transaction', 'index', 'constraint', 'postgresql',
                '데이터베이스', '쿼리', '스키마', '마이그레이션', '엔티티', '모델', '트랜잭션'
            ],
            filePatterns: ['*.sql', '**/repository/**', '**/entity/**', '**/model/**'],
            recommendedServers: ['postgresql', 'context7', 'sequential'],
            confidence: 0.9
        });

        // 성능 최적화 패턴
        this.workTypePatterns.set('performance', {
            keywords: [
                'optimize', 'performance', 'speed', 'efficiency', 'bottleneck', 'profiling',
                'memory', 'cpu', 'latency', 'throughput', 'benchmark', 'cache',
                '최적화', '성능', '속도', '효율성', '병목', '프로파일링', '메모리', '지연시간'
            ],
            filePatterns: ['**/*'],
            recommendedServers: ['sequential', 'memory', 'postgresql'],
            confidence: 0.8
        });

        // 보안 패턴
        this.workTypePatterns.set('security', {
            keywords: [
                'security', 'vulnerability', 'authentication', 'authorization', 'encryption',
                'secure', 'safety', 'audit', 'compliance', 'penetration', 'threat',
                '보안', '취약점', '인증', '인가', '암호화', '안전', '감사', '규정준수', '위협'
            ],
            filePatterns: ['**/security/**', '**/auth/**', '*.security.js'],
            recommendedServers: ['sequential', 'context7', 'memory'],
            confidence: 0.9
        });

        // 학습/지식 관리 패턴
        this.workTypePatterns.set('learning', {
            keywords: [
                'learn', 'study', 'knowledge', 'remember', 'note', 'save', 'store',
                'context', 'session', 'history', 'experience', 'insight',
                '학습', '공부', '지식', '기억', '노트', '저장', '컨텍스트', '경험', '통찰'
            ],
            filePatterns: ['**/*'],
            recommendedServers: ['memory', 'context7', 'filesystem'],
            confidence: 0.8
        });
    }

    /**
     * 슈퍼 명령어 초기화
     */
    initializeSuperCommands() {
        // 최대 성능 모드
        this.superCommands.set('/max', {
            name: 'Maximum Performance Mode (최대 성능)',
            description: '모든 MCP 서버 활성화 + 최고 성능 설정',
            flags: ['--seq', '--c7', '--fs', '--memory', '--github', '--postgres', '--think-hard', '--delegate auto', '--wave-mode force'],
            servers: ['sequential', 'context7', 'filesystem', 'memory', 'github', 'postgresql'],
            options: {
                parallelProcessing: true,
                cacheEnabled: true,
                verboseOutput: true,
                allServersActive: true
            }
        });

        // 자동 모드
        this.superCommands.set('/auto', {
            name: 'Auto Mode (자동 모드)',
            description: '작업 유형에 따라 자동으로 최적 MCP 조합 선택',
            flags: ['--delegate auto', '--wave-mode auto'],
            servers: 'auto-detect',
            options: {
                autoDetection: true,
                adaptiveSelection: true,
                learningEnabled: true
            }
        });

        // 스마트 모드
        this.superCommands.set('/smart', {
            name: 'Smart Mode (스마트 모드)',
            description: '사용 이력 기반 지능형 MCP 서버 선택',
            flags: ['--think', '--delegate auto', '--memory'],
            servers: 'history-based',
            options: {
                historyBased: true,
                personalizedSelection: true,
                efficiencyOptimized: true,
                memoryEnabled: true
            }
        });

        // 빠른 모드
        this.superCommands.set('/quick', {
            name: 'Quick Mode (빠른 모드)',
            description: '기본 MCP 서버만 활성화하여 빠른 응답',
            flags: ['--c7', '--uc'],
            servers: ['context7'],
            options: {
                minimalist: true,
                fastResponse: true,
                lowResourceUsage: true
            }
        });

        // 분석 모드
        this.superCommands.set('/analyze', {
            name: 'Analysis Mode (분석 모드)',
            description: '깊이 있는 분석을 위한 전문 설정',
            flags: ['--seq', '--c7', '--fs', '--memory', '--think-hard', '--delegate auto'],
            servers: ['sequential', 'context7', 'filesystem', 'memory'],
            options: {
                deepAnalysis: true,
                comprehensiveReporting: true,
                detailedInsights: true,
                contextPersistence: true
            }
        });

        // 개발 모드
        this.superCommands.set('/dev', {
            name: 'Development Mode (개발 모드)',
            description: '개발 작업에 최적화된 MCP 조합',
            flags: ['--c7', '--seq', '--fs', '--memory', '--github'],
            servers: ['context7', 'sequential', 'filesystem', 'memory', 'github'],
            options: {
                developmentFocused: true,
                codeGeneration: true,
                bestPractices: true,
                versionControl: true,
                contextTracking: true
            }
        });

        // 데이터베이스 모드
        this.superCommands.set('/db', {
            name: 'Database Mode (데이터베이스 모드)',
            description: '데이터베이스 작업에 특화된 MCP 조합',
            flags: ['--postgres', '--seq', '--c7', '--memory'],
            servers: ['postgresql', 'sequential', 'context7', 'memory'],
            options: {
                databaseFocused: true,
                sqlOptimization: true,
                schemaAnalysis: true,
                queryDebugging: true
            }
        });

        // 학습 모드
        this.superCommands.set('/learn', {
            name: 'Learning Mode (학습 모드)',
            description: '지식 축적 및 학습에 최적화된 설정',
            flags: ['--memory', '--c7', '--fs'],
            servers: ['memory', 'context7', 'filesystem'],
            options: {
                learningFocused: true,
                knowledgeRetention: true,
                contextBuilding: true,
                progressTracking: true
            }
        });

        // 협업 모드
        this.superCommands.set('/collab', {
            name: 'Collaboration Mode (협업 모드)',
            description: '팀 협업 및 프로젝트 관리에 특화',
            flags: ['--github', '--memory', '--fs', '--seq'],
            servers: ['github', 'memory', 'filesystem', 'sequential'],
            options: {
                collaborationFocused: true,
                projectManagement: true,
                teamCoordination: true,
                issueTracking: true
            }
        });
    }

    /**
     * 기본 활성화 설정 초기화
     */
    initializeDefaultActivations() {
        // 기본적으로 활성화할 서버들 (항상 유용한 서버들)
        this.defaultActivations.add('context7');    // 문서 및 모범사례
        this.defaultActivations.add('memory');      // 컨텍스트 지속성
        
        // 조건부 기본 활성화
        this.conditionalDefaults = {
            // 복잡한 프로젝트인 경우 Sequential 자동 활성화
            sequential: (context) => {
                return context.projectComplexity > 0.7 || 
                       context.fileCount > 50 || 
                       context.isAnalysisTask ||
                       context.isComplexDebugging;
            },
            
            // 파일 작업이 필요한 경우 Filesystem 자동 활성화
            filesystem: (context) => {
                return context.needsFileOperations || 
                       context.isProjectStructureTask ||
                       context.isRefactoringTask ||
                       context.fileCount > 20;
            },
            
            // Git 작업이 있는 경우 GitHub 자동 활성화
            github: (context) => {
                return context.hasGitFiles || 
                       context.isVersionControlTask ||
                       context.isCollaborationTask ||
                       (context.files && context.files.some(f => f.includes('.git')));
            },
            
            // 데이터베이스 관련 작업인 경우 PostgreSQL 자동 활성화
            postgresql: (context) => {
                return context.hasDatabaseFiles ||
                       context.isDatabaseTask ||
                       (context.files && context.files.some(f => 
                           f.includes('.sql') || 
                           f.includes('repository') || 
                           f.includes('entity') ||
                           f.includes('model')
                       ));
            }
        };
    }

    /**
     * 메인 분석 함수 - 사용자 입력에서 최적 MCP 조합 추천
     */
    async analyzeAndRecommend(userInput, context = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log('🔍 작업 분석 시작:', userInput);

        try {
            // 1. 슈퍼 명령어 체크
            const superCommand = this.detectSuperCommand(userInput);
            if (superCommand) {
                return this.handleSuperCommand(superCommand, context);
            }

            // 2. 작업 유형 탐지
            const workTypes = this.detectWorkTypes(userInput, context);
            
            // 3. MCP 서버 추천
            const recommendations = this.recommendMcpServers(workTypes, context);
            
            // 4. 사용 이력 기반 개선
            const optimizedRecommendations = this.optimizeWithHistory(recommendations, userInput);
            
            // 5. 최종 설정 생성
            const finalConfig = this.generateFinalConfig(optimizedRecommendations, context);
            
            // 6. 사용 이력 저장
            await this.saveUsageHistory(userInput, finalConfig);

            console.log('✅ 분석 완료 - 추천 MCP 조합:', finalConfig.servers);
            
            return finalConfig;

        } catch (error) {
            console.error('❌ 작업 분석 실패:', error);
            return this.getFallbackConfig();
        }
    }

    /**
     * 슈퍼 명령어 탐지
     */
    detectSuperCommand(userInput) {
        const input = userInput.toLowerCase().trim();
        
        for (const [command, config] of this.superCommands) {
            if (input.includes(command) || input.startsWith(command)) {
                return { command, config };
            }
        }
        
        return null;
    }

    /**
     * 슈퍼 명령어 처리
     */
    async handleSuperCommand(superCommand, context) {
        const { command, config } = superCommand;
        
        console.log(`⚡ 슈퍼 명령어 실행: ${command} - ${config.name}`);
        
        let servers = config.servers;
        
        // 자동 탐지 모드인 경우
        if (servers === 'auto-detect') {
            const workTypes = this.detectWorkTypes(context.userInput || '', context);
            servers = this.recommendMcpServers(workTypes, context).map(r => r.server);
        }
        
        // 이력 기반 모드인 경우
        if (servers === 'history-based') {
            servers = this.getHistoryBasedServers(context);
        }

        return {
            mode: 'super-command',
            command,
            name: config.name,
            description: config.description,
            servers: servers,
            flags: config.flags,
            options: config.options,
            explanation: `${config.description}을 활성화했습니다.`,
            estimatedPerformance: this.estimatePerformance(servers),
            userFriendlyCommand: this.generateUserFriendlyCommand(config)
        };
    }

    /**
     * 작업 유형 탐지
     */
    detectWorkTypes(userInput, context) {
        const detectedTypes = [];
        const input = userInput.toLowerCase();
        
        for (const [workType, pattern] of this.workTypePatterns) {
            let score = 0;
            
            // 키워드 매칭
            const keywordMatches = pattern.keywords.filter(keyword => 
                input.includes(keyword.toLowerCase())
            ).length;
            score += keywordMatches * 0.3;
            
            // 파일 패턴 매칭
            if (context.files) {
                const fileMatches = context.files.filter(file => 
                    pattern.filePatterns.some(pattern => this.matchFilePattern(file, pattern))
                ).length;
                score += (fileMatches / Math.max(context.files.length, 1)) * 0.4;
            }
            
            // 컨텍스트 기반 추가 점수
            if (context.projectType === workType) {
                score += 0.3;
            }
            
            if (score > 0.3) {
                detectedTypes.push({
                    type: workType,
                    score: Math.min(score, 1.0),
                    confidence: pattern.confidence,
                    finalScore: score * pattern.confidence
                });
            }
        }
        
        // 점수순 정렬
        detectedTypes.sort((a, b) => b.finalScore - a.finalScore);
        
        console.log('🎯 탐지된 작업 유형:', detectedTypes.map(t => `${t.type}(${Math.round(t.finalScore * 100)}%)`));
        
        return detectedTypes;
    }

    /**
     * MCP 서버 추천
     */
    recommendMcpServers(workTypes, context) {
        const recommendations = [];
        const serverScores = new Map();
        
        // 기본 활성화 서버들
        for (const defaultServer of this.defaultActivations) {
            serverScores.set(defaultServer, 0.5);
        }
        
        // 조건부 기본 활성화 체크
        for (const [server, condition] of Object.entries(this.conditionalDefaults)) {
            if (condition(context)) {
                serverScores.set(server, Math.max(serverScores.get(server) || 0, 0.6));
            }
        }
        
        // 작업 유형별 추천 서버
        for (const workType of workTypes.slice(0, 3)) { // 상위 3개만 고려
            const pattern = this.workTypePatterns.get(workType.type);
            if (pattern && pattern.recommendedServers) {
                for (const server of pattern.recommendedServers) {
                    const currentScore = serverScores.get(server) || 0;
                    const additionalScore = workType.finalScore * 0.5;
                    serverScores.set(server, currentScore + additionalScore);
                }
            }
        }
        
        // 추천 목록 생성
        for (const [server, score] of serverScores) {
            if (score > 0.3) {
                recommendations.push({
                    server,
                    score: Math.min(score, 1.0),
                    reason: this.generateRecommendationReason(server, workTypes),
                    config: this.availableServers[server]
                });
            }
        }
        
        // 점수순 정렬
        recommendations.sort((a, b) => b.score - a.score);
        
        return recommendations;
    }

    /**
     * 사용 이력 기반 최적화
     */
    optimizeWithHistory(recommendations, userInput) {
        // 과거 유사한 작업에서 성공했던 조합 찾기
        const similarTasks = this.findSimilarTasks(userInput);
        
        if (similarTasks.length > 0) {
            console.log(`📚 유사한 과거 작업 ${similarTasks.length}건 발견`);
            
            // 성공률이 높았던 서버들에 보너스 점수
            for (const recommendation of recommendations) {
                const historicalSuccess = this.calculateHistoricalSuccess(recommendation.server, similarTasks);
                recommendation.score *= (1 + historicalSuccess * 0.3);
                
                if (historicalSuccess > 0.7) {
                    recommendation.reason += ` (과거 성공률: ${Math.round(historicalSuccess * 100)}%)`;
                }
            }
            
            // 재정렬
            recommendations.sort((a, b) => b.score - a.score);
        }
        
        return recommendations;
    }

    /**
     * 최종 설정 생성
     */
    generateFinalConfig(recommendations, context) {
        const selectedServers = recommendations
            .filter(r => r.score > 0.5)
            .slice(0, 4) // 최대 4개 서버
            .map(r => r.server);
        
        // 최소한 하나의 서버는 선택되어야 함
        if (selectedServers.length === 0) {
            selectedServers.push('context7'); // 기본 서버
        }
        
        const flags = this.generateFlags(selectedServers, recommendations, context);
        const explanation = this.generateExplanation(recommendations, context);
        
        return {
            mode: 'auto-optimized',
            servers: selectedServers,
            flags: flags,
            recommendations: recommendations,
            explanation: explanation,
            confidence: this.calculateOverallConfidence(recommendations),
            estimatedPerformance: this.estimatePerformance(selectedServers),
            userFriendlyCommand: this.generateUserFriendlyCommand({ flags, servers: selectedServers })
        };
    }

    /**
     * 플래그 생성
     */
    generateFlags(servers, recommendations, context) {
        const flags = [];
        
        // 서버별 플래그
        servers.forEach(server => {
            const serverConfig = this.availableServers[server];
            if (serverConfig && serverConfig.activationFlags.length > 0) {
                flags.push(serverConfig.activationFlags[0]); // 첫 번째 플래그 사용
            }
        });
        
        // 컨텍스트 기반 추가 플래그
        if (context.isComplexTask) {
            flags.push('--think');
        }
        
        if (context.needsParallelProcessing) {
            flags.push('--delegate auto');
        }
        
        if (context.isLargeProject) {
            flags.push('--wave-mode auto');
        }
        
        // 성능 최적화 플래그
        if (servers.length > 2) {
            flags.push('--uc'); // 토큰 압축
        }
        
        return flags;
    }

    /**
     * 설명 생성
     */
    generateExplanation(recommendations, context) {
        const topRecommendations = recommendations.slice(0, 3);
        
        let explanation = "📋 **자동 선택된 MCP 구성:**\n\n";
        
        topRecommendations.forEach((rec, index) => {
            explanation += `${index + 1}. **${rec.config.name}** (${Math.round(rec.score * 100)}점)\n`;
            explanation += `   - ${rec.config.description}\n`;
            explanation += `   - 선택 이유: ${rec.reason}\n\n`;
        });
        
        explanation += "💡 **최적화 팁:**\n";
        explanation += "- 향후 유사한 작업에서는 이 설정이 자동으로 우선 추천됩니다\n";
        explanation += "- 원하는 경우 `/max`, `/quick` 등의 슈퍼 명령어를 사용할 수 있습니다\n";
        
        return explanation;
    }

    /**
     * 사용자 친화적 명령어 생성
     */
    generateUserFriendlyCommand(config) {
        const { flags = [], servers = [] } = config;
        
        if (flags.length === 0 && servers.length <= 1) {
            return "기본 설정으로 실행됩니다.";
        }
        
        let command = "다음 명령어로 같은 설정을 사용할 수 있습니다:\n";
        command += `\`${flags.join(' ')}\``;
        
        return command;
    }

    /**
     * 성능 추정
     */
    estimatePerformance(servers) {
        const serverList = Array.isArray(servers) ? servers : [servers];
        
        let estimatedTime = 'fast';
        let resourceUsage = 'low';
        
        if (serverList.length > 2) {
            estimatedTime = 'medium';
            resourceUsage = 'medium';
        }
        
        if (serverList.includes('playwright')) {
            estimatedTime = 'slow';
            resourceUsage = 'high';
        }
        
        if (serverList.length > 3) {
            estimatedTime = 'slow';
            resourceUsage = 'high';
        }
        
        return {
            estimatedTime,
            resourceUsage,
            parallelCapable: serverList.length > 1,
            cacheEffective: serverList.includes('context7') || serverList.includes('sequential')
        };
    }

    // ===== 유틸리티 메서드 =====

    matchFilePattern(file, pattern) {
        // 간단한 glob 패턴 매칭
        const regex = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.');
        
        return new RegExp(regex).test(file);
    }

    generateRecommendationReason(server, workTypes) {
        const serverConfig = this.availableServers[server];
        const topWorkType = workTypes[0];
        
        if (topWorkType) {
            return `${topWorkType.type} 작업에 적합한 ${serverConfig.capabilities.join(', ')} 기능`;
        }
        
        return `${serverConfig.capabilities.join(', ')} 기능 제공`;
    }

    findSimilarTasks(userInput) {
        const inputKeywords = userInput.toLowerCase().split(' ');
        
        return this.usageHistory.filter(history => {
            const historyKeywords = history.userInput.toLowerCase().split(' ');
            const commonKeywords = inputKeywords.filter(keyword => 
                historyKeywords.some(hKeyword => hKeyword.includes(keyword) || keyword.includes(hKeyword))
            );
            
            return commonKeywords.length > 0;
        });
    }

    calculateHistoricalSuccess(server, similarTasks) {
        const tasksWithServer = similarTasks.filter(task => 
            task.config && task.config.servers && task.config.servers.includes(server)
        );
        
        if (tasksWithServer.length === 0) return 0;
        
        const successfulTasks = tasksWithServer.filter(task => task.success !== false);
        return successfulTasks.length / tasksWithServer.length;
    }

    calculateOverallConfidence(recommendations) {
        if (recommendations.length === 0) return 0;
        
        const totalScore = recommendations.reduce((sum, rec) => sum + rec.score, 0);
        return Math.min(totalScore / recommendations.length, 1.0);
    }

    getHistoryBasedServers(context) {
        // 사용 이력에서 가장 성공적이었던 서버 조합 반환
        const frequentServers = new Map();
        
        this.usageHistory.forEach(history => {
            if (history.config && history.config.servers) {
                history.config.servers.forEach(server => {
                    frequentServers.set(server, (frequentServers.get(server) || 0) + 1);
                });
            }
        });
        
        return Array.from(frequentServers.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
    }

    getFallbackConfig() {
        return {
            mode: 'fallback',
            servers: ['context7'],
            flags: ['--c7'],
            explanation: "기본 설정을 사용합니다. Context7으로 문서 및 모범사례를 확인할 수 있습니다.",
            confidence: 0.5,
            estimatedPerformance: this.estimatePerformance(['context7']),
            userFriendlyCommand: "--c7"
        };
    }

    // ===== 저장/로드 메서드 =====

    async saveUsageHistory(userInput, config) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            userInput: userInput,
            config: config,
            success: true // 추후 피드백 시스템으로 업데이트
        };
        
        this.usageHistory.push(historyEntry);
        
        // 최대 100개까지만 보관
        if (this.usageHistory.length > 100) {
            this.usageHistory = this.usageHistory.slice(-100);
        }
        
        try {
            await this.saveUsageHistoryToFile();
        } catch (error) {
            console.warn('사용 이력 저장 실패:', error.message);
        }
    }

    async saveUsageHistoryToFile() {
        const historyPath = path.join(__dirname, '../logs/mcp-usage-history.json');
        await fs.writeFile(historyPath, JSON.stringify(this.usageHistory, null, 2));
    }

    async loadUsageHistory() {
        try {
            const historyPath = path.join(__dirname, '../logs/mcp-usage-history.json');
            const data = await fs.readFile(historyPath, 'utf8');
            this.usageHistory = JSON.parse(data);
            console.log(`📚 사용 이력 로드 완료: ${this.usageHistory.length}건`);
        } catch (error) {
            console.log('📝 새로운 사용 이력 시작');
            this.usageHistory = [];
        }
    }

    async loadUserPreferences() {
        try {
            const prefsPath = path.join(__dirname, '../config/user-mcp-preferences.json');
            const data = await fs.readFile(prefsPath, 'utf8');
            const prefs = JSON.parse(data);
            
            Object.entries(prefs).forEach(([key, value]) => {
                this.userPreferences.set(key, value);
            });
            
            console.log(`⚙️ 사용자 설정 로드 완료: ${this.userPreferences.size}개`);
        } catch (error) {
            console.log('📋 기본 사용자 설정 사용');
        }
    }

    /**
     * 사용자 피드백 수집
     */
    async collectFeedback(sessionId, rating, comments) {
        const historyEntry = this.usageHistory.find(h => h.sessionId === sessionId);
        if (historyEntry) {
            historyEntry.feedback = {
                rating: rating,
                comments: comments,
                timestamp: new Date().toISOString()
            };
            historyEntry.success = rating >= 3; // 5점 만점에 3점 이상이면 성공
            
            await this.saveUsageHistoryToFile();
            console.log(`📝 피드백 수집 완료: ${rating}점`);
        }
    }

    /**
     * 통계 정보 제공
     */
    getStatistics() {
        const stats = {
            totalUsages: this.usageHistory.length,
            serverPopularity: new Map(),
            successRate: 0,
            averageRating: 0
        };
        
        this.usageHistory.forEach(history => {
            // 서버 인기도
            if (history.config && history.config.servers) {
                history.config.servers.forEach(server => {
                    stats.serverPopularity.set(server, 
                        (stats.serverPopularity.get(server) || 0) + 1
                    );
                });
            }
            
            // 성공률 및 평점
            if (history.feedback) {
                stats.averageRating += history.feedback.rating;
            }
        });
        
        const feedbackCount = this.usageHistory.filter(h => h.feedback).length;
        if (feedbackCount > 0) {
            stats.averageRating /= feedbackCount;
            stats.successRate = this.usageHistory.filter(h => h.success).length / this.usageHistory.length;
        }
        
        return stats;
    }
}

module.exports = SmartMcpOrchestrator;