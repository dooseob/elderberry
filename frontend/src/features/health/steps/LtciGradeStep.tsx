/**
 * 장기요양보험 등급 입력 단계
 * 선택사항 - 기존 등급이 있는 경우만
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Info } from 'lucide-react';

import { useHealthAssessmentStore } from '@/stores/healthAssessmentStore';
import { LTCI_GRADES } from '@/types/health';
import type { LtciGrade } from '@/types/health';
import RadioGroup, { type RadioOption } from '@/components/ui/RadioGroup';

const LtciGradeStep: React.FC = () => {
  const {
    formData,
    errors,
    setLtciGrade,
    clearError
  } = useHealthAssessmentStore();

  // 장기요양보험 등급 옵션 변환
  const ltciOptions: RadioOption[] = Object.entries(LTCI_GRADES).map(([value, info]) => ({
    value: parseInt(value) as LtciGrade,
    label: info.name,
    description: info.description,
  }));

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-elderberry-600" />
          <h2 className="text-xl font-semibold text-elderberry-800">
            장기요양보험 등급
          </h2>
        </div>
        <p className="text-elderberry-600">
          기존에 받으신 장기요양보험 등급이 있으시면 선택해주세요 (선택사항)
        </p>
      </div>

      {/* 안내 메시지 */}
      <motion.div
        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">장기요양보험 등급이란?</h4>
            <p className="text-sm text-blue-600">
              국민건강보험공단에서 신체기능·인지기능 상태를 평가하여 부여하는 등급입니다.
              등급이 없으시거나 모르시는 경우 '해당없음'을 선택하시면 됩니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 등급 선택 */}
      <div className="bg-elderberry-50 p-6 rounded-lg border border-elderberry-200">
        <h3 className="font-medium text-elderberry-800 mb-4 text-center">
          현재 가지고 계신 장기요양보험 등급을 선택해주세요
        </h3>
        
        <RadioGroup
          name="ltciGrade"
          value={formData.ltciGrade}
          options={ltciOptions}
          onChange={(value) => {
            setLtciGrade(value as LtciGrade);
            clearError('ltciGrade');
          }}
          error={errors.ltciGrade}
          direction="vertical"
        />
      </div>

      {/* 선택된 등급 정보 */}
      {formData.ltciGrade && formData.ltciGrade <= 6 && (
        <motion.div
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-medium text-green-800 mb-2">
            선택하신 등급: {LTCI_GRADES[formData.ltciGrade]?.name}
          </h4>
          <p className="text-sm text-green-600">
            이 등급 정보는 더욱 정확한 케어 등급 산출과 시설 추천에 활용됩니다.
          </p>
        </motion.div>
      )}

      {/* 등급별 설명 */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">1-2등급 (중증)</h4>
          <p className="text-sm text-red-700">
            24시간 돌봄이 필요한 중증 상태
          </p>
        </div>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2">3-4등급 (중등증)</h4>
          <p className="text-sm text-orange-700">
            일상생활에 상당한 도움이 필요한 상태
          </p>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">5등급 (경증)</h4>
          <p className="text-sm text-yellow-700">
            부분적인 도움이 필요한 상태
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">인지지원등급</h4>
          <p className="text-sm text-purple-700">
            치매 등 인지기능 저하로 인한 특별 등급
          </p>
        </div>
      </motion.div>

      {/* 신청 안내 */}
      <motion.div
        className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="font-medium text-gray-800 mb-2">💡 장기요양보험 신청 안내</h4>
        <p className="text-sm text-gray-600 mb-2">
          아직 장기요양보험을 신청하지 않으셨다면, 다음과 같은 경우 신청을 고려해보세요:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>일상생활에 지속적인 도움이 필요한 경우</li>
          <li>치매 진단을 받은 경우</li>
          <li>요양원 입소를 검토 중인 경우</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          신청은 가까운 국민건강보험공단 지사에서 가능합니다.
        </p>
      </motion.div>
    </div>
  );
};

export default LtciGradeStep;