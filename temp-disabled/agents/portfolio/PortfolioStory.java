package com.globalcarelink.agents.portfolio;

import lombok.Builder;
import lombok.Data;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * 포트폴리오용 문제 해결 스토리
 * STAR 방법론(Situation, Task, Action, Result) 기반 구조
 */
@Data
@Builder
public class PortfolioStory {
    
    // 기본 정보
    private String id;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Status status;
    
    // STAR 방법론 구성 요소
    private String situation;  // 상황: 어떤 문제였는가?
    private String task;       // 과제: 무엇을 해결해야 했는가?
    private String action;     // 행동: 어떻게 해결했는가?
    private String result;     // 결과: 어떤 성과를 얻었는가?
    
    // 기술적 정보
    private Set<String> techStack;
    private Difficulty difficulty;
    private String category;
    
    // 포트폴리오 활용 정보
    private List<String> interviewQuestions;
    private List<String> learningPoints;
    private List<String> keySkillsUsed;
    
    // 메트릭스
    private int linesOfCodeChanged;
    private String performanceImprovement;
    private String businessImpact;
    
    public enum Status {
        IN_PROGRESS("진행 중"),
        COMPLETED("완료"),
        ARCHIVED("보관됨");
        
        private final String description;
        
        Status(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public enum Difficulty {
        LOW("쉬움", "기본적인 설정이나 간단한 버그 수정"),
        MEDIUM("보통", "로직 변경이나 API 연동 문제"),
        HIGH("어려움", "아키텍처 변경이나 복잡한 디버깅"),
        EXPERT("전문가", "시스템 전반적인 설계나 성능 최적화");
        
        private final String level;
        private final String description;
        
        Difficulty(String level, String description) {
            this.level = level;
            this.description = description;
        }
        
        public String getLevel() { return level; }
        public String getDescription() { return description; }
    }
    
    /**
     * 문제 해결 소요 시간 계산
     */
    public Duration getDuration() {
        if (startTime == null) return Duration.ZERO;
        LocalDateTime end = endTime != null ? endTime : LocalDateTime.now();
        return Duration.between(startTime, end);
    }
    
    /**
     * 포트폴리오 가치 점수 계산 (면접에서 어필할 수 있는 정도)
     */
    public int getPortfolioScore() {
        int score = 0;
        
        // 난이도별 점수
        score += switch (difficulty) {
            case LOW -> 10;
            case MEDIUM -> 25;
            case HIGH -> 50;
            case EXPERT -> 100;
        };
        
        // 기술 스택 다양성 점수
        score += techStack.size() * 5;
        
        // 비즈니스 임팩트 점수
        if (businessImpact != null && !businessImpact.isEmpty()) {
            score += 20;
        }
        
        // 성능 개선 점수
        if (performanceImprovement != null && !performanceImprovement.isEmpty()) {
            score += 15;
        }
        
        // 학습 포인트 점수
        score += learningPoints.size() * 3;
        
        return score;
    }
    
    /**
     * 면접 어필 포인트 생성
     */
    public List<String> getInterviewHighlights() {
        return List.of(
            "🎯 문제 해결: " + title,
            "⚡ 소요 시간: " + formatDuration(getDuration()),
            "🛠️ 기술 스택: " + String.join(", ", techStack),
            "📈 난이도: " + difficulty.getLevel() + " (" + difficulty.getDescription() + ")",
            "💡 핵심 학습: " + String.join(", ", learningPoints.subList(0, Math.min(3, learningPoints.size())))
        );
    }
    
    /**
     * GitHub README용 간단 요약
     */
    public String getGitHubSummary() {
        return String.format("**%s** - %s 문제를 %s만에 해결 (%s)",
            title,
            difficulty.getLevel(),
            formatDuration(getDuration()),
            String.join(", ", techStack)
        );
    }
    
    private String formatDuration(Duration duration) {
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        
        if (hours > 0) {
            return String.format("%d시간 %d분", hours, minutes);
        } else {
            return String.format("%d분", minutes);
        }
    }
}