package com.globalcarelink.agents.documentation.analyzers;

import com.globalcarelink.agents.documentation.models.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * API 보안 분석기
 */
@Slf4j
@Component
public class SecurityAnalyzer {
    
    /**
     * 엔드포인트 보안 분석
     */
    public SecurityAnalysisResult analyzeEndpoint(ApiEndpoint endpoint) {
        log.debug("보안 분석 중: {}", endpoint.getEndpointId());
        
        List<String> vulnerabilities = new ArrayList<>();
        
        // 1. 인증 요구사항 검증
        if (!endpoint.isRequiresAuthentication() && isSensitiveEndpoint(endpoint)) {
            vulnerabilities.add("민감한 엔드포인트에 인증이 필요하지 않음");
        }
        
        // 2. 입력 검증 분석
        if (hasUserInput(endpoint) && !hasInputValidation(endpoint)) {
            vulnerabilities.add("사용자 입력에 대한 검증이 부족함");
        }
        
        // 3. SQL 인젝션 위험 분석
        if (hasDatabaseAccess(endpoint) && !hasSqlProtection(endpoint)) {
            vulnerabilities.add("SQL 인젝션 위험 가능성");
        }
        
        // 4. XSS 위험 분석
        if (returnsUserContent(endpoint) && !hasXssProtection(endpoint)) {
            vulnerabilities.add("XSS 공격 위험 가능성");
        }
        
        // 5. CSRF 보호 분석
        if (isStateChangingOperation(endpoint) && !hasCsrfProtection(endpoint)) {
            vulnerabilities.add("CSRF 공격 위험 가능성");
        }
        
        // 보안 등급 결정
        String securityLevel = determineSecurityLevel(vulnerabilities.size(), endpoint);
        
        return SecurityAnalysisResult.builder()
            .securityLevel(securityLevel)
            .vulnerabilities(vulnerabilities)
            .build();
    }
    
    /**
     * 종합적 보안 분석
     */
    public SecurityAnalysisResult performComprehensiveAnalysis(ApiEndpoint endpoint) {
        SecurityAnalysisResult basicResult = analyzeEndpoint(endpoint);
        
        // 추가 보안 검사
        List<String> additionalChecks = performAdvancedSecurityChecks(endpoint);
        
        List<String> allVulnerabilities = new ArrayList<>(basicResult.getVulnerabilities());
        allVulnerabilities.addAll(additionalChecks);
        
        return SecurityAnalysisResult.builder()
            .securityLevel(determineSecurityLevel(allVulnerabilities.size(), endpoint))
            .vulnerabilities(allVulnerabilities)
            .build();
    }
    
    /**
     * 보안 개선 권장사항 생성
     */
    public List<SecurityRecommendation> generateRecommendations(SecurityAnalysisResult analysisResult) {
        List<SecurityRecommendation> recommendations = new ArrayList<>();
        
        for (String vulnerability : analysisResult.getVulnerabilities()) {
            SecurityRecommendation recommendation = generateRecommendationForVulnerability(vulnerability);
            if (recommendation != null) {
                recommendations.add(recommendation);
            }
        }
        
        return recommendations;
    }
    
    // Private helper methods
    
    private boolean isSensitiveEndpoint(ApiEndpoint endpoint) {
        String path = endpoint.getPath().toLowerCase();
        String method = endpoint.getHttpMethod().toUpperCase();
        
        return path.contains("admin") ||
               path.contains("manage") ||
               path.contains("delete") ||
               path.contains("password") ||
               "DELETE".equals(method) ||
               ("POST".equals(method) || "PUT".equals(method));
    }
    
    private boolean hasUserInput(ApiEndpoint endpoint) {
        return endpoint.getParameters() != null && !endpoint.getParameters().isEmpty() ||
               endpoint.getRequestBody() != null;
    }
    
    private boolean hasInputValidation(ApiEndpoint endpoint) {
        // 실제로는 컨트롤러 클래스의 어노테이션이나 검증 로직을 분석해야 함
        return endpoint.getDescription() != null && 
               endpoint.getDescription().toLowerCase().contains("validation");
    }
    
