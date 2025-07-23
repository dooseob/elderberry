/**
 * 메인 앱 컴포넌트
 * LightCare 글로벌 요양원 구인구직 서비스
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HealthAssessmentWizard from '@/features/health/HealthAssessmentWizard';
import './App.css';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* 건강 평가 체크리스트 페이지 */}
            <Route 
              path="/health-assessment" 
              element={
                <HealthAssessmentWizard 
                  memberId="user123" // 실제로는 로그인한 사용자 ID
                  onComplete={(assessmentId) => {
                    console.log('평가 완료:', assessmentId);
                    // 결과 페이지로 이동
                  }}
                  onCancel={() => {
                    console.log('평가 취소');
                    // 홈으로 이동
                  }}
                />
              } 
            />
            
            {/* 기본 홈 페이지 (임시) */}
            <Route 
              path="/" 
              element={
                <div className="min-h-screen bg-elderberry-25 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-elderberry-800 mb-4">
                      LightCare
                    </h1>
                    <p className="text-elderberry-600 mb-8">
                      글로벌 요양원 구인구직 서비스
                    </p>
                    <a 
                      href="/health-assessment"
                      className="inline-block px-6 py-3 bg-elderberry-600 text-white rounded-lg hover:bg-elderberry-700 transition-colors"
                    >
                      건강 상태 평가 시작하기
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;