/**
 * 엘더베리 프로젝트 - 에이전트별 MCP 도구 최적화 매핑 설정
 * @version 2.1.0
 * @date 2025-08-03
 * @description 5개 MCP 도구와 6개 서브에이전트의 최적화된 조합 설정 + FSD 아키텍처 지원 (playwright MCP 제거됨)
 */

const AGENT_MCP_OPTIMIZATION_CONFIG = {
    // MCP 도구 정의 (2025-08-04 업데이트 - playwright 제거됨)
    MCP_TOOLS: {
        SEQUENTIAL_THINKING: 'mcp__sequential-thinking__sequentialthinking',
        CONTEXT7: 'mcp__context7__resolve-library-id',
        MEMORY: 'mcp__memory__search_nodes',
        FILESYSTEM: 'mcp__filesystem__list_directory',
        GITHUB: 'mcp__github__search_repositories'
        // PLAYWRIGHT: 'mcp__playwright__browser_navigate' - MCP 제거됨 (2025-08-04)
    },

    // 서브에이전트별 최적화된 MCP 도구 조합
    AGENT_MCP_COMBINATIONS: {
        CLAUDE_GUIDE: {
            primary: ['SEQUENTIAL_THINKING', 'MEMORY', 'CONTEXT7'],
            secondary: [], // playwright 제거됨
            specialty: 'architectural_guidance',
            description: '프로젝트 가이드라인 관리 및 아키텍처 검토',
            use_cases: [
                '프로젝트 아키텍처 설계 및 검토',
                '개발 가이드라인 수립 및 진화',
                '웹 UI/UX 가이드라인 자동 검증',
                '기술 스택 최적화 권장사항 제시'
            ]
        },

        DEBUG: {
            primary: ['SEQUENTIAL_THINKING', 'FILESYSTEM', 'MEMORY'],
            secondary: [], // playwright 제거됨
            specialty: 'systematic_debugging',
            description: '체계적 문제 해결 및 성능 최적화',
            use_cases: [
                '복잡한 버그 단계별 분석 및 해결',
                '시스템 성능 병목 지점 식별',
                '웹 애플리케이션 E2E 테스트 자동화',
                '로그 파일 분석 및 패턴 추출'
            ]
        },

        API_DOCUMENTATION: {
            primary: ['CONTEXT7', 'FILESYSTEM', 'GITHUB'],
            secondary: [], // playwright 제거됨
            specialty: 'automated_api_docs',
            description: '최신 API 문서 자동 생성 및 관리',
            use_cases: [
                '최신 API 표준 준수 문서 생성',
                'OpenAPI 스펙 자동 업데이트',
                'API 엔드포인트 자동 테스팅',
                'GitHub 자동 문서 커밋 및 배포'
            ]
        },

        TROUBLESHOOTING: {
            primary: ['MEMORY', 'FILESYSTEM', 'SEQUENTIAL_THINKING'],
            secondary: [],
            specialty: 'pattern_based_issue_resolution',
            description: '패턴 학습 기반 이슈 진단 및 해결책 추적',
            use_cases: [
                '과거 이슈 패턴 학습 및 매칭',
                '시스템 상태 종합 분석',
                '단계별 문제 진단 및 해결',
                '이슈 해결 히스토리 관리'
            ]
        },

        GOOGLE_SEO: {
            primary: ['CONTEXT7', 'FILESYSTEM', 'MEMORY'],
            secondary: [], // playwright 제거됨
            specialty: 'seo_optimization',
            description: '최신 SEO 가이드라인 및 시멘틱 마크업 최적화',
            use_cases: [
                '최신 SEO 가이드라인 적용',
                '메타태그 및 시멘틱 마크업',
                'Core Web Vitals 자동 측정',
                '페이지 성능 최적화 자동화'
            ]
        },

        SECURITY_AUDIT: {
            primary: ['SEQUENTIAL_THINKING', 'FILESYSTEM', 'MEMORY'],
            secondary: [], // playwright 제거됨
            specialty: 'security_audit',
            description: '종합적 보안 감사 및 취약점 분석',
            use_cases: [
                'API 키 및 민감 정보 자동 스캔',
                '웹 애플리케이션 보안 취약점 검증',
                'HTTPS 및 보안 헤더 자동 검증',
                '브라우저 보안 정책 테스팅'
            ]
        }
    },

    // 커스텀 명령어별 최적화된 에이전트 + MCP 조합
    CUSTOM_COMMAND_OPTIMIZATION: {
        '/max': {
            agents: ['CLAUDE_GUIDE', 'DEBUG', 'API_DOCUMENTATION', 'TROUBLESHOOTING', 'GOOGLE_SEO', 'SECURITY_AUDIT'],
            mcp_tools: ['SEQUENTIAL_THINKING', 'CONTEXT7', 'FILESYSTEM', 'MEMORY', 'GITHUB'] // playwright 제거됨,
            parallel_execution: true,
            performance_priority: 'MAXIMUM',
            description: '모든 리소스 최대 활용 - 복잡한 프로젝트 전체 분석 및 최적화'
        },

        '/auto': {
            agents: ['CLAUDE_GUIDE', 'DEBUG', 'API_DOCUMENTATION'],
            mcp_tools: ['SEQUENTIAL_THINKING', 'CONTEXT7', 'MEMORY', 'FILESYSTEM'] // playwright 제거됨,
            parallel_execution: true,
            performance_priority: 'HIGH',
            description: '자동화 우선 - 반복 작업 자동화 및 효율성 최적화'
        },

        '/smart': {
            agents: ['CLAUDE_GUIDE', 'TROUBLESHOOTING'],
            mcp_tools: ['MEMORY', 'CONTEXT7', 'FILESYSTEM'],
            parallel_execution: false,
            performance_priority: 'QUALITY',
            description: '품질 우선 - 정교한 분석과 최적화된 솔루션 제공'
        },

        '/rapid': {
            agents: ['DEBUG'],
            mcp_tools: ['FILESYSTEM', 'MEMORY'],
            parallel_execution: false,
            performance_priority: 'SPEED',
            description: '속도 우선 - 빠른 문제 해결 및 즉시 결과 제공'
        },

        '/deep': {
            agents: ['CLAUDE_GUIDE', 'DEBUG'],
            mcp_tools: ['SEQUENTIAL_THINKING', 'CONTEXT7', 'MEMORY'],
            parallel_execution: false,
            performance_priority: 'DEPTH',
            description: '심층 분석 - 근본 원인 분석 및 종합적 해결책'
        },

        '/sync': {
            agents: ['API_DOCUMENTATION', 'TROUBLESHOOTING'],
            mcp_tools: ['GITHUB', 'MEMORY', 'FILESYSTEM'],
            parallel_execution: true,
            performance_priority: 'COLLABORATION',
            description: '협업 최적화 - 팀 동기화 및 문서화 자동화'
        }
    },

    // FSD (Feature-Sliced Design) 아키텍처 지원 설정
    FSD_ARCHITECTURE_SUPPORT: {
        // FSD 계층 구조 정의
        LAYERS: {
            APP: 'app',
            PAGES: 'pages', 
            WIDGETS: 'widgets',
            FEATURES: 'features',
            ENTITIES: 'entities',
            SHARED: 'shared'
        },
        
        // FSD 세그먼트 정의
        SEGMENTS: {
            UI: 'ui',
            MODEL: 'model',
            API: 'api',
            LIB: 'lib',
            CONFIG: 'config'
        },
        
        // 계층별 의존성 규칙
        DEPENDENCY_RULES: {
            app: ['pages', 'widgets', 'features', 'entities', 'shared'],
            pages: ['widgets', 'features', 'entities', 'shared'],
            widgets: ['features', 'entities', 'shared'],
            features: ['entities', 'shared'],
            entities: ['shared'],
            shared: []
        },
        
        // FSD 레이어별 에이전트 특화 설정
        LAYER_AGENT_MAPPING: {
            widgets: {
                primary_agent: 'CLAUDE_GUIDE',
                secondary_agents: ['DEBUG'],
                mcp_tools: ['SEQUENTIAL_THINKING', 'MEMORY'],
                focus: 'UI 위젯 구조 최적화 및 재사용성'
            },
            entities: {
                primary_agent: 'API_DOCUMENTATION',
                secondary_agents: ['CLAUDE_GUIDE', 'DEBUG'],
                mcp_tools: ['CONTEXT7', 'MEMORY', 'FILESYSTEM'],
                focus: '도메인 모델 설계 및 타입 안전성'
            },
            features: {
                primary_agent: 'DEBUG',
                secondary_agents: ['CLAUDE_GUIDE', 'TROUBLESHOOTING'],
                mcp_tools: ['SEQUENTIAL_THINKING', 'FILESYSTEM', 'MEMORY'],
                focus: '비즈니스 로직 구현 및 최적화'
            },
            shared: {
                primary_agent: 'CLAUDE_GUIDE',
                secondary_agents: ['API_DOCUMENTATION'],
                mcp_tools: ['CONTEXT7', 'FILESYSTEM', 'GITHUB'],
                focus: '공통 라이브러리 및 유틸리티 최적화'
            }
        },
        
        // Public API 패턴 검증 규칙
        PUBLIC_API_RULES: {
            required_index_files: ['index.ts', 'index.js'],
            export_patterns: ['named_exports', 'type_exports'],
            import_validation: true,
            capsulation_check: true
        }
    },
    
    // 성능 최적화 설정
    PERFORMANCE_SETTINGS: {
        MAX_PARALLEL_AGENTS: 6,
        MCP_TIMEOUT_MS: 30000,
        MEMORY_RETENTION_DAYS: 30,
        CACHE_SIZE_MB: 100,
        LOG_LEVEL: 'INFO'
    },

    // SQLite 로깅 통합 설정
    SQLITE_INTEGRATION: {
        LOG_AGENT_EXECUTIONS: true,
        LOG_MCP_USAGE: true,
        LOG_PERFORMANCE_METRICS: true,
        LOG_CUSTOM_COMMANDS: true,
        BATCH_SIZE: 50,
        FLUSH_INTERVAL_SECONDS: 60
    },

    // 학습 및 개선 시스템
    LEARNING_SYSTEM: {
        PATTERN_RECOGNITION: true,
        SUCCESS_RATE_TRACKING: true,
        PERFORMANCE_OPTIMIZATION: true,
        USER_FEEDBACK_INTEGRATION: true,
        AUTO_IMPROVEMENT: true
    }
};

