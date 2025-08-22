/**
 * 채팅 시스템 도메인 타입 정의
 * ChatController API 기반으로 정의됨
 */

export type ChatRoomType = 
  | 'COORDINATOR_CONSULTATION' 
  | 'FACILITY_INQUIRY' 
  | 'HEALTH_CONSULTATION' 
  | 'SUPPORT' 
  | 'GROUP_DISCUSSION';

export type MessageType = 'TEXT' | 'FILE';

export type DeliveryStatus = 'SENT' | 'DELIVERED' | 'READ';

export type ChatRoomStatus = 'ACTIVE' | 'INACTIVE';

export interface ChatRoomListItem {
  roomId: number;
  roomName: string;
  roomType: ChatRoomType;
  lastMessage: string;
  participantCount: number;
  unreadCount: number;
  isActive: boolean;
  lastActivity: string;
  roomIcon: string;
}

export interface ChatRoomDetail {
  roomId: number;
  roomName: string;
  roomType: ChatRoomType;
  description: string;
  createdAt: string;
  status: ChatRoomStatus;
  participants: ChatParticipant[];
  settings: ChatRoomSettings;
}

export interface ChatParticipant {
  userId: string;
  name: string;
  role: string;
  joinedAt: string;
}

export interface ChatRoomSettings {
  allowFileShare: boolean;
  allowVoiceMessage: boolean;
  autoTranslate: boolean;
  notificationEnabled: boolean;
}

export interface ChatMessage {
  messageId: number;
  roomId?: number;
  senderId: string;
  senderName: string;
  messageType: MessageType;
  content: string;
  sentAt: string;
  readBy: string[];
  deliveryStatus: DeliveryStatus;
  fileInfo?: FileInfo;
}

export interface FileInfo {
  fileId?: number;
  fileName: string;
  fileSize: number;
  fileType?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface ChatRoomCreateRequest {
  roomName: string;
  roomType: ChatRoomType;
  description?: string;
  participants?: string[];
}

export interface MessageSendRequest {
  messageType: MessageType;
  content: string;
  fileInfo?: Partial<FileInfo>;
}

export interface FileUploadRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string | File;
}

export interface ParticipantManageRequest {
  action: 'ADD' | 'REMOVE' | 'PROMOTE' | 'DEMOTE';
  userId: string;
}

export interface ChatStatistics {
  period: string;
  totalRooms: number;
  activeRooms: number;
  totalMessages: number;
  sentMessages: number;
  receivedMessages: number;
  averageResponseTime: string;
  mostActiveDays: string[];
  preferredChatTime: string;
  messagesByRoomType: Record<ChatRoomType, number>;
}

// API 응답 타입들
export interface ChatRoomsResponse {
  content: ChatRoomListItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ChatMessagesResponse {
  content: ChatMessage[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 채팅 UI 상태 타입들
export interface ChatUIState {
  selectedRoomId: number | null;
  isSidebarCollapsed: boolean;
  isTyping: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export interface MessageInputState {
  message: string;
  isLoading: boolean;
  attachments: File[];
}

// WebSocket 이벤트 타입들 (향후 실시간 기능용)
export interface WebSocketMessage {
  type: 'MESSAGE' | 'READ_RECEIPT' | 'TYPING' | 'JOIN' | 'LEAVE';
  roomId: number;
  payload: any;
  timestamp: string;
}

// 채팅방 유형별 아이콘 매핑
export const CHAT_ROOM_ICONS: Record<ChatRoomType, string> = {
  'COORDINATOR_CONSULTATION': '👨‍⚕️',
  'FACILITY_INQUIRY': '🏥',
  'HEALTH_CONSULTATION': '🩺',
  'SUPPORT': '🛠️',
  'GROUP_DISCUSSION': '👥'
};

// 채팅방 유형별 라벨 매핑
export const CHAT_ROOM_LABELS: Record<ChatRoomType, string> = {
  'COORDINATOR_CONSULTATION': '코디네이터 상담',
  'FACILITY_INQUIRY': '시설 문의',
  'HEALTH_CONSULTATION': '건강 상담',
  'SUPPORT': '지원 요청',
  'GROUP_DISCUSSION': '그룹 토론'
};