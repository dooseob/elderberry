# Phase 6: 공공데이터 API 연동

## 🎯 개요
**소요기간**: 6-7일  
**예상 토큰**: ~18,000 토큰  
**목표**: 정부 공공데이터 API 통합 연동 + 외교부 재외동포 서비스 연계

---

## 📌 Phase 6-A: 기본 API 연동

### 구현 대상
- [ ] 국민건강보험공단 장기요양기관 API
- [ ] 건강보험심사평가원 병원정보 API  
- [ ] 국립중앙의료원 전국 약국 정보 API
- [ ] 요양기관개폐업정보조회 API
- [ ] API 클라이언트 통합 구성

### 발급받은 인증키 목록
```yaml
공통 인증키: CCXHQiSSQ0J+RRaadSjmmS7ltxG/tlSVOYMjh45MmGne68ptgGAaAJVJti8nBazSjLemTAyb5gAuj43xq7fTog==
활용기간: 2025-07-16 ~ 2027-07-18

연동 API 목록:
1. 국민건강보험공단_장기요양기관 검색 서비스
   - URL: https://apis.data.go.kr/B550928/searchLtcInsttService01
   - 기능: 맞춤형 요양원 추천 (지역/예산/특성별)

2. 국민건강보험공단_장기요양기관 시설별 상세조회 서비스  
   - URL: https://apis.data.go.kr/B550928/getLtcInsttDetailInfoService02
   - 기능: 시설 규모, 서비스, 요금 상세 조회

3. 건강보험심사평가원_병원정보서비스
   - URL: https://apis.data.go.kr/B551182/hospInfoServicev2
   - 기능: 건강검진 병원 추천, 응급 의료진 연결

4. 국립중앙의료원_전국 약국 정보 조회 서비스
   - URL: https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService
   - 기능: 처방전 처리 가능 약국 안내

5. 건강보험심사평가원_요양기관개폐업정보조회서비스
   - URL: https://apis.data.go.kr/B551182/yadmOpCloInfoService2
   - 기능: 요양기관 운영 상태 실시간 확인
```

### 통합 API 클라이언트 구조
```java
@Component
public class PublicDataApiClient {
    
    @Value("${public.data.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    // 장기요양기관 검색
    public List<LtcInstitution> searchLtcInstitutions(LtcSearchRequest request) {
        String url = "https://apis.data.go.kr/B550928/searchLtcInsttService01";
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("serviceKey", apiKey)
                .queryParam("sidoName", request.getSidoName())
                .queryParam("sigunguName", request.getSigunguName())
                .queryParam("facilityType", request.getFacilityType())
                .queryParam("numOfRows", 1000)
                .queryParam("pageNo", 1)
                .queryParam("resultType", "json");
        
        try {
            ResponseEntity<LtcApiResponse> response = restTemplate.exchange(
                    builder.toUriString(), 
                    HttpMethod.GET, 
                    null, 
                    LtcApiResponse.class
            );
            
            return response.getBody().getBody().getItems();
            
        } catch (Exception e) {
            log.error("장기요양기관 검색 API 호출 실패: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    // 장기요양기관 상세 조회
    public LtcInstitutionDetail getLtcInstitutionDetail(String institutionCode) {
        String url = "https://apis.data.go.kr/B550928/getLtcInsttDetailInfoService02";
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("serviceKey", apiKey)
                .queryParam("instCd", institutionCode)
                .queryParam("resultType", "json");
        
        try {
            ResponseEntity<LtcDetailApiResponse> response = restTemplate.exchange(
                    builder.toUriString(), 
                    HttpMethod.GET, 
                    null, 
                    LtcDetailApiResponse.class
            );
            
            return response.getBody().getBody().getItems().get(0);
            
        } catch (Exception e) {
            log.error("장기요양기관 상세 조회 API 호출 실패: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // 병원 정보 조회
    public List<HospitalInfo> searchHospitals(HospitalSearchRequest request) {
        String url = "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("serviceKey", apiKey)
                .queryParam("sidoCd", request.getSidoCode())
                .queryParam("sgguCd", request.getSigunguCode())
                .queryParam("numOfRows", 100)
                .queryParam("pageNo", 1)
                .queryParam("_type", "json");
        
        try {
            ResponseEntity<HospitalApiResponse> response = restTemplate.exchange(
                    builder.toUriString(), 
                    HttpMethod.GET, 
                    null, 
                    HospitalApiResponse.class
            );
            
            return response.getBody().getBody().getItems();
            
        } catch (Exception e) {
            log.error("병원 정보 API 호출 실패: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
```

