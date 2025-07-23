package com.globalcarelink.facility;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 시설 사용자 행동 서비스
 * 사용자의 시설 관련 행동 추적 및 매칭 이력 관리를 담당
 * 학습 기반 추천 개선 기능 포함
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FacilityUserActionService {

    private final FacilityProfileRepository facilityProfileRepository;
    private final FacilityMatchingHistoryRepository matchingHistoryRepository;

    // ===== 매칭 이력 추적 =====

    /**
     * 매칭 추천 결과를 이력에 저장
     */
    @Transactional
    public void recordMatchingRecommendations(String userId, String coordinatorId, 
                                            List<FacilityRecommendationService.FacilityRecommendation> recommendations,
                                            com.globalcarelink.health.HealthAssessment assessment, 
                                            FacilityRecommendationService.FacilityMatchingPreference preference) {
        log.info("매칭 추천 이력 저장 - 사용자: {}, 추천 수: {}", userId, recommendations.size());
        
        for (int i = 0; i < recommendations.size(); i++) {
            FacilityRecommendationService.FacilityRecommendation recommendation = recommendations.get(i);
            
            FacilityMatchingHistory history = FacilityMatchingHistory.builder()
                .userId(userId)
                .facilityId(recommendation.getFacility().getId())
                .coordinatorId(coordinatorId)
                .initialMatchScore(BigDecimal.valueOf(recommendation.getMatchScore()).setScale(2, java.math.RoundingMode.HALF_UP))
                .recommendationRank(i + 1)
                .matchingCriteria(serializeMatchingCriteria(assessment, preference))
                .facilitySnapshot(serializeFacilitySnapshot(recommendation.getFacility()))
                .estimatedCost(calculateEstimatedMonthlyCost(recommendation.getFacility(), assessment))
                .build();
                
            matchingHistoryRepository.save(history);
        }
        
        log.info("매칭 추천 이력 저장 완료 - {} 건", recommendations.size());
    }

    // ===== 사용자 행동 추적 =====

    /**
     * 사용자 행동 추적 - 시설 조회
     */
    @Transactional
    public void trackFacilityView(String userId, Long facilityId) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsViewed();
            matchingHistoryRepository.save(history);
            
            log.info("시설 조회 추적 완료 - 사용자: {}, 시설: {}", userId, facilityId);
        }
    }

    /**
     * 사용자 행동 추적 - 시설 연락
     */
    @Transactional
    public void trackFacilityContact(String userId, Long facilityId) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsContracted();
            matchingHistoryRepository.save(history);
            
            log.info("시설 연락 추적 완료 - 사용자: {}, 시설: {}", userId, facilityId);
        }
    }

    /**
     * 사용자 행동 추적 - 시설 방문
     */
    @Transactional
    public void trackFacilityVisit(String userId, Long facilityId) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsVisited();
            matchingHistoryRepository.save(history);
            
            log.info("시설 방문 추적 완료 - 사용자: {}, 시설: {}", userId, facilityId);
        }
    }

    /**
     * 매칭 완료 처리
     */
    @Transactional
    public void completeMatching(String userId, Long facilityId, 
                               FacilityMatchingHistory.MatchingOutcome outcome,
                               BigDecimal actualCost, BigDecimal satisfactionScore, String feedback) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsSelected(outcome);
            
            if (actualCost != null) {
                history.setActualCost(actualCost);
            }
            
            if (satisfactionScore != null) {
                history.updateFeedback(satisfactionScore, feedback);
            }
            
            matchingHistoryRepository.save(history);
            
            log.info("매칭 완료 처리 - 사용자: {}, 시설: {}, 결과: {}", userId, facilityId, outcome);
        }
    }

    // ===== 학습 기반 추천 개선 =====

    /**
     * 학습 기반 매칭 점수 조정
     */
    public List<FacilityRecommendationService.FacilityRecommendation> adjustMatchingScoresWithLearning(
            List<FacilityRecommendationService.FacilityRecommendation> recommendations, String userId) {
        
        // 사용자의 과거 매칭 이력을 기반으로 점수 조정
        List<FacilityMatchingHistory> userHistory = 
            matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
        if (userHistory.isEmpty()) {
            return recommendations; // 이력이 없으면 원본 그대로 반환
        }
        
        // 성공한 매칭들의 패턴 분석
        List<FacilityMatchingHistory> successfulMatches = userHistory.stream()
            .filter(FacilityMatchingHistory::isSuccessfulMatch)
            .collect(Collectors.toList());
            
        if (successfulMatches.isEmpty()) {
            return recommendations;
        }
        
        // 선호 패턴 추출
        Map<String, Double> facilityTypePreference = extractFacilityTypePreference(successfulMatches);
        Map<String, Double> facilityGradePreference = extractFacilityGradePreference(successfulMatches);
        double avgSuccessfulCost = calculateAverageSuccessfulCost(successfulMatches);
        
        // 추천 점수 조정
        return recommendations.stream()
            .map(rec -> adjustRecommendationScore(rec, facilityTypePreference, facilityGradePreference, avgSuccessfulCost))
            .sorted(Comparator.comparing(FacilityRecommendationService.FacilityRecommendation::getMatchScore).reversed())
            .collect(Collectors.toList());
    }

    /**
     * 사용자별 시설 선호도 분석
     */
    public UserFacilityPreferenceAnalysis analyzeUserPreferences(String userId) {
        List<FacilityMatchingHistory> userHistory = 
            matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
        if (userHistory.isEmpty()) {
            return UserFacilityPreferenceAnalysis.builder()
                .userId(userId)
                .totalRecommendations(0)
                .build();
        }
        
        List<FacilityMatchingHistory> successfulMatches = userHistory.stream()
            .filter(FacilityMatchingHistory::isSuccessfulMatch)
            .collect(Collectors.toList());
            
        return UserFacilityPreferenceAnalysis.builder()
            .userId(userId)
            .totalRecommendations(userHistory.size())
            .successfulMatches(successfulMatches.size())
            .preferredFacilityTypes(extractFacilityTypePreference(successfulMatches))
            .preferredFacilityGrades(extractFacilityGradePreference(successfulMatches))
            .averageSuccessfulCost(calculateAverageSuccessfulCost(successfulMatches))
            .averageSatisfactionScore(calculateAverageSatisfactionScore(successfulMatches))
            .build();
    }

    // ===== 통계 및 분석 =====

    /**
     * 매칭 성공률 분석
     */
    public MatchingSuccessAnalysis analyzeMatchingSuccess(String coordinatorId, int monthsBack) {
        List<FacilityMatchingHistory> histories = matchingHistoryRepository
            .findByCoordinatorIdOrderByCreatedAtDesc(coordinatorId);
            
        long totalRecommendations = histories.size();
        long successfulMatches = histories.stream()
            .mapToLong(h -> h.isSuccessfulMatch() ? 1 : 0)
            .sum();
            
        double successRate = totalRecommendations > 0 ? (double) successfulMatches / totalRecommendations * 100 : 0;
        
        // 시설별 성공률 분석
        Map<Long, Long> facilitySuccessCount = histories.stream()
            .filter(FacilityMatchingHistory::isSuccessfulMatch)
            .collect(Collectors.groupingBy(FacilityMatchingHistory::getFacilityId, Collectors.counting()));
            
        return MatchingSuccessAnalysis.builder()
            .coordinatorId(coordinatorId)
            .periodMonths(monthsBack)
            .totalRecommendations(totalRecommendations)
            .successfulMatches(successfulMatches)
            .successRate(successRate)
            .topPerformingFacilities(facilitySuccessCount)
            .build();
    }

    // ===== 내부 헬퍼 메서드 =====

    /**
     * 매칭 기준 직렬화
     */
    private String serializeMatchingCriteria(com.globalcarelink.health.HealthAssessment assessment, 
                                           FacilityRecommendationService.FacilityMatchingPreference preference) {
        return String.format("{\"careGrade\":%d,\"regions\":%s,\"maxFee\":%d}", 
            assessment.getCareGradeLevel(),
            preference.getPreferredRegions() != null ? preference.getPreferredRegions().toString() : "[]",
            preference.getMaxMonthlyBudget() != null ? preference.getMaxMonthlyBudget() : 0);
    }

    /**
     * 시설 스냅샷 직렬화
     */
    private String serializeFacilitySnapshot(FacilityProfile facility) {
        return String.format("{\"type\":\"%s\",\"grade\":\"%s\",\"capacity\":%d,\"monthlyFee\":%d}",
            facility.getFacilityType(),
            facility.getFacilityGrade(),
            facility.getTotalCapacity(),
            facility.getMonthlyBasicFee() != null ? facility.getMonthlyBasicFee() : 0);
    }

    /**
     * 예상 월 비용 계산
     */
    private BigDecimal calculateEstimatedMonthlyCost(FacilityProfile facility, com.globalcarelink.health.HealthAssessment assessment) {
        Integer basicFee = facility.getMonthlyBasicFee();
        if (basicFee == null) return null;
        
        double multiplier = 1.0;
        
        // 케어 등급에 따른 비용 조정
        if (assessment.getCareGradeLevel() <= 2) {
            multiplier += 0.3; // 중증 케어 30% 추가
        } else if (assessment.getCareGradeLevel() <= 3) {
            multiplier += 0.15; // 중등도 케어 15% 추가
        }
        
        return BigDecimal.valueOf(basicFee * multiplier).setScale(0, java.math.RoundingMode.HALF_UP);
    }

    /**
     * 시설 타입 선호도 추출
     */
    private Map<String, Double> extractFacilityTypePreference(List<FacilityMatchingHistory> successfulMatches) {
        Map<String, Double> preferences = new HashMap<>();
        
        successfulMatches.forEach(match -> {
            // 실제 구현에서는 시설 정보를 조회하여 타입을 확인
            Optional<FacilityProfile> facility = facilityProfileRepository.findById(match.getFacilityId());
            if (facility.isPresent()) {
                String type = facility.get().getFacilityType();
                preferences.merge(type, 1.0, Double::sum);
            }
        });
        
        // 정규화
        double total = preferences.values().stream().mapToDouble(Double::doubleValue).sum();
        if (total > 0) {
            preferences.replaceAll((k, v) -> v / total);
        }
        
        return preferences;
    }

    /**
     * 시설 등급 선호도 추출
     */
    private Map<String, Double> extractFacilityGradePreference(List<FacilityMatchingHistory> successfulMatches) {
        Map<String, Double> preferences = new HashMap<>();
        
        successfulMatches.forEach(match -> {
            Optional<FacilityProfile> facility = facilityProfileRepository.findById(match.getFacilityId());
            if (facility.isPresent()) {
                String grade = facility.get().getFacilityGrade();
                preferences.merge(grade, 1.0, Double::sum);
            }
        });
        
        // 정규화
        double total = preferences.values().stream().mapToDouble(Double::doubleValue).sum();
        if (total > 0) {
            preferences.replaceAll((k, v) -> v / total);
        }
        
        return preferences;
    }

    /**
     * 평균 성공 비용 계산
     */
    private double calculateAverageSuccessfulCost(List<FacilityMatchingHistory> successfulMatches) {
        return successfulMatches.stream()
            .filter(match -> match.getActualCost() != null)
            .mapToDouble(match -> match.getActualCost().doubleValue())
            .average()
            .orElse(0.0);
    }

    /**
     * 평균 만족도 점수 계산
     * TODO: FacilityMatchingHistory에 만족도 점수 필드 추가 후 구현
     */
    private double calculateAverageSatisfactionScore(List<FacilityMatchingHistory> successfulMatches) {
        // 임시로 기본값 반환 (향후 엔티티에 필드 추가 시 구현)
        return 4.0; // 기본 만족도 점수
    }

    /**
     * 추천 점수 조정
     */
    private FacilityRecommendationService.FacilityRecommendation adjustRecommendationScore(
            FacilityRecommendationService.FacilityRecommendation recommendation,
            Map<String, Double> typePreference,
            Map<String, Double> gradePreference,
            double avgSuccessfulCost) {
        
        double currentScore = recommendation.getMatchScore();
        double adjustmentFactor = 1.0;
        
        FacilityProfile facility = recommendation.getFacility();
        
        // 시설 타입 선호도 반영
        Double typeBonus = typePreference.get(facility.getFacilityType());
        if (typeBonus != null) {
            adjustmentFactor += typeBonus * 0.2; // 최대 20% 가산
        }
        
        // 시설 등급 선호도 반영
        Double gradeBonus = gradePreference.get(facility.getFacilityGrade());
        if (gradeBonus != null) {
            adjustmentFactor += gradeBonus * 0.15; // 최대 15% 가산
        }
        
        // 비용 유사성 반영
        if (avgSuccessfulCost > 0 && facility.getMonthlyBasicFee() != null) {
            double costSimilarity = 1.0 - Math.abs(facility.getMonthlyBasicFee() - avgSuccessfulCost) / avgSuccessfulCost;
            adjustmentFactor += Math.max(0, costSimilarity) * 0.1; // 최대 10% 가산
        }
        
        double adjustedScore = Math.min(currentScore * adjustmentFactor, 5.0);
        
        return FacilityRecommendationService.FacilityRecommendation.builder()
            .facility(facility)
            .matchScore(adjustedScore)
            .explanation(recommendation.getExplanation() + " (학습 기반 조정 적용)")
            .overseasFriendlyScore(recommendation.getOverseasFriendlyScore())
            .reliabilityScore(recommendation.getReliabilityScore())
            .estimatedMonthlyCost(recommendation.getEstimatedMonthlyCost())
            .build();
    }

    // ===== DTO 클래스들 =====

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class UserFacilityPreferenceAnalysis {
        private final String userId;
        private final int totalRecommendations;
        private final int successfulMatches;
        private final Map<String, Double> preferredFacilityTypes;
        private final Map<String, Double> preferredFacilityGrades;
        private final double averageSuccessfulCost;
        private final double averageSatisfactionScore;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class MatchingSuccessAnalysis {
        private final String coordinatorId;
        private final int periodMonths;
        private final long totalRecommendations;
        private final long successfulMatches;
        private final double successRate;
        private final Map<Long, Long> topPerformingFacilities;
    }
} 