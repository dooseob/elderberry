package com.globalcarelink.job.dto;

import com.globalcarelink.job.JobApplication;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;

import java.time.LocalDateTime;

/**
 * 면접 일정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScheduleRequest {
    
    @NotNull(message = "면접 일시는 필수입니다")
    @Future(message = "면접 일시는 미래 시간이어야 합니다")
    private LocalDateTime dateTime;
    
    @NotBlank(message = "면접 장소는 필수입니다")
    @Size(min = 5, max = 200, message = "면접 장소는 5자 이상 200자 이하로 입력해주세요")
    private String location;
    
    @NotNull(message = "면접 유형은 필수입니다")
    private JobApplication.InterviewType interviewType;
}