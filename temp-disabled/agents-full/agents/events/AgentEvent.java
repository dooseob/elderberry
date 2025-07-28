package com.globalcarelink.agents.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * 에이전트 간 유기적 통신을 위한 이벤트 클래스
 * 목적: 1) 에이전트 간 자율적 협업 지원
 *      2) 필요에 따른 상호 호출 메커니즘
 *      3) 컨텍스트 기반 데이터 공유
 */
@Data
@Builder
public class AgentEvent {
    
    private final String eventId;
    private final String type;
    
    // 발신자 정보
    private final String sourceAgentId;
    private final String sourceAgentType;
    
    // 수신자 정보 (선택적 - 브로드캐스트 vs 직접 통신)
    private final String targetAgentId;
    private final String targetAgentType;
    
    // 협업 요청 정보
    private final CollaborationRequest collaborationRequest;
    private final AgentCapabilityNeeded capabilityNeeded;
    
    // 데이터 및 메타데이터
    private final Object data;
    private final Map<String, Object> metadata;
    private final LocalDateTime timestamp;
    
    // 응답 처리
    private final String correlationId;  // 요청-응답 매칭용
    private final boolean requiresResponse;
    private final String responseChannel;
    
    public static AgentEventBuilder builder() {
        return new AgentEventBuilder()
            .eventId(UUID.randomUUID().toString())
            .timestamp(LocalDateTime.now())
            .requiresResponse(false);
    }
    
    /**
     * 협업 요청을 위한 이벤트 생성
     */
    public static AgentEvent createCollaborationRequest(
            String sourceAgentId, 
            String sourceAgentType,
            AgentCapabilityNeeded capability,
            Object requestData) {
        
        return AgentEvent.builder()
            .type("COLLABORATION_REQUEST")
            .sourceAgentId(sourceAgentId)
            .sourceAgentType(sourceAgentType)
            .capabilityNeeded(capability)
            .data(requestData)
            .requiresResponse(true)
            .correlationId(UUID.randomUUID().toString())
            .collaborationRequest(CollaborationRequest.builder()
                .requestType(capability.getCapabilityType())
                .urgency(CollaborationUrgency.NORMAL)
                .expectedResponseTime(java.time.Duration.ofSeconds(30))
                .build())
            .build();
    }
    
    /**
     * 자율적 정보 공유를 위한 이벤트 생성
     */
    public static AgentEvent createInformationShare(
            String sourceAgentId,
            String sourceAgentType, 
            String informationType,
            Object information) {
        
        return AgentEvent.builder()
            .type("INFORMATION_SHARE")
            .sourceAgentId(sourceAgentId)
            .sourceAgentType(sourceAgentType)
            .data(information)
            .metadata(Map.of(
                "informationType", informationType,
                "shareScope", "ALL_INTERESTED_AGENTS",
                "retentionTime", java.time.Duration.ofHours(24)
            ))
            .build();
    }
    
    /**
     * 학습 패턴 공유를 위한 이벤트 생성
     */
    public static AgentEvent createLearningShare(
            String sourceAgentId,
            String sourceAgentType,
            String patternType,
            Object learningData) {
        
        return AgentEvent.builder()
            .type("LEARNING_PATTERN_SHARE")
            .sourceAgentId(sourceAgentId)
            .sourceAgentType(sourceAgentType)
            .data(learningData)
            .metadata(Map.of(
                "patternType", patternType,
                "confidence", 0.8,
                "applicableAgents", "ALL",
                "learningSource", "REAL_WORLD_EXPERIENCE"
            ))
            .build();
    }
    
    /**
     * 협업 응답 생성
     */
    public AgentEvent createResponse(String respondingAgentId, String respondingAgentType, Object responseData) {
        return AgentEvent.builder()
            .type("COLLABORATION_RESPONSE")
            .sourceAgentId(respondingAgentId)
            .sourceAgentType(respondingAgentType)
            .targetAgentId(this.sourceAgentId)
            .targetAgentType(this.sourceAgentType)
            .correlationId(this.correlationId)
            .data(responseData)
            .metadata(Map.of(
                "originalRequestType", this.type,
                "responseStatus", "SUCCESS",
                "processingTime", java.time.Duration.ofMillis(System.currentTimeMillis() - 
                    this.timestamp.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli())
            ))
            .build();
    }
    
    /**
     * 특정 에이전트 타입에게만 전송되는 이벤트인지 확인
     */
    public boolean isTargetedTo(String agentType) {
        return targetAgentType != null && targetAgentType.equals(agentType);
    }
    
    /**
     * 브로드캐스트 이벤트인지 확인
     */
    public boolean isBroadcast() {
        return targetAgentType == null;
    }
    
    /**
     * 응답이 필요한 이벤트인지 확인
     */
    public boolean needsResponse() {
        return requiresResponse && correlationId != null;
    }
    
    /**
     * 에이전트가 관심을 가질만한 이벤트인지 판단
     */
    public boolean isRelevantFor(String agentType, java.util.Set<String> agentCapabilities) {
        // 직접 타겟팅된 경우
        if (isTargetedTo(agentType)) {
            return true;
        }
        
        // 협업 요청이고 필요한 능력을 가진 경우
        if (capabilityNeeded != null && agentCapabilities.contains(capabilityNeeded.getCapabilityType())) {
            return true;
        }
        
        // 학습 패턴 공유의 경우 모든 에이전트가 관심
        if ("LEARNING_PATTERN_SHARE".equals(type)) {
            return true;
        }
        
        // 정보 공유의 경우 메타데이터 기반 관심도 판단
        if ("INFORMATION_SHARE".equals(type) && metadata != null) {
            String shareScope = (String) metadata.get("shareScope");
            return "ALL_INTERESTED_AGENTS".equals(shareScope);
        }
        
        return false;
    }
    
    // Inner classes
    @Data
    @Builder
    public static class CollaborationRequest {
        private String requestType;
        private CollaborationUrgency urgency;
        private java.time.Duration expectedResponseTime;
        private Map<String, Object> requestParameters;
    }
    
    @Data
    @Builder  
    public static class AgentCapabilityNeeded {
        private String capabilityType;
        private String specificSkill;
        private double minimumConfidence;
        private Map<String, Object> requirements;
    }
    
    public enum CollaborationUrgency {
        LOW, NORMAL, HIGH, CRITICAL
    }
}