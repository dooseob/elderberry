import type { FacilityProfileResponse } from '../types/facility';

// 공공데이터 API 설정
const PUBLIC_API_CONFIG = {
  // 건강보험심사평가원 API (요양기관 정보)
  HIRA_API_BASE: 'https://openapi.hira.or.kr/openapi/service',
  HIRA_API_KEY: import.meta.env?.VITE_HIRA_API_KEY || '',
  
  // 국민건강보험공단 API (검진기관 정보)
  NHIS_API_BASE: 'http://openapi1.nhis.or.kr/openapi/service/rest',
  NHIS_API_KEY: import.meta.env?.VITE_NHIS_API_KEY || '',
  
  // 공공데이터포털 통합 API 키 (data.go.kr)
  DATA_GO_KR_API_KEY: import.meta.env?.VITE_DATA_GO_KR_API_KEY || '',
  
  // API 인증 방식 설정
  AUTH_TYPE: import.meta.env?.VITE_API_AUTH_TYPE || 'query', // 'query' 또는 'header'
};

// API 인증 방식 타입 정의
type AuthType = 'query' | 'header';

// API 인증 설정 인터페이스
interface ApiAuthConfig {
  authType: AuthType;
  apiKey: string;
  headerName?: string; // Authorization 헤더 사용 시
  queryParam?: string; // serviceKey 쿼리 파라미터 사용 시
}

// 공공데이터 API 응답 타입
interface HIRAFacilityResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: HIRAFacilityItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

interface HIRAFacilityItem {
  ykiho: string;        // 요양기관기호
  yadmNm: string;       // 요양기관명
  addr: string;         // 주소
  telno: string;        // 전화번호
  hospUrl: string;      // 홈페이지
  postNo: string;       // 우편번호
  XPos: string;         // X좌표
  YPos: string;         // Y좌표
  sgguCdNm: string;     // 시군구명
  sidoCdNm: string;     // 시도명
  estbDd: string;       // 개설일자
  clCdNm: string;       // 종별코드명
  drTotCnt: string;     // 의사총수
  [key: string]: string;
}

// 좌표 변환 유틸리티 (EPSG:5179 -> WGS84)
const convertCoordinates = (x: string, y: string): { lat: number; lng: number } => {
  // 실제 좌표계 변환은 proj4 라이브러리를 사용해야 하지만
  // 여기서는 근사치로 변환 (실제 구현 시 정확한 변환 필요)
  const numX = parseFloat(x);
  const numY = parseFloat(y);
  
  if (isNaN(numX) || isNaN(numY) || numX === 0 || numY === 0) {
    return { lat: 37.5665, lng: 126.9780 }; // 서울 기본 좌표
  }
  
  // 간단한 근사 변환 공식 (실제로는 proj4 사용 권장)
  const lat = numY / 100000 + 33.0;
  const lng = numX / 100000 + 124.0;
  
  return { lat, lng };
};

// 통합 API 호출 함수 (인증 방식 자동 선택)
const callPublicApi = async (
  baseUrl: string,
  endpoint: string,
  params: Record<string, string>,
  authConfig: ApiAuthConfig
): Promise<Response> => {
  const { authType, apiKey, headerName = 'Authorization', queryParam = 'serviceKey' } = authConfig;
  
  // URL 파라미터 설정
  const urlParams = new URLSearchParams(params);
  
  // 인증 방식에 따른 설정
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (authType === 'header') {
    // Authorization 헤더 방식
    headers[headerName] = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
  } else {
    // serviceKey 쿼리 파라미터 방식 (기본값)
    urlParams.set(queryParam, apiKey);
  }
  
  const url = `${baseUrl}${endpoint}?${urlParams.toString()}`;
  
  console.log(`API 호출: ${authType} 방식, URL: ${url.replace(apiKey, '[API_KEY]')}`);
  
  return fetch(url, {
    method: 'GET',
    headers
  });
};

