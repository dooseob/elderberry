package com.globalcarelink.common.exception;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 상세한 유효성 검증 오류 정보
 * 클라이언트에게 구체적인 오류 정보와 해결 방법 제공
 */
@Getter
@Builder
@ToString
public class ValidationErrorDetails {
    
    /**
     * 오류 발생 시점
     */
    private final LocalDateTime timestamp;
    
    /**
     * 오류 추적 ID
     */
    private final String errorId;
    
    /**
     * 전체 오류 메시지
     */
    private final String message;
    
    /**
     * 필드별 상세 오류 정보
     */
    private final List<FieldError> fieldErrors;
    
    /**
     * 글로벌 오류 정보 (특정 필드와 연관되지 않은 오류)
     */
    private final List<GlobalError> globalErrors;
    
    /**
     * 추가 메타데이터
     */
    private final Map<String, Object> metadata;
    
    /**
     * 필드별 오류 상세 정보
     */
    @Getter
    @Builder
    @ToString
    public static class FieldError {
        /**
         * 오류가 발생한 필드명
         */
        private final String field;
        
        /**
         * 필드의 현재 값
         */
        private final Object rejectedValue;
        
        /**
         * 오류 메시지
         */
        private final String message;
        
        /**
         * 오류 코드 (국제화 키)
         */
        private final String code;
        
        /**
         * 위반된 제약 조건
         */
        private final String constraint;
        
        /**
         * 허용되는 값 목록
         */
        private final List<Object> allowedValues;
        
        /**
         * 최소값 (숫자/날짜 필드용)
         */
        private final Object minValue;
        
        /**
         * 최대값 (숫자/날짜 필드용)
         */
        private final Object maxValue;
        
        /**
         * 최소 길이 (문자열 필드용)
         */
        private final Integer minLength;
        
        /**
         * 최대 길이 (문자열 필드용)
         */
        private final Integer maxLength;
        
        /**
         * 정규식 패턴 (문자열 필드용)
         */
        private final String pattern;
        
        /**
         * 제안 수정 값
         */
        private final Object suggestedValue;
        
        /**
         * 도움말 메시지
         */
        private final String helpMessage;
    }
    
    /**
     * 글로벌 오류 정보
     */
    @Getter
    @Builder
    @ToString
    public static class GlobalError {
        /**
         * 오류 메시지
         */
        private final String message;
        
        /**
         * 오류 코드
         */
        private final String code;
        
        /**
         * 오류 유형
         */
        private final ErrorType type;
        
        /**
         * 관련 필드들
         */
        private final List<String> relatedFields;
        
        /**
         * 해결 방법
         */
        private final String resolution;
    }
    
    /**
     * 오류 유형 열거형
     */
    public enum ErrorType {
        BUSINESS_RULE_VIOLATION("비즈니스 규칙 위반"),
        DATA_INTEGRITY_VIOLATION("데이터 무결성 위반"),
        SECURITY_VIOLATION("보안 규칙 위반"),
        RESOURCE_NOT_FOUND("리소스 없음"),
        PERMISSION_DENIED("권한 없음"),
        RATE_LIMIT_EXCEEDED("요청 한도 초과"),
        EXTERNAL_SERVICE_ERROR("외부 서비스 오류");
        
        private final String description;
        
        ErrorType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * 빌더 헬퍼 메서드들
     */
    public static class ValidationErrorDetailsBuilder {
        
        public ValidationErrorDetailsBuilder withTimestamp() {
            this.timestamp = LocalDateTime.now();
            return this;
        }
        
        public ValidationErrorDetailsBuilder withErrorId(String prefix) {
            this.errorId = prefix + "-" + System.currentTimeMillis();
            return this;
        }
        
        public ValidationErrorDetailsBuilder addFieldError(String field, Object rejectedValue, 
                                                          String message, String code) {
            if (this.fieldErrors == null) {
                this.fieldErrors = new java.util.ArrayList<>();
            }
            this.fieldErrors.add(FieldError.builder()
                    .field(field)
                    .rejectedValue(rejectedValue)
                    .message(message)
                    .code(code)
                    .build());
            return this;
        }
        
        public ValidationErrorDetailsBuilder addGlobalError(String message, String code, 
                                                           ErrorType type) {
            if (this.globalErrors == null) {
                this.globalErrors = new java.util.ArrayList<>();
            }
            this.globalErrors.add(GlobalError.builder()
                    .message(message)
                    .code(code)
                    .type(type)
                    .build());
            return this;
        }
        
        public ValidationErrorDetailsBuilder addMetadata(String key, Object value) {
            if (this.metadata == null) {
                this.metadata = new java.util.HashMap<>();
            }
            this.metadata.put(key, value);
            return this;
        }
    }
} 