package com.globalcarelink.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 요양기관 운영 상태 API 응답 DTO
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FacilityStatusResponse {
    
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
            private List<FacilityStatus> items;
            
            @JsonProperty("numOfRows")
            private Integer numOfRows;
            
            @JsonProperty("pageNo")
            private Integer pageNo;
            
            @JsonProperty("totalCount")
            private Integer totalCount;
        }
    }
    
    /**
     * 요양기관 운영 상태 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FacilityStatus {
        
        /**
         * 요양기관기호
         */
        @JsonProperty("ykiho")
        private String institutionCode;
        
        /**
         * 요양기관명
         */
        @JsonProperty("yadmNm")
        private String institutionName;
        
        /**
         * 종별코드
         */
        @JsonProperty("clCd")
        private String facilityTypeCode;
        
        /**
         * 종별코드명
         */
        @JsonProperty("clCdNm")
        private String facilityTypeName;
        
        /**
         * 시도코드
         */
        @JsonProperty("sidoCd")
        private String sidoCode;
        
        /**
         * 시도코드명
         */
        @JsonProperty("sidoCdNm")
        private String sidoName;
        
        /**
         * 시군구코드
         */
        @JsonProperty("sgguCd")
        private String sigunguCode;
        
        /**
         * 시군구코드명
         */
        @JsonProperty("sgguCdNm")
        private String sigunguName;
        
        /**
         * 개설일자
         */
        @JsonProperty("estbDd")
        private String establishmentDate;
        
        /**
         * 폐업일자
         */
        @JsonProperty("clsgDt")
        private String closureDate;
        
        /**
         * 휴업시작일자
         */
        @JsonProperty("rstde")
        private String suspensionStartDate;
        
        /**
         * 휴업종료일자
         */
        @JsonProperty("rstdeEnd")
        private String suspensionEndDate;
        
        /**
         * 재개업일자
         */
        @JsonProperty("reestbDd")
        private String reopeningDate;
        
        /**
         * 운영상태 (1: 정상운영, 2: 휴업, 3: 폐업)
         */
        @JsonProperty("opnSfStmak")
        private String operationStatus;
        
        /**
         * 운영상태명
         */
        @JsonProperty("opnSfStmakNm")
        private String operationStatusName;
        
        /**
         * 주소
         */
        @JsonProperty("addr")
        private String address;
        
        /**
         * 전화번호
         */
        @JsonProperty("telno")
        private String phoneNumber;
        
        /**
         * 대표자명
         */
        @JsonProperty("rprsntvNm")
        private String representativeName;
        
        /**
         * 사업자등록번호
         */
        @JsonProperty("bsnsRgstNo")
        private String businessRegistrationNumber;
        
        /**
         * 허가번호
         */
        @JsonProperty("prmsnNo")
        private String licenseNumber;
        
        /**
         * 허가일자
         */
        @JsonProperty("prmsnDt")
        private String licenseDate;
        
        /**
         * 변경일자
         */
        @JsonProperty("chgDt")
        private String changeDate;
        
        /**
         * 변경사유
         */
        @JsonProperty("chgRsn")
        private String changeReason;
        
        /**
         * 총정원
         */
        @JsonProperty("totCrcp")
        private Integer totalCapacity;
        
        /**
         * 현재입원환자수
         */
        @JsonProperty("curPtnts")
        private Integer currentPatients;
        
        /**
         * 병상수
         */
        @JsonProperty("bedCnt")
        private Integer bedCount;
        
        /**
         * 의사수
         */
        @JsonProperty("docCnt")
        private Integer doctorCount;
        
        /**
         * 간호사수
         */
        @JsonProperty("nurCnt")
        private Integer nurseCount;
        
        /**
         * 기타직원수
         */
        @JsonProperty("etcCnt")
        private Integer otherStaffCount;
        
        /**
         * 데이터 기준일자
         */
        @JsonProperty("stdrDt")
        private String standardDate;
    }
} 