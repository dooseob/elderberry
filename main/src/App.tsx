import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { BlurredText } from "./components/BlurredText";
import { CTAButtons } from "./components/CTAButtons";
import { ArrowRight } from "lucide-react";
import FacilitiesPage from "./pages/FacilitiesPage";
import FacilityDetailPage from "./pages/FacilityDetailPage";
import JobsPage from "./pages/JobsPage";
import CommunityPageSimple from "./pages/CommunityPageSimple";
import HealthAssessmentPage from "./pages/HealthAssessmentPage";
import ChatPage from "./pages/ChatPage";
import StartPage from "./pages/StartPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// 홈페이지 컴포넌트
function HomePage() {
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    navigate('/start');
  };

  const handleLearnMore = () => {
    console.log('Learn More clicked');
  };

  const handleContactSales = () => {
    console.log('Contact Sales clicked');
  };

  const handleGetStarted = () => {
    navigate('/chat');
  };

  const words = [
    "Elderberry", "Is", "An", "AI-Powered", "Platform", "For", "Matching", "Care", "Services", "Perfectly"
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <Header onNavigate={(page) => navigate(`/${page}`)} currentPage="home" />

      {/* Hero Section */}
      <section 
        className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 lg:px-0 pt-16"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Main Heading */}
        <div className="flex flex-col items-center max-w-4xl mx-auto mb-16 relative z-10">
          {/* Main heading with blur effects */}
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-4 mb-12">
            {words.map((word, index) => (
              <BlurredText key={index} text={word} />
            ))}
          </div>

          {/* Sub Heading */}
          <div className="relative mb-12">
            <div className="absolute inset-0 blur-sm opacity-50 pointer-events-none">
              <p className="hero-subheading text-text-secondary text-center max-w-md">
                AI 기반 요양보호사 매칭 시스템으로 최적의 돌봄 서비스를 찾아드립니다.
              </p>
            </div>
            <p className="relative hero-subheading text-text-secondary text-center max-w-md">
              AI 기반 요양보호사 매칭 시스템으로 최적의 돌봄 서비스를 찾아드립니다.
            </p>
          </div>

          {/* CTA Buttons */}
          <CTAButtons
            onStartBuilding={handleStartBuilding}
            onLearnMore={handleLearnMore}
          />
        </div>
      </section>

      {/* 시설찾기 Section */}
      <section className="relative w-full py-32 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-6xl mx-auto px-6 lg:px-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-text-main text-5xl font-semibold leading-tight tracking-tight">
                믿을 수 있는 요양시설 찾기
              </h2>

              <p className="text-text-muted text-lg leading-relaxed max-w-sm">
                우리 지역의 검증된 요양시설을 쉽게 비교하고 선택하세요. 평점, 리뷰, 시설 정보를 한눈에 확인할 수 있습니다.
              </p>

              <div 
                onClick={() => navigate('/facilities')}
                className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                <span className="font-semibold">시설 둘러보기</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="요양시설 내부 모습" 
                className="w-full h-auto rounded-xl border border-border-light shadow-2xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 구인구직 Section */}
      <section className="relative w-full py-32 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-6xl mx-auto px-6 lg:px-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="요양보호사 근무 모습" 
                className="w-full h-auto rounded-xl border border-border-light shadow-2xl" 
              />
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-text-main text-5xl font-semibold leading-tight tracking-tight">
                전문 요양보호사 채용
              </h2>

              <p className="text-text-muted text-lg leading-relaxed max-w-sm">
                경험 많은 요양보호사를 찾거나 최적의 일자리를 발견하세요. 전문적인 매칭 시스템으로 완벽한 연결을 도와드립니다.
              </p>

              <div 
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                <span className="font-semibold">채용정보 보기</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 커뮤니티 Section */}
      <section className="relative w-full py-32 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-6xl mx-auto px-6 lg:px-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-text-main text-5xl font-semibold leading-tight tracking-tight">
                따뜻한 소통 커뮤니티
              </h2>

              <p className="text-text-muted text-lg leading-relaxed max-w-sm">
                요양보호사와 가족들이 함께 모여 경험을 나누고 서로 도움을 주는 따뜻한 공간입니다. 실무 노하우부터 마음의 위로까지.
              </p>

              <div 
                onClick={() => navigate('/community')}
                className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                <span className="font-semibold">커뮤니티 참여하기</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="사람들이 함께 대화하는 모습" 
                className="w-full h-auto rounded-xl border border-border-light shadow-2xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 건강평가 Section */}
      <section className="relative w-full py-32 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-6xl mx-auto px-6 lg:px-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="건강 검진을 받는 어르신" 
                className="w-full h-auto rounded-xl border border-border-light shadow-2xl" 
              />
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-text-main text-5xl font-semibold leading-tight tracking-tight">
                종합 건강평가 시스템
              </h2>

              <p className="text-text-muted text-lg leading-relaxed max-w-sm">
                체계적인 건강 상태 평가를 통해 개인 맞춤형 케어 계획을 제공합니다. 전문적인 분석과 권장사항으로 건강한 노후를 준비하세요.
              </p>

              <div 
                onClick={() => navigate('/health-assessment')}
                className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                <span className="font-semibold">건강평가 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative w-full py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-0 text-center">
          <h2 className="text-text-main text-4xl font-semibold mb-8 tracking-tight">
            지금 바로 시작해보세요
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={handleContactSales}
              className="border border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-200"
            >
              문의하기
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
            >
              채팅 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-gray-50 border-t border-border-light">
        <div className="max-w-6xl mx-auto px-6 lg:px-0">
          {/* Main Footer Content */}
          <div className="py-16 grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <span className="text-text-main font-bold text-lg">Elderberry</span>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                AI 기반 요양보호사 매칭 플랫폼으로 최적의 돌봄 서비스를 제공합니다.
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-text-main font-semibold mb-4">서비스</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate('/facilities')}
                    className="text-text-muted hover:text-primary transition-colors text-sm"
                  >
                    시설찾기
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/jobs')}
                    className="text-text-muted hover:text-primary transition-colors text-sm"
                  >
                    구인구직
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/community')}
                    className="text-text-muted hover:text-primary transition-colors text-sm"
                  >
                    커뮤니티
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/health-assessment')}
                    className="text-text-muted hover:text-primary transition-colors text-sm"
                  >
                    건강평가
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-text-main font-semibold mb-4">고객지원</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    이용가이드
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    고객센터
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    1:1 문의
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-text-main font-semibold mb-4">회사소개</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    회사소개
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    채용정보
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    파트너십
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-muted hover:text-primary transition-colors text-sm">
                    언론보도
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="py-6 border-t border-border-light">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-text-muted">
                <span>© 2024 Elderberry. All rights reserved.</span>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
                  <a href="#" className="hover:text-primary transition-colors">이용약관</a>
                  <a href="#" className="hover:text-primary transition-colors">쿠키정책</a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>고객센터</span>
                <span className="text-primary font-semibold">1588-0000</span>
                <span>|</span>
                <span>평일 09:00-18:00</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="py-4 border-t border-border-light">
            <div className="text-xs text-text-muted leading-relaxed">
              <p className="mb-2">
                <strong>Elderberry</strong>는 요양보호사와 이용자를 연결하는 중개 플랫폼입니다. 
                실제 서비스는 등록된 요양보호사 및 요양기관에서 제공됩니다.
              </p>
              <p>
                사업자등록번호: 123-45-67890 | 통신판매업신고: 2024-서울강남-0000 | 
                대표: [대표자명] | 주소: 서울특별시 강남구 테헤란로 123, 4층
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 각 페이지 컴포넌트들을 Router와 연결하는 래퍼 컴포넌트들
function StartPageWrapper() {
  const navigate = useNavigate();
  
  const handleStartChat = (prompt?: string) => {
    navigate('/chat', { state: { initialPrompt: prompt } });
  };

  return (
    <StartPage 
      onStartChat={handleStartChat} 
      onGoHome={() => navigate('/')} 
      onGoLogin={() => navigate('/login')}
      onGoSignup={() => navigate('/signup')}
    />
  );
}

function ChatPageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt;

  return (
    <ChatPage 
      onGoHome={() => navigate('/start')} 
      onGoMainPage={() => navigate('/')}
      onGoLogin={() => navigate('/login')}
      initialPrompt={initialPrompt} 
    />
  );
}

function LoginPageWrapper() {
  const navigate = useNavigate();

  return (
    <LoginPage 
      onGoHome={() => navigate('/')} 
      onGoSignup={() => navigate('/signup')} 
    />
  );
}

function SignupPageWrapper() {
  const navigate = useNavigate();

  return (
    <SignupPage 
      onGoHome={() => navigate('/')} 
      onGoLogin={() => navigate('/login')} 
    />
  );
}

// 메인 App 컴포넌트
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Header를 표시하지 않을 페이지들
  const hideHeaderPages = ['/chat', '/start', '/login', '/signup'];
  const shouldShowHeader = !hideHeaderPages.includes(location.pathname);

  return (
    <div className="min-h-screen w-full bg-white">
      {shouldShowHeader && (
        <Header onNavigate={(page) => navigate(`/${page}`)} currentPage={location.pathname.slice(1) || 'home'} />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/facilities/:id" element={<FacilityDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/community" element={<CommunityPageSimple />} />
        <Route path="/health-assessment" element={<HealthAssessmentPage />} />
        <Route path="/start" element={<StartPageWrapper />} />
        <Route path="/chat" element={<ChatPageWrapper />} />
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/signup" element={<SignupPageWrapper />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;