package com.globalcarelink.agents.documentation.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * API 엔드포인트 모델
 */
@Data
@Builder
public class ApiEndpoint {
    private String endpointId;
    private String path;
    private String httpMethod; // GET, POST, PUT, DELETE
    private String controllerClass;
    private String methodName;
    
    // 요청/응답 정보
    private List<ApiParameter> parameters;
    private ApiRequestBody requestBody;
    private Map<String, ApiResponse> responses; // HTTP 상태코드별 응답
    
    // 문서화 정보
    private String summary;
    private String description;
    private List<String> tags;
    private ApiDocumentation documentation;
    
    // 보안 정보
    private List<String> securitySchemes;
    private SecurityAnalysisResult securityAnalysis;
    private boolean requiresAuthentication;
    private List<String> requiredRoles;
    
    // 성능 정보
    private double averageResponseTime;
    private double maxResponseTime;
    private int requestsPerMinute;
    private double errorRate;
    
    // 사용 예제
    private List<ApiUsageExample> usageExamples;
    
    // 버전 정보
    private String apiVersion;
    private LocalDateTime createdAt;
    private LocalDateTime lastModified;
    private String status; // "ACTIVE", "DEPRECATED", "REMOVED"
    
    // 테스트 정보
    private boolean hasTests;
    private double testCoverage;
    private LocalDateTime lastTested;
    
    /**
     * 엔드포인트 복잡도 계산
     */
    public EndpointComplexity getComplexity() {
        int score = 0;
        
        // 파라미터 수
        if (parameters != null) score += parameters.size();
        
        // 응답 타입 수
        if (responses != null) score += responses.size();
        
        // 보안 요구사항
        if (requiresAuthentication) score += 2;
        if (requiredRoles != null) score += requiredRoles.size();
        
        if (score >= 10) return EndpointComplexity.COMPLEX;
        if (score >= 6) return EndpointComplexity.MODERATE;
        if (score >= 3) return EndpointComplexity.SIMPLE;
        return EndpointComplexity.BASIC;
    }
    
    /**
     * 엔드포인트 품질 점수
     */
    public double getQualityScore() {
        double score = 0.0;
        int factors = 0;
        
        // 문서화 품질
        if (description != null && !description.isEmpty()) {
            score += 0.3;
        }
        factors++;
        
        // 테스트 커버리지
        score += testCoverage * 0.3;
        factors++;
        
        // 보안 분석
        if (securityAnalysis != null) {
            score += 0.2;
        }
        factors++;
        
        // 사용 예제
        if (usageExamples != null && !usageExamples.isEmpty()) {
            score += 0.2;
        }
        factors++;
        
        return score;
    }
    
    public enum EndpointComplexity {
        BASIC, SIMPLE, MODERATE, COMPLEX
    }
}