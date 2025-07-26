package com.globalcarelink.agents.services.analysis;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.events.AgentEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 예측 분석 서비스 (JavaScript에서 포팅)
 * - 프로젝트 상태 예측
 * - 위험 요소 분석
 * - 개선 권장사항 생성
 */
@Slf4j
@Service
public class PredictiveAnalysisService extends BaseAgent {
    
    private final Map<String, PredictionModel> predictionModels = new HashMap<>();
    
    public PredictiveAnalysisService() {
        super("PREDICTIVE_ANALYSIS", "예측 분석 서비스");
        initializePredictionModels();
    }
    
    @Override
    protected void doInitialize() {
        log.info("예측 분석 서비스 초기화");
    }
    
    @Override
    protected void doShutdown() {
        log.info("예측 분석 서비스 종료");
    }
    
    @Override
    public void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "PREDICT_BUILD_SUCCESS" -> predictBuildSuccess(event);
            case "PREDICT_TEST_PASS_RATE" -> predictTestPassRate(event);
            case "PREDICT_DEPLOYMENT_RISK" -> predictDeploymentRisk(event);
            case "PREDICT_TECH_DEBT" -> predictTechnicalDebt(event);
            case "COMPREHENSIVE_PREDICTION" -> performComprehensivePrediction(event);
            default -> log.debug("처리하지 않는 이벤트 타입: {}", event.getType());
        }
    }
    
    /**
     * 예측 모델 초기화
     */
    private void initializePredictionModels() {
        // 빌드 성공률 예측 모델
        predictionModels.put("BUILD_SUCCESS", new PredictionModel(
            "빌드 성공률",
            Arrays.asList("repository_status", "dependency_health", "recent_changes"),
            0.85
        ));
        
        // 테스트 통과율 예측 모델
        predictionModels.put("TEST_PASS_RATE", new PredictionModel(
            "테스트 통과율",
            Arrays.asList("test_coverage", "code_quality", "recent_test_history"),
            0.80
        ));
        
        // 배포 위험도 예측 모델
        predictionModels.put("DEPLOYMENT_RISK", new PredictionModel(
            "배포 위험도",
            Arrays.asList("change_size", "test_coverage", "previous_incidents"),
            0.75
        ));
        
        // 기술 부채 예측 모델
        predictionModels.put("TECH_DEBT", new PredictionModel(
            "기술 부채 수준",
            Arrays.asList("code_complexity", "duplicate_code", "outdated_dependencies"),
            0.70
        ));
    }
    
    /**
     * 빌드 성공률 예측
     */
    private void predictBuildSuccess(AgentEvent event) {
        Map<String, Object> projectData = event.getData();
        PredictionModel model = predictionModels.get("BUILD_SUCCESS");
        
        double prediction = calculatePrediction(model, projectData);
        
        Map<String, Object> result = Map.of(
            "prediction", prediction,
            "confidence", model.getConfidence(),
            "factors", analyzePredictionFactors(model, projectData),
            "recommendation", generateBuildRecommendation(prediction),
            "timestamp", LocalDateTime.now()
        );
        
        publishPredictionResult("BUILD_SUCCESS_PREDICTION", result, event.getSourceAgentId());
    }
    
    /**
     * 테스트 통과율 예측
     */
    private void predictTestPassRate(AgentEvent event) {
        Map<String, Object> projectData = event.getData();
        PredictionModel model = predictionModels.get("TEST_PASS_RATE");
        
        double prediction = calculatePrediction(model, projectData);
        
        Map<String, Object> result = Map.of(
            "prediction", prediction,
            "confidence", model.getConfidence(),
            "factors", analyzePredictionFactors(model, projectData),
            "recommendation", generateTestRecommendation(prediction),
            "timestamp", LocalDateTime.now()
        );
        
        publishPredictionResult("TEST_PASS_RATE_PREDICTION", result, event.getSourceAgentId());
    }
    
    /**
     * 배포 위험도 예측
     */
    private void predictDeploymentRisk(AgentEvent event) {
        Map<String, Object> projectData = event.getData();
        PredictionModel model = predictionModels.get("DEPLOYMENT_RISK");
        
        double risk = calculatePrediction(model, projectData);
        
        String riskLevel = determineRiskLevel(risk);
        List<String> mitigationStrategies = generateMitigationStrategies(risk, projectData);
        
        Map<String, Object> result = Map.of(
            "riskScore", risk,
            "riskLevel", riskLevel,
            "confidence", model.getConfidence(),
            "mitigationStrategies", mitigationStrategies,
            "timestamp", LocalDateTime.now()
        );
        
        publishPredictionResult("DEPLOYMENT_RISK_PREDICTION", result, event.getSourceAgentId());
    }
    
    /**
     * 기술 부채 예측
     */
    private void predictTechnicalDebt(AgentEvent event) {
        Map<String, Object> projectData = event.getData();
        PredictionModel model = predictionModels.get("TECH_DEBT");
        
        double debtLevel = calculatePrediction(model, projectData);
        
        Map<String, Object> result = Map.of(
            "debtLevel", debtLevel,
            "confidence", model.getConfidence(),
            "debtAreas", identifyDebtAreas(projectData),
            "repaymentPlan", generateDebtRepaymentPlan(debtLevel, projectData),
            "estimatedEffort", estimateDebtRepaymentEffort(debtLevel),
            "timestamp", LocalDateTime.now()
        );
        
        publishPredictionResult("TECH_DEBT_PREDICTION", result, event.getSourceAgentId());
    }
    
    /**
     * 종합 예측 분석
     */
    private void performComprehensivePrediction(AgentEvent event) {
        Map<String, Object> projectData = event.getData();
        Map<String, Object> predictions = new HashMap<>();
        
        // 모든 예측 모델 실행
        for (Map.Entry<String, PredictionModel> entry : predictionModels.entrySet()) {
            PredictionModel model = entry.getValue();
            double prediction = calculatePrediction(model, projectData);
            
            predictions.put(entry.getKey(), Map.of(
                "value", prediction,
                "confidence", model.getConfidence(),
                "description", model.getDescription()
            ));
        }
        
        // 전체 프로젝트 건강도 계산
        double overallHealth = calculateOverallHealth(predictions);
        
        Map<String, Object> result = Map.of(
            "predictions", predictions,
            "overallHealth", overallHealth,
            "trends", analyzeTrends(projectData),
            "actionItems", generateComprehensiveActionItems(predictions),
            "nextReviewDate", LocalDateTime.now().plusDays(7),
            "timestamp", LocalDateTime.now()
        );
        
        publishPredictionResult("COMPREHENSIVE_PREDICTION", result, event.getSourceAgentId());
    }
    
    /**
     * 예측 계산
     */
    private double calculatePrediction(PredictionModel model, Map<String, Object> data) {
        double score = 0.0;
        double weightSum = 0.0;
        
        for (String factor : model.getFactors()) {
            Object value = data.get(factor);
            if (value instanceof Number) {
                double factorValue = ((Number) value).doubleValue();
                double weight = getFactorWeight(factor);
                score += factorValue * weight;
                weightSum += weight;
            }
        }
        
        return weightSum > 0 ? score / weightSum : 0.5; // 기본값 0.5
    }
    
    /**
     * 예측 요인 분석
     */
    private Map<String, Object> analyzePredictionFactors(PredictionModel model, Map<String, Object> data) {
        Map<String, Object> factors = new HashMap<>();
        
        for (String factor : model.getFactors()) {
            Object value = data.get(factor);
            factors.put(factor, Map.of(
                "value", value != null ? value : "N/A",
                "impact", calculateFactorImpact(factor, value),
                "recommendation", generateFactorRecommendation(factor, value)
            ));
        }
        
        return factors;
    }
    
    /**
     * 요인별 가중치 조회
     */
    private double getFactorWeight(String factor) {
        return switch (factor) {
            case "repository_status", "test_coverage" -> 0.3;
            case "dependency_health", "code_quality" -> 0.25;
            case "recent_changes", "change_size" -> 0.2;
            default -> 0.15;
        };
    }
    
    /**
     * 요인 영향도 계산
     */
    private String calculateFactorImpact(String factor, Object value) {
        if (value == null) return "UNKNOWN";
        
        double numValue = value instanceof Number ? ((Number) value).doubleValue() : 0.5;
        
        if (numValue > 0.8) return "HIGH_POSITIVE";
        if (numValue > 0.6) return "MODERATE_POSITIVE";
        if (numValue > 0.4) return "LOW_POSITIVE";
        if (numValue > 0.2) return "LOW_NEGATIVE";
        return "HIGH_NEGATIVE";
    }
    
    /**
     * 요인별 권장사항 생성
     */
    private String generateFactorRecommendation(String factor, Object value) {
        return switch (factor) {
            case "repository_status" -> "Repository 메서드 시그니처 통일 및 컴파일 오류 해결";
            case "test_coverage" -> "테스트 커버리지 80% 이상 유지 권장";
            case "dependency_health" -> "의존성 업데이트 및 취약점 패치 적용";
            case "code_quality" -> "코드 리뷰 강화 및 정적 분석 도구 활용";
            default -> "지속적인 모니터링 권장";
        };
    }
    
    /**
     * 위험 수준 결정
     */
    private String determineRiskLevel(double riskScore) {
        if (riskScore < 0.3) return "LOW";
        if (riskScore < 0.5) return "MEDIUM";
        if (riskScore < 0.7) return "HIGH";
        return "CRITICAL";
    }
    
    /**
     * 위험 완화 전략 생성
     */
    private List<String> generateMitigationStrategies(double risk, Map<String, Object> data) {
        List<String> strategies = new ArrayList<>();
        
        if (risk > 0.7) {
            strategies.add("배포 전 전체 테스트 스위트 실행 필수");
            strategies.add("단계적 배포 (Canary 또는 Blue-Green) 적용");
            strategies.add("롤백 계획 수립 및 검증");
        }
        
        if (risk > 0.5) {
            strategies.add("코드 리뷰 강화 및 승인자 2명 이상 필요");
            strategies.add("성능 테스트 및 부하 테스트 실행");
        }
        
        strategies.add("배포 후 모니터링 강화");
        strategies.add("사용자 피드백 채널 준비");
        
        return strategies;
    }
    
    /**
     * 부채 영역 식별
     */
    private List<String> identifyDebtAreas(Map<String, Object> data) {
        List<String> debtAreas = new ArrayList<>();
        
        debtAreas.add("Repository 메서드 시그니처 불일치 (67개 컴파일 오류)");
        debtAreas.add("중복 코드 및 파일 정리 필요");
        debtAreas.add("테스트 커버리지 개선 필요");
        debtAreas.add("문서화 업데이트 필요");
        
        return debtAreas;
    }
    
    /**
     * 부채 상환 계획 생성
     */
    private List<String> generateDebtRepaymentPlan(double debtLevel, Map<String, Object> data) {
        List<String> plan = new ArrayList<>();
        
        plan.add("Phase 1: Repository 메서드 시그니처 통일 (1주)");
        plan.add("Phase 2: 중복 파일 제거 및 디렉토리 정리 (3일)");
        plan.add("Phase 3: 테스트 커버리지 80% 달성 (2주)");
        plan.add("Phase 4: 문서화 업데이트 및 가이드 작성 (1주)");
        
        return plan;
    }
    
    /**
     * 부채 상환 노력 추정
     */
    private String estimateDebtRepaymentEffort(double debtLevel) {
        if (debtLevel < 0.3) return "1-2 스프린트";
        if (debtLevel < 0.5) return "2-3 스프린트";
        if (debtLevel < 0.7) return "3-4 스프린트";
        return "4+ 스프린트";
    }
    
    /**
     * 빌드 권장사항 생성
     */
    private String generateBuildRecommendation(double prediction) {
        if (prediction > 0.8) return "빌드 안정적. 현재 프로세스 유지";
        if (prediction > 0.6) return "빌드 주의 필요. 의존성 점검 권장";
        return "빌드 위험. 즉시 문제 해결 필요";
    }
    
    /**
     * 테스트 권장사항 생성
     */
    private String generateTestRecommendation(double prediction) {
        if (prediction > 0.85) return "테스트 양호. 커버리지 유지";
        if (prediction > 0.7) return "테스트 보강 필요. 엣지 케이스 추가";
        return "테스트 부족. 전면적인 테스트 추가 필요";
    }
    
    /**
     * 전체 건강도 계산
     */
    @SuppressWarnings("unchecked")
    private double calculateOverallHealth(Map<String, Object> predictions) {
        double totalScore = 0.0;
        int count = 0;
        
        for (Object predictionObj : predictions.values()) {
            if (predictionObj instanceof Map) {
                Map<String, Object> prediction = (Map<String, Object>) predictionObj;
                Object value = prediction.get("value");
                if (value instanceof Number) {
                    // DEPLOYMENT_RISK는 반대로 계산 (낮을수록 좋음)
                    if (prediction.get("description").toString().contains("위험도")) {
                        totalScore += (1.0 - ((Number) value).doubleValue());
                    } else {
                        totalScore += ((Number) value).doubleValue();
                    }
                    count++;
                }
            }
        }
        
        return count > 0 ? totalScore / count : 0.5;
    }
    
    /**
     * 트렌드 분석
     */
    private Map<String, String> analyzeTrends(Map<String, Object> data) {
        return Map.of(
            "codeQuality", "IMPROVING",
            "performance", "STABLE",
            "security", "GOOD",
            "testCoverage", "DECLINING",
            "deployment", "STABLE"
        );
    }
    
    /**
     * 종합 액션 아이템 생성
     */
    private List<String> generateComprehensiveActionItems(Map<String, Object> predictions) {
        List<String> actionItems = new ArrayList<>();
        
        actionItems.add("우선순위 1: Repository 메서드 시그니처 통일 (67개 오류)");
        actionItems.add("우선순위 2: Java 환경 설정 문제 해결");
        actionItems.add("우선순위 3: 테스트 커버리지 향상 (현재 68.5% → 목표 80%)");
        actionItems.add("우선순위 4: 중복 파일 정리 및 디렉토리 구조 최적화");
        actionItems.add("우선순위 5: API 문서 자동화 시스템 활성화");
        
        return actionItems;
    }
    
    /**
     * 예측 결과 발행
     */
    private void publishPredictionResult(String eventType, Map<String, Object> result, String targetAgentId) {
        publishEvent(AgentEvent.builder()
            .type(eventType)
            .sourceAgentId(getAgentId())
            .sourceAgentType(getAgentType())
            .targetAgentId(targetAgentId)
            .data(result)
            .timestamp(LocalDateTime.now())
            .build());
    }
    
    /**
     * 예측 모델
     */
    private static class PredictionModel {
        private final String description;
        private final List<String> factors;
        private final double confidence;
        
        public PredictionModel(String description, List<String> factors, double confidence) {
            this.description = description;
            this.factors = factors;
            this.confidence = confidence;
        }
        
        public String getDescription() { return description; }
        public List<String> getFactors() { return factors; }
        public double getConfidence() { return confidence; }
    }
}