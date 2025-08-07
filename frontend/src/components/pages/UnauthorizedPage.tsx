/**
 * 권한 없음 페이지
 * 접근 권한이 없는 사용자에게 표시
 */
import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Shield
} from '../icons/LucideIcons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { MemberRole } from '../../types/auth';
import Button from '../../shared/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../shared/ui/Card';

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const state = location.state as { from?: string; requiredRoles?: MemberRole[] };
  const fromPath = state?.from || '/';
  const requiredRoles = state?.requiredRoles || [];

  // 역할 이름 매핑
  const roleNames = {
    [MemberRole.CAREGIVER]: '간병인',
    [MemberRole.EMPLOYER]: '고용주',
    [MemberRole.COORDINATOR]: '코디네이터',
    [MemberRole.ADMIN]: '관리자'
  };

  const currentRoleName = user ? roleNames[user.role] : '알 수 없음';
  const requiredRoleNames = requiredRoles.map(role => roleNames[role]).join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* 아이콘 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
          >
            <Shield className="w-10 h-10 text-red-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">접근 권한 없음</h1>
          <p className="text-gray-600 mt-2">요청한 페이지에 접근할 권한이 없습니다</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-red-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              권한 부족
            </CardTitle>
            <CardDescription>
              현재 사용자 권한으로는 이 페이지에 접근할 수 없습니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 권한 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">현재 권한:</span>
                <span className="text-sm font-semibold text-gray-900">{currentRoleName}</span>
              </div>
              
              {requiredRoles.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">필요 권한:</span>
                  <span className="text-sm font-semibold text-red-600">{requiredRoleNames}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">요청 경로:</span>
                <span className="text-sm font-mono text-gray-700 bg-white px-2 py-1 rounded">
                  {fromPath}
                </span>
              </div>
            </div>

            {/* 해결 방법 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">해결 방법</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 올바른 권한이 있는 계정으로 로그인하세요</li>
                <li>• 시스템 관리자에게 권한 요청을 문의하세요</li>
                <li>• 메인 페이지로 돌아가서 다른 기능을 이용하세요</li>
              </ul>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(-1)}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전 페이지로 돌아가기
              </Button>
              
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  fullWidth
                  className="flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  대시보드로 이동
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 문의 안내 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          권한 관련 문의사항이 있으시면{' '}
          <Link 
            to="/help" 
            className="text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            고객지원센터
          </Link>
          로 연락해주세요.
        </div>
      </motion.div>
    </div>
  );
}