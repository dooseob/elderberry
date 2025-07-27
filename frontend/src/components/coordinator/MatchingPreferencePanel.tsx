import React from 'react';
import {
  Clock,
  Globe,
  MapPin,
  Settings,
  Shield,
  X
} from '../icons/LucideIcons';
import { motion } from 'framer-motion';
import { MatchingPreference } from '@/services/coordinatorApi';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface MatchingPreferencePanelProps {
  preference: MatchingPreference;
  onChange: (preference: MatchingPreference) => void;
  onClose: () => void;
}

const MatchingPreferencePanel: React.FC<MatchingPreferencePanelProps> = ({
  preference,
  onChange,
  onClose,
}) => {
  const handleChange = (key: keyof MatchingPreference, value: any) => {
    onChange({ ...preference, [key]: value });
  };

  const languageOptions = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: '영어' },
    { value: 'ja', label: '일본어' },
    { value: 'zh', label: '중국어' },
    { value: 'es', label: '스페인어' },
    { value: 'fr', label: '프랑스어' },
    { value: 'de', label: '독일어' },
  ];

  const regionOptions = [
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'incheon', label: '인천' },
    { value: 'daegu', label: '대구' },
    { value: 'daejeon', label: '대전' },
    { value: 'gwangju', label: '광주' },
    { value: 'ulsan', label: '울산' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-elderberry-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-elderberry-600" />
              매칭 설정
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-elderberry-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                선호 언어
              </label>
              <select
                value={preference.preferredLanguage || ''}
                onChange={(e) => handleChange('preferredLanguage', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
              >
                <option value="">언어 선택 안함</option>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-elderberry-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                선호 지역
              </label>
              <select
                value={preference.preferredRegion || ''}
                onChange={(e) => handleChange('preferredRegion', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
              >
                <option value="">지역 선택 안함</option>
                {regionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-elderberry-700 mb-2">
                최대 결과 수
              </label>
              <select
                value={preference.maxResults || 20}
                onChange={(e) => handleChange('maxResults', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
              >
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={50}>50개</option>
                <option value={100}>100개</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-elderberry-700 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                최소 만족도
              </label>
              <select
                value={preference.minCustomerSatisfaction || 3.0}
                onChange={(e) => handleChange('minCustomerSatisfaction', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
              >
                <option value={2.0}>2.0점 이상</option>
                <option value={2.5}>2.5점 이상</option>
                <option value={3.0}>3.0점 이상</option>
                <option value={3.5}>3.5점 이상</option>
                <option value={4.0}>4.0점 이상</option>
                <option value={4.5}>4.5점 이상</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weekends"
                  checked={preference.needsWeekendAvailability || false}
                  onChange={(e) => handleChange('needsWeekendAvailability', e.target.checked)}
                  className="mr-2 text-elderberry-600 focus:ring-elderberry-500"
                />
                <label htmlFor="weekends" className="text-sm text-elderberry-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  주말 가능 필수
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={preference.needsEmergencyAvailability || false}
                  onChange={(e) => handleChange('needsEmergencyAvailability', e.target.checked)}
                  className="mr-2 text-elderberry-600 focus:ring-elderberry-500"
                />
                <label htmlFor="emergency" className="text-sm text-elderberry-700">
                  응급 대응 가능 필수
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="professional"
                  checked={preference.needsProfessionalConsultation || false}
                  onChange={(e) => handleChange('needsProfessionalConsultation', e.target.checked)}
                  className="mr-2 text-elderberry-600 focus:ring-elderberry-500"
                />
                <label htmlFor="professional" className="text-sm text-elderberry-700">
                  전문 상담 가능 필수
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-elderberry-700 mb-2">
                국가 코드
              </label>
              <input
                type="text"
                value={preference.countryCode || ''}
                onChange={(e) => handleChange('countryCode', e.target.value || undefined)}
                placeholder="예: KR, US, JP"
                className="w-full px-3 py-2 border border-elderberry-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-elderberry-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onChange({
                  maxResults: 20,
                  minCustomerSatisfaction: 3.0,
                });
              }}
            >
              초기화
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
            >
              적용
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MatchingPreferencePanel; 