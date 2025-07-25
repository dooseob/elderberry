package com.globalcarelink.facility.dto;

import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.facility.FacilityProfileService;
import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * 시설 추천 요청 DTO
 */
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RecommendationRequest {
    
    @NotNull(message = "건강 평가 정보는 필수입니다")
    private HealthAssessment healthAssessment;
    
    @NotNull(message = "시설 매칭 선호도는 필수입니다")
    private FacilityProfileService.FacilityMatchingPreference preference;
}