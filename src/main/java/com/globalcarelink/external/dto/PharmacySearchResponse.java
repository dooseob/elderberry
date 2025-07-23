package com.globalcarelink.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 약국 정보 검색 API 응답 DTO
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PharmacySearchResponse {
    
    @JsonProperty("response")
    private Response response;
    
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        
        @JsonProperty("header")
        private Header header;
        
        @JsonProperty("body")
        private Body body;
        
        @Data
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Header {
            
            @JsonProperty("resultCode")
            private String resultCode;
            
            @JsonProperty("resultMsg")
            private String resultMsg;
        }
        
        @Data
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Body {
            
            @JsonProperty("items")
            private List<Pharmacy> items;
            
            @JsonProperty("numOfRows")
            private Integer numOfRows;
            
            @JsonProperty("pageNo")
            private Integer pageNo;
            
            @JsonProperty("totalCount")
            private Integer totalCount;
        }
    }
    
    /**
     * 약국 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Pharmacy {
        
        /**
         * 약국 코드
         */
        @JsonProperty("dutyName")
        private String pharmacyName;
        
        /**
         * 약국 주소
         */
        @JsonProperty("dutyAddr")
        private String address;
        
        /**
         * 약국 전화번호
         */
        @JsonProperty("dutyTel1")
        private String phoneNumber;
        
        /**
         * 약국 응급 전화번호
         */
        @JsonProperty("dutyTel3")
        private String emergencyPhoneNumber;
        
        /**
         * 약국 구분
         */
        @JsonProperty("dutyDiv")
        private String pharmacyType;
        
        /**
         * 약국 구분명
         */
        @JsonProperty("dutyDivNam")
        private String pharmacyTypeName;
        
        /**
         * 시도 코드
         */
        @JsonProperty("Q0")
        private String sidoCode;
        
        /**
         * 시군구 코드
         */
        @JsonProperty("Q1")
        private String sigunguCode;
        
        /**
         * 경도
         */
        @JsonProperty("wgs84Lon")
        private Double longitude;
        
        /**
         * 위도
         */
        @JsonProperty("wgs84Lat")
        private Double latitude;
        
        /**
         * 우편번호
         */
        @JsonProperty("postCdn1")
        private String postalCode1;
        
        /**
         * 우편번호2
         */
        @JsonProperty("postCdn2")
        private String postalCode2;
        
        /**
         * 월요일 운영시간
         */
        @JsonProperty("dutyTime1s")
        private String mondayStartTime;
        
        @JsonProperty("dutyTime1c")
        private String mondayEndTime;
        
        /**
         * 화요일 운영시간
         */
        @JsonProperty("dutyTime2s")
        private String tuesdayStartTime;
        
        @JsonProperty("dutyTime2c")
        private String tuesdayEndTime;
        
        /**
         * 수요일 운영시간
         */
        @JsonProperty("dutyTime3s")
        private String wednesdayStartTime;
        
        @JsonProperty("dutyTime3c")
        private String wednesdayEndTime;
        
        /**
         * 목요일 운영시간
         */
        @JsonProperty("dutyTime4s")
        private String thursdayStartTime;
        
        @JsonProperty("dutyTime4c")
        private String thursdayEndTime;
        
        /**
         * 금요일 운영시간
         */
        @JsonProperty("dutyTime5s")
        private String fridayStartTime;
        
        @JsonProperty("dutyTime5c")
        private String fridayEndTime;
        
        /**
         * 토요일 운영시간
         */
        @JsonProperty("dutyTime6s")
        private String saturdayStartTime;
        
        @JsonProperty("dutyTime6c")
        private String saturdayEndTime;
        
        /**
         * 일요일 운영시간
         */
        @JsonProperty("dutyTime7s")
        private String sundayStartTime;
        
        @JsonProperty("dutyTime7c")
        private String sundayEndTime;
        
        /**
         * 공휴일 운영시간
         */
        @JsonProperty("dutyTime8s")
        private String holidayStartTime;
        
        @JsonProperty("dutyTime8c")
        private String holidayEndTime;
        
        /**
         * 24시간 운영 여부
         */
        @JsonProperty("dutyInf")
        private String operatingInfo;
        
        /**
         * 기관 설명
         */
        @JsonProperty("dutyEtc")
        private String description;
        
        /**
         * 기관ID
         */
        @JsonProperty("hpid")
        private String institutionId;
        
        /**
         * 데이터 갱신 일시
         */
        @JsonProperty("dutyMapimg")
        private String lastUpdated;
    }
} 