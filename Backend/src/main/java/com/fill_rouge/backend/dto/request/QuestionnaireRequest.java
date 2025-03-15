package com.fill_rouge.backend.dto.request;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fill_rouge.backend.constant.Role;

import lombok.Data;

/**
 * DTO for questionnaire submission
 */
@Data
public class QuestionnaireRequest {
    private Role role;
    private String phoneNumber;
    private String address;
    private String city;
    private String province;
    private String country;
    
    // Organization specific fields
    private String type;
    private String name;
    private String description;
    private String missionStatement;
    private String vision;
    private String website;
    private String registrationNumber;
    private String taxId;
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> focusAreas = new HashSet<>();
    private Integer foundedYear;
    private SocialMediaLinksDTO socialMediaLinks;
    
    // Volunteer specific fields
    private String bio;
    private String education;
    private String experience;
    private String specialNeeds;
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> skills = new HashSet<>();
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> interests = new HashSet<>();
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> availableDays = new HashSet<>();
    
    private String preferredTimeOfDay;
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private List<String> languages = List.of();
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private List<String> certifications = List.of();
    
    private boolean availableForEmergency;
    private EmergencyContactDTO emergencyContact;
    
    @Data
    public static class SocialMediaLinksDTO {
        private String facebook;
        private String twitter;
        private String instagram;
        private String linkedin;
    }
    
    @Data
    public static class EmergencyContactDTO {
        private String name;
        private String relationship;
        private String phone;
    }
} 