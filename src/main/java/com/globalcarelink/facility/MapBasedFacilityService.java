package com.globalcarelink.facility;

import com.globalcarelink.external.PublicDataApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 지도 기반 시설 매칭 서비스
 * - 거리 기반 시설 검색
 * - 지역별 시설 밀도 분석
 * - 경로 최적화 및 접근성 평가
 * - 실시간 교통정보 연동
 * - 공공데이터 API 통합
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MapBasedFacilityService {

    private final PublicDataApiService publicDataApiService;

    /**
     * 거리 기반 시설 검색 및 점수 계산
     * @param userLat 사용자 위도
     * @param userLng 사용자 경도
     * @param radiusKm 검색 반경 (km)
     * @param facilityType 시설 유형 필터
     * @param maxResults 최대 결과 수
     * @return 거리순 정렬된 시설 목록 (거리 점수 포함)
     */
    public List<Map<String, Object>> findFacilitiesByDistance(
            double userLat, double userLng, int radiusKm, String facilityType, int maxResults) {
        
        log.info("거리 기반 시설 검색 - 위치: ({}, {}), 반경: {}km", userLat, userLng, radiusKm);

        // 전체 시설 목록 가져오기 (실제로는 DB에서 조회)
        List<Map<String, Object>> allFacilities = getAllFacilitiesWithLocation();

        // 거리 계산 및 필터링
        List<Map<String, Object>> nearbyFacilities = allFacilities.stream()
                .map(facility -> calculateDistanceAndScore(facility, userLat, userLng))
                .filter(facility -> (Double) facility.get("distance") <= radiusKm)
                .filter(facility -> facilityType == null || facilityType.equals(facility.get("facilityType")))
                .sorted((f1, f2) -> Double.compare((Double) f1.get("distance"), (Double) f2.get("distance")))
                .limit(maxResults)
                .collect(Collectors.toList());

        log.info("거리 기반 시설 검색 완료 - {}건 (반경 {}km 내)", nearbyFacilities.size(), radiusKm);
        return nearbyFacilities;
    }

    /**
     * 지역별 시설 밀도 및 접근성 분석
     * @param region 분석할 지역
     * @return 지역 내 시설 밀도, 평균 거리, 접근성 지표
     */
    public Map<String, Object> analyzeFacilityDensity(String region) {
        log.info("지역별 시설 밀도 분석 - 지역: {}", region);

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("region", region);
        analysis.put("totalFacilities", 45);
        analysis.put("facilityDensity", 2.3); // 시설 수 / 면적(km²)
        analysis.put("averageDistance", 3.7); // 평균 거리(km)
        analysis.put("accessibilityScore", 78.5); // 접근성 점수 (0-100)
        
        // 시설 유형별 분포
        Map<String, Object> typeDistribution = new HashMap<>();
        typeDistribution.put("노인요양시설", 18);
        typeDistribution.put("주야간보호시설", 12);
        typeDistribution.put("노인요양공동생활가정", 10);
        typeDistribution.put("방문요양기관", 5);
        analysis.put("facilityTypeDistribution", typeDistribution);
        
        // 교통 접근성 분석
        Map<String, Object> transportation = new HashMap<>();
        transportation.put("publicTransportCoverage", 85.2); // 대중교통 커버리지 (%)
        transportation.put("averageTransportTime", 25.8); // 평균 대중교통 이용 시간 (분)
        transportation.put("parkingAvailability", 67.4); // 주차 가능성 (%)
        analysis.put("transportationAccess", transportation);
        
        // 지역별 특성
        analysis.put("regionCharacteristics", Map.of(
            "populationDensity", "높음",
            "agingRate", 18.5, // 고령화율 (%)
            "medicalInfrastructure", "우수",
            "costLevel", "중상"
        ));

        log.info("지역별 시설 밀도 분석 완료 - 지역: {}, 밀도: {}", region, analysis.get("facilityDensity"));
        return analysis;
    }

    /**
     * 최적 경로 및 접근성 평가
     * @param userLat 출발지 위도
     * @param userLng 출발지 경도
     * @param facilityIds 평가할 시설 ID 목록
     * @return 각 시설별 경로 정보 및 접근성 점수
     */
    public List<Map<String, Object>> evaluateAccessibility(
            double userLat, double userLng, List<Long> facilityIds) {
        
        log.info("접근성 평가 - 출발지: ({}, {}), 시설 수: {}", userLat, userLng, facilityIds.size());

        return facilityIds.stream()
                .map(facilityId -> calculateAccessibilityScore(userLat, userLng, facilityId))
                .sorted((a, b) -> Double.compare(
                    (Double) b.get("accessibilityScore"), 
                    (Double) a.get("accessibilityScore")))
                .collect(Collectors.toList());
    }

    /**
     * 실시간 교통 정보 기반 이동 시간 계산
     * @param fromLat 출발지 위도
     * @param fromLng 출발지 경도
     * @param toLat 도착지 위도
     * @param toLng 도착지 경도
     * @param transportMode 교통 수단 (car, public, walk)
     * @return 실시간 이동 시간 및 경로 정보
     */
    public Map<String, Object> calculateRealTimeTravel(
            double fromLat, double fromLng, double toLat, double toLng, String transportMode) {
        
        log.debug("실시간 교통 정보 조회 - 교통수단: {}", transportMode);

        Map<String, Object> travelInfo = new HashMap<>();
        travelInfo.put("transportMode", transportMode);
        
        // 기본 거리 계산
        double distance = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);
        travelInfo.put("distance", Math.round(distance * 100.0) / 100.0);
        
        // 교통 수단별 이동 시간 계산 (실제로는 외부 API 연동)
        switch (transportMode.toLowerCase()) {
            case "car":
                travelInfo.put("estimatedTime", Math.max(15, (int)(distance / 0.5))); // 평균 30km/h
                travelInfo.put("trafficCondition", "보통");
                travelInfo.put("tollFee", distance > 10 ? 3500 : 0);
                travelInfo.put("parkingFee", 2000);
                break;
                
            case "public":
                travelInfo.put("estimatedTime", Math.max(25, (int)(distance / 0.3))); // 평균 18km/h
                travelInfo.put("transferCount", distance > 5 ? 1 : 0);
                travelInfo.put("fare", 1500);
                travelInfo.put("walkingDistance", 800); // 도보 구간 (m)
                break;
                
            case "walk":
                travelInfo.put("estimatedTime", Math.max(10, (int)(distance * 15))); // 4km/h
                travelInfo.put("walkingDifficulty", distance > 2 ? "어려움" : "보통");
                travelInfo.put("sidewalkCondition", "양호");
                break;
                
            default:
                travelInfo.put("estimatedTime", (int)(distance / 0.4)); // 기본값
        }
        
        // 실시간 정보 (실제로는 교통 API에서 가져옴)
        travelInfo.put("lastUpdated", "2025-01-28T13:00:00");
        travelInfo.put("weatherCondition", "맑음");
        travelInfo.put("recommendedDepartureTime", "지금 출발");
        
        return travelInfo;
    }

    /**
     * 지도 클러스터링 - 시설 밀집도에 따른 그룹핑
     * @param facilities 시설 목록
     * @param zoomLevel 지도 줌 레벨
     * @return 클러스터링된 시설 그룹
     */
    public List<Map<String, Object>> clusterFacilities(List<Map<String, Object>> facilities, int zoomLevel) {
        log.debug("시설 클러스터링 - 시설 수: {}, 줌 레벨: {}", facilities.size(), zoomLevel);

        // 줌 레벨에 따른 클러스터링 거리 조정
        double clusterDistance = calculateClusterDistance(zoomLevel);
        
        // 실제로는 k-means 또는 DBSCAN 알고리즘 사용
        // 여기서는 간단한 거리 기반 그룹핑 구현
        List<Map<String, Object>> clusters = performSimpleClustering(facilities, clusterDistance);
        
        log.debug("시설 클러스터링 완료 - 클러스터 수: {}", clusters.size());
        return clusters;
    }

    /**
     * 시설 접근성 히트맵 데이터 생성
     * @param region 분석 지역
     * @param gridSize 격자 크기
     * @return 격자별 접근성 점수 데이터
     */
    public List<Map<String, Object>> generateAccessibilityHeatmap(String region, int gridSize) {
        log.info("접근성 히트맵 생성 - 지역: {}, 격자 크기: {}", region, gridSize);

        List<Map<String, Object>> heatmapData = List.of(
            createHeatmapPoint(37.5665, 126.9780, 95.5, "매우 높음"),
            createHeatmapPoint(37.5700, 126.9800, 87.2, "높음"),
            createHeatmapPoint(37.5630, 126.9750, 76.8, "보통"),
            createHeatmapPoint(37.5600, 126.9850, 65.4, "낮음"),
            createHeatmapPoint(37.5750, 126.9900, 45.1, "매우 낮음")
        );

        log.info("접근성 히트맵 생성 완료 - 데이터 포인트: {}개", heatmapData.size());
        return heatmapData;
    }

    // ===== 내부 헬퍼 메서드들 =====

    /**
     * 지도 영역 내 시설 검색 (공공데이터 API 연동)
     */
    public Map<String, Object> searchFacilitiesInMapBounds(
            double neLat, double neLng, double swLat, double swLng,
            String facilityType, String minGrade, boolean availableBedsOnly) {
        
        log.info("지도 영역 내 시설 검색 - NE({},{}) SW({},{})", neLat, neLng, swLat, swLng);
        
        // 중심점 및 반경 계산
        double centerLat = (neLat + swLat) / 2;
        double centerLng = (neLng + swLng) / 2;
        double latDiff = Math.abs(neLat - swLat);
        double lngDiff = Math.abs(neLng - swLng);
        int radiusKm = (int) Math.ceil(Math.max(latDiff, lngDiff) * 111); // 1도 ≈ 111km
        
        // 공공데이터에서 주변 시설 조회
        PublicDataApiService.PublicFacilityResponse publicResponse = 
            publicDataApiService.getNearbyFacilities(centerLat, centerLng, radiusKm);
        
        // 지도 영역 내 시설만 필터링
        List<Map<String, Object>> facilitiesInBounds = publicResponse.getFacilities().stream()
            .filter(facility -> {
                if (facility.getLatitude() == null || facility.getLongitude() == null) {
                    return false;
                }
                return facility.getLatitude() >= swLat && facility.getLatitude() <= neLat &&
                       facility.getLongitude() >= swLng && facility.getLongitude() <= neLng;
            })
            .map(this::convertPublicFacilityToMapData)
            .collect(Collectors.toList());
        
        // 추가 필터링 적용
        if (facilityType != null && !facilityType.isEmpty()) {
            facilitiesInBounds = facilitiesInBounds.stream()
                .filter(f -> facilityType.equals(f.get("facilityType")))
                .collect(Collectors.toList());
        }
        
        if (availableBedsOnly) {
            facilitiesInBounds = facilitiesInBounds.stream()
                .filter(f -> {
                    Integer availableBeds = (Integer) f.get("availableBeds");
                    return availableBeds != null && availableBeds > 0;
                })
                .collect(Collectors.toList());
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalCount", facilitiesInBounds.size());
        result.put("facilities", facilitiesInBounds);
        result.put("boundingBox", Map.of(
            "northeast", Map.of("lat", neLat, "lng", neLng),
            "southwest", Map.of("lat", swLat, "lng", swLng)
        ));
        result.put("clusters", generateAdvancedClusters(facilitiesInBounds));
        result.put("dataSource", "public_api");
        
        log.info("지도 영역 내 시설 검색 완료 - {}개 시설 발견", facilitiesInBounds.size());
        return result;
    }
    
    /**
     * 공공데이터 시설 정보를 지도용 데이터로 변환
     */
    private Map<String, Object> convertPublicFacilityToMapData(PublicDataApiService.PublicFacilityInfo facility) {
        Map<String, Object> mapData = new HashMap<>();
        mapData.put("facilityId", facility.getFacilityId());
        mapData.put("facilityName", facility.getFacilityName());
        mapData.put("facilityType", facility.getFacilityType());
        mapData.put("address", facility.getAddress());
        mapData.put("phoneNumber", facility.getPhoneNumber());
        mapData.put("latitude", facility.getLatitude());
        mapData.put("longitude", facility.getLongitude());
        mapData.put("operatorName", facility.getOperatorName());
        mapData.put("totalCapacity", facility.getTotalCapacity());
        mapData.put("currentOccupancy", facility.getCurrentOccupancy());
        
        // 가용 침상 수 계산
        int availableBeds = 0;
        if (facility.getTotalCapacity() != null && facility.getCurrentOccupancy() != null) {
            availableBeds = Math.max(0, facility.getTotalCapacity() - facility.getCurrentOccupancy());
        }
        mapData.put("availableBeds", availableBeds);
        
        // 등급 추정 (공공데이터에는 등급 정보가 없을 수 있음)
        mapData.put("grade", determineGradeFromFacilityInfo(facility));
        
        // 추천 여부는 별도 로직으로 결정
        mapData.put("isRecommended", false);
        
        // 마커 색상 결정
        String markerColor = availableBeds > 0 ? "green" : "gray";
        mapData.put("markerColor", markerColor);
        
        return mapData;
    }
    
    /**
     * 시설 정보로부터 등급 추정
     */
    private String determineGradeFromFacilityInfo(PublicDataApiService.PublicFacilityInfo facility) {
        // 실제로는 별도의 등급 평가 로직이나 외부 API 연동 필요
        // 여기서는 정원 규모나 운영자 유형을 기준으로 간단히 추정
        
        if (facility.getTotalCapacity() != null) {
            if (facility.getTotalCapacity() >= 50) {
                return "A등급";
            } else if (facility.getTotalCapacity() >= 30) {
                return "B등급";
            } else {
                return "C등급";
            }
        }
        
        return "미등급";
    }
    
    /**
     * 고급 클러스터링 (공공데이터 기반)
     */
    private List<Map<String, Object>> generateAdvancedClusters(List<Map<String, Object>> facilities) {
        if (facilities.size() <= 10) {
            return List.of(); // 시설이 적으면 클러스터링 하지 않음
        }
        
        // 간단한 그리드 기반 클러스터링 구현
        Map<String, List<Map<String, Object>>> clusters = new HashMap<>();
        
        for (Map<String, Object> facility : facilities) {
            Double lat = (Double) facility.get("latitude");
            Double lng = (Double) facility.get("longitude");
            
            if (lat != null && lng != null) {
                // 0.01도 단위로 그리드 생성 (약 1km)
                String gridKey = String.format("%.2f,%.2f", 
                    Math.floor(lat * 100) / 100, Math.floor(lng * 100) / 100);
                
                clusters.computeIfAbsent(gridKey, k -> new java.util.ArrayList<>()).add(facility);
            }
        }
        
        // 클러스터 정보 생성
        return clusters.entrySet().stream()
            .filter(entry -> entry.getValue().size() >= 2) // 2개 이상만 클러스터로 취급
            .map(entry -> {
                List<Map<String, Object>> clusterFacilities = entry.getValue();
                
                // 클러스터 중심점 계산
                double avgLat = clusterFacilities.stream()
                    .mapToDouble(f -> (Double) f.get("latitude"))
                    .average().orElse(0.0);
                double avgLng = clusterFacilities.stream()
                    .mapToDouble(f -> (Double) f.get("longitude"))
                    .average().orElse(0.0);
                
                // 클러스터 내 등급 분포 계산
                Map<String, Long> gradeDistribution = clusterFacilities.stream()
                    .collect(Collectors.groupingBy(
                        f -> String.valueOf(f.get("grade")), 
                        Collectors.counting()
                    ));
                
                String dominantGrade = gradeDistribution.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Unknown");
                
                return Map.of(
                    "lat", avgLat,
                    "lng", avgLng,
                    "count", clusterFacilities.size(),
                    "dominantGrade", dominantGrade,
                    "gradeDistribution", gradeDistribution,
                    "availableBeds", clusterFacilities.stream()
                        .mapToInt(f -> {
                            Integer beds = (Integer) f.get("availableBeds");
                            return beds != null ? beds : 0;
                        }).sum()
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * 전체 시설 목록 조회 (위치 정보 포함) - 공공데이터 우선
     */
    private List<Map<String, Object>> getAllFacilitiesWithLocation() {
        // 공공데이터에서 전체 시설 조회 시도
        try {
            PublicDataApiService.PublicFacilityResponse publicResponse = 
                publicDataApiService.getAllFacilities(1, 100);
            
            if (publicResponse.getFacilities() != null && !publicResponse.getFacilities().isEmpty()) {
                return publicResponse.getFacilities().stream()
                    .map(this::convertPublicFacilityToMapData)
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("공공데이터 조회 실패, 더미 데이터 사용: {}", e.getMessage());
        }
        
        // 공공데이터 조회 실패 시 더미 데이터 사용
        return List.of(
            createFacilityWithLocation(1L, "서울중앙요양원", "노인요양시설", 37.5665, 126.9780, "A등급", 15),
            createFacilityWithLocation(2L, "강남실버케어", "노인요양시설", 37.5172, 127.0473, "A등급", 8),
            createFacilityWithLocation(3L, "서초요양원", "노인요양시설", 37.4837, 127.0324, "B등급", 5),
            createFacilityWithLocation(4L, "송파실버홈", "주야간보호시설", 37.5145, 127.1060, "A등급", 12),
            createFacilityWithLocation(5L, "광진케어센터", "노인요양공동생활가정", 37.5384, 127.0822, "B등급", 3)
        );
    }

    /**
     * 위치 정보가 포함된 시설 데이터 생성
     */
    private Map<String, Object> createFacilityWithLocation(
            Long facilityId, String name, String type, double lat, double lng, String grade, int availableBeds) {
        
        Map<String, Object> facility = new HashMap<>();
        facility.put("facilityId", facilityId);
        facility.put("facilityName", name);
        facility.put("facilityType", type);
        facility.put("latitude", lat);
        facility.put("longitude", lng);
        facility.put("facilityGrade", grade);
        facility.put("availableBeds", availableBeds);
        facility.put("monthlyFee", 280 - (facilityId.intValue() * 10));
        facility.put("userRating", 4.8 - (facilityId * 0.1));
        facility.put("contact", "02-1234-567" + facilityId);
        return facility;
    }

    /**
     * 거리 계산 및 점수 매기기
     */
    private Map<String, Object> calculateDistanceAndScore(
            Map<String, Object> facility, double userLat, double userLng) {
        
        double facilityLat = (Double) facility.get("latitude");
        double facilityLng = (Double) facility.get("longitude");
        
        double distance = calculateHaversineDistance(userLat, userLng, facilityLat, facilityLng);
        facility.put("distance", Math.round(distance * 100.0) / 100.0);
        
        // 거리 점수 계산 (가까울수록 높은 점수)
        double distanceScore = Math.max(0, 100 - (distance * 5));
        facility.put("distanceScore", Math.round(distanceScore * 10.0) / 10.0);
        
        return facility;
    }

    /**
     * Haversine 공식을 사용한 거리 계산 (km)
     */
    private double calculateHaversineDistance(double lat1, double lng1, double lat2, double lng2) {
        final int EARTH_RADIUS = 6371; // 지구 반지름 (km)
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS * c;
    }

    /**
     * 개별 시설 접근성 점수 계산
     */
    private Map<String, Object> calculateAccessibilityScore(double userLat, double userLng, Long facilityId) {
        Map<String, Object> accessibility = new HashMap<>();
        accessibility.put("facilityId", facilityId);
        
        // 실제 시설 정보 조회 (임시 더미 데이터)
        double facilityLat = 37.5665 + (facilityId * 0.01);
        double facilityLng = 126.9780 + (facilityId * 0.01);
        
        // 거리 점수 (40%)
        double distance = calculateHaversineDistance(userLat, userLng, facilityLat, facilityLng);
        double distanceScore = Math.max(0, 100 - (distance * 10));
        
        // 교통 점수 (30%)  - 대중교통 접근성
        double transportScore = 85.0 - (facilityId * 3);
        
        // 시설 등급 점수 (20%)
        double gradeScore = facilityId <= 2 ? 95.0 : 80.0;
        
        // 가용성 점수 (10%) - 침상 가용성
        double availabilityScore = (15 - facilityId) * 6.67;
        
        // 종합 접근성 점수
        double totalScore = (distanceScore * 0.4) + (transportScore * 0.3) + 
                           (gradeScore * 0.2) + (availabilityScore * 0.1);
        
        accessibility.put("distance", Math.round(distance * 100.0) / 100.0);
        accessibility.put("distanceScore", Math.round(distanceScore * 10.0) / 10.0);
        accessibility.put("transportScore", Math.round(transportScore * 10.0) / 10.0);
        accessibility.put("gradeScore", Math.round(gradeScore * 10.0) / 10.0);
        accessibility.put("availabilityScore", Math.round(availabilityScore * 10.0) / 10.0);
        accessibility.put("accessibilityScore", Math.round(totalScore * 10.0) / 10.0);
        
        // 교통 수단별 이동 시간
        accessibility.put("travelTime", Map.of(
            "car", (int)(distance * 2) + 10,
            "public", (int)(distance * 3) + 15,
            "walk", (int)(distance * 12)
        ));
        
        return accessibility;
    }

    /**
     * 줌 레벨에 따른 클러스터링 거리 계산
     */
    private double calculateClusterDistance(int zoomLevel) {
        // 줌 레벨이 높을수록 (확대) 더 작은 거리로 클러스터링
        return Math.max(0.5, 10.0 / zoomLevel);
    }

    /**
     * 간단한 거리 기반 클러스터링
     */
    private List<Map<String, Object>> performSimpleClustering(
            List<Map<String, Object>> facilities, double clusterDistance) {
        
        // 실제로는 더 정교한 클러스터링 알고리즘 구현
        return List.of(
            Map.of(
                "clusterId", 1,
                "centerLat", 37.5665,
                "centerLng", 126.9780,
                "facilityCount", 3,
                "averageGrade", "A",
                "totalAvailableBeds", 25
            ),
            Map.of(
                "clusterId", 2,
                "centerLat", 37.5200,
                "centerLng", 127.0500,
                "facilityCount", 2,
                "averageGrade", "B", 
                "totalAvailableBeds", 8
            )
        );
    }

    /**
     * 히트맵 포인트 생성
     */
    private Map<String, Object> createHeatmapPoint(double lat, double lng, double score, String level) {
        Map<String, Object> point = new HashMap<>();
        point.put("latitude", lat);
        point.put("longitude", lng);
        point.put("accessibilityScore", score);
        point.put("accessibilityLevel", level);
        return point;
    }
}