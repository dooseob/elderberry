package com.globalcarelink.agents.seo;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 사이트맵 생성 서비스
 * XML 사이트맵 생성 및 업데이트
 */
@Service
public class SitemapGenerator {
    private static final Logger logger = LoggerFactory.getLogger(SitemapGenerator.class);
    private static final String SITEMAP_PATH = "frontend/public/sitemap.xml";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 도메인과 URL 목록을 기반으로 사이트맵 XML 생성
     */
    public String generate(String domain, List<String> urls) {
        logger.info("사이트맵 생성 시작: {} - URL 개수: {}", domain, urls.size());
        
        StringBuilder sitemap = new StringBuilder();
        sitemap.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sitemap.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"\n");
        sitemap.append("        xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n");
        sitemap.append("        xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9\n");
        sitemap.append("        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\">\n\n");
        
        // 기본 엘더베리 URL 구조 생성
        List<SitemapUrl> sitemapUrls = generateElderberryUrls(domain);
        
        // 추가 URL이 있으면 포함
        for (String url : urls) {
            if (!urlExists(sitemapUrls, url)) {
                sitemapUrls.add(new SitemapUrl(url, getCurrentDate(), "monthly", "0.5"));
            }
        }
        
        // URL들을 우선순위 순으로 정렬
        sitemapUrls.sort((a, b) -> Float.compare(b.getPriority(), a.getPriority()));
        
        // XML 생성
        for (SitemapUrl url : sitemapUrls) {
            sitemap.append(generateUrlEntry(url));
        }
        
        sitemap.append("</urlset>\n");
        
