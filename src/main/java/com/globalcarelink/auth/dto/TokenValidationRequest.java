package com.globalcarelink.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 토큰 유효성 검증 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class TokenValidationRequest {
    
    /**
     * 검증할 토큰
     */
    @NotBlank(message = "토큰은 필수입니다")
    private String token;
} 