/**
 * FSD 레이어별 최적 에이전트 조합 가져오기
 */
function getFSDLayerOptimization(layerName) {
    const config = AGENT_MCP_OPTIMIZATION_CONFIG.FSD_ARCHITECTURE_SUPPORT.LAYER_AGENT_MAPPING[layerName];
    if (!config) {
        throw new Error(`Unknown FSD layer: ${layerName}`);
    }
    
    return {
        primary_agent: config.primary_agent,
        secondary_agents: config.secondary_agents,
        mcp_tools: config.mcp_tools.map(tool => AGENT_MCP_OPTIMIZATION_CONFIG.MCP_TOOLS[tool]),
        focus: config.focus,
        layer_type: layerName
    };
}

/**
 * FSD 계층 의존성 검증
 */
function validateFSDDependency(fromLayer, toLayer) {
    const dependencyRules = AGENT_MCP_OPTIMIZATION_CONFIG.FSD_ARCHITECTURE_SUPPORT.DEPENDENCY_RULES;
    const allowedDependencies = dependencyRules[fromLayer];
    
    if (!allowedDependencies) {
        return { valid: false, reason: `Unknown layer: ${fromLayer}` };
    }
    
    if (!allowedDependencies.includes(toLayer)) {
        return { 
            valid: false, 
            reason: `Invalid dependency: ${fromLayer} cannot depend on ${toLayer}`,
            allowed: allowedDependencies
        };
    }
    
    return { valid: true, reason: 'Valid FSD dependency' };
}

