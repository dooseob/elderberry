package com.globalcarelink.facility;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 시설 매칭 이력 저장소
 * 매칭 성과 분석 및 추천 시스템 개선을 위한 데이터 조회 기능 제공
 */
@Repository
public interface FacilityMatchingHistoryRepository extends JpaRepository<FacilityMatchingHistory, Long> {

    // ===== 기본 조회 =====

    /**
     * 사용자별 매칭 이력 조회
     */
    List<FacilityMatchingHistory> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * 사용자별 매칭 이력 조회 (페이징)
     */
    Page<FacilityMatchingHistory> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * 시설별 매칭 이력 조회
     */
    List<FacilityMatchingHistory> findByFacilityIdOrderByCreatedAtDesc(Long facilityId);
    
    Page<FacilityMatchingHistory> findByFacilityIdOrderByCreatedAtDesc(Long facilityId, Pageable pageable);

    /**
     * 코디네이터별 매칭 이력 조회
     */
    List<FacilityMatchingHistory> findByCoordinatorIdOrderByCreatedAtDesc(String coordinatorId);
    
    Page<FacilityMatchingHistory> findByCoordinatorIdOrderByCreatedAtDesc(String coordinatorId, Pageable pageable);

    /**
     * 특정 사용자-시설 조합의 최신 매칭 이력
     */
    Optional<FacilityMatchingHistory> findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(String userId, Long facilityId);

    // ===== 매칭 성과 분석 =====

    /**
     * 시설별 매칭 성공률 계산
     */
    @Query("""
        SELECT h.facilityId, 
               COUNT(*) as totalMatches,
               SUM(CASE WHEN h.status = 'COMPLETED' AND h.outcome = 'CONTRACT_SIGNED' THEN 1 ELSE 0 END) as successfulMatches,
               AVG(CASE WHEN h.userSatisfactionScore IS NOT NULL THEN h.userSatisfactionScore ELSE 0 END) as avgSatisfaction
        FROM FacilityMatchingHistory h
        WHERE h.createdAt >= :startDate
        GROUP BY h.facilityId
        HAVING COUNT(*) >= :minMatches
        ORDER BY successfulMatches DESC, avgSatisfaction DESC
        """)
    List<Object[]> calculateFacilityMatchingSuccessRate(@Param("startDate") LocalDateTime startDate,
                                                        @Param("minMatches") long minMatches);

    /**
     * 코디네이터별 매칭 성과 분석
     */
    @Query("""
        SELECT h.coordinatorId,
               COUNT(*) as totalMatches,
               SUM(CASE WHEN h.status = 'COMPLETED' AND h.outcome = 'CONTRACT_SIGNED' THEN 1 ELSE 0 END) as successfulMatches,
               AVG(h.initialMatchScore) as avgMatchScore,
               AVG(CASE WHEN h.userSatisfactionScore IS NOT NULL THEN h.userSatisfactionScore ELSE 0 END) as avgSatisfaction
        FROM FacilityMatchingHistory h
        WHERE h.createdAt >= :startDate
        GROUP BY h.coordinatorId
        ORDER BY successfulMatches DESC
        """)
    List<Object[]> calculateCoordinatorPerformance(@Param("startDate") LocalDateTime startDate);

    /**
     * 매칭 순위별 선택률 분석
     */
    @Query("""
        SELECT h.recommendationRank,
               COUNT(*) as totalRecommendations,
               SUM(CASE WHEN h.wasViewed = true THEN 1 ELSE 0 END) as viewedCount,
               SUM(CASE WHEN h.wasContacted = true THEN 1 ELSE 0 END) as contactedCount,
               SUM(CASE WHEN h.wasSelected = true THEN 1 ELSE 0 END) as selectedCount
        FROM FacilityMatchingHistory h
        WHERE h.createdAt >= :startDate
        GROUP BY h.recommendationRank
        ORDER BY h.recommendationRank
        """)
    List<Object[]> analyzeRecommendationRankingEffectiveness(@Param("startDate") LocalDateTime startDate);

    // ===== 사용자 행동 분석 =====

    /**
     * 사용자 참여도가 높은 매칭 이력 조회
     */
    @Query("""
        SELECT h FROM FacilityMatchingHistory h
        WHERE h.wasViewed = true AND h.wasContacted = true
        AND h.createdAt >= :startDate
        ORDER BY h.userSatisfactionScore DESC, h.createdAt DESC
        """)
    Page<FacilityMatchingHistory> findHighEngagementMatches(@Param("startDate") LocalDateTime startDate, 
                                                           Pageable pageable);

