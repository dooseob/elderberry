package com.globalcarelink.agents.documentation;

import com.globalcarelink.agents.portfolio.PortfolioStory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * 다중 형식 문서화 전략 구현체
 * 목적: 1) 하나의 소스 데이터에서 여러 형식 문서 생성
 *      2) 통합된 문서화 로직 제공
 *      3) 확장 가능한 문서 형식 지원
 */
@Slf4j
@Component
public class MultiFormatDocumentationStrategy implements DocumentationStrategy {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    @Override
    public String generateDocument(Object sourceData, Map<String, Object> options) {
        DocumentFormat format = (DocumentFormat) options.getOrDefault("format", DocumentFormat.MARKDOWN);
        
        return switch (format) {
            case MARKDOWN -> generateMarkdownDocument(sourceData, options);
            case STAR_PORTFOLIO -> generateSTARPortfolioDocument(sourceData, options);
            case GITHUB_README -> generateGitHubDocument(sourceData, options);
            case CLAUDE_LEARNING -> generateClaudeLearningDocument(sourceData, options);
            case API_DOCUMENTATION -> generateAPIDocument(sourceData, options);
            case TROUBLESHOOTING -> generateTroubleshootingDocument(sourceData, options);
            case TECHNICAL_GUIDE -> generateTechnicalGuideDocument(sourceData, options);
        };
    }
    
    @Override
    public DocumentFormat getSupportedFormat() {
        return DocumentFormat.MARKDOWN; // 기본 지원 형식
    }
    
    @Override
    public boolean validateDocument(String document) {
        // 기본 검증: 빈 문서가 아니고 최소 길이 확인
        return document != null && document.trim().length() > 50;
    }
    
    @Override
    public Map<String, Object> extractMetadata(Object sourceData) {
        Map<String, Object> metadata = new HashMap<>();
        
        metadata.put("generatedAt", LocalDateTime.now());
        metadata.put("sourceType", sourceData.getClass().getSimpleName());
        metadata.put("documentGenerator", "MultiFormatDocumentationStrategy");
        
        if (sourceData instanceof PortfolioStory story) {
            metadata.put("storyId", story.getId());
            metadata.put("title", story.getTitle());
            metadata.put("difficulty", story.getDifficulty());
            metadata.put("techStack", story.getTechStack());
            metadata.put("portfolioScore", story.getPortfolioScore());
        }
        
        return metadata;
    }
    
    // Private document generation methods
    
