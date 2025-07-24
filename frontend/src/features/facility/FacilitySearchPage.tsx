/**
 * 시설 검색 메인 페이지
 * 시설 검색, 필터링, 추천 결과 표시 등의 종합적인 시설 검색 UI
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart,
  Settings,
  RefreshCw,
  AlertCircle,
  Sparkles,
  List,
  Grid
} from 'lucide-react';

import { useFacilityStore, useFacilitySearchResults, useFacilityLoadingStates, useFacilityErrors } from '@/stores/facilityStore';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import FacilityList from './components/FacilityList';
import FacilitySearchFilters from './components/FacilitySearchFilters';
import RecommendationResults from './components/RecommendationResults';
import FacilityDetailModal from './components/FacilityDetailModal';

interface FacilitySearchPageProps {
  memberId?: number;
  coordinatorId?: string;
  showRecommendations?: boolean;
}

const FacilitySearchPage: React.FC<FacilitySearchPageProps> = ({
  memberId,
  coordinatorId,
  showRecommendations = true,
}) => {
  // Zustand 스토어 상태 및 액션들
  const searchResults = useFacilitySearchResults();
  const { isSearching, isLoadingRecommendations } = useFacilityLoadingStates();
  const { searchError, recommendationError } = useFacilityErrors();
  
  const {
    recommendations,
    searchFilters,
    isDetailModalOpen,
    isRecommendationModalOpen,
    searchFacilities,
    getRecommendations,
    updateSearchFilters,
    clearSearchResults,
    clearRecommendations,
    openRecommendationModal,
    closeRecommendationModal,
    clearAllErrors,
  } = useFacilityStore();

  // 로컬 UI 상태
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('search');

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    clearAllErrors();
    
    // 추천 기능이 활성화되고 memberId가 있으면 자동으로 추천 조회
    if (showRecommendations && memberId) {
      setActiveTab('recommendations');
      handleGetRecommendations();
    }
    
    return () => {
      // 컴포넌트 언마운트 시 정리
      clearSearchResults();
      clearRecommendations();
    };
  }, [memberId, showRecommendations]);

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
      return;
    }

    const filters = {
      ...searchFilters,
      ...(searchQuery && { region: searchQuery }), // 검색어를 지역으로 처리
    };

    await searchFacilities(filters);
    setActiveTab('search');
  };

  // 추천 시설 조회
  const handleGetRecommendations = async () => {
    if (!memberId) {
      console.warn('회원 ID가 필요합니다.');
      return;
    }

    await getRecommendations(memberId, coordinatorId);
  };

  // 필터 적용
  const handleFilterChange = (newFilters: any) => {
    updateSearchFilters(newFilters);
    
    // 필터 변경 시 자동 검색 (디바운싱 적용 가능)
    if (activeTab === 'search') {
      setTimeout(() => {
        handleSearch();
      }, 500);
    }
  };

  // 검색어 입력 핸들러
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 엔터키 검색
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            시설 검색 및 추천
          </h1>
          <p className="text-gray-600">
            맞춤형 요양 시설을 찾아보세요. AI 기반 추천으로 최적의 시설을 제안해드립니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                시설 검색
              </button>
              
              {showRecommendations && (
                <button
                  onClick={() => {
                    setActiveTab('recommendations');
                    if (memberId) handleGetRecommendations();
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'recommendations'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  맞춤 추천
                  {recommendations.length > 0 && (
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {recommendations.length}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* 검색 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 검색바 */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* 검색 입력 */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="지역명을 입력하세요 (예: 서울시 강남구)"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          onKeyPress={handleSearchKeyPress}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* 검색 버튼 */}
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-8 py-3"
                    >
                      {isSearching ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          검색 중...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          검색
                        </>
                      )}
                    </Button>

                    {/* 필터 토글 버튼 */}
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-4 py-3"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      필터
                    </Button>
                  </div>

                  {/* 검색 필터 (접기/펼치기) */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <FacilitySearchFilters
                            filters={searchFilters}
                            onFiltersChange={handleFilterChange}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* 검색 오류 표시 */}
              {searchError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700">{searchError}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 검색 결과 헤더 */}
              {searchResults.length > 0 && (
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      검색 결과
                    </h2>
                    <p className="text-gray-600">
                      총 {searchResults.length}개의 시설을 찾았습니다.
                    </p>
                  </div>

                  {/* 보기 모드 전환 */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* 검색 결과 목록 */}
              <FacilityList
                facilities={searchResults}
                viewMode={viewMode}
                isLoading={isSearching}
                emptyMessage="검색 조건에 맞는 시설이 없습니다."
              />
            </motion.div>
          )}

          {/* 추천 탭 콘텐츠 */}
          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 추천 오류 표시 */}
              {recommendationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700">{recommendationError}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 추천 결과 */}
              <RecommendationResults
                recommendations={recommendations}
                isLoading={isLoadingRecommendations}
                onRefresh={handleGetRecommendations}
                memberId={memberId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 시설 상세 모달 */}
        <FacilityDetailModal />
      </div>
    </div>
  );
};

export default FacilitySearchPage; 