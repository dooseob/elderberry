/**
 * 계정 설정 컴포넌트
 * 비밀번호 변경, 알림 설정, 개인정보 보호 설정 등을 관리
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Mail,
  Smartphone,
  Globe,
  UserX,
  Download,
  Trash2,
  Save
} from '../icons/LucideIcons';

import { Card, CardHeader, CardTitle, CardContent } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { AuthUser } from '../../types/auth';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationType } from '../../types/notifications';

interface AccountSettingsProps {
  user: AuthUser;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const { updateProfile, logout } = useAuthStore();
  const { settings: notificationSettings, updateSettings } = useNotificationStore();
  
  // 비밀번호 변경
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 알림 설정 (notificationStore와 연동)
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // 개인정보 설정
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // public, private, members-only
    showContactInfo: false,
    allowDirectMessage: true,
    showActivityStatus: true,
    dataSharing: false
  });

  // 비밀번호 유효성 검사
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(passwordForm.newPassword);

  // 비밀번호 변경 처리
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      alert('비밀번호 조건을 확인해주세요.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setPasswordLoading(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert('비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 알림 설정 업데이트
  // 알림 설정 업데이트
  const updateNotificationSetting = async (setting: 'email' | 'push' | 'sms', value: boolean) => {
    setIsUpdatingNotifications(true);
    try {
      await updateSettings({ [setting]: value });
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  // 특정 알림 타입 설정 업데이트
  const updateNotificationTypeSetting = async (type: NotificationType, value: boolean) => {
    setIsUpdatingNotifications(true);
    try {
      const newTypes = { ...notificationSettings.types, [type]: value };
      await updateSettings({ types: newTypes });
    } catch (error) {
      console.error('알림 타입 설정 업데이트 실패:', error);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  // 조용한 시간 설정 업데이트
  const updateQuietHours = async (enabled: boolean, start?: string, end?: string) => {
    setIsUpdatingNotifications(true);
    try {
      const quietHours = {
        enabled,
        start: start || notificationSettings.quietHours.start,
        end: end || notificationSettings.quietHours.end
      };
      await updateSettings({ quietHours });
    } catch (error) {
      console.error('조용한 시간 설정 업데이트 실패:', error);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  // 개인정보 설정 업데이트
  const updatePrivacySetting = (setting: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // 계정 삭제
  const handleAccountDeletion = () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 계정 삭제 로직 구현
      console.log('계정 삭제 요청');
    }
  };

  // 데이터 내보내기
  const handleDataExport = () => {
    // 데이터 내보내기 로직 구현
    console.log('데이터 내보내기 요청');
  };

  // 알림 타입 라벨 변환 함수
  const getNotificationTypeLabel = (type: NotificationType): string => {
    const typeLabels: Record<NotificationType, string> = {
      [NotificationType.FACILITY_MATCH_FOUND]: '시설 매칭 발견',
      [NotificationType.FACILITY_MATCH_CONFIRMED]: '시설 매칭 확정',
      [NotificationType.FACILITY_MATCH_CANCELLED]: '시설 매칭 취소',
      [NotificationType.REVIEW_APPROVED]: '리뷰 승인',
      [NotificationType.REVIEW_REJECTED]: '리뷰 거부',
      [NotificationType.REVIEW_REPORTED]: '리뷰 신고',
      [NotificationType.JOB_APPLICATION_RECEIVED]: '지원서 접수',
      [NotificationType.JOB_APPLICATION_APPROVED]: '지원서 승인',
      [NotificationType.JOB_APPLICATION_REJECTED]: '지원서 거부',
      [NotificationType.JOB_INTERVIEW_SCHEDULED]: '면접 일정 안내',
      [NotificationType.SYSTEM_MAINTENANCE]: '시스템 점검',
      [NotificationType.SYSTEM_UPDATE]: '시스템 업데이트',
      [NotificationType.ACCOUNT_SECURITY]: '계정 보안',
      [NotificationType.GENERAL_INFO]: '일반 정보',
      [NotificationType.PROMOTION]: '프로모션'
    };
    
    return typeLabels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>비밀번호 변경</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* 현재 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 pr-10"
                  placeholder="현재 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 pr-10"
                  placeholder="새 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* 비밀번호 조건 */}
              {passwordForm.newPassword && (
                <div className="mt-3 space-y-1">
                  <div className={`flex items-center space-x-2 text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.minLength ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>8자 이상</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasUpper ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>대문자 포함</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasLower ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>소문자 포함</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasNumber ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>숫자 포함</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidation.hasSpecial ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>특수문자 포함</span>
                  </div>
                </div>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 pr-10"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={passwordLoading}
              disabled={!passwordValidation.isValid || passwordForm.newPassword !== passwordForm.confirmPassword}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>비밀번호 변경</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>알림 설정</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 전체 알림 설정 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900">알림 전체 설정</h3>
                <p className="text-sm text-gray-500">모든 알림을 한번에 켜거나 끌 수 있습니다</p>
              </div>
              <button
                onClick={() => updateNotificationSetting('enabled', !notificationSettings.enabled)}
                disabled={isUpdatingNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.enabled ? 'bg-elderberry-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 알림 방법별 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 이메일 알림 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">이메일</h3>
                  <button
                    onClick={() => updateNotificationSetting('email', !notificationSettings.email)}
                    disabled={isUpdatingNotifications || !notificationSettings.enabled}
                    className={`ml-auto relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notificationSettings.email && notificationSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notificationSettings.email && notificationSettings.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 푸시 알림 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">푸시</h3>
                  <button
                    onClick={() => updateNotificationSetting('push', !notificationSettings.push)}
                    disabled={isUpdatingNotifications || !notificationSettings.enabled}
                    className={`ml-auto relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notificationSettings.push && notificationSettings.enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notificationSettings.push && notificationSettings.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* SMS 알림 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-medium text-gray-900">SMS</h3>
                  <button
                    onClick={() => updateNotificationSetting('sms', !notificationSettings.sms)}
                    disabled={isUpdatingNotifications || !notificationSettings.enabled}
                    className={`ml-auto relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      notificationSettings.sms && notificationSettings.enabled ? 'bg-yellow-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notificationSettings.sms && notificationSettings.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 타입별 세부 설정 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">알림 유형별 설정</h3>
              <div className="space-y-3">
                {Object.entries(notificationSettings.types).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {getNotificationTypeLabel(type as NotificationType)}
                    </span>
                    <button
                      onClick={() => updateNotificationTypeSetting(type as NotificationType, !enabled)}
                      disabled={isUpdatingNotifications || !notificationSettings.enabled}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled && notificationSettings.enabled ? 'bg-elderberry-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled && notificationSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 조용한 시간 설정 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">조용한 시간</h3>
                  <p className="text-sm text-gray-500">지정된 시간에는 알림을 받지 않습니다</p>
                </div>
                <button
                  onClick={() => updateQuietHours(!notificationSettings.quietHours.enabled)}
                  disabled={isUpdatingNotifications || !notificationSettings.enabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.quietHours.enabled && notificationSettings.enabled ? 'bg-elderberry-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.quietHours.enabled && notificationSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {notificationSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                    <input
                      type="time"
                      value={notificationSettings.quietHours.start}
                      onChange={(e) => updateQuietHours(true, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                    <input
                      type="time"
                      value={notificationSettings.quietHours.end}
                      onChange={(e) => updateQuietHours(true, undefined, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개인정보 보호 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>개인정보 보호</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 프로필 공개 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                프로필 공개 범위
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: '전체 공개', desc: '모든 사용자가 볼 수 있습니다' },
                  { value: 'members-only', label: '회원만', desc: '가입한 회원만 볼 수 있습니다' },
                  { value: 'private', label: '비공개', desc: '본인만 볼 수 있습니다' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option.value}
                      checked={privacySettings.profileVisibility === option.value}
                      onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                      className="text-elderberry-600 focus:ring-elderberry-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 기타 개인정보 설정 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">연락처 정보 공개</h4>
                  <p className="text-sm text-gray-500">이메일, 전화번호 공개 여부</p>
                </div>
                <button
                  onClick={() => updatePrivacySetting('showContactInfo', !privacySettings.showContactInfo)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.showContactInfo ? 'bg-elderberry-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.showContactInfo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">직접 메시지 허용</h4>
                  <p className="text-sm text-gray-500">다른 사용자의 메시지 수신</p>
                </div>
                <button
                  onClick={() => updatePrivacySetting('allowDirectMessage', !privacySettings.allowDirectMessage)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.allowDirectMessage ? 'bg-elderberry-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.allowDirectMessage ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">활동 상태 표시</h4>
                  <p className="text-sm text-gray-500">온라인 상태 및 최근 활동 시간</p>
                </div>
                <button
                  onClick={() => updatePrivacySetting('showActivityStatus', !privacySettings.showActivityStatus)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.showActivityStatus ? 'bg-elderberry-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.showActivityStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>데이터 관리</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">데이터 다운로드</h4>
                <p className="text-sm text-blue-700">내 데이터를 JSON 형태로 내려받기</p>
              </div>
              <Button
                variant="outline"
                onClick={handleDataExport}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>다운로드</span>
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-medium text-red-900 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>계정 삭제</span>
                </h4>
                <p className="text-sm text-red-700">계정과 모든 데이터가 영구적으로 삭제됩니다</p>
              </div>
              <Button
                variant="outline"
                onClick={handleAccountDeletion}
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <UserX className="w-4 h-4" />
                <span>계정 삭제</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;