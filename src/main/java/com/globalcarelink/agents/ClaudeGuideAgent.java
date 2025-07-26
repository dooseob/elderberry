package com.globalcarelink.agents;

import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.portfolio.PortfolioStory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Claude 지침 학습 및 보완 에이전트
 * 목적: 1) 실제 프로젝트 경험을 통한 Claude 가이드라인 개선
 *      2) 개발자 지원을 위한 맞춤형 지침 생성
 *      3) 패턴 기반 예측적 가이드 제공
 */
@Component
public class ClaudeGuideAgent extends BaseAgent {
    
    // 학습된 패턴 저장소
    private final Map<String, GuidePattern> learnedPatterns = new ConcurrentHashMap<>();
    
    // 지침 개선 히스토리
    private final List<GuideImprovement> improvementHistory = new ArrayList<>();
    
    // 실시간 가이드 요청 처리
    private final Map<String, ActiveGuidance> activeGuidances = new ConcurrentHashMap<>();
    
    public ClaudeGuideAgent() {
        super("CLAUDE_GUIDE");
    }
    
    @Override
    protected void doInitialize() {
        logger.info("Claude 지침 학습 에이전트 초기화");
        
        // 기존 학습 패턴 로드
        loadExistingPatterns();
        
        // 기본 가이드라인 설정
        initializeBaseGuidelines();
        
        // 실시간 학습 시작
        startRealtimeLearning();
    }
    
