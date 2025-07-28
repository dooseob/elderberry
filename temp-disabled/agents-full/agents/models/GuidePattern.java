package com.globalcarelink.agents.models;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 학습된 가이드 패턴 모델
 * ClaudeGuideAgent에서 사용하는 패턴 학습 시스템
 */
@Data
public class GuidePattern {
    private String patternKey;
    private Set<String> techStack;
    private List<String> commonLearningPoints;
    private List<String> experienceIds;
    private double confidence;
    private int usageCount;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    
    // 패턴 효과성 지표
    private double successRate;
    private int totalApplications;
    private int successfulApplications;
    
    // 패턴 진화 정보
    private String originalVersion;
    private String currentVersion;
    private List<String> evolutionHistory;
    
    public GuidePattern(String patternKey) {
        this.patternKey = patternKey;
        this.commonLearningPoints = new ArrayList<>();
        this.experienceIds = new ArrayList<>();
        this.evolutionHistory = new ArrayList<>();
        this.confidence = 0.0;
        this.usageCount = 0;
        this.successRate = 0.0;
        this.totalApplications = 0;
        this.successfulApplications = 0;
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        this.originalVersion = "v1.0";
        this.currentVersion = "v1.0";
    }
    
    /**
     * 새로운 경험을 패턴에 추가
     */
    public void addExperience(String experienceId, List<String> learningPoints) {
        experienceIds.add(experienceId);
        
        // 공통 학습 포인트 업데이트
        for (String point : learningPoints) {
            if (!commonLearningPoints.contains(point)) {
                commonLearningPoints.add(point);
            }
        }
        
        usageCount++;
        lastUpdated = LocalDateTime.now();
    }
    
    /**
     * 패턴 신뢰도 업데이트
     */
    public void updateConfidence() {
        if (totalApplications > 0) {
            successRate = (double) successfulApplications / totalApplications;
            confidence = Math.min(1.0, (successRate * 0.7) + (Math.min(usageCount, 10) * 0.03));
        } else {
            confidence = Math.min(1.0, Math.min(usageCount, 10) * 0.05);
        }
    }
    
    /**
     * 패턴 적용 결과 기록
     */
    public void recordApplication(boolean success) {
        totalApplications++;
        if (success) {
            successfulApplications++;
        }
        updateConfidence();
    }
    
    /**
     * 패턴이 성숙한지 판단
     */
    public boolean isMature() {
        return usageCount >= 5 && confidence >= 0.7;
    }
    
    /**
     * 패턴 진화 기록
     */
    public void evolvePattern(String newVersion, String evolutionReason) {
        evolutionHistory.add(String.format("v%s -> %s: %s (%s)", 
            currentVersion, newVersion, evolutionReason, LocalDateTime.now()));
        currentVersion = newVersion;
        lastUpdated = LocalDateTime.now();
    }
    
    /**
     * 패턴 품질 점수 계산
     */
    public double getQualityScore() {
        double baseScore = confidence;
        double maturityBonus = isMature() ? 0.2 : 0.0;
        double usageBonus = Math.min(usageCount * 0.01, 0.1);
        
        return Math.min(1.0, baseScore + maturityBonus + usageBonus);
    }
    
    /**
     * 패턴 설명 생성
     */
    public String getDescription() {
        return String.format("Pattern %s (Confidence: %.1f%%, Usage: %d times, Success Rate: %.1f%%)",
            patternKey, confidence * 100, usageCount, successRate * 100);
    }
}