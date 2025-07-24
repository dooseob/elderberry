package com.globalcarelink.review.dto;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;

/**
 * 리뷰 수정 요청 DTO
 * 리뷰 수정 시 클라이언트로부터 받는 데이터 구조
 * 모든 필드는 선택적(Optional)이며 null이 아닌 값만 업데이트됨
 */
@Data
public class ReviewUpdateRequest {
    
    @Size(max = 200, message = "리뷰 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @Size(max = 2000, message = "리뷰 내용은 2000자를 초과할 수 없습니다")
    private String content;
    
    @DecimalMin(value = "1.0", message = "전체 평점은 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "전체 평점은 5.0 이하여야 합니다")
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
    
    private Boolean recommended;
}