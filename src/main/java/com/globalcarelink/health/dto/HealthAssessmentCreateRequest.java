package com.globalcarelink.health.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 건강 평가 생성 요청 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthAssessmentCreateRequest {

    @NotBlank(message = "회원 ID는 필수입니다")
    @Size(max = 50, message = "회원 ID는 50자 이하여야 합니다")
    private String memberId;

    @Pattern(regexp = "^(MALE|FEMALE|M|F)$", message = "성별은 MALE, FEMALE, M, F 중 하나여야 합니다")
    private String gender;

    @Min(value = 1900, message = "출생년도는 1900년 이후여야 합니다")
    @Max(value = 2024, message = "출생년도는 현재년도 이하여야 합니다")
    private Integer birthYear;

    // === ADL 평가 (필수) ===

    @NotNull(message = "걷기 활동 능력 평가는 필수입니다")
    @Min(value = 1, message = "걷기 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "걷기 활동 능력은 1-3 사이여야 합니다")
    private Integer mobilityLevel;

    @NotNull(message = "식사 활동 능력 평가는 필수입니다")
    @Min(value = 1, message = "식사 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "식사 활동 능력은 1-3 사이여야 합니다")
    private Integer eatingLevel;

    @NotNull(message = "배변 활동 능력 평가는 필수입니다")
    @Min(value = 1, message = "배변 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "배변 활동 능력은 1-3 사이여야 합니다")
    private Integer toiletLevel;

    @NotNull(message = "의사소통 능력 평가는 필수입니다")
    @Min(value = 1, message = "의사소통 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "의사소통 능력은 1-3 사이여야 합니다")
    private Integer communicationLevel;

    // === 추가 평가 항목 ===

    @Min(value = 1, message = "장기요양보험 등급은 1-8 사이여야 합니다")
    @Max(value = 8, message = "장기요양보험 등급은 1-8 사이여야 합니다")
    private Integer ltciGrade;

    @Min(value = 1, message = "돌봄대상자 상태는 1-4 사이여야 합니다")
    @Max(value = 4, message = "돌봄대상자 상태는 1-4 사이여야 합니다")
    private Integer careTargetStatus;

    @Min(value = 1, message = "식사형태는 1-3 사이여야 합니다")
    @Max(value = 3, message = "식사형태는 1-3 사이여야 합니다")
    private Integer mealType;

    @Size(max = 200, message = "질환 분류는 200자 이하여야 합니다")
    private String diseaseTypes;

    // === 추가 정보 ===

    private String notes; // 특이사항

    private String assessorName; // 평가자 이름

    private String assessorRelation; // 평가자와의 관계 (본인, 가족, 간병인 등)
}