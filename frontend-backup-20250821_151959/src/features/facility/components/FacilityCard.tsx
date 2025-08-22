/**
 * 시설 카드 컴포넌트
 * 시설 정보를 카드 형태로 표시하고, 사용자 행동 추적 버튼들 포함
 */
import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Users
} from '../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { FacilityProfile, useFacilityStore } from '@/stores/facilityStore';
import { Button, Card, CardContent, CardHeader } from '@/shared/ui';

interface FacilityCardProps {
  facility: FacilityProfile;
  viewMode?: 'list' | 'grid';
  onSelect?: (facility: FacilityProfile) => void;
  showActions?: boolean;
  isRecommendation?: boolean;
  matchScore?: number;
  recommendationReason?: string;
}

const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  viewMode = 'list',
  onSelect,
  showActions = true,
  isRecommendation = false,
  matchScore,
  recommendationReason,
}) => {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  
  const {
    selectFacility,
    openDetailModal,
    trackFacilityContact,
    trackFacilityVisit,
  } = useFacilityStore();

  // 시설 상세 보기
  const handleViewDetails = () => {
    selectFacility(facility);
    openDetailModal();
    onSelect?.(facility);
  };

  // 시설 연락 추적
  const handleContact = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionLoading('contact');
    
    try {
      await trackFacilityContact(facility.id);
      // 실제 연락 기능 (전화 걸기 등) 구현 가능
      window.open(`tel:${facility.phoneNumber}`);
    } catch (error) {
      console.error('연락 추적 실패:', error);
    } finally {
      setIsActionLoading(null);
    }
  };

  // 시설 방문 예약 (실제로는 방문 추적)
  const handleVisit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionLoading('visit');
    
    try {
      await trackFacilityVisit(facility.id);
      // 실제 방문 예약 기능 구현 가능
      alert('방문 예약이 접수되었습니다. 시설에서 연락드리겠습니다.');
    } catch (error) {
      console.error('방문 추적 실패:', error);
    } finally {
      setIsActionLoading(null);
    }
  };

  // 시설 등급 색상 매핑
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 입소 가능 여부 계산
  const availableSlots = facility.totalCapacity - facility.currentOccupancy;
  const occupancyRate = (facility.currentOccupancy / facility.totalCapacity) * 100;

  // 월 비용 포맷팅
  const formatCost = (cost: number | null) => {
    if (!cost) return '문의';
    return `${(cost / 10000).toFixed(0)}만원`;
  };

  // 그리드 뷰 렌더링
  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={handleViewDetails}
        >
          {/* 추천 배지 */}
          {isRecommendation && matchScore && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="w-3 h-3 mr-1" />
                {Math.round(matchScore)}% 매칭
              </div>
            </div>
          )}

          {/* 시설 이미지 */}
          <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            {facility.imageUrl ? (
              <img
                src={facility.imageUrl}
                alt={facility.facilityName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* 등급 배지 */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(facility.facilityGrade)}`}>
                {facility.facilityGrade}등급
              </span>
            </div>
          </div>

          <CardContent className="p-4">
            {/* 시설 기본 정보 */}
            <div className="mb-3">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                {facility.facilityName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{facility.facilityType}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">{facility.address}</span>
              </div>
            </div>

            {/* 입소 현황 */}
            <div className="mb-3">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-600">입소 현황</span>
                <span className={`font-medium ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {availableSlots > 0 ? `${availableSlots}명 입소 가능` : '입소 대기'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${occupancyRate >= 90 ? 'bg-red-500' : occupancyRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                />
              </div>
            </div>

            {/* 월 비용 */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">월 기본료</span>
                <span className="font-semibold text-lg text-gray-900">
                  {formatCost(facility.monthlyBasicFee)}
                </span>
              </div>
            </div>

            {/* 전문 서비스 */}
            {facility.specialties && facility.specialties.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {facility.specialties.slice(0, 2).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {facility.specialties.length > 2 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{facility.specialties.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 추천 이유 */}
            {isRecommendation && recommendationReason && (
              <div className="mb-4 p-2 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 line-clamp-2">
                  💡 {recommendationReason}
                </p>
              </div>
            )}

            {/* 액션 버튼들 */}
            {showActions && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContact}
                  disabled={isActionLoading === 'contact'}
                  className="flex-1"
                >
                  {isActionLoading === 'contact' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Phone className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleVisit}
                  disabled={isActionLoading === 'visit'}
                  className="flex-1"
                >
                  {isActionLoading === 'visit' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Calendar className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-1" />
                      방문
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // 리스트 뷰 렌더링 (기본)
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={handleViewDetails}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* 시설 이미지 */}
            <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {facility.imageUrl ? (
                <img
                  src={facility.imageUrl}
                  alt={facility.facilityName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* 메인 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-1">
                    {facility.facilityName}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-600">{facility.facilityType}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(facility.facilityGrade)}`}>
                      {facility.facilityGrade}등급
                    </span>
                    {isRecommendation && matchScore && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {Math.round(matchScore)}% 매칭
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{facility.address}</span>
              </div>

              {/* 입소 현황 및 비용 */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">입소 현황</span>
                    <span className={`font-medium ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {availableSlots > 0 ? `${availableSlots}명 가능` : '대기'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${occupancyRate >= 90 ? 'bg-red-500' : occupancyRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">월 기본료</div>
                  <div className="font-semibold text-lg text-gray-900">
                    {formatCost(facility.monthlyBasicFee)}
                  </div>
                </div>
              </div>

              {/* 전문 서비스 */}
              {facility.specialties && facility.specialties.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {facility.specialties.slice(0, 4).map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {facility.specialties.length > 4 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                        +{facility.specialties.length - 4}개 더
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 추천 이유 */}
              {isRecommendation && recommendationReason && (
                <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    💡 {recommendationReason}
                  </p>
                </div>
              )}

              {/* 액션 버튼들 */}
              {showActions && (
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContact}
                    disabled={isActionLoading === 'contact'}
                  >
                    {isActionLoading === 'contact' ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Phone className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-1" />
                        연락하기
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleVisit}
                    disabled={isActionLoading === 'visit'}
                  >
                    {isActionLoading === 'visit' ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Calendar className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-1" />
                        방문 예약
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails();
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    상세보기
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FacilityCard; 