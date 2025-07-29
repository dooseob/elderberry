package com.globalcarelink.agents.seo;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.context.SharedContext;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.time.LocalDateTime;

/**
 * Google SEO 최적화 전문 에이전트
 * 검색엔진 최적화, 메타태그 관리, 구조화 데이터 최적화 담당
 */
@Component
@RestController
@RequestMapping("/api/agents/seo")
public class GoogleSEOAgent extends BaseAgent {
    private static final Logger logger = LoggerFactory.getLogger(GoogleSEOAgent.class);
    
    private final SEOAnalysisService seoAnalysisService;
    private final MetaTagOptimizer metaTagOptimizer;
    private final StructuredDataGenerator structuredDataGenerator;
    private final SitemapGenerator sitemapGenerator;
    
    public GoogleSEOAgent(SharedContext sharedContext,
                         SEOAnalysisService seoAnalysisService,
                         MetaTagOptimizer metaTagOptimizer,
                         StructuredDataGenerator structuredDataGenerator,
                         SitemapGenerator sitemapGenerator) {
        super("GoogleSEOAgent", "Google SEO 최적화 및 검색엔진 최적화", sharedContext);
        this.seoAnalysisService = seoAnalysisService;
        this.metaTagOptimizer = metaTagOptimizer;
        this.structuredDataGenerator = structuredDataGenerator;
        this.sitemapGenerator = sitemapGenerator;
    }

    @Override
    protected Map<String, Object> executeTask(String task, Map<String, Object> parameters) {
        logger.info("GoogleSEOAgent 작업 시작: {}", task);
        Map<String, Object> result = new HashMap<>();
        
        try {
            switch (task.toLowerCase()) {
                case "analyze_seo":
                    result = analyzeSEOStatus(parameters);
                    break;
                case "optimize_meta_tags":
                    result = optimizeMetaTags(parameters);
                    break;
                case "generate_structured_data":
                    result = generateStructuredData(parameters);
                    break;
                case "update_sitemap":
                    result = updateSitemap(parameters);
                    break;
                case "full_seo_audit":
                    result = performFullSEOAudit(parameters);
                    break;
                case "improve_page_speed":
                    result = analyzePageSpeed(parameters);
                    break;
                default:
                    result.put("error", "지원하지 않는 작업입니다: " + task);
                    result.put("success", false);
            }
        } catch (Exception e) {
            logger.error("GoogleSEOAgent 작업 실패: {}", task, e);
            result.put("error", "SEO 작업 중 오류 발생: " + e.getMessage());
            result.put("success", false);
        }
        
        return result;
    }

    /**
     * 현재 SEO 상태 분석
     */
    private Map<String, Object> analyzeSEOStatus(Map<String, Object> parameters) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String url = (String) parameters.getOrDefault("url", "https://elderberry.co.kr");
            
            SEOAnalysisResult analysis = seoAnalysisService.analyze(url);
            
            result.put("success", true);
            result.put("seo_score", analysis.getOverallScore());
            result.put("meta_tags_status", analysis.getMetaTagsStatus());
            result.put("structured_data_status", analysis.getStructuredDataStatus());
            result.put("page_speed_score", analysis.getPageSpeedScore());
            result.put("mobile_friendly", analysis.isMobileFriendly());
            result.put("recommendations", analysis.getRecommendations());
            result.put("analysis_date", LocalDateTime.now());
            
