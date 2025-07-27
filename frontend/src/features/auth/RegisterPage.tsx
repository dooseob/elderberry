/**
 * 회원가입 페이지
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User
} from '../../components/icons/LucideIcons';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuthStore } from '../../stores/authStore';
import { RegisterRequest, MemberRole } from '../../types/auth';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

// 폼 검증 스키마
const registerSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 영문 대소문자와 숫자를 포함해야 합니다'),
  confirmPassword: z
    .string()
    .min(1, '비밀번호 확인을 입력해주세요'),
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자를 초과할 수 없습니다'),
  phone: z
    .string()
    .optional()
    .refine((phone) => !phone || /^[0-9-+().\s]+$/.test(phone), '올바른 전화번호 형식이 아닙니다'),
  role: z.nativeEnum(MemberRole),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, '이용약관에 동의해주세요'),
  agreeToPrivacy: z
    .boolean()
    .refine(val => val === true, '개인정보처리방침에 동의해주세요')
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

// 역할별 설명
const roleDescriptions = {
  [MemberRole.CAREGIVER]: {
    title: '간병인',
    description: '환자 돌봄 서비스를 제공하는 전문 간병인',
    icon: '🏥'
  },
  [MemberRole.COORDINATOR]: {
    title: '코디네이터',
    description: '간병인과 고용주를 연결하는 전문 코디네이터',
    icon: '🤝'
  },
  [MemberRole.EMPLOYER]: {
    title: '고용주',
    description: '간병 서비스를 필요로 하는 개인 또는 기관',
    icon: '👨‍👩‍👧‍👦'
  }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 단계별 회원가입

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 에러 클리어
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: MemberRole.CAREGIVER,
      agreeToTerms: false,
      agreeToPrivacy: false
    },
    mode: 'onChange'
  });

  const watchedPassword = watch('password');
  const watchedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, agreeToTerms, agreeToPrivacy, ...registerData } = data;
      await registerUser(registerData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // 에러는 스토어에서 처리됨
    }
  };

  // 비밀번호 강도 체크
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return score;
  };

  const passwordStrength = watchedPassword ? getPasswordStrength(watchedPassword) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-elderberry-50 to-elderberry-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8 pt-8">
          <Link
            to="/login"
            className="inline-flex items-center text-elderberry-600 hover:text-elderberry-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            로그인으로 돌아가기
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 mx-auto mb-4 bg-elderberry-600 rounded-full flex items-center justify-center"
          >
            <span className="text-2xl text-white font-bold">E</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-elderberry-900">계정 만들기</h1>
          <p className="text-elderberry-600 mt-2">Elderberry에 가입하여 전문적인 요양 서비스를 경험해보세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-elderberry-900">회원가입</CardTitle>
                  <CardDescription>
                    {step === 1 ? '기본 정보를 입력해주세요' : '약관 동의 및 계정 생성'}
                  </CardDescription>
                </div>
                <div className="text-sm text-gray-500">
                  {step}/2 단계
                </div>
              </div>
              
              {/* 진행 바 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-elderberry-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>
            </CardHeader>

            <CardContent>
              {/* 에러 메시지 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* 역할 선택 */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        가입 유형 선택 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(roleDescriptions).map(([role, info]) => (
                          <label
                            key={role}
                            className={`
                              relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                              ${watchedRole === role 
                                ? 'border-elderberry-500 bg-elderberry-50' 
                                : 'border-gray-200 hover:border-elderberry-300'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              value={role}
                              {...register('role')}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <div className="text-3xl mb-2">{info.icon}</div>
                              <div className="font-semibold text-gray-900">{info.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{info.description}</div>
                            </div>
                            {watchedRole === role && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-5 h-5 text-elderberry-500" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 이름 */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="name"
                          type="text"
                          placeholder="홍길동"
                          className={`
                            w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 transition-colors
                            ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                          `}
                          {...register('name')}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {/* 이메일 */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        이메일 <span className="text-red-500">*</span>
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

                    {/* 전화번호 */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        전화번호 (선택)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="phone"
                          type="tel"
                          placeholder="010-1234-5678"
                          className={`
                            w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 transition-colors
                            ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                          `}
                          {...register('phone')}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* 비밀번호 */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        비밀번호 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="8자 이상, 영문 대소문자와 숫자 포함"
                          className={`
                            w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 transition-colors
                            ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                          `}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* 비밀번호 강도 표시 */}
                      {watchedPassword && (
                        <div className="space-y-2">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-2 flex-1 rounded ${
                                  i < passwordStrength
                                    ? passwordStrength <= 2 ? 'bg-red-400' 
                                      : passwordStrength <= 3 ? 'bg-yellow-400'
                                      : 'bg-green-400'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">
                            강도: {
                              passwordStrength <= 2 ? '약함' :
                              passwordStrength <= 3 ? '보통' :
                              passwordStrength <= 4 ? '강함' : '매우 강함'
                            }
                          </p>
                        </div>
                      )}
                      
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        비밀번호 확인 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="비밀번호를 다시 입력하세요"
                          className={`
                            w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 transition-colors
                            ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                          `}
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      variant="primary"
                      fullWidth
                      className="py-3"
                    >
                      다음 단계
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* 약관 동의 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">약관 동의</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500 mt-0.5"
                            {...register('agreeToTerms')}
                          />
                          <div className="flex-1">
                            <span className="text-sm text-gray-900">
                              <span className="text-red-500">*</span> 이용약관에 동의합니다
                            </span>
                            <Link to="/terms" className="text-elderberry-600 hover:text-elderberry-800 ml-2 text-sm underline">
                              약관 보기
                            </Link>
                          </div>
                        </label>
                        {errors.agreeToTerms && (
                          <p className="text-sm text-red-600 ml-8">{errors.agreeToTerms.message}</p>
                        )}

                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-elderberry-600 border-gray-300 rounded focus:ring-elderberry-500 mt-0.5"
                            {...register('agreeToPrivacy')}
                          />
                          <div className="flex-1">
                            <span className="text-sm text-gray-900">
                              <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다
                            </span>
                            <Link to="/privacy" className="text-elderberry-600 hover:text-elderberry-800 ml-2 text-sm underline">
                              방침 보기
                            </Link>
                          </div>
                        </label>
                        {errors.agreeToPrivacy && (
                          <p className="text-sm text-red-600 ml-8">{errors.agreeToPrivacy.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="flex-1 py-3"
                      >
                        이전 단계
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isLoading}
                        className="flex-1 py-3"
                      >
                        {isLoading ? '계정 생성 중...' : '계정 만들기'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </CardContent>

            <CardFooter className="text-center">
              <div className="text-sm text-gray-600">
                이미 계정이 있으신가요? 
                <Link
                  to="/login"
                  className="text-elderberry-600 hover:text-elderberry-800 font-medium ml-1 transition-colors"
                >
                  로그인하기
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}