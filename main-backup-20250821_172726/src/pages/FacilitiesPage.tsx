import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Phone, Users, Heart, Filter, Loader2, AlertCircle, ChevronLeft, ChevronRight, Map, Grid, List } from 'lucide-react';
import { useFacilitySearch } from '../hooks/useFacilitySearch';
import { FACILITY_FILTER_OPTIONS } from '../services/facilityService';
import FacilityMap from '../components/FacilityMap';
import { FacilityCard, FacilitySearchFilters } from '../components/facility-advanced';
import type { FacilityProfileResponse } from '../types/facility';

export default function FacilitiesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFacility, setSelectedFacility] = useState<FacilityProfileResponse | null>(null);
  const navigate = useNavigate();
  
  const {
    facilities,
    loading,
    error,
    searchParams,
    totalElements,
    totalPages,
    currentPage,
    handleSearchKeyword,
    handleFilterChange,
    loadNextPage,
    loadPrevPage,
    clearError,
    hasNextPage,
    hasPrevPage,
    isEmpty
  } = useFacilitySearch();

  const handleSearch = () => {
    handleSearchKeyword(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFacilitySelect = (facility: FacilityProfileResponse) => {
    setSelectedFacility(facility);
    // 선택된 시설로 스크롤 (목록 뷰에서)
    if (!showMap) {
      const facilityElement = document.getElementById(`facility-${facility.id}`);
      if (facilityElement) {
        facilityElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-text-main mb-4">시설찾기</h1>
          <p className="text-text-secondary text-lg mb-8">
            우리 지역의 믿을 수 있는 요양시설을 찾아보세요
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl border-2 border-primary shadow-lg p-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <button 
                  onClick={clearError}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="시설명 또는 지역을 검색하세요"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={loading}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  disabled={loading}
                >
                  <Filter className="w-4 h-4" />
                  필터
                </button>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    showMap 
                      ? 'bg-primary text-white' 
                      : 'border border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  disabled={loading}
                >
                  <Map className="w-4 h-4" />
                  지도
                </button>
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  검색
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-border-light">
                <div className="grid gap-4">
                  {/* 시설 유형 */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-text-secondary font-medium mr-4">시설 유형:</span>
                    {FACILITY_FILTER_OPTIONS.facilityTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('facilityType', type === '전체' ? '' : type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          (searchParams.facilityType || '전체') === type
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                        }`}
                        disabled={loading}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  
                  {/* 지역 */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-text-secondary font-medium mr-4">지역:</span>
                    {FACILITY_FILTER_OPTIONS.regions.slice(0, 10).map((region) => (
                      <button
                        key={region}
                        onClick={() => handleFilterChange('region', region === '전체' ? '' : region)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          (searchParams.region || '전체') === region
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                        }`}
                        disabled={loading}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-text-main">
              검색 결과 ({totalElements}개)
            </h2>
            <select 
              className="px-4 py-2 border border-border-light rounded-lg text-text-secondary"
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              value={searchParams.sortBy || 'distance'}
              disabled={loading}
            >
              <option value="distance">거리순</option>
              <option value="rating">평점순</option>
              <option value="review">리뷰순</option>
            </select>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-text-muted">시설을 검색하고 있습니다...</span>
            </div>
          )}

          {/* 빈 결과 */}
          {isEmpty && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-main mb-2">검색 결과가 없습니다</h3>
                <p className="text-text-muted">다른 검색어나 필터를 시도해보세요</p>
              </div>
            </div>
          )}

          {/* Map View */}
          {showMap && !loading && facilities.length > 0 && (
            <div className="mb-8">
              <FacilityMap
                facilities={facilities}
                selectedFacilityId={selectedFacility?.id}
                onFacilitySelect={handleFacilitySelect}
                className="w-full h-96 lg:h-[500px]"
              />
            </div>
          )}

          {/* Facility Cards */}
          {!loading && facilities.length > 0 && (
            <div className="grid gap-6">
              {facilities.map((facility) => (
                <div 
                  key={facility.id} 
                  id={`facility-${facility.id}`}
                  className={`bg-white border border-border-light rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedFacility?.id === facility.id ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => handleFacilitySelect(facility)}
                >
                  <div className="md:flex">
                    {/* Image */}
                    <div className="md:w-80 h-64 md:h-auto">
                      <img
                        src={facility.profileImageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                        alt={facility.facilityName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-text-main">{facility.facilityName}</h3>
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                              {facility.facilityType}
                            </span>
                            {facility.facilityGrade && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                                {facility.facilityGrade}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-text-muted text-sm mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {facility.address}
                            </div>
                            {facility.contactNumber && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {facility.contactNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {facility.rating && (
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-text-main">{facility.rating.toFixed(1)}</span>
                              {facility.reviewCount && (
                                <span className="text-text-muted text-sm">({facility.reviewCount})</span>
                              )}
                            </div>
                          )}
                          <div className="text-text-muted text-sm">{facility.region} {facility.district}</div>
                        </div>
                      </div>

                      {facility.introductionText && (
                        <p className="text-text-secondary mb-4 line-clamp-2">{facility.introductionText}</p>
                      )}

                      {/* Features */}
                      {facility.serviceFeatures && facility.serviceFeatures.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {facility.serviceFeatures.slice(0, 4).map((feature, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-text-muted px-3 py-1 rounded-full text-sm"
                            >
                              {feature}
                            </span>
                          ))}
                          {facility.serviceFeatures.length > 4 && (
                            <span className="text-text-muted text-sm px-2 py-1">
                              +{facility.serviceFeatures.length - 4}개 더
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats and Actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-6 text-sm">
                          <div className="flex items-center gap-1 text-text-muted">
                            <Users className="w-4 h-4" />
                            정원 {facility.capacity}명
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            <Heart className="w-4 h-4" />
                            입소 가능 {facility.availableSlots}명
                          </div>
                          {facility.basicMonthlyFee && (
                            <div className="text-text-muted">
                              월 {facility.basicMonthlyFee.toLocaleString()}만원
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                            onClick={() => navigate(`/facilities/${facility.id}`)}
                          >
                            상세보기
                          </button>
                          <button 
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            onClick={() => {
                              // TODO: 문의하기 모달 또는 페이지
                              console.log('문의하기', facility.id);
                            }}
                          >
                            문의하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && facilities.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-4">
              <button
                onClick={loadPrevPage}
                disabled={!hasPrevPage}
                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-text-muted">
                  {currentPage + 1} / {totalPages} 페이지
                </span>
              </div>
              
              <button
                onClick={loadNextPage}
                disabled={!hasNextPage}
                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}