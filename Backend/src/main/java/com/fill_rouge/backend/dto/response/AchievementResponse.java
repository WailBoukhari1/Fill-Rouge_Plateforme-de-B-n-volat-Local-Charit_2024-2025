package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.constant.AchievementType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AchievementResponse {
    private String id;
    private String name;
    private String description;
    private AchievementType type;
    private String iconUrl;
    private String category;
    private Integer points;
    private String difficulty;

    // Achievement Requirements
    private int requiredEvents;
    private int requiredHours;
    private double requiredRating;
    private String prerequisiteAchievementId;
    private boolean isPrerequisiteMet;

    // Achievement Properties
    private boolean isSecret;
    private boolean isSpecial;
    private boolean isStackable;
    private int maxStack;
    private String seasonId;
    private boolean isSeasonalAchievement;
    private String unlockMessage;

    // Achievement Status
    private boolean isActive;
    private boolean isRevoked;
    private String revocationReason;

    // Progress (for volunteer-specific responses)
    private Integer progressPercentage;
    private String progressStatus;
    private LocalDateTime earnedAt;
    private boolean isDisplayed;
    private int currentStack;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
} 