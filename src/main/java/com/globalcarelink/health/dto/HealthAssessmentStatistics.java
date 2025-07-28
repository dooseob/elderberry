package com.globalcarelink.health.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 건강 평가 통계 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthAssessmentStatistics {

    // === 기본 통계 ===
    
    /**
     * 전체 평가 수
     */
    private Long totalAssessments;

    /**
     * 완성된 평가 수 (4개 ADL 영역 모두 작성)
     */
    private Long completeAssessments;

    /**
     * 최근 30일 평가 수
     */
    private Long recentAssessments;

    /**
     * 완성도 비율 (%)
     */
    public double getCompletionRate() {
        if (totalAssessments == 0) return 0.0;
        return (double) completeAssessments / totalAssessments * 100.0;
    }

    // === 케어 등급별 분포 ===

    /**
     * 케어 등급별 통계
     * [{"grade": "1", "count": 150}, {"grade": "2", "count": 200}, ...]
     */
    private List<Map<String, Object>> careGradeDistribution;

    /**
     * ADL 점수 구간별 분포
     * [{"score_range": "경증(100-140)", "count": 80}, ...]
     */
    private List<Map<String, Object>> adlScoreDistribution;

    /**
     * 연령대별 케어 등급 분포
     * [{"age_group": "70대", "ltci_grade": "3", "count": 45}, ...]
     */
    private List<Map<String, Object>> ageGroupDistribution;

    /**
     * 성별 케어 패턴 분석
     * [{"gender": "M", "ltci_grade": "2", "avg_adl_score": 180.5, "count": 30}, ...]
     */
    private List<Map<String, Object>> genderPatternAnalysis;

    // === 특화 케어 통계 ===

    /**
     * 호스피스 케어 대상자 수
     */
    private Long hospiceCareTargets;

    /**
     * 치매 전문 케어 대상자 수
     */
    private Long dementiaCareTargets;

    /**
     * 중증 환자 수
     */
    private Long severeCareTargets;

    /**
     * 재외동포 평가 수
     */
    private Long overseasKoreanAssessments;

    // === 추가 분석 데이터 ===

    /**
     * 평균 ADL 점수
     */
    private Double averageAdlScore;

    /**
     * 가장 많은 케어 등급
     */
    private String mostCommonCareGrade;

    /**
     * 평가 트렌드 (월별)
     */
    private List<MonthlyTrend> monthlyTrends;

    // === 내부 DTO 클래스들 ===

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month; // "2024-01"
        private Long assessmentCount;
        private Double averageAdlScore;
        private String dominantCareGrade;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareGradeStatistics {
        private String gradeLevel;
        private String gradeName;
        private Long count;
        private Double percentage;
        private Double averageAdlScore;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiseaseTypeStatistics {
        private String diseaseType;
        private String diseaseDisplayName;
        private Long count;
        private Double averageCareLevel;
        private String recommendedFacilityType;
    }

    // === 편의 메서드 ===

    /**
     * 케어 등급별 통계를 구조화된 객체로 변환
     */
    public List<CareGradeStatistics> getCareGradeStatisticsStructured() {
        if (careGradeDistribution == null) return List.of();
        
        return careGradeDistribution.stream()
            .map(map -> CareGradeStatistics.builder()
                .gradeLevel(String.valueOf(map.get("grade")))
                .count((Long) map.get("count"))
                .percentage(calculatePercentage((Long) map.get("count"), totalAssessments))
                .build())
            .toList();
    }

    /**
     * 최고 빈도 케어 등급 조회
     */
    public String getMostFrequentCareGrade() {
        if (careGradeDistribution == null || careGradeDistribution.isEmpty()) {
            return "데이터 없음";
        }
        
        return careGradeDistribution.stream()
            .max((a, b) -> Long.compare((Long) a.get("count"), (Long) b.get("count")))
            .map(map -> String.valueOf(map.get("grade")))
            .orElse("데이터 없음");
    }

    /**
     * 건강한 사용자 비율 (ADL 점수 140점 이하)
     */
    public double getHealthyUserRatio() {
        if (adlScoreDistribution == null) return 0.0;
        
        long healthyCount = adlScoreDistribution.stream()
            .filter(map -> {
                String range = String.valueOf(map.get("score_range"));
                return range.contains("경증(100-140)");
            })
            .mapToLong(map -> (Long) map.get("count"))
            .sum();
        
        return totalAssessments > 0 ? (double) healthyCount / totalAssessments * 100.0 : 0.0;
    }

    /**
     * 고위험군 비율 (ADL 점수 220점 이상)
     */
    public double getHighRiskRatio() {
        if (adlScoreDistribution == null) return 0.0;
        
        long highRiskCount = adlScoreDistribution.stream()
            .filter(map -> {
                String range = String.valueOf(map.get("score_range"));
                return range.contains("최중증(221-300)");
            })
            .mapToLong(map -> (Long) map.get("count"))
            .sum();
        
        return totalAssessments > 0 ? (double) highRiskCount / totalAssessments * 100.0 : 0.0;
    }

    // === 내부 헬퍼 메서드 ===

    private double calculatePercentage(Long count, Long total) {
        if (total == null || total == 0) return 0.0;
        return (double) count / total * 100.0;
    }
}