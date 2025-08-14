import type {
  FacilityProfileResponse,
  FacilitySearchParams,
  PageResponse,
  FacilityRecommendation,
  FacilityFilterOptions
} from '../types/facility';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const USE_MOCK_DATA = import.meta.env.VITE_ENV === 'development' || import.meta.env.VITE_USE_MOCK === 'true';

// HTTP 클라이언트 헬퍼 함수
async function httpGet<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // TODO: 인증 토큰 추가
      // 'Authorization': `Bearer ${getAuthToken()}`
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}

// Mock 데이터
const MOCK_FACILITIES: FacilityProfileResponse[] = [
  {
    id: 1,
    facilityName: "서울 실버케어센터",
    facilityType: "요양원",
    facilityGrade: "우수",
    region: "서울시",
    district: "강남구",
    address: "서울시 강남구 테헤란로 123",
    contactNumber: "02-1234-5678",
    capacity: 50,
    currentOccupancy: 47,
    availableSlots: 3,
    basicMonthlyFee: 250,
    serviceFeatures: ["24시간 간병", "물리치료", "영양관리", "의료진 상주"],
    introductionText: "전문적인 요양 서비스와 따뜻한 돌봄을 제공하는 프리미엄 요양원입니다.",
    rating: 4.8,
    reviewCount: 127,
    email: "info@silvercare.co.kr",
    website: "https://www.silvercare.co.kr",
    establishedDate: "2015-03-01"
  },
  {
    id: 2,
    facilityName: "행복한 노인의집",
    facilityType: "주간보호센터",
    facilityGrade: "양호",
    region: "서울시",
    district: "서초구",
    address: "서울시 서초구 반포대로 456",
    contactNumber: "02-2345-6789",
    capacity: 30,
    currentOccupancy: 23,
    availableSlots: 7,
    basicMonthlyFee: 180,
    serviceFeatures: ["주간보호", "레크리에이션", "송영서비스", "건강관리"],
    introductionText: "어르신들의 활기찬 하루를 위한 다양한 프로그램을 운영합니다.",
    rating: 4.6,
    reviewCount: 89,
    email: "contact@happysenior.com",
    establishedDate: "2018-07-15"
  },
  {
    id: 3,
    facilityName: "평화 요양병원",
    facilityType: "요양병원",
    facilityGrade: "우수",
    region: "서울시",
    district: "송파구",
    address: "서울시 송파구 올림픽로 789",
    contactNumber: "02-3456-7890",
    capacity: 80,
    currentOccupancy: 79,
    availableSlots: 1,
    basicMonthlyFee: 320,
    serviceFeatures: ["전문의료진", "재활치료", "응급의료", "가족상담"],
    introductionText: "의료진과 간병인이 함께하는 전문적인 의료 요양 서비스를 제공합니다.",
    rating: 4.9,
    reviewCount: 203,
    email: "info@peacehospital.co.kr",
    website: "https://www.peacehospital.co.kr",
    establishedDate: "2012-11-20"
  },
  {
    id: 4,
    facilityName: "따뜻한 재가센터",
    facilityType: "재가센터",
    facilityGrade: "보통",
    region: "부산시",
    district: "해운대구",
    address: "부산시 해운대구 마린시티로 321",
    contactNumber: "051-1234-5678",
    capacity: 20,
    currentOccupancy: 15,
    availableSlots: 5,
    basicMonthlyFee: 120,
    serviceFeatures: ["방문요양", "방문목욕", "방문간호", "단기보호"],
    introductionText: "집에서도 전문적인 요양 서비스를 받으실 수 있도록 도와드립니다.",
    rating: 4.4,
    reviewCount: 56,
    email: "warm@homecare.co.kr",
    establishedDate: "2020-05-10"
  },
  {
    id: 5,
    facilityName: "기억의 정원",
    facilityType: "치매전문시설",
    facilityGrade: "우수",
    region: "경기도",
    district: "성남시",
    address: "경기도 성남시 분당구 정자로 654",
    contactNumber: "031-5678-9012",
    capacity: 40,
    currentOccupancy: 38,
    availableSlots: 2,
    basicMonthlyFee: 280,
    serviceFeatures: ["치매전문케어", "인지치료", "작업치료", "음악치료"],
    introductionText: "치매 어르신들을 위한 전문적이고 따뜻한 돌봄 서비스를 제공합니다.",
    rating: 4.7,
    reviewCount: 94,
    email: "garden@dementia.co.kr",
    website: "https://www.memorygarden.co.kr",
    establishedDate: "2017-09-12"
  }
];