### API 응답 데이터 모델
```java
@Data
public class LtcInstitution {
    private String instCd;              // 기관코드
    private String instNm;              // 기관명
    private String sidoNm;              // 시도명
    private String sigunguNm;           // 시군구명
    private String roadAddr;            // 도로명주소
    private String lotnoAddr;           // 지번주소
    private String instDiv;             // 기관구분
    private String instType;            // 기관유형
    private String telno;               // 전화번호
    private String faxno;               // 팩스번호
    private String totCapcty;           // 정원
    private String curCapcty;           // 현원
    private String latitude;            // 위도
    private String longitude;           // 경도
}

@Data
public class LtcInstitutionDetail {
    private String instCd;              // 기관코드
    private String instNm;              // 기관명
    private String estbDt;              // 설립일
    private String adminNm;             // 관리자명
    private String adminTelno;          // 관리자전화번호
    private String medicalStaffCnt;     // 의료진수
    private String nurseStaffCnt;       // 간호인력수
    private String careStaffCnt;        // 요양보호사수
    private String socialWorkerCnt;     // 사회복지사수
    private String facilityGrade;       // 평가등급
    private String evaluationDate;      // 평가일자
    private String monthlyFee;          // 월이용료
    private String admissionFee;        // 입소료
}
```

---

## 📌 Phase 6-B: 외교부 API 연동

### 구현 대상
- [ ] 재외국민 현황 API
- [ ] 영사관/총영사관 정보 API  
- [ ] 재외동포 지원 정책 API
- [ ] 국가별 의료 정보 API
- [ ] 다국어 데이터 처리

### 외교부 API 연동
```java
@Component
public class MofaApiClient {
    
    @Value("${mofa.api.key}")
    private String apiKey;
    
    @Value("${mofa.api.base.url}")
    private String baseUrl;
    
    // 국가별 입국 요건 조회
    public KoreaEntryRequirementResponse getKoreaEntryRequirements(String overseasCountry) {
        String url = baseUrl + "/EntranceVisaService2/getEntryVisaList";
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("serviceKey", apiKey)
                .queryParam("cond[country_nm::]", overseasCountry)
                .queryParam("numOfRows", 10)
                .queryParam("pageNo", 1)
                .queryParam("type", "json");
        
        try {
            ResponseEntity<MofaApiResponse> response = restTemplate.exchange(
                    builder.toUriString(), 
                    HttpMethod.GET, 
                    null, 
                    MofaApiResponse.class
            );
            
            return processEntryRequirements(response.getBody());
            
        } catch (Exception e) {
            log.error("외교부 입국요건 API 호출 실패: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // 재외동포 지원 서비스 조회
    public List<OverseasKoreanSupport> getOverseasKoreanSupports(String country) {
        // 재외동포 대상 지원 정책 및 서비스 조회
        // 의료, 복지, 교육 등 카테고리별 지원 내용
    }
    
    // 영사관 정보 조회  
    public List<ConsulateInfo> getConsulatesByCountry(String country) {
        // 해당 국가 내 한국 영사관/총영사관 정보
        // 연락처, 주소, 업무시간, 제공 서비스
    }
}
```

