package com.globalcarelink.agents.documentation.analyzers;

import com.globalcarelink.agents.documentation.models.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

/**
 * API 엔드포인트 분석기
 */
@Slf4j
@Component
public class EndpointAnalyzer {
    
    /**
     * API 엔드포인트 상세 분석
     */
    public ApiEndpoint analyzeEndpoint(String path, String method, String controllerClass, 
                                      Map<String, Object> endpointData) {
        
        log.debug("엔드포인트 분석 중: {} {}", method, path);
        
        // 1. 기본 정보 추출
        String endpointId = generateEndpointId(method, path);
        String summary = generateSummary(method, path, controllerClass);
        String description = generateDescription(method, path, endpointData);
        
        // 2. 파라미터 분석
        List<ApiParameter> parameters = analyzeParameters(endpointData);
        
        // 3. 요청 본문 분석
        ApiRequestBody requestBody = analyzeRequestBody(method, endpointData);
        
        // 4. 응답 분석
        Map<String, ApiResponse> responses = analyzeResponses(endpointData);
        
        // 5. 보안 요구사항 분석
        SecurityRequirements securityReqs = analyzeSecurityRequirements(endpointData);
        
        // 6. 태그 생성
        List<String> tags = generateTags(path, controllerClass);
        
        return ApiEndpoint.builder()
            .endpointId(endpointId)
            .path(path)
            .httpMethod(method.toUpperCase())
            .controllerClass(controllerClass)
            .methodName(extractMethodName(endpointData))
            .parameters(parameters)
            .requestBody(requestBody)
            .responses(responses)
            .summary(summary)
            .description(description)
            .tags(tags)
            .securitySchemes(securityReqs.schemes)
            .requiresAuthentication(securityReqs.requiresAuth)
            .requiredRoles(securityReqs.roles)
            .apiVersion("1.0")
            .createdAt(LocalDateTime.now())
            .lastModified(LocalDateTime.now())
            .status("ACTIVE")
            .hasTests(false)
            .testCoverage(0.0)
            .build();
    }
    
    /**
     * 엔드포인트 ID 생성
     */
    private String generateEndpointId(String method, String path) {
        return method.toUpperCase() + "_" + path.replaceAll("[^a-zA-Z0-9]", "_");
    }
    
    /**
     * API 요약 생성
     */
    private String generateSummary(String method, String path, String controllerClass) {
        String operation = switch (method.toUpperCase()) {
            case "GET" -> "조회";
            case "POST" -> "생성";
            case "PUT" -> "수정";
            case "DELETE" -> "삭제";
            case "PATCH" -> "부분 수정";
            default -> "처리";
        };
        
        String resource = extractResourceFromPath(path);
        return resource + " " + operation;
    }
    
    /**
     * API 설명 생성
     */
    private String generateDescription(String method, String path, Map<String, Object> endpointData) {
        StringBuilder desc = new StringBuilder();
        
        desc.append("**Endpoint**: `").append(method.toUpperCase()).append(" ").append(path).append("`\n\n");
        
        // 기능 설명
        String functionality = inferFunctionality(method, path);
        desc.append("**기능**: ").append(functionality).append("\n\n");
        
        // 파라미터 설명
        if (hasParameters(endpointData)) {
            desc.append("**매개변수**: 상세 정보는 Parameters 섹션 참조\n\n");
        }
        
        // 응답 설명
        desc.append("**응답**: JSON 형태의 결과 반환\n\n");
        
        return desc.toString();
    }
    
    /**
     * 파라미터 분석
     */
    private List<ApiParameter> analyzeParameters(Map<String, Object> endpointData) {
        List<ApiParameter> parameters = new ArrayList<>();
        
        // 경로 파라미터 추출
        String path = (String) endpointData.get("path");
        if (path != null && path.contains("{")) {
            extractPathParameters(path).forEach(paramName -> {
                parameters.add(ApiParameter.builder()
                    .name(paramName)
                    .type("string")
                    .description(paramName + " 식별자")
                    .required(true)
                    .location("path")
                    .build());
            });
        }
        
        // 쿼리 파라미터 추론
        String method = (String) endpointData.get("method");
        if ("GET".equalsIgnoreCase(method)) {
            // GET 요청의 경우 일반적인 쿼리 파라미터 추가
            if (path.contains("search") || path.contains("list")) {
                parameters.add(createPaginationParameter("page", "페이지 번호"));
                parameters.add(createPaginationParameter("size", "페이지 크기"));
                parameters.add(ApiParameter.builder()
                    .name("keyword")
                    .type("string")
                    .description("검색 키워드")
                    .required(false)
                    .location("query")
                    .build());
            }
        }
        
        return parameters;
    }
    
    /**
     * 요청 본문 분석
     */
    private ApiRequestBody analyzeRequestBody(String method, Map<String, Object> endpointData) {
        if ("GET".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            return null; // GET, DELETE는 일반적으로 요청 본문이 없음
        }
        
        String resourceType = extractResourceFromPath((String) endpointData.get("path"));
        
        return ApiRequestBody.builder()
            .contentType("application/json")
            .schema(resourceType + "Request")
            .required(true)
            .example(generateRequestExample(resourceType, method))
            .build();
    }
    
