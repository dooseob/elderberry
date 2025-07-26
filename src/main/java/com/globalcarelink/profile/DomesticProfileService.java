package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.SecurityUtil;
import com.globalcarelink.profile.dto.DomesticProfileRequest;
import com.globalcarelink.profile.dto.DomesticProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 국내 프로필 전용 서비스
 * 단일 책임 원칙 적용: 국내 프로필 관련 기능만 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DomesticProfileService {
    
    private final DomesticProfileRepository domesticProfileRepository;
    private final MemberRepository memberRepository;
    private final ProfileValidationService validationService;
    
    /**
     * 국내 프로필 생성
     */
    @Transactional
    public DomesticProfileResponse createProfile(Long memberId, DomesticProfileRequest request) {
        log.info("국내 프로필 생성 시작 - 회원: {}", memberId);
        
        // 검증
        validationService.validateDomesticProfileRequest(request);
        Member member = findMemberById(memberId);
        validationService.validateMemberForDomesticProfile(member);
        
        // 중복 체크
        if (domesticProfileRepository.existsByMemberId(memberId)) {
            throw new CustomException.Conflict("이미 국내 프로필이 존재합니다");
        }
        
        // 프로필 생성
        DomesticProfile profile = buildDomesticProfile(member, request);
        DomesticProfile savedProfile = domesticProfileRepository.save(profile);
        
        log.info("국내 프로필 생성 완료 - 회원: {}, 완성도: {}%", 
                memberId, savedProfile.getProfileCompletionPercentage());
        
        return DomesticProfileResponse.from(savedProfile);
    }
    
    /**
     * 국내 프로필 조회
     */
    public DomesticProfileResponse getProfile(Long memberId) {
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        return DomesticProfileResponse.from(profile);
    }
    
    /**
     * 국내 프로필 수정
     */
    @Transactional
    public DomesticProfileResponse updateProfile(Long memberId, DomesticProfileRequest request) {
        log.info("국내 프로필 수정 시작 - 회원: {}", memberId);
        
        // 검증
        validationService.validateDomesticProfileRequest(request);
        
        // 프로필 조회
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        // 수정 권한 체크
        checkUpdatePermission(profile.getMember());
        
        // 프로필 업데이트
        updateProfileFields(profile, request);
        DomesticProfile savedProfile = domesticProfileRepository.save(profile);
        
        log.info("국내 프로필 수정 완료 - 회원: {}, 완성도: {}%", 
                memberId, savedProfile.getProfileCompletionPercentage());
        
        return DomesticProfileResponse.from(savedProfile);
    }
    
    /**
     * 국내 프로필 삭제
     */
    @Transactional
    public void deleteProfile(Long memberId) {
        log.info("국내 프로필 삭제 시작 - 회원: {}", memberId);
        
        DomesticProfile profile = domesticProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("국내 프로필이 존재하지 않습니다"));
        
        // 삭제 권한 체크
        checkUpdatePermission(profile.getMember());
        
        domesticProfileRepository.delete(profile);
        log.info("국내 프로필 삭제 완료 - 회원: {}", memberId);
    }
    
    /**
     * 완성도별 국내 프로필 조회
     */
    public List<DomesticProfileResponse> getProfilesByCompletion(int minCompletionRate) {
        List<DomesticProfile> profiles = domesticProfileRepository.findByProfileCompletionPercentageGreaterThanEqual(minCompletionRate);
        return profiles.stream()
                .map(DomesticProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 케어 등급별 국내 프로필 조회
     */
    public List<DomesticProfileResponse> getProfilesByCareLevel(String careLevel) {
        List<DomesticProfile> profiles = domesticProfileRepository.findByCareLevel(careLevel);
        return profiles.stream()
                .map(DomesticProfileResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 페이징된 국내 프로필 조회
     */
    public Page<DomesticProfileResponse> getProfiles(Pageable pageable) {
        Page<DomesticProfile> profiles = domesticProfileRepository.findAll(pageable);
        return profiles.map(DomesticProfileResponse::from);
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
    
    private DomesticProfile buildDomesticProfile(Member member, DomesticProfileRequest request) {
        DomesticProfile profile = new DomesticProfile();
        profile.setMember(member);
        updateProfileFields(profile, request);
        return profile;
    }
    
    private void updateProfileFields(DomesticProfile profile, DomesticProfileRequest request) {
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
        
        // DomesticProfile 전용 필드 업데이트
        profile.setNationalHealthInsuranceNumber(request.getNationalHealthInsuranceNumber());
        profile.setCareLevel(request.getCareLevel());
        profile.setPreferredCareType(request.getPreferredCareType());
        profile.setHasMedicalHistory(request.getHasMedicalHistory());
        profile.setMedicalHistoryDetails(request.getMedicalHistoryDetails());
        profile.setMobilityLevel(request.getMobilityLevel());
        profile.setCognitiveLevel(request.getCognitiveLevel());
        profile.setPreferredRegion(request.getPreferredRegion());
        profile.setBudgetRange(request.getBudgetRange());
        profile.setSpecialRequirements(request.getSpecialRequirements());
        profile.setFamilyContact(request.getFamilyContact());
        profile.setInsuranceCoverage(request.getInsuranceCoverage());
        profile.setPreferredLanguage(request.getPreferredLanguage());
        
        // 프로필 완성도 계산
        profile.calculateCompletionPercentage();
    }
}