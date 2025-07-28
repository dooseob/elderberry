package com.globalcarelink.agents.context;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.events.AgentEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Predicate;

/**
 * 에이전트 간 유기적 데이터 공유를 위한 공유 컨텍스트
 * 목적: 1) Thread-safe한 데이터 공유 저장소
 *      2) 에이전트 간 실시간 정보 동기화
 *      3) 학습 패턴 및 경험 공유
 *      4) 자율적 협업을 위한 컨텍스트 제공
 */
@Slf4j
@Component
public class SharedContext {
    
    // 에이전트 등록 및 관리
    private final Map<String, BaseAgent> registeredAgents = new ConcurrentHashMap<>();
    private final Map<String, AgentProfile> agentProfiles = new ConcurrentHashMap<>();
    
    // 공유 데이터 저장소
    private final Map<String, ContextData> sharedData = new ConcurrentHashMap<>();
    private final Map<String, List<ContextDataObserver>> dataObservers = new ConcurrentHashMap<>();
    
    // 학습 패턴 공유
    private final Map<String, LearningPattern> sharedLearningPatterns = new ConcurrentHashMap<>();
    
    // 실시간 협업 상태
    private final Map<String, CollaborationSession> activeSessions = new ConcurrentHashMap<>();
    
    /**
     * 에이전트 등록 - 자율적 네트워킹의 시작점
     */
    public void registerAgent(BaseAgent agent) {
        String agentType = agent.getAgentType();
        registeredAgents.put(agentType, agent);
        
        // 에이전트 프로필 생성
        AgentProfile profile = AgentProfile.builder()
            .agentId(agent.getAgentId())
            .agentType(agentType)
            .capabilities(extractCapabilities(agent))
            .registrationTime(LocalDateTime.now())
            .isActive(true)
            .collaborationHistory(new ArrayList<>())
            .build();
            
        agentProfiles.put(agentType, profile);
        
        // 다른 에이전트들에게 새 에이전트 등록 알림
        broadcastAgentRegistration(profile);
        
        log.info("에이전트 등록: {} - 능력: {}", agentType, profile.getCapabilities());
    }
    
    /**
     * 에이전트 등록 해제
     */
    public void unregisterAgent(BaseAgent agent) {
        String agentType = agent.getAgentType();
        registeredAgents.remove(agentType);
        
        AgentProfile profile = agentProfiles.remove(agentType);
        if (profile != null) {
            profile.setActive(false);
            profile.setUnregistrationTime(LocalDateTime.now());
            
            // 진행 중인 협업 세션 정리
            cleanupCollaborationSessions(agentType);
            
            log.info("에이전트 등록 해제: {}", agentType);
        }
    }
    
    /**
     * 유기적 데이터 공유 - 관심있는 모든 에이전트에게 자동 알림
     */
    public <T> void setData(String key, T data) {
        ContextData contextData = ContextData.builder()
            .key(key)
            .value(data)
            .dataType(data.getClass().getSimpleName())
            .timestamp(LocalDateTime.now())
            .ttl(java.time.Duration.ofHours(24)) // 기본 24시간 보존
            .build();
            
        sharedData.put(key, contextData);
        
        // 관심있는 에이전트들에게 자동 알림
        notifyDataObservers(key, contextData);
        
        log.debug("공유 데이터 업데이트: {} - 타입: {}", key, contextData.getDataType());
    }
    
    /**
     * 타입 안전한 데이터 조회
     */
    @SuppressWarnings("unchecked")
    public <T> T getData(String key, Class<T> type) {
        ContextData contextData = sharedData.get(key);
        if (contextData == null) {
            return null;
        }
        
        // TTL 체크
        if (isExpired(contextData)) {
            sharedData.remove(key);
            return null;
        }
        
        Object value = contextData.getValue();
        if (type.isInstance(value)) {
            return type.cast(value);
        }
        
        return null;
    }
    
    /**
     * 데이터 변경 관찰자 등록
     */
    public void observeData(String dataKey, String observerAgentType, ContextDataObserver observer) {
        dataObservers.computeIfAbsent(dataKey, k -> new CopyOnWriteArrayList<>()).add(observer);
        log.debug("데이터 관찰자 등록: {} -> {}", observerAgentType, dataKey);
    }
    
