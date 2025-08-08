package com.globalcarelink.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberStatusUpdateRequest {
    @NotNull(message = "활성 상태는 필수입니다")
    private Boolean isActive;
    
    private String reason; // 비활성화 사유
}