// HIRA API에서 요양기관 정보 조회
const fetchHIRAFacilities = async (
  region: string = '',
  facilityType: string = '',
  pageNo: number = 1,
  numOfRows: number = 100
): Promise<FacilityProfileResponse[]> => {
  const params = {
    numOfRows: numOfRows.toString(),
    pageNo: pageNo.toString(),
    _type: 'json'
  };

  if (region) {
    params['sidoCdNm'] = region;
  }

  const authConfig: ApiAuthConfig = {
    authType: PUBLIC_API_CONFIG.AUTH_TYPE as AuthType,
    apiKey: PUBLIC_API_CONFIG.HIRA_API_KEY || PUBLIC_API_CONFIG.DATA_GO_KR_API_KEY,
    headerName: 'Authorization',
    queryParam: 'serviceKey'
  };

  try {
    const response = await callPublicApi(
      PUBLIC_API_CONFIG.HIRA_API_BASE,
      '/getLtcInsuranceInfo',
      params,
      authConfig
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HIRA API 응답 오류:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HIRA API Error: ${response.status} - ${response.statusText}`);
    }

    const data: HIRAFacilityResponse = await response.json();
    
    if (data.response.header.resultCode !== '00') {
      console.error('HIRA API 비즈니스 로직 오류:', data.response.header);
      throw new Error(`HIRA API Error: ${data.response.header.resultMsg}`);
    }

    const items = data.response.body.items?.item || [];
    console.log(`HIRA API 성공: ${items.length}개 시설 조회됨`);
    
    return items.map((item, index): FacilityProfileResponse => {
      const coordinates = convertCoordinates(item.XPos, item.YPos);
      
      return {
        id: parseInt(item.ykiho) || (9000 + index), // 고유 ID 생성
        facilityName: item.yadmNm || '정보 없음',
        facilityType: item.clCdNm || '요양기관',
        facilityGrade: '정보없음', // HIRA API에서는 등급 정보 제공 안함
        region: item.sidoCdNm || '정보 없음',
        district: item.sgguCdNm || '정보 없음',
        address: item.addr || '주소 정보 없음',
        postalCode: item.postNo,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        contactNumber: item.telno,
        website: item.hospUrl,
        establishedDate: item.estbDd,
        capacity: 0, // HIRA API에서 제공하지 않는 정보
        currentOccupancy: 0,
        availableSlots: 0,
        basicMonthlyFee: 0,
        serviceFeatures: [],
        introductionText: `${item.sidoCdNm} ${item.sgguCdNm}에 위치한 ${item.clCdNm}입니다.`,
        rating: 0,
        reviewCount: 0
      };
    });
  } catch (error) {
    console.error('HIRA API 호출 실패:', error);
    throw new Error(`공공데이터 API 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

// NHIS API에서 검진기관 정보 조회
const fetchNHISFacilities = async (
  region: string = '',
  pageNo: number = 1,
  numOfRows: number = 100
): Promise<FacilityProfileResponse[]> => {
  const params = {
    numOfRows: numOfRows.toString(),
    pageNo: pageNo.toString(),
    _type: 'json'
  };

  if (region) {
    params['sidoNm'] = region;
  }

  const authConfig: ApiAuthConfig = {
    authType: PUBLIC_API_CONFIG.AUTH_TYPE as AuthType,
    apiKey: PUBLIC_API_CONFIG.NHIS_API_KEY || PUBLIC_API_CONFIG.DATA_GO_KR_API_KEY,
    headerName: 'Authorization',
    queryParam: 'serviceKey'
  };

  try {
    const response = await callPublicApi(
      PUBLIC_API_CONFIG.NHIS_API_BASE,
      '/HmcSpecificInfoService/getHchkItemResveInfoDetail',
      params,
      authConfig
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NHIS API 응답 오류:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`NHIS API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`NHIS API 응답:`, data);
    
    // NHIS API 응답 구조에 맞게 파싱 (실제 응답 구조 확인 필요)
    const items = data.response?.body?.items?.item || [];
    console.log(`NHIS API 성공: ${items.length}개 검진기관 조회됨`);
    
    return items.map((item: any, index: number): FacilityProfileResponse => ({
      id: index + 10000, // NHIS 전용 ID 범위
      facilityName: item.hmcNm || '검진기관명 없음',
      facilityType: '건강검진기관',
      facilityGrade: '정보없음',
      region: item.sidoNm || '정보 없음',
      district: item.sgguNm || '정보 없음',
      address: item.hmcAddr || '주소 정보 없음',
      postalCode: item.postNo || '',
      latitude: parseFloat(item.lat) || 37.5665,
      longitude: parseFloat(item.lng) || 126.9780,
      contactNumber: item.hmcTelno || '',
      website: '',
      establishedDate: '',
      capacity: 0,
      currentOccupancy: 0,
      availableSlots: 0,
      basicMonthlyFee: 0,
      serviceFeatures: [],
      introductionText: `${item.sidoNm} ${item.sgguNm}에 위치한 건강검진기관입니다.`,
      rating: 0,
      reviewCount: 0
    }));
  } catch (error) {
    console.error('NHIS API 호출 실패:', error);
    throw new Error(`NHIS API 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

// 지역별 요양시설 검색 (공공데이터 + Mock 데이터 통합)
export const searchPublicFacilities = async (
  region: string,
  facilityType?: string,
  limit: number = 50
): Promise<FacilityProfileResponse[]> => {
  // 환경변수에서 공공데이터 사용 여부 확인
  const usePublicData = import.meta.env?.VITE_USE_PUBLIC_API === 'true';
  
  const hasApiKey = PUBLIC_API_CONFIG.HIRA_API_KEY || 
                   PUBLIC_API_CONFIG.NHIS_API_KEY || 
                   PUBLIC_API_CONFIG.DATA_GO_KR_API_KEY;
  
  if (!usePublicData || !hasApiKey) {
    console.warn('공공데이터 API 키가 없거나 비활성화됨. Mock 데이터를 사용합니다.');
    return [];
  }

  try {
    const facilities: FacilityProfileResponse[] = [];
    
    // HIRA API에서 요양기관 데이터 가져오기
    if (PUBLIC_API_CONFIG.HIRA_API_KEY || PUBLIC_API_CONFIG.DATA_GO_KR_API_KEY) {
      try {
        const hiraFacilities = await fetchHIRAFacilities(region, facilityType, 1, Math.floor(limit / 2));
        facilities.push(...hiraFacilities);
        console.log(`HIRA API: ${hiraFacilities.length}개 시설 조회`);
      } catch (error) {
        console.warn('HIRA API 호출 실패, 계속 진행:', error);
      }
    }
    
    // NHIS API에서 검진기관 데이터 가져오기
    if (PUBLIC_API_CONFIG.NHIS_API_KEY || PUBLIC_API_CONFIG.DATA_GO_KR_API_KEY) {
      try {
        const nhisFacilities = await fetchNHISFacilities(region, 1, Math.floor(limit / 2));
        facilities.push(...nhisFacilities);
        console.log(`NHIS API: ${nhisFacilities.length}개 검진기관 조회`);
      } catch (error) {
        console.warn('NHIS API 호출 실패, 계속 진행:', error);
      }
    }
    
    return facilities.slice(0, limit);
  } catch (error) {
    console.error('공공데이터 조회 실패:', error);
    return [];
  }
};

// 키워드로 요양시설 검색
export const searchFacilitiesByKeyword = async (
  keyword: string,
  region?: string,
  limit: number = 30
): Promise<FacilityProfileResponse[]> => {
  try {
    // 여러 공공데이터 소스에서 검색
    const facilities: FacilityProfileResponse[] = [];
    
    // HIRA API 검색
    if (region) {
      const hiraFacilities = await fetchHIRAFacilities(region, '', 1, limit);
      facilities.push(...hiraFacilities);
    }
    
    // 키워드 필터링
    if (keyword.trim()) {
      const filtered = facilities.filter(facility =>
        facility.facilityName.toLowerCase().includes(keyword.toLowerCase()) ||
        facility.address.toLowerCase().includes(keyword.toLowerCase()) ||
        facility.region.toLowerCase().includes(keyword.toLowerCase()) ||
        facility.district.toLowerCase().includes(keyword.toLowerCase())
      );
      return filtered.slice(0, limit);
    }
    
    return facilities.slice(0, limit);
  } catch (error) {
    console.error('키워드 검색 실패:', error);
    return [];
  }
};

// 좌표 기반 주변 시설 검색
export const searchNearbyFacilities = async (
  latitude: number,
  longitude: number,
  radius: number = 10, // km
  limit: number = 20
): Promise<FacilityProfileResponse[]> => {
  try {
    // 위치 기반으로 적절한 지역 추정
    let estimatedRegion = '서울시';
    if (latitude >= 35.0 && latitude <= 35.5) {
      estimatedRegion = '부산시';
    } else if (latitude >= 36.0 && latitude <= 37.0) {
      estimatedRegion = '경기도';
    }
    
    const facilities = await fetchHIRAFacilities(estimatedRegion, '', 1, limit * 2);
    
    // 거리 계산 및 필터링
    const nearbyFacilities = facilities.filter(facility => {
      if (!facility.latitude || !facility.longitude) return false;
      
      const distance = calculateDistance(
        latitude, longitude,
        facility.latitude, facility.longitude
      );
      
      return distance <= radius;
    });
    
    // 거리순 정렬
    nearbyFacilities.sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude!, a.longitude!);
      const distB = calculateDistance(latitude, longitude, b.latitude!, b.longitude!);
      return distA - distB;
    });
    
    return nearbyFacilities.slice(0, limit);
  } catch (error) {
    console.error('주변 시설 검색 실패:', error);
    return [];
  }
};

// 두 좌표 간 거리 계산 (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// API 디버깅 및 테스트 유틸리티
export const testApiAuthentication = async (apiType: 'hira' | 'nhis', authType: AuthType = 'query'): Promise<{
  success: boolean;
  error?: string;
  response?: any;
  authMethod?: string;
}> => {
  try {
    const originalAuthType = PUBLIC_API_CONFIG.AUTH_TYPE;
    // 임시로 인증 방식 변경
    (PUBLIC_API_CONFIG as any).AUTH_TYPE = authType;
    
    let testResult;
    if (apiType === 'hira') {
      testResult = await fetchHIRAFacilities('서울시', '', 1, 1);
    } else {
      testResult = await fetchNHISFacilities('서울시', 1, 1);
    }
    
    // 원래 인증 방식 복원
    (PUBLIC_API_CONFIG as any).AUTH_TYPE = originalAuthType;
    
    return {
      success: true,
      response: testResult,
      authMethod: `${authType} 방식으로 성공`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      authMethod: `${authType} 방식으로 실패`
    };
  }
};

// API 상태 확인 (개선된 버전)
export const checkPublicApiStatus = async (): Promise<{
  hira: { available: boolean; authMethod?: string; error?: string };
  nhis: { available: boolean; authMethod?: string; error?: string };
  config: {
    authType: string;
    hasHiraKey: boolean;
    hasNhisKey: boolean;
    hasDataGoKrKey: boolean;
  };
}> => {
  const config = {
    authType: PUBLIC_API_CONFIG.AUTH_TYPE,
    hasHiraKey: !!PUBLIC_API_CONFIG.HIRA_API_KEY,
    hasNhisKey: !!PUBLIC_API_CONFIG.NHIS_API_KEY,
    hasDataGoKrKey: !!PUBLIC_API_CONFIG.DATA_GO_KR_API_KEY
  };

  const status = {
    hira: { available: false } as any,
    nhis: { available: false } as any,
    config
  };

  // HIRA API 상태 확인 (query 방식 우선 시도)
  if (config.hasHiraKey || config.hasDataGoKrKey) {
    try {
      const testResult = await testApiAuthentication('hira', 'query');
      if (testResult.success) {
        status.hira = { available: true, authMethod: 'serviceKey (query)' };
      } else {
        // header 방식도 시도
        const headerTest = await testApiAuthentication('hira', 'header');
        if (headerTest.success) {
          status.hira = { available: true, authMethod: 'Authorization (header)' };
        } else {
          status.hira = { available: false, error: testResult.error };
        }
      }
    } catch (error) {
      status.hira = { available: false, error: error instanceof Error ? error.message : '연결 실패' };
    }
  }

  // NHIS API 상태 확인
  if (config.hasNhisKey || config.hasDataGoKrKey) {
    try {
      const testResult = await testApiAuthentication('nhis', 'query');
      if (testResult.success) {
        status.nhis = { available: true, authMethod: 'serviceKey (query)' };
      } else {
        // header 방식도 시도
        const headerTest = await testApiAuthentication('nhis', 'header');
        if (headerTest.success) {
          status.nhis = { available: true, authMethod: 'Authorization (header)' };
        } else {
          status.nhis = { available: false, error: testResult.error };
        }
      }
    } catch (error) {
      status.nhis = { available: false, error: error instanceof Error ? error.message : '연결 실패' };
    }
  }
  
  return status;
};

// 공공데이터 API 서비스 클래스
export class PublicDataApiService {
  static async searchFacilities(params: {
    keyword?: string;
    region?: string;
    facilityType?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    limit?: number;
  }): Promise<FacilityProfileResponse[]> {
    const { keyword, region, facilityType, latitude, longitude, radius = 10, limit = 20 } = params;

    // 위치 기반 검색
    if (latitude && longitude) {
      return searchNearbyFacilities(latitude, longitude, radius, limit);
    }

    // 키워드 검색
    if (keyword) {
      return searchFacilitiesByKeyword(keyword, region, limit);
    }

    // 지역별 검색
    if (region) {
      return searchPublicFacilities(region, facilityType, limit);
    }

    return [];
  }

  static async getApiStatus() {
    return checkPublicApiStatus();
  }
}