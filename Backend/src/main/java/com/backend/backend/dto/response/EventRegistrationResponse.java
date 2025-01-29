package com.backend.backend.dto.response;

import com.backend.backend.domain.model.RegistrationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EventRegistrationResponse {
    private String id;
    private String eventId;
    private String volunteerId;
    private LocalDateTime registrationDate;
    private RegistrationStatus status;
} 