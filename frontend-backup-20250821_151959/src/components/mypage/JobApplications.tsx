/**
 * 지원 현황 컴포넌트
 * 구직 지원서 목록, 상태 추적, 관리 기능을 제공
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  FileText,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  ExternalLink,
  Download,
  Edit,
  Trash2,
  Filter,
  Search,
  TrendingUp,
  Users,
  Target,
  Send
} from '../icons/LucideIcons';

import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { JobApplication } from '../../types/job';
import { useJobStore } from '../../stores/jobStore';

interface JobApplicationsProps {
  applications: JobApplication[];
}

const JobApplications: React.FC<JobApplicationsProps> = ({ applications }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { withdrawApplication, loading } = useJobStore();

  // 지원서 필터링
  const filteredApplications = React.useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // 통계 계산
  const stats = React.useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'PENDING').length;
    const interviewing = applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length;
    const hired = applications.filter(app => app.status === 'HIRED').length;
    const rejected = applications.filter(app => app.status === 'REJECTED').length;

    return {
      total,
      pending,
      interviewing,
      hired,
      rejected,
      responseRate: total > 0 ? Math.round(((total - pending) / total) * 100) : 0
    };
  }, [applications]);

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: Clock,
          label: '검토중'
        };
      case 'REVIEWED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: Eye,
          label: '검토완료'
        };
      case 'INTERVIEW_SCHEDULED':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: Calendar,
          label: '면접예정'
        };
      case 'HIRED':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircle,
          label: '채용'
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: XCircle,
          label: '불합격'
        };
      case 'WITHDRAWN':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: Pause,
          label: '철회'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: AlertCircle,
          label: '알 수 없음'
        };
    }
  };

  // 지원서 철회
  const handleWithdrawApplication = async (applicationId: number) => {
    if (window.confirm('정말로 지원서를 철회하시겠습니까?')) {
      try {
        await withdrawApplication(applicationId);
      } catch (error) {
        console.error('지원서 철회 실패:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 지원</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}건</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">검토중</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}건</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">면접예정</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interviewing}건</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">채용</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hired}건</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 응답률 카드 */}
      <Card className="bg-gradient-to-r from-elderberry-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">지원 응답률</h3>
              <p className="text-3xl font-bold text-elderberry-600">{stats.responseRate}%</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.total - stats.pending}개 지원서에 응답 받음
              </p>
            </div>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-elderberry-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="회사명이나 직책으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>필터</span>
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-gray-200"
              >
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">전체 상태</option>
                  <option value="PENDING">검토중</option>
                  <option value="REVIEWED">검토완료</option>
                  <option value="INTERVIEW_SCHEDULED">면접예정</option>
                  <option value="HIRED">채용</option>
                  <option value="REJECTED">불합격</option>
                  <option value="WITHDRAWN">철회</option>
                </select>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 지원서 목록 */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter ? '검색 결과가 없습니다' : '지원한 내역이 없습니다'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter 
                  ? '다른 검색어나 필터를 시도해보세요.'
                  : '관심 있는 구인공고에 지원해보세요.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application, index) => {
            const statusStyle = getStatusStyle(application.status);
            const StatusIcon = statusStyle.icon;

            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.jobTitle}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} flex items-center space-x-1`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusStyle.label}</span>
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{application.companyName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{application.location}</span>
                            </span>
                            {application.salary && (
                              <span className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{application.salary}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>지원일: {new Date(application.appliedAt).toLocaleDateString('ko-KR')}</span>
                          </span>
                          {application.updatedAt && application.updatedAt !== application.appliedAt && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>최종수정: {new Date(application.updatedAt).toLocaleDateString('ko-KR')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>상세보기</span>
                        </Button>
                        
                        {application.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdrawApplication(application.id)}
                            disabled={loading.applicationsLoading}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>철회</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 면접 일정이 있는 경우 */}
                    {application.interviewDate && (
                      <div className="bg-purple-50 rounded-lg p-4 mb-4 border-l-4 border-purple-400">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-purple-900 mb-1">면접 일정</h4>
                            <p className="text-purple-800">
                              {new Date(application.interviewDate).toLocaleString('ko-KR')}
                            </p>
                            {application.interviewLocation && (
                              <p className="text-sm text-purple-700 mt-1">
                                장소: {application.interviewLocation}
                              </p>
                            )}
                          </div>
                          {application.interviewType && (
                            <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium">
                              {application.interviewType === 'ONLINE' ? '온라인' : 
                               application.interviewType === 'PHONE' ? '전화' : '대면'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 피드백이 있는 경우 */}
                    {application.feedback && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">피드백</h4>
                        <p className="text-blue-800 text-sm">{application.feedback}</p>
                      </div>
                    )}

                    {/* 지원서 요약 */}
                    {application.coverLetter && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">지원 동기</h4>
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* 하단 액션 */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {application.resumeId && (
                          <button className="flex items-center space-x-1 hover:text-elderberry-600">
                            <FileText className="w-4 h-4" />
                            <span>이력서 보기</span>
                          </button>
                        )}
                        {application.portfolioUrl && (
                          <button className="flex items-center space-x-1 hover:text-elderberry-600">
                            <ExternalLink className="w-4 h-4" />
                            <span>포트폴리오</span>
                          </button>
                        )}
                      </div>

                      {application.status === 'HIRED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>계약서 확인</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JobApplications;