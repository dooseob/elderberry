# 🏥 엘더베리 시설찾기 기능 백엔드-프론트엔드 통합 계획

## 📋 개요
현재 백엔드는 완성도 높은 시설 검색 API를 제공하고 있으나, 프론트엔드는 mock 데이터를 사용하고 있어 실제 API와의 통합이 필요합니다.

## 🎯 통합 목표
1. **완전한 API 연동**: 모든 백엔드 기능을 프론트엔드에서 활용
2. **타입 안전성**: TypeScript 타입 정의로 안전한 데이터 처리
3. **사용자 경험 향상**: 고급 검색, 지도 뷰, AI 추천 등 제공
4. **점진적 구현**: 단계별로 안정적인 통합 진행

## 📊 현재 상태 분석

### 백엔드 API 엔드포인트
- ✅ `GET /api/facilities/search` - 통합 검색 (다양한 필터 지원)
- ✅ `GET /api/facilities/search/map` - 지도 기반 검색
- ✅ `GET /api/facilities/{id}/detail` - 시설 상세 정보
- ✅ `POST /api/facilities/compare` - 시설 비교
- ✅ `GET /api/facilities/search-recommendations` - AI 추천
- ✅ `GET /api/facilities/favorites` - 즐겨찾기 목록
- ✅ `POST /api/facilities/{id}/favorite` - 즐겨찾기 추가/제거

### 프론트엔드 현황
- 📍 위치: `main/src/pages/FacilitiesPage.tsx`
- ❌ Mock 데이터 사용
- ✅ 기본 검색/필터링 UI
- ❌ API 연동 없음
- ❌ 지도 뷰 없음
- ❌ 상세 페이지 없음
- ❌ 비교/추천 기능 없음

## 🛠️ 단계별 구현 계획

### **Phase 1: 기반 구축 (1-2일)**

#### 1.1 API 서비스 레이어 구축
```typescript
// src/api/facilities/facilityApi.ts
import { apiClient } from '@/shared/api/client';

export interface FacilitySearchParams {
  keyword?: string;
  region?: string;
  district?: string;
  facilityType?: string;
  minGrade?: string;
  maxMonthlyCost?: number;
  availableBedsOnly?: boolean;
  specializedCare?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sortBy?: 'distance' | 'grade' | 'price' | 'rating';
  page?: number;
  size?: number;
}

export interface Facility {
  facilityId: number;
  facilityName: string;
  facilityType: string;
  address: string;
  facilityGrade: string;
  monthlyFee: string;
  availableBeds: number;
  isAvailable: boolean;
  userRating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  distance?: string;
  specializedCare: string[];
  thumbnailImage: string;
  phoneNumber?: string;
  operatorName?: string;
}

export const facilityApi = {
  // 시설 검색
  search: async (params: FacilitySearchParams) => {
    const response = await apiClient.get<PageResponse<Facility>>('/facilities/search', { params });
    return response.data;
  },
  
  // 지도 기반 검색
  searchMap: async (bounds: MapBounds, filters?: MapSearchFilters) => {
    const response = await apiClient.get<MapSearchResponse>('/facilities/search/map', {
      params: { ...bounds, ...filters }
    });
    return response.data;
  },
  
  // 상세 정보
  getDetail: async (facilityId: number) => {
    const response = await apiClient.get<FacilityDetail>(`/facilities/${facilityId}/detail`);
    return response.data;
  },
  
  // 시설 비교
  compare: async (facilityIds: number[]) => {
    const response = await apiClient.post<ComparisonResult>('/facilities/compare', facilityIds);
    return response.data;
  },
  
  // AI 추천
  getRecommendations: async (params: RecommendationParams) => {
    const response = await apiClient.get<Facility[]>('/facilities/search-recommendations', { params });
    return response.data;
  },
  
  // 즐겨찾기
  getFavorites: async (page = 0, size = 20) => {
    const response = await apiClient.get<PageResponse<Facility>>('/facilities/favorites', {
      params: { page, size }
    });
    return response.data;
  },
  
  toggleFavorite: async (facilityId: number, isFavorite: boolean) => {
    const response = await apiClient.post(`/facilities/${facilityId}/favorite`, null, {
      params: { isFavorite }
    });
    return response.data;
  }
};
```

#### 1.2 타입 정의 완성
```typescript
// src/types/facility.ts
export interface FacilityDetail extends Facility {
  totalCapacity: number;
  currentOccupancy: number;
  operatorName: string;
  establishedDate: string;
  contact: {
    phone: string;
    fax: string;
    email: string;
  };
  pricing: {
    basicFee: { amount: number; description: string };
    premiumFee: { amount: number; description: string };
    additionalFees: Array<{
      service: string;
      amount: number;
      unit: string;
    }>;
  };
  services: string[];
  facilities: string[];
  medicalStaff: {
    doctors: number;
    nurses: number;
    caregivers: number;
    therapists: number;
  };
  location: {
    latitude: number;
    longitude: number;
    nearbySubway: string[];
    nearbyBus: string[];
    parkingSpaces: number;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
    recentReviews: Review[];
  };
  certifications: string[];
  lastInspection: {
    date: string;
    result: string;
    nextDate: string;
  };
  isUserFavorite: boolean;
  coordinatorMatches: number;
  similarFacilities: number[];
}

export interface MapSearchResponse {
  totalCount: number;
  facilities: MapFacility[];
  clusters: FacilityCluster[];
}

export interface ComparisonResult {
  facilityIds: number[];
  comparisonDate: string;
  facilities: ComparisonFacility[];
  comparisonCategories: string[];
}
```

