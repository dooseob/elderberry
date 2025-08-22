import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ExternalLink, HelpCircle, LogIn, Plus, Send, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  
  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  // Data for sidebar menu items
  const menuItems = [
    { icon: <HelpCircle className="w-4 h-4" />, text: "도움말" },
    { icon: <LogIn className="w-4 h-4" />, text: "로그인" },
    { icon: <ExternalLink className="w-4 h-4" />, text: "Elderberry로 이동" },
  ];

  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message) return;

    // 채팅 페이지로 이동하면서 프롬프트 전달
    navigate('/chat', { state: { prompt: message } });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <div className="flex h-screen items-start bg-white">
      {/* Sidebar */}
      <aside className={`hidden sm:flex flex-col h-full items-start py-[15px] sm:py-[20px] md:py-[30px] bg-white border-r border-[#e8e8e8] transition-all duration-300 ${
        isSidebarCollapsed 
          ? 'w-[60px] px-2' 
          : 'w-[180px] sm:w-[220px] md:w-[260px] pl-2 sm:pl-4 md:pl-6 pr-2 sm:pr-4 md:pr-[25px]'
      }`}>
        {/* Header */}
        <div className={`flex flex-col gap-5 pb-5 w-full ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
          <div className={`flex items-center w-full ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <div className="flex flex-col w-[132px] h-[26px] items-start">
                <div className="flex items-center">
                  <span className="font-bold text-lg">ai search</span>
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
              onClick={handleNewChat}
            >
              <Plus className="w-4 h-4" />
              <span className="font-bold text-[14.2px] text-[#404042]">
                새 대화
              </span>
            </Button>
          )}

          {isSidebarCollapsed && (
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 border-[#dedede]"
              onClick={handleNewChat}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Footer menu */}
        <div className={`flex flex-col pt-[21px] pb-0 w-full bg-white border-t border-[#e4e4e4] mt-auto ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
          <div className={`flex flex-col gap-1 w-full ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`flex min-h-[22px] items-center gap-1.5 p-1.5 w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}
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

                {/* Login tooltip - only shown for the login menu item */}
                {item.text === "로그인" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative"></div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-[#202020e6] border-none rounded-md"
                      >
                        <span className="font-bold text-white text-[12.2px]">
                          로그인 해주세요.
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="sm:hidden fixed top-4 left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 border-[#e4e4e4]"
        >
          <Plus className="w-5 h-5 rotate-45" />
        </Button>
      </div>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center flex-1 h-full bg-white overflow-y-auto">
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[900px] px-4 sm:px-8 md:px-16">
          <div className="flex flex-col items-center w-full">
            <h1 className="font-bold text-[#111111] text-[28.2px] text-center leading-[48px]">
              Elderberry
            </h1>
          </div>

          <Card className="flex flex-col w-full bg-white rounded-2xl border-2 border-[#29b79c] shadow-[0px_2px_10px_#00000029]">
            <CardContent className="p-0 w-full bg-white">
              <div className="flex flex-col w-full">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[80px] p-4 text-[15px] text-[#333] bg-transparent border-none outline-none resize-none placeholder:text-[#818181]"
                  placeholder="당신의 노년을 돕습니다."
                  rows={2}
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
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                <Send className="w-5 h-5 text-[#29b79c]" />
              </Button>
            </div>
          </Card>
        </div>

        <footer className="flex items-center justify-center gap-[12.01px] w-full mt-8">
          <div className="text-[#818181] text-[11.1px] text-center leading-[19.2px]">
            AI 모델에 의해 부정확한 정보가 포함될 수 있습니다.
          </div>

          <div className="text-[#818181] text-[11.2px] text-center leading-[19.2px]">
            <span className="font-bold">개인정보처리방침 </span>
            <span className="font-normal">이용약관</span>
          </div>
        </footer>
      </main>
    </div>
  );
}