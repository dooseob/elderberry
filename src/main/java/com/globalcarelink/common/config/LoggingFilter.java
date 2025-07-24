package com.globalcarelink.common.config;

import com.globalcarelink.common.event.PerformanceEvent;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoggingFilter extends OncePerRequestFilter {

    private final ApplicationEventPublisher eventPublisher;

    private static final String TRACE_ID = "traceId";
    private static final String USER_ID = "userId";
    private static final String USER_EMAIL = "userEmail";
    private static final String REQUEST_URI = "requestUri";
    private static final String METHOD = "method";
    private static final String CLIENT_IP = "clientIp";

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        
        try {
            setupMDC(request);
            
            log.info("요청 시작: {} {}", request.getMethod(), request.getRequestURI());
            
            filterChain.doFilter(request, response);
            
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("요청 완료: {} {} - 응답코드: {}, 처리시간: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    response.getStatus(), 
                    duration);
            
            if (duration > 3000) {
                log.warn("느린 요청 감지: {}ms - {} {}", duration, request.getMethod(), request.getRequestURI());
                
                // 구조화된 성능 이벤트 발행
                publishSlowRequestEvent(request, response, duration);
            }
            
            clearMDC();
        }
    }

    private void setupMDC(HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put(TRACE_ID, traceId);
        MDC.put(REQUEST_URI, request.getRequestURI());
        MDC.put(METHOD, request.getMethod());
        MDC.put(CLIENT_IP, getClientIpAddress(request));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getName())) {
            
            String userEmail = authentication.getName();
            MDC.put(USER_EMAIL, userEmail);
            MDC.put(USER_ID, extractUserId(userEmail));
        }
    }

    private void clearMDC() {
        MDC.remove(TRACE_ID);
        MDC.remove(USER_ID);
        MDC.remove(USER_EMAIL);
        MDC.remove(REQUEST_URI);
        MDC.remove(METHOD);
        MDC.remove(CLIENT_IP);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private String extractUserId(String email) {
        return email != null ? email.split("@")[0] : "unknown";
    }

    /**
     * 느린 요청에 대한 성능 이벤트 발행
     */
    private void publishSlowRequestEvent(HttpServletRequest request, HttpServletResponse response, long duration) {
        try {
            String traceId = MDC.get(TRACE_ID);
            String eventId = "PERF-" + UUID.randomUUID().toString().substring(0, 8);
            
            Map<String, Object> performanceMetrics = new HashMap<>();
            performanceMetrics.put("actualDuration", duration);
            performanceMetrics.put("threshold", 3000L);
            performanceMetrics.put("exceedRatio", (double) duration / 3000L);
            performanceMetrics.put("responseStatus", response.getStatus());
            performanceMetrics.put("contentLength", response.getBufferSize());
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = null;
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                userEmail = authentication.getName();
            }
            
            PerformanceEvent performanceEvent = PerformanceEvent.builder()
                    .source(this)
                    .eventId(eventId)
                    .traceId(traceId)
                    .operationType("HTTP_REQUEST")
                    .methodName("doFilter")
                    .className("LoggingFilter")
                    .executionTimeMs(duration)
                    .thresholdMs(3000L)
                    .requestUri(request.getRequestURI())
                    .httpMethod(request.getMethod())
                    .userEmail(userEmail)
                    .performanceMetrics(performanceMetrics)
                    .build();

            eventPublisher.publishEvent(performanceEvent);
            
        } catch (Exception eventEx) {
            log.warn("느린 요청 PerformanceEvent 발행 실패", eventEx);
        }
    }
}