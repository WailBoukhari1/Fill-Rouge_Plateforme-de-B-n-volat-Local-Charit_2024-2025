package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
@Document(collection = "organizations")
public class Organization {
    @Id
    private String id;

    @DBRef
    private User user;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;

    @NotBlank(message = "Mission statement is required")
    @Size(min = 20, max = 1000, message = "Mission statement must be between 20 and 1000 characters")
    private String mission;

    @Size(max = 1000, message = "Vision cannot exceed 1000 characters")
    private String vision;

    @Pattern(regexp = "^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([/\\w-]*)*\\/?$", 
            message = "Invalid website URL format")
    private String website;

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

    private String postalCode;

    private double[] coordinates;

    @NotEmpty(message = "At least one focus area is required")
    @Builder.Default
    private Set<String> focusAreas = new HashSet<>();

    private SocialMediaLinks socialMediaLinks;

    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid registration number format")
    private String registrationNumber;

    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid tax ID format")
    private String taxId;

    @Builder.Default
    private List<String> documents = new ArrayList<>();

    private String profilePicture;

    private String logo;

    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    @Builder.Default
    private double rating = 0.0;

    @PositiveOrZero(message = "Number of ratings cannot be negative")
    @Builder.Default
    private int numberOfRatings = 0;

    @PositiveOrZero(message = "Total events hosted cannot be negative")
    @Builder.Default
    private int totalEventsHosted = 0;

    @PositiveOrZero(message = "Active volunteers cannot be negative")
    @Builder.Default
    private int activeVolunteers = 0;

    @PositiveOrZero(message = "Total volunteer hours cannot be negative")
    @Builder.Default
    private int totalVolunteerHours = 0;

    @DecimalMin(value = "0.0", message = "Impact score cannot be negative")
    @Builder.Default
    private double impactScore = 0.0;

    @Builder.Default
    private boolean acceptingVolunteers = true;

    @Builder.Default
    private boolean verified = false;

    private LocalDateTime verificationDate;

    @NotBlank(message = "Organization type is required")
    private String type;

    @NotBlank(message = "Organization category is required")
    private String category;

    @NotBlank(message = "Organization size is required")
    private String size;

    private Integer foundedYear;

    @CreatedDate
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @LastModifiedDate
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @DBRef
    @Builder.Default
    private List<VolunteerProfile> volunteerProfiles = new ArrayList<>();

    @DBRef
    @Builder.Default
    private List<Event> events = new ArrayList<>();

    // Status Fields for Approval System
    @Builder.Default
    private String roleStatus = "INCOMPLETE"; // INCOMPLETE, PENDING, APPROVED, REJECTED
    
    private String rejectionReason;
    
    @Builder.Default
    private boolean banned = false;
    
    private String banReason;

    @Data
    public static class SocialMediaLinks {
        private String facebook;
        private String twitter;
        private String instagram;
        private String linkedin;
    }

    public void updateRating(int newRating) {
        if (newRating < 1 || newRating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        double totalRating = (this.rating * this.numberOfRatings) + newRating;
        this.numberOfRatings++;
        this.rating = totalRating / this.numberOfRatings;
        this.updatedAt = LocalDateTime.now();
    }

    public int getVolunteerCount() {
        return volunteerProfiles.size();
    }

    public int getActiveVolunteerCount() {
        LocalDateTime monthAgo = LocalDateTime.now().minusMonths(1);
        return (int) volunteerProfiles.stream()
            .filter(v -> v.getLastActivityDate() != null && v.getLastActivityDate().isAfter(monthAgo))
            .count();
    }

    public int getTotalVolunteerHours() {
        return events.stream()
            .mapToInt(Event::getTotalVolunteerHours)
            .sum();
    }

    public int getTotalEventsHosted() {
        return events.size();
    }
} 