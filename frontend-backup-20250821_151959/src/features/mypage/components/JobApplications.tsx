/**
 * 구직/구인 지원 현황 컴포넌트
 * 사용자의 구직 지원 내역과 구인 공고 관리 기능 제공
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Building2,
  Star,
  TrendingUp,
  Eye,
  Edit3,
  Plus,
  FileText,
  ChevronRight,
  Award,
  Users
} from '../../../components/icons/LucideIcons';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { useAuthStore } from '../../../stores/authStore';
import { useJobStore } from '../../../stores/jobStore';

interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  facilityName: string;
  facilityLocation: string;
  applicationStatus: ApplicationStatus;
  applicationDate: string;
  reviewDate?: string;
  interviewDate?: string;
  salary: number;
  workType: string;
  workSchedule: string;
  requirements: string[];
  benefits: string[];
  notes?: string;
  rejectionReason?: string;
  contractStartDate?: string;
  contractEndDate?: string;
}

interface JobPosting {
  id: number;
  title: string;
  description: string;
  facilityName: string;
  location: string;
  salary: number;
  workType: string;
  workSchedule: string;
  requirements: string[];
  benefits: string[];
  status: PostingStatus;
  createdDate: string;
  closingDate: string;
  applicantCount: number;
  viewCount: number;
  isActive: boolean;
}

type ApplicationStatus = 
  | 'SUBMITTED'    // 지원 완료
  | 'REVIEWING'    // 검토 중
  | 'INTERVIEW'    // 면접 진행
  | 'ACCEPTED'     // 합격
  | 'REJECTED'     // 불합격
  | 'WITHDRAWN'    // 지원 취소
  | 'EXPIRED';     // 만료됨

type PostingStatus = 
  | 'ACTIVE'       // 활성
  | 'PAUSED'       // 일시중지
  | 'CLOSED'       // 마감
  | 'DRAFT';       // 임시저장

interface JobFilter {
  status: ApplicationStatus | PostingStatus | 'ALL';
  workType: string;
  searchQuery: string;
  dateRange: 'all' | '1month' | '3month' | '6month' | '1year';
  sortBy: 'latest' | 'oldest' | 'salary_high' | 'salary_low' | 'status';
}

/**
 * 구직/구인 지원 현황 컴포넌트
 */
