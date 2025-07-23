package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * 해외 프로필 엔티티 (재외동포)
 * BaseProfile을 상속받아 공통 필드 중복 제거
 */
@Entity
@Table(name = "overseas_profiles")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class OverseasProfile extends BaseProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ===== 해외 프로필 고유 필드 =====
    
    @Column(name = "residence_country", length = 50, nullable = false)
    @NotBlank(message = "거주 국가는 필수입니다")
    @Size(max = 50, message = "거주 국가는 50자 이하여야 합니다")
    private String residenceCountry;
    
    @Column(name = "residence_city", length = 100)
    @Size(max = 100, message = "거주 도시는 100자 이하여야 합니다")
    private String residenceCity;
    
    @Column(name = "korean_address", length = 500)
    @Size(max = 500, message = "한국 주소는 500자 이하여야 합니다")
    private String koreanAddress;
    
    @Column(name = "korean_postal_code", length = 10)
    @Size(max = 10, message = "한국 우편번호는 10자 이하여야 합니다")
    private String koreanPostalCode;
    
    @Column(name = "passport_number", length = 50)
    @Size(max = 50, message = "여권번호는 50자 이하여야 합니다")
    private String passportNumber;
    
    @Column(name = "passport_expiry_date")
    @Future(message = "여권 만료일은 미래 날짜여야 합니다")
    private LocalDate passportExpiryDate;
    
    @Column(name = "visa_status", length = 50)
    @Size(max = 50, message = "비자 상태는 50자 이하여야 합니다")
    private String visaStatus;
    
    @Column(name = "visa_expiry_date")
    private LocalDate visaExpiryDate;
    
    @Column(name = "overseas_contact_name", length = 50)
    @Size(max = 50, message = "현지 연락처명은 50자 이하여야 합니다")
    private String overseasContactName;
    
    @Column(name = "overseas_contact_phone", length = 20)
    @Pattern(regexp = "^[0-9\\-+\\s()]*$", message = "유효하지 않은 전화번호 형식입니다")
    private String overseasContactPhone;
    
    @Column(name = "overseas_contact_relation", length = 30)
    @Size(max = 30, message = "현지 연락처 관계는 30자 이하여야 합니다")
    private String overseasContactRelation;
    
    @Column(name = "language_preference", length = 100)
    @Size(max = 100, message = "언어 선호도는 100자 이하여야 합니다")
    private String languagePreference;
    
    @Column(name = "time_zone_preference", length = 50)
    @Size(max = 50, message = "시간대 선호도는 50자 이하여야 합니다")
    private String timeZonePreference;
    
    @Column(name = "preferred_region_in_korea", length = 100)
    @Size(max = 100, message = "한국 내 선호지역은 100자 이하여야 합니다")
    private String preferredRegionInKorea;
    
    @Column(name = "cultural_dietary_requirements", columnDefinition = "TEXT")
    private String culturalDietaryRequirements;
    
    @Column(name = "coordinator_required", nullable = false)
    @Builder.Default
    private Boolean coordinatorRequired = false;

    /**
     * 해외 프로필 생성자 (Builder 패턴용)
     */
    public OverseasProfile(Member member, String residenceCountry, String residenceCity,
                          String koreanAddress, String koreanPostalCode, String passportNumber,
                          LocalDate passportExpiryDate, String visaStatus, LocalDate visaExpiryDate,
                          String languagePreference, String timeZonePreference, 
                          String preferredRegionInKorea, Boolean coordinatorRequired) {
        this.member = member;
        this.residenceCountry = residenceCountry;
        this.residenceCity = residenceCity;
        this.koreanAddress = koreanAddress;
        this.koreanPostalCode = koreanPostalCode;
        this.passportNumber = passportNumber;
        this.passportExpiryDate = passportExpiryDate;
        this.visaStatus = visaStatus;
        this.visaExpiryDate = visaExpiryDate;
        this.languagePreference = languagePreference;
        this.timeZonePreference = timeZonePreference;
        this.preferredRegionInKorea = preferredRegionInKorea;
        this.coordinatorRequired = coordinatorRequired != null ? coordinatorRequired : false;
        updateCompletionPercentage();
    }

    /**
     * 거주지 정보 업데이트
     */
    public void updateResidenceInfo(String residenceCountry, String residenceCity, 
                                   String koreanAddress, String koreanPostalCode) {
        if (residenceCountry != null && !residenceCountry.trim().isEmpty()) {
            this.residenceCountry = residenceCountry;
        }
        if (residenceCity != null && !residenceCity.trim().isEmpty()) {
            this.residenceCity = residenceCity;
        }
        if (koreanAddress != null && !koreanAddress.trim().isEmpty()) {
            this.koreanAddress = koreanAddress;
        }
        if (koreanPostalCode != null && !koreanPostalCode.trim().isEmpty()) {
            this.koreanPostalCode = koreanPostalCode;
        }
        
        updateCompletionPercentage();
    }

    /**
     * 여권/비자 정보 업데이트
     */
    public void updateDocumentInfo(String passportNumber, LocalDate passportExpiryDate,
                                  String visaStatus, LocalDate visaExpiryDate) {
        if (passportNumber != null && !passportNumber.trim().isEmpty()) {
            this.passportNumber = passportNumber;
        }
        if (passportExpiryDate != null) {
            this.passportExpiryDate = passportExpiryDate;
        }
        if (visaStatus != null && !visaStatus.trim().isEmpty()) {
            this.visaStatus = visaStatus;
        }
        if (visaExpiryDate != null) {
            this.visaExpiryDate = visaExpiryDate;
        }
        
        updateCompletionPercentage();
    }

    /**
     * 현지 연락처 정보 업데이트
     */
    public void updateOverseasContact(String name, String phone, String relation) {
        if (name != null && !name.trim().isEmpty()) {
            this.overseasContactName = name;
        }
        if (phone != null && !phone.trim().isEmpty()) {
            this.overseasContactPhone = phone;
        }
        if (relation != null && !relation.trim().isEmpty()) {
            this.overseasContactRelation = relation;
        }
        
        updateCompletionPercentage();
    }

    /**
     * 선호도 정보 업데이트
     */
    public void updatePreferences(String languagePreference, String timeZonePreference,
                                 String preferredRegionInKorea, String culturalDietaryRequirements,
                                 Boolean coordinatorRequired) {
        if (languagePreference != null && !languagePreference.trim().isEmpty()) {
            this.languagePreference = languagePreference;
        }
        if (timeZonePreference != null && !timeZonePreference.trim().isEmpty()) {
            this.timeZonePreference = timeZonePreference;
        }
        if (preferredRegionInKorea != null && !preferredRegionInKorea.trim().isEmpty()) {
            this.preferredRegionInKorea = preferredRegionInKorea;
        }
        if (culturalDietaryRequirements != null && !culturalDietaryRequirements.trim().isEmpty()) {
            this.culturalDietaryRequirements = culturalDietaryRequirements;
        }
        if (coordinatorRequired != null) {
            this.coordinatorRequired = coordinatorRequired;
        }
        
        updateCompletionPercentage();
    }

    @Override
    protected void updateCompletionPercentage() {
        // 공통 필드 완성도 (60% 가중치)
        int commonCompletion = calculateCommonFieldsCompletion();
        
        // 해외 프로필 고유 필드 완성도 (40% 가중치)
        int overseasFields = 13; // 고유 필드 개수
        int completedOverseasFields = 0;
        
        if (residenceCountry != null && !residenceCountry.trim().isEmpty()) completedOverseasFields++;
        if (residenceCity != null && !residenceCity.trim().isEmpty()) completedOverseasFields++;
        if (koreanAddress != null && !koreanAddress.trim().isEmpty()) completedOverseasFields++;
        if (koreanPostalCode != null && !koreanPostalCode.trim().isEmpty()) completedOverseasFields++;
        if (passportNumber != null && !passportNumber.trim().isEmpty()) completedOverseasFields++;
        if (passportExpiryDate != null) completedOverseasFields++;
        if (visaStatus != null && !visaStatus.trim().isEmpty()) completedOverseasFields++;
        if (visaExpiryDate != null) completedOverseasFields++;
        if (overseasContactName != null && !overseasContactName.trim().isEmpty()) completedOverseasFields++;
        if (overseasContactPhone != null && !overseasContactPhone.trim().isEmpty()) completedOverseasFields++;
        if (languagePreference != null && !languagePreference.trim().isEmpty()) completedOverseasFields++;
        if (timeZonePreference != null && !timeZonePreference.trim().isEmpty()) completedOverseasFields++;
        if (preferredRegionInKorea != null && !preferredRegionInKorea.trim().isEmpty()) completedOverseasFields++;
        
        int overseasCompletion = (int) Math.round((double) completedOverseasFields / overseasFields * 100);
        
        // 가중 평균 계산
        this.profileCompletionPercentage = (int) Math.round(commonCompletion * 0.6 + overseasCompletion * 0.4);
    }

    @Override
    public String getProfileType() {
        return "해외 프로필 (재외동포)";
    }

    /**
     * 해외 프로필 요약 정보
     */
    public String getOverseasProfileSummary() {
        StringBuilder summary = new StringBuilder(getProfileSummary());
        summary.append("\n=== 해외 프로필 정보 ===\n");
        
        if (residenceCountry != null) {
            summary.append("거주 국가: ").append(residenceCountry);
            if (residenceCity != null) {
                summary.append(" (").append(residenceCity).append(")");
            }
            summary.append("\n");
        }
        if (passportNumber != null) {
            summary.append("여권번호: ").append(passportNumber).append("\n");
        }
        if (visaStatus != null) {
            summary.append("비자 상태: ").append(visaStatus).append("\n");
        }
        if (languagePreference != null) {
            summary.append("언어 선호도: ").append(languagePreference).append("\n");
        }
        if (preferredRegionInKorea != null) {
            summary.append("한국 내 선호지역: ").append(preferredRegionInKorea).append("\n");
        }
        
        summary.append("코디네이터 필요: ").append(coordinatorRequired ? "예" : "아니오");
        
        return summary.toString();
    }

    /**
     * 문서 유효성 확인
     */
    public boolean hasValidDocuments() {
        LocalDate now = LocalDate.now();
        boolean passportValid = passportExpiryDate != null && passportExpiryDate.isAfter(now);
        boolean visaValid = visaExpiryDate == null || visaExpiryDate.isAfter(now); // 비자는 선택사항
        
        return passportValid && visaValid;
    }

    /**
     * 여권 만료 임박 여부 (30일 이내)
     */
    public boolean isPassportExpiringSoon() {
        if (passportExpiryDate == null) {
            return false;
        }
        
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return passportExpiryDate.isBefore(thirtyDaysFromNow);
    }

    /**
     * 비자 만료 임박 여부 (30일 이내)
     */
    public boolean isVisaExpiringSoon() {
        if (visaExpiryDate == null) {
            return false;
        }
        
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return visaExpiryDate.isBefore(thirtyDaysFromNow);
    }

    /**
     * 한국 내 연락처 보유 여부
     */
    public boolean hasKoreanContact() {
        return koreanAddress != null && !koreanAddress.trim().isEmpty();
    }

    /**
     * 현지 연락처 보유 여부
     */
    public boolean hasOverseasContact() {
        return overseasContactName != null && !overseasContactName.trim().isEmpty() &&
               overseasContactPhone != null && !overseasContactPhone.trim().isEmpty();
    }
}