### 재외동포 서비스 통합
```java
@Service
public class OverseasKoreanService {
    
    private final MofaApiClient mofaApiClient;
    private final PublicDataApiClient publicDataApiClient;
    
    public OverseasKoreanServicePackage createServicePackage(OverseasProfile profile) {
        String country = profile.getResidenceCountry();
        String city = profile.getResidenceCity();
        
        // 1. 입국 요건 조회
        KoreaEntryRequirementResponse entryReq = mofaApiClient.getKoreaEntryRequirements(country);
        
        // 2. 현지 영사관 정보
        List<ConsulateInfo> consulates = mofaApiClient.getConsulatesByCountry(country);
        
        // 3. 재외동포 지원 서비스
        List<OverseasKoreanSupport> supports = mofaApiClient.getOverseasKoreanSupports(country);
        
        // 4. 한국 내 의료 네트워크  
        List<HospitalInfo> koreanHospitals = publicDataApiClient.searchHospitals(
            HospitalSearchRequest.forOverseasKoreans(profile.getPreferredRegionInKorea())
        );
        
        return OverseasKoreanServicePackage.builder()
                .profile(profile)
                .entryRequirements(entryReq)
                .nearbyConsulates(consulates)
                .supportServices(supports)
                .koreanMedicalNetwork(koreanHospitals)
                .build();
    }
}
```

---

## 🔄 데이터 동기화 시스템

### 배치 작업 스케줄러
```java
@Component
public class PublicDataSyncScheduler {
    
    @Scheduled(cron = "0 0 2 * * ?") // 매일 새벽 2시
    public void syncLtcInstitutionData() {
        log.info("장기요양기관 데이터 동기화 시작");
        
        try {
            // 전국 시도별 데이터 수집
            List<String> sidoList = Arrays.asList(
                "서울특별시", "부산광역시", "대구광역시", "인천광역시",
                "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
                "경기도", "강원특별자치도", "충청북도", "충청남도",
                "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
            );
            
            int totalSynced = 0;
            for (String sido : sidoList) {
                List<LtcInstitution> institutions = publicDataApiClient.searchLtcInstitutions(
                    LtcSearchRequest.builder().sidoName(sido).build()
                );
                
                for (LtcInstitution inst : institutions) {
                    syncSingleInstitution(inst);
                    totalSynced++;
                }
                
                // API 호출 제한 고려 (1초 대기)
                Thread.sleep(1000);
            }
            
            log.info("장기요양기관 데이터 동기화 완료: {}개 기관", totalSynced);
            
        } catch (Exception e) {
            log.error("데이터 동기화 실패: {}", e.getMessage(), e);
        }
    }
    
    @Scheduled(cron = "0 0 6 * * MON") // 매주 월요일 새벽 6시
    public void syncHospitalData() {
        // 병원 정보 주간 동기화
    }
    
    @Scheduled(cron = "0 0 4 1 * ?") // 매월 1일 새벽 4시
    public void syncOverseasKoreanData() {
        // 재외동포 지원 정책 월간 동기화
    }
}
```

### 데이터 검증 및 품질 관리
```java
@Service
public class PublicDataValidationService {
    
    public DataQualityReport validateLtcInstitutionData() {
        List<FacilityProfile> allFacilities = facilityRepository.findAll();
        
        DataQualityReport report = DataQualityReport.builder()
            .totalRecords(allFacilities.size())
            .build();
        
        for (FacilityProfile facility : allFacilities) {
            // 1. 필수 필드 검증
            if (!StringUtils.hasText(facility.getFacilityName())) {
                report.addError("시설명 누락: " + facility.getId());
            }
            
            // 2. 좌표 유효성 검증
            if (facility.getLatitude() == null || facility.getLongitude() == null) {
                report.addWarning("좌표 정보 누락: " + facility.getFacilityName());
            }
            
            // 3. 연락처 형식 검증
            if (facility.getTelno() != null && !isValidPhoneNumber(facility.getTelno())) {
                report.addError("잘못된 전화번호: " + facility.getFacilityName());
            }
            
            // 4. 중복 데이터 검증
            List<FacilityProfile> duplicates = facilityRepository
                .findByFacilityNameAndRoadAddr(facility.getFacilityName(), facility.getRoadAddr());
            if (duplicates.size() > 1) {
                report.addWarning("중복 시설: " + facility.getFacilityName());
            }
        }
        
        return report;
    }
}
```