        logger.info("사이트맵 생성 완료: {} URLs", sitemapUrls.size());
        return sitemap.toString();
    }

    /**
     * 엘더베리 프로젝트의 기본 URL 구조 생성
     */
    private List<SitemapUrl> generateElderberryUrls(String domain) {
        List<SitemapUrl> urls = new ArrayList<>();
        String baseUrl = "https://" + domain;
        String today = getCurrentDate();
        
        // 메인 페이지 (최고 우선순위)
        urls.add(new SitemapUrl(baseUrl + "/", today, "weekly", "1.0"));
        
        // 주요 서비스 페이지 (높은 우선순위)
        urls.add(new SitemapUrl(baseUrl + "/health-assessment", today, "monthly", "0.9"));
        urls.add(new SitemapUrl(baseUrl + "/facility-search", today, "weekly", "0.9"));
        urls.add(new SitemapUrl(baseUrl + "/coordinator-matching", today, "monthly", "0.8"));
        
        // 구인구직 관련 (높은 우선순위)
        urls.add(new SitemapUrl(baseUrl + "/jobs", today, "daily", "0.8"));
        urls.add(new SitemapUrl(baseUrl + "/job-board", today, "daily", "0.8"));
        
        // 게시판 및 커뮤니티
        urls.add(new SitemapUrl(baseUrl + "/board", today, "daily", "0.6"));
        urls.add(new SitemapUrl(baseUrl + "/boards", today, "daily", "0.6"));
        urls.add(new SitemapUrl(baseUrl + "/community", today, "weekly", "0.6"));
        
        // 정보 페이지
        urls.add(new SitemapUrl(baseUrl + "/about", today, "monthly", "0.7"));
        urls.add(new SitemapUrl(baseUrl + "/services", today, "monthly", "0.7"));
        urls.add(new SitemapUrl(baseUrl + "/contact", today, "monthly", "0.5"));
        urls.add(new SitemapUrl(baseUrl + "/help", today, "monthly", "0.5"));
        
        // 리뷰 및 평가
        urls.add(new SitemapUrl(baseUrl + "/reviews", today, "weekly", "0.7"));
        urls.add(new SitemapUrl(baseUrl + "/testimonials", today, "weekly", "0.6"));
        
        // 인증 페이지 (낮은 우선순위)
        urls.add(new SitemapUrl(baseUrl + "/login", today, "yearly", "0.3"));
        urls.add(new SitemapUrl(baseUrl + "/register", today, "yearly", "0.4"));
        
        // 법적 페이지 (가장 낮은 우선순위)
        urls.add(new SitemapUrl(baseUrl + "/privacy-policy", today, "yearly", "0.3"));
        urls.add(new SitemapUrl(baseUrl + "/terms-of-service", today, "yearly", "0.3"));
        urls.add(new SitemapUrl(baseUrl + "/cookie-policy", today, "yearly", "0.2"));
        
        // 동적 콘텐츠 페이지
        urls.add(new SitemapUrl(baseUrl + "/news", today, "weekly", "0.6"));
        urls.add(new SitemapUrl(baseUrl + "/blog", today, "weekly", "0.6"));
        urls.add(new SitemapUrl(baseUrl + "/guides", today, "monthly", "0.7"));
        
        return urls;
    }

    /**
     * URL 엔트리 XML 생성
     */
    private String generateUrlEntry(SitemapUrl url) {
        StringBuilder entry = new StringBuilder();
        entry.append("  <url>\n");
        entry.append("    <loc>").append(escapeXml(url.getLocation())).append("</loc>\n");
        entry.append("    <lastmod>").append(url.getLastModified()).append("</lastmod>\n");
        entry.append("    <changefreq>").append(url.getChangeFrequency()).append("</changefreq>\n");
        entry.append("    <priority>").append(String.format("%.1f", url.getPriority())).append("</priority>\n");
        entry.append("  </url>\n\n");
        return entry.toString();
    }

    /**
     * 사이트맵 파일 업데이트
     */
    public boolean updateSitemapFile(String sitemapContent) {
        try {
            try (FileWriter writer = new FileWriter(SITEMAP_PATH)) {
                writer.write(sitemapContent);
            }
            logger.info("사이트맵 파일 업데이트 완료: {}", SITEMAP_PATH);
            return true;
        } catch (IOException e) {
            logger.error("사이트맵 파일 업데이트 실패: {}", SITEMAP_PATH, e);
            return false;
        }
    }

    /**
     * 사이트맵 인덱스 생성 (대용량 사이트용)
     */
    public String generateSitemapIndex(String domain, List<String> sitemapFiles) {
        StringBuilder index = new StringBuilder();
        index.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        index.append("<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        
        String today = getCurrentDate();
        for (String sitemapFile : sitemapFiles) {
            index.append("  <sitemap>\n");
            index.append("    <loc>https://").append(domain).append("/").append(sitemapFile).append("</loc>\n");
            index.append("    <lastmod>").append(today).append("</lastmod>\n");
            index.append("  </sitemap>\n");
        }
        
        index.append("</sitemapindex>\n");
        return index.toString();
    }

    /**
     * 동적 사이트맵 생성 (데이터베이스 기반)
     */
    public String generateDynamicSitemap(String domain) {
        List<String> dynamicUrls = new ArrayList<>();
        String baseUrl = "https://" + domain;
        
        // 실제 구현에서는 데이터베이스에서 동적 콘텐츠 URL 조회
        // 예: 게시글, 시설 상세 페이지, 프로필 페이지 등
        
        // 모의 동적 URL 생성
        for (int i = 1; i <= 100; i++) {
            dynamicUrls.add(baseUrl + "/facilities/" + i);
            dynamicUrls.add(baseUrl + "/jobs/" + i);
            dynamicUrls.add(baseUrl + "/posts/" + i);
        }
        
        return generate(domain, dynamicUrls);
    }

    /**
     * robots.txt용 사이트맵 URL 생성
     */
    public List<String> getSitemapUrls(String domain) {
        List<String> sitemapUrls = new ArrayList<>();
        sitemapUrls.add("https://" + domain + "/sitemap.xml");
        // 필요시 추가 사이트맵 URL 포함
        // sitemapUrls.add("https://" + domain + "/sitemap-news.xml");
        // sitemapUrls.add("https://" + domain + "/sitemap-images.xml");
        return sitemapUrls;
    }

    private boolean urlExists(List<SitemapUrl> urls, String location) {
        return urls.stream().anyMatch(url -> url.getLocation().equals(location));
    }

    private String getCurrentDate() {
        return LocalDate.now().format(DATE_FORMATTER);
    }

    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&apos;");
    }

    /**
     * 사이트맵 URL 데이터 클래스
     */
    private static class SitemapUrl {
        private final String location;
        private final String lastModified;
        private final String changeFrequency;
        private final float priority;

        public SitemapUrl(String location, String lastModified, String changeFrequency, String priority) {
            this.location = location;
            this.lastModified = lastModified;
            this.changeFrequency = changeFrequency;
            this.priority = Float.parseFloat(priority);
        }

        public String getLocation() { return location; }
        public String getLastModified() { return lastModified; }
        public String getChangeFrequency() { return changeFrequency; }
        public float getPriority() { return priority; }
    }
}