package com.globalcarelink.job.dto;

import com.globalcarelink.job.Job;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 구인 공고 응답 DTO
 * 클라이언트에게 전송할 구인 공고 데이터 구조
 * 프레젠테이션 로직을 포함하여 엔티티와 분리
 */
@Data
public class JobResponse {
    
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String workLocation;
    private String detailAddress;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Job.JobCategory category;
    private String categoryDisplayName;
    private Job.SalaryType salaryType;
    private String salaryTypeDisplayName;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String salaryRange; // 프레젠테이션 로직
    private Job.ExperienceLevel experienceLevel;
    private String experienceLevelDisplayName;
    private Integer minExperienceYears;
    private Job.WorkType workType;
    private String workTypeDisplayName;
    private String workHours;
    private Integer recruitCount;
    private LocalDate applicationDeadline;
    private String preferredQualifications;
    private String benefits;
    private String contactPhone;
    private String contactEmail;
    private String contactPerson;
    private Long viewCount;
    private Job.JobStatus status;
    private String statusDisplayName;
    private Boolean isUrgent;
    private Boolean isFeatured;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    
    // 계산된 필드들 (프레젠테이션 로직)
    private Integer applicationCount;
    private Boolean isDeadlineApproaching;
    private Boolean isExpired;
    private Boolean isActive;
    
    /**
     * Job 엔티티를 JobResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static JobResponse from(Job job) {
        JobResponse response = new JobResponse();
        
        // 기본 필드 매핑
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setDescription(job.getDescription());
        response.setCompanyName(job.getCompanyName());
        response.setWorkLocation(job.getWorkLocation());
        response.setDetailAddress(job.getDetailAddress());
        response.setLatitude(job.getLatitude());
        response.setLongitude(job.getLongitude());
        response.setCategory(job.getCategory());
        response.setCategoryDisplayName(job.getCategory() != null ? job.getCategory().getDisplayName() : null);
        response.setSalaryType(job.getSalaryType());
        response.setSalaryTypeDisplayName(job.getSalaryType() != null ? job.getSalaryType().getDisplayName() : null);
        response.setMinSalary(job.getMinSalary());
        response.setMaxSalary(job.getMaxSalary());
        response.setExperienceLevel(job.getExperienceLevel());
        response.setExperienceLevelDisplayName(job.getExperienceLevel() != null ? job.getExperienceLevel().getDisplayName() : null);
        response.setMinExperienceYears(job.getMinExperienceYears());
        response.setWorkType(job.getWorkType());
        response.setWorkTypeDisplayName(job.getWorkType() != null ? job.getWorkType().getDisplayName() : null);
        response.setWorkHours(job.getWorkHours());
        response.setRecruitCount(job.getRecruitCount());
        response.setApplicationDeadline(job.getApplicationDeadline());
        response.setPreferredQualifications(job.getPreferredQualifications());
        response.setBenefits(job.getBenefits());
        response.setContactPhone(job.getContactPhone());
        response.setContactEmail(job.getContactEmail());
        response.setContactPerson(job.getContactPerson());
        response.setViewCount(job.getViewCount());
        response.setStatus(job.getStatus());
        response.setStatusDisplayName(job.getStatus() != null ? job.getStatus().getDisplayName() : null);
        response.setIsUrgent(job.getIsUrgent());
        response.setIsFeatured(job.getIsFeatured());
        response.setCreatedDate(job.getCreatedDate());
        response.setLastModifiedDate(job.getLastModifiedDate());
        
        // 프레젠테이션 로직 적용 (엔티티에서 DTO로 이동)
        response.setSalaryRange(formatSalaryRange(job.getSalaryType(), job.getMinSalary(), job.getMaxSalary()));
        response.setApplicationCount(calculateApplicationCount(job));
        response.setIsDeadlineApproaching(calculateDeadlineApproaching(job));
        response.setIsExpired(calculateExpired(job));
        response.setIsActive(job.getStatus() == Job.JobStatus.ACTIVE);
        
        return response;
    }
    
    /**
     * 지원자 수 계산 (엔티티에서 DTO로 이동)
     */
    private static Integer calculateApplicationCount(Job job) {
        return job.getApplications() != null ? job.getApplications().size() : 0;
    }
    
    /**
     * 마감일 임박 여부 확인 (엔티티에서 DTO로 이동)
     */
    private static Boolean calculateDeadlineApproaching(Job job) {
        return job.getApplicationDeadline() != null && 
               LocalDate.now().plusDays(3).isAfter(job.getApplicationDeadline());
    }
    
    /**
     * 마감일 지남 여부 확인 (엔티티에서 DTO로 이동)
     */
    private static Boolean calculateExpired(Job job) {
        return job.getApplicationDeadline() != null && 
               LocalDate.now().isAfter(job.getApplicationDeadline());
    }
    
    /**
     * 급여 범위 포맷팅 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static String formatSalaryRange(Job.SalaryType salaryType, BigDecimal minSalary, BigDecimal maxSalary) {
        if (salaryType == Job.SalaryType.NEGOTIABLE) {
            return "협의";
        }
        
        StringBuilder sb = new StringBuilder();
        if (minSalary != null) {
            sb.append(String.format("%,.0f", minSalary));
        }
        if (maxSalary != null && !maxSalary.equals(minSalary)) {
            if (minSalary != null) {
                sb.append(" ~ ");
            }
            sb.append(String.format("%,.0f", maxSalary));
        }
        sb.append("원");
        if (salaryType != null) {
            sb.append(" (").append(salaryType.getDisplayName()).append(")");
        }
        
        return sb.toString();
    }
}