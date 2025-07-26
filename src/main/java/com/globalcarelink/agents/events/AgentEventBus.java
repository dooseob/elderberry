package com.globalcarelink.agents.events;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;

/**
 * 에이전트 간 유기적 통신을 위한 이벤트 버스
 * 목적: 1) 비동기 이벤트 라우팅 및 브로드캐스팅
 *      2) 에이전트 간 직접 메시지 전송
 *      3) 구독자 관리 및 자동 라우팅
 *      4) 장애 대응 및 복구 메커니즘
 */
@Slf4j
@Component
public class AgentEventBus {
    
    // 이벤트 구독자 관리
    private final Map<String, List<Consumer<AgentEvent>>> eventSubscribers = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> agentCapabilities = new ConcurrentHashMap<>();
    
    // 직접 메시지 전송을 위한 응답 대기열
    private final Map<String, CompletableFuture<Object>> pendingResponses = new ConcurrentHashMap<>();
    
    // 이벤트 메트릭스
    private final Map<String, EventMetrics> eventMetrics = new ConcurrentHashMap<>();
    
    // 비동기 처리를 위한 스레드 풀
    private final ExecutorService eventExecutor = Executors.newVirtualThreadPerTaskExecutor();
    
    /**
     * 이벤트 구독 - 에이전트가 관심있는 이벤트 타입 등록
     */
    public void subscribe(Consumer<AgentEvent> eventHandler) {
        subscribe("ALL_EVENTS", eventHandler);
    }
    
    public void subscribe(String eventType, Consumer<AgentEvent> eventHandler) {
        eventSubscribers.computeIfAbsent(eventType, k -> new CopyOnWriteArrayList<>())
                       .add(eventHandler);
        
        log.debug("이벤트 구독 등록: {} - 현재 구독자 수: {}", 
                 eventType, eventSubscribers.get(eventType).size());
    }
    
    /**
     * 이벤트 구독 해제
     */
    public void unsubscribe(Consumer<AgentEvent> eventHandler) {
        eventSubscribers.values().forEach(subscribers -> subscribers.remove(eventHandler));
        log.debug("이벤트 구독 해제");
    }
    
    /**
     * 이벤트 발행 - 관심있는 모든 구독자에게 전송
     */
    @Async
    public void publish(AgentEvent event) {
        try {
            // 메트릭스 업데이트
            updateEventMetrics(event.getType());
            
            // 타겟팅된 이벤트인 경우 직접 전송
            if (!event.isBroadcast()) {
                publishToTarget(event);
                return;
            }
            
            // 브로드캐스트 이벤트 처리
            publishToBroadcast(event);
            
        } catch (Exception e) {
            log.error("이벤트 발행 실패: {} - {}", event.getType(), e.getMessage(), e);
        }
    }
    
    /**
     * 직접 메시지 전송 - 특정 에이전트에게 응답을 기대하는 메시지
     */
    public CompletableFuture<Object> sendDirectMessage(
            String senderAgentId, 
            String targetAgentType, 
            String messageType, 
            Object data) {
        
        CompletableFuture<Object> responseFuture = new CompletableFuture<>();
        String correlationId = UUID.randomUUID().toString();
        
        // 응답 대기 등록
        pendingResponses.put(correlationId, responseFuture);
        
        // 30초 후 타임아웃
        CompletableFuture.delayedExecutor(30, TimeUnit.SECONDS)
                         .execute(() -> timeoutResponse(correlationId));
        
        // 직접 메시지 이벤트 생성
        AgentEvent directMessage = AgentEvent.builder()
                .type(messageType)
                .sourceAgentId(senderAgentId)
                .targetAgentType(targetAgentType)
                .data(data)
                .correlationId(correlationId)
                .requiresResponse(true)
                .build();
        
        // 비동기 전송
        publish(directMessage);
        
        log.debug("직접 메시지 전송: {} -> {} (상관ID: {})", 
                 senderAgentId, targetAgentType, correlationId);
        
        return responseFuture;
    }
    
