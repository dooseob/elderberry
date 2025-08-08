/**
 * Chat API Client
 * ChatController와 연동하는 API 함수들
 */

import { apiClient } from './apiClient';
import type {
  ChatRoomsResponse,
  ChatRoomDetail,
  ChatMessagesResponse,
  ChatMessage,
  ChatRoomCreateRequest,
  MessageSendRequest,
  FileUploadRequest,
  ParticipantManageRequest,
  ChatStatistics,
  FileInfo
} from '../../entities/chat';

export const chatApi = {
  // 내 채팅방 목록 조회
  getChatRooms: async (params: {
    status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    page?: number;
    size?: number;
  } = {}): Promise<ChatRoomsResponse> => {
    const { status = 'ACTIVE', page = 0, size = 20 } = params;
    
    const response = await apiClient.get('/chat/rooms', {
      params: { status, page, size }
    });
    
    return response.data;
  },

  // 채팅방 생성
  createChatRoom: async (request: ChatRoomCreateRequest): Promise<ChatRoomDetail> => {
    const response = await apiClient.post('/chat/rooms', request);
    return response.data;
  },

  // 채팅방 상세 정보 조회
  getChatRoomDetail: async (roomId: number): Promise<ChatRoomDetail> => {
    const response = await apiClient.get(`/chat/rooms/${roomId}`);
    return response.data;
  },

  // 채팅 메시지 목록 조회
  getChatMessages: async (params: {
    roomId: number;
    beforeMessageId?: number;
    limit?: number;
  }): Promise<ChatMessagesResponse> => {
    const { roomId, beforeMessageId, limit = 50 } = params;
    
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, {
      params: {
        beforeMessageId,
        limit
      }
    });
    
    return response.data;
  },

  // 메시지 발송
  sendMessage: async (params: {
    roomId: number;
    message: MessageSendRequest;
  }): Promise<ChatMessage> => {
    const { roomId, message } = params;
    
    const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, message);
    return response.data;
  },

  // 메시지 읽음 처리
  markMessageAsRead: async (messageId: number): Promise<{ message: string }> => {
    const response = await apiClient.put(`/chat/messages/${messageId}/read`);
    return response.data;
  },

  // 파일 업로드
  uploadFile: async (fileRequest: FileUploadRequest): Promise<FileInfo> => {
    const response = await apiClient.post('/chat/upload', fileRequest);
    return response.data;
  },

  // 채팅방 참여자 관리
  manageParticipants: async (params: {
    roomId: number;
    request: ParticipantManageRequest;
  }): Promise<{ message: string }> => {
    const { roomId, request } = params;
    
    const response = await apiClient.put(`/chat/rooms/${roomId}/participants`, request);
    return response.data;
  },

  // 채팅 통계 조회
  getChatStatistics: async (days: number = 30): Promise<ChatStatistics> => {
    const response = await apiClient.get('/chat/statistics', {
      params: { days }
    });
    
    return response.data;
  },

  // 파일 다운로드 URL 생성 (헬퍼 함수)
  getFileDownloadUrl: (fileId: number): string => {
    return `/api/chat/files/${fileId}`;
  },

  // 파일 썸네일 URL 생성 (헬퍼 함수)
  getFileThumbnailUrl: (fileId: number): string => {
    return `/api/chat/files/${fileId}/thumbnail`;
  }
};

export default chatApi;