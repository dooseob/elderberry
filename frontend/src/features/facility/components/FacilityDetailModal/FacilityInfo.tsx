/**
 * FacilityInfo 컴포넌트 - 시설 기본 정보 표시
 * 시설의 개요, 편의시설, 운영 정보, 비용 정보 등을 포함
 */
import React, { memo } from 'react';
import {
  Activity,
  Award,
  Calendar,
  Camera,
  Car,
  CheckCircle,
  Clock,
  Heart,
  Phone,
  Shield,
  Stethoscope,
  Users,
  Utensils,
  Wifi,
  X
} from '../../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui';
import { Facility } from '@/types/facility';

interface FacilityInfoProps {
  facility: Facility;
  isActionLoading: string | null;
  onContact: () => void;
  onVisit: () => void;
  onMatching: () => void;
}

const FacilityInfo: React.FC<FacilityInfoProps> = memo(({
  facility,
  isActionLoading,
  onContact,
  onVisit,
  onMatching
}) => {
  // 월 비용 포맷팅
  const formatCost = (cost: number | null) => {
    if (!cost) return '문의';
    return `${(cost / 10000).toFixed(0)}만원`;
  };

  // 시설 편의시설 (임시 데이터)
  const amenities = [
    { icon: Wifi, label: '무료 WiFi', available: true },
    { icon: Car, label: '주차장', available: true },
    { icon: Utensils, label: '식당', available: true },
    { icon: Activity, label: '운동시설', available: false },
    { icon: Camera, label: 'CCTV', available: true },
    { icon: Shield, label: '24시간 보안', available: true },
  ];

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
      role="tabpanel"
      id="tabpanel-overview"
      aria-labelledby="tab-overview"
    >
      {/* 시설 설명 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">시설 소개</h3>
        <p className="text-gray-700 leading-relaxed">
          {facility.description || 
            `${facility.facilityName}은(는) ${facility.facilityType}로서 전문적인 돌봄 서비스를 제공합니다. 
            숙련된 전문 인력과 체계적인 케어 프로그램을 통해 입소자분들의 건강하고 안전한 생활을 지원하고 있습니다.`
          }
        </p>
      </div>

      {/* 전문 서비스 */}
      {facility.specialties && facility.specialties.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">전문 서비스</h3>
          <div className="flex flex-wrap gap-2">
            {facility.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 편의시설 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">편의시설</h3>
        <div className="grid grid-cols-2 gap-3">
          {amenities.map(({ icon: Icon, label, available }) => (
            <div
              key={label}
              className={`flex items-center space-x-2 ${
                available ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
              {available ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 운영 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">운영 정보</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span>운영시간: {facility.operatingHours || '24시간 운영'}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>연락처: {facility.phoneNumber}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              <span>정원: {facility.totalCapacity}명</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-gray-400" />
              <span>등급: {facility.facilityGrade}등급</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">비용 정보</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">월 기본료</span>
              <span className="font-semibold">{formatCost(facility.monthlyBasicFee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">식비</span>
              <span className="text-gray-500">별도 문의</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">간병비</span>
              <span className="text-gray-500">등급별 상이</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              * 정확한 비용은 상담을 통해 확인하실 수 있습니다.
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 연락 섹션 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">빠른 연락 및 예약</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={onContact}
            disabled={isActionLoading === 'contact'}
            className="flex items-center justify-center space-x-2"
          >
            {isActionLoading === 'contact' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Phone className="w-4 h-4" />
              </motion.div>
            ) : (
              <Phone className="w-4 h-4" />
            )}
            <span>전화 상담</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onVisit}
            disabled={isActionLoading === 'visit'}
            className="flex items-center justify-center space-x-2"
          >
            {isActionLoading === 'visit' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Calendar className="w-4 h-4" />
              </motion.div>
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            <span>방문 예약</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onMatching}
            className="flex items-center justify-center space-x-2"
          >
            <Heart className="w-4 h-4" />
            <span>매칭 신청</span>
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600 text-center">
          <p>📞 상담 가능 시간: 평일 09:00 ~ 18:00</p>
          <p>🏥 방문 상담 시 사전 예약을 권장합니다.</p>
        </div>
      </div>

      {/* 케어 등급별 서비스 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">제공 서비스</h3>
        
        {/* 케어 등급별 서비스 */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">케어 등급별 서비스</h4>
          <div className="space-y-2">
            {facility.availableCareGrades.map((grade) => (
              <div key={grade} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <span>{grade}등급 케어</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        {/* 추가 서비스 정보 */}
        <div className="space-y-4">
          <div className="p-4 bg-white border rounded-lg">
            <h5 className="font-medium mb-2">일상생활 지원</h5>
            <p className="text-sm text-gray-600">식사, 목욕, 배설, 이동 등 일상생활 전반에 대한 전문적인 돌봄 서비스</p>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <h5 className="font-medium mb-2">건강 관리</h5>
            <p className="text-sm text-gray-600">정기 건강검진, 투약 관리, 응급상황 대응 등 체계적인 건강 관리</p>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <h5 className="font-medium mb-2">여가 활동</h5>
            <p className="text-sm text-gray-600">다양한 프로그램과 여가 활동을 통한 정서적 지원 및 사회적 교류</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

FacilityInfo.displayName = 'FacilityInfo';

export default FacilityInfo;