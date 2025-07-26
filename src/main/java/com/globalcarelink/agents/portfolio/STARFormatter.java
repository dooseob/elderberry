package com.globalcarelink.agents.portfolio;

import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * STAR 방법론 기반 포트폴리오 문서 포맷터
 * Situation, Task, Action, Result를 체계적으로 문서화
 */
@Component
public class STARFormatter {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    
    /**
     * 포트폴리오용 마크다운 문서 생성
     */
    public String formatToPortfolio(PortfolioStory story) {
        StringBuilder markdown = new StringBuilder();
        
        // 헤더
        markdown.append("# ").append(story.getTitle()).append("\n\n");
        
        // 메타데이터
        appendMetadata(markdown, story);
        
        // STAR 방법론 구성
        appendSTARContent(markdown, story);
        
        // 기술적 상세 정보
        appendTechnicalDetails(markdown, story);
        
        // 면접 대비 섹션
        appendInterviewPreparation(markdown, story);
        
        // 학습 및 성장
        appendLearningSection(markdown, story);
        
        return markdown.toString();
    }
    
    /**
     * 면접용 간단 요약 생성
     */
    public String formatForInterview(PortfolioStory story) {
        StringBuilder summary = new StringBuilder();
        
        summary.append("## ").append(story.getTitle()).append("\n\n");
        
        // 핵심 요약 (30초 답변용)
        summary.append("### 🎯 30초 요약\n");
        summary.append(generateElevatorPitch(story)).append("\n\n");
        
        // STAR 한 줄 요약
        summary.append("### ⭐ STAR 요약\n");
        summary.append("- **S**: ").append(extractKeySentence(story.getSituation())).append("\n");
        summary.append("- **T**: ").append(extractKeySentence(story.getTask())).append("\n");
        summary.append("- **A**: ").append(extractKeyAction(story.getAction())).append("\n");
        summary.append("- **R**: ").append(extractKeyResult(story.getResult())).append("\n\n");
        
        return summary.toString();
    }
    
    /**
     * GitHub README용 프로젝트 설명 생성
     */
    public String formatForGitHub(PortfolioStory story) {
        StringBuilder github = new StringBuilder();
        
        github.append("## ").append(story.getTitle()).append("\n\n");
        
        // 뱃지들
        github.append(generateBadges(story)).append("\n\n");
        
        // 문제 상황과 해결
        github.append("### 문제 상황\n");
        github.append(story.getSituation()).append("\n\n");
        
        github.append("### 해결 과정\n");
        github.append(formatActionForGitHub(story.getAction())).append("\n\n");
        
        github.append("### 결과 및 성과\n");
        github.append(story.getResult()).append("\n\n");
        
        // 사용 기술
        github.append("### 🛠️ 사용 기술\n");
        story.getTechStack().forEach(tech -> 
            github.append("- ").append(tech).append("\n")
        );
        
        return github.toString();
    }
    
    /**
     * Claude 지침 보완용 패턴 분석 문서 생성
     */
    public String formatForClaudeImprovement(PortfolioStory story) {
        StringBuilder analysis = new StringBuilder();
        
        analysis.append("# Claude 지침 보완 분석: ").append(story.getTitle()).append("\n\n");
        
        // 문제 패턴 분석
        analysis.append("## 🔍 문제 패턴 분석\n");
        analysis.append("- **문제 유형**: ").append(extractProblemType(story)).append("\n");
        analysis.append("- **발생 컨텍스트**: ").append(extractContext(story)).append("\n");
        analysis.append("- **난이도**: ").append(story.getDifficulty().getLevel()).append("\n\n");
        
        // 해결 접근법 분석
        analysis.append("## 💡 해결 접근법 분석\n");
        analysis.append(analyzeApproach(story)).append("\n\n");
        
        // 향후 예방책
        analysis.append("## 🛡️ 예방 가이드라인\n");
        analysis.append(generatePreventionGuidelines(story)).append("\n\n");
        
        // Claude에게 추천할 개선사항
        analysis.append("## 🎯 Claude 지침 개선 제안\n");
        analysis.append(generateImprovementSuggestions(story)).append("\n\n");
        
        return analysis.toString();
    }
    
    private void appendMetadata(StringBuilder markdown, PortfolioStory story) {
        markdown.append("## 📋 프로젝트 정보\n\n");
        markdown.append("| 항목 | 내용 |\n");
        markdown.append("|------|------|\n");
        markdown.append("| 프로젝트 | 엘더베리 케어링크 |\n");
        markdown.append("| 기간 | ").append(story.getStartTime().format(DATE_FORMATTER));
        if (story.getEndTime() != null) {
            markdown.append(" ~ ").append(story.getEndTime().format(DATE_FORMATTER));
        }
        markdown.append(" |\n");
        markdown.append("| 소요 시간 | ").append(formatDuration(story.getDuration())).append(" |\n");
        markdown.append("| 난이도 | ").append(story.getDifficulty().getLevel()).append(" |\n");
        markdown.append("| 기술 스택 | ").append(String.join(", ", story.getTechStack())).append(" |\n");
        markdown.append("| 포트폴리오 점수 | ").append(story.getPortfolioScore()).append("점 |\n\n");
    }
    
