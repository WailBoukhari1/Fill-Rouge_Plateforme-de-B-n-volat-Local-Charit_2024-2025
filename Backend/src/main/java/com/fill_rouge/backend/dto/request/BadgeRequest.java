package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeRequest {
    @NotBlank(message = "Badge name is required")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Required points value is required")
    @Min(value = 0, message = "Required points cannot be negative")
    private Integer requiredPoints = 0;

    @NotBlank(message = "Criteria is required")
    private String criteria;

    private Boolean isAutoAwarded = false;

    @Min(value = 1, message = "Level must be at least 1")
    @Max(value = 100, message = "Level cannot exceed 100")
    private Integer level = 1;

    private Boolean isActive = true;
    private String prerequisiteBadgeId;
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
    private String organizationId;

    @AssertTrue(message = "Available until must be after available from")
    private boolean isValidDateRange() {
        if (availableFrom == null || availableUntil == null) return true;
        return !availableUntil.isBefore(availableFrom);
    }

    @AssertTrue(message = "Max awards must be specified for limited badges")
    private boolean isValidLimitedBadge() {
        if (Boolean.TRUE.equals(isLimited)) {
            return maxAwards != null && maxAwards > 0;
        }
        return true;
    }

    @AssertTrue(message = "Max stacks must be greater than 1 for stackable badges")
    private boolean isValidStackableBadge() {
        if (Boolean.TRUE.equals(isStackable)) {
            return maxStacks != null && maxStacks > 1;
        }
        return true;
    }

    @AssertTrue(message = "Cooldown days must be specified for repeatable badges")
    private boolean isValidRepeatableBadge() {
        if (Boolean.TRUE.equals(isRepeatable)) {
            return cooldownDays != null && cooldownDays > 0;
        }
        return true;
    }
} 