package com.globalcarelink.agents.debug.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 로그 분석 결과 모델
 */
@Data
@Builder
public class LogAnalysisResult {
    private String analysisId;
    private String logLevel;
    private String originalMessage;
    private String stackTrace;
    private LocalDateTime timestamp;
    
    // 분석 결과
    private String errorType;
    private String problemDescription;
    private String rootCause;
    private String stackTracePattern;
    private double severity; // 0.0 - 1.0
    
    // 컨텍스트 정보
    private String threadName;
    private String className;
    private String methodName;
    private int lineNumber;
    private Map<String, String> contextData;
    
    // 영향도 분석
    private String impactScope; // "method", "class", "module", "system"
    private List<String> affectedComponents;
    private boolean isRecurring;
    private int occurrenceCount;
    
    // 분석 메타데이터
    private LocalDateTime analyzedAt;
    private String analyzerVersion;
    private double analysisConfidence;
    
    /**
     * 심각도 등급 계산
     */
    public SeverityLevel getSeverityLevel() {
        if (severity >= 0.9) return SeverityLevel.CRITICAL;
        if (severity >= 0.7) return SeverityLevel.HIGH;
        if (severity >= 0.5) return SeverityLevel.MEDIUM;
        if (severity >= 0.3) return SeverityLevel.LOW;
        return SeverityLevel.INFO;
    }
    
    /**
     * 즉시 대응이 필요한지 판단
     */
    public boolean requiresImmediateAction() {
        return severity >= 0.8 || 
               "system".equals(impactScope) ||
               isRecurring && occurrenceCount > 5;
    }
    
    /**
     * 분석 품질 점수
     */
    public double getAnalysisQuality() {
        double completeness = calculateCompleteness();
        return (analysisConfidence * 0.7) + (completeness * 0.3);
    }
    
    private double calculateCompleteness() {
        int score = 0;
        if (errorType != null && !errorType.isEmpty()) score++;
        if (rootCause != null && !rootCause.isEmpty()) score++;
        if (className != null && !className.isEmpty()) score++;
        if (methodName != null && !methodName.isEmpty()) score++;
        if (stackTracePattern != null && !stackTracePattern.isEmpty()) score++;
        
        return score / 5.0;
    }
    
    public enum SeverityLevel {
        INFO, LOW, MEDIUM, HIGH, CRITICAL
    }
}