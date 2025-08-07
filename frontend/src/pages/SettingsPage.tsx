/**
 * Settings Page - 사용자 설정 페이지
 * FSD 아키텍처: pages 레이어
 * 
 * @version 1.0.0
 * @description 사용자 계정 설정, 알림 설정, 개인정보 관리 등을 제공하는 페이지
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Card, Button, Input } from '../shared/ui';
import { useLinearTheme } from '../hooks/useLinearTheme';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

interface ToggleSettingProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: string;
  };
  account: {
    twoFactor: boolean;
    sessionTimeout: number;
  };
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children }) => (
  <Card className="p-6 mb-6">
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
    {children}
  </Card>
);

const ToggleSetting: React.FC<ToggleSettingProps> = ({ 
  label, description, enabled, onChange 
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex-1">
      <div className="font-medium text-gray-900">{label}</div>
      {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  </div>
);

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentTheme, setTheme, themePreview, isDarkMode, toggleDarkMode } = useLinearTheme();
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
      analytics: true,
    },
    preferences: {
      language: 'ko',
      timezone: 'Asia/Seoul',
      theme: currentTheme?.id || 'default',
    },
    account: {
      twoFactor: false,
      sessionTimeout: 30,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 인증되지 않은 사용자 리디렉션
  useEffect(() => {
    if (!user) {
      navigate('/auth/signin');
    }
  }, [user, navigate]);

  const updateSetting = (
    category: keyof UserSettings,
    key: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      console.log('설정 저장:', settings);
      // 성공 토스트 메시지 표시
    } catch (error) {
      console.error('설정 저장 실패:', error);
      // 에러 토스트 메시지 표시
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setIsLoading(true);
      // 실제 계정 삭제 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
      await logout();
      navigate('/');
    } catch (error) {
      console.error('계정 삭제 실패:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div className="settings-page min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            로그인이 필요합니다
          </h2>
          <Button onClick={() => navigate('/auth/signin')}>
            로그인하기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="settings-page min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
          <p className="text-gray-600">
            계정 설정과 개인정보를 관리하세요
          </p>
        </div>

        {/* Profile Section */}
        <SettingsSection
          title="프로필 정보"
          description="기본 프로필 정보를 확인하고 수정할 수 있습니다"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <Input
                type="text"
                value={user.name || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <Input
                type="email"
                value={user.email || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => navigate('/mypage')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              프로필 수정하기
            </Button>
          </div>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          title="알림 설정"
          description="받고 싶은 알림을 선택하세요"
        >
          <div className="space-y-1">
            <ToggleSetting
              label="이메일 알림"
              description="중요한 업데이트와 소식을 이메일로 받습니다"
              enabled={settings.notifications.email}
              onChange={(enabled) => updateSetting('notifications', 'email', enabled)}
            />
            <ToggleSetting
              label="SMS 알림"
              description="긴급한 알림을 문자메시지로 받습니다"
              enabled={settings.notifications.sms}
              onChange={(enabled) => updateSetting('notifications', 'sms', enabled)}
            />
            <ToggleSetting
              label="푸시 알림"
              description="브라우저 푸시 알림을 받습니다"
              enabled={settings.notifications.push}
              onChange={(enabled) => updateSetting('notifications', 'push', enabled)}
            />
            <ToggleSetting
              label="마케팅 알림"
              description="프로모션과 마케팅 소식을 받습니다"
              enabled={settings.notifications.marketing}
              onChange={(enabled) => updateSetting('notifications', 'marketing', enabled)}
            />
          </div>
        </SettingsSection>

        {/* Theme Settings */}
        <SettingsSection
          title="테마 설정"
          description="화면 테마와 외관을 설정하세요"
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">다크 모드</h3>
                  <p className="text-sm text-gray-500">어두운 테마를 사용합니다</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-4">테마 색상</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themePreview.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      updateSetting('preferences', 'theme', theme.id);
                    }}
                    className={`
                      theme-option p-3 rounded-lg border-2 transition-all
                      ${theme.id === currentTheme?.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div
                      className="w-full h-8 rounded mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${theme.preview.background} 0%, ${theme.preview.accent} 100%)`,
                      }}
                    />
                    <div className="text-sm font-medium text-gray-700">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Privacy Settings */}
        <SettingsSection
          title="개인정보 설정"
          description="개인정보 공개 범위와 데이터 사용을 관리하세요"
        >
          <div className="space-y-1">
            <ToggleSetting
              label="프로필 공개"
              description="다른 사용자가 내 프로필을 볼 수 있습니다"
              enabled={settings.privacy.profileVisible}
              onChange={(enabled) => updateSetting('privacy', 'profileVisible', enabled)}
            />
            <ToggleSetting
              label="데이터 공유"
              description="서비스 개선을 위한 익명 데이터 공유에 동의합니다"
              enabled={settings.privacy.dataSharing}
              onChange={(enabled) => updateSetting('privacy', 'dataSharing', enabled)}
            />
            <ToggleSetting
              label="분석 데이터"
              description="사용 패턴 분석을 통한 맞춤형 서비스 제공에 동의합니다"
              enabled={settings.privacy.analytics}
              onChange={(enabled) => updateSetting('privacy', 'analytics', enabled)}
            />
          </div>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection
          title="보안 설정"
          description="계정 보안을 강화하세요"
        >
          <div className="space-y-6">
            <ToggleSetting
              label="2단계 인증"
              description="로그인 시 추가 보안 단계를 거칩니다"
              enabled={settings.account.twoFactor}
              onChange={(enabled) => updateSetting('account', 'twoFactor', enabled)}
            />
            
            <div className="border-b border-gray-100 pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세션 유지 시간 (분)
              </label>
              <select
                value={settings.account.sessionTimeout}
                onChange={(e) => updateSetting('account', 'sessionTimeout', Number(e.target.value))}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15분</option>
                <option value={30}>30분</option>
                <option value={60}>1시간</option>
                <option value={120}>2시간</option>
                <option value={240}>4시간</option>
              </select>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/auth/change-password')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                비밀번호 변경
              </Button>
              <Button
                onClick={logout}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                모든 기기에서 로그아웃
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection
          title="위험 구역"
          description="계정 삭제 등 중요한 작업을 수행합니다"
        >
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="font-semibold text-red-800 mb-2">계정 삭제</h3>
            <p className="text-red-700 text-sm mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="space-y-3">
              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <p className="text-red-800 font-medium">
                    정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoading ? '삭제 중...' : '삭제 확인'}
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  계정 삭제
                </Button>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            취소
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;