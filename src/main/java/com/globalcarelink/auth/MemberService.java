package com.globalcarelink.auth;

import com.globalcarelink.auth.dto.*;
import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.SecurityUtil;
import com.globalcarelink.common.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {
    
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Value("${spring.security.jwt.expiration}")
    private long jwtExpiration;
    
    @Transactional
    public MemberResponse register(MemberRegisterRequest request) {
        validateRegisterRequest(request);
        
        if (memberRepository.existsByEmail(request.getEmail())) {
            log.warn("회원가입 실패 - 이메일 중복: {}", SecurityUtil.maskEmail(request.getEmail()));
            throw new CustomException.Conflict("이미 존재하는 이메일입니다");
        }
        
        // 입력값 sanitize
        String sanitizedEmail = ValidationUtil.sanitizeInput(request.getEmail()).toLowerCase();
        String sanitizedName = ValidationUtil.sanitizeInput(request.getName());
        String sanitizedPhoneNumber = ValidationUtil.sanitizeInput(request.getPhoneNumber());
        String sanitizedLanguage = ValidationUtil.sanitizeInput(request.getLanguage());
        String sanitizedRegion = ValidationUtil.sanitizeInput(request.getRegion());
        
        Member member = Member.builder()
                .email(sanitizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(sanitizedName)
                .phoneNumber(sanitizedPhoneNumber)
                .role(request.getRole())
                .isJobSeeker(request.getIsJobSeeker())
                .language(sanitizedLanguage)
                .region(sanitizedRegion)
                .build();
        
        Member savedMember = memberRepository.save(member);
        
        log.info("새 회원 가입 성공: email={}, role={}, region={}", 
                SecurityUtil.maskEmail(savedMember.getEmail()), 
                savedMember.getRole(), 
                savedMember.getRegion());
        
        return MemberResponse.from(savedMember);
    }
    
    public TokenResponse login(LoginRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException.Unauthorized("이메일 또는 비밀번호가 올바르지 않습니다"));
        
        if (!member.getIsActive()) {
            throw new CustomException.Forbidden("비활성화된 계정입니다");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new CustomException.Unauthorized("이메일 또는 비밀번호가 올바르지 않습니다");
        }
        
        String token = jwtTokenProvider.createToken(member.getEmail(), member.getRole().name());
        log.info("로그인 성공: email={}, role={}", member.getEmail(), member.getRole());
        
        return TokenResponse.of(token, jwtExpiration, MemberResponse.from(member));
    }
    
    public MemberResponse findById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
        
        return MemberResponse.from(member);
    }
    
    public MemberResponse findByEmail(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
        
        return MemberResponse.from(member);
    }
    
    @Transactional
    public MemberResponse updateProfile(Long id, MemberUpdateRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
        
        member.updateProfile(
                request.getName() != null ? request.getName() : member.getName(),
                request.getPhoneNumber() != null ? request.getPhoneNumber() : member.getPhoneNumber(),
                request.getLanguage() != null ? request.getLanguage() : member.getLanguage(),
                request.getRegion() != null ? request.getRegion() : member.getRegion()
        );
        
        log.info("프로필 업데이트: email={}", member.getEmail());
        return MemberResponse.from(member);
    }
    
    @Transactional
    public void toggleJobSeekerStatus(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
        
        member.toggleJobSeekerStatus();
        log.info("구직자 상태 변경: email={}, isJobSeeker={}", member.getEmail(), member.getIsJobSeeker());
    }
    
    @Transactional
    public void deactivate(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
        
        member.deactivate();
        log.info("회원 비활성화: email={}", member.getEmail());
    }
    
    public List<MemberResponse> findByRole(MemberRole role) {
        return memberRepository.findByRole(role).stream()
                .map(MemberResponse::from)
                .toList();
    }
    
    public List<MemberResponse> findActiveJobSeekers() {
        return memberRepository.findByIsJobSeekerAndIsActive(true, true).stream()
                .map(MemberResponse::from)
                .toList();
    }
    
    public long countByRole(MemberRole role) {
        return memberRepository.countByRole(role);
    }

    private void validateRegisterRequest(MemberRegisterRequest request) {
        // 이메일 검증
        if (!ValidationUtil.isValidEmail(request.getEmail())) {
            throw new CustomException.BadRequest(ValidationUtil.getEmailValidationMessage());
        }
        
        // 보안 위험 패턴 검사
        if (ValidationUtil.containsSuspiciousPattern(request.getEmail()) ||
            ValidationUtil.containsSuspiciousPattern(request.getName()) ||
            ValidationUtil.containsSuspiciousPattern(request.getRegion())) {
            log.warn("회원가입 시도에서 의심스러운 패턴 감지: email={}", SecurityUtil.maskEmail(request.getEmail()));
            throw new CustomException.BadRequest("입력값에 허용되지 않는 문자가 포함되어 있습니다");
        }
        
        // SQL 인젝션 검사
        if (SecurityUtil.containsSqlInjection(request.getEmail()) ||
            SecurityUtil.containsSqlInjection(request.getName()) ||
            SecurityUtil.containsSqlInjection(request.getRegion())) {
            log.error("회원가입 시도에서 SQL 인젝션 패턴 감지: email={}", SecurityUtil.maskEmail(request.getEmail()));
            throw new CustomException.BadRequest("보안 위험이 감지되었습니다");
        }
        
        // 비밀번호 강도 검증
        if (!SecurityUtil.isSecurePassword(request.getPassword())) {
            throw new CustomException.BadRequest(ValidationUtil.getPasswordValidationMessage());
        }
        
        // 전화번호 검증
        if (StringUtils.hasText(request.getPhoneNumber()) && 
            !ValidationUtil.isValidPhoneNumber(request.getPhoneNumber())) {
            throw new CustomException.BadRequest(ValidationUtil.getPhoneValidationMessage());
        }
        
        // 언어 코드 검증
        if (!ValidationUtil.isValidLanguageCode(request.getLanguage())) {
            throw new CustomException.BadRequest("언어 코드 형식이 올바르지 않습니다 (예: ko, en, zh-CN)");
        }
        
        // 지역 검증
        if (!ValidationUtil.isValidRegion(request.getRegion())) {
            throw new CustomException.BadRequest("지역 정보 형식이 올바르지 않습니다 (2-100자)");
        }
        
        // 이름 검증 (한글 이름인 경우)
        if (StringUtils.hasText(request.getLanguage()) && 
            request.getLanguage().startsWith("ko") &&
            !ValidationUtil.isValidKoreanName(request.getName())) {
            log.info("한글 이름이 아닌 사용자 가입: email={}, name length={}", 
                    SecurityUtil.maskEmail(request.getEmail()), 
                    request.getName().length());
        }
        
        // 역할별 추가 검증
        validateRoleSpecificRules(request);
    }

    private void validateRoleSpecificRules(MemberRegisterRequest request) {
        switch (request.getRole()) {
            case USER_OVERSEAS:
                if (!StringUtils.hasText(request.getRegion())) {
                    throw new CustomException.BadRequest("해외 사용자는 지역 정보가 필수입니다");
                }
                if (!StringUtils.hasText(request.getLanguage()) || "ko".equals(request.getLanguage())) {
                    log.info("해외 사용자이지만 한국어 설정: email={}", SecurityUtil.maskEmail(request.getEmail()));
                }
                break;
                
            case FACILITY:
                if (!StringUtils.hasText(request.getRegion())) {
                    throw new CustomException.BadRequest("시설 관리자는 시설 지역 정보가 필수입니다");
                }
                if (Boolean.TRUE.equals(request.getIsJobSeeker())) {
                    throw new CustomException.BadRequest("시설 관리자는 구직자로 등록할 수 없습니다");
                }
                break;
                
            case COORDINATOR:
                if (Boolean.TRUE.equals(request.getIsJobSeeker())) {
                    throw new CustomException.BadRequest("코디네이터는 구직자로 등록할 수 없습니다");
                }
                break;
                
            case ADMIN:
                log.warn("관리자 계정 생성 시도: email={}", SecurityUtil.maskEmail(request.getEmail()));
                throw new CustomException.Forbidden("관리자 계정은 별도 승인이 필요합니다");
        }
    }
}