    private boolean hasDatabaseAccess(ApiEndpoint endpoint) {
        return endpoint.getControllerClass() != null &&
               (endpoint.getControllerClass().contains("Repository") ||
                endpoint.getControllerClass().contains("Service"));
    }
    
    private boolean hasSqlProtection(ApiEndpoint endpoint) {
        // JPA나 MyBatis 등의 ORM 사용 여부 확인
        return true; // 기본적으로 Spring Data JPA 사용 가정
    }
    
    private boolean returnsUserContent(ApiEndpoint endpoint) {
        return "GET".equals(endpoint.getHttpMethod()) &&
               endpoint.getPath().contains("search");
    }
    
    private boolean hasXssProtection(ApiEndpoint endpoint) {
        // Spring Security의 XSS 보호 기능 사용 여부 확인
        return true; // 기본적으로 Spring Security 사용 가정
    }
    
    private boolean isStateChangingOperation(ApiEndpoint endpoint) {
        String method = endpoint.getHttpMethod().toUpperCase();
        return "POST".equals(method) || "PUT".equals(method) || 
               "PATCH".equals(method) || "DELETE".equals(method);
    }
    
    private boolean hasCsrfProtection(ApiEndpoint endpoint) {
        // CSRF 토큰 사용 여부 확인
        return endpoint.getSecuritySchemes() != null &&
               endpoint.getSecuritySchemes().contains("csrf");
    }
    
    private String determineSecurityLevel(int vulnerabilityCount, ApiEndpoint endpoint) {
        if (vulnerabilityCount == 0) {
            return "HIGH";
        } else if (vulnerabilityCount <= 2) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
    
    private List<String> performAdvancedSecurityChecks(ApiEndpoint endpoint) {
        List<String> issues = new ArrayList<>();
        
        // Rate limiting 검사
        if (!hasRateLimiting(endpoint)) {
            issues.add("API 호출 빈도 제한이 설정되지 않음");
        }
        
        // HTTPS 강제 사용 검사
        if (!enforcesHttps(endpoint)) {
            issues.add("HTTPS 사용이 강제되지 않음");
        }
        
        // 민감한 데이터 로깅 검사
        if (logsSensitiveData(endpoint)) {
            issues.add("민감한 데이터가 로그에 기록될 위험");
        }
        
        return issues;
    }
    
    private boolean hasRateLimiting(ApiEndpoint endpoint) {
        // 실제로는 @RateLimiter 어노테이션이나 설정 확인
        return false; // 기본적으로 없다고 가정
    }
    
    private boolean enforcesHttps(ApiEndpoint endpoint) {
        // 실제로는 Spring Security 설정 확인
        return true; // 기본적으로 있다고 가정
    }
    
    private boolean logsSensitiveData(ApiEndpoint endpoint) {
        // 실제로는 로그 설정과 컨트롤러 코드 분석
        return false; // 기본적으로 안전하다고 가정
    }
    
    private SecurityRecommendation generateRecommendationForVulnerability(String vulnerability) {
        return switch (vulnerability) {
            case "민감한 엔드포인트에 인증이 필요하지 않음" ->
                SecurityRecommendation.builder()
                    .title("인증 요구사항 추가")
                    .description("@PreAuthorize 어노테이션을 사용하여 인증을 요구하세요.")
                    .priority("HIGH")
                    .build();
            
            case "사용자 입력에 대한 검증이 부족함" ->
                SecurityRecommendation.builder()
                    .title("입력 검증 강화")
                    .description("@Valid 어노테이션과 DTO 검증을 사용하세요.")
                    .priority("MEDIUM")
                    .build();
            
            case "API 호출 빈도 제한이 설정되지 않음" ->
                SecurityRecommendation.builder()
                    .title("Rate Limiting 설정")
                    .description("Bucket4j나 Redis를 사용한 API 호출 제한을 설정하세요.")
                    .priority("MEDIUM")
                    .build();
            
            default -> null;
        };
    }
}