    private void appendSTARContent(StringBuilder markdown, PortfolioStory story) {
        markdown.append("## ⭐ STAR 방법론\n\n");
        
        // Situation
        markdown.append("### 📍 Situation (상황)\n");
        markdown.append(story.getSituation()).append("\n\n");
        
        // Task
        markdown.append("### 🎯 Task (과제)\n");
        markdown.append(story.getTask()).append("\n\n");
        
        // Action
        markdown.append("### 🔧 Action (행동)\n");
        markdown.append(story.getAction()).append("\n\n");
        
        // Result
        markdown.append("### 📈 Result (결과)\n");
        markdown.append(story.getResult()).append("\n\n");
    }
    
    private void appendTechnicalDetails(StringBuilder markdown, PortfolioStory story) {
        markdown.append("## 🛠️ 기술적 상세 정보\n\n");
        
        // 사용 기술
        markdown.append("### 사용 기술 스택\n");
        story.getTechStack().forEach(tech -> 
            markdown.append("- **").append(tech).append("**: ").append(getTechDescription(tech)).append("\n")
        );
        markdown.append("\n");
        
        // 핵심 스킬
        if (story.getKeySkillsUsed() != null && !story.getKeySkillsUsed().isEmpty()) {
            markdown.append("### 활용한 핵심 스킬\n");
            story.getKeySkillsUsed().forEach(skill -> 
                markdown.append("- ").append(skill).append("\n")
            );
            markdown.append("\n");
        }
        
        // 성능 개선
        if (story.getPerformanceImprovement() != null) {
            markdown.append("### 성능 개선 결과\n");
            markdown.append(story.getPerformanceImprovement()).append("\n\n");
        }
    }
    
    private void appendInterviewPreparation(StringBuilder markdown, PortfolioStory story) {
        markdown.append("## 💼 면접 대비\n\n");
        
        // 예상 질문과 답변
        markdown.append("### 예상 면접 질문\n");
        if (story.getInterviewQuestions() != null) {
            for (int i = 0; i < story.getInterviewQuestions().size(); i++) {
                markdown.append(i + 1).append(". ").append(story.getInterviewQuestions().get(i)).append("\n");
            }
        }
        markdown.append("\n");
        
        // 어필 포인트
        markdown.append("### 🎯 핵심 어필 포인트\n");
        story.getInterviewHighlights().forEach(highlight -> 
            markdown.append("- ").append(highlight).append("\n")
        );
        markdown.append("\n");
    }
    
    private void appendLearningSection(StringBuilder markdown, PortfolioStory story) {
        markdown.append("## 📚 학습 및 성장\n\n");
        
        // 학습한 내용
        if (story.getLearningPoints() != null && !story.getLearningPoints().isEmpty()) {
            markdown.append("### 새로 학습한 내용\n");
            story.getLearningPoints().forEach(learning -> 
                markdown.append("- ").append(learning).append("\n")
            );
            markdown.append("\n");
        }
        
        // 향후 개선 방향
        markdown.append("### 향후 개선 방향\n");
        markdown.append("- 유사한 문제의 예방을 위한 모니터링 시스템 구축\n");
        markdown.append("- 문제 해결 과정의 자동화 검토\n");
        markdown.append("- 팀 내 지식 공유를 위한 문서화\n\n");
        
        // 관련 링크 (있는 경우)
        markdown.append("### 관련 자료\n");
        markdown.append("- [커밋 히스토리](링크)\n");
        markdown.append("- [관련 이슈](링크)\n");
        markdown.append("- [테스트 결과](링크)\n\n");
    }
    
    // Helper methods
    private String generateElevatorPitch(PortfolioStory story) {
        return String.format("%s 프로젝트에서 %s 문제를 %s 기술을 활용해 %s만에 해결했습니다. " +
                "이를 통해 %s의 성과를 달성했습니다.",
                "엘더베리 케어링크",
                extractProblemType(story),
                String.join(", ", story.getTechStack()),
                formatDuration(story.getDuration()),
                extractKeyBenefit(story.getResult())
        );
    }
    
    private String extractKeySentence(String content) {
        if (content == null) return "";
        String[] sentences = content.split("\n");
        return sentences.length > 0 ? sentences[0].trim() : "";
    }
    
