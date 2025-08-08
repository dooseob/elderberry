package com.globalcarelink.admin;

import com.globalcarelink.admin.dto.*;
import com.globalcarelink.auth.dto.MemberResponse;
import com.globalcarelink.auth.MemberRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 관리자 전용 API 컨트롤러
 * - 사용자 관리
 * - 콘텐츠 관리 (게시글, 리뷰, 시설)
 * - 시스템 통계
 * - 공지사항 관리
 */
@Tag(name = "관리자 API", description = "시스템 관리자 전용 기능")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ===============================
    // 사용자 관리
    // ===============================

    @Operation(
        summary = "전체 회원 목록 조회",
        description = "모든 회원을 페이징하여 조회합니다. 역할, 상태별 필터링 가능"
    )
    @GetMapping("/members")
    public ResponseEntity<Page<AdminMemberResponse>> getAllMembers(
            @Parameter(description = "회원 역할 필터") @RequestParam(required = false) MemberRole role,
            @Parameter(description = "활성 상태 필터") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "이메일 인증 상태 필터") @RequestParam(required = false) Boolean emailVerified,
            @Parameter(description = "검색 키워드 (이름, 이메일)") @RequestParam(required = false) String search,
            Pageable pageable) {
        
        AdminMemberSearchRequest request = AdminMemberSearchRequest.builder()
            .role(role)
            .isActive(isActive)
            .emailVerified(emailVerified)
            .search(search)
            .build();
            
        Page<AdminMemberResponse> members = adminService.searchMembers(request, pageable);
        return ResponseEntity.ok(members);
    }

    @Operation(
        summary = "회원 상세 정보 조회",
        description = "특정 회원의 상세 정보를 조회합니다."
    )
    @GetMapping("/members/{memberId}")
    public ResponseEntity<AdminMemberDetailResponse> getMemberDetail(@PathVariable Long memberId) {
        AdminMemberDetailResponse response = adminService.getMemberDetail(memberId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "회원 계정 활성화/비활성화",
        description = "회원의 계정 상태를 변경합니다."
    )
    @PatchMapping("/members/{memberId}/status")
    public ResponseEntity<Void> updateMemberStatus(
            @PathVariable Long memberId,
            @RequestBody @Valid MemberStatusUpdateRequest request) {
        adminService.updateMemberStatus(memberId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "회원 역할 변경",
        description = "회원의 역할을 변경합니다."
    )
    @PatchMapping("/members/{memberId}/role")
    public ResponseEntity<Void> updateMemberRole(
            @PathVariable Long memberId,
            @RequestBody @Valid MemberRoleUpdateRequest request) {
        adminService.updateMemberRole(memberId, request);
        return ResponseEntity.ok().build();
    }

    // ===============================
    // 콘텐츠 관리
    // ===============================

    @Operation(
        summary = "게시글 관리 목록 조회",
        description = "신고된 게시글이나 관리가 필요한 게시글 목록을 조회합니다."
    )
    @GetMapping("/posts")
    public ResponseEntity<Page<AdminPostResponse>> getPosts(
            @Parameter(description = "게시판 타입") @RequestParam(required = false) String boardType,
            @Parameter(description = "신고 여부") @RequestParam(required = false) Boolean hasReports,
            @Parameter(description = "숨김 상태") @RequestParam(required = false) Boolean isHidden,
            Pageable pageable) {
        
        AdminPostSearchRequest request = AdminPostSearchRequest.builder()
            .boardType(boardType)
            .hasReports(hasReports)
            .isHidden(isHidden)
            .build();
            
        Page<AdminPostResponse> posts = adminService.searchPosts(request, pageable);
        return ResponseEntity.ok(posts);
    }

    @Operation(
        summary = "게시글 숨김/표시 처리",
        description = "부적절한 게시글을 숨김 처리하거나 다시 표시합니다."
    )
    @PatchMapping("/posts/{postId}/visibility")
    public ResponseEntity<Void> updatePostVisibility(
            @PathVariable Long postId,
            @RequestBody @Valid PostVisibilityUpdateRequest request) {
        adminService.updatePostVisibility(postId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "리뷰 관리 목록 조회",
        description = "신고된 리뷰나 관리가 필요한 리뷰 목록을 조회합니다."
    )
    @GetMapping("/reviews")
    public ResponseEntity<Page<AdminReviewResponse>> getReviews(
            @Parameter(description = "신고 여부") @RequestParam(required = false) Boolean hasReports,
            @Parameter(description = "숨김 상태") @RequestParam(required = false) Boolean isHidden,
            @Parameter(description = "평점 필터 (이하)") @RequestParam(required = false) Double maxRating,
            Pageable pageable) {
        
        AdminReviewSearchRequest request = AdminReviewSearchRequest.builder()
            .hasReports(hasReports)
            .isHidden(isHidden)
            .maxRating(maxRating)
            .build();
            
        Page<AdminReviewResponse> reviews = adminService.searchReviews(request, pageable);
        return ResponseEntity.ok(reviews);
    }

    @Operation(
        summary = "리뷰 숨김/표시 처리",
        description = "부적절한 리뷰를 숨김 처리하거나 다시 표시합니다."
    )
    @PatchMapping("/reviews/{reviewId}/visibility")
    public ResponseEntity<Void> updateReviewVisibility(
            @PathVariable Long reviewId,
            @RequestBody @Valid ReviewVisibilityUpdateRequest request) {
        adminService.updateReviewVisibility(reviewId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "시설 승인 대기 목록",
        description = "승인 대기 중인 시설 목록을 조회합니다."
    )
    @GetMapping("/facilities/pending")
    public ResponseEntity<Page<AdminFacilityResponse>> getPendingFacilities(Pageable pageable) {
        Page<AdminFacilityResponse> facilities = adminService.getPendingFacilities(pageable);
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "시설 승인/거부",
        description = "시설 등록을 승인하거나 거부합니다."
    )
    @PatchMapping("/facilities/{facilityId}/approval")
    public ResponseEntity<Void> updateFacilityApproval(
            @PathVariable Long facilityId,
            @RequestBody @Valid FacilityApprovalRequest request) {
        adminService.updateFacilityApproval(facilityId, request);
        return ResponseEntity.ok().build();
    }

    // ===============================
    // 시스템 통계
    // ===============================

    @Operation(
        summary = "전체 시스템 통계",
        description = "회원, 시설, 게시글, 리뷰 등 전체 통계를 조회합니다."
    )
    @GetMapping("/statistics/overview")
    public ResponseEntity<SystemOverviewStatistics> getSystemOverview() {
        SystemOverviewStatistics stats = adminService.getSystemOverviewStatistics();
        return ResponseEntity.ok(stats);
    }

    @Operation(
        summary = "회원 가입 통계",
        description = "기간별 회원 가입 통계를 조회합니다."
    )
    @GetMapping("/statistics/members")
    public ResponseEntity<List<MemberRegistrationStats>> getMemberStatistics(
            @Parameter(description = "시작일 (YYYY-MM-DD)") @RequestParam String startDate,
            @Parameter(description = "종료일 (YYYY-MM-DD)") @RequestParam String endDate,
            @Parameter(description = "집계 단위 (day/week/month)") @RequestParam(defaultValue = "day") String groupBy) {
        
        List<MemberRegistrationStats> stats = adminService.getMemberRegistrationStatistics(startDate, endDate, groupBy);
        return ResponseEntity.ok(stats);
    }

    @Operation(
        summary = "활동 통계",
        description = "게시글, 리뷰, 채팅 등 활동 통계를 조회합니다."
    )
    @GetMapping("/statistics/activity")
    public ResponseEntity<ActivityStatistics> getActivityStatistics(
            @Parameter(description = "시작일 (YYYY-MM-DD)") @RequestParam String startDate,
            @Parameter(description = "종료일 (YYYY-MM-DD)") @RequestParam String endDate) {
        
        ActivityStatistics stats = adminService.getActivityStatistics(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    // ===============================
    // 공지사항 관리
    // ===============================

    @Operation(
        summary = "공지사항 목록 조회",
        description = "관리자용 공지사항 전체 목록을 조회합니다."
    )
    @GetMapping("/notices")
    public ResponseEntity<Page<AdminNoticeResponse>> getNotices(Pageable pageable) {
        Page<AdminNoticeResponse> notices = adminService.getNotices(pageable);
        return ResponseEntity.ok(notices);
    }

    @Operation(
        summary = "공지사항 작성",
        description = "새 공지사항을 작성합니다."
    )
    @PostMapping("/notices")
    public ResponseEntity<AdminNoticeResponse> createNotice(@RequestBody @Valid NoticeCreateRequest request) {
        AdminNoticeResponse notice = adminService.createNotice(request);
        return ResponseEntity.ok(notice);
    }

    @Operation(
        summary = "공지사항 수정",
        description = "기존 공지사항을 수정합니다."
    )
    @PutMapping("/notices/{noticeId}")
    public ResponseEntity<AdminNoticeResponse> updateNotice(
            @PathVariable Long noticeId,
            @RequestBody @Valid NoticeUpdateRequest request) {
        AdminNoticeResponse notice = adminService.updateNotice(noticeId, request);
        return ResponseEntity.ok(notice);
    }

    @Operation(
        summary = "공지사항 삭제",
        description = "공지사항을 삭제합니다."
    )
    @DeleteMapping("/notices/{noticeId}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long noticeId) {
        adminService.deleteNotice(noticeId);
        return ResponseEntity.ok().build();
    }

    // ===============================
    // 시스템 관리
    // ===============================

    @Operation(
        summary = "시스템 상태 조회",
        description = "데이터베이스, Redis, 외부 API 연결 상태를 조회합니다."
    )
    @GetMapping("/system/health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth() {
        SystemHealthResponse health = adminService.getSystemHealth();
        return ResponseEntity.ok(health);
    }

    @Operation(
        summary = "캐시 관리",
        description = "Redis 캐시를 관리합니다."
    )
    @PostMapping("/system/cache")
    public ResponseEntity<Void> manageCache(@RequestBody @Valid CacheManagementRequest request) {
        adminService.manageCache(request);
        return ResponseEntity.ok().build();
    }
}