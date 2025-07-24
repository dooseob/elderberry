package com.globalcarelink;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * 단순 챗봇 프록시 핸들러
 * Python 챗봇 서버로의 요청을 프록시하는 최소한의 구현
 * Plain Java 서버에 추가되는 단일 클래스 솔루션
 */
public class SimpleChatbotProxy implements HttpHandler {
    
    private static final String CHATBOT_BASE_URL = "http://localhost:8000";
    private static final int TIMEOUT = 10000; // 10초
    
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        
        try {
            // /api/chatbot/* -> Python 서버로 프록시
            String pythonPath = path.replace("/api/chatbot", "");
            if (pythonPath.isEmpty()) {
                pythonPath = "/";
            }
            
            String targetUrl = CHATBOT_BASE_URL + pythonPath;
            
            // Python 서버로 요청 전달
            HttpURLConnection connection = (HttpURLConnection) new URL(targetUrl).openConnection();
            connection.setRequestMethod(method);
            connection.setConnectTimeout(TIMEOUT);
            connection.setReadTimeout(TIMEOUT);
            connection.setDoOutput(true);
            
            // 요청 헤더 복사
            exchange.getRequestHeaders().forEach((key, values) -> {
                if (!key.toLowerCase().startsWith("host")) {
                    connection.setRequestProperty(key, String.join(",", values));
                }
            });
            
            // POST/PUT 요청 시 바디 전달
            if ("POST".equals(method) || "PUT".equals(method)) {
                try (InputStream requestBody = exchange.getRequestBody();
                     OutputStream outputStream = connection.getOutputStream()) {
                    requestBody.transferTo(outputStream);
                }
            }
            
            // Python 서버 응답 받기
            int responseCode = connection.getResponseCode();
            
            // 응답 헤더 설정
            connection.getHeaderFields().forEach((key, values) -> {
                if (key != null && !key.toLowerCase().equals("transfer-encoding")) {
                    exchange.getResponseHeaders().put(key, values);
                }
            });
            
            // 응답 전달
            try (InputStream pythonResponse = (responseCode >= 400) 
                    ? connection.getErrorStream() 
                    : connection.getInputStream()) {
                
                if (pythonResponse != null) {
                    byte[] responseBytes = pythonResponse.readAllBytes();
                    exchange.sendResponseHeaders(responseCode, responseBytes.length);
                    
                    try (OutputStream responseBody = exchange.getResponseBody()) {
                        responseBody.write(responseBytes);
                    }
                } else {
                    // 빈 응답
                    exchange.sendResponseHeaders(responseCode, 0);
                }
            }
            
        } catch (Exception e) {
            // 챗봇 서버 연결 실패 시 에러 응답
            String errorMessage = "챗봇 서비스에 연결할 수 없습니다: " + e.getMessage();
            byte[] errorBytes = errorMessage.getBytes(StandardCharsets.UTF_8);
            
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(503, errorBytes.length);
            
            try (OutputStream responseBody = exchange.getResponseBody()) {
                responseBody.write(errorBytes);
            }
        }
    }
}