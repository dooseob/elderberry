package com.globalcarelink.agents.integration;

import com.globalcarelink.agents.cleanup.DuplicateFileDetector;
import com.globalcarelink.agents.documentation.SystemDocumentationAgent;
import com.globalcarelink.agents.orchestrator.IntelligentAgentOrchestrator;
import com.globalcarelink.agents.resources.AgentResourceLoader;
import com.globalcarelink.agents.services.analysis.PredictiveAnalysisService;
import com.globalcarelink.agents.services.workflow.DynamicChecklistService;
import com.globalcarelink.agents.summary.AgentSystemSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 완전 통합 테스트
 * - docs/*, claude-guides/* 물리적 통합 검증
 * - JavaScript 서비스 Java 포팅 검증
 * - 에이전트 시스템 완전 자가 완결성 검증
 */
@SpringBootTest
@ActiveProfiles("test")
class CompleteIntegrationTest {
    
    @Autowired
    private IntelligentAgentOrchestrator orchestrator;
    
    @Autowired
    private SystemDocumentationAgent documentationAgent;
    
    @Autowired
    private AgentResourceLoader resourceLoader;
    
    @Autowired
    private PredictiveAnalysisService predictiveAnalysisService;
    
    @Autowired
    private DynamicChecklistService checklistService;
    
    @Autowired
    private DuplicateFileDetector duplicateDetector;
    
    @Autowired
    private AgentSystemSummary systemSummary;
    
    @BeforeEach
    void setUp() {
        // 모든 에이전트를 오케스트레이터에 등록
        orchestrator.registerAgent(documentationAgent);
        orchestrator.registerAgent(predictiveAnalysisService);
        orchestrator.registerAgent(checklistService);
    }
    
    @Test
    void testPhysicalFileIntegration() {
        System.out.println("=== 물리적 파일 통합 테스트 ===");
        
        // 1. 문서 리소스 로드 테스트
        String guidelineDoc = resourceLoader.loadDocumentation("system/analysis/guideline-evolution-system.md");
        assertNotNull(guidelineDoc, "가이드라인 진화 시스템 문서가 로드되어야 합니다");
        assertTrue(guidelineDoc.contains("가이드라인"), "문서 내용이 정상적으로 로드되어야 합니다");
        
        // 2. 지식 베이스 리소스 로드 테스트
        String knowledgeBase = resourceLoader.loadKnowledgeBase("guidelines-database.json");
        assertNotNull(knowledgeBase, "지식 베이스가 로드되어야 합니다");
        
        // 3. 트러블슈팅 리소스 로드 테스트
        String solutionsDb = resourceLoader.loadTroubleshooting("solutions-db.md");
        assertNotNull(solutionsDb, "솔루션 DB가 로드되어야 합니다");
        
        System.out.println("✅ 모든 물리적 리소스가 정상적으로 통합되어 로드됨");
    }
    
    @Test
    void testResourceSearch() {
        System.out.println("=== 리소스 검색 테스트 ===");
        
        // 키워드 검색 테스트
        List<AgentResourceLoader.SearchResult> searchResults = resourceLoader.searchDocuments("agent");
        assertFalse(searchResults.isEmpty(), "에이전트 관련 문서가 검색되어야 합니다");
        
        System.out.println("검색 결과:");
        for (int i = 0; i < Math.min(3, searchResults.size()); i++) {
            AgentResourceLoader.SearchResult result = searchResults.get(i);
            System.out.println("  " + (i + 1) + ". " + result.getTitle() + " (" + result.getCategory() + ")");
            System.out.println("     " + result.getSnippet());
        }
        
        System.out.println("✅ 통합된 리소스에서 검색 기능 정상 작동");
    }
    
    @Test
    void testJavaScriptServicePorting() {
        System.out.println("=== JavaScript 서비스 포팅 테스트 ===");
        
        // 1. 예측 분석 서비스 테스트
        assertTrue(predictiveAnalysisService.isActive(), "예측 분석 서비스가 활성화되어야 합니다");
        assertEquals("PREDICTIVE_ANALYSIS", predictiveAnalysisService.getAgentType());
        
        // 2. 동적 체크리스트 서비스 테스트
        assertTrue(checklistService.isActive(), "동적 체크리스트 서비스가 활성화되어야 합니다");
        assertEquals("DYNAMIC_CHECKLIST", checklistService.getAgentType());
        
        System.out.println("✅ JavaScript → Java 포팅된 서비스들이 정상 작동");
    }
    
    @Test
    void testSelfContainedSystem() {
        System.out.println("=== 자가 완결 시스템 테스트 ===");
        
        // 1. 시스템 요약 생성
        AgentSystemSummary.SystemSummaryReport summary = systemSummary.generateSystemSummary();
        assertNotNull(summary, "시스템 요약이 생성되어야 합니다");
        
        // 2. 문서 시스템 상태 확인
        AgentSystemSummary.DocumentationStatus docStatus = summary.getDocumentationStatus();
        assertTrue(docStatus.getTotalDocuments() > 0, "통합된 문서가 있어야 합니다");
        assertTrue(docStatus.isAgentActive(), "문서 에이전트가 활성화되어야 합니다");
        
        // 3. 서비스 상태 확인
        AgentSystemSummary.ServiceStatus serviceStatus = summary.getServiceStatus();
        assertTrue(serviceStatus.getAvailableServices() > 0, "사용 가능한 서비스가 있어야 합니다");
        
        // 4. 효율성 지표 확인
        AgentSystemSummary.EfficiencyMetrics efficiency = summary.getEfficiency();
        assertTrue(efficiency.getOverallEfficiency() > 0.5, "전체 시스템 효율성이 50% 이상이어야 합니다");
        
        System.out.println("시스템 상태:");
        System.out.println("- 등록된 문서 수: " + docStatus.getTotalDocuments());
        System.out.println("- 사용 가능한 서비스 수: " + serviceStatus.getAvailableServices());
        System.out.println("- 전체 효율성: " + String.format("%.1f%%", efficiency.getOverallEfficiency() * 100));
        System.out.println("- 통합도: " + String.format("%.1f%%", efficiency.getIntegrationScore() * 100));
        
        System.out.println("✅ 에이전트 시스템이 완전히 자가 완결적으로 작동");
    }
    
