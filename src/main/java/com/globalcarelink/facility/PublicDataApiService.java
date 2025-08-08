package com.globalcarelink.facility;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

/**
 * 공공데이터 API 연동 서비스
 * 국민건강보험공단 장기요양기관 정보를 실시간으로 조회
 */
@Slf4j
@Service("facilityPublicDataApiService")
@RequiredArgsConstructor
public class PublicDataApiService {

    private final WebClient webClient;

    @Value("${external.api.public-data.service-key-encoded}")
    private String serviceKey;

    @Value("${external.api.public-data.endpoints.ltc-search}")
    private String ltcSearchEndpoint;

    @Value("${external.api.public-data.endpoints.ltc-detail}")
    private String ltcDetailEndpoint;

    @Value("${external.api.public-data.endpoints.ltc-evaluation}")
    private String ltcEvaluationEndpoint;

    @Value("${external.api.public-data.endpoints.hospital}")
    private String hospitalEndpoint;

    @Value("${external.api.public-data.endpoints.pharmacy}")
    private String pharmacyEndpoint;

    /**
     * 장기요양기관 검색 API 호출
     * @param params 검색 파라미터 (시도, 시군구, 기관유형 등)
     * @return 검색 결과
     */
    public Mono<String> searchLtcFacilities(Map<String, String> params) {
        log.info("장기요양기관 검색 API 호출 - 파라미터: {}", params);
        
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.scheme("https")
                            .host(extractHost(ltcSearchEndpoint))
                            .path(extractPath(ltcSearchEndpoint))
                            .queryParam("serviceKey", serviceKey)
                            .queryParam("numOfRows", params.getOrDefault("numOfRows", "10"))
                            .queryParam("pageNo", params.getOrDefault("pageNo", "1"));
                    
                    // 선택적 파라미터 추가
                    params.forEach((key, value) -> {
                        if (!key.equals("numOfRows") && !key.equals("pageNo")) {
                            uriBuilder.queryParam(key, value);
                        }
                    });
                    
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10))
                .doOnSuccess(response -> log.debug("장기요양기관 검색 성공"))
                .doOnError(error -> log.error("장기요양기관 검색 실패", error));
    }

    /**
     * 장기요양기관 상세정보 조회
     * @param adminSymbol 기관기호
     * @return 상세정보
     */
    public Mono<String> getLtcFacilityDetail(String adminSymbol) {
        log.info("장기요양기관 상세정보 조회 - 기관기호: {}", adminSymbol);
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host(extractHost(ltcDetailEndpoint))
                        .path(extractPath(ltcDetailEndpoint))
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("adminSym", adminSymbol)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10))
                .doOnSuccess(response -> log.debug("장기요양기관 상세정보 조회 성공"))
                .doOnError(error -> log.error("장기요양기관 상세정보 조회 실패", error));
    }

    /**
     * 장기요양기관 평가 결과 조회
     * @param facilityName 시설명
     * @return 평가 결과
     */
    public Mono<String> getLtcEvaluationResult(String facilityName) {
        log.info("장기요양기관 평가 결과 조회 - 시설명: {}", facilityName);
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host(extractHost(ltcEvaluationEndpoint))
                        .path("/15050093/v1/uddi:c8bb7e37-e6f2-484f-9047-4f7fb4afa484")
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("page", 1)
                        .queryParam("perPage", 10)
                        .queryParam("cond[장기요양기관명::LIKE]", facilityName)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10))
                .doOnSuccess(response -> log.debug("장기요양기관 평가 결과 조회 성공"))
                .doOnError(error -> log.error("장기요양기관 평가 결과 조회 실패", error));
    }

    /**
     * 주변 병원 정보 조회
     * @param params 검색 파라미터 (좌표, 반경 등)
     * @return 병원 목록
     */
    public Mono<String> searchNearbyHospitals(Map<String, String> params) {
        log.info("주변 병원 정보 조회 - 파라미터: {}", params);
        
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.scheme("https")
                            .host(extractHost(hospitalEndpoint))
                            .path(extractPath(hospitalEndpoint) + "/getHospBasisList")
                            .queryParam("serviceKey", serviceKey)
                            .queryParam("numOfRows", params.getOrDefault("numOfRows", "10"))
                            .queryParam("pageNo", params.getOrDefault("pageNo", "1"));
                    
                    params.forEach((key, value) -> {
                        if (!key.equals("numOfRows") && !key.equals("pageNo")) {
                            uriBuilder.queryParam(key, value);
                        }
                    });
                    
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10))
                .doOnSuccess(response -> log.debug("주변 병원 정보 조회 성공"))
                .doOnError(error -> log.error("주변 병원 정보 조회 실패", error));
    }

    /**
     * 주변 약국 정보 조회
     * @param params 검색 파라미터 (좌표, 반경 등)
     * @return 약국 목록
     */
    public Mono<String> searchNearbyPharmacies(Map<String, String> params) {
        log.info("주변 약국 정보 조회 - 파라미터: {}", params);
        
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.scheme("https")
                            .host(extractHost(pharmacyEndpoint))
                            .path(extractPath(pharmacyEndpoint) + "/getParmacyBasisList")
                            .queryParam("serviceKey", serviceKey)
                            .queryParam("numOfRows", params.getOrDefault("numOfRows", "10"))
                            .queryParam("pageNo", params.getOrDefault("pageNo", "1"));
                    
                    params.forEach((key, value) -> {
                        if (!key.equals("numOfRows") && !key.equals("pageNo")) {
                            uriBuilder.queryParam(key, value);
                        }
                    });
                    
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(10))
                .doOnSuccess(response -> log.debug("주변 약국 정보 조회 성공"))
                .doOnError(error -> log.error("주변 약국 정보 조회 실패", error));
    }

    /**
     * 보건복지부 노인복지시설 조회
     */
    public Mono<Map<String, Object>> getElderlyFacilitiesFromPublicData(String region, String facilityType, int pageNo, int numOfRows) {
        log.info("보건복지부 노인복지시설 조회 - 지역: {}, 유형: {}", region, facilityType);
        
        Map<String, String> params = Map.of(
            "numOfRows", String.valueOf(numOfRows),
            "pageNo", String.valueOf(pageNo),
            "siDo", region != null ? region : "",
            "sgguNm", facilityType != null ? facilityType : ""
        );
        
        return searchLtcFacilities(params)
                .map(response -> Map.of("result", response, "source", "보건복지부"));
    }

    /**
     * 건강보험공단 장기요양기관 조회
     */
    public Mono<Map<String, Object>> getLtciFacilitiesFromPublicData(String region, String careType, int pageNo, int numOfRows) {
        log.info("건강보험공단 장기요양기관 조회 - 지역: {}, 급여유형: {}", region, careType);
        
        Map<String, String> params = Map.of(
            "numOfRows", String.valueOf(numOfRows),
            "pageNo", String.valueOf(pageNo),
            "siDo", region != null ? region : "",
            "careType", careType != null ? careType : ""
        );
        
        return searchLtcFacilities(params)
                .map(response -> Map.of("result", response, "source", "국민건강보험공단"));
    }

    /**
     * 시설 상세 정보 조회
     */
    public Mono<Map<String, Object>> getFacilityDetailFromPublicData(String facilityId, String dataSource) {
        log.info("시설 상세 정보 조회 - ID: {}, 소스: {}", facilityId, dataSource);
        
        return getLtcFacilityDetail(facilityId)
                .map(response -> Map.of("detail", response, "source", dataSource));
    }

    /**
     * 지역별 시설 현황 통계
     */
    public Mono<Map<String, Object>> getFacilityStatisticsByRegion(String region) {
        log.info("지역별 시설 현황 통계 조회 - 지역: {}", region);
        
        Map<String, String> params = Map.of(
            "siDo", region,
            "numOfRows", "100",
            "pageNo", "1"
        );
        
        return searchLtcFacilities(params)
                .map(response -> Map.of(
                    "region", region,
                    "statistics", response,
                    "generatedAt", java.time.LocalDateTime.now()
                ));
    }

    /**
     * 실시간 시설 가용성 체크
     */
    public Mono<java.util.List<Map<String, Object>>> checkFacilityAvailability(java.util.List<String> facilityIds) {
        log.info("실시간 시설 가용성 체크 - 시설 수: {}", facilityIds.size());
        
        // 각 시설에 대한 가용성 체크 (병렬 처리)
        return reactor.core.publisher.Flux.fromIterable(facilityIds)
                .flatMap(id -> getLtcFacilityDetail(id)
                        .map(detail -> {
                            Map<String, Object> result = new java.util.HashMap<>();
                            result.put("facilityId", id);
                            result.put("available", true);
                            result.put("lastChecked", java.time.LocalDateTime.now());
                            result.put("detail", detail);
                            return result;
                        })
                        .onErrorResume(error -> {
                            Map<String, Object> errorResult = new java.util.HashMap<>();
                            errorResult.put("facilityId", id);
                            errorResult.put("available", false);
                            errorResult.put("lastChecked", java.time.LocalDateTime.now());
                            errorResult.put("error", "조회 실패");
                            return Mono.just(errorResult);
                        }))
                .collectList();
    }

    /**
     * URL에서 호스트 추출
     */
    private String extractHost(String url) {
        return url.replace("https://", "").split("/")[0];
    }

    /**
     * URL에서 경로 추출
     */
    private String extractPath(String url) {
        String withoutProtocol = url.replace("https://", "");
        int firstSlash = withoutProtocol.indexOf("/");
        return firstSlash > 0 ? withoutProtocol.substring(firstSlash) : "";
    }
}