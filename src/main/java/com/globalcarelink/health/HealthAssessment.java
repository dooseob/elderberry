package com.globalcarelink.health;

import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * 건강 상태 평가 엔티티 (KB라이프생명 기반 돌봄지수)
 * 
 * 4개 주요 평가 영역:
 * - 걷기 활동 능력 (mobility)
 * - 식사 활동 능력 (eating) 
 * - 배변 활동 능력 (toilet)
 * - 의사소통 능력 (communication)
 */
@Entity
@Table(name = "health_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class HealthAssessment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false, length = 50)
    @NotNull(message = "회원 ID는 필수입니다")
    @Size(max = 50, message = "회원 ID는 50자 이하여야 합니다")
    private String memberId;

    // ===== 기본 정보 =====
    @Column(name = "gender", length = 10)
    @Pattern(regexp = "^(MALE|FEMALE|M|F)$", message = "성별은 MALE, FEMALE, M, F 중 하나여야 합니다")
    private String gender;

    @Column(name = "birth_year")
    @Min(value = 1900, message = "출생년도는 1900년 이후여야 합니다")
    @Max(value = 2024, message = "출생년도는 현재년도 이하여야 합니다")
    private Integer birthYear;

    // ===== ADL 평가 (각 영역 1-3점) =====
    
    /**
     * 걷기 활동 능력 (care_mobility)
     * 1: 독립 - 혼자서 가능
     * 2: 부분도움 - 부축, 지팡이 등 필요
     * 3: 완전도움 - 휠체어 사용 등
     */
    @Column(name = "mobility_level", nullable = false)
    @NotNull(message = "걷기 활동 능력 평가는 필수입니다")
    @Min(value = 1, message = "걷기 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "걷기 활동 능력은 1-3 사이여야 합니다")
    private Integer mobilityLevel;

    /**
     * 식사 활동 능력 (care_eating)
     * 1: 독립 - 혼자서 가능
     * 2: 부분도움 - 반찬 집기, 자르기 등 일부 도움
     * 3: 완전도움 - 음식을 떠 먹여줌
     */
    @Column(name = "eating_level", nullable = false)
    @NotNull(message = "식사 활동 능력 평가는 필수입니다")
    @Min(value = 1, message = "식사 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "식사 활동 능력은 1-3 사이여야 합니다")
    private Integer eatingLevel;

    /**
     * 배변 활동 능력 (care_toilet)
     * 1: 독립 - 혼자서 화장실 이용 가능
     * 2: 부분도움 - 화장실 이용 시 부분적 도움 필요
     * 3: 완전도움 - 간이변기, 기저귀 착용 등
     */
    @Column(name = "toilet_level", nullable = false)
    @NotNull(message = "배변 활동 능력 평가는 필수입니다")
    @Min(value = 1, message = "배변 활동 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "배변 활동 능력은 1-3 사이여야 합니다")
    private Integer toiletLevel;

    /**
     * 의사소통 능력 (care_communication)
     * 1: 정상 - 정상적으로 가능
     * 2: 부분제한 - 때때로 어려움 (화장실 이용의사 표현 가능)
     * 3: 심각제한 - 소통이 어려움 (화장실 이용의사 표현 잘 못함)
     */
    @Column(name = "communication_level", nullable = false)
    @NotNull(message = "의사소통 능력 평가는 필수입니다")
    @Min(value = 1, message = "의사소통 능력은 1-3 사이여야 합니다")
    @Max(value = 3, message = "의사소통 능력은 1-3 사이여야 합니다")
    private Integer communicationLevel;

    // ===== 장기요양보험 정보 =====
    
    /**
     * 장기요양보험 등급
     * 1-5: 장기요양등급 (1등급이 최중증)
     * 6: 인지지원등급 (치매 등)
     * 7: 등급 판정 중 또는 모름
     * 8: 등급 없음
     */
    @Column(name = "ltci_grade")
    @Min(value = 1, message = "장기요양보험 등급은 1-8 사이여야 합니다")
    @Max(value = 8, message = "장기요양보험 등급은 1-8 사이여야 합니다")
    private Integer ltciGrade;

    /**
     * 돌봄대상자 상태 (생명예후 상태)
     * 1: 6개월 이하 기대수명 (호스피스 케어)
     * 2: 질병이 회복하기 어려운 상황으로 수명이 얼마 남지 않음
     * 3: 완전히 타인 의존적이나 사망위험이 높지 않음
     * 4: 해당사항 없음 (일반 요양)
     */
    @Column(name = "care_target_status")
    @Min(value = 1, message = "돌봄대상자 상태는 1-4 사이여야 합니다")
    @Max(value = 4, message = "돌봄대상자 상태는 1-4 사이여야 합니다")
    @Builder.Default
    private Integer careTargetStatus = 4;

    // ===== KB라이프생명 참조: 추가 평가 항목 =====

    /**
     * 식사 형태 (KB라이프생명 기준 추가)
     * 1: 일반식 (정상 식사 가능)
     * 2: 다진식/갈은식 (부드러운 식사 필요)
     * 3: 경관식 (튜브 주입)
     */
    @Column(name = "meal_type")
    @Min(value = 1, message = "식사형태는 1-3 사이여야 합니다")
    @Max(value = 3, message = "식사형태는 1-3 사이여야 합니다")
    @Builder.Default
    private Integer mealType = 1;

    /**
     * 주요 질환 분류 (복수 선택 가능)
     * DEMENTIA: 치매 (인지기능 저하)
     * PARKINSON: 파킨슨 (운동장애)
     * STROKE: 뇌혈관질환 (뇌졸중 등)
     * DIABETES: 당뇨병
     * HYPERTENSION: 고혈압
     * OTHER: 기타
     * UNKNOWN: 잘 모르겠음
     */
    @Column(name = "disease_types", length = 200)
    @Size(max = 200, message = "질환 분류는 200자 이하여야 합니다")
    private String diseaseTypes; // JSON 형태로 저장: ["DEMENTIA", "STROKE"]

    // ===== 계산된 결과 =====

    /**
     * ADL 점수 (일상생활수행능력 점수)
     * 계산식: (mobility*25) + (eating*20) + (toilet*30) + (communication*25)
     * 범위: 100-300점
     */
    @Column(name = "adl_score")
    private Integer adlScore;

    /**
     * 종합 케어 등급
     * ADL 점수 + 장기요양보험 등급 + 돌봄대상자 상태를 종합하여 산출
     */
    @Column(name = "overall_care_grade", length = 50)
    @Size(max = 50, message = "종합 케어 등급은 50자 이하여야 합니다")
    private String overallCareGrade;

    @Column(name = "assessment_date", nullable = false)
    @Builder.Default
    private LocalDateTime assessmentDate = LocalDateTime.now();

    // ===== 비즈니스 메서드 =====

    /**
     * ADL 점수 계산
     * 각 영역별 가중치를 적용하여 총점 계산
     */
    public void calculateAdlScore() {
        if (mobilityLevel != null && eatingLevel != null && 
            toiletLevel != null && communicationLevel != null) {
            
            this.adlScore = (mobilityLevel * 25) + (eatingLevel * 20) + 
                           (toiletLevel * 30) + (communicationLevel * 25);
        }
    }

    /**
     * 재외동포 여부 확인
     * 회원 정보를 통해 확인 (추후 Member 엔티티와 연동)
     */
    public boolean isOverseasKorean() {
        // TODO: Member 엔티티의 role이 OVERSEAS_USER인지 확인
        return false; // 임시 구현
    }

    /**
     * 종합 평가 점수 (5점 만점)
     * ADL 점수를 5점 만점으로 환산
     */
    public double getOverallScore() {
        if (adlScore == null) {
            calculateAdlScore();
        }
        
        // 100점(최고) → 5.0점, 300점(최저) → 1.0점으로 환산
        double normalizedScore = 5.0 - ((adlScore - 100.0) / 200.0 * 4.0);
        return Math.max(1.0, Math.min(5.0, normalizedScore));
    }

    /**
     * 케어 등급 레벨 반환
     * 1: 최중증, 2: 중증, 3: 중등증, 4: 경증, 5: 경증, 6: 인지지원
     */
    public int getCareGradeLevel() {
        if (ltciGrade != null && ltciGrade >= 1 && ltciGrade <= 6) {
            return ltciGrade;
        }
        
        // 장기요양등급이 없는 경우 ADL 점수로 추정
        if (adlScore == null) {
            calculateAdlScore();
        }
        
        if (adlScore >= 250) return 1; // 최중증
        if (adlScore >= 220) return 2; // 중증
        if (adlScore >= 180) return 3; // 중등증
        if (adlScore >= 140) return 4; // 경증
        return 5; // 경증
    }

    /**
     * 평가 완성도 확인
     */
    public boolean isComplete() {
        return mobilityLevel != null && eatingLevel != null && 
               toiletLevel != null && communicationLevel != null;
    }

    /**
     * 평가 갱신 (새로운 평가 결과로 업데이트)
     */
    public void updateAssessment(Integer mobility, Integer eating, Integer toilet, Integer communication) {
        this.mobilityLevel = mobility;
        this.eatingLevel = eating;
        this.toiletLevel = toilet;
        this.communicationLevel = communication;
        this.assessmentDate = LocalDateTime.now();
        
        // 자동으로 ADL 점수 재계산
        calculateAdlScore();
    }

    /**
     * 특정 질환 여부 확인
     */
    public boolean hasDiseaseType(String diseaseType) {
        return diseaseTypes != null && diseaseTypes.contains(diseaseType);
    }

    /**
     * 중증 지표 여부 확인 (KB라이프생명 기준)
     * - 경관식(튜브 주입) 또는
     * - 배변활동 완전도움
     */
    public boolean hasSevereIndicators() {
        return (mealType != null && mealType == 3) || (toiletLevel != null && toiletLevel == 3);
    }

    /**
     * 치매 관련 질환 여부 확인
     */
    public boolean hasDementiaRelatedCondition() {
        return ltciGrade != null && ltciGrade == 6 || 
               communicationLevel != null && communicationLevel == 3 ||
               hasDiseaseType("DEMENTIA");
    }

    /**
     * 호스피스 케어 필요 여부 확인
     */
    public boolean needsHospiceCare() {
        return careTargetStatus != null && careTargetStatus <= 2;
    }

    /**
     * 질환별 전문 케어 타입 반환
     */
    public String getSpecializedCareType() {
        if (needsHospiceCare()) {
            return "HOSPICE";
        }
        if (hasDementiaRelatedCondition()) {
            return "DEMENTIA";
        }
        if (hasDiseaseType("PARKINSON")) {
            return "PARKINSON";
        }
        if (hasDiseaseType("STROKE")) {
            return "STROKE_REHAB";
        }
        if (hasSevereIndicators()) {
            return "SEVERE_MEDICAL";
        }
        return "GENERAL";
    }

    /**
     * 예상 월 비용 범위 반환 (등급 기반)
     */
    public String getEstimatedMonthlyCostRange() {
        int gradeLevel = getCareGradeLevel();
        return switch (gradeLevel) {
            case 1 -> "300-500만원";
            case 2 -> "200-400만원";
            case 3 -> "150-300만원";
            case 4, 5 -> "50-150만원";
            case 6 -> "200-350만원";
            default -> "상담 후 결정";
        };
    }

    /**
     * 평가 결과 요약 텍스트 생성
     */
    public String generateAssessmentSummary() {
        StringBuilder summary = new StringBuilder();
        
        summary.append("🏥 종합 케어 등급: ").append(overallCareGrade != null ? overallCareGrade : "미산출").append("\n");
        summary.append("📊 ADL 점수: ").append(adlScore != null ? adlScore + "점" : "미계산").append("\n");
        
        if (ltciGrade != null && ltciGrade <= 6) {
            summary.append("🎯 장기요양등급: ").append(ltciGrade).append("등급\n");
        }
        
        if (hasSevereIndicators()) {
            summary.append("⚠️ 중증 지표 존재\n");
        }
        
        if (needsHospiceCare()) {
            summary.append("🕊️ 호스피스 케어 권장\n");
        }
        
        summary.append("💰 예상 비용: ").append(getEstimatedMonthlyCostRange());
        
        return summary.toString();
    }
}