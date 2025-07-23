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
     * 회원 ID로 건강 평가 조회
     */
    Optional<HealthAssessment> findByMemberId(Long memberId);

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
     * 질환 유형별 평가 조회
     */
    List<HealthAssessment> findByDiseaseTypesContaining(String diseaseType);

    /**
     * 출생년도 범위별 평가 조회 (연령대 조회용)
     */
    List<HealthAssessment> findByBirthYearBetween(Integer startYear, Integer endYear);

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
                WHEN adl_score BETWEEN 100 AND 149 THEN '경증'
                WHEN adl_score BETWEEN 150 AND 199 THEN '중등증'
                WHEN adl_score BETWEEN 200 AND 249 THEN '중증'
                WHEN adl_score >= 250 THEN '최중증'
                ELSE '미분류'
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
                WHEN YEAR(CURRENT_DATE) - birth_year BETWEEN 65 AND 74 THEN '65-74세'
                WHEN YEAR(CURRENT_DATE) - birth_year BETWEEN 75 AND 84 THEN '75-84세'
                WHEN YEAR(CURRENT_DATE) - birth_year >= 85 THEN '85세 이상'
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
            AVG(adl_score) as avg_adl_score,
            AVG(ltci_grade) as avg_care_grade,
            COUNT(*) as total_count
        FROM health_assessments 
        WHERE gender IS NOT NULL 
        GROUP BY gender
        """, nativeQuery = true)
    List<Map<String, Object>> findGenderCarePatternAnalysis();

    /**
     * 호스피스 케어 대상자 조회
     * - 1-2등급 최중증/중증 환자
     * - 말기 질환 관련 키워드 포함
     */
    @Query(value = """
        SELECT h.* FROM health_assessments h 
        WHERE (h.ltci_grade IN (1, 2) OR h.adl_score >= 250)
        OR (h.disease_types LIKE '%말기%' OR h.disease_types LIKE '%암%' OR h.disease_types LIKE '%호스피스%')
        ORDER BY h.ltci_grade ASC, h.adl_score DESC
        """, nativeQuery = true)
    List<HealthAssessment> findHospiceCareTargets();

    /**
     * 치매 전문 케어 대상자 조회
     * - 인지지원등급 또는 치매 관련 질환
     * - 의사소통 능력 저하자 (3점)
     */
    @Query(value = """
        SELECT h.* FROM health_assessments h 
        WHERE h.ltci_grade = 6 
        OR h.communication_level = 3
        OR (h.disease_types LIKE '%치매%' OR h.disease_types LIKE '%알츠하이머%' OR h.disease_types LIKE '%인지%')
        ORDER BY h.communication_level DESC, h.assessment_date DESC
        """, nativeQuery = true)
    List<HealthAssessment> findDementiaCareTargets();

    /**
     * 중증 환자 조회
     * - 1-3등급 중증 이상
     * - ADL 점수 200점 이상
     */
    @Query("SELECT h FROM HealthAssessment h WHERE (h.ltciGrade BETWEEN 1 AND 3) OR h.adlScore >= 200 ORDER BY h.ltciGrade ASC, h.adlScore DESC")
    List<HealthAssessment> findSevereCareTargets();

    /**
     * 최근 지정 기간 내 평가 개수 조회
     */
    @Query("SELECT COUNT(h) FROM HealthAssessment h WHERE h.assessmentDate >= :since")
    Long countRecentAssessments(@Param("since") LocalDateTime since);

    /**
     * 회원의 평가 개선 추이 분석
     */
    @Query(value = """
        SELECT 
            DATE(assessment_date) as assessment_date,
            adl_score,
            ltci_grade,
            overall_care_grade,
            LAG(adl_score) OVER (ORDER BY assessment_date) as previous_adl_score
        FROM health_assessments 
        WHERE member_id = :memberId 
        ORDER BY assessment_date DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Map<String, Object>> findMemberAssessmentTrend(@Param("memberId") String memberId);
}