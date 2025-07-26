package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.SecurityUtil;
import com.globalcarelink.profile.dto.OverseasProfileRequest;
import com.globalcarelink.profile.dto.OverseasProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 해외 프로필 전용 서비스
 * 단일 책임 원칙 적용: 해외 프로필 관련 기능만 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OverseasProfileService {
    
    private final OverseasProfileRepository overseasProfileRepository;
    private final MemberRepository memberRepository;
    private final ProfileValidationService validationService;
    
    /**
     * 해외 프로필 생성
     */
    @Transactional
    public OverseasProfileResponse createProfile(Long memberId, OverseasProfileRequest request) {
        log.info("해외 프로필 생성 시작 - 회원: {}", memberId);
        
        // 검증
        validationService.validateOverseasProfileRequest(request);
        Member member = findMemberById(memberId);
        validationService.validateMemberForOverseasProfile(member);
        
        // 중복 체크
        if (overseasProfileRepository.existsByMemberId(memberId)) {
            throw new CustomException.Conflict("이미 해외 프로필이 존재합니다");
        }
        
        // 프로필 생성
        OverseasProfile profile = buildOverseasProfile(member, request);
        OverseasProfile savedProfile = overseasProfileRepository.save(profile);
        
        log.info("해외 프로필 생성 완료 - 회원: {}, 거주국: {}, 완성도: {}%", 
                memberId, savedProfile.getResidenceCountry(), savedProfile.getProfileCompletionPercentage());
        
        return OverseasProfileResponse.from(savedProfile);
    }
    
    /**
     * 해외 프로필 조회
     */
    public OverseasProfileResponse getProfile(Long memberId) {
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        return OverseasProfileResponse.from(profile);
    }
    
    /**
     * 해외 프로필 수정
     */
    @Transactional
    public OverseasProfileResponse updateProfile(Long memberId, OverseasProfileRequest request) {
        log.info("해외 프로필 수정 시작 - 회원: {}", memberId);
        
        // 검증
        validationService.validateOverseasProfileRequest(request);
        
        // 프로필 조회
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        // 수정 권한 체크
        checkUpdatePermission(profile.getMember());
        
        // 프로필 업데이트
        updateProfileFields(profile, request);
        OverseasProfile savedProfile = overseasProfileRepository.save(profile);
        
        log.info("해외 프로필 수정 완료 - 회원: {}, 거주국: {}, 완성도: {}%", 
                memberId, savedProfile.getResidenceCountry(), savedProfile.getProfileCompletionPercentage());
        
        return OverseasProfileResponse.from(savedProfile);
    }
    
    /**
     * 해외 프로필 삭제
     */
    @Transactional
    public void deleteProfile(Long memberId) {
        log.info("해외 프로필 삭제 시작 - 회원: {}", memberId);
        
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        // 삭제 권한 체크
        checkUpdatePermission(profile.getMember());
        
        overseasProfileRepository.delete(profile);
        log.info("해외 프로필 삭제 완료 - 회원: {}", memberId);
    }
    
    /**
     * 국가별 해외 프로필 조회
     */
    public List<OverseasProfileResponse> getProfilesByCountry(String country) {
        List<OverseasProfile> profiles = overseasProfileRepository.findByResidenceCountry(country);
        return profiles.stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 코디네이터 필요 해외 프로필 조회
     */
    public List<OverseasProfileResponse> getProfilesRequiringCoordinator() {
        List<OverseasProfile> profiles = overseasProfileRepository.findByNeedsCoordinatorTrue();
        return profiles.stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 언어별 해외 프로필 조회
     */
    public List<OverseasProfileResponse> getProfilesByLanguage(String language) {
        List<OverseasProfile> profiles = overseasProfileRepository.findByPreferredLanguageContaining(language);
        return profiles.stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 비자 상태별 해외 프로필 조회
     */
    public List<OverseasProfileResponse> getProfilesByVisaStatus(OverseasProfile.VisaStatus visaStatus) {
        List<OverseasProfile> profiles = overseasProfileRepository.findByVisaStatus(visaStatus);
        return profiles.stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 페이징된 해외 프로필 조회
     */
    public Page<OverseasProfileResponse> getProfiles(Pageable pageable) {
        Page<OverseasProfile> profiles = overseasProfileRepository.findAll(pageable);
        return profiles.map(OverseasProfileResponse::from);
    }
    
    // ===== 내부 헬퍼 메서드들 =====
    
    private Member findMemberById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException.NotFound("회원을 찾을 수 없습니다"));
    }
    
    private void checkUpdatePermission(Member profileOwner) {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();
        if (!profileOwner.getEmail().equals(currentUserEmail)) {
            throw new CustomException.Forbidden("프로필 수정 권한이 없습니다");
        }
    }
    
    private OverseasProfile buildOverseasProfile(Member member, OverseasProfileRequest request) {
        OverseasProfile profile = new OverseasProfile();
        profile.setMember(member);
        updateProfileFields(profile, request);
        return profile;
    }
    
    private void updateProfileFields(OverseasProfile profile, OverseasProfileRequest request) {
        // BaseProfile 필드 업데이트
        profile.setName(request.getName());
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setDetailAddress(request.getDetailAddress());
        profile.setEmergencyContact(request.getEmergencyContact());
        profile.setEmergencyContactRelation(request.getEmergencyContactRelation());
        profile.setProfileImage(request.getProfileImage());
        profile.setNotes(request.getNotes());
        
        // OverseasProfile 전용 필드 업데이트
        profile.setResidenceCountry(request.getResidenceCountry());
        profile.setNationality(request.getNationality());
        profile.setPassportNumber(request.getPassportNumber());
        profile.setPassportExpiry(request.getPassportExpiry());
        profile.setVisaStatus(request.getVisaStatus());
        profile.setVisaExpiry(request.getVisaExpiry());
        profile.setLocalAddress(request.getLocalAddress());
        profile.setLocalPhone(request.getLocalPhone());
        profile.setLocalEmergencyContact(request.getLocalEmergencyContact());
        profile.setPreferredLanguage(request.getPreferredLanguage());
        profile.setLanguageProficiency(request.getLanguageProficiency());
        profile.setHasLocalInsurance(request.getHasLocalInsurance());
        profile.setInsuranceDetails(request.getInsuranceDetails());
        profile.setNeedsCoordinator(request.getNeedsCoordinator());
        profile.setCulturalPreferences(request.getCulturalPreferences());
        profile.setTimeZone(request.getTimeZone());
        profile.setCurrencyPreference(request.getCurrencyPreference());
        profile.setLocalHealthcareProvider(request.getLocalHealthcareProvider());
        profile.setNeedsTranslationService(request.getNeedsTranslationService());
        
        // 프로필 완성도 계산
        profile.calculateCompletionPercentage();
    }
}