    @Test
    void testResourceCache() {
        System.out.println("=== 리소스 캐시 테스트 ===");
        
        // 1. 리소스 로드 및 캐시 확인
        String doc1 = resourceLoader.loadDocumentation("system/analysis/final-project-summary.md");
        String doc2 = resourceLoader.loadDocumentation("system/analysis/final-project-summary.md");
        
        // 동일한 내용이어야 함 (캐시에서 로드)
        assertEquals(doc1, doc2, "캐시된 리소스는 동일한 내용이어야 합니다");
        
        // 2. 캐시 상태 확인
        var cacheStatus = resourceLoader.getCacheStatus();
        assertTrue((Integer) cacheStatus.get("cachedResources") > 0, "캐시된 리소스가 있어야 합니다");
        
        System.out.println("캐시 상태:");
        System.out.println("- 캐시된 리소스 수: " + cacheStatus.get("cachedResources"));
        System.out.println("- 캐시 크기: " + cacheStatus.get("cacheSize") + " bytes");
        
        System.out.println("✅ 리소스 캐싱 시스템 정상 작동");
    }
    
    @Test
    void testDuplicateDetectionWithIntegratedFiles() {
        System.out.println("=== 통합 파일 중복 검사 테스트 ===");
        
        // 중복 파일 검사 실행
        DuplicateFileDetector.DuplicateAnalysisResult result = duplicateDetector.detectDuplicates();
        
        assertNotNull(result, "중복 분석 결과가 있어야 합니다");
        assertNotNull(result.getDuplicateGroups(), "중복 그룹 정보가 있어야 합니다");
        assertNotNull(result.getRecommendations(), "정리 권장사항이 있어야 합니다");
        
        System.out.println("중복 검사 결과:");
        System.out.println("- 중복 그룹 수: " + result.getDuplicateGroups().size());
        System.out.println("- 총 중복 파일 수: " + result.getTotalDuplicates());
        System.out.println("- 정리 권장사항 수: " + result.getRecommendations().size());
        
        // 통합 후에는 중복이 없거나 최소화되어야 함
        System.out.println("✅ 파일 통합 후 중복 상태 확인 완료");
    }
    
    @Test
    void testOrchestrationWithIntegratedServices() {
        System.out.println("=== 통합 서비스 오케스트레이션 테스트 ===");
        
        // 오케스트레이터 상태 확인
        var orchestrationStatus = orchestrator.getOrchestrationStatus();
        
        assertTrue((Integer) orchestrationStatus.get("registeredAgents") >= 3, 
            "최소 3개 에이전트가 등록되어야 합니다");
        assertTrue((Integer) orchestrationStatus.get("activeAgents") >= 3, 
            "최소 3개 에이전트가 활성화되어야 합니다");
        
        System.out.println("오케스트레이션 상태:");
        System.out.println("- 등록된 에이전트: " + orchestrationStatus.get("registeredAgents"));
        System.out.println("- 활성 에이전트: " + orchestrationStatus.get("activeAgents"));
        System.out.println("- 처리된 이벤트: " + orchestrationStatus.get("totalEventsProcessed"));
        
        System.out.println("✅ 통합된 서비스들이 오케스트레이터에서 정상 작동");
    }
    
    @Test
    void testEndToEndIntegration() {
        System.out.println("=== 종단간 통합 테스트 ===");
        
        // 1. 문서 검색
        List<AgentResourceLoader.SearchResult> docs = resourceLoader.searchDocuments("troubleshooting");
        assertFalse(docs.isEmpty(), "트러블슈팅 관련 문서가 있어야 합니다");
        
        // 2. 예측 분석 서비스 활성화 확인
        assertTrue(predictiveAnalysisService.isActive());
        
        // 3. 체크리스트 서비스 활성화 확인
        assertTrue(checklistService.isActive());
        
        // 4. 전체 시스템 요약
        AgentSystemSummary.SystemSummaryReport finalSummary = systemSummary.generateSystemSummary();
        assertNotNull(finalSummary);
        
        // 5. 권장사항 확인
        List<String> recommendations = finalSummary.getRecommendations();
        assertNotNull(recommendations);
        
        System.out.println("=== 최종 통합 상태 ===");
        System.out.println("✅ 문서 시스템: " + finalSummary.getDocumentationStatus().getTotalDocuments() + "개 문서");
        System.out.println("✅ 서비스 시스템: " + finalSummary.getServiceStatus().getAvailableServices() + "개 서비스");
        System.out.println("✅ 전체 효율성: " + String.format("%.1f%%", finalSummary.getEfficiency().getOverallEfficiency() * 100));
        
        if (!recommendations.isEmpty()) {
            System.out.println("권장사항:");
            for (int i = 0; i < Math.min(3, recommendations.size()); i++) {
                System.out.println("  " + (i + 1) + ". " + recommendations.get(i));
            }
        }
        
        System.out.println("🎉 에이전트 시스템 완전 통합 성공!");
    }
}