package com.globalcarelink.agents;

import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.portfolio.PortfolioStory;
import com.globalcarelink.agents.portfolio.STARFormatter;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 포트폴리오 중심 트러블슈팅 에이전트
 * 목적: 1) 취업 포트폴리오용 문제 해결 스토리 생성
 *      2) Claude 지침 보완을 위한 실제 경험 학습
 */
@Component
public class PortfolioTroubleshootAgent extends BaseAgent {
    
    private final STARFormatter starFormatter;
    private final List<PortfolioStory> portfolioStories = new ArrayList<>();
    private final Map<String, Integer> issuePatterns = new HashMap<>();
    
    public PortfolioTroubleshootAgent() {
        super("PORTFOLIO_TROUBLESHOOT");
        this.starFormatter = new STARFormatter();
    }
    
    @Override
    protected void doInitialize() {
        logger.info("포트폴리오 트러블슈팅 에이전트 초기화");
        
        // 기존 포트폴리오 스토리 로드
        loadExistingStories();
        
        // Claude 지침 개선을 위한 패턴 분석 시작
        analyzeExistingPatterns();
    }
    
    @Override
    protected void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "DEBUG_ISSUE_DETECTED":
                handleDebugIssue(event);
                break;
            case "ISSUE_RESOLVED":
                handleIssueResolution(event);
                break;
            case "CODE_CHANGE_MADE":
                analyzeCodeChange(event);
                break;
            case "API_ERROR_OCCURRED":
                handleAPIError(event);
                break;
        }
    }
    
    /**
     * 디버그 이슈 처리 - 포트폴리오 스토리의 시작점
     */
    private void handleDebugIssue(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> issueData = (Map<String, Object>) event.getData();
        
        // 포트폴리오 스토리 시작
        PortfolioStory story = PortfolioStory.builder()
            .id(UUID.randomUUID().toString())
            .title(generateStoryTitle(issueData))
            .startTime(LocalDateTime.now())
            .situation(analyzeSituation(issueData))
            .task(defineTask(issueData))
            .status(PortfolioStory.Status.IN_PROGRESS)
            .techStack(extractTechStack(issueData))
            .difficulty(assessDifficulty(issueData))
            .build();
        
        portfolioStories.add(story);
        
        // 이슈 패턴 분석 (Claude 지침 보완용)
        String issuePattern = extractIssuePattern(issueData);
        issuePatterns.merge(issuePattern, 1, Integer::sum);
        
        logger.info("새로운 포트폴리오 스토리 시작: {}", story.getTitle());
        
        // GuideAgent에게 알림 (지침 보완용)
        publishEvent("PORTFOLIO_STORY_STARTED", Map.of(
            "storyId", story.getId(),
            "issuePattern", issuePattern,
            "difficulty", story.getDifficulty()
        ));
    }
    
    /**
     * 이슈 해결 처리 - 포트폴리오 스토리 완성
     */
    private void handleIssueResolution(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> resolutionData = (Map<String, Object>) event.getData();
        
        String issueId = (String) resolutionData.get("issueId");
        PortfolioStory story = findActiveStory(issueId);
        
        if (story != null) {
            // STAR 방법론으로 스토리 완성
            story.setAction(analyzeAction(resolutionData));
            story.setResult(analyzeResult(resolutionData));
            story.setEndTime(LocalDateTime.now());
            story.setStatus(PortfolioStory.Status.COMPLETED);
            
            // 면접 질문 자동 생성
            story.setInterviewQuestions(generateInterviewQuestions(story));
            
            // 학습 포인트 추출 (Claude 지침 보완용)
            List<String> learningPoints = extractLearningPoints(story);
            story.setLearningPoints(learningPoints);
            
            // 포트폴리오 문서 자동 생성
            String portfolioDocument = starFormatter.formatToPortfolio(story);
            savePortfolioDocument(story.getId(), portfolioDocument);
            
            logger.info("포트폴리오 스토리 완성: {} ({})", 
                story.getTitle(), story.getDuration());
            
            // 다른 에이전트들에게 공유
            publishEvent("PORTFOLIO_STORY_COMPLETED", Map.of(
                "storyId", story.getId(),
                "learningPoints", learningPoints,
                "techStack", story.getTechStack(),
                "portfolioDocument", portfolioDocument
            ));
        }
    }
    
    /**
     * STAR 방법론 기반 상황 분석
     */
    private String analyzeSituation(Map<String, Object> issueData) {
        StringBuilder situation = new StringBuilder();
        
        situation.append("프로젝트: 엘더베리 케어링크 (Spring Boot + React)\n");
        situation.append("개발 환경: Java 21, WSL1, H2 Database\n");
        
        if (issueData.containsKey("errorType")) {
            situation.append("문제 상황: ").append(issueData.get("errorType")).append(" 발생\n");
        }
        
        if (issueData.containsKey("affectedFeatures")) {
            situation.append("영향 범위: ").append(issueData.get("affectedFeatures")).append("\n");
        }
        
        return situation.toString();
    }
    
    /**
     * 과제 정의 (Task)
     */
    private String defineTask(Map<String, Object> issueData) {
        String errorType = (String) issueData.get("errorType");
        String priority = (String) issueData.getOrDefault("priority", "MEDIUM");
        
        return String.format("'%s' 문제를 %s 우선순위로 해결하여 서비스 안정성 확보", 
            errorType, priority);
    }
    
    /**
     * 행동 분석 (Action)
     */
    private String analyzeAction(Map<String, Object> resolutionData) {
        StringBuilder action = new StringBuilder();
        
        @SuppressWarnings("unchecked")
        List<String> steps = (List<String>) resolutionData.getOrDefault("resolutionSteps", new ArrayList<>());
        
        action.append("문제 해결 과정:\n");
        for (int i = 0; i < steps.size(); i++) {
            action.append(String.format("%d. %s\n", i + 1, steps.get(i)));
        }
        
        if (resolutionData.containsKey("toolsUsed")) {
            action.append("사용 도구: ").append(resolutionData.get("toolsUsed")).append("\n");
        }
        
        if (resolutionData.containsKey("codeChanges")) {
            action.append("코드 변경사항: ").append(resolutionData.get("codeChanges")).append("\n");
        }
        
        return action.toString();
    }
    
    /**
     * 결과 분석 (Result)
     */
    private String analyzeResult(Map<String, Object> resolutionData) {
        StringBuilder result = new StringBuilder();
        
        String resolutionTime = (String) resolutionData.getOrDefault("timeSpent", "미측정");
        String impact = (String) resolutionData.getOrDefault("impact", "시스템 안정성 향상");
        
        result.append("해결 결과:\n");
        result.append("- 문제 해결 시간: ").append(resolutionTime).append("\n");
        result.append("- 비즈니스 임팩트: ").append(impact).append("\n");
        
        if (resolutionData.containsKey("performanceImprovement")) {
            result.append("- 성능 개선: ").append(resolutionData.get("performanceImprovement")).append("\n");
        }
        
        if (resolutionData.containsKey("preventiveMeasures")) {
            result.append("- 재발 방지책: ").append(resolutionData.get("preventiveMeasures")).append("\n");
        }
        
        return result.toString();
    }
    
    /**
     * 면접 질문 자동 생성
     */
    private List<String> generateInterviewQuestions(PortfolioStory story) {
        List<String> questions = new ArrayList<>();
        
        // 기술적 질문
        questions.add("이 문제를 해결하기 위해 어떤 기술적 접근을 사용했나요?");
        questions.add("다른 해결 방법도 고려해보셨나요? 왜 이 방법을 선택했나요?");
        
        // 과정 질문
        questions.add("문제 해결 과정에서 가장 어려웠던 부분은 무엇인가요?");
        questions.add("이 경험을 통해 어떤 것을 배웠나요?");
        
        // 협업 질문 (해당되는 경우)
        if (story.getTechStack().size() > 1) {
            questions.add("여러 기술이 연관된 문제였는데, 어떻게 종합적으로 접근했나요?");
        }
        
        return questions;
    }
    
    /**
     * Claude 지침 보완을 위한 학습 포인트 추출
     */
    private List<String> extractLearningPoints(PortfolioStory story) {
        List<String> learningPoints = new ArrayList<>();
        
        // 기술적 학습 포인트
        learningPoints.add("Java 21 환경에서의 " + story.getTitle() + " 해결 경험");
        
        // 프로세스 학습 포인트
        if (story.getDuration().toMinutes() < 30) {
            learningPoints.add("빠른 문제 해결을 위한 효율적인 디버깅 프로세스");
        }
        
        // 기술 스택별 학습 포인트
        for (String tech : story.getTechStack()) {
            learningPoints.add(tech + " 관련 문제 해결 노하우");
        }
        
        return learningPoints;
    }
    
    /**
     * 포트폴리오 문서 생성 및 저장
     */
    private void savePortfolioDocument(String storyId, String document) {
        // 실제 구현에서는 파일 시스템이나 데이터베이스에 저장
        setSharedData("portfolio_story_" + storyId, document);
        
        // 포트폴리오 디렉토리에 마크다운 파일로 저장
        publishEvent("SAVE_PORTFOLIO_DOCUMENT", Map.of(
            "storyId", storyId,
            "document", document,
            "filename", "troubleshooting_" + storyId + ".md"
        ));
    }
    
    /**
     * 포트폴리오 요약 생성 (전체 경험 정리)
     */
    public Map<String, Object> generatePortfolioSummary() {
        List<PortfolioStory> completedStories = portfolioStories.stream()
            .filter(s -> s.getStatus() == PortfolioStory.Status.COMPLETED)
            .toList();
        
        Map<String, Long> techStackFrequency = completedStories.stream()
            .flatMap(s -> s.getTechStack().stream())
            .collect(java.util.stream.Collectors.groupingBy(
                tech -> tech, 
                java.util.stream.Collectors.counting()
            ));
        
        return Map.of(
            "totalProblemsResolved", completedStories.size(),
            "averageResolutionTime", calculateAverageResolutionTime(completedStories),
            "topTechnologies", techStackFrequency,
            "difficultyDistribution", analyzeDifficultyDistribution(completedStories),
            "keyLearnings", extractKeyLearnings(completedStories)
        );
    }
    
    // Helper methods
    private String generateStoryTitle(Map<String, Object> issueData) {
        String errorType = (String) issueData.getOrDefault("errorType", "시스템 이슈");
        return errorType + " 해결 과정";
    }
    
    private PortfolioStory.Difficulty assessDifficulty(Map<String, Object> issueData) {
        // 이슈의 복잡도를 평가하는 로직
        String errorType = (String) issueData.get("errorType");
        if (errorType != null && errorType.contains("Repository")) {
            return PortfolioStory.Difficulty.HIGH; // Repository 에러는 고난이도
        }
        return PortfolioStory.Difficulty.MEDIUM;
    }
    
    private Set<String> extractTechStack(Map<String, Object> issueData) {
        Set<String> techStack = new HashSet<>();
        techStack.add("Java 21");
        techStack.add("Spring Boot");
        
        if (issueData.containsKey("frontend")) {
            techStack.add("React 18");
            techStack.add("TypeScript");
        }
        
        if (issueData.containsKey("database")) {
            techStack.add("H2 Database");
        }
        
        return techStack;
    }
    
    private String extractIssuePattern(Map<String, Object> issueData) {
        // Claude 지침 보완을 위한 패턴 추출
        String errorType = (String) issueData.get("errorType");
        String component = (String) issueData.getOrDefault("component", "UNKNOWN");
        return component + "_" + errorType;
    }
    
    private PortfolioStory findActiveStory(String issueId) {
        return portfolioStories.stream()
            .filter(s -> s.getStatus() == PortfolioStory.Status.IN_PROGRESS)
            .findFirst()
            .orElse(null);
    }
    
    private void loadExistingStories() {
        // 기존 포트폴리오 스토리를 로드하는 로직
        logger.info("기존 포트폴리오 스토리 로드 완료");
    }
    
    private void analyzeExistingPatterns() {
        // 기존 패턴을 분석해서 Claude 지침 개선점을 찾는 로직
        logger.info("기존 이슈 패턴 분석 완료");
    }
    
    private void analyzeCodeChange(AgentEvent event) {
        // 코드 변경사항 분석 로직
    }
    
    private void handleAPIError(AgentEvent event) {
        // API 에러 처리 로직
    }
    
    private double calculateAverageResolutionTime(List<PortfolioStory> stories) {
        return stories.stream()
            .mapToLong(s -> s.getDuration().toMinutes())
            .average()
            .orElse(0.0);
    }
    
    private Map<PortfolioStory.Difficulty, Long> analyzeDifficultyDistribution(List<PortfolioStory> stories) {
        return stories.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                PortfolioStory::getDifficulty,
                java.util.stream.Collectors.counting()
            ));
    }
    
    private List<String> extractKeyLearnings(List<PortfolioStory> stories) {
        return stories.stream()
            .flatMap(s -> s.getLearningPoints().stream())
            .collect(java.util.stream.Collectors.groupingBy(
                learning -> learning,
                java.util.stream.Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(Map.Entry::getKey)
            .toList();
    }
}