package com.globalcarelink.admin.dto;

import com.globalcarelink.auth.MemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberRoleUpdateRequest {
    @NotNull(message = "회원 역할은 필수입니다")
    private MemberRole role;
    
    private String reason; // 역할 변경 사유
}