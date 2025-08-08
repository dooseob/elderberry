/**
 * ADL 평가 - 의사소통 능력
 * KB라이프생명 기반 인지 및 소통 능력 평가
 */
import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  MessageCircle
} from '../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { useHealthAssessmentStore } from '../../../stores/healthAssessmentStore';
import { ADL_OPTIONS } from '../../../entities/health';
import type { AdlLevel } from '../../../entities/health';
import { RadioGroup, type RadioOption } from '@/shared/ui';

const AdlCommunicationStep: React.FC = () => {
  const {
    formData,
    errors,
    updateAdlScore,
    clearError
  } = useHealthAssessmentStore();

  // 의사소통 평가 옵션 변환
  const communicationOptions: RadioOption[] = Object.entries(ADL_OPTIONS.communication).map(([value, label]) => ({
    value: parseInt(value) as AdlLevel,
    label,
    description: getCommunicationDescription(parseInt(value) as AdlLevel),
  }));

  // 평가 레벨별 상세 설명
  function getCommunicationDescription(level: AdlLevel): string {
    switch (level) {
      case 1:
        return '일상 대화와 의사표현이 자유롭게 가능함';
      case 2:
        return '기본적인 의사표현은 가능하나 때때로 어려움';
      case 3:
        return '의사소통이 매우 어렵거나 거의 불가능함';
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
        title: '원활한 의사소통 가능',
        description: '일반적인 요양 시설에서 문제없이 지낼 수 있습니다.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        careAdvice: '다양한 여가활동과 사회적 교류 프로그램에 참여 가능합니다.',
      },
      2: {
        icon: <Info className="w-5 h-5 text-orange-500" />,
        title: '부분적 소통 장애',
        description: '인지케어 프로그램이 있는 시설이 적합합니다.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        careAdvice: '인지자극 활동과 규칙적인 일상 패턴 유지가 도움됩니다.',
      },
      3: {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        title: '전문적 인지케어 필요',
        description: '치매 전문 케어가 가능한 시설이 필요합니다.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        careAdvice: '24시간 전문 관찰과 행동증상 관리가 필요할 수 있습니다.',
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
          <MessageCircle className="w-6 h-6 text-elderberry-600" />
          <h2 className="text-xl font-semibold text-elderberry-800">
            의사소통 능력 평가
          </h2>
        </div>
        <p className="text-elderberry-600">
          평소 대화나 의사표현 시의 상태를 가장 잘 나타내는 항목을 선택해주세요
        </p>
      </div>

      {/* 평가 질문 */}
      <div className="bg-elderberry-50 p-6 rounded-lg border border-elderberry-200">
        <h3 className="font-medium text-elderberry-800 mb-4 text-center">
          "평상시 대화나 의사표현을 할 때 어떤 상태인가요?"
        </h3>
        
        <RadioGroup
          name="communicationLevel"
          value={formData.communicationLevel}
          options={communicationOptions}
          onChange={(value) => {
            updateAdlScore('communicationLevel', value as AdlLevel);
            clearError('communicationLevel');
          }}
          error={errors.communicationLevel}
          required={true}
          direction="vertical"
        />
      </div>

      {/* 선택된 레벨에 따른 추가 정보 */}
      {formData.communicationLevel && getAdditionalInfo(formData.communicationLevel)}

      {/* 의사소통 영역별 세부 안내 */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🗣️ 언어 표현</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 원하는 것을 말로 표현</li>
            <li>• 불편함이나 아픔 호소</li>
            <li>• 기본적인 대화 참여</li>
          </ul>
        </div>
        
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">🧠 인지 능력</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• 시간, 장소 인식</li>
            <li>• 사람 구별 및 인식</li>
            <li>• 상황 판단 능력</li>
          </ul>
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
          <li>• <strong>평상시 상태</strong>를 기준으로 평가해주세요</li>
          <li>• <strong>언어 표현</strong>과 <strong>이해 능력</strong>을 종합적으로 판단하세요</li>
          <li>• 치매나 인지장애가 있는 경우 현재 상태를 반영하세요</li>
          <li>• 감정 상태가 좋지 않은 때가 아닌 일반적인 상태로 평가하세요</li>
        </ul>
      </motion.div>

      {/* 점수 정보 */}
      {formData.communicationLevel && (
        <motion.div
          className="text-center text-sm text-elderberry-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-elderberry-100 rounded-full">
            <span>현재 점수:</span>
            <span className="font-semibold text-elderberry-800">
              {formData.communicationLevel} / 3점
            </span>
          </div>
          <p className="mt-2 text-xs">
            점수가 높을수록 더 많은 의사소통 지원이 필요한 상태입니다
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
              <strong className="text-green-700">1점 (정상):</strong>
              <p>일상 대화가 자유롭고, 본인의 의견을 명확히 표현할 수 있음</p>
            </div>
            <div>
              <strong className="text-orange-700">2점 (부분제한):</strong>
              <p>화장실 가고 싶다는 의사는 표현할 수 있지만, 복잡한 대화는 어려움</p>
            </div>
            <div>
              <strong className="text-red-700">3점 (심각제한):</strong>
              <p>기본적인 의사표현도 어렵고, 사람이나 상황 인식에 문제가 있음</p>
            </div>
          </div>
        </motion.div>
      </details>
    </div>
  );
};

export default AdlCommunicationStep;