package com.globalcarelink.common.config;

import com.globalcarelink.common.event.PerformanceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LoggingAspect {

    private static final org.slf4j.Logger performanceLogger = LoggerFactory.getLogger("performance");
    private final ApplicationEventPublisher eventPublisher;

    @Pointcut("execution(* com.globalcarelink..*Service.*(..))")
    public void serviceLayer() {}

    @Pointcut("execution(* com.globalcarelink..*Controller.*(..))")
    public void controllerLayer() {}

    @Pointcut("execution(* com.globalcarelink..*Repository.*(..))")
    public void repositoryLayer() {}

    @Around("serviceLayer()")
    public Object logServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        Object[] args = joinPoint.getArgs();
        String sanitizedArgs = sanitizeArgs(args);
        
        log.debug("서비스 메서드 시작: {}.{} - 파라미터: {}", className, methodName, sanitizedArgs);
        
        try {
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("서비스 메서드 완료: {}.{} - 실행시간: {}ms", className, methodName, duration);
            
            if (duration > 1000) {
                performanceLogger.info("느린 서비스 메서드: {}.{} - {}ms", className, methodName, duration);
                
                // 구조화된 성능 이벤트 발행
                publishPerformanceEvent("SERVICE", className, methodName, duration, 1000L);
            }
            
            return result;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("서비스 메서드 오류: {}.{} - 실행시간: {}ms, 오류: {}", 
                     className, methodName, duration, e.getMessage(), e);
            throw e;
        }
    }

    @Around("controllerLayer()")
    public Object logControllerExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        Object[] args = joinPoint.getArgs();
        String sanitizedArgs = sanitizeArgs(args);
        
        log.info("컨트롤러 메서드 시작: {}.{} - 파라미터: {}", className, methodName, sanitizedArgs);
        
        try {
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("컨트롤러 메서드 완료: {}.{} - 실행시간: {}ms", className, methodName, duration);
            
            return result;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("컨트롤러 메서드 오류: {}.{} - 실행시간: {}ms, 오류: {}", 
                     className, methodName, duration, e.getMessage(), e);
            throw e;
        }
    }

    @AfterThrowing(pointcut = "serviceLayer() || controllerLayer()", throwing = "ex")
    public void logException(JoinPoint joinPoint, Throwable ex) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.error("예외 발생: {}.{} - 예외타입: {}, 메시지: {}", 
                 className, methodName, ex.getClass().getSimpleName(), ex.getMessage());
                 
        if (ex.getCause() != null) {
            log.error("원인: {}", ex.getCause().getMessage());
        }
    }

    @Around("repositoryLayer()")
    public Object logRepositoryExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.debug("Repository 메서드 시작: {}.{}", className, methodName);
        
        try {
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Repository 메서드 완료: {}.{} - 실행시간: {}ms", className, methodName, duration);
            
            if (duration > 500) {
                performanceLogger.warn("느린 DB 쿼리: {}.{} - {}ms", className, methodName, duration);
                
                // 구조화된 성능 이벤트 발행
                publishPerformanceEvent("REPOSITORY", className, methodName, duration, 500L);
            }
            
            return result;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Repository 메서드 오류: {}.{} - 실행시간: {}ms, 오류: {}", 
                     className, methodName, duration, e.getMessage());
            throw e;
        }
    }

    private String sanitizeArgs(Object[] args) {
        if (args == null || args.length == 0) {
            return "[]";
        }
        
        return Arrays.stream(args)
                .map(this::sanitizeArg)
                .reduce((a, b) -> a + ", " + b)
                .map(s -> "[" + s + "]")
                .orElse("[]");
    }

    private String sanitizeArg(Object arg) {
        if (arg == null) {
            return "null";
        }
        
        String argString = arg.toString();
        
        if (argString.toLowerCase().contains("password")) {
            return "[PROTECTED]";
        }
        
        if (argString.length() > 100) {
            return argString.substring(0, 97) + "...";
        }
        
        return argString;
    }

    // ===== 성능 이벤트 발행 헬퍼 메서드 =====

    /**
     * 성능 이벤트 발행
     */
    private void publishPerformanceEvent(String operationType, String className, 
                                       String methodName, long duration, long threshold) {
        try {
            String traceId = MDC.get("traceId");
            String eventId = "PERF-" + UUID.randomUUID().toString().substring(0, 8);
            
            Map<String, Object> performanceMetrics = new HashMap<>();
            performanceMetrics.put("actualDuration", duration);
            performanceMetrics.put("threshold", threshold);
            performanceMetrics.put("exceedRatio", (double) duration / threshold);
            
            PerformanceEvent performanceEvent = PerformanceEvent.builder()
                    .source(this)
                    .eventId(eventId)
                    .traceId(traceId)
                    .operationType(operationType)
                    .methodName(methodName)
                    .className(className)
                    .executionTimeMs(duration)
                    .thresholdMs(threshold)
                    .requestUri(MDC.get("requestUri"))
                    .httpMethod(MDC.get("method"))
                    .userEmail(getCurrentUserEmail())
                    .performanceMetrics(performanceMetrics)
                    .build();

            eventPublisher.publishEvent(performanceEvent);
            
        } catch (Exception eventEx) {
            log.warn("PerformanceEvent 발행 실패", eventEx);
        }
    }

    private String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // 인증 정보 조회 실패 시 무시
        }
        return null;
    }
}