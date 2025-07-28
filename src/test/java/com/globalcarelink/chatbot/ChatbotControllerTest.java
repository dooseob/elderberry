package com.globalcarelink.chatbot;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ChatbotProxyController 테스트
 * 챗봇 프록시 컨트롤러의 기본 기능 검증
 * 
 * 테스트 범위:
 * 1. 챗봇 서비스 상태 확인
 * 2. 프록시 요청 처리
 * 3. 오류 처리
 */
@WebMvcTest(ChatbotProxyController.class)
@ActiveProfiles("test")
@DisplayName("챗봇 프록시 컨트롤러 테스트")
class ChatbotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WebClient webClient;

    @MockBean
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @MockBean
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @MockBean
    private WebClient.ResponseSpec responseSpec;

    @Test
    @DisplayName("챗봇 서비스 상태 확인 - 연결 성공")
    void getChatbotHealth_WhenServiceAvailable_ShouldReturnConnectedStatus() throws Exception {
        // given
        Map<String, Object> healthResponse = Map.of(
                "status", "connected",
                "chatbot_service", "available"
        );

        // when & then
        mockMvc.perform(get("/api/chatbot/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.chatbot_service").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("챗봇 프록시 - POST 요청 처리")
    void proxyChatbotRequest_WithPostRequest_ShouldProcessCorrectly() throws Exception {
        // given
        Map<String, Object> requestBody = Map.of(
                "message", "안녕하세요",
                "language", "ko"
        );

        // when & then
        mockMvc.perform(post("/api/chatbot/proxy/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("챗봇 프록시 - GET 요청 처리")
    void proxyChatbotRequest_WithGetRequest_ShouldProcessCorrectly() throws Exception {
        // when & then
        mockMvc.perform(get("/api/chatbot/proxy/status"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("챗봇 프록시 - 잘못된 경로")
    void proxyChatbotRequest_WithInvalidPath_ShouldHandleGracefully() throws Exception {
        // when & then
        mockMvc.perform(get("/api/chatbot/proxy/../../../etc/passwd"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("챗봇 프록시 - 빈 요청 바디")
    void proxyChatbotRequest_WithEmptyBody_ShouldProcessCorrectly() throws Exception {
        // when & then
        mockMvc.perform(post("/api/chatbot/proxy/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("챗봇 프록시 - 대용량 요청 처리")
    void proxyChatbotRequest_WithLargeRequest_ShouldHandleAppropriately() throws Exception {
        // given
        StringBuilder largeMessage = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            largeMessage.append("이것은 매우 긴 메시지입니다. ");
        }
        
        Map<String, Object> requestBody = Map.of(
                "message", largeMessage.toString()
        );

        // when & then
        mockMvc.perform(post("/api/chatbot/proxy/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("챗봇 프록시 - 특수 문자 처리")
    void proxyChatbotRequest_WithSpecialCharacters_ShouldProcessCorrectly() throws Exception {
        // given
        Map<String, Object> requestBody = Map.of(
                "message", "특수문자 테스트: !@#$%^&*()_+-={}[]|\\:;\"'<>?,./"
        );

        // when & then
        mockMvc.perform(post("/api/chatbot/proxy/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("챗봇 프록시 - 다국어 지원")
    void proxyChatbotRequest_WithMultiLanguage_ShouldProcessCorrectly() throws Exception {
        // given
        Map<String, Object> requestBody = Map.of(
                "message", "Hello 안녕하세요 你好 こんにちは",
                "language", "multi"
        );

        // when & then
        mockMvc.perform(post("/api/chatbot/proxy/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk());
    }
}