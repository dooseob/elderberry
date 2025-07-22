package com.globalcarelink.common.config;

import com.globalcarelink.auth.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 공개 API
                        .requestMatchers("/", "/api/health", "/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-resources/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        
                        // 시설 정보 (공개)
                        .requestMatchers(HttpMethod.GET, "/api/facilities/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        
                        // 구인구직 정보 (공개)
                        .requestMatchers(HttpMethod.GET, "/api/jobs/**").permitAll()
                        
                        // 재외동포 정보 (공개)
                        .requestMatchers(HttpMethod.GET, "/api/overseas/**").permitAll()
                        
                        // 관리자 전용
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        
                        // 시설 관리자
                        .requestMatchers(HttpMethod.POST, "/api/facilities/**").hasAnyRole("FACILITY", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/facilities/**").hasAnyRole("FACILITY", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/facilities/**").hasAnyRole("FACILITY", "ADMIN")
                        
                        // 코디네이터
                        .requestMatchers("/api/coordinator/**").hasAnyRole("COORDINATOR", "ADMIN")
                        
                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}