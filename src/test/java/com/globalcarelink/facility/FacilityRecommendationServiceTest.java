package com.globalcarelink.facility;

import com.globalcarelink.health.HealthAssessment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * FacilityRecommendationService 핵심 비즈니스 로직 테스트
 * Strategy 패턴, 매칭 알고리즘, 성능 요구사항 검증
 * CLAUDE_GUIDELINES.md 강화된 테스트 기준 적용
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("시설 추천 서비스 핵심 로직 테스트")
class FacilityRecommendationServiceTest {

    @Mock
    private FacilityProfileRepository facilityRepository;

    @Mock
    private FacilityMatchingHistoryRepository matchingHistoryRepository;

    @InjectMocks
    private FacilityRecommendationService recommendationService;

    private FacilityProfile excellentFacility;
    private FacilityProfile averageFacility;
    private FacilityProfile poorFacility;
    private HealthAssessment highNeedAssessment;
    private HealthAssessment lowNeedAssessment;

    @BeforeEach
    void setUp() {
        // 다양한 품질의 시설 데이터 생성
        excellentFacility = createFacility(1L, "우수시설", "A", 95, Arrays.asList(1, 2, 3, 4, 5));
        averageFacility = createFacility(2L, "일반시설", "B", 70, Arrays.asList(3, 4, 5));
        poorFacility = createFacility(3L, "미흡시설", "C", 45, Arrays.asList(4, 5));

        // 다양한 케어 니즈의 건강 평가 데이터 생성
        highNeedAssessment = createHealthAssessment(3, 3, 3, 3, 5); // 고돌봄 필요
        lowNeedAssessment = createHealthAssessment(1, 1, 1, 1, 1); // 저돌봄 필요
    }

    // ===== 핵심 비즈니스 로직 테스트 =====

    @Test
    @DisplayName("매칭 점수 계산 - 고돌봄 환자와 우수시설 매칭")
    void testCalculateMatchingScore_HighNeedWithExcellentFacility() {
        // Given
        when(facilityRepository.findById(excellentFacility.getId()))
                .thenReturn(Optional.of(excellentFacility));

        // When
        BigDecimal matchingScore = recommendationService.calculateMatchingScore(
                excellentFacility, highNeedAssessment);

        // Then
        assertThat(matchingScore).isGreaterThan(BigDecimal.valueOf(85))
                .describedAs("고돌봄 환자와 우수시설 매칭 시 85점 이상이어야 함");
        
        // 점수 구성 요소 검증
        assertThat(matchingScore).isLessThan(BigDecimal.valueOf(100))
                .describedAs("매칭 점수는 100점을 초과할 수 없음");
    }

    @Test
    @DisplayName("매칭 점수 계산 - 저돌봄 환자와 미흡시설 매칭")
    void testCalculateMatchingScore_LowNeedWithPoorFacility() {
        // Given
        when(facilityRepository.findById(poorFacility.getId()))
                .thenReturn(Optional.of(poorFacility));

        // When
        BigDecimal matchingScore = recommendationService.calculateMatchingScore(
                poorFacility, lowNeedAssessment);

        // Then
        assertThat(matchingScore).isBetween(
                BigDecimal.valueOf(30), BigDecimal.valueOf(70))
                .describedAs("저돌봄 환자와 미흡시설 매칭 시 30-70점 범위");
    }