    /**
     * 학습 패턴 공유 - 다른 에이전트들이 학습할 수 있도록
     */
    public void shareLearningPattern(String patternKey, Object patternData, String sourceAgentType) {
        LearningPattern pattern = LearningPattern.builder()
            .patternKey(patternKey)
            .patternData(patternData)
            .sourceAgentType(sourceAgentType)
            .confidence(0.8) // 기본 신뢰도
            .createdTime(LocalDateTime.now())
            .usageCount(0)
            .build();
            
        sharedLearningPatterns.put(patternKey, pattern);
        
        // 학습 패턴을 다른 에이전트들과 공유
        AgentEvent learningEvent = AgentEvent.createLearningShare(
            sourceAgentType, sourceAgentType, patternKey, patternData);
            
        broadcastToRelevantAgents(learningEvent);
        
        log.info("학습 패턴 공유: {} by {}", patternKey, sourceAgentType);
    }
    
    /**
     * 에이전트 간 협업 세션 시작
     */
    public String startCollaborationSession(String initiatorType, String targetType, String purpose) {
        String sessionId = UUID.randomUUID().toString();
        
        CollaborationSession session = CollaborationSession.builder()
            .sessionId(sessionId)  
            .initiatorAgentType(initiatorType)
            .targetAgentType(targetType)
            .purpose(purpose)
            .startTime(LocalDateTime.now())
            .status(CollaborationStatus.ACTIVE)
            .messageHistory(new ArrayList<>())
            .build();
            
        activeSessions.put(sessionId, session);
        
        // 협업 히스토리 업데이트
        updateCollaborationHistory(initiatorType, targetType, purpose);
        
        log.info("협업 세션 시작: {} -> {} (목적: {})", initiatorType, targetType, purpose);
        return sessionId;
    }
    
    /**
     * 능력 기반 에이전트 찾기 - 유기적 협업의 핵심
     */
    public List<String> findAgentsByCapability(String neededCapability) {
        return agentProfiles.values().stream()
            .filter(profile -> profile.isActive())
            .filter(profile -> profile.getCapabilities().contains(neededCapability))
            .map(AgentProfile::getAgentType)
            .sorted((a1, a2) -> {
                // 협업 경험이 많은 에이전트 우선
                AgentProfile p1 = agentProfiles.get(a1);
                AgentProfile p2 = agentProfiles.get(a2);
                return Integer.compare(p2.getCollaborationHistory().size(), 
                                     p1.getCollaborationHistory().size());
            })
            .toList();
    }
    
    /**
     * 에이전트 상태 조회
     */
    public Map<String, Object> getAgentSystemStatus() {
        return Map.of(
            "totalAgents", registeredAgents.size(),
            "activeAgents", (int) agentProfiles.values().stream().filter(AgentProfile::isActive).count(),
            "activeSessions", activeSessions.size(),
            "sharedDataItems", sharedData.size(),
            "learningPatterns", sharedLearningPatterns.size(),
            "lastUpdate", LocalDateTime.now()
        );
    }
    
    // Helper methods
    private Set<String> extractCapabilities(BaseAgent agent) {
        // 에이전트 타입별 능력 매핑
        Set<String> capabilities = new HashSet<>();
        
        switch (agent.getAgentType()) {
            case "CLAUDE_GUIDE":
                capabilities.addAll(Set.of("LEARNING", "GUIDANCE", "PATTERN_ANALYSIS", "PREDICTION"));
                break;
            case "PORTFOLIO_TROUBLESHOOT":
                capabilities.addAll(Set.of("TROUBLESHOOTING", "DOCUMENTATION", "PORTFOLIO_CREATION", "STAR_METHODOLOGY"));
                break;
            case "UNIFIED_TROUBLESHOOTING":
                capabilities.addAll(Set.of("ERROR_ANALYSIS", "DOCUMENT_GENERATION", "MULTI_FORMAT_OUTPUT"));
                break;
            case "API_DOCUMENTATION":
                capabilities.addAll(Set.of("API_ANALYSIS", "SWAGGER_GENERATION", "DOCUMENTATION"));
                break;
        }
        
        return capabilities;
    }
    
