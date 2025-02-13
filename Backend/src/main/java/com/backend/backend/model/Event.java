package com.backend.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "events")
public class Event {
    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;

    private LocalDateTime registrationDeadline;

    @Min(value = 1, message = "Maximum participants must be at least 1")
    private Integer maxParticipants;

    @NotBlank(message = "Location is required")
    private String location;

    private Double latitude;
    private Double longitude;

    private String organizationId;

    private boolean active = true;

    private String category;

    private String imageUrl;

    private boolean requiresApproval = false;

    private EventStatus status = EventStatus.DRAFT;
} 