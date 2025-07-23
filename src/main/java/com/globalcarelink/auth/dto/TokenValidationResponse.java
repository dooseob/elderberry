package com.globalcarelink.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

/**
 * 토큰 유효성 검증 응답 DTO
 */
@Getter
@Builder
@ToString
public class TokenValidationResponse {
    
    /**
     * 토큰 유효성 여부
     */
    private final boolean valid;
    
    /**
     * 토큰에서 추출한 이메일 (유효한 경우)
     */
    private final String email;
    
    /**
     * 오류 메시지 (유효하지 않은 경우)
     */
    private final String error;
} 