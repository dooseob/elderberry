-- 엘더베리 에이전트 시스템 SQLite 초기화 스크립트
-- 에이전트 로그, 통계, MCP 도구 실행 정보 저장용

-- 1. MCP 도구 실행 로그
CREATE TABLE IF NOT EXISTS mcp_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    tool_name TEXT NOT NULL, -- sequential-thinking, context7, filesystem, memory, github
    task_description TEXT NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NULL,
    duration_ms INTEGER NULL,
    status TEXT DEFAULT 'running', -- running, completed, failed
    result_summary TEXT NULL,
    error_message TEXT NULL,
    context_size INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 서브에이전트 실행 로그
CREATE TABLE IF NOT EXISTS agent_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    agent_name TEXT NOT NULL, -- CLAUDE_GUIDE, DEBUG, API_DOCUMENTATION, etc.
    task_type TEXT NOT NULL,
    task_description TEXT NOT NULL,
    custom_command TEXT NULL, -- /max, /auto, /smart 등
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NULL,
    duration_ms INTEGER NULL,
    status TEXT DEFAULT 'running',
    result_summary TEXT NULL,
    error_message TEXT NULL,
    mcp_tools_used TEXT NULL, -- JSON array of used MCP tools
    parallel_execution BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 커스텀 명령어 사용 통계
CREATE TABLE IF NOT EXISTS custom_command_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command_name TEXT NOT NULL, -- /max, /auto, /smart, /rapid, /deep, /sync
    task_category TEXT NULL, -- 'refactoring', 'debugging', 'documentation', etc.
    execution_time_ms INTEGER NOT NULL,
    parallel_tasks INTEGER DEFAULT 1,
    success BOOLEAN NOT NULL,
    agents_involved TEXT NULL, -- JSON array
    mcp_tools_used TEXT NULL, -- JSON array
    user_satisfaction INTEGER NULL, -- 1-5 rating
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. API 호출 로그
CREATE TABLE IF NOT EXISTS api_call_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL, -- GET, POST, PUT, DELETE
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    request_size_bytes INTEGER NULL,
    response_size_bytes INTEGER NULL,
    user_agent TEXT NULL,
    ip_address TEXT NULL,
    error_message TEXT NULL,
    called_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 시스템 성능 메트릭
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL, -- 'memory_usage', 'cpu_usage', 'db_query_time', etc.
    metric_value REAL NOT NULL,
    unit TEXT NOT NULL, -- 'MB', 'percent', 'ms', etc.
    context TEXT NULL, -- additional context
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 외부 API 캐시 (카카오맵, 공공데이터 등)
CREATE TABLE IF NOT EXISTS external_api_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_provider TEXT NOT NULL, -- 'kakao', 'public_data', etc.
    cache_key TEXT NOT NULL UNIQUE,
    request_params TEXT NULL, -- JSON
    response_data TEXT NOT NULL, -- JSON
    expires_at DATETIME NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. 사용자 활동 패턴
CREATE TABLE IF NOT EXISTS user_activity_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NULL,
    session_id TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- 'login', 'search', 'view_facility', etc.
    activity_data TEXT NULL, -- JSON
    page_url TEXT NULL,
    referrer TEXT NULL,
    user_agent TEXT NULL,
    duration_seconds INTEGER NULL,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_mcp_executions_session ON mcp_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_mcp_executions_tool ON mcp_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_mcp_executions_time ON mcp_executions(start_time);

CREATE INDEX IF NOT EXISTS idx_agent_executions_session ON agent_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON agent_executions(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_executions_command ON agent_executions(custom_command);

CREATE INDEX IF NOT EXISTS idx_command_stats_command ON custom_command_stats(command_name);
CREATE INDEX IF NOT EXISTS idx_command_stats_time ON custom_command_stats(executed_at);

CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_call_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_time ON api_call_logs(called_at);

CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_time ON performance_metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_cache_provider ON external_api_cache(api_provider);
CREATE INDEX IF NOT EXISTS idx_cache_key ON external_api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON external_api_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_session ON user_activity_patterns(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity_patterns(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_time ON user_activity_patterns(occurred_at);