package com.globalcarelink.profile.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "해외 사용자 프로필 등록/수정 요청")
public class OverseasProfileRequest {
    
    @Schema(description = "생년월일", example = "1950-03-15")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    
    @Schema(description = "성별", example = "남성", allowableValues = {"남성", "여성"})
    @Pattern(regexp = "^(남성|여성)$", message = "성별은 '남성' 또는 '여성'이어야 합니다")
    private String gender;
    
    @Schema(description = "해외 거주 주소", example = "123 Main Street, New York, NY 10001, USA")
    @Size(max = 500, message = "해외 거주 주소는 500자 이내여야 합니다")
    private String overseasAddress;
    
    @Schema(description = "거주 국가", example = "미국", required = true)
    @NotBlank(message = "거주 국가는 필수입니다")
    @Size(max = 50, message = "거주 국가는 50자 이내여야 합니다")
    private String residenceCountry;
    
    @Schema(description = "거주 도시", example = "뉴욕")
    @Size(max = 100, message = "거주 도시는 100자 이내여야 합니다")
    private String residenceCity;
    
    @Schema(description = "한국 내 주소", example = "서울특별시 강남구 테헤란로 123")
    @Size(max = 500, message = "한국 내 주소는 500자 이내여야 합니다")
    private String koreanAddress;
    
    @Schema(description = "한국 우편번호", example = "06234")
    @Pattern(regexp = "^\\d{5}$", message = "우편번호는 5자리 숫자여야 합니다")
    private String koreanPostalCode;
    
    @Schema(description = "여권번호", example = "A12345678")
    @Size(max = 50, message = "여권번호는 50자 이내여야 합니다")
    private String passportNumber;
    
    @Schema(description = "여권 만료일", example = "2030-12-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Future(message = "여권 만료일은 현재보다 미래여야 합니다")
    private LocalDate passportExpiryDate;
    
    @Schema(description = "비자 상태", example = "관광비자")
    @Size(max = 50, message = "비자 상태는 50자 이내여야 합니다")
    private String visaStatus;
    
    @Schema(description = "비자 만료일", example = "2025-06-30")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate visaExpiryDate;
    
    @Schema(description = "해외 응급 연락처 이름", example = "John Smith")
    @Size(max = 50, message = "해외 응급 연락처 이름은 50자 이내여야 합니다")
    private String overseasContactName;
    
    @Schema(description = "해외 응급 연락처 전화번호", example = "+1-555-123-4567")
    @Size(max = 30, message = "해외 응급 연락처는 30자 이내여야 합니다")
    private String overseasContactPhone;
    
    @Schema(description = "해외 응급 연락처 관계", example = "자녀")
    @Size(max = 30, message = "관계는 30자 이내여야 합니다")
    private String overseasContactRelation;
    
    @Schema(description = "한국 내 응급 연락처 이름", example = "김철수")
    @Size(max = 50, message = "한국 내 응급 연락처 이름은 50자 이내여야 합니다")
    private String koreaContactName;
    
    @Schema(description = "한국 내 응급 연락처 전화번호", example = "010-1234-5678")
    @Pattern(regexp = "^01[0-9]-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다")
    private String koreaContactPhone;
    
    @Schema(description = "한국 내 응급 연락처 관계", example = "지인")
    @Size(max = 30, message = "관계는 30자 이내여야 합니다")
    private String koreaContactRelation;
    
    @Schema(description = "해외 보험 번호", example = "INS-123456789")
    @Size(max = 100, message = "해외 보험 번호는 100자 이내여야 합니다")
    private String overseasInsuranceNumber;
    
    @Schema(description = "해외 보험 제공업체", example = "BlueCross BlueShield")
    @Size(max = 100, message = "보험 제공업체명은 100자 이내여야 합니다")
    private String overseasInsuranceProvider;
    
    @Schema(description = "여행자 보험", example = "AIG 여행자 보험")
    @Size(max = 100, message = "여행자 보험은 100자 이내여야 합니다")
    private String travelInsurance;
    
    @Schema(description = "입국 목적", example = "부모님 요양")
    @Size(max = 100, message = "입국 목적은 100자 이내여야 합니다")
    private String entryPurpose;
    
    @Schema(description = "예상 체류 기간", example = "6개월")
    @Size(max = 50, message = "예상 체류 기간은 50자 이내여야 합니다")
    private String expectedStayDuration;
    
    @Schema(description = "선호 의사소통 방법", example = "화상통화", allowableValues = {"화상통화", "전화", "이메일", "문자"})
    @Size(max = 50, message = "의사소통 방법은 50자 이내여야 합니다")
    private String preferredCommunicationMethod;
    
    @Schema(description = "시간대 선호도", example = "한국시간 오전", allowableValues = {"한국시간 오전", "한국시간 오후", "해외시간 기준"})
    @Size(max = 50, message = "시간대 선호도는 50자 이내여야 합니다")
    private String timeZonePreference;
    
    @Schema(description = "한국 내 선호 지역", example = "서울특별시")
    @Size(max = 100, message = "선호 지역은 100자 이내여야 합니다")
    private String preferredRegionInKorea;
    
    @Schema(description = "예산 범위", example = "200-300만원", allowableValues = {"100만원 이하", "100-200만원", "200-300만원", "300-500만원", "500만원 이상"})
    @Size(max = 50, message = "예산 범위는 50자 이내여야 합니다")
    private String budgetRange;
    
    @Schema(description = "케어 수준", example = "중등도", allowableValues = {"경증", "중등도", "중증", "최중증"})
    @Size(max = 20, message = "케어 수준은 20자 이내여야 합니다")
    private String careLevel;
    
    @Schema(description = "특별 돌봄 요구사항", example = "영어 의사소통 가능한 간병인 필요")
    @Size(max = 1000, message = "특별 돌봄 요구사항은 1000자 이내여야 합니다")
    private String specialNeeds;
    
    @Schema(description = "문화적/종교적 식단 요구사항", example = "할랄 음식 제공 필요")
    @Size(max = 500, message = "식단 요구사항은 500자 이내여야 합니다")
    private String culturalDietaryRequirements;
    
    @Schema(description = "코디네이터 서비스 필요 여부", example = "true")
    @Builder.Default
    private Boolean coordinatorRequired = true;
}