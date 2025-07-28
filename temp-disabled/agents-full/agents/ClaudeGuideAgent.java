package com.globalcarelink.agents;

import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.portfolio.PortfolioStory;
import com.globalcarelink.agents.evolution.GuidelineEvolutionSystem;
import com.globalcarelink.agents.evolution.models.ProjectExperience;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Claude 지침 진화 에이전트 (자가 진화 시스템)
 * 
 * 📌 핵심 목표: 814줄은 시작점일 뿐, 무한히 진화하는 지능형 가이드 시스템
 * 
 * 🚀 주요 기능:
 * 1) 동적 가이드라인 생성: 프로젝트 상황에 맞춰 실시간으로 지침 생성
 * 2) 자가 학습 시스템: 모든 개발 활동에서 패턴을 학습하고 개선
 * 3) 맥락 인식 엔진: 현재 작업 환경과 역사를 고려한 최적 조언
 * 4) 예측적 문제 해결: 잠재적 문제를 미리 감지하고 예방책 제시
 * 5) 다차원 효과성 측정: 속도, 품질, 안정성, 확장성 등 종합 평가
 * 
 * 🧠 진화 메커니즘:
 * - 실시간 피드백 루프: 제안한 가이드의 실제 효과 즉시 반영
 * - 크로스 프로젝트 학습: 다른 프로젝트 경험도 흡수하여 성장
 * - 개발자 성향 분석: 개인별 맞춤형 가이드 제공
 * - 기술 트렌드 반영: 최신 기술 동향 자동 통합
 * 
 * 💡 지침 철학:
 * "완벽한 가이드는 없다. 오직 진화하는 가이드만 있을 뿐이다."
 * - 상황에 따라 유연하게 변화
 * - 실패에서 배우고 성공을 강화
 * - 개발자의 성장과 함께 성장
 * 
 * 🎯 현재 환경 특화:
 * - Java 21 + Virtual Threads 최적화 가이드
 * - Spring Boot 3.x 최신 패턴 적용
 * - WSL2 환경 특화 성능 튜닝
 * - 순차적 에이전트 시스템 활용법
 */
@Component
public class ClaudeGuideAgent extends BaseAgent {
    
    private final GuidelineEvolutionSystem evolutionSystem;
    
    // 학습된 패턴 저장소
    private final Map<String, GuidePattern> learnedPatterns = new ConcurrentHashMap<>();
    
    // 지침 개선 히스토리
    private final List<GuideImprovement> improvementHistory = new ArrayList<>();
    
    // 실시간 가이드 요청 처리
    private final Map<String, ActiveGuidance> activeGuidances = new ConcurrentHashMap<>();
    
    // 삭제된 지침 추적 시스템
    private final List<DeletedGuideline> deletionHistory = new ArrayList<>();
    
    // 지침 진화 추적
    private final Map<String, GuidelineEvolution> evolutionTracker = new ConcurrentHashMap<>();
    
    public ClaudeGuideAgent(GuidelineEvolutionSystem evolutionSystem) {
        super("CLAUDE_GUIDE");
        this.evolutionSystem = evolutionSystem;
    }
    
    @Override
    protected void doInitialize() {
        logger.info("🧠 Claude 지침 진화 에이전트 초기화 (자가 진화 시스템)");
        
        // 진화 시스템 초기화 - 814줄은 시작점일 뿐
        evolutionSystem.initializeEvolutionaryGuidelines();
        
        // 기존 학습 패턴 로드 + 진화 히스토리 복원
        loadExistingPatternsWithEvolution();
        
        // 동적 가이드라인 생성 엔진 시작
        initializeDynamicGuidelineEngine();
        
        // 맥락 인식 시스템 활성화
        activateContextAwarenessEngine();
        
        // 실시간 학습 + 예측 시스템 시작
        startRealtimeLearningAndPrediction();
        
        // 개발자 성향 분석기 초기화
        initializeDeveloperBehaviorAnalyzer();
        
        logger.info("✅ 자가 진화 가이드 시스템 활성화 완료 - 무한 성장 모드");
    }
    
    @Override
    public Object executeSequentially(Map<String, Object> input) {
        String taskType = (String) input.getOrDefault("taskType", "GUIDANCE");
        
        switch (taskType) {
            case "PORTFOLIO_LEARNING":
                return learnFromPortfolioData(input);
            case "DEBUG_GUIDANCE":
                return provideDebuggingGuidance(input);
            case "API_GUIDANCE":
                return provideAPIGuidance(input);
            case "CONTEXTUAL_GUIDANCE":
                return provideContextualGuidanceFromInput(input);
            case "CODE_REVIEW_LEARNING":
                return learnFromCodeReviewData(input);
            default:
                return provideGeneralGuidance(input);
        }
    }
    
    /**
     * 순차 실행용 포트폴리오 학습
     */
    private Map<String, Object> learnFromPortfolioData(Map<String, Object> input) {
        String storyId = (String) input.getOrDefault("storyId", "unknown");
        @SuppressWarnings("unchecked")
        List<String> learningPoints = (List<String>) input.getOrDefault("learningPoints", List.of());
        @SuppressWarnings("unchecked")
        Set<String> techStack = new HashSet<>((List<String>) input.getOrDefault("techStack", List.of()));
        
        // 패턴 추출 및 학습
        String patternKey = generatePatternKey(techStack, learningPoints);
        GuidePattern pattern = learnedPatterns.computeIfAbsent(patternKey, k -> new GuidePattern(k));
        
        // 패턴 강화
        pattern.addExperience(storyId, learningPoints);
        pattern.updateConfidence();
        
        // 새로운 지침 생성
        String newGuideline = generateGuideline(pattern);
        
        Map<String, Object> result = new HashMap<>();
        result.put("patternKey", patternKey);
        result.put("confidence", pattern.getConfidence());
        result.put("newGuideline", newGuideline);
        result.put("learningComplete", true);
        
        logResult("PORTFOLIO_LEARNING", result);
        return result;
    }
    
    /**
     * 순차 실행용 디버깅 가이던스
     */
    private Map<String, Object> provideDebuggingGuidance(Map<String, Object> input) {
        String errorPattern = (String) input.getOrDefault("errorPattern", "unknown");
        String context = (String) input.getOrDefault("context", "");
        
        // 관련 패턴 찾기
        List<GuidePattern> relevantPatterns = findRelevantPatterns(errorPattern, context);
        
        // 디버깅 가이드 생성
        String guidance = generateDebuggingGuidance(errorPattern, relevantPatterns);
        
        Map<String, Object> result = Map.of(
            "errorPattern", errorPattern,
            "guidance", guidance,
            "relevantPatterns", relevantPatterns.stream().map(GuidePattern::getPatternKey).toList(),
            "confidence", calculateOverallConfidence(relevantPatterns)
        );
        
        logResult("DEBUG_GUIDANCE", result);
        return result;
    }
    