    /**
     * 특정 점수 이상의 매칭 중 실패한 케이스 분석
     */
    @Query("""
        SELECT h FROM FacilityMatchingHistory h
        WHERE h.initialMatchScore >= :minScore 
        AND h.status = 'FAILED'
        AND h.createdAt >= :startDate
        ORDER BY h.initialMatchScore DESC
        """)
    List<FacilityMatchingHistory> findFailedHighScoreMatches(@Param("minScore") BigDecimal minScore,
                                                           @Param("startDate") LocalDateTime startDate);
                                                           
    @Query("""
        SELECT h FROM FacilityMatchingHistory h
        WHERE h.initialMatchScore >= :minScore 
        AND h.status = 'FAILED'
        AND h.createdAt >= :startDate
        ORDER BY h.initialMatchScore DESC
        """)
    Page<FacilityMatchingHistory> findFailedHighScoreMatches(@Param("minScore") BigDecimal minScore,
                                                           @Param("startDate") LocalDateTime startDate,
                                                           Pageable pageable);

    // ===== 시간별 분석 =====

    /**
     * 매칭 완료까지 평균 소요 시간 분석
     */
    @Query(value = """
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avgHours,
               MIN(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as minHours,
               MAX(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as maxHours
        FROM facility_matching_history
        WHERE status = 'COMPLETED' AND completed_at IS NOT NULL
        AND created_at >= :startDate
        """, nativeQuery = true)
    Object[] calculateAverageMatchingDuration(@Param("startDate") LocalDateTime startDate);

    /**
     * 단계별 평균 소요 시간 분석
     */
    @Query(value = """
        SELECT 
            AVG(CASE WHEN viewed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (viewed_at - created_at)) / 3600 END) as avgTimeToView,
            AVG(CASE WHEN contacted_at IS NOT NULL THEN EXTRACT(EPOCH FROM (contacted_at - created_at)) / 3600 END) as avgTimeToContact,
            AVG(CASE WHEN visited_at IS NOT NULL THEN EXTRACT(EPOCH FROM (visited_at - created_at)) / 3600 END) as avgTimeToVisit,
            AVG(CASE WHEN selected_at IS NOT NULL THEN EXTRACT(EPOCH FROM (selected_at - created_at)) / 3600 END) as avgTimeToSelect
        FROM facility_matching_history
        WHERE created_at >= :startDate
        """, nativeQuery = true)
    Object[] calculateStepwiseAverageDuration(@Param("startDate") LocalDateTime startDate);

    // ===== 비용 분석 =====

    /**
     * 예상 비용과 실제 비용 차이 분석
     */
    @Query("""
        SELECT h.facilityId,
               AVG(h.estimatedCost) as avgEstimatedCost,
               AVG(h.actualCost) as avgActualCost,
               AVG(h.actualCost - h.estimatedCost) as avgCostDifference
        FROM FacilityMatchingHistory h
        WHERE h.estimatedCost IS NOT NULL AND h.actualCost IS NOT NULL
        AND h.createdAt >= :startDate
        GROUP BY h.facilityId
        HAVING COUNT(*) >= :minSamples
        """)
    List<Object[]> analyzeCostAccuracy(@Param("startDate") LocalDateTime startDate,
                                     @Param("minSamples") long minSamples);

    // ===== 개선 기회 식별 =====

    /**
     * 높은 점수였지만 선택되지 않은 매칭들 (추천 알고리즘 개선 기회)
     */
    @Query("""
        SELECT h FROM FacilityMatchingHistory h
        WHERE h.initialMatchScore >= :highScoreThreshold
        AND h.wasViewed = true
        AND h.wasSelected = false
        AND h.createdAt >= :startDate
        ORDER BY h.initialMatchScore DESC
        """)
    List<FacilityMatchingHistory> findMissedOpportunities(@Param("highScoreThreshold") BigDecimal highScoreThreshold,
                                                         @Param("startDate") LocalDateTime startDate);

