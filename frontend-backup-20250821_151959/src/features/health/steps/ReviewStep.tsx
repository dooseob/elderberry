/**
 * 검토 및 제출 단계
 * 입력된 모든 정보 확인 및 평가 제출
 */
import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  Bath,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  Shield,
  User,
  Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useHealthAssessmentStore } from '../../../stores/healthAssessmentStore';
import { HealthAssessmentApi } from '../../../services/healthApi';
import { ADL_OPTIONS, LTCI_GRADES, CARE_TARGET_STATUS, MEAL_TYPES } from '../../../entities/health';
import { Button } from '../../../shared/ui';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui';

interface ReviewStepProps {
  onComplete?: (assessmentId: number) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onComplete }) => {
  const {
    formData,
    isSubmitting,
    updateFormData,
    resetForm
  } = useHealthAssessmentStore();
  
  // 완성도 계산 로직
  const calculateCompletionPercentage = () => {
    let completedFields = 0;
    const requiredFields = ['eatingLevel', 'toiletLevel', 'communicationLevel'];
    
    requiredFields.forEach(field => {
      if (formData[field as keyof typeof formData]) {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ADL 점수 계산
  const adlScore = useMemo(() => {
    const { mobilityLevel, eatingLevel, toiletLevel, communicationLevel } = formData;
    if (!mobilityLevel || !eatingLevel || !toiletLevel || !communicationLevel) {
      return null;
    }
    return mobilityLevel + eatingLevel + toiletLevel + communicationLevel;
  }, [formData]);

  // 케어 등급 예상 (간단한 로직)
  const estimatedCareGrade = useMemo(() => {
    if (!adlScore) return '계산 불가';
    
    if (adlScore <= 6) return '1-2등급 (중증)';
    if (adlScore <= 9) return '3-4등급 (중등증)';
    return '5등급 또는 인지지원등급 (경증)';
  }, [adlScore]);

  // 폼 데이터 검증
  const isFormValid = useMemo(() => {
    const { memberId, mobilityLevel, eatingLevel, toiletLevel, communicationLevel } = formData;
    return !!(memberId && mobilityLevel && eatingLevel && toiletLevel && communicationLevel);
  }, [formData]);

  // 평가 제출
  const handleSubmit = async () => {
    if (!isFormValid) {
      setSubmitError('필수 항목이 누락되었습니다.');
      return;
    }

    // setSubmitting(true); // TODO: Store에서 제공하는 setSubmitting 사용
    setSubmitError(null);

    try {
      const assessment = await HealthAssessmentApi.createAssessment(formData);
      setIsSuccess(true);
      
      // 성공 후 처리
      setTimeout(() => {
        onComplete?.(assessment.id);
        resetForm();
      }, 2000);
      
    } catch (error: any) {
      console.error('평가 제출 실패:', error);
      setSubmitError(
        error.response?.data?.message || 
        '평가 제출에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      // setSubmitting(false); // TODO: Store에서 제공하는 setSubmitting 사용
    }
  };

  // 성공 화면
  if (isSuccess) {
    return (
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-elderberry-800">
          건강 평가가 완료되었습니다!
        </h2>
        <p className="text-elderberry-600">
          입력해주신 정보를 바탕으로 맞춤형 케어 등급이 산출되었습니다.
        </p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            잠시 후 결과 페이지로 이동합니다...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-elderberry-800 mb-2">
          입력 정보 검토 및 제출
        </h2>
        <p className="text-elderberry-600">
          아래 정보를 확인하신 후 평가를 완료해주세요
        </p>
      </div>

      {/* 완성도 표시 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-elderberry-100 rounded-full">
          <span className="text-sm text-elderberry-700">완성도:</span>
          <span className="font-semibold text-elderberry-800">
            {Math.round(calculateCompletionPercentage())}%
          </span>
          {calculateCompletionPercentage() === 100 ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-500" />
          )}
        </div>
      </div>

      {/* 기본 정보 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-elderberry-700">회원 ID:</span>
              <span className="ml-2">{formData.memberId}</span>
            </div>
            {formData.gender && (
              <div>
                <span className="font-medium text-elderberry-700">성별:</span>
                <span className="ml-2">{formData.gender === 'M' ? '남성' : '여성'}</span>
              </div>
            )}
            {formData.birthYear && (
              <div>
                <span className="font-medium text-elderberry-700">출생년도:</span>
                <span className="ml-2">{formData.birthYear}년</span>
              </div>
            )}
            {formData.assessorRelation && (
              <div>
                <span className="font-medium text-elderberry-700">평가자 관계:</span>
                <span className="ml-2">{formData.assessorRelation}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ADL 평가 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>일상생활수행능력 (ADL) 평가</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-elderberry-50 rounded-lg">
              <Activity className="w-5 h-5 text-elderberry-600" />
              <div>
                <span className="font-medium text-elderberry-700">걷기:</span>
                <span className="ml-2">
                  {formData.mobilityLevel ? ADL_OPTIONS.mobility[formData.mobilityLevel] : '미입력'}
                </span>
                <span className="ml-2 text-sm text-elderberry-500">
                  ({formData.mobilityLevel || 0}점)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-elderberry-50 rounded-lg">
              <Utensils className="w-5 h-5 text-elderberry-600" />
              <div>
                <span className="font-medium text-elderberry-700">식사:</span>
                <span className="ml-2">
                  {formData.eatingLevel ? ADL_OPTIONS.eating[formData.eatingLevel] : '미입력'}
                </span>
                <span className="ml-2 text-sm text-elderberry-500">
                  ({formData.eatingLevel || 0}점)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-elderberry-50 rounded-lg">
              <Bath className="w-5 h-5 text-elderberry-600" />
              <div>
                <span className="font-medium text-elderberry-700">화장실:</span>
                <span className="ml-2">
                  {formData.toiletLevel ? ADL_OPTIONS.toilet[formData.toiletLevel] : '미입력'}
                </span>
                <span className="ml-2 text-sm text-elderberry-500">
                  ({formData.toiletLevel || 0}점)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-elderberry-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-elderberry-600" />
              <div>
                <span className="font-medium text-elderberry-700">의사소통:</span>
                <span className="ml-2">
                  {formData.communicationLevel ? ADL_OPTIONS.communication[formData.communicationLevel] : '미입력'}
                </span>
                <span className="ml-2 text-sm text-elderberry-500">
                  ({formData.communicationLevel || 0}점)
                </span>
              </div>
            </div>
          </div>

          {/* ADL 총점 */}
          {adlScore && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">ADL 총점:</span>
                <span className="text-lg font-bold text-blue-900">{adlScore} / 12점</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-medium text-blue-800">예상 케어 등급:</span>
                <span className="font-semibold text-blue-900">{estimatedCareGrade}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 추가 정보 요약 */}
      {(formData.ltciGrade || formData.careTargetStatus || formData.mealType || formData.diseaseTypes || formData.notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              추가 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {formData.ltciGrade && (
                <div>
                  <span className="font-medium text-elderberry-700">장기요양보험 등급:</span>
                  <span className="ml-2">{LTCI_GRADES[formData.ltciGrade]?.name}</span>
                </div>
              )}
              {formData.careTargetStatus && (
                <div>
                  <span className="font-medium text-elderberry-700">돌봄대상자 상태:</span>
                  <span className="ml-2">{CARE_TARGET_STATUS[formData.careTargetStatus]?.name}</span>
                </div>
              )}
              {formData.mealType && (
                <div>
                  <span className="font-medium text-elderberry-700">식사형태:</span>
                  <span className="ml-2">{MEAL_TYPES[formData.mealType]?.name}</span>
                </div>
              )}
              {formData.diseaseTypes && (
                <div>
                  <span className="font-medium text-elderberry-700">주요 질환:</span>
                  <span className="ml-2">{formData.diseaseTypes}</span>
                </div>
              )}
              {formData.notes && (
                <div>
                  <span className="font-medium text-elderberry-700">특이사항:</span>
                  <span className="ml-2">{formData.notes}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 오류 메시지 */}
      {submitError && (
        <motion.div
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">제출 오류</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{submitError}</p>
        </motion.div>
      )}

      {/* 제출 버튼 */}
      <div className="flex justify-center gap-4">
        <Button
          variant="secondary"
          onClick={() => window.print()}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          요약 인쇄
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          size="lg"
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              평가 제출 중...
            </>
          ) : (
            '건강 평가 완료'
          )}
        </Button>
      </div>

      {/* 안내 메시지 */}
      <motion.div
        className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-medium text-blue-800 mb-2">✅ 평가 완료 후 제공 서비스</h4>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-600">
          <div>• 개인별 맞춤 케어 등급 산출</div>
          <div>• 적합한 요양 시설 추천</div>
          <div>• 전문 코디네이터 매칭</div>
          <div>• 케어 플랜 상담 제공</div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewStep;