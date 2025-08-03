/**
 * LandingPage - 사용자 요청에 따른 새로운 메인 페이지
 * AI 챗봇 중심의 랜딩 페이지 with 개선된 네비게이션
 * 
 * @version 3.0.0
 * @author MaxModeAgent
 * 
 * Features:
 * - 새로운 네비게이션 구조 (시설찾기, 구인구직, 게시판, 코디네이터)
 * - AI 챗봇 중심의 히어로 섹션
 * - 서비스 소개 섹션 (세로 나열)
 * - 고정형 챗봇 팝업
 * - 반응형 디자인
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Maximize2
} from 'lucide-react';

import { Button } from '../shared/ui/Button';
import { Card, CardContent } from '../shared/ui/Card';
import { useAuthStore } from '../stores/authStore';
import { useSEO } from '../hooks/useSEO';

// 새로운 네비게이션 구조
const MAIN_NAVIGATION = [
  {
    id: 'facilities',
    title: '시설찾기',
    description: 'AI 기반 맞춤형 요양시설 검색 및 추천',
    icon: Building2,
    path: '/facility-search',
    gradient: 'from-blue-500 to-blue-600',
    features: ['AI 맞춤 추천', '상세 시설 정보', '리뷰 및 평점']
  },
  {
    id: 'jobs',
    title: '구인구직',
    description: '요양 분야 전문 구인구직 플랫폼',
    icon: Briefcase,
    path: '/jobs',
    gradient: 'from-green-500 to-green-600',
    features: ['전문 구인정보', '스킬 매칭', '면접 지원']
  },
  {
    id: 'boards',
    title: '게시판',
    description: '정보 공유 및 커뮤니티 소통 공간',
    icon: MessageCircle,
    path: '/boards',
    gradient: 'from-purple-500 to-purple-600',
    features: ['정보 공유', '질문 답변', '경험 공유']
  },
  {
    id: 'coordinator',
    title: '코디네이터',
    description: '전문 코디네이터의 1:1 맞춤 상담',
    icon: Users,
    path: '/coordinator/matching',
    gradient: 'from-orange-500 to-orange-600',
    features: ['1:1 상담', '맞춤 매칭', '전문 가이드']
  }
];

// 챗봇 인터페이스
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

/**
 * 새로운 네비게이션 헤더
 */
const LandingPageHeader: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: Elderberry 로고 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Elderberry</span>
          </div>

          {/* 중앙: 메인 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            {MAIN_NAVIGATION.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* 오른쪽: Sign In / Sign Up */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard')}
              >
                대시보드
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth/signin')}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/auth/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * AI 챗봇 히어로 섹션
 */
const ChatbotHeroSection: React.FC<{ onOpenChatbot: () => void }> = ({ onOpenChatbot }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50" />
      
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-emerald-200 rounded-full blur-2xl" />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-purple-200 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* AI 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl mb-8 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI가 도와주는
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              스마트 요양 서비스
            </span>
          </h1>

          {/* 서브타이틀 */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            인공지능 챗봇과 함께 최적의 요양시설을 찾고,
            <br className="hidden sm:block" />
            맞춤형 케어 솔루션을 경험해보세요.
          </p>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              variant="primary"
              onClick={onOpenChatbot}
              className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              AI 챗봇과 상담하기
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto px-8 py-4 text-lg"
            >
              <Link to="/facility-search">
                <Building2 className="w-5 h-5 mr-2" />
                시설 둘러보기
              </Link>
            </Button>
          </div>

          {/* 신뢰 지표 */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5.0 평점</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>1,000+ 만족 고객</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>전국 서비스</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/**
 * 서비스 섹션 (세로 나열)
 */
const ServicesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            엘더베리의 핵심 서비스
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            전문적이고 체계적인 요양 서비스로 더 나은 케어를 제공합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MAIN_NAVIGATION.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    variant="outline"
                    asChild
                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors duration-300"
                  >
                    <Link to={service.path}>
                      자세히 보기
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * 고정형 챗봇 팝업
 */
const FixedChatbotPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '안녕하세요! 엘더베리 AI 어시스턴트입니다. 어떤 도움이 필요하신가요?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // 시뮬레이션된 AI 응답
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '네, 말씀하신 내용을 이해했습니다. 더 자세한 정보를 위해 전문 상담사와 연결해드릴까요?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <>
      {/* 챗봇 열기 버튼 */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 챗봇 팝업 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.3 : 1, 
              y: isMinimized ? 100 : 0 
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 ${
              isMinimized ? 'pointer-events-none' : ''
            }`}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI 어시스턴트</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* 메시지 영역 */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                          message.isUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 입력 영역 */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * 메인 랜딩페이지 컴포넌트
 */
export const LandingPage: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  // SEO 최적화
  useSEO({
    title: 'Elderberry - AI 기반 스마트 요양 서비스',
    description: 'AI 챗봇과 함께하는 맞춤형 요양 시설 찾기, 구인구직, 전문 상담 서비스',
    keywords: '요양원, 요양시설, 구인구직, AI챗봇, 간병인, 코디네이터',
    ogTitle: 'Elderberry - 당신을 위한 스마트 요양 서비스',
    ogDescription: '인공지능이 도와주는 맞춤형 요양 서비스를 경험해보세요',
    canonicalUrl: 'https://elderberry.co.kr'
  });

  const handleOpenChatbot = () => {
    setShowChatbot(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 새로운 헤더 */}
      <LandingPageHeader />
      
      {/* AI 챗봇 히어로 섹션 */}
      <ChatbotHeroSection onOpenChatbot={handleOpenChatbot} />
      
      {/* 서비스 소개 섹션 */}
      <ServicesSection />
      
      {/* 고정형 챗봇 팝업 */}
      <FixedChatbotPopup />
    </div>
  );
};

export default LandingPage;