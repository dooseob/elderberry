package com.globalcarelink.health;

import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.ValidationUtil;
import com.globalcarelink.health.dto.HealthAssessmentCreateRequest;
import com.globalcarelink.health.dto.HealthAssessmentUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 건강 상태 평가 핵심 서비스
 * CRUD 기능에 집중 (SRP 원칙 적용)
 * KB라이프생명 기반 돌봄지수 체크 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class HealthAssessmentService {

    private final HealthAssessmentRepository healthAssessmentRepository;
    private final CareGradeCalculator careGradeCalculator;

    /**
     * 건강 평가 생성
     * 캐시 업데이트 및 무효화 적용
     */
    @Transactional
    @CachePut(value = "health-assessments", key = "#result.id")
    @CacheEvict(value = "health-assessments", key = "'member_' + #request.memberId + '_latest'")
    public HealthAssessment createAssessment(HealthAssessmentCreateRequest request) {
        log.info("건강 평가 생성 시작 - 회원: {}", request.getMemberId());

        // 입력값 검증
        validateAssessmentRequest(request);

        // 엔티티 생성
        HealthAssessment assessment = HealthAssessment.builder()
                .memberId(request.getMemberId())
                .gender(request.getGender())
                .birthYear(request.getBirthYear())
                .mobilityLevel(request.getMobilityLevel())
                .eatingLevel(request.getEatingLevel())
                .toiletLevel(request.getToiletLevel())
                .communicationLevel(request.getCommunicationLevel())
                .ltciGrade(request.getLtciGrade())
                .careTargetStatus(request.getCareTargetStatus() != null ? request.getCareTargetStatus() : 4)
                .mealType(request.getMealType() != null ? request.getMealType() : 1)
                .diseaseTypes(request.getDiseaseTypes())
                .assessmentDate(LocalDateTime.now())
                .build();

        // ADL 점수 자동 계산
        assessment.calculateAdlScore();

        // 케어 등급 계산 및 설정
        CareGradeCalculator.CareGradeResult gradeResult = careGradeCalculator.calculateComprehensiveGrade(assessment);
        assessment.setOverallCareGrade(gradeResult.getGradeName());

        // 저장
        HealthAssessment saved = healthAssessmentRepository.save(assessment);

        log.info("건강 평가 생성 완료 - ID: {}, 회원: {}, 등급: {}", 
                saved.getId(), request.getMemberId(), gradeResult.getGradeName());

        return saved;
    }

    /**
     * ID로 건강 평가 조회
     */
    @Cacheable(value = "health-assessments", key = "#assessmentId")
    public Optional<HealthAssessment> getAssessmentById(Long assessmentId) {
        log.debug("건강 평가 조회 - ID: {}", assessmentId);
        
        if (assessmentId == null || assessmentId <= 0) {
            throw new CustomException.BadRequest("유효하지 않은 평가 ID입니다");
        }
        
        return healthAssessmentRepository.findById(assessmentId);
    }

    /**
     * 회원별 최신 건강 평가 조회
     */
    @Cacheable(value = "health-assessments", key = "'member_' + #memberId + '_latest'")
    public Optional<HealthAssessment> getLatestAssessmentByMember(String memberId) {
        log.debug("회원 최신 건강 평가 조회 - 회원: {}", memberId);
        
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new CustomException.BadRequest("회원 ID는 필수입니다");
        }
        
        return healthAssessmentRepository.findTopByMemberIdOrderByAssessmentDateDesc(memberId);
    }

    /**
     * 건강 평가 수정
     * 캐시 업데이트 및 무효화 적용
     */
    @Transactional
    @CachePut(value = "health-assessments", key = "#assessmentId")
    @CacheEvict(value = "health-assessments", key = "'member_' + #result.memberId + '_latest'")
    public HealthAssessment updateAssessment(Long assessmentId, HealthAssessmentUpdateRequest request) {
        log.info("건강 평가 수정 시작 - ID: {}", assessmentId);

        // 기존 평가 조회
        HealthAssessment assessment = healthAssessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new CustomException.NotFound("건강 평가를 찾을 수 없습니다: " + assessmentId));

        // 입력값 검증
        validateUpdateRequest(request);

        // 평가 정보 업데이트
        updateAssessmentFields(assessment, request);

        // 평가 날짜 갱신
        assessment.setAssessmentDate(LocalDateTime.now());

        // ADL 점수 재계산
        assessment.calculateAdlScore();

        // 케어 등급 재계산
        CareGradeCalculator.CareGradeResult gradeResult = careGradeCalculator.calculateComprehensiveGrade(assessment);
        assessment.setOverallCareGrade(gradeResult.getGradeName());

        HealthAssessment updated = healthAssessmentRepository.save(assessment);

        log.info("건강 평가 수정 완료 - ID: {}, 새 등급: {}", assessmentId, gradeResult.getGradeName());

        return updated;
    }

    /**
     * 케어 등급 계산 (별도 호출)
     */
    public CareGradeCalculator.CareGradeResult calculateCareGrade(HealthAssessment assessment) {
        if (assessment == null) {
            throw new CustomException.BadRequest("평가 정보가 필요합니다");
        }
        
        return careGradeCalculator.calculateComprehensiveGrade(assessment);
    }

    /**
     * 건강 평가 삭제
     */
    @Transactional
    @CacheEvict(value = {"health-assessments", "matching-statistics"}, allEntries = true)
    public void deleteAssessment(Long assessmentId) {
        log.info("건강 평가 삭제 시작 - ID: {}", assessmentId);
        
        HealthAssessment assessment = healthAssessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new CustomException.NotFound("건강 평가를 찾을 수 없습니다: " + assessmentId));

        healthAssessmentRepository.delete(assessment);
        
        log.info("건강 평가 삭제 완료 - ID: {}, 회원: {}", assessmentId, assessment.getMemberId());
    }

    /**
     * 평가 존재 여부 확인
     */
    public boolean existsById(Long assessmentId) {
        if (assessmentId == null || assessmentId <= 0) {
            return false;
        }
        return healthAssessmentRepository.existsById(assessmentId);
    }

    /**
     * 회원의 평가 존재 여부 확인
     */
    public boolean existsByMemberId(String memberId) {
        if (memberId == null || memberId.trim().isEmpty()) {
            return false;
        }
        return healthAssessmentRepository.findTopByMemberIdOrderByAssessmentDateDesc(memberId).isPresent();
    }

    /**
     * 평가 완성도 확인
     */
    public boolean isAssessmentComplete(Long assessmentId) {
        return getAssessmentById(assessmentId)
                .map(HealthAssessment::isComplete)
                .orElse(false);
    }

    /**
     * 모든 캐시 무효화
     */
    @CacheEvict(value = {"health-assessments", "matching-statistics"}, allEntries = true)
    public void evictAllCaches() {
        log.info("건강 평가 관련 모든 캐시 삭제");
    }

    // ===== 내부 검증 및 업데이트 메서드 =====

    private void validateAssessmentRequest(HealthAssessmentCreateRequest request) {
        // 필수 필드 검증
        if (request.getMemberId() == null || request.getMemberId().trim().isEmpty()) {
            throw new CustomException.BadRequest("회원 ID는 필수입니다");
        }
        
        if (request.getMobilityLevel() == null || request.getEatingLevel() == null ||
            request.getToiletLevel() == null || request.getCommunicationLevel() == null) {
            throw new CustomException.BadRequest("ADL 평가 4개 영역(걷기, 식사, 배변, 의사소통)은 모두 필수입니다");
        }

        // 범위 검증
        validateAdlLevels(request.getMobilityLevel(), request.getEatingLevel(), 
                         request.getToiletLevel(), request.getCommunicationLevel());

        // 출생년도 검증
        if (request.getBirthYear() != null && 
            (request.getBirthYear() < 1900 || request.getBirthYear() > LocalDateTime.now().getYear())) {
            throw new CustomException.BadRequest("출생년도가 유효하지 않습니다");
        }

        // 질환 정보 검증
        if (request.getDiseaseTypes() != null && request.getDiseaseTypes().length() > 200) {
            throw new CustomException.BadRequest("질환 정보는 200자를 초과할 수 없습니다");
        }
    }

    private void validateUpdateRequest(HealthAssessmentUpdateRequest request) {
        // ADL 수준 검증 (null이 아닌 경우만)
        if (request.getMobilityLevel() != null || request.getEatingLevel() != null ||
            request.getToiletLevel() != null || request.getCommunicationLevel() != null) {
            
            validateAdlLevels(request.getMobilityLevel(), request.getEatingLevel(), 
                             request.getToiletLevel(), request.getCommunicationLevel());
        }

        // 질환 정보 검증
        if (request.getDiseaseTypes() != null && request.getDiseaseTypes().length() > 200) {
            throw new CustomException.BadRequest("질환 정보는 200자를 초과할 수 없습니다");
        }
    }

    private void validateAdlLevels(Integer... levels) {
        for (Integer level : levels) {
            if (level != null && (level < 1 || level > 3)) {
                throw new CustomException.BadRequest("ADL 평가 수준은 1-3 사이여야 합니다");
            }
        }
    }

    private void updateAssessmentFields(HealthAssessment assessment, HealthAssessmentUpdateRequest request) {
        // ADL 평가 항목 업데이트
        if (request.getMobilityLevel() != null) {
            assessment.setMobilityLevel(request.getMobilityLevel());
        }
        if (request.getEatingLevel() != null) {
            assessment.setEatingLevel(request.getEatingLevel());
        }
        if (request.getToiletLevel() != null) {
            assessment.setToiletLevel(request.getToiletLevel());
        }
        if (request.getCommunicationLevel() != null) {
            assessment.setCommunicationLevel(request.getCommunicationLevel());
        }

        // 추가 정보 업데이트
        if (request.getLtciGrade() != null) {
            assessment.setLtciGrade(request.getLtciGrade());
        }
        if (request.getCareTargetStatus() != null) {
            assessment.setCareTargetStatus(request.getCareTargetStatus());
        }
        if (request.getMealType() != null) {
            assessment.setMealType(request.getMealType());
        }
        if (request.getDiseaseTypes() != null) {
            assessment.setDiseaseTypes(request.getDiseaseTypes());
        }
    }
}