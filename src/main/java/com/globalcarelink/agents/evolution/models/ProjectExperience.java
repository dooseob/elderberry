package com.globalcarelink.agents.evolution.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 프로젝트 경험 데이터 모델
 * 규칙 진화를 위한 실제 경험 정보
 */
@Data
@Builder
public class ProjectExperience {
    private String experienceId;
    private String guidelineId;
    private String projectName;
    private String developer;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // 성과 지표
    private double successRate;        // 성공률 (0.0 - 1.0)
    private double timeEfficiency;     // 시간 효율성 (예상 시간 대비 실제 시간)
    private double codeQualityScore;   // 코드 품질 점수
    private int bugsFound;            // 발견된 버그 수
    private int codeReviewComments;   // 코드 리뷰 코멘트 수
    
    // 상세 정보
    private List<String> successFactors;   // 성공 요인들
    private List<String> failurePoints;    // 실패/문제점들
    private List<String> improvements;     // 개선 제안사항
    private Map<String, Object> metrics;   // 추가 메트릭들
    
    // 컨텍스트 정보
    private List<String> techStack;
    private String projectSize;       // small, medium, large, enterprise
    private String complexity;        // low, medium, high, extreme
    private String timeline;          // 프로젝트 기간
    
    /**
     * 전체적인 경험 점수 계산
     */
    public double getOverallScore() {
        // 가중 평균으로 계산
        double qualityWeight = 0.4;
        double successWeight = 0.3;
        double timeWeight = 0.3;
        
        return (codeQualityScore * qualityWeight) + 
               (successRate * successWeight) + 
               (timeEfficiency * timeWeight);
    }
    
    /**
     * 경험이 positive한지 판단
     */
    public boolean isPositiveExperience() {
        return getOverallScore() > 0.7 && bugsFound < 3;
    }
    
    /**
     * 소요 시간 계산 (시간 단위)
     */
    public long getDurationInHours() {
        if (startTime != null && endTime != null) {
            return java.time.temporal.ChronoUnit.HOURS.between(startTime, endTime);
        }
        return 0;
    }
    
    /**
     * 효율성 등급 계산
     */
    public EfficiencyGrade getEfficiencyGrade() {
        if (timeEfficiency >= 0.9) return EfficiencyGrade.EXCELLENT;
        if (timeEfficiency >= 0.8) return EfficiencyGrade.GOOD;
        if (timeEfficiency >= 0.7) return EfficiencyGrade.FAIR;
        if (timeEfficiency >= 0.6) return EfficiencyGrade.POOR;
        return EfficiencyGrade.VERY_POOR;
    }
    
    /**
     * 품질 등급 계산
     */
    public QualityGrade getQualityGrade() {
        if (codeQualityScore >= 0.9 && bugsFound == 0) return QualityGrade.EXCELLENT;
        if (codeQualityScore >= 0.8 && bugsFound <= 1) return QualityGrade.GOOD;
        if (codeQualityScore >= 0.7 && bugsFound <= 3) return QualityGrade.FAIR;
        if (codeQualityScore >= 0.6 && bugsFound <= 5) return QualityGrade.POOR;
        return QualityGrade.VERY_POOR;
    }
    
    /**
     * 학습 가치 평가 (이 경험이 규칙 개선에 얼마나 유용한지)
     */
    public double getLearningValue() {
        double scoreVariance = Math.abs(getOverallScore() - 0.7); // 평균에서 얼마나 벗어났는지
        double complexityBonus = getComplexityMultiplier();
        double sizeBonus = getProjectSizeMultiplier();
        
        return Math.min(1.0, scoreVariance * complexityBonus * sizeBonus);
    }
    
    private double getComplexityMultiplier() {
        return switch (complexity.toLowerCase()) {
            case "extreme" -> 1.5;
            case "high" -> 1.2;
            case "medium" -> 1.0;
            case "low" -> 0.8;
            default -> 1.0;
        };
    }
    
    private double getProjectSizeMultiplier() {
        return switch (projectSize.toLowerCase()) {
            case "enterprise" -> 1.4;
            case "large" -> 1.2;
            case "medium" -> 1.0;
            case "small" -> 0.9;
            default -> 1.0;
        };
    }
    
    public enum EfficiencyGrade {
        EXCELLENT, GOOD, FAIR, POOR, VERY_POOR
    }
    
    public enum QualityGrade {
        EXCELLENT, GOOD, FAIR, POOR, VERY_POOR
    }
}