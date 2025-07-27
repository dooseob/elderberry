package com.globalcarelink.common.event;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 시스템 이벤트 기본 클래스
 * 모든 구조화된 시스템 이벤트의 공통 속성을 정의
 */
@Data
@EqualsAndHashCode(callSuper = false)
public abstract class SystemEvent extends ApplicationEvent {
    
    private final String eventId;
    private final String traceId;
    private final LocalDateTime eventTimestamp;
    private final String eventType;
    private final String source;
    private final Map<String, Object> metadata;
    
    protected SystemEvent(Object source, String eventId, String traceId, 
                         String eventType, Map<String, Object> metadata) {
        super(source);
        this.eventId = eventId;
        this.traceId = traceId;
        this.eventTimestamp = LocalDateTime.now();
        this.eventType = eventType;
        this.source = source.getClass().getSimpleName();
        this.metadata = metadata;
    }
    
    /**
     * 이벤트를 JSON 형태로 직렬화
     */
    public abstract String toJsonString();
    
    /**
     * 이벤트 심각도 레벨 반환
     */
    public abstract String getSeverity();
}