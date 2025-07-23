/**
 * ADL 평가 - 배변 활동 능력
 * KB라이프생명 기반 화장실 이용 능력 평가
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Bath, AlertCircle, CheckCircle2, Info } from 'lucide-react';

import { useHealthAssessmentStore } from '@/stores/healthAssessmentStore';
import { ADL_OPTIONS } from '@/types/health';
import type { AdlLevel } from '@/types/health';
import RadioGroup, { type RadioOption } from '@/components/ui/RadioGroup';

const AdlToiletStep: React.FC = () => {
  const {
    formData,
    errors,
    updateAdlScore,
    clearError
  } = useHealthAssessmentStore();

  // 화장실 이용 평가 옵션 변환
  const toiletOptions: RadioOption[] = Object.entries(ADL_OPTIONS.toilet).map(([value, label]) => ({
    value: parseInt(value) as AdlLevel,
    label,
    description: getToiletDescription(parseInt(value) as AdlLevel),
  }));

  // 평가 레벨별 상세 설명
  function getToiletDescription(level: AdlLevel): string {
    switch (level) {
      case 1:
        return '혼자서 화장실에 가서 모든 과정을 처리 가능';
      case 2:
        return '화장실까지 가거나 옷을 입고 벗는데 도움 필요';
      case 3:
        return '기저귀 착용하거나 간이변기 사용, 전면적 도움 필요';
      default:
        return '';
    }
  }

  // 현재 선택된 레벨에 따른 추가 정보
  const getAdditionalInfo = (level?: AdlLevel) => {
    if (!level) return null;

    const infoConfig = {
      1: {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        title: '독립적 화장실 이용',
        description: '개인 화장실이 있는 일반 시설에서 케어 가능합니다.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        careAdvice: '안전 손잡이가 설치된 화장실이 도움됩니다.',
      },
      2: {
        icon: <Info className="w-5 h-5 text-orange-500" />,
        title: '화장실 이용 보조 필요',
        description: '요양보호사의 도움을 받을 수 있는 시설이 적합합니다.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        careAdvice: '휠체어 접근 가능한 화장실과 이동 보조가 필요합니다.',
      },
      3: {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        title: '전문적 배변 관리 필요',
        description: '24시간 간호사가 상주하는 전문 케어 시설이 필요합니다.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        careAdvice: '위생 관리와 피부 케어에 특별한 주의가 필요합니다.',
      },
    };

    const config = infoConfig[level];
    
    return (
      <motion.div
        className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1">
            <h4 className={`font-medium ${config.textColor} mb-1`}>
              {config.title}
            </h4>
            <p className={`text-sm ${config.textColor} mb-2`}>
              {config.description}
            </p>
            <div className={`text-xs ${config.textColor} bg-white bg-opacity-50 p-2 rounded`}>
              <strong>케어 조언:</strong> {config.careAdvice}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Bath className="w-6 h-6 text-elderberry-600" />
          <h2 className="text-xl font-semibold text-elderberry-800">
            배변 활동 능력 평가
          </h2>
        </div>
        <p className="text-elderberry-600">
          평소 화장실 이용 시의 상태를 가장 잘 나타내는 항목을 선택해주세요
        </p>
      </div>

      {/* 평가 질문 */}
      <div className="bg-elderberry-50 p-6 rounded-lg border border-elderberry-200">
        <h3 className="font-medium text-elderberry-800 mb-4 text-center">
          "평상시 화장실을 이용할 때 어떤 상태인가요?"
        </h3>
        
        <RadioGroup
          name="toiletLevel"
          value={formData.toiletLevel}
          options={toiletOptions}
          onChange={(value) => {
            updateAdlScore('toiletLevel', value as AdlLevel);
            clearError('toiletLevel');
          }}
          error={errors.toiletLevel}
          required={true}
          direction="vertical"
        />
      </div>

      {/* 선택된 레벨에 따른 추가 정보 */}
      {formData.toiletLevel && getAdditionalInfo(formData.toiletLevel)}

      {/* 평가 가이드라인 */}
      <motion.div
        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="font-medium text-blue-800 mb-2">📋 평가 가이드라인</h4>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• <strong>평상시 상태</strong>를 기준으로 평가해주세요</li>
          <li>• 화장실까지 <strong>이동하는 능력</strong>을 포함해서 판단하세요</li>
          <li>• 옷을 <strong>입고 벗는 능력</strong>도 함께 고려하세요</li>
          <li>• 안전상 이유로 제한하는 경우도 실제 능력을 기준으로 평가하세요</li>
        </ul>
      </motion.div>

      {/* 점수 정보 */}
      {formData.toiletLevel && (
        <motion.div
          className="text-center text-sm text-elderberry-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-elderberry-100 rounded-full">
            <span>현재 점수:</span>
            <span className="font-semibold text-elderberry-800">
              {formData.toiletLevel} / 3점
            </span>
          </div>
          <p className="mt-2 text-xs">
            점수가 높을수록 더 많은 배변 도움이 필요한 상태입니다
          </p>
        </motion.div>
      )}

      {/* 예시 상황 */}
      <details className="group">
        <summary className="cursor-pointer font-medium text-elderberry-700 hover:text-elderberry-800 transition-colors">
          💡 구체적인 예시 상황 보기
        </summary>
        <motion.div
          className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong className="text-green-700">1점 (독립):</strong>
              <p>화장실에 혼자 가서 용변을 보고 뒤처리까지 혼자 처리</p>
            </div>
            <div>
              <strong className="text-orange-700">2점 (부분도움):</strong>
              <p>화장실까지 도움을 받아가거나, 옷 입고 벗기에 도움 필요</p>
            </div>
            <div>
              <strong className="text-red-700">3점 (완전도움):</strong>
              <p>기저귀 사용하거나 간이변기 사용, 전면적인 도움 필요</p>
            </div>
          </div>
        </motion.div>
      </details>
    </div>
  );
};

export default AdlToiletStep;