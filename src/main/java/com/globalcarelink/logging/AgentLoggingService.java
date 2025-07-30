package com.globalcarelink.logging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 에이전트 시스템 SQLite 로깅 서비스
 * MCP 도구, 서브에이전트, 커스텀 명령어 실행 로그 관리
 */
@Service
public class AgentLoggingService {

    @Autowired
    @Qualifier("sqliteJdbcTemplate")
    private JdbcTemplate sqliteJdbcTemplate;

    @Value("${sqlite.logging.enabled:true}")
    private boolean loggingEnabled;

    @Value("${sqlite.logging.batch-size:100}")
    private int batchSize;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> activeExecutions = new ConcurrentHashMap<>();

    /**
     * MCP 도구 실행 시작 로그
     */
    @Async
    public String logMCPExecutionStart(String toolName, String taskDescription, String sessionId) {
        if (!loggingEnabled) return null;

        String executionId = UUID.randomUUID().toString();
        
        try {
            String sql = """
                INSERT INTO mcp_executions (session_id, tool_name, task_description, status)
                VALUES (?, ?, ?, 'running')
                """;
            
            sqliteJdbcTemplate.update(sql, sessionId, toolName, taskDescription);
            activeExecutions.put(executionId, toolName);
            
            System.out.println("🔍 MCP 도구 실행 시작 로깅: " + toolName + " - " + taskDescription);
            return executionId;
            
        } catch (Exception e) {
            System.err.println("❌ MCP 실행 로깅 실패: " + e.getMessage());
            return null;
        }
    }

    /**
     * MCP 도구 실행 완료 로그
     */
    @Async
    public void logMCPExecutionEnd(String executionId, boolean success, String resultSummary, String errorMessage, long durationMs) {
        if (!loggingEnabled || executionId == null) return;

        try {
            String status = success ? "completed" : "failed";
            String sql = """
                UPDATE mcp_executions 
                SET end_time = CURRENT_TIMESTAMP, duration_ms = ?, status = ?, result_summary = ?, error_message = ?
                WHERE session_id = ? AND status = 'running'
                """;
            
            sqliteJdbcTemplate.update(sql, durationMs, status, resultSummary, errorMessage, executionId);
            activeExecutions.remove(executionId);
            
            String toolName = activeExecutions.getOrDefault(executionId, "unknown");
            System.out.println("✅ MCP 도구 실행 완료 로깅: " + toolName + " (" + durationMs + "ms)");
            
        } catch (Exception e) {
            System.err.println("❌ MCP 완료 로깅 실패: " + e.getMessage());
        }
    }

    /**
     * 서브에이전트 실행 로그
     */
    @Async
    public void logAgentExecution(String agentName, String taskType, String taskDescription, 
                                String customCommand, List<String> mcpToolsUsed, boolean parallelExecution,
                                boolean success, String resultSummary, long durationMs, String sessionId) {
        if (!loggingEnabled) return;

        try {
            String mcpToolsJson = listToJson(mcpToolsUsed);
            String status = success ? "completed" : "failed";
            
            String sql = """
                INSERT INTO agent_executions 
                (session_id, agent_name, task_type, task_description, custom_command, 
                 duration_ms, status, result_summary, mcp_tools_used, parallel_execution)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            sqliteJdbcTemplate.update(sql, sessionId, agentName, taskType, taskDescription, 
                customCommand, durationMs, status, resultSummary, mcpToolsJson, parallelExecution);
            
            System.out.println("🤖 에이전트 실행 로깅: " + agentName + " - " + customCommand + " (" + durationMs + "ms)");
            
        } catch (Exception e) {
            System.err.println("❌ 에이전트 실행 로깅 실패: " + e.getMessage());
        }
    }

    /**
     * 커스텀 명령어 사용 통계 로그
     */
    @Async
    public void logCustomCommandUsage(String commandName, String taskCategory, long executionTime, 
                                    int parallelTasks, boolean success, List<String> agentsInvolved, 
                                    List<String> mcpToolsUsed, Integer userSatisfaction) {
        if (!loggingEnabled) return;

        try {
            String agentsJson = listToJson(agentsInvolved);
            String mcpToolsJson = listToJson(mcpToolsUsed);
            
            String sql = """
                INSERT INTO custom_command_stats 
                (command_name, task_category, execution_time_ms, parallel_tasks, success, 
                 agents_involved, mcp_tools_used, user_satisfaction)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            sqliteJdbcTemplate.update(sql, commandName, taskCategory, executionTime, parallelTasks, 
                success, agentsJson, mcpToolsJson, userSatisfaction);
            
            System.out.println("📊 커스텀 명령어 통계 로깅: " + commandName + " - " + success + " (" + executionTime + "ms)");
            
        } catch (Exception e) {
            System.err.println("❌ 커스텀 명령어 통계 로깅 실패: " + e.getMessage());
        }
    }

