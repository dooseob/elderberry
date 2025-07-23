package com.globalcarelink.facility;

import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.facility.dto.FacilityProfileResponse;
import com.globalcarelink.health.HealthAssessment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 시설 프로필 서비스
 * 시설 관리, 검색, 매칭 비즈니스 로직 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FacilityProfileService {

    private final FacilityProfileRepository facilityProfileRepository;
    private final FacilityMatchingHistoryRepository matchingHistoryRepository;

    // ===== 기본 CRUD 작업 =====

    /**
     * 모든 시설 조회 (페이징)
     */
    @Cacheable(value = "facility-profiles-page")
    public Page<FacilityProfileResponse> findAllFacilities(Pageable pageable, String region, String facilityType, String grade) {
        log.info("시설 목록 조회 - 페이지: {}, 지역: {}, 타입: {}, 등급: {}", pageable.getPageNumber(), region, facilityType, grade);
        
        Page<FacilityProfile> facilities;
        
        if (region != null && facilityType != null && grade != null) {
            facilities = facilityProfileRepository.findByRegionAndFacilityTypeAndGrade(region, facilityType, grade, pageable);
        } else if (region != null) {
            facilities = facilityProfileRepository.findByRegion(region, pageable);
        } else {
            facilities = facilityProfileRepository.findAll(pageable);
        }
        
        return facilities.map(FacilityProfileResponse::from);
    }

    /**
     * 시설 ID로 조회
     */
    @Cacheable(value = "facility-profiles", key = "#facilityId")
    public FacilityProfileResponse findById(Long facilityId) {
        log.info("시설 조회 - ID: {}", facilityId);
        
        FacilityProfile facility = facilityProfileRepository.findById(facilityId)
                .orElseThrow(() -> new CustomException.NotFound("시설을 찾을 수 없습니다: " + facilityId));
        
        return FacilityProfileResponse.from(facility);
    }

    /**
     * 지역별 시설 조회
     */
    @Cacheable(value = "facility-profiles-by-region")
    public List<FacilityProfileResponse> findFacilitiesByRegion(String region, String district, Integer limit, int offset) {
        log.info("지역별 시설 조회 - 지역: {}, 구/군: {}", region, district);
        
        Pageable pageable = PageRequest.of(offset / limit, limit);
        Page<FacilityProfile> facilities;
        
        if (district != null) {
            facilities = facilityProfileRepository.findByRegionAndDistrict(region, district, pageable);
        } else {
            facilities = facilityProfileRepository.findByRegion(region, pageable);
        }
        
        return facilities.getContent().stream()
                .map(FacilityProfileResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 케어 등급별 시설 조회
     */
    @Cacheable(value = "facility-profiles-by-care-grade")
    public List<FacilityProfileResponse> findFacilitiesByCareGrade(Integer careGrade, String region, int limit) {
        log.info("케어 등급별 시설 조회 - 등급: {}, 지역: {}", careGrade, region);
        
        Pageable pageable = PageRequest.of(0, limit);
        Page<FacilityProfile> facilities = facilityProfileRepository.findByAcceptableCareGradesContainingAndRegion(careGrade, region, pageable);
        
        return facilities.getContent().stream()
                .map(FacilityProfileResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 시설 등급 업데이트
     */
    @Transactional
    @CacheEvict(value = "facility-profiles", key = "#facilityId")
    public void updateFacilityGrade(Long facilityId, String newGrade, String reason, String updatedBy) {
        log.info("시설 등급 업데이트 - ID: {}, 새 등급: {}", facilityId, newGrade);
        
        FacilityProfile facility = facilityProfileRepository.findById(facilityId)
                .orElseThrow(() -> new CustomException.NotFound("시설을 찾을 수 없습니다: " + facilityId));
        
        facility.setGrade(newGrade);
        facility.setLastUpdated(LocalDateTime.now());
        
        facilityProfileRepository.save(facility);
        log.info("시설 등급 업데이트 완료 - ID: {}, 등급: {}", facilityId, newGrade);
    }

    /**
     * 시설 프로필 생성
     */
    @Transactional
    @CachePut(value = "facility-profiles", key = "#result.id")
    public FacilityProfile createFacility(FacilityProfile facility) {
        log.info("시설 프로필 생성 시작 - 시설명: {}", facility.getFacilityName());

        // 기본값 설정
        setDefaultValues(facility);

        // 가용 침대 수 계산
        facility.calculateAvailableBeds();

        // 시설 코드 중복 체크
        if (facility.getFacilityCode() != null && 
            facilityProfileRepository.findByFacilityCode(facility.getFacilityCode()).isPresent()) {
            throw new CustomException.BadRequest("이미 존재하는 시설 코드입니다: " + facility.getFacilityCode());
        }

        FacilityProfile saved = facilityProfileRepository.save(facility);
        
        log.info("시설 프로필 생성 완료 - ID: {}, 시설명: {}, 등급: {}", 
                saved.getId(), saved.getFacilityName(), saved.getFacilityGrade());

        return saved;
    }

    /**
     * 시설 프로필 조회
     */
    @Cacheable(value = "facility-profiles", key = "#facilityId")
    public Optional<FacilityProfile> getFacilityById(Long facilityId) {
        log.debug("시설 프로필 조회 - ID: {}", facilityId);
        
        if (facilityId == null || facilityId <= 0) {
            throw new CustomException.BadRequest("유효하지 않은 시설 ID입니다");
        }
        
        return facilityProfileRepository.findById(facilityId);
    }

    /**
     * 시설 코드로 조회
     */
    @Cacheable(value = "facility-profiles", key = "'code_' + #facilityCode")
    public Optional<FacilityProfile> getFacilityByCode(String facilityCode) {
        log.debug("시설 프로필 조회 - 코드: {}", facilityCode);
        
        if (facilityCode == null || facilityCode.trim().isEmpty()) {
            throw new CustomException.BadRequest("시설 코드는 필수입니다");
        }
        
        return facilityProfileRepository.findByFacilityCode(facilityCode);
    }

    /**
     * 시설 프로필 수정
     */
    @Transactional
    @CachePut(value = "facility-profiles", key = "#facilityId")
    public FacilityProfile updateFacility(Long facilityId, FacilityProfile updateData) {
        log.info("시설 프로필 수정 시작 - ID: {}", facilityId);

        FacilityProfile facility = facilityProfileRepository.findById(facilityId)
                .orElseThrow(() -> new CustomException.NotFound("시설을 찾을 수 없습니다: " + facilityId));

        // 수정 가능한 필드들 업데이트
        updateFacilityFields(facility, updateData);

        // 가용 침대 수 재계산
        facility.calculateAvailableBeds();

        FacilityProfile updated = facilityProfileRepository.save(facility);

        log.info("시설 프로필 수정 완료 - ID: {}, 시설명: {}", facilityId, updated.getFacilityName());

        return updated;
    }

    /**
     * 시설 프로필 삭제
     */
    @Transactional
    @CacheEvict(value = {"facility-profiles", "facility-statistics"}, allEntries = true)
    public void deleteFacility(Long facilityId) {
        log.info("시설 프로필 삭제 시작 - ID: {}", facilityId);
        
        FacilityProfile facility = facilityProfileRepository.findById(facilityId)
                .orElseThrow(() -> new CustomException.NotFound("시설을 찾을 수 없습니다: " + facilityId));

        facilityProfileRepository.delete(facility);
        
        log.info("시설 프로필 삭제 완료 - ID: {}, 시설명: {}", facilityId, facility.getFacilityName());
    }

    // ===== 검색 및 필터링 =====

    /**
     * 시설명으로 검색
     */
    public List<FacilityProfile> searchFacilitiesByName(String facilityName) {
        log.debug("시설명 검색 - 키워드: {}", facilityName);
        
        if (facilityName == null || facilityName.trim().isEmpty()) {
            throw new CustomException.BadRequest("검색 키워드는 필수입니다");
        }
        
        return facilityProfileRepository.findByFacilityNameContainingIgnoreCase(facilityName.trim());
    }

    /**
     * 지역별 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'region_' + #region")
    public List<FacilityProfile> getFacilitiesByRegion(String region) {
        log.debug("지역별 시설 조회 - 지역: {}", region);
        
        if (region == null || region.trim().isEmpty()) {
            throw new CustomException.BadRequest("지역은 필수입니다");
        }
        
        return facilityProfileRepository.findByRegion(region);
    }

    /**
     * 시설 타입별 조회
     */
    @Cacheable(value = "facility-profiles", key = "'type_' + #facilityType")
    public List<FacilityProfile> getFacilitiesByType(String facilityType) {
        log.debug("시설 타입별 조회 - 타입: {}", facilityType);
        
        if (facilityType == null || facilityType.trim().isEmpty()) {
            throw new CustomException.BadRequest("시설 타입은 필수입니다");
        }
        
        return facilityProfileRepository.findByFacilityType(facilityType);
    }

    /**
     * 시설 등급별 조회
     */
    @Cacheable(value = "facility-profiles", key = "'grade_' + #facilityGrade")
    public List<FacilityProfile> getFacilitiesByGrade(String facilityGrade) {
        log.debug("시설 등급별 조회 - 등급: {}", facilityGrade);
        
        if (facilityGrade == null || !facilityGrade.matches("[A-E]")) {
            throw new CustomException.BadRequest("유효하지 않은 시설 등급입니다");
        }
        
        return facilityProfileRepository.findByFacilityGrade(facilityGrade);
    }

    /**
     * 입주 가능한 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'available'")
    public List<FacilityProfile> getAvailableFacilities() {
        log.debug("입주 가능한 시설 조회");
        return facilityProfileRepository.findAvailableFacilities();
    }

    // ===== 위치 기반 검색 =====

    /**
     * 근처 시설 검색
     */
    public List<FacilityProfile> findNearbyFacilities(BigDecimal latitude, BigDecimal longitude, double radiusKm) {
        log.debug("근처 시설 검색 - 위도: {}, 경도: {}, 반경: {}km", latitude, longitude, radiusKm);
        
        if (latitude == null || longitude == null) {
            throw new CustomException.BadRequest("위도와 경도는 필수입니다");
        }
        
        if (radiusKm <= 0 || radiusKm > 100) {
            throw new CustomException.BadRequest("검색 반경은 0km 초과 100km 이하여야 합니다");
        }
        
        return facilityProfileRepository.findNearbyFacilities(latitude, longitude, radiusKm);
    }

    // ===== 케어 등급 기반 검색 =====

    /**
     * 특정 케어 등급 수용 가능 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'care_grade_' + #careGrade")
    public List<FacilityProfile> getFacilitiesByCareGrade(Integer careGrade) {
        log.debug("케어 등급별 시설 조회 - 등급: {}", careGrade);
        
        if (careGrade == null || careGrade < 1 || careGrade > 6) {
            throw new CustomException.BadRequest("케어 등급은 1-6 사이여야 합니다");
        }
        
        return facilityProfileRepository.findByAcceptableCareGradesContaining(careGrade);
    }

    /**
     * 복수 케어 등급 수용 가능 시설 조회
     */
    public List<FacilityProfile> getFacilitiesByCareGrades(Set<Integer> careGrades) {
        log.debug("복수 케어 등급별 시설 조회 - 등급: {}", careGrades);
        
        if (careGrades == null || careGrades.isEmpty()) {
            throw new CustomException.BadRequest("케어 등급은 필수입니다");
        }
        
        // 유효한 케어 등급인지 검증
        boolean hasInvalidGrade = careGrades.stream().anyMatch(grade -> grade < 1 || grade > 6);
        if (hasInvalidGrade) {
            throw new CustomException.BadRequest("케어 등급은 1-6 사이여야 합니다");
        }
        
        return facilityProfileRepository.findByAcceptableCareGradesContainingAny(careGrades);
    }

    // ===== 전문성 기반 검색 =====

    /**
     * 치매 전문 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'dementia_specialized'")
    public List<FacilityProfile> getDementiaSpecializedFacilities() {
        log.debug("치매 전문 시설 조회");
        return facilityProfileRepository.findDementiaSpecializedFacilities();
    }

    /**
     * 의료 전문 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'medical_specialized'")  
    public List<FacilityProfile> getMedicalSpecializedFacilities() {
        log.debug("의료 전문 시설 조회");
        return facilityProfileRepository.findMedicalSpecializedFacilities();
    }

    /**
     * 재활 전문 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'rehabilitation_specialized'")
    public List<FacilityProfile> getRehabilitationSpecializedFacilities() {
        log.debug("재활 전문 시설 조회");
        return facilityProfileRepository.findRehabilitationSpecializedFacilities();
    }

    /**
     * 호스피스 전문 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'hospice_specialized'")
    public List<FacilityProfile> getHospiceSpecializedFacilities() {
        log.debug("호스피스 전문 시설 조회");
        return facilityProfileRepository.findHospiceSpecializedFacilities();
    }

    // ===== 시설-환자 매칭 로직 =====

    /**
     * 건강 상태 기반 시설 추천
     */
    public List<FacilityRecommendation> recommendFacilities(HealthAssessment assessment, FacilityMatchingPreference preference) {
        log.info("시설 추천 시작 - 회원: {}, 케어등급: {}", assessment.getMemberId(), assessment.getOverallCareGrade());

        // 1. 기본 호환성 필터링
        List<FacilityProfile> compatibleFacilities = findCompatibleFacilities(assessment);
        
        // 2. 사용자 선호도 적용
        List<FacilityProfile> filteredFacilities = applyUserPreferences(compatibleFacilities, preference);
        
        // 3. 매칭 점수 계산 및 정렬
        List<FacilityRecommendation> recommendations = filteredFacilities.stream()
                .map(facility -> calculateFacilityMatch(facility, assessment, preference))
                .sorted(Comparator.comparing(FacilityRecommendation::getMatchScore).reversed())
                .limit(preference.getMaxRecommendations() != null ? preference.getMaxRecommendations() : 10)
                .collect(Collectors.toList());

        log.info("시설 추천 완료 - 총 {}개 시설 추천", recommendations.size());
        
        return recommendations;
    }

    /**
     * 재외동포 맞춤 시설 추천
     */
    @Cacheable(value = "facility-profiles", key = "'overseas_korean_friendly'")
    public List<FacilityProfile> getOverseasKoreanFriendlyFacilities() {
        log.debug("재외동포 맞춤 시설 조회");
        return facilityProfileRepository.findOverseasKoreanFriendlyFacilities();
    }

    // ===== 종합 검색 =====

    /**
     * 복합 조건 시설 검색
     */
    public Page<FacilityProfile> searchFacilitiesWithFilters(FacilitySearchCriteria criteria, Pageable pageable) {
        log.debug("복합 조건 시설 검색 - 조건: {}", criteria);
        
        return facilityProfileRepository.findFacilitiesWithFilters(
                criteria.getRegion(),
                criteria.getFacilityType(),
                criteria.getMinCapacity(),
                criteria.getMaxMonthlyFee(),
                pageable
        );
    }

    // ===== 통계 및 집계 =====

    /**
     * 지역별 시설 통계
     */
    @Cacheable(value = "facility-statistics", key = "'by_region'")
    public Map<String, Long> getFacilityStatisticsByRegion() {
        log.debug("지역별 시설 통계 조회");
        
        List<Object[]> results = facilityProfileRepository.countByRegion();
        
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> (Long) result[1],
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));
    }

    /**
     * 시설 타입별 통계
     */
    @Cacheable(value = "facility-statistics", key = "'by_type'")
    public Map<String, Long> getFacilityStatisticsByType() {
        log.debug("시설 타입별 통계 조회");
        
        List<Object[]> results = facilityProfileRepository.countByFacilityType();
        
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> (Long) result[1],
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));
    }

    /**
     * 시설 등급별 통계
     */
    @Cacheable(value = "facility-statistics", key = "'by_grade'")
    public Map<String, Long> getFacilityStatisticsByGrade() {
        log.debug("시설 등급별 통계 조회");
        
        List<Object[]> results = facilityProfileRepository.countByFacilityGrade();
        
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> (Long) result[1],
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));
    }

    /**
     * 전체 시설 통계 요약
     */
    @Cacheable(value = "facility-statistics", key = "'summary'")
    public FacilityStatisticsSummary getFacilityStatisticsSummary() {
        log.debug("전체 시설 통계 요약 조회");
        
        long totalFacilities = facilityProfileRepository.count();
        long availableFacilities = facilityProfileRepository.countAvailableFacilities();
        Double averageFee = facilityProfileRepository.findAverageMonthlyBasicFee();
        
        return FacilityStatisticsSummary.builder()
                .totalFacilities(totalFacilities)
                .availableFacilities(availableFacilities)
                .averageMonthlyFee(averageFee != null ? averageFee.intValue() : 0)
                .occupancyRate((double) (totalFacilities - availableFacilities) / totalFacilities * 100)
                .regionStatistics(getFacilityStatisticsByRegion())
                .typeStatistics(getFacilityStatisticsByType())
                .gradeStatistics(getFacilityStatisticsByGrade())
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    // ===== 모든 캐시 무효화 =====

    @CacheEvict(value = {"facility-profiles", "facility-statistics"}, allEntries = true)
    public void evictAllCaches() {
        log.info("시설 관련 모든 캐시 삭제");
    }

    // ===== 내부 헬퍼 메서드 =====

    private void setDefaultValues(FacilityProfile facility) {
        if (facility.getCurrentOccupancy() == null) {
            facility.setCurrentOccupancy(0);
        }
        if (facility.getBusinessStatus() == null) {
            facility.setBusinessStatus("정상");
        }
        if (facility.getAcceptsLtci() == null) {
            facility.setAcceptsLtci(true);
        }
        if (facility.getAcceptsBasicLiving() == null) {
            facility.setAcceptsBasicLiving(false);
        }
    }

    private void updateFacilityFields(FacilityProfile facility, FacilityProfile updateData) {
        // 기본 정보 업데이트
        if (updateData.getFacilityName() != null) {
            facility.setFacilityName(updateData.getFacilityName());
        }
        if (updateData.getFacilityType() != null) {
            facility.setFacilityType(updateData.getFacilityType());
        }
        if (updateData.getFacilityGrade() != null) {
            facility.setFacilityGrade(updateData.getFacilityGrade());
        }
        if (updateData.getEvaluationScore() != null) {
            facility.setEvaluationScore(updateData.getEvaluationScore());
        }
        
        // 연락처 정보 업데이트
        if (updateData.getPhoneNumber() != null) {
            facility.setPhoneNumber(updateData.getPhoneNumber());
        }
        if (updateData.getEmail() != null) {
            facility.setEmail(updateData.getEmail());
        }
        
        // 주소 정보 업데이트
        if (updateData.getAddress() != null) {
            facility.setAddress(updateData.getAddress());
        }
        if (updateData.getRegion() != null) {
            facility.setRegion(updateData.getRegion());
        }
        if (updateData.getDistrict() != null) {
            facility.setDistrict(updateData.getDistrict());
        }
        
        // 위치 정보 업데이트
        if (updateData.getLatitude() != null) {
            facility.setLatitude(updateData.getLatitude());
        }
        if (updateData.getLongitude() != null) {
            facility.setLongitude(updateData.getLongitude());
        }
        
        // 수용 능력 업데이트
        if (updateData.getTotalCapacity() != null) {
            facility.setTotalCapacity(updateData.getTotalCapacity());
        }
        if (updateData.getCurrentOccupancy() != null) {
            facility.setCurrentOccupancy(updateData.getCurrentOccupancy());
        }
        
        // 전문성 및 특징 업데이트
        if (updateData.getAcceptableCareGrades() != null) {
            facility.setAcceptableCareGrades(updateData.getAcceptableCareGrades());
        }
        if (updateData.getSpecializations() != null) {
            facility.setSpecializations(updateData.getSpecializations());
        }
        
        // 의료진 정보 업데이트
        if (updateData.getHasDoctor() != null) {
            facility.setHasDoctor(updateData.getHasDoctor());
        }
        if (updateData.getHasNurse24h() != null) {
            facility.setHasNurse24h(updateData.getHasNurse24h());
        }
        if (updateData.getNurseCount() != null) {
            facility.setNurseCount(updateData.getNurseCount());
        }
        if (updateData.getCaregiverCount() != null) {
            facility.setCaregiverCount(updateData.getCaregiverCount());
        }
        
        // 비용 정보 업데이트
        if (updateData.getMonthlyBasicFee() != null) {
            facility.setMonthlyBasicFee(updateData.getMonthlyBasicFee());
        }
        if (updateData.getAdmissionFee() != null) {
            facility.setAdmissionFee(updateData.getAdmissionFee());
        }
        
        // 운영 정보 업데이트
        if (updateData.getBusinessStatus() != null) {
            facility.setBusinessStatus(updateData.getBusinessStatus());
        }
        
        // 설명 업데이트
        if (updateData.getDescription() != null) {
            facility.setDescription(updateData.getDescription());
        }
    }

    private List<FacilityProfile> findCompatibleFacilities(HealthAssessment assessment) {
        Integer careGrade = assessment.getCareGradeLevel();
        
        // 기본 호환성 필터링
        List<FacilityProfile> compatibleFacilities = facilityProfileRepository.findByAcceptableCareGradesContaining(careGrade);
        
        // 입주 가능한 시설만 필터링
        return compatibleFacilities.stream()
                .filter(FacilityProfile::hasAvailableSpace)
                .filter(facility -> "정상".equals(facility.getBusinessStatus()) || "운영중".equals(facility.getBusinessStatus()))
                .collect(Collectors.toList());
    }

    private List<FacilityProfile> applyUserPreferences(List<FacilityProfile> facilities, FacilityMatchingPreference preference) {
        return facilities.stream()
                .filter(facility -> {
                    // 지역 선호도
                    if (preference.getPreferredRegions() != null && !preference.getPreferredRegions().isEmpty()) {
                        if (!preference.getPreferredRegions().contains(facility.getRegion())) {
                            return false;
                        }
                    }
                    
                    // 시설 타입 선호도
                    if (preference.getPreferredFacilityTypes() != null && !preference.getPreferredFacilityTypes().isEmpty()) {
                        if (!preference.getPreferredFacilityTypes().contains(facility.getFacilityType())) {
                            return false;
                        }
                    }
                    
                    // 예산 제한
                    if (preference.getMaxMonthlyBudget() != null && facility.getMonthlyBasicFee() != null) {
                        if (facility.getMonthlyBasicFee() > preference.getMaxMonthlyBudget()) {
                            return false;
                        }
                    }
                    
                    // 최소 시설 등급
                    if (preference.getMinFacilityGrade() != null && facility.getFacilityGrade() != null) {
                        String minGrade = preference.getMinFacilityGrade();
                        String facilityGrade = facility.getFacilityGrade();
                        
                        // A > B > C > D > E 순서로 비교
                        if (facilityGrade.compareTo(minGrade) > 0) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
    }

    private FacilityRecommendation calculateFacilityMatch(FacilityProfile facility, HealthAssessment assessment, FacilityMatchingPreference preference) {
        double matchScore = 0.0;
        
        // 1. 시설 등급 점수 (30%)
        matchScore += calculateFacilityGradeScore(facility) * 0.3;
        
        // 2. 전문성 매칭 점수 (25%)
        matchScore += calculateSpecializationMatchScore(facility, assessment) * 0.25;
        
        // 3. 의료진 적합성 점수 (20%)
        matchScore += calculateMedicalStaffScore(facility, assessment) * 0.2;
        
        // 4. 위치 접근성 점수 (15%)
        matchScore += calculateLocationScore(facility, preference) * 0.15;
        
        // 5. 비용 적합성 점수 (10%)
        matchScore += calculateCostScore(facility, preference) * 0.1;
        
        String explanation = generateMatchExplanation(facility, assessment, matchScore);
        
        return FacilityRecommendation.builder()
                .facility(facility)
                .matchScore(matchScore)
                .explanation(explanation)
                .overseasFriendlyScore(facility.getOverseasFriendlyScore())
                .reliabilityScore(facility.getReliabilityScore())
                .estimatedMonthlyCost(facility.getEstimatedMonthlyCostRange())
                .build();
    }

    private double calculateFacilityGradeScore(FacilityProfile facility) {
        if (facility.getFacilityGrade() == null) {
            return 2.5;
        }
        
        return switch (facility.getFacilityGrade()) {
            case "A" -> 5.0;
            case "B" -> 4.0;
            case "C" -> 3.0;
            case "D" -> 2.0;
            case "E" -> 1.0;
            default -> 2.5;
        };
    }

    private double calculateSpecializationMatchScore(FacilityProfile facility, HealthAssessment assessment) {
        double score = 2.5; // 기본 점수
        
        Set<String> specializations = facility.getSpecializations();
        if (specializations == null || specializations.isEmpty()) {
            return score;
        }
        
        // 치매 전문성 매칭
        if (assessment.getLtciGrade() != null && assessment.getLtciGrade() == 6) {
            if (specializations.contains("dementia")) {
                score += 2.0;
            }
        }
        
        // 의료 전문성 매칭 (1-2등급)
        if (assessment.getCareGradeLevel() <= 2) {
            if (specializations.contains("medical")) {
                score += 2.0;
            }
        }
        
        // 재활 전문성 매칭
        if (assessment.getMobilityLevel() != null && assessment.getMobilityLevel() >= 2) {
            if (specializations.contains("rehabilitation")) {
                score += 1.5;
            }
        }
        
        // 호스피스 전문성 매칭
        if (assessment.needsHospiceCare()) {
            if (specializations.contains("hospice")) {
                score += 2.5;
            }
        }
        
        return Math.min(score, 5.0);
    }

    private double calculateMedicalStaffScore(FacilityProfile facility, HealthAssessment assessment) {
        double score = 2.5; // 기본 점수
        
        int careGradeLevel = assessment.getCareGradeLevel();
        
        // 중증환자(1-2등급)는 의료진 필수
        if (careGradeLevel <= 2) {
            if (Boolean.TRUE.equals(facility.getHasDoctor())) {
                score += 1.5;
            }
            if (Boolean.TRUE.equals(facility.getHasNurse24h())) {
                score += 1.0;
            }
        }
        
        // 간호사 대 환자 비율
        if (facility.getNurseCount() != null && facility.getCurrentOccupancy() != null && facility.getCurrentOccupancy() > 0) {
            double nurseRatio = (double) facility.getNurseCount() / facility.getCurrentOccupancy();
            if (nurseRatio >= 0.1) { // 10:1 비율 이상
                score += 0.5;
            }
        }
        
        return Math.min(score, 5.0);
    }

    private double calculateLocationScore(FacilityProfile facility, FacilityMatchingPreference preference) {
        double score = 2.5; // 기본 점수
        
        // 접근성 점수
        if (Boolean.TRUE.equals(facility.getNearSubway())) {
            score += 1.0;
        }
        if (Boolean.TRUE.equals(facility.getNearHospital())) {
            score += 1.0;
        }
        if (Boolean.TRUE.equals(facility.getNearPharmacy())) {
            score += 0.5;
        }
        
        return Math.min(score, 5.0);
    }

    private double calculateCostScore(FacilityProfile facility, FacilityMatchingPreference preference) {
        double score = 2.5; // 기본 점수
        
        if (facility.getMonthlyBasicFee() == null || preference.getMaxMonthlyBudget() == null) {
            return score;
        }
        
        double costRatio = (double) facility.getMonthlyBasicFee() / preference.getMaxMonthlyBudget();
        
        if (costRatio <= 0.7) {
            score = 5.0; // 예산의 70% 이하
        } else if (costRatio <= 0.85) {
            score = 4.0; // 예산의 85% 이하
        } else if (costRatio <= 1.0) {
            score = 3.0; // 예산 내
        } else {
            score = 1.0; // 예산 초과
        }
        
        // 장기요양보험 적용 시 추가 점수
        if (Boolean.TRUE.equals(facility.getAcceptsLtci())) {
            score += 0.5;
        }
        
        return Math.min(score, 5.0);
    }

    private String generateMatchExplanation(FacilityProfile facility, HealthAssessment assessment, double matchScore) {
        StringBuilder explanation = new StringBuilder();
        
        explanation.append("🎯 매칭 점수: ").append(String.format("%.1f", matchScore)).append("/5.0\n\n");
        
        explanation.append("✅ 매칭 이유:\n");
        
        // 시설 등급 설명
        if (facility.getFacilityGrade() != null) {
            explanation.append("• 시설 등급: ").append(facility.getFacilityGrade()).append("등급");
            if (facility.getEvaluationScore() != null) {
                explanation.append(" (").append(facility.getEvaluationScore()).append("점)");
            }
            explanation.append("\n");
        }
        
        // 케어 등급 호환성
        if (facility.canAcceptCareGrade(assessment.getCareGradeLevel())) {
            explanation.append("• 케어 등급 호환: ").append(assessment.getCareGradeLevel()).append("등급 수용 가능\n");
        }
        
        // 전문성 매칭
        Set<String> specializations = facility.getSpecializations();
        if (specializations != null && !specializations.isEmpty()) {
            explanation.append("• 전문 분야: ");
            explanation.append(String.join(", ", specializations.stream()
                    .map(this::translateSpecialization)
                    .collect(Collectors.toList())));
            explanation.append("\n");
        }
        
        // 의료진 정보
        if (Boolean.TRUE.equals(facility.getHasDoctor()) || Boolean.TRUE.equals(facility.getHasNurse24h())) {
            explanation.append("• 의료진: ");
            if (Boolean.TRUE.equals(facility.getHasDoctor())) {
                explanation.append("의사 상주 ");
            }
            if (Boolean.TRUE.equals(facility.getHasNurse24h())) {
                explanation.append("24시간 간호 ");
            }
            explanation.append("\n");
        }
        
        // 입주 가능성
        if (facility.hasAvailableSpace()) {
            explanation.append("• 입주 가능: ").append(facility.getAvailableBeds()).append("개 침대 여유\n");
        }
        
        // 비용 정보
        if (facility.getMonthlyBasicFee() != null) {
            explanation.append("• 예상 비용: ").append(facility.getEstimatedMonthlyCostRange()).append("\n");
        }
        
        // 접근성 정보
        List<String> accessibilities = new ArrayList<>();
        if (Boolean.TRUE.equals(facility.getNearSubway())) {
            accessibilities.add("지하철 근처");
        }
        if (Boolean.TRUE.equals(facility.getNearHospital())) {
            accessibilities.add("병원 근처");
        }
        if (!accessibilities.isEmpty()) {
            explanation.append("• 접근성: ").append(String.join(", ", accessibilities)).append("\n");
        }
        
        return explanation.toString();
    }

    private String translateSpecialization(String specialization) {
        return switch (specialization) {
            case "dementia" -> "치매 전문";
            case "medical" -> "의료 전문";
            case "rehabilitation" -> "재활 전문";
            case "hospice" -> "호스피스 전문";
            default -> specialization;
        };
    }

    // ===== DTO 클래스들 =====

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class FacilityRecommendation {
        private final FacilityProfile facility;
        private final double matchScore;
        private final String explanation;
        private final double overseasFriendlyScore;
        private final int reliabilityScore;
        private final String estimatedMonthlyCost;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class FacilityMatchingPreference {
        private final Set<String> preferredRegions;
        private final Set<String> preferredFacilityTypes;
        private final Integer maxMonthlyBudget;
        private final String minFacilityGrade;
        private final Integer maxRecommendations;
        private final Double maxDistanceKm;
        private final BigDecimal preferredLatitude;
        private final BigDecimal preferredLongitude;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class FacilitySearchCriteria {
        private final String region;
        private final String facilityType;
        private final Integer minCapacity;
        private final Integer maxMonthlyFee;
        private final String facilityGrade;
        private final Set<String> specializations;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class FacilityStatisticsSummary {
        private final long totalFacilities;
        private final long availableFacilities;
        private final int averageMonthlyFee;
        private final double occupancyRate;
        private final Map<String, Long> regionStatistics;
        private final Map<String, Long> typeStatistics;
        private final Map<String, Long> gradeStatistics;
        private final LocalDateTime lastUpdated;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class FacilityStatistics {
        private final long totalFacilities;
        private final long activeFacilities;
        private final long availableBeds;
        private final double averageOccupancyRate;
        private final int averageMonthlyFee;
        private final Map<String, Long> facilitiesByRegion;
        private final Map<String, Long> facilitiesByType;
        private final Map<String, Long> facilitiesByGrade;
        private final Map<String, Double> averageFeesByRegion;
        private final LocalDateTime generatedAt;
    }

    // ===== 매칭 이력 추적 =====

    /**
     * 매칭 추천 결과를 이력에 저장
     */
    @Transactional
    public void recordMatchingRecommendations(String userId, String coordinatorId, 
                                            List<FacilityRecommendation> recommendations,
                                            HealthAssessment assessment, 
                                            FacilityMatchingPreference preference) {
        log.info("매칭 추천 이력 저장 - 사용자: {}, 추천 수: {}", userId, recommendations.size());
        
        for (int i = 0; i < recommendations.size(); i++) {
            FacilityRecommendation recommendation = recommendations.get(i);
            
            FacilityMatchingHistory history = FacilityMatchingHistory.builder()
                .userId(userId)
                .facilityId(recommendation.getFacility().getId())
                .coordinatorId(coordinatorId)
                .initialMatchScore(BigDecimal.valueOf(recommendation.getMatchScore()).setScale(2, java.math.RoundingMode.HALF_UP))
                .recommendationRank(i + 1)
                .matchingCriteria(serializeMatchingCriteria(assessment, preference))
                .facilitySnapshot(serializeFacilitySnapshot(recommendation.getFacility()))
                .estimatedCost(calculateEstimatedMonthlyCost(recommendation.getFacility(), assessment))
                .build();
                
            matchingHistoryRepository.save(history);
        }
        
        log.info("매칭 추천 이력 저장 완료 - {} 건", recommendations.size());
    }

    /**
     * 사용자 행동 추적 - 시설 조회
     */
    @Transactional
    public void trackFacilityView(String userId, Long facilityId) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsViewed();
            matchingHistoryRepository.save(history);
            
            log.info("시설 조회 추적 완료 - 사용자: {}, 시설: {}", userId, facilityId);
        }
    }

    /**
     * 사용자 행동 추적 - 시설 연락
     */
    @Transactional
    public void trackFacilityContact(String userId, Long facilityId) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsContracted();
            matchingHistoryRepository.save(history);
            
            log.info("시설 연락 추적 완료 - 사용자: {}, 시설: {}", userId, facilityId);
        }
    }

    /**
     * 사용자 행동 추적 - 시설 방문
     */
    @Transactional
    public void trackFacilityVisit(String userId, Long facilityId) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsVisited();
            matchingHistoryRepository.save(history);
            
            log.info("시설 방문 추적 완료 - 사용자: {}, 시설: {}", userId, facilityId);
        }
    }

    /**
     * 매칭 완료 처리
     */
    @Transactional
    public void completeMatching(String userId, Long facilityId, 
                               FacilityMatchingHistory.MatchingOutcome outcome,
                               BigDecimal actualCost, BigDecimal satisfactionScore, String feedback) {
        Optional<FacilityMatchingHistory> historyOpt = 
            matchingHistoryRepository.findTopByUserIdAndFacilityIdOrderByCreatedAtDesc(userId, facilityId);
            
        if (historyOpt.isPresent()) {
            FacilityMatchingHistory history = historyOpt.get();
            history.markAsSelected(outcome);
            
            if (actualCost != null) {
                history.setActualCost(actualCost);
            }
            
            if (satisfactionScore != null) {
                history.updateFeedback(satisfactionScore, feedback);
            }
            
            matchingHistoryRepository.save(history);
            
            log.info("매칭 완료 처리 - 사용자: {}, 시설: {}, 결과: {}", userId, facilityId, outcome);
        }
    }

    /**
     * 학습 기반 매칭 점수 조정
     */
    public List<FacilityRecommendation> adjustMatchingScoresWithLearning(List<FacilityRecommendation> recommendations, 
                                                                        String userId) {
        // 사용자의 과거 매칭 이력을 기반으로 점수 조정
        List<FacilityMatchingHistory> userHistory = 
            matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
        if (userHistory.isEmpty()) {
            return recommendations; // 이력이 없으면 원본 그대로 반환
        }
        
        // 성공한 매칭들의 패턴 분석
        List<FacilityMatchingHistory> successfulMatches = userHistory.stream()
            .filter(FacilityMatchingHistory::isSuccessfulMatch)
            .collect(Collectors.toList());
            
        if (successfulMatches.isEmpty()) {
            return recommendations;
        }
        
        // 선호 패턴 추출
        Map<String, Double> facilityTypePreference = extractFacilityTypePreference(successfulMatches);
        Map<String, Double> facilityGradePreference = extractFacilityGradePreference(successfulMatches);
        double avgSuccessfulCost = calculateAverageSuccessfulCost(successfulMatches);
        
        // 추천 점수 조정
        return recommendations.stream()
            .map(rec -> adjustRecommendationScore(rec, facilityTypePreference, facilityGradePreference, avgSuccessfulCost))
            .sorted(Comparator.comparing(FacilityRecommendation::getMatchScore).reversed())
            .collect(Collectors.toList());
    }

    // ===== 학습 기반 유틸리티 메서드 =====

    private String serializeMatchingCriteria(HealthAssessment assessment, FacilityMatchingPreference preference) {
        return String.format("{\"careGrade\":%d,\"regions\":%s,\"maxFee\":%d}", 
            assessment.getCareGradeLevel(),
            preference.getPreferredRegions().toString(),
            preference.getMaxMonthlyFee() != null ? preference.getMaxMonthlyFee() : 0);
    }

    private String serializeFacilitySnapshot(FacilityProfile facility) {
        return String.format("{\"type\":\"%s\",\"grade\":\"%s\",\"capacity\":%d,\"monthlyFee\":%d}",
            facility.getFacilityType(),
            facility.getFacilityGrade(),
            facility.getTotalCapacity(),
            facility.getMonthlyBasicFee() != null ? facility.getMonthlyBasicFee() : 0);
    }

    private BigDecimal calculateEstimatedMonthlyCost(FacilityProfile facility, HealthAssessment assessment) {
        Integer basicFee = facility.getMonthlyBasicFee();
        if (basicFee == null) return null;
        
        double multiplier = 1.0;
        
        // 케어 등급에 따른 비용 조정
        if (assessment.getCareGradeLevel() <= 2) {
            multiplier += 0.3; // 중증 케어 30% 추가
        } else if (assessment.getCareGradeLevel() <= 3) {
            multiplier += 0.15; // 중등도 케어 15% 추가
        }
        
        return BigDecimal.valueOf(basicFee * multiplier).setScale(0, java.math.RoundingMode.HALF_UP);
    }

    private Map<String, Double> extractFacilityTypePreference(List<FacilityMatchingHistory> successfulMatches) {
        Map<String, Double> preferences = new HashMap<>();
        
        successfulMatches.forEach(match -> {
            // 실제 구현에서는 시설 정보를 조회하여 타입을 확인
            // 여기서는 간단히 처리
            Optional<FacilityProfile> facility = facilityProfileRepository.findById(match.getFacilityId());
            if (facility.isPresent()) {
                String type = facility.get().getFacilityType();
                preferences.merge(type, 1.0, Double::sum);
            }
        });
        
        // 정규화
        double total = preferences.values().stream().mapToDouble(Double::doubleValue).sum();
        if (total > 0) {
            preferences.replaceAll((k, v) -> v / total);
        }
        
        return preferences;
    }

    private Map<String, Double> extractFacilityGradePreference(List<FacilityMatchingHistory> successfulMatches) {
        Map<String, Double> preferences = new HashMap<>();
        
        successfulMatches.forEach(match -> {
            Optional<FacilityProfile> facility = facilityProfileRepository.findById(match.getFacilityId());
            if (facility.isPresent()) {
                String grade = facility.get().getFacilityGrade();
                preferences.merge(grade, 1.0, Double::sum);
            }
        });
        
        // 정규화
        double total = preferences.values().stream().mapToDouble(Double::doubleValue).sum();
        if (total > 0) {
            preferences.replaceAll((k, v) -> v / total);
        }
        
        return preferences;
    }

    private double calculateAverageSuccessfulCost(List<FacilityMatchingHistory> successfulMatches) {
        return successfulMatches.stream()
            .filter(match -> match.getActualCost() != null)
            .mapToDouble(match -> match.getActualCost().doubleValue())
            .average()
            .orElse(0.0);
    }

    private FacilityRecommendation adjustRecommendationScore(FacilityRecommendation recommendation,
                                                           Map<String, Double> typePreference,
                                                           Map<String, Double> gradePreference,
                                                           double avgSuccessfulCost) {
        double currentScore = recommendation.getMatchScore();
        double adjustmentFactor = 1.0;
        
        FacilityProfile facility = recommendation.getFacility();
        
        // 시설 타입 선호도 반영
        Double typeBonus = typePreference.get(facility.getFacilityType());
        if (typeBonus != null) {
            adjustmentFactor += typeBonus * 0.2; // 최대 20% 가산
        }
        
        // 시설 등급 선호도 반영
        Double gradeBonus = gradePreference.get(facility.getFacilityGrade());
        if (gradeBonus != null) {
            adjustmentFactor += gradeBonus * 0.15; // 최대 15% 가산
        }
        
        // 비용 유사성 반영
        if (avgSuccessfulCost > 0 && facility.getMonthlyBasicFee() != null) {
            double costSimilarity = 1.0 - Math.abs(facility.getMonthlyBasicFee() - avgSuccessfulCost) / avgSuccessfulCost;
            adjustmentFactor += Math.max(0, costSimilarity) * 0.1; // 최대 10% 가산
        }
        
        double adjustedScore = Math.min(currentScore * adjustmentFactor, 100.0);
        
        return new FacilityRecommendation(facility, adjustedScore, 
            recommendation.getRecommendationReason() + " (학습 기반 조정 적용)");
    }
}