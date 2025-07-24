package com.globalcarelink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

/**
 * 엘더베리 간단 백엔드 애플리케이션
 * 로그 기반 디버깅 시스템 테스트용 최소 기능 백엔드
 */
@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
})
@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SimpleApp {
    
    public static void main(String[] args) {
        System.out.println("=== 엘더베리 백엔드 시작 ===");
        SpringApplication.run(SimpleApp.class, args);
    }
    
    @GetMapping("/")
    public String home() {
        return "엘더베리 백엔드 서버가 실행 중입니다! 🌿";
    }
    
    @GetMapping("/health")
    public String health() {
        return "OK - 서버 정상 동작 중";
    }
    
    @GetMapping("/api/status")
    public java.util.Map<String, Object> status() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        status.put("status", "running");
        status.put("service", "elderberry-backend");
        status.put("version", "1.0.0");
        status.put("timestamp", java.time.LocalDateTime.now());
        status.put("message", "로그 기반 디버깅 시스템 - 백엔드 정상 동작");
        return status;
    }
    
    @GetMapping("/api/test")
    public java.util.Map<String, Object> test() {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "API 테스트 성공");
        response.put("frontend_url", "http://localhost:5173");
        response.put("backend_url", "http://localhost:8080");
        return response;
    }
} 