package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 프로필 공통 필드를 관리하는 추상 클래스
 * DRY 원칙 적용으로 코드 중복 제거
 */
@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseProfile {

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @NotNull(message = "회원 정보는 필수입니다")
    protected Member member;

    @Column(name = "birth_date")
    protected LocalDate birthDate;

    @Column(name = "gender", length = 10)
    @Pattern(regexp = "^(MALE|FEMALE|M|F)$", message = "성별은 MALE, FEMALE, M, F 중 하나여야 합니다")
    protected String gender;

    @Column(name = "address", length = 200)
    @Size(max = 200, message = "주소는 200자 이하여야 합니다")
    protected String address;

    @Column(name = "detailed_address", length = 200)
    @Size(max = 200, message = "상세주소는 200자 이하여야 합니다")
    protected String detailedAddress;

    @Column(name = "postal_code", length = 20)
    @Size(max = 20, message = "우편번호는 20자 이하여야 합니다")
    protected String postalCode;

    @Column(name = "emergency_contact_name", length = 50)
    @Size(max = 50, message = "비상연락처 이름은 50자 이하여야 합니다")
    protected String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    @Pattern(regexp = "^[0-9\\-+\\s()]*$", message = "유효하지 않은 전화번호 형식입니다")
    protected String emergencyContactPhone;

    @Column(name = "emergency_contact_relation", length = 30)
    @Size(max = 30, message = "비상연락처 관계는 30자 이하여야 합니다")
    protected String emergencyContactRelation;

    @Column(name = "care_level", length = 50)
    @Size(max = 50, message = "케어 수준은 50자 이하여야 합니다")
    protected String careLevel;

    @Column(name = "special_needs", columnDefinition = "TEXT")
    protected String specialNeeds;

    @Column(name = "budget_range", length = 50)
    @Size(max = 50, message = "예산 범위는 50자 이하여야 합니다")
    protected String budgetRange;

    @Column(name = "profile_completion_percentage", nullable = false)
    protected Integer profileCompletionPercentage = 0;

    /**
     * 기본 정보 업데이트 (공통 메서드)
     */
    public void updateBasicInfo(LocalDate birthDate, String gender, String address, 
                               String detailedAddress, String postalCode) {
        if (birthDate != null) {
            this.birthDate = birthDate;
        }
        if (gender != null && !gender.trim().isEmpty()) {
            this.gender = gender;
        }
        if (address != null && !address.trim().isEmpty()) {
            this.address = address;
        }
        if (detailedAddress != null && !detailedAddress.trim().isEmpty()) {
            this.detailedAddress = detailedAddress;
        }
        if (postalCode != null && !postalCode.trim().isEmpty()) {
            this.postalCode = postalCode;
        }
        
        updateCompletionPercentage();
    }

    /**
     * 비상연락처 정보 업데이트 (공통 메서드)
     */
    public void updateEmergencyContact(String name, String phone, String relation) {
        if (name != null && !name.trim().isEmpty()) {
            this.emergencyContactName = name;
        }
        if (phone != null && !phone.trim().isEmpty()) {
            this.emergencyContactPhone = phone;
        }
        if (relation != null && !relation.trim().isEmpty()) {
            this.emergencyContactRelation = relation;
        }
        
        updateCompletionPercentage();
    }

    /**
     * 케어 관련 정보 업데이트 (공통 메서드)
     */
    public void updateCareInfo(String careLevel, String specialNeeds, String budgetRange) {
        if (careLevel != null && !careLevel.trim().isEmpty()) {
            this.careLevel = careLevel;
        }
        if (specialNeeds != null && !specialNeeds.trim().isEmpty()) {
            this.specialNeeds = specialNeeds;
        }
        if (budgetRange != null && !budgetRange.trim().isEmpty()) {
            this.budgetRange = budgetRange;
        }
        
        updateCompletionPercentage();
    }

    /**
     * 프로필 완성도 계산 (추상 메서드 - 각 프로필 타입별로 구현)
     */
    protected abstract void updateCompletionPercentage();

    /**
     * 공통 필드 완성도 계산 헬퍼 메서드
     */
    protected int calculateCommonFieldsCompletion() {
        int totalCommonFields = 11; // 공통 필드 개수
        int completedFields = 0;
        
        if (birthDate != null) completedFields++;
        if (gender != null && !gender.trim().isEmpty()) completedFields++;
        if (address != null && !address.trim().isEmpty()) completedFields++;
        if (detailedAddress != null && !detailedAddress.trim().isEmpty()) completedFields++;
        if (postalCode != null && !postalCode.trim().isEmpty()) completedFields++;
        if (emergencyContactName != null && !emergencyContactName.trim().isEmpty()) completedFields++;
        if (emergencyContactPhone != null && !emergencyContactPhone.trim().isEmpty()) completedFields++;
        if (emergencyContactRelation != null && !emergencyContactRelation.trim().isEmpty()) completedFields++;
        if (careLevel != null && !careLevel.trim().isEmpty()) completedFields++;
        if (specialNeeds != null && !specialNeeds.trim().isEmpty()) completedFields++;
        if (budgetRange != null && !budgetRange.trim().isEmpty()) completedFields++;
        
        return (int) Math.round((double) completedFields / totalCommonFields * 100);
    }

    /**
     * 필수 정보 완성 여부 확인
     */
    public boolean hasEssentialInfo() {
        return birthDate != null && 
               gender != null && !gender.trim().isEmpty() &&
               address != null && !address.trim().isEmpty() &&
               emergencyContactName != null && !emergencyContactName.trim().isEmpty() &&
               emergencyContactPhone != null && !emergencyContactPhone.trim().isEmpty();
    }

    /**
     * 나이 계산
     */
    public Integer getAge() {
        if (birthDate == null) {
            return null;
        }
        return LocalDate.now().getYear() - birthDate.getYear();
    }

    /**
     * 프로필 타입 반환 (추상 메서드)
     */
    public abstract String getProfileType();

    /**
     * 프로필 요약 정보 생성
     */
    public String getProfileSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("프로필 타입: ").append(getProfileType()).append("\n");
        
        if (getAge() != null) {
            summary.append("나이: ").append(getAge()).append("세\n");
        }
        if (gender != null) {
            summary.append("성별: ").append(gender).append("\n");
        }
        if (address != null) {
            summary.append("주소: ").append(address).append("\n");
        }
        if (careLevel != null) {
            summary.append("케어 수준: ").append(careLevel).append("\n");
        }
        
        summary.append("완성도: ").append(profileCompletionPercentage).append("%");
        
        return summary.toString();
    }
} 