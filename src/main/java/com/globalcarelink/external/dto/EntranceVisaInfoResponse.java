package com.globalcarelink.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 외교부 국가·지역별 입국허가요건 API 응답 DTO
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EntranceVisaInfoResponse {
    
    @JsonProperty("response")
    private ResponseInfo response;
    
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseInfo {
        
        @JsonProperty("header")
        private HeaderInfo header;
        
        @JsonProperty("body")
        private BodyInfo body;
        
        @Data
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class HeaderInfo {
            
            @JsonProperty("resultCode")
            private String resultCode;
            
            @JsonProperty("resultMsg")
            private String resultMsg;
        }
        
        @Data
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class BodyInfo {
            
            @JsonProperty("items")
            private List<EntranceVisaRequirement> items;
            
            @JsonProperty("numOfRows")
            private Integer numOfRows;
            
            @JsonProperty("pageNo")
            private Integer pageNo;
            
            @JsonProperty("totalCount")
            private Integer totalCount;
        }
    }
    
    /**
     * API 응답이 성공인지 확인
     */
    public boolean isSuccess() {
        return response != null && 
               response.getHeader() != null && 
               "00".equals(response.getHeader().getResultCode());
    }
    
    /**
     * 입국허가요건 목록 조회
     */
    public List<EntranceVisaRequirement> getVisaRequirements() {
        if (response != null && response.getBody() != null) {
            return response.getBody().getItems();
        }
        return List.of();
    }
    
    /**
     * 전체 결과 수 조회
     */
    public int getTotalCount() {
        if (response != null && response.getBody() != null && response.getBody().getTotalCount() != null) {
            return response.getBody().getTotalCount();
        }
        return 0;
    }
    
    /**
     * 에러 메시지 조회
     */
    public String getErrorMessage() {
        if (response != null && response.getHeader() != null) {
            return response.getHeader().getResultMsg();
        }
        return "알 수 없는 오류가 발생했습니다";
    }
} 