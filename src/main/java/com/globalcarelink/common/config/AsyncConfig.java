package com.globalcarelink.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 비동기 처리 설정
 * - 다중 스레드 풀 관리
 * - 예외 처리 및 로깅
 * - 성능 모니터링
 * - 백프레셔 관리
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Value("${async.core-pool-size:5}")
    private int corePoolSize;

    @Value("${async.max-pool-size:20}")
    private int maxPoolSize;

    @Value("${async.queue-capacity:100}")
    private int queueCapacity;

    @Value("${async.keep-alive-seconds:60}")
    private int keepAliveSeconds;

    @Value("${async.thread-name-prefix:async-}")
    private String threadNamePrefix;

    /**
     * 기본 비동기 실행자
     */
    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 기본 스레드 풀 설정
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setKeepAliveSeconds(keepAliveSeconds);
        executor.setThreadNamePrefix(threadNamePrefix);
        
        // 백프레셔 정책: 큐가 가득 찰 때 호출 스레드에서 실행
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // 스레드 종료 대기 설정
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        // 스레드 풀 통계 로깅
        executor.setTaskDecorator(runnable -> {
            return () -> {
                long startTime = System.currentTimeMillis();
                try {
                    runnable.run();
                } finally {
                    long endTime = System.currentTimeMillis();
                    log.debug("비동기 작업 완료 - 실행시간: {}ms, 스레드: {}", 
                            endTime - startTime, Thread.currentThread().getName());
                }
            };
        });
        
        executor.initialize();
        
        log.info("기본 비동기 실행자 설정 완료 - 코어: {}, 최대: {}, 큐: {}", 
                corePoolSize, maxPoolSize, queueCapacity);
        
        return executor;
    }

    /**
     * 통계 처리용 비동기 실행자
     * - CPU 집약적 작업용
     * - 별도 스레드 풀로 격리
     */
    @Bean(name = "statisticsExecutor")
    public Executor statisticsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 통계 처리에 최적화된 설정
        executor.setCorePoolSize(Math.max(2, Runtime.getRuntime().availableProcessors() / 2));
        executor.setMaxPoolSize(Runtime.getRuntime().availableProcessors());
        executor.setQueueCapacity(50);
        executor.setKeepAliveSeconds(120);
        executor.setThreadNamePrefix("stats-");
        
        // 통계 작업이 실패해도 다른 작업에 영향 없도록 격리
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy());
        
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        
        log.info("통계 처리 실행자 설정 완료 - 코어: {}, 최대: {}", 
                executor.getCorePoolSize(), executor.getMaxPoolSize());
        
        return executor;
    }

    /**
     * 매칭 처리용 비동기 실행자
     * - 복잡한 알고리즘 처리용
     * - 높은 우선순위
     */
    @Bean(name = "matchingExecutor")
    public Executor matchingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 매칭 처리에 최적화된 설정
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(200);
        executor.setKeepAliveSeconds(300);
        executor.setThreadNamePrefix("matching-");
        
        // 매칭 작업은 중요하므로 호출 스레드에서 실행
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(45);
        
        // 매칭 작업 성능 모니터링
        executor.setTaskDecorator(runnable -> {
            return () -> {
                long startTime = System.currentTimeMillis();
                String threadName = Thread.currentThread().getName();
                log.debug("매칭 작업 시작 - 스레드: {}", threadName);
                
                try {
                    runnable.run();
                } finally {
                    long endTime = System.currentTimeMillis();
                    long duration = endTime - startTime;
                    
                    if (duration > 5000) { // 5초 이상 걸린 작업은 경고
                        log.warn("매칭 작업 지연 - 실행시간: {}ms, 스레드: {}", duration, threadName);
                    } else {
                        log.debug("매칭 작업 완료 - 실행시간: {}ms, 스레드: {}", duration, threadName);
                    }
                }
            };
        });
        
        executor.initialize();
        
        log.info("매칭 처리 실행자 설정 완료 - 코어: {}, 최대: {}", 
                executor.getCorePoolSize(), executor.getMaxPoolSize());
        
        return executor;
    }

    /**
     * 알림 처리용 비동기 실행자
     * - I/O 집약적 작업용
     * - 외부 서비스 호출용
     */
    @Bean(name = "notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 알림 처리에 최적화된 설정
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(500);
        executor.setKeepAliveSeconds(180);
        executor.setThreadNamePrefix("notification-");
        
        // 알림 실패 시 무시 (중요도가 낮음)
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardPolicy());
        
        executor.setWaitForTasksToCompleteOnShutdown(false); // 빠른 종료
        executor.setAwaitTerminationSeconds(10);
        
        executor.initialize();
        
        log.info("알림 처리 실행자 설정 완료 - 코어: {}, 최대: {}", 
                executor.getCorePoolSize(), executor.getMaxPoolSize());
        
        return executor;
    }

    /**
     * 스케줄러 전용 비동기 실행자
     * - PublicDataSyncScheduler용
     * - 정기 작업 처리용
     */
    @Bean(name = "schedulerTaskExecutor")
    public AsyncTaskExecutor schedulerTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 스케줄러 작업에 최적화된 설정
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(25);
        executor.setKeepAliveSeconds(120);
        executor.setThreadNamePrefix("scheduler-");
        
        // 스케줄러 작업은 중요하므로 호출 스레드에서 실행
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        
        log.info("스케줄러 실행자 설정 완료 - 코어: {}, 최대: {}", 
                executor.getCorePoolSize(), executor.getMaxPoolSize());
        
        return executor;
    }

    /**
     * API 호출 전용 비동기 실행자
     * - PublicDataSyncScheduler용
     * - 외부 API 호출 처리용
     */
    @Bean(name = "apiTaskExecutor")
    public AsyncTaskExecutor apiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // API 호출에 최적화된 설정
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setKeepAliveSeconds(180);
        executor.setThreadNamePrefix("api-");
        
        // API 호출 실패 시 재시도를 위해 호출 스레드에서 실행
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        
        log.info("API 실행자 설정 완료 - 코어: {}, 최대: {}", 
                executor.getCorePoolSize(), executor.getMaxPoolSize());
        
        return executor;
    }

    /**
     * 데이터베이스 작업 전용 비동기 실행자
     * - PublicDataSyncScheduler용
     * - 대량 데이터 처리용
     */
    @Bean(name = "dbTaskExecutor")
    public AsyncTaskExecutor dbTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // DB 작업에 최적화된 설정
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setKeepAliveSeconds(300);
        executor.setThreadNamePrefix("db-");
        
        // DB 작업은 중요하므로 호출 스레드에서 실행
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        
        log.info("DB 실행자 설정 완료 - 코어: {}, 최대: {}", 
                executor.getCorePoolSize(), executor.getMaxPoolSize());
        
        return executor;
    }

    /**
     * 비동기 예외 처리기
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncUncaughtExceptionHandler();
    }

    /**
     * 커스텀 비동기 예외 처리기
     */
    public static class CustomAsyncUncaughtExceptionHandler implements AsyncUncaughtExceptionHandler {
        
        @Override
        public void handleUncaughtException(Throwable throwable, Method method, Object... objects) {
            log.error("비동기 작업 예외 발생 - 메서드: {}.{}, 파라미터: {}", 
                    method.getDeclaringClass().getSimpleName(),
                    method.getName(),
                    objects,
                    throwable);
            
            // 중요한 예외의 경우 추가 처리 (알림, 메트릭 등)
            if (isBusinessCriticalMethod(method)) {
                log.error("중요 비즈니스 로직 실패 - 즉시 확인 필요: {}", method.getName());
                // TODO: 알림 서비스 호출
            }
        }
        
        private boolean isBusinessCriticalMethod(Method method) {
            String methodName = method.getName();
            String className = method.getDeclaringClass().getSimpleName();
            
            // 중요한 비즈니스 로직 메서드 판별
            return methodName.contains("match") && className.contains("Coordinator") ||
                   methodName.contains("calculate") && className.contains("Grade") ||
                   methodName.contains("process") && className.contains("Payment");
        }
    }

    /**
     * 스레드 풀 상태 모니터링 빈
     */
    @Bean
    public ThreadPoolMonitor threadPoolMonitor() {
        return new ThreadPoolMonitor();
    }

    /**
     * 스레드 풀 모니터링 클래스
     */
    public static class ThreadPoolMonitor {
        
        public void logThreadPoolStats(ThreadPoolTaskExecutor executor, String name) {
            if (executor != null) {
                ThreadPoolExecutor threadPool = executor.getThreadPoolExecutor();
                if (threadPool != null) {
                    log.info("스레드 풀 상태 [{}] - 활성: {}/{}, 완료: {}, 큐: {}/{}, 최대큐: {}", 
                            name,
                            threadPool.getActiveCount(),
                            threadPool.getPoolSize(),
                            threadPool.getCompletedTaskCount(),
                            threadPool.getQueue().size(),
                            executor.getQueueCapacity(),
                            threadPool.getLargestPoolSize());
                }
            }
        }
        
        public boolean isThreadPoolHealthy(ThreadPoolTaskExecutor executor) {
            if (executor == null) return false;
            
            ThreadPoolExecutor threadPool = executor.getThreadPoolExecutor();
            if (threadPool == null) return false;
            
            // 큐 사용률이 80% 이상이면 경고
            double queueUsage = (double) threadPool.getQueue().size() / executor.getQueueCapacity();
            if (queueUsage > 0.8) {
                log.warn("스레드 풀 큐 사용률 높음: {:.1f}%", queueUsage * 100);
                return false;
            }
            
            return true;
        }
    }
} 