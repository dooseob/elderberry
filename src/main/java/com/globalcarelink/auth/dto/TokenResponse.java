package com.globalcarelink.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponse {
    
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private MemberResponse member;
    
    public static TokenResponse of(String accessToken, Long expiresIn, MemberResponse member) {
        return TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .member(member)
                .build();
    }
}