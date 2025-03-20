package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventResponse {
    private String id;
    private String title;
    private String description;
    private String organizationId;
    private String location;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int maxParticipants;
    private int currentParticipants;
    private EventCategory category;
    private EventStatus status;
    private double averageRating;
    private int numberOfRatings;
    
    // Contact information
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    
    // Participation status
    private boolean isRegistered;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields
    private double[] coordinates;
    private boolean waitlistEnabled;
    private int maxWaitlistSize;
    private List<String> requiredSkills;
    private boolean virtual;
    private boolean requiresApproval;
    private String difficulty;
    private Set<String> tags;
    private boolean recurring;
    private int minimumAge;
    private boolean requiresBackground;
    private boolean specialEvent;
    private int pointsAwarded;
    private int durationHours;
    private String bannerImage;
}
