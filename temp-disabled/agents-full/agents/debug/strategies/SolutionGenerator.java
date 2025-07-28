package com.globalcarelink.agents.debug.strategies;

import com.globalcarelink.agents.debug.models.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 해결책 생성 전략
 */
@Slf4j
@Component
public class SolutionGenerator {
    
    /**
     * 기존 패턴을 기반으로 해결책 생성
     */
    public DebugSolution generateFromPattern(ErrorPattern pattern, LogAnalysisResult analysis) {
        log.info("기존 패턴 기반 해결책 생성: {}", pattern.getPatternName());
        
        DebugSolution baseSolution = pattern.getAssociatedSolution();
        if (baseSolution == null) {
            return generateFromAnalysis(analysis);
        }
        
        // 기존 해결책을 현재 상황에 맞게 조정
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName(baseSolution.getSolutionName() + " (패턴 기반)")
            .description(baseSolution.getDescription())
            .category(baseSolution.getCategory())
            .solutionSteps(adaptSolutionSteps(baseSolution.getSolutionSteps(), analysis))
            .manualSteps(baseSolution.getManualSteps())
            .automationSteps(baseSolution.getAutomationSteps())
            .quickFix(baseSolution.getQuickFix())
            .preventionMeasures(baseSolution.getPreventionMeasures())
            .monitoringRecommendations(baseSolution.getMonitoringRecommendations())
            .codeReviewChecklist(baseSolution.getCodeReviewChecklist())
            .isAutoApplicable(baseSolution.isAutoApplicable())
            .requiresRestart(baseSolution.isRequiresRestart())
            .requiresDeployment(baseSolution.isRequiresDeployment())
            .estimatedTimeToFix(baseSolution.getEstimatedTimeToFix())
            .complexityScore(baseSolution.getComplexityScore())
            .effectivenessScore(baseSolution.getEffectivenessScore())
            .successRate(baseSolution.getSuccessRate())
            .potentialSideEffects(baseSolution.getPotentialSideEffects())
            .riskLevel(baseSolution.getRiskLevel())
            .prerequisiteChecks(baseSolution.getPrerequisiteChecks())
            .rollbackProcedure(baseSolution.getRollbackProcedure())
            .relatedErrorPattern(pattern.getPatternId())
            .createdAt(LocalDateTime.now())
            .createdBy("PATTERN_BASED")
            .verified(true) // 패턴 기반이므로 검증됨
            .build();
    }
    
    /**
     * 로그 분석 결과를 기반으로 새로운 해결책 생성
     */
    public DebugSolution generateFromAnalysis(LogAnalysisResult analysis) {
        log.info("분석 결과 기반 새 해결책 생성: {}", analysis.getErrorType());
        
        String errorType = analysis.getErrorType();
        
        return switch (errorType) {
            case "NullPointerException" -> generateNullPointerSolution(analysis);
            case "OutOfMemoryError" -> generateMemorySolution(analysis);
            case "SQLException" -> generateDatabaseSolution(analysis);
            case "TimeoutException" -> generateTimeoutSolution(analysis);
            case "SecurityException" -> generateSecuritySolution(analysis);
            default -> generateGenericSolution(analysis);
        };
    }
    
    /**
     * 가설을 기반으로 해결책 생성
     */
    public DebugSolution generateFromHypothesis(DebugHypothesis hypothesis) {
        log.info("가설 기반 해결책 생성: {}", hypothesis.getDescription());
        
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("가설 기반 해결책: " + hypothesis.getDescription())
            .description("검증된 가설을 바탕으로 생성된 해결책입니다.")
            .category("HYPOTHESIS_BASED")
            .solutionSteps(generateHypothesisSteps(hypothesis))
            .isAutoApplicable(false) // 가설 기반은 수동 확인 필요
            .effectivenessScore(hypothesis.getProbability())
            .complexityScore(0.6)
            .riskLevel(0.4)
            .createdAt(LocalDateTime.now())
            .createdBy("HYPOTHESIS_SYSTEM")
            .verified(hypothesis.isConfirmed())
            .build();
    }
    
