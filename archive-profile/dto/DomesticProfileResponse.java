package com.globalcarelink.profile.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.globalcarelink.profile.DomesticProfile;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "국내 사용자 프로필 응답")
public class DomesticProfileResponse {
    
    @Schema(description = "프로필 ID", example = "1")
    private Long id;
    
    @Schema(description = "회원 ID", example = "1")
    private Long memberId;
    
    @Schema(description = "생년월일", example = "1950-03-15")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    
    @Schema(description = "성별", example = "남성")
    private String gender;
    
    @Schema(description = "주소", example = "서울특별시 강남구 테헤란로 123")
    private String address;
    
    @Schema(description = "상세주소", example = "101동 502호")
    private String detailedAddress;
    
    @Schema(description = "우편번호", example = "06234")
    private String postalCode;
    
    @Schema(description = "응급 연락처 이름", example = "홍길동")
    private String emergencyContactName;
    
    @Schema(description = "응급 연락처 전화번호", example = "010-****-5678")
    private String emergencyContactPhone;
    
    @Schema(description = "응급 연락처 관계", example = "자녀")
    private String emergencyContactRelation;
    
    @Schema(description = "건강보험 번호 (마스킹)", example = "123456****123")
    private String healthInsuranceNumber;
    
    @Schema(description = "장기요양등급", example = "3")
    private Integer ltciGrade;
    
    @Schema(description = "장기요양인정서 번호", example = "2024-1234567890")
    private String ltciCertificateNumber;
    
    @Schema(description = "선호 지역", example = "서울특별시")
    private String preferredRegion;
    
    @Schema(description = "케어 수준", example = "중등도")
    private String careLevel;
    
    @Schema(description = "특별 돌봄 요구사항", example = "치매 전문 케어 필요")
    private String specialNeeds;
    
    @Schema(description = "가족 방문 빈도", example = "주 1회")
    private String familyVisitFrequency;
    
    @Schema(description = "예산 범위", example = "100-150만원")
    private String budgetRange;
    
    @Schema(description = "프로필 완성도 (퍼센트)", example = "85")
    private Integer profileCompletionPercentage;
    
    @Schema(description = "프로필 생성일시")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Schema(description = "프로필 수정일시")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @Schema(description = "기본 정보 완료 여부")
    private Boolean hasBasicInfo;
    
    @Schema(description = "응급연락처 완료 여부")
    private Boolean hasEmergencyContact;
    
    @Schema(description = "건강정보 완료 여부")
    private Boolean hasHealthInfo;
    
    @Schema(description = "프로필 완료 여부")
    private Boolean isProfileComplete;
    
    public static DomesticProfileResponse from(DomesticProfile profile) {
        if (profile == null) {
            return null;
        }
        
        return DomesticProfileResponse.builder()
                .id(profile.getId())
                .memberId(profile.getMember().getId())
                .birthDate(profile.getBirthDate())
                .gender(profile.getGender())
                .address(profile.getAddress())
                .detailedAddress(profile.getDetailedAddress())
                .postalCode(profile.getPostalCode())
                .emergencyContactName(profile.getEmergencyContactName())
                .emergencyContactPhone(maskPhoneNumber(profile.getEmergencyContactPhone()))
                .emergencyContactRelation(profile.getEmergencyContactRelation())
                .healthInsuranceNumber(maskHealthInsuranceNumber(profile.getHealthInsuranceNumber()))
                .ltciGrade(profile.getLtciGrade())
                .ltciCertificateNumber(profile.getLtciCertificateNumber())
                .preferredRegion(profile.getPreferredRegion())
                .careLevel(profile.getCareLevel())
                .specialNeeds(profile.getSpecialNeeds())
                .familyVisitFrequency(profile.getFamilyVisitFrequency())
                .budgetRange(profile.getBudgetRange())
                .profileCompletionPercentage(profile.getProfileCompletionPercentage())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .hasBasicInfo(profile.hasBasicInfo())
                .hasEmergencyContact(profile.hasEmergencyContact())
                .hasHealthInfo(profile.hasHealthInfo())
                .isProfileComplete(profile.isProfileComplete())
                .build();
    }
    
    private static String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 8) {
            return phoneNumber;
        }
        return phoneNumber.substring(0, 3) + "-****-" + phoneNumber.substring(phoneNumber.length() - 4);
    }
    
    private static String maskHealthInsuranceNumber(String insuranceNumber) {
        if (insuranceNumber == null || insuranceNumber.length() < 8) {
            return insuranceNumber;
        }
        return insuranceNumber.substring(0, 6) + "****" + insuranceNumber.substring(insuranceNumber.length() - 3);
    }
}