    @Override
    protected void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "PORTFOLIO_STORY_COMPLETED":
                learnFromPortfolioStory(event);
                break;
            case "DEBUG_PATTERN_IDENTIFIED":
                updateDebuggingGuidelines(event);
                break;
            case "API_DOCUMENTATION_UPDATED":
                enhanceAPIGuidelines(event);
                break;
            case "DEVELOPMENT_QUESTION_ASKED":
                provideContextualGuidance(event);
                break;
            case "CODE_REVIEW_COMPLETED":
                learnFromCodeReview(event);
                break;
        }
    }
    
    /**
     * 포트폴리오 스토리에서 학습하여 지침 개선
     */
    private void learnFromPortfolioStory(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> storyData = (Map<String, Object>) event.getData();
        
        String storyId = (String) storyData.get("storyId");
        @SuppressWarnings("unchecked")
        List<String> learningPoints = (List<String>) storyData.get("learningPoints");
        @SuppressWarnings("unchecked")
        Set<String> techStack = (Set<String>) storyData.get("techStack");
        
        // 패턴 추출 및 학습
        String patternKey = generatePatternKey(techStack, learningPoints);
        GuidePattern pattern = learnedPatterns.computeIfAbsent(patternKey, k -> new GuidePattern(k));
        
        // 패턴 강화
        pattern.addExperience(storyId, learningPoints);
        pattern.updateConfidence();
        
        // 새로운 지침 생성
        String newGuideline = generateGuideline(pattern);
        if (newGuideline != null) {
            GuideImprovement improvement = GuideImprovement.builder()
                .id(UUID.randomUUID().toString())
                .patternKey(patternKey)
                .oldGuideline(pattern.getCurrentGuideline())
                .newGuideline(newGuideline)
                .sourceStoryId(storyId)
                .improvementType("PORTFOLIO_LEARNING")
                .confidence(pattern.getConfidence())
                .createdAt(LocalDateTime.now())
                .build();
            
            improvementHistory.add(improvement);
            pattern.setCurrentGuideline(newGuideline);
            
            logger.info("새로운 지침 생성: {} (신뢰도: {})", patternKey, pattern.getConfidence());
            
            // 다른 에이전트들에게 알림
            publishEvent("GUIDELINE_IMPROVED", Map.of(
                "patternKey", patternKey,
                "newGuideline", newGuideline,
                "confidence", pattern.getConfidence(),
                "sourceStory", storyId
            ));
        }
    }
    
    /**
     * 개발자 질문에 대한 맞춤형 가이드 제공
     */
    private void provideContextualGuidance(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> questionData = (Map<String, Object>) event.getData();
        
        String questionId = (String) questionData.get("questionId");
        String question = (String) questionData.get("question");
        String context = (String) questionData.getOrDefault("context", "");
        
        // 질문 분석 및 관련 패턴 찾기
        List<GuidePattern> relevantPatterns = findRelevantPatterns(question, context);
        
        // 맞춤형 가이드 생성
        String guidance = generateContextualGuidance(question, relevantPatterns);
        
        // 예측적 조언 추가
        List<String> predictiveAdvice = generatePredictiveAdvice(question, context);
        
        // 활성 가이던스 등록
        ActiveGuidance activeGuidance = ActiveGuidance.builder()
            .questionId(questionId)
            .question(question)
            .guidance(guidance)
            .predictiveAdvice(predictiveAdvice)
            .relevantPatterns(relevantPatterns.stream().map(GuidePattern::getPatternKey).toList())
            .confidence(calculateOverallConfidence(relevantPatterns))
            .createdAt(LocalDateTime.now())
            .build();
        
        activeGuidances.put(questionId, activeGuidance);
        
        // 응답 전송
        publishEvent("GUIDANCE_PROVIDED", Map.of(
            "questionId", questionId,
            "guidance", guidance,
            "predictiveAdvice", predictiveAdvice,
            "confidence", activeGuidance.getConfidence(),
            "sources", activeGuidance.getRelevantPatterns()
        ));
        
        logger.info("맞춤형 가이드 제공: {} (신뢰도: {})", 
            questionId, activeGuidance.getConfidence());
    }
    
    /**
     * 디버깅 패턴 분석하여 지침 업데이트
     */
    private void updateDebuggingGuidelines(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> debugData = (Map<String, Object>) event.getData();
        
        String errorPattern = (String) debugData.get("errorPattern");
        String solution = (String) debugData.get("solution");
        String prevention = (String) debugData.get("prevention");
        
        // 디버깅 지침 패턴 업데이트
        String patternKey = "DEBUG_" + errorPattern;
        GuidePattern pattern = learnedPatterns.computeIfAbsent(patternKey, k -> new GuidePattern(k));
        
        // 해결책과 예방책을 지침으로 변환
        String newGuideline = String.format(
            "## %s 문제 해결 가이드\n\n" +
            "### 해결 방법\n%s\n\n" +
            "### 예방 방법\n%s\n\n" +
            "### 학습된 날짜\n%s",
            errorPattern, solution, prevention, LocalDateTime.now()
        );
        
        pattern.setCurrentGuideline(newGuideline);
        pattern.incrementUsageCount();
        
        logger.info("디버깅 지침 업데이트: {}", errorPattern);
    }
    
    /**
     * API 문서 업데이트에 따른 지침 강화
     */
    private void enhanceAPIGuidelines(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> apiData = (Map<String, Object>) event.getData();
        
        String apiPath = (String) apiData.get("apiPath");
        String bestPractice = (String) apiData.get("bestPractice");
        String commonMistakes = (String) apiData.get("commonMistakes");
        
        // API 가이드라인 생성/업데이트
        String patternKey = "API_" + extractAPICategory(apiPath);
        GuidePattern pattern = learnedPatterns.computeIfAbsent(patternKey, k -> new GuidePattern(k));
        
        String apiGuideline = String.format(
            "## %s API 사용 가이드\n\n" +
            "### 베스트 프랙티스\n%s\n\n" +
            "### 주의사항\n%s\n\n" +
            "### 업데이트 일시\n%s",
            apiPath, bestPractice, commonMistakes, LocalDateTime.now()
        );
        
        pattern.setCurrentGuideline(apiGuideline);
        pattern.updateConfidence();
    }
    
    /**
     * 관련 패턴 찾기 (질문 기반)
     */
    private List<GuidePattern> findRelevantPatterns(String question, String context) {
        List<GuidePattern> relevant = new ArrayList<>();
        
        // 키워드 매칭
        String[] keywords = extractKeywords(question + " " + context);
        
        for (GuidePattern pattern : learnedPatterns.values()) {
            double relevanceScore = calculateRelevanceScore(pattern, keywords);
            if (relevanceScore > 0.5) { // 임계값 이상인 패턴만 선택
                pattern.setRelevanceScore(relevanceScore);
                relevant.add(pattern);
            }
        }
        
        // 관련도 순으로 정렬
        relevant.sort((p1, p2) -> Double.compare(p2.getRelevanceScore(), p1.getRelevanceScore()));
        
        // 상위 5개만 반환
        return relevant.subList(0, Math.min(5, relevant.size()));
    }
    
    /**
     * 맞춤형 가이던스 생성
     */
    private String generateContextualGuidance(String question, List<GuidePattern> patterns) {
        StringBuilder guidance = new StringBuilder();
        
        guidance.append("# 맞춤형 개발 가이드\n\n");
        guidance.append("**질문**: ").append(question).append("\n\n");
        
        if (!patterns.isEmpty()) {
            guidance.append("## 🎯 관련 경험 기반 조언\n\n");
            
            for (int i = 0; i < Math.min(3, patterns.size()); i++) {
                GuidePattern pattern = patterns.get(i);
                guidance.append("### ").append(i + 1).append(". ").append(pattern.getPatternKey()).append("\n");
                guidance.append("**신뢰도**: ").append(String.format("%.1f", pattern.getConfidence() * 100)).append("%\n\n");
                guidance.append(pattern.getCurrentGuideline()).append("\n\n");
            }
        }
        
        // 일반적인 가이드라인 추가
        guidance.append("## 💡 일반적인 접근 방법\n\n");
        guidance.append(generateGeneralGuidance(question)).append("\n\n");
        
        guidance.append("## 🔍 추가 고려사항\n\n");
        guidance.append("- 현재 프로젝트 환경: Java 21 + Spring Boot + React\n");
        guidance.append("- 개발 환경: WSL1 + H2 Database\n");
        guidance.append("- 기존 해결 사례를 참고하여 단계적으로 접근\n");
        guidance.append("- 문제 해결 과정을 포트폴리오로 문서화 고려\n\n");
        
        return guidance.toString();
    }
    
    /**
     * 예측적 조언 생성
     */
    private List<String> generatePredictiveAdvice(String question, String context) {
        List<String> advice = new ArrayList<>();
        
        // 질문 유형별 예측적 조언
        if (question.toLowerCase().contains("error") || question.toLowerCase().contains("문제")) {
            advice.add("🔍 로그 파일 확인 및 DebugAgent 활용을 고려하세요");
            advice.add("📝 문제 해결 과정을 포트폴리오 스토리로 기록하세요");
            advice.add("🛡️ 유사한 문제의 재발 방지책을 마련하세요");
        }
        
        if (question.toLowerCase().contains("api") || question.toLowerCase().contains("엔드포인트")) {
            advice.add("📋 API 문서화 에이전트를 통한 자동 문서 생성을 고려하세요");
            advice.add("🧪 API 테스트 케이스 작성을 권장합니다");
            advice.add("🔐 보안 및 인증 처리를 잊지 마세요");
        }
        
        if (question.toLowerCase().contains("성능") || question.toLowerCase().contains("최적화")) {
            advice.add("📊 성능 메트릭 수집 및 분석을 먼저 수행하세요");
            advice.add("🎯 병목 지점 식별 후 단계적 최적화를 진행하세요");
            advice.add("📈 최적화 결과를 정량적으로 측정하고 문서화하세요");
        }
        
        return advice;
    }
    
    /**
     * 전체 패턴 기반 지침 요약 생성
     */
    public Map<String, Object> generateGuidelineSummary() {
        Map<String, Long> patternCategories = learnedPatterns.values().stream()
            .collect(java.util.stream.Collectors.groupingBy(
                p -> p.getPatternKey().split("_")[0],
                java.util.stream.Collectors.counting()
            ));
        
        List<GuidePattern> topPatterns = learnedPatterns.values().stream()
            .sorted((p1, p2) -> Double.compare(p2.getConfidence(), p1.getConfidence()))
            .limit(10)
            .toList();
        
        return Map.of(
            "totalPatterns", learnedPatterns.size(),
            "totalImprovements", improvementHistory.size(),
            "patternCategories", patternCategories,
            "topConfidencePatterns", topPatterns.stream().map(GuidePattern::getPatternKey).toList(),
            "averageConfidence", calculateAverageConfidence(),
            "lastUpdate", LocalDateTime.now()
        );
    }
    
    // Helper methods and inner classes
    private String generatePatternKey(Set<String> techStack, List<String> learningPoints) {
        String tech = String.join("-", techStack);
        String domain = extractDomain(learningPoints);
        return domain + "_" + tech;
    }
    
    private String extractDomain(List<String> learningPoints) {
        // 학습 포인트에서 도메인 추출
        for (String point : learningPoints) {
            if (point.contains("Repository")) return "DATA";
            if (point.contains("API")) return "API";
            if (point.contains("UI") || point.contains("React")) return "FRONTEND";
            if (point.contains("Security")) return "SECURITY";
        }
        return "GENERAL";
    }
    
    private String generateGuideline(GuidePattern pattern) {
        // 패턴의 경험을 바탕으로 가이드라인 생성
        if (pattern.getExperiences().size() >= 2 && pattern.getConfidence() > 0.7) {
            return String.format(
                "## %s 가이드라인\n\n" +
                "**신뢰도**: %.1f%%\n\n" +
                "**주요 학습 내용**:\n%s\n\n" +
                "**권장 접근법**:\n%s\n\n" +
                "**주의사항**:\n%s",
                pattern.getPatternKey(),
                pattern.getConfidence() * 100,
                formatLearningPoints(pattern),
                generateRecommendedApproach(pattern),
                generateCautions(pattern)
            );
        }
        return null;
    }
    
    private String formatLearningPoints(GuidePattern pattern) {
        return pattern.getExperiences().values().stream()
            .flatMap(List::stream)
            .distinct()
            .limit(5)
            .map(point -> "- " + point)
            .collect(java.util.stream.Collectors.joining("\n"));
    }
    
    private String generateRecommendedApproach(GuidePattern pattern) {
        return "1. 현재 상황 분석\n2. 기존 경험 사례 참고\n3. 단계적 해결 접근\n4. 결과 검증 및 문서화";
    }
    
    private String generateCautions(GuidePattern pattern) {
        return "- 환경별 차이점 고려\n- 충분한 테스트 수행\n- 변경사항 백업 보관";
    }
    
    private String[] extractKeywords(String text) {
        return text.toLowerCase()
            .replaceAll("[^a-zA-Z가-힣0-9\\s]", "")
            .split("\\s+");
    }
    
    private double calculateRelevanceScore(GuidePattern pattern, String[] keywords) {
        String patternText = pattern.getPatternKey().toLowerCase() + " " + 
                           pattern.getCurrentGuideline().toLowerCase();
        
        int matches = 0;
        for (String keyword : keywords) {
            if (patternText.contains(keyword.toLowerCase())) {
                matches++;
            }
        }
        
        return (double) matches / keywords.length;
    }
    
    private double calculateOverallConfidence(List<GuidePattern> patterns) {
        return patterns.stream()
            .mapToDouble(GuidePattern::getConfidence)
            .average()
            .orElse(0.0);
    }
    
    private String generateGeneralGuidance(String question) {
        return "Java 21과 Spring Boot 환경에서의 일반적인 개발 접근법을 따르되, " +
               "프로젝트 특성에 맞는 맞춤형 솔루션을 고려하세요.";
    }
    
    private String extractAPICategory(String apiPath) {
        if (apiPath.contains("/auth")) return "AUTHENTICATION";
        if (apiPath.contains("/api/")) return "REST_API";
        return "GENERAL_API";
    }
    
    private double calculateAverageConfidence() {
        return learnedPatterns.values().stream()
            .mapToDouble(GuidePattern::getConfidence)
            .average()
            .orElse(0.0);
    }
    
    private void loadExistingPatterns() {
        logger.info("기존 학습 패턴 로드 중...");
        // 실제 구현에서는 데이터베이스나 파일에서 로드
    }
    
    private void initializeBaseGuidelines() {
        logger.info("기본 가이드라인 초기화 중...");
        // 기본 가이드라인 설정
    }
    
    private void startRealtimeLearning() {
        logger.info("실시간 학습 시작");
        // 실시간 학습 스케줄러 시작
    }
    
    private void learnFromCodeReview(AgentEvent event) {
        // 코드 리뷰에서 학습하는 로직
    }
    
    // Inner classes
    private static class GuidePattern {
        private final String patternKey;
        private String currentGuideline;
        private final Map<String, List<String>> experiences = new HashMap<>();
        private double confidence = 0.0;
        private int usageCount = 0;
        private double relevanceScore = 0.0;
        
        public GuidePattern(String patternKey) {
            this.patternKey = patternKey;
        }
        
        public void addExperience(String storyId, List<String> learningPoints) {
            experiences.put(storyId, new ArrayList<>(learningPoints));
            updateConfidence();
        }
        
        public void updateConfidence() {
            // 경험 수와 사용 횟수를 바탕으로 신뢰도 계산
            int experienceCount = experiences.size();
            confidence = Math.min(1.0, (experienceCount * 0.2) + (usageCount * 0.1));
        }
        
        public void incrementUsageCount() {
            usageCount++;
            updateConfidence();
        }
        
        // Getters and setters
        public String getPatternKey() { return patternKey; }
        public String getCurrentGuideline() { return currentGuideline; }
        public void setCurrentGuideline(String guideline) { this.currentGuideline = guideline; }
        public Map<String, List<String>> getExperiences() { return experiences; }
        public double getConfidence() { return confidence; }
        public double getRelevanceScore() { return relevanceScore; }
        public void setRelevanceScore(double score) { this.relevanceScore = score; }
    }
    
    private static class GuideImprovement {
        private String id;
        private String patternKey;
        private String oldGuideline;
        private String newGuideline;
        private String sourceStoryId;
        private String improvementType;
        private double confidence;
        private LocalDateTime createdAt;
        
        public static GuideImprovementBuilder builder() {
            return new GuideImprovementBuilder();
        }
        
        public static class GuideImprovementBuilder {
            private GuideImprovement improvement = new GuideImprovement();
            
            public GuideImprovementBuilder id(String id) { improvement.id = id; return this; }
            public GuideImprovementBuilder patternKey(String key) { improvement.patternKey = key; return this; }
            public GuideImprovementBuilder oldGuideline(String old) { improvement.oldGuideline = old; return this; }
            public GuideImprovementBuilder newGuideline(String new_) { improvement.newGuideline = new_; return this; }
            public GuideImprovementBuilder sourceStoryId(String id) { improvement.sourceStoryId = id; return this; }
            public GuideImprovementBuilder improvementType(String type) { improvement.improvementType = type; return this; }
            public GuideImprovementBuilder confidence(double conf) { improvement.confidence = conf; return this; }
            public GuideImprovementBuilder createdAt(LocalDateTime time) { improvement.createdAt = time; return this; }
            
            public GuideImprovement build() { return improvement; }
        }
    }
    
    private static class ActiveGuidance {
        private String questionId;
        private String question;
        private String guidance;
        private List<String> predictiveAdvice;
        private List<String> relevantPatterns;
        private double confidence;
        private LocalDateTime createdAt;
        
        public static ActiveGuidanceBuilder builder() {
            return new ActiveGuidanceBuilder();
        }
        
        public static class ActiveGuidanceBuilder {
            private ActiveGuidance guidance = new ActiveGuidance();
            
            public ActiveGuidanceBuilder questionId(String id) { guidance.questionId = id; return this; }
            public ActiveGuidanceBuilder question(String q) { guidance.question = q; return this; }
            public ActiveGuidanceBuilder guidance(String g) { guidance.guidance = g; return this; }
            public ActiveGuidanceBuilder predictiveAdvice(List<String> advice) { guidance.predictiveAdvice = advice; return this; }
            public ActiveGuidanceBuilder relevantPatterns(List<String> patterns) { guidance.relevantPatterns = patterns; return this; }
            public ActiveGuidanceBuilder confidence(double conf) { guidance.confidence = conf; return this; }
            public ActiveGuidanceBuilder createdAt(LocalDateTime time) { guidance.createdAt = time; return this; }
            
            public ActiveGuidance build() { return guidance; }
        }
        
        public double getConfidence() { return confidence; }
        public List<String> getRelevantPatterns() { return relevantPatterns; }
    }
}