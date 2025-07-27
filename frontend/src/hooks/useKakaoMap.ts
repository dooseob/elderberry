/**
 * 카카오 지도 훅
 * 지도 초기화, 마커 관리, 주소 검색 등 지도 관련 로직 처리
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * 지도 좌표 인터페이스
 */
export interface MapCoordinates {
  lat: number;
  lng: number;
}

/**
 * 지도 마커 정보
 */
export interface MapMarker {
  id: string;
  position: MapCoordinates;
  title: string;
  content?: string;
  category?: string;
  clickable?: boolean;
}

/**
 * 지도 설정 옵션
 */
export interface MapOptions {
  center?: MapCoordinates;
  level?: number;
  width?: string;
  height?: string;
  draggable?: boolean;
  scrollwheel?: boolean;
  disableDoubleClick?: boolean;
}

/**
 * 카카오 지도 훅 반환 타입
 */
interface UseKakaoMapReturn {
  // 지도 상태
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 지도 인스턴스
  mapInstance: any | null;
  
  // 좌표 관련
  currentCenter: MapCoordinates | null;
  
  // 마커 관리
  markers: MapMarker[];
  addMarker: (marker: MapMarker) => void;
  removeMarker: (markerId: string) => void;
  clearMarkers: () => void;
  
  // 주소/좌표 변환
  geocodeAddress: (address: string) => Promise<MapCoordinates>;
  reverseGeocode: (coords: MapCoordinates) => Promise<string>;
  
  // 지도 제어
  panTo: (coords: MapCoordinates) => void;
  setLevel: (level: number) => void;
  fitBounds: (markers: MapMarker[]) => void;
  
  // 이벤트 핸들러
  onCenterChanged: (callback: (coords: MapCoordinates) => void) => void;
  onZoomChanged: (callback: (level: number) => void) => void;
  onMarkerClick: (callback: (marker: MapMarker) => void) => void;
  
  // 유틸리티
  calculateDistance: (from: MapCoordinates, to: MapCoordinates) => number;
  isWithinBounds: (coords: MapCoordinates, bounds: { sw: MapCoordinates; ne: MapCoordinates }) => boolean;
}

/**
 * 카카오 지도 훅
 */
