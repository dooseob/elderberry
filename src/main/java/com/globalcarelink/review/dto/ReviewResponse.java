package com.globalcarelink.review.dto;

import com.globalcarelink.review.Review;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 리뷰 응답 DTO
 * 클라이언트에게 전송할 리뷰 데이터 구조
 * 프레젠테이션 로직을 포함하여 엔티티와 분리
 */
@Data
public class ReviewResponse {
    
    private Long id;
    private String title;
    private String content;
    private BigDecimal overallRating;
    private BigDecimal serviceQualityRating;
    private BigDecimal facilityRating;
    private BigDecimal staffRating;
    private BigDecimal priceRating;
    private BigDecimal accessibilityRating;
    private Review.ReviewType reviewType;
    private String reviewTypeDisplayName;
    private Boolean recommended;
    private LocalDateTime visitDate;
    private Integer serviceDurationDays;
    private Boolean anonymous;
    private List<String> imageUrls;
    private List<String> tags;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private Integer reportCount;
    private Review.ReviewStatus status;
    private String statusDisplayName;
    private Boolean verified;
    private String adminResponse;
    private LocalDateTime adminResponseDate;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    
    // 계산된 필드들 (프레젠테이션 로직)
    private Double helpfulPercentage;
    private String ratingDisplay;
    private Boolean isPositive;
    private Boolean isRecent;
    private Boolean isEditable;
    
    // 작성자 정보 (민감정보 제외)
    private String reviewerName;
    private Boolean isAnonymousReviewer;
    
    /**
     * Review 엔티티를 ReviewResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static ReviewResponse from(Review review) {
        ReviewResponse response = new ReviewResponse();
        
        // 기본 필드 매핑
        response.setId(review.getId());
        response.setTitle(review.getTitle());
        response.setContent(review.getContent());
        response.setOverallRating(review.getOverallRating());
        response.setServiceQualityRating(review.getServiceQualityRating());
        response.setFacilityRating(review.getFacilityRating());
        response.setStaffRating(review.getStaffRating());
        response.setPriceRating(review.getPriceRating());
        response.setAccessibilityRating(review.getAccessibilityRating());
        response.setReviewType(review.getReviewType());
        response.setReviewTypeDisplayName(review.getReviewType() != null ? review.getReviewType().getDisplayName() : null);
        response.setRecommended(review.getRecommended());
        response.setVisitDate(review.getVisitDate());
        response.setServiceDurationDays(review.getServiceDurationDays());
        response.setAnonymous(review.getAnonymous());
        response.setImageUrls(review.getImageUrls());
        response.setTags(review.getTags());
        response.setHelpfulCount(review.getHelpfulCount());
        response.setNotHelpfulCount(review.getNotHelpfulCount());
        response.setReportCount(review.getReportCount());
        response.setStatus(review.getStatus());
        response.setStatusDisplayName(review.getStatus() != null ? review.getStatus().getDisplayName() : null);
        response.setVerified(review.getVerified());
        response.setAdminResponse(review.getAdminResponse());
        response.setAdminResponseDate(review.getAdminResponseDate());
        response.setCreatedDate(review.getCreatedDate());
        response.setLastModifiedDate(review.getLastModifiedDate());
        
        // 프레젠테이션 로직 적용 (엔티티에서 DTO로 이동)
        response.setHelpfulPercentage(calculateHelpfulPercentage(review.getHelpfulCount(), review.getNotHelpfulCount()));
        response.setRatingDisplay(formatRatingDisplay(review.getOverallRating()));
        response.setIsPositive(review.getOverallRating() != null && review.getOverallRating().compareTo(BigDecimal.valueOf(3.5)) >= 0);
        response.setIsRecent(review.getCreatedDate() != null && review.getCreatedDate().isAfter(LocalDateTime.now().minusDays(7)));
        response.setIsEditable(calculateIsEditable(review));
        
        // 작성자 정보 (익명 처리) - 엔티티에서 DTO로 이동된 로직
        response.setReviewerName(getReviewerDisplayName(review));
        response.setIsAnonymousReviewer(review.getAnonymous() != null ? review.getAnonymous() : false);
        
        return response;
    }
    
    /**
     * 수정 가능 여부 확인 (엔티티에서 DTO로 이동)
     */
    private static Boolean calculateIsEditable(Review review) {
        // 작성자 본인만 가능, 24시간 이내, 활성 상태
        if (review.getStatus() != Review.ReviewStatus.ACTIVE) {
            return false;
        }
        
        if (review.getCreatedDate() == null) {
            return false;
        }
        
        // 24시간 이내만 수정 가능
        LocalDateTime cutoff = review.getCreatedDate().plusHours(24);
        return LocalDateTime.now().isBefore(cutoff);
    }
    
    /**
     * 리뷰어 이름 또는 익명 반환 (엔티티에서 DTO로 이동)
     */
    private static String getReviewerDisplayName(Review review) {
        if (review.getAnonymous() != null && review.getAnonymous()) {
            return "익명";
        }
        
        if (review.getReviewer() != null && review.getReviewer().getName() != null) {
            return maskUserName(review.getReviewer().getName());
        }
        
        return "익명";
    }
    
    /**
     * 도움됨 비율 계산 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static Double calculateHelpfulPercentage(Integer helpfulCount, Integer notHelpfulCount) {
        if (helpfulCount == null) helpfulCount = 0;
        if (notHelpfulCount == null) notHelpfulCount = 0;
        
        int total = helpfulCount + notHelpfulCount;
        if (total == 0) {
            return 0.0;
        }
        return Math.round((double) helpfulCount / total * 100 * 10.0) / 10.0; // 소수점 첫째자리까지
    }
    
    /**
     * 평점 표시 형식 포맷팅
     */
    private static String formatRatingDisplay(BigDecimal rating) {
        if (rating == null) {
            return "평점 없음";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("★".repeat(rating.intValue()));
        
        // 0.5점 단위 처리
        if (rating.remainder(BigDecimal.ONE).compareTo(BigDecimal.valueOf(0.5)) >= 0) {
            sb.append("☆");
        }
        
        // 빈 별 추가
        int emptyStars = 5 - rating.intValue() - (rating.remainder(BigDecimal.ONE).compareTo(BigDecimal.valueOf(0.5)) >= 0 ? 1 : 0);
        sb.append("☆".repeat(Math.max(0, emptyStars)));
        
        sb.append(" (").append(rating).append("/5.0)");
        
        return sb.toString();
    }
    
    /**
     * 사용자 이름 마스킹 (개인정보 보호)
     */
    private static String maskUserName(String name) {
        if (name == null || name.length() <= 1) {
            return "익명";
        }
        
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        
        StringBuilder masked = new StringBuilder();
        masked.append(name.charAt(0));
        for (int i = 1; i < name.length() - 1; i++) {
            masked.append("*");
        }
        masked.append(name.charAt(name.length() - 1));
        
        return masked.toString();
    }
}