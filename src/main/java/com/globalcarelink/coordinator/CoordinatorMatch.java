package com.globalcarelink.coordinator;

import lombok.*;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoordinatorMatch {
    
    private String coordinatorId;
    private String name;
    private Double matchScore;
    private String matchReason;
    private Integer experienceYears;
    private Integer successfulCases;
    private Double customerSatisfaction;
    private Set<String> specialtyAreas;
    private Set<Integer> compatibleCareGrades;
    private List<CoordinatorLanguageSkill> languageSkills;
    private Boolean availableWeekends;
    private Boolean availableEmergency;
    private Set<String> workingRegions;
    private Integer currentActiveCases;
    private Integer maxSimultaneousCases;
    private Double workloadRatio;
    
    public boolean isAvailable() {
        return currentActiveCases < maxSimultaneousCases;
    }
    
    public String getAvailabilityStatus() {
        if (workloadRatio >= 1.0) return "포화 상태";
        if (workloadRatio >= 0.8) return "거의 포화";
        if (workloadRatio >= 0.6) return "적정 수준";
        if (workloadRatio >= 0.4) return "여유 있음";
        return "매우 여유";
    }
    
    public String getExperienceLevel() {
        if (experienceYears >= 10) return "최고 전문가";
        if (experienceYears >= 5) return "숙련 전문가";
        if (experienceYears >= 2) return "경력자";
        return "신입";
    }
    
    public String getSatisfactionLevel() {
        if (customerSatisfaction >= 4.5) return "최우수";
        if (customerSatisfaction >= 4.0) return "우수";
        if (customerSatisfaction >= 3.5) return "양호";
        return "보통";
    }
} 