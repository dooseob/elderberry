package com.globalcarelink.agents.seo;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * 메타 태그 최적화 서비스
 * 페이지 타입과 콘텐츠에 따라 최적화된 메타 태그 생성
 */
@Service
public class MetaTagOptimizer {
    private static final Logger logger = LoggerFactory.getLogger(MetaTagOptimizer.class);

    private static final int OPTIMAL_TITLE_LENGTH = 60;
    private static final int OPTIMAL_DESCRIPTION_LENGTH = 160;
    private static final String BASE_SITE_NAME = "엘더베리";
    private static final String BASE_DOMAIN = "elderberry.co.kr";

    /**
     * 페이지 타입과 콘텐츠 데이터를 기반으로 최적화된 메타 태그 생성
     */
    public OptimizedMetaTags optimize(String pageType, Map<String, String> contentData) {
        logger.info("메타태그 최적화 시작: {}", pageType);

        OptimizedMetaTags metaTags = new OptimizedMetaTags();
        
        switch (pageType.toLowerCase()) {
            case "health_assessment":
                optimizeHealthAssessmentTags(metaTags, contentData);
                break;
            case "facility_search":
                optimizeFacilitySearchTags(metaTags, contentData);
                break;
            case "coordinator_matching":
                optimizeCoordinatorMatchingTags(metaTags, contentData);
                break;
            case "job_board":
                optimizeJobBoardTags(metaTags, contentData);
                break;
            case "login":
                optimizeLoginTags(metaTags, contentData);
                break;
            case "register":
                optimizeRegisterTags(metaTags, contentData);
                break;
            case "home":
            case "dashboard":
                optimizeHomeTags(metaTags, contentData);
                break;
            default:
                optimizeGeneralTags(metaTags, contentData);
        }

        // 공통 최적화 적용
        applyCommonOptimizations(metaTags);
        
        logger.info("메타태그 최적화 완료: {} - 제목 길이: {}", pageType, metaTags.getTitle().length());
        return metaTags;
    }

    private void optimizeHealthAssessmentTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        metaTags.setTitle("건강 평가 - 재외동포 ADL 평가 | " + BASE_SITE_NAME);
        metaTags.setDescription("재외동포를 위한 전문 건강 평가 서비스. ADL 평가부터 장기요양등급까지 체계적 건강 상태 진단. 무료 상담 및 맞춤 요양원 추천.");
        metaTags.setKeywords("건강평가, ADL평가, 장기요양등급, 요양원, 재외동포, 건강진단, 돌봄서비스");
        metaTags.setCanonicalUrl("https://" + BASE_DOMAIN + "/health-assessment");
        
        // Open Graph 태그
        Map<String, String> ogTags = new HashMap<>();
        ogTags.put("og:title", "건강 평가 - 재외동포 전문 서비스");
        ogTags.put("og:description", "체계적인 ADL 평가로 맞춤 요양원을 찾아드립니다");
        ogTags.put("og:type", "website");
        ogTags.put("og:image", "https://" + BASE_DOMAIN + "/images/health-assessment-og.jpg");
        metaTags.setOpenGraphTags(ogTags);
        