    /**
     * API 호출 로그
     */
    @Async
    public void logApiCall(String endpoint, String method, int statusCode, long responseTime, 
                          String userAgent, String ipAddress, String errorMessage, String sessionId) {
        if (!loggingEnabled) return;

        try {
            String sql = """
                INSERT INTO api_call_logs 
                (session_id, endpoint, method, status_code, response_time_ms, user_agent, ip_address, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            sqliteJdbcTemplate.update(sql, sessionId, endpoint, method, statusCode, responseTime, 
                userAgent, ipAddress, errorMessage);
            
        } catch (Exception e) {
            System.err.println("❌ API 호출 로깅 실패: " + e.getMessage());
        }
    }

    /**
     * 성능 메트릭 로그
     */
    @Async
    public void logPerformanceMetric(String metricType, double metricValue, String unit, String context) {
        if (!loggingEnabled) return;

        try {
            String sql = """
                INSERT INTO performance_metrics (metric_type, metric_value, unit, context)
                VALUES (?, ?, ?, ?)
                """;
            
            sqliteJdbcTemplate.update(sql, metricType, metricValue, unit, context);
            
        } catch (Exception e) {
            System.err.println("❌ 성능 메트릭 로깅 실패: " + e.getMessage());
        }
    }

    /**
     * 외부 API 캐시 저장
     */
    public void cacheExternalApiResponse(String apiProvider, String cacheKey, Map<String, Object> requestParams, 
                                       Object responseData, LocalDateTime expiresAt) {
        if (!loggingEnabled) return;

        try {
            String requestParamsJson = mapToJson(requestParams);
            String responseDataJson = objectToJson(responseData);
            
            String sql = """
                INSERT OR REPLACE INTO external_api_cache 
                (api_provider, cache_key, request_params, response_data, expires_at, hit_count)
                VALUES (?, ?, ?, ?, ?, COALESCE((SELECT hit_count FROM external_api_cache WHERE cache_key = ?), 0))
                """;
            
            sqliteJdbcTemplate.update(sql, apiProvider, cacheKey, requestParamsJson, responseDataJson, 
                expiresAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), cacheKey);
            
        } catch (Exception e) {
            System.err.println("❌ 외부 API 캐시 저장 실패: " + e.getMessage());
        }
    }

    /**
     * 외부 API 캐시 조회
     */
    public String getCachedApiResponse(String cacheKey) {
        if (!loggingEnabled) return null;

        try {
            String sql = """
                SELECT response_data FROM external_api_cache 
                WHERE cache_key = ? AND expires_at > CURRENT_TIMESTAMP
                """;
            
            List<String> results = sqliteJdbcTemplate.queryForList(sql, String.class, cacheKey);
            
            if (!results.isEmpty()) {
                // 히트 카운트 증가
                sqliteJdbcTemplate.update(
                    "UPDATE external_api_cache SET hit_count = hit_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE cache_key = ?", 
                    cacheKey
                );
                return results.get(0);
            }
            
        } catch (Exception e) {
            System.err.println("❌ 외부 API 캐시 조회 실패: " + e.getMessage());
        }
        
        return null;
    }

    /**
     * 사용자 활동 패턴 로그
     */
    @Async
    public void logUserActivity(String userId, String sessionId, String activityType, 
                              Map<String, Object> activityData, String pageUrl, String referrer) {
        if (!loggingEnabled) return;

        try {
            String activityDataJson = mapToJson(activityData);
            
            String sql = """
                INSERT INTO user_activity_patterns 
                (user_id, session_id, activity_type, activity_data, page_url, referrer)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
            
            sqliteJdbcTemplate.update(sql, userId, sessionId, activityType, activityDataJson, pageUrl, referrer);
            
        } catch (Exception e) {
            System.err.println("❌ 사용자 활동 로깅 실패: " + e.getMessage());
        }
    }

    // 유틸리티 메서드들
    private String listToJson(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private String mapToJson(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return "{}";
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private String objectToJson(Object obj) {
        if (obj == null) return "null";
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "null";
        }
    }
}