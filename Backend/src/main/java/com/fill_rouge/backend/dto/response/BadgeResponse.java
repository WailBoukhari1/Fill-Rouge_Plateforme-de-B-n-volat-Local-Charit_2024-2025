package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.Badge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BadgeResponse {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    private String category;
    private int requiredPoints;
    private String criteria;
    
    @Builder.Default
    private boolean isAutoAwarded = false;
    
    private int level;
    
    @Builder.Default
    private boolean isActive = true;
    
    private LocalDateTime earnedAt;
    private int progress;
    
    @Builder.Default
    private boolean isLocked = true;
    
    private int totalAwardedCount;
    private String rarity;
    
    @Builder.Default
    private boolean isSecret = false;
    
    private LocalDateTime lastUpdated;
    private String tier;
    private Integer pointsBonus;
    private String prerequisiteBadgeId;
    private Integer maxAwards;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    private boolean isRepeatable;
    private Integer cooldownDays;
    private String seasonId;
    private boolean isSeasonalBadge;
    private String badgeGroupId;
    private Integer groupOrder;
    private boolean isStackable;
    private Integer maxStacks;
    private String organizationId;

    public static BadgeResponse fromBadge(Badge badge, int currentProgress, boolean hasEarned) {
        if (badge == null) {
            return null;
        }

        BadgeResponseBuilder builder = BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .imageUrl(badge.getImageUrl())
                .category(badge.getCategory())
                .requiredPoints(badge.getRequiredPoints())
                .criteria(badge.getCriteria())
                .isAutoAwarded(badge.getIsAutoAwarded())
                .level(badge.getLevel())
                .isActive(badge.getIsActive())
                .progress(hasEarned ? 100 : currentProgress)
                .isLocked(!hasEarned)
                .totalAwardedCount(badge.getTimesAwarded())
                .isSecret(badge.getIsSecret())
                .lastUpdated(badge.getUpdatedAt())
                .tier(badge.getTier())
                .pointsBonus(badge.getPointsBonus())
                .prerequisiteBadgeId(badge.getPrerequisiteBadgeId())
                .maxAwards(badge.getMaxAwards())
                .availableFrom(badge.getAvailableFrom())
                .availableUntil(badge.getAvailableUntil())
                .isRepeatable(badge.getIsRepeatable())
                .cooldownDays(badge.getCooldownDays())
                .seasonId(badge.getSeasonId())
                .isSeasonalBadge(badge.getIsSeasonalBadge())
                .badgeGroupId(badge.getBadgeGroupId())
                .groupOrder(badge.getGroupOrder())
                .isStackable(badge.getIsStackable())
                .maxStacks(badge.getMaxStacks())
                .organizationId(badge.getOrganizationId());

        // Calculate rarity based on times awarded
        String calculatedRarity;
        if (badge.getTimesAwarded() < 10) {
            calculatedRarity = "LEGENDARY";
        } else if (badge.getTimesAwarded() < 50) {
            calculatedRarity = "RARE";
        } else if (badge.getTimesAwarded() < 200) {
            calculatedRarity = "UNCOMMON";
        } else {
            calculatedRarity = "COMMON";
        }
        builder.rarity(calculatedRarity);

        if (hasEarned) {
            builder.earnedAt(LocalDateTime.now());
        }

        return builder.build();
    }

    public boolean isAvailable() {
        LocalDateTime now = LocalDateTime.now();
        return isActive &&
               (availableFrom == null || now.isAfter(availableFrom)) &&
               (availableUntil == null || now.isBefore(availableUntil));
    }

    public boolean canBeEarned() {
        return isAvailable() && 
               (!isLocked) && 
               (maxAwards == null || totalAwardedCount < maxAwards);
    }
} 