/**
 * FSD Public API 패턴 검증
 */
function validatePublicAPIPattern(layerPath, exports) {
    const rules = AGENT_MCP_OPTIMIZATION_CONFIG.FSD_ARCHITECTURE_SUPPORT.PUBLIC_API_RULES;
    const validationResults = {
        hasIndexFile: false,
        hasNamedExports: false,
        hasTypeExports: false,
        isEncapsulated: false,
        violations: []
    };
    
    // index.ts/js 파일 존재 확인
    const hasIndex = rules.required_index_files.some(file => 
        layerPath.endsWith(file) || layerPath.includes(`/${file}`)
    );
    validationResults.hasIndexFile = hasIndex;
    
    if (!hasIndex) {
        validationResults.violations.push('Missing index.ts/js file for Public API');
    }
    
    // 내보내기 패턴 검증
    if (exports && Array.isArray(exports)) {
        validationResults.hasNamedExports = exports.some(exp => exp.type === 'named');
        validationResults.hasTypeExports = exports.some(exp => exp.type === 'type');
        
        if (!validationResults.hasNamedExports) {
            validationResults.violations.push('Missing named exports in Public API');
        }
    }
    
    return validationResults;
}

/**
 * FSD 구조에 맞는 코드 생성 제안
 */
function suggestFSDCodeStructure(componentType, layerName, componentName) {
    const segments = AGENT_MCP_OPTIMIZATION_CONFIG.FSD_ARCHITECTURE_SUPPORT.SEGMENTS;
    const layers = AGENT_MCP_OPTIMIZATION_CONFIG.FSD_ARCHITECTURE_SUPPORT.LAYERS;
    
    const suggestions = {
        directory_structure: [],
        file_templates: {},
        import_patterns: [],
        best_practices: []
    };
    
    // 레이어별 구조 제안
    switch (layerName) {
        case layers.WIDGETS:
            suggestions.directory_structure = [
                `${layerName}/${componentName}/`,
                `${layerName}/${componentName}/${segments.UI}/`,
                `${layerName}/${componentName}/index.ts`
            ];
            suggestions.file_templates = {
                [`${segments.UI}/${componentName}.tsx`]: 'React component with TypeScript',
                'index.ts': 'Public API exports'
            };
            suggestions.import_patterns = [
                `import { ${componentName} } from 'widgets/${componentName}';`
            ];
            break;
            
        case layers.ENTITIES:
            suggestions.directory_structure = [
                `${layerName}/${componentName}/`,
                `${layerName}/${componentName}/${segments.MODEL}/`,
                `${layerName}/${componentName}/index.ts`
            ];
            suggestions.file_templates = {
                [`${segments.MODEL}/types.ts`]: 'TypeScript type definitions',
                'index.ts': 'Public API exports'
            };
            suggestions.import_patterns = [
                `import { ${componentName}Type } from 'entities/${componentName}';`
            ];
            break;
            
        case layers.FEATURES:
            suggestions.directory_structure = [
                `${layerName}/${componentName}/`,
                `${layerName}/${componentName}/${segments.UI}/`,
                `${layerName}/${componentName}/${segments.MODEL}/`,
                `${layerName}/${componentName}/${segments.API}/`,
                `${layerName}/${componentName}/index.ts`
            ];
            break;
            
        case layers.SHARED:
            suggestions.directory_structure = [
                `${layerName}/${componentName}/`,
                `${layerName}/${componentName}/index.ts`
            ];
            break;
    }
    
    suggestions.best_practices = [
        'Use Public API pattern (index.ts) for all exports',
        'Follow FSD dependency rules',
        'Keep components focused and cohesive',
        'Use TypeScript for type safety',
        'Document component interfaces'
    ];
    
    return suggestions;
}

