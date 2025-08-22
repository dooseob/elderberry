# Clerk 백엔드 통합 가이드

## 개요

Clerk 인증 시스템을 엘더베리 프로젝트의 Spring Boot 백엔드와 통합하기 위한 가이드입니다.

## 1. 백엔드 의존성 추가

### Gradle 의존성 (build.gradle.kts)

```kotlin
dependencies {
    // Clerk JWT 검증을 위한 의존성
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    implementation("io.jsonwebtoken:jjwt-impl:0.11.5")
    implementation("io.jsonwebtoken:jjwt-jackson:0.11.5")
    
    // HTTP 클라이언트 (Clerk API 호출용)
    implementation("org.springframework.boot:spring-boot-starter-webflux")
}
```

## 2. 백엔드 API 엔드포인트 구현

### ClerkAuthController.java

```java
@RestController
@RequestMapping("/api/auth/clerk")
@Slf4j
public class ClerkAuthController {

    @Autowired
    private ClerkService clerkService;
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private JwtService jwtService;

    /**
     * Clerk 사용자를 백엔드와 동기화
     */
    @PostMapping("/sync")
    public ResponseEntity<ClerkSyncResponse> syncClerkUser(
            @RequestBody ClerkSyncRequest request) {
        try {
            // 1. Clerk 토큰 검증
            ClerkUser clerkUser = clerkService.verifyToken(request.getClerkToken());
            
            // 2. 기존 사용자 조회 또는 생성
            Member member = memberService.findByEmailOrCreate(
                clerkUser.getEmail(),
                clerkUser.getName(),
                clerkUser.getImageUrl()
            );
            
            // 3. Clerk 사용자 ID 연결
            memberService.linkClerkUser(member.getId(), clerkUser.getId());
            
            // 4. JWT 토큰 생성
            String accessToken = jwtService.generateAccessToken(member);
            String refreshToken = jwtService.generateRefreshToken(member);
            
            ClerkSyncResponse response = ClerkSyncResponse.builder()
                .success(true)
                .memberId(member.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(MemberDto.from(member))
                .build();
                
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Clerk 동기화 실패", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ClerkSyncResponse.builder()
                    .success(false)
                    .build());
        }
    }

    /**
     * Clerk 토큰 검증
     */
    @PostMapping("/validate")
    public ResponseEntity<ClerkValidationResponse> validateClerkToken(
            @RequestBody ClerkValidationRequest request) {
        try {
            ClerkUser clerkUser = clerkService.verifyToken(request.getToken());
            
            ClerkValidationResponse response = ClerkValidationResponse.builder()
                .valid(true)
                .userId(clerkUser.getId())
                .email(clerkUser.getEmail())
                .build();
                
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.warn("Clerk 토큰 검증 실패", e);
            return ResponseEntity.ok(ClerkValidationResponse.builder()
                .valid(false)
                .build());
        }
    }

    /**
     * 기존 사용자를 Clerk 계정과 연결
     */
    @PostMapping("/link")
    public ResponseEntity<ClerkLinkResponse> linkExistingUser(
            @RequestBody ClerkLinkRequest request,
            @RequestHeader("Authorization") String authorization) {
        try {
            // 1. 기존 JWT 토큰에서 사용자 정보 추출
            String token = authorization.replace("Bearer ", "");
            Member existingMember = jwtService.getMemberFromToken(token);
            
            // 2. 이메일 매칭 확인
            if (!existingMember.getEmail().equals(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(ClerkLinkResponse.builder()
                        .success(false)
                        .message("이메일이 일치하지 않습니다.")
                        .build());
            }
            
            // 3. Clerk 사용자 ID 연결
            memberService.linkClerkUser(existingMember.getId(), request.getClerkUserId());
            
            return ResponseEntity.ok(ClerkLinkResponse.builder()
                .success(true)
                .message("계정이 성공적으로 연결되었습니다.")
                .build());
                
        } catch (Exception e) {
            log.error("계정 연결 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ClerkLinkResponse.builder()
                    .success(false)
                    .message("계정 연결에 실패했습니다.")
                    .build());
        }
    }
}
```

### ClerkService.java

