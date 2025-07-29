package com.globalcarelink.auth;

import com.globalcarelink.auth.dto.*;
import com.globalcarelink.common.exception.CustomException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
@DisplayName("회원 Service 테스트")
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private MemberService memberService;

    private Member testMember;
    private MemberRegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(memberService, "jwtExpiration", 86400000L);
        
        testMember = Member.builder()
                .id(1L)
                .email("test@example.com")
                .password("encoded_password")
                .name("테스트사용자")
                .phoneNumber("010-1234-5678")
                .role(MemberRole.USER_DOMESTIC)
                .isJobSeeker(true)
                .language("ko")
                .region("서울")
                .build();

        registerRequest = MemberRegisterRequest.builder()
                .email("new@example.com")
                .password("plainPassword123")
                .name("신규사용자")
                .phoneNumber("010-9876-5432")
                .role(MemberRole.USER_OVERSEAS)
                .isJobSeeker(false)
                .language("en")
                .region("New York")
                .build();

        loginRequest = new LoginRequest("test@example.com", "plainPassword123");
    }

    @Test
    @DisplayName("회원가입 성공")
    void register_Success() {
        given(memberRepository.existsByEmail(registerRequest.getEmail())).willReturn(false);
        given(passwordEncoder.encode(registerRequest.getPassword())).willReturn("encoded_password");
        given(memberRepository.save(any(Member.class))).willReturn(testMember);

        MemberResponse result = memberService.register(registerRequest);

        assertThat(result.getEmail()).isEqualTo(testMember.getEmail());
        assertThat(result.getName()).isEqualTo(testMember.getName());
        assertThat(result.getRole()).isEqualTo(testMember.getRole());
        
        then(memberRepository).should().existsByEmail(registerRequest.getEmail());
        then(passwordEncoder).should().encode(registerRequest.getPassword());
        then(memberRepository).should().save(any(Member.class));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복")
    void register_Fail_EmailExists() {
        given(memberRepository.existsByEmail(registerRequest.getEmail())).willReturn(true);

        assertThatThrownBy(() -> memberService.register(registerRequest))
                .isInstanceOf(CustomException.Conflict.class)
                .hasMessage("이미 존재하는 이메일입니다");

        then(memberRepository).should().existsByEmail(registerRequest.getEmail());
        then(passwordEncoder).should(never()).encode(anyString());
        then(memberRepository).should(never()).save(any(Member.class));
    }

    @Test
    @DisplayName("로그인 성공")
    void login_Success() {
        given(memberRepository.findByEmail(loginRequest.getEmail())).willReturn(Optional.of(testMember));
        given(passwordEncoder.matches(loginRequest.getPassword(), testMember.getPassword())).willReturn(true);
        given(jwtTokenProvider.createToken(testMember.getEmail(), testMember.getRole().name())).willReturn("jwt_token");

        TokenResponse result = memberService.login(loginRequest);

        assertThat(result.getAccessToken()).isEqualTo("jwt_token");
        assertThat(result.getTokenType()).isEqualTo("Bearer");
        assertThat(result.getExpiresIn()).isEqualTo(86400000L);
        assertThat(result.getMember().getEmail()).isEqualTo(testMember.getEmail());
        
        then(memberRepository).should().findByEmail(loginRequest.getEmail());
        then(passwordEncoder).should().matches(loginRequest.getPassword(), testMember.getPassword());
        then(jwtTokenProvider).should().createToken(testMember.getEmail(), testMember.getRole().name());
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이메일")
    void login_Fail_EmailNotFound() {
        given(memberRepository.findByEmail(loginRequest.getEmail())).willReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.login(loginRequest))
                .isInstanceOf(CustomException.Unauthorized.class)
                .hasMessage("이메일 또는 비밀번호가 올바르지 않습니다");

        then(memberRepository).should().findByEmail(loginRequest.getEmail());
        then(passwordEncoder).should(never()).matches(anyString(), anyString());
        then(jwtTokenProvider).should(never()).createToken(anyString(), anyString());
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치")
    void login_Fail_PasswordMismatch() {
        given(memberRepository.findByEmail(loginRequest.getEmail())).willReturn(Optional.of(testMember));
        given(passwordEncoder.matches(loginRequest.getPassword(), testMember.getPassword())).willReturn(false);

        assertThatThrownBy(() -> memberService.login(loginRequest))
                .isInstanceOf(CustomException.Unauthorized.class)
                .hasMessage("이메일 또는 비밀번호가 올바르지 않습니다");

        then(memberRepository).should().findByEmail(loginRequest.getEmail());
        then(passwordEncoder).should().matches(loginRequest.getPassword(), testMember.getPassword());
        then(jwtTokenProvider).should(never()).createToken(anyString(), anyString());
    }

    @Test
    @DisplayName("로그인 실패 - 비활성화된 계정")
    void login_Fail_InactiveAccount() {
        Member inactiveMember = Member.builder()
                .email("test@example.com")
                .password("encoded_password")
                .name("테스트사용자")
                .role(MemberRole.USER_DOMESTIC)
                .isActive(false)
                .build();
                
        given(memberRepository.findByEmail(loginRequest.getEmail())).willReturn(Optional.of(inactiveMember));

        assertThatThrownBy(() -> memberService.login(loginRequest))
                .isInstanceOf(CustomException.Forbidden.class)
                .hasMessage("비활성화된 계정입니다");

        then(memberRepository).should().findByEmail(loginRequest.getEmail());
        then(passwordEncoder).should(never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("ID로 회원 조회 성공")
    void findById_Success() {
        given(memberRepository.findById(1L)).willReturn(Optional.of(testMember));

        MemberResponse result = memberService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo(testMember.getEmail());
        assertThat(result.getName()).isEqualTo(testMember.getName());
        
        then(memberRepository).should().findById(1L);
    }

    @Test
    @DisplayName("ID로 회원 조회 실패 - 존재하지 않는 ID")
    void findById_Fail_NotFound() {
        given(memberRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.findById(999L))
                .isInstanceOf(CustomException.NotFound.class)
                .hasMessage("존재하지 않는 회원입니다");

        then(memberRepository).should().findById(999L);
    }

    @Test
    @DisplayName("프로필 업데이트 성공")
    void updateProfile_Success() {
        MemberUpdateRequest updateRequest = new MemberUpdateRequest("새이름", "010-0000-0000", "en", "부산");
        given(memberRepository.findById(1L)).willReturn(Optional.of(testMember));

        MemberResponse result = memberService.updateProfile(1L, updateRequest);

        assertThat(result.getName()).isEqualTo("새이름");
        assertThat(result.getPhoneNumber()).isEqualTo("010-0000-0000");
        assertThat(result.getLanguage()).isEqualTo("en");
        assertThat(result.getRegion()).isEqualTo("부산");
        
        then(memberRepository).should().findById(1L);
    }

    @Test
    @DisplayName("프로필 업데이트 - 부분 업데이트")
    void updateProfile_PartialUpdate() {
        MemberUpdateRequest updateRequest = new MemberUpdateRequest("새이름", null, null, null);
        given(memberRepository.findById(1L)).willReturn(Optional.of(testMember));

        MemberResponse result = memberService.updateProfile(1L, updateRequest);

        assertThat(result.getName()).isEqualTo("새이름");
        assertThat(result.getPhoneNumber()).isEqualTo(testMember.getPhoneNumber());
        assertThat(result.getLanguage()).isEqualTo(testMember.getLanguage());
        assertThat(result.getRegion()).isEqualTo(testMember.getRegion());
    }

    @Test
    @DisplayName("구직자 상태 토글 성공")
    void toggleJobSeekerStatus_Success() {
        boolean originalStatus = testMember.getIsJobSeeker();
        given(memberRepository.findById(1L)).willReturn(Optional.of(testMember));

        memberService.toggleJobSeekerStatus(1L);

        assertThat(testMember.getIsJobSeeker()).isNotEqualTo(originalStatus);
        then(memberRepository).should().findById(1L);
    }

    @Test
    @DisplayName("계정 비활성화 성공")
    void deactivate_Success() {
        given(memberRepository.findById(1L)).willReturn(Optional.of(testMember));

        memberService.deactivate(1L);

        assertThat(testMember.getIsActive()).isFalse();
        then(memberRepository).should().findById(1L);
    }

    @Test
    @DisplayName("역할별 회원 조회")
    void findByRole_Success() {
        List<Member> members = List.of(testMember);
        given(memberRepository.findByRole(MemberRole.USER_DOMESTIC)).willReturn(members);

        List<MemberResponse> result = memberService.findByRole(MemberRole.USER_DOMESTIC);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRole()).isEqualTo(MemberRole.USER_DOMESTIC);
        
        then(memberRepository).should().findByRole(MemberRole.USER_DOMESTIC);
    }

    @Test
    @DisplayName("활성 구직자 조회")
    void findActiveJobSeekers_Success() {
        List<Member> jobSeekers = List.of(testMember);
        given(memberRepository.findByIsJobSeekerAndIsActive(true, true)).willReturn(jobSeekers);

        List<MemberResponse> result = memberService.findActiveJobSeekers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIsJobSeeker()).isTrue();
        assertThat(result.get(0).getIsActive()).isTrue();
        
        then(memberRepository).should().findByIsJobSeekerAndIsActive(true, true);
    }

    @Test
    @DisplayName("역할별 회원 수 조회")
    void countByRole_Success() {
        given(memberRepository.countByRole(MemberRole.COORDINATOR)).willReturn(5L);

        long result = memberService.countByRole(MemberRole.COORDINATOR);

        assertThat(result).isEqualTo(5L);
        then(memberRepository).should().countByRole(MemberRole.COORDINATOR);
    }
}