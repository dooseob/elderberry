package com.globalcarelink.profile;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.config.IntegrationTestConfig;
import com.globalcarelink.profile.dto.DomesticProfileRequest;
import com.globalcarelink.profile.dto.DomesticProfileResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * DomesticProfileService 통합 테스트
 * Phase 2.4 강화: Mock 객체 대신 실제 DB 상호작용 검증
 * H2 파일 모드 사용으로 테스트 데이터 유지 및 디버깅 편의성 제공
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(IntegrationTestConfig.class)
@Transactional
@Rollback
class DomesticProfileServiceIntegrationTest {
    
    @Autowired
    private DomesticProfileService domesticProfileService;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private DomesticProfileRepository domesticProfileRepository;
    
    @Autowired
    private IntegrationTestConfig.TestPerformanceMonitor performanceMonitor;
    
    @Autowired
    private IntegrationTestConfig.TestDataUtility testDataUtility;
    
    private Member testMember;
    private DomesticProfileRequest validRequest;
    
    @BeforeEach
    void setUp() {
        // 실제 DB에 테스트 회원 생성 (Mock 대신)
        testMember = new Member();
        testMember.setEmail("integration.test@example.com");
        testMember.setPassword("$2a$12$test.password.hash");
        testMember.setName("통합테스트사용자");
        testMember.setRole(MemberRole.USER_DOMESTIC);
        testMember.setActive(true);
        testMember.setEmailVerified(true);
        testMember = memberRepository.save(testMember);
        
        // 유효한 프로필 요청 데이터 준비
        validRequest = DomesticProfileRequest.builder()
                .name("김통합")
                .age(65)
                .gender(BaseProfile.Gender.FEMALE)
                .phone("010-1234-5678")
                .address("서울시 강남구 테스트로 123")
                .nationalHealthInsuranceNumber("1234567890")
                .careLevel("3등급")
                .preferredCareType("재가요양")
                .mobilityLevel("부분도움")
                .cognitiveLevel("정상")
                .preferredRegion("서울시 강남구")
                .budgetRange("200만원-300만원")
                .build();
    }
    
    @Test
    @DisplayName("국내 프로필 생성 - 정상 시나리오")
    void createProfile_Success() {
        // Given
        long startTime = System.currentTimeMillis();
        
        // When
        DomesticProfileResponse response = domesticProfileService.createProfile(testMember.getId(), validRequest);
        
        // Then
        long executionTime = System.currentTimeMillis() - startTime;
        performanceMonitor.validateQueryPerformance(executionTime, "국내 프로필 생성");
        
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("김통합");
        assertThat(response.getAge()).isEqualTo(65);
        assertThat(response.getCareLevel()).isEqualTo("3등급");
        assertThat(response.getProfileCompletionPercentage()).isGreaterThan(0);
        
        // 실제 DB에 저장되었는지 검증
        DomesticProfile savedProfile = domesticProfileRepository.findByMemberId(testMember.getId())
                .orElseThrow(() -> new AssertionError("프로필이 DB에 저장되지 않음"));
        
        assertThat(savedProfile.getName()).isEqualTo("김통합");
        assertThat(savedProfile.getMember().getEmail()).isEqualTo(testMember.getEmail());
        
        testDataUtility.verifyTestDataIntegrity();
    }
    
    @Test
    @DisplayName("국내 프로필 생성 - 중복 프로필 예외")
    void createProfile_DuplicateProfile_ThrowsException() {
        // Given
        domesticProfileService.createProfile(testMember.getId(), validRequest);
        
        // When & Then
        assertThatThrownBy(() -> domesticProfileService.createProfile(testMember.getId(), validRequest))
                .isInstanceOf(CustomException.Conflict.class)
                .hasMessageContaining("이미 국내 프로필이 존재합니다");
        
        // DB 상태 검증 - 프로필이 하나만 존재하는지 확인
        List<DomesticProfile> profiles = domesticProfileRepository.findAll();
        long memberProfiles = profiles.stream()
                .filter(p -> p.getMember().getId().equals(testMember.getId()))
                .count();
        assertThat(memberProfiles).isEqualTo(1);
    }
    
