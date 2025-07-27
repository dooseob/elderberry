package com.globalcarelink.agents.evolution.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 지침 진화 시스템 종합 리포트
 */
@Data
@Builder
public class GuidelineEvolutionReport {
    private int totalOriginalGuidelines;
    private int evolvedGuidelinesCount;
    private int deprecatedGuidelinesCount;
    private double averageImprovementRate;
    private List<EvolutionSuccess> topSuccessfulEvolutions;
    private LocalDateTime generatedAt;
    
    // 추가 통계
    private Map<String, Integer> evolutionsByCategory;
    private Map<String, Double> effectivenessByCategory;
    private List<String> mostImprovedAspects;
    private List<String> persistentProblemAreas;
    
    // 진화 동향
    private double evolutionTrend; // 진화 속도 추세
    private double qualityImprovement; // 전체적인 품질 개선도
    private int totalExperiences; // 누적 경험 수
    
    /**
     * 진화 시스템 건강도 평가
     */
    public SystemHealth getSystemHealth() {
        double evolutionRatio = (double) evolvedGuidelinesCount / totalOriginalGuidelines;
        
        if (evolutionRatio >= 0.5 && averageImprovementRate >= 0.2) {
            return SystemHealth.EXCELLENT;
        } else if (evolutionRatio >= 0.3 && averageImprovementRate >= 0.15) {
            return SystemHealth.GOOD;
        } else if (evolutionRatio >= 0.1 && averageImprovementRate >= 0.1) {
            return SystemHealth.FAIR;
        } else {
            return SystemHealth.NEEDS_ATTENTION;
        }
    }
    
    /**
     * 시스템 성숙도 평가
     */
    public MaturityLevel getMaturityLevel() {
        if (totalExperiences >= 100 && evolvedGuidelinesCount >= 20) {
            return MaturityLevel.MATURE;
        } else if (totalExperiences >= 50 && evolvedGuidelinesCount >= 10) {
            return MaturityLevel.DEVELOPING;
        } else if (totalExperiences >= 20 && evolvedGuidelinesCount >= 5) {
            return MaturityLevel.EMERGING;
        } else {
            return MaturityLevel.INITIAL;
        }
    }
    
    public enum SystemHealth {
        EXCELLENT, GOOD, FAIR, NEEDS_ATTENTION
    }
    
    public enum MaturityLevel {
        INITIAL, EMERGING, DEVELOPING, MATURE
    }
}

