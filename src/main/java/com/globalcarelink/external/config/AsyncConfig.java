package com.globalcarelink.external.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 비동기 처리 및 스케줄링 설정
 * 공공데이터 동기화를 위한 전용 스레드 풀 포함
 */
@Configuration
@EnableAsync
@EnableScheduling
@Slf4j
public class AsyncConfig {

    @Value("${app.async.core-pool-size:5}")
    private int corePoolSize;

    @Value("${app.async.max-pool-size:20}")
    private int maxPoolSize;

    @Value("${app.async.queue-capacity:100}")
    private int queueCapacity;

    @Value("${app.async.public-data.core-pool-size:3}")
    private int publicDataCorePoolSize;

    @Value("${app.async.public-data.max-pool-size:10}")
    private int publicDataMaxPoolSize;

    @Value("${app.async.public-data.queue-capacity:50}")
    private int publicDataQueueCapacity;

    /**
     * 기본 비동기 실행기
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("elderberry-async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        
        log.info("기본 비동기 실행기 설정 완료 - Core: {}, Max: {}, Queue: {}", 
                corePoolSize, maxPoolSize, queueCapacity);
        
        return executor;
    }

    /**
     * 공공데이터 동기화 전용 실행기
     */
    @Bean(name = "publicDataExecutor")
    public Executor publicDataExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(publicDataCorePoolSize);
        executor.setMaxPoolSize(publicDataMaxPoolSize);
        executor.setQueueCapacity(publicDataQueueCapacity);
        executor.setThreadNamePrefix("public-data-sync-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60); // 공공데이터 동기화는 더 긴 대기 시간
        
        executor.initialize();
        
        log.info("공공데이터 동기화 실행기 설정 완료 - Core: {}, Max: {}, Queue: {}", 
                publicDataCorePoolSize, publicDataMaxPoolSize, publicDataQueueCapacity);
        
        return executor;
    }

    /**
     * 통계 처리 전용 실행기
     */
    @Bean(name = "statisticsExecutor")
    public Executor statisticsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(20);
        executor.setThreadNamePrefix("statistics-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        
        log.info("통계 처리 실행기 설정 완료");
        
        return executor;
    }

    /**
     * 매칭 처리 전용 실행기
     */
    @Bean(name = "matchingExecutor")
    public Executor matchingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(30);
        executor.setThreadNamePrefix("matching-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        
        log.info("매칭 처리 실행기 설정 완료");
        
        return executor;
    }
} 