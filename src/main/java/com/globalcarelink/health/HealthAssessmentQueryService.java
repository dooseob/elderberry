package com.globalcarelink.health;

import com.globalcarelink.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 건강 평가 전문 조회 서비스
 * 복잡한 조건별 조회 로직 담당 (SRP 원칙 적용)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class HealthAssessmentQueryService {

    private final HealthAssessmentRepository healthAssessmentRepository;

    /**
     * 특정 케어 등급 범위의 평가 조회
     */
    public List<HealthAssessment> getAssessmentsByCareGradeRange(Integer minGrade, Integer maxGrade) {
        log.debug("케어 등급 범위 조회 - 최소: {}, 최대: {}", minGrade, maxGrade);
        
        if (minGrade == null || maxGrade == null) {
            throw new CustomException.BadRequest("케어 등급 범위는 필수입니다");
        }
        
        if (minGrade < 1 || maxGrade > 6 || minGrade > maxGrade) {
            throw new CustomException.BadRequest("유효하지 않은 케어 등급 범위입니다 (1-6)");
        }
        
        return healthAssessmentRepository.findByCareGradeRange(minGrade, maxGrade);
    }

    /**
     * 호스피스 케어 대상자 조회
     * - 1-2등급 최중증/중증 환자
     * - 말기 질환 보유자
     */
    public List<HealthAssessment> getHospiceCareTargets() {
        log.debug("호스피스 케어 대상자 조회");
        return healthAssessmentRepository.findHospiceCareTargets();
    }

    /**
     * 치매 전문 케어 대상자 조회
     * - 인지지원등급 또는 치매 관련 질환
     * - 의사소통 능력 저하자
     */
    public List<HealthAssessment> getDementiaCareTargets() {
        log.debug("치매 전문 케어 대상자 조회");
        return healthAssessmentRepository.findDementiaCareTargets();
    }

    /**
     * 중증 환자 조회
     * - 1-3등급 중증 이상
     * - ADL 점수 200점 이상
     */
    public List<HealthAssessment> getSevereCareTargets() {
        log.debug("중증 환자 조회");
        return healthAssessmentRepository.findSevereCareTargets();
    }

    /**
     * 재외동포 대상 평가 조회
     * - 해외 거주 한국인 대상 평가
     */
    public List<HealthAssessment> getOverseasKoreanAssessments() {
        log.debug("재외동포 대상 평가 조회");
        return healthAssessmentRepository.findOverseasKoreanAssessments();
    }

    /**
     * ADL 점수 범위별 조회
     */
    public List<HealthAssessment> getAssessmentsByAdlScoreRange(Integer minScore, Integer maxScore) {
        log.debug("ADL 점수 범위 조회 - 최소: {}, 최대: {}", minScore, maxScore);
        
        if (minScore == null || maxScore == null) {
            throw new CustomException.BadRequest("ADL 점수 범위는 필수입니다");
        }
        
        if (minScore < 100 || maxScore > 300 || minScore > maxScore) {
            throw new CustomException.BadRequest("유효하지 않은 ADL 점수 범위입니다 (100-300)");
        }
        
        return healthAssessmentRepository.findByAdlScoreRange(minScore, maxScore);
    }

    /**
     * 회원의 평가 개선 추이 분석
     */
    public List<Map<String, Object>> getMemberAssessmentTrend(String memberId) {
        log.debug("회원 평가 추이 분석 - 회원: {}", memberId);
        
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new CustomException.BadRequest("회원 ID는 필수입니다");
        }
        
        return healthAssessmentRepository.findMemberAssessmentTrend(memberId);
    }

    /**
     * 완성된 평가만 조회
     */
    public List<HealthAssessment> getCompleteAssessments() {
        log.debug("완성된 평가 조회");
        return healthAssessmentRepository.findCompleteAssessments();
    }

    /**
     * 회원별 건강 평가 페이징 조회
     */
    public Page<HealthAssessment> getAssessmentsByMemberId(String memberId, Pageable pageable) {
        log.debug("회원별 평가 페이징 조회 - 회원: {}, 페이지: {}", memberId, pageable.getPageNumber());
        
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new CustomException.BadRequest("회원 ID는 필수입니다");
        }
        
        return healthAssessmentRepository.findByMemberIdOrderByAssessmentDateDesc(memberId, pageable);
    }

    /**
     * 회원별 건강 평가 이력 조회 (전체)
     */
    public List<HealthAssessment> getAssessmentHistoryByMemberId(String memberId) {
        log.debug("회원별 평가 이력 조회 - 회원: {}", memberId);
        
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new CustomException.BadRequest("회원 ID는 필수입니다");
        }
        
        return healthAssessmentRepository.findByMemberIdOrderByAssessmentDateDesc(memberId);
    }

    /**
     * 특정 질환 유형별 평가 조회
     */
    public List<HealthAssessment> getAssessmentsByDiseaseType(String diseaseType) {
        log.debug("질환 유형별 평가 조회 - 질환: {}", diseaseType);
        
        if (diseaseType == null || diseaseType.trim().isEmpty()) {
            throw new CustomException.BadRequest("질환 유형은 필수입니다");
        }
        
        return healthAssessmentRepository.findByDiseaseTypesContaining(diseaseType);
    }

    /**
     * 연령대별 평가 조회
     */
    public List<HealthAssessment> getAssessmentsByAgeRange(Integer minAge, Integer maxAge) {
        log.debug("연령대별 평가 조회 - 최소: {}세, 최대: {}세", minAge, maxAge);
        
        if (minAge == null || maxAge == null) {
            throw new CustomException.BadRequest("연령 범위는 필수입니다");
        }
        
        if (minAge < 0 || maxAge > 120 || minAge > maxAge) {
            throw new CustomException.BadRequest("유효하지 않은 연령 범위입니다");
        }
        
        int currentYear = java.time.LocalDate.now().getYear();
        int maxBirthYear = currentYear - minAge;
        int minBirthYear = currentYear - maxAge;
        
        return healthAssessmentRepository.findByBirthYearBetween(minBirthYear, maxBirthYear);
    }
} 