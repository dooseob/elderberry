package com.globalcarelink.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 리소스 핸들링
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");
                
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
                
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // SPA를 위한 fallback 라우팅
        registry.addViewController("/")
                .setViewName("forward:/index.html");
    }
}