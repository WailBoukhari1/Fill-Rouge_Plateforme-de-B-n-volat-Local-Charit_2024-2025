package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fill_rouge.backend.constant.EventParticipationStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "event_participations")
@CompoundIndex(name = "volunteer_event_idx", def = "{'volunteerId': 1, 'eventId': 1}", unique = true)
public class EventParticipation {
    @Id
    private String id;
    
    @NotNull(message = "Volunteer ID is required")
    private String volunteerId;
    
    @NotNull(message = "Event ID is required")
    private String eventId;
    
    @DBRef
    private Event event;
    
    @DBRef
    private VolunteerProfile volunteer;
    
    @NotNull(message = "Participation status is required")
    private EventParticipationStatus status = EventParticipationStatus.REGISTERED;
    
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;
    
    private String feedback;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private LocalDateTime registeredAt;
    private LocalDateTime updatedAt;
    private LocalDateTime registrationDate;
    private LocalDateTime createdAt;
    private Integer hours;
    private Long hoursContributed;
    private String specialRequirements;
    private String notes;
    
    public void checkIn() {
        this.status = EventParticipationStatus.ATTENDED;
        this.checkInTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void checkOut() {
        this.checkOutTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // Calculate hours between check-in and check-out
        if (this.checkInTime != null) {
            this.hours = (int) java.time.Duration.between(this.checkInTime, this.checkOutTime).toHours();
        }
    }
    
    public void submitFeedback(int rating, String feedback) {
        this.rating = rating;
        this.feedback = feedback;
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean hasAttended() {
        return status == EventParticipationStatus.ATTENDED;
    }
    
    public boolean hasCompleted() {
        return hasAttended() && checkOutTime != null;
    }
    
    public boolean hasSubmittedFeedback() {
        return rating != null && feedback != null;
    }

    public void setVolunteer(VolunteerProfile volunteer) {
        this.volunteer = volunteer;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public void setHoursContributed(long hoursContributed) {
        this.hoursContributed = hoursContributed;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 