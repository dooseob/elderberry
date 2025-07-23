package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.SecurityUtil;
import com.globalcarelink.common.util.ValidationUtil;
import com.globalcarelink.profile.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 프로필 서비스
 * BaseProfile 추상화를 활용한 DRY 원칙 적용
 * 공통 로직 통합으로 중복 코드 제거
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {
    
    private final MemberRepository memberRepository;
    private final DomesticProfileRepository domesticProfileRepository;
    private final OverseasProfileRepository overseasProfileRepository;
    
    // ===== 국내 프로필 관리 =====
    
    @Transactional
    public DomesticProfileResponse createDomesticProfile(Long memberId, DomesticProfileRequest request) {
        log.info("국내 프로필 생성 시작 - 회원: {}", memberId);
        
        validateDomesticProfileRequest(request);
        
        Member member = findMemberById(memberId);
        validateMemberForDomesticProfile(member);
        
        if (domesticProfileRepository.existsByMemberId(memberId)) {
            throw new CustomException.Conflict("이미 국내 프로필이 존재합니다");
        }
        
        DomesticProfile profile = buildDomesticProfile(member, request);
        DomesticProfile savedProfile = domesticProfileRepository.save(profile);
        
        log.info("국내 프로필 생성 완료 - 회원: {}, 완성도: {}%", 
                memberId, savedProfile.getProfileCompletionPercentage());
        
        return DomesticProfileResponse.from(savedProfile);
    }
    
    @Transactional
    public OverseasProfileResponse createOverseasProfile(Long memberId, OverseasProfileRequest request) {
        log.info("해외 프로필 생성 시작 - 회원: {}", memberId);
        
        validateOverseasProfileRequest(request);
        
        Member member = findMemberById(memberId);
        validateMemberForOverseasProfile(member);
        
        if (overseasProfileRepository.existsByMemberId(memberId)) {
            throw new CustomException.Conflict("이미 해외 프로필이 존재합니다");
        }
        
        OverseasProfile profile = buildOverseasProfile(member, request);
        OverseasProfile savedProfile = overseasProfileRepository.save(profile);
        
        log.info("해외 프로필 생성 완료 - 회원: {}, 거주국: {}, 완성도: {}%", 
                memberId, savedProfile.getResidenceCountry(), savedProfile.getProfileCompletionPercentage());
        
        return OverseasProfileResponse.from(savedProfile);
    }
    
    public DomesticProfileResponse getDomesticProfile(Long memberId) {
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        return DomesticProfileResponse.from(profile);
    }
    
    public OverseasProfileResponse getOverseasProfile(Long memberId) {
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        return OverseasProfileResponse.from(profile);
    }
    
    @Transactional
    public DomesticProfileResponse updateDomesticProfile(Long memberId, DomesticProfileRequest request) {
        log.info("국내 프로필 수정 시작 - 회원: {}", memberId);
        
        validateDomesticProfileRequest(request);
        
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        updateDomesticProfileFields(profile, request);
        
        log.info("국내 프로필 수정 완료 - 회원: {}, 완성도: {}%", 
                memberId, profile.getProfileCompletionPercentage());
        
        return DomesticProfileResponse.from(profile);
    }
    
    @Transactional
    public OverseasProfileResponse updateOverseasProfile(Long memberId, OverseasProfileRequest request) {
        log.info("해외 프로필 수정 시작 - 회원: {}", memberId);
        
        validateOverseasProfileRequest(request);
        
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        updateOverseasProfileFields(profile, request);
        
        log.info("해외 프로필 수정 완료 - 회원: {}, 완성도: {}%", 
                memberId, profile.getProfileCompletionPercentage());
        
        return OverseasProfileResponse.from(profile);
    }
    
    @Transactional
    public void deleteDomesticProfile(Long memberId) {
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        domesticProfileRepository.delete(profile);
        log.info("국내 프로필 삭제 완료 - 회원: {}", memberId);
    }
    
    @Transactional
    public void deleteOverseasProfile(Long memberId) {
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        overseasProfileRepository.delete(profile);
        log.info("해외 프로필 삭제 완료 - 회원: {}", memberId);
    }
    
    // ===== 조회 메서드들 =====
    
    public List<DomesticProfileResponse> getDomesticProfilesByCompletion(int minCompletionRate) {
        validateCompletionRate(minCompletionRate);
        
        return domesticProfileRepository.findByProfileCompletionPercentageGreaterThanEqual(minCompletionRate)
                .stream()
                .map(DomesticProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    public List<OverseasProfileResponse> getOverseasProfilesByCountry(String country) {
        if (!StringUtils.hasText(country)) {
            throw new CustomException.BadRequest("국가명이 필요합니다");
        }
        
        return overseasProfileRepository.findByResidenceCountry(country)
                .stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    public List<OverseasProfileResponse> getOverseasProfilesRequiringCoordinator() {
        return overseasProfileRepository.findRequiringCoordinator()
                .stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }

    public List<DomesticProfileResponse> getDomesticProfilesByCareLevel(String careLevel) {
        if (!StringUtils.hasText(careLevel)) {
            throw new CustomException.BadRequest("케어 수준이 필요합니다");
        }
        
        return domesticProfileRepository.findByCareLevel(careLevel)
                .stream()
                .map(DomesticProfileResponse::from)
                .collect(Collectors.toList());
    }

    public List<OverseasProfileResponse> getOverseasProfilesByLanguage(String language) {
        if (!StringUtils.hasText(language)) {
            throw new CustomException.BadRequest("언어 정보가 필요합니다");
        }
        
        return overseasProfileRepository.findByLanguagePreferenceContaining(language)
                .stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    // ===== 내부 메서드들 (DRY 원칙 적용) =====
    
    private Member findMemberById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
    }
    
    private DomesticProfile buildDomesticProfile(Member member, DomesticProfileRequest request) {
        DomesticProfile profile = DomesticProfile.builder()
                .member(member)
                .healthInsuranceNumber(sanitizeInput(request.getHealthInsuranceNumber()))
                .ltciGrade(request.getLtciGrade())
                .ltciCertificateNumber(sanitizeInput(request.getLtciCertificateNumber()))
                .preferredRegion(sanitizeInput(request.getPreferredRegion()))
                .familyVisitFrequency(sanitizeInput(request.getFamilyVisitFrequency()))
                .build();
        
        // BaseProfile의 공통 필드 설정
        updateBaseProfileFields(profile, request);
        
        return profile;
    }
    
    private OverseasProfile buildOverseasProfile(Member member, OverseasProfileRequest request) {
        OverseasProfile profile = OverseasProfile.builder()
                .member(member)
                .residenceCountry(sanitizeInput(request.getResidenceCountry()))
                .residenceCity(sanitizeInput(request.getResidenceCity()))
                .koreanAddress(sanitizeInput(request.getKoreanAddress()))
                .koreanPostalCode(sanitizeInput(request.getKoreanPostalCode()))
                .passportNumber(sanitizeInput(request.getPassportNumber()))
                .passportExpiryDate(request.getPassportExpiryDate())
                .visaStatus(sanitizeInput(request.getVisaStatus()))
                .visaExpiryDate(request.getVisaExpiryDate())
                .overseasContactName(sanitizeInput(request.getOverseasContactName()))
                .overseasContactPhone(sanitizeInput(request.getOverseasContactPhone()))
                .overseasContactRelation(sanitizeInput(request.getOverseasContactRelation()))
                .languagePreference(sanitizeInput(request.getLanguagePreference()))
                .timeZonePreference(sanitizeInput(request.getTimeZonePreference()))
                .preferredRegionInKorea(sanitizeInput(request.getPreferredRegionInKorea()))
                .culturalDietaryRequirements(sanitizeInput(request.getCulturalDietaryRequirements()))
                .coordinatorRequired(request.getCoordinatorRequired())
                .build();
        
        // BaseProfile의 공통 필드 설정
        updateBaseProfileFields(profile, request);
        
        return profile;
    }
    
    /**
     * BaseProfile 공통 필드 업데이트 (제네릭 메서드)
     * DRY 원칙 적용으로 중복 코드 제거
     */
    private <T extends BaseProfile, R extends BaseProfileRequest> void updateBaseProfileFields(T profile, R request) {
        // 기본 정보 업데이트
        profile.updateBasicInfo(
            request.getBirthDate(),
            sanitizeInput(request.getGender()),
            sanitizeInput(request.getAddress()),
            sanitizeInput(request.getDetailedAddress()),
            sanitizeInput(request.getPostalCode())
        );
        
        // 비상연락처 정보 업데이트
        profile.updateEmergencyContact(
            sanitizeInput(request.getEmergencyContactName()),
            sanitizeInput(request.getEmergencyContactPhone()),
            sanitizeInput(request.getEmergencyContactRelation())
        );
        
        // 케어 관련 정보 업데이트
        profile.updateCareInfo(
            sanitizeInput(request.getCareLevel()),
            sanitizeInput(request.getSpecialNeeds()),
            sanitizeInput(request.getBudgetRange())
        );
    }
    
    private void updateDomesticProfileFields(DomesticProfile profile, DomesticProfileRequest request) {
        // 공통 필드 업데이트
        updateBaseProfileFields(profile, request);
        
        // 국내 프로필 고유 필드 업데이트
        profile.updateHealthInfo(
            sanitizeInput(request.getHealthInsuranceNumber()),
            request.getLtciGrade(),
            sanitizeInput(request.getLtciCertificateNumber())
        );
        
        profile.updatePreferences(
            sanitizeInput(request.getPreferredRegion()),
            sanitizeInput(request.getFamilyVisitFrequency())
        );
    }
    
    private void updateOverseasProfileFields(OverseasProfile profile, OverseasProfileRequest request) {
        // 공통 필드 업데이트
        updateBaseProfileFields(profile, request);
        
        // 해외 프로필 고유 필드 업데이트
        profile.updateResidenceInfo(
            sanitizeInput(request.getResidenceCountry()),
            sanitizeInput(request.getResidenceCity()),
            sanitizeInput(request.getKoreanAddress()),
            sanitizeInput(request.getKoreanPostalCode())
        );
        
        profile.updateDocumentInfo(
            sanitizeInput(request.getPassportNumber()),
            request.getPassportExpiryDate(),
            sanitizeInput(request.getVisaStatus()),
            request.getVisaExpiryDate()
        );
        
        profile.updateOverseasContact(
            sanitizeInput(request.getOverseasContactName()),
            sanitizeInput(request.getOverseasContactPhone()),
            sanitizeInput(request.getOverseasContactRelation())
        );
        
        profile.updatePreferences(
            sanitizeInput(request.getLanguagePreference()),
            sanitizeInput(request.getTimeZonePreference()),
            sanitizeInput(request.getPreferredRegionInKorea()),
            sanitizeInput(request.getCulturalDietaryRequirements()),
            request.getCoordinatorRequired()
        );
    }
    
    // ===== 검증 메서드들 =====
    
    private void validateDomesticProfileRequest(DomesticProfileRequest request) {
        if (request == null) {
            throw new CustomException.BadRequest("프로필 요청 정보가 필요합니다");
        }
        
        // 공통 필드 검증
        validateBaseProfileRequest(request);
        
        // 장기요양등급 검증
        if (request.getLtciGrade() != null && 
            (request.getLtciGrade() < 1 || request.getLtciGrade() > 6)) {
            throw new CustomException.BadRequest("장기요양등급은 1-6 사이여야 합니다");
        }
    }
    
    private void validateOverseasProfileRequest(OverseasProfileRequest request) {
        if (request == null) {
            throw new CustomException.BadRequest("프로필 요청 정보가 필요합니다");
        }
        
        // 공통 필드 검증
        validateBaseProfileRequest(request);
        
        // 거주 국가 필수 검증
        if (!StringUtils.hasText(request.getResidenceCountry())) {
            throw new CustomException.BadRequest("거주 국가는 필수입니다");
        }
        
        // 여권 만료일 검증
        if (request.getPassportExpiryDate() != null && 
            request.getPassportExpiryDate().isBefore(java.time.LocalDate.now())) {
            throw new CustomException.BadRequest("여권 만료일은 현재 날짜 이후여야 합니다");
        }
    }
    
    /**
     * BaseProfile 공통 필드 검증 (제네릭 메서드)
     */
    private <T extends BaseProfileRequest> void validateBaseProfileRequest(T request) {
        // 보안 패턴 검증
        validateSecurityPatterns(
            request.getGender(),
            request.getAddress(),
            request.getDetailedAddress(),
            request.getPostalCode(),
            request.getEmergencyContactName(),
            request.getEmergencyContactPhone(),
            request.getEmergencyContactRelation(),
            request.getCareLevel(),
            request.getSpecialNeeds(),
            request.getBudgetRange()
        );
        
        // 전화번호 형식 검증
        if (StringUtils.hasText(request.getEmergencyContactPhone()) && 
            !ValidationUtil.isValidPhoneNumber(request.getEmergencyContactPhone())) {
            throw new CustomException.BadRequest("유효하지 않은 비상연락처 전화번호 형식입니다");
        }
    }
    
    private void validateMemberForDomesticProfile(Member member) {
        if (!member.getRole().isDomestic()) {
            throw new CustomException.BadRequest("국내 회원만 국내 프로필을 생성할 수 있습니다");
        }
    }
    
    private void validateMemberForOverseasProfile(Member member) {
        if (!member.getRole().isOverseas()) {
            throw new CustomException.BadRequest("해외 회원만 해외 프로필을 생성할 수 있습니다");
        }
    }
    
    private void validateSecurityPatterns(String... inputs) {
        for (String input : inputs) {
            if (StringUtils.hasText(input)) {
                if (ValidationUtil.containsSuspiciousPattern(input)) {
                    throw new CustomException.BadRequest("입력값에 허용되지 않는 문자가 포함되어 있습니다");
                }
                if (SecurityUtil.containsSqlInjection(input)) {
                    log.warn("프로필 입력에서 SQL 인젝션 패턴 감지: {}", SecurityUtil.maskEmail(input));
                    throw new CustomException.BadRequest("보안 위험이 감지되었습니다");
                }
            }
        }
    }
    
    private void validateCompletionRate(int rate) {
        if (rate < 0 || rate > 100) {
            throw new CustomException.BadRequest("완성도는 0-100 사이여야 합니다");
        }
    }
    
    private String sanitizeInput(String input) {
        return ValidationUtil.sanitizeInput(input);
    }
}