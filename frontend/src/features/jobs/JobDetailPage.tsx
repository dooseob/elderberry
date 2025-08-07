/**
 * 구인 공고 상세 페이지
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  Send,
  Share2,
  Star,
  Trash2,
  Users
} from '../../components/icons/LucideIcons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJobStore } from '../../stores/jobStore';
import { useAuthStore } from '../../stores/authStore';
import { Job, ApplicationStatus, JobApplicationCreateRequest } from '../../types/job';
import { MemberRole } from '../../types/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { applicationService } from '../../services/jobApi';

// 고용 형태 한글 매핑
const employmentTypeLabels = {
  FULL_TIME: '정규직',
  PART_TIME: '시간제',
  CONTRACT: '계약직',
  TEMPORARY: '임시직'
};

// 경력 수준 한글 매핑
const experienceLevelLabels = {
  ENTRY: '신입',
  JUNIOR: '1-3년',
  MID: '3-7년',
  SENIOR: '7년 이상',
  EXPERT: '전문가'
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
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 마감일 계산 함수
const getDaysUntilDeadline = (deadlineString?: string) => {
  if (!deadlineString) return null;
  
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: '마감됨', color: 'text-red-600', urgent: false };
  if (diffDays === 0) return { text: '오늘 마감', color: 'text-red-600', urgent: true };
  if (diffDays === 1) return { text: '내일 마감', color: 'text-orange-600', urgent: true };
  if (diffDays <= 7) return { text: `${diffDays}일 후 마감`, color: 'text-orange-600', urgent: true };
  
  return { text: `${diffDays}일 후 마감`, color: 'text-green-600', urgent: false };
};

// 지원 모달 컴포넌트
interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: JobApplicationCreateRequest) => Promise<void>;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ job, isOpen, onClose, onSubmit }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coverLetter.trim()) {
      alert('자기소개서를 작성해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // TODO: 이력서 파일 업로드 구현
      const resumeUrl = resumeFile ? 'uploaded-resume-url' : undefined;
      
      await onSubmit({
        jobId: job.id,
        coverLetter: coverLetter.trim(),
        resumeUrl
      });
      
      onClose();
      setCoverLetter('');
      setResumeFile(null);
    } catch (error) {
      console.error('지원서 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">지원서 작성</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.facilityName || job.employerName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 자기소개서 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개서 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="지원 동기, 관련 경험, 포부 등을 작성해주세요."
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {coverLetter.length}/1000자
              </p>
            </div>

            {/* 이력서 첨부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이력서 첨부 (선택)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX 파일만 업로드 가능합니다.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '제출 중...' : '지원하기'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentJob: job,
    jobsLoading,
    jobsError,
    loadJob,
    deleteJob,
    submitApplication,
    clearJobsError
  } = useJobStore();

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);

  const jobId = parseInt(id || '0');
  const isEmployer = user?.role === MemberRole.EMPLOYER;
  const isMyJob = job && isEmployer && job.employerId === user?.id;
  const canApply = user?.role === MemberRole.CAREGIVER && job && !hasApplied;

  // 구인 공고 로드
  useEffect(() => {
    if (jobId) {
      loadJob(jobId);
    }
  }, [jobId]);

  // 지원 여부 확인
  useEffect(() => {
    const checkApplication = async () => {
      if (!job || user?.role !== MemberRole.CAREGIVER) return;
      
      try {
        setCheckingApplication(true);
        const result = await applicationService.checkApplicationExists(job.id);
        setHasApplied(result.exists);
        setApplicationId(result.applicationId || null);
      } catch (error) {
        console.error('지원 여부 확인 실패:', error);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplication();
  }, [job, user]);

  // 구인 공고 삭제
  const handleDelete = async () => {
    if (!job) return;
    
    if (window.confirm('정말로 이 구인 공고를 삭제하시겠습니까?')) {
      try {
        await deleteJob(job.id);
        navigate('/jobs');
      } catch (error) {
        console.error('구인 공고 삭제 실패:', error);
      }
    }
  };

  // 지원서 제출
  const handleApplicationSubmit = async (request: JobApplicationCreateRequest) => {
    try {
      await submitApplication(request);
      setHasApplied(true);
      alert('지원서가 성공적으로 제출되었습니다!');
    } catch (error) {
      alert('지원서 제출에 실패했습니다. 다시 시도해주세요.');
      throw error;
    }
  };

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: job?.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  if (jobsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (jobsError || !job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">구인 공고를 찾을 수 없습니다</h3>
        <p className="text-gray-600 mb-4">
          {jobsError || '요청한 구인 공고가 존재하지 않거나 삭제되었습니다.'}
        </p>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>
          <Link to="/jobs">
            <Button variant="primary">구인 목록 보기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const deadlineInfo = getDaysUntilDeadline(job.applicationDeadline);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
          
          {!isEmployer && (
            <Button variant="outline">
              <Bookmark className="w-4 h-4 mr-2" />
              북마크
            </Button>
          )}
          
          {isMyJob && (
            <>
              <Link to={`/jobs/${job.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 구인 공고 헤더 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
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
                  
                  <div className="flex items-center text-gray-600 space-x-4 mb-4">
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
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

                  <div className="flex items-center space-x-6 text-sm">
                    <span className="flex items-center text-green-600 font-semibold">
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
                    <span className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(job.postedDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 마감일 정보 */}
              {deadlineInfo && (
                <div className={`flex items-center p-3 rounded-lg ${
                  deadlineInfo.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <AlertCircle className={`w-4 h-4 mr-2 ${deadlineInfo.color}`} />
                  <span className={`text-sm font-medium ${deadlineInfo.color}`}>
                    {deadlineInfo.text}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 구인 공고 내용 */}
          <Card>
            <CardHeader>
              <CardTitle>구인 내용</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {/* 자격 요건 */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>자격 요건</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 복리후생 */}
          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>복리후생</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="w-4 h-4 text-elderberry-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 태그 */}
          {job.tags && job.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>관련 태그</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-elderberry-100 text-elderberry-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 지원하기 카드 */}
          {canApply && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">이 공고에 지원하기</h3>
                {checkingApplication ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-elderberry-600 mx-auto"></div>
                  </div>
                ) : hasApplied ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">지원 완료</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      이미 이 공고에 지원하셨습니다.
                    </p>
                    {applicationId && (
                      <Link to={`/applications/${applicationId}`}>
                        <Button variant="outline" fullWidth>
                          지원서 확인
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setShowApplicationModal(true)}
                    disabled={job.status !== 'OPEN'}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    지원하기
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* 구인 정보 요약 */}
          <Card>
            <CardHeader>
              <CardTitle>구인 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">고용 형태</span>
                <span className="font-medium">{employmentTypeLabels[job.employmentType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">경력</span>
                <span className="font-medium">{experienceLevelLabels[job.experienceLevel]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">급여</span>
                <span className="font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">근무 일정</span>
                <span className="font-medium">{job.workSchedule}</span>
              </div>
              {job.applicationDeadline && (
                <div className="flex justify-between">
                  <span className="text-gray-600">마감일</span>
                  <span className="font-medium">{formatDate(job.applicationDeadline)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>연락처</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-700">{job.contactEmail}</span>
              </div>
              {job.contactPhone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">{job.contactPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 관리자 액션 */}
          {isMyJob && (
            <Card>
              <CardHeader>
                <CardTitle>관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={`/jobs/${job.id}/applications`}>
                  <Button variant="outline" fullWidth>
                    <Users className="w-4 h-4 mr-2" />
                    지원자 관리 ({job.applicationCount})
                  </Button>
                </Link>
                <Link to={`/jobs/${job.id}/edit`}>
                  <Button variant="outline" fullWidth>
                    <Edit className="w-4 h-4 mr-2" />
                    공고 수정
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 지원 모달 */}
      <ApplicationModal
        job={job}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
}