/**
 * 계정 설정 컴포넌트
 * 비밀번호 변경, 알림 설정, 개인정보 설정 등을 관리하는 기능 제공
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Bell,
  Eye,
  EyeOff,
  Key,
  Mail,
  Smartphone,
  Globe,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Settings,
  User,
  Save,
  RefreshCw
} from '../../../components/icons/LucideIcons';
import { Card } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { useAuthStore } from '../../../stores/authStore';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  email: {
    matchingUpdates: boolean;
    jobAlerts: boolean;
    reviewNotifications: boolean;
    systemUpdates: boolean;
    weeklyDigest: boolean;
  };
  push: {
    matchingUpdates: boolean;
    jobAlerts: boolean;
    messages: boolean;
    reminders: boolean;
  };
  sms: {
    importantUpdates: boolean;
    securityAlerts: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
  allowContactFromEmployers: boolean;
  allowContactFromCaregivers: boolean;
  shareActivityStatus: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  deviceManagement: boolean;
  autoLogout: number; // 분 단위
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  timezone: string;
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  soundEnabled: boolean;
}

/**
 * 계정 설정 컴포넌트
 */
export const AccountSettings: React.FC = () => {
  // 상태 관리
  const { user, updateProfile } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'password' | 'notifications' | 'privacy' | 'security' | 'app'>('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 폼 상태
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // 설정 상태
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      matchingUpdates: true,
      jobAlerts: true,
      reviewNotifications: true,
      systemUpdates: false,
      weeklyDigest: true
    },
    push: {
      matchingUpdates: true,
      jobAlerts: true,
      messages: true,
      reminders: false
    },
    sms: {
      importantUpdates: true,
      securityAlerts: true
    }
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowContactFromEmployers: true,
    allowContactFromCaregivers: true,
    shareActivityStatus: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    deviceManagement: true,
    autoLogout: 30
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'system',
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    soundEnabled: true
  });

  // 메시지 자동 사라짐
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 유효성 검사
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('새 비밀번호가 일치하지 않습니다.');
      }

      if (passwordForm.newPassword.length < 8) {
        throw new Error('새 비밀번호는 8자 이상이어야 합니다.');
      }

      // API 호출
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setMessage({
        type: 'success',
        text: '비밀번호가 성공적으로 변경되었습니다.'
      });

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || '비밀번호 변경에 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 설정 저장
  const handleSaveSettings = async (settingType: string, settings: any) => {
    setLoading(true);

    try {
      // 실제로는 API 호출해야 함
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: '설정이 성공적으로 저장되었습니다.'
      });

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: '설정 저장에 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 섹션 메뉴
  const sections = [
    { key: 'password', label: '비밀번호 변경', icon: Key },
    { key: 'notifications', label: '알림 설정', icon: Bell },
    { key: 'privacy', label: '개인정보 설정', icon: Shield },
    { key: 'security', label: '보안 설정', icon: Lock },
    { key: 'app', label: '앱 설정', icon: Settings }
  ] as const;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 사이드 메뉴 */}
      <div className="lg:w-64">
        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-4">설정 메뉴</h3>
          <nav className="space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.key;

              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1">
        {/* 메시지 표시 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* 비밀번호 변경 */}
        {activeSection === 'password' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">비밀번호 변경</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  8자 이상의 문자, 숫자, 특수문자를 포함해주세요.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    변경 중...
                  </>
                ) : (
                  '비밀번호 변경'
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* 알림 설정 */}
        {activeSection === 'notifications' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">알림 설정</h2>
              <Button
                onClick={() => handleSaveSettings('notifications', notificationSettings)}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>저장</span>
              </Button>
            </div>

            <div className="space-y-8">
              {/* 이메일 알림 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">이메일 알림</h3>
                </div>
                <div className="space-y-3 ml-7">
                  {Object.entries(notificationSettings.email).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key === 'matchingUpdates' && '매칭 업데이트'}
                        {key === 'jobAlerts' && '구인 알림'}
                        {key === 'reviewNotifications' && '리뷰 알림'}
                        {key === 'systemUpdates' && '시스템 업데이트'}
                        {key === 'weeklyDigest' && '주간 요약'}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, [key]: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 푸시 알림 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">푸시 알림</h3>
                </div>
                <div className="space-y-3 ml-7">
                  {Object.entries(notificationSettings.push).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key === 'matchingUpdates' && '매칭 업데이트'}
                        {key === 'jobAlerts' && '구인 알림'}
                        {key === 'messages' && '메시지'}
                        {key === 'reminders' && '리마인더'}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          push: { ...prev.push, [key]: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* SMS 알림 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">SMS 알림</h3>
                </div>
                <div className="space-y-3 ml-7">
                  {Object.entries(notificationSettings.sms).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key === 'importantUpdates' && '중요 업데이트'}
                        {key === 'securityAlerts' && '보안 알림'}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          sms: { ...prev.sms, [key]: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 개인정보 설정 */}
        {activeSection === 'privacy' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">개인정보 설정</h2>
              <Button
                onClick={() => handleSaveSettings('privacy', privacySettings)}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>저장</span>
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로필 공개 범위
                </label>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings(prev => ({ 
                    ...prev, 
                    profileVisibility: e.target.value as PrivacySettings['profileVisibility']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">전체 공개</option>
                  <option value="contacts">연락처만</option>
                  <option value="private">비공개</option>
                </select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">정보 공개 설정</h3>
                {Object.entries(privacySettings).map(([key, value]) => {
                  if (key === 'profileVisibility') return null;
                  
                  return (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key === 'showEmail' && '이메일 주소 공개'}
                        {key === 'showPhone' && '전화번호 공개'}
                        {key === 'allowContactFromEmployers' && '구인업체 연락 허용'}
                        {key === 'allowContactFromCaregivers' && '요양보호사 연락 허용'}
                        {key === 'shareActivityStatus' && '활동 상태 공유'}
                      </span>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* 보안 설정 */}
        {activeSection === 'security' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">보안 설정</h2>
              <Button
                onClick={() => handleSaveSettings('security', securitySettings)}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>저장</span>
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">2단계 인증</h3>
                  <p className="text-sm text-gray-600">추가 보안을 위한 2단계 인증을 활성화합니다.</p>
                </div>
                <div className="flex items-center space-x-2">
                  {securitySettings.twoFactorEnabled ? (
                    <Unlock className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorEnabled}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      twoFactorEnabled: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(securitySettings).map(([key, value]) => {
                  if (key === 'twoFactorEnabled' || key === 'autoLogout') return null;
                  
                  return (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key === 'loginNotifications' && '로그인 알림'}
                        {key === 'deviceManagement' && '기기 관리'}
                      </span>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => setSecuritySettings(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자동 로그아웃 (분)
                </label>
                <select
                  value={securitySettings.autoLogout}
                  onChange={(e) => setSecuritySettings(prev => ({ 
                    ...prev, 
                    autoLogout: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15분</option>
                  <option value={30}>30분</option>
                  <option value={60}>1시간</option>
                  <option value={120}>2시간</option>
                  <option value={0}>사용 안함</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* 앱 설정 */}
        {activeSection === 'app' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">앱 설정</h2>
              <Button
                onClick={() => handleSaveSettings('app', appSettings)}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>저장</span>
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  테마
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: '라이트', icon: Sun },
                    { value: 'dark', label: '다크', icon: Moon },
                    { value: 'system', label: '시스템', icon: Monitor }
                  ].map((theme) => {
                    const ThemeIcon = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => setAppSettings(prev => ({ ...prev, theme: theme.value as AppSettings['theme'] }))}
                        className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                          appSettings.theme === theme.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <ThemeIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  언어
                </label>
                <select
                  value={appSettings.language}
                  onChange={(e) => setAppSettings(prev => ({ 
                    ...prev, 
                    language: e.target.value as AppSettings['language']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 형식
                </label>
                <select
                  value={appSettings.dateFormat}
                  onChange={(e) => setAppSettings(prev => ({ 
                    ...prev, 
                    dateFormat: e.target.value as AppSettings['dateFormat']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {appSettings.soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-gray-400" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">소리 효과</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.soundEnabled}
                  onChange={(e) => setAppSettings(prev => ({
                    ...prev,
                    soundEnabled: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};