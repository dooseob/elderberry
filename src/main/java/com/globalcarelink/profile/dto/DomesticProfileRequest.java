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
@Schema(description = "국내 사용자 프로필 등록/수정 요청")
public class DomesticProfileRequest {
    
    @Schema(description = "생년월일", example = "1950-03-15")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    
    @Schema(description = "성별", example = "남성", allowableValues = {"남성", "여성"})
    @Pattern(regexp = "^(남성|여성)$", message = "성별은 '남성' 또는 '여성'이어야 합니다")
    private String gender;
    
    @Schema(description = "주소", example = "서울특별시 강남구 테헤란로 123")
    @Size(max = 500, message = "주소는 500자 이내여야 합니다")
    private String address;
    
    @Schema(description = "상세주소", example = "101동 502호")
    @Size(max = 200, message = "상세주소는 200자 이내여야 합니다")
    private String detailedAddress;
    
    @Schema(description = "우편번호", example = "06234")
    @Pattern(regexp = "^\\d{5}$", message = "우편번호는 5자리 숫자여야 합니다")
    private String postalCode;
    
    @Schema(description = "응급 연락처 이름", example = "홍길동")
    @Size(max = 50, message = "응급 연락처 이름은 50자 이내여야 합니다")
    private String emergencyContactName;
    
    @Schema(description = "응급 연락처 전화번호", example = "010-1234-5678")
    @Pattern(regexp = "^01[0-9]-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다")
    private String emergencyContactPhone;
    
    @Schema(description = "응급 연락처 관계", example = "자녀")
    @Size(max = 30, message = "관계는 30자 이내여야 합니다")
    private String emergencyContactRelation;
    
    @Schema(description = "건강보험 번호", example = "1234567890123")
    @Size(max = 50, message = "건강보험 번호는 50자 이내여야 합니다")
    private String healthInsuranceNumber;
    
    @Schema(description = "장기요양등급", example = "3", allowableValues = {"1", "2", "3", "4", "5", "6"})
    @Min(value = 1, message = "장기요양등급은 1 이상이어야 합니다")
    @Max(value = 6, message = "장기요양등급은 6 이하여야 합니다")
    private Integer ltciGrade;
    
    @Schema(description = "장기요양인정서 번호", example = "2024-1234567890")
    @Size(max = 50, message = "장기요양인정서 번호는 50자 이내여야 합니다")
    private String ltciCertificateNumber;
    
    @Schema(description = "선호 지역", example = "서울특별시")
    @Size(max = 100, message = "선호 지역은 100자 이내여야 합니다")
    private String preferredRegion;
    
    @Schema(description = "케어 수준", example = "중등도", allowableValues = {"경증", "중등도", "중증", "최중증"})
    @Size(max = 20, message = "케어 수준은 20자 이내여야 합니다")
    private String careLevel;
    
    @Schema(description = "특별 돌봄 요구사항", example = "치매 전문 케어 필요")
    @Size(max = 1000, message = "특별 돌봄 요구사항은 1000자 이내여야 합니다")
    private String specialNeeds;
    
    @Schema(description = "가족 방문 빈도", example = "주 1회")
    @Size(max = 50, message = "가족 방문 빈도는 50자 이내여야 합니다")
    private String familyVisitFrequency;
    
    @Schema(description = "예산 범위", example = "100-150만원", allowableValues = {"50만원 이하", "50-100만원", "100-150만원", "150-200만원", "200만원 이상"})
    @Size(max = 50, message = "예산 범위는 50자 이내여야 합니다")
    private String budgetRange;
}