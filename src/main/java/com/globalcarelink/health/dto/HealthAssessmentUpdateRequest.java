package com.globalcarelink.health.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 건강 평가 수정 요청 DTO
 * 모든 필드는 선택사항 (null이면 기존 값 유지)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthAssessmentUpdateRequest {

    // === ADL 평가 ===

    @Min(value = 1, message = "걷기 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "걷기 활동 능력은 1-3 사이여야 합니다")
    private Integer mobilityLevel;

    @Min(value = 1, message = "식사 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "식사 활동 능력은 1-3 사이여야 합니다")
    private Integer eatingLevel;

    @Min(value = 1, message = "배변 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "배변 활동 능력은 1-3 사이여야 합니다")
    private Integer toiletLevel;

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

    private String updateReason; // 수정 사유
}