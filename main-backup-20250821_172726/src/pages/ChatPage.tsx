import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ExternalLink, HelpCircle, LogIn, Send, PanelLeftClose, PanelLeftOpen, ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import CoordinatorModal from "../components/CoordinatorModal";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
  extractedInfo?: {
    recommendations?: Coordinator[];
  };
}

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

interface ChatPageProps {
  onGoHome?: () => void;
  onGoMainPage?: () => void;
  onGoLogin?: () => void;
  initialPrompt?: string;
}

export default function ChatPage({ onGoHome, onGoMainPage, onGoLogin, initialPrompt }: ChatPageProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 초기 프롬프트 처리
  useEffect(() => {
    if (initialPrompt) {
      setInputMessage(initialPrompt);
      // 자동으로 메시지 전송
      setTimeout(() => {
        sendMessage(initialPrompt);
      }, 100);
    }
  }, [initialPrompt]);

  // 메시지 추가 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const menuItems = [
    { icon: <HelpCircle className="w-4 h-4" />, text: "도움말", action: () => {} },
    { icon: <LogIn className="w-4 h-4" />, text: "로그인", action: onGoLogin || (() => {}) },
    { icon: <ExternalLink className="w-4 h-4" />, text: "Elderberry로 이동", action: onGoMainPage || (() => {}) },
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const addMessage = (message: string, isUser: boolean, extractedInfo?: any) => {
    const newMessage: Message = {
      id: Date.now(),
      text: message,
      isUser,
      timestamp: new Date().toISOString(),
      extractedInfo
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (messageText = inputMessage.trim()) => {
    if (!messageText) return;

    // 사용자 메시지 추가
    addMessage(messageText, true);
    setInputMessage("");
    setIsLoading(true);
    setError("");

    try {
      // API 엔드포인트 - 프로젝트에 맞게 수정하세요
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText
        })
      });

      if (!response.ok) {
        console.error('응답 에러:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('에러 내용:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('서버 응답:', data);

      const botMessage = data.response || '죄송합니다. 응답을 처리할 수 없습니다.';

      // 코디네이터 추천이 있는 경우 추가 정보 표시
      const hasRecommendations = data.recommendations &&
        Array.isArray(data.recommendations) &&
        data.recommendations.length > 0;

      const isRecommendationType = data.response_type === 'coordinator_recommendation' ||
        data.response_type === 'recommendation' ||
        hasRecommendations;

      if (isRecommendationType && hasRecommendations) {
        addMessage(botMessage, false, { recommendations: data.recommendations });
      } else {
        // 임시 테스트: "추천" 키워드가 있으면 테스트 데이터 표시
        if (messageText.includes('추천') || messageText.includes('코디네이터')) {
          const testRecommendations = [
            {
              coordinator_id: 1,
              name: '김영희',
              gender: 'FEMALE',
              age: 45,
              address: '서울시 강남구',
              care_index: 8.5,
              phone: '010-1234-5678',
              regions: '서울시 강남구, 서초구',
              certifications: '요양보호사 1급, 간병사 자격증',
              experiences: '노인돌봄 5년, 치매환자 전문',
              languages: '한국어, 영어'
            }
          ];
          addMessage(botMessage + '\n\n(테스트 데이터)', false, { recommendations: testRecommendations });
        } else {
          addMessage(botMessage, false);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      setError('메시지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      addMessage("죄송합니다. 현재 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  const goBack = () => {
    if (onGoHome) {
      onGoHome();
    }
  };

  return (
    <div className="flex h-screen items-start bg-white">
      {/* Sidebar */}
      <aside className={`hidden sm:flex flex-col h-full items-start py-[15px] sm:py-[20px] md:py-[30px] bg-white border-r border-[#e8e8e8] transition-all duration-300 ${isSidebarCollapsed
        ? 'w-[60px] px-2'
        : 'w-[180px] sm:w-[220px] md:w-[260px] pl-2 sm:pl-4 md:pl-6 pr-2 sm:pr-4 md:pr-[25px]'
        }`}>
        {/* Header */}
        <div className={`flex flex-col gap-5 pb-5 w-full ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
          <div className={`flex items-center w-full ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <div className="flex flex-col w-[132px] h-[26px] items-start">
                <div className="flex items-center">
                  <button 
                    onClick={onGoMainPage}
                    className="font-bold text-lg text-primary hover:text-primary-dark transition-colors"
                  >
                    Elderberry AI
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 border-[#e4e4e4]"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </Button>
          </div>

          {!isSidebarCollapsed && (
            <Button
              variant="outline"
              className="flex h-[42px] items-center justify-center gap-1 px-[27px] py-[11px] w-full border-[#dedede]"
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold text-[14.2px] text-[#404042]">
                이전으로
              </span>
            </Button>
          )}

          {isSidebarCollapsed && (
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 border-[#dedede]"
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Footer menu */}
        <div className={`flex flex-col pt-[21px] pb-0 w-full bg-white border-t border-[#e4e4e4] mt-auto ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
          <div className={`flex flex-col gap-1 w-full ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={item.action}
                className={`flex min-h-[22px] items-center gap-1.5 p-1.5 w-full cursor-pointer hover:bg-gray-50 rounded ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <div className={`flex flex-col w-4 h-4 ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex flex-col h-[22.39px] items-start flex-1">
                    <div className="relative self-stretch mt-[-1.00px] font-normal text-[#404042] text-[13.1px] tracking-[0] leading-[22.4px] overflow-hidden text-ellipsis">
                      {item.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Content */}
      <main className="flex flex-col flex-1 h-full bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e8e8e8] bg-[#f8f9fa]">
          <h1 className="font-bold text-xl text-[#111111]">Elderberry Chat</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="text-[#666] hover:bg-gray-100"
          >
            대화 내용 지우기
          </Button>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {messages.map((message) => (
            <div key={message.id} className="animate-in fade-in duration-300">
              <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`max-w-[75%] ${message.isUser ? 'ml-12' : 'mr-12'}`}>
                  {/* 메시지 헤더 */}
                  <div className={`text-xs text-gray-500 mb-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                    {message.isUser ? '나' : 'Elderberry'} • {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* 메시지 버블 */}
                  <div className={`p-4 rounded-2xl shadow-sm ${message.isUser
                    ? 'bg-[#29b79c] text-white rounded-br-md'
                    : 'bg-white text-[#333] border border-gray-200 rounded-bl-md'
                    }`}>
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {message.text}
                    </div>
                  </div>
                </div>
              </div>

              {/* 추출된 정보 표시 */}
              {message.extractedInfo && message.extractedInfo.recommendations && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] mr-12 mt-2">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-green-800">추천 요양보호사</span>
                      </div>
                      <div className="space-y-3">
                        {message.extractedInfo.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="bg-white/70 p-3 rounded-lg border border-green-100 cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200"
                            onClick={() => {
                              setSelectedCoordinator(rec);
                              setIsModalOpen(true);
                            }}
                          >
                            <div className="font-medium text-green-900 mb-1">{rec.name || `요양보호사 ${index + 1}`}</div>
                            {rec.experiences && (
                              <div className="text-sm text-green-700 mb-1">경력: {rec.experiences}</div>
                            )}
                            {rec.certifications && (
                              <div className="text-sm text-green-700 mb-1">자격증: {rec.certifications}</div>
                            )}
                            {rec.regions && (
                              <div className="text-sm text-green-700 mb-1">지역: {rec.regions}</div>
                            )}
                            {rec.care_index && (
                              <div className="text-sm text-green-700">케어지수: ⭐ {rec.care_index}</div>
                            )}
                            <div className="text-xs text-green-600 mt-2 opacity-75">클릭하여 상세 정보 보기</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="max-w-[75%] mr-12">
                <div className="text-xs text-gray-500 mb-1">
                  Elderberry • 입력 중...
                </div>
                <div className="bg-white border border-gray-200 text-[#666] p-4 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">응답 생성 중입니다...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 빈 상태 메시지 */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#29b79c] to-[#20a085] rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-white">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Elderberry와 대화를 시작해보세요</h3>
              <p className="text-gray-500 max-w-md">
                궁금한 것이 있으시면 언제든지 물어보세요. 도움이 되도록 최선을 다하겠습니다.
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 p-3 bg-[#f8d7da] text-[#dc3545] rounded-lg border border-[#f5c6cb]">
            {error}
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t border-[#e8e8e8]">
          <Card className="flex flex-col w-full bg-white rounded-2xl border-2 border-[#29b79c] shadow-[0px_2px_10px_#00000029]">
            <CardContent className="p-0 w-full bg-white">
              <div className="flex flex-col w-full">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[80px] p-4 text-[15px] text-[#333] bg-transparent border-none outline-none resize-none placeholder:text-[#818181]"
                  placeholder="메시지를 입력하세요..."
                  rows={2}
                  disabled={isLoading}
                />
              </div>
            </CardContent>

            <div className="flex items-center justify-between w-full px-4 py-3 border-t border-[#e4e4e4]">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-[#666] hover:bg-gray-100 text-sm"
                >
                  📎 첨부하기
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-[#666] hover:bg-gray-100 text-sm"
                >
                  📄 문서첨부
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 p-0 hover:bg-gray-100 rounded-full"
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="w-5 h-5 text-[#29b79c]" />
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* 코디네이터 상세 정보 모달 */}
      <CoordinatorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCoordinator(null);
        }}
        coordinator={selectedCoordinator}
      />
    </div>
  );
}