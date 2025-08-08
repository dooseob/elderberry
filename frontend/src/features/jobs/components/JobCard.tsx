import React from 'react';
import {
  Briefcase,
  Clock,
  Heart,
  MapPin,
  Zap,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Job } from '@/entities/job';
import { EMPLOYMENT_TYPE_TEXT, EXPERIENCE_LEVEL_TEXT } from '@/entities/job';
import { Card, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';

interface JobCardProps {
  job: Job;
  onJobClick?: (jobId: number) => void;
  onBookmark?: (jobId: number) => void;
  isBookmarked?: boolean;
  showBookmark?: boolean;
  compact?: boolean;
  animationDelay?: number;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onJobClick,
  onBookmark,
  isBookmarked = false,
  showBookmark = true,
  compact = false,
  animationDelay = 0,
}) => {
  const handleClick = () => {
    onJobClick?.(job.id);
  };

  const handleBookmark = (event: React.MouseEvent) => {
    event.stopPropagation();
    onBookmark?.(job.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="w-full"
    >
      <Card 
        className={`hover:shadow-lg transition-all duration-200 cursor-pointer group relative ${
          compact ? 'h-auto' : 'h-full'
        }`}
        onClick={handleClick}
      >
        {/* 급구 배지 */}
        {job.isUrgent && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              급구
            </div>
          </div>
        )}
        
        {/* 북마크 버튼 */}
        {showBookmark && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all ${
                isBookmarked 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-elderberry-400 hover:text-elderberry-600 hover:bg-elderberry-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        <CardContent className={`${compact ? 'p-4' : 'p-6'} ${job.isUrgent || showBookmark ? 'pt-12' : ''}`}>
          <div className="h-full flex flex-col">
            {/* 제목 및 시설명 */}
            <div className="mb-4 flex-shrink-0">
              <h3 className={`font-semibold text-elderberry-900 group-hover:text-elderberry-700 transition-colors mb-2 line-clamp-2 ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {job.title}
              </h3>
              <div className="flex items-center gap-1 text-elderberry-600">
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <span className={`font-medium truncate ${compact ? 'text-sm' : 'text-base'}`}>
                  {job.facilityName}
                </span>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-2 mb-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-elderberry-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 flex-shrink-0 text-elderberry-600" />
                <span className={`font-bold text-elderberry-900 ${compact ? 'text-base' : 'text-lg'}`}>
                  {job.salary}
                </span>
              </div>

              {job.workSchedule && (
                <div className="flex items-center gap-2 text-sm text-elderberry-600">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{job.workSchedule}</span>
                </div>
              )}
            </div>

            {/* 태그 */}
            {(job.employmentType || job.experienceLevel) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
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

            {/* 하단 정보 */}
            <div className="flex items-center justify-between text-xs text-elderberry-500 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '오늘'}
              </div>
              {job.deadline && (
                <div className="text-red-600 font-medium">
                  마감: {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* 컴팩트 모드가 아닐 때 상세보기 버튼 */}
            {!compact && (
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  상세보기
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { JobCard };