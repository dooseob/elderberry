package com.globalcarelink.coordinator;

import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "coordinator_care_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CoordinatorCareSettings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "coordinator_id", nullable = false, length = 50, unique = true)
    @NotNull(message = "코디네이터 ID는 필수입니다")
    private String coordinatorId;

    @Column(name = "base_care_level")
    private Integer baseCareLevel;

    @Column(name = "max_care_level")
    private Integer maxCareLevel;

    @ElementCollection
    @CollectionTable(name = "coordinator_preferred_care_grades", 
                    joinColumns = @JoinColumn(name = "coordinator_care_settings_id"))
    @Column(name = "care_grade")
    private Set<Integer> preferredCareGrades;

    @ElementCollection
    @CollectionTable(name = "coordinator_excluded_care_grades", 
                    joinColumns = @JoinColumn(name = "coordinator_care_settings_id"))
    @Column(name = "care_grade")
    private Set<Integer> excludedCareGrades;

    @ElementCollection
    @CollectionTable(name = "coordinator_specialty_areas", 
                    joinColumns = @JoinColumn(name = "coordinator_care_settings_id"))
    @Column(name = "specialty_area")
    private Set<String> specialtyAreas;

    @Column(name = "max_simultaneous_cases")
    @Builder.Default
    private Integer maxSimultaneousCases = 5;

    @Column(name = "preferred_cases_per_month")
    @Builder.Default
    private Integer preferredCasesPerMonth = 10;

    @Column(name = "available_weekends")
    @Builder.Default
    private Boolean availableWeekends = true;

    @Column(name = "available_emergency")
    @Builder.Default
    private Boolean availableEmergency = false;

    @ElementCollection
    @CollectionTable(name = "coordinator_working_regions", 
                    joinColumns = @JoinColumn(name = "coordinator_care_settings_id"))
    @Column(name = "region")
    private Set<String> workingRegions;

    @Column(name = "performance_score")
    @Builder.Default
    private Double performanceScore = 3.0;

    @Column(name = "customer_satisfaction")
    @Builder.Default
    private Double customerSatisfaction = 3.0;

    @Column(name = "successful_cases")
    @Builder.Default
    private Integer successfulCases = 0;

    @Column(name = "total_cases")
    @Builder.Default
    private Integer totalCases = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    public boolean isEligibleForCareGrade(Integer careGrade) {
        if (!isActive) return false;
        if (excludedCareGrades != null && excludedCareGrades.contains(careGrade)) return false;
        if (preferredCareGrades != null && !preferredCareGrades.isEmpty()) {
            return preferredCareGrades.contains(careGrade);
        }
        return careGrade >= baseCareLevel && careGrade <= maxCareLevel;
    }

    public boolean hasSpecialty(String specialty) {
        return specialtyAreas != null && specialtyAreas.contains(specialty);
    }

    public double getSuccessRate() {
        if (totalCases == 0) return 0.0;
        return (double) successfulCases / totalCases;
    }

    public boolean canTakeNewCase() {
        return isActive && getCurrentActiveCases() < maxSimultaneousCases;
    }

    private int getCurrentActiveCases() {
        return 0;
    }

    @PrePersist
    @PreUpdate
    private void updateTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }
} 