### **Phase 2: 기본 기능 통합 (2-3일)**

#### 2.1 검색 기능 API 연동
```typescript
// main/src/pages/FacilitiesPage.tsx 수정
import { useState, useEffect } from 'react';
import { facilityApi } from '@/api/facilities';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<FacilitySearchParams>({
    keyword: '',
    facilityType: '전체',
    sortBy: 'grade',
    page: 0,
    size: 20
  });
  
  const debouncedKeyword = useDebouncedValue(searchParams.keyword, 500);
  
  useEffect(() => {
    fetchFacilities();
  }, [debouncedKeyword, searchParams.facilityType, searchParams.sortBy]);
  
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await facilityApi.search({
        ...searchParams,
        keyword: debouncedKeyword
      });
      setFacilities(response.content);
    } catch (error) {
      console.error('시설 검색 실패:', error);
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };
  
  // ... 나머지 UI 코드
}
```

#### 2.2 상세 페이지 구현
```typescript
// main/src/pages/FacilityDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { facilityApi } from '@/api/facilities';

export default function FacilityDetailPage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  
  const { data: facility, isLoading } = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: () => facilityApi.getDetail(Number(facilityId)),
    enabled: !!facilityId
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (!facility) return <NotFound />;
  
  return (
    <div className="facility-detail">
      {/* 시설 정보 표시 */}
      <FacilityHeader facility={facility} />
      <FacilityGallery images={facility.images} />
      <FacilityInfo facility={facility} />
      <PricingInfo pricing={facility.pricing} />
      <ServiceList services={facility.services} />
      <MedicalStaff staff={facility.medicalStaff} />
      <LocationMap location={facility.location} />
      <ReviewSection reviews={facility.reviews} />
      <SimilarFacilities facilityIds={facility.similarFacilities} />
    </div>
  );
}
```

### **Phase 3: 고급 기능 구현 (3-4일)**

#### 3.1 지도 뷰 구현
```typescript
// main/src/components/FacilityMap.tsx
import { useState, useCallback } from 'react';
import { Map, Marker, MarkerClusterer } from '@/components/map';
import { facilityApi } from '@/api/facilities';

export function FacilityMap({ filters }: { filters: MapSearchFilters }) {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  
  const handleBoundsChange = useCallback(async (newBounds: MapBounds) => {
    setBounds(newBounds);
    const response = await facilityApi.searchMap(newBounds, filters);
    setFacilities(response.facilities);
  }, [filters]);
  
  return (
    <Map
      onBoundsChange={handleBoundsChange}
      defaultCenter={{ lat: 37.5665, lng: 126.9780 }}
      defaultZoom={11}
    >
      <MarkerClusterer>
        {facilities.map(facility => (
          <Marker
            key={facility.facilityId}
            position={{ lat: facility.latitude, lng: facility.longitude }}
            icon={getMarkerIcon(facility)}
            onClick={() => handleMarkerClick(facility)}
          />
        ))}
      </MarkerClusterer>
    </Map>
  );
}
```

#### 3.2 시설 비교 기능
```typescript
// main/src/components/FacilityComparison.tsx
import { useState } from 'react';
import { facilityApi } from '@/api/facilities';

export function FacilityComparison() {
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  
  const handleCompare = async () => {
    if (selectedFacilities.length < 2) {
      alert('비교할 시설을 2개 이상 선택해주세요.');
      return;
    }
    
    const result = await facilityApi.compare(selectedFacilities);
    setComparisonData(result);
  };
  
  return (
    <div className="comparison-container">
      <ComparisonTable data={comparisonData} />
      <ComparisonChart data={comparisonData} />
    </div>
  );
}
```

#### 3.3 AI 추천 시스템
```typescript
// main/src/components/FacilityRecommendations.tsx
import { useEffect, useState } from 'react';
import { facilityApi } from '@/api/facilities';
import { useHealthAssessment } from '@/hooks/useHealthAssessment';

export function FacilityRecommendations() {
  const { assessmentId, careGrade } = useHealthAssessment();
  const [recommendations, setRecommendations] = useState<Facility[]>([]);
  
  useEffect(() => {
    if (assessmentId || careGrade) {
      fetchRecommendations();
    }
  }, [assessmentId, careGrade]);
  
  const fetchRecommendations = async () => {
    const data = await facilityApi.getRecommendations({
      healthAssessmentId: assessmentId,
      careGrade: careGrade,
      limit: 10
    });
    setRecommendations(data);
  };
  
  return (
    <div className="recommendations">
      <h2>AI가 추천하는 맞춤 시설</h2>
      <RecommendationList facilities={recommendations} />
    </div>
  );
}
```