    /**
     * 협업 요청 전송 - 특정 능력을 가진 에이전트에게 작업 요청
     */
    public CompletableFuture<List<Object>> requestCollaboration(
            String requesterAgentId,
            String requesterAgentType, 
            String neededCapability,
            Object requestData) {
        
        // 능력을 가진 에이전트들 찾기
        List<String> capableAgents = findAgentsByCapability(neededCapability);
        
        if (capableAgents.isEmpty()) {
            CompletableFuture<List<Object>> emptyResult = new CompletableFuture<>();
            emptyResult.complete(Collections.emptyList());
            return emptyResult;
        }
        
        // 각 에이전트에게 협업 요청 전송
        List<CompletableFuture<Object>> individualRequests = capableAgents.stream()
                .map(agentType -> {
                    AgentEvent.AgentCapabilityNeeded capability = AgentEvent.AgentCapabilityNeeded.builder()
                            .capabilityType(neededCapability)
                            .minimumConfidence(0.7)
                            .build();
                    
                    AgentEvent collaborationRequest = AgentEvent.createCollaborationRequest(
                            requesterAgentId, requesterAgentType, capability, requestData);
                    
                    CompletableFuture<Object> responseFuture = new CompletableFuture<>();
                    pendingResponses.put(collaborationRequest.getCorrelationId(), responseFuture);
                    
                    publish(collaborationRequest);
                    return responseFuture;
                })
                .toList();
        
        // 모든 응답을 기다려서 합치기
        return CompletableFuture.allOf(individualRequests.toArray(new CompletableFuture[0]))
                .thenApply(v -> individualRequests.stream()
                        .map(CompletableFuture::join)
                        .filter(Objects::nonNull)
                        .toList());
    }
    
    /**
     * 에이전트 능력 등록
     */
    public void registerAgentCapabilities(String agentType, Set<String> capabilities) {
        agentCapabilities.put(agentType, capabilities);
        log.debug("에이전트 능력 등록: {} - {}", agentType, capabilities);
    }
    
    /**
     * 능력별 에이전트 검색
     */
    public List<String> findAgentsByCapability(String capability) {
        return agentCapabilities.entrySet().stream()
                .filter(entry -> entry.getValue().contains(capability))
                .map(Map.Entry::getKey)
                .toList();
    }
    
    /**
     * 이벤트 버스 상태 조회
     */
    public Map<String, Object> getEventBusStatus() {
        return Map.of(
            "totalSubscribers", eventSubscribers.values().stream().mapToInt(List::size).sum(),
            "eventTypes", eventSubscribers.keySet(),
            "registeredAgents", agentCapabilities.keySet(),
            "pendingResponses", pendingResponses.size(),
            "eventMetrics", getEventMetricsSummary(),
            "lastUpdate", LocalDateTime.now()
        );
    }
    
    // Private helper methods
    
    private void publishToTarget(AgentEvent event) {
        String targetType = event.getTargetAgentType();
        
        // 타겟 에이전트 구독자들에게 전송
        List<Consumer<AgentEvent>> targetSubscribers = eventSubscribers.get(targetType);
        if (targetSubscribers != null) {
            targetSubscribers.forEach(subscriber -> 
                eventExecutor.submit(() -> safeEventDelivery(subscriber, event)));
        }
        
        // ALL_EVENTS 구독자들에게도 전송 (관찰자 패턴)
        List<Consumer<AgentEvent>> allEventSubscribers = eventSubscribers.get("ALL_EVENTS");
        if (allEventSubscribers != null) {
            allEventSubscribers.forEach(subscriber -> 
                eventExecutor.submit(() -> safeEventDelivery(subscriber, event)));
        }
        
        log.debug("타겟 이벤트 전송 완료: {} -> {}", event.getSourceAgentType(), targetType);
    }
    
    private void publishToBroadcast(AgentEvent event) {
        // 관련성 있는 에이전트들에게만 전송 (스마트 브로드캐스팅)
        Set<String> relevantAgents = findRelevantAgents(event);
        
        for (String agentType : relevantAgents) {
            List<Consumer<AgentEvent>> subscribers = eventSubscribers.get(agentType);
            if (subscribers != null) {
                subscribers.forEach(subscriber -> 
                    eventExecutor.submit(() -> safeEventDelivery(subscriber, event)));
            }
        }
        
        // ALL_EVENTS 구독자들에게도 전송
        List<Consumer<AgentEvent>> allEventSubscribers = eventSubscribers.get("ALL_EVENTS");
        if (allEventSubscribers != null) {
            allEventSubscribers.forEach(subscriber -> 
                eventExecutor.submit(() -> safeEventDelivery(subscriber, event)));
        }
        
        log.debug("브로드캐스트 이벤트 전송 완료: {} -> {} 에이전트", 
                 event.getType(), relevantAgents.size());
    }
    
