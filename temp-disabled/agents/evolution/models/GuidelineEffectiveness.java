package com.globalcarelink.agents.evolution.models;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 규칙 효과성 추적 모델
 */
@Data
public class GuidelineEffectiveness {
    private String guidelineId;
    private double baselineScore;
    private double currentScore;
    private List<EffectivenessMeasurement> measurements;
    private int totalMeasurements;
    private LocalDateTime lastMeasured;
    
    public GuidelineEffectiveness(String guidelineId) {
        this.guidelineId = guidelineId;
        this.measurements = new ArrayList<>();
        this.totalMeasurements = 0;
        this.currentScore = 0.0;
    }
    
    public void addMeasurement(double score, ProjectExperience experience) {
        EffectivenessMeasurement measurement = EffectivenessMeasurement.builder()
            .score(score)
            .experienceId(experience.getExperienceId())
            .timestamp(LocalDateTime.now())
            .projectSize(experience.getProjectSize())
            .complexity(experience.getComplexity())
            .build();
        
        measurements.add(measurement);
        totalMeasurements++;
        lastMeasured = LocalDateTime.now();
        
        // 현재 점수 재계산 (가중 평균)
        recalculateCurrentScore();
    }
    
    public void addRealWorldResult(ProjectOutcome outcome) {
        // 실제 결과를 바탕으로 효과성 업데이트
        double outcomeScore = outcome.getOverallScore();
        
        EffectivenessMeasurement measurement = EffectivenessMeasurement.builder()
            .score(outcomeScore)
            .experienceId(outcome.getExperienceId())
            .timestamp(LocalDateTime.now())
            .isRealWorld(true)
            .build();
        
        measurements.add(measurement);
        totalMeasurements++;
        lastMeasured = LocalDateTime.now();
        
        recalculateCurrentScore();
    }
    
    public boolean needsImprovement() {
        return currentScore < 0.6 || hasDecreasingTrend();
    }
    
    public boolean hasStatisticalSignificance() {
        return totalMeasurements >= 5; // 최소 5개 측정값 필요
    }
    
    public double getScore() {
        return currentScore;
    }
    
    private void recalculateCurrentScore() {
        if (measurements.isEmpty()) {
            currentScore = baselineScore;
            return;
        }
        
        // 최근 측정값에 더 큰 가중치 부여
        double weightedSum = 0.0;
        double totalWeight = 0.0;
        
        for (int i = 0; i < measurements.size(); i++) {
            EffectivenessMeasurement measurement = measurements.get(i);
            double weight = calculateWeight(i, measurements.size());
            
            // 실제 결과에는 추가 가중치
            if (measurement.isRealWorld()) {
                weight *= 1.5;
            }
            
            weightedSum += measurement.getScore() * weight;
            totalWeight += weight;
        }
        
        currentScore = weightedSum / totalWeight;
    }
    
    private double calculateWeight(int index, int totalSize) {
        // 최근 측정값일수록 높은 가중치
        return 1.0 + (double) index / totalSize;
    }
    
    private boolean hasDecreasingTrend() {
        if (measurements.size() < 3) return false;
        
        // 최근 3개 측정값의 트렌드 확인
        int recentCount = Math.min(3, measurements.size());
        List<EffectivenessMeasurement> recent = measurements.subList(
            measurements.size() - recentCount, measurements.size());
        
        double firstScore = recent.get(0).getScore();
        double lastScore = recent.get(recent.size() - 1).getScore();
        
        return (firstScore - lastScore) > 0.1; // 10% 이상 감소 시 하락 트렌드
    }
    
    @Data
    @lombok.Builder
    public static class EffectivenessMeasurement {
        private double score;
        private String experienceId;
        private LocalDateTime timestamp;
        private String projectSize;
        private String complexity;
        private boolean isRealWorld;
    }
}