    /**
     * 낮은 점수였지만 선택된 매칭들 (�숨겨진 선호 패턴 발견)
     */
    @Query("""
        SELECT h FROM FacilityMatchingHistory h
        WHERE h.initialMatchScore <= :lowScoreThreshold
        AND h.status = 'COMPLETED'
        AND h.outcome = 'CONTRACT_SIGNED'
        AND h.createdAt >= :startDate
        ORDER BY h.userSatisfactionScore DESC, h.initialMatchScore ASC
        """)
    List<FacilityMatchingHistory> findUnexpectedSuccesses(@Param("lowScoreThreshold") BigDecimal lowScoreThreshold,
                                                         @Param("startDate") LocalDateTime startDate);

    /**
     * 높은 점수였지만 선택되지 않은 매칭들 (추천 알고리즘 개선 기회, 페이징)
     */
    @Query("""
        SELECT h FROM FacilityMatchingHistory h
        WHERE h.initialMatchScore >= :highScoreThreshold
        AND h.wasViewed = true
        AND h.wasSelected = false
        AND h.createdAt >= :startDate
        ORDER BY h.initialMatchScore DESC
        """)
    Page<FacilityMatchingHistory> findMissedOpportunitiesPageable(@Param("highScoreThreshold") BigDecimal highScoreThreshold,
                                                                   @Param("startDate") LocalDateTime startDate,
                                                                   Pageable pageable);

    /**
     * 낮은 점수였지만 선택된 매칭들 (숨겨진 선호 패턴 발견, 페이징)
     */
    @Query("""
        SELECT h FROM FacilityMatchingHistory h
        WHERE h.initialMatchScore <= :lowScoreThreshold
        AND h.status = 'COMPLETED'
        AND h.outcome = 'CONTRACT_SIGNED'
        AND h.createdAt >= :startDate
        ORDER BY h.userSatisfactionScore DESC, h.initialMatchScore ASC
        """)
    Page<FacilityMatchingHistory> findUnexpectedSuccessesPageable(@Param("lowScoreThreshold") BigDecimal lowScoreThreshold,
                                                                   @Param("startDate") LocalDateTime startDate,
                                                                   Pageable pageable);

    // ===== 날짜 기반 조회 =====
    
    /**
     * 특정 날짜 이후 생성된 매칭 이력 조회
     */
    List<FacilityMatchingHistory> findByCreatedAtAfter(LocalDateTime startDate);
    
    /**
     * 특정 날짜 이후 생성된 매칭 이력 조회 (페이징)
     */
    Page<FacilityMatchingHistory> findByCreatedAtAfter(LocalDateTime startDate, Pageable pageable);

    // ===== 트렌드 분석 =====

    /**
     * 월별 매칭 트렌드 분석
     */
    @Query("""
        SELECT 
            EXTRACT(YEAR FROM h.createdAt) as year,
            EXTRACT(MONTH FROM h.createdAt) as month,
            COUNT(*) as totalMatches,
            SUM(CASE WHEN h.status = 'COMPLETED' AND h.outcome = 'CONTRACT_SIGNED' THEN 1 ELSE 0 END) as successfulMatches,
            AVG(h.initialMatchScore) as avgMatchScore,
            AVG(CASE WHEN h.userSatisfactionScore IS NOT NULL THEN h.userSatisfactionScore ELSE 0 END) as avgSatisfaction
        FROM FacilityMatchingHistory h
        WHERE h.createdAt >= :startDate
        GROUP BY EXTRACT(YEAR FROM h.createdAt), EXTRACT(MONTH FROM h.createdAt)
        ORDER BY year, month
        """)
    List<Object[]> getMonthlyMatchingTrends(@Param("startDate") LocalDateTime startDate);

    /**
     * 시설 타입별 매칭 성과 분석 (시설 정보와 조인)
     */
    @Query("""
        SELECT f.facilityType,
               COUNT(h.id) as totalMatches,
               SUM(CASE WHEN h.status = 'COMPLETED' AND h.outcome = 'CONTRACT_SIGNED' THEN 1 ELSE 0 END) as successfulMatches,
               AVG(h.initialMatchScore) as avgMatchScore,
               AVG(CASE WHEN h.userSatisfactionScore IS NOT NULL THEN h.userSatisfactionScore ELSE 0 END) as avgSatisfaction
        FROM FacilityMatchingHistory h
        JOIN FacilityProfile f ON h.facilityId = f.id
        WHERE h.createdAt >= :startDate
        GROUP BY f.facilityType
        ORDER BY successfulMatches DESC
        """)
    List<Object[]> analyzeFacilityTypePerformance(@Param("startDate") LocalDateTime startDate);
}