package com.globalcarelink.auth;

import com.globalcarelink.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 인증 컨트롤러 (보안 강화 버전)
 * - 리프레시 토큰 지원
 * - 토큰 관리 기능
 * - 보안 로깅
 */
@Tag(name = "인증 관리", description = "회원가입, 로그인 등 인증 관련 API")
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final MemberService memberService;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Operation(
        summary = "회원가입",
        description = "새로운 회원을 등록합니다. 이메일 중복 체크를 포함합니다."
    )
    @PostMapping("/register")
    public ResponseEntity<MemberResponse> register(@RequestBody @Valid MemberRegisterRequest request,
                                                  HttpServletRequest httpRequest) {
        log.info("회원가입 요청: {} - IP: {}", request.getEmail(), getClientIpAddress(httpRequest));
        MemberResponse response = memberService.register(request);
        log.info("회원가입 완료: {}", response.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(
        summary = "로그인",
        description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다."
    )
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        log.info("로그인 요청: {} - IP: {}", request.getEmail(), getClientIpAddress(httpRequest));
        TokenResponse response = memberService.login(request);
        log.info("로그인 성공: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "토큰 갱신",
        description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다."
    )
    @PostMapping("/refresh")
    public ResponseEntity<EnhancedTokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request,
                                                             HttpServletRequest httpRequest) {
        log.info("토큰 갱신 요청 - IP: {}", getClientIpAddress(httpRequest));
        
        JwtTokenProvider.TokenPair tokenPair = jwtTokenProvider.refreshAccessToken(request.getRefreshToken());
        String email = jwtTokenProvider.getEmailFromToken(tokenPair.getAccessToken());
        
        EnhancedTokenResponse response = EnhancedTokenResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .accessTokenExpiresAt(tokenPair.getAccessTokenExpiresAt())
                .refreshTokenExpiresAt(tokenPair.getRefreshTokenExpiresAt())
                .tokenType("Bearer")
                .email(email)
                .build();
        
        log.info("토큰 갱신 완료: {}", email);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "로그아웃",
        description = "현재 토큰을 무효화하여 로그아웃합니다."
    )
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication,
                                      @RequestHeader("Authorization") String authHeader) {
        if (authentication != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = authentication.getName();
            
            jwtTokenProvider.invalidateToken(token);
            log.info("로그아웃 완료: {}", email);
        }
        
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "모든 기기에서 로그아웃",
        description = "사용자의 모든 토큰을 무효화하여 모든 기기에서 로그아웃합니다."
    )
    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutFromAllDevices(Authentication authentication) {
        if (authentication != null) {
            String email = authentication.getName();
            jwtTokenProvider.invalidateAllUserTokens(email);
            log.info("모든 기기에서 로그아웃 완료: {}", email);
        }
        
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "활성 토큰 목록 조회",
        description = "현재 사용자의 활성 토큰 목록을 조회합니다."
    )
    @GetMapping("/tokens")
    public ResponseEntity<List<TokenMetadataResponse>> getActiveTokens(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(List.of());
        }
        
        String email = authentication.getName();
        List<JwtTokenProvider.TokenMetadata> activeTokens = jwtTokenProvider.getUserActiveTokens(email);
        
        List<TokenMetadataResponse> response = activeTokens.stream()
                .map(metadata -> TokenMetadataResponse.builder()
                        .tokenId(metadata.getTokenId())
                        .type(metadata.getType().name())
                        .issuedAt(metadata.getIssuedAt())
                        .expiresAt(metadata.getExpiresAt())
                        .ipAddress(metadata.getIpAddress())
                        .userAgent(metadata.getUserAgent())
                        .build())
                .toList();
        
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "토큰 유효성 검증",
        description = "토큰의 유효성을 검증합니다."
    )
    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(@Valid @RequestBody TokenValidationRequest request) {
        try {
            boolean isValid = jwtTokenProvider.validateToken(request.getToken());
            String email = jwtTokenProvider.getEmailFromToken(request.getToken());
            
            TokenValidationResponse response = TokenValidationResponse.builder()
                    .valid(isValid)
                    .email(email)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            TokenValidationResponse response = TokenValidationResponse.builder()
                    .valid(false)
                    .error(e.getMessage())
                    .build();
            
            return ResponseEntity.ok(response);
        }
    }
    
    @Operation(
        summary = "내 정보 조회",
        description = "현재 로그인한 사용자의 정보를 조회합니다."
    )
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> getCurrentMember(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = authentication.getName();
        MemberResponse response = memberService.findByEmail(email);
        return ResponseEntity.ok(response);
    }

    // ===== 헬퍼 메서드 =====

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}