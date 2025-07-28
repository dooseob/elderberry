package com.globalcarelink.agents.evolution.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 규칙 진화 결과 모델
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvolutionResult {
    private String guidelineId;
    private boolean improved;
    private boolean needsImprovement;
    private double currentEffectiveness;
    private double improvementRate;
    private OriginalGuideline originalGuideline;
    private EvolvedGuideline evolvedGuideline;
    private String reason;
    private LocalDateTime timestamp;
    
    // Static factory methods
    public static EvolutionResult improved(String guidelineId, 
                                         OriginalGuideline original, 
                                         EvolvedGuideline evolved,
                                         GuidelineEffectiveness effectiveness) {
        return EvolutionResult.builder()
            .guidelineId(guidelineId)
            .improved(true)
            .needsImprovement(false)
            .currentEffectiveness(effectiveness.getScore())
            .improvementRate(evolved.getEffectivenessScore() - original.getOriginalEffectiveness())
            .originalGuideline(original)
            .evolvedGuideline(evolved)
            .reason("실제 프로젝트 경험을 통한 개선")
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    public static EvolutionResult noChangeNeeded(String guidelineId, 
                                               GuidelineEffectiveness effectiveness) {
        return EvolutionResult.builder()
            .guidelineId(guidelineId)
            .improved(false)
            .needsImprovement(false)
            .currentEffectiveness(effectiveness.getScore())
            .improvementRate(0.0)
            .reason("현재 규칙이 충분히 효과적임")
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    public static EvolutionResult notFound(String guidelineId) {
        return EvolutionResult.builder()
            .guidelineId(guidelineId)
            .improved(false)
            .needsImprovement(false)
            .currentEffectiveness(0.0)
            .improvementRate(0.0)
            .reason("해당 규칙을 찾을 수 없음")
            .timestamp(LocalDateTime.now())
            .build();
    }
}