const MOCK_RECOMMENDATIONS: FacilityRecommendation[] = [
  {
    facilityId: 1,
    facilityName: "서울 실버케어센터",
    facilityType: "요양원",
    facilityGrade: "우수",
    region: "서울시",
    district: "강남구",
    matchingScore: 92.5,
    recommendationReason: "높은 평점과 우수한 시설 등급으로 추천"
  },
  {
    facilityId: 3,
    facilityName: "평화 요양병원",
    facilityType: "요양병원",
    facilityGrade: "우수",
    region: "서울시",
    district: "송파구",
    matchingScore: 89.3,
    recommendationReason: "전문 의료진과 재활치료 프로그램 완비"
  }
];

// 시설 서비스 클래스
export class FacilityService {
  // 시설 목록 조회 (페이징)
  static async getFacilities(params: FacilitySearchParams = {}): Promise<PageResponse<FacilityProfileResponse>> {
    if (USE_MOCK_DATA) {
      // Mock 데이터 필터링
      let filteredFacilities = [...MOCK_FACILITIES];
      
      if (params.facilityType && params.facilityType !== '전체') {
        filteredFacilities = filteredFacilities.filter(f => f.facilityType === params.facilityType);
      }
      if (params.facilityGrade && params.facilityGrade !== '전체') {
        filteredFacilities = filteredFacilities.filter(f => f.facilityGrade === params.facilityGrade);
      }
      if (params.region && params.region !== '전체') {
        filteredFacilities = filteredFacilities.filter(f => f.region === params.region);
      }
      
      // 페이징
      const page = params.page || 0;
      const size = params.size || 20;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const pagedFacilities = filteredFacilities.slice(startIndex, endIndex);
      
      return {
        content: pagedFacilities,
        totalElements: filteredFacilities.length,
        totalPages: Math.ceil(filteredFacilities.length / size),
        size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(filteredFacilities.length / size) - 1
      };
    }
    
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.facilityType) searchParams.append('facilityType', params.facilityType);
    if (params.facilityGrade) searchParams.append('facilityGrade', params.facilityGrade);
    if (params.region) searchParams.append('region', params.region);
    
