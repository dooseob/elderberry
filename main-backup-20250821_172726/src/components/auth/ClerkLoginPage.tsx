import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ClerkLoginPageProps {
  onGoHome: () => void;
  mode: 'signin' | 'signup';
}

/**
 * Clerk-based authentication component for Elderberry
 * Supports role-based signup with organization assignment
 */
export default function ClerkLoginPage({ onGoHome, mode }: ClerkLoginPageProps) {
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
              {mode === 'signin' ? '계정에 로그인하세요' : '새 계정을 만들어보세요'}
            </p>
          </div>
        </div>

        {/* Clerk Authentication Components */}
        <Card className="border-2 border-border-light shadow-lg">
          <CardContent className="p-4">
            {mode === 'signin' ? (
              <SignIn 
                routing="hash"
                redirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: 'mx-auto',
                    card: 'border-0 shadow-none',
                    headerTitle: 'text-lg font-semibold text-text-main',
                    headerSubtitle: 'text-text-muted text-sm',
                    socialButtonsBlockButton: 'border border-border-light hover:bg-gray-50 text-text-main',
                    dividerLine: 'bg-border-light',
                    dividerText: 'text-text-muted text-sm',
                    formButtonPrimary: 'bg-primary hover:bg-primary-dark text-white',
                    formFieldInput: 'border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20',
                    footerActionLink: 'text-primary hover:text-primary-dark',
                    identityPreviewText: 'text-text-main',
                    formFieldLabel: 'text-text-main font-medium',
                  }
                }}
              />
            ) : (
              <SignUp 
                routing="hash"
                redirectUrl="/onboarding"
                appearance={{
                  elements: {
                    rootBox: 'mx-auto',
                    card: 'border-0 shadow-none',
                    headerTitle: 'text-lg font-semibold text-text-main',
                    headerSubtitle: 'text-text-muted text-sm',
                    socialButtonsBlockButton: 'border border-border-light hover:bg-gray-50 text-text-main',
                    dividerLine: 'bg-border-light',
                    dividerText: 'text-text-muted text-sm',
                    formButtonPrimary: 'bg-primary hover:bg-primary-dark text-white',
                    formFieldInput: 'border-border-light focus:border-primary focus:ring-2 focus:ring-primary/20',
                    footerActionLink: 'text-primary hover:text-primary-dark',
                    identityPreviewText: 'text-text-main',
                    formFieldLabel: 'text-text-main font-medium',
                  }
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Role Selection Help */}
        {mode === 'signup' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">회원가입 안내</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div><strong>환자/가족:</strong> 요양보호사를 찾고 계신 분</div>
              <div><strong>요양보호사:</strong> 일자리를 찾고 계신 분</div>
              <div><strong>요양기관:</strong> 요양보호사를 채용하시는 분</div>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              회원가입 후 프로필 설정에서 역할을 선택할 수 있습니다.
            </p>
          </div>
        )}

        {/* Terms and Privacy */}
        <div className="text-center mt-8">
          <p className="text-xs text-text-muted leading-relaxed">
            {mode === 'signin' ? '로그인하시면' : '회원가입하시면'}{" "}
            <a href="#" className="text-primary hover:underline">이용약관</a> 및{" "}
            <a href="#" className="text-primary hover:underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Role selection component for post-signup flow
 */
export function RoleSelectionModal({ onRoleSelect }: { onRoleSelect: (role: string) => void }) {
  const roles = [
    {
      id: 'domestic-user',
      title: '환자/가족 (국내)',
      description: '국내에서 요양보호사를 찾고 있어요',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 'overseas-user', 
      title: '환자/가족 (해외)',
      description: '해외에서 요양 서비스를 찾고 있어요',
      icon: '🌍'
    },
    {
      id: 'job-seeker',
      title: '요양보호사',
      description: '요양 분야에서 일자리를 찾고 있어요',
      icon: '👩‍⚕️'
    },
    {
      id: 'facility',
      title: '요양기관',
      description: '요양보호사를 채용하고 있어요',
      icon: '🏥'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-text-main mb-4 text-center">
            어떤 목적으로 이용하시나요?
          </h2>
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="w-full p-4 text-left border border-border-light rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <div className="font-medium text-text-main">{role.title}</div>
                    <div className="text-sm text-text-muted">{role.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}