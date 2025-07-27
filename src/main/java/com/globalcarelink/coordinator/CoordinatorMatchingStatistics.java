package com.globalcarelink.coordinator;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoordinatorMatchingStatistics {
    
    private Long totalActiveCoordinators;
    private Double averageCustomerSatisfaction;
    private Integer availableCoordinators;
    private Long totalSuccessfulMatches;
    private Double overallMatchingSuccessRate;
    private Double averageResponseTime;
    private List<Object[]> regionDistribution;
    private List<Object[]> specialtyDistribution;
    
    public String getSatisfactionLevel() {
        if (averageCustomerSatisfaction == null) return "데이터 없음";
        if (averageCustomerSatisfaction >= 4.5) return "최우수";
        if (averageCustomerSatisfaction >= 4.0) return "우수";
        if (averageCustomerSatisfaction >= 3.5) return "양호";
        return "보통";
    }
    
    public double getAvailabilityRate() {
        if (totalActiveCoordinators == null || totalActiveCoordinators == 0) return 0.0;
        return (double) availableCoordinators / totalActiveCoordinators * 100.0;
    }
} 