    return httpGet<PageResponse<FacilityProfileResponse>>(`/facilities?${searchParams.toString()}`);
  }

  // 시설 상세 조회
  static async getFacilityById(id: number): Promise<FacilityProfileResponse> {
    if (USE_MOCK_DATA) {
      const facility = MOCK_FACILITIES.find(f => f.id === id);
      if (!facility) {
        throw new Error(`시설을 찾을 수 없습니다. ID: ${id}`);
      }
      return facility;
    }
    
    return httpGet<FacilityProfileResponse>(`/facilities/${id}`);
  }

  // 지역별 시설 검색
  static async searchFacilitiesByRegion(
    region: string,
    facilityType?: string,
    careGradeLevel?: number,
    limit: number = 20
  ): Promise<FacilityProfileResponse[]> {
    if (USE_MOCK_DATA) {
      let filteredFacilities = MOCK_FACILITIES.filter(f => f.region === region);
      
      if (facilityType) {
        filteredFacilities = filteredFacilities.filter(f => f.facilityType === facilityType);
      }
      
      return filteredFacilities.slice(0, limit);
    }
    
    const searchParams = new URLSearchParams();
    searchParams.append('region', region);
    if (facilityType) searchParams.append('facilityType', facilityType);
    if (careGradeLevel !== undefined) searchParams.append('careGradeLevel', careGradeLevel.toString());
    searchParams.append('limit', limit.toString());

    return httpGet<FacilityProfileResponse[]>(`/facilities/search/region?${searchParams.toString()}`);
  }

  // 케어 등급별 시설 검색
  static async searchFacilitiesByCareGrade(
    careGradeLevel: number,
    region?: string,
    limit: number = 20
  ): Promise<FacilityProfileResponse[]> {
    if (USE_MOCK_DATA) {
      let filteredFacilities = [...MOCK_FACILITIES];
      
      if (region) {
        filteredFacilities = filteredFacilities.filter(f => f.region === region);
      }
      
      // 케어 등급에 따른 간단한 필터링 (Mock)
      return filteredFacilities.slice(0, limit);
    }
    
    const searchParams = new URLSearchParams();
    searchParams.append('careGradeLevel', careGradeLevel.toString());
    if (region) searchParams.append('region', region);
    searchParams.append('limit', limit.toString());

    return httpGet<FacilityProfileResponse[]>(`/facilities/search/care-grade?${searchParams.toString()}`);
  }

  // 시설 추천 (간단버전)
  static async getRecommendations(
    healthAssessmentId?: number,
    careGrade?: number,
    preferredRegion?: string,
    budgetRange?: number,
    limit: number = 10
  ): Promise<FacilityRecommendation[]> {
    if (USE_MOCK_DATA) {
      let recommendations = [...MOCK_RECOMMENDATIONS];
      
      if (preferredRegion) {
        recommendations = recommendations.filter(r => r.region === preferredRegion);
      }
      
      return recommendations.slice(0, limit);
    }
    
    const searchParams = new URLSearchParams();
    if (healthAssessmentId !== undefined) searchParams.append('healthAssessmentId', healthAssessmentId.toString());
    if (careGrade !== undefined) searchParams.append('careGrade', careGrade.toString());
    if (preferredRegion) searchParams.append('preferredRegion', preferredRegion);
    if (budgetRange !== undefined) searchParams.append('budgetRange', budgetRange.toString());
    searchParams.append('limit', limit.toString());

    return httpGet<FacilityRecommendation[]>(`/facilities/recommendations?${searchParams.toString()}`);
  }

  // 통합 검색 (키워드 검색)
  static async searchFacilities(keyword: string, filters?: FacilitySearchParams): Promise<FacilityProfileResponse[]> {
    if (USE_MOCK_DATA) {
      let filteredFacilities = [...MOCK_FACILITIES];
      
      // 키워드 필터링
      if (keyword.trim()) {
        const lowerKeyword = keyword.toLowerCase();
        filteredFacilities = filteredFacilities.filter(facility => 
          facility.facilityName.toLowerCase().includes(lowerKeyword) ||
          facility.address.toLowerCase().includes(lowerKeyword) ||
          facility.region.toLowerCase().includes(lowerKeyword) ||
          facility.district.toLowerCase().includes(lowerKeyword)
        );
      }
      
      // 추가 필터 적용
      if (filters?.facilityType && filters.facilityType !== '전체') {
        filteredFacilities = filteredFacilities.filter(f => f.facilityType === filters.facilityType);
      }
      if (filters?.region && filters.region !== '전체') {
        filteredFacilities = filteredFacilities.filter(f => f.region === filters.region);
      }
      
      return filteredFacilities;
    }
    
    // 현재는 지역 검색으로 대체
    if (keyword && filters?.region) {
      return this.searchFacilitiesByRegion(filters.region, filters.facilityType);
    }
    
    // 키워드만 있는 경우 전체 목록에서 필터링 (임시)
    const allFacilities = await this.getFacilities(filters);
    return allFacilities.content.filter(facility => 
      facility.facilityName.toLowerCase().includes(keyword.toLowerCase()) ||
      facility.address.toLowerCase().includes(keyword.toLowerCase()) ||
      facility.region.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

// 필터 옵션 제공 (정적 데이터 - 추후 백엔드에서 동적으로 가져올 수 있음)
export const FACILITY_FILTER_OPTIONS: FacilityFilterOptions = {
  facilityTypes: [
    '전체',
    '요양원', 
    '요양병원',
    '주간보호센터',
    '재가센터',
    '치매전문시설'
  ],
  facilityGrades: [
    '전체',
    '우수',
    '양호', 
    '보통'
  ],
  regions: [
    '전체',
    '서울시',
    '부산시',
    '대구시',
    '인천시',
    '광주시',
    '대전시',
    '울산시',
    '세종시',
    '경기도',
    '강원도',
    '충청북도',
    '충청남도',
    '전라북도',
    '전라남도',
    '경상북도',
    '경상남도',
    '제주도'
  ],
  priceRanges: [
    { min: 0, max: 100, label: '100만원 이하' },
    { min: 100, max: 200, label: '100-200만원' },
    { min: 200, max: 300, label: '200-300만원' },
    { min: 300, max: 500, label: '300-500만원' },
    { min: 500, max: 1000, label: '500만원 이상' }
  ]
};