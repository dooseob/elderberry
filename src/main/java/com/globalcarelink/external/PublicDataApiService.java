package com.globalcarelink.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 보건복지부 공공데이터 API 연동 서비스
 * - 요양기관 현황 조회
 * - 장기요양기관 현황 조회
 * - 지역별 시설 검색
 * - 실시간 데이터 동기화
 */
@Service("externalPublicDataApiService")
@RequiredArgsConstructor
@Slf4j
public class PublicDataApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${PUBLIC_DATA_API_KEY:development-default-key}")
    private String publicDataApiKey;

    @Value("${public.data.base.url:https://api.data.go.kr}")
    private String publicDataBaseUrl;

    // 요양기관 현황 API 엔드포인트
    private static final String LTCI_FACILITY_ENDPOINT = "/1471000/LtciInstInfoService/getLtciInstInfo";
    
    // 의료기관 찾기 API 엔드포인트  
    private static final String MEDICAL_FACILITY_ENDPOINT = "/1360000/MedicalKitService/getStoreInfoInDtlByPharmaName";

    /**
     * 전국 요양기관 현황 조회
     */
    @Cacheable(value = "facilityData", key = "'all_facilities_' + #pageNo + '_' + #numOfRows")
    public PublicFacilityResponse getAllFacilities(int pageNo, int numOfRows) {
        log.info("공공데이터 요양기관 전체 조회 - 페이지: {}, 크기: {}", pageNo, numOfRows);

        try {
            URI uri = UriComponentsBuilder
                    .fromHttpUrl(publicDataBaseUrl + LTCI_FACILITY_ENDPOINT)
                    .queryParam("serviceKey", publicDataApiKey)
                    .queryParam("pageNo", pageNo)
                    .queryParam("numOfRows", numOfRows)
                    .queryParam("_type", "json")
                    .build(true)
                    .toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                PublicFacilityApiResponse apiResponse = objectMapper.readValue(
                    response.getBody(), PublicFacilityApiResponse.class);
                
                return convertToPublicFacilityResponse(apiResponse);
            }
            
            log.warn("공공데이터 API 호출 실패 - 상태코드: {}", response.getStatusCode());
            return createEmptyResponse();
            
        } catch (Exception e) {
            log.error("공공데이터 API 호출 중 오류 발생", e);
            return createEmptyResponse();
        }
    }

    /**
     * 지역별 요양기관 검색
     */
    @Cacheable(value = "facilityData", key = "'region_facilities_' + #sido + '_' + #sigungu")
    public PublicFacilityResponse getFacilitiesByRegion(String sido, String sigungu) {
        log.info("지역별 요양기관 조회 - 시도: {}, 시군구: {}", sido, sigungu);

        try {
            URI uri = UriComponentsBuilder
                    .fromHttpUrl(publicDataBaseUrl + LTCI_FACILITY_ENDPOINT)
                    .queryParam("serviceKey", publicDataApiKey)
                    .queryParam("sido", sido)
                    .queryParam("sigungu", sigungu)
                    .queryParam("pageNo", 1)
                    .queryParam("numOfRows", 100)
                    .queryParam("_type", "json")
                    .build(true)
                    .toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                PublicFacilityApiResponse apiResponse = objectMapper.readValue(
                    response.getBody(), PublicFacilityApiResponse.class);
                
                return convertToPublicFacilityResponse(apiResponse);
            }
            
            return createEmptyResponse();
            
        } catch (Exception e) {
            log.error("지역별 공공데이터 API 호출 중 오류 발생", e);
            return createEmptyResponse();
        }
    }

    /**
     * 시설명으로 검색
     */
    @Cacheable(value = "facilityData", key = "'search_facilities_' + #facilityName")
    public PublicFacilityResponse searchFacilitiesByName(String facilityName) {
        log.info("시설명 검색 - 검색어: {}", facilityName);

        try {
            URI uri = UriComponentsBuilder
                    .fromHttpUrl(publicDataBaseUrl + LTCI_FACILITY_ENDPOINT)
                    .queryParam("serviceKey", publicDataApiKey)
                    .queryParam("instNm", facilityName)
                    .queryParam("pageNo", 1)
                    .queryParam("numOfRows", 50)
                    .queryParam("_type", "json")
                    .build(true)
                    .toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                PublicFacilityApiResponse apiResponse = objectMapper.readValue(
                    response.getBody(), PublicFacilityApiResponse.class);
                
                return convertToPublicFacilityResponse(apiResponse);
            }
            
            return createEmptyResponse();
            
        } catch (Exception e) {
            log.error("시설명 검색 중 오류 발생", e);
            return createEmptyResponse();
        }
    }

    /**
     * 특정 시설 상세 정보 조회
     */
    @Cacheable(value = "facilityDetail", key = "'facility_detail_' + #facilityId")
    public PublicFacilityDetail getFacilityDetail(String facilityId) {
        log.info("시설 상세정보 조회 - ID: {}", facilityId);

        try {
            URI uri = UriComponentsBuilder
                    .fromHttpUrl(publicDataBaseUrl + LTCI_FACILITY_ENDPOINT)
                    .queryParam("serviceKey", publicDataApiKey)
                    .queryParam("instId", facilityId)
                    .queryParam("_type", "json")
                    .build(true)
                    .toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                PublicFacilityApiResponse apiResponse = objectMapper.readValue(
                    response.getBody(), PublicFacilityApiResponse.class);
                
                if (apiResponse.getResponse() != null && 
                    apiResponse.getResponse().getBody() != null &&
                    apiResponse.getResponse().getBody().getItems() != null &&
                    !apiResponse.getResponse().getBody().getItems().isEmpty()) {
                    
                    return convertToFacilityDetail(apiResponse.getResponse().getBody().getItems().get(0));
                }
            }
            
            return null;
            
        } catch (Exception e) {
            log.error("시설 상세정보 조회 중 오류 발생", e);
            return null;
        }
    }

    /**
     * 좌표 기반 주변 시설 검색 (반경 내 검색)
     */
    public PublicFacilityResponse getNearbyFacilities(double latitude, double longitude, int radiusKm) {
        log.info("좌표 기반 주변 시설 검색 - 위도: {}, 경도: {}, 반경: {}km", latitude, longitude, radiusKm);

        // 공공데이터 API는 좌표 기반 검색을 직접 지원하지 않으므로
        // 전체 데이터를 가져와서 클라이언트에서 필터링
        PublicFacilityResponse allFacilities = getAllFacilities(1, 1000);
        
        if (allFacilities.getFacilities() != null) {
            List<PublicFacilityInfo> nearbyFacilities = allFacilities.getFacilities().stream()
                .filter(facility -> {
                    if (facility.getLatitude() == null || facility.getLongitude() == null) {
                        return false;
                    }
                    double distance = calculateDistance(
                        latitude, longitude, 
                        facility.getLatitude(), facility.getLongitude()
                    );
                    return distance <= radiusKm;
                })
                .collect(Collectors.toList());
            
            return PublicFacilityResponse.builder()
                .totalCount(nearbyFacilities.size())
                .facilities(nearbyFacilities)
                .pageNo(1)
                .numOfRows(nearbyFacilities.size())
                .build();
        }
        
        return createEmptyResponse();
    }

    /**
     * API 응답을 내부 형식으로 변환
     */
    private PublicFacilityResponse convertToPublicFacilityResponse(PublicFacilityApiResponse apiResponse) {
        if (apiResponse == null || apiResponse.getResponse() == null || 
            apiResponse.getResponse().getBody() == null) {
            return createEmptyResponse();
        }

        PublicFacilityApiResponse.Body body = apiResponse.getResponse().getBody();
        
        List<PublicFacilityInfo> facilities = null;
        if (body.getItems() != null) {
            facilities = body.getItems().stream()
                .map(this::convertToFacilityInfo)
                .collect(Collectors.toList());
        }

        return PublicFacilityResponse.builder()
            .totalCount(body.getTotalCount() != null ? body.getTotalCount() : 0)
            .facilities(facilities)
            .pageNo(body.getPageNo() != null ? body.getPageNo() : 1)
            .numOfRows(body.getNumOfRows() != null ? body.getNumOfRows() : 0)
            .build();
    }

    /**
     * API 아이템을 시설 정보로 변환
     */
    private PublicFacilityInfo convertToFacilityInfo(PublicFacilityApiResponse.Item item) {
        return PublicFacilityInfo.builder()
            .facilityId(item.getInstId())
            .facilityName(item.getInstNm())
            .facilityType(item.getInstTypeCd())
            .address(item.getAddr())
            .sido(item.getSido())
            .sigungu(item.getSigungu())
            .zipCode(item.getZipCd())
            .phoneNumber(item.getTelno())
            .faxNumber(item.getFaxno())
            .establishedDate(item.getEstbDt())
            .operatorName(item.getOperNm())
            .operatorType(item.getOperTypeCd())
            .totalCapacity(parseIntegerSafely(item.getTotCapa()))
            .currentOccupancy(parseIntegerSafely(item.getCurrUseNum()))
            .latitude(parseDoubleSafely(item.getYPos()))
            .longitude(parseDoubleSafely(item.getXPos()))
            .lastUpdated(item.getLastUpdtDt())
            .build();
    }

    /**
     * 상세 정보로 변환
     */
    private PublicFacilityDetail convertToFacilityDetail(PublicFacilityApiResponse.Item item) {
        return PublicFacilityDetail.builder()
            .facilityInfo(convertToFacilityInfo(item))
            .medicalStaff(Map.of("totalStaff", parseIntegerSafely(item.getTotStafNum())))
            .specializedServices(List.of()) // 추가 데이터가 있다면 파싱
            .certifications(List.of())
            .build();
    }

    /**
     * 두 좌표 간 거리 계산 (하버사인 공식)
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 지구 반지름 (km)
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    /**
     * 안전한 정수 파싱
     */
    private Integer parseIntegerSafely(String value) {
        try {
            return value != null && !value.trim().isEmpty() ? Integer.parseInt(value.trim()) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 안전한 실수 파싱
     */
    private Double parseDoubleSafely(String value) {
        try {
            return value != null && !value.trim().isEmpty() ? Double.parseDouble(value.trim()) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 빈 응답 생성
     */
    private PublicFacilityResponse createEmptyResponse() {
        return PublicFacilityResponse.builder()
            .totalCount(0)
            .facilities(List.of())
            .pageNo(1)
            .numOfRows(0)
            .build();
    }

    // ===== DTO 클래스들 =====

    /**
     * 공공데이터 API 응답 구조
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PublicFacilityApiResponse {
        private Response response;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Response {
            private Header header;
            private Body body;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Header {
            private String resultCode;
            private String resultMsg;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Body {
            private List<Item> items;
            private Integer totalCount;
            private Integer pageNo;
            private Integer numOfRows;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Item {
            @JsonProperty("instId")
            private String instId;        // 기관ID
            
            @JsonProperty("instNm") 
            private String instNm;        // 기관명
            
            @JsonProperty("instTypeCd")
            private String instTypeCd;    // 기관유형코드
            
            @JsonProperty("addr")
            private String addr;          // 주소
            
            @JsonProperty("sido")
            private String sido;          // 시도
            
            @JsonProperty("sigungu")
            private String sigungu;       // 시군구
            
            @JsonProperty("zipCd")
            private String zipCd;         // 우편번호
            
            @JsonProperty("telno")
            private String telno;         // 전화번호
            
            @JsonProperty("faxno")
            private String faxno;         // 팩스번호
            
            @JsonProperty("estbDt")
            private String estbDt;        // 설립일자
            
            @JsonProperty("operNm")
            private String operNm;        // 운영자명
            
            @JsonProperty("operTypeCd")
            private String operTypeCd;    // 운영자유형코드
            
            @JsonProperty("totCapa")
            private String totCapa;       // 총정원
            
            @JsonProperty("currUseNum")
            private String currUseNum;    // 현재이용자수
            
            @JsonProperty("xPos")
            private String xPos;          // X좌표(경도)
            
            @JsonProperty("yPos")
            private String yPos;          // Y좌표(위도)
            
            @JsonProperty("lastUpdtDt")
            private String lastUpdtDt;    // 최종수정일시
            
            @JsonProperty("totStafNum")
            private String totStafNum;    // 총직원수
        }
    }

    /**
     * 내부 사용 시설 정보 DTO
     */
    @Data
    @lombok.Builder
    public static class PublicFacilityInfo {
        private String facilityId;
        private String facilityName;
        private String facilityType;
        private String address;
        private String sido;
        private String sigungu;
        private String zipCode;
        private String phoneNumber;
        private String faxNumber;
        private String establishedDate;
        private String operatorName;
        private String operatorType;
        private Integer totalCapacity;
        private Integer currentOccupancy;
        private Double latitude;
        private Double longitude;
        private String lastUpdated;
    }

    /**
     * 시설 상세 정보 DTO
     */
    @Data
    @lombok.Builder
    public static class PublicFacilityDetail {
        private PublicFacilityInfo facilityInfo;
        private Map<String, Object> medicalStaff;
        private List<String> specializedServices;
        private List<String> certifications;
    }

    /**
     * API 응답 래퍼 DTO
     */
    @Data
    @lombok.Builder
    public static class PublicFacilityResponse {
        private Integer totalCount;
        private List<PublicFacilityInfo> facilities;
        private Integer pageNo;
        private Integer numOfRows;
    }
}