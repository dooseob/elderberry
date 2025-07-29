package com.globalcarelink.common.config;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.facility.FacilityProfile;
import com.globalcarelink.facility.FacilityProfileRepository;
import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * 애플리케이션 시작 시 초기 데이터를 로드하는 컴포넌트
 * JPA 엔티티가 완전히 생성된 후 실행되므로 스키마 충돌 없음
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {
    
    private final MemberRepository memberRepository;
    private final FacilityProfileRepository facilityProfileRepository;
    private final HealthAssessmentRepository healthAssessmentRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        log.info("🚀 데이터 초기화 시작...");
        
        // 이미 데이터가 있으면 건너뛰기
        if (memberRepository.count() > 0) {
            log.info("✅ 이미 초기 데이터가 존재합니다. 스킵합니다.");
            return;
        }
        
        initializeMembers();
        initializeFacilities();
        initializeHealthAssessments();
        
        log.info("✅ 데이터 초기화 완료!");
    }
    
    private void initializeMembers() {
        String encodedPassword = passwordEncoder.encode("Password123!");
        
        // 테스트 계정들 생성
        Member[] testMembers = {
            Member.builder()
                .email("test.domestic@example.com")
                .password(encodedPassword)
                .name("김테스트")
                .phoneNumber("010-1234-5678")
                .role(MemberRole.USER_DOMESTIC)
                .isJobSeeker(false)
                .isActive(true)
                .emailVerified(true)
                .language("ko")
                .region("서울특별시")
                .build(),
            
            Member.builder()
                .email("test.overseas@example.com")
                .password(encodedPassword)
                .name("John Test")
                .phoneNumber("010-2345-6789")
                .role(MemberRole.USER_OVERSEAS)
                .isJobSeeker(false)
                .isActive(true)
                .emailVerified(true)
                .language("en")
                .region("New York")
                .build(),
            
            Member.builder()
                .email("test.coordinator@example.com")
                .password(encodedPassword)
                .name("이코디")
                .phoneNumber("010-3456-7890")
                .role(MemberRole.COORDINATOR)
                .isJobSeeker(false)
                .isActive(true)
                .emailVerified(true)
                .language("ko")
                .region("서울특별시")
                .build(),
            
            Member.builder()
                .email("test.facility@example.com")
                .password(encodedPassword)
                .name("시설관리자")
                .phoneNumber("010-4567-8901")
                .role(MemberRole.FACILITY)
                .isJobSeeker(false)
                .isActive(true)
                .emailVerified(true)
                .language("ko")
                .region("부산광역시")
                .build(),
            
            Member.builder()
                .email("test.admin@example.com")
                .password(encodedPassword)
                .name("관리자")
                .phoneNumber("010-5678-9012")
                .role(MemberRole.ADMIN)
                .isJobSeeker(false)
                .isActive(true)
                .emailVerified(true)
                .language("ko")
                .region("서울특별시")
                .build()
        };
        
        for (Member member : testMembers) {
            memberRepository.save(member);
            log.info("🔧 테스트 계정 생성: {}", member.getEmail());
        }
    }
    
    private void initializeFacilities() {
        FacilityProfile[] testFacilities = {
            FacilityProfile.builder()
                .facilityName("서울요양원")
                .facilityType("노인요양시설")
                .address("서울시 강남구 테스트로 123")
                .region("서울특별시")
                .district("강남구")
                .totalCapacity(50)
                .currentOccupancy(35)
                .facilityGrade("A")
                .evaluationScore(95)
                .isActive(true)
                .build(),
            
            FacilityProfile.builder()
                .facilityName("부산실버케어")
                .facilityType("주야간보호시설")
                .address("부산시 해운대구 해변로 456")
                .region("부산광역시")
                .district("해운대구")
                .totalCapacity(30)
                .currentOccupancy(25)
                .facilityGrade("B")
                .evaluationScore(88)
                .isActive(true)
                .build(),
            
            FacilityProfile.builder()
                .facilityName("대구케어센터")
                .facilityType("재활전문시설")
                .address("대구시 중구 중앙로 789")
                .region("대구광역시")
                .district("중구")
                .totalCapacity(20)
                .currentOccupancy(15)
                .facilityGrade("C")
                .evaluationScore(75)
                .isActive(true)
                .build(),
            
            FacilityProfile.builder()
                .facilityName("인천노인복지관")
                .facilityType("노인요양시설")
                .address("인천시 남동구 구월로 101")
                .region("인천광역시")
                .district("남동구")
                .totalCapacity(100)
                .currentOccupancy(80)
                .facilityGrade("B")
                .evaluationScore(82)
                .isActive(true)
                .build()
        };
        
        for (FacilityProfile facility : testFacilities) {
            facilityProfileRepository.save(facility);
            log.info("🏥 테스트 시설 생성: {}", facility.getName());
        }
    }
    
    private void initializeHealthAssessments() {
        // 멤버가 생성된 후 건강 평가 데이터 생성
        Member domesticMember = memberRepository.findByEmail("test.domestic@example.com").orElse(null);
        Member overseasMember = memberRepository.findByEmail("test.overseas@example.com").orElse(null);
        Member coordinatorMember = memberRepository.findByEmail("test.coordinator@example.com").orElse(null);
        
        if (domesticMember != null) {
            HealthAssessment assessment1 = HealthAssessment.builder()
                .memberId(domesticMember.getId().toString())
                .mobilityLevel(1)
                .eatingLevel(1)
                .toiletLevel(1)
                .communicationLevel(1)
                .ltciGrade(1)
                .careTargetStatus(4)
                .mealType(1)
                .build();
            assessment1.calculateAdlScore();
            healthAssessmentRepository.save(assessment1);
            log.info("🩺 건강 평가 생성: 회원 ID {}", domesticMember.getId());
        }
        
        if (overseasMember != null) {
            HealthAssessment assessment2 = HealthAssessment.builder()
                .memberId(overseasMember.getId().toString())
                .mobilityLevel(2)
                .eatingLevel(1)
                .toiletLevel(2)
                .communicationLevel(2)
                .ltciGrade(2)
                .careTargetStatus(4)
                .mealType(1)
                .build();
            assessment2.calculateAdlScore();
            healthAssessmentRepository.save(assessment2);
            log.info("🩺 건강 평가 생성: 회원 ID {}", overseasMember.getId());
        }
        
        if (coordinatorMember != null) {
            HealthAssessment assessment3 = HealthAssessment.builder()
                .memberId(coordinatorMember.getId().toString())
                .mobilityLevel(3)
                .eatingLevel(2)
                .toiletLevel(3)
                .communicationLevel(2)
                .ltciGrade(3)
                .careTargetStatus(4)
                .mealType(1)
                .build();
            assessment3.calculateAdlScore();
            healthAssessmentRepository.save(assessment3);
            log.info("🩺 건강 평가 생성: 회원 ID {}", coordinatorMember.getId());
        }
    }
}