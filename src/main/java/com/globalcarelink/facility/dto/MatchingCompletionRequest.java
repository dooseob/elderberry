package com.globalcarelink.facility.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * 매칭 완료 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingCompletionRequest {
    
    @NotNull(message = "시설 ID는 필수입니다")
    private Long facilityId;
    
    @NotNull(message = "건강 평가 ID는 필수입니다")
    private Long healthAssessmentId;
    
    // 매칭 결과
    @NotBlank(message = "매칭 결과는 필수입니다")
    private String matchingResult; // SELECTED, REJECTED, PENDING
    
    // 선택 이유 또는 거부 이유
    @Size(max = 500, message = "사유는 500자 이하여야 합니다")
    private String reason;
    
    // 연락 정보
    private Boolean wasContacted;
    private LocalDate contactDate;
    
    // 방문 정보
    private Boolean wasVisited;
    private LocalDate visitDate;
    
    // 계약 정보
    private Boolean contractSigned;
    private LocalDate contractDate;
    private LocalDate expectedMoveInDate;
    
    // 사용자 피드백
    @Min(value = 1, message = "만족도는 1 이상이어야 합니다")
    @Max(value = 5, message = "만족도는 5 이하여야 합니다")
    private Integer satisfactionRating;
    
    @Size(max = 1000, message = "피드백은 1000자 이하여야 합니다")
    private String feedback;
    
    // 추천 시스템 개선을 위한 데이터
    private Boolean wouldRecommendToOthers;
    private String improvementSuggestions;

    // 실제 비용 정보 (계약 후)
    private Integer actualCost;

    /**
     * 매칭 결과를 outcome으로 반환
     */
    public String getOutcome() {
        return matchingResult;
    }

    /**
     * 실제 비용 조회
     */
    public Integer getActualCost() {
        return actualCost;
    }

    /**
     * 만족도 점수 조회
     */
    public Integer getSatisfactionScore() {
        return satisfactionRating;
    }

    /**
     * 피드백 조회
     */
    public String getFeedback() {
        return feedback;
    }
} 