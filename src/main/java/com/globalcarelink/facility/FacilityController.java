package com.globalcarelink.facility;

import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * 시설 관리 컨트롤러 (매칭 및 분석 기능 포함)
 * 시설 CRUD, 매칭 추천, 사용자 행동 추적, 성과 분석 API 제공
 */
@Tag(name = "시설 관리", description = "시설 정보 관리 및 매칭 서비스 API")
@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@Slf4j
public class FacilityController {

    private final FacilityProfileService facilityProfileService;
    private final FacilityMatchingAnalyticsService analyticsService;
    private final HealthAssessmentRepository healthAssessmentRepository;

    // ===== 기본 시설 관리 API =====

    @Operation(summary = "시설 목록 조회", description = "등록된 모든 시설의 목록을 페이징하여 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<FacilityProfileResponse>> getAllFacilities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String facilityType,
            @RequestParam(required = false) String facilityGrade,
            @RequestParam(required = false) String region) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<FacilityProfileResponse> facilities = facilityProfileService.findAllFacilities(
                pageable, facilityType, facilityGrade, region);
        
        log.info("시설 목록 조회 완료 - 페이지: {}, 크기: {}, 총 개수: {}", page, size, facilities.getTotalElements());
        return ResponseEntity.ok(facilities);
    }

    @Operation(summary = "시설 상세 조회", description = "특정 시설의 상세 정보를 조회합니다.")
    @GetMapping("/{facilityId}")
    public ResponseEntity<FacilityProfileResponse> getFacilityById(@PathVariable Long facilityId,
                                                                  Authentication authentication) {
        
        FacilityProfileResponse facility = facilityProfileService.findById(facilityId);
        
        // 사용자 행동 추적 - 시설 조회
        if (authentication != null) {
            String userId = authentication.getName();
            facilityProfileService.trackFacilityView(userId, facilityId);
        }
        
        log.info("시설 상세 조회 완료 - 시설 ID: {}", facilityId);
        return ResponseEntity.ok(facility);
    }

    @Operation(summary = "시설 등록", description = "새로운 시설을 등록합니다.")
    @PostMapping
    public ResponseEntity<FacilityProfileResponse> createFacility(
            @Valid @RequestBody FacilityProfileCreateRequest request,
            Authentication authentication) {
        
        String createdBy = authentication != null ? authentication.getName() : "system";
        FacilityProfileResponse facility = facilityProfileService.createFacility(request, createdBy);
        
        log.info("시설 등록 완료 - 시설명: {}, 등록자: {}", facility.getFacilityName(), createdBy);
        return ResponseEntity.ok(facility);
    }

    @Operation(summary = "시설 정보 수정", description = "기존 시설의 정보를 수정합니다.")
    @PutMapping("/{facilityId}")
    public ResponseEntity<FacilityProfileResponse> updateFacility(
            @PathVariable Long facilityId,
            @Valid @RequestBody FacilityProfileUpdateRequest request,
            Authentication authentication) {
        
        String updatedBy = authentication != null ? authentication.getName() : "system";
        FacilityProfileResponse facility = facilityProfileService.updateFacility(facilityId, request, updatedBy);
        
        log.info("시설 정보 수정 완료 - 시설 ID: {}, 수정자: {}", facilityId, updatedBy);
        return ResponseEntity.ok(facility);
    }

    // ===== 매칭 및 추천 API =====

    @Operation(summary = "맞춤형 시설 추천", description = "사용자의 건강 상태와 선호도를 기반으로 최적의 시설을 추천합니다.")
    @PostMapping("/recommendations")
    public ResponseEntity<List<FacilityRecommendation>> getRecommendations(
            @Valid @RequestBody FacilityMatchingRequest request,
            Authentication authentication) {
        
        String userId = authentication != null ? authentication.getName() : "anonymous";
        
        // 건강 평가 정보 조회
        Optional<HealthAssessment> assessmentOpt = healthAssessmentRepository.findByMemberId(request.getMemberId());
        if (assessmentOpt.isEmpty()) {
            log.warn("건강 평가 정보를 찾을 수 없습니다 - 회원 ID: {}", request.getMemberId());
            return ResponseEntity.badRequest().build();
        }

        HealthAssessment assessment = assessmentOpt.get();
        
        // 시설 추천 생성
        List<FacilityRecommendation> recommendations = facilityProfileService.recommendFacilities(
                assessment, request.getPreference(), request.getMaxResults());
        
        // 학습 기반 점수 조정 적용
        recommendations = facilityProfileService.adjustMatchingScoresWithLearning(recommendations, userId);
        
        // 매칭 이력 저장
        facilityProfileService.recordMatchingRecommendations(
                userId, request.getCoordinatorId(), recommendations, assessment, request.getPreference());
        
        log.info("시설 추천 완료 - 사용자: {}, 추천 수: {}", userId, recommendations.size());
        return ResponseEntity.ok(recommendations);
    }

    @Operation(summary = "지역별 시설 검색", description = "특정 지역의 시설을 검색합니다.")
    @GetMapping("/search/region")
    public ResponseEntity<List<FacilityProfileResponse>> searchFacilitiesByRegion(
            @RequestParam String region,
            @RequestParam(required = false) String facilityType,
            @RequestParam(required = false) Integer careGradeLevel,
            @RequestParam(defaultValue = "20") int limit) {
        
        List<FacilityProfileResponse> facilities = facilityProfileService.findFacilitiesByRegion(
                region, facilityType, careGradeLevel, limit);
        
        log.info("지역별 시설 검색 완료 - 지역: {}, 결과 수: {}", region, facilities.size());
        return ResponseEntity.ok(facilities);
    }

    @Operation(summary = "케어 등급별 시설 검색", description = "특정 케어 등급에 적합한 시설을 검색합니다.")
    @GetMapping("/search/care-grade")
    public ResponseEntity<List<FacilityProfileResponse>> searchFacilitiesByCareGrade(
            @RequestParam Integer careGradeLevel,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "20") int limit) {
        
        List<FacilityProfileResponse> facilities = facilityProfileService.findFacilitiesByCareGrade(
                careGradeLevel, region, limit);
        
        log.info("케어 등급별 시설 검색 완료 - 케어 등급: {}, 결과 수: {}", careGradeLevel, facilities.size());
        return ResponseEntity.ok(facilities);
    }

    // ===== 사용자 행동 추적 API =====

    @Operation(summary = "시설 연락 추적", description = "사용자가 시설에 연락한 행동을 추적합니다.")
    @PostMapping("/{facilityId}/contact")
    public ResponseEntity<Void> trackFacilityContact(@PathVariable Long facilityId,
                                                    Authentication authentication) {
        
        if (authentication != null) {
            String userId = authentication.getName();
            facilityProfileService.trackFacilityContact(userId, facilityId);
            log.info("시설 연락 추적 완료 - 사용자: {}, 시설 ID: {}", userId, facilityId);
        }
        
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "시설 방문 추적", description = "사용자가 시설을 방문한 행동을 추적합니다.")
    @PostMapping("/{facilityId}/visit")
    public ResponseEntity<Void> trackFacilityVisit(@PathVariable Long facilityId,
                                                  Authentication authentication) {
        
        if (authentication != null) {
            String userId = authentication.getName();
            facilityProfileService.trackFacilityVisit(userId, facilityId);
            log.info("시설 방문 추적 완료 - 사용자: {}, 시설 ID: {}", userId, facilityId);
        }
        
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "매칭 완료 처리", description = "사용자가 시설을 선택하여 매칭이 완료된 것을 처리합니다.")
    @PostMapping("/{facilityId}/complete-matching")
    public ResponseEntity<Void> completeMatching(@PathVariable Long facilityId,
                                                @Valid @RequestBody MatchingCompletionRequest request,
                                                Authentication authentication) {
        
        if (authentication != null) {
            String userId = authentication.getName();
            facilityProfileService.completeMatching(
                    userId, facilityId, request.getOutcome(), 
                    request.getActualCost(), request.getSatisfactionScore(), request.getFeedback());
            
            log.info("매칭 완료 처리 - 사용자: {}, 시설 ID: {}, 결과: {}", 
                    userId, facilityId, request.getOutcome());
        }
        
        return ResponseEntity.ok().build();
    }

    // ===== 분석 및 통계 API =====

    @Operation(summary = "시설 성과 분석", description = "시설별 매칭 성과를 분석합니다.")
    @GetMapping("/analytics/performance")
    public ResponseEntity<List<FacilityMatchingAnalyticsService.FacilityPerformanceReport>> getFacilityPerformance(
            @RequestParam(defaultValue = "30") int days) {
        
        List<FacilityMatchingAnalyticsService.FacilityPerformanceReport> performance = 
                analyticsService.analyzeFacilityPerformance(days);
        
        log.info("시설 성과 분석 완료 - 분석 기간: {}일, 시설 수: {}", days, performance.size());
        return ResponseEntity.ok(performance);
    }

    @Operation(summary = "매칭 트렌드 분석", description = "시설 매칭의 트렌드를 분석합니다.")
    @GetMapping("/analytics/trends")
    public ResponseEntity<FacilityMatchingAnalyticsService.MatchingTrendReport> getMatchingTrends(
            @RequestParam(defaultValue = "90") int days) {
        
        FacilityMatchingAnalyticsService.MatchingTrendReport trends = 
                analyticsService.analyzeMatchingTrends(days);
        
        log.info("매칭 트렌드 분석 완료 - 분석 기간: {}일", days);
        return ResponseEntity.ok(trends);
    }

    @Operation(summary = "사용자별 매칭 이력", description = "특정 사용자의 매칭 이력을 조회합니다.")
    @GetMapping("/matching-history")
    public ResponseEntity<List<FacilityMatchingAnalyticsService.UserMatchingHistory>> getUserMatchingHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (authentication == null) {
            return ResponseEntity.unauthorized().build();
        }
        
        String userId = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        List<FacilityMatchingAnalyticsService.UserMatchingHistory> history = 
                analyticsService.getUserMatchingHistory(userId, pageable);
        
        log.info("사용자 매칭 이력 조회 완료 - 사용자: {}, 이력 수: {}", userId, history.size());
        return ResponseEntity.ok(history);
    }

    @Operation(summary = "추천 정확도 분석", description = "시설 추천 시스템의 정확도를 분석합니다.")
    @GetMapping("/analytics/recommendation-accuracy")
    public ResponseEntity<FacilityMatchingAnalyticsService.RecommendationAccuracyReport> getRecommendationAccuracy(
            @RequestParam(defaultValue = "30") int days) {
        
        FacilityMatchingAnalyticsService.RecommendationAccuracyReport accuracy = 
                analyticsService.analyzeRecommendationAccuracy(days);
        
        log.info("추천 정확도 분석 완료 - 분석 기간: {}일, 정확도: {:.2f}%", 
                days, accuracy.getOverallAccuracy());
        return ResponseEntity.ok(accuracy);
    }

    // ===== 관리자 전용 API =====

    @Operation(summary = "시설 등급 업데이트", description = "관리자가 시설의 등급을 업데이트합니다.")
    @PutMapping("/{facilityId}/grade")
    public ResponseEntity<Void> updateFacilityGrade(@PathVariable Long facilityId,
                                                   @RequestParam String newGrade,
                                                   @RequestParam(required = false) String reason,
                                                   Authentication authentication) {
        
        String updatedBy = authentication != null ? authentication.getName() : "system";
        facilityProfileService.updateFacilityGrade(facilityId, newGrade, reason, updatedBy);
        
        log.info("시설 등급 업데이트 완료 - 시설 ID: {}, 새 등급: {}, 업데이트자: {}", 
                facilityId, newGrade, updatedBy);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "시설 통계 요약", description = "전체 시설의 통계 요약 정보를 조회합니다.")
    @GetMapping("/statistics/summary")
    public ResponseEntity<FacilityProfileService.FacilityStatistics> getFacilityStatistics() {
        
        FacilityProfileService.FacilityStatistics statistics = facilityProfileService.getFacilityStatistics();
        
        log.info("시설 통계 요약 조회 완료 - 총 시설 수: {}", statistics.getTotalFacilities());
        return ResponseEntity.ok(statistics);
    }
} 