/**
 * ADL 평가 - 걷기 활동 능력
 * KB라이프생명 기반 이동성 평가
 * AdlStepBase를 사용하여 리팩토링됨
 */
import React from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2
} from '../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import AdlStepBase from '@/components/health/AdlStepBase';
import type { AdlLevel } from '@/types/health';

const AdlMobilityStep: React.FC = () => {
  // 평가 레벨별 상세 설명
  const getMobilityDescription = (level: AdlLevel): string => {
    switch (level) {
      case 1:
        return '보조기구 없이 자유롭게 걸을 수 있음';
      case 2:
        return '지팡이, 워커 등의 도움이나 타인의 부축이 필요함';
      case 3:
        return '휠체어를 주로 사용하거나 침상에서 생활함';
      default:
        return '';
    }
  };

  // 현재 선택된 레벨에 따른 추가 정보
  const renderAdditionalInfo = (level: AdlLevel): React.ReactNode => {
    const infoConfig = {
      1: {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        title: '독립적 이동 가능',
        description: '대부분의 요양 시설에서 케어 가능한 수준입니다.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
      },
      2: {
        icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
        title: '부분적 도움 필요',
        description: '재활 프로그램이 있는 시설을 권장합니다.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
      },
      3: {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        title: '전문적 케어 필요',
        description: '간호사가 상주하는 시설이 필요합니다.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
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
          <div>
            <h4 className={`font-medium ${config.textColor} mb-1`}>
              {config.title}
            </h4>
            <p className={`text-sm ${config.textColor}`}>
              {config.description}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  // 가이드라인
  const guidelines = (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-800 mb-2">📋 평가 가이드라인</h4>
      <ul className="text-sm text-blue-600 space-y-1">
        <li>• <strong>평상시 상태</strong>를 기준으로 평가해주세요</li>
        <li>• <strong>몸이 아픈 날</strong>이 아닌 일반적인 상태를 고려하세요</li>
        <li>• 보조기구를 사용하는 경우, 해당 기구를 사용한 상태로 평가하세요</li>
        <li>• 안전상 이유로 제한하는 경우도 실제 능력을 기준으로 평가하세요</li>
      </ul>
    </div>
  );

  // 예시 상황
  const exampleSituations = (
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
            <p>마트에서 쇼핑을 하거나 산책을 혼자서 할 수 있음</p>
          </div>
          <div>
            <strong className="text-orange-700">2점 (부분도움):</strong>
            <p>지팡이를 짚고 걷거나, 가족이 팔을 잡아주면 걸을 수 있음</p>
          </div>
          <div>
            <strong className="text-red-700">3점 (완전도움):</strong>
            <p>휠체어를 사용하거나 침대에서 대부분 생활함</p>
          </div>
        </div>
      </motion.div>
    </details>
  );

  return (
    <AdlStepBase
      icon={Activity}
      title="걷기 활동 능력 평가"
      description="평소 일상생활에서의 이동 능력을 가장 잘 나타내는 항목을 선택해주세요"
      questionText="평상시 걷기나 이동을 할 때 어떤 상태인가요?"
      adlCategory="mobility"
      fieldName="mobilityLevel"
      getDescription={getMobilityDescription}
      renderAdditionalInfo={renderAdditionalInfo}
      guidelines={guidelines}
      exampleSituations={exampleSituations}
    />
  );
};

export default AdlMobilityStep;