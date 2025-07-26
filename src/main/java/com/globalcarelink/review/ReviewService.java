package com.globalcarelink.review;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.facility.FacilityProfile;
import com.globalcarelink.facility.FacilityProfileRepository;
import com.globalcarelink.review.dto.ReviewCreateRequest;
import com.globalcarelink.review.dto.ReviewUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 리뷰 서비스
 * 시설 리뷰 작성, 조회, 관리 등의 비즈니스 로직 처리
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewVoteRepository reviewVoteRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final MemberRepository memberRepository;
    private final FacilityProfileRepository facilityProfileRepository;

    /**
     * 특정 시설의 리뷰 목록 조회 (캐시 적용)
     */
    @Cacheable(value = "reviews", key = "'facility:' + #facilityId")
    @Transactional(readOnly = true)
    public Page<Review> getReviewsByFacility(Long facilityId, Pageable pageable) {
        log.debug("시설 리뷰 목록 조회: 시설ID={}", facilityId);
        return reviewRepository.findByFacilityIdAndStatusActive(facilityId, pageable);
    }

    /**
     * 최신 리뷰 조회
     */
    @Transactional(readOnly = true)
    public Page<Review> getLatestReviewsByFacility(Long facilityId, Pageable pageable) {
        log.debug("최신 리뷰 조회: 시설ID={}", facilityId);
        return reviewRepository.findLatestReviewsByFacility(facilityId, pageable);
    }

    /**
     * 베스트 리뷰 조회 (도움됨 투표 기준)
     */
    @Transactional(readOnly = true)
    public Page<Review> getBestReviewsByFacility(Long facilityId, Pageable pageable) {
        log.debug("베스트 리뷰 조회: 시설ID={}", facilityId);
        return reviewRepository.findBestReviewsByFacility(facilityId, pageable);
    }

    /**
     * 리뷰 상세 조회
     */
    @Transactional(readOnly = true)
    public Review getReviewById(Long reviewId) {
        log.debug("리뷰 상세 조회: ID={}", reviewId);
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다: " + reviewId));
    }

    /**
     * 새 리뷰 작성
     */
    public Review createReview(Long facilityId, Member reviewer, ReviewCreateRequest request) {
        log.info("새 리뷰 작성: 시설ID={}, 작성자ID={}", facilityId, reviewer.getId());

        // 시설 존재 확인
        FacilityProfile facility = facilityProfileRepository.findById(facilityId)
                .orElseThrow(() -> new IllegalArgumentException("시설을 찾을 수 없습니다: " + facilityId));

        // 중복 리뷰 확인
        if (reviewRepository.existsByReviewerAndFacility(reviewer.getId(), facilityId)) {
            throw new IllegalArgumentException("이미 해당 시설에 리뷰를 작성하셨습니다");
        }

        // 리뷰 생성
        Review review = new Review();
        review.setReviewer(reviewer);
        review.setFacility(facility);
        review.setTitle(request.getTitle());
        review.setContent(request.getContent());
        review.setOverallRating(request.getOverallRating());
        review.setServiceQualityRating(request.getServiceQualityRating());
        review.setFacilityRating(request.getFacilityRating());
        review.setStaffRating(request.getStaffRating());
        review.setPriceRating(request.getPriceRating());
        review.setAccessibilityRating(request.getAccessibilityRating());
        review.setReviewType(request.getReviewType());
        review.setRecommended(request.getRecommended());
        review.setVisitDate(request.getVisitDate());
        review.setServiceDurationDays(request.getServiceDurationDays());
        review.setAnonymous(request.getAnonymous());

        // 이미지 URL 추가
        if (request.getImageUrls() != null) {
            request.getImageUrls().forEach(review::addImageUrl);
        }

        // 태그 추가
        if (request.getTags() != null) {
            request.getTags().forEach(review::addTag);
        }

        Review savedReview = reviewRepository.save(review);
        log.info("리뷰 작성 완료: ID={}, 평점={}", savedReview.getId(), savedReview.getOverallRating());

        return savedReview;
    }

    /**
     * 리뷰 수정
     */
    public Review updateReview(Long reviewId, Member reviewer, ReviewUpdateRequest request) {
        log.info("리뷰 수정: ID={}, 작성자ID={}", reviewId, reviewer.getId());

        Review review = reviewRepository.findByIdAndReviewerId(reviewId, reviewer.getId())
                .orElseThrow(() -> new IllegalArgumentException("수정 권한이 없거나 리뷰를 찾을 수 없습니다"));

        // 수정 가능 여부 확인 (24시간 이내)
        if (!review.isEditable(reviewer)) {
            throw new IllegalArgumentException("리뷰 수정 기간이 지났습니다 (24시간 제한)");
        }

        // 리뷰 업데이트
        if (request.getTitle() != null) {
            review.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            review.setContent(request.getContent());
        }
        if (request.getOverallRating() != null) {
            review.setOverallRating(request.getOverallRating());
        }
        if (request.getServiceQualityRating() != null) {
            review.setServiceQualityRating(request.getServiceQualityRating());
        }
        if (request.getFacilityRating() != null) {
            review.setFacilityRating(request.getFacilityRating());
        }
        if (request.getStaffRating() != null) {
            review.setStaffRating(request.getStaffRating());
        }
        if (request.getPriceRating() != null) {
            review.setPriceRating(request.getPriceRating());
        }
        if (request.getAccessibilityRating() != null) {
            review.setAccessibilityRating(request.getAccessibilityRating());
        }
        if (request.getRecommended() != null) {
            review.setRecommended(request.getRecommended());
        }

        Review updatedReview = reviewRepository.save(review);
        log.info("리뷰 수정 완료: ID={}", updatedReview.getId());

        return updatedReview;
    }

    /**
     * 리뷰 삭제 (soft delete)
     */
    public void deleteReview(Long reviewId, Member reviewer) {
        log.info("리뷰 삭제: ID={}, 작성자ID={}", reviewId, reviewer.getId());

        Review review = reviewRepository.findByIdAndReviewerId(reviewId, reviewer.getId())
                .orElseThrow(() -> new IllegalArgumentException("삭제 권한이 없거나 리뷰를 찾을 수 없습니다"));

        review.delete();
        reviewRepository.save(review);

        log.info("리뷰 삭제 완료: ID={}", reviewId);
    }

    /**
     * 리뷰에 도움됨 투표
     */
    public void voteHelpful(Long reviewId, Member voter) {
        log.info("도움됨 투표: 리뷰ID={}, 투표자ID={}", reviewId, voter.getId());

        // 중복 투표 확인
        Optional<ReviewVote> existingVote = reviewVoteRepository.findByReviewIdAndVoterId(reviewId, voter.getId());
        if (existingVote.isPresent()) {
            if (existingVote.get().isHelpful()) {
                throw new IllegalArgumentException("이미 도움됨으로 투표하셨습니다");
            }
            // 기존 '도움안됨' 투표를 '도움됨'으로 변경
            existingVote.get().setVoteType(ReviewVote.VoteType.HELPFUL);
            reviewVoteRepository.save(existingVote.get());
            
            // 카운트 업데이트
            reviewRepository.updateHelpfulCount(reviewId, 1);
            reviewRepository.updateNotHelpfulCount(reviewId, -1);
        } else {
            // 새 투표 생성
            Review review = getReviewById(reviewId);
            ReviewVote vote = new ReviewVote();
            vote.setReview(review);
            vote.setVoter(voter);
            vote.setVoteType(ReviewVote.VoteType.HELPFUL);
            reviewVoteRepository.save(vote);

            // 카운트 업데이트
            reviewRepository.updateHelpfulCount(reviewId, 1);
        }

        log.info("도움됨 투표 완료: 리뷰ID={}", reviewId);
    }

    /**
     * 리뷰에 도움안됨 투표
     */
    public void voteNotHelpful(Long reviewId, Member voter) {
        log.info("도움안됨 투표: 리뷰ID={}, 투표자ID={}", reviewId, voter.getId());

        // 중복 투표 확인
        Optional<ReviewVote> existingVote = reviewVoteRepository.findByReviewIdAndVoterId(reviewId, voter.getId());
        if (existingVote.isPresent()) {
            if (existingVote.get().isNotHelpful()) {
                throw new IllegalArgumentException("이미 도움안됨으로 투표하셨습니다");
            }
            // 기존 '도움됨' 투표를 '도움안됨'으로 변경
            existingVote.get().setVoteType(ReviewVote.VoteType.NOT_HELPFUL);
            reviewVoteRepository.save(existingVote.get());
            
            // 카운트 업데이트
            reviewRepository.updateHelpfulCount(reviewId, -1);
            reviewRepository.updateNotHelpfulCount(reviewId, 1);
        } else {
            // 새 투표 생성
            Review review = getReviewById(reviewId);
            ReviewVote vote = new ReviewVote();
            vote.setReview(review);
            vote.setVoter(voter);
            vote.setVoteType(ReviewVote.VoteType.NOT_HELPFUL);
            reviewVoteRepository.save(vote);

            // 카운트 업데이트
            reviewRepository.updateNotHelpfulCount(reviewId, 1);
        }

        log.info("도움안됨 투표 완료: 리뷰ID={}", reviewId);
    }

    /**
     * 리뷰 신고
     */
    public void reportReview(Long reviewId, Member reporter, ReviewReport.ReportReason reason, String description) {
        log.info("리뷰 신고: 리뷰ID={}, 신고자ID={}, 사유={}", reviewId, reporter.getId(), reason);

        // 중복 신고 확인
        if (reviewReportRepository.existsByReviewIdAndReporterId(reviewId, reporter.getId())) {
            throw new IllegalArgumentException("이미 해당 리뷰를 신고하셨습니다");
        }

        Review review = getReviewById(reviewId);
        
        ReviewReport report = new ReviewReport();
        report.setReview(review);
        report.setReporter(reporter);
        report.setReason(reason);
        report.setDescription(description);
        
        reviewReportRepository.save(report);

        // 리뷰의 신고 횟수 증가
        review.incrementReportCount();
        reviewRepository.save(review);

        log.info("리뷰 신고 완료: 리뷰ID={}", reviewId);
    }

    /**
     * 시설 평균 평점 조회
     */
    @Cacheable(value = "facilityRating", key = "#facilityId")
    @Transactional(readOnly = true)
    public BigDecimal getFacilityAverageRating(Long facilityId) {
        log.debug("시설 평균 평점 조회: 시설ID={}", facilityId);
        return reviewRepository.findAverageRatingByFacility(facilityId)
                .orElse(BigDecimal.ZERO);
    }

    /**
     * 시설 리뷰 수 조회
     */
    @Transactional(readOnly = true)
    public long getFacilityReviewCount(Long facilityId) {
        log.debug("시설 리뷰 수 조회: 시설ID={}", facilityId);
        return reviewRepository.countActiveReviewsByFacility(facilityId);
    }

    /**
     * 시설 추천 비율 조회
     */
    @Transactional(readOnly = true)
    public Double getFacilityRecommendationPercentage(Long facilityId) {
        log.debug("시설 추천 비율 조회: 시설ID={}", facilityId);
        return reviewRepository.findRecommendationPercentageByFacility(facilityId)
                .orElse(0.0);
    }

    /**
     * 평점 범위로 리뷰 검색
     */
    @Transactional(readOnly = true)
    public Page<Review> getReviewsByRatingRange(Long facilityId, BigDecimal minRating, BigDecimal maxRating, Pageable pageable) {
        log.debug("평점 범위 리뷰 검색: 시설ID={}, 범위={}-{}", facilityId, minRating, maxRating);
        return reviewRepository.findByFacilityAndRatingRange(facilityId, minRating, maxRating, pageable);
    }

    /**
     * 검증된 리뷰만 조회
     */
    @Transactional(readOnly = true)
    public Page<Review> getVerifiedReviewsByFacility(Long facilityId, Pageable pageable) {
        log.debug("검증된 리뷰 조회: 시설ID={}", facilityId);
        return reviewRepository.findVerifiedReviewsByFacility(facilityId, pageable);
    }

    /**
     * 이미지가 포함된 리뷰 조회
     */
    @Transactional(readOnly = true)
    public Page<Review> getReviewsWithImagesByFacility(Long facilityId, Pageable pageable) {
        log.debug("이미지 포함 리뷰 조회: 시설ID={}", facilityId);
        return reviewRepository.findReviewsWithImagesByFacility(facilityId, pageable);
    }

    /**
     * 관리자용 - 신고된 리뷰 조회
     */
    @Transactional(readOnly = true)
    public Page<Review> getReportedReviews(Pageable pageable) {
        log.debug("신고된 리뷰 조회");
        return reviewRepository.findReportedReviews(pageable);
    }

    /**
     * 관리자용 - 리뷰에 관리자 응답 추가
     */
    public Review addAdminResponse(Long reviewId, Member admin, String response) {
        log.info("관리자 응답 추가: 리뷰ID={}, 관리자ID={}", reviewId, admin.getId());

        Review review = getReviewById(reviewId);
        review.addAdminResponse(response, admin);
        
        Review updatedReview = reviewRepository.save(review);
        log.info("관리자 응답 추가 완료: 리뷰ID={}", reviewId);

        return updatedReview;
    }

}