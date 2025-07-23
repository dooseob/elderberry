package com.globalcarelink.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * 공공데이터 포털 API 통합 클라이언트
 * 장기요양기관, 병원, 약국 등의 정보를 공공 API를 통해 조회하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PublicDataApiClient {

    private final WebClient webClient;

    @Value("${app.public-data.api-key:CCXHQiSSQ0J+RRaadSjmmS7ltxG/tlSVOYMjh45MmGne68ptgGAaAJVJti8nBazSjLemTAyb5gAuj43xq7fTog==}")
    private String apiKey;

    @Value("${app.public-data.base-url:https://apis.data.go.kr}")
    private String baseUrl;

    // API 엔드포인트 상수들
    private static final String LTCI_SEARCH_ENDPOINT = "/B550928/searchLtcInsttService01/getLtcInsttSeachList01";
    private static final String LTCI_DETAIL_ENDPOINT = "/B550928/getLtcInsttDetailInfoService02/getLtcInsttDetailInfo02";
    private static final String HOSPITAL_INFO_ENDPOINT = "/B551182/hospInfoServicev2/getHospBasisList2";
    private static final String PHARMACY_INFO_ENDPOINT = "/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire";
    private static final String FACILITY_STATUS_ENDPOINT = "/B551182/yadmOpCloInfoService2/getYadmOpCloInfo2";

    // ===== 장기요양기관 검색 API =====

    /**
     * 지역별 장기요양기관 검색
     * 
     * @param region 지역명 (예: "서울특별시", "부산광역시")
     * @param facilityType 시설 타입 (선택사항)
     * @param pageNo 페이지 번호 (기본값: 1)
     * @param numOfRows 한 페이지당 결과 수 (기본값: 100)
     * @return 장기요양기관 검색 결과
     */
    @Cacheable(value = "ltciSearch", key = "#region + '_' + #facilityType + '_' + #pageNo")
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    public Mono<LtciSearchResponse> searchLongTermCareInstitutions(
            String region, String facilityType, Integer pageNo, Integer numOfRows) {
        
        log.info("장기요양기관 검색 요청 - 지역: {}, 타입: {}, 페이지: {}", region, facilityType, pageNo);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(LTCI_SEARCH_ENDPOINT)
                        .queryParam("serviceKey", apiKey)
                        .queryParam("siDo", region)
                        .queryParam("pageNo", pageNo != null ? pageNo : 1)
                        .queryParam("numOfRows", numOfRows != null ? numOfRows : 100)
                        .queryParam("_type", "json")
                        .queryParamIfPresent("ltcInsttType", java.util.Optional.ofNullable(facilityType))
                        .build())
                .retrieve()
                .onStatus(HttpStatus::isError, response -> {
                    log.error("장기요양기관 검색 API 오류 - 상태 코드: {}", response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new PublicDataApiException(
                                    "장기요양기관 검색 실패: " + errorBody, response.statusCode())));
                })
                .bodyToMono(LtciSearchResponse.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> !(throwable instanceof WebClientResponseException) ||
                                ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                .doOnSuccess(response -> log.info("장기요양기관 검색 성공 - 결과 수: {}", 
                        response != null && response.getResponse() != null && response.getResponse().getBody() != null 
                        ? response.getResponse().getBody().getItems().size() : 0))
                .doOnError(error -> log.error("장기요양기관 검색 실패", error));
    }

    /**
     * 장기요양기관 상세 정보 조회
     * 
     * @param institutionId 기관 ID
     * @return 장기요양기관 상세 정보
     */
    @Cacheable(value = "ltciDetail", key = "#institutionId")
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    public Mono<LtciDetailResponse> getLongTermCareInstitutionDetail(String institutionId) {
        
        log.info("장기요양기관 상세 정보 조회 - ID: {}", institutionId);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(LTCI_DETAIL_ENDPOINT)
                        .queryParam("serviceKey", apiKey)
                        .queryParam("ltcInsttCd", institutionId)
                        .queryParam("_type", "json")
                        .build())
                .retrieve()
                .onStatus(HttpStatus::isError, response -> {
                    log.error("장기요양기관 상세 조회 API 오류 - 상태 코드: {}", response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new PublicDataApiException(
                                    "장기요양기관 상세 조회 실패: " + errorBody, response.statusCode())));
                })
                .bodyToMono(LtciDetailResponse.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> !(throwable instanceof WebClientResponseException) ||
                                ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                .doOnSuccess(response -> log.info("장기요양기관 상세 정보 조회 성공 - ID: {}", institutionId))
                .doOnError(error -> log.error("장기요양기관 상세 정보 조회 실패 - ID: {}", institutionId, error));
    }

    // ===== 병원 정보 API =====

    /**
     * 지역별 병원 정보 검색
     * 
     * @param region 지역명
     * @param hospitalType 병원 타입 (선택사항)
     * @param pageNo 페이지 번호
     * @param numOfRows 한 페이지당 결과 수
     * @return 병원 정보 검색 결과
     */
    @Cacheable(value = "hospitalSearch", key = "#region + '_' + #hospitalType + '_' + #pageNo")
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    public Mono<HospitalSearchResponse> searchHospitals(
            String region, String hospitalType, Integer pageNo, Integer numOfRows) {
        
        log.info("병원 정보 검색 요청 - 지역: {}, 타입: {}, 페이지: {}", region, hospitalType, pageNo);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(HOSPITAL_INFO_ENDPOINT)
                        .queryParam("serviceKey", apiKey)
                        .queryParam("sidoCd", region)
                        .queryParam("pageNo", pageNo != null ? pageNo : 1)
                        .queryParam("numOfRows", numOfRows != null ? numOfRows : 100)
                        .queryParam("_type", "json")
                        .queryParamIfPresent("clCd", java.util.Optional.ofNullable(hospitalType))
                        .build())
                .retrieve()
                .onStatus(HttpStatus::isError, response -> {
                    log.error("병원 정보 검색 API 오류 - 상태 코드: {}", response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new PublicDataApiException(
                                    "병원 정보 검색 실패: " + errorBody, response.statusCode())));
                })
                .bodyToMono(HospitalSearchResponse.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> !(throwable instanceof WebClientResponseException) ||
                                ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                .doOnSuccess(response -> log.info("병원 정보 검색 성공 - 결과 수: {}", 
                        response != null && response.getResponse() != null && response.getResponse().getBody() != null 
                        ? response.getResponse().getBody().getItems().size() : 0))
                .doOnError(error -> log.error("병원 정보 검색 실패", error));
    }

    // ===== 약국 정보 API =====

    /**
     * 지역별 약국 정보 검색
     * 
     * @param region 지역명
     * @param pageNo 페이지 번호
     * @param numOfRows 한 페이지당 결과 수
     * @return 약국 정보 검색 결과
     */
    @Cacheable(value = "pharmacySearch", key = "#region + '_' + #pageNo")
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    public Mono<PharmacySearchResponse> searchPharmacies(String region, Integer pageNo, Integer numOfRows) {
        
        log.info("약국 정보 검색 요청 - 지역: {}, 페이지: {}", region, pageNo);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(PHARMACY_INFO_ENDPOINT)
                        .queryParam("serviceKey", apiKey)
                        .queryParam("Q0", region)
                        .queryParam("pageNo", pageNo != null ? pageNo : 1)
                        .queryParam("numOfRows", numOfRows != null ? numOfRows : 100)
                        .queryParam("_type", "json")
                        .build())
                .retrieve()
                .onStatus(HttpStatus::isError, response -> {
                    log.error("약국 정보 검색 API 오류 - 상태 코드: {}", response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new PublicDataApiException(
                                    "약국 정보 검색 실패: " + errorBody, response.statusCode())));
                })
                .bodyToMono(PharmacySearchResponse.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> !(throwable instanceof WebClientResponseException) ||
                                ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                .doOnSuccess(response -> log.info("약국 정보 검색 성공 - 결과 수: {}", 
                        response != null && response.getResponse() != null && response.getResponse().getBody() != null 
                        ? response.getResponse().getBody().getItems().size() : 0))
                .doOnError(error -> log.error("약국 정보 검색 실패", error));
    }

    // ===== 시설 운영 상태 API =====

    /**
     * 요양기관 개폐업 정보 조회
     * 
     * @param institutionId 기관 ID
     * @return 요양기관 운영 상태 정보
     */
    @Cacheable(value = "facilityStatus", key = "#institutionId")
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    public Mono<FacilityStatusResponse> getFacilityOperationStatus(String institutionId) {
        
        log.info("요양기관 운영 상태 조회 - ID: {}", institutionId);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(FACILITY_STATUS_ENDPOINT)
                        .queryParam("serviceKey", apiKey)
                        .queryParam("ykiho", institutionId)
                        .queryParam("_type", "json")
                        .build())
                .retrieve()
                .onStatus(HttpStatus::isError, response -> {
                    log.error("요양기관 운영 상태 조회 API 오류 - 상태 코드: {}", response.statusCode());
                    return response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new PublicDataApiException(
                                    "요양기관 운영 상태 조회 실패: " + errorBody, response.statusCode())));
                })
                .bodyToMono(FacilityStatusResponse.class)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> !(throwable instanceof WebClientResponseException) ||
                                ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                .doOnSuccess(response -> log.info("요양기관 운영 상태 조회 성공 - ID: {}", institutionId))
                .doOnError(error -> log.error("요양기관 운영 상태 조회 실패 - ID: {}", institutionId, error));
    }

    // ===== 유틸리티 메서드 =====

    /**
     * API 상태 확인 (헬스체크)
     * 
     * @return API 서비스 상태
     */
    public Mono<Boolean> checkApiHealth() {
        log.info("공공데이터 API 상태 확인 중...");
        
        // 간단한 검색 요청으로 API 상태 확인
        return searchLongTermCareInstitutions("서울특별시", null, 1, 1)
                .map(response -> response != null && response.getResponse() != null)
                .onErrorReturn(false)
                .doOnNext(isHealthy -> log.info("공공데이터 API 상태: {}", isHealthy ? "정상" : "오류"));
    }

    /**
     * API 호출 통계 정보 조회
     * 
     * @return API 호출 통계 정보
     */
    public Mono<Map<String, Object>> getApiStatistics() {
        log.info("API 호출 통계 정보 조회");
        
        // 실제 구현에서는 API 호출 횟수, 성공률, 평균 응답 시간 등을 추적
        Map<String, Object> stats = Map.of(
                "totalCalls", 0,
                "successRate", 100.0,
                "averageResponseTime", "500ms",
                "lastUpdateTime", System.currentTimeMillis()
        );
        
        return Mono.just(stats);
    }

    /**
     * 지역 코드 변환 유틸리티
     * 
     * @param regionName 지역명 (한글)
     * @return 지역 코드
     */
    public String convertRegionNameToCode(String regionName) {
        // 실제 구현에서는 지역명을 API에서 요구하는 코드로 변환
        Map<String, String> regionCodeMap = Map.of(
                "서울특별시", "11",
                "부산광역시", "26",
                "대구광역시", "27",
                "인천광역시", "28",
                "광주광역시", "29",
                "대전광역시", "30",
                "울산광역시", "31",
                "세종특별자치시", "36",
                "경기도", "41",
                "강원도", "42",
                "충청북도", "43",
                "충청남도", "44",
                "전라북도", "45",
                "전라남도", "46",
                "경상북도", "47",
                "경상남도", "48",
                "제주특별자치도", "50"
        );
        
        return regionCodeMap.getOrDefault(regionName, regionName);
    }
} 