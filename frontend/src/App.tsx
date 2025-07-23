/**
 * 메인 앱 컴포넌트
 * Elderberry 글로벌 요양원 구인구직 서비스
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HealthAssessmentWizard from './features/health/HealthAssessmentWizard';
import FacilitySearchPage from './features/facility/FacilitySearchPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 기본 경로 - 건강 평가로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/health-assessment" replace />} />
          
          {/* 건강 상태 평가 */}
          <Route 
            path="/health-assessment" 
            element={
              <HealthAssessmentWizard 
                memberId="1" 
                onComplete={(assessmentId) => {
                  console.log('건강 평가 완료:', assessmentId);
                  // 평가 완료 후 시설 검색으로 이동할 수 있음
                  window.location.href = '/facility-search';
                }}
                onCancel={() => {
                  console.log('건강 평가 취소');
                }}
              />
            } 
          />
          
          {/* 시설 검색 및 추천 */}
          <Route 
            path="/facility-search" 
            element={
              <FacilitySearchPage 
                memberId={1}
                coordinatorId="coordinator-1"
                showRecommendations={true}
              />
            } 
          />
          
          {/* 404 페이지 */}
          <Route path="*" element={<Navigate to="/health-assessment" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;