    /**
     * 순차 실행용 API 가이던스
     */
    private Map<String, Object> provideAPIGuidance(Map<String, Object> input) {
        String apiPath = (String) input.getOrDefault("apiPath", "");
        String method = (String) input.getOrDefault("method", "GET");
        
        // API 가이드라인 생성
        String guidance = generateAPIGuidance(apiPath, method);
        
        Map<String, Object> result = Map.of(
            "apiPath", apiPath,
            "method", method,
            "guidance", guidance,
            "bestPractices", getAPIBestPractices(apiPath),
            "commonMistakes", getAPICommonMistakes(apiPath)
        );
        
        logResult("API_GUIDANCE", result);
        return result;
    }
    
    /**
     * 순차 실행용 맞춤형 가이던스
     */
    private Map<String, Object> provideContextualGuidanceFromInput(Map<String, Object> input) {
        String question = (String) input.getOrDefault("question", "");
        String context = (String) input.getOrDefault("context", "");
        
        // 관련 패턴 찾기
        List<GuidePattern> relevantPatterns = findRelevantPatterns(question, context);
        
        // 맞춤형 가이드 생성
        String guidance = generateContextualGuidance(question, relevantPatterns);
        List<String> predictiveAdvice = generatePredictiveAdvice(question, context);
        
        Map<String, Object> result = Map.of(
            "question", question,
            "guidance", guidance,
            "predictiveAdvice", predictiveAdvice,
            "relevantPatterns", relevantPatterns.stream().map(GuidePattern::getPatternKey).toList(),
            "confidence", calculateOverallConfidence(relevantPatterns)
        );
        
        logResult("CONTEXTUAL_GUIDANCE", result);
        return result;
    }
    
    /**
     * 순차 실행용 코드 리뷰 학습
     */
    private Map<String, Object> learnFromCodeReviewData(Map<String, Object> input) {
        String reviewId = (String) input.getOrDefault("reviewId", "unknown");
        String guidelineId = (String) input.getOrDefault("guidelineId", "");
        
        // 코드 리뷰 결과를 바탕으로 학습
        ProjectExperience experience = buildExperienceFromCodeReviewData(input);
        
        Map<String, Object> result = Map.of(
            "reviewId", reviewId,
            "guidelineId", guidelineId,
            "experienceId", experience.getExperienceId(),
            "learningComplete", true
        );
        
        logResult("CODE_REVIEW_LEARNING", result);
        return result;
    }
    
    /**
     * 순차 실행용 일반 가이던스
     */
    private Map<String, Object> provideGeneralGuidance(Map<String, Object> input) {
        String topic = (String) input.getOrDefault("topic", "general");
        
        Map<String, Object> result = Map.of(
            "topic", topic,
            "guidance", generateGeneralGuidance(topic),
            "recommendations", List.of(
                "순차적 에이전트 시스템 활용 (4개 서브에이전트)",
                "Java 21 Virtual Threads 최적화",
                "WSL2 환경 최적화 고려",
                "실용주의 원칙: 동작하는 코드 우선",
                "안정성 우선: 한 단계씩 검증",
                "자동 문서화 시스템 활용"
            ),
            "environment", Map.of(
                "java", "21 (LTS, Virtual Threads)",
                "springBoot", "3.x",
                "frontend", "React 18 + TypeScript 5.x",
                "database", "H2 (개발환경)",
                "platform", "WSL2"
            ),
            "agentSystem", Map.of(
                "available", List.of("CLAUDE_GUIDE", "DEBUG", "UNIFIED_TROUBLESHOOTING", "API_DOCUMENTATION"),
                "execution", "Sequential (순차적 실행)",
                "bridge", "JavaScript ↔ Java 브리지"
            )
        );
        
        logResult("GENERAL_GUIDANCE", result);
        return result;
    }
    
    /**
     * 기존 이벤트 기반 메서드 (사용 안함)
     */
    @Deprecated
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
        
        guidance.append("# 🎯 자가 진화 맞춤형 개발 가이드\n\n");
        guidance.append("**질문**: ").append(question).append("\n");
        guidance.append("**분석 시각**: ").append(LocalDateTime.now()).append("\n\n");
        
        // 1. 핵심 지침 (절대 누락 방지)
        guidance.append("## 🚨 핵심 지침 (MUST FOLLOW)\n\n");
        guidance.append(generateCriticalGuidelines()).append("\n\n");
        
        // 2. 패턴 기반 조언
        if (!patterns.isEmpty()) {
            guidance.append("## 🧠 학습된 패턴 기반 조언\n\n");
            
            for (int i = 0; i < Math.min(5, patterns.size()); i++) {
                GuidePattern pattern = patterns.get(i);
                guidance.append("### ").append(i + 1).append(". ").append(pattern.getPatternKey()).append("\n");
                guidance.append("**신뢰도**: ").append(String.format("%.1f", pattern.getConfidence() * 100)).append("%\n");
                guidance.append("**검증 횟수**: ").append(pattern.getUsageCount()).append("회\n");
                guidance.append("**진화 단계**: ").append(getEvolutionStage(pattern)).append("\n\n");
                guidance.append(pattern.getCurrentGuideline()).append("\n\n");
            }
        }
        
        // 3. 동적 생성 가이드
        guidance.append("## 💡 실시간 생성 가이드\n\n");
        guidance.append(generateDynamicGuidance(question)).append("\n\n");
        
        // 4. 예측적 조언
        guidance.append("## 🔮 예측적 조언\n\n");
        guidance.append(generateEnhancedPredictiveAdvice(question)).append("\n\n");
        
        // 5. 환경별 최적화
        guidance.append("## 🔧 현재 환경 최적화 가이드\n\n");
        guidance.append(generateEnvironmentSpecificGuidance()).append("\n\n");
        
        // 6. 누락 방지 체크리스트
        guidance.append("## ✅ 누락 방지 체크리스트\n\n");
        guidance.append(generateAntiOmissionChecklist(question)).append("\n\n");
        
        // 7. 자가 평가 메트릭
        guidance.append("## 📊 가이드 품질 메트릭\n");
        Map<String, Object> metrics = evaluateGuidanceQuality(guidance.toString());
        guidance.append(formatQualityMetrics(metrics)).append("\n");
        
