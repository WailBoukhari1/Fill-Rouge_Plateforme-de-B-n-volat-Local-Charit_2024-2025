package com.backend.backend.dto.response;

import java.time.LocalDateTime;

import com.backend.backend.model.RegistrationStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventRegistrationResponse {
    private String id;
    private String eventId;
    private String volunteerId;
    private LocalDateTime registrationDate;
    private LocalDateTime lastUpdated;
    private RegistrationStatus status;
    
    // Additional fields for detailed response
    private String eventTitle;
    private String volunteerName;
    private LocalDateTime eventDate;
} 