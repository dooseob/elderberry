/**
 * 건강 상태 평가 체크리스트 마법사 컴포넌트
 * KB라이프생명 기반 단계별 돌봄지수 평가
 */
import React, { useEffect } from 'react';
import { useSEO } from '../../hooks/useSEO';
import { SEOPresets, addStructuredData } from '../../shared/lib/seo';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthAssessmentStore } from '../../stores/healthAssessmentStore';
import { Button } from '../../shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../shared/ui';
import ProgressBar from '../../shared/ui/ProgressBar';

// 단계별 컴포넌트들
import BasicInfoStep from './steps/BasicInfoStep';
import LtciGradeStep from './steps/LtciGradeStep';
import AdlMobilityStep from './steps/AdlMobilityStep';
import AdlEatingStep from './steps/AdlEatingStep';
import AdlToiletStep from './steps/AdlToiletStep';
import AdlCommunicationStep from './steps/AdlCommunicationStep';
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
  // SEO 최적화
  useSEO(SEOPresets.healthAssessment);
  
  // 구조화된 데이터 추가
  useEffect(() => {
    const healthAssessmentData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "건강 평가 시스템",
      "description": "장기요양보험 및 ADL 평가를 통한 전문적인 건강 상태 진단 서비스",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW"
      },
      "provider": {
        "@type": "Organization",
        "name": "엘더베리"
      }
    };
    
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": "https://elderberry.co.kr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "건강 평가",
          "item": "https://elderberry.co.kr/health-assessment"
        }
      ]
    };
    
    addStructuredData(healthAssessmentData, 'health-assessment');
    addStructuredData(breadcrumbData, 'health-breadcrumb');
  }, []);
  
  const {
    currentStep,
    formData,
    isSubmitting,
    errors,
    updateFormData,
    setCurrentStep,
    nextStep,
    previousStep,
    isStepValid,
    clearAllErrors,
    resetForm,
  } = useHealthAssessmentStore();
  
  // 단계 정의
  const steps = [
    { id: 'basic-info', title: '기본 정보', description: '성별과 출생년도를 입력해주세요', isRequired: false },
    { id: 'ltci-grade', title: '장기요양등급', description: '장기요양보험 등급을 선택해주세요', isRequired: false },
    { id: 'adl-mobility', title: '이동능력', description: '걷기나 이동에 대한 능력을 평가합니다', isRequired: true },
    { id: 'adl-eating', title: '식사능력', description: '혼자서 식사하는 능력을 평가합니다', isRequired: true },
    { id: 'adl-toilet', title: '배변능력', description: '화장실 이용 능력을 평가합니다', isRequired: true },
    { id: 'adl-communication', title: '의사소통', description: '의사표현 및 소통 능력을 평가합니다', isRequired: true },
    { id: 'additional-info', title: '추가 정보', description: '돌봄 상태, 식사형태, 질병 등 추가 정보를 입력합니다', isRequired: false },
    { id: 'review', title: '검토 및 완료', description: '입력한 정보를 검토하고 평가를 완료합니다', isRequired: true }
  ];
  
  const totalSteps = steps.length;
  
  // 완성도 계산
  const calculateCompletionPercentage = () => {
    let completedSteps = 0;
    const requiredSteps = steps.filter(step => step.isRequired);
    
    if (formData.mobilityLevel) completedSteps++;
    if (formData.eatingLevel) completedSteps++;
    if (formData.toiletLevel) completedSteps++;
    if (formData.communicationLevel) completedSteps++;
    
    return Math.round((completedSteps / requiredSteps.length) * 100);
  };

  // 초기화 시 회원 ID 설정
  useEffect(() => {
    if (memberId && !formData.memberId) {
      updateFormData({ memberId });
    }
  }, [memberId, formData.memberId, updateFormData]);

  // 현재 단계 컴포넌트 렌더링
  const renderCurrentStep = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'basic-info':
        return <BasicInfoStep />;
      case 'ltci-grade':
        return <LtciGradeStep />;
      case 'adl-mobility':
        return <AdlMobilityStep />;
      case 'adl-eating':
        return <AdlEatingStep />;
      case 'adl-toilet':
        return <AdlToiletStep />;
      case 'adl-communication':
        return <AdlCommunicationStep />;
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
    if (isStepValid(currentStep)) {
      nextStep();
    }
  };

  // 에러가 있는지 확인
  const hasCurrentStepErrors = Object.keys(errors).length > 0;

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