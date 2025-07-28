package com.globalcarelink.coordinator;

import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * 코디네이터 언어 능력 엔티티
 * 글로벌 서비스를 위한 다국어 지원 능력 관리
 */
@Entity
@Table(name = "coordinator_language_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class CoordinatorLanguageSkill extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "coordinator_id", nullable = false, length = 50)
    @NotNull(message = "코디네이터 ID는 필수입니다")
    private String coordinatorId;

    /**
     * 언어 코드 (ISO 639-1)
     * KO: 한국어, EN: 영어, ZH: 중국어, JP: 일본어, ES: 스페인어, 
     * VI: 베트남어, TH: 태국어, RU: 러시아어
     */
    @Column(name = "language_code", nullable = false, length = 5)
    @NotNull(message = "언어 코드는 필수입니다")
    private String languageCode;

    /**
     * 언어명 (사용자 표시용)
     */
    @Column(name = "language_name", nullable = false, length = 50)
    @NotNull(message = "언어명은 필수입니다")
    private String languageName;

    /**
     * 언어 수준 (CEFR 기준 + 모국어)
     * NATIVE: 모국어 수준
     * FLUENT: 유창함 (C1-C2)
     * BUSINESS: 업무 가능 (B2)
     * CONVERSATIONAL: 일상 대화 (B1)
     * BASIC: 기초 수준 (A1-A2)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false, length = 20)
    @NotNull(message = "언어 수준은 필수입니다")
    private LanguageProficiency proficiencyLevel;

    /**
     * 자격증/인증 정보
     */
    @Column(name = "certification", length = 100)
    private String certification; // "TOEIC 950", "HSK 6급", "JLPT N1" 등

    /**
     * 전문 분야 (해당 언어로 상담 가능한 분야)
     */
    @Column(name = "specialization", length = 200)
    private String specialization; // "의료상담", "법무상담", "부동산" 등

    /**
     * 국가/지역 경험 (해당 언어권 거주/근무 경험)
     */
    @Column(name = "country_experience", length = 100)
    private String countryExperience; // "미국 5년 거주", "중국 현지 근무 3년" 등

    /**
     * 언어별 서비스 요금 (추가 요금)
     */
    @Column(name = "service_fee_rate")
    private Double serviceFeeRate; // 기본 요금 대비 배율 (1.0=동일, 1.5=50%할증)

    /**
     * 활성 상태
     */
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    /**
     * 우선순위 (같은 언어 내에서의 우선순위)
     */
    @Column(name = "priority_order")
    @Builder.Default
    private Integer priorityOrder = 1;

    // ===== 비즈니스 메서드 =====

    /**
     * 업무 수준 이상 여부
     */
    public boolean isBusinessLevelOrAbove() {
        return proficiencyLevel == LanguageProficiency.NATIVE ||
               proficiencyLevel == LanguageProficiency.FLUENT ||
               proficiencyLevel == LanguageProficiency.BUSINESS;
    }

    /**
     * 전문 상담 가능 여부
     */
    public boolean canProvideProfessionalConsultation() {
        return proficiencyLevel == LanguageProficiency.NATIVE ||
               proficiencyLevel == LanguageProficiency.FLUENT;
    }

    /**
     * 해당 국가 경험 여부
     */
    public boolean hasCountryExperience() {
        return countryExperience != null && !countryExperience.trim().isEmpty();
    }

    /**
     * 자격증 보유 여부
     */
    public boolean hasCertification() {
        return certification != null && !certification.trim().isEmpty();
    }

    /**
     * 언어별 매칭 점수 계산 (5점 만점)
     */
    public double calculateMatchingScore() {
        double baseScore = switch (proficiencyLevel) {
            case NATIVE -> 5.0;
            case FLUENT -> 4.5;
            case BUSINESS -> 4.0;
            case CONVERSATIONAL -> 3.0;
            case BASIC -> 2.0;
        };

        // 자격증 보유 시 가산점
        if (hasCertification()) {
            baseScore += 0.3;
        }

        // 현지 경험 가산점
        if (hasCountryExperience()) {
            baseScore += 0.5;
        }

        // 전문 분야 가산점
        if (specialization != null && !specialization.trim().isEmpty()) {
            baseScore += 0.2;
        }

        return Math.min(baseScore, 5.0);
    }

    /**
     * 언어 능력 표시 문자열
     */
    public String getDisplayText() {
        StringBuilder display = new StringBuilder();
        display.append(languageName).append(" (").append(getProficiencyDisplayName()).append(")");
        
        if (hasCertification()) {
            display.append(" - ").append(certification);
        }
        
        if (hasCountryExperience()) {
            display.append(" [").append(countryExperience).append("]");
        }
        
        return display.toString();
    }

    /**
     * 수준별 한글 표시명
     */
    public String getProficiencyDisplayName() {
        return switch (proficiencyLevel) {
            case NATIVE -> "모국어";
            case FLUENT -> "유창함";
            case BUSINESS -> "업무가능";
            case CONVERSATIONAL -> "일상대화";
            case BASIC -> "기초수준";
        };
    }

    /**
     * 재외동포 국가별 언어 매칭
     */
    public boolean matchesCountry(String countryCode) {
        return switch (languageCode.toUpperCase()) {
            case "EN" -> countryCode.matches("US|CA|AU|NZ|GB"); // 영어권
            case "ZH" -> countryCode.matches("CN|TW|SG|MY");    // 중화권
            case "JP" -> countryCode.equals("JP");              // 일본
            case "ES" -> countryCode.matches("ES|MX|AR|CL|PE"); // 스페인어권
            case "VI" -> countryCode.equals("VN");              // 베트남
            case "TH" -> countryCode.equals("TH");              // 태국
            case "RU" -> countryCode.matches("RU|KZ|UZ");       // 러시아어권
            default -> false;
        };
    }

    /**
     * 언어 수준 enum
     */
    public enum LanguageProficiency {
        NATIVE("모국어 수준"),
        FLUENT("유창함 (C1-C2)"),
        BUSINESS("업무 가능 (B2)"),
        CONVERSATIONAL("일상 대화 (B1)"),
        BASIC("기초 수준 (A1-A2)");

        private final String description;

        LanguageProficiency(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}