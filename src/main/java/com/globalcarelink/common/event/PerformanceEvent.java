package com.globalcarelink.common.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * 성능 이슈 발생 시 생성되는 구조화된 이벤트
 * 느린 메서드, 메모리 사용량, DB 쿼리 성능 등을 추적
 */
@Slf4j
@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PerformanceEvent extends SystemEvent {
    
    private final String operationType; // SERVICE, REPOSITORY, CONTROLLER, HTTP_REQUEST
    private final String methodName;
    private final String className;
    private final Long executionTimeMs;
    private final Long thresholdMs;
    private final String performanceCategory; // SLOW_METHOD, SLOW_QUERY, MEMORY_HIGH, CPU_HIGH
    private final String requestUri;
    private final String httpMethod;
    private final String userEmail;
    private final Integer queryCount; // DB 쿼리 개수
    private final String queryType; // SELECT, INSERT, UPDATE, DELETE
    private final Long memoryUsedMb;
    private final Double cpuUsagePercent;
    private final Map<String, Object> performanceMetrics;
    
    @Builder
    public PerformanceEvent(Object source, String eventId, String traceId,
                           String operationType, String methodName, String className,
                           Long executionTimeMs, Long thresholdMs, String performanceCategory,
                           String requestUri, String httpMethod, String userEmail,
                           Integer queryCount, String queryType, Long memoryUsedMb,
                           Double cpuUsagePercent, Map<String, Object> performanceMetrics,
                           Map<String, Object> additionalMetadata) {
        
        super(source, eventId, traceId, "PERFORMANCE_EVENT", 
              buildMetadata(additionalMetadata, operationType, executionTimeMs));
        
        this.operationType = operationType;
        this.methodName = methodName;
        this.className = className;
        this.executionTimeMs = executionTimeMs;
        this.thresholdMs = thresholdMs;
        this.performanceCategory = performanceCategory != null ? performanceCategory : 
                                  categorizePerformance(operationType, executionTimeMs, thresholdMs);
        this.requestUri = requestUri;
        this.httpMethod = httpMethod;
        this.userEmail = userEmail;
        this.queryCount = queryCount;
        this.queryType = queryType;
        this.memoryUsedMb = memoryUsedMb;
        this.cpuUsagePercent = cpuUsagePercent;
        this.performanceMetrics = performanceMetrics != null ? performanceMetrics : new HashMap<>();
    }
    
    @Override
    public String getSeverity() {
        if (executionTimeMs == null || thresholdMs == null) return "LOW";
        
        double ratio = (double) executionTimeMs / thresholdMs;
        
        if (ratio >= 10) return "CRITICAL";  // 임계값의 10배 이상
        if (ratio >= 5) return "HIGH";       // 임계값의 5배 이상
        if (ratio >= 2) return "MEDIUM";     // 임계값의 2배 이상
        return "LOW";
    }
    
    @Override
    public String toJsonString() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            log.error("PerformanceEvent JSON 직렬화 실패", e);
            return String.format("{\"eventId\":\"%s\",\"error\":\"JSON 직렬화 실패\"}", getEventId());
        }
    }
    
    /**
     * 성능 분석용 마크다운 형식 생성
     */
    public String toMarkdownFormat() {
        StringBuilder md = new StringBuilder();
        md.append("\n## ⚡ 성능 이벤트 #").append(getEventId()).append("\n\n");
        md.append("**발생 시간**: ").append(getTimestamp()).append("\n");
        md.append("**추적 ID**: `").append(getTraceId()).append("`\n");
        md.append("**심각도**: ").append(getSeverity()).append(" (").append(performanceCategory).append(")\n\n");
        
        md.append("### 성능 정보\n");
        md.append("- **작업 유형**: ").append(operationType).append("\n");
        md.append("- **실행 위치**: `").append(className).append(".").append(methodName).append("`\n");
        md.append("- **실행 시간**: ").append(executionTimeMs).append("ms");
        if (thresholdMs != null) {
            md.append(" (임계값: ").append(thresholdMs).append("ms)");
        }
        md.append("\n");
        
        if (queryCount != null && queryCount > 0) {
            md.append("- **DB 쿼리**: ").append(queryCount).append("개");
            if (queryType != null) {
                md.append(" (").append(queryType).append(")");
            }
            md.append("\n");
        }
        
        if (memoryUsedMb != null) {
            md.append("- **메모리 사용량**: ").append(memoryUsedMb).append("MB\n");
        }
        
        if (cpuUsagePercent != null) {
            md.append("- **CPU 사용률**: ").append(String.format("%.1f", cpuUsagePercent)).append("%\n");
        }
        
        md.append("\n");
        
        if (requestUri != null) {
            md.append("### 요청 정보\n");
            md.append("- **URL**: `").append(httpMethod).append(" ").append(requestUri).append("`\n");
            md.append("- **사용자**: ").append(userEmail != null ? userEmail : "익명").append("\n\n");
        }
        
        if (!performanceMetrics.isEmpty()) {
            md.append("### 상세 메트릭\n");
            performanceMetrics.forEach((key, value) -> 
                md.append("- **").append(key).append("**: ").append(value).append("\n")
            );
            md.append("\n");
        }
        
        md.append("### 성능 최적화 방안\n");
        md.append("<!-- 개발자가 작성: 성능 개선 방법을 기록하세요 -->\n");
        md.append("- **문제 분석**: \n");
        md.append("- **최적화 방법**: \n");
        md.append("- **예상 개선 효과**: \n\n");
        
        md.append(generateOptimizationSuggestions());
        md.append("---\n");
        
        return md.toString();
    }
    
    /**
     * AI 학습용 성능 데이터 추출
     */
    public Map<String, Object> toAILearningData() {
        Map<String, Object> data = new HashMap<>();
        data.put("eventId", getEventId());
        data.put("operationType", operationType);
        data.put("performanceCategory", performanceCategory);
        data.put("severity", getSeverity());
        data.put("className", className);
        data.put("methodName", methodName);
        data.put("executionTime", executionTimeMs);
        data.put("thresholdExceededRatio", calculateThresholdRatio());
        data.put("queryCount", queryCount);
        data.put("timestamp", getTimestamp());
        
        // 성능 패턴 분석을 위한 특성 추출
        data.put("performanceFeatures", extractPerformanceFeatures());
        
        return data;
    }
    
    private static Map<String, Object> buildMetadata(Map<String, Object> additional, 
                                                   String operationType, Long executionTime) {
        Map<String, Object> metadata = new HashMap<>();
        if (additional != null) {
            metadata.putAll(additional);
        }
        metadata.put("operationType", operationType);
        metadata.put("executionTime", executionTime);
        metadata.put("isPerformanceIssue", true);
        return metadata;
    }
    
    private String categorizePerformance(String operationType, Long executionTime, Long threshold) {
        if (executionTime == null) return "UNKNOWN";
        
        if (operationType != null) {
            switch (operationType) {
                case "REPOSITORY":
                    return executionTime > 1000 ? "SLOW_QUERY" : "SLOW_METHOD";
                case "HTTP_REQUEST":
                    return executionTime > 5000 ? "SLOW_REQUEST" : "SLOW_METHOD";
                default:
                    return "SLOW_METHOD";
            }
        }
        
        if (threshold != null && executionTime > threshold * 3) {
            return "CRITICAL_SLOW";
        }
        
        return "SLOW_METHOD";
    }
    
    private double calculateThresholdRatio() {
        if (thresholdMs == null || thresholdMs == 0 || executionTimeMs == null) {
            return 1.0;
        }
        return (double) executionTimeMs / thresholdMs;
    }
    
    private Map<String, Object> extractPerformanceFeatures() {
        Map<String, Object> features = new HashMap<>();
        
        features.put("isSlowMethod", executionTimeMs != null && executionTimeMs > 1000);
        features.put("hasDbQueries", queryCount != null && queryCount > 0);
        features.put("isHighQueryCount", queryCount != null && queryCount > 10);
        features.put("isHighMemoryUsage", memoryUsedMb != null && memoryUsedMb > 512);
        features.put("isHighCpuUsage", cpuUsagePercent != null && cpuUsagePercent > 80);
        features.put("operationTypeCategory", operationType);
        features.put("severityLevel", getSeverity());
        
        return features;
    }
    
    private String generateOptimizationSuggestions() {
        StringBuilder suggestions = new StringBuilder();
        suggestions.append("### 💡 자동 최적화 제안\n");
        
        // 작업 유형별 제안
        if ("REPOSITORY".equals(operationType)) {
            suggestions.append("- **DB 최적화**: \n");
            suggestions.append("  - 인덱스 확인 및 쿼리 실행 계획 분석\n");
            suggestions.append("  - @EntityGraph 사용으로 N+1 문제 해결 검토\n");
            if (queryCount != null && queryCount > 5) {
                suggestions.append("  - 배치 처리나 페이징 적용 고려\n");
            }
        }
        
        if ("SERVICE".equals(operationType) && executionTimeMs != null && executionTimeMs > 2000) {
            suggestions.append("- **서비스 최적화**: \n");
            suggestions.append("  - 비동기 처리(@Async) 적용 검토\n");
            suggestions.append("  - 캐시 적용 가능성 검토\n");
            suggestions.append("  - 불필요한 연산이나 중복 로직 제거\n");
        }
        
        if ("HTTP_REQUEST".equals(operationType) && executionTimeMs != null && executionTimeMs > 3000) {
            suggestions.append("- **요청 처리 최적화**: \n");
            suggestions.append("  - 응답 압축(gzip) 적용\n");
            suggestions.append("  - 페이징 처리로 데이터 분할 전송\n");
            suggestions.append("  - CDN 적용 검토\n");
        }
        
        if (memoryUsedMb != null && memoryUsedMb > 256) {
            suggestions.append("- **메모리 최적화**: \n");
            suggestions.append("  - 대용량 객체 생성 최소화\n");
            suggestions.append("  - Stream API 적절한 사용\n");
            suggestions.append("  - 메모리 리크 가능성 검토\n");
        }
        
        suggestions.append("\n");
        return suggestions.toString();
    }
}