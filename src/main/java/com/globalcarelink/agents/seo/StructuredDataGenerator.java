package com.globalcarelink.agents.seo;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * 구조화 데이터 생성 서비스
 * Schema.org 기반 JSON-LD 구조화 데이터 생성
 */
@Service
public class StructuredDataGenerator {
    private static final Logger logger = LoggerFactory.getLogger(StructuredDataGenerator.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 스키마 타입과 엔티티 데이터를 기반으로 구조화 데이터 생성
     */
    public String generate(String schemaType, Map<String, Object> entityData) {
        logger.info("구조화 데이터 생성 시작: {}", schemaType);
        
        try {
            Map<String, Object> structuredData = new HashMap<>();
            structuredData.put("@context", "https://schema.org");
            
            switch (schemaType.toLowerCase()) {
                case "organization":
                    generateOrganizationSchema(structuredData, entityData);
                    break;
                case "website":
                    generateWebSiteSchema(structuredData, entityData);
                    break;
                case "medicalwebpage":
                    generateMedicalWebPageSchema(structuredData, entityData);
                    break;
                case "webapplication":
                    generateWebApplicationSchema(structuredData, entityData);
                    break;
                case "localbusiness":
                    generateLocalBusinessSchema(structuredData, entityData);
                    break;
                case "breadcrumblist":
                    generateBreadcrumbListSchema(structuredData, entityData);
                    break;
                case "article":
                    generateArticleSchema(structuredData, entityData);
                    break;
                case "jobposting":
                    generateJobPostingSchema(structuredData, entityData);
                    break;
                case "review":
                    generateReviewSchema(structuredData, entityData);
                    break;
                default:
                    throw new IllegalArgumentException("지원하지 않는 스키마 타입: " + schemaType);
            }
            
            String jsonLd = objectMapper.writeValueAsString(structuredData);
            logger.info("구조화 데이터 생성 완료: {} ({} bytes)", schemaType, jsonLd.length());
            return jsonLd;
            
        } catch (Exception e) {
            logger.error("구조화 데이터 생성 실패: {}", schemaType, e);
            throw new RuntimeException("구조화 데이터 생성 실패", e);
        }
    }

    private void generateOrganizationSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "Organization");
        schema.put("name", data.getOrDefault("name", "엘더베리"));
        schema.put("description", data.getOrDefault("description", "재외동포를 위한 한국 요양원 구인구직 매칭 전문 서비스"));
        schema.put("url", data.getOrDefault("url", "https://elderberry.co.kr"));
        schema.put("logo", data.getOrDefault("logo", "https://elderberry.co.kr/logo.png"));
        schema.put("foundingDate", data.getOrDefault("foundingDate", "2025"));
        
        // 연락처 정보
        Map<String, Object> contactPoint = new HashMap<>();
        contactPoint.put("@type", "ContactPoint");
        contactPoint.put("contactType", "customer service");
        contactPoint.put("availableLanguage", Arrays.asList("Korean", "English", "Japanese", "Chinese"));
        schema.put("contactPoint", contactPoint);
        
        // 서비스 지역
        Map<String, Object> areaServed = new HashMap<>();
        areaServed.put("@type", "Country");
        areaServed.put("name", "South Korea");
        schema.put("areaServed", areaServed);
        
