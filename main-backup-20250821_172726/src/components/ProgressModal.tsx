import React, { useState } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import {
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from "lucide-react";

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

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinator: Coordinator | null;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose, coordinator }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: '1단계: 초기 상담',
      description: '코디네이터와 첫 상담을 진행합니다.',
      icon: <Phone className="w-6 h-6" />,
      details: [
        '• 돌봄 대상자의 상태 파악',
        '• 필요한 서비스 범위 논의',
        '• 예상 비용 및 일정 안내',
        '• 궁금한 사항 질의응답'
      ],
      actions: [
        { label: '전화상담', icon: <Phone className="w-4 h-4" />, action: () => window.location.href = `tel:${coordinator?.phone}` },
        { label: '문자상담', icon: <MessageSquare className="w-4 h-4" />, action: () => window.location.href = `sms:${coordinator?.phone}` }
      ]
    },
    {
      label: '2단계: 서비스 계획 수립',
      description: '맞춤형 돌봄 계획을 세웁니다.',
      icon: <FileText className="w-6 h-6" />,
      details: [
        '• 개인별 맞춤 돌봄 계획서 작성',
        '• 서비스 일정 및 시간 조정',
        '• 응급상황 대응 방안 수립',
        '• 가족과의 소통 방식 결정'
      ],
      actions: [
        { label: '계획서 요청', icon: <FileText className="w-4 h-4" />, action: () => alert('계획서 요청이 전송되었습니다.') }
      ]
    },
    {
      label: '3단계: 서비스 시작',
      description: '실제 돌봄 서비스를 시작합니다.',
      icon: <Calendar className="w-6 h-6" />,
      details: [
        '• 첫 방문 및 환경 적응',
        '• 돌봄 서비스 본격 시작',
        '• 정기적인 상태 점검',
        '• 필요시 계획 조정'
      ],
      actions: [
        { label: '일정 조율', icon: <Calendar className="w-4 h-4" />, action: () => alert('일정 조율 요청이 전송되었습니다.') }
      ]
    },
    {
      label: '4단계: 지속적 관리',
      description: '안정적인 돌봄 서비스를 제공합니다.',
      icon: <UserCheck className="w-6 h-6" />,
      details: [
        '• 정기적인 서비스 품질 점검',
        '• 가족과의 지속적인 소통',
        '• 필요시 서비스 개선',
        '• 장기적인 돌봄 계획 수립'
      ],
      actions: [
        { label: '정기 점검', icon: <UserCheck className="w-4 h-4" />, action: () => alert('정기 점검이 예약되었습니다.') }
      ]
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${coordinator?.name} 코디네이터 - 서비스 진행상황`}
    >
      <div className="space-y-6">
        {/* 코디네이터 정보 요약 */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-gradient-to-br from-[#29b79c] to-[#20a085] rounded-full flex items-center justify-center text-white font-bold">
            {coordinator?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{coordinator?.name} 코디네이터</div>
            <div className="text-sm text-gray-600">{coordinator?.regions || coordinator?.address}</div>
          </div>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                index < activeStep 
                  ? 'bg-[#29b79c] text-white' 
                  : index === activeStep 
                    ? 'bg-[#29b79c] text-white ring-4 ring-[#29b79c]/20' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index < activeStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-full transition-all duration-300 ${
                  index < activeStep ? 'bg-[#29b79c]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* 현재 단계 내용 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-[#29b79c]">
              {steps[activeStep].icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{steps[activeStep].label}</h3>
              <p className="text-sm text-gray-600">{steps[activeStep].description}</p>
            </div>
          </div>

          {/* 단계별 세부 내용 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              {steps[activeStep].details.map((detail, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {detail}
                </div>
              ))}
            </div>
          </div>

          {/* 단계별 액션 버튼 */}
          <div className="flex gap-2 mb-4">
            {steps[activeStep].actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                className="bg-[#29b79c] hover:bg-[#20a085] text-white"
                onClick={action.action}
              >
                {action.icon}
                <span className="ml-1">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
            
            <div className="text-sm text-gray-500 self-center">
              {activeStep + 1} / {steps.length}
            </div>
            
            <Button
              size="sm"
              className="bg-[#29b79c] hover:bg-[#20a085] text-white"
              onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
            >
              {activeStep === steps.length - 1 ? '처음으로' : '다음'}
              {activeStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* 완료 메시지 */}
        {activeStep === steps.length - 1 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">서비스 진행 완료!</span>
            </div>
            <p className="text-sm text-green-700">
              {coordinator?.name} 코디네이터와 함께하는 돌봄 서비스가 안정적으로 진행되고 있습니다.
              지속적인 관리를 통해 최상의 서비스를 제공하겠습니다.
            </p>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-100">
          각 단계별로 코디네이터가 직접 연락드려 진행상황을 안내해드립니다.
        </div>
      </div>
    </Modal>
  );
};

export default ProgressModal;