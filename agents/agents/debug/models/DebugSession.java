package com.globalcarelink.agents.debug.models;

import com.globalcarelink.agents.debug.DebugAgent.DebugStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 디버깅 세션 모델
 */
@Data
@Builder
public class DebugSession {
    private String sessionId;
    private String problemDescription;
    private List<String> relatedFiles;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private DebugStatus status;
    
    // 디버깅 프로세스
    private List<DebugStep> steps;
    private List<DebugHypothesis> hypotheses;
    private DebugSolution solution;
    
    // 성과 지표
    private long durationMinutes;
    private int stepsCompleted;
    private double resolutionConfidence;
    
    /**
     * 세션 소요 시간 계산
     */
    public long getDurationMinutes() {
        if (startTime == null) return 0;
        LocalDateTime end = endTime != null ? endTime : LocalDateTime.now();
        return ChronoUnit.MINUTES.between(startTime, end);
    }
    
    /**
     * 진행률 계산
     */
    public double getProgressPercentage() {
        if (steps == null || steps.isEmpty()) return 0.0;
        
        long completedSteps = steps.stream()
            .mapToInt(step -> step.isCompleted() ? 1 : 0)
            .sum();
        
        return (double) completedSteps / steps.size() * 100.0;
    }
    
    @Data
    @Builder
    public static class DebugStep {
        private int stepNumber;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private boolean completed;
        private String result;
    }
}