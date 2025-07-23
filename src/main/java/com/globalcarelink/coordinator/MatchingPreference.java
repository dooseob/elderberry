package com.globalcarelink.coordinator;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingPreference {
    
    private String preferredLanguage;
    private String preferredRegion;
    private Boolean needsWeekendAvailability;
    private Boolean needsEmergencyAvailability;
    private Double minCustomerSatisfaction;
    private Integer maxResults;
    private String countryCode;
    private Boolean needsProfessionalConsultation;
    

    
    public Integer getMaxResults() {
        return maxResults != null ? maxResults : 20;
    }
    
    public Double getMinCustomerSatisfaction() {
        return minCustomerSatisfaction != null ? minCustomerSatisfaction : 3.0;
    }
} 