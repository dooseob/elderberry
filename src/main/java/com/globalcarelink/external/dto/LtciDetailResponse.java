package com.globalcarelink.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 장기요양기관 상세 정보 API 응답 DTO
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LtciDetailResponse {
    
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
            
            @JsonProperty("item")
            private LtciInstitutionDetail item;
        }
    }
    
    /**
     * 장기요양기관 상세 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LtciInstitutionDetail {
        
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
         * 시설 종류 상세
         */
        @JsonProperty("ltcInsttTypeDetail")
        private String institutionTypeDetail;
        
        /**
         * 대표자명
         */
        @JsonProperty("representativeName")
        private String representativeName;
        
        /**
         * 사업자등록번호
         */
        @JsonProperty("businessRegistrationNumber")
        private String businessRegistrationNumber;
        
        /**
         * 개설허가일
         */
        @JsonProperty("establishmentDate")
        private String establishmentDate;
        
        /**
         * 총 정원
         */
        @JsonProperty("totalCapacity")
        private Integer totalCapacity;
        
        /**
         * 등급별 정원 정보
         */
        @JsonProperty("gradeCapacities")
        private List<GradeCapacity> gradeCapacities;
        
        /**
         * 직원 현황
         */
        @JsonProperty("staffInfo")
        private StaffInfo staffInfo;
        
        /**
         * 시설 정보
         */
        @JsonProperty("facilityInfo")
        private FacilityInfo facilityInfo;
        
        /**
         * 서비스 정보
         */
        @JsonProperty("serviceInfo")
        private ServiceInfo serviceInfo;
        
        /**
         * 비용 정보
         */
        @JsonProperty("costInfo")
        private CostInfo costInfo;
        
        /**
         * 평가 정보
         */
        @JsonProperty("evaluationInfo")
        private EvaluationInfo evaluationInfo;
    }
    
    /**
     * 등급별 정원 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GradeCapacity {
        
        @JsonProperty("grade")
        private String grade;
        
        @JsonProperty("capacity")
        private Integer capacity;
        
        @JsonProperty("currentOccupancy")
        private Integer currentOccupancy;
    }
    
    /**
     * 직원 현황 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StaffInfo {
        
        @JsonProperty("totalStaff")
        private Integer totalStaff;
        
        @JsonProperty("doctors")
        private Integer doctors;
        
        @JsonProperty("nurses")
        private Integer nurses;
        
        @JsonProperty("socialWorkers")
        private Integer socialWorkers;
        
        @JsonProperty("caregivers")
        private Integer caregivers;
        
        @JsonProperty("physicalTherapists")
        private Integer physicalTherapists;
        
        @JsonProperty("otherStaff")
        private Integer otherStaff;
    }
    
    /**
     * 시설 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FacilityInfo {
        
        @JsonProperty("totalFloorArea")
        private Double totalFloorArea;
        
        @JsonProperty("buildingStructure")
        private String buildingStructure;
        
        @JsonProperty("numberOfFloors")
        private Integer numberOfFloors;
        
        @JsonProperty("parkingSpaces")
        private Integer parkingSpaces;
        
        @JsonProperty("elevatorCount")
        private Integer elevatorCount;
        
        @JsonProperty("fireProtectionSystem")
        private String fireProtectionSystem;
        
        @JsonProperty("barrierFree")
        private Boolean barrierFree;
    }
    
    /**
     * 서비스 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ServiceInfo {
        
        @JsonProperty("specializedCare")
        private List<String> specializedCare;
        
        @JsonProperty("medicalServices")
        private List<String> medicalServices;
        
        @JsonProperty("recreationalPrograms")
        private List<String> recreationalPrograms;
        
        @JsonProperty("mealService")
        private Boolean mealService;
        
        @JsonProperty("transportationService")
        private Boolean transportationService;
        
        @JsonProperty("emergencyResponse")
        private Boolean emergencyResponse;
    }
    
    /**
     * 비용 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CostInfo {
        
        @JsonProperty("monthlyBasicFee")
        private Integer monthlyBasicFee;
        
        @JsonProperty("mealCost")
        private Integer mealCost;
        
        @JsonProperty("additionalServices")
        private List<AdditionalServiceCost> additionalServices;
        
        @JsonProperty("deposit")
        private Integer deposit;
        
        @JsonProperty("insuranceCoverage")
        private Double insuranceCoverage;
    }
    
    /**
     * 추가 서비스 비용
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AdditionalServiceCost {
        
        @JsonProperty("serviceName")
        private String serviceName;
        
        @JsonProperty("cost")
        private Integer cost;
        
        @JsonProperty("unit")
        private String unit;
    }
    
    /**
     * 평가 정보
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EvaluationInfo {
        
        @JsonProperty("overallGrade")
        private String overallGrade;
        
        @JsonProperty("overallScore")
        private Double overallScore;
        
        @JsonProperty("evaluationDate")
        private String evaluationDate;
        
        @JsonProperty("categoryScores")
        private List<CategoryScore> categoryScores;
        
        @JsonProperty("improvements")
        private List<String> improvements;
        
        @JsonProperty("strengths")
        private List<String> strengths;
    }
    
    /**
     * 평가 영역별 점수
     */
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CategoryScore {
        
        @JsonProperty("category")
        private String category;
        
        @JsonProperty("score")
        private Double score;
        
        @JsonProperty("maxScore")
        private Double maxScore;
        
        @JsonProperty("grade")
        private String grade;
    }
} 