    /**
     * 성능 이슈를 위한 해결책 생성
     */
    public DebugSolution generatePerformanceSolution(String metricName, PerformanceMetric metric) {
        log.info("성능 해결책 생성: {} - {}", metricName, metric.getPerformanceIssue());
        
        List<DebugSolution.SolutionStep> steps = new ArrayList<>();
        List<String> preventionMeasures = new ArrayList<>();
        
        // 메트릭별 구체적 해결책
        switch (metricName.toLowerCase()) {
            case "response_time":
                steps.addAll(generateResponseTimeSteps());
                preventionMeasures.addAll(Arrays.asList(
                    "API 응답 시간 모니터링 알람 설정",
                    "데이터베이스 쿼리 최적화",
                    "캐시 전략 도입"
                ));
                break;
            case "memory_usage":
                steps.addAll(generateMemoryOptimizationSteps());
                preventionMeasures.addAll(Arrays.asList(
                    "메모리 사용량 모니터링",
                    "가비지 컬렉션 튜닝",
                    "메모리 누수 방지 코드 리뷰"
                ));
                break;
            case "cpu_usage":
                steps.addAll(generateCpuOptimizationSteps());
                preventionMeasures.addAll(Arrays.asList(
                    "CPU 사용률 모니터링",
                    "비동기 처리 도입",
                    "알고리즘 복잡도 최적화"
                ));
                break;
        }
        
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("성능 최적화: " + metricName)
            .description(metric.getPerformanceIssue() + "에 대한 최적화 방안")
            .category("PERFORMANCE")
            .solutionSteps(steps)
            .preventionMeasures(preventionMeasures)
            .isAutoApplicable(false)
            .requiresRestart(false)
            .estimatedTimeToFix("30-60분")
            .complexityScore(0.5)
            .effectivenessScore(0.8)
            .riskLevel(0.3)
            .createdAt(LocalDateTime.now())
            .createdBy("PERFORMANCE_ANALYZER")
            .build();
    }
    
    // 에러 타입별 해결책 생성 메서드들
    
    private DebugSolution generateNullPointerSolution(LogAnalysisResult analysis) {
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("NullPointerException 해결")
            .description("Null 참조로 인한 에러를 해결합니다.")
            .category("IMMEDIATE_FIX")
            .solutionSteps(Arrays.asList(
                createStep(1, "null 체크 추가", "if (object != null) { ... }", true),
                createStep(2, "Optional 사용 검토", "Optional.ofNullable(object).ifPresent(...)", false),
                createStep(3, "초기화 코드 확인", "객체 초기화가 제대로 되었는지 확인", false)
            ))
            .manualSteps(Arrays.asList(
                "발생 위치의 코드 검토",
                "null 체크 로직 추가",
                "단위 테스트로 검증"
            ))
            .quickFix("if (object != null) { ... } 조건 추가")
            .preventionMeasures(Arrays.asList(
                "@Nullable/@NonNull 어노테이션 사용",
                "Optional 클래스 활용",
                "생성자에서 필수 필드 초기화"
            ))
            .isAutoApplicable(true)
            .effectivenessScore(0.9)
            .complexityScore(0.3)
            .riskLevel(0.2)
            .estimatedTimeToFix("10-30분")
            .createdAt(LocalDateTime.now())
            .createdBy("AUTO_GENERATED")
            .build();
    }
    
    private DebugSolution generateMemorySolution(LogAnalysisResult analysis) {
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("메모리 부족 문제 해결")
            .description("OutOfMemoryError 해결을 위한 메모리 최적화")
            .category("ENVIRONMENT")
            .solutionSteps(Arrays.asList(
                createStep(1, "힙 메모리 증가", "-Xmx2g -Xms1g", true),
                createStep(2, "메모리 누수 분석", "VisualVM 또는 MAT 도구 사용", false),
                createStep(3, "GC 튜닝", "-XX:+UseG1GC", false)
            ))
            .requiresRestart(true)
            .effectivenessScore(0.8)
            .complexityScore(0.7)
            .riskLevel(0.4)
            .estimatedTimeToFix("1-2시간")
            .createdAt(LocalDateTime.now())
            .createdBy("AUTO_GENERATED")
            .build();
    }
    
    private DebugSolution generateDatabaseSolution(LogAnalysisResult analysis) {
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("데이터베이스 연결 문제 해결")
            .description("SQLException 및 데이터베이스 관련 이슈 해결")
            .category("CONFIGURATION")
            .solutionSteps(Arrays.asList(
                createStep(1, "연결 설정 확인", "application.yml의 database 설정 검토", false),
                createStep(2, "연결 풀 설정", "HikariCP 설정 최적화", false),
                createStep(3, "쿼리 최적화", "실행 중인 쿼리 성능 분석", false)
            ))
            .preventionMeasures(Arrays.asList(
                "연결 풀 모니터링",
                "쿼리 타임아웃 설정",
                "트랜잭션 범위 최소화"
            ))
            .effectivenessScore(0.85)
            .complexityScore(0.6)
            .riskLevel(0.3)
            .estimatedTimeToFix("30-90분")
            .createdAt(LocalDateTime.now())
            .createdBy("AUTO_GENERATED")
            .build();
    }
    
