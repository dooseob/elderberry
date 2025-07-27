/**
 * 기본 정보 입력 단계
 * 평가 대상자의 기본 정보 수집
 */
import React from 'react';
import {
  Calendar,
  User,
  UserCheck
} from '../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { useHealthAssessmentStore } from '@/stores/healthAssessmentStore';
import type { Gender } from '@/types/health';
import RadioGroup from '@/components/ui/RadioGroup';

const BasicInfoStep: React.FC = () => {
  const {
    formData,
    errors,
    updateFormData,
    clearError
  } = useHealthAssessmentStore();

  // 성별 옵션
  const genderOptions = [
    { value: 'M', label: '남성', description: '생물학적 남성' },
    { value: 'F', label: '여성', description: '생물학적 여성' },
  ];

  // 평가자 관계 옵션
  const assessorRelationOptions = [
    { value: '본인', label: '본인', description: '평가 대상자 본인이 직접 평가' },
    { value: '배우자', label: '배우자', description: '배우자가 평가' },
    { value: '자녀', label: '자녀', description: '자녀가 평가' },
    { value: '가족', label: '기타 가족', description: '기타 가족구성원이 평가' },
    { value: '간병인', label: '간병인', description: '전문 간병인이 평가' },
    { value: '기타', label: '기타', description: '기타 관계자가 평가' },
  ];

  // 현재 연도 계산
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}년`,
  }));

  return (
    <div className="space-y-8">
      {/* 회원 ID (읽기 전용) */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-elderberry-700 mb-3">
          <User className="w-4 h-4" />
          회원 ID
          <span className="text-red-500">*</span>
        </label>
        <div className="p-4 bg-elderberry-50 border border-elderberry-200 rounded-lg">
          <span className="text-elderberry-800 font-medium">
            {formData.memberId || '회원 ID가 설정되지 않았습니다'}
          </span>
          <p className="text-xs text-elderberry-500 mt-1">
            평가 대상자의 회원 ID입니다 (자동 설정됨)
          </p>
        </div>
      </div>

      {/* 성별 선택 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-elderberry-700 mb-3">
          <UserCheck className="w-4 h-4" />
          성별 (선택사항)
        </label>
        <RadioGroup
          name="gender"
          value={formData.gender}
          options={genderOptions}
          onChange={(value) => {
            updateFormData({ gender: value as Gender });
            clearError('gender');
          }}
          error={errors.gender}
          direction="horizontal"
        />
        <p className="text-xs text-elderberry-500 mt-2">
          성별 정보는 통계 분석 및 맞춤형 추천에 활용됩니다
        </p>
      </div>

      {/* 출생년도 선택 */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-elderberry-700 mb-3">
          <Calendar className="w-4 h-4" />
          출생년도 (선택사항)
        </label>
        <div className="relative">
          <select
            value={formData.birthYear || ''}
            onChange={(e) => {
              const year = e.target.value ? parseInt(e.target.value) : undefined;
              updateFormData({ birthYear: year });
              clearError('birthYear');
            }}
            className={`
              w-full p-4 border-2 rounded-lg transition-all duration-200
              ${errors.birthYear 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-elderberry-200 focus:border-elderberry-500'
              }
              focus:outline-none focus:ring-0 bg-white
            `}
          >
            <option value="">출생년도를 선택하세요</option>
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {errors.birthYear && (
          <motion.p
            className="mt-2 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.birthYear}
          </motion.p>
        )}
        <p className="text-xs text-elderberry-500 mt-2">
          연령대별 케어 등급 분석에 활용됩니다
        </p>
      </div>

      {/* 평가자 이름 */}
      <div>
        <label className="block text-sm font-medium text-elderberry-700 mb-3">
          평가자 이름 (선택사항)
        </label>
        <input
          type="text"
          value={formData.assessorName || ''}
          onChange={(e) => {
            updateFormData({ assessorName: e.target.value });
            clearError('assessorName');
          }}
          placeholder="평가를 진행하는 분의 성함을 입력하세요"
          className={`
            w-full p-4 border-2 rounded-lg transition-all duration-200
            ${errors.assessorName 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-elderberry-200 focus:border-elderberry-500'
            }
            focus:outline-none focus:ring-0
          `}
        />
        {errors.assessorName && (
          <motion.p
            className="mt-2 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.assessorName}
          </motion.p>
        )}
      </div>

      {/* 평가자와의 관계 */}
      <div>
        <label className="block text-sm font-medium text-elderberry-700 mb-3">
          평가자와 대상자의 관계 (선택사항)
        </label>
        <RadioGroup
          name="assessorRelation"
          value={formData.assessorRelation}
          options={assessorRelationOptions}
          onChange={(value) => {
            updateFormData({ assessorRelation: value as string });
            clearError('assessorRelation');
          }}
          error={errors.assessorRelation}
          direction="vertical"
        />
        <p className="text-xs text-elderberry-500 mt-2">
          평가의 신뢰성 검증과 맞춤형 추천에 활용됩니다
        </p>
      </div>

      {/* 안내 메시지 */}
      <motion.div
        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">개인정보 보호 안내</h4>
            <p className="text-sm text-blue-600">
              입력하신 모든 정보는 암호화되어 안전하게 보관되며, 
              건강 상태 평가 및 맞춤형 서비스 제공 목적으로만 사용됩니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BasicInfoStep;