package com.globalcarelink.facility.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 시설 추천 결과 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityRecommendation {
    
    private Long facilityId;
    private String facilityName;
    private String facilityType;
    private String facilityGrade;
    private String address;
    private String region;
    private String district;
    
    // 추천 점수 및 순위
    private Double matchingScore;
    private Integer recommendationRank;
    
    // 거리 정보
    private BigDecimal distanceKm;
    
    // 가용성 정보
    private Integer totalCapacity;
    private Integer currentOccupancy;
    private Integer availableBeds;
    
    // 비용 정보
    private Integer monthlyBasicFee;
    private Integer mealCost;
    
    // 의료진 정보
    private Boolean hasDoctor;
    private Boolean hasNurse24h;
    
    // 추천 이유
    private String recommendationReason;
    private Map<String, Object> matchingFactors;
    
    // 메타데이터
    private LocalDateTime recommendedAt;
    private String recommendationAlgorithm;

    /**
     * 추천 이유 조회
     */
    public String getRecommendationReason() {
        return recommendationReason;
    }
} 