package com.globalcarelink.coordinator;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingSimulationResult {
    
    private Integer totalHealthAssessments;
    private Integer totalCoordinators;
    private Integer successfulMatches;
    private Integer failedMatches;
    private Double averageMatchingScore;
    private Double matchingSuccessRate;
    private Long executionTimeMs;
    
    @Builder.Default
    private LocalDateTime simulationTime = LocalDateTime.now();
    
    public Integer getFailedMatches() {
        if (failedMatches != null) return failedMatches;
        return totalHealthAssessments - successfulMatches;
    }
    
    public String getPerformanceLevel() {
        if (executionTimeMs == null) return "측정 불가";
        if (executionTimeMs < 1000) return "매우 빠름";
        if (executionTimeMs < 5000) return "빠름";
        if (executionTimeMs < 10000) return "보통";
        return "느림";
    }
    
    public String getSuccessRateLevel() {
        if (matchingSuccessRate == null) return "측정 불가";
        if (matchingSuccessRate >= 90) return "우수";
        if (matchingSuccessRate >= 80) return "양호";
        if (matchingSuccessRate >= 70) return "보통";
        return "개선 필요";
    }
} 