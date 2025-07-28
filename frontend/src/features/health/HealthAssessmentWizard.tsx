/**
 * 건강 상태 평가 체크리스트 마법사 컴포넌트
 * KB라이프생명 기반 단계별 돌봄지수 평가
 */
import React, { useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from '../../components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthAssessmentStore } from '@/stores/healthAssessmentStore';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

// 단계별 컴포넌트들
import BasicInfoStep from './steps/BasicInfoStep';
import AdlMobilityStep from './steps/AdlMobilityStep';
import AdlEatingStep from './steps/AdlEatingStep';
import AdlToiletStep from './steps/AdlToiletStep';
import AdlCommunicationStep from './steps/AdlCommunicationStep';
import LtciGradeStep from './steps/LtciGradeStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import ReviewStep from './steps/ReviewStep';

interface HealthAssessmentWizardProps {
  onComplete?: (assessmentId: number) => void;
  onCancel?: () => void;
  memberId: string;
}

const HealthAssessmentWizard: React.FC<HealthAssessmentWizardProps> = ({
  onComplete,
  onCancel,
  memberId,
}) => {
  const {
    currentStep,
    totalSteps,
    steps,
    formData,
    isSubmitting,
    errors,
    nextStep,
    previousStep,
    validateCurrentStep,
    calculateCompletionPercentage,
    setBasicInfo,
    loadFromLocalStorage,
    resetForm,
  } = useHealthAssessmentStore();

  // 초기화 시 로컬 스토리지에서 데이터 복원
  useEffect(() => {
    setBasicInfo(memberId);
    loadFromLocalStorage();
  }, [memberId, setBasicInfo, loadFromLocalStorage]);

  // 현재 단계 컴포넌트 렌더링
  const renderCurrentStep = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'basic-info':
        return <BasicInfoStep />;
      case 'adl-mobility':
        return <AdlMobilityStep />;
      case 'adl-eating':
        return <AdlEatingStep />;
      case 'adl-toilet':
        return <AdlToiletStep />;
      case 'adl-communication':
        return <AdlCommunicationStep />;
      case 'ltci-grade':
        return <LtciGradeStep />;
      case 'additional-info':
        return <AdditionalInfoStep />;
      case 'review':
        return <ReviewStep onComplete={onComplete} />;
      default:
        return <div>알 수 없는 단계입니다.</div>;
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const completionPercentage = calculateCompletionPercentage();

  // 다음 단계 진행 핸들러
  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  // 에러가 있는지 확인
  const hasCurrentStepErrors = Object.keys(errors).some(key => 
    errors[key] && steps[currentStep]?.id.includes(key.split('.')[0])
  );

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            건강 상태 평가
          </h1>
          <p className="text-elderberry-600">
            KB라이프생명 기반 돌봄지수 체크 시스템
          </p>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-8">
          <ProgressBar
            progress={completionPercentage}
            steps={steps.map(step => step.title)}
            currentStep={currentStep}
            showPercentage={true}
            showSteps={false}
          />
        </div>

        {/* 메인 카드 */}
        <Card className="mb-8" shadow="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentStepData.isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {currentStepData.title}
                  {currentStepData.isRequired && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentStepData.description}
                </CardDescription>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-elderberry-500">
                  {currentStep + 1} / {totalSteps}
                </div>
                <div className="text-lg font-semibold text-elderberry-700">
                  {Math.round(completionPercentage)}%
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* 에러 표시 */}
            {hasCurrentStepErrors && (
              <motion.div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">입력 정보를 확인해주세요</span>
                </div>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{error}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* 현재 단계 컴포넌트 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter>
            <div className="flex justify-between items-center w-full">
              {/* 이전 버튼 */}
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={isFirstStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </Button>

              {/* 중간 정보 */}
              <div className="flex items-center gap-4 text-sm text-elderberry-600">
                {currentStepData.isRequired && (
                  <span className="flex items-center gap-1">
                    <span className="text-red-500">*</span>
                    필수 항목
                  </span>
                )}
                {formData.memberId && (
                  <span>평가 대상: {formData.memberId}</span>
                )}
              </div>

              {/* 다음/완료 버튼 */}
              {!isLastStep ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  다음
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          </CardFooter>
        </Card>

        {/* 하단 액션 버튼들 */}
        <div className="flex justify-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm('평가를 취소하시겠습니까? 입력한 데이터는 저장되지 않습니다.')) {
                resetForm();
                onCancel?.();
              }
            }}
          >
            평가 취소
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => {
              alert('진행 상황이 자동으로 저장되었습니다.');
            }}
          >
            임시 저장
          </Button>
        </div>

        {/* 도움말 정보 */}
        <Card className="mt-8 bg-elderberry-50 border-elderberry-200" padding="md">
          <div className="text-center">
            <h3 className="font-semibold text-elderberry-800 mb-2">
              💡 평가 가이드
            </h3>
            <p className="text-sm text-elderberry-600">
              이 평가는 KB라이프생명의 돌봄지수 체크 시스템을 기반으로 합니다. 
              정확한 평가를 위해 평소 상태를 기준으로 답변해주세요.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-elderberry-500">
              <div>📱 자동 저장</div>
              <div>🔒 개인정보 보호</div>
              <div>⚡ 실시간 계산</div>
              <div>📊 맞춤 추천</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HealthAssessmentWizard;