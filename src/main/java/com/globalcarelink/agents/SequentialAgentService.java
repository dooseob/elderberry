package com.globalcarelink.agents;

import com.globalcarelink.agents.config.AgentSystemConfiguration.SequentialAgentMonitor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * 순차적 에이전트 실행 서비스
 * JavaScript 오케스트레이터와 연동되는 단순하고 안정적인 에이전트 실행 시스템
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SequentialAgentService {
    
    private final ApplicationContext applicationContext;
    private final SequentialAgentMonitor monitor;
    
    /**
     * 단일 에이전트 실행
     */
    public Map<String, Object> executeAgent(String agentType, Map<String, Object> input) {
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("🔄 에이전트 실행 시작: {}", agentType);
            
            // Spring Bean에서 에이전트 조회
            BaseAgent agent = findAgent(agentType);
            if (agent == null) {
                return createErrorResult(agentType, "에이전트를 찾을 수 없음", startTime);
            }
            
            // 에이전트 실행
            Object result = agent.executeSequentially(input);
            
            // 실행 시간 계산
            long executionTime = System.currentTimeMillis() - startTime;
            
            // 모니터링 기록
            monitor.recordExecution(agentType, true, executionTime, result.toString());
            
            log.info("✅ 에이전트 실행 완료: {} ({}ms)", agentType, executionTime);
            
            return createSuccessResult(agentType, result, executionTime);
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            
            log.error("❌ 에이전트 실행 실패: {} - {}", agentType, e.getMessage(), e);
            
            // 실패 기록
            monitor.recordExecution(agentType, false, executionTime, e.getMessage());
            
            return createErrorResult(agentType, e.getMessage(), startTime);
        }
    }
    
    /**
     * 순차적 에이전트 체인 실행
     */
    public Map<String, Object> executeSequentialChain(List<String> agentTypes, Map<String, Object> initialInput) {
        long chainStartTime = System.currentTimeMillis();
        
        log.info("🔗 순차적 에이전트 체인 실행 시작: {}", agentTypes);
        
        Map<String, Object> currentInput = new HashMap<>(initialInput);
        List<Map<String, Object>> executionResults = new ArrayList<>();
        
        for (String agentType : agentTypes) {
            try {
                // 각 에이전트 실행
                Map<String, Object> result = executeAgent(agentType, currentInput);
                executionResults.add(result);
                
                // 실행 성공한 경우 다음 에이전트의 입력으로 사용
                if ((Boolean) result.get("success")) {
                    Object agentResult = result.get("result");
                    if (agentResult instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> resultMap = (Map<String, Object>) agentResult;
                        currentInput.putAll(resultMap);
                    }
                    currentInput.put("previousAgent", agentType);
                    currentInput.put("previousResult", agentResult);
                } else {
                    // 실패한 경우 체인 중단
                    log.warn("⚠️ 에이전트 체인 중단: {} 실패", agentType);
                    break;
                }
                
            } catch (Exception e) {
                log.error("💥 에이전트 체인 실행 중 예외: {} - {}", agentType, e.getMessage(), e);
                break;
            }
        }
        
        long totalExecutionTime = System.currentTimeMillis() - chainStartTime;
        
        // 체인 실행 결과 생성
        Map<String, Object> chainResult = Map.of(
            "chainSuccess", executionResults.stream().allMatch(r -> (Boolean) r.get("success")),
            "totalExecutionTime", totalExecutionTime,
            "executedAgents", agentTypes,
            "results", executionResults,
            "timestamp", LocalDateTime.now()
        );
        
        log.info("🏁 순차적 에이전트 체인 실행 완료 ({}ms)", totalExecutionTime);
        
        return chainResult;
    }
    
    /**
     * 병렬 에이전트 실행 (독립적인 작업용)
     */
    public CompletableFuture<Map<String, Object>> executeParallelAgents(List<String> agentTypes, Map<String, Object> input) {
        log.info("⚡ 병렬 에이전트 실행 시작: {}", agentTypes);
        
        List<CompletableFuture<Map<String, Object>>> futures = agentTypes.stream()
            .map(agentType -> CompletableFuture.supplyAsync(() -> executeAgent(agentType, input)))
            .toList();
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> {
                List<Map<String, Object>> results = futures.stream()
                    .map(CompletableFuture::join)
                    .toList();
                
                return Map.of(
                    "parallelSuccess", results.stream().allMatch(r -> (Boolean) r.get("success")),
                    "results", results,
                    "executedAgents", agentTypes,
                    "timestamp", LocalDateTime.now()
                );
            });
    }
    
    /**
     * 에이전트 상태 조회
     */
    public Map<String, Object> getAgentStatus(String agentType) {
        return monitor.getAgentStatus(agentType);
    }
    
    /**
     * 전체 시스템 상태 조회
     */
    public Map<String, Object> getSystemStatus() {
        Map<String, Object> systemStatus = monitor.getSystemStatus();
        
        // 활성 에이전트 목록 추가
        Collection<BaseAgent> agents = applicationContext.getBeansOfType(BaseAgent.class).values();
        List<String> activeAgents = agents.stream()
            .filter(BaseAgent::isActive)
            .map(BaseAgent::getAgentType)
            .toList();
        
        systemStatus.put("activeAgents", activeAgents);
        systemStatus.put("availableAgents", getAvailableAgents());
        
        return systemStatus;
    }
    
    /**
     * 사용 가능한 에이전트 목록 조회
     */
    public List<String> getAvailableAgents() {
        Collection<BaseAgent> agents = applicationContext.getBeansOfType(BaseAgent.class).values();
        return agents.stream()
            .map(BaseAgent::getAgentType)
            .sorted()
            .toList();
    }
    
    // Private helper methods
    
    /**
     * 에이전트 찾기
     */
    private BaseAgent findAgent(String agentType) {
        Collection<BaseAgent> agents = applicationContext.getBeansOfType(BaseAgent.class).values();
        
        return agents.stream()
            .filter(agent -> agent.getAgentType().equals(agentType))
            .findFirst()
            .orElse(null);
    }
    
    /**
     * 성공 결과 생성
     */
    private Map<String, Object> createSuccessResult(String agentType, Object result, long executionTime) {
        return Map.of(
            "success", true,
            "agentType", agentType,
            "result", result,
            "executionTime", executionTime,
            "timestamp", LocalDateTime.now()
        );
    }
    
    /**
     * 에러 결과 생성
     */
    private Map<String, Object> createErrorResult(String agentType, String error, long startTime) {
        long executionTime = System.currentTimeMillis() - startTime;
        
        return Map.of(
            "success", false,
            "agentType", agentType,
            "error", error,
            "executionTime", executionTime,
            "timestamp", LocalDateTime.now()
        );
    }
}