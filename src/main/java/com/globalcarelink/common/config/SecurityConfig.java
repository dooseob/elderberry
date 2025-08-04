package com.globalcarelink.common.config;

import com.globalcarelink.auth.JwtAuthenticationFilter;
import com.globalcarelink.auth.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final Environment environment;
    
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:5174}")
    private List<String> allowedOrigins;
    
    @Value("${app.security.production-mode:false}")
    private boolean productionMode;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .contentTypeOptions(Customizer.withDefaults())
                        .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                                .maxAgeInSeconds(31536000))
                        .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
                
                .authorizeHttpRequests(auth -> {
                    // 기본 허용 경로
                    auth.requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/signup", "/api/auth/login-test", "/api/auth/login-dto-test", "/api/auth/login-simple-test", "/api/auth/login-map-test", "/api/auth/password-hash-test").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/error").permitAll();
                    
                    // 프로덕션 환경에서는 개발 도구 접근 차단
                    if (isProductionProfile()) {
                        auth.requestMatchers("/h2-console/**").denyAll()
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**").denyAll();
                    } else {
                        // 개발 환경에서만 개발 도구 허용
                        auth.requestMatchers("/h2-console/**").permitAll()
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**").permitAll();
                    }
                    
                    // 비즈니스 로직 권한 설정
                    auth.requestMatchers("/api/health-assessments/statistics").hasRole("ADMIN")
                        .requestMatchers("/api/coordinator-matching/statistics").hasRole("ADMIN")
                        .requestMatchers("/api/coordinator-matching/simulate").hasRole("ADMIN")
                        .requestMatchers("/api/coordinator-matching/available").hasAnyRole("COORDINATOR", "ADMIN")
                        .requestMatchers("/api/health-assessments/**").hasAnyRole("USER_DOMESTIC", "USER_OVERSEAS", "COORDINATOR", "ADMIN")
                        .requestMatchers("/api/coordinator-matching/**").hasAnyRole("USER_DOMESTIC", "USER_OVERSEAS", "COORDINATOR", "ADMIN")
                        .requestMatchers("/api/profiles/**").hasAnyRole("USER_DOMESTIC", "USER_OVERSEAS", "COORDINATOR", "FACILITY", "ADMIN")
                        .requestMatchers("/api/members/**").hasAnyRole("USER_DOMESTIC", "USER_OVERSEAS", "COORDINATOR", "FACILITY", "ADMIN")
                        .anyRequest().authenticated();
                })
                
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), 
                        UsernamePasswordAuthenticationFilter.class)
                
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"인증이 필요합니다\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"접근 권한이 없습니다\"}");
                        })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 프로덕션 환경과 개발 환경에 따른 CORS 설정 분리
        if (isProductionProfile()) {
            // 프로덕션: 실제 도메인만 허용
            configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://www.elderberry-ai.com",
                "https://elderberry-ai.com",
                "https://api.elderberry-ai.com",
                "https://*.elderberry-ai.com"
            ));
        } else {
            // 개발 환경: localhost 포함 관대한 설정
            configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173", 
                "http://localhost:5174",
                "http://localhost:8080",
                "https://www.elderberry-ai.com",
                "https://elderberry-ai.com",
                "https://api.elderberry-ai.com",
                "https://*.elderberry-ai.com"
            ));
        }
        
        // 프로덕션에서는 제한된 HTTP 메서드만 허용
        if (isProductionProfile()) {
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        } else {
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        }
        
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", 
                "Content-Type", 
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        
        configuration.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization"
        ));
        
        configuration.setAllowCredentials(true);
        
        // 프로덕션에서는 더 긴 캐시 시간 설정
        configuration.setMaxAge(isProductionProfile() ? 7200L : 3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
    
    /**
     * 프로덕션 프로파일 활성화 여부 확인
     */
    private boolean isProductionProfile() {
        return productionMode || 
               environment.acceptsProfiles("prod", "production") ||
               "production".equals(System.getProperty("spring.profiles.active"));
    }
}