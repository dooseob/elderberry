package com.globalcarelink.facility;

import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.facility.dto.FacilityProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 시설 프로필 관리 서비스
 * 시설 프로필의 생성, 조회, 수정, 삭제 등 순수 CRUD 작업을 담당
 * 단일 책임 원칙(SRP) 적용으로 기존 FacilityProfileService에서 분리
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FacilityProfileManagementService {

    private final FacilityProfileRepository facilityProfileRepository;

    // ===== 기본 CRUD 작업 =====

    /**
     * 시설 프로필 생성
     * 기본값 설정, 침대 수 계산, 중복 체크 포함
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
     * 시설 프로필 ID로 조회
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
     * 시설 프로필 응답 DTO로 조회
     */
    @Cacheable(value = "facility-profiles", key = "#facilityId")
    public FacilityProfileResponse findById(Long facilityId) {
        log.info("시설 조회 - ID: {}", facilityId);
        
        FacilityProfile facility = facilityProfileRepository.findById(facilityId)
                .orElseThrow(() -> new CustomException.NotFound("시설을 찾을 수 없습니다: " + facilityId));
        
        return FacilityProfileResponse.from(facility);
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
     * 시설 등급 업데이트
     */
    @Transactional
    @CacheEvict(value = "facility-profiles", key = "#facilityId")
    public void updateFacilityGrade(Long facilityId, String newGrade, String reason, String updatedBy) {
        log.info("시설 등급 업데이트 - ID: {}, 새 등급: {}", facilityId, newGrade);
        
        FacilityProfile facility = facilityProfileRepository.findById(facilityId)
                .orElseThrow(() -> new CustomException.NotFound("시설을 찾을 수 없습니다: " + facilityId));
        
        facility.setFacilityGrade(newGrade);
        // updatedAt은 @LastModifiedDate로 자동 업데이트됨
        
        facilityProfileRepository.save(facility);
        log.info("시설 등급 업데이트 완료 - ID: {}, 등급: {}", facilityId, newGrade);
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

    // ===== 기본 검색 메서드 =====

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
     * 지역별 시설 조회 (페이징 응답)
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

    /**
     * 위치 기반 근처 시설 검색
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

    /**
     * 모든 캐시 무효화
     */
    @CacheEvict(value = {"facility-profiles", "facility-statistics"}, allEntries = true)
    public void evictAllCaches() {
        log.info("시설 관련 모든 캐시 삭제");
    }

    // ===== 내부 헬퍼 메서드 =====

    /**
     * 시설 기본값 설정
     */
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

    /**
     * 시설 필드 업데이트 헬퍼 메서드
     */
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
} 