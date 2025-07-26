package com.globalcarelink.profile;

import com.globalcarelink.external.PublicDataApiClient;
import com.globalcarelink.external.dto.EntranceVisaRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * 프로필 관련 외부 서비스 연동 전용 서비스
 * 단일 책임 원칙 적용: 외부 API 연동 기능만 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileExternalService {
    
    private final PublicDataApiClient publicDataApiClient;
    
    /**
     * 국가별 입국 비자 요건 조회
     */
    public Mono<List<EntranceVisaRequirement>> getVisaRequirements(String nationality, String destinationCountry) {
        log.info("비자 요건 조회 시작 - 국적: {}, 목적지: {}", nationality, destinationCountry);
        
        return publicDataApiClient.getEntranceVisaInfo(nationality, destinationCountry)
                .doOnSuccess(requirements -> {
                    log.info("비자 요건 조회 완료 - 국적: {}, 목적지: {}, 결과: {}건", 
                            nationality, destinationCountry, requirements.size());
                })
                .doOnError(error -> {
                    log.error("비자 요건 조회 실패 - 국적: {}, 목적지: {}, 오류: {}", 
                            nationality, destinationCountry, error.getMessage());
                });
    }
    
    /**
     * 맞춤형 비자 정보 조회
     */
    public Mono<List<EntranceVisaRequirement>> getCustomVisaInfo(String nationality, String destinationCountry, 
                                                                String purpose, Integer stayDuration) {
        log.info("맞춤형 비자 정보 조회 시작 - 국적: {}, 목적지: {}, 목적: {}, 체류기간: {}일", 
                nationality, destinationCountry, purpose, stayDuration);
        
        return publicDataApiClient.getCustomVisaInfo(nationality, destinationCountry, purpose, stayDuration)
                .doOnSuccess(requirements -> {
                    log.info("맞춤형 비자 정보 조회 완료 - 국적: {}, 목적지: {}, 결과: {}건", 
                            nationality, destinationCountry, requirements.size());
                })
                .doOnError(error -> {
                    log.error("맞춤형 비자 정보 조회 실패 - 국적: {}, 목적지: {}, 오류: {}", 
                            nationality, destinationCountry, error.getMessage());
                });
    }
    
    /**
     * 여러 국가의 비자 요건 일괄 조회
     */
    public Mono<List<EntranceVisaRequirement>> getBulkVisaRequirements(String nationality, List<String> destinationCountries) {
        log.info("일괄 비자 요건 조회 시작 - 국적: {}, 목적지 수: {}", nationality, destinationCountries.size());
        
        // 각 국가별로 비자 요건을 조회하고 결과를 합침
        return Mono.fromCallable(() -> destinationCountries)
                .flatMapMany(countries -> 
                    Mono.fromIterable(countries)
                        .flatMap(country -> getVisaRequirements(nationality, country))
                        .collectList()
                        .flatMapIterable(listOfLists -> 
                            listOfLists.stream()
                                    .flatMap(List::stream)
                                    .toList()
                        )
                )
                .collectList()
                .doOnSuccess(allRequirements -> {
                    log.info("일괄 비자 요건 조회 완료 - 국적: {}, 총 결과: {}건", nationality, allRequirements.size());
                })
                .doOnError(error -> {
                    log.error("일괄 비자 요건 조회 실패 - 국적: {}, 오류: {}", nationality, error.getMessage());
                });
    }
    
    /**
     * 비자 만료 알림을 위한 비자 정보 검증
     */
    public Mono<Boolean> validateVisaStatus(String nationality, String destinationCountry, String visaType) {
        log.info("비자 상태 검증 시작 - 국적: {}, 목적지: {}, 비자 유형: {}", nationality, destinationCountry, visaType);
        
        return getVisaRequirements(nationality, destinationCountry)
                .map(requirements -> {
                    boolean isValid = requirements.stream()
                            .anyMatch(req -> req.getVisaType() != null && 
                                           req.getVisaType().equalsIgnoreCase(visaType));
                    
                    log.info("비자 상태 검증 완료 - 국적: {}, 목적지: {}, 비자 유형: {}, 유효: {}", 
                            nationality, destinationCountry, visaType, isValid);
                    
                    return isValid;
                })
                .doOnError(error -> {
                    log.error("비자 상태 검증 실패 - 국적: {}, 목적지: {}, 비자 유형: {}, 오류: {}", 
                            nationality, destinationCountry, visaType, error.getMessage());
                });
    }
    
    /**
     * 국가 코드 검증
     */
    public boolean isValidCountryCode(String countryCode) {
        // 간단한 국가 코드 검증 (ISO 3166-1 alpha-2)
        return countryCode != null && 
               countryCode.length() == 2 && 
               countryCode.matches("^[A-Z]{2}$");
    }
    
    /**
     * 비자 목적 유형 검증
     */
    public boolean isValidVisaPurpose(String purpose) {
        // 일반적인 비자 목적 유형들
        String[] validPurposes = {
            "TOURISM", "BUSINESS", "STUDY", "WORK", "MEDICAL", 
            "TRANSIT", "FAMILY_VISIT", "IMMIGRATION", "OTHER"
        };
        
        for (String validPurpose : validPurposes) {
            if (validPurpose.equalsIgnoreCase(purpose)) {
                return true;
            }
        }
        
        return false;
    }
}