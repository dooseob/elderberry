package com.globalcarelink.agents;

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
    
    protected final String agentId;
    protected final String agentType;
    protected boolean isActive = false;
    
    protected BaseAgent(String agentType) {
        this.agentType = agentType;
        this.agentId = agentType + "_" + System.currentTimeMillis();
    }
    
    /**
     * 에이전트 초기화
     */
    public void initialize() {
        logger.info("에이전트 초기화: {} (ID: {})", agentType, agentId);
        
        // 이벤트 리스너 등록
        eventBus.subscribe(this::handleEvent);
        
        // 공유 컨텍스트에 에이전트 등록
        sharedContext.registerAgent(this);
        
        // 에이전트별 초기화 로직
        doInitialize();
        
        isActive = true;
        
        // 초기화 완료 이벤트 발송
        publishEvent("AGENT_INITIALIZED", Map.of(
            "agentId", agentId,
            "agentType", agentType,
            "timestamp", LocalDateTime.now()
        ));
    }
    
    /**
     * 에이전트별 초기화 로직 (하위 클래스에서 구현)
     */
    protected abstract void doInitialize();
    
    /**
     * 이벤트 처리 (하위 클래스에서 오버라이드)
     */
    protected void handleEvent(AgentEvent event) {
        if (shouldProcessEvent(event)) {
            logger.debug("이벤트 처리: {} by {}", event.getType(), agentId);
            processEvent(event);
        }
    }
    
    /**
     * 이벤트 처리 여부 결정
     */
    protected boolean shouldProcessEvent(AgentEvent event) {
        // 자신이 발송한 이벤트는 처리하지 않음
        return !agentId.equals(event.getSourceAgentId());
    }
    
    /**
     * 실제 이벤트 처리 로직 (하위 클래스에서 구현)
     */
    protected abstract void processEvent(AgentEvent event);
    
    /**
     * 이벤트 발송
     */
    protected void publishEvent(String eventType, Object data) {
        AgentEvent event = AgentEvent.builder()
            .type(eventType)
            .sourceAgentId(agentId)
            .sourceAgentType(agentType)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
            
        eventBus.publish(event);
        
        logger.debug("이벤트 발송: {} from {}", eventType, agentId);
    }
    
    /**
     * 다른 에이전트에게 직접 메시지 전송
     */
    protected CompletableFuture<Object> sendMessage(String targetAgentType, String messageType, Object data) {
        return eventBus.sendDirectMessage(agentId, targetAgentType, messageType, data);
    }
    
    /**
     * 공유 컨텍스트에서 데이터 조회
     */
    protected <T> T getSharedData(String key, Class<T> type) {
        return sharedContext.getData(key, type);
    }
    
    /**
     * 공유 컨텍스트에 데이터 저장
     */
    protected void setSharedData(String key, Object data) {
        sharedContext.setData(key, data);
        
        // 데이터 변경 이벤트 발송
        publishEvent("SHARED_DATA_UPDATED", Map.of(
            "key", key,
            "updatedBy", agentId,
            "timestamp", LocalDateTime.now()
        ));
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
     * 에이전트 종료
     */
    public void shutdown() {
        logger.info("에이전트 종료: {} (ID: {})", agentType, agentId);
        
        isActive = false;
        
        // 종료 이벤트 발송
        publishEvent("AGENT_SHUTDOWN", Map.of(
            "agentId", agentId,
            "agentType", agentType,
            "timestamp", LocalDateTime.now()
        ));
        
        // 이벤트 리스너 해제
        eventBus.unsubscribe(this::handleEvent);
        
        // 공유 컨텍스트에서 제거
        sharedContext.unregisterAgent(this);
    }
    
    // Getters
    public String getAgentId() { return agentId; }
    public String getAgentType() { return agentType; }
    public boolean isActive() { return isActive; }
}