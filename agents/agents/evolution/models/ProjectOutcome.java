package com.globalcarelink.agents.evolution.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 프로젝트 결과 모델
 * 실제 프로젝트 완료 후 결과 데이터
 */
@Data
@Builder
public class ProjectOutcome {
    private String outcomeId;
    private String experienceId;
    private String guidelineId;
    private String projectName;
    private LocalDateTime completedAt;
    
    // 결과 지표
    private String result; // "success", "partial_success", "failure"
    private double overallScore; // 0.0 - 1.0
    private double actualTimeEfficiency;
    private double actualCodeQuality;
    private int actualBugsFound;
    private int actualMaintenanceIssues;
    
    // 실제 vs 예상 비교
    private double expectedSuccessRate;
    private double actualSuccessRate;
    private double varianceFromExpected;
    
    // 장기적 영향
    private int monthsInProduction;
    private double productionStability; // 운영 안정성
    private double customerSatisfaction; // 고객 만족도
    private double teamProductivity; // 팀 생산성 영향
    
    // 추가 메트릭
    private Map<String, Object> customMetrics;
    private String feedback; // 텍스트 피드백
    
    /**
     * 전체적인 성공 여부 판단
     */
    public boolean isSuccessful() {
        return "success".equals(result) && overallScore >= 0.7;
    }
    
    /**
     * 예상보다 좋은 결과인지 판단
     */
    public boolean isBetterThanExpected() {
        return actualSuccessRate > expectedSuccessRate && 
               varianceFromExpected > 0.1; // 10% 이상 향상
    }
    
    /**
     * 규칙 개선에 유용한 데이터인지 판단
     */
    public boolean isUsefulForEvolution() {
        return monthsInProduction >= 1 && // 최소 1개월 운영
               (isBetterThanExpected() || 
                actualSuccessRate < 0.6); // 매우 좋거나 매우 나쁜 경우
    }
    
    /**
     * 학습 가치 평가
     */
    public double getLearningValue() {
        double baseValue = Math.abs(actualSuccessRate - expectedSuccessRate);
        double stabilityBonus = productionStability * 0.2;
        double timeBonus = Math.min(monthsInProduction / 12.0, 1.0) * 0.3;
        
        return Math.min(1.0, baseValue + stabilityBonus + timeBonus);
    }
}