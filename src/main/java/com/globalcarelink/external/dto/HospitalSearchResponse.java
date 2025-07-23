package com.globalcarelink.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 병원 정보 검색 API 응답 DTO
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HospitalSearchResponse {
    
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
            private List<Hospital> items;
            
            @JsonProperty("numOfRows")
            private Integer numOfRows;
            
            @JsonProperty("pageNo")
            private Integer pageNo;
            
            @JsonProperty("totalCount")
            private Integer totalCount;
        }
    }
    
    /**
     * 병원 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Hospital {
        
        /**
         * 요양기관기호
         */
        @JsonProperty("ykiho")
        private String ykiho;
        
        /**
         * 요양기관명
         */
        @JsonProperty("yadmNm")
        private String hospitalName;
        
        /**
         * 종별코드
         */
        @JsonProperty("clCd")
        private String hospitalTypeCode;
        
        /**
         * 종별코드명
         */
        @JsonProperty("clCdNm")
        private String hospitalTypeName;
        
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
         * 읍면동코드
         */
        @JsonProperty("emdongCd")
        private String emdongCode;
        
        /**
         * 읍면동코드명
         */
        @JsonProperty("emdongNm")
        private String emdongName;
        
        /**
         * 우편번호
         */
        @JsonProperty("postNo")
        private String postalCode;
        
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
         * 홈페이지
         */
        @JsonProperty("hospUrl")
        private String websiteUrl;
        
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
         * 간병인수
         */
        @JsonProperty("nurCnt")
        private Integer nurseCount;
        
        /**
         * 응급실 운영 여부
         */
        @JsonProperty("erYn")
        private String emergencyRoomAvailable;
        
        /**
         * CT 보유 여부
         */
        @JsonProperty("ctYn")
        private String ctAvailable;
        
        /**
         * MRI 보유 여부
         */
        @JsonProperty("mriYn")
        private String mriAvailable;
        
        /**
         * PET 보유 여부
         */
        @JsonProperty("petYn")
        private String petAvailable;
        
        /**
         * 혈관조영기 보유 여부
         */
        @JsonProperty("angioYn")
        private String angioAvailable;
        
        /**
         * 감마나이프 보유 여부
         */
        @JsonProperty("gammaYn")
        private String gammaKnifeAvailable;
        
        /**
         * 입원실 구분
         */
        @JsonProperty("inptRoomDiv")
        private String inpatientRoomType;
        
        /**
         * 좌표(X)
         */
        @JsonProperty("XPos")
        private Double longitude;
        
        /**
         * 좌표(Y)
         */
        @JsonProperty("YPos")
        private Double latitude;
        
        /**
         * 진료과목
         */
        @JsonProperty("dgsbjtCd")
        private String medicalDepartments;
        
        /**
         * 특수진료과목
         */
        @JsonProperty("spcDgsbjtCd")
        private String specializedDepartments;
        
        /**
         * 설립구분
         */
        @JsonProperty("estbDiv")
        private String establishmentType;
        
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
    }
} 