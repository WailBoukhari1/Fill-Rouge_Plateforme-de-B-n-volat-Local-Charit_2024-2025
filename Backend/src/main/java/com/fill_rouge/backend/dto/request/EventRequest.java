package com.fill_rouge.backend.dto.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.fill_rouge.backend.constant.EventCategory;
import com.fill_rouge.backend.constant.EventStatus;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private double[] coordinates;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;

    @Min(value = 1, message = "Minimum participants must be at least 1")
    @Max(value = 100, message = "Maximum participants cannot exceed 100")
    private int maxParticipants;

    @NotNull(message = "Event category is required")
    private EventCategory category;

    @NotBlank(message = "Contact person is required")
    private String contactPerson;

    @Email(message = "Invalid contact email format")
    private String contactEmail;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String contactPhone;

    // Additional fields
    private boolean waitlistEnabled;
    private int maxWaitlistSize;
    private List<String> requiredSkills;
    private boolean virtual;
    private boolean requiresApproval;
    private String difficulty;
    private Set<String> tags;
    private boolean recurring;
    private int minimumAge;
    private boolean requiresBackground;
    private boolean specialEvent;
    private int pointsAwarded;
    private int durationHours;
    private String bannerImage;
    private String organizationId;
    private EventStatus status;

    @AssertTrue(message = "End date must be after start date")
    private boolean isValidDateRange() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
    }
}
