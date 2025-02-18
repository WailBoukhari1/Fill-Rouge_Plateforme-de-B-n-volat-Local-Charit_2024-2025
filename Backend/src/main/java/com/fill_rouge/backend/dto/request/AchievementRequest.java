package com.fill_rouge.backend.dto.request;

import com.fill_rouge.backend.constant.AchievementType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class AchievementRequest {
    @NotBlank(message = "Achievement name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Achievement description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;

    @NotNull(message = "Achievement type is required")
    private AchievementType type;

    private String iconUrl;
    private String category;
    private Integer points;

    @NotNull(message = "Difficulty level is required")
    private String difficulty = "NORMAL"; // EASY, NORMAL, HARD, EXPERT

    // Achievement Requirements
    @Min(value = 0, message = "Required events cannot be negative")
    private int requiredEvents;

    @Min(value = 0, message = "Required hours cannot be negative")
    private int requiredHours;

    @DecimalMin(value = "0.0", message = "Required rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Required rating cannot exceed 5.0")
    private double requiredRating;

    private String prerequisiteAchievementId;

    // Achievement Properties
    private boolean isSecret;
    private boolean isSpecial;
    private boolean isStackable;
    private int maxStack = 1;
    private String seasonId;
    private boolean isSeasonalAchievement;
    private String unlockMessage;
} 