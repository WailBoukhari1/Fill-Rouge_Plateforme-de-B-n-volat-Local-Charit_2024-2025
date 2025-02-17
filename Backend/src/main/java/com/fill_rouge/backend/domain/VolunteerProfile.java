package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Document(collection = "volunteer_profiles")
public class VolunteerProfile {
    @Id
    private String id;

    @DBRef
    @NotNull(message = "Volunteer reference is required")
    private Volunteer volunteer;

    // Personal Information
    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;
    
    private String profilePicture;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "Country is required")
    private String country;
    
    @NotBlank(message = "Emergency contact name is required")
    private String emergencyContact;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid emergency phone number format")
    private String emergencyPhone;

    // Core Volunteering Info
    private Set<String> preferredCategories = new HashSet<>();
    private Set<String> skills = new HashSet<>();
    private Set<String> interests = new HashSet<>();
    private Set<String> availableDays = new HashSet<>();
    private String preferredTimeOfDay = "FLEXIBLE";
    private List<String> languages = new ArrayList<>();
    private List<String> certifications = new ArrayList<>();

    // Metrics
    @PositiveOrZero
    private int totalEventsAttended = 0;
    @PositiveOrZero
    private int totalHoursVolunteered = 0;
    @DecimalMin("0.0") @DecimalMax("5.0")
    private double averageRating = 0.0;
    @Min(0) @Max(100)
    private int reliabilityScore = 100;
    private List<String> badges = new ArrayList<>();

    // Preferences
    private boolean availableForEmergency = false;
    private boolean receiveNotifications = true;
    private Set<String> notificationPreferences = new HashSet<>();
    private boolean profileVisible = true;

    // Verification
    private boolean backgroundChecked = false;
    private LocalDateTime backgroundCheckDate;
    private String backgroundCheckStatus = "PENDING";

    // Timestamps
    @NotNull
    private LocalDateTime createdAt;
    @NotNull
    private LocalDateTime updatedAt;

    public VolunteerProfile() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        initializeCollections();
    }

    private void initializeCollections() {
        this.preferredCategories = new HashSet<>();
        this.skills = new HashSet<>();
        this.interests = new HashSet<>();
        this.availableDays = new HashSet<>();
        this.languages = new ArrayList<>();
        this.certifications = new ArrayList<>();
        this.badges = new ArrayList<>();
        this.notificationPreferences = new HashSet<>();
    }

    public void updateRating(double newRating) {
        if (newRating < 0 || newRating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        this.averageRating = newRating;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateReliabilityScore(int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("Reliability score must be between 0 and 100");
        }
        this.reliabilityScore = score;
        this.updatedAt = LocalDateTime.now();
    }
}