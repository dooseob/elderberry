package com.globalcarelink.common.exception;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 유효성 검증 오류 빌더
 * 다양한 검증 시나리오에 대한 상세한 오류 정보 생성
 */
@Component
public class ValidationErrorBuilder {

    /**
     * 새로운 검증 오류 상세 정보 빌더 생성
     */
    public ValidationErrorDetails.ValidationErrorDetailsBuilder create(String message) {
        return ValidationErrorDetails.builder()
                .timestamp(LocalDateTime.now())
                .errorId("VAL-" + UUID.randomUUID().toString().substring(0, 8))
                .message(message);
    }

    /**
     * 필수 필드 누락 오류
     */
    public ValidationErrorDetails.FieldError requiredField(String field) {
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(null)
                .message(field + "는 필수 입력 항목입니다")
                .code("field.required")
                .constraint("NotNull")
                .helpMessage("이 필드는 반드시 값을 입력해야 합니다")
                .build();
    }

    /**
     * 문자열 길이 오류
     */
    public ValidationErrorDetails.FieldError stringLength(String field, Object value, 
                                                         Integer minLength, Integer maxLength) {
        String actualLength = value != null ? String.valueOf(value).length() + "" : "0";
        String constraint = "Size";
        String message;
        
        if (minLength != null && maxLength != null) {
            message = String.format("%s의 길이는 %d자 이상 %d자 이하여야 합니다 (현재: %s자)", 
                                   field, minLength, maxLength, actualLength);
            constraint += String.format("(min=%d, max=%d)", minLength, maxLength);
        } else if (minLength != null) {
            message = String.format("%s의 길이는 %d자 이상이어야 합니다 (현재: %s자)", 
                                   field, minLength, actualLength);
            constraint += String.format("(min=%d)", minLength);
        } else if (maxLength != null) {
            message = String.format("%s의 길이는 %d자 이하여야 합니다 (현재: %s자)", 
                                   field, maxLength, actualLength);
            constraint += String.format("(max=%d)", maxLength);
        } else {
            message = field + "의 길이가 유효하지 않습니다";
        }

        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(message)
                .code("field.size")
                .constraint(constraint)
                .minLength(minLength)
                .maxLength(maxLength)
                .helpMessage("입력 가능한 문자 수를 확인해주세요")
                .build();
    }

    /**
     * 숫자 범위 오류
     */
    public ValidationErrorDetails.FieldError numberRange(String field, Object value, 
                                                        Number minValue, Number maxValue) {
        String message;
        String constraint = "Range";
        
        if (minValue != null && maxValue != null) {
            message = String.format("%s는 %s 이상 %s 이하의 값이어야 합니다 (현재: %s)", 
                                   field, minValue, maxValue, value);
            constraint += String.format("(min=%s, max=%s)", minValue, maxValue);
        } else if (minValue != null) {
            message = String.format("%s는 %s 이상의 값이어야 합니다 (현재: %s)", 
                                   field, minValue, value);
            constraint += String.format("(min=%s)", minValue);
        } else if (maxValue != null) {
            message = String.format("%s는 %s 이하의 값이어야 합니다 (현재: %s)", 
                                   field, maxValue, value);
            constraint += String.format("(max=%s)", maxValue);
        } else {
            message = field + "의 값이 유효하지 않습니다";
        }

        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(message)
                .code("field.range")
                .constraint(constraint)
                .minValue(minValue)
                .maxValue(maxValue)
                .helpMessage("허용되는 숫자 범위를 확인해주세요")
                .build();
    }

    /**
     * 열거형 값 오류
     */
    public ValidationErrorDetails.FieldError enumValue(String field, Object value, 
                                                      List<Object> allowedValues) {
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(String.format("%s는 다음 값 중 하나여야 합니다: %s (현재: %s)", 
                                     field, allowedValues, value))
                .code("field.enum")
                .constraint("OneOf")
                .allowedValues(allowedValues)
                .helpMessage("허용되는 값 목록에서 선택해주세요")
                .build();
    }

    /**
     * 정규식 패턴 오류
     */
    public ValidationErrorDetails.FieldError patternMismatch(String field, Object value, 
                                                           String pattern, String description) {
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(String.format("%s의 형식이 올바르지 않습니다. %s (현재: %s)", 
                                     field, description, value))
                .code("field.pattern")
                .constraint("Pattern")
                .pattern(pattern)
                .helpMessage(description)
                .build();
    }

    /**
     * 날짜 범위 오류
     */
    public ValidationErrorDetails.FieldError dateRange(String field, Object value, 
                                                      LocalDate minDate, LocalDate maxDate) {
        String message;
        String constraint = "DateRange";
        
        if (minDate != null && maxDate != null) {
            message = String.format("%s는 %s 이후 %s 이전의 날짜여야 합니다 (현재: %s)", 
                                   field, minDate, maxDate, value);
            constraint += String.format("(min=%s, max=%s)", minDate, maxDate);
        } else if (minDate != null) {
            message = String.format("%s는 %s 이후의 날짜여야 합니다 (현재: %s)", 
                                   field, minDate, value);
            constraint += String.format("(min=%s)", minDate);
        } else if (maxDate != null) {
            message = String.format("%s는 %s 이전의 날짜여야 합니다 (현재: %s)", 
                                   field, maxDate, value);
            constraint += String.format("(max=%s)", maxDate);
        } else {
            message = field + "의 날짜가 유효하지 않습니다";
        }

        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(message)
                .code("field.date.range")
                .constraint(constraint)
                .minValue(minDate)
                .maxValue(maxDate)
                .helpMessage("유효한 날짜 범위를 확인해주세요")
                .build();
    }

