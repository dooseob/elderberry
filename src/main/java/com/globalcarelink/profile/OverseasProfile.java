package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "overseas_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class OverseasProfile extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(name = "gender", length = 10)
    private String gender;
    
    @Column(name = "overseas_address", length = 500)
    private String overseasAddress;
    
    @Column(name = "residence_country", length = 50, nullable = false)
    private String residenceCountry;
    
    @Column(name = "residence_city", length = 100)
    private String residenceCity;
    
    @Column(name = "korean_address", length = 500)
    private String koreanAddress;
    
    @Column(name = "korean_postal_code", length = 10)
    private String koreanPostalCode;
    
    @Column(name = "passport_number", length = 50)
    private String passportNumber;
    
    @Column(name = "passport_expiry_date")
    private LocalDate passportExpiryDate;
    
    @Column(name = "visa_status", length = 50)
    private String visaStatus;
    
    @Column(name = "visa_expiry_date")
    private LocalDate visaExpiryDate;
    
    @Column(name = "overseas_contact_name", length = 50)
    private String overseasContactName;
    
    @Column(name = "overseas_contact_phone", length = 30)
    private String overseasContactPhone;
    
    @Column(name = "overseas_contact_relation", length = 30)
    private String overseasContactRelation;
    
    @Column(name = "korea_contact_name", length = 50)
    private String koreaContactName;
    
    @Column(name = "korea_contact_phone", length = 20)
    private String koreaContactPhone;
    
    @Column(name = "korea_contact_relation", length = 30)
    private String koreaContactRelation;
    
    @Column(name = "overseas_insurance_number", length = 100)
    private String overseasInsuranceNumber;
    
    @Column(name = "overseas_insurance_provider", length = 100)
    private String overseasInsuranceProvider;
    
    @Column(name = "travel_insurance", length = 100)
    private String travelInsurance;
    
    @Column(name = "entry_purpose", length = 100)
    private String entryPurpose;
    
    @Column(name = "expected_stay_duration", length = 50)
    private String expectedStayDuration;
    
    @Column(name = "preferred_communication_method", length = 50)
    private String preferredCommunicationMethod;
    
    @Column(name = "time_zone_preference", length = 50)
    private String timeZonePreference;
    
    @Column(name = "preferred_region_in_korea", length = 100)
    private String preferredRegionInKorea;
    
    @Column(name = "budget_range", length = 50)
    private String budgetRange;
    
    @Column(name = "care_level", length = 20)
    private String careLevel;
    
    @Column(name = "special_needs", length = 1000)
    private String specialNeeds;
    
    @Column(name = "cultural_dietary_requirements", length = 500)
    private String culturalDietaryRequirements;
    
    @Column(name = "profile_completion_percentage")
    @Builder.Default
    private Integer profileCompletionPercentage = 0;
    
    @Column(name = "coordinator_required")
    @Builder.Default
    private Boolean coordinatorRequired = true;
    
    public void updateBasicInfo(LocalDate birthDate, String gender, String overseasAddress, 
                               String residenceCountry, String residenceCity) {
        this.birthDate = birthDate;
        this.gender = gender;
        this.overseasAddress = overseasAddress;
        this.residenceCountry = residenceCountry;
        this.residenceCity = residenceCity;
        calculateProfileCompletion();
    }
    
    public void updateKoreanAddress(String koreanAddress, String koreanPostalCode) {
        this.koreanAddress = koreanAddress;
        this.koreanPostalCode = koreanPostalCode;
        calculateProfileCompletion();
    }
    
    public void updatePassportInfo(String passportNumber, LocalDate passportExpiryDate, 
                                  String visaStatus, LocalDate visaExpiryDate) {
        this.passportNumber = passportNumber;
        this.passportExpiryDate = passportExpiryDate;
        this.visaStatus = visaStatus;
        this.visaExpiryDate = visaExpiryDate;
        calculateProfileCompletion();
    }
    
    public void updateOverseasContact(String name, String phone, String relation) {
        this.overseasContactName = name;
        this.overseasContactPhone = phone;
        this.overseasContactRelation = relation;
        calculateProfileCompletion();
    }
    
    public void updateKoreaContact(String name, String phone, String relation) {
        this.koreaContactName = name;
        this.koreaContactPhone = phone;
        this.koreaContactRelation = relation;
        calculateProfileCompletion();
    }
    
    public void updateInsuranceInfo(String overseasInsuranceNumber, String overseasInsuranceProvider, 
                                   String travelInsurance) {
        this.overseasInsuranceNumber = overseasInsuranceNumber;
        this.overseasInsuranceProvider = overseasInsuranceProvider;
        this.travelInsurance = travelInsurance;
        calculateProfileCompletion();
    }
    
    public void updateTripInfo(String entryPurpose, String expectedStayDuration, 
                              String preferredCommunicationMethod, String timeZonePreference) {
        this.entryPurpose = entryPurpose;
        this.expectedStayDuration = expectedStayDuration;
        this.preferredCommunicationMethod = preferredCommunicationMethod;
        this.timeZonePreference = timeZonePreference;
        calculateProfileCompletion();
    }
    
    public void updateCareInfo(String preferredRegionInKorea, String budgetRange, String careLevel, 
                              String specialNeeds, String culturalDietaryRequirements) {
        this.preferredRegionInKorea = preferredRegionInKorea;
        this.budgetRange = budgetRange;
        this.careLevel = careLevel;
        this.specialNeeds = specialNeeds;
        this.culturalDietaryRequirements = culturalDietaryRequirements;
        calculateProfileCompletion();
    }
    
    public void setCoordinatorRequired(boolean required) {
        this.coordinatorRequired = required;
    }
    
    private void calculateProfileCompletion() {
        int totalFields = 25; 
        int completedFields = 0;
        
        if (birthDate != null) completedFields++;
        if (gender != null && !gender.trim().isEmpty()) completedFields++;
        if (overseasAddress != null && !overseasAddress.trim().isEmpty()) completedFields++;
        if (residenceCountry != null && !residenceCountry.trim().isEmpty()) completedFields++;
        if (residenceCity != null && !residenceCity.trim().isEmpty()) completedFields++;
        if (koreanAddress != null && !koreanAddress.trim().isEmpty()) completedFields++;
        if (koreanPostalCode != null && !koreanPostalCode.trim().isEmpty()) completedFields++;
        if (passportNumber != null && !passportNumber.trim().isEmpty()) completedFields++;
        if (passportExpiryDate != null) completedFields++;
        if (visaStatus != null && !visaStatus.trim().isEmpty()) completedFields++;
        if (visaExpiryDate != null) completedFields++;
        if (overseasContactName != null && !overseasContactName.trim().isEmpty()) completedFields++;
        if (overseasContactPhone != null && !overseasContactPhone.trim().isEmpty()) completedFields++;
        if (overseasContactRelation != null && !overseasContactRelation.trim().isEmpty()) completedFields++;
        if (koreaContactName != null && !koreaContactName.trim().isEmpty()) completedFields++;
        if (koreaContactPhone != null && !koreaContactPhone.trim().isEmpty()) completedFields++;
        if (koreaContactRelation != null && !koreaContactRelation.trim().isEmpty()) completedFields++;
        if (overseasInsuranceNumber != null && !overseasInsuranceNumber.trim().isEmpty()) completedFields++;
        if (overseasInsuranceProvider != null && !overseasInsuranceProvider.trim().isEmpty()) completedFields++;
        if (travelInsurance != null && !travelInsurance.trim().isEmpty()) completedFields++;
        if (entryPurpose != null && !entryPurpose.trim().isEmpty()) completedFields++;
        if (expectedStayDuration != null && !expectedStayDuration.trim().isEmpty()) completedFields++;
        if (preferredCommunicationMethod != null && !preferredCommunicationMethod.trim().isEmpty()) completedFields++;
        if (timeZonePreference != null && !timeZonePreference.trim().isEmpty()) completedFields++;
        if (budgetRange != null && !budgetRange.trim().isEmpty()) completedFields++;
        
        this.profileCompletionPercentage = Math.round((float) completedFields / totalFields * 100);
    }
    
    public boolean isProfileComplete() {
        return profileCompletionPercentage >= 70; 
    }
    
    public boolean hasBasicInfo() {
        return birthDate != null && gender != null && residenceCountry != null;
    }
    
    public boolean hasPassportInfo() {
        return passportNumber != null && passportExpiryDate != null;
    }
    
    public boolean hasOverseasContact() {
        return overseasContactName != null && overseasContactPhone != null;
    }
    
    public boolean hasKoreaContact() {
        return koreaContactName != null && koreaContactPhone != null;
    }
    
    public boolean isDocumentationComplete() {
        return hasPassportInfo() && visaStatus != null;
    }
}