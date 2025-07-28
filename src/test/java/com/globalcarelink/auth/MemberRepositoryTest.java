package com.globalcarelink.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("회원 Repository 테스트")
class MemberRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MemberRepository memberRepository;

    private Member domesticUser;
    private Member overseasUser;
    private Member coordinator;
    private Member facilityAdmin;

    @BeforeEach
    void setUp() {
        domesticUser = createMember("domestic@test.com", "국내사용자", MemberRole.USER_DOMESTIC, true, "ko", "서울");
        overseasUser = createMember("overseas@test.com", "해외사용자", MemberRole.USER_OVERSEAS, true, "en", "New York");
        coordinator = createMember("coordinator@test.com", "코디네이터", MemberRole.COORDINATOR, false, "ko", "서울");
        facilityAdmin = createMember("facility@test.com", "시설관리자", MemberRole.FACILITY, false, "ko", "부산");
        
        entityManager.persistAndFlush(domesticUser);
        entityManager.persistAndFlush(overseasUser);
        entityManager.persistAndFlush(coordinator);
        entityManager.persistAndFlush(facilityAdmin);
    }

    @Test
    @DisplayName("이메일로 회원 조회 - 성공")
    void findByEmail_Success() {
        Optional<Member> found = memberRepository.findByEmail("domestic@test.com");
        
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("국내사용자");
        assertThat(found.get().getRole()).isEqualTo(MemberRole.USER_DOMESTIC);
    }

    @Test
    @DisplayName("이메일로 회원 조회 - 존재하지 않는 이메일")
    void findByEmail_NotFound() {
        Optional<Member> found = memberRepository.findByEmail("notexist@test.com");
        
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("이메일 중복 확인 - 존재하는 이메일")
    void existsByEmail_True() {
        boolean exists = memberRepository.existsByEmail("coordinator@test.com");
        
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("이메일 중복 확인 - 존재하지 않는 이메일")
    void existsByEmail_False() {
        boolean exists = memberRepository.existsByEmail("newuser@test.com");
        
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("역할별 회원 조회")
    void findByRole_Success() {
        List<Member> users = memberRepository.findByRole(MemberRole.USER_DOMESTIC);
        
        assertThat(users).hasSize(1);
        assertThat(users.get(0).getEmail()).isEqualTo("domestic@test.com");
    }

    @Test
    @DisplayName("활성 구직자 조회")
    void findByIsJobSeekerAndIsActive_Success() {
        List<Member> jobSeekers = memberRepository.findByIsJobSeekerAndIsActive(true, true);
        
        assertThat(jobSeekers).hasSize(2);
        assertThat(jobSeekers).extracting(Member::getEmail)
                .containsExactlyInAnyOrder("domestic@test.com", "overseas@test.com");
    }

    @Test
    @DisplayName("지역별 역할 조회")
    void findActiveByRoleAndRegion_Success() {
        List<Member> seoulCoordinators = memberRepository.findActiveByRoleAndRegion(MemberRole.COORDINATOR, "서울");
        
        assertThat(seoulCoordinators).hasSize(1);
        assertThat(seoulCoordinators.get(0).getEmail()).isEqualTo("coordinator@test.com");
    }

    @Test
    @DisplayName("키워드 검색 - 이름으로 검색")
    void searchByKeyword_ByName() {
        List<Member> results = memberRepository.searchByKeyword("국내");
        
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).contains("국내");
    }

    @Test
    @DisplayName("키워드 검색 - 이메일로 검색")
    void searchByKeyword_ByEmail() {
        List<Member> results = memberRepository.searchByKeyword("coordinator");
        
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmail()).contains("coordinator");
    }

    @Test
    @DisplayName("역할별 회원 수 카운트")
    void countByRole_Success() {
        long userCount = memberRepository.countByRole(MemberRole.USER_DOMESTIC);
        long coordinatorCount = memberRepository.countByRole(MemberRole.COORDINATOR);
        
        assertThat(userCount).isEqualTo(1);
        assertThat(coordinatorCount).isEqualTo(1);
    }

    @Test
    @DisplayName("활성 회원 수 카운트")
    void countByRoleAndIsActive_Success() {
        long activeUsers = memberRepository.countByRoleAndIsActive(MemberRole.USER_DOMESTIC, true);
        
        assertThat(activeUsers).isEqualTo(1);
    }

    @Test
    @DisplayName("복수 역할로 회원 조회")
    void findByRolesAndIsActive_Success() {
        List<MemberRole> userRoles = List.of(MemberRole.USER_DOMESTIC, MemberRole.USER_OVERSEAS);
        List<Member> users = memberRepository.findByRolesAndIsActive(userRoles, true);
        
        assertThat(users).hasSize(2);
        assertThat(users).extracting(Member::getRole)
                .containsExactlyInAnyOrder(MemberRole.USER_DOMESTIC, MemberRole.USER_OVERSEAS);
    }

    private Member createMember(String email, String name, MemberRole role, boolean isJobSeeker, String language, String region) {
        return Member.builder()
                .email(email)
                .password("encoded_password")
                .name(name)
                .phoneNumber("010-1234-5678")
                .role(role)
                .isJobSeeker(isJobSeeker)
                .language(language)
                .region(region)
                .build();
    }
}