    @Test
    @DisplayName("시설 추천 리스트 - 매칭 점수 기준 정렬 검증")
    void testRecommendFacilities_SortedByMatchingScore() {
        // Given
        List<FacilityProfile> allFacilities = Arrays.asList(
                poorFacility, excellentFacility, averageFacility);
        when(facilityRepository.findByRegion("서울특별시"))
                .thenReturn(allFacilities);

        // When
        List<FacilityProfile> recommendations = recommendationService
                .recommendFacilitiesByHealthAndLocation(highNeedAssessment, "서울특별시", 3);

        // Then
        assertThat(recommendations).hasSize(3)
                .describedAs("요청한 개수만큼 추천 결과 반환");
                
        // 매칭 점수 기준 내림차순 정렬 확인
        for (int i = 0; i < recommendations.size() - 1; i++) {
            BigDecimal currentScore = recommendationService.calculateMatchingScore(
                    recommendations.get(i), highNeedAssessment);
            BigDecimal nextScore = recommendationService.calculateMatchingScore(
                    recommendations.get(i + 1), highNeedAssessment);
            
            assertThat(currentScore).isGreaterThanOrEqualTo(nextScore)
                    .describedAs("추천 결과는 매칭 점수 기준 내림차순 정렬되어야 함");
        }
    }

    @Test
    @DisplayName("Strategy 패턴 - 거리 기반 매칭 전략")
    void testDistanceBasedMatchingStrategy() {
        // Given
        String userLocation = "서울특별시 강남구 역삼동";
        List<FacilityProfile> nearbyFacilities = Arrays.asList(excellentFacility, averageFacility);
        
        when(facilityRepository.findByLocationWithinRadius(eq(userLocation), eq(10.0)))
                .thenReturn(nearbyFacilities);

        // When
        List<FacilityProfile> recommendations = recommendationService
                .recommendByDistanceStrategy(userLocation, 10.0, 2);

        // Then
        assertThat(recommendations).hasSize(2);
        verify(facilityRepository).findByLocationWithinRadius(userLocation, 10.0);
        
        // 거리 기반 정렬 확인 (가까운 순)
        assertThat(recommendations).isSortedAccordingTo(
                Comparator.comparing(facility -> 
                    calculateDistance(userLocation, facility.getAddress())));
    }

    @Test
    @DisplayName("Strategy 패턴 - 평점 기반 매칭 전략")
    void testRatingBasedMatchingStrategy() {
        // Given
        List<FacilityProfile> topRatedFacilities = Arrays.asList(
                excellentFacility, averageFacility, poorFacility);
        
        when(facilityRepository.findTopRatedFacilities(3))
                .thenReturn(topRatedFacilities);

        // When
        List<FacilityProfile> recommendations = recommendationService
                .recommendByRatingStrategy(3);

        // Then
        assertThat(recommendations).hasSize(3);
        verify(facilityRepository).findTopRatedFacilities(3);
        
        // 평점 기준 정렬 확인 (높은 순)
        assertThat(recommendations).isSortedAccordingTo(
                Comparator.comparing(FacilityProfile::getEvaluationScore).reversed());
    }

    // ===== 예외 상황 및 엣지 케이스 테스트 =====

    @Test
    @DisplayName("빈 추천 결과 처리 - 조건에 맞는 시설이 없는 경우")
    void testRecommendFacilities_EmptyResult() {
        // Given
        when(facilityRepository.findByRegion("제주특별자치도"))
                .thenReturn(Collections.emptyList());

        // When
        List<FacilityProfile> recommendations = recommendationService
                .recommendFacilitiesByHealthAndLocation(highNeedAssessment, "제주특별자치도", 5);

        // Then
        assertThat(recommendations).isEmpty()
                .describedAs("조건에 맞는 시설이 없으면 빈 리스트 반환");
        verify(facilityRepository).findByRegion("제주특별자치도");
    }

    @Test
    @DisplayName("잘못된 입력값 처리 - null 건강평가")
    void testRecommendFacilities_NullHealthAssessment() {
        // Given & When & Then
        assertThatThrownBy(() -> 
                recommendationService.recommendFacilitiesByHealthAndLocation(
                        null, "서울특별시", 5))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("건강 평가 데이터는 필수입니다");
    }

    @Test
    @DisplayName("잘못된 입력값 처리 - 빈 지역명")
    void testRecommendFacilities_EmptyRegion() {
        // Given & When & Then
        assertThatThrownBy(() -> 
                recommendationService.recommendFacilitiesByHealthAndLocation(
                        highNeedAssessment, "", 5))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("지역 정보는 필수입니다");
    }

