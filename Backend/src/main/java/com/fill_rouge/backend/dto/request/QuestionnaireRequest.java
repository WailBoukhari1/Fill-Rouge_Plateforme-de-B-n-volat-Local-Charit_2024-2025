package com.fill_rouge.backend.dto.request;

import com.fill_rouge.backend.constant.Role;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionnaireRequest {
    @NotNull(message = "Role is required")
    private Role role;
    
    // Common fields
    private String phoneNumber;
    private String address;
    private String city;
    private String province;
    
    // Organization fields
    private String organizationName;
    private String organizationWebsite;
    private String organizationDescription;
    
    // Volunteer fields
    private String[] skills;
    private String[] interests;
    private String bio;
    private String availability;
    private String education;
    private String experience;
    private Boolean drivingLicense;
    private String specialNeeds;
    private EmergencyContact emergencyContact;
    private VolunteerStatistics statistics;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContact {
        private String name;
        private String relationship;
        private String phone;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VolunteerStatistics {
        private Integer experienceYears;
        private Integer hoursPerWeek;
        private String commitmentLength;
        private Integer maxTravelDistance;
    }
} 