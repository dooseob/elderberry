package com.globalcarelink.review;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 리뷰 관리 컨트롤러
 */
@Tag(name = "리뷰 관리", description = "시설 리뷰 관련 API")
@Slf4j
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    @Operation(
        summary = "내 리뷰 목록 조회",
        description = "현재 로그인한 사용자가 작성한 리뷰 목록을 조회합니다."
    )
    @GetMapping("/my")
    public ResponseEntity<Page<Map<String, Object>>> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        log.info("내 리뷰 목록 조회 요청: user={}, page={}, size={}", authentication.getName(), page, size);
        
        // 임시 더미 데이터 생성
        Map<String, Object> review1 = new HashMap<>();
        review1.put("id", 1L);
        review1.put("facilityId", 1L);
        review1.put("facilityName", "서울요양원");
        review1.put("title", "서울요양원 이용 후기");
        review1.put("content", "시설이 깨끗하고 직원분들이 친절하십니다. 아버지께서 만족해하시네요.");
        review1.put("overallRating", 4.5);
        review1.put("status", "ACTIVE");
        review1.put("anonymous", false);
        review1.put("helpfulCount", 12);
        review1.put("notHelpfulCount", 1);
        review1.put("createdAt", LocalDateTime.now().minusDays(2));
        review1.put("updatedAt", LocalDateTime.now().minusDays(2));
        
        Map<String, Object> review2 = new HashMap<>();
        review2.put("id", 2L);
        review2.put("facilityId", 2L);
        review2.put("facilityName", "부산실버케어");
        review2.put("title", "부산실버케어 주간보호 후기");
        review2.put("content", "주간보호 서비스가 정말 좋습니다. 프로그램도 다양하고요.");
        review2.put("overallRating", 4.8);
        review2.put("status", "ACTIVE");
        review2.put("anonymous", false);
        review2.put("helpfulCount", 15);
        review2.put("notHelpfulCount", 0);
        review2.put("createdAt", LocalDateTime.now().minusDays(5));
        review2.put("updatedAt", LocalDateTime.now().minusDays(5));
        
        List<Map<String, Object>> reviews = List.of(review1, review2);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> reviewPage = new PageImpl<>(reviews, pageable, reviews.size());
        
        return ResponseEntity.ok(reviewPage);
    }

    @Operation(
        summary = "시설 리뷰 목록 조회",
        description = "특정 시설의 리뷰 목록을 조회합니다."
    )
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<Page<Map<String, Object>>> getFacilityReviews(
            @PathVariable Long facilityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("시설 리뷰 목록 조회 요청: facilityId={}, page={}, size={}", facilityId, page, size);
        
        // 임시 더미 데이터 생성
        List<Map<String, Object>> reviews = List.of(
            Map.of(
                "id", 1L,
                "reviewerName", "김**",
                "title", "만족스러운 서비스",
                "content", "직원분들이 매우 친절하고 시설도 깨끗합니다.",
                "overallRating", 4.5,
                "anonymous", true,
                "helpfulCount", 8,
                "createdAt", LocalDateTime.now().minusDays(1)
            ),
            Map.of(
                "id", 2L,
                "reviewerName", "이**",
                "title", "추천합니다",
                "content", "부모님께서 매우 만족해하십니다. 전문적인 케어가 인상적이에요.",
                "overallRating", 5.0,
                "anonymous", true,
                "helpfulCount", 12,
                "createdAt", LocalDateTime.now().minusDays(3)
            )
        );
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> reviewPage = new PageImpl<>(reviews, pageable, reviews.size());
        
        return ResponseEntity.ok(reviewPage);
    }

    @Operation(
        summary = "리뷰 작성",
        description = "시설에 대한 리뷰를 작성합니다."
    )
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(
            @RequestBody Map<String, Object> reviewRequest,
            Authentication authentication) {
        
        log.info("리뷰 작성 요청: user={}, facilityId={}", authentication.getName(), reviewRequest.get("facilityId"));
        
        // 임시 응답 데이터
        Map<String, Object> response = Map.of(
            "id", System.currentTimeMillis(),
            "message", "리뷰가 성공적으로 등록되었습니다.",
            "status", "SUCCESS"
        );
        
        return ResponseEntity.ok(response);
    }
}