export const useKakaoMap = (
  containerId?: string,
  options: MapOptions = {}
): UseKakaoMapReturn => {
  // 상태
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [currentCenter, setCurrentCenter] = useState<MapCoordinates | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  
  // 마커 인스턴스 저장
  const [markerInstances, setMarkerInstances] = useState<Map<string, any>>(new Map());
  
  // 이벤트 콜백들
  const [centerChangedCallback, setCenterChangedCallback] = useState<((coords: MapCoordinates) => void) | null>(null);
  const [zoomChangedCallback, setZoomChangedCallback] = useState<((level: number) => void) | null>(null);
  const [markerClickCallback, setMarkerClickCallback] = useState<((marker: MapMarker) => void) | null>(null);

  /**
   * 카카오 지도 SDK 로드
   */
  const loadKakaoMapSDK = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      // 이미 로드된 경우
      if (window.kakao && window.kakao.maps) {
        resolve(window.kakao);
        return;
      }

      // API 키 확인
      const apiKey = process.env.REACT_APP_KAKAO_MAP_API_KEY;
      if (!apiKey) {
        reject(new Error('카카오 지도 API 키가 설정되지 않았습니다.'));
        return;
      }

      // 스크립트 로드
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      script.async = true;
      
      script.onload = () => {
        window.kakao.maps.load(() => {
          resolve(window.kakao);
        });
      };
      
      script.onerror = () => {
        reject(new Error('카카오 지도 스크립트 로드에 실패했습니다.'));
      };
      
      document.head.appendChild(script);
    });
  }, []);

  /**
   * 지도 초기화
   */
  const initializeMap = useCallback(async (container: HTMLElement) => {
    try {
      setIsLoading(true);
      setError(null);

      const kakao = await loadKakaoMapSDK();
      
      // 기본 옵션 설정
      const defaultCenter = options.center || { lat: 37.566826, lng: 126.9786567 }; // 서울시청
      const mapOptions = {
        center: new kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
        level: options.level || 3,
        draggable: options.draggable !== false,
        scrollwheel: options.scrollwheel !== false,
        disableDoubleClick: options.disableDoubleClick || false
      };

      // 지도 생성
      const map = new kakao.maps.Map(container, mapOptions);
      setMapInstance(map);
      setCurrentCenter(defaultCenter);
      setIsLoaded(true);

      // 지도 이벤트 등록
      kakao.maps.event.addListener(map, 'center_changed', () => {
        const center = map.getCenter();
        const coords = { lat: center.getLat(), lng: center.getLng() };
        setCurrentCenter(coords);
        if (centerChangedCallback) {
          centerChangedCallback(coords);
        }
      });

      kakao.maps.event.addListener(map, 'zoom_changed', () => {
        const level = map.getLevel();
        if (zoomChangedCallback) {
          zoomChangedCallback(level);
        }
      });

    } catch (err: any) {
      setError(err.message || '지도 초기화에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [loadKakaoMapSDK, options, centerChangedCallback, zoomChangedCallback]);

  /**
   * 마커 추가
   */
  const addMarker = useCallback((marker: MapMarker) => {
    if (!mapInstance || !window.kakao) return;

    try {
      const markerPosition = new window.kakao.maps.LatLng(marker.position.lat, marker.position.lng);
      
      const markerInstance = new window.kakao.maps.Marker({
        position: markerPosition,
        title: marker.title,
        clickable: marker.clickable !== false
      });

      markerInstance.setMap(mapInstance);

      // 마커 클릭 이벤트
      if (marker.clickable !== false) {
        window.kakao.maps.event.addListener(markerInstance, 'click', () => {
          if (markerClickCallback) {
            markerClickCallback(marker);
          }
        });
      }

      // 정보 윈도우 (내용이 있는 경우)
      if (marker.content) {
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding: 8px; font-size: 12px;">${marker.content}</div>`
        });

        window.kakao.maps.event.addListener(markerInstance, 'click', () => {
          infoWindow.open(mapInstance, markerInstance);
        });
      }

      // 상태 업데이트
      setMarkers(prev => [...prev.filter(m => m.id !== marker.id), marker]);
      setMarkerInstances(prev => new Map(prev.set(marker.id, markerInstance)));

    } catch (err) {
      console.error('마커 추가 실패:', err);
    }
  }, [mapInstance, markerClickCallback]);

  /**
   * 마커 제거
   */
  const removeMarker = useCallback((markerId: string) => {
    const markerInstance = markerInstances.get(markerId);
    if (markerInstance) {
      markerInstance.setMap(null);
      setMarkerInstances(prev => {
        const newMap = new Map(prev);
        newMap.delete(markerId);
        return newMap;
      });
    }
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  }, [markerInstances]);

  /**
   * 모든 마커 제거
   */
  const clearMarkers = useCallback(() => {
    markerInstances.forEach(markerInstance => {
      markerInstance.setMap(null);
    });
    setMarkerInstances(new Map());
    setMarkers([]);
  }, [markerInstances]);

  /**
   * 주소를 좌표로 변환
   */
  const geocodeAddress = useCallback(async (address: string): Promise<MapCoordinates> => {
    if (!window.kakao?.maps?.services) {
      throw new Error('카카오 지도 서비스가 로드되지 않았습니다.');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve({
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x)
          });
        } else {
          reject(new Error(`주소를 찾을 수 없습니다: ${address}`));
        }
      });
    });
  }, []);

  /**
   * 좌표를 주소로 변환
   */
  const reverseGeocode = useCallback(async (coords: MapCoordinates): Promise<string> => {
    if (!window.kakao?.maps?.services) {
      throw new Error('카카오 지도 서비스가 로드되지 않았습니다.');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.coord2Address(coords.lng, coords.lat, (result: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0].address?.address_name || result[0].road_address?.address_name;
          resolve(address || '주소를 찾을 수 없습니다.');
        } else {
          reject(new Error('주소 변환에 실패했습니다.'));
        }
      });
    });
  }, []);

  /**
   * 지도 중심 이동
   */
  const panTo = useCallback((coords: MapCoordinates) => {
    if (!mapInstance) return;
    
    const moveLatLon = new window.kakao.maps.LatLng(coords.lat, coords.lng);
    mapInstance.panTo(moveLatLon);
  }, [mapInstance]);

  /**
   * 지도 확대 레벨 설정
   */
  const setLevel = useCallback((level: number) => {
    if (!mapInstance) return;
    
    mapInstance.setLevel(level);
  }, [mapInstance]);

  /**
   * 마커들이 모두 보이도록 지도 범위 설정
   */
  const fitBounds = useCallback((markersToFit: MapMarker[]) => {
    if (!mapInstance || markersToFit.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    
    markersToFit.forEach(marker => {
      bounds.extend(new window.kakao.maps.LatLng(marker.position.lat, marker.position.lng));
    });
    
    mapInstance.setBounds(bounds);
  }, [mapInstance]);

  /**
   * 두 좌표 간 거리 계산 (km)
   */
  const calculateDistance = useCallback((from: MapCoordinates, to: MapCoordinates): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  /**
   * 좌표가 범위 내에 있는지 확인
   */
  const isWithinBounds = useCallback((
    coords: MapCoordinates, 
    bounds: { sw: MapCoordinates; ne: MapCoordinates }
  ): boolean => {
    return (
      coords.lat >= bounds.sw.lat &&
      coords.lat <= bounds.ne.lat &&
      coords.lng >= bounds.sw.lng &&
      coords.lng <= bounds.ne.lng
    );
  }, []);

  /**
   * 이벤트 핸들러 등록
   */
  const onCenterChanged = useCallback((callback: (coords: MapCoordinates) => void) => {
    setCenterChangedCallback(() => callback);
  }, []);

  const onZoomChanged = useCallback((callback: (level: number) => void) => {
    setZoomChangedCallback(() => callback);
  }, []);

  const onMarkerClick = useCallback((callback: (marker: MapMarker) => void) => {
    setMarkerClickCallback(() => callback);
  }, []);

  // 컨테이너가 준비되면 지도 초기화
  useEffect(() => {
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        initializeMap(container);
      }
    }
  }, [containerId, initializeMap]);

  return {
    // 상태
    isLoaded,
    isLoading,
    error,
    mapInstance,
    currentCenter,
    
    // 마커 관리
    markers,
    addMarker,
    removeMarker,
    clearMarkers,
    
    // 주소/좌표 변환
    geocodeAddress,
    reverseGeocode,
    
    // 지도 제어
    panTo,
    setLevel,
    fitBounds,
    
    // 이벤트 핸들러
    onCenterChanged,
    onZoomChanged,
    onMarkerClick,
    
    // 유틸리티
    calculateDistance,
    isWithinBounds
  };
};