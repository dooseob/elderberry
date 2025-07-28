package com.globalcarelink.agents.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 지침 개선 히스토리 모델
 * ClaudeGuideAgent에서 지침 개선 과정을 추적
 */
@Data
@Builder
public class GuideImprovement {
    private String improvementId;
    private String originalGuidelineId;
    private String improvedGuidelineId;
    private LocalDateTime improvedAt;
    private String improvedBy; // "AGENT", "USER", "SYSTEM"
    
    // 개선 내용
    private String improvementType; // "ENHANCEMENT", "BUG_FIX", "OPTIMIZATION", "REFACTORING"
    private String improvementReason;
    private List<String> changedAspects;
    private String originalContent;
    private String improvedContent;
    
    // 개선 지표
    private double effectivenessBeforeImprovement;
    private double effectivenessAfterImprovement;
    private double improvementScore;
    private String measurementMethod;
    
    // 개선 컨텍스트
    private String projectContext;
    private List<String> triggeringFactors;
    private Map<String, Object> environmentData;
    
    // 검증 정보
    private boolean validated;
    private LocalDateTime validatedAt;
    private String validationMethod;
    private List<String> validationResults;
    
    // 영향도 분석
    private int affectedGuidelines;
    private List<String> relatedPatterns;
    private String impactAssessment;
    
    /**
     * 개선 성공도 계산
     */
    public double getSuccessRate() {
        if (effectivenessBeforeImprovement == 0) {
            return improvementScore;
        }
        
        double relativeImprovement = (effectivenessAfterImprovement - effectivenessBeforeImprovement) 
                                   / effectivenessBeforeImprovement;
        
        return Math.min(1.0, Math.max(0.0, relativeImprovement));
    }
    
    /**
     * 개선이 유의미한지 판단
     */
    public boolean isSignificantImprovement() {
        return getSuccessRate() >= 0.1 && // 10% 이상 개선
               improvementScore >= 0.7 &&  // 개선 점수 70% 이상
               validated;                  // 검증 완료
    }
    
    /**
     * 개선 등급 평가
     */
    public ImprovementGrade getImprovementGrade() {
        double successRate = getSuccessRate();
        
        if (successRate >= 0.5) return ImprovementGrade.EXCELLENT;
        if (successRate >= 0.3) return ImprovementGrade.GOOD;
        if (successRate >= 0.1) return ImprovementGrade.MODERATE;
        if (successRate >= 0.0) return ImprovementGrade.MINIMAL;
        return ImprovementGrade.NEGATIVE;
    }
    
    /**
     * 개선 요약 생성
     */
    public String getSummary() {
        return String.format("Improvement %s: %s (%.1f%% success rate, %s grade)",
            improvementId, improvementReason, getSuccessRate() * 100, getImprovementGrade());
    }
    
    /**
     * 학습 가치 평가
     */
    public double getLearningValue() {
        double baseValue = Math.abs(getSuccessRate());
        double contextBonus = projectContext != null ? 0.1 : 0.0;
        double validationBonus = validated ? 0.2 : 0.0;
        double impactBonus = Math.min(affectedGuidelines * 0.05, 0.3);
        
        return Math.min(1.0, baseValue + contextBonus + validationBonus + impactBonus);
    }
    
    public enum ImprovementGrade {
        NEGATIVE, MINIMAL, MODERATE, GOOD, EXCELLENT
    }
    
    public enum ImprovementType {
        ENHANCEMENT("기능 향상"),
        BUG_FIX("버그 수정"),
        OPTIMIZATION("성능 최적화"),
        REFACTORING("구조 개선"),
        MODERNIZATION("기술 현대화"),
        SECURITY("보안 강화");
        
        private final String description;
        
        ImprovementType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}