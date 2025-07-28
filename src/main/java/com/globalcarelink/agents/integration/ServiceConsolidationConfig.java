package com.globalcarelink.agents.integration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * JavaScript 서비스 통합 설정
 * - 중복 서비스 통합 매핑
 * - 서비스 카테고리 정의
 * - 서비스 우선순위 설정
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "agent.integration.services")
public class ServiceConsolidationConfig {
    
    /**
     * 서비스 통합 매핑
     * - 중복된 기능을 가진 서비스들을 하나로 통합
     */
    private Map<String, ServiceMapping> consolidationMap = new HashMap<>();
    
    /**
     * 서비스 카테고리
     */
    private Map<String, ServiceCategory> categories = new HashMap<>();
    
    /**
     * 서비스 우선순위
     */
    private Map<String, Integer> priorities = new HashMap<>();
    
    public ServiceConsolidationConfig() {
        initializeConsolidationMap();
        initializeCategories();
        initializePriorities();
    }
    
    /**
     * 서비스 통합 매핑 초기화
     */
    private void initializeConsolidationMap() {
        // 통합 분석 오케스트레이터 통합
        consolidationMap.put("analysis-orchestrator", new ServiceMapping(
            "IntegratedAnalysisOrchestrator",
            List.of("EnhancedAnalysisOrchestrator", "IntegratedAnalysisOrchestrator"),
            "통합 분석 오케스트레이터로 통합"
        ));
        
        // 분석 에이전트 서비스
        consolidationMap.put("analysis-agent", new ServiceMapping(
            "AnalysisAgentService",
            List.of("AnalysisAgentService"),
            "기본 분석 에이전트 서비스"
        ));
        
        // 예측 분석 서비스
        consolidationMap.put("predictive-analysis", new ServiceMapping(
            "PredictiveAnalysisService",
            List.of("PredictiveAnalysisService"),
            "예측 분석 전문 서비스"
        ));
        
        // 문서 학습 서비스
        consolidationMap.put("document-learning", new ServiceMapping(
            "DocumentLearningService",
            List.of("DocumentLearningService"),
            "문서 기반 학습 서비스"
        ));
        
        // 솔루션 데이터베이스 서비스
        consolidationMap.put("solutions-db", new ServiceMapping(
            "SolutionsDbLearningService",
            List.of("SolutionsDbLearningService", "AutomatedSolutionLogger"),
            "솔루션 데이터베이스 통합 서비스"
        ));
        
        // 개발 워크플로 서비스
        consolidationMap.put("dev-workflow", new ServiceMapping(
            "DevWorkflowService",
            List.of("DevWorkflowService"),
            "개발 워크플로 관리 서비스"
        ));
        
        // 동적 체크리스트 서비스
        consolidationMap.put("dynamic-checklist", new ServiceMapping(
            "DynamicChecklistService",
            List.of("DynamicChecklistService"),
            "동적 체크리스트 생성 서비스"
        ));
        
        // 보안 분석 서비스
        consolidationMap.put("security-analysis", new ServiceMapping(
            "SnykSecurityAnalysisService",
            List.of("SnykSecurityAnalysisService"),
            "보안 취약점 분석 서비스"
        ));
        
        // 코드 품질 분석 서비스
        consolidationMap.put("quality-analysis", new ServiceMapping(
            "SonarQubeAnalysisService",
            List.of("SonarQubeAnalysisService"),
            "코드 품질 분석 서비스"
        ));
        
        // 에이전트 브릿지 서비스
        consolidationMap.put("agent-bridge", new ServiceMapping(
            "AgentBridgeService",
            List.of("AgentBridgeService"),
            "Java-JavaScript 에이전트 브릿지"
        ));
    }
    
    /**
     * 서비스 카테고리 초기화
     */
    private void initializeCategories() {
        // 분석 카테고리
        categories.put("analysis", new ServiceCategory(
            "분석",
            List.of("analysis-orchestrator", "analysis-agent", "predictive-analysis"),
            "다양한 분석 서비스들"
        ));
        
        // 학습 카테고리
        categories.put("learning", new ServiceCategory(
            "학습",
            List.of("document-learning", "solutions-db"),
            "학습 및 지식 축적 서비스들"
        ));
        
        // 워크플로 카테고리
        categories.put("workflow", new ServiceCategory(
            "워크플로",
            List.of("dev-workflow", "dynamic-checklist"),
            "개발 워크플로 관리 서비스들"
        ));
        
        // 품질 카테고리
        categories.put("quality", new ServiceCategory(
            "품질",
            List.of("security-analysis", "quality-analysis"),
            "코드 품질 및 보안 분석 서비스들"
        ));
        
        // 통합 카테고리
        categories.put("integration", new ServiceCategory(
            "통합",
            List.of("agent-bridge"),
            "시스템 통합 서비스들"
        ));
    }
    
    /**
     * 서비스 우선순위 초기화
     */
    private void initializePriorities() {
        // 높은 우선순위 (90-100)
        priorities.put("agent-bridge", 100);
        priorities.put("analysis-orchestrator", 95);
        
        // 중간 우선순위 (70-89)
        priorities.put("security-analysis", 85);
        priorities.put("quality-analysis", 85);
        priorities.put("predictive-analysis", 80);
        priorities.put("solutions-db", 75);
        
        // 일반 우선순위 (50-69)
        priorities.put("dev-workflow", 65);
        priorities.put("document-learning", 60);
        priorities.put("dynamic-checklist", 60);
        priorities.put("analysis-agent", 50);
    }
    
    /**
     * 서비스 매핑 정보
     */
    @Data
    public static class ServiceMapping {
        private final String primaryService;
        private final List<String> consolidatedServices;
        private final String description;
        
        public ServiceMapping(String primaryService, List<String> consolidatedServices, String description) {
            this.primaryService = primaryService;
            this.consolidatedServices = consolidatedServices;
            this.description = description;
        }
    }
    
    /**
     * 서비스 카테고리
     */
    @Data
    public static class ServiceCategory {
        private final String name;
        private final List<String> services;
        private final String description;
        
        public ServiceCategory(String name, List<String> services, String description) {
            this.name = name;
            this.services = services;
            this.description = description;
        }
    }
    
    /**
     * 서비스 통합 여부 확인
     */
    public boolean shouldConsolidate(String serviceName) {
        return consolidationMap.values().stream()
            .anyMatch(mapping -> mapping.getConsolidatedServices().contains(serviceName) &&
                               !mapping.getPrimaryService().equals(serviceName));
    }
    
    /**
     * 통합된 서비스 이름 반환
     */
    public String getConsolidatedServiceName(String originalService) {
        return consolidationMap.values().stream()
            .filter(mapping -> mapping.getConsolidatedServices().contains(originalService))
            .map(ServiceMapping::getPrimaryService)
            .findFirst()
            .orElse(originalService);
    }
    
    /**
     * 서비스 우선순위 조회
     */
    public int getServicePriority(String serviceName) {
        return priorities.getOrDefault(
            consolidationMap.keySet().stream()
                .filter(key -> consolidationMap.get(key).getPrimaryService().equals(serviceName))
                .findFirst()
                .orElse(serviceName),
            50
        );
    }
    
    /**
     * 카테고리별 서비스 목록 조회
     */
    public List<String> getServicesByCategory(String categoryName) {
        ServiceCategory category = categories.get(categoryName);
        return category != null ? category.getServices() : List.of();
    }
}