export const JobApplications: React.FC = () => {
  // 상태 관리
  const { user } = useAuthStore();
  const { jobs, applications, loading, fetchApplications, fetchMyJobs } = useJobStore();
  const [activeTab, setActiveTab] = useState<'applications' | 'postings'>('applications');
  const [filter, setFilter] = useState<JobFilter>({
    status: 'ALL',
    workType: '',
    searchQuery: '',
    dateRange: 'all',
    sortBy: 'latest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<JobApplication | JobPosting | null>(null);

  // 더미 데이터
  const [dummyApplications] = useState<JobApplication[]>([
    {
      id: 1,
      jobId: 1,
      jobTitle: '요양보호사 (주간 근무)',
      facilityName: '서울시립요양원',
      facilityLocation: '서울시 강남구',
      applicationStatus: 'INTERVIEW',
      applicationDate: '2024-01-20',
      reviewDate: '2024-01-22',
      interviewDate: '2024-01-25',
      salary: 2800000,
      workType: '정규직',
      workSchedule: '주간 근무 (08:00-17:00)',
      requirements: ['요양보호사 자격증', '경력 1년 이상'],
      benefits: ['4대보험', '퇴직금', '성과급'],
      notes: '경력 우대로 면접 기회 제공'
    },
    {
      id: 2,
      jobId: 2,
      jobTitle: '간병인 (야간 근무)',
      facilityName: '행복한 요양병원',
      facilityLocation: '서울시 서초구',
      applicationStatus: 'REJECTED',
      applicationDate: '2024-01-15',
      reviewDate: '2024-01-18',
      salary: 2500000,
      workType: '계약직',
      workSchedule: '야간 근무 (22:00-08:00)',
      requirements: ['간병인 경험', '야간 근무 가능'],
      benefits: ['야간 수당', '교통비 지원'],
      rejectionReason: '야간 근무 경험 부족으로 부적합 판정'
    }
  ]);

  const [dummyPostings] = useState<JobPosting[]>([
    {
      id: 1,
      title: '경력직 요양보호사 모집',
      description: '노인 케어 전문 시설에서 함께 일할 경력직 요양보호사를 모집합니다.',
      facilityName: '우리요양원',
      location: '서울시 송파구',
      salary: 3000000,
      workType: '정규직',
      workSchedule: '주간 근무',
      requirements: ['요양보호사 자격증', '경력 2년 이상'],
      benefits: ['4대보험', '퇴직금', '성과급', '교육비 지원'],
      status: 'ACTIVE',
      createdDate: '2024-01-10',
      closingDate: '2024-02-10',
      applicantCount: 15,
      viewCount: 120,
      isActive: true
    }
  ]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (user?.role === 'CAREGIVER') {
      fetchApplications();
    } else if (user?.role === 'EMPLOYER') {
      fetchMyJobs();
    }
  }, [user, fetchApplications, fetchMyJobs]);

  // 역할에 따른 탭 표시
  const getTabs = () => {
    const tabs = [];
    
    if (user?.role === 'CAREGIVER') {
      tabs.push({
        key: 'applications' as const,
        label: '지원 현황',
        count: dummyApplications.length
      });
    }
    
    if (user?.role === 'EMPLOYER') {
      tabs.push({
        key: 'postings' as const,
        label: '구인 공고',
        count: dummyPostings.length
      });
    }

    return tabs;
  };

  // 상태별 배지 정보
  const getApplicationStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          label: '지원 완료'
        };
      case 'REVIEWING':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          label: '검토 중'
        };
      case 'INTERVIEW':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: User,
          label: '면접 진행'
        };
      case 'ACCEPTED':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: '합격'
        };
      case 'REJECTED':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          label: '불합격'
        };
      case 'WITHDRAWN':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle,
          label: '지원 취소'
        };
      case 'EXPIRED':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: '만료됨'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          label: '알 수 없음'
        };
    }
  };

  // 구인공고 상태별 배지 정보
  const getPostingStatusInfo = (status: PostingStatus) => {
    switch (status) {
      case 'ACTIVE':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: '모집 중'
        };
      case 'PAUSED':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          label: '일시중지'
        };
      case 'CLOSED':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: XCircle,
          label: '모집 완료'
        };
      case 'DRAFT':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: FileText,
          label: '임시저장'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          label: '알 수 없음'
        };
    }
  };

  // 통계 정보
  const getApplicationStatistics = () => {
    const total = dummyApplications.length;
    const interview = dummyApplications.filter(a => a.applicationStatus === 'INTERVIEW').length;
    const accepted = dummyApplications.filter(a => a.applicationStatus === 'ACCEPTED').length;
    const pending = dummyApplications.filter(a => 
      ['SUBMITTED', 'REVIEWING'].includes(a.applicationStatus)
    ).length;

    return { total, interview, accepted, pending };
  };

  const getPostingStatistics = () => {
    const total = dummyPostings.length;
    const active = dummyPostings.filter(p => p.status === 'ACTIVE').length;
    const totalApplicants = dummyPostings.reduce((sum, p) => sum + p.applicantCount, 0);
    const totalViews = dummyPostings.reduce((sum, p) => sum + p.viewCount, 0);

    return { total, active, totalApplicants, totalViews };
  };

  const tabs = getTabs();
  const appStats = getApplicationStatistics();
  const postStats = getPostingStatistics();

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      {tabs.length > 1 && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* 지원 현황 탭 */}
      {activeTab === 'applications' && (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Briefcase className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{appStats.total}</div>
              <div className="text-sm text-gray-600">총 지원</div>
            </Card>
            <Card className="p-4 text-center">
              <User className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{appStats.interview}</div>
              <div className="text-sm text-gray-600">면접 진행</div>
            </Card>
            <Card className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{appStats.accepted}</div>
              <div className="text-sm text-gray-600">합격</div>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{appStats.pending}</div>
              <div className="text-sm text-gray-600">대기 중</div>
            </Card>
          </div>

          {/* 지원 목록 */}
          <div className="space-y-4">
            {dummyApplications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  지원한 공고가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  관심 있는 구인 공고에 지원해보세요.
                </p>
                <Button href="/jobs">구인공고 보기</Button>
              </div>
            ) : (
              dummyApplications.map((application) => {
                const statusInfo = getApplicationStatusInfo(application.applicationStatus);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{application.jobTitle}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center space-x-1`}>
                              <StatusIcon className="h-4 w-4" />
                              <span>{statusInfo.label}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span>{application.facilityName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{application.facilityLocation}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{application.salary.toLocaleString()}원</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span><strong>근무형태:</strong> {application.workType}</span>
                            <span><strong>근무시간:</strong> {application.workSchedule}</span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>지원일: {new Date(application.applicationDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItem(application)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>상세보기</span>
                        </Button>
                      </div>

                      {/* 상태별 추가 정보 */}
                      {application.applicationStatus === 'INTERVIEW' && application.interviewDate && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>면접 일정:</strong> {new Date(application.interviewDate).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {application.applicationStatus === 'REJECTED' && application.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>불합격 사유:</strong> {application.rejectionReason}
                          </p>
                        </div>
                      )}

                      {application.notes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>메모:</strong> {application.notes}
                          </p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 구인 공고 탭 */}
      {activeTab === 'postings' && (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Building2 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{postStats.total}</div>
              <div className="text-sm text-gray-600">총 공고</div>
            </Card>
            <Card className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{postStats.active}</div>
              <div className="text-sm text-gray-600">활성 공고</div>
            </Card>
            <Card className="p-4 text-center">
              <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{postStats.totalApplicants}</div>
              <div className="text-sm text-gray-600">총 지원자</div>
            </Card>
            <Card className="p-4 text-center">
              <Eye className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{postStats.totalViews}</div>
              <div className="text-sm text-gray-600">총 조회수</div>
            </Card>
          </div>

          {/* 새 공고 작성 버튼 */}
          <div className="flex justify-end">
            <Button href="/jobs/create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>새 공고 작성</span>
            </Button>
          </div>

          {/* 구인공고 목록 */}
          <div className="space-y-4">
            {dummyPostings.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  등록된 구인공고가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  첫 번째 구인공고를 작성해보세요.
                </p>
                <Button href="/jobs/create">공고 작성하기</Button>
              </div>
            ) : (
              dummyPostings.map((posting) => {
                const statusInfo = getPostingStatusInfo(posting.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={posting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{posting.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center space-x-1`}>
                              <StatusIcon className="h-4 w-4" />
                              <span>{statusInfo.label}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{posting.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{posting.salary.toLocaleString()}원</span>
                            </div>
                            <span><strong>근무형태:</strong> {posting.workType}</span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>지원자 {posting.applicantCount}명</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>조회수 {posting.viewCount}회</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>마감일: {new Date(posting.closingDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 line-clamp-2">{posting.description}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            href={`/jobs/${posting.id}/edit`}
                            className="flex items-center space-x-1"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>수정</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItem(posting)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>상세보기</span>
                          </Button>
                        </div>
                      </div>

                      {/* 모집 요건 */}
                      {posting.requirements.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {posting.requirements.map((req, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 상세 정보 모달 */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {'jobTitle' in selectedItem ? '지원 상세 정보' : '공고 상세 정보'}
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                >
                  닫기
                </Button>
              </div>

              <div className="space-y-6">
                {/* 상세 정보는 실제 구현 시 각 타입에 맞게 표시 */}
                <div className="text-sm text-gray-600">
                  상세 정보 컴포넌트는 실제 개발 시 구현됩니다.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};