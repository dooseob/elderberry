/**
 * 폼 컴포넌트 데모 섹션 - 폼 전문가 구현
 * Authentication, Validation, States 데모
 * 
 * @author 폼 전문가 (서브 에이전트 시스템)
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  LogIn,
  UserPlus,
  Shield,
  Key,
  Smartphone
} from 'lucide-react';

import { Button } from '../../../shared/ui';
import { Input } from '../../../shared/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../shared/ui';
import { Badge } from '../../../shared/ui';

/**
 * 로그인 폼 데모
 */
const LoginFormDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [formState, setFormState] = useState({
    isLoading: false,
    showPassword: false,
    errors: {} as Record<string, string>,
    touched: {} as Record<string, boolean>
  });

  const validateField = useCallback((field: string, value: any) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'email':
        if (!value) {
          errors.email = '이메일은 필수입니다';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = '올바른 이메일 형식이 아닙니다';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = '비밀번호는 필수입니다';
        } else if (value.length < 6) {
          errors.password = '비밀번호는 최소 6자 이상이어야 합니다';
        }
        break;
    }
    
    return errors;
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formState.touched[field]) {
      const fieldErrors = validateField(field, value);
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, ...fieldErrors, [field]: fieldErrors[field] || undefined }
      }));
    }
  }, [formState.touched, validateField]);

  const handleBlur = useCallback((field: string) => {
    setFormState(prev => ({ ...prev, touched: { ...prev.touched, [field]: true } }));
    const fieldErrors = validateField(field, formData[field as keyof typeof formData]);
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...fieldErrors }
    }));
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allErrors = {
      ...validateField('email', formData.email),
      ...validateField('password', formData.password)
    };
    
    setFormState(prev => ({
      ...prev,
      errors: allErrors,
      touched: { email: true, password: true }
    }));
    
    if (Object.keys(allErrors).length === 0) {
      setFormState(prev => ({ ...prev, isLoading: true }));
      
      // 시뮬레이션 로딩
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormState(prev => ({ ...prev, isLoading: false }));
      alert('로그인 성공!');
    }
  }, [formData, validateField]);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          로그인
        </CardTitle>
        <CardDescription>
          계정에 로그인하여 서비스를 이용하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="your.email@example.com"
            startIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            errorText={formState.touched.email ? formState.errors.email : undefined}
            required
          />
          
          <Input
            label="비밀번호"
            type={formState.showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력하세요"
            startIcon={<Lock className="w-4 h-4" />}
            endIcon={
              <button
                type="button"
                onClick={() => setFormState(prev => ({ 
                  ...prev, 
                  showPassword: !prev.showPassword 
                }))}
                className="text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-text-primary)]"
              >
                {formState.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            errorText={formState.touched.password ? formState.errors.password : undefined}
            required
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 text-[var(--linear-color-accent)] bg-[var(--linear-color-surface-input)] border-[var(--linear-color-border-input)] rounded focus:ring-[var(--linear-color-accent)]"
              />
              <span className="text-sm text-[var(--linear-color-text-primary)]">
                로그인 유지
              </span>
            </label>
            <button
              type="button"
              className="text-sm text-[var(--linear-color-accent)] hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={formState.isLoading}
            disabled={formState.isLoading}
          >
            {formState.isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-[var(--linear-color-text-secondary)] text-center w-full">
          계정이 없으신가요?{' '}
          <button className="text-[var(--linear-color-accent)] hover:underline">
            회원가입
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};

/**
 * 회원가입 폼 데모
 */
const RegisterFormDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    newsletter: false
  });

  const [formState, setFormState] = useState({
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    errors: {} as Record<string, string>,
    touched: {} as Record<string, boolean>,
    step: 1,
    maxStep: 3
  });

  const validateField = useCallback((field: string, value: any) => {
    const errors: Record<string, string> = {};
    
    switch (field) {
      case 'username':
        if (!value) {
          errors.username = '사용자명은 필수입니다';
        } else if (value.length < 3) {
          errors.username = '사용자명은 최소 3자 이상이어야 합니다';
        }
        break;
      case 'email':
        if (!value) {
          errors.email = '이메일은 필수입니다';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = '올바른 이메일 형식이 아닙니다';
        }
        break;
      case 'phone':
        if (!value) {
          errors.phone = '전화번호는 필수입니다';
        } else if (!/^[\d-+().\s]+$/.test(value)) {
          errors.phone = '올바른 전화번호 형식이 아닙니다';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = '비밀번호는 필수입니다';
        } else if (value.length < 8) {
          errors.password = '비밀번호는 최소 8자 이상이어야 합니다';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = '대소문자와 숫자를 포함해야 합니다';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = '비밀번호 확인은 필수입니다';
        } else if (value !== formData.password) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }
        break;
      case 'agreeTerms':
        if (!value) {
          errors.agreeTerms = '이용약관에 동의해야 합니다';
        }
        break;
    }
    
    return errors;
  }, [formData.password]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formState.touched[field]) {
      const fieldErrors = validateField(field, value);
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, ...fieldErrors, [field]: fieldErrors[field] || undefined }
      }));
    }
  }, [formState.touched, validateField]);

  const nextStep = useCallback(() => {
    const currentStepFields = getCurrentStepFields();
    const stepErrors: Record<string, string> = {};
    
    currentStepFields.forEach(field => {
      const fieldErrors = validateField(field, formData[field as keyof typeof formData]);
      Object.assign(stepErrors, fieldErrors);
    });
    
    const newTouched = currentStepFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...stepErrors },
      touched: { ...prev.touched, ...newTouched }
    }));
    
    if (Object.keys(stepErrors).length === 0) {
      setFormState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  }, [formData, validateField]);

  const prevStep = useCallback(() => {
    setFormState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  }, []);

  const getCurrentStepFields = () => {
    switch (formState.step) {
      case 1: return ['username', 'email'];
      case 2: return ['phone', 'password', 'confirmPassword'];
      case 3: return ['agreeTerms'];
      default: return [];
    }
  };

  const renderStep = () => {
    switch (formState.step) {
      case 1:
        return (
          <div className="space-y-4">
            <Input
              label="사용자명"
              placeholder="사용자명을 입력하세요"
              startIcon={<User className="w-4 h-4" />}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              errorText={formState.touched.username ? formState.errors.username : undefined}
              required
            />
            <Input
              label="이메일"
              type="email"
              placeholder="your.email@example.com"
              startIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              errorText={formState.touched.email ? formState.errors.email : undefined}
              required
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="전화번호"
              type="tel"
              placeholder="010-1234-5678"
              startIcon={<Phone className="w-4 h-4" />}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              errorText={formState.touched.phone ? formState.errors.phone : undefined}
              required
            />
            <Input
              label="비밀번호"
              type={formState.showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              startIcon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setFormState(prev => ({ 
                    ...prev, 
                    showPassword: !prev.showPassword 
                  }))}
                  className="text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-text-primary)]"
                >
                  {formState.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              errorText={formState.touched.password ? formState.errors.password : undefined}
              helperText="대소문자, 숫자 포함 8자 이상"
              required
            />
            <Input
              label="비밀번호 확인"
              type={formState.showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력하세요"
              startIcon={<Key className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setFormState(prev => ({ 
                    ...prev, 
                    showConfirmPassword: !prev.showConfirmPassword 
                  }))}
                  className="text-[var(--linear-color-text-secondary)] hover:text-[var(--linear-color-text-primary)]"
                >
                  {formState.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              errorText={formState.touched.confirmPassword ? formState.errors.confirmPassword : undefined}
              required
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  className="w-4 h-4 mt-1 text-[var(--linear-color-accent)] bg-[var(--linear-color-surface-input)] border-[var(--linear-color-border-input)] rounded focus:ring-[var(--linear-color-accent)]"
                />
                <div>
                  <span className="text-sm text-[var(--linear-color-text-primary)]">
                    이용약관 및 개인정보처리방침에 동의합니다 <span className="text-[var(--linear-color-error)]">*</span>
                  </span>
                  <p className="text-xs text-[var(--linear-color-text-secondary)] mt-1">
                    서비스 이용을 위해 반드시 동의해야 합니다.
                  </p>
                </div>
              </label>
              
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                  className="w-4 h-4 mt-1 text-[var(--linear-color-accent)] bg-[var(--linear-color-surface-input)] border-[var(--linear-color-border-input)] rounded focus:ring-[var(--linear-color-accent)]"
                />
                <div>
                  <span className="text-sm text-[var(--linear-color-text-primary)]">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </span>
                  <p className="text-xs text-[var(--linear-color-text-secondary)] mt-1">
                    새로운 소식과 혜택을 이메일로 받아보세요.
                  </p>
                </div>
              </label>
            </div>
            
            {formState.touched.agreeTerms && formState.errors.agreeTerms && (
              <p className="text-sm text-[var(--linear-color-error)] flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {formState.errors.agreeTerms}
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          회원가입 ({formState.step}/{formState.maxStep})
        </CardTitle>
        <CardDescription>
          새 계정을 만들어 서비스를 시작하세요
        </CardDescription>
        
        {/* 진행 표시기 */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: formState.maxStep }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i + 1 <= formState.step
                  ? 'bg-[var(--linear-color-accent)]'
                  : 'bg-[var(--linear-color-surface-panel)]'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={formState.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2 w-full">
          {formState.step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              이전
            </Button>
          )}
          <Button
            variant="primary"
            className="flex-1"
            onClick={formState.step < formState.maxStep ? nextStep : undefined}
            loading={formState.isLoading}
          >
            {formState.step < formState.maxStep ? '다음' : '회원가입 완료'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

/**
 * 실시간 검증 데모
 */
const ValidationDemo: React.FC = () => {
  const [values, setValues] = useState({
    email: '',
    username: '',
    password: '',
    url: '',
    number: ''
  });

  const [validationResults, setValidationResults] = useState<Record<string, {
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>>({});

  const validators = {
    email: (value: string) => {
      if (!value) return { isValid: false, message: '이메일을 입력하세요', type: 'error' as const };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { isValid: false, message: '올바른 이메일 형식이 아닙니다', type: 'error' as const };
      }
      return { isValid: true, message: '올바른 이메일입니다', type: 'success' as const };
    },
    
    username: (value: string) => {
      if (!value) return { isValid: false, message: '사용자명을 입력하세요', type: 'error' as const };
      if (value.length < 3) {
        return { isValid: false, message: '3자 이상 입력하세요', type: 'error' as const };
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return { isValid: false, message: '영문, 숫자, 밑줄(_)만 사용 가능합니다', type: 'error' as const };
      }
      if (value.length > 20) {
        return { isValid: false, message: '20자 이하로 입력하세요', type: 'error' as const };
      }
      return { isValid: true, message: '사용 가능한 사용자명입니다', type: 'success' as const };
    },
    
    password: (value: string) => {
      if (!value) return { isValid: false, message: '비밀번호를 입력하세요', type: 'error' as const };
      
      const checks = [
        { test: value.length >= 8, message: '8자 이상' },
        { test: /[a-z]/.test(value), message: '소문자 포함' },
        { test: /[A-Z]/.test(value), message: '대문자 포함' },
        { test: /\d/.test(value), message: '숫자 포함' },
        { test: /[!@#$%^&*(),.?":{}|<>]/.test(value), message: '특수문자 포함' }
      ];
      
      const passed = checks.filter(check => check.test).length;
      
      if (passed < 3) {
        return { isValid: false, message: `보안 강도 낮음 (${passed}/5)`, type: 'error' as const };
      } else if (passed < 4) {
        return { isValid: false, message: `보안 강도 보통 (${passed}/5)`, type: 'warning' as const };
      } else {
        return { isValid: true, message: `보안 강도 높음 (${passed}/5)`, type: 'success' as const };
      }
    }
  };

  const handleChange = useCallback((field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validators[field as keyof typeof validators]) {
      const result = validators[field as keyof typeof validators](value);
      setValidationResults(prev => ({ ...prev, [field]: result }));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[var(--linear-color-text-primary)]">
        실시간 입력 검증
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader>
            <CardTitle size="sm">이메일 검증</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="이메일 주소"
              type="email"
              placeholder="example@domain.com"
              startIcon={<Mail className="w-4 h-4" />}
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              successText={validationResults.email?.type === 'success' ? validationResults.email.message : undefined}
              errorText={validationResults.email?.type === 'error' ? validationResults.email.message : undefined}
              endIcon={validationResults.email?.isValid ? <Check className="w-4 h-4 text-[var(--linear-color-success)]" /> : undefined}
            />
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle size="sm">사용자명 검증</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="사용자명"
              placeholder="username123"
              startIcon={<User className="w-4 h-4" />}
              value={values.username}
              onChange={(e) => handleChange('username', e.target.value)}
              successText={validationResults.username?.type === 'success' ? validationResults.username.message : undefined}
              errorText={validationResults.username?.type === 'error' ? validationResults.username.message : undefined}
              endIcon={validationResults.username?.isValid ? <Check className="w-4 h-4 text-[var(--linear-color-success)]" /> : undefined}
            />
          </CardContent>
        </Card>

        <Card className="p-4 md:col-span-2">
          <CardHeader>
            <CardTitle size="sm">비밀번호 강도 검증</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              startIcon={<Lock className="w-4 h-4" />}
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              helperText={validationResults.password?.message}
              successText={validationResults.password?.type === 'success' ? validationResults.password.message : undefined}
              errorText={validationResults.password?.type === 'error' ? validationResults.password.message : undefined}
            />
            
            {/* 비밀번호 강도 표시기 */}
            {values.password && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-[var(--linear-color-text-secondary)] mb-1">
                  <span>비밀번호 강도</span>
                  <span>{validationResults.password?.message}</span>
                </div>
                <div className="w-full bg-[var(--linear-color-surface-panel)] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      validationResults.password?.type === 'error' ? 'bg-[var(--linear-color-error)] w-1/3' :
                      validationResults.password?.type === 'warning' ? 'bg-[var(--linear-color-warning)] w-2/3' :
                      'bg-[var(--linear-color-success)] w-full'
                    }`}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * 폼 컴포넌트 데모 메인 컴포넌트
 */
const FormComponentDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'login' | 'register' | 'validation'>('login');

  return (
    <div className="form-component-demo space-y-8">
      {/* 데모 선택 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeDemo === 'login' ? 'primary' : 'outline'}
          onClick={() => setActiveDemo('login')}
          icon={<LogIn className="w-4 h-4" />}
        >
          로그인 폼
        </Button>
        <Button
          variant={activeDemo === 'register' ? 'primary' : 'outline'}
          onClick={() => setActiveDemo('register')}
          icon={<UserPlus className="w-4 h-4" />}
        >
          회원가입 폼
        </Button>
        <Button
          variant={activeDemo === 'validation' ? 'primary' : 'outline'}
          onClick={() => setActiveDemo('validation')}
          icon={<Shield className="w-4 h-4" />}
        >
          실시간 검증
        </Button>
      </div>

      {/* 데모 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeDemo === 'login' && <LoginFormDemo />}
          {activeDemo === 'register' && <RegisterFormDemo />}
          {activeDemo === 'validation' && <ValidationDemo />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FormComponentDemo;