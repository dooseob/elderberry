package com.globalcarelink.agents.documentation;

import java.util.Map;

/**
 * 문서화 전략 인터페이스
 * 목적: 1) 다양한 형식의 문서 생성 전략 정의
 *      2) 전략 패턴을 통한 유연한 문서화 시스템
 *      3) 포트폴리오, 기술문서, 학습자료 등 다목적 지원
 */
public interface DocumentationStrategy {
    
    /**
     * 문서 생성
     */
    String generateDocument(Object sourceData, Map<String, Object> options);
    
    /**
     * 지원하는 문서 형식
     */
    DocumentFormat getSupportedFormat();
    
    /**
     * 문서 검증
     */
    boolean validateDocument(String document);
    
    /**
     * 메타데이터 추출
     */
    Map<String, Object> extractMetadata(Object sourceData);
    
    /**
     * 문서 형식 열거형
     */
    enum DocumentFormat {
        MARKDOWN("md", "마크다운 형식"),
        STAR_PORTFOLIO("star", "STAR 방법론 포트폴리오"),
        GITHUB_README("github", "GitHub README 형식"),
        CLAUDE_LEARNING("learning", "Claude 학습 패턴 형식"),
        API_DOCUMENTATION("api", "API 문서 형식"),
        TROUBLESHOOTING("trouble", "트러블슈팅 문서 형식"),
        TECHNICAL_GUIDE("guide", "기술 가이드 형식");
        
        private final String extension;
        private final String description;
        
        DocumentFormat(String extension, String description) {
            this.extension = extension;
            this.description = description;
        }
        
        public String getExtension() { return extension; }
        public String getDescription() { return description; }
    }
}