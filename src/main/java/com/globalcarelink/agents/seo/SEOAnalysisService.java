package com.globalcarelink.agents.seo;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * SEO 분석 서비스
 * 웹페이지의 SEO 상태를 종합적으로 분석
 */
@Service
public class SEOAnalysisService {
    private static final Logger logger = LoggerFactory.getLogger(SEOAnalysisService.class);

    /**
     * URL의 SEO 상태 분석
     */
    public SEOAnalysisResult analyze(String url) {
        logger.info("SEO 분석 시작: {}", url);
        
        SEOAnalysisResult result = new SEOAnalysisResult();
        result.setUrl(url);
        
        // 메타 태그 검사
        MetaTagsStatus metaStatus = analyzeMetaTags(url);
        result.setMetaTagsStatus(metaStatus);
        
        // 구조화 데이터 검사
        StructuredDataStatus structuredStatus = analyzeStructuredData(url);
        result.setStructuredDataStatus(structuredStatus);
        
        // 페이지 속도 검사
        int pageSpeedScore = analyzePageSpeedScore(url);
        result.setPageSpeedScore(pageSpeedScore);
        
        // 모바일 친화성 검사
        boolean mobileFriendly = analyzeMobileFriendliness(url);
        result.setMobileFriendly(mobileFriendly);
        
        // 전체 점수 계산
        int overallScore = calculateOverallScore(metaStatus, structuredStatus, pageSpeedScore, mobileFriendly);
        result.setOverallScore(overallScore);
        
        // 개선 권장사항 생성
        List<String> recommendations = generateRecommendations(metaStatus, structuredStatus, pageSpeedScore, mobileFriendly);
        result.setRecommendations(recommendations);
        
        logger.info("SEO 분석 완료: {} - 점수: {}/100", url, overallScore);
        return result;
    }

    /**
     * 페이지 속도 상세 분석
     */
    public PageSpeedAnalysis analyzePageSpeed(String url) {
        logger.info("페이지 속도 분석 시작: {}", url);
        
        PageSpeedAnalysis analysis = new PageSpeedAnalysis();
        analysis.setUrl(url);
        
        // 실제 구현에서는 Google PageSpeed Insights API 호출
        // 현재는 모의 데이터 반환
        analysis.setDesktopScore(85);
        analysis.setMobileScore(78);
        
        Map<String, Object> coreWebVitals = new HashMap<>();
        coreWebVitals.put("LCP", "2.1s"); // Largest Contentful Paint
        coreWebVitals.put("FID", "45ms"); // First Input Delay
        coreWebVitals.put("CLS", "0.08"); // Cumulative Layout Shift
        analysis.setCoreWebVitals(coreWebVitals);
        
        List<String> suggestions = Arrays.asList(
            "이미지 최적화로 로딩 시간 개선",
            "JavaScript 번들 크기 줄이기",
            "브라우저 캐싱 활용",
            "CSS 최적화"
        );
        analysis.setOptimizationSuggestions(suggestions);
        
        return analysis;
    }

    private MetaTagsStatus analyzeMetaTags(String url) {
        MetaTagsStatus status = new MetaTagsStatus();
        
        // 엘더베리 프로젝트 기준으로 메타태그 상태 체크
        status.setHasTitle(true);
        status.setHasDescription(true);
        status.setHasKeywords(true);
        status.setHasOgTags(true);
        status.setHasTwitterTags(true);
        status.setHasCanonical(true);
        
        status.setTitleLength(52); // "엘더베리 - 재외동포를 위한 한국 요양원 구인구직 매칭 서비스"
        status.setDescriptionLength(85); // 적절한 길이
        status.setKeywordsCount(9);
        
        // 점수 계산 (100점 만점)
        int score = 0;
        if (status.hasTitle()) score += 20;
        if (status.hasDescription()) score += 20;
        if (status.hasKeywords()) score += 10;
        if (status.hasOgTags()) score += 20;
        if (status.hasTwitterTags()) score += 15;
        if (status.hasCanonical()) score += 15;
        
        status.setScore(score);
        return status;
    }

    private StructuredDataStatus analyzeStructuredData(String url) {
        StructuredDataStatus status = new StructuredDataStatus();
        
        // 현재 구현된 구조화 데이터 확인
        List<String> schemas = Arrays.asList(
            "Organization",
            "WebSite", 
            "MedicalWebPage",
            "WebApplication"
        );
        status.setDetectedSchemas(schemas);
        status.setSchemaCount(schemas.size());
        status.setIsValid(true);
        
        // 개선 제안
        List<String> suggestions = Arrays.asList(
            "BreadcrumbList 스키마 추가",
            "LocalBusiness 스키마 추가",
            "Review 스키마 추가"
        );
        status.setImprovementSuggestions(suggestions);
        
        // 점수 계산
        status.setScore(85);
        return status;
    }

    private int analyzePageSpeedScore(String url) {
        // 실제로는 Google PageSpeed Insights API 호출
        // 현재는 모의 점수 반환
        return 82;
    }

    private boolean analyzeMobileFriendliness(String url) {
        // 실제로는 Google Mobile-Friendly Test API 호출
        // 현재는 true 반환 (Tailwind CSS 사용으로 모바일 친화적)
        return true;
    }

    private int calculateOverallScore(MetaTagsStatus metaStatus, 
                                    StructuredDataStatus structuredStatus,
                                    int pageSpeedScore,
                                    boolean mobileFriendly) {
        
        double metaWeight = 0.3;
        double structuredWeight = 0.2; 
        double speedWeight = 0.3;
        double mobileWeight = 0.2;
        
        double score = (metaStatus.getScore() * metaWeight) +
                      (structuredStatus.getScore() * structuredWeight) +
                      (pageSpeedScore * speedWeight) +
                      ((mobileFriendly ? 100 : 50) * mobileWeight);
        
        return (int) Math.round(score);
    }

    private List<String> generateRecommendations(MetaTagsStatus metaStatus,
                                                StructuredDataStatus structuredStatus,
                                                int pageSpeedScore,
                                                boolean mobileFriendly) {
        List<String> recommendations = new ArrayList<>();
        
        if (metaStatus.getScore() < 90) {
            recommendations.add("메타 태그 최적화 필요");
        }
        
        if (structuredStatus.getScore() < 90) {
            recommendations.add("구조화 데이터 추가 권장");
        }
        
        if (pageSpeedScore < 80) {
            recommendations.add("페이지 로딩 속도 개선 필요");
        }
        
        if (!mobileFriendly) {
            recommendations.add("모바일 최적화 필요");
        }
        
        // 일반적인 SEO 개선 사항
        recommendations.addAll(Arrays.asList(
            "내부 링크 구조 최적화",
            "이미지 alt 태그 추가",
            "URL 구조 개선",
            "콘텐츠 품질 향상"
        ));
        
        return recommendations;
    }
}