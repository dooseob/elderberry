import React, { useEffect, useRef, useState } from 'react';
import { FacilityProfileResponse } from '../types/facility';

interface FacilityMapProps {
  facilities: FacilityProfileResponse[];
  selectedFacilityId?: number;
  onFacilitySelect?: (facility: FacilityProfileResponse) => void;
  className?: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  facilities,
  selectedFacilityId,
  onFacilitySelect,
  className = "w-full h-96"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false`;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsMapLoaded(true);
      });
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심
      level: 8
    };

    const mapInstance = new window.kakao.maps.Map(mapRef.current, options);
    setMap(mapInstance);
  }, [isMapLoaded]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !facilities.length) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: any[] = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    facilities.forEach(facility => {
      if (!facility.latitude || !facility.longitude) return;

      const position = new window.kakao.maps.LatLng(facility.latitude, facility.longitude);
      
      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        title: facility.facilityName
      });

      // 마커 스타일 (선택된 시설 강조)
      if (facility.id === selectedFacilityId) {
        // 선택된 마커는 다른 이미지 사용 가능
        marker.setZIndex(1000);
      }

      marker.setMap(map);

      // 인포윈도우 생성
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: createInfoWindowContent(facility),
        removable: true
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 닫기
        newMarkers.forEach(({ infoWindow: iw }) => iw.close());
        
        infoWindow.open(map, marker);
        
        if (onFacilitySelect) {
          onFacilitySelect(facility);
        }
      });

      newMarkers.push({ marker, infoWindow });
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // 모든 마커가 보이도록 지도 범위 조정
    if (facilities.length > 0 && facilities.some(f => f.latitude && f.longitude)) {
      map.setBounds(bounds);
    }
  }, [map, facilities, selectedFacilityId, onFacilitySelect]);

  // 인포윈도우 내용 생성
  const createInfoWindowContent = (facility: FacilityProfileResponse) => {
    const gradeColor = facility.facilityGrade === '우수' ? 'text-green-600' : 
                     facility.facilityGrade === '양호' ? 'text-blue-600' : 'text-gray-600';
    
    return `
      <div class="p-3 min-w-64 max-w-sm">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-bold text-gray-800">${facility.facilityName}</h3>
          ${facility.facilityGrade ? `<span class="px-2 py-1 text-xs rounded bg-gray-100 ${gradeColor}">${facility.facilityGrade}</span>` : ''}
        </div>
        <div class="space-y-1 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <span class="text-blue-500">📍</span>
            <span>${facility.address}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-green-500">🏥</span>
            <span>${facility.facilityType}</span>
          </div>
          ${facility.contactNumber ? `
            <div class="flex items-center gap-1">
              <span class="text-purple-500">📞</span>
              <span>${facility.contactNumber}</span>
            </div>
          ` : ''}
          <div class="flex items-center gap-3 pt-2">
            <span class="text-blue-600">정원: ${facility.capacity}명</span>
            <span class="text-green-600">가능: ${facility.availableSlots}명</span>
          </div>
          ${facility.rating ? `
            <div class="flex items-center gap-1 pt-1">
              <span class="text-yellow-500">⭐</span>
              <span class="font-medium">${facility.rating.toFixed(1)}</span>
              ${facility.reviewCount ? `<span class="text-gray-500">(${facility.reviewCount}개 리뷰)</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  if (!isMapLoaded) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default FacilityMap;