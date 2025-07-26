package com.globalcarelink.agents.documentation;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.documentation.models.*;
import com.globalcarelink.agents.documentation.analyzers.EndpointAnalyzer;
import com.globalcarelink.agents.documentation.analyzers.SecurityAnalyzer;
import com.globalcarelink.agents.documentation.generators.OpenAPIGenerator;
import com.globalcarelink.agents.documentation.generators.ExampleGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * API 문서화 분석 에이전트
 * 목적: 1) API 엔드포인트 자동 발견 및 분석
 *      2) OpenAPI/Swagger 문서 자동 생성
 *      3) API 변경사항 추적 및 버전 관리
 *      4) API 보안 및 성능 분석
 *      5) 테스트 케이스 및 사용 예제 생성
 *      6) 다른 에이전트와 연동하여 종합적 API 관리
 */
@Component
@RequiredArgsConstructor
public class ApiDocumentationAnalysisAgent extends BaseAgent {
    
    private final EndpointAnalyzer endpointAnalyzer;
    private final SecurityAnalyzer securityAnalyzer;
    private final OpenAPIGenerator openAPIGenerator;
    private final ExampleGenerator exampleGenerator;
    
    // 발견된 API 엔드포인트들
    private final Map<String, ApiEndpoint> discoveredEndpoints = new ConcurrentHashMap<>();
    
    // API 문서화 결과
    private final Map<String, ApiDocumentation> documentationResults = new ConcurrentHashMap<>();
    
    // API 변경 히스토리
    private final Map<String, List<ApiChangeRecord>> changeHistory = new ConcurrentHashMap<>();
    
    // API 테스트 케이스
    private final Map<String, List<ApiTestCase>> testCases = new ConcurrentHashMap<>();
    
    // API 성능 메트릭
    private final Map<String, ApiPerformanceMetric> performanceMetrics = new ConcurrentHashMap<>();
    
    public ApiDocumentationAnalysisAgent(EndpointAnalyzer endpointAnalyzer,
                                       SecurityAnalyzer securityAnalyzer,
                                       OpenAPIGenerator openAPIGenerator,
                                       ExampleGenerator exampleGenerator) {
        super("API_DOCUMENTATION_ANALYSIS");
        this.endpointAnalyzer = endpointAnalyzer;
        this.securityAnalyzer = securityAnalyzer;
        this.openAPIGenerator = openAPIGenerator;
        this.exampleGenerator = exampleGenerator;
    }
    
    @Override
    protected void doInitialize() {
        logger.info("📋 API 문서화 분석 에이전트 초기화");
        
        // 기존 API 엔드포인트 발견
        discoverExistingEndpoints();
        
        // 기존 문서화 결과 로드
        loadExistingDocumentation();
        
        // API 모니터링 시작
        startApiMonitoring();
        
        // 정기적 문서 업데이트 스케줄링
        scheduleDocumentationUpdates();
        
        logger.info("✅ API 문서화 에이전트 활성화 완료 - {}개 엔드포인트, {}개 문서", 
                   discoveredEndpoints.size(), documentationResults.size());
    }
    
