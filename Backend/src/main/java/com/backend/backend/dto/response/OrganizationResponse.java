package com.backend.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {
    private String id;
    private String name;
    private String description;
    private String website;
    private String logo;
    private String address;
    private String phone;
    private boolean verified;
    private String mission;
    private String vision;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for detailed response
    private int totalEvents;
    private int activeVolunteers;
    private double rating;
} 