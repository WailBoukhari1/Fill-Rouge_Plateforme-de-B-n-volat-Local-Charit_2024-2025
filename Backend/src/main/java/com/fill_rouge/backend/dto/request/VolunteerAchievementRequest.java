package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerAchievementRequest {
    @NotNull(message = "Display preference is required")
    private Boolean isDisplayed;

    @Min(value = 1, message = "Stack count must be at least 1")
    @Max(value = 100, message = "Stack count cannot exceed 100")
    private Integer currentStack;

    private String progressDetails;
} 