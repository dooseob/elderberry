/**
 * EmergencySearchPage - 긴급 상황 요양원 검색 페이지
 * 최소한의 정보로 빠른 추천 및 즉시 연결을 위한 특화 페이지
 * 
 * @version 1.0.0 - User Journey Focused
 * @author MaxModeAgent
 * 
 * 핵심 기능:
 * - 3-5분 내 완성되는 간단 폼
 * - 실시간 추천 결과 (3-5곳)
 * - 원클릭 전화 연결
 * - 빠른 방문 예약 시스템
 * - 비회원도 이용 가능 (제한적)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MapPin,
  DollarSign,
  Users,
  Phone,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
  Heart,
  Calendar,
  MessageCircle,
  Shield,
  Award
} from 'lucide-react';

import { Button } from '../shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui';
import { useAuthStore } from '../stores/authStore';
import { useSEO } from '../hooks/useSEO';

interface EmergencySearchForm {
  location: string;
  budget: string;
  careLevel: string;
  urgency: string;
  contactName: string;
  contactPhone: string;
  additionalNotes?: string;
}

interface EmergencyFacility {
  id: string;
  name: string;
  location: string;
  distance: string;
  monthlyFee: string;
  rating: number;
  reviewCount: number;
  availableBeds: number;
  specialties: string[];
  phoneNumber: string;
  emergencyContact: string;
  quickFeatures: string[];
  imageUrl?: string;
  canVisitToday: boolean;
  responseTime: string;
}

const MOCK_EMERGENCY_FACILITIES: EmergencyFacility[] = [
  {
    id: 'emergency-001',
    name: '서울 중앙 요양원',
    location: '서울시 중구',
    distance: '2.3km',
    monthlyFee: '180-220만원',
    rating: 4.8,
    reviewCount: 124,
    availableBeds: 3,
    specialties: ['치매전문', '24시간 간병'],
    phoneNumber: '02-1234-5678',
    emergencyContact: '010-1234-5678',
    quickFeatures: ['즉시 입주 가능', '의료진 상주', '급식 제공'],
    canVisitToday: true,
    responseTime: '10분 내 연락'
  },
  {
    id: 'emergency-002',
    name: '가족 같은 실버홈',
    location: '서울시 강남구',
    distance: '3.7km',
    monthlyFee: '150-180만원',
    rating: 4.6,
    reviewCount: 89,
    availableBeds: 2,
    specialties: ['가정형', '소규모'],
    phoneNumber: '02-2345-6789',
    emergencyContact: '010-2345-6789',
    quickFeatures: ['가족적 분위기', '개별 맞춤 케어', '영양사 관리'],
    canVisitToday: true,
    responseTime: '15분 내 연락'
  },
  {
    id: 'emergency-003',
    name: '희망 전문 요양센터',
    location: '서울시 서초구',
    distance: '5.1km',
    monthlyFee: '200-250만원',
    rating: 4.9,
    reviewCount: 203,
    availableBeds: 1,
    specialties: ['재활전문', '물리치료'],
    phoneNumber: '02-3456-7890',
    emergencyContact: '010-3456-7890',
    quickFeatures: ['재활 프로그램', '전문 의료진', '최신 시설'],
    canVisitToday: false,
    responseTime: '5분 내 연락'
  }
];

const EmergencySearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const isGuestMode = searchParams.get('mode') === 'guest';

  // SEO 최적화
  useSEO({
    title: '긴급 요양원 찾기 - 5분 내 빠른 추천 | Elderberry',
    description: '갑작스러운 상황으로 급히 요양원이 필요하신가요? 최소한의 정보로 5분 내에 3-5곳을 추천받고 즉시 연결해드립니다.',
    keywords: '긴급 요양원, 응급 요양원, 즉시 입주, 빠른 검색, 요양원 급구',
    canonicalUrl: 'https://elderberry.co.kr/emergency-search'
  });

  // 폼 상태 관리
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmergencySearchForm>({
    location: '',
    budget: '',
    careLevel: '',
    urgency: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    additionalNotes: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<EmergencyFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<EmergencyFacility | null>(null);

  const totalSteps = 3;

  const handleInputChange = (field: keyof EmergencySearchForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setSearchResults(MOCK_EMERGENCY_FACILITIES);
      setIsSearching(false);
      setCurrentStep(totalSteps + 1); // 결과 단계로 이동
    }, 2000);
  };

  const handleCallFacility = (facility: EmergencyFacility) => {
    // 실제 전화 걸기 (모바일에서는 tel: 링크 사용)
    if (window.confirm(`${facility.name}(으)로 전화를 걸겠습니까?\n전화번호: ${facility.phoneNumber}`)) {
      window.location.href = `tel:${facility.phoneNumber}`;
    }
  };

  const handleScheduleVisit = (facility: EmergencyFacility) => {
    // 방문 예약 처리
    setSelectedFacility(facility);
    
    if (!isAuthenticated && isGuestMode) {
      if (window.confirm('방문 예약은 회원가입 후 이용 가능합니다. 지금 가입하시겠습니까?')) {
        navigate(`/auth/signup?redirect=/emergency-search&facility=${facility.id}`);
      }
    } else {
      // 실제 예약 처리
      alert(`${facility.name} 방문 예약이 요청되었습니다. 담당자가 곧 연락드리겠습니다.`);
    }
  };

  // 단계별 컴포넌트 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LocationAndBudgetStep />;
      case 2:
        return <CareDetailsStep />;
      case 3:
        return <ContactInfoStep />;
      default:
        return <SearchResultsStep />;
    }
  };

  // 1단계: 위치 및 예산
  const LocationAndBudgetStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            어느 지역을 원하시나요? *
          </label>
          <select
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">지역을 선택해주세요</option>
            <option value="seoul-central">서울시 중구/종로구</option>
            <option value="seoul-gangnam">서울시 강남구/서초구</option>
            <option value="seoul-gangbuk">서울시 강북구/성북구</option>
            <option value="seoul-mapo">서울시 마포구/서대문구</option>
            <option value="seoul-other">서울시 기타 지역</option>
            <option value="gyeonggi">경기도</option>
            <option value="incheon">인천시</option>
            <option value="other">기타 지역</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            월 예산은 어느 정도 생각하고 계신가요? *
          </label>
          <select
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">예산을 선택해주세요</option>
            <option value="under-150">150만원 미만</option>
            <option value="150-200">150-200만원</option>
            <option value="200-250">200-250만원</option>
            <option value="250-300">250-300만원</option>
            <option value="over-300">300만원 이상</option>
            <option value="flexible">상황에 따라 조정 가능</option>
          </select>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700 mb-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium">긴급 상황 안내</span>
          </div>
          <p className="text-sm text-red-600">
            급한 상황일수록 정확한 정보가 중요합니다. 
            선택하신 조건에 맞는 시설들을 우선적으로 추천해드립니다.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // 2단계: 돌봄 세부사항
  const CareDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            필요한 돌봄 정도는 어떠신가요? *
          </label>
          <select
            value={formData.careLevel}
            onChange={(e) => handleInputChange('careLevel', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">돌봄 정도를 선택해주세요</option>
            <option value="mild">가벼운 도움 (일상 생활 부분 지원)</option>
            <option value="moderate">중간 돌봄 (일상 생활 상당 지원)</option>
            <option value="intensive">집중 돌봄 (전반적 생활 지원)</option>
            <option value="medical">의료적 돌봄 (24시간 의료 관리)</option>
            <option value="dementia">치매 전문 돌봄</option>
            <option value="unsure">잘 모르겠음 (상담 후 결정)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            언제부터 입주가 필요하신가요? *
          </label>
          <select
            value={formData.urgency}
            onChange={(e) => handleInputChange('urgency', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">입주 시기를 선택해주세요</option>
            <option value="today">오늘 당장</option>
            <option value="within-3days">3일 이내</option>
            <option value="within-week">일주일 이내</option>
            <option value="within-month">한달 이내</option>
            <option value="flexible">시기 조정 가능</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            특별히 고려사항이 있으시면 간단히 적어주세요
          </label>
          <textarea
            value={formData.additionalNotes || ''}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            placeholder="예: 휠체어 이용, 특정 질환, 종교적 고려사항 등"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      </div>
    </motion.div>
  );

  // 3단계: 연락처 정보
  const ContactInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-blue-700 mb-2">
            <Zap className="w-5 h-5 mr-2" />
            <span className="font-medium">빠른 연결을 위한 연락처</span>
          </div>
          <p className="text-sm text-blue-600">
            추천 결과를 받은 후, 시설에서 직접 연락드립니다.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연락받으실 분의 성함 *
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            placeholder="성함을 입력해주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연락처 *
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {isGuestMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center text-yellow-700 mb-2">
              <Shield className="w-5 h-5 mr-2" />
              <span className="font-medium">비회원 이용 안내</span>
            </div>
            <p className="text-sm text-yellow-600">
              비회원으로도 추천을 받을 수 있지만, 회원가입하시면 더 정확한 매칭과 
              추가 서비스를 이용하실 수 있습니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth/signup?redirect=/emergency-search')}
              className="mt-3"
            >
              간단 회원가입하고 더 많은 혜택 받기
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );

  // 검색 결과 단계
  const SearchResultsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {isSearching ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Zap className="w-8 h-8 text-red-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            긴급 매칭 중...
          </h3>
          <p className="text-gray-600">
            입력하신 조건에 맞는 시설들을 찾고 있습니다.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="flex items-center text-green-600 mb-2">
              <CheckCircle2 className="w-6 h-6 mr-2" />
              <span className="text-lg font-semibold">매칭 완료!</span>
            </div>
            <p className="text-gray-600">
              조건에 맞는 <strong>{searchResults.length}곳</strong>을 찾았습니다. 
              시설에서 곧 연락드릴 예정입니다.
            </p>
          </div>

          <div className="space-y-4">
            {searchResults.map((facility, index) => (
              <Card key={facility.id} className="border-2 hover:border-red-200 transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{facility.name}</h3>
                        {facility.canVisitToday && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                            오늘 방문 가능
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {facility.location} · {facility.distance}
                        <Star className="w-4 h-4 ml-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {facility.rating} ({facility.reviewCount}명 리뷰)
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <DollarSign className="w-4 h-4 mr-1" />
                        월 {facility.monthlyFee}
                        <Users className="w-4 h-4 ml-3 mr-1" />
                        입주 가능: {facility.availableBeds}자리
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {facility.specialties.map((specialty, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <strong>특징:</strong> {facility.quickFeatures.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleCallFacility(facility)}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      지금 바로 통화
                      <span className="text-xs ml-2">({facility.responseTime})</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleScheduleVisit(facility)}
                      className="flex-1"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      방문 예약
                    </Button>
                  </div>
                  
                  {index === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center text-yellow-700 text-sm">
                        <Award className="w-4 h-4 mr-2" />
                        <strong>최우선 추천:</strong> 조건에 가장 적합한 시설입니다
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">다음 단계 안내</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                시설에서 15분 내에 연락드립니다
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                전화 상담 후 방문 일정을 조율합니다
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                방문 후 입주 결정 시 서류 준비를 도와드립니다
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 더 정확한 매칭을 원하시면 <button className="text-blue-600 hover:underline" onClick={() => navigate('/health-assessment')}>건강평가</button>를 진행해보세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.location && formData.budget;
      case 2:
        return formData.careLevel && formData.urgency;
      case 3:
        return formData.contactName && formData.contactPhone;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            긴급 요양원 찾기
          </h1>
          <p className="text-xl text-gray-600">
            빠르고 정확한 추천으로 급한 상황을 해결해드립니다
          </p>
          {isGuestMode && (
            <div className="mt-2 text-sm text-yellow-600">
              비회원 모드 - 기본 서비스 이용 중
            </div>
          )}
        </div>

        {/* 진행률 표시 */}
        {currentStep <= totalSteps && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>진행 상황</span>
              <span>{currentStep} / {totalSteps} 단계</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 메인 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              {currentStep <= totalSteps ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  {currentStep === 1 && '위치와 예산을 알려주세요'}
                  {currentStep === 2 && '돌봄 상황을 알려주세요'}
                  {currentStep === 3 && '연락처를 남겨주세요'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  추천 결과
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentStep <= totalSteps ? (
                `${4 - currentStep}단계 남았습니다. 정확한 정보일수록 더 좋은 매칭을 받을 수 있습니다.`
              ) : (
                '조건에 맞는 시설들을 찾았습니다. 바로 연락해보세요!'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </CardContent>

          {/* 하단 버튼들 */}
          {currentStep <= totalSteps && (
            <div className="px-6 pb-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  이전
                </Button>

                <div className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  예상 소요시간: {5 - currentStep}분
                </div>

                <Button
                  variant="primary"
                  onClick={currentStep === totalSteps ? handleSearch : handleNext}
                  disabled={!isStepValid()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {currentStep === totalSteps ? (
                    isSearching ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        검색 중...
                      </>
                    ) : (
                      <>
                        지금 바로 찾기
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )
                  ) : (
                    <>
                      다음
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* 하단 안내 */}
        {currentStep <= totalSteps && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-red-200">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">5분 내 추천</h4>
                <p className="text-sm text-gray-600">빠른 매칭으로 시간 절약</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-red-200">
              <CardContent className="p-4 text-center">
                <Phone className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">즉시 연결</h4>
                <p className="text-sm text-gray-600">원클릭으로 시설과 직접 통화</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-red-200">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">검증된 시설</h4>
                <p className="text-sm text-gray-600">엄선된 우수 요양원만 추천</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySearchPage;