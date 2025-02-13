package com.backend.backend.dto.response;

import com.backend.backend.model.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private String id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationDeadline;
    private Integer maxParticipants;
    private String organizationId;
    private String organizationName;
    private String category;
    private String imageUrl;
    private boolean requiresApproval;
    private EventStatus status;
    
    // Additional fields for search results
    private Double distance;
    private Long registrationCount;
    private Boolean isFull;
    private String organizationLogo;
    private List<String> requiredSkills;
    private Set<String> registeredParticipants;
    private String statusText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isRegistered;
    private int availableSpots;
} 