package com.globalcarelink.health;

import com.globalcarelink.health.dto.HealthAssessmentCreateRequest;
import com.globalcarelink.health.dto.HealthAssessmentStatistics;
import com.globalcarelink.health.dto.HealthAssessmentUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 건강 상태 평가 API 컨트롤러
 * KB라이프생명 기반 돌봄지수 체크 시스템
 * 분리된 서비스 계층 사용 (SRP 원칙 적용)
 */
@RestController
@RequestMapping("/api/health-assessments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "건강 상태 평가", description = "돌봄지수 체크 및 케어등급 산출 API")
public class HealthAssessmentController {

    private final HealthAssessmentService healthAssessmentService;
    private final HealthAssessmentQueryService queryService;
    private final HealthAssessmentStatsService statsService;

    @Operation(
        summary = "건강 평가 생성",
        description = "새로운 건강 상태 평가를 생성하고 케어 등급을 자동 계산합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "건강 평가 생성 성공"),
        @ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<HealthAssessment> createAssessment(
        @Valid @RequestBody HealthAssessmentCreateRequest request) {
        
        log.info("건강 평가 생성 요청 - 회원: {}", request.getMemberId());
        
        HealthAssessment assessment = healthAssessmentService.createAssessment(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(assessment);
    }

    @Operation(
        summary = "건강 평가 조회",
        description = "ID로 특정 건강 평가를 조회합니다."
    )
    @GetMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<HealthAssessment> getAssessment(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId) {
        
        Optional<HealthAssessment> assessment = healthAssessmentService.getAssessmentById(assessmentId);
        
        return assessment
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "회원별 최신 건강 평가 조회",
        description = "특정 회원의 가장 최근 건강 평가를 조회합니다."
    )
    @GetMapping("/member/{memberId}/latest")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<HealthAssessment> getLatestAssessment(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId) {
        
        Optional<HealthAssessment> assessment = healthAssessmentService.getLatestAssessmentByMember(memberId);
        
        return assessment
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "회원별 건강 평가 이력 조회",
        description = "특정 회원의 모든 건강 평가 이력을 조회합니다."
    )
    @GetMapping("/member/{memberId}/history")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getAssessmentHistory(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId) {
        
        List<HealthAssessment> assessments = queryService.getAssessmentHistoryByMemberId(memberId);
        
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "회원별 건강 평가 페이징 조회",
        description = "특정 회원의 건강 평가를 페이징으로 조회합니다."
    )
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Page<HealthAssessment>> getAssessmentsByMember(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId,
        @Parameter(description = "페이지 번호", example = "0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "페이지 크기", example = "20")
        @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HealthAssessment> assessments = queryService.getAssessmentsByMemberId(memberId, pageable);
        
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "건강 평가 수정",
        description = "기존 건강 평가 정보를 수정하고 케어 등급을 재계산합니다."
    )
    @PutMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<HealthAssessment> updateAssessment(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId,
        @Valid @RequestBody HealthAssessmentUpdateRequest request) {
        
        log.info("건강 평가 수정 요청 - ID: {}", assessmentId);
        
        HealthAssessment updated = healthAssessmentService.updateAssessment(assessmentId, request);
        
        return ResponseEntity.ok(updated);
    }

    @Operation(
        summary = "케어 등급 계산",
        description = "기존 건강 평가의 케어 등급을 재계산합니다."
    )
    @PostMapping("/{assessmentId}/calculate")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<CareGradeCalculator.CareGradeResult> calculateCareGrade(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId) {
        
        Optional<HealthAssessment> assessment = healthAssessmentService.getAssessmentById(assessmentId);
        
        if (assessment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        CareGradeCalculator.CareGradeResult result = healthAssessmentService.calculateCareGrade(assessment.get());
        
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "건강 평가 삭제",
        description = "특정 건강 평가를 삭제합니다."
    )
    @DeleteMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> deleteAssessment(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId) {
        
        healthAssessmentService.deleteAssessment(assessmentId);
        
        return ResponseEntity.noContent().build();
    }

    // ===== 조회 전담 서비스 사용 엔드포인트 =====

    @Operation(
        summary = "케어 등급별 평가 조회",
        description = "특정 케어 등급 범위의 평가를 조회합니다."
    )
    @GetMapping("/care-grade")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getAssessmentsByCareGrade(
        @Parameter(description = "최소 케어 등급", example = "1")
        @RequestParam Integer minGrade,
        @Parameter(description = "최대 케어 등급", example = "3")
        @RequestParam Integer maxGrade) {
        
        List<HealthAssessment> assessments = queryService.getAssessmentsByCareGradeRange(minGrade, maxGrade);
        
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "호스피스 케어 대상자 조회",
        description = "호스피스 케어가 필요한 대상자를 조회합니다."
    )
    @GetMapping("/hospice-targets")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getHospiceCareTargets() {
        
        List<HealthAssessment> targets = queryService.getHospiceCareTargets();
        
        return ResponseEntity.ok(targets);
    }

    @Operation(
        summary = "치매 전문 케어 대상자 조회",
        description = "치매 전문 케어가 필요한 대상자를 조회합니다."
    )
    @GetMapping("/dementia-targets")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getDementiaCareTargets() {
        
        List<HealthAssessment> targets = queryService.getDementiaCareTargets();
        
        return ResponseEntity.ok(targets);
    }

    @Operation(
        summary = "중증 환자 조회",
        description = "중증 케어가 필요한 환자를 조회합니다."
    )
    @GetMapping("/severe-targets")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getSevereCareTargets() {
        
        List<HealthAssessment> targets = queryService.getSevereCareTargets();
        
        return ResponseEntity.ok(targets);
    }

    @Operation(
        summary = "재외동포 대상 평가 조회",
        description = "재외동포 대상 건강 평가를 조회합니다."
    )
    @GetMapping("/overseas-korean")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getOverseasKoreanAssessments() {
        
        List<HealthAssessment> assessments = queryService.getOverseasKoreanAssessments();
        
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "회원 평가 추이 분석",
        description = "특정 회원의 건강 평가 개선 추이를 분석합니다."
    )
    @GetMapping("/member/{memberId}/trend")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMemberAssessmentTrend(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId) {
        
        List<Map<String, Object>> trend = queryService.getMemberAssessmentTrend(memberId);
        
        return ResponseEntity.ok(trend);
    }

    // ===== 통계 전담 서비스 사용 엔드포인트 =====

    @Operation(
        summary = "건강 평가 종합 통계",
        description = "건강 평가 시스템의 종합 통계를 조회합니다."
    )
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HealthAssessmentStatistics> getStatistics() {
        
        HealthAssessmentStatistics statistics = statsService.getComprehensiveStatistics();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "특수 케어 대상자 통계",
        description = "호스피스, 치매, 중증 등 특수 케어 대상자 통계를 조회합니다."
    )
    @GetMapping("/statistics/special-care")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getSpecialCareStatistics() {
        
        Map<String, Long> statistics = statsService.getSpecialCareTargetStatistics();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "최근 기간별 통계",
        description = "일별, 주별, 월별 최근 평가 통계를 조회합니다."
    )
    @GetMapping("/statistics/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getRecentStatistics() {
        
        Map<String, Long> statistics = statsService.getRecentAssessmentStatistics();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "질환별 통계",
        description = "주요 질환별 평가 통계를 조회합니다."
    )
    @GetMapping("/statistics/diseases")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getDiseaseStatistics() {
        
        Map<String, Long> statistics = statsService.getDiseaseTypeStatistics();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "평가 완성도 통계",
        description = "건강 평가의 완성도 관련 통계를 조회합니다."
    )
    @GetMapping("/statistics/completion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCompletionStatistics() {
        
        Map<String, Object> statistics = statsService.getCompletionStatistics();
        
        return ResponseEntity.ok(statistics);
    }

    // ===== 유틸리티 엔드포인트 =====

    @Operation(
        summary = "평가 존재 여부 확인",
        description = "특정 ID의 건강 평가가 존재하는지 확인합니다."
    )
    @GetMapping("/{assessmentId}/exists")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Boolean> checkAssessmentExists(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId) {
        
        boolean exists = healthAssessmentService.existsById(assessmentId);
        
        return ResponseEntity.ok(exists);
    }

    @Operation(
        summary = "평가 완성도 확인",
        description = "특정 건강 평가가 완성되었는지 확인합니다."
    )
    @GetMapping("/{assessmentId}/complete")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Boolean> checkAssessmentComplete(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId) {
        
        boolean isComplete = healthAssessmentService.isAssessmentComplete(assessmentId);
        
        return ResponseEntity.ok(isComplete);
    }

    @Operation(
        summary = "캐시 무효화",
        description = "건강 평가 관련 모든 캐시를 무효화합니다."
    )
    @PostMapping("/cache/evict")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> evictCaches() {
        
        healthAssessmentService.evictAllCaches();
        
        return ResponseEntity.ok().build();
    }
}