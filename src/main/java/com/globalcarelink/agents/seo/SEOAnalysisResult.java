package com.globalcarelink.agents.seo;

import java.time.LocalDateTime;
import java.util.List;

/**
 * SEO 분석 결과 데이터 클래스
 */
public class SEOAnalysisResult {
    private String url;
    private int overallScore;
    private MetaTagsStatus metaTagsStatus;
    private StructuredDataStatus structuredDataStatus;
    private int pageSpeedScore;
    private boolean mobileFriendly;
    private List<String> recommendations;
    private LocalDateTime analysisDate;

    public SEOAnalysisResult() {
        this.analysisDate = LocalDateTime.now();
    }

    // Getters and Setters
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }

    public MetaTagsStatus getMetaTagsStatus() { return metaTagsStatus; }
    public void setMetaTagsStatus(MetaTagsStatus metaTagsStatus) { this.metaTagsStatus = metaTagsStatus; }

    public StructuredDataStatus getStructuredDataStatus() { return structuredDataStatus; }
    public void setStructuredDataStatus(StructuredDataStatus structuredDataStatus) { this.structuredDataStatus = structuredDataStatus; }

    public int getPageSpeedScore() { return pageSpeedScore; }
    public void setPageSpeedScore(int pageSpeedScore) { this.pageSpeedScore = pageSpeedScore; }

    public boolean isMobileFriendly() { return mobileFriendly; }
    public void setMobileFriendly(boolean mobileFriendly) { this.mobileFriendly = mobileFriendly; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public LocalDateTime getAnalysisDate() { return analysisDate; }
    public void setAnalysisDate(LocalDateTime analysisDate) { this.analysisDate = analysisDate; }
}

/**
 * 메타 태그 상태 클래스
 */
class MetaTagsStatus {
    private boolean hasTitle;
    private boolean hasDescription;
    private boolean hasKeywords;
    private boolean hasOgTags;
    private boolean hasTwitterTags;
    private boolean hasCanonical;
    private int titleLength;
    private int descriptionLength;
    private int keywordsCount;
    private int score;

    // Getters and Setters
    public boolean hasTitle() { return hasTitle; }
    public void setHasTitle(boolean hasTitle) { this.hasTitle = hasTitle; }

    public boolean hasDescription() { return hasDescription; }
    public void setHasDescription(boolean hasDescription) { this.hasDescription = hasDescription; }

    public boolean hasKeywords() { return hasKeywords; }
    public void setHasKeywords(boolean hasKeywords) { this.hasKeywords = hasKeywords; }

    public boolean hasOgTags() { return hasOgTags; }
    public void setHasOgTags(boolean hasOgTags) { this.hasOgTags = hasOgTags; }

    public boolean hasTwitterTags() { return hasTwitterTags; }
    public void setHasTwitterTags(boolean hasTwitterTags) { this.hasTwitterTags = hasTwitterTags; }

    public boolean hasCanonical() { return hasCanonical; }
    public void setHasCanonical(boolean hasCanonical) { this.hasCanonical = hasCanonical; }

    public int getTitleLength() { return titleLength; }
    public void setTitleLength(int titleLength) { this.titleLength = titleLength; }

    public int getDescriptionLength() { return descriptionLength; }
    public void setDescriptionLength(int descriptionLength) { this.descriptionLength = descriptionLength; }

    public int getKeywordsCount() { return keywordsCount; }
    public void setKeywordsCount(int keywordsCount) { this.keywordsCount = keywordsCount; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}

/**
 * 구조화 데이터 상태 클래스
 */
class StructuredDataStatus {
    private List<String> detectedSchemas;
    private int schemaCount;
    private boolean isValid;
    private List<String> improvementSuggestions;
    private int score;

    // Getters and Setters
    public List<String> getDetectedSchemas() { return detectedSchemas; }
    public void setDetectedSchemas(List<String> detectedSchemas) { this.detectedSchemas = detectedSchemas; }

    public int getSchemaCount() { return schemaCount; }
    public void setSchemaCount(int schemaCount) { this.schemaCount = schemaCount; }

    public boolean isValid() { return isValid; }
    public void setIsValid(boolean isValid) { this.isValid = isValid; }

    public List<String> getImprovementSuggestions() { return improvementSuggestions; }
    public void setImprovementSuggestions(List<String> improvementSuggestions) { this.improvementSuggestions = improvementSuggestions; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}

/**
 * 페이지 속도 분석 결과 클래스
 */
class PageSpeedAnalysis {
    private String url;
    private int desktopScore;
    private int mobileScore;
    private java.util.Map<String, Object> coreWebVitals;
    private List<String> optimizationSuggestions;

    // Getters and Setters
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public int getDesktopScore() { return desktopScore; }
    public void setDesktopScore(int desktopScore) { this.desktopScore = desktopScore; }

    public int getMobileScore() { return mobileScore; }
    public void setMobileScore(int mobileScore) { this.mobileScore = mobileScore; }

    public java.util.Map<String, Object> getCoreWebVitals() { return coreWebVitals; }
    public void setCoreWebVitals(java.util.Map<String, Object> coreWebVitals) { this.coreWebVitals = coreWebVitals; }

    public List<String> getOptimizationSuggestions() { return optimizationSuggestions; }
    public void setOptimizationSuggestions(List<String> optimizationSuggestions) { this.optimizationSuggestions = optimizationSuggestions; }
}