    /**
     * 이메일 형식 오류
     */
    public ValidationErrorDetails.FieldError invalidEmail(String field, Object value) {
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(String.format("%s의 이메일 형식이 올바르지 않습니다 (현재: %s)", field, value))
                .code("field.email")
                .constraint("Email")
                .pattern("^[A-Za-z0-9+_.-]+@(.+)$")
                .suggestedValue("example@domain.com")
                .helpMessage("올바른 이메일 형식으로 입력해주세요 (예: user@example.com)")
                .build();
    }

    /**
     * 전화번호 형식 오류
     */
    public ValidationErrorDetails.FieldError invalidPhoneNumber(String field, Object value) {
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(String.format("%s의 전화번호 형식이 올바르지 않습니다 (현재: %s)", field, value))
                .code("field.phone")
                .constraint("PhoneNumber")
                .pattern("^[0-9\\-+\\s()]*$")
                .allowedValues(Arrays.asList("010-1234-5678", "02-123-4567", "+82-10-1234-5678"))
                .helpMessage("하이픈(-) 포함 또는 제외한 숫자만 입력 가능합니다")
                .build();
    }

    /**
     * ADL 수준 오류 (건강 평가 전용)
     */
    public ValidationErrorDetails.FieldError invalidAdlLevel(String field, Object value) {
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(String.format("%s는 1-3 사이의 값이어야 합니다 (현재: %s)", field, value))
                .code("field.adl.level")
                .constraint("Range(min=1, max=3)")
                .minValue(1)
                .maxValue(3)
                .allowedValues(Arrays.asList(1, 2, 3))
                .helpMessage("1: 독립, 2: 부분도움, 3: 완전도움 중 선택해주세요")
                .build();
    }

    /**
     * 장기요양등급 오류 (건강 평가 전용)
     */
    public ValidationErrorDetails.FieldError invalidLtciGrade(String field, Object value) {
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(String.format("%s는 1-6 사이의 값이어야 합니다 (현재: %s)", field, value))
                .code("field.ltci.grade")
                .constraint("Range(min=1, max=6)")
                .minValue(1)
                .maxValue(6)
                .allowedValues(Arrays.asList(1, 2, 3, 4, 5, 6))
                .helpMessage("1-2등급: 중증, 3등급: 중등증, 4-5등급: 경증, 6등급: 인지지원등급")
                .build();
    }

    /**
     * 출생년도 오류
     */
    public ValidationErrorDetails.FieldError invalidBirthYear(String field, Object value) {
        int currentYear = LocalDate.now().getYear();
        return ValidationErrorDetails.FieldError.builder()
                .field(field)
                .rejectedValue(value)
                .message(String.format("%s는 1900년 이후 %d년 이전이어야 합니다 (현재: %s)", 
                                     field, currentYear, value))
                .code("field.birth.year")
                .constraint(String.format("Range(min=1900, max=%d)", currentYear - 1))
                .minValue(1900)
                .maxValue(currentYear - 1)
                .helpMessage("올바른 출생년도를 입력해주세요")
                .build();
    }

    /**
     * 비즈니스 규칙 위반 오류
     */
    public ValidationErrorDetails.GlobalError businessRuleViolation(String message, 
                                                                   List<String> relatedFields, 
                                                                   String resolution) {
        return ValidationErrorDetails.GlobalError.builder()
                .message(message)
                .code("business.rule.violation")
                .type(ValidationErrorDetails.ErrorType.BUSINESS_RULE_VIOLATION)
                .relatedFields(relatedFields)
                .resolution(resolution)
                .build();
    }

    /**
     * 데이터 무결성 위반 오류
     */
    public ValidationErrorDetails.GlobalError dataIntegrityViolation(String message, 
                                                                    List<String> relatedFields) {
        return ValidationErrorDetails.GlobalError.builder()
                .message(message)
                .code("data.integrity.violation")
                .type(ValidationErrorDetails.ErrorType.DATA_INTEGRITY_VIOLATION)
                .relatedFields(relatedFields)
                .resolution("관련 데이터의 일관성을 확인하고 다시 시도해주세요")
                .build();
    }

    /**
     * 보안 규칙 위반 오류
     */
    public ValidationErrorDetails.GlobalError securityViolation(String message) {
        return ValidationErrorDetails.GlobalError.builder()
                .message(message)
                .code("security.violation")
                .type(ValidationErrorDetails.ErrorType.SECURITY_VIOLATION)
                .resolution("입력값에 허용되지 않는 문자나 패턴이 포함되어 있습니다")
                .build();
    }
} 