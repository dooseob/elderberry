/**
 * 고급 시설 검색 필터 컴포넌트 - main 프로젝트용 적응 버전
 */
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Users, 
  Award,
  Sliders
} from 'lucide-react';
import type { FacilitySearchParams } from '../../types/facility';
import { FACILITY_FILTER_OPTIONS } from '../../services/facilityService';

interface FacilitySearchFiltersProps {
  searchParams: FacilitySearchParams;
  onFilterChange: (params: Partial<FacilitySearchParams>) => void;
  className?: string;
}

export function FacilitySearchFilters({
  searchParams,
  onFilterChange,
  className = ''
}: FacilitySearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof FacilitySearchParams, value: any) => {
    onFilterChange({ [key]: value });
    
    // 활성 필터 추적
    if (value && value !== '전체') {
      if (!activeFilters.includes(key)) {
        setActiveFilters([...activeFilters, key]);
      }
    } else {
      setActiveFilters(activeFilters.filter(f => f !== key));
    }
  };

  // 모든 필터 초기화
  const clearAllFilters = () => {
    onFilterChange({
      facilityType: '전체',
      facilityGrade: '전체',
      region: '전체',
      priceRange: undefined
    });
    setActiveFilters([]);
  };

  // 활성 필터 개수
  const activeFilterCount = Object.entries(searchParams).filter(
    ([key, value]) => value && value !== '전체' && key !== 'page' && key !== 'size'
  ).length;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* 필터 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">검색 필터</h3>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                초기화
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 간단한 필터 (항상 표시) */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 시설 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시설 유형
            </label>
            <select
              value={searchParams.facilityType || '전체'}
              onChange={(e) => handleFilterChange('facilityType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {FACILITY_FILTER_OPTIONS.facilityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              지역
            </label>
            <select
              value={searchParams.region || '전체'}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {FACILITY_FILTER_OPTIONS.regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* 시설 등급 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              시설 등급
            </label>
            <select
              value={searchParams.facilityGrade || '전체'}
              onChange={(e) => handleFilterChange('facilityGrade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {FACILITY_FILTER_OPTIONS.facilityGrades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 고급 필터 (확장 시 표시) */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="space-y-6">
            {/* 가격 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <DollarSign className="w-4 h-4 inline mr-1" />
                월 이용료 범위
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {FACILITY_FILTER_OPTIONS.priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleFilterChange('priceRange', range)}
                    className={`p-3 text-sm border rounded-lg transition-colors ${
                      searchParams.priceRange?.label === range.label
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 편의시설 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Sliders className="w-4 h-4 inline mr-1" />
                편의시설 및 서비스
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  '24시간 간병',
                  '물리치료',
                  '영양관리',
                  '의료진 상주',
                  '레크리에이션',
                  '송영서비스',
                  '방문요양',
                  '방문목욕',
                  '치매전문케어',
                  '재활치료'
                ].map((service) => (
                  <label key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 정원 규모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="w-4 h-4 inline mr-1" />
                시설 규모
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: '소규모 (30명 미만)', min: 0, max: 29 },
                  { label: '중간 규모 (30-50명)', min: 30, max: 50 },
                  { label: '대규모 (50-100명)', min: 50, max: 100 },
                  { label: '초대형 (100명 이상)', min: 100, max: 999 }
                ].map((size) => (
                  <button
                    key={size.label}
                    className="p-3 text-sm border border-gray-200 rounded-lg hover:border-gray-300 text-gray-700 transition-colors"
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 가용성 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                입소 가능성
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '즉시 입소 가능', value: 'immediate' },
                  { label: '3개월 내 가능', value: 'within_3months' },
                  { label: '6개월 내 가능', value: 'within_6months' },
                  { label: '대기자 명단 등록', value: 'waiting_list' }
                ].map((availability) => (
                  <button
                    key={availability.value}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 text-gray-700 transition-colors"
                  >
                    {availability.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 필터 적용 버튼 */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={clearAllFilters}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              필터 초기화
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              필터 적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}