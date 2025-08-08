package com.globalcarelink.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CacheManagementRequest {
    @NotBlank(message = "작업 타입은 필수입니다")
    private String action; // CLEAR_ALL, CLEAR_BY_PATTERN, FLUSH_DB
    
    private String pattern; // Redis 키 패턴 (예: "facility:*")
    
    private String reason; // 캐시 관리 사유
}