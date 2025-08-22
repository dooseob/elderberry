import { useCallback, useEffect } from 'react';
import { useFacilityStore } from '../stores/facilityStore';
import { FacilityService } from '../services/facilityService';
import { FacilitySearchParams } from '../types/facility';

export const useFacilitySearch = () => {
  const {
    facilities,
    recommendations,
    currentFacility,
    loading,
    error,
    searchParams,
    searchKeyword,
    totalElements,
    totalPages,
    currentPage,
    
    setFacilities,
    setRecommendations,
    setCurrentFacility,
    setLoading,
    setError,
    setSearchParams,
    setSearchKeyword,
    setPagination,
    updateFilter,
    resetFilters,
    clearError
  } = useFacilityStore();

  // 시설 검색 실행
  const searchFacilities = useCallback(async (params?: FacilitySearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchOptions = { ...searchParams, ...params };
      let result;
      
      // 키워드가 있으면 통합 검색, 없으면 일반 페이징 조회
      if (searchKeyword.trim()) {
        const facilities = await FacilityService.searchFacilities(searchKeyword, searchOptions);
        result = {
          content: facilities,
          totalElements: facilities.length,
          totalPages: Math.ceil(facilities.length / (searchOptions.size || 20)),
          number: searchOptions.page || 0,
          size: searchOptions.size || 20,
          first: (searchOptions.page || 0) === 0,
          last: (searchOptions.page || 0) >= Math.ceil(facilities.length / (searchOptions.size || 20)) - 1
        };
      } else {
        result = await FacilityService.getFacilities(searchOptions);
      }
      
      setFacilities(result.content);
      setPagination(result.totalElements, result.totalPages, result.number);
      setSearchParams(searchOptions);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '시설 검색 중 오류가 발생했습니다';
      setError(errorMessage);
      console.error('Facility search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, searchKeyword, setFacilities, setLoading, setError, setPagination, setSearchParams]);

  // 시설 상세 조회
  const getFacilityDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const facility = await FacilityService.getFacilityById(id);
      setCurrentFacility(facility);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '시설 상세 조회 중 오류가 발생했습니다';
      setError(errorMessage);
      console.error('Facility detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setCurrentFacility, setLoading, setError]);

  // 추천 시설 조회
  const getRecommendations = useCallback(async (
    healthAssessmentId?: number,
    careGrade?: number,
    preferredRegion?: string,
    budgetRange?: number,
    limit?: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const recommendations = await FacilityService.getRecommendations(
        healthAssessmentId,
        careGrade,
        preferredRegion,
        budgetRange,
        limit
      );
      setRecommendations(recommendations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '추천 시설 조회 중 오류가 발생했습니다';
      setError(errorMessage);
      console.error('Facility recommendations error:', err);
    } finally {
      setLoading(false);
    }
  }, [setRecommendations, setLoading, setError]);

  // 지역별 검색
  const searchByRegion = useCallback(async (
    region: string,
    facilityType?: string,
    careGradeLevel?: number,
    limit?: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const facilities = await FacilityService.searchFacilitiesByRegion(
        region,
        facilityType,
        careGradeLevel,
        limit
      );
      setFacilities(facilities);
      setPagination(facilities.length, 1, 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '지역별 검색 중 오류가 발생했습니다';
      setError(errorMessage);
      console.error('Region search error:', err);
    } finally {
      setLoading(false);
    }
  }, [setFacilities, setPagination, setLoading, setError]);

  // 다음 페이지 로드
  const loadNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      searchFacilities({ ...searchParams, page: currentPage + 1 });
    }
  }, [currentPage, totalPages, searchParams, searchFacilities]);

  // 이전 페이지 로드
  const loadPrevPage = useCallback(() => {
    if (currentPage > 0) {
      searchFacilities({ ...searchParams, page: currentPage - 1 });
    }
  }, [currentPage, searchParams, searchFacilities]);

  // 키워드 검색
  const handleSearchKeyword = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    searchFacilities({ ...searchParams, page: 0 });
  }, [searchParams, setSearchKeyword, searchFacilities]);

  // 필터 변경
  const handleFilterChange = useCallback((key: keyof FacilitySearchParams, value: any) => {
    updateFilter(key, value);
    // 필터 변경 시 자동 검색 실행 (옵션)
    searchFacilities({ ...searchParams, [key]: value, page: 0 });
  }, [searchParams, updateFilter, searchFacilities]);

  // 초기 로드
  useEffect(() => {
    if (facilities.length === 0 && !loading && !error) {
      searchFacilities();
    }
  }, []);

  return {
    // 상태
    facilities,
    recommendations,
    currentFacility,
    loading,
    error,
    searchParams,
    searchKeyword,
    totalElements,
    totalPages,
    currentPage,
    
    // 액션
    searchFacilities,
    getFacilityDetail,
    getRecommendations,
    searchByRegion,
    loadNextPage,
    loadPrevPage,
    handleSearchKeyword,
    handleFilterChange,
    resetFilters,
    clearError,
    
    // 헬퍼
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0,
    isEmpty: facilities.length === 0 && !loading,
    isFirstPage: currentPage === 0,
    isLastPage: currentPage >= totalPages - 1
  };
};