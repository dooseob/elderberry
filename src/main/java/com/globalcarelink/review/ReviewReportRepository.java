package com.globalcarelink.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 리뷰 신고 Repository
 * 리뷰 신고 데이터 접근 및 조회 메서드 제공
 */
@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport, Long> {

    /**
     * 특정 리뷰에 대한 특정 사용자의 신고 조회
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.review.id = :reviewId AND rr.reporter.id = :reporterId")
    Optional<ReviewReport> findByReviewIdAndReporterId(@Param("reviewId") Long reviewId, @Param("reporterId") Long reporterId);

    /**
     * 특정 리뷰의 모든 신고 조회
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.review.id = :reviewId ORDER BY rr.createdAt DESC")
    Page<ReviewReport> findByReviewId(@Param("reviewId") Long reviewId, Pageable pageable);

    /**
     * 특정 사용자가 신고한 모든 신고 조회
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.reporter.id = :reporterId ORDER BY rr.createdAt DESC")
    Page<ReviewReport> findByReporterId(@Param("reporterId") Long reporterId, Pageable pageable);

    /**
     * 처리 대기 중인 신고 조회 (관리자용)
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.status = 'PENDING' ORDER BY rr.createdAt ASC")
    Page<ReviewReport> findPendingReports(Pageable pageable);

    /**
     * 검토 중인 신고 조회 (관리자용)
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.status = 'UNDER_REVIEW' ORDER BY rr.createdAt ASC")
    Page<ReviewReport> findUnderReviewReports(Pageable pageable);

    /**
     * 해결된 신고 조회 (관리자용)
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.status = 'RESOLVED' ORDER BY rr.resolvedAt DESC")
    Page<ReviewReport> findResolvedReports(Pageable pageable);

    /**
     * 특정 사유별 신고 조회
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.reason = :reason ORDER BY rr.createdAt DESC")
    Page<ReviewReport> findByReason(@Param("reason") ReviewReport.ReportReason reason, Pageable pageable);

    /**
     * 특정 리뷰의 신고 수 조회
     */
    @Query("SELECT COUNT(rr) FROM ReviewReport rr WHERE rr.review.id = :reviewId")
    long countReportsByReview(@Param("reviewId") Long reviewId);

    /**
     * 특정 사용자의 신고 수 조회
     */
    @Query("SELECT COUNT(rr) FROM ReviewReport rr WHERE rr.reporter.id = :reporterId")
    long countReportsByReporter(@Param("reporterId") Long reporterId);

    /**
     * 처리 대기 중인 신고 수 조회
     */
    @Query("SELECT COUNT(rr) FROM ReviewReport rr WHERE rr.status = 'PENDING'")
    long countPendingReports();

    /**
     * 오늘 접수된 신고 수 조회
     */
    @Query("SELECT COUNT(rr) FROM ReviewReport rr WHERE rr.createdAt >= CURRENT_DATE AND rr.createdAt < CURRENT_DATE + 1 DAY")
    long countTodayReports();

    /**
     * 특정 리뷰에 대한 특정 사용자의 신고 존재 여부 확인
     */
    @Query("SELECT COUNT(rr) > 0 FROM ReviewReport rr WHERE rr.review.id = :reviewId AND rr.reporter.id = :reporterId")
    boolean existsByReviewIdAndReporterId(@Param("reviewId") Long reviewId, @Param("reporterId") Long reporterId);

    /**
     * 가장 많이 신고된 리뷰 조회 (관리자용)
     */
    @Query("SELECT rr.review.id, COUNT(rr) as reportCount FROM ReviewReport rr GROUP BY rr.review.id HAVING COUNT(rr) >= :minReports ORDER BY COUNT(rr) DESC")
    List<Object[]> findMostReportedReviews(@Param("minReports") int minReports);

    /**
     * 특정 처리자가 해결한 신고 조회
     */
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.resolver.id = :resolverId AND rr.status IN ('RESOLVED', 'REJECTED') ORDER BY rr.resolvedAt DESC")
    Page<ReviewReport> findResolvedReportsByResolver(@Param("resolverId") Long resolverId, Pageable pageable);

    /**
     * 사유별 신고 통계
     */
    @Query("SELECT rr.reason, COUNT(rr) FROM ReviewReport rr GROUP BY rr.reason ORDER BY COUNT(rr) DESC")
    List<Object[]> getReportStatsByReason();

    /**
     * 월별 신고 통계
     */
    @Query("SELECT EXTRACT(YEAR FROM rr.createdAt), EXTRACT(MONTH FROM rr.createdAt), COUNT(rr) FROM ReviewReport rr GROUP BY EXTRACT(YEAR FROM rr.createdAt), EXTRACT(MONTH FROM rr.createdAt) ORDER BY EXTRACT(YEAR FROM rr.createdAt) DESC, EXTRACT(MONTH FROM rr.createdAt) DESC")
    List<Object[]> getMonthlyReportStats();
}