    @Test
    @DisplayName("국내 프로필 조회 - 정상 시나리오")
    void getProfile_Success() {
        // Given
        domesticProfileService.createProfile(testMember.getId(), validRequest);
        
        // When
        long startTime = System.currentTimeMillis();
        DomesticProfileResponse response = domesticProfileService.getProfile(testMember.getId());
        long executionTime = System.currentTimeMillis() - startTime;
        
        // Then
        performanceMonitor.validateQueryPerformance(executionTime, "국내 프로필 조회");
        
        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("김통합");
        assertThat(response.getMemberId()).isEqualTo(testMember.getId());
    }
    
    @Test
    @DisplayName("국내 프로필 수정 - 정상 시나리오")
    void updateProfile_Success() {
        // Given
        domesticProfileService.createProfile(testMember.getId(), validRequest);
        
        DomesticProfileRequest updateRequest = DomesticProfileRequest.builder()
                .name("김수정")
                .age(66)
                .gender(BaseProfile.Gender.FEMALE)
                .phone("010-9876-5432")
                .careLevel("2등급")
                .preferredCareType("시설요양")
                .build();
        
        // When
        DomesticProfileResponse response = domesticProfileService.updateProfile(testMember.getId(), updateRequest);
        
        // Then
        assertThat(response.getName()).isEqualTo("김수정");
        assertThat(response.getAge()).isEqualTo(66);
        assertThat(response.getCareLevel()).isEqualTo("2등급");
        assertThat(response.getPreferredCareType()).isEqualTo("시설요양");
        
        // 실제 DB에 수정사항이 반영되었는지 검증
        DomesticProfile updatedProfile = domesticProfileRepository.findByMemberId(testMember.getId())
                .orElseThrow();
        assertThat(updatedProfile.getName()).isEqualTo("김수정");
        assertThat(updatedProfile.getCareLevel()).isEqualTo("2등급");
    }
    
    @Test
    @DisplayName("완성도별 프로필 조회 - 실제 DB 쿼리 테스트")
    void getProfilesByCompletion_RealDatabaseQuery() {
        // Given - 완성도가 다른 여러 프로필 생성
        createMultipleProfilesWithDifferentCompletion();
        
        // When
        long startTime = System.currentTimeMillis();
        List<DomesticProfileResponse> highCompletionProfiles = 
                domesticProfileService.getProfilesByCompletion(80);
        long executionTime = System.currentTimeMillis() - startTime;
        
        // Then
        performanceMonitor.validateQueryPerformance(executionTime, "완성도별 프로필 조회");
        
        assertThat(highCompletionProfiles).isNotEmpty();
        assertThat(highCompletionProfiles).allSatisfy(profile -> 
                assertThat(profile.getProfileCompletionPercentage()).isGreaterThanOrEqualTo(80));
        
        // 낮은 완성도 프로필도 테스트
        List<DomesticProfileResponse> lowCompletionProfiles = 
                domesticProfileService.getProfilesByCompletion(30);
        assertThat(lowCompletionProfiles.size()).isGreaterThan(highCompletionProfiles.size());
    }
    
    @ParameterizedTest
    @ValueSource(strings = {"1등급", "2등급", "3등급", "4등급", "5등급", "인지지원등급"})
    @DisplayName("케어 등급별 프로필 조회 - 매개변수화 테스트")
    void getProfilesByCareLevel_ParameterizedTest(String careLevel) {
        // Given
        DomesticProfileRequest request = validRequest.toBuilder()
                .careLevel(careLevel)
                .build();
        domesticProfileService.createProfile(testMember.getId(), request);
        
        // When
        List<DomesticProfileResponse> profiles = 
                domesticProfileService.getProfilesByCareLevel(careLevel);
        
        // Then
        assertThat(profiles).hasSize(1);
        assertThat(profiles.get(0).getCareLevel()).isEqualTo(careLevel);
    }
    
