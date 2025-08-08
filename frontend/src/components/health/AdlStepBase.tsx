/**
 * ADL 평가 공통 컴포넌트
 * 모든 ADL 스텝의 공통 구조와 로직을 처리하는 추상 컴포넌트
 * DRY 원칙 적용으로 코드 중복 제거
 */
import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info
} from '../icons/LucideIcons';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import { useHealthAssessmentStore } from '../../stores/healthAssessmentStore';
import { ADL_OPTIONS } from '../../entities/health';
import type { AdlLevel } from '../../entities/health';
import { RadioGroup, type RadioOption } from '../../shared/ui/RadioGroup';

interface AdlStepBaseProps {
  // 기본 정보
  icon: LucideIcon;
  title: string;
  description: string;
  questionText: string;
  
  // ADL 카테고리 및 필드명
  adlCategory: keyof typeof ADL_OPTIONS;
  fieldName: 'mobilityLevel' | 'eatingLevel' | 'toiletLevel' | 'communicationLevel';
  
  // 레벨별 설명 함수
  getDescription: (level: AdlLevel) => string;
  
  // 추가 정보 렌더링 함수
  renderAdditionalInfo: (level: AdlLevel) => React.ReactNode;
  
  // 가이드라인 및 추가 콘텐츠
  guidelines?: React.ReactNode;
  infoSections?: React.ReactNode;
  exampleSituations?: React.ReactNode;
}

const AdlStepBase: React.FC<AdlStepBaseProps> = ({
  icon: Icon,
  title,
  description,
  questionText,
  adlCategory,
  fieldName,
  getDescription,
  renderAdditionalInfo,
  guidelines,
  infoSections,
  exampleSituations
}) => {
  const {
    formData,
    errors,
    updateAdlScore,
    clearError
  } = useHealthAssessmentStore();

  // ADL 옵션 변환
  const adlOptions: RadioOption[] = Object.entries(ADL_OPTIONS[adlCategory]).map(([value, label]) => ({
    value: parseInt(value) as AdlLevel,
    label,
    description: getDescription(parseInt(value) as AdlLevel),
  }));

  // 현재 값
  const currentValue = formData[fieldName];

  // 점수 정보 렌더링
  const renderScoreInfo = () => (
    <motion.div
      className="p-4 bg-green-50 border border-green-200 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h4 className="font-medium text-green-800 mb-2">📊 점수 정보</h4>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-green-700">
          <span className="font-medium">1점:</span> 자립 가능
        </div>
        <div className="text-yellow-700">
          <span className="font-medium">2점:</span> 부분 도움
        </div>
        <div className="text-red-700">
          <span className="font-medium">3점:</span> 완전 도움
        </div>
      </div>
      <p className="text-xs text-green-600 mt-2">
        * 점수가 낮을수록 자립도가 높으며, 전체 ADL 점수로 돌봄 등급을 평가합니다
      </p>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Icon className="w-6 h-6 text-elderberry-600" />
          <h2 className="text-xl font-semibold text-elderberry-800">
            {title}
          </h2>
        </div>
        <p className="text-elderberry-600">
          {description}
        </p>
      </div>

      {/* 평가 질문 */}
      <div className="bg-elderberry-50 p-6 rounded-lg border border-elderberry-200">
        <h3 className="font-medium text-elderberry-800 mb-4 text-center">
          {questionText}
        </h3>
        
        <RadioGroup
          name={fieldName}
          value={currentValue}
          options={adlOptions}
          onChange={(value) => {
            updateAdlScore(fieldName, value as AdlLevel);
            clearError(fieldName);
          }}
          error={errors[fieldName]}
          required={true}
          direction="vertical"
        />
      </div>

      {/* 선택된 레벨에 따른 추가 정보 */}
      {currentValue && renderAdditionalInfo(currentValue)}

      {/* 정보 섹션들 */}
      {infoSections && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {infoSections}
        </motion.div>
      )}

      {/* 평가 가이드라인 */}
      {guidelines && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {guidelines}
        </motion.div>
      )}

      {/* 점수 정보 */}
      {renderScoreInfo()}

      {/* 예시 상황 */}
      {exampleSituations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {exampleSituations}
        </motion.div>
      )}
    </div>
  );
};

export default AdlStepBase; 