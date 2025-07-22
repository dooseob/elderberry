package com.globalcarelink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class GlobalCareLinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(GlobalCareLinkApplication.class, args);
    }
}