/**
 * 에이전트별 MCP 도구 조합 가져오기
 */
function getAgentMCPCombination(agentName) {
    const config = AGENT_MCP_OPTIMIZATION_CONFIG.AGENT_MCP_COMBINATIONS[agentName];
    if (!config) {
        throw new Error(`Unknown agent: ${agentName}`);
    }
    
    return {
        primary: config.primary.map(tool => AGENT_MCP_OPTIMIZATION_CONFIG.MCP_TOOLS[tool]),
        secondary: config.secondary.map(tool => AGENT_MCP_OPTIMIZATION_CONFIG.MCP_TOOLS[tool]),
        all: [...config.primary, ...config.secondary].map(tool => AGENT_MCP_OPTIMIZATION_CONFIG.MCP_TOOLS[tool]),
        specialty: config.specialty,
        description: config.description,
        use_cases: config.use_cases
    };
}

/**
 * 커스텀 명령어별 최적화 설정 가져오기
 */
function getCustomCommandOptimization(command) {
    const config = AGENT_MCP_OPTIMIZATION_CONFIG.CUSTOM_COMMAND_OPTIMIZATION[command];
    if (!config) {
        throw new Error(`Unknown custom command: ${command}`);
    }
    
    return {
        agents: config.agents,
        mcp_tools: config.mcp_tools.map(tool => AGENT_MCP_OPTIMIZATION_CONFIG.MCP_TOOLS[tool]),
        parallel_execution: config.parallel_execution,
        performance_priority: config.performance_priority,
        description: config.description
    };
}

/**
 * 시스템 상태 검증 (FSD 지원 포함)
 */
function validateSystemConfiguration() {
    const requiredMCPTools = Object.keys(AGENT_MCP_OPTIMIZATION_CONFIG.MCP_TOOLS);
    const requiredAgents = Object.keys(AGENT_MCP_OPTIMIZATION_CONFIG.AGENT_MCP_COMBINATIONS);
    const customCommands = Object.keys(AGENT_MCP_OPTIMIZATION_CONFIG.CUSTOM_COMMAND_OPTIMIZATION);
    const fsdLayers = Object.keys(AGENT_MCP_OPTIMIZATION_CONFIG.FSD_ARCHITECTURE_SUPPORT.LAYERS);
    
    return {
        mcp_tools_count: requiredMCPTools.length,
        agents_count: requiredAgents.length,
        custom_commands_count: customCommands.length,
        fsd_layers_supported: fsdLayers.length,
        sqlite_integration: AGENT_MCP_OPTIMIZATION_CONFIG.SQLITE_INTEGRATION.LOG_AGENT_EXECUTIONS,
        learning_system: AGENT_MCP_OPTIMIZATION_CONFIG.LEARNING_SYSTEM.PATTERN_RECOGNITION,
        fsd_architecture_support: true,
        status: 'OPTIMIZED_WITH_FSD_NO_PLAYWRIGHT',
        last_updated: '2025-08-04 (playwright MCP 제거)'
    };
}

module.exports = {
    AGENT_MCP_OPTIMIZATION_CONFIG,
    getAgentMCPCombination,
    getCustomCommandOptimization,
    validateSystemConfiguration,
    // FSD 지원 함수들
    getFSDLayerOptimization,
    validateFSDDependency,
    validatePublicAPIPattern,
    suggestFSDCodeStructure
};