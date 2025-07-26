package com.globalcarelink.common.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA 라우팅 지원 컨트롤러
 * React Router의 클라이언트 사이드 라우팅을 지원하기 위해
 * 모든 비API 경로를 index.html로 포워딩
 */
@Controller
public class SpaController {

    /**
     * React Router 지원을 위한 폴백 핸들러
     * API 경로가 아닌 모든 경로를 index.html로 포워딩
     * 
     * 예외 경로:
     * - /api/** : REST API 경로
     * - /h2-console/** : H2 데이터베이스 콘솔
     * - /actuator/** : Spring Boot Actuator
     * - /swagger-ui/** : Swagger UI
     * - /static/** : 정적 리소스 (CSS, JS, 이미지 등)
     */
    @RequestMapping(value = {
        "/",
        "/{path:[^\\.]*}",
        "/{path:^(?!api|h2-console|actuator|swagger-ui|static).*}/**"
    })
    public String forward() {
        // React 앱의 index.html로 포워딩
        return "forward:/index.html";
    }
}