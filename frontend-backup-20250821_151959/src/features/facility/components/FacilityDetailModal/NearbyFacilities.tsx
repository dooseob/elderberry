/**
 * NearbyFacilities 컴포넌트 - 주변 편의시설 정보
 * 병원, 약국, 마트, 은행 등 주변 편의시설 정보를 표시
 */
import React, { memo } from 'react';
import {
  Activity,
  Building2,
  Car,
  Coffee,
  Heart,
  Home,
  MapPin,
  Navigation,
  Phone,
  ShoppingCart,
  Stethoscope,
  Bus,
  Users
} from '../../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui';
import { Card, CardContent } from '@/shared/ui';
import { Facility } from '@/types/facility';

interface NearbyFacilitiesProps {
  facility: Facility;
  nearbyFacilities: any[];
}

// 주변 시설 카테고리별 아이콘 매핑
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    hospital: Stethoscope,
    pharmacy: Heart,
    market: ShoppingCart,
    bank: Building2,
    restaurant: Coffee,
    transport: Bus,
    parking: Car,
    accommodation: Home,
    entertainment: Activity,
    education: Users,
    default: MapPin
  };
  
  return iconMap[category] || iconMap.default;
};

// 거리별 색상 매핑
const getDistanceColor = (distance: number) => {
  if (distance <= 300) return 'text-green-600 bg-green-100';
  if (distance <= 500) return 'text-blue-600 bg-blue-100';
  if (distance <= 1000) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const NearbyFacilities: React.FC<NearbyFacilitiesProps> = memo(({
  facility,
  nearbyFacilities
}) => {
  // 임시 주변 시설 데이터 (실제로는 props로 받아야 함)
  const mockNearbyFacilities = [
    {
      id: 1,
      name: '서울대학교병원',
      category: 'hospital',
      distance: 250,
      address: '서울특별시 종로구 대학로',
      phone: '02-2072-2114',
      rating: 4.5,
      isOpen: true
    },
    {
      id: 2,
      name: '온누리약국',
      category: 'pharmacy',
      distance: 180,
      address: '서울특별시 종로구 혜화동',
      phone: '02-764-8532',
      rating: 4.2,
      isOpen: true
    },
    {
      id: 3,
      name: '이마트 성수점',
      category: 'market',
      distance: 800,
      address: '서울특별시 성동구 성수동',
      phone: '02-499-1234',
      rating: 4.0,
      isOpen: false
    },
    {
      id: 4,
      name: '국민은행 혜화지점',
      category: 'bank',
      distance: 320,
      address: '서울특별시 종로구 혜화로',
      phone: '02-760-1234',
      rating: 3.8,
      isOpen: true
    },
    {
      id: 5,
      name: '혜화역 (지하철 4호선)',
      category: 'transport',
      distance: 450,
      address: '서울특별시 종로구 혜화동',
      phone: '-',
      rating: 4.3,
      isOpen: true
    },
    {
      id: 6,
      name: '카페베네 대학로점',
      category: 'restaurant',
      distance: 290,
      address: '서울특별시 종로구 대학로',
      phone: '02-744-5678',
      rating: 4.1,
      isOpen: true
    }
  ];

  const facilitiesToShow = nearbyFacilities.length > 0 ? nearbyFacilities : mockNearbyFacilities;

  // 카테고리별 필터링
  const categorizedFacilities = facilitiesToShow.reduce((acc: any, facility: any) => {
    const category = facility.category || 'default';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(facility);
    return acc;
  }, {});

  // 카테고리 이름 매핑
  const getCategoryName = (category: string) => {
    const nameMap: { [key: string]: string } = {
      hospital: '병원/의료기관',
      pharmacy: '약국',
      market: '마트/쇼핑',
      bank: '은행/금융',
      restaurant: '음식점/카페',
      transport: '교통',
      parking: '주차장',
      accommodation: '숙박',
      entertainment: '여가시설',
      education: '교육기관',
      default: '기타시설'
    };
    
    return nameMap[category] || '기타시설';
  };

  const handleDirections = (targetFacility: any) => {
    const url = `https://map.kakao.com/link/to/${targetFacility.name},${targetFacility.latitude || 37.5665},${targetFacility.longitude || 126.9780}`;
    window.open(url, '_blank');
  };

  const handleCall = (phone: string) => {
    if (phone && phone !== '-') {
      window.open(`tel:${phone}`);
    }
  };

  return (
    <motion.div
      key="nearby"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">주변 편의시설</h3>
        <span className="text-sm text-gray-600">
          총 {facilitiesToShow.length}개 시설
        </span>
      </div>

      {/* 거리별 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { range: '300m 이내', count: facilitiesToShow.filter(f => f.distance <= 300).length, color: 'bg-green-100 text-green-800' },
          { range: '500m 이내', count: facilitiesToShow.filter(f => f.distance <= 500).length, color: 'bg-blue-100 text-blue-800' },
          { range: '1km 이내', count: facilitiesToShow.filter(f => f.distance <= 1000).length, color: 'bg-yellow-100 text-yellow-800' },
          { range: '1km 초과', count: facilitiesToShow.filter(f => f.distance > 1000).length, color: 'bg-red-100 text-red-800' }
        ].map((stat) => (
          <div key={stat.range} className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stat.color}`}>
              {stat.count}개
            </div>
            <p className="text-xs text-gray-600 mt-1">{stat.range}</p>
          </div>
        ))}
      </div>

      {/* 카테고리별 시설 목록 */}
      <div className="space-y-6">
        {Object.entries(categorizedFacilities).map(([category, facilities]: [string, any]) => {
          const CategoryIcon = getCategoryIcon(category);
          
          return (
            <div key={category}>
              <h4 className="flex items-center font-medium text-gray-900 mb-3">
                <CategoryIcon className="w-5 h-5 mr-2 text-blue-600" />
                {getCategoryName(category)}
                <span className="ml-2 text-sm text-gray-500">({facilities.length}개)</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((nearbyFacility: any) => (
                  <Card key={nearbyFacility.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">{nearbyFacility.name}</h5>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{nearbyFacility.address}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDistanceColor(nearbyFacility.distance)}`}>
                            {nearbyFacility.distance}m
                          </span>
                          {nearbyFacility.isOpen !== undefined && (
                            <span className={`text-xs ${nearbyFacility.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                              {nearbyFacility.isOpen ? '영업중' : '영업종료'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 평점 표시 */}
                      {nearbyFacility.rating && (
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(nearbyFacility.rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-1">
                            {nearbyFacility.rating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirections(nearbyFacility)}
                          className="flex-1 text-xs"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          길찾기
                        </Button>
                        
                        {nearbyFacility.phone && nearbyFacility.phone !== '-' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCall(nearbyFacility.phone)}
                            className="flex-1 text-xs"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            연락
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 주변 시설 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">주변 시설 이용 안내</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• 거리 정보는 직선거리 기준이며, 실제 이동시간과 다를 수 있습니다</p>
          <p>• 영업시간 및 연락처 정보는 변경될 수 있으니 방문 전 확인하시기 바랍니다</p>
          <p>• 길찾기 기능을 통해 정확한 경로와 소요시간을 확인하실 수 있습니다</p>
        </div>
      </div>

      {/* 추가 정보 요청 */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-600 mb-3">
          원하시는 주변 시설 정보가 없나요?
        </p>
        <Button variant="outline" className="px-6">
          <MapPin className="w-4 h-4 mr-2" />
          추가 정보 요청하기
        </Button>
      </div>
    </motion.div>
  );
});

NearbyFacilities.displayName = 'NearbyFacilities';

export default NearbyFacilities;