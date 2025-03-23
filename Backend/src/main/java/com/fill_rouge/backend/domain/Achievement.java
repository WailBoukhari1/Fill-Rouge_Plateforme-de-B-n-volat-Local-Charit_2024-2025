package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
@Document(collection = "achievements")
public class Achievement {
    @Id
    private String id;

    @NotBlank(message = "Achievement name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    @Indexed
    private String name;

    @NotBlank(message = "Achievement description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;

    @NotNull(message = "Achievement type is required")
    private AchievementType type;

    private String iconUrl;
    private String category;
    private Integer points = 0;
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
    private boolean isPrerequisiteMet = true;

    // Achievement Properties
    private boolean isSecret = false;
    private boolean isSpecial = false;
    private boolean isStackable = false;
    private int maxStack = 1;
    private String seasonId;
    private boolean isSeasonalAchievement = false;
    private String unlockMessage;

    // Achievement Status
    @Builder.Default
    private boolean isActive = true;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private String createdBy;
    private boolean isRevoked = false;
    private String revokedBy;
    private LocalDateTime revokedAt;
    private String revocationReason;

    public boolean isAvailable() {
        return isActive && !isRevoked && 
               (!isSeasonalAchievement || (seasonId != null && !seasonId.isEmpty()));
    }

    public boolean canBeStacked() {
        return isStackable && maxStack > 1;
    }

    public boolean requiresPrerequisite() {
        return prerequisiteAchievementId != null && !prerequisiteAchievementId.isEmpty();
    }

    public void revoke(String revokedBy, String reason) {
        this.isRevoked = true;
        this.revokedBy = revokedBy;
        this.revokedAt = LocalDateTime.now();
        this.revocationReason = reason;
        this.updatedAt = LocalDateTime.now();
    }

    public void activate() {
        this.isActive = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }

    public void setTitle(String title) {
        this.name = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setBadgeImageUrl(String badgeImageUrl) {
        this.iconUrl = badgeImageUrl;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public void setRequiredEvents(int requiredEvents) {
        this.requiredEvents = requiredEvents;
    }

    public void setRequiredHours(int requiredHours) {
        this.requiredHours = requiredHours;
    }

    public void setCategory(String category) {
        this.category = category;
    }
} 