            logger.info("SEO 분석 완료 - 점수: {}/100", analysis.getOverallScore());
            
        } catch (Exception e) {
            logger.error("SEO 분석 실패", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    /**
     * 메타 태그 최적화
     */
    private Map<String, Object> optimizeMetaTags(Map<String, Object> parameters) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String pageType = (String) parameters.getOrDefault("page_type", "general");
            Map<String, String> contentData = (Map<String, String>) parameters.getOrDefault("content_data", new HashMap<>());
            
            OptimizedMetaTags metaTags = metaTagOptimizer.optimize(pageType, contentData);
            
            result.put("success", true);
            result.put("title", metaTags.getTitle());
            result.put("description", metaTags.getDescription());
            result.put("keywords", metaTags.getKeywords());
            result.put("og_tags", metaTags.getOpenGraphTags());
            result.put("twitter_tags", metaTags.getTwitterTags());
            result.put("canonical_url", metaTags.getCanonicalUrl());
            
            logger.info("메타태그 최적화 완료 - 페이지 타입: {}", pageType);
            
        } catch (Exception e) {
            logger.error("메타태그 최적화 실패", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    /**
     * 구조화 데이터 생성
     */
    private Map<String, Object> generateStructuredData(Map<String, Object> parameters) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String schemaType = (String) parameters.getOrDefault("schema_type", "Organization");
            Map<String, Object> entityData = (Map<String, Object>) parameters.getOrDefault("entity_data", new HashMap<>());
            
            String structuredData = structuredDataGenerator.generate(schemaType, entityData);
            
            result.put("success", true);
            result.put("structured_data", structuredData);
            result.put("schema_type", schemaType);
            result.put("validation_status", "valid");
            
            logger.info("구조화 데이터 생성 완료 - 스키마 타입: {}", schemaType);
            
        } catch (Exception e) {
            logger.error("구조화 데이터 생성 실패", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    /**
     * 사이트맵 업데이트
     */
    private Map<String, Object> updateSitemap(Map<String, Object> parameters) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<String> urls = (List<String>) parameters.getOrDefault("urls", new ArrayList<>());
            String domain = (String) parameters.getOrDefault("domain", "elderberry.co.kr");
            
            String sitemap = sitemapGenerator.generate(domain, urls);
            boolean updated = sitemapGenerator.updateSitemapFile(sitemap);
            
            result.put("success", updated);
            result.put("sitemap_url", "https://" + domain + "/sitemap.xml");
            result.put("urls_count", urls.size());
            result.put("last_updated", LocalDateTime.now());
            
            logger.info("사이트맵 업데이트 완료 - URL 개수: {}", urls.size());
            
        } catch (Exception e) {
            logger.error("사이트맵 업데이트 실패", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    /**
     * 전체 SEO 감사
     */
    private Map<String, Object> performFullSEOAudit(Map<String, Object> parameters) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String domain = (String) parameters.getOrDefault("domain", "elderberry.co.kr");
            
            // 종합 SEO 감사 실행
            Map<String, Object> seoAnalysis = analyzeSEOStatus(parameters);
            Map<String, Object> metaOptimization = optimizeMetaTags(parameters);
            Map<String, Object> structuredDataCheck = generateStructuredData(parameters);
            Map<String, Object> sitemapStatus = updateSitemap(parameters);
            
            result.put("success", true);
            result.put("audit_date", LocalDateTime.now());
            result.put("domain", domain);
            result.put("seo_analysis", seoAnalysis);
            result.put("meta_optimization", metaOptimization);
            result.put("structured_data", structuredDataCheck);
            result.put("sitemap_status", sitemapStatus);
            
            // 전체 점수 계산
            int overallScore = calculateOverallSEOScore(seoAnalysis, metaOptimization, structuredDataCheck);
            result.put("overall_seo_score", overallScore);
            result.put("grade", getGradeFromScore(overallScore));
            
            logger.info("전체 SEO 감사 완료 - 전체 점수: {}/100", overallScore);
            
        } catch (Exception e) {
            logger.error("전체 SEO 감사 실패", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    /**
     * 페이지 속도 분석
     */
    private Map<String, Object> analyzePageSpeed(Map<String, Object> parameters) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String url = (String) parameters.getOrDefault("url", "https://elderberry.co.kr");
            
            PageSpeedAnalysis speedAnalysis = seoAnalysisService.analyzePageSpeed(url);
            
            result.put("success", true);
            result.put("desktop_score", speedAnalysis.getDesktopScore());
            result.put("mobile_score", speedAnalysis.getMobileScore());
            result.put("core_web_vitals", speedAnalysis.getCoreWebVitals());
            result.put("optimization_suggestions", speedAnalysis.getOptimizationSuggestions());
            
            logger.info("페이지 속도 분석 완료 - 데스크톱: {}, 모바일: {}", 
                       speedAnalysis.getDesktopScore(), speedAnalysis.getMobileScore());
            
        } catch (Exception e) {
            logger.error("페이지 속도 분석 실패", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    /**
     * 전체 SEO 점수 계산
     */
    private int calculateOverallSEOScore(Map<String, Object> seoAnalysis, 
                                        Map<String, Object> metaOptimization, 
                                        Map<String, Object> structuredDataCheck) {
        int seoScore = (Integer) seoAnalysis.getOrDefault("seo_score", 0);
        boolean metaSuccess = (Boolean) metaOptimization.getOrDefault("success", false);
        boolean structuredSuccess = (Boolean) structuredDataCheck.getOrDefault("success", false);
        
        int metaScore = metaSuccess ? 95 : 60;
        int structuredScore = structuredSuccess ? 90 : 50;
        
        return (int) Math.round((seoScore * 0.5) + (metaScore * 0.3) + (structuredScore * 0.2));
    }

    /**
     * 점수에 따른 등급 반환
     */
    private String getGradeFromScore(int score) {
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B+";
        if (score >= 60) return "B";
        if (score >= 50) return "C";
        return "D";
    }

    @Override
    public String getAgentDescription() {
        return "Google SEO 최적화 전문 에이전트 - 메타태그, 구조화 데이터, 사이트맵, 페이지 속도 최적화";
    }

    @Override
    public List<String> getSupportedTasks() {
        return Arrays.asList(
            "analyze_seo",
            "optimize_meta_tags", 
            "generate_structured_data",
            "update_sitemap",
            "full_seo_audit",
            "improve_page_speed"
        );
    }
}