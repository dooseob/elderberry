package com.globalcarelink.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 리뷰 Repository
 * 리뷰 데이터 접근 및 조회 메서드 제공
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * 특정 시설의 활성 리뷰 조회 (평점 높은 순)
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE' ORDER BY r.overallRating DESC, r.createdAt DESC")
    Page<Review> findByFacilityIdAndStatusActive(@Param("facilityId") Long facilityId, Pageable pageable);

    /**
     * 특정 시설의 최신 리뷰 조회
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findLatestReviewsByFacility(@Param("facilityId") Long facilityId, Pageable pageable);

    /**
     * 특정 시설의 베스트 리뷰 조회 (도움됨 투표 기준)
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE' ORDER BY r.helpfulCount DESC, r.overallRating DESC")
    Page<Review> findBestReviewsByFacility(@Param("facilityId") Long facilityId, Pageable pageable);

    /**
     * 특정 작성자의 리뷰 조회
     */
    @Query("SELECT r FROM Review r WHERE r.reviewer.id = :reviewerId AND r.status != 'DELETED' ORDER BY r.createdAt DESC")
    Page<Review> findByReviewerId(@Param("reviewerId") Long reviewerId, Pageable pageable);

    /**
     * 평점 범위로 리뷰 검색
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.overallRating BETWEEN :minRating AND :maxRating AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findByFacilityAndRatingRange(
            @Param("facilityId") Long facilityId,
            @Param("minRating") BigDecimal minRating,
            @Param("maxRating") BigDecimal maxRating,
            Pageable pageable
    );

    /**
     * 리뷰 타입별 조회
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.reviewType = :reviewType AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findByFacilityAndReviewType(
            @Param("facilityId") Long facilityId,
            @Param("reviewType") Review.ReviewType reviewType,
            Pageable pageable
    );

    /**
     * 검증된 리뷰만 조회
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.verified = true AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findVerifiedReviewsByFacility(@Param("facilityId") Long facilityId, Pageable pageable);

    /**
     * 이미지가 포함된 리뷰 조회
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND SIZE(r.imageUrls) > 0 AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findReviewsWithImagesByFacility(@Param("facilityId") Long facilityId, Pageable pageable);

    /**
     * 키워드로 리뷰 검색
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND (r.title LIKE %:keyword% OR r.content LIKE %:keyword%) AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findByFacilityAndKeyword(
            @Param("facilityId") Long facilityId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * 추천 리뷰만 조회
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.recommended = true AND r.status = 'ACTIVE' ORDER BY r.overallRating DESC")
    Page<Review> findRecommendedReviewsByFacility(@Param("facilityId") Long facilityId, Pageable pageable);

    /**
     * 특정 기간 내 리뷰 조회
     */
    @Query("SELECT r FROM Review r WHERE r.facility.id = :facilityId AND r.createdAt BETWEEN :startDate AND :endDate AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findReviewsByDateRange(
            @Param("facilityId") Long facilityId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * 신고된 리뷰 조회 (관리자용)
     */
    @Query("SELECT r FROM Review r WHERE r.reportCount > 0 ORDER BY r.reportCount DESC, r.updatedAt DESC")
    Page<Review> findReportedReviews(Pageable pageable);

    /**
     * 검토 대기 중인 리뷰 조회 (관리자용)
     */
    @Query("SELECT r FROM Review r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    Page<Review> findPendingReviews(Pageable pageable);

    /**
     * 특정 시설의 평균 평점 조회
     */
    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE'")
    Optional<BigDecimal> findAverageRatingByFacility(@Param("facilityId") Long facilityId);

    /**
     * 특정 시설의 리뷰 수 조회
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE'")
    long countActiveReviewsByFacility(@Param("facilityId") Long facilityId);

    /**
     * 특정 시설의 평점별 리뷰 수 통계
     */
    @Query("SELECT FLOOR(r.overallRating), COUNT(r) FROM Review r WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE' GROUP BY FLOOR(r.overallRating) ORDER BY FLOOR(r.overallRating) DESC")
    List<Object[]> findRatingDistributionByFacility(@Param("facilityId") Long facilityId);

    /**
     * 특정 시설의 세부 평점 평균
     */
    @Query("SELECT " +
           "AVG(r.serviceQualityRating), " +
           "AVG(r.facilityRating), " +
           "AVG(r.staffRating), " +
           "AVG(r.priceRating), " +
           "AVG(r.accessibilityRating) " +
           "FROM Review r WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE'")
    Object[] findDetailedRatingAveragesByFacility(@Param("facilityId") Long facilityId);

    /**
     * 추천 비율 조회
     */
    @Query("SELECT COUNT(r) * 100.0 / (SELECT COUNT(r2) FROM Review r2 WHERE r2.facility.id = :facilityId AND r2.status = 'ACTIVE') " +
           "FROM Review r WHERE r.facility.id = :facilityId AND r.recommended = true AND r.status = 'ACTIVE'")
    Optional<Double> findRecommendationPercentageByFacility(@Param("facilityId") Long facilityId);

    /**
     * 오늘 작성된 리뷰 수 조회
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.facility.id = :facilityId AND r.createdAt >= CURRENT_DATE AND r.createdAt < CURRENT_DATE + 1 DAY AND r.status = 'ACTIVE'")
    long countTodayReviewsByFacility(@Param("facilityId") Long facilityId);

    /**
     * 이번 달 작성된 리뷰 수 조회
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.facility.id = :facilityId AND EXTRACT(YEAR FROM r.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(MONTH FROM r.createdAt) = EXTRACT(MONTH FROM CURRENT_DATE) AND r.status = 'ACTIVE'")
    long countThisMonthReviewsByFacility(@Param("facilityId") Long facilityId);

    /**
     * 작성자와 시설로 기존 리뷰 존재 여부 확인
     */
    @Query("SELECT COUNT(r) > 0 FROM Review r WHERE r.reviewer.id = :reviewerId AND r.facility.id = :facilityId AND r.status != 'DELETED'")
    boolean existsByReviewerAndFacility(@Param("reviewerId") Long reviewerId, @Param("facilityId") Long facilityId);

    /**
     * 도움됨 투표 수 업데이트
     */
    @Modifying
    @Query("UPDATE Review r SET r.helpfulCount = r.helpfulCount + :increment WHERE r.id = :reviewId")
    void updateHelpfulCount(@Param("reviewId") Long reviewId, @Param("increment") int increment);

    /**
     * 도움안됨 투표 수 업데이트
     */
    @Modifying
    @Query("UPDATE Review r SET r.notHelpfulCount = r.notHelpfulCount + :increment WHERE r.id = :reviewId")
    void updateNotHelpfulCount(@Param("reviewId") Long reviewId, @Param("increment") int increment);

    /**
     * 신고 횟수 증가
     */
    @Modifying
    @Query("UPDATE Review r SET r.reportCount = r.reportCount + 1 WHERE r.id = :reviewId")
    void incrementReportCount(@Param("reviewId") Long reviewId);

    /**
     * 최근 인기 리뷰 조회 (전체 시설 대상)
     */
    @Query("SELECT r FROM Review r WHERE r.status = 'ACTIVE' AND r.createdAt >= :sinceDate ORDER BY r.helpfulCount DESC, r.overallRating DESC")
    Page<Review> findPopularRecentReviews(@Param("sinceDate") LocalDateTime sinceDate, Pageable pageable);

    /**
     * 태그별 리뷰 조회
     */
    @Query("SELECT r FROM Review r JOIN r.tags t WHERE r.facility.id = :facilityId AND t = :tag AND r.status = 'ACTIVE' ORDER BY r.createdAt DESC")
    Page<Review> findByFacilityAndTag(
            @Param("facilityId") Long facilityId,
            @Param("tag") String tag,
            Pageable pageable
    );

    /**
     * 특정 시설의 자주 사용된 태그 조회
     */
    @Query("SELECT t, COUNT(t) FROM Review r JOIN r.tags t WHERE r.facility.id = :facilityId AND r.status = 'ACTIVE' GROUP BY t ORDER BY COUNT(t) DESC")
    List<Object[]> findPopularTagsByFacility(@Param("facilityId") Long facilityId, Pageable pageable);

    /**
     * 작성자와 시설로 리뷰 조회 (수정/삭제 권한 확인용)
     */
    Optional<Review> findByIdAndReviewerId(Long id, Long reviewerId);
}