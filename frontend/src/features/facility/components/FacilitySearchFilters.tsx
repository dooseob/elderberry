/**
 * 시설 검색 필터 컴포넌트
 * 시설 타입, 등급, 지역, 케어 등급, 비용 등의 다양한 필터링 옵션 제공
 */
import React, { useState } from 'react';
import {
  DollarSign,
  Heart,
  MapPin,
  Star,
  Users,
  X
} from '../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import Button from '../../../shared/ui/Button';
import { FacilitySearchFilters as FilterType } from '@/stores/facilityStore';

interface FacilitySearchFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClear?: () => void;
}

// 필터 옵션 상수들
const FACILITY_TYPES = [
  { value: '요양시설', label: '노인요양시설', description: '24시간 케어 서비스' },
  { value: '요양병원', label: '요양병원', description: '의료진 상주 치료' },
  { value: '양로시설', label: '양로시설', description: '독립생활 지원' },
  { value: '치매전문시설', label: '치매전문시설', description: '치매 특화 케어' },
  { value: '재활전문시설', label: '재활전문시설', description: '재활치료 중심' },
  { value: '단기보호시설', label: '단기보호시설', description: '임시 보호 서비스' },
];

const FACILITY_GRADES = [
  { value: 'A', label: 'A등급', description: '최우수 (90점 이상)', color: 'text-green-600' },
  { value: 'B', label: 'B등급', description: '우수 (80-89점)', color: 'text-blue-600' },
  { value: 'C', label: 'C등급', description: '양호 (70-79점)', color: 'text-yellow-600' },
  { value: 'D', label: 'D등급', description: '보통 (60-69점)', color: 'text-orange-600' },
  { value: 'E', label: 'E등급', description: '미흡 (60점 미만)', color: 'text-red-600' },
];

const CARE_GRADES = [
  { value: 1, label: '1등급', description: '최중증 (95점 이상)' },
  { value: 2, label: '2등급', description: '중증 (75-94점)' },
  { value: 3, label: '3등급', description: '중등도 (60-74점)' },
  { value: 4, label: '4등급', description: '경증 (51-59점)' },
  { value: 5, label: '5등급', description: '경증 (45-50점)' },
];

const REGIONS = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', 
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도',
  '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
];

const MONTHLY_FEE_RANGES = [
  { value: 1000000, label: '100만원 이하' },
  { value: 1500000, label: '150만원 이하' },
  { value: 2000000, label: '200만원 이하' },
  { value: 2500000, label: '250만원 이하' },
  { value: 3000000, label: '300만원 이하' },
  { value: 5000000, label: '500만원 이하' },
];

const SPECIALTIES = [
  '치매케어', '재활치료', '물리치료', '작업치료', '언어치료',
  '인지치료', '호스피스케어', '의료케어', '영양관리', '심리상담'
];

const FacilitySearchFilters: React.FC<FacilitySearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['type', 'grade']));

  // 섹션 토글
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // 필터 업데이트 헬퍼
  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({ [key]: value });
  };

  // 필터 초기화
  const handleClearAll = () => {
    onFiltersChange({
      facilityType: undefined,
      facilityGrade: undefined,
      region: undefined,
      careGradeLevel: undefined,
      maxMonthlyFee: undefined,
      minFacilityGrade: undefined,
      specialties: undefined,
      maxDistanceKm: undefined,
      hasAvailableSlots: undefined,
    });
    onClear?.();
  };

  // 활성 필터 개수 계산
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  return (
    <div className="space-y-6">
      {/* 필터 헤더 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          상세 필터
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {activeFiltersCount}개 적용됨
            </span>
          )}
        </h3>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            전체 초기화
          </Button>
        )}
      </div>

      {/* 시설 타입 필터 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('type')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium">시설 타입</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('type') ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {expandedSections.has('type') && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {FACILITY_TYPES.map((type) => (
                <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="facilityType"
                    value={type.value}
                    checked={filters.facilityType === type.value}
                    onChange={(e) => updateFilter('facilityType', e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 시설 등급 필터 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('grade')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Star className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium">시설 등급</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('grade') ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {expandedSections.has('grade') && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {FACILITY_GRADES.map((grade) => (
                <label key={grade.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="facilityGrade"
                    value={grade.value}
                    checked={filters.facilityGrade === grade.value}
                    onChange={(e) => updateFilter('facilityGrade', e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className={`text-sm font-medium ${grade.color}`}>{grade.label}</div>
                    <div className="text-xs text-gray-500">{grade.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 지역 필터 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('region')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
        >
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium">지역</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('region') ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {expandedSections.has('region') && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4 border-t border-gray-100"
          >
            <select
              value={filters.region || ''}
              onChange={(e) => updateFilter('region', e.target.value || undefined)}
              className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">전체 지역</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </motion.div>
        )}
      </div>

      {/* 케어 등급 필터 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('care')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Heart className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium">케어 등급</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('care') ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {expandedSections.has('care') && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {CARE_GRADES.map((grade) => (
                <label key={grade.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="careGradeLevel"
                    value={grade.value}
                    checked={filters.careGradeLevel === grade.value}
                    onChange={(e) => updateFilter('careGradeLevel', parseInt(e.target.value))}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{grade.label}</div>
                    <div className="text-xs text-gray-500">{grade.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 월 비용 필터 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('cost')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
        >
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium">월 비용</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('cost') ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {expandedSections.has('cost') && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4 border-t border-gray-100"
          >
            <div className="space-y-2 mt-3">
              {MONTHLY_FEE_RANGES.map((range) => (
                <label key={range.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="maxMonthlyFee"
                    value={range.value}
                    checked={filters.maxMonthlyFee === range.value}
                    onChange={(e) => updateFilter('maxMonthlyFee', parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-900">{range.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 전문 서비스 필터 */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('specialties')}
          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Star className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-medium">전문 서비스</span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('specialties') ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        {expandedSections.has('specialties') && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4 border-t border-gray-100"
          >
            <div className="flex flex-wrap gap-2 mt-3">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => {
                    const currentSpecialties = filters.specialties || [];
                    const isSelected = currentSpecialties.includes(specialty);
                    const newSpecialties = isSelected
                      ? currentSpecialties.filter(s => s !== specialty)
                      : [...currentSpecialties, specialty];
                    updateFilter('specialties', newSpecialties.length > 0 ? newSpecialties : undefined);
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    (filters.specialties || []).includes(specialty)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 기타 옵션 */}
      <div className="border border-gray-200 rounded-lg">
        <div className="px-4 py-3">
          <h4 className="font-medium text-gray-900 mb-3">기타 옵션</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasAvailableSlots || false}
                onChange={(e) => updateFilter('hasAvailableSlots', e.target.checked ? true : undefined)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-900">입소 가능한 시설만 보기</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitySearchFilters; 