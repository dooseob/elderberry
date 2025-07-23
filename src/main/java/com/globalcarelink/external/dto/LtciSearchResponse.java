package com.globalcarelink.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 장기요양기관 검색 API 응답 DTO
 * 공공데이터 포털의 표준 응답 구조에 맞춰 설계된 클래스
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LtciSearchResponse {
    
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
            private List<LtciInstitution> items;
            
            @JsonProperty("numOfRows")
            private Integer numOfRows;
            
            @JsonProperty("pageNo")
            private Integer pageNo;
            
            @JsonProperty("totalCount")
            private Integer totalCount;
        }
    }
    
    /**
     * 장기요양기관 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LtciInstitution {
        
        /**
         * 기관 코드
         */
        @JsonProperty("ltcInsttCd")
        private String institutionCode;
        
        /**
         * 기관명
         */
        @JsonProperty("ltcInsttNm")
        private String institutionName;
        
        /**
         * 시설 종류
         */
        @JsonProperty("ltcInsttType")
        private String institutionType;
        
        /**
         * 시설 종류명
         */
        @JsonProperty("ltcInsttTypeNm")
        private String institutionTypeName;
        
        /**
         * 주소
         */
        @JsonProperty("addr")
        private String address;
        
        /**
         * 상세 주소
         */
        @JsonProperty("detailAddr")
        private String detailAddress;
        
        /**
         * 전화번호
         */
        @JsonProperty("telno")
        private String phoneNumber;
        
        /**
         * 팩스번호
         */
        @JsonProperty("faxno")
        private String faxNumber;
        
        /**
         * 홈페이지 URL
         */
        @JsonProperty("hmpgUrl")
        private String homepageUrl;
        
        /**
         * 시도 코드
         */
        @JsonProperty("sidoCd")
        private String sidoCode;
        
        /**
         * 시도명
         */
        @JsonProperty("sidoNm")
        private String sidoName;
        
        /**
         * 시군구 코드
         */
        @JsonProperty("sigunguCd")
        private String sigunguCode;
        
        /**
         * 시군구명
         */
        @JsonProperty("sigunguNm")
        private String sigunguName;
        
        /**
         * 위도
         */
        @JsonProperty("latitude")
        private Double latitude;
        
        /**
         * 경도
         */
        @JsonProperty("longitude")
        private Double longitude;
        
        /**
         * 정원 수
         */
        @JsonProperty("capacity")
        private Integer capacity;
        
        /**
         * 현재 입소자 수
         */
        @JsonProperty("currentOccupancy")
        private Integer currentOccupancy;
        
        /**
         * 개설일
         */
        @JsonProperty("openDate")
        private String openDate;
        
        /**
         * 운영 상태 (1: 운영, 0: 폐업)
         */
        @JsonProperty("operationStatus")
        private String operationStatus;
        
        /**
         * 평가 등급 (A, B, C, D, E)
         */
        @JsonProperty("evaluationGrade")
        private String evaluationGrade;
        
        /**
         * 평가 점수
         */
        @JsonProperty("evaluationScore")
        private Double evaluationScore;
        
        /**
         * 월 기본료 (원)
         */
        @JsonProperty("monthlyBasicFee")
        private Integer monthlyBasicFee;
        
        /**
         * 입소 가능 등급 (1-5등급)
         */
        @JsonProperty("availableGrades")
        private String availableGrades;
        
        /**
         * 전문 서비스 (치매, 재활 등)
         */
        @JsonProperty("specialServices")
        private String specialServices;
        
        /**
         * 편의시설 정보
         */
        @JsonProperty("amenities")
        private String amenities;
        
        /**
         * 의료진 정보
         */
        @JsonProperty("medicalStaff")
        private String medicalStaff;
        
        /**
         * 마지막 업데이트 일시
         */
        @JsonProperty("lastUpdated")
        private String lastUpdated;
    }
} 