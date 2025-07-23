package com.globalcarelink.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.BadRequest.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(CustomException.BadRequest ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("잘못된 요청 - ID: {}, URI: {}, 메시지: {}", errorId, request.getRequestURI(), ex.getMessage());
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(CustomException.NotFound.class)
    public ResponseEntity<ErrorResponse> handleNotFound(CustomException.NotFound ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.info("리소스 없음 - ID: {}, URI: {}, 메시지: {}", errorId, request.getRequestURI(), ex.getMessage());
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message("요청한 리소스를 찾을 수 없습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(CustomException.Unauthorized.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(CustomException.Unauthorized ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("인증 실패 - ID: {}, URI: {}, IP: {}", errorId, request.getRequestURI(), getClientIP(request));
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message("인증이 필요합니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(CustomException.Forbidden.class)
    public ResponseEntity<ErrorResponse> handleForbidden(CustomException.Forbidden ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("접근 권한 없음 - ID: {}, URI: {}, IP: {}", errorId, request.getRequestURI(), getClientIP(request));
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.FORBIDDEN.value())
                .error("Forbidden")
                .message("접근 권한이 없습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("Spring Security 접근 거부 - ID: {}, URI: {}, IP: {}", errorId, request.getRequestURI(), getClientIP(request));
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.FORBIDDEN.value())
                .error("Access Denied")
                .message("접근 권한이 없습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("잘못된 인증 정보 - ID: {}, URI: {}, IP: {}", errorId, request.getRequestURI(), getClientIP(request));
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Bad Credentials")
                .message("인증 정보가 올바르지 않습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("유효성 검증 실패 - ID: {}, URI: {}", errorId, request.getRequestURI());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("입력 값이 올바르지 않습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .details(errors)
                .build();
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(BindException ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("바인딩 오류 - ID: {}, URI: {}", errorId, request.getRequestURI());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Binding Error")
                .message("요청 데이터 바인딩에 실패했습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .details(errors)
                .build();
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("제약 조건 위반 - ID: {}, URI: {}", errorId, request.getRequestURI());
        
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> 
            errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Constraint Violation")
                .message("데이터 제약 조건을 위반했습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .details(errors)
                .build();
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.warn("타입 불일치 - ID: {}, URI: {}, 파라미터: {}", errorId, request.getRequestURI(), ex.getName());
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Type Mismatch")
                .message("요청 파라미터 타입이 올바르지 않습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.error("데이터 무결성 위반 - ID: {}, URI: {}", errorId, request.getRequestURI(), ex);
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.CONFLICT.value())
                .error("Data Integrity Violation")
                .message("데이터 무결성 제약을 위반했습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.error("예상치 못한 오류 발생 - ID: {}, URI: {}", errorId, request.getRequestURI(), ex);
        
        ErrorResponse response = ErrorResponse.builder()
                .errorId(errorId)
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("서버 내부 오류가 발생했습니다")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class ErrorResponse {
        private String errorId;
        private int status;
        private String error;
        private String message;
        private String path;
        private LocalDateTime timestamp;
        private Map<String, String> details;
    }
}