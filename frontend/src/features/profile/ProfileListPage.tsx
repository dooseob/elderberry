/**
 * 프로필 목록 페이지
 * 프로필 검색, 필터링, 통계 대시보드 제공
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
  Search,
  Filter,
  Globe,
  MapPin,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  useProfileStore,
  useSearchResults,
  useProfileLoading,
  useProfileError,
  useProfileStatistics
} from '../../stores/profileStore';
import {
  ProfileType,
  ProfileSearchParams,
  DomesticProfileResponse,
  OverseasProfileResponse,
  CareLevel,
  BudgetRange,
  Gender
} from '../../types/profile';
import {
  CARE_LEVEL_OPTIONS,
  DOMESTIC_BUDGET_OPTIONS,
  OVERSEAS_BUDGET_OPTIONS,
  GENDER_OPTIONS,
  RESIDENCE_COUNTRY_OPTIONS,
  KOREA_REGION_OPTIONS
} from '../../constants/profile';
import { useAuth } from '../../stores/authStore';

// ===== 메인 컴포넌트 =====

const ProfileListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 스토어 상태
  const searchResults = useSearchResults();
  const loading = useProfileLoading();
  const error = useProfileError();
  const statistics = useProfileStatistics();
  
  const {
    searchProfiles,
    getStatistics,
    getProfilesByCompletion,
    getOverseasProfilesByCountry,
    getProfilesRequiringCoordinator,
    setSearchParams,
    resetSearchParams,
    setPagination,
    clearError
  } = useProfileStore();

  // 로컬 상태
  const [activeTab, setActiveTab] = useState<'all' | 'domestic' | 'overseas' | 'coordinator'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Partial<ProfileSearchParams>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ===== 초기 데이터 로드 =====

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        searchProfiles({ page: 0, size: 20 }),
        getStatistics()
      ]);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    }
  };

  // ===== 검색 및 필터링 =====

  const handleSearch = async () => {
    const params: ProfileSearchParams = {
      keyword: searchQuery.trim() || undefined,
      ...selectedFilters,
      page: 0,
      size: 20
    };

    await searchProfiles(params);
  };

  const handleTabChange = async (tab: typeof activeTab) => {
    setActiveTab(tab);
    clearError();
    
    switch (tab) {
      case 'all':
        await searchProfiles({ page: 0, size: 20 });
        break;
      case 'domestic':
        await getProfilesByCompletion(0);
        break;
      case 'overseas':
        await getOverseasProfilesByCountry();
        break;
      case 'coordinator':
        await getProfilesRequiringCoordinator();
        break;
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setSearchQuery('');
    resetSearchParams();
    searchProfiles({ page: 0, size: 20 });
  };

  // ===== 페이지네이션 =====

  const handlePageChange = (page: number) => {
    setPagination(page);
    searchProfiles({ ...selectedFilters, keyword: searchQuery, page });
  };

  // ===== 유틸리티 함수들 =====

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCareLevel = (level: CareLevel) => {
    const option = CARE_LEVEL_OPTIONS.find(opt => opt.enum === level);
    return option ? option.label : level;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // ===== 렌더링 =====

  if (loading.search && !searchResults.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">프로필 관리</h1>
              <p className="text-gray-600 mt-1">회원 프로필 조회 및 관리</p>
            </div>
            
            {user?.role.includes('ADMIN') && (
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/profiles/statistics')}
                  className="btn-secondary"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  통계 보기
                </button>
                <button
                  onClick={() => navigate('/profiles/create')}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  프로필 생성
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="전체 프로필"
              value={statistics.totalProfiles}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="국내 프로필"
              value={statistics.domesticProfiles}
              icon={MapPin}
              color="green"
            />
            <StatCard
              title="해외 프로필"
              value={statistics.overseasProfiles}
              icon={Globe}
              color="purple"
            />
            <StatCard
              title="평균 완성도"
              value={`${Math.round(statistics.averageCompletionRate)}%`}
              icon={CheckCircle}
              color="yellow"
            />
          </div>
        )}

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* 검색바 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="이름, 이메일, 주소로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary ${showFilters ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                필터
              </button>
              
              <button
                onClick={handleSearch}
                className="btn-primary"
                disabled={loading.search}
              >
                {loading.search ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                검색
              </button>

              <button
                onClick={loadInitialData}
                className="btn-secondary"
                disabled={loading.search}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 필터 패널 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <FilterPanel
                  filters={selectedFilters}
                  onChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-6">
          {[
            { id: 'all', label: '전체', count: statistics?.totalProfiles },
            { id: 'domestic', label: '국내', count: statistics?.domesticProfiles },
            { id: 'overseas', label: '해외', count: statistics?.overseasProfiles },
            { id: 'coordinator', label: '코디네이터 필요' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs text-gray-500">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* 결과 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            총 {searchResults.length}개의 프로필
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* 프로필 목록 */}
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">프로필이 없습니다</h3>
            <p className="text-gray-600">조건에 맞는 프로필을 찾을 수 없습니다.</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {searchResults.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                viewMode={viewMode}
                onView={() => navigate(`/profiles/${profile.profileType.toLowerCase()}/${profile.id}`)}
                onEdit={() => navigate(`/profiles/${profile.profileType.toLowerCase()}/${profile.id}/edit`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== 하위 컴포넌트들 =====

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface FilterPanelProps {
  filters: Partial<ProfileSearchParams>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, onReset }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 프로필 타입 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          프로필 타입
        </label>
        <select
          value={filters.profileType || ''}
          onChange={(e) => onChange('profileType', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체</option>
          <option value={ProfileType.DOMESTIC}>국내</option>
          <option value={ProfileType.OVERSEAS}>해외</option>
        </select>
      </div>

      {/* 완성도 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          최소 완성도
        </label>
        <select
          value={filters.minCompletion || ''}
          onChange={(e) => onChange('minCompletion', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체</option>
          <option value="90">90% 이상</option>
          <option value="70">70% 이상</option>
          <option value="50">50% 이상</option>
        </select>
      </div>

      {/* 케어 레벨 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          케어 레벨
        </label>
        <select
          value={filters.careLevel?.[0] || ''}
          onChange={(e) => onChange('careLevel', e.target.value ? [e.target.value as CareLevel] : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체</option>
          {CARE_LEVEL_OPTIONS.map(option => (
            <option key={option.enum} value={option.enum}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 거주 국가 (해외 프로필용) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          거주 국가
        </label>
        <select
          value={filters.residenceCountry?.[0] || ''}
          onChange={(e) => onChange('residenceCountry', e.target.value ? [e.target.value] : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체</option>
          {RESIDENCE_COUNTRY_OPTIONS.map(option => (
            <option key={option.code} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 초기화 버튼 */}
      <div className="lg:col-span-4 flex justify-end">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          필터 초기화
        </button>
      </div>
    </div>
  );
};

interface ProfileCardProps {
  profile: DomesticProfileResponse | OverseasProfileResponse;
  viewMode: 'grid' | 'list';
  onView: () => void;
  onEdit: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, viewMode, onView, onEdit }) => {
  const isOverseas = profile.profileType === ProfileType.OVERSEAS;
  const overseasProfile = profile as OverseasProfileResponse;
  
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {(profile as any).memberName || '이름 없음'}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {(profile as any).memberEmail}
                </span>
                {isOverseas && (
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {overseasProfile.residenceCountry}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(profile.updatedAt)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(profile.profileCompletionPercentage)}`}>
              {profile.profileCompletionPercentage}%
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onView}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="보기"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="수정"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {(profile as any).memberName || '이름 없음'}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              isOverseas ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
            }`}>
              {isOverseas ? '해외' : '국내'}
            </span>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(profile.profileCompletionPercentage)}`}>
          {profile.profileCompletionPercentage}%
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {(profile as any).memberEmail}
        </div>
        
        {profile.careLevel && (
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            {getCareLevel(profile.careLevel)}
          </div>
        )}
        
        {isOverseas && overseasProfile.residenceCountry && (
          <div className="flex items-center text-sm text-gray-600">
            <Globe className="w-4 h-4 mr-2" />
            {overseasProfile.residenceCountry}
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {formatDate(profile.updatedAt)}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {isOverseas && overseasProfile.coordinatorRequired && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              코디네이터 필요
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onView}
            className="btn-secondary-sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            보기
          </button>
          <button
            onClick={onEdit}
            className="btn-primary-sm"
          >
            <Edit className="w-4 h-4 mr-1" />
            수정
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileListPage;