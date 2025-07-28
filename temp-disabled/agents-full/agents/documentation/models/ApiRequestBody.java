package com.globalcarelink.agents.documentation.models;

import lombok.Data;

@Data
public class ApiRequestBody {
    private String contentType;
    private String schema;
    private boolean required;
}