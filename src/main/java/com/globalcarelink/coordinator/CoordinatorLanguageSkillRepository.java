package com.globalcarelink.coordinator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 코디네이터 언어 능력 데이터 접근 계층
 */
@Repository
public interface CoordinatorLanguageSkillRepository extends JpaRepository<CoordinatorLanguageSkill, Long> {

    /**
     * 코디네이터별 언어 능력 조회
     */
    List<CoordinatorLanguageSkill> findByCoordinatorIdAndIsActiveTrueOrderByPriorityOrder(String coordinatorId);

    /**
     * 특정 언어 코드로 조회
     */
    List<CoordinatorLanguageSkill> findByLanguageCodeAndIsActiveTrue(String languageCode);

    /**
     * 특정 코디네이터의 특정 언어 능력 조회
     */
    Optional<CoordinatorLanguageSkill> findByCoordinatorIdAndLanguageCodeAndIsActiveTrue(String coordinatorId, String languageCode);

    /**
     * 모든 활성 언어 능력 조회 (우선순위 정렬)
     */
    List<CoordinatorLanguageSkill> findByIsActiveTrueOrderByPriorityOrder();

    /**
     * 업무 수준 이상 언어 능력자 조회
     */
    @Query("SELECT c FROM CoordinatorLanguageSkill c WHERE c.isActive = true AND c.proficiencyLevel IN ('NATIVE', 'FLUENT', 'BUSINESS') ORDER BY c.priorityOrder")
    List<CoordinatorLanguageSkill> findBusinessLevelLanguageSkills();

    /**
     * 특정 수준 이상 언어 능력자 조회
     */
    List<CoordinatorLanguageSkill> findByProficiencyLevelInAndIsActiveTrueOrderByPriorityOrder(List<CoordinatorLanguageSkill.LanguageProficiency> proficiencyLevels);

    /**
     * 자격증 보유자 조회
     */
    @Query("SELECT c FROM CoordinatorLanguageSkill c WHERE c.isActive = true AND c.certification IS NOT NULL AND c.certification != '' ORDER BY c.priorityOrder")
    List<CoordinatorLanguageSkill> findByCertificationNotNullAndIsActiveTrueOrderByPriorityOrder();

    /**
     * 현지 경험 보유자 조회
     */
    @Query("SELECT c FROM CoordinatorLanguageSkill c WHERE c.isActive = true AND c.countryExperience IS NOT NULL AND c.countryExperience != '' ORDER BY c.priorityOrder")
    List<CoordinatorLanguageSkill> findByCountryExperienceNotNullAndIsActiveTrueOrderByPriorityOrder();

    /**
     * 언어별 코디네이터 수 통계
     */
    @Query("SELECT c.languageCode as languageCode, c.languageName as languageName, COUNT(c) as coordinatorCount FROM CoordinatorLanguageSkill c WHERE c.isActive = true GROUP BY c.languageCode, c.languageName ORDER BY COUNT(c) DESC")
    List<LanguageStatistics> findLanguageDistributionStatistics();

    /**
     * 코디네이터별 언어 수 통계
     */
    @Query("SELECT c.coordinatorId as coordinatorId, COUNT(c) as languageCount FROM CoordinatorLanguageSkill c WHERE c.isActive = true GROUP BY c.coordinatorId ORDER BY COUNT(c) DESC")
    List<CoordinatorLanguageCount> findCoordinatorLanguageCountStatistics();

    /**
     * 특정 국가에서 경험이 있는 코디네이터 조회
     */
    @Query("SELECT c FROM CoordinatorLanguageSkill c WHERE c.isActive = true AND UPPER(c.countryExperience) LIKE UPPER(CONCAT('%', :countryName, '%')) ORDER BY c.priorityOrder")
    List<CoordinatorLanguageSkill> findByCountryExperienceContaining(@Param("countryName") String countryName);

    /**
     * 다국어 지원 코디네이터 (2개 언어 이상)
     */
    @Query("SELECT c.coordinatorId FROM CoordinatorLanguageSkill c WHERE c.isActive = true GROUP BY c.coordinatorId HAVING COUNT(c) >= 2 ORDER BY COUNT(c) DESC")
    List<String> findMultilingualCoordinatorIds();

    /**
     * 언어별 평균 매칭 점수
     */
    @Query(value = """
        SELECT 
            language_code,
            language_name,
            AVG(CASE 
                WHEN proficiency_level = 'NATIVE' THEN 5.0
                WHEN proficiency_level = 'FLUENT' THEN 4.5
                WHEN proficiency_level = 'BUSINESS' THEN 4.0
                WHEN proficiency_level = 'CONVERSATIONAL' THEN 3.0
                WHEN proficiency_level = 'BASIC' THEN 2.0
                ELSE 2.0
            END) as avg_score,
            COUNT(*) as coordinator_count
        FROM coordinator_language_skills 
        WHERE is_active = true 
        GROUP BY language_code, language_name 
        ORDER BY avg_score DESC
        """, nativeQuery = true)
    List<LanguageAverageScore> findLanguageAverageScores();

    // ===== DTO 인터페이스들 =====

    interface LanguageStatistics {
        String getLanguageCode();
        String getLanguageName();
        Long getCoordinatorCount();
    }

    interface CoordinatorLanguageCount {
        String getCoordinatorId();
        Long getLanguageCount();
    }

    interface LanguageAverageScore {
        String getLanguageCode();
        String getLanguageName();
        Double getAvgScore();
        Long getCoordinatorCount();
    }
}