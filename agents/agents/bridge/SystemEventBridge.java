package com.globalcarelink.agents.bridge;

import com.globalcarelink.agents.events.AgentEvent;
import com.globalcarelink.agents.events.AgentEventBus;
import com.globalcarelink.common.event.ErrorEvent;
import com.globalcarelink.common.event.PerformanceEvent;
import com.globalcarelink.common.event.SecurityEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Spring 이벤트와 에이전트 이벤트 간 브리지
 * 목적: 1) 기존 Spring 이벤트를 에이전트 시스템으로 전달
 *      2) 양방향 이벤트 플로우 제공
 *      3) 이벤트 변환 및 라우팅
 *      4) 시스템 통합 지점 역할
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SystemEventBridge {
    
    private final AgentEventBus agentEventBus;
    
    /**
     * 에러 이벤트를 에이전트 시스템으로 전달
     */
    @EventListener
    @Async
    public void handleErrorEvent(ErrorEvent errorEvent) {
        log.debug("에러 이벤트 수신: {} - {}", errorEvent.getEventId(), errorEvent.getErrorType());
        
        try {
            // 에이전트 이벤트로 변환
            AgentEvent agentEvent = AgentEvent.builder()
                .type("SYSTEM_ERROR_DETECTED")
                .sourceAgentId("SYSTEM_EVENT_BRIDGE")
                .sourceAgentType("SYSTEM")
                .data(errorEvent)
                .metadata(Map.of(
                    "originalEventType", "ErrorEvent",
                    "severity", errorEvent.getSeverity(),
                    "errorCategory", errorEvent.getErrorCategory(),
                    "requiresImmediateAttention", isHighSeverityError(errorEvent),
                    "suggestedCollaboration", suggestCollaborationForError(errorEvent)
                ))
                .build();
            
            // 에이전트들에게 브로드캐스트
            agentEventBus.publish(agentEvent);
            
            // 심각한 에러의 경우 특별 처리
            if (isHighSeverityError(errorEvent)) {
                handleCriticalError(errorEvent);
            }
            
        } catch (Exception e) {
            log.error("에러 이벤트 브리지 처리 실패: {}", errorEvent.getEventId(), e);
        }
    }
    
    /**
     * 성능 이벤트를 에이전트 시스템으로 전달
     */
    @EventListener
    @Async
    public void handlePerformanceEvent(PerformanceEvent performanceEvent) {
        log.debug("성능 이벤트 수신: {} - {}ms", 
                 performanceEvent.getEventId(), performanceEvent.getExecutionTimeMs());
        
        try {
            // 성능 임계값 초과 여부 확인
            boolean isPerformanceIssue = isPerformanceIssue(performanceEvent);
            
            AgentEvent agentEvent = AgentEvent.builder()
                .type(isPerformanceIssue ? "PERFORMANCE_DEGRADATION" : "PERFORMANCE_MONITORING")
                .sourceAgentId("SYSTEM_EVENT_BRIDGE")
                .sourceAgentType("SYSTEM")
                .data(performanceEvent)
                .metadata(Map.of(
                    "originalEventType", "PerformanceEvent",
                    "isIssue", isPerformanceIssue,
                    "operationType", performanceEvent.getOperationType(),
                    "thresholdExceeded", calculateThresholdExceedance(performanceEvent),
                    "suggestedOptimization", suggestOptimizationStrategy(performanceEvent)
                ))
                .build();
            
            agentEventBus.publish(agentEvent);
            
        } catch (Exception e) {
            log.error("성능 이벤트 브리지 처리 실패: {}", performanceEvent.getEventId(), e);
        }
    }
    
    /**
     * 보안 이벤트를 에이전트 시스템으로 전달
     */
    @EventListener
    @Async
    public void handleSecurityEvent(SecurityEvent securityEvent) {
        log.warn("보안 이벤트 수신: {} - {} (위험도: {})", 
                 securityEvent.getEventId(), 
                 securityEvent.getSecurityEventType(),
                 securityEvent.calculateRiskScore());
        
        try {
            AgentEvent agentEvent = AgentEvent.builder()
                .type("SECURITY_INCIDENT_DETECTED")
                .sourceAgentId("SYSTEM_EVENT_BRIDGE")
                .sourceAgentType("SYSTEM")
                .data(securityEvent)
                .metadata(Map.of(
                    "originalEventType", "SecurityEvent",
                    "riskScore", securityEvent.calculateRiskScore(),
                    "securityEventType", securityEvent.getSecurityEventType(),
                    "requiresImmediateResponse", securityEvent.calculateRiskScore() > 70,
                    "suggestedActions", suggestSecurityActions(securityEvent)
                ))
                .build();
            
            agentEventBus.publish(agentEvent);
            
            // 고위험 보안 이벤트의 경우 즉시 대응
            if (securityEvent.calculateRiskScore() > 70) {
                handleCriticalSecurityEvent(securityEvent);
            }
            
        } catch (Exception e) {
            log.error("보안 이벤트 브리지 처리 실패: {}", securityEvent.getEventId(), e);
        }
    }
    
    /**
     * 일반 Spring ApplicationEvent를 에이전트 이벤트로 변환
     */
    @EventListener
    @Async
    public void handleGenericApplicationEvent(org.springframework.context.ApplicationEvent event) {
        // 이미 처리된 이벤트들은 제외
        if (event instanceof ErrorEvent || 
            event instanceof PerformanceEvent || 
            event instanceof SecurityEvent) {
            return;
        }
        
        log.debug("일반 애플리케이션 이벤트 수신: {}", event.getClass().getSimpleName());
        
        try {
            AgentEvent agentEvent = AgentEvent.builder()
                .type("SPRING_APPLICATION_EVENT")
                .sourceAgentId("SYSTEM_EVENT_BRIDGE")
                .sourceAgentType("SYSTEM")
                .data(event)
                .metadata(Map.of(
                    "originalEventClass", event.getClass().getSimpleName(),
                    "timestamp", LocalDateTime.now(),
                    "springEventSource", event.getSource() != null ? 
                        event.getSource().getClass().getSimpleName() : "UNKNOWN"
                ))
                .build();
            
            agentEventBus.publish(agentEvent);
            
        } catch (Exception e) {
            log.error("일반 애플리케이션 이벤트 브리지 처리 실패: {}", 
                     event.getClass().getSimpleName(), e);
        }
    }
    
    /**
     * 에이전트 이벤트를 Spring 이벤트로 역변환 (필요시)
     */
    public void publishSpringEvent(AgentEvent agentEvent) {
        // 특정 에이전트 이벤트를 Spring 이벤트로 변환하여 기존 시스템과 호환
        try {
            Object springEvent = convertToSpringEvent(agentEvent);
            if (springEvent != null) {
                // ApplicationEventPublisher를 통해 발행
                log.debug("에이전트 이벤트를 Spring 이벤트로 변환: {} -> {}", 
                         agentEvent.getType(), springEvent.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("에이전트 이벤트 Spring 변환 실패: {}", agentEvent.getType(), e);
        }
    }
    
    // Private helper methods
    
    private boolean isHighSeverityError(ErrorEvent errorEvent) {
        return "CRITICAL".equals(errorEvent.getSeverity()) || 
               "HIGH".equals(errorEvent.getSeverity());
    }
    
    private boolean isPerformanceIssue(PerformanceEvent performanceEvent) {
        // 성능 임계값 초과 여부 판단
        Long threshold = performanceEvent.getThresholdMs();
        if (threshold == null) {
            // 기본 임계값 적용
            threshold = "REPOSITORY".equals(performanceEvent.getOperationType()) ? 500L : 1000L;
        }
        
        return performanceEvent.getExecutionTimeMs() > threshold;
    }
    
    private double calculateThresholdExceedance(PerformanceEvent performanceEvent) {
        Long threshold = performanceEvent.getThresholdMs();
        if (threshold == null || threshold == 0) {
            return 1.0;
        }
        
        return (double) performanceEvent.getExecutionTimeMs() / threshold;
    }
    
    private String suggestCollaborationForError(ErrorEvent errorEvent) {
        String errorType = errorEvent.getErrorType().toLowerCase();
        
        if (errorType.contains("repository") || errorType.contains("database")) {
            return "UNIFIED_TROUBLESHOOTING + PORTFOLIO_TROUBLESHOOT";
        } else if (errorType.contains("security") || errorType.contains("authentication")) {
            return "SECURITY_ANALYSIS + CLAUDE_GUIDE";
        } else if (errorType.contains("validation") || errorType.contains("constraint")) {
            return "API_DOCUMENTATION + UNIFIED_TROUBLESHOOTING";
        }
        
        return "CLAUDE_GUIDE + UNIFIED_TROUBLESHOOTING";
    }
    
    private String suggestOptimizationStrategy(PerformanceEvent performanceEvent) {
        String operationType = performanceEvent.getOperationType();
        
        return switch (operationType) {
            case "REPOSITORY" -> "데이터베이스 쿼리 최적화, 인덱스 검토";
            case "SERVICE" -> "비즈니스 로직 최적화, 캐싱 고려";
            case "CONTROLLER" -> "요청 처리 최적화, 비동기 처리 검토";
            default -> "일반적인 성능 최적화 검토";
        };
    }
    
    private java.util.List<String> suggestSecurityActions(SecurityEvent securityEvent) {
        return java.util.List.of(
            "보안 로그 상세 분석",
            "관련 시스템 접근 제한 검토", 
            "보안 정책 업데이트 필요성 검토",
            "사용자 계정 보안 상태 점검"
        );
    }
    
    private void handleCriticalError(ErrorEvent errorEvent) {
        // 심각한 에러에 대한 즉시 대응
        log.error("🚨 심각한 에러 감지 - 즉시 대응 필요: {} - {}", 
                 errorEvent.getEventId(), errorEvent.getErrorMessage());
        
        // 협업 요청을 통한 즉시 처리
        agentEventBus.requestCollaboration(
            "SYSTEM_EVENT_BRIDGE",
            "SYSTEM",
            "TROUBLESHOOTING",
            Map.of(
                "errorEvent", errorEvent,
                "urgency", "CRITICAL",
                "expectedResponseTime", java.time.Duration.ofMinutes(5)
            )
        ).thenAccept(responses -> {
            log.info("심각한 에러에 대한 에이전트 응답 수신: {}개", responses.size());
        });
    }
    
    private void handleCriticalSecurityEvent(SecurityEvent securityEvent) {
        // 고위험 보안 이벤트에 대한 즉시 대응
        log.error("🔒 고위험 보안 이벤트 감지: {} - 위험도 {}점", 
                 securityEvent.getEventId(), securityEvent.calculateRiskScore());
        
        // 보안 전문 에이전트에게 즉시 협업 요청
        agentEventBus.requestCollaboration(
            "SYSTEM_EVENT_BRIDGE",
            "SYSTEM", 
            "SECURITY_ANALYSIS",
            Map.of(
                "securityEvent", securityEvent,
                "riskScore", securityEvent.calculateRiskScore(),
                "requiresImmediateAction", true
            )
        );
    }
    
    private Object convertToSpringEvent(AgentEvent agentEvent) {
        // 에이전트 이벤트를 기존 Spring 이벤트로 변환
        // 현재는 구현하지 않지만, 필요시 확장 가능
        return null;
    }
    
    /**
     * 브리지 상태 조회
     */
    public Map<String, Object> getBridgeStatus() {
        return Map.of(
            "bridgeType", "SystemEventBridge",
            "isActive", true,
            "supportedEvents", java.util.List.of(
                "ErrorEvent", "PerformanceEvent", "SecurityEvent", "ApplicationEvent"
            ),
            "lastActivity", LocalDateTime.now()
        );
    }
}