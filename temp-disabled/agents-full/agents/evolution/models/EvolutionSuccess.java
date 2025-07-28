package com.globalcarelink.agents.evolution.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 진화 성공 사례 모델
 */
@Data
@Builder
public class EvolutionSuccess {
    private String guidelineId;
    private double improvementRate;
    private List<String> improvedAspects;
    private LocalDateTime achievedAt;
    private int experienceCount;
    private String originalTitle;
    private String evolvedTitle;
    
    // GuidelineEvolutionSystem에서 사용하는 생성자 추가
    public EvolutionSuccess(String guidelineId, double improvementRate, List<String> improvedAspects) {
        this.guidelineId = guidelineId;
        this.improvementRate = improvementRate;
        this.improvedAspects = improvedAspects;
        this.achievedAt = LocalDateTime.now();
        this.experienceCount = 1;
    }
    
    /**
     * 성공 등급 평가
     */
    public SuccessGrade getSuccessGrade() {
        if (improvementRate >= 0.5) return SuccessGrade.OUTSTANDING;
        if (improvementRate >= 0.3) return SuccessGrade.EXCELLENT;
        if (improvementRate >= 0.2) return SuccessGrade.GOOD;
        if (improvementRate >= 0.1) return SuccessGrade.MODERATE;
        return SuccessGrade.MINIMAL;
    }
    
    /**
     * 영향도 평가
     */
    public Impact getImpact() {
        if (experienceCount >= 50) return Impact.HIGH;
        if (experienceCount >= 20) return Impact.MEDIUM;
        if (experienceCount >= 10) return Impact.LOW;
        return Impact.MINIMAL;
    }
    
    public enum SuccessGrade {
        MINIMAL, MODERATE, GOOD, EXCELLENT, OUTSTANDING
    }
    
    public enum Impact {
        MINIMAL, LOW, MEDIUM, HIGH
    }
}