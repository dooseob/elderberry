package com.globalcarelink.agents.debug.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 에러 패턴 모델
 */
@Data
@Builder
public class ErrorPattern {
    private String patternId;
    private String patternName;
    private String description;
    private String category; // "PERFORMANCE", "MEMORY", "DATABASE", "NETWORK", "SECURITY"
    
    // 패턴 매칭 정보
    private String errorTypePattern;
    private String messagePattern;
    private String stackTracePattern;
    private List<String> classNamePatterns;
    private List<String> methodNamePatterns;
    
    // 패턴 통계
    private double confidence; // 0.0 - 1.0
    private int occurrenceCount;
    private LocalDateTime firstOccurrence;
    private LocalDateTime lastOccurrence;
    private double averageSeverity;
    
    // 해결 정보
    private DebugSolution associatedSolution;
    private List<String> commonCauses;
    private List<String> preventionMethods;
    private double solutionSuccessRate;
    
    // 환경 정보
    private List<String> affectedEnvironments; // "dev", "test", "prod"
    private List<String> affectedTechStack;
    private Map<String, String> environmentSpecificData;
    
    // 메타데이터
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // "AUTO_GENERATED", "MANUAL", "LEARNED"
    private boolean isActive;
    
    /**
     * 패턴 매칭 점수 계산
     */
    public double calculateMatchScore(LogAnalysisResult logResult) {
        double score = 0.0;
        int factors = 0;
        
        // 에러 타입 매칭
        if (matchesErrorType(logResult.getErrorType())) {
            score += 0.4;
        }
        factors++;
        
        // 메시지 패턴 매칭
        if (matchesMessage(logResult.getOriginalMessage())) {
            score += 0.3;
        }
        factors++;
        
        // 스택 트레이스 패턴 매칭
        if (matchesStackTrace(logResult.getStackTrace())) {
            score += 0.2;
        }
        factors++;
        
        // 클래스/메서드 매칭
        if (matchesClassMethod(logResult.getClassName(), logResult.getMethodName())) {
            score += 0.1;
        }
        factors++;
        
        return score * confidence;
    }
    
    /**
     * 패턴 신뢰도 업데이트
     */
    public void updateConfidence(boolean wasSuccessfulMatch) {
        if (wasSuccessfulMatch) {
            confidence = Math.min(1.0, confidence + 0.05);
            occurrenceCount++;
        } else {
            confidence = Math.max(0.0, confidence - 0.02);
        }
        
        lastOccurrence = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 패턴 우선순위 계산
     */
    public PatternPriority getPriority() {
        double priorityScore = (confidence * 0.4) + 
                              (Math.min(occurrenceCount / 100.0, 1.0) * 0.3) +
                              (averageSeverity * 0.3);
        
        if (priorityScore >= 0.8) return PatternPriority.CRITICAL;
        if (priorityScore >= 0.6) return PatternPriority.HIGH;
        if (priorityScore >= 0.4) return PatternPriority.MEDIUM;
        return PatternPriority.LOW;
    }
    
    /**
     * 패턴이 활성 상태인지 확인
     */
    public boolean isActivePattern() {
        return isActive && 
               confidence >= 0.3 &&
               lastOccurrence.isAfter(LocalDateTime.now().minusDays(30));
    }
    
    // Private helper methods
    private boolean matchesErrorType(String errorType) {
        return errorTypePattern != null && 
               errorType != null && 
               errorType.matches(errorTypePattern);
    }
    
    private boolean matchesMessage(String message) {
        return messagePattern != null && 
               message != null && 
               message.matches(messagePattern);
    }
    
    private boolean matchesStackTrace(String stackTrace) {
        return stackTracePattern != null && 
               stackTrace != null && 
               stackTrace.matches(stackTracePattern);
    }
    
    private boolean matchesClassMethod(String className, String methodName) {
        boolean classMatch = classNamePatterns == null || 
                           classNamePatterns.stream().anyMatch(pattern -> 
                               className != null && className.matches(pattern));
        
        boolean methodMatch = methodNamePatterns == null || 
                            methodNamePatterns.stream().anyMatch(pattern -> 
                                methodName != null && methodName.matches(pattern));
        
        return classMatch && methodMatch;
    }
    
    public enum PatternPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}