package com.globalcarelink.agents.services.workflow;

import com.globalcarelink.agents.BaseAgent;
import com.globalcarelink.agents.events.AgentEvent;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 동적 체크리스트 서비스 (JavaScript에서 포팅)
 * - 작업별 맞춤 체크리스트 생성
 * - 진행 상황 추적
 * - 우선순위 기반 정렬
 */
@Slf4j
@Service
public class DynamicChecklistService extends BaseAgent {
    
    private final Map<String, ChecklistTemplate> templates = new HashMap<>();
    private final Map<String, ActiveChecklist> activeChecklists = new HashMap<>();
    
    public DynamicChecklistService() {
        super("DYNAMIC_CHECKLIST", "동적 체크리스트 서비스");
        initializeTemplates();
    }
    
    @Override
    protected void doInitialize() {
        log.info("동적 체크리스트 서비스 초기화");
    }
    
    @Override
    protected void doShutdown() {
        log.info("동적 체크리스트 서비스 종료");
        activeChecklists.clear();
    }
    
    @Override
    public void processEvent(AgentEvent event) {
        switch (event.getType()) {
            case "CREATE_CHECKLIST" -> createChecklist(event);
            case "UPDATE_CHECKLIST_ITEM" -> updateChecklistItem(event);
            case "GET_CHECKLIST_STATUS" -> getChecklistStatus(event);
            case "COMPLETE_CHECKLIST" -> completeChecklist(event);
            default -> log.debug("처리하지 않는 이벤트 타입: {}", event.getType());
        }
    }
    
    /**
     * 체크리스트 템플릿 초기화
     */
    private void initializeTemplates() {
        // 트러블슈팅 체크리스트 템플릿
        templates.put("TROUBLESHOOTING", ChecklistTemplate.builder()
            .id("TROUBLESHOOTING")
            .name("트러블슈팅 체크리스트")
            .items(Arrays.asList(
                createTemplateItem("환경 설정", "Java 환경 변수 (JAVA_HOME) 확인", Priority.CRITICAL),
                createTemplateItem("환경 설정", "Gradle Wrapper 실행 권한 확인", Priority.HIGH),
                createTemplateItem("빌드 시스템", "의존성 버전 충돌 확인", Priority.HIGH),
                createTemplateItem("빌드 시스템", "빌드 캐시 정리", Priority.MEDIUM),
                createTemplateItem("의존성", "Repository 메서드 시그니처 수정", Priority.CRITICAL),
                createTemplateItem("의존성", "누락된 의존성 추가", Priority.HIGH),
                createTemplateItem("테스트", "단위 테스트 실행 확인", Priority.MEDIUM),
                createTemplateItem("테스트", "통합 테스트 환경 설정", Priority.MEDIUM),
                createTemplateItem("문서화", "문제 해결 과정 문서화", Priority.LOW),
                createTemplateItem("문서화", "API 문서 업데이트", Priority.LOW)
            ))
            .estimatedTime("2-4 시간")
            .build());
        
        // 개발 워크플로 체크리스트 템플릿
        templates.put("DEV_WORKFLOW", ChecklistTemplate.builder()
            .id("DEV_WORKFLOW")
            .name("개발 워크플로 체크리스트")
            .items(Arrays.asList(
                createTemplateItem("준비", "브랜치 생성", Priority.HIGH),
                createTemplateItem("준비", "최신 코드 pull", Priority.HIGH),
                createTemplateItem("개발", "기능 구현", Priority.CRITICAL),
                createTemplateItem("개발", "단위 테스트 작성", Priority.HIGH),
                createTemplateItem("품질", "코드 리뷰 요청", Priority.HIGH),
                createTemplateItem("품질", "정적 분석 통과", Priority.MEDIUM),
                createTemplateItem("통합", "통합 테스트 실행", Priority.HIGH),
                createTemplateItem("통합", "문서 업데이트", Priority.MEDIUM),
                createTemplateItem("배포", "PR 생성", Priority.HIGH),
                createTemplateItem("배포", "배포 확인", Priority.CRITICAL)
            ))
            .estimatedTime("1-2 일")
            .build());
        
        // 보안 검토 체크리스트 템플릿
        templates.put("SECURITY_REVIEW", ChecklistTemplate.builder()
            .id("SECURITY_REVIEW")
            .name("보안 검토 체크리스트")
            .items(Arrays.asList(
                createTemplateItem("코드 검토", "입력 검증 확인", Priority.CRITICAL),
                createTemplateItem("코드 검토", "SQL 인젝션 위험 검사", Priority.CRITICAL),
                createTemplateItem("코드 검토", "XSS 방어 확인", Priority.CRITICAL),
                createTemplateItem("인증/인가", "인증 메커니즘 검토", Priority.HIGH),
                createTemplateItem("인증/인가", "권한 체크 검증", Priority.HIGH),
                createTemplateItem("데이터", "민감 데이터 암호화", Priority.CRITICAL),
                createTemplateItem("데이터", "로깅 정책 확인", Priority.MEDIUM),
                createTemplateItem("의존성", "보안 취약점 스캔", Priority.HIGH),
                createTemplateItem("의존성", "라이브러리 업데이트", Priority.MEDIUM),
                createTemplateItem("문서화", "보안 정책 문서화", Priority.LOW)
            ))
            .estimatedTime("4-6 시간")
            .build());
        
        // 마이그레이션 체크리스트 템플릿
        templates.put("MIGRATION", ChecklistTemplate.builder()
            .id("MIGRATION")
            .name("시스템 마이그레이션 체크리스트")
            .items(Arrays.asList(
                createTemplateItem("분석", "현재 시스템 분석", Priority.HIGH),
                createTemplateItem("분석", "마이그레이션 범위 정의", Priority.HIGH),
                createTemplateItem("계획", "마이그레이션 계획 수립", Priority.CRITICAL),
                createTemplateItem("계획", "롤백 계획 준비", Priority.HIGH),
                createTemplateItem("준비", "데이터 백업", Priority.CRITICAL),
                createTemplateItem("준비", "테스트 환경 구축", Priority.HIGH),
                createTemplateItem("실행", "데이터 마이그레이션", Priority.CRITICAL),
                createTemplateItem("실행", "시스템 전환", Priority.CRITICAL),
                createTemplateItem("검증", "기능 테스트", Priority.HIGH),
                createTemplateItem("검증", "성능 테스트", Priority.MEDIUM),
                createTemplateItem("완료", "문서 업데이트", Priority.MEDIUM),
                createTemplateItem("완료", "팀 교육", Priority.LOW)
            ))
            .estimatedTime("1-2 주")
            .build());
    }
    