    @Test
    @DisplayName("잘못된 입력값 처리 - 음수 추천 개수")
    void testRecommendFacilities_NegativeLimit() {
        // Given & When & Then
        assertThatThrownBy(() -> 
                recommendationService.recommendFacilitiesByHealthAndLocation(
                        highNeedAssessment, "서울특별시", -1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("추천 개수는 양수여야 합니다");
    }

    // ===== 성능 테스트 =====

    @Test
    @DisplayName("매칭 알고리즘 성능 테스트 - 1000건 처리 시간")
    @Timeout(value = 1, unit = TimeUnit.SECONDS)
    void testMatchingAlgorithmPerformance() {
        // Given
        List<FacilityProfile> largeFacilityList = createLargeFacilityDataSet(1000);
        when(facilityRepository.findByRegion("서울특별시"))
                .thenReturn(largeFacilityList);

        // When
        long startTime = System.nanoTime();
        List<FacilityProfile> recommendations = recommendationService
                .recommendFacilitiesByHealthAndLocation(highNeedAssessment, "서울특별시", 10);
        long endTime = System.nanoTime();

        // Then
        assertThat(recommendations).hasSize(10);
        Duration executionTime = Duration.ofNanos(endTime - startTime);
        assertThat(executionTime).isLessThan(Duration.ofMillis(500))
                .describedAs("1000건 처리는 500ms 이내에 완료되어야 함");
        
        log.info("매칭 알고리즘 성능: {}ms (1000건 처리)", executionTime.toMillis());
    }

    // ===== 헬퍼 메서드들 =====
    
    /**
     * 테스트용 시설 데이터 생성 (간소화된 버전)
     */
    private FacilityProfile createFacility(Long id, String name, String grade, int score, List<Integer> careGrades) {
        FacilityProfile facility = new FacilityProfile();
        facility.setId(id);
        facility.setFacilityName(name);
        facility.setFacilityGrade(grade);
        facility.setEvaluationScore(score);
        facility.setRegion("서울특별시");
        facility.setDistrict("강남구");
        facility.setAddress("서울특별시 강남구 테스트로 " + id);
        // acceptableCareGrades는 실제 엔티티 필드와 타입 매칭 필요
        return facility;
    }

    /**
     * 테스트용 건강 평가 데이터 생성 (다양한 케어 니즈 버전)
     */
    private HealthAssessment createHealthAssessment(int mobility, int eating, int toilet, int communication, int ltciGrade) {
        HealthAssessment assessment = new HealthAssessment();
        assessment.setMobilityLevel(mobility);
        assessment.setEatingLevel(eating);
        assessment.setToiletLevel(toilet);
        assessment.setCommunicationLevel(communication);
        assessment.setLtciGrade(ltciGrade);
        assessment.setCareTargetStatus(1);
        assessment.setMealType(1);
        return assessment;
    }

    /**
     * 성능 테스트용 대용량 데이터 생성
     */
    private List<FacilityProfile> createLargeFacilityDataSet(int size) {
        List<FacilityProfile> facilities = new ArrayList<>();
        for (int i = 1; i <= size; i++) {
            FacilityProfile facility = new FacilityProfile();
            facility.setId((long) i);
            facility.setFacilityName("테스트시설" + i);
            facility.setFacilityGrade(i % 3 == 0 ? "A" : i % 2 == 0 ? "B" : "C");
            facility.setEvaluationScore(50 + (i % 50)); // 50-99 점수 범위
            facility.setRegion("서울특별시");
            facilities.add(facility);
        }
        return facilities;
    }

    /**
     * 거리 계산 헬퍼 (간소화된 버전)
     */
    private double calculateDistance(String location1, String location2) {
        // 실제 구현에서는 좌표 기반 거리 계산
        // 테스트용으로는 문자열 길이 차이로 대체
        return Math.abs(location1.length() - location2.length());
    }
} 