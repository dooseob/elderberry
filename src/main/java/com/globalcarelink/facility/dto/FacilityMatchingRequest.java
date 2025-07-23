package com.globalcarelink.facility.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 시설 매칭 요청 DTO
 * 사용자의 시설 추천 요청 정보를 담는 클래스
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class FacilityMatchingRequest {
    
    /**
     * 회원 ID (건강 평가 정보 조회용)
     */
    @NotNull(message = "회원 ID는 필수입니다")
    private Long memberId;
    
    /**
     * 담당 코디네이터 ID (선택사항)
     */
    private String coordinatorId;
    
    /**
     * 매칭 선호도 설정
     */
    @Valid
    @NotNull(message = "매칭 선호도는 필수입니다")
    private FacilityMatchingPreference preference;
    
    /**
     * 최대 추천 결과 수 (기본값: 10)
     */
    @Min(value = 1, message = "최소 1개 이상의 결과가 필요합니다")
    @Max(value = 50, message = "최대 50개까지 추천 가능합니다")
    private Integer maxResults = 10;
    
    /**
     * 학습 기반 점수 조정 적용 여부 (기본값: true)
     */
    private Boolean applyLearningAdjustment = true;
    
    /**
     * 거리 기반 필터링 적용 여부 (기본값: false)
     */
    private Boolean applyDistanceFilter = false;
    
    /**
     * 최대 거리 (km) - 거리 필터링 적용 시
     */
    @Min(value = 1, message = "최소 1km 이상이어야 합니다")
    @Max(value = 100, message = "최대 100km까지 설정 가능합니다")
    private Integer maxDistanceKm;
} 