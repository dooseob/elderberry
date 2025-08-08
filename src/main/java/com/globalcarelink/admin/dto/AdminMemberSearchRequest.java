package com.globalcarelink.admin.dto;

import com.globalcarelink.auth.MemberRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminMemberSearchRequest {
    private MemberRole role;
    private Boolean isActive;
    private Boolean emailVerified;
    private String search; // 이름, 이메일 검색
}