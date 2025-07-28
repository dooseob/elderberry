package com.globalcarelink.simple;

import com.globalcarelink.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Simple 프로파일용 인증 컨트롤러
 * Redis 의존성 없이 기본적인 로그인/로그아웃 기능만 제공
 */
@Tag(name = "Simple 인증 관리", description = "기본적인 로그인/로그아웃 기능")
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Profile("simple")
public class SimpleAuthController {
    
    private final SimpleMemberService memberService;
    private final SimpleJwtTokenProvider jwtTokenProvider;
    
    @Operation(
        summary = "회원가입 (Simple)",
        description = "새로운 회원을 등록합니다."
    )
    @PostMapping("/register")
    public ResponseEntity<MemberResponse> register(@RequestBody @Valid MemberRegisterRequest request,
                                                  HttpServletRequest httpRequest) {
        log.info("Simple 회원가입 요청: {} - IP: {}", request.getEmail(), getClientIpAddress(httpRequest));
        MemberResponse response = memberService.register(request);
        log.info("Simple 회원가입 완료: {}", response.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(
        summary = "로그인 (Simple)",
        description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다."
    )
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        log.info("Simple 로그인 요청: {} - IP: {}", request.getEmail(), getClientIpAddress(httpRequest));
        TokenResponse response = memberService.login(request);
        log.info("Simple 로그인 성공: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "토큰 갱신 (Simple)",
        description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다."
    )
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request,
                                                     HttpServletRequest httpRequest) {
        log.info("Simple 토큰 갱신 요청 - IP: {}", getClientIpAddress(httpRequest));
        
        SimpleJwtTokenProvider.TokenPair tokenPair = jwtTokenProvider.refreshAccessToken(request.getRefreshToken());
        String email = jwtTokenProvider.getEmailFromToken(tokenPair.getAccessToken());
        
        TokenResponse response = TokenResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(1800)
                .build();
        
        log.info("Simple 토큰 갱신 완료: {}", email);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "로그아웃 (Simple)",
        description = "현재 토큰을 무효화하여 로그아웃합니다."
    )
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication,
                                      @RequestHeader("Authorization") String authHeader) {
        if (authentication != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = authentication.getName();
            
            jwtTokenProvider.invalidateToken(token);
            log.info("Simple 로그아웃 완료: {}", email);
        }
        
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "모든 기기에서 로그아웃 (Simple)",
        description = "사용자의 모든 토큰을 무효화하여 모든 기기에서 로그아웃합니다."
    )
    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutFromAllDevices(Authentication authentication) {
        if (authentication != null) {
            String email = authentication.getName();
            jwtTokenProvider.invalidateAllUserTokens(email);
            log.info("Simple 모든 기기에서 로그아웃 완료: {}", email);
        }
        
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "토큰 유효성 검증 (Simple)",
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
        summary = "내 정보 조회 (Simple)",
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

    @Operation(
        summary = "내 정보 수정 (Simple)",
        description = "현재 로그인한 사용자의 정보를 수정합니다."
    )
    @PutMapping("/me")
    public ResponseEntity<MemberResponse> updateMyInfo(Authentication authentication,
                                                      @Valid @RequestBody MemberUpdateRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = authentication.getName();
        MemberResponse response = memberService.updateMember(email, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "계정 비활성화 (Simple)",
        description = "현재 로그인한 사용자의 계정을 비활성화합니다."
    )
    @PostMapping("/deactivate")
    public ResponseEntity<Void> deactivateAccount(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = authentication.getName();
        memberService.deactivateMember(email);
        return ResponseEntity.ok().build();
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