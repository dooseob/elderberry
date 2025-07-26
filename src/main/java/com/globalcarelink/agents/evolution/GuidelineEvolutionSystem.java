package com.globalcarelink.agents.evolution;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 814줄 Claude 지침 진화 시스템
 * 목적: 1) 기존 814줄 규칙을 실시간으로 분석하고 개선
 *      2) 프로젝트 경험을 통한 규칙 효과성 측정
 *      3) 더 완성도 높은 규칙으로 자동 진화
 *      4) A/B 테스트를 통한 신규 규칙 검증
 */
@Slf4j
@Component
public class GuidelineEvolutionSystem {
    
    // 814줄 원본 규칙 저장소
    private final Map<String, OriginalGuideline> originalGuidelines = new ConcurrentHashMap<>();
    
    // 진화된 규칙 저장소 (버전 관리)
    private final Map<String, List<EvolvedGuideline>> evolvedGuidelines = new ConcurrentHashMap<>();
    
    // 규칙 효과성 추적
    private final Map<String, GuidelineEffectiveness> effectivenessTracker = new ConcurrentHashMap<>();
    
    // A/B 테스트 결과
    private final Map<String, ABTestResult> abTestResults = new ConcurrentHashMap<>();
    
    // 사용 중단된 규칙들
    private final Set<String> deprecatedGuidelines = ConcurrentHashMap.newKeySet();
    
    /**
     * 814줄 원본 규칙 로드 및 초기 분석
     */
    public void initialize814Guidelines() {
        log.info("🧠 814줄 Claude 지침 진화 시스템 초기화 시작");
        
        // 원본 814줄 규칙 로드 (실제로는 파일에서 읽어올 예정)
        load814OriginalGuidelines();
        
        // 각 규칙의 초기 효과성 기준선 설정
        initializeEffectivenessBaseline();
        
        // 진화 가능한 규칙들 식별
        identifyEvolvableGuidelines();
        
        log.info("✅ 814줄 지침 분석 완료 - 총 {}개 규칙, {}개 진화 대상", 
                originalGuidelines.size(), 
                originalGuidelines.values().stream().mapToInt(g -> g.isEvolvable() ? 1 : 0).sum());
    }
    
    /**
     * 규칙 효과성 측정 및 개선 제안
     */
    public EvolutionResult analyzeAndEvolveGuideline(String guidelineId, 
                                                    ProjectExperience experience) {
        OriginalGuideline original = originalGuidelines.get(guidelineId);
        if (original == null) {
            log.warn("⚠️ 알 수 없는 지침 ID: {}", guidelineId);
            return EvolutionResult.notFound(guidelineId);
        }
        
        // 1. 현재 규칙의 효과성 측정
        GuidelineEffectiveness effectiveness = measureEffectiveness(original, experience);
        effectivenessTracker.put(guidelineId, effectiveness);
        
        // 2. 개선이 필요한지 판단
        if (effectiveness.needsImprovement()) {
            log.info("🔄 규칙 개선 필요 감지: {} (효과성: {:.1f}%)", 
                    guidelineId, effectiveness.getScore() * 100);
            
            // 3. 새로운 규칙 제안
            EvolvedGuideline evolved = proposeImprovedGuideline(original, experience, effectiveness);
            
            // 4. A/B 테스트 설정
            ABTestResult abTest = setupABTest(original, evolved);
            abTestResults.put(guidelineId, abTest);
            
            // 5. 진화된 규칙 저장
            evolvedGuidelines.computeIfAbsent(guidelineId, k -> new ArrayList<>()).add(evolved);
            
            return EvolutionResult.improved(guidelineId, original, evolved, effectiveness);
        }
        
        return EvolutionResult.noChangeNeeded(guidelineId, effectiveness);
    }
    
    /**
     * 규칙 진화 프로세스 - 실제 경험을 통한 학습
     */
    public void processRealWorldExperience(String guidelineId, 
                                         ProjectOutcome outcome,
                                         Map<String, Object> contextData) {
        
        log.debug("📊 실제 경험 처리: {} - 결과: {}", guidelineId, outcome.getResult());
        
        GuidelineEffectiveness effectiveness = effectivenessTracker.get(guidelineId);
        if (effectiveness != null) {
            // 실제 결과를 바탕으로 효과성 업데이트
            effectiveness.addRealWorldResult(outcome);
            
            // 통계적으로 유의미한 데이터가 쌓였는지 확인
            if (effectiveness.hasStatisticalSignificance()) {
                evaluateGuidelineEvolution(guidelineId, effectiveness);
            }
        }
        
        // 컨텍스트 패턴 학습
        learnContextualPatterns(guidelineId, contextData, outcome);
    }
    
