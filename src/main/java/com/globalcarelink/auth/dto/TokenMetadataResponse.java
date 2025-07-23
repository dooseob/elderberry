package com.globalcarelink.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * 토큰 메타데이터 응답 DTO
 */
@Getter
@Builder
@ToString
public class TokenMetadataResponse {
    
    /**
     * 토큰 ID
     */
    private final String tokenId;
    
    /**
     * 토큰 타입 (ACCESS, REFRESH)
     */
    private final String type;
    
    /**
     * 토큰 발급 시간
     */
    private final LocalDateTime issuedAt;
    
    /**
     * 토큰 만료 시간
     */
    private final LocalDateTime expiresAt;
    
    /**
     * 발급 IP 주소
     */
    private final String ipAddress;
    
    /**
     * User-Agent 정보
     */
    private final String userAgent;
    
    /**
     * 토큰 만료까지 남은 시간 (초)
     */
    public long getExpiresIn() {
        if (expiresAt == null) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).getSeconds();
    }
    
    /**
     * 토큰이 만료되었는지 확인
     */
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }
} 