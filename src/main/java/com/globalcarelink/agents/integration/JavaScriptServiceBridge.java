package com.globalcarelink.agents.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * JavaScript 서비스와 Java 에이전트를 연결하는 브릿지
 */
@Slf4j
@Service
public class JavaScriptServiceBridge {
    
    private final ObjectMapper objectMapper;
    private final String claudeGuidesPath;
    private final ServiceConsolidationConfig consolidationConfig;
    
    public JavaScriptServiceBridge() {
        this.objectMapper = new ObjectMapper();
        this.claudeGuidesPath = System.getProperty("user.dir") + "/claude-guides";
        this.consolidationConfig = new ServiceConsolidationConfig();
    }
    
    /**
     * JavaScript 분석 서비스 호출 (통합 버전)
     */
    public CompletableFuture<JsonNode> callAnalysisService(String serviceName, Map<String, Object> params) {
        // 서비스 통합 확인
        String consolidatedServiceName = consolidationConfig.getConsolidatedServiceName(serviceName);
        if (!consolidatedServiceName.equals(serviceName)) {
            log.info("서비스 통합: {} -> {}", serviceName, consolidatedServiceName);
            serviceName = consolidatedServiceName;
        }
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("JavaScript 분석 서비스 호출: {}", serviceName);
                
                String scriptPath = claudeGuidesPath + "/services/" + serviceName + ".js";
                if (!new File(scriptPath).exists()) {
                    throw new RuntimeException("JavaScript 서비스 파일이 없습니다: " + scriptPath);
                }
                
                // Node.js 스크립트 실행
                ProcessBuilder pb = new ProcessBuilder("node", scriptPath);
                pb.directory(new File(claudeGuidesPath));
                pb.environment().put("NODE_ENV", "production");
                
                // 매개변수를 JSON으로 전달
                String jsonParams = objectMapper.writeValueAsString(params);
                pb.environment().put("AGENT_PARAMS", jsonParams);
                
                Process process = pb.start();
                
                // 결과 읽기
                StringBuilder output = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        output.append(line).append("\n");
                    }
                }
                
                // 에러 출력 읽기
                StringBuilder errorOutput = new StringBuilder();
                try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        errorOutput.append(line).append("\n");
                    }
                }
                
                boolean finished = process.waitFor(30, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroyForcibly();
                    throw new RuntimeException("JavaScript 서비스 실행 시간 초과");
                }
                
                int exitCode = process.exitValue();
                if (exitCode != 0) {
                    log.error("JavaScript 서비스 실행 오류: {}", errorOutput.toString());
                    throw new RuntimeException("JavaScript 서비스 실행 실패: " + exitCode);
                }
                
                // JSON 결과 파싱
                String result = output.toString().trim();
                if (result.isEmpty()) {
                    return objectMapper.createObjectNode();
                }
                
                return objectMapper.readTree(result);
                
            } catch (Exception e) {
                log.error("JavaScript 서비스 호출 실패: {}", serviceName, e);
                throw new RuntimeException("JavaScript 서비스 호출 실패", e);
            }
        });
    }
    
    /**
     * 개발 워크플로 서비스 호출
     */
    public CompletableFuture<JsonNode> callDevWorkflowService(String projectPath, String operation) {
        Map<String, Object> params = Map.of(
            "projectPath", projectPath,
            "operation", operation,
            "timestamp", System.currentTimeMillis()
        );
        
        return callAnalysisService("DevWorkflowService", params);
    }
    
    /**
     * 예측 분석 서비스 호출
     */
    public CompletableFuture<JsonNode> callPredictiveAnalysisService(Map<String, Object> analysisData) {
        return callAnalysisService("PredictiveAnalysisService", analysisData);
    }
    
    /**
     * 문서 학습 서비스 호출
     */
    public CompletableFuture<JsonNode> callDocumentLearningService(String documentPath, String learningType) {
        Map<String, Object> params = Map.of(
            "documentPath", documentPath,
            "learningType", learningType,
            "timestamp", System.currentTimeMillis()
        );
        
        return callAnalysisService("DocumentLearningService", params);
    }
    
    /**
     * 동적 체크리스트 서비스 호출
     */
    public CompletableFuture<JsonNode> callDynamicChecklistService(String taskType, Map<String, Object> context) {
        Map<String, Object> params = new HashMap<>(context);
        params.put("taskType", taskType);
        params.put("timestamp", System.currentTimeMillis());
        
        return callAnalysisService("DynamicChecklistService", params);
    }
    
    /**
     * 솔루션 데이터베이스 학습 서비스 호출
     */
    public CompletableFuture<JsonNode> callSolutionsDbLearningService(String problemType, String solution) {
        Map<String, Object> params = Map.of(
            "problemType", problemType,
            "solution", solution,
            "timestamp", System.currentTimeMillis()
        );
        
        return callAnalysisService("SolutionsDbLearningService", params);
    }
    
    /**
     * 통합 분석 오케스트레이터 호출
     */
    public CompletableFuture<JsonNode> callIntegratedAnalysisOrchestrator(Map<String, Object> analysisRequest) {
        return callAnalysisService("IntegratedAnalysisOrchestrator", analysisRequest);
    }
    
    /**
     * 보안 분석 서비스 호출 (Snyk)
     */
    public CompletableFuture<JsonNode> callSnykSecurityAnalysis(String projectPath) {
        Map<String, Object> params = Map.of(
            "projectPath", projectPath,
            "scanType", "security",
            "timestamp", System.currentTimeMillis()
        );
        
        return callAnalysisService("SnykSecurityAnalysisService", params);
    }
    
    /**
     * 코드 품질 분석 서비스 호출 (SonarQube)
     */
    public CompletableFuture<JsonNode> callSonarQubeAnalysis(String projectPath) {
        Map<String, Object> params = Map.of(
            "projectPath", projectPath,
            "analysisType", "quality",
            "timestamp", System.currentTimeMillis()
        );
        
        return callAnalysisService("SonarQubeAnalysisService", params);
    }
    
    /**
     * 자동 솔루션 로거 호출
     */
    public CompletableFuture<JsonNode> callAutomatedSolutionLogger(String problemDescription, String solutionDetails) {
        Map<String, Object> params = Map.of(
            "problemDescription", problemDescription,
            "solutionDetails", solutionDetails,
            "timestamp", System.currentTimeMillis()
        );
        
        return callAnalysisService("AutomatedSolutionLogger", params);
    }
    
    /**
     * 여러 JavaScript 서비스를 병렬로 실행
     */
    public CompletableFuture<Map<String, JsonNode>> callMultipleServices(Map<String, Map<String, Object>> serviceRequests) {
        List<CompletableFuture<Map.Entry<String, JsonNode>>> futures = serviceRequests.entrySet().stream()
            .map(entry -> {
                String serviceName = entry.getKey();
                Map<String, Object> params = entry.getValue();
                
                return callAnalysisService(serviceName, params)
                    .thenApply(result -> Map.entry(serviceName, result));
            })
            .toList();
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> {
                Map<String, JsonNode> results = new HashMap<>();
                futures.forEach(future -> {
                    try {
                        Map.Entry<String, JsonNode> entry = future.get();
                        results.put(entry.getKey(), entry.getValue());
                    } catch (Exception e) {
                        log.error("JavaScript 서비스 실행 중 오류 발생", e);
                    }
                });
                return results;
            });
    }
    
    /**
     * JavaScript 서비스 상태 확인
     */
    public boolean isServiceAvailable(String serviceName) {
        String scriptPath = claudeGuidesPath + "/services/" + serviceName + ".js";
        File scriptFile = new File(scriptPath);
        
        if (!scriptFile.exists()) {
            log.warn("JavaScript 서비스 파일이 없습니다: {}", scriptPath);
            return false;
        }
        
        // Node.js 설치 여부 확인
        try {
            ProcessBuilder pb = new ProcessBuilder("node", "--version");
            Process process = pb.start();
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            
            return process.exitValue() == 0;
        } catch (Exception e) {
            log.warn("Node.js 실행 확인 실패", e);
            return false;
        }
    }
    
    /**
     * 사용 가능한 JavaScript 서비스 목록 조회 (통합 버전)
     */
    public List<String> getAvailableServices() {
        List<String> services = new ArrayList<>();
        File servicesDir = new File(claudeGuidesPath + "/services");
        
        if (servicesDir.exists() && servicesDir.isDirectory()) {
            File[] jsFiles = servicesDir.listFiles((dir, name) -> name.endsWith(".js"));
            if (jsFiles != null) {
                for (File file : jsFiles) {
                    String serviceName = file.getName().replace(".js", "");
                    String consolidatedName = consolidationConfig.getConsolidatedServiceName(serviceName);
                    
                    if (isServiceAvailable(serviceName) && !services.contains(consolidatedName)) {
                        services.add(consolidatedName);
                    }
                }
            }
        }
        
        // 우선순위로 정렬
        services.sort((s1, s2) -> Integer.compare(
            consolidationConfig.getServicePriority(s2),
            consolidationConfig.getServicePriority(s1)
        ));
        
        return services;
    }
    
    /**
     * 서비스 통합 정보 조회
     */
    public Map<String, Object> getServiceConsolidationInfo() {
        Map<String, Object> info = new HashMap<>();
        
        // 카테고리별 서비스
        Map<String, List<String>> categorizedServices = new HashMap<>();
        categorizedServices.put("analysis", consolidationConfig.getServicesByCategory("analysis"));
        categorizedServices.put("learning", consolidationConfig.getServicesByCategory("learning"));
        categorizedServices.put("workflow", consolidationConfig.getServicesByCategory("workflow"));
        categorizedServices.put("quality", consolidationConfig.getServicesByCategory("quality"));
        categorizedServices.put("integration", consolidationConfig.getServicesByCategory("integration"));
        
        info.put("categorizedServices", categorizedServices);
        info.put("totalCategories", categorizedServices.size());
        info.put("availableServices", getAvailableServices());
        info.put("consolidationConfig", consolidationConfig);
        
        return info;
    }
}