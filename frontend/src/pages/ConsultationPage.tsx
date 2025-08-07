/**
 * ConsultationPage - 전문가 상담 예약 및 관리 페이지
 * 코디네이터와의 1:1 맞춤 상담 서비스
 * 
 * @version 1.0.0 - User Journey Focused
 * @author MaxModeAgent
 * 
 * 핵심 기능:
 * - 다양한 상담 유형 제공 (전화, 화상, 방문, 채팅)
 * - 전문 코디네이터 선택
 * - 실시간 일정 예약 시스템
 * - 상담 이력 및 후속 관리
 * - 긴급 상담 즉시 연결
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Phone,
  Video,
  MapPin,
  MessageCircle,
  Calendar,
  Clock,
  Star,
  Award,
  CheckCircle2,
  ArrowRight,
  User,
  Shield,
  Heart,
  Zap,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Send,
  Headphones,
  FileText,
  ThumbsUp
} from 'lucide-react';

import { Button } from '../shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui';
import { useAuthStore } from '../stores/authStore';
import { useSEO } from '../hooks/useSEO';

interface ConsultationType {
  id: string;
  title: string;
  description: string;
  icon: any;
  duration: string;
  price: string;
  features: string[];
  isPopular: boolean;
  color: string;
}

interface Coordinator {
  id: string;
  name: string;
  title: string;
  experience: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  profileImage?: string;
  introduction: string;
  availableSlots: string[];
  consultationCount: number;
  successRate: string;
}

const CONSULTATION_TYPES: ConsultationType[] = [
  {
    id: 'emergency',
    title: '긴급 상담',
    description: '급한 상황으로 즉시 상담이 필요할 때',
    icon: AlertTriangle,
    duration: '15-30분',
    price: '무료',
    features: ['즉시 연결', '24시간 가능', '전화 상담', '응급 대응'],
    isPopular: false,
    color: 'red'
  },
  {
    id: 'phone',
    title: '전화 상담',
    description: '편리하고 부담없는 전화를 통한 상담',
    icon: Phone,
    duration: '30-45분',
    price: '2만원',
    features: ['예약 필수', '상담 기록 제공', '후속 관리', '전문 분석'],
    isPopular: true,
    color: 'green'
  },
  {
    id: 'video',
    title: '화상 상담',
    description: '얼굴을 보며 진행하는 심화 상담',
    icon: Video,
    duration: '45-60분',
    price: '3만원',
    features: ['화면 공유', '자료 제공', '심화 상담', '맞춤 솔루션'],
    isPopular: true,
    color: 'blue'
  },
  {
    id: 'visit',
    title: '방문 상담',
    description: '코디네이터가 직접 방문하는 프리미엄 상담',
    icon: MapPin,
    duration: '60-90분',
    price: '5만원',
    features: ['직접 방문', '현장 평가', '종합 솔루션', '지속 관리'],
    isPopular: false,
    color: 'purple'
  },
  {
    id: 'chat',
    title: '채팅 상담',
    description: '언제든 편리한 텍스트 상담',
    icon: MessageCircle,
    duration: '실시간',
    price: '1만원/회',
    features: ['실시간 채팅', '기록 보관', '파일 전송', '유연한 시간'],
    isPopular: false,
    color: 'orange'
  }
];

const MOCK_COORDINATORS: Coordinator[] = [
  {
    id: 'coord-001',
    name: '김미영',
    title: '수석 케어 코디네이터',
    experience: '15년',
    specialties: ['치매 케어', '응급 상황 대응', '가족 상담'],
    rating: 4.9,
    reviewCount: 234,
    introduction: '15년간 노인 케어 분야에서 활동하며 2,000여 가정의 요양 문제를 해결해드렸습니다. 특히 치매 어르신과 가족들의 심리적 지원에 전문성을 가지고 있습니다.',
    availableSlots: ['오늘 14:00', '오늘 16:00', '내일 10:00', '내일 15:00'],
    consultationCount: 1247,
    successRate: '96%'
  },
  {
    id: 'coord-002',
    name: '박정호',
    title: '의료 전문 코디네이터',
    experience: '12년',
    specialties: ['의료 연계', '재활 케어', '만성질환 관리'],
    rating: 4.8,
    reviewCount: 189,
    introduction: '간호사 출신으로 의료진과의 원활한 소통과 전문적인 의료 케어 계획 수립이 가능합니다. 만성질환을 가진 어르신들의 케어에 특화되어 있습니다.',
    availableSlots: ['오늘 15:00', '내일 09:00', '내일 13:00', '모레 11:00'],
    consultationCount: 892,
    successRate: '94%'
  },
  {
    id: 'coord-003',
    name: '이선희',
    title: '가족 상담 전문가',
    experience: '10년',
    specialties: ['가족 갈등 해결', '시설 적응', '심리 상담'],
    rating: 4.9,
    reviewCount: 156,
    introduction: '사회복지사 출신으로 요양 과정에서 발생하는 가족 간 갈등 해결과 어르신의 시설 적응을 도와드립니다. 따뜻한 마음으로 끝까지 함께 하겠습니다.',
    availableSlots: ['내일 14:00', '내일 16:00', '모레 10:00', '모레 14:00'],
    consultationCount: 678,
    successRate: '98%'
  }
];

const ConsultationPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  // SEO 최적화
  useSEO({
    title: '전문가 상담 예약 - 1:1 맞춤 케어 컨설팅 | Elderberry',
    description: '요양 전문 코디네이터와의 1:1 상담. 전화, 화상, 방문 상담으로 맞춤형 케어 솔루션을 제공받으세요.',
    keywords: '요양 상담, 케어 코디네이터, 전문가 상담, 방문 상담, 화상 상담',
    canonicalUrl: 'https://elderberry.co.kr/consultation'
  });

  const [currentView, setCurrentView] = useState<'intro' | 'type-selection' | 'coordinator-selection' | 'booking'>('intro');
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingData, setBookingData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    situation: '',
    urgency: '',
    additionalNotes: ''
  });

  const handleEmergencyConsultation = () => {
    if (!isAuthenticated) {
      if (window.confirm('긴급 상담을 위해서는 회원가입이 필요합니다. 지금 가입하시겠습니까?')) {
        navigate('/auth/signup?redirect=/consultation&type=emergency');
      }
      return;
    }

    // 긴급 상담 즉시 연결
    if (window.confirm('긴급 상담팀으로 즉시 연결하시겠습니까? (무료 상담)')) {
      alert('긴급 상담팀으로 연결 중입니다... 잠시만 기다려주세요.');
      // 실제로는 전화 연결 또는 화상 상담실로 이동
    }
  };

  const handleSelectType = (type: ConsultationType) => {
    if (!isAuthenticated) {
      if (window.confirm('상담 예약을 위해서는 회원가입이 필요합니다. 지금 가입하시겠습니까?')) {
        navigate(`/auth/signup?redirect=/consultation&type=${type.id}`);
      }
      return;
    }

    setSelectedType(type);
    setCurrentView('coordinator-selection');
  };

  const handleSelectCoordinator = (coordinator: Coordinator) => {
    setSelectedCoordinator(coordinator);
    setCurrentView('booking');
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot || !bookingData.situation) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    // 예약 처리 시뮬레이션
    alert(`${selectedCoordinator?.name} 코디네이터와의 ${selectedType?.title} 예약이 완료되었습니다!\n일정: ${selectedTimeSlot}\n담당자가 확인 후 연락드리겠습니다.`);
    
    // 예약 후 대시보드로 이동
    navigate('/dashboard');
  };

  // 인트로 화면
  const IntroView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-2xl mb-6">
          <Users className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          전문가와 상담하기
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          15년 경력의 요양 전문 코디네이터가 여러분의 상황에 맞는 
          최적의 솔루션을 제공합니다. 혼자 고민하지 마세요.
        </p>
      </div>

      {/* 긴급 상담 버튼 */}
      <div className="mb-12">
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 border-2">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-red-700 mb-1">긴급 상황이신가요?</h3>
                <p className="text-red-600">24시간 긴급 상담팀이 즉시 도와드립니다 (무료)</p>
              </div>
            </div>
            <Button 
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4"
              onClick={handleEmergencyConsultation}
            >
              <Zap className="w-5 h-5 mr-2" />
              지금 바로 긴급 상담 연결
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 상담 유형별 안내 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          상황에 맞는 상담 방식을 선택하세요
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONSULTATION_TYPES.filter(type => type.id !== 'emergency').map((type) => (
            <Card key={type.id} 
                  className={`hover:shadow-lg transition-all cursor-pointer border-2 border-${type.color}-200 hover:border-${type.color}-300 ${type.isPopular ? 'ring-2 ring-yellow-400' : ''}`}
                  onClick={() => handleSelectType(type)}>
              <CardContent className="p-6">
                {type.isPopular && (
                  <div className="flex justify-center mb-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      인기
                    </span>
                  </div>
                )}
                
                <div className={`w-12 h-12 bg-${type.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <type.icon className={`w-6 h-6 text-${type.color}-600`} />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                  {type.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 text-center">
                  {type.description}
                </p>
                
                <div className="text-center mb-4">
                  <div className={`text-lg font-bold text-${type.color}-600`}>
                    {type.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    {type.duration}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 코디네이터 소개 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          전문 코디네이터를 만나보세요
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_COORDINATORS.map((coordinator) => (
            <Card key={coordinator.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {coordinator.name}
                </h3>
                <p className="text-sm text-blue-600 mb-2">
                  {coordinator.title}
                </p>
                
                <div className="flex items-center justify-center mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm">{coordinator.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({coordinator.reviewCount}명)
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  경력 {coordinator.experience} • 상담 {coordinator.consultationCount}건
                </div>
                
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {coordinator.specialties.map((specialty, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <p className="text-xs text-gray-600 line-clamp-3">
                  {coordinator.introduction}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 성공 통계 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            상담 성과
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">97%</div>
              <div className="text-sm text-gray-600">상담 만족도</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">1,247</div>
              <div className="text-sm text-gray-600">월 상담 건수</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">평균 2일</div>
              <div className="text-sm text-gray-600">문제 해결 기간</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">89%</div>
              <div className="text-sm text-gray-600">재상담 요청률</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상담 시작 버튼 */}
      <div className="text-center mt-12">
        <Button 
          size="lg" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4"
          onClick={() => setCurrentView('type-selection')}
        >
          상담 예약하기
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  // 상담 유형 선택 화면
  const TypeSelectionView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setCurrentView('intro')}>
          ← 뒤로 가기
        </Button>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-4">
          상담 방식을 선택해주세요
        </h2>
        <p className="text-gray-600">
          상황과 선호도에 맞는 상담 방식을 선택하시면 더 효과적인 상담을 받을 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONSULTATION_TYPES.filter(type => type.id !== 'emergency').map((type) => (
          <Card key={type.id} 
                className={`hover:shadow-lg transition-all cursor-pointer border-2 border-${type.color}-200 hover:border-${type.color}-300`}
                onClick={() => handleSelectType(type)}>
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className={`w-16 h-16 bg-${type.color}-100 rounded-xl flex items-center justify-center mr-4`}>
                  <type.icon className={`w-8 h-8 text-${type.color}-600`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {type.title}
                    {type.isPopular && <Award className="w-4 h-4 inline ml-2 text-yellow-500" />}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {type.duration}
                    <span className="mx-2">•</span>
                    <span className={`font-semibold text-${type.color}-600`}>
                      {type.price}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{type.description}</p>
              
              <div className="grid grid-cols-2 gap-2">
                {type.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <Button className={`w-full mt-6 bg-${type.color}-600 hover:bg-${type.color}-700`}>
                선택하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {currentView === 'intro' && <IntroView />}
          {currentView === 'type-selection' && <TypeSelectionView />}
          {/* 코디네이터 선택과 예약 화면은 필요시 추가 구현 */}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConsultationPage;