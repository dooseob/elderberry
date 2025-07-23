package com.globalcarelink.facility.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 시설 매칭 선호도 설정
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityMatchingPreference {
    
    // 지역 선호도
    private String preferredRegion;
    private String preferredDistrict;
    private BigDecimal maxDistanceKm;
    
    // 시설 타입 선호도
    private List<String> preferredFacilityTypes;
    
    // 비용 선호도
    private Integer maxMonthlyFee;
    private Integer maxMealCost;
    
    // 시설 등급 선호도
    private List<String> preferredGrades; // A, B, C, D, E
    
    // 특별 서비스 요구사항
    private List<String> requiredServices;
    
    // 의료진 요구사항
    private Boolean requiresDoctor;
    private Boolean requires24hNurse;
    
    // 기타 선호도
    private Integer minCapacity;
    private Integer maxCapacity;
    private Boolean preferLowOccupancy;

    /**
     * 최대 월 비용 조회
     */
    public Integer getMaxMonthlyFee() {
        return maxMonthlyFee;
    }
} 