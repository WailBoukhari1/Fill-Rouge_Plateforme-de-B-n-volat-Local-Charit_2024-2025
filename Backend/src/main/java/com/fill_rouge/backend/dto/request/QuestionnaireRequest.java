package com.fill_rouge.backend.dto.request;

import java.util.List;

import com.fill_rouge.backend.constant.Role;

import lombok.Data;

/**
 * DTO for questionnaire submission
 */
@Data
public class QuestionnaireRequest {
    private Role role;
    private String bio;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    
    // Organization specific fields
    private String organizationName;
    private String website;
    private String description;
    
    // Volunteer specific fields
    private List<String> skills;
    private List<String> interests;
    private List<String> availability;
} 