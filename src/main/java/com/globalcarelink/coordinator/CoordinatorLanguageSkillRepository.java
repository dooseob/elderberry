package com.globalcarelink.coordinator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 코디네이터 언어 스킬 Repository
 * 성능 최적화를 위한 인덱스 활용 쿼리 포함
 */
@Repository
public interface CoordinatorLanguageSkillRepository extends JpaRepository<CoordinatorLanguageSkill, Long> {

    /**
     * 코디네이터별 활성 언어 스킬 조회 (우선순위 정렬)
     * 인덱스 활용: coordinator_id, is_active, priority_order
     */
    List<CoordinatorLanguageSkill> findByCoordinatorIdAndIsActiveTrueOrderByPriorityOrder(String coordinatorId);

    /**
     * 특정 언어를 구사하는 코디네이터 조회
     * 인덱스 활용: language_code, is_active
     */
    @Query("SELECT cls FROM CoordinatorLanguageSkill cls WHERE cls.isActive = true AND cls.languageCode = :languageCode ORDER BY cls.proficiencyLevel DESC")
    List<CoordinatorLanguageSkill> findByLanguageCodeAndIsActiveTrue(@Param("languageCode") String languageCode);

    /**
     * 특정 숙련도 이상의 언어 스킬 조회
     * 인덱스 활용: proficiency_level, is_active
     */
    @Query("SELECT cls FROM CoordinatorLanguageSkill cls WHERE cls.isActive = true AND cls.proficiencyLevel >= :minLevel ORDER BY cls.proficiencyLevel DESC")
    List<CoordinatorLanguageSkill> findByProficiencyLevelGreaterThanEqual(@Param("minLevel") CoordinatorLanguageSkill.LanguageProficiency minLevel);

    /**
     * 다중 언어 구사 코디네이터 조회
     * 2개 이상 언어를 구사하는 코디네이터 ID 반환
     */
    @Query("""
        SELECT cls.coordinatorId 
        FROM CoordinatorLanguageSkill cls 
        WHERE cls.isActive = true 
        GROUP BY cls.coordinatorId 
        HAVING COUNT(cls) >= :minLanguageCount
        ORDER BY COUNT(cls) DESC
        """)
    List<String> findMultilingualCoordinators(@Param("minLanguageCount") Long minLanguageCount);

    /**
     * 언어별 코디네이터 수 통계
     */
    @Query("""
        SELECT cls.languageCode as languageCode, 
               cls.languageName as languageName,
               COUNT(DISTINCT cls.coordinatorId) as coordinatorCount,
               AVG(CASE 
                   WHEN cls.proficiencyLevel = 'NATIVE' THEN 5
                   WHEN cls.proficiencyLevel = 'FLUENT' THEN 4
                   WHEN cls.proficiencyLevel = 'BUSINESS' THEN 3
                   WHEN cls.proficiencyLevel = 'CONVERSATIONAL' THEN 2
                   WHEN cls.proficiencyLevel = 'BASIC' THEN 1
                   ELSE 0
               END) as avgProficiencyScore
        FROM CoordinatorLanguageSkill cls 
        WHERE cls.isActive = true 
        GROUP BY cls.languageCode, cls.languageName
        ORDER BY coordinatorCount DESC
        """)
    List<Map<String, Object>> findLanguageStatistics();

    /**
     * 특정 언어 조합을 모두 구사하는 코디네이터 조회
     */
    @Query("""
        SELECT cls.coordinatorId
        FROM CoordinatorLanguageSkill cls
        WHERE cls.isActive = true 
        AND cls.languageCode IN :languageCodes
        GROUP BY cls.coordinatorId
        HAVING COUNT(DISTINCT cls.languageCode) = :requiredCount
        """)
    List<String> findCoordinatorsWithLanguages(
        @Param("languageCodes") List<String> languageCodes,
        @Param("requiredCount") Long requiredCount
    );

    /**
     * 언어 인증서 보유 코디네이터 조회
     */
    @Query("SELECT cls FROM CoordinatorLanguageSkill cls WHERE cls.isActive = true AND cls.certification IS NOT NULL AND cls.certification != '' ORDER BY cls.certification")
    List<CoordinatorLanguageSkill> findWithCertification();

