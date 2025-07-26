package com.globalcarelink.agents.config;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.context.SharedContext;
import com.globalcarelink.agents.events.AgentEventBus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.concurrent.Executor;

/**
 * 에이전트 시스템 자동 구성
 * 목적: 1) 에이전트 자동 등록 및 초기화
 *      2) Spring Boot와 에이전트 시스템 통합
 *      3) 비동기 처리 및 스케줄링 설정
 *      4) 유기적 협업을 위한 기반 인프라 제공
 */
@Slf4j
@Configuration
@EnableAsync
@EnableScheduling
@RequiredArgsConstructor
public class AgentSystemConfiguration {
    
    private final ApplicationContext applicationContext;
    
    /**
     * 에이전트 시스템 초기화
     * 애플리케이션 준비 완료 시 모든 에이전트를 자동으로 등록하고 초기화
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeAgentSystem() {
        log.info("=== 에이전트 시스템 초기화 시작 ===");
        
        try {
            // SharedContext와 AgentEventBus 확보
            SharedContext sharedContext = applicationContext.getBean(SharedContext.class);
            AgentEventBus eventBus = applicationContext.getBean(AgentEventBus.class);
            
            // Spring 컨텍스트에서 모든 에이전트 빈 찾기
            Collection<BaseAgent> agents = applicationContext.getBeansOfType(BaseAgent.class).values();
            
            log.info("발견된 에이전트: {}개", agents.size());
            
            // 각 에이전트 초기화 및 등록
            for (BaseAgent agent : agents) {
                try {
                    // 에이전트 초기화
                    agent.initialize();
                    
                    // 공유 컨텍스트에 등록
                    sharedContext.registerAgent(agent);
                    
                    // 이벤트 버스에 능력 등록
                    registerAgentCapabilities(eventBus, agent);
                    
                    log.info("에이전트 초기화 완료: {} (ID: {})", 
                            agent.getAgentType(), agent.getAgentId());
                    
                } catch (Exception e) {
                    log.error("에이전트 초기화 실패: {} - {}", 
                             agent.getAgentType(), e.getMessage(), e);
                }
            }
            
            // 에이전트 간 협업 네트워크 설정
            setupCollaborationNetwork(agents, sharedContext);
            
            // 시스템 상태 로깅
            logSystemStatus(sharedContext, eventBus);
            
            log.info("=== 에이전트 시스템 초기화 완료 ===");
            
        } catch (Exception e) {
            log.error("에이전트 시스템 초기화 중 오류 발생", e);
            throw new RuntimeException("에이전트 시스템 초기화 실패", e);
        }
    }
    
    /**
     * 에이전트 전용 비동기 실행기 설정
     */
    @Bean(name = "agentTaskExecutor")
    public Executor agentTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Java 21 Virtual Threads 활용
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("Agent-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        
        log.info("에이전트 전용 태스크 실행기 초기화 완료");
        return executor;
    }
    
    /**
     * 에이전트 시스템 상태 모니터링 빈
     */
    @Bean
    public AgentSystemMonitor agentSystemMonitor(SharedContext sharedContext, 
                                                AgentEventBus eventBus) {
        return new AgentSystemMonitor(sharedContext, eventBus);
    }
    
    // Private helper methods
    
    /**
     * 에이전트 능력을 이벤트 버스에 등록
     */
    private void registerAgentCapabilities(AgentEventBus eventBus, BaseAgent agent) {
        java.util.Set<String> capabilities = extractAgentCapabilities(agent);
        eventBus.registerAgentCapabilities(agent.getAgentType(), capabilities);
        
        log.debug("에이전트 능력 등록: {} - {}", agent.getAgentType(), capabilities);
    }
    
    /**
     * 에이전트 타입별 능력 추출
     */
    private java.util.Set<String> extractAgentCapabilities(BaseAgent agent) {
        java.util.Set<String> capabilities = new java.util.HashSet<>();
        
        switch (agent.getAgentType()) {
            case "CLAUDE_GUIDE":
                capabilities.addAll(java.util.Set.of(
                    "LEARNING", "GUIDANCE", "PATTERN_ANALYSIS", 
                    "PREDICTION", "KNOWLEDGE_SHARING"
                ));
                break;
                
            case "PORTFOLIO_TROUBLESHOOT":
                capabilities.addAll(java.util.Set.of(
                    "TROUBLESHOOTING", "DOCUMENTATION", "PORTFOLIO_CREATION", 
                    "STAR_METHODOLOGY", "INTERVIEW_PREPARATION"
                ));
                break;
                
            case "UNIFIED_TROUBLESHOOTING":
                capabilities.addAll(java.util.Set.of(
                    "ERROR_ANALYSIS", "DOCUMENT_GENERATION", "MULTI_FORMAT_OUTPUT",
                    "TROUBLESHOOTING", "LEARNING_EXTRACTION"
                ));
                break;
                
            case "API_DOCUMENTATION":
                capabilities.addAll(java.util.Set.of(
                    "API_ANALYSIS", "SWAGGER_GENERATION", "DOCUMENTATION",
                    "REST_API_DESIGN", "OPENAPI_SPECIFICATION"
                ));
                break;
                
            default:
                // 기본 능력
                capabilities.add("GENERAL_PROCESSING");
                break;
        }
        
        return capabilities;
    }
    
