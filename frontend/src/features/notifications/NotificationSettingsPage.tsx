/**
 * 알림 설정 페이지
 * FSD 구조: features/notifications
 * 사용자가 알림 설정을 관리할 수 있는 페이지
 */
import React, { useEffect, useState } from 'react';
import { Save, Check, Bell, Mail, Smartphone, Settings } from 'lucide-react';
import {
  useNotificationStore,
  NotificationSettings,
  NotificationType,
  NOTIFICATION_TYPE_LABELS
} from '../../entities/notification';
import { Card, Button, Badge } from '../../shared/ui';
import { PageContainer } from '../../widgets/layout';

interface NotificationSettingsPageProps {
  className?: string;
}

export const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({
  className = ''
}) => {
  const { settings, fetchSettings, updateSettings, isLoading, error } = useNotificationStore();
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 페이지 로드 시 설정 가져오기
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 서버에서 설정을 가져온 후 로컬 상태에 복사
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  // 설정 변경 감지
  useEffect(() => {
    if (settings && localSettings) {
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(localSettings));
    }
  }, [settings, localSettings]);

  // 전역 설정 토글
  const handleGlobalToggle = (key: keyof NotificationSettings, value: boolean) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      [key]: value
    });
  };

  // 알림 타입별 설정 변경
  const handleTypeSettingChange = (
    type: string,
    channel: 'push' | 'email' | 'sms',
    enabled: boolean
  ) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      typeSettings: {
        ...localSettings.typeSettings,
        [type]: {
          ...localSettings.typeSettings[type],
          [channel]: enabled
        }
      }
    });
  };

  // 조용한 시간 설정 변경
  const handleQuietHoursChange = (enabled: boolean, startTime?: string, endTime?: string) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      quietHours: {
        ...localSettings.quietHours,
        enabled,
        ...(startTime && { startTime }),
        ...(endTime && { endTime })
      }
    });
  };

  // 설정 저장
  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('설정 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 설정 초기화
  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
    }
  };

  if (!localSettings) {
    return (
      <PageContainer
        title="알림 설정"
        description="알림 수신 방법을 설정하세요"
        icon={<Settings className="h-6 w-6" />}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">설정을 불러오는 중...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="알림 설정"
      description="알림 수신 방법과 타입별 설정을 관리하세요"
      icon={<Settings className="h-6 w-6" />}
      className={className}
      actions={[
        {
          label: '초기화',
          variant: 'outline',
          onClick: handleReset,
          disabled: !hasChanges || isLoading
        },
        {
          label: isSaving ? '저장 중...' : '저장',
          variant: 'primary',
          onClick: handleSave,
          disabled: !hasChanges || isLoading || isSaving,
          icon: saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />
        }
      ]}
    >
      <div className="max-w-4xl space-y-6">
        {/* 저장 성공 메시지 */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">설정이 성공적으로 저장되었습니다.</span>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 전역 알림 설정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            알림 수신 방법
          </h2>
          
          <div className="space-y-4">
            {/* 푸시 알림 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium">푸시 알림</h3>
                  <p className="text-sm text-gray-600">브라우저에서 즉시 알림을 받습니다</p>
                </div>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.pushEnabled}
                  onChange={(e) => handleGlobalToggle('pushEnabled', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>

            {/* 이메일 알림 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium">이메일 알림</h3>
                  <p className="text-sm text-gray-600">등록된 이메일로 알림을 받습니다</p>
                </div>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.emailEnabled}
                  onChange={(e) => handleGlobalToggle('emailEnabled', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>

            {/* SMS 알림 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium">SMS 알림</h3>
                  <p className="text-sm text-gray-600">등록된 휴대폰번호로 문자를 받습니다</p>
                </div>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.smsEnabled}
                  onChange={(e) => handleGlobalToggle('smsEnabled', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* 알림 타입별 설정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">알림 타입별 설정</h2>
          
          <div className="space-y-4">
            {Object.values(NotificationType).map((type) => {
              const typeSettings = localSettings.typeSettings[type];
              const hasAnyEnabled = typeSettings && (typeSettings.push || typeSettings.email || typeSettings.sms);

              return (
                <div key={type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="font-medium">{NOTIFICATION_TYPE_LABELS[type]}</h3>
                      {hasAnyEnabled && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          활성화
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* 푸시 */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={typeSettings?.push || false}
                        onChange={(e) => handleTypeSettingChange(type, 'push', e.target.checked)}
                        disabled={!localSettings.pushEnabled}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">푸시</span>
                    </label>

                    {/* 이메일 */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={typeSettings?.email || false}
                        onChange={(e) => handleTypeSettingChange(type, 'email', e.target.checked)}
                        disabled={!localSettings.emailEnabled}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">이메일</span>
                    </label>

                    {/* SMS */}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={typeSettings?.sms || false}
                        onChange={(e) => handleTypeSettingChange(type, 'sms', e.target.checked)}
                        disabled={!localSettings.smsEnabled}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">SMS</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 조용한 시간 설정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">조용한 시간</h2>
          <p className="text-gray-600 mb-4">설정한 시간 동안은 알림을 받지 않습니다</p>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localSettings.quietHours.enabled}
                onChange={(e) => handleQuietHoursChange(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="font-medium">조용한 시간 활성화</span>
            </label>

            {localSettings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={localSettings.quietHours.startTime}
                    onChange={(e) => handleQuietHoursChange(true, e.target.value)}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={localSettings.quietHours.endTime}
                    onChange={(e) => handleQuietHoursChange(true, undefined, e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 기타 설정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">기타 설정</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                언어
              </label>
              <select
                value={localSettings.language}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  language: e.target.value
                })}
                className="form-select w-full"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시간대
              </label>
              <input
                type="text"
                value={localSettings.timezone}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  timezone: e.target.value
                })}
                className="form-input w-full"
                placeholder="Asia/Seoul"
              />
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default NotificationSettingsPage;