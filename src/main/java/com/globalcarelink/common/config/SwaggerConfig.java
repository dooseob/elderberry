package com.globalcarelink.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger/OpenAPI 3.0 설정
 * 
 * API 문서화 및 테스트 인터페이스 제공
 * - JWT Bearer 토큰 인증 지원
 * - 환경별 서버 설정
 * - 상세한 API 정보 및 연락처
 */
@Configuration
public class SwaggerConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(apiServers())
                .addSecurityItem(securityRequirement())
                .components(securityComponents());
    }

    private Info apiInfo() {
        return new Info()
                .title("🌟 Elderberry API")
                .description("""
                        # 엘더베리 - AI 기반 돌봄 서비스 매칭 플랫폼 API
                        
                        해외 거주 한인을 위한 종합 돌봄 서비스 매칭 플랫폼의 RESTful API입니다.
                        
                        ## 🎯 주요 기능
                        - **회원 관리**: 국내/해외 회원 가입, 로그인, 프로필 관리
                        - **건강 평가**: AI 기반 건강 상태 평가 및 추천
                        - **시설 매칭**: 요양시설, 병원, 약국 검색 및 매칭
                        - **코디네이터 매칭**: 전문 코디네이터 연결 서비스
                        - **실시간 채팅**: WebSocket 기반 상담 채팅
                        - **알림 시스템**: 실시간 푸시 알림
                        - **구인구직**: 돌봄 관련 일자리 매칭
                        
                        ## 🔐 인증 방법
                        1. `/api/auth/login` 엔드포인트로 로그인
                        2. 응답에서 받은 JWT 토큰을 복사
                        3. 우측 상단 'Authorize' 버튼 클릭
                        4. `Bearer {토큰}` 형식으로 입력
                        
                        ## 📱 테스트 계정
                        - **이메일**: test.domestic@example.com
                        - **비밀번호**: Password123!
                        
                        ## ✅ 검증된 API 엔드포인트
                        - **인증**: `/api/auth/login`, `/api/auth/me` - 정상 동작
                        - **시설**: `/api/facilities` - 정상 동작 (4개 시설 데이터)
                        - **건강평가**: `/api/health-assessments/*` - 정상 동작
                        - **코디네이터**: `/api/coordinator-matching/*` - 일부 권한 제한/서버 오류
                        
                        ## 🌐 환경별 접속
                        - **개발**: http://localhost:8080
                        - **스테이징**: https://staging.elderberry.example.com
                        - **프로덕션**: https://elderberry.example.com
                        
                        ## 📊 API 테스트 현황
                        - **총 테스트**: 8개 엔드포인트
                        - **성공**: 5개 (62.5%)
                        - **권한 제한**: 1개 (12.5%)
                        - **서버 오류**: 2개 (25.0%)
                        - **상세 결과**: `/docs/API_TEST_RESULTS.md` 참조
                        """)
                .version("v1.0.0")
                .contact(new Contact()
                        .name("엘더베리 개발팀")
                        .email("dev@elderberry.example.com")
                        .url("https://github.com/globalcarelink/elderberry"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    private List<Server> apiServers() {
        return List.of(
                new Server()
                        .url("http://localhost:" + serverPort)
                        .description("로컬 개발 서버"),
                new Server()
                        .url("https://staging.elderberry.example.com")
                        .description("스테이징 서버"),
                new Server()
                        .url("https://elderberry.example.com")
                        .description("프로덕션 서버")
        );
    }

    private SecurityRequirement securityRequirement() {
        return new SecurityRequirement().addList("Bearer Authentication");
    }

    private Components securityComponents() {
        return new Components()
                .addSecuritySchemes("Bearer Authentication", 
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT 토큰을 입력하세요. 'Bearer ' 접두사는 자동으로 추가됩니다."));
    }
}