package com.globalcarelink.common.troubleshooting;

import com.globalcarelink.common.event.ErrorEvent;
import com.globalcarelink.common.event.PerformanceEvent;
import com.globalcarelink.common.event.SecurityEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 자동화된 트러블슈팅 문서 생성 서비스
 * 시스템 이벤트를 수신하여 solutions-db.md에 자동으로 이슈 초안을 생성
 * Context7 지침에 따른 체계적 문제 해결 지원
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TroubleshootingService {

    private static final String SOLUTIONS_DB_PATH = "docs/troubleshooting/solutions-db.md";
    private static final String BACKUP_PATH = "docs/troubleshooting/backup/";
    
    // 중복 이벤트 방지를 위한 캐시 (최근 5분간 동일한 이벤트 ID 추적)
    private final ConcurrentHashMap<String, LocalDateTime> recentEvents = new ConcurrentHashMap<>();
    private final AtomicInteger totalEventsProcessed = new AtomicInteger(0);
    private final AtomicInteger documentsGenerated = new AtomicInteger(0);

    /**
     * 에러 이벤트 수신 및 자동 문서화
     */
    @EventListener
    @Async
    public void handleErrorEvent(ErrorEvent errorEvent) {
        log.info("ErrorEvent 수신: {} - {}", errorEvent.getEventId(), errorEvent.getErrorType());
        
        try {
            if (isDuplicateEvent(errorEvent.getEventId())) {
                log.debug("중복 이벤트 무시: {}", errorEvent.getEventId());
                return;
            }
            
            String markdownContent = generateErrorEventMarkdown(errorEvent);
            appendToSolutionsDb(markdownContent);
            
            totalEventsProcessed.incrementAndGet();
            documentsGenerated.incrementAndGet();
            
            log.info("에러 이벤트 문서화 완료: {} - {}", errorEvent.getEventId(), errorEvent.getErrorType());
            
        } catch (Exception e) {
            log.error("ErrorEvent 처리 실패: {}", errorEvent.getEventId(), e);
        }
    }

    /**
     * 성능 이벤트 수신 및 자동 문서화
     */
    @EventListener
    @Async
    public void handlePerformanceEvent(PerformanceEvent performanceEvent) {
        log.info("PerformanceEvent 수신: {} - {}ms", 
                performanceEvent.getEventId(), performanceEvent.getExecutionTimeMs());
        
        try {
            if (isDuplicateEvent(performanceEvent.getEventId())) {
                log.debug("중복 이벤트 무시: {}", performanceEvent.getEventId());
                return;
            }
            
            // CRITICAL이나 HIGH 심각도 성능 이슈만 문서화
            if ("CRITICAL".equals(performanceEvent.getSeverity()) || 
                "HIGH".equals(performanceEvent.getSeverity())) {
                
                String markdownContent = generatePerformanceEventMarkdown(performanceEvent);
                appendToSolutionsDb(markdownContent);
                
                totalEventsProcessed.incrementAndGet();
                documentsGenerated.incrementAndGet();
                
                log.info("성능 이벤트 문서화 완료: {} - {}ms", 
                        performanceEvent.getEventId(), performanceEvent.getExecutionTimeMs());
            } else {
                totalEventsProcessed.incrementAndGet();
                log.debug("성능 이벤트 심각도 낮음, 문서화 생략: {} - {}", 
                         performanceEvent.getEventId(), performanceEvent.getSeverity());
            }
            
        } catch (Exception e) {
            log.error("PerformanceEvent 처리 실패: {}", performanceEvent.getEventId(), e);
        }
    }

    /**
     * 보안 이벤트 수신 및 자동 문서화
     */
    @EventListener
    @Async
    public void handleSecurityEvent(SecurityEvent securityEvent) {
        log.warn("SecurityEvent 수신: {} - {} (위험도: {}점)", 
                securityEvent.getEventId(), securityEvent.getSecurityEventType(), 
                securityEvent.calculateRiskScore());
        
        try {
            if (isDuplicateEvent(securityEvent.getEventId())) {
                log.debug("중복 이벤트 무시: {}", securityEvent.getEventId());
                return;
            }
            
            String markdownContent = generateSecurityEventMarkdown(securityEvent);
            appendToSolutionsDb(markdownContent);
            
            totalEventsProcessed.incrementAndGet();
            documentsGenerated.incrementAndGet();
            
            log.warn("보안 이벤트 문서화 완료: {} - {} (위험도: {}점)", 
                    securityEvent.getEventId(), securityEvent.getSecurityEventType(), 
                    securityEvent.calculateRiskScore());
            
        } catch (Exception e) {
            log.error("SecurityEvent 처리 실패: {}", securityEvent.getEventId(), e);
        }
    }

    /**
     * 에러 이벤트용 마크다운 생성
     */
    private String generateErrorEventMarkdown(ErrorEvent errorEvent) {
        StringBuilder md = new StringBuilder();
        
        md.append("\n").append("=".repeat(80)).append("\n");
        md.append("## 🚨 자동 감지된 에러 이슈 #").append(errorEvent.getEventId()).append("\n\n");
        
        // 메타데이터
        md.append("**생성 시간**: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        md.append("**이벤트 ID**: `").append(errorEvent.getEventId()).append("`\n");
        md.append("**추적 ID**: `").append(errorEvent.getTraceId()).append("`\n");
        md.append("**심각도**: ").append(errorEvent.getSeverity()).append(" (").append(errorEvent.getErrorCategory()).append(")\n");
        md.append("**자동 생성**: Elderberry-Intellect 시스템\n\n");
        
        // 에러 정보
        md.append("### 🔍 에러 상세 정보\n");
        md.append("- **에러 타입**: `").append(errorEvent.getErrorType()).append("`\n");
        md.append("- **에러 메시지**: ").append(errorEvent.getErrorMessage()).append("\n");
        md.append("- **발생 위치**: `").append(errorEvent.getClassName()).append(".").append(errorEvent.getMethodName()).append("`\n");
        
        if (errorEvent.getRequestUri() != null) {
            md.append("- **요청 URL**: `").append(errorEvent.getHttpMethod()).append(" ").append(errorEvent.getRequestUri()).append("`\n");
        }
        
        if (errorEvent.getUserEmail() != null) {
            md.append("- **발생 사용자**: ").append(errorEvent.getUserEmail()).append("\n");
        }
        
        md.append("- **클라이언트 IP**: ").append(errorEvent.getClientIp()).append("\n\n");
        
        // 스택 트레이스 (요약본)
        if (errorEvent.getStackTrace() != null && !errorEvent.getStackTrace().isEmpty()) {
            md.append("### 📋 스택 트레이스 (핵심 부분)\n");
            md.append("```\n").append(errorEvent.getStackTrace()).append("\n```\n\n");
        }
        
        // 요청 파라미터
        if (errorEvent.getRequestParameters() != null && !errorEvent.getRequestParameters().isEmpty()) {
            md.append("### 📝 요청 파라미터\n");
            errorEvent.getRequestParameters().forEach((key, value) -> 
                md.append("- **").append(key).append("**: ").append(value).append("\n")
            );
            md.append("\n");
        }
        
        // 자동 분석 및 제안
        md.append("### 🤖 자동 분석 결과\n");
        md.append(generateErrorAnalysis(errorEvent));
        
        // 해결 방안 템플릿
        md.append("### ✅ 해결 방안 (개발자 작성 필요)\n");
        md.append("<!-- 🔧 아래 항목들을 개발자가 직접 작성해주세요 -->\n\n");
        md.append("#### 1. 즉시 조치사항\n");
        md.append("- [ ] **근본 원인 분석**: \n");
        md.append("- [ ] **임시 해결책**: \n");
        md.append("- [ ] **영향 범위 확인**: \n\n");
        
        md.append("#### 2. 근본적 해결방안\n");
        md.append("- [ ] **코드 수정**: \n");
        md.append("- [ ] **테스트 추가**: \n");
        md.append("- [ ] **문서 업데이트**: \n\n");
        
        md.append("#### 3. 재발 방지책\n");
        md.append("- [ ] **예방 조치**: \n");
        md.append("- [ ] **모니터링 강화**: \n");
        md.append("- [ ] **팀 공유**: \n\n");
        
        // AI 학습용 태그
        md.append("### 🏷️ AI 학습 태그\n");
        String[] keywords = errorEvent.toAILearningData().get("errorKeywords") != null ? 
                           (String[]) errorEvent.toAILearningData().get("errorKeywords") : new String[0];
        for (String keyword : keywords) {
            md.append("`").append(keyword).append("` ");
        }
        md.append("\n\n");
        
        md.append("---\n");
        md.append("*📅 자동 생성됨: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        md.append(" | 🤖 Elderberry-Intellect v2.0*\n\n");
        
        return md.toString();
    }

    /**
     * 성능 이벤트용 마크다운 생성
     */
    private String generatePerformanceEventMarkdown(PerformanceEvent performanceEvent) {
        StringBuilder md = new StringBuilder();
        
        md.append("\n").append("=".repeat(80)).append("\n");
        md.append("## ⚡ 자동 감지된 성능 이슈 #").append(performanceEvent.getEventId()).append("\n\n");
        
        // 메타데이터
        md.append("**생성 시간**: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        md.append("**이벤트 ID**: `").append(performanceEvent.getEventId()).append("`\n");
        md.append("**추적 ID**: `").append(performanceEvent.getTraceId()).append("`\n");
        md.append("**심각도**: ").append(performanceEvent.getSeverity()).append(" (").append(performanceEvent.getPerformanceCategory()).append(")\n");
        md.append("**자동 생성**: Elderberry-Intellect 시스템\n\n");
        
        // 성능 정보
        md.append("### 📊 성능 상세 정보\n");
        md.append("- **작업 유형**: ").append(performanceEvent.getOperationType()).append("\n");
        md.append("- **실행 위치**: `").append(performanceEvent.getClassName()).append(".").append(performanceEvent.getMethodName()).append("`\n");
        md.append("- **실행 시간**: ").append(performanceEvent.getExecutionTimeMs()).append("ms");
        if (performanceEvent.getThresholdMs() != null) {
            double ratio = (double) performanceEvent.getExecutionTimeMs() / performanceEvent.getThresholdMs();
            md.append(" (임계값: ").append(performanceEvent.getThresholdMs()).append("ms, ").append(String.format("%.1f", ratio)).append("배 초과)");
        }
        md.append("\n");
        
        if (performanceEvent.getRequestUri() != null) {
            md.append("- **요청 URL**: `").append(performanceEvent.getHttpMethod()).append(" ").append(performanceEvent.getRequestUri()).append("`\n");
        }
        
        if (performanceEvent.getUserEmail() != null) {
            md.append("- **사용자**: ").append(performanceEvent.getUserEmail()).append("\n");
        }
        md.append("\n");
        
        // 성능 메트릭
        if (performanceEvent.getPerformanceMetrics() != null && !performanceEvent.getPerformanceMetrics().isEmpty()) {
            md.append("### 📈 상세 메트릭\n");
            performanceEvent.getPerformanceMetrics().forEach((key, value) -> 
                md.append("- **").append(key).append("**: ").append(value).append("\n")
            );
            md.append("\n");
        }
        
        // 자동 최적화 제안 (PerformanceEvent에서 생성된 제안 사용)
        md.append(performanceEvent.toMarkdownFormat().substring(
            performanceEvent.toMarkdownFormat().indexOf("### 💡 자동 최적화 제안")
        ));
        
        return md.toString();
    }

    /**
     * 보안 이벤트용 마크다운 생성
     */
    private String generateSecurityEventMarkdown(SecurityEvent securityEvent) {
        StringBuilder md = new StringBuilder();
        
        md.append("\n").append("=".repeat(80)).append("\n");
        md.append("## 🔒 자동 감지된 보안 이슈 #").append(securityEvent.getEventId()).append("\n\n");
        
        // 메타데이터  
        md.append("**생성 시간**: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        md.append("**이벤트 ID**: `").append(securityEvent.getEventId()).append("`\n");
        md.append("**추적 ID**: `").append(securityEvent.getTraceId()).append("`\n");
        md.append("**심각도**: ").append(securityEvent.getSeverity()).append(" (").append(securityEvent.getSecurityEventType()).append(")\n");
        md.append("**위험도 점수**: ").append(securityEvent.calculateRiskScore()).append("/100\n");
        md.append("**자동 생성**: Elderberry-Intellect 시스템\n\n");
        
        // 보안 이벤트 전체 마크다운 활용
        md.append(securityEvent.toMarkdownFormat());
        
        return md.toString();
    }

    /**
     * 에러 분석 및 제안 생성
     */
    private String generateErrorAnalysis(ErrorEvent errorEvent) {
        StringBuilder analysis = new StringBuilder();
        
        // 에러 타입별 분석
        String errorType = errorEvent.getErrorType().toLowerCase();
        String errorMessage = errorEvent.getErrorMessage() != null ? 
                              errorEvent.getErrorMessage().toLowerCase() : "";
        
        if (errorType.contains("nullpointer")) {
            analysis.append("- **분석**: NPE(NullPointerException) 발생으로 null 값 접근 시도\n");
            analysis.append("- **일반적 원인**: 초기화되지 않은 객체, Optional 미사용, null 체크 누락\n");
            analysis.append("- **권장 해결**: null 체크 추가, Optional 사용, @Nullable/@NonNull 어노테이션 활용\n\n");
        } else if (errorType.contains("validation") || errorMessage.contains("validation")) {
            analysis.append("- **분석**: 입력값 유효성 검증 실패\n");
            analysis.append("- **일반적 원인**: @Valid 어노테이션 누락, 잘못된 입력 데이터, 제약 조건 위반\n");
            analysis.append("- **권장 해결**: DTO 유효성 검증 강화, 프론트엔드 입력 검증 추가\n\n");
        } else if (errorType.contains("dataintegrity") || errorMessage.contains("constraint")) {
            analysis.append("- **분석**: 데이터베이스 제약 조건 위반\n");
            analysis.append("- **일반적 원인**: 중복 키, 외래키 위반, NOT NULL 제약 위반\n");
            analysis.append("- **권장 해결**: 데이터 정합성 체크, 트랜잭션 처리 개선\n\n");
        } else if (errorType.contains("security") || errorType.contains("authentication")) {
            analysis.append("- **분석**: 보안 관련 에러 (인증/인가 실패)\n");
            analysis.append("- **일반적 원인**: 잘못된 자격증명, 권한 부족, 토큰 만료\n");
            analysis.append("- **권장 해결**: 인증 로직 재검토, 권한 설정 확인, 보안 감사 실시\n\n");
        } else {
            analysis.append("- **분석**: ").append(errorEvent.getErrorType()).append(" 에러 발생\n");
            analysis.append("- **추가 분석 필요**: 에러 메시지와 스택 트레이스를 통한 상세 원인 분석 권장\n\n");
        }
        
        // 발생 빈도 기반 추가 정보
        analysis.append("- **발생 컨텍스트**: ").append(errorEvent.getErrorCategory()).append(" 카테고리\n");
        analysis.append("- **모니터링 권장**: 유사한 에러의 재발 패턴 추적 필요\n\n");
        
        return analysis.toString();
    }

    /**
     * solutions-db.md 파일에 내용 추가
     */
    private void appendToSolutionsDb(String content) throws IOException {
        Path solutionsPath = Paths.get(SOLUTIONS_DB_PATH);
        
        // 디렉토리가 없으면 생성
        Files.createDirectories(solutionsPath.getParent());
        
        // 파일이 없으면 헤더와 함께 생성
        if (!Files.exists(solutionsPath)) {
            String header = createSolutionsDbHeader();
            Files.writeString(solutionsPath, header, StandardOpenOption.CREATE);
        }
        
        // 내용 추가
        Files.writeString(solutionsPath, content, StandardOpenOption.APPEND);
        
        // 백업 생성 (선택적)
        createBackupIfNeeded(solutionsPath);
        
        log.debug("solutions-db.md 업데이트 완료");
    }

    /**
     * solutions-db.md 헤더 생성
     */
    private String createSolutionsDbHeader() {
        StringBuilder header = new StringBuilder();
        header.append("# 🔧 Elderberry 트러블슈팅 솔루션 데이터베이스\n\n");
        header.append("**자동 생성 문서** - Elderberry-Intellect 시스템이 실시간으로 감지한 이슈들을 자동으로 문서화합니다.\n\n");
        header.append("## 📋 사용 가이드\n\n");
        header.append("- 🤖 **자동 생성 항목**: AI가 시스템 이벤트를 기반으로 초안을 생성합니다\n");
        header.append("- ✏️ **개발자 작성 필요**: '해결 방안' 섹션을 개발자가 직접 완성해주세요\n");
        header.append("- 🏷️ **AI 학습 태그**: 유사한 문제 발생 시 AI가 더 나은 제안을 할 수 있도록 도움을 줍니다\n");
        header.append("- 📊 **통계**: 총 처리된 이벤트 수: 0개, 생성된 문서 수: 0개\n\n");
        header.append("---\n\n");
        return header.toString();
    }

    /**
     * 백업 파일 생성 (파일 크기가 1MB 이상일 때)
     */
    private void createBackupIfNeeded(Path solutionsPath) {
        try {
            if (Files.size(solutionsPath) > 1024 * 1024) { // 1MB 이상
                Path backupDir = Paths.get(BACKUP_PATH);
                Files.createDirectories(backupDir);
                
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                Path backupFile = backupDir.resolve("solutions-db_" + timestamp + ".md");
                Files.copy(solutionsPath, backupFile);
                
                log.info("solutions-db.md 백업 생성: {}", backupFile);
            }
        } catch (IOException e) {
            log.warn("백업 생성 실패", e);
        }
    }

    /**
     * 중복 이벤트 체크 (5분 이내 동일 ID)
     */
    private boolean isDuplicateEvent(String eventId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastSeen = recentEvents.get(eventId);
        
        if (lastSeen != null && lastSeen.isAfter(now.minusMinutes(5))) {
            return true;
        }
        
        recentEvents.put(eventId, now);
        
        // 캐시 정리 (10분 이상 된 항목 제거)
        recentEvents.entrySet().removeIf(entry -> 
            entry.getValue().isBefore(now.minusMinutes(10))
        );
        
        return false;
    }

    /**
     * 서비스 상태 조회
     */
    public TroubleshootingServiceStatus getStatus() {
        return TroubleshootingServiceStatus.builder()
                .totalEventsProcessed(totalEventsProcessed.get())
                .documentsGenerated(documentsGenerated.get())
                .recentEventsInCache(recentEvents.size())
                .solutionsDbPath(SOLUTIONS_DB_PATH)
                .lastUpdate(LocalDateTime.now())
                .build();
    }

    /**
     * 서비스 상태 DTO
     */
    public static class TroubleshootingServiceStatus {
        public final int totalEventsProcessed;
        public final int documentsGenerated;
        public final int recentEventsInCache;
        public final String solutionsDbPath;
        public final LocalDateTime lastUpdate;
        
        private TroubleshootingServiceStatus(Builder builder) {
            this.totalEventsProcessed = builder.totalEventsProcessed;
            this.documentsGenerated = builder.documentsGenerated;
            this.recentEventsInCache = builder.recentEventsInCache;
            this.solutionsDbPath = builder.solutionsDbPath;
            this.lastUpdate = builder.lastUpdate;
        }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private int totalEventsProcessed;
            private int documentsGenerated;
            private int recentEventsInCache;
            private String solutionsDbPath;
            private LocalDateTime lastUpdate;
            
            public Builder totalEventsProcessed(int totalEventsProcessed) {
                this.totalEventsProcessed = totalEventsProcessed;
                return this;
            }
            
            public Builder documentsGenerated(int documentsGenerated) {
                this.documentsGenerated = documentsGenerated;
                return this;
            }
            
            public Builder recentEventsInCache(int recentEventsInCache) {
                this.recentEventsInCache = recentEventsInCache;
                return this;
            }
            
            public Builder solutionsDbPath(String solutionsDbPath) {
                this.solutionsDbPath = solutionsDbPath;
                return this;
            }
            
            public Builder lastUpdate(LocalDateTime lastUpdate) {
                this.lastUpdate = lastUpdate;
                return this;
            }
            
            public TroubleshootingServiceStatus build() {
                return new TroubleshootingServiceStatus(this);
            }
        }
    }
}