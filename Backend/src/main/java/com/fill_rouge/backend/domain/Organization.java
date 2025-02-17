package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Document(collection = "organizations")
public class Organization {
    @Id
    private String id;
    
    @DBRef
    @NotNull(message = "User reference is required")
    private User user;
    
    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Indexed(unique = true)
    private String name;
    
    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;
    
    @NotBlank(message = "Mission statement is required")
    @Size(min = 20, max = 1000, message = "Mission must be between 20 and 1000 characters")
    private String mission;
    
    @Size(max = 1000, message = "Vision cannot exceed 1000 characters")
    private String vision;
    
    private String logo;
    
    @Pattern(regexp = "^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$", 
            message = "Invalid website URL format")
    private String website;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    @Indexed
    private String phoneNumber;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "Country is required")
    private String country;
    
    @Size(min = 2, max = 2, message = "Coordinates must contain exactly 2 values [latitude, longitude]")
    private double[] coordinates;
    
    @NotEmpty(message = "At least one focus area is required")
    private Set<String> focusAreas = new HashSet<>();
    
    private List<String> socialMediaLinks = new ArrayList<>();
    
    private boolean verified = false;
    
    private LocalDateTime verificationDate;
    
    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid registration number format")
    private String registrationNumber;
    
    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid tax ID format")
    private String taxId;
    
    private List<String> documents = new ArrayList<>();
    
    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    private double rating = 0.0;
    
    @PositiveOrZero(message = "Number of ratings cannot be negative")
    private int numberOfRatings = 0;
    
    @PositiveOrZero(message = "Total events hosted cannot be negative")
    private int totalEventsHosted = 0;
    
    @PositiveOrZero(message = "Active volunteers cannot be negative")
    private int activeVolunteers = 0;
    
    @PositiveOrZero(message = "Total volunteer hours cannot be negative")
    private int totalVolunteerHours = 0;
    
    @DecimalMin(value = "0.0", message = "Impact score cannot be negative")
    private double impactScore = 0.0;
    
    private boolean acceptingVolunteers = true;
    
    @NotNull(message = "Created date is required")
    private LocalDateTime createdAt;
    
    @NotNull(message = "Updated date is required")
    private LocalDateTime updatedAt;
    
    public Organization() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.verified = false;
        this.rating = 0.0;
        this.numberOfRatings = 0;
        this.totalEventsHosted = 0;
        this.activeVolunteers = 0;
        this.totalVolunteerHours = 0;
        this.impactScore = 0.0;
        this.acceptingVolunteers = true;
        this.focusAreas = new HashSet<>();
        this.socialMediaLinks = new ArrayList<>();
        this.documents = new ArrayList<>();
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
} 