    private DebugSolution generateTimeoutSolution(LogAnalysisResult analysis) {
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("타임아웃 문제 해결")
            .description("요청 처리 시간 초과 문제 해결")
            .category("PERFORMANCE")
            .solutionSteps(Arrays.asList(
                createStep(1, "타임아웃 설정 증가", "server.tomcat.connection-timeout 조정", true),
                createStep(2, "비동기 처리 도입", "@Async 어노테이션 활용", false),
                createStep(3, "캐시 전략 도입", "Redis 또는 Caffeine 캐시", false)
            ))
            .effectivenessScore(0.8)
            .complexityScore(0.5)
            .riskLevel(0.3)
            .estimatedTimeToFix("45-120분")
            .createdAt(LocalDateTime.now())
            .createdBy("AUTO_GENERATED")
            .build();
    }
    
    private DebugSolution generateSecuritySolution(LogAnalysisResult analysis) {
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("보안 예외 해결")
            .description("SecurityException 및 권한 관련 문제 해결")
            .category("SECURITY")
            .solutionSteps(Arrays.asList(
                createStep(1, "권한 설정 확인", "Spring Security 설정 검토", false),
                createStep(2, "인증 토큰 확인", "JWT 토큰 유효성 검사", false),
                createStep(3, "접근 권한 수정", "@PreAuthorize 어노테이션 조정", false)
            ))
            .preventionMeasures(Arrays.asList(
                "보안 테스트 강화",
                "접근 권한 매트릭스 관리",
                "보안 로그 모니터링"
            ))
            .effectivenessScore(0.9)
            .complexityScore(0.7)
            .riskLevel(0.5)
            .estimatedTimeToFix("60-180분")
            .createdAt(LocalDateTime.now())
            .createdBy("AUTO_GENERATED")
            .build();
    }
    
    private DebugSolution generateGenericSolution(LogAnalysisResult analysis) {
        return DebugSolution.builder()
            .solutionId(UUID.randomUUID().toString())
            .solutionName("일반적인 오류 해결")
            .description("알 수 없는 오류에 대한 일반적 해결 방안")
            .category("GENERAL")
            .solutionSteps(Arrays.asList(
                createStep(1, "로그 레벨 증가", "DEBUG 레벨로 상세 로그 확인", true),
                createStep(2, "스택 트레이스 분석", "에러 발생 지점 추적", false),
                createStep(3, "관련 코드 검토", "최근 변경사항 확인", false)
            ))
            .effectivenessScore(0.6)
            .complexityScore(0.4)
            .riskLevel(0.2)
            .estimatedTimeToFix("30-60분")
            .createdAt(LocalDateTime.now())
            .createdBy("AUTO_GENERATED")
            .build();
    }
    
    // Helper methods
    
    private List<DebugSolution.SolutionStep> adaptSolutionSteps(
            List<DebugSolution.SolutionStep> originalSteps, LogAnalysisResult analysis) {
        // 원본 단계를 현재 상황에 맞게 조정
        return originalSteps != null ? new ArrayList<>(originalSteps) : new ArrayList<>();
    }
    
    private List<DebugSolution.SolutionStep> generateHypothesisSteps(DebugHypothesis hypothesis) {
        return Arrays.asList(
            createStep(1, "가설 재검증", hypothesis.getDescription() + " 가설 확인", false),
            createStep(2, "관련 컴포넌트 점검", String.join(", ", hypothesis.getRelatedComponents()), false),
            createStep(3, "해결책 적용", "가설에 따른 구체적 해결책 적용", false)
        );
    }
    
    private List<DebugSolution.SolutionStep> generateResponseTimeSteps() {
        return Arrays.asList(
            createStep(1, "느린 쿼리 식별", "데이터베이스 성능 모니터링", false),
            createStep(2, "인덱스 추가", "자주 사용되는 컬럼에 인덱스 생성", false),
            createStep(3, "캐시 도입", "자주 조회되는 데이터 캐싱", false)
        );
    }
    
    private List<DebugSolution.SolutionStep> generateMemoryOptimizationSteps() {
        return Arrays.asList(
            createStep(1, "메모리 프로파일링", "힙 덤프 분석", false),
            createStep(2, "메모리 누수 수정", "불필요한 객체 참조 제거", false),
            createStep(3, "GC 튜닝", "가비지 컬렉션 최적화", false)
        );
    }
    
    private List<DebugSolution.SolutionStep> generateCpuOptimizationSteps() {
        return Arrays.asList(
            createStep(1, "CPU 집약적 코드 식별", "프로파일러로 핫스팟 분석", false),
            createStep(2, "알고리즘 최적화", "시간 복잡도 개선", false),
            createStep(3, "병렬 처리 도입", "멀티스레딩 또는 비동기 처리", false)
        );
    }
    
    private DebugSolution.SolutionStep createStep(int number, String description, 
                                                String command, boolean automated) {
        return DebugSolution.SolutionStep.builder()
            .stepNumber(number)
            .description(description)
            .command(command)
            .isAutomated(automated)
            .dependencies(new ArrayList<>())
            .build();
    }
}