package com.globalcarelink.agents.evolution.models;

import com.globalcarelink.agents.evolution.GuidelineEvolutionSystem.Priority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 814줄 원본 Claude 지침 모델
 */
@Data
@Builder
public class OriginalGuideline {
    private String id;
    private String category;
    private String title;
    private String content;
    private Priority priority;
    private LocalDateTime lastUpdated;
    private boolean evolvable;
    private int usageCount;
    private double originalEffectiveness;
    
    /**
     * 지침이 특정 도메인/컨텍스트에 적용 가능한지 확인
     */
    public boolean isApplicableTo(String domain, Object context) {
        // 카테고리와 도메인 매칭
        return category.toLowerCase().contains(domain.toLowerCase()) ||
               content.toLowerCase().contains(domain.toLowerCase());
    }
    
    /**
     * 지침의 나이 (마지막 업데이트로부터 경과 시간)
     */
    public long getAgeInDays() {
        return java.time.temporal.ChronoUnit.DAYS.between(lastUpdated, LocalDateTime.now());
    }
    
    /**
     * 지침이 오래되어 개선이 필요한지 판단
     */
    public boolean isOutdated() {
        return getAgeInDays() > 180; // 6개월 이상 오래된 규칙
    }
}