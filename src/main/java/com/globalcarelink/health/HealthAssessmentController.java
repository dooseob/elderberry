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
 */
@RestController
@RequestMapping("/api/health-assessments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "건강 상태 평가", description = "돌봄지수 체크 및 케어등급 산출 API")
public class HealthAssessmentController {

    private final HealthAssessmentService healthAssessmentService;

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
        summary = "회원별 최신 건강 평가 조회",
        description = "특정 회원의 가장 최근 건강 평가를 조회합니다."
    )
    @GetMapping("/member/{memberId}/latest")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<HealthAssessment> getLatestAssessment(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId) {
        
        Optional<HealthAssessment> assessment = healthAssessmentService.getLatestAssessmentByMemberId(memberId);
        
        return assessment
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "회원별 건강 평가 이력 조회",
        description = "특정 회원의 모든 건강 평가 이력을 최신순으로 조회합니다."
    )
    @GetMapping("/member/{memberId}/history")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getAssessmentHistory(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId) {
        
        List<HealthAssessment> assessments = healthAssessmentService.getAssessmentHistoryByMemberId(memberId);
        
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "회원별 건강 평가 페이징 조회",
        description = "특정 회원의 건강 평가를 페이징으로 조회합니다."
    )
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Page<HealthAssessment>> getAssessmentsByMemberId(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId,
        @Parameter(description = "페이지 번호 (0부터 시작)")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "페이지 크기")
        @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HealthAssessment> assessments = healthAssessmentService.getAssessmentsByMemberId(memberId, pageable);
        
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
        
        // 평가 조회
        // TODO: 실제로는 assessmentId로 조회해야 함
        HealthAssessment assessment = new HealthAssessment(); // 임시
        
        CareGradeCalculator.CareGradeResult result = healthAssessmentService.calculateCareGrade(assessment);
        
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
        
        log.info("건강 평가 삭제 요청 - ID: {}", assessmentId);
        
        healthAssessmentService.deleteAssessment(assessmentId);
        
        return ResponseEntity.noContent().build();
    }

    // ===== 특화 조회 API =====

    @Operation(
        summary = "호스피스 케어 대상자 조회",
        description = "호스피스 케어가 필요한 대상자들을 조회합니다."
    )
    @GetMapping("/hospice-care-targets")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getHospiceCareTargets() {
        List<HealthAssessment> assessments = healthAssessmentService.getHospiceCareTargets();
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "치매 전문 케어 대상자 조회",
        description = "치매 전문 케어가 필요한 대상자들을 조회합니다."
    )
    @GetMapping("/dementia-care-targets")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getDementiaCareTargets() {
        List<HealthAssessment> assessments = healthAssessmentService.getDementiaCareTargets();
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "중증 환자 조회",
        description = "중증 케어가 필요한 환자들을 조회합니다."
    )
    @GetMapping("/severe-care-targets")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getSevereCareTargets() {
        List<HealthAssessment> assessments = healthAssessmentService.getSevereCareTargets();
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "재외동포 건강 평가 조회",
        description = "재외동포 대상 건강 평가들을 조회합니다."
    )
    @GetMapping("/overseas-korean")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getOverseasKoreanAssessments() {
        List<HealthAssessment> assessments = healthAssessmentService.getOverseasKoreanAssessments();
        return ResponseEntity.ok(assessments);
    }

    @Operation(
        summary = "케어 등급 범위별 조회",
        description = "특정 케어 등급 범위의 평가들을 조회합니다."
    )
    @GetMapping("/care-grade-range")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<HealthAssessment>> getAssessmentsByCareGradeRange(
        @Parameter(description = "최소 등급")
        @RequestParam Integer minGrade,
        @Parameter(description = "최대 등급")
        @RequestParam Integer maxGrade) {
        
        List<HealthAssessment> assessments = healthAssessmentService.getAssessmentsByCareGradeRange(minGrade, maxGrade);
        return ResponseEntity.ok(assessments);
    }

    // ===== 통계 및 분석 API =====

    @Operation(
        summary = "건강 평가 통계 조회",
        description = "전체 건강 평가에 대한 통계 정보를 조회합니다."
    )
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<HealthAssessmentStatistics> getStatistics() {
        HealthAssessmentStatistics statistics = healthAssessmentService.getStatistics();
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "회원의 평가 개선 추이",
        description = "특정 회원의 건강 평가 점수 변화 추이를 분석합니다."
    )
    @GetMapping("/member/{memberId}/trend")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMemberAssessmentTrend(
        @Parameter(description = "회원 ID", required = true)
        @PathVariable String memberId) {
        
        List<Map<String, Object>> trend = healthAssessmentService.getMemberAssessmentTrend(memberId);
        return ResponseEntity.ok(trend);
    }

    // ===== 간편 조회 API =====

    @Operation(
        summary = "건강 평가 요약 조회",
        description = "건강 평가의 핵심 정보만 간단히 조회합니다."
    )
    @GetMapping("/{assessmentId}/summary")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<String> getAssessmentSummary(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId) {
        
        // TODO: 실제로는 assessmentId로 조회해야 함
        HealthAssessment assessment = new HealthAssessment(); // 임시
        
        String summary = assessment.generateAssessmentSummary();
        return ResponseEntity.ok(summary);
    }

    @Operation(
        summary = "평가 완성도 체크",
        description = "건강 평가의 완성도를 확인합니다."
    )
    @GetMapping("/{assessmentId}/completeness")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> checkAssessmentCompleteness(
        @Parameter(description = "평가 ID", required = true)
        @PathVariable Long assessmentId) {
        
        // TODO: 실제로는 assessmentId로 조회해야 함
        HealthAssessment assessment = new HealthAssessment(); // 임시
        
        Map<String, Object> completeness = Map.of(
            "isComplete", assessment.isComplete(),
            "completionPercentage", assessment.isComplete() ? 100 : 75, // 임시 계산
            "missingFields", assessment.isComplete() ? List.of() : List.of("ltciGrade", "diseaseTypes"),
            "careType", assessment.getSpecializedCareType(),
            "estimatedCost", assessment.getEstimatedMonthlyCostRange()
        );
        
        return ResponseEntity.ok(completeness);
    }
}