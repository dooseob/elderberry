/**
 * 매칭 완료 및 피드백 폼 컴포넌트
 * 사용자가 시설을 선택하고 매칭을 완료할 때 사용하는 폼
 * 만족도 평가와 피드백을 수집하여 추천 시스템 개선에 활용
 */
import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Lightbulb,
  MessageSquare,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
  X
} from '../../../components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { useFacilityStore, useSelectedFacility } from '@/stores/facilityStore';
import { Button } from '@/shared/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

interface MatchingCompletionFormProps {
  facilityId?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

const MatchingCompletionForm: React.FC<MatchingCompletionFormProps> = ({
  facilityId,
  onComplete,
  onCancel,
}) => {
  const selectedFacility = useSelectedFacility();
  const {
    isMatchingFormOpen,
    closeMatchingForm,
    completeMatching,
  } = useFacilityStore();

  // 폼 상태
  const [formData, setFormData] = useState({
    outcome: 'SUCCESSFUL' as 'SUCCESSFUL' | 'FAILED' | 'PENDING',
    actualCost: '',
    satisfactionScore: 0,
    feedback: '',
    improvementSuggestion: '',
    recommendationWillingness: 0,
    specificRatings: {
      staff: 0,
      facilities: 0,
      cost: 0,
      location: 0,
      services: 0,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const targetFacilityId = facilityId || selectedFacility?.id;
  const targetFacility = selectedFacility;

  // 폼 데이터 업데이트
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 세부 평점 업데이트
  const updateSpecificRating = (category: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      specificRatings: {
        ...prev.specificRatings,
        [category]: rating,
      },
    }));
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!targetFacilityId) {
      setSubmitError('시설 정보를 찾을 수 없습니다.');
      return;
    }

    if (formData.satisfactionScore === 0) {
      setSubmitError('전체 만족도를 평가해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await completeMatching(
        targetFacilityId,
        formData.outcome,
        formData.satisfactionScore,
        formData.feedback
      );

      // 성공 메시지
      alert('매칭 완료 처리가 성공적으로 저장되었습니다. 소중한 피드백 감사합니다!');
      
      // 폼 닫기
      handleClose();
      onComplete?.();
    } catch (error) {
      setSubmitError('매칭 완료 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('매칭 완료 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 닫기
  const handleClose = () => {
    closeMatchingForm();
    onCancel?.();
    
    // 폼 초기화
    setTimeout(() => {
      setFormData({
        outcome: 'SUCCESSFUL',
        actualCost: '',
        satisfactionScore: 0,
        feedback: '',
        improvementSuggestion: '',
        recommendationWillingness: 0,
        specificRatings: {
          staff: 0,
          facilities: 0,
          cost: 0,
          location: 0,
          services: 0,
        },
      });
      setCurrentStep(1);
      setSubmitError(null);
    }, 300);
  };

  // 별점 렌더링 컴포넌트
  const StarRating: React.FC<{
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
  }> = ({ rating, onRatingChange, size = 'md', label }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return (
      <div className="flex items-center space-x-1">
        {label && <span className="text-sm font-medium mr-2">{label}</span>}
        {Array.from({ length: 5 }).map((_, index) => (
          <button
            key={index}
            onClick={() => onRatingChange(index + 1)}
            className={`${sizeClasses[size]} transition-colors ${
              index < rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (!isMatchingFormOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        {/* 폼 콘텐츠 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">매칭 완료 및 피드백</h2>
                {targetFacility && (
                  <p className="text-purple-100">
                    {targetFacility.facilityName}에 대한 경험을 공유해주세요
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 진행 상태 */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full ${
                      step <= currentStep ? 'bg-white' : 'bg-purple-400'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs mt-1 text-purple-100">
                <span>매칭 결과</span>
                <span>상세 평가</span>
                <span>추가 피드백</span>
              </div>
            </div>
          </div>

          {/* 폼 내용 */}
          <div className="flex-1 overflow-y-auto max-h-96 p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: 매칭 결과 */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* 매칭 결과 선택 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">매칭 결과를 알려주세요</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { value: 'SUCCESSFUL', label: '성공적으로 입소했습니다', icon: CheckCircle, color: 'green' },
                        { value: 'PENDING', label: '입소 대기 중입니다', icon: Clock, color: 'yellow' },
                        { value: 'FAILED', label: '입소하지 않기로 했습니다', icon: AlertTriangle, color: 'red' },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              formData.outcome === option.value
                                ? `border-${option.color}-500 bg-${option.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="outcome"
                              value={option.value}
                              checked={formData.outcome === option.value}
                              onChange={(e) => updateFormData('outcome', e.target.value)}
                              className="sr-only"
                            />
                            <Icon className={`w-5 h-5 mr-3 text-${option.color}-600`} />
                            <span className="font-medium">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 실제 비용 (성공한 경우만) */}
                  {formData.outcome === 'SUCCESSFUL' && (
                    <div>
                      <h4 className="font-medium mb-3">실제 월 비용 (선택사항)</h4>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          placeholder="실제 지불하는 월 비용을 입력해주세요"
                          value={formData.actualCost}
                          onChange={(e) => updateFormData('actualCost', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        다른 사용자들에게 도움이 되는 정보입니다
                      </p>
                    </div>
                  )}

                  {/* 전체 만족도 */}
                  <div>
                    <h4 className="font-medium mb-3">전체적인 만족도는 어떠신가요?</h4>
                    <div className="flex items-center justify-center py-4">
                      <StarRating
                        rating={formData.satisfactionScore}
                        onRatingChange={(rating) => updateFormData('satisfactionScore', rating)}
                        size="lg"
                      />
                    </div>
                    {formData.satisfactionScore > 0 && (
                      <p className="text-center text-sm text-gray-600">
                        {formData.satisfactionScore >= 4 ? '매우 만족스러우시군요! 🎉' :
                         formData.satisfactionScore >= 3 ? '만족스러우시네요! 😊' :
                         formData.satisfactionScore >= 2 ? '보통이시네요 😐' :
                         '아쉬우셨군요 😔'}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: 상세 평가 */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold mb-4">세부 항목별 평가</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'staff', label: '직원 서비스', icon: Users },
                      { key: 'facilities', label: '시설 환경', icon: Award },
                      { key: 'cost', label: '비용 대비 만족도', icon: DollarSign },
                      { key: 'location', label: '위치 및 접근성', icon: Users },
                      { key: 'services', label: '제공 서비스', icon: Heart },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-gray-600 mr-3" />
                          <span className="font-medium">{label}</span>
                        </div>
                        <StarRating
                          rating={formData.specificRatings[key as keyof typeof formData.specificRatings]}
                          onRatingChange={(rating) => updateSpecificRating(key, rating)}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>

                  {/* 추천 의향 */}
                  <div>
                    <h4 className="font-medium mb-3">다른 분들께 추천하고 싶으신가요?</h4>
                    <div className="flex items-center justify-center space-x-4">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => updateFormData('recommendationWillingness', score)}
                          className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${
                            formData.recommendationWillingness === score
                              ? 'border-purple-500 bg-purple-500 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-purple-300'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>전혀 추천하지 않음</span>
                      <span>적극 추천함</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: 추가 피드백 */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold mb-4">추가 의견을 들려주세요</h3>
                  
                  {/* 상세 피드백 */}
                  <div>
                    <label className="block font-medium mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      상세 후기 (선택사항)
                    </label>
                    <textarea
                      placeholder="시설에 대한 솔직한 후기를 작성해주세요. 다른 사용자들에게 큰 도움이 됩니다."
                      value={formData.feedback}
                      onChange={(e) => updateFormData('feedback', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.feedback.length}/1000자
                    </p>
                  </div>

                  {/* 개선 제안 */}
                  <div>
                    <label className="block font-medium mb-2">
                      <Lightbulb className="w-4 h-4 inline mr-2" />
                      추천 시스템 개선 제안 (선택사항)
                    </label>
                    <textarea
                      placeholder="추천 시스템이 더 정확해지려면 어떤 점이 개선되어야 할까요?"
                      value={formData.improvementSuggestion}
                      onChange={(e) => updateFormData('improvementSuggestion', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* 제출 전 요약 */}
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-purple-900 mb-2">피드백 요약</h4>
                      <div className="space-y-1 text-sm text-purple-700">
                        <div>매칭 결과: {
                          formData.outcome === 'SUCCESSFUL' ? '성공' :
                          formData.outcome === 'PENDING' ? '대기 중' : '미진행'
                        }</div>
                        <div>전체 만족도: {formData.satisfactionScore}/5점</div>
                        <div>추천 의향: {formData.recommendationWillingness}/5점</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 에러 메시지 */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{submitError}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* 하단 버튼들 */}
          <div className="border-t p-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 1) {
                    handleClose();
                  } else {
                    setCurrentStep(currentStep - 1);
                  }
                }}
              >
                {currentStep === 1 ? '취소' : '이전'}
              </Button>

              <Button
                onClick={() => {
                  if (currentStep === 3) {
                    handleSubmit();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={isSubmitting || (currentStep === 1 && formData.satisfactionScore === 0)}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Send className="w-4 h-4" />
                    </motion.div>
                    제출 중...
                  </>
                ) : currentStep === 3 ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    피드백 제출
                  </>
                ) : (
                  '다음'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchingCompletionForm; 