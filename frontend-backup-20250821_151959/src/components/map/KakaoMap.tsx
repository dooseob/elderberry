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
    facilityDetailClick?: (facilityId: number) => void;
    infoWindows?: any[];
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
  // 시설 정보 (단일 또는 다중)
  facilities: Array<{
    id: number;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    facilityType?: string;
    grade?: string;
    availableBeds?: number;
    rating?: number;
    isRecommended?: boolean;
  }>;
  
  // 지도 설정
  width?: string;
  height?: string;
  level?: number; // 확대 레벨 (1-14)
  showNearbyPlaces?: boolean;
  showTrafficInfo?: boolean;
  showControls?: boolean;
  enableClustering?: boolean;
  
  // 이벤트 핸들러
  onLocationChange?: (lat: number, lng: number) => void;
  onFacilityClick?: (facility: any) => void;
  onMapBoundsChange?: (bounds: { ne: { lat: number; lng: number }, sw: { lat: number; lng: number } }) => void;
  className?: string;
}

export const KakaoMap: React.FC<KakaoMapProps> = ({
  facilities,
  width = '100%',
  height = '400px',
  level = 3,
  showNearbyPlaces = false,
  showTrafficInfo = false,
  showControls = true,
  enableClustering = true,
  onLocationChange,
  onFacilityClick,
  onMapBoundsChange,
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
  const [facilityClusters, setFacilityClusters] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

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
        
        // 시설들의 중심점 계산
        const centerCoords = await calculateMapCenter(facilities);
        setCoordinates(centerCoords);
        
        // 지도 생성
        createMap(centerCoords.lat, centerCoords.lng);
        
        // 시설 마커들 추가
        await addFacilityMarkers();
        
        // 주변 편의시설 검색 (첫 번째 시설 기준)
        if (showNearbyPlaces && facilities.length > 0) {
          const firstFacility = await ensureFacilityCoordinates(facilities[0]);
          searchNearbyPlaces(firstFacility.latitude!, firstFacility.longitude!);
        }
        
      } catch (error: any) {
        console.error('지도 초기화 실패:', error);
        setError(error.message || '지도를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [facilities, level, showNearbyPlaces]);

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

    // 지도 범위 변경 이벤트 리스너
    if (onMapBoundsChange) {
      window.kakao.maps.event.addListener(map, 'bounds_changed', () => {
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onMapBoundsChange({
          ne: { lat: ne.getLat(), lng: ne.getLng() },
          sw: { lat: sw.getLat(), lng: sw.getLng() }
        });
      });
    }

    // 지도 이동 이벤트
    if (onLocationChange) {
      window.kakao.maps.event.addListener(map, 'center_changed', () => {
        const center = map.getCenter();
        onLocationChange(center.getLat(), center.getLng());
      });
    }
  };

  // 시설들의 중심점 계산
  const calculateMapCenter = async (facilities: any[]): Promise<{lat: number, lng: number}> => {
    if (facilities.length === 0) {
      return { lat: 37.5665, lng: 126.9780 }; // 기본값: 서울 시청
    }
    
    if (facilities.length === 1) {
      const facility = await ensureFacilityCoordinates(facilities[0]);
      return { lat: facility.latitude!, lng: facility.longitude! };
    }
    
    // 모든 시설의 좌표를 확보
    const facilitiesWithCoords = await Promise.all(
      facilities.map(facility => ensureFacilityCoordinates(facility))
    );
    
    // 중심점 계산
    const totalLat = facilitiesWithCoords.reduce((sum, f) => sum + f.latitude!, 0);
    const totalLng = facilitiesWithCoords.reduce((sum, f) => sum + f.longitude!, 0);
    
    return {
      lat: totalLat / facilitiesWithCoords.length,
      lng: totalLng / facilitiesWithCoords.length
    };
  };
  
  // 시설 좌표 확보 (주소 → 좌표 변환 포함)
  const ensureFacilityCoordinates = async (facility: any): Promise<any> => {
    if (facility.latitude && facility.longitude) {
      return facility;
    }
    
    try {
      const coords = await geocodeAddress(facility.address);
      return { ...facility, latitude: coords.lat, longitude: coords.lng };
    } catch (error) {
      console.warn(`시설 "${facility.name}" 좌표 변환 실패:`, error);
      return { ...facility, latitude: 37.5665, longitude: 126.9780 }; // 기본값
    }
  };

  // 모든 시설 마커 추가
  const addFacilityMarkers = async () => {
    if (!mapInstance.current || facilities.length === 0) return;
    
    const facilitiesWithCoords = await Promise.all(
      facilities.map(facility => ensureFacilityCoordinates(facility))
    );
    
    facilitiesWithCoords.forEach((facility, index) => {
      addFacilityMarker(mapInstance.current, facility, index);
    });
    
    // 지도 범위를 모든 마커가 보이도록 조정
    if (facilitiesWithCoords.length > 1) {
      const bounds = new window.kakao.maps.LatLngBounds();
      facilitiesWithCoords.forEach(facility => {
        bounds.extend(new window.kakao.maps.LatLng(facility.latitude, facility.longitude));
      });
      mapInstance.current.setBounds(bounds);
    }
  };

  // 개별 시설 마커 추가
  const addFacilityMarker = (map: any, facility: any, index: number) => {
    const markerPosition = new window.kakao.maps.LatLng(facility.latitude, facility.longitude);
    
    // 시설 유형/등급에 따른 마커 색상 결정
    const markerColor = getMarkerColor(facility);
    const markerSize = facility.isRecommended ? { width: 36, height: 45 } : { width: 28, height: 35 };
    
    // 커스텀 마커 이미지
    const imageSrc = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${markerSize.width}" height="${markerSize.height}" viewBox="0 0 ${markerSize.width} ${markerSize.height}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${markerSize.width/2} 0C${markerSize.width*0.225} 0 0 ${markerSize.width*0.225} 0 ${markerSize.width*0.5}c0 ${markerSize.width*0.5} ${markerSize.width/2} ${markerSize.height*0.6} ${markerSize.width/2} ${markerSize.height*0.6}s${markerSize.width/2}-${markerSize.height*0.1} ${markerSize.width/2}-${markerSize.height*0.6}C${markerSize.width} ${markerSize.width*0.225} ${markerSize.width*0.775} 0 ${markerSize.width/2} 0z" fill="${markerColor}"/>
        <circle cx="${markerSize.width/2}" cy="${markerSize.width*0.5}" r="${markerSize.width*0.25}" fill="white"/>
        ${facility.isRecommended ? `<path d="M${markerSize.width/2} ${markerSize.width*0.3}l${markerSize.width*0.06} ${markerSize.width*0.12}h${markerSize.width*0.13}l-${markerSize.width*0.105} ${markerSize.width*0.075}l${markerSize.width*0.04} ${markerSize.width*0.12}l-${markerSize.width*0.105}-${markerSize.width*0.075}l-${markerSize.width*0.105} ${markerSize.width*0.075}l${markerSize.width*0.04}-${markerSize.width*0.12}l-${markerSize.width*0.105}-${markerSize.width*0.075}h${markerSize.width*0.13}z" fill="${markerColor}"/>` : ''}
      </svg>
    `);
    
    const imageSize = new window.kakao.maps.Size(markerSize.width, markerSize.height);
    const imageOption = { offset: new window.kakao.maps.Point(markerSize.width/2, markerSize.height) };
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
    
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      image: markerImage
    });
    
    marker.setMap(map);
    markersRef.current.push(marker);

    // 정보 윈도우
    const infoContent = createFacilityInfoWindow(facility);
    const infowindow = new window.kakao.maps.InfoWindow({
      content: infoContent
    });

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      // 기존 정보창 모두 닫기
      markersRef.current.forEach((_, idx) => {
        if (window.infoWindows && window.infoWindows[idx]) {
          window.infoWindows[idx].close();
        }
      });
      
      // 새 정보창 열기
      infowindow.open(map, marker);
      setSelectedFacility(facility);
      
      // 콜백 호출
      if (onFacilityClick) {
        onFacilityClick(facility);
      }
    });
    
    // 정보창 참조 저장
    if (!window.infoWindows) window.infoWindows = [];
    window.infoWindows[index] = infowindow;
  };
  
  // 시설 마커 색상 결정
  const getMarkerColor = (facility: any): string => {
    if (facility.isRecommended) return '#FF6B6B'; // 추천 시설: 빨간색
    if (!facility.availableBeds || facility.availableBeds === 0) return '#9CA3AF'; // 대기자: 회색
    
    switch (facility.grade) {
      case 'A': case 'A등급': return '#10B981'; // A등급: 초록색
      case 'B': case 'B등급': return '#3B82F6'; // B등급: 파란색
      case 'C': case 'C등급': return '#F59E0B'; // C등급: 주황색
      default: return '#6366F1'; // 기본: 보라색
    }
  };
  
  // 시설 정보창 HTML 생성
  const createFacilityInfoWindow = (facility: any): string => {
    return `
      <div style="padding: 15px; font-size: 14px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 16px; color: #1f2937; flex: 1;">${facility.name}</div>
          ${facility.isRecommended ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 8px;">추천</span>' : ''}
        </div>
        
        <div style="color: #6b7280; margin-bottom: 4px; font-size: 13px;">${facility.address}</div>
        
        <div style="display: flex; gap: 12px; margin: 8px 0; align-items: center;">
          ${facility.grade ? `<span style="background: ${getGradeColor(facility.grade)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${facility.grade}</span>` : ''}
          ${facility.rating ? `<span style="color: #f59e0b;">★ ${facility.rating.toFixed(1)}</span>` : ''}
          ${facility.availableBeds !== undefined ? `<span style="color: ${facility.availableBeds > 0 ? '#10b981' : '#ef4444'}; font-size: 12px;">
            ${facility.availableBeds > 0 ? `입소가능 ${facility.availableBeds}개` : '대기필요'}
          </span>` : ''}
        </div>
        
        ${facility.facilityType ? `<div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">${facility.facilityType}</div>` : ''}
        ${facility.phone ? `<div style="color: #3b82f6; font-size: 12px;">${facility.phone}</div>` : ''}
        
        <div style="text-align: center; margin-top: 10px;">
          <button onclick="window.facilityDetailClick(${facility.id})" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">상세보기</button>
        </div>
      </div>
    `;
  };
  
  // 등급별 색상
  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': case 'A등급': return '#10b981';
      case 'B': case 'B등급': return '#3b82f6';
      case 'C': case 'C등급': return '#f59e0b';
      default: return '#6b7280';
    }
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
  const openDirections = (facility?: any) => {
    const targetFacility = facility || selectedFacility;
    if (!targetFacility) return;
    
    const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(targetFacility.name)},${targetFacility.latitude},${targetFacility.longitude}`;
    window.open(kakaoMapUrl, '_blank');
  };
  
  // 전역 함수로 시설 상세보기 콜백 등록
  useEffect(() => {
    window.facilityDetailClick = (facilityId: number) => {
      const facility = facilities.find(f => f.id === facilityId);
      if (facility && onFacilityClick) {
        onFacilityClick(facility);
      }
    };
    
    return () => {
      delete window.facilityDetailClick;
    };
  }, [facilities, onFacilityClick]);

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
          {/* 컨트롤 버튼들 */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {selectedFacility && (
              <Button
                onClick={() => openDirections(selectedFacility)}
                className="bg-white shadow-lg hover:shadow-xl flex items-center space-x-2"
                variant="outline"
                size="sm"
              >
                <Navigation className="h-4 w-4" />
                <span>길찾기</span>
              </Button>
            )}
            
            {facilities.length > 1 && (
              <Button
                onClick={() => {
                  if (mapInstance.current) {
                    const bounds = new window.kakao.maps.LatLngBounds();
                    facilities.forEach(facility => {
                      if (facility.latitude && facility.longitude) {
                        bounds.extend(new window.kakao.maps.LatLng(facility.latitude, facility.longitude));
                      }
                    });
                    mapInstance.current.setBounds(bounds);
                  }
                }}
                className="bg-white shadow-lg hover:shadow-xl flex items-center space-x-2"
                variant="outline"
                size="sm"
              >
                <MapPin className="h-4 w-4" />
                <span>전체보기</span>
              </Button>
            )}
          </div>

          {/* 하단 정보 패널 */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            {/* 선택된 시설 정보 */}
            {selectedFacility && (
              <Card className="p-4 bg-white/95 backdrop-blur-sm mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedFacility.name}</h3>
                    <p className="text-sm text-gray-600">{selectedFacility.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedFacility.grade && (
                        <Badge className="text-xs" style={{ backgroundColor: getGradeColor(selectedFacility.grade) }}>
                          {selectedFacility.grade}
                        </Badge>
                      )}
                      {selectedFacility.rating && (
                        <span className="text-sm text-yellow-600">★ {selectedFacility.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFacility(null)}
                  >
                    ✕
                  </Button>
                </div>
              </Card>
            )}
            
            {/* 주변 편의시설 버튼 */}
            {showNearbyPlaces && nearbyPlaces.length > 0 && (
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
                        variant={activeCategory === category.code ? 'default' : 'outline'}
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
            )}
            
            {/* 시설 통계 정보 */}
            {facilities.length > 1 && (
              <Card className="p-3 bg-white/95 backdrop-blur-sm mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">총 {facilities.length}개 시설</span>
                  <div className="flex gap-3">
                    <span className="text-green-600">A등급 {facilities.filter(f => f.grade?.includes('A')).length}개</span>
                    <span className="text-blue-600">입소가능 {facilities.filter(f => f.availableBeds && f.availableBeds > 0).length}개</span>
                    <span className="text-red-600">추천 {facilities.filter(f => f.isRecommended).length}개</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};