package com.globalcarelink.logging;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 에이전트 시스템 SQLite 로깅 REST API 컨트롤러
 * JavaScript SQLiteAgentLogger와 Spring Boot AgentLoggingService 연동
 */
@RestController
@RequestMapping("/api/logging")
@CrossOrigin(origins = "*") // 개발환경에서 CORS 허용
public class AgentLoggingController {

    @Autowired
    private AgentLoggingService agentLoggingService;

    /**
     * MCP 도구 실행 시작 로깅
     * POST /api/logging/mcp/execution/start
     */
    @PostMapping("/mcp/execution/start")
    public ResponseEntity<Map<String, Object>> logMCPExecutionStart(@RequestBody Map<String, Object> request) {
        try {
            String executionId = (String) request.get("executionId");
            String toolName = (String) request.get("toolName");
            String taskDescription = (String) request.get("taskDescription");
            String sessionId = (String) request.get("sessionId");
            
            String dbExecutionId = agentLoggingService.logMCPExecutionStart(toolName, taskDescription, sessionId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "executionId", executionId,
                "dbExecutionId", dbExecutionId,
                "message", "MCP 실행 시작 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * MCP 도구 실행 완료 로깅
     * POST /api/logging/mcp/execution/end
     */
    @PostMapping("/mcp/execution/end")
    public ResponseEntity<Map<String, Object>> logMCPExecutionEnd(@RequestBody Map<String, Object> request) {
        try {
            String executionId = (String) request.get("executionId");
            Boolean success = (Boolean) request.get("success");
            String resultSummary = (String) request.get("resultSummary");
            String errorMessage = (String) request.get("errorMessage");
            Long durationMs = Long.valueOf(request.get("durationMs").toString());
            
            agentLoggingService.logMCPExecutionEnd(executionId, success, resultSummary, errorMessage, durationMs);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "MCP 실행 완료 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 에이전트 실행 로깅
     * POST /api/logging/agent/execution
     */
    @PostMapping("/agent/execution")
    public ResponseEntity<Map<String, Object>> logAgentExecution(@RequestBody Map<String, Object> request) {
        try {
            String sessionId = (String) request.get("sessionId");
            String agentName = (String) request.get("agentName");
            String taskType = (String) request.get("taskType");
            String taskDescription = (String) request.get("taskDescription");
            String customCommand = (String) request.get("customCommand");
            @SuppressWarnings("unchecked")
            List<String> mcpToolsUsed = (List<String>) request.get("mcpToolsUsed");
            Boolean parallelExecution = (Boolean) request.get("parallelExecution");
            Boolean success = (Boolean) request.get("success");
            String resultSummary = (String) request.get("resultSummary");
            Long durationMs = Long.valueOf(request.get("durationMs").toString());
            
            agentLoggingService.logAgentExecution(
                agentName, taskType, taskDescription, customCommand, 
                mcpToolsUsed, parallelExecution, success, resultSummary, 
                durationMs, sessionId
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "에이전트 실행 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 커스텀 명령어 사용 통계 로깅
     * POST /api/logging/command/stats
     */
    @PostMapping("/command/stats")
    public ResponseEntity<Map<String, Object>> logCustomCommandStats(@RequestBody Map<String, Object> request) {
        try {
            String commandName = (String) request.get("commandName");
            String taskCategory = (String) request.get("taskCategory");
            Long executionTime = Long.valueOf(request.get("executionTime").toString());
            Integer parallelTasks = Integer.valueOf(request.get("parallelTasks").toString());
            Boolean success = (Boolean) request.get("success");
            @SuppressWarnings("unchecked")
            List<String> agentsInvolved = (List<String>) request.get("agentsInvolved");
            @SuppressWarnings("unchecked")
            List<String> mcpToolsUsed = (List<String>) request.get("mcpToolsUsed");
            Integer userSatisfaction = request.get("userSatisfaction") != null ? 
                Integer.valueOf(request.get("userSatisfaction").toString()) : null;
            
            agentLoggingService.logCustomCommandUsage(
                commandName, taskCategory, executionTime, parallelTasks, 
                success, agentsInvolved, mcpToolsUsed, userSatisfaction
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "커스텀 명령어 통계 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 성능 메트릭 로깅
     * POST /api/logging/performance/metric
     */
    @PostMapping("/performance/metric")
    public ResponseEntity<Map<String, Object>> logPerformanceMetric(@RequestBody Map<String, Object> request) {
        try {
            String metricType = (String) request.get("metricType");
            Double metricValue = Double.valueOf(request.get("metricValue").toString());
            String unit = (String) request.get("unit");
            String context = (String) request.get("context");
            
            agentLoggingService.logPerformanceMetric(metricType, metricValue, unit, context);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "성능 메트릭 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 시스템 상태 로깅
     * POST /api/logging/system/status
     */
    @PostMapping("/system/status")
    public ResponseEntity<Map<String, Object>> logSystemStatus(@RequestBody Map<String, Object> request) {
        try {
            String sessionId = (String) request.get("sessionId");
            Integer totalExecutions = Integer.valueOf(request.get("totalExecutions").toString());
            Integer successfulExecutions = Integer.valueOf(request.get("successfulExecutions").toString());
            Integer failedExecutions = Integer.valueOf(request.get("failedExecutions").toString());
            Double successRate = Double.valueOf(request.get("successRate").toString());
            Double averageExecutionTime = Double.valueOf(request.get("averageExecutionTime").toString());
            @SuppressWarnings("unchecked")
            List<String> activeAgents = (List<String>) request.get("activeAgents");
            String systemHealth = (String) request.get("systemHealth");
            
            // AgentLoggingService에 시스템 상태 로깅 메서드가 없으므로 성능 메트릭으로 기록
            agentLoggingService.logPerformanceMetric("system-success-rate", successRate, "percentage", 
                String.format("세션: %s, 총실행: %d, 성공: %d, 실패: %d", 
                sessionId, totalExecutions, successfulExecutions, failedExecutions));
            
            agentLoggingService.logPerformanceMetric("system-avg-execution-time", averageExecutionTime, "ms", 
                String.format("활성 에이전트: %s, 시스템 상태: %s", 
                String.join(",", activeAgents), systemHealth));
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "시스템 상태 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * API 호출 로깅
     * POST /api/logging/api/call
     */
    @PostMapping("/api/call")
    public ResponseEntity<Map<String, Object>> logApiCall(@RequestBody Map<String, Object> request) {
        try {
            String endpoint = (String) request.get("endpoint");
            String method = (String) request.get("method");
            Integer statusCode = Integer.valueOf(request.get("statusCode").toString());
            Long responseTime = Long.valueOf(request.get("responseTime").toString());
            String userAgent = (String) request.get("userAgent");
            String ipAddress = (String) request.get("ipAddress");
            String errorMessage = (String) request.get("errorMessage");
            String sessionId = (String) request.get("sessionId");
            
            agentLoggingService.logApiCall(endpoint, method, statusCode, responseTime, 
                userAgent, ipAddress, errorMessage, sessionId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API 호출 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 외부 API 캐시 조회
     * GET /api/logging/cache/{cacheKey}
     */
    @GetMapping("/cache/{cacheKey}")
    public ResponseEntity<Map<String, Object>> getCachedApiResponse(@PathVariable String cacheKey) {
        try {
            String cachedResponse = agentLoggingService.getCachedApiResponse(cacheKey);
            
            if (cachedResponse != null) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "cached", true,
                    "data", cachedResponse
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "cached", false,
                    "message", "캐시된 데이터가 없습니다"
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 사용자 활동 패턴 로깅
     * POST /api/logging/user/activity
     */
    @PostMapping("/user/activity")
    public ResponseEntity<Map<String, Object>> logUserActivity(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String sessionId = (String) request.get("sessionId");
            String activityType = (String) request.get("activityType");
            @SuppressWarnings("unchecked")
            Map<String, Object> activityData = (Map<String, Object>) request.get("activityData");
            String pageUrl = (String) request.get("pageUrl");
            String referrer = (String) request.get("referrer");
            
            agentLoggingService.logUserActivity(userId, sessionId, activityType, 
                activityData, pageUrl, referrer);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "사용자 활동 로깅 완료"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * 로깅 서비스 상태 확인
     * GET /api/logging/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getLoggingHealth() {
        try {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "status", "healthy",
                "message", "SQLite 로깅 서비스 정상 작동 중",
                "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "status", "unhealthy",
                "error", e.getMessage()
            ));
        }
    }
}