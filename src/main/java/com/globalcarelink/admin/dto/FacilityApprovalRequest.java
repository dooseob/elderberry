package com.globalcarelink.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FacilityApprovalRequest {
    @NotNull(message = "승인 상태는 필수입니다")
    private String approvalStatus; // APPROVED, REJECTED
    
    private String reason; // 승인/거부 사유
}