    /**
     * 체크리스트 생성
     */
    private void createChecklist(AgentEvent event) {
        String taskType = (String) event.getData().get("taskType");
        String checklistId = UUID.randomUUID().toString();
        
        ChecklistTemplate template = templates.get(taskType);
        if (template == null) {
            // 기본 템플릿 사용
            template = createDefaultTemplate(taskType);
        }
        
        // 템플릿을 기반으로 활성 체크리스트 생성
        List<ChecklistItem> items = template.getItems().stream()
            .map(item -> ChecklistItem.builder()
                .id(UUID.randomUUID().toString())
                .category(item.getCategory())
                .description(item.getDescription())
                .status(ItemStatus.PENDING)
                .priority(item.getPriority())
                .createdAt(LocalDateTime.now())
                .build())
            .collect(Collectors.toList());
        
        // 컨텍스트 기반 추가 항목
        addContextualItems(items, event.getData());
        
        // 우선순위로 정렬
        items.sort((a, b) -> b.getPriority().ordinal() - a.getPriority().ordinal());
        
        ActiveChecklist checklist = ActiveChecklist.builder()
            .id(checklistId)
            .taskType(taskType)
            .name(template.getName())
            .items(items)
            .estimatedTime(template.getEstimatedTime())
            .createdAt(LocalDateTime.now())
            .status(ChecklistStatus.ACTIVE)
            .build();
        
        activeChecklists.put(checklistId, checklist);
        
        // 생성 결과 발행
        Map<String, Object> result = Map.of(
            "checklistId", checklistId,
            "checklist", checklist,
            "totalItems", items.size(),
            "criticalItems", items.stream().filter(i -> i.getPriority() == Priority.CRITICAL).count()
        );
        
        publishEvent(AgentEvent.builder()
            .type("CHECKLIST_CREATED")
            .sourceAgentId(getAgentId())
            .sourceAgentType(getAgentType())
            .targetAgentId(event.getSourceAgentId())
            .data(result)
            .timestamp(LocalDateTime.now())
            .build());
    }
    
    /**
     * 체크리스트 항목 업데이트
     */
    private void updateChecklistItem(AgentEvent event) {
        String checklistId = (String) event.getData().get("checklistId");
        String itemId = (String) event.getData().get("itemId");
        String newStatus = (String) event.getData().get("status");
        String notes = (String) event.getData().get("notes");
        
        ActiveChecklist checklist = activeChecklists.get(checklistId);
        if (checklist == null) {
            log.warn("체크리스트를 찾을 수 없습니다: {}", checklistId);
            return;
        }
        
        checklist.getItems().stream()
            .filter(item -> item.getId().equals(itemId))
            .findFirst()
            .ifPresent(item -> {
                item.setStatus(ItemStatus.valueOf(newStatus));
                item.setCompletedAt(ItemStatus.COMPLETED.name().equals(newStatus) ? 
                    LocalDateTime.now() : null);
                if (notes != null) {
                    item.setNotes(notes);
                }
            });
        
        // 전체 진행률 계산
        double progress = calculateProgress(checklist);
        checklist.setProgress(progress);
        
        // 모든 항목 완료 확인
        if (progress >= 100.0) {
            checklist.setStatus(ChecklistStatus.COMPLETED);
            checklist.setCompletedAt(LocalDateTime.now());
        }
        
        // 업데이트 결과 발행
        publishEvent(AgentEvent.builder()
            .type("CHECKLIST_UPDATED")
            .sourceAgentId(getAgentId())
            .sourceAgentType(getAgentType())
            .targetAgentId(event.getSourceAgentId())
            .data(Map.of(
                "checklistId", checklistId,
                "itemId", itemId,
                "newStatus", newStatus,
                "progress", progress,
                "checklistStatus", checklist.getStatus()
            ))
            .timestamp(LocalDateTime.now())
            .build());
    }
    
    /**
     * 체크리스트 상태 조회
     */
    private void getChecklistStatus(AgentEvent event) {
        String checklistId = (String) event.getData().get("checklistId");
        
        ActiveChecklist checklist = activeChecklists.get(checklistId);
        if (checklist == null) {
            // 모든 활성 체크리스트 반환
            publishEvent(AgentEvent.builder()
                .type("ALL_CHECKLISTS_STATUS")
                .sourceAgentId(getAgentId())
                .sourceAgentType(getAgentType())
                .targetAgentId(event.getSourceAgentId())
                .data(Map.of(
                    "activeChecklists", activeChecklists.values(),
                    "totalActive", activeChecklists.size()
                ))
                .timestamp(LocalDateTime.now())
                .build());
        } else {
            // 특정 체크리스트 상태 반환
            publishEvent(AgentEvent.builder()
                .type("CHECKLIST_STATUS")
                .sourceAgentId(getAgentId())
                .sourceAgentType(getAgentType())
                .targetAgentId(event.getSourceAgentId())
                .data(Map.of(
                    "checklist", checklist,
                    "progress", calculateProgress(checklist),
                    "pendingItems", getPendingItems(checklist),
                    "completedItems", getCompletedItems(checklist)
                ))
                .timestamp(LocalDateTime.now())
                .build());
        }
    }
    
    /**
     * 체크리스트 완료
     */
    private void completeChecklist(AgentEvent event) {
        String checklistId = (String) event.getData().get("checklistId");
        
        ActiveChecklist checklist = activeChecklists.get(checklistId);
        if (checklist != null) {
            checklist.setStatus(ChecklistStatus.COMPLETED);
            checklist.setCompletedAt(LocalDateTime.now());
            
            // 완료 통계 생성
            Map<String, Object> statistics = generateCompletionStatistics(checklist);
            
            publishEvent(AgentEvent.builder()
                .type("CHECKLIST_COMPLETED")
                .sourceAgentId(getAgentId())
                .sourceAgentType(getAgentType())
                .targetAgentId(event.getSourceAgentId())
                .data(Map.of(
                    "checklistId", checklistId,
                    "completionTime", checklist.getCompletedAt(),
                    "statistics", statistics
                ))
                .timestamp(LocalDateTime.now())
                .build());
        }
    }
    
    /**
     * 컨텍스트 기반 항목 추가
     */
    private void addContextualItems(List<ChecklistItem> items, Map<String, Object> context) {
        // Java 환경 문제가 있는 경우
        if (context.containsKey("javaIssue") && (Boolean) context.get("javaIssue")) {
            items.add(ChecklistItem.builder()
                .id(UUID.randomUUID().toString())
                .category("환경 설정")
                .description("WSL Java 환경 변수 설정 확인")
                .status(ItemStatus.PENDING)
                .priority(Priority.CRITICAL)
                .createdAt(LocalDateTime.now())
                .build());
        }
        
        // 컴파일 오류가 있는 경우
        if (context.containsKey("compileErrors") && (Integer) context.get("compileErrors") > 0) {
            items.add(ChecklistItem.builder()
                .id(UUID.randomUUID().toString())
                .category("빌드 시스템")
                .description("컴파일 오류 " + context.get("compileErrors") + "개 해결")
                .status(ItemStatus.PENDING)
                .priority(Priority.CRITICAL)
                .createdAt(LocalDateTime.now())
                .build());
        }
    }
    
