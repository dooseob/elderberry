package com.globalcarelink.external;

import org.springframework.http.HttpStatus;

/**
 * 공공데이터 API 호출 시 발생하는 예외를 처리하기 위한 커스텀 예외 클래스
 */
public class PublicDataApiException extends RuntimeException {
    
    private final HttpStatus httpStatus;
    private final String apiEndpoint;
    private final String errorCode;
    
    /**
     * 기본 생성자
     * 
     * @param message 에러 메시지
     */
    public PublicDataApiException(String message) {
        super(message);
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.apiEndpoint = null;
        this.errorCode = null;
    }
    
    /**
     * HTTP 상태 코드를 포함한 생성자
     * 
     * @param message 에러 메시지
     * @param httpStatus HTTP 상태 코드
     */
    public PublicDataApiException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
        this.apiEndpoint = null;
        this.errorCode = null;
    }
    
    /**
     * 상세 정보를 포함한 생성자
     * 
     * @param message 에러 메시지
     * @param httpStatus HTTP 상태 코드
     * @param apiEndpoint API 엔드포인트
     * @param errorCode 에러 코드
     */
    public PublicDataApiException(String message, HttpStatus httpStatus, String apiEndpoint, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.apiEndpoint = apiEndpoint;
        this.errorCode = errorCode;
    }
    
    /**
     * 원인 예외를 포함한 생성자
     * 
     * @param message 에러 메시지
     * @param cause 원인 예외
     */
    public PublicDataApiException(String message, Throwable cause) {
        super(message, cause);
        this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        this.apiEndpoint = null;
        this.errorCode = null;
    }
    
    /**
     * 모든 정보를 포함한 생성자
     * 
     * @param message 에러 메시지
     * @param cause 원인 예외
     * @param httpStatus HTTP 상태 코드
     * @param apiEndpoint API 엔드포인트
     * @param errorCode 에러 코드
     */
    public PublicDataApiException(String message, Throwable cause, HttpStatus httpStatus, String apiEndpoint, String errorCode) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.apiEndpoint = apiEndpoint;
        this.errorCode = errorCode;
    }
    
    /**
     * HTTP 상태 코드 반환
     * 
     * @return HTTP 상태 코드
     */
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    /**
     * API 엔드포인트 반환
     * 
     * @return API 엔드포인트
     */
    public String getApiEndpoint() {
        return apiEndpoint;
    }
    
    /**
     * 에러 코드 반환
     * 
     * @return 에러 코드
     */
    public String getErrorCode() {
        return errorCode;
    }
    
    /**
     * 상세 에러 정보를 포함한 메시지 반환
     * 
     * @return 상세 에러 메시지
     */
    public String getDetailedMessage() {
        StringBuilder sb = new StringBuilder(getMessage());
        
        if (errorCode != null) {
            sb.append(" [에러코드: ").append(errorCode).append("]");
        }
        
        if (httpStatus != null) {
            sb.append(" [HTTP 상태: ").append(httpStatus.value()).append(" ").append(httpStatus.getReasonPhrase()).append("]");
        }
        
        if (apiEndpoint != null) {
            sb.append(" [API: ").append(apiEndpoint).append("]");
        }
        
        return sb.toString();
    }
    
    @Override
    public String toString() {
        return "PublicDataApiException{" +
                "message='" + getMessage() + '\'' +
                ", httpStatus=" + httpStatus +
                ", apiEndpoint='" + apiEndpoint + '\'' +
                ", errorCode='" + errorCode + '\'' +
                '}';
    }
} 