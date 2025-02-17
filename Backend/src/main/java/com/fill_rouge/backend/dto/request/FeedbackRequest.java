package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private double rating;
    
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String comment;
    
    @NotNull(message = "Hours contributed is required")
    @Min(value = 0, message = "Hours contributed cannot be negative")
    @Max(value = 24, message = "Hours contributed cannot exceed 24 hours per day")
    private int hoursContributed;
    
    @Builder.Default
    private boolean isAnonymous = false;
} 