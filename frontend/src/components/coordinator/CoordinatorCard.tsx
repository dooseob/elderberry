import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Globe, 
  Award, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone
} from 'lucide-react';
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CoordinatorMatch, CoordinatorLanguageSkill } from '@/services/coordinatorApi';

interface CoordinatorCardProps {
  coordinator: CoordinatorMatch;
  onSelect?: (coordinatorId: string) => void;
  onViewDetails?: (coordinatorId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

const CoordinatorCard: React.FC<CoordinatorCardProps> = ({
  coordinator,
  onSelect,
  onViewDetails,
  isSelected = false,
  showActions = true,
}) => {
  const {
    coordinatorId,
    name,
    matchScore,
    matchReason,
    experienceYears,
    successfulCases,
    customerSatisfaction,
    specialtyAreas,
    languageSkills,
    availableWeekends,
    availableEmergency,
    workingRegions,
    currentActiveCases,
    maxSimultaneousCases,
    workloadRatio,
  } = coordinator;

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getWorkloadStatus = (ratio: number) => {
    if (ratio >= 0.9) return { text: '포화', color: 'text-red-600', bg: 'bg-red-50' };
    if (ratio >= 0.7) return { text: '높음', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (ratio >= 0.4) return { text: '보통', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { text: '여유', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const renderLanguageSkills = (skills: CoordinatorLanguageSkill[]) => {
    return skills.slice(0, 3).map((skill, index) => (
      <span
        key={index}
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          skill.isNative 
            ? 'bg-elderberry-100 text-elderberry-800' 
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        <Globe className="w-3 h-3 mr-1" />
        {skill.language} {skill.proficiencyLevel}
      </span>
    ));
  };

  const workloadStatus = getWorkloadStatus(workloadRatio);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-elderberry-500 border-elderberry-300' 
            : 'hover:shadow-lg hover:border-elderberry-200'
        }`}
        padding="none"
        hover={!isSelected}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-elderberry-900">{name}</h3>
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${getScoreColor(matchScore)}`} fill="currentColor" />
                  <span className={`text-sm font-medium ${getScoreColor(matchScore)}`}>
                    {matchScore.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-elderberry-600 mb-3">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{experienceYears}년 경력</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{successfulCases}건 성공</span>
                </div>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${workloadStatus.bg} ${workloadStatus.color}`}>
              {workloadStatus.text}
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-0">
          <div className="space-y-4">
            <div className="bg-elderberry-50 p-3 rounded-lg">
              <p className="text-sm text-elderberry-700 leading-relaxed">
                {matchReason}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-elderberry-500 mb-1">고객 만족도</div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span className="text-sm font-medium">{customerSatisfaction.toFixed(1)}</span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-elderberry-500 mb-1">현재 케이스</div>
                <div className="text-sm font-medium">
                  {currentActiveCases}/{maxSimultaneousCases}
                </div>
              </div>
            </div>

            {specialtyAreas.length > 0 && (
              <div>
                <div className="text-xs text-elderberry-500 mb-2">전문 분야</div>
                <div className="flex flex-wrap gap-1">
                  {specialtyAreas.slice(0, 3).map((area, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                  {specialtyAreas.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
                      +{specialtyAreas.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {languageSkills.length > 0 && (
              <div>
                <div className="text-xs text-elderberry-500 mb-2">언어 능력</div>
                <div className="flex flex-wrap gap-1">
                  {renderLanguageSkills(languageSkills)}
                  {languageSkills.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
                      +{languageSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-elderberry-600">
              {availableWeekends && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>주말 가능</span>
                </div>
              )}
              {availableEmergency && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>응급 대응</span>
                </div>
              )}
            </div>

            {workingRegions.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-elderberry-600">
                <MapPin className="w-3 h-3" />
                <span>{workingRegions.slice(0, 2).join(', ')}</span>
                {workingRegions.length > 2 && (
                  <span> 외 {workingRegions.length - 2}곳</span>
                )}
              </div>
            )}
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="pt-4">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(coordinatorId)}
                className="flex-1"
              >
                상세 보기
              </Button>
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => onSelect?.(coordinatorId)}
                className="flex-1"
              >
                {isSelected ? '선택됨' : '선택하기'}
              </Button>
            </div>
          </CardFooter>
        )}

        {isSelected && (
          <div className="absolute top-3 right-3">
            <CheckCircle2 className="w-5 h-5 text-elderberry-600" />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default CoordinatorCard; 