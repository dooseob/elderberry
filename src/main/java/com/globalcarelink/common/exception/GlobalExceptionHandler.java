package com.globalcarelink.common.exception;

import com.globalcarelink.common.event.ErrorEvent;
import com.globalcarelink.common.event.SecurityEvent;
import com.globalcarelink.common.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 전역 예외 처리기 (개선된 버전)
 * 상세한 유효성 검증 오류 정보 제공
 * 보안을 고려한 오류 메시지 처리
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ValidationErrorBuilder validationErrorBuilder;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 커스텀 예외 처리
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ValidationErrorDetails> handleCustomException(
            CustomException ex, HttpServletRequest request) {
        
        log.warn("커스텀 예외 발생: {} - URI: {}", ex.getMessage(), request.getRequestURI());
        
        // 구조화된 에러 이벤트 발행
        publishErrorEvent(ex, request, "BUSINESS");
        
        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create(ex.getMessage())
                .withTimestamp()
                .withErrorId("CUSTOM")
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("httpMethod", request.getMethod())
                .build();

        HttpStatus status = switch (ex) {
            case CustomException.BadRequest badRequest -> HttpStatus.BAD_REQUEST;
            case CustomException.NotFound notFound -> HttpStatus.NOT_FOUND;
            case CustomException.Conflict conflict -> HttpStatus.CONFLICT;
            case CustomException.Unauthorized unauthorized -> HttpStatus.UNAUTHORIZED;
            case CustomException.Forbidden forbidden -> HttpStatus.FORBIDDEN;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return ResponseEntity.status(status).body(errorDetails);
    }

    /**
     * Bean Validation 예외 처리 (@Valid 어노테이션)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorDetails> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        log.warn("유효성 검증 실패: {} 개 오류 - URI: {}", 
                ex.getBindingResult().getErrorCount(), request.getRequestURI());

        // 구조화된 에러 이벤트 발행
        publishErrorEvent(ex, request, "VALIDATION");

        ValidationErrorDetails.ValidationErrorDetailsBuilder builder = validationErrorBuilder
                .create("입력값 유효성 검증에 실패했습니다")
                .withTimestamp()
                .withErrorId("VALIDATION")
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("httpMethod", request.getMethod())
                .addMetadata("totalErrors", ex.getBindingResult().getErrorCount());

        // 필드 오류 처리
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            ValidationErrorDetails.FieldError error = createDetailedFieldError(fieldError);
            builder.fieldErrors(builder.build().getFieldErrors() == null ? 
                    new ArrayList<>() : new ArrayList<>(builder.build().getFieldErrors()));
            builder.build().getFieldErrors().add(error);
        }

        // 글로벌 오류 처리
        ex.getBindingResult().getGlobalErrors().forEach(globalError -> {
            builder.addGlobalError(
                globalError.getDefaultMessage(),
                globalError.getCode(),
                ValidationErrorDetails.ErrorType.BUSINESS_RULE_VIOLATION
            );
        });

        return ResponseEntity.badRequest().body(builder.build());
    }

    /**
     * Bean Validation 예외 처리 (직접 검증)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ValidationErrorDetails> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        log.warn("제약 조건 위반: {} 개 오류 - URI: {}", 
                ex.getConstraintViolations().size(), request.getRequestURI());

        ValidationErrorDetails.ValidationErrorDetailsBuilder builder = validationErrorBuilder
                .create("제약 조건 위반이 발생했습니다")
                .withTimestamp()
                .withErrorId("CONSTRAINT")
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("totalViolations", ex.getConstraintViolations().size());

        List<ValidationErrorDetails.FieldError> fieldErrors = new ArrayList<>();
        
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            Object rejectedValue = violation.getInvalidValue();
            String message = violation.getMessage();
            String constraintType = violation.getConstraintDescriptor().getAnnotation().annotationType().getSimpleName();

            ValidationErrorDetails.FieldError fieldError = createConstraintFieldError(
                    fieldName, rejectedValue, message, constraintType, violation);
            fieldErrors.add(fieldError);
        }

        return ResponseEntity.badRequest()
                .body(builder.fieldErrors(fieldErrors).build());
    }

    /**
     * 바인딩 예외 처리
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ValidationErrorDetails> handleBindException(
            BindException ex, HttpServletRequest request) {
        
        log.warn("바인딩 오류: {} - URI: {}", ex.getMessage(), request.getRequestURI());

        ValidationErrorDetails.ValidationErrorDetailsBuilder builder = validationErrorBuilder
                .create("요청 데이터 바인딩에 실패했습니다")
                .withTimestamp()
                .withErrorId("BINDING")
                .addMetadata("requestUri", request.getRequestURI());

        List<ValidationErrorDetails.FieldError> fieldErrors = new ArrayList<>();
        
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.add(createDetailedFieldError(fieldError));
        }

        return ResponseEntity.badRequest()
                .body(builder.fieldErrors(fieldErrors).build());
    }

    /**
     * 타입 불일치 예외 처리
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ValidationErrorDetails> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        log.warn("타입 불일치: {} - URI: {}", ex.getMessage(), request.getRequestURI());

        String fieldName = ex.getName();
        Object rejectedValue = ex.getValue();
        Class<?> requiredType = ex.getRequiredType();
        
        ValidationErrorDetails.FieldError fieldError = ValidationErrorDetails.FieldError.builder()
                .field(fieldName)
                .rejectedValue(rejectedValue)
                .message(String.format("%s의 값이 올바른 형식이 아닙니다. %s 타입이 필요합니다 (현재: %s)", 
                                     fieldName, requiredType != null ? requiredType.getSimpleName() : "알 수 없음", rejectedValue))
                .code("field.type.mismatch")
                .constraint("TypeMatch")
                .helpMessage(getTypeHelpMessage(requiredType))
                .build();

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("요청 파라미터의 타입이 올바르지 않습니다")
                .withTimestamp()
                .withErrorId("TYPE_MISMATCH")
                .fieldErrors(List.of(fieldError))
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("expectedType", requiredType != null ? requiredType.getSimpleName() : "unknown")
                .build();

        return ResponseEntity.badRequest().body(errorDetails);
    }

    /**
     * 필수 파라미터 누락 예외 처리
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ValidationErrorDetails> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        
        log.warn("필수 파라미터 누락: {} - URI: {}", ex.getParameterName(), request.getRequestURI());

        ValidationErrorDetails.FieldError fieldError = validationErrorBuilder
                .requiredField(ex.getParameterName());

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("필수 요청 파라미터가 누락되었습니다")
                .withTimestamp()
                .withErrorId("MISSING_PARAM")
                .fieldErrors(List.of(fieldError))
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("parameterType", ex.getParameterType())
                .build();

        return ResponseEntity.badRequest().body(errorDetails);
    }

    /**
     * HTTP 메시지 읽기 오류 처리
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ValidationErrorDetails> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        
        log.warn("HTTP 메시지 읽기 오류 - URI: {}", request.getRequestURI());

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("요청 본문을 읽을 수 없습니다")
                .withTimestamp()
                .withErrorId("MESSAGE_NOT_READABLE")
                .addGlobalError("JSON 형식이 올바르지 않거나 필수 필드가 누락되었습니다", 
                              "message.not.readable", 
                              ValidationErrorDetails.ErrorType.DATA_INTEGRITY_VIOLATION)
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("contentType", request.getContentType())
                .build();

        return ResponseEntity.badRequest().body(errorDetails);
    }

    /**
     * 데이터 무결성 위반 예외 처리
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ValidationErrorDetails> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        
        log.error("데이터 무결성 위반 - URI: {}", request.getRequestURI(), ex);

        // 보안상 상세한 데이터베이스 오류는 노출하지 않음
        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("데이터 처리 중 오류가 발생했습니다")
                .withTimestamp()
                .withErrorId("DATA_INTEGRITY")
                .addGlobalError("중복된 데이터이거나 참조 무결성 제약 조건을 위반했습니다", 
                              "data.integrity.violation", 
                              ValidationErrorDetails.ErrorType.DATA_INTEGRITY_VIOLATION)
                .addMetadata("requestUri", request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
    }

    /**
     * 인증 예외 처리
     */
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<ValidationErrorDetails> handleAuthenticationException(
            Exception ex, HttpServletRequest request) {
        
        log.warn("인증 실패 - URI: {} - IP: {}", 
                request.getRequestURI(), SecurityUtil.getClientIpAddress(request));

        // 구조화된 보안 이벤트 발행
        publishSecurityEvent(ex, request, "AUTH_FAILURE", "인증 정보가 올바르지 않음");

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("인증에 실패했습니다")
                .withTimestamp()
                .withErrorId("AUTH_FAILED")
                .addGlobalError("사용자 인증 정보가 올바르지 않습니다", 
                              "authentication.failed", 
                              ValidationErrorDetails.ErrorType.SECURITY_VIOLATION)
                .addMetadata("requestUri", request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
    }

    /**
     * 권한 부족 예외 처리
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ValidationErrorDetails> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        
        log.warn("접근 권한 부족 - URI: {} - IP: {}", 
                request.getRequestURI(), SecurityUtil.getClientIpAddress(request));

        // 구조화된 보안 이벤트 발행
        publishSecurityEvent(ex, request, "ACCESS_DENIED", "리소스 접근 권한 부족");

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("접근 권한이 없습니다")
                .withTimestamp()
                .withErrorId("ACCESS_DENIED")
                .addGlobalError("이 리소스에 접근할 권한이 없습니다", 
                              "access.denied", 
                              ValidationErrorDetails.ErrorType.PERMISSION_DENIED)
                .addMetadata("requestUri", request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorDetails);
    }

    /**
     * HTTP 메서드 미지원 예외 처리
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ValidationErrorDetails> handleHttpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        
        log.warn("지원하지 않는 HTTP 메서드: {} - URI: {}", ex.getMethod(), request.getRequestURI());

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("지원하지 않는 HTTP 메서드입니다")
                .withTimestamp()
                .withErrorId("METHOD_NOT_SUPPORTED")
                .addGlobalError(String.format("이 엔드포인트는 %s 메서드를 지원하지 않습니다. 지원되는 메서드: %s", 
                                             ex.getMethod(), Arrays.toString(ex.getSupportedMethods())), 
                              "method.not.supported", 
                              ValidationErrorDetails.ErrorType.BUSINESS_RULE_VIOLATION)
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("requestMethod", ex.getMethod())
                .addMetadata("supportedMethods", ex.getSupportedMethods())
                .build();

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(errorDetails);
    }

    /**
     * 핸들러 없음 예외 처리 (404)
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ValidationErrorDetails> handleNoHandlerFoundException(
            NoHandlerFoundException ex, HttpServletRequest request) {
        
        log.warn("핸들러 없음: {} {} - IP: {}", 
                ex.getHttpMethod(), ex.getRequestURL(), SecurityUtil.getClientIpAddress(request));

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("요청한 리소스를 찾을 수 없습니다")
                .withTimestamp()
                .withErrorId("NOT_FOUND")
                .addGlobalError("요청한 URL이 존재하지 않거나 더 이상 사용되지 않습니다", 
                              "resource.not.found", 
                              ValidationErrorDetails.ErrorType.RESOURCE_NOT_FOUND)
                .addMetadata("requestUri", ex.getRequestURL())
                .addMetadata("httpMethod", ex.getHttpMethod())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDetails);
    }

    /**
     * 일반 예외 처리 (최후 수단)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ValidationErrorDetails> handleGeneralException(
            Exception ex, HttpServletRequest request) {
        
        String errorId = "ERR-" + UUID.randomUUID().toString().substring(0, 8);
        log.error("예상치 못한 오류 발생 [{}] - URI: {}", errorId, request.getRequestURI(), ex);

        // 구조화된 에러 이벤트 발행
        publishErrorEvent(ex, request, "TECHNICAL");

        ValidationErrorDetails errorDetails = validationErrorBuilder
                .create("내부 서버 오류가 발생했습니다")
                .withTimestamp()
                .errorId(errorId)
                .addGlobalError("시스템에서 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요", 
                              "internal.server.error", 
                              ValidationErrorDetails.ErrorType.EXTERNAL_SERVICE_ERROR)
                .addMetadata("requestUri", request.getRequestURI())
                .addMetadata("errorId", errorId)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDetails);
    }

    // ===== 헬퍼 메서드들 =====

    /**
     * 상세한 필드 오류 생성
     */
    private ValidationErrorDetails.FieldError createDetailedFieldError(FieldError fieldError) {
        String field = fieldError.getField();
        Object rejectedValue = fieldError.getRejectedValue();
        String code = fieldError.getCode();
        String message = fieldError.getDefaultMessage();

        // 코드에 따른 상세 오류 정보 생성
        return switch (code != null ? code : "") {
            case "NotNull", "NotEmpty", "NotBlank" -> validationErrorBuilder.requiredField(field);
            case "Size" -> createSizeFieldError(field, rejectedValue, fieldError);
            case "Min", "Max", "Range" -> createRangeFieldError(field, rejectedValue, fieldError);
            case "Email" -> validationErrorBuilder.invalidEmail(field, rejectedValue);
            case "Pattern" -> createPatternFieldError(field, rejectedValue, fieldError);
            default -> ValidationErrorDetails.FieldError.builder()
                    .field(field)
                    .rejectedValue(rejectedValue)
                    .message(message != null ? message : field + " 값이 유효하지 않습니다")
                    .code("field.invalid")
                    .constraint(code)
                    .build();
        };
    }

    /**
     * 제약 조건 위반 필드 오류 생성
     */
    private ValidationErrorDetails.FieldError createConstraintFieldError(
            String fieldName, Object rejectedValue, String message, String constraintType,
            ConstraintViolation<?> violation) {
        
        return switch (constraintType) {
            case "NotNull" -> validationErrorBuilder.requiredField(fieldName);
            case "Size" -> {
                Integer min = (Integer) violation.getConstraintDescriptor().getAttributes().get("min");
                Integer max = (Integer) violation.getConstraintDescriptor().getAttributes().get("max");
                yield validationErrorBuilder.stringLength(fieldName, rejectedValue, min, max);
            }
            case "Min", "Max" -> {
                Long min = (Long) violation.getConstraintDescriptor().getAttributes().get("value");
                yield validationErrorBuilder.numberRange(fieldName, rejectedValue, min, null);
            }
            case "Email" -> validationErrorBuilder.invalidEmail(fieldName, rejectedValue);
            case "Pattern" -> {
                String pattern = (String) violation.getConstraintDescriptor().getAttributes().get("regexp");
                yield validationErrorBuilder.patternMismatch(fieldName, rejectedValue, pattern, message);
            }
            default -> ValidationErrorDetails.FieldError.builder()
                    .field(fieldName)
                    .rejectedValue(rejectedValue)
                    .message(message)
                    .code("field.constraint.violation")
                    .constraint(constraintType)
                    .build();
        };
    }

    private ValidationErrorDetails.FieldError createSizeFieldError(String field, Object rejectedValue, FieldError fieldError) {
        // Size 어노테이션의 min, max 값을 추출하려고 시도하지만, 
        // FieldError에서는 직접 접근이 어려우므로 기본값 사용
        return validationErrorBuilder.stringLength(field, rejectedValue, null, null);
    }

    private ValidationErrorDetails.FieldError createRangeFieldError(String field, Object rejectedValue, FieldError fieldError) {
        // 범위 정보를 추출하려고 시도하지만, 기본값 사용
        return validationErrorBuilder.numberRange(field, rejectedValue, null, null);
    }

    private ValidationErrorDetails.FieldError createPatternFieldError(String field, Object rejectedValue, FieldError fieldError) {
        return validationErrorBuilder.patternMismatch(field, rejectedValue, "", fieldError.getDefaultMessage());
    }

    private String getTypeHelpMessage(Class<?> requiredType) {
        if (requiredType == null) return "올바른 형식으로 입력해주세요";
        
        return switch (requiredType.getSimpleName()) {
            case "Integer", "int" -> "정수 값을 입력해주세요 (예: 123)";
            case "Long", "long" -> "정수 값을 입력해주세요 (예: 123)";
            case "Double", "double", "Float", "float" -> "숫자 값을 입력해주세요 (예: 123.45)";
            case "Boolean", "boolean" -> "true 또는 false를 입력해주세요";
            case "LocalDate" -> "날짜 형식으로 입력해주세요 (예: 2024-01-01)";
            case "LocalDateTime" -> "날짜시간 형식으로 입력해주세요 (예: 2024-01-01T10:00:00)";
            default -> "올바른 " + requiredType.getSimpleName() + " 형식으로 입력해주세요";
        };
    }

    // ===== 이벤트 발행 헬퍼 메서드들 =====

    /**
     * 에러 이벤트 발행
     */
    private void publishErrorEvent(Exception ex, HttpServletRequest request, String errorCategory) {
        try {
            String traceId = MDC.get("traceId");
            String eventId = "ERR-" + UUID.randomUUID().toString().substring(0, 8);
            
            ErrorEvent errorEvent = ErrorEvent.builder()
                    .source(this)
                    .eventId(eventId)
                    .traceId(traceId)
                    .errorType(ex.getClass().getSimpleName())
                    .errorMessage(ex.getMessage())
                    .stackTrace(getStackTraceString(ex))
                    .methodName(extractMethodName(ex))
                    .className(extractClassName(ex))
                    .requestUri(request.getRequestURI())
                    .httpMethod(request.getMethod())
                    .userEmail(getCurrentUserEmail())
                    .clientIp(SecurityUtil.getClientIpAddress(request))
                    .executionTimeMs(null) // 예외 처리 시점에서는 알 수 없음
                    .requestParameters(extractRequestParameters(request))
                    .errorCategory(errorCategory)
                    .build();

            eventPublisher.publishEvent(errorEvent);
            
        } catch (Exception eventEx) {
            log.warn("ErrorEvent 발행 실패", eventEx);
        }
    }

    /**
     * 보안 이벤트 발행
     */
    private void publishSecurityEvent(Exception ex, HttpServletRequest request, 
                                    String securityEventType, String failureReason) {
        try {
            String traceId = MDC.get("traceId");
            String eventId = "SEC-" + UUID.randomUUID().toString().substring(0, 8);
            
            SecurityEvent securityEvent = SecurityEvent.builder()
                    .source(this)
                    .eventId(eventId)
                    .traceId(traceId)
                    .securityEventType(securityEventType)
                    .userEmail(getCurrentUserEmail())
                    .clientIp(SecurityUtil.getClientIpAddress(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .requestUri(request.getRequestURI())
                    .httpMethod(request.getMethod())
                    .failureReason(failureReason)
                    .attemptedResource(request.getRequestURI())
                    .sessionId(request.getSession(false) != null ? 
                               request.getSession(false).getId() : null)
                    .build();

            eventPublisher.publishEvent(securityEvent);
            
        } catch (Exception eventEx) {
            log.warn("SecurityEvent 발행 실패", eventEx);
        }
    }

    private String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // 인증 정보 조회 실패 시 무시
        }
        return null;
    }

    private String getStackTraceString(Exception ex) {
        if (ex == null) return null;
        
        StringBuilder sb = new StringBuilder();
        sb.append(ex.toString()).append("\n");
        
        StackTraceElement[] elements = ex.getStackTrace();
        int maxLines = Math.min(10, elements.length); // 스택 트레이스 제한
        
        for (int i = 0; i < maxLines; i++) {
            sb.append("\tat ").append(elements[i].toString()).append("\n");
        }
        
        if (elements.length > maxLines) {
            sb.append("\t... ").append(elements.length - maxLines).append(" more\n");
        }
        
        return sb.toString();
    }

    private String extractMethodName(Exception ex) {
        StackTraceElement[] elements = ex.getStackTrace();
        if (elements.length > 0) {
            return elements[0].getMethodName();
        }
        return "unknown";
    }

    private String extractClassName(Exception ex) {
        StackTraceElement[] elements = ex.getStackTrace();
        if (elements.length > 0) {
            String className = elements[0].getClassName();
            return className.substring(className.lastIndexOf('.') + 1);
        }
        return "unknown";
    }

    private Map<String, Object> extractRequestParameters(HttpServletRequest request) {
        Map<String, Object> params = new HashMap<>();
        
        // Query parameters 추출
        if (request.getParameterMap() != null) {
            request.getParameterMap().forEach((key, values) -> {
                if (values.length == 1) {
                    params.put(key, sanitizeParameterValue(key, values[0]));
                } else {
                    params.put(key, Arrays.stream(values)
                            .map(v -> sanitizeParameterValue(key, v))
                            .toArray(String[]::new));
                }
            });
        }
        
        return params;
    }

    private String sanitizeParameterValue(String key, String value) {
        if (value == null) return null;
        
        String lowerKey = key.toLowerCase();
        if (lowerKey.contains("password") || lowerKey.contains("secret") || 
            lowerKey.contains("token") || lowerKey.contains("key")) {
            return "[PROTECTED]";
        }
        
        // 값이 너무 긴 경우 자르기
        if (value.length() > 100) {
            return value.substring(0, 100) + "...";
        }
        
        return value;
    }
}