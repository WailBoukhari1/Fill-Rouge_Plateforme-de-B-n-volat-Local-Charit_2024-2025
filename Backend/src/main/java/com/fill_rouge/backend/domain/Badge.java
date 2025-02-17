package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Data
@Document(collection = "badges")
public class Badge {
    @Id
    private String id;

    @NotBlank(message = "Badge name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    @Indexed
    private String name;

    @NotBlank(message = "Badge description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Required points is required")
    @Min(value = 0, message = "Required points cannot be negative")
    private Integer requiredPoints = 0;

    @NotBlank(message = "Criteria is required")
    private String criteria;

    private Boolean isAutoAwarded = false;

    @Min(value = 1, message = "Level must be at least 1")
    @Max(value = 100, message = "Level cannot exceed 100")
    private Integer level = 1;

    private Boolean isActive = true;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime expiresAt;
    private String prerequisiteBadgeId;
    private Integer timesAwarded = 0;
    private String organizationId;
    private Boolean isSecret = false;
    private String unlockMessage;
    private Integer pointsBonus = 0;
    private String rarity = "COMMON";
    private String tier = "BRONZE";
    private Boolean isLimited = false;
    private Integer maxAwards;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    private Boolean isRepeatable = false;
    private Integer cooldownDays;
    private String seasonId;
    private Boolean isSeasonalBadge = false;
    private String badgeGroupId;
    private Integer groupOrder = 0;
    private Boolean isStackable = false;
    private Integer maxStacks = 1;

    public Badge() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isAvailable() {
        LocalDateTime now = LocalDateTime.now();
        return isActive &&
               (availableFrom == null || now.isAfter(availableFrom)) &&
               (availableUntil == null || now.isBefore(availableUntil)) &&
               (expiresAt == null || now.isBefore(expiresAt)) &&
               (!isLimited || timesAwarded < maxAwards);
    }

    public boolean canBeAwarded(Badge prerequisiteBadge) {
        return isAvailable() &&
               (prerequisiteBadgeId == null || 
                (prerequisiteBadge != null && prerequisiteBadge.isAvailable()));
    }

    public void incrementTimesAwarded() {
        this.timesAwarded = (this.timesAwarded != null ? this.timesAwarded : 0) + 1;
    }
} 