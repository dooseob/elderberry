package com.globalcarelink.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {
    
    private final ObjectMapper objectMapper;
    
    @PostMapping("/json")
    public String testJson(@RequestBody String rawBody) {
        log.info("Raw request body: {}", rawBody);
        return "OK: " + rawBody;
    }
}