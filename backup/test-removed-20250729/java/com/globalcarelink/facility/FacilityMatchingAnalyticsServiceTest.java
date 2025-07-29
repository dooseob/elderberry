package com.globalcarelink.facility;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * 시설 매칭 분석 서비스 테스트
 * 성과 분석, 트렌드 분석, 추천 정확도 등의 핵심 기능을 검증
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("시설 매칭 분석 서비스 테스트")
class FacilityMatchingAnalyticsServiceTest {

    @Mock
    private FacilityMatchingHistoryRepository matchingHistoryRepository;

    @Mock
    private FacilityProfileRepository facilityProfileRepository;

    @InjectMocks
    private FacilityMatchingAnalyticsService analyticsService;

    private List<Object[]> mockPerformanceData;
    private List<FacilityMatchingHistory> mockHistoryData;

    @BeforeEach
    void setUp() {
        // 시설 성과 분석용 목 데이터 설정
        mockPerformanceData = Arrays.asList(
                new Object[]{1L, 10L, 8L, 4.2}, // facilityId, totalMatches, successfulMatches, avgSatisfaction
                new Object[]{2L, 15L, 12L, 4.5},
                new Object[]{3L, 8L, 5L, 3.8}
        );

        // 매칭 이력용 목 데이터 설정
        mockHistoryData = Arrays.asList(
                createMockHistory("user1", 1L, true, BigDecimal.valueOf(4.0)),
                createMockHistory("user1", 2L, false, null),
                createMockHistory("user2", 1L, true, BigDecimal.valueOf(4.5))
        );
    }

    @Test
    @DisplayName("시설별 성과 분석 - 정상 동작")
    void analyzeFacilityPerformance_Success() {
        // Given
        int days = 30;
        when(matchingHistoryRepository.calculateFacilityMatchingSuccessRate(any(LocalDateTime.class), eq(5L)))
                .thenReturn(mockPerformanceData);

        // When
        List<FacilityMatchingAnalyticsService.FacilityPerformanceReport> result = 
                analyticsService.analyzeFacilityPerformance(days);

        // Then
        assertThat(result).hasSize(3);
        
        // 첫 번째 시설 성과 검증
        FacilityMatchingAnalyticsService.FacilityPerformanceReport firstReport = result.get(0);
        assertThat(firstReport.getFacilityId()).isEqualTo(1L);
        assertThat(firstReport.getTotalMatches()).isEqualTo(10L);
        assertThat(firstReport.getSuccessfulMatches()).isEqualTo(8L);
        assertThat(firstReport.getSuccessRate()).isEqualTo(80.0);
        assertThat(firstReport.getAverageSatisfaction()).isEqualTo(4.2);
        assertThat(firstReport.getPerformanceGrade()).isEqualTo("A"); // 80% 성공률, 4.2 만족도 = A등급
    }

    @Test
    @DisplayName("매칭 트렌드 분석 - 정상 동작")
    void analyzeMatchingTrends_Success() {
        // Given
        int days = 90;
        List<Object[]> mockTrendData = Arrays.asList(
                new Object[]{"2024-01", 100L, 85L}, // month, totalMatches, successfulMatches
                new Object[]{"2024-02", 120L, 95L},
                new Object[]{"2024-03", 110L, 88L}
        );
        
        when(matchingHistoryRepository.getMonthlyMatchingTrends(any(LocalDateTime.class)))
                .thenReturn(mockTrendData);

        // When
        FacilityMatchingAnalyticsService.MatchingTrendReport result = 
                analyticsService.analyzeMatchingTrends(days);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonthlyTrends()).hasSize(3);
        
