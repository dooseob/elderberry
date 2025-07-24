package com.globalcarelink.review;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.facility.FacilityProfile;
import com.globalcarelink.facility.FacilityProfileRepository;
import com.globalcarelink.review.dto.ReviewCreateRequest;
import com.globalcarelink.review.dto.ReviewUpdateRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.awaitility.Awaitility.await;

/**
 * ReviewService 통합 테스트
 * 실제 데이터베이스와의 상호작용을 검증하여 비즈니스 로직의 신뢰성 확보
 * Mock 의존성을 최소화하고 실제 운영 환경과 유사한 조건에서 테스트
 */
@DataJpaTest
@ActiveProfiles("test")
@Import({ReviewService.class})
@DisplayName("리뷰 서비스 통합 테스트 - 실제 DB 상호작용")
class ReviewServiceIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewVoteRepository reviewVoteRepository;

    @Autowired
    private ReviewReportRepository reviewReportRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private FacilityProfileRepository facilityRepository;

    // ===== 핵심 비즈니스 로직 통합 테스트 =====

    @Test
    @DisplayName("실제 DB 테스트 - 리뷰 생성 및 중복 검증")
    @Transactional
    void testCreateReview_WithDuplicateValidation() {
        // Given - 실제 DB에 저장된 회원과 시설 데이터
        Member reviewer = createAndSaveMember("reviewer1", "리뷰어1");
        FacilityProfile facility = createAndSaveFacility("테스트시설1");
        
        ReviewCreateRequest request = new ReviewCreateRequest();
        request.setTitle("훌륭한 시설입니다");
        request.setContent("직원분들이 정말 친절하고 시설도 깨끗합니다.");
        request.setOverallRating(BigDecimal.valueOf(4.5));
        request.setServiceQualityRating(BigDecimal.valueOf(4.0));
        request.setFacilityRating(BigDecimal.valueOf(5.0));
        request.setStaffRating(BigDecimal.valueOf(4.5));
        request.setPriceRating(BigDecimal.valueOf(4.0));
        request.setAccessibilityRating(BigDecimal.valueOf(4.5));
        request.setRecommended(true);
        request.setAnonymous(false);

        // When - 첫 번째 리뷰 생성
        Review savedReview = reviewService.createReview(facility.getId(), reviewer, request);
        entityManager.flush();

        // Then - 정상 생성 검증
        assertThat(savedReview.getId()).isNotNull();
        assertThat(savedReview.getTitle()).isEqualTo("훌륭한 시설입니다");
        assertThat(savedReview.getOverallRating()).isEqualByComparingTo(BigDecimal.valueOf(4.5));
        assertThat(savedReview.getReviewer().getId()).isEqualTo(reviewer.getId());
        assertThat(savedReview.getFacility().getId()).isEqualTo(facility.getId());

        // When & Then - 중복 리뷰 생성 시 예외 발생 검증
        assertThatThrownBy(() -> reviewService.createReview(facility.getId(), reviewer, request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 해당 시설에 리뷰를 작성하셨습니다");
    }

    @Test
    @DisplayName("실제 DB 테스트 - 리뷰 투표 시스템 및 동시성 처리")
    @Transactional
    void testReviewVotingSystem_WithConcurrency() {
        // Given - 리뷰와 투표자들 준비
        Member reviewer = createAndSaveMember("reviewer2", "리뷰어2");
        Member voter1 = createAndSaveMember("voter1", "투표자1");
        Member voter2 = createAndSaveMember("voter2", "투표자2");
        Member voter3 = createAndSaveMember("voter3", "투표자3");
        FacilityProfile facility = createAndSaveFacility("테스트시설2");
        
        ReviewCreateRequest reviewRequest = new ReviewCreateRequest();
        reviewRequest.setTitle("평균적인 시설");
        reviewRequest.setContent("보통 수준의 시설입니다.");
        reviewRequest.setOverallRating(BigDecimal.valueOf(3.0));
        reviewRequest.setRecommended(true);
        
        Review review = reviewService.createReview(facility.getId(), reviewer, reviewRequest);
        entityManager.flush();

        // When - 동시 투표 시뮬레이션 (비동기 처리)
        CompletableFuture<Void> vote1 = CompletableFuture.runAsync(() -> 
            reviewService.voteHelpful(review.getId(), voter1));
        CompletableFuture<Void> vote2 = CompletableFuture.runAsync(() -> 
            reviewService.voteHelpful(review.getId(), voter2));
        CompletableFuture<Void> vote3 = CompletableFuture.runAsync(() -> 
            reviewService.voteNotHelpful(review.getId(), voter3));

        // Then - 모든 투표 완료 대기 및 결과 검증
        await().atMost(5, TimeUnit.SECONDS).until(() -> {
            return vote1.isDone() && vote2.isDone() && vote3.isDone();
        });

        entityManager.flush();
        entityManager.clear(); // 1차 캐시 초기화
        
        Review updatedReview = reviewRepository.findById(review.getId()).orElseThrow();
        
        assertThat(updatedReview.getHelpfulCount()).isEqualTo(2);
        assertThat(updatedReview.getNotHelpfulCount()).isEqualTo(1);
        
        // 투표 중복 방지 검증
        List<ReviewVote> votes = reviewVoteRepository.findByReviewId(review.getId());
        assertThat(votes).hasSize(3);
        assertThat(votes.stream().map(vote -> vote.getVoter().getId()).distinct().count()).isEqualTo(3);
    }

    @Test
    @DisplayName("실제 DB 테스트 - 리뷰 신고 및 자동 상태 변경")
    @Transactional
    void testReviewReportingSystem_WithAutoStatusChange() {
        // Given - 리뷰와 신고자들 준비
        Member reviewer = createAndSaveMember("reviewer3", "리뷰어3");
        FacilityProfile facility = createAndSaveFacility("테스트시설3");
        
        ReviewCreateRequest reviewRequest = new ReviewCreateRequest();
        reviewRequest.setTitle("부적절한 리뷰");
        reviewRequest.setContent("이것은 테스트용 부적절한 내용입니다.");
        reviewRequest.setOverallRating(BigDecimal.valueOf(1.0));
        reviewRequest.setRecommended(false);
        
        Review review = reviewService.createReview(facility.getId(), reviewer, reviewRequest);
        entityManager.flush();

        // When - 5명이 신고하여 임계값 도달
        for (int i = 1; i <= 5; i++) {
            Member reporter = createAndSaveMember("reporter" + i, "신고자" + i);
            reviewService.reportReview(review.getId(), reporter, "부적절한 내용");
            entityManager.flush();
        }

        // Then - 신고 횟수 임계값 도달로 자동 상태 변경 검증
        entityManager.clear();
        Review reportedReview = reviewRepository.findById(review.getId()).orElseThrow();
        
        assertThat(reportedReview.getReportCount()).isEqualTo(5);
        assertThat(reportedReview.getStatus()).isEqualTo(Review.ReviewStatus.PENDING);
        
        // 신고 내역 저장 검증
        List<ReviewReport> reports = reviewReportRepository.findByReviewId(review.getId());
        assertThat(reports).hasSize(5);
        assertThat(reports.get(0).getReason()).isEqualTo("부적절한 내용");
    }

    @Test
    @DisplayName("실제 DB 테스트 - 시설별 리뷰 통계 계산")
    void testFacilityReviewStatistics() {
        // Given - 한 시설에 대한 여러 리뷰 생성
        FacilityProfile facility = createAndSaveFacility("통계테스트시설");
        
        // 5개의 다양한 평점 리뷰 생성
        BigDecimal[] ratings = {
            BigDecimal.valueOf(5.0), 
            BigDecimal.valueOf(4.0), 
            BigDecimal.valueOf(3.5), 
            BigDecimal.valueOf(4.5), 
            BigDecimal.valueOf(3.0)
        };
        
        for (int i = 0; i < ratings.length; i++) {
            Member reviewer = createAndSaveMember("stats_reviewer" + i, "통계리뷰어" + i);
            ReviewCreateRequest request = new ReviewCreateRequest();
            request.setTitle("리뷰 " + (i + 1));
            request.setContent("내용 " + (i + 1));
            request.setOverallRating(ratings[i]);
            request.setServiceQualityRating(ratings[i]);
            request.setFacilityRating(ratings[i]);
            request.setStaffRating(ratings[i]);
            request.setRecommended(ratings[i].compareTo(BigDecimal.valueOf(3.5)) >= 0);
            
            reviewService.createReview(facility.getId(), reviewer, request);
        }
        
        entityManager.flush();

        // When - 시설 리뷰 통계 조회
        Page<Review> facilityReviews = reviewService.getFacilityReviews(facility.getId(), PageRequest.of(0, 10));
        
        // Then - 통계 계산 검증
        assertThat(facilityReviews.getContent()).hasSize(5);
        
        // 평균 평점 계산 검증
        double expectedAverage = ratings[0].add(ratings[1]).add(ratings[2]).add(ratings[3]).add(ratings[4])
            .divide(BigDecimal.valueOf(5), 2, BigDecimal.ROUND_HALF_UP).doubleValue();
        
        double actualAverage = facilityReviews.getContent().stream()
            .mapToDouble(review -> review.getOverallRating().doubleValue())
            .average()
            .orElse(0.0);
            
        assertThat(actualAverage).isEqualTo(expectedAverage, within(0.01));
        
        // 추천율 계산 검증
        long recommendedCount = facilityReviews.getContent().stream()
            .mapToLong(review -> review.getRecommended() ? 1 : 0)
            .sum();
        assertThat(recommendedCount).isEqualTo(3); // 3.5 이상 평점 3개
    }

    @Test
    @DisplayName("실제 DB 테스트 - 관리자 응답 및 알림 시스템")
    @Transactional
    void testAdminResponseSystem() {
        // Given - 리뷰 및 관리자 준비
        Member reviewer = createAndSaveMember("reviewer4", "리뷰어4");
        Member admin = createAndSaveAdmin("admin1", "관리자1");
        FacilityProfile facility = createAndSaveFacility("관리자응답테스트시설");
        
        ReviewCreateRequest reviewRequest = new ReviewCreateRequest();
        reviewRequest.setTitle("개선이 필요한 부분");
        reviewRequest.setContent("몇 가지 개선사항이 있습니다.");
        reviewRequest.setOverallRating(BigDecimal.valueOf(2.5));
        reviewRequest.setRecommended(false);
        
        Review review = reviewService.createReview(facility.getId(), reviewer, reviewRequest);
        entityManager.flush();

        // When - 관리자 응답 추가
        String adminResponse = "소중한 의견 감사합니다. 말씀해주신 부분들을 개선하도록 하겠습니다.";
        reviewService.addAdminResponse(review.getId(), admin, adminResponse);
        
        entityManager.flush();
        entityManager.clear();

        // Then - 관리자 응답 저장 검증
        Review reviewWithResponse = reviewRepository.findById(review.getId()).orElseThrow();
        
        assertThat(reviewWithResponse.getAdminResponse()).isEqualTo(adminResponse);
        assertThat(reviewWithResponse.getAdminResponseDate()).isNotNull();
        assertThat(reviewWithResponse.getAdminResponder().getId()).isEqualTo(admin.getId());
        assertThat(reviewWithResponse.hasAdminResponse()).isTrue();
    }

    @Test
    @DisplayName("실제 DB 테스트 - 성능 테스트 (100개 리뷰 처리)")
    void testPerformanceWith100Reviews() {
        // Given - 대용량 리뷰 데이터 생성
        FacilityProfile facility = createAndSaveFacility("성능테스트시설");
        
        // When - 100개 리뷰 생성 시간 측정
        long startTime = System.nanoTime();
        
        for (int i = 1; i <= 100; i++) {
            Member reviewer = createAndSaveMember("perf_reviewer" + i, "성능테스트리뷰어" + i);
            ReviewCreateRequest request = new ReviewCreateRequest();
            request.setTitle("성능 테스트 리뷰 " + i);
            request.setContent("성능 테스트용 리뷰 내용 " + i);
            request.setOverallRating(BigDecimal.valueOf(3.0 + (i % 3) * 0.5)); // 3.0, 3.5, 4.0 순환
            request.setRecommended(true);
            
            reviewService.createReview(facility.getId(), reviewer, request);
            
            if (i % 20 == 0) {
                entityManager.flush(); // 주기적으로 flush하여 메모리 절약
            }
        }
        
        entityManager.flush();
        long endTime = System.nanoTime();

        // Then - 성능 요구사항 검증
        long executionTimeMs = (endTime - startTime) / 1_000_000;
        assertThat(executionTimeMs).isLessThan(5000L)
            .describedAs("100개 리뷰 생성은 5초 이내에 완료되어야 함");

        // 정확한 개수 저장 검증
        Page<Review> allReviews = reviewService.getFacilityReviews(facility.getId(), PageRequest.of(0, 200));
        assertThat(allReviews.getContent()).hasSize(100);
        
        System.out.println("100개 리뷰 생성 시간: " + executionTimeMs + "ms");
    }

    // ===== 테스트 데이터 생성 헬퍼 메서드 =====

    private Member createAndSaveMember(String username, String name) {
        Member member = new Member();
        member.setUsername(username);
        member.setPassword("$2a$10$dummyhash"); // 테스트용 더미 해시
        member.setName(name);
        member.setEmail(username + "@test.com");
        member.setPhoneNumber("010-1234-5678");
        member.setRole(MemberRole.MEMBER);
        member.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(member);
    }

    private Member createAndSaveAdmin(String username, String name) {
        Member admin = new Member();
        admin.setUsername(username);
        admin.setPassword("$2a$10$dummyhash");
        admin.setName(name);
        admin.setEmail(username + "@admin.com");
        admin.setPhoneNumber("010-9999-9999");
        admin.setRole(MemberRole.ADMIN);
        admin.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(admin);
    }

    private FacilityProfile createAndSaveFacility(String name) {
        FacilityProfile facility = new FacilityProfile();
        facility.setFacilityName(name);
        facility.setFacilityGrade("A");
        facility.setEvaluationScore(85);
        facility.setRegion("서울특별시");
        facility.setDistrict("강남구");
        facility.setAddress("서울특별시 강남구 테스트로 123");
        facility.setPhoneNumber("02-1234-5678");
        facility.setEmployeeCount(20);
        facility.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(facility);
    }
}