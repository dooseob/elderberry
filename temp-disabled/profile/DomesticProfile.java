package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * 국내 프로필 엔티티
 * BaseProfile을 상속받아 공통 필드 중복 제거
 */
@Entity
@Table(name = "domestic_profiles")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class DomesticProfile extends BaseProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ===== 국내 프로필 고유 필드 =====
    
    @Column(name = "health_insurance_number", length = 50)
    @Size(max = 50, message = "건강보험번호는 50자 이하여야 합니다")
    private String healthInsuranceNumber;
    
    @Column(name = "ltci_grade")
    @Min(value = 1, message = "장기요양등급은 1 이상이어야 합니다")
    @Max(value = 6, message = "장기요양등급은 6 이하여야 합니다")
    private Integer ltciGrade;
    
    @Column(name = "ltci_certificate_number", length = 50)
    @Size(max = 50, message = "장기요양인정서번호는 50자 이하여야 합니다")
    private String ltciCertificateNumber;
    
    @Column(name = "preferred_region", length = 100)
    @Size(max = 100, message = "선호지역은 100자 이하여야 합니다")
    private String preferredRegion;
    
    @Column(name = "family_visit_frequency", length = 50)
    @Size(max = 50, message = "가족방문빈도는 50자 이하여야 합니다")
    private String familyVisitFrequency;

    /**
     * 국내 프로필 생성자 (Builder 패턴용)
     */
    public DomesticProfile(Member member, String healthInsuranceNumber, Integer ltciGrade, 
                          String ltciCertificateNumber, String preferredRegion, 
                          String familyVisitFrequency) {
        this.member = member;
        this.healthInsuranceNumber = healthInsuranceNumber;
        this.ltciGrade = ltciGrade;
        this.ltciCertificateNumber = ltciCertificateNumber;
        this.preferredRegion = preferredRegion;
        this.familyVisitFrequency = familyVisitFrequency;
        updateCompletionPercentage();
    }

    /**
     * 건강보험 정보 업데이트
     */
    public void updateHealthInfo(String healthInsuranceNumber, Integer ltciGrade, 
                                String ltciCertificateNumber) {
        if (healthInsuranceNumber != null && !healthInsuranceNumber.trim().isEmpty()) {
            this.healthInsuranceNumber = healthInsuranceNumber;
        }
        if (ltciGrade != null && ltciGrade >= 1 && ltciGrade <= 6) {
            this.ltciGrade = ltciGrade;
        }
        if (ltciCertificateNumber != null && !ltciCertificateNumber.trim().isEmpty()) {
            this.ltciCertificateNumber = ltciCertificateNumber;
        }
        
        updateCompletionPercentage();
    }

    /**
     * 선호도 정보 업데이트
     */
    public void updatePreferences(String preferredRegion, String familyVisitFrequency) {
        if (preferredRegion != null && !preferredRegion.trim().isEmpty()) {
            this.preferredRegion = preferredRegion;
        }
        if (familyVisitFrequency != null && !familyVisitFrequency.trim().isEmpty()) {
            this.familyVisitFrequency = familyVisitFrequency;
        }
        
        updateCompletionPercentage();
    }

    @Override
    protected void updateCompletionPercentage() {
        // 공통 필드 완성도 (70% 가중치)
        int commonCompletion = calculateCommonFieldsCompletion();
        
        // 국내 프로필 고유 필드 완성도 (30% 가중치)
        int domesticFields = 5; // 고유 필드 개수
        int completedDomesticFields = 0;
        
        if (healthInsuranceNumber != null && !healthInsuranceNumber.trim().isEmpty()) completedDomesticFields++;
        if (ltciGrade != null) completedDomesticFields++;
        if (ltciCertificateNumber != null && !ltciCertificateNumber.trim().isEmpty()) completedDomesticFields++;
        if (preferredRegion != null && !preferredRegion.trim().isEmpty()) completedDomesticFields++;
        if (familyVisitFrequency != null && !familyVisitFrequency.trim().isEmpty()) completedDomesticFields++;
        
        int domesticCompletion = (int) Math.round((double) completedDomesticFields / domesticFields * 100);
        
        // 가중 평균 계산
        this.profileCompletionPercentage = (int) Math.round(commonCompletion * 0.7 + domesticCompletion * 0.3);
    }

    @Override
    public String getProfileType() {
        return "국내 프로필";
    }

    /**
     * 장기요양보험 등급 텍스트 반환
     */
    public String getLtciGradeText() {
        if (ltciGrade == null) {
            return "미등록";
        }
        
        return switch (ltciGrade) {
            case 1 -> "1등급 (최중증)";
            case 2 -> "2등급 (중증)";
            case 3 -> "3등급 (중등증)";
            case 4 -> "4등급 (경증)";
            case 5 -> "5등급 (경증)";
            case 6 -> "인지지원등급";
            default -> "알 수 없음";
        };
    }

    /**
     * 국내 프로필 요약 정보
     */
    public String getDomesticProfileSummary() {
        StringBuilder summary = new StringBuilder(getProfileSummary());
        summary.append("\n=== 국내 프로필 정보 ===\n");
        
        if (healthInsuranceNumber != null) {
            summary.append("건강보험번호: ").append(healthInsuranceNumber).append("\n");
        }
        if (ltciGrade != null) {
            summary.append("장기요양등급: ").append(getLtciGradeText()).append("\n");
        }
        if (preferredRegion != null) {
            summary.append("선호지역: ").append(preferredRegion).append("\n");
        }
        if (familyVisitFrequency != null) {
            summary.append("가족방문빈도: ").append(familyVisitFrequency).append("\n");
        }
        
        return summary.toString();
    }

    /**
     * 장기요양보험 등급 보유 여부
     */
    public boolean hasLtciGrade() {
        return ltciGrade != null && ltciGrade >= 1 && ltciGrade <= 6;
    }

    /**
     * 중증 환자 여부 (1-3등급)
     */
    public boolean isSevereCase() {
        return hasLtciGrade() && ltciGrade <= 3;
    }

    /**
     * 인지지원등급 여부
     */
    public boolean isCognitiveSupport() {
        return hasLtciGrade() && ltciGrade == 6;
    }
}