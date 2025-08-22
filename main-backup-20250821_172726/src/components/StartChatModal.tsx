import React from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { MessageCircle, Sparkles, Users, Shield } from "lucide-react";

interface StartChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartChat: () => void;
}

const StartChatModal: React.FC<StartChatModalProps> = ({ isOpen, onClose, onStartChat }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Elderberry AI와 대화 시작"
        >
            <div className="space-y-6">
                {/* 소개 섹션 */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#29b79c] to-[#20a085] rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI 상담사 Elby와 만나보세요</h3>
                    <p className="text-gray-600">
                        요양보호사 매칭부터 건강 상담까지, 궁금한 모든 것을 물어보세요.
                    </p>
                </div>

                {/* 기능 소개 */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Sparkles className="w-6 h-6 text-[#29b79c]" />
                        <div>
                            <div className="font-medium text-gray-900">맞춤형 추천</div>
                            <div className="text-sm text-gray-600">AI가 분석한 최적의 요양보호사를 추천해드립니다</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Users className="w-6 h-6 text-[#29b79c]" />
                        <div>
                            <div className="font-medium text-gray-900">전문 상담</div>
                            <div className="text-sm text-gray-600">요양 서비스 전반에 대한 전문적인 상담을 제공합니다</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Shield className="w-6 h-6 text-[#29b79c]" />
                        <div>
                            <div className="font-medium text-gray-900">안전한 매칭</div>
                            <div className="text-sm text-gray-600">검증된 전문가들과 안전하게 연결해드립니다</div>
                        </div>
                    </div>
                </div>

                {/* 시작 예시 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-800 mb-2">이렇게 시작해보세요:</div>
                    <div className="space-y-1 text-sm text-green-700">
                        <div>• "요양보호사를 추천해주세요"</div>
                        <div>• "우리 지역 요양시설을 알려주세요"</div>
                        <div>• "건강평가를 받고 싶어요"</div>
                        <div>• "돌봄 서비스 비용이 궁금해요"</div>
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        나중에
                    </Button>
                    <Button
                        onClick={() => {
                            onStartChat();
                            onClose();
                        }}
                        className="flex-1 bg-[#29b79c] hover:bg-[#20a085] text-white"
                    >
                        대화 시작하기
                    </Button>
                </div>

                {/* 하단 안내 */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                    24시간 언제든지 궁금한 것을 물어보세요. Elby가 도움을 드리겠습니다.
                </div>
            </div>
        </Modal>
    );
};

export default StartChatModal;