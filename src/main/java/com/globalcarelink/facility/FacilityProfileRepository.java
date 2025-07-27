package com.globalcarelink.facility;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * 시설 프로필 레포지토리
 * 시설 검색, 필터링, 매칭을 위한 다양한 쿼리 메서드 제공
 */
@Repository
public interface FacilityProfileRepository extends JpaRepository<FacilityProfile, Long> {

    // ===== 기본 조회 메서드 =====

    /**
     * 시설 코드로 조회
     */
    Optional<FacilityProfile> findByFacilityCode(String facilityCode);

    /**
     * 시설명으로 검색 (부분 일치)
     */
    List<FacilityProfile> findByFacilityNameContainingIgnoreCase(String facilityName);
    
    Page<FacilityProfile> findByFacilityNameContainingIgnoreCaseWithPaging(String facilityName, Pageable pageable);

    /**
     * 시설 타입별 조회
     */
    List<FacilityProfile> findByFacilityType(String facilityType);
    
    Page<FacilityProfile> findByFacilityTypeWithPaging(String facilityType, Pageable pageable);

    /**
     * 시설 등급별 조회
     */
    List<FacilityProfile> findByFacilityGrade(String facilityGrade);
    
    Page<FacilityProfile> findByFacilityGradeWithPaging(String facilityGrade, Pageable pageable);

    /**
     * 시설 등급 범위로 조회 (A가 가장 높음)
     */
    @Query("SELECT f FROM FacilityProfile f WHERE f.facilityGrade IN :grades ORDER BY f.facilityGrade ASC")
    List<FacilityProfile> findByFacilityGradeIn(@Param("grades") Set<String> grades);

    // ===== 지역별 검색 =====

    /**
     * 지역(시/도)별 조회
     */
    List<FacilityProfile> findByRegion(String region);

    /**
     * 구/군별 조회
     */
    List<FacilityProfile> findByRegionAndDistrict(String region, String district);

    /**
     * 지역별 조회 (페이징)
     */
    Page<FacilityProfile> findByRegionWithPaging(String region, Pageable pageable);

    /**
     * 구/군별 조회 (페이징)
     */
    Page<FacilityProfile> findByRegionAndDistrictWithPaging(String region, String district, Pageable pageable);

    /**
     * 복합 조건 조회 (지역 + 타입 + 등급, 페이징)
     */
    @Query("""
        SELECT f FROM FacilityProfile f 
        WHERE (:region IS NULL OR f.region = :region)
        AND (:facilityType IS NULL OR f.facilityType = :facilityType)
        AND (:grade IS NULL OR f.facilityGrade = :grade)
        ORDER BY f.facilityGrade ASC, f.evaluationScore DESC
        """)
    Page<FacilityProfile> findByRegionAndFacilityTypeAndGrade(@Param("region") String region,
                                                             @Param("facilityType") String facilityType,
                                                             @Param("grade") String grade,
                                                             Pageable pageable);

    /**
     * 케어 등급 + 지역 조회 (페이징)
     */
    @Query("""
        SELECT f FROM FacilityProfile f 
        JOIN f.acceptableCareGrades g 
        WHERE g = :careGrade 
        AND (:region IS NULL OR f.region = :region)
        ORDER BY f.facilityGrade ASC, f.evaluationScore DESC
        """)
    Page<FacilityProfile> findByAcceptableCareGradesContainingAndRegion(@Param("careGrade") Integer careGrade,
                                                                       @Param("region") String region,
                                                                       Pageable pageable);

    /**
     * 주소 기반 검색
     */
    List<FacilityProfile> findByAddressContainingIgnoreCase(String addressKeyword);
    
    Page<FacilityProfile> findByAddressContainingIgnoreCase(String addressKeyword, Pageable pageable);

    // ===== 위치 기반 검색 =====

