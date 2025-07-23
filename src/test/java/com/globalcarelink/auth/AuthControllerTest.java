package com.globalcarelink.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalcarelink.auth.dto.*;
import com.globalcarelink.common.exception.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
@DisplayName("인증 Controller 통합 테스트")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MemberService memberService;

    @Autowired
    private ObjectMapper objectMapper;

    private MemberRegisterRequest validRegisterRequest;
    private MemberRegisterRequest invalidRegisterRequest;
    private LoginRequest validLoginRequest;
    private LoginRequest invalidLoginRequest;
    private MemberResponse memberResponse;
    private TokenResponse tokenResponse;

    @BeforeEach
    void setUp() {
        validRegisterRequest = MemberRegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .name("테스트사용자")
                .phoneNumber("010-1234-5678")
                .role(MemberRole.USER_DOMESTIC)
                .isJobSeeker(true)
                .language("ko")
                .region("서울")
                .build();

        invalidRegisterRequest = MemberRegisterRequest.builder()
                .email("invalid-email")
                .password("123")
                .name("")
                .role(null)
                .build();

        validLoginRequest = new LoginRequest("test@example.com", "password123");
        invalidLoginRequest = new LoginRequest("", "");

        memberResponse = MemberResponse.builder()
                .id(1L)
                .email("test@example.com")
                .name("테스트사용자")
                .phoneNumber("010-1234-5678")
                .role(MemberRole.USER_DOMESTIC)
                .isJobSeeker(true)
                .isActive(true)
                .language("ko")
                .region("서울")
                .build();

        tokenResponse = TokenResponse.builder()
                .accessToken("jwt_access_token")
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .member(memberResponse)
                .build();
    }

    @Test
    @DisplayName("회원가입 성공")
    void register_Success() throws Exception {
        given(memberService.register(validRegisterRequest)).willReturn(memberResponse);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("테스트사용자"))
                .andExpect(jsonPath("$.role").value("USER_DOMESTIC"))
                .andExpect(jsonPath("$.isJobSeeker").value(true))
                .andExpect(jsonPath("$.isActive").value(true))
                .andExpect(jsonPath("$.language").value("ko"))
                .andExpect(jsonPath("$.region").value("서울"));
    }

    @Test
    @DisplayName("회원가입 실패 - 유효성 검증 오류")
    void register_Fail_ValidationError() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRegisterRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("입력 값이 올바르지 않습니다"));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복")
    void register_Fail_EmailConflict() throws Exception {
        given(memberService.register(validRegisterRequest))
                .willThrow(new CustomException.Conflict("이미 존재하는 이메일입니다"));

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("이미 존재하는 이메일입니다"));
    }

    @Test
    @DisplayName("회원가입 실패 - JSON 형식 오류")
    void register_Fail_InvalidJson() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("invalid json"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("로그인 성공")
    void login_Success() throws Exception {
        given(memberService.login(validLoginRequest)).willReturn(tokenResponse);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").value("jwt_access_token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(86400000L))
                .andExpect(jsonPath("$.member.email").value("test@example.com"))
                .andExpect(jsonPath("$.member.role").value("USER_DOMESTIC"));
    }

    @Test
    @DisplayName("로그인 실패 - 유효성 검증 오류")
    void login_Fail_ValidationError() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLoginRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("입력 값이 올바르지 않습니다"));
    }

    @Test
    @DisplayName("로그인 실패 - 인증 오류")
    void login_Fail_Unauthorized() throws Exception {
        given(memberService.login(validLoginRequest))
                .willThrow(new CustomException.Unauthorized("이메일 또는 비밀번호가 올바르지 않습니다"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andDo(print())
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 올바르지 않습니다"));
    }

    @Test
    @DisplayName("로그인 실패 - 계정 비활성화")
    void login_Fail_Forbidden() throws Exception {
        given(memberService.login(validLoginRequest))
                .willThrow(new CustomException.Forbidden("비활성화된 계정입니다"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andDo(print())
                .andExpect(status().isForbidden())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("비활성화된 계정입니다"));
    }

    @Test
    @DisplayName("내 정보 조회 성공")
    @WithMockUser(username = "test@example.com", roles = "USER_DOMESTIC")
    void getCurrentMember_Success() throws Exception {
        given(memberService.findByEmail("test@example.com")).willReturn(memberResponse);

        mockMvc.perform(get("/api/auth/me")
                        .param("email", "test@example.com"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("테스트사용자"))
                .andExpect(jsonPath("$.role").value("USER_DOMESTIC"));
    }

    @Test
    @DisplayName("내 정보 조회 실패 - 존재하지 않는 사용자")
    @WithMockUser(username = "notexist@example.com", roles = "USER")
    void getCurrentMember_Fail_NotFound() throws Exception {
        given(memberService.findByEmail("notexist@example.com"))
                .willThrow(new CustomException.NotFound("존재하지 않는 회원입니다"));

        mockMvc.perform(get("/api/auth/me")
                        .param("email", "notexist@example.com"))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("존재하지 않는 회원입니다"));
    }

    @Test
    @DisplayName("내 정보 조회 실패 - 인증되지 않은 사용자")
    void getCurrentMember_Fail_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .param("email", "test@example.com"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("API 접근 실패 - CSRF 토큰 없음")
    void register_Fail_NoCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("요청 본문 없이 POST 요청")
    void register_Fail_NoRequestBody() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Content-Type 누락")
    void register_Fail_NoContentType() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andDo(print())
                .andExpect(status().isUnsupportedMediaType());
    }
}