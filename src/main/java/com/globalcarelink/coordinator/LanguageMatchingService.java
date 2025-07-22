package com.globalcarelink.coordinator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 언어 기반 코디네이터 매칭 서비스
 * 재외동포의 언어 선호도와 코디네이터 언어 능력을 매칭
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LanguageMatchingService {

    private final CoordinatorLanguageSkillRepository languageSkillRepository;

    /**
     * 언어 기반 코디네이터 추천
     */
    public List<CoordinatorLanguageMatch> findLanguageCompatibleCoordinators(
        String preferredLanguage, 
        String countryCode, 
        boolean needsProfessionalConsultation) {
        
        log.debug("언어 기반 코디네이터 검색 - 언어: {}, 국가: {}, 전문상담: {}", 
                preferredLanguage, countryCode, needsProfessionalConsultation);

        // 1. 해당 언어 가능 코디네이터 조회
        List<CoordinatorLanguageSkill> languageSkills = 
            languageSkillRepository.findByLanguageCodeAndIsActiveTrue(preferredLanguage.toUpperCase());

        // 2. 전문 상담 필요 시 수준 필터링
        if (needsProfessionalConsultation) {
            languageSkills = languageSkills.stream()
                .filter(CoordinatorLanguageSkill::canProvideProfessionalConsultation)
                .collect(Collectors.toList());
        }

        // 3. 국가 경험 가산점 적용
        List<CoordinatorLanguageMatch> matches = languageSkills.stream()
            .map(skill -> createLanguageMatch(skill, countryCode))
            .sorted(Comparator.comparing(CoordinatorLanguageMatch::getMatchScore).reversed())
            .collect(Collectors.toList());

        log.info("언어 매칭 완료 - 언어: {}, 매칭된 코디네이터: {}명", preferredLanguage, matches.size());
        
        return matches;
    }

    /**
     * 다국어 지원 코디네이터 조회
     */
    public List<CoordinatorMultilingualProfile> findMultilingualCoordinators() {
        // 언어별 그룹핑
        Map<String, List<CoordinatorLanguageSkill>> skillsByCoordinator = 
            languageSkillRepository.findByIsActiveTrueOrderByPriorityOrder().stream()
                .collect(Collectors.groupingBy(CoordinatorLanguageSkill::getCoordinatorId));

        return skillsByCoordinator.entrySet().stream()
            .map(entry -> {
                String coordinatorId = entry.getKey();
                List<CoordinatorLanguageSkill> skills = entry.getValue();
                
                return CoordinatorMultilingualProfile.builder()
                    .coordinatorId(coordinatorId)
                    .languageSkills(skills)
                    .totalLanguages(skills.size())
                    .averageScore(calculateAverageLanguageScore(skills))
                    .hasNativeLanguages(hasNativeLanguages(skills))
                    .supportedCountries(getSupportedCountries(skills))
                    .build();
            })
            .sorted(Comparator.comparing(CoordinatorMultilingualProfile::getAverageScore).reversed())
            .collect(Collectors.toList());
    }

    /**
     * 특정 국가의 재외동포를 위한 최적 코디네이터 추천
     */
    public List<CoordinatorLanguageMatch> findOptimalCoordinatorForOverseasKorean(
        String countryCode, 
        String preferredLanguage,
        List<String> additionalLanguages) {
        
        List<CoordinatorLanguageMatch> allMatches = new ArrayList<>();
        
        // 1. 주 언어 매칭
        if (preferredLanguage != null) {
            allMatches.addAll(findLanguageCompatibleCoordinators(preferredLanguage, countryCode, true));
        }
        
        // 2. 추가 언어 매칭 (낮은 우선순위)
        if (additionalLanguages != null && !additionalLanguages.isEmpty()) {
            for (String additionalLang : additionalLanguages) {
                List<CoordinatorLanguageMatch> additionalMatches = 
                    findLanguageCompatibleCoordinators(additionalLang, countryCode, false);
                
                // 추가 언어는 매칭 점수 가중치 적용
                additionalMatches.forEach(match -> 
                    match.setMatchScore(match.getMatchScore() * 0.7));
                
                allMatches.addAll(additionalMatches);
            }
        }
        
        // 3. 중복 제거 및 정렬
        return allMatches.stream()
            .collect(Collectors.groupingBy(match -> match.getLanguageSkill().getCoordinatorId()))
            .values().stream()
            .map(matches -> matches.stream().max(Comparator.comparing(CoordinatorLanguageMatch::getMatchScore)).orElse(null))
            .filter(match -> match != null)
            .sorted(Comparator.comparing(CoordinatorLanguageMatch::getMatchScore).reversed())
            .limit(10)
            .collect(Collectors.toList());
    }

    /**
     * 언어별 서비스 요금 계산
     */
    public ServiceFeeCalculation calculateLanguageServiceFee(
        String coordinatorId, 
        String languageCode, 
        double baseFee) {
        
        CoordinatorLanguageSkill skill = languageSkillRepository
            .findByCoordinatorIdAndLanguageCodeAndIsActiveTrue(coordinatorId, languageCode)
            .orElse(null);
        
        if (skill == null || skill.getServiceFeeRate() == null) {
            return ServiceFeeCalculation.builder()
                .baseFee(baseFee)
                .languageFee(baseFee)
                .feeRate(1.0)
                .additionalFee(0.0)
                .hasLanguagePremium(false)
                .build();
        }
        
        double languageFee = baseFee * skill.getServiceFeeRate();
        double additionalFee = languageFee - baseFee;
        
        return ServiceFeeCalculation.builder()
            .baseFee(baseFee)
            .languageFee(languageFee)
            .feeRate(skill.getServiceFeeRate())
            .additionalFee(additionalFee)
            .hasLanguagePremium(skill.getServiceFeeRate() > 1.0)
            .languageName(skill.getLanguageName())
            .proficiencyLevel(skill.getProficiencyLevel().name())
            .build();
    }

    /**
     * 코디네이터별 지원 가능 언어 통계
     */
    public Map<String, Long> getLanguageDistributionStatistics() {
        return languageSkillRepository.findByIsActiveTrueOrderByPriorityOrder().stream()
            .collect(Collectors.groupingBy(
                CoordinatorLanguageSkill::getLanguageCode,
                Collectors.counting()
            ));
    }

    /**
     * 부족한 언어 분석 (수요 대비 공급 부족)
     */
    public List<LanguageGapAnalysis> analyzeLanguageGaps() {
        Map<String, Long> currentSupply = getLanguageDistributionStatistics();
        
        // 재외동포 주요 거주국 기반 수요 추정
        Map<String, Long> estimatedDemand = Map.of(
            "EN", 50L, // 영어권 재외동포 다수
            "ZH", 40L, // 중국 거주 재외동포
            "JP", 30L, // 일본 거주 재외동포
            "ES", 15L, // 남미 재외동포
            "RU", 10L, // 구소련 재외동포
            "VI", 8L,  // 베트남 진출 증가
            "TH", 5L   // 동남아 진출
        );
        
        return estimatedDemand.entrySet().stream()
            .map(entry -> {
                String langCode = entry.getKey();
                Long demand = entry.getValue();
                Long supply = currentSupply.getOrDefault(langCode, 0L);
                
                return LanguageGapAnalysis.builder()
                    .languageCode(langCode)
                    .languageName(getLanguageName(langCode))
                    .estimatedDemand(demand)
                    .currentSupply(supply)
                    .gap(demand - supply)
                    .supplyRatio((double) supply / demand)
                    .priority(demand - supply > 0 ? "HIGH" : "ADEQUATE")
                    .build();
            })
            .sorted(Comparator.comparing(LanguageGapAnalysis::getGap).reversed())
            .collect(Collectors.toList());
    }

    // ===== 내부 헬퍼 메서드 =====

    private CoordinatorLanguageMatch createLanguageMatch(CoordinatorLanguageSkill skill, String countryCode) {
        double matchScore = skill.calculateMatchingScore();
        
        // 국가 매칭 보너스
        if (skill.matchesCountry(countryCode)) {
            matchScore += 0.5;
        }
        
        // 현지 경험 추가 보너스
        if (skill.hasCountryExperience() && 
            skill.getCountryExperience().toLowerCase().contains(getCountryName(countryCode).toLowerCase())) {
            matchScore += 1.0;
        }
        
        return CoordinatorLanguageMatch.builder()
            .languageSkill(skill)
            .matchScore(Math.min(matchScore, 5.0))
            .matchReason(generateMatchReason(skill, countryCode, matchScore))
            .build();
    }

    private double calculateAverageLanguageScore(List<CoordinatorLanguageSkill> skills) {
        return skills.stream()
            .mapToDouble(CoordinatorLanguageSkill::calculateMatchingScore)
            .average()
            .orElse(0.0);
    }

    private boolean hasNativeLanguages(List<CoordinatorLanguageSkill> skills) {
        return skills.stream()
            .anyMatch(skill -> skill.getProficiencyLevel() == CoordinatorLanguageSkill.LanguageProficiency.NATIVE);
    }

    private List<String> getSupportedCountries(List<CoordinatorLanguageSkill> skills) {
        return skills.stream()
            .filter(skill -> skill.getCountryExperience() != null)
            .map(CoordinatorLanguageSkill::getCountryExperience)
            .collect(Collectors.toList());
    }

    private String generateMatchReason(CoordinatorLanguageSkill skill, String countryCode, double matchScore) {
        StringBuilder reason = new StringBuilder();
        
        reason.append("🗣️ ").append(skill.getLanguageName())
              .append(" (").append(skill.getProficiencyDisplayName()).append(")");
        
        if (skill.hasCertification()) {
            reason.append(" ✓ ").append(skill.getCertification());
        }
        
        if (skill.matchesCountry(countryCode)) {
            reason.append(" 🌍 ").append(getCountryName(countryCode)).append(" 전문");
        }
        
        if (skill.hasCountryExperience()) {
            reason.append(" 📍 현지경험: ").append(skill.getCountryExperience());
        }
        
        reason.append(" (매칭도: ").append(String.format("%.1f", matchScore)).append("/5.0)");
        
        return reason.toString();
    }

    private String getCountryName(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "US" -> "미국";
            case "CN" -> "중국";
            case "JP" -> "일본";
            case "CA" -> "캐나다";
            case "AU" -> "호주";
            case "GB" -> "영국";
            case "DE" -> "독일";
            case "VN" -> "베트남";
            case "TH" -> "태국";
            case "RU" -> "러시아";
            default -> countryCode;
        };
    }

    private String getLanguageName(String langCode) {
        return switch (langCode.toUpperCase()) {
            case "EN" -> "영어";
            case "ZH" -> "중국어";
            case "JP" -> "일본어";
            case "ES" -> "스페인어";
            case "VI" -> "베트남어";
            case "TH" -> "태국어";
            case "RU" -> "러시아어";
            case "KO" -> "한국어";
            default -> langCode;
        };
    }

    // ===== DTO 클래스들 =====

    @lombok.Builder
    @lombok.Getter
    @lombok.Setter
    public static class CoordinatorLanguageMatch {
        private CoordinatorLanguageSkill languageSkill;
        private double matchScore;
        private String matchReason;
    }

    @lombok.Builder
    @lombok.Getter
    public static class CoordinatorMultilingualProfile {
        private String coordinatorId;
        private List<CoordinatorLanguageSkill> languageSkills;
        private int totalLanguages;
        private double averageScore;
        private boolean hasNativeLanguages;
        private List<String> supportedCountries;
    }

    @lombok.Builder
    @lombok.Getter
    public static class ServiceFeeCalculation {
        private double baseFee;
        private double languageFee;
        private double feeRate;
        private double additionalFee;
        private boolean hasLanguagePremium;
        private String languageName;
        private String proficiencyLevel;
    }

    @lombok.Builder
    @lombok.Getter
    public static class LanguageGapAnalysis {
        private String languageCode;
        private String languageName;
        private Long estimatedDemand;
        private Long currentSupply;
        private Long gap;
        private Double supplyRatio;
        private String priority;
    }
}