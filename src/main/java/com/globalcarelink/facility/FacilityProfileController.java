package com.globalcarelink.facility;

import com.globalcarelink.facility.dto.RecommendationRequest;
import com.globalcarelink.facility.dto.FacilityProfileCreateRequest;
import com.globalcarelink.facility.dto.FacilityProfileUpdateRequest;
import com.globalcarelink.facility.dto.FacilityProfileResponse;
import com.globalcarelink.facility.dto.FacilityRecommendation;
import com.globalcarelink.health.HealthAssessment;
import java.security.Principal;
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
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * 시설 프로필 API 컨트롤러
 * 시설 관리, 검색, 매칭 API 제공
 */
// @RestController
@RequestMapping("/api/facility-profiles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "시설 프로필", description = "요양시설 프로필 세부 관리 API")
public class FacilityProfileController {

    private final FacilityProfileService facilityProfileService;

    // ===== 기본 CRUD API =====

    @Operation(
        summary = "시설 프로필 생성",
        description = "새로운 요양시설 프로필을 생성합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "시설 프로필 생성 성공"),
        @ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 부족")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('FACILITY', 'ADMIN')")
    public ResponseEntity<FacilityProfile> createFacility(
        @Valid @RequestBody FacilityProfileCreateRequest request,
        Principal principal) {
        
        log.info("시설 프로필 생성 요청 - 시설명: {}", request.getFacilityName());
        
        String createdBy = principal != null ? principal.getName() : "system";
        FacilityProfileResponse created = facilityProfileService.createFacility(request, createdBy);
        
        // FacilityProfileResponse를 FacilityProfile로 변환하여 반환 (임시 처리)
        FacilityProfile facility = convertResponseToEntity(created);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(facility);
    }

    @Operation(
        summary = "시설 프로필 조회",
        description = "ID로 특정 시설 프로필을 조회합니다."
    )
    @GetMapping("/{facilityId}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<FacilityProfile> getFacility(
        @Parameter(description = "시설 ID", required = true)
        @PathVariable Long facilityId) {
        
        Optional<FacilityProfile> facility = facilityProfileService.getFacilityById(facilityId);
        
        return facility
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "시설 코드로 조회",
        description = "시설 코드로 특정 시설 프로필을 조회합니다."
    )
    @GetMapping("/code/{facilityCode}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<FacilityProfile> getFacilityByCode(
        @Parameter(description = "시설 코드", required = true)
        @PathVariable String facilityCode) {
        
        Optional<FacilityProfile> facility = facilityProfileService.getFacilityByCode(facilityCode);
        
        return facility
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }


    @Operation(
        summary = "시설 프로필 삭제",
        description = "특정 시설 프로필을 삭제합니다."
    )
    @DeleteMapping("/{facilityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFacility(
        @Parameter(description = "시설 ID", required = true)
        @PathVariable Long facilityId) {
        
        facilityProfileService.deleteFacility(facilityId);
        
        return ResponseEntity.noContent().build();
    }

    // ===== 검색 및 필터링 API =====

    @Operation(
        summary = "시설명으로 검색",
        description = "시설명 키워드로 시설을 검색합니다."
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> searchFacilitiesByName(
        @Parameter(description = "검색 키워드", required = true)
        @RequestParam String keyword) {
        
        List<FacilityProfile> facilities = facilityProfileService.searchFacilitiesByName(keyword);
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "지역별 시설 조회",
        description = "특정 지역의 시설을 조회합니다."
    )
    @GetMapping("/region/{region}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getFacilitiesByRegion(
        @Parameter(description = "지역명 (시/도)", required = true)
        @PathVariable String region) {
        
        List<FacilityProfile> facilities = facilityProfileService.getFacilitiesByRegion(region);
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "시설 타입별 조회",
        description = "특정 시설 타입의 시설을 조회합니다."
    )
    @GetMapping("/type/{facilityType}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getFacilitiesByType(
        @Parameter(description = "시설 타입", required = true)
        @PathVariable String facilityType) {
        
        List<FacilityProfile> facilities = facilityProfileService.getFacilitiesByType(facilityType);
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "시설 등급별 조회",
        description = "특정 시설 등급의 시설을 조회합니다."
    )
    @GetMapping("/grade/{facilityGrade}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getFacilitiesByGrade(
        @Parameter(description = "시설 등급 (A-E)", required = true)
        @PathVariable String facilityGrade) {
        
        List<FacilityProfile> facilities = facilityProfileService.getFacilitiesByGrade(facilityGrade);
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "입주 가능한 시설 조회",
        description = "현재 입주 가능한 시설을 조회합니다."
    )
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getAvailableFacilities() {
        
        List<FacilityProfile> facilities = facilityProfileService.getAvailableFacilities();
        
        return ResponseEntity.ok(facilities);
    }

    // ===== 위치 기반 검색 API =====

    @Operation(
        summary = "근처 시설 검색",
        description = "특정 위치 근처의 시설을 검색합니다."
    )
    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> findNearbyFacilities(
        @Parameter(description = "위도", required = true)
        @RequestParam BigDecimal latitude,
        @Parameter(description = "경도", required = true)
        @RequestParam BigDecimal longitude,
        @Parameter(description = "검색 반경 (km)", example = "10")
        @RequestParam(defaultValue = "10") double radiusKm) {
        
        List<FacilityProfile> facilities = facilityProfileService
            .findNearbyFacilities(latitude, longitude, radiusKm);
        
        return ResponseEntity.ok(facilities);
    }

    // ===== 케어 등급 기반 검색 API =====

    @Operation(
        summary = "케어 등급별 시설 조회",
        description = "특정 케어 등급을 수용 가능한 시설을 조회합니다."
    )
    @GetMapping("/care-grade/{careGrade}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getFacilitiesByCareGrade(
        @Parameter(description = "케어 등급 (1-6)", required = true)
        @PathVariable Integer careGrade) {
        
        List<FacilityProfile> facilities = facilityProfileService.getFacilitiesByCareGrade(careGrade);
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "복수 케어 등급별 시설 조회",
        description = "복수 케어 등급 중 하나라도 수용 가능한 시설을 조회합니다."
    )
    @PostMapping("/care-grades")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getFacilitiesByCareGrades(
        @RequestBody Set<Integer> careGrades) {
        
        List<FacilityProfile> facilities = facilityProfileService.getFacilitiesByCareGrades(careGrades);
        
        return ResponseEntity.ok(facilities);
    }

    // ===== 전문성 기반 검색 API =====

    @Operation(
        summary = "치매 전문 시설 조회",
        description = "치매 전문 케어가 가능한 시설을 조회합니다."
    )
    @GetMapping("/specialized/dementia")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getDementiaSpecializedFacilities() {
        
        List<FacilityProfile> facilities = facilityProfileService.getDementiaSpecializedFacilities();
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "의료 전문 시설 조회",
        description = "의료 전문 케어가 가능한 시설을 조회합니다."
    )
    @GetMapping("/specialized/medical")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getMedicalSpecializedFacilities() {
        
        List<FacilityProfile> facilities = facilityProfileService.getMedicalSpecializedFacilities();
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "재활 전문 시설 조회",
        description = "재활 전문 케어가 가능한 시설을 조회합니다."
    )
    @GetMapping("/specialized/rehabilitation")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getRehabilitationSpecializedFacilities() {
        
        List<FacilityProfile> facilities = facilityProfileService.getRehabilitationSpecializedFacilities();
        
        return ResponseEntity.ok(facilities);
    }

    @Operation(
        summary = "호스피스 전문 시설 조회",
        description = "호스피스 전문 케어가 가능한 시설을 조회합니다."
    )
    @GetMapping("/specialized/hospice")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getHospiceSpecializedFacilities() {
        
        List<FacilityProfile> facilities = facilityProfileService.getHospiceSpecializedFacilities();
        
        return ResponseEntity.ok(facilities);
    }

    // ===== 매칭 및 추천 API =====

    @Operation(
        summary = "건강 상태 기반 시설 추천",
        description = "환자의 건강 상태를 기반으로 적합한 시설을 추천합니다."
    )
    @PostMapping("/recommendations")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<FacilityRecommendation>> recommendFacilities(
        @Valid @RequestBody RecommendationRequest request) {
        
        log.info("시설 추천 요청 - 케어등급: {}, 지역: {}", 
                request.getHealthAssessment().getOverallCareGrade(),
                request.getPreference().getPreferredRegion());
        
        List<FacilityRecommendation> recommendations = 
            facilityProfileService.recommendFacilities(request.getHealthAssessment(), request.getPreference());
        
        return ResponseEntity.ok(recommendations);
    }

    @Operation(
        summary = "재외동포 맞춤 시설 조회",
        description = "재외동포에게 적합한 시설을 조회합니다."
    )
    @GetMapping("/overseas-korean-friendly")
    @PreAuthorize("hasAnyRole('USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<FacilityProfile>> getOverseasKoreanFriendlyFacilities() {
        
        List<FacilityProfile> facilities = facilityProfileService.getOverseasKoreanFriendlyFacilities();
        
        return ResponseEntity.ok(facilities);
    }

    // ===== 종합 검색 API =====

    @Operation(
        summary = "복합 조건 시설 검색",
        description = "여러 조건을 조합하여 시설을 검색합니다."
    )
    @PostMapping("/search-advanced")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Page<FacilityProfile>> searchFacilitiesWithFilters(
        @RequestBody FacilityProfileService.FacilitySearchCriteria criteria,
        @Parameter(description = "페이지 번호", example = "0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "페이지 크기", example = "20")
        @RequestParam(defaultValue = "20") int size,
        @Parameter(description = "정렬 기준", example = "facilityGrade")
        @RequestParam(defaultValue = "facilityGrade") String sortBy) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<FacilityProfile> facilities = facilityProfileService.searchFacilitiesWithFilters(criteria, pageable);
        
        return ResponseEntity.ok(facilities);
    }

    // ===== 통계 API =====

    @Operation(
        summary = "지역별 시설 통계",
        description = "지역별 시설 현황 통계를 조회합니다."
    )
    @GetMapping("/statistics/by-region")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> getFacilityStatisticsByRegion() {
        
        Map<String, Long> statistics = facilityProfileService.getFacilityStatisticsByRegion();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "시설 타입별 통계",
        description = "시설 타입별 현황 통계를 조회합니다."
    )
    @GetMapping("/statistics/by-type")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> getFacilityStatisticsByType() {
        
        Map<String, Long> statistics = facilityProfileService.getFacilityStatisticsByType();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "시설 등급별 통계",
        description = "시설 등급별 현황 통계를 조회합니다."
    )
    @GetMapping("/statistics/by-grade")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> getFacilityStatisticsByGrade() {
        
        Map<String, Long> statistics = facilityProfileService.getFacilityStatisticsByGrade();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "전체 시설 통계 요약",
        description = "전체 시설 현황 통계 요약을 조회합니다."
    )
    @GetMapping("/statistics/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityProfileService.FacilityStatisticsSummary> getFacilityStatisticsSummary() {
        
        FacilityProfileService.FacilityStatisticsSummary summary = 
            facilityProfileService.getFacilityStatisticsSummary();
        
        return ResponseEntity.ok(summary);
    }

    // ===== 유틸리티 API =====

    @Operation(
        summary = "캐시 무효화",
        description = "시설 관련 모든 캐시를 무효화합니다."
    )
    @PostMapping("/cache/evict")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> evictCaches() {
        
        facilityProfileService.evictAllCaches();
        
        return ResponseEntity.ok().build();
    }

    // ===== 유틸리티 메서드 =====
    
    /**
     * FacilityProfileResponse를 FacilityProfile로 변환 (임시 처리)
     * TODO: 컨트롤러의 반환 타입을 Response DTO로 통일하는 것이 바람직함
     */
    private FacilityProfile convertResponseToEntity(com.globalcarelink.facility.dto.FacilityProfileResponse response) {
        // 실제 프로젝트에서는 적절한 변환 로직이나 별도의 Mapper를 사용해야 함
        // 여기서는 임시로 기본 엔티티 생성
        FacilityProfile facility = new FacilityProfile();
        facility.setId(response.getId());
        facility.setFacilityName(response.getFacilityName());
        facility.setFacilityType(response.getFacilityType());
        facility.setFacilityGrade(response.getFacilityGrade());
        facility.setAddress(response.getAddress());
        facility.setRegion(response.getRegion());
        facility.setDistrict(response.getDistrict());
        facility.setLatitude(response.getLatitude());
        facility.setLongitude(response.getLongitude());
        facility.setTotalCapacity(response.getTotalCapacity());
        facility.setCurrentOccupancy(response.getCurrentOccupancy());
        facility.setAvailableBeds(response.getAvailableBeds());
        facility.setMonthlyBasicFee(response.getMonthlyBasicFee());
        facility.setMealCost(response.getMealCost());
        facility.setHasDoctor(response.getHasDoctor());
        facility.setHasNurse24h(response.getHasNurse24h());
        // createdAt, updatedAt은 JPA Auditing이 자동 관리
        return facility;
    }
    
    // ===== DTO 클래스들은 별도 패키지(com.globalcarelink.facility.dto)로 분리됨 =====
}