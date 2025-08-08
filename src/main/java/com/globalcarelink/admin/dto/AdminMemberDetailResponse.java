package com.globalcarelink.admin.dto;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminMemberDetailResponse {
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
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    
    // 관련 통계
    private Long postsCount;
    private Long reviewsCount;
    private Long facilitiesCount; // 시설 회원인 경우
    
    public static AdminMemberDetailResponse from(Member member) {
        return AdminMemberDetailResponse.builder()
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
            .updatedAt(member.getUpdatedAt())
            .lastLoginAt(null) // TODO: 추후 로그인 추적 기능 추가 시 구현
            .postsCount(0L) // TODO: 게시글 수 계산
            .reviewsCount(0L) // TODO: 리뷰 수 계산
            .facilitiesCount(0L) // TODO: 시설 수 계산
            .build();
    }
}