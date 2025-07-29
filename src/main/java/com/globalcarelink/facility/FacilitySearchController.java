package com.globalcarelink.facility;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 시설 검색 및 상세보기 컨트롤러
 * - 다양한 검색 조건으로 시설 찾기
 * - 지도 기반 시설 검색
 * - 시설 상세 정보 및 리뷰
 * - 시설 비교 기능
 */
@Tag(name = "시설 검색", description = "시설 찾기 및 상세보기 API")
@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@Slf4j
public class FacilitySearchController {

    @Operation(
        summary = "시설 통합 검색",
        description = "다양한 조건으로 시설을 검색합니다. 지역, 시설유형, 가격대, 등급 등 다중 필터 지원"
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> searchFacilities(
            @Parameter(description = "검색 키워드 (시설명, 주소 등)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "지역 (서울특별시, 부산광역시 등)")
            @RequestParam(required = false) String region,
            @Parameter(description = "구/군 (강남구, 해운대구 등)")
            @RequestParam(required = false) String district,
            @Parameter(description = "시설 유형 (노인요양시설, 주야간보호시설 등)")
            @RequestParam(required = false) String facilityType,
            @Parameter(description = "최소 등급 (A, B, C)")
            @RequestParam(required = false) String minGrade,
            @Parameter(description = "최대 월 비용 (만원)")
            @RequestParam(required = false) Integer maxMonthlyCost,
            @Parameter(description = "가용 침상이 있는 시설만")
            @RequestParam(defaultValue = "false") boolean availableBedsOnly,
            @Parameter(description = "전문 케어 유형 (치매, 재활, 호스피스)")
            @RequestParam(required = false) String specializedCare,
            @Parameter(description = "거리 기준 정렬 (위도)")
            @RequestParam(required = false) Double latitude,
            @Parameter(description = "거리 기준 정렬 (경도)")
            @RequestParam(required = false) Double longitude,
            @Parameter(description = "검색 반경 (km)")
            @RequestParam(defaultValue = "10") int radiusKm,
            @Parameter(description = "정렬 기준 (distance, grade, price, rating)")
            @RequestParam(defaultValue = "grade") String sortBy,
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "한 페이지 결과 수")
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("시설 통합 검색 - 키워드: {}, 지역: {}, 유형: {}, 정렬: {}", keyword, region, facilityType, sortBy);

        // 고급 검색 로직 (임시 더미 데이터)
        List<Map<String, Object>> facilities = createAdvancedSearchResults(
            keyword, region, district, facilityType, minGrade, maxMonthlyCost, 
            availableBedsOnly, specializedCare, latitude, longitude, radiusKm, sortBy);

        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> facilityPage = new PageImpl<>(facilities, pageable, facilities.size());

        log.info("시설 통합 검색 완료 - 총 {}건", facilities.size());
        return ResponseEntity.ok(facilityPage);
    }

    @Operation(
        summary = "지도 기반 시설 검색",
        description = "지도 영역 내의 시설을 검색하고 위치 정보와 함께 반환합니다."
    )
    @GetMapping("/search/map")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> searchFacilitiesOnMap(
            @Parameter(description = "북동쪽 위도", required = true)
            @RequestParam double neLat,
            @Parameter(description = "북동쪽 경도", required = true)
            @RequestParam double neLng,
            @Parameter(description = "남서쪽 위도", required = true)
            @RequestParam double swLat,
            @Parameter(description = "남서쪽 경도", required = true)
            @RequestParam double swLng,
            @Parameter(description = "시설 유형")
            @RequestParam(required = false) String facilityType,
            @Parameter(description = "최소 등급")
            @RequestParam(required = false) String minGrade,
            @Parameter(description = "가용 침상만")
            @RequestParam(defaultValue = "false") boolean availableBedsOnly) {
        
        log.info("지도 기반 시설 검색 - 영역: ({},{}) ~ ({},{})", neLat, neLng, swLat, swLng);

        // 지도 영역 내 시설 검색 (임시 더미 데이터)
        List<Map<String, Object>> mapFacilities = createMapSearchResults(
            neLat, neLng, swLat, swLng, facilityType, minGrade, availableBedsOnly);

        Map<String, Object> mapResponse = new HashMap<>();
        mapResponse.put("totalCount", mapFacilities.size());
        mapResponse.put("boundingBox", Map.of(
            "northeast", Map.of("lat", neLat, "lng", neLng),
            "southwest", Map.of("lat", swLat, "lng", swLng)
        ));
        mapResponse.put("facilities", mapFacilities);
        mapResponse.put("clusters", createFacilityClusters(mapFacilities)); // 지도 클러스터링

        log.info("지도 기반 시설 검색 완료 - {}건", mapFacilities.size());
        return ResponseEntity.ok(mapResponse);
    }

    @Operation(
        summary = "시설 상세 정보 조회",
        description = "특정 시설의 상세 정보, 리뷰, 가격 정보, 주변 시설 등을 종합적으로 제공합니다."
    )
    @GetMapping("/{facilityId}/detail")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getFacilityDetail(
            @Parameter(description = "시설 ID", required = true)
            @PathVariable Long facilityId,
            Authentication authentication) {
        
        log.info("시설 상세 정보 조회 - ID: {}, 사용자: {}", facilityId, authentication.getName());

        // 종합적인 시설 상세 정보 (임시 더미 데이터)
        Map<String, Object> facilityDetail = createComprehensiveFacilityDetail(facilityId, authentication.getName());

        log.info("시설 상세 정보 조회 완료 - ID: {}", facilityId);
        return ResponseEntity.ok(facilityDetail);
    }

    @Operation(
        summary = "시설 비교하기",
        description = "선택한 여러 시설의 정보를 비교표 형태로 제공합니다."
    )
    @PostMapping("/compare")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> compareFacilities(
            @Parameter(description = "비교할 시설 ID 목록 (최대 5개)", required = true)
            @RequestBody List<Long> facilityIds) {
        
        if (facilityIds.size() > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "최대 5개 시설까지만 비교 가능합니다."));
        }