```java
@Service
@Slf4j
public class ClerkService {

    @Value("${clerk.secret-key}")
    private String clerkSecretKey;
    
    @Value("${clerk.jwks-url:https://api.clerk.dev/v1/jwks}")
    private String jwksUrl;

    private final WebClient webClient;

    public ClerkService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Clerk JWT 토큰 검증
     */
    public ClerkUser verifyToken(String token) {
        try {
            // 1. JWKS에서 공개 키 가져오기
            JsonWebKeySet jwks = getJwks();
            
            // 2. JWT 토큰 파싱 및 검증
            Claims claims = Jwts.parserBuilder()
                .setSigningKeyResolver(new JwksSigningKeyResolver(jwks))
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            // 3. Clerk 사용자 정보 추출
            return ClerkUser.builder()
                .id(claims.getSubject())
                .email(claims.get("email", String.class))
                .name(claims.get("name", String.class))
                .imageUrl(claims.get("image_url", String.class))
                .build();
                
        } catch (Exception e) {
            log.error("Clerk 토큰 검증 실패", e);
            throw new InvalidTokenException("Invalid Clerk token");
        }
    }

    /**
     * Clerk JWKS 가져오기
     */
    private JsonWebKeySet getJwks() {
        try {
            String jwksJson = webClient.get()
                .uri(jwksUrl)
                .header("Authorization", "Bearer " + clerkSecretKey)
                .retrieve()
                .bodyToMono(String.class)
                .block();
                
            return JsonWebKeySet.parse(jwksJson);
            
        } catch (Exception e) {
            log.error("JWKS 가져오기 실패", e);
            throw new RuntimeException("Failed to fetch JWKS");
        }
    }
}
```

## 3. 데이터베이스 스키마 확장

### members 테이블 확장

```sql
ALTER TABLE members ADD COLUMN clerk_user_id VARCHAR(255) UNIQUE;
ALTER TABLE members ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'JWT';
ALTER TABLE members ADD COLUMN created_via_clerk BOOLEAN DEFAULT FALSE;

-- 인덱스 추가
CREATE INDEX idx_members_clerk_user_id ON members(clerk_user_id);
CREATE INDEX idx_members_auth_provider ON members(auth_provider);
```

## 4. 환경변수 설정

### application.yml

```yaml
clerk:
  secret-key: ${CLERK_SECRET_KEY}
  jwks-url: ${CLERK_JWKS_URL:https://api.clerk.dev/v1/jwks}
  webhook-secret: ${CLERK_WEBHOOK_SECRET}

# 기존 JWT 설정과 공존
jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800}
```

### .env (백엔드)

```bash
# Clerk 설정
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=your_webhook_secret_here

# 기존 JWT 설정 유지
JWT_SECRET=your_jwt_secret_here
```

## 5. 점진적 마이그레이션 전략

### Phase 1: 병렬 운영
- 기존 JWT 인증과 Clerk 인증을 동시에 지원
- 신규 사용자는 Clerk 사용 권장
- 기존 사용자는 JWT 계속 사용

### Phase 2: 사용자 선택적 마이그레이션
- 기존 사용자에게 Clerk 마이그레이션 옵션 제공
- 이메일 기반 계정 연결
- 마이그레이션 인센티브 제공

### Phase 3: 완전 전환
- 모든 신규 가입을 Clerk로 제한
- JWT 인증을 읽기 전용으로 전환
- 점진적 JWT 지원 중단

## 6. 보안 고려사항

### 토큰 검증
- Clerk JWT는 항상 서버사이드에서 검증
- JWKS 캐싱으로 성능 최적화
- 토큰 만료 시간 적절히 설정

### 사용자 정보 동기화
- Clerk Webhook을 통한 실시간 동기화
- 사용자 정보 변경 시 자동 업데이트
- 데이터 일관성 보장

### 계정 보안
- 이메일 중복 가입 방지
- 계정 연결 시 추가 인증 단계
- 민감한 정보 암호화 저장

## 7. 모니터링 및 로깅

### 로그 수집
- Clerk 인증 성공/실패 로그
- 사용자 동기화 로그
- 성능 메트릭 수집

### 알림 설정
- 인증 실패 임계값 알림
- 동기화 오류 알림
- 시스템 상태 모니터링

## 8. 테스트 전략

### 단위 테스트
- ClerkService 토큰 검증 테스트
- 사용자 동기화 로직 테스트
- 계정 연결 로직 테스트

### 통합 테스트
- 전체 인증 플로우 테스트
- 기존 JWT와 Clerk 병렬 운영 테스트
- 마이그레이션 시나리오 테스트

## 구현 우선순위

1. **즉시 구현**: ClerkService, JWT 검증
2. **1주 내**: 사용자 동기화 API
3. **2주 내**: 계정 연결 기능
4. **1개월 내**: 마이그레이션 도구, 모니터링

이 가이드를 따라 구현하면 기존 JWT 인증 시스템과 Clerk를 점진적으로 통합할 수 있습니다.