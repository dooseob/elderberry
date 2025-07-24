package com.globalcarelink.external;

import com.globalcarelink.external.dto.LtciDetailResponse;
import com.globalcarelink.external.dto.LtciSearchResponse;
import com.globalcarelink.external.dto.FacilityStatusResponse;
import com.globalcarelink.facility.FacilityProfile;
import com.globalcarelink.facility.FacilityProfileRepository;
import com.globalcarelink.facility.FacilityProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * 공공데이터 API에서 수집한 시설 정보를 시스템 내 FacilityProfile과 동기화하는 서비스
 * 데이터 매핑, 업데이트 로직, 중복 처리, 상태 관리 등을 담당
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FacilitySyncService {

    private final PublicDataApiClient publicDataApiClient;
    private final FacilityProfileRepository facilityProfileRepository;
    private final FacilityProfileService facilityProfileService;

    // 지역 코드 매핑 (공공데이터 API 코드 -> 우리 시스템 코드)
    private static final Map<String, String> REGION_CODE_MAP = createRegionCodeMap();
    
    private static Map<String, String> createRegionCodeMap() {
        Map<String, String> map = new HashMap<>();
        map.put("11", "서울특별시");
        map.put("26", "부산광역시");
        map.put("27", "대구광역시");
        map.put("28", "인천광역시");
        map.put("29", "광주광역시");
        map.put("30", "대전광역시");
        map.put("31", "울산광역시");
        map.put("36", "세종특별자치시");
        map.put("41", "경기도");
        map.put("42", "강원특별자치도");
        map.put("43", "충청북도");
        map.put("44", "충청남도");
        map.put("45", "전북특별자치도");
        map.put("46", "전라남도");
        map.put("47", "경상북도");
        map.put("48", "경상남도");
        map.put("50", "제주특별자치도");
        return Collections.unmodifiableMap(map);
    }

    // 시설 타입 매핑 (공공데이터 API -> 우리 시스템)
    private static final Map<String, String> FACILITY_TYPE_MAP = createFacilityTypeMap();
    
    private static Map<String, String> createFacilityTypeMap() {
        Map<String, String> map = new HashMap<>();
        map.put("01", "노인요양시설");
        map.put("02", "노인요양공동생활가정");
        map.put("03", "노인전문병원");
        map.put("04", "재가노인복지시설");
        map.put("05", "주간보호시설");
        map.put("06", "단기보호시설");
        map.put("07", "방문요양서비스");
        map.put("08", "방문목욕서비스");
        map.put("09", "방문간호서비스");
        map.put("10", "주야간보호서비스");
        return Collections.unmodifiableMap(map);
    }

    /**
     * 특정 지역의 장기요양기관 데이터를 동기화
     * 
     * @param region 지역명 (예: "서울특별시")
     * @return 동기화 결과 통계
     */
    @Async("publicDataExecutor")
    @Transactional
    public CompletableFuture<SyncResult> syncFacilitiesByRegion(String region) {
        log.info("지역별 시설 동기화 시작 - 지역: {}", region);
        
        SyncResult result = new SyncResult();
        result.setRegion(region);
        result.setStartTime(LocalDateTime.now());

        try {
            // 1. 공공데이터 API에서 지역별 시설 검색
            LtciSearchResponse searchResponse = null;
            try {
                searchResponse = publicDataApiClient
                        .searchLongTermCareInstitutions(region, null, 1, 1000)
                        .block();
            } catch (Exception e) {
                log.error("공공데이터 API 호출 실패 - 지역: {}", region, e);
                result.setErrorMessage("API 호출 실패: " + e.getMessage());
                return CompletableFuture.completedFuture(result);
            }
            
            if (searchResponse == null || searchResponse.getResponse() == null || 
                searchResponse.getResponse().getBody() == null) {
                log.warn("지역별 시설 검색 결과 없음 - 지역: {}", region);
                result.setErrorMessage("검색 결과 없음");
                return CompletableFuture.completedFuture(result);
            }

            List<LtciSearchResponse.LtciInstitution> institutions = 
                    searchResponse.getResponse().getBody().getItems();
            
            result.setTotalFound(institutions.size());
            log.info("지역별 시설 검색 완료 - 지역: {}, 검색된 시설 수: {}", region, institutions.size());

            // 2. 각 시설에 대해 상세 정보 조회 및 동기화
            List<String> processedIds = new ArrayList<>();
            List<String> errorIds = new ArrayList<>();

            for (LtciSearchResponse.LtciInstitution institution : institutions) {
                try {
                    boolean syncSuccess = syncSingleFacility(institution);
                    if (syncSuccess) {
                        processedIds.add(institution.getInstitutionCode());
                        result.incrementProcessed();
                    } else {
                        errorIds.add(institution.getInstitutionCode());
                        result.incrementErrors();
                    }
                } catch (Exception e) {
                    log.error("개별 시설 동기화 실패 - 시설 코드: {}, 오류: {}", 
                            institution.getInstitutionCode(), e.getMessage(), e);
                    errorIds.add(institution.getInstitutionCode());
                    result.incrementErrors();
                }
            }

            // 3. 동기화 결과 정리
            result.setProcessedIds(processedIds);
            result.setErrorIds(errorIds);
            result.setEndTime(LocalDateTime.now());
            
            log.info("지역별 시설 동기화 완료 - 지역: {}, 처리: {}, 오류: {}", 
                    region, result.getProcessedCount(), result.getErrorCount());

            // 4. 캐시 무효화
            evictFacilityCaches();

            return CompletableFuture.completedFuture(result);

        } catch (Exception e) {
            log.error("지역별 시설 동기화 실패 - 지역: {}", region, e);
            result.setErrorMessage(e.getMessage());
            result.setEndTime(LocalDateTime.now());
            return CompletableFuture.completedFuture(result);
        }
    }

    /**
     * 개별 시설 정보 동기화
     * 
     * @param institution 공공데이터 API에서 조회한 시설 정보
     * @return 동기화 성공 여부
     */
    private boolean syncSingleFacility(LtciSearchResponse.LtciInstitution institution) {
        try {
            log.debug("개별 시설 동기화 시작 - 시설: {} ({})", 
                    institution.getInstitutionName(), institution.getInstitutionCode());

            // 1. 상세 정보 조회 (선택적)
            LtciDetailResponse detailResponse = null;
            try {
                detailResponse = publicDataApiClient
                        .getLongTermCareInstitutionDetail(institution.getInstitutionCode())
                        .block();
            } catch (Exception e) {
                log.warn("상세 정보 조회 실패 - 시설 코드: {}, 기본 정보로 진행", institution.getInstitutionCode());
            }

            // 2. 운영 상태 조회 (선택적)
            FacilityStatusResponse statusResponse = null;
            try {
                statusResponse = publicDataApiClient
                        .getFacilityOperationStatus(institution.getInstitutionCode())
                        .block();
            } catch (Exception e) {
                log.warn("운영 상태 조회 실패 - 시설 코드: {}, 기본 정보로 진행", institution.getInstitutionCode());
            }

            // 3. 기존 시설 정보 확인 (externalId 필드로 검색)
            List<FacilityProfile> existingFacilities = facilityProfileRepository
                    .findAll()
                    .stream()
                    .filter(f -> institution.getInstitutionCode().equals(f.getExternalId()))
                    .collect(Collectors.toList());

            FacilityProfile facilityProfile;
            if (!existingFacilities.isEmpty()) {
                // 기존 시설 업데이트
                facilityProfile = existingFacilities.get(0);
                updateExistingFacility(facilityProfile, institution, detailResponse, statusResponse);
                log.debug("기존 시설 업데이트 - ID: {}", facilityProfile.getId());
            } else {
                // 새 시설 생성
                facilityProfile = createNewFacility(institution, detailResponse, statusResponse);
                log.debug("새 시설 생성 - 외부 ID: {}", institution.getInstitutionCode());
            }

            // 4. 시설 정보 저장
            facilityProfileRepository.save(facilityProfile);
            
            return true;

        } catch (Exception e) {
            log.error("개별 시설 동기화 실패 - 시설 코드: {}, 오류: {}", 
                    institution.getInstitutionCode(), e.getMessage(), e);
            return false;
        }
    }

    /**
     * 새 시설 프로필 생성
     */
    private FacilityProfile createNewFacility(
            LtciSearchResponse.LtciInstitution institution,
            LtciDetailResponse detailResponse,
            FacilityStatusResponse statusResponse) {
        
        FacilityProfile facility = new FacilityProfile();
        
        // 기본 정보 매핑
        facility.setExternalId(institution.getInstitutionCode());
        facility.setFacilityName(institution.getInstitutionName());
        facility.setFacilityType(mapFacilityType(institution.getInstitutionType()));
        facility.setAddress(institution.getAddress());
        facility.setPhoneNumber(institution.getPhoneNumber());
        facility.setWebsiteUrl(institution.getHomepageUrl());
        
        // 위치 정보 (Double을 BigDecimal로 변환)
        if (institution.getLatitude() != null && institution.getLongitude() != null) {
            facility.setLatitude(BigDecimal.valueOf(institution.getLatitude()));
            facility.setLongitude(BigDecimal.valueOf(institution.getLongitude()));
        }
        
        // 정원 정보
        if (institution.getCapacity() != null) {
            facility.setTotalCapacity(institution.getCapacity());
        }
        if (institution.getCurrentOccupancy() != null) {
            facility.setCurrentOccupancy(institution.getCurrentOccupancy());
        }
        
        // 평가 정보
        if (institution.getEvaluationGrade() != null) {
            facility.setFacilityGrade(institution.getEvaluationGrade());
        }
        if (institution.getEvaluationScore() != null) {
            // Double을 Integer로 변환
            facility.setEvaluationScore(institution.getEvaluationScore().intValue());
        }
        
        // 비용 정보
        if (institution.getMonthlyBasicFee() != null) {
            facility.setMonthlyBasicFee(institution.getMonthlyBasicFee());
        }
        
        // 상세 정보 매핑 (detailResponse가 있는 경우)
        if (detailResponse != null && detailResponse.getResponse() != null && 
            detailResponse.getResponse().getBody() != null) {
            mapDetailInformation(facility, detailResponse.getResponse().getBody().getItem());
        }
        
        // 운영 상태 매핑 (statusResponse가 있는 경우)
        if (statusResponse != null && statusResponse.getResponse() != null &&
            statusResponse.getResponse().getBody() != null &&
            !statusResponse.getResponse().getBody().getItems().isEmpty()) {
            mapOperationStatus(facility, statusResponse.getResponse().getBody().getItems().get(0));
        }
        
        // 동기화 메타데이터
        facility.setDataSource("PUBLIC_API");
        facility.setLastSyncedAt(LocalDateTime.now());
        
        return facility;
    }

    /**
     * 기존 시설 정보 업데이트
     */
    private void updateExistingFacility(
            FacilityProfile facility,
            LtciSearchResponse.LtciInstitution institution,
            LtciDetailResponse detailResponse,
            FacilityStatusResponse statusResponse) {
        
        // 기본 정보 업데이트 (변경된 경우만)
        if (!Objects.equals(facility.getFacilityName(), institution.getInstitutionName())) {
            facility.setFacilityName(institution.getInstitutionName());
        }
        
        if (!Objects.equals(facility.getAddress(), institution.getAddress())) {
            facility.setAddress(institution.getAddress());
        }
        
        if (!Objects.equals(facility.getPhoneNumber(), institution.getPhoneNumber())) {
            facility.setPhoneNumber(institution.getPhoneNumber());
        }
        
        // 정원 및 입소 현황 업데이트
        if (institution.getCapacity() != null) {
            facility.setTotalCapacity(institution.getCapacity());
        }
        if (institution.getCurrentOccupancy() != null) {
            facility.setCurrentOccupancy(institution.getCurrentOccupancy());
        }
        
        // 평가 정보 업데이트
        if (institution.getEvaluationGrade() != null) {
            facility.setFacilityGrade(institution.getEvaluationGrade());
        }
        if (institution.getEvaluationScore() != null) {
            facility.setEvaluationScore(institution.getEvaluationScore().intValue());
        }
        
        // 상세 정보 업데이트
        if (detailResponse != null && detailResponse.getResponse() != null && 
            detailResponse.getResponse().getBody() != null) {
            mapDetailInformation(facility, detailResponse.getResponse().getBody().getItem());
        }
        
        // 운영 상태 업데이트
        if (statusResponse != null && statusResponse.getResponse() != null &&
            statusResponse.getResponse().getBody() != null &&
            !statusResponse.getResponse().getBody().getItems().isEmpty()) {
            mapOperationStatus(facility, statusResponse.getResponse().getBody().getItems().get(0));
        }
        
        // 동기화 메타데이터 업데이트
        facility.setLastSyncedAt(LocalDateTime.now());
    }

    /**
     * 상세 정보 매핑
     */
    private void mapDetailInformation(FacilityProfile facility, LtciDetailResponse.LtciInstitutionDetail detail) {
        if (detail == null) return;
        
        // 직원 정보
        if (detail.getStaffInfo() != null) {
            facility.setTotalStaff(detail.getStaffInfo().getTotalStaff());
            facility.setDoctorCount(detail.getStaffInfo().getDoctors());
            facility.setNurseCount(detail.getStaffInfo().getNurses());
        }
        
        // 시설 정보
        if (detail.getFacilityInfo() != null) {
            facility.setTotalFloorArea(detail.getFacilityInfo().getTotalFloorArea());
            facility.setBuildingStructure(detail.getFacilityInfo().getBuildingStructure());
            facility.setParkingSpaces(detail.getFacilityInfo().getParkingSpaces());
        }
        
        // 서비스 정보
        if (detail.getServiceInfo() != null) {
            if (detail.getServiceInfo().getSpecializedCare() != null) {
                facility.setSpecialServices(String.join(",", detail.getServiceInfo().getSpecializedCare()));
            }
        }
        
        // 비용 정보
        if (detail.getCostInfo() != null) {
            if (detail.getCostInfo().getMonthlyBasicFee() != null) {
                facility.setMonthlyBasicFee(detail.getCostInfo().getMonthlyBasicFee());
            }
            if (detail.getCostInfo().getMealCost() != null) {
                facility.setMealCost(detail.getCostInfo().getMealCost());
            }
        }
    }

    /**
     * 운영 상태 매핑
     */
    private void mapOperationStatus(FacilityProfile facility, FacilityStatusResponse.FacilityStatus status) {
        if (status == null) return;
        
        // 운영 상태
        facility.setOperationStatus(status.getOperationStatus());
        
        // 개설/폐업 일자
        facility.setEstablishmentDate(status.getEstablishmentDate());
        facility.setClosureDate(status.getClosureDate());
        
        // 대표자 정보
        facility.setRepresentativeName(status.getRepresentativeName());
        facility.setBusinessRegistrationNumber(status.getBusinessRegistrationNumber());
    }

    /**
     * 시설 타입 매핑
     */
    private String mapFacilityType(String apiType) {
        return FACILITY_TYPE_MAP.getOrDefault(apiType, "기타");
    }

    /**
     * 전체 지역 시설 동기화
     * 
     * @return 전체 동기화 결과
     */
    @Async("publicDataExecutor")
    public CompletableFuture<List<SyncResult>> syncAllRegions() {
        log.info("전국 시설 동기화 시작");
        
        List<String> regions = new ArrayList<>(REGION_CODE_MAP.values());
        
        List<CompletableFuture<SyncResult>> futures = regions.stream()
                .map(this::syncFacilitiesByRegion)
                .collect(Collectors.toList());
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .collect(Collectors.toList()));
    }

    /**
     * 시설 관련 캐시 무효화
     */
    @CacheEvict(value = {"facilityProfiles", "facilitySearch", "facilityRecommendations"}, allEntries = true)
    public void evictFacilityCaches() {
        log.info("시설 관련 캐시 무효화 완료");
    }

    /**
     * 동기화 결과 통계 클래스
     */
    public static class SyncResult {
        private String region;
        private int totalFound;
        private int processedCount;
        private int errorCount;
        private List<String> processedIds = new ArrayList<>();
        private List<String> errorIds = new ArrayList<>();
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String errorMessage;

        // Getters and Setters
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }

        public int getTotalFound() { return totalFound; }
        public void setTotalFound(int totalFound) { this.totalFound = totalFound; }

        public int getProcessedCount() { return processedCount; }
        public void incrementProcessed() { this.processedCount++; }

        public int getErrorCount() { return errorCount; }
        public void incrementErrors() { this.errorCount++; }

        public List<String> getProcessedIds() { return processedIds; }
        public void setProcessedIds(List<String> processedIds) { this.processedIds = processedIds; }

        public List<String> getErrorIds() { return errorIds; }
        public void setErrorIds(List<String> errorIds) { this.errorIds = errorIds; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public long getDurationMinutes() {
            if (startTime != null && endTime != null) {
                return java.time.Duration.between(startTime, endTime).toMinutes();
            }
            return 0;
        }
    }
} 