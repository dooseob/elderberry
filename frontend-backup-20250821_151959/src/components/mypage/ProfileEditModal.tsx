/**
 * 프로필 편집 모달 컴포넌트
 * 사용자 기본 정보, 연락처, 주소, 자기소개 등을 편집할 수 있는 모달
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, MapPin, FileText, Camera, Upload } from '../icons/LucideIcons';

import { Button } from '../../shared/ui/Button';
import { AuthUser } from '../../types/auth';
import { ProfileResponse } from '../../types/profile';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  profile: ProfileResponse | null;
}

interface FormData {
  name: string;
  phone: string;
  address: string;
  introduction: string;
  profileImage?: File;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  profile
}) => {
  const { updateProfile: updateAuthProfile } = useAuthStore();
  const { updateProfile, loading } = useProfileStore();
  
  const [formData, setFormData] = useState<FormData>({
    name: user.name,
    phone: profile?.phone || '',
    address: profile?.address || '',
    introduction: profile?.introduction || ''
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 모달이 열릴 때마다 폼 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        phone: profile?.phone || '',
        address: profile?.address || '',
        introduction: profile?.introduction || ''
      });
      setErrors({});
      setImagePreview(null);
    }
  }, [isOpen, user, profile]);

  // 폼 필드 업데이트
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 이미지 파일 처리
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: '이미지 파일은 5MB 이하여야 합니다.' }));
        return;
      }

      // 파일 형식 체크
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: '이미지 파일만 업로드 가능합니다.' }));
        return;
      }

      setFormData(prev => ({ ...prev, profileImage: file }));
      
      // 이미지 미리보기
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다.';
    }

    if (formData.phone && !/^[0-9-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
    }

    if (formData.introduction && formData.introduction.length > 500) {
      newErrors.introduction = '자기소개는 500자 이하로 작성해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // 이름이 변경된 경우 인증 스토어도 업데이트
      if (formData.name !== user.name) {
        await updateAuthProfile({ name: formData.name });
      }

      // 프로필 정보 업데이트 (실제 구현에서는 프로필 ID가 필요)
      if (profile?.id) {
        await updateProfile(profile.id, {
          phone: formData.phone,
          address: formData.address,
          introduction: formData.introduction,
          // 이미지 업로드는 별도 API 호출이 필요할 수 있음
        });
      }

      onClose();
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* 모달 컨테이너 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">프로필 편집</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* 프로필 이미지 */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-elderberry-400 to-elderberry-600 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="프로필 미리보기" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 w-6 h-6 bg-elderberry-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-elderberry-700 transition-colors"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">프로필 사진</h3>
                  <p className="text-sm text-gray-500">JPG, PNG 파일 (최대 5MB)</p>
                  {errors.profileImage && (
                    <p className="text-sm text-red-600 mt-1">{errors.profileImage}</p>
                  )}
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="이름을 입력하세요"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="전화번호를 입력하세요"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  주소
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                  placeholder="주소를 입력하세요"
                />
              </div>

              {/* 자기소개 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  자기소개
                </label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) => updateField('introduction', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 ${
                    errors.introduction ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="자기소개를 작성해주세요"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.introduction && (
                    <p className="text-sm text-red-600">{errors.introduction}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.introduction.length}/500
                  </p>
                </div>
              </div>
            </form>

            {/* 푸터 */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading.update}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={handleSubmit}
                loading={loading.update}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>저장</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileEditModal;