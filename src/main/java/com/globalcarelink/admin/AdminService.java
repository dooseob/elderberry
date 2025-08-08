package com.globalcarelink.admin;

import com.globalcarelink.admin.dto.*;
import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.board.BoardRepository;
import com.globalcarelink.review.ReviewRepository;
import com.globalcarelink.facility.FacilityProfileRepository;
import com.globalcarelink.job.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 관리자 서비스
 * - 회원 관리
 * - 콘텐츠 관리 (게시글, 리뷰, 시설)
 * - 시스템 통계 및 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final MemberRepository memberRepository;
    private final BoardRepository boardRepository;
    private final ReviewRepository reviewRepository;
    private final FacilityProfileRepository facilityRepository;
    private final JobRepository jobRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    // ===============================
    // 회원 관리
    // ===============================

    /**
     * 회원 검색
     */
    public Page<AdminMemberResponse> searchMembers(AdminMemberSearchRequest request, Pageable pageable) {
        // TODO: 실제 검색 로직 구현 (JPA Specification 사용 권장)
        List<Member> members = memberRepository.findAll();
        
        // 필터링 로직
        List<Member> filteredMembers = members.stream()
            .filter(member -> request.getRole() == null || member.getRole() == request.getRole())
            .filter(member -> request.getIsActive() == null || member.getIsActive().equals(request.getIsActive()))
            .filter(member -> request.getEmailVerified() == null || member.getEmailVerified().equals(request.getEmailVerified()))
            .filter(member -> request.getSearch() == null || 
                member.getName().contains(request.getSearch()) || 
                member.getEmail().contains(request.getSearch()))
            .toList();
        
        // AdminMemberResponse로 변환
        List<AdminMemberResponse> responses = filteredMembers.stream()
            .map(AdminMemberResponse::from)
            .toList();
        
        // 페이징 처리 (간단한 구현)
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());
        List<AdminMemberResponse> pageContent = responses.subList(start, end);
        
        return new PageImpl<>(pageContent, pageable, responses.size());
    }

    /**
     * 회원 상세 정보 조회
     */
    public AdminMemberDetailResponse getMemberDetail(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다: " + memberId));
        
        return AdminMemberDetailResponse.from(member);
    }

    /**
     * 회원 계정 상태 변경
     */
    @Transactional
    public void updateMemberStatus(Long memberId, MemberStatusUpdateRequest request) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다: " + memberId));
        
        if (request.getIsActive()) {
            member.activate();
        } else {
            member.deactivate();
        }
        
        memberRepository.save(member);
        log.info("회원 상태 변경 - ID: {}, 활성화: {}, 사유: {}", memberId, request.getIsActive(), request.getReason());
    }

    /**
     * 회원 역할 변경
     */
    @Transactional
    public void updateMemberRole(Long memberId, MemberRoleUpdateRequest request) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다: " + memberId));
        
        // 기존 역할 저장 (로깅용)
        MemberRole oldRole = member.getRole();
        
        // 역할 변경을 위해 새 Member 객체 생성 (role은 final일 수 있으므로)
        Member updatedMember = Member.builder()
            .id(member.getId())
            .email(member.getEmail())
            .password(member.getPassword())
            .name(member.getName())
            .phoneNumber(member.getPhoneNumber())
            .role(request.getRole())
            .isJobSeeker(member.getIsJobSeeker())
            .isActive(member.getIsActive())
            .emailVerified(member.getEmailVerified())
            .language(member.getLanguage())
            .region(member.getRegion())
            .build();
        
        memberRepository.save(updatedMember);
        log.info("회원 역할 변경 - ID: {}, {} → {}, 사유: {}", memberId, oldRole, request.getRole(), request.getReason());
    }

    // ===============================
    // 콘텐츠 관리
    // ===============================

    /**
     * 게시글 관리 목록 조회
     */
    public Page<AdminPostResponse> searchPosts(AdminPostSearchRequest request, Pageable pageable) {
        // TODO: 게시글 검색 로직 구현
        List<AdminPostResponse> posts = new ArrayList<>();
        
        // 임시 더미 데이터
        AdminPostResponse dummyPost = AdminPostResponse.builder()
            .id(1L)
            .title("테스트 게시글")
            .content("테스트 내용")
            .boardType("GENERAL")
            .authorName("테스트 사용자")
            .authorEmail("test@example.com")
            .isHidden(false)
            .reportsCount(0)
            .viewCount(10)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        posts.add(dummyPost);
        
        return new PageImpl<>(posts, pageable, posts.size());
    }

    /**
     * 게시글 숨김/표시 처리
     */
    @Transactional
    public void updatePostVisibility(Long postId, PostVisibilityUpdateRequest request) {
        // TODO: 게시글 숨김 처리 로직 구현
        log.info("게시글 숨김 상태 변경 - ID: {}, 숨김: {}, 사유: {}", postId, request.getIsHidden(), request.getReason());
    }

    /**
     * 리뷰 관리 목록 조회
     */
    public Page<AdminReviewResponse> searchReviews(AdminReviewSearchRequest request, Pageable pageable) {
        // TODO: 리뷰 검색 로직 구현
        List<AdminReviewResponse> reviews = new ArrayList<>();
        
        // 임시 더미 데이터
        AdminReviewResponse dummyReview = AdminReviewResponse.builder()
            .id(1L)
            .facilityName("테스트 시설")
            .reviewerName("테스트 리뷰어")
            .reviewerEmail("reviewer@example.com")
            .overallRating(4.5)
            .cleanlinessRating(4.0)
            .staffKindnessRating(5.0)
            .facilitiesRating(4.0)
            .mealQualityRating(4.5)
            .content("좋은 시설입니다.")
            .isHidden(false)
            .reportsCount(0)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        reviews.add(dummyReview);
        
        return new PageImpl<>(reviews, pageable, reviews.size());
    }

    /**
     * 리뷰 숨김/표시 처리
     */
    @Transactional
    public void updateReviewVisibility(Long reviewId, ReviewVisibilityUpdateRequest request) {
        // TODO: 리뷰 숨김 처리 로직 구현
        log.info("리뷰 숨김 상태 변경 - ID: {}, 숨김: {}, 사유: {}", reviewId, request.getIsHidden(), request.getReason());
    }

    /**
     * 승인 대기 시설 목록
     */
    public Page<AdminFacilityResponse> getPendingFacilities(Pageable pageable) {
        // TODO: 승인 대기 시설 조회 로직 구현
        List<AdminFacilityResponse> facilities = new ArrayList<>();
        
        // 임시 더미 데이터
        AdminFacilityResponse dummyFacility = AdminFacilityResponse.builder()
            .id(1L)
            .name("테스트 요양원")
            .address("서울시 강남구")
            .phoneNumber("02-1234-5678")
            .facilityType("요양원")
            .ownerName("시설관리자")
            .ownerEmail("facility@example.com")
            .approvalStatus("PENDING")
            .submittedAt(LocalDateTime.now())
            .build();
        facilities.add(dummyFacility);
        
        return new PageImpl<>(facilities, pageable, facilities.size());
    }

    /**
     * 시설 승인/거부
     */
    @Transactional
    public void updateFacilityApproval(Long facilityId, FacilityApprovalRequest request) {
        // TODO: 시설 승인/거부 로직 구현
        log.info("시설 승인 상태 변경 - ID: {}, 상태: {}, 사유: {}", facilityId, request.getApprovalStatus(), request.getReason());
    }

    // ===============================
    // 시스템 통계
    // ===============================

    /**
     * 전체 시스템 통계
     */
    public SystemOverviewStatistics getSystemOverviewStatistics() {
        return SystemOverviewStatistics.builder()
            .totalMembers(memberRepository.count())
            .activeMembers(memberRepository.countByRoleAndIsActive(MemberRole.ADMIN, true) +
                          memberRepository.countByRoleAndIsActive(MemberRole.FACILITY, true) +
                          memberRepository.countByRoleAndIsActive(MemberRole.COORDINATOR, true) +
                          memberRepository.countByRoleAndIsActive(MemberRole.USER_DOMESTIC, true) +
                          memberRepository.countByRoleAndIsActive(MemberRole.USER_OVERSEAS, true) +
                          memberRepository.countByRoleAndIsActive(MemberRole.JOB_SEEKER_DOMESTIC, true) +
                          memberRepository.countByRoleAndIsActive(MemberRole.JOB_SEEKER_OVERSEAS, true))
            .adminMembers(memberRepository.countByRole(MemberRole.ADMIN))
            .facilityMembers(memberRepository.countByRole(MemberRole.FACILITY))
            .coordinatorMembers(memberRepository.countByRole(MemberRole.COORDINATOR))
            .patientFamilyMembers(memberRepository.countByRole(MemberRole.USER_DOMESTIC) +
                                 memberRepository.countByRole(MemberRole.USER_OVERSEAS))
            .jobSeekerMembers(memberRepository.countByRole(MemberRole.JOB_SEEKER_DOMESTIC) +
                             memberRepository.countByRole(MemberRole.JOB_SEEKER_OVERSEAS))
            .totalPosts(boardRepository.count())
            .totalReviews(reviewRepository.count())
            .totalFacilities(facilityRepository.count())
            .totalJobs(jobRepository.count())
            .todayRegistrations(0L) // TODO: 날짜별 조회 메서드 구현 필요
            .todayPosts(0L) // TODO: 구현
            .todayReviews(0L) // TODO: 구현
            .pendingApprovals(0L) // TODO: 구현
            .systemStatus("UP")
            .avgResponseTime(150.0)
            .totalDiskUsage(0L) // TODO: 구현
            .build();
    }

    /**
     * 회원 가입 통계
     */
    public List<MemberRegistrationStats> getMemberRegistrationStatistics(String startDate, String endDate, String groupBy) {
        LocalDateTime start = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE).atTime(23, 59, 59);
        
        // TODO: 실제 통계 쿼리 구현
        List<MemberRegistrationStats> stats = new ArrayList<>();
        
        // 임시 더미 데이터
        MemberRegistrationStats dummyStat = MemberRegistrationStats.builder()
            .date(LocalDate.now())
            .registrationCount(10L)
            .adminCount(1L)
            .facilityCount(2L)
            .coordinatorCount(1L)
            .patientFamilyCount(4L)
            .jobSeekerCount(2L)
            .build();
        stats.add(dummyStat);
        
        return stats;
    }

    /**
     * 활동 통계
     */
    public ActivityStatistics getActivityStatistics(String startDate, String endDate) {
        LocalDateTime start = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE).atTime(23, 59, 59);
        
        // TODO: 실제 활동 통계 쿼리 구현
        return ActivityStatistics.builder()
            .totalPosts(boardRepository.count())
            .newPosts(0L) // TODO: 기간별 조회
            .reportedPosts(0L) // TODO: 구현
            .hiddenPosts(0L) // TODO: 구현
            .totalReviews(reviewRepository.count())
            .newReviews(0L) // TODO: 기간별 조회
            .reportedReviews(0L) // TODO: 구현
            .hiddenReviews(0L) // TODO: 구현
            .totalChats(0L) // TODO: 구현
            .newChats(0L) // TODO: 구현
            .activeUsers(memberRepository.countByRoleAndIsActive(MemberRole.USER_DOMESTIC, true) +
                        memberRepository.countByRoleAndIsActive(MemberRole.USER_OVERSEAS, true))
            .totalJobPosts(jobRepository.count())
            .newJobPosts(0L) // TODO: 기간별 조회
            .jobApplications(0L) // TODO: 구현
            .build();
    }

    // ===============================
    // 공지사항 관리
    // ===============================

    /**
     * 공지사항 목록 조회
     */
    public Page<AdminNoticeResponse> getNotices(Pageable pageable) {
        // TODO: Notice 엔티티 및 레포지토리 구현 후 실제 로직 작성
        List<AdminNoticeResponse> notices = new ArrayList<>();
        
        // 임시 더미 데이터
        AdminNoticeResponse dummyNotice = AdminNoticeResponse.builder()
            .id(1L)
            .title("시스템 점검 안내")
            .content("시스템 점검을 실시합니다.")
            .authorName("관리자")
            .isImportant(true)
            .isPublished(true)
            .publishedAt(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .viewCount(100L)
            .build();
        notices.add(dummyNotice);
        
        return new PageImpl<>(notices, pageable, notices.size());
    }

    /**
     * 공지사항 작성
     */
    @Transactional
    public AdminNoticeResponse createNotice(NoticeCreateRequest request) {
        // TODO: Notice 엔티티 생성 및 저장
        log.info("공지사항 작성 - 제목: {}, 중요: {}", request.getTitle(), request.getIsImportant());
        
        // 임시 응답
        return AdminNoticeResponse.builder()
            .id(1L)
            .title(request.getTitle())
            .content(request.getContent())
            .authorName("관리자")
            .isImportant(request.getIsImportant())
            .isPublished(request.getIsPublished())
            .createdAt(LocalDateTime.now())
            .build();
    }

    /**
     * 공지사항 수정
     */
    @Transactional
    public AdminNoticeResponse updateNotice(Long noticeId, NoticeUpdateRequest request) {
        // TODO: Notice 엔티티 수정
        log.info("공지사항 수정 - ID: {}, 제목: {}", noticeId, request.getTitle());
        
        // 임시 응답
        return AdminNoticeResponse.builder()
            .id(noticeId)
            .title(request.getTitle())
            .content(request.getContent())
            .isImportant(request.getIsImportant())
            .isPublished(request.getIsPublished())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    /**
     * 공지사항 삭제
     */
    @Transactional
    public void deleteNotice(Long noticeId) {
        // TODO: Notice 엔티티 삭제
        log.info("공지사항 삭제 - ID: {}", noticeId);
    }

    // ===============================
    // 시스템 관리
    // ===============================

    /**
     * 시스템 헬스 체크
     */
    public SystemHealthResponse getSystemHealth() {
        return SystemHealthResponse.builder()
            .overallStatus("UP")
            .databaseStatus("UP")
            .databaseConnections(10L)
            .databaseResponseTime(50.0)
            .redisStatus("UP")
            .redisConnections(5L)
            .redisMemoryUsage(1024L * 1024 * 100) // 100MB
            .cpuUsage(45.0)
            .memoryUsage(60.0)
            .diskUsage(1024L * 1024 * 1024 * 50) // 50GB
            .diskTotal(1024L * 1024 * 1024 * 500) // 500GB
            .publicApiStatus("UP")
            .publicApiResponseTime(200.0)
            .lastChecked(LocalDateTime.now())
            .build();
    }

    /**
     * 캐시 관리
     */
    @Transactional
    public void manageCache(CacheManagementRequest request) {
        try {
            switch (request.getAction()) {
                case "CLEAR_ALL":
                    redisTemplate.getConnectionFactory().getConnection().flushAll();
                    log.info("전체 캐시 삭제 완료 - 사유: {}", request.getReason());
                    break;
                    
                case "CLEAR_BY_PATTERN":
                    if (request.getPattern() != null) {
                        Set<String> keys = redisTemplate.keys(request.getPattern());
                        if (!keys.isEmpty()) {
                            redisTemplate.delete(keys);
                            log.info("패턴별 캐시 삭제 완료 - 패턴: {}, 삭제된 키 수: {}", request.getPattern(), keys.size());
                        }
                    }
                    break;
                    
                case "FLUSH_DB":
                    redisTemplate.getConnectionFactory().getConnection().flushDb();
                    log.info("현재 DB 캐시 삭제 완료 - 사유: {}", request.getReason());
                    break;
                    
                default:
                    throw new IllegalArgumentException("지원하지 않는 캐시 작업: " + request.getAction());
            }
        } catch (Exception e) {
            log.error("캐시 관리 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("캐시 관리 실패", e);
        }
    }
}