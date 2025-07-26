package com.globalcarelink.agents.debug.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 디버깅 가설 모델
 */
@Data
@Builder
public class DebugHypothesis {
    private String hypothesisId;
    private String description;
    private double probability; // 0.0 - 1.0
    private String category; // "MEMORY", "PERFORMANCE", "LOGIC", "CONFIGURATION"
    
    // 검증 정보
    private boolean confirmed;
    private LocalDateTime testedAt;
    private List<String> evidenceFor;
    private List<String> evidenceAgainst;
    private String testMethod;
    private String testResult;
    
    // 관련 정보
    private List<String> relatedComponents;
    private List<String> testSteps;
    private double confidenceLevel;
    
    /**
     * 가설 검증 상태 업데이트
     */
    public void updateVerificationResult(boolean isConfirmed, String evidence) {
        this.confirmed = isConfirmed;
        this.testedAt = LocalDateTime.now();
        
        if (isConfirmed) {
            evidenceFor.add(evidence);
            confidenceLevel = Math.min(1.0, confidenceLevel + 0.2);
        } else {
            evidenceAgainst.add(evidence);
            confidenceLevel = Math.max(0.0, confidenceLevel - 0.1);
        }
    }
}