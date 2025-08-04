package com.globalcarelink.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    
    // 인증이 필요 없는 공개 엔드포인트 목록
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/signup",
        "/api/auth/login-test",
        "/api/auth/login-dto-test",
        "/api/auth/login-simple-test",
        "/api/auth/login-map-test",
        "/api/auth/password-hash-test",
        "/api/test",
        "/actuator/health",
        "/actuator/info",
        "/error",
        "/h2-console",
        "/swagger-ui",
        "/v3/api-docs"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // 공개 엔드포인트인 경우 토큰 검증을 건너뛰기
        boolean isPublicEndpoint = PUBLIC_ENDPOINTS.stream()
            .anyMatch(endpoint -> requestPath.startsWith(endpoint));
        
        log.debug("JWT 필터 - 요청 경로: {}, 공개 엔드포인트: {}", requestPath, isPublicEndpoint);
        
        if (isPublicEndpoint) {
            // 공개 엔드포인트는 토큰 검증 없이 진행
            log.debug("공개 엔드포인트로 인식됨 - 토큰 검증 건너뛰기: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = resolveToken(request);
        
        if (StringUtils.hasText(token)) {
            try {
                if (jwtTokenProvider.validateToken(token)) {
                    Authentication authentication = jwtTokenProvider.getAuthentication(token);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // 토큰 검증 실패 시 로그만 남기고 계속 진행 (SecurityConfig에서 처리)
                log.warn("JWT 토큰 검증 실패 (무시됨): {}", e.getMessage());
                // 공개 엔드포인트가 아닌 경우에만 에러를 던지도록 수정
                // 현재는 에러를 던지지 않고 그냥 진행 (SecurityConfig가 처리)
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}