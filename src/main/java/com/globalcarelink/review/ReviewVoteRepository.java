package com.globalcarelink.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 리뷰 투표 Repository
 * 리뷰 투표 데이터 접근 및 조회 메서드 제공
 */
@Repository
public interface ReviewVoteRepository extends JpaRepository<ReviewVote, Long> {

    /**
     * 특정 리뷰에 대한 사용자의 투표 조회
     */
    Optional<ReviewVote> findByReviewIdAndVoterId(Long reviewId, Long voterId);

    /**
     * 특정 리뷰에 대한 도움됨 투표 수 조회
     */
    @Query("SELECT COUNT(rv) FROM ReviewVote rv WHERE rv.review.id = :reviewId AND rv.voteType = 'HELPFUL'")
    long countHelpfulVotesByReview(@Param("reviewId") Long reviewId);

    /**
     * 특정 리뷰에 대한 도움안됨 투표 수 조회
     */
    @Query("SELECT COUNT(rv) FROM ReviewVote rv WHERE rv.review.id = :reviewId AND rv.voteType = 'NOT_HELPFUL'")
    long countNotHelpfulVotesByReview(@Param("reviewId") Long reviewId);

    /**
     * 특정 사용자가 투표한 리뷰 수 조회
     */
    @Query("SELECT COUNT(rv) FROM ReviewVote rv WHERE rv.voter.id = :voterId")
    long countVotesByVoter(@Param("voterId") Long voterId);

    /**
     * 특정 리뷰와 투표자로 투표 존재 여부 확인
     */
    boolean existsByReviewIdAndVoterId(Long reviewId, Long voterId);

    /**
     * 특정 리뷰의 총 투표 수 조회
     */
    @Query("SELECT COUNT(rv) FROM ReviewVote rv WHERE rv.review.id = :reviewId")
    long countTotalVotesByReview(@Param("reviewId") Long reviewId);
}