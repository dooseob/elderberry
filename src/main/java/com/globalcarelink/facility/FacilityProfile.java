package com.globalcarelink.facility;

import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * 요양시설 프로필 엔티티
 * 건강보험심사평가원 기준 A-E 등급 시스템 적용
 * 시설 타입별 분류 및 전문성 관리
 */
@Entity
@Table(name = "facility_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class FacilityProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== 기본 정보 =====

    @Column(name = "facility_code", unique = true, length = 20)
    @Size(max = 20, message = "시설 코드는 20자 이하여야 합니다")
    private String facilityCode; // 장기요양기관 코드

    @Column(name = "facility_name", nullable = false, length = 100)
    @NotBlank(message = "시설명은 필수입니다")
    @Size(max = 100, message = "시설명은 100자 이하여야 합니다")
    private String facilityName;

    @Column(name = "facility_type", nullable = false, length = 50)
    @NotBlank(message = "시설 타입은 필수입니다")
    @Pattern(regexp = "^(양로시설|노인요양시설|노인요양공동생활가정|요양병원|치매전문시설|재활전문시설|호스피스전문시설|단기보호시설|주야간보호시설)$", 
             message = "유효하지 않은 시설 타입입니다")
    private String facilityType; // 시설 유형

    @Column(name = "facility_grade", length = 1)
    @Pattern(regexp = "^[A-E]$", message = "시설 등급은 A-E 중 하나여야 합니다")
    private String facilityGrade; // 건강보험심사평가원 A-E 등급

    @Column(name = "evaluation_score")
    @Min(value = 0, message = "평가 점수는 0 이상이어야 합니다")
    @Max(value = 100, message = "평가 점수는 100 이하여야 합니다")
    private Integer evaluationScore; // 건강보험심사평가원 평가 점수

    // ===== 연락처 및 주소 정보 =====

    @Column(name = "phone_number", length = 20)
    @Pattern(regexp = "^[0-9-]+$", message = "전화번호는 숫자와 하이픈만 포함해야 합니다")
    private String phoneNumber;

    @Column(name = "fax_number", length = 20)
    @Pattern(regexp = "^[0-9-]+$", message = "팩스번호는 숫자와 하이픈만 포함해야 합니다")
    private String faxNumber;

    @Column(name = "email", length = 100)
    @Email(message = "올바른 이메일 형식이어야 합니다")
    private String email;

    @Column(name = "homepage", length = 200)
    private String homepage;

    @Column(name = "address", nullable = false, length = 200)
    @NotBlank(message = "주소는 필수입니다")
    @Size(max = 200, message = "주소는 200자 이하여야 합니다")
    private String address; // 전체 주소

    @Column(name = "region", nullable = false, length = 20)
    @NotBlank(message = "지역은 필수입니다")
    private String region; // 시/도

    @Column(name = "district", nullable = false, length = 30)
    @NotBlank(message = "구/군은 필수입니다")
    private String district; // 구/군/시

    @Column(name = "detailed_address", length = 100)
    private String detailedAddress; // 상세 주소

    // ===== 위치 정보 (지도 연동) =====

    @Column(name = "latitude", precision = 10, scale = 8)
    @DecimalMin(value = "33.0", message = "위도는 33.0 이상이어야 합니다")
    @DecimalMax(value = "38.6", message = "위도는 38.6 이하여야 합니다")
    private BigDecimal latitude; // 위도

    @Column(name = "longitude", precision = 11, scale = 8)
    @DecimalMin(value = "124.0", message = "경도는 124.0 이상이어야 합니다")
    @DecimalMax(value = "132.0", message = "경도는 132.0 이하여야 합니다")
    private BigDecimal longitude; // 경도

    // ===== 시설 규모 및 수용 능력 =====

    @Column(name = "total_capacity", nullable = false)
    @NotNull(message = "총 정원은 필수입니다")
    @Min(value = 1, message = "총 정원은 1명 이상이어야 합니다")
    private Integer totalCapacity; // 총 정원

    @Column(name = "current_occupancy")
    @Min(value = 0, message = "현재 입주자 수는 0 이상이어야 합니다")
    @Builder.Default
    private Integer currentOccupancy = 0; // 현재 입주자 수

    @Column(name = "available_beds")
    @Min(value = 0, message = "가용 침대 수는 0 이상이어야 합니다")
    private Integer availableBeds; // 가용 침대 수 (자동 계산)

    @Column(name = "room_count")
    @Min(value = 1, message = "방 개수는 1개 이상이어야 합니다")
    private Integer roomCount; // 방 개수

    @Column(name = "building_floors")
    @Min(value = 1, message = "건물 층수는 1층 이상이어야 합니다")
    private Integer buildingFloors; // 건물 층수

    // ===== 케어 가능 등급 및 전문성 =====

    @ElementCollection
    @CollectionTable(name = "facility_acceptable_care_grades", joinColumns = @JoinColumn(name = "facility_id"))
    @Column(name = "care_grade")
    private Set<Integer> acceptableCareGrades; // 케어 가능 등급 [1,2,3,4,5,6]

    @ElementCollection
    @CollectionTable(name = "facility_specializations", joinColumns = @JoinColumn(name = "facility_id"))
    @Column(name = "specialization")
    private Set<String> specializations; // 전문 분야 ["dementia", "medical", "rehabilitation", "hospice"]

    // ===== 의료진 및 인력 정보 =====

    @Column(name = "has_doctor")
    @Builder.Default
    private Boolean hasDoctor = false; // 의사 상주 여부

    @Column(name = "has_nurse_24h")
    @Builder.Default
    private Boolean hasNurse24h = false; // 24시간 간호사 상주

    @Column(name = "nurse_count")
    @Min(value = 0, message = "간호사 수는 0 이상이어야 합니다")
    @Builder.Default
    private Integer nurseCount = 0; // 간호사 수

    @Column(name = "caregiver_count")
    @Min(value = 0, message = "요양보호사 수는 0 이상이어야 합니다")
    @Builder.Default
    private Integer caregiverCount = 0; // 요양보호사 수

    @Column(name = "social_worker_count")
    @Min(value = 0, message = "사회복지사 수는 0 이상이어야 합니다")
    @Builder.Default
    private Integer socialWorkerCount = 0; // 사회복지사 수

    // ===== 시설 특징 및 편의시설 =====

    @Column(name = "has_elevator")
    @Builder.Default
    private Boolean hasElevator = false; // 엘리베이터 보유

    @Column(name = "has_emergency_system")
    @Builder.Default
    private Boolean hasEmergencySystem = false; // 응급시스템 구비

    @Column(name = "has_rehabilitation_room")
    @Builder.Default
    private Boolean hasRehabilitationRoom = false; // 재활실 보유

    @Column(name = "has_medical_room")
    @Builder.Default
    private Boolean hasMedicalRoom = false; // 의무실 보유

    @Column(name = "has_dementia_program")
    @Builder.Default
    private Boolean hasDementiaProgram = false; // 치매 프로그램 운영

    @Column(name = "has_garden")
    @Builder.Default
    private Boolean hasGarden = false; // 정원/산책로 보유

    @Column(name = "has_parking")
    @Builder.Default
    private Boolean hasParking = false; // 주차장 보유

    // ===== 접근성 정보 =====

    @Column(name = "near_subway")
    @Builder.Default
    private Boolean nearSubway = false; // 지하철 접근성 (1km 이내)

    @Column(name = "near_hospital")
    @Builder.Default
    private Boolean nearHospital = false; // 병원 근접성 (3km 이내)

    @Column(name = "near_pharmacy")
    @Builder.Default
    private Boolean nearPharmacy = false; // 약국 근접성 (1km 이내)

    @Column(name = "public_transport_access", length = 100)
    private String publicTransportAccess; // 대중교통 접근 정보

    // ===== 비용 정보 =====

    @Column(name = "monthly_basic_fee")
    @Min(value = 0, message = "월 기본료는 0 이상이어야 합니다")
    private Integer monthlyBasicFee; // 월 기본료 (만원)

    @Column(name = "admission_fee")
    @Min(value = 0, message = "입소금은 0 이상이어야 합니다")
    private Integer admissionFee; // 입소금 (만원)

    @Column(name = "accepts_ltci")
    @Builder.Default
    private Boolean acceptsLtci = true; // 장기요양보험 적용 여부

    @Column(name = "accepts_basic_living")
    @Builder.Default
    private Boolean acceptsBasicLiving = false; // 기초생활수급자 수용 여부

    // ===== 운영 정보 =====

    @Column(name = "business_status", length = 20)
    @Pattern(regexp = "^(정상|운영중|휴업|폐업|말소)$", message = "유효하지 않은 운영 상태입니다")
    @Builder.Default
    private String businessStatus = "정상"; // 운영 상태

    @Column(name = "opening_date")
    private LocalDateTime openingDate; // 개원일

    @Column(name = "last_evaluation_date")
    private LocalDateTime lastEvaluationDate; // 마지막 평가일

    @Column(name = "next_evaluation_date")
    private LocalDateTime nextEvaluationDate; // 다음 평가 예정일

    // ===== 추가 정보 =====

    @Column(name = "description", length = 1000)
    @Size(max = 1000, message = "시설 설명은 1000자 이하여야 합니다")
    private String description; // 시설 설명

    @Column(name = "special_programs", length = 500)
    @Size(max = 500, message = "특별 프로그램 설명은 500자 이하여야 합니다")
    private String specialPrograms; // 특별 프로그램

    // ===== 비즈니스 메서드 =====

    /**
     * 가용 침대 수 자동 계산
     */
    public void calculateAvailableBeds() {
        if (totalCapacity != null && currentOccupancy != null) {
            this.availableBeds = totalCapacity - currentOccupancy;
        }
    }

    /**
     * 입주 가능 여부 확인
     */
    public boolean hasAvailableSpace() {
        calculateAvailableBeds();
        return availableBeds != null && availableBeds > 0;
    }

    /**
     * 특정 케어 등급 수용 가능 여부 확인
     */
    public boolean canAcceptCareGrade(Integer careGrade) {
        return acceptableCareGrades != null && acceptableCareGrades.contains(careGrade);
    }

    /**
     * 전문 분야 여부 확인
     */
    public boolean hasSpecialization(String specialization) {
        return specializations != null && specializations.contains(specialization);
    }

    /**
     * 재외동포 친화적 시설 점수 계산 (10점 만점)
     */
    public double getOverseasFriendlyScore() {
        double score = 0.0;
        
        // 시설 등급 (3점)
        if ("A".equals(facilityGrade)) score += 3.0;
        else if ("B".equals(facilityGrade)) score += 2.0;
        else if ("C".equals(facilityGrade)) score += 1.0;
        
        // 의료진 상주 (2점)
        if (Boolean.TRUE.equals(hasDoctor)) score += 1.0;
        if (Boolean.TRUE.equals(hasNurse24h)) score += 1.0;
        
        // 접근성 (2점)
        if (Boolean.TRUE.equals(nearSubway)) score += 1.0;
        if (Boolean.TRUE.equals(nearHospital)) score += 1.0;
        
        // 시설 현대화 (1.5점)
        if (Boolean.TRUE.equals(hasElevator)) score += 0.5;
        if (Boolean.TRUE.equals(hasEmergencySystem)) score += 0.5;
        if (Boolean.TRUE.equals(hasRehabilitationRoom)) score += 0.5;
        
        // 경제적 접근성 (1.5점)
        if (Boolean.TRUE.equals(acceptsLtci)) score += 1.0;
        if (Boolean.TRUE.equals(acceptsBasicLiving)) score += 0.5;
        
        return Math.min(score, 10.0);
    }

    /**
     * 시설 신뢰도 점수 계산 (100점 만점)
     */
    public int getReliabilityScore() {
        int score = 50; // 기본 점수
        
        // 운영 상태별 점수
        switch (businessStatus != null ? businessStatus : "정상") {
            case "정상", "운영중" -> score += 40;
            case "휴업" -> score += 10;
            case "폐업", "말소" -> score = 0;
        }
        
        // 시설 등급별 추가 점수
        if (facilityGrade != null) {
            switch (facilityGrade) {
                case "A" -> score += 10;
                case "B" -> score += 7;
                case "C" -> score += 5;
                case "D" -> score += 2;
                case "E" -> score -= 5;
            }
        }
        
        return Math.max(0, Math.min(score, 100));
    }

    /**
     * 월 예상 비용 범위 반환
     */
    public String getEstimatedMonthlyCostRange() {
        if (monthlyBasicFee == null) {
            return "상담 후 결정";
        }
        
        int basicFee = monthlyBasicFee;
        int minCost = basicFee;
        int maxCost = (int) (basicFee * 1.5); // 추가 서비스 비용 고려
        
        return String.format("%d-%d만원", minCost, maxCost);
    }

    /**
     * 시설 타입별 케어 등급 호환성 확인
     */
    public boolean isCompatibleWithCareGrade(Integer careGrade) {
        if (careGrade == null || facilityType == null) {
            return false;
        }
        
        return switch (facilityType) {
            case "양로시설" -> careGrade >= 4; // 4-5등급만 가능
            case "노인요양시설" -> true; // 모든 등급 가능
            case "요양병원" -> careGrade <= 3; // 1-3등급 권장
            case "노인요양공동생활가정" -> careGrade >= 3; // 3-5등급 적합
            case "치매전문시설" -> careGrade == 6; // 인지지원등급
            case "호스피스전문시설" -> careGrade <= 2; // 1-2등급 (생명위험)
            default -> canAcceptCareGrade(careGrade);
        };
    }

    /**
     * 시설 특징 요약 텍스트 생성
     */
    public String generateFacilitySummary() {
        StringBuilder summary = new StringBuilder();
        
        summary.append("🏥 ").append(facilityName).append(" (").append(facilityType).append(")\n");
        
        if (facilityGrade != null) {
            summary.append("⭐ 평가등급: ").append(facilityGrade).append("등급");
            if (evaluationScore != null) {
                summary.append(" (").append(evaluationScore).append("점)");
            }
            summary.append("\n");
        }
        
        summary.append("👥 정원: ").append(currentOccupancy != null ? currentOccupancy : 0)
               .append("/").append(totalCapacity).append("명");
        
        if (hasAvailableSpace()) {
            summary.append(" (입주 가능)");
        } else {
            summary.append(" (대기 필요)");
        }
        summary.append("\n");
        
        if (monthlyBasicFee != null) {
            summary.append("💰 월 비용: ").append(getEstimatedMonthlyCostRange()).append("\n");
        }
        
        if (Boolean.TRUE.equals(hasDoctor) || Boolean.TRUE.equals(hasNurse24h)) {
            summary.append("⚕️ 의료진: ");
            if (Boolean.TRUE.equals(hasDoctor)) summary.append("의사 상주 ");
            if (Boolean.TRUE.equals(hasNurse24h)) summary.append("24시간 간호 ");
            summary.append("\n");
        }
        
        return summary.toString();
    }
}