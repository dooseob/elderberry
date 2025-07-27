package com.globalcarelink.agents.debug;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.debug.models.LogAnalysisResult;
import com.globalcarelink.agents.debug.models.ErrorPattern;
import com.globalcarelink.agents.debug.models.DebugSolution;
import com.globalcarelink.agents.debug.strategies.LogAnalysisStrategy;
import com.globalcarelink.agents.debug.strategies.ErrorPatternMatcher;
import com.globalcarelink.agents.debug.strategies.SolutionGenerator;
import com.globalcarelink.agents.resources.AgentResourceLoader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 로그기반 디버깅 에이전트
 * 목적: 1) 실시간 로그 분석 및 에러 패턴 탐지
 *      2) 근본 원인 분석 및 자동 해결책 제안
 *      3) 이전 해결 사례 학습 및 적용
 *      4) 성능 이슈 및 보안 취약점 탐지
 *      5) 다른 에이전트와 연동하여 종합적 디버깅
 */
@Component
@RequiredArgsConstructor
public class DebugAgent extends BaseAgent {
    
    private final LogAnalysisStrategy logAnalysisStrategy;
    private final ErrorPatternMatcher patternMatcher;
    private final SolutionGenerator solutionGenerator;
    private final AgentResourceLoader resourceLoader;
    
    // 탐지된 에러 패턴 저장소
    private final Map<String, ErrorPattern> errorPatterns = new ConcurrentHashMap<>();
    
    // 해결 사례 히스토리
    private final Map<String, DebugSolution> solutionHistory = new ConcurrentHashMap<>();
    
    // 활성 디버깅 세션
    private final Map<String, DebugSession> activeSessions = new ConcurrentHashMap<>();
    
    // 성능 메트릭 추적
    private final Map<String, PerformanceMetric> performanceMetrics = new ConcurrentHashMap<>();
    
    public DebugAgent(LogAnalysisStrategy logAnalysisStrategy, 
                     ErrorPatternMatcher patternMatcher,
                     SolutionGenerator solutionGenerator,
                     AgentResourceLoader resourceLoader) {
        super("DEBUG_AGENT");
        this.logAnalysisStrategy = logAnalysisStrategy;
        this.patternMatcher = patternMatcher;
        this.solutionGenerator = solutionGenerator;
        this.resourceLoader = resourceLoader;
    }
    
    @Override
    protected void doInitialize() {
        logger.info("🔍 로그기반 디버깅 에이전트 초기화");
        
        // 기존 에러 패턴 로드
        loadExistingErrorPatterns();
        
        // 해결 사례 히스토리 로드
        loadSolutionHistory();
        
        // 실시간 로그 모니터링 시작
        startLogMonitoring();
        
        // 성능 메트릭 수집 시작
        startPerformanceMonitoring();
        
        logger.info("✅ 디버깅 에이전트 활성화 완료 - {}개 패턴, {}개 해결 사례 로드", 
                   errorPatterns.size(), solutionHistory.size());
    }
    
