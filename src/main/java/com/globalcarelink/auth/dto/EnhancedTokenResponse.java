package com.globalcarelink.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * 향상된 토큰 응답 DTO
 * 액세스 토큰과 리프레시 토큰 정보를 포함
 */
@Getter
@Builder
@ToString
public class EnhancedTokenResponse {
    
    /**
     * 액세스 토큰
     */
    private final String accessToken;
    
    /**
     * 리프레시 토큰
     */
    private final String refreshToken;
    
    /**
     * 토큰 타입 (Bearer)
     */
    private final String tokenType;
    
    /**
     * 액세스 토큰 만료 시간
     */
    private final LocalDateTime accessTokenExpiresAt;
    
    /**
     * 리프레시 토큰 만료 시간
     */
    private final LocalDateTime refreshTokenExpiresAt;
    
    /**
     * 사용자 이메일
     */
    private final String email;
    
    /**
     * 액세스 토큰 유효 기간 (초)
     */
    public long getAccessTokenExpiresIn() {
        if (accessTokenExpiresAt == null) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), accessTokenExpiresAt).getSeconds();
    }
    
    /**
     * 리프레시 토큰 유효 기간 (초)
     */
    public long getRefreshTokenExpiresIn() {
        if (refreshTokenExpiresAt == null) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), refreshTokenExpiresAt).getSeconds();
    }
} 