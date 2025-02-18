package com.fill_rouge.backend.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VolunteerAchievementResponse {
    private String id;
    private String volunteerId;
    private String achievementId;

    // Achievement Info
    private String name;
    private String description;
    private String iconUrl;
    private String category;
    private Integer points;
    private String difficulty;

    // Progress Info
    private int progress;
    private String progressDetails;
    private LocalDateTime earnedAt;
    private boolean isDisplayed;
    private int currentStack;

    // Status
    private boolean isActive;
    private boolean isLocked;
    private String lockReason;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 