    private void broadcastAgentRegistration(AgentProfile profile) {
        AgentEvent registrationEvent = AgentEvent.builder()
            .type("AGENT_REGISTERED")
            .sourceAgentId("SHARED_CONTEXT")
            .sourceAgentType("SYSTEM")
            .data(profile)
            .build();
            
        broadcastToAllAgents(registrationEvent);
    }
    
    private void broadcastToAllAgents(AgentEvent event) {
        registeredAgents.values().forEach(agent -> {
            try {
                if (agent.isActive()) {
                    agent.handleEvent(event);
                }
            } catch (Exception e) {
                log.error("에이전트 이벤트 브로드캐스트 실패: {}", agent.getAgentType(), e);
            }
        });
    }
    
    private void broadcastToRelevantAgents(AgentEvent event) {
        registeredAgents.values().forEach(agent -> {
            try {
                if (agent.isActive()) {
                    AgentProfile profile = agentProfiles.get(agent.getAgentType());
                    if (profile != null && event.isRelevantFor(agent.getAgentType(), profile.getCapabilities())) {
                        agent.handleEvent(event);
                    }
                }
            } catch (Exception e) {
                log.error("관련 에이전트 이벤트 전송 실패: {}", agent.getAgentType(), e);
            }
        });
    }
    
    private void notifyDataObservers(String key, ContextData data) {
        List<ContextDataObserver> observers = dataObservers.get(key);
        if (observers != null) {
            observers.forEach(observer -> {
                try {
                    observer.onDataChanged(key, data);
                } catch (Exception e) {
                    log.error("데이터 관찰자 알림 실패: {}", key, e);
                }
            });
        }
    }
    
    private boolean isExpired(ContextData data) {
        if (data.getTtl() == null) {
            return false;
        }
        return data.getTimestamp().plus(data.getTtl()).isBefore(LocalDateTime.now());
    }
    
    private void cleanupCollaborationSessions(String agentType) {
        activeSessions.entrySet().removeIf(entry -> {
            CollaborationSession session = entry.getValue();
            if (agentType.equals(session.getInitiatorAgentType()) || 
                agentType.equals(session.getTargetAgentType())) {
                session.setStatus(CollaborationStatus.TERMINATED);
                session.setEndTime(LocalDateTime.now());
                return true;
            }
            return false;
        });
    }
    
    private void updateCollaborationHistory(String initiatorType, String targetType, String purpose) {
        AgentProfile initiatorProfile = agentProfiles.get(initiatorType);
        AgentProfile targetProfile = agentProfiles.get(targetType);
        
        if (initiatorProfile != null) {
            initiatorProfile.getCollaborationHistory().add(
                CollaborationRecord.builder()
                    .partnerAgentType(targetType)
                    .purpose(purpose)
                    .timestamp(LocalDateTime.now())
                    .build()
            );
        }
        
        if (targetProfile != null) {
            targetProfile.getCollaborationHistory().add(
                CollaborationRecord.builder()
                    .partnerAgentType(initiatorType)
                    .purpose(purpose)
                    .timestamp(LocalDateTime.now())
                    .build()
            );
        }
    }
    
    // Inner classes
    @lombok.Data
    @lombok.Builder
    public static class AgentProfile {
        private String agentId;
        private String agentType;
        private Set<String> capabilities;
        private LocalDateTime registrationTime;
        private LocalDateTime unregistrationTime;
        private boolean isActive;
        private List<CollaborationRecord> collaborationHistory;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class ContextData {
        private String key;
        private Object value;
        private String dataType;
        private LocalDateTime timestamp;
        private java.time.Duration ttl;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class LearningPattern {
        private String patternKey;
        private Object patternData;
        private String sourceAgentType;
        private double confidence;
        private LocalDateTime createdTime;
        private int usageCount;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class CollaborationSession {
        private String sessionId;
        private String initiatorAgentType;
        private String targetAgentType;
        private String purpose;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private CollaborationStatus status;
        private List<Object> messageHistory;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class CollaborationRecord {
        private String partnerAgentType;
        private String purpose;
        private LocalDateTime timestamp;
    }
    
    public enum CollaborationStatus {
        ACTIVE, COMPLETED, TERMINATED, PAUSED
    }
    
    @FunctionalInterface
    public interface ContextDataObserver {
        void onDataChanged(String key, ContextData data);
    }
}