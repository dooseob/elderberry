package com.globalcarelink.agents.seo;

import java.util.Map;

/**
 * 최적화된 메타 태그 데이터 클래스
 */
public class OptimizedMetaTags {
    private String title;
    private String description;
    private String keywords;
    private String canonicalUrl;
    private String robotsDirective;
    private Map<String, String> openGraphTags;
    private Map<String, String> twitterTags;

    public OptimizedMetaTags() {
        this.robotsDirective = "index, follow"; // 기본값
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getCanonicalUrl() { return canonicalUrl; }
    public void setCanonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; }

    public String getRobotsDirective() { return robotsDirective; }
    public void setRobotsDirective(String robotsDirective) { this.robotsDirective = robotsDirective; }

    public Map<String, String> getOpenGraphTags() { return openGraphTags; }
    public void setOpenGraphTags(Map<String, String> openGraphTags) { this.openGraphTags = openGraphTags; }

    public Map<String, String> getTwitterTags() { return twitterTags; }
    public void setTwitterTags(Map<String, String> twitterTags) { this.twitterTags = twitterTags; }
}