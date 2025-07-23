package com.globalcarelink.coordinator;

import com.globalcarelink.health.HealthAssessment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OptimizedCoordinatorMatchingService {

    private final CoordinatorCareSettingsRepository careSettingsRepository;
    private final CoordinatorLanguageSkillRepository languageSkillRepository;
    private final CoordinatorWorkloadOptimizer workloadOptimizer;
    private final MatchingExplanationGenerator explanationGenerator;

    @Cacheable(value = "coordinator-matches", 
               key = "#assessment.id + '_' + #preference.preferredLanguage + '_' + #preference.preferredRegion + '_' + #preference.maxResults",
               condition = "#preference.maxResults <= 50")
    public List<CoordinatorMatch> findOptimalMatches(HealthAssessment assessment, MatchingPreference preference) {
        log.info("코디네이터 매칭 시작 - 케어등급: {}, 언어: {}", 
                assessment.getOverallCareGrade(), preference.getPreferredLanguage());

        List<CoordinatorCareSettings> eligibleCoordinators = filterByBasicQualifications(assessment);
        log.debug("1단계 기본 자격 필터링: {}명", eligibleCoordinators.size());

        List<CoordinatorCareSettings> settingsMatched = filterByCoordinatorSettings(eligibleCoordinators, assessment);
        log.debug("2단계 코디네이터 설정 매칭: {}명", settingsMatched.size());

        List<CoordinatorMatch> scoredMatches = calculateOptimalMatches(settingsMatched, assessment, preference);
        log.debug("3단계 AI 스코어링 완료: {}건", scoredMatches.size());

        List<CoordinatorMatch> optimizedMatches = workloadOptimizer.optimizeWorkloadDistribution(scoredMatches);
        log.info("매칭 완료 - 총 {}명의 코디네이터 매칭", optimizedMatches.size());

        return optimizedMatches.stream()
                .limit(preference.getMaxResults())
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "coordinator-matches", allEntries = true)
    public void evictMatchingCache() {
        log.info("코디네이터 매칭 캐시 삭제");
    }

    @Cacheable(value = "coordinator-settings", key = "#careGrade")
    private List<CoordinatorCareSettings> filterByBasicQualifications(HealthAssessment assessment) {
        Integer careGrade = assessment.getCareGradeLevel();
        return careSettingsRepository.findEligibleForCareGrade(careGrade);
    }

    private List<CoordinatorCareSettings> filterByCoordinatorSettings(
            List<CoordinatorCareSettings> coordinators, HealthAssessment assessment) {
        
        return coordinators.stream()
                .filter(coordinator -> coordinator.isEligibleForCareGrade(assessment.getCareGradeLevel()))
                .filter(CoordinatorCareSettings::canTakeNewCase)
                .collect(Collectors.toList());
    }

    private List<CoordinatorMatch> calculateOptimalMatches(
            List<CoordinatorCareSettings> coordinators, 
            HealthAssessment assessment, 
            MatchingPreference preference) {
        
        return coordinators.stream()
                .map(coordinator -> createCoordinatorMatch(coordinator, assessment, preference))
                .sorted(Comparator.comparing(CoordinatorMatch::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    @Cacheable(value = "language-skills", key = "#coordinatorId")
    private List<CoordinatorLanguageSkill> getCoordinatorLanguageSkills(String coordinatorId) {
        return languageSkillRepository.findByCoordinatorIdAndIsActiveTrueOrderByPriorityOrder(coordinatorId);
    }

    private CoordinatorMatch createCoordinatorMatch(
            CoordinatorCareSettings coordinator, 
            HealthAssessment assessment, 
            MatchingPreference preference) {
        
        double matchScore = calculateComprehensiveMatchScore(coordinator, assessment, preference);
        String matchReason = explanationGenerator.generateMatchReason(coordinator, assessment, matchScore);
        
        List<CoordinatorLanguageSkill> languageSkills = getCoordinatorLanguageSkills(coordinator.getCoordinatorId());

        return CoordinatorMatch.builder()
                .coordinatorId(coordinator.getCoordinatorId())
                .matchScore(matchScore)
                .matchReason(matchReason)
                .experienceYears(coordinator.getExperienceYears())
                .successfulCases(coordinator.getSuccessfulCases())
                .customerSatisfaction(coordinator.getCustomerSatisfaction())
                .specialtyAreas(coordinator.getSpecialtyAreas())
                .compatibleCareGrades(coordinator.getPreferredCareGrades())
                .languageSkills(languageSkills)
                .availableWeekends(coordinator.getAvailableWeekends())
                .availableEmergency(coordinator.getAvailableEmergency())
                .workingRegions(coordinator.getWorkingRegions())
                .currentActiveCases(getCurrentActiveCases(coordinator.getCoordinatorId()))
                .maxSimultaneousCases(coordinator.getMaxSimultaneousCases())
                .workloadRatio(calculateWorkloadRatio(coordinator))
                .build();
    }

    private double calculateComprehensiveMatchScore(
            CoordinatorCareSettings coordinator, 
            HealthAssessment assessment, 
            MatchingPreference preference) {
        
        double score = 0.0;

        score += calculateSpecialtyMatchScore(coordinator, assessment) * 0.4;
        score += calculateExperienceScore(coordinator) * 0.25;
        score += coordinator.getCustomerSatisfaction() * 0.2;
        score += calculateLocationScore(coordinator, preference) * 0.1;
        score += calculateAvailabilityBonus(coordinator) * 0.05;

        return Math.min(score, 5.0);
    }

    private double calculateSpecialtyMatchScore(CoordinatorCareSettings coordinator, HealthAssessment assessment) {
        double specialtyScore = 0.0;

        if (assessment.getLtciGrade() == 6 || assessment.getCommunicationLevel() == 3) {
            if (coordinator.hasSpecialty("dementia")) {
                specialtyScore += 2.0;
            }
        }

        if (assessment.getCareGradeLevel() <= 2 || assessment.getCareTargetStatus() <= 2) {
            if (coordinator.hasSpecialty("medical")) {
                specialtyScore += 2.0;
            }
        }

        if (assessment.getMobilityLevel() >= 2) {
            if (coordinator.hasSpecialty("rehabilitation")) {
                specialtyScore += 1.5;
            }
        }

        return Math.min(specialtyScore, 5.0);
    }

    private double calculateExperienceScore(CoordinatorCareSettings coordinator) {
        int experience = coordinator.getExperienceYears();
        double successRate = coordinator.getSuccessRate();
        
        double baseScore = switch (experience / 2) {
            case 0 -> 2.0;
            case 1 -> 3.0;
            case 2, 3 -> 4.0;
            default -> 5.0;
        };

        return Math.min(baseScore + (successRate * 1.0), 5.0);
    }

    private double calculateLocationScore(CoordinatorCareSettings coordinator, MatchingPreference preference) {
        if (preference.getPreferredRegion() == null) return 3.0;
        
        if (coordinator.getWorkingRegions() != null && 
            coordinator.getWorkingRegions().contains(preference.getPreferredRegion())) {
            return 5.0;
        }
        
        return 2.0;
    }

    private double calculateAvailabilityBonus(CoordinatorCareSettings coordinator) {
        double workloadRatio = calculateWorkloadRatio(coordinator);
        
        if (workloadRatio >= 1.0) return 0.0;
        if (workloadRatio >= 0.8) return 1.0;
        if (workloadRatio >= 0.6) return 2.0;
        if (workloadRatio >= 0.4) return 3.0;
        return 4.0;
    }

    private double calculateWorkloadRatio(CoordinatorCareSettings coordinator) {
        int currentCases = getCurrentActiveCases(coordinator.getCoordinatorId());
        return (double) currentCases / coordinator.getMaxSimultaneousCases();
    }

    private int getCurrentActiveCases(String coordinatorId) {
        return 0;
    }
} 