package com.globalcarelink.job.dto;

import com.globalcarelink.job.JobApplication;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 지원서 상태 업데이트 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusUpdateRequest {
    
    @NotNull(message = "지원서 상태는 필수입니다")
    private JobApplication.ApplicationStatus status;
    
    @Size(max = 1000, message = "고용주 메모는 1000자를 초과할 수 없습니다")
    private String employerNotes;
}