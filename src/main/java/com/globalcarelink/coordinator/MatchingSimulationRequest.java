package com.globalcarelink.coordinator;

import lombok.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingSimulationRequest {
    
    @Min(value = 1, message = "건강 평가 수는 1개 이상이어야 합니다")
    @Max(value = 10000, message = "건강 평가 수는 10,000개 이하여야 합니다")
    private Integer healthAssessmentCount;
    
    @Min(value = 1, message = "코디네이터 수는 1명 이상이어야 합니다")
    @Max(value = 1000, message = "코디네이터 수는 1,000명 이하여야 합니다")
    private Integer coordinatorCount;
    
    private String simulationType; // RANDOM, REALISTIC, STRESS_TEST
    
    @Builder.Default
    private Boolean includeLanguageMatching = true;
    
    @Builder.Default
    private Boolean includeSpecialtyMatching = true;
    
    @Builder.Default
    private Boolean includeWorkloadOptimization = true;
} 