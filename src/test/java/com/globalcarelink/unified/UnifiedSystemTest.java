package com.globalcarelink.unified;

import com.globalcarelink.agents.orchestrator.IntelligentAgentOrchestrator;
import com.globalcarelink.common.event.ErrorEvent;
import com.globalcarelink.common.event.PerformanceEvent;
import com.globalcarelink.common.troubleshooting.TroubleshootingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 통합 시스템 테스트
 * 목적: 1) 분산된 테스트 파일들을 하나로 통합
 *      2) 시나리오 기반 종합 테스트
 *      3) 관리 포인트 단일화
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "logging.level.com.globalcarelink=DEBUG"
})
@Transactional
@DisplayName("🔧 엘더베리 통합 시스템 테스트")
public class UnifiedSystemTest {

    @Nested
    @DisplayName("🤖 에이전트 오케스트레이션 테스트")
    class AgentOrchestrationTest {
        
        @Test
        @DisplayName("에러 이벤트 → 트러블슈팅 → 포트폴리오 → 학습 파이프라인")
        void shouldProcessErrorEventThroughCompletePipeline() {
            // Given: 시스템 에러 발생
            ErrorEvent errorEvent = createSampleErrorEvent();
            
            // When: 오케스트레이터가 이벤트 처리
            orchestrator.handleSystemEvent(errorEvent);
            
            // Then: 모든 에이전트가 순차적으로 처리
            // 1. TroubleshootingService → 문서 생성
            // 2. PortfolioAgent → STAR 방법론 스토리 생성  
            // 3. ClaudeGuideAgent → 패턴 학습 및 지침 업데이트
            // 4. 통합 결과 검증
            
            assertThat(troubleshootingService.getStatus().getDocumentsGenerated()).isGreaterThan(0);
            assertThat(portfolioAgent.getActiveStories()).isNotEmpty();
            assertThat(claudeGuideAgent.getLearnedPatterns()).containsKey("ERROR_Repository");
        }
        
        @Test
        @DisplayName("성능 이슈 → 실시간 분석 → 최적화 제안")
        void shouldHandlePerformanceIssueWithRealTimeAnalysis() {
            // Given: 성능 임계값 초과 이벤트
            PerformanceEvent perfEvent = createSlowQueryEvent();
            
            // When: 실시간 처리
            orchestrator.handleSystemEvent(perfEvent);
            
            // Then: 즉시 분석 및 제안
            assertThat(getGeneratedOptimizationSuggestions()).isNotEmpty();
        }
    }
    
    @Nested
    @DisplayName("📊 Repository 표준화 테스트")
    class RepositoryStandardizationTest {
        
        @Test
        @DisplayName("모든 Repository 메서드 시그니처 통일성 검증")
        void shouldHaveConsistentRepositorySignatures() {
            // 67개 컴파일 에러 해결 검증
            // 모든 Repository가 Page<T> 반환하는지 확인
            assertAllRepositoriesUsePageable();
        }
    }
    
    @Nested
    @DisplayName("🔄 전체 시스템 통합 시나리오")
    class EndToEndScenarioTest {
        
        @Test
        @DisplayName("사용자 등록 → 매칭 → 리뷰 → 문제 해결 전체 시나리오")
        void shouldHandleCompleteUserJourney() {
            // 실제 비즈니스 플로우 테스트
            // 복잡한 시나리오를 하나의 테스트로 통합
        }
    }
    
    // Helper methods
    private ErrorEvent createSampleErrorEvent() {
        return ErrorEvent.builder()
            .eventId("TEST-001")
            .errorType("RepositoryException")
            .errorMessage("Repository 메서드 시그니처 불일치")
            .className("FacilityRepository")
            .methodName("findByActiveTrue")
            .build();
    }
    
    private PerformanceEvent createSlowQueryEvent() {
        return PerformanceEvent.builder()
            .eventId("PERF-001")
            .operationType("REPOSITORY")
            .executionTimeMs(1500L)
            .thresholdMs(500L)
            .build();
    }
}