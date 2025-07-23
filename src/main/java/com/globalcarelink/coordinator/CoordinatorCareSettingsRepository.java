package com.globalcarelink.coordinator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoordinatorCareSettingsRepository extends JpaRepository<CoordinatorCareSettings, Long> {

    Optional<CoordinatorCareSettings> findByCoordinatorIdAndIsActiveTrue(String coordinatorId);

    List<CoordinatorCareSettings> findByIsActiveTrueOrderByPerformanceScoreDesc();

    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND " +
           "c.maxSimultaneousCases > (SELECT COUNT(cc) FROM CoordinatorCase cc WHERE cc.coordinatorId = c.coordinatorId AND cc.status = 'ACTIVE')")
    List<CoordinatorCareSettings> findAvailableCoordinators();

    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND " +
           ":careGrade MEMBER OF c.preferredCareGrades OR " +
           "(:careGrade >= c.baseCareLevel AND :careGrade <= c.maxCareLevel AND :careGrade NOT IN (SELECT e FROM c.excludedCareGrades e))")
    List<CoordinatorCareSettings> findEligibleForCareGrade(@Param("careGrade") Integer careGrade);

    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND " +
           ":specialty MEMBER OF c.specialtyAreas")
    List<CoordinatorCareSettings> findBySpecialty(@Param("specialty") String specialty);

    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND " +
           "c.customerSatisfaction >= :minSatisfaction")
    List<CoordinatorCareSettings> findByMinSatisfaction(@Param("minSatisfaction") Double minSatisfaction);

    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND " +
           ":region MEMBER OF c.workingRegions")
    List<CoordinatorCareSettings> findByWorkingRegion(@Param("region") String region);

    List<CoordinatorCareSettings> findByAvailableWeekendsAndIsActiveTrue(Boolean availableWeekends);

    List<CoordinatorCareSettings> findByAvailableEmergencyAndIsActiveTrue(Boolean availableEmergency);

    @Query("SELECT AVG(c.customerSatisfaction) FROM CoordinatorCareSettings c WHERE c.isActive = true")
    Double getAverageCustomerSatisfaction();

    @Query("SELECT COUNT(c) FROM CoordinatorCareSettings c WHERE c.isActive = true")
    Long getActiveCoordinatorCount();
} 