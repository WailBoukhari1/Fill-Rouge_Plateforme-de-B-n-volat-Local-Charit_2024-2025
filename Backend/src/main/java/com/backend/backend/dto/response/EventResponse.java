package com.backend.backend.dto.response;

import com.backend.backend.domain.model.EventStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class EventResponse {
    private String id;
    private String title;
    private String description;
    private LocalDateTime dateTime;
    private String location;
    private Set<String> requiredSkills;
    private int volunteersNeeded;
    private int registeredVolunteers;
    private String organizationId;
    private String organizationName;
    private EventStatus status;
    private double latitude;
    private double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isRegistered; // For logged-in volunteer
} 