    @Override
    protected void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "API_ENDPOINT_DISCOVERED":
                analyzeNewEndpoint(event);
                break;
            case "API_CHANGE_DETECTED":
                trackApiChange(event);
                break;
            case "API_DOCUMENTATION_REQUEST":
                generateDocumentation(event);
                break;
            case "API_TEST_GENERATION_REQUEST":
                generateTestCases(event);
                break;
            case "API_SECURITY_ANALYSIS_REQUEST":
                performSecurityAnalysis(event);
                break;
            case "API_PERFORMANCE_ANALYSIS_REQUEST":
                analyzeApiPerformance(event);
                break;
            case "API_DEBUG_ANALYSIS_REQUEST":
                supportDebugAnalysis(event);
                break;
            case "COMPREHENSIVE_API_AUDIT_REQUEST":
                performComprehensiveAudit(event);
                break;
        }
    }
    
    /**
     * 새로운 API 엔드포인트 분석
     */
    private void analyzeNewEndpoint(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> endpointData = (Map<String, Object>) event.getData();
        
        String path = (String) endpointData.get("path");
        String method = (String) endpointData.get("method");
        String controllerClass = (String) endpointData.get("controllerClass");
        
        logger.info("🔍 새 API 엔드포인트 분석: {} {}", method, path);
        
        // 1. 엔드포인트 상세 분석
        ApiEndpoint endpoint = endpointAnalyzer.analyzeEndpoint(
            path, method, controllerClass, endpointData);
        
        // 2. 보안 분석
        SecurityAnalysisResult securityResult = securityAnalyzer.analyzeEndpoint(endpoint);
        endpoint.setSecurityAnalysis(securityResult);
        
        // 3. 사용 예제 생성
        List<ApiUsageExample> examples = exampleGenerator.generateExamples(endpoint);
        endpoint.setUsageExamples(examples);
        
        // 4. 테스트 케이스 생성
        List<ApiTestCase> tests = generateEndpointTestCases(endpoint);
        testCases.put(endpoint.getEndpointId(), tests);
        
        // 5. 엔드포인트 등록
        discoveredEndpoints.put(endpoint.getEndpointId(), endpoint);
        
        // 6. 문서 자동 생성
        generateEndpointDocumentation(endpoint);
        
        // 7. 다른 에이전트들에게 알림
        notifyEndpointDiscovered(endpoint);
        
        logger.info("✅ API 엔드포인트 분석 완료: {} (보안등급: {})", 
                   endpoint.getEndpointId(), securityResult.getSecurityLevel());
    }
    
    /**
     * API 변경사항 추적
     */
    private void trackApiChange(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> changeData = (Map<String, Object>) event.getData();
        
        String endpointId = (String) changeData.get("endpointId");
        String changeType = (String) changeData.get("changeType"); // "ADDED", "MODIFIED", "DEPRECATED", "REMOVED"
        String description = (String) changeData.get("description");
        
        logger.info("📝 API 변경사항 추적: {} - {}", endpointId, changeType);
        
        // 변경 기록 생성
        ApiChangeRecord changeRecord = ApiChangeRecord.builder()
            .changeId(UUID.randomUUID().toString())
            .endpointId(endpointId)
            .changeType(ApiChangeType.valueOf(changeType))
            .description(description)
            .timestamp(LocalDateTime.now())
            .detectedBy(getAgentType())
            .build();
        
        // 변경 히스토리에 추가
        changeHistory.computeIfAbsent(endpointId, k -> new ArrayList<>()).add(changeRecord);
        
        // 중요한 변경사항인 경우 알림
        if (isBreakingChange(changeRecord)) {
            alertBreakingChange(changeRecord);
        }
        
        // 문서 업데이트 필요 표시
        markDocumentationForUpdate(endpointId);
        
        // DebugAgent에 API 변경으로 인한 잠재적 이슈 알림
        publishEvent("API_CHANGE_DEBUG_ALERT", Map.of(
            "endpointId", endpointId,
            "changeType", changeType,
            "potentialIssues", analyzePotentialIssues(changeRecord)
        ));
    }
    
    /**
     * API 문서 생성
     */
    private void generateDocumentation(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> requestData = (Map<String, Object>) event.getData();
        
        String scope = (String) requestData.getOrDefault("scope", "ALL"); // "ALL", "ENDPOINT", "MODULE"
        String format = (String) requestData.getOrDefault("format", "OPENAPI"); // "OPENAPI", "MARKDOWN", "HTML"
        
        logger.info("📚 API 문서 생성 요청: {} 형식, {} 범위", format, scope);
        
        try {
            // 1. 범위에 따른 엔드포인트 선택
            Collection<ApiEndpoint> targetEndpoints = selectEndpointsForDocumentation(scope, requestData);
            
            // 2. 문서 생성
            ApiDocumentation documentation = generateApiDocumentation(targetEndpoints, format);
            
            // 3. 품질 검증
            DocumentationQuality quality = validateDocumentationQuality(documentation);
            documentation.setQuality(quality);
            
            // 4. 문서 저장
            String docId = UUID.randomUUID().toString();
            documentationResults.put(docId, documentation);
            
            // 5. 결과 알림
            publishEvent("API_DOCUMENTATION_GENERATED", Map.of(
                "documentationId", docId,
                "format", format,
                "endpointCount", targetEndpoints.size(),
                "quality", quality,
                "generatedAt", LocalDateTime.now()
            ));
            
            logger.info("✅ API 문서 생성 완료: {}개 엔드포인트, 품질등급: {}", 
                       targetEndpoints.size(), quality.getOverallGrade());
            
        } catch (Exception e) {
            logger.error("❌ API 문서 생성 실패: {}", e.getMessage(), e);
        }
    }
    
    /**
     * API 테스트 케이스 생성
     */
    private void generateTestCases(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> testData = (Map<String, Object>) event.getData();
        
        String endpointId = (String) testData.get("endpointId");
        @SuppressWarnings("unchecked")
        List<String> testTypes = (List<String>) testData.getOrDefault("testTypes", 
            Arrays.asList("UNIT", "INTEGRATION", "E2E"));
        
        logger.info("🧪 API 테스트 케이스 생성: {} - {}", endpointId, testTypes);
        
        ApiEndpoint endpoint = discoveredEndpoints.get(endpointId);
        if (endpoint == null) {
            logger.warn("⚠️ 엔드포인트를 찾을 수 없음: {}", endpointId);
            return;
        }
        
        List<ApiTestCase> generatedTests = new ArrayList<>();
        
        for (String testType : testTypes) {
            switch (testType) {
                case "UNIT":
                    generatedTests.addAll(generateUnitTests(endpoint));
                    break;
                case "INTEGRATION":
                    generatedTests.addAll(generateIntegrationTests(endpoint));
                    break;
                case "E2E":
                    generatedTests.addAll(generateE2ETests(endpoint));
                    break;
                case "SECURITY":
                    generatedTests.addAll(generateSecurityTests(endpoint));
                    break;
                case "PERFORMANCE":
                    generatedTests.addAll(generatePerformanceTests(endpoint));
                    break;
            }
        }
        
        // 테스트 케이스 저장
        testCases.put(endpointId, generatedTests);
        
        // 결과 알림
        publishEvent("API_TEST_CASES_GENERATED", Map.of(
            "endpointId", endpointId,
            "testCount", generatedTests.size(),
            "testTypes", testTypes,
            "generatedAt", LocalDateTime.now()
        ));
        
        logger.info("✅ {}개 테스트 케이스 생성 완료", generatedTests.size());
    }
    
    /**
     * API 보안 분석
     */
    private void performSecurityAnalysis(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> securityData = (Map<String, Object>) event.getData();
        
        String endpointId = (String) securityData.get("endpointId");
        
        logger.info("🔒 API 보안 분석 수행: {}", endpointId);
        
        ApiEndpoint endpoint = discoveredEndpoints.get(endpointId);
        if (endpoint == null) {
            logger.warn("⚠️ 엔드포인트를 찾을 수 없음: {}", endpointId);
            return;
        }
        
        // 종합적 보안 분석
        SecurityAnalysisResult securityResult = securityAnalyzer.performComprehensiveAnalysis(endpoint);
        
        // 보안 취약점 발견 시 즉시 알림
        if (securityResult.hasVulnerabilities()) {
            alertSecurityVulnerabilities(endpoint, securityResult);
        }
        
        // 보안 개선 제안 생성
        List<SecurityRecommendation> recommendations = 
            securityAnalyzer.generateRecommendations(securityResult);
        
        // 결과 저장 및 알림
        endpoint.setSecurityAnalysis(securityResult);
        
        publishEvent("API_SECURITY_ANALYSIS_COMPLETED", Map.of(
            "endpointId", endpointId,
            "securityLevel", securityResult.getSecurityLevel(),
            "vulnerabilityCount", securityResult.getVulnerabilities().size(),
            "recommendations", recommendations,
            "analyzedAt", LocalDateTime.now()
        ));
    }
    
    /**
     * 디버깅 지원을 위한 API 분석
     */
    private void supportDebugAnalysis(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> debugData = (Map<String, Object>) event.getData();
        
        @SuppressWarnings("unchecked")
        List<String> components = (List<String>) debugData.get("components");
        String debugContext = (String) debugData.get("debugContext");
        
        logger.info("🔧 디버깅 지원 API 분석: {}", debugContext);
        
        // API 관련 디버깅 정보 수집
        List<ApiEndpoint> relatedEndpoints = findRelatedEndpoints(components);
        List<ApiChangeRecord> recentChanges = findRecentApiChanges(relatedEndpoints);
        List<String> potentialIssues = analyzePotentialApiIssues(relatedEndpoints, debugContext);
        
        // DebugAgent에 API 관련 디버깅 정보 제공
        publishEvent("API_DEBUG_INFO_PROVIDED", Map.of(
            "relatedEndpoints", relatedEndpoints.stream().map(ApiEndpoint::getEndpointId).toList(),
            "recentChanges", recentChanges,
            "potentialIssues", potentialIssues,
            "debugRecommendations", generateDebugRecommendations(relatedEndpoints, debugContext)
        ));
    }
    
    /**
     * 종합적 API 감사
     */
    private void performComprehensiveAudit(AgentEvent event) {
        logger.info("🔍 종합적 API 감사 수행");
        
        // 1. 모든 API 엔드포인트 분석
        ApiAuditReport auditReport = ApiAuditReport.builder()
            .auditId(UUID.randomUUID().toString())
            .auditDate(LocalDateTime.now())
            .totalEndpoints(discoveredEndpoints.size())
            .build();
        
        // 2. 보안 감사
        SecurityAuditResult securityAudit = performSecurityAudit();
        auditReport.setSecurityAudit(securityAudit);
        
        // 3. 성능 감사
        PerformanceAuditResult performanceAudit = performPerformanceAudit();
        auditReport.setPerformanceAudit(performanceAudit);
        
        // 4. 문서화 상태 감사
        DocumentationAuditResult docAudit = performDocumentationAudit();
        auditReport.setDocumentationAudit(docAudit);
        
        // 5. 전체 점수 계산
        double overallScore = calculateOverallAuditScore(auditReport);
        auditReport.setOverallScore(overallScore);
        
        // 6. 개선 권장사항 생성
        List<String> recommendations = generateAuditRecommendations(auditReport);
        auditReport.setRecommendations(recommendations);
        
        // 7. 결과 알림
        publishEvent("COMPREHENSIVE_API_AUDIT_COMPLETED", Map.of(
            "auditReport", auditReport,
            "overallScore", overallScore,
            "criticalIssues", auditReport.getCriticalIssueCount(),
            "recommendations", recommendations
        ));
        
        logger.info("✅ API 감사 완료 - 전체 점수: {:.1f}/100", overallScore);
    }
    
    /**
     * API 문서화 상태 조회
     */
    public Map<String, Object> getDocumentationStatus() {
        int documentedEndpoints = (int) discoveredEndpoints.values().stream()
            .mapToInt(endpoint -> endpoint.getDocumentation() != null ? 1 : 0)
            .sum();
        
        double documentationCoverage = discoveredEndpoints.isEmpty() ? 0.0 :
            (double) documentedEndpoints / discoveredEndpoints.size() * 100;
        
        Map<String, Long> endpointsByMethod = discoveredEndpoints.values().stream()
            .collect(java.util.stream.Collectors.groupingBy(
                ApiEndpoint::getHttpMethod,
                java.util.stream.Collectors.counting()
            ));
        
        return Map.of(
            "agentType", getAgentType(),
            "totalEndpoints", discoveredEndpoints.size(),
            "documentedEndpoints", documentedEndpoints,
            "documentationCoverage", documentationCoverage,
            "endpointsByMethod", endpointsByMethod,
            "totalDocuments", documentationResults.size(),
            "totalTestCases", testCases.values().stream().mapToInt(List::size).sum(),
            "lastUpdate", LocalDateTime.now()
        );
    }
    
    // Private helper methods (구현 상세)
    
    private void discoverExistingEndpoints() {
        logger.debug("기존 API 엔드포인트 발견 중...");
        // Spring Boot 애플리케이션에서 컨트롤러 스캔하여 엔드포인트 발견
    }
    
    private void loadExistingDocumentation() {
        logger.debug("기존 문서화 결과 로드 중...");
    }
    
    private void startApiMonitoring() {
        logger.debug("API 모니터링 시작");
    }
    
    private void scheduleDocumentationUpdates() {
        logger.debug("정기적 문서 업데이트 스케줄링");
    }
    
    private void generateEndpointDocumentation(ApiEndpoint endpoint) {
        // 개별 엔드포인트 문서 생성
        ApiDocumentation doc = openAPIGenerator.generateForEndpoint(endpoint);
        endpoint.setDocumentation(doc);
    }
    
    private void notifyEndpointDiscovered(ApiEndpoint endpoint) {
        // ClaudeGuideAgent에 API 설계 가이드라인 요청
        publishEvent("API_GUIDELINE_REQUEST", Map.of(
            "endpointId", endpoint.getEndpointId(),
            "method", endpoint.getHttpMethod(),
            "path", endpoint.getPath()
        ));
        
        // PortfolioTroubleshootAgent에 API 관련 이슈 추적 요청
        publishEvent("API_ISSUE_TRACKING_REQUEST", Map.of(
            "endpointId", endpoint.getEndpointId(),
            "trackingType", "NEW_API_ENDPOINT"
        ));
    }
    
    // Placeholder implementations for complex methods
    private List<ApiTestCase> generateEndpointTestCases(ApiEndpoint endpoint) {
        return Arrays.asList(
            ApiTestCase.builder()
                .testId(UUID.randomUUID().toString())
                .endpointId(endpoint.getEndpointId())
                .testType("BASIC_FUNCTIONALITY")
                .description("기본 기능 테스트")
                .build()
        );
    }
    
    private boolean isBreakingChange(ApiChangeRecord changeRecord) {
        return changeRecord.getChangeType() == ApiChangeType.REMOVED ||
               changeRecord.getChangeType() == ApiChangeType.MODIFIED;
    }
    
    private void alertBreakingChange(ApiChangeRecord changeRecord) {
        logger.warn("🚨 Breaking change 감지: {}", changeRecord.getDescription());
    }
    
    private void markDocumentationForUpdate(String endpointId) {
        // 문서 업데이트 필요 표시
    }
    
    private List<String> analyzePotentialIssues(ApiChangeRecord changeRecord) {
        return Arrays.asList("API 호환성 문제 가능성", "클라이언트 영향 검토 필요");
    }
    
    private Collection<ApiEndpoint> selectEndpointsForDocumentation(String scope, Map<String, Object> requestData) {
        return discoveredEndpoints.values();
    }
    
    private ApiDocumentation generateApiDocumentation(Collection<ApiEndpoint> endpoints, String format) {
        return openAPIGenerator.generateDocumentation(endpoints, format);
    }
    
    private DocumentationQuality validateDocumentationQuality(ApiDocumentation documentation) {
        return DocumentationQuality.builder()
            .overallGrade("B+")
            .completeness(0.85)
            .accuracy(0.9)
            .build();
    }
    
    // Test generation methods
    private List<ApiTestCase> generateUnitTests(ApiEndpoint endpoint) { return new ArrayList<>(); }
    private List<ApiTestCase> generateIntegrationTests(ApiEndpoint endpoint) { return new ArrayList<>(); }
    private List<ApiTestCase> generateE2ETests(ApiEndpoint endpoint) { return new ArrayList<>(); }
    private List<ApiTestCase> generateSecurityTests(ApiEndpoint endpoint) { return new ArrayList<>(); }
    private List<ApiTestCase> generatePerformanceTests(ApiEndpoint endpoint) { return new ArrayList<>(); }
    
    // Security methods
    private void alertSecurityVulnerabilities(ApiEndpoint endpoint, SecurityAnalysisResult result) {
        logger.warn("🔒 보안 취약점 발견: {} - {}", endpoint.getEndpointId(), result.getVulnerabilities());
    }
    
    // Debug support methods
    private List<ApiEndpoint> findRelatedEndpoints(List<String> components) { return new ArrayList<>(); }
    private List<ApiChangeRecord> findRecentApiChanges(List<ApiEndpoint> endpoints) { return new ArrayList<>(); }
    private List<String> analyzePotentialApiIssues(List<ApiEndpoint> endpoints, String context) { return new ArrayList<>(); }
    private List<String> generateDebugRecommendations(List<ApiEndpoint> endpoints, String context) { return new ArrayList<>(); }
    
    // Audit methods
    private SecurityAuditResult performSecurityAudit() { return new SecurityAuditResult(); }
    private PerformanceAuditResult performPerformanceAudit() { return new PerformanceAuditResult(); }
    private DocumentationAuditResult performDocumentationAudit() { return new DocumentationAuditResult(); }
    private double calculateOverallAuditScore(ApiAuditReport report) { return 85.0; }
    private List<String> generateAuditRecommendations(ApiAuditReport report) { return new ArrayList<>(); }
}