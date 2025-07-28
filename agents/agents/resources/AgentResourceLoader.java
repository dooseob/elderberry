package com.globalcarelink.agents.resources;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 에이전트 시스템 통합 리소스 로더
 * - 에이전트 내부 문서 및 리소스 접근
 * - 다양한 형식의 리소스 로드 지원
 * - 캐싱 및 최적화
 */
@Slf4j
@Component
public class AgentResourceLoader {
    
    private static final String AGENT_RESOURCE_BASE = "agents/";
    private static final String DOCUMENTATION_PATH = AGENT_RESOURCE_BASE + "documentation/";
    private static final String KNOWLEDGE_PATH = AGENT_RESOURCE_BASE + "knowledge/";
    private static final String TROUBLESHOOTING_PATH = AGENT_RESOURCE_BASE + "troubleshooting/";
    private static final String SERVICES_PATH = AGENT_RESOURCE_BASE + "services/";
    private static final String HELPERS_PATH = AGENT_RESOURCE_BASE + "helpers/";
    private static final String CONFIG_PATH = AGENT_RESOURCE_BASE + "config/";
    private static final String ANALYZERS_PATH = AGENT_RESOURCE_BASE + "analyzers/";
    private static final String DASHBOARD_PATH = AGENT_RESOURCE_BASE + "dashboard/";
    private static final String FEEDBACK_PATH = AGENT_RESOURCE_BASE + "feedback/";
    private static final String PORTFOLIO_PATH = AGENT_RESOURCE_BASE + "portfolio/";
    
    private final Map<String, String> resourceCache = new HashMap<>();
    
    /**
     * 문서 리소스 로드
     */
    public String loadDocumentation(String documentPath) {
        String fullPath = DOCUMENTATION_PATH + documentPath;
        return loadResource(fullPath);
    }
    
    /**
     * 지식 베이스 리소스 로드
     */
    public String loadKnowledgeBase(String knowledgePath) {
        String fullPath = KNOWLEDGE_PATH + knowledgePath;
        return loadResource(fullPath);
    }
    
    /**
     * 트러블슈팅 리소스 로드
     */
    public String loadTroubleshooting(String troubleshootingPath) {
        String fullPath = TROUBLESHOOTING_PATH + troubleshootingPath;
        return loadResource(fullPath);
    }
    
    /**
     * 서비스 리소스 로드
     */
    public String loadService(String servicePath) {
        String fullPath = SERVICES_PATH + servicePath;
        return loadResource(fullPath);
    }
    
    /**
     * 헬퍼 리소스 로드
     */
    public String loadHelper(String helperPath) {
        String fullPath = HELPERS_PATH + helperPath;
        return loadResource(fullPath);
    }
    
    /**
     * 설정 리소스 로드
     */
    public String loadConfig(String configPath) {
        String fullPath = CONFIG_PATH + configPath;
        return loadResource(fullPath);
    }
    
    /**
     * 분석기 리소스 로드
     */
    public String loadAnalyzer(String analyzerPath) {
        String fullPath = ANALYZERS_PATH + analyzerPath;
        return loadResource(fullPath);
    }
    
    /**
     * 대시보드 리소스 로드
     */
    public String loadDashboard(String dashboardPath) {
        String fullPath = DASHBOARD_PATH + dashboardPath;
        return loadResource(fullPath);
    }
    
    /**
     * 피드백 리소스 로드
     */
    public String loadFeedback(String feedbackPath) {
        String fullPath = FEEDBACK_PATH + feedbackPath;
        return loadResource(fullPath);
    }
    
    /**
     * 포트폴리오 리소스 로드
     */
    public String loadPortfolio(String portfolioPath) {
        String fullPath = PORTFOLIO_PATH + portfolioPath;
        return loadResource(fullPath);
    }
    
