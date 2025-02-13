package com.backend.backend.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {
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

    @NotBlank(message = "Location is required")
    private String location;

    @Min(value = 1, message = "Maximum participants must be at least 1")
    private Integer maxParticipants;

    private String category;

    private String imageUrl;

    private boolean requiresApproval;

    @Future(message = "Registration deadline must be in the future")
    private LocalDateTime registrationDeadline;
} 