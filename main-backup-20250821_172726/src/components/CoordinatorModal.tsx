import React, { useState } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Phone, MapPin, Award, Clock, Languages, Star, TrendingUp } from "lucide-react";
import ProgressModal from "./ProgressModal";

interface Coordinator {
  coordinator_id?: number;
  name: string;
  gender?: string;
  age?: number;
  address?: string;
  care_index?: number;
  phone?: string;
  regions?: string;
  certifications?: string;
  experiences?: string;
  languages?: string;
}

interface CoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinator: Coordinator | null;
}

const CoordinatorModal: React.FC<CoordinatorModalProps> = ({ isOpen, onClose, coordinator }) => {
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  
  if (!coordinator) return null;

  const handleCall = () => {
    if (coordinator.phone) {
      window.location.href = `tel:${coordinator.phone}`;
    }
  };

  const handleMessage = () => {
    if (coordinator.phone) {
      window.location.href = `sms:${coordinator.phone}`;
    }
  };

  const genderText = coordinator.gender === 'FEMALE' ? '여성' : coordinator.gender === 'MALE' ? '남성' : coordinator.gender;

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`${coordinator.name} 코디네이터`}
      >
        <div className="space-y-6">
          {/* 프로필 섹션 */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#29b79c] to-[#20a085] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {coordinator.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{coordinator.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{genderText}</span>
                <span>•</span>
                <span>{coordinator.age}세</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-[#29b79c]">{coordinator.care_index}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 연락처 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-[#29b79c]" />
              <div>
                <div className="text-sm text-gray-600">연락처</div>
                <div className="font-medium">{coordinator.phone || '정보 없음'}</div>
              </div>
            </div>

            {/* 지역 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-[#29b79c]" />
              <div>
                <div className="text-sm text-gray-600">활동 지역</div>
                <div className="font-medium">{coordinator.regions || coordinator.address || '정보 없음'}</div>
              </div>
            </div>
          </div>

          {/* 전문 정보 */}
          <div className="space-y-4">
            {/* 자격증 */}
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-[#29b79c] mt-1" />
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">보유 자격증</div>
                <div className="font-medium">{coordinator.certifications || '요양보호사 자격증'}</div>
              </div>
            </div>

            {/* 경력 */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#29b79c] mt-1" />
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">경력 및 전문분야</div>
                <div className="font-medium">{coordinator.experiences || '전문 돌봄 서비스 제공'}</div>
              </div>
            </div>

            {/* 언어 */}
            <div className="flex items-start gap-3">
              <Languages className="w-5 h-5 text-[#29b79c] mt-1" />
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">사용 가능 언어</div>
                <div className="font-medium">{coordinator.languages || '한국어'}</div>
              </div>
            </div>
          </div>

          {/* 케어 지수 */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">돌봄 지수</span>
              <span className="text-2xl font-bold text-green-900">{coordinator.care_index}/5</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((coordinator.care_index || 0) / 5) * 100}%` }}
              />
            </div>
            <div className="text-xs text-green-700 mt-1">
              전문성, 경력, 고객 만족도를 종합한 지수입니다. (5점 만점)
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button 
              onClick={handleCall}
              className="flex-1 bg-[#29b79c] hover:bg-[#20a085] text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              전화하기
            </Button>
            <Button 
              onClick={handleMessage}
              variant="outline"
              className="flex-1 border-[#29b79c] text-[#29b79c] hover:bg-[#29b79c] hover:text-white"
            >
              문자하기
            </Button>
          </div>

          {/* 진행상황 버튼 */}
          <div className="pt-2">
            <Button 
              onClick={() => setIsProgressModalOpen(true)}
              variant="outline"
              className="w-full border-[#29b79c] text-[#29b79c] hover:bg-[#29b79c] hover:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              진행상황보러가기
            </Button>
          </div>

          {/* 추가 정보 */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            상담 및 서비스 이용 시 "AI 추천"을 통해 연락드렸다고 말씀해 주세요.
          </div>
        </div>
      </Modal>

      {/* 진행상황 모달 */}
      <ProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        coordinator={coordinator}
      />
    </>
  );
};

export default CoordinatorModal;