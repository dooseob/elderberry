package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.ValidationUtil;
import com.globalcarelink.profile.dto.DomesticProfileRequest;
import com.globalcarelink.profile.dto.OverseasProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;

/**
 * 프로필 검증 전용 서비스
 * 단일 책임 원칙 적용: 프로필 관련 검증 로직만 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileValidationService {
    
    /**
     * 국내 프로필 요청 검증
     */
    public void validateDomesticProfileRequest(DomesticProfileRequest request) {
        log.debug("국내 프로필 요청 검증 시작");
        
        // 필수 필드 검증
        if (!StringUtils.hasText(request.getName())) {
            throw new CustomException.BadRequest("이름은 필수입니다");
        }
        
        if (request.getAge() == null || request.getAge() < 0 || request.getAge() > 150) {
            throw new CustomException.BadRequest("유효한 나이를 입력해주세요 (0-150)");
        }
        
        if (request.getGender() == null) {
            throw new CustomException.BadRequest("성별은 필수입니다");
        }
        
        // 전화번호 검증
        if (StringUtils.hasText(request.getPhone()) && !ValidationUtil.isValidPhoneNumber(request.getPhone())) {
            throw new CustomException.BadRequest("올바른 전화번호 형식이 아닙니다");
        }
        
        // 건강보험번호 검증 (있는 경우)
        if (StringUtils.hasText(request.getNationalHealthInsuranceNumber()) && 
            !ValidationUtil.isValidHealthInsuranceNumber(request.getNationalHealthInsuranceNumber())) {
            throw new CustomException.BadRequest("올바른 건강보험번호 형식이 아닙니다");
        }
        
        // 케어 레벨 검증
        if (StringUtils.hasText(request.getCareLevel()) && 
            !isValidCareLevel(request.getCareLevel())) {
            throw new CustomException.BadRequest("유효하지 않은 케어 레벨입니다");
        }
        
        // 예산 범위 검증
        if (StringUtils.hasText(request.getBudgetRange()) && 
            !isValidBudgetRange(request.getBudgetRange())) {
            throw new CustomException.BadRequest("유효하지 않은 예산 범위입니다");
        }
        
        log.debug("국내 프로필 요청 검증 완료");
    }
    
    /**
     * 해외 프로필 요청 검증
     */
    public void validateOverseasProfileRequest(OverseasProfileRequest request) {
        log.debug("해외 프로필 요청 검증 시작");
        
        // 기본 필드 검증 (국내 프로필과 동일)
        if (!StringUtils.hasText(request.getName())) {
            throw new CustomException.BadRequest("이름은 필수입니다");
        }
        
        if (request.getAge() == null || request.getAge() < 0 || request.getAge() > 150) {
            throw new CustomException.BadRequest("유효한 나이를 입력해주세요 (0-150)");
        }
        
        if (request.getGender() == null) {
            throw new CustomException.BadRequest("성별은 필수입니다");
        }
        
        // 해외 프로필 전용 필드 검증
        if (!StringUtils.hasText(request.getResidenceCountry())) {
            throw new CustomException.BadRequest("거주 국가는 필수입니다");
        }
        
        if (!StringUtils.hasText(request.getNationality())) {
            throw new CustomException.BadRequest("국적은 필수입니다");
        }
        
        // 여권 정보 검증
        if (StringUtils.hasText(request.getPassportNumber()) && 
            !isValidPassportNumber(request.getPassportNumber())) {
            throw new CustomException.BadRequest("올바른 여권번호 형식이 아닙니다");
        }
        
        // 여권 만료일 검증
        if (request.getPassportExpiry() != null && 
            request.getPassportExpiry().isBefore(LocalDate.now())) {
            throw new CustomException.BadRequest("여권이 만료되었습니다");
        }
        
        // 비자 상태 검증
        if (request.getVisaStatus() != null && 
            request.getVisaExpiry() != null && 
            request.getVisaExpiry().isBefore(LocalDate.now())) {
            throw new CustomException.BadRequest("비자가 만료되었습니다");
        }
        
        // 언어 능력 검증
        if (StringUtils.hasText(request.getLanguageProficiency()) && 
            !isValidLanguageProficiency(request.getLanguageProficiency())) {
            throw new CustomException.BadRequest("유효하지 않은 언어 능력 수준입니다");
        }
        
        // 시간대 검증
        if (StringUtils.hasText(request.getTimeZone()) && 
            !isValidTimeZone(request.getTimeZone())) {
            throw new CustomException.BadRequest("유효하지 않은 시간대입니다");
        }
        
        log.debug("해외 프로필 요청 검증 완료");
    }
    
    /**
     * 국내 프로필용 회원 검증
     */
    public void validateMemberForDomesticProfile(Member member) {
        if (member.getRole() != MemberRole.USER_DOMESTIC) {
            throw new CustomException.BadRequest("국내 프로필은 국내 사용자만 생성할 수 있습니다");
        }
        
        if (!member.isEmailVerified()) {
            throw new CustomException.BadRequest("이메일 인증이 완료되지 않았습니다");
        }
        
        if (!member.isActive()) {
            throw new CustomException.BadRequest("비활성화된 계정입니다");
        }
    }
    
    /**
     * 해외 프로필용 회원 검증
     */
    public void validateMemberForOverseasProfile(Member member) {
        if (member.getRole() != MemberRole.USER_OVERSEAS) {
            throw new CustomException.BadRequest("해외 프로필은 해외 사용자만 생성할 수 있습니다");
        }
        
        if (!member.isEmailVerified()) {
            throw new CustomException.BadRequest("이메일 인증이 완료되지 않았습니다");
        }
        
        if (!member.isActive()) {
            throw new CustomException.BadRequest("비활성화된 계정입니다");
        }
    }
    
    // ===== 내부 검증 헬퍼 메서드들 =====
    
    private boolean isValidCareLevel(String careLevel) {
        // 장기요양등급: 1~5등급, 인지지원등급
        return careLevel.matches("^[1-5]등급$") || "인지지원등급".equals(careLevel);
    }
    
    private boolean isValidBudgetRange(String budgetRange) {
        // 예산 범위 형식: "100만원-200만원", "300만원 이상" 등
        return budgetRange.matches("^\\d+만원(-\\d+만원|\\s이상|\\s이하)?$");
    }
    
    private boolean isValidPassportNumber(String passportNumber) {
        // 여권번호는 국가별로 다르지만 일반적으로 영문자+숫자 조합
        return passportNumber.matches("^[A-Z0-9]{6,9}$");
    }
    
    private boolean isValidLanguageProficiency(String proficiency) {
        // 언어 능력: 초급, 중급, 고급, 원어민
        return proficiency.matches("^(초급|중급|고급|원어민|Elementary|Intermediate|Advanced|Native)$");
    }
    
    private boolean isValidTimeZone(String timeZone) {
        // 간단한 시간대 검증 (실제로는 더 정교한 검증 필요)
        return timeZone.matches("^[A-Z]{3,4}$") || 
               timeZone.matches("^UTC[+-]\\d{1,2}$") ||
               timeZone.matches("^GMT[+-]\\d{1,2}$");
    }
}