    /**
     * 코디네이터의 주요 언어 (가장 높은 숙련도) 조회
     */
    @Query("""
        SELECT cls FROM CoordinatorLanguageSkill cls
        WHERE cls.isActive = true 
        AND cls.coordinatorId = :coordinatorId
        AND cls.proficiencyLevel = (
            SELECT MAX(cls2.proficiencyLevel) 
            FROM CoordinatorLanguageSkill cls2 
            WHERE cls2.coordinatorId = :coordinatorId 
            AND cls2.isActive = true
        )
        ORDER BY cls.priorityOrder
        """)
    List<CoordinatorLanguageSkill> findPrimaryLanguages(@Param("coordinatorId") String coordinatorId);

    /**
     * 언어 스킬 우선순위 업데이트를 위한 배치 조회
     */
    @Query("SELECT cls.coordinatorId FROM CoordinatorLanguageSkill cls WHERE cls.isActive = true GROUP BY cls.coordinatorId HAVING COUNT(cls) > 1")
    List<String> findCoordinatorsWithMultipleLanguages();

    /**
     * 비활성 언어 스킬 정리를 위한 조회
     */
    @Query("SELECT cls FROM CoordinatorLanguageSkill cls WHERE cls.isActive = false AND cls.updatedAt < :cutoffDate")
    List<CoordinatorLanguageSkill> findInactiveSkillsOlderThan(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);

    /**
     * 코디네이터별 언어 스킬 개수 조회
     */
    @Query("""
        SELECT cls.coordinatorId, COUNT(cls) as skillCount
        FROM CoordinatorLanguageSkill cls 
        WHERE cls.isActive = true 
        GROUP BY cls.coordinatorId
        ORDER BY skillCount DESC
        """)
    List<Object[]> findLanguageSkillCountByCoordinator();

    /**
     * 특정 지역에서 특정 언어를 구사하는 코디네이터 조회
     * CoordinatorCareSettings와 조인
     */
    @Query("""
        SELECT cls FROM CoordinatorLanguageSkill cls
        JOIN CoordinatorCareSettings ccs ON cls.coordinatorId = ccs.coordinatorId
        WHERE cls.isActive = true 
        AND ccs.isActive = true
        AND cls.languageCode = :languageCode
        AND :region MEMBER OF ccs.workingRegions
        ORDER BY cls.proficiencyLevel DESC, ccs.customerSatisfaction DESC
        """)
    List<CoordinatorLanguageSkill> findByLanguageAndRegion(
        @Param("languageCode") String languageCode,
        @Param("region") String region
    );

    /**
     * 언어 스킬 분포 분석 (숙련도별)
     */
    @Query("""
        SELECT cls.proficiencyLevel, COUNT(cls) as count
        FROM CoordinatorLanguageSkill cls 
        WHERE cls.isActive = true 
        GROUP BY cls.proficiencyLevel
        ORDER BY 
            CASE cls.proficiencyLevel
                WHEN 'NATIVE' THEN 5
                WHEN 'FLUENT' THEN 4  
                WHEN 'BUSINESS' THEN 3
                WHEN 'CONVERSATIONAL' THEN 2
                WHEN 'BASIC' THEN 1
                ELSE 0
            END DESC
        """)
    List<Object[]> findProficiencyDistribution();

    /**
     * 성능 최적화된 언어 매칭 쿼리
     * 네이티브 쿼리로 인덱스 최적화
     */
    @Query(value = """
        SELECT cls.* FROM coordinator_language_skills cls
        INNER JOIN coordinator_care_settings ccs ON cls.coordinator_id = ccs.coordinator_id
        WHERE cls.is_active = true 
        AND ccs.is_active = true
        AND cls.language_code = :languageCode
        AND cls.proficiency_level >= :minProficiency
        AND ccs.customer_satisfaction >= :minSatisfaction
        ORDER BY cls.proficiency_level DESC, ccs.customer_satisfaction DESC
        LIMIT :maxResults
        """, nativeQuery = true)
    List<CoordinatorLanguageSkill> findOptimalLanguageMatches(
        @Param("languageCode") String languageCode,
        @Param("minProficiency") String minProficiency,
        @Param("minSatisfaction") Double minSatisfaction,
        @Param("maxResults") Integer maxResults
    );

    /**
     * 캐시 무효화를 위한 마지막 업데이트 시간 조회
     */
    @Query("SELECT MAX(cls.updatedAt) FROM CoordinatorLanguageSkill cls")
    java.time.LocalDateTime findLastUpdateTime();
}