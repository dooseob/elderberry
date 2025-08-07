/**
 * FacilityMap 컴포넌트 - 시설 위치 정보 및 지도 표시
 * 카카오 지도 통합, 교통 정보, 주변 시설 등을 포함
 */
import React, { memo } from 'react';
import {
  Car,
  MapPin,
  Navigation,
} from '../../../../components/icons/LucideIcons';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui';
import { KakaoMap } from '@/components/map/KakaoMap';
import { Facility } from '@/types/facility';

interface FacilityMapProps {
  facility: Facility;
  nearbyFacilities?: any[];
}

const FacilityMap: React.FC<FacilityMapProps> = memo(({
  facility,
  nearbyFacilities = []
}) => {
  // 지도로 위치 보기
  const handleViewMap = () => {
    if (facility?.latitude && facility?.longitude) {
      const url = `https://map.kakao.com/link/map/${facility.facilityName},${facility.latitude},${facility.longitude}`;
      window.open(url, '_blank');
    }
  };

  // 네이버 지도로 보기
  const handleViewNaverMap = () => {
    const url = `https://map.naver.com/v5/search/${encodeURIComponent(facility.address)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      key="location"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <h3 className="text-lg font-semibold mb-4">위치 정보</h3>
      
      {/* 카카오 지도 컴포넌트 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          지도
        </h4>
        <KakaoMap
          facility={{
            id: facility.id,
            name: facility.facilityName,
            address: facility.address,
            latitude: facility.latitude || undefined,
            longitude: facility.longitude || undefined,
            phone: facility.phoneNumber
          }}
          height="350px"
          showNearbyPlaces={true}
          showControls={true}
          className="rounded-lg overflow-hidden"
        />
      </div>

      {/* 주소 정보 */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">주소</span>
          </div>
          <p className="text-gray-700 ml-6">{facility.address}</p>
        </div>

        {facility.latitude && facility.longitude && (
          <div>
            <div className="flex items-center mb-2">
              <Navigation className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">좌표</span>
            </div>
            <p className="text-gray-700 ml-6">
              위도: {facility.latitude}, 경도: {facility.longitude}
            </p>
          </div>
        )}

        {/* 외부 지도 링크 */}
        <div className="flex space-x-3">
          <Button
            onClick={handleViewMap}
            variant="outline"
            className="flex-1"
          >
            <MapPin className="w-4 h-4 mr-2" />
            카카오맵에서 보기
          </Button>
          <Button
            onClick={handleViewNaverMap}
            variant="outline"
            className="flex-1"
          >
            <Navigation className="w-4 h-4 mr-2" />
            네이버지도에서 보기
          </Button>
        </div>

        {/* 교통 정보 */}
        <div>
          <h4 className="font-medium mb-3">교통 정보</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Car className="w-4 h-4 mr-2 text-gray-400" />
              <span>주차장 이용 가능</span>
            </div>
            <div className="text-gray-600 ml-6">
              대중교통 이용 시 가장 가까운 지하철역에서 도보 10분 거리
            </div>
          </div>
        </div>

        {/* 주변 시설 정보 */}
        {nearbyFacilities.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">주변 편의시설</h4>
            <div className="grid grid-cols-2 gap-3">
              {nearbyFacilities.slice(0, 6).map((facility, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">{facility.name}</span>
                  <span className="text-gray-500 text-xs">({facility.distance}m)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 지도 사용법 안내 */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">지도 사용 안내</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 지도를 드래그하여 주변 지역을 탐색할 수 있습니다</p>
            <p>• 확대/축소 버튼으로 상세한 위치 확인이 가능합니다</p>
            <p>• 마커를 클릭하면 시설 정보를 확인할 수 있습니다</p>
            <p>• 외부 지도 앱에서 길찾기 기능을 이용하실 수 있습니다</p>
          </div>
        </div>

        {/* 방문 안내 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">방문 시 참고사항</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 방문 전 사전 연락을 권장합니다</p>
            <p>• 주차 공간이 제한적일 수 있으니 대중교통 이용을 고려해보세요</p>
            <p>• 시설 내 방역 수칙을 준수해 주시기 바랍니다</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

FacilityMap.displayName = 'FacilityMap';

export default FacilityMap;