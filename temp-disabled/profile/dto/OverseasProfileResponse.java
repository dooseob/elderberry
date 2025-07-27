package com.globalcarelink.profile.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.globalcarelink.profile.OverseasProfile;
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
@Schema(description = "해외 사용자 프로필 응답")
public class OverseasProfileResponse {
    
    @Schema(description = "프로필 ID", example = "1")
    private Long id;
    
    @Schema(description = "회원 ID", example = "1")
    private Long memberId;
    
    @Schema(description = "생년월일", example = "1950-03-15")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    
    @Schema(description = "성별", example = "남성")
    private String gender;
    
    @Schema(description = "해외 거주 주소", example = "123 Main Street, New York, NY 10001, USA")
    private String overseasAddress;
    
    @Schema(description = "거주 국가", example = "미국")
    private String residenceCountry;
    
    @Schema(description = "거주 도시", example = "뉴욕")
    private String residenceCity;
    
    @Schema(description = "한국 내 주소", example = "서울특별시 강남구 테헤란로 123")
    private String koreanAddress;
    
    @Schema(description = "한국 우편번호", example = "06234")
    private String koreanPostalCode;
    
    @Schema(description = "여권번호 (마스킹)", example = "A1234****")
    private String passportNumber;
    
    @Schema(description = "여권 만료일", example = "2030-12-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate passportExpiryDate;
    
    @Schema(description = "비자 상태", example = "관광비자")
    private String visaStatus;
    
    @Schema(description = "비자 만료일", example = "2025-06-30")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate visaExpiryDate;
    
    @Schema(description = "해외 응급 연락처 이름", example = "John Smith")
    private String overseasContactName;
    
    @Schema(description = "해외 응급 연락처 전화번호 (마스킹)", example = "+1-555-***-4567")
    private String overseasContactPhone;
    
    @Schema(description = "해외 응급 연락처 관계", example = "자녀")
    private String overseasContactRelation;
    
    @Schema(description = "한국 내 응급 연락처 이름", example = "김철수")
    private String koreaContactName;
    
    @Schema(description = "한국 내 응급 연락처 전화번호 (마스킹)", example = "010-****-5678")
    private String koreaContactPhone;
    
    @Schema(description = "한국 내 응급 연락처 관계", example = "지인")
    private String koreaContactRelation;
    
    @Schema(description = "해외 보험 번호 (마스킹)", example = "INS-123***789")
    private String overseasInsuranceNumber;
    
    @Schema(description = "해외 보험 제공업체", example = "BlueCross BlueShield")
    private String overseasInsuranceProvider;
    
    @Schema(description = "여행자 보험", example = "AIG 여행자 보험")
    private String travelInsurance;
    
    @Schema(description = "입국 목적", example = "부모님 요양")
    private String entryPurpose;
    
    @Schema(description = "예상 체류 기간", example = "6개월")
    private String expectedStayDuration;
    
    @Schema(description = "선호 의사소통 방법", example = "화상통화")
    private String preferredCommunicationMethod;
    
    @Schema(description = "시간대 선호도", example = "한국시간 오전")
    private String timeZonePreference;
    
    @Schema(description = "한국 내 선호 지역", example = "서울특별시")
    private String preferredRegionInKorea;
    
    @Schema(description = "예산 범위", example = "200-300만원")
    private String budgetRange;
    
    @Schema(description = "케어 수준", example = "중등도")
    private String careLevel;
    
    @Schema(description = "특별 돌봄 요구사항", example = "영어 의사소통 가능한 간병인 필요")
    private String specialNeeds;
    
    @Schema(description = "문화적/종교적 식단 요구사항", example = "할랄 음식 제공 필요")
    private String culturalDietaryRequirements;
    
    @Schema(description = "프로필 완성도 (퍼센트)", example = "75")
    private Integer profileCompletionPercentage;
    
    @Schema(description = "코디네이터 서비스 필요 여부", example = "true")
    private Boolean coordinatorRequired;
    
    @Schema(description = "프로필 생성일시")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Schema(description = "프로필 수정일시")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @Schema(description = "기본 정보 완료 여부")
    private Boolean hasBasicInfo;
    
    @Schema(description = "여권 정보 완료 여부")
    private Boolean hasPassportInfo;
    
    @Schema(description = "해외 연락처 완료 여부")
    private Boolean hasOverseasContact;
    
    @Schema(description = "한국 연락처 완료 여부")
    private Boolean hasKoreaContact;
    
    @Schema(description = "서류 준비 완료 여부")
    private Boolean isDocumentationComplete;
    
    @Schema(description = "프로필 완료 여부")
    private Boolean isProfileComplete;
    
    public static OverseasProfileResponse from(OverseasProfile profile) {
        if (profile == null) {
            return null;
        }
        
        return OverseasProfileResponse.builder()
                .id(profile.getId())
                .memberId(profile.getMember().getId())
                .birthDate(profile.getBirthDate())
                .gender(profile.getGender())
                .overseasAddress(profile.getOverseasAddress())
                .residenceCountry(profile.getResidenceCountry())
                .residenceCity(profile.getResidenceCity())
                .koreanAddress(profile.getKoreanAddress())
                .koreanPostalCode(profile.getKoreanPostalCode())
                .passportNumber(maskPassportNumber(profile.getPassportNumber()))
                .passportExpiryDate(profile.getPassportExpiryDate())
                .visaStatus(profile.getVisaStatus())
                .visaExpiryDate(profile.getVisaExpiryDate())
                .overseasContactName(profile.getOverseasContactName())
                .overseasContactPhone(maskOverseasPhone(profile.getOverseasContactPhone()))
                .overseasContactRelation(profile.getOverseasContactRelation())
                .koreaContactName(profile.getKoreaContactName())
                .koreaContactPhone(maskPhoneNumber(profile.getKoreaContactPhone()))
                .koreaContactRelation(profile.getKoreaContactRelation())
                .overseasInsuranceNumber(maskInsuranceNumber(profile.getOverseasInsuranceNumber()))
                .overseasInsuranceProvider(profile.getOverseasInsuranceProvider())
                .travelInsurance(profile.getTravelInsurance())
                .entryPurpose(profile.getEntryPurpose())
                .expectedStayDuration(profile.getExpectedStayDuration())
                .preferredCommunicationMethod(profile.getPreferredCommunicationMethod())
                .timeZonePreference(profile.getTimeZonePreference())
                .preferredRegionInKorea(profile.getPreferredRegionInKorea())
                .budgetRange(profile.getBudgetRange())
                .careLevel(profile.getCareLevel())
                .specialNeeds(profile.getSpecialNeeds())
                .culturalDietaryRequirements(profile.getCulturalDietaryRequirements())
                .profileCompletionPercentage(profile.getProfileCompletionPercentage())
                .coordinatorRequired(profile.getCoordinatorRequired())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .hasBasicInfo(profile.hasBasicInfo())
                .hasPassportInfo(profile.hasPassportInfo())
                .hasOverseasContact(profile.hasOverseasContact())
                .hasKoreaContact(profile.hasKoreaContact())
                .isDocumentationComplete(profile.isDocumentationComplete())
                .isProfileComplete(profile.isProfileComplete())
                .build();
    }
    
    private static String maskPassportNumber(String passportNumber) {
        if (passportNumber == null || passportNumber.length() < 6) {
            return passportNumber;
        }
        return passportNumber.substring(0, 5) + "****";
    }
    
    private static String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 8) {
            return phoneNumber;
        }
        return phoneNumber.substring(0, 3) + "-****-" + phoneNumber.substring(phoneNumber.length() - 4);
    }
    
    private static String maskOverseasPhone(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 8) {
            return phoneNumber;
        }
        if (phoneNumber.contains("-")) {
            String[] parts = phoneNumber.split("-");
            if (parts.length >= 3) {
                return parts[0] + "-" + parts[1] + "-***-" + parts[parts.length - 1];
            }
        }
        return phoneNumber.substring(0, 6) + "***" + phoneNumber.substring(phoneNumber.length() - 4);
    }
    
    private static String maskInsuranceNumber(String insuranceNumber) {
        if (insuranceNumber == null || insuranceNumber.length() < 8) {
            return insuranceNumber;
        }
        return insuranceNumber.substring(0, 6) + "***" + insuranceNumber.substring(insuranceNumber.length() - 3);
    }
}