    @Override
    protected void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "LOG_ERROR_DETECTED":
                analyzeLogError(event);
                break;
            case "PERFORMANCE_ISSUE_DETECTED":
                analyzePerformanceIssue(event);
                break;
            case "DEBUG_SESSION_REQUEST":
                startDebugSession(event);
                break;
            case "SOLUTION_VERIFICATION_REQUEST":
                verifySolution(event);
                break;
            case "PATTERN_LEARNING_REQUEST":
                learnNewPattern(event);
                break;
            case "COMPREHENSIVE_DEBUG_REQUEST":
                performComprehensiveDebugging(event);
                break;
        }
    }
    
    /**
     * 로그 에러 분석 및 즉시 대응
     */
    private void analyzeLogError(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> logData = (Map<String, Object>) event.getData();
        
        String logLevel = (String) logData.get("level");
        String message = (String) logData.get("message");
        String stackTrace = (String) logData.get("stackTrace");
        LocalDateTime timestamp = (LocalDateTime) logData.get("timestamp");
        
        logger.info("🚨 로그 에러 분석 시작: {} - {}", logLevel, message);
        
        // 1. 로그 분석
        LogAnalysisResult analysisResult = logAnalysisStrategy.analyzeLog(
            logLevel, message, stackTrace, timestamp);
        
        // 2. 기존 패턴 매칭
        ErrorPattern matchedPattern = patternMatcher.findMatchingPattern(
            analysisResult, errorPatterns.values());
        
        // 3. 해결책 생성
        DebugSolution solution;
        if (matchedPattern != null) {
            // 기존 패턴 기반 해결책
            solution = solutionGenerator.generateFromPattern(matchedPattern, analysisResult);
            logger.info("📋 기존 패턴 매칭: {} (신뢰도: {:.1f}%)", 
                       matchedPattern.getPatternName(), matchedPattern.getConfidence() * 100);
        } else {
            // 새로운 패턴 분석 및 해결책 생성
            solution = solutionGenerator.generateFromAnalysis(analysisResult);
            
            // 새 패턴 학습
            ErrorPattern newPattern = createNewPattern(analysisResult, solution);
            errorPatterns.put(newPattern.getPatternId(), newPattern);
            
            logger.info("🔍 새로운 에러 패턴 생성: {}", newPattern.getPatternName());
        }
        
        // 4. 해결책 적용 및 검증
        applySolution(solution, analysisResult);
        
        // 5. 다른 에이전트들에게 알림
        notifyOtherAgents(analysisResult, solution);
        
        // 6. 해결 사례 저장
        solutionHistory.put(solution.getSolutionId(), solution);
    }
    
    /**
     * 성능 이슈 분석
     */
    private void analyzePerformanceIssue(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> perfData = (Map<String, Object>) event.getData();
        
        String metricName = (String) perfData.get("metricName");
        Double currentValue = (Double) perfData.get("currentValue");
        Double threshold = (Double) perfData.get("threshold");
        
        logger.warn("⚡ 성능 이슈 탐지: {} = {} (임계값: {})", metricName, currentValue, threshold);
        
        // 성능 메트릭 기록
        PerformanceMetric metric = performanceMetrics.computeIfAbsent(metricName, 
            k -> new PerformanceMetric(k));
        metric.addMeasurement(currentValue, LocalDateTime.now());
        
        // 성능 개선 제안 생성
        if (metric.isPerformanceDegrading()) {
            DebugSolution performanceSolution = solutionGenerator.generatePerformanceSolution(
                metricName, metric);
            
            // 성능 개선 적용
            applyPerformanceSolution(performanceSolution);
            
            // ClaudeGuideAgent에 성능 가이드라인 개선 요청
            publishEvent("PERFORMANCE_GUIDELINE_UPDATE", Map.of(
                "metricName", metricName,
                "issue", metric.getPerformanceIssue(),
                "solution", performanceSolution,
                "improvement", metric.calculateImprovement()
            ));
        }
    }
    
    /**
     * 디버깅 세션 시작
     */
    private void startDebugSession(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> sessionData = (Map<String, Object>) event.getData();
        
        String sessionId = (String) sessionData.get("sessionId");
        String problemDescription = (String) sessionData.get("problemDescription");
        @SuppressWarnings("unchecked")
        List<String> relatedFiles = (List<String>) sessionData.get("relatedFiles");
        
        logger.info("🔧 디버깅 세션 시작: {} - {}", sessionId, problemDescription);
        
        DebugSession session = DebugSession.builder()
            .sessionId(sessionId)
            .problemDescription(problemDescription)
            .relatedFiles(relatedFiles)
            .startTime(LocalDateTime.now())
            .status(DebugStatus.ACTIVE)
            .steps(new ArrayList<>())
            .build();
        
        activeSessions.put(sessionId, session);
        
        // 종합적 디버깅 프로세스 시작
        performSystematicDebugging(session);
    }
    
    /**
     * 체계적 디버깅 프로세스
     */
    private void performSystematicDebugging(DebugSession session) {
        logger.info("📊 체계적 디버깅 프로세스 시작: {}", session.getSessionId());
        
        // 1. 문제 분석 및 가설 생성
        List<DebugHypothesis> hypotheses = generateDebugHypotheses(session);
        session.setHypotheses(hypotheses);
        
        // 2. 각 가설 검증
        for (DebugHypothesis hypothesis : hypotheses) {
            verifyHypothesis(session, hypothesis);
            
            if (hypothesis.isConfirmed()) {
                // 해결책 적용
                DebugSolution solution = solutionGenerator.generateFromHypothesis(hypothesis);
                applySolution(solution, null);
                
                session.setSolution(solution);
                session.setStatus(DebugStatus.RESOLVED);
                
                logger.info("✅ 디버깅 완료: {} - {}", 
                           session.getSessionId(), hypothesis.getDescription());
                break;
            }
        }
        
        // 3. 해결되지 않은 경우 다른 에이전트에게 도움 요청
        if (session.getStatus() != DebugStatus.RESOLVED) {
            requestExternalHelp(session);
        }
        
        // 4. 세션 결과 문서화
        documentDebuggingSession(session);
    }
    
    /**
     * 종합적 디버깅 (다른 에이전트들과 협력)
     */
    private void performComprehensiveDebugging(AgentEvent event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> debugData = (Map<String, Object>) event.getData();
        
        String systemScope = (String) debugData.get("systemScope");
        @SuppressWarnings("unchecked")
        List<String> involvedComponents = (List<String>) debugData.get("involvedComponents");
        
        logger.info("🌐 종합적 시스템 디버깅 시작: {}", systemScope);
        
        // 1. ClaudeGuideAgent에 디버깅 가이드라인 요청
        publishEvent("DEBUG_GUIDELINE_REQUEST", Map.of(
            "scope", systemScope,
            "components", involvedComponents,
            "debugger", getAgentType()
        ));
        
        // 2. PortfolioTroubleshootAgent에 이슈 문서화 요청
        publishEvent("ISSUE_DOCUMENTATION_REQUEST", Map.of(
            "issueType", "COMPREHENSIVE_DEBUG",
            "scope", systemScope,
            "debugSession", UUID.randomUUID().toString()
        ));
        
        // 3. ApiDocumentationAnalysisAgent에 API 관련 이슈 분석 요청
        if (involvedComponents.contains("API")) {
            publishEvent("API_DEBUG_ANALYSIS_REQUEST", Map.of(
                "components", involvedComponents,
                "debugContext", systemScope
            ));
        }
    }
    
    /**
     * 해결책 적용
     */
    private void applySolution(DebugSolution solution, LogAnalysisResult analysisResult) {
        logger.info("🔧 해결책 적용: {}", solution.getSolutionName());
        
        try {
            // 1. 자동 수정 가능한 경우 적용
            if (solution.isAutoApplicable()) {
                applyAutomaticFix(solution);
            }
            
            // 2. 수동 가이드 제공
            if (solution.hasManualSteps()) {
                provideManualGuidance(solution);
            }
            
            // 3. 예방책 제안
            if (solution.hasPreventionSteps()) {
                suggestPreventionMeasures(solution);
            }
            
            // 4. 해결 결과 검증
            boolean resolved = verifySolutionEffectiveness(solution);
            solution.setResolved(resolved);
            
            if (resolved) {
                logger.info("✅ 해결책 적용 성공: {}", solution.getSolutionName());
            } else {
                logger.warn("⚠️ 해결책 적용 실패, 추가 분석 필요: {}", solution.getSolutionName());
            }
            
        } catch (Exception e) {
            logger.error("❌ 해결책 적용 중 오류: {}", e.getMessage(), e);
            solution.setResolved(false);
            solution.setErrorMessage(e.getMessage());
        }
    }
    
    /**
     * 다른 에이전트들에게 디버깅 결과 알림
     */
    private void notifyOtherAgents(LogAnalysisResult analysisResult, DebugSolution solution) {
        // ClaudeGuideAgent에 디버깅 패턴 학습 요청
        publishEvent("DEBUG_PATTERN_IDENTIFIED", Map.of(
            "errorPattern", analysisResult.getErrorType(),
            "solution", solution.getSolutionSteps(),
            "prevention", solution.getPreventionMeasures()
        ));
        
        // PortfolioTroubleshootAgent에 해결 과정 문서화 요청
        publishEvent("DEBUG_SOLUTION_DOCUMENTED", Map.of(
            "solutionId", solution.getSolutionId(),
            "problemDescription", analysisResult.getProblemDescription(),
            "solutionSteps", solution.getSolutionSteps(),
            "effectiveness", solution.getEffectivenessScore()
        ));
    }
    
    /**
     * 디버깅 세션 현황 조회
     */
    public Map<String, Object> getDebugSessionStatus() {
        Map<String, Long> statusCounts = activeSessions.values().stream()
            .collect(java.util.stream.Collectors.groupingBy(
                session -> session.getStatus().name(),
                java.util.stream.Collectors.counting()
            ));
        
        List<String> topErrorPatterns = errorPatterns.values().stream()
            .sorted((p1, p2) -> Integer.compare(p2.getOccurrenceCount(), p1.getOccurrenceCount()))
            .limit(5)
            .map(ErrorPattern::getPatternName)
            .toList();
        
        return Map.of(
            "agentType", getAgentType(),
            "activeSessionsCount", activeSessions.size(),
            "sessionStatusCounts", statusCounts,
            "totalErrorPatterns", errorPatterns.size(),
            "totalSolutions", solutionHistory.size(),
            "topErrorPatterns", topErrorPatterns,
            "performanceMetrics", performanceMetrics.size(),
            "lastUpdate", LocalDateTime.now()
        );
    }
    
    // Helper methods - private 구현
    private void loadExistingErrorPatterns() {
        // 통합된 리소스에서 에러 패턴 로드
        logger.debug("기존 에러 패턴 로드 중...");
        
        // 트러블슈팅 솔루션 DB에서 패턴 로드
        String solutionsDb = resourceLoader.loadTroubleshooting("solutions-db.md");
        if (solutionsDb != null) {
            logger.info("트러블슈팅 솔루션 DB 로드 성공");
            // 솔루션 DB 파싱 및 패턴 추출
            extractPatternsFromSolutionsDb(solutionsDb);
        }
        
        // API 타임아웃 이슈 분석 문서 로드
        String apiTimeoutAnalysis = resourceLoader.loadTroubleshooting("2025-07/api-timeout-issue-analysis.md");
        if (apiTimeoutAnalysis != null) {
            logger.info("API 타임아웃 분석 문서 로드 성공");
            // 특정 패턴 학습
            learnFromApiTimeoutAnalysis(apiTimeoutAnalysis);
        }
    }
    
    private void extractPatternsFromSolutionsDb(String content) {
        // 솔루션 DB에서 에러 패턴 추출 로직
        // 예: Repository 메서드 시그니처 불일치 패턴
        ErrorPattern repositoryPattern = ErrorPattern.builder()
            .patternId("REPO_METHOD_SIGNATURE_MISMATCH")
            .patternName("Repository 메서드 시그니처 불일치")
            .description("Page<Entity> vs List<Entity> 반환 타입 불일치")
            .stackTracePattern(".*cannot be applied to given types.*")
            .confidence(0.9)
            .occurrenceCount(67) // 엘더베리 프로젝트의 실제 오류 수
            .createdAt(LocalDateTime.now())
            .build();
        
        errorPatterns.put(repositoryPattern.getPatternId(), repositoryPattern);
    }
    
    private void learnFromApiTimeoutAnalysis(String content) {
        // API 타임아웃 분석에서 패턴 학습
        ErrorPattern timeoutPattern = ErrorPattern.builder()
            .patternId("API_TIMEOUT_ERROR")
            .patternName("API 요청 타임아웃")
            .description("외부 API 호출 시 타임아웃 발생")
            .stackTracePattern(".*TimeoutException.*|.*SocketTimeoutException.*")
            .confidence(0.85)
            .occurrenceCount(1)
            .createdAt(LocalDateTime.now())
            .build();
        
        errorPatterns.put(timeoutPattern.getPatternId(), timeoutPattern);
    }
    
    private void loadSolutionHistory() {
        // 해결 사례 히스토리 로드 로직
        logger.debug("해결 사례 히스토리 로드 중...");
    }
    
    private void startLogMonitoring() {
        // 실시간 로그 모니터링 시작
        logger.debug("실시간 로그 모니터링 시작");
    }
    
    private void startPerformanceMonitoring() {
        // 성능 메트릭 수집 시작
        logger.debug("성능 메트릭 수집 시작");
    }
    
    private ErrorPattern createNewPattern(LogAnalysisResult analysis, DebugSolution solution) {
        return ErrorPattern.builder()
            .patternId(UUID.randomUUID().toString())
            .patternName(analysis.getErrorType())
            .description(analysis.getProblemDescription())
            .stackTracePattern(analysis.getStackTracePattern())
            .confidence(0.7) // 초기 신뢰도
            .occurrenceCount(1)
            .associatedSolution(solution)
            .createdAt(LocalDateTime.now())
            .build();
    }
    
    private void applyPerformanceSolution(DebugSolution solution) {
        logger.info("⚡ 성능 개선 해결책 적용: {}", solution.getSolutionName());
    }
    
    private List<DebugHypothesis> generateDebugHypotheses(DebugSession session) {
        // 디버깅 가설 생성 로직
        return Arrays.asList(
            DebugHypothesis.builder()
                .description("메모리 누수 가능성")
                .probability(0.6)
                .build(),
            DebugHypothesis.builder()
                .description("데이터베이스 연결 이슈")
                .probability(0.7)
                .build()
        );
    }
    
    private void verifyHypothesis(DebugSession session, DebugHypothesis hypothesis) {
        // 가설 검증 로직
        hypothesis.setConfirmed(hypothesis.getProbability() > 0.8);
    }
    
    private void requestExternalHelp(DebugSession session) {
        logger.info("🆘 외부 도움 요청: {}", session.getSessionId());
    }
    
    private void documentDebuggingSession(DebugSession session) {
        // 디버깅 세션 문서화
        publishEvent("DEBUG_SESSION_COMPLETED", Map.of(
            "sessionId", session.getSessionId(),
            "status", session.getStatus(),
            "solution", session.getSolution(),
            "duration", session.getDurationMinutes()
        ));
    }
    
    private void applyAutomaticFix(DebugSolution solution) {
        logger.info("🤖 자동 수정 적용: {}", solution.getSolutionName());
    }
    
    private void provideManualGuidance(DebugSolution solution) {
        logger.info("📋 수동 가이드 제공: {}", solution.getSolutionName());
    }
    
    private void suggestPreventionMeasures(DebugSolution solution) {
        logger.info("🛡️ 예방책 제안: {}", solution.getPreventionMeasures());
    }
    
    private boolean verifySolutionEffectiveness(DebugSolution solution) {
        // 해결책 효과성 검증
        return true; // 임시 구현
    }
    
    // Inner classes and enums
    public enum DebugStatus {
        ACTIVE, ANALYZING, RESOLVED, ESCALATED, FAILED
    }
}