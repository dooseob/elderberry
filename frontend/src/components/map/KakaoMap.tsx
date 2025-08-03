/**
 * 카카오 지도 컴포넌트
 * 시설 위치 표시 및 주변 편의시설 표시
 */
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Car,
  Bus,
  Hospital,
  ShoppingCart,
  Coffee
} from '../icons/LucideIcons';

/**
 * 카카오 지도 SDK 타입 정의
 */
declare global {
  interface Window {
    kakao: any;
  }
}

/**
 * 지도에 표시될 장소 정보
 */
interface MapPlace {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  category?: string;
  distance?: number;
  isMainFacility?: boolean;
}

/**
 * 주변 편의시설 카테고리
 */
interface NearbyCategory {
  code: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

const NEARBY_CATEGORIES: NearbyCategory[] = [
  { code: 'HP8', name: '병원', icon: Hospital, color: 'text-red-600' },
  { code: 'PM9', name: '약국', icon: Hospital, color: 'text-green-600' },
  { code: 'MT1', name: '마트', icon: ShoppingCart, color: 'text-blue-600' },
  { code: 'CS2', name: '편의점', icon: ShoppingCart, color: 'text-purple-600' },
  { code: 'CE7', name: '카페', icon: Coffee, color: 'text-orange-600' },
  { code: 'SW8', name: '지하철역', icon: Bus, color: 'text-indigo-600' }
];

interface KakaoMapProps {
  // 메인 시설 정보
  facility: {
    id: number;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
  };
  
  // 지도 설정
  width?: string;
  height?: string;
  level?: number; // 확대 레벨 (1-14)
  showNearbyPlaces?: boolean;
  showTrafficInfo?: boolean;
  showControls?: boolean;
  
  // 이벤트 핸들러
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
}

export const KakaoMap: React.FC<KakaoMapProps> = ({
  facility,
  width = '100%',
  height = '400px',
  level = 3,
  showNearbyPlaces = true,
  showTrafficInfo = false,
  showControls = true,
  onLocationChange,
  className = ''
}) => {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<MapPlace[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // 카카오 지도 SDK 로드
  useEffect(() => {
    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve(window.kakao);
          return;
        }

        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
        script.async = true;
        
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve(window.kakao);
          });
        };
        
