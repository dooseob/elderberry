package com.globalcarelink.profile.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * 프로필 요청 기본 클래스
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseProfileRequest {
    
    // 기본 개인정보
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;
    
    @NotNull(message = "생년월일은 필수입니다")
    @Past(message = "생년월일은 과거 날짜여야 합니다")
    private LocalDate birthDate;
    
    @NotBlank(message = "성별은 필수입니다")
    @Pattern(regexp = "^(MALE|FEMALE)$", message = "성별은 MALE 또는 FEMALE이어야 합니다")
    private String gender;
    
    // 연락처 정보
    @Pattern(regexp = "^[0-9-]+$", message = "전화번호는 숫자와 하이픈만 포함해야 합니다")
    private String phoneNumber;
    
    @Email(message = "올바른 이메일 형식이어야 합니다")
    private String email;
    
    // 주소 정보
    @NotBlank(message = "주소는 필수입니다")
    @Size(max = 200, message = "주소는 200자 이하여야 합니다")
    private String address;
    
    @Size(max = 100, message = "상세 주소는 100자 이하여야 합니다")
    private String detailedAddress;
    
    // 긴급 연락처
    @Size(max = 50, message = "긴급 연락처 이름은 50자 이하여야 합니다")
    private String emergencyContactName;
    
    @Pattern(regexp = "^[0-9-]+$", message = "긴급 연락처는 숫자와 하이픈만 포함해야 합니다")
    private String emergencyContactPhone;
    
    @Size(max = 50, message = "긴급 연락처 관계는 50자 이하여야 합니다")
    private String emergencyContactRelation;
} 