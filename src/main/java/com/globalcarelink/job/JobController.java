package com.globalcarelink.job;

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
 * 구인구직 관리 컨트롤러
 */
@Tag(name = "구인구직 관리", description = "구인구직 관련 API")
@Slf4j
@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
public class JobController {

    @Operation(
        summary = "내 지원 목록 조회",
        description = "현재 로그인한 사용자의 지원 목록을 조회합니다."
    )
    @GetMapping("/my")
    public ResponseEntity<Page<Map<String, Object>>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        log.info("내 지원 목록 조회 요청: user={}, page={}, size={}", authentication.getName(), page, size);
        
        // 임시 더미 데이터 생성
        Map<String, Object> app1 = new HashMap<>();
        app1.put("id", 1L);
        app1.put("facilityName", "서울요양원");
        app1.put("jobTitle", "간병인 모집");
        app1.put("status", "UNDER_REVIEW");
        app1.put("statusText", "검토중");
        app1.put("salary", "월 280만원");
        app1.put("location", "서울시 강남구");
        
        Map<String, Object> app2 = new HashMap<>();
        app2.put("id", 2L);
        app2.put("facilityName", "부산실버케어");
        app2.put("jobTitle", "요양보호사 모집");
        app2.put("status", "INTERVIEW_SCHEDULED");
        app2.put("statusText", "면접예정");
        app2.put("salary", "월 260만원");
        app2.put("location", "부산시 해운대구");
        
        List<Map<String, Object>> applications = List.of(app1, app2);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> applicationPage = new PageImpl<>(applications, pageable, applications.size());
        
        return ResponseEntity.ok(applicationPage);
    }

    @Operation(
        summary = "구인 공고 목록 조회",
        description = "등록된 구인 공고 목록을 조회합니다."
    )
    @GetMapping("/jobs")
    public ResponseEntity<Page<Map<String, Object>>> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String position) {
        
        log.info("구인 공고 목록 조회 요청: page={}, size={}, region={}, position={}", page, size, region, position);
        
        // 임시 더미 데이터 생성  
        Map<String, Object> job1 = new HashMap<>();
        job1.put("id", 1L);
        job1.put("facilityName", "서울요양원");
        job1.put("title", "경력직 간병인 모집");
        job1.put("salary", "월 280-320만원");
        job1.put("location", "서울시 강남구");
        job1.put("isUrgent", false);
        
        Map<String, Object> job2 = new HashMap<>();
        job2.put("id", 2L);
        job2.put("facilityName", "부산실버케어");
        job2.put("title", "요양보호사 정규직 모집");
        job2.put("salary", "월 250-280만원");
        job2.put("location", "부산시 해운대구");
        job2.put("isUrgent", true);
        
        List<Map<String, Object>> jobs = List.of(job1, job2);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> jobPage = new PageImpl<>(jobs, pageable, jobs.size());
        
        return ResponseEntity.ok(jobPage);
    }

    @Operation(
        summary = "구인 공고 지원",
        description = "특정 구인 공고에 지원합니다."
    )
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<Map<String, Object>> applyForJob(
            @PathVariable Long jobId,
            @RequestBody Map<String, Object> applicationRequest,
            Authentication authentication) {
        
        log.info("구인 공고 지원 요청: user={}, jobId={}", authentication.getName(), jobId);
        
        // 임시 응답 데이터
        Map<String, Object> response = Map.of(
            "applicationId", System.currentTimeMillis(),
            "jobId", jobId,
            "message", "지원이 성공적으로 접수되었습니다.",
            "status", "SUCCESS",
            "applicationDate", LocalDateTime.now()
        );
        
        return ResponseEntity.ok(response);
    }
}