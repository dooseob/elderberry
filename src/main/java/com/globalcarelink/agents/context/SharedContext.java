package com.globalcarelink.agents.context;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

/**
 * 에이전트 간 공유 컨텍스트
 */
@Component
public class SharedContext {
    private final Map<String, Object> sharedData = new ConcurrentHashMap<>();
    
    public void put(String key, Object value) {
        sharedData.put(key, value);
    }
    
    public Object get(String key) {
        return sharedData.get(key);
    }
    
    public <T> T get(String key, Class<T> type) {
        Object value = sharedData.get(key);
        return type.isInstance(value) ? type.cast(value) : null;
    }
    
    public void remove(String key) {
        sharedData.remove(key);
    }
    
    public void clear() {
        sharedData.clear();
    }
    
    public Map<String, Object> getAll() {
        return new ConcurrentHashMap<>(sharedData);
    }
}