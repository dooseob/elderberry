package com.globalcarelink.facility;

import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;

/**
 * 시설 매칭 분석 서비스
 * AI 기반 매칭 성과 분석, 추천 정확도 개선, 트렌드 분석 제공
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FacilityMatchingAnalyticsService {

    private final FacilityMatchingHistoryRepository matchingHistoryRepository;
    private final FacilityProfileRepository facilityProfileRepository;

    // ===== 매칭 성과 분석 =====

    /**
     * 매칭 트렌드 분석
     */
    @Cacheable(value = "matching-trends", key = "#days")
    public MatchingTrendReport analyzeMatchingTrends(int days) {
        log.info("매칭 트렌드 분석 시작 - 기간: {}일", days);
        
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<FacilityMatchingHistory> histories = matchingHistoryRepository.findByCreatedAtAfter(startDate);
        
        Map<String, Long> dailyMatches = histories.stream()
                .collect(Collectors.groupingBy(
                        h -> h.getCreatedAt().toLocalDate().toString(),
                        Collectors.counting()
                ));
        
        double averageMatchesPerDay = histories.size() / (double) days;
        long successfulMatches = histories.stream()
                .mapToLong(h -> h.isSuccessfulMatch() ? 1 : 0)
                .sum();
        
        double successRate = histories.isEmpty() ? 0.0 : 
                (double) successfulMatches / histories.size() * 100;
        
        return MatchingTrendReport.builder()
                .totalMatches((long) histories.size())
                .successfulMatches(successfulMatches)
                .successRate(successRate)
                .averageMatchesPerDay(averageMatchesPerDay)
                .dailyMatchCounts(dailyMatches)
                .analysisDate(LocalDateTime.now())
                .build();
    }

    /**
     * 사용자 매칭 이력 조회
     */
    @Cacheable(value = "user-matching-history")
    public Page<UserMatchingHistory> getUserMatchingHistory(String userId, Pageable pageable) {
        log.info("사용자 매칭 이력 조회 - 사용자: {}", userId);
        
        Page<FacilityMatchingHistory> histories = matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        
        return histories.map(history -> UserMatchingHistory.builder()
                .matchingId(history.getId())
                .facilityId(history.getFacilityId())
                .matchingDate(history.getCreatedAt())
                .matchingScore(history.getInitialMatchScore())
                .status(history.getStatus().name())
                .outcome(history.getOutcome() != null ? history.getOutcome().name() : null)
                .satisfactionScore(history.getSatisfactionScore())
                .feedback(history.getFeedback())
                .build());
    }

    /**
     * 추천 정확도 분석
     */
    @Cacheable(value = "recommendation-accuracy", key = "#days")
    public RecommendationAccuracyReport analyzeRecommendationAccuracy(int days) {
        log.info("추천 정확도 분석 시작 - 기간: {}일", days);
        
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<FacilityMatchingHistory> histories = matchingHistoryRepository.findByCreatedAtAfter(startDate);
        
        Map<Integer, Long> accuracyByRank = histories.stream()
                .filter(h -> h.isSuccessfulMatch())
                .collect(Collectors.groupingBy(
                        FacilityMatchingHistory::getRecommendationRank,
                        Collectors.counting()
                ));
        
        long totalRecommendations = histories.size();
        long accurateRecommendations = histories.stream()
                .mapToLong(h -> h.isSuccessfulMatch() && h.getRecommendationRank() <= 3 ? 1 : 0)
                .sum();
        
        double overallAccuracy = totalRecommendations == 0 ? 0.0 :
                (double) accurateRecommendations / totalRecommendations * 100;
        
        return RecommendationAccuracyReport.builder()
                .totalRecommendations(totalRecommendations)
                .accurateRecommendations(accurateRecommendations)
                .overallAccuracy(overallAccuracy)
                .accuracyByRank(accuracyByRank)
                .analysisDate(LocalDateTime.now())
                .build();
    }

    /**
     * 시설별 종합 성과 분석
     */
    @Cacheable(value = "facilityPerformance", key = "#days")
    public List<FacilityPerformanceReport> analyzeFacilityPerformance(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> rawData = matchingHistoryRepository.calculateFacilityMatchingSuccessRate(startDate, 5L);
        
        return rawData.stream()
            .map(row -> FacilityPerformanceReport.builder()
                .facilityId((Long) row[0])
                .totalMatches(((Number) row[1]).longValue())
                .successfulMatches(((Number) row[2]).longValue())
                .successRate(calculateSuccessRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue()))
                .averageSatisfaction(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                .performanceGrade(calculatePerformanceGrade(
                    calculateSuccessRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue()),
                    row[3] != null ? ((Number) row[3]).doubleValue() : 0.0
                ))
                .build())
            .sorted(Comparator.comparing(FacilityPerformanceReport::getPerformanceScore).reversed())
            .collect(Collectors.toList());
    }

    /**
     * 코디네이터별 매칭 성과 분석
     */
    @Cacheable(value = "coordinatorPerformance", key = "#days")
    public List<CoordinatorPerformanceReport> analyzeCoordinatorPerformance(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> rawData = matchingHistoryRepository.calculateCoordinatorPerformance(startDate);
        
        return rawData.stream()
            .map(row -> CoordinatorPerformanceReport.builder()
                .coordinatorId((String) row[0])
                .totalMatches(((Number) row[1]).longValue())
                .successfulMatches(((Number) row[2]).longValue())
                .successRate(calculateSuccessRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue()))
                .averageMatchScore(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                .averageSatisfaction(row[4] != null ? ((Number) row[4]).doubleValue() : 0.0)
                .performanceGrade(calculateCoordinatorGrade(
                    calculateSuccessRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue()),
                    row[4] != null ? ((Number) row[4]).doubleValue() : 0.0
                ))
                .build())
            .sorted(Comparator.comparing(CoordinatorPerformanceReport::getSuccessRate).reversed())
            .collect(Collectors.toList());
    }

    // ===== 추천 시스템 분석 =====

    /**
     * 추천 순위별 효과성 분석
     */
    @Cacheable(value = "recommendationEffectiveness", key = "#days")
    public RecommendationEffectivenessReport analyzeRecommendationEffectiveness(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> rawData = matchingHistoryRepository.analyzeRecommendationRankingEffectiveness(startDate);
        
        List<RankingPerformance> rankingPerformances = rawData.stream()
            .map(row -> RankingPerformance.builder()
                .rank(((Number) row[0]).intValue())
                .totalRecommendations(((Number) row[1]).longValue())
                .viewedCount(((Number) row[2]).longValue())
                .contactedCount(((Number) row[3]).longValue())
                .selectedCount(((Number) row[4]).longValue())
                .viewRate(calculateRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue()))
                .contactRate(calculateRate(((Number) row[3]).longValue(), ((Number) row[1]).longValue()))
                .selectionRate(calculateRate(((Number) row[4]).longValue(), ((Number) row[1]).longValue()))
                .build())
            .collect(Collectors.toList());
            
        return RecommendationEffectivenessReport.builder()
            .rankingPerformances(rankingPerformances)
            .totalRecommendations(rankingPerformances.stream().mapToLong(RankingPerformance::getTotalRecommendations).sum())
            .overallViewRate(calculateOverallRate(rankingPerformances, RankingPerformance::getViewedCount))
            .overallContactRate(calculateOverallRate(rankingPerformances, RankingPerformance::getContactedCount))
            .overallSelectionRate(calculateOverallRate(rankingPerformances, RankingPerformance::getSelectedCount))
            .topRankAdvantage(calculateTopRankAdvantage(rankingPerformances))
            .build();
    }

    /**
     * 매칭 실패 원인 분석
     */
    public MatchingFailureAnalysisReport analyzeMatchingFailures(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        
        // 높은 점수였지만 실패한 매칭들
        List<FacilityMatchingHistory> missedOpportunities = 
            matchingHistoryRepository.findMissedOpportunities(BigDecimal.valueOf(80.0), startDate);
            
        // 낮은 점수였지만 성공한 매칭들
        List<FacilityMatchingHistory> unexpectedSuccesses = 
            matchingHistoryRepository.findUnexpectedSuccesses(BigDecimal.valueOf(60.0), startDate);
            
        Map<FacilityMatchingHistory.MatchingOutcome, Long> failureReasons = 
            matchingHistoryRepository.findAll().stream()
                .filter(h -> h.getStatus() == FacilityMatchingHistory.MatchingStatus.FAILED)
                .filter(h -> h.getCreatedAt().isAfter(startDate))
                .collect(Collectors.groupingBy(
                    h -> h.getOutcome() != null ? h.getOutcome() : FacilityMatchingHistory.MatchingOutcome.OTHER,
                    Collectors.counting()
                ));
        
        return MatchingFailureAnalysisReport.builder()
            .missedOpportunities(missedOpportunities.size())
            .unexpectedSuccesses(unexpectedSuccesses.size())
            .topMissedOpportunities(missedOpportunities.stream().limit(10).collect(Collectors.toList()))
            .topUnexpectedSuccesses(unexpectedSuccesses.stream().limit(10).collect(Collectors.toList()))
            .failureReasons(failureReasons)
            .algorithmAccuracy(calculateAlgorithmAccuracy(missedOpportunities.size(), unexpectedSuccesses.size()))
            .improvementOpportunities(generateImprovementSuggestions(missedOpportunities, unexpectedSuccesses))
            .build();
    }

    // ===== 트렌드 분석 =====

    /**
     * 월별 매칭 트렌드 분석
     */
    @Cacheable(value = "monthlyTrends", key = "#months")
    public List<MonthlyTrendReport> analyzeMonthlyTrends(int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
        List<Object[]> rawData = matchingHistoryRepository.getMonthlyMatchingTrends(startDate);
        
        return rawData.stream()
            .map(row -> MonthlyTrendReport.builder()
                .year(((Number) row[0]).intValue())
                .month(((Number) row[1]).intValue())
                .totalMatches(((Number) row[2]).longValue())
                .successfulMatches(((Number) row[3]).longValue())
                .successRate(calculateSuccessRate(((Number) row[3]).longValue(), ((Number) row[2]).longValue()))
                .averageMatchScore(row[4] != null ? ((Number) row[4]).doubleValue() : 0.0)
                .averageSatisfaction(row[5] != null ? ((Number) row[5]).doubleValue() : 0.0)
                .build())
            .collect(Collectors.toList());
    }

    /**
     * 시설 타입별 성과 분석
     */
    @Cacheable(value = "facilityTypePerformance", key = "#days")
    public List<FacilityTypePerformanceReport> analyzeFacilityTypePerformance(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> rawData = matchingHistoryRepository.analyzeFacilityTypePerformance(startDate);
        
        return rawData.stream()
            .map(row -> FacilityTypePerformanceReport.builder()
                .facilityType((String) row[0])
                .totalMatches(((Number) row[1]).longValue())
                .successfulMatches(((Number) row[2]).longValue())
                .successRate(calculateSuccessRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue()))
                .averageMatchScore(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                .averageSatisfaction(row[4] != null ? ((Number) row[4]).doubleValue() : 0.0)
                .recommendation(generateFacilityTypeRecommendation((String) row[0], 
                    calculateSuccessRate(((Number) row[2]).longValue(), ((Number) row[1]).longValue())))
                .build())
            .sorted(Comparator.comparing(FacilityTypePerformanceReport::getSuccessRate).reversed())
            .collect(Collectors.toList());
    }

    // ===== 실시간 성과 추적 =====

    /**
     * 실시간 매칭 현황 대시보드
     */
    public MatchingDashboard getRealTimeMatchingDashboard() {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime thisWeek = LocalDateTime.now().minusDays(7);
        LocalDateTime thisMonth = LocalDateTime.now().minusDays(30);
        
        // 오늘 매칭 현황
        List<FacilityMatchingHistory> todayMatches = matchingHistoryRepository.findAll().stream()
            .filter(h -> h.getCreatedAt().isAfter(today))
            .collect(Collectors.toList());
            
        // 진행 중인 매칭
        List<FacilityMatchingHistory> activeMatches = matchingHistoryRepository.findAll().stream()
            .filter(h -> h.getStatus() == FacilityMatchingHistory.MatchingStatus.IN_PROGRESS)
            .collect(Collectors.toList());
            
        return MatchingDashboard.builder()
            .todayMatches(todayMatches.size())
            .todaySuccesses(todayMatches.stream().mapToInt(h -> h.isSuccessfulMatch() ? 1 : 0).sum())
            .activeMatches(activeMatches.size())
            .weeklySuccessRate(calculatePeriodSuccessRate(thisWeek))
            .monthlySuccessRate(calculatePeriodSuccessRate(thisMonth))
            .avgMatchingDuration(calculateAverageMatchingDuration(thisMonth))
            .topPerformingFacilities(getTopPerformingFacilities(thisWeek, 5))
            .recentHighEngagementMatches(getRecentHighEngagementMatches(10))
            .urgentActions(identifyUrgentActions(activeMatches))
            .build();
    }

    // ===== 개선 제안 생성 =====

    /**
     * AI 기반 매칭 알고리즘 개선 제안 생성
     */
    @Async
    public void generateAlgorithmImprovementSuggestions() {
        log.info("매칭 알고리즘 개선 제안 생성 시작");
        
        // 지난 30일 데이터 기반 분석
        MatchingFailureAnalysisReport failureAnalysis = analyzeMatchingFailures(30);
        RecommendationEffectivenessReport effectiveness = analyzeRecommendationEffectiveness(30);
        
        List<String> suggestions = new ArrayList<>();
        
        // 실패 원인 기반 제안
        if (failureAnalysis.getMissedOpportunities() > failureAnalysis.getUnexpectedSuccesses()) {
            suggestions.add("매칭 점수 계산 알고리즘의 가중치 조정 필요 - 사용자 선호도 반영 강화");
        }
        
        // 순위별 효과성 기반 제안
        if (effectiveness.getTopRankAdvantage() < 2.0) {
            suggestions.add("상위 추천의 차별화 강화 필요 - 추천 정확도 개선");
        }
        
        // 시설 타입별 성과 기반 제안
        List<FacilityTypePerformanceReport> typePerformance = analyzeFacilityTypePerformance(30);
        typePerformance.stream()
            .filter(report -> report.getSuccessRate() < 30.0)
            .forEach(report -> suggestions.add(
                String.format("%s 타입 시설의 매칭 기준 재검토 필요", report.getFacilityType())
            ));
        
        log.info("매칭 알고리즘 개선 제안 생성 완료: {} 개의 제안", suggestions.size());
        suggestions.forEach(suggestion -> log.info("제안: {}", suggestion));
    }

    // ===== 유틸리티 메서드 =====

    private double calculateSuccessRate(long successful, long total) {
        return total > 0 ? (double) successful / total * 100 : 0.0;
    }

    private double calculateRate(long part, long total) {
        return total > 0 ? (double) part / total * 100 : 0.0;
    }

    private String calculatePerformanceGrade(double successRate, double satisfaction) {
        double score = (successRate * 0.7) + (satisfaction * 20 * 0.3);
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B+";
        if (score >= 60) return "B";
        if (score >= 50) return "C";
        return "D";
    }

    private String calculateCoordinatorGrade(double successRate, double satisfaction) {
        double score = (successRate * 0.6) + (satisfaction * 20 * 0.4);
        if (score >= 85) return "최우수";
        if (score >= 75) return "우수";
        if (score >= 65) return "양호";
        if (score >= 50) return "보통";
        return "개선필요";
    }

    private double calculateOverallRate(List<RankingPerformance> performances, 
                                      java.util.function.ToLongFunction<RankingPerformance> extractor) {
        long total = performances.stream().mapToLong(RankingPerformance::getTotalRecommendations).sum();
        long part = performances.stream().mapToLong(extractor).sum();
        return calculateRate(part, total);
    }

    private double calculateTopRankAdvantage(List<RankingPerformance> performances) {
        if (performances.isEmpty()) return 0.0;
        
        Optional<RankingPerformance> rank1 = performances.stream()
            .filter(p -> p.getRank() == 1)
            .findFirst();
            
        Optional<RankingPerformance> rank2 = performances.stream()
            .filter(p -> p.getRank() == 2)
            .findFirst();
            
        if (rank1.isPresent() && rank2.isPresent()) {
            return rank1.get().getSelectionRate() / rank2.get().getSelectionRate();
        }
        
        return 1.0;
    }

    private double calculateAlgorithmAccuracy(int missed, int unexpected) {
        int total = missed + unexpected;
        return total > 0 ? (1.0 - (double) Math.max(missed, unexpected) / total) * 100 : 100.0;
    }

    private List<String> generateImprovementSuggestions(List<FacilityMatchingHistory> missed, 
                                                       List<FacilityMatchingHistory> unexpected) {
        List<String> suggestions = new ArrayList<>();
        
        if (missed.size() > unexpected.size()) {
            suggestions.add("높은 점수 매칭의 실패율이 높음 - 사용자 선호도 가중치 조정 필요");
            suggestions.add("시설 정보의 정확성 및 실시간성 검토 필요");
        } else if (unexpected.size() > missed.size()) {
            suggestions.add("낮은 점수 매칭의 성공률이 높음 - 숨겨진 선호 패턴 발굴 필요");
            suggestions.add("매칭 점수 계산 기준 재검토 필요");
        }
        
        return suggestions;
    }

    private String generateFacilityTypeRecommendation(String facilityType, double successRate) {
        if (successRate >= 70) {
            return String.format("%s 타입은 매칭 성과가 우수함 - 추천 가중치 증가 권장", facilityType);
        } else if (successRate >= 50) {
            return String.format("%s 타입은 평균적 성과 - 세부 기준 최적화 필요", facilityType);
        } else {
            return String.format("%s 타입은 성과 개선 필요 - 매칭 기준 재검토 권장", facilityType);
        }
    }

    private double calculatePeriodSuccessRate(LocalDateTime startDate) {
        List<FacilityMatchingHistory> periodMatches = matchingHistoryRepository.findAll().stream()
            .filter(h -> h.getCreatedAt().isAfter(startDate))
            .collect(Collectors.toList());
            
        long successful = periodMatches.stream()
            .mapToLong(h -> h.isSuccessfulMatch() ? 1 : 0)
            .sum();
            
        return calculateSuccessRate(successful, periodMatches.size());
    }

    private Double calculateAverageMatchingDuration(LocalDateTime startDate) {
        Object[] result = matchingHistoryRepository.calculateAverageMatchingDuration(startDate);
        return result[0] != null ? ((Number) result[0]).doubleValue() : null;
    }

    private List<String> getTopPerformingFacilities(LocalDateTime startDate, int limit) {
        return analyzeFacilityPerformance(7).stream()
            .limit(limit)
            .map(report -> "시설 ID: " + report.getFacilityId() + " (성공률: " + 
                          String.format("%.1f%%", report.getSuccessRate()) + ")")
            .collect(Collectors.toList());
    }

    private List<FacilityMatchingHistory> getRecentHighEngagementMatches(int limit) {
        return matchingHistoryRepository.findHighEngagementMatches(
            LocalDateTime.now().minusDays(7), 
            PageRequest.of(0, limit)
        ).getContent();
    }

    private List<String> identifyUrgentActions(List<FacilityMatchingHistory> activeMatches) {
        List<String> actions = new ArrayList<>();
        
        // 48시간 이상 진행 중인 매칭
        long staleMatches = activeMatches.stream()
            .filter(h -> h.getCreatedAt().isBefore(LocalDateTime.now().minusHours(48)))
            .count();
            
        if (staleMatches > 0) {
            actions.add(String.format("%d 건의 장기 미해결 매칭 - 코디네이터 개입 필요", staleMatches));
        }
        
        // 조회는 했지만 연락하지 않은 매칭
        long viewedNotContacted = activeMatches.stream()
            .filter(h -> h.getWasViewed() && !h.getWasContacted())
            .filter(h -> h.getViewedAt().isBefore(LocalDateTime.now().minusHours(24)))
            .count();
            
        if (viewedNotContacted > 0) {
            actions.add(String.format("%d 건의 조회 후 미연락 케이스 - 후속 조치 필요", viewedNotContacted));
        }
        
        return actions;
    }

    // ===== DTO 클래스들 =====

    @Data
    @Builder
    @AllArgsConstructor
    public static class FacilityPerformanceReport {
        private Long facilityId;
        private Long totalMatches;
        private Long successfulMatches;
        private Double successRate;
        private Double averageSatisfaction;
        private String performanceGrade;
        
        public Double getPerformanceScore() {
            return (successRate * 0.7) + (averageSatisfaction * 20 * 0.3);
        }
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class CoordinatorPerformanceReport {
        private String coordinatorId;
        private Long totalMatches;
        private Long successfulMatches;
        private Double successRate;
        private Double averageMatchScore;
        private Double averageSatisfaction;
        private String performanceGrade;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class RecommendationEffectivenessReport {
        private List<RankingPerformance> rankingPerformances;
        private Long totalRecommendations;
        private Double overallViewRate;
        private Double overallContactRate;
        private Double overallSelectionRate;
        private Double topRankAdvantage;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class RankingPerformance {
        private Integer rank;
        private Long totalRecommendations;
        private Long viewedCount;
        private Long contactedCount;
        private Long selectedCount;
        private Double viewRate;
        private Double contactRate;
        private Double selectionRate;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class MatchingFailureAnalysisReport {
        private Integer missedOpportunities;
        private Integer unexpectedSuccesses;
        private List<FacilityMatchingHistory> topMissedOpportunities;
        private List<FacilityMatchingHistory> topUnexpectedSuccesses;
        private Map<FacilityMatchingHistory.MatchingOutcome, Long> failureReasons;
        private Double algorithmAccuracy;
        private List<String> improvementOpportunities;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class MonthlyTrendReport {
        private Integer year;
        private Integer month;
        private Long totalMatches;
        private Long successfulMatches;
        private Double successRate;
        private Double averageMatchScore;
        private Double averageSatisfaction;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class FacilityTypePerformanceReport {
        private String facilityType;
        private Long totalMatches;
        private Long successfulMatches;
        private Double successRate;
        private Double averageMatchScore;
        private Double averageSatisfaction;
        private String recommendation;
    }

    /**
     * 매칭 트렌드 리포트 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchingTrendReport {
        private Long totalMatches;
        private Long successfulMatches;
        private Double successRate;
        private Double averageMatchesPerDay;
        private Map<String, Long> dailyMatchCounts;
        private LocalDateTime analysisDate;
    }

    /**
     * 사용자 매칭 이력 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMatchingHistory {
        private Long matchingId;
        private Long facilityId;
        private LocalDateTime matchingDate;
        private BigDecimal matchingScore;
        private String status;
        private String outcome;
        private Integer satisfactionScore;
        private String feedback;
    }

    /**
     * 추천 정확도 리포트 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationAccuracyReport {
        private Long totalRecommendations;
        private Long accurateRecommendations;
        private Double overallAccuracy;
        private Map<Integer, Long> accuracyByRank;
        private LocalDateTime analysisDate;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class MatchingDashboard {
        private Integer todayMatches;
        private Integer todaySuccesses;
        private Integer activeMatches;
        private Double weeklySuccessRate;
        private Double monthlySuccessRate;
        private Double avgMatchingDuration;
        private List<String> topPerformingFacilities;
        private List<FacilityMatchingHistory> recentHighEngagementMatches;
        private List<String> urgentActions;
    }
}