        // Twitter 태그
        Map<String, String> twitterTags = new HashMap<>();
        twitterTags.put("twitter:title", "건강 평가 - 엘더베리");
        twitterTags.put("twitter:description", "재외동포 맞춤 건강 평가 서비스");
        twitterTags.put("twitter:image", "https://" + BASE_DOMAIN + "/images/health-assessment-twitter.jpg");
        metaTags.setTwitterTags(twitterTags);
    }

    private void optimizeFacilitySearchTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        metaTags.setTitle("요양원 검색 - 전국 시설 매칭 | " + BASE_SITE_NAME);
        metaTags.setDescription("전국 요양원 시설 검색 및 매칭 서비스. 지역별, 서비스별 맞춤 시설 추천. 실시간 정보 업데이트로 최적의 요양원을 찾아드립니다.");
        metaTags.setKeywords("요양원검색, 시설매칭, 요양시설, 노인요양원, 재외동포, 시설추천");
        metaTags.setCanonicalUrl("https://" + BASE_DOMAIN + "/facility-search");
        
        Map<String, String> ogTags = new HashMap<>();
        ogTags.put("og:title", "요양원 검색 - 맞춤 시설 찾기");
        ogTags.put("og:description", "지역별, 서비스별 맞춤 요양원 추천 서비스");
        ogTags.put("og:type", "website");
        ogTags.put("og:image", "https://" + BASE_DOMAIN + "/images/facility-search-og.jpg");
        metaTags.setOpenGraphTags(ogTags);
        
        Map<String, String> twitterTags = new HashMap<>();
        twitterTags.put("twitter:title", "요양원 검색 - 엘더베리");
        twitterTags.put("twitter:description", "전국 요양원 실시간 검색 및 매칭");
        twitterTags.put("twitter:image", "https://" + BASE_DOMAIN + "/images/facility-search-twitter.jpg");
        metaTags.setTwitterTags(twitterTags);
    }

    private void optimizeCoordinatorMatchingTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        metaTags.setTitle("코디네이터 매칭 - 전문 케어 상담 | " + BASE_SITE_NAME);
        metaTags.setDescription("전문 케어 코디네이터 매칭 서비스. 언어별, 지역별 맞춤 코디네이터 연결. 재외동포 전문 상담으로 최적의 돌봄 솔루션 제공.");
        metaTags.setKeywords("코디네이터매칭, 케어코디네이터, 요양상담, 재외동포지원, 전문상담");
        metaTags.setCanonicalUrl("https://" + BASE_DOMAIN + "/coordinator-matching");
        
        Map<String, String> ogTags = new HashMap<>();
        ogTags.put("og:title", "코디네이터 매칭 - 전문 케어 상담");
        ogTags.put("og:description", "언어별 맞춤 코디네이터로 완벽한 돌봄 서비스");
        ogTags.put("og:type", "website");
        ogTags.put("og:image", "https://" + BASE_DOMAIN + "/images/coordinator-og.jpg");
        metaTags.setOpenGraphTags(ogTags);
        
        Map<String, String> twitterTags = new HashMap<>();
        twitterTags.put("twitter:title", "코디네이터 매칭 - 엘더베리");
        twitterTags.put("twitter:description", "전문 케어 코디네이터 매칭 서비스");
        metaTags.setTwitterTags(twitterTags);
    }

    private void optimizeJobBoardTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        metaTags.setTitle("요양원 구인구직 - 간병인 채용정보 | " + BASE_SITE_NAME);
        metaTags.setDescription("요양원 구인구직 전문 게시판. 간병인, 요양보호사, 간호사 채용 정보. 실시간 업데이트로 최신 구인정보를 확인하세요.");
        metaTags.setKeywords("요양원구인, 요양원구직, 간병인채용, 요양보호사, 간호사, 채용정보");
        metaTags.setCanonicalUrl("https://" + BASE_DOMAIN + "/jobs");
        
        Map<String, String> ogTags = new HashMap<>();
        ogTags.put("og:title", "요양원 구인구직 - 전문 채용정보");
        ogTags.put("og:description", "간병인, 요양보호사 전문 채용 게시판");
        ogTags.put("og:type", "website");
        ogTags.put("og:image", "https://" + BASE_DOMAIN + "/images/jobs-og.jpg");
        metaTags.setOpenGraphTags(ogTags);
        
        Map<String, String> twitterTags = new HashMap<>();
        twitterTags.put("twitter:title", "구인구직 - 엘더베리");
        twitterTags.put("twitter:description", "요양원 전문 구인구직 정보");
        metaTags.setTwitterTags(twitterTags);
    }

    private void optimizeLoginTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        metaTags.setTitle("로그인 | " + BASE_SITE_NAME);
        metaTags.setDescription("엘더베리 회원 로그인 페이지. 안전하고 편리한 로그인으로 맞춤 서비스를 이용하세요.");
        metaTags.setKeywords("로그인, 회원가입, 엘더베리");
        metaTags.setCanonicalUrl("https://" + BASE_DOMAIN + "/login");
        metaTags.setRobotsDirective("noindex, nofollow"); // 로그인 페이지는 검색 노출 안함
    }

    private void optimizeRegisterTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        metaTags.setTitle("회원가입 - 무료 가입 | " + BASE_SITE_NAME);
        metaTags.setDescription("엘더베리 회원가입 페이지. 무료 가입으로 전문 요양원 매칭 서비스를 이용하세요. 간편 가입 3분 완료.");
        metaTags.setKeywords("회원가입, 무료가입, 엘더베리, 요양원매칭");
        metaTags.setCanonicalUrl("https://" + BASE_DOMAIN + "/register");
    }

    private void optimizeHomeTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        metaTags.setTitle(BASE_SITE_NAME + " - 재외동포를 위한 한국 요양원 구인구직 매칭 서비스");
        metaTags.setDescription("해외 거주 재외동포와 한국 요양원을 연결하는 전문 매칭 플랫폼. 건강평가부터 시설매칭, 코디네이터 연결까지 원스톱 서비스 제공.");
        metaTags.setKeywords("재외동포, 요양원, 구인구직, 한국, 해외동포, 노인돌봄, 요양서비스, 매칭서비스, 엘더베리");
        metaTags.setCanonicalUrl("https://" + BASE_DOMAIN);
        
        Map<String, String> ogTags = new HashMap<>();
        ogTags.put("og:title", "엘더베리 - 재외동포 요양원 매칭 서비스");
        ogTags.put("og:description", "해외 거주 재외동포와 한국 요양원을 연결하는 전문 플랫폼");
        ogTags.put("og:type", "website");
        ogTags.put("og:image", "https://" + BASE_DOMAIN + "/images/main-og.jpg");
        metaTags.setOpenGraphTags(ogTags);
    }

    private void optimizeGeneralTags(OptimizedMetaTags metaTags, Map<String, String> contentData) {
        String pageTitle = contentData.getOrDefault("title", "페이지");
        metaTags.setTitle(pageTitle + " | " + BASE_SITE_NAME);
        metaTags.setDescription("재외동포를 위한 전문 요양원 매칭 서비스. " + contentData.getOrDefault("description", ""));
        metaTags.setKeywords("재외동포, 요양원, 엘더베리");
    }

    private void applyCommonOptimizations(OptimizedMetaTags metaTags) {
        // 제목 길이 최적화
        if (metaTags.getTitle().length() > OPTIMAL_TITLE_LENGTH) {
            String truncated = metaTags.getTitle().substring(0, OPTIMAL_TITLE_LENGTH - 3) + "...";
            metaTags.setTitle(truncated);
        }
        
        // 설명 길이 최적화
        if (metaTags.getDescription().length() > OPTIMAL_DESCRIPTION_LENGTH) {
            String truncated = metaTags.getDescription().substring(0, OPTIMAL_DESCRIPTION_LENGTH - 3) + "...";
            metaTags.setDescription(truncated);
        }
        
        // 기본 Open Graph 태그 설정
        if (metaTags.getOpenGraphTags() == null) {
            metaTags.setOpenGraphTags(new HashMap<>());
        }
        metaTags.getOpenGraphTags().putIfAbsent("og:site_name", BASE_SITE_NAME);
        metaTags.getOpenGraphTags().putIfAbsent("og:locale", "ko_KR");
        
        // 기본 Twitter 태그 설정
        if (metaTags.getTwitterTags() == null) {
            metaTags.setTwitterTags(new HashMap<>());
        }
        metaTags.getTwitterTags().putIfAbsent("twitter:card", "summary_large_image");
        
        // 기본 robots 지시어
        if (metaTags.getRobotsDirective() == null) {
            metaTags.setRobotsDirective("index, follow");
        }
    }
}