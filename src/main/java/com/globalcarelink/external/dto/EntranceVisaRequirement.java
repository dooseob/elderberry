package com.globalcarelink.external.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 국가별 입국허가요건 상세 정보 DTO
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EntranceVisaRequirement {
    
    @JsonProperty("countryNm")
    private String countryName;           // 국가명
    
    @JsonProperty("regionNm")
    private String regionName;            // 지역명
    
    @JsonProperty("visaClass")
    private String visaClass;             // 비자 종류
    
    @JsonProperty("visaNeeded")
    private String visaNeeded;            // 비자 필요 여부 (Y/N)
    
    @JsonProperty("visaDuration")
    private String visaDuration;          // 체류 가능 기간
    
    @JsonProperty("visaFee")
    private String visaFee;               // 비자 수수료
    
    @JsonProperty("documents")
    private String requiredDocuments;     // 필요 서류
    
    @JsonProperty("processingTime")
    private String processingTime;        // 처리 기간
    
    @JsonProperty("embassy")
    private String embassy;               // 담당 영사관/대사관
    
    @JsonProperty("notes")
    private String additionalNotes;       // 추가 안내사항
    
    @JsonProperty("lastUpdate")
    private String lastUpdateDate;        // 최종 업데이트 일자
    
    @JsonProperty("purpose")
    private String entryPurpose;          // 입국 목적
    
    /**
     * 비자가 필요한지 확인
     */
    public boolean isVisaRequired() {
        return "Y".equalsIgnoreCase(visaNeeded) || "예".equals(visaNeeded);
    }
    
    /**
     * 무비자 입국 가능 여부 확인
     */
    public boolean isVisaFreeEntry() {
        return "N".equalsIgnoreCase(visaNeeded) || "아니오".equals(visaNeeded);
    }
    
    /**
     * 체류 가능 일수 추출 (숫자만)
     */
    public Integer getStayDurationDays() {
        if (visaDuration != null) {
            // "90일", "3개월" 등에서 숫자 추출
            String duration = visaDuration.replaceAll("[^0-9]", "");
            if (!duration.isEmpty()) {
                try {
                    int days = Integer.parseInt(duration);
                    // "개월"이 포함된 경우 30을 곱해서 일수로 변환
                    if (visaDuration.contains("개월") || visaDuration.contains("month")) {
                        days *= 30;
                    }
                    return days;
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }
    
    /**
     * 비자 수수료 금액 추출 (숫자만)
     */
    public Integer getVisaFeeAmount() {
        if (visaFee != null) {
            String fee = visaFee.replaceAll("[^0-9]", "");
            if (!fee.isEmpty()) {
                try {
                    return Integer.parseInt(fee);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }
    
    /**
     * 무료 비자 여부 확인
     */
    public boolean isFreeVisa() {
        if (visaFee == null) return false;
        return visaFee.contains("무료") || visaFee.contains("free") || 
               visaFee.contains("0") || visaFee.contains("없음");
    }
    
    /**
     * 입국허가요건 요약 정보
     */
    public String getSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("국가: ").append(countryName != null ? countryName : "미상");
        
        if (isVisaRequired()) {
            summary.append(" | 비자 필요: 예");
            if (visaClass != null) {
                summary.append(" (").append(visaClass).append(")");
            }
        } else {
            summary.append(" | 비자 필요: 아니오");
        }
        
        if (visaDuration != null) {
            summary.append(" | 체류기간: ").append(visaDuration);
        }
        
        if (visaFee != null && !isFreeVisa()) {
            summary.append(" | 수수료: ").append(visaFee);
        }
        
        return summary.toString();
    }
    
    /**
     * 유효한 입국허가요건 정보인지 확인
     */
    public boolean isValid() {
        return countryName != null && !countryName.trim().isEmpty() &&
               visaNeeded != null && !visaNeeded.trim().isEmpty();
    }
} 