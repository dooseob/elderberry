/**
 * ChatRoomListPage - 채팅방 목록 메인 페이지
 * 실시간 채팅 시스템의 랜딩 페이지
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ChatRoomList } from './components/ChatRoomList';

export const ChatRoomListPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>채팅방 목록 - 엘더베리</title>
        <meta name=\"description\" content=\"엘더베리 실시간 채팅 서비스. 코디네이터 상담, 시설 문의, 건강 상담 등 다양한 채팅방을 이용하세요.\" />
        <meta name=\"keywords\" content=\"엘더베리, 채팅, 상담, 코디네이터, 시설문의, 건강상담\" />
      </Helmet>

      <div className=\"min-h-screen bg-gray-50\">
        <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
          <ChatRoomList />
        </div>
      </div>
    </>
  );
};

export default ChatRoomListPage;