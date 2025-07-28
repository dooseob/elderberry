package com.globalcarelink.agents.documentation.models;

import lombok.Data;

@Data
public class ApiResponse {
    private String statusCode;
    private String description;
    private String schema;
}