    /**
     * 일반 리소스 로드
     */
    public String loadResource(String resourcePath) {
        // 캐시 확인
        if (resourceCache.containsKey(resourcePath)) {
            log.debug("캐시에서 리소스 로드: {}", resourcePath);
            return resourceCache.get(resourcePath);
        }
        
        try {
            Resource resource = new ClassPathResource(resourcePath);
            if (resource.exists()) {
                String content = new String(resource.getInputStream().readAllBytes());
                resourceCache.put(resourcePath, content);
                log.debug("리소스 로드 성공: {}", resourcePath);
                return content;
            } else {
                log.warn("리소스를 찾을 수 없습니다: {}", resourcePath);
                return null;
            }
        } catch (IOException e) {
            log.error("리소스 로드 실패: {}", resourcePath, e);
            return null;
        }
    }
    
    /**
     * 리소스 목록 조회
     */
    public List<String> listResources(String basePath) {
        List<String> resources = new ArrayList<>();
        
        try {
            Resource baseResource = new ClassPathResource(basePath);
            if (baseResource.exists()) {
                Path path = Paths.get(baseResource.getURI());
                try (Stream<Path> paths = Files.walk(path)) {
                    resources = paths
                        .filter(Files::isRegularFile)
                        .map(p -> basePath + "/" + path.relativize(p).toString())
                        .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            log.error("리소스 목록 조회 실패: {}", basePath, e);
        }
        
        return resources;
    }
    
    /**
     * 문서 메타데이터 추출
     */
    public DocumentMetadata extractMetadata(String resourcePath) {
        String content = loadResource(resourcePath);
        if (content == null) {
            return null;
        }
        
        String title = extractTitle(content);
        String description = extractDescription(content);
        List<String> keywords = extractKeywords(content);
        String category = determineCategory(resourcePath);
        
        return new DocumentMetadata(
            resourcePath,
            title,
            description,
            keywords,
            category,
            content.length()
        );
    }
    
    /**
     * 특정 카테고리의 모든 문서 로드
     */
    public Map<String, String> loadDocumentsByCategory(String category) {
        Map<String, String> documents = new HashMap<>();
        
        String basePath = switch (category.toLowerCase()) {
            case "documentation" -> DOCUMENTATION_PATH;
            case "knowledge" -> KNOWLEDGE_PATH;
            case "troubleshooting" -> TROUBLESHOOTING_PATH;
            case "services" -> SERVICES_PATH;
            case "helpers" -> HELPERS_PATH;
            case "config" -> CONFIG_PATH;
            case "analyzers" -> ANALYZERS_PATH;
            case "dashboard" -> DASHBOARD_PATH;
            case "feedback" -> FEEDBACK_PATH;
            case "portfolio" -> PORTFOLIO_PATH;
            default -> AGENT_RESOURCE_BASE;
        };
        
        List<String> resources = listResources(basePath);
        for (String resource : resources) {
            if (resource.endsWith(".md") || resource.endsWith(".json") || resource.endsWith(".js") || resource.endsWith(".html")) {
                String content = loadResource(resource);
                if (content != null) {
                    documents.put(resource, content);
                }
            }
        }
        
        return documents;
    }
    
    /**
     * 키워드로 문서 검색
     */
    public List<SearchResult> searchDocuments(String keyword) {
        List<SearchResult> results = new ArrayList<>();
        String lowerKeyword = keyword.toLowerCase();
        
        // 모든 카테고리에서 검색
        for (String category : Arrays.asList("documentation", "knowledge", "troubleshooting", 
                                           "services", "helpers", "config", "analyzers", 
                                           "dashboard", "feedback", "portfolio")) {
            Map<String, String> documents = loadDocumentsByCategory(category);
            
            for (Map.Entry<String, String> entry : documents.entrySet()) {
                String path = entry.getKey();
                String content = entry.getValue();
                
                if (content.toLowerCase().contains(lowerKeyword)) {
                    int occurrences = countOccurrences(content.toLowerCase(), lowerKeyword);
                    String snippet = extractSnippet(content, lowerKeyword);
                    
                    results.add(new SearchResult(
                        path,
                        extractTitle(content),
                        snippet,
                        occurrences,
                        category
                    ));
                }
            }
        }
        
        // 관련성 순으로 정렬
        results.sort((a, b) -> Integer.compare(b.getOccurrences(), a.getOccurrences()));
        
        return results;
    }
    
    /**
     * 캐시 초기화
     */
    public void clearCache() {
        resourceCache.clear();
        log.info("리소스 캐시가 초기화되었습니다");
    }
    
    /**
     * 캐시 상태 조회
     */
    public Map<String, Object> getCacheStatus() {
        return Map.of(
            "cachedResources", resourceCache.size(),
            "cacheSize", resourceCache.values().stream()
                .mapToInt(String::length)
                .sum(),
            "cachedPaths", new ArrayList<>(resourceCache.keySet())
        );
    }
    
    // Helper methods
    
    private String extractTitle(String content) {
        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.startsWith("# ")) {
                return line.substring(2).trim();
            }
        }
        return "Untitled";
    }
    
