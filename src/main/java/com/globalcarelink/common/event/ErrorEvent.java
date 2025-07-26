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
 * 에러 발생 시 생성되는 구조화된 이벤트
 * 자동 트러블슈팅 문서화 및 AI 학습을 위한 데이터 제공
 */
@Slf4j
@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ErrorEvent extends SystemEvent {
    
    private final String errorType;
    private final String errorMessage;
    private final String stackTrace;
    private final String methodName;
    private final String className;
    private final String requestUri;
    private final String httpMethod;
    private final String userEmail;
    private final String clientIp;
    private final Long executionTimeMs;
    private final Map<String, Object> requestParameters;
    private final String errorCategory; // VALIDATION, BUSINESS, TECHNICAL, SECURITY
    
    @Builder
    public ErrorEvent(Object source, String eventId, String traceId,
                     String errorType, String errorMessage, String stackTrace,
                     String methodName, String className, String requestUri,
                     String httpMethod, String userEmail, String clientIp,
                     Long executionTimeMs, Map<String, Object> requestParameters,
                     String errorCategory, Map<String, Object> additionalMetadata) {
        
        super(source, eventId, traceId, "ERROR_EVENT", 
              buildMetadata(additionalMetadata, errorType, errorMessage));
        
        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.stackTrace = sanitizeStackTrace(stackTrace);
        this.methodName = methodName;
        this.className = className;
        this.requestUri = requestUri;
        this.httpMethod = httpMethod;
        this.userEmail = userEmail;
        this.clientIp = clientIp;
        this.executionTimeMs = executionTimeMs;
        this.requestParameters = sanitizeRequestParameters(requestParameters);
        this.errorCategory = errorCategory != null ? errorCategory : categorizeError(errorType, errorMessage);
    }
    
    @Override
    public String getSeverity() {
        return switch (errorCategory) {
            case "SECURITY" -> "CRITICAL";
            case "BUSINESS" -> "HIGH";
            case "VALIDATION" -> "MEDIUM";
            case "TECHNICAL" -> "HIGH";
            default -> "MEDIUM";
        };
    }
    
    @Override
    public String toJsonString() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            log.error("ErrorEvent JSON 직렬화 실패", e);
            return String.format("{\"eventId\":\"%s\",\"error\":\"JSON 직렬화 실패\"}", getEventId());
        }
    }
    
    /**
     * 트러블슈팅 문서용 마크다운 형식 생성
     */
    public String toMarkdownFormat() {
        StringBuilder md = new StringBuilder();
        md.append("\n## 🚨 에러 이벤트 #").append(getEventId()).append("\n\n");
        md.append("**발생 시간**: ").append(getTimestamp()).append("\n");
        md.append("**추적 ID**: `").append(getTraceId()).append("`\n");
        md.append("**심각도**: ").append(getSeverity()).append(" (").append(errorCategory).append(")\n\n");
        
        md.append("### 에러 정보\n");
        md.append("- **에러 타입**: `").append(errorType).append("`\n");
        md.append("- **에러 메시지**: ").append(errorMessage).append("\n");
        md.append("- **발생 위치**: `").append(className).append(".").append(methodName).append("`\n\n");
        
        if (requestUri != null) {
            md.append("### 요청 정보\n");
            md.append("- **URL**: `").append(httpMethod).append(" ").append(requestUri).append("`\n");
            md.append("- **사용자**: ").append(userEmail != null ? userEmail : "익명").append("\n");
            md.append("- **클라이언트 IP**: ").append(clientIp).append("\n");
            if (executionTimeMs != null) {
                md.append("- **실행 시간**: ").append(executionTimeMs).append("ms\n");
            }
            md.append("\n");
        }
        
        if (stackTrace != null && !stackTrace.isEmpty()) {
            md.append("### 스택 트레이스\n");
            md.append("```\n").append(stackTrace).append("\n```\n\n");
        }
        
        md.append("### 해결 방안\n");
        md.append("<!-- 개발자가 작성: 근본 원인과 해결 방법을 기록하세요 -->\n");
        md.append("- **근본 원인**: \n");
        md.append("- **해결 방법**: \n");
        md.append("- **예방 조치**: \n\n");
        
        md.append("---\n");
        
        return md.toString();
    }
    
    /**
     * AI 학습용 구조화된 데이터 추출
     */
    public Map<String, Object> toAILearningData() {
        Map<String, Object> data = new HashMap<>();
        data.put("eventId", getEventId());
        data.put("errorType", errorType);
        data.put("errorCategory", errorCategory);
        data.put("severity", getSeverity());
        data.put("className", className);
        data.put("methodName", methodName);
        data.put("executionTime", executionTimeMs);
        data.put("timestamp", getTimestamp());
        
        // 패턴 인식을 위한 키워드 추출
        data.put("errorKeywords", extractErrorKeywords());
        
        return data;
    }
    
    private static Map<String, Object> buildMetadata(Map<String, Object> additional, 
                                                   String errorType, String errorMessage) {
        Map<String, Object> metadata = new HashMap<>();
        if (additional != null) {
            metadata.putAll(additional);
        }
        metadata.put("errorType", errorType);
        metadata.put("hasStackTrace", true);
        return metadata;
    }
    
    private String sanitizeStackTrace(String stackTrace) {
        if (stackTrace == null) return null;
        
        // 민감한 정보가 포함될 수 있는 패키지는 제외
        String[] lines = stackTrace.split("\n");
        StringBuilder sanitized = new StringBuilder();
        
        int maxLines = 15; // 스택 트레이스 길이 제한
        int count = 0;
        
        for (String line : lines) {
            if (count >= maxLines) break;
            
            // 프로젝트 관련 패키지만 포함
            if (line.contains("com.globalcarelink") || 
                line.contains("Exception") || 
                line.contains("Error") || 
                count < 3) { // 상위 3개는 항상 포함
                sanitized.append(line).append("\n");
                count++;
            }
        }
        
        return sanitized.toString();
    }
    
    private Map<String, Object> sanitizeRequestParameters(Map<String, Object> params) {
        if (params == null) return new HashMap<>();
        
        Map<String, Object> sanitized = new HashMap<>();
        params.forEach((key, value) -> {
            String lowerKey = key.toLowerCase();
            if (lowerKey.contains("password") || 
                lowerKey.contains("token") || 
                lowerKey.contains("secret")) {
                sanitized.put(key, "[PROTECTED]");
            } else {
                String valueStr = String.valueOf(value);
                if (valueStr.length() > 200) {
                    sanitized.put(key, valueStr.substring(0, 200) + "...");
                } else {
                    sanitized.put(key, value);
                }
            }
        });
        
        return sanitized;
    }
    
    private String categorizeError(String errorType, String errorMessage) {
        if (errorType == null && errorMessage == null) return "TECHNICAL";
        
        String combined = (errorType + " " + errorMessage).toLowerCase();
        
        if (combined.contains("security") || combined.contains("authentication") || 
            combined.contains("authorization") || combined.contains("forbidden")) {
            return "SECURITY";
        }
        
        if (combined.contains("validation") || combined.contains("constraint") || 
            combined.contains("invalid input") || combined.contains("bad request")) {
            return "VALIDATION";
        }
        
        if (combined.contains("business") || combined.contains("already exists") || 
            combined.contains("not found") || combined.contains("illegal state")) {
            return "BUSINESS";
        }
        
        return "TECHNICAL";
    }
    
    private String[] extractErrorKeywords() {
        String combined = (errorType + " " + errorMessage + " " + className).toLowerCase();
        
        // 주요 키워드 패턴 추출
        String[] patterns = {
            "null pointer", "index out of bounds", "class cast", "illegal argument",
            "sql", "database", "connection", "timeout", "validation", "constraint",
            "authentication", "authorization", "security", "forbidden", "not found",
            "service", "repository", "controller", "entity", "dto"
        };
        
        return java.util.Arrays.stream(patterns)
                .filter(pattern -> combined.contains(pattern))
                .toArray(String[]::new);
    }
}