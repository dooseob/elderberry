package com.globalcarelink.chatbot;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * 챗봇 프록시 컨트롤러
 * Python 챗봇 서버로의 요청을 프록시하여 통합 API 제공
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotProxyController {

    private final WebClient webClient;
    
    @Value("${app.chatbot.base-url:http://localhost:8000}")
    private String chatbotBaseUrl;
    
    /**
     * 챗봇 대화 요청 프록시
     */
    @PostMapping("/chat")
    public Mono<ResponseEntity<Object>> chat(@RequestBody Object request) {
        log.info("챗봇 대화 요청 프록시: {}", request);
        
        return webClient
                .post()
                .uri(chatbotBaseUrl + "/chat")
                .bodyValue(request)
                .retrieve()
                .toEntity(Object.class)
                .doOnSuccess(response -> log.info("챗봇 응답 받음: {}", response.getStatusCode()))
                .doOnError(error -> log.error("챗봇 요청 실패", error));
    }
    
    /**
     * 챗봇 히스토리 조회 프록시
     */
    @GetMapping("/history/{userId}")
    public Mono<ResponseEntity<Object>> getHistory(@PathVariable String userId) {
        log.info("챗봇 히스토리 조회 프록시: 사용자ID={}", userId);
        
        return webClient
                .get()
                .uri(chatbotBaseUrl + "/history/" + userId)
                .retrieve()
                .toEntity(Object.class);
    }
    
    /**
     * 챗봇 상태 확인 프록시
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<Object>> health() {
        return webClient
                .get()
                .uri(chatbotBaseUrl + "/health")
                .retrieve()
                .toEntity(Object.class);
    }
}