    private String generateMarkdownDocument(Object sourceData, Map<String, Object> options) {
        StringBuilder md = new StringBuilder();
        
        if (sourceData instanceof PortfolioStory story) {
            md.append("# ").append(story.getTitle()).append("\n\n");
            
            // 메타데이터 테이블
            md.append("## 📋 프로젝트 정보\n\n");
            md.append("| 항목 | 내용 |\n");
            md.append("|------|------|\n");
            md.append("| 제목 | ").append(story.getTitle()).append(" |\n");
            md.append("| 난이도 | ").append(story.getDifficulty().getLevel()).append(" |\n");
            md.append("| 기술스택 | ").append(String.join(", ", story.getTechStack())).append(" |\n");
            md.append("| 포트폴리오 점수 | ").append(story.getPortfolioScore()).append("점 |\n\n");
            
            // STAR 내용
            if (story.getSituation() != null) {
                md.append("## 상황 (Situation)\n");
                md.append(story.getSituation()).append("\n\n");
            }
            
            if (story.getTask() != null) {
                md.append("## 과제 (Task)\n");
                md.append(story.getTask()).append("\n\n");
            }
            
            if (story.getAction() != null) {
                md.append("## 행동 (Action)\n");
                md.append(story.getAction()).append("\n\n");
            }
            
            if (story.getResult() != null) {
                md.append("## 결과 (Result)\n");
                md.append(story.getResult()).append("\n\n");
            }
        } else {
            // 일반 객체의 경우
            md.append("# 문서\n\n");
            md.append("**생성 시간**: ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("\n\n");
            md.append("**소스 타입**: ").append(sourceData.getClass().getSimpleName()).append("\n\n");
            md.append("**내용**: \n").append(sourceData.toString()).append("\n\n");
        }
        
        return md.toString();
    }
    
    private String generateSTARPortfolioDocument(Object sourceData, Map<String, Object> options) {
        StringBuilder doc = new StringBuilder();
        
        if (sourceData instanceof PortfolioStory story) {
            doc.append("# 📁 포트폴리오: ").append(story.getTitle()).append("\n\n");
            
            // STAR 방법론 강조
            doc.append("## ⭐ STAR 방법론 기반 경험 정리\n\n");
            
            doc.append("### 📍 Situation (상황)\n");
            doc.append("**배경**: ").append(story.getSituation() != null ? story.getSituation() : "상황 정보 없음").append("\n\n");
            
            doc.append("### 🎯 Task (과제)\n");
            doc.append("**해결 과제**: ").append(story.getTask() != null ? story.getTask() : "과제 정보 없음").append("\n\n");
            
            doc.append("### 🔧 Action (행동)\n");
            doc.append("**수행 작업**: ").append(story.getAction() != null ? story.getAction() : "행동 정보 없음").append("\n\n");
            
            doc.append("### 📈 Result (결과)\n");
            doc.append("**달성 결과**: ").append(story.getResult() != null ? story.getResult() : "결과 정보 없음").append("\n\n");
            
            // 면접 대비 섹션
            doc.append("## 💼 면접 대비\n\n");
            if (story.getInterviewQuestions() != null && !story.getInterviewQuestions().isEmpty()) {
                doc.append("### 예상 질문\n");
                for (int i = 0; i < story.getInterviewQuestions().size(); i++) {
                    doc.append(i + 1).append(". ").append(story.getInterviewQuestions().get(i)).append("\n");
                }
                doc.append("\n");
            }
            
            // 핵심 어필 포인트
            doc.append("### 🎯 핵심 어필 포인트\n");
            story.getInterviewHighlights().forEach(highlight -> 
                doc.append("- ").append(highlight).append("\n"));
            doc.append("\n");
        }
        
        return doc.toString();
    }
    
    private String generateGitHubDocument(Object sourceData, Map<String, Object> options) {
        StringBuilder github = new StringBuilder();
        
        if (sourceData instanceof PortfolioStory story) {
            github.append("## ").append(story.getTitle()).append("\n\n");
            
            // 뱃지 생성
            String difficultyColor = switch (story.getDifficulty()) {
                case LOW -> "green";
                case MEDIUM -> "yellow";
                case HIGH -> "orange";
                case EXPERT -> "red";
            };
            
            github.append("![난이도](https://img.shields.io/badge/난이도-")
                  .append(story.getDifficulty().getLevel())
                  .append("-").append(difficultyColor).append(")\n");
            
            // 기술 스택 뱃지
            story.getTechStack().forEach(tech -> {
                String badge = getTechBadge(tech);
                if (badge != null) {
                    github.append(badge).append("\n");
                }
            });
            github.append("\n");
            
            // 문제 상황과 해결
            github.append("### 🔍 문제 상황\n");
            github.append(story.getSituation() != null ? story.getSituation() : "문제 상황 설명").append("\n\n");
            
            github.append("### ⚡ 해결 과정\n");
            github.append(story.getAction() != null ? story.getAction() : "해결 과정 설명").append("\n\n");
            
            github.append("### 🎯 결과 및 성과\n");
            github.append(story.getResult() != null ? story.getResult() : "결과 및 성과").append("\n\n");
            
            // 사용 기술
            github.append("### 🛠️ 사용 기술\n");
            story.getTechStack().forEach(tech -> 
                github.append("- ").append(tech).append("\n"));
            github.append("\n");
        }
        
        return github.toString();
    }
    
    private String generateClaudeLearningDocument(Object sourceData, Map<String, Object> options) {
        StringBuilder learning = new StringBuilder();
        
        if (sourceData instanceof PortfolioStory story) {
            learning.append("# Claude 학습 패턴: ").append(story.getTitle()).append("\n\n");
            
            // 문제 패턴 분석
            learning.append("## 🔍 문제 패턴 분석\n");
            learning.append("- **문제 유형**: ").append(extractProblemType(story)).append("\n");
            learning.append("- **발생 컨텍스트**: Java 21 + Spring Boot 환경\n");
            learning.append("- **난이도**: ").append(story.getDifficulty().getLevel()).append("\n\n");
            
            // 해결 접근법 분석
            learning.append("## 💡 해결 접근법 분석\n");
            learning.append("체계적인 문제 분석 → 원인 규명 → 단계적 해결 → 검증 및 테스트 과정\n\n");
            
            // 향후 예방책
            learning.append("## 🛡️ 예방 가이드라인\n");
            learning.append("1. 사전 검증 프로세스 강화\n");
            learning.append("2. 모니터링 시스템 구축\n");
            learning.append("3. 문서화 및 팀 공유\n\n");
            
            // Claude 지침 개선 제안
            learning.append("## 🎯 Claude 지침 개선 제안\n");
            learning.append("1. 유사한 문제 패턴 데이터베이스 구축\n");
            learning.append("2. 자동 진단 도구 개발\n");
            learning.append("3. 베스트 프랙티스 가이드 업데이트\n\n");
        }
        
        return learning.toString();
    }
    
    private String generateAPIDocument(Object sourceData, Map<String, Object> options) {
        StringBuilder api = new StringBuilder();
        
        api.append("# API 문서\n\n");
        api.append("**생성 시간**: ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("\n\n");
        
        // API 문서 생성 로직 (확장 가능)
        api.append("## 개요\n");
        api.append("이 문서는 자동 생성된 API 문서입니다.\n\n");
        
        api.append("## 엔드포인트\n");
        api.append("- 추후 구현 예정\n\n");
        
        return api.toString();
    }
    
    private String generateTroubleshootingDocument(Object sourceData, Map<String, Object> options) {
        StringBuilder trouble = new StringBuilder();
        
        trouble.append("# 🔧 트러블슈팅 가이드\n\n");
        trouble.append("**생성 시간**: ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("\n\n");
        
        if (sourceData instanceof PortfolioStory story) {
            trouble.append("## 문제 상황\n");
            trouble.append(story.getSituation() != null ? story.getSituation() : "문제 상황 설명").append("\n\n");
            
            trouble.append("## 해결 과정\n");
            trouble.append(story.getAction() != null ? story.getAction() : "해결 과정 설명").append("\n\n");
            
            trouble.append("## 결과 및 교훈\n");
            trouble.append(story.getResult() != null ? story.getResult() : "결과 및 교훈").append("\n\n");
        }
        
        return trouble.toString();
    }
    
    private String generateTechnicalGuideDocument(Object sourceData, Map<String, Object> options) {
        StringBuilder guide = new StringBuilder();
        
        guide.append("# 📚 기술 가이드\n\n");
        guide.append("**생성 시간**: ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("\n\n");
        
        if (sourceData instanceof PortfolioStory story) {
            guide.append("## 기술 개요\n");
            guide.append("**사용 기술**: ").append(String.join(", ", story.getTechStack())).append("\n\n");
            
            guide.append("## 구현 방법\n");
            guide.append(story.getAction() != null ? story.getAction() : "구현 방법 설명").append("\n\n");
            
            guide.append("## 베스트 프랙티스\n");
            guide.append("- 체계적인 접근\n");
            guide.append("- 단계적 구현\n");
            guide.append("- 충분한 테스트\n\n");
        }
        
        return guide.toString();
    }
    
    // Helper methods
    
    private String getTechBadge(String tech) {
        return switch (tech) {
            case "Java 21" -> "![Java](https://img.shields.io/badge/Java-21-orange)";
            case "Spring Boot" -> "![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)";
            case "React 18" -> "![React](https://img.shields.io/badge/React-18-blue)";
            case "TypeScript" -> "![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)";
            default -> null;
        };
    }
    
    private String extractProblemType(PortfolioStory story) {
        String title = story.getTitle();
        if (title.contains("Repository")) return "데이터베이스 연동 문제";
        if (title.contains("API")) return "API 통신 문제";
        if (title.contains("빌드")) return "빌드 시스템 문제";
        if (title.contains("성능")) return "성능 최적화 문제";
        return "일반적인 시스템 문제";
    }
}