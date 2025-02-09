package com.backend.backend.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000)
    private String description;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime dateTime;

    @NotBlank(message = "Location is required")
    private String location;

    @NotEmpty(message = "At least one required skill must be specified")
    private Set<String> requiredSkills;

    @Min(1) @Max(1000)
    private int volunteersNeeded;

    @DecimalMin("-90.0") @DecimalMax("90.0")
    private double latitude;

    @DecimalMin("-180.0") @DecimalMax("180.0")
    private double longitude;
} 