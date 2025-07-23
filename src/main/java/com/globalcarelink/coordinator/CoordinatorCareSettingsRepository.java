package com.globalcarelink.coordinator;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 코디네이터 케어 설정 Repository
 * JPA N+1 문제 해결을 위한 @EntityGraph 적용
 */
@Repository
public interface CoordinatorCareSettingsRepository extends JpaRepository<CoordinatorCareSettings, Long> {

    /**
     * 코디네이터 ID로 조회 (언어 스킬 정보 함께 조회)
     * @EntityGraph로 N+1 문제 해결
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    Optional<CoordinatorCareSettings> findByCoordinatorId(String coordinatorId);

    /**
     * 활성 코디네이터 조회 (언어 스킬 정보 함께 조회)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    List<CoordinatorCareSettings> findByIsActiveTrueOrderByCustomerSatisfactionDesc();

    /**
     * 케어 등급 범위에 적합한 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND c.baseCareLevel <= :careGrade AND c.maxCareLevel >= :careGrade ORDER BY c.customerSatisfaction DESC, c.experienceYears DESC")
    List<CoordinatorCareSettings> findEligibleForCareGrade(@Param("careGrade") Integer careGrade);

    /**
     * 특정 지역에서 활동하는 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND :region MEMBER OF c.workingRegions ORDER BY c.customerSatisfaction DESC")
    List<CoordinatorCareSettings> findByWorkingRegionsContaining(@Param("region") String region);

    /**
     * 주말 근무 가능한 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    List<CoordinatorCareSettings> findByIsActiveTrueAndAvailableWeekendsTrue();

    /**
     * 응급 상황 대응 가능한 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    List<CoordinatorCareSettings> findByIsActiveTrueAndAvailableEmergencyTrue();

    /**
     * 특정 전문 분야 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND :specialty MEMBER OF c.specialtyAreas ORDER BY c.experienceYears DESC")
    List<CoordinatorCareSettings> findBySpecialtyAreasContaining(@Param("specialty") String specialty);

    /**
     * 고객 만족도 기준 이상 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND c.customerSatisfaction >= :minSatisfaction ORDER BY c.customerSatisfaction DESC")
    List<CoordinatorCareSettings> findByCustomerSatisfactionGreaterThanEqual(@Param("minSatisfaction") Double minSatisfaction);

    /**
     * 경력 기준 이상 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND c.experienceYears >= :minExperience ORDER BY c.experienceYears DESC")
    List<CoordinatorCareSettings> findByExperienceYearsGreaterThanEqual(@Param("minExperience") Integer minExperience);

    /**
     * 현재 케이스 수가 최대치 미만인 코디네이터 조회 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    @Query("SELECT c FROM CoordinatorCareSettings c WHERE c.isActive = true AND c.currentActiveCases < c.maxSimultaneousCases ORDER BY (CAST(c.currentActiveCases AS double) / c.maxSimultaneousCases) ASC")
    List<CoordinatorCareSettings> findAvailableCoordinators();

    /**
     * 복합 조건 매칭을 위한 고급 쿼리 (언어 스킬 포함)
     */
    @EntityGraph(attributePaths = {"languageSkills"})
    @Query("""
        SELECT c FROM CoordinatorCareSettings c 
        WHERE c.isActive = true 
        AND c.baseCareLevel <= :careGrade 
        AND c.maxCareLevel >= :careGrade
        AND c.customerSatisfaction >= :minSatisfaction
        AND c.currentActiveCases < c.maxSimultaneousCases
        AND (:region IS NULL OR :region MEMBER OF c.workingRegions)
        AND (:needsWeekend = false OR c.availableWeekends = true)
        AND (:needsEmergency = false OR c.availableEmergency = true)
        ORDER BY 
            c.customerSatisfaction DESC,
            (CAST(c.currentActiveCases AS double) / c.maxSimultaneousCases) ASC,
            c.experienceYears DESC
        """)
    List<CoordinatorCareSettings> findOptimalMatches(
        @Param("careGrade") Integer careGrade,
        @Param("minSatisfaction") Double minSatisfaction,
        @Param("region") String region,
        @Param("needsWeekend") Boolean needsWeekend,
        @Param("needsEmergency") Boolean needsEmergency
    );

    /**
     * 통계용 쿼리 - 활성 코디네이터 수
     */
    @Query("SELECT COUNT(c) FROM CoordinatorCareSettings c WHERE c.isActive = true")
    Long countActiveCoordinators();

    /**
     * 통계용 쿼리 - 평균 고객 만족도
     */
    @Query("SELECT AVG(c.customerSatisfaction) FROM CoordinatorCareSettings c WHERE c.isActive = true")
    Double findAverageCustomerSatisfaction();

    /**
     * 통계용 쿼리 - 지역별 코디네이터 분포
     */
    @Query(value = """
        SELECT region, COUNT(*) as coordinator_count
        FROM (
            SELECT unnest(working_regions) as region, coordinator_id
            FROM coordinator_care_settings 
            WHERE is_active = true
        ) regional_data
        GROUP BY region
        ORDER BY coordinator_count DESC
        """, nativeQuery = true)
    List<Object[]> findCoordinatorDistributionByRegion();

    /**
     * 통계용 쿼리 - 전문 분야별 코디네이터 분포
     */
    @Query(value = """
        SELECT specialty, COUNT(*) as coordinator_count
        FROM (
            SELECT unnest(specialty_areas) as specialty, coordinator_id
            FROM coordinator_care_settings 
            WHERE is_active = true
        ) specialty_data
        GROUP BY specialty
        ORDER BY coordinator_count DESC
        """, nativeQuery = true)
    List<Object[]> findCoordinatorDistributionBySpecialty();

    /**
     * 성능 최적화를 위한 인덱스 힌트가 포함된 쿼리
     */
    @Query(value = """
        SELECT c.* FROM coordinator_care_settings c
        WHERE c.is_active = true
        AND c.customer_satisfaction >= :minSatisfaction
        AND c.current_active_cases < c.max_simultaneous_cases
        ORDER BY c.customer_satisfaction DESC, c.experience_years DESC
        LIMIT :maxResults
        """, nativeQuery = true)
    List<CoordinatorCareSettings> findTopPerformers(
        @Param("minSatisfaction") Double minSatisfaction, 
        @Param("maxResults") Integer maxResults
    );

    /**
     * 배치 처리를 위한 ID 리스트 조회
     */
    @Query("SELECT c.coordinatorId FROM CoordinatorCareSettings c WHERE c.isActive = true")
    List<String> findAllActiveCoordinatorIds();

    /**
     * 캐시 무효화를 위한 마지막 업데이트 시간 조회
     */
    @Query("SELECT MAX(c.updatedAt) FROM CoordinatorCareSettings c")
    java.time.LocalDateTime findLastUpdateTime();
} 