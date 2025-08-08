import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  Filter,
  Heart,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/entities/job';
import type { Job, JobSearchParams } from '@/entities/job';
import { EMPLOYMENT_TYPE_TEXT, EXPERIENCE_LEVEL_TEXT } from '@/entities/job';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { LoadingSpinner } from '@/shared/ui';
import { ErrorMessage } from '@/shared/ui';

interface JobListPageProps {}

const JobListPage: React.FC<JobListPageProps> = () => {
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    page: 0,
    size: 12,
    sortBy: 'latest',
    sortOrder: 'desc',
  });
  
  const [filters, setFilters] = useState({
    keyword: '',
    region: '',
    position: '',
    employmentType: '',
    experienceLevel: '',
    isUrgent: undefined as boolean | undefined,
    showFilters: false,
  });

  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobs', searchParams],
    queryFn: () => jobApi.getJobs(searchParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleSearch = (keyword: string) => {
    setFilters(prev => ({ ...prev, keyword }));
    setSearchParams(prev => ({
      ...prev,
      page: 0,
      keyword: keyword || undefined,
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchParams(prev => ({
      ...prev,
      page: 0,
      [key]: value || undefined,
    }));
  };

  const handleSort = (sortBy: 'latest' | 'salary' | 'location' | 'urgent') => {
    setSearchParams(prev => ({
      ...prev,
      page: 0,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleBookmark = (jobId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: Implement bookmark functionality
    console.log('Bookmark job:', jobId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <ErrorMessage
            message="구인공고를 불러오는 중 오류가 발생했습니다."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            구인공고
          </h1>
          <p className="text-elderberry-600">
            요양 시설에서 제공하는 다양한 채용 기회를 확인해보세요
          </p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            {/* 상단 검색 바 */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-elderberry-400" />
                <input
                  type="text"
                  placeholder="직종, 시설명, 지역으로 검색"
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(filters.keyword)}
                  className="w-full pl-10 pr-4 py-3 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => handleSearch(filters.keyword)}
                className="px-6"
              >
                검색
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                필터
                <ChevronDown className={`w-4 h-4 transition-transform ${filters.showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* 확장 필터 */}
            <AnimatePresence>
              {filters.showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-elderberry-200 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        지역
                      </label>
                      <select
                        value={filters.region}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      >
                        <option value="">전체 지역</option>
                        <option value="서울">서울특별시</option>
                        <option value="경기">경기도</option>
                        <option value="인천">인천광역시</option>
                        <option value="부산">부산광역시</option>
                        <option value="대구">대구광역시</option>
                        <option value="광주">광주광역시</option>
                        <option value="대전">대전광역시</option>
                        <option value="울산">울산광역시</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        직종
                      </label>
                      <select
                        value={filters.position}
                        onChange={(e) => handleFilterChange('position', e.target.value)}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      >
                        <option value="">전체 직종</option>
                        <option value="간병인">간병인</option>
                        <option value="요양보호사">요양보호사</option>
                        <option value="간호사">간호사</option>
                        <option value="사회복지사">사회복지사</option>
                        <option value="물리치료사">물리치료사</option>
                        <option value="영양사">영양사</option>
                        <option value="관리직">관리직</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        고용형태
                      </label>
                      <select
                        value={filters.employmentType}
                        onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      >
                        <option value="">전체</option>
                        <option value="FULL_TIME">정규직</option>
                        <option value="PART_TIME">파트타임</option>
                        <option value="CONTRACT">계약직</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-elderberry-700 mb-1">
                        경력
                      </label>
                      <select
                        value={filters.experienceLevel}
                        onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                      >
                        <option value="">전체</option>
                        <option value="ENTRY">신입</option>
                        <option value="JUNIOR">경력 1-3년</option>
                        <option value="SENIOR">경력 3-7년</option>
                        <option value="EXPERT">경력 7년+</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.isUrgent === true}
                          onChange={(e) => handleFilterChange('isUrgent', e.target.checked ? true : undefined)}
                          className="text-elderberry-600 focus:ring-elderberry-500"
                        />
                        <span className="text-sm text-elderberry-700">급구만 보기</span>
                      </label>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters({
                          keyword: '',
                          region: '',
                          position: '',
                          employmentType: '',
                          experienceLevel: '',
                          isUrgent: undefined,
                          showFilters: filters.showFilters,
                        });
                        setSearchParams({
                          page: 0,
                          size: 12,
                          sortBy: 'latest',
                          sortOrder: 'desc',
                        });
                      }}
                    >
                      필터 초기화
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* 정렬 및 결과 수 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-elderberry-600">
              {jobsData ? `총 ${jobsData.totalElements}개` : '0개'} 구인공고
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSort('latest')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  searchParams.sortBy === 'latest' 
                    ? 'bg-elderberry-100 text-elderberry-800' 
                    : 'text-elderberry-600 hover:bg-elderberry-50'
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => handleSort('salary')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  searchParams.sortBy === 'salary' 
                    ? 'bg-elderberry-100 text-elderberry-800' 
                    : 'text-elderberry-600 hover:bg-elderberry-50'
                }`}
              >
                급여순
              </button>
              <button
                onClick={() => handleSort('urgent')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  searchParams.sortBy === 'urgent' 
                    ? 'bg-elderberry-100 text-elderberry-800' 
                    : 'text-elderberry-600 hover:bg-elderberry-50'
                }`}
              >
                급구순
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
          </div>
        </div>

        {/* 구인공고 목록 */}
        {jobsData && jobsData.content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsData.content.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
                  onClick={() => handleJobClick(job.id)}
                >
                  {job.isUrgent && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        급구
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => handleBookmark(job.id, e)}
                      className="p-2 rounded-full bg-white shadow-md hover:bg-elderberry-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-elderberry-400 hover:text-elderberry-600" />
                    </button>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-elderberry-900 group-hover:text-elderberry-700 transition-colors mb-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1 text-elderberry-600 mb-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium">{job.facilityName}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-elderberry-600">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg font-bold text-elderberry-900">
                          {job.salary}
                        </span>
                      </div>
                    </div>

                    {(job.employmentType || job.experienceLevel) && (
                      <div className="flex items-center gap-2 mb-4">
                        {job.employmentType && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {EMPLOYMENT_TYPE_TEXT[job.employmentType]}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            {EXPERIENCE_LEVEL_TEXT[job.experienceLevel]}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-elderberry-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '오늘'}
                      </div>
                      {job.deadline && (
                        <div className="text-red-600">
                          마감: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="w-12 h-12 text-elderberry-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-elderberry-900 mb-2">
                검색 조건에 맞는 구인공고가 없습니다
              </h3>
              <p className="text-elderberry-600 mb-6">
                다른 검색 조건을 시도해보거나 필터를 조정해보세요.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    keyword: '',
                    region: '',
                    position: '',
                    employmentType: '',
                    experienceLevel: '',
                    isUrgent: undefined,
                    showFilters: false,
                  });
                  setSearchParams({
                    page: 0,
                    size: 12,
                    sortBy: 'latest',
                    sortOrder: 'desc',
                  });
                }}
              >
                전체 구인공고 보기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 페이지네이션 */}
        {jobsData && jobsData.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(searchParams.page! - 1)}
                disabled={jobsData.first}
              >
                이전
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, jobsData.totalPages) }, (_, i) => {
                  const pageNum = searchParams.page! + i - 2;
                  if (pageNum < 0 || pageNum >= jobsData.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded ${
                        pageNum === searchParams.page
                          ? 'bg-elderberry-600 text-white'
                          : 'text-elderberry-600 hover:bg-elderberry-100'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(searchParams.page! + 1)}
                disabled={jobsData.last}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListPage;