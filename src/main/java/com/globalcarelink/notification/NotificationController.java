package com.globalcarelink.notification;

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
 * 알림 시스템 컨트롤러
 * - 실시간 알림 관리
 * - 알림 설정 및 구독 관리
 * - 푸시 알림 발송
 * - 알림 통계 및 분석
 */
@Tag(name = "알림 시스템", description = "실시간 알림 및 메시지 관리 API")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    @Operation(
        summary = "내 알림 목록 조회",
        description = "현재 로그인한 사용자의 알림 목록을 조회합니다."
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getMyNotifications(
            @Parameter(description = "읽음 상태 필터 (READ, UNREAD, ALL)")
            @RequestParam(defaultValue = "ALL") String readStatus,
            @Parameter(description = "알림 유형 필터")
            @RequestParam(required = false) String notificationType,
            @Parameter(description = "페이지 번호")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "한 페이지 결과 수")
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        log.info("내 알림 목록 조회 - 사용자: {}, 상태: {}, 유형: {}", 
                authentication.getName(), readStatus, notificationType);

        // 사용자별 알림 목록 (임시 더미 데이터)
        List<Map<String, Object>> notifications = createUserNotifications(
            authentication.getName(), readStatus, notificationType);

        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> notificationPage = new PageImpl<>(notifications, pageable, notifications.size());

        log.info("내 알림 목록 조회 완료 - {}건", notifications.size());
        return ResponseEntity.ok(notificationPage);
    }

    @Operation(
        summary = "읽지 않은 알림 수 조회",
        description = "현재 사용자의 읽지 않은 알림 개수를 조회합니다."
    )
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getUnreadNotificationCount(Authentication authentication) {
        
        log.info("읽지 않은 알림 수 조회 - 사용자: {}", authentication.getName());

        Map<String, Object> countInfo = new HashMap<>();
        countInfo.put("unreadCount", 12);
        countInfo.put("totalCount", 67);
        countInfo.put("unreadByType", Map.of(
            "MATCHING", 3,
            "FACILITY_UPDATE", 2,
            "SYSTEM", 1,
            "CHAT", 6
        ));
        countInfo.put("lastUpdated", LocalDateTime.now());

        log.info("읽지 않은 알림 수: {}건", countInfo.get("unreadCount"));
        return ResponseEntity.ok(countInfo);
    }

    @Operation(
        summary = "알림 읽음 처리",
        description = "특정 알림을 읽음으로 표시합니다."
    )
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @Parameter(description = "알림 ID", required = true)
            @PathVariable Long notificationId,
            Authentication authentication) {
        
        log.info("알림 읽음 처리 - 알림ID: {}, 사용자: {}", notificationId, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("notificationId", notificationId);
        response.put("isRead", true);
        response.put("readAt", LocalDateTime.now());
        response.put("message", "알림이 읽음으로 표시되었습니다.");

        log.info("알림 읽음 처리 완료 - 알림ID: {}", notificationId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "모든 알림 읽음 처리",
        description = "현재 사용자의 모든 읽지 않은 알림을 읽음으로 표시합니다."
    )
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication authentication) {
        
        log.info("모든 알림 읽음 처리 - 사용자: {}", authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("markedCount", 12);
        response.put("readAt", LocalDateTime.now());
        response.put("message", "모든 알림이 읽음으로 표시되었습니다.");

        log.info("모든 알림 읽음 처리 완료 - {}건", response.get("markedCount"));
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "알림 삭제",
        description = "특정 알림을 삭제합니다."
    )
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            @Parameter(description = "알림 ID", required = true)
            @PathVariable Long notificationId,
            Authentication authentication) {
        
        log.info("알림 삭제 - 알림ID: {}, 사용자: {}", notificationId, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("notificationId", notificationId);
        response.put("deleted", true);
        response.put("deletedAt", LocalDateTime.now());
        response.put("message", "알림이 삭제되었습니다.");

        log.info("알림 삭제 완료 - 알림ID: {}", notificationId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "알림 설정 조회",
        description = "현재 사용자의 알림 설정을 조회합니다."
    )
    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getNotificationSettings(Authentication authentication) {
        
        log.info("알림 설정 조회 - 사용자: {}", authentication.getName());

        Map<String, Object> settings = new HashMap<>();
        settings.put("pushEnabled", true);
        settings.put("emailEnabled", true);
        settings.put("smsEnabled", false);
        
        Map<String, Object> typeSettings = new HashMap<>();
        typeSettings.put("MATCHING", Map.of("push", true, "email", true, "sms", false));
        typeSettings.put("FACILITY_UPDATE", Map.of("push", true, "email", false, "sms", false));
        typeSettings.put("SYSTEM", Map.of("push", true, "email", true, "sms", true));
        typeSettings.put("CHAT", Map.of("push", true, "email", false, "sms", false));
        settings.put("typeSettings", typeSettings);
        
        settings.put("quietHours", Map.of("enabled", true, "startTime", "22:00", "endTime", "08:00"));
        settings.put("language", "ko");
        settings.put("timezone", "Asia/Seoul");

        log.info("알림 설정 조회 완료 - 사용자: {}", authentication.getName());
        return ResponseEntity.ok(settings);
    }

    @Operation(
        summary = "알림 설정 업데이트",
        description = "현재 사용자의 알림 설정을 업데이트합니다."
    )
    @PutMapping("/settings")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateNotificationSettings(
            @Parameter(description = "알림 설정", required = true)
            @RequestBody Map<String, Object> settingsRequest,
            Authentication authentication) {
        
        log.info("알림 설정 업데이트 - 사용자: {}", authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("updated", true);
        response.put("updatedAt", LocalDateTime.now());
        response.put("message", "알림 설정이 업데이트되었습니다.");
        response.put("settings", settingsRequest);

        log.info("알림 설정 업데이트 완료 - 사용자: {}", authentication.getName());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "즉시 알림 발송",
        description = "특정 사용자에게 즉시 알림을 발송합니다. (관리자 전용)"
    )
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> sendNotification(
            @Parameter(description = "알림 발송 요청", required = true)
            @RequestBody Map<String, Object> notificationRequest,
            Authentication authentication) {
        
        log.info("즉시 알림 발송 - 발송자: {}, 수신자: {}", 
                authentication.getName(), notificationRequest.get("targetUserId"));

        Map<String, Object> response = new HashMap<>();
        response.put("notificationId", System.currentTimeMillis());
        response.put("sent", true);
        response.put("sentAt", LocalDateTime.now());
        response.put("targetUserId", notificationRequest.get("targetUserId"));
        response.put("notificationType", notificationRequest.get("type"));
        response.put("message", "알림이 성공적으로 발송되었습니다.");

        log.info("즉시 알림 발송 완료 - 알림ID: {}", response.get("notificationId"));
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "대량 알림 발송",
        description = "여러 사용자에게 일괄 알림을 발송합니다. (관리자 전용)"
    )
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> broadcastNotification(
            @Parameter(description = "대량 알림 발송 요청", required = true)
            @RequestBody Map<String, Object> broadcastRequest,
            Authentication authentication) {
        
        log.info("대량 알림 발송 - 발송자: {}, 대상: {}", 
                authentication.getName(), broadcastRequest.get("targetType"));

        Map<String, Object> response = new HashMap<>();
        response.put("broadcastId", System.currentTimeMillis());
        response.put("targetCount", 234);
        response.put("sentCount", 234);
        response.put("failedCount", 0);
        response.put("sentAt", LocalDateTime.now());
        response.put("message", "대량 알림이 성공적으로 발송되었습니다.");

        log.info("대량 알림 발송 완료 - 대상: {}명", response.get("sentCount"));
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "알림 통계",
        description = "사용자의 알림 수신 통계를 조회합니다."
    )
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'FACILITY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getNotificationStatistics(
            @Parameter(description = "통계 기간 (일)")
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        
        log.info("알림 통계 조회 - 사용자: {}, 기간: {}일", authentication.getName(), days);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("period", days + "일");
        statistics.put("totalReceived", 156);
        statistics.put("totalRead", 143);
        statistics.put("readRate", 91.7);
        
        Map<String, Object> byType = new HashMap<>();
        byType.put("MATCHING", Map.of("received", 45, "read", 43, "readRate", 95.6));
        byType.put("FACILITY_UPDATE", Map.of("received", 32, "read", 28, "readRate", 87.5));
        byType.put("SYSTEM", Map.of("received", 23, "read", 22, "readRate", 95.7));
        byType.put("CHAT", Map.of("received", 56, "read", 50, "readRate", 89.3));
        statistics.put("byType", byType);
        
        statistics.put("averageResponseTime", "2.3시간");
        statistics.put("mostActiveHour", 14);
        statistics.put("preferredChannel", "PUSH");

        log.info("알림 통계 조회 완료 - 총 {}건 수신", statistics.get("totalReceived"));
        return ResponseEntity.ok(statistics);
    }

    // ===== 내부 헬퍼 메서드들 =====

    /**
     * 사용자별 알림 목록 생성 (임시 더미 데이터)
     */
    private List<Map<String, Object>> createUserNotifications(
            String userName, String readStatus, String notificationType) {
        
        List<Map<String, Object>> allNotifications = List.of(
            createNotificationItem(1L, "MATCHING", "새로운 코디네이터 매칭", 
                "고객님께 적합한 코디네이터 3명이 매칭되었습니다.", false, LocalDateTime.now().minusHours(2)),
            createNotificationItem(2L, "FACILITY_UPDATE", "시설 정보 업데이트", 
                "서울중앙요양원의 가격 정보가 업데이트되었습니다.", true, LocalDateTime.now().minusHours(5)),
            createNotificationItem(3L, "CHAT", "새 메시지", 
                "김코디네이터님으로부터 새 메시지가 도착했습니다.", false, LocalDateTime.now().minusMinutes(30)),
            createNotificationItem(4L, "SYSTEM", "시스템 알림", 
                "건강 평가 결과가 완료되었습니다. 확인해 주세요.", true, LocalDateTime.now().minusDays(1)),
            createNotificationItem(5L, "MATCHING", "매칭 완료", 
                "부산실버케어센터 매칭이 성공적으로 완료되었습니다.", false, LocalDateTime.now().minusDays(2))
        );

        // 읽음 상태 및 유형 필터링
        return allNotifications.stream()
                .filter(notification -> {
                    if (!"ALL".equals(readStatus)) {
                        boolean isRead = (Boolean) notification.get("isRead");
                        if ("READ".equals(readStatus) && !isRead) return false;
                        if ("UNREAD".equals(readStatus) && isRead) return false;
                    }
                    
                    if (notificationType != null && 
                        !notificationType.equals(notification.get("type"))) {
                        return false;
                    }
                    
                    return true;
                })
                .toList();
    }

    /**
     * 개별 알림 아이템 생성
     */
    private Map<String, Object> createNotificationItem(
            Long id, String type, String title, String content, 
            boolean isRead, LocalDateTime createdAt) {
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("notificationId", id);
        notification.put("type", type);
        notification.put("title", title);
        notification.put("content", content);
        notification.put("isRead", isRead);
        notification.put("createdAt", createdAt);
        notification.put("readAt", isRead ? createdAt.plusMinutes(30) : null);
        notification.put("priority", type.equals("SYSTEM") ? "HIGH" : "NORMAL");
        notification.put("actionUrl", "/dashboard/notifications/" + id);
        notification.put("icon", getNotificationIcon(type));
        
        return notification;
    }

    /**
     * 알림 유형별 아이콘 반환
     */
    private String getNotificationIcon(String type) {
        return switch (type) {
            case "MATCHING" -> "👥";
            case "FACILITY_UPDATE" -> "🏥";
            case "CHAT" -> "💬";
            case "SYSTEM" -> "⚙️";
            default -> "📢";
        };
    }
}