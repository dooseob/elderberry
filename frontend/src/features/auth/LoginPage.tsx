/**
 * 로그인 페이지
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail
} from '../../components/icons/LucideIcons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuthStore } from '../../stores/authStore';
import { LoginRequest } from '../../types/auth';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { useToastContext } from '../../hooks/useToast';
import { useSEO, SEOPresets } from '../../hooks/useSEO';

// 폼 검증 스키마
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const toast = useToastContext();
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // SEO 설정
  useSEO(SEOPresets.login);

  // 리다이렉트 처리
  const from = (location.state as any)?.from || '/dashboard';

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // 에러 클리어
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('로그인 성공', {
        description: '엘더베리에 오신 것을 환영합니다!'
      });
      navigate(from, { replace: true });
    } catch (error) {
      // 에러는 스토어에서 처리됨
      toast.error('로그인 실패', {
        description: '이메일 또는 비밀번호를 확인해주세요.'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-elderberry-50 to-elderberry-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 bg-elderberry-600 rounded-full flex items-center justify-center"
          >
            <span className="text-2xl text-white font-bold">E</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-elderberry-900">Elderberry</h1>
          <p className="text-elderberry-600 mt-2">글로벌 요양 서비스 플랫폼에 오신 것을 환영합니다</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-elderberry-900">로그인</CardTitle>
            <CardDescription>계정에 로그인하여 서비스를 이용해보세요</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className={`
                      w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 transition-colors
                      ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                    `}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    className={`
                      w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 transition-colors min-h-[44px]
                      ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                    `}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600" role="alert">{errors.password.message}</p>
                )}
              </div>

              {/* 로그인 유지 및 비밀번호 찾기 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500 focus:ring-2 focus:ring-offset-2"
                    aria-describedby="remember-me-desc"
                  />
                  <span className="text-sm text-gray-700">로그인 상태 유지</span>
                  <span id="remember-me-desc" className="sr-only">체크하면 다음에 자동으로 로그인됩니다</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-elderberry-600 hover:text-elderberry-800 transition-colors focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  비밀번호 찾기
                </Link>
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                className="py-3 text-base font-semibold"
              >
                {isLoading ? '로그인 중...' : '로그인'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 회원가입 링크 */}
            <div className="text-center">
              <span className="text-sm text-gray-600">계정이 없으신가요? </span>
              <Link
                to="/register"
                className="text-sm text-elderberry-600 hover:text-elderberry-800 font-medium transition-colors"
              >
                회원가입하기
              </Link>
            </div>

            {/* 챗봇 링크 */}
            <div className="text-center">
              <Link
                to="/chat-home"
                className="text-sm text-gray-600 hover:text-elderberry-600 transition-colors"
              >
                🤖 로그인 없이 챗봇 사용하기
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* 하단 링크 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link to="/terms" className="hover:text-elderberry-600 transition-colors">이용약관</Link>
          <span className="mx-2">•</span>
          <Link to="/privacy" className="hover:text-elderberry-600 transition-colors">개인정보처리방침</Link>
          <span className="mx-2">•</span>
          <Link to="/help" className="hover:text-elderberry-600 transition-colors">고객지원</Link>
        </div>
      </motion.div>
    </div>
  );
}