    /**
     * 응답 분석
     */
    private Map<String, ApiResponse> analyzeResponses(Map<String, Object> endpointData) {
        Map<String, ApiResponse> responses = new HashMap<>();
        
        String method = (String) endpointData.get("method");
        String resourceType = extractResourceFromPath((String) endpointData.get("path"));
        
        // 성공 응답
        String successCode = switch (method.toUpperCase()) {
            case "POST" -> "201";
            case "DELETE" -> "204";
            default -> "200";
        };
        
        responses.put(successCode, ApiResponse.builder()
            .statusCode(successCode)
            .description("성공")
            .contentType("application/json")
            .schema(resourceType + "Response")
            .example(generateResponseExample(resourceType, method))
            .build());
        
        // 에러 응답
        responses.put("400", ApiResponse.builder()
            .statusCode("400")
            .description("잘못된 요청")
            .contentType("application/json")
            .schema("ErrorResponse")
            .build());
        
        responses.put("500", ApiResponse.builder()
            .statusCode("500")
            .description("서버 내부 오류")
            .contentType("application/json")
            .schema("ErrorResponse")
            .build());
        
        return responses;
    }
    
    /**
     * 보안 요구사항 분석
     */
    private SecurityRequirements analyzeSecurityRequirements(Map<String, Object> endpointData) {
        SecurityRequirements requirements = new SecurityRequirements();
        
        String path = (String) endpointData.get("path");
        String method = (String) endpointData.get("method");
        
        // 보안이 필요한 경로 패턴
        boolean needsAuth = path.contains("/admin") || 
                           path.contains("/manage") ||
                           "POST".equalsIgnoreCase(method) ||
                           "PUT".equalsIgnoreCase(method) ||
                           "DELETE".equalsIgnoreCase(method);
        
        if (needsAuth) {
            requirements.requiresAuth = true;
            requirements.schemes = Arrays.asList("bearerAuth", "JWT");
            
            if (path.contains("/admin")) {
                requirements.roles = Arrays.asList("ADMIN");
            } else {
                requirements.roles = Arrays.asList("USER");
            }
        } else {
            requirements.requiresAuth = false;
            requirements.schemes = new ArrayList<>();
            requirements.roles = new ArrayList<>();
        }
        
        return requirements;
    }
    
    /**
     * 태그 생성
     */
    private List<String> generateTags(String path, String controllerClass) {
        List<String> tags = new ArrayList<>();
        
        // 경로 기반 태그
        String[] pathSegments = path.split("/");
        if (pathSegments.length > 1) {
            String mainResource = pathSegments[1].toLowerCase();
            tags.add(mainResource);
        }
        
        // 컨트롤러 클래스 기반 태그
        if (controllerClass != null) {
            String className = controllerClass.substring(controllerClass.lastIndexOf('.') + 1);
            if (className.endsWith("Controller")) {
                String tag = className.substring(0, className.length() - 10).toLowerCase();
                if (!tags.contains(tag)) {
                    tags.add(tag);
                }
            }
        }
        
        return tags;
    }
    
    // Helper methods
    
    private String extractResourceFromPath(String path) {
        if (path == null || path.equals("/")) return "root";
        
        String[] segments = path.split("/");
        for (String segment : segments) {
            if (!segment.isEmpty() && !segment.startsWith("{")) {
                return capitalize(segment);
            }
        }
        return "Resource";
    }
    
    private String extractMethodName(Map<String, Object> endpointData) {
        return (String) endpointData.getOrDefault("methodName", "handleRequest");
    }
    
    private String inferFunctionality(String method, String path) {
        String resource = extractResourceFromPath(path);
        
        return switch (method.toUpperCase()) {
            case "GET" -> path.contains("{") ? 
                resource + " 상세 정보를 조회합니다." : 
                resource + " 목록을 조회합니다.";
            case "POST" -> "새로운 " + resource + "을(를) 생성합니다.";
            case "PUT" -> resource + " 정보를 전체 수정합니다.";
            case "PATCH" -> resource + " 정보를 부분 수정합니다.";
            case "DELETE" -> resource + "을(를) 삭제합니다.";
            default -> resource + "을(를) 처리합니다.";
        };
    }
    
    private boolean hasParameters(Map<String, Object> endpointData) {
        String path = (String) endpointData.get("path");
        return path != null && (path.contains("{") || "GET".equalsIgnoreCase((String) endpointData.get("method")));
    }
    
    private List<String> extractPathParameters(String path) {
        List<String> params = new ArrayList<>();
        int start = path.indexOf('{');
        while (start != -1) {
            int end = path.indexOf('}', start);
            if (end != -1) {
                params.add(path.substring(start + 1, end));
                start = path.indexOf('{', end);
            } else {
                break;
            }
        }
        return params;
    }
    
    private ApiParameter createPaginationParameter(String name, String description) {
        return ApiParameter.builder()
            .name(name)
            .type("integer")
            .description(description)
            .required(false)
            .defaultValue(name.equals("page") ? 0 : 20)
            .location("query")
            .build();
    }
    
    private Object generateRequestExample(String resourceType, String method) {
        return Map.of(
            "example", "Request example for " + resourceType,
            "note", "실제 요청 스키마에 따라 조정 필요"
        );
    }
    
    private Object generateResponseExample(String resourceType, String method) {
        return Map.of(
            "example", "Response example for " + resourceType,
            "note", "실제 응답 스키마에 따라 조정 필요"
        );
    }
    
    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
    
    // Inner class
    private static class SecurityRequirements {
        boolean requiresAuth = false;
        List<String> schemes = new ArrayList<>();
        List<String> roles = new ArrayList<>();
    }
}