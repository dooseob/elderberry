package com.globalcarelink.agents.evolution;

import com.globalcarelink.agents.evolution.models.ProjectExperience;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 814줄 Claude 지침 진화 시스템 데모
 * 실제 프로젝트 경험을 시뮬레이션하여 규칙 진화 프로세스 테스트
 */
@Slf4j
@Component
@Profile("demo")
@RequiredArgsConstructor
public class EvolutionSystemDemo implements CommandLineRunner {
    
    private final GuidelineEvolutionSystem evolutionSystem;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 814줄 Claude 지침 진화 시스템 데모 시작");
        
        // 시스템 초기화
        evolutionSystem.initialize814Guidelines();
        
        // 실제 프로젝트 경험 시뮬레이션
        simulateProjectExperiences();
        
        // 진화 결과 확인
        checkEvolutionResults();
        
        log.info("✅ 진화 시스템 데모 완료");
    }
    
    /**
     * 실제 프로젝트 경험 시뮬레이션
     */
    private void simulateProjectExperiences() {
        log.info("📊 프로젝트 경험 시뮬레이션 시작...");
        
        // 1. Repository 패턴 관련 경험 (성공 사례)
        simulateRepositoryPatternExperience();
        
        // 2. API 설계 관련 경험 (문제 발생 사례)
        simulateAPIDesignExperience();
        
        // 3. JPA 최적화 경험 (개선 사례)
        simulateJPAOptimizationExperience();
        
        // 4. 보안 관련 경험 (실패 사례)
        simulateSecurityExperience();
    }
    
    private void simulateRepositoryPatternExperience() {
        log.info("🔄 Repository 패턴 경험 시뮬레이션");
        
        ProjectExperience experience = ProjectExperience.builder()
            .experienceId("repo_exp_001")
            .guidelineId("REPO_001")
            .projectName("Elderberry")
            .developer("Claude AI")
            .startTime(LocalDateTime.now().minusHours(4))
            .endTime(LocalDateTime.now().minusHours(2))
            .successRate(0.95) // 95% 성공률
            .timeEfficiency(0.85) // 85% 시간 효율성
            .codeQualityScore(0.9) // 90% 코드 품질
            .bugsFound(1) // 1개 버그 발견
            .codeReviewComments(3) // 3개 리뷰 코멘트
            .successFactors(List.of(
                "StandardRepository 인터페이스 활용으로 일관성 확보",
                "Page<T> 반환 타입으로 페이징 처리 개선",
                "명확한 메서드 네이밍으로 가독성 향상"
            ))
            .failurePoints(List.of(
                "복잡한 쿼리에서 성능 이슈 발생"
            ))
            .improvements(List.of(
                "인덱스 추가로 성능 개선 필요",
                "@Query 어노테이션 활용 고려"
            ))
            .techStack(List.of("Java 21", "Spring Boot 3.2", "JPA", "H2"))
            .projectSize("medium")
            .complexity("medium")
            .timeline("2-3 days")
            .build();
        
        // 규칙 효과성 측정 및 진화
        var evolutionResult = evolutionSystem.analyzeAndEvolveGuideline("REPO_001", experience);
        
        log.info("📈 Repository 패턴 진화 결과: improved={}, effectiveness={:.1f}%", 
                evolutionResult.isImproved(), 
                evolutionResult.getCurrentEffectiveness() * 100);
    }
    
    private void simulateAPIDesignExperience() {
        log.info("🔄 API 설계 경험 시뮬레이션");
        
        ProjectExperience experience = ProjectExperience.builder()
            .experienceId("api_exp_001")
            .guidelineId("API_001")
            .projectName("Elderberry")
            .developer("Claude AI")
            .startTime(LocalDateTime.now().minusDays(1))
            .endTime(LocalDateTime.now().minusHours(8))
            .successRate(0.65) // 65% 성공률 (낮음)
            .timeEfficiency(0.7) // 70% 시간 효율성
            .codeQualityScore(0.75) // 75% 코드 품질
            .bugsFound(5) // 5개 버그 발견
            .codeReviewComments(8) // 8개 리뷰 코멘트
            .successFactors(List.of(
                "RESTful 원칙 준수",
                "적절한 HTTP 상태 코드 사용"
            ))
            .failurePoints(List.of(
                "복잡한 비즈니스 로직 처리 어려움",
                "일관성 없는 에러 응답 형태",
                "API 문서화 부족"
            ))
            .improvements(List.of(
                "GlobalExceptionHandler 통일된 에러 처리",
                "/api/actions/{action} 패턴 도입 고려",
                "OpenAPI 3.0 문서화 자동화"
            ))
            .techStack(List.of("Java 21", "Spring Boot 3.2", "REST API"))
            .projectSize("medium")
            .complexity("high")
            .timeline("3-5 days")
            .build();
        
        var evolutionResult = evolutionSystem.analyzeAndEvolveGuideline("API_001", experience);
        
        log.info("📈 API 설계 진화 결과: improved={}, effectiveness={:.1f}%", 
                evolutionResult.isImproved(), 
                evolutionResult.getCurrentEffectiveness() * 100);
    }
    
    private void simulateJPAOptimizationExperience() {
        log.info("🔄 JPA 최적화 경험 시뮬레이션");
        
        ProjectExperience experience = ProjectExperience.builder()
            .experienceId("jpa_exp_001")
            .guidelineId("JPA_001")
            .projectName("Elderberry")
            .developer("Claude AI")
            .startTime(LocalDateTime.now().minusHours(6))
            .endTime(LocalDateTime.now().minusHours(3))
            .successRate(0.88) // 88% 성공률
            .timeEfficiency(0.92) // 92% 시간 효율성
            .codeQualityScore(0.85) // 85% 코드 품질
            .bugsFound(2) // 2개 버그 발견
            .codeReviewComments(4) // 4개 리뷰 코멘트
            .successFactors(List.of(
                "@EntityGraph 활용으로 N+1 문제 해결",
                "FetchType.LAZY 적극 활용",
                "성능 모니터링으로 쿼리 최적화"
            ))
            .failurePoints(List.of(
                "복잡한 연관관계에서 초기 설정 어려움"
            ))
            .improvements(List.of(
                "QueryDSL 도입 고려",
                "배치 처리 최적화 방안 검토"
            ))
            .techStack(List.of("Java 21", "Spring Boot 3.2", "JPA", "Hibernate"))
            .projectSize("medium")
            .complexity("medium")
            .timeline("1-2 days")
            .build();
        
        var evolutionResult = evolutionSystem.analyzeAndEvolveGuideline("JPA_001", experience);
        
        log.info("📈 JPA 최적화 진화 결과: improved={}, effectiveness={:.1f}%", 
                evolutionResult.isImproved(), 
                evolutionResult.getCurrentEffectiveness() * 100);
    }
    
    private void simulateSecurityExperience() {
        log.info("🔄 보안 관련 경험 시뮬레이션");
        
        ProjectExperience experience = ProjectExperience.builder()
            .experienceId("sec_exp_001")
            .guidelineId("SEC_001")
            .projectName("Elderberry")
            .developer("Claude AI")
            .startTime(LocalDateTime.now().minusHours(3))
            .endTime(LocalDateTime.now().minusHours(1))
            .successRate(0.45) // 45% 성공률 (매우 낮음)
            .timeEfficiency(0.6) // 60% 시간 효율성
            .codeQualityScore(0.5) // 50% 코드 품질
            .bugsFound(8) // 8개 버그 발견 (보안 취약점)
            .codeReviewComments(12) // 12개 리뷰 코멘트
            .successFactors(List.of(
                "기본적인 민감 정보 마스킹 적용"
            ))
            .failurePoints(List.of(
                "JWT 토큰이 로그에 노출됨",
                "비밀번호가 포함된 객체 직접 로깅",
                "@ToString.Exclude 누락",
                "보안 스캔에서 다수 취약점 발견"
            ))
            .improvements(List.of(
                "@JsonIgnore 어노테이션 활용 강화",
                "로깅 시 민감 정보 자동 필터링 도입",
                "보안 스캔 자동화 및 CI/CD 통합",
                "개발자 보안 교육 강화 필요"
            ))
            .techStack(List.of("Java 21", "Spring Security", "JWT"))
            .projectSize("medium")
            .complexity("high")
            .timeline("2-4 days")
            .build();
        
        var evolutionResult = evolutionSystem.analyzeAndEvolveGuideline("SEC_001", experience);
        
        log.info("📈 보안 관련 진화 결과: improved={}, effectiveness={:.1f}%", 
                evolutionResult.isImproved(), 
                evolutionResult.getCurrentEffectiveness() * 100);
    }
    
    /**
     * 진화 결과 확인 및 리포트 생성
     */
    private void checkEvolutionResults() {
        log.info("📋 진화 시스템 결과 확인...");
        
        // 전체 진화 리포트 생성
        var evolutionReport = evolutionSystem.generateEvolutionReport();
        
        log.info("📊 진화 시스템 종합 결과:");
        log.info("   ▸ 총 원본 지침: {}개", evolutionReport.getTotalOriginalGuidelines());
        log.info("   ▸ 진화된 지침: {}개", evolutionReport.getEvolvedGuidelinesCount());
        log.info("   ▸ 사용 중단 지침: {}개", evolutionReport.getDeprecatedGuidelinesCount());
        log.info("   ▸ 평균 개선율: {:.1f}%", evolutionReport.getAverageImprovementRate() * 100);
        
        if (!evolutionReport.getTopSuccessfulEvolutions().isEmpty()) {
            log.info("🏆 상위 진화 성공 사례:");
            evolutionReport.getTopSuccessfulEvolutions().forEach(success -> {
                log.info("   ▸ {}: {:.1f}% 개선 ({})", 
                        success.getGuidelineId(), 
                        success.getImprovementRate() * 100,
                        String.join(", ", success.getImprovedAspects()));
            });
        }
        
        // 개별 도메인별 최적 규칙 추천 테스트
        testOptimalGuidelineRecommendation();
    }
    
    private void testOptimalGuidelineRecommendation() {
        log.info("🎯 최적 규칙 추천 테스트...");
        
        // Repository 패턴 도메인에서 최적 규칙 추천
        Map<String, Object> context = Map.of(
            "techStack", List.of("Java 21", "Spring Boot", "JPA"),
            "projectSize", "medium",
            "complexity", "medium"
        );
        
        var recommendation = evolutionSystem.recommendOptimalGuideline("REPOSITORY_PATTERN", context);
        
        log.info("💡 Repository 패턴 추천 결과:");
        log.info("   ▸ 원본 규칙 ID: {}", recommendation.getOriginalGuidelineId());
        log.info("   ▸ 신뢰도: {:.1f}%", recommendation.getConfidenceScore() * 100);
        log.info("   ▸ 추천 이유: {}", recommendation.getReasoning());
    }
}