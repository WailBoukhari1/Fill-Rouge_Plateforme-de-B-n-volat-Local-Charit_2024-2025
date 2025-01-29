package com.backend.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationResponse {
    private String id;
    private String name;
    private String description;
    private String logo;
    private String contactEmail;
    private String contactPhone;
    private boolean verified;
    private int totalEvents;
    private int activeVolunteers;
} 