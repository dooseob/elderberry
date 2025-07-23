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

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {
    
    private final MemberRepository memberRepository;
    private final DomesticProfileRepository domesticProfileRepository;
    private final OverseasProfileRepository overseasProfileRepository;
    
    @Transactional
    public DomesticProfileResponse createDomesticProfile(Long memberId, DomesticProfileRequest request) {
        validateDomesticProfileRequest(request);
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
        
        validateMemberForDomesticProfile(member);
        
        if (domesticProfileRepository.existsByMemberId(memberId)) {
            throw new CustomException.Conflict("이미 국내 프로필이 존재합니다");
        }
        
        DomesticProfile profile = DomesticProfile.builder()
                .member(member)
                .birthDate(request.getBirthDate())
                .gender(sanitizeInput(request.getGender()))
                .address(sanitizeInput(request.getAddress()))
                .detailedAddress(sanitizeInput(request.getDetailedAddress()))
                .postalCode(sanitizeInput(request.getPostalCode()))
                .emergencyContactName(sanitizeInput(request.getEmergencyContactName()))
                .emergencyContactPhone(sanitizeInput(request.getEmergencyContactPhone()))
                .emergencyContactRelation(sanitizeInput(request.getEmergencyContactRelation()))
                .healthInsuranceNumber(sanitizeInput(request.getHealthInsuranceNumber()))
                .ltciGrade(request.getLtciGrade())
                .ltciCertificateNumber(sanitizeInput(request.getLtciCertificateNumber()))
                .preferredRegion(sanitizeInput(request.getPreferredRegion()))
                .careLevel(sanitizeInput(request.getCareLevel()))
                .specialNeeds(sanitizeInput(request.getSpecialNeeds()))
                .familyVisitFrequency(sanitizeInput(request.getFamilyVisitFrequency()))
                .budgetRange(sanitizeInput(request.getBudgetRange()))
                .build();
        
        DomesticProfile savedProfile = domesticProfileRepository.save(profile);
        
        log.info("국내 프로필 생성: memberId={}, completionRate={}%", 
                memberId, savedProfile.getProfileCompletionPercentage());
        
        return DomesticProfileResponse.from(savedProfile);
    }
    
    @Transactional
    public OverseasProfileResponse createOverseasProfile(Long memberId, OverseasProfileRequest request) {
        validateOverseasProfileRequest(request);
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException.NotFound("존재하지 않는 회원입니다"));
        
        validateMemberForOverseasProfile(member);
        
        if (overseasProfileRepository.existsByMemberId(memberId)) {
            throw new CustomException.Conflict("이미 해외 프로필이 존재합니다");
        }
        
        OverseasProfile profile = OverseasProfile.builder()
                .member(member)
                .birthDate(request.getBirthDate())
                .gender(sanitizeInput(request.getGender()))
                .overseasAddress(sanitizeInput(request.getOverseasAddress()))
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
                .koreaContactName(sanitizeInput(request.getKoreaContactName()))
                .koreaContactPhone(sanitizeInput(request.getKoreaContactPhone()))
                .koreaContactRelation(sanitizeInput(request.getKoreaContactRelation()))
                .overseasInsuranceNumber(sanitizeInput(request.getOverseasInsuranceNumber()))
                .overseasInsuranceProvider(sanitizeInput(request.getOverseasInsuranceProvider()))
                .travelInsurance(sanitizeInput(request.getTravelInsurance()))
                .entryPurpose(sanitizeInput(request.getEntryPurpose()))
                .expectedStayDuration(sanitizeInput(request.getExpectedStayDuration()))
                .preferredCommunicationMethod(sanitizeInput(request.getPreferredCommunicationMethod()))
                .timeZonePreference(sanitizeInput(request.getTimeZonePreference()))
                .preferredRegionInKorea(sanitizeInput(request.getPreferredRegionInKorea()))
                .budgetRange(sanitizeInput(request.getBudgetRange()))
                .careLevel(sanitizeInput(request.getCareLevel()))
                .specialNeeds(sanitizeInput(request.getSpecialNeeds()))
                .culturalDietaryRequirements(sanitizeInput(request.getCulturalDietaryRequirements()))
                .coordinatorRequired(request.getCoordinatorRequired())
                .build();
        
        OverseasProfile savedProfile = overseasProfileRepository.save(profile);
        
        log.info("해외 프로필 생성: memberId={}, country={}, completionRate={}%", 
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
        validateDomesticProfileRequest(request);
        
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        updateDomesticProfileFields(profile, request);
        
        log.info("국내 프로필 수정: memberId={}, completionRate={}%", 
                memberId, profile.getProfileCompletionPercentage());
        
        return DomesticProfileResponse.from(profile);
    }
    
    @Transactional
    public OverseasProfileResponse updateOverseasProfile(Long memberId, OverseasProfileRequest request) {
        validateOverseasProfileRequest(request);
        
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        updateOverseasProfileFields(profile, request);
        
        log.info("해외 프로필 수정: memberId={}, completionRate={}%", 
                memberId, profile.getProfileCompletionPercentage());
        
        return OverseasProfileResponse.from(profile);
    }
    
    @Transactional
    public void deleteDomesticProfile(Long memberId) {
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        domesticProfileRepository.delete(profile);
        log.info("국내 프로필 삭제: memberId={}", memberId);
    }
    
    @Transactional
    public void deleteOverseasProfile(Long memberId) {
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        overseasProfileRepository.delete(profile);
        log.info("해외 프로필 삭제: memberId={}", memberId);
    }
    
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
    
    public List<OverseasProfileResponse> getOverseasProfilesWithExpiringDocuments() {
        LocalDate threeMonthsLater = LocalDate.now().plusMonths(3);
        LocalDate oneMonthLater = LocalDate.now().plusMonths(1);
        
        List<OverseasProfile> expiringPassports = overseasProfileRepository.findByPassportExpiryDateBefore(threeMonthsLater);
        List<OverseasProfile> expiringVisas = overseasProfileRepository.findByVisaExpiryDateBefore(oneMonthLater);
        
        return expiringPassports.stream()
                .filter(profile -> expiringVisas.contains(profile) || 
                        profile.getPassportExpiryDate() != null && 
                        profile.getPassportExpiryDate().isBefore(threeMonthsLater))
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    private void validateMemberForDomesticProfile(Member member) {
        if (member.getRole() == MemberRole.USER_OVERSEAS) {
            throw new CustomException.BadRequest("해외 사용자는 국내 프로필을 생성할 수 없습니다");
        }
    }
    
    private void validateMemberForOverseasProfile(Member member) {
        if (member.getRole() == MemberRole.USER_DOMESTIC) {
            throw new CustomException.BadRequest("국내 사용자는 해외 프로필을 생성할 수 없습니다");
        }
    }
    
    private void validateDomesticProfileRequest(DomesticProfileRequest request) {
        if (request == null) {
            throw new CustomException.BadRequest("프로필 정보가 필요합니다");
        }
        
        validateSecurityPatterns(request.getGender(), request.getAddress(), 
                                request.getDetailedAddress(), request.getEmergencyContactName());
        
        if (request.getBirthDate() != null && request.getBirthDate().isAfter(LocalDate.now())) {
            throw new CustomException.BadRequest("생년월일은 현재보다 과거여야 합니다");
        }
        
        if (request.getLtciGrade() != null && (request.getLtciGrade() < 1 || request.getLtciGrade() > 6)) {
            throw new CustomException.BadRequest("장기요양등급은 1-6 사이여야 합니다");
        }
    }
    
    private void validateOverseasProfileRequest(OverseasProfileRequest request) {
        if (request == null) {
            throw new CustomException.BadRequest("프로필 정보가 필요합니다");
        }
        
        if (!StringUtils.hasText(request.getResidenceCountry())) {
            throw new CustomException.BadRequest("거주 국가는 필수입니다");
        }
        
        validateSecurityPatterns(request.getGender(), request.getOverseasAddress(), 
                                request.getResidenceCountry(), request.getOverseasContactName());
        
        if (request.getBirthDate() != null && request.getBirthDate().isAfter(LocalDate.now())) {
            throw new CustomException.BadRequest("생년월일은 현재보다 과거여야 합니다");
        }
        
        if (request.getPassportExpiryDate() != null && request.getPassportExpiryDate().isBefore(LocalDate.now())) {
            throw new CustomException.BadRequest("여권 만료일은 현재보다 미래여야 합니다");
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
    
    private void updateDomesticProfileFields(DomesticProfile profile, DomesticProfileRequest request) {
        if (request.getBirthDate() != null || StringUtils.hasText(request.getGender()) || 
            StringUtils.hasText(request.getAddress()) || StringUtils.hasText(request.getDetailedAddress()) ||
            StringUtils.hasText(request.getPostalCode())) {
            profile.updateBasicInfo(
                    request.getBirthDate(),
                    sanitizeInput(request.getGender()),
                    sanitizeInput(request.getAddress()),
                    sanitizeInput(request.getDetailedAddress()),
                    sanitizeInput(request.getPostalCode())
            );
        }
        
        if (StringUtils.hasText(request.getEmergencyContactName()) || 
            StringUtils.hasText(request.getEmergencyContactPhone()) ||
            StringUtils.hasText(request.getEmergencyContactRelation())) {
            profile.updateEmergencyContact(
                    sanitizeInput(request.getEmergencyContactName()),
                    sanitizeInput(request.getEmergencyContactPhone()),
                    sanitizeInput(request.getEmergencyContactRelation())
            );
        }
        
        if (StringUtils.hasText(request.getHealthInsuranceNumber()) || 
            request.getLtciGrade() != null ||
            StringUtils.hasText(request.getLtciCertificateNumber())) {
            profile.updateHealthInfo(
                    sanitizeInput(request.getHealthInsuranceNumber()),
                    request.getLtciGrade(),
                    sanitizeInput(request.getLtciCertificateNumber())
            );
        }
        
        if (StringUtils.hasText(request.getPreferredRegion()) || 
            StringUtils.hasText(request.getCareLevel()) ||
            StringUtils.hasText(request.getSpecialNeeds()) ||
            StringUtils.hasText(request.getFamilyVisitFrequency()) ||
            StringUtils.hasText(request.getBudgetRange())) {
            profile.updateCareInfo(
                    sanitizeInput(request.getPreferredRegion()),
                    sanitizeInput(request.getCareLevel()),
                    sanitizeInput(request.getSpecialNeeds()),
                    sanitizeInput(request.getFamilyVisitFrequency()),
                    sanitizeInput(request.getBudgetRange())
            );
        }
    }
    
    private void updateOverseasProfileFields(OverseasProfile profile, OverseasProfileRequest request) {
        if (request.getBirthDate() != null || StringUtils.hasText(request.getGender()) || 
            StringUtils.hasText(request.getOverseasAddress()) || StringUtils.hasText(request.getResidenceCountry()) ||
            StringUtils.hasText(request.getResidenceCity())) {
            profile.updateBasicInfo(
                    request.getBirthDate(),
                    sanitizeInput(request.getGender()),
                    sanitizeInput(request.getOverseasAddress()),
                    sanitizeInput(request.getResidenceCountry()),
                    sanitizeInput(request.getResidenceCity())
            );
        }
        
        if (StringUtils.hasText(request.getKoreanAddress()) || 
            StringUtils.hasText(request.getKoreanPostalCode())) {
            profile.updateKoreanAddress(
                    sanitizeInput(request.getKoreanAddress()),
                    sanitizeInput(request.getKoreanPostalCode())
            );
        }
        
        if (StringUtils.hasText(request.getPassportNumber()) || 
            request.getPassportExpiryDate() != null ||
            StringUtils.hasText(request.getVisaStatus()) ||
            request.getVisaExpiryDate() != null) {
            profile.updatePassportInfo(
                    sanitizeInput(request.getPassportNumber()),
                    request.getPassportExpiryDate(),
                    sanitizeInput(request.getVisaStatus()),
                    request.getVisaExpiryDate()
            );
        }
        
        if (StringUtils.hasText(request.getOverseasContactName()) || 
            StringUtils.hasText(request.getOverseasContactPhone()) ||
            StringUtils.hasText(request.getOverseasContactRelation())) {
            profile.updateOverseasContact(
                    sanitizeInput(request.getOverseasContactName()),
                    sanitizeInput(request.getOverseasContactPhone()),
                    sanitizeInput(request.getOverseasContactRelation())
            );
        }
        
        if (StringUtils.hasText(request.getKoreaContactName()) || 
            StringUtils.hasText(request.getKoreaContactPhone()) ||
            StringUtils.hasText(request.getKoreaContactRelation())) {
            profile.updateKoreaContact(
                    sanitizeInput(request.getKoreaContactName()),
                    sanitizeInput(request.getKoreaContactPhone()),
                    sanitizeInput(request.getKoreaContactRelation())
            );
        }
        
        if (StringUtils.hasText(request.getOverseasInsuranceNumber()) || 
            StringUtils.hasText(request.getOverseasInsuranceProvider()) ||
            StringUtils.hasText(request.getTravelInsurance())) {
            profile.updateInsuranceInfo(
                    sanitizeInput(request.getOverseasInsuranceNumber()),
                    sanitizeInput(request.getOverseasInsuranceProvider()),
                    sanitizeInput(request.getTravelInsurance())
            );
        }
        
        if (StringUtils.hasText(request.getEntryPurpose()) || 
            StringUtils.hasText(request.getExpectedStayDuration()) ||
            StringUtils.hasText(request.getPreferredCommunicationMethod()) ||
            StringUtils.hasText(request.getTimeZonePreference())) {
            profile.updateTripInfo(
                    sanitizeInput(request.getEntryPurpose()),
                    sanitizeInput(request.getExpectedStayDuration()),
                    sanitizeInput(request.getPreferredCommunicationMethod()),
                    sanitizeInput(request.getTimeZonePreference())
            );
        }
        
        if (StringUtils.hasText(request.getPreferredRegionInKorea()) || 
            StringUtils.hasText(request.getBudgetRange()) ||
            StringUtils.hasText(request.getCareLevel()) ||
            StringUtils.hasText(request.getSpecialNeeds()) ||
            StringUtils.hasText(request.getCulturalDietaryRequirements())) {
            profile.updateCareInfo(
                    sanitizeInput(request.getPreferredRegionInKorea()),
                    sanitizeInput(request.getBudgetRange()),
                    sanitizeInput(request.getCareLevel()),
                    sanitizeInput(request.getSpecialNeeds()),
                    sanitizeInput(request.getCulturalDietaryRequirements())
            );
        }
        
        if (request.getCoordinatorRequired() != null) {
            profile.setCoordinatorRequired(request.getCoordinatorRequired());
        }
    }
}