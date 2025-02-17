package com.fill_rouge.backend.dto.request;

import com.fill_rouge.backend.constant.EventCategory;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {
    @NotBlank(message = "Event title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @NotBlank(message = "Event description is required")
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;

    @NotBlank(message = "Event location is required")
    private String location;

    @Size(min = 2, max = 2, message = "Coordinates must contain exactly 2 values [latitude, longitude]")
    private double[] coordinates;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;

    @Min(value = 1, message = "Minimum participants must be at least 1")
    @Max(value = 1000, message = "Maximum participants cannot exceed 1000")
    private int maxParticipants;

    @NotNull(message = "Event category is required")
    private EventCategory category;

    private List<String> requiredSkills;

    private boolean waitlistEnabled = true;

    @Min(value = 0, message = "Waitlist size cannot be negative")
    @Max(value = 500, message = "Waitlist size cannot exceed 500")
    private int maxWaitlistSize = 50;

    private String impactSummary;

    @NotBlank(message = "Contact person is required")
    private String contactPerson;

    @Email(message = "Invalid contact email format")
    private String contactEmail;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid contact phone format")
    private String contactPhone;

    private boolean isVirtual = false;
    private String virtualMeetingLink;
    private String difficulty = "BEGINNER";

    @PositiveOrZero(message = "Duration hours cannot be negative")
    private int durationHours;

    @AssertTrue(message = "End date must be after start date")
    private boolean isValidDateRange() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
    }

    @AssertTrue(message = "Virtual meeting link is required for virtual events")
    private boolean isValidVirtualEvent() {
        return !isVirtual || (isVirtual && virtualMeetingLink != null && !virtualMeetingLink.trim().isEmpty());
    }
}
