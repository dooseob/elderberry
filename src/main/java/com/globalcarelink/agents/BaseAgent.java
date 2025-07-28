package com.globalcarelink.agents;

import com.globalcarelink.agents.config.AgentEnvironmentConfig;
import com.globalcarelink.agents.context.SharedContext;
import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.events.AgentEventBus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 모든 에이전트의 기반 클래스
 * 공통 기능과 에이전트 간 통신 메커니즘 제공
 */
public abstract class BaseAgent {
    
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    
    @Autowired
    protected SharedContext sharedContext;
    
    @Autowired
    protected AgentEventBus eventBus;
    
    @Autowired
    protected AgentEnvironmentConfig environmentConfig;
    
    protected final String agentId;
    protected final String agentType;
    protected boolean isActive = false;
    
    protected BaseAgent(String agentType) {
        this.agentType = agentType;
        this.agentId = agentType + "_" + System.currentTimeMillis();
    }
    
    /**
     * 순차 실행용 단순한 초기화
     */
    public void initializeForSequentialUse() {
        logger.info("순차 실행용 에이전트 초기화: {} (ID: {})", agentType, agentId);
        
        // 복잡한 이벤트 시스템 대신 기본 초기화만 수행
        doInitialize();
        
        isActive = true;
        
        logger.debug("순차 실행용 에이전트 준비 완료: {}", agentType);
    }
    
    /**
     * 기존 복잡한 초기화 (사용 안함)
     */
    @Deprecated
    public void initialize() {
        // 복잡한 협업 시스템은 사용하지 않음
        initializeForSequentialUse();
    }
    
    /**
     * 에이전트별 초기화 로직 (하위 클래스에서 구현)
     */
    protected abstract void doInitialize();
    
    /**
     * 순차 실행용 단순한 처리 메서드
     */
    public abstract Object executeSequentially(Map<String, Object> input);
    
    /**
     * 기존 이벤트 처리 (사용 안함)
     */
    @Deprecated
    protected void handleEvent(AgentEvent event) {
        // 순차 실행 방식에서는 사용하지 않음
        logger.debug("이벤트 기반 처리는 사용하지 않음: {}", event.getType());
    }
    
    /**
     * 기존 이벤트 처리 로직 (사용 안함)
     */
    @Deprecated
    protected void processEvent(AgentEvent event) {
        // 순차 실행 방식에서는 사용하지 않음
    }
    
    /**
     * 환경별 결과 로깅 (프로덕션에서는 최소화)
     */
    protected void logResult(String resultType, Object data) {
        if (environmentConfig.shouldLogAgentDetails()) {
            logger.info("📋 {} 결과: {}", resultType, data.toString());
        } else {
            logger.debug("📋 {} 결과: {}", resultType, resultType); // 프로덕션에서는 타입만
        }
    }
    
    /**
     * 환경별 디버그 로깅
     */
    protected void logDebugInfo(String message, Object... args) {
        if (environmentConfig.shouldLogAgentDetails()) {
            logger.debug("🔍 DEBUG [{}]: " + message, agentType, args);
        } else {
            // 프로덕션에서는 로그 출력 안함
        }
    }
    
    /**
     * 환경별 성능 로깅
     */
    protected void logPerformance(String operation, long executionTime) {
        if (environmentConfig.isMonitoringEnabled()) {
            logger.info("⚡ 성능 [{}] {}: {}ms", agentType, operation, executionTime);
        } else if (executionTime > environmentConfig.getExecutionTimeout()) {
            // 프로덕션에서는 타임아웃 초과시만 경고
            logger.warn("⚠️ 타임아웃 주의 [{}] {}: {}ms", agentType, operation, executionTime);
        }
    }
    
    /**
     * 환경별 에러 로깅
     */
    protected void logError(String operation, Throwable error) {
        if (environmentConfig.shouldLogAgentDetails()) {
            logger.error("❌ 에러 [{}] {}: {}", agentType, operation, error.getMessage(), error);
        } else {
            // 프로덕션에서는 스택트레이스 없이 메시지만
            logger.error("❌ 에러 [{}] {}: {}", agentType, operation, error.getMessage());
        }
    }
    
    /**
     * 단순한 데이터 저장 (환경별 로깅)
     */
    protected void saveData(String key, Object data) {
        if (environmentConfig.shouldLogAgentDetails()) {
            logger.debug("💾 데이터 저장: {} = {}", key, data);
        }
        // 실제 저장 로직은 여기에 추가 (예: Redis, Database 등)
    }
    
    /**
     * 에이전트 상태 정보
     */
    public Map<String, Object> getStatus() {
        return Map.of(
            "agentId", agentId,
            "agentType", agentType,
            "isActive", isActive,
            "lastActivity", LocalDateTime.now()
        );
    }
    
    /**
     * 순차 실행용 단순한 종료
     */
    public void shutdown() {
        logger.info("순차 실행용 에이전트 종료: {} (ID: {})", agentType, agentId);
        
        isActive = false;
        
        logger.debug("에이전트 종료 완료: {}", agentType);
    }
    
    // Getters
    public String getAgentId() { return agentId; }
    public String getAgentType() { return agentType; }
    public boolean isActive() { return isActive; }
}