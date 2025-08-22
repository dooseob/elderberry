import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Heart,
  Loader2,
  MapPin,
  Phone,
  Save,
  Send,
  Star,
  Users,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jobApi } from '../../entities/job';
import type { Job, JobApplyRequest } from '../../entities/job';
import { EMPLOYMENT_TYPE_TEXT, EXPERIENCE_LEVEL_TEXT } from '../../entities/job';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { useAuthStore } from '../../stores/authStore';

// 지원서 폼 스키마
const applicationSchema = z.object({
  coverLetter: z.string()
    .min(50, '자기소개서는 최소 50자 이상 작성해주세요')
    .max(1000, '자기소개서는 최대 1000자까지 작성 가능합니다'),
  expectedSalary: z.string().optional(),
  startDate: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobDetailPageProps {}

const JobDetailPage: React.FC<JobDetailPageProps> = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
  });

  // 구인공고 상세 조회
  const {
    data: job,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobApi.getJobById(parseInt(jobId!)),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
  });

  // 지원하기 뮤테이션
  const applyMutation = useMutation({
    mutationFn: (data: JobApplyRequest) => jobApi.applyForJob(parseInt(jobId!), data),
    onSuccess: () => {
      alert('지원이 성공적으로 접수되었습니다!');
      setShowApplicationForm(false);
      reset();
      navigate('/jobs/my-applications');
    },
    onError: (error) => {
      console.error('지원 실패:', error);
      alert('지원 중 오류가 발생했습니다. 다시 시도해주세요.');
    },
  });

  const handleApply = (data: ApplicationFormData) => {
    if (!isAuthenticated) {
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/auth/signin');
      }
      return;
    }

    applyMutation.mutate({
      coverLetter: data.coverLetter,
      expectedSalary: data.expectedSalary,
      startDate: data.startDate,
      additionalInfo: data.additionalInfo,
    });
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/auth/signin');
      }
      return;
    }

    try {
      const response = await jobApi.toggleBookmark(parseInt(jobId!));
      setIsBookmarked(response.bookmarked);
    } catch (error) {
      console.error('북마크 처리 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-elderberry-25 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ErrorMessage
            message="구인공고를 불러오는 중 오류가 발생했습니다."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const coverLetter = watch('coverLetter') || '';

  return (
    <div className="min-h-screen bg-elderberry-25 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 상단 네비게이션 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            구인공고 목록
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 구인공고 헤더 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-elderberry-900">
                        {job.title}
                      </h1>
                      {job.isUrgent && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          급구
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-elderberry-600 mb-4">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-lg font-medium">{job.facilityName}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition-colors ${
                      isBookmarked 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-elderberry-50 text-elderberry-600 hover:bg-elderberry-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-elderberry-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-elderberry-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">급여</span>
                    </div>
                    <div className="font-semibold text-elderberry-900">{job.salary}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-elderberry-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">위치</span>
                    </div>
                    <div className="font-semibold text-elderberry-900 text-sm">{job.location}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-elderberry-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">근무형태</span>
                    </div>
                    <div className="font-semibold text-elderberry-900 text-sm">
                      {job.employmentType ? EMPLOYMENT_TYPE_TEXT[job.employmentType] : '-'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-elderberry-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">경력</span>
                    </div>
                    <div className="font-semibold text-elderberry-900 text-sm">
                      {job.experienceLevel ? EXPERIENCE_LEVEL_TEXT[job.experienceLevel] : '-'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>상세 정보</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {job.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-elderberry-900 mb-3">업무 내용</h3>
                      <div className="prose max-w-none">
                        <p className="text-elderberry-700 leading-relaxed whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {job.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold text-elderberry-900 mb-3">지원 자격</h3>
                      <div className="prose max-w-none">
                        <p className="text-elderberry-700 leading-relaxed whitespace-pre-line">
                          {job.requirements}
                        </p>
                      </div>
                    </div>
                  )}

                  {job.benefits && (
                    <div>
                      <h3 className="text-lg font-semibold text-elderberry-900 mb-3">복리후생</h3>
                      <div className="prose max-w-none">
                        <p className="text-elderberry-700 leading-relaxed whitespace-pre-line">
                          {job.benefits}
                        </p>
                      </div>
                    </div>
                  )}

                  {job.workSchedule && (
                    <div>
                      <h3 className="text-lg font-semibold text-elderberry-900 mb-3">근무 시간</h3>
                      <div className="prose max-w-none">
                        <p className="text-elderberry-700 leading-relaxed whitespace-pre-line">
                          {job.workSchedule}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 지원서 작성 폼 */}
            {showApplicationForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>지원서 작성</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit(handleApply)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-elderberry-700 mb-2">
                          자기소개서 *
                        </label>
                        <textarea
                          {...register('coverLetter')}
                          placeholder="본인의 경력과 지원 동기를 구체적으로 작성해주세요."
                          className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500 min-h-[120px]"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-elderberry-500">
                            {coverLetter.length}/1000자
                          </span>
                          {errors.coverLetter && (
                            <span className="text-xs text-red-600">
                              {errors.coverLetter.message}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-elderberry-700 mb-2">
                          희망 급여
                        </label>
                        <input
                          {...register('expectedSalary')}
                          type="text"
                          placeholder="예: 월 280만원"
                          className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-elderberry-700 mb-2">
                          입사 가능일
                        </label>
                        <input
                          {...register('startDate')}
                          type="date"
                          className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-elderberry-700 mb-2">
                          추가 사항
                        </label>
                        <textarea
                          {...register('additionalInfo')}
                          placeholder="기타 전달하고 싶은 내용이 있다면 작성해주세요."
                          className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowApplicationForm(false)}
                          className="flex-1"
                        >
                          취소
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={!isValid || applyMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          {applyMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              지원 중...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              지원하기
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 지원하기 버튼 */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {!showApplicationForm ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        if (!isAuthenticated) {
                          if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
                            navigate('/auth/signin');
                          }
                        } else {
                          setShowApplicationForm(true);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      지원하기
                    </Button>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-800 text-sm">
                        <FileText className="w-4 h-4" />
                        지원서를 작성 중입니다
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmark}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current text-red-600' : ''}`} />
                    {isBookmarked ? '북마크 해제' : '북마크 추가'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 시설 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>시설 정보</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-elderberry-600">시설명</div>
                    <div className="font-medium">{job.facilityName}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-elderberry-600">위치</div>
                    <div className="font-medium">{job.location}</div>
                  </div>
                  
                  {job.contactInfo && (
                    <div>
                      <div className="text-sm text-elderberry-600">연락처</div>
                      <div className="font-medium">{job.contactInfo}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 모집 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>모집 정보</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-elderberry-600">게시일</div>
                    <div className="font-medium">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '오늘'}
                    </div>
                  </div>
                  
                  {job.deadline && (
                    <div>
                      <div className="text-sm text-elderberry-600">마감일</div>
                      <div className="font-medium text-red-600">
                        {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  
                  {job.isUrgent && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        급구 채용입니다
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;