        log.info("시설 비교 요청 - 시설 수: {}", facilityIds.size());

        // 시설 비교 데이터 생성 (임시 더미 데이터)
        Map<String, Object> comparisonResult = createFacilityComparison(facilityIds);

        log.info("시설 비교 완료 - 시설 수: {}", facilityIds.size());
        return ResponseEntity.ok(comparisonResult);
    }

    @Operation(
        summary = "추천 시설 목록",
        description = "사용자의 건강 평가 결과를 기반으로 최적의 시설을 추천합니다."
    )
    @GetMapping("/recommendations")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedFacilities(
            @Parameter(description = "건강 평가 ID")
            @RequestParam(required = false) Long healthAssessmentId,
            @Parameter(description = "케어 등급 (1-6)")
            @RequestParam(required = false) Integer careGrade,
            @Parameter(description = "선호 지역")
            @RequestParam(required = false) String preferredRegion,
            @Parameter(description = "예산 범위 (만원)")
            @RequestParam(required = false) Integer budgetRange,
            @Parameter(description = "추천 결과 수")
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        log.info("추천 시설 조회 - 사용자: {}, 평가ID: {}, 케어등급: {}", 
                authentication.getName(), healthAssessmentId, careGrade);

        // AI 기반 시설 추천 (임시 더미 데이터)
        List<Map<String, Object>> recommendations = createPersonalizedRecommendations(
            authentication.getName(), healthAssessmentId, careGrade, preferredRegion, budgetRange, limit);

        log.info("추천 시설 조회 완료 - {}건", recommendations.size());
        return ResponseEntity.ok(recommendations);
    }

    @Operation(
        summary = "시설 즐겨찾기 목록",
        description = "사용자가 즐겨찾기로 등록한 시설 목록을 조회합니다."
    )
    @GetMapping("/favorites")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getFavoriteFacilities(
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "한 페이지 결과 수")
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        log.info("즐겨찾기 시설 조회 - 사용자: {}", authentication.getName());

        // 사용자 즐겨찾기 시설 (임시 더미 데이터)
        List<Map<String, Object>> favorites = createUserFavorites(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> favoritePage = new PageImpl<>(favorites, pageable, favorites.size());

        log.info("즐겨찾기 시설 조회 완료 - {}건", favorites.size());
        return ResponseEntity.ok(favoritePage);
    }

    @Operation(
        summary = "시설 즐겨찾기 추가/제거",
        description = "특정 시설을 즐겨찾기에 추가하거나 제거합니다."
    )
    @PostMapping("/{facilityId}/favorite")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleFacilityFavorite(
            @Parameter(description = "시설 ID", required = true)
            @PathVariable Long facilityId,
            @Parameter(description = "즐겨찾기 추가(true) 또는 제거(false)")
            @RequestParam boolean isFavorite,
            Authentication authentication) {
        
        log.info("시설 즐겨찾기 {} - 시설ID: {}, 사용자: {}", 
                isFavorite ? "추가" : "제거", facilityId, authentication.getName());

        // 즐겨찾기 처리 (임시 더미 응답)
        Map<String, Object> response = Map.of(
            "facilityId", facilityId,
            "isFavorite", isFavorite,
            "message", isFavorite ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 제거되었습니다.",
            "totalFavorites", isFavorite ? 5 : 4
        );

        log.info("시설 즐겨찾기 {} 완료 - 시설ID: {}", isFavorite ? "추가" : "제거", facilityId);
        return ResponseEntity.ok(response);
    }

    // ===== 내부 헬퍼 메서드들 =====

    /**
     * 고급 검색 결과 생성 (임시 더미 데이터)
     */
    private List<Map<String, Object>> createAdvancedSearchResults(
            String keyword, String region, String district, String facilityType, String minGrade,
            Integer maxMonthlyCost, boolean availableBedsOnly, String specializedCare,
            Double latitude, Double longitude, int radiusKm, String sortBy) {
        
        List<Map<String, Object>> facilities = List.of(
            createFacilitySearchItem(1L, "서울중앙요양원", "노인요양시설", "서울특별시 강남구", "A등급", 280, 15, 4.8, 37.5665, 126.9780, 2.3),
            createFacilitySearchItem(2L, "부산실버케어센터", "노인요양시설", "부산광역시 해운대구", "A등급", 260, 8, 4.6, 35.1796, 129.0756, 8.7),
            createFacilitySearchItem(3L, "대구실버타운", "노인요양공동생활가정", "대구광역시 수성구", "B등급", 220, 3, 4.4, 35.8714, 128.6014, 15.2),
            createFacilitySearchItem(4L, "인천실버홈", "주야간보호시설", "인천광역시 연수구", "A등급", 180, 12, 4.7, 37.4563, 126.7052, 25.8),
            createFacilitySearchItem(5L, "광주요양센터", "노인요양시설", "광주광역시 북구", "B등급", 240, 0, 4.2, 35.1595, 126.8526, 35.4)
        );

        // 실제로는 검색 조건에 따른 필터링 및 정렬 로직 적용
        return facilities;
    }

    /**
     * 지도 검색 결과 생성
     */
    private List<Map<String, Object>> createMapSearchResults(
            double neLat, double neLng, double swLat, double swLng,
            String facilityType, String minGrade, boolean availableBedsOnly) {
        
        return List.of(
            createMapFacilityItem(1L, "서울중앙요양원", 37.5665, 126.9780, "A등급", 15, true),
            createMapFacilityItem(2L, "강남실버케어", 37.5172, 127.0473, "A등급", 8, true),
            createMapFacilityItem(3L, "서초요양원", 37.4837, 127.0324, "B등급", 5, false),
            createMapFacilityItem(4L, "송파실버홈", 37.5145, 127.1060, "A등급", 12, true)
        );
    }

    /**
     * 개별 시설 검색 아이템 생성
     */
    private Map<String, Object> createFacilitySearchItem(Long facilityId, String name, String type, String address,
                                                        String grade, int monthlyCost, int availableBeds, double rating,
                                                        double lat, double lng, double distance) {
        Map<String, Object> facility = new HashMap<>();
        facility.put("facilityId", facilityId);
        facility.put("facilityName", name);
        facility.put("facilityType", type);
        facility.put("address", address);
        facility.put("facilityGrade", grade);
        facility.put("monthlyFee", monthlyCost + "만원");
        facility.put("availableBeds", availableBeds);
        facility.put("isAvailable", availableBeds > 0);
        facility.put("userRating", rating);
        facility.put("reviewCount", (int)(rating * 10) + 5);
        facility.put("latitude", lat);
        facility.put("longitude", lng);
        facility.put("distance", distance + "km");
        facility.put("specializedCare", List.of("24시간 간병", "치매케어", "재활치료"));
        facility.put("thumbnailImage", "/images/facilities/" + facilityId + "_thumb.jpg");
        return facility;
    }

    /**
     * 지도용 시설 아이템 생성
     */
    private Map<String, Object> createMapFacilityItem(Long facilityId, String name, double lat, double lng,
                                                     String grade, int availableBeds, boolean isRecommended) {
        Map<String, Object> mapItem = new HashMap<>();
        mapItem.put("facilityId", facilityId);
        mapItem.put("facilityName", name);
        mapItem.put("latitude", lat);
        mapItem.put("longitude", lng);
        mapItem.put("grade", grade);
        mapItem.put("availableBeds", availableBeds);
        mapItem.put("isRecommended", isRecommended);
        mapItem.put("markerColor", isRecommended ? "red" : (availableBeds > 0 ? "green" : "gray"));
        return mapItem;
    }

    /**
     * 지도 클러스터링 데이터 생성
     */
    private List<Map<String, Object>> createFacilityClusters(List<Map<String, Object>> facilities) {
        return List.of(
            Map.of("lat", 37.5665, "lng", 126.9780, "count", 3, "averageGrade", "A"),
            Map.of("lat", 37.5000, "lng", 127.0500, "count", 2, "averageGrade", "B")
        );
    }

    /**
     * 종합적인 시설 상세 정보 생성
     */
    private Map<String, Object> createComprehensiveFacilityDetail(Long facilityId, String userName) {
        Map<String, Object> detail = new HashMap<>();
        detail.put("facilityId", facilityId);
        detail.put("facilityName", "서울중앙요양원");
        detail.put("facilityType", "노인요양시설");
        detail.put("address", "서울시 강남구 테스트로 123");
        detail.put("facilityGrade", "A등급");
        detail.put("totalCapacity", 50);
        detail.put("currentOccupancy", 35);
        detail.put("availableBeds", 15);
        detail.put("operatorName", "사회복지법인 서울케어");
        detail.put("establishedDate", "2015-03-15");
        detail.put("contact", Map.of("phone", "02-1234-5678", "fax", "02-1234-5679", "email", "info@seoulcare.co.kr"));
        
        // 가격 정보
        detail.put("pricing", Map.of(
            "basicFee", Map.of("amount", 280, "description", "기본 월 이용료"),
            "premiumFee", Map.of("amount", 350, "description", "프리미엄 서비스 포함"),
            "additionalFees", List.of(
                Map.of("service", "개인간병", "amount", 80, "unit", "월"),
                Map.of("service", "물리치료", "amount", 15, "unit", "회")
            )
        ));
        
        // 서비스 및 시설 정보
        detail.put("services", List.of("24시간 간병", "치매전문케어", "재활치료", "호스피스", "영양관리", "의료진 상주"));
        detail.put("facilities", List.of("개인실 30개", "2인실 10개", "물리치료실", "작업치료실", "식당", "휴게실", "정원"));
        detail.put("medicalStaff", Map.of("doctors", 2, "nurses", 8, "caregivers", 15, "therapists", 4));
        
        // 위치 및 교통 정보
        detail.put("location", Map.of(
            "latitude", 37.5665,
            "longitude", 126.9780,
            "nearbySubway", List.of("강남역 5분", "역삼역 8분"),
            "nearbyBus", List.of("146번", "241번", "362번"),
            "parkingSpaces", 20
        ));
        
        // 리뷰 및 평점
        detail.put("reviews", Map.of(
            "averageRating", 4.8,
            "totalReviews", 67,
            "ratingDistribution", Map.of("5star", 45, "4star", 15, "3star", 5, "2star", 2, "1star", 0),
            "recentReviews", List.of(
                Map.of("rating", 5, "comment", "시설이 정말 깨끗하고 직원분들이 너무 친절해요", "date", "2025-01-25", "reviewer", "김**"),
                Map.of("rating", 4, "comment", "아버지께서 만족해하시네요. 의료진도 전문적이고요", "date", "2025-01-20", "reviewer", "이**")
            )
        ));
        
        // 추가 정보
        detail.put("certifications", List.of("A등급 인증", "의료기관 연계", "화재안전 인증"));
        detail.put("lastInspection", Map.of("date", "2024-11-15", "result", "적합", "nextDate", "2025-05-15"));
        detail.put("isUserFavorite", false); // 실제로는 사용자별 즐겨찾기 상태 확인
        detail.put("coordinatorMatches", 8); // 매칭 가능한 코디네이터 수
        detail.put("similarFacilities", List.of(2L, 4L, 7L)); // 유사한 다른 시설들
        
        return detail;
    }

    /**
     * 시설 비교 데이터 생성
     */
    private Map<String, Object> createFacilityComparison(List<Long> facilityIds) {
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("facilityIds", facilityIds);
        comparison.put("comparisonDate", "2025-01-28T12:30:00");
        
        // 비교 카테고리별 데이터
        List<Map<String, Object>> facilities = facilityIds.stream()
                .map(this::createComparisonFacilityData)
                .toList();
        
        comparison.put("facilities", facilities);
        comparison.put("comparisonCategories", List.of(
            "기본정보", "가격", "서비스", "시설", "위치", "평점"
        ));
        
        return comparison;
    }

    /**
     * 비교용 시설 데이터 생성
     */
    private Map<String, Object> createComparisonFacilityData(Long facilityId) {
        Map<String, Object> data = new HashMap<>();
        data.put("facilityId", facilityId);
        data.put("facilityName", "시설" + facilityId + "호");
        data.put("grade", facilityId <= 2 ? "A등급" : "B등급");
        data.put("monthlyFee", 280 - (facilityId * 10));
        data.put("availableBeds", 20 - facilityId.intValue());
        data.put("userRating", 4.8 - (facilityId * 0.1));
        data.put("distance", facilityId * 2.5 + "km");
        return data;
    }

    /**
     * 개인화된 추천 시설 생성
     */
    private List<Map<String, Object>> createPersonalizedRecommendations(
            String userName, Long healthAssessmentId, Integer careGrade, 
            String preferredRegion, Integer budgetRange, int limit) {
        
        return List.of(
            createRecommendationItem(1L, "서울중앙요양원", 95.5, "케어등급과 완벽 매칭", "A등급", 280),
            createRecommendationItem(2L, "강남실버케어", 92.8, "위치와 서비스 우수", "A등급", 260),
            createRecommendationItem(3L, "송파요양원", 89.2, "비용 대비 만족도 높음", "B등급", 240)
        ).stream().limit(limit).toList();
    }

    /**
     * 추천 아이템 생성
     */
    private Map<String, Object> createRecommendationItem(Long facilityId, String name, double matchScore, 
                                                        String reason, String grade, int monthlyCost) {
        Map<String, Object> item = new HashMap<>();
        item.put("facilityId", facilityId);
        item.put("facilityName", name);
        item.put("matchScore", matchScore);
        item.put("matchReason", reason);
        item.put("facilityGrade", grade);
        item.put("monthlyFee", monthlyCost);
        item.put("availableBeds", 10 + facilityId.intValue());
        item.put("userRating", 4.5 + (matchScore / 100));
        return item;
    }

    /**
     * 사용자 즐겨찾기 시설 생성
     */
    private List<Map<String, Object>> createUserFavorites(String userName) {
        return List.of(
            createFavoriteItem(1L, "서울중앙요양원", "2025-01-25"),
            createFavoriteItem(3L, "대구실버타운", "2025-01-20"),
            createFavoriteItem(5L, "광주요양센터", "2025-01-15")
        );
    }

    /**
     * 즐겨찾기 아이템 생성
     */
    private Map<String, Object> createFavoriteItem(Long facilityId, String name, String addedDate) {
        Map<String, Object> item = new HashMap<>();
        item.put("facilityId", facilityId);
        item.put("facilityName", name);
        item.put("addedDate", addedDate);
        item.put("facilityGrade", "A등급");
        item.put("availableBeds", 15);
        item.put("monthlyFee", 280);
        return item;
    }
}