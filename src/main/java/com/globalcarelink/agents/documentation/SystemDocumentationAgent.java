package com.globalcarelink.agents.documentation;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.events.AgentEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 시스템 문서 관리 에이전트
 * - docs/* 디렉토리의 프로젝트 문서 관리
 * - claude-guides/* 디렉토리의 가이드 문서 관리
 * - 문서 통합 및 중복 제거
 * - 에이전트 시스템을 위한 문서 제공
 */
@Slf4j
@Component
public class SystemDocumentationAgent extends BaseAgent {
    
    private final Map<String, DocumentMetadata> documentRegistry = new ConcurrentHashMap<>();
    // 통합된 에이전트 시스템 내부 경로 사용
    private final Path agentDocsRoot = Paths.get("src/main/resources/agents/documentation");
    private final Path agentKnowledgeRoot = Paths.get("src/main/resources/agents/knowledge");
    private final Path agentTroubleshootingRoot = Paths.get("src/main/resources/agents/troubleshooting");
    
    public SystemDocumentationAgent() {
        super("SYSTEM_DOCUMENTATION", "시스템 문서 관리 에이전트");
        initializeDocumentRegistry();
    }
    
    @Override
    protected void doInitialize() {
        log.info("시스템 문서 관리 에이전트 초기화");
        scanAndRegisterDocuments();
    }
    
    @Override
    protected void doShutdown() {
        log.info("시스템 문서 관리 에이전트 종료");
        documentRegistry.clear();
    }
    
