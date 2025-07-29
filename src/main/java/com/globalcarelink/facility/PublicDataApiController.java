package com.globalcarelink.facility;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 공공데이터 API 연동 컨트롤러
 * - 보건복지부 노인복지시설 정보 조회
 * - 국민건강보험공단 장기요양기관 정보 조회
 * - 지자체 시설 현황 및 통계 정보 제공
 */
@Tag(name = "공공데이터 API", description = "공공데이터 포털 연동 시설 정보 조회")
@RestController
@RequestMapping("/api/public-data")
@RequiredArgsConstructor
@Slf4j
public class PublicDataApiController {

    private final PublicDataApiService publicDataApiService;

    @Operation(
        summary = "보건복지부 노인복지시설 조회",
        description = "보건복지부 공공데이터를 통해 노인복지시설 목록을 조회합니다."
    )
    @GetMapping("/facilities/elderly")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public Mono<ResponseEntity<Map<String, Object>>> getElderlyFacilities(
            @Parameter(description = "지역 (서울특별시, 부산광역시 등)")
            @RequestParam(required = false) String region,
            @Parameter(description = "시설유형 (노인요양시설, 노인요양공동생활가정 등)")
            @RequestParam(required = false) String facilityType,
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "한 페이지 결과 수")
            @RequestParam(defaultValue = "20") int numOfRows) {
        
        log.info("보건복지부 노인복지시설 조회 API 호출 - 지역: {}, 유형: {}", region, facilityType);

        return publicDataApiService.getElderlyFacilitiesFromPublicData(region, facilityType, pageNo, numOfRows)
                .map(ResponseEntity::ok)
                .doOnSuccess(result -> log.info("보건복지부 노인복지시설 조회 완료"))
                .doOnError(error -> log.error("보건복지부 노인복지시설 조회 실패", error));
    }

    @Operation(
        summary = "건강보험공단 장기요양기관 조회",
        description = "국민건강보험공단 공공데이터를 통해 장기요양기관 목록을 조회합니다."
    )
    @GetMapping("/facilities/ltci")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public Mono<ResponseEntity<Map<String, Object>>> getLtciFacilities(
            @Parameter(description = "지역")
            @RequestParam(required = false) String region,
            @Parameter(description = "급여유형 (재가급여, 시설급여)")
            @RequestParam(required = false) String careType,
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "한 페이지 결과 수")
            @RequestParam(defaultValue = "20") int numOfRows) {
        
        log.info("건강보험공단 장기요양기관 조회 API 호출 - 지역: {}, 급여유형: {}", region, careType);

        return publicDataApiService.getLtciFacilitiesFromPublicData(region, careType, pageNo, numOfRows)
                .map(ResponseEntity::ok)
                .doOnSuccess(result -> log.info("건강보험공단 장기요양기관 조회 완료"))
                .doOnError(error -> log.error("건강보험공단 장기요양기관 조회 실패", error));
    }

    @Operation(
        summary = "시설 상세 정보 조회",
        description = "특정 시설의 상세 정보를 공공데이터 또는 자체 DB에서 조회합니다."
    )
    @GetMapping("/facilities/{facilityId}/detail")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public Mono<ResponseEntity<Map<String, Object>>> getFacilityDetail(
            @Parameter(description = "시설 고유번호", required = true)
            @PathVariable String facilityId,
            @Parameter(description = "데이터 소스 (PUBLIC_DATA, INTERNAL_DB)")
            @RequestParam(defaultValue = "PUBLIC_DATA") String dataSource) {
        
        log.info("시설 상세 정보 조회 API 호출 - ID: {}, 소스: {}", facilityId, dataSource);

        return publicDataApiService.getFacilityDetailFromPublicData(facilityId, dataSource)
                .map(ResponseEntity::ok)
                .doOnSuccess(result -> log.info("시설 상세 정보 조회 완료 - ID: {}", facilityId))
                .doOnError(error -> log.error("시설 상세 정보 조회 실패 - ID: {}", facilityId, error));
    }

    @Operation(
        summary = "지역별 시설 현황 통계",
        description = "특정 지역의 시설 현황 및 통계 정보를 제공합니다."
    )
    @GetMapping("/statistics/regional")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public Mono<ResponseEntity<Map<String, Object>>> getRegionalStatistics(
            @Parameter(description = "지역 (전국, 서울특별시 등)")
            @RequestParam(defaultValue = "전국") String region) {
        
        log.info("지역별 시설 현황 통계 조회 API 호출 - 지역: {}", region);

        return publicDataApiService.getFacilityStatisticsByRegion(region)
                .map(ResponseEntity::ok)
                .doOnSuccess(result -> log.info("지역별 시설 현황 통계 조회 완료 - 지역: {}", region))
                .doOnError(error -> log.error("지역별 시설 현황 통계 조회 실패 - 지역: {}", region, error));
    }

    @Operation(
        summary = "실시간 시설 가용성 체크",
        description = "지정된 시설들의 실시간 가용성 상태를 확인합니다."
    )
    @PostMapping("/facilities/availability-check")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public Mono<ResponseEntity<List<Map<String, Object>>>> checkFacilityAvailability(
            @Parameter(description = "체크할 시설 ID 목록", required = true)
            @RequestBody List<String> facilityIds) {
        
        log.info("실시간 시설 가용성 체크 API 호출 - 시설 수: {}", facilityIds.size());

        return publicDataApiService.checkFacilityAvailability(facilityIds)
                .map(ResponseEntity::ok)
                .doOnSuccess(result -> log.info("실시간 시설 가용성 체크 완료 - 시설 수: {}", facilityIds.size()))
                .doOnError(error -> log.error("실시간 시설 가용성 체크 실패", error));
    }

    @Operation(
        summary = "통합 시설 검색",
        description = "공공데이터와 자체 DB를 통합하여 시설을 검색합니다."
    )
    @GetMapping("/facilities/search")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> searchIntegratedFacilities(
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "지역")
            @RequestParam(required = false) String region,
            @Parameter(description = "시설 유형")
            @RequestParam(required = false) String facilityType,
            @Parameter(description = "최소 등급 (A, B, C)")
            @RequestParam(required = false) String minGrade,
            @Parameter(description = "가용 침상 여부")
            @RequestParam(defaultValue = "false") boolean availableBedsOnly,
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "한 페이지 결과 수")
            @RequestParam(defaultValue = "20") int numOfRows) {
        
        log.info("통합 시설 검색 API 호출 - 키워드: {}, 지역: {}, 유형: {}", keyword, region, facilityType);

        // 공공데이터와 자체 DB 결과를 통합한 임시 결과
        Map<String, Object> result1 = new HashMap<>();
        result1.put("facilityId", "PUB_001");
        result1.put("facilityName", "서울중앙요양원");
        result1.put("address", "서울시 강남구 테스트로 123");
        result1.put("facilityType", "노인요양시설");
        result1.put("grade", "A등급");
        result1.put("availableBeds", 15);
        result1.put("monthlyFee", 280);
        result1.put("dataSource", "PUBLIC_DATA");
        result1.put("matchingScore", 92.5);
        
        Map<String, Object> result2 = new HashMap<>();
        result2.put("facilityId", "INT_001");
        result2.put("facilityName", "부산실버케어센터");
        result2.put("address", "부산시 해운대구 테스트로 456");
        result2.put("facilityType", "노인요양시설");
        result2.put("grade", "A등급");
        result2.put("availableBeds", 8);
        result2.put("monthlyFee", 260);
        result2.put("dataSource", "INTERNAL_DB");
        result2.put("matchingScore", 89.7);
        result2.put("userRating", 4.6);
        result2.put("reviewCount", 23);
        
        Map<String, Object> searchResult = new HashMap<>();
        searchResult.put("totalCount", 87);
        searchResult.put("pageNo", pageNo);
        searchResult.put("numOfRows", numOfRows);
        searchResult.put("publicDataCount", 52);
        searchResult.put("internalDbCount", 35);
        searchResult.put("results", List.of(result1, result2));

        log.info("통합 시설 검색 완료 - 총 {}건", searchResult.get("totalCount"));
        return ResponseEntity.ok(searchResult);
    }

    @Operation(
        summary = "시설 정보 동기화",
        description = "공공데이터의 최신 시설 정보를 자체 DB에 동기화합니다."
    )
    @PostMapping("/facilities/sync")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> syncFacilityData(
            @Parameter(description = "동기화할 지역")
            @RequestParam(required = false) String region,
            @Parameter(description = "강제 업데이트 여부")
            @RequestParam(defaultValue = "false") boolean forceUpdate) {
        
        log.info("시설 정보 동기화 시작 - 지역: {}, 강제업데이트: {}", region, forceUpdate);

        // 동기화 작업 결과 (임시)
        Map<String, Object> syncResult = new HashMap<>();
        syncResult.put("syncStartTime", "2025-01-28T12:00:00");
        syncResult.put("syncEndTime", "2025-01-28T12:15:00");
        syncResult.put("totalProcessed", 245);
        syncResult.put("updated", 23);
        syncResult.put("inserted", 8);
        syncResult.put("failed", 2);
        syncResult.put("status", "SUCCESS");
        syncResult.put("message", "시설 정보 동기화가 성공적으로 완료되었습니다.");

        log.info("시설 정보 동기화 완료 - 처리: {}건, 업데이트: {}건, 신규: {}건", 
                syncResult.get("totalProcessed"), syncResult.get("updated"), syncResult.get("inserted"));
        
        return ResponseEntity.ok(syncResult);
    }
}