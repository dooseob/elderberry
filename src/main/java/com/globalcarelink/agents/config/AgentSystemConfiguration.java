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
 * 순차적 에이전트 시스템 구성
 * 목적: 1) 단순한 순차 실행 방식 채택
 *      2) JavaScript 오케스트레이터와 연동
 *      3) 복잡한 협업 대신 명확한 역할 분담
 *      4) 안정적이고 예측 가능한 실행
 */
@Slf4j
@Configuration
@EnableAsync
@EnableScheduling
@RequiredArgsConstructor
public class AgentSystemConfiguration {
    
    private final ApplicationContext applicationContext;
    
    /**
     * 순차적 에이전트 시스템 초기화
     * 복잡한 협업 대신 단순한 등록만 수행
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeSequentialAgentSystem() {
        log.info("=== 순차적 에이전트 시스템 초기화 시작 ===");
        
        try {
            // Spring 컨텍스트에서 모든 에이전트 빈 찾기
            Collection<BaseAgent> agents = applicationContext.getBeansOfType(BaseAgent.class).values();
            
            log.info("발견된 에이전트: {}개", agents.size());
            
            // 각 에이전트를 단순하게 초기화만 수행
            for (BaseAgent agent : agents) {
                try {
                    // 기본 초기화만 수행 (복잡한 연결 제거)
                    agent.initializeForSequentialUse();
                    
                    log.info("✅ 순차 실행용 에이전트 준비 완료: {}", agent.getAgentType());
                    
                } catch (Exception e) {
                    log.error("❌ 에이전트 초기화 실패: {} - {}", 
                             agent.getAgentType(), e.getMessage());
                    // 하나 실패해도 전체는 계속 진행
                }
            }
            
            // JavaScript 오케스트레이터와 연동을 위한 상태 설정
            setupForJavaScriptIntegration(agents);
            
            log.info("🎯 순차적 에이전트 시스템 준비 완료 - JavaScript 오케스트레이터에서 제어");
            log.info("=== 순차적 에이전트 시스템 초기화 완료 ===");
            
        } catch (Exception e) {
            log.error("순차적 에이전트 시스템 초기화 중 오류 발생", e);
            // 실패해도 시스템은 계속 동작하도록 예외를 던지지 않음
            log.warn("⚠️ 일부 에이전트 초기화 실패, 시스템은 계속 동작합니다");
        }
    }
    
    /**
     * JavaScript 오케스트레이터와 연동 설정
     */
    private void setupForJavaScriptIntegration(Collection<BaseAgent> agents) {
        // 각 에이전트를 JavaScript에서 호출할 수 있도록 Spring Bean으로 등록된 상태 확인
        for (BaseAgent agent : agents) {
            String beanName = convertToSpringBeanName(agent.getAgentType());
            log.debug("📝 JavaScript 연동 준비: {} -> Bean 이름: {}", agent.getAgentType(), beanName);
        }
        
        log.info("🔗 JavaScript 오케스트레이터 연동 준비 완료");
    }
    
    /**
     * 에이전트 타입을 Spring Bean 이름으로 변환
     */
    private String convertToSpringBeanName(String agentType) {
        return agentType.toLowerCase().replace("_", "") + "Agent";
    }
    
    /**
     * 순차 실행용 단순한 비동기 실행기
     */
    @Bean(name = "sequentialAgentExecutor")
    public Executor sequentialAgentExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 순차 실행에 최적화된 단순한 설정
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Sequential-Agent-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        
        executor.initialize();
        
        log.info("순차 실행용 태스크 실행기 초기화 완료");
        return executor;
    }
    
    /**
     * 순차적 에이전트 상태 모니터
     */
    @Bean
    public SequentialAgentMonitor sequentialAgentMonitor() {
        return new SequentialAgentMonitor();
    }
    
    /**
     * 순차적 에이전트 상태 모니터 클래스
     */
    public static class SequentialAgentMonitor {
        private final java.util.Map<String, AgentExecutionInfo> executionHistory = new java.util.concurrent.ConcurrentHashMap<>();
        
        /**
         * 에이전트 실행 기록
         */
        public void recordExecution(String agentType, boolean success, long executionTime, String result) {
            AgentExecutionInfo info = executionHistory.computeIfAbsent(agentType, k -> new AgentExecutionInfo(agentType));
            info.addExecution(success, executionTime, result);
            
            log.debug("📊 에이전트 실행 기록: {} - 성공: {}, 실행시간: {}ms", agentType, success, executionTime);
        }
        
        /**
         * 전체 시스템 상태 조회
         */
        public java.util.Map<String, Object> getSystemStatus() {
            java.util.Map<String, Object> status = new java.util.HashMap<>();
            
            status.put("totalAgents", executionHistory.size());
            status.put("totalExecutions", executionHistory.values().stream().mapToInt(info -> info.totalExecutions).sum());
            status.put("successRate", calculateOverallSuccessRate());
            status.put("averageExecutionTime", calculateAverageExecutionTime());
            status.put("lastUpdate", LocalDateTime.now());
            
            return status;
        }
        
        /**
         * 개별 에이전트 상태 조회
         */
        public java.util.Map<String, Object> getAgentStatus(String agentType) {
            AgentExecutionInfo info = executionHistory.get(agentType);
            if (info == null) {
                return java.util.Map.of("error", "Agent not found: " + agentType);
            }
            
            return java.util.Map.of(
                "agentType", agentType,
                "totalExecutions", info.totalExecutions,
                "successfulExecutions", info.successfulExecutions,
                "successRate", info.getSuccessRate(),
                "averageExecutionTime", info.getAverageExecutionTime(),
                "lastExecution", info.lastExecution
            );
        }
        
        private double calculateOverallSuccessRate() {
            int totalExecutions = executionHistory.values().stream().mapToInt(info -> info.totalExecutions).sum();
            int successfulExecutions = executionHistory.values().stream().mapToInt(info -> info.successfulExecutions).sum();
            
            return totalExecutions > 0 ? (double) successfulExecutions / totalExecutions : 0.0;
        }
        
        private double calculateAverageExecutionTime() {
            return executionHistory.values().stream()
                .mapToDouble(AgentExecutionInfo::getAverageExecutionTime)
                .average()
                .orElse(0.0);
        }
        
        /**
         * 에이전트 실행 정보 클래스
         */
        private static class AgentExecutionInfo {
            private final String agentType;
            private int totalExecutions = 0;
            private int successfulExecutions = 0;
            private long totalExecutionTime = 0;
            private LocalDateTime lastExecution;
            private String lastResult;
            
            public AgentExecutionInfo(String agentType) {
                this.agentType = agentType;
            }
            
            public void addExecution(boolean success, long executionTime, String result) {
                totalExecutions++;
                totalExecutionTime += executionTime;
                lastExecution = LocalDateTime.now();
                lastResult = result;
                
                if (success) {
                    successfulExecutions++;
                }
            }
            
            public double getSuccessRate() {
                return totalExecutions > 0 ? (double) successfulExecutions / totalExecutions : 0.0;
            }
            
            public double getAverageExecutionTime() {
                return totalExecutions > 0 ? (double) totalExecutionTime / totalExecutions : 0.0;
            }
        }
    }
}