    /**
     * A/B 테스트 결과 평가 및 새 규칙 승격
     */
    public void evaluateABTestResults(String guidelineId) {
        ABTestResult abTest = abTestResults.get(guidelineId);
        if (abTest == null || !abTest.isComplete()) {
            return;
        }
        
        log.info("🧪 A/B 테스트 결과 평가: {}", guidelineId);
        
        // 통계적 유의성 검증
        if (abTest.isStatisticallySignificant()) {
            EvolvedGuideline winner = abTest.getWinner();
            
            if (winner != null && abTest.getImprovementRate() > 0.15) { // 15% 이상 개선
                // 새 규칙을 메인으로 승격
                promoteEvolvedGuideline(guidelineId, winner);
                
                // 기존 규칙을 deprecated로 표시
                deprecateOriginalGuideline(guidelineId, 
                    "더 효과적인 규칙으로 대체됨 - 개선율: " + 
                    String.format("%.1f%%", abTest.getImprovementRate() * 100));
                
                log.info("🚀 규칙 진화 완료: {} -> v{} (개선율: {:.1f}%)", 
                        guidelineId, winner.getVersion(), abTest.getImprovementRate() * 100);
            }
        }
    }
    
    /**
     * 규칙 진화 히스토리 및 통계 조회
     */
    public GuidelineEvolutionReport generateEvolutionReport() {
        int totalGuidelines = originalGuidelines.size();
        int evolvedCount = evolvedGuidelines.size();
        int deprecatedCount = deprecatedGuidelines.size();
        
        // 평균 개선율 계산
        double avgImprovement = abTestResults.values().stream()
            .filter(ABTestResult::isComplete)
            .filter(ABTestResult::isStatisticallySignificant)
            .mapToDouble(ABTestResult::getImprovementRate)
            .average()
            .orElse(0.0);
        
        // 상위 진화 성공 사례
        List<EvolutionSuccess> topSuccesses = abTestResults.entrySet().stream()
            .filter(entry -> entry.getValue().isComplete() && entry.getValue().getImprovementRate() > 0.1)
            .map(entry -> new EvolutionSuccess(
                entry.getKey(),
                entry.getValue().getImprovementRate(),
                entry.getValue().getWinner().getImprovedAspects()
            ))
            .sorted((s1, s2) -> Double.compare(s2.getImprovementRate(), s1.getImprovementRate()))
            .limit(10)
            .collect(Collectors.toList());
        
        return GuidelineEvolutionReport.builder()
            .totalOriginalGuidelines(totalGuidelines)
            .evolvedGuidelinesCount(evolvedCount)
            .deprecatedGuidelinesCount(deprecatedCount)
            .averageImprovementRate(avgImprovement)
            .topSuccessfulEvolutions(topSuccesses)
            .generatedAt(LocalDateTime.now())
            .build();
    }
    
    /**
     * 특정 상황에 맞는 최적 규칙 추천
     */
    public RecommendedGuideline recommendOptimalGuideline(String domain, 
                                                        Map<String, Object> context) {
        
        // 도메인별 진화된 규칙들 검색
        List<EvolvedGuideline> candidates = evolvedGuidelines.values().stream()
            .flatMap(List::stream)
            .filter(g -> g.isApplicableTo(domain, context))
            .sorted((g1, g2) -> Double.compare(g2.getEffectivenessScore(), g1.getEffectivenessScore()))
            .collect(Collectors.toList());
        
        if (!candidates.isEmpty()) {
            EvolvedGuideline best = candidates.get(0);
            return RecommendedGuideline.builder()
                .originalGuidelineId(best.getOriginalId())
                .evolvedGuideline(best)
                .confidenceScore(best.getEffectivenessScore())
                .reasoning(generateRecommendationReasoning(best, context))
                .alternativeOptions(candidates.subList(1, Math.min(3, candidates.size())))
                .build();
        }
        
        // 진화된 규칙이 없으면 원본 규칙에서 검색
        return findBestOriginalGuideline(domain, context);
    }
    
    // Private helper methods
    
