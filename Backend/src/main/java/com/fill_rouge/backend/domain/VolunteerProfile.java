package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
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
    @Size(min = 50, max = 1000, message = "Bio must be between 50 and 1000 characters")
    private String bio;
    
    private String profilePicture;
    
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

    // Emergency Contact Information
    private EmergencyContact emergencyContact;

    // Core Volunteering Info
    @Builder.Default
    private Set<String> preferredCategories = new HashSet<>();
    
    @Builder.Default
    private List<Skill> skills = new ArrayList<>();
    
    @Builder.Default
    private Set<String> interests = new HashSet<>();
    
    @Builder.Default
    private Set<String> availableDays = new HashSet<>();
    
    private String preferredTimeOfDay = "FLEXIBLE";
    
    @Builder.Default
    private List<String> languages = new ArrayList<>();
    
    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    // Education and Experience
    @Size(max = 500, message = "Education cannot exceed 500 characters")
    private String education;
    
    @Size(max = 1000, message = "Experience cannot exceed 1000 characters")
    private String experience;
    
    @Size(max = 500, message = "Special needs cannot exceed 500 characters")
    private String specialNeeds;

    // Availability and Preferences
    private boolean availableForEmergency;
    private boolean receiveNotifications;
    private Set<String> notificationPreferences;
    private boolean profileVisible;
    
    @PositiveOrZero(message = "Maximum hours per week cannot be negative")
    private Integer maxHoursPerWeek;
    
    @PositiveOrZero(message = "Preferred radius cannot be negative")
    private Integer preferredRadius;

    // Statistics
    @PositiveOrZero(message = "Total events attended cannot be negative")
    @Builder.Default
    private int totalEventsAttended = 0;
    
    @PositiveOrZero(message = "Total volunteer hours cannot be negative")
    @Builder.Default
    private int totalHoursVolunteered = 0;
    
    @DecimalMin(value = "0.0", message = "Average rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Average rating cannot exceed 5.0")
    @Builder.Default
    private Double averageRating = 0.0;
    
    @PositiveOrZero(message = "Number of ratings cannot be negative")
    @Builder.Default
    private int numberOfRatings = 0;
    
    @DecimalMin(value = "0.0", message = "Reliability score cannot be negative")
    @DecimalMax(value = "100.0", message = "Reliability score cannot exceed 100")
    @Builder.Default
    private Double reliabilityScore = 0.0;
    
    @DecimalMin(value = "0.0", message = "Impact score cannot be negative")
    @Builder.Default
    private Double impactScore = 0.0;

    // Badges and Achievements
    @Builder.Default
    private Set<String> badges = new HashSet<>();

    // Background Check
    private boolean backgroundChecked;
    private String backgroundCheckStatus;
    private LocalDateTime backgroundCheckDate;
    private List<String> references;

    // Status and Dates
    @Builder.Default
    private boolean active = true;
    
    private String status;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastActivityDate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContact {
        @NotBlank(message = "Emergency contact name is required")
        @Size(min = 2, max = 100, message = "Emergency contact name must be between 2 and 100 characters")
        private String name;
        
        private String relationship;
        
        @NotBlank(message = "Emergency contact phone is required")
        @Pattern(regexp = "^(?:\\+212|0)[5-7]\\d{8}$", message = "Invalid emergency contact phone number format")
        private String phone;
    }

    public void updateRating(int newRating) {
        if (newRating < 1 || newRating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        double totalRating = (this.averageRating != null ? this.averageRating : 0.0) * this.numberOfRatings + (double)newRating;
        this.numberOfRatings++;
        this.averageRating = Double.valueOf(totalRating / this.numberOfRatings);
        this.updatedAt = LocalDateTime.now();
    }

    public void addVolunteerHours(int hours) {
        if (hours < 0) {
            throw new IllegalArgumentException("Hours cannot be negative");
        }
        this.totalHoursVolunteered += hours;
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementEventsAttended() {
        this.totalEventsAttended++;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateLastActivityDate() {
        this.lastActivityDate = LocalDateTime.now();
        this.updatedAt = this.lastActivityDate;
    }

    public void updateReliabilityScore(int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("Reliability score must be between 0 and 100");
        }
        this.reliabilityScore = Double.valueOf(score);
        this.updatedAt = LocalDateTime.now();
    }

    public void addSkill(Skill skill) {
        this.skills.add(skill);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeSkill(Skill skill) {
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
        this.active = "ACTIVE".equals(newStatus);
        this.updatedAt = LocalDateTime.now();
    }

    public void updateLastActivity() {
        this.lastActivityDate = LocalDateTime.now();
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

    public List<Skill> getSkills() {
        return skills;
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills;
    }
}