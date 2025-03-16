package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.time.Duration;
import java.util.List;
import java.util.ArrayList;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.constant.EventParticipationStatus;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "events")
public class Event {
    @Id
    private String id;
    
    @DBRef
    private Organization organization;
    
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
    
    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;
    
    @Min(value = 1, message = "Minimum participants must be at least 1")
    @Max(value = 100, message = "Maximum participants cannot exceed 100")
    private int maxParticipants;
    
    private Set<String> registeredParticipants = new HashSet<>();
    private Set<String> waitlistedParticipants = new HashSet<>();
    
    @NotNull(message = "Event category is required")
    private EventCategory category;
    
    @NotNull(message = "Event status is required")
    private EventStatus status = EventStatus.PENDING;
    
    private double averageRating = 0.0;
    private int numberOfRatings = 0;
    
    @NotNull(message = "Created date is required")
    private LocalDateTime createdAt;
    
    @NotNull(message = "Updated date is required")
    private LocalDateTime updatedAt;
    
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    
    @DBRef
    private List<EventParticipation> participations = new ArrayList<>();
    
    // Utility methods
    public boolean isRegistrationOpen() {
        return status == EventStatus.ACTIVE && 
               registeredParticipants.size() < maxParticipants &&
               LocalDateTime.now().isBefore(startDate);
    }

    public boolean isInProgress() {
        LocalDateTime now = LocalDateTime.now();
        return status == EventStatus.ONGOING &&
               now.isAfter(startDate) && 
               now.isBefore(endDate);
    }

    public boolean isCompleted() {
        return status == EventStatus.COMPLETED;
    }

    public int getAvailableSpots() {
        return maxParticipants - registeredParticipants.size();
    }

    public void updateRating(int newRating) {
        if (newRating < 1 || newRating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        double totalRating = this.averageRating * this.numberOfRatings;
        this.numberOfRatings++;
        this.averageRating = (totalRating + newRating) / this.numberOfRatings;
    }

    public int getTotalVolunteerHours() {
        long hours = Duration.between(startDate, endDate).toHours();
        return (int) (hours * participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
            .count());
    }

    public int getParticipantCount() {
        return registeredParticipants.size();
    }

    public Double getRating() {
        return averageRating;
    }

    public EventCategory getCategory() {
        return category;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public EventStatus getStatus() {
        return status;
    }
} 