---

## 📊 API 통계 및 모니터링

### API 호출 통계 수집
```java
@Component
public class ApiUsageMonitor {
    
    private final MeterRegistry meterRegistry;
    
    public void recordApiCall(String apiName, boolean success, long responseTime) {
        // Micrometer를 통한 메트릭 수집
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("public_data_api_calls")
                .tag("api", apiName)
                .tag("success", String.valueOf(success))
                .register(meterRegistry));
        
        // 성공/실패 카운터
        Counter.builder("public_data_api_calls_total")
                .tag("api", apiName)
                .tag("result", success ? "success" : "failure")
                .register(meterRegistry)
                .increment();
    }
    
    public ApiUsageStatistics getUsageStatistics() {
        return ApiUsageStatistics.builder()
                .ltcApiCalls(getLtcApiCallCount())
                .hospitalApiCalls(getHospitalApiCallCount())
                .mofaApiCalls(getMofaApiCallCount())
                .totalApiCalls(getTotalApiCallCount())
                .successRate(calculateSuccessRate())
                .averageResponseTime(getAverageResponseTime())
                .build();
    }
}
```

### API 엔드포인트
```
GET  /api/public-data/ltc-institutions/search        - 장기요양기관 검색
GET  /api/public-data/ltc-institutions/{code}        - 장기요양기관 상세
GET  /api/public-data/hospitals/search               - 병원 검색
GET  /api/public-data/pharmacies/search              - 약국 검색
POST /api/public-data/sync/ltc-institutions          - 장기요양기관 데이터 동기화
GET  /api/overseas-korean/entry-requirements/{country} - 입국 요건 조회
GET  /api/overseas-korean/consulates/{country}       - 영사관 정보
GET  /api/admin/api-usage/statistics                 - API 사용 통계 (관리자)
```

---

## 🛠 개발 도구

### 테스트 명령어
```bash
# API 클라이언트 테스트
./gradlew :test --tests "*PublicDataApiClientTest"

# 데이터 동기화 테스트  
./gradlew :test --tests "*PublicDataSyncTest"

# 외교부 API 연동 테스트
./gradlew :test --tests "*MofaApiClientTest"
```

### API 테스트 스크립트
```bash
# 장기요양기관 검색 테스트
curl -X GET "http://localhost:8080/api/public-data/ltc-institutions/search?sidoName=서울특별시&sigunguName=강남구" \
  -H "Authorization: Bearer {token}"

# 외교부 API 테스트  
curl -X GET "http://localhost:8080/api/overseas-korean/entry-requirements/미국" \
  -H "Authorization: Bearer {token}"

# 데이터 동기화 실행
curl -X POST "http://localhost:8080/api/public-data/sync/ltc-institutions" \
  -H "Authorization: Bearer {admin-token}"
```

---

## 📋 확인 사항

### Phase 6-A 완료 체크리스트
- [ ] 장기요양기관 검색/상세 API 연동 성공
- [ ] 병원정보 및 약국정보 API 연동 성공
- [ ] 요양기관 개폐업 정보 실시간 연동
- [ ] API 호출 통계 및 모니터링 시스템
- [ ] 데이터 검증 및 품질 관리 체계

### Phase 6-B 완료 체크리스트  
- [ ] 외교부 입국요건 API 연동 성공
- [ ] 재외동포 지원 서비스 정보 연동
- [ ] 영사관 정보 자동 매칭 기능
- [ ] 다국어 데이터 처리 시스템
- [ ] 배치 작업 스케줄러 정상 동작

---

## 🎯 다음 단계

**Phase 7-A**: 챗봇 연동 인터페이스
- 챗봇 호환성 API 엔드포인트
- 세션 관리 시스템
- 프로세스 추적 연동

**중간 체크포인트**: Phase 6 완료 후 챗봇 시스템 연동 준비