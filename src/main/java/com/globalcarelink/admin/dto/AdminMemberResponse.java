package com.globalcarelink.admin.dto;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminMemberResponse {
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private MemberRole role;
    private Boolean isJobSeeker;
    private Boolean isActive;
    private Boolean emailVerified;
    private String language;
    private String region;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    
    public static AdminMemberResponse from(Member member) {
        return AdminMemberResponse.builder()
            .id(member.getId())
            .email(member.getEmail())
            .name(member.getName())
            .phoneNumber(member.getPhoneNumber())
            .role(member.getRole())
            .isJobSeeker(member.getIsJobSeeker())
            .isActive(member.getIsActive())
            .emailVerified(member.getEmailVerified())
            .language(member.getLanguage())
            .region(member.getRegion())
            .createdAt(member.getCreatedAt())
            .lastLoginAt(null) // TODO: 추후 로그인 추적 기능 추가 시 구현
            .build();
    }
}