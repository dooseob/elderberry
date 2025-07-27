/**
 * 건강 상태 평가 체크리스트 상태 관리 (최적화)
 * Zustand를 사용한 최소한의 전역 상태 관리
 * 로컬 상태로 처리 가능한 것들은 분리하여 성능 최적화
 */
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devLogger, errorLogger } from '../utils/devLogger';
import type { 
  HealthAssessmentCreateRequest, 
  AdlLevel,
  LtciGrade,
  CareTargetStatus,
  MealType,
  Gender 
} from '@/types/health';

// 최소한의 전역 상태만 관리
interface HealthAssessmentState {
  // 핵심 폼 데이터 (전역 공유 필요)
  formData: HealthAssessmentCreateRequest;
  
  // 현재 단계 (전역 공유 필요)
  currentStep: number;
  
  // 제출 상태 (전역 공유 필요)
  isSubmitting: boolean;
  
  // 에러 상태 (전역 공유 필요)
  errors: Record<string, string>;
}

interface HealthAssessmentActions {
  // 폼 데이터 업데이트
  updateFormData: (data: Partial<HealthAssessmentCreateRequest>) => void;
  
  // 단계 관리
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  
  // 제출 상태 관리
  setSubmitting: (isSubmitting: boolean) => void;
  
  // 에러 관리
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // 유틸리티
  resetForm: () => void;
  isStepValid: (step: number) => boolean;
}

type HealthAssessmentStore = HealthAssessmentState & HealthAssessmentActions;

// 초기 폼 데이터
const initialFormData: HealthAssessmentCreateRequest = {
  memberId: '',
  gender: undefined,
  birthYear: undefined,
  mobilityLevel: 1,
  eatingLevel: 1,
  toiletLevel: 1,
  communicationLevel: 1,
  ltciGrade: undefined,
  careTargetStatus: undefined,
  mealType: undefined,
  diseaseTypes: '',
  notes: '',
  assessorName: '',
  assessorRelation: ''
};

// 단계별 필수 필드 정의 (성능을 위해 상수로 분리)
const STEP_REQUIRED_FIELDS: Record<number, (keyof HealthAssessmentCreateRequest)[]> = {
  0: ['memberId', 'gender', 'birthYear'],
  1: ['mobilityLevel'],
  2: ['eatingLevel'],
  3: ['toiletLevel'],
  4: ['communicationLevel'],
  5: ['ltciGrade'],
  6: [] // 추가 정보는 선택사항
};

/**
 * 최적화된 건강 평가 스토어
 * - immer 미들웨어로 불변성 관리 자동화
 * - subscribeWithSelector로 선택적 구독 지원
 * - devtools로 디버깅 지원
 */