        // 전체 통계 검증
        assertThat(result.getTotalMatches()).isEqualTo(330L); // 100 + 120 + 110
        assertThat(result.getTotalSuccessfulMatches()).isEqualTo(268L); // 85 + 95 + 88
        assertThat(result.getOverallSuccessRate()).isEqualTo(81.21); // 268/330 * 100
    }

    @Test
    @DisplayName("사용자 매칭 이력 조회 - 정상 동작")
    void getUserMatchingHistory_Success() {
        // Given
        String userId = "user1";
        Pageable pageable = PageRequest.of(0, 10);
        
        when(matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc(eq(userId)))
                .thenReturn(mockHistoryData.subList(0, 2)); // user1의 이력만

        // When
        List<FacilityMatchingAnalyticsService.UserMatchingHistory> result = 
                analyticsService.getUserMatchingHistory(userId, pageable);

        // Then
        assertThat(result).hasSize(2);
        
        // 첫 번째 이력 검증
        FacilityMatchingAnalyticsService.UserMatchingHistory firstHistory = result.get(0);
        assertThat(firstHistory.getUserId()).isEqualTo("user1");
        assertThat(firstHistory.getFacilityId()).isEqualTo(1L);
        assertThat(firstHistory.isSuccessful()).isTrue();
        assertThat(firstHistory.getSatisfactionScore()).isEqualTo(BigDecimal.valueOf(4.0));
    }

    @Test
    @DisplayName("추천 정확도 분석 - 정상 동작")
    void analyzeRecommendationAccuracy_Success() {
        // Given
        int days = 30;
        List<Object[]> mockAccuracyData = Arrays.asList(
                new Object[]{1, 15L, 12L}, // rank, totalRecommendations, selectedCount
                new Object[]{2, 15L, 8L},
                new Object[]{3, 15L, 5L}
        );
        
        when(matchingHistoryRepository.calculateRecommendationAccuracyByRank(any(LocalDateTime.class)))
                .thenReturn(mockAccuracyData);

        // When
        FacilityMatchingAnalyticsService.RecommendationAccuracyReport result = 
                analyticsService.analyzeRecommendationAccuracy(days);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRankAccuracies()).hasSize(3);
        
        // 1순위 정확도 검증 (12/15 = 80%)
        FacilityMatchingAnalyticsService.RankAccuracy firstRank = result.getRankAccuracies().get(0);
        assertThat(firstRank.getRank()).isEqualTo(1);
        assertThat(firstRank.getAccuracy()).isEqualTo(80.0);
        
        // 전체 정확도 검증 ((12+8+5)/(15+15+15) = 55.56%)
        assertThat(result.getOverallAccuracy()).isEqualTo(55.56);
    }

    @Test
    @DisplayName("시설 성과 등급 계산 - 다양한 시나리오")
    void calculatePerformanceGrade_VariousScenarios() {
        // Given & When & Then
        
        // A등급: 높은 성공률 + 높은 만족도
        assertThat(calculatePerformanceGrade(85.0, 4.5)).isEqualTo("A");
        
        // B등급: 높은 성공률 + 보통 만족도
        assertThat(calculatePerformanceGrade(80.0, 4.0)).isEqualTo("B");
        
        // C등급: 보통 성공률 + 보통 만족도
        assertThat(calculatePerformanceGrade(70.0, 3.5)).isEqualTo("C");
        
        // D등급: 낮은 성공률
        assertThat(calculatePerformanceGrade(50.0, 4.0)).isEqualTo("D");
        
        // F등급: 매우 낮은 성공률
        assertThat(calculatePerformanceGrade(30.0, 3.0)).isEqualTo("F");
    }

    @Test
    @DisplayName("빈 데이터에 대한 안전한 처리")
    void handleEmptyData_Safely() {
        // Given
        when(matchingHistoryRepository.calculateFacilityMatchingSuccessRate(any(LocalDateTime.class), eq(5L)))
                .thenReturn(Arrays.asList());

        // When
        List<FacilityMatchingAnalyticsService.FacilityPerformanceReport> result = 
                analyticsService.analyzeFacilityPerformance(30);

        // Then
        assertThat(result).isEmpty();
    }

    // ===== 헬퍼 메서드 =====

    private FacilityMatchingHistory createMockHistory(String userId, Long facilityId, 
                                                     boolean isSuccessful, BigDecimal satisfaction) {
        return FacilityMatchingHistory.builder()
                .userId(userId)
                .facilityId(facilityId)
                .initialMatchScore(BigDecimal.valueOf(85.0))
                .recommendationRank(1)
                .matchingCriteria("{\"careGrade\":3}")
                .facilitySnapshot("{\"type\":\"요양시설\",\"grade\":\"A\"}")
                .estimatedCost(BigDecimal.valueOf(2000000))
                .isViewed(true)
                .isContacted(isSuccessful)
                .isVisited(isSuccessful)
                .isSelected(isSuccessful)
                .outcome(isSuccessful ? 
                        FacilityMatchingHistory.MatchingOutcome.SUCCESSFUL : 
                        FacilityMatchingHistory.MatchingOutcome.FAILED)
                .satisfactionScore(satisfaction)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();
    }

    private String calculatePerformanceGrade(double successRate, double satisfaction) {
        // 실제 FacilityMatchingAnalyticsService의 로직을 반영
        if (successRate >= 80 && satisfaction >= 4.0) return "A";
        if (successRate >= 70 && satisfaction >= 3.5) return "B";
        if (successRate >= 60 && satisfaction >= 3.0) return "C";
        if (successRate >= 40) return "D";
        return "F";
    }
} 