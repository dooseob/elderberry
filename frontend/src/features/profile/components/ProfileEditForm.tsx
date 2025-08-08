/**
 * 프로필 수정 폼 컴포넌트
 * Features 레이어 - 프로필 수정 비즈니스 로직 포함
 */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  profileEditSchema,
  supportedLanguages,
  supportedRegions,
  useCurrentUser,
  useProfileForm,
  useUserActions,
  useUserState,
  type ProfileEditFormData,
  type UpdateUserRequest 
} from '../../../entities/user';
import { 
  Button, 
  Input,
  Card,
  LoadingSpinner,
  Toast,
} from '../../../shared/ui';

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  className?: string;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  onSuccess,
  onCancel,
  showCancelButton = true,
  className = '',
}) => {
  // 상태 관리
  const currentUser = useCurrentUser();
  const { loading, error, successMessage } = useUserState();
  const { updateProfile } = useUserActions();
  
  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phoneNumber: '',
      language: '',
      region: '',
    },
  });

  // 폼 데이터 초기화
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        phoneNumber: currentUser.phoneNumber || '',
        language: currentUser.language || '',
        region: currentUser.region || '',
      });
    }
  }, [currentUser, reset]);

  // 성공/에러 메시지 토스트 처리
  useEffect(() => {
    if (successMessage) {
      setToastMessage(successMessage);
      setToastType('success');
      setShowToast(true);
      
      // 성공 콜백 실행
      onSuccess?.();
    }
  }, [successMessage, onSuccess]);

  useEffect(() => {
    if (error) {
      setToastMessage(error.message);
      setToastType('error');
      setShowToast(true);
    }
  }, [error]);

  // 폼 제출 핸들러
  const onSubmit = async (data: ProfileEditFormData) => {
    try {
      // 빈 문자열을 undefined로 변환
      const updateData: UpdateUserRequest = {
        name: data.name?.trim() || undefined,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        language: data.language?.trim() || undefined,
        region: data.region?.trim() || undefined,
      };

      await updateProfile(updateData);
    } catch (error) {
      // 에러는 스토어에서 처리됨
      console.error('프로필 수정 실패:', error);
    }
  };

  // 폼 리셋 핸들러
  const handleReset = () => {
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        phoneNumber: currentUser.phoneNumber || '',
        language: currentUser.language || '',
        region: currentUser.region || '',
      });
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    handleReset();
    onCancel?.();
  };

  // 로딩 중이면 스피너 표시
  if (loading.profile) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="medium" />
          <span className="ml-3 text-gray-600">프로필 정보를 불러오는 중...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={`p-6 ${className}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 제목 */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              프로필 수정
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              개인정보를 수정하고 업데이트하세요.
            </p>
          </div>

          {/* 이름 (필수) */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="이름을 입력해주세요"
              {...register('name')}
              error={errors.name?.message}
              disabled={loading.update}
              className="w-full"
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* 전화번호 (선택) */}
          <div>
            <label 
              htmlFor="phoneNumber" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              전화번호
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="010-1234-5678"
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
              disabled={loading.update}
              className="w-full"
              aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
            />
            {errors.phoneNumber && (
              <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.phoneNumber.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              예: 010-1234-5678 형식으로 입력해주세요
            </p>
          </div>

          {/* 언어 (선택) */}
          <div>
            <label 
              htmlFor="language" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              언어
            </label>
            <select
              id="language"
              {...register('language')}
              disabled={loading.update}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby={errors.language ? 'language-error' : undefined}
            >
              <option value="">언어를 선택해주세요</option>
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            {errors.language && (
              <p id="language-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.language.message}
              </p>
            )}
          </div>

          {/* 지역 (선택) */}
          <div>
            <label 
              htmlFor="region" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              지역
            </label>
            <select
              id="region"
              {...register('region')}
              disabled={loading.update}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby={errors.region ? 'region-error' : undefined}
            >
              <option value="">지역을 선택해주세요</option>
              {supportedRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.region && (
              <p id="region-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.region.message}
              </p>
            )}
          </div>

          {/* 현재 정보 표시 */}
          {currentUser && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">현재 정보</h3>
              <dl className="space-y-1 text-sm text-gray-600">
                <div>
                  <dt className="inline font-medium">이메일:</dt>
                  <dd className="inline ml-2">{currentUser.email}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">역할:</dt>
                  <dd className="inline ml-2">{currentUser.role}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">구직자 상태:</dt>
                  <dd className="inline ml-2">
                    {currentUser.isJobSeeker ? '활성' : '비활성'}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">계정 상태:</dt>
                  <dd className="inline ml-2">
                    {currentUser.isActive ? '활성' : '비활성'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* 버튼 그룹 */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-6 border-t border-gray-200">
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading.update}
                className="w-full sm:w-auto"
              >
                취소
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading.update || !isDirty}
              className="w-full sm:w-auto"
            >
              되돌리기
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={loading.update || !isDirty || !isValid}
              className="w-full sm:w-auto"
            >
              {loading.update ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  저장 중...
                </>
              ) : (
                '저장하기'
              )}
            </Button>
          </div>

          {/* 폼 상태 정보 (개발 환경에서만) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
              <div>isDirty: {isDirty ? 'Yes' : 'No'}</div>
              <div>isValid: {isValid ? 'Yes' : 'No'}</div>
              <div>isSubmitting: {isSubmitting ? 'Yes' : 'No'}</div>
            </div>
          )}
        </form>
      </Card>

      {/* 토스트 메시지 */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      )}
    </>
  );
};

export default ProfileEditForm;