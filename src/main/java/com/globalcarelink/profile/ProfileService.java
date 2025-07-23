package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.SecurityUtil;
import com.globalcarelink.common.util.ValidationUtil;
import com.globalcarelink.external.PublicDataApiClient;
import com.globalcarelink.external.dto.EntranceVisaRequirement;
import com.globalcarelink.profile.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.ArrayList;

/**
 * 프로필 서비스
 * Template Method 패턴과 DRY 원칙 적용으로 중복 코드 최소화
 * 제네릭을 활용한 공통 로직 통합
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {
    
    private final MemberRepository memberRepository;
    private final DomesticProfileRepository domesticProfileRepository;
    private final OverseasProfileRepository overseasProfileRepository;
    private final PublicDataApiClient publicDataApiClient;
    
    // ===== Template Method 패턴을 적용한 프로필 관리 =====
    
    /**
     * 국내 프로필 생성 - Template Method 적용
     */
    @Transactional
    public DomesticProfileResponse createDomesticProfile(Long memberId, DomesticProfileRequest request) {
        return createProfile(
            memberId,
            request,
            "국내 프로필",
            this::validateDomesticProfileRequest,
            this::validateMemberForDomesticProfile,
            () -> domesticProfileRepository.existsByMemberId(memberId),
            this::buildDomesticProfile,
            domesticProfileRepository::save,
            DomesticProfileResponse::from,
            profile -> log.info("국내 프로필 생성 완료 - 회원: {}, 완성도: {}%", 
                    memberId, profile.getProfileCompletionPercentage())
        );
    }
    
    /**
     * 해외 프로필 생성 - Template Method 적용
     */
    @Transactional
    public OverseasProfileResponse createOverseasProfile(Long memberId, OverseasProfileRequest request) {
        return createProfile(
            memberId,
            request,
            "해외 프로필",
            this::validateOverseasProfileRequest,
            this::validateMemberForOverseasProfile,
            () -> overseasProfileRepository.existsByMemberId(memberId),
            this::buildOverseasProfile,
            overseasProfileRepository::save,
            OverseasProfileResponse::from,
            profile -> log.info("해외 프로필 생성 완료 - 회원: {}, 거주국: {}, 완성도: {}%", 
                    memberId, profile.getResidenceCountry(), profile.getProfileCompletionPercentage())
        );
    }
    
    /**
     * 프로필 생성 공통 Template Method
     * 모든 프로필 생성 로직의 공통 흐름을 추상화
     */
    private <T extends BaseProfile, R extends BaseProfileRequest, S extends T> S createProfile(
            Long memberId,
            R request,
            String profileType,
            ProfileValidator<R> validator,
            MemberValidator memberValidator,
            Supplier<Boolean> existsChecker,
            ProfileBuilder<T, R> builder,
            Function<T, S> saver,
            Function<S, ?> responseMapper,
            ProfileLogger<S> logger) {
        
        log.info("{} 생성 시작 - 회원: {}", profileType, memberId);
        
        // 1. 요청 데이터 검증
        validator.validate(request);
        
        // 2. 회원 조회 및 검증
        Member member = findMemberById(memberId);
        memberValidator.validate(member);
        
        // 3. 중복 프로필 체크
        if (existsChecker.get()) {
            throw new CustomException.Conflict("이미 " + profileType + "이 존재합니다");
        }
        
        // 4. 프로필 생성 및 저장
        T profile = builder.build(member, request);
        S savedProfile = saver.apply(profile);
        
        // 5. 로깅
        logger.log(savedProfile);
        
        return savedProfile;
    }
    
    /**
     * 국내 프로필 조회
     */
    public DomesticProfileResponse getDomesticProfile(Long memberId) {
        return getProfile(
            memberId, 
            domesticProfileRepository::findByMemberId,
            "국내 프로필이 존재하지 않습니다",
            DomesticProfileResponse::from
        );
    }
    
    /**
     * 해외 프로필 조회
     */
    public OverseasProfileResponse getOverseasProfile(Long memberId) {
        return getProfile(
            memberId,
            overseasProfileRepository::findByMemberId,
            "해외 프로필이 존재하지 않습니다",
            OverseasProfileResponse::from
        );
    }
    
    /**
     * 프로필 조회 공통 메서드
     */
    private <T extends BaseProfile, R> R getProfile(
            Long memberId,
            Function<Long, Optional<T>> finder,
            String notFoundMessage,
            Function<T, R> mapper) {
        
        T profile = finder.apply(memberId)
                .orElseThrow(() -> new CustomException.NotFound(notFoundMessage));
        
        return mapper.apply(profile);
    }
    
    /**
     * 국내 프로필 수정 - Template Method 적용
     */
    @Transactional
    public DomesticProfileResponse updateDomesticProfile(Long memberId, DomesticProfileRequest request) {
        return updateProfile(
            memberId,
            request,
            "국내 프로필",
            this::validateDomesticProfileRequest,
            domesticProfileRepository::findByMemberId,
            "국내 프로필이 존재하지 않습니다",
            this::updateDomesticProfileFields,
            DomesticProfileResponse::from,
            profile -> log.info("국내 프로필 수정 완료 - 회원: {}, 완성도: {}%", 
                    memberId, profile.getProfileCompletionPercentage())
        );
    }
    
    /**
     * 해외 프로필 수정 - Template Method 적용
     */
    @Transactional
    public OverseasProfileResponse updateOverseasProfile(Long memberId, OverseasProfileRequest request) {
        return updateProfile(
            memberId,
            request,
            "해외 프로필",
            this::validateOverseasProfileRequest,
            overseasProfileRepository::findByMemberId,
            "해외 프로필이 존재하지 않습니다",
            this::updateOverseasProfileFields,
            OverseasProfileResponse::from,
            profile -> log.info("해외 프로필 수정 완료 - 회원: {}, 완성도: {}%", 
                    memberId, profile.getProfileCompletionPercentage())
        );
    }
    
    /**
     * 프로필 수정 공통 Template Method
     */
    private <T extends BaseProfile, R extends BaseProfileRequest, S> S updateProfile(
            Long memberId,
            R request,
            String profileType,
            ProfileValidator<R> validator,
            Function<Long, Optional<T>> finder,
            String notFoundMessage,
            ProfileUpdater<T, R> updater,
            Function<T, S> responseMapper,
            ProfileLogger<T> logger) {
        
        log.info("{} 수정 시작 - 회원: {}", profileType, memberId);
        
        // 1. 요청 데이터 검증
        validator.validate(request);
        
        // 2. 프로필 조회
        T profile = finder.apply(memberId)
                .orElseThrow(() -> new CustomException.NotFound(notFoundMessage));
        
        // 3. 프로필 업데이트
        updater.update(profile, request);
        
        // 4. 로깅
        logger.log(profile);
        
        return responseMapper.apply(profile);
    }
    
    /**
     * 국내 프로필 삭제
     */
    @Transactional
    public void deleteDomesticProfile(Long memberId) {
        deleteProfile(
            memberId,
            "국내 프로필",
            domesticProfileRepository::findByMemberId,
            "국내 프로필이 존재하지 않습니다",
            domesticProfileRepository::delete
        );
    }
    
    /**
     * 해외 프로필 삭제
     */
    @Transactional
    public void deleteOverseasProfile(Long memberId) {
        deleteProfile(
            memberId,
            "해외 프로필",
            overseasProfileRepository::findByMemberId,
            "해외 프로필이 존재하지 않습니다",
            overseasProfileRepository::delete
        );
    }
    
    /**
     * 프로필 삭제 공통 Template Method
     */
    private <T extends BaseProfile> void deleteProfile(
            Long memberId,
            String profileType,
            Function<Long, Optional<T>> finder,
            String notFoundMessage,
            ProfileDeleter<T> deleter) {
        
        T profile = finder.apply(memberId)
                .orElseThrow(() -> new CustomException.NotFound(notFoundMessage));
        
        deleter.delete(profile);
        log.info("{} 삭제 완료 - 회원: {}", profileType, memberId);
    }
    
    // ===== 조회 메서드들 (기존 유지) =====
    
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
    
    private void validateCompletionRate(int minCompletionRate) {
        if (minCompletionRate < 0 || minCompletionRate > 100) {
            throw new CustomException.BadRequest("완성도는 0-100 사이여야 합니다");
        }
    }
    
    // ===== 공통 유틸리티 메서드 =====
    
    /**
     * 보안 패턴 검증 (가변인자 활용)
     */
    private void validateSecurityPatterns(String... inputs) {
        for (String input : inputs) {
            if (StringUtils.hasText(input) && !ValidationUtil.isSafeInput(input)) {
                throw new CustomException.BadRequest("유효하지 않은 입력 형식입니다");
            }
        }
    }
    
    /**
     * 입력값 정제 (XSS 방지)
     */
    private String sanitizeInput(String input) {
        return ValidationUtil.sanitizeInput(input);
    }
    
    // ===== 입국허가요건 API 연동 메서드들 =====
    
    /**
     * 해외 프로필의 입국허가요건 조회
     */
    public Mono<List<EntranceVisaRequirement>> getVisaRequirementsForOverseasProfile(Long memberId) {
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        String residenceCountry = profile.getResidenceCountry();
        if (!StringUtils.hasText(residenceCountry)) {
            return Mono.just(List.of());
        }
        
        return publicDataApiClient.getEntranceVisaRequirements(residenceCountry)
                .onErrorReturn(List.of());
    }
    
    /**
     * 맞춤형 입국허가요건 조회
     */
    public Mono<List<EntranceVisaRequirement>> getCustomizedVisaRequirements(Long memberId, String entryPurpose) {
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        return publicDataApiClient.getCustomizedVisaRequirements(profile.getResidenceCountry(), entryPurpose)
                .onErrorReturn(List.of());
    }
    
    /**
     * 프로필 개선 제안 생성
     */
    public Mono<List<String>> getProfileImprovementSuggestions(Long memberId) {
        OverseasProfile profile = overseasProfileRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException.NotFound("해외 프로필이 존재하지 않습니다"));
        
        return getVisaRequirementsForOverseasProfile(memberId)
                .map(requirements -> generateImprovementSuggestions(profile, requirements));
    }
    
    /**
     * 입국허가요건 변경 알림 대상 조회
     */
    public Mono<List<OverseasProfileResponse>> getProfilesRequiringVisaUpdateNotification(String countryName) {
        if (!StringUtils.hasText(countryName)) {
            throw new CustomException.BadRequest("국가명이 필요합니다");
        }
        
        List<OverseasProfile> profiles = overseasProfileRepository.findByResidenceCountry(countryName);
        
        return Mono.just(profiles.stream()
                .map(OverseasProfileResponse::from)
                .collect(Collectors.toList()));
    }
    
    /**
     * 프로필 개선 제안 생성 헬퍼 메서드
     */
    private List<String> generateImprovementSuggestions(OverseasProfile profile, List<EntranceVisaRequirement> requirements) {
        List<String> suggestions = new ArrayList<>();
        
        // 기본 정보 완성도 체크
        if (!profile.hasEssentialInfo()) {
            suggestions.add("기본 정보(생년월일, 성별, 주소, 비상연락처)를 완성해주세요");
        }
        
        // 여권 정보 체크
        if (!StringUtils.hasText(profile.getPassportNumber())) {
            suggestions.add("여권 정보를 추가하면 입국 절차 안내를 더 정확히 받을 수 있습니다");
        }
        
        // 여권 만료일 체크
        if (profile.getPassportExpiryDate() != null && 
            profile.getPassportExpiryDate().isBefore(java.time.LocalDate.now().plusMonths(6))) {
            suggestions.add("여권 만료일이 임박했습니다. 갱신을 고려해주세요");
        }
        
        // 입국허가요건 기반 제안
        if (!requirements.isEmpty()) {
            boolean visaRequired = requirements.stream()
                    .anyMatch(req -> "Y".equals(req.getVisaNeeded()));
            
            if (visaRequired && !StringUtils.hasText(profile.getVisaStatus())) {
                suggestions.add("거주 국가에서 한국 입국 시 비자가 필요할 수 있습니다. 비자 정보를 추가해주세요");
            }
        }
        
        // 한국 내 연락처 체크
        if (!StringUtils.hasText(profile.getKoreanAddress())) {
            suggestions.add("한국 내 연락처를 추가하면 입국 시 도움을 받기 쉽습니다");
        }
        
        return suggestions;
    }
    
    // ===== Functional Interface들 (Template Method 패턴 지원) =====
    
    @FunctionalInterface
    private interface ProfileValidator<T> {
        void validate(T request);
    }
    
    @FunctionalInterface
    private interface MemberValidator {
        void validate(Member member);
    }
    
    @FunctionalInterface
    private interface ProfileBuilder<T extends BaseProfile, R> {
        T build(Member member, R request);
    }
    
    @FunctionalInterface
    private interface ProfileUpdater<T, R> {
        void update(T profile, R request);
    }
    
    @FunctionalInterface
    private interface ProfileDeleter<T> {
        void delete(T profile);
    }
    
    @FunctionalInterface
    private interface ProfileLogger<T> {
        void log(T profile);
    }
}