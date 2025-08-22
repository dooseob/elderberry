/**
 * About Page - 엘더베리 서비스 소개 페이지
 * FSD 아키텍처: pages 레이어
 * 
 * @version 1.0.0
 * @description 요양원 검색 및 매칭 서비스 엘더베리에 대한 상세 소개
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="feature-card bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="feature-icon mb-4 text-blue-600">
      {icon}
    </div>
    <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              엘더베리
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              어르신과 가족을 위한 <br className="md:hidden" />
              <span className="font-semibold">맞춤형 요양원 검색 서비스</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/facility-search')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
              >
                시설 찾기
              </Button>
              <Button 
                onClick={() => navigate('/auth/signup')}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
              >
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 엘더베리를 선택해야 할까요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              어르신의 건강상태와 선호도에 맞는 최적의 요양원을 찾아드립니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              }
              title="AI 맞춤형 추천"
              description="건강 상태, 선호도, 지역을 종합적으로 분석하여 최적의 요양원을 추천해드립니다"
            />
            
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              }
              title="지역별 상세 검색"
              description="원하시는 지역의 요양원 정보를 상세하게 검색하고 비교할 수 있습니다"
            />
            
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              }
              title="건강 평가 시스템"
              description="전문적인 건강 평가를 통해 어르신에게 필요한 케어 수준을 정확히 파악합니다"
            />
            
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
              title="전문 코디네이터"
              description="숙련된 전문 코디네이터가 상담부터 입소까지 전 과정을 지원합니다"
            />
            
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              }
              title="구인구직 플랫폼"
              description="요양원 취업을 희망하는 분들과 구인 중인 시설을 연결하는 플랫폼을 제공합니다"
            />
            
            <FeatureCard
              icon={
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              }
              title="안전한 정보 관리"
              description="개인정보와 건강정보를 안전하게 보호하며 투명한 정보 처리를 보장합니다"
            />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics-section bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              믿을 수 있는 서비스
            </h2>
            <p className="text-lg text-gray-600">
              많은 분들이 엘더베리를 통해 만족스러운 결과를 얻었습니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="stat-card">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-600">등록된 요양원</div>
            </div>
            <div className="stat-card">
              <div className="text-4xl font-bold text-green-600 mb-2">5,000+</div>
              <div className="text-gray-600">성공적인 매칭</div>
            </div>
            <div className="stat-card">
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">사용자 만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              우리의 사명
            </h2>
            <div className="max-w-4xl mx-auto text-lg text-gray-600 leading-relaxed">
              <p className="mb-6">
                엘더베리는 어르신들이 존엄하고 편안한 노후를 보낼 수 있도록, 
                그리고 가족들이 안심할 수 있도록 최선의 요양원 매칭 서비스를 제공합니다.
              </p>
              <p className="mb-6">
                우리는 단순히 시설을 찾아주는 것을 넘어서, 어르신 개개인의 특성과 필요를 
                깊이 이해하고 가장 적합한 케어 환경을 찾아드리는 것을 목표로 합니다.
              </p>
              <p>
                기술과 전문성, 그리고 따뜻한 마음으로 어르신과 가족 모두가 
                만족할 수 있는 솔루션을 제공하겠습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 시작해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            어르신에게 가장 적합한 요양원을 찾아보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/health-assessment')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              건강 평가 시작
            </Button>
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
            >
              상담 문의
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;