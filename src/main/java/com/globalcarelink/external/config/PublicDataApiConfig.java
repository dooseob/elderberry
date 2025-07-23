package com.globalcarelink.external.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * 공공데이터 API 클라이언트를 위한 WebClient 설정
 * 최적화된 타임아웃, 재시도, 로깅 등을 포함
 */
@Configuration
@Slf4j
public class PublicDataApiConfig {

    @Value("${app.public-data.base-url:https://apis.data.go.kr}")
    private String baseUrl;

    @Value("${app.public-data.connect-timeout:10000}")
    private int connectTimeout;

    @Value("${app.public-data.read-timeout:30000}")
    private int readTimeout;

    @Value("${app.public-data.write-timeout:10000}")
    private int writeTimeout;

    @Value("${app.public-data.max-memory-size:1048576}")
    private int maxMemorySize; // 1MB

    /**
     * 공공데이터 API 전용 WebClient 빈 생성
     * 
     * @return 최적화된 WebClient 인스턴스
     */
    @Bean(name = "publicDataWebClient")
    public WebClient publicDataWebClient() {
        
        // Netty HTTP 클라이언트 설정
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeout)
                .responseTimeout(Duration.ofMillis(readTimeout))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(readTimeout, TimeUnit.MILLISECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(writeTimeout, TimeUnit.MILLISECONDS))
                );

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(maxMemorySize))
                .filter(logRequest())
                .filter(logResponse())
                .filter(handleErrors())
                .build();
    }

    /**
     * 요청 로깅 필터
     * 
     * @return 요청 로깅 ExchangeFilterFunction
     */
    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            if (log.isDebugEnabled()) {
                log.debug("공공데이터 API 요청: {} {}", 
                        clientRequest.method(), clientRequest.url());
                
                clientRequest.headers().forEach((name, values) -> 
                    log.debug("요청 헤더: {} = {}", name, values));
            }
            return Mono.just(clientRequest);
        });
    }

    /**
     * 응답 로깅 필터
     * 
     * @return 응답 로깅 ExchangeFilterFunction
     */
    private ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(clientResponse -> {
            if (log.isDebugEnabled()) {
                log.debug("공공데이터 API 응답: {} {}", 
                        clientResponse.statusCode(), clientResponse.headers().asHttpHeaders());
            }
            
            // 응답 시간 측정을 위한 로깅
            long startTime = System.currentTimeMillis();
            return Mono.just(clientResponse)
                    .doFinally(signalType -> {
                        long duration = System.currentTimeMillis() - startTime;
                        if (duration > 5000) { // 5초 이상 소요된 경우 경고
                            log.warn("공공데이터 API 응답 지연: {}ms", duration);
                        } else if (log.isDebugEnabled()) {
                            log.debug("공공데이터 API 응답 시간: {}ms", duration);
                        }
                    });
        });
    }

    /**
     * 에러 처리 필터
     * 
     * @return 에러 처리 ExchangeFilterFunction
     */
    private ExchangeFilterFunction handleErrors() {
        return ExchangeFilterFunction.ofResponseProcessor(clientResponse -> {
            if (clientResponse.statusCode().isError()) {
                log.error("공공데이터 API 오류 응답: {} {}", 
                        clientResponse.statusCode(), clientResponse.headers().asHttpHeaders());
                
                return clientResponse.bodyToMono(String.class)
                        .defaultIfEmpty("응답 본문 없음")
                        .doOnNext(body -> log.error("오류 응답 본문: {}", body))
                        .then(Mono.just(clientResponse));
            }
            return Mono.just(clientResponse);
        });
    }

    /**
     * 공공데이터 API 설정 정보를 로깅
     */
    @Bean
    public void logPublicDataApiConfig() {
        log.info("=== 공공데이터 API 설정 ===");
        log.info("Base URL: {}", baseUrl);
        log.info("Connect Timeout: {}ms", connectTimeout);
        log.info("Read Timeout: {}ms", readTimeout);
        log.info("Write Timeout: {}ms", writeTimeout);
        log.info("Max Memory Size: {}bytes", maxMemorySize);
        log.info("========================");
    }
} 