    private void load814OriginalGuidelines() {
        // 실제 구현에서는 claude-guides/knowledge-base/guidelines-database.json에서 로드
        // 현재는 샘플 데이터 생성
        createSampleGuidelines();
    }
    
    private void createSampleGuidelines() {
        // Repository 패턴 관련 규칙
        originalGuidelines.put("REPO_001", OriginalGuideline.builder()
            .id("REPO_001")
            .category("REPOSITORY_PATTERN")
            .title("Repository 메서드 시그니처 통일")
            .content("모든 Repository는 Page<T> findByKeyword(String keyword, Pageable pageable) 형태로 통일한다.")
            .priority(Priority.HIGH)
            .lastUpdated(LocalDateTime.now().minusMonths(6))
            .evolvable(true)
            .build());
        
        // API 설계 관련 규칙
        originalGuidelines.put("API_001", OriginalGuideline.builder()
            .id("API_001")
            .category("API_DESIGN")
            .title("REST API 엔드포인트 명명 규칙")
            .content("RESTful API는 리소스 중심으로 설계하고, HTTP 메서드를 적절히 활용한다.")
            .priority(Priority.MEDIUM)
            .lastUpdated(LocalDateTime.now().minusMonths(8))
            .evolvable(true)
            .build());
        
        // 에러 핸들링 관련 규칙
        originalGuidelines.put("ERR_001", OriginalGuideline.builder()
            .id("ERR_001")
            .category("ERROR_HANDLING")
            .title("예외 처리 및 로깅 표준")
            .content("모든 예외는 GlobalExceptionHandler에서 처리하고, 적절한 로그 레벨로 기록한다.")
            .priority(Priority.HIGH)
            .lastUpdated(LocalDateTime.now().minusMonths(4))
            .evolvable(true)
            .build());
        
        log.info("📚 샘플 814줄 지침 로드 완료: {}개", originalGuidelines.size());
    }
    
    private void initializeEffectivenessBaseline() {
        originalGuidelines.forEach((id, guideline) -> {
            GuidelineEffectiveness effectiveness = new GuidelineEffectiveness(id);
            effectiveness.setBaselineScore(0.7); // 70% 기본 효과성 가정
            effectivenessTracker.put(id, effectiveness);
        });
    }
    
    private void identifyEvolvableGuidelines() {
        long evolvableCount = originalGuidelines.values().stream()
            .filter(OriginalGuideline::isEvolvable)
            .count();
        
        log.info("🔬 진화 가능한 지침: {}개", evolvableCount);
    }
    
    private GuidelineEffectiveness measureEffectiveness(OriginalGuideline guideline, 
                                                       ProjectExperience experience) {
        GuidelineEffectiveness effectiveness = effectivenessTracker.get(guideline.getId());
        
        // 경험 기반 효과성 측정
        double successRate = experience.getSuccessRate();
        double timeEfficiency = experience.getTimeEfficiency();
        double codeQuality = experience.getCodeQualityScore();
        
        // 종합 점수 계산 (가중평균)
        double overallScore = (successRate * 0.4) + (timeEfficiency * 0.3) + (codeQuality * 0.3);
        
        effectiveness.addMeasurement(overallScore, experience);
        
        return effectiveness;
    }
    
    private EvolvedGuideline proposeImprovedGuideline(OriginalGuideline original,
                                                    ProjectExperience experience,
                                                    GuidelineEffectiveness effectiveness) {
        
        // AI 기반 개선 제안 생성
        String improvedContent = generateImprovedContent(original, experience);
        List<String> improvedAspects = identifyImprovedAspects(original, experience);
        
        return EvolvedGuideline.builder()
            .originalId(original.getId())
            .version(getNextVersion(original.getId()))
            .title(original.getTitle() + " (개선됨)")
            .content(improvedContent)
            .improvedAspects(improvedAspects)
            .basedOnExperience(experience.getExperienceId())
            .confidenceScore(effectiveness.getScore())
            .createdAt(LocalDateTime.now())
            .build();
    }
    
