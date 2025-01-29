package com.backend.backend.domain.model;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Document(collection = "events")
public class Event {
    @Id
    private String id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotNull(message = "Event date and time is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime dateTime;

    @NotBlank(message = "Location is required")
    private String location;

    @NotEmpty(message = "At least one required skill must be specified")
    private Set<String> requiredSkills;

    @Min(value = 1, message = "At least one volunteer is needed")
    @Max(value = 1000, message = "Maximum 1000 volunteers allowed")
    private int volunteersNeeded;

    @NotBlank(message = "Organization ID is required")
    @Indexed
    private String organizationId;

    @NotNull(message = "Event status is required")
    private EventStatus status;

    @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
    private double latitude;

    @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
    private double longitude;
} 