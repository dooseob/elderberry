package com.globalcarelink.agents.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * 에이전트 환경별 설정
 * 개발/운영 환경에 따른 에이전트 동작 제어
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "agents")
public class AgentEnvironmentConfig {
    
    @Autowired
    private Environment environment;
    
    private DebugConfig debug = new DebugConfig();
    private SequentialConfig sequential = new SequentialConfig();
    private MonitoringConfig monitoring = new MonitoringConfig();
    
    @PostConstruct
    public void init() {
        String[] activeProfiles = environment.getActiveProfiles();
        boolean isProduction = java.util.Arrays.asList(activeProfiles).contains("prod");
        
        log.info("🌍 에이전트 환경 설정 초기화");
        log.info("  - 활성 프로파일: {}", java.util.Arrays.toString(activeProfiles));
        log.info("  - 프로덕션 모드: {}", isProduction);
        log.info("  - 디버그 에이전트: {}", debug.isEnabled());
        log.info("  - 순차 실행: {}", sequential.isEnabled());
        log.info("  - 모니터링: {}", monitoring.isEnabled());
        
        if (isProduction) {
            log.warn("🚨 프로덕션 환경 - 에이전트 디버그 로그 최소화");
        }
    }
    
    /**
     * 현재 환경이 개발 환경인지 확인
     */
    public boolean isDevelopmentMode() {
        String[] activeProfiles = environment.getActiveProfiles();
        return java.util.Arrays.asList(activeProfiles).contains("dev") || 
               activeProfiles.length == 0; // 기본값은 개발 환경
    }
    
    /**
     * 현재 환경이 프로덕션 환경인지 확인
     */
    public boolean isProductionMode() {
        String[] activeProfiles = environment.getActiveProfiles();
        return java.util.Arrays.asList(activeProfiles).contains("prod");
    }
    
    /**
     * 에이전트 로그 출력 여부 결정
     */
    public boolean shouldLogAgentDetails() {
        return isDevelopmentMode() && debug.isEnabled();
    }
    
    /**
     * 에이전트 모니터링 활성화 여부
     */
    public boolean isMonitoringEnabled() {
        return monitoring.isEnabled() && !isProductionMode();
    }
    
    /**
     * 에이전트 실행 타임아웃 (환경별)
     */
    public long getExecutionTimeout() {
        return isProductionMode() ? 
            Math.min(sequential.getMaxExecutionTime(), 15000) :  // 프로덕션: 최대 15초
            sequential.getMaxExecutionTime();                     // 개발: 설정값 사용
    }
    
    // Inner configuration classes
    
    @Data
    public static class DebugConfig {
        private boolean enabled = true;
        private String logLevel = "DEBUG";
    }
    
    @Data
    public static class SequentialConfig {
        private boolean enabled = true;
        private long maxExecutionTime = 30000; // 30초
    }
    
    @Data
    public static class MonitoringConfig {
        private boolean enabled = true;
    }
}