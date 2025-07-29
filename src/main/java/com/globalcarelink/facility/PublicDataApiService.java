package com.globalcarelink.facility;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 공공데이터 API 연동 서비스
 * - 보건복지부 노인복지시설 정보 조회
 * - 국민건강보험공단 장기요양기관 정보 조회
 * - 지자체 요양시설 현황 정보 조회
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PublicDataApiService {

    private final WebClient webClient;

    @Value("${public-data.api.key:test-key}")
    private String publicDataApiKey;

    @Value("${public-data.api.base-url:https://apis.data.go.kr}")
    private String publicDataBaseUrl;

    /**
     * 보건복지부 노인복지시설 정보 조회
     * @param region 지역 (서울특별시, 부산광역시 등)
     * @param facilityType 시설유형 (노인요양시설, 노인요양공동생활가정 등)
     * @param pageNo 페이지 번호
     * @param numOfRows 한 페이지 결과 수
     * @return 시설 정보 목록
     */
    public Mono<Map<String, Object>> getElderlyFacilitiesFromPublicData(
            String region, String facilityType, int pageNo, int numOfRows) {
        
        log.info("보건복지부 노인복지시설 정보 조회 - 지역: {}, 유형: {}, 페이지: {}", region, facilityType, pageNo);

        // 실제 API 연동 시 사용할 URL 및 파라미터
        String apiUrl = publicDataBaseUrl + "/1371000/FacilityService/getFacilityList";
        
        Map<String, Object> params = new HashMap<>();
        params.put("serviceKey", publicDataApiKey);
        params.put("region", region);
        params.put("facilityType", facilityType);
        params.put("pageNo", pageNo);
        params.put("numOfRows", numOfRows);
        params.put("dataType", "JSON");

        // 현재는 임시 더미 데이터 반환 (실제 API 키 없이도 테스트 가능)
        return createMockElderlyFacilitiesData(region, facilityType, pageNo, numOfRows);
    }

    /**
     * 국민건강보험공단 장기요양기관 정보 조회
     * @param region 지역
     * @param careType 급여유형 (재가급여, 시설급여)
     * @param pageNo 페이지
     * @param numOfRows 조회 건수
     * @return 장기요양기관 정보
     */
    public Mono<Map<String, Object>> getLtciFacilitiesFromPublicData(
            String region, String careType, int pageNo, int numOfRows) {
        
        log.info("건강보험공단 장기요양기관 정보 조회 - 지역: {}, 급여유형: {}", region, careType);

        // 실제 API: 국민건강보험공단_장기요양기관정보서비스
        String apiUrl = publicDataBaseUrl + "/1351000/LtciService/getLtciFacilityList";
        
        Map<String, Object> params = new HashMap<>();
        params.put("serviceKey", publicDataApiKey);
        params.put("region", region);
        params.put("careType", careType);
        params.put("pageNo", pageNo);
        params.put("numOfRows", numOfRows);

        // 임시 더미 데이터 반환
        return createMockLtciFacilitiesData(region, careType, pageNo, numOfRows);
    }

    /**
     * 시설 상세 정보 조회 (공공데이터 + 자체 DB 통합)
     * @param facilityId 시설 고유번호
     * @param dataSource 데이터 소스 (PUBLIC_DATA, INTERNAL_DB)
     * @return 시설 상세 정보
     */
    public Mono<Map<String, Object>> getFacilityDetailFromPublicData(String facilityId, String dataSource) {
        log.info("시설 상세 정보 조회 - ID: {}, 소스: {}", facilityId, dataSource);

        if ("PUBLIC_DATA".equals(dataSource)) {
            return fetchPublicDataFacilityDetail(facilityId);
        } else {
            return fetchInternalFacilityDetail(facilityId);
        }
    }

    /**
     * 지역별 시설 현황 통계 조회
     * @param region 지역 (전국, 서울특별시 등)
     * @return 지역별 시설 현황 통계
     */
    public Mono<Map<String, Object>> getFacilityStatisticsByRegion(String region) {
        log.info("지역별 시설 현황 통계 조회 - 지역: {}", region);

        // 복수 API 호출하여 통합 통계 생성
        return Mono.zip(
            getElderlyFacilitiesFromPublicData(region, null, 1, 1000),
            getLtciFacilitiesFromPublicData(region, null, 1, 1000)
        ).map(tuple -> {
            Map<String, Object> elderlyData = tuple.getT1();
            Map<String, Object> ltciData = tuple.getT2();
            
            return createRegionalStatistics(region, elderlyData, ltciData);
        });
    }

    /**
     * 실시간 시설 가용성 체크 (공공데이터 + 자체 모니터링)
     * @param facilityIds 체크할 시설 ID 목록
     * @return 시설별 가용성 정보
     */
    public Mono<List<Map<String, Object>>> checkFacilityAvailability(List<String> facilityIds) {
        log.info("실시간 시설 가용성 체크 - 시설 수: {}", facilityIds.size());

        // 각 시설에 대해 병렬로 가용성 체크
        List<Mono<Map<String, Object>>> availabilityChecks = facilityIds.stream()
                .map(this::checkSingleFacilityAvailability)
                .toList();

        return Mono.zip(availabilityChecks, results -> {
            List<Map<String, Object>> resultList = new ArrayList<>();
            for (Object result : results) {
                if (result instanceof Map) {
                    resultList.add((Map<String, Object>) result);
                }
            }
            return resultList;
        });
    }

    // ===== 내부 헬퍼 메서드들 =====

    /**
     * 보건복지부 시설 정보 더미 데이터 생성
     */
    private Mono<Map<String, Object>> createMockElderlyFacilitiesData(
            String region, String facilityType, int pageNo, int numOfRows) {
        
        Map<String, Object> response = new HashMap<>();
        
        // 헤더 정보
        Map<String, Object> header = new HashMap<>();
        header.put("resultCode", "00");
        header.put("resultMsg", "NORMAL_SERVICE");
        
        // 바디 정보
        Map<String, Object> body = new HashMap<>();
        body.put("totalCount", 156);
        body.put("pageNo", pageNo);
        body.put("numOfRows", numOfRows);
        
        // 실제 시설 데이터 (임시)
        List<Map<String, Object>> items = List.of(
            createMockFacilityItem("3210000001", "서울중앙요양원", "노인요양시설", "서울특별시 강남구", "A등급", 50, 35, true),
            createMockFacilityItem("3210000002", "부산실버케어센터", "노인요양시설", "부산광역시 해운대구", "A등급", 60, 45, true),
            createMockFacilityItem("3210000003", "대구실버타운", "노인요양공동생활가정", "대구광역시 수성구", "B등급", 15, 12, true),
            createMockFacilityItem("3210000004", "인천실버홈", "주야간보호시설", "인천광역시 연수구", "A등급", 30, 22, true),
            createMockFacilityItem("3210000005", "광주요양센터", "방문요양기관", "광주광역시 북구", "B등급", 0, 0, false)
        );
        
        body.put("items", items);
        response.put("header", header);
        response.put("body", body);
        
        return Mono.just(response);
    }

    /**
     * 건강보험공단 장기요양기관 더미 데이터 생성
     */
    private Mono<Map<String, Object>> createMockLtciFacilitiesData(
            String region, String careType, int pageNo, int numOfRows) {
        
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> header = new HashMap<>();
        header.put("resultCode", "00");
        header.put("resultMsg", "정상처리");
        
        Map<String, Object> body = new HashMap<>();
        body.put("totalCount", 89);
        body.put("pageNo", pageNo);
        body.put("numOfRows", numOfRows);
        
        List<Map<String, Object>> items = List.of(
            createMockLtciItem("31100001", "서울장기요양센터", "재가급여", "서울특별시", "A등급", "2023-12-31", 85.5),
            createMockLtciItem("26100001", "부산케어센터", "시설급여", "부산광역시", "A등급", "2024-03-31", 90.2),
            createMockLtciItem("27100001", "대구실버케어", "재가급여", "대구광역시", "B등급", "2024-06-30", 78.8),
            createMockLtciItem("28100001", "인천요양원", "시설급여", "인천광역시", "A등급", "2024-01-31", 88.7)
        );
        
        body.put("items", items);
        response.put("header", header);
        response.put("body", body);
        
        return Mono.just(response);
    }

    /**
     * 개별 시설 정보 더미 아이템 생성
     */
    private Map<String, Object> createMockFacilityItem(String facilityId, String facilityName, String facilityType, 
                                                      String address, String grade, int totalBeds, int occupiedBeds, boolean isActive) {
        Map<String, Object> item = new HashMap<>();
        item.put("facilityId", facilityId);
        item.put("facilityName", facilityName);
        item.put("facilityType", facilityType);
        item.put("address", address);
        item.put("grade", grade);
        item.put("totalBeds", totalBeds);
        item.put("occupiedBeds", occupiedBeds);
        item.put("availableBeds", totalBeds - occupiedBeds);
        item.put("occupancyRate", totalBeds > 0 ? (double) occupiedBeds / totalBeds * 100 : 0);
        item.put("isActive", isActive);
        item.put("lastUpdated", "2025-01-28T10:30:00");
        return item;
    }

    /**
     * 장기요양기관 정보 더미 아이템 생성
     */
    private Map<String, Object> createMockLtciItem(String ltciId, String facilityName, String careType, 
                                                  String region, String grade, String validUntil, double satisfactionScore) {
        Map<String, Object> item = new HashMap<>();
        item.put("ltciId", ltciId);
        item.put("facilityName", facilityName);
        item.put("careType", careType);
        item.put("region", region);
        item.put("grade", grade);
        item.put("validUntil", validUntil);
        item.put("satisfactionScore", satisfactionScore);
        item.put("certificationStatus", "정상");
        item.put("specializedCare", List.of("치매케어", "재활치료", "호스피스"));
        return item;
    }

    /**
     * 공공데이터에서 시설 상세 정보 조회
     */
    private Mono<Map<String, Object>> fetchPublicDataFacilityDetail(String facilityId) {
        Map<String, Object> detail = new HashMap<>();
        detail.put("facilityId", facilityId);
        detail.put("facilityName", "서울중앙요양원");
        detail.put("facilityType", "노인요양시설");
        detail.put("address", "서울시 강남구 테스트로 123");
        detail.put("totalCapacity", 50);
        detail.put("currentOccupancy", 35);
        detail.put("facilityGrade", "A등급");
        detail.put("establishedDate", "2015-03-15");
        detail.put("operatorName", "사회복지법인 서울케어");
        detail.put("contact", "02-1234-5678");
        detail.put("specializedServices", List.of("24시간 간병", "치매전문케어", "재활치료", "호스피스"));
        detail.put("medicalStaff", Map.of("doctors", 2, "nurses", 8, "caregivers", 15));
        detail.put("monthlyFee", Map.of("standard", 280, "premium", 350, "unit", "만원"));
        detail.put("lastInspectionDate", "2024-11-15");
        detail.put("inspectionResult", "적합");
        detail.put("dataSource", "PUBLIC_DATA");
        
        return Mono.just(detail);
    }

    /**
     * 내부 DB에서 시설 상세 정보 조회
     */
    private Mono<Map<String, Object>> fetchInternalFacilityDetail(String facilityId) {
        Map<String, Object> detail = new HashMap<>();
        detail.put("facilityId", facilityId);
        detail.put("facilityName", "자체 등록 요양원");
        detail.put("userReviews", List.of(
            Map.of("rating", 4.5, "comment", "시설이 깨끗하고 직원이 친절해요", "date", "2025-01-20"),
            Map.of("rating", 4.8, "comment", "전문적인 케어를 받을 수 있어요", "date", "2025-01-15")
        ));
        detail.put("coordinatorMatches", 5);
        detail.put("averageMatchingScore", 87.5);
        detail.put("dataSource", "INTERNAL_DB");
        
        return Mono.just(detail);
    }

    /**
     * 지역별 통계 데이터 생성
     */
    private Map<String, Object> createRegionalStatistics(String region, Map<String, Object> elderlyData, Map<String, Object> ltciData) {
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("region", region);
        statistics.put("totalFacilities", 245);
        statistics.put("activeRate", 92.5);
        statistics.put("averageOccupancyRate", 76.8);
        statistics.put("gradeDistribution", Map.of("A등급", 45, "B등급", 38, "C등급", 12));
        statistics.put("facilityTypeDistribution", Map.of(
            "노인요양시설", 89,
            "노인요양공동생활가정", 67,
            "주야간보호시설", 54,
            "방문요양기관", 35
        ));
        statistics.put("lastUpdated", "2025-01-28T11:00:00");
        
        return statistics;
    }

    /**
     * 개별 시설 가용성 체크
     */
    private Mono<Map<String, Object>> checkSingleFacilityAvailability(String facilityId) {
        Map<String, Object> availability = new HashMap<>();
        availability.put("facilityId", facilityId);
        availability.put("isAvailable", true);
        availability.put("availableBeds", 15);
        availability.put("waitingList", 3);
        availability.put("estimatedWaitTime", "2-3주");
        availability.put("emergencyAcceptance", true);
        availability.put("lastChecked", "2025-01-28T11:30:00");
        
        return Mono.just(availability);
    }
}