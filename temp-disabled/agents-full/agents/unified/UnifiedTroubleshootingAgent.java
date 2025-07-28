package com.globalcarelink.agents.unified;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.portfolio.PortfolioStory;
import com.globalcarelink.agents.portfolio.STARFormatter;
import com.globalcarelink.common.event.ErrorEvent;
import com.globalcarelink.common.event.PerformanceEvent;
import com.globalcarelink.common.event.SecurityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * 통합 트러블슈팅 에이전트
 * 목적: 1) TroubleshootingService + PortfolioTroubleshootAgent 통합
 *      2) 중복 기능 제거 및 단일 책임 원칙 적용
 *      3) 자동 문서화 + 포트폴리오 생성 + Claude 학습 일체화
 */
@Slf4j
@Component
public class UnifiedTroubleshootingAgent extends BaseAgent {
    
    private final STARFormatter starFormatter;
    private final DocumentationStrategy documentationStrategy;
    
    public UnifiedTroubleshootingAgent(STARFormatter starFormatter,
                                     DocumentationStrategy documentationStrategy) {
        super("UNIFIED_TROUBLESHOOTING");
        this.starFormatter = starFormatter;
        this.documentationStrategy = documentationStrategy;
    }
    
    // 통합된 스토리 관리
    private final Map<String, IntegratedTroubleStory> activeStories = new HashMap<>();
    private final List<IntegratedTroubleStory> completedStories = new ArrayList<>();
    
    
    @Override
    protected void doInitialize() {
        logger.info("통합 트러블슈팅 에이전트 초기화");
    }
    
