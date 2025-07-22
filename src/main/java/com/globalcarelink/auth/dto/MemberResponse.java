package com.globalcarelink.auth.dto;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberResponse {
    
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private MemberRole role;
    private Boolean isJobSeeker;
    private Boolean isActive;
    private String language;
    private String region;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .phoneNumber(member.getPhoneNumber())
                .role(member.getRole())
                .isJobSeeker(member.getIsJobSeeker())
                .isActive(member.getIsActive())
                .language(member.getLanguage())
                .region(member.getRegion())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}