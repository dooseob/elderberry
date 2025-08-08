package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SystemHealthResponse {
    private String overallStatus; // UP, DOWN, WARNING
    
    // 데이터베이스 상태
    private String databaseStatus;
    private Long databaseConnections;
    private Double databaseResponseTime;
    
    // Redis 상태
    private String redisStatus;
    private Long redisConnections;
    private Long redisMemoryUsage;
    
    // 시스템 리소스
    private Double cpuUsage;
    private Double memoryUsage;
    private Long diskUsage;
    private Long diskTotal;
    
    // 외부 API 상태
    private String publicApiStatus;
    private Double publicApiResponseTime;
    
    private LocalDateTime lastChecked;
}