        script.onerror = () => {
          reject(new Error('카카오 지도 스크립트 로드 실패'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!process.env.REACT_APP_KAKAO_MAP_API_KEY) {
          throw new Error('카카오 지도 API 키가 설정되지 않았습니다.');
        }

        await loadKakaoMapScript();
        
        // 주소로 좌표 검색 또는 기존 좌표 사용
        let lat = facility.latitude;
        let lng = facility.longitude;
        
        if (!lat || !lng) {
          const coords = await geocodeAddress(facility.address);
          lat = coords.lat;
          lng = coords.lng;
        }
        
        setCoordinates({ lat, lng });
        
        // 지도 생성
        createMap(lat, lng);
        
        // 주변 편의시설 검색
        if (showNearbyPlaces) {
          searchNearbyPlaces(lat, lng);
        }
        
      } catch (error: any) {
        console.error('지도 초기화 실패:', error);
        setError(error.message || '지도를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [facility, level, showNearbyPlaces]);

  // 주소로 좌표 검색
  const geocodeAddress = (address: string): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = {
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x)
          };
          resolve(coords);
        } else {
          reject(new Error('주소를 찾을 수 없습니다.'));
        }
      });
    });
  };

  // 지도 생성
  const createMap = (lat: number, lng: number) => {
    if (!mapContainer.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: level
    };

    const map = new window.kakao.maps.Map(mapContainer.current, options);
    mapInstance.current = map;

    // 지도 컨트롤 추가
    if (showControls) {
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    }

    // 교통정보 표시
    if (showTrafficInfo) {
      map.addOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);
    }

    // 메인 시설 마커 추가
    addMainFacilityMarker(map, lat, lng);

    // 지도 이동 이벤트
    if (onLocationChange) {
      window.kakao.maps.event.addListener(map, 'center_changed', () => {
        const center = map.getCenter();
        onLocationChange(center.getLat(), center.getLng());
      });
    }
  };

  // 메인 시설 마커 추가
  const addMainFacilityMarker = (map: any, lat: number, lng: number) => {
    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    
    // 커스텀 마커 이미지
    const imageSrc = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 16 16 24 16 24s16-8 16-24C32 7.2 24.8 0 16 0z" fill="#FF6B6B"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#FF6B6B"/>
      </svg>
    `);
    
    const imageSize = new window.kakao.maps.Size(32, 40);
    const imageOption = { offset: new window.kakao.maps.Point(16, 40) };
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
    
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      image: markerImage
    });
    
    marker.setMap(map);
    markersRef.current.push(marker);

    // 정보 윈도우
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `
        <div style="padding: 12px; font-size: 14px; max-width: 250px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${facility.name}</div>
          <div style="color: #666; margin-bottom: 4px;">${facility.address}</div>
          ${facility.phone ? `<div style="color: #007bff;">${facility.phone}</div>` : ''}
        </div>
      `
    });

    // 마커 클릭 시 정보 윈도우 표시
    window.kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.open(map, marker);
    });
  };

  // 주변 편의시설 검색
  const searchNearbyPlaces = async (lat: number, lng: number) => {
    if (!window.kakao.maps.services) return;

    const places = new window.kakao.maps.services.Places();
    const searchOptions = {
      location: new window.kakao.maps.LatLng(lat, lng),
      radius: 1000, // 1km 반경
      sort: window.kakao.maps.services.SortBy.DISTANCE
    };

    try {
      const allNearbyPlaces: MapPlace[] = [];
      
      for (const category of NEARBY_CATEGORIES) {
        const categoryPlaces = await searchPlacesByCategory(places, category.code, searchOptions);
        allNearbyPlaces.push(...categoryPlaces.slice(0, 3)); // 카테고리별 최대 3개
      }
      
      setNearbyPlaces(allNearbyPlaces);
    } catch (error) {
      console.error('주변 편의시설 검색 실패:', error);
    }
  };

  // 카테고리별 장소 검색
  const searchPlacesByCategory = (places: any, categoryCode: string, options: any): Promise<MapPlace[]> => {
    return new Promise((resolve, reject) => {
      places.categorySearch(categoryCode, (data: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const placesData = data.map(place => ({
            id: place.id,
            name: place.place_name,
            address: place.address_name,
            latitude: parseFloat(place.y),
            longitude: parseFloat(place.x),
            phone: place.phone,
            category: categoryCode,
            distance: parseInt(place.distance)
          }));
          resolve(placesData);
        } else {
          resolve([]);
        }
      }, options);
    });
  };

  // 카테고리별 장소 표시
  const showCategoryPlaces = (categoryCode: string) => {
    if (!mapInstance.current) return;

    // 기존 마커 제거 (메인 시설 제외)
    markersRef.current.slice(1).forEach(marker => marker.setMap(null));
    markersRef.current = markersRef.current.slice(0, 1);

    if (activeCategory === categoryCode) {
      setActiveCategory(null);
      return;
    }

    setActiveCategory(categoryCode);
    
    const categoryPlaces = nearbyPlaces.filter(place => place.category === categoryCode);
    const category = NEARBY_CATEGORIES.find(c => c.code === categoryCode);
    
    if (!category) return;

    categoryPlaces.forEach(place => {
      const markerPosition = new window.kakao.maps.LatLng(place.latitude, place.longitude);
      
      // 카테고리별 마커 색상
      const markerColor = category.color.includes('red') ? '#EF4444' :
                         category.color.includes('green') ? '#10B981' :
                         category.color.includes('blue') ? '#3B82F6' :
                         category.color.includes('purple') ? '#8B5CF6' :
                         category.color.includes('orange') ? '#F59E0B' :
                         '#6366F1';
      
      const imageSrc = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="30" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 12 12 18 12 18s12-6 12-18C24 5.4 18.6 0 12 0z" fill="${markerColor}"/>
          <circle cx="12" cy="12" r="6" fill="white"/>
        </svg>
      `);
      
      const imageSize = new window.kakao.maps.Size(24, 30);
      const imageOption = { offset: new window.kakao.maps.Point(12, 30) };
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage
      });
      
      marker.setMap(mapInstance.current);
      markersRef.current.push(marker);

      // 정보 윈도우
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-size: 12px; max-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 2px;">${place.name}</div>
            <div style="color: #666; margin-bottom: 2px;">${place.address}</div>
            <div style="color: #007bff; font-size: 11px;">
              ${place.distance ? `거리: ${place.distance}m` : ''}
              ${place.phone ? ` | ${place.phone}` : ''}
            </div>
          </div>
        `
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(mapInstance.current, marker);
      });
    });
  };

  // 길찾기 함수
  const openDirections = () => {
    if (!coordinates) return;
    
    const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(facility.name)},${coordinates.lat},${coordinates.lng}`;
    window.open(kakaoMapUrl, '_blank');
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* 지도 컨테이너 */}
      <div
        ref={mapContainer}
        style={{ width, height }}
        className="rounded-lg overflow-hidden shadow-lg"
      />

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg"
          style={{ width, height }}
        >
          <LoadingSpinner size="lg" text="지도를 불러오는 중..." />
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg"
          style={{ width, height }}
        >
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      )}

      {/* 지도 컨트롤 */}
      {!isLoading && !error && (
        <>
          {/* 길찾기 버튼 */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={openDirections}
              className="bg-white shadow-lg hover:shadow-xl flex items-center space-x-2"
              variant="outline"
            >
              <Navigation className="h-4 w-4" />
              <span>길찾기</span>
            </Button>
          </div>

          {/* 주변 편의시설 버튼 */}
          {showNearbyPlaces && nearbyPlaces.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <Card className="p-3 bg-white/95 backdrop-blur-sm">
                <p className="text-sm font-medium text-gray-700 mb-3">주변 편의시설</p>
                <div className="flex flex-wrap gap-2">
                  {NEARBY_CATEGORIES.map(category => {
                    const categoryCount = nearbyPlaces.filter(p => p.category === category.code).length;
                    if (categoryCount === 0) return null;
                    
                    const IconComponent = category.icon;
                    
                    return (
                      <Button
                        key={category.code}
                        variant={activeCategory === category.code ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => showCategoryPlaces(category.code)}
                        className="flex items-center space-x-1"
                      >
                        <IconComponent className={`h-3 w-3 ${category.color}`} />
                        <span className="text-xs">
                          {category.name} ({categoryCount})
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};