    @Override
    protected void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "ERROR_EVENT", "DEBUG_ISSUE_DETECTED" -> handleTroubleEvent(event);
            case "ISSUE_RESOLVED" -> handleIssueResolution(event);
            case "PERFORMANCE_DEGRADATION" -> handlePerformanceIssue(event);
            case "SECURITY_INCIDENT" -> handleSecurityIssue(event);
        }
    }
    
    /**
     * 통합 이벤트 처리 - 기존 두 서비스의 기능을 하나로 통합
     */
    @EventListener
    @Async
    public void handleSystemTroubleEvent(Object systemEvent) {
        try {
            String eventId = extractEventId(systemEvent);
            
            // 중복 이벤트 체크
            if (isDuplicateEvent(eventId)) {
                return;
            }
            
            // 통합 스토리 시작
            IntegratedTroubleStory story = createIntegratedStory(systemEvent);
            activeStories.put(eventId, story);
            
            // 병렬 처리: 문서화 + 포트폴리오 + 학습
            CompletableFuture<Void> documentationTask = CompletableFuture.runAsync(() -> 
                generateTroubleDocumentation(story));
                
            CompletableFuture<Void> portfolioTask = CompletableFuture.runAsync(() -> 
                initializePortfolioStory(story));
                
            CompletableFuture<Void> learningTask = CompletableFuture.runAsync(() -> 
                extractLearningPatterns(story));
            
            // 모든 작업 완료 대기
            CompletableFuture.allOf(documentationTask, portfolioTask, learningTask).join();
            
            logger.info("통합 트러블슈팅 처리 완료: {}", story.getTitle());
            
        } catch (Exception e) {
            logger.error("통합 트러블슈팅 처리 실패", e);
        }
    }
    
    /**
     * 통합 스토리 생성 - 기존 두 시스템의 데이터를 통합
     */
    private IntegratedTroubleStory createIntegratedStory(Object systemEvent) {
        IntegratedTroubleStory.Builder builder = IntegratedTroubleStory.builder()
            .id(UUID.randomUUID().toString())
            .startTime(LocalDateTime.now())
            .status(IntegratedTroubleStory.Status.IN_PROGRESS);
            
        if (systemEvent instanceof ErrorEvent errorEvent) {
            return builder
                .title(errorEvent.getErrorType() + " 해결 과정")
                .troubleType(TroubleType.ERROR)
                .severity(mapSeverity(errorEvent.getSeverity()))
                .situation(buildSituationFromError(errorEvent))
                .task(buildTaskFromError(errorEvent))
                .techStack(extractTechStackFromError(errorEvent))
                .originalEvent(errorEvent)
                .build();
                
        } else if (systemEvent instanceof PerformanceEvent perfEvent) {
            return builder
                .title("성능 최적화: " + perfEvent.getOperationType())
                .troubleType(TroubleType.PERFORMANCE)
                .severity(mapPerformanceSeverity(perfEvent))
                .situation(buildSituationFromPerformance(perfEvent))
                .task(buildTaskFromPerformance(perfEvent))
                .techStack(Set.of("Java 21", "Spring Boot", "Database"))
                .originalEvent(perfEvent)
                .build();
                
        } else if (systemEvent instanceof SecurityEvent secEvent) {
            return builder
                .title("보안 이슈 해결: " + secEvent.getSecurityEventType())
                .troubleType(TroubleType.SECURITY)
                .severity(TroubleSeverity.HIGH)
                .situation(buildSituationFromSecurity(secEvent))
                .task(buildTaskFromSecurity(secEvent))
                .techStack(Set.of("Spring Security", "JWT", "Authentication"))
                .originalEvent(secEvent)
                .build();
        }
        
        return builder.build();
    }
    
    /**
     * 다중 형식 문서 생성 - 기존 마크다운 + 새로운 형식들
     */
    private void generateTroubleDocumentation(IntegratedTroubleStory story) {
        try {
            // 1. 기존 solutions-db.md 형식
            String markdownDoc = documentationStrategy.generateMarkdown(story);
            saveDocument("solutions-db.md", markdownDoc, DocumentFormat.MARKDOWN);
            
            // 2. 포트폴리오용 STAR 형식
            PortfolioStory portfolioStory = convertToPortfolioStory(story);
            String portfolioDoc = starFormatter.formatToPortfolio(portfolioStory);
            saveDocument("portfolio", portfolioDoc, DocumentFormat.STAR_PORTFOLIO);
            
            // 3. Claude 학습용 패턴 형식
            String learningDoc = starFormatter.formatForClaudeImprovement(portfolioStory);
            saveDocument("claude-learning", learningDoc, DocumentFormat.LEARNING_PATTERN);
            
            // 4. GitHub README용 형식
            String githubDoc = starFormatter.formatForGitHub(portfolioStory);
            saveDocument("github", githubDoc, DocumentFormat.GITHUB_README);
            
            story.setDocumentationCompleted(true);
            
        } catch (Exception e) {
            logger.error("문서 생성 실패: {}", story.getId(), e);
        }
    }
    
    /**
     * 포트폴리오 스토리 초기화
     */
    private void initializePortfolioStory(IntegratedTroubleStory story) {
        // 면접 질문 자동 생성
        List<String> interviewQuestions = generateInterviewQuestions(story);
        story.setInterviewQuestions(interviewQuestions);
        
        // 기술 스킬 매핑
        List<String> keySkills = mapTechnicalSkills(story);
        story.setKeySkillsUsed(keySkills);
        
        // 포트폴리오 점수 계산
        int portfolioScore = calculatePortfolioScore(story);
        story.setPortfolioScore(portfolioScore);
        
        logger.debug("포트폴리오 스토리 초기화 완료: {} (점수: {})", story.getTitle(), portfolioScore);
    }
    
    /**
     * 학습 패턴 추출
     */
    private void extractLearningPatterns(IntegratedTroubleStory story) {
        // Claude 학습용 패턴 데이터 생성
        Map<String, Object> learningData = Map.of(
            "problemPattern", extractProblemPattern(story),
            "solutionApproach", extractSolutionApproach(story),
            "preventionStrategy", generatePreventionStrategy(story),
            "contextualFactors", extractContextualFactors(story),
            "techStackImpact", analyzeTechStackImpact(story)
        );
        
        // 다른 에이전트들에게 학습 데이터 전파
        publishEvent("LEARNING_PATTERN_EXTRACTED", Map.of(
            "storyId", story.getId(),
            "learningData", learningData,
            "troubleType", story.getTroubleType(),
            "severity", story.getSeverity()
        ));
    }
    
    /**
     * 이슈 해결 완료 처리
     */
    private void handleIssueResolution(Object resolutionEvent) {
        // 해결 정보를 스토리에 반영
        // Action과 Result 섹션 완성
        // 최종 문서 생성 및 아카이브
    }
    
    /**
     * 통합 스토리 상태 조회
     */
    public Map<String, Object> getTroubleShootingStatus() {
        return Map.of(
            "activeStories", activeStories.size(),
            "completedStories", completedStories.size(),
            "totalResolutionTime", calculateAverageResolutionTime(),
            "topTechStack", getTopTechStack(),
            "successRate", calculateSuccessRate(),
            "lastActivity", LocalDateTime.now()
        );
    }
    
    // Helper methods
    private String extractEventId(Object event) {
        if (event instanceof ErrorEvent e) return e.getEventId();
        if (event instanceof PerformanceEvent e) return e.getEventId();
        if (event instanceof SecurityEvent e) return e.getEventId();
        return UUID.randomUUID().toString();
    }
    
    private TroubleSeverity mapSeverity(String severity) {
        return switch (severity.toUpperCase()) {
            case "CRITICAL" -> TroubleSeverity.CRITICAL;
            case "HIGH" -> TroubleSeverity.HIGH;
            case "MEDIUM" -> TroubleSeverity.MEDIUM;
            default -> TroubleSeverity.LOW;
        };
    }
    
    private boolean isDuplicateEvent(String eventId) {
        // 기존 중복 체크 로직 재사용
        return activeStories.containsKey(eventId);
    }
    
    // Inner classes and enums
    public enum TroubleType {
        ERROR, PERFORMANCE, SECURITY, INTEGRATION, CONFIGURATION
    }
    
    public enum TroubleSeverity {
        CRITICAL, HIGH, MEDIUM, LOW
    }
    
    public enum DocumentFormat {
        MARKDOWN, STAR_PORTFOLIO, LEARNING_PATTERN, GITHUB_README
    }
    
    // 통합 스토리 클래스는 별도 파일로 분리 예정
    private static class IntegratedTroubleStory {
        // PortfolioStory + TroubleShootingDocument의 통합된 형태
        // 모든 필드와 메서드를 포함하여 중복 제거
        
        public static class Builder {
            // Builder 패턴 구현
        }
    }
}