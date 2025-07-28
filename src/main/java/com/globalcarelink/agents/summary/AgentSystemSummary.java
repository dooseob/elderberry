package com.globalcarelink.agents.summary;

import com.globalcarelink.agents.cleanup.DuplicateFileDetector;
import com.globalcarelink.agents.documentation.SystemDocumentationAgent;
import com.globalcarelink.agents.integration.JavaScriptServiceBridge;
import com.globalcarelink.agents.integration.ServiceConsolidationConfig;
import com.globalcarelink.agents.orchestrator.IntelligentAgentOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 통합 에이전트 시스템 요약 정보 생성기
 * - 전체 시스템 상태 요약
 * - 통합 완료 상태 리포트
 * - 디렉토리 정리 현황
 * - 성능 및 효율성 지표
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentSystemSummary {
    
    private final IntelligentAgentOrchestrator orchestrator;
    private final SystemDocumentationAgent documentationAgent;
    private final JavaScriptServiceBridge javaScriptServiceBridge;
    private final DuplicateFileDetector duplicateDetector;
    private final ServiceConsolidationConfig consolidationConfig;
    
    /**
     * 전체 시스템 요약 생성
     */
    public SystemSummaryReport generateSystemSummary() {
        log.info("통합 에이전트 시스템 요약 생성 시작");
        
        // 1. 에이전트 상태 수집
        AgentStatus agentStatus = collectAgentStatus();
        
        // 2. 문서 시스템 상태 수집
        DocumentationStatus documentationStatus = collectDocumentationStatus();
        
        // 3. JavaScript 서비스 상태 수집
        ServiceStatus serviceStatus = collectServiceStatus();
        
        // 4. 중복 파일 분석
        DuplicateAnalysisStatus duplicateStatus = collectDuplicateStatus();
        
        // 5. 통합 효율성 지표 계산
        EfficiencyMetrics efficiency = calculateEfficiencyMetrics(
            agentStatus, documentationStatus, serviceStatus, duplicateStatus);
        
        // 6. 권장사항 생성
        List<String> recommendations = generateRecommendations(
            agentStatus, documentationStatus, serviceStatus, duplicateStatus);
        
        SystemSummaryReport report = new SystemSummaryReport(
            agentStatus,
            documentationStatus,
            serviceStatus,
            duplicateStatus,
            efficiency,
            recommendations,
            LocalDateTime.now()
        );
        
        log.info("통합 에이전트 시스템 요약 생성 완료");
        return report;
    }
    
    /**
     * 에이전트 상태 수집
     */
    private AgentStatus collectAgentStatus() {
        Map<String, Object> orchestratorStatus = orchestrator.getOrchestrationStatus();
        
        return new AgentStatus(
            (Integer) orchestratorStatus.get("registeredAgents"),
            (Integer) orchestratorStatus.get("activeAgents"),
            (Long) orchestratorStatus.get("totalEventsProcessed"),
            (Double) orchestratorStatus.get("averageProcessingTime"),
            (Set<String>) orchestratorStatus.get("agentCapabilities")
        );
    }
    
    /**
     * 문서 시스템 상태 수집
     */
    private DocumentationStatus collectDocumentationStatus() {
        Map<String, SystemDocumentationAgent.DocumentMetadata> registry = 
            documentationAgent.getDocumentRegistry();
        
        Map<SystemDocumentationAgent.DocumentCategory, Integer> categoryCount = new HashMap<>();
        for (SystemDocumentationAgent.DocumentMetadata doc : registry.values()) {
            categoryCount.merge(doc.getCategory(), 1, Integer::sum);
        }
        
        return new DocumentationStatus(
            registry.size(),
            categoryCount,
            documentationAgent.isActive()
        );
    }
    
    /**
     * JavaScript 서비스 상태 수집
     */
    private ServiceStatus collectServiceStatus() {
        Map<String, Object> consolidationInfo = javaScriptServiceBridge.getServiceConsolidationInfo();
        List<String> availableServices = javaScriptServiceBridge.getAvailableServices();
        
        @SuppressWarnings("unchecked")
        Map<String, List<String>> categorizedServices = 
            (Map<String, List<String>>) consolidationInfo.get("categorizedServices");
        
        return new ServiceStatus(
            availableServices.size(),
            categorizedServices.size(),
            categorizedServices,
            true // JavaScript 서비스 브릿지 활성 상태
        );
    }
    
    /**
     * 중복 파일 분석 상태 수집
     */
    private DuplicateAnalysisStatus collectDuplicateStatus() {
        DuplicateFileDetector.DuplicateAnalysisResult result = duplicateDetector.detectDuplicates();
        
        return new DuplicateAnalysisStatus(
            result.getDuplicateGroups().size(),
            result.getTotalDuplicates(),
            result.getRecommendations().size(),
            result.getRecommendations()
        );
    }
    
    /**
     * 효율성 지표 계산
     */
    private EfficiencyMetrics calculateEfficiencyMetrics(
            AgentStatus agentStatus,
            DocumentationStatus documentationStatus,
            ServiceStatus serviceStatus,
            DuplicateAnalysisStatus duplicateStatus) {
        
        // 시스템 통합도 계산 (0-1)
        double integrationScore = calculateIntegrationScore(agentStatus, serviceStatus);
        
        // 문서화 완성도 계산 (0-1)
        double documentationCompleteness = calculateDocumentationCompleteness(documentationStatus);
        
        // 코드 정리 효율성 계산 (0-1)
        double cleanupEfficiency = calculateCleanupEfficiency(duplicateStatus);
        
        // 전체 시스템 효율성 계산 (0-1)
        double overallEfficiency = (integrationScore + documentationCompleteness + cleanupEfficiency) / 3.0;
        
        return new EfficiencyMetrics(
            integrationScore,
            documentationCompleteness,
            cleanupEfficiency,
            overallEfficiency
        );
    }
    
    /**
     * 통합도 점수 계산
     */
    private double calculateIntegrationScore(AgentStatus agentStatus, ServiceStatus serviceStatus) {
        // 활성 에이전트 비율
        double agentActiveRatio = agentStatus.getRegisteredAgents() > 0 ? 
            (double) agentStatus.getActiveAgents() / agentStatus.getRegisteredAgents() : 0;
        
        // 서비스 카테고리 다양성
        double serviceDiversity = serviceStatus.getServiceCategories() / 5.0; // 최대 5개 카테고리
        
        // JavaScript-Java 브릿지 활성 여부
        double bridgeBonus = serviceStatus.isBridgeActive() ? 0.3 : 0;
        
        return Math.min(1.0, (agentActiveRatio * 0.4) + (serviceDiversity * 0.3) + bridgeBonus);
    }
    
    /**
     * 문서화 완성도 계산
     */
    private double calculateDocumentationCompleteness(DocumentationStatus documentationStatus) {
        // 문서 수가 많을수록 좋음 (최대 100개까지)
        double documentCount = Math.min(1.0, documentationStatus.getTotalDocuments() / 100.0);
        
        // 카테고리 다양성 (최대 7개 카테고리)
        double categoryDiversity = Math.min(1.0, documentationStatus.getCategoryCount().size() / 7.0);
        
        // 에이전트 활성 여부
        double agentActive = documentationStatus.isAgentActive() ? 0.3 : 0;
        
        return (documentCount * 0.4) + (categoryDiversity * 0.3) + agentActive;
    }
    
    /**
     * 정리 효율성 계산
     */
    private double cleanupEfficiency(DuplicateAnalysisStatus duplicateStatus) {
        // 중복이 적을수록 좋음
        double duplicateScore = duplicateStatus.getTotalDuplicates() > 0 ? 
            1.0 - Math.min(1.0, duplicateStatus.getTotalDuplicates() / 50.0) : 1.0;
        
        // 권장사항이 있으면 정리 가능성이 있음
        double recommendationBonus = duplicateStatus.getRecommendationCount() > 0 ? 0.1 : 0;
        
        return Math.min(1.0, duplicateScore + recommendationBonus);
    }
    
    /**
     * 권장사항 생성
     */
    private List<String> generateRecommendations(
            AgentStatus agentStatus,
            DocumentationStatus documentationStatus,
            ServiceStatus serviceStatus,
            DuplicateAnalysisStatus duplicateStatus) {
        
        List<String> recommendations = new ArrayList<>();
        
        // 에이전트 관련 권장사항
        if (agentStatus.getActiveAgents() < agentStatus.getRegisteredAgents()) {
            recommendations.add("비활성 에이전트 활성화 검토 필요: " + 
                (agentStatus.getRegisteredAgents() - agentStatus.getActiveAgents()) + "개 에이전트");
        }
        
        // 문서 관련 권장사항
        if (documentationStatus.getTotalDocuments() < 20) {
            recommendations.add("문서화 확대 권장: 현재 " + documentationStatus.getTotalDocuments() + "개 문서");
        }
        
        // 서비스 관련 권장사항
        if (!serviceStatus.isBridgeActive()) {
            recommendations.add("JavaScript-Java 브릿지 활성화 필요");
        }
        
        // 중복 파일 관련 권장사항
        if (duplicateStatus.getTotalDuplicates() > 0) {
            recommendations.add("중복 파일 정리 권장: " + duplicateStatus.getTotalDuplicates() + 
                "개 중복, " + duplicateStatus.getRecommendationCount() + "개 권장사항");
        }
        
        // 성능 최적화 권장사항
        if (agentStatus.getAverageProcessingTime() > 1000) { // 1초 초과
            recommendations.add("에이전트 처리 성능 최적화 검토 필요");
        }
        
        return recommendations;
    }
    
    // Data classes
    
    public static class SystemSummaryReport {
        private final AgentStatus agentStatus;
        private final DocumentationStatus documentationStatus;
        private final ServiceStatus serviceStatus;
        private final DuplicateAnalysisStatus duplicateStatus;
        private final EfficiencyMetrics efficiency;
        private final List<String> recommendations;
        private final LocalDateTime generatedAt;
        
        public SystemSummaryReport(AgentStatus agentStatus, DocumentationStatus documentationStatus,
                                 ServiceStatus serviceStatus, DuplicateAnalysisStatus duplicateStatus,
                                 EfficiencyMetrics efficiency, List<String> recommendations,
                                 LocalDateTime generatedAt) {
            this.agentStatus = agentStatus;
            this.documentationStatus = documentationStatus;
            this.serviceStatus = serviceStatus;
            this.duplicateStatus = duplicateStatus;
            this.efficiency = efficiency;
            this.recommendations = recommendations;
            this.generatedAt = generatedAt;
        }
        
        // Getters
        public AgentStatus getAgentStatus() { return agentStatus; }
        public DocumentationStatus getDocumentationStatus() { return documentationStatus; }
        public ServiceStatus getServiceStatus() { return serviceStatus; }
        public DuplicateAnalysisStatus getDuplicateStatus() { return duplicateStatus; }
        public EfficiencyMetrics getEfficiency() { return efficiency; }
        public List<String> getRecommendations() { return recommendations; }
        public LocalDateTime getGeneratedAt() { return generatedAt; }
    }
    
    public static class AgentStatus {
        private final int registeredAgents;
        private final int activeAgents;
        private final long totalEventsProcessed;
        private final double averageProcessingTime;
        private final Set<String> agentCapabilities;
        
        public AgentStatus(int registeredAgents, int activeAgents, long totalEventsProcessed,
                          double averageProcessingTime, Set<String> agentCapabilities) {
            this.registeredAgents = registeredAgents;
            this.activeAgents = activeAgents;
            this.totalEventsProcessed = totalEventsProcessed;
            this.averageProcessingTime = averageProcessingTime;
            this.agentCapabilities = agentCapabilities;
        }
        
        public int getRegisteredAgents() { return registeredAgents; }
        public int getActiveAgents() { return activeAgents; }
        public long getTotalEventsProcessed() { return totalEventsProcessed; }
        public double getAverageProcessingTime() { return averageProcessingTime; }
        public Set<String> getAgentCapabilities() { return agentCapabilities; }
    }
    
    public static class DocumentationStatus {
        private final int totalDocuments;
        private final Map<SystemDocumentationAgent.DocumentCategory, Integer> categoryCount;
        private final boolean agentActive;
        
        public DocumentationStatus(int totalDocuments, 
                                 Map<SystemDocumentationAgent.DocumentCategory, Integer> categoryCount,
                                 boolean agentActive) {
            this.totalDocuments = totalDocuments;
            this.categoryCount = categoryCount;
            this.agentActive = agentActive;
        }
        
        public int getTotalDocuments() { return totalDocuments; }
        public Map<SystemDocumentationAgent.DocumentCategory, Integer> getCategoryCount() { return categoryCount; }
        public boolean isAgentActive() { return agentActive; }
    }
    
    public static class ServiceStatus {
        private final int availableServices;
        private final int serviceCategories;
        private final Map<String, List<String>> categorizedServices;
        private final boolean bridgeActive;
        
        public ServiceStatus(int availableServices, int serviceCategories,
                           Map<String, List<String>> categorizedServices, boolean bridgeActive) {
            this.availableServices = availableServices;
            this.serviceCategories = serviceCategories;
            this.categorizedServices = categorizedServices;
            this.bridgeActive = bridgeActive;
        }
        
        public int getAvailableServices() { return availableServices; }
        public int getServiceCategories() { return serviceCategories; }
        public Map<String, List<String>> getCategorizedServices() { return categorizedServices; }
        public boolean isBridgeActive() { return bridgeActive; }
    }
    
    public static class DuplicateAnalysisStatus {
        private final int duplicateGroups;
        private final int totalDuplicates;
        private final int recommendationCount;
        private final List<DuplicateFileDetector.CleanupRecommendation> recommendations;
        
        public DuplicateAnalysisStatus(int duplicateGroups, int totalDuplicates, int recommendationCount,
                                     List<DuplicateFileDetector.CleanupRecommendation> recommendations) {
            this.duplicateGroups = duplicateGroups;
            this.totalDuplicates = totalDuplicates;
            this.recommendationCount = recommendationCount;
            this.recommendations = recommendations;
        }
        
        public int getDuplicateGroups() { return duplicateGroups; }
        public int getTotalDuplicates() { return totalDuplicates; }
        public int getRecommendationCount() { return recommendationCount; }
        public List<DuplicateFileDetector.CleanupRecommendation> getRecommendations() { return recommendations; }
    }
    
    public static class EfficiencyMetrics {
        private final double integrationScore;
        private final double documentationCompleteness;
        private final double cleanupEfficiency;
        private final double overallEfficiency;
        
        public EfficiencyMetrics(double integrationScore, double documentationCompleteness,
                               double cleanupEfficiency, double overallEfficiency) {
            this.integrationScore = integrationScore;
            this.documentationCompleteness = documentationCompleteness;
            this.cleanupEfficiency = cleanupEfficiency;
            this.overallEfficiency = overallEfficiency;
        }
        
        public double getIntegrationScore() { return integrationScore; }
        public double getDocumentationCompleteness() { return documentationCompleteness; }
        public double getCleanupEfficiency() { return cleanupEfficiency; }
        public double getOverallEfficiency() { return overallEfficiency; }
    }
}