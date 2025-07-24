package com.globalcarelink.facility;

import com.globalcarelink.health.HealthAssessment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 시설 추천 서비스
 * 건강 상태 기반 시설 추천 및 매칭 로직을 담당
 * Strategy 패턴 적용으로 매칭 알고리즘의 확장성 향상
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FacilityRecommendationService {

    private final FacilityProfileRepository facilityProfileRepository;
    private final List<MatchingScoreStrategy> scoringStrategies;

    // ===== 시설 추천 및 매칭 =====

    /**
     * 건강 상태 기반 시설 추천
     * Strategy 패턴을 사용하여 다양한 점수 계산 전략을 조합
     */
    public List<FacilityRecommendation> recommendFacilities(HealthAssessment assessment, FacilityMatchingPreference preference) {
        log.info("시설 추천 시작 - 회원: {}, 케어등급: {}", assessment.getMemberId(), assessment.getOverallCareGrade());

        // 1. 기본 호환성 필터링
        List<FacilityProfile> compatibleFacilities = findCompatibleFacilities(assessment);
        
        // 2. 사용자 선호도 적용
        List<FacilityProfile> filteredFacilities = applyUserPreferences(compatibleFacilities, preference);
        
        // 3. 매칭 점수 계산 및 정렬 (Strategy 패턴 적용)
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

    /**
     * 전문성 기반 시설 조회
     */
    @Cacheable(value = "facility-profiles", key = "'dementia_specialized'")
    public List<FacilityProfile> getDementiaSpecializedFacilities() {
        log.debug("치매 전문 시설 조회");
        return facilityProfileRepository.findDementiaSpecializedFacilities();
    }

    @Cacheable(value = "facility-profiles", key = "'medical_specialized'")  
    public List<FacilityProfile> getMedicalSpecializedFacilities() {
        log.debug("의료 전문 시설 조회");
        return facilityProfileRepository.findMedicalSpecializedFacilities();
    }

    @Cacheable(value = "facility-profiles", key = "'rehabilitation_specialized'")
    public List<FacilityProfile> getRehabilitationSpecializedFacilities() {
        log.debug("재활 전문 시설 조회");
        return facilityProfileRepository.findRehabilitationSpecializedFacilities();
    }

    @Cacheable(value = "facility-profiles", key = "'hospice_specialized'")
    public List<FacilityProfile> getHospiceSpecializedFacilities() {
        log.debug("호스피스 전문 시설 조회");
        return facilityProfileRepository.findHospiceSpecializedFacilities();
    }

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

    // ===== 내부 헬퍼 메서드 =====

    /**
     * 건강 평가에 기반한 호환 시설 필터링
     */
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

    /**
     * 사용자 선호도 적용 필터링
     */
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

    /**
     * Strategy 패턴을 사용한 시설 매칭 점수 계산
     */
    private FacilityRecommendation calculateFacilityMatch(FacilityProfile facility, HealthAssessment assessment, FacilityMatchingPreference preference) {
        // 모든 전략의 점수를 가중합으로 계산
        double totalScore = scoringStrategies.stream()
                .mapToDouble(strategy -> strategy.calculateScore(facility, assessment, preference) * strategy.getWeight())
                .sum();
        
        String explanation = generateMatchExplanation(facility, assessment, totalScore);
        
        return FacilityRecommendation.builder()
                .facility(facility)
                .matchScore(totalScore)
                .explanation(explanation)
                .overseasFriendlyScore(facility.getOverseasFriendlyScore())
                .reliabilityScore(facility.getReliabilityScore())
                .estimatedMonthlyCost(facility.getEstimatedMonthlyCostRange())
                .build();
    }

    /**
     * 매칭 설명 생성
     */
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

    /**
     * 전문성 한국어 번역
     */
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
}

// ===== Strategy 패턴 인터페이스 및 구현체 =====

/**
 * 매칭 점수 계산 전략 인터페이스
 * Strategy 패턴을 통해 다양한 점수 계산 알고리즘을 확장 가능하게 설계
 */
interface MatchingScoreStrategy {
    /**
     * 시설 매칭 점수 계산
     * @param facility 대상 시설
     * @param assessment 건강 평가
     * @param preference 사용자 선호도
     * @return 0.0 ~ 5.0 사이의 점수
     */
    double calculateScore(FacilityProfile facility, HealthAssessment assessment, FacilityRecommendationService.FacilityMatchingPreference preference);
    
    /**
     * 전략의 가중치 반환
     * @return 가중치 (합계가 1.0이 되도록 조정)
     */
    double getWeight();
}

/**
 * 시설 등급 점수 계산 전략
 * 가중치: 30%
 */
@org.springframework.stereotype.Component
class FacilityGradeScoreStrategy implements MatchingScoreStrategy {
    
    @Override
    public double calculateScore(FacilityProfile facility, HealthAssessment assessment, FacilityRecommendationService.FacilityMatchingPreference preference) {
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
    
    @Override
    public double getWeight() {
        return 0.3; // 30% 가중치
    }
}

/**
 * 전문성 매칭 점수 계산 전략
 * 가중치: 25%
 */
@org.springframework.stereotype.Component
class SpecializationMatchScoreStrategy implements MatchingScoreStrategy {
    
    @Override
    public double calculateScore(FacilityProfile facility, HealthAssessment assessment, FacilityRecommendationService.FacilityMatchingPreference preference) {
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
    
    @Override
    public double getWeight() {
        return 0.25; // 25% 가중치
    }
}

/**
 * 의료진 적합성 점수 계산 전략
 * 가중치: 20%
 */
@org.springframework.stereotype.Component
class MedicalStaffScoreStrategy implements MatchingScoreStrategy {
    
    @Override
    public double calculateScore(FacilityProfile facility, HealthAssessment assessment, FacilityRecommendationService.FacilityMatchingPreference preference) {
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
    
    @Override
    public double getWeight() {
        return 0.2; // 20% 가중치
    }
}

/**
 * 위치 접근성 점수 계산 전략
 * 가중치: 15%
 */
@org.springframework.stereotype.Component
class LocationAccessibilityScoreStrategy implements MatchingScoreStrategy {
    
    @Override
    public double calculateScore(FacilityProfile facility, HealthAssessment assessment, FacilityRecommendationService.FacilityMatchingPreference preference) {
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
    
    @Override
    public double getWeight() {
        return 0.15; // 15% 가중치
    }
}

/**
 * 비용 적합성 점수 계산 전략
 * 가중치: 10%
 */
@org.springframework.stereotype.Component
class CostAffordabilityScoreStrategy implements MatchingScoreStrategy {
    
    @Override
    public double calculateScore(FacilityProfile facility, HealthAssessment assessment, FacilityRecommendationService.FacilityMatchingPreference preference) {
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
    
    @Override
    public double getWeight() {
        return 0.1; // 10% 가중치
    }
} 