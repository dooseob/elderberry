package com.globalcarelink.agents.evolution.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * A/B 테스트 결과 모델
 */
@Data
@Builder
public class ABTestResult {
    private String guidelineId;
    private OriginalGuideline originalVersion;
    private EvolvedGuideline evolvedVersion;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int requiredSampleSize;
    private int currentSampleSize;
    private boolean complete;
    private boolean statisticallySignificant;
    
    // 테스트 결과
    private double originalSuccessRate;
    private double evolvedSuccessRate;
    private double improvementRate;
    private double confidenceLevel;
    private EvolvedGuideline winner;
    
    // 측정 데이터
    private List<TestMeasurement> originalMeasurements;
    private List<TestMeasurement> evolvedMeasurements;
    
    public boolean isComplete() {
        return currentSampleSize >= requiredSampleSize && 
               endTime != null;
    }
    
    public boolean isStatisticallySignificant() {
        return statisticallySignificant && 
               confidenceLevel >= 0.95; // 95% 신뢰도
    }
    
    public EvolvedGuideline getWinner() {
        if (!isComplete() || !isStatisticallySignificant()) {
            return null;
        }
        
        return evolvedSuccessRate > originalSuccessRate ? evolvedVersion : null;
    }
    
    public double getImprovementRate() {
        if (originalSuccessRate == 0) return 0.0;
        return (evolvedSuccessRate - originalSuccessRate) / originalSuccessRate;
    }
    
    @Data
    @Builder
    public static class TestMeasurement {
        private String measurementId;
        private LocalDateTime timestamp;
        private double successRate;
        private double timeEfficiency;
        private double qualityScore;
        private String version; // "original" or "evolved"
    }
}