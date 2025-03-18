package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "organizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    
    private String profilePicture;
    
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
    
    private String province;
    
    private String postalCode;
    
    @Size(min = 2, max = 2, message = "Coordinates must contain exactly 2 values [longitude, latitude]")
    private double[] coordinates;
    
    @NotEmpty(message = "At least one focus area is required")
    @Builder.Default
    private Set<String> focusAreas = new HashSet<>();
    
    @Field("social_media_links")
    private SocialMediaLinks socialMediaLinks;
    
    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid registration number format")
    private String registrationNumber;
    
    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid tax ID format")
    private String taxId;
    
    @Builder.Default
    private List<String> documents = new ArrayList<>();
    
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
    private List<VolunteerProfile> volunteerProfiles = new ArrayList<>();
    
    @DBRef
    private List<Event> events = new ArrayList<>();
    
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