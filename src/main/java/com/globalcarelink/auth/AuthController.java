package com.globalcarelink.auth;

import com.globalcarelink.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증 관리", description = "회원가입, 로그인 등 인증 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final MemberService memberService;
    
    @Operation(
        summary = "회원가입",
        description = "새로운 회원을 등록합니다. 이메일 중복 체크를 포함합니다."
    )
    @PostMapping("/register")
    public ResponseEntity<MemberResponse> register(@RequestBody @Valid MemberRegisterRequest request) {
        MemberResponse response = memberService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(
        summary = "로그인",
        description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다."
    )
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        TokenResponse response = memberService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "내 정보 조회",
        description = "현재 로그인한 사용자의 정보를 조회합니다."
    )
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> getCurrentMember(@RequestParam String email) {
        MemberResponse response = memberService.findByEmail(email);
        return ResponseEntity.ok(response);
    }
}