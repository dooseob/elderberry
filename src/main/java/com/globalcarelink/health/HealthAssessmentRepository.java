package com.globalcarelink.health;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 건강 상태 평가 데이터 접근 계층
 */
@Repository
public interface HealthAssessmentRepository extends JpaRepository<HealthAssessment, Long> {

    /**
     * 회원별 최신 건강 평가 조회
     */
    Optional<HealthAssessment> findTopByMemberIdOrderByAssessmentDateDesc(String memberId);

    /**
     * 회원별 모든 건강 평가 이력 조회 (최신순)
     */
    List<HealthAssessment> findByMemberIdOrderByAssessmentDateDesc(String memberId);

    /**
     * 회원별 건강 평가 페이징 조회
     */
    Page<HealthAssessment> findByMemberIdOrderByAssessmentDateDesc(String memberId, Pageable pageable);

    /**
     * 완성된 평가만 조회
     */
    @Query("SELECT h FROM HealthAssessment h WHERE h.mobilityLevel IS NOT NULL AND h.eatingLevel IS NOT NULL AND h.toiletLevel IS NOT NULL AND h.communicationLevel IS NOT NULL")
    List<HealthAssessment> findCompleteAssessments();

    /**
     * 특정 케어 등급 범위의 평가 조회
     */
    @Query("SELECT h FROM HealthAssessment h WHERE h.ltciGrade BETWEEN :minGrade AND :maxGrade ORDER BY h.assessmentDate DESC")
    List<HealthAssessment> findByCareGradeRange(@Param("minGrade") Integer minGrade, @Param("maxGrade") Integer maxGrade);

    /**
     * ADL 점수 범위별 조회
     */
    @Query("SELECT h FROM HealthAssessment h WHERE h.adlScore BETWEEN :minScore AND :maxScore ORDER BY h.adlScore ASC")
    List<HealthAssessment> findByAdlScoreRange(@Param("minScore") Integer minScore, @Param("maxScore") Integer maxScore);

    /**
     * 재외동포 대상 평가 조회 (Member 엔티티와 조인 필요 - 추후 구현)
     */
    @Query(value = """
        SELECT h.* FROM health_assessments h 
        JOIN members m ON h.member_id = m.id 
        WHERE m.role = 'USER_OVERSEAS' 
        ORDER BY h.assessment_date DESC
        """, nativeQuery = true)
    List<HealthAssessment> findOverseasKoreanAssessments();

    /**
     * 특정 기간 내 평가 조회
     */
    List<HealthAssessment> findByAssessmentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 케어 등급별 통계
     */
    @Query("SELECT h.ltciGrade as grade, COUNT(h) as count FROM HealthAssessment h WHERE h.ltciGrade IS NOT NULL GROUP BY h.ltciGrade ORDER BY h.ltciGrade")
    List<Map<String, Object>> findCareGradeStatistics();

    /**
     * ADL 점수 구간별 통계
     */
    @Query(value = """
        SELECT 
            CASE 
                WHEN adl_score BETWEEN 100 AND 140 THEN '경증(100-140)'
                WHEN adl_score BETWEEN 141 AND 180 THEN '중등증(141-180)'
                WHEN adl_score BETWEEN 181 AND 220 THEN '중증(181-220)'
                WHEN adl_score BETWEEN 221 AND 300 THEN '최중증(221-300)'
                ELSE '기타'
            END as score_range,
            COUNT(*) as count
        FROM health_assessments 
        WHERE adl_score IS NOT NULL 
        GROUP BY score_range
        ORDER BY MIN(adl_score)
        """, nativeQuery = true)
    List<Map<String, Object>> findAdlScoreDistribution();

    /**
     * 연령대별 케어 등급 분포
     */
    @Query(value = """
        SELECT 
            CASE 
                WHEN (YEAR(CURRENT_DATE) - birth_year) BETWEEN 60 AND 69 THEN '60대'
                WHEN (YEAR(CURRENT_DATE) - birth_year) BETWEEN 70 AND 79 THEN '70대' 
                WHEN (YEAR(CURRENT_DATE) - birth_year) BETWEEN 80 AND 89 THEN '80대'
                WHEN (YEAR(CURRENT_DATE) - birth_year) >= 90 THEN '90대 이상'
                ELSE '기타'
            END as age_group,
            ltci_grade,
            COUNT(*) as count
        FROM health_assessments 
        WHERE birth_year IS NOT NULL AND ltci_grade IS NOT NULL
        GROUP BY age_group, ltci_grade
        ORDER BY age_group, ltci_grade
        """, nativeQuery = true)
    List<Map<String, Object>> findAgeGroupCareGradeDistribution();

    /**
     * 성별 케어 패턴 분석
     */
    @Query(value = """
        SELECT 
            gender,
            ltci_grade,
            AVG(adl_score) as avg_adl_score,
            COUNT(*) as count
        FROM health_assessments 
        WHERE gender IS NOT NULL AND ltci_grade IS NOT NULL AND adl_score IS NOT NULL
        GROUP BY gender, ltci_grade
        ORDER BY gender, ltci_grade
        """, nativeQuery = true)
    List<Map<String, Object>> findGenderCarePatternAnalysis();

    /**
     * 최근 30일 평가 현황
     */
    @Query("SELECT COUNT(h) FROM HealthAssessment h WHERE h.assessmentDate >= :thirtyDaysAgo")
    Long countRecentAssessments(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);

    /**
     * 미완성 평가 조회
     */
    @Query("SELECT h FROM HealthAssessment h WHERE h.mobilityLevel IS NULL OR h.eatingLevel IS NULL OR h.toiletLevel IS NULL OR h.communicationLevel IS NULL ORDER BY h.assessmentDate DESC")
    List<HealthAssessment> findIncompleteAssessments();

    /**
     * 특정 회원의 평가 개선 추이 (ADL 점수 변화)
     */
    @Query(value = """
        SELECT 
            assessment_date,
            adl_score,
            LAG(adl_score) OVER (ORDER BY assessment_date) as previous_score
        FROM health_assessments 
        WHERE member_id = :memberId AND adl_score IS NOT NULL
        ORDER BY assessment_date
        """, nativeQuery = true)
    List<Map<String, Object>> findMemberAssessmentTrend(@Param("memberId") String memberId);

    /**
     * 호스피스 케어 대상자 조회 (careTargetStatus 1-2)
     */
    @Query("SELECT h FROM HealthAssessment h WHERE h.careTargetStatus IN (1, 2) ORDER BY h.assessmentDate DESC")
    List<HealthAssessment> findHospiceCareTargets();

    /**
     * 치매 전문 케어 대상자 조회 (인지지원등급 + 의사소통 3등급)
     */
    @Query("SELECT h FROM HealthAssessment h WHERE h.ltciGrade = 6 OR h.communicationLevel = 3 ORDER BY h.assessmentDate DESC")
    List<HealthAssessment> findDementiaCareTargets();

    /**
     * 중증 환자 조회 (1-2등급 + 높은 ADL 점수)
     */
    @Query("SELECT h FROM HealthAssessment h WHERE h.ltciGrade IN (1, 2) OR h.adlScore >= 220 ORDER BY h.assessmentDate DESC")
    List<HealthAssessment> findSevereCareTargets();
}