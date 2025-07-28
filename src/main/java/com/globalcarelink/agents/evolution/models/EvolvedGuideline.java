package com.globalcarelink.agents.evolution.models;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 진화된 Claude 지침 모델
 */
@Data
@Builder
public class EvolvedGuideline {
    private String originalId;
    private String version;
    private String title;
    private String content;
    private List<String> improvedAspects;
    private String basedOnExperience;
    private double confidenceScore;
    private double effectivenessScore;
    private LocalDateTime createdAt;
    private int adoptionCount;
    private List<String> successStories;
    
    /**
     * 진화된 지침이 특정 도메인/컨텍스트에 적용 가능한지 확인
     */
    public boolean isApplicableTo(String domain, Map<String, Object> context) {
        // 개선된 측면들이 요청된 도메인과 일치하는지 확인
        boolean aspectMatch = improvedAspects.stream()
            .anyMatch(aspect -> aspect.toLowerCase().contains(domain.toLowerCase()));
        
        // 컨텍스트 기반 적합성 확인
        boolean contextMatch = checkContextCompatibility(context);
        
        return aspectMatch || contextMatch;
    }
    
    /**
     * 지침의 성숙도 (생성 후 경과 시간과 채택률 기반)
     */
    public double getMaturityScore() {
        long daysOld = java.time.temporal.ChronoUnit.DAYS.between(createdAt, LocalDateTime.now());
        double ageScore = Math.min(1.0, daysOld / 30.0); // 30일 후 완전 성숙
        double adoptionScore = Math.min(1.0, adoptionCount / 10.0); // 10회 채택 시 완전 성숙
        
        return (ageScore + adoptionScore) / 2.0;
    }
    
    /**
     * 버전 번호를 숫자로 변환 (비교용)
     */
    public double getVersionNumber() {
        try {
            return Double.parseDouble(version.replace("v", ""));
        } catch (NumberFormatException e) {
            return 1.0;
        }
    }
    
    private boolean checkContextCompatibility(Map<String, Object> context) {
        // 기술 스택 호환성 확인
        Object techStack = context.get("techStack");
        if (techStack instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> stack = (List<String>) techStack;
            return stack.contains("Java 21") || stack.contains("Spring Boot");
        }
        
        // 프로젝트 규모 호환성 확인
        Object projectSize = context.get("projectSize");
        if (projectSize instanceof String) {
            String size = (String) projectSize;
            return !size.equals("enterprise") || effectivenessScore > 0.8;
        }
        
        return true;
    }
}