package com.globalcarelink.agents.debug.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 디버깅 해결책 모델
 */
@Data
@Builder
public class DebugSolution {
    private String solutionId;
    private String solutionName;
    private String description;
    private String category; // "IMMEDIATE_FIX", "CONFIGURATION", "CODE_CHANGE", "ENVIRONMENT"
    
    // 해결 단계
    private List<SolutionStep> solutionSteps;
    private List<String> manualSteps;
    private List<String> automationSteps;
    private String quickFix; // 즉시 적용 가능한 해결책
    
    // 예방 조치
    private List<String> preventionMeasures;
    private List<String> monitoringRecommendations;
    private List<String> codeReviewChecklist;
    
    // 적용 정보
    private boolean isAutoApplicable;
    private boolean requiresRestart;
    private boolean requiresDeployment;
    private String estimatedTimeToFix;
    private double complexityScore; // 0.0 - 1.0
    
    // 효과성 정보
    private double effectivenessScore; // 0.0 - 1.0
    private double successRate;
    private int timesApplied;
    private int timesSuccessful;
    private LocalDateTime lastApplied;
    
    // 부작용 및 위험도
    private List<String> potentialSideEffects;
    private double riskLevel; // 0.0 - 1.0
    private List<String> prerequisiteChecks;
    private List<String> rollbackProcedure;
    
    // 관련 정보
    private String relatedErrorPattern;
    private List<String> relatedDocumentation;
    private List<String> relatedBugReports;
    private Map<String, String> environmentSpecificNotes;
    
    // 메타데이터
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // "AUTO_GENERATED", "EXPERT_SYSTEM", "HUMAN"
    private boolean verified;
    private String verificationNotes;
    
    // 상태 정보
    private boolean resolved;
    private String errorMessage;
    private LocalDateTime resolvedAt;
    
    /**
     * 해결책 적용 가능성 평가
     */
    public ApplicabilityLevel getApplicabilityLevel() {
        if (isAutoApplicable && riskLevel < 0.3) {
            return ApplicabilityLevel.IMMEDIATE;
        } else if (complexityScore < 0.5 && riskLevel < 0.5) {
            return ApplicabilityLevel.QUICK;
        } else if (complexityScore < 0.8 && riskLevel < 0.7) {
            return ApplicabilityLevel.MODERATE;
        } else {
            return ApplicabilityLevel.COMPLEX;
        }
    }
    
    /**
     * 해결책 신뢰도 계산
     */
    public double getReliabilityScore() {
        if (timesApplied == 0) return 0.5; // 기본 신뢰도
        
        double successRateScore = (double) timesSuccessful / timesApplied;
        double experienceBonus = Math.min(timesApplied / 50.0, 0.2); // 최대 20% 보너스
        double verificationBonus = verified ? 0.1 : 0.0;
        
        return Math.min(1.0, successRateScore + experienceBonus + verificationBonus);
    }
    
    /**
     * 해결책 우선순위 계산
     */
    public SolutionPriority getPriority() {
        double priorityScore = (effectivenessScore * 0.4) +
                              (getReliabilityScore() * 0.3) +
                              ((1.0 - complexityScore) * 0.2) +
                              ((1.0 - riskLevel) * 0.1);
        
        if (priorityScore >= 0.8) return SolutionPriority.HIGHEST;
        if (priorityScore >= 0.6) return SolutionPriority.HIGH;
        if (priorityScore >= 0.4) return SolutionPriority.MEDIUM;
        return SolutionPriority.LOW;
    }
    
    /**
     * 해결책 적용 후 성공 여부 업데이트
     */
    public void updateApplicationResult(boolean wasSuccessful) {
        timesApplied++;
        if (wasSuccessful) {
            timesSuccessful++;
            resolved = true;
            resolvedAt = LocalDateTime.now();
        }
        
        // 성공률 재계산
        successRate = (double) timesSuccessful / timesApplied;
        
        // 효과성 점수 업데이트
        if (wasSuccessful) {
            effectivenessScore = Math.min(1.0, effectivenessScore + 0.05);
        } else {
            effectivenessScore = Math.max(0.0, effectivenessScore - 0.1);
        }
        
        lastApplied = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 수동 단계가 있는지 확인
     */
    public boolean hasManualSteps() {
        return manualSteps != null && !manualSteps.isEmpty();
    }
    
    /**
     * 예방 단계가 있는지 확인
     */
    public boolean hasPreventionSteps() {
        return preventionMeasures != null && !preventionMeasures.isEmpty();
    }
    
    /**
     * 롤백 가능한지 확인
     */
    public boolean isRollbackable() {
        return rollbackProcedure != null && !rollbackProcedure.isEmpty();
    }
    
    /**
     * 프로덕션 환경 적용 안전성 확인
     */
    public boolean isSafeForProduction() {
        return riskLevel < 0.5 && 
               verified && 
               getReliabilityScore() > 0.7 &&
               isRollbackable();
    }
    
    public enum ApplicabilityLevel {
        IMMEDIATE, QUICK, MODERATE, COMPLEX
    }
    
    public enum SolutionPriority {
        LOW, MEDIUM, HIGH, HIGHEST
    }
    
    @Data
    @Builder
    public static class SolutionStep {
        private int stepNumber;
        private String description;
        private String command;
        private String expectedResult;
        private boolean isAutomated;
        private String validationMethod;
        private List<String> dependencies;
    }
}