/**
 * 고급 시설 카드 컴포넌트 - main 프로젝트용 적응 버전
 * frontend의 고급 기능을 main에 맞게 단순화
 */
import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Heart,
  MapPin,
  Phone,
  Star,
  Users,
  Bed,
  Shield
} from 'lucide-react';
import type { FacilityProfileResponse } from '../../types/facility';

interface FacilityCardProps {
  facility: FacilityProfileResponse;
  viewMode?: 'list' | 'grid';
  onSelect?: (facility: FacilityProfileResponse) => void;
  onContact?: (facility: FacilityProfileResponse) => void;
  showActions?: boolean;
  className?: string;
}

export function FacilityCard({
  facility,
  viewMode = 'list',
  onSelect,
  onContact,
  showActions = true,
  className = ''
}: FacilityCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 시설 등급 색상 매핑
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '우수': return 'text-green-600 bg-green-100';
      case '양호': return 'text-blue-600 bg-blue-100';
      case '보통': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 평점 별 표시
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // 연락 처리
  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (facility.contactNumber) {
      window.open(`tel:${facility.contactNumber}`);
      onContact?.(facility);
    }
  };

  // 즐겨찾기 토글
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // 상세 보기
  const handleViewDetails = () => {
    onSelect?.(facility);
  };

  // 가용 슬롯 상태
  const getAvailabilityStatus = () => {
    if (facility.availableSlots === 0) {
      return { text: '대기자 명단', color: 'text-red-600 bg-red-100' };
    } else if (facility.availableSlots <= 3) {
      return { text: `${facility.availableSlots}자리 남음`, color: 'text-orange-600 bg-orange-100' };
    } else {
      return { text: `${facility.availableSlots}자리 가능`, color: 'text-green-600 bg-green-100' };
    }
  };

  const availability = getAvailabilityStatus();

  // 그리드 뷰
  if (viewMode === 'grid') {
    return (
      <div 
        className={`bg-white rounded-xl border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${className}`}
        onClick={handleViewDetails}
      >
        {/* 상단 헤더 */}
        <div className="p-4 pb-3">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                {facility.facilityName}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {facility.region} {facility.district}
              </p>
            </div>
            
            {/* 즐겨찾기 */}
            <button
              onClick={handleFavoriteToggle}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart 
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`} 
              />
            </button>
          </div>

          {/* 등급 및 평점 */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(facility.facilityGrade)}`}>
              {facility.facilityGrade}
            </span>
            <div className="flex items-center gap-1">
              {renderStars(facility.rating || 0)}
              <span className="text-sm text-gray-600 ml-1">
                ({facility.reviewCount || 0})
              </span>
            </div>
          </div>

          {/* 시설 정보 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Users className="w-4 h-4" />
                정원
              </span>
              <span className="font-medium">{facility.capacity || 0}명</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Bed className="w-4 h-4" />
                가용성
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${availability.color}`}>
                {availability.text}
              </span>
            </div>

            {facility.basicMonthlyFee && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  월비용
                </span>
                <span className="font-semibold text-primary">
                  {facility.basicMonthlyFee.toLocaleString()}만원
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼들 */}
        {showActions && (
          <div className="p-4 pt-0 flex gap-2">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-4 h-4" />
              상세보기
            </button>
            
            {facility.contactNumber && (
              <button
                onClick={handleContact}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Phone className="w-4 h-4" />
                연락하기
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 리스트 뷰 (기본값)
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${className}`}
      onClick={handleViewDetails}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* 왼쪽: 시설 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors mb-1">
                  {facility.facilityName}
                </h3>
                <p className="text-gray-600 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {facility.address}
                </p>
                
                {/* 등급 및 평점 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(facility.facilityGrade)}`}>
                    {facility.facilityGrade}
                  </span>
                  <div className="flex items-center gap-1">
                    {renderStars(facility.rating || 0)}
                    <span className="text-sm text-gray-600 ml-1">
                      {facility.rating?.toFixed(1) || '0.0'} ({facility.reviewCount || 0}개 리뷰)
                    </span>
                  </div>
                </div>

                {/* 시설 특징 */}
                {facility.serviceFeatures && facility.serviceFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {facility.serviceFeatures.slice(0, 3).map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg"
                      >
                        {feature}
                      </span>
                    ))}
                    {facility.serviceFeatures.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg">
                        +{facility.serviceFeatures.length - 3}개
                      </span>
                    )}
                  </div>
                )}

                {/* 소개 텍스트 */}
                {facility.introductionText && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {facility.introductionText}
                  </p>
                )}
              </div>

              {/* 즐겨찾기 */}
              <button
                onClick={handleFavoriteToggle}
                className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Heart 
                  className={`w-6 h-6 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`} 
                />
              </button>
            </div>

            {/* 시설 상세 정보 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">정원:</span>
                <span className="font-medium">{facility.capacity || 0}명</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">가용성:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${availability.color}`}>
                  {availability.text}
                </span>
              </div>

              {facility.basicMonthlyFee && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">월비용:</span>
                  <span className="font-semibold text-primary">
                    {facility.basicMonthlyFee.toLocaleString()}만원
                  </span>
                </div>
              )}

              {facility.establishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">설립:</span>
                  <span className="font-medium">
                    {new Date(facility.establishedDate).getFullYear()}년
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          {showActions && (
            <div className="ml-6 flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={handleViewDetails}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Eye className="w-4 h-4" />
                상세보기
              </button>
              
              {facility.contactNumber && (
                <button
                  onClick={handleContact}
                  className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" />
                  연락하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}