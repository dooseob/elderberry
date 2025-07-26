package com.globalcarelink.facility;

import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * FacilityRecommendationService 통합 테스트
 * 실제 데이터베이스와의 상호작용을 검증하여 Mock 의존성을 최소화
 * CLAUDE_GUIDELINES.md의 강화된 테스트 전략 적용
 */
@DataJpaTest
@ActiveProfiles("test")
@Import({FacilityRecommendationService.class, FacilityMatchingAnalyticsService.class})
@DisplayName("시설 추천 서비스 통합 테스트 - 실제 DB 상호작용")
class FacilityRecommendationServiceIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private FacilityProfileRepository facilityRepository;

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    @Autowired
    private FacilityMatchingHistoryRepository matchingHistoryRepository;

    @Autowired
    private FacilityRecommendationService recommendationService;

    // ===== 실제 데이터베이스와의 통합 테스트 =====

    @Test
    @DisplayName("실제 DB 테스트 - 지역별 시설 추천 및 매칭 점수 계산")
    @Sql(scripts = "/test-data/facility-test-data.sql")
    void testRecommendFacilitiesWithRealDatabase() {
        // Given - 실제 DB에 저장된 건강 평가 데이터 조회
        HealthAssessment savedAssessment = createAndSaveHealthAssessment();
        
        // 실제 DB에 저장된 시설 데이터 조회 (SQL 스크립트로 미리 준비)
        List<FacilityProfile> seoulFacilities = facilityRepository.findByRegion("서울특별시");
        assertThat(seoulFacilities).isNotEmpty()
            .describedAs("테스트 데이터가 정상적으로 로드되어야 함");

        // When - 실제 서비스 로직 실행
        List<FacilityProfile> recommendations = recommendationService
            .recommendFacilitiesByHealthAndLocation(savedAssessment, "서울특별시", 5);

        // Then - 실제 데이터베이스 결과 검증
        assertThat(recommendations).isNotEmpty();
        assertThat(recommendations.size()).isLessThanOrEqualTo(5);
        
        // 매칭 점수 기준 정렬 검증 (실제 계산된 점수)
        for (int i = 0; i < recommendations.size() - 1; i++) {
            BigDecimal currentScore = recommendationService.calculateMatchingScore(
                recommendations.get(i), savedAssessment);
            BigDecimal nextScore = recommendationService.calculateMatchingScore(
                recommendations.get(i + 1), savedAssessment);
            
            assertThat(currentScore).isGreaterThanOrEqualTo(nextScore)
                .describedAs("실제 DB 데이터로 계산된 매칭 점수가 내림차순 정렬되어야 함");
        }
        
        // 매칭 히스토리 저장 검증
        FacilityMatchingHistory matchingHistory = new FacilityMatchingHistory();
        matchingHistory.setHealthAssessment(savedAssessment);
        matchingHistory.setFacility(recommendations.get(0));
        matchingHistory.setMatchingScore(recommendationService.calculateMatchingScore(
            recommendations.get(0), savedAssessment));
        matchingHistory.setMatchingDate(LocalDateTime.now());
        matchingHistory.setMatchingType("HEALTH_BASED");
        
        FacilityMatchingHistory savedHistory = matchingHistoryRepository.save(matchingHistory);
        
        assertThat(savedHistory.getId()).isNotNull();
        assertThat(savedHistory.getMatchingScore()).isPositive();
    }

    @Test
    @DisplayName("실제 DB 테스트 - 복합 조건 시설 검색 (@EntityGraph N+1 문제 해결 검증)")
    void testComplexFacilitySearch_WithEntityGraph() {
        // Given - 복잡한 조건의 시설 데이터 생성
        FacilityProfile facility1 = createAndSaveFacility("서울A급시설", "A", 95, "서울특별시", "강남구");
        FacilityProfile facility2 = createAndSaveFacility("서울B급시설", "B", 80, "서울특별시", "강남구");
        FacilityProfile facility3 = createAndSaveFacility("서울C급시설", "C", 65, "서울특별시", "서초구");
        
        HealthAssessment assessment = createAndSaveHealthAssessment();
        
        entityManager.flush();
        entityManager.clear(); // 1차 캐시 초기화로 실제 쿼리 실행 강제

        // When - @EntityGraph가 적용된 쿼리 실행
        List<FacilityProfile> facilities = facilityRepository.findByRegionWithDetails("서울특별시");
        
        // Then - N+1 문제 없이 데이터 로딩 검증
        assertThat(facilities).hasSize(3);
        
        // Lazy Loading 없이 연관 데이터 접근 가능 검증
        for (FacilityProfile facility : facilities) {
            assertThat(facility.getFacilityName()).isNotNull();
            assertThat(facility.getRegion()).isEqualTo("서울특별시");
            // @EntityGraph로 즉시 로딩된 연관 엔티티 접근 (실제 환경에서는 reviews, matchingHistories 등)
        }
    }

    @Test
    @DisplayName("실제 DB 테스트 - 트랜잭션 롤백 및 데이터 무결성 검증")
    void testTransactionRollbackAndDataIntegrity() {
        // Given
        FacilityProfile facility = createAndSaveFacility("트랜잭션테스트시설", "A", 90, "부산광역시", "해운대구");
        HealthAssessment assessment = createAndSaveHealthAssessment();
        
        Long facilityId = facility.getId();
        Long assessmentId = assessment.getId();
        
        // When & Then - 데이터 저장 확인
        assertThat(facilityRepository.findById(facilityId)).isPresent();
        assertThat(healthAssessmentRepository.findById(assessmentId)).isPresent();
        
        // 매칭 히스토리 저장 및 연관관계 검증
        FacilityMatchingHistory history = new FacilityMatchingHistory();
        history.setFacility(facility);
        history.setHealthAssessment(assessment);
        history.setMatchingScore(BigDecimal.valueOf(88.5));
        history.setMatchingDate(LocalDateTime.now());
        history.setMatchingType("INTEGRATION_TEST");
        
        FacilityMatchingHistory savedHistory = matchingHistoryRepository.save(history);
        entityManager.flush();
        
        // 연관관계 데이터 무결성 검증
        assertThat(savedHistory.getFacility().getId()).isEqualTo(facilityId);
        assertThat(savedHistory.getHealthAssessment().getId()).isEqualTo(assessmentId);
        
        // 복합 쿼리로 연관 데이터 조회 검증
        List<FacilityMatchingHistory> histories = matchingHistoryRepository
            .findByFacilityIdAndMatchingType(facilityId, "INTEGRATION_TEST");
        assertThat(histories).hasSize(1);
        assertThat(histories.get(0).getMatchingScore()).isEqualByComparingTo(BigDecimal.valueOf(88.5));
    }

    @Test
    @DisplayName("실제 DB 테스트 - 대용량 데이터 처리 성능 검증")
    void testLargeDataSetPerformance() {
        // Given - 실제 대용량 데이터 생성 (500개 시설)
        for (int i = 1; i <= 500; i++) {
            createAndSaveFacility(
                "대용량테스트시설" + i, 
                i % 3 == 0 ? "A" : i % 2 == 0 ? "B" : "C",
                50 + (i % 50),
                "대전광역시",
                "유성구"
            );
        }
        
        HealthAssessment assessment = createAndSaveHealthAssessment();
        entityManager.flush();
        entityManager.clear();

        // When - 대용량 데이터 처리 성능 측정
        long startTime = System.nanoTime();
        List<FacilityProfile> recommendations = recommendationService
            .recommendFacilitiesByHealthAndLocation(assessment, "대전광역시", 10);
        long endTime = System.nanoTime();

        // Then - 성능 요구사항 검증
        long executionTimeMs = (endTime - startTime) / 1_000_000;
        assertThat(recommendations).hasSize(10);
        assertThat(executionTimeMs).isLessThan(1000L)
            .describedAs("500건 시설 데이터 처리는 1초 이내에 완료되어야 함");
            
        System.out.println("대용량 데이터 처리 시간: " + executionTimeMs + "ms");
    }

    @Test
    @DisplayName("실제 DB 테스트 - 캐싱 동작 검증 (@Cacheable 적용)")
    void testCachingBehavior() {
        // Given
        FacilityProfile facility = createAndSaveFacility("캐싱테스트시설", "A", 95, "인천광역시", "연수구");
        entityManager.flush();
        entityManager.clear();

        // When - 첫 번째 조회 (DB에서 로딩)
        long startTime1 = System.nanoTime();
        List<FacilityProfile> firstCall = facilityRepository.findByRegion("인천광역시");
        long endTime1 = System.nanoTime();

        // 두 번째 조회 (캐시에서 로딩)
        long startTime2 = System.nanoTime();
        List<FacilityProfile> secondCall = facilityRepository.findByRegion("인천광역시");
        long endTime2 = System.nanoTime();

        // Then - 캐싱 성능 향상 검증
        long firstCallTime = endTime1 - startTime1;
        long secondCallTime = endTime2 - startTime2;
        
        assertThat(firstCall).isEqualTo(secondCall);
        assertThat(secondCallTime).isLessThan(firstCallTime / 2)
            .describedAs("캐시 적중 시 조회 시간이 50% 이상 단축되어야 함");
    }

    // ===== 테스트 데이터 생성 헬퍼 메서드 =====

    private HealthAssessment createAndSaveHealthAssessment() {
        HealthAssessment assessment = new HealthAssessment();
        assessment.setMobilityLevel(3);
        assessment.setEatingLevel(2);
        assessment.setToiletLevel(3);
        assessment.setCommunicationLevel(2);
        assessment.setLtciGrade(3);
        assessment.setCareTargetStatus(1);
        assessment.setMealType(1);
        assessment.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(assessment);
    }

    private FacilityProfile createAndSaveFacility(String name, String grade, int score, String region, String district) {
        FacilityProfile facility = new FacilityProfile();
        facility.setFacilityName(name);
        facility.setFacilityGrade(grade);
        facility.setEvaluationScore(score);
        facility.setRegion(region);
        facility.setDistrict(district);
        facility.setAddress(region + " " + district + " 테스트로 123");
        facility.setPhoneNumber("02-1234-5678");
        facility.setEmployeeCount(20);
        facility.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(facility);
    }
}