    private String generateImprovedContent(OriginalGuideline original, ProjectExperience experience) {
        StringBuilder improved = new StringBuilder();
        
        improved.append("## ").append(original.getTitle()).append(" (진화된 버전)\n\n");
        improved.append("### 원본 규칙\n");
        improved.append(original.getContent()).append("\n\n");
        
        improved.append("### 실제 경험을 통한 개선사항\n");
        
        // 경험 기반 개선사항 생성
        if (experience.getFailurePoints().contains("성능")) {
            improved.append("- **성능 최적화**: 페이징 쿼리 시 인덱스 활용 고려\n");
        }
        
        if (experience.getFailurePoints().contains("유지보수")) {
            improved.append("- **유지보수성**: 공통 인터페이스 StandardRepository 활용\n");
        }
        
        improved.append("- **검증된 패턴**: 실제 프로젝트에서 ")
                .append(String.format("%.1f%%", experience.getSuccessRate() * 100))
                .append(" 성공률 달성\n");
        
        improved.append("\n### 권장 구현 방법\n");
        improved.append("1. 기존 방식 검토\n");
        improved.append("2. 개선된 패턴 적용\n");
        improved.append("3. 테스트를 통한 검증\n");
        improved.append("4. 성과 측정 및 문서화\n");
        
        return improved.toString();
    }
    
    private List<String> identifyImprovedAspects(OriginalGuideline original, ProjectExperience experience) {
        List<String> aspects = new ArrayList<>();
        
        if (experience.getTimeEfficiency() > 0.8) {
            aspects.add("개발 속도 향상");
        }
        
        if (experience.getCodeQualityScore() > 0.8) {
            aspects.add("코드 품질 개선");
        }
        
        if (experience.getSuccessRate() > 0.8) {
            aspects.add("안정성 증대");
        }
        
        return aspects;
    }
    
    private ABTestResult setupABTest(OriginalGuideline original, EvolvedGuideline evolved) {
        return ABTestResult.builder()
            .guidelineId(original.getId())
            .originalVersion(original)
            .evolvedVersion(evolved)
            .startTime(LocalDateTime.now())
            .requiredSampleSize(30) // 최소 30개 사례 필요
            .build();
    }
    
    private String getNextVersion(String guidelineId) {
        int currentVersion = evolvedGuidelines.getOrDefault(guidelineId, Collections.emptyList()).size();
        return "v" + (currentVersion + 1) + ".0";
    }
    
    private void evaluateGuidelineEvolution(String guidelineId, GuidelineEffectiveness effectiveness) {
        if (effectiveness.getScore() < 0.6) {
            log.warn("⚠️ 규칙 효과성 저하 감지: {} (점수: {:.1f})", 
                    guidelineId, effectiveness.getScore());
            
            // 자동 개선 프로세스 시작
            triggerAutomaticImprovement(guidelineId, effectiveness);
        }
    }
    
    private void triggerAutomaticImprovement(String guidelineId, GuidelineEffectiveness effectiveness) {
        log.info("🔄 자동 개선 프로세스 시작: {}", guidelineId);
        // 자동 개선 로직 구현
    }
    
    private void learnContextualPatterns(String guidelineId, Map<String, Object> context, ProjectOutcome outcome) {
        // 컨텍스트 패턴 학습 로직
    }
    
    private void promoteEvolvedGuideline(String guidelineId, EvolvedGuideline evolved) {
        log.info("🚀 규칙 승격: {} -> {}", guidelineId, evolved.getVersion());
        // 진화된 규칙을 메인으로 승격하는 로직
    }
    
    private void deprecateOriginalGuideline(String guidelineId, String reason) {
        deprecatedGuidelines.add(guidelineId);
        log.info("📚 규칙 사용 중단: {} - 사유: {}", guidelineId, reason);
    }
    
    private String generateRecommendationReasoning(EvolvedGuideline guideline, Map<String, Object> context) {
        return String.format("이 규칙은 실제 프로젝트에서 %.1f%% 효과성을 보였으며, %s 측면에서 개선되었습니다.",
            guideline.getEffectivenessScore() * 100,
            String.join(", ", guideline.getImprovedAspects()));
    }
    
    private RecommendedGuideline findBestOriginalGuideline(String domain, Map<String, Object> context) {
        // 원본 규칙에서 최적 규칙 찾기
        return RecommendedGuideline.builder()
            .originalGuidelineId("DEFAULT")
            .confidenceScore(0.5)
            .reasoning("진화된 규칙이 없어 원본 규칙을 사용합니다.")
            .build();
    }
    
    // Inner classes and enums
    
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    // Builder 패턴을 사용하는 데이터 클래스들은 별도 파일로 분리 예정
    // OriginalGuideline, EvolvedGuideline, ProjectExperience, etc.
}