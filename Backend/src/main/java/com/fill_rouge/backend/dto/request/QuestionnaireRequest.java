package com.fill_rouge.backend.dto.request;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fill_rouge.backend.constant.Role;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for questionnaire submission
 */
@Data
public class QuestionnaireRequest {
    @NotNull(message = "Role is required")
    private Role role;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(?:\\+212|0)[5-7]\\d{8}$", message = "Invalid phone number format")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Province is required")
    private String province;

    @NotBlank(message = "Country is required")
    private String country;
    
    // Organization specific fields
    private String type;
    private String name;
    
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;
    
    @Size(min = 20, max = 1000, message = "Mission statement must be between 20 and 1000 characters")
    private String missionStatement;
    
    private String vision;
    
    @Pattern(regexp = "^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([/\\w-]*)*\\/?$", 
            message = "Invalid website URL format")
    private String website;
    
    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid registration number format")
    private String registrationNumber;
    
    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid tax ID format")
    private String taxId;
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> focusAreas = new HashSet<>();
    
    @Min(value = 1800, message = "Founded year must be after 1800")
    @Max(value = 2024, message = "Founded year cannot be in the future")
    private Integer foundedYear;
    
    @Valid
    private SocialMediaLinksDTO socialMediaLinks;
    
    // Volunteer specific fields
    @Size(min = 50, max = 1000, message = "Bio must be between 50 and 1000 characters")
    private String bio;
    
    @Size(max = 500, message = "Education cannot exceed 500 characters")
    private String education;
    
    @Size(max = 1000, message = "Experience cannot exceed 1000 characters")
    private String experience;
    
    @Size(max = 500, message = "Special needs cannot exceed 500 characters")
    private String specialNeeds;
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> skills = new HashSet<>();
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> interests = new HashSet<>();
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private Set<String> availableDays = new HashSet<>();
    
    private String preferredTimeOfDay;
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private List<String> languages;
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    private List<String> certifications;
    
    private boolean availableForEmergency;
    
    @Valid
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
        @NotBlank(message = "Emergency contact name is required")
        @Size(min = 2, max = 100, message = "Emergency contact name must be between 2 and 100 characters")
        private String name;
        
        private String relationship;
        
        @NotBlank(message = "Emergency contact phone is required")
        @Pattern(regexp = "^(?:\\+212|0)[5-7]\\d{8}$", message = "Invalid emergency contact phone number format")
        private String phone;
    }
} 