    private String extractDescription(String content) {
        String[] lines = content.split("\n");
        StringBuilder desc = new StringBuilder();
        boolean foundTitle = false;
        
        for (String line : lines) {
            if (line.startsWith("# ")) {
                foundTitle = true;
                continue;
            }
            if (foundTitle && !line.trim().isEmpty() && !line.startsWith("#")) {
                desc.append(line.trim()).append(" ");
                if (desc.length() > 150) break;
            }
        }
        
        String description = desc.toString().trim();
        if (description.length() > 200) {
            description = description.substring(0, 197) + "...";
        }
        
        return description;
    }
    
    private List<String> extractKeywords(String content) {
        Set<String> keywords = new HashSet<>();
        String lowerContent = content.toLowerCase();
        
        // 일반적인 키워드 패턴
        String[] commonKeywords = {
            "agent", "documentation", "troubleshooting", "integration",
            "architecture", "migration", "api", "guide", "system",
            "analysis", "solution", "knowledge", "elderberry"
        };
        
        for (String keyword : commonKeywords) {
            if (lowerContent.contains(keyword)) {
                keywords.add(keyword);
            }
        }
        
        return new ArrayList<>(keywords);
    }
    
    private String determineCategory(String resourcePath) {
        if (resourcePath.contains("/documentation/")) return "documentation";
        if (resourcePath.contains("/knowledge/")) return "knowledge";
        if (resourcePath.contains("/troubleshooting/")) return "troubleshooting";
        return "general";
    }
    
    private int countOccurrences(String text, String keyword) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(keyword, index)) != -1) {
            count++;
            index += keyword.length();
        }
        return count;
    }
    
    private String extractSnippet(String content, String keyword) {
        int index = content.toLowerCase().indexOf(keyword.toLowerCase());
        if (index == -1) return "";
        
        int start = Math.max(0, index - 50);
        int end = Math.min(content.length(), index + keyword.length() + 50);
        
        String snippet = content.substring(start, end);
        if (start > 0) snippet = "..." + snippet;
        if (end < content.length()) snippet = snippet + "...";
        
        return snippet.replace("\n", " ").trim();
    }
    
    // Data classes
    
    public static class DocumentMetadata {
        private final String path;
        private final String title;
        private final String description;
        private final List<String> keywords;
        private final String category;
        private final int size;
        
        public DocumentMetadata(String path, String title, String description,
                              List<String> keywords, String category, int size) {
            this.path = path;
            this.title = title;
            this.description = description;
            this.keywords = keywords;
            this.category = category;
            this.size = size;
        }
        
        // Getters
        public String getPath() { return path; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public List<String> getKeywords() { return keywords; }
        public String getCategory() { return category; }
        public int getSize() { return size; }
    }
    
    public static class SearchResult {
        private final String path;
        private final String title;
        private final String snippet;
        private final int occurrences;
        private final String category;
        
        public SearchResult(String path, String title, String snippet,
                          int occurrences, String category) {
            this.path = path;
            this.title = title;
            this.snippet = snippet;
            this.occurrences = occurrences;
            this.category = category;
        }
        
        // Getters
        public String getPath() { return path; }
        public String getTitle() { return title; }
        public String getSnippet() { return snippet; }
        public int getOccurrences() { return occurrences; }
        public String getCategory() { return category; }
    }
}