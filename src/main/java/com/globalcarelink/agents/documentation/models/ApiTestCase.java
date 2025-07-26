package com.globalcarelink.agents.documentation.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * API 테스트 케이스 모델
 */
@Data
@Builder
public class ApiTestCase {
    private String testId;
    private String endpointId;
    private String testType; // "UNIT", "INTEGRATION", "E2E", "SECURITY", "PERFORMANCE"
    private String description;
    private String testCode;
    private Map<String, Object> testData;
    private String expectedResult;
    private boolean passed;
    private LocalDateTime lastRun;
    private String framework; // "JUnit", "TestNG", "Postman"
}

// 추가 지원 모델들
@Data
@Builder
class ApiParameter {
    private String name;
    private String type;
    private String description;
    private boolean required;
    private Object defaultValue;
    private String location; // "query", "path", "header", "body"
}

@Data
@Builder
class ApiRequestBody {
    private String contentType;
    private String schema;
    private Object example;
    private boolean required;
}

@Data
@Builder  
class ApiResponse {
    private String statusCode;
    private String description;
    private String contentType;
    private String schema;
    private Object example;
}

@Data
@Builder
class ApiUsageExample {
    private String title;
    private String description;
    private String requestExample;
    private String responseExample;
    private String language; // "curl", "java", "javascript"
}

@Data
@Builder
class SecurityAnalysisResult {
    private String securityLevel; // "HIGH", "MEDIUM", "LOW"
    private java.util.List<String> vulnerabilities;
    private boolean hasVulnerabilities() {
        return vulnerabilities != null && !vulnerabilities.isEmpty();
    }
}

@Data
@Builder
class SecurityRecommendation {
    private String title;
    private String description;
    private String priority; // "HIGH", "MEDIUM", "LOW"
}

@Data
class SecurityAuditResult {
    private int totalEndpoints;
    private int secureEndpoints;
    private java.util.List<String> vulnerabilities;
}

@Data 
class PerformanceAuditResult {
    private double averageResponseTime;
    private int slowEndpoints;
    private java.util.List<String> recommendations;
}

@Data
class DocumentationAuditResult {
    private double coveragePercentage;
    private int undocumentedEndpoints;
    private java.util.List<String> missingDocumentation;
}

@Data
@Builder
class ApiAuditReport {
    private String auditId;
    private LocalDateTime auditDate;
    private int totalEndpoints;
    private SecurityAuditResult securityAudit;
    private PerformanceAuditResult performanceAudit;
    private DocumentationAuditResult documentationAudit;
    private double overallScore;
    private java.util.List<String> recommendations;
    
    public int getCriticalIssueCount() {
        int count = 0;
        if (securityAudit != null && securityAudit.getVulnerabilities() != null) {
            count += securityAudit.getVulnerabilities().size();
        }
        return count;
    }
}

@Data
class ApiPerformanceMetric {
    private String metricName;
    private double currentValue;
    private LocalDateTime lastUpdated;
}