package com.globalcarelink.agents;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

/**
 * 모든 에이전트의 기본 클래스
 */
public abstract class BaseAgent {
    protected final Logger logger = LoggerFactory.getLogger(getClass());
    protected final String agentName;
    protected final String description;
    
    public BaseAgent(String agentName, String description) {
        this.agentName = agentName;
        this.description = description;
    }
    
    /**
     * 에이전트 작업 실행
     */
    protected abstract Map<String, Object> executeTask(String task, Map<String, Object> parameters);
    
    /**
     * 에이전트 설명 반환
     */
    public abstract String getAgentDescription();
    
    /**
     * 지원하는 작업 목록 반환
     */
    public abstract List<String> getSupportedTasks();
    
    // Getters
    public String getAgentName() { return agentName; }
    public String getDescription() { return description; }
}