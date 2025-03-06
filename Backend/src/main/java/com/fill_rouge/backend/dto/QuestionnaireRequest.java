package com.fill_rouge.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for questionnaire submission
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionnaireRequest {
    private String role;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    
    // Organization specific fields
    private String organizationName;
    private String website;
    private String description;
    
    // Volunteer specific fields
    private String bio;
    private List<String> skills;
    private List<String> interests;
    private List<String> availability;
} 