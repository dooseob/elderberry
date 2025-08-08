import React from 'react';
import {
  Calendar,
  Eye,
  FileText,
  MapPin,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { JobApplication, JobApplicationStatus } from '@/entities/job';
import { JOB_APPLICATION_STATUS_TEXT, JOB_APPLICATION_STATUS_COLORS } from '@/entities/job';
import { Card, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';

interface ApplicationCardProps {
  application: JobApplication;
  onViewDetail?: (applicationId: number) => void;
  onWithdraw?: (applicationId: number) => void;
  showActions?: boolean;
  compact?: boolean;
  animationDelay?: number;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewDetail,
  onWithdraw,
  showActions = true,
  compact = false,
  animationDelay = 0,
}) => {
  const statusColors = JOB_APPLICATION_STATUS_COLORS[application.status];

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

  const canWithdraw = (status: JobApplicationStatus) => {
    return status === 'UNDER_REVIEW' || status === 'INTERVIEW_SCHEDULED';
  };

  const handleViewDetail = () => {
    onViewDetail?.(application.id);
  };

  const handleWithdraw = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('정말로 지원을 철회하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
      onWithdraw?.(application.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="w-full"
    >
      <Card 
        className={`hover:shadow-lg transition-all duration-200 ${
          onViewDetail ? 'cursor-pointer' : ''
        } group`}
        onClick={onViewDetail ? handleViewDetail : undefined}
      >
        <CardContent className={compact ? 'p-4' : 'p-6'}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* 제목 및 상태 */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-elderberry-900 group-hover:text-elderberry-700 transition-colors mb-1 ${
                    compact ? 'text-base' : 'text-lg'
                  }`}>
                    {application.jobTitle}
                  </h3>
                  <div className="flex items-center gap-1 text-elderberry-600">
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span className={`font-medium truncate ${compact ? 'text-sm' : 'text-base'}`}>
                      {application.facilityName}
                    </span>
                  </div>
                </div>
                
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} flex-shrink-0`}>
                  {getStatusIcon(application.status)}
                  {JOB_APPLICATION_STATUS_TEXT[application.status]}
                </div>
              </div>
              
              {/* 기본 정보 */}
              <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-2 lg:grid-cols-3 gap-4'} mb-4`}>
                <div className="flex items-center gap-2 text-sm text-elderberry-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{application.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 flex-shrink-0 text-elderberry-600" />
                  <span className="font-medium text-elderberry-900">{application.salary}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-elderberry-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {application.applicationDate ? 
                    new Date(application.applicationDate).toLocaleDateString() :
                    '날짜 없음'
                  }
                </div>
              </div>

              {/* 면접 일정 */}
              {application.interviewDate && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">면접 일정:</span>
                    <span>{new Date(application.interviewDate).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* 메모 */}
              {application.notes && (
                <div className="mb-3 p-2 bg-elderberry-50 border border-elderberry-200 rounded-lg">
                  <div className="flex items-start gap-2 text-elderberry-700 text-sm">
                    <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{application.notes}</span>
                  </div>
                </div>
              )}

              {/* 마지막 업데이트 */}
              {application.lastUpdated && (
                <div className="text-xs text-elderberry-500">
                  마지막 업데이트: {new Date(application.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            {showActions && (
              <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewDetail ? undefined : () => {
                    // Navigate to job detail
                    window.location.href = `/jobs/${application.jobId || application.id}`;
                  }}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  {compact ? '보기' : '상세보기'}
                </Button>

                {canWithdraw(application.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWithdraw}
                    className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    {compact ? '철회' : '지원철회'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 진행률 바 (상태별) */}
          {!compact && (
            <div className="mt-4 pt-4 border-t border-elderberry-100">
              <div className="flex items-center justify-between text-xs text-elderberry-500 mb-2">
                <span>진행 상황</span>
                <span>{JOB_APPLICATION_STATUS_TEXT[application.status]}</span>
              </div>
              
              <div className="w-full bg-elderberry-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    application.status === 'ACCEPTED' ? 'bg-green-500 w-full' :
                    application.status === 'REJECTED' ? 'bg-red-500 w-full' :
                    application.status === 'WITHDRAWN' ? 'bg-gray-500 w-1/4' :
                    application.status === 'INTERVIEW_COMPLETED' ? 'bg-purple-500 w-4/5' :
                    application.status === 'INTERVIEW_SCHEDULED' ? 'bg-blue-500 w-3/5' :
                    'bg-yellow-500 w-2/5' // UNDER_REVIEW
                  }`}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { ApplicationCard };