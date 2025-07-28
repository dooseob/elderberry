package com.globalcarelink.agents.documentation.models;

import lombok.Data;

@Data
public class ApiParameter {
    private String name;
    private String type;
    private boolean required;
    private String description;
}