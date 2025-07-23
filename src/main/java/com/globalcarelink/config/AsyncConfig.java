package com.globalcarelink.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.task.ThreadPoolTaskExecutorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 비동기 처리 설정
 * Context7 모범사례 적용 - ThreadPoolTaskExecutor 최적화
 * 스케줄러 작업과 일반 비동기 작업을 분리하여 성능 향상
 */
@Configuration
@EnableAsync
@EnableScheduling
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    /**
     * 기본 비동기 작업용 Executor
     * 일반적인 @Async 메서드에서 사용
     */
    @Bean
    @Primary
    public Executor taskExecutor(ThreadPoolTaskExecutorBuilder builder) {
        return builder
                .corePoolSize(5)           // 기본 스레드 수
                .maxPoolSize(15)           // 최대 스레드 수
                .queueCapacity(100)        // 큐 용량
                .threadNamePrefix("async-task-")
                .taskDecorator(runnable -> {
                    // MDC 컨텍스트 전파 등 추가 설정 가능
                    return () -> {
                        try {
                            runnable.run();
                        } catch (Exception e) {
                            log.error("비동기 작업 실행 중 오류 발생", e);
                        }
                    };
                })
                .build();
    }

    /**
     * 스케줄러 전용 Executor
     * 공공데이터 동기화 등 무거운 스케줄 작업 전용
     */
    @Bean(name = "schedulerTaskExecutor")
    public AsyncTaskExecutor schedulerTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);      // 스케줄러용 기본 스레드
        executor.setMaxPoolSize(8);       // 스케줄러용 최대 스레드
        executor.setQueueCapacity(50);    // 스케줄러용 큐 용량
        executor.setThreadNamePrefix("scheduler-");
        executor.setKeepAliveSeconds(60); // 유휴 스레드 생존 시간
        
        // 거부 정책 설정 - 큐가 가득 찰 경우 호출 스레드에서 실행
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // 스레드 풀 종료 시 대기 설정
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        return executor;
    }

    /**
     * 데이터베이스 작업 전용 Executor
     * 대량 데이터 처리시 DB 커넥션 풀과 조화
     */
    @Bean(name = "dbTaskExecutor")
    public AsyncTaskExecutor dbTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);      // DB 커넥션 풀 크기에 맞춤
        executor.setMaxPoolSize(10);      // DB 최대 연결 수 고려
        executor.setQueueCapacity(200);   // 대량 처리를 위한 큰 큐
        executor.setThreadNamePrefix("db-task-");
        executor.setKeepAliveSeconds(120);
        
        // 커스텀 거부 정책 - 로깅 후 CallerRunsPolicy 적용
        executor.setRejectedExecutionHandler((runnable, threadPoolExecutor) -> {
            log.warn("DB 작업 큐가 가득참. 현재 스레드에서 실행: active={}, queued={}", 
                    threadPoolExecutor.getActiveCount(), threadPoolExecutor.getQueue().size());
            new ThreadPoolExecutor.CallerRunsPolicy().rejectedExecution(runnable, threadPoolExecutor);
        });
        
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(120);
        
        executor.initialize();
        return executor;
    }

    /**
     * 외부 API 호출 전용 Executor
     * 공공데이터 API 호출 등 외부 의존성 작업
     */
    @Bean(name = "apiTaskExecutor") 
    public AsyncTaskExecutor apiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(6);      // API 호출 병렬성 고려
        executor.setMaxPoolSize(20);      // API 서버 부하 고려한 최대값
        executor.setQueueCapacity(100);   
        executor.setThreadNamePrefix("api-task-");
        executor.setKeepAliveSeconds(30); // API 호출은 빠른 정리
        
        // API 타임아웃 고려한 거부 정책
        executor.setRejectedExecutionHandler((runnable, threadPoolExecutor) -> {
            log.error("API 작업 큐 초과. 작업 거부됨: active={}, queued={}", 
                    threadPoolExecutor.getActiveCount(), threadPoolExecutor.getQueue().size());
            // API 호출은 실패시 거부하는 것이 더 안전
            throw new RuntimeException("API 작업 큐가 가득찬 상태입니다.");
        });
        
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        return executor;
    }

    /**
     * 통계 및 분석 전용 Executor
     * 시설 매칭 통계, 사용자 행동 분석 등
     */
    @Bean(name = "statisticsExecutor")
    public AsyncTaskExecutor statisticsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);      // 통계 작업용 기본 스레드
        executor.setMaxPoolSize(6);       // 통계 작업용 최대 스레드
        executor.setQueueCapacity(300);   // 많은 통계 작업 대기 가능
        executor.setThreadNamePrefix("stats-");
        executor.setKeepAliveSeconds(180); // 통계 작업은 긴 생존 시간
        
        // 통계 작업 거부 정책 - 로깅 후 버림 (필수가 아님)
        executor.setRejectedExecutionHandler((runnable, threadPoolExecutor) -> {
            log.info("통계 작업 큐 초과로 작업 스킵: active={}, queued={}", 
                    threadPoolExecutor.getActiveCount(), threadPoolExecutor.getQueue().size());
            // 통계 작업은 실패해도 서비스에 직접적 영향 없음
        });
        
        executor.setWaitForTasksToCompleteOnShutdown(false); // 통계는 즉시 종료
        executor.setAwaitTerminationSeconds(10);
        
        executor.initialize();
        return executor;
    }

    /**
     * AsyncConfigurer 구현 - 기본 Executor 지정
     */
    @Override
    public Executor getAsyncExecutor() {
        return taskExecutor(new ThreadPoolTaskExecutorBuilder());
    }

    /**
     * 비동기 메서드에서 발생한 예외 처리
     */
    @Override
    public org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, objects) -> {
            log.error("비동기 메서드 실행 중 처리되지 않은 예외 발생: {}.{}", 
                    method.getDeclaringClass().getSimpleName(), method.getName(), throwable);
        };
    }
} 