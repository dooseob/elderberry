package com.globalcarelink.simple;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Redis 없이 동작하는 간단한 Spring Boot 애플리케이션
 * 인증, 회원, 시설, 건강 패키지만 포함하여 로그인 테스트 가능
 */
@SpringBootApplication(
    scanBasePackages = {
        "com.globalcarelink.auth",
        "com.globalcarelink.common",
        "com.globalcarelink.health",
        "com.globalcarelink.facility",
        "com.globalcarelink.simple"
    },
    exclude = {RedisAutoConfiguration.class} // Redis 자동 설정 제외
)
@EntityScan(basePackages = {
    "com.globalcarelink.auth",
    "com.globalcarelink.health",
    "com.globalcarelink.facility"
})
@EnableJpaRepositories(basePackages = {
    "com.globalcarelink.auth",
    "com.globalcarelink.health", 
    "com.globalcarelink.facility"
})
public class SimpleApplication {
    
    public static void main(String[] args) {
        System.setProperty("spring.profiles.active", "simple");
        SpringApplication.run(SimpleApplication.class, args);
    }
    
    /**
     * 간단한 패스워드 인코더 빈 (보안 설정에서 필요)
     */
    @Bean
    @Profile("simple")
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}