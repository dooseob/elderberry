package com.globalcarelink.common.config;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 시작 시 초기 데이터를 로드하는 컴포넌트
 * data.sql 대신 Java 코드로 데이터 초기화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("데이터 초기화 시작...");
        
        // 이미 데이터가 있으면 스킵
        if (memberRepository.count() > 0) {
            log.info("데이터가 이미 존재합니다. 초기화를 스킵합니다.");
            return;
        }
        
        // 비밀번호: Password123!
        String encodedPassword = passwordEncoder.encode("Password123!");
        
        // 테스트 회원 데이터 생성
        Member domesticUser = Member.builder()
                .email("test.domestic@example.com")
                .password(encodedPassword)
                .name("김테스트")
                .phoneNumber("010-1234-5678")
                .role(MemberRole.USER_DOMESTIC)
                .isJobSeeker(false)
                .isActive(true)
                .language("ko")
                .region("서울특별시")
                .build();

        Member overseasUser = Member.builder()
                .email("test.overseas@example.com")
                .password(encodedPassword)
                .name("John Test")
                .phoneNumber("010-2345-6789")
                .role(MemberRole.USER_OVERSEAS)
                .isJobSeeker(false)
                .isActive(true)
                .language("en")
                .region("New York")
                .build();

        Member coordinator = Member.builder()
                .email("test.coordinator@example.com")
                .password(encodedPassword)
                .name("이코디")
                .phoneNumber("010-3456-7890")
                .role(MemberRole.COORDINATOR)
                .isJobSeeker(false)
                .isActive(true)
                .language("ko")
                .region("서울특별시")
                .build();

        Member facility = Member.builder()
                .email("test.facility@example.com")
                .password(encodedPassword)
                .name("시설관리자")
                .phoneNumber("010-4567-8901")
                .role(MemberRole.FACILITY)
                .isJobSeeker(false)
                .isActive(true)
                .language("ko")
                .region("부산광역시")
                .build();

        Member admin = Member.builder()
                .email("test.admin@example.com")
                .password(encodedPassword)
                .name("관리자")
                .phoneNumber("010-5678-9012")
                .role(MemberRole.ADMIN)
                .isJobSeeker(false)
                .isActive(true)
                .language("ko")
                .region("서울특별시")
                .build();

        // 테스트용 특수 케이스 계정들
        Member inactiveUser = Member.builder()
                .email("inactive.user@example.com")
                .password(encodedPassword)
                .name("비활성사용자")
                .phoneNumber("010-0000-0001")
                .role(MemberRole.USER_DOMESTIC)
                .isJobSeeker(false)
                .isActive(false)  // 비활성화 상태
                .emailVerified(true)
                .language("ko")
                .region("서울특별시")
                .build();

        Member unverifiedUser = Member.builder()
                .email("unverified.user@example.com")
                .password(encodedPassword)
                .name("미인증사용자")
                .phoneNumber("010-0000-0002")
                .role(MemberRole.USER_DOMESTIC)
                .isJobSeeker(false)
                .isActive(true)
                .emailVerified(false)  // 이메일 미인증 상태
                .language("ko")
                .region("서울특별시")
                .build();

        // 추가 테스트 시나리오 계정들
        Member jobSeekerUser = Member.builder()
                .email("jobseeker.test@example.com")
                .password(encodedPassword)
                .name("구직자테스트")
                .phoneNumber("010-0000-0003")
                .role(MemberRole.USER_OVERSEAS)
                .isJobSeeker(true)  // 구직자 상태
                .isActive(true)
                .emailVerified(true)
                .language("en")
                .region("California")
                .build();

        // 데이터베이스에 저장
        memberRepository.save(domesticUser);
        memberRepository.save(overseasUser);
        memberRepository.save(coordinator);
        memberRepository.save(facility);
        memberRepository.save(admin);
        memberRepository.save(inactiveUser);
        memberRepository.save(unverifiedUser);
        memberRepository.save(jobSeekerUser);

        log.info("초기 회원 데이터 8개가 성공적으로 생성되었습니다.");
        log.info("테스트 로그인 정보:");
        log.info("- 이메일: test.domestic@example.com");
        log.info("- 비밀번호: Password123!");
    }
}