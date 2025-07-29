# Spring Boot HTTP 메시지 컨버터 문제 분석 보고서

## 📋 문제 요약

**문제 ID**: BACKEND-003  
**심각도**: [CRITICAL]  
**발생일**: 2025-07-29  
**해결 상태**: 분석 완료, 해결 방안 도출 중  
**소요 시간**: 4시간 (분석 단계)  

## 🔍 근본 원인 분석

### 문제 현상
- **증상**: Spring Boot에서 JSON → 객체 변환이 완전히 실패
- **영향 범위**: 모든 `@RequestBody` 사용 엔드포인트
- **에러 타입**: `HttpMessageNotReadableException` - MESSAGE_NOT_READABLE

### 테스트 검증 결과
| 테스트 엔드포인트 | 요청 타입 | 결과 | 상세 |
|---|---|---|---|
| `/api/auth/login-test` | Raw String | ✅ 정상 | 단순 문자열 파싱 성공 |
| `/api/auth/login-dto-test` | LoginRequest DTO | ❌ 실패 | MESSAGE_NOT_READABLE |
| `/api/auth/login-simple-test` | Simple Class | ❌ 실패 | MESSAGE_NOT_READABLE |
| `/api/auth/login-map-test` | Map<String, Object> | ❌ 실패 | MESSAGE_NOT_READABLE |

### 분석 도구 활용
- **Sequential Thinking**: 단계별 논리적 문제 분석
- **Context7**: Spring Boot HTTP 메시지 컨버터 최신 문서 조사
- **Memory Bank**: 유사 문제 패턴 및 해결 방안 저장

## 🔧 Context7 조사 결과

### Spring Boot HTTP 메시지 컨버터 구조
```java
// 핵심 컴포넌트들
org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
org.springframework.boot.http.converter.autoconfigure.HttpMessageConverters
org.springframework.web.servlet.config.annotation.WebMvcConfigurer
```

### 가능한 원인들
1. **Jackson 메시지 컨버터 설정 충돌**
2. **커스텀 WebMvcConfigurer에서 기본 컨버터 덮어쓰기**
3. **필터 체인에서 요청 본문 소비 문제**
4. **ContentType 불일치 (application/json 처리 실패)**

## 🎯 해결 전략

### 1단계: 메시지 컨버터 상태 진단
```java
@RestController
public class DiagnosticController {
    
    @Autowired
    private HttpMessageConverters httpMessageConverters;
    
    @GetMapping("/api/debug/converters")
    public List<String> getConverters() {
        return httpMessageConverters.getConverters().stream()
            .map(converter -> converter.getClass().getSimpleName())
            .collect(Collectors.toList());
    }
}
```

### 2단계: WebMvcConfigurer 검토
- 현재 설정된 커스텀 WebMvcConfigurer 확인
- `configureMessageConverters` 메서드 덮어쓰기 여부 점검

### 3단계: 필터 체인 분석
- Security 필터에서 요청 본문 소비 여부 확인
- `HttpServletRequestWrapper` 사용 여부 점검

### 4단계: Jackson 설정 확인
```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
    deserialization:
      fail-on-unknown-properties: false
```

## 📊 5개 에이전트 시스템 협업 결과

### 에이전트별 역할
- **CLAUDE_GUIDE**: 프로젝트 가이드라인 준수 확인
- **DEBUG**: 로그 기반 문제 분석 및 진단
- **API_DOCUMENTATION**: API 엔드포인트 문서화 및 테스트
- **TROUBLESHOOTING**: 문제 해결 방안 도출 및 추적
- **GOOGLE_SEO**: (해당 없음)

### MCP 도구 활용
- **Sequential Thinking**: 복잡한 문제를 5단계로 체계적 분석
- **Context7**: Spring Boot 3.x HTTP 메시지 컨버터 최신 문서 조사
- **Memory**: 분석 결과 및 해결 패턴 지식 저장소에 축적
- **Filesystem**: 프로젝트 구조 및 설정 파일 실시간 추적

## 🚀 다음 단계

### 즉시 실행 (Priority 1)
1. **메시지 컨버터 진단 엔드포인트 추가**
2. **WebMvcConfigurer 설정 검토**
3. **Security 필터 체인 분석**

### 단기 목표 (Priority 2)
1. **Jackson 설정 최적화**
2. **ContentType 헤더 검증 강화**
3. **에러 핸들링 개선**

### 장기 목표 (Priority 3)
1. **메시지 컨버터 커스터마이징**
2. **성능 최적화**
3. **모니터링 시스템 구축**

## 📚 관련 리소스

- [Spring Boot HTTP Message Converters Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.message-converters)
- [Jackson Configuration Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/appendix-application-properties.html#appendix.application-properties.json)
- [WebMvcConfigurer Customization Guide](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-config)

## 🏷️ 태그
`[CRITICAL]` `[BACKEND]` `[SPRING-BOOT]` `[HTTP-CONVERTER]` `[JSON-PARSING]` `[LOGIN-SYSTEM]` `[MCP-ANALYSIS]`

---
**작성**: MCP 통합 에이전트 시스템 (Context7 + Sequential Thinking + Memory)  
**업데이트**: 2025-07-29  
**다음 검토**: Spring Boot 메시지 컨버터 설정 수정 후