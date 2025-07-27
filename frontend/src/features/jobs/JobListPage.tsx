/**
 * 구인 공고 목록 페이지
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Filter,
  MapPin,
  Plus,
  Search,
  Star,
  Users
} from '../../components/icons/LucideIcons';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJobStore } from '../../stores/jobStore';
import { useAuthStore } from '../../stores/authStore';
import { Job, EmploymentType, ExperienceLevel, JobSearchParams } from '../../types/job';
import { MemberRole } from '../../types/auth';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// 고용 형태 한글 매핑
const employmentTypeLabels = {
  [EmploymentType.FULL_TIME]: '정규직',
  [EmploymentType.PART_TIME]: '시간제',
  [EmploymentType.CONTRACT]: '계약직',
  [EmploymentType.TEMPORARY]: '임시직'
};

// 경력 수준 한글 매핑
const experienceLevelLabels = {
  [ExperienceLevel.ENTRY]: '신입',
  [ExperienceLevel.JUNIOR]: '1-3년',
  [ExperienceLevel.MID]: '3-7년',
  [ExperienceLevel.SENIOR]: '7년 이상',
  [ExperienceLevel.EXPERT]: '전문가'
};

// 급여 포맷팅 함수
const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return '급여 협의';
  if (min && max) return `${min.toLocaleString()}원 - ${max.toLocaleString()}원`;
  if (min) return `${min.toLocaleString()}원 이상`;
  if (max) return `${max.toLocaleString()}원 이하`;
  return '급여 협의';
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return '마감됨';
  if (diffDays === 0) return '오늘 마감';
  if (diffDays === 1) return '내일 마감';
  if (diffDays <= 7) return `${diffDays}일 후 마감`;
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 구인 공고 카드 컴포넌트
interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user } = useAuthStore();
  const isEmployer = user?.role === MemberRole.EMPLOYER;
  const isMyJob = isEmployer && job.employerId === user?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-elderberry-600">
                  <Link to={`/jobs/${job.id}`}>
                    {job.title}
                  </Link>
                </h3>
                {job.isUrgent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Star className="w-3 h-3 mr-1" />
                    급구
                  </span>
                )}
                {isMyJob && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    내 공고
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {job.facilityName || job.employerName}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {employmentTypeLabels[job.employmentType]}
                </span>
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center text-green-600 font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                  <span className="flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    지원자 {job.applicationCount}명
                  </span>
                  <span className="flex items-center text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    조회 {job.viewCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 태그 */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{job.tags.length - 3}개</span>
              )}
            </div>
          )}

          {/* 하단 정보 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(job.postedDate).toLocaleDateString('ko-KR')}
              </span>
              {job.applicationDeadline && (
                <span className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {formatDate(job.applicationDeadline)}
                </span>
              )}
            </div>

            <Link to={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                자세히 보기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    jobs,
    jobsLoading,
    jobsError,
    jobsTotalPages,
    jobsCurrentPage,
    jobsTotalElements,
    searchParams: storeSearchParams,
    loadJobs,
    setSearchParams: setStoreSearchParams,
    clearJobsError
  } = useJobStore();

  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<EmploymentType[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  const isEmployer = user?.role === MemberRole.EMPLOYER;

  // 초기 데이터 로드
  useEffect(() => {
    const params: JobSearchParams = {};
    
    if (searchParams.get('keyword')) params.keyword = searchParams.get('keyword')!;
    if (searchParams.get('location')) params.location = searchParams.get('location')!;
    if (searchParams.get('page')) params.page = parseInt(searchParams.get('page')!) || 0;

    loadJobs(params);
  }, [searchParams]);

  // 검색 실행
  const handleSearch = () => {
    const params: JobSearchParams = {
      page: 0,
      keyword: searchKeyword || undefined,
      location: selectedLocation || undefined,
      employmentType: selectedEmploymentTypes.length > 0 ? selectedEmploymentTypes : undefined,
      experienceLevel: selectedExperienceLevels.length > 0 ? selectedExperienceLevels : undefined
    };

    setStoreSearchParams(params);
    loadJobs(params);

    // URL 업데이트
    const newSearchParams = new URLSearchParams();
    if (searchKeyword) newSearchParams.set('keyword', searchKeyword);
    if (selectedLocation) newSearchParams.set('location', selectedLocation);
    setSearchParams(newSearchParams);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params = { ...storeSearchParams, page };
    setStoreSearchParams(params);
    loadJobs(params);
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedLocation('');
    setSelectedEmploymentTypes([]);
    setSelectedExperienceLevels([]);
    setStoreSearchParams({ page: 0 });
    loadJobs({ page: 0 });
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEmployer ? '구인 관리' : '구인 정보'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEmployer 
              ? '등록한 구인 공고를 관리하고 지원자를 확인하세요'
              : '원하는 일자리를 찾아보세요'
            }
          </p>
        </div>
        {isEmployer && (
          <div className="mt-4 sm:mt-0">
            <Link to="/jobs/create">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                새 공고 등록
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 검색바 */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="직무, 회사, 키워드 검색..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                필터
              </Button>
              <Button variant="primary" onClick={handleSearch}>
                검색
              </Button>
            </div>

            {/* 필터 옵션 */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 지역 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      지역
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                    >
                      <option value="">전체 지역</option>
                      <option value="서울">서울</option>
                      <option value="경기">경기</option>
                      <option value="인천">인천</option>
                      <option value="부산">부산</option>
                      <option value="대구">대구</option>
                      <option value="대전">대전</option>
                      <option value="광주">광주</option>
                      <option value="울산">울산</option>
                      <option value="세종">세종</option>
                      <option value="강원">강원</option>
                      <option value="충북">충북</option>
                      <option value="충남">충남</option>
                      <option value="전북">전북</option>
                      <option value="전남">전남</option>
                      <option value="경북">경북</option>
                      <option value="경남">경남</option>
                      <option value="제주">제주</option>
                    </select>
                  </div>

                  {/* 고용 형태 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      고용 형태
                    </label>
                    <div className="space-y-2">
                      {Object.entries(employmentTypeLabels).map(([type, label]) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedEmploymentTypes.includes(type as EmploymentType)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmploymentTypes([...selectedEmploymentTypes, type as EmploymentType]);
                              } else {
                                setSelectedEmploymentTypes(selectedEmploymentTypes.filter(t => t !== type));
                              }
                            }}
                            className="w-4 h-4 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 경력 수준 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      경력 수준
                    </label>
                    <div className="space-y-2">
                      {Object.entries(experienceLevelLabels).map(([level, label]) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedExperienceLevels.includes(level as ExperienceLevel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExperienceLevels([...selectedExperienceLevels, level as ExperienceLevel]);
                              } else {
                                setSelectedExperienceLevels(selectedExperienceLevels.filter(l => l !== level));
                              }
                            }}
                            className="w-4 h-4 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={handleResetFilters}>
                    초기화
                  </Button>
                  <Button variant="primary" onClick={handleSearch}>
                    필터 적용
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 에러 메시지 */}
      {jobsError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{jobsError}</span>
          <button
            onClick={clearJobsError}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* 검색 결과 정보 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold text-elderberry-600">{jobsTotalElements}</span>개의 공고가 있습니다
          {searchKeyword && (
            <span> ('{searchKeyword}' 검색 결과)</span>
          )}
        </p>
      </div>

      {/* 구인 공고 목록 */}
      {jobsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            다른 키워드로 검색하거나 필터를 조정해보세요
          </p>
          <Button variant="outline" onClick={handleResetFilters}>
            검색 조건 초기화
          </Button>
        </div>
      )}

      {/* 페이지네이션 */}
      {jobsTotalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={jobsCurrentPage === 0}
              onClick={() => handlePageChange(jobsCurrentPage - 1)}
            >
              이전
            </Button>
            
            {[...Array(Math.min(5, jobsTotalPages))].map((_, index) => {
              const pageIndex = Math.max(0, Math.min(jobsCurrentPage - 2, jobsTotalPages - 5)) + index;
              if (pageIndex >= jobsTotalPages) return null;
              
              return (
                <Button
                  key={pageIndex}
                  variant={pageIndex === jobsCurrentPage ? 'primary' : 'outline'}
                  onClick={() => handlePageChange(pageIndex)}
                >
                  {pageIndex + 1}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              disabled={jobsCurrentPage >= jobsTotalPages - 1}
              onClick={() => handlePageChange(jobsCurrentPage + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}