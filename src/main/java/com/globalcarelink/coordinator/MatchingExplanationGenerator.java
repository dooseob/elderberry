package com.globalcarelink.coordinator;

import com.globalcarelink.health.HealthAssessment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchingExplanationGenerator {

    public String generateMatchReason(CoordinatorCareSettings coordinator, HealthAssessment assessment, double matchScore) {
        StringBuilder reason = new StringBuilder();
        
        if (isSpecialtyMatch(coordinator, assessment)) {
            reason.append("🎯 전문 분야 완벽 매칭: ");
            reason.append(getSpecialtyDescription(coordinator, assessment));
            reason.append("\n");
        }
        
        int experience = coordinator.getExperienceYears();
        reason.append("📊 경력: ").append(experience).append("년 (");
        if (experience >= 10) reason.append("최고 전문가");
        else if (experience >= 5) reason.append("숙련 전문가");
        else if (experience >= 2) reason.append("경력자");
        else reason.append("신입");
        reason.append(")\n");
        
        double satisfaction = coordinator.getCustomerSatisfaction();
        reason.append("⭐ 고객 만족도: ").append(satisfaction).append("/5.0");
        if (satisfaction >= 4.5) reason.append(" (최우수)");
        else if (satisfaction >= 4.0) reason.append(" (우수)");
        else if (satisfaction >= 3.5) reason.append(" (양호)");
        reason.append("\n");
        
        int successfulCases = coordinator.getSuccessfulCases();
        int totalCases = coordinator.getTotalCases();
        if (totalCases > 0) {
            double successRate = (double) successfulCases / totalCases * 100;
            reason.append("🏆 성공률: ").append(String.format("%.1f", successRate))
                  .append("% (").append(successfulCases).append("/").append(totalCases).append("건)\n");
        }
        
        reason.append("💼 전체 매칭 점수: ").append(String.format("%.1f", matchScore)).append("/5.0");
        
        return reason.toString();
    }

    private boolean isSpecialtyMatch(CoordinatorCareSettings coordinator, HealthAssessment assessment) {
        if (coordinator.getSpecialtyAreas() == null || coordinator.getSpecialtyAreas().isEmpty()) {
            return false;
        }
        
        if (assessment.getLtciGrade() == 6 || assessment.getCommunicationLevel() == 3) {
            if (coordinator.hasSpecialty("dementia")) return true;
        }
        
        if (assessment.getCareGradeLevel() <= 2) {
            if (coordinator.hasSpecialty("medical")) return true;
        }
        
        if (assessment.getMobilityLevel() >= 2) {
            if (coordinator.hasSpecialty("rehabilitation")) return true;
        }
        
        return false;
    }

    private String getSpecialtyDescription(CoordinatorCareSettings coordinator, HealthAssessment assessment) {
        StringBuilder description = new StringBuilder();
        
        if (assessment.getLtciGrade() == 6 || assessment.getCommunicationLevel() == 3) {
            if (coordinator.hasSpecialty("dementia")) {
                description.append("치매 전문 케어");
            }
        }
        
        if (assessment.getCareGradeLevel() <= 2) {
            if (coordinator.hasSpecialty("medical")) {
                if (description.length() > 0) description.append(", ");
                description.append("의료 전문 케어");
            }
        }
        
        if (assessment.getMobilityLevel() >= 2) {
            if (coordinator.hasSpecialty("rehabilitation")) {
                if (description.length() > 0) description.append(", ");
                description.append("재활 전문 케어");
            }
        }
        
        return description.toString();
    }
} 