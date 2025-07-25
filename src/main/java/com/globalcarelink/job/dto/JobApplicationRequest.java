package com.globalcarelink.job.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

/**
 * 채용 지원 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationRequest {
    
    @NotBlank(message = "자기소개서는 필수입니다")
    @Size(min = 50, max = 2000, message = "자기소개서는 50자 이상 2000자 이하로 작성해주세요")
    private String coverLetter;
    
    @Size(max = 100, message = "이력서 파일명은 100자를 초과할 수 없습니다")
    private String resumeFileName;
    
    @Size(max = 500, message = "이력서 파일 경로는 500자를 초과할 수 없습니다")
    private String resumeFilePath;
    
    @Pattern(regexp = "^[0-9,]+$", message = "희망 급여는 숫자와 쉼표만 입력 가능합니다")
    private String expectedSalary;
    
    @Size(max = 1000, message = "지원자 메모는 1000자를 초과할 수 없습니다")
    private String applicantNotes;
    
    @NotBlank(message = "연락처는 필수입니다")
    @Pattern(regexp = "^01(?:0|1|[6-9])-(?:\\d{3}|\\d{4})-\\d{4}$", 
             message = "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)")
    private String contactPhone;
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다")
    private String contactEmail;
}