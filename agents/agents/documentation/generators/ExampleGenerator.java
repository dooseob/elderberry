package com.globalcarelink.agents.documentation.generators;

import org.springframework.stereotype.Component;

@Component
public class ExampleGenerator {
    public String generateExample(String apiPath) {
        return "// Example for " + apiPath;
    }
}