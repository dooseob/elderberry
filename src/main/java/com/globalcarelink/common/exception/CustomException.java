package com.globalcarelink.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException extends RuntimeException {
    
    private final HttpStatus status;
    
    public CustomException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
    
    public static class Unauthorized extends CustomException {
        public Unauthorized(String message) {
            super(message, HttpStatus.UNAUTHORIZED);
        }
    }
    
    public static class Forbidden extends CustomException {
        public Forbidden(String message) {
            super(message, HttpStatus.FORBIDDEN);
        }
    }
    
    public static class NotFound extends CustomException {
        public NotFound(String message) {
            super(message, HttpStatus.NOT_FOUND);
        }
    }
    
    public static class BadRequest extends CustomException {
        public BadRequest(String message) {
            super(message, HttpStatus.BAD_REQUEST);
        }
    }
    
    public static class Conflict extends CustomException {
        public Conflict(String message) {
            super(message, HttpStatus.CONFLICT);
        }
    }
}