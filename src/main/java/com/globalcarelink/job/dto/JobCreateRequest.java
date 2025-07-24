package com.globalcarelink.job.dto;

import com.globalcarelink.job.Job;
import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 구인 공고 생성 요청 DTO
 * 구인 공고 등록 시 클라이언트로부터 받는 데이터 구조
 */
@Data
public class JobCreateRequest {
    
    @NotBlank(message = "공고 제목은 필수입니다")
    @Size(max = 200, message = "공고 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @NotBlank(message = "공고 내용은 필수입니다")
    @Size(max = 5000, message = "공고 내용은 5000자를 초과할 수 없습니다")
    private String description;
    
    @NotBlank(message = "회사명은 필수입니다")
    @Size(max = 100, message = "회사명은 100자를 초과할 수 없습니다")
    private String companyName;
    
    @NotBlank(message = "근무 지역은 필수입니다")
    @Size(max = 100, message = "근무 지역은 100자를 초과할 수 없습니다")
    private String workLocation;
    
    @Size(max = 200, message = "상세 주소는 200자를 초과할 수 없습니다")
    private String detailAddress;
    
    @DecimalMin(value = "-90.0", message = "유효하지 않은 위도입니다")
    @DecimalMax(value = "90.0", message = "유효하지 않은 위도입니다")
    private BigDecimal latitude;
    
    @DecimalMin(value = "-180.0", message = "유효하지 않은 경도입니다")
    @DecimalMax(value = "180.0", message = "유효하지 않은 경도입니다")
    private BigDecimal longitude;
    
    @NotNull(message = "직종 카테고리는 필수입니다")
    private Job.JobCategory category;
    
    @NotNull(message = "급여 유형은 필수입니다")
    private Job.SalaryType salaryType;
    
    @NotNull(message = "최소 급여는 필수입니다")
    @DecimalMin(value = "0.0", message = "급여는 0 이상이어야 합니다")
    private BigDecimal minSalary;
    
    @DecimalMin(value = "0.0", message = "급여는 0 이상이어야 합니다")
    private BigDecimal maxSalary;
    
    @NotNull(message = "경력 수준은 필수입니다")
    private Job.ExperienceLevel experienceLevel;
    
    @Min(value = 0, message = "최소 경력년수는 0 이상이어야 합니다")
    @Max(value = 50, message = "최소 경력년수는 50년을 초과할 수 없습니다")
    private Integer minExperienceYears;
    
    @NotNull(message = "근무 형태는 필수입니다")
    private Job.WorkType workType;
    
    @Size(max = 100, message = "근무 시간은 100자를 초과할 수 없습니다")
    private String workHours;
    
    @Min(value = 1, message = "모집 인원은 1명 이상이어야 합니다")
    @Max(value = 999, message = "모집 인원은 999명을 초과할 수 없습니다")
    private Integer recruitCount = 1;
    
    @Future(message = "지원 마감일은 미래 날짜여야 합니다")
    private LocalDate applicationDeadline;
    
    @Size(max = 1000, message = "우대 사항은 1000자를 초과할 수 없습니다")
    private String preferredQualifications;
    
    @Size(max = 1000, message = "복리후생은 1000자를 초과할 수 없습니다")
    private String benefits;
    
    @Pattern(regexp = "^[0-9-+()\\s]+$", message = "유효하지 않은 전화번호 형식입니다")
    @Size(max = 20, message = "연락처는 20자를 초과할 수 없습니다")
    private String contactPhone;
    
    @Email(message = "유효하지 않은 이메일 형식입니다")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다")
    private String contactEmail;
    
    @Size(max = 50, message = "담당자명은 50자를 초과할 수 없습니다")
    private String contactPerson;
    
    private Boolean isUrgent = false;
}