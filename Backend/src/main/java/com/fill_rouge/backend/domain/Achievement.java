package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Data
@Document(collection = "achievements")
public class Achievement {
    @Id
    private String id;

    @NotBlank(message = "Volunteer ID is required")
    @Indexed
    private String volunteerId;

    @NotBlank(message = "Badge ID is required")
    @Indexed
    private String badgeId;

    @NotNull(message = "Earned date is required")
    private LocalDateTime earnedAt;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Points value is required")
    @PositiveOrZero(message = "Points cannot be negative")
    private Integer points = 0;

    @NotBlank(message = "Category is required")
    private String category;

    private Boolean isPublic = true;
    private LocalDateTime expiresAt;
    private String eventId;
    private String organizationId;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private Boolean isRevoked = false;
    private String revokedBy;
    private LocalDateTime revokedAt;
    private String revocationReason;
    private Boolean isHidden = false;
    private String progressStatus = "COMPLETED";
    private Integer progressValue = 100;
    private String progressDescription;
    private LocalDateTime lastProgressUpdate;
    private Boolean isStackable = false;
    private Integer currentStack = 1;
    private Integer maxStack = 1;
    private String seasonId;
    private Boolean isSeasonalAchievement = false;
    private Integer bonusPoints = 0;
    private String unlockMessage;
    private Boolean isSecret = false;
    private Boolean isDiscovered = true;
    private LocalDateTime discoveredAt;
    private String achievementGroupId;
    private Integer groupOrder = 0;
    private String difficulty = "NORMAL";
    private Integer completionPercentage = 100;
    private String prerequisiteAchievementId;
    private Boolean isPrerequisiteMet = true;

    public Achievement() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.earnedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return !isRevoked && 
               (expiresAt == null || LocalDateTime.now().isBefore(expiresAt));
    }

    public boolean isVisible() {
        return !isHidden && (isPublic || isDiscovered);
    }

    public boolean canProgress() {
        return !isRevoked && 
               progressValue < 100 && 
               (expiresAt == null || LocalDateTime.now().isBefore(expiresAt));
    }

    public boolean canStack() {
        return isStackable && 
               currentStack < maxStack && 
               !isRevoked;
    }

    public void incrementStack() {
        if (canStack()) {
            currentStack++;
            lastProgressUpdate = LocalDateTime.now();
        }
    }

    public void updateProgress(int newValue, String description) {
        if (newValue < 0 || newValue > 100) {
            throw new IllegalArgumentException("Progress value must be between 0 and 100");
        }
        
        this.progressValue = newValue;
        this.progressDescription = description;
        this.lastProgressUpdate = LocalDateTime.now();
        
        if (newValue >= 100) {
            this.progressStatus = "COMPLETED";
            this.completionPercentage = 100;
        } else {
            this.progressStatus = "IN_PROGRESS";
            this.completionPercentage = newValue;
        }
    }

    public void revoke(String revokedBy, String reason) {
        this.isRevoked = true;
        this.revokedBy = revokedBy;
        this.revokedAt = LocalDateTime.now();
        this.revocationReason = reason;
    }

    public void discover() {
        if (!isDiscovered) {
            this.isDiscovered = true;
            this.discoveredAt = LocalDateTime.now();
        }
    }

    public int getTotalPoints() {
        int total = points;
        if (bonusPoints != null) {
            total += bonusPoints;
        }
        if (isStackable && currentStack > 1) {
            total *= currentStack;
        }
        return total;
    }
} 