    private Set<String> findRelevantAgents(AgentEvent event) {
        Set<String> relevantAgents = new HashSet<>();
        
        // 이벤트 타입별 관련 에이전트 매핑
        switch (event.getType()) {
            case "LEARNING_PATTERN_SHARE":
                relevantAgents.addAll(agentCapabilities.keySet()); // 모든 에이전트가 학습에 관심
                break;
            case "INFORMATION_SHARE":
                relevantAgents.addAll(agentCapabilities.keySet());
                break;
            case "COLLABORATION_REQUEST":
                if (event.getCapabilityNeeded() != null) {
                    String neededCapability = event.getCapabilityNeeded().getCapabilityType();
                    relevantAgents.addAll(findAgentsByCapability(neededCapability));
                }
                break;
            case "ERROR_EVENT":
                relevantAgents.addAll(findAgentsByCapability("TROUBLESHOOTING"));
                relevantAgents.addAll(findAgentsByCapability("ERROR_ANALYSIS"));
                break;
            case "PERFORMANCE_EVENT":
                relevantAgents.addAll(findAgentsByCapability("PERFORMANCE_ANALYSIS"));
                break;
            default:
                // 기본적으로 모든 에이전트에게 전송
                relevantAgents.addAll(agentCapabilities.keySet());
                break;
        }
        
        return relevantAgents;
    }
    
    private void safeEventDelivery(Consumer<AgentEvent> subscriber, AgentEvent event) {
        try {
            subscriber.accept(event);
            
            // 응답 처리
            if (event.getType().equals("COLLABORATION_RESPONSE") && event.getCorrelationId() != null) {
                handleResponse(event);
            }
            
        } catch (Exception e) {
            log.error("이벤트 전달 실패: {} - {}", event.getType(), e.getMessage());
            
            // 응답 대기 중인 경우 실패 처리
            if (event.needsResponse() && event.getCorrelationId() != null) {
                failResponse(event.getCorrelationId(), e);
            }
        }
    }
    
    private void handleResponse(AgentEvent responseEvent) {
        String correlationId = responseEvent.getCorrelationId();
        CompletableFuture<Object> responseFuture = pendingResponses.remove(correlationId);
        
        if (responseFuture != null) {
            responseFuture.complete(responseEvent.getData());
            log.debug("응답 처리 완료: {}", correlationId);
        }
    }
    
    private void timeoutResponse(String correlationId) {
        CompletableFuture<Object> responseFuture = pendingResponses.remove(correlationId);
        if (responseFuture != null && !responseFuture.isDone()) {
            responseFuture.completeExceptionally(new TimeoutException("응답 타임아웃: " + correlationId));
            log.warn("응답 타임아웃: {}", correlationId);
        }
    }
    
    private void failResponse(String correlationId, Throwable error) {
        CompletableFuture<Object> responseFuture = pendingResponses.remove(correlationId);
        if (responseFuture != null && !responseFuture.isDone()) {
            responseFuture.completeExceptionally(error);
        }
    }
    
    private void updateEventMetrics(String eventType) {
        eventMetrics.compute(eventType, (type, metrics) -> {
            if (metrics == null) {
                return new EventMetrics(type, 1, LocalDateTime.now());
            }
            metrics.incrementCount();
            return metrics;
        });
    }
    
    private Map<String, Object> getEventMetricsSummary() {
        return eventMetrics.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> Map.of(
                        "count", entry.getValue().getCount(),
                        "lastSeen", entry.getValue().getLastSeen()
                    )
                ));
    }
    
    /**
     * 리소스 정리
     */
    public void shutdown() {
        eventExecutor.shutdown();
        try {
            if (!eventExecutor.awaitTermination(60, TimeUnit.SECONDS)) {
                eventExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            eventExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        // 대기 중인 응답들을 모두 취소
        pendingResponses.values().forEach(future -> 
            future.completeExceptionally(new RuntimeException("시스템 종료")));
        pendingResponses.clear();
        
        log.info("AgentEventBus 종료 완료");
    }
    
    // Inner classes
    private static class EventMetrics {
        private final String eventType;
        private int count;
        private LocalDateTime lastSeen;
        
        public EventMetrics(String eventType, int count, LocalDateTime lastSeen) {
            this.eventType = eventType;
            this.count = count;
            this.lastSeen = lastSeen;
        }
        
        public void incrementCount() {
            this.count++;
            this.lastSeen = LocalDateTime.now();
        }
        
        public int getCount() { return count; }
        public LocalDateTime getLastSeen() { return lastSeen; }
    }
}