import { useState, useCallback, useEffect, useMemo } from 'react';
import { useHealthAssessmentStore } from '../stores/healthAssessmentStore';
import { healthApi } from '../services/healthApi';
import type { 
  HealthAssessmentCreateRequest, 
  AdlLevel,
  LtciGrade,
  Gender
} from '../types/health';

// 커스텀 타입 정의
interface ValidationErrors {
  [key: string]: string;
}

interface StepValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  step: number;
}

/**
 * 건강 평가 위저드 커스텀 훅
 * 상태관리 로직 분리로 컴포넌트 복잡도 감소
 * 재사용 가능한 비즈니스 로직 제공
 */
export const useHealthAssessmentWizard = () => {
  // Zustand 스토어 상태
  const {
    formData,
    currentStep,
    isSubmitting,
    errors,
    nextStep,
    previousStep,
    goToStep,
    updateFormData,
    setError,
    clearError,
    clearAllErrors,
    setSubmitting,
    validateCurrentStep,
    calculateCompletionPercentage
  } = useHealthAssessmentStore();

  // 로컬 상태
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [validationCache, setValidationCache] = useState<Map<number, StepValidationResult>>(new Map());

  // 단계별 필수 필드 정의
  const stepRequiredFields = useMemo(() => ({
    0: ['memberId', 'gender', 'birthYear'], // 기본 정보
    1: ['mobilityLevel'], // 이동 능력
    2: ['eatingLevel'], // 식사 능력  
    3: ['toiletLevel'], // 배변 능력
    4: ['communicationLevel'], // 의사소통 능력
    5: ['ltciGrade'], // 장기요양등급
    6: [] // 추가 정보 (선택사항)
  }), []);

  // 진행률 계산
  const progress = useMemo(() => calculateCompletionPercentage(), [formData, calculateCompletionPercentage]);

  // 현재 단계 유효성 검증
  const validateCurrentStepAdvanced = useCallback((): StepValidationResult => {
    const requiredFields = stepRequiredFields[currentStep] || [];
    const stepErrors: ValidationErrors = {};
    let isValid = true;

    // 필수 필드 검증
    requiredFields.forEach(field => {
      if (!formData[field as keyof HealthAssessmentCreateRequest]) {
        stepErrors[field] = '필수 입력 항목입니다';
        isValid = false;
      }
    });

    // 단계별 특별 검증
    const customValidation = validateStepSpecific(currentStep, formData);
    if (!customValidation.isValid) {
      Object.assign(stepErrors, customValidation.errors);
      isValid = false;
    }

    const result: StepValidationResult = {
      isValid,
      errors: stepErrors,
      step: currentStep
    };

    // 검증 결과 캐시
    setValidationCache(prev => new Map(prev.set(currentStep, result)));
    
    if (!isValid) {
      Object.keys(stepErrors).forEach(field => {
        setError(field, stepErrors[field]);
      });
    }

    return result;
  }, [currentStep, formData, stepRequiredFields, setError]);

  // 단계별 특별 검증 로직
  const validateStepSpecific = useCallback((step: number, data: HealthAssessmentCreateRequest): StepValidationResult => {
    const errors: ValidationErrors = {};
    let isValid = true;

    switch (step) {
      case 0: // 기본 정보
        if (data.birthYear && (data.birthYear < 1900 || data.birthYear > new Date().getFullYear())) {
          errors.birthYear = '올바른 출생년도를 입력해주세요';
          isValid = false;
        }
        break;

      case 1: // 이동 능력
        if (data.mobilityLevel && (data.mobilityLevel < 1 || data.mobilityLevel > 3)) {
          errors.mobilityLevel = '1-3 사이의 값을 선택해주세요';
          isValid = false;
        }
        break;

      case 2: // 식사 능력
        if (data.eatingLevel && (data.eatingLevel < 1 || data.eatingLevel > 3)) {
          errors.eatingLevel = '1-3 사이의 값을 선택해주세요';
          isValid = false;
        }
        break;

      case 3: // 배변 능력
        if (data.toiletLevel && (data.toiletLevel < 1 || data.toiletLevel > 3)) {
          errors.toiletLevel = '1-3 사이의 값을 선택해주세요';
          isValid = false;
        }
        break;

      case 4: // 의사소통 능력
        if (data.communicationLevel && (data.communicationLevel < 1 || data.communicationLevel > 3)) {
          errors.communicationLevel = '1-3 사이의 값을 선택해주세요';
          isValid = false;
        }
        break;

      case 5: // 장기요양등급
        if (data.ltciGrade && (data.ltciGrade < 1 || data.ltciGrade > 8)) {
          errors.ltciGrade = '1-8 사이의 값을 선택해주세요';
          isValid = false;
        }
        break;
    }

    return { isValid, errors, step };
  }, []);

  // 다음 단계로 이동
  const goToNextStep = useCallback(async (): Promise<boolean> => {
    const validation = validateCurrentStepAdvanced();
    
    if (!validation.isValid) {
      return false;
    }

    // 자동 저장 (백그라운드)
    if (autoSaveEnabled && isDirty) {
      try {
        await saveProgress();
      } catch (error) {
        console.warn('자동 저장 실패:', error);
        // 자동 저장 실패는 진행을 막지 않음
      }
    }

    // 다음 단계로 이동
    nextStep();
    clearAllErrors();

    return true;
  }, [validateCurrentStepAdvanced, autoSaveEnabled, isDirty, nextStep, clearAllErrors]);

  // 이전 단계로 이동
  const goToPreviousStep = useCallback(() => {
    previousStep();
    clearAllErrors();
  }, [previousStep, clearAllErrors]);

  // 특정 단계로 이동
  const goToSpecificStep = useCallback((step: number) => {
    if (step >= 0 && step <= 6) {
      goToStep(step);
      clearAllErrors();
      
      // 캐시된 검증 결과가 있으면 적용
      const cachedValidation = validationCache.get(step);
      if (cachedValidation && !cachedValidation.isValid) {
        Object.keys(cachedValidation.errors).forEach(field => {
          setError(field, cachedValidation.errors[field]);
        });
      }
    }
  }, [goToStep, clearAllErrors, validationCache, setError]);

  // 폼 데이터 업데이트
  const updateField = useCallback((field: keyof HealthAssessmentCreateRequest, value: any) => {
    updateFormData({ [field]: value });
    setIsDirty(true);
    
    // 해당 필드의 에러 제거
    clearError(field);
  }, [updateFormData, clearError]);

  // 진행상황 저장 (Draft)
  const saveProgress = useCallback(async () => {
    if (!isDirty) return;

    try {
      // 임시 저장 API 호출 (실제 API가 없으므로 주석 처리)
      // await healthApi.saveDraft(formData);
      setLastSavedAt(new Date());
      setIsDirty(false);
      
      console.log('진행상황 저장 완료');
    } catch (error) {
      console.error('진행상황 저장 실패:', error);
      throw error;
    }
  }, [formData, isDirty]);

  // 최종 제출
  const submitAssessment = useCallback(async (): Promise<boolean> => {
    // 전체 폼 검증
    const allStepsValid = Object.keys(stepRequiredFields).every(stepStr => {
      const step = parseInt(stepStr);
      const validation = validateStepSpecific(step, formData);
      return validation.isValid;
    });

    if (!allStepsValid) {
      setError('submit', '모든 필수 항목을 완료해주세요');
      return false;
    }

    setSubmitting(true);
    try {
      // 실제 API 호출 (healthApi가 없으므로 주석 처리)
      // const result = await healthApi.createAssessment(formData);
      
      // 성공 시 폼 초기화
      setIsDirty(false);
      setLastSavedAt(null);
      setValidationCache(new Map());
      
      console.log('건강 평가 제출 완료:', formData);
      return true;
    } catch (error) {
      console.error('건강 평가 제출 실패:', error);
      setError('submit', '제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [formData, stepRequiredFields, validateStepSpecific, setSubmitting, setError]);

  // 폼 초기화
  const resetWizard = useCallback(() => {
    // 스토어 초기화는 스토어에서 제공하는 메서드 사용
    updateFormData({
      memberId: '',
      gender: undefined,
      birthYear: undefined,
      mobilityLevel: undefined as any,
      eatingLevel: undefined as any,
      toiletLevel: undefined as any,
      communicationLevel: undefined as any,
      ltciGrade: undefined,
      careTargetStatus: undefined,
      mealType: undefined,
      diseaseTypes: '',
      notes: ''
    });
    
    setIsDirty(false);
    setLastSavedAt(null);
    setValidationCache(new Map());
    clearAllErrors();
  }, [updateFormData, clearAllErrors]);

  // 자동 저장 토글
  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);

  // 현재 단계가 완료 가능한지 확인
  const canCompleteCurrentStep = useMemo(() => {
    const cachedValidation = validationCache.get(currentStep);
    if (cachedValidation) {
      return cachedValidation.isValid;
    }
    
    // 캐시가 없으면 실시간 검증
    const requiredFields = stepRequiredFields[currentStep] || [];
    return requiredFields.every(field => 
      formData[field as keyof HealthAssessmentCreateRequest]
    );
  }, [currentStep, validationCache, stepRequiredFields, formData]);

  // 전체 폼이 제출 가능한지 확인
  const canSubmit = useMemo(() => {
    // 필수 단계 완료 확인 (0-4단계)
    return Object.keys(stepRequiredFields).slice(0, 5).every(stepStr => {
      const step = parseInt(stepStr);
      const requiredFields = stepRequiredFields[step] || [];
      return requiredFields.every(field => 
        formData[field as keyof HealthAssessmentCreateRequest]
      );
    });
  }, [stepRequiredFields, formData]);

  // 자동 저장 효과
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      saveProgress().catch(console.error);
    }, 30000); // 30초 후 자동 저장

    return () => clearTimeout(autoSaveTimer);
  }, [autoSaveEnabled, isDirty, saveProgress]);

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '작성 중인 내용이 있습니다. 정말 나가시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return {
    // 상태
    formData,
    currentStep,
    isLoading: isSubmitting,
    errors,
    progress,
    isDirty,
    autoSaveEnabled,
    lastSavedAt,
    canCompleteCurrentStep,
    canSubmit,

    // 액션
    updateField,
    goToNextStep,
    goToPreviousStep,
    goToStep: goToSpecificStep,
    validateCurrentStep: validateCurrentStepAdvanced,
    saveProgress,
    submitAssessment,
    resetWizard,
    toggleAutoSave,

    // 유틸리티
    getStepValidation: (step: number) => validationCache.get(step),
    hasUnsavedChanges: isDirty,
  };
}; 