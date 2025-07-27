package com.globalcarelink.chatbot;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import reactor.core.publisher.Mono;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.Map;

/**
 * 챗봇 프록시 컨트롤러
 * Python 챗봇 서버로의 요청을 프록시하는 Spring Boot 구현
 * 기존 SimpleChatbotProxy의 기능을 WebClient를 사용하여 재구현
 */
@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Slf4j
public class ChatbotProxyController {

    private final WebClient webClient;
    
    @Value("${chatbot.service.url:http://localhost:8000}")
    private String chatbotBaseUrl;
    
    @Value("${chatbot.service.timeout:10}")
    private int timeoutSeconds;

    public ChatbotProxyController() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(5 * 1024 * 1024)) // 5MB
                .build();
    }

    /**
     * 모든 챗봇 API 요청을 Python 서버로 프록시
     */
    @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public Mono<ResponseEntity<Object>> proxyToChatbotService(
            HttpServletRequest request,
            @RequestBody(required = false) Object body,
            @RequestHeader HttpHeaders headers) {
        
        String method = request.getMethod();
        String path = request.getRequestURI().replace("/api/chatbot", "");
        if (path.isEmpty()) {
            path = "/";
        }
        
        String targetUrl = chatbotBaseUrl + path;
        
        log.debug("챗봇 API 프록시: {} {} -> {}", method, request.getRequestURI(), targetUrl);

        // 요청 헤더 필터링 (Host 헤더 제거)
        HttpHeaders filteredHeaders = new HttpHeaders();
        headers.forEach((key, values) -> {
            if (!key.toLowerCase().equals("host") && 
                !key.toLowerCase().equals("content-length")) {
                filteredHeaders.addAll(key, values);
            }
        });

        // WebClient 요청 빌드
        WebClient.RequestBodySpec requestSpec = webClient
                .method(org.springframework.http.HttpMethod.valueOf(method))
                .uri(targetUrl)
                .headers(httpHeaders -> httpHeaders.addAll(filteredHeaders))
                .timeout(Duration.ofSeconds(timeoutSeconds));

        // POST/PUT 요청 시 바디 포함
        Mono<ResponseEntity<Object>> response;
        if (body != null && ("POST".equals(method) || "PUT".equals(method))) {
            response = requestSpec
                    .bodyValue(body)
                    .retrieve()
                    .toEntity(Object.class);
        } else {
            response = requestSpec
                    .retrieve()
                    .toEntity(Object.class);
        }

        // 에러 처리
        return response
                .doOnError(throwable -> log.error("챗봇 서비스 프록시 에러: {}", throwable.getMessage()))
                .onErrorReturn(createErrorResponse());
    }

    /**
     * 챗봇 서비스 상태 확인
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> getChatbotHealth() {
        log.debug("챗봇 서비스 상태 확인");
        
        return webClient
                .get()
                .uri(chatbotBaseUrl + "/health")
                .timeout(Duration.ofSeconds(5))
                .retrieve()
                .toEntity(Object.class)
                .map(response -> ResponseEntity.ok(Map.of(
                        "status", "connected",
                        "chatbot_service", "available",
                        "url", chatbotBaseUrl,
                        "timestamp", java.time.LocalDateTime.now()
                )))
                .onErrorReturn(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of(
                                "status", "disconnected",
                                "chatbot_service", "unavailable",
                                "url", chatbotBaseUrl,
                                "error", "챗봇 서비스에 연결할 수 없습니다",
                                "timestamp", java.time.LocalDateTime.now()
                        )));
    }

    /**
     * 에러 응답 생성
     */
    private ResponseEntity<Object> createErrorResponse() {
        Map<String, Object> errorResponse = Map.of(
                "error", "service_unavailable",
                "message", "챗봇 서비스에 연결할 수 없습니다",
                "timestamp", java.time.LocalDateTime.now(),
                "suggestion", "잠시 후 다시 시도해주세요"
        );
        
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(errorResponse);
    }
}