package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "volunteer_profiles")
public class VolunteerProfile {
    @Id
    private String id;

    @DBRef
    @NotNull(message = "User reference is required")
    private User user;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Indexed(unique = true)
    private String email;

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
    @Builder.Default
    private Set<String> preferredCategories = new HashSet<>();
    
    @Builder.Default
    private Set<String> skills = new HashSet<>();
    
    @Builder.Default
    private Set<String> interests = new HashSet<>();
    
    @Builder.Default
    private Set<String> availableDays = new HashSet<>();
    
    private String preferredTimeOfDay = "FLEXIBLE";
    
    @Builder.Default
    private List<String> languages = new ArrayList<>();
    
    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    // Participations
    @Builder.Default
    private List<EventParticipation> participations = new ArrayList<>();

    // Metrics
    @PositiveOrZero
    private int totalEventsAttended = 0;
    
    @PositiveOrZero
    private int totalHoursVolunteered = 0;
    
    @DecimalMin("0.0") @DecimalMax("5.0")
    private double averageRating = 0.0;
    
    @Min(0) @Max(100)
    private int reliabilityScore = 100;
    
    @Builder.Default
    private List<String> badges = new ArrayList<>();

    // Preferences
    private boolean availableForEmergency = false;
    private boolean receiveNotifications = true;
    
    @Builder.Default
    private Set<String> notificationPreferences = new HashSet<>();
    
    private boolean profileVisible = true;

    // Verification
    private boolean backgroundChecked = false;
    private LocalDateTime backgroundCheckDate;
    private String backgroundCheckStatus = "PENDING";

    // Status
    private boolean isActive = true;
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED, BANNED

    // Timestamps
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime joinDate = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime lastActivityDate = LocalDateTime.now();

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

    public void addSkill(String skill) {
        this.skills.add(skill);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeSkill(String skill) {
        this.skills.remove(skill);
        this.updatedAt = LocalDateTime.now();
    }

    public void addCertification(String certification) {
        this.certifications.add(certification);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeCertification(String certification) {
        this.certifications.remove(certification);
        this.updatedAt = LocalDateTime.now();
    }

    public void updateStatus(String newStatus) {
        this.status = newStatus;
        this.isActive = "ACTIVE".equals(newStatus);
        this.updatedAt = LocalDateTime.now();
    }

    public void updateLastActivity() {
        this.lastActivityDate = LocalDateTime.now();
    }

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