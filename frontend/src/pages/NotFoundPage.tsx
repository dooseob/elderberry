/**
 * NotFound Page - 404 오류 페이지
 * FSD 아키텍처: pages 레이어
 * 
 * @version 1.0.0
 * @description 존재하지 않는 페이지 접근 시 표시되는 404 에러 페이지
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card } from '../shared/ui';
import { useAuthStore } from '../stores/authStore';

interface SuggestedPageProps {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

const SuggestedPage: React.FC<SuggestedPageProps> = ({ 
  title, description, path, icon 
}) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(path)}
      className="suggested-page-card bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start space-x-3">
        <div className="text-blue-600 mt-1">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
};

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // 10초 후 홈으로 자동 리디렉션
  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, autoRedirect]);

  // 인증 상태에 따른 추천 페이지
  const getSuggestedPages = () => {
    const commonPages = [
      {
        title: '홈페이지',
        description: '엘더베리 메인 페이지로 이동',
        path: '/',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        )
      },
      {
        title: '시설 찾기',
        description: '요양원 검색 및 정보 확인',
        path: '/facility-search',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        )
      },
      {
        title: '서비스 소개',
        description: '엘더베리 서비스에 대해 알아보기',
        path: '/about',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        )
      },
      {
        title: '문의하기',
        description: '궁금한 점이나 도움이 필요한 경우',
        path: '/contact',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
        )
      }
    ];

    if (isAuthenticated) {
      return [
        ...commonPages,
        {
          title: '마이페이지',
          description: '내 정보 및 활동 이력 확인',
          path: '/mypage',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )
        },
        {
          title: '건강 평가',
          description: '맞춤형 요양원 추천을 위한 건강 평가',
          path: '/health-assessment',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          )
        }
      ];
    }

    return [
      ...commonPages,
      {
        title: '로그인',
        description: '엘더베리 서비스에 로그인하기',
        path: '/auth/signin',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        )
      }
    ];
  };

  const reportError = () => {
    // 실제로는 오류 리포팅 서비스에 전송
    const errorInfo = {
      path: location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    };
    
    console.log('404 에러 리포트:', errorInfo);
    
    // 사용자에게 피드백
    alert('오류가 보고되었습니다. 신속히 해결하겠습니다.');
  };

  return (
    <div className="not-found-page min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 일러스트 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-100 rounded-full mb-6">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-blue-600"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <circle cx="11" cy="11" r="3"/>
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            요청하신 페이지 <code className="bg-gray-100 px-2 py-1 rounded text-sm">{location.pathname}</code>를 
            찾을 수 없습니다. 주소를 다시 확인해보시거나 아래 추천 페이지를 이용해보세요.
          </p>
        </div>

        {/* 자동 리디렉션 알림 */}
        {autoRedirect && (
          <Card className="mb-8 p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-blue-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <p className="text-blue-800">
                {countdown}초 후 홈페이지로 이동합니다
              </p>
              <Button
                onClick={() => setAutoRedirect(false)}
                className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1"
              >
                취소
              </Button>
            </div>
          </Card>
        )}

        {/* 빠른 액션 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={() => navigate(-1)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M19 12H6m6-7l-7 7 7 7"/>
            </svg>
            이전 페이지
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            홈페이지
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            새로고침
          </Button>
        </div>

        {/* 추천 페이지 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            이런 페이지는 어떠세요?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSuggestedPages().map((page, index) => (
              <SuggestedPage key={index} {...page} />
            ))}
          </div>
        </div>

        {/* 도움말 섹션 */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            여전히 문제가 해결되지 않으시나요?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-blue-600 mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <Button
                onClick={() => navigate('/contact')}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm px-4 py-2"
              >
                고객 지원 문의
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-green-600 mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div className="font-medium text-gray-700 mb-1">전화 문의</div>
              <div className="text-gray-600">1588-1234</div>
            </div>
            
            <div className="text-center">
              <div className="text-red-600 mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <Button
                onClick={reportError}
                className="bg-red-100 text-red-700 hover:bg-red-200 text-sm px-4 py-2"
              >
                오류 신고하기
              </Button>
            </div>
          </div>
        </Card>

        {/* 푸터 정보 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            오류 시각: {new Date().toLocaleString('ko-KR')} | 
            오류 코드: 404 | 
            경로: {location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;