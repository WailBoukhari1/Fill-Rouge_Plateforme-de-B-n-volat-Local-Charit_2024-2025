package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VolunteerProfileResponse {
    // Basic Profile Info
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String bio;
    private String profilePicture;
    private LocalDateTime joinedAt;
    
    @Builder.Default
    private boolean isActive = true;
    
    private String status; // ACTIVE, INACTIVE, SUSPENDED, BANNED

    // Statistics Summary
    private int totalEventsAttended;
    private int totalVolunteerHours;
    private double averageEventRating;
    private int completionPercentage;
    
    // Skills and Interests
    @Builder.Default
    private Set<String> skills = new HashSet<>();
    
    @Builder.Default
    private Set<String> interests = new HashSet<>();
    
    @Builder.Default
    private Set<String> preferredCauses = new HashSet<>();
    
    // Activity Summary
    @Builder.Default
    private List<EventResponse> upcomingEvents = new ArrayList<>();
    
    @Builder.Default
    private List<EventResponse> pastEvents = new ArrayList<>();
    
    @Builder.Default
    private List<AchievementResponse> achievements = new ArrayList<>();

    // Personal Information
    private String city;
    private String country;
    private String emergencyContact;
    private String emergencyPhone;

    // Volunteering Preferences
    @Builder.Default
    private Set<String> preferredCategories = new HashSet<>();
    
    @Builder.Default
    private int maxHoursPerWeek = 20;
    
    @Builder.Default
    private double preferredRadius = 10.0;
    
    @Builder.Default
    private Set<String> availableDays = new HashSet<>();
    
    private String preferredTimeOfDay = "FLEXIBLE";

    // Experience & Verification
    @Builder.Default
    private List<String> certifications = new ArrayList<>();
    
    @Builder.Default
    private List<String> languages = new ArrayList<>();
    
    private boolean backgroundChecked;
    private LocalDateTime backgroundCheckDate;
    private String backgroundCheckStatus;
    
    @Builder.Default
    private List<String> references = new ArrayList<>();

    // Statistics & Metrics
    private int reliabilityScore = 100;
    private int impactScore = 0;

    // Preferences & Settings
    private boolean availableForEmergency;
    private boolean receiveNotifications = true;
    
    @Builder.Default
    private Set<String> notificationPreferences = new HashSet<>();
    
    private boolean profileVisible = true;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 