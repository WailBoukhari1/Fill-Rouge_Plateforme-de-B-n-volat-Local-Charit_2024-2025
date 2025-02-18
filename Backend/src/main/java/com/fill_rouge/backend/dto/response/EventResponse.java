package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;

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
}
