package com.globalcarelink.facility.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.Set;

/**
 * 시설 프로필 생성 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityProfileCreateRequest {
    
    @NotBlank(message = "시설명은 필수입니다")
    @Size(max = 100, message = "시설명은 100자 이하여야 합니다")
    private String facilityName;
    
    @NotBlank(message = "시설 타입은 필수입니다")
    private String facilityType;
    
    @Pattern(regexp = "^[A-E]$", message = "시설 등급은 A-E 중 하나여야 합니다")
    private String facilityGrade;
    
    @Min(value = 0, message = "평가 점수는 0 이상이어야 합니다")
    @Max(value = 100, message = "평가 점수는 100 이하여야 합니다")
    private Integer evaluationScore;
    
    // 연락처 정보
    @Pattern(regexp = "^[0-9-]+$", message = "전화번호는 숫자와 하이픈만 포함해야 합니다")
    private String phoneNumber;
    
    @Email(message = "올바른 이메일 형식이어야 합니다")
    private String email;
    
    private String homepage;
    
    // 주소 정보
    @NotBlank(message = "주소는 필수입니다")
    @Size(max = 200, message = "주소는 200자 이하여야 합니다")
    private String address;
    
    @NotBlank(message = "지역은 필수입니다")
    private String region;
    
    @NotBlank(message = "구/군은 필수입니다")
    private String district;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    // 수용 능력
    @NotNull(message = "총 정원은 필수입니다")
    @Min(value = 1, message = "총 정원은 1명 이상이어야 합니다")
    private Integer totalCapacity;
    
    @Min(value = 0, message = "현재 입주자 수는 0 이상이어야 합니다")
    private Integer currentOccupancy;
    
    // 케어 등급
    private Set<Integer> acceptableCareGrades;
    private Set<String> specializations;
    
    // 의료진 정보
    private Boolean hasDoctor;
    private Boolean hasNurse24h;
    private Integer nurseCount;
    private Integer doctorCount;
    
    // 비용 정보
    private Integer monthlyBasicFee;
    private Integer mealCost;
    
    // 시설 정보
    private Double totalFloorArea;
    private String buildingStructure;
    private Integer parkingSpaces;
    private String specialServices;
} 