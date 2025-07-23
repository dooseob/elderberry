package com.globalcarelink.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 리프레시 토큰 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class RefreshTokenRequest {
    
    /**
     * 리프레시 토큰
     */
    @NotBlank(message = "리프레시 토큰은 필수입니다")
    private String refreshToken;
} 