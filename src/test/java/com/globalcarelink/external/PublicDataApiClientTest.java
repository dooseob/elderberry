package com.globalcarelink.external;

import com.globalcarelink.external.dto.EntranceVisaInfoResponse;
import com.globalcarelink.external.dto.EntranceVisaRequirement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

/**
 * 입국허가요건 API 클라이언트 테스트
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("입국허가요건 API 클라이언트 테스트")
class PublicDataApiClientTest {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private PublicDataApiClient publicDataApiClient;

    private EntranceVisaInfoResponse mockResponse;
    private EntranceVisaRequirement mockRequirement;

    @BeforeEach
    void setUp() {
        // Mock 입국허가요건 응답 데이터 생성
        mockRequirement = new EntranceVisaRequirement();
        mockRequirement.setCountryName("미국");
        mockRequirement.setVisaNeeded("Y");
        mockRequirement.setVisaDuration("90일");
        mockRequirement.setVisaFee("160달러");

        mockResponse = new EntranceVisaInfoResponse();
        EntranceVisaInfoResponse.ResponseInfo responseInfo = new EntranceVisaInfoResponse.ResponseInfo();
        EntranceVisaInfoResponse.ResponseInfo.HeaderInfo headerInfo = new EntranceVisaInfoResponse.ResponseInfo.HeaderInfo();
        headerInfo.setResultCode("00");
        headerInfo.setResultMsg("성공");
        
        EntranceVisaInfoResponse.ResponseInfo.BodyInfo bodyInfo = new EntranceVisaInfoResponse.ResponseInfo.BodyInfo();
        bodyInfo.setItems(List.of(mockRequirement));
        bodyInfo.setTotalCount(1);
        
        responseInfo.setHeader(headerInfo);
        responseInfo.setBody(bodyInfo);
        mockResponse.setResponse(responseInfo);
    }

    @Test
    @DisplayName("국가별 입국허가요건 조회 성공")
    void getEntranceVisaRequirements_Success() {
        // Given
        String countryName = "미국";
        
        given(webClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.onStatus(any(), any())).willReturn(responseSpec);
        given(responseSpec.bodyToMono(EntranceVisaInfoResponse.class)).willReturn(Mono.just(mockResponse));

        // When & Then
        StepVerifier.create(publicDataApiClient.getEntranceVisaRequirements(countryName, 1, 100))
                .assertNext(response -> {
                    assertThat(response.isSuccess()).isTrue();
                    assertThat(response.getVisaRequirements()).hasSize(1);
                    assertThat(response.getVisaRequirements().get(0).getCountryName()).isEqualTo("미국");
                    assertThat(response.getVisaRequirements().get(0).isVisaRequired()).isTrue();
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("다중 국가 입국허가요건 조회 성공")
    void getMultipleCountriesVisaRequirements_Success() {
        // Given
        List<String> countryNames = List.of("미국", "일본");
        
        given(webClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.onStatus(any(), any())).willReturn(responseSpec);
        given(responseSpec.bodyToMono(EntranceVisaInfoResponse.class)).willReturn(Mono.just(mockResponse));

        // When & Then
        StepVerifier.create(publicDataApiClient.getMultipleCountriesVisaRequirements(countryNames))
                .assertNext(resultMap -> {
                    assertThat(resultMap).hasSize(2);
                    assertThat(resultMap).containsKeys("미국", "일본");
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("맞춤형 입국허가요건 조회 성공")
    void getCustomizedVisaRequirements_Success() {
        // Given
        String residenceCountry = "미국";
        String entryPurpose = "의료";
        
        mockRequirement.setEntryPurpose("의료");
        
        given(webClient.get()).willReturn(requestHeadersUriSpec);
        given(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).willReturn(requestHeadersSpec);
        given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
        given(responseSpec.onStatus(any(), any())).willReturn(responseSpec);
        given(responseSpec.bodyToMono(EntranceVisaInfoResponse.class)).willReturn(Mono.just(mockResponse));

        // When & Then
        StepVerifier.create(publicDataApiClient.getCustomizedVisaRequirements(residenceCountry, entryPurpose))
                .assertNext(requirements -> {
                    assertThat(requirements).hasSize(1);
                    assertThat(requirements.get(0).getEntryPurpose()).contains("의료");
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("빈 국가 목록으로 다중 조회 시 빈 결과 반환")
    void getMultipleCountriesVisaRequirements_EmptyList() {
        // Given
        List<String> emptyCountryNames = List.of();

        // When & Then
        StepVerifier.create(publicDataApiClient.getMultipleCountriesVisaRequirements(emptyCountryNames))
                .assertNext(resultMap -> {
                    assertThat(resultMap).isEmpty();
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("입국허가요건 DTO 유틸리티 메서드 테스트")
    void entranceVisaRequirement_UtilityMethods() {
        // Given
        EntranceVisaRequirement requirement = new EntranceVisaRequirement();
        requirement.setCountryName("한국");
        requirement.setVisaNeeded("N");
        requirement.setVisaDuration("90일");
        requirement.setVisaFee("무료");

        // When & Then
        assertThat(requirement.isVisaRequired()).isFalse();
        assertThat(requirement.isVisaFreeEntry()).isTrue();
        assertThat(requirement.getStayDurationDays()).isEqualTo(90);
        assertThat(requirement.isFreeVisa()).isTrue();
        assertThat(requirement.isValid()).isTrue();
        
        String summary = requirement.getSummary();
        assertThat(summary).contains("한국");
        assertThat(summary).contains("비자 필요: 아니오");
        assertThat(summary).contains("체류기간: 90일");
    }

    @Test
    @DisplayName("복잡한 체류기간 파싱 테스트")
    void entranceVisaRequirement_ComplexDurationParsing() {
        // Given
        EntranceVisaRequirement requirement = new EntranceVisaRequirement();
        
        // 개월 단위 테스트
        requirement.setVisaDuration("3개월");
        assertThat(requirement.getStayDurationDays()).isEqualTo(90); // 3 * 30
        
        // 일반 숫자 테스트
        requirement.setVisaDuration("180일");
        assertThat(requirement.getStayDurationDays()).isEqualTo(180);
        
        // 영어 month 테스트
        requirement.setVisaDuration("6 months");
        assertThat(requirement.getStayDurationDays()).isEqualTo(180); // 6 * 30
    }
} 