    /**
     * 기본 템플릿 생성
     */
    private ChecklistTemplate createDefaultTemplate(String taskType) {
        return ChecklistTemplate.builder()
            .id(taskType)
            .name(taskType + " 체크리스트")
            .items(Arrays.asList(
                createTemplateItem("준비", "작업 범위 정의", Priority.HIGH),
                createTemplateItem("실행", "주요 작업 수행", Priority.CRITICAL),
                createTemplateItem("검증", "결과 확인", Priority.HIGH),
                createTemplateItem("완료", "문서화", Priority.MEDIUM)
            ))
            .estimatedTime("미정")
            .build();
    }
    
    /**
     * 템플릿 항목 생성
     */
    private TemplateItem createTemplateItem(String category, String description, Priority priority) {
        return TemplateItem.builder()
            .category(category)
            .description(description)
            .priority(priority)
            .build();
    }
    
    /**
     * 진행률 계산
     */
    private double calculateProgress(ActiveChecklist checklist) {
        if (checklist.getItems().isEmpty()) return 0.0;
        
        long completedCount = checklist.getItems().stream()
            .filter(item -> item.getStatus() == ItemStatus.COMPLETED)
            .count();
        
        return (double) completedCount / checklist.getItems().size() * 100;
    }
    
    /**
     * 대기 중인 항목 조회
     */
    private List<ChecklistItem> getPendingItems(ActiveChecklist checklist) {
        return checklist.getItems().stream()
            .filter(item -> item.getStatus() == ItemStatus.PENDING)
            .collect(Collectors.toList());
    }
    
    /**
     * 완료된 항목 조회
     */
    private List<ChecklistItem> getCompletedItems(ActiveChecklist checklist) {
        return checklist.getItems().stream()
            .filter(item -> item.getStatus() == ItemStatus.COMPLETED)
            .collect(Collectors.toList());
    }
    
    /**
     * 완료 통계 생성
     */
    private Map<String, Object> generateCompletionStatistics(ActiveChecklist checklist) {
        long totalItems = checklist.getItems().size();
        long completedItems = getCompletedItems(checklist).size();
        long skippedItems = checklist.getItems().stream()
            .filter(item -> item.getStatus() == ItemStatus.SKIPPED)
            .count();
        
        // 카테고리별 통계
        Map<String, Long> categoryStats = checklist.getItems().stream()
            .filter(item -> item.getStatus() == ItemStatus.COMPLETED)
            .collect(Collectors.groupingBy(ChecklistItem::getCategory, Collectors.counting()));
        
        // 소요 시간 계산
        long durationMinutes = 0;
        if (checklist.getCompletedAt() != null) {
            durationMinutes = java.time.Duration.between(
                checklist.getCreatedAt(), 
                checklist.getCompletedAt()
            ).toMinutes();
        }
        
        return Map.of(
            "totalItems", totalItems,
            "completedItems", completedItems,
            "skippedItems", skippedItems,
            "completionRate", completedItems * 100.0 / totalItems,
            "categoryStats", categoryStats,
            "durationMinutes", durationMinutes,
            "estimatedTime", checklist.getEstimatedTime()
        );
    }
    
    // Data classes
    
    @Data
    @Builder
    public static class ChecklistTemplate {
        private String id;
        private String name;
        private List<TemplateItem> items;
        private String estimatedTime;
    }
    
    @Data
    @Builder
    public static class TemplateItem {
        private String category;
        private String description;
        private Priority priority;
    }
    
    @Data
    @Builder
    public static class ActiveChecklist {
        private String id;
        private String taskType;
        private String name;
        private List<ChecklistItem> items;
        private String estimatedTime;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
        private ChecklistStatus status;
        private double progress;
    }
    
    @Data
    @Builder
    public static class ChecklistItem {
        private String id;
        private String category;
        private String description;
        private ItemStatus status;
        private Priority priority;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
        private String notes;
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    public enum ItemStatus {
        PENDING, IN_PROGRESS, COMPLETED, SKIPPED, BLOCKED
    }
    
    public enum ChecklistStatus {
        ACTIVE, COMPLETED, CANCELLED
    }
}