package com.globalcarelink.facility.dto;

import com.globalcarelink.facility.FacilityMatchingHistory;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * 매칭 완료 처리 요청 DTO
 * 사용자가 시설을 선택하고 매칭을 완료할 때 사용하는 클래스
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class MatchingCompletionRequest {
    
    /**
     * 매칭 결과 (성공, 실패, 보류 등)
     */
    @NotNull(message = "매칭 결과는 필수입니다")
    private FacilityMatchingHistory.MatchingOutcome outcome;
    
    /**
     * 실제 월 비용 (선택사항)
     */
    @DecimalMin(value = "0.0", message = "비용은 0 이상이어야 합니다")
    @DecimalMax(value = "10000000.0", message = "비용은 1천만원 이하여야 합니다")
    private BigDecimal actualCost;
    
    /**
     * 만족도 점수 (1.0 ~ 5.0)
     */
    @DecimalMin(value = "1.0", message = "만족도는 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "만족도는 5.0 이하여야 합니다")
    private BigDecimal satisfactionScore;
    
    /**
     * 사용자 피드백 (선택사항)
     */
    @Size(max = 1000, message = "피드백은 1000자 이하여야 합니다")
    private String feedback;
    
    /**
     * 추천 시스템 개선을 위한 추가 정보 (선택사항)
     */
    @Size(max = 500, message = "추가 정보는 500자 이하여야 합니다")
    private String improvementSuggestion;
    
    /**
     * 다른 사용자에게 추천할 의향 (1: 전혀 없음, 5: 매우 있음)
     */
    @Min(value = 1, message = "추천 의향은 1 이상이어야 합니다")
    @Max(value = 5, message = "추천 의향은 5 이하여야 합니다")
    private Integer recommendationWillingness;
} 