    /**
     * 에이전트 간 협업 네트워크 설정
     */
    private void setupCollaborationNetwork(Collection<BaseAgent> agents, SharedContext sharedContext) {
        log.info("에이전트 협업 네트워크 설정 시작");
        
        // 에이전트 간 상호 소개 및 협업 관계 설정
        for (BaseAgent initiator : agents) {
            for (BaseAgent target : agents) {
                if (!initiator.equals(target)) {
                    // 잠재적 협업 관계 설정
                    setupPotentialCollaboration(initiator, target, sharedContext);
                }
            }
        }
        
        log.info("에이전트 협업 네트워크 설정 완료");
    }
    
    /**
     * 두 에이전트 간 잠재적 협업 관계 설정
     */
    private void setupPotentialCollaboration(BaseAgent initiator, BaseAgent target, SharedContext sharedContext) {
        // 협업 시나리오 정의
        String collaborationScenario = determineCollaborationScenario(
            initiator.getAgentType(), target.getAgentType());
        
        if (collaborationScenario != null) {
            // 협업 관계를 공유 컨텍스트에 등록
            String relationshipKey = String.format("collaboration_%s_%s", 
                initiator.getAgentType(), target.getAgentType());
            
            CollaborationRelationship relationship = CollaborationRelationship.builder()
                .initiatorType(initiator.getAgentType())
                .targetType(target.getAgentType())
                .scenario(collaborationScenario)
                .established(LocalDateTime.now())
                .collaborationCount(0)
                .build();
            
            sharedContext.setData(relationshipKey, relationship);
            
            log.debug("협업 관계 설정: {} ↔ {} (시나리오: {})", 
                     initiator.getAgentType(), target.getAgentType(), collaborationScenario);
        }
    }
    
    /**
     * 에이전트 타입별 협업 시나리오 결정
     */
    private String determineCollaborationScenario(String initiatorType, String targetType) {
        // 에이전트 타입 조합별 협업 시나리오 매핑
        String combination = initiatorType + "->" + targetType;
        
        return switch (combination) {
            case "CLAUDE_GUIDE->PORTFOLIO_TROUBLESHOOT" -> 
                "학습 패턴을 포트폴리오 생성에 적용";
            case "PORTFOLIO_TROUBLESHOOT->CLAUDE_GUIDE" -> 
                "문제 해결 경험을 학습 데이터로 제공";
            case "UNIFIED_TROUBLESHOOTING->CLAUDE_GUIDE" -> 
                "트러블슈팅 패턴을 학습 모델에 피드백";
            case "CLAUDE_GUIDE->UNIFIED_TROUBLESHOOTING" -> 
                "학습된 해결책을 트러블슈팅에 적용";
            case "API_DOCUMENTATION->PORTFOLIO_TROUBLESHOOT" -> 
                "API 개발 경험을 포트폴리오로 변환";
            case "PORTFOLIO_TROUBLESHOOT->API_DOCUMENTATION" -> 
                "포트폴리오 경험을 API 문서에 반영";
            default -> null; // 직접적인 협업 시나리오 없음
        };
    }
    
    /**
     * 시스템 상태 로깅
     */
    private void logSystemStatus(SharedContext sharedContext, AgentEventBus eventBus) {
        java.util.Map<String, Object> contextStatus = sharedContext.getAgentSystemStatus();
        java.util.Map<String, Object> eventBusStatus = eventBus.getEventBusStatus();
        
        log.info("🤖 에이전트 시스템 상태:");
        log.info("  - 활성 에이전트: {}/{}", 
                contextStatus.get("activeAgents"), contextStatus.get("totalAgents"));
        log.info("  - 이벤트 구독자: {}", eventBusStatus.get("totalSubscribers"));
        log.info("  - 공유 데이터: {}개", contextStatus.get("sharedDataItems"));
        log.info("  - 학습 패턴: {}개", contextStatus.get("learningPatterns"));
    }
    
    // Inner classes
    @lombok.Data
    @lombok.Builder
    private static class CollaborationRelationship {
        private String initiatorType;
        private String targetType;
        private String scenario;
        private LocalDateTime established;
        private int collaborationCount;
    }
    
    /**
     * 에이전트 시스템 모니터링 클래스
     */
    public static class AgentSystemMonitor {
        private final SharedContext sharedContext;
        private final AgentEventBus eventBus;
        
        public AgentSystemMonitor(SharedContext sharedContext, AgentEventBus eventBus) {
            this.sharedContext = sharedContext;
            this.eventBus = eventBus;
        }
        
        /**
         * 시스템 전체 상태 조회
         */
        public java.util.Map<String, Object> getSystemStatus() {
            java.util.Map<String, Object> status = new java.util.HashMap<>();
            status.putAll(sharedContext.getAgentSystemStatus());
            status.putAll(eventBus.getEventBusStatus());
            status.put("systemHealth", "HEALTHY");
            status.put("uptime", java.time.Duration.between(
                java.time.LocalDateTime.now().minusHours(1), // 시스템 시작 시간 (임시)
                java.time.LocalDateTime.now()
            ).toString());
            
            return status;
        }
        
        /**
         * 에이전트별 상태 조회
         */
        public java.util.Map<String, Object> getAgentStatus(String agentType) {
            return java.util.Map.of(
                "agentType", agentType,
                "isActive", true, // 실제 구현에서는 에이전트 상태 확인
                "capabilities", eventBus.findAgentsByCapability("ANY"),
                "lastActivity", java.time.LocalDateTime.now()
            );
        }
    }
}