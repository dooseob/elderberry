/**
 * ADL 평가 - 식사 활동 능력
 * KB라이프생명 기반 식사 능력 평가
 */
import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Utensils
} from '../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { useHealthAssessmentStore } from '@/stores/healthAssessmentStore';
import { ADL_OPTIONS } from '@/types/health';
import type { AdlLevel } from '@/types/health';
import { RadioGroup, type RadioOption } from '@/shared/ui';

const AdlEatingStep: React.FC = () => {
  const {
    formData,
    errors,
    updateAdlScore,
    clearError
  } = useHealthAssessmentStore();

  // 식사 평가 옵션 변환
  const eatingOptions: RadioOption[] = Object.entries(ADL_OPTIONS.eating).map(([value, label]) => ({
    value: parseInt(value) as AdlLevel,
    label,
    description: getEatingDescription(parseInt(value) as AdlLevel),
  }));

  // 평가 레벨별 상세 설명
  function getEatingDescription(level: AdlLevel): string {
    switch (level) {
      case 1:
        return '젓가락, 숟가락을 사용해서 혼자 식사 가능';
      case 2:
        return '음식을 자르거나 떠주는 등의 부분적 도움 필요';
      case 3:
        return '음식을 입에 넣어주거나 관급식 필요';
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
        title: '독립적 식사 가능',
        description: '일반식 제공이 가능한 모든 시설에서 케어 가능합니다.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        careAdvice: '균형잡힌 영양식단 관리가 중요합니다.',
      },
      2: {
        icon: <Info className="w-5 h-5 text-orange-500" />,
        title: '식사 보조 필요',
        description: '영양사가 있는 시설에서 적절한 식사 도움을 받을 수 있습니다.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        careAdvice: '음식을 잘게 썰거나 부드럽게 조리한 식단이 도움됩니다.',
      },
      3: {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        title: '전문적 급식 관리 필요',
        description: '간호사나 영양사가 상주하는 전문 시설이 필요합니다.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        careAdvice: '유동식, 관급식 등 전문적인 영양 공급이 필요할 수 있습니다.',
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
          <Utensils className="w-6 h-6 text-elderberry-600" />
          <h2 className="text-xl font-semibold text-elderberry-800">
            식사 활동 능력 평가
          </h2>
        </div>
        <p className="text-elderberry-600">
          평소 식사를 할 때의 상태를 가장 잘 나타내는 항목을 선택해주세요
        </p>
      </div>

      {/* 평가 질문 */}
      <div className="bg-elderberry-50 p-6 rounded-lg border border-elderberry-200">
        <h3 className="font-medium text-elderberry-800 mb-4 text-center">
          "평상시 식사를 할 때 어떤 상태인가요?"
        </h3>
        
        <RadioGroup
          name="eatingLevel"
          value={formData.eatingLevel}
          options={eatingOptions}
          onChange={(value) => {
            updateAdlScore('eatingLevel', value as AdlLevel);
            clearError('eatingLevel');
          }}
          error={errors.eatingLevel}
          required={true}
          direction="vertical"
        />
      </div>

      {/* 선택된 레벨에 따른 추가 정보 */}
      {formData.eatingLevel && getAdditionalInfo(formData.eatingLevel)}

      {/* 식사 유형별 세부 안내 */}
      <motion.div
        className="grid md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">🥄 일반식</h4>
          <p className="text-sm text-green-700">
            고체 음식을 씹어서 삼킬 수 있는 상태
          </p>
        </div>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2">🍲 연식/죽식</h4>
          <p className="text-sm text-orange-700">
            음식을 잘게 썰거나 부드럽게 조리한 식사
          </p>
        </div>
        
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">🩺 유동식/관급식</h4>
          <p className="text-sm text-red-700">
            액체 형태의 영양식이나 관을 통한 급식
          </p>
        </div>
      </motion.div>

      {/* 평가 가이드라인 */}
      <motion.div
        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="font-medium text-blue-800 mb-2">📋 평가 가이드라인</h4>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• <strong>평상시 식사 상태</strong>를 기준으로 평가해주세요</li>
          <li>• <strong>식욕이 없는 날</strong>이 아닌 일반적인 상태를 고려하세요</li>
          <li>• 씹는 능력, 삼키는 능력, 손동작 능력을 종합적으로 판단하세요</li>
          <li>• 의치나 보조기구를 사용하는 경우도 실제 가능한 정도로 평가하세요</li>
        </ul>
      </motion.div>

      {/* 점수 정보 */}
      {formData.eatingLevel && (
        <motion.div
          className="text-center text-sm text-elderberry-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-elderberry-100 rounded-full">
            <span>현재 점수:</span>
            <span className="font-semibold text-elderberry-800">
              {formData.eatingLevel} / 3점
            </span>
          </div>
          <p className="mt-2 text-xs">
            점수가 높을수록 더 많은 식사 도움이 필요한 상태입니다
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
              <p>젓가락으로 반찬을 집어먹고, 밥공기를 들어서 혼자 식사</p>
            </div>
            <div>
              <strong className="text-orange-700">2점 (부분도움):</strong>
              <p>음식을 한 입 크기로 잘라주면 혼자 먹을 수 있음</p>
            </div>
            <div>
              <strong className="text-red-700">3점 (완전도움):</strong>
              <p>입에 음식을 넣어줘야 하거나 코위관 등으로 영양 공급</p>
            </div>
          </div>
        </motion.div>
      </details>
    </div>
  );
};

export default AdlEatingStep;