        schema.put("serviceType", "Healthcare Matching Service");
    }

    private void generateWebSiteSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "WebSite");
        schema.put("name", data.getOrDefault("name", "엘더베리"));
        schema.put("description", data.getOrDefault("description", "재외동포를 위한 한국 요양원 구인구직 매칭 서비스"));
        schema.put("url", data.getOrDefault("url", "https://elderberry.co.kr"));
        
        // 검색 액션
        Map<String, Object> potentialAction = new HashMap<>();
        potentialAction.put("@type", "SearchAction");
        potentialAction.put("target", "https://elderberry.co.kr/search?q={search_term_string}");
        potentialAction.put("query-input", "required name=search_term_string");
        schema.put("potentialAction", potentialAction);
        
        // 발행자
        Map<String, Object> publisher = new HashMap<>();
        publisher.put("@type", "Organization");
        publisher.put("name", "엘더베리");
        schema.put("publisher", publisher);
    }

    private void generateMedicalWebPageSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "MedicalWebPage");
        schema.put("name", data.getOrDefault("name", "건강 평가 서비스"));
        schema.put("description", data.getOrDefault("description", "재외동포를 위한 전문 건강 평가 및 ADL 측정 서비스"));
        
        // 발행자
        Map<String, Object> publisher = new HashMap<>();
        publisher.put("@type", "Organization");
        publisher.put("name", "엘더베리");
        schema.put("publisher", publisher);
        
        // 주요 엔티티
        Map<String, Object> mainEntity = new HashMap<>();
        mainEntity.put("@type", "MedicalProcedure");
        mainEntity.put("name", "건강 상태 평가");
        mainEntity.put("description", "일상생활 수행능력(ADL) 평가 및 장기요양등급 진단");
        mainEntity.put("procedureType", "건강평가");
        schema.put("mainEntity", mainEntity);
    }

    private void generateWebApplicationSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "WebApplication");
        schema.put("name", data.getOrDefault("name", "요양원 시설 검색"));
        schema.put("description", data.getOrDefault("description", "재외동포를 위한 한국 요양원 검색 및 매칭 서비스"));
        schema.put("applicationCategory", "HealthApplication");
        schema.put("operatingSystem", "Web");
        
        // 가격 정보
        Map<String, Object> offers = new HashMap<>();
        offers.put("@type", "Offer");
        offers.put("price", "0");
        offers.put("priceCurrency", "KRW");
        schema.put("offers", offers);
    }

    private void generateLocalBusinessSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "LocalBusiness");
        schema.put("name", data.getOrDefault("name", "엘더베리"));
        schema.put("description", data.getOrDefault("description", "재외동포 요양원 매칭 서비스"));
        schema.put("url", data.getOrDefault("url", "https://elderberry.co.kr"));
        
        // 주소 (서울 기준)
        Map<String, Object> address = new HashMap<>();
        address.put("@type", "PostalAddress");
        address.put("addressCountry", "KR");
        address.put("addressRegion", "서울특별시");
        address.put("addressLocality", "강남구");
        schema.put("address", address);
        
        // 운영 시간
        List<Map<String, Object>> openingHours = new ArrayList<>();
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
        for (String day : days) {
            Map<String, Object> hours = new HashMap<>();
            hours.put("@type", "OpeningHoursSpecification");
            hours.put("dayOfWeek", day);
            hours.put("opens", "09:00");
            hours.put("closes", "18:00");
            openingHours.add(hours);
        }
        schema.put("openingHoursSpecification", openingHours);
    }

    private void generateBreadcrumbListSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "BreadcrumbList");
        
        @SuppressWarnings("unchecked")
        List<Map<String, String>> breadcrumbs = (List<Map<String, String>>) data.get("breadcrumbs");
        
        if (breadcrumbs != null) {
            List<Map<String, Object>> itemListElement = new ArrayList<>();
            
            for (int i = 0; i < breadcrumbs.size(); i++) {
                Map<String, String> breadcrumb = breadcrumbs.get(i);
                Map<String, Object> listItem = new HashMap<>();
                listItem.put("@type", "ListItem");
                listItem.put("position", i + 1);
                listItem.put("name", breadcrumb.get("name"));
                listItem.put("item", breadcrumb.get("url"));
                itemListElement.add(listItem);
            }
            
            schema.put("itemListElement", itemListElement);
        }
    }

    private void generateArticleSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "Article");
        schema.put("headline", data.getOrDefault("headline", ""));
        schema.put("description", data.getOrDefault("description", ""));
        schema.put("datePublished", data.getOrDefault("datePublished", ""));
        schema.put("dateModified", data.getOrDefault("dateModified", ""));
        
        // 작성자
        Map<String, Object> author = new HashMap<>();
        author.put("@type", "Organization");
        author.put("name", "엘더베리");
        schema.put("author", author);
        
        // 발행자
        Map<String, Object> publisher = new HashMap<>();
        publisher.put("@type", "Organization");
        publisher.put("name", "엘더베리");
        publisher.put("logo", "https://elderberry.co.kr/logo.png");
        schema.put("publisher", publisher);
    }

    private void generateJobPostingSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "JobPosting");
        schema.put("title", data.getOrDefault("title", ""));
        schema.put("description", data.getOrDefault("description", ""));
        schema.put("datePosted", data.getOrDefault("datePosted", ""));
        schema.put("validThrough", data.getOrDefault("validThrough", ""));
        
        // 고용주
        Map<String, Object> hiringOrganization = new HashMap<>();
        hiringOrganization.put("@type", "Organization");
        hiringOrganization.put("name", data.getOrDefault("hiringOrganization", ""));
        schema.put("hiringOrganization", hiringOrganization);
        
        // 근무지
        Map<String, Object> jobLocation = new HashMap<>();
        jobLocation.put("@type", "Place");
        Map<String, Object> address = new HashMap<>();
        address.put("@type", "PostalAddress");
        address.put("addressRegion", data.getOrDefault("region", ""));
        address.put("addressCountry", "KR");
        jobLocation.put("address", address);
        schema.put("jobLocation", jobLocation);
    }

    private void generateReviewSchema(Map<String, Object> schema, Map<String, Object> data) {
        schema.put("@type", "Review");
        schema.put("reviewBody", data.getOrDefault("reviewBody", ""));
        schema.put("datePublished", data.getOrDefault("datePublished", ""));
        
        // 평점
        Map<String, Object> reviewRating = new HashMap<>();
        reviewRating.put("@type", "Rating");
        reviewRating.put("ratingValue", data.getOrDefault("ratingValue", 5));
        reviewRating.put("bestRating", 5);
        schema.put("reviewRating", reviewRating);
        
        // 작성자
        Map<String, Object> author = new HashMap<>();
        author.put("@type", "Person");
        author.put("name", data.getOrDefault("authorName", "익명"));
        schema.put("author", author);
        
        // 리뷰 대상
        Map<String, Object> itemReviewed = new HashMap<>();
        itemReviewed.put("@type", "Organization");
        itemReviewed.put("name", data.getOrDefault("itemReviewedName", "엘더베리"));
        schema.put("itemReviewed", itemReviewed);
    }
}