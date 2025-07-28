package com.globalcarelink.simple;

import com.globalcarelink.auth.*;
import com.globalcarelink.auth.dto.*;
import com.globalcarelink.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

/**
 * Simple 프로파일용 회원 서비스
 * Redis 의존성 없이 SimpleJwtTokenProvider 사용
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Profile("simple")
public class SimpleMemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final SimpleJwtTokenProvider jwtTokenProvider;

    /**
     * 회원가입
     */
    @Transactional
    public MemberResponse register(MemberRegisterRequest request) {
        log.info("회원가입 시작: {}", request.getEmail());

        // 이메일 중복 체크
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new CustomException.BadRequest("이미 존재하는 이메일입니다: " + request.getEmail());
        }

        // 회원 생성
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole() != null ? request.getRole() : MemberRole.USER_DOMESTIC)
                .language(request.getLanguage())
                .region(request.getRegion())
                .isJobSeeker(request.getIsJobSeeker() != null ? request.getIsJobSeeker() : false)
                .isActive(true)
                .build();

        Member savedMember = memberRepository.save(member);
        log.info("회원가입 완료: {}", savedMember.getEmail());

        return MemberResponse.builder()
                .id(savedMember.getId())
                .email(savedMember.getEmail())
                .name(savedMember.getName())
                .phoneNumber(savedMember.getPhoneNumber())
                .role(savedMember.getRole())
                .language(savedMember.getLanguage())
                .region(savedMember.getRegion())
                .isJobSeeker(savedMember.getIsJobSeeker())
                .isActive(savedMember.getIsActive())
                .createdAt(savedMember.getCreatedAt())
                .updatedAt(savedMember.getUpdatedAt())
                .build();
    }

    /**
     * 로그인
     */
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        log.info("로그인 시도: {}", request.getEmail());

        // 회원 조회
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException.Unauthorized("이메일 또는 비밀번호가 잘못되었습니다"));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new CustomException.Unauthorized("이메일 또는 비밀번호가 잘못되었습니다");
        }

        // 계정 활성화 확인
        if (!member.getIsActive()) {
            throw new CustomException.Unauthorized("비활성화된 계정입니다");
        }

        // 권한 정보 생성
        Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + member.getRole().name())
        );

        // 토큰 생성
        SimpleJwtTokenProvider.TokenPair tokenPair = jwtTokenProvider.createTokenPair(member.getEmail(), authorities);

        log.info("로그인 성공: {}", member.getEmail());

        return TokenResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .refreshToken(tokenPair.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(1800) // Access token 유효기간 (초)
                .build();
    }

    /**
     * 이메일로 회원 조회
     */
    @Transactional(readOnly = true)
    public MemberResponse findByEmail(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException.NotFound("회원을 찾을 수 없습니다: " + email));

        return MemberResponse.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .phoneNumber(member.getPhoneNumber())
                .role(member.getRole())
                .language(member.getLanguage())
                .region(member.getRegion())
                .isJobSeeker(member.getIsJobSeeker())
                .isActive(member.getIsActive())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }

    /**
     * 회원 정보 수정
     */
    @Transactional
    public MemberResponse updateMember(String email, MemberUpdateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException.NotFound("회원을 찾을 수 없습니다: " + email));

        // 정보 업데이트
        member.updateProfile(
                request.getName() != null ? request.getName() : member.getName(),
                request.getPhoneNumber() != null ? request.getPhoneNumber() : member.getPhoneNumber(),
                request.getLanguage() != null ? request.getLanguage() : member.getLanguage(),
                request.getRegion() != null ? request.getRegion() : member.getRegion()
        );

        // 비밀번호 변경 (요청이 있는 경우)
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            member.updatePassword(passwordEncoder.encode(request.getNewPassword()));
        }

        Member updatedMember = memberRepository.save(member);
        log.info("회원 정보 수정 완료: {}", updatedMember.getEmail());

        return MemberResponse.builder()
                .id(updatedMember.getId())
                .email(updatedMember.getEmail())
                .name(updatedMember.getName())
                .phoneNumber(updatedMember.getPhoneNumber())
                .role(updatedMember.getRole())
                .language(updatedMember.getLanguage())
                .region(updatedMember.getRegion())
                .isJobSeeker(updatedMember.getIsJobSeeker())
                .isActive(updatedMember.getIsActive())
                .createdAt(updatedMember.getCreatedAt())
                .updatedAt(updatedMember.getUpdatedAt())
                .build();
    }

    /**
     * 회원 비활성화
     */
    @Transactional
    public void deactivateMember(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException.NotFound("회원을 찾을 수 없습니다: " + email));

        member.deactivate();
        memberRepository.save(member);
        
        // 해당 회원의 모든 토큰 무효화
        jwtTokenProvider.invalidateAllUserTokens(email);
        
        log.info("회원 비활성화 완료: {}", email);
    }

    /**
     * 회원 활성화
     */
    @Transactional
    public void activateMember(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException.NotFound("회원을 찾을 수 없습니다: " + email));

        member.activate();
        memberRepository.save(member);
        
        log.info("회원 활성화 완료: {}", email);
    }
}