package com.fill_rouge.backend.domain;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Document(collection = "events")
public class Event {
    @Id
    private String id;
    
    @NotBlank(message = "Event title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    @Indexed
    private String title;
    
    @NotBlank(message = "Event description is required")
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;
    
    @NotBlank(message = "Organization ID is required")
    private String organizationId;
    
    @NotBlank(message = "Event location is required")
    private String location;
    
    @Size(min = 2, max = 2, message = "Coordinates must contain exactly 2 values [latitude, longitude]")
    private double[] coordinates;
    
    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;
    
    @Min(value = 1, message = "Minimum participants must be at least 1")
    @Max(value = 1000, message = "Maximum participants cannot exceed 1000")
    private int maxParticipants;
    
    private Set<String> registeredParticipants = new HashSet<>();
    
    @NotNull(message = "Event category is required")
    private EventCategory category;
    
    @NotNull(message = "Event status is required")
    private EventStatus status = EventStatus.PENDING;
    
    private List<String> requiredSkills = new ArrayList<>();
    
    private boolean waitlistEnabled = true;
    
    @Min(value = 0, message = "Waitlist size cannot be negative")
    @Max(value = 500, message = "Waitlist size cannot exceed 500")
    private int maxWaitlistSize = 50;
    
    private Set<String> waitlistedParticipants = new HashSet<>();
    
    @PositiveOrZero(message = "Total volunteer hours cannot be negative")
    private int totalVolunteerHours = 0;
    
    @DecimalMin(value = "0.0", message = "Average rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Average rating cannot exceed 5.0")
    private double averageRating = 0.0;
    
    @PositiveOrZero(message = "Number of ratings cannot be negative")
    private int numberOfRatings = 0;
    
    private String impactSummary;
    
    @NotNull(message = "Created date is required")
    private LocalDateTime createdAt;
    
    @NotNull(message = "Updated date is required")
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private boolean isCancelled = false;
    private String cancellationReason;
    private LocalDateTime cancellationDate;
    private String cancelledBy;
    private boolean isRecurring = false;
    private String recurrencePattern;
    private LocalDateTime recurrenceEndDate;
    private boolean requiresApproval = false;
    private Set<String> approvedParticipants = new HashSet<>();
    private Set<String> rejectedParticipants = new HashSet<>();
    private Set<String> pendingParticipants = new HashSet<>();
    private int minimumAge = 0;
    private boolean requiresBackground = false;
    private Set<String> tags = new HashSet<>();
    private String virtualMeetingLink;
    private boolean isVirtual = false;
    private String difficulty = "BEGINNER";
    private int durationHours;
    private boolean isSpecialEvent = false;
    private int pointsAwarded = 0;
    private Set<String> resources = new HashSet<>();
    private Set<String> sponsors = new HashSet<>();
    private double budget = 0.0;
    private String currency = "USD";
    private boolean isPublished = false;
    private LocalDateTime publishedAt;
    private String publishedBy;

    // Default constructor with initialization
    public Event() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = EventStatus.PENDING;
    }

    // Custom methods that provide additional functionality beyond simple getters/setters
    public void updateRating(int newRating) {
        if (newRating < 1 || newRating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        double totalRating = this.averageRating * this.numberOfRatings;
        this.numberOfRatings++;
        this.averageRating = (totalRating + newRating) / this.numberOfRatings;
    }

    // Utility methods
    public boolean isWaitlistFull() {
        return waitlistEnabled && waitlistedParticipants.size() >= maxWaitlistSize;
    }

    public boolean canJoinWaitlist() {
        return waitlistEnabled && !isWaitlistFull();
    }

    public void addVolunteerHours(int hours) {
        if (hours > 0) {
            this.totalVolunteerHours += hours;
        }
    }

    public boolean isRegistrationOpen() {
        return !isCancelled && 
               status == EventStatus.APPROVED && 
               registeredParticipants.size() < maxParticipants &&
               LocalDateTime.now().isBefore(startDate);
    }

    public boolean isInProgress() {
        LocalDateTime now = LocalDateTime.now();
        return !isCancelled && 
               status == EventStatus.APPROVED &&
               now.isAfter(startDate) && 
               now.isBefore(endDate);
    }

    public boolean isCompleted() {
        return !isCancelled && 
               status == EventStatus.APPROVED && 
               LocalDateTime.now().isAfter(endDate);
    }

    public int getAvailableSpots() {
        return maxParticipants - registeredParticipants.size();
    }

    public boolean canRegister(String userId) {
        return isRegistrationOpen() && 
               !isParticipantRegistered(userId) &&
               getAvailableSpots() > 0;
    }

    private boolean isParticipantRegistered(String userId) {
        return registeredParticipants.contains(userId) || 
               waitlistedParticipants.contains(userId) ||
               pendingParticipants.contains(userId);
    }
} 