    @Override
    public void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "DOCUMENT_REQUEST" -> handleDocumentRequest(event);
            case "DOCUMENT_UPDATE" -> handleDocumentUpdate(event);
            case "DOCUMENT_SEARCH" -> handleDocumentSearch(event);
            case "DUPLICATE_CHECK" -> handleDuplicateCheck(event);
            default -> log.debug("처리하지 않는 이벤트 타입: {}", event.getType());
        }
    }
    
    /**
     * 문서 레지스트리 초기화
     */
    private void initializeDocumentRegistry() {
        // 핵심 문서 등록
        registerCoreDocuments();
    }
    
    /**
     * 핵심 문서 등록 - 통합된 경로 사용
     */
    private void registerCoreDocuments() {
        // 가이드라인 진화 시스템 문서
        registerDocument(new DocumentMetadata(
            "guideline-evolution-system",
            "가이드라인 진화 시스템",
            "src/main/resources/agents/documentation/system/analysis/guideline-evolution-system.md",
            DocumentCategory.ARCHITECTURE,
            Arrays.asList("evolution", "guidelines", "agent", "learning"),
            "Claude 가이드라인의 혁신적인 814줄 자율 진화 시스템"
        ));
        
        // 시스템 통합 마이그레이션 계획
        registerDocument(new DocumentMetadata(
            "system-integration-migration",
            "시스템 통합 마이그레이션 계획",
            "src/main/resources/agents/documentation/system/migration/system-integration-migration-plan.md",
            DocumentCategory.MIGRATION,
            Arrays.asList("integration", "migration", "agent", "architecture"),
            "4주 단계별 통합 에이전트 시스템 구축 계획"
        ));
        
        // 프로젝트 최종 요약
        registerDocument(new DocumentMetadata(
            "final-project-summary",
            "프로젝트 최종 요약",
            "src/main/resources/agents/documentation/system/analysis/final-project-summary.md",
            DocumentCategory.REPORT,
            Arrays.asList("cleanup", "summary", "architecture", "completion"),
            "Phase 1-5 체계적 정리 완료 보고서"
        ));
        
        // 아키텍처 통합 가이드
        registerDocument(new DocumentMetadata(
            "architecture-integration-guide",
            "아키텍처 통합 가이드",
            "src/main/resources/agents/documentation/guides/ARCHITECTURE_INTEGRATION_GUIDE.md",
            DocumentCategory.ARCHITECTURE,
            Arrays.asList("java", "python", "react", "integration"),
            "Java-Python-React 통합 아키텍처 가이드"
        ));
        
        // 프로젝트 개요 (가이드 문서에서)
        registerDocument(new DocumentMetadata(
            "project-overview",
            "프로젝트 개요",
            "src/main/resources/agents/documentation/guides/PROJECT_OVERVIEW.md",
            DocumentCategory.REFERENCE,
            Arrays.asList("overview", "elderberry", "project"),
            "엘더베리 프로젝트 전체 개요"
        ));
        
        // 솔루션 데이터베이스
        registerDocument(new DocumentMetadata(
            "solutions-database",
            "트러블슈팅 솔루션 DB",
            "src/main/resources/agents/troubleshooting/solutions-db.md",
            DocumentCategory.TROUBLESHOOTING,
            Arrays.asList("solutions", "troubleshooting", "database"),
            "문제 해결 솔루션 데이터베이스"
        ));
        
        // 지식 베이스 가이드라인
        registerDocument(new DocumentMetadata(
            "guidelines-database",
            "개발 가이드라인 DB",
            "src/main/resources/agents/knowledge/guidelines-database.json",
            DocumentCategory.REFERENCE,
            Arrays.asList("guidelines", "knowledge", "database"),
            "개발 가이드라인 데이터베이스"
        ));
    }
    
    /**
     * 문서 디렉토리 스캔 및 등록
     */
    private void scanAndRegisterDocuments() {
        try {
            // 통합된 에이전트 문서 디렉토리 스캔
            scanDirectory(agentDocsRoot);
            
            // 지식 베이스 디렉토리 스캔
            scanDirectory(agentKnowledgeRoot);
            
            // 트러블슈팅 디렉토리 스캔
            scanDirectory(agentTroubleshootingRoot);
            
            log.info("총 {}개의 문서가 등록되었습니다", documentRegistry.size());
            
        } catch (Exception e) {
            log.error("문서 스캔 중 오류 발생", e);
        }
    }
    
    /**
     * 디렉토리 스캔
     */
    private void scanDirectory(Path directory) {
        if (!Files.exists(directory)) {
            log.warn("디렉토리가 존재하지 않습니다: {}", directory);
            return;
        }
        
        try (Stream<Path> paths = Files.walk(directory)) {
            paths.filter(Files::isRegularFile)
                .filter(path -> path.toString().endsWith(".md"))
                .forEach(this::registerDocumentFromPath);
                
        } catch (IOException e) {
            log.error("디렉토리 스캔 실패: {}", directory, e);
        }
    }
    
    /**
     * 파일 경로로부터 문서 등록
     */
    private void registerDocumentFromPath(Path path) {
        try {
            String content = Files.readString(path);
            String fileName = path.getFileName().toString();
            String id = fileName.replace(".md", "").toLowerCase();
            
            // 제목 추출
            String title = extractTitle(content, fileName);
            
            // 카테고리 결정
            DocumentCategory category = determineCategory(path, content);
            
            // 키워드 추출
            List<String> keywords = extractKeywords(content);
            
            // 설명 추출
            String description = extractDescription(content);
            
            DocumentMetadata metadata = new DocumentMetadata(
                id,
                title,
                path.toString(),
                category,
                keywords,
                description
            );
            
            registerDocument(metadata);
            
        } catch (IOException e) {
            log.error("문서 등록 실패: {}", path, e);
        }
    }
    
    /**
     * 문서 등록
     */
    private void registerDocument(DocumentMetadata metadata) {
        documentRegistry.put(metadata.getId(), metadata);
        log.debug("문서 등록: {} - {}", metadata.getId(), metadata.getTitle());
    }
    
    /**
     * 문서 요청 처리
     */
    private void handleDocumentRequest(AgentEvent event) {
        String documentId = (String) event.getData().get("documentId");
        
        DocumentMetadata metadata = documentRegistry.get(documentId);
        if (metadata != null) {
            try {
                String content = Files.readString(Paths.get(metadata.getPath()));
                
                Map<String, Object> response = Map.of(
                    "documentId", documentId,
                    "metadata", metadata,
                    "content", content
                );
                
                publishEvent(AgentEvent.builder()
                    .type("DOCUMENT_RESPONSE")
                    .sourceAgentId(getAgentId())
                    .sourceAgentType(getAgentType())
                    .targetAgentId(event.getSourceAgentId())
                    .data(response)
                    .build());
                    
            } catch (IOException e) {
                log.error("문서 읽기 실패: {}", documentId, e);
            }
        }
    }
    
    /**
     * 문서 검색 처리
     */
    private void handleDocumentSearch(AgentEvent event) {
        String query = (String) event.getData().get("query");
        String categoryFilter = (String) event.getData().get("category");
        
        List<DocumentMetadata> results = documentRegistry.values().stream()
            .filter(doc -> matchesQuery(doc, query))
            .filter(doc -> categoryFilter == null || 
                          doc.getCategory().name().equalsIgnoreCase(categoryFilter))
            .collect(Collectors.toList());
        
        Map<String, Object> response = Map.of(
            "query", query,
            "results", results,
            "count", results.size()
        );
        
        publishEvent(AgentEvent.builder()
            .type("DOCUMENT_SEARCH_RESPONSE")
            .sourceAgentId(getAgentId())
            .sourceAgentType(getAgentType())
            .targetAgentId(event.getSourceAgentId())
            .data(response)
            .build());
    }
    
    /**
     * 중복 문서 확인
     */
    private void handleDuplicateCheck(AgentEvent event) {
        Map<String, List<DocumentMetadata>> duplicates = findDuplicateDocuments();
        
        Map<String, Object> response = Map.of(
            "duplicates", duplicates,
            "totalDuplicates", duplicates.size()
        );
        
        publishEvent(AgentEvent.builder()
            .type("DUPLICATE_CHECK_RESPONSE")
            .sourceAgentId(getAgentId())
            .sourceAgentType(getAgentType())
            .targetAgentId(event.getSourceAgentId())
            .data(response)
            .build());
    }
    
    /**
     * 문서 업데이트 처리
     */
    private void handleDocumentUpdate(AgentEvent event) {
        // 문서 레지스트리 재스캔
        documentRegistry.clear();
        initializeDocumentRegistry();
        scanAndRegisterDocuments();
        
        publishEvent(AgentEvent.builder()
            .type("DOCUMENT_UPDATE_COMPLETE")
            .sourceAgentId(getAgentId())
            .sourceAgentType(getAgentType())
            .data(Map.of("documentCount", documentRegistry.size()))
            .build());
    }
    
    /**
     * 중복 문서 찾기
     */
    private Map<String, List<DocumentMetadata>> findDuplicateDocuments() {
        Map<String, List<DocumentMetadata>> titleGroups = documentRegistry.values().stream()
            .collect(Collectors.groupingBy(DocumentMetadata::getTitle));
        
        return titleGroups.entrySet().stream()
            .filter(entry -> entry.getValue().size() > 1)
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
    
    /**
     * 쿼리 매칭 확인
     */
    private boolean matchesQuery(DocumentMetadata doc, String query) {
        if (query == null || query.trim().isEmpty()) {
            return true;
        }
        
        String lowerQuery = query.toLowerCase();
        return doc.getTitle().toLowerCase().contains(lowerQuery) ||
               doc.getDescription().toLowerCase().contains(lowerQuery) ||
               doc.getKeywords().stream().anyMatch(k -> k.toLowerCase().contains(lowerQuery));
    }
    
    /**
     * 제목 추출
     */
    private String extractTitle(String content, String fileName) {
        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.startsWith("# ")) {
                return line.substring(2).trim();
            }
        }
        return fileName.replace(".md", "").replace("-", " ");
    }
    
    /**
     * 카테고리 결정
     */
    private DocumentCategory determineCategory(Path path, String content) {
        String pathStr = path.toString().toLowerCase();
        
        if (pathStr.contains("migration")) return DocumentCategory.MIGRATION;
        if (pathStr.contains("analysis")) return DocumentCategory.ARCHITECTURE;
        if (pathStr.contains("troubleshooting")) return DocumentCategory.TROUBLESHOOTING;
        if (pathStr.contains("reference")) return DocumentCategory.REFERENCE;
        if (pathStr.contains("report")) return DocumentCategory.REPORT;
        
        // 내용 기반 분류
        String lowerContent = content.toLowerCase();
        if (lowerContent.contains("architecture") || lowerContent.contains("design")) {
            return DocumentCategory.ARCHITECTURE;
        }
        if (lowerContent.contains("troubleshoot") || lowerContent.contains("solution")) {
            return DocumentCategory.TROUBLESHOOTING;
        }
        
        return DocumentCategory.GENERAL;
    }
    
    /**
     * 키워드 추출
     */
    private List<String> extractKeywords(String content) {
        Set<String> keywords = new HashSet<>();
        
        // 제목에서 키워드 추출
        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.startsWith("#")) {
                String[] words = line.replaceAll("#", "").trim().split("\\s+");
                for (String word : words) {
                    if (word.length() > 3) {
                        keywords.add(word.toLowerCase());
                    }
                }
            }
        }
        
        // 특정 키워드 패턴 추가
        if (content.contains("agent") || content.contains("Agent")) keywords.add("agent");
        if (content.contains("integration")) keywords.add("integration");
        if (content.contains("migration")) keywords.add("migration");
        if (content.contains("architecture")) keywords.add("architecture");
        
        return new ArrayList<>(keywords);
    }
    
    /**
     * 설명 추출
     */
    private String extractDescription(String content) {
        String[] lines = content.split("\n");
        StringBuilder desc = new StringBuilder();
        
        boolean startReading = false;
        int lineCount = 0;
        
        for (String line : lines) {
            if (line.startsWith("# ")) {
                startReading = true;
                continue;
            }
            
            if (startReading && !line.trim().isEmpty() && !line.startsWith("#")) {
                desc.append(line.trim()).append(" ");
                lineCount++;
                
                if (lineCount >= 2) break;
            }
        }
        
        String description = desc.toString().trim();
        if (description.length() > 200) {
            description = description.substring(0, 197) + "...";
        }
        
        return description;
    }
    
    /**
     * 문서 메타데이터 조회
     */
    public Map<String, DocumentMetadata> getDocumentRegistry() {
        return new HashMap<>(documentRegistry);
    }
    
    /**
     * 특정 카테고리의 문서 조회
     */
    public List<DocumentMetadata> getDocumentsByCategory(DocumentCategory category) {
        return documentRegistry.values().stream()
            .filter(doc -> doc.getCategory() == category)
            .collect(Collectors.toList());
    }
    
    /**
     * 문서 메타데이터
     */
    public static class DocumentMetadata {
        private final String id;
        private final String title;
        private final String path;
        private final DocumentCategory category;
        private final List<String> keywords;
        private final String description;
        
        public DocumentMetadata(String id, String title, String path, 
                              DocumentCategory category, List<String> keywords, String description) {
            this.id = id;
            this.title = title;
            this.path = path;
            this.category = category;
            this.keywords = keywords;
            this.description = description;
        }
        
        // Getters
        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getPath() { return path; }
        public DocumentCategory getCategory() { return category; }
        public List<String> getKeywords() { return keywords; }
        public String getDescription() { return description; }
    }
    
    /**
     * 문서 카테고리
     */
    public enum DocumentCategory {
        ARCHITECTURE,
        MIGRATION,
        TROUBLESHOOTING,
        REFERENCE,
        REPORT,
        GUIDE,
        GENERAL
    }
}