    private String extractKeyAction(String action) {
        if (action == null) return "";
        // "문제 해결 과정:" 다음의 첫 번째 항목 추출
        String[] lines = action.split("\n");
        for (String line : lines) {
            if (line.trim().startsWith("1.")) {
                return line.trim().substring(2).trim();
            }
        }
        return extractKeySentence(action);
    }
    
    private String extractKeyResult(String result) {
        if (result == null) return "";
        // "해결 결과:" 다음의 첫 번째 항목 추출  
        String[] lines = result.split("\n");
        for (String line : lines) {
            if (line.contains("비즈니스 임팩트")) {
                return line.replace("- 비즈니스 임팩트:", "").trim();
            }
        }
        return extractKeySentence(result);
    }
    
    private String generateBadges(PortfolioStory story) {
        StringBuilder badges = new StringBuilder();
        
        // 난이도 뱃지
        String difficultyColor = switch (story.getDifficulty()) {
            case LOW -> "green";
            case MEDIUM -> "yellow"; 
            case HIGH -> "orange";
            case EXPERT -> "red";
        };
        badges.append("![난이도](https://img.shields.io/badge/난이도-")
                .append(story.getDifficulty().getLevel())
                .append("-").append(difficultyColor).append(")\n");
        
        // 기술 스택 뱃지
        story.getTechStack().forEach(tech -> {
            String techBadge = getTechBadge(tech);
            if (techBadge != null) {
                badges.append(techBadge).append("\n");
            }
        });
        
        return badges.toString();
    }
    
    private String formatActionForGitHub(String action) {
        if (action == null) return "";
        
        // 번호 리스트를 GitHub 마크다운 형식으로 변환
        String[] lines = action.split("\n");
        StringBuilder formatted = new StringBuilder();
        
        for (String line : lines) {
            if (line.trim().matches("^\\d+\\..*")) {
                formatted.append("- ").append(line.trim().substring(2).trim()).append("\n");
            } else if (!line.trim().isEmpty()) {
                formatted.append(line).append("\n");
            }
        }
        
        return formatted.toString();
    }
    
    private String extractProblemType(PortfolioStory story) {
        String title = story.getTitle();
        if (title.contains("Repository")) return "데이터베이스 연동";
        if (title.contains("API")) return "API 통신";
        if (title.contains("빌드")) return "빌드 시스템";
        return "시스템";
    }
    
    private String extractContext(PortfolioStory story) {
        return "Java 21 + Spring Boot 환경에서 " + story.getDifficulty().getDescription();
    }
    
    private String analyzeApproach(PortfolioStory story) {
        return "체계적인 문제 분석 → 원인 규명 → 단계적 해결 → 검증 및 테스트 과정을 통한 해결";
    }
    
    private String generatePreventionGuidelines(PortfolioStory story) {
        return "1. 사전 검증 프로세스 강화\n2. 모니터링 시스템 구축\n3. 문서화 및 팀 공유";
    }
    
    private String generateImprovementSuggestions(PortfolioStory story) {
        return "1. 유사 문제 패턴 데이터베이스 구축\n2. 자동 진단 도구 개발\n3. 베스트 프랙티스 가이드 업데이트";
    }
    
    private String formatDuration(java.time.Duration duration) {
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        
        if (hours > 0) {
            return String.format("%d시간 %d분", hours, minutes);
        } else {
            return String.format("%d분", minutes);
        }
    }
    
    private String getTechDescription(String tech) {
        return switch (tech) {
            case "Java 21" -> "최신 LTS 버전의 Java 활용";
            case "Spring Boot" -> "엔터프라이즈급 웹 애플리케이션 프레임워크";
            case "React 18" -> "모던 프론트엔드 라이브러리";
            case "TypeScript" -> "타입 안전성을 보장하는 JavaScript 슈퍼셋";
            case "H2 Database" -> "경량 인메모리/파일 기반 데이터베이스";
            default -> "프로젝트 핵심 기술";
        };
    }
    
    private String getTechBadge(String tech) {
        return switch (tech) {
            case "Java 21" -> "![Java](https://img.shields.io/badge/Java-21-orange)";
            case "Spring Boot" -> "![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)";
            case "React 18" -> "![React](https://img.shields.io/badge/React-18-blue)";
            case "TypeScript" -> "![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)";
            default -> null;
        };
    }
    
    private String extractKeyBenefit(String result) {
        if (result == null) return "시스템 안정성 향상";
        
        if (result.contains("성능")) return "성능 개선";
        if (result.contains("안정성")) return "시스템 안정성 향상";
        if (result.contains("사용자")) return "사용자 경험 개선";
        
        return "서비스 품질 향상";
    }
}