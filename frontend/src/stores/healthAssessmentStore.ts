/**
 * 건강 상태 평가 체크리스트 상태 관리
 * Zustand를 사용한 전역 상태 관리
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  HealthAssessmentCreateRequest, 
  ChecklistState, 
  ChecklistStep,
  AdlLevel,
  LtciGrade,
  CareTargetStatus,
  MealType,
  Gender 
} from '@/types/health';

interface HealthAssessmentStore extends ChecklistState {
  // === 액션 메서드 ===
  
  // 단계 이동
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  
  // 폼 데이터 업데이트
  updateFormData: (data: Partial<HealthAssessmentCreateRequest>) => void;
  updateAdlScore: (field: keyof Pick<HealthAssessmentCreateRequest, 'mobilityLevel' | 'eatingLevel' | 'toiletLevel' | 'communicationLevel'>, value: AdlLevel) => void;
  
  // 기본 정보 설정
  setBasicInfo: (memberId: string, gender?: Gender, birthYear?: number) => void;
  
  // 추가 정보 설정
  setLtciGrade: (grade?: LtciGrade) => void;
  setCareTargetStatus: (status?: CareTargetStatus) => void;
  setMealType: (type?: MealType) => void;
  setDiseaseTypes: (types: string) => void;
  setNotes: (notes: string) => void;
  
  // 검증 및 완성도
  validateCurrentStep: () => boolean;
  calculateCompletionPercentage: () => number;
  
  // 에러 처리
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // 제출 상태
  setSubmitting: (isSubmitting: boolean) => void;
  
  // 초기화
  resetForm: () => void;
  
  // 임시 저장 및 복원
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

// === 초기 단계 정의 ===
const INITIAL_STEPS: ChecklistStep[] = [
  {
    id: 'basic-info',
    title: '기본 정보',
    description: '평가 대상자의 기본 정보를 입력해주세요',
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 'adl-mobility',
    title: '걷기 활동 능력',
    description: '일상생활에서 걷기 활동 능력을 평가해주세요',
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 'adl-eating',
    title: '식사 활동 능력',
    description: '일상생활에서 식사 활동 능력을 평가해주세요',
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 'adl-toilet',
    title: '배변 활동 능력',
    description: '일상생활에서 화장실 이용 능력을 평가해주세요',
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 'adl-communication',
    title: '의사소통 능력',
    description: '의사소통 및 인지 능력을 평가해주세요',
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 'ltci-grade',
    title: '장기요양보험 등급',
    description: '장기요양보험 등급이 있으시면 선택해주세요 (선택사항)',
    isRequired: false,
    isCompleted: false,
  },
  {
    id: 'additional-info',
    title: '추가 정보',
    description: '돌봄 상태, 식사형태, 질환 정보 등을 입력해주세요 (선택사항)',
    isRequired: false,
    isCompleted: false,
  },
  {
    id: 'review',
    title: '검토 및 제출',
    description: '입력하신 정보를 검토하고 평가를 완료해주세요',
    isRequired: true,
    isCompleted: false,
  },
];

// === 초기 상태 ===
const INITIAL_STATE: ChecklistState = {
  currentStep: 0,
  totalSteps: INITIAL_STEPS.length,
  steps: INITIAL_STEPS,
  formData: {},
  isSubmitting: false,
  errors: {},
};

// === 로컬 스토리지 키 ===
const LOCAL_STORAGE_KEY = 'health-assessment-form';

export const useHealthAssessmentStore = create<HealthAssessmentStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      // === 단계 이동 ===
      nextStep: () => {
        const { currentStep, totalSteps, validateCurrentStep } = get();
        
        // 현재 단계 검증
        if (!validateCurrentStep()) {
          return;
        }
        
        if (currentStep < totalSteps - 1) {
          set(
            (state) => ({
              currentStep: state.currentStep + 1,
              steps: state.steps.map((step, index) =>
                index === state.currentStep
                  ? { ...step, isCompleted: true }
                  : step
              ),
            }),
            false,
            'nextStep'
          );
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set(
            (state) => ({
              currentStep: state.currentStep - 1,
            }),
            false,
            'previousStep'
          );
        }
      },

      goToStep: (stepIndex: number) => {
        const { totalSteps } = get();
        if (stepIndex >= 0 && stepIndex < totalSteps) {
          set(
            { currentStep: stepIndex },
            false,
            'goToStep'
          );
        }
      },

      // === 폼 데이터 업데이트 ===
      updateFormData: (data: Partial<HealthAssessmentCreateRequest>) => {
        set(
          (state) => ({
            formData: { ...state.formData, ...data },
          }),
          false,
          'updateFormData'
        );
        
        // 자동 저장
        get().saveToLocalStorage();
      },

      updateAdlScore: (field, value) => {
        get().updateFormData({ [field]: value });
      },

      // === 기본 정보 설정 ===
      setBasicInfo: (memberId: string, gender?: Gender, birthYear?: number) => {
        get().updateFormData({ memberId, gender, birthYear });
      },

      // === 추가 정보 설정 ===
      setLtciGrade: (grade?: LtciGrade) => {
        get().updateFormData({ ltciGrade: grade });
      },

      setCareTargetStatus: (status?: CareTargetStatus) => {
        get().updateFormData({ careTargetStatus: status });
      },

      setMealType: (type?: MealType) => {
        get().updateFormData({ mealType: type });
      },

      setDiseaseTypes: (types: string) => {
        get().updateFormData({ diseaseTypes: types });
      },

      setNotes: (notes: string) => {
        get().updateFormData({ notes });
      },

      // === 검증 ===
      validateCurrentStep: () => {
        const { currentStep, steps, formData, setError, clearError } = get();
        const step = steps[currentStep];
        
        if (!step.isRequired) return true;
        
        let isValid = true;
        
        switch (step.id) {
          case 'basic-info':
            if (!formData.memberId) {
              setError('memberId', '회원 ID는 필수입니다');
              isValid = false;
            } else {
              clearError('memberId');
            }
            break;
            
          case 'adl-mobility':
            if (!formData.mobilityLevel) {
              setError('mobilityLevel', '걷기 활동 능력 평가는 필수입니다');
              isValid = false;
            } else {
              clearError('mobilityLevel');
            }
            break;
            
          case 'adl-eating':
            if (!formData.eatingLevel) {
              setError('eatingLevel', '식사 활동 능력 평가는 필수입니다');
              isValid = false;
            } else {
              clearError('eatingLevel');
            }
            break;
            
          case 'adl-toilet':
            if (!formData.toiletLevel) {
              setError('toiletLevel', '배변 활동 능력 평가는 필수입니다');
              isValid = false;
            } else {
              clearError('toiletLevel');
            }
            break;
            
          case 'adl-communication':
            if (!formData.communicationLevel) {
              setError('communicationLevel', '의사소통 능력 평가는 필수입니다');
              isValid = false;
            } else {
              clearError('communicationLevel');
            }
            break;
            
          case 'review':
            // 필수 ADL 항목 재검증
            const requiredFields = ['mobilityLevel', 'eatingLevel', 'toiletLevel', 'communicationLevel'];
            for (const field of requiredFields) {
              if (!formData[field as keyof HealthAssessmentCreateRequest]) {
                setError(field, `${field}는 필수항목입니다`);
                isValid = false;
              }
            }
            break;
        }
        
        return isValid;
      },

      calculateCompletionPercentage: () => {
        const { formData } = get();
        const requiredFields = ['mobilityLevel', 'eatingLevel', 'toiletLevel', 'communicationLevel'];
        const optionalFields = ['ltciGrade', 'careTargetStatus', 'mealType', 'diseaseTypes'];
        
        let completedRequired = 0;
        let completedOptional = 0;
        
        requiredFields.forEach(field => {
          if (formData[field as keyof HealthAssessmentCreateRequest]) {
            completedRequired++;
          }
        });
        
        optionalFields.forEach(field => {
          if (formData[field as keyof HealthAssessmentCreateRequest]) {
            completedOptional++;
          }
        });
        
        // 필수 필드 80%, 선택 필드 20% 가중치
        const requiredPercentage = (completedRequired / requiredFields.length) * 80;
        const optionalPercentage = (completedOptional / optionalFields.length) * 20;
        
        return requiredPercentage + optionalPercentage;
      },

      // === 에러 처리 ===
      setError: (field: string, error: string) => {
        set(
          (state) => ({
            errors: { ...state.errors, [field]: error },
          }),
          false,
          'setError'
        );
      },

      clearError: (field: string) => {
        set(
          (state) => {
            const { [field]: _, ...restErrors } = state.errors;
            return { errors: restErrors };
          },
          false,
          'clearError'
        );
      },

      clearAllErrors: () => {
        set({ errors: {} }, false, 'clearAllErrors');
      },

      // === 제출 상태 ===
      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting }, false, 'setSubmitting');
      },

      // === 초기화 ===
      resetForm: () => {
        set(INITIAL_STATE, false, 'resetForm');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      },

      // === 로컬 스토리지 ===
      saveToLocalStorage: () => {
        const { formData, currentStep } = get();
        const dataToSave = {
          formData,
          currentStep,
          timestamp: Date.now(),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      },

      loadFromLocalStorage: () => {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved) {
            const { formData, currentStep, timestamp } = JSON.parse(saved);
            
            // 24시간 이내 데이터만 복원
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
              set(
                (state) => ({
                  formData,
                  currentStep,
                  steps: state.steps.map((step, index) => ({
                    ...step,
                    isCompleted: index < currentStep,
                  })),
                }),
                false,
                'loadFromLocalStorage'
              );
            }
          }
        } catch (error) {
          console.error('로컬 스토리지에서 데이터 복원 실패:', error);
        }
      },
    }),
    {
      name: 'health-assessment-store',
    }
  )
);