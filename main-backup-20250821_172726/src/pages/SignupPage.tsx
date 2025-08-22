import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone, Calendar, MapPin, Check, AlertCircle } from "lucide-react";
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../shared/ui';

interface SignupPageProps {
  onGoHome: () => void;
  onGoLogin: () => void;
}

export default function SignupPage({ onGoHome, onGoLogin }: SignupPageProps) {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: 기본 정보
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    
    // Step 2: 추가 정보
    birthDate: "",
    gender: "",
    address: "",
    userType: "", // caregiver, family, facility
    
    // Step 3: 약관 동의
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStepValid()) {
      return;
    }
    
    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phoneNumber: formData.phone.trim()
      });
      
      // 회원가입 성공 시 홈으로 이동
      navigate('/');
    } catch (error) {
      console.error('회원가입 실패:', error);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.password && 
               formData.confirmPassword && formData.phone &&
               formData.password === formData.confirmPassword;
      case 2:
        return formData.birthDate && formData.gender && formData.address && formData.userType;
      case 3:
        return formData.agreeTerms && formData.agreePrivacy;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-text-main mb-2">기본 정보</h2>
        <p className="text-text-muted text-sm">회원가입을 위한 기본 정보를 입력해주세요</p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">이름 *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="실명을 입력하세요"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">이메일 *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">휴대폰 번호 *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="010-0000-0000"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">비밀번호 *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-10 pr-12 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="8자 이상 입력하세요"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-main"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">비밀번호 확인 *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-10 pr-12 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-main"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-red-500 text-xs">비밀번호가 일치하지 않습니다.</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-text-main mb-2">추가 정보</h2>
        <p className="text-text-muted text-sm">더 나은 서비스 제공을 위한 정보를 입력해주세요</p>
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">생년월일 *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">성별 *</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 border border-border-light rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary"
            />
            <span>남성</span>
          </label>
          <label className="flex items-center gap-2 p-3 border border-border-light rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary"
            />
            <span>여성</span>
          </label>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">주소 *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="시/구/동을 입력하세요"
            required
          />
        </div>
      </div>

      {/* User Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-main">가입 목적 *</label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border border-border-light rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="userType"
              value="family"
              checked={formData.userType === 'family'}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary mt-1"
            />
            <div>
              <div className="font-medium">가족/보호자</div>
              <div className="text-sm text-text-muted">요양보호사를 찾고 있어요</div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-4 border border-border-light rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="userType"
              value="caregiver"
              checked={formData.userType === 'caregiver'}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary mt-1"
            />
            <div>
              <div className="font-medium">요양보호사</div>
              <div className="text-sm text-text-muted">일자리를 찾고 있어요</div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-4 border border-border-light rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="userType"
              value="facility"
              checked={formData.userType === 'facility'}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary mt-1"
            />
            <div>
              <div className="font-medium">요양기관</div>
              <div className="text-sm text-text-muted">요양보호사를 채용하고 있어요</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-text-main mb-2">약관 동의</h2>
        <p className="text-text-muted text-sm">서비스 이용을 위한 약관에 동의해주세요</p>
      </div>

      <div className="space-y-4">
        {/* 필수 약관들 */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border border-border-light rounded-lg">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">이용약관 동의</span>
                <span className="text-red-500 text-sm">(필수)</span>
              </div>
              <div className="text-sm text-text-muted mt-1">
                Elderberry 서비스 이용을 위한 기본 약관입니다.
              </div>
              <button type="button" className="text-primary text-sm hover:underline mt-1">
                약관 전문 보기
              </button>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-border-light rounded-lg">
            <input
              type="checkbox"
              name="agreePrivacy"
              checked={formData.agreePrivacy}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">개인정보처리방침 동의</span>
                <span className="text-red-500 text-sm">(필수)</span>
              </div>
              <div className="text-sm text-text-muted mt-1">
                개인정보 수집 및 이용에 대한 동의입니다.
              </div>
              <button type="button" className="text-primary text-sm hover:underline mt-1">
                방침 전문 보기
              </button>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-border-light rounded-lg">
            <input
              type="checkbox"
              name="agreeMarketing"
              checked={formData.agreeMarketing}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">마케팅 정보 수신 동의</span>
                <span className="text-text-muted text-sm">(선택)</span>
              </div>
              <div className="text-sm text-text-muted mt-1">
                서비스 소식 및 혜택 정보를 받아보실 수 있습니다.
              </div>
            </div>
          </label>
        </div>

        {/* 전체 동의 */}
        <div className="pt-4 border-t border-border-light">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.agreeTerms && formData.agreePrivacy && formData.agreeMarketing}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData(prev => ({
                  ...prev,
                  agreeTerms: checked,
                  agreePrivacy: checked,
                  agreeMarketing: checked
                }));
              }}
              className="w-4 h-4 text-primary"
            />
            <span className="font-medium text-text-main">전체 동의</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </button>
          
          <div className="mb-6">
            <h1 className="text-text-main font-bold text-2xl mb-2">Elderberry</h1>
            <p className="text-text-muted">새 계정을 만들어보세요</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step < currentStep 
                    ? 'bg-primary text-white' 
                    : step === currentStep 
                      ? 'bg-primary text-white ring-4 ring-primary/20' 
                      : 'bg-gray-200 text-text-muted'
                }`}>
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Signup Form */}
        <Card className="border-2 border-border-light shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1"
                  >
                    이전
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className={`bg-primary hover:bg-primary-dark text-white ${currentStep === 1 ? 'w-full' : 'flex-1'}`}
                  >
                    다음
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isStepValid()}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white"
                  >
                    회원가입 완료
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-text-muted">
            이미 계정이 있으신가요?
            <button
              onClick={onGoLogin}
              className="ml-2 text-primary hover:text-primary-dark font-semibold"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}