    @Test
    @DisplayName("페이징 조회 - 실제 DB 페이징 성능 테스트")
    void getProfiles_PagingPerformanceTest() {
        // Given - 대량 데이터 생성
        createLargeDatasetForPagingTest();
        
        // When
        long startTime = System.currentTimeMillis();
        Page<DomesticProfileResponse> firstPage = 
                domesticProfileService.getProfiles(PageRequest.of(0, 10));
        long executionTime = System.currentTimeMillis() - startTime;
        
        // Then
        performanceMonitor.validateQueryPerformance(executionTime, "페이징 조회 (첫 페이지)");
        
        assertThat(firstPage.getContent()).hasSize(10);
        assertThat(firstPage.getTotalElements()).isGreaterThan(10);
        assertThat(firstPage.getNumber()).isEqualTo(0);
        
        // 마지막 페이지 조회 성능도 테스트
        startTime = System.currentTimeMillis();
        Page<DomesticProfileResponse> lastPage = 
                domesticProfileService.getProfiles(PageRequest.of(firstPage.getTotalPages() - 1, 10));
        executionTime = System.currentTimeMillis() - startTime;
        
        performanceMonitor.validateQueryPerformance(executionTime, "페이징 조회 (마지막 페이지)");
        assertThat(lastPage.isLast()).isTrue();
    }
    
    @Test
    @DisplayName("프로필 삭제 - 실제 DB 삭제 검증")
    void deleteProfile_RealDatabaseDeletion() {
        // Given
        domesticProfileService.createProfile(testMember.getId(), validRequest);
        assertThat(domesticProfileRepository.findByMemberId(testMember.getId())).isPresent();
        
        // When
        domesticProfileService.deleteProfile(testMember.getId());
        
        // Then
        assertThat(domesticProfileRepository.findByMemberId(testMember.getId())).isEmpty();
        
        // 삭제 후 조회 시 예외 발생 검증
        assertThatThrownBy(() -> domesticProfileService.getProfile(testMember.getId()))
                .isInstanceOf(CustomException.NotFound.class);
    }
    
    // ===== 테스트 헬퍼 메서드들 =====
    
    private void createMultipleProfilesWithDifferentCompletion() {
        // 높은 완성도 프로필 생성
        for (int i = 0; i < 3; i++) {
            Member member = createTestMember("high.completion." + i + "@test.com");
            DomesticProfileRequest highCompletionRequest = createHighCompletionRequest();
            domesticProfileService.createProfile(member.getId(), highCompletionRequest);
        }
        
        // 낮은 완성도 프로필 생성
        for (int i = 0; i < 5; i++) {
            Member member = createTestMember("low.completion." + i + "@test.com");
            DomesticProfileRequest lowCompletionRequest = createLowCompletionRequest();
            domesticProfileService.createProfile(member.getId(), lowCompletionRequest);
        }
    }
    
    private void createLargeDatasetForPagingTest() {
        for (int i = 0; i < 25; i++) {
            Member member = createTestMember("paging.test." + i + "@test.com");
            domesticProfileService.createProfile(member.getId(), validRequest);
        }
    }
    
    private Member createTestMember(String email) {
        Member member = new Member();
        member.setEmail(email);
        member.setPassword("$2a$12$test.hash");
        member.setName("테스트사용자" + email.substring(0, 5));
        member.setRole(MemberRole.USER_DOMESTIC);
        member.setActive(true);
        member.setEmailVerified(true);
        return memberRepository.save(member);
    }
    
    private DomesticProfileRequest createHighCompletionRequest() {
        return validRequest.toBuilder()
                .address("완성도높은주소 상세주소까지")
                .emergencyContact("010-9999-8888")
                .emergencyContactRelation("자녀")
                .medicalHistoryDetails("상세한 병력 정보")
                .specialRequirements("특별 요구사항 상세 기재")
                .familyContact("010-7777-6666")
                .build();
    }
    
    private DomesticProfileRequest createLowCompletionRequest() {
        return DomesticProfileRequest.builder()
                .name("최소정보")
                .age(70)
                .gender(BaseProfile.Gender.MALE)
                .build();
    }
}