    /**
     * 특정 위치 근처 시설 검색 (반경 내)
     * 하버사인 공식 사용하여 거리 계산
     */
    @Query(value = """
        SELECT f.*, 
               (6371 * acos(cos(radians(:latitude)) * cos(radians(f.latitude)) * 
                           cos(radians(f.longitude) - radians(:longitude)) + 
                           sin(radians(:latitude)) * sin(radians(f.latitude)))) AS distance
        FROM facility_profiles f 
        WHERE f.latitude IS NOT NULL AND f.longitude IS NOT NULL
        HAVING distance <= :radiusKm 
        ORDER BY distance ASC
        """, nativeQuery = true)
    List<FacilityProfile> findNearbyFacilities(@Param("latitude") BigDecimal latitude, 
                                             @Param("longitude") BigDecimal longitude, 
                                             @Param("radiusKm") double radiusKm);

    // ===== 수용 능력 기반 검색 =====

    /**
     * 입주 가능한 시설 조회 (빈 침대 있음)
     */
    @Query("SELECT f FROM FacilityProfile f WHERE f.totalCapacity > f.currentOccupancy")
    List<FacilityProfile> findAvailableFacilities();
    
    @Query("SELECT f FROM FacilityProfile f WHERE f.totalCapacity > f.currentOccupancy")
    Page<FacilityProfile> findAvailableFacilities(Pageable pageable);

    /**
     * 최소 수용 인원 이상 시설 조회
     */
    @Query("SELECT f FROM FacilityProfile f WHERE (f.totalCapacity - f.currentOccupancy) >= :minCapacity")
    List<FacilityProfile> findFacilitiesWithMinAvailableCapacity(@Param("minCapacity") int minCapacity);
    
    @Query("SELECT f FROM FacilityProfile f WHERE (f.totalCapacity - f.currentOccupancy) >= :minCapacity")
    Page<FacilityProfile> findFacilitiesWithMinAvailableCapacity(@Param("minCapacity") int minCapacity, Pageable pageable);

    /**
     * 특정 정원 범위 시설 조회
     */
    List<FacilityProfile> findByTotalCapacityBetween(int minCapacity, int maxCapacity);
    
    Page<FacilityProfile> findByTotalCapacityBetween(int minCapacity, int maxCapacity, Pageable pageable);

    // ===== 케어 등급 기반 검색 =====

    /**
     * 특정 케어 등급 수용 가능 시설 조회
     * @param careGrade 케어 등급 (1-6)
     */
    @Query("SELECT f FROM FacilityProfile f JOIN f.acceptableCareGrades g WHERE g = :careGrade")
    List<FacilityProfile> findByAcceptableCareGradesContaining(@Param("careGrade") Integer careGrade);
    
    @Query("SELECT f FROM FacilityProfile f JOIN f.acceptableCareGrades g WHERE g = :careGrade")
    Page<FacilityProfile> findByAcceptableCareGradesContaining(@Param("careGrade") Integer careGrade, Pageable pageable);

    /**
     * 복수 케어 등급 중 하나라도 수용 가능한 시설 조회
     */
    @Query("SELECT DISTINCT f FROM FacilityProfile f JOIN f.acceptableCareGrades g WHERE g IN :careGrades")
    List<FacilityProfile> findByAcceptableCareGradesContainingAny(@Param("careGrades") Set<Integer> careGrades);
    
    @Query("SELECT DISTINCT f FROM FacilityProfile f JOIN f.acceptableCareGrades g WHERE g IN :careGrades")
    Page<FacilityProfile> findByAcceptableCareGradesContainingAny(@Param("careGrades") Set<Integer> careGrades, Pageable pageable);

    // ===== 전문성 기반 검색 =====

    /**
     * 특정 전문 분야 시설 조회
     */
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = :specialization")
    List<FacilityProfile> findBySpecializationsContaining(@Param("specialization") String specialization);
    
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = :specialization")
    Page<FacilityProfile> findBySpecializationsContaining(@Param("specialization") String specialization, Pageable pageable);

    /**
     * 치매 전문 시설 조회
     */
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'dementia'")
    List<FacilityProfile> findDementiaSpecializedFacilities();
    
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'dementia'")
    Page<FacilityProfile> findDementiaSpecializedFacilities(Pageable pageable);

