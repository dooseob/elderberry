/**
 * 추가 정보 입력 단계
 * 돌봄상태, 식사형태, 질환정보 등
 */
import React from 'react';
import {
  AlertTriangle,
  FileText
} from '../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { useHealthAssessmentStore } from '@/stores/healthAssessmentStore';
import { CARE_TARGET_STATUS, MEAL_TYPES } from '@/types/health';
import type { CareTargetStatus, MealType } from '@/types/health';
import RadioGroup, { type RadioOption } from '@/components/ui/RadioGroup';

const AdditionalInfoStep: React.FC = () => {
  const {
    formData,
    errors,
    setCareTargetStatus,
    setMealType,
    setDiseaseTypes,
    setNotes,
    clearError
  } = useHealthAssessmentStore();

  // 돌봄대상자 상태 옵션
  const careStatusOptions: RadioOption[] = Object.entries(CARE_TARGET_STATUS).map(([value, info]) => ({
    value: parseInt(value) as CareTargetStatus,
    label: info.name,
    description: info.description,
  }));

  // 식사형태 옵션
  const mealTypeOptions: RadioOption[] = Object.entries(MEAL_TYPES).map(([value, info]) => ({
    value: parseInt(value) as MealType,
    label: info.name,
    description: info.description,
  }));

  return (
    <div className="space-y-8">
      {/* 섹션 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-elderberry-600" />
          <h2 className="text-xl font-semibold text-elderberry-800">
            추가 정보 입력
          </h2>
        </div>
        <p className="text-elderberry-600">
          더 정확한 평가를 위한 추가 정보를 입력해주세요 (모든 항목 선택사항)
        </p>
      </div>

      {/* 돌봄대상자 상태 */}
      <div>
        <h3 className="font-medium text-elderberry-800 mb-4">
          돌봄대상자 상태 (선택사항)
        </h3>
        <div className="bg-elderberry-50 p-6 rounded-lg border border-elderberry-200">
          <RadioGroup
            name="careTargetStatus"
            value={formData.careTargetStatus}
            options={careStatusOptions}
            onChange={(value) => {
              setCareTargetStatus(value as CareTargetStatus);
              clearError('careTargetStatus');
            }}
            error={errors.careTargetStatus}
            direction="vertical"
          />
        </div>
        
        {formData.careTargetStatus === 1 && (
          <motion.div
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">호스피스 케어 권장</h4>
                <p className="text-sm text-red-600">
                  이 상태에서는 호스피스 전문 시설이나 가정 호스피스 서비스를 권장합니다.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 식사형태 */}
      <div>
        <h3 className="font-medium text-elderberry-800 mb-4">
          식사형태 (선택사항)
        </h3>
        <div className="bg-elderberry-50 p-6 rounded-lg border border-elderberry-200">
          <RadioGroup
            name="mealType"
            value={formData.mealType}
            options={mealTypeOptions}
            onChange={(value) => {
              setMealType(value as MealType);
              clearError('mealType');
            }}
            error={errors.mealType}
            direction="vertical"
          />
        </div>
      </div>

      {/* 질환 정보 */}
      <div>
        <h3 className="font-medium text-elderberry-800 mb-4">
          주요 질환 및 병력 (선택사항)
        </h3>
        <textarea
          value={formData.diseaseTypes || ''}
          onChange={(e) => {
            setDiseaseTypes(e.target.value);
            clearError('diseaseTypes');
          }}
          placeholder="예: 고혈압, 당뇨병, 치매, 뇌졸중, 관절염 등&#10;진단받은 질환이나 복용 중인 약물이 있으시면 입력해주세요"
          rows={4}
          className={`
            w-full p-4 border-2 rounded-lg transition-all duration-200 resize-none
            ${errors.diseaseTypes 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-elderberry-200 focus:border-elderberry-500'
            }
            focus:outline-none focus:ring-0
          `}
        />
        {errors.diseaseTypes && (
          <motion.p
            className="mt-2 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.diseaseTypes}
          </motion.p>
        )}
        <p className="text-xs text-elderberry-500 mt-2">
          질환 정보는 적절한 의료 지원이 가능한 시설 추천에 활용됩니다
        </p>
      </div>

      {/* 특이사항 및 기타 메모 */}
      <div>
        <h3 className="font-medium text-elderberry-800 mb-4">
          특이사항 및 기타 메모 (선택사항)
        </h3>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => {
            setNotes(e.target.value);
            clearError('notes');
          }}
          placeholder="예: 특별한 케어가 필요한 사항, 주의할 점, 선호하는 환경 등&#10;평가에 도움이 될 추가 정보가 있으시면 자유롭게 입력해주세요"
          rows={4}
          className={`
            w-full p-4 border-2 rounded-lg transition-all duration-200 resize-none
            ${errors.notes 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-elderberry-200 focus:border-elderberry-500'
            }
            focus:outline-none focus:ring-0
          `}
        />
        {errors.notes && (
          <motion.p
            className="mt-2 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.notes}
          </motion.p>
        )}
        <p className="text-xs text-elderberry-500 mt-2">
          이 정보는 더욱 맞춤화된 케어 계획 수립에 도움이 됩니다
        </p>
      </div>

      {/* 안내 메시지 */}
      <motion.div
        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-medium text-blue-800 mb-2">📝 추가 정보의 활용</h4>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• <strong>질환 정보</strong>: 의료진이 상주하는 시설 우선 추천</li>
          <li>• <strong>식사형태</strong>: 적절한 급식 서비스가 가능한 시설 매칭</li>
          <li>• <strong>돌봄상태</strong>: 호스피스나 전문 케어 시설 구분</li>
          <li>• <strong>특이사항</strong>: 개별 맞춤형 케어 계획 수립</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default AdditionalInfoStep;