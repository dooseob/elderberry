/**
 * 메인 앱 컴포넌트
 * Elderberry 글로벌 요양원 구인구직 서비스
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 인증 관련 컴포넌트
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// 레이아웃 컴포넌트
import MainLayout from './components/layout/MainLayout';

// 페이지 컴포넌트
import DashboardPage from './features/dashboard/DashboardPage';
import UnauthorizedPage from './components/pages/UnauthorizedPage';

// 기존 기능 컴포넌트
import HealthAssessmentWizard from './features/health/HealthAssessmentWizard';
import FacilitySearchPage from './features/facility/FacilitySearchPage';
import ChatHomePage from './features/chat/components/ChatHomePage';
import ChatPage from './features/chat/components/ChatPage';

// 게시판 컴포넌트
import BoardListPage from './features/boards/BoardListPage';
import PostDetailPage from './features/boards/PostDetailPage';
import PostCreatePage from './features/boards/PostCreatePage';

// 프로필 관리 컴포넌트
import ProfileListPage from './features/profile/ProfileListPage';
import ProfileDetailPage from './features/profile/ProfileDetailPage';

import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* 챗봇 (인증 없이 사용 가능) */}
          <Route path="/chat-home" element={<ChatHomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          
          {/* 보호된 라우트 */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/health-assessment" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <HealthAssessmentWizard 
                    memberId="1" 
                    onComplete={(assessmentId) => {
                      console.log('건강 평가 완료:', assessmentId);
                      window.location.href = '/facility-search';
                    }}
                    onCancel={() => {
                      console.log('건강 평가 취소');
                    }}
                  />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/facility-search" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FacilitySearchPage 
                    memberId={1}
                    coordinatorId="coordinator-1"
                    showRecommendations={true}
                  />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* 게시판 라우트 */}
          <Route 
            path="/boards" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BoardListPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/boards/create-post" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PostCreatePage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/boards/:boardId" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BoardListPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/boards/:boardId/posts/:postId" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PostDetailPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* 프로필 관리 라우트 */}
          <Route 
            path="/profiles" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfileListPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profiles/:profileType/:profileId" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfileDetailPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* 기본 경로 - 로그인 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 페이지 - 대시보드로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;