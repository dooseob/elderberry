package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "domestic_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class DomesticProfile extends BaseEntity {
    
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
    
    @Column(name = "address", length = 500)
    private String address;
    
    @Column(name = "detailed_address", length = 200)
    private String detailedAddress;
    
    @Column(name = "postal_code", length = 10)
    private String postalCode;
    
    @Column(name = "emergency_contact_name", length = 50)
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;
    
    @Column(name = "emergency_contact_relation", length = 30)
    private String emergencyContactRelation;
    
    @Column(name = "health_insurance_number", length = 50)
    private String healthInsuranceNumber;
    
    @Column(name = "ltci_grade")
    private Integer ltciGrade;
    
    @Column(name = "ltci_certificate_number", length = 50)
    private String ltciCertificateNumber;
    
    @Column(name = "preferred_region", length = 100)
    private String preferredRegion;
    
    @Column(name = "care_level", length = 20)
    private String careLevel;
    
    @Column(name = "special_needs", length = 1000)
    private String specialNeeds;
    
    @Column(name = "family_visit_frequency", length = 50)
    private String familyVisitFrequency;
    
    @Column(name = "budget_range", length = 50)
    private String budgetRange;
    
    @Column(name = "profile_completion_percentage")
    @Builder.Default
    private Integer profileCompletionPercentage = 0;
    
    public void updateBasicInfo(LocalDate birthDate, String gender, String address, 
                               String detailedAddress, String postalCode) {
        this.birthDate = birthDate;
        this.gender = gender;
        this.address = address;
        this.detailedAddress = detailedAddress;
        this.postalCode = postalCode;
        calculateProfileCompletion();
    }
    
    public void updateEmergencyContact(String name, String phone, String relation) {
        this.emergencyContactName = name;
        this.emergencyContactPhone = phone;
        this.emergencyContactRelation = relation;
        calculateProfileCompletion();
    }
    
    public void updateHealthInfo(String healthInsuranceNumber, Integer ltciGrade, 
                                String ltciCertificateNumber) {
        this.healthInsuranceNumber = healthInsuranceNumber;
        this.ltciGrade = ltciGrade;
        this.ltciCertificateNumber = ltciCertificateNumber;
        calculateProfileCompletion();
    }
    
    public void updateCareInfo(String preferredRegion, String careLevel, 
                              String specialNeeds, String familyVisitFrequency, String budgetRange) {
        this.preferredRegion = preferredRegion;
        this.careLevel = careLevel;
        this.specialNeeds = specialNeeds;
        this.familyVisitFrequency = familyVisitFrequency;
        this.budgetRange = budgetRange;
        calculateProfileCompletion();
    }
    
    private void calculateProfileCompletion() {
        int totalFields = 15;
        int completedFields = 0;
        
        if (birthDate != null) completedFields++;
        if (gender != null && !gender.trim().isEmpty()) completedFields++;
        if (address != null && !address.trim().isEmpty()) completedFields++;
        if (detailedAddress != null && !detailedAddress.trim().isEmpty()) completedFields++;
        if (postalCode != null && !postalCode.trim().isEmpty()) completedFields++;
        if (emergencyContactName != null && !emergencyContactName.trim().isEmpty()) completedFields++;
        if (emergencyContactPhone != null && !emergencyContactPhone.trim().isEmpty()) completedFields++;
        if (emergencyContactRelation != null && !emergencyContactRelation.trim().isEmpty()) completedFields++;
        if (healthInsuranceNumber != null && !healthInsuranceNumber.trim().isEmpty()) completedFields++;
        if (ltciGrade != null) completedFields++;
        if (ltciCertificateNumber != null && !ltciCertificateNumber.trim().isEmpty()) completedFields++;
        if (preferredRegion != null && !preferredRegion.trim().isEmpty()) completedFields++;
        if (careLevel != null && !careLevel.trim().isEmpty()) completedFields++;
        if (specialNeeds != null && !specialNeeds.trim().isEmpty()) completedFields++;
        if (budgetRange != null && !budgetRange.trim().isEmpty()) completedFields++;
        
        this.profileCompletionPercentage = Math.round((float) completedFields / totalFields * 100);
    }
    
    public boolean isProfileComplete() {
        return profileCompletionPercentage >= 80;
    }
    
    public boolean hasBasicInfo() {
        return birthDate != null && gender != null && address != null;
    }
    
    public boolean hasEmergencyContact() {
        return emergencyContactName != null && emergencyContactPhone != null;
    }
    
    public boolean hasHealthInfo() {
        return healthInsuranceNumber != null || ltciGrade != null;
    }
}