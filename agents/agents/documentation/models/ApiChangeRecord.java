package com.globalcarelink.agents.documentation.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * API 변경 기록 모델
 */
@Data
@Builder
public class ApiChangeRecord {
    private String changeId;
    private String endpointId;
    private ApiChangeType changeType;
    private String description;
    private LocalDateTime timestamp;
    private String detectedBy;
    private String version;
    private boolean isBreakingChange;
    private String impact; // "LOW", "MEDIUM", "HIGH", "CRITICAL"
}

enum ApiChangeType {
    ADDED, MODIFIED, DEPRECATED, REMOVED, SECURITY_UPDATED
}