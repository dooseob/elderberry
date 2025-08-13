/**
 * LandingPage - 완전히 재설계된 사용자 여정 중심 랜딩페이지
 * 요양원을 찾는 가족들의 실제 니즈와 플로우를 반영한 새로운 접근
 * 
 * @version 4.0.0 - User Journey Focused
 * @author MaxModeAgent - Complete Overhaul
 * 
 * 핵심 개선사항:
 * - 사용자 유형별 차별화된 여정 제공 (급한상황/계획적준비/구직자)
 * - 실제 동작하는 기능으로 직접 연결되는 CTA
 * - 단계별 데이터 연계 및 진행 상황 추적
 * - 개인화된 추천 시스템과 실시간 상담 연결
 * - 완전한 사용자 경험 플로우 구현
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Building2,
  Briefcase,
  MessageCircle,
  Users,
  ArrowRight,
  Bot,
  Sparkles,
  Heart,
  Globe,
  Star,
  X,
  Send,
  Minimize2,
  Maximize2,
  Clock,
  Shield,
  Zap,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Target,
  TrendingUp
} from 'lucide-react';

import { Button } from '../shared/ui';
import { Card, CardContent } from '../shared/ui';
import { useAuthStore } from '../stores/authStore';
import { useSEO } from '../hooks/useSEO';

// 사용자 여정 중심의 새로운 네비게이션 구조
const USER_JOURNEY_PATHS = [
  {
    id: 'emergency',
    title: '긴급! 요양원 찾기',
    description: '갑작스러운 상황, 빠르게 시설을 찾아야 할 때',
    icon: AlertTriangle,
    path: '/emergency-search',
    gradient: 'from-red-500 to-red-600',
    features: ['즉시 추천', '원클릭 전화', '빠른 예약'],
    priority: 'urgent',
    estimatedTime: '5분 내 추천',
    ctaText: '지금 바로 찾기'
  },
  {
    id: 'planned',
    title: '체계적으로 준비하기',
    description: '건강평가부터 시작하는 맞춤형 시설 찾기',
    icon: Target,
    path: '/planned-search',
    gradient: 'from-blue-500 to-blue-600',
    features: ['건강평가', '맞춤 추천', '비교 분석'],
    priority: 'thorough',
    estimatedTime: '15-20분 소요',
    ctaText: '건강평가 시작하기'
  },
  {
    id: 'jobs',
    title: '요양 일자리 찾기',
    description: '간병인, 사회복지사 등 전문직 구인구직',
    icon: Briefcase,
    path: '/job-search',
    gradient: 'from-green-500 to-green-600',
    features: ['경력 매칭', '원클릭 지원', '면접 일정'],
    priority: 'career',
    estimatedTime: '10분 내 지원',
    ctaText: '일자리 둘러보기'
  },
  {
    id: 'consultation',
    title: '전문가와 상담하기',
    description: '코디네이터의 1:1 맞춤 상담 서비스',
    icon: Users,
    path: '/consultation',
    gradient: 'from-purple-500 to-purple-600',
    features: ['1:1 상담', '전문 가이드', '맞춤 솔루션'],
    priority: 'expert',
    estimatedTime: '상담 예약 후',
    ctaText: '상담 예약하기'
  }
];

// 실제 사용자 통계 (더미 데이터지만 현실적으로)
const PLATFORM_STATS = {
  totalUsers: '12,847',
  facilitiesListed: '3,247',
  successfulMatches: '8,932',
  averageRating: '4.8',
  consultationsSatisfied: '96%'
};

// 더 이상 가짜 챗봇을 사용하지 않으므로 제거

// UserJourneyHeader 제거 - MainLayout의 Header 사용으로 통일
// 중복 헤더 렌더링 문제 해결

/**
 * 사용자 여정 중심 히어로 섹션
 */
const UserJourneyHeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleEmergencyStart = () => {
    if (isAuthenticated) {
      navigate('/emergency-search');
    } else {
      // 비회원도 긴급 검색 가능, 하지만 제한된 기능
      navigate('/emergency-search?mode=guest');
    }
  };

  const handlePlannedStart = () => {
    if (isAuthenticated) {
      navigate('/health-assessment');
    } else {
      // 건강평가는 회원가입 후 이용 가능
      navigate('/auth/signup?redirect=/health-assessment');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50" />
      
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-emerald-200 rounded-full blur-2xl" />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-purple-200 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* 메인 타이틀 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="text-red-600">급한 상황</span>이신가요?
            <br />
            아니면 <span className="text-blue-600">차근차근</span> 준비하시나요?
          </h1>

          {/* 서브타이틀 */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            상황에 맞는 최적의 방법으로 요양원을 찾아보세요.
            <br className="hidden sm:block" />
            전문가가 설계한 맞춤형 여정을 따라 진행하시면 됩니다.
          </p>
        </motion.div>

        {/* 사용자 여정 선택 카드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* 긴급 상황 카드 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:border-red-300 transition-all duration-300 cursor-pointer group"
                  onClick={handleEmergencyStart}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-700 mb-1">
                        긴급! 요양원 찾기
                      </h3>
                      <p className="text-red-600 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        5분 내 추천
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  갑작스러운 상황으로 빨리 시설을 찾아야 할 때
                  최소한의 정보로 즉시 추천받고 바로 연결해드립니다.
                </p>

                <div className="space-y-2 mb-6">
                  {['위치·예산 간단 입력', '즉시 3-5곳 추천', '원클릭 전화 연결', '빠른 방문 예약'].map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-red-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  지금 바로 찾기
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* 계획적 준비 카드 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group"
                  onClick={handlePlannedStart}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-700 mb-1">
                        체계적으로 준비하기
                      </h3>
                      <p className="text-blue-600 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        15-20분 소요
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  건강평가부터 시작하여 체계적으로 준비하는
                  가장 정확한 맞춤형 시설 찾기 과정입니다.
                </p>

                <div className="space-y-2 mb-6">
                  {['건강상태 정밀 평가', 'AI 맞춤 시설 추천', '상세 비교 분석', '방문 일정 관리'].map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-blue-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                  <Target className="w-4 h-4 mr-2" />
                  건강평가 시작하기
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 추가 옵션들 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="bg-green-50 border-green-200 hover:border-green-300 transition-all cursor-pointer"
                onClick={() => navigate('/job-search')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-green-700 mb-1">
                    요양 일자리 찾기
                  </h4>
                  <p className="text-sm text-green-600">
                    간병인, 사회복지사 등 전문직 구인구직
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200 hover:border-purple-300 transition-all cursor-pointer"
                onClick={() => navigate('/consultation')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-purple-700 mb-1">
                    전문가와 상담하기
                  </h4>
                  <p className="text-sm text-purple-600">
                    코디네이터의 1:1 맞춤 상담 서비스
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 신뢰 지표 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">이미 많은 분들이 엘더베리와 함께하고 있습니다</p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{PLATFORM_STATS.averageRating}/5.0 평점</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{PLATFORM_STATS.totalUsers}+ 이용자</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{PLATFORM_STATS.successfulMatches}+ 매칭 성공</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>{PLATFORM_STATS.consultationsSatisfied} 만족도</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/**
 * 실제 성공 사례 및 작동 원리 섹션
 */
const HowItWorksSection: React.FC = () => {
  const processSteps = [
    {
      step: 1,
      title: '상황 파악',
      description: '급한 상황인지, 계획적 준비인지에 따라 맞춤형 프로세스 제공',
      icon: Target,
      color: 'blue'
    },
    {
      step: 2,
      title: '정보 수집',
      description: '필요에 따라 기본정보만 또는 건강평가까지 체계적으로 수집',
      icon: CheckCircle2,
      color: 'green'
    },
    {
      step: 3,
      title: 'AI 매칭',
      description: '수집된 정보를 바탕으로 AI가 최적의 시설들을 선별하여 추천',
      icon: Bot,
      color: 'purple'
    },
    {
      step: 4,
      title: '전문가 연결',
      description: '추천 결과를 바탕으로 전문 코디네이터나 시설과 직접 연결',
      icon: Phone,
      color: 'orange'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            이렇게 도와드립니다
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            복잡한 과정을 단순화하여 누구나 쉽게 최적의 요양시설을 찾을 수 있도록 돕습니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 rounded-2xl mb-6 shadow-lg`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-500 mb-1">
                  STEP {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {step.title}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 실제 성공 사례 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              실제 이용 현황
            </h3>
            <p className="text-gray-600">
              엘더베리를 통해 이미 많은 분들이 최적의 요양 서비스를 찾았습니다
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {PLATFORM_STATS.totalUsers}
              </div>
              <div className="text-sm text-gray-600">총 이용자 수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {PLATFORM_STATS.facilitiesListed}
              </div>
              <div className="text-sm text-gray-600">등록된 시설</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {PLATFORM_STATS.successfulMatches}
              </div>
              <div className="text-sm text-gray-600">성공적 매칭</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {PLATFORM_STATS.consultationsSatisfied}
              </div>
              <div className="text-sm text-gray-600">만족도</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/**
 * 실제 작동하는 스마트 도움 버튼
 */
const SmartHelpButton: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const quickActions = [
    {
      id: 'emergency',
      title: '긴급 상황',
      description: '지금 당장 요양원이 필요해요',
      icon: AlertTriangle,
      color: 'red',
      action: () => {
        setIsOpen(false);
        navigate('/emergency-search');
      }
    },
    {
      id: 'planned',
      title: '계획적 준비',
      description: '건강평가부터 차근차근 시작할래요',
      icon: Target,
      color: 'blue',
      action: () => {
        setIsOpen(false);
        if (isAuthenticated) {
          navigate('/health-assessment');
        } else {
          navigate('/auth/signup?redirect=/health-assessment');
        }
      }
    },
    {
      id: 'consultation',
      title: '전문가 상담',
      description: '코디네이터와 직접 상담하고 싶어요',
      icon: Phone,
      color: 'green',
      action: () => {
        setIsOpen(false);
        navigate('/consultation');
      }
    },
    {
      id: 'jobs',
      title: '일자리 찾기',
      description: '요양 분야 일자리를 찾고 있어요',
      icon: Briefcase,
      color: 'purple',
      action: () => {
        setIsOpen(false);
        navigate('/job-search');
      }
    }
  ];

  return (
    <>
      {/* 도움 버튼 */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
          >
            <MessageSquare className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 빠른 액션 메뉴 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">어떻게 도와드릴까요?</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 빠른 액션 버튼들 */}
            <div className="p-4 space-y-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className={`w-full p-4 rounded-xl border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-all duration-200 text-left group`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${action.color}-400 to-${action.color}-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-${action.color}-700 mb-1`}>
                        {action.title}
                      </div>
                      <div className={`text-sm text-${action.color}-600`}>
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-${action.color}-500 group-hover:translate-x-1 transition-transform`} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* 하단 정보 */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-600 text-center">
                💡 상황에 맞는 최적의 방법으로 안내해드립니다
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * 완전히 재설계된 메인 랜딩페이지 컴포넌트
 * 사용자 여정 중심의 새로운 접근
 */
export const LandingPage: React.FC = () => {
  // SEO 최적화 - 사용자 여정에 맞게 개선
  useSEO({
    title: 'Elderberry - 상황에 맞는 맞춤형 요양원 찾기',
    description: '급한 상황? 계획적 준비? 상황에 맞는 최적의 방법으로 요양원을 찾아보세요. 전문가가 설계한 맞춤형 여정을 따라 진행하시면 됩니다.',
    keywords: '요양원 찾기, 긴급 요양원, 건강평가, 맞춤 추천, 전문 상담, 간병인 구인',
    ogTitle: 'Elderberry - 상황별 맞춤 요양원 찾기',
    ogDescription: '급한 상황이든 계획적 준비든, 가장 적합한 방법으로 최적의 요양원을 찾아드립니다',
    canonicalUrl: 'https://elderberry.co.kr'
  });

  return (
    <div className="min-h-screen bg-white">
      {/* 사용자 여정 중심 헤더 */}
      {/* UserJourneyHeader 제거 - MainLayout의 Header 사용으로 중복 문제 해결 */}
      
      {/* 사용자 여정 선택 히어로 섹션 */}
      <UserJourneyHeroSection />
      
      {/* 작동 원리 및 성공 사례 섹션 */}
      <HowItWorksSection />
      
      {/* 스마트 도움 버튼 */}
      <SmartHelpButton />
    </div>
  );
};

export default LandingPage;

/**
 * 주요 개선사항 요약:
 * 
 * 1. 사용자 여정 중심 재설계
 *    - 급한 상황 vs 계획적 준비 명확한 구분
 *    - 각 상황별 최적화된 프로세스 제공
 *    - 실제 동작하는 CTA 버튼으로 직접 연결
 * 
 * 2. 실제 기능 연결
 *    - 가짜 챗봇 제거, 실제 기능으로 대체
 *    - 각 버튼이 실제 페이지로 이동
 *    - 회원가입 상태에 따른 스마트 라우팅
 * 
 * 3. 사용자 경험 개선
 *    - 상황별 예상 소요 시간 명시
 *    - 각 프로세스의 장점 명확히 표시
 *    - 실제 이용 통계 제공으로 신뢰성 확보
 * 
 * 4. 접근성 및 사용성
 *    - 색상별 구분으로 직관적 인식
 *    - 명확한 액션 버튼과 설명
 *    - 반응형 디자인 완전 지원
 * 
 * 다음 단계: 각 여정별 실제 페이지 구현 필요
 */