    /**
     * 의료 전문 시설 조회
     */
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'medical'")
    List<FacilityProfile> findMedicalSpecializedFacilities();
    
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'medical'")
    Page<FacilityProfile> findMedicalSpecializedFacilities(Pageable pageable);

    /**
     * 재활 전문 시설 조회
     */
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'rehabilitation'")
    List<FacilityProfile> findRehabilitationSpecializedFacilities();
    
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'rehabilitation'")
    Page<FacilityProfile> findRehabilitationSpecializedFacilities(Pageable pageable);

    /**
     * 호스피스 전문 시설 조회
     */
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'hospice'")
    List<FacilityProfile> findHospiceSpecializedFacilities();
    
    @Query("SELECT f FROM FacilityProfile f JOIN f.specializations s WHERE s = 'hospice'")
    Page<FacilityProfile> findHospiceSpecializedFacilities(Pageable pageable);

    // ===== 의료진 및 인력 기반 검색 =====

    /**
     * 의사 상주 시설 조회
     */
    List<FacilityProfile> findByHasDoctorTrue();
    
    Page<FacilityProfile> findByHasDoctorTrue(Pageable pageable);

    /**
     * 24시간 간호사 상주 시설 조회
     */
    List<FacilityProfile> findByHasNurse24hTrue();
    
    Page<FacilityProfile> findByHasNurse24hTrue(Pageable pageable);

    /**
     * 최소 간호사 수 이상 시설 조회
     */
    List<FacilityProfile> findByNurseCountGreaterThanEqual(int minNurseCount);
    
    Page<FacilityProfile> findByNurseCountGreaterThanEqual(int minNurseCount, Pageable pageable);

    /**
     * 의료진 충분한 시설 조회 (의사 상주 + 간호사 3명 이상)
     */
    @Query("SELECT f FROM FacilityProfile f WHERE f.hasDoctor = true AND f.nurseCount >= 3")
    List<FacilityProfile> findFacilitiesWithAdequateMedicalStaff();
    
    @Query("SELECT f FROM FacilityProfile f WHERE f.hasDoctor = true AND f.nurseCount >= 3")
    Page<FacilityProfile> findFacilitiesWithAdequateMedicalStaff(Pageable pageable);

    // ===== 편의시설 기반 검색 =====

    /**
     * 엘리베이터 보유 시설 조회
     */
    List<FacilityProfile> findByHasElevatorTrue();
    
    Page<FacilityProfile> findByHasElevatorTrue(Pageable pageable);

    /**
     * 응급시스템 구비 시설 조회
     */
    List<FacilityProfile> findByHasEmergencySystemTrue();
    
    Page<FacilityProfile> findByHasEmergencySystemTrue(Pageable pageable);

    /**
     * 재활실 보유 시설 조회
     */
    List<FacilityProfile> findByHasRehabilitationRoomTrue();
    
    Page<FacilityProfile> findByHasRehabilitationRoomTrue(Pageable pageable);

    /**
     * 치매 프로그램 운영 시설 조회
     */
    List<FacilityProfile> findByHasDementiaProgramTrue();
    
    Page<FacilityProfile> findByHasDementiaProgramTrue(Pageable pageable);

    // ===== 접근성 기반 검색 =====

    /**
     * 지하철 접근 가능 시설 조회
     */
    List<FacilityProfile> findByNearSubwayTrue();
    
    Page<FacilityProfile> findByNearSubwayTrue(Pageable pageable);

    /**
     * 병원 근처 시설 조회
     */
    List<FacilityProfile> findByNearHospitalTrue();
    
    Page<FacilityProfile> findByNearHospitalTrue(Pageable pageable);

    /**
     * 접근성 우수 시설 조회 (지하철 + 병원 모두 근처)
     */
    @Query("SELECT f FROM FacilityProfile f WHERE f.nearSubway = true AND f.nearHospital = true")
    List<FacilityProfile> findHighAccessibilityFacilities();
    
    @Query("SELECT f FROM FacilityProfile f WHERE f.nearSubway = true AND f.nearHospital = true")
    Page<FacilityProfile> findHighAccessibilityFacilities(Pageable pageable);

    // ===== 비용 기반 검색 =====

    /**
     * 월 기본료 범위 내 시설 조회
     */
    List<FacilityProfile> findByMonthlyBasicFeeBetween(int minFee, int maxFee);
    
    Page<FacilityProfile> findByMonthlyBasicFeeBetween(int minFee, int maxFee, Pageable pageable);

    /**
     * 장기요양보험 적용 시설 조회
     */
    List<FacilityProfile> findByAcceptsLtciTrue();
    
    Page<FacilityProfile> findByAcceptsLtciTrue(Pageable pageable);

    /**
     * 기초생활수급자 수용 시설 조회
     */
    List<FacilityProfile> findByAcceptsBasicLivingTrue();
    
    Page<FacilityProfile> findByAcceptsBasicLivingTrue(Pageable pageable);

    /**
     * 경제적 접근성 우수 시설 조회 (장기요양보험 + 기초생활수급자 수용)
     */
    @Query("SELECT f FROM FacilityProfile f WHERE f.acceptsLtci = true AND f.acceptsBasicLiving = true")
    List<FacilityProfile> findEconomicallyAccessibleFacilities();
    
    @Query("SELECT f FROM FacilityProfile f WHERE f.acceptsLtci = true AND f.acceptsBasicLiving = true")
    Page<FacilityProfile> findEconomicallyAccessibleFacilities(Pageable pageable);

    // ===== 운영 상태 기반 검색 =====

    /**
     * 정상 운영 중인 시설만 조회
     */
    @Query("SELECT f FROM FacilityProfile f WHERE f.businessStatus IN ('정상', '운영중')")
    List<FacilityProfile> findActiveOperatingFacilities();
    
    @Query("SELECT f FROM FacilityProfile f WHERE f.businessStatus IN ('정상', '운영중')")
    Page<FacilityProfile> findActiveOperatingFacilities(Pageable pageable);

    /**
     * 운영 상태별 조회
     */
    List<FacilityProfile> findByBusinessStatus(String businessStatus);
    
    Page<FacilityProfile> findByBusinessStatus(String businessStatus, Pageable pageable);

    // ===== 종합 매칭 쿼리 =====

    /**
     * 재외동포 맞춤 시설 검색
     * - A/B 등급 시설
     * - 입주 가능
     * - 의료진 상주
     * - 접근성 양호
     */
    @Query("""
        SELECT f FROM FacilityProfile f 
        WHERE f.facilityGrade IN ('A', 'B') 
        AND f.totalCapacity > f.currentOccupancy 
        AND (f.hasDoctor = true OR f.hasNurse24h = true)
        AND (f.nearSubway = true OR f.nearHospital = true)
        AND f.businessStatus IN ('정상', '운영중')
        ORDER BY f.facilityGrade ASC, f.evaluationScore DESC
        """)
    List<FacilityProfile> findOverseasKoreanFriendlyFacilities();
    
    @Query("""
        SELECT f FROM FacilityProfile f 
        WHERE f.facilityGrade IN ('A', 'B') 
        AND f.totalCapacity > f.currentOccupancy 
        AND (f.hasDoctor = true OR f.hasNurse24h = true)
        AND (f.nearSubway = true OR f.nearHospital = true)
        AND f.businessStatus IN ('정상', '운영중')
        ORDER BY f.facilityGrade ASC, f.evaluationScore DESC
        """)
    Page<FacilityProfile> findOverseasKoreanFriendlyFacilities(Pageable pageable);

    /**
     * 특정 케어 등급 + 전문성 맞춤 검색
     */
    @Query("""
        SELECT DISTINCT f FROM FacilityProfile f 
        JOIN f.acceptableCareGrades g 
        JOIN f.specializations s 
        WHERE g = :careGrade 
        AND s = :specialization 
        AND f.totalCapacity > f.currentOccupancy 
        AND f.businessStatus IN ('정상', '운영중')
        ORDER BY f.facilityGrade ASC, f.evaluationScore DESC
        """)
    List<FacilityProfile> findByCaregradeAndSpecialization(@Param("careGrade") Integer careGrade,
                                                          @Param("specialization") String specialization);
                                                          
    @Query("""
        SELECT DISTINCT f FROM FacilityProfile f 
        JOIN f.acceptableCareGrades g 
        JOIN f.specializations s 
        WHERE g = :careGrade 
        AND s = :specialization 
        AND f.totalCapacity > f.currentOccupancy 
        AND f.businessStatus IN ('정상', '운영중')
        ORDER BY f.facilityGrade ASC, f.evaluationScore DESC
        """)
    Page<FacilityProfile> findByCaregradeAndSpecialization(@Param("careGrade") Integer careGrade,
                                                          @Param("specialization") String specialization,
                                                          Pageable pageable);

    /**
     * 종합 시설 매칭 검색 (복합 조건)
     */
    @Query("""
        SELECT f FROM FacilityProfile f 
        WHERE (:region IS NULL OR f.region = :region)
        AND (:facilityType IS NULL OR f.facilityType = :facilityType)
        AND (:minCapacity IS NULL OR (f.totalCapacity - f.currentOccupancy) >= :minCapacity)
        AND (:maxMonthlyFee IS NULL OR f.monthlyBasicFee <= :maxMonthlyFee)
        AND f.businessStatus IN ('정상', '운영중')
        ORDER BY f.facilityGrade ASC, f.evaluationScore DESC
        """)
    Page<FacilityProfile> findFacilitiesWithFilters(@Param("region") String region,
                                                   @Param("facilityType") String facilityType,
                                                   @Param("minCapacity") Integer minCapacity,
                                                   @Param("maxMonthlyFee") Integer maxMonthlyFee,
                                                   Pageable pageable);

    // ===== 통계 쿼리 =====

    /**
     * 지역별 시설 수 통계
     */
    @Query("SELECT f.region, COUNT(f) FROM FacilityProfile f GROUP BY f.region")
    List<Object[]> countByRegion();

    /**
     * 시설 타입별 통계
     */
    @Query("SELECT f.facilityType, COUNT(f) FROM FacilityProfile f GROUP BY f.facilityType")
    List<Object[]> countByFacilityType();

    /**
     * 시설 등급별 통계
     */
    @Query("SELECT f.facilityGrade, COUNT(f) FROM FacilityProfile f WHERE f.facilityGrade IS NOT NULL GROUP BY f.facilityGrade")
    List<Object[]> countByFacilityGrade();

    /**
     * 입주 가능 시설 수 카운트
     */
    @Query("SELECT COUNT(f) FROM FacilityProfile f WHERE f.totalCapacity > f.currentOccupancy")
    long countAvailableFacilities();

    /**
     * 평균 월 기본료 계산
     */
    @Query("SELECT AVG(f.monthlyBasicFee) FROM FacilityProfile f WHERE f.monthlyBasicFee IS NOT NULL")
    Double findAverageMonthlyBasicFee();

    /**
     * 시설 신뢰도 분포 (고신뢰도 시설 비율)
     */
    @Query("""
        SELECT 
            CASE WHEN f.facilityGrade IN ('A', 'B') THEN 'HIGH'
                 WHEN f.facilityGrade = 'C' THEN 'MEDIUM'
                 ELSE 'LOW' END as reliabilityLevel,
            COUNT(f)
        FROM FacilityProfile f 
        WHERE f.facilityGrade IS NOT NULL
        GROUP BY 
            CASE WHEN f.facilityGrade IN ('A', 'B') THEN 'HIGH'
                 WHEN f.facilityGrade = 'C' THEN 'MEDIUM'
                 ELSE 'LOW' END
        """)
    List<Object[]> getReliabilityDistribution();
}