### **Phase 4: 상태 관리 및 최적화 (2일)**

#### 4.1 Zustand Store 구현
```typescript
// main/src/store/facilityStore.ts
import { create } from 'zustand';
import { facilityApi } from '@/api/facilities';

interface FacilityStore {
  facilities: Facility[];
  favorites: number[];
  searchParams: FacilitySearchParams;
  loading: boolean;
  
  searchFacilities: (params: FacilitySearchParams) => Promise<void>;
  toggleFavorite: (facilityId: number) => Promise<void>;
  loadFavorites: () => Promise<void>;
}

export const useFacilityStore = create<FacilityStore>((set, get) => ({
  facilities: [],
  favorites: [],
  searchParams: {},
  loading: false,
  
  searchFacilities: async (params) => {
    set({ loading: true });
    try {
      const response = await facilityApi.search(params);
      set({ 
        facilities: response.content,
        searchParams: params,
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  toggleFavorite: async (facilityId) => {
    const { favorites } = get();
    const isFavorite = !favorites.includes(facilityId);
    
    await facilityApi.toggleFavorite(facilityId, isFavorite);
    
    if (isFavorite) {
      set({ favorites: [...favorites, facilityId] });
    } else {
      set({ favorites: favorites.filter(id => id !== facilityId) });
    }
  },
  
  loadFavorites: async () => {
    const response = await facilityApi.getFavorites();
    set({ favorites: response.content.map(f => f.facilityId) });
  }
}));
```

#### 4.2 성능 최적화
```typescript
// 무한 스크롤 구현
import { useInfiniteQuery } from '@tanstack/react-query';

export function useFacilitiesInfinite(params: FacilitySearchParams) {
  return useInfiniteQuery({
    queryKey: ['facilities', params],
    queryFn: ({ pageParam = 0 }) => 
      facilityApi.search({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.last ? undefined : pages.length,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
}
```

### **Phase 5: 테스트 및 배포 (2일)**

#### 5.1 통합 테스트
```typescript
// __tests__/facilities.integration.test.ts
describe('시설 검색 통합 테스트', () => {
  it('키워드로 시설을 검색할 수 있다', async () => {
    const result = await facilityApi.search({ keyword: '서울' });
    expect(result.content).toHaveLength(greaterThan(0));
  });
  
  it('지도 영역 내 시설을 검색할 수 있다', async () => {
    const bounds = {
      neLat: 37.6, neLng: 127.1,
      swLat: 37.5, swLng: 126.9
    };
    const result = await facilityApi.searchMap(bounds);
    expect(result.facilities).toBeDefined();
  });
});
```

#### 5.2 E2E 테스트
```typescript
// e2e/facilities.spec.ts
test('시설 검색 전체 플로우', async ({ page }) => {
  await page.goto('/facilities');
  
  // 검색
  await page.fill('[data-testid="search-input"]', '강남');
  await page.click('[data-testid="search-button"]');
  
  // 결과 확인
  await expect(page.locator('[data-testid="facility-card"]')).toHaveCount(greaterThan(0));
  
  // 상세 페이지 이동
  await page.click('[data-testid="facility-card"]:first-child');
  await expect(page).toHaveURL(/\/facilities\/\d+/);
});
```

## 📋 체크리스트

### 필수 구현 사항
- [ ] API 서비스 레이어 구축
- [ ] TypeScript 타입 정의
- [ ] 검색 기능 API 연동
- [ ] 상세 페이지 구현
- [ ] 지도 뷰 구현
- [ ] 시설 비교 기능
- [ ] AI 추천 시스템
- [ ] 즐겨찾기 기능
- [ ] 상태 관리 (Zustand)
- [ ] 무한 스크롤
- [ ] 로딩/에러 처리
- [ ] 반응형 디자인

### 추가 개선 사항
- [ ] 검색 필터 고도화
- [ ] 실시간 알림
- [ ] 오프라인 지원
- [ ] PWA 기능
- [ ] 접근성 개선
- [ ] SEO 최적화

## 🚀 예상 일정
- **전체 기간**: 10-12일
- **Phase 1-2**: 4-5일 (기본 기능)
- **Phase 3**: 3-4일 (고급 기능)
- **Phase 4-5**: 3-4일 (최적화 및 테스트)

## 📌 주의사항
1. **API 응답 형식 검증**: 백엔드 Map<String, Object>를 TypeScript 타입으로 안전하게 변환
2. **에러 처리**: 네트워크 오류, 401/403 등 적절한 처리
3. **성능 최적화**: 대량 데이터 처리 시 가상화 적용
4. **접근성**: WCAG 2.1 AA 기준 준수
5. **보안**: XSS, CSRF 방지

이 계획을 통해 엘더베리 프로젝트의 시설찾기 기능이 완전하게 통합되어 사용자에게 최상의 경험을 제공할 수 있을 것입니다.