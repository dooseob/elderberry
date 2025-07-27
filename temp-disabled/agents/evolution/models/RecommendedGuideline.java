package com.globalcarelink.agents.evolution.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 추천된 최적 지침 모델
 */
@Data
@Builder
public class RecommendedGuideline {
    private String guidelineId;
    private String originalGuidelineId;
    private EvolvedGuideline evolvedGuideline;
    private double confidenceScore; // 0.0 - 1.0
    private String reasoning; // 추천 이유
    private List<EvolvedGuideline> alternativeOptions; // 대안 옵션들
    
    // 추천 컨텍스트
    private String domain;
    private Map<String, Object> applicableContext;
    private LocalDateTime recommendedAt;
    
    // 성공 예측
    private double predictedSuccessRate;
    private double predictedTimeEfficiency;
    private double predictedQualityScore;
    private List<String> expectedBenefits;
    private List<String> potentialRisks;
    
    // 적용 가이드
    private List<String> implementationSteps;
    private String estimatedTimeToImplement;
    private String requiredExpertise;
    private List<String> prerequisites;
    
    /**
     * 추천 신뢰도 등급
     */
    public ConfidenceLevel getConfidenceLevel() {
        if (confidenceScore >= 0.9) return ConfidenceLevel.VERY_HIGH;
        if (confidenceScore >= 0.8) return ConfidenceLevel.HIGH;
        if (confidenceScore >= 0.7) return ConfidenceLevel.MEDIUM;
        if (confidenceScore >= 0.6) return ConfidenceLevel.LOW;
        return ConfidenceLevel.VERY_LOW;
    }
    
    /**
     * 추천 품질 점수 계산
     */
    public double getRecommendationQuality() {
        double baseScore = confidenceScore;
        double alternativesBonus = Math.min(alternativeOptions.size() * 0.1, 0.3);
        double reasoningBonus = reasoning.length() > 50 ? 0.1 : 0.0;
        
        return Math.min(1.0, baseScore + alternativesBonus + reasoningBonus);
    }
    
    /**
     * 즉시 적용 권장 여부
     */
    public boolean isImmediatelyApplicable() {
        return confidenceScore >= 0.8 && 
               potentialRisks.isEmpty() && 
               prerequisites.isEmpty();
    }
    
    public enum ConfidenceLevel {
        VERY_LOW, LOW, MEDIUM, HIGH, VERY_HIGH
    }
}