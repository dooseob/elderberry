package com.globalcarelink.facility.dto;

import com.globalcarelink.facility.FacilityProfile;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * 시설 프로필 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityProfileResponse {
    
    private Long id;
    private String externalId;
    private String facilityName;
    private String facilityType;
    private String facilityGrade;
    private Integer evaluationScore;
    
    // 연락처 정보
    private String phoneNumber;
    private String email;
    private String homepage;
    private String websiteUrl;
    
    // 주소 정보
    private String address;
    private String region;
    private String district;
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    // 수용 능력
    private Integer totalCapacity;
    private Integer currentOccupancy;
    private Integer availableBeds;
    
    // 케어 등급
    private Set<Integer> acceptableCareGrades;
    private Set<String> specializations;
    
    // 의료진 정보
    private Boolean hasDoctor;
    private Boolean hasNurse24h;
    private Integer nurseCount;
    private Integer doctorCount;
    private Integer totalStaff;
    
    // 비용 정보
    private Integer monthlyBasicFee;
    private Integer mealCost;
    
    // 시설 정보
    private Double totalFloorArea;
    private String buildingStructure;
    private Integer parkingSpaces;
    private String specialServices;
    
    // 운영 정보
    private String operationStatus;
    private String establishmentDate;
    private String representativeName;
    
    // 메타데이터
    private String dataSource;
    private LocalDateTime lastSyncedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * FacilityProfile 엔티티로부터 DTO 생성
     */
    public static FacilityProfileResponse from(FacilityProfile facility) {
        return FacilityProfileResponse.builder()
                .id(facility.getId())
                .externalId(facility.getExternalId())
                .facilityName(facility.getFacilityName())
                .facilityType(facility.getFacilityType())
                .facilityGrade(facility.getGrade())
                .evaluationScore(facility.getEvaluationScore())
                .phoneNumber(facility.getPhoneNumber())
                .email(facility.getEmail())
                .homepage(facility.getHomepage())
                .websiteUrl(facility.getWebsiteUrl())
                .address(facility.getFullAddress())
                .region(facility.getRegion())
                .district(facility.getDistrict())
                .latitude(facility.getLatitude())
                .longitude(facility.getLongitude())
                .totalCapacity(facility.getTotalCapacity())
                .currentOccupancy(facility.getCurrentOccupancy())
                .availableBeds(facility.getAvailableBeds())
                .acceptableCareGrades(facility.getAcceptableCareGrades())
                .specializations(facility.getSpecializations())
                .hasDoctor(facility.getHasDoctor())
                .hasNurse24h(facility.getHasNurse24h())
                .nurseCount(facility.getNurseCount())
                .doctorCount(facility.getDoctorCount())
                .totalStaff(facility.getTotalStaff())
                .monthlyBasicFee(facility.getMonthlyBasicFee())
                .mealCost(facility.getMealCost())
                .totalFloorArea(facility.getTotalFloorArea())
                .buildingStructure(facility.getBuildingStructure())
                .parkingSpaces(facility.getParkingSpaces())
                .specialServices(facility.getSpecialServices())
                .operationStatus(facility.getOperationStatus())
                .establishmentDate(facility.getEstablishmentDate())
                .representativeName(facility.getRepresentativeName())
                .dataSource(facility.getDataSource())
                .lastSyncedAt(facility.getLastSyncedAt())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }
} 