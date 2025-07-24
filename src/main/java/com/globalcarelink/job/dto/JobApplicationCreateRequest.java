package com.globalcarelink.job.dto;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 구직 지원서 생성 요청 DTO
 * 구직 지원 시 클라이언트로부터 받는 데이터 구조
 */
@Data
public class JobApplicationCreateRequest {
    
    @NotBlank(message = "자기소개서는 필수입니다")
    @Size(max = 2000, message = "자기소개서는 2000자를 초과할 수 없습니다")
    private String coverLetter;
    
    @Size(max = 255, message = "이력서 파일명은 255자를 초과할 수 없습니다")
    private String resumeFileName;
    
    @Size(max = 500, message = "이력서 파일 URL은 500자를 초과할 수 없습니다")
    private String resumeFileUrl;
    
    @Pattern(regexp = "^[0-9-+()\\s]+$", message = "유효하지 않은 전화번호 형식입니다")
    @Size(max = 20, message = "연락처는 20자를 초과할 수 없습니다")
    private String contactPhone;
    
    @Email(message = "유효하지 않은 이메일 형식입니다")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다")
    private String contactEmail;
    
    @Min(value = 0, message = "경력년수는 0 이상이어야 합니다")
    @Max(value = 50, message = "경력년수는 50년을 초과할 수 없습니다")
    private Integer experienceYears;
    
    @Size(max = 100, message = "학력은 100자를 초과할 수 없습니다")
    private String educationLevel;
    
    @Size(max = 500, message = "자격증은 500자를 초과할 수 없습니다")
    private String certifications;
    
    @Future(message = "희망 입사일은 미래 날짜여야 합니다")
    private LocalDate preferredStartDate;
    
    @DecimalMin(value = "0.0", message = "희망 급여는 0 이상이어야 합니다")
    private BigDecimal expectedSalary;
    
    @Size(max = 1000, message = "추가 정보는 1000자를 초과할 수 없습니다")
    private String additionalInfo;
}