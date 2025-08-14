import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";

interface LoginPageProps {
  onGoHome: () => void;
  onGoSignup?: () => void;
}

export default function LoginPage({ onGoHome, onGoSignup }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인:', { email: formData.email, password: formData.password });
    // 실제 구현에서는 API 호출
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
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
            <p className="text-text-muted">
              계정에 로그인하세요
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-2 border-border-light shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-main">이메일</label>
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

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-main">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="비밀번호를 입력하세요"
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

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary/20"
                  />
                  <span className="text-sm text-text-muted">로그인 상태 유지</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  비밀번호 찾기
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 text-base font-semibold"
              >
                로그인
              </Button>

              {/* Social Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-text-muted">또는</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="py-3"
                >
                  <span className="mr-2">🔍</span>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="py-3"
                >
                  <span className="mr-2">💬</span>
                  KakaoTalk
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Toggle to Signup */}
        <div className="text-center mt-6">
          <p className="text-text-muted">
            계정이 없으신가요?
            <button
              onClick={onGoSignup}
              className="ml-2 text-primary hover:text-primary-dark font-semibold"
            >
              회원가입
            </button>
          </p>
        </div>

        {/* Terms */}
        <div className="text-center mt-8">
          <p className="text-xs text-text-muted leading-relaxed">
            로그인하시면{" "}
            <a href="#" className="text-primary hover:underline">이용약관</a> 및{" "}
            <a href="#" className="text-primary hover:underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}