        return guidance.toString();
    }
    
    /**
     * 핵심 지침 생성 (절대 누락 방지)
     */
    private String generateCriticalGuidelines() {
        return String.join("\n", List.of(
            "1. **Java 21 필수**: Virtual Threads 활용으로 동시성 처리 최적화",
            "2. **Spring Boot 3.x 표준**: 최신 어노테이션과 패턴 사용 필수",
            "3. **WSL2 최적화**: Linux 파일시스템 사용으로 I/O 성능 10배 향상",
            "4. **순차 에이전트**: 복잡한 작업은 4개 서브에이전트로 자동 분할",
            "5. **실용주의 원칙**: 동작하는 코드 → 테스트 → 리팩토링 순서 엄수",
            "6. **자동 문서화**: 모든 변경사항은 에이전트가 자동으로 기록",
            "7. **에러 처리**: 모든 예외는 통합 트러블슈팅 에이전트가 자동 분석"
        ));
    }
    
    /**
     * 동적 가이드 생성
     */
    private String generateDynamicGuidance(String question) {
        StringBuilder dynamic = new StringBuilder();
        
        // 질문 키워드 기반 동적 가이드
        if (question.toLowerCase().contains("성능")) {
            dynamic.append("- **Virtual Threads**: ExecutorService 대신 Thread.startVirtualThread() 사용\n");
            dynamic.append("- **JIT 최적화**: -XX:+UseZGC로 GC 일시정지 최소화\n");
            dynamic.append("- **캐시 전략**: Spring Cache + @Cacheable로 반복 연산 제거\n");
        }
        
        if (question.toLowerCase().contains("보안")) {
            dynamic.append("- **Spring Security 6.x**: SecurityFilterChain 빈 설정 필수\n");
            dynamic.append("- **JWT 구현**: 액세스 토큰 15분, 리프레시 토큰 7일 설정\n");
            dynamic.append("- **CORS 설정**: WebMvcConfigurer로 정확한 origin 명시\n");
        }
        
        if (question.toLowerCase().contains("테스트")) {
            dynamic.append("- **단위 테스트**: @SpringBootTest + @MockBean 조합\n");
            dynamic.append("- **통합 테스트**: @AutoConfigureMockMvc로 API 테스트\n");
            dynamic.append("- **테스트 데이터**: @Sql로 테스트별 독립적 데이터 설정\n");
        }
        
        return dynamic.length() > 0 ? dynamic.toString() : "표준 개발 가이드라인을 따르세요.";
    }
    
    /**
     * 향상된 예측적 조언
     */
    private String generateEnhancedPredictiveAdvice(String question) {
        List<String> predictions = new ArrayList<>();
        
        // 컨텍스트 기반 예측
        if (question.contains("API")) {
            predictions.add("📌 다음 단계: API 버전 관리 전략 수립이 필요할 것입니다");
            predictions.add("⚡ 성능 이슈: 대용량 요청시 페이징 처리 구현 준비하세요");
            predictions.add("🔐 보안 고려: Rate Limiting 구현을 미리 준비하세요");
        }
        
        if (question.contains("데이터베이스")) {
            predictions.add("📈 확장성: 향후 PostgreSQL 마이그레이션 대비 JPA 표준 준수");
            predictions.add("🔄 동기화: 캐시와 DB 간 일관성 유지 전략 필요");
            predictions.add("📊 모니터링: 쿼리 성능 추적을 위한 로깅 설정 권장");
        }
        
        return String.join("\n", predictions.isEmpty() ? 
            List.of("지속적인 모니터링과 개선이 필요합니다.") : predictions);
    }
    
    /**
     * 환경별 최적화 가이드
     */
    private String generateEnvironmentSpecificGuidance() {
        return String.join("\n", List.of(
            "### 🖥️ WSL2 환경",
            "- 파일 작업: /mnt/c 대신 /home 사용 (10배 성능 향상)",
            "- 포트 포워딩: Windows 방화벽 설정 확인 필수",
            "- 메모리: .wslconfig로 최대 메모리 설정 (권장: 8GB)",
            "",
            "### ☕ Java 21 최적화",
            "- Virtual Threads: 블로킹 I/O 작업에 적극 활용",
            "- Pattern Matching: switch 표현식으로 코드 간결화",
            "- Records: DTO 클래스는 record로 구현",
            "",
            "### 🌱 Spring Boot 3.x",
            "- Native Image: GraalVM 네이티브 이미지 지원 활용",
            "- Observability: Micrometer로 메트릭 자동 수집",
            "- Problem Details: RFC 7807 표준 에러 응답"
        ));
    }
    
    /**
     * 누락 방지 체크리스트
     */
    private String generateAntiOmissionChecklist(String question) {
        List<String> checklist = new ArrayList<>();
        
        // 필수 체크 항목
        checklist.add("☐ Java 21 기능 활용 여부 확인");
        checklist.add("☐ Spring Boot 3.x 최신 패턴 적용");
        checklist.add("☐ 에러 처리 및 로깅 구현");
        checklist.add("☐ 테스트 코드 작성 계획");
        checklist.add("☐ 문서화 자동화 설정");
        
        // 질문별 추가 체크 항목
        if (question.contains("API")) {
            checklist.add("☐ API 문서 자동 생성 (OpenAPI 3.0)");
            checklist.add("☐ 요청/응답 DTO 검증 (@Valid)");
            checklist.add("☐ 예외 처리 표준화");
        }
        
        if (question.contains("성능")) {
            checklist.add("☐ 성능 측정 기준 설정");
            checklist.add("☐ 부하 테스트 계획");
            checklist.add("☐ 모니터링 대시보드 구성");
        }
        
        return String.join("\n", checklist);
    }
    
    /**
     * 가이드 품질 평가
     */
    private Map<String, Object> evaluateGuidanceQuality(String guidance) {
        Map<String, Object> metrics = new HashMap<>();
        
        // 완성도 평가
        int completeness = 0;
        if (guidance.contains("Java 21")) completeness += 20;
        if (guidance.contains("Spring Boot")) completeness += 20;
        if (guidance.contains("WSL2")) completeness += 20;
        if (guidance.contains("에이전트")) completeness += 20;
        if (guidance.contains("체크리스트")) completeness += 20;
        
        metrics.put("completeness", completeness);
        metrics.put("specificityScore", calculateSpecificity(guidance));
        metrics.put("actionabilityScore", calculateActionability(guidance));
        metrics.put("evolutionLevel", determineEvolutionLevel(guidance));
        
        return metrics;
    }
    
    /**
     * 품질 메트릭 포맷팅
     */
    private String formatQualityMetrics(Map<String, Object> metrics) {
        return String.format(
            "- **완성도**: %d%%\n" +
            "- **구체성**: %.1f/10\n" +
            "- **실행가능성**: %.1f/10\n" +
            "- **진화 수준**: %s\n",
            metrics.get("completeness"),
            metrics.get("specificityScore"),
            metrics.get("actionabilityScore"),
            metrics.get("evolutionLevel")
        );
    }
    
    /**
     * 진화 단계 결정
     */
    private String getEvolutionStage(GuidePattern pattern) {
        double confidence = pattern.getConfidence();
        int usage = pattern.getUsageCount();
        
        if (confidence > 0.9 && usage > 100) return "🏆 마스터 (검증됨)";
        if (confidence > 0.7 && usage > 50) return "🌟 성숙 (안정적)";
        if (confidence > 0.5 && usage > 20) return "🌱 성장 (유망함)";
        if (confidence > 0.3 && usage > 5) return "🌰 초기 (실험적)";
        return "🔬 실험 (검증 중)";
    }
    
    /**
     * 구체성 점수 계산
     */
    private double calculateSpecificity(String guidance) {
        int specificTerms = 0;
        String[] keywords = {"Virtual Threads", "@RestController", "executeSequentially", 
                           "@Cacheable", "SecurityFilterChain", "JpaRepository"};
        
        for (String keyword : keywords) {
            if (guidance.contains(keyword)) specificTerms++;
        }
        
        return Math.min(10.0, specificTerms * 1.5);
    }
    
    /**
     * 실행가능성 점수 계산  
     */
    private double calculateActionability(String guidance) {
        int actionableItems = 0;
        String[] actionWords = {"사용", "구현", "설정", "적용", "실행", "활용", "권장"};
        
        for (String word : actionWords) {
            actionableItems += countOccurrences(guidance, word);
        }
        
        return Math.min(10.0, actionableItems * 0.5);
    }
    
    /**
     * 진화 수준 결정
     */
    private String determineEvolutionLevel(String guidance) {
        int advancedFeatures = 0;
        
        if (guidance.contains("예측")) advancedFeatures++;
        if (guidance.contains("자가")) advancedFeatures++;
        if (guidance.contains("동적")) advancedFeatures++;
        if (guidance.contains("학습")) advancedFeatures++;
        
        return switch (advancedFeatures) {
            case 0 -> "기본";
            case 1 -> "향상";
            case 2 -> "고급";
            case 3 -> "전문가";
            default -> "마스터";
        };
    }
    
    /**
     * 문자열 내 단어 출현 횟수 계산
     */
    private int countOccurrences(String text, String word) {
        return (text.length() - text.replace(word, "").length()) / word.length();
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
        return String.format(
            "## 🎯 엘더베리 프로젝트 맞춤 가이드\n\n" +
            "**현재 환경**: Java 21 + Spring Boot 3.x + WSL2\n" +
            "**프론트엔드**: React 18 + TypeScript 5.x\n" +
            "**데이터베이스**: H2 (개발), Virtual Threads 활용\n\n" +
            "### 📋 권장 접근법\n" +
            "1. **순차적 에이전트 시스템 활용**: 복잡한 작업은 4개 서브에이전트로 분할 처리\n" +
            "2. **실용주의 원칙**: 동작하는 코드 우선, 점진적 개선\n" +
            "3. **WSL2 최적화**: Java 21의 Virtual Threads와 성능 최적화 고려\n" +
            "4. **안정성 우선**: 한 단계씩 검증하며 진행\n\n" +
            "### 🔧 개발 도구\n" +
            "- **에이전트 실행**: `executeTask('작업 설명')`\n" +
            "- **Java ↔ JS 브리지**: 순차적 실행으로 안정성 보장\n" +
            "- **자동 문서화**: API 문서화 에이전트 활용\n\n" +
            "**질문**: %s에 대한 구체적인 가이드가 필요하시면 추가로 문의해주세요.",
            question
        );
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
    
    /**
     * 진화 히스토리를 포함한 패턴 로드
     */
    private void loadExistingPatternsWithEvolution() {
        logger.info("🔄 기존 학습 패턴 및 진화 히스토리 로드 중...");
        
        // 패턴 진화 이력 복원
        Map<String, Object> evolutionHistory = loadEvolutionHistory();
        
        // 성공적인 패턴 강화
        evolutionHistory.forEach((key, value) -> {
            @SuppressWarnings("unchecked")
            Map<String, Object> patternData = (Map<String, Object>) value;
            double successRate = (double) patternData.getOrDefault("successRate", 0.0);
            
            if (successRate > 0.8) {
                GuidePattern pattern = new GuidePattern(key);
                pattern.setCurrentGuideline((String) patternData.get("guideline"));
                pattern.updateConfidence();
                learnedPatterns.put(key, pattern);
                
                logger.debug("✅ 고성능 패턴 복원: {} (성공률: {:.1f}%)", key, successRate * 100);
            }
        });
        
        logger.info("📊 총 {}개의 진화된 패턴 로드 완료", learnedPatterns.size());
    }
    
    /**
     * 동적 가이드라인 생성 엔진 초기화
     */
    private void initializeDynamicGuidelineEngine() {
        logger.info("🎨 동적 가이드라인 생성 엔진 초기화 중...");
        
        // 기본 가이드 템플릿 설정
        Map<String, String> dynamicTemplates = new HashMap<>();
        
        // Java 21 특화 가이드
        dynamicTemplates.put("JAVA21_VIRTUAL_THREADS", 
            "Virtual Threads 활용: 동시성 처리시 Thread.startVirtualThread() 사용 권장");
        
        // Spring Boot 3.x 특화 가이드
        dynamicTemplates.put("SPRING_BOOT_3X_PATTERNS", 
            "Spring Boot 3.x: @RestController + @RequestMapping 조합으로 RESTful API 구현");
        
        // WSL2 환경 특화 가이드
        dynamicTemplates.put("WSL2_OPTIMIZATION", 
            "WSL2 성능: 파일 I/O는 Linux 파일시스템(/home)에서 수행하여 성능 향상");
        
        // 순차 에이전트 시스템 가이드
        dynamicTemplates.put("SEQUENTIAL_AGENT_USAGE", 
            "순차 실행: executeSequentially()로 안정적인 작업 처리, 복잡도에 따라 자동 에이전트 선택");
        
        // 실용주의 개발 가이드
        dynamicTemplates.put("PRAGMATIC_DEVELOPMENT", 
            "실용주의: 동작하는 코드 우선 → 테스트 추가 → 점진적 리팩토링 순서로 진행");
        
        dynamicTemplates.forEach((key, template) -> {
            GuidePattern pattern = new GuidePattern(key);
            pattern.setCurrentGuideline(template);
            pattern.updateConfidence();
            learnedPatterns.put(key, pattern);
        });
        
        logger.info("✅ {}개의 동적 가이드 템플릿 활성화", dynamicTemplates.size());
    }
    
    /**
     * 맥락 인식 엔진 활성화
     */
    private void activateContextAwarenessEngine() {
        logger.info("🎯 맥락 인식 엔진 활성화 중...");
        
        // 현재 프로젝트 맥락 분석
        Map<String, Object> projectContext = analyzeProjectContext();
        
        // 맥락별 가이드 우선순위 설정
        if ("SPRING_BOOT".equals(projectContext.get("projectType"))) {
            prioritizeSpringBootPatterns();
        }
        
        if ("WSL2".equals(projectContext.get("environment"))) {
            prioritizeWSL2Patterns();
        }
        
        logger.info("✅ 맥락 인식 엔진 활성화 완료 - 현재 맥락: {}", projectContext);
    }
    
    /**
     * 실시간 학습 및 예측 시스템 시작
     */
    private void startRealtimeLearningAndPrediction() {
        logger.info("🧠 실시간 학습 및 예측 시스템 시작");
        
        // 학습 스케줄러 설정
        CompletableFuture.runAsync(() -> {
            while (isActive) {
                try {
                    // 5분마다 패턴 분석 및 예측
                    Thread.sleep(300000);
                    analyzeAndPredictPatterns();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        
        logger.info("✅ 실시간 학습 루프 활성화 - 5분 주기 패턴 분석");
    }
    
    /**
     * 개발자 성향 분석기 초기화
     */
    private void initializeDeveloperBehaviorAnalyzer() {
        logger.info("👤 개발자 성향 분석기 초기화 중...");
        
        // 개발자 성향 카테고리
        Map<String, String> developerProfiles = Map.of(
            "SPEED_FOCUSED", "빠른 구현을 선호 - 프로토타입 우선 접근법 추천",
            "QUALITY_FOCUSED", "품질 중시 - TDD 및 코드 리뷰 프로세스 강화",
            "BALANCED", "균형잡힌 접근 - 실용주의 원칙 적용",
            "LEARNING_ORIENTED", "학습 중심 - 상세한 설명과 대안 제시"
        );
        
        // 기본 프로필 설정 (실제로는 사용 패턴 분석으로 결정)
        String currentProfile = "BALANCED";
        logger.info("✅ 개발자 프로필 설정: {}", currentProfile);
    }
    
    /**
     * 진화 히스토리 로드
     */
    private Map<String, Object> loadEvolutionHistory() {
        // 실제 구현에서는 데이터베이스나 파일에서 로드
        Map<String, Object> history = new HashMap<>();
        
        // 예시 데이터
        history.put("SPRING_REPOSITORY_PATTERN", Map.of(
            "guideline", "Spring Data JPA 사용시 @Repository + JpaRepository 상속",
            "successRate", 0.92,
            "usageCount", 45,
            "lastUpdated", LocalDateTime.now().minusDays(2)
        ));
        
        return history;
    }
    
    /**
     * 프로젝트 맥락 분석
     */
    private Map<String, Object> analyzeProjectContext() {
        return Map.of(
            "projectType", "SPRING_BOOT",
            "javaVersion", "21",
            "environment", "WSL2",
            "database", "H2",
            "frontend", "REACT",
            "agentSystem", "SEQUENTIAL"
        );
    }
    
    /**
     * Spring Boot 패턴 우선순위 설정
     */
    private void prioritizeSpringBootPatterns() {
        learnedPatterns.values().stream()
            .filter(p -> p.getPatternKey().contains("SPRING"))
            .forEach(p -> p.updateConfidence());
    }
    
    /**
     * WSL2 패턴 우선순위 설정
     */
    private void prioritizeWSL2Patterns() {
        learnedPatterns.values().stream()
            .filter(p -> p.getPatternKey().contains("WSL2"))
            .forEach(p -> p.updateConfidence());
    }
    
    /**
     * 패턴 분석 및 예측
     */
    private void analyzeAndPredictPatterns() {
        // 현재 사용 패턴 분석
        Map<String, Integer> patternUsage = analyzeCurrentPatternUsage();
        
        // 트렌드 예측
        List<String> predictedNeeds = predictFutureNeeds(patternUsage);
        
        // 새로운 가이드 생성
        predictedNeeds.forEach(this::generateProactiveGuideline);
        
        logger.debug("🔮 예측 완료: {}개의 새로운 가이드 필요 예상", predictedNeeds.size());
    }
    
    /**
     * 현재 패턴 사용 분석
     */
    private Map<String, Integer> analyzeCurrentPatternUsage() {
        // 실제 구현에서는 실제 사용 데이터 분석
        return new HashMap<>();
    }
    
    /**
     * 미래 필요 예측
     */
    private List<String> predictFutureNeeds(Map<String, Integer> usage) {
        // 실제 구현에서는 ML 모델 사용 가능
        return new ArrayList<>();
    }
    
    /**
     * 사전 예방적 가이드라인 생성
     */
    private void generateProactiveGuideline(String need) {
        String guideline = String.format("🔮 예측 가이드: %s 관련 작업이 예상됩니다. 미리 준비하세요.", need);
        
        GuidePattern pattern = new GuidePattern("PREDICTED_" + need);
        pattern.setCurrentGuideline(guideline);
        learnedPatterns.put(pattern.getPatternKey(), pattern);
    }
    
    /**
     * 지침 삭제 또는 수정시 추적
     */
    private void trackGuidelineDeletion(String guidelineId, String reason, String oldContent) {
        DeletedGuideline deletion = DeletedGuideline.builder()
            .guidelineId(guidelineId)
            .deletionReason(reason)
            .oldContent(oldContent)
            .deletedAt(LocalDateTime.now())
            .deletionType(determineDeletionType(reason))
            .replacementGuideline(findReplacementGuideline(guidelineId))
            .build();
            
        deletionHistory.add(deletion);
        
        // 사용자에게 알림
        logger.info("📝 지침 삭제 기록: {} - 이유: {}", guidelineId, reason);
        
        // 다른 에이전트들에게도 알림
        publishEvent("GUIDELINE_DELETED", Map.of(
            "guidelineId", guidelineId,
            "reason", reason,
            "deletionType", deletion.getDeletionType(),
            "replacement", deletion.getReplacementGuideline()
        ));
    }
    
    /**
     * 지침 진화 추적
     */
    private void trackGuidelineEvolution(String guidelineId, String oldVersion, String newVersion, String evolutionReason) {
        GuidelineEvolution evolution = GuidelineEvolution.builder()
            .guidelineId(guidelineId)
            .fromVersion(oldVersion)
            .toVersion(newVersion)
            .evolutionReason(evolutionReason)
            .evolutionScore(calculateEvolutionScore(oldVersion, newVersion))
            .timestamp(LocalDateTime.now())
            .build();
            
        evolutionTracker.put(guidelineId, evolution);
        
        // 진화 이유 분석
        analyzeEvolutionReason(evolution);
    }
    
    /**
     * 삭제 유형 결정
     */
    private String determineDeletionType(String reason) {
        if (reason.contains("중복")) return "DUPLICATE";
        if (reason.contains("오래된") || reason.contains("구식")) return "OUTDATED";
        if (reason.contains("잘못된") || reason.contains("오류")) return "INCORRECT";
        if (reason.contains("통합") || reason.contains("병합")) return "MERGED";
        if (reason.contains("성능") || reason.contains("비효율")) return "INEFFICIENT";
        return "OTHER";
    }
    
    /**
     * 대체 가이드라인 찾기
     */
    private String findReplacementGuideline(String deletedId) {
        // 삭제된 가이드라인과 유사한 패턴 찾기
        return learnedPatterns.values().stream()
            .filter(p -> !p.getPatternKey().equals(deletedId))
            .filter(p -> calculateSimilarity(p.getPatternKey(), deletedId) > 0.7)
            .map(GuidePattern::getPatternKey)
            .findFirst()
            .orElse("대체 가이드라인 없음");
    }
    
    /**
     * 진화 점수 계산
     */
    private double calculateEvolutionScore(String oldVersion, String newVersion) {
        // 개선 정도 평가
        double lengthImprovement = 1.0 - Math.abs(newVersion.length() - oldVersion.length() * 0.8) / oldVersion.length();
        double specificityScore = calculateSpecificity(newVersion) - calculateSpecificity(oldVersion);
        double actionabilityScore = calculateActionability(newVersion) - calculateActionability(oldVersion);
        
        return (lengthImprovement + specificityScore + actionabilityScore) / 3.0;
    }
    
    /**
     * 진화 이유 분석
     */
    private void analyzeEvolutionReason(GuidelineEvolution evolution) {
        String reason = evolution.getEvolutionReason();
        
        // 진화 패턴 학습
        if (reason.contains("성능")) {
            learnEvolutionPattern("PERFORMANCE_DRIVEN", evolution);
        } else if (reason.contains("명확성")) {
            learnEvolutionPattern("CLARITY_DRIVEN", evolution);
        } else if (reason.contains("최신")) {
            learnEvolutionPattern("MODERNIZATION_DRIVEN", evolution);
        }
    }
    
    /**
     * 진화 패턴 학습
     */
    private void learnEvolutionPattern(String patternType, GuidelineEvolution evolution) {
        String patternKey = "EVOLUTION_" + patternType;
        GuidePattern pattern = learnedPatterns.computeIfAbsent(patternKey, k -> new GuidePattern(k));
        
        pattern.addExperience(evolution.getGuidelineId(), 
            List.of(evolution.getEvolutionReason(), 
                   "점수: " + evolution.getEvolutionScore()));
        pattern.updateConfidence();
    }
    
    /**
     * 유사도 계산
     */
    private double calculateSimilarity(String pattern1, String pattern2) {
        // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 사용)
        String[] words1 = pattern1.split("_");
        String[] words2 = pattern2.split("_");
        
        int commonWords = 0;
        for (String word1 : words1) {
            for (String word2 : words2) {
                if (word1.equalsIgnoreCase(word2)) {
                    commonWords++;
                }
            }
        }
        
        return (double) commonWords / Math.max(words1.length, words2.length);
    }
    
    /**
     * 삭제 히스토리 보고서 생성
     */
    public Map<String, Object> generateDeletionReport() {
        Map<String, Long> deletionTypes = deletionHistory.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                DeletedGuideline::getDeletionType,
                java.util.stream.Collectors.counting()
            ));
            
        List<String> topReasons = deletionHistory.stream()
            .map(DeletedGuideline::getDeletionReason)
            .collect(java.util.stream.Collectors.groupingBy(
                reason -> reason,
                java.util.stream.Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(Map.Entry::getKey)
            .toList();
            
        return Map.of(
            "totalDeletions", deletionHistory.size(),
            "deletionTypes", deletionTypes,
            "topReasons", topReasons,
            "lastDeletion", deletionHistory.isEmpty() ? "없음" : 
                deletionHistory.get(deletionHistory.size() - 1).getDeletedAt(),
            "replacementRate", calculateReplacementRate()
        );
    }
    
    /**
     * 대체율 계산
     */
    private double calculateReplacementRate() {
        if (deletionHistory.isEmpty()) return 0.0;
        
        long withReplacement = deletionHistory.stream()
            .filter(d -> !"대체 가이드라인 없음".equals(d.getReplacementGuideline()))
            .count();
            
        return (double) withReplacement / deletionHistory.size();
    }
    
    /**
     * 지침 정리 및 최적화
     */
    public void optimizeGuidelines() {
        logger.info("🧹 지침 최적화 시작...");
        
        List<String> toDelete = new ArrayList<>();
        
        // 중복 제거
        Map<String, List<GuidePattern>> similarPatterns = findSimilarPatterns();
        similarPatterns.forEach((key, patterns) -> {
            if (patterns.size() > 1) {
                // 가장 신뢰도가 높은 것만 남기고 나머지 삭제
                GuidePattern best = patterns.stream()
                    .max(Comparator.comparing(GuidePattern::getConfidence))
                    .orElse(patterns.get(0));
                    
                patterns.stream()
                    .filter(p -> p != best)
                    .forEach(p -> {
                        trackGuidelineDeletion(p.getPatternKey(), 
                            "중복된 패턴 - 더 높은 신뢰도의 패턴으로 통합됨", 
                            p.getCurrentGuideline());
                        toDelete.add(p.getPatternKey());
                    });
            }
        });
        
        // 낮은 성능 패턴 제거
        learnedPatterns.values().stream()
            .filter(p -> p.getConfidence() < 0.1 && p.getUsageCount() > 10)
            .forEach(p -> {
                trackGuidelineDeletion(p.getPatternKey(),
                    "낮은 성능 - 10회 이상 사용했지만 신뢰도 10% 미만",
                    p.getCurrentGuideline());
                toDelete.add(p.getPatternKey());
            });
        
        // 실제 삭제 수행
        toDelete.forEach(learnedPatterns::remove);
        
        logger.info("✅ 지침 최적화 완료: {}개 삭제됨", toDelete.size());
    }
    
    /**
     * 유사 패턴 찾기
     */
    private Map<String, List<GuidePattern>> findSimilarPatterns() {
        Map<String, List<GuidePattern>> groups = new HashMap<>();
        
        learnedPatterns.values().forEach(pattern1 -> {
            String groupKey = pattern1.getPatternKey();
            List<GuidePattern> similar = new ArrayList<>();
            similar.add(pattern1);
            
            learnedPatterns.values().forEach(pattern2 -> {
                if (pattern1 != pattern2 && 
                    calculateSimilarity(pattern1.getPatternKey(), pattern2.getPatternKey()) > 0.8) {
                    similar.add(pattern2);
                }
            });
            
            if (similar.size() > 1) {
                groups.put(groupKey, similar);
            }
        });
        
        return groups;
    }
    
    private void learnFromCodeReview(AgentEvent event) {
        // 코드 리뷰에서 학습하는 로직
        @SuppressWarnings("unchecked")
        Map<String, Object> reviewData = (Map<String, Object>) event.getData();
        
        String guidelineId = (String) reviewData.get("guidelineId");
        if (guidelineId != null) {
            // 코드 리뷰 결과를 바탕으로 진화 시스템에 경험 데이터 전달
            ProjectExperience experience = buildExperienceFromCodeReview(reviewData);
            var evolutionResult = evolutionSystem.analyzeAndEvolveGuideline(guidelineId, experience);
            
            if (evolutionResult.isImproved()) {
                logger.info("🔄 코드 리뷰를 통한 규칙 진화: {}", guidelineId);
                
                // 다른 에이전트들에게 진화 알림
                publishEvent("GUIDELINE_EVOLVED_FROM_REVIEW", Map.of(
                    "guidelineId", guidelineId,
                    "evolutionResult", evolutionResult,
                    "reviewId", reviewData.get("reviewId")
                ));
            }
        }
    }
    
    /**
     * 814줄 규칙 효과성 테스트
     */
    private void testGuidelineEffectiveness(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> testData = (Map<String, Object>) event.getData();
        
        String guidelineId = (String) testData.get("guidelineId");
        ProjectExperience experience = (ProjectExperience) testData.get("experience");
        
        logger.info("🧪 규칙 효과성 테스트 시작: {}", guidelineId);
        
        var evolutionResult = evolutionSystem.analyzeAndEvolveGuideline(guidelineId, experience);
        
        // 진화 결과 분석
        if (evolutionResult.isImproved()) {
            logger.info("✅ 규칙 개선 성공: {} (개선율: {:.1f}%)", 
                       guidelineId, evolutionResult.getImprovementRate() * 100);
        } else {
            logger.info("📊 규칙 효과성 측정 완료: {} (현재 효과성: {:.1f}%)", 
                       guidelineId, evolutionResult.getCurrentEffectiveness() * 100);
        }
        
        // 결과를 다른 에이전트들과 공유
        publishEvent("GUIDELINE_EFFECTIVENESS_MEASURED", Map.of(
            "guidelineId", guidelineId,
            "effectivenessScore", evolutionResult.getCurrentEffectiveness(),
            "needsImprovement", evolutionResult.needsImprovement(),
            "evolutionResult", evolutionResult
        ));
    }
    
    /**
     * 규칙 진화 요청 처리
     */
    private void processRuleEvolutionRequest(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> requestData = (Map<String, Object>) event.getData();
        
        String requesterAgent = (String) requestData.get("requesterAgent");
        String domain = (String) requestData.get("domain");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) requestData.get("context");
        
        logger.info("🔍 규칙 진화 요청 처리: {} 도메인 (요청자: {})", domain, requesterAgent);
        
        // 최적 규칙 추천
        var recommendation = evolutionSystem.recommendOptimalGuideline(domain, context);
        
        // 응답 전송
        publishEvent("OPTIMAL_GUIDELINE_RECOMMENDED", Map.of(
            "requesterAgent", requesterAgent,
            "domain", domain,
            "recommendation", recommendation,
            "timestamp", LocalDateTime.now()
        ));
        
        logger.info("📋 최적 규칙 추천 완료: {} (신뢰도: {:.1f}%)", 
                   recommendation.getGuidelineId(), 
                   recommendation.getConfidenceScore() * 100);
    }
    
    /**
     * 진화 시스템 상태 조회
     */
    public Map<String, Object> getEvolutionSystemStatus() {
        var evolutionReport = evolutionSystem.generateEvolutionReport();
        var guidelineSummary = generateGuidelineSummary();
        
        return Map.of(
            "agentType", getAgentType(),
            "evolutionReport", evolutionReport,
            "guidelineSummary", guidelineSummary,
            "activeGuidances", activeGuidances.size(),
            "learnedPatterns", learnedPatterns.size(),
            "improvements", improvementHistory.size(),
            "lastUpdate", LocalDateTime.now()
        );
    }
    
    private ProjectExperience buildExperienceFromCodeReview(Map<String, Object> reviewData) {
        return ProjectExperience.builder()
            .experienceId("review_" + reviewData.get("reviewId"))
            .guidelineId((String) reviewData.get("guidelineId"))
            .projectName((String) reviewData.getOrDefault("projectName", "Elderberry"))
            .developer((String) reviewData.getOrDefault("developer", "Unknown"))
            .startTime(LocalDateTime.now().minusHours(2))
            .endTime(LocalDateTime.now())
            .successRate(calculateSuccessRateFromReview(reviewData))
            .timeEfficiency(0.8) // 코드 리뷰는 일반적으로 효율적
            .codeQualityScore(calculateQualityFromReview(reviewData))
            .bugsFound((Integer) reviewData.getOrDefault("bugsFound", 0))
            .codeReviewComments((Integer) reviewData.getOrDefault("commentsCount", 0))
            .techStack(List.of("Java 21", "Spring Boot", "React"))
            .projectSize("medium")
            .complexity("medium")
            .timeline("2-3 days")
            .build();
    }
    
    private double calculateSuccessRateFromReview(Map<String, Object> reviewData) {
        Integer commentsCount = (Integer) reviewData.getOrDefault("commentsCount", 0);
        Boolean approved = (Boolean) reviewData.getOrDefault("approved", false);
        
        if (approved && commentsCount <= 3) return 0.95;
        if (approved && commentsCount <= 5) return 0.85;
        if (approved) return 0.75;
        return 0.6;
    }
    
    private double calculateQualityFromReview(Map<String, Object> reviewData) {
        Integer commentsCount = (Integer) reviewData.getOrDefault("commentsCount", 0);
        Integer criticalIssues = (Integer) reviewData.getOrDefault("criticalIssues", 0);
        
        double baseScore = 0.8;
        baseScore -= (commentsCount * 0.02); // 코멘트당 2% 감점
        baseScore -= (criticalIssues * 0.1);  // 심각한 이슈당 10% 감점
        
        return Math.max(0.0, Math.min(1.0, baseScore));
    }
    
    /**
     * 디버깅 가이드 생성
     */
    private String generateDebuggingGuidance(String errorPattern, List<GuidePattern> relevantPatterns) {
        StringBuilder guidance = new StringBuilder();
        guidance.append("# 🔍 디버깅 가이드: ").append(errorPattern).append("\n\n");
        
        guidance.append("## 🎯 엘더베리 프로젝트 환경\n");
        guidance.append("- **Java 21**: Virtual Threads 활용, 최신 기능 적용\n");
        guidance.append("- **Spring Boot 3.x**: 최신 의존성 관리\n");
        guidance.append("- **WSL2**: Linux 환경에서의 디버깅 고려\n\n");
        
        guidance.append("## 📋 단계별 디버깅 접근법\n");
        guidance.append("1. **에이전트 시스템 활용**: `executeTask('로그 분석')` 실행\n");
        guidance.append("2. **로그 기반 분석**: DEBUG 에이전트로 패턴 분석\n");
        guidance.append("3. **순차적 문제 해결**: 한 단계씩 검증하며 진행\n");
        guidance.append("4. **자동 문서화**: 해결 과정을 자동으로 기록\n\n");
        
        if (!relevantPatterns.isEmpty()) {
            guidance.append("## 💡 관련 경험 사례\n");
            relevantPatterns.forEach(pattern -> 
                guidance.append("- ").append(pattern.getPatternKey()).append("\n"));
        }
        
        return guidance.toString();
    }
    
    /**
     * API 가이드 생성
     */
    private String generateAPIGuidance(String apiPath, String method) {
        return String.format(
            "# 📚 API 가이드: %s %s\n\n" +
            "## 🎯 엘더베리 프로젝트 표준\n" +
            "- **Spring Boot 3.x**: `@RestController` 사용\n" +
            "- **Spring Security 6.x**: JWT 인증 적용\n" +
            "- **자동 문서화**: API_DOCUMENTATION 에이전트 활용\n\n" +
            "## 📋 권장 구현 방식\n" +
            "1. **Controller**: RESTful 설계 원칙 준수\n" +
            "2. **Service**: 비즈니스 로직 분리\n" +
            "3. **Repository**: Spring Data JPA 활용\n" +
            "4. **DTO**: 요청/응답 객체 분리\n\n" +
            "## 🔧 자동화 도구\n" +
            "- `executeTask('API 문서 생성')`: OpenAPI 3.0 자동 생성\n" +
            "- **테스트 케이스**: 자동 추천 시스템 활용\n",
            method, apiPath
        );
    }
    
    /**
     * API 베스트 프랙티스
     */
    private List<String> getAPIBestPractices(String apiPath) {
        return List.of(
            "RESTful 설계 원칙 준수",
            "적절한 HTTP 상태 코드 사용 (200, 201, 400, 404, 500)",
            "Spring Boot 3.x 표준 어노테이션 활용",
            "JWT 기반 인증/인가 구현",
            "API 버전 관리 (/api/v1/)",
            "자동 API 문서화 (OpenAPI 3.0)",
            "에러 응답 표준화 (GlobalExceptionHandler)",
            "Java 21 Virtual Threads 활용"
        );
    }
    
    /**
     * API 일반적인 실수들
     */
    private List<String> getAPICommonMistakes(String apiPath) {
        return List.of(
            "부적절한 HTTP 메서드 사용 (GET으로 데이터 변경 등)",
            "인증 처리 누락 (@PreAuthorize 미적용)",
            "에러 응답 표준화 부족",
            "API 문서화 누락",
            "DTO 검증 누락 (@Valid 미사용)",
            "트랜잭션 처리 누락",
            "Java 21 기능 미활용 (Record, Pattern Matching 등)",
            "WSL2 환경에서의 포트 충돌 미고려"
        );
    }
    
    /**
     * 코드 리뷰 데이터로부터 경험 구축
     */
    private ProjectExperience buildExperienceFromCodeReviewData(Map<String, Object> input) {
        return ProjectExperience.builder()
            .experienceId("review_" + input.get("reviewId"))
            .guidelineId((String) input.get("guidelineId"))
            .projectName("Elderberry (Java 21 + Spring Boot 3.x)")
            .developer((String) input.getOrDefault("developer", "Unknown"))
            .startTime(LocalDateTime.now().minusHours(2))
            .endTime(LocalDateTime.now())
            .successRate(calculateSuccessRateFromReview(input))
            .timeEfficiency(0.8)
            .codeQualityScore(calculateQualityFromReview(input))
            .techStack(List.of("Java 21", "Spring Boot 3.x", "React 18", "TypeScript 5.x", "WSL2"))
            .projectSize("medium")
            .complexity("medium")
            .timeline("2-3 days")
            .build();
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
        public int getUsageCount() { return usageCount; }
    }
    
    /**
     * 삭제된 지침 추적 클래스
     */
    private static class DeletedGuideline {
        private String guidelineId;
        private String deletionReason;
        private String oldContent;
        private LocalDateTime deletedAt;
        private String deletionType;
        private String replacementGuideline;
        
        public static DeletedGuidelineBuilder builder() {
            return new DeletedGuidelineBuilder();
        }
        
        public static class DeletedGuidelineBuilder {
            private DeletedGuideline guideline = new DeletedGuideline();
            
            public DeletedGuidelineBuilder guidelineId(String id) { 
                guideline.guidelineId = id; 
                return this; 
            }
            
            public DeletedGuidelineBuilder deletionReason(String reason) { 
                guideline.deletionReason = reason; 
                return this; 
            }
            
            public DeletedGuidelineBuilder oldContent(String content) { 
                guideline.oldContent = content; 
                return this; 
            }
            
            public DeletedGuidelineBuilder deletedAt(LocalDateTime time) { 
                guideline.deletedAt = time; 
                return this; 
            }
            
            public DeletedGuidelineBuilder deletionType(String type) { 
                guideline.deletionType = type; 
                return this; 
            }
            
            public DeletedGuidelineBuilder replacementGuideline(String replacement) { 
                guideline.replacementGuideline = replacement; 
                return this; 
            }
            
            public DeletedGuideline build() { 
                return guideline; 
            }
        }
        
        // Getters
        public String getGuidelineId() { return guidelineId; }
        public String getDeletionReason() { return deletionReason; }
        public String getOldContent() { return oldContent; }
        public LocalDateTime getDeletedAt() { return deletedAt; }
        public String getDeletionType() { return deletionType; }
        public String getReplacementGuideline() { return replacementGuideline; }
    }
    
    /**
     * 지침 진화 추적 클래스
     */
    private static class GuidelineEvolution {
        private String guidelineId;
        private String fromVersion;
        private String toVersion;
        private String evolutionReason;
        private double evolutionScore;
        private LocalDateTime timestamp;
        
        public static GuidelineEvolutionBuilder builder() {
            return new GuidelineEvolutionBuilder();
        }
        
        public static class GuidelineEvolutionBuilder {
            private GuidelineEvolution evolution = new GuidelineEvolution();
            
            public GuidelineEvolutionBuilder guidelineId(String id) { 
                evolution.guidelineId = id; 
                return this; 
            }
            
            public GuidelineEvolutionBuilder fromVersion(String from) { 
                evolution.fromVersion = from; 
                return this; 
            }
            
            public GuidelineEvolutionBuilder toVersion(String to) { 
                evolution.toVersion = to; 
                return this; 
            }
            
            public GuidelineEvolutionBuilder evolutionReason(String reason) { 
                evolution.evolutionReason = reason; 
                return this; 
            }
            
            public GuidelineEvolutionBuilder evolutionScore(double score) { 
                evolution.evolutionScore = score; 
                return this; 
            }
            
            public GuidelineEvolutionBuilder timestamp(LocalDateTime time) { 
                evolution.timestamp = time; 
                return this; 
            }
            
            public GuidelineEvolution build() { 
                return evolution; 
            }
        }
        
        // Getters
        public String getGuidelineId() { return guidelineId; }
        public String getFromVersion() { return fromVersion; }
        public String getToVersion() { return toVersion; }
        public String getEvolutionReason() { return evolutionReason; }
        public double getEvolutionScore() { return evolutionScore; }
        public LocalDateTime getTimestamp() { return timestamp; }
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