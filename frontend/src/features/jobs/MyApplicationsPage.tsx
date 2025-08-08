import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/entities/job';
import type { JobApplication, JobApplicationStatus, MyApplicationsParams } from '@/entities/job';
import { JOB_APPLICATION_STATUS_TEXT, JOB_APPLICATION_STATUS_COLORS } from '@/entities/job';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { LoadingSpinner } from '@/shared/ui';
import { ErrorMessage } from '@/shared/ui';

interface MyApplicationsPageProps {}

const MyApplicationsPage: React.FC<MyApplicationsPageProps> = () => {
  const [filters, setFilters] = useState<MyApplicationsParams>({
    page: 0,
    size: 10,
    sortBy: 'latest',
    sortOrder: 'desc',
  });
  const [selectedStatus, setSelectedStatus] = useState<JobApplicationStatus | ''>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-applications', filters],
    queryFn: () => jobApi.getMyApplications(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleStatusFilter = (status: JobApplicationStatus | '') => {
    setSelectedStatus(status);
    setFilters(prev => ({
      ...prev,
      page: 0,
      status: status || undefined,
    }));
  };

  const handleSort = (sortBy: 'latest' | 'status' | 'facility') => {
    setFilters(prev => ({
      ...prev,
      page: 0,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getStatusIcon = (status: JobApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_COMPLETED':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const filteredApplications = applicationsData?.content.filter(app => 
    searchKeyword ? 
      app.facilityName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchKeyword.toLowerCase())
    : true
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <ErrorMessage
            message="지원 내역을 불러오는 중 오류가 발생했습니다."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elderberry-900 mb-2">
            내 지원 현황
          </h1>
          <p className="text-elderberry-600">
            지원한 구인공고의 현재 상태를 확인하고 관리하세요
          </p>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* 검색 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-elderberry-400" />
                  <input
                    type="text"
                    placeholder="시설명, 직종으로 검색"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500 min-w-[200px]"
                  />
                </div>

                {/* 상태 필터 */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-elderberry-600" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusFilter(e.target.value as JobApplicationStatus | '')}
                    className="px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                  >
                    <option value="">전체 상태</option>
                    <option value="UNDER_REVIEW">검토중</option>
                    <option value="INTERVIEW_SCHEDULED">면접예정</option>
                    <option value="INTERVIEW_COMPLETED">면접완료</option>
                    <option value="ACCEPTED">합격</option>
                    <option value="REJECTED">불합격</option>
                    <option value="WITHDRAWN">지원철회</option>
                  </select>
                </div>

                {/* 정렬 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort('latest')}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      filters.sortBy === 'latest' 
                        ? 'bg-elderberry-100 text-elderberry-800' 
                        : 'text-elderberry-600 hover:bg-elderberry-50'
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => handleSort('status')}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      filters.sortBy === 'status' 
                        ? 'bg-elderberry-100 text-elderberry-800' 
                        : 'text-elderberry-600 hover:bg-elderberry-50'
                    }`}
                  >
                    상태순
                  </button>
                  <button
                    onClick={() => handleSort('facility')}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      filters.sortBy === 'facility' 
                        ? 'bg-elderberry-100 text-elderberry-800' 
                        : 'text-elderberry-600 hover:bg-elderberry-50'
                    }`}
                  >
                    시설명순
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  새로고침
                </Button>

                {applicationsData && (
                  <span className="text-sm text-elderberry-600">
                    총 {applicationsData.totalElements}개 지원
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-elderberry-900 mb-1">
                {applicationsData?.totalElements || 0}
              </div>
              <div className="text-sm text-elderberry-600">총 지원</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {filteredApplications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length}
              </div>
              <div className="text-sm text-elderberry-600">면접 예정</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {filteredApplications.filter(app => app.status === 'ACCEPTED').length}
              </div>
              <div className="text-sm text-elderberry-600">합격</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {filteredApplications.filter(app => app.status === 'UNDER_REVIEW').length}
              </div>
              <div className="text-sm text-elderberry-600">검토중</div>
            </CardContent>
          </Card>
        </div>

        {/* 지원 내역 목록 */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => {
              const statusColors = JOB_APPLICATION_STATUS_COLORS[application.status];
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-elderberry-900">
                              {application.jobTitle}
                            </h3>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                              {getStatusIcon(application.status)}
                              {JOB_APPLICATION_STATUS_TEXT[application.status]}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-elderberry-600 mb-3">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {application.facilityName}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {application.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {application.applicationDate ? 
                                new Date(application.applicationDate).toLocaleDateString() :
                                '날짜 없음'
                              }
                            </div>
                          </div>

                          <div className="text-lg font-medium text-elderberry-900 mb-2">
                            {application.salary}
                          </div>

                          {application.notes && (
                            <div className="text-sm text-elderberry-600 bg-elderberry-50 p-2 rounded">
                              💬 {application.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Navigate to job detail page
                              window.location.href = `/jobs/${application.jobId || application.id}`;
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            상세보기
                          </Button>

                          {(application.status === 'UNDER_REVIEW' || application.status === 'INTERVIEW_SCHEDULED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement withdraw functionality
                                if (confirm('정말로 지원을 철회하시겠습니까?')) {
                                  console.log('Withdraw application:', application.id);
                                }
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              지원철회
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-elderberry-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-elderberry-900 mb-2">
                {searchKeyword || selectedStatus ? '검색 조건에 맞는 지원 내역이 없습니다' : '지원한 내역이 없습니다'}
              </h3>
              <p className="text-elderberry-600 mb-6">
                {searchKeyword || selectedStatus ? 
                  '다른 조건으로 검색해보세요.' :
                  '관심 있는 구인공고에 지원해보세요.'
                }
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  if (searchKeyword || selectedStatus) {
                    setSearchKeyword('');
                    setSelectedStatus('');
                    handleStatusFilter('');
                  } else {
                    window.location.href = '/jobs';
                  }
                }}
              >
                {searchKeyword || selectedStatus ? '전체 보기' : '구인공고 보기'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 페이지네이션 */}
        {applicationsData && applicationsData.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={applicationsData.first}
              >
                이전
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, applicationsData.totalPages) }, (_, i) => {
                  const pageNum = filters.page! + i - 2;
                  if (pageNum < 0 || pageNum >= applicationsData.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded ${
                        pageNum === filters.page
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
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={applicationsData.last}
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

export default MyApplicationsPage;