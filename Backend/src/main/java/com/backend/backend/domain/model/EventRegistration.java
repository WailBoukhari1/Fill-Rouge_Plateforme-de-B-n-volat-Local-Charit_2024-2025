package com.backend.backend.domain.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import java.time.LocalDateTime;

@Data
@Document(collection = "event_registrations")
@CompoundIndex(name = "event_volunteer_idx", def = "{'eventId': 1, 'volunteerId': 1}", unique = true)
public class EventRegistration {
    @Id
    private String id;

    @NotBlank(message = "Event ID is required")
    private String eventId;

    @NotBlank(message = "Volunteer ID is required")
    private String volunteerId;

    @NotNull(message = "Registration date is required")
    @PastOrPresent(message = "Registration date cannot be in the future")
    private LocalDateTime registrationDate;

    @NotNull(message = "Registration status is required")
    private RegistrationStatus status;
} 