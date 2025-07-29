package com.globalcarelink.chat;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 채팅 시스템 컨트롤러
 * - 실시간 채팅 관리
 * - 채팅방 생성 및 관리
 * - 메시지 발송 및 수신
 * - 파일 공유 및 첨부
 */
@Tag(name = "채팅 시스템", description = "실시간 채팅 및 메시지 관리 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    @Operation(
        summary = "내 채팅방 목록 조회",
        description = "현재 사용자가 참여 중인 채팅방 목록을 조회합니다."
    )
    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getChatRooms(
            @Parameter(description = "채팅방 상태 (ACTIVE, INACTIVE, ALL)")
            @RequestParam(defaultValue = "ACTIVE") String status,
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "한 페이지 결과 수")
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        log.info("내 채팅방 목록 조회 - 사용자: {}, 상태: {}", authentication.getName(), status);

        // 사용자 참여 채팅방 목록 (임시 더미 데이터)
        List<Map<String, Object>> chatRooms = createUserChatRooms(authentication.getName(), status);

        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> roomPage = new PageImpl<>(chatRooms, pageable, chatRooms.size());

        log.info("내 채팅방 목록 조회 완료 - {}개", chatRooms.size());
        return ResponseEntity.ok(roomPage);
    }

    @Operation(
        summary = "채팅방 생성",
        description = "새로운 채팅방을 생성합니다."
    )
    @PostMapping("/rooms")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createChatRoom(
            @Parameter(description = "채팅방 생성 요청", required = true)
            @RequestBody Map<String, Object> createRequest,
            Authentication authentication) {
        
        log.info("채팅방 생성 - 생성자: {}, 유형: {}", 
                authentication.getName(), createRequest.get("roomType"));

        Map<String, Object> chatRoom = new HashMap<>();
        chatRoom.put("roomId", System.currentTimeMillis());
        chatRoom.put("roomName", createRequest.get("roomName"));
        chatRoom.put("roomType", createRequest.get("roomType"));
        chatRoom.put("createdBy", authentication.getName());
        chatRoom.put("createdAt", LocalDateTime.now());
        chatRoom.put("participantCount", 2);
        chatRoom.put("status", "ACTIVE");
        chatRoom.put("lastMessage", null);
        chatRoom.put("unreadCount", 0);

        log.info("채팅방 생성 완료 - 방ID: {}", chatRoom.get("roomId"));
        return ResponseEntity.ok(chatRoom);
    }

    @Operation(
        summary = "채팅방 상세 정보 조회",
        description = "특정 채팅방의 상세 정보를 조회합니다."
    )
    @GetMapping("/rooms/{roomId}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getChatRoomDetail(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long roomId,
            Authentication authentication) {
        
        log.info("채팅방 상세 정보 조회 - 방ID: {}, 사용자: {}", roomId, authentication.getName());

        Map<String, Object> roomDetail = new HashMap<>();
        roomDetail.put("roomId", roomId);
        roomDetail.put("roomName", "김코디네이터와의 상담");
        roomDetail.put("roomType", "COORDINATOR_CONSULTATION");
        roomDetail.put("description", "시설 매칭 및 케어 상담");
        roomDetail.put("createdAt", LocalDateTime.now().minusDays(3));
        roomDetail.put("status", "ACTIVE");
        
        // 참여자 정보
        List<Map<String, Object>> participants = List.of(
            Map.of("userId", authentication.getName(), "name", "사용자", "role", "USER", "joinedAt", LocalDateTime.now().minusDays(3)),
            Map.of("userId", "coordinator1", "name", "김코디네이터", "role", "COORDINATOR", "joinedAt", LocalDateTime.now().minusDays(3))
        );
        roomDetail.put("participants", participants);
        
        // 채팅방 설정
        roomDetail.put("settings", Map.of(
            "allowFileShare", true,
            "allowVoiceMessage", true,
            "autoTranslate", false,
            "notificationEnabled", true
        ));

        log.info("채팅방 상세 정보 조회 완료 - 방ID: {}", roomId);
        return ResponseEntity.ok(roomDetail);
    }

    @Operation(
        summary = "채팅 메시지 목록 조회",
        description = "특정 채팅방의 메시지 목록을 조회합니다."
    )
    @GetMapping("/rooms/{roomId}/messages")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getChatMessages(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long roomId,
            @Parameter(description = "메시지 ID (이 ID 이전 메시지 조회)")
            @RequestParam(required = false) Long beforeMessageId,
            @Parameter(description = "한 번에 가져올 메시지 수")
            @RequestParam(defaultValue = "50") int limit,
            Authentication authentication) {
        
        log.info("채팅 메시지 목록 조회 - 방ID: {}, 사용자: {}, 이전ID: {}", 
                roomId, authentication.getName(), beforeMessageId);

        // 채팅 메시지 목록 (임시 더미 데이터)
        List<Map<String, Object>> messages = createChatMessages(roomId, authentication.getName());

        Pageable pageable = PageRequest.of(0, limit);
        Page<Map<String, Object>> messagePage = new PageImpl<>(messages, pageable, messages.size());

        log.info("채팅 메시지 목록 조회 완료 - {}개", messages.size());
        return ResponseEntity.ok(messagePage);
    }

    @Operation(
        summary = "메시지 발송",
        description = "채팅방에 새 메시지를 발송합니다."
    )
    @PostMapping("/rooms/{roomId}/messages")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long roomId,
            @Parameter(description = "메시지 발송 요청", required = true)
            @RequestBody Map<String, Object> messageRequest,
            Authentication authentication) {
        
        log.info("메시지 발송 - 방ID: {}, 발송자: {}, 유형: {}", 
                roomId, authentication.getName(), messageRequest.get("messageType"));

        Map<String, Object> message = new HashMap<>();
        message.put("messageId", System.currentTimeMillis());
        message.put("roomId", roomId);
        message.put("senderId", authentication.getName());
        message.put("senderName", "사용자");
        message.put("messageType", messageRequest.get("messageType"));
        message.put("content", messageRequest.get("content"));
        message.put("sentAt", LocalDateTime.now());
        message.put("readBy", List.of(authentication.getName()));
        message.put("deliveryStatus", "SENT");

        log.info("메시지 발송 완료 - 메시지ID: {}", message.get("messageId"));
        return ResponseEntity.ok(message);
    }

    @Operation(
        summary = "메시지 읽음 처리",  
        description = "특정 메시지를 읽음으로 표시합니다."
    )
    @PutMapping("/messages/{messageId}/read")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> markMessageAsRead(
            @Parameter(description = "메시지 ID", required = true)
            @PathVariable Long messageId,
            Authentication authentication) {
        
        log.info("메시지 읽음 처리 - 메시지ID: {}, 사용자: {}", messageId, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("messageId", messageId);
        response.put("readBy", authentication.getName());
        response.put("readAt", LocalDateTime.now());
        response.put("message", "메시지가 읽음으로 표시되었습니다.");

        log.info("메시지 읽음 처리 완료 - 메시지ID: {}", messageId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "파일 업로드",
        description = "채팅에 첨부할 파일을 업로드합니다."
    )
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @Parameter(description = "파일 업로드 요청", required = true)
            @RequestBody Map<String, Object> uploadRequest,
            Authentication authentication) {
        
        log.info("파일 업로드 - 사용자: {}, 파일명: {}", 
                authentication.getName(), uploadRequest.get("fileName"));

        Map<String, Object> fileInfo = new HashMap<>();
        fileInfo.put("fileId", System.currentTimeMillis());
        fileInfo.put("fileName", uploadRequest.get("fileName"));
        fileInfo.put("fileSize", uploadRequest.get("fileSize"));
        fileInfo.put("fileType", uploadRequest.get("fileType"));
        fileInfo.put("uploadedBy", authentication.getName());
        fileInfo.put("uploadedAt", LocalDateTime.now());
        fileInfo.put("downloadUrl", "/api/chat/files/" + fileInfo.get("fileId"));
        fileInfo.put("thumbnailUrl", "/api/chat/files/" + fileInfo.get("fileId") + "/thumbnail");

        log.info("파일 업로드 완료 - 파일ID: {}", fileInfo.get("fileId"));
        return ResponseEntity.ok(fileInfo);
    }

    @Operation(
        summary = "채팅방 참여자 관리",
        description = "채팅방에 참여자를 추가하거나 제거합니다."
    )
    @PutMapping("/rooms/{roomId}/participants")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> manageParticipants(
            @Parameter(description = "채팅방 ID", required = true)
            @PathVariable Long roomId,
            @Parameter(description = "참여자 관리 요청", required = true)
            @RequestBody Map<String, Object> participantRequest,
            Authentication authentication) {
        
        log.info("채팅방 참여자 관리 - 방ID: {}, 관리자: {}, 작업: {}", 
                roomId, authentication.getName(), participantRequest.get("action"));

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put("action", participantRequest.get("action"));
        response.put("targetUserId", participantRequest.get("userId"));
        response.put("processedBy", authentication.getName());
        response.put("processedAt", LocalDateTime.now());
        response.put("message", "참여자 관리가 완료되었습니다.");

        log.info("채팅방 참여자 관리 완료 - 방ID: {}", roomId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "채팅 통계",
        description = "사용자의 채팅 활동 통계를 조회합니다."
    )
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getChatStatistics(
            @Parameter(description = "통계 기간 (일)")
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        
        log.info("채팅 통계 조회 - 사용자: {}, 기간: {}일", authentication.getName(), days);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("period", days + "일");
        statistics.put("totalRooms", 8);
        statistics.put("activeRooms", 5);
        statistics.put("totalMessages", 156);
        statistics.put("sentMessages", 89);
        statistics.put("receivedMessages", 67);
        statistics.put("averageResponseTime", "12분");
        statistics.put("mostActiveDays", List.of("월요일", "화요일", "수요일"));
        statistics.put("preferredChatTime", "14:00-16:00");
        
        Map<String, Object> byRoomType = new HashMap<>();
        byRoomType.put("COORDINATOR_CONSULTATION", 45);
        byRoomType.put("FACILITY_INQUIRY", 32);
        byRoomType.put("SUPPORT", 23);
        byRoomType.put("GROUP_DISCUSSION", 56);
        statistics.put("messagesByRoomType", byRoomType);

        log.info("채팅 통계 조회 완료 - 총 {}개 방, {}개 메시지", 
                statistics.get("totalRooms"), statistics.get("totalMessages"));
        return ResponseEntity.ok(statistics);
    }

    // ===== 내부 헬퍼 메서드들 =====

    /**
     * 사용자 채팅방 목록 생성 (임시 더미 데이터)
     */
    private List<Map<String, Object>> createUserChatRooms(String userName, String status) {
        List<Map<String, Object>> allRooms = List.of(
            createChatRoomItem(1L, "김코디네이터와의 상담", "COORDINATOR_CONSULTATION", 
                "안녕하세요. 시설 매칭 관련해서 문의드립니다.", 2, 0, true, LocalDateTime.now().minusMinutes(15)),
            createChatRoomItem(2L, "서울중앙요양원 문의", "FACILITY_INQUIRY", 
                "가격 정보와 입원 절차에 대해 알고 싶습니다.", 3, 1, true, LocalDateTime.now().minusHours(2)),
            createChatRoomItem(3L, "건강 평가 결과 상담", "HEALTH_CONSULTATION", 
                "평가 결과에 대한 상세한 설명 부탁드립니다.", 2, 0, true, LocalDateTime.now().minusDays(1)),
            createChatRoomItem(4L, "시스템 지원", "SUPPORT", 
                "로그인 문제 해결 완료되었습니다.", 2, 0, false, LocalDateTime.now().minusDays(7)),
            createChatRoomItem(5L, "가족 상담 그룹", "GROUP_DISCUSSION", 
                "비슷한 상황의 가족들과 정보 공유합니다.", 8, 3, true, LocalDateTime.now().minusHours(6))
        );

        return allRooms.stream()
                .filter(room -> {
                    if ("ACTIVE".equals(status)) {
                        return (Boolean) room.get("isActive");
                    } else if ("INACTIVE".equals(status)) {
                        return !(Boolean) room.get("isActive");
                    }
                    return true; // ALL
                })
                .toList();
    }

    /**
     * 개별 채팅방 아이템 생성
     */
    private Map<String, Object> createChatRoomItem(
            Long roomId, String roomName, String roomType, String lastMessage,
            int participantCount, int unreadCount, boolean isActive, LocalDateTime lastActivity) {
        
        Map<String, Object> room = new HashMap<>();
        room.put("roomId", roomId);
        room.put("roomName", roomName);
        room.put("roomType", roomType);
        room.put("lastMessage", lastMessage);
        room.put("participantCount", participantCount);
        room.put("unreadCount", unreadCount);
        room.put("isActive", isActive);
        room.put("lastActivity", lastActivity);
        room.put("roomIcon", getChatRoomIcon(roomType));
        
        return room;
    }

    /**
     * 채팅 메시지 목록 생성 (임시 더미 데이터)
     */
    private List<Map<String, Object>> createChatMessages(Long roomId, String userName) {
        return List.of(
            createMessageItem(1L, "coordinator1", "김코디네이터", "TEXT", 
                "안녕하세요. 고객님의 건강 평가 결과를 검토했습니다.", LocalDateTime.now().minusHours(2)),
            createMessageItem(2L, userName, "사용자", "TEXT", 
                "네, 감사합니다. 어떤 시설들을 추천해 주실 수 있나요?", LocalDateTime.now().minusHours(2).plusMinutes(5)),
            createMessageItem(3L, "coordinator1", "김코디네이터", "TEXT", 
                "고객님께는 서울중앙요양원과 강남실버케어를 추천드립니다.", LocalDateTime.now().minusHours(1)),
            createMessageItem(4L, "coordinator1", "김코디네이터", "FILE", 
                "상세한 시설 정보 자료를 첨부해 드립니다.", LocalDateTime.now().minusHours(1).plusMinutes(2)),
            createMessageItem(5L, userName, "사용자", "TEXT", 
                "감사합니다. 검토 후 다시 연락드리겠습니다.", LocalDateTime.now().minusMinutes(30))
        );
    }

    /**
     * 개별 메시지 아이템 생성
     */
    private Map<String, Object> createMessageItem(
            Long messageId, String senderId, String senderName, String messageType,
            String content, LocalDateTime sentAt) {
        
        Map<String, Object> message = new HashMap<>();
        message.put("messageId", messageId);
        message.put("senderId", senderId);
        message.put("senderName", senderName);
        message.put("messageType", messageType);
        message.put("content", content);
        message.put("sentAt", sentAt);
        message.put("readBy", List.of(senderId));
        message.put("deliveryStatus", "READ");
        
        if ("FILE".equals(messageType)) {
            message.put("fileInfo", Map.of(
                "fileName", "시설정보.pdf",
                "fileSize", 2048576,
                "downloadUrl", "/api/chat/files/" + messageId
            ));
        }
        
        return message;
    }

    /**
     * 채팅방 유형별 아이콘 반환
     */
    private String getChatRoomIcon(String roomType) {
        return switch (roomType) {
            case "COORDINATOR_CONSULTATION" -> "👨‍⚕️";
            case "FACILITY_INQUIRY" -> "🏥";
            case "HEALTH_CONSULTATION" -> "🩺";
            case "SUPPORT" -> "🛠️";
            case "GROUP_DISCUSSION" -> "👥";
            default -> "💬";
        };
    }
}