export const useHealthAssessmentStore = create<HealthAssessmentStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // 초기 상태
        formData: { ...initialFormData },
        currentStep: 0,
        isSubmitting: false,
        errors: {},

        // 폼 데이터 업데이트 (Immer로 불변성 자동 관리)
        updateFormData: (data) =>
          set((state) => {
            Object.assign(state.formData, data);
          }),

        // 단계 관리
        setCurrentStep: (step) =>
          set((state) => {
            if (step >= 0 && step <= 6) {
              state.currentStep = step;
            }
          }),

        nextStep: () =>
          set((state) => {
            if (state.currentStep < 6) {
              state.currentStep += 1;
            }
          }),

        previousStep: () =>
          set((state) => {
            if (state.currentStep > 0) {
              state.currentStep -= 1;
            }
          }),

        goToStep: (stepIndex) =>
          set((state) => {
            if (stepIndex >= 0 && stepIndex <= 6) {
              state.currentStep = stepIndex;
            }
          }),

        // 제출 상태 관리
        setSubmitting: (isSubmitting) =>
          set((state) => {
            state.isSubmitting = isSubmitting;
          }),

        // 에러 관리
        setError: (field, error) =>
          set((state) => {
            state.errors[field] = error;
          }),

        clearError: (field) =>
          set((state) => {
            delete state.errors[field];
          }),

        clearAllErrors: () =>
          set((state) => {
            state.errors = {};
          }),

        // 폼 초기화
        resetForm: () =>
          set((state) => {
            state.formData = { ...initialFormData };
            state.currentStep = 0;
            state.isSubmitting = false;
            state.errors = {};
          }),

        // 단계 유효성 검증
        isStepValid: (step) => {
          const { formData } = get();
          const requiredFields = STEP_REQUIRED_FIELDS[step] || [];
          
          return requiredFields.every(field => {
            const value = formData[field];
            return value !== undefined && value !== null && value !== '';
          });
        },
      }))
    ),
    {
      name: 'health-assessment-store',
      // 개발 환경에서만 devtools 활성화
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// 선택적 구독을 위한 셀렉터 함수들
export const selectFormData = (state: HealthAssessmentStore) => state.formData;
export const selectCurrentStep = (state: HealthAssessmentStore) => state.currentStep;
export const selectIsSubmitting = (state: HealthAssessmentStore) => state.isSubmitting;
export const selectErrors = (state: HealthAssessmentStore) => state.errors;

// 파생 상태 셀렉터들 (메모이제이션 적용)
export const selectProgress = (state: HealthAssessmentStore) => {
  const { formData, currentStep } = state;
  let completedSteps = 0;
  
  // 각 단계별 완성도 계산
  for (let step = 0; step <= Math.min(currentStep, 5); step++) {
    const requiredFields = STEP_REQUIRED_FIELDS[step] || [];
    const isStepComplete = requiredFields.every(field => {
      const value = formData[field];
      return value !== undefined && value !== null && value !== '';
    });
    
    if (isStepComplete) {
      completedSteps++;
    }
  }
  
  return Math.round((completedSteps / 6) * 100);
};

export const selectCanSubmit = (state: HealthAssessmentStore) => {
  const { formData } = state;
  
  // 필수 단계(0-4) 모두 완료 확인
  for (let step = 0; step <= 4; step++) {
    const requiredFields = STEP_REQUIRED_FIELDS[step] || [];
    const isStepComplete = requiredFields.every(field => {
      const value = formData[field];
      return value !== undefined && value !== null && value !== '';
    });
    
    if (!isStepComplete) {
      return false;
    }
  }
  
  return true;
};

export const selectStepErrors = (step: number) => (state: HealthAssessmentStore) => {
  const stepFields = STEP_REQUIRED_FIELDS[step] || [];
  const stepErrors: Record<string, string> = {};
  
  stepFields.forEach(field => {
    if (state.errors[field]) {
      stepErrors[field] = state.errors[field];
    }
  });
  
  return stepErrors;
};

// 성능 최적화를 위한 얕은 비교 셀렉터
export const selectBasicInfo = (state: HealthAssessmentStore) => ({
  memberId: state.formData.memberId,
  gender: state.formData.gender,
  birthYear: state.formData.birthYear,
});

export const selectAdlScores = (state: HealthAssessmentStore) => ({
  mobilityLevel: state.formData.mobilityLevel,
  eatingLevel: state.formData.eatingLevel,
  toiletLevel: state.formData.toiletLevel,
  communicationLevel: state.formData.communicationLevel,
});

export const selectAdditionalInfo = (state: HealthAssessmentStore) => ({
  ltciGrade: state.formData.ltciGrade,
  careTargetStatus: state.formData.careTargetStatus,
  mealType: state.formData.mealType,
  diseaseTypes: state.formData.diseaseTypes,
  notes: state.formData.notes,
});

// 특정 필드만 구독하는 훅들
export const useFormField = <K extends keyof HealthAssessmentCreateRequest>(
  field: K
) => {
  return useHealthAssessmentStore(
    (state) => state.formData[field],
    // 얕은 비교로 불필요한 리렌더링 방지
    (a, b) => a === b
  );
};

export const useStepValidation = (step: number) => {
  return useHealthAssessmentStore(
    (state) => state.isStepValid(step),
    // 불리언 값이므로 참조 비교로 충분
    (a, b) => a === b
  );
};

// 로컬 스토리지 연동 (선택적)
export const persistFormData = () => {
  const formData = useHealthAssessmentStore.getState().formData;
  try {
    localStorage.setItem('health-assessment-draft', JSON.stringify(formData));
  } catch (error) {
    errorLogger.warn('폼 데이터 저장 실패', error);
  }
};

export const loadPersistedFormData = () => {
  try {
    const saved = localStorage.getItem('health-assessment-draft');
          if (saved) {
      const formData = JSON.parse(saved);
      useHealthAssessmentStore.getState().updateFormData(formData);
      return true;
          }
        } catch (error) {
    errorLogger.warn('저장된 폼 데이터 로드 실패', error);
  }
  return false;
};

export const clearPersistedFormData = () => {
  try {
    localStorage.removeItem('health-assessment-draft');
  } catch (error) {
    errorLogger.warn('저장된 폼 데이터 삭제 실패', error);
  }
};

// 개발 환경에서 스토어 상태 로깅
if (process.env.NODE_ENV === 'development') {
  useHealthAssessmentStore.subscribe(
    (state) => state.currentStep,
    (currentStep, previousStep) => {
      devLogger.log(`단계 변경: ${previousStep} → ${currentStep}`);
    }
  );

  useHealthAssessmentStore.subscribe(
    (state) => Object.keys(state.errors).length,
    (errorCount) => {
      if (errorCount > 0) {
        devLogger.log(`에러 발생: ${errorCount}개`);
      }
    }
  );
}