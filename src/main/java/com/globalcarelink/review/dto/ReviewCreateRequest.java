package com.globalcarelink.review.dto;

import com.globalcarelink.review.Review;
import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 리뷰 작성 요청 DTO
 * 리뷰 작성 시 클라이언트로부터 받는 데이터 구조
 */
@Data
public class ReviewCreateRequest {
    
    @NotBlank(message = "리뷰 제목은 필수입니다")
    @Size(max = 200, message = "리뷰 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @NotBlank(message = "리뷰 내용은 필수입니다")
    @Size(max = 2000, message = "리뷰 내용은 2000자를 초과할 수 없습니다")
    private String content;
    
    @NotNull(message = "전체 평점은 필수입니다")
    @DecimalMin(value = "1.0", message = "평점은 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "평점은 5.0 이하여야 합니다")
    private BigDecimal overallRating;
    
    @DecimalMin(value = "1.0", message = "서비스 품질 평점은 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "서비스 품질 평점은 5.0 이하여야 합니다")
    private BigDecimal serviceQualityRating;
    
    @DecimalMin(value = "1.0", message = "시설 평점은 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "시설 평점은 5.0 이하여야 합니다")
    private BigDecimal facilityRating;
    
    @DecimalMin(value = "1.0", message = "직원 평점은 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "직원 평점은 5.0 이하여야 합니다")
    private BigDecimal staffRating;
    
    @DecimalMin(value = "1.0", message = "가격 평점은 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "가격 평점은 5.0 이하여야 합니다")
    private BigDecimal priceRating;
    
    @DecimalMin(value = "1.0", message = "접근성 평점은 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "접근성 평점은 5.0 이하여야 합니다")
    private BigDecimal accessibilityRating;
    
    private Review.ReviewType reviewType = Review.ReviewType.FACILITY;
    
    private Boolean recommended = true;
    
    private LocalDateTime visitDate;
    
    @Min(value = 1, message = "서비스 이용 기간은 1일 이상이어야 합니다")
    @Max(value = 3650, message = "서비스 이용 기간은 10년을 초과할 수 없습니다")
    private Integer serviceDurationDays;
    
    private Boolean anonymous = false;
    
    @Size(max = 10, message = "이미지는 최대 10개까지 첨부할 수 있습니다")
    private List<String> imageUrls;
    
    @Size(max = 20, message = "태그는 최대 20개까지 추가할 수 있습니다")
    private List<String> tags;
}