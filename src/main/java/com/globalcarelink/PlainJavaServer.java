package com.globalcarelink;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.time.LocalDateTime;

/**
 * 엘더베리 순수 Java HTTP 서버
 * 로그 기반 디버깅 시스템 테스트용 최소 백엔드
 */
public class PlainJavaServer {

    public static void main(String[] args) throws IOException {
        System.out.println("=== 엘더베리 백엔드 서버 시작 ===");
        System.out.println("포트: 8080");
        System.out.println("시작 시간: " + LocalDateTime.now());
        
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // CORS 헤더를 추가하는 핸들러
        server.createContext("/", new RootHandler());
        server.createContext("/health", new HealthHandler());
        server.createContext("/api/status", new StatusHandler());
        server.createContext("/api/test", new TestHandler());
        
        server.setExecutor(null);
        server.start();
        
        System.out.println("✓ 서버가 성공적으로 시작되었습니다!");
        System.out.println("✓ URL: http://localhost:8080");
        System.out.println("✓ 상태 확인: http://localhost:8080/health");
        System.out.println("✓ API 테스트: http://localhost:8080/api/test");
        System.out.println("✓ 서버를 중지하려면 Ctrl+C를 누르세요");
    }

    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            String response = "엘더베리 백엔드 서버가 실행 중입니다! 🌿\n\n" +
                            "사용 가능한 엔드포인트:\n" +
                            "- GET /health - 서버 상태 확인\n" +
                            "- GET /api/status - 상세 상태 정보\n" +
                            "- GET /api/test - API 테스트\n\n" +
                            "프론트엔드: http://localhost:5173\n" +
                            "현재 시간: " + LocalDateTime.now();
            
            exchange.sendResponseHeaders(200, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            String response = "OK - 서버 정상 동작 중";
            exchange.sendResponseHeaders(200, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            String jsonResponse = "{\n" +
                "  \"status\": \"running\",\n" +
                "  \"service\": \"elderberry-backend\",\n" +
                "  \"version\": \"1.0.0\",\n" +
                "  \"timestamp\": \"" + LocalDateTime.now() + "\",\n" +
                "  \"message\": \"로그 기반 디버깅 시스템 - 백엔드 정상 동작\",\n" +
                "  \"frontend_url\": \"http://localhost:5173\",\n" +
                "  \"backend_url\": \"http://localhost:8080\"\n" +
                "}";
            
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jsonResponse.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(jsonResponse.getBytes());
            os.close();
        }
    }

    static class TestHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            String jsonResponse = "{\n" +
                "  \"success\": true,\n" +
                "  \"message\": \"API 테스트 성공\",\n" +
                "  \"method\": \"" + exchange.getRequestMethod() + "\",\n" +
                "  \"path\": \"" + exchange.getRequestURI().getPath() + "\",\n" +
                "  \"timestamp\": \"" + LocalDateTime.now() + "\",\n" +
                "  \"cors_enabled\": true\n" +
                "}";
            
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, jsonResponse.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(jsonResponse.getBytes());
            os.close();
        }
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
} 