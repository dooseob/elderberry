package com.globalcarelink.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewVisibilityUpdateRequest {
    @NotNull(message = "숨김 상태는 필수입니다")
    private Boolean isHidden;
    
    private String reason; // 숨김/표시 사유
}