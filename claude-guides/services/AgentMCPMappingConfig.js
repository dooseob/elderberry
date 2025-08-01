/**
 * 엘더베리 프로젝트 - 에이전트별 MCP 도구 최적화 매핑 설정
 * @version 2.0.0
 * @date 2025-08-01
 * @description 6개 MCP 도구와 6개 서브에이전트의 최적화된 조합 설정
 */

const AGENT_MCP_OPTIMIZATION_CONFIG = {
    // MCP 도구 정의 (2025-08-01 업데이트)
    MCP_TOOLS: {
        SEQUENTIAL_THINKING: 'mcp__sequential-thinking__sequentialthinking',
        CONTEXT7: 'mcp__context7__resolve-library-id',
        MEMORY: 'mcp__memory__search_nodes',
        FILESYSTEM: 'mcp__filesystem__list_directory',
        GITHUB: 'mcp__github__search_repositories',
        PLAYWRIGHT: 'mcp__playwright__browser_navigate'
    },

    // 서브에이전트별 최적화된 MCP 도구 조합
    AGENT_MCP_COMBINATIONS: {
        CLAUDE_GUIDE: {
            primary: ['SEQUENTIAL_THINKING', 'MEMORY', 'CONTEXT7'],
            secondary: ['PLAYWRIGHT'],
            specialty: 'architectural_guidance_with_web_verification',
            description: '프로젝트 가이드라인 관리 + 웹 UI 가이드라인 준수 확인',
            use_cases: [
                '프로젝트 아키텍처 설계 및 검토',
                '개발 가이드라인 수립 및 진화',
                '웹 UI/UX 가이드라인 자동 검증',
                '기술 스택 최적화 권장사항 제시'
            ]
        },

        DEBUG: {
            primary: ['SEQUENTIAL_THINKING', 'FILESYSTEM', 'MEMORY'],
            secondary: ['PLAYWRIGHT'],
            specialty: 'systematic_debugging_with_web_testing',
            description: '체계적 문제 해결 + 웹 브라우저 자동 테스팅',
            use_cases: [
                '복잡한 버그 단계별 분석 및 해결',
                '시스템 성능 병목 지점 식별',
                '웹 애플리케이션 E2E 테스트 자동화',
                '로그 파일 분석 및 패턴 추출'
            ]
        },

        API_DOCUMENTATION: {
            primary: ['CONTEXT7', 'FILESYSTEM', 'GITHUB'],
            secondary: ['PLAYWRIGHT'],
            specialty: 'automated_api_docs_with_testing',
            description: '최신 API 문서 자동 생성 + 엔드포인트 자동 테스팅',
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
            secondary: ['PLAYWRIGHT'],
            specialty: 'automated_seo_performance_optimization',
            description: '최신 SEO 가이드라인 + 웹 성능 자동 검증',
            use_cases: [
                '최신 SEO 가이드라인 적용',
                '메타태그 및 시멘틱 마크업',
                'Core Web Vitals 자동 측정',
                '페이지 성능 최적화 자동화'
            ]
        },

        SECURITY_AUDIT: {
            primary: ['SEQUENTIAL_THINKING', 'FILESYSTEM', 'MEMORY'],
            secondary: ['PLAYWRIGHT'],
            specialty: 'comprehensive_security_testing',
            description: '종합적 보안 감사 + 브라우저 보안 자동화',
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
            mcp_tools: ['SEQUENTIAL_THINKING', 'CONTEXT7', 'FILESYSTEM', 'MEMORY', 'GITHUB', 'PLAYWRIGHT'],
            parallel_execution: true,
            performance_priority: 'MAXIMUM',
            description: '모든 리소스 최대 활용 - 복잡한 프로젝트 전체 분석 및 최적화'
        },

        '/auto': {
            agents: ['CLAUDE_GUIDE', 'DEBUG', 'API_DOCUMENTATION'],
            mcp_tools: ['SEQUENTIAL_THINKING', 'CONTEXT7', 'MEMORY', 'PLAYWRIGHT'],
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
 * 시스템 상태 검증
 */
function validateSystemConfiguration() {
    const requiredMCPTools = Object.keys(AGENT_MCP_OPTIMIZATION_CONFIG.MCP_TOOLS);
    const requiredAgents = Object.keys(AGENT_MCP_OPTIMIZATION_CONFIG.AGENT_MCP_COMBINATIONS);
    const customCommands = Object.keys(AGENT_MCP_OPTIMIZATION_CONFIG.CUSTOM_COMMAND_OPTIMIZATION);
    
    return {
        mcp_tools_count: requiredMCPTools.length,
        agents_count: requiredAgents.length,
        custom_commands_count: customCommands.length,
        sqlite_integration: AGENT_MCP_OPTIMIZATION_CONFIG.SQLITE_INTEGRATION.LOG_AGENT_EXECUTIONS,
        learning_system: AGENT_MCP_OPTIMIZATION_CONFIG.LEARNING_SYSTEM.PATTERN_RECOGNITION,
        status: 'OPTIMIZED',
        last_updated: '2025-08-01'
    };
}

module.exports = {
    AGENT_MCP_OPTIMIZATION_CONFIG,
    getAgentMCPCombination,
    getCustomCommandOptimization,
    validateSystemConfiguration
};